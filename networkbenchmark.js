const Redis = require('ioredis');
const { MongoClient } = require('mongodb');
const { performance } = require('perf_hooks');

// Configuration
// Note: For Cloud Databases over Internet, 100-200 iterations is optimal for speed!
const ITERATIONS = 100; 

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
    console.log(`\n=================================================`);
    console.log(`🚀 STARTING BENCHMARK: REDIS vs MONGODB CACHING`);
    console.log(`Total Operations Per Step: ${ITERATIONS}`);
    console.log(`=================================================\n`);

    const redis = new Redis(REDIS_URL);
    const mongoClient = new MongoClient(MONGO_URL);
    
    console.log('🔌 Connecting to Cloud Databases...');
    await mongoClient.connect();
    const mongoDb = mongoClient.db(DB_NAME);
    const mongoCollection = mongoDb.collection(COLLECTION_NAME);
    console.log('✅ Connected successfully!\n');

    // Clean up previous test data
    await mongoCollection.deleteMany({});
    await redis.flushdb();

    const results = { Redis: {}, MongoDB: {} };

    // ---------------------------------------------------------
    // 1. REDIS BENCHMARKS
    // ---------------------------------------------------------
    console.log('⏳ Running Redis Benchmarks...');
    
    // Create
    process.stdout.write('   -> Redis CREATE: ');
    let start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        await redis.set(`user:${i}`, sampleData);
    }
    let end = performance.now();
    results.Redis.Create = (end - start);
    console.log('Done ✅');

    // Read
    process.stdout.write('   -> Redis READ:   ');
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        await redis.get(`user:${i}`);
    }
    end = performance.now();
    results.Redis.Read = (end - start);
    console.log('Done ✅');

    // Update
    process.stdout.write('   -> Redis UPDATE: ');
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        await redis.set(`user:${i}`, sampleData);
    }
    end = performance.now();
    results.Redis.Update = (end - start);
    console.log('Done ✅');

    // Delete
    process.stdout.write('   -> Redis DELETE: ');
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        await redis.del(`user:${i}`);
    }
    end = performance.now();
    results.Redis.Delete = (end - start);
    console.log('Done ✅\n');

    // ---------------------------------------------------------
    // 2. MONGODB BENCHMARKS
    // ---------------------------------------------------------
    console.log('⏳ Running MongoDB Cache Benchmarks...');

    // Create
    process.stdout.write('   -> Mongo CREATE: ');
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        await mongoCollection.insertOne({ _id: `user:${i}`, cacheVal: sampleData });
    }
    end = performance.now();
    results.MongoDB.Create = (end - start);
    console.log('Done ✅');

    // Read
    process.stdout.write('   -> Mongo READ:   ');
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        await mongoCollection.findOne({ _id: `user:${i}` });
    }
    end = performance.now();
    results.MongoDB.Read = (end - start);
    console.log('Done ✅');

    // Update
    process.stdout.write('   -> Mongo UPDATE: ');
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        await mongoCollection.updateOne(
            { _id: `user:${i}` },
            { $set: { cacheVal: sampleData } }
        );
    }
    end = performance.now();
    results.MongoDB.Update = (end - start);
    console.log('Done ✅');

    // Delete
    process.stdout.write('   -> Mongo DELETE: ');
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        await mongoCollection.deleteOne({ _id: `user:${i}` });
    }
    end = performance.now();
    results.MongoDB.Delete = (end - start);
    console.log('Done ✅\n');

    // ---------------------------------------------------------
    // 3. PRINT RESULTS TABLE (Clean & Compact Format)
    // ---------------------------------------------------------
    console.log(`========================================================================================`);
    console.log(`📊 BENCHMARK RESULTS: REDIS vs MONGODB CACHING (${ITERATIONS} Operations)`);
    console.log(`========================================================================================\n`);

    // Table 1: Latency (Lower is Better)
    console.log(`📌 TABLE 1: AVERAGE LATENCY (in Milliseconds - Lower is Better)`);
    const latencyTable = ['Create', 'Read', 'Update', 'Delete'].map(op => ({
        'Operation': op,
        'Redis Latency': `${(results.Redis[op] / ITERATIONS).toFixed(2)} ms`,
        'MongoDB Latency': `${(results.MongoDB[op] / ITERATIONS).toFixed(2)} ms`,
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