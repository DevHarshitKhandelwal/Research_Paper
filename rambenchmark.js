const Redis = require('ioredis');
const { MongoClient } = require('mongodb');
const { performance } = require('perf_hooks');

const ITERATIONS = 1000; // Increased to 1,000 operations!

const REDIS_URL = 'redis://default:vxgwtZtPb1WN0ih2oEmTlDfSIVrS3lAs@fireman-consistent-cathartic-97593.db.redis.io:12439';
const MONGO_URL = 'mongodb+srv://bluecity0000:bluecity0000@cluster0.aoswjb5.mongodb.net/?appName=Cluster0';
const DB_NAME = 'cache_benchmark_db';
const COLLECTION_NAME = 'cache_test';

const sampleData = JSON.stringify({
    userId: 'user_102938',
    name: 'Harshit Khandelwal',
    role: 'Developer',
    sessionToken: 'xyz_abc_987654321',
    lastAccess: Date.now()
});

async function runBenchmark() {
    console.log(`\n========================================================================================`);
    console.log(`🚀 HIGH-SPEED PIPELINED BENCHMARK: REDIS vs MONGODB (${ITERATIONS} Operations)`);
    console.log(`========================================================================================\n`);

    const redis = new Redis(REDIS_URL);
    const mongoClient = new MongoClient(MONGO_URL);
    
    console.log('🔌 Connecting to Cloud Databases...');
    await mongoClient.connect();
    const mongoDb = mongoClient.db(DB_NAME);
    const mongoCollection = mongoDb.collection(COLLECTION_NAME);
    console.log('✅ Connected successfully!\n');

    await mongoCollection.deleteMany({});
    await redis.flushdb();

    const results = { Redis: {}, MongoDB: {} };

    // ---------------------------------------------------------
    // 1. REDIS PIPELINED BENCHMARKS
    // ---------------------------------------------------------
    console.log('⚡ Running Redis Pipelined Benchmarks (In-Memory Batching)...');
    
    // Create
    process.stdout.write('   -> Redis CREATE (SET): ');
    let start = performance.now();
    let pipeline = redis.pipeline();
    for (let i = 0; i < ITERATIONS; i++) {
        pipeline.set(`user:${i}`, sampleData);
    }
    await pipeline.exec();
    let end = performance.now();
    results.Redis.Create = (end - start);
    console.log('Done ✅');

    // Read
    process.stdout.write('   -> Redis READ (GET):   ');
    start = performance.now();
    pipeline = redis.pipeline();
    for (let i = 0; i < ITERATIONS; i++) {
        pipeline.get(`user:${i}`);
    }
    await pipeline.exec();
    end = performance.now();
    results.Redis.Read = (end - start);
    console.log('Done ✅');

    // Update
    process.stdout.write('   -> Redis UPDATE:       ');
    start = performance.now();
    pipeline = redis.pipeline();
    for (let i = 0; i < ITERATIONS; i++) {
        pipeline.set(`user:${i}`, sampleData);
    }
    await pipeline.exec();
    end = performance.now();
    results.Redis.Update = (end - start);
    console.log('Done ✅');

    // Delete
    process.stdout.write('   -> Redis DELETE:       ');
    start = performance.now();
    pipeline = redis.pipeline();
    for (let i = 0; i < ITERATIONS; i++) {
        pipeline.del(`user:${i}`);
    }
    await pipeline.exec();
    end = performance.now();
    results.Redis.Delete = (end - start);
    console.log('Done ✅\n');

    // ---------------------------------------------------------
    // 2. MONGODB BULK BENCHMARKS
    // ---------------------------------------------------------
    console.log('🍃 Running MongoDB Bulk Benchmarks...');

    // Create
    process.stdout.write('   -> Mongo CREATE:       ');
    start = performance.now();
    const docs = [];
    for (let i = 0; i < ITERATIONS; i++) {
        docs.push({ _id: `user:${i}`, cacheVal: sampleData });
    }
    await mongoCollection.insertMany(docs);
    end = performance.now();
    results.MongoDB.Create = (end - start);
    console.log('Done ✅');

    // Read
    process.stdout.write('   -> Mongo READ:         ');
    start = performance.now();
    const readOps = [];
    for (let i = 0; i < ITERATIONS; i++) {
        readOps.push(mongoCollection.findOne({ _id: `user:${i}` }));
    }
    await Promise.all(readOps);
    end = performance.now();
    results.MongoDB.Read = (end - start);
    console.log('Done ✅');

    // Update
    process.stdout.write('   -> Mongo UPDATE:       ');
    start = performance.now();
    const updateOps = [];
    for (let i = 0; i < ITERATIONS; i++) {
        updateOps.push(mongoCollection.updateOne({ _id: `user:${i}` }, { $set: { cacheVal: sampleData } }));
    }
    await Promise.all(updateOps);
    end = performance.now();
    results.MongoDB.Update = (end - start);
    console.log('Done ✅');

    // Delete
    process.stdout.write('   -> Mongo DELETE:       ');
    start = performance.now();
    await mongoCollection.deleteMany({});
    end = performance.now();
    results.MongoDB.Delete = (end - start);
    console.log('Done ✅\n');

    // ---------------------------------------------------------
    // 3. PRINT RESULTS TABLE
    // ---------------------------------------------------------
    console.log(`========================================================================================`);
    console.log(`📊 BENCHMARK RESULTS: REDIS vs MONGODB PIPELINED CACHING (${ITERATIONS} Operations)`);
    console.log(`========================================================================================\n`);

    console.log(`📌 TABLE 1: AVERAGE LATENCY PER OP (in Milliseconds - Lower is Better)`);
    const latencyTable = ['Create', 'Read', 'Update', 'Delete'].map(op => ({
        'Operation': op,
        'Redis Latency': `${(results.Redis[op] / ITERATIONS).toFixed(4)} ms`,
        'MongoDB Latency': `${(results.MongoDB[op] / ITERATIONS).toFixed(4)} ms`,
        'Faster System': (results.Redis[op] < results.MongoDB[op]) ? '⚡ Redis' : '🍃 MongoDB'
    }));
    console.table(latencyTable);

    console.log(`\n📌 TABLE 2: THROUGHPUT (Operations Per Second - Higher is Better)`);
    const throughputTable = ['Create', 'Read', 'Update', 'Delete'].map(op => ({
        'Operation': op,
        'Redis (Ops/Sec)': Math.round((ITERATIONS / results.Redis[op]) * 1000),
        'MongoDB (Ops/Sec)': Math.round((ITERATIONS / results.MongoDB[op]) * 1000),
        'Higher Speed': (results.Redis[op] < results.MongoDB[op]) ? '⚡ Redis' : '🍃 MongoDB'
    }));
    console.table(throughputTable);

    console.log(`\n========================================================================================`);

    await redis.quit();
    await mongoClient.close();
    console.log(`\n✅ Benchmark Completed Successfully!`);
}

runBenchmark().catch(err => console.error('Error running benchmark:', err));