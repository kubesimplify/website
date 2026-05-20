---
title: "Cloud native buildpacks concepts"
seoTitle: "Cloud native buildpacks concepts"
seoDescription: "Cloud native buildpacks is a CNCF incubating project. It is a code to an image and run anywhere."
datePublished: 2022-05-13T12:32:34.511Z
slug: cloud-native-buildpacks-concepts
author: aditya-tripathi
cover: /img/blog/cloud-native-buildpacks-concepts/KqWj1Khpi.jpg
tags: ["github", "build-tool", "devops", "build", "github-actions-1"]
cuid: cl34f6hh60002qbnv1kgxgc96
---
## Overview

Cloud native buildpacks is a CNCF incubating project. It is a code to an image and run anywhere, so you take your code, and you have the build packs, and they will do the heavy lifting, and create the image OCI artifact for you that you can run it on any platform.

So buildpacks were used in 2011 by Heroku, now they are adopted by Cloud foundry, Knative, Gitlab, Google app engine and so on. Cloud native build packs were started in 2018 by Pivotal and Heroku and in 2018 they joined CNCF landscape. 

The buildpacks v1 started by Heroku and then v2 started by both Heroku and Pivotal, and then they combined started project Cloud Native Buildpacks in 2018 with all the feature and production readiness from their previous experiences over the years.

 It now has all the modern container standards such as OCA format. It takes advantage of these latest standards: image layering, rebasing, docker v2 apis and all that stuff. 


![pivotal.png](/img/blog/cloud-native-buildpacks-concepts/rdia7DiTo.png align="left")

## Concepts in Buildpack

-  **Buildpacks** -  So buildpacks provide a framework and the runtime for the application. It's a source to OCI image without dockerfile.


![Source oci.png](/img/blog/cloud-native-buildpacks-concepts/rQ4mXrmQy.png align="left")

So as a developer, you just focus on the code, and you do not need to write a dockerfile to map it to a docker image or to create an image out of it.

so you just have the source and the buildpacks will do their job creating and doing the heavy lifting for converting the source to the OCI compliant image.

so there are two different phases which is called detect and build :
 
**Detect** - When you have the source code, and you need something to detect, like it is a java application, so there should be .java files, if it's a python application then there should be like setup.py, requirements.txt files.

So the detect phase will check whether the buildspace is applicable against the source code. If yes then it moves to the next phase which is called build and if no then it skips.

**Build** -  So after the detection is passed, the build binary is executed. So what it does is set up the build and the runtime environment. Download all the dependencies and compile code if required and set all the entry points and stuff.

 
- **Builder** -  So a builder is basically an image with components to execute the build. You need a builder image, so that your build can be executed. 

![Builder image.png](/img/blog/cloud-native-buildpacks-concepts/FBnczNm3i.png align="left")

Now, the build image itself is having a build image and a run image. So the build image is basically for the base environment for the builder, like an Ubuntu OS or a base OS layer which is there.

Run image is the base environment for the app during the run time. And when you combine these two terminologies like the build image and run image it is called a stack. So basically there is the concept of stacks, that will be used as the build image. Builder is a stack image plus the build packs and the lifecycle( life cycle is nothing but it orchestrates the build pack execution and assembles all the artifacts and creates the fancy final OCI image).

 ![Builder image.png](/img/blog/cloud-native-buildpacks-concepts/zb3xd0M-4.png align="left")

This is from docs you can have multiple buildpacks. So your multiple build packs and stacks will be defined in a file called builder.toml and your stack is having the build image and the run image. Then the builder will create the builder image. 

So build packs is a set of executables, it is composed of buildpack.toml and the executables detect and builds. There is also the concept of meta buildpack which is only having buildpack.toml for the complex detection strategies.

## Platform

It uses the life cycle + the build packs from the builders + the application source code. 

So now you have all the components, the buildpacks, the builder, and you need to perform all these phases. So how you will do that, you'll be doing that via the platform.

The platform as a whole is taking the source code of the builder and executing the lifecycle, so this is what you will be interacting with. 

It will take your source code and builder image, and then you can see the builder image has build image, which is having build image and run image, and it will be converted into OCI image. 

![Platform.png](/img/blog/cloud-native-buildpacks-concepts/icMUpYvnL.png align="left")

Some examples of different  Platforms are :

1. Local CLI --> like pack CLI
1. Plugins --> like buildpack plugin in CI/CD ecosystem tekton, Github action
1. Cloud app platform -->  like Kpack

So you have different platforms on your systems. You can use those platforms to execute all these commands like pack, build which will be there. So that particular platform will be used to execute all the phases.

## Operations

So in the operations you have</br> 
Build operation- which is building the OCI runnable image from source code.</br>
Rebase - updating app image without rebuild.

So let's say you have an app image in which you have, run image, app image and the build packs, and now you do rebase. So let's say you have pack cli, and you execute the command `pack release demo:tag` as given below.

![Operation.png](/img/blog/cloud-native-buildpacks-concepts/XP6Ad0GVy.png align="left")

As soon as you do that, it will take the new run image from the registry and replace it with its counter layer. so that is how without rebuilding the entire image, it is just rebasing with the new image. So it reduces the build efforts it also reduces the overhead and complexity, so this is a very powerful feature of cloud native buildpacks.

## Why Buildpacks?

 So that developer only focuses on the development and not on the image building. So build packs make it better with best practices minimizing the attack surface, caching Mechanism, and rebasing mechanism. 

It is like software builds of materials(SBOM). Cloud buildpacks give few layer-by-layer information view of what is actually inside the container in cycloneDX, SPDX and Syft JSON 
format.</br>
It follows a modular approach like multiple build packs can be used to create an image. 

Rebasing | Reproducible  reproduces the same app Image digest by running rebuild. If nothing is getting changed, and you keep on running pack build, so you will be having the same image digest. so that is where you can see the rebasing happening. 

## Conclusion

Overall, buildpacks help you to create your OCI image from source code without writing a dockerfile. Some of its concepts like phases will be the detection phase and then the building phase and in the building phase, you will be having a builder. 

Builder is consisting of buildpack and stacks, and then you have a platform which is integrating and tying it all together so that you can use it. For Demo, you can check out [Saiyam Pathak video](https://www.youtube.com/watch?v=nG7N6SLNO4Q&t=294s) on it.





