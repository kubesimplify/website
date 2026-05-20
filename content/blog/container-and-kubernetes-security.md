---
title: "Container and Kubernetes Security"
seoTitle: "Security for Kubernetes and Containers"
seoDescription: "A descriptive written piece that describes best practices that can be followed to secure your Kubernetes cluster and containers before or when in production"
datePublished: 2022-10-17T12:30:45.093Z
slug: container-and-kubernetes-security
author: aryan-deshpande
cover: /img/blog/container-and-kubernetes-security/FfPXSzvNG.jpg
tags: ["docker", "kubernetes", "containers", "k8s", "cloud-native"]
cuid: cl9cr8vuu002df2nv4irmcg6k
---
# Brief Overview
** *Prerequisites : Kubernetes & Containers* ** ( MAKE CHANGE )

***Containers*** are **isolated resources** or **processes** that consist of definite boundaries for hardware resources and visibility set. Essentially uses **cgroups & namespaces** to **isolate resources**. Multiple Containers can interact with each other by setting up a network, resembling an architectural paradigm of a microservice.

**Docker** **engine ** was **introduced to create & build** **containers** and **containerize applications**.

The **Docker engine** have 3 underlying parts, **Docker** **Daemon**, **Docker ** **Client** **&** **Docker** **API**. It **Utilizes **an underlying **container runtime** to interact with the **host kernel resource** setting up **cgroups** (through cgroup drivers, allocates cgroups per process) & **namespaces** for processes. 

**Cgroups **define the **resource limits** like **CPU and memory resources**. **Namespaces define visibility limit**, for which the user is able to see eg: User, PID, IPC ( interprocess communication ), mount-point namespaces, and network namespace.

***Kubernetes ***also has the ability to manage the container life-cycle, although it does not use Docker instead **uses the abstraction of Container Runtimes**. **Utilizes** **Container Runtime Interface** ( CRI ) that **acts as a middleware** between the **Kubelet** and the various **Container Runtimes** ( containerd or CRI-O ) that can be implemented.

------------------------
# Container Security / Hardening

## Root and Non Root Containers
Since the **docker daemon operates as the root profile**, your **containers always have a tendency to run as a root process** when executed on any machine. **This may not be secure because** anyone who manages to breach the container will have direct access to the root profile.
The **container should be only provided** with **specific privileges** and run as a **specific entity** according to its **role in the container ecosystem**, eg: should not have access to important files and directories, & execute container rootless. 
**AKA the defense and depth mechanism**

*** Scenario 1 : Docker Daemon Runs as Root Profile by Default ***
![image.png](/img/blog/container-and-kubernetes-security/ArQqMdPzf.png align="left")

![image.png](/img/blog/container-and-kubernetes-security/OQ6HChV-h.png align="left")

- Instead of utilizing the root user directly, it is possible to construct a docker group where the users will still have the same level of access to the docker as a root user with respect to docker.socket. Although this does not harden the container.

This can be done using the following command : 
```sh
sudo usermod -aG docker $USER
```
![image.png](/img/blog/container-and-kubernetes-security/PbEVvsuXq.png align="left")

*** Scenario 2 : Host Machine File Can Be Accessed From Root-Container ***

> i) file stored in the host machine and setting root permission to the .txt file.

![image.png](/img/blog/container-and-kubernetes-security/8FzYUL2B1.png align="left")

> verifying permissions on a non-root host.

![image.png](/img/blog/container-and-kubernetes-security/8Tv7dUEKO.png align="left")

> ii) Demonstration as to how restricted / sensitive files can be accessed through root containers. 

- containers run as root since the docker command triggers the use of root profile, hence the mounted files are readable because the root has permissions for the following.

![image.png](/img/blog/container-and-kubernetes-security/jGG3MQbM6.png align="left")


**Container Hardening**

- **While the docker daemon runs as a root user**, specifying the args **-u user:pass** triggers a non-root user process. 
- **Containers should run as rootless**, this prevents an intruder that breaks out of the container to still exist within the non-root namespace and will not be able to access host files. 

>![image.png](/img/blog/container-and-kubernetes-security/L6t0-nBox.png align="left")
![image.png](/img/blog/container-and-kubernetes-security/q6TRSiYV-.png align="left")


---------------
### Avoid --privileged docker flag 
- Using **docker's "--privileged" flag** essentially **provides a container with more functionalities** that are similar to what the root user might have.
- When it comes to the security of the containers, **it is a bad idea to use this flag** if the **container is ephemeral** and **does not have any exclusive purpose**. As it effectively disables the isolation features of the container. 

### Drop container capabilites 
- A **particular container can be specified** with **arguments that drop certain commands**. **Ultimately** this allows the container to have less access to valuable folders and actions, although it has constrained functionality.
- using the **-cap-drop**=(FUNCTIONALITY) eg: =all , drops all command functionality.

![image.png](/img/blog/container-and-kubernetes-security/Yybwj5G2o.png align="left")

- **"grep Cap /proc/(process id)/status"** identifies capabilities of the container,
visibly Cap-fields have value 0s which correspond to Non-existent capability for that container.*

![image.png](/img/blog/container-and-kubernetes-security/kOlbCYnMr.png align="left")

-----------------------
### Runtime Container Security Tools 
- Used as a prevention tool before the container is up and running, where it helps to identify issues and follow best practices among containers.

#### **Snyk**
- **Snyk is an Open Source Security Scanner tool** which is capable of targeting Container Images, Filesystem Git repository (remote), Kubernetes cluster, or resources.
- In this case, it's a **Container Image security scanning tool**, that allows **finding vulnerabilities** in **container images** based on different policies.
- The container scanning results output a very specific risk that can be pointed out to be fixed before deployment of the container.
- Can be used in CI/CD pipelines before using the image for deployment.

**Scanning Container Image**

![image.png](/img/blog/container-and-kubernetes-security/LP5bY5NT3.png align="left")

**Results**

![image.png](/img/blog/container-and-kubernetes-security/htsBxktIr.png align="left")


-----------------------------

## Security For Kubernetes Clusters

### Role Based Access Control ( RBAC )
- Provides **access to specific Kubernetes resources based** on the **role/permissions** of the **entity**. Eg: Admin, Marketing, or Developer Team.
- **Enables users to access data or perform actions in Cluster** that are **required to fulfill their job requirements** while **minimizing risks from unauthorized users**. Such as access to calling the API server to make changes in the resources.

*A developer might need permission to add or make changes to the Kubernetes deployment, whereas the marketing team does not need permission for making changes to the cluster. RBAC in this case creates roles with specific permissions that add a layer of security.*

#### The RBAC Model 
- Role Assignment
- Authentication
- Authorization

#### Entity Identities are of 3 types
- **Users** pertains to specific user access to the cluster or namespace.
- **Groups** pertains to a group of users for access to actions/clusters or namespaces.
- **Services** used by pods in clusters, to identify uniquely as a process.


![1_QQJZp8zc27jCkbJLaIVhZQ.png](/img/blog/container-and-kubernetes-security/NWzg0opSB.png align="left")

#### RBAC is a method of restricting computer & network access to users, groups, and services. where we authenticate first before performing RBAC.

- ***Authentication***: **It is a prerequisite before applying RBAC**. There are many ways to authenticate, such as client certificates, bearer tokens, HTTP basic auth, and auth proxy.
**Client certificates are most widely used in production clusters**. It is **responsible to send a Certificate Signature Request** via HTTP to the **API server**. **Generating an x509 certificate** which is **signed by the API server** and **sent back to the client**. This certificate is used by the Cluster in order to authenticate the entity.

- ***Authorization***: Deals with binding entities with Roles, defining rules for accessing resources in the Kubernetes cluster. 

> Under Authorization

**RBAC Role & Cluster Role**
These are categories of permissions that are set for resources that are defined within a cluster scope.
- ***Role***: Pertain to a set of rules for a particular resource/object within a Namespace scope
- ***Cluster Role***: Pertain to set of rules for particular resource/object within the entire Cluster scope.

> Under RBAC Roles

**Permissions** are set using these **3 parameters**; **verbs**, **resource**, **apiGroup**
- **verbs**: These are actions on a resource that an entity can perform. 
**( "create", "get", "list", "update", "patch", "delete" )**
- **apiGroup**: An array of namespaces to which rules would be applied.
**( eg: apiGroup: ["serve"] )**
- **resource**: An array of resources that rules will apply on.
**( eg: resource: ["pods","service"] )**

**RBAC Role Binding**

- ***ClusterRole Binding***: Associates Role to entities ( users, groups, services ), granting permissions defined in the Namespace.
- ***Role Binding***: Binds ClusterRole to entities ( users, groups, services ), granting rules defined in the Cluster.

### Kubernetes & TLS/SSL Certificate
-  **Connections** from the **browser** to a **cluster API** using **HTTPS** are made **secure** using **TLS/SSL** **certificates** 
- TLS **can protect traffic within the cluster**
- **The TLS certificates and private keys** are stored in **k8s secrets resource**

> Using secrets itself is a best practice for confidential and sensitive information being used by the resources ( eg: pods ), essentially removing sensitive information from the application code and using it as environment variables instead.

In this case, we will generate a TLS certificate & private key from OpenSSL with, 
```sh
openssl req -x509 -newkey rsa:4096 -sha256 -nodes -keyout tls.key -out tls.crt -subj "/CN=joebunga.com' -days 365
```
> **arguments**

- This command **requests** a new **"x509" certificate** which is widely used in **TLS/SSL** protocols that contain a **public key**, while the **private key** generated is stored on the **server** securely. 
- **rsa:4096** is an **encryption cipher** used for **private, public key generation**, and **sha256 is a hash function** used.
- "joebunga.com" is the domain we create the TLS certificate for
- no. of days till it expires is 1 year.

![image.png](/img/blog/container-and-kubernetes-security/uqYBA8nnF.png align="left")

> creating a k8s secret to store sensitive information

```
kubectl create secrets tls joebung-com-tls --cert=tls.crt --key=tls.key
```
- Here we create a **k8s secret** file using the **kubectl** command, where the TLS certificate & private key are stored.

![image.png](/img/blog/container-and-kubernetes-security/DcriIK5Ui.png align="left")

#### TLS on Ingress & Ingress controller
- The **ingress controller exposes** **HTTP** and **HTTPS** routes **from outside the cluster** to **services within the cluster**. Traffic routing is controlled by rules defined on the ingress resource ( ingress.yaml ).
- The **Ingress controller is the point of TLS termination**, where the traffic is encrypted/decrypted.
- The **secrets** can now be **accessed** by the **manifest**, in this case, the "ingress.yml" through the env variable.
- The **Ingress is secured** by **specifying** the **TLS secret** ( joebung-com-tls ) that contains a **private key** and a **certificate**.

![image.png](/img/blog/container-and-kubernetes-security/kQzaDXZ9Y.png align="left")

- **Requests from the internet** are **routed to the cluster services** according to the **rules** defined in the **ingress configuration for the ingress controller** ( eg: Nginx ingress).
- This instructs the **ingress controller to encrypt the communication path** between the **client** and the **controller**.
- The traffic between the controller and the pod is decrypted unless specified.


### Kubernetes Manifest or Cluster Scanning
- **Kubescape is an Open Source tool by ARMO** that is used as risk analysis, security compliance, RBAC visualizer, and image vulnerabilities scanning tool.
- Initially used as a **Manifests vulnerability tool** to **identify hidden vulnerabilities** and **misconfigurations** within the Kubernetes Manifest Files.
- Additionally **evaluates the Kubernetes cluster that is deployed**, and allows us to **rectify** and **validate issues among the resources** while following **k8s best practices** and **policies**.
- Consists of Easy integration with CI/CD pipelines. ( eg: Github actions / Jenkins, etc )

**Scanning Manifests**
```
kubescape scan deployment.yml
```
**Results**

![image.png](/img/blog/container-and-kubernetes-security/5TTvy5ocv.png align="left")
- **For example**, here as I **did not include any resource limits** for my **deployment/pods** it was categorized as a **high severity** issue, as the pods would not have any boundaries for consumption of resources ( **CPU** / **memory** ). 


**Scanning Cluster**
```sh
kubescape scan framework nsa --submit --format pdf --output nsa.pdf 
```
**Scans** your **Kubernetes cluster**, in this case my **minikube** cluster is **scanned**.
![image.png](/img/blog/container-and-kubernetes-security/euSJndPTx.png align="left")

The output of the scan results can be in various formats ( although it is not necessary ), this can be set up by using the following parameters.

```
--format pdf --output results.pdf
--format json --output results.json
```

**Results** ( results.pdf )
![image.png](/img/blog/container-and-kubernetes-security/lys8RS24G.png align="left")
---------------


# Resources Used
[Saiyam Pathak's Container & Kubernetes Security Video](https://www.youtube.com/watch?v=ka0C09CAfho&t=2946s)

[Kubernetes Documentation](https://kubernetes.io/docs/home/)

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.

