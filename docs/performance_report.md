# Performance & Load Testing Benchmark Report

**Project**: Online Exam Application with Auto-Grading  
**Tool**: Autocannon (HTTP/1.1 High-Load Benchmarking)  
**Target Environment**: Node.js 22 LTS, Express.js 5, Localhost Sandbox

---

## 1. Load Test Scenario & Objectives

* **Objective**: Verify that the API gateway and grading service remain responsive under high concurrent exam-day traffic (simulating 50 students accessing endpoints simultaneously).
* **Virtual Connections**: 50 concurrent TCP sockets.
* **Duration**: 5.15 seconds.
* **Pipelining**: 1.

---

## 2. Empirical Benchmark Results

```text
┌─────────┬───────┬───────┬───────┬────────┬──────────┬──────────┬─────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5% │ 99%    │ Avg      │ Stdev    │ Max     │
├─────────┼───────┼───────┼───────┼────────┼──────────┼──────────┼─────────┤
│ Latency │ 22 ms │ 50 ms │ 80 ms │ 143 ms │ 55.09 ms │ 59.22 ms │ 1168 ms │
└─────────┴───────┴───────┴───────┴────────┴──────────┴──────────┴─────────┘
┌───────────┬────────┬────────┬────────┬────────┬────────┬─────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%    │ 97.5%  │ Avg    │ Stdev   │ Min    │
├───────────┼────────┼────────┼────────┼────────┼────────┼─────────┼────────┤
│ Req/Sec   │ 552    │ 552    │ 950    │ 1,200  │ 915    │ 219.51  │ 552    │
├───────────┼────────┼────────┼────────┼────────┼────────┼─────────┼────────┤
│ Bytes/Sec │ 215 kB │ 215 kB │ 370 kB │ 467 kB │ 356 kB │ 85.3 kB │ 215 kB │
└───────────┴────────┴────────┴────────┴────────┴────────┴─────────┴────────┘
```

### Key Performance Indicators (KPIs)

| Metric | Measured Value | Acceptance Target | Result |
| :--- | :--- | :--- | :--- |
| **Total Requests Processed** | **4,575 requests** | > 1,000 requests | **EXCEEDED** |
| **Throughput (Requests / Sec)**| **915.0 req/sec** | > 200 req/sec | **EXCEEDED (4.5x target)** |
| **Average Latency** | **55.09 ms** | < 200 ms | **EXCEEDED (72% faster)** |
| **p99 Latency** | **143 ms** | < 500 ms | **EXCEEDED** |
| **Failed Requests / Timeouts**| **0 (0.00%)** | 0.00% | **PERFECT** |
| **Data Transferred** | **1.70 MB** | N/A | **STABLE** |

---

## 3. Evaluation & Conclusion

The application successfully passed the Performance Readiness Gate. With an average response time of **55.09 ms** and zero socket drops under **50 concurrent connections**, the system demonstrates ample capacity to handle classroom-wide exam submissions without degradation.
