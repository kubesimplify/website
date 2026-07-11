---
title: "Hybrid Retrieval Pipelines: Why SQLite FTS5 + Dense Vectors Beat Naive RAG"
seoTitle: "SQLite FTS5 + Dense Vectors Hybrid Retrieval RAG Pipeline"
seoDescription: "Build a lightweight, high-performance hybrid retrieval RAG pipeline using SQLite FTS5, dense vectors, and Reciprocal Rank Fusion (RRF)."
datePublished: 2026-07-11T10:00:00.000Z
slug: sqlite-fts5-dense-hybrid-retrieval
author: ishwar
cover: /img/blog/sqlite-fts5-dense-hybrid-retrieval/cover.jpg
tags: ["ai", "rag", "search", "sqlite"]
---

When building Retrieval-Augmented Generation (RAG) applications, the standard prescription is simple: chunk your documents, run them through an embedding model, load the vectors into a dedicated vector database, and perform cosine similarity search.

This is **dense-only retrieval**. While it works well for generic semantic matching, it frequently fails in domain-specific applications (such as legal, medical, or corporate wikis) where exact term matching, code sections, and keyword precision are critical. 

In this article, we'll walk through why dense-only RAG pipelines fail in specialized domains, explore the mechanics of a **hybrid search architecture (SQLite FTS5 + Dense Vectors + Reciprocal Rank Fusion)**, and review how to build a highly optimized, low-latency search engine that runs locally under a 48 MB RAM footprint.

---

## 🏛️ The Architecture Overview

Instead of spinning up a heavy vector database container, we can decouple the storage and indices into a local SQLite database and an in-memory cache. 

Here is the multi-stage hybrid retrieval pipeline:

```
                Query
                  │
      ┌───────────┴───────────┐
      │                       │
 SQLite FTS5            Dense Vectors
   (BM25)             (Cosine Similarity)
      │                       │
      └───────────┬───────────┘
                  │
         Reciprocal Rank Fusion (RRF)
                  │
          Domain Reranker
                  │
            Top-K Documents
                  │
                 LLM
```

This pipeline runs entirely on a Node.js backend. The LLM remains almost unchanged; nearly all retrieval accuracy and performance gains are derived by optimizing the database query and fusion layers.

---

## 🧠 Why Vector-Only Retrieval Fails on Domain Data

To understand the need for hybrid search, consider the following query asked to a dense-only legal retrieval prototype:

> **Query:** "Someone forged my signature"

In a naive dense-only retrieval setup (v1), the results looked like this:

```
Query:
"Someone forged my signature"

Top result (v1):
❌ BNS Section 180 — Possession of counterfeit coin

Expected:
✅ BNS Section 336 — Forgery
✅ BNS Section 340 — Using forged document
```

### The Problem: Semantic Generalization
The embedding model wasn't "wrong." It was doing exactly what it was trained to do: map semantically close concepts close together in vector space. 

This failure isn't unique to legal search. The same pattern appears in internal documentation, code search, healthcare, finance, and enterprise knowledge bases—anywhere exact terminology matters as much as semantic similarity. 

Because "forgery" and "counterfeit" ended up close in embedding space, the retriever ranked counterfeit coin and government stamp provisions above the actual definition of document forgery. The retriever generalized too aggressively, missing the specific definition of forgery (`BNS Section 336`) because the word "signature" was semantically distant from generic statutory descriptions of the offence.

### System Bloat & Overlap
In a standard RAG prototype, developers load embedding coordinates alongside large raw text strings (document metadata and full content) directly into application memory. 

For a corpus of 4,000+ files, this linear JSON search array causes the Node.js process to consume over **320 MB of RAM** at startup. Additionally, redundant sections across different categories clutter the LLM's context window, degrading synthesis accuracy.

---

## ⚙️ Building the Hybrid Solution

A robust retrieval system requires two search indexes working in parallel:
1.  **Sparse Index (Lexical/Keyword):** Captures exact terms, section numbers, and names using traditional TF-IDF or BM25 ranking.
2.  **Dense Index (Semantic):** Captures the abstract conceptual meaning of the query.

### 1. Sparse Retrieval with SQLite FTS5
By storing our records in **SQLite**, we gain access to an embedded, ACID-compliant database with zero network hop latency and no complex infrastructure to manage. Furthermore, its built-in **FTS5 extension** compiles virtual tables to run full-text searches with highly optimized BM25 rankings.

We define our SQLite tables like this:

```sql
-- Structured store for legal acts and metadata
CREATE TABLE IF NOT EXISTS sections (
    id TEXT PRIMARY KEY,
    law_name TEXT NOT NULL,
    chapter TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL
);

-- Virtual table for exact BM25 keyword matching
CREATE VIRTUAL TABLE IF NOT EXISTS sections_fts USING fts5(
    id UNINDEXED,
    law_name,
    chapter,
    title,
    content,
    content='sections',
    content_rowid='rowid'
);
```

When a query is received, we run a virtual FTS5 match query, which executes in single-digit milliseconds and guarantees that exact keywords (like *"forgery"*, *"signature"*, or *"Section 65"*) rank highly:

```sql
SELECT id, BM25(sections_fts) as rank 
FROM sections_fts 
WHERE sections_fts MATCH ? 
ORDER BY rank 
LIMIT 50;
```

### 2. Lightweight In-Memory Vector Cache
To keep the application's RAM footprint minimal, we discard all text strings and metadata from RAM. We load only the `id` (string) and the coordinate list—pre-processed into a compact `Float32Array` object—into memory:

```javascript
// Compact in-memory vector cache
const vectorCache = [
  { id: "bns_336", vector: new Float32Array([...]) },
  { id: "bns_340", vector: new Float32Array([...]) }
];
```

When a search runs, we calculate cosine similarity against this typed cache in memory. Once we identify the top 5 document IDs, we perform a single, fast SQL query to hydrate the text from the local SQLite database file on disk. This reduces memory usage by **85%** (from 320 MB to **48 MB**).

### 3. Reciprocal Rank Fusion (RRF)
We now have two lists of rankings: the top 50 matches from FTS5 (sparse) and the top 50 matches from our vector cache (dense). 

BM25 and cosine similarity produce scores on completely different scales. Rather than trying to normalize incompatible scores, Reciprocal Rank Fusion (RRF) ignores the score values entirely and combines only ranking positions. This makes it robust across heterogeneous retrieval systems by summing the reciprocal rank of each item across both runs:

$$RRF\_Score(d) = \sum_{m \in M} \frac{1}{k + \text{rank}_m(d)}$$

Where $k$ is a constant (typically 60) that dampens the influence of high-ranking outliers. Here is the JavaScript implementation:

```javascript
const rrfScores = new Map();
const k = 60;

// Process vector rankings (dense)
vectorRankings.forEach((item, index) => {
  rrfScores.set(item.id, 1 / (k + index + 1));
});

// Process FTS5 keyword rankings (sparse)
ftsRankings.forEach((item, index) => {
  const existingScore = rrfScores.get(item.id) || 0;
  rrfScores.set(item.id, existingScore + (1 / (k + index + 1)));
});

// Sort candidates based on RRF scores
const mergedRanking = Array.from(rrfScores.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20); // Retain top 20 candidates for reranking
```

### 4. Deterministic Domain Reranking
Finally, to eliminate domain-specific retrieval errors (like matching "forged signature" to "counterfeit coin") without running a heavy cross-encoder model, we implement a rule-based **Domain Reranker**. This is a deterministic rule-based reranker tailored to the legal domain—not a learned neural cross-encoder.

It evaluates the top 20 fused candidates and applies deterministic weights based on specific keyword flags:

```javascript
// Heuristic Domain Reranking
if (isDocumentForgeryRelated) {
  if (isCoinOrStampOrCurrency) {
    adjustedScore *= 0.01; // heavily penalize counterfeit coin/stamps (reduce by 99%)
  } else if (titleLower.includes('forgery') || titleLower.includes('forged')) {
    adjustedScore *= 3.0; // strong boost for direct forgery definitions/offences
  }
}
```

---

## 📊 Performance & System Latency

To evaluate the redesign, I assembled a benchmark of 100 manually verified legal queries spanning criminal law, cybercrime, family law, consumer protection, and procedural law.

| Metric | v1 (Naive Vector RAG) | v2.1 (Hybrid Search - Current) | Change |
| :--- | :--- | :--- | :--- |
| **Search Engine** | Dense Vector (Linear JSON scan) | Hybrid (SQLite FTS5 + Dense Vector + RRF + Reranker) | Major retrieval precision upgrade |
| **Avg. Query Latency** | `466 ms` | `12 ms` | **97.4% speedup** |
| **Memory Cache Footprint** | `~320 MB` | `~48 MB` | **85.0% RAM savings** |
| **Duplicate Citations** | Present (up to 40% overlaps) | Deduplicated (0% overlaps) | Verified |
| **Top-5 Relevant Retrieval Rate** | ~68% | ~91% | **+23% accuracy gain** |

*Latency is based on 100 benchmark queries. Memory is process-level heap size at startup. Accuracy is evaluated on top-5 target matches using a manually verified benchmark dataset of 100 queries.*

None of these improvements required changing the language model. The gains came almost entirely from retrieval engineering. For the signature forgery query, the top retrieved references aligned with the expected legal provisions:
1.  **BNS 340:** Forged document and using it as genuine
2.  **BNS 336:** Forgery definition and penalty
3.  **BNS 339:** Possession of forged document
4.  **BNS 335:** Making a false document
5.  **Evidence Act Section 65:** Proof of signature and handwriting

---

## 🖥️ Screen Demonstrations

### 1️⃣ User Chat Interface
Clean, legal explanation interface for end users:
![LawDecoder Streamlit user chat landing page showing response layout](/img/blog/sqlite-fts5-dense-hybrid-retrieval/landing_page.png)

### 2️⃣ Structured Offence & Citation Details
Deduplicated citations with developer metrics visible in Developer Mode:
![LawDecoder citation view in developer mode displaying RRF ranks and selection reasons](/img/blog/sqlite-fts5-dense-hybrid-retrieval/citations_view.png)

### 3️⃣ System Evaluation Dashboard
Performance comparisons and technical architecture story:
![LawDecoder developer dashboard showing performance latency and accuracy benchmarks comparison table](/img/blog/sqlite-fts5-dense-hybrid-retrieval/developer_notes_tab.png)

---

## ⚖️ Architectural Tradeoffs: When to use SQLite

### When this architecture makes sense
This approach works well when:
*   **Corpus <100k–500k documents:** Linear typed scans and local FTS5 are highly optimal in single-digit milliseconds.
*   **Local-first applications:** Fits desktop applications, edge agents, and serverless backends due to standalone execution.
*   **Low operational complexity:** Zero databases, servers, or external services to manage.
*   **Deterministic keyword matching:** Absolute accuracy for specific statutory codes, IDs, or identifiers.

### When to use dedicated Vector Databases (Elasticsearch/Qdrant/Milvus)
Consider distributed systems when:
*   **Millions of documents:** Scans require true parallel HNSW vector indexing.
*   **Distributed indexing:** Independent compute scaling is needed between vector calculation and storage.
*   **High write throughput:** Frequent real-time writes require background index segmentation.
*   **Horizontal scaling:** Needs replication, high availability clusters, or cloud management.

---

## 💡 Key Takeaways

Modern RAG systems are increasingly becoming search systems with an LLM attached. If retrieval returns the wrong documents, no prompt or model can recover the missing information. Investing in indexing, ranking, and retrieval architecture often yields larger gains than changing the model itself.

---

## Repository

The complete implementation—including SQLite ingestion, FTS5 indexing, Reciprocal Rank Fusion, evaluation queries, and benchmark samples—is available on GitHub.

**GitHub:** https://github.com/ishwar170695/LawDecoder
