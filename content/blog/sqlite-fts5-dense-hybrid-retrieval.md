---
title: "Hybrid Retrieval with SQLite FTS5 and Dense Vectors"
seoTitle: "SQLite FTS5 + Dense Vectors Hybrid Retrieval RAG Pipeline"
seoDescription: "Build a lightweight, high-performance hybrid retrieval RAG pipeline using SQLite FTS5, dense vectors, and Reciprocal Rank Fusion."
datePublished: 2026-09-14T12:00:00.000Z
slug: sqlite-fts5-dense-hybrid-retrieval
author: ishwar
draft: false
cover: /img/blog/sqlite-fts5-dense-hybrid-retrieval/cover.webp
tags: ["ai", "rag", "search", "sqlite"]
---

I asked LawDecoder, my open-source legal assistant prototype, a simple question:

> *"Someone forged my signature."*

Instead of returning legal provisions about forgery, it confidently cited laws about counterfeit coins.

The language model was not the problem. The retrieval pipeline was.

While dense-only vector search works well for broad semantic matching, it frequently stumbles in domain-specific applications (such as legal, medical, or technical documentation) where exact term matching, code sections, and statutory definitions are critical.

This is not an article arguing against vector databases. It is about why many small and medium search pipelines do not need one, and how you can build a lightweight, highly accurate hybrid retrieval system using SQLite FTS5, dense vectors, and simple ranking rules running locally with a compact 7 MB vector cache and ~16 MB active heap. No specialized knowledge of vector databases, information retrieval, or machine learning is required; basic familiarity with software development and SQL is enough.

---

## Why Vector Search Failed

When I searched for *"Someone forged my signature"*, the naive vector retriever returned results about counterfeit currency instead of forgery offenses:

| Rank | Vector-Only Search (v1) | Hybrid Search + Domain Guardrail (v2) |
| :--- | :--- | :--- |
| **1** | ❌ BNS Section 180: Possession of counterfeit coin | ✅ BNS Section 340: Using forged document |
| **2** | ❌ BNS Section 181: Counterfeit government stamp | ✅ BNS Section 336: Definition of Forgery |
| **3** | ❌ BNS Section 182: Making counterfeit stamps | ✅ BNS Section 339: Possession of forged document |
| **4** | ❌ BNS Section 178: Making counterfeit coins | ✅ BNS Section 335: Making a false document |
| **5** | ❌ BNS Section 246: Abetment of counterfeiting | ✅ Bharatiya Sakshya Adhiniyam, 2023 Sec 65: Proof of signature |

### The Embedding Model Grouped Similar Concepts Together

The vector embedding model was not broken. It was doing exactly what it was trained to do: map semantically related concepts close together in multidimensional space.

Because words like *"forgery"*, *"signature"*, and *"counterfeit"* live in the same broad conceptual neighborhood of fraud, the retriever ranked counterfeit coin provisions above the actual definition of document forgery. The model generalized too aggressively, missing `BNS Section 336` because the word *"signature"* was semantically distant from generic statutory descriptions.

```text
Vector-Only Search (Fails on exact terms):
Query ──> Embedding Model ──> Vector DB ──> Generalized Results (e.g. Counterfeit Coins)

Hybrid Search (Catches both terms and intent):
Query ──┬──> Keyword Search (FTS5) ──┐
        │                            ├──> Merged Top Matches ──> Accurate Answer
        └──> Vector Search (Dense)  ──┘
```

---

## The Mental Model: How One Query Becomes an Answer

Instead of relying on vector search alone, a hybrid retrieval system combines two different search strategies:

1. **Keyword Search:** Finds exact words, statutory section numbers, and specific terms.
2. **Semantic Search:** Finds broad conceptual meanings and general intent.

Here is how a query flows through the entire system from start to finish:

![Hybrid Retrieval Pipeline Architecture](/img/blog/sqlite-fts5-dense-hybrid-retrieval/diagram_pipeline.webp)

> **In one sentence:** Search twice (keyword and vector), merge the candidates, apply a domain guardrail, load the best laws from disk, and send only the top provisions to the language model.

By running both searches simultaneously, exact term matches are preserved while broader conceptual matches are still captured.

---

## Why SQLite? (And When Not to Use It)

I chose **SQLite** because it is a self-contained, embedded database that provides fast disk indexing, ACID transactions, and full-text search out of the box, with zero separate services to deploy or manage.

Managed vector databases like Pinecone, Qdrant, or Milvus are powerful, but for small to medium-sized corpora, they often introduce unnecessary operational overhead:

* **Network Latency:** Every search requires a network hop over HTTP to a remote database cluster.
* **Operational Footprint:** Running dedicated vector database clusters requires monitoring, maintenance, and extra infrastructure cost.
* **Data Duplication:** You maintain document text in your primary store while duplicating payload metadata in a separate vector store.

By keeping the retrieval engine local inside SQLite, the entire search index lives inside a single file right next to your application code, delivering low-millisecond queries with zero network overhead.

---

## Solving the Memory Bottleneck

Think of SQLite as storage on disk, and RAM as your active working set.

In a standard prototype, developers often load full document strings, metadata, and embeddings directly into application memory.

```text
Before (v1: ~438 MB Heap / ~500 MB RSS):
162 MB JSON file on disk
       ↓
Loaded entirely into Node.js process
       ↓
4,892 rich JavaScript objects
(full text strings + metadata + unboxed number lists)
       ↓
High heap usage + garbage collection churn

After (v2: ~16 MB Active Heap / ~218 MB RSS):
SQLite Database (Disk: 16.4 MB)
  ├── Full statutory text (4,892 sections)
  ├── Metadata (acts, chapters, section numbers)
  └── FTS5 full-text index
       
Application RAM
  └── Section IDs + compact 384-dimension Float32Array vectors (7.17 MB raw buffer)
```

![Process Resident Memory (RSS) and Heap comparison between v1 and v2](/img/blog/sqlite-fts5-dense-hybrid-retrieval/chart_memory.webp)

The important architectural change was not simply using SQLite. We stopped loading the entire legal corpus as heavy JavaScript objects. The full text stays on disk, while we keep only document IDs and compact `Float32Array` embeddings in memory for scoring.

When a query runs, the system scores the compact vectors, searches the SQLite full-text index, and fetches the full legal text from SQLite only for the final top matches. This reduced active JavaScript heap usage from roughly 438 MB to 16 MB.

---

## Building the Pipeline: The 50 → 20 → 5 Funnel

To keep search both accurate and fast, we reduce the candidate pool step by step: **50 → 20 → 5**.

* **Top 50 from each search:** We retrieve 50 candidate matches from lexical search and 50 from vector search to ensure high recall across both exact words and general concepts.
* **Top 20 after fusion:** We merge both candidate lists using Reciprocal Rank Fusion (RRF) and pass the top 20 to our domain reranker.
* **Top 5 to the LLM:** We fetch the full legal text from SQLite on disk for only the top 5 matches, keeping the prompt focused and avoiding context clutter.

---

## Implementation & Pipeline Stages

### Step 1: Standalone Lexical Search (SQLite FTS5)

**SQLite FTS5 (Full-Text Search 5)** is SQLite's built-in engine for searching text. It uses the **BM25** ranking algorithm to score how relevant each matching section is to the query based on term frequency and document length.

This SQL query creates a standalone full-text virtual table alongside our primary laws table:

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS laws_fts USING fts5(
    id UNINDEXED,
    law_name,
    chapter,
    title,
    content
);
```

SQLite maintains a searchable copy of the fields we want to query. When a legal section is ingested, the application writes the full record to `laws` and its searchable fields to `laws_fts`. For a corpus of ~5,000 sections, a standalone FTS5 index is clean and straightforward, avoiding the synchronization triggers needed for external-content tables while occupying only ~16 MB on disk.

To retrieve lexical candidates, we run a query scored by BM25:

```sql
SELECT id, BM25(laws_fts) as rank 
FROM laws_fts 
WHERE laws_fts MATCH ? 
ORDER BY rank 
LIMIT 50;
```

In plain English: SQLite searches its full-text index for matching terms, scores them using BM25, and returns the top 50 section IDs.

---

### Step 2: Compact In-Memory Vector Search

Each legal section has a unique ID and a dense vector: a list of 384 floating-point numbers produced by an embedding model (`all-MiniLM-L6-v2`) capturing the semantic meaning of that section.

Instead of keeping heavy text strings in JavaScript memory, we store only document IDs and contiguous numeric buffers (`Float32Array`):

```javascript
// Compact in-memory vector cache: only IDs and 384-dimension coordinate arrays
const vectorCache = [
  { id: "the_bharatiya_nyaya_sanhita_2023_336", embedding: new Float32Array([...384 numbers...]) }
];
```

For 4,892 legal sections, 4,892 vectors × 384 dimensions × 4 bytes per float equals **7.17 MB** of raw vector data in RAM. When a user submits a query, we compute cosine similarity against this typed cache using a tight numeric loop to produce the top 50 semantic candidates.

---

### Step 3: Merging Results with Reciprocal Rank Fusion (RRF)

**Reciprocal Rank Fusion (RRF)** combines the rankings from the semantic and lexical searches into a single master score based on position rather than raw values:

```javascript
// Combine rankings: items near the top of both channels rise to the top
rrfScore[docId] = (rrfScore[docId] || 0) + (1 / (60 + rank));
```

The constant `60` is the standard smoothing parameter from information retrieval research. Documents that appear near the top of both lexical search and vector search naturally earn higher combined scores and rise to the top of the merged list.

---

### Step 4: The Domain Reranker (Deterministic Guardrail)

Statistical retrieval alone does not solve every domain ambiguity. In statutory law, distinct offenses often share conceptual vocabulary. For example, counterfeit currency provisions and document forgery provisions both deal with fraudulent replicas, deceit, and false instruments.

Because dense models cluster them closely and statutory text contains words like *"forged"*, counterfeit coin statutes can easily land in the top 20 candidates for a signature forgery query.

LawDecoder addresses this with a small, deterministic domain reranker on the top 20 candidates:

```javascript
const isDocumentForgeryRelated = /\b(signature|signatures|sign|signed|signing|document|documents)\b/i.test(userQuery);

if (isDocumentForgeryRelated) {
  // If the user asks about a signature or document, penalize coin/stamp offenses
  if (isCoinOrStampOrCurrency) {
    adjustedScore *= 0.01; // heavily demote counterfeit currency matches
  } else if (/\b(forgery|forged)\b/i.test(titleLower)) {
    adjustedScore *= 3.0;  // boost direct document forgery provisions
  }
}
```

This is a domain guardrail, not a replacement for retrieval. Statistical search (FTS5 + vectors) narrows the 4,892 sections down to 20 plausible candidates. The domain reranker then resolves known legal ambiguities within that candidate pool before the top 5 sections are fetched from SQLite and sent to the LLM.

---

## Performance Benchmarks & Controlled Ablation

To evaluate the system, we tested the retrieval pipeline across a corpus of **4,892 statutory sections** (spanning the Bharatiya Nyaya Sanhita, Bharatiya Nagarik Suraksha Sanhita, Bharatiya Sakshya Adhiniyam, Information Technology Act, Constitution of India, and personal laws) against representative evaluation queries.

### Benchmark Setup & Environment

* **Processor:** AMD Ryzen 5 5600H (6 cores, 12 threads)
* **Runtime:** Node.js v22.16, `better-sqlite3` v12.11 (SQLite 3.53) in WAL mode
* **Embedding Model:** `Xenova/all-MiniLM-L6-v2` (384-dimensional vectors)
* **Corpus Size:** 4,892 legal sections in SQLite (16.4 MB file)
* **Memory Measurement:** Process-level resident memory (RSS) and active V8 heap allocations

> **Benchmark note:** v1 reproduces the retrieval data path from the original prototype using the same corpus and embeddings. v2 uses the current SQLite FTS5 and typed vector cache implementation. Measurements were collected locally on the hardware listed above, so absolute latency and memory figures are environment-dependent.

### Comparative Performance

| Metric | Naive Linear Scan (v1) | Hybrid Search + SQLite (v2) | Impact |
| :--- | :--- | :--- | :--- |
| **Search Engine** | Dense Vector (Linear JSON scan) | SQLite FTS5 + Dense Vector + RRF | Hybrid precision upgrade |
| **Query Latency (Median)** | `~161 ms` | `~7.8 ms` | **~20× lower measured latency** |
| **Active JavaScript Heap** | `~438 MB` (JSON Object Tree) | `~16 MB` | **~96% active heap reduction** |
| **Process Resident Memory (RSS)** | `~507 MB RSS` | `~218 MB RSS` | **~57% process RSS reduction** |
| **Raw Vector Storage (RAM)** | N/A | `7.17 MB` | Compact Float32Array cache |
| **Top-5 Hit Rate (10Q Set)** | 60% (Dense only) | 90% (Hybrid / Full Pipeline) | **+30 percentage points** |

*(Note: Process RSS includes memory beyond the JavaScript heap, such as the Node.js runtime, native buffers, and ONNX runtime shared libraries.)*

### Why Did Latency and Memory Actually Improve?

The latency reduction did not happen because hybrid search is inherently faster than single-channel search. Adding FTS5 and RRF introduces additional computational steps.

The large latency win came primarily from changing the data representation:
1. **Eliminating JavaScript overhead:** In v1, the query loop repeatedly traversed thousands of unboxed JavaScript objects, sorted dictionary keys, and ran nested functional closures on every query.
2. **Tight numeric loops:** In v2, vector scoring runs as a contiguous `Float32Array` numeric loop, and SQLite FTS5 executes in compiled C in 1 to 2 ms.
3. **Selective hydration:** Rather than copying and transforming all 4,892 document records per query, full text is hydrated from disk for only the final 5 sections.

Likewise, active heap memory dropped dramatically because statutory text was moved out of the JavaScript heap into SQLite on disk, leaving only compact numeric coordinate buffers in RAM.

### Component Analysis: What Did Each Layer Buy?

Running controlled retrieval across our 10-query evaluation set reveals what each layer contributes:

```text
Dense search:           60% (6/10)
FTS5 keyword search:    70% (7/10)
Dense + FTS5 (RRF):     90% (9/10)
+ Domain reranker:      90% (9/10)
```

| Retrieval Configuration | Top-5 Hit Rate | Key Behavior Observed |
| :--- | :--- | :--- |
| **Stage 1: Dense Vector Only** | 60% (6/10) | Good broad semantic coverage; confused document forgery with currency counterfeiting. |
| **Stage 2: SQLite FTS5 Only** | 70% (7/10) | Excellent on exact terms (e.g. section numbers, "FIR"); missed queries phrased in plain layman language. |
| **Stage 3: Hybrid Search (RRF)** | 90% (9/10) | High recall; combines exact statutory terminology with colloquial layman phrasing. |
| **Stage 4: Full Pipeline (+ Domain Reranker)** | 90% (9/10) | Maintains 90% recall while cleanly prioritizing document forgery statutes over counterfeit coin laws for signature queries. |

While a 10-query evaluation set is an indicative domain benchmark rather than a statistically settled aggregate, it spans key representative practice areas—criminal law, criminal procedure, cyber crime, family law, evidence law, and consumer protection—specifically selected to stress-test known retrieval edge cases like semantic drift, overlapping statutory codes, and duplicate provisions.

In this evaluation, the biggest retrieval improvement came from combining two complementary search methods. The domain reranker did not increase aggregate accuracy on this set, but it provided a useful deterministic guardrail for a known failure mode: for the signature-forgery query, the reranker demoted the counterfeit-currency candidates and promoted document-forgery provisions to the top of the final ranking.

---

## Operational Fit for Small Services

Because this architecture runs locally without a separate server, it fits neatly into containerized and edge environments:

* **No Extra Network Dependency:** The retrieval index lives directly inside the SQLite file, eliminating the latency, connection pooling, and failure modes of an external database network hop.
* **Simple Deployment:** For read-only retrieval workloads, the `.db` file can be packaged directly into the container image or mounted read-only. Multiple container replicas scale horizontally without coordinating writes.
* **When to Graduate:** This approach is well suited to small and medium-sized corpora. As the corpus grows into the hundreds of thousands or millions of documents, or requires high write concurrency and distributed indexing, a dedicated search or vector database may become a better fit.

---

## System Screens

### Developer Mode & Live Citations
Transparent citation view with the Developer Mode toggle enabled, showing retrieval selection methods, BM25 matches, and fused RRF ranks for the top 5 retrieved sections:
![LawDecoder citation view in developer mode displaying RRF ranks and selection reasons](/img/blog/sqlite-fts5-dense-hybrid-retrieval/citations_view.webp)

### Developer Notes & Benchmark Dashboard
Evaluation and benchmark dashboard in Developer Mode, tracking latency comparisons, memory footprint reductions, and component hit rates:
![LawDecoder developer dashboard showing performance comparisons and benchmark results](/img/blog/sqlite-fts5-dense-hybrid-retrieval/developer_notes_tab.webp)

---

## Three Lessons Learned

1. **Better retrieval mattered more than a bigger model.** Refining the data path and candidate selection improved legal explanation accuracy far more than swapping language models.
2. **Exact keyword search remains essential.** Dense embeddings generalize too aggressively for technical domain data; pairing them with BM25 keyword matching ensures exact legal terms are not lost.
3. **Design around the query path.** The largest speed and memory gains came from keeping raw text on disk, using compact typed arrays in memory, and loading full documents only for final candidates.

---

## Conclusion

I started this project trying to improve a language model. I ended up improving the search engine instead.

If your retrieval-augmented generation system is hallucinating or missing obvious domain facts, do not immediately reach for a larger model. Fix the data representation, combine keyword and semantic search, and design your retrieval pipeline around the real query path first.

---

## Code & Repository

The complete source code, SQLite indexing pipeline, and standalone benchmark harness are available on GitHub:

**GitHub Repository:** https://github.com/ishwar170695/LawDecoder

The benchmark harness and ablation test suite can be run directly from the backend directory:

```bash
cd backend
npm install
npm run benchmark   # Runs the 4-stage ablation and latency evaluation against the benchmark dataset
```
