# Performance Analysis of Redis and MongoDB Caching for Web Applications

[![Paper PDF](https://img.shields.io/badge/Research_Paper-final__research.pdf-red?style=for-the-badge&logo=adobeacrobatreader)](./final_research.pdf)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js_v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Redis](https://img.shields.io/badge/Database-Redis_Cloud-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

An empirical comparative performance research study evaluating **Redis** (in-memory key-value store) and **MongoDB** (document-oriented NoSQL database) as caching layers for high-throughput, low-latency web applications.

---

## 📌 Author Metadata

- **Author**: Harshit Khandelwal
- **Degree**: Bachelor in Computer Application (BCA)
- **Institution**: JECRC University, Jaipur, Rajasthan, India
- **Contact**: `khandelwalharshit2024@gmail.com`
- **Paper**: [`final_research.pdf`](./final_research.pdf)

---

## 📄 Abstract & Executive Summary

In modern large-scale web application development, minimizing data retrieval latency and server load is critical to delivering an optimal user experience under heavy concurrent traffic. Caching addresses scalability bottlenecks by storing frequently accessed data in intermediate storage layers.

This research presents an empirical comparative performance analysis of Redis and MongoDB across standard **Create, Read, Update, and Delete (CRUD)** operations using an asynchronous Node.js benchmarking framework. The workloads evaluate $N = 1,000$ operation iterations utilizing pipelined Redis execution and MongoDB bulk execution routines.

### Key Takeaways
1. **⚡ Redis Sub-Millisecond Read Dominance**: Redis achieved an average read latency of **0.5133 ms** (**1,948 Ops/Sec**), outperforming MongoDB (**10.0821 ms**, **99 Ops/Sec**) by **~20×** for read-heavy key-value workloads due to pure RAM-first hash-map lookups ($O(1)$).
2. **🍃 MongoDB Collection-Level Eviction Superiority**: During collection-level cache clearing, MongoDB achieved a bulk deletion latency of **0.1180 ms** (**8,487 Ops/Sec**) compared to Redis's **0.3114 ms** (**3,211 Ops/Sec**), as `deleteMany({})` resets collection metadata pointers directly at the WiredTiger storage engine level.
3. **📊 Decision Matrix**: Guidelines for system architects on when to select pure in-memory stores versus document-oriented engines based on query complexity and eviction requirements.

---

## 📊 Empirical Results & Benchmarks

The benchmark evaluated 1,000 operations across Create, Read, Update, and Delete steps under identical network and cloud hardware conditions.

### Table 1: Average Latency Comparison (Lower is Better)

| Operation | Redis Latency (ms) | MongoDB Latency (ms) | Speed Advantage / Winner |
| :--- | :---: | :---: | :--- |
| **Create** | **1.2587 ms** | 3.3682 ms | **⚡ Redis (2.67× faster)** |
| **Read** | **0.5133 ms** | 10.0821 ms | **⚡ Redis (~20× faster)** |
| **Update** | **0.6205 ms** | 8.9554 ms | **⚡ Redis (14.43× faster)** |
| **Delete** | 0.3114 ms | **0.1180 ms** | **🍃 MongoDB (2.64× faster)** |

### Table 2: Throughput Comparison (Higher is Better)

| Operation | Redis Throughput (Ops/Sec) | MongoDB Throughput (Ops/Sec) | Winner |
| :--- | :---: | :---: | :--- |
| **Create** | **794 Ops/Sec** | 297 Ops/Sec | **⚡ Redis** |
| **Read** | **1,948 Ops/Sec** | 99 Ops/Sec | **⚡ Redis** |
| **Update** | **1,612 Ops/Sec** | 112 Ops/Sec | **⚡ Redis** |
| **Delete** | 3,211 Ops/Sec | **8,487 Ops/Sec** | **🍃 MongoDB** |

---

## 🧮 Mathematical Performance Metrics

Performance evaluation relies on two standard quantitative metrics:

1. **Average Latency per Operation ($L_{avg}$)**:
   $$L_{avg} = \frac{T_{total}}{N}$$
   *where $T_{total}$ is total execution time in milliseconds and $N = 1000$ operations.*

2. **System Throughput ($TH$)**:
   $$TH = \left( \frac{N}{T_{total}} \right) \times 1000 \quad \text{(Operations per Second)}$$

---

## 🔬 In-Depth Workload Analysis

### 1. Read Performance Analysis (Primary Finding)
- **Redis (0.5133 ms / 1,948 Ops/Sec)**: Operates as a pure RAM hash map with $O(1)$ time complexity. Eliminates disk I/O, secondary indexing, and BSON serialization/deserialization.
- **MongoDB (10.0821 ms / 99 Ops/Sec)**: Must locate documents within its B-tree index structure, traverse WiredTiger internal cache buffers, parse document boundaries, and deserialize BSON into JavaScript objects.

### 2. Create & Update Workload Analysis
- **Create**: Redis (`1.2587 ms`) outperforms MongoDB (`3.3682 ms`) by **2.67×**.
- **Update**: Redis (`0.6205 ms`) outperforms MongoDB (`8.9554 ms`) by **14.43×**.
- **Architectural Rationale**: Redis updates string primitives directly in memory without log writes. MongoDB must execute update routines, update B-tree index nodes, and record journaling/write-ahead log entries for crash recovery.

### 3. Bulk Delete / Cache Purge Analysis (Secondary Finding)
- **MongoDB (0.1180 ms / 8,487 Ops/Sec)**: `deleteMany({})` performs a single metadata pointer update at the storage engine level, clearing the collection efficiently.
- **Redis (0.3114 ms / 3,211 Ops/Sec)**: Pipelined execution of individual `DEL user:i` commands requires processing 1,000 separate key deletion entries in memory.

---

## 🏗️ Architectural Feature Comparison Matrix

| Feature / Parameter | Redis Store | MongoDB Store |
| :--- | :--- | :--- |
| **Primary Data Model** | Key-Value Pair | BSON Document |
| **Primary Storage Medium** | Pure RAM | Disk + WiredTiger RAM Cache |
| **Threading Model** | Single-Threaded Event Loop | Multi-Threaded |
| **Secondary Indexing** | Limited / Specialized | Full Index Support |
| **Query Language** | Redis Commands (RESP Protocol) | MQL / Aggregation Pipeline |
| **Persistence Options** | RDB Snapshots / AOF | Write-Ahead Logging (Journaling) |
| **Default Port** | `6379` | `27017` |

---

## 🎯 System Architecture Decision Matrix

Recommendations for web application architects selecting a caching tier:

| Application Requirement | Recommended Engine | Primary Rationale |
| :--- | :---: | :--- |
| **Sub-millisecond Read Speed** | **Redis** | RAM lookup via single-threaded non-blocking loop |
| **Simple Key-Value Session Storage** | **Redis** | Minimal memory overhead & highest read throughput |
| **High-Frequency State Updates** | **Redis** | In-memory value mutation without disk journaling |
| **Complex Nested Query Filtering** | **MongoDB** | Rich secondary indexing & dynamic BSON traversal |
| **Bulk Collection Cache Invalidations** | **MongoDB** | Fast collection metadata pointer resets (0.1180 ms) |
| **Unified Database & Cache Stack** | **MongoDB** | Eliminates secondary infrastructure management |

---

## 💻 Benchmarking Framework & Repository Structure

### Project Layout
```text
.
├── final_research.pdf    # Complete IEEE-formatted research paper
├── networkbenchmark.js   # Sequential CRUD benchmark suite
├── rambenchmark.js       # Pipelined & Bulk execution benchmark suite
├── package.json          # Node.js dependencies (ioredis, mongodb)
├── package-lock.json     # Dependency lockfile
└── Readme.md             # Research documentation & benchmark findings
```

### Benchmark Suite Algorithms

#### 1. Redis Pipelined Processing (`rambenchmark.js`)
Packs 1,000 requests into a single TCP frame using `redis.pipeline()` to eliminate network round-trip overhead:
```javascript
const pipeline = redis.pipeline();
for (let i = 0; i < ITERATIONS; i++) {
    pipeline.set(`user:${i}`, sampleData);
}
await pipeline.exec();
```

#### 2. MongoDB Bulk Execution (`rambenchmark.js`)
Utilizes batch operations (`insertMany`), asynchronous concurrency (`Promise.all`), and collection purging (`deleteMany`):
```javascript
// Bulk Insert
const docs = Array.from({ length: ITERATIONS }, (_, i) => ({
    _id: `user:${i}`,
    cacheVal: sampleData
}));
await mongoCollection.insertMany(docs);

// Bulk Read
await Promise.all(
    Array.from({ length: ITERATIONS }, (_, i) => 
        mongoCollection.findOne({ _id: `user:${i}` })
    )
);

// Bulk Eviction
await mongoCollection.deleteMany({});
```

---

## ⚙️ Experimental Environment Setup

All experiments were executed under standardized test conditions:

- **Operating System**: Microsoft Windows 10 (Multi-Core Intel Workstation)
- **Runtime**: Node.js v18.x (V8 Engine) with `performance.now()` high-resolution timing
- **Redis Instance**: Managed Redis Cloud (In-Memory Engine) via `ioredis` v5.x
- **MongoDB Instance**: Managed MongoDB Atlas (WiredTiger Storage Engine) via `mongodb` native v6.x
- **Workload Payload**: Standardized JSON Session Object (`~200 bytes` serialized string)
- **Iteration Count ($N$)**: 1,000 operations per CRUD phase

---

## 🚀 How to Run the Benchmarks

### 1. Prerequisites
Ensure you have Node.js (v16+) and access to Redis and MongoDB instances.

### 2. Installation
Install the required database drivers:
```bash
npm install
```

### 3. Configuration
Update database connection strings in `networkbenchmark.js` and `rambenchmark.js` if using custom instances:
```javascript
const REDIS_URL = 'redis://default:<password>@<host>:<port>';
const MONGO_URL = 'mongodb+srv://<username>:<password>@<cluster-url>';
```

### 4. Running the Suites

#### Standard Sequential Benchmark:
```bash
node networkbenchmark.js
```

#### High-Throughput Pipelined & Bulk Benchmark:
```bash
node rambenchmark.js
```

---

## ⚠️ Limitations & Future Work

### Limitations
1. **RAM Cost Scaling**: Storing multi-gigabyte datasets entirely in RAM using Redis incurs higher infrastructure costs compared to disk-backed storage.
2. **Data Volatility**: Redis in-memory storage risks transient data loss during sudden power failure unless explicit persistence (RDB/AOF) is enabled.
3. **Single-Node Test Scope**: Benchmarks were conducted on single-node cloud instances.

### Future Work
- Evaluation of distributed multi-node clusters (**Redis Cluster** vs **MongoDB Sharded Cluster**).
- High-concurrency load testing simulating 10,000+ virtual users.
- Resource profiling of host CPU core usage and memory allocation under sustained stress.

---

## 📚 References & Citation

If you use this research or benchmark framework in your academic work or project, please cite:

```bibtex
@article{khandelwal2024redis,
  title={Performance Analysis of Redis and MongoDB Caching for Web Applications},
  author={Khandelwal, Harshit},
  journal={JECRC University Research Studies},
  year={2024},
  publisher={JECRC University},
  note={Available at final_research.pdf}
}
```

1. R. Cattell, *"Scalable SQL and NoSQL data stores,"* ACM SIGMOD Rec., vol. 39, no. 4, pp. 12–27, 2011.
2. A. Vacali and G. Pallis, *"Web caching and content delivery networks,"* IEEE Internet Comput., vol. 6, no. 6, pp. 24–31, 2002.
3. Z. Li, C. Wilson, and H. Zhao, *"Evaluating in-memory key-value store performance in modern cloud applications,"* IEEE Trans. Cloud Comput., vol. 9, no. 3, pp. 880–892, 2021.
4. B. F. Cooper et al., *"Benchmarking cloud serving systems with YCSB,"* Proc. 1st ACM Symp. Cloud Comput. (SoCC), 2010, pp. 143–154.
