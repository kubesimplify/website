---
title: "Running a single LLM across two GPUs with vLLM"
seoTitle: "Running a single LLM across two GPUs with vLLM"
seoDescription: "How tensor parallelism splits one model's weights across two cards, the memory math that tells you if it fits, and measured TP versus PP numbers on a pair of GPUs with no NVLink."
datePublished: 2026-08-18T10:00:00.000Z
slug: running-a-single-llm-across-two-gpus-with-vllm
author: saiyam-pathak
cover: /img/blog/running-a-single-llm-across-two-gpus-with-vllm/cover.png
tags: ["vllm", "gpu", "nvidia", "tensor-parallelism"]
---

Someone asked me this in a thread the other day, and it is such a good question that it deserves a full walkthrough:

> Has anyone hosted a single LLM by splitting weights across 2 GPUs and served it through vLLM or another inference engine? I have a couple of A40 with 45GB usable VRAM. And want to host the BF16 variant as-is, like we have an RTX PRO 6000, you know, like on 2 cards. How can I do it and how does it work fundamentally, like are the weights split or what happens?

Three questions hiding in there, so let's take them in order. Can you do it? Yes. How do you do it? One flag, mostly. And what actually happens to the weights? That is the interesting part, and it is where most people's mental model is a bit off.

## What you will get from this post

- The memory math that tells you whether your model fits on two cards, before you download 60 GB
- What tensor parallelism actually does to a weight matrix, layer by layer
- The exact vLLM commands, with real terminal output from a real run
- Why a pair of cards without an NVLink bridge might be faster with pipeline parallelism, and how to measure that yourself
- The A40-specific catches, because Ampere has one limitation that changes your options

## The setup I tested on

I need to be upfront about the hardware, because it matters for how you read the numbers.

I do not have a pair of A40s. What I do have access to is a box with 8x NVIDIA RTX PRO 6000 Blackwell Server Edition cards, so I borrowed two of them and deliberately handicapped them to behave like A40s for the part that matters most, which is the memory budget. An A40 gives you roughly 45 GiB of usable VRAM, and at the usual `--gpu-memory-utilization 0.90` that leaves vLLM a budget of about 40.5 GiB per card. On a 95.01 GiB Blackwell card, the same 40.5 GiB budget is `--gpu-memory-utilization 0.426`, so that is what I used everywhere below.

There is one thing I did not have to fake. Let's look at the interconnect:

```console
$ nvidia-smi topo -m
        GPU0    GPU1    GPU2    GPU3    GPU4    GPU5    GPU6    GPU7    CPU Affinity    NUMA Affinity
GPU0     X      SYS     SYS     SYS     SYS     SYS     SYS     SYS     48-55,176-183   6
GPU1    SYS      X      SYS     SYS     SYS     SYS     SYS     SYS     32-39,160-167   4
GPU2    SYS     SYS      X      SYS     SYS     SYS     SYS     SYS     0-7,128-135     0
GPU3    SYS     SYS     SYS      X      SYS     SYS     SYS     SYS     16-23,144-151   2
GPU4    SYS     SYS     SYS     SYS      X      SYS     SYS     SYS     112-119,240-247 14
GPU5    SYS     SYS     SYS     SYS     SYS      X      SYS     SYS     96-103,224-231  12
GPU6    SYS     SYS     SYS     SYS     SYS     SYS      X      SYS     64-71,192-199   8
GPU7    SYS     SYS     SYS     SYS     SYS     SYS     SYS      X      80-87,208-215   10

Legend:
  X    = Self
  SYS  = Connection traversing PCIe as well as the SMP interconnect between NUMA nodes (e.g., QPI/UPI)
  NV#  = Connection traversing a bonded set of # NVLinks
```

Every pair says `SYS`, which means there is no NVLink anywhere on this box. Every GPU-to-GPU hop goes across PCIe and then across the CPU's own interconnect between NUMA nodes. If your two A40s do not have an NVLink bridge physically installed between them, and most people's do not, then you are in exactly this situation. That turns out to be the most important fact in this whole post, and I'll come back to it.

The software, pinned:

```console
vllm 0.27.1
torch 2.13.0+cu130 cuda 13.0
driver 610.43.02
GPU 0: NVIDIA RTX PRO 6000 Blackwell Server Edition 95.01 GiB sm_120
GPU 1: NVIDIA RTX PRO 6000 Blackwell Server Edition 95.01 GiB sm_120
p2p 0<->1 True
```

For the model I picked **Qwen3-32B** in BF16, because it is the honest version of this question. At 32.8B parameters in bfloat16 it genuinely does not fit on one 45 GiB card, but it does fit on two, so the second card is doing real work rather than being a nice-to-have.

## Why one card is not enough, in numbers

Before touching any flags, let's do the arithmetic, because you can answer "will this fit" on paper in about a minute.

A BF16 weight is 2 bytes. So the weights alone are `params x 2 bytes`. For Qwen3-32B that is about 61 GiB, and vLLM tells you the same thing when it reads the checkpoint:

```console
INFO [weight_utils.py:867] Filesystem type for checkpoints: EXT4. Checkpoint size: 61.02 GiB. Available RAM: 1186.67 GiB.
```

61.02 GiB of weights against a 40.5 GiB budget on a single card. That is not close, and it is worth actually watching it fail, because the error message vLLM gives you here is one you will meet again:

```console
$ docker run --gpus '"device=1"' ... vllm/vllm-openai:latest Qwen/Qwen3-32B \
    --tensor-parallel-size 1 --gpu-memory-utilization 0.426 --max-model-len 32768

INFO [model_runner.py:329] Model loading took 61.03 GiB and 16.146783 seconds
INFO [gpu_worker.py:563] Available KV cache memory: -24.42 GiB
ValueError: No available memory for the cache blocks. Try increasing `gpu_memory_utilization`
when initializing the engine.
```

**Available KV cache memory: -24.42 GiB.** I love this line. vLLM loaded the weights, then subtracted them and its activation overhead from the budget, and found it was 24 GiB in the hole before storing a single token of context. The suggestion to increase `gpu_memory_utilization` is a red herring here, since there is no value of it that makes 61 GiB fit in 45.

{{two-gpu-memory-fit-animation}}

So that is the wall. Now let's get over it.

## What actually happens to the weights

### First, the thing NVLink does not do

Your question mentioned wanting the pair to behave "like we have an RTX PRO 6000", so let me clear up the most common misconception before anything else, because NVIDIA's own datasheet invites it. That datasheet advertises "48 GB GDDR6 memory with NVLink" and says it is "scalable up to 96 GB with NVLink", which certainly reads like two bridged cards turn into one 96 GB card. They do not. The footnote on that same page is where the real story is:

> Connecting two NVIDIA A40 cards with NVLink to scale performance and memory capacity to 96 GB is only possible if your application supports NVLink technology. Please contact your application provider to confirm their support for NVLink.

"Only possible if your application supports it" is carrying a lot of weight in that sentence. There is no mode, bridge or no bridge, where CUDA presents your two 48 GB cards to vLLM as a single 96 GB device. Each GPU keeps its own separate memory, and some piece of software has to deliberately cut the model up and coordinate the halves. NVLink never creates the pool, it only makes the conversation between the halves faster. Configuring that software is what the rest of this post is about.

### Now the split itself

The short answer to your actual question is **yes, the weights are genuinely split, and it happens inside each layer, not between layers.**

The technique is called **tensor parallelism**, and it comes from the Megatron-LM paper by Shoeybi and colleagues at NVIDIA. The idea is that a transformer is mostly a stack of big matrix multiplications, and a big matrix multiplication can be cut into pieces that live on different GPUs.

Take the MLP block in a layer. It is two matrix multiplies with a nonlinearity in between: `Y = GeLU(X x A)` then `Z = Y x B`. You could split the first matrix `A` by rows, but then you would have to glue the pieces back together before applying GeLU, because GeLU is nonlinear and `GeLU(a + b)` is not `GeLU(a) + GeLU(b)`. So Megatron splits `A` **column-wise** instead, and as the paper puts it, "the partitioning allows the GeLU nonlinearity to be independently applied to the output of each partitioned GEMM". Each GPU produces its own complete columns of `Y`, applies GeLU locally, and nobody has to talk to anybody.

Then the second matrix `B` is split **row-wise**, which lines up perfectly with the column split of the first one. Each GPU multiplies its slice of `Y` by its slice of `B` and gets a partial sum of the final answer. Now, and only now, the GPUs have to add their partial sums together. That is one **all-reduce**.

Drawn out, one MLP block across two cards looks like this:

{{two-gpu-tensor-split-animation}}

Notice what is split and what is not. The **weights** are split, each card holding half of `A` and half of `B` and never seeing the other half. The **activations** flowing through are replicated, so both cards start from the same full copy of `X` and both end up with the same full copy of `Z` after the all-reduce. That is the trade at the heart of tensor parallelism: you halve the weight memory, and you pay for it by keeping the activations in sync.

A quick note if you go and read the Megatron paper, because the shapes have moved on since 2019. The paper describes a two-matrix MLP with a GeLU in the middle, which is what GPT-2 era models used. Qwen3 and most current models use SwiGLU instead, which has three matrices: `gate_proj`, `up_proj` and `down_proj`, and `silu` rather than GeLU (you can see `"hidden_act": "silu"` in the config below). The partitioning logic carries over unchanged though. `gate_proj` and `up_proj` are both column-parallel, they get multiplied together elementwise which stays local, and `down_proj` is row-parallel and produces the partial sums. Three matrices instead of two, still exactly one all-reduce.

Attention works the same way, and the split is even more intuitive. The Q, K and V projections are cut column-wise "such that the matrix multiply corresponding to each attention head is done locally on one GPU". Qwen3-32B has 64 attention heads, so with two GPUs each card simply owns 32 whole heads and computes attention for them start to finish with no communication at all. The output projection is then row-wise, which again produces partial sums, which again need one all-reduce.

Two matrix-multiply blocks, one all-reduce each. The paper states it plainly: this "enables us to perform all GEMMs in a simple transformer layer using only two all-reduces in the forward path and two in the backward path". Inference is forward-only, so for us it is **two all-reduces per layer**.

Qwen3-32B has 64 layers. So generating a single token means **128 all-reduces**, in sequence, one after another, because layer 5 cannot start until layer 4 has finished exchanging. Hold that thought.

### The KV cache splits too, and that is a bonus

This part people often miss. Because each GPU owns a subset of the attention heads, it only needs to cache keys and values for *its own* heads. The KV cache is split right along with the weights.

Qwen3-32B uses grouped-query attention with 8 key/value heads, so the cache per token for the whole model is:

```
2 (K and V) x 64 layers x 8 kv_heads x 128 head_dim x 2 bytes = 262,144 bytes = 256 KiB per token
```

With two GPUs, each card holds 4 of those 8 KV heads, so each card stores 128 KiB per token instead of the full 256 KiB. The cache is not duplicated across cards, it is divided, so the memory you free up by splitting the weights turns into context capacity rather than being eaten by a second copy of the cache. That is why the second card buys you two things at once, and it is the number I will check against reality further down.

### The divisibility rule you need to check first

Because heads are handed out whole, **your tensor parallel size has to divide your head counts**. Before you commit to a model, open its `config.json` and check. For Qwen3-32B:

```json
{
  "num_hidden_layers": 64,
  "hidden_size": 5120,
  "num_attention_heads": 64,
  "num_key_value_heads": 8,
  "head_dim": 128,
  "intermediate_size": 25600,
  "torch_dtype": "bfloat16"
}
```

64 attention heads divided by 2 is 32, 8 KV heads divided by 2 is 4, and `intermediate_size` 25600 divided by 2 is 12800. All clean, so TP=2 will work. This is why some models refuse to run at TP=8 or TP=3 while being perfectly happy at TP=2, and it is a config-file question, not a mystery.

## Doing it with vLLM

After all that theory, the actual change is one flag. Let's run it:

```bash
docker run -d --name vllm-tp2 \
  --gpus '"device=1,4"' --ipc=host -p 8101:8000 \
  -v /root/.cache/huggingface:/root/.cache/huggingface \
  -e HF_HUB_OFFLINE=1 -e HF_HOME=/root/.cache/huggingface \
  vllm/vllm-openai:latest Qwen/Qwen3-32B \
    --tensor-parallel-size 2 \
    --gpu-memory-utilization 0.426 \
    --max-model-len 32768 \
    --port 8000
```

`--tensor-parallel-size 2` is the whole trick. On a real pair of A40s you would use `--gpu-memory-utilization 0.90` instead of my emulated `0.426`, and everything else stays the same.

Two container details that will bite you if you skip them. `--ipc=host` matters because the tensor parallel workers are separate processes that talk over shared memory, and Docker's default 64 MB `/dev/shm` is not enough. And `--gpus '"device=1,4"'` with that exact nested quoting is how you hand Docker a specific pair of cards; inside the container they are renumbered 0 and 1.

Now the proof that the split is real. Here is what vLLM logs on startup:

```console
(Worker_TP0 pid=611) INFO [model_runner.py:329] Model loading took 30.59 GiB and 20.690370 seconds
(Worker_TP1 pid=612) INFO [model_runner.py:329] Model loading took 30.59 GiB and 20.456472 seconds
(Worker_TP0 pid=611) INFO [gpu_worker.py:563] Available KV cache memory: 8.22 GiB
(EngineCore pid=411) INFO [kv_cache_utils.py:2235] GPU KV cache size: 67,296 tokens
(EngineCore pid=411) INFO [kv_cache_utils.py:2236] Maximum concurrency for 32,768 tokens per request: 2.05x
```

**30.59 GiB on each worker**, and 30.59 doubled is 61.18, which is our 61.02 GiB checkpoint plus a rounding hair. There are two workers, `Worker_TP0` and `Worker_TP1`, one per GPU, each holding exactly half the model. The weights are not replicated. They are cut in half.

And from outside the container:

```console
$ nvidia-smi --query-gpu=index,memory.used --format=csv,noheader
1, 45171 MiB
4, 45171 MiB
```

Identical to the megabyte on both cards, which is what an even split looks like.

Let's also check that the KV math I did earlier actually predicts reality. Each card reported 8.22 GiB free for cache, and I said each card stores 128 KiB per token:

```
8.22 GiB / 128 KiB = 67,338 tokens
```

vLLM reported 67,296. That is a match to within the rounding of "8.22", and it means you can predict your own context capacity on paper before you ever start the server. With `--max-model-len 32768`, 67,296 tokens of cache is 2.05 full-length requests in flight, which is exactly the `2.05x` vLLM printed.

## What those all-reduces actually cost you

So we are done, right? Two cards, model fits, `-tp 2`, ship it.

Not quite. Remember those 128 sequential all-reduces per token. Let's think about how big each one actually is. An all-reduce after the attention or MLP block has to exchange a tensor of shape `[tokens_in_batch, hidden_size]`. At `hidden_size` 5120 in BF16, with a single request decoding one token at a time, that is:

```
1 token x 5120 x 2 bytes = 10,240 bytes = 10 KB
```

Ten kilobytes. That is nothing. The A40 datasheet lists its interconnect as "NVIDIA NVLink 112.5 GB/s (bidirectional), PCIe Gen4: 64GB/s", so NVLink is a bit under twice the bandwidth of the PCIe path. Neither number matters here, though, because you are not moving enough data to care about bandwidth at all. What you are paying is **latency**, 128 times per token, and every one of those hops on a no-NVLink box goes out over PCIe and across the CPU's NUMA interconnect.

This is why vLLM's own documentation gives advice that surprises people. Straight from their parallelism guide:

> if the GPUs on the node do not have NVLINK interconnect (e.g. L40S), leverage pipeline parallelism instead of tensor parallelism for higher throughput and lower communication overhead.

**Pipeline parallelism** splits the model a completely different way: by layers, not inside them. With PP=2 and 64 layers, GPU 0 gets layers 0 to 31 and GPU 1 gets layers 32 to 63. Your memory problem is solved just as well, since each card still holds half the weights. But the communication is utterly different. Instead of 128 all-reduces per token, GPU 0 finishes its 32 layers and hands one activation tensor to GPU 1, once. One point-to-point send instead of 128 collectives.

The cost is that PP is a relay race. With a single request in flight, GPU 1 sits idle while GPU 0 works, then GPU 0 sits idle while GPU 1 works, so you are using half your silicon at any moment. vLLM notes this too, saying that increasing pipeline parallel size "may cause latency penalties". PP pays off when you have enough concurrent requests to keep both stages busy at once, which is what continuous batching gives you.

{{two-gpu-tp-vs-pp-animation}}

So the honest answer is that TP and PP trade against each other, the crossover depends on your interconnect and your concurrency, and you should measure it on your own box. Which is what I did.

## TP=2 vs PP=2, measured

Switching to pipeline parallelism is the same kind of one-flag change:

```bash
docker run -d --name vllm-pp2 \
  --gpus '"device=1,4"' --ipc=host -p 8102:8000 \
  -v /root/.cache/huggingface:/root/.cache/huggingface \
  -e HF_HUB_OFFLINE=1 -e HF_HOME=/root/.cache/huggingface \
  vllm/vllm-openai:latest Qwen/Qwen3-32B \
    --pipeline-parallel-size 2 \
    --gpu-memory-utilization 0.426 \
    --max-model-len 32768 \
    --port 8000
```

And it splits the weights just as effectively, which you can see in the workers being named `PP` instead of `TP` now:

```console
(Worker_PP0 pid=611) INFO [model_runner.py:329] Model loading took 30.52 GiB and 9.017490 seconds
(Worker_PP1 pid=612) INFO [model_runner.py:329] Model loading took 30.52 GiB and 9.547118 seconds
(Worker_PP0 pid=611) INFO [gpu_worker.py:563] Available KV cache memory: 6.92 GiB
(EngineCore pid=411) INFO [kv_cache_utils.py:2235] GPU KV cache size: 56,640 tokens
(EngineCore pid=411) INFO [kv_cache_utils.py:2236] Maximum concurrency for 32,768 tokens per request: 1.73x
```

### The memory difference shows up first

Look at the KV cache: **56,640 tokens with PP against 67,296 with TP**, on identical hardware and an identical memory budget. Pipeline parallelism gave me 18.8% less usable context.

The per-token cost per card is actually the same in both modes, which is a nice coincidence worth understanding. Under TP each card holds all 64 layers but only 4 of the 8 KV heads. Under PP each card holds all 8 KV heads but only 32 layers. `64 x 4` and `32 x 8` are the same number, so both come out at 128 KiB per token per card.

The difference is pure overhead. Subtracting weights and cache from the 40.47 GiB budget, TP left 1.66 GiB of overhead per card and PP left 3.03 GiB, because the pipeline needs extra buffers for activations in flight between the stages. That overhead comes straight out of your context capacity.

There is a second, smaller difference worth knowing about. Tensor parallelism divided the memory perfectly evenly, while pipeline parallelism did not:

```console
# TP=2
1, 45171 MiB
4, 45171 MiB

# PP=2
1, 40701 MiB
4, 43667 MiB
```

Identical to the megabyte under TP, and about 3 GB apart under PP. That is because a layer split cannot be perfectly even when the ends of the model are not symmetric: the first stage carries the token embedding, the last stage carries the final norm and the language modelling head. It rarely matters at PP=2 on matched cards, but it is exactly the kind of thing that bites you if you ever try to split across two cards of *different* sizes, since your headroom is set by whichever card ends up fuller.

### Now the throughput

Same benchmark for both, `vllm bench serve` with a random dataset at 1024 input and 256 output tokens, `--ignore-eos` so every request generates exactly 256 tokens, run at concurrency 1 and again at concurrency 32:

```bash
vllm bench serve --model Qwen/Qwen3-32B --base-url http://localhost:8000 \
  --dataset-name random --random-input-len 1024 --random-output-len 256 \
  --max-concurrency 1 --num-prompts 16 --seed 42 --ignore-eos
```

Before the table, one caveat that I want to put right next to the numbers rather than bury at the end. The memory results above transfer to your A40s directly, because I matched the memory budget on purpose and weight splitting does not care what architecture it runs on. The **throughput** results do not transfer as cleanly, and not simply because Blackwell is faster in absolute terms. The ratio between compute time and communication time is what decides where TP stops winning, and two things move that ratio in opposite directions on your hardware: an A40's slower compute makes each layer's math take longer, which hides the all-reduce latency and helps TP, while PCIe Gen4 instead of Gen5 makes each all-reduce cost more, which hurts TP. I cannot tell you which effect dominates on your box. So read the shape of the result below, not the absolute tok/s, and run the same two commands yourself.

| Metric | TP=2 | PP=2 | Winner |
|---|---|---|---|
| **Concurrency 1** | | | |
| Output token throughput | 36.41 tok/s | 21.00 tok/s | TP by 73% |
| Median TPOT (per-token latency) | 26.38 ms | 46.96 ms | TP by 44% |
| Median TTFT (time to first token) | 296.37 ms | 208.57 ms | PP by 30% |
| **Concurrency 32** | | | |
| Output token throughput | 496.60 tok/s | 487.56 tok/s | TP by 1.9% |
| Median TPOT | 47.22 ms | 56.40 ms | TP by 16% |
| Median TTFT | 3892.42 ms | 2468.40 ms | PP by 37% |
| Benchmark duration | 65.99 s | 67.21 s | TP by 1.8% |
| **Capacity** | | | |
| KV cache | 67,296 tokens | 56,640 tokens | TP by 19% |

Let's read what actually happened here, because it is not the clean story the documentation led me to expect.

**At concurrency 1, tensor parallelism wins convincingly**, 36.41 tok/s against 21.00, and that is exactly the relay-race effect. With one request in flight, PP has one card working and one card waiting at all times, so you get roughly one card's worth of decode speed. TP has both cards grinding on every single token, and since decode speed is mostly about memory bandwidth, using two cards' worth of bandwidth on one request is a real and large win. This is the thing PP fundamentally cannot give you.

**At concurrency 32, the two are effectively tied.** 496.60 against 487.56 tok/s is a 1.9% gap, which is close enough to run-to-run noise that I would not make a decision on it. This is where I have to be straight with you: vLLM's docs say that without NVLink you should "leverage pipeline parallelism instead of tensor parallelism for higher throughput", and on this box **that did not reproduce**. PP never got ahead on throughput, it just caught up. I would guess that is because these cards sit on PCIe Gen5 rather than Gen4, so the all-reduces are cheaper than the guidance assumes, and because at concurrency 32 the all-reduce payload is 32 tokens wide rather than 1, which uses the link far more efficiently. On your Gen4 A40s the gap will be less favourable to TP than what I measured. Whether it crosses over, I genuinely do not know, which is the whole reason I am telling you to measure rather than handing you a verdict.

**The one place PP clearly wins is time to first token**, by 30% at concurrency 1 and 37% at concurrency 32. That one took me a moment to see, and it makes sense once you think about payload sizes. Prefill processes your whole 1024-token prompt at once, so each of TP's 128 all-reduces is moving `1024 x 5120 x 2 bytes`, about 10 MB, not the 10 KB a single decode step moves. Suddenly you *are* bandwidth-bound, and 128 ten-megabyte collectives over PCIe is a real cost. PP moves one activation tensor between stages and skips all of it.

So the shape of the answer, on a box with no NVLink:

- Interactive, low concurrency, one user at a time: **use TP**. It is not close.
- High concurrency batch throughput: **either**, they tie, so pick TP for the extra 19% of KV cache.
- Long prompts where users are staring at a spinner waiting for the first token: **PP is worth testing**, it was meaningfully faster at prefill in both runs.

For your A40s I would still start with `--tensor-parallel-size 2`, because it won or tied on every throughput measure here and it gives you more context capacity. Then run these exact two benchmarks with `--pipeline-parallel-size 2` and see whether your slower interconnect changes the verdict.

## The A40-specific things to know

A few points that apply to your cards specifically rather than to multi-GPU serving in general.

**An NVLink bridge is available, and it is worth hunting for.** The A40 does support NVLink, at 112.5 GB/s bidirectional between a pair, via a physical bridge connector you install between two cards. If you have two A40s in one chassis and you can get the bridge, do it before you spend a week tuning flags. It turns the `SYS` line in your topology into `NV#`, and since tensor parallelism already won on my bridge-less box, cheaper all-reduces can only widen that lead and take the decision off your plate entirely. Check what you have today with `nvidia-smi topo -m`, exactly as I did above.

**FP8 will not save you the way it saves a newer card.** This is the Ampere limitation that changes your options. vLLM's docs are explicit: "FP8 computation is supported on NVIDIA GPUs with compute capability >= 8.9 (Ada Lovelace, Hopper)." The A40 is compute capability 8.6, so it misses that by one minor version. You are not entirely locked out, because "Turing/Ampere GPUs are supported for W8A16 (weight-only FP8) utilizing Marlin kernels", which stores weights at 8 bits and computes in 16. That is a genuinely useful trick for memory: it would take Qwen3-32B's weights from 61 GiB to roughly 31 GiB and let it run on a **single** A40. But you do not get the compute speedup that an Ada or Blackwell card gets from FP8, and you did say you want BF16 as-is, so I mention it only as the escape hatch it is.

**Both cards read the whole checkpoint.** A small operational note from vLLM's docs that surprises people watching disk I/O: with tensor parallelism "each process will read the whole model and split it into chunks", so startup reads scale with your TP size rather than being divided by it.

## So should you just buy one RTX PRO 6000 instead?

Your question framed it as wanting your two A40s to behave "like we have an RTX PRO 6000", so let's compare properly, because on capacity they look similar and on behaviour they are not.

Two A40s give you about 90 GiB of aggregate VRAM. A single RTX PRO 6000 Blackwell gives 96 GiB on one card. Similar pool, and for pure "does the model fit" purposes they are close to equivalent.

The differences that actually decide it:

- **A single card has no interconnect tax at all.** No all-reduces, no PCIe hops, no NVLink bridge to source, no TP-versus-PP tuning. Everything in this post stops being your problem.
- **Blackwell has FP8 and FP4, Ampere has neither.** That is the bigger gap, honestly, and it decides what fits rather than only how fast it runs. A model you can only serve in BF16 on A40s might serve in FP8 on one Blackwell card, in half the memory, at full speed.
- **Two cards give you more aggregate memory bandwidth.** Two A40s is 2 x 696 GB/s of it, and decode speed is largely a memory-bandwidth story. With tensor parallelism you genuinely do get to use both cards' bandwidth on one request, which is a real advantage of TP that PP does not give you.

My take: if you already own the two A40s, use them, because tensor parallelism works and the setup above is maybe twenty minutes of work. Find out whether you can get the NVLink bridge. If you are spending new money and you are choosing between two more A40s and one Blackwell card, buy the single newer card, mostly for FP8 rather than for avoiding the multi-GPU complexity.

## Wrapping up

The mental model to walk away with is that tensor parallelism cuts every big matrix in every layer down the middle, hands each GPU whole attention heads, and pays for it with two all-reduces per layer. That is why it fixes your memory problem completely and your throughput problem only conditionally, because those all-reduces are cheap over NVLink and expensive over PCIe. Pipeline parallelism cuts the stack by layers instead, communicates almost nothing, and needs concurrency to keep both cards busy.

For your two A40s, start with `--tensor-parallel-size 2`, run the same two benchmarks I ran above at your real concurrency, then try `--pipeline-parallel-size 2` and keep whichever wins. Both of them solve the fitting problem, so you are only choosing on speed, and it is a ten-minute experiment on your own hardware which beats anyone's opinion including mine.

Give it a try and let me know how it goes, especially if you get an NVLink bridge on those A40s, because I would love to see the before-and-after numbers on real Ampere silicon.

## Credits and references

- The tensor parallel scheme comes from **Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism** by Mohammad Shoeybi, Mostofa Patwary, Raul Puri, Patrick LeGresley, Jared Casper and Bryan Catanzaro: [arxiv.org/abs/1909.08053](https://arxiv.org/abs/1909.08053)
- vLLM parallelism and scaling guide: [docs.vllm.ai/en/latest/serving/parallelism_scaling.html](https://docs.vllm.ai/en/latest/serving/parallelism_scaling.html)
- vLLM conserving memory and optimization docs: [docs.vllm.ai/en/latest/configuration/conserving_memory.html](https://docs.vllm.ai/en/latest/configuration/conserving_memory.html) and [optimization.html](https://docs.vllm.ai/en/latest/configuration/optimization.html)
- vLLM FP8 quantization support matrix: [docs.vllm.ai/en/latest/features/quantization/llm_compressor/fp8/](https://docs.vllm.ai/en/latest/features/quantization/llm_compressor/fp8/)
- NVIDIA A40 datasheet, for the 48 GB GDDR6, 696 GB/s and 112.5 GB/s NVLink figures: [nvidia.com A40 datasheet](https://images.nvidia.com/content/Solutions/data-center/a40/nvidia-a40-datasheet.pdf)
- Qwen3-32B model card and config: [huggingface.co/Qwen/Qwen3-32B](https://huggingface.co/Qwen/Qwen3-32B)
