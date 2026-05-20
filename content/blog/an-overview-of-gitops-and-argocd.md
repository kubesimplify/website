---
title: "An overview of GitOps and ArgoCD."
datePublished: 2023-01-16T12:30:45.400Z
slug: an-overview-of-gitops-and-argocd
author: rakshit-gondwal
cover: /img/blog/an-overview-of-gitops-and-argocd/7ec955c6-736c-43a1-9b6b-f717a9ff32a5.png
tags: ["devops", "gitops", "argocd"]
cuid: clcysbepi00ew53nvcz3v04hn
---
## What is Gitops?

The basic definition of Gitops is "Infrastructure as Code" done right. Now, what is IaC (Infrastructure as code)? IaC means to define the whole infrastructure into code, not only infrastructure but also Network, Security, Configuration, and Policy.

![](/img/blog/an-overview-of-gitops-and-argocd/152cf9c5-c697-47a3-82d2-e56331108023.png align="left")

### IaC done right.

Now, what does "done right" mean in the definition of Gitops? Usually, we use IaC the wrong way. We go on to save the code in our local systems or use version control so that other members of the team or any other individual can collaborate. This might be a headache for you as everyone would be pushing their changes to the main branch directly without any checks or testing.

Things get even more troublesome when trying to push this code into the environment. You'll have to first test every change locally, verify that it doesn't break anything, and then push it to production. Thus, this process of manually testing and deploying the code is very inefficient and time-consuming.

This is where GitOps come into play. In this method, we have our infrastructure as a code and a CI/CD pipeline, in which we treat the infrastructure code the same as the application code.

In the GitOps method, the IaC is hosted on a git repository. In this method, a change is made in the form of a pull request to the repository rather than pushing it to the main branch directly.

  
After a change is made, it undergoes a CI(Continuous Integration) pipeline where automatic tests take place. After passing through this CI pipeline, any senior engineer, tester, or repository maintainer can approve the changes and allow the pull request to merge into the main change. This way there is no chance of any error or any other security issue.  
After merging it into the main branch, the change is directly deployed to the environment with the help of a CD(Continuous Deployment) pipeline.

Continuous Deployment can be done in two ways-

* Push Base Deployment: This is the traditionally used way by various tools like Jenkins, and Gitlab. Here, the pipeline executes a certain command to push the code to the environment.
    
* Pull Base Deployment: Here, we have an agent installed into our environment itself, which is linked to the repository itself. It keeps on checking for any change made to the repository and automatically pulls and deploys if there is any change.
    
    Tools that use the Pull Base Deployment are ArgoCD and FluxCD.
    

![](/img/blog/an-overview-of-gitops-and-argocd/f900ed31-3424-41d6-b35c-c96f3005bee7.png align="center")

![](/img/blog/an-overview-of-gitops-and-argocd/ed32e9ff-53e4-4e40-8f02-bcb629758734.png align="center")

# ArgoCD

ArgoCD is a continuous delivery tool that helps you to deploy your applications into multiple environment in a declarative and in the GitOps way.

### CD workflow without ArgoCD

Let's say we use Jenkins for the CI/CD pipeline. Now, when a new change gets committed into the main repository, it will undergo various builds and tests to test that it does not break anything. It might even build a new docker image. This whole process falls under the CI pipeline.  
Now Jenkins will push these changes to the environment using kubectl or helm or any other commands. I've stated the challenges we might face while any push-base deployment tool below:

1. The first challenge we face is to install tools like kubectl or helm.
    
2. The second challenge we might face is to provide Jenkins access to the Kubernetes cluster. If we are using EKS, we'll have to provide Jenkins access to the AWS. This might create a serious security risk.
    
3. The third challenge we face is that once Jenkins has deployed any change into the environment, it loses access to the cluster, making it impossible to check whether the change has been successfully deployed or not.
    

### CD workflow with ArgoCD

ArgoCD follows the GitOps principles, which means that it uses the pull-base deployment.  
ArgoCD is an agent which we install inside our Kubernetes cluster and then bind it to a git repository. ArgoCD will keep looking for any change in the repository and as soon as a change is made in the repository, ArgoCD will pull it and apply it to the Kubernetes cluster.  
Now, our configuration might contain more than just YAML files and might also contain secrets, services, ingress, hence it is a best practice to separate our application code and the configuration code into two different repositories.  
This way, there is would be no need to run the entire CI pipeline when there is a change to any service or any configuration.

This way, Jenkins will update the manifest file in the configuration repository and ArgoCD will auto fetch the change and apply it into the environment.

![](/img/blog/an-overview-of-gitops-and-argocd/a2eebf82-d67f-47a5-bac4-baf0eaa19e59.png align="center")

### Advantages of using ArgoCD

1. Everything is version controlled, means we can keep a check that who made which change.
    
2. We can easily rollback to any old state if anything breaks after applying any change.
    
3. Git is the single source of truth. Even if a change is made manually to the cluster, ArgoCD will keep a check on the desired state and the actual state. And since the actual state was changed, it will automatically roll back the changes made to the cluster. This way, ArgoCD keeps a check on both, the repository and the cluster itself.
    
4. Git allows us to set up access rules so that any team member can submit a pull request, while only senior members can merge. This way, we don't need to create ClusterRole and User resources in kubernetes.
    
5. Cluster disaster recovery: Suppose I have an EKS cluster in region 1-a and this cluster completely crashes, then I can make a new cluster and point it to the same git repository. This will create the same cluster with the same configuration as earlier.
    
6. We get a real time update of our application state even after the changes are made.
    

## ArgoCD Demo

### Configuring ArgoCD

ArgoCD is configured directly into the Kubernetes cluster itself, and it extends the Kubernetes API's with CRD's(custom resource definition). ArgoCD is installed in the Kubernetes cluster with the help of YAML file. In this file, we define which git repository should be synced with which Kubernetes cluster. It can be any git repository and any Kubernetes cluster rather, be it the cluster in which ArgoCD is installed or any other cluster that ArgoCD is managing.

If we have different cluster environments, such as deployment, staging, and production, then we deploy ArgoCD separately. All these environments are configured with one single git repository where all the configuration is stored.

### Installing ArgoCD into a k8s cluster.

* I am using minikube for a Kubernetes cluster, but you can use anything, be it either minikube or any cloud provider such as AWS, Civo, etc.
    
* Create an ArgoCD namespace.
    

```haskell
kubectl create namespace argocd
```

* Install the required services and application resources.
    

```haskell
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

* Run the following command to get the pods running inside the ArgoCD namespace.
    

```haskell
kubectl get pods -n argocd
```

The above should return the following code snippet.

```haskell
NAME                                                READY   STATUS    RESTARTS   AGE
argocd-application-controller-0                     1/1     Running   0          2m9s
argocd-applicationset-controller-74575b6959-v6nf5   1/1     Running   0          2m13s
argocd-dex-server-64897989f8-qxqsb                  1/1     Running   0          2m13s
argocd-notifications-controller-566bc99494-hmfzc    1/1     Running   0          2m12s
argocd-redis-79c755c747-524rj                       1/1     Running   0          2m12s
argocd-repo-server-bc9c646dc-9w5q8                  1/1     Running   0          2m12s
argocd-server-757fddb4d7-hgtp9                      1/1     Running   0          2m10s
```

### **Download the ArgoCD CLI**

* **Linux**
    

Using Homebrew.

```haskell
brew install argocd
```

Using Curl.

```plaintext
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64
```

* **Mac**
    

Using Homebrew.

```haskell
brew install argocd
```

Using Curl

```plaintext
VERSION=$(curl --silent "https://api.github.com/repos/argoproj/argo-cd/releases/latest" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')
```

### Access the ArgoCD UI.

* Port-forwarding can also be used to connect to the API server without exposing the service.
    

```haskell
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

The UI can then be accessed using [https://localhost:8080](https://localhost:8080)

### Login into the UI.

* Use `admin` for the username.
    
* Use the following command to get the password
    

```haskell
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```

### Creating a new application

* You will see a UI like this, after logging in.
    

![](/img/blog/an-overview-of-gitops-and-argocd/9858ad4b-32aa-4a3f-b2c7-c2d27b37cec9.png align="center")

* Click on `+ New App` to create a new application.
    
* Enter the following details to create a new application. For this demo, I am using [https://github.com/argoproj/argocd-example-apps](https://github.com/argoproj/argocd-example-apps) for the repository URL and [https://kubernetes.default.svc](https://kubernetes.default.svc) for the Cluster URL.
    
    ![](/img/blog/an-overview-of-gitops-and-argocd/4b29ad34-e58b-45f9-b01f-e11f25f0e471.png align="left")
    

![](/img/blog/an-overview-of-gitops-and-argocd/d83113f7-b263-4761-99b7-7603fd3e8f4d.png align="left")

![](/img/blog/an-overview-of-gitops-and-argocd/f8718152-4c72-46f6-bc1f-18e9dd1ce4af.png align="left")

* Click on \`Create\` on the top to create a new application.
    

### Deploying the application.

* Currently, the `guestbook` application is `OutOfSync` that means it is not deployed.
    
    ![](/img/blog/an-overview-of-gitops-and-argocd/856a3e68-222b-45c5-849d-efdcaad5a179.png align="left")
    
* To deploy the application, click on the `Sync` button and the application will automatically get deployed and would be in sync with the desired state.
    
    ![](/img/blog/an-overview-of-gitops-and-argocd/da7c2d85-a972-41da-b499-ec41f9e8f094.png align="left")
    

The application is now in sync with the provided git repository, and ArgoCD is constantly looking for changes made to the git repository.

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [LinkedIn](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.