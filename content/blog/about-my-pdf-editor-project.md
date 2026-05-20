---
title: "About my PDF-Editor Project"
datePublished: 2022-09-01T11:30:01.068Z
slug: about-my-pdf-editor-project
author: dipankar-das
cover: /img/blog/about-my-pdf-editor-project/mhZE7pjlD.png
tags: ["docker", "aws", "go", "javascript", "kubernetes"]
cuid: cl7iytlaq0np11unv71al7tme
---
# Inception

It all started with me thinking about a PDF platform that people can use instead of using licensed software. Came up with an idea of web-based which can be used on any device be it laptop or mobile, it is lightweight by default.

# Design

## PDF-Merger

![image.png](/img/blog/about-my-pdf-editor-project/OiUIaNeNg.png align="left")

## PDF-Rotator

![image.png](/img/blog/about-my-pdf-editor-project/fY7Wgjw4J.png align="left")

For the first few versions, it was a monolithic application, later converted to a microservice architecture

# Objective

* Helps in understanding JavaScript, Golang codebase
    
* A platform to implement DevOps methodology
    
* To make it useful to the end-user
    
* To use unit test of Golang and JavaScript
    

# Tech stack

* Go
    
* JavaScript
    
* Docker
    

> All the files mentioned are in https://github.com/dipankardas011/PDF-Editor

Followed the DevOps roadmap

%[https://www.youtube.com/watch?v=7l_n97Mt0ko] 

---

# Cloud Native Tools

Before going any further you need to know about the different components and how they communicate.

![image.png](/img/blog/about-my-pdf-editor-project/4yCe41nSB.png align="left")

Folder structure

![image.png](/img/blog/about-my-pdf-editor-project/h27-QzZIZ.png align="left")

## Docker

First lets start with Dockerfiles, here we used multiple stages for different use cases. To build and run multiple containers at once, use the Docker-compose

![Screenshot from 2022-08-02 23-36-15.png](/img/blog/about-my-pdf-editor-project/NQqEbUBLB.png align="left")

from src/backend/merger/Dockerfile In the above figure

> **prod-stage1** -&gt; build the executable for prod stage to consume

> **prod** -&gt; alpine image(reduced functionality and size) copy executable and templates directory to production image so that we can run as a production app

> **dev** -&gt; for development use where we mount the ${PWD}:/go/src/ and then work on the project without having to rely on the local computer go installation

> **test** -&gt; for testing the code using the docker image

> Here in the prod stage we don't require the go binary only need the template and exec file for running the app and thereby reducing the final built image

For Docker workshop

%[https://www.youtube.com/watch?v=EUu1E_YKGTw] 

## Kubernetes

As there were multiple containers I needed something to orchestrate them, docker-compose should work but I wanted something robust, so learned Kubernetes.

Created a deployment for backend and frontend, also learned how to attach volumes to the deployment for the backend container, added init-containers to load the data into the volume.

> deploy/backend -&gt; backend YAML files

> deploy/frontend -&gt; frontend YAML files

> deploy/monitoring -&gt; tracing, monitoring, visualization YAML files

Created the ingress rules (Used Nginx ingress) to connect to my app locally without relying on port-forward & Nodeport

Connected the persistence volume and persistence volume claim for the backend.

Used minikube as a production cluster (pdf-editor) (local system) as its free and minikube clusters can be stopped and started keeping Kubernetes data persistent which is not the case with kind.

```bash
minikube start --memory='3Gi' --nodes=2 -p pdf-editor
```

![image.png](/img/blog/about-my-pdf-editor-project/cmKQSJmpo.png align="left")

> In the above image it has Argo rollouts deployment so you see canary

Kustomization for controlled deployment to cluster

![image.png](/img/blog/about-my-pdf-editor-project/7-kfbdGt4.png align="left")

Helm charts: Fun fact are not needed but created and deployed to the artifact Hub.

> For basic deployment with no rollouts I used `deploy/cluster/backend` and `deploy/cluster/frontend` there is also `deploy/cluster/monitoring` for monitoring and tracing deployments

![image.png](/img/blog/about-my-pdf-editor-project/psNU7OW8h.png align="left")

Want to get started with Kubernetes? Check out this workshop.

%[https://www.youtube.com/watch?v=PN3VqbZqmD8] 

## Argo CD

Next I learned about Argo projects and implemented a simple ArgoCD. Also used advance concepts such as Argo Rollouts to have Blue-Green rollouts and Canary rollouts also configured & used Ingress

Added Horizontal pod autoscaler

![image.png](/img/blog/about-my-pdf-editor-project/2GjcAUAaw.png align="left")

> using labels we create an event that when target CPU Utilization &gt;= 80 then add more pods max of 4 or 6 in case of backend path of all the configs `deploy/canary`

> Canary rollouts for Frontend and Blue-green for backend components

![image.png](/img/blog/about-my-pdf-editor-project/z4_j2Vx_I.png align="left")

![image.png](/img/blog/about-my-pdf-editor-project/NuAg6Xazc.png align="left")

![image.png](/img/blog/about-my-pdf-editor-project/zM4-CwrwH.png align="left")

%[https://blog.kubesimplify.com/progressive-rollouts-with-argo-cd-rollouts] 

%[https://twitter.com/DipankarDas011/status/1544289031386976258?s=20&t=RjRlAh-NIvSWX00nmqskoA] 

## AWS with Terraform

Used Terraform Cloud to provision the infrastructure to deploy the latest version of the app to AWS EC2 instance for Staging

%[https://blog.kubesimplify.com/deploy-a-simple-server-using-aws-terraform] 

![image.png](/img/blog/about-my-pdf-editor-project/Qo72mFs4p.png align="left")

![image.png](/img/blog/about-my-pdf-editor-project/OlPfzV1Vi.png align="left")

EC2 instance dashboard

![Screenshot from 2022-08-04 18-53-47.png](/img/blog/about-my-pdf-editor-project/fQpKdRekZ.png align="left")

![image.png](/img/blog/about-my-pdf-editor-project/QQ58-vQdP.png align="left")

## Azure Web apps

Used Docker-compose for Production

> It is a manual deployment as docker-compose Linux app web is not available in IAC

![Screenshot from 2022-08-04 18-41-21.png](/img/blog/about-my-pdf-editor-project/cngOAW_6i.png align="left")

![image.png](/img/blog/about-my-pdf-editor-project/q-e8dVTG9.png align="left")

## Policy

### Datree

For the validation checks of Helm, Kustomize, YAML files I used Datree.

![image.png](/img/blog/about-my-pdf-editor-project/p1o7pOirN.png align="left")

Example of one of them

![image.png](/img/blog/about-my-pdf-editor-project/8gr1BTXlu.png align="left")

### Synk

Used Synk for vulnerability report of the entire GitHub Repo and Docker repo as well

![image.png](/img/blog/about-my-pdf-editor-project/hkYKWkTDp.png align="left")

### Aqua

Used for container vulnerability scans

![image.png](/img/blog/about-my-pdf-editor-project/4--p23xki.png align="left")

### Kyverno

Used to have policies imposed on the K8s cluster, like no use of Nodeport for security reasons

Used for policy enforcement, like no pod should have escalated privileges

![image.png](/img/blog/about-my-pdf-editor-project/yH7rKnrOr.png align="left")

![image.png](/img/blog/about-my-pdf-editor-project/h5EPd998g.png align="left")

![image.png](/img/blog/about-my-pdf-editor-project/2MyHAx7DU.png align="left")

## Jenkins

It's a CI/CD tool. It can work with any software and can also be integrated with Kubernetes Implemented a simple CI Jenkinsfile pipeline

Docker runs the Jenkins server container and then attached my host computer as an agent so that we can use all the tools available

![image.png](/img/blog/about-my-pdf-editor-project/FNd67MUkC.png align="left")

It listens to the GitHub main branch

![image.png](/img/blog/about-my-pdf-editor-project/6y9R1DI4k.png align="left")

![image.png](/img/blog/about-my-pdf-editor-project/QtVsjfotQ.png align="left")

![image.png](/img/blog/about-my-pdf-editor-project/5koG0hsSt.png align="left")

![image.png](/img/blog/about-my-pdf-editor-project/6ysv-Ijw1.png align="left")

## Ansible in Jenkins

Used Ansible Playbooks to configure and update the staging environment to latest alpha and beta release

![image.png](/img/blog/about-my-pdf-editor-project/C-GwSGpDl.png align="left")

![image.png](/img/blog/about-my-pdf-editor-project/45ckciURJ.png align="left")

> Config are in deploy/IAC/ansible-terraform

Here is learning material

%[https://blog.kubesimplify.com/lets-talk-about-ansible] 

## Tekton

Used creating CI/CD Pipeline with the help of K8s

Created tasks and pipeline for trying out the tool

> present in deploy/tekton-ci

created task (basic execution unit in tekton) then used them in the pipeline

%[https://twitter.com/DipankarDas011/status/1547935040327548930?s=20&t=RjRlAh-NIvSWX00nmqskoA] 

## Signing with Cosign

Used to sign the Docker Images

%[https://twitter.com/DipankarDas011/status/1546349997444468736?s=20&t=RjRlAh-NIvSWX00nmqskoA] 

![image.png](/img/blog/about-my-pdf-editor-project/oRXnrPEU3.png align="left")

## Monitoring

> All the files are in deploy/cluster/monitoring and in deploy/Logging

![Screenshot from 2022-08-04 19-09-32.png](/img/blog/about-my-pdf-editor-project/KpdpA3rPE.png align="left")

### Prometheus(Metrics)

Used to get telemetry from the application of interest. With custom scrape metrics config for application

![Screenshot from 2022-08-04 19-18-16.png](/img/blog/about-my-pdf-editor-project/okLoA-2Yb.png align="left")

![image.png](/img/blog/about-my-pdf-editor-project/1e7dNqIjJ.png align="left")

![image.png](/img/blog/about-my-pdf-editor-project/g7Wlfq_UI.png align="left")

![image.png](/img/blog/about-my-pdf-editor-project/c1Pwa7Hyn.png align="left")

### Grafana(Visualization and Dashboards)

it is a visualization tool for all kinds of data sources be it databases, time series, logs, traces.

Created custom dashboard to count the number of 200, 500 HTTP status codes received

![image.png](/img/blog/about-my-pdf-editor-project/x6qexdpET.png align="left")

![image.png](/img/blog/about-my-pdf-editor-project/0OOpPg4jr.png align="left")

### Jaeger (tracing)

Used OpenTelemetry and Jaeger for tracing backend calls

![image.png](/img/blog/about-my-pdf-editor-project/TBY1ArQjX.png align="left")

![Screenshot from 2022-08-04 19-09-32.png](/img/blog/about-my-pdf-editor-project/KpdpA3rPE.png align="left")

![image.png](/img/blog/about-my-pdf-editor-project/kA4tkr2GI.png align="left")

%[https://twitter.com/DipankarDas011/status/1544633495062200320?s=20&t=AAQD6SRl-AHXVEpDEV06Aw] 

### Loki + Fluent-bit (Logging)

Used the Fluent-bit to extract the container Logs applied filter and output to the Loki service which is a log aggregation system by Grafana

![](/img/blog/about-my-pdf-editor-project/88593832-cc97-4dd7-8960-b65d8ef51345.jpeg align="center")

Here are the logs collected

![](/img/blog/about-my-pdf-editor-project/b4cfd49e-5b8c-4232-ae39-0b4b06a1c35d.jpeg align="center")

%[https://twitter.com/DipankarDas011/status/1613608866427863041?s=20&t=Uuj9aLVv8iGUR1Kg2rmWuw] 

## CircleCI

Used the platform for automated Unit, Integration testing

![Screenshot from 2022-08-06 23-07-47.png](/img/blog/about-my-pdf-editor-project/OlAInYYSm.png align="left")

---

# DevOps

![image.png](/img/blog/about-my-pdf-editor-project/J43Rd8IGp.png align="left")

* Used the Terraform Cloud for the Terraform workflows
    
* For the continuous testing used the standard Jest and GO testing libraries and added them to the Github actions with trigger for the Pull requests and Push to **main branch**
    
* To use multiple Automation tools added CircleCI for test cases
    
* added PR and Issue templates
    

Finally, these tools really helped me out

* VSCode for all the coding
    
* Lens K8s IDE Amazing tool for managing your K8s using a UI
    
* Monokle by Kubeshop
    

![image.png](/img/blog/about-my-pdf-editor-project/MnqvtKbNk.png align="left")

Helped with adding correct labels for pods and their corresponding services

Currently working on -

* more than 2 PDF merge
    
* Rotate PDFs and more
    

Further Links: [SRS](https://docs.google.com/document/d/e/2PACX-1vQvfAZFG0Tw9MAXtXXXDDGFZ6967Iz9CK1rTE9Gl-cR8fKF268qoggKPIUhKGD3fWszGFEUfwoKYC9D/pub) [Github Repo](https://github.com/dipankardas011/PDF-Editor)

Finally thanks to Kubesimplify for allowing me to showcase my project🙏 Hope this blog is helpful 🥳

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.