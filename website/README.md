<p style="text-align:center;" align="center"><a href="https://kubesimplify.github.io/website/"><picture align="center">
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/kubesimplify/branding/main/assets/svg/horizontal/white.svg"  width="70%" align="center" style="margin-bottom:20px;">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/kubesimplify/branding/main/assets/svg/horizontal/black.svg" width="70%" align="center" style="margin-bottom:20px;">
  <img alt="Shows an illustrated light mode kubesimplify logo in light color mode and a dark mode kubesimplify logo dark color mode." src="https://raw.githubusercontent.com/kubesimplify/branding/main/assets/svg/horizontal/white.svg" width="70%" align="center" style="margin-bottom:20px;">
</picture></a><br /><br /></p>
<p align="center">


<a href="https://t.co/9KuC1EMxWo" alt="Discord Invite">
  <img src="https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white" /></a>
<a href="https://www.linkedin.com/company/kubesimplify/" alt="Linkedin">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" /></a>
  <a href="https://twitter.com/intent/follow?screen_name=kubesimplify" alt="Twitter Follow">
  <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" /></a> 
  <a href="https://kubesimplify.com/" alt="Youtube">
  <img src="https://img.shields.io/badge/Kubesimplify-%3CCOLOR%3E?style=for-the-badge&logo" /></a>
    <a href="https://www.youtube.com/c/saiyam911" alt="Youtube">
  <img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" /></a>
  </p>

<p align="center"><i>If you like Kubesimplify, please ★ this repository to show your support! 🤩</i></p>

This repository contains the assets required to build the Kubesimplify website and documentation. We're glad that you want to contribute! 

  


<h1>Contributing Guidelines: </h1>

We're a warm and welcoming community of open source contributors. Please join. All types of contributions are welcome. Be sure to read the Kubesimplify <a href="https://github.com/kubesimplify/website/blob/main/CONTRIBUTING.md">CONTRIBUTING.md</a> for a tour of resources available to you and how to get started.
This is the source code of the official [Kubesimplify's website](https://kubesimplify.github.io/website/). 

For new developers getting started, here are some instructions to follow:
Fork the repo by clicking the fork button. This will clone the repo in your account, changes done here will be shown in the main repo. 
 
Clone the repo to your local device: 
```bash
   git clone https://github.com/kubesimplify/website.git 
   cd website
```

## Local Runner
Install dependencies:
```bash
    $ npm install 
```
To run the website on your computer:
```bash
    $ npm start
```

## Docker based Runner
```sh
# Production environment
docker build --target=prod -t kubesimplify:website . --no-cache
docker run --rm -d -p 3000:3000 kubesimplify:website
# Dev testing environment
docker build --target=dev -t kubesimplify:website . --no-cache
docker run --rm -it -v $(pwd):/app -p 3000:3000 kubesimplify:website sh
```


And then open up your web browser and go to [localhost:3000](http://localhost:3000).



---
<h4 align="center"> Code under MIT License, assets may not be re-used or re-distributed.
<br>
 Kubesimplify, 2022. MIT License.

[Docusaurus]: https://docusaurus.io/
[Kubesimplfy theme]: https://github.com/kubesimplify/branding
