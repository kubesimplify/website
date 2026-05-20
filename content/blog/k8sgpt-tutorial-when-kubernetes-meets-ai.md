---
title: "K8sGPT Tutorial - When Kubernetes Meets AI"
seoTitle: "K8sGPT Tutorial - When Kubernetes Meets AI"
seoDescription: "In this blog we’ll explore k8sGPT, a powerful tool that brings the capabilities of AI to change the way you manage Kubernetes."
datePublished: 2024-07-31T12:30:21.789Z
slug: k8sgpt-tutorial-when-kubernetes-meets-ai
author: kunal-verma
cover: /img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/cc4d6ad6-1b11-45ef-9e94-9e9ad31251aa.png
tags: ["ai", "kubernetes", "openai", "llm", "ollama"]
cuid: clz9trn19000409mi6km2cpkh
---
We all agree that in recent years, AI has taken the world by storm. With tools like ChatGPT and platforms developed by OpenAI leading the charge — AI is being used in many industries to make work easier, provide helpful insights, and boost productivity. According to [The State of AI 2023 by McKinsey](https://www.mckinsey.com/~/media/mckinsey/business%20functions/quantumblack/our%20insights/the%20state%20of%20ai%20in%202023%20generative%20ais%20breakout%20year/the-state-of-ai-in-2023-generative-ais-breakout-year_vf.pdf), AI adoption has increased by over 60% in the past year alone, with businesses using AI to stay ahead and innovate!

Given how AI is making a significant impact across industries, it makes sense to ask — **why not use AI in managing Kubernetes?**

Kubernetes is one of the most widely adopted open-source container orchestration platforms. Its powerful features make it a top choice for automating the deployment, scaling, and management of containerized applications. However, as Kubernetes environments grow larger, they can become complex and difficult to manage. Troubleshooting issues at scale can be particularly challenging.

This is where AI can make a big difference! By adding AI to the Kubernetes workflow, we can make the management process smarter and more efficient. AI can help diagnose and resolve issues quickly, automate routine tasks, and provide insights that enhance decision-making.

Building upon this narrative, in this blog we’ll explore k8sGPT — a powerful tool that brings the capabilities of AI to change the way you manage Kubernetes, making it easier to solve problems, make decisions, and keep things running smoothly.

# Introducing K8sGPT - Kubernetes Troubleshooting with AI

According to [the website:](https://k8sgpt.ai/)

> K8sGPT is a tool for scanning your kubernetes clusters, diagnosing and triaging issues in simple english. It has SRE experience codified into its analyzers and helps to pull out the most relevant information to enrich it with AI.

K8sGPT is a [CNCF sandbox project](https://www.cncf.io/projects/k8sgpt/) designed to simplify Kubernetes management using AI and natural language processing. It integrates with various AI backends, such as OpenAI, Azure OpenAI, and Google Gemini, to provide clear and actionable insights into your Kubernetes environment. These insights are presented in a user-friendly format, making them easy to understand and act upon.

Some of its key features include:

* **Cluster Scanning -** Automatically checks your Kubernetes clusters to find any issues.
    
* **Issue Diagnosis -** Quickly identifies problems and explains them in simple language.
    
* **Actionable Advice -** Gives practical tips on how to fix issues.
    
* **Anonymization -** Protects sensitive data by hiding it during analysis.
    
* **Extensibility -** Allows you to add custom analyzers to meet your specific needs.
    

These features make K8sGPT a valuable tool for anyone managing Kubernetes environments. It helps you find and fix problems faster, automate routine tasks, and make better decisions. In the next sections, we'll see how these features work through practical demos and real-world examples.

# **Prerequisites**

Before we begin exploring K8sGPT, here are a few things you’ll need:

* [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
    
* A Kubernetes cluster (we’ll be using [**minikube**](https://minikube.sigs.k8s.io/docs/start/) for this tutorial, but feel free to choose any other tool)
    
* [helm](https://helm.sh/docs/intro/install/) installed
    
* [ollama](https://ollama.com/) installed - we’ll be using this as the AI backend for K8sGPT (more on this later)
    

# Installation

There are two main ways you can use K8sGPT to analyze your Kubernetes cluster:

1. Using the CLI
    
2. Using it as an [In-cluster Operator](https://docs.k8sgpt.ai/getting-started/in-cluster-operator/)
    

In the upcoming sections where we discuss different functionalities of K8sGPT, we’ll mainly focus on using the CLI.

Based on your operating system, there various methods of installing the `k8sgpt` CLI which you can check out in the [installation guide](https://docs.k8sgpt.ai/getting-started/installation/). We will be using the following commands to install it via [homebrew](https://brew.sh/):

```bash
brew tap k8sgpt-ai/k8sgpt
brew install k8sgpt
```

Once the installation is complete, use the following command to verify whether it was installed correctly:

```bash
k8sgpt version
```

```bash
# Output
k8sgpt: 0.3.39 (Homebrew), built at: ...
```

# Authentication

Before we move forward with using K8sGPT to analyse our cluster, we need to authenticate it with an AI backend. A Backend (also called Provider) is a service that provides access to the AI language model. K8sGPT [supports a lot of different AI backends](https://docs.k8sgpt.ai/reference/providers/backend/) — so there are several options to choose from!

> Tip: Each AI backend has its own strengths and weaknesses, so it is important to choose the one that is right for your needs.

To know all the supported AI backends, we can use the `k8sgpt auth` command as shown below:

```bash
k8sgpt auth list
```

```bash
# Output
Default: 
> openai
Active: 
Unused: 
> openai
> localai
> ollama
> azureopenai
> cohere
> amazonbedrock
> amazonsagemaker
> google
> noopai
> huggingface
> googlevertexai
> oci
> watsonxai
```

For this tutorial, we’ll be using [Ollama](https://ollama.com/) to run the [Llama 3](https://ollama.com/library/llama3) (latest as of today) LLM locally on our machine — at zero cost!

> Note: OpenAI is the [default backend](https://docs.k8sgpt.ai/reference/providers/backend/#openai) for K8sGPT and is recommended by the community for its powerful language models and accurate results. However, for local testing and demo purposes, free, open-source options are also supported, such as [Ollama](https://docs.k8sgpt.ai/reference/providers/backend/#ollama), [Local AI](https://docs.k8sgpt.ai/reference/providers/backend/#localai), and [FakeAI](https://docs.k8sgpt.ai/reference/providers/backend/#fakeai). Remember, better language models lead to more accurate results!

To get things started, make the sure the ollama server is up and running using the following command:

```bash
ollama serve
```

To authenticate K8sGPT with ollama, we’ll be using the `k8sgpt auth` command as shown below:

```bash
k8sgpt auth add --backend ollama --model llama3 --baseurl http://localhost:11434
```

```bash
# Output
ollama added to the AI backend provider list
```

Here, we provide the base URL address as `http://localhost:11434`, which is the default address of the Ollama server.

To verify the authorization, we can use the following command to check the status of the ollama backend:

```bash
k8sgpt auth list
```

```bash
# Output
...
Active: 
> ollama
Unused: 
> openai
> localai
> azureopenai
> cohere
...
```

> Note: To see the full list of different `k8sgpt` CLI commands, refer to the [documentation](https://docs.k8sgpt.ai/reference/cli/).

We have successfully authorized K8sGPT to use Ollama as an AI backend 🎉

# Basic Analysis

Let us explore the core functionality of K8sGPT, which is scanning and debugging issues in a Kubernetes cluster.

Here, we’ll be taking two very simple scenarios to demonstrate its capabilities:

## Broken Pod

Let us run a “potentially” malicious pod into our Kubernetes cluster. You can find the YAML manifest below:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hungry-pod
  namespace: default
spec:
  containers:
  - name: busybox
    image: busybox
    resources:
      requests:
        cpu: "1000"
    command: ["sh", "-c", "echo Hello Kubernetes! && sleep 3600"]
```

Use the following command to apply this to our cluster:

```bash
kubectl apply -f broken-pod.yaml
```

You will notice that the pod is currently in a `Pending` state and remains that way — which means there’s something wrong here!

![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/3606ae70-0335-4741-acbb-053486142754.png align="center")

If you’re familiar with the basic concepts of Kubernetes, your default approach will be to check the pod events using the following command:

```bash
kubectl describe pod hungry-pod
```

But, lets see how far can we go with using AI to know more! Run the following command to to scan the entire cluster and find issues:

```bash
k8sgpt analyse
```

![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/661376ef-1465-4ebf-ba40-6c61fcd2bf17.png align="center")

According to this, there are no nodes with sufficient CPU resources available to schedule the incoming pod. That’s helpful — let’s take this a step further. Run the following command to get additional information about the error and get recommendations by AI on how to fix the issues:

```bash
k8sgpt analyse --explain --backend ollama
```

![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/dfee3bd6-e61d-4b3f-a4da-213ba6f9d47f.png align="center")

Here are two things the AI provides for each error:

1. Explaining the error in simple language
    
2. Giving potential solutions to debug and fix the issue
    

We can try all these solutions to solve our pod issue, but to me, the simplest solution is the 3rd one — adjusting the pod’s CPU requests.

Let us first check the CPU capacity of our node by using the following command:

```bash
kubectl describe node minikube
```

```bash
# Output
...
Capacity:
  cpu:                11
  ephemeral-storage:  61202244Ki
  hugepages-1Gi:      0
  hugepages-2Mi:      0
  hugepages-32Mi:     0
  hugepages-64Ki:     0
  memory:             8029108Ki
  pods:               110
...
```

Edit the pod manifest and adjust the CPU requests value within the node’s limit (i.e., maximum 11 cores). Here’s the updated YAML manifest:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hungry-pod
  namespace: default
spec:
  containers:
  - name: busybox
    image: busybox
    resources:
      requests:
        cpu: "5"
    command: ["sh", "-c", "echo Hello Kubernetes! && sleep 3600"]
```

To fix the issue, we’ll first need to delete the existing pod and then apply the new manifest to create a fresh pod:

![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/787da15c-5c96-4786-aef9-a79feb33759f.png align="center")

Voilà, our pod is up and running successfully 🎉

## Broken Service

Let us have a look into another scenario and see how K8sGPT helps us here. Apply the YAML manifest below that creates a new service and a pod:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: pod-svc
  namespace: default
spec:
  selector:
    app: ngnx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
---
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  namespace: default
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx
    ports:
    - containerPort: 80
```

Once applied, you’ll notice that there no errors. The pod is in running state and the service has been created:

![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/ad2ccda5-768c-4a0f-9bf7-4b5352adcafe.png align="center")

But sometimes looks can be deceiving! Let us use K8sGPT to scan for issues that may not be visible and provide potential solutions to fix them:

```bash
k8sgpt analyse --explain -b ollama
```

![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/0100e745-73be-4b87-981d-1633c77845dc.png align="center")

Caught it! We have an issue with the service - there are no available pods that match the service's selector criteria (labels in this case) to route traffic to.

To fix this, either we can change the service’s labels or the pod’s label. Use the following command to quickly change the pod labels to match the service:

```bash
kubectl label pod nginx-pod app=ngnx --overwrite
```

```bash
# Output
pod/nginx-pod labeled
```

Now, if we run the `k8sgpt analyse` command again, it won’t detect any errors with our pod and service — because we’ve solved it 🎉

![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/39076c0e-5b68-4747-8dc6-a063bb66acff.png align="center")

# Using filters and flags

In the previous section, you might have noticed that the `k8sgpt analyse` command gives a list of all the issues within our cluster, covering all Kubernetes resources. In a demo scenario (similar to what we have here), we may only have a few Kubernetes resources deployed in our cluster — making it relatively easier to navigate our target resources.

But let’s get real here! In a real-world production scenario, you may have 1000s of resources deployed, and it may get difficult to navigate and find them following this format, right?

Interestingly, K8sGPT does this for you using filters. Filters are a way of selecting which resources you wish to be part of the default analysis.

To check the list of available filters, use the following command:

```bash
k8sgpt filters list
```

```bash
# Output
Active: 
> MutatingWebhookConfiguration
> Node
> HorizontalPodAutoScaler
> Deployment
...
Unused: 
> Gateway
> HTTPRoute
> PodDisruptionBudget
> GatewayClass
```

> Note: These filters corresponds specific analyzers written in the K8sGPT codebase. You can explore the [codebase](https://github.com/k8sgpt-ai/k8sgpt/tree/main/pkg/analyzer) to learn more.

Here are a few ways you can use filters with the `k8sgpt analyse` command to select specific resources:

* Filter by resource (example: analyse all Pods in the cluster)
    
    ```bash
    k8sgpt analyse --explain -b ollama --filter Pod
    ```
    
    ![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/5064acf5-659e-460f-a538-43433366123e.png align="center")
    
* Filter resources by a specific namespace (example: analyse all resources in the default namespace)
    
    ```bash
    k8sgpt analyse --explain -b ollama --namespace default
    ```
    
    ![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/219e2667-cbc8-4c81-b21f-fc3d3d03175e.png align="center")
    
* Providing multiple filters (example: analyse all pods and services in the default namespace)
    
    ```bash
    k8sgpt analyse --explain -b ollama --filter Pod,Service -n default
    ```
    
    ![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/8719ae4b-ce31-4e23-828a-b79a33c0d08d.png align="center")
    

Apart from the built-in filter support (which we’ll also expand in the upcoming section), there are two additional flags worth highlighting:

1. **Output JSON Flag**
    
    The `--output json` flag generates the analysis output in JSON format. This is particularly useful when you want to integrate K8sGPT with other tools or automate tasks, as JSON is a widely accepted format for data exchange. By using this flag, you can easily parse and process the output with scripts or software applications, allowing for seamless integration into your existing workflows. Here's how you can use it:
    
    ```bash
    k8sgpt analyze --explain --filter=Service --output=json
    ```
    
2. **Anonymize Flag**
    
    If you’re concerned with providing sensitive data about your workloads to OpenAI or other AI backends, the `--anonymize` flag is useful for you. When used with the `k8sgpt analyse` command, this flag masks sensitive data such as Kubernetes object names and labels before sending it to the AI backend for analysis.
    
    During the analysis, K8sGPT retrieves sensitive data, which is then masked before being sent to the AI backend. The backend receives the masked data, processes it, and returns a solution to the user. Once the solution is returned to the user, the masked data is replaced with the actual Kubernetes object names and labels. Here’s how you can use it:
    
    ```bash
    k8sgpt analyze --explain --filter=Service --output=json --anonymize
    ```
    
    ![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/36d7c041-a98f-48af-8724-bcbb464315b0.png align="center")
    

> Note: If you wish to know more options to use with k8sgpt analyze command, you can use the following to view some more configurable options:
> 
> ```bash
> k8sgpt analyze help
> ```

# Integrations

When we talk about any tool in the cloud-native ecosystem, the main value lies in how well it integrates with other tools from the [CNCF Landscape](https://landscape.cncf.io/).

Despite being an early-stage project, K8sGPT offers useful integrations that enhance its default analysis capabilities. These integrations provide additional features for scanning, diagnosing, and triaging issues in Kubernetes clusters.

In this section, we’ll focus on the Kyverno integration, which was released in the [latest `v0.3.39`](https://github.com/k8sgpt-ai/k8sgpt/releases/tag/v0.3.39) (at the time of writing this blog).

> Note: To follow along, ensure you are on the latest version of the K8sGPT [CLI](https://docs.k8sgpt.ai/getting-started/installation/).

To get started, use the following command to list all the available integrations:

```bash
k8sgpt integrations list
```

```bash
# Output
Active:
Unused: 
> trivy
> prometheus
> aws
> keda
> kyverno
```

For the Kyverno integration to work, we need to install Kyverno in our cluster. Use the following commands to install Kyverno via helm:

```bash
helm repo add kyverno https://kyverno.github.io/kyverno/
helm repo update
helm install kyverno kyverno/kyverno -n kyverno --create-namespace
```

After the installation, apply a simple validation policy that ensures a label called team is present on every Pod. Use the following YAML manifest to apply the policy to your Kubernetes cluster:

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
spec:
  validationFailureAction: Enforce
  rules:
    - name: check-team
      match:
        any:
          - resources:
              kinds:
                - Pod
      validate:
        message: "label 'team' is required"
        pattern:
          metadata:
            labels:
              team: "?*"
```

After this, if you try to create a Pod without the `team` label, the operation won’t be allowed!

![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/63a824ee-fe4a-4613-aedd-733d8ebf5bc6.png align="center")

Once Kyverno is installed and verified, activate it as a K8sGPT integration using the following command:

```bash
k8sgpt integrations activate kyverno 
```

![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/144e6d76-c133-4c2c-963a-cc2c2dbc1b99.png align="center")

With the Kyverno integration, we get two new filters:

* `PolicyReport`
    
* `ClusterPolicyReport`
    

You can use the following command to get a list of updated filters:

```bash
k8sgpt filters list
```

![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/90b069df-fb21-4358-95e2-526cacc88a13.png align="center")

We can now use one of these new filters as part of the `k8sgpt analyze` command to filter out relevant information about Kubernetes resources. Below is an example using the `PolicyReport` filter:

```bash
k8sgpt analyze -b ollama --filter PolicyReport
```

![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/927b1afc-eb48-401f-a70b-65779e8d641a.png align="center")

It’s pretty similar to using the good old: `kubectl get policyreport` command — as both retrieve information about policy compliance in our Kubernetes cluster, the only difference being, now we also get solutions to fix the issues!

![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/d53861d4-9e41-443c-a373-04728e9b0b87.png align="center")

> Note: At the time of writing this article, the Kyverno integration is newly added and is at its initial stages (check out the [PR](https://github.com/k8sgpt-ai/k8sgpt/pull/1200)), so you may encounter some issues. Feel free to [open an issue](https://github.com/k8sgpt-ai/k8sgpt/issues) if you encounter any problems while working with it!

It's important to note that the example above is shown in a demo scenario, which might not showcase its full potential. However, imagine a production cluster with thousands of pods running — the accessibility and insights provided by this kind of integration would be invaluable in such a scenario!

# **In-cluster Operator**

The K8sGPT CLI is a great way to get started and perform ad-hoc scans in a cluster, but it involves manually running a command for each analysis. **What if you want continuous 24/7 scans in the cluster?** For this, you can install K8sGPT as a Kubernetes operator, which runs as a Kubernetes Custom Resource and produces reports stored in your cluster as YAML manifests.

These are all the different components that the k8sGPT operator installs and manages:

[![](/img/blog/k8sgpt-tutorial-when-kubernetes-meets-ai/6b2a541b-876d-4f9e-bb05-7fc0dafd4a2f.png align="center")](https://docs.k8sgpt.ai/reference/operator/overview/#architecture)

To learn more about installing and setting up the operator, check out the [documentation](https://docs.k8sgpt.ai/getting-started/in-cluster-operator/).

> Note: The K8sGPT Operator can be customized by modifying the [values.yaml](https://github.com/k8sgpt-ai/k8sgpt/blob/main/charts/k8sgpt/values.yaml) file. To check the available customizable options, refer to the [documentation](https://docs.k8sgpt.ai/reference/operator/overview/#customising-the-operator).

# **Advance Features to Try Out**

Let us take a look at two exciting features of K8sGPT that you should definitely try out.

### Custom Analyzers

**Want to make k8sGPT to analyze your Kubernetes cluster in ways specific to your environment?** K8sGPT allows you to create your own custom analyzers to fit your specific needs. This feature lets you extend the capabilities of K8sGPT by writing your own code to analyze your Kubernetes cluster in ways that are unique to your environment. Whether you need to check for specific configurations or monitor custom metrics, custom analyzers give you the flexibility to tailor the tool to your requirements.

To know more about how to create and use custom analyzers, refer the [custom analyzers guide](https://docs.k8sgpt.ai/tutorials/custom-analyzers/).

### Slack Integration

**Does your team operate via Slack?** K8sGPT also offers seamless integration with Slack, making it easier to get notifications and updates directly in your Slack channels. This feature ensures that your team stays informed about the health and status of your Kubernetes clusters without having to leave their communication platform. Setting up Slack integration allows you to receive real-time alerts and insights, helping your team to respond quickly to any issues.

Learn more how to set up this integration in the [slack integration guide](https://docs.k8sgpt.ai/tutorials/slack-integration/).

These features are certainly powerful additions to K8sGPT, enhancing its functionality and making it even more useful for managing your Kubernetes clusters.

# Ending Thoughts

K8sGPT is a powerful tool that brings the capabilities of AI to Kubernetes management, making it easier to diagnose and resolve issues, automate routine tasks, and gain valuable insights. With features like custom analyzers and Slack integration, you can tailor the tool to fit your specific needs and keep your team informed in real-time.

We've covered the essentials, from installation to advanced features. Now, it's your turn to explore and see how K8sGPT can simplify your Kubernetes operations. Give it a try, and don't hesitate to share your experiences or [join the community](https://k8sgpt.ai/) for further discussions.

Thank you for reading, and happy troubleshooting!

# Resources

* [Demo Source Code](https://github.com/verma-kunal/k8sGPT-tutorial)
    
* [k8sGPT Playground - Killercoda](https://killercoda.com/matthisholleville/scenario/k8sgpt-cli)
    
* [k8sGPT tutorial by Anaïs Urlichs](https://anaisurl.com/k8sgpt-full-tutorial/)
    
* [Run k8sGPT using vLLM](https://medium.com/@panpan0000/empower-kubernetes-with-k8sgpt-using-open-source-llm-1b3fa021abd6)
    

Follow Kubesimplify on [Hashnode](https://blog.kubesimplify.com/), [Twitter/X](https://twitter.com/kubesimplify) and [LinkedIn](https://www.linkedin.com/company/kubesimplify). Join our [Discord server](https://kubesimplify.com/discord) to learn with us!