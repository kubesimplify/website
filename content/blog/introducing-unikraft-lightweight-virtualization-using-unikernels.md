---
title: "Introducing Unikraft - Lightweight Virtualization Using Unikernels"
seoTitle: "Introducing Unikraft - Lightweight Virtualization Using Unikernels"
seoDescription: "Unikraft is a fast, secure and open-source Unikernel Development Kit which enables you to easily build minimal, ultra-lightweight virtual machines."
datePublished: 2024-04-08T11:30:40.051Z
slug: introducing-unikraft-lightweight-virtualization-using-unikernels
author: kunal-verma
cover: /img/blog/introducing-unikraft-lightweight-virtualization-using-unikernels/0942e1c5-c935-4209-bebd-e22bdecfb9ce.png
tags: ["cloud", "virtual-machine", "containers", "virtualization", "unikernel"]
cuid: cluqvfrcj000108lc9yufc8du
---
[Unikraft](https://unikraft.org/) is a fast, secure and **open-source Unikernel Development Kit** which enables you to easily build minimal, ultra-lightweight virtual machines.

In practice, it is an alternative to running your application in the cloud. Now, in production environments, it feels no different to managing traditional containers — that we all are familiar with, but whats fundamentally different from containers and traditional virtual machines, **is the way your application is packaged and executed by Unikraft.**

The high level goal of Unikraft is to build customizable and specialized OS images, known as **unikernels** — **lightweight, single-purpose operating systems optimized for specific applications.** Unlike traditional virtualization solutions such as containers and virtual machines, that come with a wide range of features and functionalities, unikernels are tailored to serve a single task or application, resulting in minimal resource usage and enhanced performance.

Unikraft aims to streamline the process of creating and managing custom unikernels by providing developers with a modular and flexible approach by offering a comprehensive set of tools and libraries, which enables developers to optimize **resource utilization**, **enhance security**, and **improve scalability** across a wide range of use cases.

# Understanding Unikernels

According to the [official documentation](http://unikernel.org/):

> Unikernels are specialized, single-address-space machine images constructed by using library operating systems (libOS).

Simply put, **Unikernels are lightweight, single-purpose operating systems that are tailored to serve a specific application or task.** Unlike traditional operating systems, which include a wide range of features and functionalities, unikernels contain only the necessary components required to support a particular application. This focused approach results in **highly efficient and optimized systems, with reduced resource overhead and attack surface.**

## Evolution from VMs and Containers

Till now we have seen that, in most production systems, often the standard unit of isolation is the virtual machine (VM) since this provides **the greatest degree of security for the application(s) enclosed within the isolated environment.**

However, it was observed that a fully virtualized traditional VM is too heavy for most applications, which eventually led to the **container-based model**. Containers become a popular choice for packaging, deploying, and managing applications in cloud-native and microservices architectures due to their **efficiency, flexibility, and portability.**

Eventually, the evolution of running applications in the cloud led to the practice of running containers within virtual machines (VMs). This approach combines the strengths of both containers and VMs, providing robust isolation and security from VMs, while also benefiting from the flexibility and efficiency of containers.

> 💡 [Kubernetes](https://kubernetes.io/) is an apt example of such deployment model, where the node pools are generally deployed as VMs.  
> Thus, it has been the de facto orchestration framework for container applications!

[![Comparison between VM, Containers & Unikernels](/img/blog/introducing-unikraft-lightweight-virtualization-using-unikernels/64e7046c-6749-4760-a99c-f8d1f728330e.png align="center")](https://unikraft.org/docs/concepts#introduction-to-unikernels)

In the traditional concept of virtualization, the isolation between different VMs is typically achieved through **software-based mechanisms** implemented by the [hypervisor](https://www.vmware.com/topics/glossary/content/hypervisor.html) (a specialized operating system) or the virtualization layer. This means that the hypervisor manages and enforces the isolation boundaries between VMs, using software-based techniques like memory protection, CPU scheduling, and device emulation.

> 💡 What is Device Emulation?
> 
> Simply put, Device emulation is like creating virtual versions of physical devices, such as network cards, storage drives, or graphics cards, within a virtual machine (VM). These virtual devices behave just like the real ones but exist only within the VM's environment.
> 
> For example, if the virtual computer wants to send data over the internet, the virtual network card (of the VM) sends the data out of the virtual machine, just like a real network card would. Similarly, if you want to save a file, the virtual storage drive takes care of it within the VM.
> 
> Thus, device emulation is essential for virtual machines because it allows them to interact with the outside world, access resources, and perform tasks as if they were physical machines, all while running within another computer's software environment i.e the Host OS.

With unikernels, this **“isolation”** is achieved at a lower level, **directly by the hardware itself**, rather than relying solely on software-based techniques. These hardware extensions provide the necessary support for creating and managing isolated execution environments, **allowing unikernels to run directly on the underlying hardware with minimal overhead.**

Therefore, by leveraging hardware primitives for isolation, unikernels are able to achieve **better performance** and **efficiency** compared to traditional virtualization approaches that rely purely on software-based isolation mechanisms.

This direct hardware-level isolation also contributes to the **enhanced security** and **reliability** of unikernels, as it reduces the attack surface and minimizes the impact of potential vulnerabilities in the software stack.

## Unikernels v/s Traditional OSes

Apart from it being a modern approach to virtualization, unikernels have several unique characteristics and benefits over traditional operating systems. A few of them are discussed below:

* **Minimalist Architecture:** Unikernels are designed to be extremely lightweight, containing only the essential components needed to run a specific application. This minimalist architecture results in reduced memory footprint, faster boot times, and improved performance.
    
* **Enhanced Security:** By stripping away unnecessary components, unikernels have a smaller attack surface, making them more secure. Additionally, because they are built to serve the purpose for a single application, unikernels reduce the risk of security vulnerabilities associated with multi-purpose systems such as Linux, Windows, or macOS.
    
* **Efficient Resource Utilization:** Unikernels focus resources solely on the application's requirements, making them ideal for resource-constrained environments like the cloud or edge devices.
    

# **Why Unikraft?**

Unikraft is designed to solve the [problems with using monolithic OSes](https://unikraft.org/docs/concepts/design-principles#problems-with-monolithic-oses) and enable developers to create a specialized OS for each application, ensuring optimal performance, security guarantees, and meeting desired Key Performance Indicators (KPIs).

Unikraft adopts several unique [design principles](https://unikraft.org/docs/concepts/design-principles) to achieve high modularity, enable great performance and security guarantees for your application. Some of them are discussed below:

* **Library Components** - Unikraft offers a modular approach to building unikernels, with library components serving as the core building blocks for applications. These components handle crucial functions like memory management, scheduling, file access, and networking. Developers can easily select and configure these components using Unikraft's intuitive menu-driven interface, inspired by [Linux's Kconfig system](https://www.kernel.org/doc/html/next/kbuild/kconfig-language.html).
    
* **Configurability** - Unikraft prioritizes configurability, allowing developers to fine-tune and customize every aspect of the unikernel to meet specific application needs. Drawing inspiration from [Linux's Kconfig system](https://www.kernel.org/doc/html/next/kbuild/kconfig-language.html), developers can easily select and configure libraries during the build process. This flexibility ensures adaptability to various use cases and environments.
    
* **Tooling and Integrations** - Unikraft provides a comprehensive suite of tools designed to simplify unikernel creation and management. Leveraging technologies like **Go,** [**GNU Make**](https://www.gnu.org/software/make/)**, C, and Kconfig**, these tools handle compilation, linking, and image generation tasks effortlessly. This tooling ecosystem empowers developers to build and deploy unikernels across different platforms with ease.
    

# Key Features

Let us have a look at the key features offered by Unikraft across different dimensions:

## Performance

Unikraft excels in performance testing, having lightning-fast boot times in milliseconds and minimal memory usage, typically requiring **only a few megabytes.**

Moreover, Unikraft's modular approach significantly reduces image sizes, with all applications **staying under 2MBs**. Boot times for the unikernels created with Unikraft range from **microseconds to milliseconds**, showcasing its efficiency. Memory consumption is minimal, with Unikraft guests **needing only 2-6MBs.**

Due to all the above factors, application performance is outstanding, with speeds **30%-80% faster than containers** and **70%-170% faster than Linux VMs.**

This amazing performance, results in an overall reduction in system call costs and optimized memory allocation, making Unikraft an excellent choice for modern computing.

## Security

Unikraft ensures top-notch security with its minimal attack surface and robust isolation between applications. By focusing on single-application execution and removing unnecessary components, Unikraft significantly reduces potential vulnerabilities. By supporting safe languages like Rust to implement critical components, it adds an extra layer of enhanced protection.

Plus, Unikraft actively integrates core security features such as [ASLR](https://www.ibm.com/docs/en/zos/2.4.0?topic=overview-address-space-layout-randomization) and [stack protection](https://techcommunity.microsoft.com/t5/windows-os-platform-blog/understanding-hardware-enforced-stack-protection/ba-p/1247815). Thus, aligning with industry standards to ensure comprehensive security measures.

## Efficiency

In terms of efficiency, Unikraft outperforms traditional monolithic operating systems like Linux. Through practical tests on devices like the **Raspberry Pi 3 B+** and the **Xilinx Ultra96-V2**, Unikraft demonstrates lower power consumption than [Alpine Linux](https://www.alpinelinux.org/) and [Raspbian OS](https://www.raspbian.org/).

> These tests include idle states as well as CPU-intensive tasks like calculating π.

Thus, Unikraft's ability to reduce power usage, especially in single-core scenarios (with networking disabled), highlights its efficiency advantage over Linux.

## Compatibility

Unikraft prioritizes compatibility by ensuring [POSIX](https://www.baeldung.com/linux/posix) and Linux compatibility, allowing seamless migration of existing applications to its deployment model. It incorporates a binary-compatibility layer, which enables the execution of [Linux binaries (ELFs)](https://www.baeldung.com/linux/executable-and-linkable-format-file#:~:text=ELF%20is%20short%20for%20Executable,executed%20on%20various%20processor%20types.) on top of Unikraft.

To achieve this, Unikraft complies with [Linux's ABI](https://opensource.com/article/22/12/linux-abi), providing a broad range of its system call interface — currently on `x86_64` with plans for extension to `AArch64`.

Unikraft's [application catalog repository](https://github.com/unikraft/catalog) includes binary-compatible apps, enabling users to access and develop applications easily. By leveraging an application's native build system with [musl C standard library](https://musl.libc.org/), Unikraft eliminates the need for extensive application porting efforts.

Unikraft's commitment to compatibility extends to support for a wide range of applications and languages, enhancing its deployment potential. Ongoing efforts to increase `syscall` support aim to further expand Unikraft's ability to seamlessly run mainstream applications!

# **Potential Use Cases and Applications**

With its unique features, the unikernel-based model of Unikraft offers a wide range of potential use cases across various industries.

It excels in scenarios where lightweight, specialized operating systems are needed to optimize performance, security, and efficiency. Some notable examples include **cloud computing, edge computing, Internet of Things (IoT) devices, containerized applications, and real-time processing systems.**

In **cloud computing**, Unikraft enables rapid deployment of highly efficient and secure microservices, reducing overhead and resource consumption.

Talking about **edge computing**, Unikraft's lightweight footprint and fast boot times make it ideal for deploying applications closer to users, improving latency and reliability.

In the **IoT sector**, Unikraft's small size and tailored configurations enhance device performance while ensuring robust security.

Overall, Unikraft's adaptability and efficiency makes it a valuable tool across a wide range of industries and use cases, empowering developers to build high-performance, secure applications tailored to specific requirements.

# Get Started Using Unikraft

Below is a quick start guide for you all, to get started using Unikraft:

## Step 1 - Install the `kraft` CLI

To begin, first install the [`kraft` CLI tool](https://unikraft.org/docs/cli/install), which allows you to easily leverage Unikraft unikernels at every stage of their lifecycle, from construction to production:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://get.kraftkit.sh | sh
```

## Step 2 - Using the Application Catalog

The [Unikraft application catalog](https://github.com/unikraft/catalog) is a collection of applications and examples that are built and packaged to run with Unikraft. The application packages are stored in the **Unikraft Application Registry**, typically identified by a name similar to those used by [DockerHub](https://hub.docker.com/) - `unikraft.org/node:18`, `unikraft.org/python:3.10` , etc.

To list down all the available applications in the registry, use the command below:

```bash
$ kraft pkg ls --apps --all --update

TYPE  NAME                     VERSION  FORMAT  PULLED       MANIFEST  INDEX    PLAT           SIZE
app   unikraft.org/base        latest   oci     never        6cef805   3d4c008  qemu/x86_64    1.6 MB
app   unikraft.org/base        latest   oci     never        fbb21c5   3d4c008  fc/x86_64      1.6 MB
app   unikraft.org/caddy       2.7      oci     never        1bcd45f   85d8bba  qemu/x86_64    63 MB
app   unikraft.org/caddy       2.7      oci     never        7804074   85d8bba  fc/x86_64      63 MB
app   unikraft.org/helloworld  latest   oci     never        281e174   addacb0  xen/x86_64     143 kB

...
```

> If you wish to know more about the application catalog and how it works, check out the [documentation](https://unikraft.org/guides/catalog-behind-the-scenes).

## Step 3 - Starting an Nginx Server

For this quick demo, let us pull and run the Unikraft nginx image - `unikraft.org/nginx:1.15` from the application catalog, to start a new nginx server:

```bash
$ kraft run -W -dp 8080:80 unikraft.org/nginx:1.15

[+] pulling unikraft.org/nginx:1.15 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• 100% [8.5s]
                                                                                                                              i  using arch=arm64 plat=qemu
Powered by
o.   .o       _ _               __ _
Oo   Oo  ___ (_) | __ __  __ _ ' _) :_
oO   oO ' _ `| | |/ /  _)' _` | |_|  _)
oOo oOO| | | | |   (| | | (_) |  _) :_
 OoOoO ._, ._:_:_,\_._,  .__,_:_, \___)
                 Telesto 0.16.3~21bf34c
```

In the above command, we are using the `-p` flag to map the unikernel’s port `80` and the host port `8080` (similar to how we do it using [docker commands](https://docs.docker.com/network/#published-ports)).

## Step 4 - Verify the Nginx Unikernel

Use the following command to list all the running unikernels:

```bash
$ kraft ps

NAME               KERNEL                         ARGS                       CREATED         STATUS   MEM  PORTS                 PLAT
relaxed_snowflake  oci://unikraft.org/nginx:1.15  -c /nginx/conf/nginx.conf  17 seconds ago  running  64M  0.0.0.0:8080->80/tcp  qemu/arm64
```

You’ll now be able to access the Nginx page at localhost:8080 in your machine!

![Nginx Page](/img/blog/introducing-unikraft-lightweight-virtualization-using-unikernels/48a91ee0-36c1-4184-af9e-f018e1ea9cb8.png align="center")

# Conclusion

**So what do you think of Unikraft?** Be sure to join their [discord community](https://unikraft.org/discord) if you wish to get involved or have any questions. Feel free to share your feedback about the tool or any features you wish to see in the coming future.

We are definitely looking forward to seeing the full potential of the unikernel model with Unikraft, in the coming future!

# Resources

Here are a couple of resources to get you started:

* [Unikraft Github](https://github.com/unikraft/unikraft)
    
* [Unikraft Concepts](https://unikraft.org/docs/concepts)
    
* [Internal Architecture](https://unikraft.org/docs/internals/architecture)
    
* [CLI Reference](https://unikraft.org/docs/cli)
    
* [Unikraft Guides](https://unikraft.org/guides)
    

Follow Kubesimplify on [**Hashnode**](https://blog.kubesimplify.com/), [**Twitter**](https://twitter.com/kubesimplify) and [**LinkedIn**](https://www.linkedin.com/company/kubesimplify). Join our [**Discord server**](https://kubesimplify.com/discord) to learn with us!