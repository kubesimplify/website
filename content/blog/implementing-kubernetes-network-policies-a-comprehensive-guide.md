---
title: "Implementing Kubernetes Network Policies: A Comprehensive Guide"
datePublished: 2023-04-07T12:30:39.431Z
slug: implementing-kubernetes-network-policies-a-comprehensive-guide
author: srinivas-karnati
cover: /img/blog/implementing-kubernetes-network-policies-a-comprehensive-guide/3433ef2b-59ae-4fc3-8c9f-338e2ddf611f.png
tags: ["kubernetes"]
cuid: clg6iza2d04hwuonv3yl86mv3
---
Network policies are networking rules in Kubernetes that will allow you to specify how the pod can communicate with other objects.

Network policies are not mandatory to establish communication with pods. However, network policies will add one more layer of network security and help control traffic at Layers 3 and 4 (IP and ports).

The idea of network policy is born in the networking SIG group of Kubernetes in 2015. It was included in the alpha release of v1.2 (2016) and moved to beta in v1.3(July 2016). Below is the proposal for the Network policy by Casey Davenport.

%[https://github.com/kubernetes/kubernetes/pull/24154] 

It is released stable as part of release v1.7 (June 2017).

![](/img/blog/implementing-kubernetes-network-policies-a-comprehensive-guide/2d52beab-d5eb-487a-a686-df2baa09723a.png align="center")

### **What are the things that you can control using Network policies?**

* Pods that are allowed to communicate with other pods.
    
* Namespaces that are allowed.
    
* IP Blocks for connection.
    

**Policies are applied based on Selectors and CIDR range:**

* When dealing with pods or namespaces, we use selectors to identify the resources for which our policy needs to be applied.
    
* When we want to create policies that need IP range restrictions, we use CIDR ranges.
    

### **CNI — the mandatory element**

Network policies need a network plugin. You must need a network plugin that supports Network Policy. Without a suitable plugin, all your network policies are of no use. Even if you apply a network policy without a supported CNI configured, those network policies didn’t affect any traffic. Some of the CNI plugins that support network policies are:

* Weave
    
* Calico
    
* Cilium
    
* Romana
    

### Some points to note:

**Ingress and Egress:**

Ingress means the traffic that is entering the Pod. Similarly, egress is the traffic that is leaving the pod.

**Default = Allow All:**

By default, the pod allows all ingress and egress. It means it has no restrictions for both inbound and outbound traffic.

**No Deny Rules:**

There are no denied rules in Network policies. You can only specify traffic to be allowed and the rest is denied (you can’t write what to deny). You cannot get in if traffic is not allowed on the policy.

**empty selector:**

An empty selector means everything. If PodSelector:{} is mentioned, it will select all the pods in the namespace.

**Null selector:**

If the policy contains a Null selector \[\], means it is not selecting anything (so all traffic is blocked).

**Policies are 'OR'ed:**

Network policies are additive. If multiple policies are applied to a single pod, all the policies are OR’ed.

*Network policies do not conflict; they are additive. If any policy or policies apply to a given pod for a given direction, the connections allowed in that direction from that pod are the union of what the applicable policies allow. Thus, the order of evaluation does not affect the policy result.*

**Network policy is namespace scoped:**

Network Policies are scoped to the namespace, which means it will affect the traffic of the pods in the namespace at which the policy is applied.

### Network Policy Resource definition:

A sample NetworkPolicy look like this:

```yaml

apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress: {}
  egress: {}
```

Just like any other Kubernetes resource, A NetPol (simplification of Network Policy) needs `apiVersion`, `kind`, and `metadata` fields. The `spec` section is also like any other k8s resource, mentions all the information needed for the Network policy.

**podSelector:**

Every Network Policy definition contains the `podSelector` field which defines which pods need to select. In the above policy definition, we used an empty selector `{}` means the policy will select all the pods in the namespace.

If we have to select the pods with specific labels, we use `matchLabels` to mention the labels.

```yaml
......
podSelector:
    matchLabels:
       role: db #Selects the pods with labels "role = db
......
```

**policyTypes:**

This field indicates the traffic flow direction in which the policy will be applied. It can be Ingress, Egress, or both. If no `policyTypes` are specified on a NetworkPolicy then by default `Ingress` will always be set and `Egress` will be set if the NetworkPolicy has any egress rules.

**Actual rules:**

Each network policy has a rules section named `ingress` and `egress` based on the policy type you mentioned. These sections define the actual rules that need to be satisfied before the traffic is allowed to your pod.

* `ingress`: This section contains the ingress-allowed rules. It has sections `from` and `ports` which defines from which pod/namespace/ipBlock traffic is allowed at which port. In the above sample policy, we have used an empty selector, so it will allow all ingress.
    
* `egress`**:** Just like ingress, this section contains the egress-allowed rules. It has sections `to` and `ports` which defines to which pod/namespace/ipBlock traffic is allowed at which port.
    

Now that we know the basic concept of NetworkPolicy, let us create some scenarios to learn a bit more about them.

### **Scenario 1:**

**Use a network policy to restrict ingress traffic for pods with labels "type: critical" only to allow traffic from pods with labels "access: approved".**

* We have already created the pods that we will be using for this scenario.
    

![](/img/blog/implementing-kubernetes-network-policies-a-comprehensive-guide/893d3289-d604-495e-b997-6b06ed3c3266.png align="center")

* By default, if no Network Policy is applied all the pods can access other pods using IP or Service DNS name.
    

![](/img/blog/implementing-kubernetes-network-policies-a-comprehensive-guide/89bbbbfa-ed22-4a01-80fa-b86c3f9d3040.png align="center")

![](/img/blog/implementing-kubernetes-network-policies-a-comprehensive-guide/a6eb2494-70c5-466f-a6f3-d2af520a3f80.png align="center")

* We don't want this to happen, so let's create a Network Policy that will limit the ingress traffic to pods with labels "type: critical" to only allow traffic from pods with "access: approved" labels.
    

From the scenario statement, we see that the policy needs to apply to pods with labels `type: critical` (It is the podSelector section).

Also, we can see that it needs to ingress traffic from pods with labels `access: approved` (so we clearly have an ingress rule here).

Combining the above two points, we can have the following manifest.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: restrict-critical-ingress
spec:
  podSelector:
    matchLabels:
      type: critical
  ingress:
  - from:
    - podSelector:
        matchLabels:
          access: approved
```

But we are still not sure if it works as we intended or not. Let's apply it and test it out.

* Tried to access the pod with `type: critical` from pod with label `access: approved`. It can access the pod.
    
    ![](/img/blog/implementing-kubernetes-network-policies-a-comprehensive-guide/dea3d27d-de0e-4915-aaa1-dd40a1627cb9.png align="center")
    
* You probably wondering what's so interesting here !!! It has access earlier too. Yes, it has access earlier too, but earlier the `test-pod` also has access to the `critical-pod`. But let us try it now.
    
    ![](/img/blog/implementing-kubernetes-network-policies-a-comprehensive-guide/f40cf1cb-3ca7-42f7-92f6-297169524ed9.png align="center")
    
* As you can see, the `test-pod` can't access `critical-pod` now. But why? It is happening because we did not mention any ingress rule for `test-pod` access `critical-pod.` So it failed to access.
    

Our Network Policy works 🥳. This way you can use Network policies to limit the traffic to/from the pods in a namespace.

### **Scenario 2:**

Consider a situation where you deployed pods in several namespaces, but you don't want all of them to have access to each other and you have several restrictions on which pods and which ports need to have access. Will Network Policies help in such cases?

Let's find it out.

* For this scenario, We have deployed pods in `alpha`,`beta` and `gamma` namespaces. We want our pods in `alpha` namespace with labels `type: kubesimplify` needs to be accessed from all pods from the namespace `gamma` and also pods with labels `access: community`. We don't want any Egress connectivity to the pod except at port 53.
    
    Sounds complex? It is not. Let us break down the entire problem statement into simple rules.
    
    * Namespace in which the policy needs to be applied is the namespace in which the pod is deployed = `alpha`
        
    * Policy needs to be enforced on pods with labels `type: kubesimplify` . So podSelctor sections use these labels.
        
    * Pods in the namespace `gamma` need to have access and also pods with labels `access: community` should have access. So ingress from rules would be as follows.
        
        ```yaml
        ...
        ingress:
            - from:
               - podSelector:
                   matchLabels:
                     access: community
                 namespaceSelector: {} #These pods can be in any namespace
            - from:
               - namespaceSelector:
                   matchLabels:
                     name: gamma
        ...
        ```
        
    * All egress connectivity is restricted except at port 53. So our egress rule can be written as follows:
        
        ```yaml
        egress:
         -  ports:
              - protocol: UDP
                port: 53
              - protocol: UDP
                port: 53
        ```
        
    
    Combining all the above rules into a single manifest will look as follows.
    
    ```yaml
    apiVersion: networking.k8s.io/v1
    kind: NetworkPolicy
    metadata:
      name: kubesimplify-access
      namespace: alpha
    spec:
      podSelector:
        matchLabels:
          type: kubesimplify
      ingress:
      - from:
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              access: community
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: gamma
      egress:
      - ports:
          - protocol: TCP
            port: 53
          - protocol: UDP
            port: 53
      policyTypes:
      - Ingress
      - Egress
    ```
    
    I have applied the above Network Policy. To see more information about policy details, use `kubectl describe netpol <policy name>` .
    
* ![](/img/blog/implementing-kubernetes-network-policies-a-comprehensive-guide/ac53a690-0598-4384-9682-22cdd985e284.png align="center")
    

Let us perform a connectivity test to check if the policy is working as expected or not.

1. Pods in `gamma` the namespace should have access to `kubesimplify` pod which has the label `type=kubesimplify`.
    
    ![](/img/blog/implementing-kubernetes-network-policies-a-comprehensive-guide/1bbe5d5b-a7f4-4a96-a3a6-051ac1141df1.png align="center")
    
2. Pods with the label `access=community` should have access to `kubesimplify` pod.
    
    ![](/img/blog/implementing-kubernetes-network-policies-a-comprehensive-guide/fe4f9796-1315-451b-b7c9-36bb0ae924d8.png align="center")
    
3. All the traffic which is not part of the policy should be denied.
    

![](/img/blog/implementing-kubernetes-network-policies-a-comprehensive-guide/e46d0ae2-adba-46d2-8498-a54e66693353.png align="center")

1. Egress connectivity of pod with label `type=kubesimplify` should be restricted except on port 53 (nslookup uses port 53).
    
    ![](/img/blog/implementing-kubernetes-network-policies-a-comprehensive-guide/ae96b2f6-c7a7-4853-a25b-8f749962ca97.png align="center")
    

Our policy works as expected.

These scenarios only explain the basic use cases of Network Policies. We can also implement network policies to allow traffic from a particular range of IPs and ports.

### Things you can't do:

Although Network Polices helps to control the traffic that is accessing the pods, it still cannot perform several things (not yet) such as:

* It cannot do anything related to TLS, you might need to use additional resources for that.
    
* You cannot target the services using their name.
    
* You cannot create default policies that will be applied to all namespaces and pods.
    
* You cannot log the network security events such as which requests are blocked, allowed, etc.
    
* You cannot directly write the deny rule in the policy.
    
* To know more restrictions visit [Kubernetes docs](https://kubernetes.io/docs/concepts/services-networking/network-policies/#what-you-can-t-do-with-network-policies-at-least-not-yet:~:text=a%20specific%20namespace.-,What%20you%20can%27t%20do%20with%20network%20policies%20(at%20least%2C%20not%20yet),-As%20of%20Kubernetes)
    

**Additional Resources:**

1. [Kubernetes docs](https://kubernetes.io/docs/concepts/services-networking/network-policies)
    
2. [https://editor.networkpolicy.io/](https://editor.networkpolicy.io/) - To create network policies using the visual editor.
    
3. [https://github.com/ahmetb/kubernetes-network-policy-recipes](https://github.com/ahmetb/kubernetes-network-policy-recipes)
    

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.