const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

// ==================== LOAD TESTING SUITE ====================

class LoadTester {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:5000';
    this.concurrency = options.concurrency || 10;
    this.duration = options.duration || 60000; // 1 minute
    this.rampUpTime = options.rampUpTime || 10000; // 10 seconds
    this.results = {
      requests: [],
      errors: [],
      responseTimes: [],
      throughput: 0,
      errorRate: 0,
      avgResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0
    };
    this.isRunning = false;
    this.startTime = null;
    this.endTime = null;
  }

  // Run load test
  async runLoadTest(testScenarios = []) {
    console.log('🚀 Starting load test...');
    console.log(`📊 Configuration: ${this.concurrency} concurrent users, ${this.duration}ms duration`);
    
    this.isRunning = true;
    this.startTime = Date.now();
    this.endTime = this.startTime + this.duration;

    // Default test scenarios if none provided
    if (testScenarios.length === 0) {
      testScenarios = this.getDefaultTestScenarios();
    }

    // Start concurrent users
    const promises = [];
    for (let i = 0; i < this.concurrency; i++) {
      promises.push(this.runUserSession(testScenarios, i));
    }

    // Wait for all users to complete
    await Promise.all(promises);

    this.isRunning = false;
    this.calculateResults();
    this.printResults();
    
    return this.results;
  }

  // Run a single user session
  async runUserSession(testScenarios, userId) {
    const userStartTime = Date.now() + (userId * (this.rampUpTime / this.concurrency));
    
    // Wait for ramp-up
    if (userStartTime > Date.now()) {
      await this.sleep(userStartTime - Date.now());
    }

    while (this.isRunning && Date.now() < this.endTime) {
      // Select random test scenario
      const scenario = testScenarios[Math.floor(Math.random() * testScenarios.length)];
      
      try {
        await this.executeScenario(scenario, userId);
      } catch (error) {
        this.results.errors.push({
          userId,
          scenario: scenario.name,
          error: error.message,
          timestamp: new Date()
        });
      }

      // Random delay between requests (1-3 seconds)
      await this.sleep(Math.random() * 2000 + 1000);
    }
  }

  // Execute a test scenario
  async executeScenario(scenario, userId) {
    const startTime = performance.now();
    
    try {
      const response = await this.makeRequest(scenario);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      this.results.requests.push({
        userId,
        scenario: scenario.name,
        method: scenario.method,
        url: scenario.url,
        statusCode: response.statusCode,
        responseTime,
        timestamp: new Date()
      });

      this.results.responseTimes.push(responseTime);

      // Validate response
      if (scenario.validator) {
        scenario.validator(response);
      }

    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      this.results.errors.push({
        userId,
        scenario: scenario.name,
        method: scenario.method,
        url: scenario.url,
        error: error.message,
        responseTime,
        timestamp: new Date()
      });
    }
  }

  // Make HTTP request
  makeRequest(scenario) {
    return new Promise((resolve, reject) => {
      const url = new URL(scenario.url, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: scenario.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LoadTester/1.0',
          ...scenario.headers
        },
        timeout: scenario.timeout || 30000
      };

      const client = url.protocol === 'https:' ? https : http;
      const req = client.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            responseTime: 0 // Will be calculated by caller
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      // Send request body if provided
      if (scenario.body) {
        req.write(JSON.stringify(scenario.body));
      }

      req.end();
    });
  }

  // Get default test scenarios
  getDefaultTestScenarios() {
    return [
      {
        name: 'health_check',
        method: 'GET',
        url: '/health/ping',
        validator: (response) => {
          if (response.statusCode !== 200) {
            throw new Error(`Expected status 200, got ${response.statusCode}`);
          }
        }
      },
      {
        name: 'health_detailed',
        method: 'GET',
        url: '/health',
        validator: (response) => {
          if (response.statusCode !== 200) {
            throw new Error(`Expected status 200, got ${response.statusCode}`);
          }
        }
      },
      {
        name: 'auth_login',
        method: 'POST',
        url: '/auth/employee-login',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          email: 'test@example.com',
          password: 'testpassword'
        },
        validator: (response) => {
          if (response.statusCode !== 200 && response.statusCode !== 401) {
            throw new Error(`Expected status 200 or 401, got ${response.statusCode}`);
          }
        }
      },
      {
        name: 'auto_parts_inventory',
        method: 'GET',
        url: '/api/v1/auto-parts/inventory',
        headers: {
          'Authorization': 'Bearer test-token'
        },
        validator: (response) => {
          if (response.statusCode !== 200 && response.statusCode !== 401) {
            throw new Error(`Expected status 200 or 401, got ${response.statusCode}`);
          }
        }
      },
      {
        name: 'knowledge_base_articles',
        method: 'GET',
        url: '/api/v1/knowledge-base/articles',
        headers: {
          'Authorization': 'Bearer test-token'
        },
        validator: (response) => {
          if (response.statusCode !== 200 && response.statusCode !== 401) {
            throw new Error(`Expected status 200 or 401, got ${response.statusCode}`);
          }
        }
      },
      {
        name: 'incidents_list',
        method: 'GET',
        url: '/api/v1/incidents',
        headers: {
          'Authorization': 'Bearer test-token'
        },
        validator: (response) => {
          if (response.statusCode !== 200 && response.statusCode !== 401) {
            throw new Error(`Expected status 200 or 401, got ${response.statusCode}`);
          }
        }
      },
      {
        name: 'performance_monitor',
        method: 'GET',
        url: '/api/v1/performance/monitor',
        headers: {
          'Authorization': 'Bearer test-token'
        },
        validator: (response) => {
          if (response.statusCode !== 200 && response.statusCode !== 401) {
            throw new Error(`Expected status 200 or 401, got ${response.statusCode}`);
          }
        }
      }
    ];
  }

  // Calculate test results
  calculateResults() {
    const totalRequests = this.results.requests.length;
    const totalErrors = this.results.errors.length;
    const totalTime = this.endTime - this.startTime;

    // Throughput (requests per second)
    this.results.throughput = Math.round((totalRequests / totalTime) * 1000);

    // Error rate
    this.results.errorRate = totalRequests > 0 ? 
      Math.round((totalErrors / (totalRequests + totalErrors)) * 100) : 0;

    // Response time statistics
    if (this.results.responseTimes.length > 0) {
      const sortedTimes = this.results.responseTimes.sort((a, b) => a - b);
      
      this.results.avgResponseTime = Math.round(
        sortedTimes.reduce((a, b) => a + b, 0) / sortedTimes.length
      );
      
      this.results.p95ResponseTime = Math.round(
        sortedTimes[Math.floor(sortedTimes.length * 0.95)]
      );
      
      this.results.p99ResponseTime = Math.round(
        sortedTimes[Math.floor(sortedTimes.length * 0.99)]
      );
    }
  }

  // Print test results
  printResults() {
    console.log('\n📊 LOAD TEST RESULTS');
    console.log('==================');
    console.log(`⏱️  Duration: ${Math.round((this.endTime - this.startTime) / 1000)}s`);
    console.log(`👥 Concurrent Users: ${this.concurrency}`);
    console.log(`📈 Total Requests: ${this.results.requests.length}`);
    console.log(`❌ Total Errors: ${this.results.errors.length}`);
    console.log(`🚀 Throughput: ${this.results.throughput} req/s`);
    console.log(`📊 Error Rate: ${this.results.errorRate}%`);
    console.log(`⏱️  Avg Response Time: ${this.results.avgResponseTime}ms`);
    console.log(`📈 95th Percentile: ${this.results.p95ResponseTime}ms`);
    console.log(`📈 99th Percentile: ${this.results.p99ResponseTime}ms`);
    
    // Performance assessment
    console.log('\n🎯 PERFORMANCE ASSESSMENT');
    console.log('========================');
    
    if (this.results.avgResponseTime < 200) {
      console.log('✅ Response Time: EXCELLENT (<200ms)');
    } else if (this.results.avgResponseTime < 500) {
      console.log('✅ Response Time: GOOD (<500ms)');
    } else if (this.results.avgResponseTime < 1000) {
      console.log('⚠️  Response Time: ACCEPTABLE (<1000ms)');
    } else {
      console.log('❌ Response Time: POOR (>1000ms)');
    }
    
    if (this.results.errorRate < 1) {
      console.log('✅ Error Rate: EXCELLENT (<1%)');
    } else if (this.results.errorRate < 5) {
      console.log('✅ Error Rate: GOOD (<5%)');
    } else if (this.results.errorRate < 10) {
      console.log('⚠️  Error Rate: ACCEPTABLE (<10%)');
    } else {
      console.log('❌ Error Rate: POOR (>10%)');
    }
    
    if (this.results.throughput > 100) {
      console.log('✅ Throughput: EXCELLENT (>100 req/s)');
    } else if (this.results.throughput > 50) {
      console.log('✅ Throughput: GOOD (>50 req/s)');
    } else if (this.results.throughput > 20) {
      console.log('⚠️  Throughput: ACCEPTABLE (>20 req/s)');
    } else {
      console.log('❌ Error Rate: POOR (<20 req/s)');
    }

    // Recommendations
    console.log('\n💡 OPTIMIZATION RECOMMENDATIONS');
    console.log('===============================');
    
    if (this.results.avgResponseTime > 500) {
      console.log('🔧 Consider implementing response caching');
      console.log('🔧 Optimize database queries');
      console.log('🔧 Enable response compression');
    }
    
    if (this.results.errorRate > 5) {
      console.log('🔧 Review error handling and logging');
      console.log('🔧 Check database connection limits');
      console.log('🔧 Verify API endpoint implementations');
    }
    
    if (this.results.throughput < 50) {
      console.log('🔧 Consider horizontal scaling');
      console.log('🔧 Optimize middleware stack');
      console.log('🔧 Implement connection pooling');
    }
  }

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate performance report
  generateReport() {
    return {
      summary: {
        duration: this.endTime - this.startTime,
        concurrentUsers: this.concurrency,
        totalRequests: this.results.requests.length,
        totalErrors: this.results.errors.length,
        throughput: this.results.throughput,
        errorRate: this.results.errorRate,
        avgResponseTime: this.results.avgResponseTime,
        p95ResponseTime: this.results.p95ResponseTime,
        p99ResponseTime: this.results.p99ResponseTime
      },
      performance: {
        responseTime: this.results.avgResponseTime < 200 ? 'excellent' : 
                     this.results.avgResponseTime < 500 ? 'good' : 
                     this.results.avgResponseTime < 1000 ? 'acceptable' : 'poor',
        errorRate: this.results.errorRate < 1 ? 'excellent' : 
                  this.results.errorRate < 5 ? 'good' : 
                  this.results.errorRate < 10 ? 'acceptable' : 'poor',
        throughput: this.results.throughput > 100 ? 'excellent' : 
                   this.results.throughput > 50 ? 'good' : 
                   this.results.throughput > 20 ? 'acceptable' : 'poor'
      },
      recommendations: this.getOptimizationRecommendations(),
      timestamp: new Date().toISOString()
    };
  }

  // Get optimization recommendations
  getOptimizationRecommendations() {
    const recommendations = [];
    
    if (this.results.avgResponseTime > 500) {
      recommendations.push('Implement response caching');
      recommendations.push('Optimize database queries');
      recommendations.push('Enable response compression');
    }
    
    if (this.results.errorRate > 5) {
      recommendations.push('Review error handling');
      recommendations.push('Check database connections');
      recommendations.push('Verify API implementations');
    }
    
    if (this.results.throughput < 50) {
      recommendations.push('Consider horizontal scaling');
      recommendations.push('Optimize middleware stack');
      recommendations.push('Implement connection pooling');
    }
    
    return recommendations;
  }
}

// Export for use in other modules
module.exports = {
  LoadTester,
  runLoadTest: (options, scenarios) => {
    const tester = new LoadTester(options);
    return tester.runLoadTest(scenarios);
  }
};
