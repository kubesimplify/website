---
title: "Why DevOps-Case Study"
datePublished: 2022-06-15T12:26:43.865Z
slug: why-devops-case-study
author: prateek-singh
cover: /img/blog/why-devops-case-study/Y2NXGvIjm.jpg
tags: ["devops", "devops-articles", "devops-trends", "why"]
cuid: cl4fki2xa004wg1nv1ulg17q1
---


![13429_ILL_DevOpsLoop.webp](/img/blog/why-devops-case-study/gH7hEX3j5.webp align="left")

DevOps is the new and efficient way of **developing applications**. It is a collection of practices that shortens the **development lifecycle** of a system/application. It's not just *frontend*, *backend*, *database* and scripting. It is something that changes how we design and develop our applications. Big enterprises want to be DevOps but fail to understand what it really is, is it a set of **tools** ? Or is it a team of **DevOps** engineers working along with Devs and Ops ? Is it just **CI/CD** ? Also, how do we **"do"** DevOps ? Or do we **"become"** DevOps ?

All the above-mentioned questions will be answered throughout the Blog. The flow of this article is something like this: 
- **Setting the stage:** To give some background knowledge to beginners.
- **Understanding the problems**: To see some real world case studies and observations.
- **Problems**: Listing and briefing.
- **The Goal**: What do we want ?
- **How software is developed**: To point out how why we are unable to reach the goal.
- **Why DevOps**: To understand what perks DevOps provide.

I tried to make this blog as inclusive as possible, doesn't matter if you are someone trying to convince your boss about the new big thing, a developer getting involved with the tools, a student setting their first steps in the new era of application development or an organisation trying to adopt the set of practices involved with DevOps. There is something here for you. Let's get started with the basics.


## Setting the Stage

### How things work in a company:

![Accenture-Breaking-Development-Operations_1.jpeg](/img/blog/why-devops-case-study/SefEdIt7V.jpeg align="center")

Initially, the software lifecycle had three phases, First the **Planning** phase, where the stakeholders, innovators and business people decided "What needs to be build" that people will use and what problem does it solve. Then comes the **Development** phase, where the developers write code to build the application they wanted according to the designs and architectures provided to them. 

when the code is running perfectly in their servers/computers, they finally hand it over to the **Operations** team, who is responsible for having the applications always running for the end users like us. 

>> This is the process explained in the simple terms, the teams do more things than mentioned above, but it's all you need to know for now.

The above procedure seems quite normal, right ? You might be asking, what is the problem here ? That's what takes us to the next section, where we will see some real world scenarios.

# Understanding the problems

## Case studies :
> Technology is the **enabler** of innovation and not the **driver**.

### Disruptors and Incumbents

#### 1: **Uber and Taxi Industry**

![taxi-vs-uber.jpeg](/img/blog/why-devops-case-study/MlY8kON95.jpeg align="center")

When was the last time you called a local taxi dispatcher or waited for a taxi to drive by?
I can say it's been a while, It's because you have a smartphone, where you can book your ride, track it and even pay for it. Uber is a big disruptor ! But what different did they do? Did they cheat ?

People often say "oh, the technology disrupted me" so let's break it down.
- **Live tracking** of the ride needed GPS, but the technology has been around for a while and the taxi industry also had access to it.
- **Electronic payment**, but even that is a fairly old and easily accessible tech.
- **Book anywhere using your smartphone**, Almost every pocket has a smartphone these days, Uber still didn't build something new.

Even though the taxi industry had access to the same tech, they suffered because they lacked "innovation" and the speed for "adaptation" according to user's needs. Uber had a business model that combined all the above-mentioned pieces and made something that provided people **a cheap**, **Easy to book**, **Easy to track** and **Easy to pay** option for ride-sharing. 

So, the taxi services are almost gone, because they preferred lobbying Albany instead of developing a software themselves.

It's not just about starting right like Uber, the point is to keep adapting as the market changes.

#### 2: **Blockbuster and Netflix**

![2005-Netflix-vs-Blockbuster-–-Chart.jpeg](/img/blog/why-devops-case-study/TgRhl68Dj.jpeg align="center")

Almost all the nice shows we want to watch today are just one click away now, **Netflix** made it possible, but it wasn't always like this. 

Let's go back to when **Blockbuster** was the big thing. Back in the 80s, videotapes (VCRs) were the way we watched shows. People would physically go to the store and rent the tapes, in fact they paid penalty if they returned them late ! 

Then came DVDs, Blockbuster had a robust working model, which was tough to change because it was spread out on a large scale and the VCRs were working fine. But Netflix had some different plans. They started mailing the small DVDs directly to their customer's home. There is no late fees even if you return the DVD(s) late, you just won't get another one until you return the previous one. **Convenience** for the customers !

Netflix did not stop. When they noticed broadband connections being common in almost every household, they stopped with the DVDs and started broadcasting directly to the customer's home. **Convenience at it's peak!**. Blockbuster couldn't change, they couldn't keep up, and now they are gone.

But it's not always a sad story. Cheer up !

#### **3: Garmin and GPS**

Garmin faced similar issues as Blockbuster. GPS was coming around, providing extended features like maps and user-friendly navigation. They were disruptors, But Garmin was able to pivot, they realized their business model. They were not in the mapping business, instead they were in the tracking business. So they started making tracking equipments like wristwatches and see, they are still around !

> You either adapt or you go extinct !

### The Problems

Almost half of the Fortune 500 companies that existed in the year 2000 are gone. But what is the problem ? It's not that companies like Blockbuster did not want to change, they just could not. There was a serious flaw in the way their organization worked. They were not **fast**, their services were not updated quickly and they lost customers.

The answer is simple. There is a problem in the way software is being developed. User's needs are changing rapidly, and if someone else provides them what they need, and you don't , they switch. If your applications and services take months to add the new features that are already being provided by someone else, you are loosing a lot of business. The organizations were not fast enough to adapt. But why were they unable to adapt ?

#### Dev vs Ops: The wall of confusion

![Imagen-1-texto-Emi.png](/img/blog/why-devops-case-study/p1dcLE1wO.png align="center")

It is not that the Developers team did not want to code, or the operations team did not want to run the application. The Devs wanted to roll the updates and features asap, because that was their job, **CODE**. Similarly, the Ops team wanted the application to keep running and not collapsing and denying end-users their services, after all, that is their job. But this caused **change** vs **stability** discussion.

#### **2: Dev vs IT**

Devs were trying to evolve, they were getting faster in their job through **Agile** and **Extreme programming**, which we will discuss ahead. So the new features and updates were being coded in sprints and significantly faster. But still they needed hardware to run the software on. **Virtual machines (VMs)** were needed for testing the code, and the procedure to getting them was hilarious at that time.

IT team used to say, you need more VMs ? Open a ticket, and we will try to provide it as soon as possible. It almost took 20-30 mins to make a VM, but that actually took months. All the speed was wasted because the Devs couldn't even test whether their code works or not. They were stuck.

The entire thing was a mess. People did not take responsibility of their own work. They were treating the software development project like a civil engineering project! **Do your job and pass it on,** nobody cared about their impact in the entire project. The traditional **Waterfall method** combined with **monolithic architecture** made it impossible for the new features to be developed and rolled out fast.

### What is the Goal ?

Agility is the Goal, you want to be moving with maximum velocity and minimum risks, with proper experimentation, testing and turning every stone, so that you don't fall behind the customer's demands and also don't crash your current structure. The Goal is not to prevent failure, but to recover quickly, after all, the system is going to fail when you try to add something new to it, All that matters is how fast you recover from it.

So how do we achieve the goal ? For answering that, we need to get into how applications are developed, the methods.

### Waterfall method:


![waterfall-project-management-1024x576.webp](/img/blog/why-devops-case-study/BGnxyHpkh.webp align="center")

Waterfall method actually worked like "waterfall", the different levels act as **Phases** where output from one phase works as input for the other. Once the phase is complete, it costs a lot to go back. Consider this example. Let's say you want to make an **eCommerce** web app because this is the new thing your customers want, and it all starts in January 2022.

#### **1: Planning**
This is where the company decides what they will build, whether they should even build it or not. The Business model, who is the target audience, what value does it provide to their customers. This takes months. When this phase ends, the *Architects* are provided with the idea, and now it's their job to design the things out. It's **March 2022** now.

#### **2: Requirement and Design phase**

In this phase, the architects spend months in deciding what the application needs and writing a *Requirements* document. Then the design phase, where they come up with how different pieces connect and work together. They end up with *high-level designs*, *low-level designs* and *System-level designs*. All you need to know that they come up with something like this.

![Screenshot 2022-06-10 at 10.16.41 AM.png](/img/blog/why-devops-case-study/KBnl-wUHZ.png align="center")
It's **June 2022** now.

#### **3: Developing**

Developers took the designs, split the features among groups and start writing the code for it. It happens in an **isolated environment** where every group just does their part, in their machines. There is no cross communication between groups writing different features, they just do their own job. It's **September 2022** now.

#### **4: Testing** 

Now the groups put their individual pieces together with others. Does the application work ? Do the pieces even connect ? This is the first time people get to see whether the thing they planned even works or not. It's been **9 months** since it all started and now is the first testing. Is it a bug ? Go back to the *Development* phase. Is it a *design* flaw ? Go back to the *Requirements and Design phase*. Do the customers need more features ? Does the application feel outdated ? Go back to the *planning* phase. This is the infamous **Fear cycle**.

It costs too much time, effort and money. Going back up is very hard ! Just like in a *Waterfall*, and it still doesn't guarantee that it will work this time.

Let's say, after a few iterations, the application finally works. The pieces are taped together and they work. It's **December 2023** now.

#### **5: Production**

Now the application is passed onto the **Production** server, where it will be open for the customers to use. Ops team work here. It is so scary for them, they are the furthest away from the entire application, and it is their job to run it. They don't know how the app works, they just have to run it on the server. Of course, there will be errors.

The cycle repeats. Is it a design flaw ? A bug ? Or the **Dependencies** don't add up ? We will talk about production related issues in further articles because I want to keep this article as brief as possible. It's **February 2023**

#### **6: Support**

Your application is working now, but there are new competitors providing new features. You have to keep up with the competition. Adding new features to a Big, **Monolithic** application is insanely tough. A small piece can bring down the entire app.

The entire waterfall method is going to run again with new features in mind. What if there are new Developers now ? They would have to understand the previous codebase. It will take time. Then they have to figure out how to integrate new features, and where to add the code, without bringing down the app. It took almost 7 months to add new features, and it's **October 2023** now. 

You might be wondering, are the features relevant anymore ? How many customers you lost in the past 7 months ? Oh! Boy, there are new features and new competitors, how do we catch up ? That's how big companies like Blockbuster go out of business.

Now enters DevOps. It is not a direct evolution, it came from extreme programming, Agile, Scrum, Cloud's PaaS etc. but we will discuss the evolution in further articles.

### DevOps:

> DevOps is the practice of Development and Operations engineers working together during the entire development lifecycle, following lean and agile principles in order to deliver the software fast and continuously.

Understanding and thinking DevOps are different things, this article will give you proper understanding of **Why DevOps**, we will discuss **What is DevOps** and **How do we become DevOps** in future articles.

DevOps takes a completely different mindset, it's not just the tools, CI/CD, a team of engineers etc. It's a culture, and the organizations need to adopt it. But why ? What are the Perks ?

With DevOps, our eCommerce website design will look something like this.


![Screenshot 2022-06-10 at 11.14.08 AM.png](/img/blog/why-devops-case-study/d8C7sAmhV.png align="center")

- What if you could test something new directly in the market, with the power to rollback if something went bad ? It won't bring your current application down. **A/B testing**.

- What if you had an application design that allowed you to change individual components like *Ordering*, *Basket*, *Locations* etc. in the above image, without one affecting the other ? Even if you change something, the application still works, it doesn't even care if you switched from using SQL to NoSQL database, it's fine until it works independently. **Microservice architecture**.

- What if you don't have to deploy your entire, a thousand lines of codes on every update, just update the new things and the let old ones keep running. It will bring down your full stack deployment from months to minutes! You want the new features ? Ok, give the code, will just take some minutes. **CI/CD**.

- What if you could get the necessary hardware like VMs just in a few minutes instead of months ? No need to even open a ticket, just few lines of codes, and you got it. **Infrastructure as code, and cloud Platform as a Service**.

- What if your development and production environment were similar, your Devs are testing their code on every step and when they pass it on to the Ops, it is guaranteed to be running in production ? No more Change vs Stability fight! **Containers**.

- What if  you could start with minimum planning of the end product, providing the customers quickly with something that works and get feedback, So that you could deliver the product they wanted, instead of what they asked for. **Minimum viable product, TDD and BDD**.

- What if something failed and your customers are denied of service. Wouldn't it be nice to get the things up and running asap ? Let me add, you don't even have to configure things manually, just write a file/package, telling about your application, give it to a software, It will run things for you, anything goes down ? It will automatically recreate it! Your service downtime went from hours to seconds ! You are not loosing customers! **Kubernetes**.

These are not **fairy tales**, all the above things are possible, and successful companies like Netflix, Spotify etc. are using it.

These are few of the points i could think of for now, there is much, much more you can do with modern application developed with DevOps practices. Read the things in this article a few times, you will realize how many problems are being solved with DevOps on a daily basis.

Further down the road, I'll explain What's and How's of DevOps. Till then, I'm providing you with a list of resources, so that you don't have to wait, and you can explore.

- [Saiyam Pathak's YouTube channel](https://www.youtube.com/c/saiyam911), you will find awesome introductory as well as advanced explanation of the DevOps and cloud native tools and concepts. Trust me, he is my favorite instructor so far.

- [Kunal kushwaha's YouTube channel](https://www.youtube.com/c/KunalKushwaha), an awesome place if you are just starting out, this guy is an amazing instructor and provides great learning content.

- [Velocity 09: John Allspaw and Paul Hammond, "10+ Deploys Per day"](https://www.youtube.com/watch?v=LdOe18KhtT4&t=347s)

- [CNCF's kubecon and cloudnative con's videos](https://www.youtube.com/c/cloudnativefdn), this is the most diverse place you'll find. Don't get intimated, start with keynotes, 101s etc. This is the place where you go if you want to know what is going on in the industry. Find more about [CNCF](https://www.cncf.io/), one of the most inclusive communities in the world.

Join awesome communities and ask for guidance, mentorship etc. !
- [Kubesimplify](https://discord.gg/g94aayFS)
- [Community classroom](https://discord.gg/Jd87ZBKz)
- [CNCF slack](https://slack.cncf.io)

This blog has been possible because of awesome resources mentioned below:
-  [Introduction to DevOps on Coursera](https://www.coursera.org/learn/intro-to-devops)
-  [Architecting Cloud Native .NET Applications for Azure e-Book](https://docs.microsoft.com/en-us/dotnet/architecture/cloud-native/)
-  [Cloud Native DevOps with Kubernetes](https://www.amazon.in/Cloud-Native-DevOps-Kubernetes-Arundel/dp/1492040762/ref=sr_1_1?crid=92I9GPPB9TN0&keywords=cloud+native+devops&qid=1654859515&sprefix=cloud+native+devops%2Caps%2C222&sr=8-1)

Go ahead ! Start with your DevOps journey, you'll find me on the way, as I am also a student exploring the domain. All the Best :D

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.














