---
title: "How to Install a Kubernetes Cluster with Kubeadm, Containerd, and Cilium: A Hands-On Guide"
seoTitle: "Install a Kubernetes Cluster with Kubeadm, Containerd, and Cilium"
seoDescription: "cilium for kubeadm cluster"
datePublished: 2023-03-07T12:30:39.047Z
slug: how-to-install-a-kubernetes-cluster-with-kubeadm-containerd-and-cilium-a-hands-on-guide
author: santoshdts
cover: /img/blog/how-to-install-a-kubernetes-cluster-with-kubeadm-containerd-and-cilium-a-hands-on-guide/2236917246b97f20bba5656f43c6c337.jpeg
tags: ["kubernetes", "devops", "containers", "cilium", "kubeadm"]
cuid: cley8bv1e02z1mvnv3rv001h4
---
There are many ways to create a self-managed Kubernetes Cluster like [Kind](https://kind.sigs.k8s.io/), [Minikube](https://minikube.sigs.k8s.io/docs/), etc. Apart from these, there are many ways we can create managed Kubernetes clusters on cloud providers of our choice. The self-managed clusters created by the above tools are suitable for testing our workloads and integrations. Given the complexity, the kubeadm is not the most popular choice for creating a production-grade on-premise cluster. However, creating a cluster using Kubeadm can help in understanding the various components and configurations.

[Kubeadm](https://kubernetes.io/docs/reference/setup-tools/kubeadm/#:~:text=Kubeadm%20is%20a%20tool%20built,bootstrapping%2C%20not%20about%20provisioning%20machines.) is a tool that is used to bootstrap a Kubernetes cluster from scratch. It provides a way to create a fully functional, production-ready Kubernetes cluster by following a set of well-defined steps. Kubeadm is highly customizable, and it allows users to configure different aspects of the cluster, such as the network configuration, the container runtime, and the authentication and authorization policies. Kubeadm is a good choice for learning Kubernetes because it provides a more realistic simulation of a production environment and allows users to practice the cluster setup and configuration.

In this post, we shall walk through a hands-on demo of installing a two-node Kubernetes Cluster of version 1.26.0 built using the Kubeadm tool with ContainerD as a Container Runtime and Cilium as a CNI plugin.

Let's start with getting ready with our two nodes, which shall be virtual machines provisioned using VirtualBox and Vagrant. We will configure the VMs with SSH keys to enable communication between both VMs. Once we are ready with the VMs provisioned. We will start with configuring the nodes with the prerequisites like updating the packages, turning off the `swap memory`, etc.

We'll start with updating and upgrading the apt packages on both Nodes:

```bash
$ apt-get update && apt-get upgrade -y
```

> If required escalate the privileges by using the sudo privileges

Install the Kubernetes Packages using the apt repository:

`sudo apt-get install -y apt-transport-https ca-certificates curl`

Download the Google Cloud public signing key:

curl -fsSL [https://packages.cloud.google.com/apt/doc/apt-key.gpg](https://packages.cloud.google.com/apt/doc/apt-key.gpg) | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-archive-keyring.gpg

If you get an error like:

```bash
curl: (23) Failed writing body (0 != 1210)
```

This indicates the `/etc/apt/keyrings` directory does not exist. we need to create this specific directory to download the Google Cloud public signing keys.

Add the Kubernetes apt repository:

`echo "deb [signed-by=/etc/apt/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list`

Update the `apt` packages and install `kubeadm`, `kubectl`, and `kubelet` packages from the apt package:

```bash
sudo apt-get install -y kubelet=1.26.0-00 kubeadm=1.26.0-00 kubectl=1.26.0-00
```

In the above snippet, we will be installing a specific version opf the tools i.e. `v1.26.0`.

We need to place a hold on the above-installed packages for any accidental upgrades: `sudo apt-mark hold kubelet kubeadm kubectl`

> We need to repeat all the above processes on the kubenode01 as well. We can choose if we need the `kubectl` tool available on the worker node.

Once, the above steps are performed on both the ControlPlane and Worker Node. We need to perform a very important configuration on both nodes. **Disabling swap memory, enabling a couple of Kernel Modules, and updating the Settings in sysctl**.

First, we need to [disable the swap](https://github.com/kubernetes/kubernetes/issues/53533) for the kubelet to work properly, we'll do it by first checking for the `/etc/fstab` and look for a line:

`/swap.img none swap sw 0 0`

If this line is available in the `fstab` file, we can disable this setting by commenting it out. Instead of rebooting our nodes, we can apply the following command to disable the swap `sudo swapoff -a`.

Once the swap is disabled, we need to enable two kernel modules, `overlay` and `br_netfilter`:

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
```

`sudo modprobe overlay`

`sudo modprobe br_netfilter`

```bash
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
```

Now, we should see the config file as below:

```bash
cat /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
```

Once the file is saved, we must reload the `sysctl`:

`sudo sysctl --system`

In the next step, we shall move ahead and install Containerd as CRI and Cilium as a CNI addon.

## Installing ContainerD

With the [depreciation of Docker](https://kodekloud.com/blog/kubernetes-removed-docker-what-happens-now/) for Kubernetes since v1.25.0, [Containerd](https://www.docker.com/blog/what-is-containerd-runtime/) is one of the preferred choices of the Ops team. Containerd is a Container-Runtime developed by Docker that manages the container lifecycle. In February 2019, Containerd became an official project within the Cloud Native Computing Foundation (CNCF).

While there are multiple ways to install Containerd, we shall be using the method of installing it using the `apt` package. The Containerd runtime needs to be installed on both nodes. The first thing to do is to enable iptables Bridged Traffic on all the Nodes and to configure the persistent loading of the necessary Containerd modules by using the following commands:

```bash
sudo tee /etc/modules-load.d/containerd.conf << EOF
overlay
br_netfilter
EOF
```

Reload the sysctl configurations with `sudo sysctl --system` command.

Install the necessary dependencies with the following command:

`sudo apt install curl gnupg2 software-properties-common apt-transport-https ca-certificates -y`

Now, we need to add the GPG keys with `curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -` command.

Adding the repository with `sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"` command.

Now, we are ready to install the Containerd package through the `apt` package manager using the following command:

```bash
sudo apt update
sudo apt install containerd.io -y
```

Once, we have successfully installed the Containerd. We need to load the Containerd configurations, for this, we might need to gain access to `sudo` privileges `sudo -i`:

```bash
mkdir -p /etc/containerd
containerd config default>/etc/containerd/config.toml
```

Now, restart the Containerd systemd service and enable it:

```bash
systemctl restart containerd
systemctl enable containerd
```

By now, we have installed Containerd as a CRI installed on both of our nodes. Now, we need to configure the Kubernetes cluster with `kubeadm` tool and install the CNI plugin of our choice.

## Configure Kubernetes Controlplane

Once, the CRI is installed successfully on both nodes, we are now ready to configure our Kubernetes Controlplane. We need to perform the following actions on the ControlPlane node we identified earlier.

```bash
$ kubeadm init --pod-network-cidr=10.1.1.0/24 --apiserver-advertise-address <IP address of the Master node>
```

> The kubeadm init command expects mainly two arguments among others. the --pod-network-cidr and --apiserver-advertise-address. The --pod-network-cidr enables inter-pod networking which we will install using Cilium and the cidr range for cilium is `10.1.1.0/24`. The --apiserver-advertise-address is the one we need to carefully assign the IP address of the Controlplane nodes API Server. We can get the IP address by using `ifconfig` or `ip a` command.

This command will configure and bootstrap the controlplane node by installing all necessary components and provide an output with a `kubeadm join` command and other settings required.

For example:

```bash
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

You should now deploy a Pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  /docs/concepts/cluster-administration/addons/

You can now join any number of machines by running the following on each node
as root:

kubeadm join 192.168.56.11:6443 --token 1gehfl.g3n31uj4cmvnzxug --discovery-token-ca-cert-hash sha256:17a0b8da44fe941c2c00808928a6bbce54d1e7b42d77c865b3e619192949856f
```

In case we miss this join command with the token, we can create a new token with the following command to be used on the Worker node:

```bash
vagrant@kubemaster:~$ kubeadm token create --print-join-command
kubeadm join 192.168.56.11:6443 --token 1gehfl.g3n31uj4cmvnzxug --discovery-token-ca-cert-hash sha256:17a0b8da44fe941c2c00808928a6bbce54d1e7b42d77c865b3e619192949856f
```

We need to copy this `kubeadm join` command and apply this to our `kubenode01` worker node to join the cluster. Once we have applied this `join` command. We need to return to the Controlplane and configure the `kubeconfig` required for authentication to the API server.

We do this by creating a directory to place the cluster details, contexts, and credentials in the `mkdir -p $HOME/.kube` directory by coping the following:

```bash
$ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Once this is configured, our cluster should be almost up. We can check this by using the `kubectl get nodes` command:

```bash
vagrant@kubemaster:~$ kubectl get nodes
NAME         STATUS     ROLES           AGE     VERSION
kubemaster   NotReady   control-plane   3m59s   v1.26.0
kubenode01   NotReady   <none>          8s      v1.26.0
```

We can see the Nodes are in a **NotReady** state, this is because we have not yet implemented the [Pod Networking CNI plugin](https://github.com/containernetworking/cni#3rd-party-plugins) yet. For this experiment, we shall be using [**Cilium**](https://kubernetes.io/docs/tasks/administer-cluster/network-policy-provider/cilium-network-policy/) as our networking solution.

We first download the Cilium binaries by using `curl -LO https://github.com/cilium/cilium-cli/releases/latest/download/cilium-linux-amd64.tar.gz` command. Then extract the downloaded file to your /usr/local/bin directory with the following command:

```bash
sudo tar xzvfC cilium-linux-amd64.tar.gz /usr/local/bin
rm cilium-linux-amd64.tar.gz
```

After running the above commands, you can now install Cilium with the following command: `cilium install`. Once the cilium is installed, we can check the status of the Cilium by using the `cilium status` command to confirm that the cilium is correctly installed. Once the Cilium addon is installed, we should see the Pod networking enabled and our nodes in the **Ready** state:

```bash
✅ Cilium was successfully installed! Run 'cilium status' to view installation health
$ vagrant@kubemaster:~$ kubectl get nodes
NAME         STATUS     ROLES           AGE     VERSION
$ kubemaster   NotReady   control-plane   12m     v1.26.0
kubenode01   Ready      <none>          8m17s   v1.26.0
$ vagrant@kubemaster:~$ kubectl get nodes
NAME         STATUS   ROLES           AGE     VERSION
kubemaster   Ready    control-plane   12m     v1.26.0
kubenode01   Ready    <none>          8m23s   v1.26.0
```

And all the components are successfully installed, up and running:

```bash
$ vagrant@kubemaster:~$ k get po -n kube-system
NAME                                 READY   STATUS    RESTARTS   AGE
cilium-kmvs6                         1/1     Running   0          13m50s
cilium-operator-5c594d7766-n88bm     1/1     Running   0          13m50s
cilium-vnj4v                         1/1     Running   0          13m50s
coredns-787d4945fb-p64dv             1/1     Running   0          18m41s
coredns-787d4945fb-tklwr             1/1     Running   0          18m41s
etcd-kubemaster                      1/1     Running   0          18m54s
kube-apiserver-kubemaster            1/1     Running   0          18m56s
kube-controller-manager-kubemaster   1/1     Running   0          18m54s
kube-proxy-9km94                     1/1     Running   0          17m55s
kube-proxy-xrfr7                     1/1     Running   0          18m41s
kube-scheduler-kubemaster            1/1     Running   0          18m54s
```

This looks great!!

Let's try and run a test workload on our cluster:

```bash
$ vagrant@kubemaster:~$ k run busybox --image busybox -- sleep 1d
pod/busybox created
$ vagrant@kubemaster:~$ k get po busybox 
NAME      READY   STATUS              RESTARTS   AGE
busybox   0/1     ContainerCreating   0          9s
$ vagrant@kubemaster:~$ k get po busybox 
NAME      READY   STATUS    RESTARTS   AGE
busybox   1/1     Running   0          13s
$ vagrant@kubemaster:~$ k get po busybox -owide
NAME      READY   STATUS    RESTARTS   AGE   IP         NODE         NOMINATED NODE   READINESS GATES
busybox   1/1     Running   0          24s   10.0.1.8   kubenode01   <none>           <none>
```

And, our pod is created successfully and has been scheduled on the `kubenode01` worker node.

Congratulations, we have successfully created a two-node Kubernetes cluster with the help of the kubeadm tool and Containerd as CRI and Cilium as CNI plugin for our learning and development purposes. Now, we can play with this cluster and learn more in-depth about interacting with a production-grade on-premise cluster enabled with advanced eBPF-based networking and observability capabilities — Cilium and `crictl` as a command line tool to interact with the containers on the cluster.

---

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.