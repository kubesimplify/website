---
title: "Introduction to developer platforms with Gimlet"
datePublished: 2022-05-30T12:38:27.389Z
slug: introduction-to-developer-platforms-with-gimlet
author: laszlo-fogas
cover: /img/blog/introduction-to-developer-platforms-with-gimlet/3K9xw72W5.png
tags: ["nginx", "kubernetes", "devops", "k8s"]
cuid: cl3spvj4b00p4zsnvfefa3u0r
---
## What are developer platforms

Cloud native technologies provide a rich set of primitives. Primitives that can be used as building blocks to build your dream product. Each primitive serves a specific purpose while taking care of nonfunctional characteristics as well: you can run them fast, secure, and at scale.

The era of cloud native has been about optionality. You have a rich set of tools available to build your engineering practices around, reaching levels that were not possible for most companies before this era.

### But a rich set of tools doesn't make a developer platform.

When you pick tools from the cloud native ecosystem, you often don’t just have a single tool in mind. You are optimizing your team's developer experience across the whole flow, and you begin to prioritize features that are touch points along the larger system. 

When you pick a primitive, and integrate it in your product, you make certain decisions. These decisions - without you knowing it - result in your developer platform.

### Developer platforms are about technical goals

As you have probably guessed by now, developer platforms are about technical goals, not product features.

Developer platforms may take care of

- scaling a key area
- performance and availability goals
- easier maintenance
- compliance questions
- encapsulating core business features

Bluntly put: a developer platform is whatever you come up with that allows developers to focus on business-logic, by letting them rely on the platform taking care of the above listed characteristics.

Besides technical goals, there is one more key characteristic of developer platforms. Platforms enable engineers, they shouldn’t make their lives harder.

## What is Gitops

Gitops is a trend that took over the cloud native space in recent years.

The term was coined in a 2017 [article](https://www.weave.works/blog/gitops-operations-by-pull-request) by Alexis Richardson, and later [extended](https://www.weave.works/blog/what-is-gitops-really) in 2018, where he highlighted the characteristics of a Gitops system.

Gitops is centered around git and the workflows and the toolchain developers know very well: commits, pull requests, comments and issues.

It is built on prior work of the Infrastructure as Code community, where systems were captured declaratively in code and stored in git. Declaratively, as in configuration, is described by a set of facts and not by a series of instructions.

This declarative approach captures the desired state in git, allows for the system to converge to this desired state, and operators to get notified if the state diverges.

The Gitops definition matches well-known tools like Terraform and Ansible, and the then new Flux tool, that brought continuous delivery for Kubernetes, the capability to synchronize Kubernetes YAML files from git to the cluster.

### Limitations of Gitops tools today

Companies are rushing to introduce Flux or ArgoCD to their Kubernetes continuous delivery flows today. Gitops is proven to be great technique to deploy on Kubernetes.

These tools however suffer from the typical cloud native tooling problem: they are great single purpose tools, but they require considerable DevOps effort to integrate them into companies developer platforms.

They are good building blocks, but you have to make several decisions when you start implementing Gitops:

- will you have one central repository or many?
- how do you split repositories?
- how to organize folders inside the repository?
- how to model clusters, environments, teams, namespaces, apps?
- how to promote changes through environments?

## What is Gimlet

[Gimlet](https://gimlet.io) is a 100% open-source project [hosted on Github](https://github.com/gimlet-io/gimlet), that you can use to build and run your developer platform on Kubernetes.

Gimlet is a command line tool and a dashboard that packages a set of conventions and matching workflows to manage a gitops developer platform effectively.

### Gimlet caters for cluster admins and developers

As a cluster admin, you can

- make an empty Kubernetes cluster a developer platform with ingress, observability, SSL, policies
- get a curated update stream of security and feature upgrades
- all delivered in a git repo with self-contained gitops automation


![Screenshot from 2022-05-16 15-53-38.png](/img/blog/introduction-to-developer-platforms-with-gimlet/ULabiLDhW.png align="left")

As a developer you can

- configure your services without the Kubernetes YAML boilerplate
- deploy, rollback from CLI or from a dashboard
- focus on your own application, no need to navigate an inventory of Kubernetes resource types

![Screenshot from 2022-05-16 15-36-57.png](/img/blog/introduction-to-developer-platforms-with-gimlet/Q_1Uilh_i.png align="left")

### Why Gimlet

Gimlet puts you on a paved path.

Gets you up and running quickly, and it provides sensible escape hatches should you find the abstractions limiting.

Gimlet is built on Flux and Helm, so you are not locking yourself into some proprietary system.

Instead, Gimlet packs conventions and practices that get you a developer platform on an empty cluster in a matter of hours, with deployment automation and a dashboard that is not focused on inventories, but application source code repositories.


![Screenshot from 2022-05-16 15-36-03.png](/img/blog/introduction-to-developer-platforms-with-gimlet/Ecl-7DzXH.png align="left")

### Architecture

![Screenshot from 2022-05-16 15-39-04.png](/img/blog/introduction-to-developer-platforms-with-gimlet/rIKwMNtO3.png align="left")

Developers and cluster administrators both can carry out their operations through the Gimlet CLI, or through the Gimlet Dashboard.

Gimlet operates on a set of git repositories that serve as the desired state for the various environments: staging, production, etc. The logic to efficiently read and write the Gitops repositories are hosted in a server-side component, called Gimletd.

The environments stored in git repositories are then mapped onto clusters - or namespaces within clusters - with Flux configurations. These Flux configurations are self-contained in the git repositories.

Additionally, Gimlet provides a Dashboard to gain an overview of deployed services. The real-time Kubernetes information for this overview is supplied by the Gimlet Agent, that runs in each environment.

### Usecases

Gimlet was made with small to medium developer departments in mind. Companies that can't employ platform teams, but want to get the benefits of a modern, cloud native stack.

Gimlet was successfully deployed with teams as small as 2 developers, with no devops specialization, up to companies with many developer teams, with hundreds of services, with a couple of dedicated infrastructure people on staff.

If you are a cluster administrator who wants to roll out a platform for developers, or you are a developer who just started up a managed Kubernetes cluster. Chances are that with Gimlet you will be up and running much faster than if you would start hunting Helm charts and their values.yaml files one by one.

## Demo

To see Gimlet fully, you should check out the [Building a developer platform on CIVO Cloud with Gimlet and gitops](https://youtube.com/playlist?list=PLjJkiSWPwuPJeIEOn5BWMFdxSSpiQPQ4P) YouTube playlist.

Or, if you want to get your hands dirty, you should download the Gimlet CLI and start configuring your dev platform right now.

#### Install Gimlet
```
$ curl -L https://github.com/gimlet-io/gimlet/releases/download/cli-v0.15.0/gimlet-$(uname)-$(uname -m) -o gimlet
$ chmod +x gimlet
$ sudo mv ./gimlet /usr/local/bin/gimlet
$ gimlet --version
```

#### Configure stack components
```
$ gimlet stack configure
👩‍💻 Configure on http://127.0.0.1:22901
👩‍💻 Close the browser when you are done
Browser opened
Browser closed
📁 Generating values..

---
---
stack:
  repository: https://github.com/gimlet-io/gimlet-stack-reference.git?tag=v0.14.8
config:
  prometheus:
    enabled: true
    persistence: true

📁  Written to stack.yaml
```

#### Generate Kubernetes yaml
```
$ gimlet stack generate

✔️  Generated
```

### You can continue with the following tutorials:

- [Make Kubernetes an application platform with Gimlet Stack](https://gimlet.io/docs/make-kubernetes-an-application-platform-with-gimlet-stack/)
- [Reconfiguring, upgrading and making custom changes to stacks](https://gimlet.io/docs/reconfiguring-upgrading-and-making-custom-changes-to-stacks/)
- [Deploy your app to Kubernetes without the boilerplate](https://gimlet.io/docs/deploy-your-app-to-kubernetes-without-the-boilerplate/)
- [Manage your staging application configuration](https://gimlet.io/docs/manage-your-staging-application-configuration/)
- [Automatically deploy your application to staging](https://gimlet.io/docs/automatically-deploy-your-application-to-staging/)

### Roadmap

The coming 6 months at Gimlet we will be busy with delivering security and feature updates to the stack components.

Also, we would like to strengthen the developer day-2 workflows with alerts, notifications and by enforcing policies.

Larger teams will also get attention, we are going to automate fleet wide updates of application Helm charts, and dashboard templates.

## Stay in the loop

If you think Gimlet can help you in the future, go hit star on [our Github](https://github.com/gimlet-io/gimlet) and follow us on [Twitter](https://twitter.com/gimlet_io).


🙏

