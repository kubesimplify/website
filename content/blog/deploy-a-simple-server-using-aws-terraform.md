---
title: "Deploy a simple server using AWS + Terraform"
seoTitle: "Deploy a simple server using AWS + Terraform"
datePublished: 2022-05-10T12:33:04.746Z
slug: deploy-a-simple-server-using-aws-terraform
author: dipankar-das
cover: /img/blog/deploy-a-simple-server-using-aws-terraform/29PIM4Ndn.png
tags: ["ec2", "aws", "server", "nginx", "terraform"]
cuid: cl304vkvp00mtrinv7h6xgilt
---

## What is Terraform?
Terraform is an Infrastructure as Code(**IAC**) tool that lets you define both cloud and on-prem resources in human-readable configuration files, that you can version, reuse, and share. 
![](https://mktg-content-api-hashicorp.vercel.app/api/assets?product=terraform&version=refs%2Fheads%2Fstable-website&asset=website%2Fimg%2Fdocs%2Fintro-terraform-apis.png)

## The core Terraform workflow
* **Write**: You define resources, which may be across multiple cloud providers and services.
* **Plan**: Terraform creates an execution plan describing the infrastructure it will create, update, or destroy based on the existing infrastructure and your configuration.
* **Apply**: On approval, Terraform performs the proposed operations in the correct order, respecting any resource dependencies.

[Link for the AWS resource definitions](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

# How to setup AWS
## Setup Access Key


![01.png](/img/blog/deploy-a-simple-server-using-aws-terraform/e_ACFucj_.png align="left")

1. To create one or more IAM users (console)
  1. Sign in to the AWS Management Console and open the IAM console at [**AWS IAM**](https://console.aws.amazon.com/iam/)
  2. expand the list **Access keys (access key ID and secret access key)** 
![02.png](/img/blog/deploy-a-simple-server-using-aws-terraform/YXYd5Ngm3.png align="left")
  3. **Store the keys**  ![03.png](/img/blog/deploy-a-simple-server-using-aws-terraform/avb_Z7igl.png align="left")
2. Installation of Terraform CLI
  [Download Link](https://www.terraform.io/downloads)

![04.png](/img/blog/deploy-a-simple-server-using-aws-terraform/hVJ2mLetO.png align="left")

# Let's Learn by Doing
Let us get right into it

## Resources to create a web server
1. **EC2** - virtual machine on AWS
2. **VPC** - Virtual Private Cloud is the isolation of the cloud for your resources to run. This is a logical way of separating of network
3. **Internet Gateway** - to allow network traffic to reach inside vpc
4. **Subnet** - It creates Network inside VPC, thus reducing the network hopping
5. **RouteTable** - It stores the destination address where network traffic from your subnet or gateway is to be directed.
6. **Associate the RouteTable and Subnet** - connect both of them
7. **Security Group** - to Allow which port and from what Client IP address it came
8. **Network Interface** - It allows communications between computers connected to the Subnet
9. **Elastic IP** - it's a service by AWS which provides the dynamic IP during creation.


![image.png](/img/blog/deploy-a-simple-server-using-aws-terraform/JjVCuF6YI.png align="left")


## Let's write the configuration files

### terraform.tfvars

```terraform
client-ip-access = {
  ssh = "0.0.0.0/0"
  https = "0.0.0.0/0"
}
```

### main. tf

```terraform
provider "aws" {
  region  = "us-east-1"
  access_key = "<provider access key>"
  secret_key = "<provider secret key>"
}


# vpc
resource "aws_vpc" "prod-vpc" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "prod-vpc"
  }
}

variable "client-ip-access" {
  description = "ip address for the client to access the host"
  type = map(string)
}

# internet gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.prod-vpc.id

  tags = {
    Name = "prod-gateway"
  }
}

# route table
resource "aws_route_table" "prod-rt" {
  vpc_id = aws_vpc.prod-vpc.id

  route {
    cidr_block = "0.0.0.0/0" # any ip can access
    gateway_id = aws_internet_gateway.gw.id
  }

  route {
    ipv6_cidr_block        = "::/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "prod-rt"
  }
}

# subnets
resource "aws_subnet" "prod-subnet" {
  vpc_id     = aws_vpc.prod-vpc.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "prod-subnet"
  }
}

# join subnets and route table by association
resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.prod-subnet.id
  route_table_id = aws_route_table.prod-rt.id
}

# security
resource "aws_security_group" "allow_http" {
  name        = "allow-web-traffic"
  description = "Network traffic allowed"
  vpc_id      = aws_vpc.prod-vpc.id

  ingress {
    description      = "HTTPS"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"] # so as to make anyone to reach the server
    # cidr_blocks      = [var.client-ip-access.https]
  }

  ingress {
    description      = "HTTP"
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"] # so as to make anyone to reach the server
  }

  ingress {
    description      = "SSH"
    from_port        = 22
    to_port          = 22
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"] # so as to make anyone to reach the server
    # cidr_blocks      = [var.client-ip-access.ssh]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  tags = {
    Name = "prod-security"
  }
}

# elastic ip
# It's recommended to denote that the AWS Instance or Elastic IP depends on the Internet Gateway. For example:
resource "aws_eip" "bar" {
  vpc = true

  associate_with_private_ip = "10.0.1.50"
  network_interface = aws_network_interface.prod-nic.id
  depends_on                = [aws_internet_gateway.gw]

  tags = {
    "Name" = "prod-eip"
  }
}

# network interface
resource "aws_network_interface" "prod-nic" {
  subnet_id       = aws_subnet.prod-subnet.id
  private_ips     = ["10.0.1.50"]
  security_groups = [aws_security_group.allow_http.id]

  tags = {
    "Name" = "prod-nic"
  }
}

# ec2
resource "aws_instance" "prod-ec2" {
  ami           = "ami-04505e74c0741db8d" 
  instance_type = "t2.micro"
  availability_zone = "us-east-1a"

  network_interface {
    network_interface_id = aws_network_interface.prod-nic.id
    device_index         = 0
  }

  tags = {
    "Name" = "prod-ec2"
  }

  key_name = "terraform-access-ec2"

  user_data = <<-EOF
    #!/bin/bash
    sudo apt update -y
    sudo apt install nginx -y
    sudo systemctl start nginx
    EOF
}

output "server_public_ip" {
  value = aws_eip.bar.public_ip
}
```

# Lets Deploy


![out1.png](/img/blog/deploy-a-simple-server-using-aws-terraform/fPHP6aXqe.png align="left")
```bash
terraform init
```


![out2.png](/img/blog/deploy-a-simple-server-using-aws-terraform/EJ0iHoqr2.png align="left")
```bash
terraform apply
```


![ot3.png](/img/blog/deploy-a-simple-server-using-aws-terraform/XqveQnG20.png align="left")


![oo2.png](/img/blog/deploy-a-simple-server-using-aws-terraform/7I2Uq5DLS.png align="left")


![ss.png](/img/blog/deploy-a-simple-server-using-aws-terraform/Luh3VKJlv.png align="left")

# References
* [Terraform Blog](https://kubesimplify.com/introduction-to-terraform)
* [Terrafrom in 2 hours (freecodecamp)](https://youtu.be/SLB_c_ayRMo)

# Further read
[Blog on Terraform-tfvars](https://spacelift.io/blog/terraform-tfvars)

Hope it helps
Happy coding👍🏼🥳