---
title: "Understanding Docker Desktop: All-in-One Platform for Containers"
seoTitle: "docker desktop, Gordon, Docker, Kubernetes"
seoDescription: "This is a blog on docker desktop which discusses about how to use it's features"
datePublished: 2025-01-31T10:56:37.289Z
slug: understanding-docker-desktop-all-in-one-platform-for-containers
author: saloni-narang
cover: /img/blog/understanding-docker-desktop-all-in-one-platform-for-containers/46181ade-54e5-4053-b65c-e5923961e584.png
tags: ["docker", "kubernetes", "devrel", "devops-journey", "docker-desktop"]
cuid: cm6knftt5000a09i3g6ky12tw
---
In modern application development, containers have revolutionized how developers build, ship, and run applications. Among the tools facilitating this revolution, **Docker Desktop** is an essential tool for developers looking to streamline containerized application workflows. Whether you are just starting your container journey or are a seasoned pro, Docker Desktop offers a user-friendly way to manage and work with containers.

### What is Docker Desktop?

Docker Desktop is a cross-platform application available for Windows, macOS, and Linux that provides an easy-to-use interface to manage your Docker containers and images. It combines Docker Engine, Docker CLI, Docker Compose, and Kubernetes (optional) into a unified solution, enabling seamless development and testing of containerized applications on your local machine.

For installation of Docker Desktop, you can refer to my previous post.  
[https://blog.kubesimplify.com/docker-captain-journey](https://blog.kubesimplify.com/docker-captain-journey)

### Key Features of Docker Desktop

#### 1. **Cross-Platform Support**

Docker Desktop works on Windows, macOS, and Linux, making it a versatile tool for developers across different operating systems. It automatically configures and integrates with the host system, eliminating the need for complex setup processes.

#### 2. **Built-in Kubernetes Support**

Docker Desktop includes a lightweight, single-node Kubernetes cluster for developers working with Kubernetes. This allows users to deploy, test, and manage Kubernetes workloads locally without needing a separate cluster.

#### 3. **Docker Compose**

With Docker Compose integrated you can define multi-container applications in a simple YAML file and deploy them using a single command. This is particularly useful for microservices architectures.

#### 4. **Resource Controls**

Docker Desktop provides an intuitive interface to allocate system resources like CPU, memory, and disk space for Docker containers, ensuring optimal performance without overloading your machine.

#### 5. **Image Management**

The Image view in the Docker Desktop Dashboard makes it easy to manage container images. You can pull images from Docker Hub, inspect image details, and run images as containers. Additionally, the Dashboard helps you clean up unused images to free up disk space and provides a summary of image vulnerabilities, enabling proactive security management.

#### 6. **Volume Management**

The Volumes view offers a streamlined way to manage Docker volumes. You can create, delete, and inspect volumes, as well as view which containers are using them, all from a centralized interface.

#### 7. **Builds View**

Docker Desktop’s Builds view lets you inspect your build history and manage builders. This includes details of ongoing and completed builds, making it easier to track your workflows.

#### 8. **Notifications and Learning Center**

Stay informed with Docker Desktop’s notification center, which provides updates about new releases, installation progress, and other alerts. The Learning Center offers in-app walkthroughs and resources to help you master Docker quickly.

#### 9. **Quick Search**

Docker Desktop includes a Quick Search feature in the Dashboard, allowing you to locate containers , compose applications, images, volumes, or extensions with ease. For images, it provides options to pull, run, or view documentation, while for containers, you can perform actions like start, stop, or delete directly from the search results.

**10. Docker Scout**

**Docker Scout** is a tool that provides deep insights into container images, helping developers analyze dependencies, identify vulnerabilities, and improve image quality. It integrates seamlessly with Docker workflows, offering actionable recommendations and enabling policy enforcement to ensure secure, efficient, and compliant containerized applications. Perfect for managing your software supply chain!

11. ![](/img/blog/understanding-docker-desktop-all-in-one-platform-for-containers/b0091f36-bf83-4d4c-b01b-6c6058f231a6.png align="center")
    
    **WebAssembly workloads**
    
    **Wasm in Docker** enables running lightweight, fast WebAssembly (Wasm) workloads alongside Linux containers. To use Wasm, enable the **container image store** and turn on the **Enable Wasm** feature in Docker Desktop settings. Docker Desktop installs various Wasm runtimes, like Wasmtime and WasmEdge, to support Wasm workloads
    
    ![](/img/blog/understanding-docker-desktop-all-in-one-platform-for-containers/6de4ead9-faad-4869-bbc5-b6d137e0a2ed.png align="center")
    
    .
    
12. **Docker Extensions**
    
    **Docker Desktop Extensions** are add-ons that enhance Docker Desktop by integrating tools like security scanners, monitoring, and debugging directly into its UI. They simplify workflows, improve productivity, and allow developers to build and share custom extensions. You can explore and install them via the **Docker Extensions Marketplace**.
    
13. **Dev Environments**
    
    A **Dev Environment** in Docker Desktop lets developers quickly set up and share reproducible environments with all tools, dependencies, and configurations. It ensures consistency, simplifies onboarding, and eliminates "it works on my machine" issues, enabling seamless collaboration.
    
14. **Ask Gordon**
    
    **Ask Gordon** is Docker’s AI-powered assistant, currently in Beta, designed to streamline workflows in Docker Desktop and the CLI. It provides contextual, actionable insights by understanding your local setup, including Dockerfiles, containers, and applications. With features like identifying vulnerabilities and optimizing Dockerfiles, Ask Gordon helps make Docker's ecosystem more intuitive and efficient.
    

### Exploring Docker Desktop

#### Docker Desktop Dashboard

The Docker Desktop Dashboard serves as your command center. Here are the key views available:

1. **Containers View**: Provides a runtime view of all your containers and applications, allowing you to manage their lifecycle, inspect logs, and perform other common actions directly from your machine.
    
2. **Images View** displays a list of local images, lets you pull images from Docker Hub, run images as containers, and clean up unused images. If you are logged in, you can also view images shared by your organization on Docker Hub.
    
3. **Volumes View**: Displays Docker volumes, allowing you to easily manage their lifecycle.
    
4. **Builds View**: Shows your build history, ongoing builds, and completed builds.
    

#### Docker Menu

![](/img/blog/understanding-docker-desktop-all-in-one-platform-for-containers/2544292c-d999-4b73-8ba0-9bd0037b1020.png align="center")

### Doing Stuff with Docker Desktop

To do everything within the Docker Desktop, you can enable the terminal form within the Docker Desktop to interact with the host machine.

![](/img/blog/understanding-docker-desktop-all-in-one-platform-for-containers/b9131634-222f-4779-b00c-7dee0280d2cf.png align="center")

## 1. **Building Custom Images**

Let’s say you want to build an image for your python flask application.

Create a simple [`app.py`](http://app.py) as below:

```bash
from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "Hello, Dockerized Python App!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### Requirements (`requirements.txt`)

We will have the `Dockerfile` install the dependencies from `requirements.txt`, create a `requirements.txt` file with the following content:

```bash
flask
```

This will ensure that Flask is installed when building the Docker image.

Create a `Dockerfile` to define a custom image:

```plaintext
FROM python:3.9-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "app.py"]
```

Build and run the image:

```plaintext
docker build -t my-python-app .
docker run -p 5001:5000 my-python-app
```

![](/img/blog/understanding-docker-desktop-all-in-one-platform-for-containers/64cd66ef-1f3a-4bfb-9034-1c0f277bfbc7.png align="center")

![](/img/blog/understanding-docker-desktop-all-in-one-platform-for-containers/efd934fe-f96a-4783-a5c7-3057c157ec9f.png align="center")

Then, open your browser and visit \`http://localhost:5001\` to see the output.

![](/img/blog/understanding-docker-desktop-all-in-one-platform-for-containers/f61c78f4-079e-4d63-98a8-e64ce1f18c1a.png align="center")

#### 2. **Using Docker Desktop with Kubernetes:**

Enable Kubernetes in Docker Desktop settings and see the cluster is running and the context is switched to docker-desktop.

![](/img/blog/understanding-docker-desktop-all-in-one-platform-for-containers/d7608ae1-9725-49a7-a4b6-6917a13f3ff6.png align="center")

Then, create a Kubernetes ‘deployment.yaml’:

```plaintext
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx
        ports:
        - containerPort: 80
```

Apply the configuration:

```plaintext
kubectl apply -f deployment.yaml
```

![](/img/blog/understanding-docker-desktop-all-in-one-platform-for-containers/954c83e9-18f4-43ed-b563-86ab0d91e183.png align="center")

Verify the deployment:

```plaintext
kubectl get deployment
kubectl get pods
```

![](/img/blog/understanding-docker-desktop-all-in-one-platform-for-containers/fe21883f-3423-4ef6-b3cf-261ed9e62e1f.png align="center")

You can see that you have a local Kubernetes experience that you can use to test out Kubernetes for your development purposes.

#### 3. **Exploring Extensions**

Docker Desktop’s Extensions Marketplace allows you to add new functionalities. From CI/CD integrations to security scanners, you can install extensions with a single click and extend the capabilities of Docker Desktop. In the below example, I searched for the Lens extension to visualize Kubernetes.

![](/img/blog/understanding-docker-desktop-all-in-one-platform-for-containers/a2191cf0-3ec7-411a-b2c0-5860d9c56f16.png align="center")

### Conclusion

Docker Desktop is an indispensable tool for developers and DevOps professionals. It simplifies the container lifecycle, bridges the gap between local and production environments, and offers powerful features like Kubernetes integration, resource management, and extensions. Whether building your first containerized app or managing complex microservices, Docker Desktop is your go-to solution for local development.

Start exploring Docker Desktop today and transform how you build, ship, and run applications!