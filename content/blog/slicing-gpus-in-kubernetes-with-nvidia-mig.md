---
title: "Slicing GPUs in Kubernetes with NVIDIA Multi-Instance GPU (MIG)"
seoTitle: "NVIDIA MIG on Kubernetes: Slice 8 Blackwell GPUs into 32 Isolated Instances"
seoDescription: "Partition NVIDIA Blackwell GPUs into hardware-isolated MIG slices on Kubernetes: host-level slicing, GPU Operator automation, production pitfalls, and DCGM monitoring."
datePublished: 2026-07-15T10:00:00.000Z
slug: slicing-gpus-in-kubernetes-with-nvidia-mig
author: shubham-katara
cover: /img/blog/slicing-gpus-in-kubernetes-with-nvidia-mig/cover.jpg
tags: ["kubernetes", "gpu", "nvidia", "platform-engineering"]
---

In this post you slice 8 monolithic NVIDIA Blackwell GPUs into 32 fully isolated, independent 24GB GPU instances inside a Kubernetes cluster using **Multi-Instance GPU (MIG)**, so multiple tenants can share expensive silicon without stepping on each other. By the end, a PyTorch workload will be running on a single hardware-isolated slice, and you'll be able to prove the isolation from both inside and outside the container.

Who this is for:

- Platform engineers and SREs who run GPU nodes in Kubernetes and are tired of watching 96GB cards sit mostly idle.
- Teams that need hard multi-tenancy on shared AI infrastructure while keeping finance happy about utilization and ROI.

What you'll build:

- 32 hardware-isolated `1g.24gb` MIG slices carved out of 8 Blackwell cards, first by hand with `nvidia-smi`, then declaratively with the NVIDIA GPU Operator.
- A mental model for MIG's GPU Instances and Compute Instances that actually sticks.
- Fixes for four production pitfalls that will bite you the moment you mix manual slicing with the Operator.
- A Prometheus + Grafana telemetry stack scraping per-slice DCGM metrics.
- A verified PyTorch workload pinned to a single Blackwell (`sm_120`) MIG slice.

While this setup was tested on a single node, nothing here is single-node specific. It works the same regardless of how many GPU nodes you have.

## Why Whole-GPU Scheduling Wastes Your Money

Here's a scenario that plays out on GPU clusters everywhere.

Your team provisions a node equipped with **8x NVIDIA RTX PRO 6000 Blackwell GPUs**, a massive 768GB VRAM compute pool. You deploy the standard Kubernetes GPU Operator, which registers the node resources as `nvidia.com/gpu: 8`.

Then a developer deploys a lightweight LLM inference pod or a PyTorch training job. Kubernetes assigns them a whole GPU. The workload claims the entire 96GB Blackwell card but only uses 20GB.

The remaining 76GB sits idle.

Because standard GPUs are scheduled as indivisible resources, eight small workloads lock down eight entire cards. Your platform is left with zero schedulable GPU capacity, artificially high queue latency, and a cluster operating at a fraction of its financial and compute potential.

Now you're stuck answering an uncomfortable question: how do you justify low cluster utilization to finance while your development teams are complaining about lack of GPU availability?

As a platform engineer, your mandate is to design and maintain cost-efficient, high-performance developer platforms. When you're managing expensive AI infrastructure, your core metrics are resource utilization, return on investment (ROI), and strict multi-tenancy SLAs.

The fix is a robust partitioning strategy. That's what the rest of this guide walks through, step by step.

## Prerequisites

To follow along, you'll need root access to a GPU node and admin access to a Kubernetes cluster. Here's the exact infrastructure used in this setup:

- **Host OS:** Enterprise Linux VM (Ubuntu-based) on Utho Cloud.
- **Cloud Provider:** Utho Cloud.
- **Kubernetes:** v1.35.6
- **GPU Operator Chart:** gpu-operator-v26.3.3
- **GPU Operator Version:** v26.3.3
- **Container Runtime:** `containerd`.
- **CPUs:** 64 Cores.
- **RAM:** 1259GB.
- **GPUs:** 8x NVIDIA RTX PRO 6000 Blackwell Server Edition (96GB VRAM, 188 Streaming Multiprocessors / SMs per card).

```sh
root@utho-gpu-rtxpro6000-8-62383:~# nvidia-smi -L
GPU 0: NVIDIA RTX PRO 6000 Blackwell Server Edition (UUID: GPU-8b89b58e-b427-108d-ac50-06138d78fe78)
GPU 1: NVIDIA RTX PRO 6000 Blackwell Server Edition (UUID: GPU-03a041b7-8abf-360a-d1a2-dfd70188cd5f)
GPU 2: NVIDIA RTX PRO 6000 Blackwell Server Edition (UUID: GPU-ba09367f-dd50-32ca-e988-7ff66bece885)
GPU 3: NVIDIA RTX PRO 6000 Blackwell Server Edition (UUID: GPU-30512c46-708b-f374-5698-ee24be6cd626)
GPU 4: NVIDIA RTX PRO 6000 Blackwell Server Edition (UUID: GPU-4c395b7a-a7e6-d90f-1ced-d96e8dd68288)
GPU 5: NVIDIA RTX PRO 6000 Blackwell Server Edition (UUID: GPU-04dc48d7-7048-aef5-ad36-f5db716e7668)
GPU 6: NVIDIA RTX PRO 6000 Blackwell Server Edition (UUID: GPU-f4f5db98-143f-0a8d-47ce-956fab39a736)
GPU 7: NVIDIA RTX PRO 6000 Blackwell Server Edition (UUID: GPU-f4c61521-240a-da09-2787-e576034e197e)
```

- **NVIDIA Host Driver:** `610.43.02` with **CUDA:** `13.3`.

## How GPU Integration Works in Kubernetes

Before you slice anything, it helps to understand what you're slicing into.

To run GPU workloads inside containers, the software stack operates in three distinct, interconnected layers. In a standard setup, manually configuring, upgrading, and maintaining these layers across multiple nodes introduces significant operational overhead.

To solve this, platform teams deploy the **NVIDIA GPU Operator**. The Operator acts as a Kubernetes-native controller that dynamically bootstraps, configures, and manages the lifecycle of all three layers automatically:

```
┌────────────────────────────────────────────────────────┐
│ 3. ORCHESTRATION LAYER (Kubernetes Device Plugin)      │
│    - Deployed & Managed by the GPU Operator            │
│    - Registers GPU capacity with Kubelet               │
│    - Schedules Pods to specific GPU indices/slices     │
├────────────────────────────────────────────────────────┤
│ 2. INTEGRATION LAYER (NVIDIA Container Toolkit)        │
│    - Deployed & Configured by the GPU Operator         │
│    - Wrapper around container engine (containerd)      │
│    - Injects 'libcuda.so' and '/dev/nvidia*' paths     │
├────────────────────────────────────────────────────────┤
│ 1. HARDWARE LAYER (NVIDIA Kernel Driver)               │
│    - Optionally containerized by the GPU Operator      │
│    - OS kernel modules (/lib/modules/...)              │
│    - Translates assembly code to physical silicon      │
└────────────────────────────────────────────────────────┘
```

**Layer 1: The Host Kernel Driver.** This is installed directly on the host operating system. It interfaces with the physical PCIe silicon and exposes character device files such as `/dev/nvidia0` and `/dev/nvidiactl`. The driver operates independently of containers and orchestration. It doesn't know or care that Kubernetes exists.

**Layer 2: The Container Toolkit (the OCI integration).** Standard container runtimes (such as `containerd`) can partition CPU and memory resources, but they cannot natively manage GPUs. The **NVIDIA Container Toolkit** acts as a hook wrapper in containerd (`config.toml`). When a container requests a GPU, the toolkit intercepts the container creation, calls the host libraries, and mounts the driver files (`/dev/nvidia*` and `libcuda.so`) directly into the container's namespace.

**Layer 3: The Kubernetes Device Plugin.** This is a DaemonSet that runs inside the cluster. It queries the host driver, counts the available GPUs (or MIG slices), and advertises them to the Kubelet as schedulable capacity (for example, `nvidia.com/gpu: 8`). When a pod requests a GPU, the scheduler assigns a device index, which the Kubelet passes to the Container Toolkit during initialization.

## What Multi-Instance GPU (MIG) Actually Is

By default, the GPU Operator exposes the physical cards directly (`nvidia.com/gpu: 8`). If a workload only requires a fraction of the hardware, it still claims the entire 96GB card, underutilizing the resource and blocking everyone else.

**Multi-Instance GPU (MIG)** solves this by partitioning a physical GPU into isolated virtual hardware instances. Not software isolation. Not time-sharing. Actual partitioning at the silicon level.

### The Parent-Child Hierarchy: GPU Instance and Compute Instance

Before slicing a GPU using MIG, it's crucial to understand what a slice actually contains.

Every slice consists of a **GPU Instance (GI)** and a **Compute Instance (CI)**. The easiest way to think about them:

1. **The GPU Instance (GI) is the plot of land.** When you create a GI, you carve out a physical chunk of VRAM and its memory controllers. This "land" is securely fenced off at the silicon level. No other partition or process on the GPU can cross this boundary or access this memory.
2. **The Compute Instance (CI) is the building built on that land.** The building houses the execution machinery: the Streaming Multiprocessors (SMs) and Tensor Cores that perform the actual mathematical computations.

![GPU Instance and Compute Instance Relationship](/img/blog/slicing-gpus-in-kubernetes-with-nvidia-mig/gi-ci-relationship.jpg)

The relationship between a GI and a CI is strictly hierarchical:

- **No building without land.** You cannot establish a Compute Instance without first creating a parent GPU Instance. Execution units must have a dedicated memory boundary to run in.
- **Size constraints.** The capacity of the building (CI) cannot exceed the size of the plot of land (GI). You cannot allocate more compute slices (SMs) than the parent VRAM slice naturally supports.
- **Sub-division for multi-tenancy.** You can build a single large structure (one CI matching the full GI) or divide the plot to support multiple smaller buildings (multiple smaller CIs). In the latter scenario, those compute instances run in parallel, sharing the same VRAM pool of the parent GI while keeping their execution cores strictly isolated.
- **Teardown order matters.** You cannot clear the plot of land (destroy the GI) while the building is still standing (the CI exists). The driver will reject the command. You must demolish the building first (destroy all CIs), then reclaim the land (destroy the parent GI).

### Why Slicing a GPU Requires Splitting Both Memory and Compute

To put it in everyday terms, a GPU has two fundamental responsibilities:

1. **Storing data (Memory / VRAM):** the workspace where your AI models and numbers sit.
2. **Processing data (Compute / SM cores):** the active brainpower (or hands) that perform the calculations.

Why not just split one of them?

If you only partitioned the memory (GI) and left the compute cores unpartitioned, you would have multiple isolated storage units but only one set of hands trying to access all of them at once, causing traffic jams.

Conversely, if you only partitioned the compute cores (CI) but kept a shared, unpartitioned memory pool, you would have 4 independent workers trying to write on the exact same sheet of paper at the same time, causing conflicts and data corruption.

By slicing **both** memory (GI) and compute (CI), you give each tenant their own locked filing cabinet (VRAM) and their own dedicated worker (compute cores) to run jobs in parallel without interfering with anyone else.

### Why You'd Want to Customize These Slices

Depending on your workloads, you might want to allocate these resources differently:

- **Slicing for isolation (large VRAM, small compute):** You want to run a massive Language Model (LLM) that requires 80GB of VRAM just to fit in memory, but it doesn't need to answer questions at lightning speed. You allocate a large memory slice (80GB GI) but pair it with only a small slice of compute cores (for example, a 2g CI) to save processing power for others.
- **Slicing for speed (small VRAM, large compute):** You are running a small, real-time object detection model. It only needs 10GB of VRAM to store its parameters, but it must process video frames at 60 FPS. You allocate a small memory slice (10GB GI) but assign all available compute cores inside it (100% of the GI's capacity as a CI) so it runs as fast as possible.

### How to Read MIG Profile Names

A Blackwell architecture GPU like the **NVIDIA RTX 6000** has 188 SMs in total, and the hardware divides the silicon into **4 base compute slices**.

NVIDIA profiles follow the naming scheme `{X}g.{Y}gb`, where:

- **`{Y}gb`** is the VRAM partition (the GI layer).
- **`{X}`** is the compute slice multiplier.

So a **`1g.24gb`** slice gets exactly **1/4th of the card's compute resources**: **47 SMs** (which contain 6,016 CUDA Cores and 188 Tensor Cores), paired with a 24GB VRAM partition.

## How to Slice GPUs Manually on the Host

When configuring MIG, there are two operations that look similar but behave very differently under load: **toggling MIG mode** and **carving the physical slices**.

- **Toggling MIG mode (`nvidia-smi -mig 1`):** On older architectures (like Ampere A100), enabling MIG forced a disruptive hardware-level reset. Starting with **Hopper (H100/H200)** and **Blackwell (RTX PRO 6000)**, enabling MIG is now a **non-disruptive logical toggle** in the driver. No physical hardware reset is triggered. You can flip the master MIG switch on-the-fly, even while active CUDA applications (like Ollama) are actively hogging VRAM.
- **Carving the slices (`nvidia-smi mig -cgi ...`):** This is where physical reality hits. The command forces the GPU's memory controllers to physically partition the memory crossbars on the silicon. If a process holds even a single megabyte of VRAM, the memory controllers are locked. The driver cannot rewrite these hardware boundary lines while active allocations exist, and the command will fail 100% of the time with a `Device or resource busy` error. To recover, the driver must execute a hardware-level reset (`nvidia-smi --gpu-reset`), which is itself blocked until all GPU clients are stopped.

### The Blocker Daemons You Need to Stop First

On enterprise systems, two main background services hold active handles on GPU device files:

1. **`nvidia-persistenced` (Persistence Daemon):** keeps the driver loaded in kernel memory to avoid launch latency when starting new CUDA processes.
2. **`nvidia-fabricmanager` (Fabric Manager):** used on multi-GPU systems connected via high-speed **NVSwitches** (such as HGX baseboards). *Note: if the GPUs are slotted directly into standard PCIe slots on a motherboard, this service is not needed or present.*

To safely apply static partitioning, temporarily disable the blocker services, slice, then bring them back:

```sh
root@utho-gpu-rtxpro6000-8-62383:~# sudo systemctl stop nvidia-persistenced
# Execute reset and slicing
root@utho-gpu-rtxpro6000-8-62383:~# sudo nvidia-smi -i 0 -mig 1
root@utho-gpu-rtxpro6000-8-62383:~# sudo nvidia-smi mig -i 0 -cgi 1g.24gb,1g.24gb,1g.24gb,1g.24gb -C
# Re-enable the persistence daemon
root@utho-gpu-rtxpro6000-8-62383:~# sudo systemctl start nvidia-persistenced
```

### How to Verify the Slicing

To verify the slicing worked, use the `nvidia-smi -L` command:

```sh
root@utho-gpu-rtxpro6000-8-62383:~# sudo nvidia-smi -L

GPU 0: NVIDIA RTX PRO 6000 Blackwell Server Edition (UUID: GPU-8b89b58e-b427-108d-ac50-06138d78fe78)
  MIG 1g.24gb     Device  0: (UUID: MIG-445da789-865d-5fd1-b2b6-32a48bf66c39)
  MIG 1g.24gb     Device  1: (UUID: MIG-e78fd5d2-f2de-5632-8961-9a368cec8080)
  MIG 1g.24gb     Device  2: (UUID: MIG-b8861912-6285-56a1-99ca-297ac0f38ddb)
  MIG 1g.24gb     Device  3: (UUID: MIG-f46c5ab9-40ef-54a2-b796-a2101a6ed56d)
GPU 1: NVIDIA RTX PRO 6000 Blackwell Server Edition (UUID: GPU-03a041b7-8abf-360a-d1a2-dfd70188cd5f)
  MIG 1g.24gb     Device  0: (UUID: MIG-c614986b-8ca6-5114-b292-f7fdf532b32e)
  MIG 1g.24gb     Device  1: (UUID: MIG-ba182ecc-31c1-5a67-92f1-b6f14f39cc2f)
  MIG 1g.24gb     Device  2: (UUID: MIG-5976103f-bae0-5bd9-8de2-efcb0651ae5d)
  MIG 1g.24gb     Device  3: (UUID: MIG-09aa478f-191b-55ce-a012-235285f56a44)
GPU 2: NVIDIA RTX PRO 6000 Blackwell Server Edition (UUID: GPU-ba09367f-dd50-32ca-e988-7ff66bece885)
  MIG 1g.24gb     Device  0: (UUID: MIG-07cdcefa-6330-5da7-9f25-0686ef5e6e7d)
  MIG 1g.24gb     Device  1: (UUID: MIG-91b206d2-cfbb-57d3-9ffb-00151f932469)
  MIG 1g.24gb     Device  2: (UUID: MIG-83bf707a-b369-5de9-a22a-e882e2a15f23)
  MIG 1g.24gb     Device  3: (UUID: MIG-db98d829-38c6-5490-ab37-54b3c1911690)
GPU 3: NVIDIA RTX PRO 6000 Blackwell Server Edition (UUID: GPU-30512c46-708b-f374-5698-ee24be6cd626)
  MIG 1g.24gb     Device  0: (UUID: MIG-2d5513c3-03f4-54f0-9c70-688f7472c927)
  MIG 1g.24gb     Device  1: (UUID: MIG-471a3e25-40ba-5794-9d7b-2dfa7aa0a0ab)
  MIG 1g.24gb     Device  2: (UUID: MIG-f8584627-55b2-52be-ac92-0b4708e7dad6)
  MIG 1g.24gb     Device  3: (UUID: MIG-6e4f5dfc-7e1f-59dc-9fec-a13642abcd08)
GPU 4: NVIDIA RTX PRO 6000 Blackwell Server Edition (UUID: GPU-4c395b7a-a7e6-d90f-1ced-d96e8dd68288)
  MIG 1g.24gb     Device  0: (UUID: MIG-0b090ecd-97b3-5022-b410-353a54064db3)
  MIG 1g.24gb     Device  1: (UUID: MIG-12e12a0a-56aa-5258-9cce-fb652a6d60ca)
  MIG 1g.24gb     Device  2: (UUID: MIG-e80daae6-94df-5114-b105-f4b8e14fe00c)
  MIG 1g.24gb     Device  3: (UUID: MIG-c652619d-ef73-5243-8313-163ba19341ce)
GPU 5: NVIDIA RTX PRO 6000 Blackwell Server Edition (UUID: GPU-04dc48d7-7048-aef5-ad36-f5db716e7668)
  MIG 1g.24gb     Device  0: (UUID: MIG-ac982967-d17f-5636-8641-078e3f7ee88a)
  MIG 1g.24gb     Device  1: (UUID: MIG-9a6a33e8-352c-5b71-8523-7918f07f19d3)
  MIG 1g.24gb     Device  2: (UUID: MIG-dcdb7566-7372-56e3-ac66-29bbc7332280)
  MIG 1g.24gb     Device  3: (UUID: MIG-61f3820e-e817-5ae1-ac70-7d4ccc6752bd)
GPU 6: NVIDIA RTX PRO 6000 Blackwell Server Edition (UUID: GPU-f4f5db98-143f-0a8d-47ce-956fab39a736)
  MIG 1g.24gb     Device  0: (UUID: MIG-fdae208b-7b6b-5360-b14d-7943f835591d)
  MIG 1g.24gb     Device  1: (UUID: MIG-bd87ccf3-dd60-556b-8fae-dd76a00f9f32)
  MIG 1g.24gb     Device  2: (UUID: MIG-4eb83867-7a48-50ec-98e4-590ca4a34bdb)
  MIG 1g.24gb     Device  3: (UUID: MIG-aa39a320-78fe-54f3-a33f-4e14a69a34fc)
GPU 7: NVIDIA RTX PRO 6000 Blackwell Server Edition (UUID: GPU-f4c61521-240a-da09-2787-e576034e197e)
  MIG 1g.24gb     Device  0: (UUID: MIG-83e26b2c-d325-5f9e-b6ab-1dd76bf49ee0)
  MIG 1g.24gb     Device  1: (UUID: MIG-769267a5-61cf-5391-815c-df1af5592f2f)
  MIG 1g.24gb     Device  2: (UUID: MIG-bd09eec4-b779-57ff-b2e9-0c5dd4db132d)
  MIG 1g.24gb     Device  3: (UUID: MIG-0f8a469f-1116-5095-9e94-65e7809b554d)
```

Each GPU now exposes 4 MIG devices, each following the `1g.24gb` profile: one compute slice paired with 24GB of dedicated VRAM. Every device has its own unique UUID, which is exactly how the Kubernetes device plugin will identify and schedule them later.

This means each physical card can now serve 4 tenants independently, each with their own hardware-isolated slice. Across 8 cards, that's 32 schedulable GPUs where you previously had 8.

That's a huge saving on the financial side of AI infrastructure, and you didn't buy a single new card.

## How the NVIDIA GPU Operator Automates the Stack

Everything we just did by hand works. It also doesn't scale.

There's no way to GitOps a series of `nvidia-smi` commands and maintain them across a fleet in the long run. This is why NVIDIA provides the **NVIDIA GPU Operator**, a controller that turns all of this host-level surgery into declarative Kubernetes configuration.

The operator deploys several critical components within the `gpu-operator` namespace:

- **`gpu-operator` (Controller):** the central management controller. It monitors the Kubernetes API server for custom resource configurations (like `ClusterPolicy` definitions) and automatically deploys, configures, and reconciles the necessary daemonsets and services on nodes containing GPUs.
- **`node-feature-discovery (NFD)`:** a hardware scanner deployed in a master-worker configuration. The worker daemon scans the host physical PCI hardware (such as CPU, kernel, and PCIe slots) to identify the presence of GPUs, and coordinates with the NFD master to apply labels (for example, `nvidia.com/gpu.present=true`) directly to the Kubernetes node object.
- **`gpu-feature-discovery (GFD)`:** a specialized extension of NFD. It scrapes detailed GPU hardware telemetry from the host driver (such as specific memory size, GPU models like RTX 6000 Blackwell, and active MIG profiles) and applies fine-grained node labels (for example, `nvidia.com/mig.config=all-1g.24gb`) so pods can target specific architectures.
- **`nvidia-container-toolkit`:** modifies the host's containerd configuration (`config.toml`) to register custom runtime classes, allowing containerized workloads to interface with the host drivers. It appends the following runtime configuration blocks to `/etc/containerd/config.toml`:

```toml
[plugins.'io.containerd.cri.v1.runtime'.containerd.runtimes.'nvidia']
  runtime_type = "io.containerd.runc.v2"

[plugins.'io.containerd.cri.v1.runtime'.containerd.runtimes.'nvidia'.options]
  BinaryName = "/usr/local/nvidia/toolkit/nvidia-container-runtime"
  SystemdCgroup = true

[plugins.'io.containerd.cri.v1.runtime'.containerd.runtimes.'nvidia-cdi']
  runtime_type = "io.containerd.runc.v2"

[plugins.'io.containerd.cri.v1.runtime'.containerd.runtimes.'nvidia-cdi'.options]
  BinaryName = "/usr/local/nvidia/toolkit/nvidia-container-runtime.cdi"
```

- **`nvidia-device-plugin`:** the gRPC daemon that registers the GPU slices with the Kubelet. It queries the host driver's NVML library, identifies the UUIDs of the active MIG slices, and advertises them to the Kubelet as allocatable capacity (for example, `nvidia.com/mig-1g.24gb: 32`). This allows the scheduler to bind Pods to specific slices.
- **`nvidia-dcgm-exporter`:** a metrics collector agent that interfaces with NVIDIA's low-level Data Center GPU Manager (DCGM) engine on the host. It reads real-time hardware telemetry (such as power consumption, temperature, SM clock speeds, and Tensor Core utilization ratios) and exposes them on a Prometheus `/metrics` HTTP endpoint for Grafana dashboards.
- **`nvidia-operator-validator`:** an audit manager that launches validation steps (including container runtime verification and a one-shot `cuda-validator` Job that runs matrix math workloads on the GPU) to verify the entire software-to-hardware pipeline is working cleanly before letting user pods deploy.

### How the NVIDIA Runtime Injects GPUs into Containers

To understand why those containerd configuration blocks are necessary, here's the operational flow of how the standard `nvidia` runtime acts as a bridge between containerd and runc:

![How the Standard NVIDIA Runtime Works](/img/blog/slicing-gpus-in-kubernetes-with-nvidia-mig/nvidia-runtime-flow.jpg)

The injection happens in 5 steps:

1. **Pod submission:** a developer submits a Pod manifest requesting a GPU (for example, `nvidia.com/gpu: 1` or a specific MIG slice).
2. **containerd interception:** the container engine (`containerd`) reads the Pod specification, identifies that it is configured to use the custom `"nvidia"` runtime class, and prepares to initialize the container.
3. **nvidia-runtime (the middleman) invocation:** instead of calling the standard runner immediately, containerd invokes the `nvidia-container-runtime`. This wrapper reads the container's environment variables (such as `NVIDIA_VISIBLE_DEVICES=0` or the unique MIG UUID), interrogates the host operating system to locate the requested physical GPU device files (under `/dev/nvidia*`) and target driver library files (like `libcuda.so` and `libnvidia-ml.so`), and dynamically injects these hardware device nodes and library paths into the container's OCI runtime specification file (`config.json`).
4. **runc execution:** the wrapper hands the modified container specification back to `runc` (the standard low-level container executor). `runc` initializes the namespaces, sets up cgroups, executes the mounts, and starts the container's initialization process.
5. **Active workload execution:** the containerized application boots up. Because the driver libraries and device files were dynamically injected during the handshake phase, the machine learning framework (such as PyTorch or TensorFlow) can interact with the GPU slice natively.

## Common Production Pitfalls and How to Solve Them

Here's the quick-reference version, the way you'll hit these at 2 AM:

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Toolkit can't find containerd, or runtime class never appears | Non-standard containerd paths (RKE2/K3s) | Point the toolkit at the right socket and config via Helm env overrides (Pitfall A) |
| Your manual slices vanish after installing the Operator | MIG Manager defaults to `all-disabled` when no node label exists | Label the node with the matching `nvidia.com/mig.config` profile (Pitfall B) |
| You changed slices on the host but Kubernetes shows the old layout, Operator logs frozen | MIG Manager only reacts to node label events, it never polls the hardware | Restart the MIG Manager pod or toggle the label to force reconciliation (Pitfall C) |
| Manual MIG mode: Kubelet never discovers new slices | Nothing tells the device plugin the hardware changed | Disable `migManager` in Helm and restart the device plugin daemonset (Pitfall D) |

Now the details.

### Pitfall A: Non-Standard containerd Socket Configurations

The GPU Operator assumes default paths for the containerd socket and config files. If your setup runs containerd through RKE2, you must explicitly point the toolkit to the non-standard paths during Helm installation:

```yaml
toolkit:
  env:
    - name: CONTAINERD_CONFIG
      value: /var/lib/rancher/rke2/agent/etc/containerd/config.toml
    - name: CONTAINERD_SOCKET
      value: /run/k3s/containerd/containerd.sock
    - name: CONTAINERD_RUNTIME_CLASS
      value: nvidia
    - name: CONTAINERD_SET_AS_DEFAULT
      value: "true"
```

### Pitfall B: MIG Manager Overriding Host Configurations

If the `nvidia-mig-manager` pod is active and detects no configuration label on a node, it defaults to the `all-disabled` profile, wiping out any manual host-level slicing you performed. All that careful `nvidia-smi` work, gone.

**The fix:** apply the appropriate label to your node so it aligns with the operator's config:

```sh
root@utho-gpu-rtxpro6000-8-62383:~# kubectl label node <node-name> nvidia.com/mig.config=all-1g.24gb --overwrite
```

Once labeled, the MIG Manager automatically orchestrates the dynamic partitioning lifecycle through a structured 6-step loop:

1. **Evicting workloads:** it updates the node's GPU allocatable limits to `0`, forcing the Kubernetes scheduler to gracefully evict and terminate all running GPU-dependent Pods to release device locks.
2. **Stopping telemetry daemons:** it pauses internal services like the `nvidia-device-plugin` and `dcgm-exporter` that query the GPU, ensuring NVML (NVIDIA Management Library) is completely free of client connections.
3. **Resetting the hardware:** it executes an `nvidia-smi --gpu-reset` on all registered GPUs on the node, wiping the VRAM clean and resetting the PCIe state.
4. **Applying new geometries:** it communicates with the host driver to enable MIG mode on the GPUs and carves out the physical GPU Instances (GIs) and Compute Instances (CIs) according to the requested profile (`all-1g.24gb`).
5. **Re-generating CDI specifications:** it writes new Container Device Interface (CDI) configurations on the host, exposing the new virtual devices to the OCI runtime.
6. **Restoring the stack:** it restarts the device plugin and dcgm-exporter, which read the new layout and report the 32 newly created `nvidia.com/mig-1g.24gb` slices back to the Kubelet.

### Pitfall C: Host-Level State Drift Undetected by MIG Manager

If you manually delete or modify MIG profiles directly on the host using the `nvidia-smi` CLI, the changes will not be reflected in Kubernetes, and the operator will appear completely silent about it.

**The root cause:** the `nvidia-mig-manager` watches for **Kubernetes Node Label events** (such as changing the label value). It does not poll the host's physical GPU registers continuously. Because your manual host modifications do not trigger Kubernetes events, the manager remains idle, thinking the old state is still successfully applied (its logs will remain frozen).

**The fix (for operator-managed MIG):** trigger a reconciliation event. You can do this by either restarting the MIG Manager pod (which forces a full check on boot) or toggling the node label back and forth to emit Kubernetes events:

```sh
# Option 1: Restart the MIG Manager daemonset pod
root@utho-gpu-rtxpro6000-8-62383:~# kubectl rollout restart daemonset -n gpu-operator nvidia-mig-manager

# Option 2: Toggle the node label to trigger the watch loop
root@utho-gpu-rtxpro6000-8-62383:~# kubectl label node <node-name> nvidia.com/mig.config=all-disabled --overwrite
# Wait 10 seconds, then re-apply:
root@utho-gpu-rtxpro6000-8-62383:~# kubectl label node <node-name> nvidia.com/mig.config=all-1g.24gb --overwrite
```

### Pitfall D: Forcing Kubelet Discovery for Manual MIG Configurations

Maybe you want the opposite arrangement: manage MIG slices manually on the host, prevent the GPU Operator from ever overwriting them, but still have Kubernetes discover and schedule workloads on those manual slices. You'll hit resource discovery issues where the cluster does not automatically detect your updates.

**The root cause:** when the automatic `nvidia-mig-manager` is disabled to allow manual slicing, there is no automated trigger to notify the Kubelet when the host-level physical MIG configuration changes.

**The fix (force Kubelet discovery):**

1. **Disable the MIG Manager in Helm.** Deploy or upgrade the GPU Operator with the MIG Manager disabled to prevent the operator from wiping your manual settings:

```sh
root@utho-gpu-rtxpro6000-8-62383:~# helm upgrade --install gpu-operator nvidia/gpu-operator \
  -n gpu-operator \
  --set migManager.enabled=false \
  [other-existing-overrides...]
```

2. **Provision host slices.** Create your MIG slices manually on the host using standard `nvidia-smi` CLI commands.

3. **Force Kubelet discovery.** Manually notify the Kubelet of the updated resources by restarting the device plugin daemonset:

```sh
root@utho-gpu-rtxpro6000-8-62383:~# kubectl rollout restart daemonset -n gpu-operator nvidia-device-plugin-daemonset
```

## How to Monitor GPU Slices with Prometheus and Grafana

A platform is only as good as its observability. Once your 32 GPU slices are registered, you need a centralized dashboard to monitor metrics like VRAM usage, temperature, and Tensor Core utilization.

To achieve this, deploy the Prometheus community stack and hook it into the low-level telemetry streams of the `nvidia-dcgm-exporter`.

**Step 1: Install the kube-prometheus-stack.** Use Helm to deploy Prometheus and Grafana into a dedicated `monitoring` namespace:

```sh
root@utho-gpu-rtxpro6000-8-62383:~# helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
root@utho-gpu-rtxpro6000-8-62383:~# helm repo update

root@utho-gpu-rtxpro6000-8-62383:~# helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace
```

**Step 2: Apply the ServiceMonitor.** The Prometheus Operator uses custom resources called `ServiceMonitors` to dynamically discover scrapers. By default, Prometheus only scans its own namespace (`monitoring`).

To scrape the exporter in the `gpu-operator` namespace, deploy the following manifest in the `monitoring` namespace. It uses a `namespaceSelector` to target the `nvidia-dcgm-exporter` Service inside the `gpu-operator` namespace:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: nvidia-dcgm-exporter
  # Deploy in the 'monitoring' namespace where Prometheus runs
  namespace: monitoring
  labels:
    release: prometheus
    app.kubernetes.io/instance: prometheus
    app.kubernetes.io/managed-by: Helm
spec:
  # Scrapes the service in the gpu-operator namespace
  namespaceSelector:
    matchNames:
    - gpu-operator
  selector:
    matchLabels:
      # Matches the exact standard label created by the NVIDIA GPU Operator Helm chart
      app: nvidia-dcgm-exporter
  endpoints:
  - port: gpu-metrics
    interval: 15s
    path: /metrics
```

Apply this file to configure the scraping loop:

```sh
root@utho-gpu-rtxpro6000-8-62383:~# kubectl apply -f nvidia-servicemonitor.yaml
```

**Step 3: Configure the Grafana dashboard.** Rather than building charts manually, NVIDIA maintains an official dashboard designed for DCGM exporter metrics:

1. Log into your Grafana UI.
2. Navigate to **Dashboards** -> **Import**.
3. Import **Dashboard ID: `22515`**.
4. Select your Prometheus data source and click **Import**.

This loads an interactive visualization panel showing real-time health and performance across all 32 partitions.

## How to Run Workloads on Blackwell (sm_120)

There's one final trap waiting at the workload layer.

The NVIDIA Blackwell architecture uses a new compute capability version: **Compute Capability 12.0 (`sm_120`)**. If you use older container images (such as `pytorch:2.1.2-cuda12.1`), the execution will crash with the following error:

```
RuntimeError: CUDA error: no kernel image is available for execution on the device
```

This occurs because older PyTorch binaries do not contain compiled kernels for `sm_120`. To resolve this, always use a modern PyTorch image compiled with CUDA 12.8+ or use the official **NVIDIA NGC PyTorch containers** (version `25.01-py3` or later), which natively support Blackwell.

Here is the final verified Deployment manifest to run a matrix multiplication load on a single `24GB` Blackwell MIG slice:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pytorch-mig-demo
  labels:
    app: pytorch-mig-demo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: pytorch-mig-demo
  template:
    metadata:
      labels:
        app: pytorch-mig-demo
    spec:
      runtimeClassName: nvidia
      containers:
      - name: pytorch
        # Using NVIDIA's official PyTorch NGC container (25.01 or later)
        # which is explicitly compiled to support Blackwell architecture (sm_120)
        image: nvcr.io/nvidia/pytorch:25.01-py3
        command: ["python3", "-c"]
        args:
        - |
          import torch
          import time

          print("=== CUDA MIG Slice Diagnostics ===")
          print("CUDA Available:", torch.cuda.is_available())
          if torch.cuda.is_available():
              print("Device Name:", torch.cuda.get_device_name(0))
              print("Device Capability:", torch.cuda.get_device_capability(0))
              print("CUDA Device Count:", torch.cuda.device_count())
              
              # Allocate memory and perform matrix multiplication to generate GPU load
              print("Allocating tensors on GPU and starting matrix math load...")
              device = torch.device("cuda")
              x = torch.randn(10000, 10000, device=device)
              y = torch.randn(10000, 10000, device=device)
              
              # Keep running matrix multiplications to hold the CUDA context and load
              while True:
                  z = torch.matmul(x, y)
                  time.sleep(0.5)
          else:
              print("ERROR: CUDA is not available inside the container!")
              time.sleep(3600)
        resources:
          limits:
            nvidia.com/mig-1g.24gb: 1
          requests:
            nvidia.com/mig-1g.24gb: 1
```

### How to Verify Hardware-Level Isolation

Once the pod is running, exec into the container and run `nvidia-smi`. You will observe exactly **one GPU** with **24 GB VRAM**. The container is isolated from the other physical GPUs and slices, verifying secure and efficient hardware-level multi-tenancy:

```sh
root@utho-gpu-rtxpro6000-8-62383:~# kubectl exec -it pytorch-mig-demo-c9f7c8b49-sl5qh -- bash
root@pytorch-mig-demo-c9f7c8b49-sl5qh:/workspace# nvidia-smi 
Tue Jul 14 19:44:18 2026       
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 610.43.02              KMD Version: 610.43.02     CUDA UMD Version: 13.3     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA RTX PRO 6000 Blac...    On  |   00000000:61:00.0 Off |                   On |
| N/A   34C    P0            108W /  600W |                  N/A   |     N/A      Default |
|                                         |                        |              Enabled |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| MIG devices:                                                                            |
+------------------+----------------------------------+-----------+-----------------------+
| GPU  GI  CI  MIG |              Shared Memory-Usage |        Vol|        Shared         |
|      ID  ID  Dev |                Shared BAR1-Usage | SM     Unc| CE ENC  DEC  OFA  JPG |
|                  |                                  |        ECC|                       |
|==================+==================================+===========+=======================|
|  0    6   0   0  |            1786MiB / 24192MiB    | 46      0 |  1   1    1    0    1 |
|                  |               0MiB /  8317MiB    |           |                       |
+------------------+----------------------------------+-----------+-----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    0    6    0                1      C   python3                                1714MiB |
+-----------------------------------------------------------------------------------------+
```

The pod only sees the `1g.24gb` slice that has been given to it and nothing else. We get the 24Gi memory with this slice, as seen under the MIG devices section.

While the application is running in the pod using the slice, the same activity is visible from the host `nvidia-smi` output. The `MIG devices` section clearly indicates that a `1g.24gb` slice is being used by the application. This is the beauty of MIG.

On the host, we can see the same stats as inside the container. (Skipping some MIG slices and GPUs to keep the output short.)

```sh
root@utho-gpu-rtxpro6000-8-62383:~# nvidia-smi 

Tue Jul 14 19:52:39 2026       
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 610.43.02              KMD Version: 610.43.02     CUDA UMD Version: 13.3     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   2  NVIDIA RTX PRO 6000 Blac...    On  |   00000000:41:00.0 Off |                   On |
| N/A   26C    P8             40W /  600W |     256MiB /  97887MiB |     N/A      Default |
|                                         |                        |              Enabled |
+-----------------------------------------+------------------------+----------------------+
|   3  NVIDIA RTX PRO 6000 Blac...    On  |   00000000:61:00.0 Off |                   On |
| N/A   36C    P0            108W /  600W |    1977MiB /  97887MiB |     N/A      Default |
|                                         |                        |              Enabled |
+-----------------------------------------+------------------------+----------------------+
+-----------------------------------------------------------------------------------------+
| MIG devices:                                                                            |
+------------------+----------------------------------+-----------+-----------------------+
| GPU  GI  CI  MIG |              Shared Memory-Usage |        Vol|        Shared         |
|      ID  ID  Dev |                Shared BAR1-Usage | SM     Unc| CE ENC  DEC  OFA  JPG |
|                  |                                  |        ECC|                       |
|==================+==================================+===========+=======================|
|  2    3   0   0  |              64MiB / 24192MiB    | 46      0 |  1   1    1    0    1 |
|                  |               0MiB /  8317MiB    |           |                       |
+------------------+----------------------------------+-----------+-----------------------+
|  2    4   0   1  |              64MiB / 24192MiB    | 46      0 |  1   1    1    0    1 |
|                  |               0MiB /  8317MiB    |           |                       |
+------------------+----------------------------------+-----------+-----------------------+
|  2    5   0   2  |              64MiB / 24192MiB    | 46      0 |  1   1    1    0    1 |
|                  |               0MiB /  8317MiB    |           |                       |
+------------------+----------------------------------+-----------+-----------------------+
|  2    6   0   3  |              64MiB / 24192MiB    | 46      0 |  1   1    1    0    1 |
|                  |               0MiB /  8317MiB    |           |                       |
+------------------+----------------------------------+-----------+-----------------------+
|  3    3   0   0  |              64MiB / 24192MiB    | 46      0 |  1   1    1    0    1 |
|                  |               0MiB /  8317MiB    |           |                       |
+------------------+----------------------------------+-----------+-----------------------+
|  3    4   0   1  |              64MiB / 24192MiB    | 46      0 |  1   1    1    0    1 |
|                  |               0MiB /  8317MiB    |           |                       |
+------------------+----------------------------------+-----------+-----------------------+
|  3    5   0   2  |              64MiB / 24192MiB    | 46      0 |  1   1    1    0    1 |
|                  |               0MiB /  8317MiB    |           |                       |
+------------------+----------------------------------+-----------+-----------------------+
|  3    6   0   3  |            1786MiB / 24192MiB    | 46      0 |  1   1    1    0    1 |
|                  |               0MiB /  8317MiB    |           |                       |
+------------------+----------------------------------+-----------+-----------------------+
+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    3    6    0           698976      C   python3                                1714MiB |
+-----------------------------------------------------------------------------------------+
```

You can see the same `python3` process consuming GPU memory in both snippets (the container view and the host view) because both are looking at the same hardware-isolated MIG slice.

## The Platform Properties Compared

Here's the before-and-after, the way your finance and platform teams will evaluate it:

| Property | 8 whole GPUs | 32 MIG slices |
| --- | --- | --- |
| Schedulable GPU resources | 8 | 32 |
| Small workload claims | Entire 96GB card | One 24GB hardware-isolated slice |
| Isolation model | Software-level (container boundaries) | Silicon-level (memory crossbars + SM channels) |
| OOM blast radius | Can destabilize the whole card | Contained within the 24GB slice |
| Developer wait times | Queue behind 8 indivisible cards | Immediate self-service on 32 slices |
| Configuration | Ad-hoc `nvidia-smi` scripts | Declarative node labels via the GPU Operator |

## Conclusion

By architecting with Multi-Instance GPU (MIG) slicing, you transition your infrastructure from a series of monolithic, underutilized hardware blocks into an agile, multi-tenant AI developer platform.

Here's what you accomplished in this tutorial:

1. Understood the three-layer stack (kernel driver, container toolkit, device plugin) that connects Kubernetes to physical GPUs, and how the GPU Operator manages all of it.
2. Learned the GPU Instance / Compute Instance hierarchy and why MIG must partition both memory and compute to deliver true isolation.
3. Sliced 8 Blackwell cards into 32 hardware-isolated `1g.24gb` instances using host-level `nvidia-smi` commands.
4. Deployed the NVIDIA GPU Operator to make the whole configuration declarative and GitOps-friendly.
5. Diagnosed and fixed four real production pitfalls: non-standard containerd paths, MIG Manager overwrites, host-level state drift, and manual-mode Kubelet discovery.
6. Wired DCGM telemetry into a Prometheus + Grafana dashboard for slice-level observability.
7. Verified hardware-level multi-tenancy by running a PyTorch workload on a single `sm_120` slice and confirming isolation from both inside and outside the container.

Building a high-efficiency GPU platform is not just about having the fastest silicon. It's about managing and distributing that compute pool effectively. Slicing the Blackwell architecture with MIG gives you the balance of strict isolation, cost optimization, and developer self-service that makes the platform actually work.

If this was useful, the NVIDIA GPU Operator lives at [docs.nvidia.com](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/index.html) and on [GitHub](https://github.com/NVIDIA/gpu-operator), and the full MIG user guide is at [docs.nvidia.com/datacenter/tesla/mig-user-guide](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/).
