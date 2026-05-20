---
title: "Supply Chain Security Using SLSA - Part 2 (The Framework)"
seoTitle: "Supply Chain Security Using SLSA - Part 2 (The Framework)"
seoDescription: "In this article we'll discuss the Supply Chain Levels for Software Artifacts (SLSA) framework to achieve supply chain security in an organization."
datePublished: 2024-06-13T16:33:19.614Z
slug: supply-chain-security-using-slsa-part-2-the-framework
author: kunal-verma
cover: /img/blog/supply-chain-security-using-slsa-part-2-the-framework/f880b610-b487-4fc1-bd65-3620b26d4755.png
tags: ["framework", "security", "supplychainsecurity"]
cuid: clxdhb7cu000509kzewfpblgg
---
In [Part 1](https://blog.kubesimplify.com/supply-chain-security-using-slsa-part-1-fundamentals) of our ongoing Supply Chain Security series, we delved into the fundamental aspects of supply chain security and its growing importance.

> If you haven’t yet checked out the first part, make sure to [give it a read now!](https://blog.kubesimplify.com/supply-chain-security-using-slsa-part-1-fundamentals)

Now that we've established the critical nature of supply chain security, in this article we'll discuss the Supply Chain Levels for Software Artifacts (SLSA, pronounced "salsa") framework and see how it provides a structured approach to securing the software development lifecycle.

# What is SLSA?

According to the [official documentation](https://slsa.dev/spec/v1.0/about):

> SLSA (aka Supply Chain Levels for Software Artifacts) is a set of incrementally adoptable guidelines for supply chain security, established by industry consensus.

The main goal of SLSA is to help organizations improve their software supply chain security step-by-step.

SLSA breaks down the supply chain into different tracks, focusing on different aspects/stages of a supply chain - with the current focus on the [Build Track](https://slsa.dev/spec/v1.0/levels#build-track), which secures the build process. Each track has levels that represent increasing security practices. Higher levels offer better protection but are more complex and costly to implement. Lower levels are easier to adopt but provide more modest security guarantees.

> Note: `SLSA 0` refers to software that doesn't yet meet any SLSA level.

Organizations can use these guidelines to assess their current security level and understand the steps needed to reach the next level which makes the implementation more manageable and effective at the same time.

# Origins and Current State

Originally [introduced by Google in 2021](https://security.googleblog.com/2021/06/introducing-slsa-end-to-end-framework.html), SLSA aimed to enhance the security of the software supply chains in response to rising supply chain attacks. Drawing inspiration from Google's internal [Binary Authorization for Borg](https://cloud.google.com/docs/security/binary-authorization-for-borg?ref=blog.gitguardian.com), which has safeguarded Google's production workloads for over 8 years, SLSA emerged as a framework for organizations seeking to enhance their security practices.

In collaboration with open source communities, Google designed SLSA to address common vulnerabilities and threats across the industry. Today, SLSA is part of the [Open Source Security Foundation (OpenSSF)](https://openssf.org/), an industry-led initiative focused on improving the security of open source software.

While Google initiated the SLSA framework, it is now supported by the broader OpenSSF community, offering structured guidelines for securing various facets of the software supply chain.

# Target Audience - **Who’s it For?**

**So, who’s SLSA for?** It is designed for anyone involved in the software supply chain, including:

* **Software producers -** Are you an open-source project maintainer wondering how to securely deliver your artifacts to consumers? Whether you're part of an open-source project, a software vendor, or an internal team developing first-party code within a company, SLSA offers protection against tampering throughout the supply chain. It helps mitigate insider risks and ensures that the software reaches consumers as intended.
    
* **Software consumers -** Are you a from a development team asking, "How can we verify if a package has not been tampered with?" Whether you're relying on open-source packages, a government agency using vendor software, or a CISO evaluating organizational risk, frameworks like SLSA and the [Supply Chain Security Framework (S2C2F)](https://github.com/ossf/s2c2f) empower you to assess the security practices of the software you utilize and ensure it aligns with your security expectations.
    
* **Infrastructure providers -** Are you offering infrastructure services and wondering how to contribute to a secure software supply chain? Whether you provide ecosystem package managers, build platforms, or CI/CD platforms, adopting SLSA is crucial. It serves as a bridge between producers and consumers, fostering a secure software supply chain ecosystem.
    

Overall, SLSA is designed for anyone involved in the software supply chain, including software developers, DevOps engineers, security teams, and organizations looking to enhance their software security.

A question you might have is, **What doesn't SLSA cover?** It's a valid point to consider. To find out more about areas SLSA doesn't address, check out the [official documentation](https://slsa.dev/spec/v1.0/about#what-slsa-doesnt-cover).

# Key Objectives

In addition to its primary goal of providing incrementally adoptable guidelines for supply chain security, SLSA focuses on some key objectives:

* **Prevent Tampering and Verify Integrity**: Ensure that no one unauthorized can alter the software during its development and distribution lifecycle and help consumers verify its integrity.
    
* **Improve Security and Increase Trust**: Encourage better security practices, enhance visibility into the software development process, and build confidence in the security of the software supply chain.
    

These objectives are essential as they guide organizations in implementing SLSA practices that protect against various security threats, ensuring the integrity and trustworthiness of their software.

To know more about the objectives of SLSA and its guiding principles, check out the [documentation](https://slsa.dev/spec/v1.0/principles).

# Important Terminologies

Before diving into the **SLSA Levels**, we need to understand a core set of terminologies that would help in our understanding of what we're protecting:

* **Artifact** - Think of an artifact as a packaged food or dish. It's an immutable piece of data, typically referred to as the software itself. Examples include a binary, source code, a container image, an SBOM, or provenance data.
    
* **Provenance** - Information about how and where software was built, including details like the source code and dependencies used. It's like a detailed recipe that shows where the ingredients (dependencies) came from, helping to verify the software's origin and build process.
    
* **Software Bill of Materials (SBOM)** - A list of ingredients or components that make up the software. Just like checking food ingredients for allergies, an SBOM provides detailed information about all the open-source and third-party components used in building the software artifact, ensuring they meet compliance standards.
    
    > 💡 Did you know?
    > 
    > When it comes to creating SBOMs, there are two main standards followed - [SPDX](https://spdx.dev/) and [CycloneDX](https://cyclonedx.org/)
    
* **Attestation** - An attestation is an authenticated statement or metadata about a software artifact or collection of artifacts. Think of it as a standard document structure, like a letter, where the subject is an artifact and the body (termed as "**predicates**") is information about the artifact such as SBOM, Provenance, etc.
    
    > Note: Producers should sign their attestations using a tool like [cosign](https://github.com/sigstore/cosign). This allows consumers to verify that the attestations were indeed created by the producers.
    
    For more details on predicate types, refer to the [in-toto Attestation Predicates](https://github.com/in-toto/attestation/tree/main/spec/predicates).
    
    > 💡 Did you know?  
    > 
    > SLSA has a way for organizations to prove they meet certain SLSA levels without sharing all their internal details with their consumers. They can use a trusted intermediary to provide a verification summary.  
    > 
    > For more information, see the [Verification Summary Attestation](https://slsa.dev/spec/v1.0/verification_summary).
    
    Below is an example of what an attestation looks like:
    
    [![](/img/blog/supply-chain-security-using-slsa-part-2-the-framework/73d07a47-b2a3-47ab-af44-42090149a36c.png align="center")](https://slsa.dev/attestation-model#model-and-terminology)
    
    > 💡 Did you know?
    > 
    > It’s also worth noting that Attestation may also include a [Software Bill of Materials (SBOM)](https://www.synopsys.com/blogs/software-security/software-bill-of-materials-bom.html).
    
    To know more about software attestations, refer to the [official documentation](https://slsa.dev/attestation-model).
    

For now, this overview provides a foundational understanding of these terms. For further details, you may check out the [documentation](https://slsa.dev/spec/v1.0/terminology).

# **SLSA Levels Explained**

SLSA is structured into a series of levels, each offering increasing supply chain security guarantees. Each level is split into tracks and each track has its own set of levels that measure a particular aspect of supply chain security.

Transitioning from [version `0.1`](https://slsa.dev/spec/v0.1/levels) to the current version `1.0` (announced by [OpenSSF in 2023](https://openssf.org/press-release/2023/04/19/openssf-announces-slsa-version-1-0-release/)), SLSA primarily focuses on a single track i.e. the [Build Track](https://slsa.dev/spec/v1.0/levels).

The Build Track is dedicated to ensuring the trustworthiness and completeness of the software artifact's creation process, known as provenance. At its core, it verifies that the artifact was built as expected. The levels within this track range from basic existence of provenance to robust protection against tampering and unauthorized access.

With the Build Levels 1 to 3, organizations can significantly strengthen their software supply chain security.

**Level 1** establishes a sets a foundational stage for tracking, debugging, and verifying software builds. Progressing to **Level 2** strengthens security measures, making it more difficult for attackers to tamper with the build process. Finally, reaching **Level 3** provides robust protection against tampering and unauthorized access, ensuring a high level of trust and integrity in the software development process.

For detailed information on all the levels under the build track and their requirements, refer to the [SLSA documentation](https://slsa.dev/spec/v1.0/levels).

# Future Of SLSA - What can we expect?

Going ahead, we certainly anticipate continuous improvement in the SLSA framework and there are some exciting developments around the corner.

## 1\. Future Directions by the Community

Looking ahead, we can expect continuous improvement in the SLSA framework, driven by community feedback and advancements in supply chain security practices.

One such notable on-going development is that the community is exploring the possibility of introducing new Build Levels, such as [Build Level 4](https://github.com/slsa-framework/slsa/issues/977) to enhance build integrity. These advancements may include features like reproducible builds.

> 💡 Did you know?  
> Solutions like [Nix](https://nixos.org/) have been pioneers in implementing reproducible builds for over 20 years, ensuring that software builds remain consistent and secure. This emphasizes the importance of "reproducibility" in minimizing the risk of tampering.

The goal is to ensure that software builds remain consistent and secure, minimizing the risk of tampering.

If you wish to know more about the future directions of SLSA, check out the [documentation](https://slsa.dev/spec/v1.0/future-directions).

## **2\. SLSA Intersecting with Secure Software Supply Chain Framework (S2C2F)**

The [Secure Supply Chain Consumption Framework (S2C2F)](https://openssf.org/blog/2022/11/16/openssf-expands-supply-chain-integrity-efforts-with-s2c2f/), created by Microsoft and, now [a part of OpenSSF](https://openssf.org/blog/2022/11/16/openssf-expands-supply-chain-integrity-efforts-with-s2c2f/) is designed to address real-world security threats in software supply chains. It outlines specific threats to open-source software (OSS) and how to reduce these risks.

According to [OpenSSF](https://openssf.org/blog/2022/11/16/openssf-expands-supply-chain-integrity-efforts-with-s2c2f/), S2C2F is compatible with producer-focused frameworks like SLSA. While SLSA ensures trustworthy artifact provenance, S2C2F offers broader security coverage, including threat detection and incident response.

Combining S2C2F with SLSA has the potential to strengthen risk management, enhance trust and security in software supply chains, and ensure adaptability to emerging threats.

# Final Thoughts

As we wrap up our two-part series on Supply Chain Security with SLSA, let's recap what we've learned and look ahead.

In [Part 1](https://blog.kubesimplify.com/supply-chain-security-using-slsa-part-1-fundamentals), we talked about why supply chain security matters more than ever amidst rising threats and the complexity of modern software supply chains. We also touched upon emerging regulations aimed at enhancing software safety.

In Part 2, we explored SLSA's role in providing a practical approach to supply chain security and discussed its future development, including the potential benefits of integration with frameworks like S2C2F.

**It's important to remember that while adopting community-driven specifications like SLSA is essential, it doesn't automatically ensure compliance.** We need accessible tools to simplify SLSA compliance and projects like [BuildSafe](https://buildsafe.dev/) are already paving the way in that direction.

As we conclude, I hope this series sparked your curiosity about supply chain security and its significance in today's tech world.

Be sure to stay updated on the latest news about SLSA and similar frameworks in the security ecosystem!

Thank you for reading.

# Credits

Lastly, I would like to extend my heartfelt gratitude to [Rakshit Gondwal](https://x.com/RakshitGondwal) and [Saiyam Pathak](https://x.com/SaiyamPathak) for their invaluable contributions to this blog series 💙

# Resources

* [SLSA Documentation](https://slsa.dev/)
    
* [NixOS](https://nixos.org/)
    
* [OpenSSF's announcement about S2C2F](https://openssf.org/blog/2022/11/16/openssf-expands-supply-chain-integrity-efforts-with-s2c2f/)
    
* [Core Terminologies of Software Supply Chain and SLSA](https://slsa.dev/spec/v1.0/terminology)
    

Follow Kubesimplify on [Hashnode](https://blog.kubesimplify.com/), [Twitter/X](https://twitter.com/kubesimplify) and [LinkedIn](https://www.linkedin.com/company/kubesimplify). Join our [Discord server](https://kubesimplify.com/discord) to learn with us!