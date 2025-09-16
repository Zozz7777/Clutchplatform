/**
 * Simple Production Backend Monitor
 * Tests production endpoints using built-in Node.js modules
 */

const https = require('https');

class SimpleProductionMonitor {
  constructor() {
    this.baseUrl = 'clutch-main-nk7x.onrender.com';
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async testEndpoint(path, method = 'GET', expectedStatus = 200) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Production-Monitor/1.0'
        }
      };

      const req = https.request(options, (res) => {
        const duration = Date.now() - startTime;
        const success = res.statusCode === expectedStatus;
        
        this.results.total++;
        if (success) {
          this.results.passed++;
          console.log(`✅ ${method} ${path} - ${res.statusCode} (${duration}ms)`);
        } else {
          this.results.failed++;
          console.log(`❌ ${method} ${path} - ${res.statusCode} (expected ${expectedStatus}) (${duration}ms)`);
          this.results.errors.push({
            path,
            method,
            expected: expectedStatus,
            actual: res.statusCode,
            duration
          });
        }
        
        resolve({ success, status: res.statusCode, duration });
      });

      req.on('error', (error) => {
        const duration = Date.now() - startTime;
        this.results.total++;
        this.results.failed++;
        console.log(`❌ ${method} ${path} - ERROR: ${error.message} (${duration}ms)`);
        this.results.errors.push({
          path,
          method,
          expected: expectedStatus,
          actual: 'ERROR',
          error: error.message,
          duration
        });
        
        resolve({ success: false, error: error.message, duration });
      });

      req.setTimeout(10000, () => {
        req.destroy();
        const duration = Date.now() - startTime;
        this.results.total++;
        this.results.failed++;
        console.log(`❌ ${method} ${path} - TIMEOUT (${duration}ms)`);
        this.results.errors.push({
          path,
          method,
          expected: expectedStatus,
          actual: 'TIMEOUT',
          error: 'Request timeout',
          duration
        });
        
        resolve({ success: false, error: 'Request timeout', duration });
      });

      req.end();
    });
  }

  async runTests() {
    console.log('🚀 Starting Production Backend Tests...\n');
    
    // Test critical endpoints
    const endpoints = [
      { path: '/health', method: 'GET', expected: 200 },
      { path: '/health/ping', method: 'GET', expected: 200 },
      { path: '/api/v1/performance/monitor', method: 'GET', expected: 200 },
      { path: '/api/v1/carParts/', method: 'GET', expected: 200 },
      { path: '/api/v1/customers/', method: 'GET', expected: 200 },
      { path: '/api/v1/featureFlags/', method: 'GET', expected: 200 },
      { path: '/api/v1/fleet/', method: 'GET', expected: 200 }
    ];
    
    for (const endpoint of endpoints) {
      await this.testEndpoint(endpoint.path, endpoint.method, endpoint.expected);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n📊 Test Results:');
    console.log(`Total: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.results.errors.forEach(error => {
        console.log(`  ${error.method} ${error.path}: ${error.actual} (expected ${error.expected})`);
      });
    }
    
    console.log('\n🎯 Production Backend Test Complete!');
  }
}

// Run the monitor
const monitor = new SimpleProductionMonitor();
monitor.runTests().catch(console.error);
