---
title: "kagent Part 1: Building a Local, Kubernetes-Native AI Agent with Human-in-the-Loop Approval"
seoTitle: "kagent Tutorial: Build a Local AI Agent for Kubernetes with Ollama"
seoDescription: "A hands-on lab building a kagent AI agent on a local kind cluster with Ollama — read-only and write-capable agents, human-in-the-loop approval gates and a practical guide for common issues."
datePublished: 2026-08-18T10:00:00.000Z
slug: kagent-part-1-local-ai-agent-kubernetes
author: prianshu-mukherjee
draft: false
cover: /img/blog/kagent-security-lab/cover1.png
tags: ["kagent", "kubernetes", "ai-agents", "mcp", "ollama", "human-in-the-loop", "tutorial"]
---

*Reading time: ~18 minutes. Hands-on time: ~45–60 minutes if you follow along.*

A chatbot can explain Kubernetes to you. An **agent** can decide what to inspect next, pick a tool, read the result, and act on it. Which means the question is no longer "can a model talk about my cluster?" but "can it operate on my cluster in a way I can actually trust?"

[kagent](https://kagent.dev) is a Kubernetes-native framework for building exactly that. It gives you a runtime, a set of Kubernetes CRDs like `Agent` and `ModelConfig`, and MCP-backed tool integrations that let a model reason about a live cluster and call real tools against it. Not just describe what it would do but also actually do it.

The distinction that matters:

- An AI chatbot can explain situtation.
- A kagent agent can decide what to inspect next, which tool to call and what result is relevant before continuing.
- A write-capable agent can make a change unless the system explicitly stops it.

Once a model can call tools, the design question stops being "is the answer good?" and becomes "what is this thing actually allowed to do and who signs off before it does it?" That's what this lab is about.

**kagent vs. k8sgpt, briefly:** k8sgpt runs fixed analyzers against your cluster, collects structured findings, and has a model explain them. There's no loop where the model chooses what to do next. kagent runs an actual agent loop - the model decides which tool to call, reads the result and decides whether to call another tool or answer the user. That's materially different, which is why least-privilege tooling and approval gates matter so much here.

This is Part 1 of a short series. In this one, we build a fully local kagent stack running on a single laptop. Kind cluster. kagent. Ollama serving a small model in-cluster. A read-only agent. A write-capable agent gated behind human approval. No cloud API key. No external LLM dependency. Nothing that leaves your machine.

## What you'll build

By the end of this lab you'll have, all running locally:

- A kind cluster with kagent installed
- Ollama serving `qwen2.5:1.5b` as an in-cluster model service
- A read-only agent that can inspect cluster state but cannot change anything
- A write-capable agent whose destructive actions pause for your explicit approval

In other words:

- You interact through the kagent dashboard.
- The agent decides which tool to call.
- The tool server talks to the Kubernetes API.
- Model inference happens locally, through Ollama.
- Write operations pause for your approval before they execute.

![Architecture](/img/blog/kagent-security-lab/Architecture.png)


**Prerequisites:** Docker, `kind`, `kubectl`, and Helm. Enough memory to run a small local model alongside the kagent stack. A laptop with 16GB RAM is comfortable. Keep the model small — this walkthrough uses `qwen2.5:1.5b` .

---

## Step 1: Create the cluster

Start with a clean kind cluster:

```bash
kind create cluster --config 00-cluster/kind-config.yaml
kubectl cluster-info --context kind-kagent-security-lab
```

This creates the local Kubernetes environment that will host kagent and Ollama. A healthy cluster should show the control plane and core Kubernetes components up.

**Checkpoint:** Run `kubectl get nodes` and confirm one node in `Ready` status.

---

## Step 2: Install kagent

kagent uses a two-step Helm install: CRDs first, then the app itself.

```bash
helm install kagent-crds oci://ghcr.io/kagent-dev/kagent/helm/kagent-crds \
  --namespace kagent \
  --create-namespace \
  --version 0.9.12

helm install kagent oci://ghcr.io/kagent-dev/kagent/helm/kagent \
  --namespace kagent \
  --set providers.default=ollama \
  --version 0.9.12

kubectl wait --for=condition=ready pod --all -n kagent --timeout=180s
```

Version pinning matters because kagent changes frequently. This lab uses kagent 0.9.12

```bash
kubectl get pods -n kagent -o wide
```

On a fresh cluster, the kagent controller may log transient failures before Postgres is ready. That's normal. Give it a moment to converge, then validate the pod state. The system recovers on its own.

**Checkpoint:** Every pod in the `kagent` namespace is `Running`.

---

## Step 3: Deploy Ollama in the cluster

The lab defines the Ollama deployment in `01-local-llm/ollama-deployment.yaml`.

```bash
kubectl apply -f 01-local-llm/ollama-deployment.yaml
kubectl wait --for=condition=ready pod -l app=ollama -n ollama --timeout=120s
```

Validate the Service and endpoints:

```bash
kubectl get svc -n ollama
kubectl get endpoints -n ollama
```

Expected output:

```
NAME     TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
ollama   ClusterIP   10.96.147.225   <none>        80/TCP    153m
```

```
NAME     ENDPOINTS           AGE
ollama   10.244.0.30:11434   153m
```

The Service has a real endpoint. That's your confirmation the in-cluster model service is reachable from the rest of Kubernetes.

**Checkpoint:** The Service has an endpoint IP address.

---

## Step 4: Pull a local model

This lab uses `qwen2.5:1.5b`. It's a 1.5 billion parameter model optimized for CPU inference, roughly 5x faster than larger alternatives while maintaining reasonable reasoning capability.

```bash
kubectl exec -n ollama deploy/ollama -- ollama pull qwen2.5:1.5b
kubectl exec -n ollama deploy/ollama -- ollama list
```

Terminal output from pulling the model:

```
pulling manifest
pulling 183715c43589: 48% ▕████████          ▏ 471 MB/986 MB  2.5 MB/s   3m26s
pulling 183715c43589: 72% ▕█████████████     ▏ 713 MB/986 MB  1.1 MB/s   4m17s
pulling 183715c43589: 94% ▕████████████████  ▏ 928 MB/986 MB   16 KB/s  58m29s
pulling 183715c43589: 100% ▕█████████████████ ▏ 985 MB/986 MB  1.8 MB/s      0s
verifying sha256 digest
writing manifest
success
```

After the pull completes, check what models are available:

```
NAME               ID              SIZE      MODIFIED
qwen2.5:1.5b       65ec06548149    986 MB    About an hour ago
llama3.2:latest    a80c4f17acd5    2.0 GB    14 hours ago
llama3.2:3b        a80c4f17acd5    2.0 GB    15 hours ago
```

**Why qwen2.5:1.5b?** It's significantly smaller than llama3.2:3b (986 MB vs 2.0 GB) and generates tokens roughly 5-8x faster on CPU-only hardware. The speed difference is dramatic, you'll see 2-4 tokens per second instead of 0.25 tokens per second for llama 3.2:3b . The tradeoff is slightly lower reasoning capability, but for structured tool calling (which is what agents actually need), it's more than adequate. I switched models during the lab , the inferencing became very slow with llama 3.2 in a CPU only compute environment.

**Checkpoint:** `ollama list` shows the model downloaded and ready.

---

## Step 5: Connect kagent to the local model

The model config lives in `01-local-llm/modelconfig.yaml`:

```yaml
apiVersion: kagent.dev/v1alpha2
kind: ModelConfig
metadata:
  name: local-model-config
  namespace: kagent
spec:
  model: qwen2.5:1.5b
  provider: Ollama
  ollama:
    host: http://ollama.ollama.svc.cluster.local
```

Apply it:

```bash
kubectl apply -f 01-local-llm/modelconfig.yaml
kubectl get modelconfig -n kagent -o wide
```

Expected output:

```
NAME                   PROVIDER   MODEL
default-model-config   Ollama     llama3.2:3b
local-model-config     Ollama     qwen2.5:1.5b
```

This is the point where you start treating the model as a service inside the cluster.

Before moving to the agent layer, validate the model directly:

```bash
kubectl exec -n ollama deploy/ollama -- ollama run qwen2.5:1.5b "reply with the single word: ready"
```

Expected output:

```
ready
```

That proves the model is reachable and generating before any agent starts making tool calls.

**Checkpoint:** The model responds with "ready".

---

## Step 6: Build your first agent (read-only)

The first agent is intentionally narrow. It's defined in `02-first-agent/agent.yaml`:

```yaml
apiVersion: kagent.dev/v1alpha2
kind: Agent
metadata:
  name: local-k8s-agent
  namespace: kagent
spec:
  type: Declarative
  declarative:
    modelConfig: local-model-config
    tools:
      - type: McpServer
        mcpServer:
          apiGroup: kagent.dev
          kind: RemoteMCPServer
          name: kagent-tool-server
          toolNames:
            - k8s_get_resources
            - k8s_get_available_api_resources
            - k8s_describe_resource
            - k8s_get_pod_logs
```

Every tool this agent has access to is read-only. It can inspect cluster state, but it cannot mutate anything. This is one of the clearest, cheapest ways to establish a secure-by-default agent posture don't grant a tool the agent doesn't need for the job it's doing.

Deploy it:

```bash
kubectl apply -f 02-first-agent/agent.yaml
kubectl get agent -n kagent
```

Open the kagent dashboard at `http://localhost:8080`, select `local-k8s-agent`, and ask:

> What pods are running in the kagent namespace?

That's the simplest possible end-to-end validation the agent reasons with the local model and calls real Kubernetes tools against a live cluster.

![local-K8s-agent](/img/blog/kagent-security-lab/2.png)

The agent will call `k8s_get_resources` with appropriate filters, read the response, and answer based on what it finds. The answer should match what `kubectl get pods -n kagent` shows you directly.

**Checkpoint:** The agent's answer reflects the actual cluster state.

---

## Step 7: Add a write-capable agent behind approval gates

Now we reach the real security boundary: write operations.

`03-human-in-the-loop/hitl-agent.yaml` enables destructive tools, but marks them for approval:

```yaml
apiVersion: kagent.dev/v1alpha2
kind: Agent
metadata:
  name: local-hitl-agent
  namespace: kagent
spec:
  type: Declarative
  declarative:
    modelConfig: local-model-config
    tools:
      - type: McpServer
        mcpServer:
          apiGroup: kagent.dev
          kind: RemoteMCPServer
          name: kagent-tool-server
          toolNames:
            - k8s_get_resources
            - k8s_describe_resource
            - k8s_get_pod_logs
            - k8s_get_events
            - k8s_get_resource_yaml
            - k8s_apply_manifest
            - k8s_delete_resource
            - k8s_patch_resource
          requireApproval:
            - k8s_apply_manifest
            - k8s_delete_resource
            - k8s_patch_resource
```

The `requireApproval` list is the whole story here. It's the difference between "the model can propose a change" and "the model can make a change." Everything in that list pauses for human approval before it executes.

Deploy it:

```bash
kubectl apply -f 03-human-in-the-loop/hitl-agent.yaml
kubectl get agent -n kagent local-hitl-agent -o wide
```

Expected output:

```
NAME               TYPE          RUNTIME   READY   ACCEPTED
local-hitl-agent   Declarative   python    True    True
```

---

## Step 8: Walk through the human-in-the-loop workflow

Open the kagent dashboard and select `local-hitl-agent`. This is a four-part sequence. Do them in order because each one demonstrates a different piece of the approval boundary.

### 8.1 - Read without approval

Ask:

> List all pods in the kagent namespace.

This executes immediately. It's a read operation, so it's never gated. Only the tools in `requireApproval` pause.

### 8.2 - Approve a write

Ask:

> Create a ConfigMap called test-config in the default namespace with the key message set to hello.

The agent proposes the write and the action pauses in the UI waiting for you.

Approve it. Then verify it landed:

```bash
kubectl get configmap test-config -n default -o yaml
```

This is the critical point of the whole lab: the model proposed the action, but the human approval gate is the actual boundary between a suggestion and a real mutation.

### 8.3 - Reject a delete

Ask:

> Delete the ConfigMap test-config in the default namespace.

Again it stops at the approval gate. This time, reject it, with a reason such as:

> Do not delete this resource yet.

Verify the resource is untouched:

```bash
kubectl get configmap test-config -n default
```

The agent understood the request, proposed the call and then backed off cleanly when you said no. That's the behavior you actually want from a tool with delete access.

### 8.4 - Use an ambiguous prompt

Ask:

> Set up a namespace for my application.

This is intentionally vague. No namespace name. No other parameters. A well-behaved agent should ask a clarifying question rather than guess.

The agent will ask:

> What should the namespace be called?

This is why agentic systems aren't just "LLM with tools." Sometimes the correct action is to stop and ask, proceeding on guesses make things even worse.

---

## Understanding performance: token speeds and why qwen2.5:1.5b wins

You probably noticed each interaction took a while. That's no a bug. It's an honest, real tradeoff of local CPU inference.

During this lab's actual execution, Ollama's generation timings were:

```
slot print_timing: id  0 | task 96 | n_gen =    100, tg =   1.92 t/s, tg_3s =   1.94 t/s
slot print_timing: id  0 | task 96 | n_gen =    110, tg =   2.00 t/s, tg_3s =   3.33 t/s
slot print_timing: id  0 | task 96 | n_gen =    127, tg =   2.18 t/s, tg_3s =   5.01 t/s
slot print_timing: id  0 | task 96 | n_gen =    140, tg =   2.15 t/s, tg_3s =   1.97 t/s
```

That's roughly 2-4 tokens per second with qwen2.5:1.5b on CPU. Compare that to 0.25 tokens per second with llama3.2:3b on the same hardware. The speed difference is real and immediately noticeable.

And the agent loop multiplies that cost, because a single interaction involves several full passes through the model:

- Model reasoning about the question
- Tool call selection
- Read tool result
- Model reasoning about the result
- Decide next action
- Generate final answer

Each of those is a separate pass through the model. More tool steps means more passes, means slower overall.

Fully local AI is a real, workable option. It's just not a low-latency option on a CPU-only laptop. If you're building on this, keep prompts short, keep the tool list narrow, keep the model small, give it enough RAM and CPU, and reach for a GPU-backed node if you have it.

---

## What this lab actually proves

Strip away the specific commands and this lab demonstrated one thing a local AI agent can operate inside a real Kubernetes environment, with a real approval boundary, without depending on a hosted model or a cloud key.

The architecture is explicit :

- The model runs inside the cluster through Ollama.
- Agent logic is defined declaratively in kagent CRDs.
- Tools are exposed through a dedicated tool server, not called directly.
- Tool access is narrowed to the smallest set of operations each agent actually needs.
- Write operations require explicit human approval before execution.

Two guardrails did all the work here:

1. Least-privilege tool selection. The read-only agent literally cannot mutate anything.
2. Human approval for writes. The write-capable agent can propose but not execute alone.

Neither is exotic. They're the minimum viable safety controls for any agentic Kubernetes workflow that's allowed to touch cluster state.

---

## Current cluster status

By the time you finish, your lab looks like this:

```
NAME                                             READY   STATUS    RESTARTS       AGE
argo-rollouts-conversion-agent-6dfd9b7fc-vc6ks   1/1     Running   0              14h
cilium-debug-agent-79589d644c-6wbpc              1/1     Running   0              14h
cilium-manager-agent-58f64df9c8-ddtsd            1/1     Running   0              14h
cilium-policy-agent-cf9b987c6-bcgfj              1/1     Running   0              14h
helm-agent-6f457676cc-tzdpw                      1/1     Running   0              14h
istio-agent-65b58844c-xz4qg                      1/1     Running   0              14h
k8s-agent-66dd788947-zwx5p                       1/1     Running   0              14h
kagent-controller-99b4bb79d-cm5jn                1/1     Running   0              13h
kagent-grafana-mcp-678857cd56-s55kt              1/1     Running   0              17h
kagent-kmcp-controller-manager-76bb479b6-h2zq9   1/1     Running   13             17h
kagent-postgresql-85766c5f8c-vfjbr               1/1     Running   0              17h
kagent-querydoc-65cdb65878-h9bx7                 1/1     Running   0              17h
kagent-tools-7548fb9ffd-r54kh                    1/1     Running   0              13h
kagent-ui-75bd88cc5c-2wl2k                       1/1     Running   0              13h
kgateway-agent-797fb9599b-c244h                  1/1     Running   0              14h
local-hitl-agent-6497c985f4-phjdc                1/1     Running   0              5m
local-k8s-agent-65d9f49888-qgjjg                 1/1     Running   0              5m
observability-agent-849747fbdf-twwcp             1/1     Running   0              14h
promql-agent-698c455c75-hhf86                    1/1     Running   0              14h
```

Your core agents:

```
NAME                             TYPE          RUNTIME   READY   ACCEPTED
local-hitl-agent                 Declarative   python    True    True
local-k8s-agent                  Declarative   python    True    True
```

Your model config:

```
NAME                   PROVIDER   MODEL
default-model-config   Ollama     llama3.2:3b
local-model-config     Ollama     qwen2.5:1.5b
```

---

## Notes on model selection and behavior

One thing worth flagging as you experiment: smaller models like qwen2.5:1.5b are optimized for speed over reasoning depth. They're excellent at structured tool calling (which is what agents need), but they can occasionally hallucinate or invent details when asked open-ended questions.

For example, if you ask "list the pods" without specifying a namespace, the model might confidently propose pod names that don't actually exist. This isn't a bug in kagent or Ollama. It's a characteristic of smaller models trading reasoning for speed.

The fix is straightforward: ask more specific questions or let the agent query the actual cluster state first. The read-only agent's `k8s_get_resources` tool is your guarantee of truth here. It doesn't hallucinate. If the agent uses it, the answer is real.

If you need deeper reasoning at the cost of latency, switch back to llama3.2:3b. If you need maximum speed for simple operations, qwen2.5:1.5b is hard to beat. The architecture stays exactly the same either way.

---

## Troubleshooting: what you might hit along the way

None of these are unusual for a local, multi-component stack. They're worth knowing about before you hit them.

### Model-name mismatch in default config

If you see:

```
model 'llama3.2' not found (status code: 404)
```

It usually means `default-model-config` is pointing at a model name that doesn't match what's actually being served. Fix it directly:

```bash
kubectl patch modelconfig default-model-config -n kagent --type merge -p '{"spec":{"model":"qwen2.5:1.5b","ollama":{"host":"http://ollama.ollama.svc.cluster.local"}}}'
```

Re-check:

```bash
kubectl get modelconfig -n kagent -o wide
```

the model itself can be perfectly healthy while the agent is still broken, because the config is pointing at the wrong value. Local AI stacks are still software stacks. They fail like software.

### Startup race with the database

On a fresh cluster, the kagent controller can start logging failures before Postgres is actually ready. It looks like a broken install. It isn't. The system recovers on its own once the database comes up. Give it a minute, then check pod state rather than reacting to the first error line you see:

```bash
kubectl get pods -n kagent -o wide
```

### Scheduling pressure in kind

The Ollama pod can hit memory pressure if the node is already busy running the rest of the kagent stack. The fix is to right-size the request for a small model rather than assuming a large, GPU-style resource request. This whole lab is designed to run comfortably on a laptop-sized node.

### kind image cache mismatch

Even if an image already exists on your host Docker daemon, the kind node needs it loaded into its own container runtime separately. Check directly on the control-plane node:

```bash
docker exec kagent-security-lab-control-plane crictl images | grep -i ollama
```

If that comes back empty, pull and load it explicitly:

```bash
docker pull ollama/ollama:latest
kind load docker-image ollama/ollama:latest --name kagent-security-lab
```

Then reapply the Deployment and let the pod recreate.

These four remind you that AI infrastructure is still infrastructure. It needs the same checks as any other cluster workload: readiness, scheduling, image propagation, dependency ordering.

---

## Cleanup

When you're done, remove the local cluster entirely:

```bash
kind delete cluster --name kagent-security-lab
```

Or, if you just want to clean up the test ConfigMap from the HITL workflow:

```bash
kubectl delete configmap test-config -n default --ignore-not-found
```

---

## Final takeaway

The big lesson here isn't that local AI is instant, or that securing an agentic workflow is trivial. It's that local, secure, Kubernetes-native agent workloads are genuinely possible. But they're real systems, not a clever prompt with a couple of tools bolted on. They need a model runtime, a tool surface, a structured agent loop, an approval boundary and an honest understanding of where the performance and operational bottlenecks actually live.

That's the real question this lab was built around: not "can AI manage Kubernetes?" but "how do we make that capability useful, observable, and safe enough to run near real infrastructure?"

**Part 2** picks up exactly where this leaves off. Least-privilege tools and a human approval gate are a solid starting point. But they're not the whole security story for an agent that's allowed anywhere near a real cluster. Next part we will cover scoping agents with RBAC and ClusterRoles, routing and controlling agent traffic through agentgateway, and getting real metrics and observability into what these agents are actually doing.

Repository: [kagent-security-lab](https://github.com/Prianshu-git/Kagent-demo)
