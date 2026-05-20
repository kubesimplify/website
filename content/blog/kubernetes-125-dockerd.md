---
title: "Kubernetes 1.25 + Dockerd"
seoTitle: "Kubernetes 1.25 setup using dockerd as the container runtime"
seoDescription: "Learn how to set up Kubernetes 1.25 using dockerd as the container runtime on Ubuntu 22.04 machines."
datePublished: 2022-08-24T05:30:00.927Z
slug: kubernetes-125-dockerd
author: saloni-narang
cover: /img/blog/kubernetes-125-dockerd/TGGf7DBrt.jpeg
tags: ["docker", "kubernetes", "devops", "k8s", "kubernetes-setup"]
cuid: cl776ftnc02acbmnv2ph6apt7
---
In this post, I will tell you how to set up a  **Kubernetes 1.25** cluster(that was released today) bootstrapped using **kubeadm** with **Dockerd** as the container runtime. This will be a setup with 1 control plane node and 3 worker nodes on Ubuntu 22.04 compute instances. 

![image.png](/img/blog/kubernetes-125-dockerd/rBkS0-AGX.png align="left")

Prerequisites 
- 4 Ubuntu 22.04 instances with ssh access to them, you can use any cloud provider to launch these instances
- Each instance should have a minimum of 4GB or ram

Here I have 4 instances in place 

| controlplane | 74.220.19.161 |
|--------------|---------------|
| worker1      | 74.220.18.110  |
| worker2      | 74.220.22.48 |
| worker3      | 74.220.23.63  |


Let's Begin!!

## Step 1 - Run this on all the machines

**Kubeadm | kubectl | kubelet install **

```
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt update -y
sudo apt -y install vim git curl wget kubelet=1.25.0-00 kubeadm=1.25.0-00 kubectl=1.25.0-00
sudo apt-mark hold kubelet kubeadm kubectl
```

**Disable swap** - Swap should be disabled in order for kubelet to work properly. Though there is a [KEP](https://github.com/kubernetes/enhancements/tree/master/keps/sig-node/2400-node-swap) to make this work which is in alpha since 1.22 Kubernetes version and marked in beta for 1.24. We will do it manually. 

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

**Setup Dockerd ** - Dockershim got deprecated and removed in Kubernetes 1.24 but Mirantis is maintaining that. So we will be using the mirantis maintained `cri-dockerd` for this tutorial.

First let's install docker 

```
apt install docker.io -y
systemctl start docker
systemctl enable docker
```
Now, cri-dockerd setup
```
wget https://github.com/Mirantis/cri-dockerd/releases/download/v0.2.5/cri-dockerd-0.2.5.amd64.tgz
tar -xvf cri-dockerd-0.2.5.amd64.tgz
cd cri-dockerd/
mkdir -p /usr/local/bin
install -o root -g root -m 0755 ./cri-dockerd /usr/local/bin/cri-dockerd

```

Add the files `cri-docker.socker` `cri-docker.service`
```
sudo tee /etc/systemd/system/cri-docker.service << EOF
[Unit]
Description=CRI Interface for Docker Application Container Engine
Documentation=https://docs.mirantis.com
After=network-online.target firewalld.service docker.service
Wants=network-online.target
Requires=cri-docker.socket
[Service]
Type=notify
ExecStart=/usr/local/bin/cri-dockerd --container-runtime-endpoint fd:// --network-plugin=
ExecReload=/bin/kill -s HUP $MAINPID
TimeoutSec=0
RestartSec=2
Restart=always
StartLimitBurst=3
StartLimitInterval=60s
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
TasksMax=infinity
Delegate=yes
KillMode=process
[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/cri-docker.socket << EOF
[Unit]
Description=CRI Docker Socket for the API
PartOf=cri-docker.service
[Socket]
ListenStream=%t/cri-dockerd.sock
SocketMode=0660
SocketUser=root
SocketGroup=docker
[Install]
WantedBy=sockets.target
EOF
```
```
#Daemon reload
systemctl daemon-reload
systemctl enable cri-docker.service
systemctl enable --now cri-docker.socket

# Setup required sysctl params, these persist across reboots.
cat <<EOF | sudo tee /etc/sysctl.d/99-kubernetes-cri.conf
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
net.bridge.bridge-nf-call-ip6tables = 1
EOF

# Apply sysctl params without reboot
sudo sysctl --system

```

**Configuring the kubelet cgroup driver** - From 1.22 onwards if you do not set the `cgroupDriver` field under `KubeletConfiguration`, kubeadm will default it to systemd. So you do not need to do anything here but if you want you can refer to this [documentation](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/configure-cgroup-driver/).


**Pull the images** - Pull the images for Kubernetes 1.25 version.

```
sudo kubeadm config images pull --cri-socket unix:///var/run/cri-dockerd.sock --kubernetes-version v1.25.0
```

## Step 2 - Run the cluster init command on the control plane node
Here the pod network CIDR is dependent on the CNI you will be installing later on, so in this case, I am using flannel and `--apiserver-advertise-address` will be the public IP for the instance (it can be private IP as well but if you want to access it from outside of the node by using Kubeconfig then you need to give the public IP).
 

```
sudo kubeadm init   --pod-network-cidr=10.244.0.0/16   --upload-certs --kubernetes-version=v1.25.0   --control-plane-endpoint=74.220.19.161   --cri-socket unix:///var/run/cri-dockerd.sock
```

The above command will give the following output 


```
[init] Using Kubernetes version: v1.25.0
[preflight] Running pre-flight checks
	[WARNING SystemVerification]: missing optional cgroups: blkio
[preflight] Pulling images required for setting up a Kubernetes cluster
[preflight] This might take a minute or two, depending on the speed of your internet connection
[preflight] You can also perform this action in beforehand using 'kubeadm config images pull'
[certs] Using certificateDir folder "/etc/kubernetes/pki"
[certs] Generating "ca" certificate and key
[certs] Generating "apiserver" certificate and key
[certs] apiserver serving cert is signed for DNS names [kube1-25-cp-eb85-c20f1a kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local] and IPs [10.96.0.1 192.168.1.24 74.220.19.161]
[certs] Generating "apiserver-kubelet-client" certificate and key
[certs] Generating "front-proxy-ca" certificate and key
[certs] Generating "front-proxy-client" certificate and key
[certs] Generating "etcd/ca" certificate and key
[certs] Generating "etcd/server" certificate and key
[certs] etcd/server serving cert is signed for DNS names [kube1-25-cp-eb85-c20f1a localhost] and IPs [192.168.1.24 127.0.0.1 ::1]
[certs] Generating "etcd/peer" certificate and key
[certs] etcd/peer serving cert is signed for DNS names [kube1-25-cp-eb85-c20f1a localhost] and IPs [192.168.1.24 127.0.0.1 ::1]
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
[apiclient] All control plane components are healthy after 11.508790 seconds
[upload-config] Storing the configuration used in ConfigMap "kubeadm-config" in the "kube-system" Namespace
[kubelet] Creating a ConfigMap "kubelet-config" in namespace kube-system with the configuration for the kubelets in the cluster
[upload-certs] Storing the certificates in Secret "kubeadm-certs" in the "kube-system" Namespace
[upload-certs] Using certificate key:
5b3967856a07b21bc5a37365dcd829ceeaeac9768f0fddeac8cc06e335383dc3
[mark-control-plane] Marking the node kube1-25-cp-eb85-c20f1a as control-plane by adding the labels: [node-role.kubernetes.io/control-plane node.kubernetes.io/exclude-from-external-load-balancers]
[mark-control-plane] Marking the node kube1-25-cp-eb85-c20f1a as control-plane by adding the taints [node-role.kubernetes.io/control-plane:NoSchedule]
[bootstrap-token] Using token: 6gh7gq.yxxvl9c0tjauu7up
[bootstrap-token] Configuring bootstrap tokens, cluster-info ConfigMap, RBAC Roles
[bootstrap-token] Configured RBAC rules to allow Node Bootstrap tokens to get nodes
[bootstrap-token] Configured RBAC rules to allow Node Bootstrap tokens to post CSRs in order for nodes to get long term certificate credentials
[bootstrap-token] Configured RBAC rules to allow the csrapprover controller automatically approve CSRs from a Node Bootstrap Token
[bootstrap-token] Configured RBAC rules to allow certificate rotation for all node client certificates in the cluster
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

  kubeadm join 74.220.19.161:6443 --token 6gh7gq.yxxvl9c0tjauu7up \
	--discovery-token-ca-cert-hash sha256:e3ecc16a7c7fa9ccf3c334e98bd53c18c86e9831984f1f7c8398fbd54d5e37e9 \
	--control-plane --certificate-key 5b3967856a07b21bc5a37365dcd829ceeaeac9768f0fddeac8cc06e335383dc3

Please note that the certificate-key gives access to cluster sensitive data, keep it secret!
As a safeguard, uploaded-certs will be deleted in two hours; If necessary, you can use
"kubeadm init phase upload-certs --upload-certs" to reload certs afterward.

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 74.220.19.161:6443 --token 6gh7gq.yxxvl9c0tjauu7up \
	--discovery-token-ca-cert-hash sha256:e3ecc16a7c7fa9ccf3c334e98bd53c18c86e9831984f1f7c8398fbd54d5e37e9 


```


**Export KUBECONFIG and install CNI Flannel**
```
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
export KUBECONFIG=/etc/kubernetes/admin.conf
kubectl apply -f https://github.com/coreos/flannel/raw/master/Documentation/kube-flannel.yml

```

## Step 3 - Run the join command on all the worker nodes
Remember to add the `--cri-socket` flag at the end 

```
kubeadm join 74.220.19.161:6443 --token 6gh7gq.yxxvl9c0tjauu7up       --discovery-token-ca-cert-hash sha256:e3ecc16a7c7fa9ccf3c334e98bd53c18c86e9831984f1f7c8398fbd54d5e37e9  --cri-socket unix:///var/run/cri-dockerd.sock
[preflight] Running pre-flight checks
	[WARNING SystemVerification]: missing optional cgroups: blkio
[preflight] Reading configuration from the cluster...
[preflight] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Starting the kubelet
[kubelet-start] Waiting for the kubelet to perform the TLS Bootstrap...

This node has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the control-plane to see this node join the cluster.

```

## Step 4 - Nginx Test

You can copy the kubeconfig file from the controlplane node(~/.kube/config ) to local and export the KUBECONFIG variable or directly access the cluster from the controlplane node. 

```
kubectl get nodes
NAME                       STATUS   ROLES           AGE   VERSION
kube1-25-cp-eb85-c20f1a    Ready    control-plane   13m   v1.25.0
kube1-25-w-1-b507-7ebeb0   Ready    <none>          64s   v1.25.0
kube1-25-w-2-0888-7ebeb0   Ready    <none>          54s   v1.25.0
kube1-25-w-3-142f-7ebeb0   Ready    <none>          51s   v1.25.0
```

The cluster is up and running with single controlplane and 3 worker nodes.

Now run nginx 

```
kubectl run nginx --image=nginx
pod/nginx created

kubectl expose pod nginx --type=NodePort --port 80
service/nginx exposed

kubectl get pods
NAME    READY   STATUS    RESTARTS   AGE
nginx   1/1     Running   0          8s

kubectl get svc nginx
NAME    TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
nginx   NodePort   10.104.25.205   <none>        80:32743/TCP   8s

```

Access the service using Node public IP:32743(make sure your firewall rules are properly set to allow traffic to required ports)



![Screenshot 2022-08-24 at 7.38.38 AM.png](/img/blog/kubernetes-125-dockerd/vnfEbG_kz.png align="left")

YAY!! you have successfully setup a self managed Kubernetes cluster, version 1.25.0 and dockerd as the container runtime. 

Here is a video tutorial about [**Kubernetes 1.24 with Docker container runtime**](https://www.youtube.com/watch?v=V_hzP_nEOkI) by Saiyam Pathak.

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.