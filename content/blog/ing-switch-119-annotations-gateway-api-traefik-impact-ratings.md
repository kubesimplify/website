---
title: "The Ingress NGINX Migration Just Got Easier: 119 Annotations, 3 Targets, Impact Ratings"
seoTitle: "ing-switch: Migrate 119 NGINX Annotations to Gateway API or "
seoDescription: "\"Ingress NGINX was archived March 24, 2026. ing-switch maps all 119 NGINX annotations with"
datePublished: 2026-03-30T12:30:00.000Z
slug: ing-switch-119-annotations-gateway-api-traefik-impact-ratings
author: saiyam-pathak
cover: /img/blog/ing-switch-119-annotations-gateway-api-traefik-impact-ratings/a6561232-6f6b-451c-86ca-bbf693fbb9a6.png
tags: ["kubernetes", "migration", "devops", "cloud-native", "traefik", "gateway-api", "ingress-nginx"]
cuid: cmnd62a6k000021gr3y2y1kwy
---
A few months ago, I built [ing-switch](https://github.com/saiyam1814/ing-switch) and [wrote about it on kubesimplify](https://blog.kubesimplify.com/ing-switch-migrate-from-ingress-nginx-to-traefik-or-gateway-api-in-minutes-not-days). The response was incredible -- people loved the annotation mapping and the visual dashboard.

Since then, **ingress-nginx was officially archived** (March 24, 2026). March 31 is end of life -- zero security patches after that date.

Based on community feedback from KubeCon, this is the biggest update yet: **119 annotations** (up from 50), **Gateway API with Traefik as the provider** (the #1 request), and **impact ratings** on every annotation so you know exactly what matters.

This post walks through a **complete end-to-end migration** on a [vind](https://github.com/loft-sh/vind) cluster with actual command outputs.

## Why You Need to Migrate Now

*   **Nov 11, 2025:** Kubernetes SIG Network announces ingress-nginx retirement
    
*   **Jan 29, 2026:** Joint statement from Kubernetes Steering + Security Response Committees urging immediate migration
    
*   **Mar 24, 2026:** GitHub repository archived (read-only)
    
*   **Mar 31, 2026:** End of life -- zero support from this date
    

Chainguard maintains a fork for CVE-level fixes only -- no features, no community PRs, no pre-built images. You're on your own.

## The Three Migration Paths

![](/img/blog/ing-switch-119-annotations-gateway-api-traefik-impact-ratings/eeadef24-e6cd-455a-847c-34fedd6cd96e.png align="center")

| Target | Best For | What Changes |
| --- | --- | --- |
| **Traefik v3** | Fastest migration, lowest friction | Keep Ingress API, swap annotations to Middleware CRDs |
| **Gateway API (Envoy)** | Future-proof standard | Replace Ingresses with HTTPRoutes, Envoy policies |
| **Gateway API (Traefik)** | Rancher / k3s users | Standard HTTPRoutes + Gateway resources, with Traefik as the controller implementation. Advanced features (rate limiting, auth, IP filtering) use Traefik Middleware CRDs as extension policies. |

## The Annotation Problem

The real complexity isn't swapping controllers -- it's the **annotations**. A typical production Ingress has 10-15 NGINX annotations for SSL, auth, rate limiting, CORS, session affinity, and more.

ing-switch maps **119 annotations** with impact ratings:

|  | Traefik | Gateway API |
| --- | --- | --- |
| Supported (direct equivalent) | 35 | 39 |
| Partial (needs minor adjustment) | 48 | 25 |
| Unsupported (with impact notes) | 42 | 62 |

Every unsupported annotation gets an **impact rating**: `NONE` (safe to ignore), `LOW` (better defaults), `MEDIUM` (needs workaround), or `VARIES` (review your snippets). Most teams discover **70%+ of "unsupported" annotations are safe to ignore**.

## End-to-End Demo: vCluster + ing-switch

[![asciicast](https://asciinema.org/a/nOYDQukAC4bzdSVI.svg align="center")](https://asciinema.org/a/nOYDQukAC4bzdSVI)

Let's walk through a complete migration on a real cluster. We'll use [vCluster](https://www.vcluster.com/) to spin up a Kubernetes cluster in Docker, deploy 3 services with NGINX annotations, and migrate them to Gateway API with Traefik.

### Step 1: Create a Cluster

```bash
vcluster create demo --driver docker
```

Output:

```text
info  Using vCluster driver 'docker' to create your virtual clusters
info  Ensuring environment for vCluster demo...
done  Created network vcluster.demo
info  Starting vCluster standalone demo
done  Successfully created virtual cluster demo
info  Waiting for vCluster to become ready...
done  vCluster is ready
done  Switched active kube context to vcluster-docker_demo
```

Verify:

```bash
kubectl get namespaces
```

```text
NAME                 STATUS   AGE
default              Active   16s
kube-flannel         Active   6s
kube-node-lease      Active   16s
kube-public          Active   16s
kube-system          Active   16s
local-path-storage   Active   6s
```

### Step 2: Install Ingress NGINX

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=ClusterIP \
  --set controller.admissionWebhooks.enabled=false \
  --wait --timeout 120s
```

```text
NAME: ingress-nginx
LAST DEPLOYED: Sun Mar 29 11:15:57 2026
NAMESPACE: ingress-nginx
STATUS: deployed
```

```bash
kubectl get pods -n ingress-nginx
```

```text
NAME                                        READY   STATUS    RESTARTS   AGE
ingress-nginx-controller-5486dbd97f-vc9wv   1/1     Running   0          54s
```

### Step 3: Deploy 3 Apps with NGINX Annotations

We deploy three services, each with different annotation patterns:

**App 1 -- Basic web app** (SSL redirect + timeouts):

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-app
  namespace: demo
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "10"
spec:
  ingressClassName: nginx
  rules:
  - host: web.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-app
            port:
              number: 80
```

**App 2 -- API with CORS + rate limiting** (10 annotations):

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-cors
  namespace: demo
  annotations:
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://app.example.com,https://admin.example.com"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, PUT, DELETE, OPTIONS"
    nginx.ingress.kubernetes.io/cors-allow-headers: "Content-Type, Authorization, X-API-Key"
    nginx.ingress.kubernetes.io/cors-allow-credentials: "true"
    nginx.ingress.kubernetes.io/cors-max-age: "86400"
    nginx.ingress.kubernetes.io/limit-rps: "50"
    nginx.ingress.kubernetes.io/limit-burst-multiplier: "3"
    nginx.ingress.kubernetes.io/proxy-body-size: "5m"
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /v1
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
```

**App 3 -- Auth-protected dashboard** (external auth + IP allowlist + session affinity):

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dashboard
  namespace: demo
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/auth-url: "https://auth.example.com/verify"
    nginx.ingress.kubernetes.io/auth-response-headers: "X-User-ID,X-User-Email"
    nginx.ingress.kubernetes.io/whitelist-source-range: "10.0.0.0/8,172.16.0.0/12"
    nginx.ingress.kubernetes.io/affinity: "cookie"
    nginx.ingress.kubernetes.io/session-cookie-name: "dashboard-session"
    nginx.ingress.kubernetes.io/session-cookie-max-age: "3600"
spec:
  ingressClassName: nginx
  rules:
  - host: dashboard.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: dashboard
            port:
              number: 80
```

After applying all three:

```bash
kubectl get ingress -n demo
```

```text
NAME        CLASS   HOSTS                   ADDRESS   PORTS   AGE
api-cors    nginx   api.example.com                   80      5s
dashboard   nginx   dashboard.example.com             80      5s
web-app     nginx   web.example.com                   80      5s
```

```bash
kubectl get pods -n demo
```

```text
NAME                           READY   STATUS    RESTARTS   AGE
api-service-5f99b6d99d-x7vmn   1/1     Running   0          24s
dashboard-9ddbf867-7dbgf       1/1     Running   0          24s
web-app-969c76b7c-7wqw5        1/1     Running   0          24s
```

3 ingresses, 20 NGINX annotations, 3 services running. Now let's see what ing-switch makes of this.

### Step 4: Scan the Cluster

```bash
ing-switch scan
```

```text
  ing-switch -- Cluster Scan Results
  Cluster: vcluster-docker_demo

  Ingress Controller Detected
  Type:      ingress-nginx
  Version:   unknown
  Namespace: ingress-nginx

  Found 3 Ingress resource(s)

  NAMESPACE   NAME        HOSTS                   ANNOTATIONS   TLS   COMPLEXITY
  ---------   ----        -----                   -----------   ---   ----------
  demo        api-cors    api.example.com         10            no    unsupported
  demo        dashboard   dashboard.example.com   7             no    complex
  demo        web-app     web.example.com         3             no    complex
```

ing-switch detected the NGINX controller and found all 3 ingresses with their annotation counts and complexity scores.

### Step 5: Analyze Compatibility

Let's compare all three targets:

**Traefik v3:**

```bash
ing-switch analyze --target traefik
```

```text
  Summary
  -------
  Total ingresses:      3
  Fully compatible:     1
  Needs workarounds:    2
  Has unsupported:      0
```

**Gateway API (Envoy):**

```bash
ing-switch analyze --target gateway-api
```

```text
  Summary
  -------
  Total ingresses:      3
  Fully compatible:     0
  Needs workarounds:    3
  Has unsupported:      0
```

**Gateway API (Traefik):**

```bash
ing-switch analyze --target gateway-api-traefik
```

```text
  Summary
  -------
  Total ingresses:      3
  Fully compatible:     0
  Needs workarounds:    3
  Has unsupported:      0
```

Key insight: **Traefik is the highest-compatibility target** for this workload (1 fully compatible out of 3). The CORS annotations map directly to Traefik's Headers middleware. For Gateway API, CORS is now also fully supported thanks to the native CORS filter in Gateway API v1.5.

Here's the detailed annotation mapping for the API with CORS:

```text
  demo/api-cors
  -------------
  ANNOTATION               STATUS        TARGET RESOURCE                    NOTES
  enable-cors              [supported]   HTTPRoute (CORS filter)            Native CORS filter (GA in Gateway API v1.5)
  cors-allow-origin        [supported]   HTTPRoute (CORS filter)            allowOrigins in CORS filter
  cors-allow-methods       [supported]   HTTPRoute (CORS filter)            allowMethods in CORS filter
  cors-allow-headers       [supported]   HTTPRoute (CORS filter)            allowHeaders in CORS filter
  cors-allow-credentials   [supported]   HTTPRoute (CORS filter)            allowCredentials in CORS filter
  cors-max-age             [supported]   HTTPRoute (CORS filter)            maxAge in CORS filter
  force-ssl-redirect       [supported]   HTTPRoute (RequestRedirect filter) 301 redirect to HTTPS
  limit-rps                [partial]     BackendTrafficPolicy (RateLimit)   Envoy Gateway BackendTrafficPolicy
  limit-burst-multiplier   [partial]     BackendTrafficPolicy (RateLimit)   Burst configurable but uses tokens
  proxy-body-size          [partial]     BackendTrafficPolicy               requestBuffer.limit
```

7 out of 10 annotations are fully supported. The 3 "partial" ones work -- they just use a slightly different API.

### Step 6: Generate Migration Files

```bash
ing-switch migrate --target gateway-api-traefik --output-dir ./migration
```

```text
  ing-switch -- Generating Migration Files
  Target:     gateway-api-traefik
  Output dir: ./migration

  + 00-migration-report.md
  + 01-install-gateway-api-crds/install.sh
  + 02-install-traefik-gateway/helm-install.sh
  + 02-install-traefik-gateway/values.yaml
  + 03-gateway/gatewayclass.yaml
  + 03-gateway/gateway.yaml
  + 04-httproutes/demo-api-cors.yaml
  + 04-httproutes/demo-dashboard.yaml
  + 04-httproutes/demo-web-app.yaml
  + 05-policies/demo-api-cors-ratelimit.yaml
  + 05-policies/demo-dashboard-forwardauth.yaml
  + 05-policies/demo-dashboard-ipallowlist.yaml
  + 06-verify.sh
  + 07-cleanup/remove-nginx.sh
  Generated 13 files in ./migration/
```

### Step 7: Inspect the Generated YAML

**GatewayClass -- points to Traefik, not Envoy:**

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: traefik
spec:
  controllerName: traefik.io/gateway-controller
```

**HTTPRoute with native CORS filter** (no more ResponseHeaderModifier hacks):

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: api-cors
  namespace: demo
spec:
  parentRefs:
  - name: ing-switch-gateway
    namespace: default
  hostnames:
  - "api.example.com"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: "/v1"
    filters:
    - type: CORS
      cors:
        allowOrigins:
        - type: Exact
          value: "https://app.example.com"
        - type: Exact
          value: "https://admin.example.com"
        allowMethods:
        - "GET"
        - "POST"
        - "PUT"
        - "DELETE"
        - "OPTIONS"
        allowHeaders:
        - "Content-Type"
        - "Authorization"
        - "X-API-Key"
        allowCredentials: true
        maxAge: "86400s"
    backendRefs:
    - name: api-service
      port: 80
```

**Traefik Middleware CRDs** (not Envoy-specific policies):

```yaml
# Rate Limiting
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: demo-api-cors-ratelimit
  namespace: demo
spec:
  rateLimit:
    average: 50
    burst: 3
```

```yaml
# ForwardAuth (external authentication)
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: demo-dashboard-forwardauth
  namespace: demo
spec:
  forwardAuth:
    address: "https://auth.example.com/verify"
  authResponseHeaders:
    - "X-User-ID"
    - "X-User-Email"
```

```yaml
# IP AllowList
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: demo-dashboard-ipallowlist
  namespace: demo
spec:
  ipAllowList:
    sourceRange:
    - "10.0.0.0/8"
    - "172.16.0.0/12"
```

### Step 8: Review the Migration Report

The `migrate` command automatically generates `00-migration-report.md` in the output directory. Open it to see the full summary:

```bash
cat ./migration/00-migration-report.md
```

```markdown
# ing-switch Migration Report
**Target Controller:** gateway-api-traefik

## Summary
| Metric | Count |
|--------|-------|
| Total Ingresses | 3 |
| Fully Compatible | 0 |
| Needs Workarounds | 3 |
| Has Unsupported Annotations | 0 |

## demo/api-cors -- Needs workaround
| Annotation | Status | Target Resource | Notes |
|-----------|--------|-----------------|-------|
| enable-cors | OK | HTTPRoute (CORS filter) | Native CORS filter (GA in v1.5) |
| cors-allow-origin | OK | HTTPRoute (CORS filter) | allowOrigins in CORS filter |
| limit-rps | WARN | BackendTrafficPolicy | Envoy Gateway BackendTrafficPolicy |
...
```

### Step 9: Apply (Dry-Run First)

![](/img/blog/ing-switch-119-annotations-gateway-api-traefik-impact-ratings/b4c92aec-3c11-41e4-84da-bce1b3891573.png align="center")

```bash
# Install Gateway API CRDs
bash ./migration/01-install-gateway-api-crds/install.sh

# Install Traefik with Gateway API provider
bash ./migration/02-install-traefik-gateway/helm-install.sh

# Dry-run all resources first
kubectl apply -f ./migration/03-gateway/ --dry-run=server
kubectl apply -f ./migration/04-httproutes/ --dry-run=server

# If dry-run passes, apply for real
kubectl apply -f ./migration/03-gateway/
kubectl apply -f ./migration/04-httproutes/
kubectl apply -f ./migration/05-policies/
```

At this point, **both NGINX and Traefik are running side by side**. DNS still points to NGINX. Production traffic is untouched.

### Step 10: Verify and Cutover

```bash
# Run the generated verification script
bash ./migration/06-verify.sh

# Once verified, update DNS to Traefik's IP
# Then clean up NGINX
bash ./migration/07-cleanup/remove-nginx.sh
```

### Step 11: Use the Web UI

For teams that prefer a visual workflow:

```bash
ing-switch ui
# Opens http://localhost:8080
```

The dashboard provides four pages:

**Detect** -- Scan your cluster and see all ingresses with annotation counts and complexity:

![](/img/blog/ing-switch-119-annotations-gateway-api-traefik-impact-ratings/609e59ce-ab2a-40ac-8aa9-a864ad9be8e6.png align="center")

**Analyze** -- Choose between 3 targets and see the full annotation compatibility matrix:

![](/img/blog/ing-switch-119-annotations-gateway-api-traefik-impact-ratings/c6fa8d3a-1723-4e8f-bf54-f32d823ccf91.png align="center")

**Migrate** -- One-click generation with step-by-step checklist and dry-run buttons:

![](/img/blog/ing-switch-119-annotations-gateway-api-traefik-impact-ratings/344c9635-82e2-430e-aee4-7d1595bf96a7.png align="center")

View all generated files inline with syntax highlighting:

![](/img/blog/ing-switch-119-annotations-gateway-api-traefik-impact-ratings/0b3a75b4-5b82-4d70-b340-7cf0ba784f63.png align="center")

See migration gaps with impact ratings and fix instructions:

![](/img/blog/ing-switch-119-annotations-gateway-api-traefik-impact-ratings/4b9e6053-3d6e-42ba-896a-44b3727e8349.png align="center")

**Validate** -- Run live cluster checks to confirm your migration phase:

![](/img/blog/ing-switch-119-annotations-gateway-api-traefik-impact-ratings/f64e5599-45ac-490a-a6fd-757f9fda13ad.png align="center")

### Cleanup

```bash
vcluster delete demo --driver docker
```

```plaintext
done  Successfully deleted virtual cluster demo
```

## What Makes ing-switch Different

| Feature | ing-switch | ingress2gateway | Manual |
| --- | --- | --- | --- |
| Annotation coverage | 119 | 30+ | You count |
| Traefik Ingress target | Yes | No | \-- |
| Gateway API (Traefik) | Yes | No | \-- |
| Gateway API (Envoy) | Yes | Yes | \-- |
| Impact ratings | Yes | No | No |
| Web UI | Yes | No | No |
| Install scripts | Yes | No | No |
| Verification scripts | Yes | No | No |
| DNS migration guide | Yes | No | No |
| Dry-run mode | Yes | No | \-- |

## The Ecosystem Is Ready

*   **Gateway API v1.5** -- CORS filter, TLSRoute, BackendTLSPolicy all GA
    
*   **ingress2gateway v1.0** -- Official tool with emitter architecture
    
*   **Traefik v3.7** -- Native NGINX annotation provider (80+ annotations)
    
*   **Envoy Gateway v1.7** -- XListenerSet, enhanced policies
    
*   **cert-manager v1.20** -- Gateway API ListenerSet support
    
*   **Kubernetes 1.36** -- Ships April 22, first release post-NGINX archival
    

The tools exist. The standards are stable. The only thing left is to actually run the migration.

* * *

**Star it, fork it, migrate today:** [github.com/saiyam1814/ing-switch](https://github.com/saiyam1814/ing-switch)

*ing-switch is open source under the MIT license. PRs welcome.*