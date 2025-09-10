#!/usr/bin/env node

/**
 * 🚀 Load Testing Suite for Clutch Platform
 * Comprehensive performance testing and optimization
 */

const axios = require('axios');
const { performance } = require('perf_hooks');
const fs = require('fs').promises;
const path = require('path');

class LoadTestingSuite {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      throughput: [],
      errorRates: [],
      concurrentUsers: 0,
      testDuration: 0
    };
    this.testScenarios = [];
    this.authTokens = [];
  }

  async run() {
    console.log('🚀 Starting Comprehensive Load Testing Suite...');
    console.log(`📍 Testing against: ${this.baseUrl}`);
    
    try {
      // Phase 1: Baseline Performance Testing
      await this.baselinePerformanceTest();
      
      // Phase 2: Concurrent User Testing
      await this.concurrentUserTest();
      
      // Phase 3: Stress Testing
      await this.stressTest();
      
      // Phase 4: Spike Testing
      await this.spikeTest();
      
      // Phase 5: Endurance Testing
      await this.enduranceTest();
      
      // Phase 6: Database Performance Testing
      await this.databasePerformanceTest();
      
      // Generate comprehensive performance report
      await this.generatePerformanceReport();
      
    } catch (error) {
      console.error('❌ Load testing suite failed:', error.message);
      process.exit(1);
    }
  }

  async baselinePerformanceTest() {
    console.log('\n📊 Phase 1: Baseline Performance Testing...');
    
    const endpoints = [
      '/health-enhanced',
      '/api/v1/dashboard/stats',
      '/api/v1/analytics/metrics',
      '/api/v1/users/analytics'
    ];
    
    const results = await this.testEndpoints(endpoints, 100, 1);
    this.results.baseline = results;
    
    console.log(`✅ Baseline test completed: ${results.successfulRequests}/${results.totalRequests} successful`);
  }

  async concurrentUserTest() {
    console.log('\n👥 Phase 2: Concurrent User Testing...');
    
    const userCounts = [10, 25, 50, 100];
    
    for (const userCount of userCounts) {
      console.log(`\n🧪 Testing with ${userCount} concurrent users...`);
      
      const results = await this.simulateConcurrentUsers(userCount, 60);
      this.results.concurrentUsers = Math.max(this.results.concurrentUsers, userCount);
      
      console.log(`✅ ${userCount} users: ${results.successfulRequests}/${results.totalRequests} successful`);
      console.log(`   Average Response Time: ${results.averageResponseTime.toFixed(2)}ms`);
      console.log(`   Throughput: ${results.throughput.toFixed(2)} req/sec`);
    }
  }

  async stressTest() {
    console.log('\n🔥 Phase 3: Stress Testing...');
    
    const stressLevels = [150, 200, 300, 500];
    
    for (const userCount of stressLevels) {
      console.log(`\n🧪 Stress testing with ${userCount} users...`);
      
      const results = await this.simulateConcurrentUsers(userCount, 30);
      
      if (results.errorRate > 0.05) { // 5% error rate threshold
        console.log(`⚠️ Error rate exceeded threshold: ${(results.errorRate * 100).toFixed(2)}%`);
        break;
      }
      
      console.log(`✅ ${userCount} users: ${results.successfulRequests}/${results.totalRequests} successful`);
      console.log(`   Error Rate: ${(results.errorRate * 100).toFixed(2)}%`);
    }
  }

  async spikeTest() {
    console.log('\n📈 Phase 4: Spike Testing...');
    
    console.log('🧪 Simulating sudden traffic spike...');
    
    // Normal load
    await this.simulateConcurrentUsers(50, 30);
    
    // Sudden spike
    const spikeResults = await this.simulateConcurrentUsers(300, 10);
    
    // Return to normal
    await this.simulateConcurrentUsers(50, 30);
    
    console.log(`✅ Spike test completed: ${spikeResults.successfulRequests}/${spikeResults.totalRequests} successful`);
    console.log(`   Spike Error Rate: ${(spikeResults.errorRate * 100).toFixed(2)}%`);
  }

  async enduranceTest() {
    console.log('\n⏰ Phase 5: Endurance Testing...');
    
    console.log('🧪 Running endurance test for 5 minutes...');
    
    const startTime = Date.now();
    const duration = 5 * 60 * 1000; // 5 minutes
    const results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      memoryUsage: [],
      cpuUsage: []
    };
    
    while (Date.now() - startTime < duration) {
      const batchResults = await this.testEndpoints([
        '/health-enhanced',
        '/api/v1/dashboard/stats'
      ], 10, 1);
      
      results.totalRequests += batchResults.totalRequests;
      results.successfulRequests += batchResults.successfulRequests;
      results.failedRequests += batchResults.failedRequests;
      results.responseTimes.push(...batchResults.responseTimes);
      
      // Collect system metrics
      const memUsage = process.memoryUsage();
      results.memoryUsage.push({
        timestamp: Date.now(),
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external
      });
      
      await this.sleep(1000); // 1 second interval
    }
    
    this.results.endurance = results;
    console.log(`✅ Endurance test completed: ${results.successfulRequests}/${results.totalRequests} successful`);
  }

  async databasePerformanceTest() {
    console.log('\n🗄️ Phase 6: Database Performance Testing...');
    
    const dbTests = [
      {
        name: 'User Analytics Query',
        endpoint: '/api/v1/users/analytics',
        auth: true
      },
      {
        name: 'Dashboard Stats Query',
        endpoint: '/api/v1/dashboard/stats',
        auth: true
      },
      {
        name: 'Business Intelligence Query',
        endpoint: '/api/v1/business-intelligence/metrics',
        auth: true
      }
    ];
    
    const results = [];
    
    for (const test of dbTests) {
      console.log(`🧪 Testing: ${test.name}`);
      
      const testResults = await this.testDatabaseEndpoint(test, 50);
      results.push({
        name: test.name,
        ...testResults
      });
      
      console.log(`   Average Response Time: ${testResults.averageResponseTime.toFixed(2)}ms`);
      console.log(`   Success Rate: ${(testResults.successRate * 100).toFixed(2)}%`);
    }
    
    this.results.database = results;
  }

  async simulateConcurrentUsers(userCount, durationSeconds) {
    const startTime = Date.now();
    const endTime = startTime + (durationSeconds * 1000);
    const results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      startTime,
      endTime
    };
    
    const endpoints = [
      '/health-enhanced',
      '/api/v1/dashboard/stats',
      '/api/v1/analytics/metrics'
    ];
    
    const promises = [];
    
    for (let i = 0; i < userCount; i++) {
      const userPromise = this.simulateUser(endpoints, endTime, results);
      promises.push(userPromise);
    }
    
    await Promise.all(promises);
    
    // Calculate metrics
    results.duration = (results.endTime - results.startTime) / 1000;
    results.averageResponseTime = this.calculateAverageResponseTime(results.responseTimes);
    results.throughput = results.successfulRequests / results.duration;
    results.errorRate = results.failedRequests / results.totalRequests;
    
    return results;
  }

  async simulateUser(endpoints, endTime, results) {
    while (Date.now() < endTime) {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      
      try {
        const startTime = performance.now();
        const response = await axios.get(`${this.baseUrl}${endpoint}`, {
          timeout: 10000
        });
        const endTime = performance.now();
        
        results.totalRequests++;
        results.successfulRequests++;
        results.responseTimes.push(endTime - startTime);
        
      } catch (error) {
        results.totalRequests++;
        results.failedRequests++;
      }
      
      // Random delay between requests (100-500ms)
      await this.sleep(Math.random() * 400 + 100);
    }
  }

  async testEndpoints(endpoints, requestsPerEndpoint, concurrency) {
    const results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      startTime: Date.now()
    };
    
    const promises = [];
    
    for (const endpoint of endpoints) {
      for (let i = 0; i < requestsPerEndpoint; i++) {
        const promise = this.testSingleEndpoint(endpoint, results);
        promises.push(promise);
        
        // Control concurrency
        if (promises.length >= concurrency) {
          await Promise.all(promises);
          promises.length = 0;
        }
      }
    }
    
    // Wait for remaining promises
    if (promises.length > 0) {
      await Promise.all(promises);
    }
    
    results.endTime = Date.now();
    results.duration = (results.endTime - results.startTime) / 1000;
    results.averageResponseTime = this.calculateAverageResponseTime(results.responseTimes);
    results.throughput = results.successfulRequests / results.duration;
    
    return results;
  }

  async testSingleEndpoint(endpoint, results) {
    try {
      const startTime = performance.now();
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        timeout: 10000
      });
      const endTime = performance.now();
      
      results.totalRequests++;
      results.successfulRequests++;
      results.responseTimes.push(endTime - startTime);
      
    } catch (error) {
      results.totalRequests++;
      results.failedRequests++;
    }
  }

  async testDatabaseEndpoint(test, requestCount) {
    const results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: []
    };
    
    const promises = [];
    
    for (let i = 0; i < requestCount; i++) {
      const promise = this.testSingleEndpoint(test.endpoint, results);
      promises.push(promise);
    }
    
    await Promise.all(promises);
    
    results.averageResponseTime = this.calculateAverageResponseTime(results.responseTimes);
    results.successRate = results.successfulRequests / results.totalRequests;
    
    return results;
  }

  calculateAverageResponseTime(responseTimes) {
    if (responseTimes.length === 0) return 0;
    const total = responseTimes.reduce((sum, time) => sum + time, 0);
    return total / responseTimes.length;
  }

  async generatePerformanceReport() {
    console.log('\n📊 Generating Comprehensive Performance Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      summary: {
        totalRequests: this.results.totalRequests,
        successfulRequests: this.results.successfulRequests,
        failedRequests: this.results.failedRequests,
        successRate: ((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(2) + '%',
        maxConcurrentUsers: this.results.concurrentUsers
      },
      performance: {
        baseline: this.results.baseline,
        concurrent: this.results.concurrentUsers,
        endurance: this.results.endurance,
        database: this.results.database
      },
      recommendations: this.generatePerformanceRecommendations()
    };
    
    // Save report to file
    const reportPath = path.join(__dirname, 'test-results', `load-test-report-${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Display summary
    console.log('\n🎯 LOAD TEST RESULTS SUMMARY');
    console.log('=============================');
    console.log(`Total Requests: ${report.summary.totalRequests.toLocaleString()}`);
    console.log(`Successful: ${report.summary.successfulRequests.toLocaleString()} ✅`);
    console.log(`Failed: ${report.summary.failedRequests.toLocaleString()} ❌`);
    console.log(`Success Rate: ${report.summary.successRate} 🎉`);
    console.log(`Max Concurrent Users: ${report.summary.maxConcurrentUsers} 👥`);
    console.log(`\n📁 Detailed report saved to: ${reportPath}`);
    
    // Performance insights
    if (this.results.baseline) {
      console.log(`\n⚡ PERFORMANCE INSIGHTS`);
      console.log('========================');
      console.log(`Baseline Response Time: ${this.results.baseline.averageResponseTime.toFixed(2)}ms`);
      console.log(`Baseline Throughput: ${this.results.baseline.throughput.toFixed(2)} req/sec`);
    }
    
    // Recommendations
    if (report.recommendations.length > 0) {
      console.log(`\n💡 PERFORMANCE RECOMMENDATIONS`);
      console.log('================================');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
  }

  generatePerformanceRecommendations() {
    const recommendations = [];
    
    // Analyze baseline performance
    if (this.results.baseline) {
      if (this.results.baseline.averageResponseTime > 500) {
        recommendations.push('Optimize baseline API response times - target <500ms');
      }
      
      if (this.results.baseline.throughput < 100) {
        recommendations.push('Improve baseline throughput - target >100 req/sec');
      }
    }
    
    // Analyze concurrent user performance
    if (this.results.concurrentUsers > 0) {
      if (this.results.concurrentUsers < 100) {
        recommendations.push('Improve concurrent user handling - target >100 users');
      }
    }
    
    // Analyze endurance test
    if (this.results.endurance) {
      if (this.results.endurance.failedRequests > 0) {
        recommendations.push('Address stability issues in long-running operations');
      }
    }
    
    // Database performance
    if (this.results.database) {
      const slowQueries = this.results.database.filter(db => db.averageResponseTime > 1000);
      if (slowQueries.length > 0) {
        recommendations.push('Optimize slow database queries - target <1000ms');
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance is within acceptable ranges');
    }
    
    return recommendations;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the load testing suite
if (require.main === module) {
  const loadTestSuite = new LoadTestingSuite();
  loadTestSuite.run().catch(console.error);
}

module.exports = LoadTestingSuite;
