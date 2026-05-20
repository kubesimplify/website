---
title: "Operating Systems 101: Essential Knowledge for  DevOps/SRE Engineers"
datePublished: 2023-03-09T12:30:39.258Z
slug: operating-systems-101-essential-knowledge-for-devopssre-engineers
author: krishnamohan-yerrabilli
cover: /img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/e5a7d1d5-80fa-4e45-bfac-65c3db660dae.jpeg
tags: ["operating-system", "devops", "sre"]
cuid: clf137kjo0370hxnv9ob6e1sk
---
When it comes to [**DevOps**](https://www.youtube.com/@kubesimplify), you may have come across some challenging concepts, such as **Kubernetes**, **Docker**, **Helm**, **Prometheus**, and others, which can be difficult to grasp without fundamental knowledge. That's why I'm starting a new blog series, called **Building a Strong Foundation in** **DevOps**/**SRE**.

It's crucial to start with the **basics** to become a **good engineer**, and I'm **committed** to providing you with a **comprehensive** understanding of these complex ideas. Ok, enough talk, let's get started.

# Introduction

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/4a4f101a-ff3b-48a1-b0a9-88dcc0ec0862.png align="center")

When it comes to your **computer**, the **operating system** plays a crucial role as the Head of everything. It acts as a **manager**, ensuring the smooth functioning of all the different parts of your **computer**, by keeping them in line. The **operating system** creates and runs the programs that make up your **computer applications**, serving as the backbone of your **computer's functionality**

So, in other words, the **operating system** acts as an intermediary between the **hardware** and the **applications** that run on the **computer**. It is responsible for managing and coordinating the use of the **computer's hardware resources**, such as **memory**, **processing power**, and **input/output devices**, as well as providing a common interface for **applications** to interact with the **hardware**

Through this, the **applications** can access the necessary resources they need to function properly, the OS makes sure everything is running smoothly and coordinating all the different parts of the **computer** in line with each other.

# History of Operating Systems

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/c77925b2-5fc0-4eac-8808-03f514bd9075.jpeg align="center")

It all begins a [**long way back**](https://homepage.cs.uri.edu/faculty/wolfe/book/Readings/Reading03.htm) from the early days of **batch processing** on **centralized mainframes**, which have evolved through time. This evolution started with the introduction of **time-sharing systems**, allowing multiple users to access the computer at once

To start with, **MS-DOS** was the first popular **personal computer operating system**. The Macintosh, introduced in 1984, revolutionized the game with the introduction of the **graphical user interface (GUI)**

In the 90s, **Windows**, introduced by **Microsoft**, combined features of the Macintosh with **MS-DOS** and became the most popular **personal computer operating system**. Today, OSes are designed particularly for different types of devices, such as **smartphones**, **servers**, and **supercomputers**.

# Functions of an Operating System

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/c18f54c9-d147-4d1a-9a40-d0e9d70ec834.jpeg align="center")

Did you see, there are a lot of **functions** that an **OS** can handle, let's understand 5 of them

### Memory Assignment

To guarantee an **appropriate amount of memory** for each program in operation and to **resolve issues** between programs, the system responsible takes care of the computer's **memory management** and **assignment** through proper handling.

### Resource Allocation

Is responsible for coordinating and efficiently utilizing various computer resources, such as **CPU time**, **memory**, and **storage**, and allocates these resources with the goal is to achieve **optimal performance** by efficiently utilizing them.

### Process Coordination

It is the central authority, to allows each program to run efficiently and without interfering with other programs and processes, and is accountable for [**orchestrating the execution**](http://web.cs.wpi.edu/~cs3013/b00/week2-procco/week2-procco.html) of programs and processes in the computer system by using efficient **resource utilization techniques**.

### Safety and Protection

To keep the computer and its information secure, the operating system comes with some safety features, like **user authentication**, **access control**, and **data protection**, all aimed at ensuring the safety and security of the computer and its data

### File Organization

Users want to access their data easily, So file system management takes care of organizing and managing how the computer stores, gets, and changes files and information. This is done by properly **organizing and managing the data** on the computer to make it easier to store and retrieve files.

# Types of Operating Systems

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/f802722c-f500-4a7c-a107-b5e533544ce4.jpeg align="center")

It comes in [various shapes and sizes](https://www.bmscw.edu.in/files/StudyMaterials/BCA/I-BCA/Types%20of%20Operating%20System-converted.pdf), each boasting its own unique set of features and abilities. Broadly speaking, the main categories of operating systems are **single-tasking** and **multitasking**

**Single-tasking** operating systems can often be found on older computers and, as the name says, they are only capable of running one program at a time. To launch a new program, the current one must first be closed. Despite the limitations of single-tasking systems, they tend to be more user-friendly and are less prone to crashes in comparison

**Multitasking OS** which quickly reacts to outside things is a **real-time system**. This kind of system is often used in things like flying, driving, and running factories, where fast reactions are very important. The real-time system can reply quickly and exactly, making it a good pick for things that need a real-time response.

# Process Management

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/55d69dc5-0a37-49da-b715-519f048b9bb3.png align="center")

**Process management** is a crucial aspect of operating systems and regards the way programs and processes are managed on a computer. The goal is to use system resources. This is gonna achieved by **creating, scheduling, executing, and monitoring processes** in a coordinated manner.

There is a thing, called a **process management system** that takes care of managing the life cycle of each process, including **allocating resources, scheduling, and synchronization**, as you see above it is also responsible for the termination of processes.

# Memory Management

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/31bc73a0-9a67-471e-963b-3eaf924a7262.png align="center")

It deals with the management and coordination of computer memory. This is done in a way that each process has enough memory to execute its tasks and the system remains stable. To achieve this goal, [**memory management**](https://web.cs.wpi.edu/~cs3013/c07/lectures/Section08-Memory_Management.pdf) involves **allocating memory to processes, freeing up memory that is no longer needed,** and ensuring that there are no conflicts between processes fighting for memory resources

This system keeps track of which parts of **memory** are being used and which parts are available for use. The goal is to make the most effective use of memory resources, provide fast memory access, and minimize memory waste and **fragmentation**.

# Storage Management

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/2f75d02f-7e80-45c3-9533-41e783fabbe3.png align="center")

It refers to the process of basically monitoring and controlling the storage of data in computer systems, with the goal **to make the best use of available storage resources** and **to minimize the risk of data loss or corruption**.

This includes tasks such as **allocating, organizing, and monitoring the use of storage resources** in order to ensure that they are being used effectively and efficiently.

# File System Management

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/648f98aa-5484-4677-ab99-7a14afa7ff65.png align="center")

Probably it's the process **of managing and organizing** the **storage** of files **and directories** on a computer. This includes tasks such as creating and deleting files, creating and managing **directories**, and managing the allocation of **storage space** to individual files and directories.

The main goal of **File System Management** in the **OS** is to provide a structured and organized way of storing and accessing data on a computer. This is achieved with the use of a **file system**, which is a way of organizing and storing data in the form of files and directories.

# Security and Access Control

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/b9efd704-f0d1-467b-b1ae-b594f39ef986.png align="center")

This is one of the important aspects of OS, [**Security Access Control (SAC)**](https://crypto.stanford.edu/cs155old/cs155-spring03/lecture9.pdf) is the process of protecting and controlling access to resources and data stored on a computer system. This includes tasks such as managing **user accounts**, setting **permissions** for access to files and directories, and controlling the execution of programs.

The task of **organizing the storage of files and directories** on a computer includes creating and deleting files, creating and managing directories, and managing the allocation of storage space to individual files and directories.

# Networking

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/038cd8ba-db37-4524-b8b9-0d9e0fd22185.png align="center")

This is the basic way how computers are connected together, **Client-Server Architecture** refers to the process of connecting computers and devices to each other to exchange data and information.

This includes tasks such as **configuring network interfaces**, setting up **communication protocols**, and managing the flow of data between devices it plays the role in enabling communication and collaboration between different devices and systems.

# Interrupts and Exception Handling

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/e16d213b-8329-433b-9c96-7bd739b3ea39.png align="center")

These are the methods used by the computer system to handle **unexpected** events or errors. **Interrupts** are signals sent to the processor indicating that an event requiring immediate attention has occurred. Examples of interrupts include **hardware events** such as a key press on the keyboard or clicking on your mouse.

**Exception handling** is the process of dealing with errors or unexpected events that occur during program execution. This includes errors such as **divide-by-zero** or illegal memory accesses this is actually represented in a **vector scale** I mean it's basically a table with the **data indexing** that what to do when an unusual thing happens.

# Deadlocks and resource allocation

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/a906ef12-84ee-437a-b000-578fb7ce9049.png align="center")

It's the concept related to the problem of managing the allocation of shared resources in a computer system. In a **multitasking** **environment**, multiple processes may request and hold onto resources simultaneously, leading to the possibility of a **deadlock**.

As I mentioned in the visual, this usually happens when two or more processes are blocked, and each is waiting for the release of a resource that is held by the other process. This creates a **circular wait condition** and the processes are unable to proceed or make progress.

To avoid these locks, a proper strategy for resource allocation is required. One common way is to use a **resource allocation algorithm** that determines the order in which resources are granted to processes. This helps in avoiding circular wait conditions and making sure that resources are efficiently utilized.

# Processor Scheduling

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/cc30d9be-73da-46b2-a5be-e73e1d6df605.png align="center")

**Process Scheduling** refers to the process of determining which tasks the processor will execute next and when. This involves making **decisions** about how to allocate the processor's time among the tasks that are waiting to be executed, based on factors such as priority, deadline, and other resource requirements.

To ensure that the processor is used effectively and efficiently so that tasks are completed in a timely manner and the overall system **performance is improved**, the operating system uses algorithms and data structures to manage the **scheduling process** in the most efficient way possible, taking into account the state of the processor and the available system resources.

# Process Synchronization

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/6a6ea92a-734b-44b5-b8e6-c242921a15b4.png align="center")

**It is the synchronization** of processes in a computer system to avoid conflicts and race conditions. This is achieved by making sure that access to shared resources, such as **data or files**, is regulated in a way that only one process at a time can access them.

Where these processes can execute concurrently without interfering with each other, which can lead to data corruption or incorrect results. This is achieved through the use of synchronization techniques such as **semaphores, monitors, and critical sections**.

# Threads

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/021873ed-4647-42cd-85fc-18d866760cd8.png align="center")

The concept of **Threads** in an operating system is all about making sure that multiple tasks can run in parallel within a single process. This allows for more efficient use of the processor's time and can lead to improved performance.

Note that: A **process** is just a program that is executing, and it can contain multiple threads. Each thread runs independently of the other threads in the same process and has its own **program counter**, **stack**, and **local variables**.

# Virtual Memory

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/e8b74e2c-866d-42dc-9e3e-c77b7731335b.png align="center")

The purpose of [virtual memory](http://web.stanford.edu/class/archive/ee/ee108b/ee108b.1082/handouts/lect.14.OS2.pdf) is to allow a computer system to run multiple programs **simultaneously** while making sure that each program has enough memory to execute properly. This is achieved by allowing each program to have its own virtual address space, which is a **portion of the memory** that is isolated from the memory of other programs.

it simply means, the operating system allocates a separate space of the hard disk to be used as an extension of the **RAM**, which acts as a **temporary storage area** for data that is not currently needed.

# File System Implementation

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/d3818c5d-df2d-4421-8e4c-648d58c01564.png align="center")

The storage of files and directories on a computer is organized and efficiently involves implementing a **File System** and managing the allocation of storage space for individual files and directories.

Includes tasks such as creating and deleting files, creating and managing directories, and using related **Index Allocation Techniques** to manage the efficient use of storage space. The implementation of the file system and related index allocation must also ensure that data remains secure and protected with the proper access control and protection mechanisms.

# OS-level services

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/769fd52d-3df2-45d4-95ba-df6c64277ef0.jpeg align="center")

**System Services** are one of the core concepts of OS, its facilities and functions are provided by the operating system to the user and applications to make it easier for them to interact with the hardware. These services are provided at the abstraction level, hiding the complexities of the underlying hardware.

Making sure these services are efficient and reliable is a crucial aspect of the operating system's functionality. There are plenty of services provided by OS including **memory management**, **process management**, **file management**, and many others. These services are designed to be flexible and customizable, allowing applications to make use of them in different ways for their specific needs.

# Design Principles

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/bb32e75c-49ab-44cd-be64-56dd470d4959.png align="center")

These are actually **guidelines** and approaches used in the creation and development of an OS. These principles aim to make sure the OS operates efficiently, is user-friendly, and provides **robust** and reliable services to applications. Some of the important [**design principles**](https://repository.dinus.ac.id/docs/ajar/Operating_System.pdf) of an OS are

### Modularity

To divide the system into **smaller**, **manageable** components that can be developed, tested, and maintained **independently**.

### Abstraction

To hide the **complexity** of the underlying hardware and present a simple and unified view to the user.

### Hierarchy

Organize the system into a **series of levels**, each building upon the services of the lower level.

# Kernel interfaces and System Utilities

![](/img/blog/operating-systems-101-essential-knowledge-for-devopssre-engineers/07a57f7b-b83f-4846-87fd-59af04e8227c.png align="center")

**System utilities** are programs that are used for various tasks such as **file management**, **process management**, and **system maintenance**. They are independent programs that run outside of the **kernel** and interact with it through the **kernel interfaces**. it provides a standard way for the system utilities to access the services of the kernel.

The design of the **kernel interfaces** and system utilities must take into account the requirements of different applications, the hardware, and the operating system, and the need to make sure that the system is efficient, reliable, and easy to use.

So here comes the end.

**Thank you** for taking the **time** to go through the extensive blog. I am certain that this information will be of great use to you and will inspire you to continue exploring the vast world of **DevOps**, see you soon with another one, and happy learning!!

# Resources

[Operating Systems Principles By Stanford, Course Code (CS111)](https://online.stanford.edu/courses/cs111-operating-systems-principles)

[Operating System Concepts By Abraham\_Silberschatz,Greg, Peter](https://books.google.co.in/books/about/Operating_System_Concepts.html?id=FHJlDwAAQBAJ&source=kp_book_description&redir_esc=y)

[Operating\_Systems\_By\_HillaryNyakundi](https://www.freecodecamp.org/news/what-is-an-os-operating-system-definition-for-beginners/)

[Operating System Full Course](https://www.youtube.com/watch?v=mXw9ruZaxzQ&ab_channel=AcademicLesson)

If you're curious or have any questions about the topic, just send me a direct message on [Twitter](https://twitter.com/K_Mohan_), I'm happy to chat and clear things up for you!

Follow Kubesimplify on [**Hashnode**](https://kubesimplify.com/), [**Twitter**](https://twitter.com/kubesimplify)**,** and [**LinkedIn**](https://www.linkedin.com/company/kubesimplify/). Join our [**Discord**](https://discord.com/invite/8s8uMRnSnH) server to learn with us.