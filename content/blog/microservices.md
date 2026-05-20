---
title: "Microservices"
datePublished: 2023-06-05T12:30:42.112Z
slug: microservices
author: naved-ahmad
cover: /img/blog/microservices/85c96338-8c65-4ec9-90ea-467b105debc4.jpeg
tags: ["microservices", "kubernetes"]
cuid: cliitylf00iw3amnvbzl8bc6n
---
Imagine a rapidly growing application that handles numerous user requests, processes data, and provides seamless functionality to users. In the traditional monolithic architecture, the entire application is bundled into a single unit, tightly coupled and dependent on a single technology stack. As the application scales, challenges arise: coordination between teams becomes complex, scaling specific services is inefficient, and the release process becomes time-consuming.

In this blog, we'll explore the transformative power of microservices architecture and how it overcomes the limitations of the monolithic approach. By breaking down the application into smaller, self-contained microservices, each responsible for specific business functionality, we gain unprecedented flexibility, scalability, and maintainability. But that's not all – we'll delve into the challenges of microservices and the various communication methods between them. Plus, we'll discuss different approaches for managing code in microservices, from monorepo to polyrepo.

## Before microservices - Monolithic Architecture

Before microservices, the standard way of developing applications was with a monolithic architecture. This means the whole code was a part of a single unit. Everything was developed, deployed and scaled as one unit. This means that the application must be written in a single language with one tech stack with a single runtime. And if you have different teams working on different parts of the application, they will need to coordinate to make sure they don't affect each other's work. Also, if developers change code for a specific functionality, then the whole application needs to be built and deployed as one package because you can't just update and deploy only one specific functionality in a monolithic architecture. So, this was the standard way of developing applications. But as applications grew in size and complexity, various challenges occurred.

### Challenges of Monolithic Architecture

1. Coordination between teams became difficult when applications became large and complex.
    
2. You cannot scale a specific service, instead, you would need to scale the entire application, which meant higher infrastructure costs.
    
3. The release process takes longer, because for changes in any part of the application in any feature, you need to test and build the whole application to deploy those changes.
    
4. A bug in any module can bring down the entire application.
    

The solution to all these problems was microservices.

## Microservices - Introduction

With microservices, we break down the application into essentially multiple smaller applications, so we have several small or micro applications that make up this one big application.

Here, we face some challenges. Like:

* When do we create a microservice architecture?
    
* How to decide how to break down the application?
    
* Which code goes where?
    
* How do they communicate?
    

Firstly, the best practice is to break down the application into components or microservices based on the business functionalities and not technical functionalities.

In terms of size, each microservice must do just one isolated thing.

A very important characteristic of each microservice is that they should be self-contained and independent of each other. This means each service must be able to be developed, deployed and scaled separately without any type of dependencies on any other service, even though they are part of the same application. This is called **loosely coupled**.

Each microservice has its versions which are not dependent on others.

## Communication between microservices

There are three ways by which microservices can talk to each other.

1. **Communication via API calls:** Each microservice has its API, and they can talk to each other by sending requests to the respective API endpoint. This is *synchronous communication,* where one service sends a request to another service and waits for the response.
    
2. **Communication via Message Broker:** This is *asynchronous communication*. Here, services will send messages first to the intermediary message service or a broker such as RabbitMQ and the message broker will forward that message to the respective service.
    
3. **Communication via Service Mesh:** This method is becoming pretty popular, especially in the field of Kubernetes. With service mesh, you have kind of a helper service that takes over the complete communication logic, so you don't have to code this logic into the microservices and have this communication logic kind of delegated to this external service.
    

Since the services are all isolated and talk to each other either with API calls or using additional services you can even develop each service with a different programming language, and you can have dedicated teams that can choose their technology stack and work on their service without affecting or being affected by other service teams. And this is the most important advantage of microservices architecture over monolithic architecture.

## Disadvantages of microservices

While microservices made developing and deploying applications easier in many aspects, they also introduced some other challenges that were not there before.

1. Configuring the communication between microservices, because a microservice may be down or unhealthy and not responding yet, while another service starts sending requests to its API expecting a fulfilled response but end up getting unexpected result.
    
2. With microservices deployed and scaled separately, it may become difficult to keep an overview and find out when a microservice is down or which service is down when something in the application is not working properly.
    

Tools are being developed to tackle these challenges. The most popular one we all know is **Kubernetes**, which is a perfect platform for running large microservices applications.

## How to manage the code

Now. you must be wondering that if these microservices get developed and deployed separately, then how do we manage the code?

For this, we have two ways: **Monorepo** and **Polyrepo.**

### Monorepo

Monorepo means having one Git repository for all the services.

But how do we structure multiple applications in one repository? A common way is using folders, where we have folders for each service, and all the codes for those services are in those respective folders.

A Monorepo makes code management and development easier because you only have to clone and work with one repository. Changes can be tracked together, tested together and released together.

There are some challenges we face with Monorepo. Like:

* We know that the biggest advantage of microservices is to be completely independent and loosely coupled, but in the case of mono repo, there is a tight coupling of services.
    
* When the application becomes big, git interactions (cloning, fetching and pushing) become slow.
    
* In terms of the CI/CD pipeline, in most of the CI/CD platforms like GitLab CI/CD or Jenkins, we can only create one pipeline for one project. Since we are building multiple services with a single project pipeline and that means we need to add additional logic in our pipeline code that makes sure to only build and deploy the service which has changed.
    
* Since we have just one main branch because we have one repository, if developers of one of the services break the main branch, then other services and their pipelines will be blocked as well.
    

### Polyrepo

In this, for each service, we create a separate git project.

However, there are separate application repositories, they are still part of this bigger application. So we want to have some connection between these repositories for easy management.

Here we have, a separate pipeline for each repository.

It also has some downsides. They are:

* Having code in multiple repositories can make working on the project harder, especially if we need to change two or more services at once.
    
* Searching, testing and debugging are more difficult.
    

So, that was a blog on Microservices.

Connect with me to get more content on DevOps, Open source and Cloud.

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.