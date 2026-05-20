---
title: "Testing Docker AI's \"Gordon\" – How Smart Is It?"
seoTitle: "Dockers AI Agent \"Ask Gordon\""
seoDescription: "Testing Docker AI's \"Gordon\" – How Smart Is It?"
datePublished: 2025-02-21T07:28:49.667Z
slug: testing-docker-ais-gordon-how-smart-is-it
author: saloni-narang
cover: /img/blog/testing-docker-ais-gordon-how-smart-is-it/a19dad9a-b2ee-4c04-9549-1d251e98bbac.png
tags: ["ai", "docker", "docker-desktop", "ai-tools", "dockerdesktop", "docker-gordon"]
cuid: cm7eg9hqb000509jvb74kbvpv
---
Docker just launched **"Ask Gordon"**, an AI-powered assistant inside **Docker Desktop 4.38**. It promises to help with troubleshooting, optimizing Dockerfiles, and even generating configurations automatically.

But does it really work? 🤔 In this blog, let’s **put Gordon to the test** with real-world scenarios and see if it’s actually useful

![](/img/blog/testing-docker-ais-gordon-how-smart-is-it/5787a956-6eeb-4b24-b1a8-d919a36f9501.png align="center")

## 🔹 **What is "Ask Gordon"?**

Think of **Gordon** as a **smart AI assistant** built into Docker. Instead of searching the internet or reading documentation, you can ask Gordon questions directly in the **Docker CLI** or **Docker Desktop** **UI**.

For example, if a container crashes, instead of Googling for answers, you can simply ask:

```plaintext
docker ai "Why is my container crashing?"
```

And Gordon will analyze logs and suggest solutions. Pretty cool, right?

Now, let’s test out some scenarios and see if it **actually works**.

## 🔧 **Setting Up Gordon**

Before we test, let’s quickly **enable Gordon**:

1. You need to download Docker Desktop version 4.38 or later. You can download it from [here](https://www.docker.com/products/docker-desktop/).
    
2. This is how you can enable Ask Gordon:
    

\- After signing in to your Docker Account, enable the Docker AI feature:

\- Open the **Settings** view in Docker Desktop.

\- Navigate to **Features in Development**.

\- Check the **Enable Docker AI** checkbox.  
The Docker AI terms of service agreement are displayed. You must agree to the terms before you can enable the feature. Review the terms and select **Accept and enable** to continue.  
\- Select **Apply & restart**

![](/img/blog/testing-docker-ais-gordon-how-smart-is-it/f1bd53df-9084-4462-b6b7-37b636e3065c.png align="center")

You can now chat with Gordon via:

* **CLI** → `docker ai "<your question>"`
    
* **Docker Desktop UI** → Click the ✨ icon in various places
    

Alright, now let’s run some real-world tests.

![](/img/blog/testing-docker-ais-gordon-how-smart-is-it/79810a2b-713b-4d4d-a7da-abe39dffb6b9.png align="center")

Let’s say you click “How do I run Redis“, you will get something like below:

![](/img/blog/testing-docker-ais-gordon-how-smart-is-it/880bec84-8ddd-41ef-a337-96c035b142e7.png align="center")

# 🚀 **Testing Gordon’s Capabilities**

If you are using shell, then you must know these commands.  

![](/img/blog/testing-docker-ais-gordon-how-smart-is-it/e8fc865a-5b7a-42b7-b02c-f9d750a4d3bc.png align="center")

### **🛠 Test 1 : Dockerfile issues**

I asked Gordon to check issues in my Dockerfile:

```dockerfile
#Base image
FROM ubuntu:latest
#Install dependencies
RUN apt-get update && apt-get install -y 
curl 
wget 
python3 
python3-pip 
vim
#Copy application code
COPY . /app
#Set working directory
WORKDIR /app
#Install Python dependencies
RUN pip3 install -r requirements.txt
#Expose application port
EXPOSE 8080
#Start the application
CMD ["python3", "app.py"]
```

Here comes the output:  

```plaintext
saloni@Salonis-MacBook-Air ~ % docker ai

>>> check my dockerfile for issues                                              

    • Sending Dockerfile ✔️

 Your Dockerfile looks functional and should work for most basic use cases. 
However, there are a few potential issues and improvements you can consider:


  ### Issues and Suggestions
    1. Using latest tag for the base image

Using ubuntu:latest is not recommended for production environments because 
the latest tag can change over time, potentially introducing breaking changes. 
It's better to specify a specific version, e.g., ubuntu:20.04.
2. Combining RUN commands

  The RUN command for installing dependencies can be optimized to reduce the number 
of layers in the image. 
For example:
  

         RUN apt-get update && apt-get install -y \
            curl \
            wget \
            python3 \
            python3-pip \
            vim && \
            apt-get clean && rm -rf /var/lib/apt/lists/*

  This ensures that temporary files created during the installation process are cleaned up, 
  reducing the image size.

  3. No explicit Python version

  The python3 and python3-pip packages will install the default Python version for the 
Ubuntu base image. If your application requires a specific Python version, you should 
explicitly install it.

 4. No non-root user

  The container runs as the root user by default, which can be a security risk. Consider 
adding a non-root user to run the application:
RUN useradd -m appuser
USER appuser

5. No health check

 Adding a HEALTHCHECK instruction can help monitor the health of the container. For example:
HEALTHCHECK --interval=30s CMD curl --fail http://localhost:8080 || exit 1

6. No .dockerignore file
Without a .dockerignore file, unnecessary files (e.g., .git, local environment files) might 
be copied into the image. Create a .dockerignore file to exclude such files:

 .git
  pycache
  *.pyc
   .env

  7. Hardcoded port

  The application exposes port 8080, but this might not be configurable. Consider making the 
   port configurable via an environment variable.
  
  8. No entrypoint script
  If your application requires environment setup or initialization, consider using an 
  entrypoint script instead of directly running the application in the CMD.

  ### Final Optimized Dockerfile
  Here’s an optimized version of your Dockerfile:

   # Base image
    FROM ubuntu:20.04

  # Install dependencies
    RUN apt-get update && apt-get install -y \
        curl \
        wget \
        python3 \
        python3-pip \
        vim && \
        apt-get clean && rm -rf /var/lib/apt/lists/*

  # Add a non-root user
    RUN useradd -m appuser
    USER appuser

  # Copy application code
    COPY . /app
 # Set working directory
    WORKDIR /app
 # Install Python dependencies
    RUN pip3 install --no-cache-dir -r requirements.txt
 # Expose application port
    EXPOSE 8080
 # Add health check
    HEALTHCHECK --interval=30s CMD curl --fail http://localhost:8080 || exit 1
 # Start the application
    CMD ["python3", "app.py"]

Let me know if you need further clarification!
```

So it gave us the missing pieces form my Dockerfile and gives the optimised Dockerfile. This is neat as you can directly do this in your cli form where you are running the docker commands.

---

### **🛠 Test 2 : Fixing a Broken Container**

#### **Scenario:**

I have a **Node.js** container, but when I start, it crashes immediately.

```plaintext
echo 'console.log(require("express"))' > app.js
cat <<EOF > Dockerfile
FROM node:18
WORKDIR /app
COPY app.js .
CMD ["node", "app.js"]
EOF
docker build -t crash-node .
```

```plaintext
docker run --name crash-node -d crash-node
```

```plaintext
docker ps -a | grep crash
9ef75103d838   crash-node                            "docker-entrypoint.s…"   13 seconds ago   Exited (1) 12 seconds ago                               crash-node
```

#### **Now let’s ask Gordon on why my container is failing**

```plaintext
docker ai "Why is my container crash-node crashing?"
```

#### **Response:**

```plaintext
To diagnose why your container named crash-node is crashing, you can follow these steps:
  
    1. Check Container Logs:
  Use the docker logs command to view the logs of the crashing container. This can provide insights into 
  any errors or issues that occur just before the crash.
  
          docker logs crash-node
  
    2. Inspect Container Status:
  Use docker ps -a to check the status of the container. This can help determine if the container is 
  exiting with a specific error code.
  
          docker ps -a
  
    3. Use Docker Compose Logs (if applicable):
  If you are using Docker Compose, you can use the following command to view logs for all services, which 
  might give you more context:
  
          docker compose logs crash-node
  
    4. Check Resource Constraints:
  Ensure that your container is not running out of memory or other resources. You can inspect resource 
  usage with:
  
          docker stats crash-node
  
    5. Review Docker Daemon Logs:
  If the container logs do not provide enough information, you can check the Docker daemon logs for any 
  system-level issues. On Linux, you can use:
  
          journalctl -u docker.service
  
    6. Inspect Dockerfile and Configuration:
  Review your Dockerfile and any configuration files (like docker-compose.yml) for potential 
  misconfigurations or errors.
  
    7. Check for Known Issues:
  Refer to the Docker known issues 
  (https://docs.docker.com/desktop/troubleshoot-and-support/troubleshoot/known-issues/) to see if there 
  are any related issues that might be affecting your container.
  
  By following these steps, you should be able to gather more information about why your crash-node 
  container is crashing. If you find specific error messages or logs, feel free to share them for more 
  targeted assistance.
```

Let’s check the logs

```plaintext
docker logs crash-node
node:internal/modules/cjs/loader:1143
  throw err;
  ^

Error: Cannot find module 'express'
Require stack:
- /app/app.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1140:15)
    at Module._load (node:internal/modules/cjs/loader:981:27)
    at Module.require (node:internal/modules/cjs/loader:1231:19)
    at require (node:internal/modules/helpers:177:18)
    at Object.<anonymous> (/app/app.js:1:13)
    at Module._compile (node:internal/modules/cjs/loader:1364:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1422:10)
    at Module.load (node:internal/modules/cjs/loader:1203:32)
    at Module._load (node:internal/modules/cjs/loader:1019:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:128:12) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [ '/app/app.js' ]
}

Node.js v18.20.7
```

Now, let’s ask Gordon again

```plaintext
docker ai "docker logs crash-node
node:internal/modules/cjs/loader:1143
  throw err;
  ^

Error: Cannot find module 'express'
Require stack:
- /app/app.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1140:15)
    at Module._load (node:internal/modules/cjs/loader:981:27)
    at Module.require (node:internal/modules/cjs/loader:1231:19)
    at require (node:internal/modules/helpers:177:18)
    at Object.<anonymous> (/app/app.js:1:13)
    at Module._compile (node:internal/modules/cjs/loader:1364:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1422:10)
    at Module.load (node:internal/modules/cjs/loader:1203:32)
    at Module._load (node:internal/modules/cjs/loader:1019:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:128:12) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [ '/app/app.js' ]
}
```

```plaintext
The error indicates that the express module is missing in your Node.js application. This happens 
  because the express package is not installed in your Docker container
```

The main point here is that express is missing!!

so we can just update the Dockerfile as below

```plaintext
FROM node:18
WORKDIR /app
COPY app.js .
RUN npm install express
CMD ["node", "app.js"]
```

Now when you build, run again and check the logs you will see the logs.

```plaintext
docker logs 154d3d2759a8
[Function: createApplication] {
  application: {
    init: [Function: init],
    defaultConfiguration: [Function: defaultConfiguration],
    lazyrouter: [Function: lazyrouter],
    handle: [Function: handle],
    use: [Function: use],
    route: [Function: route],
    engine: [Function: engine],
    param: [Function: param],
    set: [Function: set],
    path: [Function: path],
    enabled: [Function: enabled],
    disabled: [Function: disabled],
    enable: [Function: enable],
    disable: [Function: disable],
    acl: [Function (anonymous)],
|
|
|
.......
```

All this is done while staying in the same CLI and not going anywhere else which is the coolest part IMO.

---

# **Conclusion: Is Gordon Worth Using?**

I have used Gordon for various purposes, in the end its the fine tuned and trained AI agent on Docker documentation which is a good thing as it will have the latest information as compared to other LLM’s out there. But for the simple errors, it should just give smaller outputs with the fix and then explain when the user asks to explain the action. It’s in beta and new so we can excuse for the generic answers it gives at times but if we want people to not use chatgpt or similar LLM’s then it should provide concise answers, to the point issues and also like github copilot it should be able to provide instant feedback when we are actually typing in commands.

What do you think about Docker Gordon? Are you using it already?

If you use Docker Desktop, definitely give Gordon a shot. It won’t replace a seasoned engineer, but it can make life a bit easier, especially for debugging and automation.

💡 Try it out and let me know your thoughts! What’s the weirdest question you asked Gordon? 😆👇