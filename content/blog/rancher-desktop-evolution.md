---
title: "Rancher Desktop evolution"
seoTitle: "Rancher Desktop 1.2.0 features"
datePublished: 2022-03-25T05:08:46.337Z
slug: rancher-desktop-evolution
author: saiyam-pathak
cover: /img/blog/rancher-desktop-evolution/_yS7iAuCI.jpeg
tags: ["docker", "kubernetes", "containers"]
cuid: cl15yr0dj03cfjonvbe429o07
---
I have been testing out and using Rancher desktop since it originally came out, did a stream and a [walkthrough video](https://youtu.be/9pJF83gxbtY) as well. 

When Rancher desktop originally started, the goal was simply to provide a simple Kubernetes cluster experience as a desktop application that is open source so that it can grow with community adoption. 

Rancher desktop provides the local Kubernetes environment and the project started with Rancher desktop bundled with kim, K3s as the Kubernetes distribution and containerd as the runtime. 

![image.png](/img/blog/rancher-desktop-evolution/2SKBs0Ru1.png)

[Kim](https://github.com/rancher/kim) - Kubernetes image manager, was also another project created at rancher with a similar UX like docker but not aiming to replace it all. 

Now this was well received by the community and Rancher desktop continued to evolve, the next big enhancement they did was to remove kim and have nerdctl as part of the project. nerdctl is a docker compatible CLI for containerd and it can be exactly used to build, run, push, tag images with many more features like IPFS support, lazy pulling, container image signing etc. I have discussed this in my [walkthrough video](https://youtu.be/9pJF83gxbtY).

So if you see the new architecture you will see that kim is replaced by nerdctl, there is docker support as well. The application runs even on the apple M1 chips. 
![image.png](/img/blog/rancher-desktop-evolution/ctrDfnOJF.png)

I created the video on [Rancher 1.0.0](https://youtu.be/9pJF83gxbtY) and all the features but the project is not stopping it is even evolving more!! As of yesterday(23rd March), rancher desktop 1.2.0 was launched with even more exciting features.


![image.png](/img/blog/rancher-desktop-evolution/j58MDJiFB.png)

Few updates in 1.1.0 were 
- have port-forward enabled for mac and linux
- ability to disable trafik to free port 80/443
- docker-compose included with the utility
- ability to disable Kubernetes and just run containerd or dockerd

## Rancher Desktop 1.2.0

There are two major new fancy features as of 1.2.0 which are experimental but looks promising. 

### Rancher dashboard 
You can select a dashboard from the application to launch the rancher dashboard. 

![image.png](/img/blog/rancher-desktop-evolution/XKuILS7mB.png)

It is dope as you have the power of the Rancher dashboard locally. 


![image.png](/img/blog/rancher-desktop-evolution/vtC6PyzTw.png)

You can create the resources directly from the dashboard
 
![image.png](/img/blog/rancher-desktop-evolution/yFNsw5lro.png)

You can execute the shell and go to the container directly from the dashboard!!

![image.png](/img/blog/rancher-desktop-evolution/E3AIu6VeG.png)

You can also get the complete node view.
![image.png](/img/blog/rancher-desktop-evolution/D9tGYmpsl.png)

Overall it is an impressive dashboard that makes it super easy to administer the cluster locally 


### Rancher desktop cli  

Another cool feature that made a debut in Rancher desktop 1.2.0 is the `rdctl` basically it is the utility that lets you do all the stuff that you can from the UI right in your command line. I think this is great if you just want to be in your terminal and do all the stuff right from there, right now the supported commands are below but over time it will grow. 

![image.png](/img/blog/rancher-desktop-evolution/qhHfmGzpj.png)

You can enable it directly from the utilities 
![image.png](/img/blog/rancher-desktop-evolution/nLisBa58s.png)


An example would be to change the Kubernetes version 

```
rdctl set --kubernetes-version v1.22.4
Status: triggering a restart to apply changes.
```
After sometime the cluster version will be upgraded to the one you specified form the CLI 

```
kubectl get nodes
NAME                   STATUS   ROLES                  AGE   VERSION
lima-rancher-desktop   Ready    control-plane,master   12s   v1.22.4+k3s1
```

Overall nerdctl and Rancher desktop is a good solution to work with containers and Kubernetes on your local machine! 

Give it a try and let me know how you find this tool. 

Follow the Kubesimplify community if you like the content.





