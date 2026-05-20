---
title: "How Kubernetes EndpointSlices Actually Work (and Why Endpoints Had to Die)"
datePublished: 2026-05-11T17:09:39.080Z
slug: how-kubernetes-endpointslices-actually-work-and-why-endpoints-had-to-die
author: saiyam-pathak
cover: /img/blog/how-kubernetes-endpointslices-actually-work-and-why-endpoints-had-to-die/35ce64fb-8023-4898-b97c-6265d74e56d2.png
tags: ["kubernetes", "devops", "networking", "kube-proxy", "endpointslices"]
cuid: cmp1ginph00e92dlc5s3b31x9
---
A Service has no pod IPs in it. We covered that in the last post. So somewhere, something is keeping a list of every pod IP that matches the Service's label selector. So that kube-proxy can program the kernel. So that CoreDNS can answer a Headless lookup. **That somewhere is an EndpointSlice.**

This post walks the full picture: why the original `Endpoints` API had to be replaced, what is actually inside a slice, the three conditions that decide whether traffic flows to a pod, how zone-aware routing works through topology hints, who watches these things, and a real cluster demo at the bottom. Every claim is verified against `kubernetes/kubernetes` 1.36 source and CoreDNS 1.11.

%[https://youtu.be/_MJ1ou-Oj-s?si=Zi9vHbI_Bf_snVlo] 

## TL;DR

1.  **Why slices exist.** The legacy `Endpoints` object held every backend pod IP in one blob. Three thousand pods meant a giant object, watched by every kube-proxy on every node, rewritten on every change. It did not scale. EndpointSlices (GA in 1.21) replaced it with many small objects capped at 100 endpoints each.
    
2.  **What is in a slice.** An `addressType` (`IPv4` or `IPv6`, plus an unused `FQDN`), a list of endpoints with conditions and a `targetRef` pointing back at the pod, a list of ports, and labels that bind it to its parent Service.
    
3.  **Three conditions.** `Serving` tracks the readiness probe. `Terminating` flips during pod deletion. `Ready` is the convenience flag — shorthand for `Serving=true AND Terminating=false`. The split exists so kube-proxy can keep using a draining pod that still answers requests.
    
4.  **Topology hints.** Each endpoint can carry a `hints.forZones` field. kube-proxy on a node in `us-east-1a` prefers endpoints hinted for that zone. Same-zone routing means lower latency and lower cross-zone traffic costs.
    
5.  **Two watchers.** kube-proxy and CoreDNS both watch EndpointSlices via the `discovery/v1` API. kube-proxy reprograms iptables. CoreDNS uses them to answer Headless-Service lookups directly with pod IPs.
    

## Part 1: Why EndpointSlices exist

To understand why EndpointSlices exist, look at what came before.

There was just one object per Service. The `Endpoints` object. One blob, with every backend pod IP inside it. Three pods? Fine. Three thousand pods? **That object becomes huge.** Every kube-proxy on every node watches it. Every change rewrites the entire blob. Every node re-receives the entire blob. The api-server chokes. kube-proxy chokes. The system did not scale.

The fix landed in Kubernetes 1.16 (alpha) and went GA in 1.21. Instead of one giant `Endpoints` object, you get many small `EndpointSlice` objects. Each one is capped at 100 endpoints by default. Add a pod, only the slice it lands in gets rewritten. Watchers only re-process that one slice. The api-server only ships one small object on the wire. **Linear scaling instead of quadratic blow-up.**

The original `Endpoints` API is officially deprecated as of 1.33 (KEP-4974). It still gets written for backward compatibility, but EndpointSlices are the source of truth now, and modern controllers read slices, not the legacy object.

## Part 2: What is actually inside a slice

When you create a Service, the EndpointSlice controller wakes up. It runs inside `kube-controller-manager`. It watches Services. It watches Pod changes. When either changes, it reconciles.

For each pod in the namespace that matches the Service's label selector and is `Ready`, the controller builds a slice entry: pod IP, pod node, ports, conditions. Then it writes or updates one or more `EndpointSlice` objects. The api-server validates them and writes them to etcd. kube-proxy and CoreDNS watch them via the api-server. Done.

A trimmed `kubectl describe endpointslice` looks like this:

```plaintext
Name:         my-service-x29k9
Labels:       kubernetes.io/service-name=my-service
              endpointslice.kubernetes.io/managed-by=endpointslice-controller.k8s.io
AddressType:  IPv4
Ports:
  Name    Port  Protocol
  http    80    TCP
Endpoints:
  - Addresses:  10.244.1.42
    Conditions:
      Ready:        true
      Serving:      true
      Terminating:  false
    TargetRef:    Pod/nginx-abc-123
    NodeName:     worker
  - Addresses:  10.244.2.18
    Conditions:
      Ready:        true
      Serving:      true
      Terminating:  false
    TargetRef:    Pod/nginx-abc-456
    NodeName:     worker2
```

Five fields are doing all the work:

*   `addressType`**.** `IPv4` or `IPv6`. Dual-stack Services get two slices, one for each protocol. There's a third value, `FQDN`, in the API enum, but no Kubernetes component implements behavior for it. We'll come back to this.
    
*   `endpoints[]`**.** The list. Each entry has `addresses` (the pod IP), `conditions` (the three flags we'll cover next), `targetRef` (a pointer back at the source Pod), and `nodeName` (used by topology routing).
    
*   `ports[]`**.** The Service's exposed ports, copied here so kube-proxy doesn't have to cross-reference.
    
*   `labels`**.** `kubernetes.io/service-name` is the binding label that tells every consumer which Service this slice belongs to. The `managed-by` label distinguishes slices written by the core controller from slices written by other controllers (Cilium, Antrea, MCS-API).
    
*   `ownerReferences`**.** Points at the parent Service so deletion cascades naturally.
    

### Why 100?

100 endpoints per slice is the default cap. It is a deliberate tradeoff.

Smaller slices means more API objects in etcd but fewer bytes per watch event. Bigger slices means fewer objects but every change rewrites a larger blob. 100 sits in the middle. A Service with 3 pods has 1 slice. A Service with 300 pods has 3. A Service with 3000 pods has 30. The cap is configurable up to 1000 via the `--max-endpoints-per-slice` flag on `kube-controller-manager`, but most clusters never need to touch it.

## Part 3: The three conditions

Each endpoint has three condition flags. `Ready`. `Serving`. `Terminating`. They sound similar. They mean different things. And they decide whether traffic actually goes to that pod.

### Serving

`Serving` tracks the readiness probe. If the pod's readiness probe passes, `Serving = true`. The pod is willing and able to handle requests. kube-proxy can route traffic here.

This is the underlying truth flag. The other two are derived from it.

### Terminating

`Terminating = true` means the pod is being deleted. The Kubernetes controller observes the pod's `deletionTimestamp` and flips this flag.

kube-proxy normally stops sending **new** connections to a Terminating endpoint, so the pod can drain in peace. But there's a safety fallback: **if every endpoint for a Service is Terminating**, kube-proxy keeps routing traffic to them anyway, rather than dropping connections. This is the graceful-shutdown safeguard that stops a class of zero-downtime rollout bugs where the old pods are gone before the new pods are ready.

### Ready

`Ready` is the convenience flag. It is shorthand for `Serving = true AND Terminating = false`. A normal, accepting-traffic, not-being-deleted pod has `Ready = true`.

The reason the two flags are split: a pod **can** be Serving but not Ready, during graceful shutdown. It still answers requests, but it's being drained. This split was added so kube-proxy can make a smart decision: don't pick this pod for new connections, but keep any in-flight ones going. Without `Serving` as a separate flag, draining pods would be a much rougher transition.

| State | Serving | Terminating | Ready | Routing |
| --- | --- | --- | --- | --- |
| Normal pod accepting traffic | true | false | true | yes |
| Pod failing readiness | false | false | false | no |
| Pod being drained | true | true | false | in-flight only, no new |
| Pod being killed | false | true | false | no |

## Part 4: AddressType, and the FQDN edge case

The API defines three address types:

```go
// k8s.io/api/discovery/v1/types.go
const (
    AddressTypeIPv4 = AddressType(v1.IPv4Protocol)
    AddressTypeIPv6 = AddressType(v1.IPv6Protocol)
    AddressTypeFQDN = AddressType("FQDN")
)
```

In practice, you only ever see two. Dual-stack Services produce two slices, one with `addressType: IPv4` and one with `addressType: IPv6`. Same Service, same conditions, different protocol.

`FQDN` is a constant the API exposes. **No core Kubernetes component implements behavior for it.** The same `types.go` file states it directly:

> "The syntax and semantics of other addressType values are not defined. This must contain at least one address but no more than 100. EndpointSlices generated by the EndpointSlice controller will always have exactly 1 address."

So `FQDN` is reserved space in the API. The EndpointSlice controller never produces it. kube-proxy doesn't program rules for it. CoreDNS doesn't resolve from it. If you create one manually, nothing happens.

It's there for hypothetical extensions: a controller could write FQDN-typed slices for things like external services, and a custom data plane could consume them. In a default cluster, treat the AddressType field as a binary IPv4-or-IPv6 flag.

## Part 5: Topology hints (zone-aware routing)

This is the part most people don't know about.

Each endpoint can carry a `hints` field with `forZones` — a list of zones this endpoint is preferred for. kube-proxy reads these hints. If a pod is in `us-east-1a`, kube-proxy on a node in `us-east-1a` prefers endpoints hinted for that zone. **Same-zone routing. Lower latency. Lower cross-zone egress costs**, which on AWS / GCP can be a real bill line item.

### Where hints come from

The EndpointSlice controller writes them. It reads the pod's node label `topology.kubernetes.io/zone`. If the Service has the annotation:

```yaml
metadata:
  annotations:
    service.kubernetes.io/topology-mode: Auto
```

then the controller computes hints automatically, balancing endpoints across zones, weighted by each zone's allocatable CPU. The goal: each zone serves traffic proportional to its compute capacity. If `us-east-1a` has 60% of the cluster's CPU, it gets ~60% of the endpoints hinted for that zone.

Manual hints are also possible via the same annotation set to specific zone names, or via custom controllers that write hints directly. The auto mode is what most clusters use.

### When hints don't fire

Auto mode has safety bailouts. If the zone distribution is too unbalanced — say one zone has all the pods — the controller drops hints entirely rather than route everything to that zone. kube-proxy without hints falls back to its normal round-robin behavior. This is intentional: same-zone routing is only safe when every zone has enough capacity to handle its own traffic.

## Part 6: Who watches EndpointSlices

Two consumers. Both watch the same API.

### kube-proxy

kube-proxy runs as a DaemonSet on every node. It has two informers: one on Services, one on EndpointSlices. When a slice changes, it diffs the new state against the kernel's current rules, then batches the changes into a single `iptables-restore` (or nftables, since 1.33). The whole rule set is replaced as one transaction.

Three nodes, three independent reprograms, all in parallel. Total time on a normal cluster: milliseconds per change.

### CoreDNS

CoreDNS watches EndpointSlices through its `kubernetes` plugin. From `coredns/plugin/kubernetes/controller.go`:

```go
import discovery "k8s.io/api/discovery/v1"

epLister, epController := object.NewIndexerInformer(
    &cache.ListWatch{
        ListFunc:  endpointSliceListFunc(...),
        WatchFunc: endpointSliceWatchFunc(...),
    },
    &discovery.EndpointSlice{},
    ...
)
```

For a normal Service, CoreDNS returns the ClusterIP — it doesn't actually need the slice to answer that query. The slices matter for **Headless Services** (`clusterIP: None`). For those, CoreDNS returns the pod IPs from the slice directly, no virtual IP, no kube-proxy in the path. This is how StatefulSets get per-pod DNS: `pod-0.my-statefulset.default.svc.cluster.local` resolves to one specific pod IP, pulled out of the slice.

Both watchers are list-watch. They get the initial state from a `List`, then incremental `ADDED` / `MODIFIED` / `DELETED` events via the watch stream. No polling.

## Part 7: A real cluster demo

Let me show this on a real cluster. Three workers, a kind v1.35.1 cluster:

```bash
$ kubectl get nodes
NAME                 STATUS   ROLES           AGE
kind-control-plane   Ready    control-plane   2m
kind-worker          Ready    <none>          2m
kind-worker2         Ready    <none>          2m
kind-worker3         Ready    <none>          2m
```

Apply a Deployment with three nginx pods and a Service:

```bash
$ kubectl create deployment nginx --image=nginx --replicas=3
$ kubectl expose deployment nginx --port=80
```

### Three pods

```bash
$ kubectl get endpointslices -l kubernetes.io/service-name=nginx
NAME          ADDRESSTYPE   PORTS   ENDPOINTS                                     AGE
nginx-x29k9   IPv4          80      10.244.1.42,10.244.2.18,10.244.3.07           5s
```

One slice. Three endpoints. Each pod IP, each node, each Ready. Exactly what we expect for three pods.

Worth noticing: the slice itself was actually created **the moment the Service was**, as an empty placeholder. As each pod transitioned to Ready, the controller filled it in and updated the same slice object. The placeholder pattern means downstream watchers always have something to bind to, even before any pod is ready.

### Scale to 50

```bash
$ kubectl scale deployment nginx --replicas=50
```

Watch the slice:

```bash
$ kubectl get endpointslices -l kubernetes.io/service-name=nginx
NAME          ADDRESSTYPE   PORTS   ENDPOINTS                                     AGE
nginx-x29k9   IPv4          80      10.244.1.42,10.244.1.43,... (50 entries)      2m
```

Still one slice. Fifty endpoints. Under the 100-endpoint default cap. kube-proxy on every node reprogrammed. CoreDNS, if this were a Headless Service, would now return all fifty IPs in the DNS answer.

### Scale to 200 — the slice splits

```bash
$ kubectl scale deployment nginx --replicas=200
```

```bash
$ kubectl get endpointslices -l kubernetes.io/service-name=nginx
NAME          ADDRESSTYPE   PORTS   ENDPOINTS                       AGE
nginx-x29k9   IPv4          80      ... (100 entries)               3m
nginx-fz4mp   IPv4          80      ... (100 entries)               12s
```

**Two slices.** One with 100 endpoints. One with another 100. kube-proxy reads both, stitches the rules together, and the Service has two hundred backends. The split is invisible to anyone using the Service. You curl one ClusterIP and the kernel picks one of the 200 pods.

### Rolling update

Now do a rolling update — change the image, watch the slices in real time:

```bash
$ kubectl set image deployment nginx nginx=nginx:1.27
$ kubectl get endpointslices -l kubernetes.io/service-name=nginx --watch
```

You see endpoints transition through every state we covered. Pods go `Terminating = true`. New pods land `Serving = true` once readiness passes. Slices update. kube-proxy reprograms on every change.

Total reprogramming time across the rolling update? **A few seconds, distributed across nodes.** The Service IP never changes. Traffic keeps flowing. End users see nothing.

## Wrap

So that is the EndpointSlice. The bridge between a Service definition and the kernel rules that route real traffic.

One controller writes them. kube-proxy and CoreDNS watch them. Capped at 100 by default. Conditions for graceful shutdown. Topology hints for zone-aware routing. The placeholder pattern so downstream watchers always have something to bind to.

It's what makes Kubernetes Services scale to thousands of pods without falling over. Most people use Services every day and never think about the slices underneath. That's the point — the abstraction works.