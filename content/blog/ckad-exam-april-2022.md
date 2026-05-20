---
title: "CKAD Exam - April 2022"
seoTitle: "CKAD Exam - April 2022"
seoDescription: "This exam focuses on all the aspects of K8S which is required by a developer/admin to build, deploy, scale, and do other useful pieces of stuff for the appl"
datePublished: 2022-04-27T14:05:52.674Z
slug: ckad-exam-april-2022
author: navneet-nandan-jha
cover: /img/blog/ckad-exam-april-2022/-TBFC2QJl.jpeg
tags: ["kubernetes", "devops", "certification", "k8s", "technical-writing-1"]
cuid: cl2hngudy00hsbsnv1z5a4z3c
---
So, Yesterday I appeared for the **[Certified Kubernetes Application Developer (CKAD)](https://www.cncf.io/certification/ckad/)** exam, which is one of the coolest and simplest ones in the Kubernetes series of certifications.

This exam focuses on all the aspects of K8S which is required by a developer/admin to build, deploy, scale, and do other useful pieces of stuff for the applications. If we try to bullet point these, those would be:

- Application Design and Build
- Application Deployment
- Application Observability and Maintenance
- Application Environment, Configuration and Security
- Services and Networking

## Finally, he is talking about the exam !!

I don't  want to put "TL;DR" 😋 , So directly coming to the exam details:

After CNCF announces the changes in the CKAD exam pattern last year in Sep 2021, There are a few new things in the [curriculum](https://github.com/cncf/curriculum/blob/master/CKAD_Curriculum_v1.23.pdf)

- Define, build and modify container images
-  Use Kubernetes primitives to implement common deployment strategies (e.g. blue/ green or canary) 
- Use the Helm package manager to deploy existing packages
- Understand API depredations
- Discover and use resources that extend Kubernetes (CRD)
- Understand authentication, authorization and admission control

**There was at least one question from all the above points in the exam.** As far as I recall, most of them were 8% of the weightage.

### Scenarios:

There were total 16 questions in the exam that needed to be completed in 2 hours of time.


**Question 1 :**

* Deploy a pod name `james` with `nginx:alpine` image. 
* Create a secret name `sample-secret` with date `key1=value1`. 
* Add an environment variable `FRONT_ROW` and use the created secret's key1's value as value for the ENV variable.


**Question 2:**

* Create a Docker image with the given Dockerfile. Tag for the docker was given in the question.
* Export the docker image as OCI-format to create a tar file with that.

**Question 3:**

* Create a cronjob with the given name. Image, Schedule was given in the question.
* Keep 3 success and 2 Failed history configuration
* Terminate the pod after 8 seconds
* Run a job from the cronjob we created.

**Question 4:**

* Create a canary deployment for a given Application.
* Sent 30% of the traffic to the deployed canary pods. Service was already present for the application

**Question 5:**

* There was a deployment file that was defined as the k8s version 1.15. Like `apiVersion` was old, the definition file was also in the old format. We needed to change it according to the latest version of the Kubernetes, i.e. 1.23

**Question 6:**

* There was one application which was getting failed in some namespace. We need to find out the reason for the failure.
* Write the <namespace>/<app_name> in a mentioned file.
* Write down the `kubectl get events` for that failing application in a mentioned file.
* Fix the issue.

**Question 7:**

* There was an application running in some namespace which was getting failed due to low resource allocation, needed to assign it the proper resource.
* Scale the application to 5 pods.

**Question 8:**

* Deployment file was already given for an application. We needed to modify the apiVerision.
* Run a POD with 30001 user
* Disable privilege escalation for the pod

**Question 8:**

* Update a given deployment with the `RollingUpdate` strategy
* Surge 5 and max unavailable 40%

**Question 9:**

* Application architecture was given in a diagram. We needed to create a Network Policy for the database pods to accept the traffic only from the API pods.
* Needed to create a network policy to deny all requests to the frontend from a specific IP.

**Question 10:**

* Create a `pod` with the Nginx image and expose that pod to port 8083 port. Labels were given for the pod which we needed to use in the POD definition file.
* Create a `service` for that pod and expose that to a NodePort 30080 port

**Question 11:**

* Create a persistent volume with the given access modes, type and storage 1Gi. The name of the PV was given.
* Create a persistent volume claim with the 200Mi. PVC name  was given
* Use this in a Deployment definition file and send the log of the pod to the volume attached at the given location.

**Question 12:**

* Create a Pod definition file with the given name, image and labels. 
* Run the given command at the startup of the pod.

**Question 13:**

* Deployment rollout with the image change without changing the Deployment file.
* Return to the previous version of the rollout



A couple of more questions were there, which I am not able to recall right now. As I will remember them, I will keep on adding them.

### Time Management is the key:

Time Management is very important in these exams. You need to have enough practice for the kubectl commands (Imperative commands) to identify the issues, Listing, making changes. This saves a lot of time.

That's all for this blog. Feel free to drop comments if you have any further questions :)









