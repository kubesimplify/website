---
title: "Terraform Best Practices"
seoTitle: "Terraform Best Practices"
seoDescription: "In this blog, I'm going to discuss eight terraform best practices. It will improve your terraform workflows immediately and make you feel more confident"
datePublished: 2022-06-16T12:34:32.221Z
slug: terraform-best-practices
author: aditya-tripathi
cover: /img/blog/terraform-best-practices/Ye5cCZ5ak.png
tags: ["cloud", "git", "devops", "terraform", "ci-cd"]
cuid: cl4h07yy7052vg1nv0birelmu
---
Terraform is one of the most popular infrastructure as code tools out there. And if you have started working with terraform, you may be asking yourself whether you are doing things in the right way. In this blog, I'm going to discuss eight terraform best practices. It will improve your terraform workflows immediately and make you feel more confident. When you use terraform in your projects.

Many of the best practices are around Terraform State and State File. So let's understand what they are first. Terraform is a tool that automates creating infrastructure and making changes and maintaining that infrastructure.

To keep track of the current infrastructure state and what changes you want to make, terraform uses state. When you change configuration in terraform script. It will compare your desired configuration with the current infrastructure state, and figure out a plan to make those desired changes, and the state in terraform is a simple JSON file. And has a list of all the infrastructure resources that terraform manages for you.

** These are Terraform 8 best practices :-**

### (1) Manipulate state only through TF commands
The first best practice is only to change the state file contents through terraform command execution. Do not manually manipulate it, otherwise you may get some unexpected results.

### (2) Always set up a shared remote storage
Now, where does this state file actually come from? When you first execute the `terraform apply` command. Terraform will automatically create the state file locally. But if you're working in a team, then other team members also need to execute terraform commands, and they will also need the state file for that. In fact, every team member will need the latest state file before making their own updates.

So the second-best practice is to configure a "Shared remote storage for the state file". Every team member can now execute terraform commands using this shared state file. In practice remote storage backend for state files can be Amazon S3 bucket, Terraform cloud, Azure, Google cloud etc., and you can configure terraform to use that remote storage as a state file location.

![2nd B.P.png](/img/blog/terraform-best-practices/BVWP0vhTm.png align="left")

### (3) Use State Locking
But what if two team members execute terraform commands at the same time? What happens to the state file when you have concurrent changes? You might get into a conflict or mess up your state file.

To avoid changing terraform state at the same time, we have the next best practice. That is, "Locking the state file" until an update is fully completed and then unlocking it for the next command. This way you can prevent concurrent edits to your state file.

In practice, you will have this configured in your storage backend in S3 bucket. For example, DynamoDB service is automatically used for state file locking. But note that not all storage back-ends support this.
So be aware of that when choosing a remote storage for the state file, if supported, terraform will lock your state file automatically.

![3rd B.P.png](/img/blog/terraform-best-practices/bPwROwXIm.png align="left")

### (4) Back up your state file
Now what happens, if you lose your state file something may happen to your remote storage location or someone may accidentally override the data, or it may get corrupted. To avoid this, the next best practice is to "Back up your state file". In practice, you can do this by enabling versioning for it, and many storage backends will have such a feature. Like in S3 bucket for example you can simply turn on the versioning feature this also means that you have a nice history of state changes, and you can reverse to any previous terraform state if you want to.

![4th B.P.png](/img/blog/terraform-best-practices/S5ErhuRjq.png align="left")


### (5) Use 1 State per Environment
Now you have your state file in a shared remote location with locking enabled and file versioning for backup. So you have one state file for your infrastructure. But usually you will have multiple environments like development, testing and production. So which environment does this state
file belong to?

Can you manage all the environments with one state file? And this is the next best practice, "To use one dedicated state file per environment". And each state file will have its own storage backend with locking and versioning configured. These were best practices related to terraform state.

![5th B.P.png](/img/blog/terraform-best-practices/QEg9e4jsk.png align="left")

### (6) Host Terraform scripts in Git repository
When you're working on terraform scripts in a team, it's important to share the code in order to collaborate effectively. So as the next best practice, you should actually host terraform code in its own
git repository just like your application code. This is not only beneficial for effective collaboration in a team, but you also get versioning for your infrastructure code changes. So you can have a history of changes in your terraform code.

### (7) Continuous Integration for Terraform code
Now, who is allowed to make changes to terraform code? Can anyone just directly commit changes to the git repository? The best practice is actually to treat your terraform code just like your application code. 

This means you should have the same process of reviewing and testing the changes in your
infrastructure code as you have for your application code. With a continuous integration pipeline, using merge requests to integrate code changes. This will allow your team to collaborate and produce quality infrastructure code which is tested and reviewed.

![7th B.P.png](/img/blog/terraform-best-practices/pb8pz0O_y.png align="left")

### (8) Apply Terraform only through CD pipeline
So you have tested and reviewed code changes in your git repository. Now, how do you apply them to the actual infrastructure? Because eventually you want to update your infrastructure with those changes. The final best practice is to execute terraform commands to apply changes in a continuous
deployment pipeline.

So instead of team members manually updating the infrastructure by executing terraform commands from their own computers. It should happen only from an automated build. This way you have a single location from which all infrastructure changes happen, and you have a more streamlined process
of updating your infrastructure.

![8th B.P.png](/img/blog/terraform-best-practices/XEhPFAXIH.png align="left")

These are the 8 terraform best practices you can apply to make your terraform projects more robust and easier to work on as a team. Hope it will help you😊

 Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.
