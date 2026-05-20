---
title: "Kubernetes v1.33: Key Features, Updates, and What You Need to Know"
seoTitle: "Kubernetes new release v1.33"
seoDescription: "\"Kubernetes v1.33: Key Features, Updates, and What You Need to Know"
datePublished: 2025-06-10T07:24:57.667Z
slug: kubernetes-v133-key-features-updates-and-what-you-need-to-know
author: saiyam-pathak
cover: /img/blog/kubernetes-v133-key-features-updates-and-what-you-need-to-know/c347f1e3-ea41-4ad4-bcb7-12dca6880134.png
tags: ["kubernetes", "devops", "devrel", "kubernetes-container", "newrelease", "v133"]
cuid: cmbq74ddv000202l5f73y09em
---
The Kubernetes v1.33, codenamed "Octarine: The Color of Magic" introduces 64 advancements.This release features 18 graduating to stable, 20 entering beta, and 24 new alpha features 1, with a strong emphasis on improving security, enhancing usability, improving scalability, and refining the overall developer experience.

In this blog, we’ll explore the top highlights of Kubernetes v1.33.

## **How to Try Out Kubernetes 1.33**

One of the biggest questions people often have is how they can try out the new Kubernetes version as soon as it is released. Cloud providers take some time to update the Kubernetes version, and until then, you can use vCluster. vCluster allows you to create a virtual cluster running in any version of vanilla Kubernetes, including Kubernetes version 1.33(the latest version at the time of writing this blog) with very simple steps.

Create a `vcluster.yaml` file:

```yaml
controlplane:
  distro:
    k8s:
      version:v1.33.0Copy
```

Then, create the virtual cluster:

```lua
vcluster create k8s133 -f vcluster.yamlCopy
```

Ensure your context is set to the virtual cluster and verify the nodes:

```rust
kubectl get nodes
NAME              STATUS   ROLES    AGE   VERSION
live-demo-e0is0   Ready    <none>   13m   v1.33.0
This setup enables you to test new features and plan upgrades accordingly.

  Warning  FailedScheduling        16m                default-scheduler        0/3 nodes are available: pod has unbound immediate PersistentVolumeClaims. preemption: 0/3 nodes are available: 3 Preemption is not helpful for scheduling.
  Normal   Scheduled               16m                default-scheduler        Successfully assigned vcluster-demo4/demo4-0 to live-demo-e0is1
  Normal   SuccessfulAttachVolume  16m                attachdetach-controller  AttachVolume.Attach succeeded for volume "pvc-c615f428-70f6-4921-88a9-7ab26349ad00"
  Normal   Pulled                  16m                kubelet                  Container image "ghcr.io/loft-sh/vcluster-pro:0.24.0" already present on machine
  Normal   Created                 16m                kubelet                  Created container vcluster-copy
  Normal   Started                 16m                kubelet                  Started container vcluster-copy
  Normal   Pulling                 16m                kubelet                  Pulling image "registry.k8s.io/kube-controller-manager:v1.33.0"
  Normal   Pulled                  16m                kubelet                  Successfully pulled image "registry.k8s.io/kube-controller-manager:v1.33.0" in 2.406s (2.406s including waiting). Image size: 27635030 bytes.
  Normal   Created                 16m                kubelet                  Created container kube-controller-manager
  Normal   Started                 16m                kubelet                  Started container kube-controller-manager
  Normal   Pulling                 16m                kubelet                  Pulling image "registry.k8s.io/kube-apiserver:v1.33.0"
  Normal   Pulled                  16m                kubelet                  Successfully pulled image "registry.k8s.io/kube-apiserver:v1.33.0" in 2.267s (2.267s including waiting). Image size: 30071307 bytes.
  Normal   Created                 16m                kubelet                  Created container kube-apiserver
  Normal   Started                 16m                kubelet                  Started container kube-apiserver
  Normal   Pulled                  15m                kubelet                  Container image "ghcr.io/loft-sh/vcluster-pro:0.24.0" already present on machine
  Normal   Created                 15m                kubelet                  Created container syncer
  Normal   Started                 15m                kubelet                  Started container syncerCopy
```

**Note:** While vCluster allows you to experiment with the latest Kubernetes features, some functionalities, particularly those that interact directly with the underlying host's operating system, kernel, kubelet, or hardware, might have limited or no effect when the host cluster is running an older Kubernetes version. Let’s test out a couple of features from Kubernetes version 1.33 using vCluster.

First let's talk some of the cool stuff from 1.33 and then we will try a couple of features on vCluster 1.33

### **In-Place Pod Vertical Scaling (Beta)**

In Kubernetes v1.33, the long‐awaited in-place Pod resize feature has graduated from alpha to beta and is now enabled by default. Instead of restarting Pods to adjust CPU or memory, you can simply patch the Pod’s resources via the new resize subresource and monitor its progress through two Pod conditions (PodResizePending and PodResizeInProgress). After its alpha debut in v1.27, resizing sidecar containers in place is now supported in beta. By reducing disruption and enabling more efficient resource use, especially for stateful or long-running workloads, this beta release lays the groundwork for future integration with the Vertical Pod Autoscaler and further production hardening based on community feedback.

```css
kubectl edit pod <pod-name> --subresource resizeCopy
```

Read more about this feature [here.](https://kubernetes.io/blog/2025/05/16/kubernetes-v1-33-in-place-pod-resize-beta/)

### **User namespaces on by default**

Kubernetes v1.33 now enables user namespaces by default, a significant security feature that enhances isolation between containers and the host system. User namespaces work by mapping user and group IDs (UIDs/GIDs) within a container to different, unprivileged UIDs/GIDs on the host. This is crucial because it prevents lateral movement between containers and increases host isolation, meaning that even if a container is compromised and runs as root internally, it has no elevated privileges on the host. This default enablement in Kubernetes 1.33 allows pods to opt-in to this stronger security posture without needing to enable specific feature flags, provided the underlying stack requirements are met.

To enable user namespaces in a pod you use the `hostUsers` value and set it to `false`.

Example:

```yaml
apiVersion: v1
kind:Pod
metadata:
  name: userns
spec:
  hostUsers: false
  containers:
  - name: shell
    command: ["sleep", "infinity"]
    image: debianCopy
```

User namespaces allow you to run as root inside the container, but not have privileges in the host.

### **Job Success Policy**

In Kubernetes 1.33, the Job SuccessPolicy feature has reached General Availability, offering more flexible completion criteria for batch workloads. This feature is particularly important for scenarios like leader-follower patterns (e.g., MPI used in scientific simulations, AI/ML, and HPC) where the overall job can be considered successful even if not all individual pods or indexes complete successfully. Instead of requiring every pod to succeed, users can now define specific rules, such as a minimum number of successfully completed indexes or the success of a specific leader index, allowing for early exit and resource cleanup once the defined success criteria are met, thereby optimizing resource usage and accommodating more complex batch processing needs.

### **HorizontalPodAutoscaler Configurable Tolerance**

This Alpha feature lets you control how quickly your applications scale up or down. Before, there was a fixed 10% buffer for all applications before they would scale. Now, you can set this buffer specifically for each application. This means you can make your application scale up very quickly if there's a sudden increase in traffic (by setting a low or zero buffer for scaling up) and scale down more slowly to avoid too many changes if traffic drops a little (by setting a higher buffer for scaling down). This gives you better control, especially for large applications, helping to keep them stable and avoid unnecessary changes when small things fluctuate. You'll need to turn on the "HPAConfigurableTolerance" as a [feature](https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/) [gate](https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/).

Example - an HPA with a tolerance of 5% on scale-down, and 1% tolerance on scale-up, would look like the following:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: demo
spec:
  ...
  behavior:
    scaleUp:
      tolerance: 0.01
    scaleDown::
      tolerance: 0.05Copy
```

### **New configuration option for kubectl with .kuberc for user preferences**

In v1.33, kubectl introduces an alpha feature that lets you keep aliases, default flags (e.g. server-side apply), and other preferences in a separate `~/.kube/kuberc` file, rather than crowding your kubeconfig.

### **New features in DRA**

Also in Kubernetes version 1.33, Dynamic Resource Allocation (DRA), a flexible way for applications to request specific hardware like GPUs, is getting better even though it's still in beta. A new beta update lets device drivers share more detailed status information. Several new early-test features have also been added:

* the ability to split single devices into smaller usable parts ("Partitionable Devices")
    
* a way to mark some devices as unusable unless an application specifically allows it ("Device Taints and Tolerations")
    
* an option for users to list their preferred devices in order ("Prioritized List")
    
* improved security for administrative access to devices.
    

These changes aim to make it easier and more efficient to use specialized hardware in Kubernetes, with the goal of making DRA fully available soon. DRA is supposed to go GA in Kubernetes 1.34.

### **SideCar Container graduates**

Launched in 1.28 as an alpha feature, sidecar finally graduated to stable in 1.33. These containers run alongside your primary application container within the same Pod. Kubernetes implements sidecars as a special type of init container configured with `restartPolicy: Always`. This ensures they start before your main application containers, run for the entire lifecycle of the Pod, and are automatically terminated after the main containers finish. This native support means you can rely on sidecars to use probes (startup, readiness, and liveness) to signal their health, and their memory (OOM) scores are adjusted like primary containers to prevent them from being terminated too early under memory pressure.

## **Kubernetes 1.33 features on vCluster**

Now we’ll try these two features using vCluster.

* Ordered Namespace Deletion
    
* ClusterTrustBundle
    

To enable these features we’ll need to set the following feature flags:

```yaml
controlPlane:
  distro:
    k8s:
      version: v1.33.0
      apiServer:
        extraArgs:
          - "--feature-gates=OrderedNamespaceDeletion=true"
          - "--feature-gates=ClusterTrustBundle=true
ClusterTrustBundleProjection=true"
          - "--runtime-config=certificates.k8s.io/v1beta1/clustertrustbundles=true"Copy
```

##### **Command**

```lua
vcluster create k8s-1-33-dev --namespace vcluster-133-ns -f kube133.configCopy
```

##### **Output**

```sql
vcluster list
     NAME     |    NAMESPACE    | STATUS  | VERSION | CONNECTED |    AGE      
  ---------------+-----------------+---------+---------+-----------+-------------
    k8s-1-33-dev | vcluster-133-ns | Running | 0.24.0  | True      | 5h47m46s   Copy
```

### **Ordered Namespace Deletion**

It is an alpha feature that brings in an opinionated deletion process in the Kubernetes namespace deletion to ensure secure deletion of resources within a namespace. The current deletion process is semi-random, which may lead to unintended behavior, such as Pods persisting after the deletion of their associated NetworkPolicies. If this feature is turned on, the Pods will be deleted before other resources with logical and security dependencies. This design enhances the security and reliability of Kubernetes by mitigating risks arising from the non-deterministic deletion order. In order to enable this feature you need to enable the feature flag `"--feature-gates=OrderedNamespaceDeletion=true"`

Let’s create the pod

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: demo-order
---
apiVersion: v1
kind: Pod
metadata:
  name: demo-pod
  namespace: demo-order
spec:
  containers:
  - name: pause
    image: k8s.gcr.io/pause:3.6
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: demo-order
spec:
  podSelector: {}
  policyTypes:
  - IngressCopy
```

This will create a namespace, Pod and a networkPolicy. Now in order to see the ordered deletion you can use any terminal in split view or just two terminal windows so that you can watch networkPolicy and pods.

Once you delete the namespace, you will observe that the pod gets deleted first and then the namespace, and see similar results as in the below image.

![](https://cdn.prod.website-files.com/65a5be30bf4809bb3a2e8aff/683475a3132a6b86655fac71_73592eb6-348b-43bd-b2ab-dbabe98a8fe2.png align="left")

### **ClusterTrustBundle**

The ClusterTrustBundle is a beta feature in Kubernetes 1.33, part of the `certificates.k8s.io/v1beta1` API group, used to manage cluster-scoped X.509 trust anchors. It allows you to publish CA certificates that in-cluster components (e.g., webhooks, image registries, or workloads) can use for certificate verification.

Let’s try a sample and run it on vCluster:

Download a demo CA

```bash
curl -s https://letsencrypt.org/certs/isrgrootx1.pem -o isrgrootx1.pemCopy
```

Parsing check

```scss
openssl x509 -in isrgrootx1.pem -noout -textCopy
```

Use above and create a manifest as below:

```bash
apiVersion: certificates.k8s.io/v1beta1
kind: ClusterTrustBundle
metadata:
  name: letsencrypt-isrg-root-x1
spec:
  # Global (signer-unlinked) bundle: visible to all workloads
  trustBundle: |
    -----BEGIN CERTIFICATE-----
    MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
    TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
    cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
    WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
    ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
    MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
    h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
    0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U
    A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW
    T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH
    B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC
    B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv
    KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn
    OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn
    jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw
    qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI
    rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV
    HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq
    hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL
    ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ
    3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK
    NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5
    ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur
    TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC
    jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc
    oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq
    4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA
    mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d
    emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=
    -----END CERTIFICATE-----Copy
```

Apply the manifest

Command

```plaintext
kubectl apply -f bundle.yamlCopy
```

Output:

```bash
clustertrustbundle.certificates.k8s.io/letsencrypt-isrg-root-x1 createdCopy
```

```sql
kubectl get clustertrustbundle.certificates.k8s.io
NAME                       SIGNERNAME
letsencrypt-isrg-root-x1   <none>Copy
```

The above examples allow you to test at the API level some of the new features in Kubernetes 1.33 and how they work on vCluster.

## **Deprecated and Removed Features**

Endpoints API Deprecation: The traditional Endpoints API is deprecated in favor of EndpointSlices, which offer better scalability and support for modern features.

Removal of gitRepo Volume Type: The deprecated gitRepo volume type has been removed. Users should transition to alternatives like init containers with git clone.

## **Conclusion**

Kubernetes releases always come with many new features and this time is no different. Let us know which Kubernetes features you are most excited about. And do read the [official](https://kubernetes.io/blog/2025/04/23/kubernetes-v1-33-release/) [announcement](https://kubernetes.io/blog/2025/04/23/kubernetes-v1-33-release/) [post](https://kubernetes.io/blog/2025/04/23/kubernetes-v1-33-release/) from the release team. A huge thanks to all the members of the release team who helped with this amazing release. If you want to quickly try out Kubernetes 1.33, you can easily use vCluster.