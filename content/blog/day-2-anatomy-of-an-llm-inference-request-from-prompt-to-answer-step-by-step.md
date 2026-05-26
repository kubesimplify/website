---
title: "Day 2: Anatomy of an LLM Inference Request. From Prompt to Answer, Step by Step"
seoTitle: "Day 2: Anatomy of an LLM Inference Request on DGX Spark"
seoDescription: "A beginner-friendly walkthrough of tokenization, prefill, KV cache, decode, batching, TTFT, and why memory bandwidth shapes local LLM performance on NVIDIA DGX Spark."
datePublished: 2026-05-26T00:00:00.000Z
slug: day-2-anatomy-of-an-llm-inference-request-from-prompt-to-answer-step-by-step
author: saiyam-pathak
tags: ["nvidia", "dgxspark", "local-ai", "llm", "ai-inference"]
cover: /img/blog/day-2-anatomy-of-an-llm-inference-request-from-prompt-to-answer-step-by-step/d2-1-lifecycle.png
---

*Day 2 of "7 Days of DGX Spark". A field guide to running serious LLMs on a $4,699 box on your desk.*

---

You typed `"What's the capital of France?"` and hit enter. A few seconds later you saw `"Paris."`

What actually happened in those few seconds?

The usual answer is "the model thought about it." It's a nice story, but it's not how the machine actually works. What really happens is a short assembly line of distinct steps. Some run on the CPU, some on the GPU. Some are fast, some are slow. Some are limited by how quickly the hardware can do math, others by how quickly it can read numbers out of memory. Until you can tell those apart, the box on your desk feels a bit mysterious. Once you can, the mystery goes away and you start making better decisions about which model to run, which inference engine to use, and when to throw more hardware at the problem.

By the end of this post, you'll be able to answer questions like:

- Why **"tokens per second"** is actually two different numbers, not one
- Why a 70-billion-parameter model on a Spark generates only about 7 tokens per second, no matter how powerful the chip's tensor cores are
- Why serving 16 users at once costs almost the same as serving one (yes, really)
- Why the same model on the same hardware can feel snappy for one kind of prompt and sluggish for another

We're going to follow one prompt all the way through, step by step, and look at what the GPU is doing at each one. No prior systems knowledge needed - we define every term as it shows up.

Let's open the box.

## The whole lifecycle in one picture

When you send a prompt to an LLM, six things happen in order. Each one is a distinct piece of work.

1. **Tokenization**, your text becomes integers
2. **Prefill**, the model reads the entire prompt at once
3. **KV cache builds up**, the model remembers what it just read
4. **Decode**, the model generates new tokens, one at a time
5. **KV cache grows**, each new token gets added
6. **Detokenization**, integers become text again

Steps 1 and 6 are negligible. Steps 2 and 4 are the whole game. Step 3 is the magic that makes step 4 possible.

Let me walk through each.

{{llm-lifecycle-animation}}

---

![Diagram 1: The full lifecycle of an LLM request](/img/blog/day-2-anatomy-of-an-llm-inference-request-from-prompt-to-answer-step-by-step/d2-1-lifecycle.png)

---

## Step 1: Tokenization (text → integers)

LLMs do not read characters. They read **tokens**. A token is an integer that maps to a piece of text. The mapping is fixed for a given model. It comes from training.

The most common tokenization scheme today is **Byte Pair Encoding (BPE)**. The intuition: take the most frequently co-occurring pairs of characters in your training corpus, merge them into a single token, repeat. After a few thousand iterations, you have a vocabulary of ~30,000 to ~262,000 tokens, depending on the model family, where common words are usually one token, uncommon words are two or three tokens, and rare unicode is per-byte.

Quick examples (from a typical Llama-family tokenizer):

| Text | Tokens | Count |
|---|---|---|
| `"Paris"` | `["Paris"]` | 1 |
| `"capital"` | `["capital"]` | 1 |
| `"capitalism"` | `["capital", "ism"]` | 2 |
| `"What's the capital of France?"` | `["What", "'s", " the", " capital", " of", " France", "?"]` | 7 |
| `"スパーク"` (Japanese "spark") | typically 3-6 byte tokens | 3-6 |

Two things to remember:
- **Tokens are not words.** A 100-word essay is usually 130-150 tokens.
- **Tokenizer is per model family.** Llama, Qwen, Gemma, Nemotron all have their own. Same text gives different token counts in different models.

Tokenization happens on the CPU and is essentially free. We're talking microseconds. It is not a bottleneck.

---

![Diagram 2: How text becomes tokens, with examples](/img/blog/day-2-anatomy-of-an-llm-inference-request-from-prompt-to-answer-step-by-step/d2-1-what-is-a-token.png)

---

## Step 2: Prefill (the compute-bound phase)

Now your tokens go to the GPU. The model has to "read" your entire prompt before it can start replying. This is **prefill**, and it has one beautiful property: the model can read all your prompt tokens **in parallel**.

Think of it this way. Your prompt has, say, 1,000 tokens. The model has 80 layers. To prefill, the GPU computes:

```
for each layer in 1..80:
    for each token in 1..1000:
        compute self-attention and feed-forward
```

But the inner loop, "for each token," runs in parallel on the GPU. All 1,000 tokens are processed at the same time, layer by layer. The GPU is doing huge matrix multiplications: 1,000 tokens × the hidden dimension × the weight matrices. These matmuls saturate the tensor cores.

**Prefill is compute-bound.** Your tensor core peak FLOP rate is what limits prefill speed. On a Spark, this number is high: NVIDIA's published spec is up to **1 PFLOP FP4 sparse** on the GB10 tensor cores. In practice you'll measure prefill rates of 2,000-7,000+ tokens per second on common models (see [Ollama's published numbers on Spark](https://ollama.com/blog/nvidia-spark-performance): llama 3.1 8B prefills at **7,614 tok/s**, gpt-oss 20B at **3,224 tok/s**).

Two things you can do about prefill performance:
- Send shorter prompts (fewer tokens to process)
- Batch multiple requests so the GPU sees more work at once

That's all. The math is what it is.

---

![Diagram 3: Prefill, parallel processing of all prompt tokens](/img/blog/day-2-anatomy-of-an-llm-inference-request-from-prompt-to-answer-step-by-step/d2-3-prefill-parallel.png)

---

## Attention in plain English (the bridge to KV cache)

Before we talk about the **KV cache**, a one-paragraph mental model for what attention does.

For every token in your sequence, the model produces three vectors: a **Query (Q)**, a **Key (K)**, and a **Value (V)**. Think of K as a "what I am" tag, V as the "what I contribute" payload, and Q as the "what I'm looking for" request. To decide how much each earlier token matters for the next prediction, the model compares the current Q against every previous K (a dot product), softmaxes those scores into weights, and uses them to blend the previous Vs. That blended vector goes into the next layer.

The important consequence for performance: once a token has produced its K and V, those vectors don't change. They only get *looked at* by every future token. **Re-computing them on every decode step would be quadratically expensive and totally unnecessary.** So we save them. That saved structure is the KV cache, and it's why decode can produce one token at a time without re-reading the whole conversation from scratch.

---

![Diagram 4: Attention in plain English, Q, K, V vectors](/img/blog/day-2-anatomy-of-an-llm-inference-request-from-prompt-to-answer-step-by-step/d2-2-attention.png)

---

## Step 3: The KV cache (the magic that makes decode possible)

Here's where things get interesting. After prefill, the model has computed something called the **key (K)** and **value (V)** vectors for every token in your prompt, at every layer. These K and V vectors are what the model uses to do attention: "when I generate the next token, what previous tokens should I pay attention to?"

Naive question: when the model generates token 1001, does it have to re-process tokens 1 through 1000 again? Then for token 1002, re-process 1-1001? That would be quadratic and horrible.

The trick: **cache the K and V vectors.** Save them from prefill. For each new generated token, you only have to compute its own K and V, then attend to everything else from the cache.

This cache is the **KV cache**. It lives in GPU memory. It grows as you generate. It is roughly:

```
KV cache size = num_layers × 2 (K and V) × num_kv_heads × head_dim × context_length × bytes_per_element
```

Modern 70B models like Llama 3.3 use **Grouped-Query Attention (GQA)**, which shares K and V across multiple query heads to keep the cache small. Plugging Llama 3.3 70B's actual shape (80 layers, 8 KV heads, head_dim 128, BF16) into the formula: **~1.25 GiB at 4K context, ~10 GiB at 32K, ~40 GiB at 128K**. That's manageable on a Spark's 128 GB pool, but at million-token contexts the cache can outgrow the weights themselves. **This is why context length is expensive**, and why most production stacks now KV-quantize the cache to 8-bit or below.

The KV cache is also why batching matters. The model's weights only need to be read from memory once per token, no matter how many concurrent requests are in flight. The KV cache is per request. So if you have 16 requests in flight, you read the weights once, and they "serve" all 16 KV caches in parallel. **That's where the throughput multiplier comes from.**

---

![Diagram 5: KV cache, what's stored, how it grows](/img/blog/day-2-anatomy-of-an-llm-inference-request-from-prompt-to-answer-step-by-step/d2-3-kv-cache.png)

---

## Step 4: Decode (the memory-bandwidth-bound phase)

Now the model generates new tokens. One at a time. Each new token requires reading the entire model from memory, doing the matrix multiplications, looking at the KV cache for attention, and producing the next token.

The crucial thing: **for each generated token, roughly the active model weights have to be streamed from memory per output token.** Every layer's weight matrix gets pulled into the tensor cores, multiplied against the activations, and (mostly) discarded. "Active" matters: for a dense model that's the whole model; for a Mixture-of-Experts model it's just the experts the router picks for that token.

The math: 273 GB/s memory bandwidth (Spark) divided by **the bytes actually read per token** equals your theoretical maximum tokens per second. For a dense model, "bytes read" = full model size. For an MoE, "bytes read" = active parameters × bytes/param, NOT the full resident model.

| Model | Resident size | Bytes read per token | Theoretical decode max | Type |
|---|---|---|---|---|
| Llama 3.1 8B Q4 | 4.5 GB | 4.5 GB (dense) | ~61 tok/s | dense |
| GPT-OSS 20B MXFP4 | 13 GB | ~3.6 GB (4 active experts of 32) | ~75 tok/s | MoE |
| Llama 3.3 70B NVFP4 | 35 GB | 35 GB (dense) | ~7.8 tok/s | dense |
| Nemotron 3 Super 120B-A12B NVFP4 | 60 GB | ~6 GB (12B active) | ~45 tok/s | MoE |

This is why some "bigger" models decode **faster** than smaller dense ones: an MoE only reads its active parameters per token. Resident-size-based math is wrong for MoEs.

Compare to published numbers: llama 3.1 8B at **38 tok/s** *[per Ollama official benchmark](https://ollama.com/blog/nvidia-spark-performance)*, gpt-oss 20B at **58 tok/s** *[same source]*, deepseek-r1 14B at **20 tok/s** *[same source]*. The gap from theoretical max comes from KV cache reads, kernel overhead, MoE routing overhead, and other realities. **But the order of magnitude is set by memory bandwidth (and active-parameter count for MoEs), not by the GPU's compute power.**

This is why **decode is memory-bandwidth-bound**, not compute-bound. The tensor cores spend most of their time waiting for weights to arrive from memory. Adding more tensor cores would not help. Adding more memory bandwidth would.

If you remember one number from this entire week, it's this: **Spark's 273 GB/s memory bandwidth divided by your model's bytes in memory ≈ your decode tok/s.**

### The asterisk: speculative decoding can beat that math

The "one memory read per token" floor isn't absolute. There's a class of tricks called **speculative decoding** that lets you generate multiple tokens per read.

The basic version: a small "draft" model proposes the next 4-8 tokens cheaply. The big "target" model validates them in one forward pass. If the draft was right (which it often is on coherent text), you got 4-8 tokens for the price of one memory read. If wrong, you fall back to standard decode.

A newer variant, **Multi-Token Prediction (MTP)**, doesn't even need a separate draft model. The main model itself has auxiliary heads that predict the next 2-3 tokens during a single forward pass. DeepSeek V3 was the most-cited early example; some later DeepSeek and Qwen releases have followed. Check each model card for explicit MTP-head support before assuming - the feature is per-checkpoint, not per-family. **llama.cpp** supports MTP via `--spec-type draft-mtp --spec-draft-n-max 2`. Community measurements on similar-class models show speedups in the **+50% to +80%** range *[various forum reports, check the specific model + flag combo before quoting]*.

The bandwidth math still applies for the raw model reads. Speculative decoding amortizes one read across multiple output tokens. That's the loophole.

---

![Diagram 6: Decode, single token at a time, memory-bandwidth-bound](/img/blog/day-2-anatomy-of-an-llm-inference-request-from-prompt-to-answer-step-by-step/d2-5-decode-bandwidth.png)

---

## Why batching changes everything

Here's the leverage. When you have one user generating one token, you read the entire model from memory to produce that token. **One read, one token output.**

When you have 16 users in flight, you read the entire model from memory to produce **one token for each of them** in the same pass. **One read, 16 tokens output.**

{{llm-batching-animation}}

The model read cost is amortized across all requests. Per-request latency stays **roughly similar until you saturate** the GPU. You can watch it drift down by a few percent as concurrency rises in the table below, then drop harder once you cross the saturation point. Aggregate throughput, meanwhile, climbs almost linearly until saturation.

I measured this directly on this Spark *[my measurement, captured 2026-05-21]*. Gemma 4 31B IT in NVFP4, served via vLLM, max_tokens=512:

| Concurrent requests | Aggregate tok/s | Per-request tok/s |
|---|---|---|
| 1 | 6.15 | 6.15 |
| 4 | 24.41 | 6.10 |
| 8 | 47.13 | 5.89 |
| 16 | 92.10 | 5.76 |
| 32 | 166.36 | 5.20 |

Same model, same hardware, same prompt. **Aggregate scales roughly linearly with concurrency while per-request latency stays inside a couple of tok/s.** Same Spark same week, Qwen2.5-3B BF16: 26.14 → 125.72 → 246.79 → 476.95 → 851.84 → 1462.30 tok/s as N goes 1 → 4 → 8 → 16 → 32 → 64.

*[An earlier 2026-05-08 capture of this same setup labeled c=4 numbers as c=8 (and so on, drifting one concurrency level too low). The 2026-05-21 numbers above are canonical for this series.]*

Memory bandwidth amortization is the most important performance lever you have on Spark. **Always batch if your workload can.**

---

![Diagram 7: Batching, same memory read, multiple tokens out](/img/blog/day-2-anatomy-of-an-llm-inference-request-from-prompt-to-answer-step-by-step/d2-4-continuous-batching.png)

---

### A short peek at what serving engines do on top

Continuous batching is one of several tricks production serving engines use to stretch the same memory bandwidth further. Robert Nishihara (Anyscale / Ray co-founder) has a nice walking-and-talking explainer that lines up well with the mental model above. Four other tricks worth knowing by name, even if Day 2 doesn't deep-dive them:

- **Prefill / decode disaggregation.** Prefill is compute-bound and likes big batches; decode is bandwidth-bound and likes small responsive batches. Run them on separate GPU pools and hand off the KV cache between them, so one phase doesn't jitter the other. (Mostly an SGLang and TensorRT-LLM concern; covered briefly on Day 5.)
- **Paged KV cache (PagedAttention).** Instead of a contiguous KV block per request, treat the cache like virtual memory pages. Fragmentation drops, packing improves, larger effective batches fit. vLLM's original contribution; we open it up properly on Day 5.
- **Prefix-aware routing.** Don't round-robin requests blindly. If a new request shares a prefix (system prompt, RAG bundle) with a replica that already has that KV cache hot, route it there. SGLang's RadixAttention is the cleanest implementation; also on Day 5.
- **MoE sharding and routing.** Mixture-of-Experts models keep attention layers replicated and shard experts across devices. A token activates a small subset of experts. Day 6 covers what that means for picking a Spark-friendly model; Day 4 covers the format math.

For a single user on a single Spark, **continuous batching alone gives you most of the win**. The others matter when you're running multi-tenant serving, very long contexts, or MoE models that exceed a single device.

---

## Why "tok/s" is two numbers, not one

When someone says "this model runs at 50 tok/s," ask them which kind. There are two:

- **Prefill tok/s** (time to first token, TTFT, prompt eval rate). How fast the model can ingest your prompt. Compute-bound. High numbers, typically 1,000-10,000+ on Spark.
- **Decode tok/s** (output generation rate, eval rate). How fast the model can produce new tokens. Memory-bandwidth-bound. Lower numbers, typically 5-100 on Spark depending on model size and quantization.

If your workload is "long prompt, short answer" (RAG, summarization), prefill speed dominates user-perceived latency.

If your workload is "short prompt, long answer" (coding, essay generation), decode speed dominates.

If your workload is "long prompt, long answer" (agentic, complex tasks), both matter.

Ollama reports both. So does vLLM. Looking at the actual numbers Ollama published for Spark:

| Model | Prefill | Decode |
|---|---|---|
| llama3.1 8B q4_K_M | 7,614 tok/s | 38 tok/s |
| gpt-oss 20B MXFP4 | 3,224 tok/s | 58 tok/s |
| deepseek-r1 14B q4_K_M | 5,919 tok/s | 20 tok/s |

Notice the prefill numbers are ~200x bigger than the decode numbers. Same hardware, same model, in the same second. That's the difference between compute-bound and memory-bandwidth-bound work.

---

![Diagram 8: The two tok/s numbers explained](/img/blog/day-2-anatomy-of-an-llm-inference-request-from-prompt-to-answer-step-by-step/d2-7-two-toks-numbers.png)

---

## Putting it together: a real request trace

Say you send a 500-token prompt to Llama 3.1 8B Q4 on a Spark, and ask for a 200-token completion.

| Phase | Work | Time |
|---|---|---|
| Tokenize | CPU turns text into 500 integers | ~1 ms |
| Prefill | GPU reads model, computes K/V for all 500 tokens | 500 / 7614 = **66 ms** |
| Decode | GPU generates 200 tokens, one at a time, reading model each time | 200 / 38 = **5.26 s** |
| Detokenize | CPU turns integers back to text | ~1 ms |
| **Total** | | **~5.3 seconds** |

The user perceives "I waited 66ms for the first character, then it streamed in at ~38 tok/s." That's **time-to-first-token (TTFT) = 66 ms** and **output rate = 38 tok/s**.

Now imagine the same prompt at 16 concurrent users with vLLM batching. TTFT is roughly the same (66 ms each). For an actual measured comparison, the same Spark serving Qwen2.5-3B BF16 jumps from 26 tok/s single-user to **477 tok/s aggregate at c=16** *[my measurement, captured 2026-05-21]*. For Gemma 4 31B NVFP4 the comparable jump is 6 → 92 tok/s aggregate. **You serve 16 users in roughly the same wall time as one** - the exact multiplier depends on the model, but the shape always holds.

That's the local LLM serving game.

---

![Diagram 9: A real request timeline](/img/blog/day-2-anatomy-of-an-llm-inference-request-from-prompt-to-answer-step-by-step/d2-8-request-timeline.png)

---

## What this means for picking hardware

If you've followed this far, you understand the hardware question.

The single most important spec for LLM inference on a workstation isn't tensor core peak FLOPS. It's **memory bandwidth**. A B200 with 8 TB/s blows away a Spark's 273 GB/s on decode. An RTX 5090 with 1,792 GB/s beats a Spark too, but only on models that fit in its 32 GB.

The Spark's pitch: **you trade some bandwidth for a lot of capacity.** 128 GB at 273 GB/s lets you run 70B-class and 120B-class models that simply won't fit on a 5090. The decode is slower per user. The capacity is unmatched at this price.

We open the Spark itself in the next post. By the time we get to inference-engine selection (Day 5) and the leaderboard (Day 6), you'll have the full picture.

---

![Diagram 10: Memory bandwidth vs capacity, the hardware tradeoff](/img/blog/day-2-anatomy-of-an-llm-inference-request-from-prompt-to-answer-step-by-step/d2-9-bandwidth-vs-capacity.png)

---

## What's coming on Day 3

In the next post we look at what's actually inside the GB10 Grace Blackwell Superchip. The Grace ARM CPU, the Blackwell GPU, the C2C link between them, the unified memory architecture, the sm_121 instruction set (and why it's NOT the same as datacenter Blackwell's sm_100), the 5th-generation tensor cores that execute NVFP4 natively, and the practical implications of all of it.

You'll come out understanding why a 4-bit format you've never heard of (NVFP4) is the most important thing to know about this chip.

See you in the next post.

---

*References for this post: [Ollama: NVIDIA DGX Spark performance](https://ollama.com/blog/nvidia-spark-performance) for the published prefill and decode numbers, [vLLM documentation](https://docs.vllm.ai) for batching and KV cache concepts, [Frank Denneman: Understanding Unified Memory on DGX Spark](https://frankdenneman.ai/posts/2026-03-23-understanding-unified-memory-dgx-spark-nemoclaw-nemotron/). The concurrency sweep tables are from my own measurements on this Spark on 2026-05-21 (Gemma 4 31B IT NVFP4 + Qwen2.5-3B BF16 via vLLM at max_tokens=512). An earlier 2026-05-08 sweep had a concurrency-label drift; the 2026-05-21 values are canonical.*
