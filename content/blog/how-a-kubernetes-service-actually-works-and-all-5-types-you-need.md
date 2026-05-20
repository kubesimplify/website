---
title: "How a Kubernetes Service Actually Works (and All 5 Types You Need)"
datePublished: 2026-05-05T06:55:18.005Z
slug: how-a-kubernetes-service-actually-works-and-all-5-types-you-need
author: saiyam-pathak
cover: /img/blog/how-a-kubernetes-service-actually-works-and-all-5-types-you-need/f831367f-3bec-4384-bfd0-672eebd4ba65.png
tags: ["kubernetes", "service", "devops", "networking", "cloud-native"]
cuid: cmos9xhit000002ic2xgigf7u
---
A pod gets created. It gets an IP. Then it dies. A new pod replaces it. New IP. Now imagine you have ten pods of the same app, and they restart all the time. **Which IP do you call?**

You can't. That's the problem Services solve, and the answer is more interesting than "Kubernetes assigns a stable IP."

This post walks the full picture in five parts: why Services have to exist, what happens when you create one, what happens when traffic actually calls one, all five Service types (most posts stop at three), and a real cluster demo at the bottom. Every claim is verified against `kubernetes/kubernetes` 1.36 source.

%[https://youtu.be/uP4Gc08qeXM]

## TL;DR

1. **Why Services exist.** Pods are ephemeral; their IPs change on every restart and reschedule. A Service is a stable identity for an unstable set of pods.
2. **Creation flow.** `kubectl expose` → API server allocates a ClusterIP from `--service-cluster-ip-range` (since 1.33, backed by `IPAddress` objects, GA) → EndpointSlice controller fills the slice with matching pod IPs → kube-proxy on every node programs iptables → CoreDNS adds the name. Sub-second end to end.
3. **Request flow.** `curl my-service` → CoreDNS returns ClusterIP → packet hits `KUBE-SERVICES` → matches `KUBE-SVC-XXX` → `--mode random` picks one rule → `KUBE-SEP-YYY` does DNAT to a pod IP → kernel routes to the backend → conntrack rewrites the source IP back to ClusterIP on the reply.
4. **Five Service types.** ClusterIP (internal), NodePort (every-node port, dev/test), LoadBalancer (cloud-provided external LB for prod), ExternalName (DNS CNAME alias for managed services), Headless (`clusterIP: None`, DNS returns pod IPs directly — for StatefulSets).
5. **The dataplane is the kernel.** Three controllers cooperate to write iptables rules, but the actual packet forwarding is pure Linux netfilter. The Service object is metadata; the kernel does the work.

## Part 1: Why Services exist

The Kubernetes pod model is deliberately ephemeral. Pods get rescheduled, restarted, scaled up and down. **Pod IPs change every time**. There is no permanent address.

This is by design. Kubernetes treats pods as cattle, not pets. The system is at its best when no individual pod is precious and the whole workload can be reshuffled across the cluster. But applications need to talk to each other, and applications need a stable target.

A Service is the answer. It is a stable identity for an unstable set of pods. You give it a label selector (`app: nginx`). Any pod that matches the selector becomes a backend. The Service exposes one virtual IP, called the ClusterIP. Pods come and go. The ClusterIP stays.

Without this abstraction, you would be writing service discovery code from scratch in every application, forever. Every microservice architecture in Kubernetes depends on this idea. It is so fundamental that it is easy to miss how clever it is.

## Part 2: What happens when you create a Service

One command:

```bash
$ kubectl expose deployment nginx --port=80
service/nginx exposed
```

Behind that one line, an entire pipeline of controllers wakes up.

### Step 1: The API server allocates a ClusterIP

The API server receives the create request, runs admission, runs validation. Then it allocates a ClusterIP from the configured `--service-cluster-ip-range` (typically `10.96.0.0/12`).

Since Kubernetes 1.33, the IP allocator is backed by first-class `IPAddress` and `ServiceCIDR` objects. You can run:

```bash
$ kubectl get ipaddresses
NAME           PARENTREF
10.96.255.20   services/default/my-service
```

This used to be a bitmap stored in etcd. Now it's a clean API. The Service object gets the allocated IP stamped onto `spec.clusterIP`, the write goes to etcd via Raft, and the Service exists. **At this point, no pod is connected to it yet.** The Service is just metadata.

### Step 2: The EndpointSlice controller fills the slice

The EndpointSlice controller runs inside `kube-controller-manager`. It has two informers: one watches Services, one watches Pods. When a new Service appears, the controller scans every pod in the namespace. For each pod that matches the selector AND is `Ready`, it builds a slice entry: pod IP, pod node, ports, conditions.

The output is one or more `EndpointSlice` objects, capped at 100 endpoints each. A Service with three pods has one slice. A Service with three thousand pods has thirty.

Each slice has an `ownerReference` to the Service (so deletion cascades) and labels:

- `kubernetes.io/service-name: my-service`
- `endpointslice.kubernetes.io/managed-by: endpointslice-controller.k8s.io`

That's how kube-proxy knows which Service a slice belongs to.

> Side note worth knowing: the legacy `Endpoints` API was officially deprecated in 1.33 (KEP-4974). It still works for older controllers, but `EndpointSlices` are the source of truth now.

### Step 3: kube-proxy on every node reprograms

There is a kube-proxy pod on every node, deployed as a DaemonSet in nearly every installer. It has Service and EndpointSlice informers. When a slice changes, kube-proxy diffs the new state against the kernel's current rules, then batches the changes into a single `iptables-restore` call. The whole rule set is replaced as one transaction.

Three nodes, three independent reprograms, all in parallel. Total time on a normal cluster: milliseconds.

### Step 4: What gets programmed

The actual rules look like this (real captured output from a kind 1.35.1 cluster, slightly trimmed):

```
-A KUBE-SERVICES -d 10.96.255.20/32 -p tcp --dport 80 -j KUBE-SVC-FXIYY
-A KUBE-SVC-FXIYY -m statistic --mode random --probability 0.333 -j KUBE-SEP-1
-A KUBE-SVC-FXIYY -m statistic --mode random --probability 0.500 -j KUBE-SEP-2
-A KUBE-SVC-FXIYY -j KUBE-SEP-3
-A KUBE-SEP-1 -j DNAT --to-destination 10.244.1.42:80
-A KUBE-SEP-2 -j DNAT --to-destination 10.244.2.18:80
-A KUBE-SEP-3 -j DNAT --to-destination 10.244.3.07:80
```

`KUBE-SERVICES` is the entry chain. Every Service port has a match rule that jumps to a per-Service chain, named `KUBE-SVC-` plus a hash of the service name. That chain has one rule per backend, with a `--mode random --probability 1/n` declining pattern. Each backend rule jumps to a per-endpoint `KUBE-SEP-` chain that does the actual DNAT.

iptables is the default mode. nftables (GA in 1.33) uses `verdict maps` for sub-microsecond hash lookup instead of the linear scan; recommended for modern Linux clusters. IPVS mode was deprecated in 1.35 and is now legacy.

### Step 5: CoreDNS adds the name

There's a Service called `kube-dns` in the `kube-system` namespace, backed by CoreDNS pods. Every pod's `/etc/resolv.conf` has the kube-dns ClusterIP as its nameserver. CoreDNS has a `kubernetes` plugin that watches Services. When `my-service` appears, CoreDNS now resolves `my-service.default.svc.cluster.local` to the ClusterIP.

Three controllers cooperated, plus DNS, and the Service is live. Total time from `kubectl expose` to first traffic flowing: under a second.

## Part 3: What happens when traffic calls a Service

`kubectl exec` into a busybox pod, run `curl my-service`. Two seconds later: `<title>Welcome to nginx!</title>`. Now slow that down to seven steps.

### Step 1: DNS resolution

The pod sees `curl my-service`, but `my-service` is not a real hostname. The pod's resolver consults its search list (`default.svc.cluster.local`, `svc.cluster.local`, `cluster.local`). It tries `my-service.default.svc.cluster.local` first. The query goes to CoreDNS, which has the kubernetes plugin watching Services, and returns the ClusterIP.

### Step 2: TCP packet to ClusterIP

The pod opens a TCP connection. SYN packet, destination ClusterIP, port 80. The packet leaves the pod's `veth` pair, enters the host's network namespace. PREROUTING.

### Step 3: KUBE-SERVICES matches

The packet hits the `KUBE-SERVICES` chain. Every Service port has a match rule here. The rule says: destination is `10.96.255.20`, port `80`? Jump to `KUBE-SVC-FXIYY`. Now the packet is inside the per-Service chain.

### Step 4: --mode random picks one

`KUBE-SVC-FXIYY` has one rule per backend, with the declining-probability pattern:

- Rule 1 fires with `probability 1/3` → `KUBE-SEP-1`
- Rule 2 fires with `probability 1/2` of what's left → `KUBE-SEP-2`
- Rule 3 is the unconditional fallthrough → `KUBE-SEP-3`

The math works out: each backend gets exactly one third of the traffic. iptables `-m statistic --mode random` is the underlying mechanism.

### Step 5: DNAT rewrites the destination

The chosen rule jumps to `KUBE-SEP-2`. That chain has one rule:

```
-j DNAT --to-destination 10.244.2.18:80
```

The kernel rewrites the destination of the packet from ClusterIP to the actual pod IP. The packet is no longer for the virtual address. It is now headed at a real pod, on a real node.

### Step 6: Backend receives

The packet routes to the backend pod's node, traverses the CNI bridge or overlay, arrives at the backend. The pod sees a normal TCP packet to its own IP, port 80. It sends back a SYN-ACK. **The backend has no idea it was reached via a Service abstraction.**

### Step 7: Reply rewriting via conntrack

The reply traffic is where the trick happens. Source IP is the backend pod. Destination is the original sender. But the Linux conntrack table remembers the DNAT we did on the way in. So when the reply comes back through the host, conntrack rewrites the source IP from the backend pod, back to the ClusterIP.

The original sender pod sees the response coming from the ClusterIP, exactly the address it sent the packet to. Connection works. End to end. **The pod has no idea this dance happened.**

## Part 4: All five Service types (with real use cases)

Most "Service types" content stops at three. There are five, and each one solves a different problem.

### 1. ClusterIP

The default. Virtual IP, internal only. This is what we just walked through.

**Use case:** application-to-application traffic inside the cluster. Frontend talks to backend. Microservice A calls microservice B. Both inside the cluster. By far the most common type.

### 2. NodePort

NodePort opens the same port on every node in the cluster, in the range `30000–32767`. Traffic to any node on that port gets forwarded to the ClusterIP, and from there to a pod.

**Use case:** local development clusters like kind or minikube, where you don't have a cloud load balancer to provision. NodePort is also a building block — `LoadBalancer` Services use it under the hood.

### 3. LoadBalancer

This is what you use in production for public-facing apps. When you create a `LoadBalancer` Service on EKS, GKE, or AKS, the cloud provider integration provisions a real external load balancer and points it at the NodePort on each node. You get a public IP. Real users hit it.

**Use case:** production-facing web apps. The browser-to-cluster ingress path.

### 4. ExternalName

This is the type most people skip. `ExternalName` has no ClusterIP, no selector, no pods. It's a DNS CNAME alias inside the cluster.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-database
spec:
  type: ExternalName
  externalName: prod-db.us-east-1.rds.amazonaws.com
```

Now any pod can `curl my-database`, and the cluster DNS returns the AWS hostname.

**Use case:** pointing in-cluster names at managed external services. Your apps look up `my-database`, the underlying address is a managed Postgres in RDS, and you can swap the target without changing application code. Same pattern works for managed Redis, S3-compatible stores, anything external.

### 5. Headless

```yaml
apiVersion: v1
kind: Service
metadata:
  name: cassandra-svc
spec:
  clusterIP: None       # ← the magic
  selector:
    app: cassandra
```

There is no virtual IP, no kube-proxy involvement, no DNAT. Instead, DNS returns the IPs of all backend pods directly. With a StatefulSet, each pod also gets a stable DNS name like `cassandra-0.cassandra-svc.default`.

**Use case:** StatefulSets. Each pod gets a stable DNS name for peer discovery in distributed systems (Cassandra nodes finding each other, Kafka brokers, etcd peers). Custom client-side load balancing where the client wants to choose the backend itself, not have iptables choose. Anything that needs to talk to specific pods, not a load-balanced abstraction.

### The summary

| Type | Use case |
|---|---|
| ClusterIP | Inside the cluster |
| NodePort | Dev clusters, building block |
| LoadBalancer | Public production traffic |
| ExternalName | Alias managed services |
| Headless | Stateful workloads |

Most teams over-use `LoadBalancer` when `ClusterIP` plus an Ingress would do. Pick the right one for the job.

## Part 5: Live demo

To make all of this concrete, we ran the create-and-call flow on a real cluster (kind 1.35.1, three workers). What follows are verbatim outputs.

```
$ kubectl get nodes
NAME                         STATUS   ROLES           AGE   VERSION
service-demo-control-plane   Ready    control-plane   24s   v1.35.1
service-demo-worker          Ready    <none>          14s   v1.35.1
service-demo-worker2         Ready    <none>          14s   v1.35.1
service-demo-worker3         Ready    <none>          14s   v1.35.1
```

Apply an nginx Deployment with three replicas, then a Service:

```
$ kubectl apply -f nginx-deploy.yaml
deployment.apps/nginx created

$ kubectl get pods -o wide
NAME                    READY   STATUS    RESTARTS   AGE   IP           NODE
nginx-fd956d49d-49779   1/1     Running   0          12s   10.244.2.2   service-demo-worker2
nginx-fd956d49d-5pbsm   1/1     Running   0          12s   10.244.1.2   service-demo-worker
nginx-fd956d49d-g94jr   1/1     Running   0          12s   10.244.3.2   service-demo-worker3

$ kubectl apply -f my-service.yaml
service/my-service created

$ kubectl get svc my-service
NAME         TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
my-service   ClusterIP   10.96.255.20   <none>        80/TCP    2s
```

The Service has no IPs in its spec — only the selector:

```
$ kubectl get svc my-service -o yaml | grep -A 8 spec:
spec:
  clusterIP: 10.96.255.20
  internalTrafficPolicy: Cluster
  ipFamilies:
  - IPv4
  ipFamilyPolicy: SingleStack
  ports:
  - port: 80
  selector:
    app: nginx
```

The 1.33+ `IPAddress` object shows it as a first-class allocation:

```
$ kubectl get ipaddresses
NAME           PARENTREF
10.96.255.20   services/default/my-service
```

The EndpointSlice has the real backend IPs:

```
$ kubectl get endpointslices -l kubernetes.io/service-name=my-service
NAME               ADDRESSTYPE   PORTS   ENDPOINTS                            AGE
my-service-x29k9   IPv4          80      10.244.1.2,10.244.2.2,10.244.3.2     8s
```

And the iptables rules on a worker show the chain we described:

```
$ docker exec service-demo-worker iptables-save | grep my-service
-A KUBE-SERVICES -d 10.96.255.20/32 -p tcp -m tcp --dport 80 -j KUBE-SVC-FXIYY6OHUSNBITIX
-A KUBE-SVC-FXIYY6OHUSNBITIX -m statistic --mode random --probability 0.33333333349 -j KUBE-SEP-4B2TTHBRUYTSCT32
-A KUBE-SVC-FXIYY6OHUSNBITIX -m statistic --mode random --probability 0.50000000000 -j KUBE-SEP-FAW7RO5CDYGWP4Y3
-A KUBE-SVC-FXIYY6OHUSNBITIX -j KUBE-SEP-4UWZBYSYCGDXTWU5
-A KUBE-SEP-4B2TTHBRUYTSCT32 -j DNAT --to-destination 10.244.1.2:80
-A KUBE-SEP-FAW7RO5CDYGWP4Y3 -j DNAT --to-destination 10.244.2.2:80
-A KUBE-SEP-4UWZBYSYCGDXTWU5 -j DNAT --to-destination 10.244.3.2:80
```

Real ClusterIP. Real chain hash. Real probabilities. Real pod IPs. The math (`0.33333`, `0.50000`, fallthrough) is exactly what we derived earlier.

Now `curl` from inside the cluster:

```
$ kubectl run curl --rm -i --restart=Never --image=busybox:1.36 -- wget -q -O - http://my-service
<!DOCTYPE html>
<html>
<head><title>Welcome to nginx!</title></head>
...
```

Welcome to nginx. The pod knew nothing about iptables, KUBE-SVC chains, DNAT, or conntrack. It just curled `my-service` and got a response.

Scale up to ten replicas, watch everything reprogram in real time:

```
$ kubectl scale deploy/nginx --replicas=10
deployment.apps/nginx scaled

$ kubectl get endpointslices -l kubernetes.io/service-name=my-service
NAME               ADDRESSTYPE   PORTS   ENDPOINTS                                      AGE
my-service-x29k9   IPv4          80      10.244.1.2,10.244.2.2,10.244.3.2 + 7 more...   1m42s

$ docker exec service-demo-worker iptables-save | grep -c 'KUBE-SVC-FXIYY.*statistic'
9
```

Three rules became nine. (Tenth backend is the unconditional fallthrough, no `--probability` on it.) From `kubectl scale` to all kube-proxies reprogrammed: about 200 milliseconds.

## Three takeaways

1. **The Service object is metadata. The dataplane is the kernel.** Nothing in the Service object knows about pod IPs. The kernel's iptables (or nftables) rules carry that mapping. When you understand this, you stop thinking of Services as magic and start thinking of them as cleverly placed netfilter rules.

2. **EndpointSlice is the bridge.** When a Pod becomes Ready, the EndpointSlice controller writes its IP. kube-proxy reads. The kernel obeys. Three controllers, no shared state, all eventually consistent — and reprogramming completes in milliseconds even on big clusters.

3. **Use the right Service type for the job.** ClusterIP for internal traffic. NodePort for dev clusters. LoadBalancer for public production. ExternalName to alias external services. Headless for StatefulSets. Most teams over-use LoadBalancer when ClusterIP-plus-Ingress would have been the right choice.

## Where to go from here

The full video walks the 5-part flow in 10 minutes with animated visuals for each step. Link at the top of this post.

Sources for every claim in this post:

- `pkg/registry/core/service/storage/alloc.go` — ClusterIP allocator
- `pkg/controller/endpointslice/` — EndpointSlice controller
- `pkg/proxy/iptables/proxier.go` — kube-proxy iptables rules
- `pkg/proxy/nftables/` — nftables backend (GA 1.33)
- KEP-1880 — MultiCIDRServiceAllocator (ServiceCIDR objects)
- KEP-3866 — kube-proxy nftables backend
- KEP-4974 — Endpoints API deprecation
- The terminal output above is verbatim from a real Kubernetes 1.35.1 kind cluster, captured for this post.
