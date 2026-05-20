---
title: "Confidential Containers - Running on Kubernetes"
seoTitle: "Hands on confidential containers course"
datePublished: 2024-08-05T17:35:50.780Z
slug: confidential-containers-running-on-kubernetes
author: saiyam-pathak
cover: /img/blog/confidential-containers-running-on-kubernetes/ec25735e-8d46-4cb3-bb7e-649ea2c1ba73.png
tags: ["confidential", "confidential-computing-consortium", "confidential-containers", "coco"]
cuid: clzh9vr3w000a08lgeischis1
---
**Confidential computing** - it's not a fancy word anymore, it is something that has a whole ecosystem around it and also tooling to make it happen.

Can we create a safe isolated environment in the cloud where our application is isolated from the rest of the infrastructure? The answer lies in the realm of **confidential computing**, a field that is rapidly advancing to ensure data security and privacy even in untrusted environments.

Lets try to understand the basics first:

**Confidential computing** is designed to run your code within a secure enclave or trusted execution environment (TEE). This technology ensures that data remains confidential and secure, even when being processed in potentially untrusted environments. This secure environment is being realized at the hardware level by extending CPU capabilities to create isolated spaces by the processor itself. Here, the processor guarantees that the space is isolated and inaccessible to unauthorized processes.

![](/img/blog/confidential-containers-running-on-kubernetes/97a31845-ea76-49be-9ce5-d358c40cea4e.png align="center")

Intel were the pioneers in providing the hardware having this capability. Intel's Secure Guard Extensions (SGX) are a set of instruction set extensions that enable the isolation of specific processes within a system. When a program is executed, the processor can isolate it within an enclave, ensuring its security. However, applications need to be designed to run within these enclaves, requiring adaptation for this secure environment. This means, there is extra effort required and there is no lift and shift but over the years the technology has matured and now Intel TDX, ARM CCA, AMD SEV are the new way of doing this. In these, instead of isolating a process, it will be isolating a virtual machine itself which makes more sense.

![](/img/blog/confidential-containers-running-on-kubernetes/2c517f2f-a35d-418b-aca5-900effb16d45.png align="center")

NVIDIA is taking confidential computing to the next level by enabling their H100's with isolation of code and data on GPUs. This advancement opens up new possibilities for secure computation in machine learning and AI applications.

![](/img/blog/confidential-containers-running-on-kubernetes/1c844fd5-493d-40cf-b4ad-f35acfc065d2.png align="center")

### Confidential Containers

![](/img/blog/confidential-containers-running-on-kubernetes/43cbdd2d-316e-4f9a-990f-cfbe70672268.png align="center")

There are two concepts here:

**Confidential Cluster** - In this the whole cluster itself is isolated inside a cloud environment. Although this is possible with the hardware supported but it won't be possible for managed Kubernetes. For managed Kubernetes you will have a regular control plane inside a cloud provider that is not running in isolated mode. This mode provides highest level of isolation but can be achieved on self managed Kubernetes clusters

**Confidential containers** - This is where things get really interesting. Kata containers is the low level container runtime where you can point your worklod to by defining the runtime class. Kata runs your containers as a light weight virtual machines. Now these virtual machines can be isolated an run inside enclave.

![](/img/blog/confidential-containers-running-on-kubernetes/85ab51b5-b15f-4d38-897b-b58e91568845.png align="center")

### Innovation happening:

Even with all of the above discussed, there are scenarios where where the apiserver that in not running in isolated mode is able to connect with the kubelet and the kubelet is able to connect with isolated pods - which are kata containers and running inside an enclave.

There are open source projects building up in this space and one of them is [contrast](https://github.com/edgelesssys/contrast). This can run in existing Kubernetes cluster where the hardware supports enclaves. Encrypting all traffic and pod to pod communication. It lets you add annotation to the workload you are deploying and then check that attestation while deploying to know if the correct thing is getting deployed on to the cluster.

![](/img/blog/confidential-containers-running-on-kubernetes/02ac7a00-3b18-4b8e-bbc9-de1723a51b2a.png align="center")

### Confidential Computing on Kubernetes workshop

All of the above images and pointers are taken from the full fledged workshop that [Moritz Eckert](https://x.com/m1ghtymo) did with me on Kubesimplify. Do check out the full workshop that includes all of the concepts explained above along with end to end demo of running app inside enclave. I highly recommend and and one of the workshops that you should not miss.

%[https://www.youtube.com/live/7w9x8DU1Q4Q?si=lACIwHkRC-xeEqWf] 

### Conclusion

The future of confidential computing is promising, offering a path to running code securely even in untrusted environments. As technologies continue to evolve, they provide robust solutions for creating secure enclaves in the cloud, ensuring data privacy and integrity. With innovations like SGX, SEV, Kata Containers, and contrast the vision of confidential computing is becoming a reality, empowering organizations to protect their most valuable assets in the digital age.