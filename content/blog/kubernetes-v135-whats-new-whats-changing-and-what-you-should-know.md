---
title: "Kubernetes v1.35 – What’s New, What’s Changing, and What You Should Know"
seoTitle: "Kubernetes 1.35"
seoDescription: "Learn about the latest Kubenretes release Kubernetes 1.35"
datePublished: 2025-12-19T13:42:59.181Z
slug: kubernetes-v135-whats-new-whats-changing-and-what-you-should-know
author: saloni-narang
cover: /img/blog/kubernetes-v135-whats-new-whats-changing-and-what-you-should-know/976c8a3e-ea9a-4ecc-b054-267dac3d5645.png
tags: ["kubernetes", "new", "newrelease", "release-updates", "kuberntes-135"]
cuid: cmjcx62jx000002jyh31b17qm
---
**Release date: December 17, 2025**

Kubernetes 1.35 is released and again the velocity for this project never makes you feel that there is no innovation left. The releases is focussed on more stability, AI workloads, introducing concept of workload and so much more.

Huge thanks to all the contributors and the release team for making this happen. Let’s look at some of the cool features for this release.

![No alternative text description for this image](https://media.licdn.com/dms/image/v2/D5622AQELO5TpuYIYHg/feedshare-shrink_2048_1536/B56Zss9.NHIEAw-/0/1765986005355?e=1767830400&v=beta&t=qdPIggbl_P9iIE8_4qvq1ZpHUP8B9zNDhTgFnLARv8Y align="left")

## Native Gang Scheduling is finally here (and it’s a big deal)

For years, Kubernetes scheduled pods one by one. That model works well for stateless services, but it breaks down badly for distributed workloads, think PyTorch training jobs, Spark, Ray, or MPI-style applications.

Kubernetes 1.35 introduces **native Gang Scheduling** through a new **Workload API**. This enables *all-or-nothing* scheduling: either all pods in a group get scheduled together, or none do. No more half-started jobs burning GPUs while waiting for peers. This is foundational work for AI and HPC workloads on Kubernetes.

First, define a `Workload` that represents the gang policy:

```yaml
apiVersion: scheduling.k8s.io/v1alpha1
kind: Workload
metadata:
  name: demo-workload
  namespace: gang-demo
spec:
  podGroups:
  - name: workers
    policy:
      gang:
        minCount: 3
```

Then reference it from your Pod:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: worker-0
  namespace: gang-demo
  labels:
    app: gang-demo
spec:
  workloadRef:
    name: demo-workload
    podGroup: workers
  containers:
    - name: demo
      image: nginx:1.27
      resources:
        requests:
          cpu: "200m"
          memory: "128Mi"
---
apiVersion: v1
kind: Pod
metadata:
  name: worker-1
  namespace: gang-demo
  labels:
    app: gang-demo
spec:
  workloadRef:
    name: demo-workload
    podGroup: workers
  containers:
    - name: demo
      image: nginx:1.27
      resources:
        requests:
          cpu: "200m"
          memory: "128Mi"
---
apiVersion: v1
kind: Pod
metadata:
  name: worker-2
  namespace: gang-demo
  labels:
    app: gang-demo
spec:
  workloadRef:
    name: demo-workload
    podGroup: workers
  containers:
    - name: demo
      image: nginx:1.27
      resources:
        requests:
          cpu: "200m"
          memory: "128Mi"
```

The scheduler now understands that these pods belong together and either they will be scheduled together or won’t get scheduled.

**Saiyam Pathak already published a full hands-on video on the Kubesimplify YouTube channel**, where he builds Kubernetes 1.35 from source, enables the Workload API, and demonstrates native Gang Scheduling end to end. If you’re working with AI or distributed computing, that walkthrough is worth your time.

%[https://youtu.be/bD_eQU0GwOw?si=zEc3c5xBwBIoF5Pl] 

## **In place pod update moves to stable**

In Kubernetes v1.35, In-place update of Pod resources graduated to GA (Stable), which means you can now change a running Pod’s CPU and memory requests/limits without recreating the Pod (and often without restarting containers). This is a big deal for stateful and batch workloads where a restart is costly: you can do smoother, less disruptive vertical scaling, and Kubernetes will reflect desired resources in `spec` while tracking what’s actually applied in `status` as the kubelet works through the resize. This graduation comes from KEP #1287 (SIG Node).

## User namespaces in Pods

Linux user namespaces in Kubernetes allows pods to run with different user and group IDs than the host while preserving strong isolation. With this feature, a process can run as root inside a container but map to an unprivileged user on the node, significantly reducing the blast radius of container breakouts and mitigating several high-severity CVEs. It adds a new `pod.spec.hostUsers` field to opt into user namespaces, integrates with CRI and idmapped mounts for safe volume handling, and aligns with Pod Security Standards to safely relax certain restrictions when enabled. Overall, this strengthens node-to-pod and pod-to-pod isolation without changing default behaviour, making Kubernetes workloads more secure by design.

## **Kubernetes is finally letting go of old baggage**

Kubernetes 1.35 draws a hard line under several legacy technologies.

If your nodes still rely on **cgroup v1**, the kubelet will not start by default anymore. Most modern Linux distributions have already moved to cgroup v2, which offers better resource isolation and consistency. Kubernetes waited long enough and now is the time to take action on this.

The same applies to **containerd 1.x**. Kubernetes 1.35 is the *last* release that supports it. If you plan to upgrade beyond this version, moving to containerd 2.x is no longer optional.

**IPVS mode in kube-proxy** is also deprecated. While once popular for performance reasons, it became increasingly complex to maintain. Kubernetes is consolidating around nftables, reducing operational and maintenance burden.

**Ingress NGINX retirement**: This came as a massive blow where due to maintainer debt the ingress nginx which is uses by thousands of organisations is now getting retired. Although Chainguard has come up to support and maintain the version as per [this announcement](https://www.chainguard.dev/unchained/introducing-chainguard-emeritoss). IMO you should start your migrations to gatewayAPI and we have a full end to end video about this on Kubesimplify already where you get to see entire demo on how to migrate from ingress to gatewayAPI.

%[https://youtu.be/Z-vKixowC9c?si=Rb3ud8-K5vSFaaSt] 

## **Securing Cached Images in Kubernetes 1.35**

KEP-2535 addresses a security gap in Kubernetes image pulling. Historically, when `imagePullPolicy` was set to `IfNotPresent` or `Never`, a pod could start using a private image already cached on a node even if it did not have the credentials to pull that image itself. In multi-tenant clusters, this meant one workload could unintentionally benefit from another workload’s credentials. Kubernetes 1.35 introduces kubelet-level credential verification for cached images, ensuring that a pod is authorized to use an image before it can run, regardless of whether the image is already present. With this beta feature enabled by default and configurable via `imagePullCredentialsVerificationPolicy`, clusters can now enforce stricter image access without forcing `Always` pulls, significantly improving tenant isolation and supply-chain security.

### Overall I am excited about

* In-place Pod resource updates (now GA): being able to adjust CPU/memory without restarting pods is huge for stateful and long-running workloads.
    
* Native gang scheduling and the new Workload API direction is a big deal for ML/HPC style workloads and any “all-or-nothing” batch pipelines.
    

* *Pod certificates (beta): a strong step toward native workload identity and simpler mTLS setups without always relying on extra controllers.*
    
* Node declared features (alpha): a practical way to reduce upgrade/version-skew surprises by letting nodes declare supported capabilities before scheduling decisions happen.
    

Overall this release consists of 60 enhancements, including 17 stable, 19 beta, and 22 alpha features. What is the feature that you are most excited about for this Kubernetes release and is there anything you would like to see a deep dive on Kubesimplify.