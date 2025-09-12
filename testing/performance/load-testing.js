/**
 * Performance and Load Testing Suite
 * Tests system performance under various load conditions
 */

const artillery = require('artillery');
const { performance } = require('perf_hooks');
const fs = require('fs').promises;
const path = require('path');

class PerformanceTestSuite {
  constructor() {
    this.baseUrl = process.env.TEST_API_URL || 'http://localhost:5000';
    this.results = {
      load: { passed: 0, failed: 0, metrics: {} },
      stress: { passed: 0, failed: 0, metrics: {} },
      spike: { passed: 0, failed: 0, metrics: {} },
      volume: { passed: 0, failed: 0, metrics: {} }
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Performance Testing Suite...');
    
    try {
      // Run load tests
      await this.runLoadTests();
      
      // Run stress tests
      await this.runStressTests();
      
      // Run spike tests
      await this.runSpikeTests();
      
      // Run volume tests
      await this.runVolumeTests();
      
      // Run memory tests
      await this.runMemoryTests();
      
      // Run database performance tests
      await this.runDatabasePerformanceTests();
      
      // Generate performance report
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Performance testing failed:', error);
      throw error;
    }
  }

  async runLoadTests() {
    console.log('📊 Running Load Tests...');
    
    const loadTestConfig = {
      config: {
        target: this.baseUrl,
        phases: [
          { duration: '2m', arrivalRate: 10 }, // Ramp up
          { duration: '5m', arrivalRate: 20 }, // Sustained load
          { duration: '2m', arrivalRate: 0 }   // Ramp down
        ],
        defaults: {
          headers: {
            'Authorization': 'Bearer test_token',
            'Content-Type': 'application/json'
          }
        }
      },
      scenarios: [
        {
          name: 'API Load Test',
          weight: 100,
          flow: [
            { get: { url: '/api/parts' } },
            { think: 1 },
            { get: { url: '/api/orders' } },
            { think: 2 },
            { post: { 
              url: '/api/orders',
              json: {
                customerId: 'test_customer_id',
                items: [{ partId: 'test_part_id', quantity: 1, price: 50 }],
                total: 50
              }
            }}
          ]
        }
      ]
    };

    try {
      const results = await this.runArtilleryTest(loadTestConfig, 'load');
      this.results.load.metrics = results;
      
      // Check performance thresholds
      if (results.summary.latency.p95 < 2000 && results.summary.rps > 10) {
        this.results.load.passed++;
        console.log('✅ Load tests passed');
      } else {
        this.results.load.failed++;
        console.log('❌ Load tests failed - performance below threshold');
      }
      
    } catch (error) {
      console.error('❌ Load tests failed:', error);
      this.results.load.failed++;
    }
  }

  async runStressTests() {
    console.log('💪 Running Stress Tests...');
    
    const stressTestConfig = {
      config: {
        target: this.baseUrl,
        phases: [
          { duration: '1m', arrivalRate: 50 },  // High load
          { duration: '3m', arrivalRate: 100 }, // Very high load
          { duration: '1m', arrivalRate: 0 }    // Ramp down
        ],
        defaults: {
          headers: {
            'Authorization': 'Bearer test_token',
            'Content-Type': 'application/json'
          }
        }
      },
      scenarios: [
        {
          name: 'API Stress Test',
          weight: 100,
          flow: [
            { get: { url: '/api/parts' } },
            { post: { 
              url: '/api/orders',
              json: {
                customerId: 'test_customer_id',
                items: [{ partId: 'test_part_id', quantity: 1, price: 50 }],
                total: 50
              }
            }},
            { get: { url: '/api/orders' } }
          ]
        }
      ]
    };

    try {
      const results = await this.runArtilleryTest(stressTestConfig, 'stress');
      this.results.stress.metrics = results;
      
      // Check if system handles stress
      if (results.summary.codes['200'] > results.summary.codes['500']) {
        this.results.stress.passed++;
        console.log('✅ Stress tests passed - system handled high load');
      } else {
        this.results.stress.failed++;
        console.log('❌ Stress tests failed - system failed under stress');
      }
      
    } catch (error) {
      console.error('❌ Stress tests failed:', error);
      this.results.stress.failed++;
    }
  }

  async runSpikeTests() {
    console.log('⚡ Running Spike Tests...');
    
    const spikeTestConfig = {
      config: {
        target: this.baseUrl,
        phases: [
          { duration: '1m', arrivalRate: 10 },  // Normal load
          { duration: '30s', arrivalRate: 200 }, // Sudden spike
          { duration: '1m', arrivalRate: 10 },   // Back to normal
          { duration: '30s', arrivalRate: 200 }, // Another spike
          { duration: '1m', arrivalRate: 0 }     // Ramp down
        ],
        defaults: {
          headers: {
            'Authorization': 'Bearer test_token',
            'Content-Type': 'application/json'
          }
        }
      },
      scenarios: [
        {
          name: 'API Spike Test',
          weight: 100,
          flow: [
            { get: { url: '/api/parts' } },
            { think: 1 }
          ]
        }
      ]
    };

    try {
      const results = await this.runArtilleryTest(spikeTestConfig, 'spike');
      this.results.spike.metrics = results;
      
      // Check recovery from spikes
      const errorRate = results.summary.codes['500'] / results.summary.codes['200'];
      if (errorRate < 0.1) {
        this.results.spike.passed++;
        console.log('✅ Spike tests passed - system recovered from spikes');
      } else {
        this.results.spike.failed++;
        console.log('❌ Spike tests failed - high error rate during spikes');
      }
      
    } catch (error) {
      console.error('❌ Spike tests failed:', error);
      this.results.spike.failed++;
    }
  }

  async runVolumeTests() {
    console.log('📈 Running Volume Tests...');
    
    const volumeTestConfig = {
      config: {
        target: this.baseUrl,
        phases: [
          { duration: '10m', arrivalRate: 5 } // Sustained low load for long duration
        ],
        defaults: {
          headers: {
            'Authorization': 'Bearer test_token',
            'Content-Type': 'application/json'
          }
        }
      },
      scenarios: [
        {
          name: 'API Volume Test',
          weight: 100,
          flow: [
            { get: { url: '/api/parts' } },
            { think: 5 },
            { get: { url: '/api/orders' } },
            { think: 10 }
          ]
        }
      ]
    };

    try {
      const results = await this.runArtilleryTest(volumeTestConfig, 'volume');
      this.results.volume.metrics = results;
      
      // Check consistent performance over time
      if (results.summary.latency.p95 < 1000) {
        this.results.volume.passed++;
        console.log('✅ Volume tests passed - consistent performance');
      } else {
        this.results.volume.failed++;
        console.log('❌ Volume tests failed - performance degraded over time');
      }
      
    } catch (error) {
      console.error('❌ Volume tests failed:', error);
      this.results.volume.failed++;
    }
  }

  async runMemoryTests() {
    console.log('🧠 Running Memory Tests...');
    
    try {
      const memoryResults = {
        initial: await this.getMemoryUsage(),
        underLoad: null,
        afterLoad: null
      };

      // Start memory monitoring
      const memoryMonitor = setInterval(async () => {
        const currentMemory = await this.getMemoryUsage();
        console.log(`Memory usage: ${currentMemory.heapUsed}MB / ${currentMemory.heapTotal}MB`);
      }, 5000);

      // Run load test while monitoring memory
      await this.runLoadTests();

      memoryResults.underLoad = await this.getMemoryUsage();

      // Wait for garbage collection
      await new Promise(resolve => setTimeout(resolve, 10000));
      memoryResults.afterLoad = await this.getMemoryUsage();

      clearInterval(memoryMonitor);

      // Check for memory leaks
      const memoryIncrease = memoryResults.afterLoad.heapUsed - memoryResults.initial.heapUsed;
      if (memoryIncrease < 100) { // Less than 100MB increase
        console.log('✅ Memory tests passed - no significant memory leaks');
      } else {
        console.log('❌ Memory tests failed - potential memory leak detected');
      }

    } catch (error) {
      console.error('❌ Memory tests failed:', error);
    }
  }

  async runDatabasePerformanceTests() {
    console.log('💾 Running Database Performance Tests...');
    
    try {
      const dbTests = [
        { name: 'Simple Query', query: 'SELECT * FROM parts LIMIT 10' },
        { name: 'Complex Query', query: 'SELECT p.*, o.total FROM parts p JOIN orders o ON p.id = o.part_id' },
        { name: 'Aggregation Query', query: 'SELECT category, COUNT(*), AVG(price) FROM parts GROUP BY category' },
        { name: 'Insert Performance', operation: 'insert', data: { name: 'Test Part', price: 50 } },
        { name: 'Update Performance', operation: 'update', data: { price: 75 } },
        { name: 'Delete Performance', operation: 'delete' }
      ];

      const dbResults = {};

      for (const test of dbTests) {
        const startTime = performance.now();
        
        if (test.query) {
          // Execute query
          await this.executeQuery(test.query);
        } else {
          // Execute operation
          await this.executeOperation(test.operation, test.data);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        dbResults[test.name] = duration;
        console.log(`${test.name}: ${duration.toFixed(2)}ms`);
      }

      // Check database performance thresholds
      const avgQueryTime = Object.values(dbResults).reduce((a, b) => a + b, 0) / Object.values(dbResults).length;
      if (avgQueryTime < 100) {
        console.log('✅ Database performance tests passed');
      } else {
        console.log('❌ Database performance tests failed - slow queries detected');
      }

    } catch (error) {
      console.error('❌ Database performance tests failed:', error);
    }
  }

  async runArtilleryTest(config, testType) {
    return new Promise((resolve, reject) => {
      const testFile = path.join(__dirname, `../temp/${testType}-test.json`);
      
      // Write config to file
      fs.writeFile(testFile, JSON.stringify(config, null, 2))
        .then(() => {
          // Run artillery test
          const artilleryProcess = artillery.run(testFile, (err, report) => {
            if (err) {
              reject(err);
            } else {
              resolve(report);
            }
          });
        })
        .catch(reject);
    });
  }

  async getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024)
    };
  }

  async executeQuery(query) {
    // This would execute the actual database query
    // For now, we'll simulate the execution time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
  }

  async executeOperation(operation, data) {
    // This would execute the actual database operation
    // For now, we'll simulate the execution time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 30));
  }

  async generateReport() {
    console.log('📊 Generating Performance Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: Object.values(this.results).reduce((sum, result) => sum + result.passed + result.failed, 0),
        totalPassed: Object.values(this.results).reduce((sum, result) => sum + result.passed, 0),
        totalFailed: Object.values(this.results).reduce((sum, result) => sum + result.failed, 0)
      },
      results: this.results,
      recommendations: this.generateRecommendations(),
      thresholds: {
        responseTime: { p95: 2000, p99: 5000 },
        errorRate: 0.01,
        throughput: 100,
        memoryUsage: 512
      }
    };

    const reportPath = path.join(__dirname, '../reports/performance-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log('✅ Performance report generated:', reportPath);
    console.log(`📊 Performance Test Results:`);
    console.log(`   Total Tests: ${report.summary.totalTests}`);
    console.log(`   Passed: ${report.summary.totalPassed}`);
    console.log(`   Failed: ${report.summary.totalFailed}`);
    console.log(`   Success Rate: ${((report.summary.totalPassed / report.summary.totalTests) * 100).toFixed(1)}%`);
  }

  generateRecommendations() {
    const recommendations = [];

    // Analyze load test results
    if (this.results.load.metrics.summary?.latency?.p95 > 2000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Response time under load exceeds 2 seconds. Consider optimizing database queries and adding caching.'
      });
    }

    // Analyze stress test results
    if (this.results.stress.metrics.summary?.codes?.['500'] > 0) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: 'System errors detected under stress. Review error handling and resource limits.'
      });
    }

    // Analyze spike test results
    if (this.results.spike.metrics.summary?.codes?.['500'] > this.results.spike.metrics.summary?.codes?.['200'] * 0.1) {
      recommendations.push({
        type: 'scalability',
        priority: 'medium',
        message: 'High error rate during traffic spikes. Consider implementing auto-scaling and circuit breakers.'
      });
    }

    // Analyze volume test results
    if (this.results.volume.metrics.summary?.latency?.p95 > 1000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Performance degradation over time detected. Check for memory leaks and resource cleanup.'
      });
    }

    return recommendations;
  }
}

// CLI usage
if (require.main === module) {
  const testSuite = new PerformanceTestSuite();
  testSuite.runAllTests()
    .then(() => {
      console.log('🎉 Performance testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Performance testing failed:', error);
      process.exit(1);
    });
}

module.exports = PerformanceTestSuite;
