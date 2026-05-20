---
title: "Firewall: A Network's Gatekeeper"
seoTitle: "Firewall: A Network's Gatekeeper"
datePublished: 2023-01-03T12:30:42.507Z
slug: firewall-a-networks-gatekeeper
author: arnav-barman
cover: /img/blog/firewall-a-networks-gatekeeper/800f0009-a2f4-4ab7-8011-96ab4390e3c7.png
tags: ["cloud-computing", "firewall", "cybersecurity-1", "kubesimplify", "computernetwork"]
cuid: clcg7l9pp0227qenvg1vhfa6i
---
### 🌐Introduction

A firewall is a part of the computer system or network whose fundamental objective is to separate trusted and untrusted components of a network. It uses pre-defined rules/policies to establish a secure connection and stop unauthorized traffic from flowing from one network to another. It acts as a protective layer that filters data, redirect traffic, and protects against network attacks. A firewall can be based on software or hardware, depending on the use case.

A firewall is the first line of defense against malware or application layer attacks in the network domain. It assesses the flowing data packets for any suspicious activity in the network and blocks it using the policies set up while configuring the firewall.

![](/img/blog/firewall-a-networks-gatekeeper/c45154cd-f0e9-465b-a4d9-9d991328b87e.png align="center")

#### Requirements for a firewall

* All the traffic between any two zones must pass through the firewall.
    
* Only the traffic authorized by virtue of security policies should be allowed to pass through a firewall.
    
* The firewall must be impenetrable in itself.
    

#### The De-Militarized Zone (DMZ)

> While DMZ is a separate topic of its own, I have given a summary to explain its architecture and functioning in its most basic sense!
> 
> If you're someone who is intrigued by cybersecurity, then do check DMZs in more depth and how honeypots are placed in a DMZ to secure the network policies.

The DMZ is a subnet that can be configured logically and physically. The primary function of DMZ is to connect the public network to an organization's private network by sandwiching the organization's servers, which are in contact with the public network, between two firewalls. DMZs can be configured using one or two firewalls. Still, the better approach is to use two firewalls (preferably made by different vendors to reduce common vulnerabilities, if any) and then put the DMZ between them. The inner firewall has secure and tight policies, while the outer firewall is somewhat forgiving. The DMZ adds another layer of security to an organization's network structure by detecting a security flaw before it reaches the private LAN. Some servers usually placed in a DMZ are DNS, email servers, web servers, etc., as they are more prone to being attacked through the external network and provide services outside the LAN.

![](/img/blog/firewall-a-networks-gatekeeper/5a380ea4-ad2a-4173-96c6-6cc8df7ebe79.png align="center")

### 📝Firewall Policies & Actions

There are three kinds of policies on which the firewall authorizes the data:

1. **User Control**: Here, access to the requested data is based upon the requesting user's role. This kind of control is applied to users inside the parameter of the firewall. E.g., consider a university's network; the accounting department subnet here can access the financial database, but the systems on the faculty subnet don't have access to the same, etc.
    
2. **Service Control**: Controls access by the type of service the host offers. The rules are applied based on the network address, the protocol of the connection port, and the port numbers of services.
    
3. **Direction Control**: This ensures the direction in which the requests must be initiated and are allowed to flow through the firewall (inbound or outbound).
    

After applying the configured rules on the data packets, the firewall takes some predefined actions. These actions are:

1. **Accept**: Here, the data is allowed to enter through the firewall.
    
2. **Drop**: Here, the data is filtered outside and not permitted to flow through the firewall.
    
3. **Reject**: This action is the same as the Drop action. It only adds a rejection message to the source using an ICMP packet on top of the Drop action.
    
    > From the aspect of cybersecurity, one must keep in mind to use REJECT whenever the firewall must disallow the packet flow originating from a trusted source. But in the cases where the source is not trusted, one must always use the DROP action as it will not send back any message and lead to a timeout of the request from a potential attacker. E.g., if we send a REJECT message back to an attacker, it would get aware of the up-and-running status of the machine even after successful filtering of packets, whereas on using DROP, the attacker can not analyze anything to conclude the running status of a machine.
    

### 🔥Types of Firewalls

There are two kinds of filtering that are performed by a firewall:

* **Ingress Filtering**
    
    * Inspection of the incoming traffic to safeguard an internal network.
        
    * Blocks out the suspicious packets that are coming from outside.
        
* **Egress Filtering**
    
    * Inspection of the outgoing traffic to block the internal user's access to specific networks.
        
    * Blocks users from reaching out to the outside network. E.g., blocking social networking sites, etc.
        

Now, depending on the mode of operation, there are three types of firewalls:

#### 1\. Packet Filtering Firewall

* This type of firewall controls the traffic based on the information stored in the network and transport layer headers of the data packet, without paying attention to the packet's payload data.
    
* The firewall does not maintain the states of packets. Hence, it is also called the **Stateless Firewall**.
    
* The firewall does not care if the packet is a part of an existing data stream. It verifies the header information, nevertheless.
    

![](/img/blog/firewall-a-networks-gatekeeper/729f1c6d-eb8c-4cb7-936b-3eebe721df10.png align="center")

#### 2\. Stateful Firewall

* This type of firewall tracks traffic states by monitoring all the connection interactions until the connection is closed.
    
* A table for states of connection of packets is maintained to keep track of information.
    
* E.g., the firewall can be configured to allow packet flow in already open port connections.
    

![](/img/blog/firewall-a-networks-gatekeeper/f91fe3b0-f4c4-4e4f-8a2c-6922e0fa7a99.png align="center")

#### 3\. Application/ Proxy Firewall

* Such a firewall acts as a proxy between private and public networks. The client's connection terminates at the proxy, and a separate connection is initiated from the proxy to the destination server.
    
* The data analysis is done up to the application layer in the application firewall.
    
* Such a firewall controls inputs, outputs, and access to/from an application or a service.
    
* The proxy behaves like an intermediary by impersonating the intended recipient.
    
* Typically, an application firewall is set up to be used as a proxy. The general one is the web proxy (to control what the browsers can access). To set this up, we place them on a network bridge between the internal and external networks and configure all the web traffic to be routed through them.
    
* A proxy can also be used to avoid egress filtering. E.g., if a firewall filters packets based on the destination IP address, then we can route our packets to the proxy's IP address configured to be accepted by the firewall, which then forwards our query to the desired destination.
    
* Another use of a proxy is to anonymize the origin of a network request from servers. As the request will contain the IP of the proxy, the servers will have no clue about the actual origin of the request.
    

![](/img/blog/firewall-a-networks-gatekeeper/6a21d16a-9a00-4f0a-af7c-754267da4e7e.png align="center")

### 👀How to bypass firewalls?

#### 1\. SSH Tunneling

Let's say our firewall blocks traffic on port 23 (Telnet). To access a telnet server inside the firewall, we can set up an SSH connection on port 22 between a server outside the network and a client (with an open port 23) inside the network. Now the client can connect with the telnet server within the network and route its data through the ssh connection to the external server, thereby tunneling the blocked data through the firewall.

![](/img/blog/firewall-a-networks-gatekeeper/28845917-6718-4f55-89f0-dc7e763a8342.png align="center")

#### 2\. VPNs

We can encapsulate our data within IP packets and send it across the firewall through a tunnel between an internal and external system created using VPN. As the tunnel traffic is encrypted, the firewall is unaware of the contents, and the blocked content can bypass the firewall filtering.

#### 3\. Other methods to evade firewalls

There are many more methods of bypassing a firewall. Some of the most popular ones are:

* Dynamic port forwarding
    
* Banner Grabbing
    
* Fragmenting Packets
    
* Firewalking
    
* Source Routing
    
* IP address spoofing
    
* MAC Address spoofing
    
* Through XSS Attack
    
* And many more…
    

---

Follow Kubesimplify on [**Hashnode**](https://blog.kubesimplify.com/), [**Twitter**](https://twitter.com/kubesimplify)**,** and [**LinkedIn**](https://www.linkedin.com/company/kubesimplify/). Join our Discord server to learn with us.

Like the explanation? Want to [connect](https://twitter.com/barman_arnav)? You can find me [**here**](https://linktr.ee/arnav_barman). Till then, happy learning!

---