---
title: "Kubernetes Management with Rust - A Dive into Generic Client-Go, Controller Abstractions, and CRD Macros with Kube.rs"
seoTitle: "Kubernetes Management with Rust"
seoDescription: "In this blog, we dive into Generic Client-Go, Controller Abstractions, and CRD Macros with Kube.rs."
datePublished: 2024-07-23T12:30:43.479Z
slug: kubernetes-management-with-rust-a-dive-into-generic-client-go-controller-abstractions-and-crd-macros-with-kubers
author: sangam-biradar
cover: /img/blog/kubernetes-management-with-rust-a-dive-into-generic-client-go-controller-abstractions-and-crd-macros-with-kubers/7e52dc5b-86cf-4492-8a4f-7c112e6ff7f5.png
tags: ["kubernetes", "rust", "kubectl"]
cuid: clyye9afr000g09i7e5z6982a
---
If you've read our previous blog on [performing CRUD operations on Kubernetes](https://blog.kubesimplify.com/perform-crud-operations-on-kubernetes-using-golang) using Golang, you should now be familiar with the basics of `client-go`. In this post, we will explore a more efficient way to use Rust with Kubernetes.

A Rust client for Kubernetes, found at [kube-rs/kube](https://github.com/kube-rs/kube), is designed similarly to the more general client-go. It incorporates a runtime abstraction modeled after `controller-runtime` and includes a derive macro for Custom Resource Definitions (CRDs) inspired by [Kubebuilder](https://github.com/kubernetes-sigs/kubebuilder). This project is hosted by the Cloud Native Computing Foundation (CNCF) as a Sandbox Project.

These crates extend Kubernetes' API machinery and API principles to support generic abstractions. These abstractions make it easier to develop Rust-based applications by enabling the use of reflectors, controllers, and custom resource interfaces.

# Prerequisites

Before we dive into using Rust with Kubernetes, make sure you have the following set up:

* [Rust](https://www.rust-lang.org/tools/install) installed on your machine.
    
* [`minikube`](https://minikube.sigs.k8s.io/docs/start/?arch=%2Fmacos%2Farm64%2Fstable%2Fbinary+download) or an alternative Kubernetes distribution installed.
    
* [kubectl](https://kubernetes.io/docs/tasks/tools/) installed.
    

# Part 1 - List all Pods in the Cluster

In this section, we'll learn the basics of using the kubernetes rust client, by listing down all running pods in our cluster.

![](/img/blog/kubernetes-management-with-rust-a-dive-into-generic-client-go-controller-abstractions-and-crd-macros-with-kubers/35575223-b7b3-41df-a1c9-97b07ad2a7f8.png align="center")

## Step 1 - Initialize the project

For this, let's use Cargo to initiate the project:

```bash
cargo init kubers-demo
```

![](/img/blog/kubernetes-management-with-rust-a-dive-into-generic-client-go-controller-abstractions-and-crd-macros-with-kubers/6783e005-6111-46ee-9b40-668c5c34f561.png align="center")

You can view the default project structure using the following command:

```bash
tree .
```

**Output:**

```bash
.
├── Cargo.toml
└── src
    └── main.rs

2 directories, 2 files
```

## Step 2 - Update cargo package manager dependencies

Update the list of dependencies in the default `kubers-demo/Cargo.toml` file:

```ini
[package]
name = "kubers-demo"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
kube = { version = "0.87.2", features = ["client","runtime", "derive", "rustls-tls"] }
k8s-openapi = { version = "0.20.0", features = ["latest"] }
tokio = { version = "1.0", features = ["full"] }  # Use the latest version
[dev-dependencies]
k8s-openapi = { version = "0.20.0", features = ["latest"] }
async-std = "1.0"  # Use the latest version
```

## Step 3 - Update `main.rs`

Update `kubers-demo/src/main.rs`, which contains our first simple program demonstrating how to interact with the Kubernetes API to list all pods within the default namespace.

```rust
use kube::{Client, Api};
use kube::api::ListParams;
use k8s_openapi::api::core::v1::Pod;
use std::error::Error;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Load the kubeconfig file.
    let config = kube::Config::from_kubeconfig(&kube::config::KubeConfigOptions::default()).await?;
    let client = Client::try_from(config)?;

    // Work with Kubernetes API.
    let pods: Api<Pod> = Api::default_namespaced(client);
    let lp = ListParams::default();

    for p in pods.list(&lp).await? {
        println!("Found Pod: {}", p.metadata.name.unwrap_or_default());
    }

    Ok(())
}
```

**Code Explanation:**

Let's break down the above code to understand how our first simple program demonstrates interacting with the Kubernetes API to list all pods within the default namespace. Here's a step-by-step explanation:

1. **Imports**: The necessary crates and modules are imported:
    
    * `kube::{Client, Api}`: Provides the main Kubernetes client and the API wrapper.
        
    * `kube::api::ListParams`: Allows parameterizing list queries.
        
    * `k8s_openapi::api::core::v1::Pod`: Defines the Pod resource from the Kubernetes core API.
        
    * `std::error::Error`: Handles error types.
        
2. **Main Function**: The `main` function is declared with the `#[tokio::main]` attribute to enable asynchronous execution using the Tokio runtime.
    
    ```rust
    #[tokio::main]
    async fn main() -> Result<(), Box<dyn Error>> {
    ```
    

3. **Load Kubeconfig**: The Kubernetes configuration is loaded from the default kubeconfig file (typically found at `~/.kube/config`).
    
    ```rust
    let config = kube::Config::from_kubeconfig(&kube::config::KubeConfigOptions::default()).await?;
    ```
    

4. **Create Client**: A Kubernetes client is created from the loaded configuration.
    
    ```ini
    let client = Client::try_from(config)?;
    ```
    

5. **Define API for Pods**: An `Api` object for `Pod` resources is created, scoped to the default namespace using the client.
    
    ```rust
    let pods: Api<Pod> = Api::default_namespaced(client);
    ```
    

6. **List Parameters**: Default parameters for listing resources are set up using `ListParams`.
    
    ```rust
    let lp = ListParams::default();
    ```
    

7. **List Pods**:The code lists the Pods in the default namespace using the `list` method on the `pods` API object. It iterates over the list of Pods and prints their names.
    
    ```rust
    for p in pods.list(&lp).await? {
        println!("Found Pod: {}", p.metadata.name.unwrap_or_default());
    }
    ```
    

8. **Return**: The function returns `Ok(())` to signify successful execution.
    
    ```rust
    Ok(())
    }
    ```
    

Initializes a connection to a Kubernetes cluster using the local kubeconfig file, then lists all pods in the default namespace and prints their names. The use of async/await with the Tokio runtime allows for efficient, non-blocking interaction with the Kubernetes API.

## Step 4 - Deploy a sample nginx application

```bash
kubectl apply -f https://k8s.io/examples/application/deployment.yaml
```

## Step 5 - Test the program

Use the following command to list down all the current pods in our Kubernetes cluster:

```bash
cargo run -- --kubers-demo kubectl -- get po
```

You'll get the following output:

```bash

Finished `dev` profile [unoptimized + debuginfo] target(s) in 3.77s
Running `target/debug/k8s-client --kubers-demo kubectl -- get po`
Found Pod: demo-nginx
Found Pod: crud-4vj57
Found Pod: nginx-deployment-86dcfdf4c6-cnlp7
Found Pod: nginx-deployment-86dcfdf4c6-vskvc
...
```

# Part 2 - Building a Custom Resource Definition (CRD)

Kubernetes Custom Resource Definitions (CRDs) let you extend the Kubernetes API by defining your own custom objects. These objects can represent any kind of resource specific to your applications or workflows, such as database configurations, networking policies, or even complex deployment patterns. CRDs provide a way to manage these custom resources using the familiar Kubernetes tools and APIs, bringing consistency and automation to your Kubernetes environment.

In this section, we'll use the knowledge from the previous section to build a custom resource definition and then a custom resource for our Kubernetes cluster, using the rust client.

![](/img/blog/kubernetes-management-with-rust-a-dive-into-generic-client-go-controller-abstractions-and-crd-macros-with-kubers/a45dbc31-5e70-4ac5-83f5-d64f9db593a7.png align="center")

## Step 1 - Initialize a new project

Let us initialize a new project for this part. Use the following command to do so:

```bash
cargo init kube-crd
```

## Step 2 - Create custom resource definition schema

Add the following code in `src/main.rs`:

```rust
use kube::{Api, Client};
use kube::api::PostParams;
use serde::{Serialize, Deserialize};
use k8s_openapi::apiextensions_apiserver::pkg::apis::apiextensions::v1::{
    CustomResourceDefinition,
    CustomResourceDefinitionSpec,
    CustomResourceDefinitionNames,
    CustomResourceDefinitionVersion,
    JSONSchemaProps,
    CustomResourceValidation,
    JSONSchemaPropsOrArray,
};
use k8s_openapi::apimachinery::pkg::apis::meta::v1::ObjectMeta;
use schemars::JsonSchema;
use kube::CustomResource;
use std::collections::BTreeMap;

// Define the spec of our custom resource
#[derive(CustomResource, Deserialize, Serialize, Clone, Debug, JsonSchema)]
#[kube(group = "example.com", version = "v1", kind = "KCDTrack2", namespaced)]
pub struct MeetupSpec {
    organizer: String,
    topic: String,
    attendees: Vec<String>,
    conference: String,
    time: String,
    session_type: String,
    speaker: String,
}

// Main function to create the CRD in the cluster
#[tokio::main]
async fn main() -> Result<(), kube::Error> {
    let client = Client::try_default().await?;

    let crds: Api<CustomResourceDefinition> = Api::all(client);
    let pp = PostParams::default();

    // Define the CRD for our KCDTrack2 resource
    let kcd_crd = CustomResourceDefinition {
        metadata: ObjectMeta {
            name: Some("kcdtrack2s.example.com".to_string()),
            ..Default::default()
        },
        spec: CustomResourceDefinitionSpec {
            group: "example.com".to_string(),
            versions: vec![
                CustomResourceDefinitionVersion {
                    name: "v1".to_string(),
                    served: true,
                    storage: true,
                    schema: Some(CustomResourceValidation {
                        open_api_v3_schema: Some(JSONSchemaProps {
                            type_: Some("object".to_string()),
                            properties: Some({
                                let mut props = BTreeMap::new();
                                props.insert("spec".to_string(), JSONSchemaProps {
                                    type_: Some("object".to_string()),
                                    properties: Some({
                                        let mut spec_props = BTreeMap::new();
                                        spec_props.insert("organizer".to_string(), JSONSchemaProps {
                                            type_: Some("string".to_string()),
                                            ..Default::default()
                                        });
                                        spec_props.insert("topic".to_string(), JSONSchemaProps {
                                            type_: Some("string".to_string()),
                                            ..Default::default()
                                        });
                                        spec_props.insert("attendees".to_string(), JSONSchemaProps {
                                            type_: Some("array".to_string()),
                                            items: Some(JSONSchemaPropsOrArray::Schema(Box::new(JSONSchemaProps {
                                                type_: Some("string".to_string()),
                                                ..Default::default()
                                            }))),
                                            ..Default::default()
                                        });
                                        spec_props.insert("conference".to_string(), JSONSchemaProps {
                                            type_: Some("string".to_string()),
                                            ..Default::default()
                                        });
                                        spec_props.insert("time".to_string(), JSONSchemaProps {
                                            type_: Some("string".to_string()),
                                            ..Default::default()
                                        });
                                        spec_props.insert("session_type".to_string(), JSONSchemaProps {
                                            type_: Some("string".to_string()),
                                            ..Default::default()
                                        });
                                        spec_props.insert("speaker".to_string(), JSONSchemaProps {
                                            type_: Some("string".to_string()),
                                            ..Default::default()
                                        });
                                        spec_props
                                    }),
                                    ..Default::default()
                                });
                                props
                            }),
                            ..Default::default()
                        }),
                    }),
                    ..Default::default()
                }
            ],
            names: CustomResourceDefinitionNames {
                plural: "kcdtrack2s".to_string(),
                singular: Some("kcdtrack2".to_string()),
                kind: "KCDTrack2".to_string(),
                short_names: Some(vec!["kcdt2".to_string()]),
                ..Default::default()
            },
            scope: "Namespaced".to_string(),
            ..Default::default()
        },
        status: None,
    };

    // Create the CRD
    crds.create(&pp, &kcd_crd).await?;

    Ok(())
}
```

## Step 3 - Update cargo package manager dependencies

Add the following code in `kube-crd/Cargo.toml` file:

```ini
[package]
name = "kube-crd"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html
[dependencies]
schemars = "0.8.15"
kube = { version = "0.87.1", features = ["runtime", "derive"] }
k8s-openapi = { version = "0.20.0", features = ["latest"] }
tokio = { version = "1.0", features = ["full"] }  # Use the latest version
serde = "1.0.155"
serde_derive = "1.0.155"
serde_json = "1.0.94"
serde_yaml = "0.9.19"
```

## Step 4 - Run the program

```bash
cargo run   
```

**Output:**

```bash
Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.07s
Running `target/debug/kube-crd`
```

## Step 5 - Verify CRD creation

```bash
kubectl get crd
```

If everything goes well, you will get the following output:

```bash
NAME                     CREATED AT
kcdtrack2s.example.com   2024-06-23T04:46:25Z
```

## Step 6 - Create a new custom resource

Create a new k8s manifest file using `vi kube-crd/kcdhyd.yaml` and add the following configuration to create a custom resource, based on our CRD:

```yaml
apiVersion: example.com/v1
kind: KCDTrack2
metadata:
  name: integrating-rust
spec:
  organizer: "kcdhyd"
  topic: "Building the Bridge: Integrating Rust with Kubernetes Controller Runtime"
  attendees: []
  conference: "KCD Hyderabad"
  time: "15:55 - 16:20"
  session_type: "Session"
  speaker: "Sangam Biradar, CloudNativeFolks"
```

## Step 7 - Apply the CRD yaml

```bash
kubectl apply -f kcdhyd.yaml 
```

**Output:**

```bash
kcdtrack2.example.com/integrating-rust created
```

## Step 8 - Print a specific jsonpath of CRD

```bash
kubectl get kcdtrack2 integrating-rust -o jsonpath='{.spec.speaker}' 
```

**Output:**

```bash
Sangam Biradar, CloudNativeFolks
```

# Part 3 - Monitor Kubernetes pods and send updates to the slack channel

In this section, we'll use what we've learned from the above sections, to create a program that watches Kubernetes pod events using the kube runtime, filter for changes, and trigger Slack notifications when pod statuses change.

![](/img/blog/kubernetes-management-with-rust-a-dive-into-generic-client-go-controller-abstractions-and-crd-macros-with-kubers/d90def30-a883-4cd4-8500-c5b82652a0f1.png align="center")

## Step 1 - Initialize a new project

Let us initialize a new project called `slack-integration`:

```bash
cargo init slack-integration
```

## Step 2 - Update cargo package manager dependencies

Update the default `slack-integration/Cargo.toml` with the following configuration:

```ini
[package]
name = "slack-integration"
version = "0.1.0"
edition = "2021"

[dependencies]
kube = { version = "0.87.2", features = ["runtime"] }
kube-runtime = "0.87.2"
k8s-openapi = { version = "0.20.0", features = ["latest"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1", features = ["full"] }
reqwest = { version = "0.11.23", features = ["json"] }  # Enable the json feature
schemars = "0.8"
futures-util = "0.3.30"
```

## Step 3 - Create the program

Let us first import all the necessary libraries to manage Kubernetes resources, make HTTP requests, handle JSON data, and support asynchronous programming.

Add the following libraries in `src/main.rs`:

```rust
use kube::{Client, Api};
use kube::runtime::watcher;
use k8s_openapi::api::core::v1::Pod;
use tokio;
use reqwest;
use serde_json::json;
use futures_util::TryStreamExt;
use tokio::sync::mpsc;
```

Next up, we'll create a new function called `send_slack_message`, which would be responsible for sending messages to Slack.

```rust
async fn send_slack_message(client: &reqwest::Client, webhook_url: &str, messages: Vec<String>) {
    let payload = json!({ "text": messages.join("\n") });
    if let Err(e) = client.post(webhook_url)
        .json(&payload)
        .send()
        .await {
        eprintln!("Failed to send message to Slack: {}", e);
    }
}
```

Let us now create the `main` function for our program:

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::try_default().await?;
    let pods: Api<Pod> = Api::all(client);
    let watcher = watcher(pods, Default::default());

    let slack_webhook_url = "https://hooks.slack.com/services/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"; // Replace with your Slack webhook URL
    let reqwest_client = reqwest::Client::new();

    let (tx, mut rx) = mpsc::channel(100);

    // Task to batch and send Slack messages periodically
    let webhook_task = tokio::spawn(async move {
        let mut messages = Vec::new();
        while let Some(message) = rx.recv().await {
            messages.push(message);
            if messages.len() >= 10 {
                send_slack_message(&reqwest_client, slack_webhook_url, messages.split_off(0)).await;
            }
        }
        if !messages.is_empty() {
            send_slack_message(&reqwest_client, slack_webhook_url, messages).await;
        }
    });

    tokio::pin!(watcher);
    while let Some(event) = watcher.try_next().await? {
        if let watcher::Event::Applied(pod) = event {
            let pod_name = pod.metadata.name.unwrap_or_default();
            let message = format!("Pod update: {}", pod_name);
            tx.send(message).await?;
        }
    }

    drop(tx); // Close the channel to stop the webhook task
    webhook_task.await?;

    Ok(())
}
```

**Here's a breakdown of the core logic:**

* **Tokio Main Function**:
    
    * Uses `#[tokio::main]` to enable asynchronous execution.
        
* **Kubernetes Client and Watcher**:
    
    * Initializes a Kubernetes client with `Client::try_default().await?`.
        
    * Sets up a watcher for all Pods with `Api::all(client)` and `watcher(pods, Default::default())`.
        
* **Slack Webhook Setup**:
    
    * Defines the Slack webhook URL to send notifications.
        
    * Creates an HTTP client using `reqwest::Client::new()`.
        
* **Message Channel**:
    
    * Creates a channel for message passing with `mpsc::channel(100)`.
        
* **Batching and Sending Slack Messages**:
    
    * Spawns a task to batch and send messages asynchronously.
        
    * Collects messages and sends them in batches to Slack.
        
* **Processing Pod Events**:
    
    * Watches for pod events and extracts pod names.
        
    * Sends formatted messages to the channel when a pod event occurs.
        
* **Cleanup**:
    
    * Closes the channel to stop the message-sending task.
        
    * Waits for the task to complete before exiting the program.
        

## Step 4 - Slack integration

Create a new Slack app by heading over to [Slack Apps](https://api.slack.com/apps) and enable the "app incoming webhooks", as shown below. Additionally, copy webhook URL to add in our program.

![](/img/blog/kubernetes-management-with-rust-a-dive-into-generic-client-go-controller-abstractions-and-crd-macros-with-kubers/fe41a15e-eb95-4146-a090-9bb80a61d6aa.png align="center")

![](/img/blog/kubernetes-management-with-rust-a-dive-into-generic-client-go-controller-abstractions-and-crd-macros-with-kubers/058bfe11-ac9f-461a-8b7c-9f0d9c763764.png align="center")

![](/img/blog/kubernetes-management-with-rust-a-dive-into-generic-client-go-controller-abstractions-and-crd-macros-with-kubers/413ca8e0-468e-408f-8c3f-93aafed6636d.png align="center")

After this, make sure to paste the Slack webhook URL in your code (in `slack-integration/src/main.rs`):

```rust
let slack_webhook_url = "Slack webhook URL here"; // Replace with your Slack webhook URL
```

## Step 5 - Run the program and deploy the application

```bash
cargo run  
```

**Output:**

```bash
Compiling slack-integration v0.1.0 (/Users/sangambiradar/Documents/GitHub/kubers-demo/slack-integration)
Finished `dev` profile [unoptimized + debuginfo] target(s) in 2.24s
Running `/Users/sangambiradar/Documents/GitHub/kubers-demo/target/debug/slack-integration`
...  
```

In another terminal, deploy any application using a [sample YAML](https://k8s.io/examples/application/deployment.yaml):

```bash
kubectl apply -f nginx2.yaml
```

You will see real-time updates on the Slack channel 🎉

![](/img/blog/kubernetes-management-with-rust-a-dive-into-generic-client-go-controller-abstractions-and-crd-macros-with-kubers/0c2941a3-cdb0-4068-9495-96eebe887118.png align="center")

# Conclusion

We explored how to efficiently use Rust with Kubernetes by leveraging the kube-rs crate. We started with setting up the Rust environment, Minikube, and initializing a Rust project using Cargo. We demonstrated how to interact with the Kubernetes API to list all pods within the default namespace. Additionally, we covered creating a Custom Resource Definition (CRD) in Rust, including defining custom resources, building CRDs, and verifying their creation in Kubernetes.

Furthermore, we built a simple Rust application that monitors Kubernetes pods and sends updates to a Slack channel using a webhook. This application demonstrated asynchronous programming with Rust's [Tokio runtime](https://tokio.rs/) and efficient communication with Slack through batched messages.

# Resources

* [Official documentation](https://kube.rs/getting-started/)
    
* [Kubernetes Open API](https://docs.rs/k8s-openapi/latest/k8s_openapi/)
    
* [Adopter List for kube.rs](https://kube.rs/adopters)
    
* [Demo Source Code](https://github.com/kubernetesdaily/kubers-demo)
    

Follow Kubesimplify on [Hashnode](https://blog.kubesimplify.com/), [Twitter/X](https://twitter.com/kubesimplify) and [LinkedIn](https://www.linkedin.com/company/kubesimplify). Join our [Discord server](https://kubesimplify.com/discord) to learn with us!