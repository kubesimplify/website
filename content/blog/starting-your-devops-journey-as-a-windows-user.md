---
title: "Starting your DevOps Journey as a Windows User"
seoTitle: "DevOps as a Windows User"
seoDescription: "Install WSL, DevOps in windows, installing Docker in windows, Minikube and Kubernetes for windows"
datePublished: 2022-04-15T12:47:43.388Z
slug: starting-your-devops-journey-as-a-windows-user
author: vaidansh-bhardwaj
cover: /img/blog/starting-your-devops-journey-as-a-windows-user/fD09s4AqP.jpg
tags: ["docker", "git", "windows", "devops", "linux-for-beginners"]
cuid: cl20fe46o04ujwnnv7x4s6i6j
---
# Why DevOps?

["DevOps"](https://about.gitlab.com/topics/devops/) has become a new buzzword in the tech industry. With booming career opportunities and good pay even for freshers, this is the right time for you to get started with your DevOps journey. Now the question that stands is how a Windows user can get started?

# Other Options
As a Windows user, you can either dual boot your system with your favourite Linux distro or use WSL(more about this below) provided by windows. **In this blog we will be covering WSL.**

# What is WSL?

[Windows Subsystem for Linux (WSL)](https://docs.microsoft.com/en-us/windows/wsl/about) lets developers run a GNU/Linux environment -- including most command-line tools, utilities, and applications -- directly on Windows, unmodified, without the overhead of a traditional virtual machine or dual-boot setup.

# Installing WSL

<h3> Prerequisites </h3>
You must be running Windows 10 version 2004 and higher (Build 19041 and higher) or Windows 11. If you're running an older version refer to [this document by windows](https://docs.microsoft.com/en-us/windows/wsl/install-manual)
<h3> Install WSL </h3>

- Run this command in an **administrator** Powershell or Command Prompt
```
wsl --install
``` 
This command will enable the required optional components, download the latest Linux kernel, set WSL 2 as your default, and install a Linux distribution for you (Ubuntu by default)
- Once Ubuntu is downloaded you will be asked to reboot your system for the changes to take place.
![Screenshot (41).png](/img/blog/starting-your-devops-journey-as-a-windows-user/HTJDDnbrI.png)
- To change the distribution installed, enter: `wsl --install -d <Distribution Name> `. Replace `<Distribution Name>` with the name of the distribution you would like to install.
- To list out the available Linux distributions available for download through the online store, enter: `wsl --list --online` or `wsl -l -o`.

- To install additional Linux distributions after the initial install, you may also use the command: `wsl --install -d <Distribution Name>`.

- After this, you will be asked to set a username and password for your system.

![Edited ss.png](/img/blog/starting-your-devops-journey-as-a-windows-user/TQOIQ2Vhy.png)

- To verify if Ubuntu(or any other Distro) is installed, you can simply search for it through the windows search bar and check if it's present.
![Screenshot (38).png](/img/blog/starting-your-devops-journey-as-a-windows-user/QGx7MSAGE.png)
- You can even verify your shell by running this command 

```
echo $SHELL
``` 
![Screenshot from 2022-04-11 22-00-19.png](/img/blog/starting-your-devops-journey-as-a-windows-user/V7kbphREF.png)

# Git
If you have been in the tech space for a while you might have heard the word **GitHub**. If not, no worries you can check out [this blog](https://kubesimplify.com/git-and-github-a-beginners-guide) by [Nitin Gouda](https://hashnode.com/@shaggyyyy). This will give you a hands-on experience with the Git commands.

<h3> Installing Git</h3>

- Install Git from [here](https://git-scm.com/downloads)

- To verify it's installation run 

```
git --version

``` 
![Screenshot from 2022-04-11 19-15-43.png](/img/blog/starting-your-devops-journey-as-a-windows-user/1MKV62ZNQ.png)
- Download the latest stable version of Git by using this command 

```
sudo apt-get install git
``` 
<h3> Setting Up the Git config file </h3>

- Open a command line and set your name with this command(Replace 'Your  Name' with your preferred username) 

```
git config --global user.name "Your Name"
``` 

- Set your email using this command(replace "youremail@domain.com" with the email you prefer) 

```
git config --global user.email "youremail@domain.com"
``` 
# Installing Oh-My-Zsh(Optional)
[Oh-my-zsh](https://ohmyz.sh/) is used to help efficiently manage and configure the ZSH shell. It comes packed with functions, themes, and plugins to improve the default ZSH shell. Although there are many different frameworks but Oh-My-Zsh is very efficient and easy to configure.

- To install zsh, run 
```
sudo apt-get update && sudo apt-get install -y zsh
``` 
this will update the latest package info and install zsh.

- After it is installed, you should be able to see it in `/etc/shells`. 

- To install the OhMyZsh framework, run this command 
```
sh -c "$(wget -O- https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
``` 
- Press `Y`, to set zsh as your default shell.

![Screenshot (45).png](/img/blog/starting-your-devops-journey-as-a-windows-user/VjKvitn6r.png)

- As it gets successfully installed, the prompt will start looking different !!

![Screenshot (46).png](/img/blog/starting-your-devops-journey-as-a-windows-user/7ssmaoW7B.png)
- Oh-My-Zsh offers a ton of useful plugins, themes that can be installed from [here](https://github.com/ohmyzsh/ohmyzsh) (By default, the robbyrussell theme is applied)

# Docker 🐋
Docker Desktop is an easy-to-install application for your Mac or Windows environment that enables you to build and share containerized applications and microservices.
<h3> Installing Docker </h3>

- Firstly, you have to install the [Linux kernel update package](https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-4---download-the-linux-kernel-update-package).

- Install the latest version of Docker Desktop from [here](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe)

- If your device supports WSL2, Docker Desktop will prompt you to enable WSL2 during installation.

- However, go to **Settings > General** and select the **Use the WSL 2 based engine** option.  This option will be enabled by default if your device supports WSL2.
![Screenshot (31).png](/img/blog/starting-your-devops-journey-as-a-windows-user/HrNe0r7TW.png) 

- Now, click **Apply & Restart**

- Refer to the [official WSL2 backend doc by Docker](https://docs.docker.com/desktop/windows/wsl/) for more help.

- Now run this command 
```
docker run hello-world
``` 
If you received this as your output :
![Screenshot (40).png](/img/blog/starting-your-devops-journey-as-a-windows-user/3SU_2fZ2V.png)

Congrats!! You just ran your first docker image!!

- Now, Enable Kubernetes through the Docker settings

![Screenshot (49).png](/img/blog/starting-your-devops-journey-as-a-windows-user/iiIUebH_2.png)

# Kubernetes
[Kubernetes](https://kubernetes.io/docs/home/) is an open-source container orchestration engine for automating deployment, scaling, and management of containerized applications. The open-source project is hosted by the Cloud Native Computing Foundation([CNCF](https://www.cncf.io/))

Few tools/services that are necessary for Kubernetes are :

- [**Kubectl**](https://kubernetes.io/docs/tasks/tools/#kubectl) : The Kubernetes command-line tool
- [**Minikube**](https://minikube.sigs.k8s.io/docs/) : quickly sets up a local Kubernetes cluster on macOS, Linux, and Windows.
- **Cloud Provider** : a third-party company offering a cloud-based platform, infrastructure, application or storage services. Ex~ Amazon Web Sevices(AWS), Civo, Microsoft Azure.

<h3> Firstly we will be **Installing Minikube** </h3>

I. Run this command to know your Linux architecture(64-bit or 32-bit) 

```
 uname -m
``` 
  If your output was `x86_64` i.e 64-bit, you're good to go with the below steps; on the other hand, if 
  your Linux architecture is ARM64 or ARM7, etc, refer to the [official doc](https://minikube.sigs.k8s.io/docs/start/) by minikube.


II. This command will install the latest minikube stable release on **x86-64** Linux using binary download :

```
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

``` 

  If you get an error message saying `curl command not found`, no worries, just run this command and 
  after that repeat the above step :

```
sudo apt update
sudo apt install curl
``` 

III. Now start your cluster from a terminal with administrator access : 

```
minikube start

``` 
![PS minikube start.png](/img/blog/starting-your-devops-journey-as-a-windows-user/VjqBhu0N5.png)
                    
If minikube fails to start check this [drivers page](https://minikube.sigs.k8s.io/docs/drivers/) for setting up a compatible container or virtual-machine.

<h3> [Installing **kubectl : **](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/) </h3>

- Download the latest release by running this command : 

```
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

``` 

- Validating the binary (Optional step) :
 
I. Download the kubectl checksum file with this command : 

```
curl -LO "https://dl.k8s.io/$(curl -L -s 
https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"

```  
II. Now we will validate the kubectl binary against the downloaded checksum file with this command : 

```
echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check
``` 
III. If valid, the output will be : 

`kubectl: OK
`
![Screenshot from 2022-04-10 20-29-59.png](/img/blog/starting-your-devops-journey-as-a-windows-user/z0xpB4X0g.png)
 
If the check fails the output will look similar to 

`kubectl-convert: FAILED`

`sha256sum: WARNING: 1 computed checksum did NOT match`

as `sha256` exits with nonzero status 

> NOTE : To resolve this error download the same version of the binary and the checksum from [here](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)

IV. Install Kubectl

```
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

``` 
V. To ensure that the version installed is up-to-date : 

```
kubectl version --client
``` 
or use this command for a detailed view([YAML](https://en.wikipedia.org/wiki/YAML) form) : 

```
kubectl version --client --output=yaml
``` 

![Screenshot from 2022-04-10 20-30-03.png](/img/blog/starting-your-devops-journey-as-a-windows-user/n5oeJZgcV.png)

<h3>Install using any package management(Snap)</h3>
Ubuntu usually supports Snap package manager so you can install it using this command
```
snap install kubectl --classic
kubectl version --client
``` 
<h3> Verifying Kubectl configuration </h3>

In order for kubectl to find and access a Kubernetes cluster, it needs a [kubeconfig file](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/), which is created automatically when you create a cluster using [kube-up.sh](https://github.com/kubernetes/kubernetes/blob/master/cluster/kube-up.sh) or successfully deploy a Minikube cluster. By default, kubectl configuration is located at ~/.kube/config.

Now let's check that kubectl is properly configured by getting the cluster state using this command : 
> NOTE : Remember to start your minikube cluster (`minikube start`)before running this command.

```
kubectl cluster-info

``` 
a. If you see a URL response like this :

![Screenshot from 2022-04-10 20-45-2412121.png](/img/blog/starting-your-devops-journey-as-a-windows-user/C_gzwHySL.png)
this means that kubectl is configured correctly to access your cluster.

b. If you get an output like this :

`The connection to the server <server-name:port> was refused - did you specify the right host or port?`

Try restarting your minikube cluster using `minikube delete` and then again `minikube start`.

For more issues refer [this](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)

# Lens
[Lens](https://docs.k8slens.dev/) gives you a powerful interface and toolkit for managing, visualizing, and interacting with multiple Kubernetes clusters, while always remaining in proper context.

Installing Lens is pretty straightforward, you just have to download the [setup file](https://k8slens.dev/) and install Lens

# What's Next
- Join amazing communities and start learning your favourites technologies in public.
- Now that you have installed these, you can proceed with your DevOps journey by joining [KubeSimplify's](https://kubesimplify.com/) [discord](https://kubesimplify.com/discord) server where you will find like-minded people who are also learning Devops and are ready to guide you if you get stuck!!

# Learning Resources

- [DevOps Roadmap](https://www.youtube.com/watch?v=7l_n97Mt0ko) by [Saiyam Pathak](https://hashnode.com/@Saiyampathak)

- [DevOps Bootcamp](https://www.youtube.com/playlist?list=PL9gnSGHSqcnoqBXdMwUTRod4Gi3eac2Ak) by [Kunal Kushwaha](https://hashnode.com/@kunalk)


**Thanks for stopping by!! Lots of luck✌️**


