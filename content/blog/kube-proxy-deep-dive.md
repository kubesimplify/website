---
title: "How kube-proxy Actually Works — iptables, IPVS, and nftables Inside Out"
seoTitle: "kube-proxy modes deep dive — iptables vs IPVS vs nftables"
seoDescription: "How kube-proxy turns Kubernetes Services into kernel rules. iptables, IPVS, nftables packet paths and which to pick in 2026. Verified against k/k 1.36 source."
datePublished: 2026-05-25T13:00:00.000Z
slug: kube-proxy-deep-dive
author: saiyam-pathak
cover: /img/blog/kube-proxy-deep-dive/cover.png
tags: ["kubernetes", "kube-proxy", "iptables", "nftables", "networking"]
---

You create a Service in Kubernetes. It gets a virtual IP. But that IP is not real. No network card owns it. No machine is listening on it. So how do packets headed there actually find the right pod?

The answer is **kube-proxy**. And it does that job in three different ways.

This post walks the full picture: what kube-proxy actually is, the three modes it runs in (iptables, IPVS, nftables), the packet path through each one, where the performance crossover is, and what you should actually pick in 2026. Every claim verified against `kubernetes/kubernetes` 1.36 source.


## TL;DR

1. **What kube-proxy is.** A daemon on every node. It watches Services and EndpointSlices via informers, diffs the new state against what the kernel currently has, then calls `syncProxyRules()` to push updates. Backend is one of: iptables (default), IPVS, or nftables.
2. **iptables mode.** Three chains: `KUBE-SERVICES` matches by ClusterIP+port → jumps to a per-Service chain `KUBE-SVC-XXXX` → linear walk through declining-probability rules → jumps to a `KUBE-SEP-YYYY` chain which DNATs to a real pod IP. Linear scan, O(n) per first packet of a new connection.
3. **IPVS mode.** Kernel L4 load balancer on a dummy interface `kube-ipvs0`. ClusterIPs are added to that interface. One hash table lookup picks a virtual service. A scheduler algorithm (rr/lc/sh/dh/mh/wlc/wrr/nq/sed) picks a real server. O(1). But still uses iptables for masquerade, source rewriting, and external traffic policy.
4. **nftables mode.** One table named `kube-proxy`. Inside it, a single verdict map dispatches by destIP:port → per-Service chain → DNAT. Stable since Kubernetes 1.33, but **iptables is still the upstream default**. Requires Linux kernel 5.13 or newer.
5. **What to pick.** Small or default cluster: stay on iptables. Large cluster on a modern kernel: move to nftables. Do not pick IPVS for new deployments — it was deprecated in 1.35.

## Part 1: What kube-proxy actually is

kube-proxy is a daemon. It runs on every node, deployed as a DaemonSet in nearly every Kubernetes installer. Its core Service-proxy loop **watches Services and EndpointSlices**: when either changes, kube-proxy reconciles the desired state against the kernel's current rules, then calls `syncProxyRules()` to apply backend-specific updates. Since 1.28, this is incremental — only the Services and EndpointSlices that actually changed get rewritten. (kube-proxy also has other paths it manages on the node — node label tracking, conntrack cleanup — but the Service proxy loop is the one we care about here.)

That is the whole loop. Watch, reconcile, push to the kernel. The interesting part is **how** `syncProxyRules()` writes those rules into the kernel. That is where the three modes come in.

The mode is chosen with the `--proxy-mode` flag:

```bash
kube-proxy --proxy-mode=iptables   # default
kube-proxy --proxy-mode=ipvs       # deprecated in 1.35
kube-proxy --proxy-mode=nftables   # stable since 1.33
```

All three modes do the same job. The packet path through the kernel is completely different.

## Part 2: iptables mode

This is what almost every cluster in production today runs. The pattern is three iptables chains deep.

A packet enters the node, destined for a Service's ClusterIP. It hits the `KUBE-SERVICES` chain. That chain has one rule per Service port:

```
-A KUBE-SERVICES -d 10.96.255.20/32 -p tcp --dport 80 -j KUBE-SVC-FXIYY
```

Match the ClusterIP plus port, jump to a per-Service chain named `KUBE-SVC-XXXX`. Inside that chain, one rule per backend pod, with a declining-probability pattern:

```
-A KUBE-SVC-FXIYY -m statistic --mode random --probability 0.333 -j KUBE-SEP-1
-A KUBE-SVC-FXIYY -m statistic --mode random --probability 0.500 -j KUBE-SEP-2
-A KUBE-SVC-FXIYY -j KUBE-SEP-3
```

The math works out — each pod gets exactly one third of the traffic. The chosen rule jumps to a per-endpoint chain `KUBE-SEP-YYYY`, which has the actual DNAT:

```
-A KUBE-SEP-2 -j DNAT --to-destination 10.244.2.18:80
```

The kernel rewrites the destination of the packet from the virtual ClusterIP to a real pod IP. The packet is now headed at a real pod, on a real node. The kernel's conntrack table remembers this NAT so the return traffic gets rewritten back.

**This walk is O(n).** Every Service port adds a rule to `KUBE-SERVICES`. Every backend adds rules to its per-Service `KUBE-SVC` chain. A cluster with 100 Services and a few hundred endpoints is fine. A cluster with 5000 Services and tens of thousands of endpoints starts hurting — and that pain shows up in two places: the per-packet lookup (paid on the first packet of every new connection, with conntrack handling the rest), and the rule update time itself.

Modern kube-proxy has reduced the old full-rewrite-on-every-change behavior since 1.28 — it now does more minimal updates. But large rule sets are still expensive to apply, and while an update is in progress, the rules on that node are slightly behind reality. That is the wall iptables hits at scale.

## Part 3: IPVS mode

IPVS (IP Virtual Server) is a kernel L4 load balancer that ships in mainline Linux. It is used outside Kubernetes too — `ipvsadm` is the userspace tool. When kube-proxy runs in IPVS mode, it does something specific: it creates a dummy network interface called `kube-ipvs0` and adds every Service's ClusterIP to it.

```bash
$ ip addr show kube-ipvs0
kube-ipvs0: <BROADCAST,NOARP> mtu 1500
    inet 10.96.255.20/32 scope global kube-ipvs0
    inet 10.96.255.21/32 scope global kube-ipvs0
    ...
```

Now when a packet headed at a ClusterIP arrives at the node, the kernel sees the address is local to `kube-ipvs0`. Instead of routing it, it hands it to IPVS. IPVS looks up the virtual service in its hash table — **one lookup, O(1), regardless of how many Services exist**. Then the IPVS scheduler picks a real server. The default is `rr` (round-robin), but you can choose:

- `lc` — least connections
- `sh` — source hash (session affinity by client IP)
- `dh` — destination hash
- `mh` — Maglev hash
- `wlc` / `wrr` — weighted variants
- `nq` / `sed` — never queue / shortest expected delay

The kernel does the DNAT, conntrack records it, packet routes to the pod. Done.

**Here is a thing not everyone knows.** IPVS mode does not actually replace iptables. It still uses iptables behind the scenes for things like rewriting source IPs, handling traffic coming in from outside the cluster, and a few corner cases the IPVS kernel module cannot do on its own. So even when you turn IPVS mode on, there are iptables rules running. They are just smaller, and they are not the thing the kernel uses to pick a backend pod.

IPVS solved the iptables scale problem for years. But it requires the IPVS kernel module to be loaded — some hardened distros do not have it — and the mode itself was **deprecated in Kubernetes 1.35** (PR #134539). Users are encouraged to move to nftables for new deployments.

## Part 4: nftables mode

nftables is the modern alternative. It went stable in Kubernetes 1.33 (alpha 1.29, beta 1.31, GA 1.33). It uses the same netfilter infrastructure as iptables underneath, but with a much better data structure: **verdict maps**.

In nftables mode, kube-proxy creates a single table named `kube-proxy`. Inside it sits a verdict map. The key is `destIP:port`. The value is a jump to the per-Service chain:

```
table ip kube-proxy {
  chain services {
    ip daddr . tcp dport vmap @service-vmap
  }
  map service-vmap {
    type ipv4_addr . inet_service : verdict
    elements = {
      10.96.255.20 . 80 : jump svc-FXIYY,
      10.96.255.21 . 80 : jump svc-ABCDE,
      ...
    }
  }
}
```

**One lookup. O(1).** Same complexity as IPVS, but using mainline netfilter instead of a separate kernel module. No need to load anything extra. No iptables-restore bottleneck. No IPVS module dependency.

And here is why nftables matters. It went stable in 1.33. It is still not the default — **iptables holds that spot**. But nftables is now the recommended path for any cluster running a modern Linux kernel. The iptables era is not ending overnight. But the door to leave it is officially open.

One requirement worth knowing: the kernel must be **Linux 5.13 or newer**. kube-proxy literally fails to start in nftables mode on older kernels — there's an explicit version check in `pkg/proxy/nftables/supported.go` that returns *"kube-proxy in nftables mode requires kernel 5.13 or later"* if the kernel is too old.

## Part 5: Performance crossover

Three modes. Three scale curves.

- **iptables** — O(n) on the first packet of a new connection. The bigger story is sync time: with a large rule set, an iptables update can take real wall-clock time to apply.
- **IPVS** — O(1) hash lookup per packet, constant time regardless of Service count. Sync time is much smaller than iptables because IPVS updates are incremental at the kernel level.
- **nftables** — also O(1) per packet via verdict map, and update time stays in milliseconds for typical incremental changes (the kernel data structure was designed for this).

The big surprise for most people is not how fast or slow the packet lookup is. It is how long it takes to **update the rules**. In a large cluster, an iptables update can take seconds. It depends on how many Services and endpoints you have, what hardware the node is running, the kube-proxy version. And while that update is running, the node is operating on slightly stale rules. nftables, by contrast, applies the same kind of change in milliseconds. Orders of magnitude faster.

**Rule of thumb:** iptables is fine up to a few hundred Services. Above ~1000 Services, watch your `kube-proxy` sync metrics. For very large clusters, evaluate nftables.

## Part 6: What to actually pick in 2026

So how do you actually decide?

| Scenario | Pick |
|---|---|
| Small or default cluster (under ~1000 Services) | **iptables** — mature, upstream default, no reason to switch |
| Large cluster on Linux 5.13+ with a modern CNI | **nftables** — stable since 1.33, scales much better |
| Older Linux kernel without nftables-mode support | **iptables** — do NOT default to IPVS, it is deprecated |
| Already on IPVS, working fine in production | **IPVS** — keep using it for now, but plan a migration to nftables |
| Brand-new cluster spinning up in 2026 | **iptables for default workloads · nftables when you outgrow it** |

Note the last row. nftables is now the recommended direction, but the upstream default is still iptables, and that is fine for the vast majority of clusters.

## Wrap

That is kube-proxy. One daemon, running on every node, watching Services and EndpointSlices, programming the kernel. Three modes. One job. It is the most boring sounding component in Kubernetes networking, and it is the one that actually makes Services work.

Now you know which mode is running on your cluster, and why it matters.

---

**Next deep dive:** topology-aware routing — how kube-proxy uses the `hints.forZones` field on EndpointSlices to keep traffic same-zone, and what happens when a zone goes underweight.
