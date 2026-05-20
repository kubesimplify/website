---
title: "The Ultimate Guide to Audit Logging in Kubernetes: From Setup to Analysis"
seoTitle: "Audit logging in Kubernetes"
seoDescription: "Audit logging in Kubernetes and jq"
datePublished: 2023-05-15T12:30:39.125Z
slug: the-ultimate-guide-to-audit-logging-in-kubernetes-from-setup-to-analysis
author: santoshdts
cover: /img/blog/the-ultimate-guide-to-audit-logging-in-kubernetes-from-setup-to-analysis/52a80dad43edbcbe7e03ecf0c3fffd2d.jpeg
tags: ["security", "kubernetes", "devops", "logging", "devsecops"]
cuid: clhotpn3z015tjvnvdujehntb
---
Kubernetes is a popular container orchestration tool that has revolutionized the way developers deploy and manage their applications. However, as with any complex system, it's important to have visibility into what's going on under the hood. That's where auditing comes in. Kubernetes auditing entails keeping a record and evaluating all actions that occur within the cluster, including requests made to the API server and the creation or removal of pods. This data can be utilized to identify security breaches, solve problems, and ensure adherence to regulatory standards. In this article, we'll take a closer look at Kubernetes auditing and how it can benefit your organization.

Auditing assists in maintaining compliance. It helps by providing the ability to retrieve certain sequences of events a user has initiated. This ability to retrieve the historical records of changes made to the cluster provides deep insights into strengthening the regulatory framework in the organization.

## What are the stages during Audit logging

The kube-apiserver allows us to capture the logs at various stages of a request sent to it. This includes the events at the metadata stage, request, and response bodies as well. Kubernetes allows us to define the stages which we intend to capture. The following are the allowed stages in the Kubernetes audit logging framework:

* **RequestReceived**: As the name suggests, this stage captures the generated events as soon as the audit handler receives the request.
    
* **ResponseStarted**: In this stage, collects the events once the response headers are sent, but just before the response body is sent.
    
* **ResponseComplete**: This stage collects the events after the response body is sent completely.
    
* **Panic**: Events collected whenever the apiserever panics.
    

There are lots of calls made to the API server, and we need a mechanism to filter out the events based on our requirements. Kubernetes auditing provides yet another feature for this very reason — the `level` field in the policy configuration.

## What are the levels at which Auditing needs to happen

The `level` field in the rules list defines what properties of an event are recorded. An important aspect of audit logging in Kubernetes is, whenever an event is processed *it is matched against the rules defined in the config file in order.* The first rule sets the audit level of logging the event. Kubernetes provides the following audit levels while defining the audit configuration.

* **None**: This disables logging of any event that matches the rule.
    
* **Metadata**: Logs request metadata (requesting user/userGroup, timestamp, resource/subresource, verb, status, etc.) but not request or response bodies.
    
* **Request**: This level records the event metadata and request body but does not log the response body.
    
* **RequestResponse**: It is more verbose among all the levels as this level logs the Metadata, request, and response bodies.
    

## Configuration

Auditing in Kubernetes is not enabled by default. We need to configure this feature by providing a set of rules defining the events we intend to keep track of, and the location where we intend to store the audit logs.

Let's first discuss the rules in the audit configuration.

## Rules

The rules in the audit config mainly comprise of **Level** and **Stages**. Of course, there are other parameters as well, like `resources`, `verbs`, `users`/`userGroups`, etc. The meaty part of the rule file is in `level` and `resources` lists.

Following is an example Audit policy configuration:

```yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
  - level: Metadata
 namespaces: ["default"]
 verbs: ["get","list","delete"]
 resources:
    - group: ""
 resources: ["pods"]
  - level: RequestResponse
 omitStages: ["RequestReceived"]
 namespaces: ["default"]
 verbs: ["create","get","delete"]
 resources:
    - group: ""
 resources: ["secrets","configmaps"]
  - level: Metadata
 namespaces: ["default"]
 resources:
    - group: ""
 # pods/exec is a subresource
 resources: ["pods/exec"] 
  - level: None
 verbs: ["watch"]
 namespaces: ["*"]
 resources:
    - group: ""
```

In the above configuration file, the first three lines containing `apiVersion`, `kind`, and `rules` are required fields. Under `rules` list, all the parameters based on our logging requirements are defined.

In the first block, we are logging the information at `Metadata` level. The events we are logging for this block are for `get`, `list`, and `delete` operations on the resources defined in the `resources` list in the *default* `namespace`. In this case, whenever the `kube-apiserver` receives a request for the get or delete method on a pod object, the events for the same will be logged at the metadata level.

Similarly, in the second block, we are logging based on the *RequestResponse* level on the `secret` and `configMap` objects in the *default* `namespace`, whenever the API server receives a *get* or *delete* HTTP method. This rule will not log events generated during `ResquestReceived` stage defined in `omitStages`.

In the third rule, we are logging something interesting. this rule will log all the information whenever there is an `exec` into a pod in the `default` namespace. Finally, we have a rule defining all the irrelevant information we are not bothered to collect the logs for. As logging occupies lots of disk space, we need to precisely define what are the events that we are not interested in logging. Kubernetes provides a field for this called `omitStages`, which skips logging for that particular stage defined under `omitStages`. This rule will not log any information on all the objects in the `core` group on the `watch` verb.

## Configuring the APIServer ad enabling Auditing in k8s

After creating the policy configuration, we must set up the kube-apiserver by providing it with the necessary information, such as the location of the configuration file, log file details, and log size. This can be achieved by inserting the specified lines into the `command` field of the `kube-apiserver` manifest file.

```yaml
spec:
 containers:
  - command:
 <snip>
    - --audit-policy-file=/etc/kubernetes/audit-policy.yaml 
    - --audit-log-path=/var/log/audit/audit.log
    - --audit-log-maxage=5 #No of days we want to retain the logs
 <snip>
```

you can define a few more properties with respect to maintaining the logs. `--audit-log-maxbackup` for defining the maximum of audit log files to retain and `--audit-log-maxsize` sets the maximum size of the log files in megabytes before rotating.

As these files need to be accessed by the `kube-apiserver` pod. We need to make it available within the pod by mounting the `hostPath` to the location of the policy and log file. This makes the audit records persistent.

```yaml
 volumes:
  - name: audit
 hostPath:
 path: /etc/kubernetes/audit-policy.yaml
 type: File
  - name: audit-log
 hostPath:
 path: /var/log/audit/audit.log
 type: FileOrCreate
```

```yaml
 volumeMounts:
    - mountPath: /etc/kubernetes/audit-policy.yaml
 name: audit
 readOnly: true
    - mountPath: /var/log/audit/audit.log
 name: audit-log
 readOnly: false
```

This step completes the configuration of the audit log in the `kube-apiserver` and sets a log location for our audit logs. This step of modification will restart the `kube-apiserver` and we should already be receiving some logs in the log location we had defined.

> In case the `kube-apiserver` doesn't come up online. We need to look at the pod logs at `/var/log/pods/kube-system_kube-master_xxx/kube-apiserver/x.log` location for any misconfiguration and errors.

Now, if we perform any action defined in the audit log policy configuration. We should expect the audit logs to appear in the log file, if we inspect the same we should view the logs in a somewhat similar fashion:

```json
{
 "kind": "Event",
 "apiVersion": "audit.k8s.io/v1",
 "level": "Metadata",
 "auditID": "c762ad6d-9994-4b03-8e6b-eee5e19d3d98",
 "stage": "ResponseComplete",
 "requestURI": "/api/v1/namespaces/default/pods/test",
 "verb": "get",
 "user": {
 "username": "kubernetes-admin",
 "groups": [
 "system:masters",
 "system:authenticated"
    ]
  },
 "sourceIPs": [
 "192.168.56.11"
  ],
 "userAgent": "kubectl/v1.26.0 (linux/amd64) kubernetes/b46a3f8",
 "objectRef": {
 "resource": "pods",
 "namespace": "default",
 "name": "test",
 "apiVersion": "v1"
  },
 "responseStatus": {
 "metadata": {},
 "code": 200
  },
 "requestReceivedTimestamp": "2023-03-29T15:33:20.131662Z",
 "stageTimestamp": "2023-03-29T15:33:20.133724Z",
 "annotations": {
 "authorization.k8s.io/decision": "allow",
 "authorization.k8s.io/reason": ""
  }
}
```

From the above json blob, we can identify some of the important fields which might give us some insights into **what happened** inside the cluster. Some of the fields of interest are `requestURI`, `verb`, `sourceIP`, `user`, and the `objectRef` objects. Mind you these are just a few fields that are captured in `Metadata` level, we might get a lot more information if we change the level to `RequestResponse` type.

Viewing all the relevant information from such json blobs may become daunting. To make our life easy, there is yet another tool — **jq** which helps us in parsing such large amounts of data contained in JSON structure.

## Leveraging jq to view the audit logs

jq, as aptly defined in its \[official documentation\]([https://stedolan.github.io/jq/](https://stedolan.github.io/jq/)) is a *lightweight and flexible command-line JSON processor.* We can leverage the power of jq and target specific fields in the Kubernetes audit logs.

For example, if we are interested to track all the activity related to the HTTP methods sent to API server that are defined in our rules. We may simply use the command `tail -f /var/log/audit/audit.log | jq .verb`. Or we can track which resources the API requests are made to, by using the following command `tail -f /var/log/audit/audit.log | jq .objectRef.resource`

We may go a step ahead and use more advanced features of *jq* such as filters.

For example, in our audit policy, we have defined to log all actions if we perform a `create`, `get` or a `delete` operation on secrets. In order to pretty-print the audit logs, we can use the jq filter as shown in the image below.

![crete-secret](https://user-images.githubusercontent.com/91916466/229306165-10cfa3cd-e52e-4f40-b27c-e43b0bb5c677.png align="left")

![delete-secret](https://user-images.githubusercontent.com/91916466/229306171-33d80d1e-6d17-4ba7-b8af-69cd5cd464c6.png align="left")

For detecting a shell being spawned inside a pod:

![shell](https://user-images.githubusercontent.com/91916466/230908797-25d79a00-0234-4a43-8b30-161fd33c7183.png align="left")

The above example is for filtering each resource based on some selection criteria. We can further leverage the power of jq by saving all our filters on various resources in a single file and supplying that file as a command line argument to jq. This command will spit out the log in a human-readable format immediately whenever it detects an event matching the rules define in our audit policy configuration file.

For example, whenever a `configMap` object is created, which contains some sensitive information ( *username or password* as field names in this example). A specific jq filter will kick in and trigger a human-readable output from the audit log.

![sensitive1](https://user-images.githubusercontent.com/91916466/230733788-bc96c972-5393-40e2-8307-a428d881b519.png align="left")

[*The example filter used for this demo can be found on my GitHub gist.*](https://gist.github.com/Santosh1176/a901c7eb48b91cf3292a3b7d7da20665)

The above examples are for learning and experimenting purposes. In the production cluster, it is advisable to use a centralized logging solution like the ELK stack to collect, process, and analyze the logs. Where, Logstash can be used as a log collector, which can ingest logs from Kubernetes audit logs, and then Elasticsearch can be used to store the logs. Finally, Kibana can be used to visualize and analyze the logs.

## Conclusion

In conclusion, Kubernetes auditing is a crucial tool for maintaining visibility and control over the activity within a cluster. Logging is a critical aspect of security in production clusters, and it's essential to have a robust method to audit logging. By recording and analyzing all events, it can help organizations track down security breaches, troubleshoot issues, and ensure compliance with regulatory requirements. With the flexibility provided by the ability to define stages and levels of logging, organizations can tailor their auditing to their specific needs. However, it is important to remember that auditing can generate a lot of data, so it's essential to configure the policy and the storage location carefully to ensure effective and efficient use of resources. Overall, Kubernetes auditing is an essential part of any organization's strategy for managing and securing their applications in a Kubernetes environment.

By enabling audit logging, choosing the right audit policy, using a centralized logging system, and monitoring audit logs, you can ensure the security of your production cluster and quickly detect and respond to any security threats.

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [LinkedIn](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.