---
title: "What is Reproducibility and why does it matter?"
seoTitle: "What is Reproducibility and why does it matter?"
seoDescription: "In this blog, we'll explore how reproducible builds plays a significant role in securing the software supply chain."
datePublished: 2024-08-26T03:01:44.816Z
slug: what-is-reproducibility-and-why-does-it-matter
author: kunal-verma
cover: /img/blog/what-is-reproducibility-and-why-does-it-matter/95b6a923-72b9-4724-8645-3fd5e243a5e7.png
tags: ["security", "vulnerability"]
cuid: cm0aewjjk000608l4cbus1gbd
---
If you’ve been following our [previous blogs](https://blog.kubesimplify.com/supply-chain-security-using-slsa-part-1-fundamentals), we’ve often highlighted the SolarWinds attack as one of the most significant cybersecurity breaches in history — where hackers managed to infiltrate the build process of SolarWinds' [Orion software](https://www.solarwinds.com/orion-platform), inserting malicious code that went undetected by both developers and end-users. Thus, compromising thousands of organizations, including major U.S. government agencies and Fortune 500 companies.

This incident highlights a critical gap in the software development process — **having vulnerabilities in the build process itself.** If attackers can compromise the build process of the software itself that companies rely on, the consequences can be potentially catastrophic.

So, how do we address this vulnerability? The answer lies in having **reproducible builds.** At its core, a reproducible build ensures that every time software is built, it produces the exact same result, no matter **who, where and when its built.** By guaranteeing consistency and transparency, reproducible builds not only help close the gaps that attackers might exploit but also enable verification to check if a build has been tampered with, making it significantly harder for malicious code to be inserted undetected.

In this blog, we'll explore how reproducible builds plays a significant role in securing the software supply chain, prevent tampering, and restore trust in the software supply chain.

# Repeatable Builds - The Start

One of the first steps towards achieving consistency in the build process is through **repeatable builds** — a concept you might already be somewhat familiar with.

A build is considered repeatable if, by following the same steps and using the same inputs, you can expect to produce similar functioning software each time. This is similar to working with [Dockerfiles](https://docs.docker.com/reference/dockerfile/#:~:text=A%20Dockerfile%20is%20a%20text,line%20to%20assemble%20an%20image.) — when you build a container image using the same Dockerfile, you generally get consistent results. However, the output might still have minor differences due to factors like timestamps or variations in the environment where the build occurs.

While repeatable builds are a good start, they don’t guarantee that the outputs will be identical every time. It’s like baking a cake using slightly different ingredients or a different oven; the end product might be similar, but not exactly the same!

# Moving to Hermetic Builds

To get closer to consistent and secure outputs, we move on to using **hermetic builds**.

A **hermetic build** is a process that is fully isolated from external influences, meaning it is self-contained and independent of the environment where it runs. In a hermetic build, the process doesn’t rely on external network resources, environment variables, or system-specific configurations. Everything required to build the software — including source code, dependencies, tools, and configurations — is contained within a controlled environment, often using containers, sandboxes, or virtual environments.

The main advantage of a hermetic build is that it removes the “variability” that can arise from external factors, which might otherwise lead to inconsistent builds.

For example, consider a project that relies on an open-source library. If your build process fetches this library from the internet each time the build is triggered, there’s a risk that a newer version of the library could be compromised by some malicious actors and thus, introduce unexpected changes, potentially breaking your code. Even worse, if the library’s repository goes down temporarily or is compromised, your build could fail entirely or produce unintended results.

By isolating the build process, a hermetic build ensures that the exact version of the library is included in the build environment, leading to consistent and reliable results every time. This also makes it easier to analyze the imported code for potential issues and vulnerabilities before the software is deployed.

In summary, while hermetic builds effectively control the environment to ensure consistency, it’s important to remember that achieving completely identical outputs across different environments requires managing all potential sources of variability, which brings us to the concept of reproducible builds.

# **What is a Reproducible Build?**

This brings us to r**eproducible build** — our main topic of discussion to create secure and consistent software.

A build is considered reproducible when, no matter who builds it, where it’s built, or when it’s built, the output is always exactly the same.

Think of it like following a recipe to bake a cake — if you use the same ingredients and follow the same steps every time, you’ll end up with the exact same cake. In software, a build is **reproducible** if given the same source code, build environment and build instructions, any party can recreate bit-by-bit identical copies of all specified artifacts. This is the foundation of what’s known as a [deterministic build system](https://reproducible-builds.org/docs/deterministic-build-systems/).

But how do we ensure that these artifacts are truly identical? Developers compare the cryptographic [hash values](https://www.thesslstore.com/blog/what-is-a-hash-function-in-cryptography-a-beginners-guide/) of the outputs. A cryptographic hash function produces a unique string of characters (a hash value) based on the input data. If the hash values match, it confirms that the builds are identical. Even a tiny difference in the build process, such as a different timestamp or file order, would result in a different hash!

This comparison process is s crucial for verifying reproducibility as it provides a clear, objective way to confirm that no unexpected variations have been introduced during the build process.

It’s important to note that while reproducible builds typically involve hermetic practices (since they control their environment to ensure consistency), not all hermetic builds are reproducible. For example, a hermetic build might be isolated from external factors, but if it doesn’t manage all sources of variability, like timestamps, it could still produce different results in different environments, leading to non-reproducible builds.

![](/img/blog/what-is-reproducibility-and-why-does-it-matter/355127fe-8c54-4301-a1e7-cafd6eec8baa.png align="center")

# Benefits - **Secure the Supply Chain using Reproducible Builds**

Well, it’s time to address probably the most important question - Why does reproducibility matter?

The benefits of reproducible builds extend beyond just creating consistent software; they play a crucial role in ensuring the integrity of the build process, securing the software supply chain, and ultimately protecting the entire development lifecycle from potential threats.

### Securing the Build Process

One of the most significant benefits of reproducible builds is their ability to secure the build process itself — as discussed above. By ensuring that every build is identical and verifiable, reproducible builds help prevent tampering and the introduction of malicious code during the build process.

In response to the 2020 breach, SolarWinds implemented a strategy focused on enhancing the security of their build process, with reproducible builds as a key component. [According to SolarWinds](https://www.cybersecuritydive.com/news/solarwinds-software-build-reproducible-cyberattack-code/596850/), they now rebuild their software in a separate, controlled environment and compare the outputs with the original builds to ensure no unauthorized changes have been made.

As **Lee McClendon**, SVP of Research and Development at SolarWinds, stated:

> “Reproducible builds allow us to verify that the software delivered to our customers is exactly what it’s supposed to be.”

This process is crucial for detecting and preventing tampering, as any discrepancies between builds in different environments would immediately signal a potential issue.

Overall, this shift to reproducible builds was a vital step in strengthening SolarWinds’ software supply chain and restoring trust with their customers, highlighting the importance of reproducible builds in modern software development.

> 💡 Did you know?
> 
> Another notable example is the CCleaner attack of 2017, where the attackers exploited the build process to insert malicious code, which later infected over 2.3 million users! This kind of breach also depicts the importance of reproducible builds in detecting such tampering before it reaches users.
> 
> Read more about the attack [here](https://thehackernews.com/2018/04/ccleaner-malware-attack.html).

### Solution to “Works on my Machine” Problem

Reproducible builds help move beyond the infamous **“works on my machine” problem**. It ensures that the software will behave consistently across different systems, regardless of the underlying hardware or software configurations.

This consistency is critical not only for debugging and development but also for the broader goal of maintaining trust in the software itself. Additionally, having this reliability is particularly important in complex, collaborative projects where code passes through multiple hands and environments before reaching production!

### Complimenting SBOM and Provenance

When we talk about securing the build process or even the entire software supply chain, the key part is knowing exactly what’s in your software and how it got there!

This is where [Software Bill of Materials (SBOM)](https://about.gitlab.com/blog/2022/10/25/the-ultimate-guide-to-sboms/) and [provenance](https://slsa.dev/spec/v0.1/provenance) come in. An SBOM is like a detailed ingredients list for your software, showing all the components, libraries, and dependencies it contains. Provenance, which we can think of as the recipe, goes a step further by tracking the origin and history of each component in your software.

Reproducible builds compliments SBOM and provenance by ensuring that every part of the software is accounted for and that the build process can be checked and verified. In fact, reproducible builds inherently provide high-quality SBOM and provenance, as they guarantee that the software’s components and from where they originate, are consistent and unaltered. If an SBOM is created as part of a reproducible build, it gives you a trustworthy record of what’s in the software, which is crucial for finding and fixing vulnerabilities. Furthermore, a provenance is crucial for ensuring that all parts of your software are legitimate and haven’t been tampered with during the build process.

# **Industry Standards and Reproducible Builds**

It wouldn’t be wrong to say that:

> “Reproducible builds are not just a best practice; they're increasingly becoming a requirement in industry standards aimed at securing the software supply chain.”

To start with, the OpenSSF’s [S2C2F](https://github.com/ossf/s2c2f/blob/main/specification/framework.md#practice-7-rebuild-it) (Secure Supply Chain Consumption Framework) is one such standard that emphasizes the need to rebuild OS packages from source before deployment. By ensuring that every package is built from verified, reproducible sources, S2C2F helps prevent tampering and ensures that the software being deployed is secure and trustworthy.

Similarly, the [SLSA](https://slsa.dev/) (Supply Chain Levels for Software Artifacts) standard, also highlights reproducible builds as a key element in mitigating supply chain threats. SLSA acknowledges the importance of “verified reproducibility,” supporting its role in ensuring the security of the software supply chain and making it much harder for attackers to introduce malicious code unnoticed, as seen in the SolarWinds incident.

This focus on reproducible builds is especially important for meeting security regulations like those in the [EU Cyber Resiliency Act](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act) and [SLSA](https://slsa.dev/), which emphasize the need for SBOM and provenance in the software supply chain. This means that companies must ensure the security of their own supply chains, often by building their own SBOM and ensuring that their software is built reproducibly to avoid vulnerabilities.

These standards certainly show how reproducible builds play a crucial role in keeping software safe, by making sure it’s built and deployed securely every time.

# Closing Thoughts

I think it’s apt to say that reproducibility matters because it helps securing the most crucial stage of the software supply chain — the build process itself. By ensuring that every build is consistent and tamper-proof, reproducibility helps protect against incidents similar to SolarWinds breach.

This level of security is crucial in today’s environment, where even small vulnerabilities can be exploited with significant consequences. By embracing reproducibility, organizations are taking a proactive step in securing their software against potential threats, ensuring that what is delivered to users is exactly what was intended — nothing more, nothing less!

# Resources

* [Supply Chain Security Using SLSA](https://blog.kubesimplify.com/supply-chain-security-using-slsa-part-1-fundamentals)
    
* [SolarWinds rethinks Software Builds](https://www.cybersecuritydive.com/news/solarwinds-software-build-reproducible-cyberattack-code/596850/)
    

Follow Kubesimplify on [Hashnode](https://blog.kubesimplify.com/), [Twitter/X](https://twitter.com/kubesimplify) and [LinkedIn](https://www.linkedin.com/company/kubesimplify). Join our [Discord server](https://kubesimplify.com/discord) to learn with us!