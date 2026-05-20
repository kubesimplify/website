---
title: "Navigating through CNCF landscape"
datePublished: 2022-03-27T05:07:02.168Z
slug: navigating-through-cncf-landscape
author: anurag-kumar
cover: /img/blog/navigating-through-cncf-landscape/JuPkTShDq.png
tags: ["opensource", "kubernetes", "beginners", "ci-cd"]
cuid: cl18tkhbf03uvsenv1kmpdvdt
---
#### What is CNCF?
CNCF serves as a vendor-neutral home for many opensource projects. 
CNCF is a very welcoming community and all types of contributions are welcome. 

In CNCF there are three types of projects
1. Graduated Projects - In this category we have matured projects which are ready for production use cases. These projects have gone through a lot of security scans and checks. Examples - K8s, Prometheus, Linkerd etc. 
2. Incubating Projects - These are projects which are still growing and getting production ready. Examples - ArgoCD, Chaos Mesh etc. 
3. Sandbox Projects - The CNCF Sandbox is an entry point for projects into the CNCF ecosystem. Examples - Keptn, Kyverno etc. 

You can checkout the landscape [here](https://landscape.cncf.io)

If you're looking at the landscape for the first time then it's very overwhelming. I will try to break it down into components that will make sense to you. 

Just think how a cloud native application is built from scratch and you will see that the landscape which was scary before has started making more sense.

### Containerization

The first step you do is write your application code and containerize that with the help of containerization tools like docker, crio, podman etc. This is where containerization comes into picture and there is a separate section for that in the CNCF landscape. Container runtimes are responsible for running our containerized workloads on a host operating system.


![Container Runtime](/img/blog/navigating-through-cncf-landscape/eqhlNj8wK.png)

## Container Registry 

After containerizing our application, we need to store our images somewhere and this is where container registry comes into picture. We have a separate section for container registry and this portion lists all the projects under this category. 

![Screenshot from 2022-03-26 13-28-08.png](/img/blog/navigating-through-cncf-landscape/DZxuuI2Oq.png)

### CI/CD

After containerizing our application we need to set up CI/CD for our application so that it automates the process of building an image and pushing it to the container registry. The process look something like this : 

![CI-CD](/img/blog/navigating-through-cncf-landscape/S1eVxr89e.png)

In the above diagram Jenkins is used to automate the CI-CD workflow we can use other tools too in place of Jenkins. We can also use different tools for CI and different tools for CD. 

For CI/CD projects we can look at the CI/CD category of the CNCF landscape. 


![CI-CD landscape](/img/blog/navigating-through-cncf-landscape/xx91MfAn-.png)

Please note that not all of these projects are cncf projects. Some of these projects are CNCF member projects and some are non CNCF member projects. You can filter that on the landscape page. 


## Scheduling and Orchestration 

To manage large number of containers we need orchestration engine that will ease out the process of managing containers. Container orchestration engine is responsible for managing, scaling, deploying and networking of containers. The most popular container orchestration engine is Kubernetes. Kubernetes was the first project to graduate from CNCF. 


![Screenshot from 2022-03-26 13-39-31.png](/img/blog/navigating-through-cncf-landscape/mmfdxob4i.png)

## Application Definition and Image build 

In kubernetes we have to deal with multiple k8s manifests. We can use helm to easily install applications into our kubernetes clusters. Helm is a package manager for kubernetes applications. Monokle is another tool that eases out the process of managing YAML files. It provides one command installation of apps. We can upgrade a release with one command and if something goes wrong we can rollback as well. In this section we also have multiple build tools like packer, buildpacks etc. 


![Screenshot from 2022-03-26 13-41-25.png](/img/blog/navigating-through-cncf-landscape/25GNJHKOQ.png)

## Observability and Analysis

we need to add some observability and analysis layer to our application and here we will use different tools for monitoring, logging, tracing, profiling. Monitoring is an important aspect of application. Monitoring gives you actionable insights into application. 

#### Monitoring related projects can be found in this section: 

![Screenshot from 2022-03-26 13-58-48.png](/img/blog/navigating-through-cncf-landscape/5f-f9cfOD.png)

#### Logging:

Logs help engineers in debugging when something goes wrong with the system. It also provides observability into kubernetes clusters. 


![Screenshot from 2022-03-26 14-05-38.png](/img/blog/navigating-through-cncf-landscape/rwarBW7-_.png)

#### Tracing:

Tracing is used for monitoring and troubleshooting microservices based distributed systems. Popular tracing projects include Jaeger and OpenTelemetry.


![Screenshot from 2022-03-26 14-06-50.png](/img/blog/navigating-through-cncf-landscape/tQANY5Dba.png)

#### Chaos Engineering and Continuous Optimization:

For checking the reliability of our systems and kubernetes clusters we can use chaos engineering tools like litmus chaos, chaos mesh etc. We can also use continuous optimization tools for our application.


![Screenshot from 2022-03-26 14-11-45.png](/img/blog/navigating-through-cncf-landscape/qnFH1WHxw.png)

## Service Proxy and Service Mesh:

Now to expose our application to end users we need to expose our services. To manage our services we need service proxy and if we have proliferation of services then to manage that we need service mesh. It is also used to trace the traffic and observe the application. Services also act as load balancers.


![Screenshot from 2022-03-26 14-14-50.png](/img/blog/navigating-through-cncf-landscape/-a0wVBgvd.png)

Projects under service mesh include:


![Screenshot from 2022-03-26 14-16-05.png](/img/blog/navigating-through-cncf-landscape/q6UNu8icF.png)

## Cloud Native Network 

we need to set up the networking for our cluster and for that we have the cloud native network section. Cilium and CNI popular projects in this category. [Cilium](https://cilium.io/) is an open source software for providing, securing and observing network connectivity between container workloads. 


![Screenshot from 2022-03-26 14-17-57.png](/img/blog/navigating-through-cncf-landscape/VFmLyZyrZ.png)

## Security and Compliance 

We can’t ignore security of our Kubernetes cluster and for that we have the security and compliance section and under this we have popular projects like OPA, falco etc. We can also define policies for our kubernetes clusters with the help of OPA, kyverno etc.  


![Screenshot from 2022-03-26 14-24-04.png](/img/blog/navigating-through-cncf-landscape/sjfH_LXxC.png)

## Database 

A cloudnative database is designed to take full advantage of cloud and distributed systems. Projects under this category are: 


![Screenshot from 2022-03-26 14-36-21.png](/img/blog/navigating-through-cncf-landscape/x1uP_kmvt.png)

## Storage

Rook is a popular project under this category. It works as a storage orchestrator for kubernetes. 

Projects under cloud native storage include: 

![Screenshot from 2022-03-26 14-40-17.png](/img/blog/navigating-through-cncf-landscape/lQ8MWzLU9.png)

## Streaming and Messaging

Cloud-native streaming is the processing of continuous data streams and is commonly used for large amounts of data and Cloud-native messaging is a communications model that enables asynchronous push-based communications between microservices. You can read more about it [here](https://www.cherryservers.com/blog/introduction-to-cloud-native-streaming-and-messaging-services).

Projects under this category include: 


![Screenshot from 2022-03-26 14-50-31.png](/img/blog/navigating-through-cncf-landscape/xFJDaesZ5.png)

These are the main sections of CNCF. It includes some others sections as well which I have not covered in this blog like serverless, coordination and service discovery etc. I hope this will give you a brief idea about CNCF landscape. 

Reference - 

- [CNCF landscape](https://landscape.cncf.io/)
- [Saiyam Pathak Video in Hindi](https://www.youtube.com/watch?v=GrSPJOuG54w)
- [CNCF projects brief overview in 40 minutes by Carson Anderson](https://youtu.be/H_BkBVAsVHQ)
- [Navigating the CNCF landscape kubecon talk](https://youtu.be/u7vUA61sZI4)
- Project Documentations