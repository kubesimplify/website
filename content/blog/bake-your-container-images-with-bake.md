---
title: "Bake your Container Images with Bake 📦👨‍🍳"
datePublished: 2022-09-05T14:31:12.963Z
slug: bake-your-container-images-with-bake
author: batuhan-apaydin
cover: /img/blog/bake-your-container-images-with-bake/fw1smfY3M.jpeg
tags: ["docker", "containers", "buildx", "docker-buildx", "bake"]
cuid: cl7ov211h00zsuknvho2d8aqs
---
### Why Bake?
As the title implies, there are various ways of defining the docker build process in a declarative manner, such as Docker's Dockerfile, Buildah's Containerfile, BuildKit's frontend concept, and from now on, Buildx's bake file. They all seem to do the same thing, but many opportunities are available to discover for each one of them. I'm not sure about saying that the bake file is a new definition format to define the build process for several reasons. In this guide, let's discover what these are together and decide whether the bake file is yet another Docker build definition format.

Before getting started to explain what the bake file is, it's worth saying to understand better what we are going to talk about in this guide, and you need to have a little knowledge about what BuildKit and Buildx are. Fortunately, I've written a [blog](https://kubesimplify.com/the-secret-gems-behind-building-container-images-enter-buildkit-and-docker-buildx) post explaining these terms in detail, so I suggest reading it first and then coming back later to this and exploring other capabilities of them.

As the Docker [documentation says](https://docs.docker.com/build/bake/), bake is a high-level build command. So let's start by explaining what it means. Suppose you've read the blog post I mentioned below or are already working with Buildx. In that case, you may notice that there are many features we can use to simplify things like caching, performance, and storage management in the first place, but there is one more downside to this. Also, not sure whether it counts as a downside, ***but at least for me***, it is. To use all the great features supported in Buildx makes the build command like the following:

```shell
docker buildx build \
--push \
--cache-from "type=registry,ref=foo/myapp" \
--cache-to "type=inline" \
--platform "linux/amd64,linux/arm/v6,linux/arm/v7,linux/arm64" \
--label "org.opencontainers.image.title=myapp" \
--label "org.opencontainers.image.source=https://github.com/foo/myapp" \
--label "org.opencontainers.image.version=1.0.0" \
--label "org.opencontainers.image.licenses=Apache-2.0" \
--tag "foo/myapp:v1.0.0" \
--tag "foo/myapp:latest" \
--file "./main.Dockerfile" \
.
```

I know we are sharing the same feelings, it is a relatively long and verbose command🫣

This is where the bake comes to the rescue and makes this command a lot simpler for us to use and improves the reusability between targets by providing inheritance, don’t worry, we’ll be explaining all the new terms in the later stages, such as targets, inheritance, etc.

> Please note that the bake command is still in the early stages, so it is considered an experimental command.

The new command will become this when we adapt to use the bake command to achieve the same thing that the command above tries:

```shell
docker buildx bake
```

That’s it, all you need to do is to write a `docker-bake.hcl` file to define your build process, and the bake command will take care of the rest. By default, buildx bake looks for build definition files in the current directory in the following order, and the following are parsed:

- `docker-compose.yml`
- `docker-compose.yaml`
- `docker-bake.json`
- `docker-bake.override.json`
- `docker-bake.hcl`
- `docker-bake.override.hcl`

As you can see from the file list above, the bake command supports building images from HCL, JSON, and Compose files, but the recommended one is to use HCL files since its experience is more aligned with buildx UX and also allows better code reuse, different target groups, and extended features. If multiple files are specified, they are all read, and configurations are combined. Also, there are several ways to identify the location of these build definition files.

For example, you can use the -f, --file flag, even with the name of the targets, to build only specific target(s). You can also use a remote `git` bake definition by giving a valid Git URL next to the bake command. And also `--print` option exists in the bake command for debugging purposes. It allows you to print the whole or the target’s build definition and helps you see what will happen when you start the build process.

Based on the principle that the best way to learn something is to get your hands dirty by playing with it, we’ll be focusing on a Go project in that we can experience bake features on it.

> You can reach out to the example project on [GitHub](https://github.com/developer-guy/hello-world-buildx).

Let's copy the project and let our bake command adventure begin. First, you might notice that there is a Dockerfile in this project. By the way, it is worth mentioning that we still need a well-designed, cache-efficient Dockerfile to use the bake command, and this is why we are not accepting a bake command as yet another build definition format because you continue to use Dockerfile to express your build process in a declarative fashion. Next, there is one more file you are unfamiliar with in the traditional containerization process named `docker-bake.hcl`. But, as we speak, this is one of the default files for which the bake command will search.

In the first place, when you start browsing the docker-bake.hcl file, it seems too much for you, but again don't worry, we'll be explaining all the details within that file one by one. But, it's safe to say that the minimum viable elements of the docker-bake.hcl file is the target. So, the following content for the file is enough to make a container image with the bake command:

```HCL
target "default" {}
```

When you invoke the bake command, specify the targets/groups you want to build. For example, the group/target named default will be built if no arguments are specified. A target reflects a single docker build invocation with the same options you would specify for docker build. On the other hand, a group is a grouping of targets. You will likely use targets and groups a lot in your file because, don’t forget, bake supports inheritance, and the best way of utilizing this inheritance is to ensure that these targets or groups are dedicated to doing one job at a time, like the Docker philosophy, do one thing and do it well.

> Design of bake command is a work in progress, the user experience may change based on feedback.

What we aim to do here is that you remember the long command above, which uses nifty features supported in Buildx. Here, we codify them into a bake file to reduce the verbosity by keeping the same functionality. This is why you use many fields in targets defined within that file. You can access the complete list of valid target fields within the target block [here](https://docs.docker.com/build/bake/file-definition/).


As you can see from the starting point of the bake file, Bake supports defining variables through the variable block. Setting the values of these variables is very flexible, though. You can either set them with environment variables or override target configurations through the --set flag [from the command line](https://github.com/docker/buildx/blob/master/docs/guides/bake/configuring-build.md#from-command-line) at the build time.

```shell
TAG=latest docker buildx bake

TAG=latest docker buildx bake --set image.args.GO_VERSION=1.18
```

You can reach out to the [documentation](https://github.com/docker/buildx/blob/master/docs/guides/bake/configuring-build.md) to learn all the possible ways of using variables and arguments.

Within that docker-bake.hcl file, you will see one group named default which you can specify which target(s) will be built when you type the plain bake command with three targets. 

The first one is _common target, for common things like using the same configurations for all the other targets, and as you can see, it inherits from the tag target that allows you to specify any tag for a given image output by using a variable named TAG by using a special field named inherits.

```HCL
target "tag" {
  tags = ["devopps/hello-world-buildx:${TAG}"]
}

target "_common" {
  inherits = ["tag"]
  args = {
    GO_VERSION = GO_VERSION
    BUILDKIT_CONTEXT_KEEP_GIT_DIR = 1
  }
}
```

> There are also useful built-in build args like:

> ﹥ BUILDKIT_CONTEXT_KEEP_GIT_DIR=`bool` trigger git context to keep the .git directory

> ﹥ BUILDKIT_INLINE_BUILDINFO_ATTRS=`bool` inline build info attributes in image config or not

> ﹥ BUILDKIT_INLINE_CACHE=`bool` inline cache metadata to image config or not

> ﹥ BUILDKIT_MULTI_PLATFORM=`bool` opt into deterministic output regardless of multi-platform output or not

> https://docs.docker.com/engine/reference/builder/#buildkit-built-in-build-args

The next one is an image target, and this is where we define all the core logic for building the container image. Let’s explain what we mean by referring to the core logic for the build process.

For example, inherits field to determine which targets will be inherited as we mentioned before, as you can see, we inherited a `_common` target for this target.

```HCL
target "image" {
 inherits = ["_common", "tag"]
 ..
}
```

Another important one is the context field, for which you can specify the build context, like the dockerfile field, for which you can identify where the Dockerfile is.

```HCL
target "image" {
 context = "."
 dockerfile = "Dockerfile"
 ..
}
```

> If you want to access the main context for the bake command from a bake file imported remotely, you can use the BAKE_CMD_CONTEXTbuiltin var.

> https://docs.docker.com/build/bake/file-definition/#remote-definition

One of the great features of Buildx is that it allows you to define where the cache output will be stored or pulled, which gives you a golden key for efficiency for incremental builds, and this is where cache-from and cache-to fields come into the picture. 

```HCL
target "image" {
 cache-from = ["type=registry,ref=devopps/hello-world-buildx:latest"]
 cache-to = ["type=inline"]
 ...
}
```

Different types of cache outputs exist in Buildx for each cache-from and cache-to flags. The inline type in [cache-to](https://docs.docker.com/engine/reference/commandline/buildx_build/#cache-to) flag writes the cache metadata into the image configuration. The registry source in the [cache-from](https://docs.docker.com/engine/reference/commandline/buildx_build/#cache-from) flag can import cache from a cache manifest or (special) image configuration on the registry.

Next, we use the labels field to specify metadata information about the image.

```HCL
target "image" {
 labels = {
   "org.opencontainers.image.title"= "hello-world-buildx"
   "org.opencontainers.image.ref" = "https://github.com/foo/myapp"
 }
 ...
}
```

Last but not least, we specify where we want to export an image by using the output field.

```HCL
target "image" {
 output = ["type=registry"]
 ...
}
```

As in the cache flags, Buildx has different output types, more technically exporters, that you can use to meet your needs. Here, we use the registry type of exporter, which is a shortcut for type=image,push=true. You can reach out to the complete list of supported exporters [here](https://docs.docker.com/engine/reference/commandline/buildx_build/#output).

Let’s move on with the last target, named image-all. One of the areas that Buildx shines is the multi-arch support. It hides all the details we need to make container images suitable with multi-arch and provides many features to make that process much more efficient and performant. Again, we use the platforms field to enable this multi-arch support in targets.

```HCL
target "image-all" {
 inherits = ["image"]
 platforms = ["linux/amd64", "linux/arm64", "linux/arm/v6", "linux/arm/v7"]
 ...
}
```

As you can see from the configuration above, we specify a list of operating systems and architectures that we wanna support in the form of “os/arch” and separated with a comma.

### Bake in the wild

One of the many areas that you can use bake is GitHub Actions. For anyone unfamiliar with GitHub Actions, GitHub Actions is a CI/CD platform that gives you great power to automate, customize, and execute your software development workflows in your repository.

Today, we’ll create a GitHub action workflow to make a container image from our project and publish it to the GitHub Container Registry.

Fortunately, Docker provides many ready-to-use GitHub Actions, as you can see from the following picture:

![Screen Shot 2022-07-13 at 12.55.49 PM.png](/img/blog/bake-your-container-images-with-bake/f_VZCJoFE.png align="center")
> https://docs.google.com/presentation/d/1-1GgaLatYRMlIOKyi7duPIT2mRA4NLNKS5jQpU7V46g

First, we must create a folder structure to enable GitHub Actions, a `.github/workflows.`

Next, let’s define our workflow, to do that, we will create a YAML file that will define our release process named `release.yml.`

```YAML
name: Release
on:
  push:
    tags:
      - 'v*'

env:
  GHCR_SLUG: ghcr.io/${{ github.repository }}

jobs:
  release:
    runs-on: ubuntu-20.04
    name: Release
    steps:
      -
        name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      -
        name: Docker meta
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: |
            ${{ env.GHCR_SLUG }}
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=ref,event=pr
            type=edge
          labels: |
            org.opencontainers.image.title=hello-world-buildx
            org.opencontainers.image.vendor=${{ github.repository_owner }}
      -
        name: Set up QEMU
        uses: docker/setup-qemu-action@v2
      -
        name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      -
        name: Login to GHCR
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.repository_owner }}
          password: ${{ secrets.GITHUB_TOKEN }}
      -
        name: Build image
        uses: docker/bake-action@v2
        env:
          GITHUB_REPOSITORY_OWNER: ${{ github.repository_owner }}
        with:
          files: |
            ./docker-bake.hcl
            ${{ steps.meta.outputs.bake-file }}
          targets: image-all
          pull: true
          push: ${{ github.event_name != 'pull_request' }}
```

Let’s move on by explaining each line in the file above.

The first thing you have to do when you create your workflow is to define when it will be triggered, in here, we said let’s trigger our workflow, then someone pushes tags that are prefixed with `v.`

```YAML
on:
  push:
    tags:
      - 'v*'
```

Next, we defined a global-scoped environment variable at the top of the file, and you can also define environment variables per job within your workflow.


```YAML
env:
  GHCR_SLUG: ghcr.io/${{ github.repository }}
```

We used a special variable named `GitHub` provided by the GitHub Actions. `GitHub` is one of the contexts provided by the GitHub Actions. Contexts allow you to access context information in workflows and actions. You can reach out to the complete list of contexts [here](https://docs.github.com/en/actions/learn-github-actions/contexts). We'll use this `GHCR_SLUG` environment variable to specify the name of the container image.

Let’s move on with the `jobs` section, where we define all the jobs that are part of that workflow.

Here, we have one job named `release,` and within that release job, we have six steps.

At the first step, ' Checkout,` we are cloning the project to the current working directory.

```YAML
- name: Checkout
  uses: actions/checkout@v3
  with:
    fetch-depth: 0
```

Next, as we mentioned, we’ll create an image suitable for multiple CPU architectures. To do that, we need some kind of emulator that can mimic the targeted CPU architecture, and this is where the QEMU comes into play, we are using the `setup-qemu-action` GitHub action to set up the QEMU emulator. I’m not going into the details of this, but if you want to learn more about it, I highly recommend you take a look at the blog post I mentioned above.

```YAML
- name: Set up QEMU
  uses: docker/setup-qemu-action@v2
```

Of course, to be able to use the bake command, we must install the Buildx binary into our environment. To do that, we are using the `setup-buildx-action` GitHub action. 

```YAML
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v2
```

Once we build our container image, the next step would be publishing it into the GitHub Container Registry (GCR). You can store and manage Docker and OCI images in the GCR, which uses the package namespace `https://ghcr.io.` We must log in to publish our container images into the GCR first.

```YAML
- name: Login to GHCR
  if: github.event_name != 'pull_request'
  uses: docker/login-action@v2
  with:
    registry: ghcr.io
    username: ${{ github.repository_owner }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

Here, you see another GitHub Action context named `secrets.` The secrets context contains the names and values of secrets that are available to a workflow run. At the start of each workflow run, GitHub automatically creates a unique `GITHUB_TOKEN` secret to using in your workflow. You can use the `GITHUB_TOKEN` to authenticate in a workflow run, see “[About the GITHUB_TOKEN secret](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#about-the-github_token-secret).” 

Next, skip the `Docker Meta` step for now, and we will talk about it later.

Now, we have reached one of the favorite GitHub actions, `bake-action.` It is a GitHub Action to use Docker Buildx Bake as a high-level build command. You can reach out to the official project [here](https://github.com/docker/bake-action).

```YAML
- name: Build image
  uses: docker/bake-action@v2
  env:
    GITHUB_REPOSITORY_OWNER: ${{ github.repository_owner }}
  with:
    files: |
      ./docker-bake.hcl
      ${{ steps.meta.outputs.bake-file }}
    targets: image-all
    pull: true
    push: ${{ github.event_name != 'pull_request' }}
```

Here, we use an environment variable named GITHUB_REPOSITORY_OWNER within the docker-bake.hcl file, you can use environment variables in the form of “${ }” in your bake file, and we use GitHub action to fill its value.

As we mentioned, you can use more than one file, here, we defined two files via the files option of the bake-action, which will be merged when the command executes. I know you might be curious about the second file, but hold on for a second, and we’ll talk about it soon. We also mentioned that you could specify a target you want to run, here, we set it via the targets option of the bake-action and said that we want to run the image-all target only. You can use the pull option always to attempt to pull a newer version of the image. Also, we specified the push option with a condition which means that do not push container image any of the pull requests, push option is a shorthand for `--set=*.output=type=registry`and the default value of it is false.

Now, we can talk about the second file we refer to through a `${{ steps.meta.outputs.bake-file }}`, created automatically via `docker/metadata-action.`


```YAML
- name: Docker meta
  id: meta
  uses: docker/metadata-action@v4
  with:
    images: |
      ${{ env.GHCR_SLUG }}
    tags: |
      type=semver,pattern={{version}}
      type=semver,pattern={{major}}.{{minor}}
      type=ref,event=pr
      type=edge
    labels: |
      org.opencontainers.image.title=hello-world-buildx
      org.opencontainers.image.vendor=${{ github.repository_owner }}
```

This action handles a bake definition file that can be used with the
Docker Bake action. You just have to declare an empty target named
`docker-metadata-action` and inherit from it, as we did in the “image” target. You can reach out to the official project [here](https://github.com/docker/metadata-action#bake-definition). The content of the file (${{ steps.meta.outputs.bake-file }}) generated via the metadata-action would be like the following:

```YAML
{
  "target": {
    "docker-metadata-action": {
      "labels": {
          "org.opencontainers.image.created": "2022-07-13T09:49:36.781Z",
          "org.opencontainers.image.description": "An experimental project that demonstrates of using Docker Buildx features",
          "org.opencontainers.image.licenses": "",
          "org.opencontainers.image.ref": "https://github.com/foo/myapp",
          "org.opencontainers.image.revision": "661c923da91e6231c169b0193e01e29fc800bb24",
          "org.opencontainers.image.source": "https://github.com/developer-guy/hello-world-buildx",
          "org.opencontainers.image.title": "hello-world-buildx",
          "org.opencontainers.image.url": "https://github.com/developer-guy/hello-world-buildx",
          "org.opencontainers.image.vendor": "developer-guy",
          "org.opencontainers.image.version": "0.1.0"
        },
      "tags": [
          "ghcr.io/developer-guy/hello-world-buildx:0.1.0",
          "ghcr.io/developer-guy/hello-world-buildx:0.1",
          "ghcr.io/developer-guy/hello-world-buildx:latest"
        ],
      "args": {
         "DOCKER_META_IMAGES": "ghcr.io/developer-guy/hello-world-buildx",
         "DOCKER_META_VERSION": "0.1.0",
      }
    }
  }
}
```

As we inherit the docker-metadata-action target, those tags, labels, and args will be available for all the other targets in a reusable fashion. 

```HCL
// docker-bake.hcl
target "docker-metadata-action" {}

target "image" {
 inherits = ["_common", "docker-metadata-action"]
..
}
```

Congratulations, you have completed your setup, and you should end up having a workflow something like the following:


![Screen Shot 2022-09-06 at 8.47.02 AM.png](/img/blog/bake-your-container-images-with-bake/4NLGws1V9.png align="center")

> https://github.com/developer-guy/hello-world-buildx/runs/7318470857?check_suite_focus=true

### Conclusion

Even if the bake command is still considered an experimental feature, its experience is impressive. It includes many opportunities to improve the command because it needs feedback from the end-user community. Also, it's pretty CI/CD friendly in advance, thanks to Docker for the bake-action. So, don't forget to give yourself a chance to try to bake command of the Buildx, and don't let yourself be left behind in this adventure.

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.