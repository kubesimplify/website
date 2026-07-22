---
title: "How to Share GPUs in Kubernetes at Scale with HAMi (Software vGPU Slicing)"
seoTitle: "HAMi vGPU on Kubernetes: Software GPU Slicing From 8 GPUs to 80 Schedulable Slices"
seoDescription: "Share GPUs in Kubernetes with HAMi software vGPU slicing: arbitrary memory and core limits per pod, the Helm values that control the split, a verified PyTorch manifest, a real OOM blast-radius test, and Prometheus monitoring."
datePublished: 2026-07-21T10:00:00.000Z
slug: sharing-gpus-in-kubernetes-with-hami
author: shubham-katara
authors: ["shubham-katara", "saiyam-pathak"]
cover: /img/blog/sharing-gpus-in-kubernetes-with-hami/cover.png
tags: ["kubernetes", "gpu", "nvidia", "platform-engineering"]
draft: false
sponsor:
  name: Utho
  url: "https://utho.com/?utm_source=Kubesimplify&utm_medium=docs&utm_campaign=Saiyam"
  # logoLight = navy mark (shown on light theme); logoDark = white mark (shown on dark theme)
  logoLight: /img/sponsors/utho-logo-light.png
  logoDark: /img/sponsors/utho-logo-dark.png
  blurb: "This deep dive ran on an 8x NVIDIA RTX PRO 6000 Blackwell node from Utho Cloud. If you need GPU infrastructure to run workloads like these, take a look."
---

Your platform team did everything right. You bought MIG-capable GPUs, carved them into hardware-isolated slices exactly like we did in [the MIG deep dive](/blog/slicing-gpus-in-kubernetes-with-nvidia-mig), and stopped handing a whole 96GB card to every notebook session that asked for one. And yet the tickets keep coming.

A team needs 8GB of VRAM, but the smallest MIG profile your cards offer is 24GB, so two-thirds of every slice they get sits idle, and you're back to arguing about waste, just at a smaller scale. Another team's workload outgrew its slice, and resizing it means draining every workload on that card and repartitioning the silicon.

And then there's the rest of your fleet: the consumer and prosumer cards, the older datacenter parts. GPUs that don't support MIG at all and are still being handed out whole, one pod per card, because Kubernetes has no other way to share them.

Hardware partitioning solved the problem it was designed for. What it can't give you is _flexibility_: arbitrary slice sizes, reconfiguration without downtime, and one sharing model across every GPU you own, MIG-capable or not.

In this article, you'll learn how to close that gap with **HAMi (Heterogeneous AI Computing Virtualization)**, a CNCF project which slices GPUs in software instead: any memory size, any compute percentage, enforced per container, on effectively any card. You'll see how to split physical GPUs into schedulable, memory-and-core-limited virtual GPUs inside a Kubernetes cluster, and what actually happens when one tenant tries to blow past its quota on a shared card. Not what should happen. We ran the test and captured it.

The walkthrough runs on our test rig: 8 NVIDIA RTX PRO 6000 Blackwell cards that Kubernetes sees as 80 schedulable vGPUs. That 10x split is not a hard limit or a magic number: it's one Helm value, covered below, and you can set it to whatever your workload mix calls for. The mechanics are identical whether you run 2 GPUs or 200.

Who this is for:

- Platform engineers who already run (or have evaluated) NVIDIA MIG and want to know what changes when isolation moves from silicon to software.
- Teams who need finer-grained GPU fractions than MIG's fixed profiles allow, or whose cards don't support MIG at all.

What you'll get from this guide:

- Why enterprises deliberately advertise a GPU node as having many times more schedulable units than it physically has, what actually bounds that number, and the pros and cons of running that config.
- A mental model for how HAMi enforces memory and compute limits without touching the hardware's memory crossbars.
- The exact Helm values that control the split factor, and how to size a workload's `nvidia.com/gpumem` / `nvidia.com/gpucores` requests.
- A verified Deployment manifest running a PyTorch workload against a HAMi vGPU slice on a Blackwell (`sm_120`) card.
- A concrete blast-radius test with captured output: one pod's process allocates past its memory grant while a second pod shares the same physical card.

Everything below was tested on a single node, but nothing about it is single-node specific. HAMi's device plugin runs as a DaemonSet on every GPU node you label.

## The Problem: Fixed Slices vs. Flexible Slices

MIG solves the "one pod locks a whole 96GB card" problem by carving the GPU into hardware-isolated partitions. But those partitions come in fixed profiles (`1g.24gb`, `2g.48gb`, and so on), decided at silicon-partition time, on hardware that supports MIG in the first place.

That creates its own friction:

- If a workload needs 8GB, the smallest MIG profile on this card is still 24GB. You're back to wasting VRAM, just less of it.
- Reslicing means stopping every process on the card, disabling persistence daemons, and (on older architectures) resetting the GPU.
- Cards without MIG support (most consumer and prosumer GPUs, and even some datacenter GPUs when running older drivers) simply can't do this at all.

**HAMi** takes a different approach: instead of partitioning silicon, it intercepts the calls a process makes (`hami-core` mode) to allocate GPU memory and enforces a memory/compute quota entirely in software. That means:

- Slices can be any size: `nvidia.com/gpumem: 8000` is a valid request, not just a fixed profile name.
- No GPU reset is required to change how a card is divided. The limits live in the pod spec, not the hardware.
- The same device plugin can front NVIDIA, AMD, Huawei Ascend, Cambricon, and several other accelerator vendors under one scheduling model.

The tradeoff, covered later in this guide, is that the isolation is enforced at the driver-API layer, not the memory-controller layer, which changes what "blast radius" means when something goes wrong.

## Prerequisites and System Specifications

Same physical box used for [the MIG walkthrough](/blog/slicing-gpus-in-kubernetes-with-nvidia-mig), just with a different piece of software layered on top:

- **Host OS:** Ubuntu 24.04.4 LTS on Utho Cloud.
- **Kubernetes:** v1.35.6, single control-plane node (`utho-gpu-rtxpro6000-8-62383`).
- **Container Runtime:** `containerd://2.2.1`.
- **CPUs:** 256 (248 allocatable).
- **RAM:** ~1.3TB (`1320697592Ki` capacity).
- **GPUs:** 8x NVIDIA RTX PRO 6000 Blackwell Server Edition (96GB VRAM / 97887 MiB each).

```bash
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

- **HAMi:** installed via Helm, release `hami`, chart `hami-2.9.0-a52b738`, in the `hami-system` namespace.

```bash
root@utho-gpu-rtxpro6000-8-62383:~# helm repo add hami-charts https://project-hami.github.io/HAMi/
root@utho-gpu-rtxpro6000-8-62383:~# helm repo update
root@utho-gpu-rtxpro6000-8-62383:~# VERSION=$(kubectl version | grep "Server Version:" | cut -d' ' -f3)
root@utho-gpu-rtxpro6000-8-62383:~# helm install hami hami-charts/hami --set scheduler.kubeScheduler.imageTag=$VERSION -n hami-system --create-namespace
root@utho-gpu-rtxpro6000-8-62383:~# helm list -n hami-system
NAME    NAMESPACE   REVISION    UPDATED                                     STATUS      CHART               APP VERSION
hami    hami-system 2           2026-07-16 11:30:02.969721978 +0000 UTC     deployed    hami-2.9.0-a52b738 2.9.0-a52b738
```

## How HAMi's Architecture Differs from the MIG Stack

The MIG stack layers a hardware partitioner (`nvidia-mig-manager`), a toolkit that mounts device files into containers, and a device plugin that advertises whatever profiles the hardware carved out. HAMi collapses that into three components that all live inside the `hami-system` namespace:

![HAMi's three-layer architecture: scheduling layer, enforcement layer, and the unmodified NVIDIA driver underneath](/img/blog/sharing-gpus-in-kubernetes-with-hami/hami-architecture.png)

### `hami-device-plugin` (DaemonSet, one per GPU node)

Registers with the host driver, reports each physical GPU's memory/UUID, and (this is the part that matters below) splits each physical GPU into N virtual counting units. It also runs a `vgpu-monitor` sidecar container that watches per-container GPU usage and logs enforcement events.

### `hami-scheduler` (Deployment, cluster-wide)

Replaces (or sits alongside, depending on config) the default Kubernetes scheduler. Because `scheduler.forceOverwriteDefaultScheduler: true` on this cluster, pods that don't even mention HAMi still get scheduled through it. An admission webhook rewrites/validates GPU resource requests so the vGPU-aware scheduling extender can bin-pack them correctly.

### `hami-core` (the actual enforcement mechanism)

This is a shared library HAMi mounts into every GPU workload container. It sits between the application and the real GPU. It intercepts calls used to allocate memory on the GPU and calls used to query the current memory allocation and availability of a specific NVIDIA GPU.

When a container's tracked allocation would exceed its configured `nvidia.com/gpumem` limit, `hami-core` fails the call. The physical GPU never even sees the request. This is also why `nvidia-smi` _inside_ a HAMi pod reports a virtualized total memory figure instead of the card's real 97887 MiB: the NVML calls are hooked too.

No custom `runtimeClassName` or container-toolkit injection is required for this. Unlike the MIG stack, HAMi doesn't need containerd to know about a special OCI runtime class. That's also why our working manifest (below) has no `runtimeClassName: nvidia` in it: the chart ships with `devicePlugin.createRuntimeClass: false` and `runtimeClassName: ""`.

## Why Enterprises Split One GPU Into Ten Schedulable Units

This node advertises `Capacity`/`Allocatable: nvidia.com/gpu: 80` for 8 physical cards, a 10x split. That's not an artifact of this particular install; it's the HAMi chart's own default (`devicePlugin.deviceSplitCount: 10`), and it reflects a pattern enterprises reach for deliberately on shared GPU infrastructure.

### Why enterprises do this

- GPUs are the most expensive, most contended line item in an AI platform's budget. Handing out an entire 96GB Blackwell card to every workload that requests one is the same "whole GPU, fractional job" waste MIG was built to solve, except here there's no hardware partitioning available or wanted.
- Most workloads on a shared dev/inference cluster don't need a whole card: a small inference replica, a notebook session, a CI job exercising a training script. Advertising only 8 whole-GPU units forces the scheduler to hand one entire card to each of these, even though each one uses a sliver of it.
- Splitting each physical GPU into many schedulable units lets the platform present GPU capacity the same way it already presents CPU and memory (many small, quota-bound, self-service units) instead of 8 indivisible blocks that need a platform ticket to share.

### Why this cluster runs the default 10x split, and what actually bounds it

Nobody tuned `deviceSplitCount` for this install; it's the value that ships out of the box with the chart. That's worth being precise about: **the "10" is a scheduling multiplier, not a capacity promise.** What actually stops ten tenants on one card from starving each other is `deviceMemoryScaling: 1` and `deviceCoreScaling: 1` (no oversubscription configured), so the sum of every pod's `nvidia.com/gpumem` and `nvidia.com/gpucores` on a given physical GPU is still hard-capped at its real 97887 MiB and 100% SM. The split count decides how many _pods_ can be scheduled onto a card; the scaling values decide how much _resource_ those pods can collectively claim.

### Pros

- **Density and self-service.** Ten small workloads can land on one card without a platform engineer intervening, the same experience teams already expect from CPU/memory requests.
- **Utilization goes up without buying hardware.** Idle VRAM/SM capacity on a card running one small job gets reclaimed by other tenants instead of sitting unused, the same utilization argument MIG makes, achieved in software instead of silicon.
- **No fixed-profile tax.** Unlike MIG's `1g.24gb` minimum, a tenant can request exactly `nvidia.com/gpumem: 2000` if that's all it needs. The split count only governs how many concurrent pods fit on a card, not how much VRAM each one is forced to take.

### Cons

- **The headline number is misleading if read literally.** `nvidia.com/gpu: 80` looks like 10x the compute capacity of the box. It isn't; it's 10x the scheduling slots. Capacity planning has to be done in `gpumem`/`gpucores` terms, not by counting `nvidia.com/gpu`.
- **A high split count invites over-scheduling pressure.** A tenth pod can still get scheduled onto a card the moment a free `nvidia.com/gpu` slot exists, even if the other nine pods on that card have already claimed the physical GPU's entire real memory and compute budget between them. The split count and the actual physical ceiling can drift apart from a scheduling perspective, and that tenth pod fails at runtime, not at admission time.
- **Enforcement is software, not hardware.** The isolation between those 10 slots is `hami-core` intercepting driver calls, a materially different (and weaker) guarantee than MIG's silicon partition, covered next. A higher split count just means more tenants sharing that same software-enforced boundary on one card.

### The evidence, if you want to check it yourself

The split factor shows up in the node's `hami.io/node-nvidia-register` annotation, where each of the 8 physical GPUs is registered with `"count": 10`:

```bash
root@utho-gpu-rtxpro6000-8-62383:~# kubectl describe node utho-gpu-rtxpro6000-8-62383
...
Annotations:        ...
                    hami.io/node-handshake: Requesting_2026-07-16 10:08:42
                    hami.io/node-nvidia-register:
                      [{"id":"GPU-4c395b7a-a7e6-d90f-1ced-d96e8dd68288","index":4,"count":10,"devmem":97887,"devcore":100,"type":"NVIDIA RTX PRO 6000 Blackwell ...
...
Capacity:
  nvidia.com/gpu:     80
  ...
Allocatable:
  nvidia.com/gpu:     80
  ...
```

```
8 physical GPUs × 10 virtual units/GPU = 80 allocatable nvidia.com/gpu
```

## Reading the Helm Values That Control the Split

The `count: 10` comes straight from the Helm release's computed values:

```bash
root@utho-gpu-rtxpro6000-8-62383:~# helm get values -n hami-system hami --all
```

```yaml
devicePlugin:
  deviceSplitCount: 10
  deviceMemoryScaling: 1
  deviceCoreScaling: 1
  migStrategy: none
  disablecorelimit: "false"
  enableNumaTopology: true
  nodeConfiguration:
    config: |
      {
        "nodeconfig": [
          {
            "name": "your-node-name",
            "operatingmode": "hami-core",
            "devicememoryscaling": 1,
            "devicesplitcount": 10,
            "preconfigureddevicememory": 0,
            "enablenumatopology": false,
            "migstrategy": "none",
            "filterdevices": { "uuid": [], "index": [] },
            "enablegetpreferredallocation": false
          }
        ]
      }
    externalConfigName: ""
  nvidiaNodeSelector:
    gpu: "on"
resourceName: nvidia.com/gpu
resourceMem: nvidia.com/gpumem
resourceMemPercentage: nvidia.com/gpumem-percentage
resourceCores: nvidia.com/gpucores
scheduler:
  defaultSchedulerPolicy:
    gpuSchedulerPolicy: spread
    nodeSchedulerPolicy: binpack
  forceOverwriteDefaultScheduler: true
```

The fields that matter most day-to-day:

- **`deviceSplitCount: 10`** is the multiplier behind the 80. Set this lower (e.g. `1`) if you want `nvidia.com/gpu` to map 1:1 to physical cards and rely purely on `gpumem`/`gpucores` for fractioning.
- **`deviceMemoryScaling: 1`** is a multiplier on how much virtual memory HAMi will let you _oversubscribe_ per device. `1` means no oversubscription: the sum of all `gpumem` requests on a card can't exceed its real 97887 MiB. Values above `1` let you promise more virtual memory than physically exists (useful for bursty, rarely-concurrent workloads; risky otherwise).
- **`deviceCoreScaling: 1`** is the same idea for `gpucores`, no compute oversubscription.
- **`migStrategy: none`** means HAMi is not layering on top of MIG partitions here; it's doing pure `hami-core` software slicing against whole physical GPUs.
- **`nvidiaNodeSelector.gpu: "on"`** restricts the device plugin to nodes labeled `gpu=on`, which matches the label already on this node.

## How to Request vGPU Slices in a Pod Spec

Where a MIG-based manifest requests a fixed profile (`nvidia.com/mig-1g.24gb: 1`), a HAMi manifest requests three independent numbers:

```yaml
resources:
  limits:
    nvidia.com/gpu: 1 # 1 share of a physical GPU (out of deviceSplitCount)
    nvidia.com/gpumem: 8000 # 8000 MiB of VRAM, enforced by hami-core
    nvidia.com/gpucores: 10 # 10% of the GPU's SM/core capacity
```

Here's the full Deployment we ran on this node: the same PyTorch matmul workload used to validate the MIG setup, ported to HAMi's resource model and with every MIG-specific field removed (`runtimeClassName: nvidia` is gone, since HAMi doesn't need it; the resource block no longer references `mig-1g.24gb`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pytorch-hami-demo
  labels:
    app: pytorch-hami-demo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: pytorch-hami-demo
  template:
    metadata:
      labels:
        app: pytorch-hami-demo
    spec:
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

              print("=== CUDA vGPU Slice Diagnostics ===")
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
              nvidia.com/gpu: 1
              nvidia.com/gpumem: 8000
              nvidia.com/gpucores: 10
            requests:
              nvidia.com/gpu: 1
              nvidia.com/gpumem: 8000
              nvidia.com/gpucores: 10
```

Scaling this to `replicas: 2` puts two independent 8000 MiB / 10% slices on the cluster. The `spread` scheduling policy means HAMi will try to land them on two _different_ physical GPUs before stacking a second tenant onto a card that already has one. But with only one node and `binpack` at the node level, both replicas end up on this box, each pinned to its own share.

Here are both replicas running, four days in, with `nvidia-smi` executed inside each pod. Look at the memory column: each pod sees a "GPU" whose total is **8000MiB**, not the card's real 97887 MiB. That's `hami-core` hooking the NVML query calls, and it's your day-one proof that the enforcement library is actually loaded:

![Two pods sharing one physical GPU, each seeing a virtualized 8000MiB total in nvidia-smi](/img/blog/sharing-gpus-in-kubernetes-with-hami/two-pods-one-gpu.png)

One more resource worth knowing before you write manifests for a mixed fleet: **`nvidia.com/gpumem-percentage`**. Instead of a fixed MiB figure, it requests a percentage of whichever card the scheduler picks. `nvidia.com/gpumem-percentage: 50` claims half the VRAM of the GPU the pod lands on. On a uniform fleet like this one (every card is 97887 MiB) the two styles are interchangeable, but on a heterogeneous fleet (say, 24GB L4s next to 96GB Blackwells), a percentage request scales with the card while a fixed `gpumem` request doesn't. Pick one style per container; don't set both.

## How to Verify Where a Slice Landed

With `deviceSplitCount: 10` in play, "my pod got a GPU" no longer tells you _which_ GPU, and whether two replicas share a physical card is exactly what the blast-radius test below depends on. HAMi records its placement decision as annotations on the pod itself:

```bash
kubectl get pod <pod-name> -o jsonpath='{.metadata.annotations}' | python3 -m json.tool
```

The annotation to look for is `hami.io/vgpu-devices-allocated`. Its value encodes the physical GPU UUID, vendor, memory grant, and core grant for each device the container was given. For example, a pod holding one of our slices reports `GPU-4c395b7a-...,NVIDIA,8000,10:;`, which maps directly back to GPU 4 in the `nvidia-smi -L` output from the prerequisites section.

Two ways to cross-check that annotation against reality:

- **From the host:** `nvidia-smi --query-compute-apps=gpu_uuid,pid,used_memory --format=csv` shows which physical card each container's process is actually attached to. The UUID column should match the annotation.
- **Across replicas:** run the `jsonpath` command against both pods. Same UUID means they share a card (what we want for the blast-radius test); different UUIDs means the `spread` policy separated them and you'll need to pin them together, or add replicas until two land on the same card.

## Software Isolation vs. Hardware Isolation

This is the tradeoff worth internalizing before you rely on HAMi for hard multi-tenancy:

|                                                           | **MIG**                                             | **HAMi (`hami-core`)**                                                                                                |
| --------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Isolation boundary                                        | Physical memory crossbars + dedicated SM partitions | Intercepted CUDA/NVML calls (LD_PRELOAD)                                                                              |
| Granularity                                               | Fixed profiles (`1g.24gb`, `2g.48gb`, ...)          | Arbitrary MiB / arbitrary %                                                                                           |
| Requires hardware support                                 | Yes (Ampere+ datacenter GPUs)                       | No; works on any NVIDIA GPU, and other vendors                                                                        |
| Reconfiguration cost                                      | GPU reset, evict all workloads                      | None; it's just a different resource request                                                                          |
| What a well-behaved pod sees                              | Its own literal hardware slice                      | A virtualized "GPU" whose reported total is its `gpumem` limit                                                        |
| What happens if a process bypasses the interception layer | Not possible; the boundary is physical              | The quota could theoretically be circumvented by a process that talks to the driver in a way `hami-core` doesn't hook |
| Failure containment                                       | Guaranteed at the silicon level                     | Enforced in the same address space as every other tenant's driver calls                                               |

There's a third option worth naming, because it's the one most teams try first: **NVIDIA's time-slicing** (the stock `nvidia-device-plugin` with a time-slicing config). It also advertises one card as N schedulable units, but it enforces nothing. No memory cap, no compute cap; every tenant sees the full card, and one greedy `cudaMalloc` loop genuinely OOMs its neighbors. On the isolation spectrum, time-slicing sits at the loose end, MIG at the strict end, and HAMi in between: software-enforced quotas without hardware requirements. If you're already comfortable advertising 10 slots per card, HAMi buys you that same density _plus_ an actual quota, which is why it's the more defensible default for a shared cluster than time-slicing.

Neither MIG nor HAMi is "better" in the abstract. MIG is the right call when you need airtight multi-tenancy and your hardware supports it; HAMi is the right call when you need finer granularity, cheaper reconfiguration, or hardware MIG doesn't support your card. What you should not do is assume HAMi's limits are as physically absolute as MIG's. That assumption is exactly what the next section tests.

## Testing the Blast Radius: What Happens When a Pod Exceeds Its Memory Quota

With two replicas of `pytorch-hami-demo` running, each holding its own 8000 MiB / 10% share on the _same_ physical GPU, the natural question is: if one pod's process tries to allocate past its 8000 MiB limit, does it only break that pod, or does it take the neighbor down too?

Because HAMi's enforcement lives in `hami-core`'s intercepted `cudaMalloc`, not in the real driver, the expectation is that the failure is contained to the offending container's own allocation calls: the neighboring pod's driver calls are unaffected, and the physical GPU (which still has plenty of real headroom out of its 97887 MiB) never sees a genuine out-of-memory condition.

We ran it. Here's exactly what happened.

### Step 1: Spike memory usage from inside the pod

No need to touch the Deployment. Exec in and allocate tensors in a loop until `hami-core` refuses the allocation:

```bash
kubectl exec -it <pod-name> -- python3 -c "
import torch
device = torch.device('cuda')
tensors = []
i = 0
try:
    while True:
        t = torch.randn(20000, 20000, device=device)  # ~1.6 GB per tensor
        tensors.append(t)
        i += 1
        allocated = torch.cuda.memory_allocated(device) / 1024**2
        print(f'tensor {i}: torch-reported allocated = {allocated:.0f} MiB')
except RuntimeError as e:
    print('FAILED at tensor', i)
    print(e)
"
```

We ran this inside one of the two replicas. Its main matmul process was already holding about 2 GiB, so the spike script's tensors stacked on top of that within the same 8000 MiB container budget:

```
tensor 1: torch-reported allocated = 1526 MiB
tensor 2: torch-reported allocated = 3052 MiB
tensor 3: torch-reported allocated = 4578 MiB
[HAMi-core ERROR (pid:4309 ... allocator.c:52)]: Device 0 OOM 9185657856 / 8388608000
FAILED at tensor 3
CUDA out of memory. Tried to allocate 1.49 GiB. GPU 0 has a total capacity of 7.81 GiB ...
```

Read that `HAMi-core ERROR` line carefully, because it's the entire architecture in one log entry. The allocation would have pushed the container to 9,185,657,856 bytes against a limit of 8,388,608,000 bytes (exactly 8000 MiB), so `hami-core`'s allocator rejected the call itself. 

PyTorch then reports "GPU 0 has a total capacity of 7.81 GiB": that's the virtualized 8000 MiB total, not the card's real 96GB. The physical GPU had roughly 80GB free at that moment. The OOM is a software verdict, not a hardware condition.

Here's the offending pod's own view at the peak of the spike, alongside the failing run:

![The pod's virtualized nvidia-smi pinned near its 8000MiB grant while hami-core rejects the next allocation](/img/blog/sharing-gpus-in-kubernetes-with-hami/oom-blast-radius.png)

What the captured run shows:

- **The offending pod**: its own `nvidia-smi` reports 7235MiB used of an 8000MiB total, with both of its python processes accounted (the original matmul loop plus the spike script). The OOM it hits is scoped to a number far below the card's actual capacity: proof the limit is enforced per-container, not derived from real GPU pressure.
- **The neighboring pod**: kept printing its matmul loop the entire time, still holding its steady ~2107MiB of its own 8000MiB grant. It shares the same physical GPU, but its `cudaMalloc` calls are accounted separately by `hami-core`, so another container's overreach doesn't starve it.
- **The host**: the card's real free memory (plenty, even with two 8000 MiB tenants on a 97887 MiB card) was irrelevant to whether the call succeeded. The allocation attempt never reached the real driver.

The result: HAMi's isolation is real and per-container, but it's a software contract enforced by a shared library sitting in the same process space as the workload, a meaningfully different guarantee than MIG's silicon-level partition, even though both stop one tenant's memory use from crashing another's.

## Monitoring the Slices

A one-off blast-radius test proves the enforcement works. Running ten tenants per card in production requires watching it continuously, and HAMi ships two Prometheus-format endpoints for exactly that, no extra components needed.

**The scheduler's view:** cluster-wide allocation state, exposed by the `hami-scheduler` service (NodePort `31993` by default):

```bash
curl http://<scheduler-node-ip>:31993/metrics
```

This answers capacity-planning questions: how much of each physical GPU's memory and core budget is already promised to pods (`hami_gpu_memory_allocated_bytes`, `hami_gpu_core_allocated_ratio`, per device UUID), and which pods hold which slices (`hami_vgpu_memory_allocated_bytes`). This is the number to alert on _before_ the over-scheduling scenario from the cons list above: a card whose committed `gpumem` is at 100% still shows free `nvidia.com/gpu` slots, and this endpoint is where that gap becomes visible.

**The node's view:** real-time per-container usage, exposed by the `vgpu-monitor` sidecar on each GPU node (port `9394` by default):

```bash
curl http://<gpu-node-ip>:9394/metrics
```

This is the enforcement-side counterpart: actual VRAM and core utilization per container versus its granted limit. A tenant sitting permanently at 95% of its `gpumem` grant is a resize conversation waiting to happen; a tenant at 5% is stranded capacity you can reclaim.

Wire the scheduler endpoint into Prometheus and a few panels give you the dashboard a shared-GPU platform actually needs. 

Here's ours during the test: 8 physical GPUs, 2 vGPU containers on 1 shared card, each holding a 7.81 GiB / 10% grant, and the per-GPU allocation sitting miles under the physical limit line:

![Grafana dashboard built from HAMi scheduler metrics: fleet stats, per-pod slices, and per-GPU allocation against the physical limit](/img/blog/sharing-gpus-in-kubernetes-with-hami/hami-grafana-dashboard.png)

Port numbers are chart defaults, so confirm them against your release's Services before pointing scrape configs at them.

## Common Pitfalls and How to Solve Them

### Pitfall A: Assuming `nvidia.com/gpu` Count Reflects Physical GPU Count

The first time you see `nvidia.com/gpu: 80` on an 8-GPU node, it's easy to assume something is broken. It isn't; it's `devicePlugin.deviceSplitCount` doing its job. Check the `hami.io/node-nvidia-register` annotation before assuming a misconfiguration; the `"count"` field per GPU entry tells you the actual split factor in effect.

### Pitfall B: Forgetting `gpumem`/`gpucores` and Only Setting `nvidia.com/gpu`

Requesting only `nvidia.com/gpu: 1` gets you a share slot, but without `nvidia.com/gpumem` and `nvidia.com/gpucores` you haven't actually bounded what that share can consume. You're relying on `deviceMemoryScaling`/`deviceCoreScaling` defaults and whatever's left on the card. Always set explicit `gpumem`/`gpucores` limits for workloads sharing a physical GPU with other tenants.

### Pitfall C: Leftover MIG/Runtime-Class Fields From a Previous Setup

If a manifest was adapted from a MIG-based deployment (like ours was), watch for stale `runtimeClassName: nvidia` entries and `nvidia.com/mig-*` resource requests. HAMi's chart ships with `devicePlugin.createRuntimeClass: false`, so a runtime class reference that doesn't exist on the cluster will leave the pod stuck in `CreateContainerConfigError` rather than scheduling normally.

### Pitfall D: Blaming HAMi for a Slow First Deployment

The NGC PyTorch image used above is a multi-gigabyte pull. On a fresh node, the pod will sit in `ContainerCreating` for several minutes while containerd downloads it, which looks a lot like a scheduling or webhook failure if you're watching for HAMi problems. `kubectl describe pod` disambiguates instantly: a `Pulling image` event means wait; a `FailedScheduling` event mentioning `nvidia.com/gpumem` means the card genuinely can't fit your request alongside its existing tenants.

### Pitfall E: Treating `hami-core` Limits as Hardware-Equivalent to MIG

As covered above, plan your multi-tenancy story around what `hami-core` actually guarantees (per-container quota enforcement via intercepted driver calls), not around MIG's stronger silicon-level isolation. If your workloads are adversarial or security-sensitive rather than merely cooperative and resource-bounded, MIG (or a dedicated node) is the safer choice.

## Conclusion

HAMi trades MIG's hardware guarantees for flexibility: any memory size, any compute percentage, no GPU resets, and support across a wider range of hardware than MIG-capable datacenter cards.

Here's what this setup walked through:

1. Installed HAMi via Helm into `hami-system` and confirmed the node registers `nvidia.com/gpu: 80` for 8 physical GPUs.
2. Traced that number back to a single Helm value, `devicePlugin.deviceSplitCount: 10`, and read through the rest of the chart's device-plugin and scheduler configuration.
3. Rewrote a MIG-based PyTorch Deployment into HAMi's resource model (`nvidia.com/gpu`, `nvidia.com/gpumem`, `nvidia.com/gpucores`), stripping the now-unnecessary `runtimeClassName` and MIG resource references.
4. Ran two replicas sharing one physical GPU, each pinned to an 8000 MiB / 10% share, and proved it from inside the pods, from the placement annotations, and from the host.
5. Ran the blast-radius test and captured `hami-core` rejecting the over-quota allocation (driver-API interception, not memory-controller partitioning) while the neighboring pod on the same card never noticed.
6. Traced any pod back to its physical GPU via the `hami.io/vgpu-devices-allocated` annotation, and wired the scheduler and node metrics endpoints into a Grafana dashboard for ongoing capacity and usage monitoring.
7. Documented where HAMi's isolation model sits on the spectrum (stronger than time-slicing's non-existent enforcement, weaker than MIG's silicon partitions) so that choice gets made deliberately rather than assumed.

The payoff: developers get fractional, self-service GPU access with much cheaper reconfiguration than MIG, on hardware MIG can't even touch, as long as the platform team understands exactly what kind of isolation they're signing up for.

If this was useful, HAMi is a CNCF project: the docs live at [project-hami.io](https://project-hami.io/) and the source at [github.com/Project-HAMi/HAMi](https://github.com/Project-HAMi/HAMi). For the hardware-isolation side of this story, start with our [MIG deep dive](/blog/slicing-gpus-in-kubernetes-with-nvidia-mig).
