---
title: "Zero Trust in Practice: Migrating from Istio Sidecar to Ambient Mode"
seoTitle: "Zero Trust with Istio: Sidecar vs Ambient Mode Step-by-Step"
seoDescription: "A hands-on comparison of Istio sidecar and ambient mode for zero-trust service mesh. Same app, same policy, two architectures proven step by step on a local cluster."
datePublished: 2026-07-22T10:00:00.000Z
slug: zero-trust-istio-sidecar-vs-ambient
author: prianshu-mukherjee
cover: /img/blog/zero-trust-istio-sidecar-vs-ambient/cover.png
tags: ["istio", "service-mesh", "zero-trust", "kubernetes", "ambient-mesh", "mtls", "security"]
---

Microservices split one problem into many. What used to be a function call inside a single process becomes a network call between separately deployed services and every one of those calls now needs the things a function call got for free — encryption, a way to know who's actually calling and a rule for whether that call should be allowed at all.

Handle that inside application code and every team ends up building its own partial version of the same three problems. A service mesh exists to pull all three out of application code entirely into an infrastructure layer that sits next to every service and handles them the same way everywhere.

Istio is a service mesh technology where most of that conversation converges. It runs Envoy as its data plane, uses Kubernetes ServiceAccounts as its source of identity and treats encryption, identity and policy as one connected system rather than three separate tools bolted together.

What Istio actually operationalizes underneath the feature list is **zero trust**, the principle that nothing on your network gets trusted just because of where it sits. Not "this pod is inside the cluster so it's fine." Every call gets encrypted. Every caller gets a cryptographic identity. Every request gets checked against an explicit rule regardless of where it originated. A zero-trust migration is the actual work of moving a running system from "anything in the cluster can call anything" to that model without rewriting the applications themselves.

mTLS covers the encryption and identity half. `AuthorizationPolicy` covers the access-control half.

Istio ships two different architectures for delivering both: sidecar mode and ambient mode. They arrive at the same zero-trust outcome through totally different mechanics.

Let's try to concretely understand what changes when you move from Istio's sidecar model to ambient mode. The mechanical differences, what gets installed, what a pod looks like before and after, what a policy that works in one mode behaves in the other.

So I used a small microservice app, secured it twice on the same cluster once with Istio sidecars and once with ambient.

**To follow along you'll need:** a Kubernetes cluster (a local kind cluster is enough), `kubectl` and `istioctl`. Everything here runs on a single local cluster. No cloud account required. The full repo is at `github.com/Prianshu-git/Service-mesh-Zero-Trust-migration`.

---

## Missing Piece

Before touching Istio at all we deploy four plain Kubernetes services with no mesh whatsoever: `frontend`, `orders`, `payments`, `inventory`. Frontend and orders can reasonably call payments. Nothing else should be able to. With no mesh in place none of that was enforced by default.

Three things were missing and everything that follows is just those three gaps getting closed twice two different ways:

→ **No confidentiality.** Traffic between services was plain HTTP.

→ **No authentication.** Payments had no way to cryptographically verify who was actually calling it.

→ **No authorization.** Even if it wanted to enforce "only orders may call me" there was nowhere to put that rule.

> **Note on the demo architecture:** For this demonstration each "service" is deployed as `kennethreitz/httpbin`: an echo server that reflects back request headers. This lets us inspect mTLS identity headers directly. The actual policy tests are performed by running `curl` from temporary pods or by `kubectl exec` into the `frontend` pod which uses `curlimages/curl`. The app logic is irrelevant. What matters is whether the mesh allows or blocks the traffic.

---

## Two Architectures, One Goal

**Sidecar mode** has been Istio's model since 2017. Every pod that joins the mesh gets a second container injected into it, an Envoy proxy running as `istio-proxy`. A one-time init container installs iptables rules inside the pod's own network namespace so every byte in or out of your app container gets silently rerouted through that sidecar first. The sidecar terminates and originates mTLS, holds that pod's certificate and enforces whatever `AuthorizationPolicy` applies to it. Your application code never changes. But every pod whether or not it ever handles a sensitive request now carries a full proxy.

**Ambient mode** splits that same job into two layers instead of bolting a proxy onto every pod. A `ztunnel` runs once per node not once per pod as a DaemonSet. It handles mTLS and workload identity for every pod scheduled on that node using an HTTP CONNECT-based tunnel protocol called HBONE to talk to other nodes. It does not read HTTP. It has no concept of a path or a method. For that ambient adds a second optional component: a **waypoint**, the exact same Envoy binary the sidecar uses but deployed as its own independent workload attached only to the specific service that actually needs L7 rules.

In practice this changes how you join the mesh, how you write policy and what you're troubleshooting when the system doesn't do what it says. The rest of this post is that difference proven step by step on the same app on the same cluster.

---

## The Project

To make the comparison honest I set one constraint: the same application, the same intended policy under both architectures so nothing could be explained away by "the app was different."

The app is deliberately small and one design detail that matters: **each service gets its own Kubernetes ServiceAccount** not a shared one. Istio's identity model is built entirely on the ServiceAccount a pod runs as not the pod itself. If all four services shared one ServiceAccount there'd be no way to write a policy that says "only orders may call payments" because Istio would have no way to tell orders traffic apart from frontend's. Four ServiceAccounts is what makes the whole zero-trust story expressible at all.

The target policy is narrow on purpose: **payments only accepts POST requests to `/post` and only from orders.** Everything else including a direct call from frontend gets denied. That one rule gets implemented twice: once as a sidecar-mode policy and once as an ambient-mode one on the same cluster torn down cleanly between runs so neither phase could quietly lean on leftovers from the other.

---

## Standing Up the Cluster

A local kind cluster is enough for this:

```bash
kind create cluster --name zt-demo
```

```bash
kubectl get nodes
```

One node, one control plane, Ready status. No Istio components exist yet.

---

## Deploying the Baseline: No Mesh at All

```bash
kubectl apply -f app/
```

![Pods starting up with no mesh](/img/blog/zero-trust-istio-sidecar-vs-ambient/01-pods-no-mesh.png)

Four services coming up with zero Istio anywhere in the cluster. `READY 1/1`: one container, no sidecar because there's no mesh to inject one yet.

At this point calling payments directly from frontend with no policy anywhere just worked. No mesh means no gate. That's the baseline everything else in this post is measured against.

```bash
kubectl -n zt-demo exec deploy/frontend -- curl -s http://payments/post -X POST -d '{"amount": 500}'
```

![Plain HTTP response from payments](/img/blog/zero-trust-istio-sidecar-vs-ambient/02-plain-http-response.png)

The response is plain HTTP. No `X-Forwarded-Client-Cert` header. No encryption. No identity. The `origin` field shows the raw pod IP (`10.244.0.8`).

---

## Phase 1: Sidecar Mode, Step by Step

### Install and Inject

```bash
istioctl install --set profile=minimal -y
kubectl label namespace zt-demo istio-injection=enabled --overwrite
kubectl -n zt-demo rollout restart deployment orders payments inventory frontend
```

![Sidecar injection in progress](/img/blog/zero-trust-istio-sidecar-vs-ambient/03-sidecar-inject-pending.png)

Labeling a namespace for sidecar injection does nothing to pods that already exist. Kubernetes has no mechanism to add a container to a running pod so every workload has to be recreated. Watch the `READY` column: pods that were `1/1` a moment ago come back `2/2`. The `0/2` Pending rows are pods still finishing sidecar startup. This is the first real operational cost of sidecar mode and it's visible directly in the pod list.

![All pods at 2/2 with sidecars](/img/blog/zero-trust-istio-sidecar-vs-ambient/04-sidecar-all-ready.png)

All pods now at `2/2`. Every pod carries its own proxy.

### mTLS Is Already Working, Before Any Policy Says So

```bash
kubectl -n zt-demo exec deploy/frontend -- curl -s http://payments/post -X POST -d '{"amount": 500}'
```

![mTLS identity header visible](/img/blog/zero-trust-istio-sidecar-vs-ambient/05-mtls-identity-header.png)

This is frontend calling payments directly and it still succeeds because no `AuthorizationPolicy` exists yet. But look at the `X-Forwarded-Client-Cert` header that httpbin echoed back: `URI=spiffe://cluster.local/ns/zt-demo/sa/frontend`. Nothing in the app added that. The **destination sidecar** (payments' `istio-proxy`) extracted the caller's verified mTLS identity from the TLS handshake and attached it to the request before forwarding to the app container. The sidecar already knows exactly who's calling. It just isn't blocking anyone yet.

### mTLS: Permissive First, Then Strict

Sidecar mode lets you stage the migration. `PERMISSIVE` mode allows both plaintext and mTLS traffic. Useful during rollout so existing calls don't break. `STRICT` mode rejects anything that isn't mTLS.

```bash
kubectl apply -f sidecar/01-mtls-permissive.yaml
```

Traffic still works. The mesh is encrypting what it can but not rejecting plaintext yet. This is the safe intermediate state.

```bash
kubectl apply -f sidecar/02-mtls-strict.yaml
```

Now any plaintext call from outside the mesh is rejected. Only mTLS-encrypted traffic gets through. The same `PeerAuthentication` resource changes mode. No pod restarts required.

### Locking It Down: The Sidecar AuthorizationPolicy

![Sidecar AuthorizationPolicy YAML](/img/blog/zero-trust-istio-sidecar-vs-ambient/06-authz-policy-yaml.png)

The policy attaches directly to the workload using `selector.matchLabels`. The sidecar inside the payments pod evaluates this rule. The `principals` field references the SPIFFE identity derived from the `orders` ServiceAccount.

```bash
kubectl apply -f sidecar/03-authz.yaml
```

Now the actual proof. First from orders:

```bash
kubectl run curl-orders -n zt-demo --image=curlimages/curl --restart=Never \
  --overrides='{"spec":{"serviceAccountName":"orders"}}' \
  -- curl -s -o /dev/null -w '%{http_code}\n' \
  http://payments.zt-demo.svc.cluster.local/post -X POST -d '{"amount": 500}'
```

![Orders gets 200 OK](/img/blog/zero-trust-istio-sidecar-vs-ambient/07-orders-200.png)

Orders gets a `200`.

Then from frontend:

```bash
kubectl -n zt-demo exec deploy/frontend -- \
  curl -s -o /dev/null -w '%{http_code}\n' \
  http://payments/post -X POST -d '{"amount": 500}'
```

![Frontend gets 403 Forbidden](/img/blog/zero-trust-istio-sidecar-vs-ambient/09-frontend-403.png)

Frontend gets a `403`. Same cluster, same service, same everything except its identity. That gap (`200` vs `403` based purely on cryptographic identity) is the entire point of this project.

---

## Resetting Cleanly Before Switching Architectures

Running sidecar and ambient side by side on the same cluster would result in double the control and data plane cost and for our purpose doing that would make it impossible to tell which architecture was responsible for which behavior later. So between phases everything is stripped down.

```bash
istioctl uninstall --purge -y
kubectl delete namespace zt-demo
kubectl delete namespace istio-system
```

Both namespaces terminating, back to a clean slate. No leftover certificates, no leftover policies, no ambiguity about which mesh is enforcing what.

---

## Phase 2: Ambient Mode, Step by Step

### Install and Label: No Restart Required

```bash
istioctl install --set profile=ambient -y
kubectl label namespace zt-demo istio.io/dataplane-mode=ambient --overwrite
```

![Ambient install with no restarts](/img/blog/zero-trust-istio-sidecar-vs-ambient/10-ambient-install.png)

Compare the `AGE` column here to the rollout restart screenshot from Phase 1. Every pod is still the exact same age. The exact same pods that were already running because ambient mode has no per-pod container to inject. Labeling the namespace was the entire operation. No restart, No downtime.

At this point mTLS is already active for every pod in the namespace with zero `PeerAuthentication` resource applied because ztunnel enforces it by default for anything in the mesh.

**Note on ambient mTLS defaults:** In ambient mode ztunnel automatically encrypts in-mesh traffic using mTLS. You only need a `PeerAuthentication` resource if you want to explicitly control the mode (for example `PERMISSIVE` to allow plaintext from outside the mesh or `STRICT` to reject anything non-mTLS). For this demo we rely on the ambient default.

### mTLS Active by Default

```bash
kubectl -n zt-demo exec deploy/frontend -- curl -s http://payments/post -X POST -d '{"amount": 500}'
```

![Ambient mTLS without identity header](/img/blog/zero-trust-istio-sidecar-vs-ambient/11-ambient-mtls-no-header.png)

The call succeeds (`200`) confirming ztunnel is encrypting traffic. But notice: **no `X-Forwarded-Client-Cert` header** and the `origin` is the real pod IP (`10.244.0.20`), not `127.0.0.6`. In sidecar mode the destination proxy injects the identity header and redirects through localhost. In ambient mode without a waypoint ztunnel handles encryption at L4 without touching HTTP headers. The identity is still cryptographically verified. You just can't see it in the HTTP response yet.

### Where Ambient Draws Its Line: The Fail-Safe Behavior

Here is the critical learning moment. When applying the exact same `AuthorizationPolicy` shape that worked cleanly in sidecar mode (the one with `selector.matchLabels: app: payments`) directly in ambient mode. It got accepted but with a warning attached to its status field:

```bash
kubectl -n zt-demo get authorizationpolicy payments-only-orders -o jsonpath='{range .status.conditions[*]}{.type}{"="}{.reason}{" "}{.message}{"\n"}{end}'
```

![ztunnel unsupported attributes warning](/img/blog/zero-trust-istio-sidecar-vs-ambient/12-ztunnel-warning.png)

Istio's own status field states it plainly: ztunnel does not support HTTP attributes (methods, paths). In ambient mode you must use a waypoint proxy to enforce HTTP rules. But here is what the warning does not fully capture: **ztunnel fails safe.** When an `ALLOW` policy contains L7 rules that ztunnel cannot evaluate ztunnel omits those rules and the policy becomes more restrictive than requested. Effectively a **DENY-all** for traffic that would have matched the omitted rules. It does not silently do less than asked. It protects you from misconfiguration by blocking traffic it cannot properly evaluate.

In our test the result was a connection failure (`000`) rather than an HTTP `403`. A `403` would mean the request reached an HTTP proxy that evaluated and rejected it. A `000` means ztunnel **dropped the connection at L4** before it even got to the app. The enforcement point refused to forward traffic it could not authorize.

```bash
# Test from orders
kubectl run curl-orders -n zt-demo --image=curlimages/curl --restart=Never \
  --overrides='{"spec":{"serviceAccountName":"orders"}}' \
  -- curl -s -o /dev/null -w '%{http_code}\n' \
  http://payments.zt-demo.svc.cluster.local/post -X POST -d '{"amount": 500}'
```

![Orders blocked by ztunnel](/img/blog/zero-trust-istio-sidecar-vs-ambient/13-orders-blocked-ztunnel.png)

```bash
# Test from frontend
kubectl -n zt-demo exec deploy/frontend -- \
  curl -s -o /dev/null -w '%{http_code}\n' --max-time 5 \
  http://payments/post -X POST -d '{"amount": 500}'
```

![Frontend also blocked by ztunnel](/img/blog/zero-trust-istio-sidecar-vs-ambient/14-frontend-blocked-ztunnel.png)

Both denied. Orders with the correct identity and frontend without it both get blocked. ztunnel is L4-only by design. L4 gives you identity-based rules like "A can call B" which is exactly what ztunnel enforces. The path-and-method rule I wrote needed the L7 layer which is exactly what the waypoint below exists to provide.

![Istio L4 vs L7 security comparison](/img/blog/zero-trust-istio-sidecar-vs-ambient/l4-l7-security-table.png)

### Bringing in a Waypoint for the One Service That Needs It

```bash
# Install Gateway API CRDs first
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.1.0/standard-install.yaml

# Create the waypoint
istioctl waypoint apply --namespace zt-demo --name payments-waypoint --for service
```

![Waypoint created successfully](/img/blog/zero-trust-istio-sidecar-vs-ambient/15-waypoint-created.png)

Only payments gets a waypoint. Frontend, orders and inventory never do because none of them need HTTP-level policy. ztunnel's L4 identity and encryption is all they ever require.

A waypoint is not a custom Istio object. It is a standard Kubernetes Gateway API resource: `gatewayClassName: istio-waypoint`, one listener, port 15008, protocol HBONE — the same tunnel protocol ztunnels use to talk to each other. Waypoints plug into the same Gateway API model Kubernetes already has rather than inventing a new one.

Once istiod finishes reconciling it `istioctl waypoint status` confirms it: `Programmed`, assigned to `payments-waypoint.zt-demo.svc.cluster.local:15008`, ready to receive traffic.

### The Full Picture, Running

```bash
echo '--- namespace labels ---' && kubectl get namespace zt-demo --show-labels
echo '--- app pods ---' && kubectl -n zt-demo get pods -o wide
echo '--- ztunnel pods ---' && kubectl -n istio-system get pods -l app=ztunnel -o wide
echo '--- waypoint pods ---' && kubectl -n zt-demo get pods -l gateway.networking.k8s.io/gateway-name=payments-waypoint -o wide
```

![Full ambient mesh pod listing](/img/blog/zero-trust-istio-sidecar-vs-ambient/16-full-ambient-view.png)

The entire ambient mesh in one view. Every application pod sits at `1/1` READY. No sidecar anywhere. One ztunnel pod for the node. One `payments-waypoint` pod and only one because it's the only service that needed L7. This is the resource story ambient mode makes visible directly in a pod list rather than asserted in a comparison table.

### The Nuance

Getting the waypoint running was the easy part. The `AuthorizationPolicy` that worked perfectly in sidecar mode does not immediately start enforcing anything once the waypoint existed.

In sidecar mode an `AuthorizationPolicy` attaches to a workload with a plain label selector (`selector: matchLabels: app: payments`) because the enforcement point (the sidecar) lives inside that exact pod. In ambient mode HTTP-level enforcement happens on the waypoint, a separate workload. The policy has to explicitly target that waypoint resource.

**Try 1: `targetRefs` pointing at the `Gateway`:**

![Ambient authz policy with targetRefs](/img/blog/zero-trust-istio-sidecar-vs-ambient/17-ambient-authz-yaml.png)

```bash
# From orders
kubectl run curl-orders -n zt-demo --image=curlimages/curl --restart=Never \
  --overrides='{"spec":{"serviceAccountName":"orders"}}' \
  -- curl -s -o /dev/null -w '%{http_code}\n' \
  http://payments.zt-demo.svc.cluster.local/post -X POST -d '{"amount": 500}'
```

![Orders gets 200 — policy not enforced yet](/img/blog/zero-trust-istio-sidecar-vs-ambient/18-orders-200-no-enforce.png)

```bash
# From frontend
kubectl -n zt-demo exec deploy/frontend -- \
  curl -s -o /dev/null -w '%{http_code}\n' \
  http://payments/post -X POST -d '{"amount": 500}'
```

![Frontend also gets 200 — policy not enforced](/img/blog/zero-trust-istio-sidecar-vs-ambient/19-frontend-200-no-enforce.png)

Both gets `200`. The policy does not enforce. The waypoint exists. The policy was applied. But traffic bypasses the waypoint entirely.

The reason is, **the service must be told to use the waypoint.**

**Try 2: `annotate` payments to use `waypoint`:**

```bash
kubectl annotate service payments istio.io/use-waypoint=zt-demo/payments-waypoint
```

![Service annotation attempt](/img/blog/zero-trust-istio-sidecar-vs-ambient/20-annotate-service.png)

![Annotation visible on service](/img/blog/zero-trust-istio-sidecar-vs-ambient/21-annotation-visible.png)

The annotation is on the service but traffic still bypasses the waypoint. The policy never enforces.

The fix is a **label** not an annotation. And the value is just the waypoint name not a namespace-qualified path.

```bash
kubectl label service payments istio.io/use-waypoint=payments-waypoint
```

![Service label applied correctly](/img/blog/zero-trust-istio-sidecar-vs-ambient/23-service-label.png)

Now the service carries the label `istio.io/use-waypoint=payments-waypoint`. Traffic to payments is routed through the waypoint.

Istio's docs recommend `targetRefs: Service` as the more precise option because it binds the policy to the service abstraction rather than the proxy instance. In this demo I used `targetRefs: Gateway` because it feels intuitive: the waypoint is the actual enforcement point so targeting it directly makes the mechanics explicit. Both patterns work. The real gotcha we hit was the `use-waypoint` label on the Service. That is what routes traffic through the waypoint. Without it neither Gateway targeting nor Service targeting would have enforced anything. If you are building this for production, use `targetRefs: Service`. It decouples your policy from waypoint lifecycle and reads more naturally: you are protecting the payments service, not the payments-waypoint proxy.

```bash
# Test from orders
kubectl run curl-orders -n zt-demo --image=curlimages/curl --restart=Never \
  --overrides='{"spec":{"serviceAccountName":"orders"}}' \
  -- curl -s -o /dev/null -w '%{http_code}\n' \
  http://payments.zt-demo.svc.cluster.local/post -X POST -d '{"amount": 500}'
```

![Orders gets 200 with waypoint enforced](/img/blog/zero-trust-istio-sidecar-vs-ambient/24-orders-200-waypoint.png)

Orders gets a `200`.

```bash
# Test from frontend
kubectl -n zt-demo exec deploy/frontend -- \
  curl -s -o /dev/null -w '%{http_code}\n' \
  http://payments/post -X POST -d '{"amount": 500}'
```

![Frontend gets 403 with waypoint enforced](/img/blog/zero-trust-istio-sidecar-vs-ambient/22-frontend-403-waypoint.png)

Frontend gets a `403`. Same cluster, same service, same everything except its identity. The gap is identical to sidecar mode. The mechanism underneath is completely different.

---

## What Actually Changed, Side by Side

| **Aspect** | **Sidecar Mode** | **Ambient Mode** |
| --- | --- | --- |
| **Joining the mesh** | Full rollout restart of every deployment required | One label applied to already-running pods. Zero restarts. |
| **Pod shape** | Full Envoy proxy in every one of the four services (`2/2` READY) | Proxy in exactly one service (`payments`) because it was the only one with an L7 rule (`1/1` READY for the rest) |
| **Policy authoring** | `selector.matchLabels` targets the workload directly | `targetRefs` targets the Gateway or Service plus an `istio.io/use-waypoint` **label** on the Service |
| **Fail-safe when policy exceeds L4** | Not applicable. Every pod has a full proxy. | ztunnel refuses silently and fails safe to DENY. The policy status field tells you exactly why. |
| **mTLS enforcement** | Requires `PeerAuthentication` resource to configure | Active by default for in-mesh traffic. Optional `PeerAuthentication` for explicit control. |

### What Istio's Own Comparison Publishes

Worth citing: Istio reports typical p90/p99 latency of roughly **0.6 to 0.9ms per hop** in sidecar mode since both the source and destination sidecar process every request versus roughly **0.15 to 0.2ms with ztunnel alone** and **0.4 to 0.5ms when a waypoint is in the path**. That's Istio's benchmark in their environment not mine. Worth verifying on your own hardware and environment.

---

## Why Run This Yourself Instead of Reading a Comparison Table

Every sidecar-vs-ambient article can list the theoretical differences in a table. What a table can't do is show you the exact moment ztunnel refuses your policy and tells you why or make you feel the difference between watching four pods restart and watching a label apply to four pods that never blinked. That gap between reading and running is the actual reason this exists as a runnable project instead of another explainer. Clone it, break it and the L4/L7 split stops being a diagram and starts being something you've debugged.

---

## What's Next

If you want to take this further here are immediate hands-on next steps that extend the core comparison:

1. **Verify the fail-safe yourself.** Delete the `payments-waypoint` Gateway but keep the L7 `AuthorizationPolicy` applied. Confirm that all traffic to payments is denied. Then recreate the waypoint, re-apply the Service label and watch access restore. This proves the architecture is protecting you from misconfiguration.
2. **Try `targetRefs: Service` vs `Gateway`.** We used `kind: Gateway` in this demo. Try switching to `kind: Service` (group: `""`, name: `payments`) and confirm identical behavior. Understand when each approach is more appropriate.
3. **Add a second waypoint.** Give `inventory` its own waypoint and an L7 policy. Show that waypoints are per-service not per-namespace and that you only pay the L7 proxy cost where you actually need it.
4. **Measure latency with Fortio.** Run a formal benchmark pass against both modes on the same hardware with Prometheus and Grafana for dashboards to verify Istio's published figures with your own first-hand measurements on a replicable environment.

Repository: `github.com/Prianshu-git/Service-mesh-Zero-Trust-migration`
