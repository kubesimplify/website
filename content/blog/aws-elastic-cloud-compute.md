---
title: "AWS Elastic Cloud Compute"
seoTitle: "AWS Elastic Cloud Compute"
seoDescription: "Everything you need to know about an AWS EC2 instance."
datePublished: 2022-05-23T12:52:56.032Z
slug: aws-elastic-cloud-compute
author: praneeth-kondraju
cover: /img/blog/aws-elastic-cloud-compute/lSD-IEAr_.png
tags: ["cloud", "ec2", "aws", "cloud-computing", "devops"]
cuid: cl3iqb6o2014am9nv9rthfuh7
---
## AWS Elastic Cloud Compute Instance
- **Elastic Cloud Compute** is abbreviated as **EC2**.
- It is an **IaaS** cloud offering by **Amazon**.
- Using EC2 Instance, we can configure the machine from scratch, like a building a custom PC. But here it is done virtually by making few clicks.
- EC2 Instance configurable components
    - **Operating System(OS)**
        - Example: Ubuntu, Windows, MAC.

    - **Instance type**
        - Here we define CPU computing hardware requirements.
            - vCPU
            - Memory
            - Instance Storage type, etc.
    
    - **Instance configuration**
        - No. of Instances
        - Network related configuration, etc.

    - **Storage**
        - Size
        - Volume type
        - Encryption, etc.

    - **Security Group**
        - In a nutshell, it is a set of firewall conditions used to control the Instance traffic.

## **How to Launch an EC2 Instance**
1. **Prerequisite**
    
    Amazon Web Services(AWS) account.

2. **Steps**
    1. Login to your [AWS](https://signin.aws.amazon.com/signin?redirect_uri=https%3A%2F%2Fconsole.aws.amazon.com%2Fconsole%2Fhome%3Ffromtb%3Dtrue%26hashArgs%3D%2523%26isauthcode%3Dtrue%26nc2%3Dh_ct%26src%3Dheader-signin%26state%3DhashArgsFromTB_us-west-2_b5dfbb7688098e68&client_id=arn%3Aaws%3Asignin%3A%3A%3Aconsole%2Fcanvas&forceMobileApp=0&code_challenge=X9G-NZkthzEsafDdh0IfSHVt1It3-JZNZRLrHibGOAA&code_challenge_method=SHA-256) account.

    2. Click on Search bar and type **EC2**. Select **EC2**.

        ![EC2_Access_Method2.png](/img/blog/aws-elastic-cloud-compute/uREBteMKf.png align="left")

    3. You will be landed into **EC2 Dashboard** page. Select **Instances**.

        ![Select_Instance_Method1.png](/img/blog/aws-elastic-cloud-compute/iOD8tDsQa.png align="left")

    4. Select **Launch Instances**.

        ![Select_Launch_Instances.png](/img/blog/aws-elastic-cloud-compute/MPZdeblsP.png align="left")

    5. Based on opted user experience, creation of EC2 differs.

        a. If user opted for **New Experience**. 
        
        - Scroll down the **Launch an Instance** page to navigate. 

        - (optional) Adding tags. But adding appropriate tags is useful.
        ![New_EC2_Setup_Step1.png](/img/blog/aws-elastic-cloud-compute/SJFDccN2l.png align="left")

        - Select your desired Operating System.
        ![New_EC2_Setup_Step2.png](/img/blog/aws-elastic-cloud-compute/yhsdT7r-6.png align="left")

        - Choose your **Instance** type.
        ![New_EC2_Setup_Step3.png](/img/blog/aws-elastic-cloud-compute/QdryAWDaF.png align="left")

        - (Optional) Creating a Key pair. You can provide an existing Key pair, or you can create one if needed, or you can create a Key pair [later](https://praneethkondraju.hashnode.dev/aws-key-pair-generation). Key pair provides remote access to your **EC2** instance using **Terminal** or **Putty** from your machine.
       ![New_EC2_Setup_Step4.png](/img/blog/aws-elastic-cloud-compute/YZ3IRy1-G.png align="left")

       - Network Settings. You are good to proceeds with defaults, or you can build your requirement.
    ![New_EC2_Setup_Step5.png](/img/blog/aws-elastic-cloud-compute/x5-7_EfHb.png align="left")

       - Configure Storage.
        ![New_EC2_Setup_Step6.png](/img/blog/aws-elastic-cloud-compute/Qg7iNGisb.png align="left")

        - Advanced details. Good to go with defaults or can be tweaked per requirement.
        ![New_EC2_Setup_Step7.png](/img/blog/aws-elastic-cloud-compute/3uoGsf-cO.png align="left")

        - One step to launch your **EC2** instance.
        Tip: Check all your configuration, before hitting **Launch Instance** button.
        ![New_EC2_Setup_Step8.png](/img/blog/aws-elastic-cloud-compute/7MpeButZL.png align="left")

        b. If user is in **Old Experience**.

        - Choose Operating System.
        ![Old_EC2_Setup_Step1.png](/img/blog/aws-elastic-cloud-compute/5moFG-P71.png align="left")

        - Choose Instance type.
        ![Old_EC2_Setup_Step2.png](/img/blog/aws-elastic-cloud-compute/tbq0lwxrW.png align="left")

        - Configure Instance details.
        ![Old_EC2_Setup_Step3.png](/img/blog/aws-elastic-cloud-compute/mUAeeFs14.png align="left")

        - Add Storage.
        ![Old_EC2_Setup_Step4.png](/img/blog/aws-elastic-cloud-compute/syLX1Qv7y.png align="left")

        - (optional) Adding tags. But adding appropriate tags is useful.
        ![Old_EC2_Setup_Step5(1).png](/img/blog/aws-elastic-cloud-compute/7Q5w-6wRl.png align="left")

        - Configure Security group.
        ![Old_EC2_Setup_Step6.png](/img/blog/aws-elastic-cloud-compute/CbbKCZT1M.png align="left")

        - Review your configuration and hit **Launch**.
        ![Old_EC2_Setup_Step7.png](/img/blog/aws-elastic-cloud-compute/o_WDwk-HU.png align="left")

        c. **Voilà!!**, you launched your **EC2** instance.

## **Types of various EC2 Instance, and it's purpose**

1. **General Purpose**
    - This type of instance is an all round performer. It covers compute, memory and networking areas and can be used for different kinds of work loads.
    - Suitable for most of the use cases based on selected configuration.
    - Ex: Web Servers, development environments like development, testing, QA, etc.
2. **Compute Optimized**
    - Compute Optimized instance is preferred for high performance workloads that require high amount of computational power for delivering the best performance.
    - Ex: Running batch jobs, High performance tasks, etc.
3. **Memory Optimized**
    - Memory Optimized instance is used to for performance intended works.
    - Ex: Caching, Data analysis, etc.
4. **Accelerated Computing**
    - Accelerated Computing instance offers GPU's. So, it enhances the computational tasks.
    - Ex: Machine Learning tasks, etc. 
5. **Storage Optimized**
    - Storage Optimized instance offers fast read/write speeds and is ideal for frequent data operations task.
    - Ex: Accessing/ Inserting data from/to Database, etc.