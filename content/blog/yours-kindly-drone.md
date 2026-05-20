---
title: "Yours Kindly Drone"
seoTitle: "kind kubernetes drone"
datePublished: 2022-07-19T12:14:23.997Z
slug: yours-kindly-drone
author: kamesh-sampath
cover: /img/blog/yours-kindly-drone/chcw235Fw.jpg
tags: ["cloud", "docker", "kubernetes", "cicd", "drone"]
cuid: cl5s516uw0505scnv46j0eohc
---
# Overview

Over the past few years, lots of organizations have started to adopt Cloud Native architectures. Despite the adoption of Cloud Native architectures, many companies haven’t achieved optimal results. Wondering why? One of  the reasons is our adherence to traditional ways of building and deploying Cloud Native applications.

[Kubernetes](https://kubernetes.io) has become the de facto Cloud Native deployment platform, solving one of the main Cloud Native problems: "deploying" applications quickly, efficiently and reliably. It offers radically easy scaling and fault tolerance. Despite this, not many Continuous Integration(CI) systems utilize the benefits of Kubernetes. None of the existing build systems offer the capabilities that are native to Kubernetes like in-cluster building, defining the build resources using CRDs, leveraging underlying security and access controls, etc. These missing features of Kubernetes made the Cloud Native architectures to be less effective and more complex.

Let me introduce an Open Source project [Drone](https://drone.io) --  a cloud native self-service Continuous Integration platform -- . 10 years ago old Drone was the first CI tool to leverage containers to run pipeline steps independent of each other., Today, with over 100M+ Docker pulls, and the most GitHub stars of any Continuous Integration solution, Drone offers a mature, Kubernetes based CI system harnessing the scaling and fault tolerance characteristics of Cloud Native architectures. Drone help solve the next part of the puzzle by running Kubernetes native in-cluster builds.

In this blog, let see how we setup [kind](https://kind.sigs.k8s.io/) and Drone together on our laptops to build Kubernetes native pipelines which could then be moved to cloud platforms like [Harness CI](https://harness.io/) for a broader team based development.

This blog is a tutorial where I explain the steps required to use KinD and Drone to set up CI with Kubernetes on your local machine. At the end of these steps, you will have a completely functional Kubernetes + CI setup that can help you build and deploy Cloud Native applications on to Kubernetes on your laptop.

## Required tools 

To complete this setup successfully, we need the following tools on your laptop,

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker on Linux
- [kind](https://kind.sigs.k8s.io/)
- [Helm](https://helm.sh/)
- [Kustomize](https://kustomize.io/)
- [Kubectl](https://kubernetes.io/docs/tasks/tools/)
- [envsusbst](https://www.man7.org/linux/man-pages/man1/envsubst.1.html)

All linux distributions adds **envsubst** via [gettext](https://www.gnu.org/software/gettext/) package. On macOS, it can be installed using [Homebrew](https://brew.sh/) like `brew install gettext`.

## Demo Sources

The accompanying code for this blog i.e. the demo sources is available on my [GitHub repo](https://github.com/kameshsampath/drone-on-k8s). Let us clone the same on to our machine,

```shell
git clone https://github.com/kameshsampath/drone-on-k8s && \
  cd "$(basename "$_" .git)"
export PROJECT_HOME="${PWD}"
``` 
> **NOTE**: Through out this blog we will use the  name `$PROJECT_HOME` to refer to demo sources folder that we cloned above .

Alright, we are all set to get started!!

 ## Setup Kubernetes Cluster

As said earlier, we will use kind as our local Kubernetes cluster. But for this blog we will do the following customisations,

- Set up a local container registry where we can push and pull container images that will be used in our Kubernetes. Check the kind [docs](https://kind.sigs.k8s.io/docs/user/local-registry/) for more details.
- Do extra port mappings to make allow us to access the Drone Server and [Gitea](https://gitea.com/) git repository 

To make things easier, all the aforementioned customisations has been compiled into a utility script [$PROJECT_HOME/bin/kind.sh](https://github.com/kameshsampath/drone-on-k8s/blob/main/bin/kind.sh). To start the KinD cluster with these customisations just do,

```shell
$PROJECT_HOME/bin/kind.sh
```

## Version Control System

Without *Version Control System(VCS)* CI makes no sense. One of the primary goal of this blog is to show how to run local VCS  so that you can build your applications without a need for external VCS like GitHub, Gitlab etc.,  For our setup we will use on [Gitea](https://gitea.com/) -- A painless, self-hosted Git service--. Gitea is so easy to set up and does provide [helm charts](https://docs.gitea.io/en-us/install-on-kubernetes/) for Kubernetes based setup.

### Helm Values

The contents of the helm values [file](https://github.com/kameshsampath/drone-on-k8s/blob/main/helm_vars/gitea/values.yaml) that will be used to setup Gitea is shown below. The settings are self-explanatory for more details check the [cheat sheet](https://docs.gitea.io/en-us/config-cheat-sheet).

```yaml
service:
  http:
    # the Kubernetes service gitea-http'  service type
    type: NodePort 
    # the gitea-http service port
    port: 3000
    # this port will be used in KinD extra port mappings to allow accessing the 
    # Gitea server from our laptops
    nodePort: 30950
gitea:
  # the admin credentials to access Gitea typically push/pull operations
  admin:
    # DON'T use username admin as its reserved and gitea will 
    # fail to start
    username: demo
    password: demo@123
    email: admin@example.com
  config:
    server:
      # for this demo we will use http protocol to access Git repos
      PROTOCOL: http
      # the port gitea will listen on
      HTTP_PORT: 3000
      # the Git domain - all the repositories will be using this domain
      DOMAIN: gitea-127.0.0.1.sslip.io
      # The clone base url e.g. if repo is demo/foo the clone url will be 
      # http://gitea-127.0.0.1.sslip.io:3000/demo/foo
      ROOT_URL: http://gitea-127.0.0.1.sslip.io:3000/
    webhook:
      # since we will deploy to local network we will allow all hosts
      ALLOWED_HOST_LIST: "*"
      # since we are in http mode disable TLS
      SKIP_TLS_VERIFY: true
```

Add the gitea helm repo,

```shell
helm repo add gitea-charts https://dl.gitea.io/charts/
helm repo update
```

Run the following command  to deploy Gitea,

```shell
helm upgrade \
  --install gitea gitea-charts/gitea \
  --values $PROJECT_HOME/helm_vars/gitea/values.yaml \
  --wait
```

A successful deployment of gitea should show the following services in the *default* namespace when running the command,

```shell
kubectl get pods,svc -lapp.kubernetes.io/instance=gitea

```

```shell
NAME                                  READY   STATUS    RESTARTS   AGE
pod/gitea-0                           1/1     Running   0          4m32s
pod/gitea-memcached-b87476455-4kqvp   1/1     Running   0          4m32s
pod/gitea-postgresql-0                1/1     Running   0          4m32s

NAME                                TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
service/gitea-http                  NodePort    10.96.55.25     <none>        3000:30950/TCP   4m32s
service/gitea-memcached             ClusterIP   10.96.176.235   <none>        11211/TCP        4m32s
service/gitea-postgresql            ClusterIP   10.96.59.23     <none>        5432/TCP         4m32s
service/gitea-postgresql-headless   ClusterIP   None            <none>        5432/TCP         4m32s
service/gitea-ssh                   ClusterIP   None            <none>        22/TCP           4m32s
```

## Environment Variables

As a convenience let us set few environment variables which will be used by the commands in upcoming sections of the blog.

### Gitea

```shell
# Gitea domain
export GITEA_DOMAIN="gitea-127.0.0.1.sslip.io"
# Gitea URL
export GITEA_URL="http://${GITEA_DOMAIN}:3000"
```

You can access Gitea in your browser like open `${GITEA_URL}`. Default credentials `demo/demo@123`.

![Gitea Home](/img/blog/yours-kindly-drone/hH6gMkXZs.png align="left")

### Drone

```shell
# the drone server host
export DRONE_SERVER_HOST="drone-127.0.0.1.sslip.io:8080"
# the drone server web console
export DRONE_SERVER_URL="http://${DRONE_SERVER_HOST}"
```

## Drone Gitea oAuth Application

Drone will use Gitea for pulling/pushing the source code and to add [webhooks](https://docs.gitea.io/en-us/webhooks/) to trigger builds on source change. To do these actions it requires an [oAuth](https://en.wikipedia.org/wiki/OAuth) application to be configured on Gitea.  

The demo sources has little utility called `gitea-config` that helps in creating the oAuth application in Gitea and clone and create the [quickstart](https://github.com/kameshsampath/drone-k8s-quickstart) repository as **drone-quickstart** on Gitea. We will use  *drone-quickstart** repository to validate our setup.

```shell
$PROJECT_HOME/bin/gitea-config-darwin-arm64 \
  -g "${GITEA_URL}" -dh "${DRONE_SERVER_URL}"
```

> **NOTE**:  Use gitea-config binary corresponding to your os and architecture. In the command above we used macOS arm64 binary

![Drone Quickstart Repository](/img/blog/yours-kindly-drone/ftAF2w1Fc.png align="left")

![Drone Gitea oAuth2 Application](/img/blog/yours-kindly-drone/tQ5s7jwus.png align="left")

![Drone Gitea oAuth2 Application Details](/img/blog/yours-kindly-drone/r4OTjkDFF.png align="left")

The `gitea-config` utility creates a `.env` file under `$PROJECT_HOME/k8s`  which has few Drone environment variables that will be used while deploying Drone server in upcoming steps,

- `DRONE_GITEA_CLIENT_ID`:  The Gitea oAuth Client ID
- `DRONE_GITEA_CLIENT_SECRET`: The Gitea oAuth Client Secret
- `DRONE_RPC_SECRET`: The unique secret to identify the server and runner, a simple generation like `openssl rand -hex 16`

## Deploy Drone

For our demo the Drone server will be deployed on to a namespace called `drone`,

```shell
kubectl create ns drone
```

Add **drone** helm repo,

```shell
helm repo add drone https://charts.drone.io
helm repo update
```

The following content will be used as helm values [file](https://github.com/kameshsampath/drone-on-k8s/blob/main/helm_vars/drone/values.yaml) to deploy Drone server,

```yaml
service:
  # the Drone Kubernetes service type
  type: NodePort
  port: 8080
  # this port will be used in KinD extra port mappings to allow accessing the 
  # drone server from our laptops
  nodePort: 30980
  
extraSecretNamesForEnvFrom:
   # all the other as $PROJECT_HOME/k8s/.env variables are loaded via this secret
   # https://docs.drone.io/server/reference/
  - drone-demos-secret

env:
  # the Drone server host typically what the drone runners will use to 
  # communicate with the server
  DRONE_SERVER_HOST: drone-127.0.0.1.sslip.io:8080
  # Since we run Gitea in http mode we will skip TLS verification
  DRONE_GITEA_SKIP_VERIFY: true
  # The url where Gitea could be reached, typically used while 
  # cloning the sources
  # https://docs.drone.io/server/provider/gitea/
  DRONE_GITEA_SERVER: http://gitea-127.0.0.1.sslip.io:3000/
  # For this local setup and demo we wil run Drone in http mode
  DRONE_SERVER_PROTO: http
  
```

Run the following helm command to deploy Drone server,

```shell
helm upgrade --install drone drone/drone \
  --values $PROJECT_HOME/helm_vars/drone/values.yaml \
  --namespace=drone \
  --post-renderer  k8s/kustomize \
  --wait
``` 

A successful Drone deployment should show the following resources in *drone* namespace,

```shell
kubectl get pods,svc,secrets -n drone
```

```shell
NAME                         READY   STATUS    RESTARTS   AGE
pod/drone-5bb66b9d97-hbpl5   1/1     Running   0          9s

NAME            TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
service/drone   NodePort   10.96.184.123   <none>        8080:30980/TCP   9s

NAME                                 TYPE                 DATA   AGE
secret/drone-demos-secret            Opaque               3      9s
```

### Host Aliases

As you have noticed we use [Magic DNS](https://sslip.io/) for Gitea and Drone. This will cause name resolution issues inside the Drone and Gitea pods, because the url *gitea-127.0.0.1.sslip.io* resolves to *127.0.0.1* on the Drone server pod. But for our setup to work  we need *gitea-127.0.0.1.sslip.io*  to be resolved to the **gitea-http** Kubernetes service on our cluster. 

In order to achieve that we use the Kubernetes [host aliases](https://kubernetes.io/docs/tasks/network/customize-hosts-file-for-pods/) to add extra host entries(`/etc/hosts`) in Drone pods that will resolve *gitea-127.0.0.1.sslip.io* to the *ClusterIP* of the **gitea-http** service.

There are multiple techniques that allows us to add host entires to Kubernetes deployments.  The first one we used in the earlier helm command to deploy Drone server is called [helm post renderer](https://helm.sh/docs/topics/advanced/#usage). The post renderer allowed us to patch the Drone deployment from the helm chart  with the hostAliases for *gitea-127.0.0.1.sslip.io* resolving to **gitea-http's** *ClusterIP* address.

As we did with Drone deployments to resolve the Gitea, we also need to make the Gitea pods resolve the Drone server when trying to send the [webhook](https://docs.gitea.io/en-us/webhooks/) payload to trigger the build.  

This time let us use [kubectl patching](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/) technique to update the Gitea statefuleset deployments to resolve `drone-127.0.0.1.sslip.io`  to *drone* service's *ClusterIP* .

The [patch](https://github.com/kameshsampath/drone-on-k8s/blob/main/k8s/patch.json) that will be applied to the Gitea statefulset is as shown below.

```json
{
  "spec": {
    "template": {
      "spec": {
        "hostAliases": [
          {
            "ip": "${DRONE_SERVICE_IP}",
            "hostnames": ["drone-127.0.0.1.sslip.io"]
          }
        ]
      }
    }
  }
}
```

Run the following command to patch and update the gitea statefulset deployment,

```shell
export DRONE_SERVICE_IP="$(kubectl get svc -n drone drone -ojsonpath='{.spec.clusterIP}')"
kubectl patch statefulset gitea -n default --patch "$(envsubst<$PROJECT_HOME/k8s/patch.json)" 
```

> **TIP**:  To replace the environment variables in the patch we use [envsubst](https://www.man7.org/linux/man-pages/man1/envsubst.1.html)

Wait for the Gitea pods to be updated and restarted,

```shell
kubectl rollout status statefulset gitea --timeout 30s
```

You can check the updates to the  gitea pod's `/etc/hosts` file by running the command,

```shell
kubectl exec -it gitea-0 -n default cat /etc/hosts
```

It should have a entry like,

```shell
# Entries added by HostAliases.
10.96.184.123   drone-127.0.0.1.sslip.io
```

Where *10.96.184.123* is the **drone** service *ClusterIP* on my setup, run the following command to verify it,

```shell
kubectl get svc -n drone drone
```

```shell
NAME    TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
drone   NodePort   10.96.184.123   <none>        8080:30980/TCP   6m14s
```

You can do similar checks with Drone pods and ensure that Drone pods `/etc/hosts` has entry for *gitea-127.0.0.1.sslip.io* mapping to **gitea-http** *ClusterIP*.

What we did so far,

- Deployed a customized Kubernetes cluster using kind
- Deployed Gitea on to our Kubernetes cluster
- Deployed Drone Server on to our Kubernetes Cluster
- Created an oAuth application on Gitea to authorize Drone server
- Create a repository on Gitea that will be used to test our step

## Deploy Drone Kubernetes Runner

To run the Drone pipelines on Kubernetes we need deploy the [Drone Kubernetes Runner](https://docs.drone.io/runner/kubernetes/overview/).  

Deploy the `drone-runner-kube` with following [values](https://github.com/kameshsampath/drone-on-k8s/blob/main/helm_vars/drone-runner-kube/values.yaml),

```yaml
extraSecretNamesForEnvFrom:
   # all the other as env variables are loaded via this secret
  - drone-demos-secret
env:
  # the url to reach the Drone server
  # we point it to the local drone Kubernetes service drone on port 8080
  DRONE_RPC_HOST: "drone:8080"
```

Run the helm install to deploy the `drone-runner-kube`,

```shell
helm upgrade --install drone-runner-kube drone/drone-runner-kube \
  --namespace=drone \
  --values $PROJECT_HOME/helm_vars/drone-runner-kube/values.yaml  \
  --wait
```

Querying the Kubernetes resources on *drone* namespace should now return the `drone-runner-kube` pod and service,

```shell
kubectl get pods,svc -n drone -lapp.kubernetes.io/name=drone-runner-kube
```

```shell
NAME                                     READY   STATUS    RESTARTS   AGE
pod/drone-runner-kube-59f98956b4-mbr9c   1/1     Running   0          41s

NAME                        TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
service/drone-runner-kube   ClusterIP   10.96.196.54   <none>        3000/TCP   41s
```

Open the Drone server web console in your browser using the URL `${DRONE_SERVER_URL}` follow the on screen instructions to complete the registration and activation of our `drone-quickstart` repository.

![Drone Registration](/img/blog/yours-kindly-drone/4HOq0TrB2.gif align="left")

## Lets run our first pipeline

Let us clone the quickstart repository to the folder of our choice on our local machine,

```shell
git clone http://gitea-127.0.0.1.sslip.io:3000/demo/drone-quickstart
```

**NOTE**:  The default git credentials to push is `demo/demo@123`

Open the `drone-quickstart` project with your favorite editor, try to make some changes for e.g add some dummy text README to trigger a build.  Your build will fail as shown below,

![Drone Failed Build](/img/blog/yours-kindly-drone/2iv3XBeh4.gif align="left")

Don't worry, that's what we are going to fix now. We need to do the same thing of adding  **hostAliases** to our drone pipeline pods as well update the ` .drone.yml` with  **ClusterIP** of **gitea-http** and *hostnames* with entry for *gitea-127.0.0.1.sslip.io* so that our Drone pipeline pods are able to clone the sources from our Gitea repository.

The following snippet shows the updated `.drone.yml` with entries for host aliases,

> **NOTE**:  Your *ClusterIP* of **gitea-http* may vary, to get the *ClusterIP* of the **gitea-http** service run the command `kubectl get svc gitea-http -ojsonpath='{.spec.clusterIP}'`

```yaml
---
kind: pipeline
type: kubernetes
name: default

steps:
- name: say hello
  image: busybox
  commands:
  - echo hello world
- name: good bye hello
  image: busybox
  commands:
  - echo good bye

# updates to match your local setup
host_aliases:
  # kubectl get svc gitea-http -ojsonpath='{.spec.clusterIP}'
  - ip: 10.96.240.234
    hostnames:
      - "gitea-127.0.0.1.sslip.io"
  
trigger:
  branch:
  - main
```

Commit and push the code to trigger a new Drone pipeline build, and you will see it being successful.

![Drone Successful Build](/img/blog/yours-kindly-drone/TBBPrmhBD.gif align="left")

## Cleanup

When you are done with experimenting, you can clean up the setup by running the following command

```shell
kind delete cluster --name=drone-demo
```

## Summary

We now have a fully functional CI with Drone on Kubernetes. You no longer need to build your Cloud (Kubernetes) Native applications, but can Continuously Integrate with much ease and power.

Just summarize what we did in this blog,

- Deployed a customized Kubernetes cluster using kind
- Deployed Gitea on to our Kubernetes cluster
- Deployed Drone Server on to our Kubernetes Cluster
- Created an oAuth application on Gitea to authorize drone
- Created a repository on Gitea that will be used to test our step
- Deployed Drone Kubernetes runner to run pipelines on Kubernetes Cluster
- Built our Quick start application using Drone pipelines on Kubernetes
- Leveraged Kubernetes [host aliases](https://kubernetes.io/docs/tasks/network/customize-hosts-file-for-pods/) to  add host entries to our deployments to resolve local URLs
