---
title: "Istio & Service Mesh"
datePublished: 2022-10-19T12:30:45.502Z
slug: istio-service-mesh
author: brijesh-kori
cover: /img/blog/istio-service-mesh/zwsiUvIgNK.jpeg
tags: ["istio", "servicemesh", "kubesimplify"]
cuid: cl9fm4lcw0003tsnvc58ff28g
---
# Introduction 
Hello all, In this blog we are going to learn about Service Mesh and one of its implementation Istio, to understand the whole idea behind it, we are going to take look at the following points
- Service mesh & istio 
- Challenges of Micro-service architecture 
- Core features of service mesh 
- Architecture
- How to configure Istio?

## So lets get started 

![microservices-1680.png](/img/blog/istio-service-mesh/iisbeidUA.png align="left")

### **What is Istio? What is Service Mesh?**

Istio is a service mesh in order to understand Istio we need to understand service mesh 
**Service mesh : **
Service mesh is a popular solution for managing communication between individual Microservice applications , but why do need a dedicated tool and what are the challenges ?

![challenge.jpg](/img/blog/istio-service-mesh/fY2pVDbMk.jpg align="left")

# Challenges:
When we move from Monolithic to Microservice applications we introduce a couple of new challenges 
for eg: we have an online shop made up of several microservices like a) web server which gets the UI request, a payment microservice to handle the payment logic, shopping cart, Inventory and so on 
and we are deploying our microservice architecture on the Kubernetes cluster 
so now what does our current setup need? 

The different microservices need to talk to each other, there should be some sort of communication between all of them for the proper functioning of the online shop 

**so how does services know how to talk to each other ? what are the end points of each service ?
**

All the service endpoints that the web server talks to must be configured for the web server so when  we add a new Microservice we need to add the endpoint of that service to all the  microservice that need to talk to each other so we have that information as part of the application deployment code

**
Now what about Security in our microservice application setup ?**

![security.png](/img/blog/istio-service-mesh/7t7V7INek.png align="left")


Generally, In common Environments in development projects, you have firewall rules setup for your Kubernetes cluster maybe you have a proxy as an entry point that gets the request, so you have security around the cluster, however once the request gets inside the cluster the communication is insecure 
microservices talk to each other over HTTP or some insecure protocols also services talk to each other freely i.e Every other service inside the cluster can talk to any other service, so there is no restriction on that this means if the attacker gets inside the cluster he can do anything, we don't have any additional security inside 


![solution.png](/img/blog/istio-service-mesh/fQSDcJrst.png align="center")

# Solution
The solution to all this challenges is Service mesh. A service mesh with side care pattern 


![Sidecar.png](/img/blog/istio-service-mesh/DqfkkYahB.png align="left")

**side care proxy : **

- which handles the network Logic 
- acts as a proxy 
- third party application 
- cluster operators can congifure it easily
>You dont have to add that side car congifuration to your microservice deployment yaml file because service mesh has a control plane that will automatically inject this proxy in every micrroservice pod so now they can talk to each other through those proxies and the network layer for service to service communication consisting of control plane and the proxies is a service mesh

# Traffic split

In addition to the above features, one of the most important features of a service mesh is traffic split 
**what is traffic split  ?**

When changes are made to a payment application for example a new version is built, tested and deployed to the production environment obviously you can rely on testing but what if there is a bug you can't catch in testing so in this case you don't want to end up with a new version of a payment service in production that doesn't work 

![Canary Deployment.png](/img/blog/istio-service-mesh/bnPRJHQ7n.png align="left")

so you want to send maybe only 5% or 10% traffic to the new version over a period of time to make sure it really works . so with service mesh you can easily configure a web server microservice to direct 90% of the traffic to version 2.0 and 10% to version 3.0 which is also known  as canary deployment .

# Istio Architecture

Service mesh is just a pattern or paradigm and Istio  is one of its implementations
In Istio architecture, the proxies are envoy proxies which is an independent open source project
 which Istio and many other service mesh uses and control plane component is Istiod which manages and injects the envoy's proxies in each of the microservice pods 


![Archi.png](/img/blog/istio-service-mesh/P49w5GvfH.png align="left")

Note : 
> In earlier versions of istio until v.1.5 istio control plane was a bundle of multiple components it has citadel, mixer, pilot and some other components However in v.1.5 all of these components were combined in one single Istiod component to make it easier for operator to configure and operate istio So the architecture comprises two component, control plane which manages Data plane (group of envoy proxies)

# How to configure Istio ?

**so now how do we configure all these features for our mirco service application ?**

![config.png](/img/blog/istio-service-mesh/f2C1w-_th.png align="left")

As we don't have to adjust Deployment and service k8s YAML files so all the configuration for istio components will be done in istio itself having a clear separation between application configuration and service mesh configuration istio can also be configured with Kubernetes YAML files as it uses CRDs extending the kubernetus API CRD is nothing but a custom Kubernetes component/object for e.g.: Prometheus

SSo using a few istio crds we can configure different traffic routing rules between our microservices like which services can talk to each other, traffic split configuration, retry rules and many other network configurations and there are two main CRDs for configuring service to service communication

**a) Virtual Service **

how you route your traffic to a specific destination

**b) Destination rule**

Configure what happens to traffic for that destination, so we create CRDs and istiod converts this high level routing rules into envoy specific configuration and send that configuration out to all the envoy proxies as we don't configure proxies we configure control plane

Proxies can communicate without connecting to istiod


# Istio features

![features.png](/img/blog/istio-service-mesh/Crf2NKdHO.png align="center")


In addition to configuring proxies istiod also has a central registry for all the microservices so no need of a static configuration of endpoints for each microservice 
when a new microservice gets deployed it will automatically get registered in the service registry without the need of any additional configurations and using this service registry the envoy proxies can now query the endpoints to send the traffic to relative endpoints in addition to this dynamic service feature istiod also acts as certificate authority and generated certificates for all microservices in the cluster to allow secured TLS communication between proxies and those microservices 

## Metrics and Tracing 

Istiod also has metrics and tracing data from the envoys proxies that it gathers and later can be consumed by monitoring server like Prometheus or tracing servers etc. to have out of the box tracing for your whole microservice application

## istio Ingress gateaway
 
It is basically an entry point to your Kubernetes cluster it's like an alternative to nginx ingress controller so istio gateway runs as a pod in your cluster and acts as a load balancer by accepting incoming traffic in your cluster and gateway will then direct traffic to one of your microservices inside the cluster using virtual service component, and you can configure the gateway using the CRD gateway

# Conclusion

Now we have understood the concept of Service Mesh and Istio, I hope you have gotten the knowledge behind it and how you can use it. The next task for you is to practice,  explore & Implement! 

![End.jpg](/img/blog/istio-service-mesh/XDDcksJK0.jpg align="center")

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.

 

