---
title: "Getting started with ko: A fast container image builder for your Go applications"
datePublished: 2022-05-20T11:35:25.503Z
slug: getting-started-with-ko-a-fast-container-image-builder-for-your-go-applications
author: batuhan-apaydin
cover: /img/blog/getting-started-with-ko-a-fast-container-image-builder-for-your-go-applications/3By8NorJ9.jpeg
tags: ["docker", "go", "kubernetes", "k8s", "docker-images"]
cuid: cl3ed7ych010mr1nve2cwgf2c
---
With the rise of containerization, it becomes essential to deploy applications as containers and manages them through orchestration systems at scale. If you are already familiar with containerization, I assume you are because the basic containerization knowledge is required for this article. The first step you should do is create container images for your applications. 

Since containerization has become more and more popular with the help of Docker, I’m assuming you must have run the “**docker build**” at least once. To be honest, Docker is not the only way of creating container images, and there are many tools out there to achieve the same thing, such as [Kaniko](https://github.com/GoogleContainerTools/kaniko), [apko](https://github.com/chainguard-dev/apko), [img](https://github.com/genuinetools/img), [BuildKit](https://github.com/moby/buildkit), [Buildx](https://github.com/docker/buildx), [Podman](https://github.com/containers/podman), [Buildah](https://github.com/containers/buildah), [ko](https://github.com/google/ko), [Jib](https://github.com/GoogleContainerTools/jib), [Buildpacks](https://github.com/buildpacks/pack) and many more. In this article, we do not compare their strengths or weaknesses to each other, and we’ll be focusing on the ko project and will talk about its features from oldest to newest. I’m also super excited to talk about ko’s latest improvements in the supply chain security area. 

First, let’s explain which audience this article is targeting. Since the ko project is specific to Golang, this article is for Golang developers mostly. Still, I suppose you are curious about **automatic SBOM generation**, **a reproducible image builds**, and **multi-platform images**. So there is still a chance you can find something helpful in this article.

Ko is a **simple**, **fast** container image builder for Go applications. Ko simplifies building container images also it **securely** does that by providing features such as **not requiring any running daemon process**, **without the need for Dockerfile**, **providing build information for reproducibility**, and **creating/pushing SBOM (Software Bill of Materials) automatically**, don’t worry if you are not familiar none of these, today,  we’ll be explaining all of them in general, and also deploying Go applications on Kubernetes environments easily and quickly. So, in my opinion, everyone should be familiar with this project, especially if you are a Golang developer. 

I believe once you discover the abilities of the ko project with this article, it’ll become one of your daily tools because ko **frees up you from creating Dockerfiles** and knowing containerization details by giving you the freedom to focus your code without worrying about how to make a container image from it while giving you **performance** and **great UX.**

To summarize ko’s features in general, ko is spun off of the [go-containerregistry](https://github.com/google/go-containerregistry) library, which helps you interact with container registries and images. For a good reason, most of ko’s functionality is implemented using this Go module. Most notably, this is what ko does: - [Ship your Go applications faster to Cloud Run with ko](https://cloud.google.com/blog/topics/developers-practitioners/ship-your-go-applications-faster-cloud-run-ko)

- Download a base image from a container registry
- Statically compile your Go binary
- Create a new container image layer with the Go binary
- Append that layer to the base image to create a new image
- Push the new image to the remote container registry

Let’s start discovering these great opportunities mentioned above by installing ko binary without much ado. If you are in a macOS environment, the easiest way of installing ko is through the brew, a package manager for macOS.

```shell
$ brew install ko
```

or you can install it through a go install command

```shell
$ go install github.com/google/ko@latest
```

In addition to these methods, if you are on the GitHub Actions platform and want to install ko, thanks to [@imjasonh](https://twitter.com/imjasonh), fortunately, there is a setup-ko action available that allows you to install ko binary easily in your workflows, add these lines below to your workflow file to install ko into your environment:

```YAML
jobs: 
 publish: 
   name: Publish 
   runs-on: ubuntu-latest 
   steps: 
     - uses: actions/setup-go@v2 
       with: 
         go-version: 1.15 
     - uses: actions/checkout@v2 
     - uses: imjasonh/setup-ko@v0.4 
     - run: ko version
```

To start working with ko, I’ve already created a sample repository available on GitHub, and you can clone this project and start using ko on this project.

```shell
$ git clone https://github.com/developer-guy/hello-world-ko.git
```

The most important thing we should discuss before creating a container image with ko is the “**import path**,” which lies in ko's heart. ​​One such Go idiom is that binaries are referenced by “[import paths](https://golang.org/doc/code.html#ImportPaths)”; ko is also using the same pattern for referencing Go applications, so once you initialize your Go module via go mod init, the name you put after the command will be your import path and will be using by ko while giving a tag to your container image:

```shell
$ go mod init <import path> # github.com/developer-guy/hello-world-ko
```

In the most basic form, to build and push container images, all you need to do is run these two lines of command below:

```shell
$ export KO_DOCKER_REPO=gcr.io/YOUR_PROJECT/my-app 
$ ko build <import_path>
```

and that's it 🤘

Let’s build and push our first container image for the sample repository we cloned.

```shell
$ cd hello-world-ko

$ export KO_DOCKER_REPO=devopps # it will use DockerHub (docker.io) as a registry by default. 
However, if you want to publish it to another registry, you can specify it as gcr.io/devopps for Google Container Registry. 
By the way, devopps is my DockerHub username, don’t forget to set yours!

$ ko build github.com/developer-guy/hello-world-ko
2022/05/17 20:47:23 Using base gcr.io/distroless/static:nonroot@sha256:2556293984c5738fc75208cce52cf0a4762c709cf38e4bf8def65a61992da0ad for github.com/developer-guy/hello-world-ko
2022/05/17 20:47:24 Building github.com/developer-guy/hello-world-ko for linux/amd64
2022/05/17 20:47:49 Publishing index.docker.io/devopps/hello-world-ko-82db161e90a446983324a549d87a7dad:latest
2022/05/17 20:47:52 pushed blob: sha256:135ce68eadadd1473e0f5442fcf80f3308da789dd011549811c46122a3df26c2
2022/05/17 20:47:52 pushed blob: sha256:f4579510596da4c61433d328130bbdc920885626bb7bf130a525056bd7ce49dd
2022/05/17 20:47:52 index.docker.io/devopps/hello-world-ko-82db161e90a446983324a549d87a7dad:sha256-991b864323bdbdeca7ff349a37409f088cf7de718a17c6a677d20c978b648a39.sbom: digest: sha256:330c1b141d2a007145e4ae1701aa766f0b21fd3e6ce3fc65bc6b631fc7470c76 size: 367
2022/05/17 20:47:52 Published SBOM index.docker.io/devopps/hello-world-ko-82db161e90a446983324a549d87a7dad:sha256-991b864323bdbdeca7ff349a37409f088cf7de718a17c6a677d20c978b648a39.sbom
2022/05/17 20:47:54 pushed blob: sha256:250c06f7c38e52dc77e5c7586c3e40280dc7ff9bb9007c396e06d96736cf8542
2022/05/17 20:47:54 pushed blob: sha256:6d495c0263b798b4a4197f07c297cb8a0c2de4b371ced69d2801c1565c5e00d6
2022/05/17 20:47:58 pushed blob: sha256:ea76d64477d62cd7ef8cb9a737c115dbc48aea091d37f5845c7db145caf970d9
2022/05/17 20:48:00 pushed blob: sha256:36698cfa5275e0bda70b0f864b7b174e0758ca122d8c6a54fb329d70082c73f8
2022/05/17 20:48:00 index.docker.io/devopps/hello-world-ko-82db161e90a446983324a549d87a7dad:latest: digest: sha256:991b864323bdbdeca7ff349a37409f088cf7de718a17c6a677d20c978b648a39 size: 751
2022/05/17 20:48:00 Published index.docker.io/devopps/hello-world-ko-82db161e90a446983324a549d87a7dad@sha256:991b864323bdbdeca7ff349a37409f088cf7de718a17c6a677d20c978b648a39
index.docker.io/devopps/hello-world-ko-82db161e90a446983324a549d87a7dad@sha256:991b864323bdbdeca7ff349a37409f088cf7de718a17c6a677d20c978b648a39
```

Let’s continue with analyzing the output above because there are things that we can learn from it.

Foremost, you might notice that ko uses a secure and lean base image from the [Distroless](https://github.com/GoogleContainerTools/distroless) collection of images (the gcr.io/distroless/static:nonroot  image), which doesn’t contain a shell or other executables to [reduce the attack surface](https://cloud.google.com/solutions/best-practices-for-building-containers) of the container, as we mentioned earlier, ko cares about security. You can use another environment variable named “**KO_DOCKER_REPO**” to override this behavior. -[Overriding Base Images](https://github.com/google/ko#overriding-base-images)

Next, ko pushes container images to the registry we defined in the “**KO_DOCKER_REPO**” environment variable by default, and if you want to disable it, you should use “**--push=false**” for this. ko can also load images to a local Docker daemon, if available, by setting “**KO_DOCKER_REPO=ko.local**” or by passing the “**--local (-L)**” flag.

> ko depends on the authentication configured in your Docker config (typically ~/.docker/config.json). If you can push an image with docker push, you are already authenticated for ko. - [Authentication](https://github.com/google/ko#authenticate)

Next, to secure your software supply chain, inevitably, it should start with knowing what software is being used. So, you have to produce a list of what your software is made of such as libraries, dependencies, packages, etc., let’ call’em, software ingredients shortly. This list of “ingredients” is known as a software bill of materials (SBOM). More technically, “**A Software Bill of Materials (SBOM)**” is a complete, formally structured list of components, libraries, and modules that are required to build (i.e. compile and link) a given piece of software and the supply chain.

> If you want to go further here, you should consider checking the [awesome-sbom](https://github.com/awesomeSBOM/awesome-sbom) repository for related tools, frameworks, blogs, podcasts, and articles! Maintaining by [Batuhan Apaydın](https://twitter.com/developerguyba) (a.k.a developer-guy)

The most exciting feature that ko provides is that ko generates an SBOM and publishes it to the registry alongside the image, as you can see from the output, there is a line “**Published SBOM..**”, which means that ko enables this feature by default, to disable this feature, you should specify “**--sbom**” as false. If you want to view the SBOM file, you might use another tool called [crane](https://github.com/google/go-containerregistry/blob/master/cmd/crane) for interacting with remote images and registries. Or another approach, If you're going to see the SBOM of a pushed image, you can already do that with **cosign download sbom** ... or **ko deps <image>(which generates it on the fly and doesn't push any new SBOMs)**, [see](https://github.com/google/ko/issues/707#issuecomment-1129180728). If you want to learn more about the automatic SBOM generation feature in ko, you can read a great [article](https://blog.chainguard.dev/auto-sboms-with-ko) by [Matt Moore](https://twitter.com/mattomata) on [Chainguard blog](https://blog.chainguard.dev).

> cosign is a tool for Container Signing, Verification, and Storage in an OCI registry. To install it, please refer. to the [installation](https://docs.sigstore.dev/cosign/installation/) page.

```shell
$ crane ls index.docker.io/devopps/hello-world-ko-82db161e90a446983324a549d87a7dad
latest
sha256-991b864323bdbdeca7ff349a37409f088cf7de718a17c6a677d20c978b648a39.sbom

$ crane manifest index.docker.io/devopps/hello-world-ko-82db161e90a446983324a549d87a7dad:sha256-991b864323bdbdeca7ff349a37409f088cf7de718a17c6a677d20c978b648a39.sbom | jq
{
  "schemaVersion": 2,
  "mediaType": "application/vnd.oci.image.manifest.v1+json",
  "config": {
    "mediaType": "application/vnd.oci.image.config.v1+json",
    "size": 233,
    "digest": "sha256:135ce68eadadd1473e0f5442fcf80f3308da789dd011549811c46122a3df26c2"
  },
  "layers": [
    {
      "mediaType": "text/spdx",
      "size": 953,
      "digest": "sha256:f4579510596da4c61433d328130bbdc920885626bb7bf130a525056bd7ce49dd"
    }
  ]
}

$ crane blob index.docker.io/devopps/hello-world-ko-82db161e90a446983324a549d87a7dad@sha256:f4579510596da4c61433d328130bbdc920885626bb7bf130a525056bd7ce49dd
SPDXVersion: SPDX-2.2
DataLicense: CC0-1.0
SPDXID: SPDXRef-DOCUMENT
DocumentName: github.com/developer-guy/hello-world-ko
DocumentNamespace: http://spdx.org/spdxpackages/github.com/developer-guy/hello-world-ko
Creator: Tool: ko v0.11.2
Created: 1970-01-01T00:00:00Z

##### Package representing github.com/developer-guy/hello-world-ko

PackageName: github.com/developer-guy/hello-world-ko
SPDXID: SPDXRef-Package-github.com.developer-guy.hello-world-ko
PackageSupplier: Organization: github.com/developer-guy/hello-world-ko
PackageDownloadLocation: https://github.com/developer-guy/hello-world-ko
FilesAnalyzed: false
PackageHomePage: https://github.com/developer-guy/hello-world-ko
PackageLicenseConcluded: NOASSERTION
PackageLicenseDeclared: NOASSERTION
PackageCopyrightText: NOASSERTION
PackageLicenseComments: NOASSERTION
PackageComment: NOASSERTION

Relationship: SPDXRef-DOCUMENT DESCRIBES SPDXRef-Package-github.com.developer-guy.hello-world-ko
```

Last but not least, the final image (index.docker.io/devopps/hello-world-ko-82db161e90a446983324a549d87a7dad:latest) might look a bit strange because it provides a few different strategies for naming the image it pushes, but if you don’t specify anything for this, ko adds md5 portion to the image name, to overcome this issue for better image name, we can use “**-B (--base-import-paths)**” to omit md5 portion. - [Naming images](https://github.com/google/ko#naming-images)

So far, we’ve talked ko at the most basic level. Next, let’s discover other great features available in ko. 

Ko also shines in building multi-platform container images. To build a multi-platform container image with ko, the only thing that you need to do is just add a flag called “**--platform**” with the OS and architecture you target, like **linux/amd64**, because **Go supports cross-compilation to other CPU architectures and operating systems natively.**

```shell
$ ko build -B --platform linux/amd64,linux/arm64 --tags multiarch github.com/developer-guy/hello-world-ko 2022/05/17 21:56:51 Using base gcr.io/distroless/static:nonroot@sha256:2556293984c5738fc75208cce52cf0a4762c709cf38e4bf8def65a61992da0ad for github.com/developer-guy/hello-world-ko 2022/05/17 21:56:52 Building github.com/developer-guy/hello-world-ko for linux/amd64 2022/05/17 21:56:52 Building github.com/developer-guy/hello-world-ko for linux/arm64
…

$ crane manifest index.docker.io/devopps/hello-world-ko:multiarch | jq
{
  "schemaVersion": 2,
  "mediaType": "application/vnd.docker.distribution.manifest.list.v2+json",
  "manifests": [
    {
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "size": 751,
      "digest": "sha256:991b864323bdbdeca7ff349a37409f088cf7de718a17c6a677d20c978b648a39",
      "platform": {
        "architecture": "amd64",
        "os": "linux"
      }
    },
    {
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "size": 751,
      "digest": "sha256:91523e52f520098faf21eef68db6a63caba9c1ba00bcd16e554fe4972ac0acec",
      "platform": {
        "architecture": "arm64",
        "os": "linux"
      }
    }
  ]
}
```

One of the most recent features supported in ko is that ko allows you to override Go build settings in its configuration file, by the way, ko also provides a method of configuring ko’s behavior via a configuration file called “**.ko.yaml**” or a file you specify in “**KO_CONFIG_PATH**” environment variable. By default, ko builds the binary with no additional build flags other than “**-trimpath**” . You can replace the default build arguments by providing build flags, and ldflags using a GoReleaser influenced builds configuration section in your .ko.yaml. - [Overriding Go build settings](https://github.com/google/ko#overriding-go-build-settings)

Now we come to my favorite part, setting base image annotations to the image manifest by default for reproducibility. A great effort from Jason Hall (@imjasonh), he created a PR to add a piece of information about which base image was being used while building an image to the [Open Container Initiative](https://opencontainers.org)'s [image-spec](https://github.com/opencontainers/image-spec), to get more detail about the PR, please [see](https://github.com/opencontainers/image-spec/pull/822/). It is an important milestone for people who might want to take action against these base images because most of the vulnerabilities come from these images,  the problem here is that once your image is built, information about the base image is completely lost, with this important change, now, we can be able to capture the base information through these annotations below:

- org.opencontainers.image.base.name: the mutable reference to the base image (e.g., docker.io/alpine:3.14)

- org.opencontainers.image.base.digest: the immutable digest of the base image when the image was built on it (e.g., sha256:adab384...)

> To learn more about the journey, you can read Jason Hall's article from [here](https://github.com/imjasonh/ImJasonH/tree/main/articles/oci-base-image-annotations).

ko sets these annotations if your base image is a docker image instead of an OCI image, and if it's a single platform image, it doesn't support annotations, and some registries will reject it. So you can --platform=all and should get the annotations back.

In addition to all of these great benefits gained by ko, ko also includes support for simple YAML templating, which makes it a powerful tool for Kubernetes applications which means that you can replace your image references in “**.spec.template.spec.containers.image**” with prefixed with “**ko://**” like the following:

```YAML
    ...
    spec:
      containers:
      - name: my-app
        image: ko://github.com/my-user/my-repo/cmd/app
```

Now, the only thing that you need to do the for building, pushing the container image to the registry, and then deploying the application on Kubernetes is run “**ko apply -f .**” that's it 😎

## Conclusion

Thanks to ko, you don't need to install Docker to your environment anymore and write any Dockerfile, and you are still able to build and push container images to your favorite registries. In summary, ko is one of the great tools available out there that is waiting to be discovered by you🧭 



