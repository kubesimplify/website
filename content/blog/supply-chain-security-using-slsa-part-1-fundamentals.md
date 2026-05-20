---
title: "Supply Chain Security Using SLSA - Part 1 (Fundamentals)"
seoTitle: "Supply Chain Security Using SLSA - Part 1 (Fundamentals)"
seoDescription: "In this article, we will delve into the fundamental aspects of supply chain security and its increasing significance. "
datePublished: 2024-05-29T12:04:59.362Z
slug: supply-chain-security-using-slsa-part-1-fundamentals
author: kunal-verma
cover: /img/blog/supply-chain-security-using-slsa-part-1-fundamentals/27852328-6143-44bf-8b17-b4616dd138ca.png
tags: ["security", "cloud-native", "cybersecurity-1", "supplychainsecurity"]
cuid: clwrs4cbl000e0amf61zpc75n
---
In December 2020, [SolarWinds](https://www.techtarget.com/whatis/feature/SolarWinds-hack-explained-Everything-you-need-to-know), a prominent IT management company, experienced a significant cyberattack. Hackers breached SolarWinds' software build system and and injected malicious code, known as **SUPERNOVA malware**, into their [Orion software platform](https://www.solarwinds.com/orion-platform), which was subsequently distributed to thousands of clients. This attack affected thousands of clients, including prominent U.S. government agencies and Fortune 500 companies, causing widespread data breaches and security concerns.

Unfortunately, this incident is just one example of many similar cyberattacks in recent years, which clearly highlights the critical vulnerabilities present in software supply chains.

As cyber threats continue to evolve and become more “sophisticated”, there is certainly an urgent need for robust supply chain security measures. In response to this increase in cyber threats, both U.S. and EU state officials have responded with regulatory measures aimed at enhancing software supply chain security.

> A Gist from [US Executive Order 14028](https://www.whitehouse.gov/briefing-room/presidential-actions/2021/05/12/executive-order-on-improving-the-nations-cybersecurity/):
> 
> It mandates federal agencies to implement security best practices and requires software vendors to adhere to rigorous security standards, including the use of a [Software Bill of Materials (SBOM)](https://www.synopsys.com/blogs/software-security/software-bill-of-materials-bom.html) to ensure transparency and integrity in software development

While there are specialized solutions targeting specific threats or vulnerabilities within the supply chain or Software Development Life Cycle (SDLC), these often prove inadequate on their own. [McKinsey's survey](https://www.mckinsey.com/capabilities/operations/our-insights/taking-the-pulse-of-shifting-supply-chains) highlights the limitations of such approaches.

**What we truly need is a comprehensive, end-to-end framework that oversees the entire supply chain!** This framework should define methods to mitigate threats across all stages of the software supply chain and ensure robust security guarantees.

This is where Supply-chain Levels for Software Artifacts (aka SLSA - pronounced "salsa") comes in. [Introduced by Google in 2021](https://security.googleblog.com/2021/06/introducing-slsa-end-to-end-framework.html), SLSA offers a comprehensive framework to enhance the security and integrity of software supply chains. This initiative is now a collaborative effort involving various organizations across the open-source ecosystem. A key contributor is [OpenSSF](https://openssf.org/), a foundation very similar to the [CNCF](https://www.cncf.io/), which supports and provides an open platform for projects aimed at improving the security of open-source software. This helps ensure widespread adoption and continuous improvement.

In this **two-part series on Supply Chain Security using SLSA**, we will delve into the fundamental aspects of supply chain security and its increasing significance. Subsequently, we'll explore the [SLSA framework](https://slsa.dev/) in detail, covering its definition, importance and its pivotal role in today's cybersecurity landscape.

# What is a Software Supply Chain?

If you're new to the concept of a software supply chain, let's start with the fundamentals. **What exactly does the term "supply chain" mean?**

Simply put, a software supply chain is the series of processes, components, and dependencies involved in creating, maintaining, and delivering software products, known as artifacts. These artifacts can include compiled binaries, OCI images, and Helm charts.

Similar to a physical supply chain, where raw materials are transformed into finished goods, a software supply chain involves various stages from development to deployment, with each stage relying on different tools, libraries, and services.

There are some key elements of a modern software supply chain:

* **Source Code -** The raw materials of software. This includes the code written by developers, which can come from multiple sources such as in-house development, open-source projects, or third-party vendors.
    
* **Build Systems -** Tools and processes that compile the source code into executable programs. This stage often involves integrating various libraries and dependencies.
    
* **Dependencies -** The external libraries or modules that software relies on to function. Dependencies can come from open-source projects or commercial vendors.
    
* **Distribution -** The process of delivering the software to end-users, which can include packaging, signing, and distributing through channels such as app stores or direct downloads.
    

[![Source: https://slsa.dev/spec/v1.0/terminology](/img/blog/supply-chain-security-using-slsa-part-1-fundamentals/5f9eed49-a641-42f0-b032-6b570c3fb1aa.png align="center")](https://slsa.dev/spec/v1.0/terminology)

# Importance of Supply Chain Security - Why now?

The important question to ask is - **Why do we need to talk about this now more than ever?**

The fact is that supply chain attacks have surged dramatically in these recent years, making it crucial to focus on security more than ever. See this recent data from the [2023 State of the Software Supply Chain report](https://www.sonatype.com/state-of-the-software-supply-chain/open-source-supply-and-demand):

> In our YoY monitoring, we have logged 245,032 malicious packages — meaning in the last year, we’ve seen the number of malicious packages triple! Looking at it a different way, it also indicates that in one year alone, we’ve seen twice as many supply chain attacks to the cumulative numbers in previous years.
> 
> [![Source: https://www.sonatype.com/state-of-the-software-supply-chain/open-source-supply-and-demand](/img/blog/supply-chain-security-using-slsa-part-1-fundamentals/4975d033-6431-4b7c-83dd-0364e9c249e3.png align="center")](https://www.sonatype.com/state-of-the-software-supply-chain/open-source-supply-and-demand)

**This is certainly an alarming news and the pace of growth is astonishing!** The data clearly shows that the modern software supply chain is becoming one of the fastest growing vectors for attackers to execute malicious code. Such attacks not only puts our digital lives at risk but also damages the reputation and finances of companies affected.

With the [increase in the number of attacks](https://www.sonatype.com/resources/vulnerability-timeline) in the recent years, governments are responding to these threats with new regulations. For instance, the United States’ [Executive Order on Improving the Nation’s Cybersecurity](https://www.whitehouse.gov/briefing-room/presidential-actions/2021/05/12/executive-order-on-improving-the-nations-cybersecurity/) mandates stringent security practices for software supply chains. Similarly, the [European Union's Cybersecurity Act](https://www.dutchncca.nl/the-cybersecurityact) introduces new certification frameworks aimed at ensuring the security of digital products and services.

These regulatory measures require organizations to adopt comprehensive security protocols to protect their software supply chains.

In light of these developments, it is crucial for organizations to prioritize supply chain security now more than ever.

# OSS Consumes the Software World

As solutions grow in complexity, so does the software supply chain. The complexity of modern software supply chains has grown exponentially, making them more vulnerable to security threats. This increase in complexity arises from various factors, including the widespread use of open-source components, third-party services, and complex build processes.

A major factor for this complexity is particularly attributed to the increasing reliance on open-source software (OSS) in recent years. According to a [report by Sonatype](https://www.sonatype.com/resources/white-paper-state-of-the-software-supply-chain-2020):

> Around 70% to 90% of a contemporary application "stack" comprises pre-existing OSS. From the operating system to the cloud container to the cryptography and networking functions, sometimes up to the very application running the enterprise or website.

While using open-source software offers flexibility and vendor-neutrality, it's essential to acknowledge that security can be a concern. Organizations often rely on OSS to swiftly deliver business value. However, the crucial question we face today is - **How can we securely consume OSS software?**

Despite OSS's generally strong reputation for security, managing products that depend on numerous external dependencies can be challenging. These dependencies often span across various layers, including the operating system, cloud containers, CI/CD tools, and cloud solutions (whether private, public, or hybrid).

This very complexity makes the entire supply chain an appealing target for attackers. By compromising a single point within the supply chain, attackers can potentially affect multiple components simultaneously. This is often easier for them than attacking individual code vulnerabilities, as they can exploit the interconnected nature of the supply chain for a greater impact.

# Threat Points For A Software Supply Chain

**So what are these “threat points” in a software supply chain?** Given the increasing complexity of the supply chain, there are numerous ways unauthorized modifications can be introduced at different stages.

Let's examine these "threat points" using a typical software development lifecycle:

[![Source: https://slsa.dev/spec/v1.0/threats-overview](/img/blog/supply-chain-security-using-slsa-part-1-fundamentals/4fbced80-e24d-468c-be1a-85e56770778b.png align="center")](https://slsa.dev/spec/v1.0/threats-overview)

1. **Point A and B - Unauthorized Source Code Submission & Compromised Repo**
    
    At point A, bad or malicious code changes could be submitted to the source code, by gaining access to a developer's account through methods like phishing or stolen credentials. Unauthorized changes means a compromised code repository (point B), which in turn gives attackers the freedom to directly modify the stored code or inject malicious code.
    
    One of the most famous examples of this would be [2018 Gentoo Linux GitHub breach](https://thehackernews.com/2018/06/gentoo-linux-github.html), where attackers replaced the original source code with a malicious one.
    
2. **Point C - Building from Modified Source**
    
    Let’s talk about point C which is - building the artifact from a modified source and this one’s pretty interesting!
    
    As mentioned in one the previous sections, cyberthreats have evolved and become more “sophisticated”. Therefore, even Even if the source code appears to be legitimate, if it’s built from a tampered source, the final software can be compromised.
    
    A very interesting case of this kind of an attack happened in [2021 on PHP’s git repo - `git.php.net`](https://php.watch/news/2021/03/git-php-net-hack). The attackers (impersonating as the project founders) pushed unauthorized changes that were disguised as minor typographical corrections. Although this was caught early by one of the maintainers, we can see how it could have affected countless websites and applications that rely on PHP if it had gone unnoticed!
    
3. **Point D - Compromised Dependencies**
    
    At point D, we are talking about the use of compromised dependencies.
    
    Dependencies remain one of the preferred mechanisms for creating and distributing malicious packages. This is due to the fact that there an entire network of direct and in-direct dependencies used in a project and, injecting even of them with malicious code, can lead to affecting all software that relies on these components.
    
    [![Source: https://security.googleblog.com/2021/12/understanding-impact-of-apache-log4j.html](/img/blog/supply-chain-security-using-slsa-part-1-fundamentals/64c68ec1-9c98-4879-9206-0223d01e7efd.png align="center")](https://security.googleblog.com/2021/12/understanding-impact-of-apache-log4j.html)
    
4. **Point E - Compromised Build Process**
    
    Harmful dependencies can directly affect and compromise the build process (point E). One of most famous examples of this is the [SolarWinds breach in 2020](https://www.crowdstrike.com/blog/sunspot-malware-technical-analysis/?ref=blog.gitguardian.com), where attackers inserted malware into the build system, leading to widespread distribution of compromised software.
    
5. **Point G - Public Package Registries**
    
    At point G, we are referring to public package registries that can be targeted, allowing attackers to replace legitimate packages with malicious ones.
    
    An example for this can be the [malicious npm packages](https://www.scmagazine.com/news/github-npm-registry-abused-to-host-ssh-key-stealing-malware) that were discovered recently which aimed to steal credentials and other sensitive information from developers.
    

We can go on here, but the bottom line is - with the increasing complexity of software and the software delivery lifecycle, there are numerous ways in which things can go wrong, potentially leading to critical impacts on both the software and its consumers.

# Closing Thoughts

Already? Yes, indeed! As we conclude Part 1 of our supply chain security series, it's evident that safeguarding software is tough work, but crucial at the same time. The surge in supply chain attacks over recent years underscores the critical importance of prioritizing overall supply chain security.

To help us achieve this goal, we have the [SLSA framework](https://slsa.dev/). In Part 2, we'll delve deeper into SLSA, exploring its significance and how it can serve as our initial step towards fortifying and enhancing our supply chain security.

Keep an eye out for Part 2!

# Credits

Lastly, I would like to extend my heartfelt gratitude to [Rakshit Gondwal](https://x.com/RakshitGondwal) and [Saiyam Pathak](https://x.com/SaiyamPathak) for their invaluable contributions to this blog series 💙

# Resources

* [The Rising Threat of Software Supply Chain Attacks (By Linux Foundation)](https://linuxfoundation.eu/newsroom/the-rising-threat-of-software-supply-chain-attacks-managing-dependencies-of-open-source-projects)
    
* [State of the Software Supply Chain By Sonatype - 9th Edition](https://www.sonatype.com/state-of-the-software-supply-chain/introduction)
    
* [A History of Software Supply Chain Attacks by Sonatype](https://www.sonatype.com/resources/vulnerability-timeline)
    
* [Understanding the Impact of Apache Log4j Vulnerability (Google Blog)](https://security.googleblog.com/2021/12/understanding-impact-of-apache-log4j.html)
    
* [The State of the Software Supply Chain 2022 (By VMware Tanzu)](https://www.vmware.com/content/dam/digitalmarketing/vmware/en/pdf/docs/vmw-state-of-software-supply-chain.pdf)
    

Follow Kubesimplify on [Hashnode](https://blog.kubesimplify.com/), [Twitter/X](https://twitter.com/kubesimplify) and [LinkedIn](https://www.linkedin.com/company/kubesimplify). Join our [Discord server](https://kubesimplify.com/discord) to learn with us!