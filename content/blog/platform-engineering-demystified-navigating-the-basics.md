---
title: "Platform Engineering Demystified -  Navigating the Basics"
seoTitle: "Platform Engineering Demystified"
seoDescription: "In this blog post, we’ll demystify the basic concepts of Platform Engineering by understanding how it’s a natural and necessary evolution to DevOps."
datePublished: 2024-02-24T17:30:50.148Z
slug: platform-engineering-demystified-navigating-the-basics
author: kunal-verma
cover: /img/blog/platform-engineering-demystified-navigating-the-basics/13e8b707-b736-443e-bcd2-b42d4901cc8f.png
tags: ["devops", "platform-engineering"]
cuid: clt0cxgh0000309juhi13c3yc
---
**Picture this:** You are working as a Developer in a fast-growing tech startup. A startup which is centered around the whole idea of operating through DevOps - **the whole philosophy of developers & operations collaboration, establishing an automated workflow and all that fun stuff.** The main aim being - creating a seamless and automated pipeline for faster software delivery to customers.

But, as the startup expands its portfolio of projects, you notice a **subtle shift** in the work environment! What was once a very streamlined and efficient process, powered by the DevOps principles now looked more like a **complicated puzzle**, with **missing pieces** and **connections out of sync**. Rolling out new updates became a challenge, dev environments for different teams lacked uniformity, automation scripts written in different languages and formats scattered all over the place, and finding & fixing bugs felt like solving a mystery in itself.

Overall, what was once a smooth collaboration between developers and operations was turning into a bit of a **struggle**, leaving everyone in team stressed and in **need of a new solution!**

[![Source: https://blog.twn.ee/en/design-systems-and-component-libraries](/img/blog/platform-engineering-demystified-navigating-the-basics/1dfad3dd-396a-42b5-80f7-413d85980095.png align="center")](https://blog.twn.ee/en/design-systems-and-component-libraries)

**Sounds pretty familiar, right?** Because this scenario isn't unique anymore. It’s the story of many companies navigating the path of expansion and innovation today. The very philosophy that initially fueled productivity – **DevOps** – now seems to be **causing more headaches than solutions.** And that's a hard yet compelling truth of modern software delivery!

Interestingly, the solution to this (atleast, its believed to be) already exists and is being adopted very rapidly by big tech giants and even early-stage startups. And that solution is - **Platform Engineering.**

**Platform Engineering is not just a buzzword;** it's a strategic shift from the pitfalls of today's DevOps reality to a modern software delivery approach.

In this blog post, we’ll demystify the **basic concepts of Platform Engineering**, building a solid foundation by understanding how it’s a natural and necessary evolution to DevOps.

# **The rise of DevOps - An Answer to Traditional Software Delivery**

To understand today's software reality, we need to take a step back and understand the reasons and events that led to the **advent (rise) of DevOps** in the whole software development workflow.

If we take a look at the traditional approach to software development and delivery back in the time (probably in the late **90s** and early **2000s**), making software was a bit like building a house in separate parts. On one side we had the developers, fully dedicating their time to **"crafting the code"** and on the other side, the operations team - responsible for the the actual software delivery, the underlying infrastructure and the maintenance of that infrastructure.

As software grew in size and complexity, this **"siloed approach"** led to communication gaps, a lot of delays, and a lack of synergy among these internal teams. On one hand, if developers wanted to get anything done to run their applications, they had to go through the operations team and on the other hand, the operations were totally dependent on the developers for any issues in the production environment. This approach was termed as - **“throw over the fence” workflow**, which eventually led to poor experiences on both sides of the fence. As an industry, we all agreed this was not the ideal we should aspire for!

[![Source: https://medium.com/@yevgeniy.zhitomirskiy/what-is-devops-9a1acc0c2a28](/img/blog/platform-engineering-demystified-navigating-the-basics/be7c252d-6ff3-4de7-a92c-b6ee1e273f0b.png align="center")](https://medium.com/@yevgeniy.zhitomirskiy/what-is-devops-9a1acc0c2a28)

Thus, DevOps quickly established itself as a solution; **a cultural shift that aimed to break down this "silo" and foster collaboration between both sides of the fence.** The main aim being - to align the “Development” and “Operations” teams towards the goal of delivering software at higher speeds. Complimented with the modern approach of **Continuous Integration and Continuous Delivery (CI/CD)**, the aim was to introduce automation and smooth collaboration in the software lifecycle for a faster and more reliable software delivery, plus **reducing the cognitive load** for both the teams at the same time.

![](/img/blog/platform-engineering-demystified-navigating-the-basics/4400104e-9dda-4a18-94b4-f53fb8f96462.png align="center")

# Going Beyond DevOps - Pitfalls in Today's Software Reality

Now, although DevOps as a philosophy started with a great intent and did solve many problems, we also saw scenarios where following DevOps clearly didn’t make sense and it seemed to be causing more headaches than solutions. Let us analyse how this happened!

We all agree that the decade of **2010** saw a tremendous growth in cloud adoption and containers. I often like to refer this phase as a **“revolution in the software industry”** and there are a lot of [factual data available](https://www.techrepublic.com/article/the-most-important-cloud-advances-of-the-decade/) that proves this point.

> To give you a glimpse of this adoption phase:
> 
> AWS went from 100K customers in 2010 to a million in 2015. Docker which was introduced in 2013 had 100K companies using/evaluating in 2014, and within a year, a million companies were using containers in the form of Docker 😲

I’ll not get into the details, but essentially, this enabled organisations to **build softwares with a bit more complex architectures that can be easily scaled and distributed very well at the same time.** But, with this increasing complexity of software the areas of concern for an organisation weren’t just limited to a faster application development and delivery. With an increasing adoption of **cloud native philosophies** such as **security, reliability, availability** and the development of a diverse variety of solutions to achieve these, organisations had to adapt their existing strategies to tackle these broader areas for long-term success in the ever-changing tech ecosystem.

Thus, this also meant that **“setups”** became a lot more complex. **Those were long gone when you just needed to run a single script to deploy a simple application on a server, connected with a database service.**

Let us see an analogy to understand this in a better way.

Imagine you have a single DevOps team (developers + operations combined - let’s call it **Team A**) to manage the entire workflow of software delivery. This includes everything from application development and infrastructure provisioning to application deployment and continuous maintenance of the production environment. It's a continuous cycle.

To streamline these operations, the team wisely chooses a specific toolchain - **Kubernetes for orchestration**, **Terraform of infrastructure provisioning**, **Jenkins for the automation pipeline** and so on for all the different stages of a DevOps cycle.

![](/img/blog/platform-engineering-demystified-navigating-the-basics/46ca864d-1793-47eb-a38f-c4c0014e2a37.png align="center")

Now, with increase in software complexity, you would agree that achieving efficiency demands scaling up, so now we have another DevOps team in the process. Let’s call it **Team B.**

The interesting part is, with a lot of solutions around for the same problem, they now have the freedom to choose a different toolchain to manage their segment of the underlying software infrastructure, in their own way. For instance, they might go for **Amazon EKS for orchestration**, **Pulumi for infrastructure provisioning**, and so forth.

So now, we find ourselves with two DevOps teams, each operating with a distinct toolchain, all under the umbrella of the same organization.

![](/img/blog/platform-engineering-demystified-navigating-the-basics/7966dfde-03f9-460a-9afd-961f6c3828dc.png align="center")

**Sounds efficient?** Well, let’s elevate this scenario and imagine **10x** more teams working in the similar fashion to build different parts of a complex software.

![](/img/blog/platform-engineering-demystified-navigating-the-basics/2b8bc8ec-82ad-4801-a12d-f665b3b3b0db.png align="center")

Not sounding much efficient now, right? And the truth is, it isn’t at all and here are a couple of reasons why:

* **Re-defining roles in “You Build it, You Run it”**
    
    The idea of "You Build it, You Run it" means developers are not just writing code but also responsible for managing the entire process, **from testing to deploying and running applications.** While this may seem efficient, it puts **extra pressure** on developers to learn and handle infrastructure tasks. This can divert their focus from their main expertise - **coding and building application logic**, thus may result in decreased application quality and overall user experience.
    
* **Hard to Scale**
    
    When **multiple DevOps teams** use different toolchains for similar tasks - for example, Team A is using **Terraform** for defining their cloud infrastructure, but Team B is performing the same task with **Pulumi**. This leads to a lack of consistency. As the number of teams grows, managing and coordinating becomes complex, resulting in a bottleneck for software delivery. This lack of uniformity in the organisation hinders scalability and efficiency.
    
* **Lack of Expertise**
    
    With the **"You Build it, You Run it" approach**, developers might need to stretch their expertise beyond coding into the complexities of infrastructure and operations. This dual role can **spread skills thin**, potentially **leading to gaps** in specialized knowledge required for efficient problem-solving.
    
* **Increase in TicketOps**
    
    Now, developers, dealing with both coding and operations, might find themselves **seeking help more often**. Therefore, **relying on Ops teams** for rescue missions increases the number of **support tickets**. This dependency on Ops can **slow downthe workflow**, creating a **bottleneck** in issue resolution.
    
* **Inconsistency across the Organisation**
    
    The **diversity of toolchains** used by different DevOps teams within the same organization leads to inconsistency. Each team might prefer different tools and services, making it challenging to maintain a standardized approach. This lack of uniformity can result in **confusion, inefficiencies, and hinder collaboration.**
    

Overall, while the initial concept of combining development and operations aimed for efficiency, a consistent pattern of the observed challenges lead to re-evaluation of this approach. The goal being simple - **to find a balance that ensures efficiency, scalability, and expertise while maintaining consistency across the organization!**

# The Era Of Platforms

Alright, I hope we agree that DevOps started with a great intent, but due to increased software complexity with time, **we are in the need of a different and a modern strategic approach to meet today’s software needs.**

Essentially, the most basic need is to standardise the vast pool of toolchains being used by different teams under the same organisation, to streamline operations and reduce overall complexity of software production. And, this can be achieved by building a **“Platform”.**

In simple terms, a **“platform” is developer-friendly interface** that grants **easy access** to underlying infrastructure technologies like **VMs** or **cloud services**, eliminating the need for an in-depth understanding of the technical nitty-gritty behind them. It basically makes things easier by combining different tools and services in one place, so developers can focus on what they do best i.e. building the application logic, instead of dealing with all the technical stuff underneath such as, the infrastructure itself.

![Source: https://www.gorkem-ercan.com/p/understanding-the-p-in-idp](/img/blog/platform-engineering-demystified-navigating-the-basics/4367a2a7-3887-4573-bf78-f7b0828c1edc.png align="center")

Interestingly, this particular concept of **building an internal platform that can be commonly accessed by different team is not very old!** With the increasing adoption of cloud technologies as well as the growing complexity of applications, many advanced organisations and big tech giants like Google, Facebook, [Airbnb](https://www.infoq.com/news/2019/03/airbnb-kubernetes-workflow/), and [Netflix](https://netflixtechblog.com/neflix-platform-engineering-were-just-getting-started-267f65c4d1a7) have already been working on and adopted such an approach to increase their **team’s productivity**, **speed** and **flexibility** for building complex softwares with maximum efficiency.

Although, we’ll be looking into “platforms” from a bit more technical standpoint in the next section, let's quickly highlight the advantages this methodology brings to the table:

* **Developer-Centric Access:** Platforms follow a more developer-friendly and self-serving approach, offering easy access to standardized tools without requiring deep expertise. This enables developers to concentrate on building applications instead of getting entangled in infrastructure complexities, resulting in faster learning and time to market.
    
* **Standardization Principle:** “Standardization” - **thats the main and the most basic principle on which a platform methodology works upon.** Platforms essentially provide a well-defined ecosystem to developers by gluing together applications and the infrastructure underneath them. This ensures that every distributed team within an organization adheres to the same set of tools and processes, **fostering better collaboration** and reducing cognitive load on team members.
    
* **"You Build it, You Run it" Simplified:** “**Developers should be able to deploy and run their apps and services end to end**” - that was the principle of “You Build it, You Run it” and honestly, the main challenge as well at the same time (as we discovered above). With Platforms coming into the picture, **developers now have the flexibility to focus on their core expertise** i.e. building the application logic itself (coding), without the need to worry or delve into the complexities of the underlying infrastructure and the technologies associated with it. Thus, fully dedicating their time and efforts in developing new features, building an efficient application logic, fixing bugs instead of worrying about - **“how do I provision an EKS cluster to run and test my application?”.**
    

# Platform Engineering - The Evolution of DevOps

So, what is Platform Engineering? **It's the art of designing, building, and maintaining platforms** - simple as that! Well, atleast thats the most basic way to define a rather complex philosophy with a lot of different parts to it, but we’ll eventually get into those.

The primary goal? **To improve the developer experience and productivity by providing “self-service” capabilities with automated infrastructure operations.** As we learned in the previous section, this goal can be achieved by standardizing the usage of tools and processes across the organisation with **a unified (common) internal platform**, that caters to all the non-functional requirements of the application (the actual software), based on the developer’s request.

> **📍What are the non-functional requirements of an Application?**
> 
> Non-functional requirements are like the behind-the-scenes tasks needed to get a finished software to users. They're not the actual business logic or code but important for making sure everything runs smoothly and is complete.
> 
> Think of them as the backstage crew making sure the show goes on seamlessly for the audience!
> 
> Here are some of the **basic non-functional requirements** needed by today’s software:
> 
> ![](/img/blog/platform-engineering-demystified-navigating-the-basics/89e2db9f-211d-4e7a-b361-1a1a60f05fd0.png align="center")

To achieve this in an organisation, we have a dedicated platform engineering team. This team is responsible for the **entiregroundwork of designing, building and maintaining these internal platforms.**

To delve a bit deeper, let’s elaborate this a bit more by understanding the components of Platform Engineering.

# Components Of Platform Engineering

TLDR; You essentially need 3 things to implement platform engineering the right way:

* the platform itself,
    
* a platform team (comprising of platform engineers) and,
    
* a correct ideology to follow for maximum results.
    

Let us elaborate these a bit more.

## Internal Developer Platform (IDP) - The Platform Itself

The most integral part of implementing the Platform Engineering philosophy in an organisation is the platform itself, which is referred to as the Internal Developer Platform or IDP.

If we go by the [official definition](https://internaldeveloperplatform.org/) of an IDP:

> An Internal Developer Platform (IDP) is built by a platform team to enable developer self-service. An IDP consists of many different techs and tools, glued together in a way that lowers cognitive load on developers without abstracting away context and underlying technologies.

In simple terms, IDPs are configured by a separate platform engineering team and used by developers. Again, the goal is to standardize the the use of tools and processes throughout the organization with this unified (common) internal platform. Therefore, t**he platform team is fully responsible for specifying what resources start up with what environment or at what request.** The tools, the underlying the services and the necessary permissions needed to run those services all are the responsibilities of platform engineers. Thus, giving a whole lot of flexibility to the developers. They can now **effortlessly request** their preferred tool or service, dynamically configure it based on specific use cases, and concentrate on building the actual application at an accelerated pace.

## The Platform Team - Actual Builders

To elaborate a bit more on the platform team, it consists of “platform engineers” who primarily **build, run, configure and maintain the IDP.** This team focuses on “standardization” by **design, infrastructure, service level permissions, and configure the IDP** to automate recurring or repetitive tasks, such as spinning up resources or environments for developers. In the end, the Developer teams gain flexibility of **changing configurations, deploying the application, spinning up fully provisioned environments**, and much more.

## Hold On A Second!

But, hold on a second! If I'm getting this right, there's now a separate Platform team which is responsible for building this common platform (IDP) with a set of fixed tools/services (that too company-wide) which they decide and as a developer, I can ask for what I need and how much I need based on my own requirements. **Doesn’t this defeat the purpose of the collaborative approach of DevOps itself, where we brought together the responsibilities of both development and operations to avoid the old "siloed" way of doing things?** Because it seems like now, as a developer, I'd be constantly reaching out to the platform team for the services I want.

![](/img/blog/platform-engineering-demystified-navigating-the-basics/23e9ed74-c494-44ab-96ec-6b39d7e366ca.png align="center")

It absolutely does sound that way and we definitely agree to not walk on that path again, right?

There’s actually more to this and the interesting part lies here!

What a platform team actually does is, apply their “Ops” expertise in configuring the actual underlying infrastructure tools and service - let’s say **Kubernetes for orchestration**, **Google cloud as a cloud platform**, **database service** etc - essentially, all the tools necessary to meet the non-functional requirements of an application, as discussed earlier. On top of this, they build an **“abstraction layer”** in the form of a user interface, consisting of those same tools and services, ready to be used and without the underlying complexity - **which we refer to as an Internal Developer Platform (IDP).**

Moving forward, from here on the developers can **“self-serve”** their needs of different tools and services through this internal platform, without worrying about:

* the nitty-gritty of the underlying infrastructure,
    
* learning that specific tool or service end-to-end in order to implement it and,
    
* constantly requesting new resources/services directly from the platform team.
    

![](/img/blog/platform-engineering-demystified-navigating-the-basics/8f54925f-6af8-4392-b89e-912f7378d985.png align="center")

This is a game changer and I hope you can see that too now!

When using these IDPs, developers now have the flexibility to choose the right level of abstraction for running their apps and services, based on their preferences. **For instance, do they like messing around with Helm charts, YAML files and Terraform modules?** Great, they can do so. **Are they a junior frontend developer who doesn’t care if the app is running on GKE or EKS?** Fantastic, they can just self-serve an environment that comes fully provisioned with everything they need to deploy and test their code, without worrying where it runs!

To end this section, we mentioned above about **“following the correct ideology”** when building these internal developer platforms for maximising the results and efficiency of all the teams. **What is that correct ideology?** Well, that is something we’ll be covering in a future article because of the topic complexity and importance.

# **Leveraging Platform Engineering to Address DevOps Challenges**

In one of the previous sections, we talked about the challenges and pitfalls associated with DevOps when used in today’s software workflow. Let us briefly see how the principles of Platform Engineering come out as a solution to those challenges.

* **"You Build it, You Run it" Harmony:** We talked about the **cognitive load** on developers how due to Ops being embedded in Dev. With Platform Engineering, this principle gets refined. Developers can now focus on building the applications using **readily available, self-serviced infrastructure tools and services** provided by a common internal platform, while a dedicated platform team manages the entire underlying operational aspects. This establishes a **collaborative bridge between Dev and Ops**, without overwhelming either side with additional responsibilities.
    
* **No More Expertise Stress:** Internal Developer Platforms act as a **technical facilitator**, reducing the burden on developers to have extensive expertise in all areas of the software lifecycle (development and operational knowledge). The platform team handles the intricate technical aspects, **allowing developers to focus on their core responsibilities i.e building the actual application logic.**
    
* **Bye-bye TicketOps:** Internal Developer Platforms empower developers through self-service capabilities, **allowing them to access necessary tools and resources whenever and however they need.** This essentially eliminates the need for constant ticket submissions or requests for new services to the platform team. Thus, fostering a more streamlined and efficient workflow.
    
* **Consistency for All:** Platforms bring order to the tech chaos. **Everyone in the team follows the same rules and tools across the organisation**, ensuring a smooth and consistent approach. This results in accelerated and efficient software delivery, **as everyone operates within the same framework.**
    

# Wrapping Up - Conclusion

Yes, it might seem surprising to reach the conclusion already, but our main goal was to **lay the ground work for understanding the fundamental concepts of platform engineering** and, most importantly, to answer the crucial question: **why is it needed?**

The knowledge gained here will definitely help building a solid foundation for upcoming articles that will delve deeper into the intricate world of Platform Engineering.

Rest assured, there's much more to explore in Platform Engineering **besides it being a hype and a natural evolution of DevOps.**

If you have any further questions, feel free to reach out to me on [Twitter/X](https://twitter.com/kverma_).

**Happy learning and see you in the next one!**

Follow Kubesimplify on [**Hashnode**](https://blog.kubesimplify.com/), [**Twitter**](https://twitter.com/kubesimplify) and [**LinkedIn**](https://www.linkedin.com/company/kubesimplify). Join our [**Discord**](https://kubesimplify.com/discord) server to learn with us.