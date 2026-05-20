---
title: "Multi tenancy in 2025 and beyond"
seoTitle: "Multi-tenancy in 2025 and beyond"
seoDescription: "Multi-tenancy in Kubernetes has been an ongoing challenge for organizations looking to optimize their cloud-native infrastructure. Over the years, the appro"
datePublished: 2025-03-12T06:11:58.485Z
slug: multi-tenancy-in-2025-and-beyond
author: saiyam-pathak
cover: /img/blog/multi-tenancy-in-2025-and-beyond/d2ee68da-af2b-4dca-b0cb-1c2a128f9939.png
tags: ["kubernetes", "cluster", "argocd", "multitenancy"]
cuid: cm85ivudx000709l74i7n9jc9
---
Multi-tenancy in Kubernetes has been an ongoing challenge for organizations looking to optimize their cloud-native infrastructure. Over the years, the approach to multi-tenancy has evolved from simple namespace isolation to virtual clusters and, more recently, full-fledged internal Kubernetes platforms (IKPs) that enable shared platform stacks across teams.

With Kubernetes adoption continuing its upward trend, the real challenge for organizations today is not just adopting Kubernetes but managing it at scale. The widespread cluster sprawl, where companies create separate clusters for each team, environment, or workload, has led to escalating operational complexity and rising costs. According to the CNCF, over 70% of organizations report Kubernetes over-provisioning as a major source of cloud spend. This makes efficient multi-tenancy a necessity rather than a luxury.

Let’s explore how shared platform stacks and internal Kubernetes platforms are shaping the future of multi-tenancy in 2025.

![](https://miro.medium.com/v2/resize:fit:1400/1*9x7xmmr7BmIka1VWp-nYUw.png align="left")

# **What is Multi-Tenancy in Kubernetes?**

Multi-tenancy means dividing a Kubernetes cluster into multiple isolated environments so that different teams or applications can share infrastructure while maintaining security, autonomy, and fair resource usage.

To understand this better, let’s take an analogy where you are looking for an accommodation:

* Renting an entire house gives you full control but comes with high maintenance costs — similar to having a dedicated Kubernetes cluster per team or application.
    
* Renting an apartment in a shared building gives you personal space but reduces overhead, as maintenance is handled collectively where you have shared access to facilities like elevators, swimming pool, park etc., this is how multi-tenancy works in Kubernetes.
    

Instead of spinning up an entirely new Kubernetes cluster for every team, organization, or workload, you partition a single cluster into multiple isolated environments.

The three key pillars of true multi-tenancy are:

1. Isolation — Ensuring security boundaries between tenants.
    
2. Fair Resource Usage — Preventing noisy neighbor issues.
    
3. Tenant Autonomy — Allowing teams to self-manage workloads independently.
    

![](https://miro.medium.com/v2/resize:fit:1400/1*6MGIiOJsO-oQdFNH6Tx8BQ.png align="left")

# **Traditional Multi-Tenancy Approaches & Their Limitations**

Natively within Kubernetes, there is a concept of namespaces, which is useful as many resources can be scoped to a namespace to create some level of isolation.

* Workload isolation can be achieved to a certain extent by using pod security standards and preventing privileged access with custom policy engines like Kyverno or jsPolicy. Additionally, you can define a well-structured network policy to restrict traffic to and from pods. When different teams have only namespace-level isolation, you may want to prevent them from communicating with each other while still allowing them to interact with the Kubernetes API. An example of this scenario can be as follows:
    

```plaintext
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-policy
  namespace: tenant-1
spec:
  policyTypes:
    - Egress
  egress:
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
            except:
            - 100.64.0.0/10
            - 127.0.0.0/8
            - 10.0.0.0/8
            - 172.16.0.0/12
            - 192.168.0.0/16
        - namespaceSelector:
            matchLabels:
              tenant: tenant-1
    - ports:
        - port: 53
          protocol: UDP
        - port: 53
          protocol: TCP
    - ports:
        - port: 443
        - port: 8443
      to:
        - ipBlock:
          cidr: ${KUBE_API}/32
```

* For managing resource usage, you can use Kubernetes objects like ResourceQuota to define the limit of resources that can be created within a cluster. You can also add LimitRange to set CPU and memory limits.
    

While these namespace-level resources help create some isolation, achieving true multi-tenancy is still challenging due to several factors:

* It becomes difficult as the number of tenants increases.
    
* How do you distribute different kubeconfigs per team?
    
* How is cluster-level resource access, such as CRDs, managed?
    
* Is resource sharing still an issue?
    
* How do you handle different cluster versions?
    
* What about different versions of an application?
    
* There is still a single control plane and a single state for the cluster.
    

Yes, multi-tenancy is hard if we rely solely on native Kubernetes constructs. Even with these measures, automating the entire process instead of manually defining everything is a major challenge.

# **How vCluster Enables True Multi-Tenancy**

vCluster is an open-source tool that helps you create virtual Kubernetes clusters, each with its own control plane components and cluster state, in an automated way.

When you create a virtual machine in your cloud account, you gain full access to that virtual machine, but it is actually a slice of physical hardware in a data center. Similarly, a virtual cluster is a slice of a Kubernetes cluster, you have full access to it and complete ownership, but ultimately, it is still a part of a larger Kubernetes cluster.

How does vCluster work?

![](https://miro.medium.com/v2/resize:fit:1400/1*TOkTbREcaM6HQR0-6l3t4w.png align="left")

Instead of managing multiple Kubernetes clusters, you can now have a single Kubernetes cluster and use the vCluster CLI to create virtual clusters. These virtual clusters can reuse the host cluster’s resources, such as Cert Manager, NGINX Ingress Controller, Vault, and more. Each virtual cluster will have its own independent kubeconfig file, allowing teams to deploy their workloads independently. This approach is more secure than namespace-based isolation because each virtual cluster has its own control plane and state (with options like SQLite, embedded etcd, or external etcd)

![](https://miro.medium.com/v2/resize:fit:1400/1*ISHQkPJcYg8MSd_raDDyEQ.png align="left")

With vCluster Enterprise, organizations can also gain features like multi-cluster tenancy, enhanced security policies, and automated tenancy provisioning.

# **The Evolution of Multi-Tenancy: Shared Platform Stacks & Internal Kubernetes Platforms (IKPs)**

## **1\. Shared Platform Stack: The Key to Efficiency**

![](https://miro.medium.com/v2/resize:fit:1400/1*s_p_j5GoX0rb77yOf_DG2A.png align="left")

Imagine three teams: A, B, and C, each needing their own Kubernetes cluster. As administrators, we create three separate Kubernetes clusters. By default, a newly created cluster only runs the essential components needed for Kubernetes itself, such as the control plane components, the cloud controller manager etc.

Now, if all three teams need to deploy applications with HTTPS support, the typical approach is to install an Ingress Controller and cert-manager. Each team then creates Deployments, Services, Ingress, and Certificate objects. However, since these components need to be installed on every cluster separately, this results in duplicate resources.

This duplication problem also exists in multi-tenancy. One of the biggest challenges in Kubernetes multi-tenancy is the shared platform stack. Ideally, we should be able to reuse resources from the host cluster instead of installing cert-manager and an Ingress Controller in every new cluster.

The easiest way to solve this problem is by using virtual clusters. With vCluster, you can define in the cluster configuration file which resources should be synced from the host cluster, allowing multiple tenants to share platform resources. This optimizes resource utilization and eliminates unnecessary duplication.

This concept of a shared platform stack in a multi-tenant Kubernetes environment using virtual clusters helps organizations efficiently manage resources and is crucial when you are creating an internal Kubernetes platform.

## **2\. Internal Kubernetes Platforms (IKPs)**

We believe that an Internal Developer Platform (IDP) is evolving, with Kubernetes becoming the de facto choice for these platforms. Kubernetes is a technology well-suited for building platforms, and if you are developing an IDP in 2025 and beyond, you will or should be leveraging Kubernetes.

This is why we believe the shift is towards an Internal Kubernetes Platform (IKP), where multi-tenancy will play a crucial role, and vCluster will be at the center.

With vCluster integrated alongside your other cloud-native tooling, you can efficiently provision and manage Kubernetes clusters for your teams, making Kubernetes more accessible while maintaining governance and control.  
IKPs ensure that tenants don’t need to deal with raw Kubernetes, instead, they receive a pre-configured platform tailored to their needs.

We’d love to hear your thoughts on IKPs as well!

# **Future of Multi-Tenancy in Kubernetes**

Organizations are moving towards:

1️⃣ Standardized Shared Platform Stacks — Providing pre-configured Kubernetes environments.  
2️⃣ IKPs for Developer Self-Service — Offering Kubernetes as a managed service within organizations.|  
3️⃣ vCluster & Virtualized Control Planes — Reducing cluster sprawl while maintaining autonomy.

Multi-tenancy is no longer just about namespaces or virtual clusters — it’s about creating an internal Kubernetes ecosystem that allows teams to be productive while keeping infrastructure efficient and manageable.

Throughout March, we’re hosting a Multi-Tenancy March series, featuring webinars, deep dives, and hands-on sessions to explore best practices for Kubernetes multi-tenancy. We will be conducting a hands-on workshop on March 6th, where we will demonstrate this in action, and you’ll have the opportunity to try it out alongside us.

[Register for the webinar here](https://www.vcluster.com/event/seamless-kubernetes-multi-tenancy-with-vcluster-and-a-shared-platform-stack?__hstc=107455133.24d76b7b89d28afebee5af7771225ac7.1741672016640.1741672016640.1741672016640.1&__hssc=107455133.2.1741672016640&__hsfp=3213767220)

Join the [vCluster Slack](https://slack.loft.sh/) to stay updated!

[  
](https://saiyampathak.medium.com/?source=post_page---post_author_info--8bbed5ba5250---------------------------------------)