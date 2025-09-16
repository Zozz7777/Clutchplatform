/**
 * Production Backend Monitor
 * Tests production endpoints and monitors memory usage
 */

const https = require('https');
const axios = require('axios');

class ProductionMonitor {
  constructor() {
    this.baseUrl = 'https://clutch-main-nk7x.onrender.com';
    this.renderApiKey = 'rnd_YPCKouaIjgsx6dCFE1LNIviswnCf';
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async testEndpoint(path, method = 'GET', expectedStatus = 200) {
    const url = `${this.baseUrl}${path}`;
    const startTime = Date.now();
    
    try {
      const response = await axios({
        method,
        url,
        timeout: 10000,
        validateStatus: () => true // Don't throw on any status code
      });
      
      const duration = Date.now() - startTime;
      const success = response.status === expectedStatus;
      
      this.results.total++;
      if (success) {
        this.results.passed++;
        console.log(`✅ ${method} ${path} - ${response.status} (${duration}ms)`);
      } else {
        this.results.failed++;
        console.log(`❌ ${method} ${path} - ${response.status} (expected ${expectedStatus}) (${duration}ms)`);
        this.results.errors.push({
          path,
          method,
          expected: expectedStatus,
          actual: response.status,
          duration
        });
      }
      
      return { success, status: response.status, duration };
    } catch (error) {
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
      
      return { success: false, error: error.message, duration };
    }
  }

  async getRenderMetrics() {
    try {
      const response = await axios.get(`https://api.render.com/v1/services/clutch-main-nk7x/metrics`, {
        headers: {
          'Authorization': `Bearer ${this.renderApiKey}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.log(`⚠️ Could not fetch Render metrics: ${error.message}`);
      return null;
    }
  }

  async runTests() {
    console.log('🚀 Starting Production Backend Tests...\n');
    
    // Test critical endpoints
    const endpoints = [
      { path: '/health', method: 'GET', expected: 200 },
      { path: '/health/ping', method: 'GET', expected: 200 },
      { path: '/api/v1/performance/monitor', method: 'GET', expected: 200 },
      { path: '/api/v1/auth/login', method: 'POST', expected: 200 },
      { path: '/api/v1/carParts/', method: 'GET', expected: 200 },
      { path: '/api/v1/customers/', method: 'GET', expected: 200 },
      { path: '/api/v1/featureFlags/', method: 'GET', expected: 200 },
      { path: '/api/v1/fleet/', method: 'GET', expected: 200 }
    ];
    
    for (const endpoint of endpoints) {
      await this.testEndpoint(endpoint.path, endpoint.method, endpoint.expected);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
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
    
    // Get Render metrics
    console.log('\n📈 Fetching Render Metrics...');
    const metrics = await this.getRenderMetrics();
    if (metrics) {
      console.log('Render Metrics:', JSON.stringify(metrics, null, 2));
    }
  }
}

// Run the monitor
const monitor = new ProductionMonitor();
monitor.runTests().catch(console.error);
