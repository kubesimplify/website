---
title: "Cloud Computing"
datePublished: 2022-06-08T12:26:13.602Z
slug: cloud-computing
author: arnav-barman
cover: /img/blog/cloud-computing/tMKlH_qhM.png
tags: ["cloud", "paas", "saas", "cloud-computing", "devops"]
cuid: cl45kegw1002uiynv91iuaweb
---
### Introduction

Cloud computing is the delivery of on-demand computing resources such as data storage, computational power, servers, analytics, intelligence, and much more over the internet on a pay-as-you-go basis; resources are dynamically assigned and reassigned among multiple users and scale up and down in response to users’ needs. These resources are hosted at a  remote data center, which is managed by a cloud service provider (CSP).

![Magic-Quadrant-for-Cloud-Infrastructure-and-Platform-Servicestarget.png](/img/blog/cloud-computing/KZ08D8nQH.png align="center")
The above image shows the magic quadrant for cloud infrastructure and platform services as cited by [Gartner](https://www.gartner.com/doc/reprints?id=1-271OE4VR&ct=210802&st=sb) for the major CSPs.

#### Advantages
Some advantages of cloud computing over the traditional, on-premises IT are:
- Lower infrastructure costs
 - We offload the cost of purchasing, setting up, and managing the physical hardware.
- Improved agility
 - The waiting time to set up and configure IT resources is cut short to such an extent that access to computing resources is just minutes away in a cloud environment.
- Scalability
 - Resources can be acquired and used on a demand basis, we can spread our applications globally using the CSP's global network of data centers.


![cloudmodel.png](/img/blog/cloud-computing/_37aRW9u7.png align="center")

#### Some Important terms
Before we move forward, there are a few terms we must be familiar with:
1. Virtualization: Creation of multiple virtual machines with their own OS on a single physical node, allowing for efficient usage of physical resources. 
1. Virtual Machines(VM): It is an emulation of a physical computer, i.e. a virtual environment acting as a physical computer. Established as a guest on the parent node using a hypervisor.
1. Hypervisor: A layer of software that directs and allocates the node's resources to VMs, ensuring they don’t disrupt each other.
1. Containerization: A virtualization alternative where we encapsulate applications in containers with their own operating environment, instead of installing a separate OS for each VM, containers use the same OS, the host OS. Hence, it is lightweight and uses fewer resources when compared to the virtualization method.


![Untitled (1).png](/img/blog/cloud-computing/Ja1LJSHDW.png align="center")

### The Essential Characteristics of cloud computing
1. On-demand Self-service
 - Access to cloud resources is possible through a simple interface, without any human interaction with a CSP. 

1. Broad Network Access
 - Accessing the cloud resources via network through the standard mechanisms and platforms such as computers, workstations, and tablets. 

1. Resource Pooling
 - Gives scalability to CSPs, which makes cloud cost-efficient by using a multi-tenant model. Here, computing resources are pooled and dynamically provided to serve multiple consumers, without the concern of the physical location of these resources. 

1. Rapid Elasticity
 - Provision to access resources as and when needed, and scale back when you're done. 

1. Measured Service
 - The resource usage is monitored and measured on the basis of utilization by the CSP. The user pays only for the resources reserved. This makes the consumption of computing resources cost-efficient.


![cloud-storage.png](/img/blog/cloud-computing/pc-4i3PMB.png align="center")

### Service Models

#### 1. Infrastructure as a Service (IaaS)
- It delivers fundamental computing, network, and storage resources to consumers, over the internet.
- The CSP hosts the traditional 'raw' IT infrastructure and the hypervisor layer.
- Customers can create VMs and deploy middleware, install applications and run workloads on these VMs. The customers can also allocate storage for backup and workloads.
- The providers manage physical data centers, hypervisors, and networking resources. 
- Not only do they provide the required high-performance computing, but also make it economically viable.

![Untitled.png](/img/blog/cloud-computing/TR8_VyLEJ.png align="center")

#### 2. Platform as a Service (PaaS)
- It provides a complete platform to Develop, Deploy, Run, and Manage applications.
- The CSP is responsible for the management, configuration, and setting up of each and every resource except for the application code and its management, which is taken care of by the consumer.
- It provides a high level of abstraction to the consumer by getting rid of most of the complexity involved. It also provides services and APIs to simplify the job of a developer.
- It is built around containers nowadays. 
- Some common use-cases for PaaS are IoT, API creation, and much more.

#### 3. Software as a Service (SaaS)
- A ready-to-use application software that’s hosted on the cloud. It can be accessed and used via a web browser, a dedicated desktop client, or an API.
- The application, as well as the infrastructure, is managed by the provider.
- It increases the productivity and efficiency of the user by providing global access to the application.
- It works on a subscription-based model with scalable resources and possibility of customizations.

![whimanageswhat.png](/img/blog/cloud-computing/m2JY0sy_1.png align="center")

#### Real Life Example
Let us take an example of a car. Now, consider **Leasing** a car as the IaaS model, **Renting** it as the PaaS model, and taking a **Taxi** instead as the SaaS model. Let me explain to you here, that how this analogy matches with the Service models. 
- Now, when you lease a car, you are the one who has done all the research about its specs, you are the one driving it, and you are the one who is paying for its fuel and tolls similar to all the work that you have to pay attention to when choosing IaaS. 
- In case you are renting a car, you don't care about the specs the car has, you don't care about its color and all, but you still are the one who is driving and paying for its expenses similar to the PaaS model where you just have to worry about the application code, data, and payment. 
- While in a taxi, you need not worry about anything, you don't need to drive, care about the specs and all, you just need to pay for the ride, similarly in SaaS you just need to pay for the service you are using and leave the rest to the CSP.

### Deployment Models
Deployment models indicate where the infrastructure resides, who owns and manages it, and how cloud resources and services are made available to users.
#### 1. Public Cloud
- Here, the CSP makes the computing resources available to the users over the public internet. It is a virtualized multi-tenant architecture where the infrastructure is shared amongst every public cloud customer.
- The vendor owns, manages, and maintains the resources which can be provisioned by a user through web consoles or APIs.
- The user here does not have any control over the performance and security levels of the computing environment and is bottle necked by the standards of the vendor.
- The services offered by the public cloud are elastic and readily scalable as per the workload, hence it is preferred by many organizations.

#### 2. Private Cloud
- This is a type of cloud environment where the complete infrastructure and resources are available for use by just a single customer.
- It combines the benefits of the cloud with that of on-premises infrastructure. It adds access control, security, and resource customization features to the easy scalability and flexibility of the cloud.
- When this model is implemented at the customer organization itself, it as to be managed and run by the organization. But, when it is offered by a CSP it is called a virtual private cloud (VPC) as it is a logically isolated computer environment in the shared public cloud.
- It provides the customer with the features of the public cloud while also giving it the necessary security and regulatory controls.

#### 3. Hybrid Cloud
- It is exactly what it sounds like, a combination of public and private cloud environments.
- Here, an organization’s on-premise private cloud and third-party, public cloud are connected as a single, flexible infrastructure to leverage the best of both worlds.
- The organization can thus run the information-sensitive workloads on the private cloud infrastructure and offload the rest of the tasks onto the public cloud.

#### Real Life Example
Let us take an example of commutation here, it is a self-explanatory analogy to the deployment models. Here, we can consider taking a **Bus** for the commute as the Public model, taking our own **Car** as the Private model, and taking a **Taxi** instead of the bus or the car as the Hybrid model. 


![cloud-network.png](/img/blog/cloud-computing/9TcEDukdI.png align="center")

### Cloud Infrastructure
It consists of the resources needed to run a cloud model smoothly. This differentiates it from the cloud architecture, which is like the blueprint of the cloud. Cloud infrastructure includes data centers, storage, network components, and compute resources. It consists of an interface for accessing the virtual resources that are created by the hypervisor. The hypervisor abstracts the physical resources and pulls them into the cloud. There can be various types of VMs used for this purpose like:
 1. Shared or Public cloud VMs
 1. Transient or Spot VMs
 1. Reserved VMs
 1. Dedicated hosts that provide single-tenant isolation (bare-metal)



### Resources
- [Cloud Computing in 6 minutes](https://youtu.be/M988_fsOSWo)
- [Virtualization](https://www.ibm.com/cloud/learn/virtualization-a-complete-guide)
- [Magic Quadrant for CIPS](https://www.gartner.com/doc/reprints?id=1-271OE4VR&ct=210802&st=sb)

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.

Liked the explanation? Want to connect? You can find me [here](https://linktr.ee/arnav_barman). Till then, happy learning!



