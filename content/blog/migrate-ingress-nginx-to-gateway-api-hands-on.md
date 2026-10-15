---
title: "Leaving ingress-nginx: a hands-on migration to Gateway API with ingress2gateway"
seoTitle: "Migrate from ingress-nginx to Gateway API: a hands-on lab with ingress2gateway"
seoDescription: "ingress-nginx is retired. Inventory your annotations, convert with ingress2gateway 1.2, fix what it can't translate, run both side by side and cut over safely."
datePublished: 2026-10-15T10:00:00.000Z
slug: migrate-ingress-nginx-to-gateway-api-hands-on
author: johan-kuylenstierna
draft: false
tags: ["kubernetes", "gateway-api", "ingress-nginx", "networking"]
---

ingress-nginx is not "deprecated" or "in maintenance mode" any more. It is retired. Kubernetes SIG Network and the Security Response Committee [announced in November 2025](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/) that best-effort maintenance would end in March 2026, after which there would be "no further releases, no bugfixes, and no updates to resolve any security vulnerabilities". The Steering Committee followed up in January with a [rather less diplomatic statement](https://kubernetes.io/blog/2026/01/29/ingress-nginx-statement/): staying on it after retirement "leaves you and your users vulnerable to attack", and none of the alternatives are drop-in replacements.

That is what happened. The last controller release, `controller-v1.15.1`, came out on 19 March 2026, and the GitHub repository is now archived (read-only). Your existing controller keeps running, and the Helm chart and images are still downloadable. That is exactly why it is easy to forget about. A proxy that faces the internet and never gets another CVE fix is a slow-motion incident.

This post is the migration I would want to read first: inventory, automated conversion, the parts the converter can't do, running both stacks in parallel, cutover, and rollback. Everything below was run on a throwaway kind cluster, and every output is pasted from the lab logs. Where something failed, you get the failure too.

## The lab

- kind v0.33.0 with node image `kindest/node:v1.37.0` (Kubernetes v1.37.0, containerd 2.3.4)
- ingress-nginx Helm chart 4.15.1 (controller v1.15.1, the final release)
- ingress2gateway 1.2.0
- Envoy Gateway v1.9.2 via Helm (it installed the Gateway API v1.6.1 CRDs, experimental channel)
- kubectl v1.37.1, Helm v3.19.0

Two tiny backends, `app-v1` and `app-v2`, both running `agnhost netexec`. Its `/hostname` endpoint returns the pod name, which makes it easy to see where every request ended up. Both controllers were exposed as NodePorts, and curl ran from a container on the kind Docker network: ingress-nginx on 30080/30443, Envoy Gateway on whatever ports it got.

The five Ingresses cover the annotations I see most often in real clusters:

| Ingress | Host | What it does |
|---|---|---|
| `web` | shop.lab.test | plain host + prefix routing to app-v1 |
| `web-canary` | shop.lab.test | `canary: "true"`, `canary-weight: "20"` to app-v2 |
| `api` | api.lab.test | `use-regex` + `rewrite-target: /$2` on `/api(/\|$)(.*)` |
| `secure` | secure.lab.test | TLS secret + `force-ssl-redirect: "true"` |
| `legacy` | old.lab.test | `permanent-redirect: https://shop.lab.test/` |

Baseline through ingress-nginx, so we know what "correct" looks like:

```text
## plain: shop.lab.test /hostname
app-v1-56f5bd6b9-t46kf
## canary: 200 requests to shop.lab.test
    159 app-v1
     41 app-v2
## rewrite: api.lab.test/api/echo?msg=rewritten
rewritten [200]
## tls redirect: http://secure.lab.test/
308 https://secure.lab.test/
## permanent redirect: old.lab.test
301 https://shop.lab.test/
```

41 out of 200 is about 20%. Good.

## Step 1: inventory before you convert anything

The converter will tell you what it couldn't translate. But you want the list *before* you run it, because that list is your real migration backlog. One jq one-liner gives you every ingress-nginx annotation per Ingress:

```bash
$ kubectl get ingress -A -o json | jq -r '.items[] | "\(.metadata.namespace)/\(.metadata.name)", (.metadata.annotations // {} | to_entries[] | select(.key|startswith("nginx.ingress.kubernetes.io/")) | "    \(.key)=\(.value)")'
shop/api
    nginx.ingress.kubernetes.io/rewrite-target=/$2
    nginx.ingress.kubernetes.io/use-regex=true
shop/legacy
    nginx.ingress.kubernetes.io/permanent-redirect=https://shop.lab.test/
shop/secure
    nginx.ingress.kubernetes.io/force-ssl-redirect=true
shop/web
shop/web-canary
    nginx.ingress.kubernetes.io/canary=true
    nginx.ingress.kubernetes.io/canary-weight=20
```

And a frequency count, which is the one to paste into the planning ticket:

```bash
$ kubectl get ingress -A -o json | jq -r '[.items[].metadata.annotations // {} | keys[] | select(startswith("nginx.ingress.kubernetes.io/"))] | group_by(.) | map("\(length) \(.[0])") | .[]'
1 nginx.ingress.kubernetes.io/canary
1 nginx.ingress.kubernetes.io/canary-weight
1 nginx.ingress.kubernetes.io/force-ssl-redirect
1 nginx.ingress.kubernetes.io/permanent-redirect
1 nginx.ingress.kubernetes.io/rewrite-target
1 nginx.ingress.kubernetes.io/use-regex
```

In a real cluster, also grep for `configuration-snippet` and `server-snippet`. Raw NGINX config has no Gateway API equivalent at all. Each of those means a conversation with whoever wrote it, ideally before the coffee runs out.

## Step 2: convert with ingress2gateway

[ingress2gateway](https://github.com/kubernetes-sigs/ingress2gateway) reads Ingresses from the cluster (or from files with `--input-file`) and prints Gateway API resources. It doesn't touch the cluster, so it's safe to run against production with a read-only kubeconfig.

```bash
$ ingress2gateway print --providers ingress-nginx -A > /lab/out/gw-standard.yaml; echo; wc -l /lab/out/gw-standard.yaml
```

What lands in the file: one `Gateway` named `nginx` with a listener per hostname (HTTP for all five, plus HTTPS for secure.lab.test referencing `secure-tls`), and one HTTPRoute per Ingress/host. The useful part is stderr, trimmed here to the warnings that matter:

```text
│  Unsupported annotation nginx.ingress.kubernetes.io/force-ssl-redirect
│  object: : shop/secure
│  Using case-insensitive regex path matches. You may want to change this.
│  object: HTTPRoute: shop/api-api-lab-test
│  Failed to apply metadata.annotations."nginx.ingress.kubernetes.io/rewrite-target" from rewrite-target from Ingress shop/api: Path rewrites with capture group references are not supported
│  Gateway API does not support configuring URL normalization (RFC 3986, Section 6). Please check if this matters for your use case and consult implementation-specific details.
```

There were also three warnings that ingress-nginx serves HTTPS with its self-signed default certificate for hosts that have no TLS block (shop, api, old), and that this "will not be translated". If someone out there is using `https://api...` and clicking through a certificate warning, that stops working after the move. Probably for the best.

How each case came out:

**Canary weights: translated well.** The two Ingresses for `shop.lab.test` were merged into one rule with weighted backends:

```yaml
  rules:
  - backendRefs:
    - name: app-v1
      port: 80
      weight: 80
    - name: app-v2
      port: 80
      weight: 20
```

That is nicer than the annotation version. The split is part of the route itself, not a second "shadow" Ingress.

**Permanent redirect: translated.** A `RequestRedirect` filter with `hostname: shop.lab.test`, `scheme: https`, `statusCode: 301` and `replaceFullPath: /`.

**TLS + HTTP→HTTPS: translated, despite the warning.** It said `force-ssl-redirect` was unsupported, but it still generated a separate HTTPRoute on port 80 with a `RequestRedirect` (`scheme: https`, `statusCode: 308`), because ingress-nginx redirects TLS hosts by default anyway. Read the warnings, then read the YAML. They don't always agree.

**Regex + rewrite: not translated.** The route kept a match of `RegularExpression` with value `(?i)/api(/|$)(.*).*` and dropped the rewrite entirely. Hold that thought.

I also tried `--emitter envoy-gateway --allow-experimental-gw-api`. For these five Ingresses, the output was the same apart from adding `name: rule-0` to each rule. The capture-group rewrite failed the same way. Emitters matter more once you have implementation-specific annotations (timeouts, rate limits, auth).

## Step 3: pick an implementation (without falling in love)

Gateway API is a spec. You still need something that implements it, and the [official implementations page](https://gateway-api.sigs.k8s.io/implementations/) lists conformance per version. Here's how I'd choose:

- **Conformance** with the Gateway API version you plan to run, including the extended features you actually use (weights, redirects, URL rewrite).
- **What you already operate.** If you run Istio or Cilium, their Gateway API support is the obvious first candidate, and you avoid adding another data plane.
- **Governance and release cadence.** After this whole episode, "who maintains this and how many of them are there" is a fair question.
- **Escape hatches** for the things the spec doesn't cover yet. They will be vendor-specific CRDs, so keep them few and well documented.

I used Envoy Gateway for the lab because it's an Envoy sub-project, it installs as a single Helm chart, and it's a plain standalone gateway with no mesh attached. That keeps the experiment small. It is not a recommendation over the others. The Gateway and HTTPRoute objects in this post are portable, which is the whole point.

```bash
$ helm install eg oci://docker.io/envoyproxy/gateway-helm --version v1.9.2 -n envoy-gateway-system --create-namespace --wait --timeout 5m
```

ingress2gateway set `gatewayClassName: nginx`, which would be a confusing name for a GatewayClass that runs Envoy. So I created a class called `envoy-gateway` (controllerName `gateway.envoyproxy.io/gatewayclass-controller`) and changed the reference with sed before applying:

```bash
$ sed 's/gatewayClassName: nginx/gatewayClassName: envoy-gateway/' /lab/out/gw-standard.yaml > /lab/out/gw-envoy-class.yaml && grep -n gatewayClassName /lab/out/gw-envoy-class.yaml && kubectl apply -f /lab/out/gw-envoy-class.yaml
9:  gatewayClassName: envoy-gateway
gateway.gateway.networking.k8s.io/nginx created
httproute.gateway.networking.k8s.io/secure-secure-lab-test created
httproute.gateway.networking.k8s.io/web-shop-lab-test created
httproute.gateway.networking.k8s.io/secure-secure-lab-test-http created
httproute.gateway.networking.k8s.io/api-api-lab-test created
httproute.gateway.networking.k8s.io/legacy-old-lab-test created
```

## Step 4: test, and distrust the 200s

Same test script, now pointed at Envoy Gateway's NodePorts:

```text
## canary: 200 requests to shop.lab.test
    159 app-v1
     41 app-v2
## rewrite: api.lab.test/api/echo?msg=rewritten
NOW: 2026-10-13 11:21:03.194588365 +0000 UTC m=+307.558810909 [200]
## tls redirect: http://secure.lab.test/
308 https://secure.lab.test/
## permanent redirect: old.lab.test
301 https://shop.lab.test/
```

Redirects match and the canary split matches. And the rewrite case returns **HTTP 200 with the wrong body**. Without the rewrite, the backend received `/api/echo` and answered with its catch-all handler. A health check that only looks at status codes would call this a success. Compare response bodies, not just status codes.

The fix is the standard `URLRewrite` filter. This is the moment to drop the regex too. `/api(/|$)(.*)` + `/$2` is just a long way of writing "strip the `/api` prefix":

```yaml
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /api
    filters:
    - type: URLRewrite
      urlRewrite:
        path:
          type: ReplacePrefixMatch
          replacePrefixMatch: /
    backendRefs:
    - name: app-v1
      port: 80
```

```bash
$ kubectl apply -f api-route-fixed.yaml && sleep 5 && curl -s -w ' [%{http_code}]' -H 'Host: api.lab.test' 'http://gwlab-control-plane:30282/api/echo?msg=rewritten'; echo; curl -s -w ' [%{http_code}]' -H 'Host: api.lab.test' http://gwlab-control-plane:30282/api/hostname; echo
httproute.gateway.networking.k8s.io/api-api-lab-test configured
rewritten [200]
app-v1-56f5bd6b9-t46kf [200]
```

If your rewrites really need capture groups in the middle of a path, the standard API won't do it, and you're into implementation-specific extensions. Count those during the inventory step, not on cutover night.

My first TLS test failed against **both** controllers with curl's `[000]`. I briefly blamed the certificate. The actual cause: `getent hosts` returned the node's IPv6 address, and the NodePorts were only listening on IPv4. With `getent ahostsv4`, both worked:

```text
--- ingress-nginx
app-v1-56f5bd6b9-t46kf [200]
--- envoy gateway
app-v1-56f5bd6b9-t46kf [200]
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / X25519 / RSASSA-PSS
*  subject: CN=secure.lab.test
```

Lesson: when everything fails at once, suspect the test before the system.

## The gotcha I didn't expect: canary scope

While checking the rewrite on ingress-nginx, some `api.lab.test` requests answered with an `app-v2` pod name. No Ingress for `api.lab.test` points at app-v2. So I sent 100 requests to each controller:

![Canary scope: ingress-nginx vs Envoy Gateway](/img/blog/migrate-ingress-nginx-to-gateway-api-hands-on/canary-scope.png)

On ingress-nginx, 23 of 100 requests to a *different hostname* went to the canary. On Envoy Gateway, all 100 went to app-v1, because the weights live in the `shop.lab.test` route and nowhere else. My reading is that ingress-nginx attaches the canary to the backend service (`app-v1:80`), not to the host. So every Ingress that shares that backend gets the split too. I haven't dug through the controller source to confirm it, so treat that as a hypothesis. The behaviour itself is in the logs.

Why this matters for the migration: if anyone relied on this, maybe without knowing it, the Gateway API version is *more* correct and *different*. Traffic graphs per host will shift on cutover day. Write that in the change ticket before someone else discovers it in a dashboard.

## Step 5: run both, cut over, keep the rollback warm

Both controllers watch different APIs (`Ingress` with class `nginx` versus `Gateway`/`HTTPRoute`), so they can run side by side with no fighting:

```bash
$ echo '--- ingress-nginx :30080'; curl -s -H 'Host: shop.lab.test' http://gwlab-control-plane:30080/hostname; echo; echo '--- envoy gateway :30282'; curl -s -H 'Host: shop.lab.test' http://gwlab-control-plane:30282/hostname; echo
--- ingress-nginx :30080
app-v2-85d768d94d-9qb4p
--- envoy gateway :30282
app-v1-56f5bd6b9-t46kf
```

(Different pods, same host: that's just the 80/20 split doing its job.)

In production, the cutover is a DNS or load-balancer change: point the hostname at the Gateway's address, ideally with a low TTL that you lowered a day earlier. In the lab, I simulated "nginx is gone" by scaling it to zero:

```bash
$ kubectl -n ingress-nginx scale deploy/ingress-nginx-controller --replicas=0 && kubectl -n ingress-nginx wait pod -l app.kubernetes.io/component=controller --for=delete --timeout=120s; curl -s -m 5 -o /dev/null -w 'nginx: %{http_code}\n' -H 'Host: shop.lab.test' http://gwlab-control-plane:30080/hostname; curl -s -m 5 -o /dev/null -w 'envoy: %{http_code}\n' -H 'Host: shop.lab.test' http://gwlab-control-plane:30282/hostname
deployment.apps/ingress-nginx-controller scaled
pod/ingress-nginx-controller-56b4f49c8b-czmgg condition met
nginx: 000
envoy: 200
```

And the rollback, which is the reason you don't delete the Ingress objects yet:

```bash
$ kubectl -n ingress-nginx scale deploy/ingress-nginx-controller --replicas=1 && kubectl -n ingress-nginx rollout status deploy/ingress-nginx-controller --timeout=120s && sleep 5; curl -s -m 5 -w ' [%{http_code}]\n' -H 'Host: shop.lab.test' http://gwlab-control-plane:30080/hostname
deployment.apps/ingress-nginx-controller scaled
Waiting for deployment "ingress-nginx-controller" rollout to finish: 0 of 1 updated replicas are available...
deployment "ingress-nginx-controller" successfully rolled out
app-v1-56f5bd6b9-t46kf [200]
```

A rollback plan that fits on a sticky note:

1. Keep the Ingress objects and the ingress-nginx release in place until the Gateway has handled real traffic for an agreed period.
2. Roll back by pointing DNS/LB back at the old address. Don't edit routes under pressure.
3. Keep the TLS secrets shared (both stacks referenced the same `secure-tls`). Then a rollback never depends on cert-manager timing.
4. Only then uninstall ingress-nginx and delete the Ingresses, in a separate, boring change.

## Smaller gotchas from the lab

- **`Programmed=False` doesn't always mean broken.** On kind, the Gateway reported `Programmed=False AddressNotAssigned: No addresses have been assigned to the Gateway`, because the LoadBalancer Service stayed `<pending>`, while traffic through the NodePort worked fine. All HTTPRoutes were `Accepted=True ResolvedRefs=True`. In the cloud this condition means something. On bare metal, check how addresses get assigned (MetalLB, cloud LB, etc.).
- **Regex is case-insensitive after conversion** (`(?i)`), because NGINX matched it that way. Decide whether you want to keep that.
- **Generated names** (`nginx`, `api-api-lab-test`, `secure-secure-lab-test-http`) are fine for a first pass. Rename them before they end up in Git forever.
- **Ownership changes.** With Gateway API, the Gateway (listeners, certs) can belong to the platform team while app teams own their HTTPRoutes. That's a feature, but agree who owns what *before* migrating, or you'll just recreate the old free-for-all with more YAML.

## Wrapping up

The conversion tool got me most of the way. Weights and redirects came through cleanly. The rewrite came through silently wrong. And the canary behaviour changed in a way that's arguably a fix. That ratio sounds about right for real clusters too: the tooling saves you days, and the inventory and the body-checking tests save you the incident.

If you'd like a second pair of eyes on a cluster before (or after) the move, that's the kind of [Kubernetes work we do at Agency 42](https://agency42.se/en/kubernetes).

---

*Commands verified on a kind lab cluster (kind v0.33.0, Kubernetes v1.37.0, ingress-nginx controller v1.15.1, ingress2gateway 1.2.0, Envoy Gateway v1.9.2 with Gateway API v1.6.1 CRDs) on 13 Oct 2026. Drafted with AI assistance; reviewed and approved by Johan Kuylenstierna.*
