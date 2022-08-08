[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/kubesimplify/website/pulls)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.png?v=103)](https://github.com/kubesimplify/)

At Kubesimplify, we warmly welcome contributions through collaboration. We are excited to see that you want to contribute!. There are many ways in which one could contribute to Kubesimplify and every contribution is equally appreciated here. Navigate through the following to understand more about contributing here.

# Before you get started

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting [our discord community](https://kubesimplify.com/discord)
Violation of the code of conduct is taken seriously. The comfort and safety of Kubesimplify community members are our priority. Please do well to adhere to the Code of Conduct to participate in the Kubesimplify community.

# New to Git

Follow these resources: https://lab.github.com and https://try.github.com/

# Style guide

The Kubesimplify website is hosted in this repository and is built using [Docusaurus2.0](). Once a pull request has been submitted, a preview deployment will be built and made available to you and other contributors on your PR to review.

# Contributing to Kubesimplify website

Please follow these steps and note these guidelines to begin contributing:

1. The first step is to set up the local development environment. See [this](#how-to-contribute) on how to do the same.
1. Take a look at the existing [Issues](https://github.com/kubesimplify/website/issues) or [create a new issue!](https://github.com/kubesimplify/website/issues/new/choose)
1. A good way to easily start contributing is to pick and work on a [good first issue](https://github.com/kubesimplify/website/labels/good%20first%20issue) or [help wanted](https://github.com/kubesimplify/website/labels/help%20wanted). We try to make these issues as clear as possible and provide basic info on how the code should be changed, and if something is unclear feel free to ask for more information on the issue.
1. Add screenshots or screen captures to your Pull Request to help us understand the effects of the changes proposed in your PR.

# How to Contribute

## Prerequisites

Make sure you have the following prerequisites installed on your operating system before you start contributing:

- [Nodejs](https://nodejs.org/en/) version 16.14 or above.

  To verify run:

  ```
  node -v
  ```

- [Yarn](https://yarnpkg.com) version 1.2 or above.

  To verify run:

  ```
  yarn -v
  ```

## Set up your Local Development Environment

### This website is built using [Docusaurus2.0](https://docusaurus.io/), a modern static website generator.

Follow the following instructions to start contributing.

**1.** Fork [this](https://github.com/kubesimplify/website) repository.

**2.** Clone your forked copy of the project.

```
git clone https://github.com/<your-github-username>/kubesimplify.git
```

**3.** Navigate to the project directory.

```
cd kubesimplify
```

**4.** Add a reference (remote) to the original repository.

```
git remote add upstream https://github.com/kubesimplify/website.git
```

**5.** Check the remotes for this repository.

```
git remote -v
```

**6.** Create a new branch.

```
git checkout -b <your_branch_name>
```

**7.** Install the dependencies for running the site.

```
yarn
```

**8.** Run the site locally to preview changes.

```
yarn start
```

This will run a local webserver with "live reload" conveniently enabled at `localhost/3000`.

**9.** Make desired changes to files.

**10.** Track your changes.

```
git add  <file_name>
```

**11.** Commit your changes. To contribute to this project, you must agree to the [Developer Certificate of Origin (DCO)](https://github.com/dcoapp/app#how-it-works) for each commit you make.

```
git commit --signoff -m "<your commit message>"
```

or

```
git commit -s -m "<your commit message>"
```

**12.** Push the committed changes in your local branch to your remote repo.

```
git push -u origin <your_branch_name>
```

**13.** Once you’ve committed and pushed all of your changes to GitHub, go to the page for your fork on GitHub, select your development branch, and click the _pull request button_. Please ensure that you compare your feature branch to the desired branch of the repo you are supposed to make a PR to.

**_:trophy: After this, the maintainers will review the PR and will merge it if it helps move the Kubesimplify website project forward. Otherwise, it will be given constructive feedback and suggestions for the changes needed to add the PR to the codebase._**

**14.** While you are working on your branch, other developers may update the `master` branch with their branch. Such scenarios make your branch out of date with the `master` branch with missing content. So to fetch the new changes, follow along:

```
git checkout master
git fetch origin master
git merge upstream/master
git push origin
```

Now you need to merge the `master` branch into your branch. This can be done in the following way:

```
git checkout <your_branch_name>
git merge master
```

## All the best! 🥇
