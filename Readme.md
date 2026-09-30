# Redis vs MongoDB Cache Benchmark

This project benchmarks Redis and MongoDB for common cache-style operations such as create, read, update, and delete. It measures performance using Node.js and compares latency and throughput between the two systems.

## Overview

The repository includes two benchmark scripts:

- `networkbenchmark.js` — a standard benchmark that runs sequential CRUD operations and prints latency and throughput tables.
- `rambenchmark.js` — a higher-throughput benchmark using Redis pipelines and MongoDB bulk operations to simulate more realistic high-volume access patterns.

Both scripts connect to a Redis instance and a MongoDB database, run test operations, and log the results to the console.

## Tech Stack

- Node.js
- Redis via `ioredis`
- MongoDB via `mongodb`

## Project Structure

```text
.
├── networkbenchmark.js
├── rambenchmark.js
├── package.json
├── README.md
└── .gitignore
```

## Requirements

Before running the benchmarks, make sure you have:

- Node.js installed
- A running Redis instance
- A MongoDB instance or MongoDB Atlas cluster
- Network access to both services from your machine

## Installation

Install the project dependencies:

```bash
npm install
```

This will install:

- `ioredis`
- `mongodb`

## Configuration

Open the benchmark scripts and update the following values before running them:

- `REDIS_URL`
- `MONGO_URL`
- `DB_NAME`
- `COLLECTION_NAME`
- `ITERATIONS` (optional, if you want to change workload size)

For production or shared environments, it is better to move these values into environment variables rather than hardcoding them into the script.

## Running the Benchmarks

Run the standard benchmark:

```bash
node networkbenchmark.js
```

Run the high-throughput benchmark:

```bash
node rambenchmark.js
```

## What the Scripts Measure

Each script checks the following operations:

- Create
- Read
- Update
- Delete

It prints:

- Average latency per operation in milliseconds
- Throughput in operations per second
- Which database performs better for each operation

## Notes

- Redis is generally faster for simple key-value caching and high-frequency reads/writes.
- MongoDB is better suited when you need document storage and richer querying capabilities, but it tends to be slower for cache-only workloads.
- Real-world results depend on network latency, server hardware, database configuration, and dataset size.

## License

This project is currently using the default ISC license from the package metadata.
