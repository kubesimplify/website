---
title: "Kyverno And Cosign"
seoTitle: "Kyverno And Cosign"
seoDescription: "Kyverno is a Kubernetes native policy engine, and cosign is a tool used for signing container images."
datePublished: 2022-05-05T12:08:14.345Z
slug: kyverno-and-cosign
author: anurag-kumar
cover: /img/blog/kyverno-and-cosign/SQHLE8aIo.png
tags: ["docker", "kubernetes", "devops", "k8s"]
cuid: cl2sysdjr00kj1bnv42rt0ow6
---
In my previous [article,](https://kubesimplify.com/getting-started-with-kyverno) I have written about kyverno.
Continuing that, In this short article, I’m going to explore Kyverno and Cosign together. 
Kyverno is a Kubernetes native policy engine, and cosign is a tool used for signing container images. This article assumes that you know the basics of Kyverno and Cosign. 


This article is more hands on oriented, so I will encourage you to try this hands on. 

- What we are going to do in this blog 
    1. Creating a container image
    2. Pushing the image to container registry 
    3. Signing the Image with Cosign 
    4. Creating a ClusterPolicy that will enforce only signed images to be used while creating k8s resources. 
    5. Creating a pod with the same image that we had made above.  

- For the example purpose, I will be creating a very simple container image based on `nginx:alpine` image. 
- Create a new directory and name it anything you want.  
- First, let's create an index.html page that we will be using in the image.
 
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cosign and Kyverno</title>
</head>
<body>
    <h1> Having fun with Cosign and Kyverno </h1>
</body>
</html>
```
- Now let's create a Dockerfile in the same directory. 
```Dockerfile
FROM nginx:alpine
COPY index.html /usr/share/nginx/html
```
- Now we need to build the image. To build the image, execute the command 
```
podman build -t kranurag7/kyverno-cosign .
``` 
- I'm using Podman here. If you use any other tool like docker, then replace podman with docker. 

### Signing the image
- Now comes the part of signing the image. 
- To sign the image, we will use cosign. 
- Execute the command `cosign sign --key cosign.key kranurag7/kyverno-cosign` 
- If everything is correct, you should see this message. 


![Screenshot from 2022-04-26 14-48-20.png](/img/blog/kyverno-and-cosign/fda6PAvw1.png)

- After signing when you go to docker hub or your respective container registry then you will notice a tag pushed to the repo as soon as you sign the image. 

![kyverno-cosign.png](/img/blog/kyverno-and-cosign/oV3XeevUk.png)

- I'm not going into the details of cosign in this article. I will write another one for that. 


- If verifies that your image is signed now. 
- You can also verify your image from the terminal. 
```
cosign verify --key cosign.pub kranurag7/kyverno-cosign | jq
```
- You should see something like this. 

![Screenshot from 2022-04-26 14-55-14.png](/img/blog/kyverno-and-cosign/NRRMsSWr5.png)

- If you don't have `jq` installed then skip `jq` 

### Creating a Pod with the signed Image

- Now that we have our image ready, let's create a ClusterPolicy that will only allow the pods whose container images are signed with cosign. 
- To do that, we will go to https://kyverno.io/policies and copy-paste one policy named `verify_image`. You can find it [here](https://kyverno.io/policies/other/verify_image/)

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-image
  annotations:
    policies.kyverno.io/title: Verify Image
    policies.kyverno.io/category: Sample
    policies.kyverno.io/severity: medium
    policies.kyverno.io/subject: Pod
    policies.kyverno.io/minversion: 1.4.2
    policies.kyverno.io/description: >-
      Using the Cosign project, OCI images may be signed to ensure supply chain
      security is maintained. Those signatures can be verified before pulling into
      a cluster. This policy checks the signature of an image repo called
      ghcr.io/kyverno/test-verify-image to ensure it has been signed by verifying
      its signature against the provided public key. This policy serves as an illustration for
      how to configure a similar rule and will require replacing with your image(s) and keys.      
spec:
  validationFailureAction: enforce
  background: false
  rules:
    - name: verify-image
      match:
        any:
        - resources:
            kinds:
              - Pod
      verifyImages:
        - image: "*"
          key: |-
            -----BEGIN PUBLIC KEY-----
            MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEBgkz0hpHwOmEXaRaPPFMqhczFGRw
            wcQnj0jnRdsB0U6npFtHCJLIzALIYag9iHEz6RGArOvLa0eFLOkQKRvpg==
            -----END PUBLIC KEY-----        
```

- Now we will execute the command `kubectl apply -f verify_image.yaml` 
- After this, we will try running our signed image and one unsigned image as well.
- Let's first start with an image which is not signed by cosign. 
- For illustration purpose, we will run the nginx image 
```
kubectl run my-pod --image=nginx 
```
- You will notice that the object is not getting created, and it's throwing an error.
- The error will look something like this. 


![Screenshot from 2022-04-26 14-27-04.png](/img/blog/kyverno-and-cosign/H3Czl59-9.png)
    
- You can also check this in the policy reports. 
```
kubectl get polr 
```

![Screenshot from 2022-04-26 14-29-56.png](/img/blog/kyverno-and-cosign/7PuYgWmFV.png)

- It's showing that one policy is failing. 
- For looking at policies, I generally use policy-reporter. In the policy-reporter Dashboard, you will notice that one failing policy is there. For me, this is much simpler to visualize what's happening in the cluster.


![Screenshot from 2022-04-26 14-32-04.png](/img/blog/kyverno-and-cosign/oShNAZut7.png)

- You can see in the image above that one policy is failing and something is wrong. 
- Now let's deploy a pod with the image we have signed a few minutes back. 
- `kubectl run my-pod --image=kranurag7/kyverno-cosign`


![kyverno-cosign.gif](/img/blog/kyverno-and-cosign/MtJuEirKx.gif)

- Now let's try executing the command for the simple web page that we had created. 
```
kubectl exec -it my-pod -- curl localhost:80
```
- You should see some output like this

![Screenshot from 2022-04-26 15-21-24.png](/img/blog/kyverno-and-cosign/xXuG6IXH_.png)

- Now let's see this in browser 
```
kubectl port-forward my-pod 8081:80
```
- Go to your browser and type `localhost:8081`. You should see this in your browser. 
![Screenshot from 2022-04-26 15-25-12.png](/img/blog/kyverno-and-cosign/t0MGQI4Dk.png)

- That's all I have for this article. I hope you enjoyed reading and practicing it. Stay tuned for more. 


