---
title: "Arkade"
datePublished: 2022-05-17T12:15:29.315Z
slug: arkade
author: anurag-kumar
cover: /img/blog/arkade/7K24Ts7Tq.png
tags: ["productivity", "kubernetes", "developer", "devops", "thw-cloud-computing"]
cuid: cl3a4bx3s00npy3nvgc0jeasm
---
- Arkade is one of my favourite tools. 
- It is an open source marketplace for developer tools which makes it really easy to install things in your system. 
- Arkade is super simple and super minimal, so it's going to be a short blog. 
- Before arkade whenever I used to spin up an instance, I used to go to multiple sites and download the binary. 
- e.g. I created a new instance, and now I will do the following. I primarily code in go(still learning) and I love exploring new tools. 
  - First visit the go installation [page](https://go.dev/doc/install) and run a curl command to download go. 
  - Even after download go, I need to extract go and add it to the path and source it. 
  - Generally, if I want to install any other tool, then I will go to the installation page of the tool and run the scripts provided there. 
  - Another common practice is that I go to the github release of the page and execute a `curl` or `wget` request on the latest release I need to install.
- Now with the help of arkade I don't have to visit multiple sources to download either applications or command line tools. 

### Hands on Arkade 
- With arkade you can download three types of things
  - command line tools (kubectl,kubectx,kubens)
  - kubernetes applications (kyverno,tekton,argocd)
  - system packages/applications (go,containerd,prometheus)

### Installing arakde 
- Run the command 
```
curl -sLS https://get.arkade.dev | sudo sh
```
- Add the path in your .zshrc or .bashrc (skip if already set)
```
export PATH=$PATH:/usr/local/bin
```
### How to install Command line tools? 
- when you will run the command `arkade get`, you will see a bunch of options that you can download




![arkade.gif](/img/blog/arkade/xuW7_4qkr.gif align="left")

- Just select anyone that you wish to download 
- You can also install a specific version of any tool using `arkade get tool@version` 
- I'm installing kubens now which is a tool to set simplifies setting up your active namespaces. 
- After installation, you should see this. 


![Screenshot from 2022-05-12 09-42-13.png](/img/blog/arkade/3nG1YMVvv.png align="left")

- I would recommend to add the `~/.arkade/bin` directory to your PATH variable. 
- To do that add this line to your .zshrc or .bashrc 

```
export PATH=$PATH:$HOME/.arkade/bin/
```
- Now you can run `kubens` and it should work.



![kubens2.gif](/img/blog/arkade/zOz6UxITl.gif align="left")

- All the binaries that you will install by default will reside under the `.arkade/bin` directory. 

![Screenshot from 2022-05-12 09-40-05.png](/img/blog/arkade/yOPeMDTNO.png align="left")

### How to install kubernetes apps? 
- You can install kubernetes applications with arkade. Arkade will look for helm charts or k8s manifest and install that respective application in your cluster.
- To see the list of applications that you can install with arkade run the command `arkade install --help` 



![arkinstall.gif](/img/blog/arkade/gTeKELnJL.gif align="left")

- To install any application, you need to run `arkade install <application-name>` 
- For example, I'm installing kyverno here. After installation, You should see a message saying your application has been installed. It also gives you an Info message about the application at the end. Make sure to check that for application related settings and configurations. 

![Screenshot from 2022-05-12 16-56-54.png](/img/blog/arkade/_8oPG2PRA.png align="left")

> You can also check out info of an application using the command `arkade info <application-name>`


![Screenshot from 2022-05-12 17-05-43.png](/img/blog/arkade/acdJXcrV4.png align="left")

### How to install system packages? 

- Till now we have installed binaries and Kubernetes applications. Now, Systems applications are mainly used to install applications on Linux systems. 
- It removes the complexity of going to the release page making a curl request and then untar it in your system. 
- You can install languages like go, monitoring tools like prometheus to setup on your host or containerd to manage your containers. 
- Read more about the system packages [here](https://github.com/alexellis/arkade/issues/654). It's a very good guide to understand what was the thought process behind system applications? 

- Let's install golang on our system with which we have started the article. 


![arkadego.gif](/img/blog/arkade/VfCesFQyu.gif align="left")

- Now all I need to do is that put the last two lines in my `.zshrc`
```
export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin
export GOPATH=$HOME/go/
```
- This time I have also created a killercoda scenario for you to try out arkade. You can try arkade right from your browser [here](https://killercoda.com/kranurag7/course/devX)
- I hope this was useful. Thank you for reading. 
- Feel free to suggest any changes if I have missed something. 

