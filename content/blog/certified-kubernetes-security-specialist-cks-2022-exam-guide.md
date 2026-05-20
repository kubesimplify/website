---
title: "Certified Kubernetes Security Specialist (CKS) 2022 exam guide"
seoTitle: "Certified Kubernetes Security Specialist (CKS) 2022 exam guide"
seoDescription: "Distributed systems comes with a lot of benefits but there are some downsides as well. One of the main downside of distributed system is security. No. of at"
datePublished: 2022-04-20T12:48:32.139Z
slug: certified-kubernetes-security-specialist-cks-2022-exam-guide
author: aditya-tripathi
cover: /img/blog/certified-kubernetes-security-specialist-cks-2022-exam-guide/HlyoVuRQy.jpg
tags: ["security", "kubernetes", "certification", "k8s"]
cuid: cl27kmf2700inaenv5kd87fzz
---
## Agenda :
- An overview of cloud- native security
- CKS exam details and focus area
- Tips and tricks that can help you  prior to add during the exam
- Learning resources

## Overview of cloud-native security :
Our applications have evolved over years and how we deploy them. Earlier we used to deploy them in a monolithic fashion and now we have a distributed systems. Distributed systems comes with a lot of benefits but there are some downsides as well. One of the main downside of distributed system is security. No. of attack surfaces have increased in the distributed system.

Now security is very important, just you might have read some of the examples of attacks in the past of stolen customer data, critical data of organizations. So all these things play an important role from a security point of view. 

But now when you move to cloud native architecture, microservices architecture, cloud layers, K8s layers you will be having a much bigger attack surface. That's why no. of attacks in the past 2-3 years have increased due to cloud-native adoption. Kubernetes have grown, the cloud has grown, so security at all levels becomes important for you.

Kubernetes security is important throughout the container lifecycle. Due to the distributed, dynamic nature of a Kubernetes cluster. Different security approaches are required for each of the three phases of an application lifecycle: build, deploy, and runtime. Kubernetes provides innate security advantages. Kubernetes Security is based on the 4C’s of cloud native security.

 ### 4C'sof cloud-native security
  - **Cloud**- The underlying physical infrastructure is the basis of Kubernetes security. Most of the Cloud/Datacenter have security best practices.

 When you work with their cloud provider like exposing the internet load, limiting the control plane access, etcd encryption, so every piece of the puzzle should be secured there are tools to do that.
  - **Cluster**- In Kubernetes we have 3A(Authentication, Authorization, Admission) which is called cluster layer. In CIS scan they are important so 3A's play very critical role in Kubernetes security, when we talk about that which user can do what in Kubernetes cluster.

 CIS benchmarking guide NSA guide  which tells you the best practices to setup Kubernetes cluster in a right way. So their are CIS scan you can do on your cluster to know the cluster score with respect to CIS benchmark. 
  - **Container**- In Container you are creating images, so you are using docker file best practices or any container to build images. Avoiding granting unnecessary privileges to users in the container, and ensuring that containers are scanned for vulnerabilities at build time.
  - **Code**- Code presents a major attack surface for any Kubernetes environment. Simple policies such as encrypting TCP using TLS handshakes, not exposing unused ports, scanning, and testing regularly can help prevent security issues from arising in a production environment.
    
![IMG_20220413_115536.jpg](/img/blog/certified-kubernetes-security-specialist-cks-2022-exam-guide/Rt17p4Phk.jpg)

## CKS exam :
   The certified Kubernetes Security Specialist (CKS) program provides assurance that a CKS has the 
   skill, knowledge, and competence on a broad range of best practices for securing container-based 
   applications and Kubernetes platforms during build, deployment and runtime.
 - The exam is of 2 hours
 - CKA is a prerequisite
 - Kubernetes 1.23
 - 2 Year validity
 - Get 2 attempts
 - Documentation access- [Kubernetes](https://kubernetes.io/docs/home/), [aqua security](https://github.com/aquasecurity/trivy), [sysdig](https://docs.sysdig.com/), [falco](https://falco.org/docs/), [apparmor](https://gitlab.com/apparmor/apparmor/-/wikis/Documentation)
 - You will get access to killer.sh/cks portal for CKS practice exam.
 - Certification cost $375

## CKS exam focus areas :

CKS exam aims to test your skills on different security aspects. The following table shows the different domains and their weightage for the CKS certification.

![CKS.jpg](/img/blog/certified-kubernetes-security-specialist-cks-2022-exam-guide/_eeUb1Ft_.jpg)

 Let's have a look and discuss syllabus-wise resources for the CKS exam :-

### 1. Cluster Setup [10%]
The first section focuses on controlling access to the Kubernetes cluster and security aspects of the cluster components. This section carries 10% weightage in the CKS.

** (a)- Network Policies  **

By default network access between Kubernetes pods is open internally. Use Network security policies to restrict cluster level access. There is a security risk associated with this setup is a container being able to access and connect to other workloads within the cluster network.

Kubernetes network policies help you to enable rules for pod network communication.
- [Use Network security policies to restrict cluster level access](https://kubernetes.io/docs/concepts/services-networking/network-policies/)

- [Declaring Kubernetes Network Policy](https://kubernetes.io/docs/tasks/administer-cluster/declare-network-policy/)

- [Network Policy Editor](https://editor.cilium.io/)

** (b)- CIS benchmark **

 Center for Internet Security(CIS) Benchmarks goal is to make every resource running on the Net to be as secured as possible. [CIS](https://www.cisecurity.org/cis-benchmarks/cis-benchmarks-faq) with the Kubernetes community has created the benchmarks for Kubernetes security standards. Organizations can use the Kubernetes CIS benchmarks to achieve security and compliance requirements. 


[kube-bench](https://github.com/aquasecurity/kube-bench#running-kube-bench) is an open-source tool that runs validation of the Kubernetes components using the CIS benchmarks.

** (c)- Ingress TLS **

Kubernetes Ingress is another concept that will be in the exam. From a security standpoint, for Ingress, the primary focus is on configuring ingress with TLS configurations. Also, it would help if you looked at setting up the namespace scoped and cluster-wide ingress.

[IngressClass](https://kubernetes.io/docs/concepts/services-networking/ingress/) was introduced in version 1.18 and helped to specify how different controllers should implement ingress objects. There are [three types of Ingress controller setups](https://docs.nginx.com/nginx-ingress-controller/installation/running-multiple-ingress-controllers/#running-multiple-nginx-ingress-controllers) to be aware of.
- Cluster-wide Ingress Controller (default)
- Single-namespace Ingress Controller
- Ingress Controller for specific Ingress class

** (d)- Protect node metadata and endpoint **

Every virtual machine (nodes) hosted in the cloud would need to access node metadata endpoints for various reasons. Protecting node metadata and endpoints is always a top concern. 

Pod's access to the Metadata server can be controlled via network policies, so only designated resources within K8s could have the ability of contacting node metadata endpoints.
- [Protect node metadata and endpoints](https://kubernetes.io/docs/tasks/administer-cluster/securing-a-cluster/#restricting-cloud-metadata-api-access)
- [Configuring Network Policies](https://cloud.google.com/kubernetes-engine/docs/tutorials/network-policy) 

** (e)- Securing Kubernetes GUI **

This topic is fueled by previous security hacks that exposed the Kubernetes Dashboard to the public. To combat this issue, admins should set up an internal-only facing dashboard with specific user access outlined in their configuration files. You need to learn all the best practices and configurations involved in setting up a secure Kubernetes dashboard. For example, limiting access to the dashboard with specific internal networks, user access with limited privileges to the dashboards, etc.
- [Kubernetes Web UI Configurations](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/)

** (f)- Verify Kubernetes binaries using checksum **

Kubernetes binaries can be verified by referencing their specific checksum. The GitHub release page has the version numbers and SHA ids to verify the binary. So, we are comparing the downloaded file [sha512sum](https://www.getmonero.org/pl/resources/user-guides/verification-allos-advanced.html) with the string provided in the GitHub page.
- [Kubernetes Binaries](https://github.com/kubernetes/kubernetes/releases)

### 2. Cluster Hardening[15%]
It contains 15% weightage in the CKS exam. This section focuses on controlling access to the Kubernetes Cluster environment.

** (a) -Use Role-Based Access Controls(RBAC) to minimize exposure **

 Allowing unnecessary cluster-wide access to everyone is a common mistake done during Kubernetes implementations. With Kubernetes [RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/), you can define fine-grained control on who can access the Kubernetes API to enforce the principle of least privilege. The concepts will include:
- Role = the position that could perform actions
- ClusterRoles = the position that could perform actions across the whole cluster
- RoleBinding = the position that could perform actions
- ClusterRoleBindings = the binding of user/service account and cluster roles

** (b)- Restrict access to Kubernetes API **

When it comes to Kubernetes Production Implementation restricting API access is very important. Restricting access to the API server is about three things:
-  Authentication
-  Authorization
- Admission Control
The primary topics under this section would be bootstrap tokens, RBAC, ABAC, service account, and admission webhooks.
- [Cluster API access methods](https://kubernetes.io/docs/tasks/administer-cluster/access-cluster-api/)
- [Kubernetes API Access Security](https://kubernetes.io/docs/concepts/security/controlling-access/)
- [Authentication](https://kubernetes.io/docs/reference/access-authn-authz/authentication/)
- [Authorization](https://kubernetes.io/docs/reference/access-authn-authz/authorization/)
- [Admission Controllers](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/)
- [Admission Webhooks](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/)

** (c)- Service Account **

The topic is to ensure administrators are not giving service accounts within Pods to have permissions besides required. The default service account does not have any privileges. But if you bind a role to it, it will get all the access listed in the role, and it applies to all the pods in the namespace.
- [Service Account Management Guide](https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/)
- [Configure service account for a Pod](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/)

** (d)- Update Kubernetes Frequently **

There may be an upgrade question as the documentation about upgrading with kubeadm has been significantly better in recent releases. 
Also, you should have mechanisms to validate the cluster components, security configurations, and application status post-upgrade.
- [Upgrading Kubernetes cluster using Kubeadm](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/)
- [Upgrade a cluster](https://kubernetes.io/docs/tasks/administer-cluster/cluster-upgrade/)

### 3. System Hardening [15%]
This section focuses on minimizing the attack surface in the cluster as well as kernel access.

The common system hardening activities are :-
- Minimize host OS footprint (reduce attack surface)
- Minimize Identity and Access Management (IAM) roles
- Minimize external access to the network
- Appropriately use kernel hardening tools such as 
   [AppArmor](https://kubernetes.io/docs/tutorials/security/apparmor/) or [seccomp](https://kubernetes.io/docs/tutorials/security/seccomp/)

### 4. Minimize Microservice Vulnerabilities[20%]
As the title suggests, this section focuses on minimizing microservice vulnerabilities and securing pods at runtime.
** (a)- Setup appropriate OS-level security domains using options such as Pod Security Policies (PSP), Open Policy Agent (OPA), and security contexts **

Open Policy Agent is a great utility for implementing fine-grained controls for microservices.
- [PSP](https://kubernetes.io/docs/concepts/security/pod-security-policy/)
- [OPA](https://kubernetes.io/blog/2019/08/06/opa-gatekeeper-policy-and-governance-for-kubernetes/)
- [Security Context Task](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)

** (b)- Manage Kubernetes secrets **

It focuses on knowing how to implement secrets securely and ensure that other containers cannot access the secrets. Kubernetes secret is one of the ways to save sensitive information inside the pod. But, it is not encrypted. However, you can encrypt the data at rest.
- [Kubernetes Secret](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Task](https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/)

** (c)- Use container runtime sandboxes in multi-tenant environments (e.g. gvisor, kata containers) **

Before the open container initiative (OCI) proposed to have Container Runtime Interface(CRI), the communication between containers and Kubernetes (K8s) was relying on dockershim/rkt provided and maintained by Docker. However, when containers and K8s are getting more and more sophisticated, the maintenance cost of dockershim/rkt becomes higher and higher. Therefore, having an interface that opens to the open source community and for solely dealing with container runtime becomes the answer to this challenging situation.

[Kata Containers](https://katacontainers.io/) and [gVisor](https://github.com/google/gvisor) helps in workload isolation. It can be implemented using the Kubernetes RuntimeClass where you can specify the required runtime for the workload.

** (d)- mTLS **

[mTLS](https://stackoverflow.com/questions/19601420/mtls-mutual-tls-details) stands for mutual authentication, meaning client authenticates server and server does the same to client, its core concept is to secure pod-to-pod communications. In exams it may ask you to create the certificates. However, it is worth bookmarking [certificate signing requests](https://kubernetes.io/docs/reference/access-authn-authz/certificate-signing-requests/#create-private-key) and understanding how to implement kubeconfig access and mTLS authentication credentials.

### 5. Supply Chain Security [20%]
This section focuses on supply chain security.

** (a)- Minimize base image footprint **

Regardless of how this is implemented in the test, [minimizing your base images](https://cloud.redhat.com/blog/container-image-security-beyond-vulnerability-scanning) is always a good idea to decrease the attack surface for your containers. In exam there may be a question that requires using [Trivy](https://github.com/aquasecurity/trivy) to view CVEs related to a base image and then prioritizing image selection accordingly. As a core concept, image scanning and minimizing your images is a handy way to lower the attack surface within your cluster.

** (b)- Secure your supply chain: whitelist allowed registries, sign and validate images **

Securing the images that are allowed to run in your cluster is essential. It’s important to verify the pulled base images are from valid sources. This can be done by [ImagePolicyWebhook](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#imagepolicywebhook) admission controller.

** (c)- Use static analysis of user workloads (e.g. Kubernetes resources, Docker files) **

This is totally straightforward. You will need to vet the configuration of Kubernetes YAML files and Docker files and fix any security issues.
- [Statically Analyze YAML](https://kubernetes.io/blog/2018/07/18/11-ways-not-to-get-hacked/#7-statically-analyse-yaml)

** (d)- Scan images for known vulnerabilities **
To ensure container images are always without security concern. Trivy was developed for this sole purpose and it is extremely easy to use. In exam you are allowed to use the GitHub documentation, so it’s worth bookmarking the [quick start documentation].(https://github.com/aquasecurity/trivy#quick-start) 

### 6. Monitoring, Logging and Runtime Security [20%]
This section focuses on monitoring, logging, and runtime security within the cluster.
Following are the core concept in it :-

** (a)- Perform behavioral analytics on syscall process and file activities at the host and container level to detect malicious activities **
- [Restrict a Container’s Syscalls with Seccomp](https://kubernetes.io/docs/tutorials/security/seccomp/)

** (b)- Detect threats within a physical infrastructure, apps, networks, data, users, and workloads **
- [Using Falco for threat detection](https://falco.org/docs/)

** (c)- Detect all phases of attack regardless of where it occurs and how it spreads **

** (d)- Perform deep analytical investigation and identification of bad actors within the environment **
- [Implementing Kubernetes Auditing](https://kubernetes.io/docs/tasks/debug-application-cluster/audit/)

** (e)- Ensure immutability of containers at runtime **

** (f)- Use Audit Logs to monitor access **
- [Kubernetes Auditing](https://kubernetes.io/docs/tasks/debug-application-cluster/audit/)

## Tips and Tricks :
- **Bookmarks handy** - You are allowed to open Kubernetes documentation, so you can bookmark some Kubernetes [blogs](https://kubernetes.io/blog/) and [docs](https://kubernetes.io/docs/home/). Also allowed to browse other domains like https://falco.org/docs/ but that’s an exception, but you are allowed only one tab so make sure don't open another tab. When you close the tab then only you can open another bookmark, which is very handy
- **--dry-runflag** - Gives you the skeleton of YAML, so you don't have to actually search inside the Kubernetes documentation which becomes very handy for you. If you are coming from CKA then you know it.
- **Time management** - It is very important to manage the time, check whether the question has less or more steps, and don't get stuck on a single question for a long time. 
- **Higher weightage first** - There is a difficult question having lower weightage and easy question having higher weightage. So always see the weightage and the time it takes and go for easy question first. Basically the more weightage questions first rather then the difficult one consuming your time and not giving the score that you get by doing easy questions.
- **Take a backup of your files before making changes to kube-server or falco files**  - Sometimes what happen is that you are asked in the scenario to change some of the parameter and stuff like that, if you directly did vim and change the file and something go wrong and your Kubernetes server get blocked, then it become very difficult to troubleshoot over their, so always take backup/copy of the files provided before modifying them directly!
- **Use aliases** - It’s worth adding an alias like k=kubectl, v=vim, it will save your precious time and typing (since you’re there add kg='kubectl get' and kd='kubectl describe' ) and many more.
- **Be comfortable with --force while deleting** - Be comfortable with the force commands because sometimes you might see something in a terminating state and you have to delete that , so  make sure you use --force flag.
- **K8s documentation navigation** - You should be very handy in searching through the  K8s documentation that is also very important.

## Resources :
- Editor.cilium.io for Network policy
- Container security and Kubernetes security books
- [CKS scenarios book](https://saiyampathak.gumroad.com/l/cksbook/) by Saiyam Pathak
- [Walidshaari CKS repository](https://github.com/walidshaari/Certified-Kubernetes-Security-Specialist)
- Kubernetes [documentation](https://kubernetes.io/docs/home/), [blog](https://kubernetes.io/blog/), 
   [github repo](https://github.com/kubernetes/)
- [CNCF curriculum](https://github.com/cncf/curriculum)
- [Killer.sh CKS course](https://www.udemy.com/course/certified-kubernetes-security-specialist/?referralCode=D9329DEE203E7FEBE86B&couponCode=K8S-CKS-3)
- [KodeKloud](https://kodekloud.com/courses/certified-kubernetes-security-specialist-cks/) for CKS course
- [Killercoda](https://killercoda.com/killer-shell-cks) for CKS environment
- Locally - K3s, Kind
- Cloud - managed Kubernetes like [Civo](https://www.civo.com/), [GKE](https://cloud.google.com/kubernetes-engine)

## Conclusion :
This is the ultimate guide to the Certified Kubernetes Security Specialist exam (CKS). I have covered the most important resources required to ace the CKS exam. It would be really helpful to you.
