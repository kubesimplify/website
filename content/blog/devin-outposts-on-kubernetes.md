---
title: "Devin Outposts on Kubernetes: Why Your AI Agent Needs Your Cluster"
seoTitle: "Devin Outposts on Kubernetes: Run AI Agent Sessions on Your Own Cluster"
seoDescription: "Devin Outposts runs AI coding agent sessions as pods on your own Kubernetes cluster, with an open-source operator to manage the fleet."
datePublished: 2026-08-10T14:15:00.000Z
slug: devin-outposts-on-kubernetes
author: saiyam-pathak
cover: /img/blog/devin-outposts-on-kubernetes/cover.png
tags: ["kubernetes", "ai-agents", "devin", "platform-engineering"]
---

Ask a cloud coding agent to fix the bug that only reproduces against your staging database, and watch it fail in the most useless way possible: not loudly, but blindly.

It clones your repo fine. Then `pip install` times out: your packages live on an internal Artifactory mirror. `docker build` fails: your base images are in a private Harbor registry. The integration tests can't run, because staging Postgres is a ClusterIP service with no public endpoint, and your security team is never going to IP-allowlist a SaaS vendor into it.

The agent can still *edit* code. But it can't **verify** anything. And an agent that can't run the tests is just a very confident PR generator. The whole value of an autonomous agent is the run-fail-fix loop, and that loop dies at your firewall.

On July 21, Cognition shipped their answer: [Devin Outposts](https://devin.ai/blog/introducing-devin-outposts). Their tagline is honest about the direction of travel: *"Some work can't come to the cloud, so we're bringing Devin to it."*

And the part that made me sit up: they didn't just publish an API. They shipped an [open-source Kubernetes operator](https://github.com/CognitionAI/devin-outpost-k8s). I've been running it since launch week, first on kind, then on a two-node cluster running inside Apple Containers on my Mac (using [kiac](https://github.com/saiyam1814/kiac)). I want to walk you through what it actually is, because the architecture is genuinely clever and the Kubernetes fit is not an accident.

## What runs where (read this twice, it's the whole concept)

Outposts does **not** self-host Devin. There is no model on your machines, no GPU requirement, no weights. The split is:

| Component | Runs where | What it does |
| --- | --- | --- |
| Brain: model, inference, planning, session UI | Cognition's cloud, always | Decides *what* to do next |
| Operator (one tiny pod) | Your cluster, always on | Watches the queue, claims sessions, creates worker pods |
| Worker (one pod per active session) | Your cluster, only while a session runs | The computer Devin types on: shell, filesystem, git, your network position |

A session is a ping-pong over a single outbound HTTPS/websocket connection: the brain says "run `pytest`", the worker pod runs it, the traceback streams back up, the model reads it, decides the fix, sends the next command. Your cluster never thinks. The cloud never executes. No inbound ports, no VPN, no public IPs: workers only dial out.

The mental model that clicks for anyone who runs Kubernetes: **self-hosted CI runners, except the pipeline isn't static YAML; it's a model deciding the next step from the last output.** You already operate this exact pattern for GitLab or GitHub Actions runners.

One honest caveat before we go further: the code context the agent reads still goes up to the model in the cloud. What stays home is *execution*: your secrets, your network access, your build artifacts, your hardware. If you need the model itself inside your walls, this isn't that product.

## The use case, end to end

Here's the workflow that justifies the whole feature. Say your team wants Devin to burn down 15 boring backlog tickets overnight (dependency bumps, a flaky test, a deprecated API migration) and, like every real company, your builds need internal infrastructure.

**Once:** create an outpost (a named queue) in Devin Cloud, install the operator in your cluster, and apply an `OutpostPool`, the CRD that binds queue to pod template. Mount your deploy keys and registry creds as Secrets in the worker template, cap it with `maxConcurrentSessions: 10`.

**Per ticket, zero new steps:** a dev (or a schedule, or the API) starts a session in Devin Cloud and picks the outpost as the machine; it shows up in the UI right next to Ubuntu and Windows. Then:

1. The session enters your outpost's queue.
2. The operator, watching the queue over the API, atomically claims it and creates a worker pod from your template.
3. The pod dials out to Devin's cloud and starts executing tool calls: `git clone` (deploy key from your Secret), `pip install` (hits your internal mirror, since it's inside your network), `pytest` (reaches staging Postgres over ClusterIP, same reason).
4. Tests fail, traceback streams up, model edits, tests rerun. The verify loop is *alive* because execution sits next to your services.
5. Devin pushes the branch and opens the PR. Session ends. **The operator deletes the pod.**

Fifteen tickets means up to ten concurrent pods, bin-packed by your scheduler, autoscaler adding a node for the overnight burst. In the morning: fifteen *tested* PRs and a cluster that's back to one 50-millicore operator pod. Devin's announcement lists the same pattern for GPU boxes (debug the training run where it crashed, with the real drivers and dataset) and Mac minis (Xcode builds, Devin building iOS apps end to end), but the internal-network case is the one I think most teams feel weekly.

## Why Kubernetes is the natural home for this

You can serve an outpost from any box with `devin worker start`: a VM, even your laptop. But look at what the docs recommend for security: only give the agent sudo on machines *"dedicated to Devin and recycled after each session."*

A long-lived VM is exactly not that. Sessions serially share an increasingly dirty machine; ticket 3's leftover `node_modules` pollutes ticket 9's build; one wedged process stalls the queue behind it.

A pod, though? A pod **is** "dedicated and recycled after each session" *by construction*. Fresh sandbox on claim, deleted on termination. Add `runtimeClassName: gvisor`, an egress NetworkPolicy ("agents may reach staging, never prod"), resource limits so a runaway build can't starve the cluster, and a dedicated node pool. All standard Kubernetes machinery, all applying to AI agents now because the agent is just a pod.

Cognition clearly knows this, because their fleet API is Kubernetes-shaped to a suspicious degree: queue entries are `metadata`/`spec`/`status` objects, you page with cursors then watch via SSE ("the standard Kubernetes-style list-then-watch pattern", as their own docs put it), delivery is at-least-once, and claims are an atomic compare-and-swap where losing the race is normal operation. Claims expire on a server deadline, so a dead worker's session self-heals back into the queue with no fleet-level health tracking. This is a reconciliation loop. Someone at Cognition writes controllers for a living.

The operator (`devin-outpost-k8s`, Rust, MIT) packages that loop with one CRD:

```yaml
apiVersion: outposts.cognition.com/v1alpha1
kind: OutpostPool
metadata:
  name: kiac
spec:
  poolId: "outpost_env-3a1abb1c2bb84512ad9aedb3ca0bf411"
  tokenSecretRef:
    name: kiac-pool-token
    key: token
  maxConcurrentSessions: 2
  resume:
    policy: StartFresh        # or FilesystemSnapshot / GkeSnapshot
  worker:
    template:                 # a real PodTemplateSpec, anything goes
      spec:
        containers:
          - name: devin-worker
            resources:
              requests: { cpu: "500m", memory: 1Gi }
              limits:   { cpu: "2",    memory: 2Gi }
```

Nice touches: the worker pod is assembled in three layers (your template, then the operator's managed fields, then your explicit overrides get the final say), so one operator serves heterogeneous pools: a GPU pool next to a general pool on spot nodes. Resume policies handle Devin's suspend/resume on ephemeral infra: `StartFresh` anywhere, `FilesystemSnapshot` keeps a per-session PVC, `GkeSnapshot` checkpoints the whole pod on GKE. Plus leader election, Prometheus metrics, a Helm chart, multi-arch images.

## I ran it on Kubernetes inside Apple Containers

To prove the "any certified cluster" claim, I deployed it on my most exotic cluster: **kiac**, Kubernetes running in Apple Containers on a Mac, two arm64 Debian nodes on containerd.

The account side takes a minute: Settings → Environment → Outposts. I ended up with two: `myhome` (macOS, for a worker running directly on the Mac) and `kiac` (Linux, served by the operator on the cluster). Platform matters here, more on that below.

![Devin Cloud outposts settings showing the myhome macOS outpost and the kiac Linux outpost](/img/blog/devin-outposts-on-kubernetes/outposts-settings.png)

```bash
helm install outposts charts/devin-outposts-k8s -n devin-outposts --create-namespace
kubectl -n devin-outposts create secret generic kiac-pool-token --from-literal=token=$TOKEN
kubectl -n devin-outposts apply -f outpostpool.yaml
```

Thirty seconds later:

```
$ kubectl -n devin-outposts get opool
NAME   POOL                                           PHASE   CLAIMED   AGE
kiac   outpost_env-3a1abb1c2bb84512ad9aedb3ca0bf411   Ready   0         29s
```

`Ready` means the operator is authenticated against the real API and watching the queue. On the other side, your cluster now literally appears as a machine option when starting a session, in the same menu as Ubuntu and Windows:

![Devin's virtual environment picker showing the kiac outpost selected alongside the hosted Ubuntu and Windows machines](/img/blog/devin-outposts-on-kubernetes/virtual-env-picker.png)

Start a session with the outpost selected, and a worker pod appears in `kubectl get pods -w`.

### A bug, a workaround, and a quiet fix

Not everything was smooth: at launch, my arm64 nodes crash-looped with `Error: no published devin-remote binary for linux-aarch64`, even though the arm64 binaries were published; the CLI just lacked the platform mapping. I built a small workaround, kept it in [saiyam1814/devin-outposts-arm64](https://github.com/saiyam1814/devin-outposts-arm64), and reported it upstream in [devin-outpost-k8s#2](https://github.com/CognitionAI/devin-outpost-k8s/issues/2). Today I see it fixed in the stock CLI, which is nice to see. Everything below runs the stock image with zero overrides.

### The money shot

I had deployed a ClusterIP-only service (`inventory.demo.svc`, no ingress, no LoadBalancer, invisible to the internet) and prompted:

> Curl http://inventory.demo.svc/api/items and write SERVICE.md documenting what this service returns.

The worker pod went `Pending → ContainerCreating → Running` in under a second (pre-pulled image). Devin itself was skeptical ("that URL is a cluster-internal Kubernetes service name, so it may not resolve from my VM; I'll report what I get") and then it resolved anyway, because the agent's "VM" is a pod inside the cluster. Even better: the stock worker image ships without `curl`, so Devin improvised and probed the service over bash's raw `/dev/tcp` instead. Thirty-five seconds of work later, SERVICE.md existed:

![The finished Devin session documenting the internal inventory service, with SERVICE.md open beside the conversation](/img/blog/devin-outposts-on-kubernetes/session-result.png)

And it's *good*: the ClusterIP and cluster DNS name, the nginx version read from response headers, a field table for the JSON schema, endpoint probes I never asked for (`/healthz` → 200; it even tried `/api/items/K8S-001` to prove there's no per-item route), and the deadpan observation that the 151-byte response "looks like a fixed demo dataset rather than live inventory." Busted, fair enough. An agent whose brain never entered my network produced accurate documentation of a service that does not exist on the internet. That's the product.

More field notes from actually doing this:

- **Outpost platform must match the worker OS.** I first created my outpost as macOS (it was for my Mac); Linux pods can't serve it. Create a separate Linux outpost for your cluster: `devin worker outpost create kiac --platform linux`.
- **Size worker requests for your nodes.** My first pod sat Pending: 1Gi requests didn't fit a 2Gi node, and the roomier control-plane node was tainted. Both fixes go in the same `worker.template`: smaller requests plus a toleration. The three-layer template earns its keep fast.
- **The token is shown exactly once** at outpost creation, and it carries account-level scopes. Straight into a Secret manager, never into git.
- **Pre-pull the worker image** (`public.ecr.aws/e0h8a4b6/devin-cli:stable`) on your nodes unless you enjoy watching ImagePullBackOff instead of an AI agent.
- The queue lists outposts at `GET /opbeta/outposts`, one path segment less than the docs currently claim.

## Should you use it?

Credit to Cognition for being unusually honest here: their own announcement recommends managed hosting for most customers and says Outposts' operational complexity is "comparable to a VPC deployment." Outposts is for teams that *must* run execution on their own machines or network, and that already know how to operate ephemeral workloads securely at scale.

Which is exactly the job description of a platform team with a Kubernetes cluster. Provisioning, isolation, capacity, monitoring, recycling: the operator maps every one of those onto primitives your cluster already has. Also note: Outposts currently works with multi-tenant Devin hosting only, not Dedicated Tenant deployments.

## Agents are becoming a workload type

Step back and look at the launch: the partner list is the sandbox-infrastructure crowd (Modal, E2B, Daytona, Cloudflare, NVIDIA Brev, Namespace), but the only orchestrator Cognition open-sourced themselves targets Kubernetes. When an AI lab needed to express "run untrusted, bursty, ephemeral compute on customer infrastructure," they reached for a CRD, a controller, and a PodTemplateSpec.

First it was microservices, then CI, then ML training. Now agent execution is becoming a Kubernetes workload type: queued, scheduled, sandboxed, metered, garbage-collected. Your cluster already knew how to do all of that. As of this launch, one of the most capable coding agents in the world can take advantage of it.

Next question, and the one I'd think about before rolling this out for real: what happens when five teams each want their own agent pool on shared clusters? Namespaces, quotas, dedicated node pools, virtual clusters. That isolation story is a post of its own. Watch this space.

---

*Sources: [announcement](https://devin.ai/blog/introducing-devin-outposts) · [Outposts docs](https://docs.devin.ai/cloud/outposts/overview) · [quickstart](https://docs.devin.ai/cloud/outposts/quickstart) · [orchestration](https://docs.devin.ai/cloud/outposts/orchestration) · [reference](https://docs.devin.ai/cloud/outposts/reference) · [devin-outpost-k8s](https://github.com/CognitionAI/devin-outpost-k8s)*
