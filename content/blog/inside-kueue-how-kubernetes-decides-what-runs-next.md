---
title: "Inside Kueue: How Kubernetes Decides What Runs Next"
seoTitle: "Inside Kueue: How Kubernetes Decides What Runs Next"
seoDescription: "See how Kueue brings order to overloaded Kubernetes clusters by intelligently managing batch workloads—with a hands on demo."
datePublished: 2026-08-19T10:00:00.000Z
slug: inside-kueue-how-kubernetes-decides-what-runs-next
author: ekam-walia
cover: /img/blog/inside-kueue-how-kubernetes-decides-what-runs-next/cover.png
tags: ["kubernetes", "kueue", "batchworkloads", "scheduling", "AI/ML", "jobs"]
---
# How Scheduling actually works on Kubernetes

## Kubernetes default scheduler works like this:

Pod lands → Scheduler checks if it fits on any node.
Resources available? → Yes → Pod gets scheduled
Resources available? → No → Pod sits in ‘Pending’ state until desired resources don’t get vacant.

Meanwhile, other important jobs also queue up and fight for the same resources.

![Flowchart for default Scheduling on Kubernetes](/img/blog/inside-kueue-how-kubernetes-decides-what-runs-next/default-job-scheduling.png)

The key issues which one can face using default K8s schedular:

1. Job fairness across teams
2. Deadlock issue (Some jobs require all pods to sync for run)
3. Queue management (who should go first?)
4. Resource quotas (how much can each team use?)
5. Preemption (can I pause a low-priority job to run a critical one?)

# The Relatable Problem 

Let us suppose that your team is running Kubernetes, and everything is working well. Microservices deploy smoothly. Then one day, someone deploys a Batch Job—maybe it’s a machine learning model training job or a big data processing pipeline.

The job starts and immediately grabs every available GPU, CPU, and memory on the cluster. Meanwhile, other important workloads are left waiting for resources that won’t become available anytime soon. In some cases, this can even create a deadlock: workloads are waiting on resources held by other workloads, while the cluster has no effective way to decide what should run first.

Sound familiar? This is the issue that Kueue is built to solve.

# Now let’s first understand what Batch Jobs are and the concept of Gang Scheduling, also how they create a DEADLOCK Issue through an example.

Let's start with the basics, because not everyone has run batch jobs before.

### Traditional Microservices vs Batch Workloads

#### Microservices (what your cluster probably handles now):

1. Run 24/7 (or close to it)
2. Need modest, predictable resources
3. React to incoming requests
**Example**: A web API serving user requests

#### Batch Workloads (what breaks your cluster):

1. Stateful (distributed state across pods)
2. All-or-nothing (5 of 8 pods running = job hangs)
3. Long-running (hours, days, weeks)
4. Coordinated (all pods must sync regularly)
5. Resource-intensive (GPUs, TPUs, high CPU)
6. Run for a fixed time, then stop
7. Don't react to requests; just "process all this data"
**Example**: Training an ML model on 1TB of data, processing tonight's logs, running backups

##### Real examples of Batch Workloads

1. **Machine Learning Training** - Needs: 8 GPUs, 256GB RAM for 4 hours 
- Then: Stops completely 
2. **Data Pipeline** - Needs: 64 CPUs, 512GB RAM to process logs 
- Then: Stops, waits for tomorrow 
3. **Big Data Job (Spark, Hadoop)** - Needs: 100 CPUs, 500GB RAM in one shot
 - Then: Finishes 

### Why Jobs Need to Run Simultaneously (The Gang Scheduling Story)

Imagine you're running a distributed machine learning job. Think of it like a team project where 4 people need to work together:
```bash
Job = 4 workers (4 separate pods)
Team Member 1: "I'm ready!"
Team Member 2: "I'm ready!"
Team Member 3: "I'm ready!"
Team Member 4: "Still waiting for a computer..."
```

## What happens?

Members 1-3 sit around wasting time.
The job doesn't progress.
Resources are used but no work gets done.
This is the gang scheduling problem.

#### Why ALL Pods Must Start Together

Distributed jobs have dependencies between their pods:

Pod 1 needs to talk to Pod 2
Pod 2 needs to receive from Pod 3
Pod 3 needs data from Pod 4


If Pod 4 is stuck in "Pending"...
→ Pod 3 can't send data
→ Pod 2 can't receive from Pod 3
→ Pod 1 is blocked
→ All 4 pods run but do NOTHING
**Without gang scheduling:**
```bash
Scheduler tries to place 4 pods
Puts Pod 1 ✅
Puts Pod 2 ✅
Puts Pod 3 ✅
Can't fit Pod 4 ❌
```

Result: **3 pods running, 1 waiting**
Status: **3 pods doing nothing (waiting for Pod 4)**
Wasted resources: **75% of the job's allocation is wasted**
With gang scheduling (Kueue):
Job says: "I need 4 pods or nothing"
##### Kueue checks: Can I fit all 4?
  → Yes? Admit all 4, they start together ✅✅✅✅
  → No? Queue all 4, none start yet ⏳⏳⏳⏳

***Result***: Either 100% of the job runs, or 0%
Wasted resources: None (no idle pods)
This is **Gang Scheduling**, and it's why distributed jobs absolutely need it.

# Why Batch Jobs Are Hard on Kubernetes, understanding Deadlock Scenario

Kubernetes scheduler doesn't understand gang scheduling:
It doesn't know: "These 8 pods are a team that needs resources together"
It treats each pod independently
So it partially schedules the job
Partially scheduled distributed job = **DEADLOCK**

This is where Kueue comes in.

# Meet Kueue: Your Cluster's Traffic Controller
Kueue is a job queuing and quota management system for Kubernetes Batch Workloads. 
It’s a smart traffic controller that:

1. Collects all jobs in organized queues
2. Checks available resources before admitting anything
3. Allocates fairly based on priority and quotas
4. Admits jobs atomically (all-or-nothing for distributed jobs)

### With Kueue :  
User Job → KUEUE (Smart Gatekeeper) → Kubernetes Scheduler → Pods created → No deadlock
Kueue’s Core principal is to only admit a job to the cluster when we're 100% sure we have enough resources for ALL its pods.

## Why You Actually Need Kueue

1. Fairness: Teams don't starve each other
2. Gang Scheduling: Distributed jobs run all-together or queue together
3. Priorities: Critical jobs can be prioritized over experimental ones
4. Visibility: You see exactly why a job is queued and when it'll run
5. Resource Quotas: Each team gets a guaranteed slice of the cluster

### Understanding Objects in Kueue 

1. **Workload**
What it is: A wrapper around your Kubernetes Job that Kueue understands.

Plain English: When you submit a Job to Kueue, Kueue wraps it in a "Workload" object that tracks its status in the queue.

2. **LocalQueue**
What it is: A queue for jobs in a specific namespace.

Plain English: Think of it as a "job submission desk" in your namespace. When your team submits a job, it goes into this queue first.

3. **ClusterQueue**
What it is: A higher-level queue that holds the actual resource budget.

Plain English: This is where the real resource management happens. It's the "headquarters" that decides "OK, we have 100 CPUs available. Which job gets them?Jobs from all namespaces compete here based on priority and fairness.

4. **ResourceFlavor**
What it is: A label for a type of resource in your cluster.

Plain English: It's like saying "we have two types of computers: expensive GPUs and cheap CPUs. Let me label them differently."

5. **ResourceQuota**
What it is: How much of a resource a ClusterQueue can use.

Plain English: "This queue can use up to 100 CPUs, 500GB RAM, and 16 GPUs. Not more."

6. **Admission**
What it is: When Kueue says "yes, your job can now run."

Plain English: The job has been waiting in the queue. Kueue checked the available resources and decided "OK, go ahead and run."

### How these objects Work Together

Job → Workload → LocalQueue → ClusterQueue → Resources Available? → ADMITTED → Scheduler → Pods → Running → Complete → Resources Released → Next Job


![Flowchart for Scheduling with Kueue on Kubernetes](/img/blog/inside-kueue-how-kubernetes-decides-what-runs-next/kueue-job-sched.png)

## Installation of Kueue 

Kueue is just a Kubernetes controller. 

**Step 1**: Install Kueue from Official Manifests

```bash
kubectl apply -f https://github.com/kubernetes-sigs/kueue/releases/download/v0.6.1/manifests.yaml
```

That's it. Kueue controller is now running.

**Step 2**: Verify Installation

```bash
kubectl get pods -n kueue-system
```

You should see:

```bash
NAME                                              READY  STATUS    RESTARTS   AGE
kueue-controller-manager-xxx            2/2     Running   0          10s
```

**Step 3**: Verify Custom Resources are Installed

```bash
kubectl get crds | grep kueue
```

You should see:

```bash
clusterqueues.kueue.x-k8s.io
localqueues.kueue.x-k8s.io
workloads.kueue.x-k8s.io
resourceflavors.kueue.x-k8s.io
```

Done! Kueue is ready.

## Demo 1: Basic Resource Management on Kueue  

Let's see Kueue in action with a simple scenario.

#### Setup: Create the Namespace

```bash
kubectl create namespace kueue-demo
``` 

**Step 1**: Create a ResourceFlavor

This tells Kueue about the resources available in your cluster:

```yaml
apiVersion: kueue.x-k8s.io/v1beta1
kind: ResourceFlavor
metadata:
  name: default
spec: {}
```

Save as resource-flavor.yaml and apply:

```bash
kubectl apply -f resource-flavor.yaml
```

**Step 2**: Create a ClusterQueue

This is where we set resource limits:

```yaml
apiVersion: kueue.x-k8s.io/v1beta1
kind: ClusterQueue
metadata:
  name: demo-queue
spec:
  namespaceSelector: {}
  resourceGroups:
    - coveredResources:
        - cpu
        - memory
      flavors:
        - name: default
          resources:
            - name: cpu
              nominalQuota: "10"        # Only 10 CPUs available
            - name: memory
              nominalQuota: "20Gi"      # Only 20GB RAM available
```

Save as cluster-queue.yaml and apply:

```bash
kubectl apply -f cluster-queue.yaml
```

**Step 3**: Create a LocalQueue

This connects the namespace to the ClusterQueue:

```yaml
apiVersion: kueue.x-k8s.io/v1beta1
kind: LocalQueue
metadata:
  name: default
  namespace: kueue-demo
spec:
  clusterQueue: demo-queue
```
Save as `local-queue.yaml` and apply:

```bash
kubectl apply -f local-queue.yaml
```

**Step 4**: Create Job A (The Resource Hog)

This job will use 8 out of 10 CPUs:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: job-a-big
  namespace: kueue-demo
spec:
  completions: 1
  parallelism: 1
  template:
    metadata:
      labels:
        kueue.x-k8s.io/queue-name: default
    spec:
      restartPolicy: Never
      containers:
      - name: container
        image: ubuntu:22.04
        command: ["sleep", "300"]
        resources:
          requests:
            cpu: "8"
            memory: "12Gi"
          limits:
            cpu: "8"
            memory: "12Gi"
```

Save as `job-a.yaml` and apply:

```bash
kubectl apply -f job-a.yaml
```

**Step 5**: Watch What Happens

```bash
kubectl get workloads -n kueue-demo -w
```

You should see:

```bash
NAME              QUEUE         ADMITTED   FINISHED   AGE
job-a-big         demo-queue    True       False      5s
```

Job A is ADMITTED because 8 CPUs fit within the 10 CPUs available.

**Step 6**: Create Job B (The Starved Job)

Now create another job that also needs resources:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: job-b-small
  namespace: kueue-demo
spec:
  completions: 1
  parallelism: 1
  template:
    metadata:
      labels:
        kueue.x-k8s.io/queue-name: default
    spec:
      restartPolicy: Never
      containers:
      - name: container
        image: ubuntu:22.04
        command: ["sleep", "300"]
        resources:
          requests:
            cpu: "5"
            memory: "8Gi"
          limits:
            cpu: "5"
            memory: "8Gi"
```

Save as job-b.yaml and apply:

```bash
kubectl apply -f job-b.yaml
```

**Step 7**: Watch the Queue

```bash
kubectl get workloads -n kueue-demo
```

Now you see:

```bash
NAME              QUEUE         ADMITTED   FINISHED   AGE
job-a-big         demo-queue    True       False      20s
job-b-small       demo-queue    False      False      5s
```

Job A: ADMITTED (using 8 of 10 CPUs) Job B: NOT ADMITTED (only 2 CPUs available, but needs 5)
Job B is stuck in the queue! It's waiting for resources.

**Step 8**: See Why Job B Is Waiting

```bash
kubectl describe workload job-b-small -n kueue-demo
```

Output:
Conditions:
  Queued: True (reason: "WaitingForQuota")
  Message: "Waiting for resources to be available in ClusterQueue 'demo-queue'"
Clear as day: Job B is waiting because there aren't enough CPUs.

**Step 9**: Free Up Resources (Delete Job A)

```bash
kubectl delete job job-a-big -n kueue-demo
```

Now immediately check the workloads:

```bash
kubectl get workloads -n kueue-demo

NAME              QUEUE         ADMITTED   FINISHED   AGE
job-b-small       demo-queue    True       False      30s
```

Magic! Job B is now ADMITTED. Kueue automatically moved it up the queue and gave it the freed resources.
What Just Happened
Job A grabbed the big resources
Job B arrived but couldn't fit
Job A finished, releasing resources
Kueue saw the freed resources
Kueue admitted Job B
Job B ran
This is fair resource management. This is what **Kueue** does.


# Demo 2: The Deadlock Scenario + it's fix 

Real-world analogy for Deadlock Scenario: 
Car A: "I need to go forward, but Car B is blocking me"
Car B: "I need to go backward, but Car A is blocking me"
Result: Both stuck forever

**So first lets create a Deadlock and then find the ways to fix the deadlock scenario** 

Use this command in your terminal directly to create deadlock 

```bash
kubectl apply -f - <<EOF
apiVersion: kueue.x-k8s.io/v1beta1
kind: ResourceFlavor
metadata:
  name: default
spec: {}
---
apiVersion: kueue.x-k8s.io/v1beta1
kind: ClusterQueue
metadata:
  name: deadlock-demo
spec:
  namespaceSelector: {}
  resourceGroups:
    - coveredResources:
        - cpu
        - memory
      flavors:
        - name: default
          resources:
            - name: cpu
              nominalQuota: "16"     # Very limited
            - name: memory
              nominalQuota: "32Gi"
---
apiVersion: kueue.x-k8s.io/v1beta1
kind: LocalQueue
metadata:
  name: default
  namespace: kueue-demo
spec:
  clusterQueue: deadlock-demo
EOF
```

**Now create Job A (Resource Hog):**

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: job-a-hog
  namespace: kueue-demo
spec:
  completions: 1
  parallelism: 1
  template:
    metadata:
      labels:
        kueue.x-k8s.io/queue-name: default
    spec:
      restartPolicy: Never
      containers:
      - name: container
        image: ubuntu:22.04
        command: ["sleep", "600"]
        resources:
          requests:
            cpu: "12"      # Uses 12 of 16 CPUs
            memory: "24Gi"
          limits:
            cpu: "12"
            memory: "24Gi"
```

**Submit Job A:**

```bash
kubectl apply -f job-a-hog.yaml
kubectl get workloads -n kueue-demo
```

Output:
```bash
NAME         QUEUE              ADMITTED   FINISHED
job-a-hog    deadlock-demo      True       False
```

Job A is admitted and running.


**Now create Job B (Also needs lots):**

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: job-b-needs-12
  namespace: kueue-demo
spec:
  completions: 1
  parallelism: 1
  template:
    metadata:
      labels:
        kueue.x-k8s.io/queue-name: default
    spec:
      restartPolicy: Never
      containers:
      - name: container
        image: ubuntu:22.04
        command: ["sleep", "600"]
        resources:
          requests:
            cpu: "12"      # Also needs 12 CPUs
            memory: "24Gi"
          limits:
            cpu: "12"
            memory: "24Gi"
```

**Submit Job B:**

```bash
kubectl apply -f job-b-needs-12.yaml
kubectl get workloads -n kueue-demo
```

Output:

```bash
NAME            QUEUE              ADMITTED   FINISHED
job-a-hog       deadlock-demo      True       False
job-b-needs-12  deadlock-demo      False      False
```

Job B is stuck! It's waiting for 12 CPUs, but only 4 are available (16 - 12 = 4).
This is a deadlock:
Job A holds 12 CPUs and won't release them for 10 minutes (sleep 600)
Job B needs 12 CPUs but only 4 are free
Job B waits
When Job A finishes, resources are released... but only if someone runs for 10 minutes

Now check the details:

```bash
kubectl describe workload job-b-needs-12 -n kueue-demo
```

Output:

```bash
Conditions:
  Queued: True (reason: "WaitingForQuota")
  Message: "Waiting for resources to be available"
```

This is **deadlock** in action:
Clear resources exist but in wrong proportions
Job B can't proceed
Job A won't release until it's done
##### Queue is stuck

# Now Lets jump on to how Fix this DEADLOCK

### Strategy 1: Separate Queues by Resource Type

Instead of one big queue, create separate queues for different job types:

```yaml
# Queue 1: For CPU-heavy jobs

apiVersion: kueue.x-k8s.io/v1beta1
kind: ClusterQueue
metadata:
  name: cpu-heavy-queue
spec:
  namespaceSelector: {}
  resourceGroups:
    - coveredResources:
        - cpu
      flavors:
        - name: default
          resources:
            - name: cpu
              nominalQuota: "100"  # All CPUs to this queue

---
# Queue 2: For memory-heavy jobs  

apiVersion: kueue.x-k8s.io/v1beta1
kind: ClusterQueue
metadata:
  name: memory-heavy-queue
spec:
  namespaceSelector: {}
  resourceGroups:
    - coveredResources:
        - memory
      flavors:
        - name: default
          resources:
            - name: memory
              nominalQuota: "500Gi"  # All memory to this queue
```

How it prevents deadlock:

1. CPU-heavy jobs don't compete with memory-heavy jobs
2. No conflicting resource needs
3. No deadlock possible

### Strategy 2: Use minimumReservedResources**

Reserve resources for follow-on jobs:

```yaml
apiVersion: kueue.x-k8s.io/v1beta1
kind: ClusterQueue
metadata:
  name: safe-queue
spec:
  namespaceSelector: {}
  resourceGroups:
    - coveredResources:
        - cpu
        - memory
      flavors:
        - name: default
          resources:
            - name: cpu
              nominalQuota: "100"
              minimumReservedResources: "50"  # ← Reserve 50 CPUs for later jobs
            - name: memory
              nominalQuota: "200Gi"
              minimumReservedResources: "100Gi"  # ← Reserve 100GB for later jobs
How it works:
Job A can use up to 50 CPUs (reserved portion is held back)
Ensures Job B won't starve even if Job A takes max
Prevents deadlock by design
```

### Resources

Official Kueue Docs: https://kueue.sigs.k8s.io/
GitHub: https://github.com/kubernetes-sigs/kueue
Install: kubectl apply -f https://github.com/kubernetes-sigs/kueue/releases/download/v0.6.1/manifests.yaml
