---
title: "How to backup Kubernetes with Kasten Community Edition?"
seoTitle: "How to backup Kubernetes with Kasten Community Edition?"
seoDescription: "Data protection has become one of the fundamental aspects of IT security. The need to back up data is no longer just an \"Enterprise endeavor\"."
datePublished: 2022-04-25T12:33:35.423Z
slug: how-to-backup-kubernetes-with-kasten-community-edition
author: geoff-burke
cover: /img/blog/how-to-backup-kubernetes-with-kasten-community-edition/JcOTKF3Pc.png
tags: ["kubernetes", "beginners", "backup", "k8s"]
cuid: cl2epagie04khetnv8due5xvs
---
Data protection has become one of the fundamental aspects of IT security. The need to back up data is no longer just an "Enterprise endeavor" but also essential for the average user in both offices and homes.

The situation with Kubernetes is no different. While Kubernetes has many self-healing features and is very robust, nevertheless it is also vulnerable to all the threats that exist for conventional IT systems.

Today, I want to walk you through your own Kubernetes backup exercise. We will start by creating a Minikube single node cluster on Windows 11. We will then deploy a simple application and back it up, leveraging Kasten by Veeam community edition. 

To start off with, we will install the windows package manager Chocolatey. The installation instructions can be found here: [https://chocolatey.org/install](Link) 

In fact, all you need to do to perform the installation is to enter this PowerShell command:

```
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

You should see something like this as the installation progresses:

![Picture1.png](/img/blog/how-to-backup-kubernetes-with-kasten-community-edition/DEmjEvVKl.png)

Now that Chocolatey is ready, we are all set to install Minikube and some other components necessary for our project.

Using chocolatey is very simple and in order to install Minikube we need only type 

```
choco install minikube
```

It will ask to confirm the script run:


![Picture1.png](/img/blog/how-to-backup-kubernetes-with-kasten-community-edition/xKOlvj_JT.png)

We also want to install helm. Helm is a package manager for Kubernetes and later on we will use it for our Kasten deployment:

choco install kubernetes-helm
 
If you are used to using Linux bash CLI, then you can also install the Windows subsystem for Linux by typing:

```
wsl --install
```



This will require a reboot. 

![Picture1.png](/img/blog/how-to-backup-kubernetes-with-kasten-community-edition/LaEwbT3rk.png)

It is now time to set up our cluster. We are going to use Kubernetes version 1.22.3 and enable some add-ons that will help us emulate production, like volumesnapshots and the csi-hostpath-driver. In my Windows 11 I enabled Hyperv, but you could also use Virtualbox.



```
minikube start --addons volumesnapshots,csi-hostpath-driver --container-runtime=containerd --kubernetes-version=1.22.3 --vm-driver=hyperv --force
```

After completing, you should see something like this:

![Picture1.png](/img/blog/how-to-backup-kubernetes-with-kasten-community-edition/6B2QdD4VB.png)

We want our csi-hostpath-sc (storageclass) to be the only storageclass in the cluster, so we will disable the default storage class that comes with Minikube:

```
minikube addons disable default-storageclass
```

We will now edit our csi-hostpath-sc and make it the default one by typing:

```
kubectl edit sc csi-hostpath-sc
```

which in windows will open notepad, and we want to change the false to true in here:


![Screen Shot 2022-04-16 at 5.01.54 PM.png](/img/blog/how-to-backup-kubernetes-with-kasten-community-edition/Oto3_X1TQ.png)

We are now ready to install our application:


First, let's create a namespace named nginx:


```
kubectl create ns nginx
```

Next copy this the contents of this file below into a file called nginx.yaml


```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: nginxpvcclaim
  namespace: nginx
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 1Gi
---
kind: Pod
apiVersion: v1
metadata:
  name: nginxwebsite
  namespace: nginx
  labels: 
    run: nginx
spec:
  volumes:
    - name: storage
      persistentVolumeClaim:
       claimName: nginxpvcclaim
  containers:
    - name: nginxwebsite
      image: nginx
      ports:
        - containerPort: 80
          name: "http-server"
      volumeMounts:
        - mountPath: "/usr/share/nginx/html"
          name: storage
```

Now create the application


kubectl create -f nginx.yaml

This will create a pod with persistent storage that we can backup later.


![Screen Shot 2022-04-16 at 10.06.05 PM.png](/img/blog/how-to-backup-kubernetes-with-kasten-community-edition/h1oE3jJDZ.png)

It is now time to install Kasten.

The Kasten documentation can be found here: [https://docs.kasten.io/latest/](Link)

Let's create a namespace:

```
kubectl create ns kasten-io
```

Add the Kasten helm repo

```
helm repo add kasten https://charts.kasten.io/
```

We will need to tell Kasten what the default snapshotclass is with this command:

 ```
kubectl annotate volumesnapshotclass csi-hostpath-snapclass k10.kasten.io/is-snapshot-class=true
```

We are ready now to install. 

```
helm install k10 kasten/k10 -namespace=kasten-io --set global.persistence.storageClass=csi-hostpath-sc
```

You should now see this:


![Screen Shot 2022-04-17 at 10.00.54 AM.png](/img/blog/how-to-backup-kubernetes-with-kasten-community-edition/KAMYnCiP3.png)

After a few minutes, the Kasten Dashboard should be accessible :

```
kubectl --namespace kasten-io port-forward service/gateway 8080:8000
```

Open your browser and head to address:

http://127.0.0.1:8080/k10/#/


![Screen Shot 2022-04-17 at 10.15.29 AM.png](/img/blog/how-to-backup-kubernetes-with-kasten-community-edition/_BqFNrI-f.png)

After filling in the email and company name, you should now see the dashboard:


![Screen Shot 2022-04-17 at 10.18.22 AM.png](/img/blog/how-to-backup-kubernetes-with-kasten-community-edition/s71aBB-St.png)

If we go to unmanaged applications 


![Screen Shot 2022-04-17 at 10.19.00 AM.png](/img/blog/how-to-backup-kubernetes-with-kasten-community-edition/JeiT1T0Po.png)

The nginx namespace that was created earlier will be visible


![Screen Shot 2022-04-17 at 10.19.33 AM.png](/img/blog/how-to-backup-kubernetes-with-kasten-community-edition/9DjM3tR0h.png)


Let's create a simple backup policy by pressing the "Create a Policy" button:


![Screen Shot 2022-04-17 at 10.20.32 AM.png](/img/blog/how-to-backup-kubernetes-with-kasten-community-edition/-TNRg12vE.png)


We will leave the defaults and press create policy.

The Policy should be created, and we can press run one and try it out:


![Screen Shot 2022-04-17 at 10.21.51 AM.png](/img/blog/how-to-backup-kubernetes-with-kasten-community-edition/_McbBFj9X.png)


![Screen Shot 2022-04-17 at 10.23.06 AM.png](/img/blog/how-to-backup-kubernetes-with-kasten-community-edition/NBS7Fh74B.png)


Back on the dashboard, we can see the policy running:


![Screen Shot 2022-04-17 at 10.23.37 AM.png](/img/blog/how-to-backup-kubernetes-with-kasten-community-edition/i6jFog4BY.png)

The backup was successful:


![Screen Shot 2022-04-17 at 10.24.24 AM.png](/img/blog/how-to-backup-kubernetes-with-kasten-community-edition/lg_6J3Qq6.png)


That was a basic Kubernetes backup setup with Kasten. You can do a lot more with Kasten, so please go through the [documentation](https://docs.kasten.io/latest/) and try out some of its other features.


Geoff Burke