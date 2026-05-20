---
title: "Introduction to Terraform."
seoTitle: "What is Terraform"
datePublished: 2022-03-30T04:27:14.162Z
slug: introduction-to-terraform
author: nitin-gouda
cover: /img/blog/introduction-to-terraform/-gMS0xv8P.png
tags: ["automation", "devops", "terraform"]
cuid: cl1d2guq102lyzanv0a4z1m1h
---
## **What is Terraform?**   
Terraform is an open-source **Infrastructure As a Code** (IAC) software tool created by HashiCorp. It allows you to automate and manage your infrastructure and your platform and the services that run on the platform. 
It uses declarative language.  

>  Declarative language: meaning you don't have to declare every step on how the automation and management are done you just have to add what you want and the final result and Terraform will figure out how to do it.

> Imperative Language: meaning you have to define exact steps on how you have to execute. 

Terraform is a tool for infrastructure provisioning meaning 
for eg., You started a project where you created an application and you want to create an infrastructure from scratch where the application will be running. So let's say we want to spin up some servers deploy some microservice applications as Docker containers and also deploy a database container and choose AWS to build your whole infrastructure on.   

![Screenshot 2022-03-26 at 10.16.44 PM.png](/img/blog/introduction-to-terraform/uITNDQy-K.png)

**Some of the steps you will follow to prepare Infrastructure so that application can be deployed will be to create a **
1. private network space.
2. EC2 server instances.
3. Install Docker and other tools you need 
4. Security or add firewalls or networks etc.
Once you have prepared the infrastructure you can deploy your application. 

We can divide these into two different tasks:
a. Provisioning Infrastructure so that application can be deployed.
b. Deploying application.

## You might wonder where does Terraform comes into the picture??     

-> Terraform is used for provisioning the infrastructure to deploy the application.     
- Like creating VPC (it is a virtual network specific to you within AWS for you to hold all 
your AWS services).       
- Spinning up the servers.     
- Create AWS users and permissions.    
- Installing Docker of a specific version on the server.    

> All of these need to be done in the correct order because one task maybe depends on another.

![TerraformVsAnsible.png](/img/blog/introduction-to-terraform/BHAxzpjaZ.png)

## Difference between Terraform and Ansible?

According to official documentation both does the same thing and sound like the same tools but are not.      
Terraform and Ansible are both IAC(Infrastructure as code) meaning they are both used to automate, provisioning, configure and manage the infrastructure. 
- Terraform is relatively new and Ansible is mature.   
- Terraform is much more advanced in orchestration and is changing dynamically.
- Managing can be done very easily using terraform
- Terraform mainly focuses on Infrastructure provisioning tools and can also deploy apps.     

Ansible on the other hand is mainly a configuration tool so once the infrastructure is provisioned Ansible can be used to 
- configure that infrastructure.
- deploy applications 
- install/update software etc.

We can say that both overlaps in what each does where Terraform is better for infrastructure and Ansible are better for configuring that infrastructure. So the best practice would be to use the combination of both and set up end to end.

## Terraform Architecture
![tf config file.png](/img/blog/introduction-to-terraform/UBPPyFjxx.png)

Terraform has **two main components** that make up its architecture.
- Core: It uses two input sources to do its job      
  a. Terraform config file which you create on what should be created and provisioned.      
  b. Terraform State where it keeps the up-to-date state of setup. 
So core takes the inputs and figures out what should be done. So it compares the current state and desired state so it checks if you want something else Terraform figures out what needs to be done and completes it to get the desired state.
- Providers: Cloud providers like AWS, Azure, GCP, etc, and Terraform also have some high-level providers like Kubernetes, etc.
> [Cloud Providers Lists](https://registry.terraform.io/browse/providers)

**Example of Configuration File: 
**![Screenshot 2022-03-26 at 11.46.54 PM.png](/img/blog/introduction-to-terraform/todnYgu_L.png)

## Some Basic Terraform commands:

- `terraform refresh` command: Queries infrastructure provider to get the current state.

- `terraform plan` command:  create an execution plan on what actions are necessary to achieve the desired state.

- `terraform apply` command: executes the plan. Basically, if you want to execute the changes you just have to use the apply command

- `terraform destroy` command: destroys the whole setup/elements in proper order.

I hope you have got some basic idea on Terraform. Here's the link to their official page so do check out! 
[Terraform](https://learn.hashicorp.com/terraform). 

Join the awesome kubesimplify community for more such blogs!
