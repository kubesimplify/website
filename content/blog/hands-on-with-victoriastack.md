---
title: "Hands-on with VictoriaStack on Docker Compose and Kubernetes"
seoTitle: "Hands-on with VictoriaStack on Docker Compose and Kubernetes"
seoDescription: "We run VictoriaStack on a laptop, query metrics, logs and traces through one entry point, stop a service and find the cause, then try Kubernetes with kiac."
datePublished: 2026-11-19T00:00:00.000Z
slug: hands-on-with-victoriastack
author: saiyam-pathak
tags: ["victoriametrics", "observability", "opentelemetry", "kubernetes", "grafana"]
cover: /img/blog/hands-on-with-victoriastack/cover.png
---


How many places do you send telemetry to today? If you keep metrics, logs and traces, the answer is often three, and each one has its own install, ports and way to get data in. And when something breaks, you have to look in all three to find out why.

On 10 November 2026, the VictoriaMetrics team [introduced VictoriaStack](https://victoriametrics.com/blog/introducing-victoriastack-the-right-database-for-every-signal/). It is three databases, one for each kind of telemetry data: VictoriaMetrics for metrics, VictoriaLogs for logs and VictoriaTraces for traces. All three sit behind one entry point, and one OpenTelemetry pipeline sends data to all of them. The announcement explains why they built it this way. This post is the hands-on part.

In this post, we will:

- start VictoriaStack on a laptop with two commands
- see how one entry point reaches all three databases
- run a first query for metrics, logs and traces
- stop a service and find the cause with all three
- try the cluster version
- install the stack on Kubernetes with kiac and Helm

## What is VictoriaStack?

VictoriaStack is three open source databases that are documented and deployed together. All three are Apache 2.0 licensed.

| Data | Database | Query language | Default port |
| --- | --- | --- | --- |
| Metrics | VictoriaMetrics | MetricsQL | 8428 |
| Logs | VictoriaLogs | LogsQL | 9428 |
| Traces | VictoriaTraces | LogsQL, Jaeger API, Tempo API (experimental) | 10428 |

Metrics, logs and traces are often called the three signals. Each signal gets its own database because they are different kinds of data. A metric is a number that arrives at a steady pace. A log is a piece of text that you want to search. A trace is the path of one request through your services. In the announcement, the VictoriaMetrics team says that one general-purpose database does not suit any of the three well. So each signal gets a database built for it.

On top of three separate databases, the stack adds three things:

1. **One entry point.** [vmauth](https://docs.victoriametrics.com/victoriametrics/vmauth/), a small proxy, sits in front and sends each request to the right database by its path.
2. **One pipeline.** All three databases accept OTLP, the OpenTelemetry protocol. So one OpenTelemetry Collector can send data to all of them.
3. **The same tools to deploy and alert.** One Helm chart installs all of them on Kubernetes, and vmalert, the program that runs alerting rules, works with all of them.

Think of an office building with three departments, one on each floor. You don't want three entrances and three addresses. You want one front desk that sends you to the right floor. vmauth is that front desk, and the path of your request (`/metrics`, `/logs` or `/traces`) says which floor you want.

![The quick start: two demo services send OTLP to an OpenTelemetry Collector. The Collector, Grafana and both vmalert instances all talk to vmauth on port 8427, which routes /metrics to VictoriaMetrics, /logs to VictoriaLogs and /traces to VictoriaTraces.](/img/blog/hands-on-with-victoriastack/01-one-entry-point.png)

## Prerequisites

You need:

- git, make, `curl` and `jq`
- Docker with Compose
- for the Kubernetes part: [kiac](https://github.com/saiyam1814/kiac) (it needs an Apple silicon Mac), kubectl and Helm

The commands in this post were run on a MacBook Pro (Apple M1 Max) with Docker Desktop 4.75.0. The VictoriaStack repo was at commit `5c1df0b`. Its single-node Compose file uses VictoriaMetrics v1.156.0, VictoriaLogs v1.54.0 and VictoriaTraces v0.13.0.

## Step 1: Start the stack

Clone the repo and run one `make` command:

```console
$ git clone https://github.com/VictoriaMetrics/VictoriaStack.git && cd VictoriaStack
Cloning into 'VictoriaStack'...

$ make otel-single-up
docker compose \
	-f deployment/otel-single-node.yml \
 	-f deployment/otel-demo-mini.yml \
 	up -d
...
 Container deployment-shipping-1 Started 
 Container deployment-traffic-1 Starting 
 Container deployment-traffic-1 Started 
```

The above commands pull the images and start the stack. Now let's see what is running:

```console
$ docker ps --filter name=deployment --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
NAMES                          IMAGE                                         STATUS
deployment-traffic-1           curlimages/curl:8.12.1                        Up 5 seconds
deployment-shipping-1          ghcr.io/open-telemetry/demo:3.0.0-shipping    Up 5 seconds
deployment-victorialogs-1      victoriametrics/victoria-logs:v1.54.0         Up 6 seconds
deployment-quote-1             ghcr.io/open-telemetry/demo:3.0.0-quote       Up 6 seconds
deployment-flagd-1             ghcr.io/open-feature/flagd:v0.16.0            Up 6 seconds
deployment-rules-logs-1        victoriametrics/vmalert:v1.156.0              Up 6 seconds
deployment-vmstack-1           victoriametrics/vmauth:v1.156.0               Up 6 seconds
deployment-rules-metrics-1     victoriametrics/vmalert:v1.156.0              Up 6 seconds
deployment-victoriatraces-1    victoriametrics/victoria-traces:v0.13.0       Up 6 seconds
deployment-grafana-1           grafana/grafana:latest                        Up 6 seconds
deployment-victoriametrics-1   victoriametrics/victoria-metrics:v1.156.0     Up 6 seconds
deployment-otelcol-1           otel/opentelemetry-collector-contrib:latest   Up 7 seconds
```

There are 12 containers:

- `victoriametrics`, `victorialogs` and `victoriatraces` are the three databases.
- `vmstack` is vmauth, the entry point on port 8427.
- `rules-metrics` and `rules-logs` are two vmalert instances. The first one runs the alerting rules, and the second one turns logs into metrics.
- `otelcol` is the OpenTelemetry Collector.
- `grafana` is Grafana, with data sources and a dashboard already set up.
- `shipping` and `quote` are two services from the [OpenTelemetry demo](https://github.com/open-telemetry/opentelemetry-demo). `traffic` calls `shipping` every two seconds, and `shipping` asks `quote` for a price. `flagd` serves feature flags to `shipping`.

Wait three or four minutes before the next step, so that there is some data to query.

## Step 2: One entry point for three databases

Everything goes through `http://localhost:8427`, which is vmauth. Its config file says where each request goes. Let's look at the first ten lines:

```console
$ sed -n '1,10p' deployment/config/vmauth/single-node.yml
unauthorized_user:
  url_map:
    # VictoriaMetrics access
    - src_paths: ["/metrics/select/.*"]
      drop_src_path_prefix_parts: 2
      url_prefix:
        - "http://victoriametrics:8428"
    - src_paths: ["/metrics/insert/.*"]
      drop_src_path_prefix_parts: 2
      url_prefix:
```

A request whose path starts with `/metrics/select/` goes to VictoriaMetrics on port 8428. `drop_src_path_prefix_parts: 2` removes the `/metrics/select` part from the path before the request is passed on. `select` is for reading data and `insert` is for writing it. The file has the same kind of rules for `/logs` and `/traces`.

There are no users or passwords in this file, which is fine on a laptop. In a real setup, vmauth is where you add them. The docs have an [access control page](https://docs.victoriametrics.com/victoriastack/access-control/) for that.

To keep the commands short, let's save three small helpers in a file called `helpers.sh`:

```sh
# Three small helpers. Each one goes through the same entry point: vmauth on port 8427.
V=http://localhost:8427

# MetricsQL, through /metrics
mq() { curl -s "$V/metrics/select/prometheus/api/v1/query" --data-urlencode "query=$1" | jq -c '.data.result[] | {metric, value: .value[1]}'; }

# LogsQL over logs, through /logs
lq() { curl -s "$V/logs/select/logsql/query" --data-urlencode "query=$1"; }

# LogsQL over traces, through /traces
tq() { curl -s "$V/traces/select/logsql/query" --data-urlencode "query=$1"; }
```

```console
$ . ./helpers.sh
```

All three helpers use the same host and port. The first part of the path picks the database.

## Step 3: One Collector for all three signals

Now let's see how the data gets in. The demo app sends everything to the OpenTelemetry Collector over OTLP, and the Collector passes it on. Each place it sends data to is called an exporter. Let's see where the exporters point:

```console
$ grep -o '[a-z]*_endpoint: [^ ,]*' deployment/config/otelcollector/config.yml
metrics_endpoint: http://vmstack:8427/metrics/insert/opentelemetry/v1/metrics
logs_endpoint: http://vmstack:8427/logs/insert/opentelemetry/v1/logs
logs_endpoint: http://vmstack:8427/logs/insert/opentelemetry/v1/logs
traces_endpoint: http://vmstack:8427/traces/insert/opentelemetry/v1/traces
```

Every endpoint has the same host and port. `vmstack:8427` is vmauth inside the Compose network, and again the path picks the database. (The logs endpoint is listed twice because the quick start sends the logs a second time, under another account ID.)

If you already run a Collector, this is the part you add to your own setup: one exporter for each database.

## Step 4: First queries

### Metrics

MetricsQL is the query language of VictoriaMetrics. It is [backwards-compatible with PromQL](https://docs.victoriametrics.com/victoriametrics/metricsql/), the Prometheus query language, so the PromQL queries you already know should work here. Let's ask how many requests per second each route gets:

```console
$ mq 'sum(rate(http.server.request.duration_count[1m])) by (http.route)'
{"metric":{"http.route":"/get-quote"},"value":"0.49986670221274326"}
```

Half a request per second, because `traffic` calls `shipping` every two seconds. The metric name has dots in it because it comes from OpenTelemetry, and VictoriaMetrics keeps such names as they are.

### Logs

LogsQL is the query language of VictoriaLogs. A query starts with a filter, and after each `|` comes a step that reshapes the result. Let's count the log records of each service in the last five minutes:

```console
$ lq '_time:5m | stats by (service.name) count() as logs'
{"service.name":"quote","logs":"131"}
{"service.name":"shipping","logs":"269"}
```

The quick start also turns logs into a metric. One of its vmalert rules counts the log records of each service every minute and saves the result in VictoriaMetrics:

```console
$ mq 'service_name:logs_count:1m'
{"metric":{"__name__":"service_name:logs_count:1m","service.name":"quote","stats_result":"count(*)"},"value":"29"}
{"metric":{"__name__":"service_name:logs_count:1m","service.name":"shipping","stats_result":"count(*)"},"value":"58"}
```

That is 29 records a minute from `quote` and 58 from `shipping`. Keep these two numbers in mind for the next step.

### Traces

VictoriaTraces supports the API of Jaeger, a well-known open source tracing tool. So tools like Grafana can read traces from it. Let's list the services it knows:

```console
$ curl -s $V/traces/select/jaeger/api/services
{"data":["flagd","quote","shipping"],"errors": null,"limit": 0,"offset": 0,"total":3}
```

VictoriaTraces also understands LogsQL. A trace is made of spans (a span is one timed step of a request), and VictoriaTraces stores spans the same way VictoriaLogs stores log records. So we can count the spans by name with the language we just used for logs. The `name:*` filter keeps only the records that have a span name:

```console
$ tq '_time:5m name:* | stats by (name) count() as spans'
{"name":"calculate-quote","spans":"124"}
{"name":"flagSync","spans":"1"}
{"name":"{closure}","spans":"124"}
{"name":"POST /getquote","spans":"124"}
{"name":"POST /get-quote","spans":"124"}
{"name":"POST quote","spans":"124"}
```

## Step 5: Break something and find the cause

Now let's create an incident. `shipping` needs the `quote` service for every request, so let's stop it:

```console
$ docker stop deployment-quote-1
deployment-quote-1
```

Wait two minutes, and then look at the requests by HTTP status code:

```console
$ mq 'sum(rate(http.server.request.duration_count[1m])) by (http.response.status_code)'
{"metric":{"http.response.status_code":"200"},"value":"0"}
{"metric":{"http.response.status_code":"500"},"value":"0.4832769510223807"}
```

Every request now fails with a 500. The quick start comes with alert rules, so let's see what they say:

```console
$ curl -s $V/metrics/select/prometheus/api/v1/alerts | jq -c '.data.alerts[] | {alert: .labels.alertname, state}'
{"alert":"RequestErrorsRatioHigh","state":"pending"}
{"alert":"HighRequestLatency","state":"firing"}
```

`RequestErrorsRatioHigh` is `pending`: its condition is true, but not for long enough yet. The rule needs more than 5% of the requests of a service to fail with a 5xx status (500 to 599) for five minutes. After that the alert is `firing`. (`HighRequestLatency` fires all the time in this quick start, so ignore it. More on that at the end.)

### What do the traces say?

The metrics tell us that requests fail. They do not tell us why. Let's ask the traces. In OpenTelemetry, a failed span has status code 2, so we filter on that and group the result:

```console
$ tq '_time:5m status_code:2 | stats by (name, status_message) count() as spans'
{"name":"POST quote","status_message":"Connect(Resolver(Custom { kind: Uncategorized, error: \"failed to lookup address information: Name or service not known\" }))","spans":"49"}
{"name":"POST /get-quote","status_message":"Internal Server Error","spans":"49"}
```

There are two kinds of failed span. `POST /get-quote` is the request that `shipping` received, and it ended with "Internal Server Error". `POST quote` is the call that `shipping` made to `quote`, and its message has the real reason: "failed to lookup address information: Name or service not known". `shipping` cannot find `quote` on the network.

VictoriaTraces has a built-in web interface, called VMUI, at `http://localhost:8427/traces/select/vmui/`. Here is one of the failed traces, with the call to `quote` selected:

![The VictoriaTraces interface showing one failed trace with two spans, POST /get-quote and POST quote, both marked as errors. The POST quote span is selected: error is true, error.type starts with Connect(Resolver, server.address is quote and url.full is http://quote:8080/getquote.](/img/blog/hands-on-with-victoriastack/02-failing-trace.png)

### What do the logs say?

When did it start? Let's ask VictoriaLogs for the last log record of `quote`:

```console
$ lq 'service.name:=quote | sort by (_time desc) | limit 1 | fields _time, _msg'
{"_time":"2026-11-19T01:30:25.226361Z","_msg":"Calculated quote"}
```

That is the last request before we stopped the container. The metric from Step 4 that counts log records shows it too:

```console
$ mq 'service_name:logs_count:1m'
{"metric":{"__name__":"service_name:logs_count:1m","service.name":"shipping","stats_result":"count(*)"},"value":"29"}
```

The line for `quote` is gone. And `shipping` now writes 29 records a minute, where it wrote 58 before. It still logs that it asks for a quote, but it logs nothing about the failure. So the logs of `shipping` alone would not tell us what went wrong. The reason was in the trace.

### The alert fires

A few minutes later the alert is `firing`. In this run that was a little over six minutes after we stopped `quote`:

```console
$ curl -s $V/metrics/select/prometheus/api/v1/alerts | jq -c '.data.alerts[] | {alert: .labels.alertname, state}'
{"alert":"RequestErrorsRatioHigh","state":"firing"}
{"alert":"HighRequestLatency","state":"firing"}
```

VictoriaMetrics has its own VMUI too. Its Alerting page is at `http://localhost:8427/metrics/select/vmui/#/rules`:

![VMUI's Alerting page. The demo-app group has three rules: HighRequestLatency and RequestErrorsRatioHigh are firing, and NoQuotesCalculated is inactive.](/img/blog/hands-on-with-victoriastack/03-alert-firing.png)

So each signal gave us one part of the answer:

- The metrics and the alert said **what** is wrong: every request to `shipping` fails.
- The trace said **where and why**: the call to `quote` fails, because the name `quote` cannot be found.
- The logs said **when**: `quote` wrote its last record at 01:30:25 UTC.

![One outage, three signals. Metrics said what: every request fails with status 500, and the alert fired. A trace said where and why: the call POST quote fails because the name is not known. Logs said when: the last record of quote is at 01:30:25.](/img/blog/hands-on-with-victoriastack/04-one-outage-three-signals.png)

The quick start's Grafana has data sources for all three databases. Open `http://localhost:3000/explore` (login `admin` and `admin`), pick the "VictoriaTraces Jaeger" data source, choose the TraceID query type, and paste a trace ID from the VictoriaTraces interface. Grafana shows a failed trace the same way:

![Grafana Explore with the VictoriaTraces Jaeger data source. The trace of shipping POST /get-quote has status 500 and two spans, POST /get-quote and POST quote, both marked as errors.](/img/blog/hands-on-with-victoriastack/05-grafana-trace.png)

### Fix it

Start the service again:

```console
$ docker start deployment-quote-1
deployment-quote-1
```

Two minutes later, the requests are back to 200:

```console
$ mq 'sum(rate(http.server.request.duration_count[1m])) by (http.response.status_code)'
{"metric":{"http.response.status_code":"200"},"value":"0.4999000199960008"}
{"metric":{"http.response.status_code":"500"},"value":"0"}
```

Here is the whole incident as a graph in VMUI. The red line is status 200 and the blue line is status 500:

![A VMUI graph of requests per second by HTTP status code, from 01:24 to 01:46. The line for status 200 drops from 0.5 to 0 when quote is stopped, and a line for status 500 appears at 0.5. When quote is started again, they switch back.](/img/blog/hands-on-with-victoriastack/06-requests-by-status.png)

The alert cleared six minutes after we started `quote` again. When you are done, stop the stack and delete its data:

```console
$ make otel-single-down
docker compose \
	-f deployment/otel-single-node.yml \
	-f deployment/otel-demo-mini.yml \
	down -v
...
 Volume deployment_vl-data Removed 
 Network deployment_default Removed 
```

## Step 6: The cluster version

So far, each database was one container. This is called the single-node version, and it is the right place to start. When one machine is not enough for your data, each database can also run as a cluster. In the cluster version, the work of one database is split between three kinds of component:

- `insert` receives new data and passes it to the storage nodes
- `storage` keeps the data on disk
- `select` answers queries by reading from the storage nodes

You can run several copies of each one, on different machines.

![Single-node and cluster version side by side. In the single-node version, one victorialogs process does everything. In the cluster version, vmauth sends writes to two vlinsert processes and reads to two vlselect processes, and both talk to two vlstorage processes that keep the data.](/img/blog/hands-on-with-victoriastack/07-cluster-version.png)

The repo has a second Compose file that starts two copies of each component, for each database:

```console
$ make otel-cluster-up
docker compose \
	-f deployment/otel-cluster.yml \
 	-f deployment/otel-demo-mini.yml \
 	up -d
...
 Container deployment-shipping-1 Started 
 Container deployment-traffic-1 Starting 
 Container deployment-traffic-1 Started 
```

Let's look at the containers of one database, VictoriaLogs:

```console
$ docker ps --filter name=deployment-vl --format '{{.Names}}\t{{.Image}}' | sort
deployment-vlinsert-1-1	victoriametrics/victoria-logs:v1.54.0
deployment-vlinsert-2-1	victoriametrics/victoria-logs:v1.54.0
deployment-vlselect-1-1	victoriametrics/victoria-logs:v1.54.0
deployment-vlselect-2-1	victoriametrics/victoria-logs:v1.54.0
deployment-vlstorage-1-1	victoriametrics/victoria-logs:v1.54.0
deployment-vlstorage-2-1	victoriametrics/victoria-logs:v1.54.0
```

Two for `insert`, two for `select` and two for `storage`. VictoriaMetrics and VictoriaTraces get the same six, so there are 18 database containers now, where there were 3 before. With vmauth, the demo app and the rest, that makes 27:

```console
$ docker ps --filter name=deployment -q | wc -l
      27
```

For the person who queries, nothing changes. vmauth now knows two addresses for every route and spreads the requests between them. After a few minutes, our helpers give the same kind of answers as before:

```console
$ mq 'sum(rate(http.server.request.duration_count[1m])) by (http.route)'
{"metric":{"http.route":"/get-quote"},"value":"0.49994167347142837"}

$ lq '_time:5m | stats by (service.name) count() as logs'
{"service.name":"quote","logs":"94"}
{"service.name":"shipping","logs":"193"}

$ curl -s $V/traces/select/jaeger/api/services
{"data":["flagd","quote","shipping"],"errors": null,"limit": 0,"offset": 0,"total":3}
```

Stop it with:

```console
$ make otel-cluster-down
docker compose \
	-f deployment/otel-cluster.yml \
 	-f deployment/otel-demo-mini.yml \
 	down -v
...
 Network deployment_default Removed 
```

## Step 7: Kubernetes with kiac and Helm

Compose is fine for learning. Now let's install the same stack on Kubernetes. For a local cluster I am using [kiac](https://github.com/saiyam1814/kiac) (Kubernetes in Apple Containers), which is something I built. It is like kind, but every node runs in its own lightweight virtual machine on an Apple silicon Mac, and it comes with a LoadBalancer and metrics-server. If you are not on an Apple silicon Mac, kind or minikube will work too.

```console
$ kiac create cluster --name victoriastack
 ✓ Preflight checks (100ms)
 ✓ Pulling node image kindest/node:v1.37.0 (1.9s)
 ✓ Booting 1 node VM(s) (8.1s)
 ✓ Initializing Kubernetes control plane (20.9s)
 ✓ Installing CNI (kindnet) (300ms)
 ✓ Untainting control plane for workloads (100ms)
 ✓ Installing addons (storage, metrics-server) (300ms)
 ✓ Installing LoadBalancer (kiac-lb) (500ms)
 ✓ Waiting for nodes to be Ready (16s)
...
Cluster "victoriastack" is ready in 52s. Every node is its own lightweight VM.

$ kubectl get nodes
NAME                               STATUS   ROLES           AGE   VERSION
kiac-victoriastack-control-plane   Ready    control-plane   24s   v1.37.0
```

On Kubernetes, the [VictoriaMetrics operator](https://docs.victoriametrics.com/operator/) runs the databases, and the `victoria-metrics-k8s-stack` Helm chart installs the operator and everything else. By default, the chart installs only the metrics part. Logs, traces and vmauth are off. So we turn them on in a file called `values.yaml`:

```yaml
# victoria-metrics-k8s-stack values for the post.
# Metrics are on by default. This turns on logs, traces, pod log
# collection, and one vmauth in front of all three databases.
fullnameOverride: stack

vlsingle:
  enabled: true

vtsingle:
  enabled: true

# Collects the logs of every pod and sends them to VictoriaLogs.
vlagent:
  enabled: true

# The single entry point, with the same path prefixes as the Compose quick start.
vmauth:
  enabled: true
  spec:
    # A LoadBalancer Service, so the entry point gets an address you can reach from your machine.
    serviceSpec:
      useAsDefault: true
      spec:
        type: LoadBalancer
    unauthorizedUserAccessSpec:
      url_map:
        - src_paths: ["/metrics/select/.*", "/metrics/insert/.*"]
          drop_src_path_prefix_parts: 2
          url_prefix: ["http://vmsingle-stack:8428"]
        - src_paths: ["/logs/select/.*", "/logs/insert/.*"]
          drop_src_path_prefix_parts: 1
          url_prefix: ["http://vlsingle-stack:9428"]
        - src_paths: ["/traces/select/.*", "/traces/insert/.*"]
          drop_src_path_prefix_parts: 1
          url_prefix: ["http://vtsingle-stack:10428"]

# Grafana needs this plugin to get a VictoriaLogs data source.
grafana:
  plugins:
    - victoriametrics-logs-datasource
```

The `url_map` gives vmauth the same three path prefixes as in the Compose setup. Now add the chart repository and install the chart:

```console
$ helm repo add vm https://victoriametrics.github.io/helm-charts/
"vm" has been added to your repositories

$ helm install stack vm/victoria-metrics-k8s-stack --version 0.98.1 --namespace monitoring --create-namespace -f values.yaml
NAME: stack
LAST DEPLOYED: Thu Nov 19 06:56:16 2026
NAMESPACE: monitoring
STATUS: deployed
REVISION: 1
DESCRIPTION: Install complete
NOTES:
```

In this run, the pods were running after about three minutes:

```console
$ kubectl get pods -n monitoring
NAME                                               READY   STATUS            RESTARTS   AGE
stack-grafana-78b8c47d8f-wblh4                     3/3     Running           0          2m52s
stack-kube-state-metrics-ccf8dcc8c-bpw4j           1/1     Running           0          2m52s
stack-prometheus-node-exporter-2wdbt               1/1     Running           0          2m52s
stack-sync-job-m88r7                               0/1     Completed         0          2m52s
stack-victoria-metrics-operator-7dc8f8f9fc-hdpls   1/1     Running           0          2m52s
vlagent-stack-2llrx                                1/1     Running           0          2m28s
vlsingle-stack-7fddc448d-w8xl4                     1/1     Running           0          2m23s
vmagent-stack-64bdf8b76f-sd6l7                     2/2     Running           0          2m28s
vmalert-stack-7889b7cd8c-mzdn7                     2/2     Running           0          2m28s
vmalertmanager-stack-0                             0/2     PodInitializing   0          2m28s
vmauth-stack-57cfd6f9-8gsd9                        2/2     Running           0          2m28s
vmauth-stack-internal-76955bc6d5-hvq5l             2/2     Running           0          2m28s
vmsingle-stack-69f74b6ff4-hgsrw                    1/1     Running           0          2m28s
vtsingle-stack-748569db7-qfc9f                     1/1     Running           0          2m23s
```

The three databases are `vmsingle`, `vlsingle` and `vtsingle`, and `vmauth-stack` is our entry point. `vmauth-stack-internal` is a second vmauth that the chart adds for vmalert. (Alertmanager was still starting at that moment.) Now let's look at the Service of vmauth:

```console
$ kubectl get svc -n monitoring vmauth-stack
NAME           TYPE           CLUSTER-IP      EXTERNAL-IP    PORT(S)          AGE
vmauth-stack   LoadBalancer   10.103.117.81   192.168.64.3   8427:32610/TCP   2m28s
```

kiac gave the Service an external IP, and your Mac can reach that IP directly. So there is no need for `kubectl port-forward`. (On kind or minikube, run `kubectl port-forward -n monitoring svc/vmauth-stack 8427:8427` in a second terminal and skip the `V=` line below, so the helpers keep using `localhost`.) Let's load our helpers again and point them at the new address:

```console
$ . ./helpers.sh

$ V=http://$(kubectl get svc -n monitoring vmauth-stack -o jsonpath='{.status.loadBalancer.ingress[0].ip}'):8427; echo $V
http://192.168.64.3:8427
```

There is no demo app in this cluster, but there is data already. vmagent collects the metrics of the cluster, and vlagent collects the logs of every pod:

```console
$ mq 'count(kube_pod_info) by (namespace)'
{"metric":{"namespace":"kube-system"},"value":"9"}
{"metric":{"namespace":"local-path-storage"},"value":"1"}
{"metric":{"namespace":"monitoring"},"value":"14"}

$ lq '_time:5m | stats by (kubernetes.pod_namespace) count() as logs'
{"kubernetes.pod_namespace":"kube-system","logs":"299"}
{"kubernetes.pod_namespace":"monitoring","logs":"3118"}
{"kubernetes.pod_namespace":"local-path-storage","logs":"24"}
```

For traces, we need something that sends spans. Let's send 20 test traces with `telemetrygen`, a test tool from the OpenTelemetry project:

```console
$ kubectl run telemetrygen -n monitoring --rm -i --restart=Never --image=ghcr.io/open-telemetry/opentelemetry-collector-contrib/telemetrygen:v0.165.0 -- traces --otlp-http --otlp-insecure --otlp-endpoint vmauth-stack:8427 --otlp-http-url-path /traces/insert/opentelemetry/v1/traces --service hello-from-kiac --traces 20
...
2026-11-19T01:31:33.139Z	INFO	traces/worker.go:180	traces generated	{"worker": 0, "traces": 20}
2026-11-19T01:31:33.139Z	INFO	traces/traces.go:75	stop the batch span processor
2026-11-19T01:31:33.140Z	INFO	traces/traces.go:65	stopping the exporter
pod "telemetrygen" deleted from monitoring namespace

$ curl -s $V/traces/select/jaeger/api/services
{"data":["hello-from-kiac"],"errors": null,"limit": 0,"offset": 0,"total":1}
```

VictoriaTraces shows new spans after about 30 seconds (more on that at the end). So wait a little, and then count the spans:

```console
$ tq '_time:5m name:* | stats by (name) count() as spans'
{"name":"lets-go","spans":"20"}
{"name":"okey-dokey-0","spans":"20"}
```

All three signals answer on Kubernetes, through the same three paths as with Compose. When you are done, delete the cluster:

```console
$ kiac delete cluster --name victoriastack
 ✓ Deleting 1 node VM(s) (2.5s)
 ✓ Removing kubeconfig entries (0s)
Cluster "victoriastack" deleted.
```

## A few things to know

Here are five things we noticed during the runs. Knowing them can save you a few minutes.

- **`HighRequestLatency` fires on a healthy system.** Its threshold is 1 ms, which any traffic crosses. Ignore it here, and don't copy it as it is.
- **Grafana can be slow on a fresh start.** It downloads a plugin of about 79 MB before it opens port 3000, so the time depends on your connection. In one of the runs it took two and a half minutes. If the download fails, the Grafana container exits. Look at `docker logs deployment-grafana-1`, and run `make otel-single-up` again.
- **The databases and vmauth do not ask for a password.** The single-node quick start publishes the three database ports next to 8427 on every network interface, and vmauth has no users. That is fine on a laptop. On a shared network, bind the published ports to `127.0.0.1`.
- **New spans show up after 30 seconds.** Most query APIs of VictoriaTraces [leave the newest 30 seconds out](https://docs.victoriametrics.com/victoriatraces/querying/#search-latency) by default. That is why we waited before counting the test spans.
- **The `shippingSlowdown` feature flag does nothing.** The quick start defines this flag, but the `shipping` service in this image does not read it. That is why we stopped a container to create our incident.

## Wrapping up

We started VictoriaStack with two commands, queried metrics, logs and traces through one port, and then stopped a service and found the cause using all three signals. We also ran the same stack as a cluster and on Kubernetes with kiac.

Overall, VictoriaStack is a simple way to run metrics, logs and traces together, and what I like the most is that nothing is hidden. It is three databases and a proxy, and you can read the config files that connect them in a few minutes. My favourite part is the single entry point with `/metrics`, `/logs` and `/traces`. Just keep in mind that VictoriaTraces has not reached version 1.0 yet, and for a single view across all three signals you need Grafana for now.

Give it a try on your laptop and let me know how you find it.

## Credits and links

- Thanks to the VictoriaMetrics team for building the stack, the quick start and the docs, and to the OpenTelemetry demo and flagd maintainers for the demo services.
- Announcement: [Introducing VictoriaStack: The Right Database for Every Signal](https://victoriametrics.com/blog/introducing-victoriastack-the-right-database-for-every-signal/)
- Docs: [VictoriaStack](https://docs.victoriametrics.com/victoriastack/), [quick start](https://docs.victoriametrics.com/victoriastack/quick-start/), [deployment](https://docs.victoriametrics.com/victoriastack/deployment/), [querying](https://docs.victoriametrics.com/victoriastack/querying/), [alerting](https://docs.victoriametrics.com/victoriastack/alerting/)
- Repo with the Compose files: [github.com/VictoriaMetrics/VictoriaStack](https://github.com/VictoriaMetrics/VictoriaStack)
- Helm chart: [victoria-metrics-k8s-stack](https://docs.victoriametrics.com/helm/victoria-metrics-k8s-stack/), and the [operator](https://docs.victoriametrics.com/operator/)
- Query languages: [MetricsQL](https://docs.victoriametrics.com/victoriametrics/metricsql/) and [LogsQL](https://docs.victoriametrics.com/victorialogs/logsql/)
- kiac: [github.com/saiyam1814/kiac](https://github.com/saiyam1814/kiac)
- The demo services: [OpenTelemetry demo](https://github.com/open-telemetry/opentelemetry-demo) and [flagd](https://flagd.dev/)
