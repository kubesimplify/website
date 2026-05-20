---
title: "Deploying Java Application using Docker and Kubernetes- DevOps Project"
datePublished: 2023-01-09T12:30:42.071Z
slug: deploying-java-application-using-docker-and-kubernetes-devops-project
author: tania-duggal
cover: /img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/c2aee5ea-eb42-456a-9d24-10fb31421a82.jpeg
tags: ["docker", "java", "kubernetes", "devops", "devopsproject"]
cuid: clcos8dda01hkxynv7zq2gco2
---
Hello Everyone, Welcome to the blog. In this blog, We going to see "How to Deploy a Java Application using Docker and Kubernetes". So, Let's start

The workflow of the project is going to be like this in the below image ⬇️⬇️

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/2d7bcb8d-e5ec-4edc-8c4e-d062f83fe445.png align="center")

So, You have already installed Docker, Git, Kubernetes and Maven in your system.

Firstly, start the minikube cluster to up the k8s cluster. Now, the k8s cluster is up.

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/a627d0d2-8a62-403d-be8f-ddff8da97074.png align="center")

You can do `kubectl cluster-info` to see the information of the cluster. You can see this here

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/5d1f73f3-c4cc-4965-b673-43d9db929a46.png align="center")

You must have maven installed on your system and set the maven home page. We use maven to build the application.  
Since I already installed maven on my system. To Check if your maven is installed or not. You can use `maven --version` to check the version of the maven in your system. If it provides the output, it means you successfully installed the maven.

Now, fork the project(Java Application) from GitHub. I used someone's Java application. You can go to my GitHub repo and fork it and can clone it.

Here's the link to my [repository](https://github.com/taniaduggal/docker-kubernetes-java-project)

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/fb91befc-29ad-4ddc-9cd7-b71e2b0f9e1b.png align="center")

Now, go into the repository. By doing `ls`, you can see the different microservices i.e productcatalogue, shopfront and stockmanager.

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/a646c094-c47d-4a05-a341-5f4904dc8e27.png align="center")

Now, we are going to build our microservices to get the jar file.  
Now, go into the shopfront microservice. By doing `ls`, you can see the files/folders inside the shopfront.

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/af1e5dea-9160-40ba-978c-89255749e7e2.png align="center")

You can build the shopfront microservice by using `mvn clean install` command.

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/80bbcf87-59c4-4512-a39b-9fd5e8d08c79.png align="center")

After the build success, you can see the target folder in the shopfront. In that, we have our jar file.

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/89dd149f-3bf6-4f45-b3c6-27dfef947757.png align="center")

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/415b9539-50df-4fbc-806b-919b963649f3.png align="center")

Now, You can build the image of your shopfront jar file from the dockerfile by using `docker build` command.

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/1b009438-1ece-48ce-8179-06518470f021.png align="center")

Let's, take a look at the dockerfile.

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/4133df31-ba67-410b-bf15-7f267d18ca1e.png align="center")

From: We call the base image for OpenJDK for the JRE file  
And: Add YAML and config files that are necessary  
We expose the port and give EntryPoint

You can check the image by `docker images` command. It lists all the images.

Now, you repeat the same steps for your other microservices.  
First, by `mvn clean install` command, get the jar file for the remaining microservices.  
Second, by `docker build` command, build the images of the remaining microservices.  
Now, after following the above steps, you can build your remaining images. You can see all the images by `docker images` command.

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/e2be0b18-3965-4ce5-8565-af4d63d89c20.png align="center")

Now, You have to push all your images to your docker account.

Now, login to your docker account by docker login. It asks for the username or password.

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/2f590e8d-74bf-401d-8fe0-35c79d7a7056.png align="center")

After the login succeeded, you can push your images to the dockerhub. You have to give the username of your docker account because if you don't give the username, you won't able to push the images because it has to understand from where the images are being pushed (from which account).

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/d17c7a93-aac7-4771-81fd-8cb0bf6f01c7.png align="center")

Now, you go to dockerhub, and you can see your images in your repository.

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/b13813b9-7a73-4c76-8b38-25daee689a77.png align="center")

Once you push your images, you can docker logout from dockerhub login from your system.

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/a6a59d2b-c889-48ec-a664-7c1147ea7f61.png align="center")

Now if I go to my application, there is a folder "Kubernetes". It contains the YAML files for each microservice.  
If you don't know about service and deployment, please refer to this [article](https://www.copado.com/devops-hub/blog/kubernetes-deployment-vs-service-managing-your-pods) .

Now, go to the Kubernetes folder. Here, You can see YAML files for each microservice.

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/e46da8cb-6681-43e8-b1ec-6693235ac9d5.png align="center")

Now, let's take a little bit look at one of the YAML files.

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/84c82955-a9c1-421c-9c7c-a49cb21f4c57.png align="center")

In the YAML file, we use "Deployment" and "Service" objects. Using a deployment allows you to easily keep a group of identical pods running with a common configuration. Once you have defined and deployed your deployment Kubernetes will then work to make sure all pods managed by the deployment meet whatever requirements you have set.

When using a Kubernetes service, each pod is assigned an IP address. As this address may not be directly knowable, the service provides accessibility, then automatically connects the correct pod. When a service is created it publishes its own virtual address as either an environment variable to every pod or, if your cluster is using coredns, as a DNS entry any pod can attempt to reach. In the event of any changes to the number of available pods the service will be updated and begin directing traffic accordingly with no manual action required.

Now, We are going to apply all the YAML files using `kubectl apply` command.

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/1b5b91ad-7758-41d5-ac17-2fe71323b033.png align="center")

Now, your Deployment and Service objects are created. You can see them by using `Kubectl get deployment` and `kubectl get svc` commands respectively.

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/1bba6e93-b0be-47ea-b57b-3caa3f8650a6.png align="center")

Now, it's time to access our microservices from the web. Now, do `minikube service microservicename` . It gives the URL to access the application. You can see this here

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/240c2471-2fa6-4444-a08d-3ed0c18a9431.png align="center")

Now, You'll go to your web browser and put the IP address there to access the microservice from the web browser. You can see this here

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/726a5b36-28ea-42ef-b4b6-ca93a4cfc745.png align="center")

Now, do the same for other microservices to access it from the web browser. You can see this here

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/bb414a0d-440e-4db5-b3dc-31d8f515dcca.png align="center")

![](/img/blog/deploying-java-application-using-docker-and-kubernetes-devops-project/10117f82-d12d-4d58-8b8d-ff6f7a3690a8.png align="center")

These all are the steps to deploy the Java application using Docker and Kubernetes. I hope🤷‍♂️ it should be helpful for you to understand the concepts✍️.

Don't forget to like and share this post. Connect with me on [Twitter](https://twitter.com/taniadtwt). Follow me for more such blogs on [Hashnode](https://hashnode.com/@taniaduggal).

Follow Kubesimplify on [Hashnode](https://blog.kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify), and [LinkedIn](https://www.linkedin.com/company/kubesimplify/). Join our Discord server to learn with us.