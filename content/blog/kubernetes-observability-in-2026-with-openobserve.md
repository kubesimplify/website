---
title: "Kubernetes observability in 2026, with OpenObserve 1.0 as the backend"
seoTitle: "Kubernetes observability in 2026 with OpenObserve 1.0"
seoDescription: "Why the backend is where Kubernetes observability cost lives, what an object-storage and columnar-file backend does differently, and a hands-on run of OpenObserve 1.0 on a kiac cluster."
datePublished: 2026-09-03T00:00:00.000Z
slug: kubernetes-observability-in-2026-with-openobserve
author: saiyam-pathak
tags: ["kubernetes", "observability", "opentelemetry", "openobserve"]
cover: /img/blog/kubernetes-observability-in-2026-with-openobserve/cover.png
draft: false
---

**TL;DR:** Collecting telemetry from Kubernetes is solved. Paying to store and search it is not. This post is about why the backend is where the cost lives, what a backend built on object storage and columnar files does differently, and what that looks like when you run OpenObserve 1.0 on a real cluster. I ran it on a three node kiac cluster on my Mac, read the parts of the source that matter, and hit one real bug on the way.

Every Kubernetes cluster you run is quietly producing four kinds of evidence about itself: container logs on every node, metrics from the kubelet and kube-state-metrics, traces if your apps are instrumented, and Kubernetes events, which most clusters throw away after an hour. When a pod restarts at 3 am, the question is never "do we have the data". The question is "where did it go, and can I afford to keep it there".

That second question is the whole post. Let's look at the problem, what people run today, one backend built differently, and then run it. Where a number comes from the vendor, I say so.

## The problem: the backend is where the money goes

![What a Kubernetes cluster emits, and where it goes](/img/blog/kubernetes-observability-in-2026-with-openobserve/01-k8s-signals-two-paths.png)

The collection side is done. In 2026 you run the OpenTelemetry Collector as a DaemonSet on every node, it reads container stdout, scrapes the kubelet, watches the API server for events and receives OTLP from your apps. The Grafana Labs Observability Survey 2026 (1,363 respondents) shows how settled that is, and where the pain moved:

| What the survey found | Share |
|---|---|
| Use OpenTelemetry for metrics / traces / logs | 57% / 50% / 48% |
| Name complexity and overhead as the biggest observability concern | 38% |
| Name cost as a primary concern | 31% |
| Say cost is a priority when picking new tools | 65% |

So why is the backend the expensive part? Because of how the two classic designs store data.

![Where the money goes: index-heavy vs columnar on object storage](/img/blog/kubernetes-observability-in-2026-with-openobserve/02-index-heavy-vs-columnar.png)

**Index-heavy stores** like Elasticsearch build an inverted index over every field at ingest and keep hot data on replicated SSD. You pay three times: CPU to build the index, disk for index plus data plus replicas, and RAM to keep the index hot. Every new high-cardinality field makes it worse.

**Label-based stores** like Loki went the other way. They index a handful of labels and scan the rest. That is cheap until you need to query by something with many values. A pod name, a request id, a trace id: the moment you want those as query dimensions you are told to keep cardinality down, and the thing you most want to search by becomes the thing you cannot index.

**SaaS per-GB pricing** adds a third pressure. Every debug log line is a line item, so teams sample and drop, which defeats the point of collecting. And the data is getting wider: LLM traces carry tokens, prompts and cost, GPU nodes emit per-process metrics, agents make dozens of model calls per user action.

## The landscape: what we run today, and what we should ask for

The default backend most of us know is the LGTM stack: Loki, Prometheus or Mimir, Tempo, Grafana. It works, and it is what I learned on. It is also four systems with four data models and four retention configurations, and correlation mostly happens by copying a trace id from one screen into another. Elastic gives you full-text search on every field and the hardware bill that comes with it. Datadog gives you everything and charges per host, per custom metric and per indexed log. The same survey found respondents naming 101 different observability technologies in current use.

The data warehousing world solved a similar problem a few years ago. Think of your phone: you do not keep every photo you ever took on the fast internal storage, you keep them in cheap cloud storage and pull down the ones you need. Object storage is cheap and built for eleven nines of durability, columnar file formats compress extremely well, and modern query engines scan them fast. Iceberg, DuckDB and the cloud warehouses are all built on this. An observability backend built the same way shrinks the expensive tier to only what you search, and puts everything else in a bucket.

That gives us a bar to hold any backend to:

![The bar: eight things a Kubernetes observability backend should do](/img/blog/kubernetes-observability-in-2026-with-openobserve/03-eight-point-bar.png)

1. OpenTelemetry-native ingest, plus compatibility endpoints so existing agents keep working.
2. One process on a laptop, roles on a cluster, same binary.
3. Object storage as the durable tier, in an open file format, so the data outlives the tool.
4. High cardinality as a feature: index where you search, columnar scan everywhere else.
5. SQL for logs and traces, PromQL for metrics.
6. Correlation built in: trace to logs in one click, alerts that understand SLOs.
7. AI-ready both ways: understands LLM traces, exposes itself to agents over MCP.
8. A clear open-source core.

## The solution: how OpenObserve is built

OpenObserve is a single Rust binary, licensed AGPL-3.0. It ingests logs, metrics, traces, RUM and LLM traces over OTLP (and Elasticsearch bulk, Loki push, Prometheus remote write, Splunk HEC), stores everything as Parquet or Vortex files in S3, GCS, Azure Blob, MinIO or a local disk, indexes only the fields you search, and answers SQL and PromQL through Apache DataFusion. Its 1.0 release candidate landed on 28 August 2026. The README claims a 2 PB per day deployment and "140x lower storage cost than Elasticsearch". Both are vendor claims, so let's look at what is underneath.

### A log line goes in

![Write path](/img/blog/kubernetes-observability-in-2026-with-openobserve/write-path.gif)

A batch lands over HTTP, its JSON is flattened (`kubernetes.labels.app` becomes `kubernetes_labels_app`, which is why every screenshot has those long field names) and its schema is checked against the stream. It is appended to a write-ahead log and an in-memory Arrow table at the same time. Every 2 seconds the frozen tables become Parquet, the upload job merges them into one file per stream and hour, writes it to the bucket under `files/{org}/{type}/{stream}/YYYY/MM/DD/HH/`, builds a full-text index for that file as a `.ttv` object, and only then records the file in the `file_list` catalog. If the catalog database is unreachable, nothing is uploaded. There are never orphan objects in the bucket, and I like that a lot.

Two things you should know: the WAL is flushed but not fsynced per batch by default (`ZO_WAL_FSYNC_DISABLED=true`), a fair trade for a system whose durable tier is the bucket, and the defaults in the code differ from the docs in several places (the WAL rotates at 512 MB, the docs say 64). Trust the binary you run.

### The index is a file next to the data

![Anatomy of a .ttv index file](/img/blog/kubernetes-observability-in-2026-with-openobserve/06-ttv-anatomy.png)

The `.ttv` next to each data file is an Apache Iceberg Puffin container wrapping a single tantivy segment. All configured full-text fields (`message`, `body`, `log` and friends) are concatenated into one indexed column, fields like `trace_id` are stored for exact match, and `_timestamp` is a fast field. Because there is exactly one segment per data file, a document id in the index equals a row number in the data file. That one fact is what makes the query side cheap, as we will see next.

### A query comes out

![How a query finds your rows](/img/blog/kubernetes-observability-in-2026-with-openobserve/query-funnel.gif)

A query asks the catalog for the files that overlap the time range, splits them across queriers, and then throws away as much as it can before reading anything: files that fail the partition keys, files the bloom filters rule out, and then, using the index, everything but the matching rows. The matched row ids become a row bitmap, and the bitmap becomes a Parquet or Vortex access plan that DataFusion reads. Counts, histograms and top-N over indexed fields never open a data file at all. A background compactor merges each finished hour's small files into files of up to 2 GB and rebuilds the index, and a result cache serves repeated dashboard queries.

### What 1.0 adds

**Vortex as a file format.** `ZO_FILE_FORMAT=parquet,logs=vortex` writes logs as Vortex, a columnar format from SpiralDB that is now a Linux Foundation project, built for random access, which is exactly the shape of a "show me these 100 log lines" query. OpenObserve's own August 2026 comparison, one billion log records with everything but the format identical, vendor-run but public:

| Workload | Parquet | Vortex |
|---|---|---|
| Row fetch with LIMIT 100 (8 queries) | 1,114 ms | 436 ms |
| Indexed counts (8 queries) | 215 ms | 232 ms |
| Storage for 1 billion rows | 673.5 GB | 710.7 GB |

Faster on the query that hurts, a tie on counts, about 5 percent more disk. It has been open source since July 2026 and is pinned to a git revision, so I would call it new and promising, and not the default for a reason.

**An MCP server that does not flood the context window.** The tool catalog is generated from the OpenAPI spec, around 209 tools, but `tools/list` returns only seven: a `tool_search` over the descriptions, a `tools_call` that returns summarised responses, and five pinned tools. Authentication is your own token, so the model inherits your permissions and nothing more. This is my favourite part of the release.

**SLOs with burn-rate alerts**, a **time index for traces** so a bare trace id no longer scans everything, and **LLM traces from six SDK conventions** priced at ingest. All open source. SSO and RBAC, incidents, anomaly detection, the AI assistant and the service graph UI are enterprise.

![Open source vs enterprise in 1.0](/img/blog/kubernetes-observability-in-2026-with-openobserve/08-oss-vs-enterprise.png)

## The demo: a whole cluster into one binary

Let's run it. I used kiac (Kubernetes in Apple Containers), where every node is its own lightweight VM on macOS. It works the same on kind or k3d. Everything the demo uses is in one repo:

```bash
git clone https://github.com/saiyam1814/openobserve-k8s-demo
cd openobserve-k8s-demo
```

### 1. Cluster and OpenObserve

```bash
kiac create cluster --name o2 --workers 2 --memory 4G --cp-memory 4G
helm repo add openobserve https://charts.openobserve.ai
helm upgrade -i o2 openobserve/openobserve-standalone -n openobserve --create-namespace \
  -f manifests/o2-values.yaml
kubectl -n openobserve get pods,svc
```

```text
NAME                              READY   STATUS    RESTARTS   AGE
pod/o2-openobserve-standalone-0   1/1     Running   0          58s

NAME                                TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)
service/o2-openobserve-standalone   LoadBalancer   10.100.30.54   192.168.64.10   5080:30148/TCP,5081:32552/TCP
```

The values file pins the 1.0.0-rc1 image, asks for a LoadBalancer Service, and sets three things worth knowing:

```yaml
config:
  ZO_FILE_FORMAT: "parquet,logs=vortex"        # the 1.0 feature under test
  ZO_MAX_FILE_RETENTION_TIME: "60"             # demo pacing: rotate every 60s instead of 600s
  ZO_COMPACT_DELETE_FILES_DELAY_MINUTES: "10"  # demo pacing: drop compacted-away files after 10 min
```

That EXTERNAL-IP and the chart's default root user are all the later steps need, so let's put them in two variables. Change the password the moment this is more than a demo.

```bash
export O2=http://192.168.64.10:5080          # your LoadBalancer IP will differ
export AUTH='root@example.com:Complexpass#123'
```

Log in at `$O2` with that user. The home page is empty. Let's fix that.

### 2. Collect everything the cluster emits

The official collector chart installs an OpenTelemetry Collector agent as a DaemonSet and a gateway, both managed by the OpenTelemetry Operator, so cert-manager and the operator go first:

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.19.1/cert-manager.yaml
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
helm upgrade -i o2c openobserve/openobserve-collector -n openobserve-collector --create-namespace \
  -f manifests/collector-values.yaml

curl -s -u $AUTH "$O2/api/default/streams?type=logs"    | jq -r '.list[].name'
curl -s -u $AUTH "$O2/api/default/streams?type=metrics" | jq '.list | length'
```

```text
default
k8s_events
450
```

Container logs, Kubernetes events and 450 metric streams within a minute, from the kubelet, cAdvisor, kube-state-metrics and the API server. An hour later the streams page summed up the storage story:

![Streams page: 470 streams, 1.51 GB ingested, 102.56 MB compressed](/img/blog/kubernetes-observability-in-2026-with-openobserve/12-streams-compression.jpg)

| | |
|---|---|
| Ingested | 1.51 GB |
| Compressed on disk | 102.56 MB (15.1x) |
| Index | 43.41 MB |
| Container logs alone | 267.62 MB in, 11.55 MB out (23.2x) |
| OpenObserve pod, all roles | 43m CPU, 597Mi memory (`kubectl top pod`) |

### 3. An application with traces and logs

Cluster telemetry is half the picture. The other half is your own app, so I wrote a small stand-in: `checkout`, a Go HTTP service that takes an order, reserves inventory, charges a card and fails a configurable share of payments. It is under 200 lines in `app/`, instrumented with the standard OpenTelemetry Go SDK with nothing vendor-specific in the code, and it logs JSON to stdout with the trace id on every line. A load generator sends five checkouts a second.

```bash
container build -t docker.io/library/checkout:demo app     # docker build works too
kiac load image docker.io/library/checkout:demo --name o2       # kind load docker-image on kind
kubectl apply -f manifests/10-shop.yaml
kubectl -n shop logs deploy/checkout --tail=1
```

```text
{"time":"2026-09-02T11:42:23.49Z","level":"INFO","msg":"checkout complete","service":"checkout",
 "order_id":"ord-078698","amount":33.99,"trace_id":"e90e1fcfd449474f10f289a7a6343bad","span_id":"6e4934a37904c62f"}
```

In the UI, traces arrived immediately, three spans per request. From a trace, "View Logs" opens the logs page filtered on that trace id, and the three log lines of that request are right there, including the failed payment.

![A checkout trace: three spans, two errors](/img/blog/kubernetes-observability-in-2026-with-openobserve/05-trace-detail-3-spans.jpg)

![Trace to logs: the three log lines of one failed checkout](/img/blog/kubernetes-observability-in-2026-with-openobserve/06-trace-to-logs.jpg)

### 4. Parse the log body at ingest

That link needs `trace_id` to be a column, and the collector delivers each log line as one `body` string. Rather than reconfigure the collector, a realtime pipeline parses it at ingest: source stream `default`, a VRL function, destination stream `default`. Both objects are JSON files you POST:

```bash
curl -s -u $AUTH -H 'Content-Type: application/json' -X POST "$O2/api/default/functions" \
  -d @manifests/function-parse-checkout-json.json
curl -s -u $AUTH -H 'Content-Type: application/json' -X POST "$O2/api/default/pipelines" \
  -d @manifests/pipeline-parse-shop-logs.json
```

```text
{"code":200,"message":"Function saved successfully"}
{"code":200,"message":"Pipeline created successfully","id":"7500791427660513280","name":"parse-shop-logs"}
```

The function is the interesting part:

```text
if .k8s_namespace_name == "shop" && exists(.body) {
  parsed, err = parse_json(string!(.body))
  if err == null && is_object(parsed) {
    .level = downcase(string!(parsed.level))
    .msg = parsed.msg
    .trace_id = parsed.trace_id
  }
}
.
```

A minute later the new fields are columns, and a search over the API shows the join key sitting right there:

```bash
curl -s -u $AUTH -H 'Content-Type: application/json' "$O2/api/default/_search?type=logs" -d '{"query":{
  "sql":"SELECT level, msg, order_id, trace_id FROM \"default\" WHERE k8s_namespace_name='"'"'shop'"'"' AND level='"'"'error'"'"' ORDER BY _timestamp DESC",
  "start_time":'$(( $(date +%s) - 600 ))000000',"end_time":'$(date +%s)000000',"size":2}}' | jq -c '.hits[] | del(._timestamp)'
```

```text
{"level":"error","msg":"payment failed","order_id":"ord-648398","trace_id":"e826c2d59bc16d05923d1d654bafcd4c"}
{"level":"error","msg":"payment failed","order_id":"ord-311027","trace_id":"512dea2672432a9e4b827d48af5e1e1b"}
```

In the UI the same fields show up as facets on the left, which is what turns "grep the shop namespace" into clicking `k8s_namespace_name`, then `level`. This is 2.2K error rows out of 184K in 116 ms:

![Logs page: shop namespace errors with the k8s field facets](/img/blog/kubernetes-observability-in-2026-with-openobserve/02-logs-shop-errors.jpg)

And the jump works in both directions. Expand any of those rows and the trace id is a field with a "View Trace" button next to it:

![An expanded log row after the pipeline: level, msg, order_id and trace_id as fields, with View Trace](/img/blog/kubernetes-observability-in-2026-with-openobserve/03-log-row-trace-id.jpg)

### 5. Look at the files

Now for my favourite part: the write path from the solution section, in a real data directory. The image has no shell, so an ephemeral debug container that shares the process namespace gets you the filesystem through `/proc/1/root`:

```bash
kubectl -n openobserve debug o2-openobserve-standalone-0 --image=busybox:1.36 \
  --target=openobserve-standalone --container=toolbox --profile=general -- sleep 86400
kubectl -n openobserve exec o2-openobserve-standalone-0 -c toolbox -- sh -c \
  'cd /proc/1/root/data/stream && find files/default -type f | sed "s/.*\.//" | sort | uniq -c'
```

```text
   3989 parquet     <- metrics
   3674 ttv         <- one index per data file
     19 vortex      <- logs, in Vortex, written by the ingester
```

These are binary columnar files, so `cat` shows nothing useful. What identifies them is the first four bytes. Copy one file of each type out of the pod (the loop picks whatever file `find` sees first, so your names will differ) and look at those bytes:

```bash
for ext in parquet ttv vortex; do
  F=$(kubectl -n openobserve exec o2-openobserve-standalone-0 -c toolbox -- sh -c \
    "cd /proc/1/root/data/stream && find files/default -name '*.$ext' 2>/dev/null | head -1")
  kubectl -n openobserve exec o2-openobserve-standalone-0 -c toolbox -- cat "/proc/1/root/data/stream/$F" > sample.$ext
done
for f in sample.parquet sample.ttv sample.vortex; do printf '%-16s ' "$f"; head -c 4 "$f" | xxd | cut -c10-; done
```

```text
sample.parquet    5041 5231   PAR1
sample.ttv        5046 4131   PFA1
sample.vortex     5654 5846   VTXF
```

Parquet, a Puffin index container, Vortex. To look inside an index, OpenObserve ships `ttv-inspect`. The image has no shell, so it runs as a Job on the same volume (`manifests/20-ttv-inspect-job.yaml`). The Job needs two things filled in: the node that holds the volume, because a local-path volume only exists on one node, and the index file to read. Both come from `kubectl`:

```bash
NODE=$(kubectl -n openobserve get pod o2-openobserve-standalone-0 -o jsonpath='{.spec.nodeName}')
TTV=$(kubectl -n openobserve exec o2-openobserve-standalone-0 -c toolbox -- sh -c \
  "cd /proc/1/root/data/stream && find files/default/index/default_logs -name '*.ttv' 2>/dev/null | head -1")
kubectl -n openobserve delete job ttv-inspect --ignore-not-found   # a Job's template is immutable, so re-runs need this
sed -e "s#NODE_NAME#$NODE#" -e "s#TTV_PATH#/data/stream/$TTV#" manifests/20-ttv-inspect-job.yaml | kubectl apply -f -
kubectl -n openobserve wait --for=condition=complete job/ttv-inspect --timeout=180s
kubectl -n openobserve logs job/ttv-inspect
```

```text
blob_count        : 6
  row_group_size  : 131072
  segments          : 1
  total_docs        : 248318 (deleted: 0)
    _all                         text     [indexed, tokenizer=o2]
    service_name                 text     [indexed,fast, tokenizer=raw]
    trace_id                     text     [indexed,fast, tokenizer=raw]
    _timestamp                   i64      [fast]
```

One segment, 248,318 documents, which is exactly the row count DuckDB reports for the Vortex file of the same hour below, and the fields `_all`, `service_name` and `trace_id`. Then the test that matters for bar item 3: can another tool read these files? OpenObserve does not ship or use DuckDB. I picked it because it is a single binary that reads Parquet natively and has a Vortex extension.

```bash
brew install duckdb
duckdb -c "INSTALL vortex; LOAD vortex;
  SELECT k8s_namespace_name AS namespace, count(*) AS rows FROM read_vortex('sample.vortex')
  GROUP BY 1 ORDER BY rows DESC LIMIT 5;"
```

| namespace | rows |
|---|---:|
| openobserve | 178847 |
| shop | 61987 |
| kube-system | 6431 |
| NULL | 781 |
| cert-manager | 187 |

That is one hour of container logs for the whole cluster, 248,318 rows, read straight out of the file OpenObserve wrote. Your counts will differ, the point is that the query works at all. If the tool disappeared tomorrow, your data would still be in a bucket, in a format other tools can read.

### 6. Ask it questions over MCP

The MCP endpoint speaks streamable HTTP, so a curl loop is a client. `mcp.sh` in the repo wraps one JSON-RPC call and reads `O2` and `AUTH`:

```bash
./mcp.sh tools/list | jq -r '.result.tools[].name'
./mcp.sh tools/call '{"name":"tool_search","arguments":{"query":"list traces with errors","limit":1}}' \
  | jq -r '.result.content[0].text | fromjson | .tools[0].name'
./mcp.sh tools/call '{"name":"tools_call","arguments":{"tool":"SearchSQL","detail":"summary","args":{"org_id":"default","type":"traces",
  "request_body":{"query":{"sql":"SELECT service_name, operation_name, count(*) AS errors FROM \"default\" WHERE span_status='"'"'ERROR'"'"' GROUP BY service_name, operation_name","start_time":'$(( $(date +%s) - 3600 ))000000',"end_time":'$(date +%s)000000',"size":10}}}}}' \
  | jq -c '.result.structuredContent.hits'
```

```text
tool_search
tools_call
GetLatestTraces
PrometheusRangeQuery
SearchSQL
StreamList
StreamSchema

GetLatestTraces

[{"service_name":"checkout","operation_name":"POST /checkout","errors":26},{"service_name":"checkout","operation_name":"payment.charge","errors":26}]
```

Seven tools, not two hundred, a search that finds the right one by intent, and a summarised answer. To wire this into Claude Code, Cursor or VS Code, the setup page under IAM writes the exact `claude mcp add` command for you, and nudges you toward a read-only credential, which is good advice:

![MCP Server setup page with the claude mcp add command](/img/blog/kubernetes-observability-in-2026-with-openobserve/11-mcp-setup-page.jpg)

### 7. Break an SLO

Define an SLO on the checkout traces (a good event is a `POST /checkout` span that did not end in `ERROR`, target 99 percent over 7 days), a webhook echo server to receive alerts, a burn-rate alert on the SLO, and then push the failure rate to 60 percent:

```bash
kubectl apply -f manifests/30-alert-sink.yaml
curl -s -u $AUTH -H 'Content-Type: application/json' -X POST "$O2/api/default/slos" \
  -d @manifests/slo-checkout-availability.json
# template, destination and alert are the three objects in manifests/alert-burn-rate.json (README step 7 has the three POSTs)
kubectl -n shop exec deploy/loadgen -- curl -s "http://checkout.shop.svc/chaos?rate=60"
```

```text
{"code":200,"message":"SLO saved","id":"7500794280517042176","name":"checkout-availability"}
{"fail_rate_percent":60}
```

One catch you will hit: the echo server has a private cluster IP and OpenObserve blocks those as webhook destinations (SSRF protection), so the values file sets `ZO_SKIP_SSRF_CHECKS=true`. Fine for a demo, wrong for anything internet-facing. Within a minute the SLO page showed 97.907 percent against 99 and "Budget blown":

![SLO page: checkout-availability, budget blown](/img/blog/kubernetes-observability-in-2026-with-openobserve/09-slo-budget-blown.jpg)

The burn-rate alert stayed quiet, and its evaluations were logged as "frozen (unobserved)". That freeze is deliberate: an SLO alert never resolves while its windows are unmeasured. But the measurements were being written, and the status row the alert reads never moved. Debug logging gave the reason in one line:

```bash
kubectl -n openobserve logs o2-openobserve-standalone-0 | grep "\[slo\] pass failed"
```

```text
ERROR [slo] pass failed for 7500794280517042176 org=default: DbError# SeaORMError# Execution Error:
  error returned from database: (code: 8) attempt to write a readonly database
```

The SLO pass opens the read-only database client and then writes through it. On PostgreSQL that is a normal connection, so cluster deployments are fine. On SQLite, which every single-node install uses, the write fails, so SLO alerts stay frozen in local mode on this release candidate. A one-line fix, filed with the reproduction. Plain alerts are unaffected. A scheduled alert on the same failed spans (`manifests/alert-error-spans.json`) fired within a minute:

```bash
kubectl -n shop logs deploy/alert-sink | jq -R -c 'fromjson? | select(.path=="/alerts") | .body | fromjson'
```

```text
{"alert":"checkout-error-spans","stream":"traces/default","org":"default","type":"scheduled","level":"critical","fired_at":"2026-09-02T06:34:44","url":"/web/short/f0a29971a7f5701d?org_identifier=default"}
```

The alerts page tells the same story in one row each: the SLO-backed alert with no outcome yet, the scheduled one showing its last result.

![Alerts list: the frozen burn-rate alert and the scheduled alert that fired](/img/blog/kubernetes-observability-in-2026-with-openobserve/08-alerts-list.jpg)

Heal the app with `chaos?rate=2` when you are done.

### 8. Watch compaction and a restart

Hour 05 UTC closed at 06:00. With the 60 second rotation window, the compactor claimed it at 06:03:

```bash
kubectl -n openobserve logs o2-openobserve-standalone-0 | grep -E "COMPACTOR.*logs/default|BLOOM_BUILD.*default_logs" | head -3
```

```text
[COMPACTOR:WORKER:0:1] merge small file: files/default/logs/default/2026/09/02/05/75007873864486092802b3a.vortex
[COMPACTOR:WORKER:0:2] merge small file: files/default/logs/default/2026/09/02/05/75007878844928491532777.vortex
[BLOOM_BUILD] files/default/bloom/default_logs/2026/09/02/05/1788328991812000.bf: wrote chunk 1/1
```

Twenty small Vortex files became one 5.9 MB file with a fresh index and a bloom sidecar, and the originals were gone once the deletion delay passed. A Helm upgrade mid-flight restarted the pod, and the startup log walked through the WAL replay from the solution section:

```text
INFO ingester::wal: Scanning lock files from "./data/wal/logs"
INFO ingester::wal: Clean orphan par files done
INFO ingester: Found 5 wal files to replay
WARN ingester::wal: replay wal file: ".../logs/1788326948372735.wal" done, batch_num: 6, took: 4 ms
```

Nothing was lost. Two things that cost me time, neither about OpenObserve: `kiac load image checkout:demo` stores the bare name while the kubelet looks for `docker.io/library/checkout:demo`, so tag with the full name (I am fixing this in kiac). And if you wrap Go's `slog.Handler` to inject trace ids, implement `WithAttrs` and `WithGroup` too, or `logger.With(...)` silently drops your wrapper.

## Sharp edges and an honest take

**Laptop to cluster is real.** One Helm install, and the same binary that runs on a laptop was ingesting a whole cluster at under 600 MiB of memory. Cluster mode is a bigger commitment: PostgreSQL, NATS, object storage and the roles chart.

**Know what is off by default.** The memory cache, the circuit breakers and synthetics are off, the WAL is not fsynced per batch, and the docs lag the code on several defaults.

**Vortex is young here.** Faster on row fetch and larger on disk in the vendor's own numbers, open source since July, pinned to a git revision. Try it on a test cluster, watch the release notes before production.

**SLO alerts do not work on single node in rc1.** The SLO math does, the alerts do not, for the read-only client reason above. Watch for the fix before 1.0 final.

**PromQL has gaps.** `histogram_count`, `histogram_sum`, `histogram_fraction`, `sort`, `sort_desc` and the `@` modifier are missing. Test existing Grafana dashboards first.

**Where it fits.** If you want all four Kubernetes signals in one place you can query with SQL, and you want to learn it on a laptop before you bet a cluster on it, this is the fastest path I have found. If you are already sending LLM traces with token and cost attributes, the open-source build handling six conventions and computing cost at ingest is a real differentiator.

## Wrapping up

What I hope you take away is that the collector is solved and the backend is the cost, and that a backend built on object storage, columnar files and a selective index changes what observability costs and what you can query. OpenObserve 1.0 is a good worked example of that design. We followed a pod log line into a Vortex file and its index, watched queries prune down to the rows they needed, and saw a whole cluster's telemetry stored at a fifteenth of its size with every field queryable.

Give it a try on a test cluster and let me know how you find it. If you hit the same sharp edges I did, the fixes above should save you an evening.

## Links

- Companion repo with the values files, demo app, manifests and step-by-step README: https://github.com/saiyam1814/openobserve-k8s-demo
- OpenObserve docs: https://openobserve.ai/docs
- Helm charts (standalone and collector): https://github.com/openobserve/openobserve-helm-chart
- 1.0.0-rc1 release: https://github.com/openobserve/openobserve/releases/tag/v1.0.0-rc1
- OpenObserve vs ClickHouse benchmark (vendor-run): https://openobserve.ai/blog/openobserve-vs-clickhouse-one-billion-logs-benchmark/
- Vortex file format: https://vortex.dev
- Grafana Labs Observability Survey 2026: https://grafana.com/observability-survey/
- kiac: https://github.com/saiyam1814/kiac
