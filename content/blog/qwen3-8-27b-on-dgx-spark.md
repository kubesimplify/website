---
title: "Running Qwen3.8-27B on DGX Spark"
seoTitle: "Running Qwen3.8-27B on DGX Spark"
seoDescription: "Qwen3.8-27B on DGX Spark with llama.cpp, Ollama, vLLM, and SGLang: the recipes, the tokens per second I measured, MTP speculative decoding, and the sharp edges nobody mentions."
datePublished: 2026-08-17T14:00:00.000Z
slug: qwen3-8-27b-on-dgx-spark
author: saiyam-pathak
cover: /img/blog/qwen3-8-27b-on-dgx-spark/cover.png
tags: ["qwen", "dgxspark", "nvidia", "ollama", "vllm"]
---

Qwen announced the 3.8 family on August 3: Qwen3.8-Max, the 2.4T flagship, plus a promise that open weights were coming "next week". The Max weights (2.4T-A95B) landed August 12. The one everyone actually wanted for local inference, the 27B, went quiet. Trackers even reported it as delayed with no new date.

It dropped on August 14. I had it running on the DGX Spark within the hour, so here is the full recipe, what worked on day zero, what did not, and the numbers. Let's get into it.

Everything below was run on my DGX Spark (GB10, 128GB unified memory, DGX OS, driver 580.159.03) on August 14-15, 2026 with llama.cpp build b10423, the spark-arena vLLM nightly (0.27.2rc1), Ollama v0.32.12, SGLang latest-cu130, and llama-benchy 0.4.0 for the load tests. Checkpoint revisions: Qwen/Qwen3.8-27B-FP8 at 017b9c7a (the launch upload, unchanged since), unsloth GGUF at 4604b899, unsloth NVFP4 at 60e813d4 for the day-zero runs and 7d6f8d4d for the MTP runs. unsloth updated both quants after launch, so I re-benchmarked the updated revisions: 11.9 t/s single-stream on both, within 3% of the numbers below, nothing material changed.

Every measurement in this post came from one of these four commands, so you can rerun any table row yourself:

```bash
# llama.cpp raw numbers (pp512/pp2048/tg128/tg32 tables)
docker run --rm --gpus all -v $HOME/models/qwen38:/root/.cache/huggingface \
  --entrypoint /app/llama ghcr.io/ggml-org/llama.cpp:server-cuda \
  bench -m <path-to>/Qwen3.8-27B-UD-Q4_K_XL.gguf -fa 1 -p 512,2048 -n 128,32

# vLLM and SGLang numbers (all pp2048/tg128 tables, any depth/concurrency)
uvx llama-benchy@0.4.0 --base-url http://<spark-ip>:8000/v1 --model <served-model> \
  --pp 2048 --tg 128 --depth 0 16384 32768 --concurrency 1 2 5 10 \
  --enable-prefix-caching --save-result results.csv --format csv

# Ollama numbers (from Ollama's own eval counters, temperature 0, 3 runs)
curl -s http://127.0.0.1:11435/api/generate -d '{"model":"qwen3.8:27b",
  "prompt":"<prompt>","stream":false,"options":{"temperature":0,"num_predict":200}}' \
  | jq '{prompt_tok:.prompt_eval_count, prompt_ns:.prompt_eval_duration, gen_tok:.eval_count, gen_ns:.eval_duration}'

# Edit-heavy vs fresh-generation workload comparison (DSpark section)
python3 edit_bench.py http://127.0.0.1:8002/v1 qwen3.8-27b   # from 0xBakeer's repo, bench/
```

## What Qwen3.8-27B actually is

Reading the config before running things saves a lot of confusion, and this one is interesting:

- 27B parameters, and it is NOT a MoE. 64 layers with a hybrid attention pattern: every 4th layer is full gated attention, the other 48 layers are Gated DeltaNet (linear attention). Same hybrid lineage as Qwen3.5/3.6.
- Native vision language model. There is a 27-layer vision encoder in the checkpoint, images and video in, text out.
- 262,144 token native context, extensible to 1M with YaRN.
- Thinking mode on by default (`<think>` blocks), with recommended sampling temp 1.0 / top_p 0.95 / top_k 20. Non-thinking: temp 0.7 / top_p 0.80.
- Apache 2.0.
- Architecture class is `Qwen3_5ForConditionalGeneration` (`model_type: qwen3_5`). This detail matters: it is the same architecture family the inference engines already support, which is why day-zero support mostly just works.

Qwen's own (vendor-reported, so calibrate accordingly) numbers for the 27B: SWE-bench Pro 61.7, LiveCodeBench v6 90.3, Terminal Bench 2.1 at 73.0, GPQA Diamond 89.2, OSWorld-Verified 84.3.

## What works on the Spark on day zero

| Path | Status on day zero |
|---|---|
| llama.cpp + unsloth GGUF | Works (build b10423, vision mmproj included) |
| vLLM + official FP8 checkpoint | Works via nightly container (recipe below) |
| Ollama | Works, needs v0.32.12 (released the same day) |
| SGLang | Works on upstream latest; the older pinned dev container silently produced garbage (see below) |
| TokenSpeed | Official recipe exists, not tested here |

## The llama.cpp path (fastest way to first token)

Let's start with the fastest way to first token. One command, and the server pulls the GGUF straight from Hugging Face:

```bash
docker run -d --name qwen38-llamacpp --gpus all -p 8091:8091 \
  -v $HOME/models/qwen38:/root/.cache/huggingface \
  --entrypoint /app/llama-server \
  ghcr.io/ggml-org/llama.cpp:server-cuda \
  -hf unsloth/Qwen3.8-27B-GGUF:Q4_K_XL \
  --port 8091 --host 0.0.0.0 -ngl 99 -c 32768 -fa on
```

Two gotchas I hit so you do not have to:

1. Recent llama.cpp downloads `-hf` models into the Hugging Face hub cache (`/root/.cache/huggingface`), not the old `/root/.cache/llama.cpp` path. Mount the right one or your 18GB download disappears with the container.
2. The GGUF repo ships `mmproj-BF16.gguf` alongside the weights (llama.cpp pulled it automatically), so the vision path is wired up for llama.cpp as well. I test it below.

First token arrives fast and the model correctly identified what it was running on (a nice recursive moment: Qwen3.8-27B on a DGX Spark explaining what a DGX Spark is).

The `llama-bench` numbers (build b10423, flash attention on, UD-Q4_K_XL, 16.68 GiB weights):

| Test | Result |
|---|---|
| pp512 (prefill) | 838.6 t/s |
| pp2048 (prefill) | 837.4 t/s |
| tg128 (decode) | 11.6 t/s |
| tg32 (decode) | 11.6 t/s |

Let me be honest about that decode number, because this is where dense models and the Spark have a complicated relationship. The GB10's unified memory is the whole reason a 27B fits comfortably, but its ~273 GB/s of bandwidth is the ceiling for decode on any dense model: every generated token has to stream all 16.7GB of weights. 11.6 t/s is close to what the hardware can physically do at this quant size. If you have been running MoE models like Nemotron 3.5 Lightning (30B but only ~3B active) on the Spark and got used to 100+ t/s decode, recalibrate: this is a real dense 27B, all parameters working on every token.

Prefill is a different story: 838 t/s means a 2,000 token prompt is processed in under 2.5 seconds, and the hybrid DeltaNet layers keep that roughly flat as context grows.

Fun detail: llama-bench identifies the model as "qwen35 27B" because the GGUF carries the `qwen3_5` architecture tag, which is exactly why it worked in llama.cpp on day zero with no code changes.

## The vLLM path (best throughput)

Now let's do it properly with vLLM. No official Spark Arena recipe existed for Qwen3.8 when it dropped (the model was hours old), but the `@official/qwen3.6-27b-fp8-vllm` recipe is the same architecture family, so I adapted it. This is the part I want to highlight about the Spark ecosystem right now: [sparkrun](https://sparkrun.dev) recipes made a day-zero model a config-file edit, not an afternoon of dependency fighting.

```yaml
recipe_version: '2'
model: Qwen/Qwen3.8-27B-FP8
runtime: vllm
container: ghcr.io/spark-arena/dgx-vllm-eugr-nightly:latest
defaults:
  gpu_memory_utilization: 0.8
  max_model_len: 131072
  max_num_batched_tokens: 32768
  load_format: instanttensor
  kv_cache_dtype: fp8
  attention_backend: flashinfer
  tool_call_parser: qwen3_coder
  reasoning_parser: qwen3
env:
  VLLM_MARLIN_USE_ATOMIC_ADD: '1'
```

Then:

```bash
uvx sparkrun run ./qwen38-27b-fp8-vllm.yaml
```

The official FP8 checkpoint is 29GB, `instanttensor` loads the weights in under 5 seconds once cached, and FlashInfer picks the `xqa` decode backend on sm121 with FP8 KV cache. Changes from the 3.6 recipe: I dropped the qwen3.6-specific chat template mods (3.8 ships a correct template) and set `max_model_len` to 128K, which is plenty while leaving KV headroom.

The numbers, measured with [llama-benchy](https://pypi.org/project/llama-benchy/) 0.4.0 (the same tool Spark Arena standardizes on), pp2048/tg128 at depth 0:

| Concurrency | Prefill pp2048 (t/s) | Decode tg128 aggregate (t/s) | Decode per request (t/s) |
|---|---|---|---|
| 1 | 1,914 | 8.2 | 8.2 |
| 2 | 1,305 | 16.1 | 8.2 |
| 5 | 540 | 36.3 | 7.8 |
| 10 | 627 | 57.9 | 7.2 |

Two things jump out:

1. vLLM's prefill is 2.3x llama.cpp's (1,914 vs 837 t/s). The FlashInfer path on sm121 is doing its job.
2. vLLM's single-stream decode (8.2 t/s) is SLOWER than llama.cpp's (11.6 t/s). This is not a vLLM problem, it is arithmetic: the FP8 checkpoint streams 28.75GB per token, the Q4_K_XL GGUF streams 16.7GB. On a bandwidth-bound box the smaller quant wins single-stream, always. What vLLM buys you is batching: 10 concurrent requests get 57.9 t/s aggregate, because one weight-streaming pass now feeds 10 tokens instead of 1.

So the honest serving decision tree on a Spark: single user chatting → llama.cpp with the smallest quant you can tolerate quality-wise. Serving a team or agents in parallel → vLLM FP8.

### The long-context concurrency wedge (day-zero honesty)

Not everything works yet. When I pushed 10 concurrent requests at 32K context depth, the engine effectively wedged: requests admitted one at a time, prefill bursts healthy at ~3,277 t/s, but aggregate generation collapsed to 0.2-0.6 t/s and sat there. It had not crashed, it was just stuck. Short-context concurrency: fine. Single-stream: fine (numbers below). Concurrent + deep context: pathological, at least in this nightly build with the hybrid DeltaNet architecture.

At low concurrency, deep context is actually where this architecture shines. Measured at 32,768 tokens of context depth:

| Config | Value |
|---|---|
| Prefill into 32K context (c=1) | 534-700 t/s |
| Decode at 32K context (c=1) | 7.9 t/s |
| Decode at 32K context (c=2, aggregate) | 15.1 t/s |

The decode number is the one to notice here: 8.2 t/s at zero context, 7.9 t/s at 32K context, a 4% drop. On a conventional full-attention model the KV cache reads grow with context and decode sags noticeably; here 48 of the 64 layers are linear attention with constant-size state, so decode speed is nearly flat in context depth. For long-document and agentic workloads on local hardware, that flatness matters more than the headline number.

This is what day zero actually looks like: the happy paths work because the architecture class was already supported, and the corner cases (linear-attention state management under concurrent long-context load) still need the engines to catch up. If you are evaluating this model for production serving, test YOUR context/concurrency profile before committing.

## NVFP4: the best-numbers recipe

GB10 is a Blackwell chip, and Blackwell has native FP4 tensor cores, so the natural question is whether the NVFP4 quant (unsloth/Qwen3.8-27B-NVFP4, ~16GB) buys real speed. Same recipe as above with the model swapped, and FlashInfer autotuned 46 fp4_gemm kernel configs on first boot. It does:

| Concurrency | Prefill pp2048 (t/s) | Decode tg128 aggregate (t/s) | Decode per request (t/s) |
|---|---|---|---|
| 1 | 1,794 | 11.5 | 11.5 |
| 2 | 2,393 | 21.6 | 11.0 |
| 5 | 2,719 | 49.8 | 10.5 |
| 10 | 3,999 | 84.3 | 9.6 |

NVFP4 ties llama.cpp's single-stream decode (11.5 vs 11.6, both stream ~16GB of weights, the physics is consistent), and wins everything else: 84.3 t/s aggregate decode at concurrency 10 (46% over FP8's 57.9), and batched prefill that scales UP with concurrency to nearly 4,000 t/s where FP8's fell. If you serve this model on a Spark, NVFP4 is the recipe.

The quality tradeoff of 4-bit quantization is real and workload-dependent; benchmark your own evals before standardizing on it.

## Vision test: it read its own benchmark chart

The GGUF ships with the vision projector and llama.cpp loads it automatically, so I gave the model the benchmark chart you saw above, the one measuring the model itself, and asked what it shows. It correctly identified the hardware, both metric panels, every engine and quantization in the comparison, the color coding, and the footnote about bandwidth-bound decode. Then it started reading the exact numbers back to me.

There is something pleasingly recursive about a model reading a chart of its own decode speed at 11.3 t/s, which is the number on the chart. The image cost 1,470 prompt tokens, and vision decode runs at effectively the same speed as text.

## Spark Arena

The numbers in this post are reproducible: I submitted the NVFP4 run to [Spark Arena](https://spark-arena.com), the community leaderboard where GB10 owners run the same standardized llama-benchy profile (pp2048/tg128, depths 0 to 100K, concurrency 1/2/5/10) and publish results with the full recipe attached. Submission sub1786754097881, status Completed. Grab the recipe from the leaderboard and you should land on the same numbers.

Two full-grid results worth highlighting: decode at 100K context depth is still 9.8 t/s single-stream (15% below zero-context, at ONE HUNDRED THOUSAND tokens of context), and the 32K-deep concurrency-10 cell that wedged FP8 completed fine on NVFP4 at 63.1 t/s aggregate.

## The Ollama path (same-day support)

`ollama pull qwen3.8` failed all afternoon with "pull model manifest: file does not exist", and then Ollama shipped v0.32.12 the same day the weights landed, with qwen3.8 in the library: 27b tag, 18GB, 256K context, vision, thinking mode on by default. Older Ollama versions (including 0.32.11 from a day earlier) refuse the pull with a "requires a newer version" error, so upgrade first.

```bash
OLLAMA_HOST=127.0.0.1:11435 ollama pull qwen3.8:27b   # 18GB, Q4_K_M
```

Measured the same way as my previous Spark posts (temperature 0, 3 runs, numbers from Ollama's own eval counters):

| Metric | Result |
|---|---|
| Prefill (~2,200 token prompt, cold) | 731 t/s |
| Decode (200 tokens) | 26.5 t/s |

Wait. 26.5 t/s decode, when llama.cpp does 11.6 on the same-size Q4 and the bandwidth ceiling says ~16? The answer is in the model config Ollama ships: `draft_num_predict 4`, and the runner launches with `--spec-type draft-mtp`. The Ollama build of Qwen3.8 includes the model's multi-token prediction head and turns speculative decoding ON by default, so each weight-streaming pass validates up to 4 drafted tokens. Same trick their Nemotron builds used. The plain unsloth GGUF I benchmarked in llama.cpp does not carry the MTP head, so it pays full price per token.

That makes Ollama the single-stream champion of the day, and it did it with zero flags. Credit where due: they also default the context to 262K on this box (vram-based default) and the vision projector is wired up.

Here is the day-zero picture across all the engines in one chart (the vLLM MTP and SGLang numbers further down came later):

![Qwen3.8-27B on DGX Spark: measured prefill and decode across llama.cpp, Ollama, and vLLM](/img/blog/qwen3-8-27b-on-dgx-spark/chart.png)

One operational note: the GB10 needs Ollama's cuda_v13 runner. My first attempt loaded the model on 100% CPU (7.5 t/s decode) because of a botched duplicate server start, so check `ollama ps` says `100% GPU` before you trust any numbers.

## Unified memory sequencing lesson

The Spark's 121GB is unified, and CUDA sees all of it (124,609 MiB). That is the whole appeal, a 27B in bf16 fits without quantization. But it also means inference engines fight over the same pool: my vLLM launch failed with "Free memory 74.82/121.69 GiB is less than desired 0.8 utilization (97.35 GiB)" because the llama.cpp server was still resident. On a discrete-GPU box you would notice immediately; on unified memory it is easy to forget a container is holding 18GB. `docker ps` before you launch.

Also the eternal Spark reminder: `nvidia-smi` cannot report memory usage on GB10 (Not Supported), use `free -h`.

## Three days later: MTP arrives on vLLM, and finds a cliff

I sat on this post for a couple of days and the ecosystem moved fast, so here is the update. An official Spark Arena recipe landed with MTP speculative decoding for vLLM (`speculative_config {"method": "mtp", "num_speculative_tokens": 3}`), the same trick Ollama shipped on day one. The gains are real:

| Config | Single-stream tg128 | c10 aggregate |
|---|---|---|
| vLLM NVFP4 plain | 11.5 t/s | 84.3 t/s |
| vLLM NVFP4 + MTP | 22.0 t/s | 105.8 t/s |
| vLLM FP8 + MTP | 13.8 t/s | 55.8 t/s |
| Ollama Q4 (MTP default) | 26.5 t/s | n/a |

NVFP4 + MTP at 105.8 t/s aggregate is the best serving number anything has produced on my Spark. Ollama still holds single-stream.

Now the honest part, and please read this before you run the MTP recipes at long context: **twice in a row, the MTP config hard-rebooted my entire Spark** at exactly the same benchmark cell (16K context, 2 concurrent requests), once on FP8 and once on NVFP4. Not a container crash, a full machine reset, with the journal cut off mid-line and no panic trace, which points at a GPU/SoC lockup. The non-MTP configs ran the same cell and the full 28-cell grid for 6.5 hours without a hiccup. Environment: GB10, driver 580.159.03, kernel 6.17.0-1018-nvidia, the spark-arena vLLM nightly. Until this is understood, treat MTP on vLLM as short-context-only on this box. I will update here when I know more.

### SGLang joins the matrix (and teaches the scariest lesson)

SGLang was the last officially recommended engine I had not run, so I adapted the qwen3.5-27b-fp8 sglang recipe the same way. First attempt: the server came up healthy, answered every request, and produced complete token soup ("visit visit visits 訪...逻辑逻辑logic..."). Disabling the recipe's NEXTN speculative config changed nothing. The actual culprit was the pinned container image, an SGLang dev build created before Qwen3.8 existed: it loads the new checkpoint without a single warning and generates garbage. Swapping to upstream `lmsysorg/sglang:latest-cu130` fixed it instantly.

The scary part is that the health check was green and the API answered every request the whole time - a crash at least tells you something is wrong, silent garbage does not. If you inherit a recipe with a pinned image, coherence-test the output before you benchmark anything.

Numbers on the working upstream build (FP8, no speculation):

| Cell | SGLang | vLLM FP8 (for comparison) |
|---|---|---|
| Prefill pp2048 (c=1) | 1,225 t/s | 1,914 t/s |
| Decode tg128 (c=1) | 7.7 t/s | 8.2 t/s |
| Decode c=10 aggregate | 54.3 t/s | 57.9 t/s |
| Decode at 16K context (c=1) | 7.3 t/s | ~7.9 t/s |

Same shape as vLLM, a few percent behind everywhere on this build, and the same context-flatness.

Then I re-enabled NEXTN speculation (SGLang's MTP equivalent) on the working upstream build, and this is where SGLang earns its seat:

| Cell | SGLang FP8 | SGLang FP8 + NEXTN | vLLM FP8 + MTP |
|---|---|---|---|
| Decode tg128 (c=1) | 7.7 t/s | 13.4 t/s | 13.8 t/s |
| Decode c=10 aggregate | 54.3 t/s | 71.0 t/s | 55.8 t/s |
| Decode at 16K context (c=1) | 7.3 t/s | 10.3 t/s | 14.4 t/s |

Speculation on FP8 gives SGLang almost exactly vLLM's MTP single-stream number (same weights, same trick), and its speculative scheduler scales better under batch: 71 t/s aggregate at concurrency 10 where vLLM's MTP drops to 56. If you see people posting bigger SGLang numbers than mine from earlier in this post, this is why: speculation on versus off. The overall throughput crown still belongs to vLLM NVFP4+MTP, because the 4-bit quant halves the weight traffic that everything else queues behind. And for the record, SGLang with speculation survived the 16K single-stream cell that I tested; I deliberately did not run speculation at deep context plus concurrency, the combination that hard-rebooted the box twice under vLLM.

## The 75 tok/s post, reproduced

While I was sitting on this draft, a post by [@0xBakeer](https://x.com/0xBakeer) went around claiming 75 tok/s single-stream and 256 tok/s across 16 parallel requests, on the same model, on the same machine. My first reaction was that it contradicted everything above. It does not, and reproducing it taught me the most useful lesson in this post.

The lever is a dedicated draft model: "DSpark" (community-built, 5 layers, ~2.6GB) proposes blocks of tokens and the full model verifies them in one weight-read. Same speculative idea as MTP, but the drafter is 3x cheaper per guess. Their [recipe repo](https://github.com/0xBakeer/Qwen3.8-27B-FP8-on-a-single-DGX-Spark) is excellent, annotated flag by flag, so I ran it verbatim on my Spark (vLLM v0.27.1 stable, FP8, DSpark k=7):

| Workload | Their number | My Spark |
|---|---|---|
| Edit-heavy (98.5% draft acceptance) | 46.8 t/s | 45.0-48.6 t/s |
| Fresh generation (~30% acceptance) | n/a | 20.8 t/s |
| llama-benchy free-gen, single stream | n/a | 17.2 t/s |
| llama-benchy, 10 concurrent aggregate | n/a | 65.6 t/s |

Reproduced within noise. Their 75 t/s headline is the 4-bit checkpoint plus a deeper draft on the edit-heavy workload, and it is real too.

The lesson: speculative decoding's speedup is the drafter's acceptance rate, and acceptance is a property of YOUR WORKLOAD, not the model. The same server on the same box is 3.5x faster editing existing code (where the draft just copies the prompt) than writing new code (where it genuinely guesses). So a single tokens-per-second number without its workload attached is close to meaningless, including the ones in this post: my numbers are free-form generation, the pessimistic end of the range. If your work is editing, refactoring, or structured rewriting, multiply accordingly.

Practical takeaway for single-user Sparks: DSpark k=7 on the official FP8 checkpoint beats every configuration I measured above (17.2 t/s on the neutral benchmark, 45+ on edit work) with zero quality risk, since verification discards every wrong guess. And it ran on the stable vLLM release without the hard reboot the nightly's MTP path gave me, though I have not dared re-run the exact crash cell.

## Wrapping up

Qwen3.8-27B on a DGX Spark, one day in:

- Day-zero support was real everywhere: llama.cpp immediately, vLLM immediately, Ollama by end of day with v0.32.12. The qwen3_5 architecture class being pre-supported did most of the work.
- Best single-stream chat: Ollama, 26.5 t/s, because it ships the MTP head with speculative decoding on by default. Nobody else does yet.
- Best serving throughput: vLLM NVFP4, 84.3 t/s aggregate at 10 concurrent, prefill scaling to 4,000 t/s.
- The architecture's superpower on this hardware is context flatness: 8.2 t/s at zero context, 7.9 at 32K, 9.8 at 100K (NVFP4). Long documents are effectively free at decode time.
- Rough edge: FP8 wedged under concurrent deep-context load in the current vLLM nightly. NVFP4 did not. Test your traffic profile.

A dense 27B with native vision and 262K context that runs at usable speeds on a desk box, with Apache 2.0 attached, is exactly what this hardware was built for. The MoE models are still faster chatters, but in my opinion this is the most capable thing my Spark has run so far.

Huge thanks to the unsloth team for having the GGUF and NVFP4 quants up within hours, the Ollama team for shipping same-day support, and the Spark Arena maintainers (Drew Botwinick, Eugene Rakhmatulin, Raphael Amorim) whose recipes and containers turned a day-zero model into a config-file edit. If you have a Spark, give these recipes a try and let me know what numbers you get - and submit them to [Spark Arena](https://spark-arena.com) so we can compare notes.

## Links

- Model: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) and [Qwen/Qwen3.8-27B-FP8](https://huggingface.co/Qwen/Qwen3.8-27B-FP8)
- Quants: [unsloth/Qwen3.8-27B-GGUF](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF), [unsloth/Qwen3.8-27B-NVFP4](https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4)
- Ollama: [ollama.com/library/qwen3.8](https://ollama.com/library/qwen3.8) (needs v0.32.12+)
- Tools: [sparkrun](https://sparkrun.dev), [llama-benchy](https://pypi.org/project/llama-benchy/), [Spark Arena](https://spark-arena.com)
- My submission: sub1786754097881 on the Spark Arena leaderboard
