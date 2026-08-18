---
title: "Running a big LLM across multiple GPUs with vLLM"
seoTitle: "Running a big LLM across multiple GPUs with vLLM"
seoDescription: "A plain-English guide to serving a model that is too big for one GPU: how tensor, pipeline, and expert parallelism split it up, what every vLLM flag does, and measured numbers from a 235B model on four RTX PRO 6000 cards."
datePublished: 2026-08-18T10:00:00.000Z
slug: running-a-big-llm-across-multiple-gpus-with-vllm
author: shubham-katara
authors: ["shubham-katara", "saiyam-pathak"]
cover: /img/blog/running-a-big-llm-across-multiple-gpus-with-vllm/cover.png
tags: ["vllm", "gpu", "nvidia", "llm", "platform-engineering"]
---

Sooner or later everyone running models locally hits the same wall. You find a model you want, you look at the download size, and it is bigger than the GPU you own. A 235B model needs roughly 236 GB just for its weights. The card we have holds 96 GB, and even the largest data-centre GPUs available today top out well below 236 GB. So the model does not fit, and no amount of clever flags will make 236 GB squeeze into 96 GB.

The answer is to use more than one GPU. That part everybody knows. The part that is genuinely confusing is what "use more than one GPU" actually means. Does each GPU get a copy of the model? Does the model get cut in half? Do the GPUs take turns? Which of those is happening, and what does it cost you?

Let's answer that properly, with a real model on real hardware, and let's explain every single flag and command along the way rather than pasting a magic incantation and moving on.

## What you will learn

- How to download a 236 GB model, what the 24 files you get actually are, and how they sit on disk
- How to work out on paper whether it fits on your GPUs, before you spend an hour downloading it
- What inference really is: the two completely different phases behind "time to first token" and "tokens per second"
- The three different ways a model can be split across GPUs, in plain English, and when each is used
- What every flag in our vLLM command does, and why it has the value it has
- How to read the startup log, which tells you more than any tutorial can
- The rules that limit how far you can split, and the real errors you get when you break them
- Measured numbers for all three splitting modes on the same model and the same four GPUs

No prior knowledge of distributed computing is assumed. If you know what a GPU is and you have run a model locally once, you are qualified.

## The machine and the model

Here is what we tested on, because numbers mean nothing without the hardware attached.

**The machine:** a server with 8x NVIDIA RTX PRO 6000 Blackwell Server Edition cards. Each card has 96 GB of memory, and the machine reports 95.01 GiB of that as usable. We borrowed 4 of the 8 cards for this work.

One detail that matters more than it looks: these GPUs are **not** connected by NVLink. NVLink is NVIDIA's fast direct GPU-to-GPU cable. Without it, GPUs talk to each other over PCIe and through the CPU, which is slower. You can check what you have with one command:

```bash
nvidia-smi topo -m
```

On our machine every pair of GPUs reports `SYS`, which means the traffic goes across PCIe and then across the link between the CPU sockets. If you had NVLink you would see `NV1`, `NV2` and so on instead. Keep this in mind, because it changes which splitting method is fastest.

**The model:** `Qwen/Qwen3-235B-A22B-Instruct-2507-FP8`. Let's unpack that name, because it is doing a lot of work:

- **235B** is the total parameter count, 235 billion.
- **A22B** means 22 billion **active** parameters. This is a mixture-of-experts model, and only a fraction of it runs for any given token. More on this shortly, because it is the most interesting thing about serving big models today.
- **FP8** is the number format the weights are stored in, 8 bits each, so one byte per parameter.

**The software:** vLLM 0.27.1 running in the official container, with PyTorch 2.13.0 and CUDA 13.0, on driver 610.43.02.

## Part 1: Getting the model onto the machine

Before anything can be split across GPUs it has to be on the disk, and with a model this size that step is not a formality. It is the step that bit us hardest, so let's do it properly.

You download it with the Hugging Face CLI:

```bash
pip install huggingface_hub hf_transfer

HF_HUB_ENABLE_HF_TRANSFER=1 hf download Qwen/Qwen3-235B-A22B-Instruct-2507-FP8
```

`HF_HUB_ENABLE_HF_TRANSFER=1` switches on a Rust downloader that parallelises across connections. On a 236 GB download that is the difference between an hour and most of an afternoon, so it is worth the extra package.

### What you actually get

The download is not one giant file. It arrives as **24 shards**, plus the small text files that describe the model:

```
config.json
generation_config.json
model-00001-of-00024.safetensors
model-00002-of-00024.safetensors
...
model-00024-of-00024.safetensors
model.safetensors.index.json
tokenizer.json
```

A few things worth understanding here:

- **`.safetensors`** is the modern format for weights. It is a flat file with a small JSON header at the front listing every tensor's name, dtype, shape and byte range, then the raw bytes. That layout matters for us, because it means a loader can memory-map the file and read exactly the byte ranges it wants without parsing the whole thing, and without the security problems of the old pickle-based `.bin` format.
- **`model.safetensors.index.json`** is the map that says which tensor lives in which shard. This is how vLLM knows to open shard 17 to find layer 62's weights.
- **`config.json`** is the architecture file we keep coming back to: layer count, head counts, expert count. It is a few kilobytes and it determines almost every decision in this post.
- For an FP8 model like this one, the weight tensors are joined by **scale tensors**. FP8 has very little numeric range, so the checkpoint stores a scaling factor per 128x128 block of each weight matrix, and the real value is the 8-bit number multiplied by its block's scale. You can see that arrangement declared in `config.json`:

```json
"quantization_config": {
  "quant_method": "fp8",
  "fmt": "e4m3",
  "weight_block_size": [128, 128],
  "activation_scheme": "dynamic"
}
```

Remember those block scales. They are the reason for the most annoying crash we hit, back in Part 12.

### Where it gets stored

By default everything lands under `~/.cache/huggingface/hub`, in a layout that looks strange the first time you see it:

```
~/.cache/huggingface/hub/models--Qwen--Qwen3-235B-A22B-Instruct-2507-FP8/
├── blobs/          <- the real files, named by hash
├── refs/           <- which commit "main" points at
└── snapshots/
    └── e156cb4e.../  <- symlinks with friendly names, pointing into blobs/
```

The content lives once in `blobs/` under its hash, and `snapshots/` holds human-readable symlinks into it. That is why pulling two revisions of a model does not always double your disk usage, and it is also why `du` and `df` can disagree with your intuition.

The practical consequence for serving: mount that whole directory into your container and set `HF_HOME` to it, which is exactly what the `-v` and `-e HF_HOME` flags in Part 8 are doing. Otherwise the container downloads its own copy.

### The disk trap, which is a real production hazard

Two things about disk that the model card will not tell you.

**Each tensor-parallel worker reads the entire checkpoint.** vLLM's own docs say that with tensor parallelism "each process will read the whole model and split it into chunks". So at `-tp 4` the machine performs roughly 4 x 221 GiB of reads at startup, not 221 GiB divided four ways. That is why a big model takes minutes to load even off fast storage, and it is why our first `Model loading took` line reported 45 seconds only because a lot of the file was still in the operating system's page cache from the download.

**On a shared machine, filling the disk can take down everything else on it.** This is the part we learned the hard way, and it is worth more than a footnote. Our test box also runs a Kubernetes inference platform. Kubernetes treats free disk as a managed resource called ephemeral-storage, and when free space fell below its eviction threshold, the kubelet did exactly what it is designed to do: it evicted pods to reclaim space, tainted the node so nothing new could schedule, and garbage-collected container images. Several of those images had been built locally and existed in no registry, so they could not simply be pulled again.

Nothing about that is a Kubernetes bug, and nothing about it is specific to our setup. The lesson generalises: **before you download a quarter of a terabyte onto a machine, check what else lives on that disk and what will happen when it fills.** `df -h` before you start, and know your platform's eviction threshold, which is often far higher than "0 bytes free". If the machine is shared, keeping a couple of hundred gigabytes of headroom is not paranoia.

## Part 2: Why one GPU is not enough

Let's do the arithmetic, because it is simpler than people expect and it saves you a lot of wasted download time.

A model is mostly a big pile of numbers called **parameters** or **weights**. To run the model, those numbers have to sit in GPU memory. So the first question is always: how many bytes is one parameter?

| Format | Bits per parameter | Bytes per parameter |
| --- | --- | --- |
| FP32 | 32 | 4 |
| BF16 or FP16 | 16 | 2 |
| FP8 | 8 | 1 |
| FP4 or NVFP4 | 4 | 0.5 |

So the weights alone take `number of parameters x bytes per parameter`. For our model that is 235 billion parameters at 1 byte each, which is about 236 GB. Our GPU holds 95.01 GiB. The model is roughly 2.3 times too big for one card.

But weights are only the first of **three** things that need to fit. This is where most people's mental model is incomplete:

1. **The weights.** Fixed size. You know it before you start.
2. **The KV cache.** This is the model's memory of the conversation so far. Every token you feed in, and every token the model writes, leaves behind a small record that has to be kept for as long as that request is alive. It grows with how long your prompts are and how many users you serve at once.
3. **Working space.** Temporary scratch memory for the actual calculations, plus some overhead the framework reserves for itself.

The KV cache is the one that surprises people, so let's size it. The formula looks intimidating but every term is just a number from the model's config file:

```
bytes per token = 2 x layers x kv_heads x head_dim x bytes_per_number
```

The `2` is because you store two things per token, a key and a value, which is where "KV" comes from. For our model, `layers` is 94, `kv_heads` is 4, `head_dim` is 128, and the cache is kept in BF16 so that is 2 bytes:

```
2 x 94 x 4 x 128 x 2 = 192,512 bytes = 188 KiB per token
```

188 KiB does not sound like much. But this model supports a 262,144 token context, so one single conversation at full length would need `262,144 x 188 KiB`, which is about **47 GiB**. That is half a GPU for one user. Serving ten users at once with long prompts is where all your leftover memory goes, and it is why "the weights fit, so I am fine" is wrong.

{{multi-gpu-memory-fit-animation}}

## Part 3: What actually happens when a request arrives

Before splitting anything, it helps to know what the work being split actually is, because inference is really two different jobs wearing one coat. Almost everything confusing about multi-GPU performance comes from this split.

### Phase one: prefill, reading your prompt

When your prompt arrives, the model has to read all of it. If you send 1,000 tokens, all 1,000 go through every layer **at once**, as one big batch of work. This is called **prefill**, and it is the phase that decides your time to first token.

Prefill is *compute-heavy*. There is a lot of arithmetic to do and the GPU's matrix engines are the bottleneck. It also produces the keys and values for every one of those 1,000 tokens, which get written into the KV cache and kept.

### Phase two: decode, writing the answer

Then the model writes its reply, and here is the part that surprises people: **it can only produce one token at a time.** To write token 2 it needs to have written token 1, because it feeds its own output back in. There is no way around that, it is what "autoregressive" means.

So decode is a loop. Each pass through it produces exactly one token, reads the entire KV cache built so far, and appends one more entry to that cache.

Decode is *memory-heavy* rather than compute-heavy. For a single token there is barely any arithmetic to do, but the GPU still has to stream the relevant weights and the whole KV cache past its compute units. The bottleneck is memory bandwidth, not maths. That is why decode speed tracks memory bandwidth so closely, and why giving a single request more GPUs to read from in parallel actually helps.

Two phases, two different bottlenecks, and they respond differently to everything you tune:

| | Prefill | Decode |
| --- | --- | --- |
| Work per step | your whole prompt at once | exactly one token |
| Bottleneck | compute | memory bandwidth |
| Metric it drives | time to first token | time per output token |
| Data moved between GPUs | large, whole prompt's worth | tiny, one token's worth |

That last row is the one to hold on to. It is the reason, later, that pipeline parallelism wins on first-token latency while tensor parallelism wins on tokens per second. The same all-reduce that is trivially cheap during decode is expensive during prefill, because it is carrying a thousand times more data.

### How the server juggles many users

A real server is not doing one request at a time. vLLM uses **continuous batching**, which means it does not wait for a batch to fill up or finish. On every step it looks at everything currently in flight and assembles whatever work is ready, so a request that arrives mid-flight joins the very next step rather than queueing behind a whole batch.

Two consequences worth knowing:

- **Prefill and decode get mixed together.** A step might carry one user's fresh 1,000-token prompt alongside twenty other users' single decode tokens. That mixing is why a burst of long prompts makes everyone else's tokens arrive more slowly, and it is why `--max-num-batched-tokens` exists as a lever.
- **Capacity is set by the KV cache, not by CPU or queue length.** Every in-flight request is holding cache proportional to its length. When the cache is full, vLLM has to **preempt** somebody: it evicts a request's cache and recomputes it later. That is the real meaning of the `Maximum concurrency` line in the startup log, and it is why we spend so much of this post counting cache bytes.

Now that the work itself is clear, let's look at the three ways to spread it over more than one GPU.

## Part 4: The three ways to split a model

Here is the heart of it. When people say "split the model across GPUs" they could mean three genuinely different things, and mixing them up is the source of most confusion.

An analogy first, because it makes the rest much easier to hold in your head. Imagine a large restaurant kitchen that has to produce one dish:

- **Tensor parallelism** is four chefs all working on the same dish at the same time, one chopping, one on sauce, one on protein, one plating. They constantly have to coordinate, but the dish is done fast.
- **Pipeline parallelism** is four chefs at four stations, where the dish moves down the line. Station two cannot start until station one is finished. Very little talking, but three chefs are idle at any moment unless you have several dishes in flight.
- **Expert parallelism** is a kitchen with 128 specialist chefs where each dish only needs 8 of them. You spread those 128 chefs across four rooms, and each dish gets walked to whichever rooms hold the specialists it needs.

{{multi-gpu-split-modes-animation}}

All three can be combined, and in production they usually are. Now let's look at each one properly.

## Part 5: Tensor parallelism, up close

Tensor parallelism cuts **inside** every layer. This is the important distinction: it does not give GPU 0 the first half of the model and GPU 1 the second half. Every GPU holds a thin slice of **all 94 layers**.

How can you cut a layer? Because the work a layer does is mostly one big multiplication table, and multiplication tables can be cut up. The technique comes from a 2019 NVIDIA paper called Megatron-LM, and it works in two moves.

**Move one, cut the first matrix into vertical strips.** Each GPU takes some of the columns. Because each GPU has complete columns, it can finish its part, including the activation function in the middle, without asking anyone anything. In our model the attention block has 64 heads, so with 4 GPUs each one owns 16 whole heads and computes them start to finish alone.

**Move two, cut the second matrix into horizontal strips.** These line up exactly with the vertical cuts from move one. Each GPU multiplies its slice and gets a **partial answer**, a quarter of the real result.

Now, and only now, the GPUs have to talk. They add their four partial answers together so that everyone ends up with the complete result. That single operation is called an **all-reduce**: everyone contributes a piece, everyone gets the total back.

The Megatron paper puts the cost plainly, saying this design lets you run a transformer layer "using only two all-reduces in the forward path". Generating text only uses the forward path, so:

- 2 all-reduces per layer
- 94 layers
- **188 all-reduces to produce one single token**

And they happen strictly one after another, because layer 5 cannot begin until layer 4 has finished comparing notes.

{{multi-gpu-tensor-split-animation}}

### The KV cache gets divided too, which is a bonus

Because each GPU owns only some of the attention heads, it only needs to remember keys and values for its own heads. So the KV cache is divided across GPUs rather than duplicated. Four GPUs give you roughly four times the room for conversations, on top of making the weights fit. This is a real and often unmentioned benefit of tensor parallelism.

## Part 6: The expert part, which is why this model is only 22B of work

Our model is a **mixture of experts**, and this is the single biggest idea in how large models are served today, so it is worth slowing down for.

In an ordinary model, every parameter is used for every token. In a mixture-of-experts model, each layer contains many small networks called **experts**, and a tiny component called a **router** decides which few of them each token should visit. Our model has **128 experts per layer** and the router picks **8** of them per token.

So the model holds 235B parameters in memory, but only about 22B of them do any arithmetic for a given token. That is what "235B-A22B" means, and it is why this model runs far faster than its size suggests. You pay for the full 235B in memory and you pay for only 22B in speed.

{{moe-expert-routing-animation}}

This gives you a third way to split. Instead of slicing every expert into strips, you hand out whole experts: with 128 experts and 4 GPUs, each GPU keeps 32 of them intact. That is **expert parallelism**, and in vLLM you switch it on with `--enable-expert-parallel`.

The trade is different from tensor parallelism. Nothing needs adding up at the end, but tokens have to travel to whichever GPU owns the expert they were routed to, and the answers travel back. It also has a fairness problem: the router does not promise to spread work evenly, so one GPU can end up with more popular experts and become the slow one holding everybody up.

## Part 7: Every flag, explained

Before the command, the vocabulary. Here is every flag we use and why it has the value it has. If you only remember one thing from this post, make it this table.

| Flag | What it does | Why our value |
| --- | --- | --- |
| `--tensor-parallel-size 4` | How many GPUs to slice each layer across. Often shortened to `-tp`. | 236 GB of weights needs at least 3 cards of 95 GiB, and 4 divides the model's head counts cleanly. |
| `--pipeline-parallel-size 1` | How many groups to cut the layer stack into. Often `-pp`. | 1 means off. We test a version with 2 later. |
| `--enable-expert-parallel` | Hand out whole experts per GPU instead of slicing every expert. Mixture-of-experts models only. | Tested both ways, since this is exactly the choice a big MoE forces on you. |
| `--gpu-memory-utilization 0.90` | The fraction of each GPU's memory vLLM is allowed to claim, for weights plus KV cache plus working space. | 0.90 leaves a little headroom. Push it to 0.95 for more cache, but leave room or startup fails. |
| `--max-model-len 32768` | The longest single request, prompt plus reply, in tokens. | The model supports 262,144, but that would eat 47 GiB of cache for one user. 32,768 is a sane serving value. |
| `--max-num-seqs 32` | How many requests may be in flight at once. | Caps how much KV cache can be demanded simultaneously. Lower it if you see requests being preempted. |
| `--served-model-name qwen3-235b` | The name clients use in the API. | Otherwise clients must send the full checkpoint path. |
| `--port 8000` | Port for the OpenAI-compatible API. | Convention. |
| `--distributed-executor-backend mp` | How the GPU worker processes are managed: `mp` for plain Python multiprocessing, `ray` for a Ray cluster. | All 4 GPUs are in one machine, so `mp` is the simpler choice. `ray` is for multiple machines. |
| `--enforce-eager` | Skips building optimised CUDA graphs at startup. | We do **not** use it. It saves memory and starts faster, but generation is slower. Reach for it only if you are out of memory. |
| `--kv-cache-dtype fp8` | Stores the conversation cache at 8 bits instead of 16, roughly halving cache memory. | We left it at the default so our cache numbers are easy to check by hand. It is a good lever if you need more concurrency. |

Two container flags matter just as much, and neither is a vLLM flag:

| Docker flag | Why you need it |
| --- | --- |
| `--ipc=host` | The GPU workers are separate processes that pass data through shared memory. Docker's default 64 MB of shared memory is far too small, and leaving this out gives you a confusing hang at startup. |
| `--gpus '"device=1,4,5,6"'` | Hands specific GPUs to the container. The nested quoting is fussy but required. Inside the container they are renumbered 0 to 3. |

## Part 8: The command, line by line

Here is the whole thing. Every line is explained above, and we will walk the structure below it.

```bash
docker run -d --name vllm-tp4 \
  --gpus '"device=1,4,5,6"' \
  --ipc=host \
  -p 8000:8000 \
  -v /root/.cache/huggingface:/root/.cache/huggingface \
  -e HF_HUB_OFFLINE=1 \
  -e HF_HOME=/root/.cache/huggingface \
  -e VLLM_USE_DEEP_GEMM=0 \
  vllm/vllm-openai:latest \
    Qwen/Qwen3-235B-A22B-Instruct-2507-FP8 \
    --served-model-name qwen3-235b \
    --tensor-parallel-size 4 \
    --gpu-memory-utilization 0.90 \
    --max-model-len 32768 \
    --max-num-seqs 32 \
    --port 8000
```

Reading it top to bottom:

- `docker run -d` starts the container in the background and prints its id. Drop the `-d` if you would rather watch the logs scroll past.
- `--name vllm-tp4` gives it a name so you can say `docker logs vllm-tp4` instead of copying an id.
- `-p 8000:8000` maps the container's port 8000 to the host's port 8000, so you can reach the API from outside.
- `-v /root/.cache/huggingface:/root/.cache/huggingface` shares your downloaded models with the container. Without it the container would download all 236 GB again.
- `-e HF_HUB_OFFLINE=1` tells the Hugging Face library not to phone home. It uses the local copy, which also means startup does not fail if the network is down.
- `vllm/vllm-openai:latest` is the image. Everything after it is passed to vLLM, because the image's entrypoint is already `vllm serve`.
- The first argument after the image is the model. Everything after that is a vLLM flag from the table above.
- `-e VLLM_USE_DEEP_GEMM=0` is here because without it this exact model would not start on these exact GPUs. It is not a general recommendation, and Part 12 explains the crash it avoids. If you are on different hardware, try without it first.

One thing worth knowing about that entrypoint: because it is already `vllm serve`, running `docker run ... vllm/vllm-openai:latest python3 -c "..."` does **not** work the way you expect. Your Python gets handed to `vllm serve` as arguments and you get a confusing parse error. To run something else inside the image, override it:

```bash
docker run --rm --gpus '"device=1,4"' --entrypoint python3 vllm/vllm-openai:latest -c "
import torch
print('GPUs visible:', torch.cuda.device_count())
print('can GPU 0 talk to GPU 1 directly:', torch.cuda.can_device_access_peer(0, 1))
"
```

That is a genuinely useful sanity check before you start a long model load, because it confirms the container can see the cards and that direct GPU-to-GPU access is available.

## Part 9: How to read the startup log

The startup log is the best teaching tool in the whole stack, and almost nobody reads it. Four lines tell you everything about whether your configuration is sensible.

**Line one, how big the weights are per GPU.** You get one of these per worker:

```
(Worker_TP0) Model loading took X GiB
```

If you divide the full model size by your `--tensor-parallel-size` and get roughly this number, the split worked. If this number equals the **whole** model, something is wrong and you are not actually splitting.

**Line two, what is left for conversations:**

```
Available KV cache memory: X GiB
```

If this is **negative**, your weights plus overhead already exceeded the budget, and vLLM will refuse to start. That is the clearest possible signal that you need more GPUs, a smaller number format, or a lower `--max-model-len`.

**Line three, the cache in tokens:**

```
GPU KV cache size: N tokens
```

This is the total number of tokens the server can remember across all users at once. You can predict it: take the available cache memory, divide by the bytes-per-token figure we calculated in Part 2.

**Line four, how many users that really means:**

```
Maximum concurrency for 32,768 tokens per request: N.NNx
```

This is the one to show your capacity planner. If it says `2.05x`, then two users can each have a full-length 32k conversation, and a third will have to wait or be preempted. It is simply the previous line divided by `--max-model-len`.

## Part 10: The rules that limit how far you can split

You cannot pick any number for `--tensor-parallel-size`. There are hard divisibility rules, and hitting them is a common early frustration.

Because attention heads are handed out whole, **your tensor parallel size must divide the head counts**. Open the model's `config.json` and look:

```json
{
  "num_hidden_layers": 94,
  "hidden_size": 4096,
  "num_attention_heads": 64,
  "num_key_value_heads": 4,
  "head_dim": 128,
  "num_experts": 128,
  "num_experts_per_tok": 8
}
```

For our model:

- `num_attention_heads` is 64, so 2, 4, 8, 16 all divide it cleanly.
- `num_key_value_heads` is **4**. This is the binding constraint. At `-tp 4` each GPU gets exactly one key/value head. At `-tp 8` there are not enough to go around, and vLLM has to duplicate them across GPUs, which wastes memory and gives you less benefit than you would hope.
- `num_experts` is 128, which divides evenly by 4 and by 8, so expert parallelism has more freedom than tensor parallelism here.

That is the real lesson: **the KV head count, not the parameter count, usually decides how wide you can go.** It is the first thing we check on any new model, and it takes ten seconds.

## Part 11: What we measured

Once it was running, we compared all three ways of splitting the same model over the same 4 GPUs: tensor parallelism on its own, tensor parallelism plus expert parallelism, and pure pipeline parallelism. Same hardware, same flags otherwise, same benchmark.

The benchmark is vLLM's own, 1024 tokens in and 256 tokens out per request, with `--ignore-eos` so every request generates exactly 256 tokens and the comparison is fair:

```bash
docker exec vllm-tp4 vllm bench serve \
  --model Qwen/Qwen3-235B-A22B-Instruct-2507-FP8 \
  --served-model-name qwen3-235b \
  --base-url http://localhost:8000 \
  --dataset-name random --random-input-len 1024 --random-output-len 256 \
  --max-concurrency 1 --num-prompts 12 --seed 42 --ignore-eos
```

and then again with 32 requests in flight, which is the same command with two numbers changed:

```bash
  --max-concurrency 32 --num-prompts 128
```

We ran both for every setup, because a single request at a time and 32 at a time behave completely differently, and a configuration that wins one can lose the other.

### The memory side

| | TP=4 | TP=4 plus EP | PP=4 |
| --- | --- | --- | --- |
| Weights per GPU | 55.19 GiB | 55.19 GiB | 55.70 GiB |
| KV cache per GPU | 27.85 GiB | 27.96 GiB | 26.84 GiB |
| Total KV cache | 621,392 tokens | **623,696 tokens** | 555,680 tokens |
| Max concurrency at 32k | 18.96x | **19.03x** | 16.96x |
| GPU memory used | 88,211 MiB on all 4 | 88,209 MiB on all 4 | 84,283 / 87,899 / 87,899 / 84,507 |

Two things to pull out of that table.

**Expert parallelism did not save memory.** It moved 0.37% of extra room into the cache, which is noise. If you were hoping expert parallelism would let you fit a model that otherwise does not fit, this is your warning that it will not.

**Pipeline parallelism cost us 11.8% of the cache**, dropping from 621,392 tokens to 555,680, because a pipeline needs extra buffers for the activations travelling between stages, and that comes straight out of your conversation capacity.

Look at the last row too. Under tensor parallelism all four cards sat at **exactly 88,211 MiB**, the same number on every one of them. Under pipeline parallelism they ranged from 84,283 to 87,899 MiB, about 3.6 GB apart, because a layer split cannot be perfectly even when 94 layers go over 4 GPUs and the ends of the model are not symmetric: the first stage carries the token embedding and the last carries the output head. That evenness check is the quickest sanity test you have that a tensor-parallel split is behaving.

### The speed side

| Measurement | TP=4 | TP=4 plus EP | PP=4 | Winner |
| --- | --- | --- | --- | --- |
| Median time per token, 1 request | **17.14 ms** | 18.83 ms | 21.19 ms | TP |
| Output tokens/sec, 32 requests | **503.68** | 470.93 | 296.48 | TP, by 70% over PP |
| Median time to first token, 32 requests | 3,233 ms | 3,705 ms | **2,735 ms** | PP, by 15% |
| Benchmark duration, 32 requests | **65.06 s** | 69.58 s | 110.52 s | TP |

Tensor parallelism won nearly everything, and the size of one gap deserves attention: at 32 concurrent requests it produced **70% more tokens per second than pipeline parallelism**. That is not a rounding error, that is a different class of performance, and it lines up exactly with the theory from Part 4. Tensor parallelism has all four GPUs working on every token. Pipeline parallelism has each GPU working on a different request's stage, and with only 32 requests spread over 4 stages there is not enough in flight to keep everyone busy, so cards sit idle waiting for their turn. Its median time per token was 24% worse for the same reason.

**Pipeline parallelism did win one thing, and it is the one theory predicts:** time to first token, by 15%. Processing your 1024-token prompt is where tensor parallelism's chatter gets expensive, because each of those 188 all-reduces is carrying the whole prompt's worth of data rather than a single token's. Pipeline parallelism just hands one activation tensor to the next stage and skips all of it. If your users judge you on how fast the first word appears, that is a real and measurable advantage.

That is not a knock on expert parallelism, and it is important not to over-read it. Expert parallelism exists to solve a problem we do not have here: models so large that even a tensor-parallel split cannot hold all the experts, and clusters big enough that duplicating experts everywhere would be wasteful. With 4 GPUs and a model that already fits, we are asking it to do a job it was not designed for, and paying an extra network hop per token for nothing. On a 32 or 64 GPU deployment of a trillion-parameter model the answer would very likely flip.

### The number we are throwing away, and why

Being straight about this because it is a good lesson in reading your own benchmarks. The very first expert-parallel run at one-request-at-a-time reported **28.71 output tokens per second**, which would have made expert parallelism look catastrophic. It was not real. Look at the two TTFT figures from that run:

```
Mean TTFT (ms):    3987.38
Median TTFT (ms):   265.56
```

A mean fifteen times the median means one request behaved completely differently from the other eleven. One request stalled for about 45 seconds, almost certainly a one-off kernel compilation on the first pass through a code path, and that single stall stretched the whole benchmark from 63 seconds to 107 seconds. Since throughput is just tokens divided by wall-clock, one stall wrecked the headline number.

This is why the table above uses **median time per token** as the decode measurement rather than aggregate throughput. Median per-token latency does not care that one request had a bad start.

One more benchmarking trap while we are here. When we re-ran that same benchmark on the warm server, time to first token dropped from 265 ms to **61 ms**, which looks like a wonderful improvement and is actually meaningless: vLLM caches prompt prefixes by default, and we had just sent it those exact prompts with the same `--seed 42`. If you are comparing configurations, either vary the seed or turn prefix caching off, otherwise your second measurement is mostly measuring your cache.

### What we would actually run

For a 235B MoE on 4 GPUs with no NVLink between them, we would use plain `--tensor-parallel-size 4` and leave both of the others off. It was faster nearly everywhere, it gives the most conversation capacity, it splits memory perfectly evenly, and it is one less thing to reason about.

We would reach for the other two in specific situations, not as general upgrades:

- **Pipeline parallelism** if time to first token is the metric you are judged on, or if you are spanning multiple machines where the network between them is genuinely slow. It was 15% better at first-token latency and it barely uses the interconnect.
- **Expert parallelism** when the model is so large that even a tensor-parallel split cannot hold all the experts, which is a real problem at trillion-parameter scale and simply is not our problem at 235B on 4 cards. Here it cost 7% and returned nothing.


## Part 12: Errors you will actually hit

Every one of these is a real message we collected while doing this, not a hypothetical.

### "must be divisible by tensor parallel size"

We asked for 3 GPUs, which is a perfectly reasonable-sounding thing to want, and got:

```
pydantic_core._pydantic_core.ValidationError: 1 validation error for VllmConfig
  Value error, Total number of attention heads (64) must be divisible by tensor
  parallel size (3).
```

**What it means:** the rule from Part 10. 64 heads cannot be shared out evenly among 3 GPUs. Good news, it fails in about a second, before loading a single byte of weights.

**The fix:** pick a `--tensor-parallel-size` that divides your head count. Powers of two are the safe habit.

### "Failed to load model - not enough GPU memory"

Then we tried 2 GPUs, which puts about 110 GiB of weights on a 95 GiB card. It got most of the way through loading and then died:

```
ERROR [gpu_model_runner.py:5403] Failed to load model - not enough GPU memory.
Try lowering --gpu-memory-utilization to free memory for weights, increasing
--tensor-parallel-size, or using --quantization.
(original error: CUDA out of memory. Tried to allocate 768.00 MiB. GPU 0 has a
total capacity of 95.01 GiB of which 438.31 MiB is free. Including non-PyTorch
memory, this process has 94.57 GiB memory in use.)
```

**What it means:** exactly what it says. The weights for half this model do not fit on one of these cards. Note the useful detail in there, `438.31 MiB is free` out of `95.01 GiB`, so it filled the card almost exactly and then had nowhere to put the next 768 MiB chunk.

**The fix:** vLLM lists the three real options itself, and for our case only one of them helps. Lowering `--gpu-memory-utilization` would make things worse, not better, because it reduces the space available for weights. Quantizing further would work but changes the model. So the answer is more GPUs, which is the whole point of this post.

Worth knowing: this one is slow to fail, because it has to read and place most of the weights before it runs out. Budget several minutes, unlike the divisibility error which fails instantly.

### "Unknown SF transformation", the one that cost us the most time

This is the error we did not see coming, and it is worth the whole section. With 4 GPUs and everything sized correctly, all four workers died during startup:

```
RuntimeError: Assertion error (/workspace/.deps/deepgemm-src/csrc/apis/layout.hpp:60):
Unknown SF transformation
```

**What it means:** this model stores its FP8 weights in blocks, with a separate scale factor per 128x128 block, which you can see in its config as `"weight_block_size": [128, 128]`. vLLM hands that kind of matrix multiplication to a library called DeepGEMM, and DeepGEMM did not know how to lay out those scale factors ("SF" is scale factor) on our particular GPU. The RTX PRO 6000 is Blackwell, but it reports as `sm_120`, which is not the same silicon target as the data-centre Blackwell parts that DeepGEMM is usually exercised on.

Notice how unhelpful the message is if you do not know that background. Nothing in it mentions FP8, quantization, or your GPU.

**The fix**, which is one environment variable:

```bash
docker run -d ... -e VLLM_USE_DEEP_GEMM=0 ... vllm/vllm-openai:latest ...
```

That tells vLLM to use its own FP8 kernels instead of DeepGEMM. Startup then went through cleanly. There is a performance cost to giving up a specialised kernel, so on hardware where DeepGEMM works you would leave it on.

**The general lesson:** a quantized model is a contract between the checkpoint's format and a kernel that understands it. When a big quantized model fails to start on hardware that clearly has enough memory, suspect the kernel and the number format before you suspect your parallelism settings.

### A confusing parse error when you try to run something else in the container

```
vllm serve: error: argument --compilation-config/-cc: Invalid JSON: expected value at line 2
```

**What it means:** you ran `docker run ... vllm/vllm-openai:latest python3 -c "..."`, but the image's entrypoint is already `vllm serve`, so your Python source got handed to vLLM as a command-line argument.

**The fix:** `--entrypoint python3`, as shown in Part 8.

### "No available shared memory broadcast block found in 60 seconds"

**What it means:** usually nothing. It shows up while vLLM is busy compiling or capturing CUDA graphs and the worker processes have not checked in for a minute. If it repeats forever and startup never finishes, then you probably forgot `--ipc=host` and the workers cannot pass data to each other through shared memory.

**The fix:** add `--ipc=host`. If you already have it, wait a bit longer, because CUDA graph capture on a big model is genuinely slow.


## Wrapping up

If you take five things away from this, let them be these.

**One.** Inference is two jobs, not one. Prefill reads your whole prompt at once and is limited by compute; decode writes one token at a time and is limited by memory bandwidth. Every confusing multi-GPU result in this post traces back to that split, so when a change helps one metric and hurts the other, this is why.

**Two.** Work out the memory on paper first. Parameters times bytes-per-parameter gives you the weights, and then remember that the weights are only one of three things that must fit, alongside the conversation cache and the working space. A model whose weights just barely fit is a model that cannot serve anybody.

**Three.** "Splitting across GPUs" is three different things. Tensor parallelism slices every layer and makes all your GPUs work on the same token, at the cost of constant chatter. Pipeline parallelism cuts the layer stack into blocks and barely communicates, at the cost of GPUs waiting their turn. Expert parallelism only exists for mixture-of-experts models and hands out whole experts. You can combine them, and for big models you usually do.

**Four.** Read the startup log. `Model loading took`, `Available KV cache memory`, `GPU KV cache size` and `Maximum concurrency` tell you, in four lines, whether your setup is sane and how many users it can actually hold. A negative cache number is the clearest error message in the whole stack.

**Five.** Check `num_key_value_heads` in `config.json` before you plan your hardware. It, not the parameter count, is usually what limits how many GPUs you can split across cleanly.

One last practical warning, because it cost us more than any GPU problem did. **Check your disk before you download.** A quarter of a terabyte of model weights on a shared machine is not just a storage question, it is a question about everything else living on that disk. Ours was a Kubernetes node, free space crossed the kubelet's eviction threshold, and it evicted the platform's own pods and garbage-collected locally-built images that no registry could replace. `df -h` first, and leave real headroom.

Try it on whatever you have. Two GPUs are enough to see every concept in this post in action, and the log lines mean the same thing whether you are running 4 GPUs or 40. If you hit something we did not cover, tell us and we will add it.

## Credits and references

- The tensor parallel scheme is from **Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism** by Mohammad Shoeybi, Mostofa Patwary, Raul Puri, Patrick LeGresley, Jared Casper and Bryan Catanzaro: [arxiv.org/abs/1909.08053](https://arxiv.org/abs/1909.08053)
- vLLM parallelism and scaling guide: [docs.vllm.ai/en/latest/serving/parallelism_scaling.html](https://docs.vllm.ai/en/latest/serving/parallelism_scaling.html)
- vLLM memory and optimization docs: [conserving_memory](https://docs.vllm.ai/en/latest/configuration/conserving_memory.html) and [optimization](https://docs.vllm.ai/en/latest/configuration/optimization.html)
- Model card and config: [huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507-FP8](https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507-FP8)
- Thanks to the vLLM maintainers, whose startup logging is the best free lesson in distributed inference available anywhere.
