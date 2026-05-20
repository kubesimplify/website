---
title: "Tutorial: Build a Cloud Cost Monitoring System with Terraform, Ansible and Komiser"
seoTitle: "Cloud Cost Monitoring System with Terraform, Ansible and Komiser"
datePublished: 2023-11-03T05:39:27.118Z
slug: tutorial-build-a-cloud-cost-monitoring-system-with-terraform-ansible-and-komiser
author: kunal-verma
cover: /img/blog/tutorial-build-a-cloud-cost-monitoring-system-with-terraform-ansible-and-komiser/81c2ad59-154a-44d9-b767-7aa0efbcaaa0.png
tags: ["aws", "ansible", "terraform", "cloudcostmanagement"]
cuid: cloi6rcpa000709l2euhphne0
---
In today's cloud-centric world, businesses rely on cloud services to power their applications and infrastructure. While the **scalability** and **flexibility** of the cloud are **undeniable advantages**, it's crucial to keep a **close eye on the costs** associated with these services.

Introducing [Komiser](https://github.com/tailwarden/komiser), an **open-source cloud-agnostic resource manager** that offers a powerful solution to address this challenge by seamlessly collecting comprehensive resource data across your organization's Cloud accounts. With Komiser, you can gain **deeper insights** into resource **consumption** and **expenditure** **across different cloud environments**, empowering you to make informed decisions and optimize your cloud infrastructure efficiently, and that is what we cover in this article.

In this tutorial, we will walk through the **step-by-step process** of **building a Cloud Cost Monitoring System using Komiser** which will enable us to access and aggregate resource data from a cloud infrastructure, provisioned on **AWS**.

Whether you're a DevOps engineer responsible for managing AWS resources or a cloud architect looking to optimize costs across your cloud infrastructure, this tutorial will demonstrate a **practical use case**, illustrating how you can **leverage Komiser to make informed decisions and drive cost savings in your cloud infrastructure.**

# Project Architecture

Let us understand the overall **architecture** and the **key components** involved in this project.

![Project Architecture](/img/blog/tutorial-build-a-cloud-cost-monitoring-system-with-terraform-ansible-and-komiser/481a5dbf-aeb2-411e-bfdd-ad19043e1b00.png align="center")

In this tutorial, we are using a **simple Django todo list application** that relies on a bunch of AWS services:

* **IAM** - We created a new IAM user to grant necessary permissions to our AWS account.
    
* **EC2 Instance** - The application container is hosted in an Ubuntu-based remote server.
    
* **VPC** - In this demo, we are using the default VPC for our AWS region.
    
* **Elastic Load Balancer** - To manage the incoming traffic to our Django app.
    

The entire AWS infrastructure is provisioned and managed using **Terraform** (an Infrastructure as Code tool) and Ansible (a configuration management tool).

And finally, we deploy and authenticate **Komiser** to monitor the cloud resources associated with our Django application.

**Sounds interesting, right?** I hope this gave you a gist of what we'll be building together and let's move on to the **prerequisites** **section**.

# **Prerequisites**

Before you begin this tutorial, you'll need the following to get started:

* Basic knowledge of [**AWS Cloud**](https://aws.amazon.com/)**.**
    
* An AWS [**Free Tier account**](https://aws.amazon.com/free/)**.**
    
* Basic knowledge of containers and [**Docker**](https://www.docker.com/)**.**
    
* The following tools are installed and configured on your system:
    
    * [Terraform](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)
        
    * [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/index.html)
        
    * [Komiser CLI](https://docs.komiser.io/getting-started/installation)
        

# Step 1: Initial App Configuration

There are mainly two parts to this particular section. Let us start with testing our Django application locally.

## Local App Setup

I always recommend first **running** and **testing** the application locally, before any further integrations or provisioning of the actual cloud infrastructure.

Follow the detailed steps mentioned in the [documentation](https://github.com/kubesimplify/cloudnative-lab/tree/main/projects/ep-cloud-cost-monitoring/project_files#testing-the-django-app) to first clone and quickly test the Django Todo list application.

![Django Todo List](/img/blog/tutorial-build-a-cloud-cost-monitoring-system-with-terraform-ansible-and-komiser/9faa2035-9e5b-46b8-9ff6-ab519015b2ac.png align="center")

## Containerising our App

To easily run our Django application on the remote EC2 instance, we’ll be **containerizing the application**.

Create a new `Dockerfile` and use the following code to create a **new docker image**:

```dockerfile
# pull the official base image
FROM python:3.8.3-alpine

# set work directory
WORKDIR /app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install dependencies
RUN pip install --upgrade pip 
COPY ./requirements.txt /app
RUN pip install -r requirements.txt

# copy project
COPY . /app

# expose port 8000
EXPOSE 8000
```

In this case, we are also using **docker-compose** to further simplify the process of running our container. Create a `docker-compose.yaml` file with the following code snippet:

```yaml
version: '3'
services:
   web:
       build: .
       command: python manage.py runserver 0.0.0.0:8000
       ports:
           - 8000:8000
```

Essentially, this will help us in spinning up a container, running and being exposed at port `8000`, using just a **single command** of:

```bash
docker-compose up -d
```

Interestingly, we’ll be further automating the process of container creation using **Ansible playbooks** in a separate section ahead!

**Congratulations on completing the initial app configuration 🎉**

Let us move ahead with provisioning our cloud infrastructure, using Terraform!

# Step 2: **Cloud Infrastructure Configuration**

In this particular section, we’ll first be provisioning our cloud infrastructure on AWS using Terraform and then automating the deployment process for our Django application container on the remote EC2 instance, using the Ansible playbook.

Let us first provision our AWS infrastructure and get that up and running!

## Infrastructure Provisioning Using Terraform

As mentioned previously, for this particular project we have the following AWS services that need to be provisioned:

* **IAM**
    
* **EC2 Instance**
    
* **VPC** (this is not newly created per se. We'll be using the default VPC for our AWS region)
    
* **Elastic Load Balancer**
    

Let us see their configurations one by one, starting with creating an IAM user.

### 1\. Creating an IAM user

It is always recommended to create a new IAM user associated with your AWS account and attach **granular permissions** according to the use case.

Use the following code snippet to define a new IAM user named `komiser-aws-user`:

```json
resource "aws_iam_user" "komiser_iam" {
  name = "komiser-aws-user"

  tags = {
    Name = "komiser-django-app"
  }
}

# resource for UI login
resource "aws_iam_user_login_profile" "komiser_iam_login" {
 user    = aws_iam_user.komiser_iam.name
}

# for access key & secret access key:
resource "aws_iam_access_key" "komiser_iam" {
  user    = aws_iam_user.komiser_iam.name
}

# Output the IAM user access id, secret id and password:
output "id"{
  value = aws_iam_access_key.komiser_iam.id
}
output "secret"{
  value = aws_iam_access_key.komiser_iam.secret
  sensitive = true
}
output "iam_password" {
 value = aws_iam_user_login_profile.komiser_iam_login.password
 sensitive = true
}
```

Explanation:

* `aws_iam_user` - To create a new IAM user named: `komiser-aws-user`.
    
* `aws_iam_user_login_profile` - To enable AWS Management console login for the new user.
    
* `aws_iam_access_key` - To create access and secret access keys for the new user.
    
* After the user has been created, there are three output values defined:
    
    * Access ID
        
    * Secret Access ID
        
    * Login password for AWS Management console
        

The second part of creating an IAM user is attaching an appropriate policy for granting it the necessary permissions to access AWS resources.

Use the following `policy.json` file that defines the permissions we’ll give to our new IAM user:

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "1",
			"Effect": "Allow",
			"Action": [
				"ec2:*",
				"s3:*",
				"iam:*",
				"elasticloadbalancing:*",
                "route53:*",
                "tag:Get*",
                "pricing:*"
			],
			"Resource": "*"
		}
	]
}
```

> You can certainly define more granular permissions here, within each resource group. Refer to the [Komiser policy](https://github.com/tailwarden/komiser/blob/master/policy.json) to learn more.

Let us create a new IAM policy using the definition above and attach that to the user:

```json
resource "aws_iam_policy" "komiser_policy" { 
  name        = "komiser_iam_policy"
  description = "This is the policy for komiser user"

  policy = file("policy.json")

 tags = {
    Name = "komiser-django-app"
  }
}

# Policy Attachment with the user:
resource "aws_iam_user_policy_attachment" "komiser_policy_attachment" {
 user       = aws_iam_user.komiser_iam.name
 policy_arn = aws_iam_policy.komiser_policy.arn
}
```

Explanation:

* `aws_iam_policy` - creates a new IAM policy named `komiser_iam_policy`.
    
* `aws_iam_user_policy_attachment` - attaches the `komiser_iam_policy` with our IAM user i.e. `komiser-aws-user`.
    

### 2\. Creating an EC2 instance

As we are provisioning our infrastructure using Terraform, there are a few different parts we need to define to successfully provision an EC2 instance.

Let us have a look at each of them, in detail.

**Defining the Terraform EC2 resource**

Use the following code to define a new Ubuntu EC2 instance of type `t2.micro`:

```json
# EC2 instance resource:
resource "aws_instance" "komiser_instance" {
  ami           = "ami-053b0d53c279acc90"
  instance_type = "t2.micro"
  key_name      = aws_key_pair.ssh_key.key_name

  vpc_security_group_ids = [aws_security_group.allow_tls_1.id]

  depends_on = [aws_security_group.allow_tls_1]

  user_data  = "${file("install.sh")}"

  tags = {
    Name = "komiser-django-app"
  }
}
```

> Note:
> 
> The AMI ID specified above is specific to the AWS region chosen. In my case, the default region is `us-east-1`.  
> Be sure to change the AMI ID value according to the region you choose to provision the resources in!

To install the necessary dependencies on our remote instance after being provisioned, we are using Terraform’s `user_data` type to attach the bash script given below:

```bash
#!/bin/bash

# Install docker:
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL <https://download.docker.com/linux/ubuntu/gpg> | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] <https://download.docker.com/linux/ubuntu> $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
apt-cache policy docker-ce
sudo apt install -y docker-ce

# Install docker compose:
sudo mkdir -p ~/.docker/cli-plugins/
sudo curl -SL <https://github.com/docker/compose/releases/download/v2.3.3/docker-compose-linux-x86_64> -o ~/.docker/cli-plugins/docker-compose
sudo chmod +x ~/.docker/cli-plugins/docker-compose

# Clone the Git repo:
git clone https://github.com/kubesimplify/cloudnative-lab.git
```

Essentially, this particular script will install the following tools on our Ubuntu instance:

* Docker Engine
    
* Docker Compose
    
* Clone the [GitHub repo](https://github.com/kubesimplify/cloudnative-lab), to access the Dockerfile (created above)
    
    > You may replace the GitHub repository URL with your project’s repository URL here!
    

1. **Defining the security group for our Instance**
    
    There are mainly two things we need to define in our security group:
    
    * **Ingress** - Allowing incoming traffic at ports:
        
        * `22` - to enable remote access using SSH
            
        * `8000` - to expose our Django application
            
    * **Egress** - Allowing external traffic from anywhere on the internet
        
    
    Use the code below to create a new security group, associated with our EC2 instance:
    
    ```json
    resource "aws_security_group" "komiser_sg" {
      name        = "komiser_sg"
      description = "Security Group for Komiser Instance"
      vpc_id      = "VPC_ID"
    
      ingress {
            description = "For ssh"
            from_port   = 22
            to_port     = 22
            protocol    = "tcp"
            cidr_blocks = ["0.0.0.0/0"]
      }
      ingress {
            description = "For Django app"
            from_port   = 8000
            to_port     = 8000
            protocol    = "tcp"
            cidr_blocks = ["0.0.0.0/0"]
      }
      egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
      }
    
      lifecycle {
        create_before_destroy = true
      }
    
      tags = {
        Name = "komiser-django-app"
      }
    }
    ```
    
2. **Creating a new SSH key pair**
    
    Use the following code to create a new SSH key pair in AWS called `komiser_ssh_key`, that we can use to securely connect with our remote instance:
    
    ```bash
    resource "aws_key_pair" "ssh_key" {
      key_name   = "komiser_ssh_key"
      public_key = file("~/.ssh/komiser-aws.pub") # location of public SSH key
    
      tags = {
        Name = "komiser-django-app"
      }
    }
    ```
    
    > Note:
    > 
    > You will need to create a new SSH key pair for this purpose. Use the following command to generate a new SSH key pair on your local machine:
    > 
    > ```bash
    > ssh-keygen -t rsa -b 4096
    > ```
    > 
    > An example SSH key pair creation process has been shown below:
    > 
    > ![SSH Key Pair](/img/blog/tutorial-build-a-cloud-cost-monitoring-system-with-terraform-ansible-and-komiser/bde56046-9eb5-4125-877e-c6f132f365f7.png align="center")
    
3. **Creating an Elastic IP for our Instance**
    
    By default, the IP address assigned to an EC2 instance changes on reboot and this may sometimes complicate things. To avoid this, I recommend creating an Elastic IP address (which remains constant) and associating that with the instance.
    
    Use the following Terraform resource types to create and associate an Elastic IP with our instance:
    
    ```json
    # Elastic IP resource
    resource "aws_eip" "koimser_instance_ip" {
      instance = aws_instance.komiser_instance.id
      depends_on = [aws_instance.komiser_instance]
    
      tags = {
        Name = "komiser-django-app"
      }
    }
    # Elastic IP association:
    resource "aws_eip_association" "eip_association" {
      instance_id   = "${aws_instance.komiser_instance.id}"
      allocation_id = "${aws_eip.koimser_instance_ip.id}"
    }
    
    # Output the instance IP:
    output "ec2_ip" {
      value = aws_eip.koimser_instance_ip.public_ip
    }
    ```
    

Overall, the entire configuration for provisioning our EC2 instance would look like this:

```json
# EC2 instance resource:
resource "aws_instance" "komiser_instance" {
  ami           = "AMI_ID"
  instance_type = "t2.micro"
  key_name      = aws_key_pair.ssh_key.key_name

  vpc_security_group_ids = [aws_security_group.allow_tls_1.id]

  depends_on = [aws_security_group.allow_tls_1]

  user_data  = "${file("install.sh")}"

  tags = {
    Name = "komiser-django-app"
  }
}

# SSH key pair
resource "aws_key_pair" "ssh_key" {
  key_name   = "komiser_ssh_key"
  public_key = file("~/.ssh/komiser-aws.pub")

  tags = {
    Name = "komiser-django-app"
  }
}

# Security group resource:
resource "aws_security_group" "allow_tls_1" {
  name        = "allow_tls_1"
  description = "Allow TLS inbound traffic"
  vpc_id      = "vpc-0c09e12657a2cf8fc"

  ingress {
        description = "For ssh"
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
        description = "For Django app"
        from_port   = 8000
        to_port     = 8000
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "komiser-django-app"
  }
}

# Elastic IP resource
resource "aws_eip" "koimser_instance_ip" {
  instance = aws_instance.komiser_instance.id
  depends_on = [aws_instance.komiser_instance]

  tags = {
    Name = "komiser-django-app"
  }
}
# Elastic IP association:
resource "aws_eip_association" "eip_association" {
  instance_id   = "${aws_instance.komiser_instance.id}"
  allocation_id = "${aws_eip.koimser_instance_ip.id}"
}

# Output the instance IP:
output "ec2_ip" {
  value = aws_eip.koimser_instance_ip.public_ip
}
```

### 3\. Creating an Elastic Load Balancer

For properly configuring an Elastic Load Balancer, there are mainly two parts we need to define:

1. **Security Group for our ELB**
    
    Use the following code to define the security group for our load balancer:
    
    ```json
    # ELB security group:
    resource "aws_security_group" "komiser_elb_sg" {
      name        = "komiser_elb"
      description = "Komiser ELB Security Group"
    
      ingress {
        from_port = 80
        to_port = 80
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
      }
    
      egress {
        from_port        = 0
        to_port          = 0
        protocol         = "-1"
        cidr_blocks      = ["0.0.0.0/0"]
        ipv6_cidr_blocks = ["::/0"]
      }
    
      tags = {
        Name = "komiser-django-app"
      }
    }
    ```
    
    Explanation:
    
    * **Ingress Rules**: This security group allows incoming traffic on port 80 via the TCP protocol from any IP address (`0.0.0.0/0`), essentially enabling access to the port `80`.
        
    * **Egress Rules**: Egress rules allow all outbound traffic (`0.0.0.0/0` for IPv4 and `::/0` for IPv6).
        
2. **Terraform ELB resource**
    
    Use the following code to create a new Elastic Load Balancer:
    
    ```json
    # Create a new Elastic load balancer:
    resource "aws_elb" "komiser_elb" {
      name               = "komiser-elb"
      availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c", "us-east-1d"]
      security_groups = [aws_security_group.komiser_elb_sg.id]
      instances = [aws_instance.komiser_instance.id]
    
      access_logs {
        bucket        = "komiser-elb-logs"
        interval      = 5
      }
    
      listener {
        instance_port     = 8000
        instance_protocol = "http"
        lb_port           = 80
        lb_protocol       = "http"
      }
    
      health_check {
        healthy_threshold   = 2
        unhealthy_threshold = 2
        timeout             = 3
        target              = "TCP:8000"
        interval            = 30
      }
    
      cross_zone_load_balancing   = true
      idle_timeout                = 400
      connection_draining         = true
      connection_draining_timeout = 400
    
      tags = {
        Name = "komiser-django-app"
      }
    }
    
    # Output the ELB Domain name:
    output "komiser_elb_dns" {
      value = aws_elb.komiser_elb.dns_name
      depends_on = [aws_elb.komiser_elb]
    }
    ```
    
    Explanation:
    
    * `instances` - specifying the EC2 instance ID to which this ELB will be associated with.
        
    * `access_logs` - storing the ELB logs in an S3 bucket named as `komiser-elb-logs` (this bucket has to be first created separately on AWS)
        
    * `listener` - defines a listener that maps incoming requests on port `80` (configured in our ELB security group) to the Django application container, which will be running on port `8000` in our EC2 instance.
        

Before applying the above changes and provisioning the infrastructure, make sure to define the terraform AWS provider and specify the correct AWS profile to use:

```json
terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "5.8.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  profile = "Komiser-User"
}
```

Finally, you can now use the following commands to provision the entire infrastructure on AWS:

```bash
terraform init
terrafor apply
```

![Terraform outputs](/img/blog/tutorial-build-a-cloud-cost-monitoring-system-with-terraform-ansible-and-komiser/40da7b06-719b-4246-b60b-edf0e4024028.png align="center")

**Congratulations 🎉 we have successfully provisioned our cloud resources on AWS using Terraform!**

# Step 3: Deploying our App Using Ansible Playbook

Giving a little bit of background, the [**Ansible playbook**](https://docs.ansible.com/ansible/latest/getting_started/get_started_playbook.html) is used for **automating tasks** and **managing server configurations**, making it easier to **maintain** and **deploy** applications on **multiple remote servers**.

And that’s exactly our use case today!

In this particular section, we’ll be using an Ansible playbook to first connect to our remote EC2 instance and then automate the process of deploying our Django Todo application container.

Talking about configuring the application deployment process using Ansible, there are mainly **two parts** we need to cater to here.

Let us discuss both of them in detail.

## 1\. Building the Ansible Inventory

Essentially, an Ansible inventory file is a simple list of **hostnames** or **IP addresses** that Ansible uses to manage and execute tasks on the remote server. In this case, our target remote server is the **EC2 instance** we provisioned earlier.

Create a new `inventory.yaml` file in your working directory and use the following configuration:

```yaml
virtualmachines:
  hosts:
    vm01:
      ansible_host: INSTANCE_IP_ADDRESS 
      ansible_ssh_user: ubuntu
      ansible_ssh_private_key_file: "PRIVATE_SSH_KEY"
```

Explanation:

* `virtualmachines` - represents a group of virtual machines to be managed by Ansible.
    
* `hosts` - lists down the information for individual hosts (remote servers) within a group.
    
* Here, we are representing our remote EC2 instance with `vm01` and providing the following configuration:
    
    ```yaml
    vm01:
    	ansible_host: INSTANCE_IP_ADDRESS 
    	ansible_ssh_user: ubuntu
    	ansible_ssh_private_key_file: "PRIVATE_SSH_KEY"
    ```
    
    > Make sure to replace `INSTANCE_IP_ADDRESS` with the Elastic IP address of the EC2 instance and `PRIVATE_SSH_KEY` with the location of the private SSH key file in your local system.
    

To **test the connection**, use the following command to ping the EC2 instance:

```bash
ansible virtualmachines -m ping -i inventory.yaml
```

If the connection is successful, you’ll receive the following output:

![Ansible Connection Test](/img/blog/tutorial-build-a-cloud-cost-monitoring-system-with-terraform-ansible-and-komiser/aa1fc1d2-0857-42d1-ab34-12eeaab15ad1.png align="center")

## 2\. Defining the Ansible Playbook

Now that we successfully established a **secure connection** between Ansible and our EC2 instance, let us **define the tasks** we need Ansible to perform on our remote server.

Create a new `playbook.yaml` file and use the following code to create a playbook:

```yaml
- name: AWS <> Komiser Playbook
  hosts: vm01
  tasks:
  - name: Check if Docker is running
    ansible.builtin.systemd:
      name: docker.service
      state: started
      enabled: true
  - name: Run Docker Compose
    ansible.builtin.command: 
    args:
      # change the current dir
      chdir: /cloudnative-lab/projects/ep-cloud-cost-monitoring/project_files
      # run docker compose
      cmd: sudo docker compose -f docker-compose.yml up -d
```

Explanation:

* `hosts: vm01` - the name of the target host server where the tasks will be executed (defined above).
    
* There are two main tasks defined to be executed on our instance:
    
    1. **Checking if the Docker engine is running on the EC2 instance.**
        
        Here, we are using Ansible’s built-in `systemd` module - `ansible.builtin.systemd` which will essentially execute the following command in the background to check the status of the docker engine:
        
        ```yaml
        systemctl status docker.service
        ```
        
    2. **Running Docker Compose to start the application container.**
        
        Here, we are executing some shell commands using the built-in `ansible.builtin.command` module:
        
        * Changing the current directory to where the `Dockerfile` and `docker-compose.yaml` are located.
            
        * Executing the following command to start our Django app container:
            
            ```bash
            sudo docker compose -f docker-compose.yml up -d
            ```
            

Now, you can use the following command to execute the playbook:

```bash
ansible-playbook -i inventory.yaml playbook.yaml
```

As the tasks are being executed, you can view the terminal output which may look something like the below:

![](/img/blog/tutorial-build-a-cloud-cost-monitoring-system-with-terraform-ansible-and-komiser/46b728a3-784b-4ad8-8d7f-989372100ad4.png align="center")

If everything goes well as planned, our application has been deployed on our EC2 instance and you’ll be able to access the web browser using either of these two methods:

* [`http://INSTANCE_IP:8000`](http://INSTANCE_IP:8000)
    
* Elastic Load Balancer Domain (which we already provisioned above)
    

> Note:
> 
> In case you face any issues/errors in this step, you can access the application container logs, by connecting to the EC2 instance using `ssh`:
> 
> ```bash
> ssh -i private_ssh_file ubuntu@IP_ADDRESS
> ```
> 
> ![](/img/blog/tutorial-build-a-cloud-cost-monitoring-system-with-terraform-ansible-and-komiser/43a07339-b0d3-40db-b320-ab5753390262.png align="center")

**Congratulations 🎉 you have successfully deployed the Django application on the remote server, using Ansible!**

# A Spotlight on Komiser

If we take a look at the definition from the [official documentation](https://docs.komiser.io/welcome/overview):

> Komiser is an **open-source cloud-agnostic resource manager**, that integrates with **multiple cloud providers** (including [AWS](https://docs.komiser.io/configuration/cloud-providers/aws), [Azure](https://docs.komiser.io/configuration/cloud-providers/azure), [GCP](https://docs.komiser.io/configuration/cloud-providers/gcp), [Civo](https://docs.komiser.io/configuration/cloud-providers/civo), [Digital Ocean](https://docs.komiser.io/configuration/cloud-providers/digital-ocean), [Kubernetes](https://docs.komiser.io/configuration/cloud-providers/k8s), [OCI](https://docs.komiser.io/configuration/cloud-providers/oci), [Linode](https://docs.komiser.io/configuration/cloud-providers/linode), [Tencent](https://docs.komiser.io/configuration/cloud-providers/tencent) and [Scaleway](https://docs.komiser.io/configuration/cloud-providers/scaleway)), builds a cloud asset inventory, and helps you break down your cost at the resource level.

In simple terms, it's a tool that keeps an eagle eye on your cloud resources, helping you understand and optimize your overall cloud costs.

## Highlighting some Key Features

Komiser brings a set of powerful features to the table:

* **Multi-Cloud Support**: It works seamlessly with various cloud providers like AWS, Azure, Google Cloud and more. You can manage your resources across different clouds from a single place.
    
* **Comprehensive Resource Data**: Komiser collects detailed information about your cloud resources. You can track everything from virtual machines and databases to storage and networking.
    
* **Cost Transparency**: It provides deep insights into resource consumption and expenditure. You'll know exactly where your money is going and where you can save.
    
* **Customizable Dashboards**: One of my favorites is the fact that Komiser offers a customizable dashboard, so you can tailor the information you want to see. It's like having your own **“cloud financial control center”!**
    

## How Komiser is Solving the Cloud Cost Problem?

Here's the **magic** of using a tool like Komiser!

Komiser will help you **monitor** and **manage** your cloud resources efficiently. Whether you're running a **small application** (such as a Django ToDo list in our case) or a **complex infrastructure**, Komiser will simplify the process of controlling your cloud spending.

It's not just about **cost-cutting**, but about being **cost-intelligent**. By understanding your cloud costs better, you can make **smarter decisions** to **maximize your cloud investment!**

Now that we have an idea of what is Komiser, let us see how we can implement this to monitor our cloud resources, provisioned on AWS.

# Step 4: Configuring Komiser

To use Komiser with our provisioned cloud infrastructure on AWS, we first need to authenticate our AWS account with Komiser.

For this purpose, Komiser uses a `config.toml` file where we’ll provide the necessary cloud provider account configuration, in this case for AWS.

Create a new `config.toml` file in your working directory and use the following code snippet:

```ini
[[aws]]
name="Django-Komiser Project"
source="CREDENTIALS_FILE"
path="./path/to/credentials/file"
profile="Admin-User"

[sqlite]
file = "komiser.db"
```

Explanation:

* `name` - a custom name we wish to give for the account
    
* `source` - defines the type of **authentication method** we wish to choose. There are mainly two methods to feed cloud provider credentials to Komiser:
    
    1. Using environment variables:
        
        ```toml
        source="ENVIRONMENT_VARIABLES"
        ```
        
    2. Using a credentials file:
        
        ```toml
        source="CREDENTIALS_FILE"
        ```
        
    
    Here, we are using a **credentials file**.
    
    * `path` - specifying the path to the AWS credentials file.
        
    * `profile` - specifying the AWS account profile to use with Komiser.
        
    * For persisting the AWS account data, we are using a simple `SQLite` file called `komiser.db`, which is one of the [two methods to persist data in Komiser](https://docs.komiser.io/configuration/cloud-providers/aws#data-persistence).
        

> Note:
> 
> It is not recommended to add your AWS Access and Secret Access keys in the credentials file when working in a production environment. The most secure way of authentication is by using **temporary credentials through IAM roles**.
> 
> To learn more, refer to the [documentation](https://docs.komiser.io/configuration/cloud-providers/aws#credentials-file).

Now that we have configured our AWS account credential with Komiser, we can start the local Komiser instance using the following command:

```bash
komiser start --config config.toml
```

As we execute this, Komiser engine will start generating the following output continuously:

![](/img/blog/tutorial-build-a-cloud-cost-monitoring-system-with-terraform-ansible-and-komiser/d2668106-1d27-413e-aba4-d54033e599f8.png align="center")

You'll now be able to access the Komiser dashboard at [http://localhost:3000](http://localhost:3000)

![](/img/blog/tutorial-build-a-cloud-cost-monitoring-system-with-terraform-ansible-and-komiser/24bd8169-a6fa-4a2a-b6b7-a14474ce2bbd.png align="center")

**Congratulations 🎉 you have successfully configured and authenticated Komiser to monitor the resources in your AWS account!**

# **Step 5: Fine-Tuning Resource Monitoring with Tags**

You can now have a **detailed view** of all the **active AWS resources** in your account by heading over to the **Inventory** section, as shown below:

![](/img/blog/tutorial-build-a-cloud-cost-monitoring-system-with-terraform-ansible-and-komiser/d383e196-b438-48a8-9152-a7f1d12dc20f.png align="center")

**This is where things get a little bit more interesting!**

While provisioning the cloud infrastructure using Terraform, we tagged all the resources associated with our Django application as shown below:

```bash
tags = {
    Name = "komiser-django-app"
  }
```

Now, **we can filter out the specific cloud resources/services associated with our Django application using this tag name in Komiser 😮**

Go ahead and add a new filter in the **Inventory** section using the following configuration:

* **Key name** - `Name`
    
* **Key value** - `komiser-django-app`
    

When applied, this will filter out and display only the cloud resources associated with our Django application, as shown below:

![](/img/blog/tutorial-build-a-cloud-cost-monitoring-system-with-terraform-ansible-and-komiser/b084524e-1271-497e-8326-48ad27e697fa.png align="center")

So, now we know the exact number of cloud resources our Django application depends upon which is `11` in this case and the cloud costs for each resource are being constantly monitored by Komiser!

With this, we have successfully built a Cloud Cost Monitoring system for our simple Django ToDo list application using Komiser. **Congratulations on making it this far 🎉**

# Conclusion

In this article, we embarked on a journey to explore the realm of cloud cost management with Komiser.

We began by laying the foundation, **understanding project architecture**, and covering essential **prerequisites**. Configuring our simple Django ToDo list application from **testing to containerization**, we dove into provisioning our cloud infrastructure using **Terraform** and then, remotely **deploying our application** with the **Ansible playbook**.

As we shed some light on Komiser, we learned about its **unique features** and how it effectively **addresses the cloud cost challenges**. At last, we configured Komiser to continuously monitor our AWS resources, associated with our application.

This tutorial equips you with the knowledge and tools to make informed decisions while driving cost savings in your cloud infrastructure.

Remember, Komiser is your trusted companion in maintaining cost efficiency across your cloud environment. **The possibilities are endless, and the savings are real – thanks to the power of Komiser.**

# Additional Resources

Here are a list of some additional resources for your reference:

* [Source Code](https://github.com/kubesimplify/cloudnative-lab/tree/main/projects/ep-cloud-cost-monitoring) for the project.
    
* [Monitoring a Next.js Application with Komiser](https://www.tailwarden.com/blog/monitoring-cloud-costs-and-usage-of-a-next-js-application-with-komiser)
    
* [How to practice FinOps with Komiser](https://www.tailwarden.com/blog/how-to-practice-finops-with-komiser)
    

Follow Kubesimplify on [**Hashnode**](https://kubesimplify.com/), [**Twitter**](https://twitter.com/kubesimplify) and [**LinkedIn**](https://www.linkedin.com/company/kubesimplify/). Join our [**Discord**](https://blog.kubesimplify.com/kubesimplify.com/discord) server to learn with us.