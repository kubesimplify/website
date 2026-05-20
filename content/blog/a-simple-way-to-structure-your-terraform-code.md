---
title: "A simple way to Structure your Terraform code"
seoTitle: "A simple way to structure your Terraform code"
seoDescription: "This article helps users structure their terraform code in a way that is easily readable and reduces the blast radius."
datePublished: 2022-04-13T12:29:23.875Z
slug: a-simple-way-to-structure-your-terraform-code
author: leon
cover: /img/blog/a-simple-way-to-structure-your-terraform-code/R1dayBJSz4.png
tags: ["blogging", "aws", "devops", "infrastructure", "terraform"]
cuid: cl1xjuuh000eq76nv60d21rhj
---
### Basic Structure
Writing Terraform code is like connecting wires to a network switch(I'm not a Network Engineer), but you get the sentiment(we've all seen how bad wires can get).

When you start writing Terraform code everything is usually in the same folder, this might be good for projects that have a few instances or if you need to start your project quickly.

Your structure would look like this.
```
.
├── backend.tf
├── db-instance.tf
├── iam.tf
├── igw.tf
├── provider.tf
├── s3.tf
├── subnets.tf
├── variables.tf
└── vpc.tf
```
This is pretty good and straightforward for beginner projects and smaller projects, but slowly you will add more resources, and you'll soon be waiting for Terraform to finish refreshing all the 20 resources every time you make a change to your code.  This is one of the reasons, the other reason is there is something called a blast radius, blast radius is basically a term that means how much of your Infrastructure can be accidentally deleted.

The last and main reason is to keep your sanity intact(I've read a few terraform horror stories).

### Writing Better Code
What you should do is split your code into logical sections.
For example, you have a "production" and a "non-production" environment. So you can create two separate folders, inside those you logically split the resources into sub-folders. Something along the lines of this.

```
production/
├── backend
│   ├── dyanmodb.tf
│   ├── outputs.tf
│   ├── s3-backend.tf
│   ├── terraform.tf
│   ├── terraform.tfvars
│   └── variables.tf
├── cloudwatch
│   ├── main.tf
│   ├── terraform.tf
│   ├── terraform.tfvars
│   └── variables.tf
└── ecs
    ├── main.tf
    ├── outputs.tf
    ├── terraform.tf
    ├── terraform.tfvars
    └── variables.tf
```
The files in each folder represent the `Terraform Provider=>terraform.tf`, the `Terraform code => main.tf` and the variables, you can also split those into various files.

### Terraform Structure for ECS
When it comes to Elastic Container Service (ECS), I recommend doing something as follows, this makes sure your services are separate and nothing changes due to one service being changed.
```
├── ecs
│   ├── main.tf
│   ├── terraform.tf
│   ├── terraform.tfvars
│   └── variab
└── services
    ├── service1
    ├── service2
    ├── service
```

Now you may wonder, since Terraform only works within one folder how would it work if you've split these resources. Well, there is something known as [Terraform Remote State Data Source](https://www.terraform.io/language/state/remote-state-data).

So to give you a gist of how this works, the outputs defined in the folder i.e in `outputs.tf` are accessible via the remote backend.

This is the `network/terraform.tf` file.
> network/terraform.tf

```
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.4.0"
    }
  }
  backend "s3" {
    key               = "network/terraform.tfstate"
    bucket            = "Leos-tf-prod"
    encrypt           = true
    profile           = "My-custom-profile"
    region            = "us-west-2"
    dynamodb_endpoint = "dynamodb.us-west-2.amazonaws.com"
    dynamodb_table    = "production-tf-state"

  }
 }
```
> Note: Specifying the profile makes sure Terraform doesn't use the default profile.

Now I'll setup the resources using the AWS VPC module. Then If I need to access Data, such as VPC ID in another folder I need to define that using the Terraform output blocks in the `outputs.tf`.
```
# VPC
output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "The CIDR block of the VPC"
  value       = module.vpc.vpc_cidr_block
}
```
Now if I do `terraform output` I can see the values

```
$ terraform output

vpc_cidr_block = "20.0.118.0/17"
vpc_id = "vpc-03434c243d05599f"
```

Let's move forward, now I need to access the same in my Elastic Container Service.

To do this I need to simply define a `terraform_remote_state Data Source` as such:

> ecs/terraform.tf

```
data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "Leos-tf-prod"
    key    = "network/terraform.tfstate"
    region = "us-west-2"
    profile = "My-custom-profile"
  }
}
```

Now if you've noticed, typing `data.terraform_remote_state.network.vpc_cidr` is going to cause you to type more or you need to remember stuff, to avoid this you can use `locals` as such

```
locals {
  vpc_id          = data.terraform_remote_state.network.outputs.vpc_id
  private_subnets = data.terraform_remote_state.network.outputs.public_subnets
  public_subnets  = data.terraform_remote_state.network.outputs.public_subnets
}
```
Then in your folder, you can simply call the variable as such
```
local.vpc_id
```

### Benefits of this approach.
- Reducing the blast radius, for example, if you accidentally run a destroy, a limited number of resources will be affected.
- Improved security in case you need someone to work only on one part of the code.
- Splitting the files reduces the time taken to apply changes.

In case you would like to continue the discussion, you can always reach out to me on [Twitter](https://twitter.com/mediocreDevops) or on [LinkedIn](https://www.linkedin.com/in/leon-nunes/), if you feel like following on [Github](https://github.com/afro-coder) you can also do that

That's it, thank you for reading.