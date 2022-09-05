terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_apprunner_service" "example" {
  service_name = "kubesimplify-website"

  source_configuration {
    image_repository {
      image_configuration {
        port = "3000"
      }
      image_identifier      = "public.ecr.aws/dipankardas011/kubesimplify-website:latest"
      image_repository_type = "ECR_PUBLIC"
    }
    auto_deployments_enabled = false
  }

  tags = {
    ResourceType = "prod-website"
  }
}
