---
title: "How multi-GPU LLM inference actually works: prefill, decode, and the all-reduce tax"
seoTitle: "How multi-GPU LLM inference actually works: prefill, decode, and the all-reduce tax"
seoDescription: "Part two of running a big LLM across multiple GPUs: how tensor, pipeline and expert parallelism split a model, why splitting a layer speeds up prefill but costs an all-reduce per layer, and why NVLink decides which method wins. With measured numbers from a 235B model on four RTX PRO 6000 cards."
datePublished: 2026-09-01T10:00:00.000Z
slug: how-multi-gpu-llm-inference-actually-works
author: shubham-katara
authors: ["shubham-katara", "saiyam-pathak"]
cover: /img/blog/running-a-big-llm-across-multiple-gpus-with-vllm/cover.png
tags: ["vllm", "gpu", "nvidia", "llm", "platform-engineering"]
draft: true
---

<!--
DRAFT SEED. Not ready to publish. This file is the recovered deep-dive track from
part one, dropped in as raw material in the order it was originally written.

The agreed restructure has NOT been applied yet. Target spine, in order:

  1. The machine and the model, condensed, keeping the `nvidia-smi topo -m` output
     showing SYS on every GPU pair. It is the setup for the NVLink punchline now,
     not background.
  2. Inference is two jobs (currently Deep dive 2). Prefill reads the whole prompt
     at once and is compute-bound, setting time to first token. Decode emits one
     token at a time and is memory-bandwidth-bound, setting tokens per second.
  3. What tensor parallelism does to one layer (currently Deep dive 4, needs
     expanding). Each GPU holds a column-slice of the weight matrix and the SAME
     full input activation goes to every GPU, so each card runs a matmul a quarter
     as wide: a quarter of the arithmetic, four at once. Megatron's column-then-row
     pairing is why you need one all-reduce summing partials per block rather than
     an all-gather in the middle.
  4. The prefill tax. Each all-reduce during prefill carries the entire prompt's
     activations, ~8 MiB at 1024 tokens, against ~8 KiB for a single decode token.
     188 of them per forward pass, strictly serialised.
  5. Where NVLink lands. No NVLink means that traffic crosses PCIe and the socket
     link, the tax exceeds the compute win, and PP beat TP on TTFT by 15%
     (3,233 ms vs 2,735 ms). NVLink is the variable that flips it.
  6. Decode. Payload collapses to one token, the tax nearly vanishes, and TP's
     bandwidth advantage dominates: 507 vs 296 tok/s, 70% faster than PP.
  7. Then the rest: memory and the KV cache, MoE and expert parallelism, why the
     KV head count caps how wide you can split, and the full proof tables.

Framing to hold throughout: the split matmul is the win, the all-reduce is the
tax, and NVLink decides which one dominates. Do not claim TP improves TTFT
outright; on this hardware it lost that metric, and explaining why is the point.

Also still to do:
  - Condensed machine-and-model section (see item 1) is not in this file yet.
  - Optional new animation contrasting all-reduce payload in prefill vs decode.
  - Once part one merges, convert its plain-text "part two" forward references
    into real links to this slug.
-->

This is part two of [running a big LLM across multiple GPUs with vLLM](/blog/running-a-big-llm-across-multiple-gpus-with-vllm). Part one is the runbook: eight steps from downloading a 236 GB model to serving it across four GPUs. It deliberately skipped the machinery. This post is the machinery.

No root access is required, and nothing here is needed to operate the server. When people say "split the model across GPUs" they could mean three genuinely different things, and mixing them up is the source of most confusion about multi-GPU performance. By the end you will be able to look at any benchmark table and know which of the three splits produced it, and why the winner won.

## Deep dive 1: Where the memory really goes

Step 2 gave you the fit-check recipe; here is what is behind it. A model is mostly a big pile of numbers called **parameters** or **weights**, and the weights are the easy part: parameters times bytes-per-parameter, fixed and known in advance. The interesting tenant in GPU memory is the KV cache.

Every token the model reads or writes leaves behind a key and a value at every layer (the `2` in the formula), and those records have to be kept for as long as the request is alive, because decode rereads all of them to produce each new token. The per-token cost is set entirely by the architecture: 94 layers, 4 KV heads, head dimension 128, kept in BF16 at 2 bytes:

```
2 x 94 x 4 x 128 x 2 = 192,512 bytes = 188 KiB per token
```

188 KiB does not sound like much. But this model supports a 262,144 token context, so one single conversation at full length would need `262,144 x 188 KiB`, which is about **47 GiB**. That is half a GPU for one user.

Serving ten users at once with long prompts is where all your leftover memory goes, and it is why "the weights fit, so I am fine" is wrong, and why the runbook caps `--max-model-len` at 32,768 rather than letting one request hold 47 GiB hostage.

Two consequences worth carrying forward. First, a model's conversation capacity is an architectural property, not just a memory-size property: this model's 4 KV heads make its cache unusually cheap per token.

Second, whichever way you split the model across GPUs, what happens to this cache (divided, duplicated, or taxed) matters as much as what happens to the weights. Keep that question in mind through the next four sections.

### A side note on the shard files

If you followed part one, the weights arrived as 24 files of about 10 GB each. Part one told you not to spend time on that number; here is the number.

There is no formal standard, but there are firm conventions. The Hub's guidance is to split large files into chunks under 200 GB, with 500 GB as the hard limit for a single file, for two practical reasons: a failed download of a smaller file resumes cheaply, and the CDN does not cache huge files, so one 236 GB file would genuinely download slower than 24 pieces of it. What publishers actually pick sits far below those limits. Our model uses a 10 GB cap: 23 shards of exactly 10.00 GB and a 24th holding the remaining 6.45 GB, for 236.45 GB in total.

Worth knowing what is actually inside one of those files too, because it is not what most people guess.

One thing the shard files do **not** line up with is the model's structure. The saver walks through the weights and fills each file to the 10 GB cap, then starts the next one, paying no attention to where a layer begins or ends. So no file contains "layers 1 to 4"; a file contains whatever bytes landed in it, and a single layer's pieces can straddle two files.

If you want a feel for the volume anyway: one layer of this model weighs about 236 GB / 94 = 2.5 GB in FP8, so each 10 GB file holds about four layers' worth of material, the way a moving box holds "one shelf's worth of books" without holding any particular shelf. That is exactly why the download ships with an index file, `model.safetensors.index.json`, mapping every piece to its file: without it, nobody would know where anything landed.

## Deep dive 2: Inference is two jobs

Before splitting anything, it helps to know what the work being split actually is, because inference is really two different jobs wearing one coat. Almost everything confusing about multi-GPU performance comes from this split.

### Phase one: prefill, reading your prompt

When your prompt arrives, the model has to read all of it. If you send 1,000 tokens, all 1,000 go through every layer **at once**, as one big batch of work. This is called **prefill**, and it is the phase that decides your time to first token.

Prefill is _compute-heavy_. There is a lot of arithmetic to do and the GPU's matrix engines are the bottleneck. It also produces the keys and values for every one of those 1,000 tokens, which get written into the KV cache and kept.

One more thing becomes true once the model is split over several GPUs: prefill is also the phase where the GPUs send each other the most data, because every exchange between them carries your whole prompt rather than a single token.

That makes prefill the phase most sensitive to how fast the link between the GPUs is. Our machine has no NVLink, so its GPUs talk over the slower PCIe path, and the measurements later show the bill for that: the splitting method that talks the most lost time to first token, and the method that barely talks won it.

### Phase two: decode, writing the answer

Then the model writes its reply, and here is the part that surprises people: **it can only produce one token at a time.** To write token 2 it needs to have written token 1, because it feeds its own output back in. There is no way around that, it is what "autoregressive" means.

So decode is a loop. Each pass through it produces exactly one token, reads the entire KV cache built so far, and appends one more entry to that cache.

Decode is _memory-heavy_ rather than compute-heavy. For a single token there is barely any arithmetic to do, but the GPU still has to stream the relevant weights and the whole KV cache past its compute units.

The bottleneck is memory bandwidth, not maths. That is why decode speed tracks memory bandwidth so closely, and why giving a single request more GPUs to read from in parallel actually helps.

Two phases, two different bottlenecks, and they respond differently to everything you tune:

|                         | Prefill                     | Decode                  |
| ----------------------- | --------------------------- | ----------------------- |
| Work per step           | your whole prompt at once   | exactly one token       |
| Bottleneck              | compute                     | memory bandwidth        |
| Metric it drives        | time to first token         | time per output token   |
| Data moved between GPUs | large, whole prompt's worth | tiny, one token's worth |

That last row is the one to hold on to. It is the reason, later, that pipeline parallelism wins on first-token latency while tensor parallelism wins on tokens per second. The same all-reduce that is trivially cheap during decode is expensive during prefill, because it is carrying a thousand times more data.

### How the server juggles many users

A real server is not doing one request at a time. vLLM uses **continuous batching**, which means it does not wait for a batch to fill up or finish. On every step it looks at everything currently in flight and assembles whatever work is ready, so a request that arrives mid-flight joins the very next step rather than queueing behind a whole batch.

Two consequences worth knowing:

- **Prefill and decode get mixed together.** A step might carry one user's fresh 1,000-token prompt alongside twenty other users' single decode tokens. That mixing is why a burst of long prompts makes everyone else's tokens arrive more slowly, and it is why `--max-num-batched-tokens` exists as a lever.
- **Capacity is set by the KV cache, not by CPU or queue length.** Every in-flight request is holding cache proportional to its length. When the cache is full, vLLM has to **preempt** somebody: it evicts a request's cache and recomputes it later. That is the real meaning of the `Maximum concurrency` line in part one's startup log.

Now that the work itself is clear, let's look at the three ways to spread it over more than one GPU.

## Deep dive 3: The three ways to split

Here is the heart of it. An analogy first, because it makes the rest much easier to hold in your head. Imagine a large restaurant kitchen that has to produce one dish:

- **Tensor parallelism** is four chefs all working on the same dish at the same time, one chopping, one on sauce, one on protein, one plating. They constantly have to coordinate, but the dish is done fast.
- **Pipeline parallelism** is four chefs at four stations, where the dish moves down the line. Station two cannot start until station one is finished. Very little talking, but three chefs are idle at any moment unless you have several dishes in flight.
- **Expert parallelism** is a kitchen with 128 specialist chefs where each dish only needs 8 of them. You spread those 128 chefs across four rooms, and each dish gets walked to whichever rooms hold the specialists it needs.

{{multi-gpu-split-modes-animation}}

All three can be combined, and in production they usually are. Now let's look at the two interesting ones up close.

## Deep dive 4: Tensor parallelism, up close

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

You can check it against the real run. The whole-model cache costs 188 KiB per token, so at TP=4 each card keeps one of the 4 KV heads and pays 47 KiB per token. Divide the 27.85 GiB of cache memory from part one's startup log by 47 KiB and you predict 621,337 tokens of capacity. vLLM printed 621,392. When a mental model predicts a five-significant-figure log line, you can trust the mental model.

### Why this is the split that hates networks

Those 188 all-reduces are also the reason tensor parallelism is the wrong tool the moment your GPUs stop sharing a chassis. Putting a network between them makes things worse whichever split you pick; the question is how badly, and the answer comes down to how often each split has to talk.

Tensor parallelism makes all four GPUs stop and compare notes twice in every layer, which is 188 times for our 94 layers, and during prefill each of those exchanges carries the whole prompt: roughly 2 GB of traffic to answer one 1,024-token request. Pipeline parallelism hands the work forward once per stage boundary, so 3 times, moving about 24 MB. Same answer, about ninety times less traffic, and 3 round trips instead of 188.

Over a fast link inside one machine those 188 exchanges are cheap enough to be worth it, which is why tensor parallelism wins in our measurements. Over an ordinary network they are not. That is also why most multi-machine setups run both at once: tensor parallelism inside each box, where the GPUs have a fast link between them, and pipeline parallelism between boxes.

The arithmetic behind those figures, for anyone who wants to redo it with their own model. The boundary activation tensor is `1024 x 4096 x 2 = 8 MiB`. A ring all-reduce moves about `2(N-1)/N` of the tensor per GPU, so roughly 12 MiB at TP=4, and `188 x 12 MiB` is about 2.2 GiB per prefill. Pipeline parallelism sends that same 8 MiB tensor across 3 stage boundaries, so about 24 MiB. During decode the payload collapses to `1 x 4096 x 2 = 8 KiB`, but the 188 round trips do not collapse: at a 50 microsecond round trip that is about 9.4 ms of pure latency per token, against the 17.14 ms per token we measured on PCIe.

## Deep dive 5: The expert part

Our model is a **mixture of experts**, and this is the single biggest idea in how large models are served today, so it is worth slowing down for.

In an ordinary model, every parameter is used for every token. In a mixture-of-experts model, each layer contains many small networks called **experts**, and a tiny component called a **router** decides which few of them each token should visit. Our model has **128 experts per layer** and the router picks **8** of them per token.

So the model holds 235B parameters in memory, but only about 22B of them do any arithmetic for a given token. That is what "235B-A22B" means, and it is why this model runs far faster than its size suggests. You pay for the full 235B in memory and you pay for only 22B in speed.

{{moe-expert-routing-animation}}

This gives you a third way to split. Instead of slicing every expert into strips, you hand out whole experts: with 128 experts and 4 GPUs, each GPU keeps 32 of them intact. That is **expert parallelism**, and in vLLM you switch it on with `--enable-expert-parallel`.

The trade is different from tensor parallelism. Nothing needs adding up at the end, but tokens have to travel to whichever GPU owns the expert they were routed to, and the answers travel back. It also has a fairness problem: the router does not promise to spread work evenly, so one GPU can end up with more popular experts and become the slow one holding everybody up.

## Deep dive 6: Why you cannot split forever

Step 3 gave you the rule as a checklist item; here is the reasoning underneath it.

Attention heads are computed whole: Deep dive 4 showed each GPU owning 16 complete heads and finishing them alone. A head cannot be half on one GPU and half on another without turning every attention step into a network call, so vLLM refuses to try: **your tensor parallel size must divide the head counts** in `config.json` (shown in full in Step 3).

For our model the arithmetic lands like this. `num_attention_heads` is 64, which divides generously: 2, 4, 8, 16 all work. But `num_key_value_heads` is **4**, and that is the binding constraint: at `-tp 4` each GPU holds exactly one KV head, and at `-tp 8` there are not enough to go around, so vLLM has to duplicate them across GPUs, which costs memory and erodes exactly the cache-division bonus that made tensor parallelism attractive in Deep dive 4. Meanwhile `num_experts` is 128, divisible by 4 and 8 alike, which is why expert parallelism has more freedom than tensor parallelism on this model.

That is the real lesson: **the KV head count, not the parameter count, usually decides how wide you can go.** Grouped-query attention (few KV heads shared by many attention heads) is what makes modern models cheap to cache, and the same design choice is what caps their tensor-parallel width. The cheapness and the cap are the same number. Break the rule and vLLM fails in about a second, [with the exact error shown in Step 8](/blog/running-a-big-llm-across-multiple-gpus-with-vllm#step-8-errors-you-will-actually-hit).

## Deep dive 7: The proof

Theory is cheap, so we measured it: all three splits, same model, same 4 GPUs, same benchmark: vLLM's own, 1024 tokens in and 256 out, run at one request at a time and again with 32 in flight, because those two regimes behave completely differently and a configuration that wins one can lose the other. The exact commands are in [Step 7](/blog/running-a-big-llm-across-multiple-gpus-with-vllm#step-7-benchmark-it-and-what-we-would-run).

### The memory side

|                        | TP=4                | TP=4 plus EP        | PP=4                              |
| ---------------------- | ------------------- | ------------------- | --------------------------------- |
| Weights per GPU        | 55.19 GiB           | 55.19 GiB           | 55.70 GiB                         |
| KV cache per GPU       | 27.85 GiB           | 27.96 GiB           | 26.84 GiB                         |
| Total KV cache         | 621,392 tokens      | **623,696 tokens**  | 555,680 tokens                    |
| Max concurrency at 32k | 18.96x              | **19.03x**          | 16.96x                            |
| GPU memory used        | 88,211 MiB on all 4 | 88,209 MiB on all 4 | 84,283 / 87,899 / 87,899 / 84,507 |

Two things to pull out of that table.

**Expert parallelism did not save memory.** It moved 0.37% of extra room into the cache, which is noise. If you were hoping expert parallelism would let you fit a model that otherwise does not fit, this is your warning that it will not.

**Pipeline parallelism cost us 11.8% of the cache**, dropping from 621,392 tokens to 555,680, because a pipeline needs extra buffers for the activations travelling between stages, and that comes straight out of your conversation capacity.

Look at the last row too. Under tensor parallelism all four cards sat at **exactly 88,211 MiB**, the same number on every one of them. Under pipeline parallelism they ranged from 84,283 to 87,899 MiB, about 3.6 GB apart, because a layer split cannot be perfectly even when 94 layers go over 4 GPUs and the ends of the model are not symmetric: the first stage carries the token embedding and the last carries the output head. That evenness check is the quickest sanity test you have that a tensor-parallel split is behaving.

### The speed side

| Measurement                             | TP=4         | TP=4 plus EP | PP=4         | Winner             |
| --------------------------------------- | ------------ | ------------ | ------------ | ------------------ |
| Median time per token, 1 request        | **17.14 ms** | 18.83 ms     | 21.19 ms     | TP                 |
| Output tokens/sec, 32 requests          | **507.09**   | 470.93       | 296.48       | TP, by 70% over PP |
| Median time to first token, 32 requests | 3,233 ms     | 3,705 ms     | **2,735 ms** | PP, by 15%         |
| Benchmark duration, 32 requests         | **65.06 s**  | 69.58 s      | 110.52 s     | TP                 |

Tensor parallelism won nearly everything, and the size of one gap deserves attention: at 32 concurrent requests it produced **70% more tokens per second than pipeline parallelism**. That is not a rounding error, that is a different class of performance, and it lines up exactly with the theory from Deep dive 3. Tensor parallelism has all four GPUs working on every token. Pipeline parallelism has each GPU working on a different request's stage, and with only 32 requests spread over 4 stages there is not enough in flight to keep everyone busy, so cards sit idle waiting for their turn. Its median time per token was 24% worse for the same reason.

**Pipeline parallelism did win one thing, and it is the one theory predicts:** time to first token, by 15%. Processing your 1024-token prompt is where tensor parallelism's chatter gets expensive, because each of those 188 all-reduces is carrying the whole prompt's worth of data rather than a single token's. Pipeline parallelism just hands one activation tensor to the next stage and skips all of it. If your users judge you on how fast the first word appears, that is a real and measurable advantage. This is the two-jobs split from Deep dive 2 showing up in a table: prefill moves a lot of data between GPUs, decode moves almost none, so the talkative strategy pays during prefill and collects during decode.

That is not a knock on expert parallelism, and it is important not to over-read it. Expert parallelism exists to solve a problem we do not have here: models so large that even a tensor-parallel split cannot hold all the experts, and clusters big enough that duplicating experts everywhere would be wasteful. With 4 GPUs and a model that already fits, we are asking it to do a job it was not designed for, and paying an extra network hop per token for nothing; here it cost 7% and returned nothing. On a 32 or 64 GPU deployment of a trillion-parameter model the answer would very likely flip.

### The number we threw away, and why

Being straight about this because it is a good lesson in reading your own benchmarks. The very first expert-parallel run at one-request-at-a-time reported **28.71 output tokens per second**, which would have made expert parallelism look catastrophic. It was not real. Look at the two TTFT figures from that run:

```
Mean TTFT (ms):    3987.38
Median TTFT (ms):   265.56
```

A mean fifteen times the median means one request behaved completely differently from the other eleven. One request stalled for about 45 seconds, almost certainly a one-off kernel compilation on the first pass through a code path, and that single stall stretched the whole benchmark from 63 seconds to 107 seconds. Since throughput is just tokens divided by wall-clock, one stall wrecked the headline number.

This is why the table above uses **median time per token** as the decode measurement rather than aggregate throughput. Median per-token latency does not care that one request had a bad start.

One more benchmarking trap while we are here. When we re-ran that same benchmark on the warm server, time to first token dropped from 265 ms to **61 ms**, which looks like a wonderful improvement and is actually meaningless: vLLM caches prompt prefixes by default, and we had just sent it those exact prompts with the same `--seed 42`. If you are comparing configurations, either vary the seed or turn prefix caching off, otherwise your second measurement is mostly measuring your cache.
