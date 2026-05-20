---
title: "Become a Hashicorp Certified Terraform Associate - Preparation Guide"
seoTitle: "How to prepare for Hashicorp Certified Terraform Associate"
seoDescription: "In this particular blog, we'll dig a bit deeper into the HashiCorp Terraform Certification and exactly what you need to pass it."
datePublished: 2023-02-13T12:30:39.083Z
slug: become-a-hashicorp-certified-terraform-associate-preparation-guide
author: kunal-verma
cover: /img/blog/become-a-hashicorp-certified-terraform-associate-preparation-guide/2b12c422-2b51-477a-a8cc-52448a9e1b08.png
tags: ["terraform", "infrastructure-as-code", "hashicorp"]
cuid: cle2sn4ex00vyitnv02n3ar8g
---
## Introduction

Recently, I appeared for the [HashiCorp Certified Terraform Associate](https://www.hashicorp.com/certification/terraform-associate) exam after somewhere around **2 months of preparation**. I am very glad to share that I passed it with a score of **85%**, which is a pretty nice one considering the fact that, it is [my very first certification](https://www.credly.com/badges/60b86e6c-ec14-46bd-8929-f1438ab68e16/public_url) in the DevOps ecosystem.

Now, in this particular blog, **we'll dig a bit deeper into this certification, and what exactly you need to pass it and I'll be sure to share my tips and experience along the way.**

So, if you are someone looking forward to preparing or give this exam in the coming future, **you are in the right place today!**

## Getting familiar with IaC and Terraform

Before we even start to discuss the exam, it's important to be familiar with the technology around which this certification revolves, which is **Terraform**.

If we look at the [official definition of Terraform by HashiCorp](https://developer.hashicorp.com/terraform/intro), it says that:

> HashiCorp Terraform is an **infrastructure as a code** tool that lets you define both **cloud and on-prem resources** in **human-readable configuration files** that you can **version reuse**, and **share**.

According to me, this is a very precise definition of Terraform, but there are a few terms here that we need a bit more clarity on. Let's start with the most basic one, **What is Infrastructure as Code?** **Infrastructure as Code (IaC)**, as the name suggests is an approach to **managing your cloud-native infrastructure through code**. Traditionally, If we talk about managing our infrastructure over different cloud providers or on-prem platforms, there was heavy use of **the UI** or some kind of management console to **make changes**, **monitor** and **troubleshoot** the resource throughout the entire application lifecycle. This was apt if we didn't have to manage large-scale infrastructure and there was a relatively limited scale of deployment. Today, as the **scale of infrastructure is much, much higher**, the approach of managing the infrastructure through a **codified way** is what is being adopted in the ecosystem, and this is what we call Infrastructure as Code.

There are a lot of tools out there that serve the purpose of creating that codified ecosystem throughout the infrastructure lifecycle and **Terraform** is the Infrastructure as Code (IaC) offering from [HashiCorp](https://www.hashicorp.com/).

Terraform, an infrastructure as a code tool, lets you define both cloud and on-prem resources in human-readable configuration files that you can version, reuse, and share. These configuration files are written in a special configuration language called the **HashiCorp Configuration Language (HCL)**. Here is a nice example of **provisioning an AWS EC2 instance** through Terraform, using the HCL syntax:

```bash
resource "aws_instance" "web" {
  ami           = "ami-005e54dee72cc1d00"
  instance_type = "t3.micro"

  tags = {
    Name = "My_Server"
  }
}
```

To learn more about the HCL language, you may refer to the [documentation](https://developer.hashicorp.com/terraform/language).

> **💡 Tip:**
> 
> As HCL is a **JSON-based variant**, the syntax of the two looks very similar. HCL is comparably **easier to parse** than other configuration languages such as **YAML** or **XML**.
> 
> To learn more about the HCL syntax, you can refer to the [README on GitHub](https://github.com/hashicorp/hcl).

There are a lot of features and use cases that make Terraform stand apart from other IaC tools out there such as Ansible, Chef, Pulumi, Crossplane, etc, but the one that comes on top is being **"Cloud-agnostic"** i.e. **the ability to provision resources across a multi-cloud infrastructure and handling cross-cloud dependencies with a single configuration file.**

![](https://www.cloudsigma.com/wp-content/uploads/CloudSigma-is-now-a-verified-Terraform-provider-1163x608.jpg align="left")

To know more about various use cases of Terraform, refer to the documentation.

## Who is a Terraform Associate?

If we look at the [official introduction](https://www.hashicorp.com/certification/terraform-associate) to the certification:

> The Terraform Associate certification is for **Cloud Engineers** specializing in operations, IT, or development who know the basic concepts and skills associated with **open-source HashiCorp Terraform**.

Most simply, a **Terraform Associate** is someone who can use Terraform **to manage and provision infrastructure in a variety of real-world scenarios.** This is a **fundamental level certification** where the main aim is to **validate** that you have a working knowledge of Terraform and the **ability to use it in production environments.**

From my experience of preparing for this exam, I'd say it's either for those cloud engineers that specialize in operations/IT, or for those developers who know or would like to explore and learn the basic concepts, and skills associated with open-source HashiCorp Terraform.

## Pre-requisites - Before preparation

Now that we have a clear understanding as to who is this certification for and what the aim behind it is, we can now move towards our preparation phase. The very first step is to learn about the pre-requisites required, and according to HasiCorp, those are as follows:

* **Having a basic knowledge of using the Linux Terminal**
    
    * [Linux Course by Kunal Kushwaha](https://youtu.be/iwolPf6kN-k)
        
    * [Linux & Docker Fundamentals Workshop by Chad M. Crowell](https://youtu.be/EUu1E_YKGTw)
        
* **Having a basic understanding of how on-premises and cloud architecture works**
    
    * [Cloud 101: An Introduction to Cloud Computing](https://youtu.be/GneIpdOirZY)
        

Apart from this, it is recommended to have a sound knowledge of using at least one of the **public cloud providers** such as AWS, Azure, GCP etc. Now, this is something where many folks tend to get stuck while starting to prepare for the certification. You need to focus on these words here - **"it is recommended to have sound knowledge"**, this does not mean that one has to be a **PRO** in using a particular cloud provider, before starting to learn about Terraform. Having an experience with a cloud provider would prove to be helpful, but **even if you are just familiar with the basics of one provider**, let's say AWS, that shouldn't stop you from learning Terraform and you can always **learn new cloud concepts along the way!**

If I talk about my preparation, I only knew some very basic concepts in AWS such as working with **EC2, and** a little bit of **S3** (database) and that's it. Along with learning about Terraform, I learned multiple new concepts like **VPC**, **CIDR Blocks**, **AWS Secrets Manager** etc. And not only in AWS, but I also gained basic experience working with **Azure** and **Google Cloud** as well as I learned to provision infrastructure over a multi-cloud environment.

I hope this gives you some confidence and now let's move forward with learning more about the exam and how you can prepare well.

## About the Exam - What to Expect

### General Exam Details

Here are some important exam details to keep in mind:

* This is a **multiple choice** exam having **a total no. of questions = 57**.
    
* The duration of the exam is **1 hour** and in my opinion, this is a very apt time for attempting all the questions.
    
* **A minimum score of 70%** is required to pass the exam.
    
* The exam costs you **$70** with **no free re-take included**. So, you've gotta complete it in a single take.
    
* If you have successfully cleared the exam, **the certification would be valid for 2 years.**
    

### Exam Objectives - Different areas to focus on

In other terms, you can call this the "**syllabus"** of the exam. As I previously mentioned, the main aim of this certification is to validate that you have a working knowledge of Terraform and an overall understanding of the Infrastructure as Code ecosystem. So, here are the **different focus areas** into which the exam is divided:

1. **Understand infrastructure as code (IaC) concepts**
    
2. **Understand Terraform's purpose (vs other IaC)**
    
3. **Understand Terraform basics**
    
4. **Use the Terraform CLI (outside of core workflow)**
    
5. **Interact with Terraform modules**
    
6. **Navigate Terraform workflow**
    
7. **Implement and maintain state**
    
8. **Read, generate, and modify the configuration**
    
9. **Understand Terraform Cloud and Enterprise capabilities**
    

Now, there are a lot of **sub-topics** that come under these main focus areas, which you can learn more about from the [official certification page](https://www.hashicorp.com/certification/terraform-associate).

From my experience of giving the exaddm, it's **very well balanced** between these **9 areas** and while preparing, you **need to spend adequate time learning these topics**. I will point out some key areas to focus on in the upcoming sections as well.

## A Practical Approach to your Preparation!

Now that we have a fair level of understanding about the prerequisites, the exam structure, and the main focus areas, **we can now start our preparation!**

> **📍 NOTE:**
> 
> The **resources** and **points** mentioned below are things that worked for me in my preparation and might not work for you, **but you'll learn quite a lot in the process, that's for sure!**

### Resources

#### 1\. [Study Guide by HashiCorp](https://)

One of the best resources to learn about any technology out there is its official documentation **and the** same is the case with Terraform. For this certification, HashiCorp has done a phenomenal job in structuring the [official documentation](https://developer.hashicorp.com/terraform) in form of a **study guide** to help you prepare for this exam.

[The Study Guide](https://developer.hashicorp.com/terraform/tutorials/certification/associate-study) is kind of a **roadmap** created by HashiCorp to help you prepare for this certification exam. Each objective (which are mentioned above) with their respective sub-topics are mentioned in the form of **links**, which lead to separate sections of the official documentation, focusing on that particular topic. All the resources mentioned here are in the **order of difficulty** so that one should be able to track their progress throughout the preparation.

[![](/img/blog/become-a-hashicorp-certified-terraform-associate-preparation-guide/40931285-0bcb-4dcb-b92b-1c24fb927ecf.png align="center")](https://developer.hashicorp.com/terraform/tutorials/certification/associate-study)

One of the **major highlights** of the study guide is links to the [tutorial section](https://developer.hashicorp.com/terraform/tutorials) where you can follow the step-by-step **guide** and get that essential **hands-on experience** while learning the concepts **(which is very important)**.

To get a more **summarized view** of the study guide, you can also check out the [Exam Review](https://developer.hashicorp.com/terraform/tutorials/certification/associate-review) section as well.

Along with the study guide, you also have a section for [Sample Questions](https://developer.hashicorp.com/terraform/tutorials/certification/associate-questions) where you can get a gist of the **format of the questions** asked in the exam.

> **📍 NOTE:**
> 
> These sample questions **aren't enough** to get that **full-fledged exam practice experience** that you most definitely need. We will talk about that later in this section.

#### 2\. [HashiCorp Terraform Associate Certification Course - By Andrew Brown](https://youtu.be/V4waklkBC38)

![](https://user-images.githubusercontent.com/72245772/215258523-c9504a41-3826-4f9d-8e54-6a2f88907049.png align="left")

If you are someone who **prefers to learn through videos** or consume visual content, this one's for **YOU**. A complete knowledge-packed course by [Andrew Brown](https://twitter.com/andrewbrown) on [FreeCodeCamp](https://www.youtube.com/@freecodecamp) is a very well-structured resource for anyone starting to prepare for this certification. Andrew Brown has done some amazing work on this **13+ hour-long course** which includes both **in-depth explanations** of Terraform concepts and **hands-on sections** after each concept **(which were my favourites)**.

Overall, both these resources have the **full potential** to get you exam ready in terms of the concepts and covering the exam objectives. Now, for the folks who'd be wondering, **what would I recommend here?** So, I combined the power of both.

> **Study Guide + FreeCodeCamp course == A Killer Combination 🔥**

This is a personal **choice** and you can go for any resource mentioned, but remember that - **documentation plays an important role in the exam, so please don't skip that!**

#### 3\. Practice Exams - To get you Exam Ready!

The more I come back to this particular phase, **the more it reminds me of how important it was during my preparation.** **Practice Exams** are something which would connect you with what potentially could be asked in your exam and in a way **validates your overall preparation** at the same time.

[HashiCorp Certified: Terraform Associate Practice Exam 2023 by Bryan Krausen](https://www.udemy.com/course/terraform-associate-practice-exam/) on **Udemy** provides you with a **set of 6 practice exams**, all following the exact pattern as the main exam:

* **57 total questions**
    
* **1hr duration**, and
    
* **70% required to pass**.
    

These are again, essential for validating your overall preparation and would help to point out any area or topic that requires further **practice** or **revision**. These practice exams helped me to **track my preparation** and I could see myself improving with each exam.

To give you a better idea of this, here is a **table** that I prepared to track my progress with each exam I gave:

![Xnapper-2023-02-01-12 08 11](https://user-images.githubusercontent.com/72245772/215969896-47c6527d-fb1b-4e39-a4c7-fe59c262d2e5.png align="left")

Notice the very **first exam** I gave here. I got a **61%** and that means **I failed it!** Though this was a bit de-motivating at first, now, I knew the areas that required more attention. So, I focused more on those and the results kept on improving with each.

> **💡 Tip:**
> 
> After giving every practice exam, it's important to ask these **two questions**:
> 
> * **Which questions went wrong and why?**
>     
> * **Which of my answers was right and why?**
>     
> 
> Trust me, with each exam you'll see yourself **improving** and **becoming more confident!**

#### 4\. Personal Notes on Notion

While going through the course and the documentation, I have prepared notes of all the concepts that I learned along the way. Now, these are something very **informal** and are **not sufficient** for your preparation, but would **give you a nice overview** of all the concepts involved!

You can access all the **notes** through this [Notion page](https://vermakunal.notion.site/379906a0bab14972b6138b705004e0b2?v=bad9305cdf0d4c3698014c98912bad0f). Also, if you wish to access the **code files** as well, here is the [GitHub Repo](https://github.com/verma-kunal/DevOps-Cloud-Certifications/tree/main/HashiCorp-Terraform-Associate).

> **📍 NOTE:**
> 
> I'll soon be uploading all the notes on the [GitHub Repo](https://github.com/verma-kunal/DevOps-Cloud-Certifications/tree/main/HashiCorp-Terraform-Associate) as well, to make them more accessible to the community!

## Exam & Study Tips

Throughout the blog, I've provided **some short tips** in each section to help you with your preparation. **Here are a few more,** cuz why not :)

* The **more hands-on practice** you do for a topic, you'll have a firm grip on that particular concept.
    
* **Googling** and **StackOverflow** are your friends if you get stuck into any issues
    
* As I mentioned previously, **making notes** **while learning** helped me out in terms of remembering the concepts. Try to follow this practice as you learn and notice the results!
    
* If you can, try to make **1-2 small projects using Terraform**. You can even add Terraform to an existing project on GitHub. Again, **the aim is to get that hands-on experience.**
    
* **Learn in public!** Commit to sharing your daily learnings with everyone in the community and you'll gain some nice insights and make new connections.
    

[![](/img/blog/become-a-hashicorp-certified-terraform-associate-preparation-guide/49a2ed01-adff-4c47-a5bd-11299ce59663.png align="center")](https://twitter.com/kverma_twt/status/1597547868470247425?s=20&t=i6jIu_iSjXal8lUegGGY1w)

## Conclusion

I hope that this blog post proves to be the **starting point** for your journey to becoming a certified **Terraform Associate** and I tried my best to take you through my journey along the way.

If you have any further questions regarding the certification, feel free to reach out on [Twitter](https://twitter.com/kverma_twt).

**All the best for your preparation and the exam!**

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [LinkedIn](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.