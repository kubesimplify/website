---
title: "Running a big LLM across multiple GPUs with vLLM"
seoTitle: "Running a big LLM across multiple GPUs with vLLM"
seoDescription: "A runbook for serving a model too big for one GPU: download to serving in seven steps, with every vLLM flag, startup log line and real error explained, plus tensor, pipeline and expert parallelism benchmarked head to head on a 235B model across four RTX PRO 6000 cards."
datePublished: 2026-08-31T10:00:00.000Z
slug: running-a-big-llm-across-multiple-gpus-with-vllm
author: shubham-katara
authors: ["shubham-katara", "saiyam-pathak"]
cover: /img/blog/running-a-big-llm-across-multiple-gpus-with-vllm/cover.png
tags: ["vllm", "gpu", "nvidia", "llm", "platform-engineering"]
sponsor:
  name: Utho
  url: "https://utho.com/?utm_source=Kubesimplify&utm_medium=docs&utm_campaign=Saiyam"
  # logoLight = navy mark (shown on light theme); logoDark = white mark (shown on dark theme)
  logoLight: /img/sponsors/utho-logo-light.png
  logoDark: /img/sponsors/utho-logo-dark.png
  blurb: "Every number in this runbook was measured on an 8x NVIDIA RTX PRO 6000 Blackwell node from Utho Cloud. If you need GPU infrastructure to run workloads like these, take a look."
---

Sooner or later everyone running models locally hits the same wall. You find a model you want, you look at the download size, and it is bigger than the GPU you own. A 235B model needs roughly 236 GB just for its weights. The card we have holds 96 GB. A handful of current data-centre parts do carry more, but nothing on our machine does, and no amount of clever flags will make 236 GB squeeze into 96 GB.

The answer is to use more than one GPU. That part everybody knows. The part that is genuinely confusing is what "use more than one GPU" actually means. Does each GPU get a copy of the model? Does the model get cut in half? Do the GPUs take turns? Which of those is happening, and what does it cost you?

Let's answer that properly, with a real model on real hardware.

## What this post covers

This is the runbook. Seven steps, from downloading a 236 GB model to serving it across four GPUs, with every command, flag, startup log line and real error explained. It is written for the person with root on the box, and it assumes no prior knowledge of distributed computing: if you know what a GPU is and you have run a model locally once, you are qualified.

The theory arrives where you need it to make a decision, not before. Step 3 explains what a tensor-parallel split actually costs, because that is where you pick one, and Step 6 explains why the three options trade against each other, because that is where you read the numbers. Nothing here is theory for its own sake.

## The machine and the model

Numbers mean nothing without the hardware attached, so here it is once.

**The machine:** a server with 8x NVIDIA RTX PRO 6000 Blackwell Server Edition cards. Each card has 96 GB of memory, and the machine reports 95.01 GiB of that as usable. We borrowed 4 of the 8 cards for this work.

One detail that matters more than it looks: these GPUs are **not** connected by NVLink. NVLink is NVIDIA's fast direct GPU-to-GPU cable. Without it, GPUs talk to each other over PCIe and through the CPU, which is slower. You can check what you have with one command:

```bash
root@utho-gpu-rtxpro6000-8-62383:~# nvidia-smi topo -m
```

| Device   | GPU0 | GPU1 | GPU2 | GPU3 | GPU4 | GPU5 | GPU6 | GPU7 | NIC0 | CPU Affinity    | NUMA Affinity |
| :------- | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :-------------- | :-----------: |
| **GPU0** |  X   | SYS  | SYS  | SYS  | SYS  | SYS  | SYS  | SYS  | SYS  | 48-55,176-183   |       6       |
| **GPU1** | SYS  |  X   | SYS  | SYS  | SYS  | SYS  | SYS  | SYS  | PHB  | 32-39,160-167   |       4       |
| **GPU2** | SYS  | SYS  |  X   | SYS  | SYS  | SYS  | SYS  | SYS  | SYS  | 0-7,128-135     |       0       |
| **GPU3** | SYS  | SYS  | SYS  |  X   | SYS  | SYS  | SYS  | SYS  | SYS  | 16-23,144-151   |       2       |
| **GPU4** | SYS  | SYS  | SYS  | SYS  |  X   | SYS  | SYS  | SYS  | SYS  | 112-119,240-247 |      14       |
| **GPU5** | SYS  | SYS  | SYS  | SYS  | SYS  |  X   | SYS  | SYS  | SYS  | 96-103,224-231  |      12       |
| **GPU6** | SYS  | SYS  | SYS  | SYS  | SYS  | SYS  |  X   | SYS  | SYS  | 64-71,192-199   |       8       |
| **GPU7** | SYS  | SYS  | SYS  | SYS  | SYS  | SYS  | SYS  |  X   | SYS  | 80-87,208-215   |      10       |
| **NIC0** | SYS  | PHB  | SYS  | SYS  | SYS  | SYS  | SYS  | SYS  |  X   |                 |               |

The legend that command prints, trimmed to the codes that matter here:

| Symbol | Meaning                                                                       |
| :----- | :---------------------------------------------------------------------------- |
| `X`    | Self                                                                          |
| `SYS`  | Across PCIe **and** the interconnect between CPU sockets. The slowest option. |
| `NODE` | Across PCIe and the bridges inside one NUMA node                              |
| `PHB`  | Across PCIe and a PCIe host bridge, typically the CPU                         |
| `PXB`  | Across multiple PCIe bridges, without touching the host bridge                |
| `PIX`  | Across at most a single PCIe bridge. The fastest non-NVLink option.           |
| `NV#`  | Across a bonded set of `#` NVLinks                                            |

On our machine every pair of GPUs reports `SYS`, which means the traffic goes across PCIe and then across the link between the CPU sockets. If you had NVLink you would see `NV1`, `NV2` and so on instead. Keep this in mind, because it changes which splitting method is fastest.

**The model:** `Qwen/Qwen3-235B-A22B-Instruct-2507-FP8`. Let's unpack that name, because it is doing a lot of work:

- **235B** is the total parameter count, 235 billion.
- **A22B** means 22 billion **active** parameters. This is a mixture-of-experts model: each layer holds 128 small expert networks and a router picks just 8 of them per token, so you pay for 235B in memory but only about 22B in arithmetic.
- **FP8** is the number format the weights are stored in, 8 bits each, so one byte per parameter.

**The software:** vLLM 0.27.1 running in the official container, with PyTorch 2.13.0 and CUDA 13.0, on driver 610.43.02.

---

## Step 1: Getting the model onto the machine

Before anything can be split across GPUs it has to be on disk, and with a model this size that is not a formality.

### Check your disk first

A quarter of a terabyte has to land somewhere. Run `df -h` before you start, and if the machine is shared, leave real headroom rather than just enough: platforms that manage disk as a resource start taking action well before the disk is actually full.

### The download

With the headroom confirmed, you download it with the Hugging Face CLI:

```bash
root@utho-gpu-rtxpro6000-8-62383:~# pip install huggingface_hub hf_transfer
root@utho-gpu-rtxpro6000-8-62383:~# HF_XET_HIGH_PERFORMANCE=1 hf download Qwen/Qwen3-235B-A22B-Instruct-2507-FP8
Downloading bytes: ████████████████████████████████████████████████▏                                                                                                             | 24.4GB,  234MB/s
Reconstructing (incomplete total...):  13%|███████████████▋                                                                                                             | 10.0GB / 80.0GB,  104MB/s
Fetching 34 files:   0%|                                                                                                                                                      | 0/34 [00:00<?, ?it/s]

```

`HF_XET_HIGH_PERFORMANCE=1` switches on a downloader that parallelises across connections. On a 236 GB download that is the difference between an hour and most of an afternoon, so it is worth the extra package.

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

Three of those matter to you:

- **`.safetensors`** files hold the actual weights, and unlike the old `.bin` format, simply opening one can never run hidden code on your machine.
- **`model.safetensors.index.json`** is the master map. The weights are spread over 24 files, and this map says which file each piece lives in. When vLLM needs layer 62, it looks here, sees shard 17, and opens only that file.
- **`config.json`** is the model's spec sheet: how many layers, how many heads, how many experts. It is a few kilobytes, and it decides almost everything in this post, including how many GPUs you can split across.

One more detail, because a crash in Step 7 depends on it. Because this model is FP8, each weight is a single byte, which cannot record very large and very small numbers accurately at the same time.

The checkpoint works around that by cutting the weights into blocks of 128 by 128 numbers and giving each block one extra number, its **scale**, that the GPU multiplies back in to recover the real weight. These **block scales** ship alongside the weights, and the arrangement is declared in `config.json`:

```json
"quantization_config": {
  "quant_method": "fp8",
  "fmt": "e4m3",
  "weight_block_size": [128, 128],
  "activation_scheme": "dynamic"
}
```

Remember those block scales. They are the reason for the most annoying crash we hit, down in Step 7.

Do not spend any time on the shard count itself. Ours uses a 10 GB cap, 23 shards of exactly 10.00 GB and a 24th holding the remaining 6.45 GB, and somewhere in the 5 to 10 GB range is the common choice across the Hub.

The layout is fixed by whoever uploaded the model, there is no download flag to change it, and it makes no difference to serving: the weights are identical either way, and safetensors are memory-mapped so the loader reads the byte ranges it wants regardless of how they are grouped. Shard size is a distribution question, not an inference question.

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

The practical consequence for serving: mount `~/.cache/huggingface` into the container and point `HF_HOME` at it. Note that this is the **parent** of the `hub/` directory in the tree above, not `hub/` itself: the libraries append `hub/` themselves, so `HF_HOME=~/.cache/huggingface/hub` sends them looking in `hub/hub/` and they find nothing. That is exactly what the `-v` and `-e HF_HOME` flags in Step 4 are doing. Get it wrong and the container downloads its own 236 GB copy.

One more thing about loading that surprises people. When you split the model over 4 GPUs, vLLM starts 4 separate processes, one per GPU, and **every one of them reads the whole checkpoint**, keeping only the quarter it needs. vLLM's own docs say it plainly: with tensor parallelism, "each process will read the whole model and split it into chunks".

That is 4 x 236 GB of reads, but it is **not** 4 x 236 GB off the SSD, and the difference matters when you are sizing a machine. The operating system keeps recently read files in spare RAM, in what is called the page cache. The first worker to touch a shard pulls it from disk; the other three usually find it already in memory and never go near the drive. So what the SSD actually serves is closer to one pass than four, and the other three passes are memory-speed.

The catch is that this only holds while the model fits in the RAM you have spare. On a box with less free memory than the checkpoint, the early shards get evicted before the later workers ask for them, and you do start paying for real re-reads.

Our own `Model loading took` line, which you can see in Step 4, reported 48.5 seconds, and that is the warm case: we had just finished downloading, so almost all of it was still in page cache. A genuinely cold first load, straight off the drive, takes considerably longer, and it is the number to plan restarts around.

## Step 2: Will it fit? The ten-minute check

It sits after the download here because Step 1 is where the disk hazard bites, but on your next model run this check first: it is ten minutes with a calculator and it can save you a quarter-terabyte download that was never going to fit. The arithmetic is simpler than people expect.

**First, the weights.** One parameter costs this many bytes:

| Format       | Bits per parameter | Bytes per parameter |
| ------------ | ------------------ | ------------------- |
| FP32         | 32                 | 4                   |
| BF16 or FP16 | 16                 | 2                   |
| FP8          | 8                  | 1                   |
| FP4 or NVFP4 | 4                  | 0.5                 |

Weights = parameters x bytes per parameter. For our model: 235 billion at 1 byte each, about 236 GB. Our GPU holds 95.01 GiB, so the model is roughly 2.3 times too big for one card. That number alone tells you the minimum GPU count.

**Second, remember weights are only one of three things that must fit:**

1. **The weights.** Fixed size, known before you start.
2. **The KV cache.** The model's memory of the conversation so far. It grows with prompt length and with how many users you serve at once.
3. **Working space.** Scratch memory for the calculations, plus framework overhead.

**Third, size the cache.** Every term comes straight out of the model's `config.json`:

```
bytes per token = 2 x layers x kv_heads x head_dim x bytes_per_number
```

That leading **2 is not the number of blocks in a layer**. It is there because every token leaves behind **two** things, a key and a value, which is where the "KV" in KV cache comes from. Term by term for our model:

| Term               | Value | Where it comes from                        |
| ------------------ | ----- | ------------------------------------------ |
| 2                  | 2     | one key **and** one value per token        |
| `layers`           | 94    | `num_hidden_layers`                        |
| `kv_heads`         | 4     | `num_key_value_heads`                      |
| `head_dim`         | 128   | `head_dim`                                 |
| `bytes_per_number` | 2     | the cache is kept in BF16, so 2 bytes each |

So `2 x 94 x 4 x 128 x 2 = 192,512 bytes`, call it 188 KiB per token. Sounds small, but this model supports a 262,144-token context, so one single full-length conversation would need about **47 GiB**. That is half a GPU for one user, and it is why "the weights fit, so I am fine" is wrong. It is also why `--max-model-len` exists, as you will see in the flags table.

One piece of good news: under tensor parallelism the KV cache is **divided** across GPUs rather than duplicated, so 4 GPUs give you roughly 4x the conversation room on top of making the weights fit.

{{multi-gpu-memory-fit-animation}}

## Step 3: Pick your split, then check it divides

vLLM gives you three ways to spread a model over GPUs, and they are genuinely different things. Picture a restaurant kitchen that has to produce one dish, and the flag falls out of the picture:

- **Tensor parallelism** (`--tensor-parallel-size`) is four chefs working on the same dish at once, one chopping, one on sauce, one on protein, one plating. They constantly coordinate, but the dish is done fast. It slices every layer across all GPUs: best tokens per second, evenly split memory, and the KV cache gets divided too. The default for GPUs inside one machine, and what we run.
- **Pipeline parallelism** (`--pipeline-parallel-size`) is four chefs at four stations with the dish moving down the line, where station two cannot start until station one finishes. Very little talking, so it is the tool for spanning machines with a slow network, and it wins on time to first token. But a station that runs slow leaves the others waiting.
- **Expert parallelism** (`--enable-expert-parallel`) is a kitchen of 128 specialists where each dish needs only 8, spread across four rooms. Mixture-of-experts models only. Its job is trillion-parameter clusters where even a tensor-parallel split cannot hold all the experts. It is **not** a memory saver at our scale, as Step 6 shows.

{{multi-gpu-split-modes-animation}}

The first two are easiest to hold in your head as two ways of cutting a layer cake:

![Pipeline parallelism cuts the layer cake horizontally, so each GPU owns a contiguous block of whole layers; tensor parallelism cuts it vertically, so each GPU owns a slice of every layer](/img/blog/running-a-big-llm-across-multiple-gpus-with-vllm/cake-layers.png)

That is the whole distinction. Pipeline parallelism cuts across the layers and each GPU owns a few of them start to finish. Tensor parallelism cuts down through the layers and every GPU owns a sliver of all 94, which is why they all work on the same token at the same time. Expert parallelism is the odd one out and does not fit the cake picture: it deals whole expert networks to different cards, 32 each in our case.

The drawing shows three cards because it is illustrating the two shapes, not our setup. Card counts are not free choices, which is exactly what the next check is about.

**One cost to know before you pick tensor parallelism.** Because every GPU holds only a sliver of each layer, none of them can finish a layer alone. They each compute a partial answer and then add those together so everyone has the full result. That operation is called an **all-reduce**, and it happens twice per layer, every layer, for every single token.

On a 94-layer model that is 188 all-reduces to produce one token, and on our machine every one of them crosses PCIe rather than NVLink. That communication tax is what Step 6's numbers are really measuring. You do not need the details to run the thing, only to know the tax exists and that the interconnect sets its rate.

**Then the ten-second pre-flight check.** You cannot pick any number for `--tensor-parallel-size`: because attention heads are handed out whole, your TP size must divide the model's head counts. Open `config.json`:

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

## Step 4: The command, and every flag in it

Here is the whole thing. Run this and you have a server; the rest of the step explains every piece of it.

```bash
root@utho-gpu-rtxpro6000-8-62383:~# docker run -d --name vllm-tp4 \
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
.
.
.
(Worker_TP0 pid=770) INFO 08-21 18:18:05 [gpu_model_runner.py:5405] Model loading took 55.19 GiB memory and 48.502592 seconds
(EngineCore pid=558) INFO 08-21 18:21:55 [kv_cache_utils.py:2235] GPU KV cache size: 621,392 tokens
(EngineCore pid=558) INFO 08-21 18:21:55 [kv_cache_utils.py:2236] Maximum concurrency for 32,768 tokens per request: 18.96x
(Worker_TP1 pid=771) INFO 08-21 18:22:06 [gpu_worker.py:789] Free memory on device (94.05/95.01 GiB) on startup. Desired GPU memory utilization is (0.9, 85.51 GiB). Actual usage is 56.89 GiB for consumed memory (weights + non-torch), 0.76 GiB for peak activation, and 0.32 GiB for CUDAGraph memory. Replace gpu_memory_utilization config with `--kv-cache-memory=29407858586` (27.39 GiB) to fit into requested memory, or `--kv-cache-memory=38581581312` (35.93 GiB) to fully utilize gpu memory. Current kv cache memory in use is 27.85 GiB.
(Worker_TP1, Worker_TP2 and Worker_TP3 print the same line, same numbers, different pid. That they agree exactly is the point: the split is even.)


```

The two interesting environment variables here are:

- `HF_HUB_OFFLINE=1` tells the Hugging Face library not to phone home. It uses the local copy, which also means startup does not fail if the network is down.
- `VLLM_USE_DEEP_GEMM=0` Not optional on our hardware. Without it all four workers die during startup with `Unknown SF transformation`. Step 7 explains why, and it is specific to FP8 block-scaled weights on `sm_120` cards, so try without it first on anything else.

One thing worth knowing about that entrypoint: because it is already `vllm serve`, running `docker run ... vllm/vllm-openai:latest python3 -c "..."` does **not** work the way you expect. Your Python gets handed to `vllm serve` as arguments and you get a confusing parse error. To run something else inside the image, override it:

```bash
root@utho-gpu-rtxpro6000-8-62383:~# docker run --rm --gpus '"device=1,4"' --entrypoint python3 vllm/vllm-openai:latest -c "
import torch
print('GPUs visible:', torch.cuda.device_count())
print('can GPU 0 talk to GPU 1 directly:', torch.cuda.can_device_access_peer(0, 1))
"
GPUs visible: 2
can GPU 0 talk to GPU 1 directly: True
```

That is a genuinely useful sanity check before you start a long model load, because it confirms the container can see the cards. Do read the second line carefully though: `can_device_access_peer` tells you peer-to-peer addressing is **possible**, not that it is fast.

Ours returns `True` while `nvidia-smi topo -m` still reports `SYS` for that pair, because the transfer is permitted but it is going over PCIe and across sockets. The topology matrix is the one that tells you what performance to expect.

### Every flag, explained

If you only remember one thing from the runbook, make it this table.

| Flag                                | What it does                                                                                              | Why our value                                                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `--tensor-parallel-size 4`          | How many GPUs to slice each layer across. Often shortened to `-tp`.                                       | 236 GB of weights needs at least 3 cards of 95 GiB, and 4 divides the model's head counts cleanly.                             |
| `--pipeline-parallel-size 1`        | How many groups to cut the layer stack into. Often `-pp`.                                                 | 1 means off. We measure a `-pp 4` build in Step 6.                                                                             |
| `--enable-expert-parallel`          | Hand out whole experts per GPU instead of slicing every expert. Mixture-of-experts models only.           | Tested both ways in Step 6, the choice a big MoE forces on you.                                                                |
| `--gpu-memory-utilization 0.90`     | The fraction of each GPU's memory vLLM is allowed to claim, for weights plus KV cache plus working space. | 0.90 leaves a little headroom. Push it to 0.95 for more cache, but leave room or startup fails.                                |
| `--max-model-len 32768`             | The longest single request, prompt plus reply, in tokens.                                                 | The model supports 262,144, but that would eat 47 GiB of cache for one user. 32,768 is a sane serving value.                   |
| `--max-num-seqs 32`                 | How many requests may be in flight at once.                                                               | Caps how much KV cache can be demanded simultaneously. Lower it if you see requests being preempted.                           |
| `--served-model-name qwen3-235b`    | The name clients use in the API.                                                                          | Otherwise clients must send the full checkpoint path.                                                                          |
| `--port 8000`                       | Port for the OpenAI-compatible API.                                                                       | Convention.                                                                                                                    |
| `--distributed-executor-backend mp` | How the GPU worker processes are managed: `mp` for plain Python multiprocessing, `ray` for a Ray cluster. | All 4 GPUs are in one machine, so `mp` is the simpler choice. `ray` is for multiple machines.                                  |
| `--enforce-eager`                   | Skips building optimised CUDA graphs at startup.                                                          | We do **not** use it. It saves memory and starts faster, but generation is slower. Reach for it only if you are out of memory. |
| `--kv-cache-dtype fp8`              | Stores the conversation cache at 8 bits instead of 16, roughly halving cache memory.                      | We left it at the default so our cache numbers are easy to check by hand. It is a good lever if you need more concurrency.     |

Three rows above describe flags we measured but did not keep: `--pipeline-parallel-size` and `--enable-expert-parallel` are the alternatives benchmarked in Step 6, and `--distributed-executor-backend mp` is already vLLM's default for a single machine, so it is in the table for the day you need `ray` rather than because our command sets it. The command above carries only what our final configuration needs, plus one environment variable:

| Environment variable   | Why you need it                                                                                                                                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VLLM_USE_DEEP_GEMM=0` | Not optional on our hardware. Without it all four workers die during startup with `Unknown SF transformation`. Step 7 explains why, and it is specific to FP8 block-scaled weights on `sm_120` cards, so try without it first on anything else. |

Two container flags matter just as much, and neither is a vLLM flag:

| Docker flag                 | Why you need it                                                                                                                                                                                    |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ipc=host`                | The GPU workers are separate processes that pass data through shared memory. Docker's default 64 MB of shared memory is far too small, and leaving this out gives you a confusing hang at startup. |
| `--gpus '"device=1,4,5,6"'` | Hands specific GPUs to the container. The nested quoting is fussy but required. Inside the container they are renumbered 0 to 3.                                                                   |

## Step 5: How to read the startup log

The startup log is the best teaching tool in the whole stack, and almost nobody reads it. Four lines tell you everything about whether your configuration is sensible.

**Line one, how big the weights are per GPU.** You get one of these per worker:

```
(Worker_TP0) Model loading took X GiB
```

If you divide the full model size by your `--tensor-parallel-size` and get roughly this number, the split worked. If this number equals the **whole** model, something is wrong and you are not actually splitting.

**Line two, what is left for conversations.** On vLLM 0.27.1 this arrives inside the long `gpu_worker.py` line you can see in Step 4, phrased as:

```
Current kv cache memory in use is X GiB
```

Older versions print a dedicated `Available KV cache memory: X GiB` line instead, so search for both. If the figure is **negative**, your weights plus overhead already exceeded the budget and vLLM will refuse to start. That is the clearest possible signal that you need more GPUs, a smaller number format, or a lower `--max-model-len`.

**Line three, the cache in tokens:**

```
GPU KV cache size: N tokens
```

This is the total number of tokens the server can remember across all users at once. You can predict it: take the available cache memory, divide by the bytes-per-token figure from Step 2 (divided by your TP size, since each card keeps only its own heads' share).

**Line four, how many users that really means:**

```
Maximum concurrency for 32,768 tokens per request: N.NNx
```

This is the one to show your capacity planner. If it says `2.05x`, then two users can each have a full-length 32k conversation, and a third will have to wait or be preempted. It is simply the previous line divided by `--max-model-len`.

For our run the four figures came out as: `Model loading took 55.19 GiB` per worker, 27.85 GiB of kv cache in use, `GPU KV cache size: 621,392 tokens`, and a maximum concurrency of `18.96x` at 32k.

Predicting that token count by hand, 27.85 GiB divided by 47 KiB per token per card, gives 621,337 against the 621,392 vLLM printed, which is the kind of agreement that tells you the mental model is right.

## Step 6: Benchmark it, and what we would run

Once it was running, we compared all three ways of splitting the same model over the same 4 GPUs: tensor parallelism on its own, tensor parallelism plus expert parallelism, and pure pipeline parallelism. Same hardware, same flags otherwise, same benchmark shape.

Two numbers do most of the talking. **Time to first token** is how long the user waits before anything appears, and **output tokens per second** is how fast the answer then streams. Every configuration trades one against the other, and one idea explains why.

The tradeoff between time to first token and tokens per second comes from the fact that answering a request involves two separate jobs:

- First, the server reads your entire prompt in a single pass. This is where the time to first token is determined.
- Then, it writes the reply one token at a time, which is where tokens per second are measured.
- Those 188 exchanges per token (from Step 3) are almost free during output, since they only carry one token’s worth of data each time.
- During the initial prompt read (for example, a 1,024-token prompt), the same exchanges carry a thousand times more data.
- As a result:
  - Tensor parallelism pays most of its communication cost at the beginning (first-token time).
  - Pipeline parallelism, where each GPU simply passes the result to the next, largely avoids this cost.
- That’s the core tradeoff, and you’ll see it illustrated in the upcoming benchmarks.

The benchmark is vLLM's own, with tensor parallelism on, 1024 tokens in and 256 tokens out per request, with `--ignore-eos` so every request generates exactly 256 tokens and the comparison is fair:

```bash
root@utho-gpu-rtxpro6000-8-62383:~# docker exec vllm-tp4 vllm bench serve \
  --model Qwen/Qwen3-235B-A22B-Instruct-2507-FP8 \
  --served-model-name qwen3-235b \
  --base-url http://localhost:8000 \
  --dataset-name random --random-input-len 1024 --random-output-len 256 \
  --max-concurrency 1 --num-prompts 12 --seed 42 --ignore-eos

Maximum request concurrency: 1
100%|██████████| 12/12 [00:55<00:00,  4.62s/it]
============ Serving Benchmark Result ============
Benchmark duration (s):                  55.38
Total input tokens:                      12288
Total generated tokens:                  3072
Request throughput (req/s):              0.22
Output token throughput (tok/s):         55.47
Total token throughput (tok/s):          277.34
---------------Time to First Token----------------
Mean TTFT (ms):                          255.31
Median TTFT (ms):                        251.60
-----Time per Output Token (excl. 1st token)------
Median TPOT (ms):                        17.14
==================================================
```

and then again with 32 requests in flight, which is the same command with two numbers changed:

```bash
--max-concurrency 32 --num-prompts 640

Maximum request concurrency: 32
100%|██████████| 640/640 [05:23<00:00,  1.98it/s]
============ Serving Benchmark Result ============
Benchmark duration (s):                  323.10
Total input tokens:                      655360
Total generated tokens:                  163840
Request throughput (req/s):              1.98
Output token throughput (tok/s):         507.09
Total token throughput (tok/s):          2535.46
---------------Time to First Token----------------
Mean TTFT (ms):                          3176.38
Median TTFT (ms):                        3211.10
-----Time per Output Token (excl. 1st token)------
Median TPOT (ms):                        51.16
==================================================
```

**Why 32 in-flight requests and not some other number?** Because 32 is the ceiling we gave the server ourselves: `--max-num-seqs 32` tells vLLM to work on at most 32 requests per step. Benchmarking at exactly that ceiling shows the server fully loaded, which is the number you actually want for capacity planning.

**And what happens if a 33rd request arrives?** Nothing dramatic, and that is worth knowing. It is not rejected and it does not error. It waits in a queue inside the server, and the moment one of the 32 running requests finishes, it takes the freed slot.

So the cost of oversubscribing is waiting time, not failures: throughput stays flat because the server was already flat out, and the extra request simply sees a longer time to first token.

One subtlety: 32 is not the only ceiling in play. The startup log said this configuration holds about 19 full-length 32k conversations in its KV cache, and our benchmark requests are short, so `--max-num-seqs` is the limit that binds here. With long conversations the cache fills first, and instead of queueing politely vLLM starts preempting: it evicts a running request's cache and recomputes it later. Which ceiling you hit first depends entirely on how long your requests are.

One trap to know before you re-run this. vLLM caches prompt prefixes by default, so firing the same `--seed 42` prompts at a server that has already seen them measures the cache, not the model: ours reported time to first token "improving" from 265 ms to 61 ms that way, which was meaningless. Note that `--no-enable-prefix-caching` is a `vllm serve` flag, not a `vllm bench serve` one, so you cannot switch it off from the benchmark side. Either vary `--seed` between runs, or restart the server with caching disabled. Every figure below comes from a freshly started server, so each configuration began with an empty cache.

### The memory side

We ran the same pair of benchmarks against all three configurations. First, where the memory went:

|                        | TP=4                | TP=4 plus EP        | PP=4                              |
| ---------------------- | ------------------- | ------------------- | --------------------------------- |
| Weights per GPU        | 55.19 GiB           | 55.19 GiB           | 55.70 GiB                         |
| KV cache per GPU       | 27.85 GiB           | 27.96 GiB           | 26.84 GiB                         |
| Total KV cache         | 621,392 tokens      | **623,696 tokens**  | 555,680 tokens                    |
| Max concurrency at 32k | 18.96x              | **19.03x**          | 16.96x                            |
| GPU memory used        | 88,211 MiB on all 4 | 88,209 MiB on all 4 | 84,283 / 87,899 / 87,899 / 84,507 |

**Expert parallelism did not save memory.** It moved 0.37% of extra room into the cache, which is noise. If you were hoping expert parallelism would let you fit a model that otherwise does not fit, this is your warning that it will not.

**Pipeline parallelism cost 10.6% of the cache**, dropping from 621,392 tokens to 555,680, because a pipeline needs extra buffers for the activations travelling between stages and that comes straight out of your conversation capacity.

Look at the last row. Under tensor parallelism all four cards sat at **exactly 88,211 MiB**, the same number on every one. Under pipeline parallelism they ranged from 84,283 to 87,899 MiB, about 3.5 GiB apart, because a layer split cannot be perfectly even when 94 layers go over 4 GPUs and the ends of the model are not symmetric: the first stage carries the token embedding and the last carries the output head. That evenness check is the quickest sanity test you have that a tensor-parallel split is behaving.

### The speed side

| Measurement                             | TP=4         | TP=4 plus EP | PP=4         | Winner             |
| --------------------------------------- | ------------ | ------------ | ------------ | ------------------ |
| Median time per token, 1 request        | **17.14 ms** | 18.83 ms     | 21.19 ms     | TP                 |
| Output tokens/sec, 32 requests          | **507.09**   | 470.93       | 296.48       | TP, by 70% over PP |
| Median time to first token, 32 requests | 3,211 ms     | 3,705 ms     | **2,735 ms** | PP, by 15%         |

Every figure in that table is a rate or a latency rather than a total, which matters because the runs were not all the same size. We measured all three at `--num-prompts 128` first, then re-ran the winner at `--num-prompts 640` to be sure the result held up.

It did: TP produced 507.09 tokens/sec at the larger scale against 503.68 at the smaller, and a median first-token latency of 3,211 ms against 3,233 ms. Both inside 1%, so the numbers above are the 640-prompt figures for TP and the 128-prompt figures for the other two, and the comparison is sound. The full output pasted above is from the 640-prompt run.

Tensor parallelism won nearly everything, and one gap deserves attention. At 32 concurrent requests it produced **70% more tokens per second than pipeline parallelism**. That is not a rounding error, it is a different class of performance, and it lines up exactly with the reading-versus-writing split above.

- Tensor parallelism has all four GPUs working on every token.
- Pipeline parallelism has each GPU working on a different request's stage, and it only pays off when every stage takes the same time.

Ours do not: the memory table above shows the four stages holding 84,283 to 87,899 MiB, because 94 layers do not divide evenly by 4 and the first stage carries the token embedding while the last carries the output head.
Every uneven stage is a bubble the other three wait on, on every single token. Its median time per token was 24% worse for the same reason.

**Pipeline parallelism did win one thing, and it is the one the theory predicts:** time to first token, by 15%. Reading a 1,024-token prompt is exactly where tensor parallelism's 188 all-reduces get expensive, because each one carries the whole prompt's worth of data rather than a single token's.

Pipeline parallelism hands one activation tensor to the next stage and skips all of it. If your users judge you on how fast the first word appears, that is a real and measurable advantage.

Expert parallelism costing 7% is not a knock on the technique, and it is important not to over-read it. Expert parallelism exists to solve a problem we do not have: models so large that even a tensor-parallel split cannot hold all the experts, on clusters big enough that duplicating experts everywhere would be wasteful.

With 4 GPUs and a model that already fits, we are asking it to do a job it was not designed for and paying an extra network hop per token for nothing. On a 32 or 64 GPU deployment of a trillion-parameter model the answer would very likely flip.

### One number we threw away, and why

Being straight about this, because it is a good lesson in reading your own benchmarks. The very first expert-parallel run at one request at a time reported **28.71 output tokens per second**, which would have made expert parallelism look catastrophic. It was not real. Look at the two TTFT figures from that run:

```
Mean TTFT (ms):    3987.38
Median TTFT (ms):   265.56
```

A mean fifteen times the median means one request behaved completely differently from the other eleven. One request stalled for about 45 seconds, almost certainly a one-off kernel compilation on the first pass through a code path, and that single stall stretched the whole benchmark from 63 seconds to 107 seconds. Since throughput is just tokens divided by wall-clock, one stall wrecked the headline number.

That is why the speed table carries **median time per token** alongside aggregate throughput rather than relying on throughput alone. Median per-token latency does not care that one request had a bad start, so when the two rows agree, as they do for all three configurations above, the throughput figure is trustworthy. When they disagree, believe the median and go looking for a stall.

### What we would actually run

For a 235B MoE on 4 GPUs with no NVLink between them, we would use plain `--tensor-parallel-size 4` and leave both of the others off. It was faster nearly everywhere, it gives the most conversation capacity, it splits memory perfectly evenly, and it is one less thing to reason about.

We would reach for the other two in specific situations, not as general upgrades:

- **Pipeline parallelism** if time to first token is the metric you are judged on, or if you are spanning multiple machines where the network between them is genuinely slow. It was 15% better at first-token latency and it barely touches the interconnect.
- **Expert parallelism** when the model is so large that even a tensor-parallel split cannot hold all the experts. That is a real problem at trillion-parameter scale and simply is not our problem at 235B on 4 cards.

One more thing worth saying plainly, because it is the biggest caveat on every number above: **our GPUs have no NVLink.** Every one of those 188 all-reduces per token crosses PCIe and the link between CPU sockets.

On a machine with NVLink the all-reduce gets dramatically cheaper, tensor parallelism's one weakness at first-token latency shrinks, and pipeline parallelism's single win would likely disappear. If you are reading this table to plan hardware, the interconnect is the variable to check first.

## Step 7: Errors you will actually hit

Every one of these is a real message we collected while doing this, not a hypothetical.

### "must be divisible by tensor parallel size"

We asked for 3 GPUs, which is a perfectly reasonable-sounding thing to want, and got:

```
pydantic_core._pydantic_core.ValidationError: 1 validation error for VllmConfig
  Value error, Total number of attention heads (64) must be divisible by tensor
  parallel size (3).
```

**What it means:** the rule from Step 3. 64 heads cannot be shared out evenly among 3 GPUs. Good news, it fails in about a second, before loading a single byte of weights.

**The fix:** pick a `--tensor-parallel-size` that divides **both** head counts, attention and key/value. Do not just reach for the next power of two: `-tp 8` divides our 64 attention heads but not our 4 KV heads, which is the case Step 3 warns about.

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

**The fix:** vLLM lists the three real options itself, and for our case only one of them helps. Lowering `--gpu-memory-utilization` would make things worse, not better, because it reduces the space available for weights.

Quantizing further would work but changes the model. So the answer is more GPUs, which is the whole point of this post.

Worth knowing: this one is slow to fail, because it has to read and place most of the weights before it runs out. Budget several minutes, unlike the divisibility error which fails instantly.

### "Unknown SF transformation", the one that cost us the most time

This is the error we did not see coming, and it is worth the whole section. With 4 GPUs and everything sized correctly, all four workers died during startup:

```
RuntimeError: Assertion error (/workspace/.deps/deepgemm-src/csrc/apis/layout.hpp:60):
Unknown SF transformation
```

**What it means:** this model stores its FP8 weights in blocks, with a separate scale factor per 128x128 block, which you can see in its config as `"weight_block_size": [128, 128]`. vLLM hands that kind of matrix multiplication to a library called DeepGEMM, and DeepGEMM did not know how to lay out those scale factors ("SF" is scale factor) on our particular GPU.

The RTX PRO 6000 is Blackwell, but it reports as `sm_120`, which is not the same silicon target as the data-centre Blackwell parts that DeepGEMM is usually exercised on.

Notice how unhelpful the message is if you do not know that background. Nothing in it mentions FP8, quantization, or your GPU.

**The fix**, which is one environment variable:

```
docker run -d ... -e VLLM_USE_DEEP_GEMM=0 ... vllm/vllm-openai:latest ...
```

That tells vLLM to use its own FP8 kernels instead of DeepGEMM. Startup then went through cleanly. There is a performance cost to giving up a specialised kernel, so on hardware where DeepGEMM works you would leave it on.

**The general lesson:** a quantized model is a contract between the checkpoint's format and a kernel that understands it. When a big quantized model fails to start on hardware that clearly has enough memory, suspect the kernel and the number format before you suspect your parallelism settings.

### A confusing parse error when you try to run something else in the container

```
vllm serve: error: argument --compilation-config/-cc: Invalid JSON: expected value at line 2
```

**What it means:** you ran `docker run ... vllm/vllm-openai:latest python3 -c "..."`, but the image's entrypoint is already `vllm serve`, so your Python source got handed to vLLM as a command-line argument.

**The fix:** `--entrypoint python3`, as shown in Step 4.

### "No available shared memory broadcast block found in 60 seconds"

**What it means:** usually nothing. It shows up while vLLM is busy compiling or capturing CUDA graphs and the worker processes have not checked in for a minute. If it repeats forever and startup never finishes, then you probably forgot `--ipc=host` and the workers cannot pass data to each other through shared memory.

**The fix:** add `--ipc=host`. If you already have it, wait a bit longer, because CUDA graph capture on a big model is genuinely slow.

That is the runbook complete: the model is serving, you know what every flag is doing, and you know the failure modes.

## Wrapping up

Four things to carry out of this, all of them checks you can run in a minute.

**One.** Check your disk before you download. A quarter of a terabyte of weights on a shared machine is a question about everything else living on that disk, not just a storage question. `df -h` first, and leave real headroom.

**Two.** Check `num_key_value_heads` in `config.json` before you plan your hardware. It, not the parameter count, is usually what limits how many GPUs you can split across cleanly. Ours is 4, which is exactly why we run at `-tp 4` and not `-tp 8`.

**Three.** Work out the memory on paper first. Parameters times bytes-per-parameter gives you the weights, and then remember the weights are only one of three things that must fit, alongside the conversation cache and the working space. A model whose weights just barely fit is a model that cannot serve anybody.

**Four.** Read the startup log. `Model loading took`, the kv cache memory figure, `GPU KV cache size` and `Maximum concurrency` tell you, in four lines, whether your setup is sane and how many users it can actually hold. A negative cache number is the clearest error message in the whole stack.

And for a 235B mixture-of-experts model on four GPUs with no NVLink between them, the answer is plain `--tensor-parallel-size 4`. It was faster nearly everywhere, it gives the most conversation capacity, and it splits memory perfectly evenly.

Try it on whatever you have. Two GPUs are enough to see every one of these steps in action, and the log lines mean the same thing whether you are running 4 GPUs or 40. If you hit something we did not cover, tell us and we will add it.

**And check your interconnect before you buy anything.** Every number in Step 6 was measured on GPUs with no NVLink between them, so all 188 all-reduces per token crossed PCIe.

That single fact is why pipeline parallelism managed to win first-token latency at all. On a machine with NVLink we would expect that win to vanish. `nvidia-smi topo -m` tells you which world you are in, and it is the first command we run on any new box.

## Credits and references

- vLLM parallelism and scaling guide: [docs.vllm.ai/en/latest/serving/parallelism_scaling.html](https://docs.vllm.ai/en/latest/serving/parallelism_scaling.html)
- vLLM memory and optimization docs: [conserving_memory](https://docs.vllm.ai/en/latest/configuration/conserving_memory.html) and [optimization](https://docs.vllm.ai/en/latest/configuration/optimization.html)
- Model card and config: [huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507-FP8](https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507-FP8)
- Thanks to the vLLM maintainers, whose startup logging is the best free lesson in distributed inference available anywhere.
