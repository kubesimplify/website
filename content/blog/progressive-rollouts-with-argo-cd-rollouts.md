---
title: "Progressive Rollouts with Argo CD & Rollouts"
datePublished: 2022-08-16T12:31:00.387Z
slug: progressive-rollouts-with-argo-cd-rollouts
author: dipankar-das
cover: /img/blog/progressive-rollouts-with-argo-cd-rollouts/EV-JEEAPM.jpg
tags: ["software-development", "kubernetes", "argocd", "rollouts"]
cuid: cl6w5ye7o003qwlnv29a5bug9
---
# Progressing Rollouts
the process of releasing updates for an application in a controlled manner, thereby reducing the risk in the release, automated analysis is done using monitoring tools whether to promote or rollback

# Deployment Strategy
- Blue-Green -- 
here the Stable version is Blue and the new Version is green when the new Version is rolled out then all the traffic is routed to the new version after testing is done keeping the blue version there for some time without traffic when conformed the blue version is removed and green version is promoted to the blue version
it's either blue or green, both cannot handle traffic simultaneously
 
- Canary --
here the stable version and new version(known as canary) are living side-by-side handling traffic on a ratio/percentage basis canary version is tested and promoted to higher traffic percentage till it gets to 100% where all the instances are replaced with the new version. 
it is more used because it can provide more granular control, to whom show the new site
some users signup for a beta release have a cache entry that corresponds to a canary key-value and seeing this info canary version is shown to that user


# Setup

using Kind cluster with Nginx Ingress
```sh
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
```

# install the ArgoCD & rollouts

```sh
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```

Controller inside the cluster
```sh
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
```

Kubectl plugin install

```sh
curl -LO https://github.com/argoproj/argo-rollouts/releases/latest/download/kubectl-argo-rollouts-linux-amd64
chmod +x ./kubectl-argo-rollouts-linux-amd64
sudo mv ./kubectl-argo-rollouts-linux-amd64 /usr/local/bin/kubectl-argo-rollouts

# Check whether its working
kubectl argo rollouts version
```

![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/tVkDmSXIo.png align="left")



# Blue-Green


![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/9b4_xv_lo.png align="left")

Click the 'Create Application'
```
fork the repo https://github.com/dipankardas011/PDF-Editor.git
select manual sync option
enable the auto-namespace creation
repo: https://github.com/<>/PDF-Editor.git
HEAD: main
path: deploy/blue-green
namespace: pdf-editor-ns
```

![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/vMW0x3MPH.png align="left")


![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/T-j9no4T4.png align="left")

now go and change the image version to 0.8-frontend in frontend in file deploy/blue-green/deploy.yml

![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/DWBfQ4T1k.png align="left")


![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/C72T3qYw2.png align="left")


![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/CiLuLaSmJ.png align="left")



![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/rIaMtCSjf.png align="left")

![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/xhE9AMtHS.png align="left")

![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/5FbmQSfEw.png align="left")

you can further see that is happening using the rollouts dashboard
```sh
kubectl argo rollouts dashboard
```
![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/8bQ5cMA__.png align="left")


![code.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/Ru9ZezdTi.png align="left")

## Cleanup
delete the application from the Argo CD UI

---

# Canary


![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/ptRIFbHh-.png align="left")

Click the 'Create Application'
```

select manual sync option
enable the auto-namespace creation
repo: https://github.com/<>/PDF-Editor.git
HEAD: main
path: deploy/canary
namespace: pdf-editor-ns

add this line to your /etc/hosts
127.0.0.1 pdf-editor

open your browser and go to http://pdf-editor
```

![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/v_vhkU8TT.png align="left")


![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/LtfUYRN0s.png align="left")

now edit the image of frontend to 0.8-frontend


![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/AbtVcxdvM.png align="left")


![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/L1U5Uw1yq.png align="left")


![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/10i3LmUZ7.png align="left")

from here you can resume the deployment by promote button or 
```sh
kubectl argo rollouts promote pdf-editor-frontend -npdf-editor-ns
```

refreshing the page, you will see the beta for some and stable in others
![image.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/fheq0B87S.png align="left")

you will notice that after promote, the frequency of beta version has increased

![code.png](/img/blog/progressive-rollouts-with-argo-cd-rollouts/qCHGn7j52.png align="left")


stableService = stable Service name
canaryService = canary Service name
stableIngress = ingress name
```
steps:
      - setWeight: 30     # it tells 30% traffic will go for canary and will remain as it is till manually promoted
      - pause: {}
```

## Cleanup
delete the application from the Argo CD UI

Hope this blog helps to give you a better understanding about progressing rollouts

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.
