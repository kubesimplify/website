---
title: "Understanding etcd in Kubernetes: A Beginner's Guide"
datePublished: 2023-02-11T12:30:39.045Z
slug: understanding-etcd-in-kubernetes-a-beginners-guide
author: srinivas-karnati
cover: /img/blog/understanding-etcd-in-kubernetes-a-beginners-guide/5d9276f4-89b1-41c2-87e7-9bce969091ea.png
tags: ["kubernetes"]
cuid: cldzxrf2607s4o1nvgeqs1rmi
---
Etcd is a key-value data store used to store and manage the critical information that distributed systems need. It provides a reliable way of storing the configuration data. In this post, we will see a close look at etcd, why it is needed, and how to access its contents in Kubernetes.

### What is etcd?

Etcd is an open-source distributed key-value store that is used to store and manage the information that distributed systems need for their operations. It stores the configuration data, state data, and metadata in Kubernetes.

The name “etcd” comes from a naming convention within the Linux directory structure: In UNIX, all system configuration files for a single system are contained in a folder called “/etc;” “d” stands for “distributed.”

**Why Kubernetes needs a data store?**

We know that Kubernetes is an orchestration tool whose tasks involve managing application container workloads, their configuration, deployments, service discovery, load balancing, scheduling, scaling, and monitoring, and many more tasks which might spread across multiple machines across many locations. Kubernetes needs to maintain coordination between all the components involved.

But to achieve that reliable coordination, k8s needs a data source that can help with the information about all the components, their required configuration, state data, etc. That data store must provide a consistent, single source of truth at any given point in time. In Kubernetes, that job is done by etcd. etcd is the data store used to create and maintain the version of the truth.

**But why etcd?**

As it sounds, it is not a small task to act as a single point of truth for application workload. But what makes etcd worth using?

* **Fully replicated:** Every node in an etcd cluster has access to the full data store.
    
* **Highly available:** etcd is designed to have no single point of failure and gracefully tolerate hardware failures and network partitions.
    
* **Reliably consistent:** Every data ‘read’ returns the latest data ‘write’ across all clusters.
    
* **Fast:** etcd has been benchmarked at 10,000 writes per second.
    
* **Secure:** etcd supports automatic Transport Layer Security (TLS) and optional secure socket layer (SSL) client certificate authentication.
    

![](/img/blog/understanding-etcd-in-kubernetes-a-beginners-guide/b99977b9-189d-4810-ac4d-f4306cffccef.png align="center")

Image from [etcd.io](http://etcd.io)

In general, etcd is deployed as a cluster spread across multiple nodes. It is recommended for a cluster to contain an odd number of nodes, and at least three are required for production environments.

So if we have multiple etcd nodes, how the data consistency will be maintained?

etcd is built on the [**Raft consensus algorithm**](https://raft.github.io/) to ensure data storage consistency across all nodes in a cluster for a fault-tolerant distributed system.

**Raft consensus algorithm**

In the raft algorithm, the data consistency is maintained via the *leader,* which will replicate the data to other nodes in a cluster called *followers.*

The leader accepts requests from clients/users, then will forward them to followers. Once the majority of followers sent back an entry made acknowledgment, the leader writes the entry. If followers crash, the leader retries until all followers store the data consistently.

If a *follower* fails to receive a message from the *leader*, a new election for the leader will be conducted.

You can find great animation explaining about raft algorithm here: [http://thesecretlivesofdata.com/raft/](http://thesecretlivesofdata.com/raft/)

**Etcd and Kubernetes in action**

In the Kubernetes cluster, etcd is deployed as pods on the control plane. To add a level of security and resiliency, it can also be deployed as an external cluster.

For this post, I am using [the kind cluster](https://kind.sigs.k8s.io/). When kind is used to install the cluster, it will also install etcd as pod in the kube-system namespace.

![](/img/blog/understanding-etcd-in-kubernetes-a-beginners-guide/c90e9197-6de5-4a16-be19-a2834982a01c.png align="center")

We can find multiple pods in the kube-system namespace, but what we are most interested is `etcd-kind-control-plane` which is running the instance of etcd and it is used to store the state of the cluster.

**Interact with etcd**

The following command helps to interact with the `etcd-kind-control-plane` pod through kubectl exec. And `ETCDCTL_API` is the API version through which we want to interact with etcd `--cacert, --key and --cert` is for TLS certificates that we will get from executing the `describe command` present above and `get / --prefix --keys-only` will give all the keys present in etcd.

```bash
kubectl exec etcd-kind-control-plane -n kube-system -- sh -c "ETCDCTL_API=3 etcdctl --cacert /etc/kubernetes/pki/etcd/ca.crt  --key /etc/kubernetes/pki/etcd/server.key --cert  /etc/kubernetes/pki/etcd/server.crt  get / --prefix --keys-only" > etcdkeys.txt
```

`ETCDCTL_API` is the API version we use for etcd to interact with it. `--cacert, --key and --cert` is for TLS certificates that we need and `get / --prefix --keys-only` will give all the keys present in etcd.

![](https://cdn-images-1.medium.com/max/1600/1*ztGfR7QbbkhVWBnJAWPGEQ.png align="left")

The above interaction with the etcd pod gave me around 277 keys, which will define the configuration and status of all resources in the cluster.

So now let’s create a pod with nginx image, and we will see what happens in the etcd cluster.

So run `kubectl run my-pod --image=nginx` which basically pulls and runs the nginx image. We use the same command that we’ve used previously to get all the keys that are stored in etcd, and we will store it into a file called `etcd-after-pod.txt` .

```bash
kubectl exec etcd-kind-control-plane -n kube-system —- sh -c “ETCDCTL_API=3 etcdctl --cacert /etc/kubernetes/pki/etcd/ca.crt --key /etc/kubernetes/pki/etcd/server.key --cert /etc/kubernetes/pki/etcd/server.crt get / --prefix --keys-only” > etcd-after-pod.txt
```

A comparison between the two files, one before pod creation and one after pod creation, shows me the following.

![](https://cdn-images-1.medium.com/max/1600/1*rOPstAFYXLu-toiVjY4ELw.png align="left")

Several new events were generated. We have 6 events generated specifically for our pod `my-pod`. Let’s take a closer look at those events.

The following command gives you an JSON output for the event `registry/events/default/my-pod.173bb0a9bbbda0b6`. But by default, all the values of etcd are encoded.

```bash
kubectl exec etcd-kind-control-plane -n kube-system --sh -c “ETCDCTL_API=3 etcdctl --cacert /etc/kubernetes/pki/etcd/ca.crt --key /etc/kubernetes/pki/etcd/server.key --cert /etc/kubernetes/pki/etcd/server.crt get \”/registry/events/default/my-pod.173bb0a9bbbda0b6\” -w json”
```

![](/img/blog/understanding-etcd-in-kubernetes-a-beginners-guide/24c3dddf-a123-4137-8604-3de10d2314aa.png align="center")

```bash
kubectl exec etcd-kind-control-plane -n kube-system -- sh -c “ETCDCTL_API=3 etcdctl --cacert /etc/kubernetes/pki/etcd/ca.crt --key /etc/kubernetes/pki/etcd/server.key --cert /etc/kubernetes/pki/etcd/server.crt get \”/registry/events/default/my-pod.173bb0a9bbbda0b6\” -w json” | jq ‘.kvs[0].value’| cut -d ‘“‘ -f2 | base64 --decode
```

If we decode the value associated with the key, to return output is also not that much readable, but we can understand some of it.

![](/img/blog/understanding-etcd-in-kubernetes-a-beginners-guide/0de7bcd6-674d-4664-8ef0-ccc6d2ef8bc5.png align="center")

In the above result, you can find some interesting information — `started container my-pod.` I have decoded all the pod events, and these are the events that occurred in chronological order.

```bash
Scheduled":Successfully assigned default/my-pod to kind-control-plane*
Pulling"Pulling image "nginx"*
Pulled"2Successfully pulled image "nginx" in 35.579712695s
Created"Created container my-pod*
Started"Started container my-pod*
```

The last key, `/registry/pods/default/my-pod`, gives all the information related to the newly created Pod :

* The last applied configuration
    
* Its token
    
* Its status etc.
    
* Memory etc...
    

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [LinkedIn](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.