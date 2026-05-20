---
title: "Kubernetes 1.23 + CRI-O"
seoTitle: "kubernetes with cri-o as a runtime"
datePublished: 2022-03-26T04:35:26.246Z
slug: kubernetes-crio
author: saloni-narang
cover: /img/blog/kubernetes-crio/FaXIRgPDA.png
tags: ["cloud", "kubernetes", "devops", "containers"]
cuid: cl17czzyb077dkpnv75vz2j0m
---
In the previous post, I showed you how to set up Kubernetes 1.23 with containerd on Ubuntu20.04 machines with one controlplane and three worker nodes. In this tutorial, I will show you how to do the same set-up with different container runtime - [CRI-O](https://github.com/cri-o/cri-o). 
So there are different runtimes that you can use when you set up your Kubernetes cluster and CRIO-O is one of them.
CRI-O is an implementation of the Kubernetes Container Runtime Interface (CRI) that will allow Kubernetes to directly launch and manage Open Container Initiative (OCI) containers. It does not have any CLI utility to interact with. 

**Prerequisites** 
- 4 Ubuntu 20.04 instances with ssh access to them, you can use any cloud provider to launch these instances
- Each instance should have a minimum of 4GB or ram

Here I have 4 instances in place 

| controlplane | 212.2.247.160 |
|--------------|---------------|
| worker1      | 212.2.244.23  |
| worker2      | 212.2.240.240 |
| worker3      | 212.2.241.78  |


Let's being!!

## Step 1 - Run this on all the machines

**Kubeadm | kubectl | kubelet install **

```
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt update -y
sudo apt -y install vim git curl wget kubelet=1.23.0-00 kubeadm=1.23.0-00 kubectl=1.23.0-00
sudo apt-mark hold kubelet kubeadm kubectl
```

**Disable swap** - swap should be disabled in order for kubelet to work properly. Though there is a [KEP](https://github.com/kubernetes/enhancements/tree/master/keps/sig-node/2400-node-swap) to make this work which is in alpha since 1.22 Kubernetes version and marked in beta for 1.24. 

```
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
sudo swapoff -a
```

Load the br_netfilter module and let iptables see bridged traffic
```
sudo modprobe overlay
sudo modprobe br_netfilter
sudo tee /etc/sysctl.d/kubernetes.conf<<EOF
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF
sysctl --system

```

**Setup CRI-O **

```
OS=xUbuntu_20.04
CRIO_VERSION=1.23
echo "deb https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable/$OS/ /"|sudo tee /etc/apt/sources.list.d/devel:kubic:libcontainers:stable.list
echo "deb http://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable:/cri-o:/$CRIO_VERSION/$OS/ /"|sudo tee /etc/apt/sources.list.d/devel:kubic:libcontainers:stable:cri-o:$CRIO_VERSION.list
curl -L https://download.opensuse.org/repositories/devel:kubic:libcontainers:stable:cri-o:$CRIO_VERSION/$OS/Release.key | sudo apt-key add -
curl -L https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable/$OS/Release.key | sudo apt-key add -
sudo apt update -y
sudo apt install cri-o cri-o-runc -y
sudo systemctl enable crio.service
sudo systemctl start crio.service
sudo apt install cri-tools -y
```

**Configuring the kubelet cgroup driver**

From 1.22 onwards if you do not set the `cgroupDriver` field under `KubeletConfiguration`, kubeadm will default it to systemd. So you do not need to do anything here but if you want you can refer to this [documentation](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/configure-cgroup-driver/).


**Pull the images **

Pull the images for Kubernetes 1.23 version.

```
sudo kubeadm config images pull --cri-socket /var/run/crio/crio.sock --kubernetes-version v1.23.0
```

##Step2 - Run the cluster init command on the control plane node
Here the pod network CIDR is dependent on the CNI you will be installing later on, so in this case, I am using flannel and `--apiserver-advertise-address` will be the public IP for the instance(it can be private IP as well but if you want to access it from outside of the node by using Kubeconfig then you need to give the public IP).
 

```
sudo kubeadm init   --pod-network-cidr=10.244.0.0/16  --upload-certs --kubernetes-version=v1.23.0 --control-plane-endpoint=212.2.247.160 -cri-socket /var/run/crio/crio.sock
```

The above command will give the following output 


```
[init] Using Kubernetes version: v1.23.0
[preflight] Running pre-flight checks
[preflight] Pulling images required for setting up a Kubernetes cluster
[preflight] This might take a minute or two, depending on the speed of your internet connection
[preflight] You can also perform this action in beforehand using 'kubeadm config images pull'
[certs] Using certificateDir folder "/etc/kubernetes/pki"
[certs] Generating "ca" certificate and key
[certs] Generating "apiserver" certificate and key
[certs] apiserver serving cert is signed for DNS names [kube-crio-cp-c659-85648a kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local] and IPs [10.96.0.1 192.168.1.31 212.2.247.160]
[certs] Generating "apiserver-kubelet-client" certificate and key
[certs] Generating "front-proxy-ca" certificate and key
[certs] Generating "front-proxy-client" certificate and key
[certs] Generating "etcd/ca" certificate and key
[certs] Generating "etcd/server" certificate and key
[certs] etcd/server serving cert is signed for DNS names [kube-crio-cp-c659-85648a localhost] and IPs [192.168.1.31 127.0.0.1 ::1]
[certs] Generating "etcd/peer" certificate and key
[certs] etcd/peer serving cert is signed for DNS names [kube-crio-cp-c659-85648a localhost] and IPs [192.168.1.31 127.0.0.1 ::1]
[certs] Generating "etcd/healthcheck-client" certificate and key
[certs] Generating "apiserver-etcd-client" certificate and key
[certs] Generating "sa" key and public key
[kubeconfig] Using kubeconfig folder "/etc/kubernetes"
[kubeconfig] Writing "admin.conf" kubeconfig file
[kubeconfig] Writing "kubelet.conf" kubeconfig file
[kubeconfig] Writing "controller-manager.conf" kubeconfig file
[kubeconfig] Writing "scheduler.conf" kubeconfig file
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Starting the kubelet
[control-plane] Using manifest folder "/etc/kubernetes/manifests"
[control-plane] Creating static Pod manifest for "kube-apiserver"
[control-plane] Creating static Pod manifest for "kube-controller-manager"
[control-plane] Creating static Pod manifest for "kube-scheduler"
[etcd] Creating static Pod manifest for local etcd in "/etc/kubernetes/manifests"
[wait-control-plane] Waiting for the kubelet to boot up the control plane as static Pods from directory "/etc/kubernetes/manifests". This can take up to 4m0s
[apiclient] All control plane components are healthy after 14.008089 seconds
[upload-config] Storing the configuration used in ConfigMap "kubeadm-config" in the "kube-system" Namespace
[kubelet] Creating a ConfigMap "kubelet-config-1.23" in namespace kube-system with the configuration for the kubelets in the cluster
NOTE: The "kubelet-config-1.23" naming of the kubelet ConfigMap is deprecated. Once the UnversionedKubeletConfigMap feature gate graduates to Beta the default name will become just "kubelet-config". Kubeadm upgrade will handle this transition transparently.
[upload-certs] Storing the certificates in Secret "kubeadm-certs" in the "kube-system" Namespace
[upload-certs] Using certificate key:
8445f220e58d7a7c798b3ad546cad567d624870c1e4a12d28ee79909193b3931
[mark-control-plane] Marking the node kube-crio-cp-c659-85648a as control-plane by adding the labels: [node-role.kubernetes.io/master(deprecated) node-role.kubernetes.io/control-plane node.kubernetes.io/exclude-from-external-load-balancers]
[mark-control-plane] Marking the node kube-crio-cp-c659-85648a as control-plane by adding the taints [node-role.kubernetes.io/master:NoSchedule]
[bootstrap-token] Using token: pifmbf.xr4ku3c34oo5ej8l
[bootstrap-token] Configuring bootstrap tokens, cluster-info ConfigMap, RBAC Roles
[bootstrap-token] configured RBAC rules to allow Node Bootstrap tokens to get nodes
[bootstrap-token] configured RBAC rules to allow Node Bootstrap tokens to post CSRs in order for nodes to get long term certificate credentials
[bootstrap-token] configured RBAC rules to allow the csrapprover controller automatically approve CSRs from a Node Bootstrap Token
[bootstrap-token] configured RBAC rules to allow certificate rotation for all node client certificates in the cluster
[bootstrap-token] Creating the "cluster-info" ConfigMap in the "kube-public" namespace
[kubelet-finalize] Updating "/etc/kubernetes/kubelet.conf" to point to a rotatable kubelet client certificate and key
[addons] Applied essential addon: CoreDNS
[addons] Applied essential addon: kube-proxy

Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

Alternatively, if you are the root user, you can run:

  export KUBECONFIG=/etc/kubernetes/admin.conf

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

You can now join any number of the control-plane node running the following command on each as root:

  kubeadm join 212.2.247.160:6443 --token pifmbf.xr4ku3c34oo5ej8l \
	--discovery-token-ca-cert-hash sha256:648c17dde31e6350d1de94a077533963878eaf788e8fe655dde9cad33f75558f \
	--control-plane --certificate-key 8445f220e58d7a7c798b3ad546cad567d624870c1e4a12d28ee79909193b3931

Please note that the certificate-key gives access to cluster sensitive data, keep it secret!
As a safeguard, uploaded-certs will be deleted in two hours; If necessary, you can use
"kubeadm init phase upload-certs --upload-certs" to reload certs afterward.

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 212.2.247.160:6443 --token pifmbf.xr4ku3c34oo5ej8l \
	--discovery-token-ca-cert-hash sha256:648c17dde31e6350d1de94a077533963878eaf788e8fe655dde9cad33f75558f  

```

**Export KUBECONFIG and install CNI Flannel 
**
```
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
export KUBECONFIG=/etc/kubernetes/admin.conf
kubectl apply -f https://github.com/coreos/flannel/raw/master/Documentation/kube-flannel.yml

```

## Step 3 Run the join command on all the worker nodes

```
kubeadm join 212.2.247.160:6443 --token pifmbf.xr4ku3c34oo5ej8l \
> --discovery-token-ca-cert-hash sha256:648c17dde31e6350d1de94a077533963878eaf788e8fe655dde9cad33f75558f 
[preflight] Running pre-flight checks
[preflight] Reading configuration from the cluster...
[preflight] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
W0324 02:16:14.318601    5480 utils.go:69] The recommended value for "resolvConf" in "KubeletConfiguration" is: /run/systemd/resolve/resolv.conf; the provided value is: /run/systemd/resolve/resolv.conf
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Starting the kubelet
[kubelet-start] Waiting for the kubelet to perform the TLS Bootstrap...

This node has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the control-plane to see this node join the cluster.

```

## Step 4 Nginx Test

You can copy the kubeconfig file from the controlplane node(~/.kube/config ) to local and export the KUBECONFIG variable or directly access the cluster from the controlplane node. 

```
kubectl get nodes
NAME                             STATUS   ROLES                  AGE     VERSION
kube-crio-cp-c659-85648a         Ready    control-plane,master   2m49s   v1.23.0
kube-crio-worker-1-da9d-dfce48   Ready    <none>                 27s     v1.23.0
kube-crio-worker-2-eaca-dfce48   Ready    <none>                 25s     v1.23.0
kube-crio-worker-3-84fe-dfce48   Ready    <none>                 23s     v1.23.0
```

The cluster is up and running with a single controlplane and 3 worker nodes.

Now run nginx 

```
kubectl run nginx --image=nginx
pod/nginx created

kubectl expose pod nginx --type=NodePort --port 80
service/nginx exposed

kubectl get pods
NAME    READY   STATUS    RESTARTS   AGE
nginx   1/1     Running   0          48s

kubectl get svc nginx
NAME    TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
nginx   NodePort   10.100.155.137   <none>        80:31432/TCP   7s

```

Access the service using Node public IP:31393(make sure your firewall rules are properly set to allow traffic to required ports)



![image.png](/img/blog/kubernetes-crio/hQ83oVM-2.png)

Also when you describe the pod you can see CRIO as the runtime in the containerID section.

![image.png](/img/blog/kubernetes-crio/iOqpf-CqQ.png)


YAY!! you have successfully set up a self managed Kubernetes cluster, version 1.23.0 and CRI-O as the container runtime. 

Join the awesome kubesimplify community for more such blogs! 



