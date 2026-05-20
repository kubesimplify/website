---
title: "Kubernetes backup using CloudCasa"
seoTitle: "Kubernetes backup using CloudCasa"
seoDescription: "Easy Kubernetes backup and restore using CloudCasa."
datePublished: 2022-04-06T06:25:02.878Z
slug: kubernetes-backup-using-cloudcasa
author: saiyam-pathak
cover: /img/blog/kubernetes-backup-using-cloudcasa/XkE5OJGt0.jpeg
tags: ["cloud", "kubernetes", "storage", "backup"]
cuid: cl1n6rbqv02d63vnv0xic4m5l
---
Kubernetes, over the years, has become the defacto standard for running containerized applications and it is also now growing in terms of running VM workloads side by side containers using the projects like KubeVirt. Running stateless workloads on Kubernetes is not the case these days, people are running databases and other stateful workloads on Kubernetes as well using persistent volume and persistent volume claim. In any case the need for Kubernetes backup and restore strategy should be in place from day1. You cannot wait for things to go wrong or data to get corrupted. 

There are different solutions out there that can help you with your strategy but in this post, I will focus on CloudCasa. 
CloudCasa is a simple backup service that allows Kubernetes users to run CSI snapshots across unlimited clusters for free. Improves your cyber resilience by also delivering free vulnerability assessments on what you protect.
Let me know if you want me to write a few posts on Kanister, Longhorn, Velero wrt Kubernetes backup. 

Let us try to understand it with a complete end to end example. 

### Step 1 Creating CloudCasa account

Go to cloudcasa.io and hit Signup.

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/DOTObPJuK.png)

Enter all the details and click the signup button.

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/tWTA8OiEe.png)

Verify the email and Login to get a fancy dashboard.

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/g6rCBJZ_o.png)

### Step 2 Adding a cloud account
Now add a cloud account from the configuration section and create the stack.

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/OkjlEhEWU.png)


![image.png](/img/blog/kubernetes-backup-using-cloudcasa/p-BMcrh8c.png)

It will automatically open up the console and take you to the required page, create the stack and you should see it getting created.

After some time you will be able to see the stack created in your AWS account.

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/WTTmfvBPj.png)

### Step 3 Adding a cluster

Now let's add the cluster, you can manually add the cluster or select from the list of clusters that gets populated in your account from the cloud account that you added.


![image.png](/img/blog/kubernetes-backup-using-cloudcasa/r3HHcvta-.png)

In this case, let's add a cluster to see that flow as well.
![image.png](/img/blog/kubernetes-backup-using-cloudcasa/jw-bdg3ot.png)

When you add the cluster, it gives out a command that needs to be run on the cluster to get the CloudCasa agent components to be installed into the cluster and take the necessary steps to backup/restore stuff.


![image.png](/img/blog/kubernetes-backup-using-cloudcasa/90VJ-Nf07.png)

Now I already have a cluster running 
```
kubectl get nodes
NAME                         STATUS   ROLES    AGE   VERSION
ip-10-0-1-231.ec2.internal   Ready    <none>   12d   v1.20.11-eks-f17b81
ip-10-0-2-227.ec2.internal   Ready    <none>   12d   v1.20.11-eks-f17b81
ip-10-0-3-193.ec2.internal   Ready    <none>   12d   v1.20.11-eks-f17b81
```
Let's run the command that we got above

```
kubectl apply -f https://api.cloudcasa.io/kubeclusteragents/rAwXghje_ajKlx7g2w-wAT5N8ICb06n4V09Tfs_3QDY=.yaml
namespace/cloudcasa-io created
serviceaccount/cloudcasa-io created
clusterrolebinding.rbac.authorization.k8s.io/cloudcasa-io created
deployment.apps/cloudcasa-kubeagent-manager created
```
The agent is deployed and the cluster becomes active on the CloudCasa dashboard.


![image.png](/img/blog/kubernetes-backup-using-cloudcasa/F8nbLAJuw.png)

### Step 4 - Define backups 
Let's define the backup now. 


![image.png](/img/blog/kubernetes-backup-using-cloudcasa/jJCqgIrTt.png)

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/YmEUHZu7c.png)

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/Eyle2ORTI.png)


![image.png](/img/blog/kubernetes-backup-using-cloudcasa/60XDz7LP9.png)

With a simple 4 step process, the backup is now defined.

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/7XZnStzPp.png)

The cluster has WordPress and MySQL installed already. 

### Step 5 - Running the backup

You can simply run the backup you created and see it in the activity area that it is running. 

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/EG2Bee2nS.png)

Notice the backup getting complete.


![image.png](/img/blog/kubernetes-backup-using-cloudcasa/wpXb3w7a2.png)

### Step 6 - Restore
You can easily restore from the backup to the same cluster or a different cluster, even in a different namespace. 

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/AAR5f_kts.png)


![image.png](/img/blog/kubernetes-backup-using-cloudcasa/g_guwnoXG.png)


![image.png](/img/blog/kubernetes-backup-using-cloudcasa/yDXUlEFJk.png)

It will start a restore job and after some time the restoration will be completed. 

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/0Oe5UDu7o.png)

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/WNahArFi7.png)

Was that too simple?? Yes, it was, that is what CloudCasa is all about, making it too simple to backup and restore Kubernetes clusters. 

## Advanced Restore 
CloudCasa has a special functionality that spins up a new EKS cluster automatically on the restore. In order to see this, you need to choose the auto-discovered EKS cluster and install the cloud casa agent on that. After that, you need to enable snapshot and copy when you define the backup.

Let's add the cluster `eks-test-2` that was auto-discovered by CloudCasa

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/XSbbBL2zp.png)

Run the agent on the cluster
```
kubectl apply -f https://api.cloudcasa.io/kubeclusteragents/yl4RaYF2n_9Icx9IVdeRhKcOOm2LgC4CL91aBJDBJj8=.yaml
namespace/cloudcasa-io created
serviceaccount/cloudcasa-io created
clusterrolebinding.rbac.authorization.k8s.io/cloudcasa-io created
deployment.apps/cloudcasa-kubeagent-manager created
```
The cluster becomes active in a few minutes.

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/g6fUnrNbE.png)

Now, let's defined the backup with `snap+copy` and run it.

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/xghx2p0Be.png)


![image.png](/img/blog/kubernetes-backup-using-cloudcasa/UYQML3MOo.png)

When you go to the restore section, you first select the copy to be restored.

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/VWIqeVM1k.png)

On the 3rd step, you choose `Create EKS Cluster`.

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/gxih-O7LM.png)

Now, in the next step, you enter/choose the AWS account, role and configuration(this is something CloudCasa will populate in the dropdowns and you just need to select from it). You can also go into your AWS account and create new roles by following the docs.


![image.png](/img/blog/kubernetes-backup-using-cloudcasa/daEafp5n7.png)

Once you hit save, the restoration job will start in some time you will be able to see the status from the dashboard.

Once the job is complete you can go back to your AWS console and see the cluster created successfully with the copy of backup, this is simply amazing!!

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/IblRx-PRW.png)

## Security Scanning 
Apart from backup and restore, CloudCasa also provides an option to run a curated set of vulnerability scans right from the dashboard.

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/ys7OMPUjV.png)


![image.png](/img/blog/kubernetes-backup-using-cloudcasa/9Hb0F_I_e.png)

Once the scan is complete, you can view the reports and see that there are a number of scans that are done. The report gives a great view of all the test cases that are being done with descriptions as well. This is a beta feature so I believe there is work to improve it. I would like to see the remediation steps and fix some of the things right from the browser.


![image.png](/img/blog/kubernetes-backup-using-cloudcasa/0lLB3z_AH.png)


It performs checks against the workloads, the benchmarks, and network scans as well!

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/CBrb7J15t.png)


![image.png](/img/blog/kubernetes-backup-using-cloudcasa/SmUvo0s3G.png)

So with the Backup/Restore you also get the power of scanning your cluster and making it more secure. The Backup/Restore and security of the cluster are the two most important areas that everyone should start implementing right from the beginning and CloudCasa is making these super simple. 

## Pricing 
CloudCasa has a transparent pricing model and a very generous free tier as well.

![image.png](/img/blog/kubernetes-backup-using-cloudcasa/ZiDZSTG-P.png)

The free plan is actually without a credit card with a 100 GB promotion or you can choose a premium service plan with monthly or annual pricing. Moreover, you only pay for PV data and all the plans give free etcd, PV, RDS snapshot management with no limit to worker nodes or clusters. 

Check out CloudCasa and give it a spin! 

Follow kubesimplify for more interesting articles like this. 
