---
title: "Hands-on with VictoriaStack on Docker Compose and Kubernetes"
seoTitle: "Hands-on with VictoriaStack on Docker Compose and Kubernetes"
seoDescription: "We run VictoriaStack on a laptop, query metrics, logs, and traces through one entry point, stop a service and find the cause, then try Kubernetes with kind."
datePublished: 2026-11-19T00:00:00.000Z
slug: hands-on-with-victoriastack
author: saiyam-pathak
tags: ["victoriametrics", "observability", "opentelemetry", "kubernetes", "grafana"]
cover: /img/blog/hands-on-with-victoriastack/cover.png
---


How many places do you send telemetry to today? If you keep metrics, logs, and traces, the answer is often three, and each one has its own install, ports, and way to get data in. And when something breaks, you have to look in all three to find out why.

On 10 November 2026, the VictoriaMetrics team [introduced VictoriaStack](https://victoriametrics.com/blog/introducing-victoriastack-the-right-database-for-every-signal/). It is three databases, one for each kind of telemetry data: VictoriaMetrics for metrics, VictoriaLogs for logs, and VictoriaTraces for traces. All three sit behind one entry point, and one OpenTelemetry pipeline sends data to all of them.

This post is hands-on. We will:

- start VictoriaStack on a laptop with two commands
- see how one entry point reaches all three databases
- run a first query for metrics, logs, and traces
- stop a service and find the cause with all three
- try the cluster version
- install the stack on Kubernetes with kind and Helm

## What is VictoriaStack?

VictoriaStack is three open-source databases that are documented and deployed together. All three are Apache 2.0 licensed.

| Data | Database | Query language | Default port |
| --- | --- | --- | --- |
| Metrics | VictoriaMetrics | MetricsQL | 8428 |
| Logs | VictoriaLogs | LogsQL | 9428 |
| Traces | VictoriaTraces | LogsQL, Jaeger API, Tempo API (experimental) | 10428 |

Metrics, logs, and traces are often called the three signals. They all arrive as telemetry with a timestamp, so one database for everything sounds simpler. But they behave very differently once you store and query them:

- **Metrics** are small numbers that arrive at a steady pace. The hard part is the number of series, which keeps changing as pods come and go.
- **Logs** are large pieces of text. The hard part is writing them fast and searching for words across weeks of data.
- **Traces** are trees of spans spread over many services. The hard part is the write volume and finding one trace quickly.

So is one database better, or three? There is no answer that fits every team. One database has one real advantage: your engineers learn to run and maintain a single system. Two more are often claimed, but they don't hold up:

- **"All signals in one place is more convenient."** The three signals are used in very different ways, and metrics alone can need more resources than traces. In one database, the load of one signal slows down the others, which is called the noisy neighbor problem. With separate databases, a cardinality explosion in metrics (a sudden jump in the number of series) does not touch your logs.
- **"One database is better for AI."** An AI agent follows instructions at machine speed. It doesn't mind switching between databases or query languages. One database made life easier for human operators, but agents don't need it.

And one database has a real downside: it can never be equally good at three different jobs. VictoriaMetrics, VictoriaLogs, and VictoriaTraces are each built for one signal. VictoriaLogs even began inside the VictoriaMetrics repository. In July 2025, it moved to [a repository of its own](https://github.com/VictoriaMetrics/VictoriaLogs): as the team puts it, logs needed too many changes that did not apply to metrics. You can use a Swiss Army knife as a screwdriver, but a screwdriver is simply better at it.

VictoriaStack keeps the three databases separate, so each one stays good at its job. What it changes is how much there is to learn. The three are built alike: each has the same kind of web interface and the same cluster layout, and logs and traces share one query language, LogsQL. On top of them, the stack adds three things:

1. **One entry point.** [vmauth](https://docs.victoriametrics.com/victoriametrics/vmauth/), a small proxy, sits in front and sends each request to the right database by its path.
2. **One pipeline.** All three databases accept OTLP, the OpenTelemetry protocol. So one OpenTelemetry Collector can send data to all of them.
3. **The same tools to deploy and alert.** One Helm chart installs all of them on Kubernetes, and vmalert, the program that runs alerting rules, works with all of them.

Think of an office building with three departments, one on each floor. You don't want three entrances and three addresses. You want one front desk that sends you to the right floor. vmauth is that front desk, and the path of your request (`/metrics`, `/logs`, or `/traces`) says which floor you want.

![The demo: two demo services send OTLP to an OpenTelemetry Collector. The Collector, Grafana, and both vmalert instances all talk to vmauth on port 8427, which routes /metrics to VictoriaMetrics, /logs to VictoriaLogs, and /traces to VictoriaTraces.](/img/blog/hands-on-with-victoriastack/01-one-entry-point.png)

## Prerequisites

You need:

- git, make, `curl`, and `jq`
- Docker with Compose
- for the Kubernetes part: [kind](https://kind.sigs.k8s.io/), kubectl, and Helm

The commands in this post were run on a MacBook Pro (Apple M1 Max) with Docker Desktop 4.75.0. The VictoriaStack repo was at commit `7e42e81`. Its single-node Compose file uses VictoriaMetrics v1.156.0, VictoriaLogs v1.54.0, and VictoriaTraces v0.13.0.

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

The above commands pull the images and start the stack.

> **Warning:** This Compose setup is a demo for your own machine. It publishes its ports on every network interface, and neither the databases nor the entry point ask for a password. So run it only on a laptop or a test machine that cannot be reached from the internet. This is not the way to run VictoriaStack in production. For that, start with the [deployment](https://docs.victoriametrics.com/victoriastack/deployment/) and [access control](https://docs.victoriametrics.com/victoriastack/access-control/) docs.

Now let's see what is running:

```console
$ docker ps --filter name=deployment --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
NAMES                          IMAGE                                         STATUS
deployment-traffic-1           curlimages/curl:8.12.1                        Up 5 seconds
deployment-shipping-1          ghcr.io/open-telemetry/demo:3.0.0-shipping    Up 5 seconds
deployment-victorialogs-1      victoriametrics/victoria-logs:v1.54.0         Up 7 seconds
deployment-quote-1             ghcr.io/open-telemetry/demo:3.0.0-quote       Up 7 seconds
deployment-flagd-1             ghcr.io/open-feature/flagd:v0.16.0            Up 7 seconds
deployment-victoriatraces-1    victoriametrics/victoria-traces:v0.13.0       Up 7 seconds
deployment-rules-logs-1        victoriametrics/vmalert:v1.156.0              Up 7 seconds
deployment-rules-metrics-1     victoriametrics/vmalert:v1.156.0              Up 7 seconds
deployment-victoriametrics-1   victoriametrics/victoria-metrics:v1.156.0     Up 7 seconds
deployment-vmstack-1           victoriametrics/vmauth:v1.156.0               Up 7 seconds
deployment-grafana-1           grafana/grafana:latest                        Up 7 seconds
deployment-otelcol-1           otel/opentelemetry-collector-contrib:latest   Up 7 seconds
```

There are 12 containers:

- `victoriametrics`, `victorialogs`, and `victoriatraces` are the three databases.
- `vmstack` is vmauth, the entry point on port 8427.
- `rules-metrics` and `rules-logs` are two vmalert instances. The first one runs the alerting rules, and the second one turns logs into metrics.
- `otelcol` is the OpenTelemetry Collector.
- `grafana` is Grafana, with data sources and a dashboard already set up.
- `shipping` and `quote` are two services from the [OpenTelemetry demo](https://github.com/open-telemetry/opentelemetry-demo). `traffic` calls `shipping` every two seconds, and `shipping` asks `quote` for a price. `flagd` serves feature flags to `shipping`.

Wait three or four minutes before the next step, so that there is some data to query.

## Step 2: One entry point for three databases

Everything goes through `http://localhost:8427`, which is vmauth. Its config file says where each request goes. It is short, so let's look at all of it:

```console
$ cat deployment/config/vmauth/single-node.yml
unauthorized_user:
  url_map:
    # VictoriaMetrics access
    - src_paths: ["/metrics/(select|insert)/.*"]
      # VictoriaMetrics single-node doesn't have /insert or /select prefixes,
      # so we need to drop them.
      drop_src_path_prefix_parts: 2
      url_prefix:
        - "http://victoriametrics:8428"

    # VictoriaLogs access
    - src_paths: ["/logs/(select|insert)/.*"]
      drop_src_path_prefix_parts: 1
      url_prefix:
        - "http://victorialogs:9428"

    # VictoriaTraces access
    - src_paths: [ "/traces/(select|insert)/.*" ]
      drop_src_path_prefix_parts: 1
      url_prefix:
        - "http://victoriatraces:10428"
```

There is one rule for each database. A rule matches the start of a request path, such as `/logs/select/` or `/logs/insert/`, and names the database that gets the request. `select` is for reading data, and `insert` is for writing it. Before vmauth passes a request on, `drop_src_path_prefix_parts` removes that many parts from the front of its path. The number is not the same for every database:

- For metrics, it is 2. VictoriaMetrics serves its API from the root, so both `/metrics` and `/select` are removed. A query sent to `/metrics/select/prometheus/api/v1/query` reaches VictoriaMetrics as `/prometheus/api/v1/query`.
- For logs and traces, it is 1. VictoriaLogs and VictoriaTraces have `/select` and `/insert` in their own API paths, so only `/logs` or `/traces` is removed. A query sent to `/logs/select/logsql/query` reaches VictoriaLogs as `/select/logsql/query`.

There are no users or passwords in this file. In a real setup, vmauth is where you add them, and the [access control page](https://docs.victoriametrics.com/victoriastack/access-control/) shows how.

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

Now load them into your shell. Do this again whenever you open a new terminal:

```console
$ source helpers.sh
```

All three helpers use the same host and port. The first part of the path picks the database.

### The web interfaces

Each database also comes with its own web interface, called VMUI. The three interfaces are behind the same entry point:

| Database | Web interface |
| --- | --- |
| VictoriaMetrics | `http://localhost:8427/metrics/select/vmui/` |
| VictoriaLogs | `http://localhost:8427/logs/select/vmui/` |
| VictoriaTraces | `http://localhost:8427/traces/select/vmui/` |

Grafana is at `http://localhost:3000` (log in with `admin` and `admin`), with a data source for each database.

Every query in this post can be typed into these interfaces too. We use `curl` so that you can copy the commands and compare the output, and we open the interfaces in Step 5.

## Step 3: One Collector for all three signals

Now let's see how the data gets in. The demo app sends everything to the OpenTelemetry Collector over OTLP, and the Collector passes it on. Each place it sends data to is called an exporter. Let's see where the exporters point:

```console
$ grep -o '[a-z]*_endpoint: [^ ,]*' deployment/config/otelcollector/config.yml
metrics_endpoint: http://vmstack:8427/metrics/insert/opentelemetry/v1/metrics
logs_endpoint: http://vmstack:8427/logs/insert/opentelemetry/v1/logs
traces_endpoint: http://vmstack:8427/traces/insert/opentelemetry/v1/traces
```

Every endpoint has the same host and port. `vmstack:8427` is vmauth inside the Compose network, and again, the path picks the database.

If you already run a Collector, this is the part you add to your own setup: one exporter for each database.

## Step 4: First queries

### Metrics

MetricsQL is the query language of VictoriaMetrics. It is [backward-compatible with PromQL](https://docs.victoriametrics.com/victoriametrics/metricsql/), the Prometheus query language, so the PromQL queries you already know should work here. It does not work the other way round, as we will see in a moment. Let's ask how many requests per second each route gets:

```console
$ mq 'sum(rate(http.server.request.duration_count[1m])) by (http.route)'
{"metric":{"http.route":"/get-quote"},"value":"0.48328500483285003"}
```

About half a request per second, because `traffic` calls `shipping` every two seconds. The metric name has dots in it because it comes from OpenTelemetry, and VictoriaMetrics keeps such names as they are. Writing them without quotes is something MetricsQL adds. PromQL does not accept it, so this query would fail in Prometheus. There, a name with dots has to be quoted, as in `{__name__="http.server.request.duration_count"}`, which MetricsQL accepts too.

### Logs

LogsQL is the query language of VictoriaLogs. A query starts with a filter, and after each `|` comes a step that reshapes the result. Let's count the log records of the last two minutes by service and message:

```console
$ lq '_time:2m | stats by (service.name, _msg) count() as logs'
{"service.name":"quote","_msg":"Calculated quote","logs":"58"}
{"service.name":"shipping","_msg":"Sending Quote","logs":"58"}
{"service.name":"shipping","_msg":"Requesting quote","logs":"58"}
```

For every request, `shipping` writes "Requesting quote" and "Sending Quote", and `quote` writes "Calculated quote". Remember these three lines. We will come back to them in Step 5.

The demo also turns logs into a metric. One of its vmalert rules counts the log records of each service every minute and saves the result in VictoriaMetrics:

```console
$ mq 'service_name:logs_count:1m'
{"metric":{"__name__":"service_name:logs_count:1m","service.name":"quote","stats_result":"count(*)"},"value":"29"}
{"metric":{"__name__":"service_name:logs_count:1m","service.name":"shipping","stats_result":"count(*)"},"value":"58"}
```

That is 29 records a minute from `quote` and 58 from `shipping`.

### Traces

VictoriaTraces supports the Jaeger API. Jaeger is a well-known open-source tracing tool, so tools like Grafana can read traces from VictoriaTraces. Let's list the services it knows:

```console
$ curl -s $V/traces/select/jaeger/api/services
{"data":["flagd","quote","shipping"],"errors": null,"limit": 0,"offset": 0,"total":3}
```

VictoriaTraces also understands LogsQL. A trace is made of spans (a span is one timed step of a request), and VictoriaTraces stores spans the same way VictoriaLogs stores log records. So we can count the spans by name with the language we just used for logs. The `name:*` filter keeps only the records that have a span name:

```console
$ tq '_time:5m name:* | stats by (name) count() as spans'
{"name":"calculate-quote","spans":"125"}
{"name":"flagSync","spans":"1"}
{"name":"{closure}","spans":"125"}
{"name":"POST /getquote","spans":"125"}
{"name":"POST /get-quote","spans":"125"}
{"name":"POST quote","spans":"125"}
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
{"metric":{"http.response.status_code":"500"},"value":"0.4832527912014664"}
```

The rate of status 200 is zero, and status 500 is at about half a request per second. So every request now fails. The demo comes with alert rules, so let's see what they say:

```console
$ curl -s $V/metrics/select/prometheus/api/v1/alerts | jq -c '.data.alerts[] | {alert: .labels.alertname, state}'
{"alert":"RequestErrorsRatioHigh","state":"pending"}
{"alert":"HighRequestLatency","state":"firing"}
```

`RequestErrorsRatioHigh` is `pending`: its condition is true, but not for long enough yet. The rule needs more than 5% of a service's requests to fail with a 5xx status (500 to 599) for five minutes. After that, the alert is `firing`. (`HighRequestLatency` fires all the time in this demo, so ignore it. More on that at the end.)

### What do the logs say?

The metrics tell us that requests fail. They do not tell us why. The logs are where most of us look next, so let's run the logs query from Step 4 again:

```console
$ lq '_time:2m | stats by (service.name, _msg) count() as logs'
{"service.name":"shipping","_msg":"Requesting quote","logs":"59"}
```

Two of the three lines are gone. `quote` writes nothing at all. `shipping` still writes "Requesting quote" for every request, but it never gets to "Sending Quote". When did `quote` go quiet? Let's ask for its last record:

```console
$ lq 'service.name:=quote | sort by (_time desc) | limit 1 | fields _time, _msg'
{"_time":"2026-11-27T03:37:00.668306Z","_msg":"Calculated quote"}
```

That is the last request before we stopped the container. So the logs tell us when the trouble started and which service went quiet. But there is no error in them. `shipping` logs show nothing about the failure, so we still don't know why its requests fail. To find out, we have to look inside one request, and that is what traces are for.

### What do the traces say?

In OpenTelemetry, a failed span has status code 2, so we filter on that and group the result:

```console
$ tq '_time:5m status_code:2 | stats by (name, status_message) count() as spans'
{"name":"POST quote","status_message":"Connect(Resolver(Custom { kind: Uncategorized, error: \"failed to lookup address information: Name or service not known\" }))","spans":"55"}
{"name":"POST /get-quote","status_message":"Internal Server Error","spans":"55"}
```

There are two kinds of failed spans. `POST /get-quote` is the request that `shipping` received, and it ended with "Internal Server Error". `POST quote` is the call that `shipping` made to `quote`, and its message has the real reason: "failed to lookup address information: Name or service not known". `shipping` cannot find `quote` on the network.

Now let's look at one of these traces in the VictoriaTraces interface:

1. Open `http://localhost:8427/traces/select/vmui/`. The first screen is the Trace Explorer, showing traces from the last five minutes. During the incident, every new row has a red mark and a 2 in the **Errors** column.
2. Click one of these rows. A preview opens on the right.
3. Press **View full trace** in the preview. The trace page opens.
4. On the trace page, click the `POST quote` span. Its fields open on the right.

This is the preview from step 2, with the **View full trace** button:

![The Trace Explorer of VictoriaTraces during the incident. One trace of shipping, POST /get-quote, is selected in the list. A Trace preview panel on the right shows 2 spans, a View full trace button, and two errors: POST quote and POST /get-quote.](/img/blog/hands-on-with-victoriastack/02-trace-preview.png)

And this is the trace page after step 4:

![The trace page of VictoriaTraces with two spans, POST /get-quote and POST quote, both marked as errors. The POST quote span is selected. Its fields show error true, an error.type that starts with Connect(Resolver, server.address quote, and url.full http://quote:8080/getquote.](/img/blog/hands-on-with-victoriastack/03-failing-trace.png)

The trace has two spans, and both are marked as errors. In the fields of `POST quote`, `error` is `true`, `server.address` is `quote`, and `error.type` holds the reason we saw above.

### The alert fires

A few minutes later, the alert is `firing`. In this run, that was a little over six minutes after we stopped `quote`:

```console
$ curl -s $V/metrics/select/prometheus/api/v1/alerts | jq -c '.data.alerts[] | {alert: .labels.alertname, state}'
{"alert":"RequestErrorsRatioHigh","state":"firing"}
{"alert":"HighRequestLatency","state":"firing"}
```

The VictoriaMetrics interface shows the alerts too. Open `http://localhost:8427/metrics/select/vmui/#/rules`, which is the **Alerting** page, and click the `demo-app` group to open it:

![VMUI's Alerting page. The demo-app group is open and has three rules: HighRequestLatency and RequestErrorsRatioHigh are firing, and NoQuotesCalculated is inactive.](/img/blog/hands-on-with-victoriastack/04-alert-firing.png)

So each signal gave us one part of the answer:

- The metrics and the alert said **what** is wrong: every request to `shipping` fails.
- The logs said **when** it started and which service went quiet: `quote` wrote its last record at 03:37:00 UTC.
- The trace said **why**: the call to `quote` fails because the name `quote` cannot be found.

![One outage, three signals. Metrics said what: every request fails with status 500, and the alert fired. Logs said when: the last record of quote is at 03:37:00, then nothing, and no error. A trace said why: the call POST quote fails because the name is not known.](/img/blog/hands-on-with-victoriastack/05-one-outage-three-signals.png)

### The same trace in Grafana

The demo's Grafana has a data source for each database, so the same trace opens there too:

1. Open `http://localhost:3000/explore`, log in with `admin` and `admin`, and click **Skip** when Grafana asks for a new password.
2. Pick **VictoriaTraces Jaeger** in the data source list at the top.
3. The query type is **TraceID** already. Paste a trace ID into the **Trace ID** box and press Shift+Enter. You can copy the ID from the **TraceID** box on the VictoriaTraces trace page.
4. Click the `POST quote` span to open its details.

![Grafana Explore with the VictoriaTraces Jaeger data source and a trace ID. The trace of shipping, POST /get-quote, has status 500 and two spans. The POST quote span is open. Under Span attributes, the Error group shows error.type with the full message.](/img/blog/hands-on-with-victoriastack/06-grafana-span.png)

Under **Span attributes**, the **Error** group shows `error.type` with the full message:

```text
Connect(Resolver(Custom { kind: Uncategorized, error: "failed to lookup address information: Name or service not known" }))
```

Read it from the inside out. A name could not be looked up, so the resolver failed, so the connection failed. `shipping` tried to connect to `quote`, and nothing on the network answers to that name anymore, because we stopped the container.

### Fix it

Start the service again:

```console
$ docker start deployment-quote-1
deployment-quote-1
```

Two minutes later, run the same two queries as before:

```console
$ mq 'sum(rate(http.server.request.duration_count[1m])) by (http.response.status_code)'
{"metric":{"http.response.status_code":"200"},"value":"0.4832527912014664"}
{"metric":{"http.response.status_code":"500"},"value":"0"}

$ lq '_time:2m | stats by (service.name, _msg) count() as logs'
{"service.name":"quote","_msg":"Calculated quote","logs":"59"}
{"service.name":"shipping","_msg":"Sending Quote","logs":"59"}
{"service.name":"shipping","_msg":"Requesting quote","logs":"59"}
```

Compare this with the output during the incident. The two metric lines have swapped their values: status 200 is back at about half a request per second, and status 500 is at zero. In the logs, all three messages are back.

Here is the whole incident as a graph in the VictoriaMetrics interface. This link opens the same query on the **Graph** tab, with the time range set to the last 30 minutes:

```text
http://localhost:8427/metrics/select/vmui/#/?g0.expr=sum%28rate%28http.server.request.duration_count%5B1m%5D%29%29%20by%20%28http.response.status_code%29&g0.range_input=30m&g0.relative_time=last_30_minutes&g0.tab=0
```

You can also do it by hand. Open `http://localhost:8427/metrics/select/vmui/`, paste the query into the **Query** box, and click **Execute**. The time range button is at the top right. If your incident is older than 30 minutes, pick a longer range there.

![A VMUI graph of requests per second by HTTP status code over the last 30 minutes. The red line for status 200 drops from 0.5 to 0 after quote is stopped at 03:37, and a blue line for status 500 appears at 0.5. After quote is started again at 03:43, they switch back.](/img/blog/hands-on-with-victoriastack/07-requests-by-status.png)

The red line is status 200, and the blue line is status 500. When `quote` stops, the red line drops to zero, and the blue line takes its place. When `quote` is back, they switch again.

The alert cleared almost six minutes after we started `quote` again. When you are done, stop the stack and delete its data:

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

So far, each database was one container. This is called the single-node version, and it is the right place to start. When one machine is not enough for your data, each database can also run as a cluster. In the cluster version, the work of one database is split between three kinds of components:

- `insert` receives new data and passes it to the storage nodes
- `storage` keeps the data on disk
- `select` answers queries by reading from the storage nodes

You can run several copies of each one, on different machines.

![Single-node and cluster version side by side. In the single-node version, one victorialogs process does everything. In the cluster version, vmauth sends writes to two vlinsert processes and reads to two vlselect processes, and both talk to two vlstorage processes that keep the data.](/img/blog/hands-on-with-victoriastack/08-cluster-version.png)

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

Two for `insert`, two for `select`, and two for `storage`. VictoriaMetrics and VictoriaTraces get the same six, so there are 18 database containers now, where there were 3 before. With vmauth, the demo app, and the rest, that makes 27:

```console
$ docker ps --filter name=deployment -q | wc -l
      27
```

For the person who queries, nothing changes. vmauth now knows two addresses for every route and spreads the requests between them. After a few minutes, our helpers give the same kind of answers as before:

```console
$ mq 'sum(rate(http.server.request.duration_count[1m])) by (http.route)'
{"metric":{"http.route":"/get-quote"},"value":"0.49992501124831273"}

$ lq '_time:2m | stats by (service.name, _msg) count() as logs'
{"service.name":"quote","_msg":"Calculated quote","logs":"58"}
{"service.name":"shipping","_msg":"Sending Quote","logs":"58"}
{"service.name":"shipping","_msg":"Requesting quote","logs":"58"}

$ curl -s $V/traces/select/jaeger/api/services
{"data":["flagd","quote","shipping"],"errors": null,"limit": 0,"offset": 0,"total":3}
```

The web interfaces are at the same addresses too. Stop it with:

```console
$ make otel-cluster-down
docker compose \
	-f deployment/otel-cluster.yml \
 	-f deployment/otel-demo-mini.yml \
 	down -v
...
 Network deployment_default Removed 
```

## Step 7: Kubernetes with kind and Helm

Compose is fine for learning. Now let's install the same stack on Kubernetes. For a local cluster, we use [kind](https://kind.sigs.k8s.io/), because it runs on Linux, macOS, and Windows. Any other local cluster, such as minikube or k3s, will do as well. (On my own Mac, I usually use [kiac](https://github.com/saiyam1814/kiac), Kubernetes in Apple Containers, which is something I built.)

```console
$ kind create cluster --name victoriastack
Creating cluster "victoriastack" ...
 ✓ Ensuring node image (kindest/node:v1.36.1) 🖼
 ✓ Preparing nodes 📦 
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
Set kubectl context to "kind-victoriastack"
...
```

On Kubernetes, the [VictoriaMetrics operator](https://docs.victoriametrics.com/operator/) runs the databases, and the `victoria-metrics-k8s-stack` Helm chart installs the operator and everything else. By default, the chart installs only the metrics part. Logs, traces, and vmauth are off. So we turn them on in a file called `values.yaml`:

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

# The single entry point, with the same path prefixes as the Compose demo.
vmauth:
  enabled: true
  spec:
    unauthorizedUserAccessSpec:
      url_map:
        # VictoriaMetrics serves its API from the root, so two parts are removed: /metrics and /select (or /insert).
        - src_paths: ["/metrics/(select|insert)/.*"]
          drop_src_path_prefix_parts: 2
          url_prefix: ["http://vmsingle-stack:8428"]
        # VictoriaLogs and VictoriaTraces have /select and /insert in their own paths, so only one part is removed.
        - src_paths: ["/logs/(select|insert)/.*"]
          drop_src_path_prefix_parts: 1
          url_prefix: ["http://vlsingle-stack:9428"]
        - src_paths: ["/traces/(select|insert)/.*"]
          drop_src_path_prefix_parts: 1
          url_prefix: ["http://vtsingle-stack:10428"]

# Grafana needs this plugin to get a VictoriaLogs data source.
grafana:
  plugins:
    - victoriametrics-logs-datasource
```

The `url_map` gives vmauth the same three path prefixes as in the Compose demo, and the same rule as in Step 2: two parts are removed for metrics, and one for logs and traces. Like the demo, it has no users or passwords, so keep it on a local cluster. Now add the chart repository, update helm's list of charts, and install the chart:

```console
$ helm repo add vm https://victoriametrics.github.io/helm-charts/
"vm" has been added to your repositories

$ helm repo update
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "vm" chart repository
Update Complete. ⎈Happy Helming!⎈

$ helm install stack vm/victoria-metrics-k8s-stack --version 0.98.1 --namespace monitoring --create-namespace -f values.yaml
NAME: stack
LAST DEPLOYED: Fri Nov 27 09:25:07 2026
NAMESPACE: monitoring
STATUS: deployed
REVISION: 1
DESCRIPTION: Install complete
NOTES:
```

In this run, the pods were running after about two and a half minutes:

```console
$ kubectl get pods -n monitoring
NAME                                               READY   STATUS      RESTARTS   AGE
stack-grafana-694b965995-zhcht                     3/3     Running     0          2m36s
stack-kube-state-metrics-f8df5896c-pj8g2           1/1     Running     0          2m36s
stack-prometheus-node-exporter-j4v46               1/1     Running     0          2m36s
stack-sync-job-ntgvv                               0/1     Completed   0          2m36s
stack-victoria-metrics-operator-566fd744c4-bxtln   1/1     Running     0          2m36s
vlagent-stack-m6pmp                                1/1     Running     0          113s
vlsingle-stack-79b6bb6f44-86nfc                    1/1     Running     0          108s
vmagent-stack-9cb5cd47f-dck9k                      2/2     Running     0          112s
vmalert-stack-7d65c4966-gz8j2                      2/2     Running     0          113s
vmalertmanager-stack-0                             2/2     Running     0          113s
vmauth-stack-559ffb4649-j7vhf                      2/2     Running     0          113s
vmauth-stack-internal-5476f786f9-7t2wk             2/2     Running     0          113s
vmsingle-stack-746794f864-2wnst                    1/1     Running     0          113s
vtsingle-stack-65b657f49f-mh9ct                    1/1     Running     0          113s
```

The three databases are `vmsingle`, `vlsingle`, and `vtsingle`, and `vmauth-stack` is our entry point. `vmauth-stack-internal` is a second vmauth that the chart adds for vmalert. Now let's look at the Service for vmauth:

```console
$ kubectl get svc -n monitoring vmauth-stack
NAME           TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
vmauth-stack   ClusterIP   10.96.38.111   <none>        8427/TCP   113s
```

It is a ClusterIP Service, so only pods inside the cluster can reach it. To reach it from your machine, forward port 8427 in a second terminal and leave it running. The Compose demo must be stopped by now, because it uses the same port:

```console
$ kubectl port-forward -n monitoring svc/vmauth-stack 8427:8427
Forwarding from 127.0.0.1:8427 -> 8427
Forwarding from [::1]:8427 -> 8427
```

The entry point is at `http://localhost:8427` again, the same address as with Compose. So our helpers work without any change. Load them if you are in a new terminal:

```console
$ source helpers.sh
```

There is no demo app in this cluster, but there is data already there. vmagent collects the metrics of the cluster, and vlagent collects the logs of every pod:

```console
$ mq 'count(kube_pod_info) by (namespace)'
{"metric":{"namespace":"kube-system"},"value":"8"}
{"metric":{"namespace":"local-path-storage"},"value":"1"}
{"metric":{"namespace":"monitoring"},"value":"14"}

$ lq '_time:5m | stats by (kubernetes.pod_namespace) count() as logs'
{"kubernetes.pod_namespace":"monitoring","logs":"3111"}
{"kubernetes.pod_namespace":"kube-system","logs":"881"}
{"kubernetes.pod_namespace":"local-path-storage","logs":"28"}
```

For traces, we need something that sends spans. Let's send 20 test traces with `telemetrygen`, a test tool from the OpenTelemetry project:

```console
$ kubectl run telemetrygen -n monitoring --rm -i --restart=Never --image=ghcr.io/open-telemetry/opentelemetry-collector-contrib/telemetrygen:v0.165.0 -- traces --otlp-http --otlp-insecure --otlp-endpoint vmauth-stack:8427 --otlp-http-url-path /traces/insert/opentelemetry/v1/traces --service hello-from-kind --traces 20
...
2026-11-27T04:00:07.663Z	INFO	traces/worker.go:180	traces generated	{"worker": 0, "traces": 20}
2026-11-27T04:00:07.663Z	INFO	traces/traces.go:75	stop the batch span processor
2026-11-27T04:00:07.664Z	INFO	traces/traces.go:65	stopping the exporter
pod "telemetrygen" deleted from monitoring namespace

$ curl -s $V/traces/select/jaeger/api/services
{"data":["hello-from-kind"],"errors": null,"limit": 0,"offset": 0,"total":1}
```

VictoriaTraces shows new spans after about 30 seconds (more on that at the end). So wait a little, and then count the spans:

```console
$ tq '_time:5m name:* | stats by (name) count() as spans'
{"name":"okey-dokey-0","spans":"20"}
{"name":"lets-go","spans":"20"}
```

All three signals answer on Kubernetes, through the same three paths as with Compose. The three web interfaces from Step 2 are at the same addresses too. When you are done, stop the port-forward with Ctrl+C and delete the cluster:

```console
$ kind delete cluster --name victoriastack
Deleting cluster "victoriastack" ...
Deleted nodes: ["victoriastack-control-plane"]
```

## A few things to know

Here are four things we noticed during the runs. Knowing them can save you a few minutes.

- **`HighRequestLatency` fires on a healthy system.** Its threshold is 1 ms, which any traffic crosses. Ignore it here, and don't copy it as it is.
- **Grafana can be slow on a fresh start.** It downloads a plugin of about 79 MB before it opens port 3000, so the time depends on your connection. In one of the runs, it took two and a half minutes. If the download fails, the Grafana container exits. Look at `docker logs deployment-grafana-1`, and run `make otel-single-up` again.
- **The newest 30 seconds are left out of query results.** Most query APIs of VictoriaTraces [leave them out](https://docs.victoriametrics.com/victoriatraces/querying/#search-latency) by default, so that a trace is complete before you see it. VictoriaMetrics has the same 30-second default for metrics. That is why we waited before counting the test spans.
- **The `shippingSlowdown` feature flag does nothing.** The demo defines this flag, but the `shipping` service in this image does not read it. That is why we stopped a container to create our incident.

## Wrapping up

We started VictoriaStack with two commands, queried metrics, logs, and traces through one port, and then stopped a service and found the cause using all three signals. We also ran the same stack as a cluster and on Kubernetes with kind.

Overall, VictoriaStack is a simple way to run metrics, logs, and traces together, and what I like the most is that nothing is hidden. It is three databases and a proxy, and you can read the config files that connect them in a few minutes. My favorite part is the single entry point with `/metrics`, `/logs`, and `/traces`. VictoriaTraces has not reached version 1.0 yet, but the VictoriaMetrics team considers it production ready: their docs call each of the three databases [battle-tested in production](https://docs.victoriametrics.com/victoriastack/#why-victoriastack). For a single view across all three signals, you need Grafana or Perses for now.

Give it a try on your laptop and let me know how you find it.

## Credits and links

- Thanks to the VictoriaMetrics team for building the stack, the demo, and the docs, and to the OpenTelemetry demo and flagd maintainers for the demo services.
- Announcement: [Introducing VictoriaStack: The Right Database for Every Signal](https://victoriametrics.com/blog/introducing-victoriastack-the-right-database-for-every-signal/)
- Docs: [VictoriaStack](https://docs.victoriametrics.com/victoriastack/), [quick start](https://docs.victoriametrics.com/victoriastack/quick-start/), [deployment](https://docs.victoriametrics.com/victoriastack/deployment/), [querying](https://docs.victoriametrics.com/victoriastack/querying/), [UI integrations](https://docs.victoriametrics.com/victoriastack/ui/), [alerting](https://docs.victoriametrics.com/victoriastack/alerting/)
- Repo with the Compose files: [github.com/VictoriaMetrics/VictoriaStack](https://github.com/VictoriaMetrics/VictoriaStack)
- Helm chart: [victoria-metrics-k8s-stack](https://docs.victoriametrics.com/helm/victoria-metrics-k8s-stack/), and the [operator](https://docs.victoriametrics.com/operator/)
- Query languages: [MetricsQL](https://docs.victoriametrics.com/victoriametrics/metricsql/) and [LogsQL](https://docs.victoriametrics.com/victorialogs/logsql/)
- The demo services: [OpenTelemetry demo](https://github.com/open-telemetry/opentelemetry-demo) and [flagd](https://flagd.dev/)
