---
title: "Why are network policies in Kubernetes so hard to understand?"
seoTitle: "What are Kubernetes network policies?"
seoDescription: "This article explain in depth what network policies are with help of hands on examples to make the concepts clear. "
datePublished: 2024-03-23T16:34:14.254Z
slug: why-are-network-policies-in-kubernetes-so-hard-to-understand
author: saiyam-pathak
cover: /img/blog/why-are-network-policies-in-kubernetes-so-hard-to-understand/f38ad061-886f-4ecb-8a6b-f91456f710ba.webp
tags: ["kubernetes", "k8s", "kubernetes-network-policies", "networkpolicy"]
cuid: clu4b8ium000e09lda24n8ica
---
In Kubernetes, the concept of network policies allows you to control the traffic flow within a cluster. Essentially, by creating policies, you determine which pods can access others, streamlining the process of restricting traffic between different applications within the cluster.

You will also run into many microservices in different namespaces within a Kubernetes environment. These applications are run as pods, which in turn run containers. These containers are your applications and are capable of communicating with every other pod, either directly or through services. However, this open communication model isn't always secure. Fortunately, Kubernetes offers the concept of network policy, implemented by various network providers, to provide out-of-the-box functionality for controlling this aspect securely.

The community often voices that network policies are complex, but by exploring concrete examples, we can gain a clearer understanding of how they work in action.

![Civo Network Policy Diagram](https://civo-com-assets.ams3.digitaloceanspaces.com/content_images/2666.blog.png?1710250484 align="left")

## **Prerequisites**

To follow along with this tutorial, you need to ensure you have the following in place:

* [A Civo Account](https://www.civo.com/docs/account/signing-up)
    
* [A Kubernetes cluster](https://www.civo.com/docs/kubernetes/create-a-cluster)
    
* [Kubectl installed](https://kubernetes.io/docs/tasks/tools/)
    
* [Civo CLI installed](https://www.civo.com/docs/overview/civo-cli)
    

## **Creating a Kubernetes cluster with Cilium**

To begin with, let’s create a Civo Kubernetes cluster with Cilium as the CNI. You can create the cluster from the [UI](https://www.civo.com/docs/kubernetes/create-a-cluster#creating-a-cluster-on-the-dashboard) or the [CLI](https://www.civo.com/docs/kubernetes/create-a-cluster#creating-a-cluster-using-civo-cli).

<mark>⚠️ For the purpose of this tutorial, we will be using Civo Kubernetes, but you can go with any Kubernetes cluster and CNI where network policies will work.</mark>

### **Interacting with the cluster**

Once you have the cluster created, you can export the `KUBECONFIG` variable in your terminal and point it to the downloaded kubeconfig file for the cluster. From here, you should be able to interact with the cluster:

```bash
kubectl get nodes
NAME                                                   STATUS   ROLES    AGE   VERSION
k3s-networkpolicies-7aed-fb151a-node-pool-71b0-krmn8   Ready    <none>   71s   v1.28.2+k3s1
k3s-networkpolicies-7aed-fb151a-node-pool-71b0-jl4q3   Ready    <none>   69s   v1.28.2+k3s1
k3s-networkpolicies-7aed-fb151a-node-pool-71b0-6ko85   Ready    <none>   67s   v1.28.2+k3s1
```

Create 2 namespaces dev1 and dev2:

```bash
kubectl create ns dev1
namespace/dev1 created
kubectl create ns dev2
namespace/dev2 created
```

Create a pod demo1 and pod demo2 in respective namespaces with NGINX image:

```bash
kubectl run demo1 --image=nginx -n dev1
pod/demo1 created
kubectl run demo2 --image=nginx -n dev2
pod/demo2 created

kubectl get pods -owide -n dev1
NAME    READY   STATUS    RESTARTS   AGE   IP           NODE                                                   NOMINATED NODE   READINESS GATES
demo1   1/1     Running   0          97s   10.0.1.147   k3s-networkpolicies-7aed-fb151a-node-pool-71b0-6ko85   <none>           <none>

kubectl get pods -owide -n dev2
NAME    READY   STATUS    RESTARTS   AGE   IP           NODE                                                   NOMINATED NODE   READINESS GATES
demo2   1/1     Running   0          94s   10.0.1.185   k3s-networkpolicies-7aed-fb151a-node-pool-71b0-6ko85   <none>           <none>
```

### **Testing the connectivity**

Let’s now test the connectivity of one pod from another:

```bash
kubectl exec demo1 -n dev1 -- curl 10.0.1.185

  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
100   615  100   615    0     0   405k      0 --:--:-- --:--:-- --:--:--  600k
```

In this code, we exec into pod demo1 in the dev1 namespace and try to curl the IP of pod demo2 in dev2 namespace, this shows that any pod can communicate with any other pod in any namespace.

Now how can we fix this? You are right! Using `NetworkPolicy`.

## **Creating a Network Policy**

Let’s create a network policy in the dev2 namespace so that no traffic can reach the pods in the dev2 namespace.

```bash
cat << EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: dev2
spec:
  podSelector: {}
  policyTypes:
  - Ingress
EOF
networkpolicy.networking.k8s.io/deny-all created
```

Above is the manifest for all the pods in dev2 namespace. The purpose of this policy is to restrict all incoming traffic to the pods within the dev2 namespace. Here's a breakdown of how it works:

* `apiVersion`: [`networking.k8s.io/v1`](http://networking.k8s.io/v1): Specifies the API version for the network policy resource.
    
* `kind`: `NetworkPolicy`: This specifies the kind of Kubernetes resource you're defining, which in this case is a Network Policy.
    
* `metadata`: Contains metadata about the network policy, including its name (deny-all) and the namespace (dev2) it is applied to.
    
* `spec`: Defines the specifications of the Network Policy.
    
    * `podSelector`: This is set to an empty object ({}), which means the policy applies to all pods within the specified namespace (dev2 in this case). You could specify label selectors here if you wanted to target specific pods.
        
    * `policyTypes`: Specifies the types of policies. In this case, it includes - Ingress, which means the policy will apply to incoming traffic to the pods. By not specifying Egress in the policy types, this policy does not restrict egress (outgoing) traffic from the pods.
        
* `Ingress`: Since no rules are defined under the ingress section (which is implicitly understood from the lack of an ingress field under spec), it means no inbound connections are allowed to any pods in the dev2 namespace. You would define rules here if you wanted to allow specific types of ingress traffic.
    

The following outcome should appear:

```bash
kubectl exec demo1 -n dev1 -- curl --connect-timeout 5 10.0.1.185
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0     0    0     0    0     0      0      0 --:--:--  0:00:01 --:--:--     0     0    0     0    0     0      0      0 --:--:--  0:00:02 --:--:--     0     0    0     0    0     0      0      0 --:--:--  0:00:03 --:--:--     0     0    0     0    0     0      0      0 --:--:--  0:00:04 --:--:--     0     0    0     0    0     0      0      0 --:--:--  0:00:05 --:--:--     0
curl: (28) Failed to connect to 10.0.1.185 port 80 after 5001 ms: Timeout was reached
command terminated with exit code 28
```

You can see that after applying this policy no traffic can reach the pods in the dev2 namespace.

![Civo Creating a Network Policy](https://civo-com-assets.ams3.digitaloceanspaces.com/content_images/2668.blog.png?1710250563 align="left")

### **Receiving incoming TCP traffic**

Next, let’s try to cover a couple more scenarios to understand the concept more clearly. Next, we will create a network policy that would allow the traffic from pods in dev1 namespace to dev2 namespace over port 80.

```bash
cat << EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: kube-demo
  namespace: dev2
spec:
  podSelector: {}
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: dev1
    ports:
    - protocol: TCP
      port: 80
EOF
networkpolicy.networking.k8s.io/kube-demo created
```

Here’s a breakdown of what is happening in the above code:

* `spec`: Defines the specifics of the Network Policy.
    
    * `podSelector`: An empty object ({}) is specified, meaning this policy applies to all pods within the dev2 namespace. If you wanted this policy to apply to specific pods, you would use label selectors here.
        
    * `ingress`: Specifies the rules for incoming traffic to the selected pods.
        
        * `from`: Defines the sources from which the pods can receive traffic.
            
            * `namespaceSelector`: Specifies that the incoming traffic is allowed from pods in namespaces that match the specified labels. In this case, it's allowing traffic from the dev1 namespace, as indicated by the label selector kubernetes.io/metadata.name: dev1.
                
        * `ports`: Specifies the ports and protocols for the incoming traffic that is allowed.
            
            * `protocol`: The allowed protocol for ingress traffic, which is TCP in this case.
                
            * `port`: The port on which incoming traffic is allowed, which is port 80.
                

This network policy allows pods in the dev2 namespace to receive incoming TCP traffic on port 80 from any pod in the dev1 namespace. No other ingress traffic is permitted by this policy, effectively isolating the pods in dev2 from unwanted or unsolicited incoming traffic from pods in other namespaces, except for the allowed traffic from dev1.

### **Network Policy Example**

Interestingly if you have a previous policy of deny all and this policy as well, it will be a combination, and the resultant will allow traffic on port 80 from pods in dev1 namespace to dev2 namespace.

You can check the output below:

```bash
kubectl exec demo1 -n dev1 -- curl --connect-timeout 5 10.0.1.185
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--   100   615  100   615    0     0   267k      0 --:--:-- --:--:-- --:--:--  300k
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

To check that traffic is not allowed from any other namespace or on any other port, let's create a pod in the dev2 namespace listening on a different port than 80 and a pod in default namespace as well:

```bash
kubectl run default --image=nginx
pod/default created

kubectl get pods -owide
NAME                                 READY   STATUS      RESTARTS   AGE    IP           NODE                                                   NOMINATED NODE   READINESS GATES
default                              1/1     Running     0          26s    10.0.2.237   k3s-networkpolicies-7aed-fb151a-node-pool-71b0-jl4q3   <none>           <none>

kubectl exec default -- curl --connect-timeout 5 10.0.1.185
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0     0    0     0    0     0      0      0 --:--:--  0:00:01 --:--:--     0     0    0     0    0     0      0      0 --:--:--  0:00:02 --:--:--     0     0    0     0    0     0      0      0 --:--:--  0:00:03 --:--:--     0     0    0     0    0     0      0      0 --:--:--  0:00:04 --:--:--     0     0    0     0    0     0      0      0 --:--:--  0:00:05 --:--:--     0
curl: (28) Failed to connect to 10.0.1.185 port 80 after 5000 ms: Timeout was reached
command terminated with exit code 28
```

Now lets try to create a pod and service to listen on port 8080:

```bash
kubectl run http-echo --image=hashicorp/http-echo -n dev2 -- -listen=:8080 -text="Hello from http-echo"

pod/http-echo created

kubectl get pods -n dev2 -owide
NAME         READY   STATUS    RESTARTS   AGE   IP           NODE                                                   NOMINATED NODE   READINESS GATES
demo2        1/1     Running   0          80m   10.0.1.185   k3s-networkpolicies-7aed-fb151a-node-pool-71b0-6ko85   <none>           <none>
http-echo   1/1     Running   0          26s   10.0.1.115   k3s-networkpolicies-7aed-fb151a-node-pool-71b0-6ko85   <none>           <none>
```

### **Creating a service**

Create the service using the following:

```bash
kubectl expose pod http-echo -n dev2 --port=8080
service/http-echo exposed
kubectl get svc -n dev2
NAME        TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)     AGE
http-echo   ClusterIP   10.98.167.221    <none>        8080/TCP   28s
```

```bash
kubectl exec demo1 -n dev1 -- curl --connect-timeout 5 10.98.167.221
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:--  0:00:05 --:--:--     0
curl: (28) Failed to connect to 10.98.167.221 port 80 after 5000 ms: Timeout was reached
command terminated with exit code 28
```

The kube-demo NetworkPolicy that was applied to all pods in the dev2 namespace (since podSelector is empty), allows them to receive incoming TCP traffic on port 80 only from pods within the dev1 namespace (identified by the label kubernetes.io/metadata.name: dev1). All other incoming traffic from different namespaces, or different ports, will be denied by default, as this is the standard behavior of Kubernetes NetworkPolicies when they are applied to a set of pods. We proved that with a pod in the default namespace and also by running a pod on port 8080 and trying to connect to it also failed.

## **Summary**

Throughout this tutorial, you should now have a better understanding of how you can apply network policies within your Kubernetes cluster to limit the ingress/egress traffic for the pods. Another interesting way to learn more about this topic is by using [this tool](https://editor.networkpolicy.io/) which allows you to create network policies for Kubernetes and gain a better understanding of the concept.

![Network Policy Tool](https://civo-com-assets.ams3.digitaloceanspaces.com/content_images/2667.blog.png?1710250526 align="left")

If you want other resources to keep learning more about this topic, I recommend checking out the following:

* [Kubernetes Documentation on network policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
    
* [Kubernetes network policy recipes](https://github.com/ahmetb/kubernetes-network-policy-recipes)
    

Follow Kubesimplify on [**Hashnode**, **Twitte**](https://blog.kubesimplify.com/)[**r** and **Li**](https://twitter.com/kubesimplify)[**nkedIn**. Join o](https://www.linkedin.com/company/kubesimplify)ur [**Discord server** to learn with](https://kubesimplify.com/discord) us!