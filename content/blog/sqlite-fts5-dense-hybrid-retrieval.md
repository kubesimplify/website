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

I asked my legal assistant prototype a simple question:

> _"Someone forged my signature."_

Instead of returning legal provisions about forgery, it confidently cited laws about counterfeit coins.

The LLM wasn't the problem. The retrieval pipeline was.

While dense-only vector search works well for broad semantic matching, it frequently fails in domain-specific applications (such as legal, medical, or corporate wikis) where exact term matching, code sections, and keyword precision are critical.

This isn't an article arguing against vector databases. It's about why many small and medium RAG systems don't need one—and how you can build a lightweight, highly accurate hybrid search engine that runs locally on around 50 MB of RAM.

---

## 1. Why Vector Search Failed

When I searched for _"Someone forged my signature"_, the naive vector retriever returned results about counterfeit currency instead of forgery offenses:

| Rank  | Vector-Only Search (v1)                             | Hybrid Search (v2)                                 |
| :---- | :-------------------------------------------------- | :------------------------------------------------- |
| **1** | ❌ BNS Section 180 — Possession of counterfeit coin | ✅ BNS Section 336 — Definition of Forgery         |
| **2** | ❌ BNS Section 181 — Counterfeit government stamp   | ✅ BNS Section 340 — Using forged document         |
| **3** | ❌ BNS Section 182 — Making counterfeit stamps      | ✅ BNS Section 339 — Possession of forged document |
| **4** | ❌ BNS Section 178 — Making counterfeit coins       | ✅ BNS Section 335 — Making a false document       |
| **5** | ❌ BNS Section 246 — Abetment of counterfeiting     | ✅ Evidence Act Sec 65 — Proof of signature        |

### The Embedding Model Grouped Similar Concepts Together

The vector embedding model wasn't broken—it was doing exactly what it was trained to do. Embedding models map semantically related concepts close together in vector space.

Because words like _"forgery"_, _"signature"_, and _"counterfeit"_ live in the same broad conceptual neighborhood of fraud, the retriever ranked counterfeit coin provisions above the actual definition of document forgery. The model generalized too aggressively, missing `BNS Section 336` because the word _"signature"_ was semantically distant from generic statutory descriptions.

## 2. The Mental Model: How One Query Becomes an Answer

Instead of relying on vector search alone, a hybrid retrieval system combines two different search strategies:

1. **Keyword Search:** Catches exact words, section numbers, and specific terms.
2. **Semantic Search:** Catches broad conceptual meanings and intent.

Here is how a query flows through the entire system from start to finish:

![Hybrid Retrieval Pipeline Architecture](/img/blog/sqlite-fts5-dense-hybrid-retrieval/diagram_pipeline.png)

> **In one sentence:** Search twice (keyword + vector), merge the results, remove irrelevant matches, load the best laws, then send them to the LLM.

By running both searches simultaneously, exact term matches are never missed, while broader conceptual matches are still captured.

---

## 3. Why SQLite? (And Why Not Pinecone or Qdrant?)

I chose **SQLite** because it is an embedded database that already provides ACID transactions, fast disk indexing, and full-text search out of the box—with zero separate services to deploy, manage, or pay for.

Managed vector databases like Pinecone, Qdrant, or Milvus are powerful, but for small to medium datasets (under 500,000 documents), they introduce unnecessary operational overhead:

- **Network Latency:** Every search requires a network hop over HTTP to a remote database cluster.
- **Cost & Infrastructure:** Running hosted vector database instances introduces monthly bills and extra monitoring.
- **Storage Duplication:** You end up maintaining raw document text in your main database while duplicating payload metadata inside your vector database.

By keeping the retrieval engine local inside SQLite, your entire search database lives inside a single file right next to your application code—delivering single-digit millisecond queries with zero network overhead.

---

## 4. Solving the Memory Bottleneck

Think of SQLite as long-term storage on disk, and RAM as your active working set.

In a standard RAG prototype, developers load full document strings, metadata, and embeddings directly into application memory.

- **Before (~320 MB RAM):** The application loaded every document's full text, metadata, and vector embeddings into memory at startup.
- **After (~50 MB RAM):** The application keeps only lightweight document IDs and embeddings in memory. When a query finds the top matches, it fetches the corresponding document text from SQLite on demand.

![Memory Footprint Comparison](/img/blog/sqlite-fts5-dense-hybrid-retrieval/chart_memory.png)

By keeping heavy text strings on disk in SQLite and doing text lookups only for the final top matches, memory usage dropped by **85%**.

---

## 5. Building the Pipeline: Reducing the Candidate List

To keep search both accurate and fast, we reduce the candidate list step-by-step: **50 → 20 → 5**.

- **Top 50 from each search:** We retrieve 50 candidate matches from keyword search and 50 from vector search to ensure broad coverage (high recall).
- **Top 20 after fusion:** We merge the candidate lists using Reciprocal Rank Fusion (RRF) and pass the best 20 to our domain reranker.
- **Top 5 to the LLM:** We fetch full document text from SQLite for only the top 5 matches, keeping the LLM prompt focused and preventing context clutter.

---

## 6. Implementation & Code

### Step 1: Exact Keyword Search (SQLite FTS5 & BM25)

- **What it is:** SQLite's FTS5 extension creates a full-text search index.
- **Why we use it:** It ranks keyword matches using **BM25**, the standard search engine algorithm that scores relevance based on word frequency while penalizing overly long documents.

This SQL query creates a lightweight full-text virtual table alongside our main documents table:

```sql
-- Full-Text Search index referencing the laws table
CREATE VIRTUAL TABLE IF NOT EXISTS laws_fts USING fts5(
    id UNINDEXED,
    title,
    content,
    content='laws',
    content_rowid='rowid'
);
```

_(Setting `content='laws'` tells SQLite to index text without duplicating it on disk, keeping the database file compact.)_

This query runs an exact keyword match in SQLite and returns the top 50 relevant document IDs scored by BM25:

```sql
SELECT id, BM25(laws_fts) as rank
FROM laws_fts
WHERE laws_fts MATCH ?
ORDER BY rank
LIMIT 50;
```

---

### Step 2: Lightweight In-Memory Vector Search

- **What it is:** An array of raw floating-point numbers (`Float32Array`) representing the vector embeddings of each document.
- **Why we use it:** By keeping only coordinate arrays and document IDs in RAM (and leaving full document text on disk), vector similarity search runs extremely fast without consuming hundreds of megabytes of memory.

This JavaScript snippet keeps only document IDs and raw float coordinate vectors in memory, dropping all text strings:

```javascript
// Compact in-memory vector cache (no text strings in RAM)
const vectorCache = [
  { id: "bns_336", vector: new Float32Array([...]) }
];
```

When a user submits a query, we compute cosine similarity against this typed array cache to get the top 50 semantic matches.

---

### Step 3: Merging Results with Reciprocal Rank Fusion (RRF)

- **What it is:** An algorithm that combines multiple ranked lists into a single score based on item position.
- **Why we use it:** BM25 and cosine similarity produce completely different score ranges, so averaging raw scores is meaningless. RRF sidesteps that problem by combining ranking positions instead of raw scores:

This JavaScript function combines rankings from keyword search and vector search into a single master list:

```javascript
// Combine rankings: items near the top of both lists rise to the top
rrfScore[docId] = (rrfScore[docId] || 0) + 1 / (60 + rank);
```

Documents appearing near the top of both search channels naturally rise to the top of the merged list.

---

### Step 4: Rule-Based Reranking & Fetching Text

- **What it is:** A brief rule filter that checks domain-specific terms.
- **Why we use it:** If both "forgery" and "counterfeit" appear similar to the embedding model, the reranker gives extra weight to laws that explicitly mention document forgery.

Once the top 5 candidate IDs are selected, Node.js fetches their full text from SQLite on disk in a single fast query and passes it to the LLM.

---

## 7. Performance Benchmarks

To evaluate the pipeline, I manually created a benchmark of **100 legal queries** across a corpus of **4,892 legal sections**—containing provisions from the Bharatiya Nyaya Sanhita, Bharatiya Nagarik Suraksha Sanhita, Bharatiya Sakshya Adhiniyam, and related Indian laws—and verified whether the expected legal sections appeared in the top five retrieved results.

| Metric                       | Vector-Only RAG (v1)            | Hybrid Search (v2)         | Impact                  |
| :--------------------------- | :------------------------------ | :------------------------- | :---------------------- |
| **Search Engine**            | Dense Vector (Linear JSON scan) | SQLite FTS5 + Vector + RRF | Major precision upgrade |
| **Avg. Query Latency**       | `466 ms`                        | `12 ms`                    | **97.4% faster**        |
| **Memory Footprint**         | `~320 MB`                       | `~50 MB`                   | **85.0% RAM reduction** |
| **Top-5 Relevant Retrieval** | ~68%                            | ~91%                       | **+23% accuracy gain**  |

---

## 8. The Trade-offs: When NOT to Use This Architecture

Hybrid retrieval with local SQLite is not a universal solution. Here is when **not** to use this approach:

- **Millions of Documents:** If your corpus exceeds ~500,000 documents, keeping vector embeddings in memory will consume too much RAM. You will need disk-backed vector indexes like HNSW in dedicated databases (Qdrant, Milvus, or Elasticsearch).
- **Distributed & Multi-Writer Workloads:** If your application requires high-concurrency write streaming across multiple servers, SQLite's single-writer lock will become a bottleneck.
- **Complex Multi-Modal Data:** If you require real-time graph traversal or multi-modal filtering, specialized enterprise search clusters are a better fit.

---

## 9. System Screens

### User Chat Interface

Clean, legal explanation interface for end users:
![LawDecoder Streamlit user chat landing page showing response layout](/img/blog/sqlite-fts5-dense-hybrid-retrieval/landing_page.png)
![LawDecoder Streamlit user chat landing page showing RRF ranks](/img/blog/sqlite-fts5-dense-hybrid-retrieval/citations_view.png)

---

## Three Lessons Learned

1. **Better retrieval mattered more than a bigger LLM.** Improving search architecture yielded far larger accuracy gains than swapping language models.
2. **Exact keyword search still matters.** Semantic embeddings generalize too aggressively for precise domain data; traditional BM25 keyword matching remains essential.
3. **Simple local architectures are often enough.** For small to medium datasets under 500,000 items, a single-file SQLite setup beats dedicated cloud vector databases in speed, cost, and complexity.

---

## Conclusion

I started this project trying to improve an LLM. I ended up improving the search engine instead. That single architectural change produced larger gains than swapping models ever did.

If your RAG system is hallucinating or missing obvious domain facts, don't rush to switch to a larger language model. Fix your retrieval pipeline first.

---

## Code & Repository

Want to explore the implementation? The complete source code, benchmark scripts, and SQLite indexing pipeline are available on GitHub.

**GitHub Repository:** https://github.com/ishwar170695/LawDecoder
