---
title: "Announcing BuildSafe: Your Path to Secure Software Supply Chain"
seoTitle: "Introduction to BuildSafe"
seoDescription: "This post introduces BuildSafe that lets you build your application using nix with ease. It also helps you in securing your software supply chain."
datePublished: 2024-06-10T11:26:08.882Z
slug: announcing-buildsafe
author: saiyam-pathak
cover: /img/blog/announcing-buildsafe/972f2c9f-460e-4614-9f90-72334ab9adff.png
tags: ["security", "cve", "slsa", "buildsafe", "supply-chain-security"]
cuid: clx8w0m42000q0ala3rxncno2
---
---

In today's software era, security is paramount. The frequency and severity of supply chain attacks, from log4j to SolarWinds, have underscored the need for robust security measures. Governments and enterprises alike are enforcing stringent regulations, making it imperative for organisations of all sizes to adopt a zero CVE (Common Vulnerabilities and Exposures) approach, complemented by comprehensive SBOMs (Software Bill of Materials). Traditionally, security has been perceived as the domain of dedicated teams, but we believe that security must be integrated into the build process itself. As developers, containers have reduced the bloat of dependencies we ship with our applications, but it hasn’t changed much for security teams to manage. Dockerfiles have become the de-facto standard of how we build applications. However, continuous monitoring by security teams becomes a difficult task, particularly as Dockerfiles evolve. Despite enforcing a policy of using minimal secure base images such as distroless & chainguard images, providing teams with the power of ad-hoc RUN statements in Dockerfiles has turned into a nightmare for security teams for [various reasons](https://buildsafe.dev/blog/OCI/) such as eyeing multiple package manager ecosystems for patches, building trust for unknown dependencies fetched with curl and keeping them up to date, etc.

## Introducing BuildSafe

We are thrilled to unveil BuildSafe, a CLI tool designed to streamline secure development and facilitate a path to tamper proof builds & a uniform way to manage dependencies(that helps with eliminating CVEs). BuildSafe integrates SBOM and Provenance generation as suggested by SLSA (Supply-chain Levels for Software Artifacts), ensuring security at every stage of the build process.

## Motivation

We believe the future of building applications lies in declarative, reproducible builds and equipping security teams with tools that help developers consume packages securely. Current state-of-the-art technologies such as Dockerfiles, buildpacks, and ko did not meet our needs. Visit our differences page for an in-depth review. We also found that most build tools don’t generate high-quality metadata about builds. Poor metadata leads to poor automation and an increased attack surface. Additionally, we noticed that Nix fundamentally solves all these problems, but it has a steep learning curve for teams. Therefore, we created an extremely simple CLI to enable teams to build and ship artifacts easily.

## Key Features

* Reproducible Builds: Leveraging the Nix ecosystem, which supports over 90,000 packages, BuildSafe ensures reproducible and secure builds. Reproducibility is the key element to proving builds have not been tampered with.
    
* Simple TUI: A developer-friendly terminal user interface allows easy browsing of OS packages with license and CVE information before a package gets added.
    
* High-quality attestations: Attestations such as SBOM, and Provenance give important information about which dependencies were used, and how the software was built. This metadata is crucial to securing the supply chain, and it needs to be of high quality.
    
* SLSA Compliance: We follow SLSA principles and generate SLSA Provenance. We also aim for BuildSafe to play a critical role for companies to reach the highest SLSA Level compliance, enhancing your security posture.
    
* Zero CVE/Minimal CVE: Not only do we display CVEs to developers before they add them, but we also allow a simple update mechanism to consume the latest patches from upstream.
    

## Getting Started

Hop over to our [docs](/guides/getting-started/) to get started.

Or watch complete walkthrough to get an overview of BuildSafe.

[![BuildSafe deep dive](https://img.youtube.com/vi/JA-bkvbK_0o/0.jpg align="left")](https://www.youtube.com/watch?v=JA-bkvbK_0o)

## Join Us

We believe the Nix ecosystem, with its found design principles, can revolutionize supply chain security. By choosing BuildSafe, you not only enhance your security posture but also streamline your development process. We invite you to join our Discord server. Your feedback is invaluable as we strive to improve supply chain security. For more information or assistance with SLSA compliance and faster builds, please reach out to us at [contact information](help@buildsafe.dev).

Team BuildSafe

## Additional Resources

* [What is SLSA?](/blog/supply-chain-security-part-1)
    
* [Is it Time to Move Beyond Dockerfiles?](/blog/OCI)