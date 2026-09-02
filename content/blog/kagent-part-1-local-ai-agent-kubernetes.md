---
title: "kagent Part 1: Building a Local, Kubernetes-Native AI Agent with Human-in-the-Loop Approval"
seoTitle: "kagent Tutorial: Build a Local AI Agent for Kubernetes with Ollama"
seoDescription: "A hands-on lab building a kagent AI agent on a local kind cluster with Ollama: read-only and write-capable agents, human-in-the-loop approval gates, and a practical guide for common issues."
datePublished: 2026-08-18T10:00:00.000Z
slug: kagent-part-1-local-ai-agent-kubernetes
author: prianshu-mukherjee
draft: false
cover: /img/blog/kagent-part-1-local-ai-agent-kubernetes/hitl-approval-pending.png
tags: ["kagent", "kubernetes", "ai-agents", "human-in-the-loop"]
---
 
A chatbot can explain Kubernetes to you. An agent can decide what to inspect next, pick a tool, read the result, and act on it. Which means the question is no longer "can a model talk about my cluster?" but "can it operate on my cluster in a way I can actually trust?" A write-capable agent can make a change unless the system explicitly stops it. That's the boundary this lab is built around.
 
kagent is a Kubernetes-native framework for building exactly that. It gives you a runtime, a set of Kubernetes CRDs like `Agent` and `ModelConfig`, and MCP-backed tool integrations that let a model reason about a live cluster and call real tools against it: not just describe what it would do, but actually do it.
 
Once a model can call tools, the design question stops being "is the answer good?" and becomes "what is this thing actually allowed to do, and who signs off before it does it?" That's what this lab is about.
 
**kagent vs. k8sgpt, briefly:** k8sgpt runs fixed analyzers against your cluster, collects structured findings, and has a model explain them. There's no loop where the model chooses what to do next. kagent runs an actual agent loop: the model decides which tool to call, reads the result, and decides whether to call another tool or answer the user. That's materially different, which is why least-privilege tooling and approval gates matter so much here.
 
This is Part 1 of a short series. In this one, we build a fully local kagent stack running on a single laptop: kind cluster, kagent, Ollama serving a small model in-cluster, a read-only agent, and a write-capable agent gated behind human approval. No cloud API key, no external LLM dependency, nothing that leaves your machine. Budget about 45 to 60 minutes hands-on if you're following along.
 
## What you'll build
 
By the end of this lab you'll have, all running locally:
 
- A kind cluster with kagent installed
- Ollama serving `qwen2.5:1.5b` as an in-cluster model service
- A **read-only** agent that can inspect cluster state but cannot change anything
- A **write-capable** agent whose destructive actions pause for your explicit approval
In other words:
 
- You interact through the kagent dashboard.
- The agent decides which tool to call.
- The tool server talks to the Kubernetes API.
- Model inference happens locally, through Ollama.
- Write operations pause for your approval before they execute.
![Architecture diagram: a kind node with a user, the kagent controller/UI, Ollama, the Kubernetes MCP tool server, and an approval gate before any write-capable tool call](/img/blog/kagent-part-1-local-ai-agent-kubernetes/architecture-diagram.png)
 
**Prerequisites:** Docker, `kind`, `kubectl`, and Helm, plus enough memory to run a small local model alongside the kagent stack. A laptop with 16GB RAM is comfortable. Keep the model small: this walkthrough uses `qwen2.5:1.5b`.
 
Clone the lab repo before you start: every step below references files inside it.
 
```bash
git clone https://github.com/Prianshu-git/Kagent-demo
cd Kagent-demo
```
 
```yaml
# 00-cluster/kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: kagent-security-lab
nodes:
  - role: control-plane
```
 
---
 
## Step 1: Create the cluster
 
Start with a clean kind cluster:
 
```bash
kind create cluster --name kagent-security-lab --config 00-cluster/kind-config.yaml
kubectl cluster-info --context kind-kagent-security-lab
```
 
kind's config file doesn't reliably set the cluster name on every version. Passing `--name` explicitly guarantees the context comes up as `kind-kagent-security-lab`, which every command later in this lab assumes.
 
This creates the local Kubernetes environment that will host kagent and Ollama. A healthy cluster should show the control plane and core Kubernetes components up.
 
**Checkpoint:** run `kubectl get nodes` and confirm one node in `Ready` status.
 
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
 
# give the deployments a moment to create their pods before waiting on them.
# Running `kubectl wait` immediately after `helm install` can fail with
# "no matching resources found" if the pods don't exist yet
sleep 15
kubectl wait --for=condition=ready pod --all -n kagent --timeout=180s
```
 
Version pinning matters because kagent changes frequently. This lab uses kagent `0.9.12`.
 
```bash
kubectl get pods -n kagent -o wide
```
 
On a fresh cluster, the kagent controller may log transient failures before Postgres is ready. That's normal. Give it a moment to converge, then validate the pod state. The system recovers on its own.
 
**Checkpoint:** every pod in the `kagent` namespace is `Running`.
 
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
 
```text
NAME     TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
ollama   ClusterIP   10.96.147.225   <none>        80/TCP    153m
```
 
```text
NAME     ENDPOINTS           AGE
ollama   10.244.0.30:11434   153m
```
 
The Service has a real endpoint. That's your confirmation the in-cluster model service is reachable from the rest of Kubernetes.
 
**Checkpoint:** the Service has an endpoint IP address.
 
---
 
## Step 4: Pull a local model
 
This lab uses `qwen2.5:1.5b`, a 1.5-billion-parameter model optimized for CPU inference.
 
```bash
kubectl exec -n ollama deploy/ollama -- ollama pull qwen2.5:1.5b
kubectl exec -n ollama deploy/ollama -- ollama list
```
 
Terminal output from pulling the model:
 
```text
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
 
```text
NAME               ID              SIZE      MODIFIED
qwen2.5:1.5b       65ec06548149    986 MB    About an hour ago
llama3.2:latest    a80c4f17acd5    2.0 GB    14 hours ago
llama3.2:3b        a80c4f17acd5    2.0 GB    15 hours ago
```
 
**Why `qwen2.5:1.5b`?** It's significantly smaller than `llama3.2:3b` (986 MB vs. 2.0 GB) and, on the CPU-only setup used for this lab, generated tokens roughly 8x to 16x faster in practice: 2 to 4 tokens/sec versus 0.25 tokens/sec for `llama3.2:3b` (pod limits: 2 vCPU / 4Gi memory). The tradeoff is slightly lower reasoning capability, but for structured tool calling, which is what agents actually need, it's more than adequate. I switched models partway through building this lab; inference had become painfully slow with `llama3.2:3b` on CPU-only compute.
 
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
 
```text
NAME                   PROVIDER   MODEL
default-model-config   Ollama     llama3.2:3b
local-model-config     Ollama     qwen2.5:1.5b
```
 
(`default-model-config` stays on `llama3.2:3b` here; this lab never uses it, since every agent below points explicitly at `local-model-config`.)
 
Before moving to the agent layer, validate the model directly:
 
```bash
kubectl exec -n ollama deploy/ollama -- ollama run qwen2.5:1.5b "reply with the single word: ready"
```
 
```text
ready
```
 
That proves the model is reachable and generating before any agent starts making tool calls.
 
**Checkpoint:** the model responds with "ready".
 
---
 
## Step 6: Access the kagent dashboard
 
Before you open the UI, forward the dashboard service to your machine:
 
```bash
kubectl port-forward -n kagent service/kagent-ui 8082:8080
```
 
Leave that running in its own terminal. The dashboard is now at **http://localhost:8082**. Every remaining step in this lab uses that URL.
 
---
 
## Step 7: Build your first agent (read-only)
 
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
 
Every tool this agent has access to is read-only. It can inspect cluster state, but it cannot mutate anything. This is one of the clearest, cheapest ways to establish a secure-by-default agent posture: don't grant a tool the agent doesn't need for the job it's doing.
 
Deploy it:
 
```bash
kubectl apply -f 02-first-agent/agent.yaml
kubectl get agent -n kagent
```
 
![kagent's Agent Details panel for local-k8s-agent, showing its four read-only tools and description: "Read-only Kubernetes inspection agent, running entirely against an in-cluster local model. No write access at this stage."](/img/blog/kagent-part-1-local-ai-agent-kubernetes/read-only-agent-details.png)
 
Notice the agent's own description confirms its scope before you even ask it anything: no write tools are listed, because none are attached.
 
Open the kagent dashboard at `http://localhost:8082`, select `local-k8s-agent`, and ask:
 
> What pods are running in the kagent namespace?
 
That's the simplest possible end-to-end validation: the agent calls `k8s_get_resources` with appropriate filters, reads the response, and answers based on what it finds. The answer should match what `kubectl get pods -n kagent` shows you directly.
 
![local-k8s-agent answering "What pods are running in the kagent namespace?" with an expanded k8s_get_resources tool call and a table of 20 pods](/img/blog/kagent-part-1-local-ai-agent-kubernetes/read-only-agent-query.png)
 
*(This particular cluster has extra agents from other work running alongside the lab; on a fresh cluster you'll see just `local-k8s-agent` and `local-hitl-agent` here, and possibly the core kagent components.)*
 
**Checkpoint:** the agent's answer reflects the actual cluster state.
 
---
 
## Step 8: Add a write-capable agent behind approval gates
 
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
 
```text
NAME               TYPE          RUNTIME   READY   ACCEPTED
local-hitl-agent   Declarative   python    True    True
```
 
![kagent's Agent Details panel for local-hitl-agent, showing k8s_apply_manifest and k8s_delete_resource each tagged "Requires approval before execution"](/img/blog/kagent-part-1-local-ai-agent-kubernetes/hitl-agent-tools.png)
 
The `requireApproval` YAML above isn't just declared, it's visibly enforced in the UI: every write-capable tool on this agent is flagged before you've asked it to do anything.
 
---
 
## Step 9: Walk through the human-in-the-loop workflow
 
Open the kagent dashboard and select `local-hitl-agent`. This is a four-part sequence: do them in order, since each one demonstrates a different piece of the approval boundary.
 
### 9.1: Read without approval
 
Ask:
 
> List all pods in the kagent namespace.
 
This executes immediately. It's a read operation, so it's never gated; only the tools in `requireApproval` pause.
 
### 9.2: Approve a write
 
Ask:
 
> Create a ConfigMap called test-config in the default namespace with the key message set to hello.
 
The agent proposes the write and the action pauses in the UI waiting for you.
 
![kagent HITL approval screen showing a pending ConfigMap creation, with the full manifest visible and Approve/Reject buttons](/img/blog/kagent-part-1-local-ai-agent-kubernetes/hitl-approval-pending.png)
 
Approve it.
 
![kagent HITL screen after approval, showing "Approved" status and the agent confirming the ConfigMap was successfully created](/img/blog/kagent-part-1-local-ai-agent-kubernetes/hitl-approval-confirmed.png)
 
Then verify it landed:
 
```bash
kubectl get configmap test-config -n default -o yaml
```
 
This is the critical point of the whole lab: the model proposed the action, but the human approval gate is the actual boundary between a suggestion and a real mutation.
 
### 9.3: Reject a delete
 
Ask:
 
> Delete the ConfigMap test-config in the default namespace.
 
Again it stops at the approval gate. This time, type a reason into the box and click **Reject** instead of Approve:
 
> Resource still in use
 
![Rejection reason being entered for the pending delete request, with Reject and Cancel buttons visible](/img/blog/kagent-part-1-local-ai-agent-kubernetes/hitl-rejection-reason.png)
 
![kagent HITL screen after the delete is rejected, showing a "Rejected" status and the agent confirming the ConfigMap remains in the default namespace](/img/blog/kagent-part-1-local-ai-agent-kubernetes/hitl-rejection-confirmed.png)
 
The agent understood the request, proposed the call, and then backed off cleanly when you said no. It didn't retry, argue, or find another way to delete the resource. That's the behavior you actually want from a tool with delete access.
 
Verify the resource is untouched:
 
```bash
kubectl get configmap test-config -n default
```
 
**A nice extra behavior worth showing:** after backing off, the agent offered to check whether anything was actually depending on `test-config`, since the rejection reason I gave it was "Resource still in use." I said yes, and it came back with a small structured choice instead of guessing what I meant:
 
![Agent asking a follow-up question with three quick-action options: check pods and deployments, force delete, or do nothing](/img/blog/kagent-part-1-local-ai-agent-kubernetes/hitl-dependency-check-prompt.png)
 
I picked **"Check pods and deployments for references to test-config."** The agent called `k8s_get_resource_yaml` and `k8s_get_resources` against the `default` namespace and reported back:
 
![Agent's result after checking pods and deployments, reporting that neither nginx-smoke nor pg-smoke references test-config and no deployments exist in the namespace](/img/blog/kagent-part-1-local-ai-agent-kubernetes/hitl-dependency-check-result.png)
 
Turns out `test-config` wasn't actually referenced by anything in the namespace. The "still in use" reason I gave was just a convenient excuse to test a rejection, not a real dependency. The agent's own investigation surfaced that: no pods or deployments pointed at it, so as far as the cluster is concerned it's safe to delete whenever I actually want to. This is a small but telling moment: the agent didn't just accept the rejection and stop, it offered a concrete next step for resolving *why* the resource was flagged as in use, then went and checked rather than taking my word for it.
 
### 9.4: Use an ambiguous prompt
 
Ask:
 
> Set up a namespace for my application.
 
This is intentionally vague: no namespace name, no other parameters. A well-behaved agent should ask a clarifying question rather than guess.
 
The agent will ask:
 
> What should the namespace be called?
 
This is why agentic systems aren't just "LLM with tools." Sometimes the correct action is to stop and ask. Proceeding on a guess would make things worse, not better.
 
---
 
## Understanding performance: token speed and why qwen2.5:1.5b wins
 
You probably noticed each interaction took a while. That's not a bug: it's an honest, real tradeoff of local CPU inference.
 
You can watch it happen directly:
 
```bash
kubectl logs -n ollama deploy/ollama --tail=50
```
 
During this lab's actual execution, Ollama's generation timings looked like this:
 
```text
slot print_timing: id  0 | task 96 | n_gen =    100, tg =   1.92 t/s, tg_3s =   1.94 t/s
slot print_timing: id  0 | task 96 | n_gen =    110, tg =   2.00 t/s, tg_3s =   3.33 t/s
slot print_timing: id  0 | task 96 | n_gen =    127, tg =   2.18 t/s, tg_3s =   5.01 t/s
slot print_timing: id  0 | task 96 | n_gen =    140, tg =   2.15 t/s, tg_3s =   1.97 t/s
```
 
That's roughly 2 to 4 tokens per second with `qwen2.5:1.5b` on CPU, compared to 0.25 tokens per second with `llama3.2:3b` on the same hardware. That's roughly an 8x to 16x difference, and it's immediately noticeable in practice.
 
The agent loop multiplies that cost, because a single interaction involves several full passes through the model: reasoning about the question, selecting a tool call, reading the tool result, reasoning about that result, deciding on the next action, and generating the final answer. Each of those is a separate pass through the model: more tool steps means more passes, means slower overall.
 
Fully local AI is a real, workable option. It's just not a low-latency option on a CPU-only laptop. If you're building on this, keep prompts short, keep the tool list narrow, keep the model small, give it enough RAM and CPU, and reach for a GPU-backed node if you have one.
 
---
 
## What this lab actually proves
 
Strip away the specific commands and this lab demonstrated one thing: a local AI agent can operate inside a real Kubernetes environment, with a real approval boundary, without depending on a hosted model or a cloud key.
 
The architecture is explicit:
 
- The model runs inside the cluster through Ollama.
- Agent logic is defined declaratively in kagent CRDs.
- Tools are exposed through a dedicated tool server, not called directly.
- Tool access is narrowed to the smallest set of operations each agent actually needs.
- Write operations require explicit human approval before execution.
Two guardrails did all the work here:
 
1. **Least-privilege tool selection.** The read-only agent literally cannot mutate anything.
2. **Human approval for writes.** The write-capable agent can propose but not execute alone.
Neither is exotic. They're the minimum viable safety controls for any agentic Kubernetes workflow that's allowed to touch cluster state.
 
---
 
## Notes on model selection and behavior
 
One thing worth flagging as you experiment: smaller models like `qwen2.5:1.5b` are optimized for speed over reasoning depth. They're excellent at structured tool calling, which is what agents need most, but they can occasionally reach for the wrong tool entirely.
 
Here's a real example from this lab. Asked "how many namespaces are currently in my cluster," `local-k8s-agent` called `k8s_get_available_api_resources`, a tool that lists API resource *types*, not namespaces, and then confidently answered "There are currently 51 namespaces in your cluster." A kind cluster running kagent and Ollama has something like seven. The model didn't hallucinate a number out of nowhere; it grabbed the wrong tool and then reported that tool's item count as a namespace count.
 
![local-k8s-agent incorrectly answering a namespace count by calling k8s_get_available_api_resources instead of a namespace-listing tool](/img/blog/kagent-part-1-local-ai-agent-kubernetes/hallucination-wrong-tool.png)
 
That failure mode sits one layer upstream of tool output: the tools themselves return ground truth, but nothing guarantees the model calls the *right* tool for the question. That's exactly why read-only scoping and approval gates matter: they bound what a wrong tool choice, or a wrong action, can actually do to your cluster.
 
If you need deeper reasoning at the cost of latency, switch back to `llama3.2:3b`. If you need speed for simple operations, `qwen2.5:1.5b` is hard to beat. The architecture stays exactly the same either way.
 
---
 
## Current cluster status
 
By the time you finish, your lab should look roughly like this:
 
> The pod ages below (13h, 14h, 17h) are from a long-running dev cluster, not a fresh run of this lab. If you're following along on a clean cluster, expect ages in minutes. You'll also only see `local-k8s-agent` and `local-hitl-agent` alongside the core kagent components; the extra `*-agent` pods here (`cilium-*`, `istio-agent`, `kgateway-agent`, and so on) are from other work on this particular cluster and aren't part of this lab.
 
```text
NAME                                             READY   STATUS    RESTARTS       AGE
kagent-controller-99b4bb79d-cm5jn                1/1     Running   0              13h
kagent-grafana-mcp-678857cd56-s55kt              1/1     Running   0              17h
kagent-kmcp-controller-manager-76bb479b6-h2zq9   1/1     Running   13             17h
kagent-postgresql-85766c5f8c-vfjbr               1/1     Running   0              17h
kagent-querydoc-65cdb65878-h9bx7                 1/1     Running   0              17h
kagent-tools-7548fb9ffd-r54kh                    1/1     Running   0              13h
kagent-ui-75bd88cc5c-2wl2k                       1/1     Running   0              13h
local-hitl-agent-6497c985f4-phjdc                1/1     Running   0              5m
local-k8s-agent-65d9f49888-qgjjg                 1/1     Running   0              5m
```
 
Your core agents:
 
```text
NAME                TYPE          RUNTIME   READY   ACCEPTED
local-hitl-agent     Declarative   python    True    True
local-k8s-agent      Declarative   python    True    True
```
 
Your model config:
 
```text
NAME                   PROVIDER   MODEL
default-model-config   Ollama     llama3.2:3b
local-model-config     Ollama     qwen2.5:1.5b
```
 
---
 
## Troubleshooting: what you might hit along the way
 
None of these are unusual for a local, multi-component stack. They're worth knowing about before you hit them.
 
### Model-name mismatch in default config
 
If you see:
 
```text
model 'llama3.2' not found (status code: 404)
```
 
...it usually means `default-model-config` is pointing at a model name that doesn't match what's actually being served. Fix it directly:
 
```bash
kubectl patch modelconfig default-model-config -n kagent --type merge -p '{"spec":{"model":"qwen2.5:1.5b","ollama":{"host":"http://ollama.ollama.svc.cluster.local"}}}'
```
 
Re-check:
 
```bash
kubectl get modelconfig -n kagent -o wide
```
 
The model itself can be perfectly healthy while the agent is still broken, because the config is pointing at the wrong value. Local AI stacks are still software stacks. They fail like software.
 
### Startup race with the database
 
On a fresh cluster, the kagent controller can start logging failures before Postgres is actually ready. It looks like a broken install. It isn't: the system recovers on its own once the database comes up. Give it a minute, then check pod state rather than reacting to the first error line you see:
 
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
 
These four are good reminders that AI infrastructure is still infrastructure. It needs the same checks as any other cluster workload: readiness, scheduling, image propagation, dependency ordering.
 
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
 
The big lesson here isn't that local AI is instant, or that securing an agentic workflow is trivial. It's that local, secure, Kubernetes-native agent workloads are genuinely possible. But they're real systems, not a clever prompt with a couple of tools bolted on. They need a model runtime, a tool surface, a structured agent loop, an approval boundary, and an honest understanding of where the performance and operational bottlenecks actually live.
 
That's the real question this lab was built around: not "can AI manage Kubernetes?" but "how do we make that capability useful, observable, and safe enough to run near real infrastructure?"
 
**Part 2** picks up exactly where this leaves off. Least-privilege tools and a human approval gate are a solid starting point, but they're not the whole security story for an agent allowed anywhere near a real cluster. Next up: scoping agents with **RBAC and ClusterRoles**, routing and controlling agent traffic through **agentgateway**, and getting real **metrics and observability** into what these agents are actually doing.
 
Repository: [`Prianshu-git/Kagent-demo`](https://github.com/Prianshu-git/Kagent-demo)
 
