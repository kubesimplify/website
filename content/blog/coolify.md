---
title: "Cool Cool Coolify..."
seoTitle: "Coolify - an open-source & self-hostable Heroku / Netlify alternative"
datePublished: 2022-03-31T04:01:48.891Z
slug: coolify
author: saiyam-pathak
cover: /img/blog/coolify/tDVqhUc5R.jpeg
tags: ["docker", "paas", "heroku", "netlify"]
cuid: cl1eh00lc01guaynv13oe3qhx
---
It's not a fancy title!! **[Coolify](https://coolify.io/)** is actually a new fancy product that is an open-source & self-hostable Heroku / Netlify alternative!

## Let's try it out right away??

You can simply install Coolify which runs docker containers (it will automatically install docker if docker is not present on the system)

Install command 

```
/bin/bash -c "$(curl -fsSL https://get.coollabs.io/coolify/install.sh)"
```

![image.png](/img/blog/coolify/9vMcmttdy.png)

```
docker ps
CONTAINER ID   IMAGE                       COMMAND                  CREATED         STATUS         PORTS                                       NAMES
5e84a926eeb4   coollabsio/coolify:latest   "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes   0.0.0.0:3000->3000/tcp, :::3000->3000/tcp   coolify
5c5410613754   bitnami/redis:6.2           "/opt/bitnami/script…"   2 minutes ago   Up 2 minutes   6379/tcp                                    coolify-redis
```

Deployment to Kubernetes is WIP -> I am excited about this !! 


Let's open up the UI - Excited to see how this looks !! 
Just after registering a test user, you get this fancy UI.

![image.png](/img/blog/coolify/obQ5a-XSZ.png)

There is one destination that is local docker. 

## Application deployment from git

Let's quickly create an application by adding  GitHub as the source for applications -

![image.png](/img/blog/coolify/ORlsJYlCN.png)


Next, create the GitHub app -

![image.png](/img/blog/coolify/29wuXpeZN.png)

Next would be to add repositories -

![image.png](/img/blog/coolify/v2R1sLVZ3.png)

Now I can select the repo and branch (Argo,main in my case)

![image.png](/img/blog/coolify/r8EA3Dl4A.png)

Choose local docker and build a pack for it -

![image.png](/img/blog/coolify/ieYBTZNWR.png)

Provide the details for the app and you will be able to see the logs. 

![image.png](/img/blog/coolify/vWieKSw0k.png)

![image.png](/img/blog/coolify/KKzlNicGe.png)

THATS IT!!! your application is deployed with https using coolify!!

![image.png](/img/blog/coolify/aF0aOfa29.png)


![image.png](/img/blog/coolify/BKFb6BFOE.png)

Any new push to the main branch will trigger the change and you will be able to see the changes almost immediately!!! 

## Service creation

Let's create the service from the predefines set of applications,

![image.png](/img/blog/coolify/FHqB9fywL.png)

Let's go with our favourite one - WordPress!! 

![image.png](/img/blog/coolify/bzADOVMwz.png)

![image.png](/img/blog/coolify/mNJb7MVVl.png)


![image.png](/img/blog/coolify/ph47--WW8.png)

Once again you get the WordPress application up and running with https!! this is DOPE!!


![image.png](/img/blog/coolify/XFveCCZ3r.png)

Let's see the containers that are running:
```
docker ps
CONTAINER ID   IMAGE                                      COMMAND                  CREATED          STATUS          PORTS                                                                                                                                                                                                       NAMES
4282d8fcd5e4   wordpress:latest                           "docker-entrypoint.s…"   2 minutes ago    Up 2 minutes    80/tcp                                                                                                                                                                                                      cl1dp7mdp611550ppkarwixdd2
f871916140ff   bitnami/mysql:5.7                          "/opt/bitnami/script…"   2 minutes ago    Up 2 minutes    3306/tcp                                                                                                                                                                                                    cl1dp7mdp611550ppkarwixdd2-mysql
19609515116a   cl1dol48u545120ppk0s8jnttc:0dd6408         "/entrypoint.sh pyth…"   14 minutes ago   Up 14 minutes   80/tcp, 443/tcp                                                                                                                                                                                             cl1dol48u545120ppk0s8jnttc
6d8b6be9139d   coollabsio/coolify-haproxy-alpine:latest   "/docker-entrypoint.…"   5 hours ago      Up 5 hours      0.0.0.0:80->80/tcp, :::80->80/tcp, 0.0.0.0:443->443/tcp, :::443->443/tcp, 0.0.0.0:5000->5000/tcp, :::5000->5000/tcp, 0.0.0.0:5555->5555/tcp, :::5555->5555/tcp, 0.0.0.0:8404->8404/tcp, :::8404->8404/tcp   coolify-haproxy
5e84a926eeb4   coollabsio/coolify:latest                  "docker-entrypoint.s…"   5 hours ago      Up 5 hours      0.0.0.0:3000->3000/tcp, :::3000->3000/tcp                                                                                                                                                                   coolify
5c5410613754   bitnami/redis:6.2                          "/opt/bitnami/script…"   5 hours ago      Up 5 hours      6379/tcp                                                                                                                                                                                                    coolify-redis

```

I think this is a really cool project, once it is able to run on Kubernetes, other git providers integrations and remote docker engine support - which I know is already in progress or at least on the roadmap!! 

**Huge thanks to Andras Bacsai for building this! **

Follow kubesimplify if you want such amazing articles! 