---
title: "Automated GitHub Releases with GitHub Actions and Conventional Commits"
datePublished: 2024-02-12T12:30:45.511Z
slug: automated-github-releases-with-github-actions-and-conventional-commits
author: krish-gupta
cover: /img/blog/automated-github-releases-with-github-actions-and-conventional-commits/30f0d9fa-7043-4966-8571-4fb1252d0165.png
tags: ["github", "git", "release-notes", "github-actions-1", "release-management"]
cuid: clsiwxc07000509jw9xc6aopy
---
Releases are a very important way to:

* Track versioning
    
* Showcase changes
    
* Acknowledge contributors
    
* Distribute Binaries
    

![](/img/blog/automated-github-releases-with-github-actions-and-conventional-commits/1ee8a5e2-905b-421e-9f73-38da09ed5b2b.png align="center")

But, who does releases manually? That is boring. True engineers spend 6 hours automating tasks that take 6 minutes! So let's build a CI/CD Pipeline to automate this:

![](/img/blog/automated-github-releases-with-github-actions-and-conventional-commits/f78e04a9-0317-4a96-9b70-aefebf646703.png align="center")

## Problems

Let's break this problem down into smaller bits. I need to:

* Check if my application works so that I don't release any broken code
    
* Store the previous version to iterate only forwards
    
* Figure out how I want to bump the version (spoiler: we use conventional commits)
    
* Showcase all the commits in the release
    
* Acknowledge the contributors by using GitHub's release template
    
* Upload the binary assets to GitHub in the release
    

### Check if my application works so that I don't release any broken code

Let's create a simple GitHub action that checks if my application is up to standards:

```yaml
name: CI

on:
  push:
    branches:
      - main
  pull_request:

permissions:
  contents: write
  packages: write
  pull-requests: write

env:
  GO_VERSION: 1.21.3
  APP_NAME: go-todo-api

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4
      - name: Setup Go
        uses: actions/setup-go@0c52d547c9bc32b1aa3301fd7a9cb496313a4491 # v5
        with:
          go-version: ${{ env.GO_VERSION }}
      - name: Install Dependencies
        run: go mod download
      - name: Verify Dependencies
        run: go mod verify
      - name: Lint ${{ env.APP_NAME }}
        run: go vet ./...

  build:
    name: Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4
      - name: Setup Go
        uses: actions/setup-go@0c52d547c9bc32b1aa3301fd7a9cb496313a4491 # v5
        with:
          go-version: ${{ env.GO_VERSION }}
      - name: Install Dependencies
        run: go mod download
      - name: Verify Dependencies
        run: go mod verify
      - name: Build ${{ env.APP_NAME }}
        run: |
          chmod +x ./scripts/build.sh
          ./scripts/build.sh

  test:
    name: Test
    needs: build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4
      - name: Setup Go
        uses: actions/setup-go@0c52d547c9bc32b1aa3301fd7a9cb496313a4491 # v5
        with:
          go-version: ${{ env.GO_VERSION }}
      - name: "Warning: No test cases"
        run: echo "Reminder to create test cases"
      - name: Install Dependencies
        run: go mod download
      - name: Verify Dependencies
        run: go mod verify
      - name: Test ${{ env.APP_NAME }}
        run: go test -v ./...
```

That looks like a lot of stuff, let me break it down:

* We give the workflow a name: `CI`
    
* Set it to trigger on `push` to the main branch and `pull_request` (I know we only release from the pushes, but having CI for preview environments is like a bonus cherry on top)
    
* We give it some permissions, we want it to be able to:
    
    * push (`contents` permission)
        
    * `pull-requests` (to create the pull request that will merge in the release)
        
    * OPTIONAL: `packages` used to publish to the GitHub Container Registry
        
* We create two environment variables simply to reuse them later:
    
    * `GO_VERSION`: If I update my go versions I don't want to go and change it everywhere, so this env variable is for standardising the `GO_VERSION`
        
    * `APP_NAME`: This comes in handy when I want to push to dockerhub and create the binaries with proper naming! We also use it to name the steps and jobs so that they don't look like 'Linting project-name' rather than linting.
        
* We create 3 jobs:
    
    * `lint`:
        
        * We run `actions/checkout`
            
        * Setup Go with `actions/setup-go`, with our ENV variable of `GO_VERSION` replace this with your programming language
            
        * We install modules by running `go mod download` and `go mod verify`
            
        * We run `go vet ./...` to test the app. Replace with your test command.
            
    * `build`:
        
        * We duplicate the `lint`, rename `lint` to `build` and replace `go vet ./...` with the build script
            
    * `test`:
        
        * We duplicate the `lint`, rename `lint` to `test` and replace `go vet ./...` with the `go test -v ./...`
            

### Store the previous version to iterate only forwards

Let's create a file called `package.yaml` inside `.github` with one property called version. If you are using Node.Js then don't do it (we will use package.json instead).

## Figure out how I want to bump the version

There is a specification called [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for making commit messages both human-readable and machine-readable. The commit message is:

```plaintext
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Inside `1.2.11` as the version of a software:

* `1` is for major releases, only used when breaking changes are introduced
    
* `2` is for
    

The important thing is `<type>` here, if the type is one of:

* `feat`: Feature enhancement / Minor release, if the previous version is `0.2.0` it becomes `0.3.0`
    
* `fix`: Bug Fix / Patch release, if the previous version is `0.2.1`, it bumps to `0.2.2`
    

FYI, if you get to `0.9.0` the next release will be `0.10.0` and not `1.0.0`. But then how do we get to `1.0.0`?

We can make a commit like `feat!: breaking change` to push the version to `1.0.0` or you can also do:

```plaintext
<type>[optional scope]: <description>

BREAKING CHANGE: update description

[optional footer(s)]
```

<div data-node-type="callout">
<div data-node-type="callout-emoji">💡</div>
<div data-node-type="callout-text">FYI, you should only do a 'major' release when you make a change that is big enough to make previous ways of using it not work anymore.</div>
</div>

So now, we can use the tooling for `conventional-commits` to bump the version and showcase the changes.

### Showcase all the commits in the release

We will use the `TriPSs/conventional-changelog-action` action for this:

```yaml
  changelog:
    name: Changelog
    needs:
      - lint
      - build
      - test
    if: github.event_name != 'pull_request'
    runs-on: ubuntu-latest

    outputs:
      skipped: ${{ steps.changelog.outputs.skipped }}
      tag: ${{ steps.changelog.outputs.tag }}
      clean_changelog: ${{ steps.changelog.outputs.clean_changelog }}
      version: ${{ steps.changelog.outputs.version }}

    env:
      PR_BRANCH: release-ci-${{ github.sha }}

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4
      - name: Create Branch
        run: |
          git checkout -b ${{ env.PR_BRANCH }}

      - name: Create Changelog
        uses: TriPSs/conventional-changelog-action@dd734f74fce61a6e02f821ee1b5930bc79a23534 # v5
        id: changelog
        with:
          github-token: ${{ github.token }}
          git-user-name: "github-actions[bot]"
          git-user-email: "github-actions[bot]@users.noreply.github.com"
          git-branch: ${{ env.PR_BRANCH }}
          skip-git-pull: true
          output-file: false
          version-file: .github/package.yaml
          create-summary: true

      - name: Create Changelog PR
        if: steps.changelog.outputs.skipped == 'false'
        run: |
          gh pr create --base main --head ${{ env.PR_BRANCH }} --title 'chore(release): ${{ steps.changelog.outputs.tag }} [skip-ci]' --body '${{ steps.changelog.outputs.clean_changelog }}'
        env:
          GH_TOKEN: ${{ github.token }}

      - name: Approve Changelog PR
        if: steps.changelog.outputs.skipped == 'false'
        run: |
          gh pr review --approve ${{ env.PR_BRANCH }}
        env:
          GH_TOKEN: ${{ secrets.GH_OWNER_TOKEN }}

      - name: Merge Changelog PR
        if: steps.changelog.outputs.skipped == 'false'
        run: |
          gh pr merge --squash --auto --delete-branch ${{ env.PR_BRANCH }}
        env:
          GH_TOKEN: ${{ secrets.GH_OWNER_TOKEN }}
```

Breaking it down:

* We have a `changelog` job that depends on `lint`, `build` and `test`
    
* It runs only if the event name is not `pull_request`
    
* We have defined the outputs so that we access them in the further jobs!
    
* We declare a `PR_BRANCH` an environment variable to reuse the PR branch across all the jobs
    
* We created the branch for the PR `git checkout -b ${{ env.PR_BRANCH }}`
    
* `TriPSs/conventional-changelog-action` has all the options specified, you can look at the docs to see what they do!
    
* The only important options are `version-file` which should be `package.json` for NodeJs Users, and `.github/package.yaml` (the file we created) for most other users. `output-file` is for changelog, I don't like having a changelog file because I can just use the GitHub Releases page to replace it.
    
* Then we create the PR to update the version `gh pr create`
    
* Finally, we merge it with **A SECRET** called `GH_OWNER_TOKEN`
    

<div data-node-type="callout">
<div data-node-type="callout-emoji">💡</div>
<div data-node-type="callout-text">Make sure to add the <strong>GH_OWNER_TOKEN</strong> with the permissions necessary to merge the PR</div>
</div>

This does 3 things:

* Creates the `tag` on GitHub
    
* Makes the PR to update the version on GitHub
    
* Create an automated change log
    

### The rest of the problems in bulk

Now we finally add a `release` job with `softprops/action-gh-release`

```yaml
  release:
    name: Release
    needs: changelog
    if: github.event_name != 'pull_request' && needs.changelog.outputs.skipped == 'false'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4

      - name: Setup Go
        uses: actions/setup-go@0c52d547c9bc32b1aa3301fd7a9cb496313a4491 # v5
        with:
          go-version: ${{ env.GO_VERSION }}
      - name: Install Dependencies
        run: go mod download
      - name: Verify Dependencies
        run: go mod verify
      - name: Cross-Build ${{ env.APP_NAME }}
        run: |
          chmod +x ./scripts/build.sh
          CROSS_BUILD=true APP_NAME=${{ env.APP_NAME }} VERSION=${{ needs.changelog.outputs.version }} ./scripts/build.sh

      - name: Create Release
        uses: softprops/action-gh-release@de2c0eb89ae2a093876385947365aca7b0e5f844 # v1
        with:
          token: ${{ secrets.GH_OWNER_TOKEN }}
          tag_name: ${{ needs.changelog.outputs.tag }}
          prerelease: false
          draft: false
          files: bin/*
          generate_release_notes: true
          name: ${{ needs.changelog.outputs.tag }}
          body: |
            <details>
              <summary>🤖 Autogenerated Conventional Changelog</summary>

            ${{ needs.changelog.outputs.clean_changelog }}
            </details>
```

Breaking down what we've done here:

* We only execute this job `changelog.outputs.skipped` is not false
    
* We set up to repeat all the things we did during `build`
    
* `softprops/action-gh-release` is being used to create the release on GitHub
    
    * We tell it the tag we get from the `changelog` job
        
    * `generate_release_notes` is set to true to generate the GitHub-style release notes + it creates those cool contributor shoutouts
        
    * `files` tells it which files to upload with the release
        
    * `body` uses the changelog from the `changelog` step
        

## Let's look at the progress

This is the workflow we have right now. It builds, tests, figures out what release to make and makes a release on GitHub.

```yaml
name: CI

on:
  push:
    branches:
      - main
  pull_request:

permissions:
  contents: write
  packages: write
  pull-requests: write

env:
  GO_VERSION: 1.21.3
  APP_NAME: go-todo-api

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4
      - name: Setup Go
        uses: actions/setup-go@0c52d547c9bc32b1aa3301fd7a9cb496313a4491 # v5
        with:
          go-version: ${{ env.GO_VERSION }}
      - name: Install Dependencies
        run: go mod download
      - name: Verify Dependencies
        run: go mod verify
      - name: Lint ${{ env.APP_NAME }}
        run: go vet ./...

  build:
    name: Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4
      - name: Setup Go
        uses: actions/setup-go@0c52d547c9bc32b1aa3301fd7a9cb496313a4491 # v5
        with:
          go-version: ${{ env.GO_VERSION }}
      - name: Install Dependencies
        run: go mod download
      - name: Verify Dependencies
        run: go mod verify
      - name: Build ${{ env.APP_NAME }}
        run: |
          chmod +x ./scripts/build.sh
          ./scripts/build.sh

  test:
    name: Test
    needs: build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4
      - name: Setup Go
        uses: actions/setup-go@0c52d547c9bc32b1aa3301fd7a9cb496313a4491 # v5
        with:
          go-version: ${{ env.GO_VERSION }}
      - name: "Warning: No test cases"
        run: echo "Reminder to create test cases"
      - name: Install Dependencies
        run: go mod download
      - name: Verify Dependencies
        run: go mod verify
      - name: Test ${{ env.APP_NAME }}
        run: go test -v ./...

  changelog:
    name: Changelog
    needs:
      - lint
      - build
      - test
    if: github.event_name != 'pull_request'
    runs-on: ubuntu-latest

    outputs:
      skipped: ${{ steps.changelog.outputs.skipped }}
      tag: ${{ steps.changelog.outputs.tag }}
      clean_changelog: ${{ steps.changelog.outputs.clean_changelog }}
      version: ${{ steps.changelog.outputs.version }}

    env:
      PR_BRANCH: release-ci-${{ github.sha }}

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4
      - name: Create Branch
        run: |
          git checkout -b ${{ env.PR_BRANCH }}

      - name: Create Changelog
        uses: TriPSs/conventional-changelog-action@dd734f74fce61a6e02f821ee1b5930bc79a23534 # v5
        id: changelog
        with:
          github-token: ${{ github.token }}
          git-user-name: "github-actions[bot]"
          git-user-email: "github-actions[bot]@users.noreply.github.com"
          git-branch: ${{ env.PR_BRANCH }}
          skip-git-pull: true
          output-file: false
          version-file: .github/package.yaml
          create-summary: true

      - name: Create Changelog PR
        if: steps.changelog.outputs.skipped == 'false'
        run: |
          gh pr create --base main --head ${{ env.PR_BRANCH }} --title 'chore(release): ${{ steps.changelog.outputs.tag }} [skip-ci]' --body '${{ steps.changelog.outputs.clean_changelog }}'
        env:
          GH_TOKEN: ${{ github.token }}

      - name: Approve Changelog PR
        if: steps.changelog.outputs.skipped == 'false'
        run: |
          gh pr review --approve ${{ env.PR_BRANCH }}
        env:
          GH_TOKEN: ${{ secrets.GH_OWNER_TOKEN }}

      - name: Merge Changelog PR
        if: steps.changelog.outputs.skipped == 'false'
        run: |
          gh pr merge --squash --auto --delete-branch ${{ env.PR_BRANCH }}
        env:
          GH_TOKEN: ${{ secrets.GH_OWNER_TOKEN }}

  release:
    name: Release
    needs: changelog
    if: github.event_name != 'pull_request' && needs.changelog.outputs.skipped == 'false'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4

      - name: Setup Go
        uses: actions/setup-go@0c52d547c9bc32b1aa3301fd7a9cb496313a4491 # v5
        with:
          go-version: ${{ env.GO_VERSION }}
      - name: Install Dependencies
        run: go mod download
      - name: Verify Dependencies
        run: go mod verify
      - name: Cross-Build ${{ env.APP_NAME }}
        run: |
          chmod +x ./scripts/build.sh
          CROSS_BUILD=true APP_NAME=${{ env.APP_NAME }} VERSION=${{ needs.changelog.outputs.version }} ./scripts/build.sh

      - name: Create Release
        uses: softprops/action-gh-release@de2c0eb89ae2a093876385947365aca7b0e5f844 # v1
        with:
          token: ${{ secrets.GH_OWNER_TOKEN }}
          tag_name: ${{ needs.changelog.outputs.tag }}
          prerelease: false
          draft: false
          files: bin/*
          generate_release_notes: true
          name: ${{ needs.changelog.outputs.tag }}
          body: |
            <details>
              <summary>🤖 Autogenerated Conventional Changelog</summary>

            ${{ needs.changelog.outputs.clean_changelog }}
            </details>
```

Now we have an awesome release automation that releases every single time we push to GitHub 🚀

## Bonus: Publishing to DockerHub & GHCR

If you have a Dockerfile, let's build an image and push it to DockerHub & GHCR.

```yaml
  deploy:
    name: Deploy Image
    needs: changelog
    if: github.event_name != 'pull_request' && needs.changelog.outputs.skipped == 'false'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4

      - name: Login docker.io
        uses: docker/login-action@343f7c4344506bcbf9b4de18042ae17996df046d # v3
        with:
          registry: docker.io
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Login ghcr.io
        uses: docker/login-action@343f7c4344506bcbf9b4de18042ae17996df046d # v3
        with:
          registry: ghcr.io
          username: ${{ github.repository_owner }}
          password: ${{ secrets.GH_OWNER_TOKEN }}

      - name: Setup Docker Metadata
        uses: docker/metadata-action@dbef88086f6cef02e264edb7dbf63250c17cef6c # v5
        id: meta
        with:
          images: |
            docker.io/${{ secrets.DOCKER_USERNAME }}/${{ env.APP_NAME }}
            ghcr.io/${{ github.repository_owner }}/${{ env.APP_NAME }}
          tags: |
            latest
            ${{ needs.changelog.outputs.version }}
            ${{ github.sha }}

      - name: Build and Push Docker Image
        uses: docker/build-push-action@4a13e500e55cf31b7a5d59a38ab2040ab0f42f56 # v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

We created a `deploy` job in the workflow, here is what it does:

* Once we have successfully made the release
    
* We authenticate to 2 Docker Registries using the official `docker/login-action`
    
* Using `docker/metadata-action` we set up metadata of the action, including:
    
    * Image name, we define the image name using `APP_NAME` variable we declared earlier for both the docker hub and `ghcr`.
        
    * We set three tags for each of the images: `latest`, the version of the release and the SHA of the commit
        
* Finally, we build and push to the registries using the `docker/build-push-action` with the Dockerfile in the root of the repository.
    

<div data-node-type="callout">
<div data-node-type="callout-emoji">💡</div>
<div data-node-type="callout-text">Make sure to create the <strong>DOCKER_USERNAME</strong> and <strong>DOCKER_PASSWORD</strong> to push to DockerHub.</div>
</div>

Here's the [source code](https://github.com/xkrishguptaa/go-todo-api/blob/main/.github/workflows/ci.yml) for the workflow file, and this is an [example run](https://github.com/xkrishguptaa/go-todo-api/actions/runs/7299829622).  
  
Follow Kubesimplify on [**Hashnode**](https://kubesimplify.com/), [**Twitter**](https://twitter.com/kubesimplify) and [**LinkedIn**](https://www.linkedin.com/company/kubesimplify/). Join our [**Discord**](https://blog.kubesimplify.com/kubesimplify.com/discord) server to learn with us.