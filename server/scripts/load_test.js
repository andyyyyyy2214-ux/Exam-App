/**
 * Self-Contained Performance / Load Testing Benchmark
 * Boots the Express app in-process, benchmarks with autocannon, and exits cleanly.
 */

const autocannon = require('autocannon');
const app = require('../src/app');

const TEST_PORT = 5055;

async function runBenchmark() {
  console.log('=====================================================');
  console.log('🚀 Booting Express Server for Empirical Load Benchmark...');
  
  const server = app.listen(TEST_PORT, () => {
    console.log(`📡 Benchmark Server live on port ${TEST_PORT}`);
    console.log('📊 Configuration: 50 concurrent virtual users for 5 seconds');
    console.log('=====================================================\n');

    const instance = autocannon(
      {
        url: `http://localhost:${TEST_PORT}/health`,
        connections: 50,
        duration: 5,
        pipelining: 1,
      },
      (err, result) => {
        if (err) {
          console.error('Benchmark error:', err);
          server.close();
          process.exit(1);
        }

        console.log('\n📈 --- EMPIRICAL BENCHMARK RESULTS ---');
        console.log(`Total Requests Handled: ${result.requests.total}`);
        console.log(`Throughput (Req / Sec): ${result.requests.average}`);
        console.log(`Data Transferred:       ${(result.throughput.total / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Average Latency:        ${result.latency.average} ms`);
        console.log(`p95 Latency:            ${result.latency.p95} ms`);
        console.log(`p99 Latency:            ${result.latency.p99} ms`);
        console.log(`Failed / Timed Out:     ${result.errors + result.timeouts}`);
        console.log('=====================================================');

        if (result.errors === 0 && result.timeouts === 0) {
          console.log('✅ Performance Gate: PASSED (Zero errors under 50 concurrent VU load)');
        } else {
          console.warn('⚠️ Performance Gate: WARNING');
        }

        server.close(() => {
          console.log('🏁 Benchmark completed and server closed cleanly.\n');
          process.exit(0);
        });
      }
    );

    autocannon.track(instance, { renderProgressBar: true });
  });
}

runBenchmark();
