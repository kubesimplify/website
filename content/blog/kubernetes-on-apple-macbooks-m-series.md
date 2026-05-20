---
title: "Kubernetes on Apple MacBooks (M Series)"
seoTitle: "Run Kubernetes on Apple Macbooks (M Series) Using kubeadm"
seoDescription: "This article is a step-by-step walkthrough on how to install a Kubernetes cluster on a MacBook (M series) laptop using the kubeadm tool."
datePublished: 2024-04-01T11:30:31.176Z
slug: kubernetes-on-apple-macbooks-m-series
author: aditya-samant
cover: /img/blog/kubernetes-on-apple-macbooks-m-series/960757a5-4898-4be9-9e32-8c32c6ac6779.png
tags: ["macbook", "kubernetes", "multipass", "kubeadm"]
cuid: clugvclu0000808lad8x4etw1
---
There are many options to provision a local Kubernetes cluster on your laptop. The most popular ones are [minikube](https://minikube.sigs.k8s.io/docs/start/), [kind](https://kind.sigs.k8s.io/), [K3s](https://k3s.io/) and [MicroK8s](https://microk8s.io/). These options provide a simple and fast way to get Kubernetes running on your laptop by abstracting the complexities within the Kubernetes control plane.

[Kubeadm](https://kubernetes.io/docs/reference/setup-tools/kubeadm/) is a tool that facilitates provisioning Kubernetes clusters on virtual machines. It can provision a multi-node Kubernetes cluster for development or production purposes. It can provision clusters on your local laptop, on-premise cloud or public cloud. A cluster provisioned by `kubeadm` is a great way for Kubernetes administrators to have a playground to work with. It is also useful for people pursuing the [CKA](https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/) and [CKS](https://training.linuxfoundation.org/certification/certified-kubernetes-security-specialist/) certifications to practice tasks like cluster upgrade and troubleshooting.

[VirtualBox](https://www.virtualbox.org/) is by far the most popular tool to spin up virtual machines (VMs) on a personal laptop. VirtualBox supports virtualization for x86 and AMD64 CPU architectures.

In 2020, Apple introduced the M series of MacBooks which use the Apple Silicon chip, based on ARM64 CPU architecture. VirtualBox does not have good support for machines based on ARM64 (a developer preview version exists, which cannot be relied on). As the M series MacBooks have gained popularity, it is important to look for an alternative virtualization tool that is tested and certified for ARM64. Enter [`Multipass`](https://multipass.run/) by Canonical, a simple virtualization tool that is fully compatible with ARM64 based machines.

This article is a step-by-step walkthrough on how to install a Kubernetes cluster on a MacBook (M series) laptop using the `kubeadm` tool. It is a simplification of the steps in the official [Kubernetes documentation](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm).

## Pre-requisites

* A MacBook laptop (M series) with minimum 16 GB RAM (recommended).
    
* [`Multipass`](https://multipass.run/) by Canonical should be installed as per the [instructions](https://multipass.run/install) for macOS. After installation, verify that you are able to launch a sample Ubuntu instance. Cleanup the instance after verification.
    
* Your account on your MacBook must have admin privileges and be able to use `sudo`.
    

## Provision the VMs

We will create 3 VMs for our setup as follows:

* `kubemaster`: The controlplane node
    
* `kubeworker01`: The first worker node
    
* `kubeworker02`: The second worker node
    

Each VM will have the following configuration (you can choose to edit it as per your host machine capacity)

* Disk space: 10G
    
* Memory 3G
    
* CPUs 2
    

<div data-node-type="callout">
<div data-node-type="callout-emoji">💡</div>
<div data-node-type="callout-text">In <code>Multipass</code>, by default, the IP address allocated to a VM is subject to change after a reboot of the VM. If IP addresses change over reboots, it breaks the Kubernetes cluster. As such, it is imperative that the VMs are provisioned with a static IP address as documented <a target="_blank" rel="noopener noreferrer nofollow" href="https://multipass.run/docs/configure-static-ips" style="pointer-events: none">here</a>.</div>
</div>

### Provisioning the controlplane instance (`kubemaster`)

**Launch the**`kubemaster` instance with a manual network

<div data-node-type="callout">
<div data-node-type="callout-emoji">🗒</div>
<div data-node-type="callout-text">The values to the <code>--network</code> option need to be passed carefully.</div>
</div>

<div data-node-type="callout">
<div data-node-type="callout-emoji">🗒</div>
<div data-node-type="callout-text"><code>name=en0</code>: This is the name of the Wi-Fi network on your host machine. To get a list of possible values, use the command <code>multipass networks</code>. <code>mac="52:54:00:4b:ab:cd"</code>: A unique and random MAC address that will be allocated to the instance.</div>
</div>

```plaintext
multipass launch --disk 10G --memory 3G --cpus 2 --name kubemaster --network name=en0,mode=manual,mac="52:54:00:4b:ab:cd" jammy
```

You should see the following output:

```plaintext
Launched: kubemaster
```

**Configure the extra interface**

> The `macaddress` field should contain the exact MAC address chosen in the `multipass launch` command.  
> The `addresses` field should contain the static IP address that will be allocated to this VM. The static IP address should be in the same subnet as the original IP address of the instance.  
> The original IP address allocated to the VM can be found by the `multipass info kubemaster` command as shown below:
> 
> ```plaintext
> multipass info kubemaster | grep IPv4
> ```
> 
> You should see an output similar to:  
> IPv4: 192.168.73.7  
> In this example, the original IP address of the instance is 192.168.73.7. So the static IP address can be chosen as 192.168.73.101

**Execute the command shown below**

```yaml
multipass exec -n kubemaster -- sudo bash -c 'cat << EOF > /etc/netplan/10-custom.yaml
network:
  version: 2
  ethernets:
    extra0:
      dhcp4: no
      match:
        macaddress: "52:54:00:4b:ab:cd"
      addresses: [192.168.73.101/24]
EOF'
```

**Apply the new configuration**

```console
multipass exec -n kubemaster -- sudo netplan apply
```

<div data-node-type="callout">
<div data-node-type="callout-emoji">🗒</div>
<div data-node-type="callout-text">In case you receive a warning stating that the permissions are too open, please ignore it.</div>
</div>

**Confirm that it works**

```plaintext
multipass info kubemaster | grep IPv4 -A1
```

You should see an output displaying both the original IP address and the static IP address:

```plaintext
IPv4:           192.168.73.7
                192.168.73.101
```

Let's test the network connectivity using the ping command:  
Example:  
Original IP of the instance: 192.168.73.7  
Static IP of the instance: 192.168.73.101  
IP of the host laptop: 192.168.0.2

All the commands below should return a successful output:

```plaintext
# Ping from local to the original IP address of kubemaster
ping 192.168.73.7

# Ping from local to the static IP address of kubemaster
ping 192.168.73.101

# Ping from kubemaster to local
multipass exec -n kubemaster -- ping 192.168.0.2
```

### Provisioning the first worker node (`kubeworker01`)

<div data-node-type="callout">
<div data-node-type="callout-emoji">❗</div>
<div data-node-type="callout-text">The MAC address and static IP address chosen must be different from the ones allocated to the <code>kubemaster</code> instance.</div>
</div>

**Launch the**`kubeworker01` instance with a manual network

```plaintext
multipass launch --disk 10G --memory 3G --cpus 2 --name kubeworker01 --network name=en0,mode=manual,mac="52:54:00:4b:ba:dc" jammy
```

**Configure the extra interface, similar to the steps performed for**`kubemaster`

```yaml
multipass exec -n kubeworker01 -- sudo bash -c 'cat << EOF > /etc/netplan/10-custom.yaml
network:
  version: 2
  ethernets:
    extra0:
      dhcp4: no
      match:
        macaddress: "52:54:00:4b:ba:dc"
      addresses: [192.168.73.102/24]
EOF'
```

**Apply the new configuration**

```console
multipass exec -n kubeworker01 -- sudo netplan apply
```

Test using `ping` similar to the steps followed for `kubemaster`.  
Additionally, test that `ping` from `kubemaster` to `kubeworker01` and vice versa is working.

```plaintext
# Ping from local to the original IP address of kubeworker01
ping 192.168.73.8

# Ping from local to the static IP address of kubeworker01
ping 192.168.73.102

# Ping from kubeworker01 to local
multipass exec -n kubeworker01 -- ping 192.168.0.2

# Ping from kubeworker01 to kubemaster
multipass exec -n kubeworker01 -- ping 192.168.73.101

# Ping from kubemaster to kubeworker01
multipass exec -n kubemaster -- ping 192.168.73.102
```

### Provisioning the second worker node (`kubeworker02`)

<div data-node-type="callout">
<div data-node-type="callout-emoji">❗</div>
<div data-node-type="callout-text">The MAC address and static IP address chosen must be different from the ones allocated to the <code>kubemaster</code> and <code>kubeworker01</code> instances.</div>
</div>

**Launch the**`kubeworker02` instance with a manual network

```plaintext
multipass launch --disk 10G --memory 3G --cpus 2 --name kubeworker02 --network name=en0,mode=manual,mac="52:54:00:4b:cd:ab" jammy
```

**Configure the extra interface, similar to the steps performed for**`kubemaster`

```yaml
multipass exec -n kubeworker02 -- sudo bash -c 'cat << EOF > /etc/netplan/10-custom.yaml
network:
  version: 2
  ethernets:
    extra0:
      dhcp4: no
      match:
        macaddress: "52:54:00:4b:cd:ab"
      addresses: [192.168.73.103/24]
EOF'
```

**Apply the new configuration**

```console
multipass exec -n kubeworker02 -- sudo netplan apply
```

Test using `ping` similar to the steps followed for `kubemaster`.

Additionally, test that all 3 VMs are able to ping each other successfully through their static IPs.

```plaintext
# Ping from local to the original IP address of kubeworker02
ping 192.168.73.9

# Ping from local to the static IP address of kubeworker02
ping 192.168.73.103

# Ping from kubeworker02 to local
multipass exec -n kubeworker02 -- ping 192.168.0.2

# Ping from kubeworker02 to kubemaster
multipass exec -n kubeworker02 -- ping 192.168.73.101

# Ping from kubeworker02 to kubeworker01
multipass exec -n kubeworker02 -- ping 192.168.73.102

# Ping from kubemaster to kubeworker02
multipass exec -n kubemaster -- ping 192.168.73.103

# Ping from kubeworker01 to kubeworker02
multipass exec -n kubeworker01 -- ping 192.168.73.103
```

### Configure the local DNS

**SSH into the machines through three separate terminal tabs by using the**`multipass shell` command

```plaintext
multipass shell kubemaster
multipass shell kubeworker01
multipass shell kubeworker02
```

**Edit the**`/etc/hosts` file for all 3 VMs

Enter the following configuration in the `/etc/hosts` file of each VM:

<div data-node-type="callout">
<div data-node-type="callout-emoji">🗒</div>
<div data-node-type="callout-text">Use the static IP addresses chosen for each VM instance.</div>
</div>

```shell
sudo vi /etc/hosts
```

```plaintext
#<static IP> <hostname>
192.168.73.101 kubemaster
192.168.73.102 kubeworker01
192.168.73.103 kubeworker02
```

## Install Kubernetes

Now that we have a perfect set of VMs up and running, it is time to proceed toward the Kubernetes installation.

### Versions

The below versions are used in this lab.

| Software / Package | Version | Location |
| --- | --- | --- |
| `containerd` | 1.7.14 | [releases](https://github.com/containerd/containerd/releases) |
| `runc` | 1.1.12 | [releases](https://github.com/opencontainers/runc/releases) |
| CNI plugin | 1.4.1 | [releases](https://github.com/containernetworking/plugins/releases) |
| kubeadm | 1.29.3 | apt-get |
| kubelet | 1.29.3 | apt-get |
| kubectl | 1.29.3 | apt-get |

<div data-node-type="callout">
<div data-node-type="callout-emoji">🗒</div>
<div data-node-type="callout-text">All commands mentioned below need to be executed from within the terminal of the VMs.</div>
</div>

### Install and configure prerequisites

#### Forwarding IPv4 and letting iptables see bridged traffic

**Execute the below set of commands on**`kubemaster`, `kubeworker01` and `kubeworker02`

```plaintext
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

# sysctl params required by setup, params persist across reboots
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

# Apply sysctl params without reboot
sudo sysctl --system

# Verify that the br_netfilter, overlay modules are loaded by running the following commands:
lsmod | grep br_netfilter
lsmod | grep overlay

#Verify that the net.bridge.bridge-nf-call-iptables, net.bridge.bridge-nf-call-ip6tables, and net.ipv4.ip_forward system variables are set to 1 in your sysctl config by running the following command:
sysctl net.bridge.bridge-nf-call-iptables net.bridge.bridge-nf-call-ip6tables net.ipv4.ip_forward
```

Verify that the `net.bridge.bridge-nf-call-iptables`, `net.bridge.bridge-nf-call-ip6tables`, and `net.ipv4.ip_forward` system variables are set to 1 in your sysctl config.

```plaintext
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward = 1
```

<div data-node-type="callout">
<div data-node-type="callout-emoji">🗒</div>
<div data-node-type="callout-text">For all the packages to be installed in this tutorial, ensure to use the <strong>arm64</strong> variant only.</div>
</div>

### Install a Container Runtime

You need to install a container runtime into each node in the cluster so that Pods can run there.

#### Step 1: Install `containerd`

**Execute the below commands on all 3 nodes**

```plaintext
curl -LO https://github.com/containerd/containerd/releases/download/v1.7.14/containerd-1.7.14-linux-arm64.tar.gz

sudo tar Cxzvf /usr/local containerd-1.7.14-linux-arm64.tar.gz

curl -LO https://raw.githubusercontent.com/containerd/containerd/main/containerd.service

sudo mkdir -p /usr/local/lib/systemd/system/
sudo mv containerd.service /usr/local/lib/systemd/system/

sudo mkdir -p /etc/containerd/
sudo containerd config default | sudo tee /etc/containerd/config.toml > /dev/null

sudo sed -i 's/SystemdCgroup \= false/SystemdCgroup \= true/g' /etc/containerd/config.toml

sudo systemctl daemon-reload
sudo systemctl enable --now containerd

#Check that containerd service is up and running
systemctl status containerd
```

Verify that the output shows the `containerd` service up and running:

```plaintext
● containerd.service - containerd container runtime
     Loaded: loaded (/usr/local/lib/systemd/system/containerd.service; enabled; vendor preset: enabled)
     Active: active (running) since Tue 2024-03-26 11:15:20 IST; 5ms ago
```

#### Step 2: Install `runc`

**Execute the below commands on all 3 nodes**

```plaintext
curl -LO https://github.com/opencontainers/runc/releases/download/v1.1.12/runc.arm64

sudo install -m 755 runc.arm64 /usr/local/sbin/runc
```

#### Step 3: Install CNI plugins

**Execute the below commands on all 3 nodes**

```plaintext
curl -LO https://github.com/containernetworking/plugins/releases/download/v1.4.1/cni-plugins-linux-arm64-v1.4.1.tgz
sudo mkdir -p /opt/cni/bin
sudo tar Cxzvf /opt/cni/bin cni-plugins-linux-arm64-v1.4.1.tgz
```

### Install kubeadm, kubelet and kubectl

**Execute the below commands on all 3 nodes**

```plaintext
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gpg
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

Verify the installation using the below commands:

```shell
kubeadm version
```

```plaintext
kubeadm version: &version.Info{Major:"1", Minor:"29", GitVersion:"v1.29.3", GitCommit:"6813625b7cd706db5bc7388921be03071e1a492d", GitTreeState:"clean", BuildDate:"2024-03-15T00:06:16Z", GoVersion:"go1.21.8", Compiler:"gc", Platform:"linux/arm64"}
```

```shell
kubelet --version
```

```plaintext
Kubernetes v1.29.3
```

```shell
kubectl version --client
```

```plaintext
Client Version: v1.29.3
Kustomize Version: v5.0.4-0.20230601165947-6ce0bf390ce3
```

### Configure `crictl` to work with `containerd`

**Execute the below commands on all 3 nodes**

```plaintext
sudo crictl config runtime-endpoint unix:///var/run/containerd/containerd.sock
```

### Initializing the controlplane node

<div data-node-type="callout">
<div data-node-type="callout-emoji">❗</div>
<div data-node-type="callout-text">Commands for initializing the controlplane node should be executed on <code>kubemaster</code> only.</div>
</div>

**Execute the below command on**`kubemaster`

<div data-node-type="callout">
<div data-node-type="callout-emoji">❗</div>
<div data-node-type="callout-text"><code>apiserver-advertise-address</code> must be the exact value of the static IP allocated to <code>kubemaster</code>.</div>
</div>

```plaintext
sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-advertise-address=192.168.73.101
```

If the command runs successfully, you should see the message **'Your Kubernetes control-plane has initialized successfully!'**

<div data-node-type="callout">
<div data-node-type="callout-emoji">💡</div>
<div data-node-type="callout-text">Save the entire <strong>kubeadm join</strong> command, which is printed on the output. This will be used when the worker nodes are ready to be connected to the cluster.</div>
</div>

To make `kubectl` work for your non-root user, execute the below command on `kubemaster`:

```console
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Verify that you are able to reach the cluster through `kubectl`:

**Execute the below command on**`kubemaster`

```plaintext
kubectl -n kube-system get pods
```

<div data-node-type="callout">
<div data-node-type="callout-emoji">🗒</div>
<div data-node-type="callout-text">The <code>coredns</code> pods will not be Ready at this stage. This is as expected, as we have not deployed the Pod network add-on yet.</div>
</div>

```plaintext
NAME                                 READY   STATUS    RESTARTS      AGE
coredns-76f75df574-269qf             1/1     Pending                
coredns-76f75df574-6mcvd             1/1     Pending                
etcd-kubemaster                      1/1     Running   0             1m1s
kube-apiserver-kubemaster            1/1     Running   0             1m1s
kube-controller-manager-kubemaster   1/1     Running   0             1m1s
kube-proxy-7qfgq                     1/1     Running   0             1m1s
kube-scheduler-kubemaster            1/1     Running   0             1m1s
```

### Install a Pod network add-on

You must deploy a Container Network Interface (CNI) based Pod network add-on so that your Pods can communicate with each other. Cluster DNS (CoreDNS) will not start up before a network is installed.

A list of all compatible Pod network add-ons can be found [here](https://kubernetes.io/docs/concepts/cluster-administration/addons/#networking-and-network-policy).

In this lab, we will use [Weave Net](https://github.com/rajch/weave#using-weave-on-kubernetes)

**Execute the below command on**`kubemaster`

```plaintext
kubectl apply -f https://reweave.azurewebsites.net/k8s/v1.28/net.yaml
```

It will take up to a minute for the weave pod to be ready.

<div data-node-type="callout">
<div data-node-type="callout-emoji">❗</div>
<div data-node-type="callout-text">At this point, the controlplane node should be ready with all pods in the <code>kube-system</code> namespace up and running. Please validate this to confirm the sanity of the controlplane.</div>
</div>

```shell
kubectl -n kube-system get pods
```

```plaintext
NAME                                 READY   STATUS    RESTARTS      AGE
coredns-76f75df574-269qf             1/1     Running   0             3m16s
coredns-76f75df574-6mcvd             1/1     Running   0             3m16s
etcd-kubemaster                      1/1     Running   0             3m32s
kube-apiserver-kubemaster            1/1     Running   0             3m32s
kube-controller-manager-kubemaster   1/1     Running   0             3m32s
kube-proxy-7qfgq                     1/1     Running   0             3m16s
kube-scheduler-kubemaster            1/1     Running   0             3m33s
weave-net-mvld4                      2/2     Running   1 (23s ago)   40s
```

### Join the worker nodes to the cluster

Connect to each worker node and run the entire `kubeadm join` command that was copied earlier from the output of the `kubeadm init` command.

**Sample command to be executed on**`kubeworker01` and `kubeworker02`

```plaintext
sudo kubeadm join 192.168.73.101:6443 --token tn082a..... \
--discovery-token-ca-cert-hash sha256:c1b0143a.....
```

<div data-node-type="callout">
<div data-node-type="callout-emoji">💡</div>
<div data-node-type="callout-text">If you missed making a note of the kubeadm join command earlier, you can generate a new token by using the below command on the controlplane and use it instead.</div>
</div>

```console
kubeadm token create --print-join-command
```

After a few seconds, check that all nodes have joined the cluster and are in a Ready state.

**Execute the below command on**`kubemaster`

```console
kubectl get nodes
```

### Validation

Validate that the Kubernetes setup is working correctly by deploying a nginx pod on the cluster.

**Execute the below command on**`kubemaster`

```shell
kubectl run test-nginx --image=nginx
```

```shell
kubectl get pod test-nginx
```

```plaintext
NAME         READY   STATUS    RESTARTS   AGE
test-nginx   1/1     Running   0          47s
```

Once the pod is in a Ready state, then it's time to say **Congratulations!** You've just built a fully functioning 3 node Kubernetes cluster on a M series MacBook.

## Backup and Restore

`Multipass` offers an easy and effective way to take a backup of the controlplane and worker nodes. Using this backup, a corrupt Kubernetes cluster can be restored to a previous working state.

### Backup

In order to perform a backup, use the snapshot feature offered by `multipass`.

**Execute the below commands on a local terminal**

**Stop the VMs**

```shell
multipass stop kubeworker02
multipass stop kubeworker01
multipass stop kubemaster
```

**Verify that the VMs are stopped**

```shell
multipass list
```

```plaintext
Name                    State             IPv4             Image
kubemaster              Stopped           --               Ubuntu 22.04 LTS
kubeworker01            Stopped           --               Ubuntu 22.04 LTS
kubeworker02            Stopped           --               Ubuntu 22.04 LTS
```

**Capture a snapshot**

```shell
multipass snapshot kubemaster
multipass snapshot kubeworker01
multipass snapshot kubeworker02
```

**Verify that the snapshots are present**

```shell
multipass list --snapshots
```

```console
Instance       Snapshot    Parent   Comment
kubemaster     snapshot1   --       --
kubeworker01   snapshot1   --       --
kubeworker02   snapshot1   --       --
```

### Restore

In order to restore from a backup, use the `restore` command

<div data-node-type="callout">
<div data-node-type="callout-emoji">💡</div>
<div data-node-type="callout-text">Substitute <code>x</code> with the number of the snapshot.</div>
</div>

```shell
multipass restore kubemaster.snapshotx
multipass restore kubeworker01.snapshotx
multipass restore kubeworker02.snapshotx
```

## Cleanup

In order to clean up the cluster, delete the `multipass` VMs using the below commands:

The `delete` command performs a soft deletion of the VMs. In other words, it moved the VMs to the recycle bin.

```shell
multipass delete kubeworker02
multipass delete kubeworker01
multipass delete kubemaster
```

Verify the deletion using the following command:

```shell
multipass list
```

```plaintext
Name                    State             IPv4             Image
kubemaster              Deleted           --               Ubuntu 22.04 LTS
kubeworker01            Deleted           --               Ubuntu 22.04 LTS
kubeworker02            Deleted           --               Ubuntu 22.04 LTS
```

In order to recover the deleted clusters, use the `recover` command:

```shell
multipass recover kubemaster
multipass recover kubeworker01
multipass recover kubeworker02
```

In order to permanently delete the VMs, the `delete` command should be followed by the `purge` command:

```shell
multipass delete kubeworker02
multipass delete kubeworker01
multipass delete kubemaster
multipass purge
```

<div data-node-type="callout">
<div data-node-type="callout-emoji">⚠</div>
<div data-node-type="callout-text">Purging an instance also deletes all the snapshots associated with this instance. In other words, the VMs cannot be recovered after being purged.</div>
</div>

## Resources

Here are the links to the resources referred in this blog post:

* [Kubeadm](https://kubernetes.io/docs/reference/setup-tools/kubeadm/) - Page describing the `kubeadm` tool in the official Kubernetes documentation.
    
* [Installing Kubernetes via kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/) - The official Kubernetes documentation describing the steps involved in installing a cluster through `kubeadm`.
    
* [Multipass overview](https://multipass.run/) - An overview of `multipass` by Canonical, a tool to provision Ubuntu VMs on local machines.
    
* [Multipass installation](https://multipass.run/install) - Steps to install the `multipass` tool.
    
* [Multipass instance management](https://multipass.run/docs/how-to-guides#heading--manage-instances) - Documentation on managing instances created by `multipass`.
    
* [Static IP provisioning](https://multipass.run/docs/configure-static-ips) - Steps to provision a static IP for a VM, which can persist over restarts.
    
* [Multipass snapshot](https://multipass.run/docs/snapshot-command) - Instructions related to capturing a snapshot (backup) of a `multipass` instance.
    
* [Multipass restore](https://multipass.run/docs/restore-command) - Instructions related to restoring an instance from a snapshot.
    
* [Releases for containerd](https://github.com/containerd/containerd/releases) - This page holds all the releases for `containerd`.
    
* [Releases for runc](https://github.com/opencontainers/runc/releases) - This page holds all the releases for `runc`.
    
* [Releases for the CNI plugin](https://github.com/containernetworking/plugins/releases) - This page holds all the releases for the CNI plugin.
    
* [Pod network add-ons](https://kubernetes.io/docs/concepts/cluster-administration/addons/#networking-and-network-policy) - A list of all compatible Pod network add-ons as per the official Kubernetes documentation.
    
* [ReWeave](https://github.com/rajch/weave#using-weave-on-kubernetes) - An actively maintained fork of the Weave Net project.