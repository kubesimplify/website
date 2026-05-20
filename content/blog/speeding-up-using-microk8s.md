---
title: "Speeding up using MicroK8s"
datePublished: 2023-02-21T12:30:38.959Z
slug: speeding-up-using-microk8s
author: aayush-sharma
cover: /img/blog/speeding-up-using-microk8s/bc1b2698-6e3f-40a5-9fcb-a68836fef865.png
tags: ["linux", "kubernetes", "microk8s"]
cuid: clee85xov02cagmnv8ty51w6t
---
# What is MicroK8s?

MicroK8s **is a lightweight Kubernetes distribution** that is designed to run on local systems. It is the smallest and fastest multi-node [**Kubernetes**](https://kubernetes.io/). It is **lightweight and easy to set up,** which helps in decreasing the complexity of management, deployment, and scaling of containerized applications, which further helps in the smooth transition to **Kubernetes.** It is available as a snap and runs on Linux, macOS, and Windows using [**multipass**](https://multipass.run/).

MicroK8s is an upstream Kubernetes deployment that is **CNCF-certified** and operates fully on our workstation. It can quickly build up a **single-node cluster** and works well with **local development**, **IoT appliances**, **CI/CD**, and at the **edge** because it employs snap packing, it is also capable of automatic updates, which means that once a new Kubernetes version is available on the main deployment, it will immediately update itself to the most recent version.

![](/img/blog/speeding-up-using-microk8s/cafcc72f-fbe0-44cf-b24b-9688045d68c3.png align="center")

# Benefits of MicroK8s

Apart from being fast, it has various other functionalities to look at before choosing any other distribution.

* **Do not require VM** - MicroK8s was originally intended for Linux and does not require a virtual machine to execute. Instead, it is installed as a snap package.
    
* **Diverse integrations and resources** - MicroK8s is ideal for edge deployments since it doesn't need a virtual machine (VM) and has more resources at its disposal to run applications.
    
* **Isolated Environment** - As MicroK8s is a Zero-ops, pure-upstream Kubernetes,  
    from developer workstations to production it provides an isolated and secure development environment fundamental to the Operating System.
    
* **High-Level addons** - Initially there are various services provided by MicroK8s such as - kube-proxy, kubelet, api-server, and so on. Users can add more services as per their needs, to view the list of all the add-ons [click here](https://microk8s.io/docs/addons).
    
* **High Availability(HA) Support** - In MicroK8s when three or more nodes are clustered, high availability is immediately activated, and the data store automatically switches between nodes to preserve a secret in the case of a failure. When a node is lost, HA MicroK8s can continue to offer reliable services, and lower production needs with a minimum of overhead and important work.
    
* **Lightweight** - As said earlier it does not need to spin a VM containing all the services which might not even be used making the process faster and lighter. MicroK8s initially provides only the required services to run a single-node cluster in your local system using snap and multipass which make it lighter.
    
* **A vast variety of fields** - MicroK8s may be utilized in a variety of technologies, including DevOps, AI/ML, CI/CD, and others. When compared to other options, all of the aforementioned fields require a significant amount of effort to configure, however MicroK8s simplifies the process and provides significant resource savings.
    

# Some valuable Addons

**AFTER INSTALLING AND RUNNING MICROK8S, RUN THE FOLLOWING CODE IN YOUR TERMINAL TO ENABLE ANY ADDON:**

```plaintext
microk8s enable <addon name>
```

The following are the most crucial or often used MicroK8s additions for setting up a production-level environment:

1. [**cert-manager**](https://cert-manager.io/) **\-** Certificate controller for Kubernetes clusters.
    
    ```plaintext
    microk8s enable cert-manager
    ```
    
2. [CoreDNS](https://coredns.io/) - To provide address resolution services to Kubernetes, CoreDNS is deployed. It is advised that you activate this service because other add-ons frequently use it.
    
    ```plaintext
    microk8s enable dns
    ```
    
3. [**dashboard**](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/) - The default Kubernetes Dashboard.
    
    ```plaintext
    microk8s enable dashboard
    ```
    
4. [ingress](https://docs.nginx.com/nginx-ingress-controller/) - This addon adds an NGINX Ingress Controller for MicroK8s.
    
    ```plaintext
    microk8s enable ingress
    ```
    
5. [**community**](https://github.com/canonical/microk8s-community-addons/tree/main/addons) - This enables the addition of several add-ons created by third parties and the community such as - [**portainer**](https://www.portainer.io/)**,** [**istio**](https://istio.io/latest/)**,** [**argued**](https://argo-cd.readthedocs.io/en/stable/) and so on.
    
    ```plaintext
    microk8s enable community
    ```
    

![](/img/blog/speeding-up-using-microk8s/42e8e038-10f7-4171-a8a4-c18e61a29d4d.png align="center")

# Installation

1. **STEP-1 - Installing MicroK8s:**
    

* **Linux -** In Linux, MicroK8s is installed with the help of snap. Check if your system contains snap or not by running the below-given command:
    
    ```plaintext
    snap version
    ```
    
    It should display these details if present in your system and if you get an error install [snap](https://snapcraft.io/docs/installing-snapd?_ga=2.262517900.1236479193.1676100595-250298134.1675938529) in your local system to install MicroK8s:
    
    ![](/img/blog/speeding-up-using-microk8s/f4831223-0822-400a-a6f2-7882c8be9b2e.png align="center")
    
    If you have snap installed run the below command in your terminal to install MicroK8s in your local system:
    
    ```plaintext
    sudo snap install microk8s --classic
    ```
    
    It should take a while and you should get this output in your terminal:
    
    ![](/img/blog/speeding-up-using-microk8s/76a5ed08-2e1d-4f97-8f45-043ad85dbc33.png align="center")
    
    MicroK8s is successfully installed in your system!!
    
* **macOS -** In macOS, MicorK8s is installed with the help of [Homebrew](https://brew.sh/). If you don't have Homebrew installed do install it in your local system and after that run the below command in your terminal to install MicroK8s:
    
    ```plaintext
    brew install ubuntu/microk8s/microk8s
    ```
    
    This can take a few minutes and at the end of the process it should display:
    
    ![](/img/blog/speeding-up-using-microk8s/fbcd31ea-a48a-4797-b9d3-f3c216e48472.png align="center")
    
    After this execute the below command in your terminal and again this might also take a while:
    
    ```plaintext
    microk8s install
    ```
    
    Wait until you get this displayed on your terminal screen:
    
    ![](/img/blog/speeding-up-using-microk8s/3227d564-1e4e-4289-8fe7-447223b92457.png align="center")
    
* **Windows -** In windows simply run the [MicroK8s Installer](https://microk8s.io/microk8s-installer.exe).
    

1. **STEP-2 - Check the MicroK8s status:**
    
    Run the below command in your terminal to check if MicroK8s is running:
    
    ```plaintext
    microk8s status --wait-ready
    ```
    
    The result on the terminal should be:
    
    ![](/img/blog/speeding-up-using-microk8s/366979ee-0987-4f24-a1ae-630605853ada.png align="center")
    
    That's it MicroK8s is up and running in your local system!!
    

### Kubernetes Dashboard

After completing the installation steps, let's check the node's status by running the below command:

```plaintext
microk8s kubectl get nodes
```

![](/img/blog/speeding-up-using-microk8s/4783a4c1-a657-4df0-9079-104f8e8786d9.png align="center")

I have one default "microk8s-vm" node running. Let's enable some of the important services before creating the dashboard:

```plaintext
microk8s enable dashboard dns
```

![](/img/blog/speeding-up-using-microk8s/f0c3ecfb-9281-4337-acdc-1fce103c3d76.png align="center")

To double-check all the services that are running, enter the below command in your terminal:

```plaintext
microk8s kubectl get all --all-namespaces
```

![](/img/blog/speeding-up-using-microk8s/9fb5e693-bc8a-4964-869a-17cdb7514161.png align="center")

Finally, create the dashboard using:

```plaintext
microk8s dashboard-proxy
```

Visit the link where the dashboard is available and enter the token displayed in your terminal to access the Kubernetes Dashboard.

![](/img/blog/speeding-up-using-microk8s/64f61161-f7d4-4332-aa11-b447ef57c2d0.png align="center")

### Multi-node Setup

After completing the installation steps to run a multi-node cluster, let us first create two VMs using the multipass command:

```plaintext
multipass launch --name <vm-name> --mem 4G --disk 40G
```

In the above command, the "--name" is used to name the VM, the "-mem" flag is used to specify memory, and the "-disk" is used to allocate the disk storage for the VM.

![](/img/blog/speeding-up-using-microk8s/4ed8d07f-429e-4f90-bc3e-73188e93aef7.png align="center")

![](/img/blog/speeding-up-using-microk8s/97285686-4a43-4fce-9bd3-2067c8f36a20.png align="center")

In the above two images, I have launched two VMs named "**Blog**" and **"Blog-end".**

To check the list of nodes running, enter the below command in your terminal:

```plaintext
multipass list
```

![](/img/blog/speeding-up-using-microk8s/362c4948-b9f9-4a96-87a2-da8643f62854.png align="center")

After this, shell into both the VMs using the command:

```plaintext
multipass shell <vm name>
```

![](/img/blog/speeding-up-using-microk8s/853489d9-207f-4a0b-99b7-94f9d236b696.png align="center")

![](/img/blog/speeding-up-using-microk8s/27006178-6aba-4cbf-b368-e070100810de.png align="center")

**Tip: Split your terminal window, which will help you avoid confusion while setting up the multi-node cluster.**

Following that, install MicroK8s on both VMs separately using:

```plaintext
sudo snap install microk8s --classic
```

![](/img/blog/speeding-up-using-microk8s/1bc4d606-858d-4616-ab58-3137ef4b8188.png align="center")

![](/img/blog/speeding-up-using-microk8s/454a7bd4-170d-4c72-98ed-0b53e52f07f0.png align="center")

On completing the installation, run the below command to check the status of MicroK8s:

```plaintext
microk8s status --wait-ready
```

If you get the below error:

![](/img/blog/speeding-up-using-microk8s/f9fe8aa3-e722-42dc-a929-9228ba84dd6f.png align="center")

Check if you have the ".kube" directory in your VM by running:

![](/img/blog/speeding-up-using-microk8s/4218e65e-a435-47a9-81a2-ce05106fe7f4.png align="center")

As we see in the above directory list ".kube" directory is absent so create one with the help of the below command:

```plaintext
mkdir .kube
```

![](/img/blog/speeding-up-using-microk8s/5f3b45e5-96ec-4340-b440-cc72558eda0a.png align="center")

Now the ".kube" directory is created after this just copy and paste the suggested command into the terminal

```plaintext
sudo usermod -a -G microk8s ubuntu
sudo chown -R ubuntu ~/.kube
```

![](/img/blog/speeding-up-using-microk8s/6da0df0a-5168-4242-b58a-45d34bfa7222.png align="center")

![](/img/blog/speeding-up-using-microk8s/a3443fb2-3170-4dfe-bb02-54dc34a6263d.png align="center")

Following the process make a new group of microk8s using the below command:

```plaintext
newgrp microk8s
```

After completing these steps check again if MicroK8s is running or not by using:

```plaintext
microk8s status --wait-ready
```

![](/img/blog/speeding-up-using-microk8s/89483fc8-73a7-4615-a52b-7c384edf2a10.png align="center")

![](/img/blog/speeding-up-using-microk8s/0df921ed-bf09-4acd-9687-94d5c7de4b73.png align="center")

As we see, Microk8s is running in both VMs.

To add the node to this cluster, we have to run the following command in the VM we want to end the node to:

```plaintext
microk8s add-node
```

After getting the output of the form:

![](/img/blog/speeding-up-using-microk8s/8bc8e174-c9ef-4c29-a1c6-a99f35668a6f.png align="center")

Copy and paste "microk8s join....." as per your choice in the second VM and it will be added to the initial VM completing the multi-node setup.

For example, here I ran "microk8s add-node" in Blog VM where I wanted the multi-node setup and copied the below-given command in the output of the terminal. Pasted the command in the Blog-end VM to connect it with the initial VM.

![](/img/blog/speeding-up-using-microk8s/180733dd-b714-4381-8882-6699cff3f1c2.png align="center")

If you get the above error it is because your initial node is not able to recognize the IP address of the node to be added. To resolve this error you have to manually add the IP address of the second node to the initial node by pasting the IP address followed by the node name in the "/etc/hosts" of your initial VM.

In my example, the IP address of my Blog-end VM is **192.168.64.28**  
So I will just add the below line in the "/etc/hosts" file of my Blog VM:

> 192.168.64.28 Blog-end

Get a new microk8s join link by again running "microk8s add-node" in the initial VM and paste it into the VM whose node is to be added.

![](/img/blog/speeding-up-using-microk8s/1d6d1687-d7f1-466a-94c6-6ddba296806a.png align="center")

And finally, check the number of nodes by running:

```plaintext
microk8s kubectl get nodes
```

![](/img/blog/speeding-up-using-microk8s/02fcaf0e-b0cd-4dda-8cb2-7fff4bc6bfed.png align="center")

# Resources

* [**MicroK8s**](https://microk8s.io/)
    
* [**Video Explanation**](https://www.youtube.com/watch?v=wN6FlmPy2qA&t=1092s)
    

# **Conclusion**

In this article, we learned about MicroK8s. There you are at the end of this blog post, I hope this blog helps you understand the use of MicroK8s. Don't forget to like and share this post if you liked this blog. Connect with me on [**Twitter**](https://twitter.com/SuperAayush14) and [**LinkedIn**](https://www.linkedin.com/in/superaayush/). Follow me for more such blogs.

**THANKS FOR READING 😄📖!!**

**#LEARNINPUBLIC** **#LEARNWHILEDOING**

[**Aayush Sharma 👨🏻‍💻**](https://superaayush.github.io/Portfolio/)

Follow Kubesimplify on [**Hashnode**](https://kubesimplify.com/), [**Twitter**](https://twitter.com/kubesimplify)**,** and [**LinkedIn**](https://www.linkedin.com/company/kubesimplify/). Join our [**Discord**](https://blog.kubesimplify.com/kubesimplify.com/discord) server to learn with us.