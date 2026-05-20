---
title: "Managing Contexts In Kubernetes With Plugins"
seoTitle: "Managing Contexts In Kubernetes With Plugins"
seoDescription: "You have your local kubernetes cluster and you connect that via your terminal using kubectl. By default kubectl searches your cluster config in the ~/.kube/"
datePublished: 2022-04-12T12:42:38.931Z
slug: managing-contexts-in-kubernetes-with-plugins
author: anurag-kumar
cover: /img/blog/managing-contexts-in-kubernetes-with-plugins/1qC7blbGG2.jpeg
tags: ["plugin", "plugins", "kubernetes", "devops", "k8s"]
cuid: cl1w4w15z05ltkmnv9ut0fbu1
---
## How to manage multiple k8s clusters 
- This is a beginner's guide on how to manage multiple clusters when you've multiple config files. 
- When you use a local kubernetes environment then it looks something like this. You may be using minikube, docker desktop, rancher-desktop, microk8s etc. 


![rancher-desktop.png](/img/blog/managing-contexts-in-kubernetes-with-plugins/IzAmri11g.png)

- You have your local kubernetes cluster and you connect that via your terminal using `kubectl`
- By default kubectl searches your cluster config in the ~/.kube/config directory. 
- Upto this point everything is simple and you're not facing any issue. Now you want to create a cluster in the cloud on civo, LKE, EKS, GKE etc. The problem here is that you've only one terminal and you want to connect  to multiple clusters. How would you do that?
- To illustrate it visually, here's what you're trying to achieve. 


![multiple-kube-configs.png](/img/blog/managing-contexts-in-kubernetes-with-plugins/DiULyVeW8.png)

- I was not knowing this when I got started with kubernetes I was unaware of this concept and it took me some time to figure this out. 
- Let me also tell you what I used to do when I was unaware of this concept. I was using [lens](https://k8slens.dev) and in that I used to add my kubeconfig file and then get access to the remote cluster. But I always wanted to access the cluster from my terminal. 


![Screenshot from 2022-04-02 21-03-08.png](/img/blog/managing-contexts-in-kubernetes-with-plugins/ymcN7qmO4.png)

- It used to look something like this. 

![Screenshot from 2022-04-02 21-03-39.png](/img/blog/managing-contexts-in-kubernetes-with-plugins/jnbBybBNZ.png)



- We manage multiple clusters with the help of context. context is the current cluster that is active in your terminal session. 
- To check which is the current context use the command `kubectl config current-context`
- Now You have to change the context in order to access the cluster that is in the cloud. 
- When we create a k8s cluster then we get a kubeconfig file from the provider. You need to store that file locally into your system. 
- In the above case what we can do is that we can simply pass a command `export KUBECONFIG=/path/to/kubeconfig`
- This method is suitable when you just want to operate on one cluster. 
- What if you want to operate multiple clusters and change the context according to your need.
- In this case we can pass our command something like this `export KUBECONFIG=cluster1config:cluster2config:cluster3config`
- Let's assume that you have your local rancher desktop setup in your system. The default path where kubectl will look for kubeconfig is in the .kube/config. 
- Now you have created a cluster on civo and downloaded the kubeconfig in your `~/Downloads` directory and then you created a 3 node cluster on linode and again downloaded the config in your downloads directory. 
- Now in order to access the cluster you have to run the command `export KUBECONFIG=~/Downloads/civo-k8s-config:~/Downloads/linode-k8s-config:~/.kube/config`
- Now if you run the command `kubectl config get-contexts` then you will be able to see all the three clusters. 
- Now you can change the context run the command `kubectl config set-context <cluster-name>`
- Whenever you want to switch the context you can do that via the above command.
- You can delete the context `kubectl config delete context <context-name>`

## Plugins to make your job easier

### Kubectx

- This plugin makes your life easy and you don't have to type long commands now. 
- This is a plugin for kubernetes which you can download. Checkout the installation instructions [here](https://github.com/ahmetb/kubectx/)
- With kubectx you can easily manage your clusters and switch from one to another. 

![kubectx in action](https://github.com/ahmetb/kubectx/raw/master/img/kubectx-demo.gif)

- Above image is taken from the github readme of the kubectx project. 

### Kubens

- This plugin is same as kubectx, the only difference is that it's for namespaces. 
- When you run `kubectl get pods` then the result you get is the pods of the `default` namespace.
- Now in order to change the active namespace to some other namespace  we use `kubectl config set-context --current --namespace kube-system`. Now your active namespace is kube-system. 
- This process is tiring and you have to type long commands every time and in this case kubens can be useful. 
- kubens is simple and you just have to type `kubens <desired-namespace>` and you will set your active context as desired-namespace. 

![image](https://github.com/ahmetb/kubectx/raw/master/img/kubens-demo.gif)

- Image is taken from the github readme of the kubectx project. 

### kube-ps1

- With this plugin you can have a look at what is your current cluster context and active namespace context. This can be very helpful when you're managing multiple clusters. You can see the project [here](https://github.com/jonmosco/kube-ps1)

![image](https://github.com/jonmosco/kube-ps1/raw/master/img/kube-ps1.gif)

- Image is taken from the github readme of kube-ps1 project. 

---

- You can check out the quick video by Natan on this subject [here](https://youtu.be/oW3BqaHt1lk)