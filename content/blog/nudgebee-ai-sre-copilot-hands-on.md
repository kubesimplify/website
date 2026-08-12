---
title: "I Ran an AI SRE Copilot on My Own Hardware. Here Is What It Actually Does."
seoTitle: "NudgeBee v1.4.0 Hands-On: Self-Hosted AI SRE Copilot with Kubernetes and a DGX Spark"
seoDescription: "Running NudgeBee v1.4.0 end to end: Docker Compose control plane, a kiac Kubernetes cluster, Ollama on a DGX Spark, and a real AI root-cause investigation."
datePublished: 2026-08-10T18:30:00.000Z
slug: nudgebee-ai-sre-copilot-hands-on
author: saiyam-pathak
cover: /img/blog/nudgebee-ai-sre-copilot-hands-on/02-home-dashboard.jpg
tags: ["kubernetes", "ai", "sre", "aiops", "platform-engineering"]
---

**TL;DR** - NudgeBee is not "a chatbot for Kubernetes." It is a full SRE control loop in code: collect signals, rank events, investigate with real tools, recommend fixes, run durable workflows, and keep an audit trail. In this post I run the whole thing locally - the control plane in Docker Compose on my Mac, a 3-node Kubernetes cluster in lightweight VMs via kiac, and the LLM served from a DGX Spark on my desk. Real screenshots, real commands, real sharp edges.

> Source note: everything below was run against **NudgeBee v1.4.0** (released August 3, 2026) on August 10, 2026. I installed it, connected a cluster, and broke things so you don't have to. For a fast-moving open-source project, always cross-check the upstream README.

---

## The Problem: On-Call Engineers Are Human Glue

Most teams do not fail on-call because they have zero dashboards.

They fail because the dashboards, alerts, logs, cloud inventory, cost data, tickets, and runbooks all live in different places. The on-call engineer becomes the integration layer: copy a pod name from Slack, search logs in another tab, check metrics in a third tool, open a ticket, paste a summary, then run a command from a runbook that may or may not still be true.

That is the real problem an SRE copilot should solve. Not "ask an LLM what Kubernetes is."

The mental model that makes this class of tool click:

> **An SRE copilot is a control loop for production systems.**

![The SRE copilot control loop](/img/blog/nudgebee-ai-sre-copilot-hands-on/diagram-control-loop.svg)

SRE teams already run this loop by hand every day:

1. **Observe** - alerts, metrics, logs, Kubernetes events, cloud inventory.
2. **Normalize** - turn tool-specific mess into consistent resources and events.
3. **Rank** - decide what is noise and what pages a human.
4. **Investigate** - gather evidence from the cluster, metrics, logs, tickets.
5. **Recommend** - a fix, a rollback, a rightsizing change, a runbook.
6. **Act** - run the remediation, or guide a human through it.
7. **Record** - keep the investigation and outcome for the next incident.

NudgeBee's value is that it treats these stages as **one product surface**. The dashboard is not the product. The LLM is not the product. The loop is the product.

---

## What NudgeBee Is (as of v1.4.0)

NudgeBee describes itself as a unified CloudOps platform: **AI-SRE** (troubleshooting), **AI-FinOps** (cost and rightsizing), **AI-K8sOps** (cluster operations), and an **Agentic Automation Builder** - without fragmented tools or model lock-in.

Under the hood it is a monorepo of TypeScript, Go, and Python services:

![NudgeBee v1.4.0 architecture - app, backend services, data layer, collectors, and the in-cluster agent](/img/blog/nudgebee-ai-sre-copilot-hands-on/diagram-architecture.svg)

Each service owns a stage of the loop:

| Loop stage | NudgeBee piece |
| --- | --- |
| Observe | `k8s-collector`, `cloud-collector`, in-cluster agent, webhooks |
| Normalize | `services-server`, migrations, resource model |
| Rank | triage scoring, event aggregation (LLM-assisted since v1.4) |
| Investigate | `llm-server` agents + tools, RAG, knowledge graph |
| Act | `workflow-server` (Temporal), relay to the cluster |
| Notify | `notifications-server` - Slack, Teams, Discord, email |
| Record | Postgres: conversations, tool calls, executions, tickets |

The right way to read the repo is not file by file. It is: "which stage of the loop does this service own?"

---

## Quick Start: Two Ways to Run It

Since v1.3.0, every first-party image is published to `ghcr.io/nudgebee/*` and the umbrella Helm chart is on GHCR as an OCI artifact - so you no longer need to build anything from source.

### Path 1: Kubernetes (the one-liner-ish path)

```bash
export NUDGEBEE_ENC_KEY=$(openssl rand -hex 32)   # store this safely

helm install nudgebee oci://ghcr.io/nudgebee/charts/nudgebee \
  --namespace nudgebee --create-namespace \
  --set nudgebee_secret.NUDGEBEE_ENCRYPTION_KEY="$NUDGEBEE_ENC_KEY" \
  --wait --timeout 20m

kubectl -n nudgebee port-forward svc/app 3000:80
```

The post-install hook applies migrations automatically. Grab the bootstrap password from the `nudgebee` secret and sign in at `localhost:3000`.

### Path 2: Docker Compose on a laptop (what I did)

```bash
git clone https://github.com/nudgebee/nudgebee.git && cd nudgebee
docker compose --profile full up -d
```

The default profile starts the infrastructure (Postgres, Redis, RabbitMQ, Qdrant, Temporal, one-shot migrations). The `full` profile adds all the app services as containers - about 18 in total, all pulled from GHCR.

Here is my stack once everything settled:

```text
SERVICE                IMAGE                                           STATUS
api-server-services    ghcr.io/nudgebee/services-server:1.4.0          Up
app                    ghcr.io/nudgebee/app:1.4.0                      Up
cloud-collector        ghcr.io/nudgebee/cloud-collector-server:1.4.0   Up
k8s-collector-app      ghcr.io/nudgebee/k8s-collector:1.4.0            Up
llm-server             ghcr.io/nudgebee/llm-server:1.4.0               Up
ml-k8s-server          ghcr.io/nudgebee/ml-k8s-server:1.4.0            Up
notifications-server   ghcr.io/nudgebee/notifications:1.4.0            Up
postgres               ghcr.io/nudgebee/postgres:16                    Up (healthy)
qdrant                 ghcr.io/nudgebee/qdrant:v1.18.3                 Up
rabbitmq               ghcr.io/nudgebee/rabbitmq:3-management          Up
rag-server             ghcr.io/nudgebee/rag-server:1.4.0               Up
redis                  ghcr.io/nudgebee/redis:7-alpine                 Up
relay-server           ghcr.io/nudgebee/relay-server:1.4.0             Up
temporal               temporalio/auto-setup:1.29.1                    Up
temporal-ui            temporalio/ui:2.44.0                            Up
ticket-server          ghcr.io/nudgebee/ticket-server:1.4.0            Up
workflow-server        ghcr.io/nudgebee/workflow-server:1.4.0          Up
```

**Real-world notes from my install** (the kind of thing READMEs never tell you):

- Several `full`-profile services ship without environment config in the compose file. I added a `docker-compose.override.yaml` that gives each one its database URL, RabbitMQ host, and the shared `NUDGEBEE_ENCRYPTION_KEY`. The key must be identical everywhere - it encrypts integration credentials at rest.
- On macOS, the k8s-collector wants host port **5000**, which AirPlay already squats on. Remap it in the override.
- The k8s-collector expects the backend at the hostname `services-server`; the compose service is named `api-server-services`. A one-line network alias fixes event ingestion.
- If you disable ClickHouse (`clickhouse.enabled=false`), the agent chart still references the ClickHouse secret. Create a stub secret or leave it enabled.

Sign in with **Admin Login**, any email, and the local dev password `Test!24#5` (the dummy-credentials provider - local development only).

![NudgeBee login screen](/img/blog/nudgebee-ai-sre-copilot-hands-on/01-login.jpg)

One pleasant surprise: v1.4.0 no longer drops you into an empty product. First login lands on a **demo dataset** - active incidents, error-rate events, rightsizing recommendations - so you can explore every surface before connecting anything real.

![Home dashboard with demo data - incidents, optimize recommendations, quick links](/img/blog/nudgebee-ai-sre-copilot-hands-on/02-home-dashboard.jpg)

---

## The Lab: Cluster on the Mac, Brain on the DGX Spark

For the demo I wanted everything self-hosted, including the model. My setup:

![The lab - NudgeBee control plane and kiac cluster on the MacBook, Ollama on the DGX Spark](/img/blog/nudgebee-ai-sre-copilot-hands-on/diagram-lab-setup.svg)

- **Control plane**: the Compose stack above.
- **Tenant cluster**: a 3-node k3s cluster created with [kiac](https://github.com/saiyam1814/kiac) (Kubernetes in Apple Containers - every node is its own lightweight VM with a routable IP, so the in-cluster agent can reach the control plane over the vmnet gateway like a real remote cluster would).
- **Inference**: Ollama on a DGX Spark across the room. NudgeBee's llm-server calls it over plain HTTP. The model does not need to be anywhere near the cluster - the LLM is just an API.

The point of this setup is the architecture lesson: **the brain, the hands, and the workloads are three separate places**, glued together by exactly two protocols - a websocket relay for the cluster and an OpenAI-compatible endpoint for the model.

### Demo workloads

I deployed a `payments` namespace with three deployments: a healthy nginx `payments-gateway`, a `payments-api` that crashes on boot with a missing `DATABASE_URL`, and a deliberately over-provisioned `report-worker` (1 CPU / 1Gi requested per replica to do nothing) - one problem for each of NudgeBee's three surfaces: troubleshooting, RCA, and FinOps.

### Connecting the cluster

Admin → Integrations shows the catalog: Kubernetes and clouds, plus categories for messaging, ticketing, observability backends, repos, CI/CD, databases, and LLM providers.

![Integrations catalog - Kubernetes, AWS, Azure, GCP, Cloud Foundry](/img/blog/nudgebee-ai-sre-copilot-hands-on/03-integrations-catalog.jpg)

Adding a Kubernetes account generates an agent key and a copy-paste install command (shell script or Helm). You can toggle components off - Prometheus stack, OpenCost, eBPF node agent, OpenTelemetry collector - and the command updates live.

![Add Kubernetes Account - component toggles and generated install command](/img/blog/nudgebee-ai-sre-copilot-hands-on/04-connect-cluster-modal.jpg)

The agent chart installs kube-prometheus-stack and OpenCost alongside the NudgeBee agent, then dials **out** to the control plane over a websocket:

```json
{"msg":"greeting","payload":"{\"action\":\"auth\",\"version\":\"0.1.11\",...}"}
{"msg":"updated relay connection status to true","agent_type":"k8s"}
```

That outbound-only relay design matters: real clusters sit behind NAT and firewalls, so the control plane can never assume it can dial in. Commands flow down the same websocket the agent opened.

Two minutes later the cluster shows up with a candid message:

![Connected account - "Give me about an hour to generate insights"](/img/blog/nudgebee-ai-sre-copilot-hands-on/05-connected-home.jpg)

I like this honesty. Trend-based insights need trends. But live state is immediate:

![Cluster overview - 3 nodes, 21 pods, real CPU and memory](/img/blog/nudgebee-ai-sre-copilot-hands-on/06-cluster-overview.jpg)

Three nodes, twenty-one pods, live CPU and memory pulled from the Prometheus the agent just installed. No demo data - this is the kiac cluster.

---

## The Loop, Live: Signal → Triage → AI Investigation

Within minutes, real events started flowing. The home page surfaced a firing issue with an **Investigate** button next to it:

![Live issue on home - 1 pod has ImagePullBackoff, with Investigate button](/img/blog/nudgebee-ai-sre-copilot-hands-on/07-live-issue-investigate.jpg)

The Troubleshoot section turns raw events into a **triage inbox**: every issue gets a triage score, severity, alert status, and an owner path - sliced by error type (OOM Killed, Image Pull Backoff, High Restarts, CPU Throttling, Replica Mismatch):

![Triage inbox - pod errors with triage score, severity, and Investigate action](/img/blog/nudgebee-ai-sre-copilot-hands-on/08-triage-pod-errors.jpg)

This is the **Rank** stage of the loop, and it is where alert fatigue goes to die. v1.4.0 added LLM-assisted triage scoring on top of the rule-based signals.

Clicking **Investigate** opens the AI side. This is where NudgeBee stops being a dashboard:

![AI investigation in progress - parallel tool calls with live status](/img/blog/nudgebee-ai-sre-copilot-hands-on/11-ai-investigation-parallel-tools.jpg)

Read that screenshot carefully, because it shows the architecture:

- The agent states its plan in plain language.
- It then fires **multiple tool calls in parallel**: an events query for the pod, a `kubectl describe` for image and status, a resource-graph search - each with its own live status and a "Tool Details" expander showing the raw evidence.
- Evidence accumulates as **sources** attached to the conversation, not vibes.

Ten minutes later (on a 26B model running on my own hardware - more on that below), the finished analysis landed:

![Completed AI investigation - summary, 5-Whys causality chain, evidence, resolution](/img/blog/nudgebee-ai-sre-copilot-hands-on/12-ai-investigation-result.jpg)

This is worth pausing on, because the *structure* of the answer is the product:

- **Investigation Summary** - symptom plus the exact signal: Kubernetes events reporting `NotFound` for the specific image reference.
- **Causality Chain (5-Whys)** - pod is in ImagePullBackOff → runtime cannot pull the image → the registry returned `404 Not Found` for that tag → root cause: the manifest references a non-existent image tag.
- **Evidence** - a clickable source (`Events - E2`) carrying the raw `rpc error: code = NotFound`, with 4 sources attached to the conversation.
- **Resolution** - an immediate fix (point the manifest at a valid tag, verify against the registry) *and* a long-term recommendation (validate image tags in CI/CD before rollout).

And the diagnosis was correct - I verified the tag really does not exist in the registry. Not "it may be due to an image pull error, OOM kill, config issue, or failing dependency." A specific root cause, with the evidence to check its work.

One small detail that shows the loop thinking: under the answer, NudgeBee suggests **Related Questions** - verify the fix was applied and the pod is Running, inspect the corrected manifest, analyze the CI/CD logs so the bad tag never ships again:

![Related Questions - verify the fix, inspect the manifest, prevent the regression](/img/blog/nudgebee-ai-sre-copilot-hands-on/13-related-questions.jpg)

That last suggestion is the Record stage turning into prevention: today's investigation trying to make sure tomorrow's page never fires.

### ReWOO is gone - meet the Orchestrating planner

If you read about NudgeBee before mid-2026, you may remember its two planning styles: ReWOO (plan first, execute after) and ReAct (think, act, observe, repeat). **v1.4.0 retired the ReWOO planner.** Both agent types - *Orchestrating* (the top-level coordinator) and *ReAct* (domain investigators) - now run a hybrid planner the code calls **ReAct3**: a ReAct loop extended with an `<actions>` block that lets the model declare several independent tool calls in one step.

That is the parallel execution visible in the screenshot, and it is the sensible endpoint of the planner debate: keep ReAct's evidence-driven loop, recover ReWOO's efficiency by batching independent lookups.

The tool layer is wide: `kubectl` and Helm, Prometheus/PromQL, Loki, Elasticsearch, Datadog, New Relic, OpenObserve (new in v1.4.0), cloud APIs, ticket systems, GitHub, spend analysis, and workflow lifecycle actions. The agent decides *what* to look at; tools are *how* it touches reality:

> The model should not hallucinate your cluster. It should ask tools for evidence.

That single sentence is the difference between a chatbot and an SRE copilot.

### Guardrails you can see in the logs

Watching llm-server logs during the investigation was its own education:

```text
plannerexecutor: submitting tool for parallel execution   (x4)
plannerexecutor: pre-flight detected tool with LLM-only
  classification, assuming potential write
plannerexecutor: tool output truncated at source
```

Pre-flight classification of potentially write-capable tools, output truncation before context stuffing, per-account tool scoping, and an egress filter (default "detect" mode) that watches for secrets leaving via LLM calls. None of this is glamorous. All of it is what makes "AI with kubectl access" survivable.

---

## FinOps Is in the Same Loop

The Optimize surface treats cost as an operational signal, not a finance spreadsheet: workload/replica/PV rightsizing, abandoned-resource detection, spot recommendations, best practices, and an **Auto Optimize** response that can act on them:

![Optimize - rightsizing categories, abandoned resources, auto-optimize](/img/blog/nudgebee-ai-sre-copilot-hands-on/10-optimize-rightsizing.jpg)

Mine shows zeros because recommendations are trend-based (OpenCost plus NudgeBee's ML rightsizing service watch for a day or more before opining). The structure is the takeaway: an over-provisioned pod, an idle disk, and a crashlooping deployment are the *same kind of problem* - operational hygiene - and they belong on the same screen with the same Investigate button.

---

## Why Temporal Ships Inside an SRE Copilot

The moment a copilot crosses from *answering* to *acting*, durability stops being optional. A remediation workflow that dies silently when a process restarts after step 3 of 7 is worse than no automation at all.

NudgeBee runs every runbook and scheduled job through **Temporal**. I opened the bundled Temporal UI (`:8233`) and found the platform eating its own dog food - 102 workflow executions from just a few hours of uptime:

![Temporal UI - 102 workflows: agent status checks, notification batching, insight refresh](/img/blog/nudgebee-ai-sre-copilot-hands-on/09-temporal-workflows.jpg)

Agent health checks, notification batching, recommendation-resolution updates, insight refreshes, system cleanup - all as versioned, retryable, resumable workflows with full history. The Automations surface builds on the same engine: manual, scheduled, webhook, and event-triggered workflows, with approval steps, retries, child workflows, and persistent state.

> The LLM helps decide what to do. Temporal makes doing it operationally boring.

That division of labor is exactly right, and it is why "AI will replace runbooks" has it backwards - AI makes durable runbooks *more* important.

---

## Bring Your Own Model (Including the One on Your Desk)

NudgeBee's pitch includes "no model lock-in," and v1.4.0 implements providers for OpenAI, Anthropic, Bedrock, SageMaker, Azure, Google AI, Vertex AI, and HuggingFace/vLLM-style endpoints.

Two field findings worth your time:

**1. The `ollama` provider is documented but not implemented (yet).** The sample env lists `ollama` as an option, but the v1.4.0 provider switch has no case for it - you get `llm model not found - ollama`. The workaround is clean, since Ollama speaks the OpenAI protocol:

```bash
LLM_PROVIDER=openai
LLM_MODEL_NAME=qwen3.5:35b-a3b
LLM_PROVIDER_API_ENDPOINT=http://<your-ollama-host>:11434/v1
LLM_PROVIDER_API_KEY=anything-non-empty
```

**2. Local models need bigger timeouts.** The defaults assume cloud-API latency: 30 seconds to first token, a 10-minute global retry budget. An agent prompt here is 15k+ tokens, and a big local model can blow through both. Raise them:

```bash
LLM_PROVIDER_TTFT_TIMEOUT_SECONDS=300
LLM_SERVER_GLOBAL_RETRY_BUDGET_MINUTES=30
LLM_SERVER_MAX_INDIVIDUAL_CALL_TIMEOUT_MINUTES=15
```

On hardware: my Mac could not prefill the agent's ~16k-token prompts inside the deadlines. The DGX Spark prefilled the same prompt in **0.9 seconds warm (~17,900 tokens/sec)**. Two more lessons from the run: reasoning-mode models (qwen3.5's thinking) generate thousands of deliberation tokens per ReAct step, so decode speed - not prefill - becomes the loop's bottleneck; and a fast non-thinking model often beats a smarter slow one for agentic work. The completed investigation above ran on `gemma4:26b` - the full multi-tool loop plus write-up in about ten minutes, entirely on hardware I own.

The architecture take-away is bigger than my desk, though: because the model is just an HTTP endpoint, "cluster on one machine, GPU on another, control plane on a third" works with zero special configuration. Your prompts and evidence stay on your network.

---

## Where Would You Actually Use This? Six Scenarios

**1. On-call triage.** Connect the cluster, wire Slack/Teams, and let the triage inbox rank what fires. The score plus event aggregation turns 40 raw alerts into 3 issues with owners. Start here - it is read-only and pays off day one.

**2. Crashloop and error RCA.** The `payments-api` pattern: pod crashes, event fires, Investigate pulls describe + events + logs + recent changes in parallel and writes up a root cause with evidence attached. The investigation is recorded, so the *next* engineer searching that error finds a documented case, not a blank page.

**3. FinOps and rightsizing.** After a few days of trends: workload/replica/PV rightsizing with monthly savings estimates, abandoned-volume detection, spot candidates - each with an Optimize action, gated behind approvals if you want them.

**4. Runbook automation.** Codify the fix once as a Temporal-backed workflow: event-triggered ("on ImagePullBackOff in namespace X, check the registry and page the owning team"), scheduled (nightly hygiene), or webhook-driven (from your existing alertmanager). Approval steps make the write path safe to roll out gradually.

**5. Ticket and incident hygiene.** The ticket-server syncs Jira, ServiceNow, PagerDuty, and Zenduty, so investigations attach to tickets and resolutions flow back - the Record stage, automated.

**6. Multi-cluster and hybrid estates.** The relay design (agents dial out) means clusters behind NAT, in customer VPCs, or on edge hardware all connect the same way. One control plane, N clusters, per-account scoping.

The common thread: **start read-only, earn trust, then open the write path** - observation → investigation → recommendation → automation, in that order.

---

## Things I Would Be Careful About in Production

The standard sharp edges of the category, plus what I hit:

- **Start read-only.** Let it observe, investigate, and recommend before it remediates. The approval-gated workflows exist for a reason - use them.
- **Treat the LLM provider as a data boundary.** Prompts carry pod names, log lines, maybe secrets that slipped into logs. Self-hosting the model (above) is the strongest version of this control; the built-in egress filter is defense in depth, not a substitute for thinking.
- **The dummy credentials and sample secrets are for laptops.** `Test!24#5` and friends must never see a routable network. Disable dummy auth, rotate `NUDGEBEE_ENCRYPTION_KEY` handling into a real secret store, set the relay and internal service tokens, and read `docs/auth-and-networkpolicy.md` before exposing anything.
- **The encryption key is a one-way door.** Rotate it and previously encrypted rows are unreadable. There is no automatic re-encryption.
- **No telemetry by default** - data leaves only through integrations you configure (LLM calls, notifications, ticket sync, webhooks). Those paths are exactly where your security review should look.
- **Licensing**: Business Source License 1.1 - free to self-host internally; hosted/managed-service use is restricted; each version converts to Apache 2.0 after its change date. Read `LICENSE` and `LICENSING.md` if you are evaluating for a company.

---

## What This Teaches About Building AI Operations Software

Five lessons I keep coming back to after a day inside it:

1. **Context beats chat.** The interesting part is not the assistant - it is the graph around it: resources, events, tickets, tool calls, prior investigations. AI without context is a guesser; AI with context is an operator interface.
2. **Tools need ownership boundaries.** Tenant scoping, credential isolation, pre-flight write detection, output truncation - the unglamorous parts are the product.
3. **Runbooks are the safety rail, not the legacy.** The agent discovers and parameterizes workflows; Temporal gives them retries, approvals, versioning, and history.
4. **Cost is an ops signal.** Reliability and FinOps on one surface matches how platform teams actually work.
5. **A monorepo can be a teaching tool.** TypeScript for the app, Go for the backends, Python for ML and collectors, Postgres/RabbitMQ/Redis/Qdrant/Temporal each doing the one job they are best at. Studying why each piece exists is a free course in platform engineering.

If you want to explore the code, follow the loop: start at `docs/ARCHITECTURE.md` and `docs/GLOSSARY.md`, then `llm/llm-server/agents/` and `tools/` for the AI layer (grep `RegisterNBAgentFactory` and `RegisterNBTool`), then `runbook-server/tests/integration/testdata/` for a catalog of what the workflow engine can do, and finally `collector-server/` for how reality enters the system.

---

## Final Mental Model

```text
signals -> resources -> events -> triage -> investigations -> recommendations -> runbooks -> records
```

That is the SRE copilot loop, and NudgeBee is the most complete open implementation of it I have run. It earns the "copilot" name not because there is a chat box, but because every stage - collection, ranking, tool-driven investigation, durable remediation, and the paper trail - lives in one system that a small team can actually self-host.

The future of SRE still needs humans. It just stops making humans do all the glue work by hand.

---

## Useful Links

- Repo: [github.com/nudgebee/nudgebee](https://github.com/nudgebee/nudgebee)
- Release v1.4.0: [github.com/nudgebee/nudgebee/releases](https://github.com/nudgebee/nudgebee/releases)
- Helm chart: `oci://ghcr.io/nudgebee/charts/nudgebee`
- Architecture: [docs/ARCHITECTURE.md](https://github.com/nudgebee/nudgebee/blob/main/docs/ARCHITECTURE.md)
- Glossary: [docs/GLOSSARY.md](https://github.com/nudgebee/nudgebee/blob/main/docs/GLOSSARY.md)
- Auth & NetworkPolicy: [docs/auth-and-networkpolicy.md](https://github.com/nudgebee/nudgebee/blob/main/docs/auth-and-networkpolicy.md)
- Agent chart: [github.com/nudgebee/k8s-agent](https://github.com/nudgebee/k8s-agent)
- kiac (the local cluster tool): [github.com/saiyam1814/kiac](https://github.com/saiyam1814/kiac)
