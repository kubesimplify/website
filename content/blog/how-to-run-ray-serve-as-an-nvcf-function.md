---
title: "How to Run Ray Serve as an NVCF Function"
seoTitle: "How to Run Ray Serve as an NVCF Helm Function"
seoDescription: "Step-by-step: deploy a Ray Serve app as an NVCF Helm function with no KubeRay operator. Real outputs, real bugs, working chart."
datePublished: 2026-05-20T00:00:00.000Z
slug: how-to-run-ray-serve-as-an-nvcf-function
author: saiyam-pathak
cover: /img/blog/how-to-run-ray-serve-as-an-nvcf-function/cover.png
tags: ["nvidia", "ray", "kubernetes", "gpu", "mlops"]
cuid: how-to-run-ray-serve-as-an-nvcf-function
---

If you read [the NVCF deep dive](https://blog.kubesimplify.com/nvcf-is-now-open-source-inside-nvidia-s-gpu-function-platform), you know NVCF lets you create functions in two ways: as a custom container, or as a Helm chart. The Helm chart path is interesting because it gives you control over the Kubernetes resources that run inside the function boundary.

I built and tested a Ray Serve chart, sent it upstream as [PR #22](https://github.com/NVIDIA/nvcf/pull/22), and it has now landed in `NVIDIA/nvcf` main through NVIDIA's upstream merge flow as [commit `31497f3`](https://github.com/NVIDIA/nvcf/commit/31497f36a08e298cb8b3c66c36db5bb2d07eeb48), with me credited as co-author. This is the walkthrough.

---

## A 60-Second Ray Serve Primer

If you've never used Ray, here's the mental model in plain English.

Ray is a distributed Python runtime. Ray Serve is the serving layer built on top of it. You define a Python class, decorate it with `@serve.deployment`, and Ray Serve handles HTTP routing, replica management, and scaling.

For this sample, we run one Kubernetes pod with one Ray head node. Ray still starts multiple internal processes and Serve actors, but you do not need the KubeRay operator or any Ray CRDs.

That last part matters for NVCF. NVCF Helm functions deploy a Helm chart into a namespace and then route invocations to the Kubernetes `Service` you name in the function definition. This sample names that service `entrypoint`. If Ray Serve binds to `0.0.0.0:8000` and you expose it through a `ClusterIP` service called `entrypoint`, NVCF can treat it like any other Helm function endpoint.

---

## What We Are Building

A single Kubernetes pod running a Ray head node with Ray Serve deployed on top. NVCF routes inference requests to the Service configured with `--helm-chart-service`; in this sample, that Service is named `entrypoint` and exposes port 8000. The serve app handles `POST /infer` and `GET /health`. No KubeRay operator. No CRDs. Just a Deployment, a ConfigMap, and a Service.

![Ray Serve NVCF Architecture](/img/blog/how-to-run-ray-serve-as-an-nvcf-function/ray-serve-arch.png)

When NVCF deploys a Helm function, it uses the `helmChartServiceName` value from the function definition as the target for invocation routing. In the CLI, that is the `--helm-chart-service` flag. For this chart, we pass `--helm-chart-service entrypoint`, so every inference request that arrives at the NVCF API is routed to `entrypoint:8000` inside the cluster. Ray Serve listens there and dispatches to your deployment class.

---

## Prerequisites

- Kubernetes cluster (k3d, kind, or cloud)
- `helm` >= 3.12
- For GPU inference: real `nvidia.com/gpu` extended resources. Fake GPU resources are useful for chart scheduling tests only; they do not make model inference run on a GPU.
- For NVCF deployment: a self-managed NVCF control plane

> On Apple Silicon (ARM64), use `--set image.tag=2.40.0-py310-aarch64`. The default `2.40.0-py310-gpu` tag is AMD64-only.

---

## The Chart

The chart lives at [`examples/function-samples/helmchart-samples/ray-serve-sample/`](https://github.com/NVIDIA/nvcf/tree/main/examples/function-samples/helmchart-samples/ray-serve-sample) in the NVCF repo. Five files:

```
ray-serve/
  Chart.yaml                  # version 0.1.0
  values.yaml                 # image, GPU count, resource requests
  templates/
    deployment.yaml           # Ray head pod + startup sequence
    configmap.yaml            # serve_app.py mounted at /app
    service.yaml              # entrypoint Service on port 8000
```

### The startup sequence

The key design decision is in `deployment.yaml`:

```bash
ray start --head --port=6379 --dashboard-host=0.0.0.0 --block &
until ray health-check 2>/dev/null; do sleep 2; done
python /app/serve_app.py
```

`ray start --block &` starts the head node in the background and keeps it alive. `ray health-check` polls until Ray's GCS control service is ready before running the serve app. This matters: if you launch `serve_app.py` before Ray is ready, the `ray.init(address="auto")` call can fail.

### The serve app

`configmap.yaml` mounts a Python file at `/app/serve_app.py`:

```python
import time
import ray
from ray import serve
from ray.serve.config import HTTPOptions
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

ray.init(address="auto", ignore_reinit_error=True)

# serve.start() must be called explicitly to bind to 0.0.0.0;
# serve.run() alone defaults the HTTP proxy to 127.0.0.1,
# which is unreachable from outside the pod.
serve.start(http_options=HTTPOptions(host="0.0.0.0", port=8000))

app = FastAPI()

@serve.deployment(num_replicas=1, ray_actor_options={"num_gpus": 0})
@serve.ingress(app)
class InferenceDeployment:
    def __init__(self):
        pass

    @app.post("/infer")
    async def infer(self, request: Request) -> JSONResponse:
        body = await request.json()
        return JSONResponse({"echo": body})

    @app.get("/health")
    async def health(self) -> JSONResponse:
        return JSONResponse({"status": "ok"})

serve.run(InferenceDeployment.bind())

while True:
    time.sleep(3600)
```

Two things worth noting:

1. `serve.start(http_options=HTTPOptions(...))` must come before `serve.run()`. In current Ray versions, `serve.run()` does not accept `host` and `port` arguments. If you pass them to `serve.run()` directly you get `TypeError: run() got an unexpected keyword argument 'host'`. The explicit `serve.start()` sets the bind address before the proxy starts.

2. The `while True: time.sleep(3600)` keeps the Python process alive after `serve.run()` returns. On Python 3.10 aarch64, `time.sleep(float("inf"))` can raise `OverflowError`, so the loop is safer.

---

## Deploy Locally

Clone the repo and install the chart in CPU mode. I tested the commands below from current `NVIDIA/nvcf` main on an ARM64 k3d cluster.

```bash
git clone https://github.com/NVIDIA/nvcf.git
cd nvcf

# AMD64
helm upgrade --install ray-serve-e2e \
  examples/function-samples/helmchart-samples/ray-serve-sample/ray-serve/ \
  --set gpu.count=0 \
  --set image.tag=2.40.0-py310 \
  --namespace ray-test-e2e \
  --create-namespace \
  --wait --timeout 10m

# Apple Silicon ARM64
helm upgrade --install ray-serve-e2e \
  examples/function-samples/helmchart-samples/ray-serve-sample/ray-serve/ \
  --set gpu.count=0 \
  --set image.tag=2.40.0-py310-aarch64 \
  --set resources.requests.memory=2Gi \
  --set resources.limits.memory=4Gi \
  --namespace ray-test-e2e \
  --create-namespace \
  --wait --timeout 10m
```

The `--wait` flag blocks until the readiness probe on `/health` passes. First run can take a few minutes because the Ray image is large and Ray Serve needs time to start. On a busy local laptop, you may see transient Kubernetes watch warnings from Helm; what matters is that the final release status is `deployed`.

---

## Verify

Check the pod:

```bash
$ kubectl get pods -n ray-test-e2e
NAME                            READY   STATUS    RESTARTS      AGE
ray-serve-e2e-57444f44b-xf9xw   1/1     Running   1 (96s ago)   4m23s
```

Check the service:

```bash
$ kubectl get svc -n ray-test-e2e
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
entrypoint   ClusterIP   10.43.154.173   <none>        8000/TCP   4m23s
```

Check that the service has a backend endpoint:

```bash
$ kubectl get endpoints -n ray-test-e2e entrypoint
NAME         ENDPOINTS         AGE
entrypoint   10.42.3.38:8000   4m22s
```

Watch the logs to confirm Ray Serve deployed:

```bash
$ kubectl logs -n ray-test-e2e -l app.kubernetes.io/name=ray-serve-e2e | grep -E "Application 'default'|Deployed app"
INFO 2026-05-20 08:09:47,884 serve 1 -- Application 'default' is ready at http://0.0.0.0:8000/.
INFO 2026-05-20 08:09:47,887 serve 1 -- Deployed app 'default' successfully.
```

Test the endpoints:

```bash
$ kubectl port-forward -n ray-test-e2e svc/entrypoint 8000:8000 &

$ curl -sS -w '\nHTTP %{http_code} in %{time_total}s\n' http://localhost:8000/health
{"status":"ok"}
HTTP 200 in 4.277298s

$ curl -sS -w '\nHTTP %{http_code} in %{time_total}s\n' \
  -X POST http://localhost:8000/infer \
  -H 'Content-Type: application/json' \
  -d '{"prompt": "Hello Ray Serve on NVCF"}'
{"echo":{"prompt":"Hello Ray Serve on NVCF"}}
HTTP 200 in 4.477509s

$ kill %1
```

Ray Serve logs confirm both requests:

```
(ServeReplica:default:InferenceDeployment pid=405) GET /health 200 22.6ms
(ServeReplica:default:InferenceDeployment pid=405) POST /infer 200 298.1ms
```

In my ARM64 k3d run, the pod showed one restart during cold start. The app still reached `1/1 Running` and served both endpoints. If you see repeated restarts, check `kubectl describe pod`; slow local machines can trip the default 1-second Kubernetes probe timeout while Ray Serve is still warming up.

---

## Extend for a Real Model

Replace the `InferenceDeployment` body in `configmap.yaml` with your model logic. For a Hugging Face text generation model:

```python
@serve.deployment(num_replicas=1, ray_actor_options={"num_gpus": 1})
@serve.ingress(app)
class InferenceDeployment:
    def __init__(self):
        from transformers import pipeline
        self.model = pipeline(
            "text-generation",
            model="meta-llama/Llama-3.2-1B",
            device=0,
        )

    @app.post("/infer")
    async def infer(self, request: Request) -> JSONResponse:
        body = await request.json()
        result = self.model(body.get("prompt", ""), max_new_tokens=256)
        return JSONResponse({"generated_text": result[0]["generated_text"]})

    @app.get("/health")
    async def health(self) -> JSONResponse:
        return JSONResponse({"status": "ok"})
```

Set `num_gpus: 1` in the Ray actor options and deploy with `--set gpu.count=1`. The pod will request `nvidia.com/gpu: 1` from Kubernetes.

For a real model, you will usually also build a custom image with `transformers`, `accelerate`, model-specific libraries, and any required Hugging Face authentication or model cache setup. The default `rayproject/ray` image is enough for the echo sample, not a full production model stack.

---

## Deploy on Self-Managed NVCF

Package and push the chart to an OCI registry:

```bash
helm package examples/function-samples/helmchart-samples/ray-serve-sample/ray-serve/
helm push ray-serve-0.1.0.tgz oci://<your-registry>/<namespace>
```

Register credentials and create the function:

```bash
nvcf-cli registry-credential add \
  --hostname <your-registry> \
  --username <user> \
  --password <pass> \
  --artifact-type HELM \
  --artifact-type CONTAINER

nvcf-cli function create \
  --name ray-serve-sample \
  --helm-chart oci://<your-registry>/<namespace>/ray-serve:0.1.0 \
  --helm-chart-service entrypoint \
  --inference-url /infer \
  --inference-port 8000 \
  --health-uri /health \
  --health-port 8000

nvcf-cli function deploy create \
  --function-id <function-id> \
  --version-id <version-id> \
  --gpu H100 \
  --instance-type NCP.GPU.H100_1x \
  --min-instances 1 \
  --max-instances 1
```

The `--helm-chart-service entrypoint` tells NVCF which Kubernetes Service to route invocations to. The `--health-uri` and `--health-port` tell NVCF where to check readiness before sending traffic. If your OCI registry only stores the Helm chart and your container image is public, `--artifact-type HELM` may be enough. Add `--artifact-type CONTAINER` when the same private registry also hosts images that NVCF must pull.

---

## Notes from Testing

Getting the chart to a clean `1/1 Running` required fixing three issues: the startup loop used the wrong health-check condition, current Ray versions do not accept `host`/`port` on `serve.run()`, and `time.sleep(float("inf"))` can raise `OverflowError` on Python 3.10 aarch64. All three are fixed in the chart that landed in `main` via [commit `31497f3`](https://github.com/NVIDIA/nvcf/commit/31497f36a08e298cb8b3c66c36db5bb2d07eeb48).

I also retested the merged chart from current `NVIDIA/nvcf` main on 2026-05-20. The local Kubernetes path works end to end. My self-managed NVCF cluster was not healthy enough to run a real `function create` / `function deploy` test: several NVCF control-plane pods were in `CrashLoopBackOff` or `ImagePullBackOff`, including `nvct-api`, `reval`, and `notary-service`. So the Helm chart path is tested; the NVCF registration commands are validated against the current CLI, but not executed against a healthy NVCF control plane in this run.

---

## Links

- Chart source: [NVIDIA/nvcf - ray-serve-sample](https://github.com/NVIDIA/nvcf/tree/main/examples/function-samples/helmchart-samples/ray-serve-sample)
- Upstream merge commit: [`31497f3`](https://github.com/NVIDIA/nvcf/commit/31497f36a08e298cb8b3c66c36db5bb2d07eeb48)
- Original PR: [NVIDIA/nvcf#22](https://github.com/NVIDIA/nvcf/pull/22)
- NVCF deep dive: [blog.kubesimplify.com](https://blog.kubesimplify.com/nvcf-is-now-open-source-inside-nvidia-s-gpu-function-platform)
- Ray Serve docs: [docs.ray.io/en/latest/serve/index.html](https://docs.ray.io/en/latest/serve/index.html)
- NVCF repo: [github.com/NVIDIA/nvcf](https://github.com/NVIDIA/nvcf)
