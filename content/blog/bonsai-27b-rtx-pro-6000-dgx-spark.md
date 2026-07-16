---
title: "Bonsai 27B on RTX PRO 6000 vs DGX Spark: what actually works"
seoTitle: "Bonsai 27B benchmark: RTX PRO 6000 vs DGX Spark"
seoDescription: "Real Bonsai 27B benchmarks on an RTX PRO 6000 and a DGX Spark, including the supported llama.cpp setup, ternary vs 1-bit results, and speculative decoding."
datePublished: 2026-07-16T00:00:00.000Z
slug: bonsai-27b-rtx-pro-6000-dgx-spark
author: saiyam-pathak
cover: /img/blog/bonsai-27b-rtx-pro-6000-dgx-spark/cover.png
tags: ["ai", "gpu", "llm", "inference", "benchmarks"]
---

PrismML recently released [Bonsai 27B](https://github.com/PrismML-Eng/Bonsai-demo), a compressed version of Qwen3.6-27B designed to retain useful reasoning at an unusually small footprint. It comes in two main variants:

- **Ternary Bonsai 27B**: the higher-quality option, with weights in `{-1, 0, +1}`.
- **1-bit Bonsai 27B**: the smaller and faster option, with weights in `{-1, +1}`.

Most early results focused on phones and laptops. I wanted to know what these models look like on two very different NVIDIA systems:

- **RTX PRO 6000 Blackwell Server Edition**: 96 GB VRAM, approximately 1.8 TB/s memory bandwidth, `sm_120`. Thanks to [Utho Cloud](https://utho.com/) for sponsoring access to this system.
- **NVIDIA DGX Spark**: GB10 Grace Blackwell, 128 GB unified memory (about 121 GB usable), 273 GB/s memory bandwidth, `sm_121`.

The short version: Bonsai is extremely fast for a single user on the RTX PRO 6000, remains practical on the DGX Spark, and is much easier to run when you follow PrismML's supported setup instead of mixing model files and experimental llama.cpp branches.

## Results at a glance

| Machine | Ternary Q2_0 | 1-bit Q1_0 | DSpark speculative decoding |
|---|---:|---:|---:|
| RTX PRO 6000 | 3,620 pp / **120.7 tg** | 3,600 pp / **145.5 tg** | 117.4 → **156.4 tok/s** in our code-generation test |
| DGX Spark | 937.7 pp / **28.5 tg** | 991.6 pp / **42.8 tg** | 28.2 → **17.6 tok/s** in the same test |

`pp` is prompt-processing speed: how quickly the model reads input. `tg` is token-generation speed: how quickly it writes the response. Both are tokens per second. The `llama-bench` results below use a 512-token prompt and generate 128 tokens, with five repetitions per cell.

The practical choices are simple:

- On the **RTX PRO 6000**, use ternary Q2_0 when quality is the priority and Q1_0 when raw decode speed matters more.
- On the **DGX Spark**, Q1_0 is the better speed-first option. Q2_0 remains usable when you want the higher-quality ternary model.
- Treat **DSpark speculative decoding as workload-specific**. It helped our single-user RTX code-generation test, but hurt the same test on the Spark. PrismML also marks it experimental because it forces one server slot and disables cross-request prompt-cache reuse.

![Batch-1 decode speed: Bonsai on llama.cpp vs Qwen3.6 NVFP4 on vLLM, both machines](/img/blog/bonsai-27b-rtx-pro-6000-dgx-spark/decode-speed.svg)

## What Bonsai 27B is

Bonsai keeps the Qwen3.6-27B architecture but retrains the model so its language weights can use a binary or ternary representation. The base model has a hybrid-attention design: about 75% of its layers use linear attention, which helps keep long-context memory growth under control.

![How Bonsai 27B gets from 54 GB to your GPU](/img/blog/bonsai-27b-rtx-pro-6000-dgx-spark/bonsai-pipeline.svg)

| Variant | Effective bits per weight | Ideal weight size | Published benchmark average |
|---|---:|---:|---:|
| Ternary Bonsai 27B | 1.71 | 5.9 GB | 80.49, or 94.6% of the FP16 reference |
| 1-bit Bonsai 27B | 1.125 | 3.9 GB | 76.11, or 89.5% of the FP16 reference |

There is an important size distinction. The 5.9 GB ternary figure is the ideal representation size. The current Q2_0 GGUF occupies about **7.17 GB on disk** because ternary values are stored in 2-bit slots with group scales. The Q1_0 GGUF is about **3.79 GB on disk**. Those deployed sizes are the useful numbers for planning downloads and memory.

PrismML reports an average score of 72.73 for a conventional IQ2_XXS build of Qwen3.6-27B and 84.99 for Q4_K_XL. That makes the ternary model interesting: its published quality is much closer to the 4-bit result while using substantially less storage. These are PrismML's evaluations, not results I independently reproduced in full.

## Use the supported setup

PrismML's [README](https://github.com/PrismML-Eng/Bonsai-demo) and [agent guide](https://github.com/PrismML-Eng/Bonsai-demo/blob/main/AGENTS.md) provide the intended installation path. On Linux or macOS, the basic flow is:

```bash
git clone https://github.com/PrismML-Eng/Bonsai-demo.git
cd Bonsai-demo
./setup.sh
./scripts/start_llama_server.sh
```

The default is Ternary Bonsai 27B. For the 1-bit model:

```bash
BONSAI_FAMILY=bonsai ./setup.sh
BONSAI_FAMILY=bonsai ./scripts/start_llama_server.sh
```

The setup script downloads the matching model and PrismML's prebuilt llama.cpp binaries. That is the path I would recommend to most readers.

For reproducible benchmarking, I built the engines from source. The benchmark captures record these revisions:

- Mainline llama.cpp: `12127de`
- PrismML `pr/q2_0-cuda`: `87ff025` on the RTX PRO 6000 and `54e8e26` on the DGX Spark
- PrismML `prism`: `62061f9`, the commit behind release `prism-b9591-62061f9`

Branches move. If you want to reproduce these numbers, use the machine-specific commits above rather than cloning a branch tip and assuming it is unchanged.

### Commands used for the benchmark cells

These are the `llama-bench` commands used for the result tables. They assume the GGUF files are in `models/` and use these local checkout names:

- `llama.cpp-mainline`: mainline llama.cpp at `12127de`
- `llama.cpp-prism`: PrismML `pr/q2_0-cuda` at the machine-specific revision listed above
- `llama.cpp-prismbr`: PrismML `prism` at `62061f9`

Create the three pinned checkouts:

```bash
# Use 87ff025 on the RTX PRO 6000 or 54e8e26 on the DGX Spark.
Q2_G64_COMMIT=87ff025

git clone https://github.com/ggml-org/llama.cpp.git llama.cpp-mainline
git -C llama.cpp-mainline checkout 12127de

git clone https://github.com/PrismML-Eng/llama.cpp.git llama.cpp-prism
git -C llama.cpp-prism checkout "${Q2_G64_COMMIT}"

git clone https://github.com/PrismML-Eng/llama.cpp.git llama.cpp-prismbr
git -C llama.cpp-prismbr checkout 62061f9
```

From the directory containing those checkouts, build `llama-bench` for the GPU you are testing:

```bash
# Use 120 for the RTX PRO 6000 or 121 for the DGX Spark.
CUDA_ARCH=120

for TREE in llama.cpp-mainline llama.cpp-prism llama.cpp-prismbr; do
  cmake -S "${TREE}" -B "${TREE}/build" \
    -DGGML_CUDA=ON \
    -DCMAKE_CUDA_ARCHITECTURES="${CUDA_ARCH}" \
    -DLLAMA_BUILD_UI=OFF
  cmake --build "${TREE}/build" -j --target llama-bench
done
```

From the directory containing the three checkouts and `models/`, the mainline Q1_0 run was:

```bash
./llama.cpp-mainline/build/bin/llama-bench \
  -m models/Bonsai-27B-Q1_0.gguf \
  -fa 0,1 -p 512 -n 128 -o md
```

On the DGX Spark, the Q2_g64 run used both flash-attention values in one command. This is the command that produced the `607.4` and `900.7` prefill rows shown later:

```bash
./llama.cpp-prism/build/bin/llama-bench \
  -m models/Ternary-Bonsai-27B-Q2_g64.gguf \
  -fa 0,1 -p 512 -n 128 -o md
```

The RTX Q2_g64 run used the same model and engine command with `-fa 1` only; I did not run an RTX Q2_g64 flash-attention A/B test.

The PrismML `prism` runs for Q2_0 and Q1_0 were:

```bash
BIN=./llama.cpp-prismbr/build/bin

${BIN}/llama-bench \
  -m models/Ternary-Bonsai-27B-Q2_0.gguf \
  -fa 1 -p 512 -n 128 -o md

${BIN}/llama-bench \
  -m models/Bonsai-27B-Q1_0.gguf \
  -fa 1 -p 512 -n 128 -o md
```

The commands did not explicitly set repetitions, GPU layers, threads, batch sizes, KV-cache types, or warm-up behavior. The pinned sources default to five repetitions, full GPU offload (`ngl = -1`), batch 2,048, microbatch 512, F16 K/V cache, warm-up enabled, and a machine-dependent CPU thread count. The resulting captures record `ngl = -1`, but not every default. On the multi-GPU RTX host, I set `CUDA_VISIBLE_DEVICES` to one GPU UUID before each command; do the same on any multi-GPU system to avoid accidentally spreading a run across devices.

The execution record does not contain publishable checksums for every GGUF file, so this documents how the benchmark cells were produced rather than guaranteeing byte-for-byte reproduction from a future model download.

The [pinned `llama-bench` documentation](https://github.com/ggml-org/llama.cpp/blob/12127de/tools/llama-bench/README.md) explains the flags and notes that these measurements exclude tokenization and sampling time.

## One compatibility detail worth knowing

The repository currently publishes several ternary GGUF files because ternary support is moving into mainline llama.cpp. They are not interchangeable:

| File | Intended use on CUDA at the tested revisions |
|---|---|
| `Ternary-Bonsai-27B-Q2_0.gguf` | PrismML's supported `prism` build; this is the recommended path |
| `Ternary-Bonsai-27B-Q2_g64.gguf` | The group-64 migration format; fast with the tested `pr/q2_0-cuda` build |
| `Ternary-Bonsai-27B-PQ2_0.gguf` | Not supported at the tested revisions |
| `Bonsai-27B-Q1_0.gguf` | Supported by mainline llama.cpp and PrismML's build |

In my tests, Q2_g64 loaded in the tested mainline CUDA build but ran through a very slow path: 8.8 pp and 2.7 tg, compared with 3,672 pp and 117.9 tg using the matching PrismML CUDA work. That is a useful diagnostic result, but it is not a reason to make readers navigate every development branch. Use the demo repository and its matching Q2_0 file unless you are specifically testing the upstream migration.

![Which file and which llama.cpp build to use](/img/blog/bonsai-27b-rtx-pro-6000-dgx-spark/which-build.svg)

## RTX PRO 6000 results

These tests used one full RTX PRO 6000 GPU with flash attention enabled.

| Model | Engine | pp512 | tg128 |
|---|---|---:|---:|
| Q1_0 | Mainline llama.cpp | 3,658.6 ± 242.2 | 133.7 ± 2.0 |
| Q1_0 | PrismML `prism` | 3,599.7 ± 324.8 | **145.5 ± 3.2** |
| Ternary Q2_g64 | PrismML `pr/q2_0-cuda` | 3,672.5 ± 293.6 | 117.9 ± 0.7 |
| Ternary Q2_0 | PrismML `prism` | 3,620.6 ± 294.4 | **120.7 ± 0.7** |

PrismML publishes an H100 SXM reference of 2,596 pp and 98 tg for ternary Q2_0. Our RTX PRO 6000 result is higher than that published reference, but this is not a controlled hardware comparison: the software revisions, flags, and environments are not identical.

### Tuning observations

For ternary Q2_0, an RTX prompt-processing sweep using a 2,048-token prompt peaked at `-ub 1024`:

| Microbatch | pp2048 |
|---:|---:|
| 256 | 3,519.0 |
| 512 | 3,969.8 |
| 1024 | **4,089.4** |
| 2048 | 4,023.2 |

Flash attention improved short-prompt prefill by about 7% in the Q1_0 test and was neutral for short-context decode.

Longer context reduced decode speed gradually rather than collapsing it. Ternary Q2_0 measured 121.8 tok/s at 4K depth, 108.6 at 16K, and 90.2 at 64K depth.

PrismML also offers experimental 4-bit KV cache support through `BONSAI_KV4=1`. Think of this as a memory-saving tool for long contexts, not a general speed optimization. The model's hybrid architecture already keeps its KV cache smaller than a full-attention 27B model.

### Concurrent users

`llama-batched-bench` shows how aggregate throughput changes as more sequences are processed together:

| Simultaneous sequences | Ternary Q2_0 total | Per sequence | Q1_0 total | Per sequence |
|---:|---:|---:|---:|---:|
| 1 | 119.3 | 119.3 | 140.2 | 140.2 |
| 10 | 411.9 | 41.2 | 471.5 | 47.1 |
| 32 | 671.8 | 21.0 | 786.1 | 24.6 |

These are synthetic batched-benchmark results, not an end-to-end production load test. They show that the small weight footprint leaves substantial batching headroom on a 96 GB GPU.

### A note on MIG

The RTX box initially exposed 32 MIG devices: four `1g.24gb` slices on each of eight GPUs. The tested llama.cpp build asserted during CUDA enumeration because it allows at most 16 visible devices. Restricting `CUDA_VISIBLE_DEVICES` to one slice avoided the startup failure.

On one `1g.24gb` slice, Q1_0 decoded at 50.2 tok/s versus 133.7 tok/s on the full GPU. That result is useful when evaluating a cloud GPU slice, but it should not be treated as a performance estimate for a different consumer GPU with similar advertised bandwidth.

## DGX Spark results

The DGX Spark has far more memory capacity than Bonsai needs, but much less memory bandwidth than the RTX PRO 6000. That difference is visible in decode performance.

All rows below use flash attention (`-fa 1`) and report `llama-bench`'s mean ± standard deviation over five repetitions.

| Model | Engine | pp512 | tg128 |
|---|---|---:|---:|
| Q1_0 | Mainline llama.cpp | 922.9 ± 11.8 | 40.9 ± 0.2 |
| Q1_0 | PrismML `prism` | **991.6 ± 13.7** | **42.8 ± 0.1** |
| Ternary Q2_g64 | PrismML `pr/q2_0-cuda` | 900.7 ± 19.1 | 26.6 ± 0.5 |
| Ternary Q2_0 | PrismML `prism` | **937.7 ± 11.0** | **28.5 ± 0.1** |

For Q2_g64, I also ran the same `54e8e26` build with flash attention disabled:

| Q2_g64 setting | pp512 | tg128 |
|---|---:|---:|
| Flash attention off | 607.4 ± 129.5 | 25.9 ± 0.6 |
| Flash attention on | 900.7 ± 19.1 | 26.6 ± 0.5 |

Enabling flash attention increased mean prefill throughput by 48.3% in this test. The flash-attention-off prefill result had high run-to-run variation, and generation changed only slightly, so I would treat this as a result for this DGX Spark configuration rather than a general comparison with the RTX card.

A Q2_g64 prompt-processing sweep peaked at `-ub 256` for a 2,048-token prompt. I did not repeat that complete microbatch sweep on Q2_0, so I would treat 256 as a starting point to measure rather than a universal best setting.

At 16K context depth, Q1_0 still produced 31.5 tok/s. That is a meaningful result for a local workstation: the model remains interactive even as context grows.

## Speculative decoding depends on the workload

PrismML ships a 1.95 GB Q4_1 DSpark drafter. It predicts short token blocks that the target model verifies. Accepted drafts preserve the target model's output distribution, but whether the technique is faster depends on the workload and hardware.

I tested the same 512-token code-generation workload at temperature zero on both systems:

| Machine | Without DSpark | With DSpark | Change |
|---|---:|---:|---:|
| RTX PRO 6000 | 117.4 tok/s | **156.4 tok/s** | +33% |
| DGX Spark | 28.2 tok/s | **17.6 tok/s** | -37% |

This makes DSpark attractive for this kind of single-user generation on the RTX PRO 6000, but not on the Spark in the tested configuration.

It is not a free switch even on the RTX card. PrismML marks the feature experimental: it forces a single server slot and disables cross-request prompt-cache reuse. Leave it off for multi-user serving, multi-turn workloads that benefit from cached prefixes, or any workload you have not measured.

## A small vLLM comparison

Bonsai's main advantage is quality per gigabyte. For context, I also ran the base Qwen3.6-27B model in NVFP4 with vLLM 0.25.1.

| Machine | Bonsai Q2_0 decode | Bonsai Q1_0 decode | Qwen3.6-27B NVFP4 decode |
|---|---:|---:|---:|
| RTX PRO 6000 | 120.7 | 145.5 | 58.9 |
| DGX Spark | 28.5 | 42.8 | 10.6 |

The RTX vLLM run reached 858.8 output tok/s at batch 64, demonstrating why vLLM remains a better fit for a conventional model under heavy concurrent serving. Bonsai with llama.cpp was faster for the single-request tests shown here.

On the Spark, I had to lower `--gpu-memory-utilization` to 0.5. The default 0.9 allocation left too little unified memory for the rest of the system in this environment. The resulting 10.6 tok/s was measured, but I did not isolate the kernel-level reason it fell below a simple bandwidth estimate.

This is a context comparison, not an equal-quality model comparison. Bonsai and the NVFP4 base model have different weight representations and published evaluation scores.

## Quality smoke tests

Speed is not useful if the model cannot complete ordinary tasks. I ran three small checks with temperature 0.7, top-p 0.95, top-k 20, and a 3,072-token generation budget:

| Test | Ternary | 1-bit |
|---|---|---|
| Trick arithmetic question | Correct | Correct |
| Longest-palindromic-substring implementation | Correct final answer | Correct approach in reasoning, but exhausted the token budget before the final answer |
| Exact JSON tool call | Valid | Valid |

These checks show that neither quant was obviously broken in basic use. They are not enough to claim that either model fully matches the original 27B model. The 1-bit coding result also shows why reasoning budgets matter: the model can spend a long time thinking before it produces a final answer.

For an interactive deployment, use the web UI's reasoning-effort control or set a server-side cap with `--reasoning-budget`. A moderate cap is often more useful than disabling reasoning entirely.

## Recommendations

| Use case | Recommendation |
|---|---|
| RTX PRO 6000, quality first | Ternary Q2_0 with the supported `prism` build |
| RTX PRO 6000, fastest single-user decode | Q1_0 |
| RTX PRO 6000, measured one-shot code generation | Test DSpark; our run improved by 33% |
| DGX Spark, quality first | Ternary Q2_0, flash attention enabled |
| DGX Spark, speed first | Q1_0, flash attention enabled |
| DGX Spark speculative decoding | Leave off initially; our test was 37% slower |
| Heavy concurrent serving of a conventional model | Use a serving engine such as vLLM and benchmark the actual workload |

Bonsai 27B is a compelling single-user and small-team inference option on both machines. The RTX PRO 6000 exposes how fast a 27B-class model can decode when its weights occupy only a few gigabytes. The DGX Spark is slower, as expected from its lower memory bandwidth, but 28-43 tok/s remains practical for local use.

The software support is still moving. Q1_0 is already the straightforward format; ternary CUDA users should follow PrismML's supported demo release until the upstream migration settles. Pin revisions when publishing benchmark numbers, and measure speculative decoding, KV-cache compression, and microbatch size against the workload you actually plan to run.

## Test environment

- RTX system: Ubuntu 24.04, NVIDIA driver 610.43.02, CUDA 13.0, one RTX PRO 6000 Blackwell Server Edition used per benchmark.
- DGX Spark: DGX OS, NVIDIA driver 580.159.03, CUDA 13.0, GB10 (`sm_121`).
- llama.cpp revisions: mainline `12127de`; PrismML CUDA migration branch `87ff025` on the RTX system and `54e8e26` on the DGX Spark; PrismML release branch `62061f9`.
- vLLM comparison: vLLM 0.25.1, transformers 5.13.1, `unsloth/Qwen3.6-27B-NVFP4`.
- `llama-bench`: five repetitions per cell unless stated otherwise.
- DSpark measurements: `llama-server` completion timings for the same code-generation prompt at temperature zero.
