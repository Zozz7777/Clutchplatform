const axios = require('axios');
const { performance } = require('perf_hooks');
const fs = require('fs').promises;
const path = require('path');

class RateLimitFriendlyTestingSuite {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.results = [];
    this.startTime = performance.now();
    this.requestCount = 0;
    this.rateLimitHits = 0;
    
    // Rate limiting configuration
    this.maxRequestsPerMinute = 80; // Stay under the 100 limit
    this.delayBetweenRequests = 1000; // 1 second between requests
    this.exponentialBackoffDelay = 2000; // Start with 2 seconds
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeRequest(endpoint, method = 'GET', data = null, headers = {}) {
    const startTime = performance.now();
    
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Clutch-Testing-Suite/1.0',
          ...headers
        },
        timeout: 10000
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      const responseTime = performance.now() - startTime;
      
      this.requestCount++;
      
      return {
        success: true,
        status: response.status,
        responseTime: responseTime.toFixed(2),
        data: response.data
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      if (error.response?.status === 429 || 
          error.response?.data?.error === 'RATE_LIMIT_EXCEEDED') {
        this.rateLimitHits++;
        console.log(`⚠️  Rate limit hit for ${endpoint}, implementing backoff...`);
        
        // Exponential backoff
        const backoffDelay = this.exponentialBackoffDelay * Math.pow(2, this.rateLimitHits);
        console.log(`⏳ Waiting ${backoffDelay}ms before retry...`);
        await this.delay(backoffDelay);
        
        // Retry once with backoff
        return this.makeRequest(endpoint, method, data, headers);
      }
      
      return {
        success: false,
        status: error.response?.status || 'NETWORK_ERROR',
        responseTime: responseTime.toFixed(2),
        error: error.response?.data?.message || error.message
      };
    }
  }

  async testHealthEndpoints() {
    console.log('\n🏥 Testing Health Endpoints...');
    
    const endpoints = [
      '/health',
      '/health-enhanced'
    ];

    for (const endpoint of endpoints) {
      const result = await this.makeRequest(endpoint);
      this.results.push({
        category: 'Health',
        endpoint,
        ...result
      });
      
      console.log(`  ${result.success ? '✅' : '❌'} ${endpoint}: ${result.status} (${result.responseTime}ms)`);
      
      // Respect rate limits
      await this.delay(this.delayBetweenRequests);
    }
  }

  async testAuthenticationEndpoints() {
    console.log('\n🔐 Testing Authentication Endpoints...');
    
    const endpoints = [
      { path: '/api/v1/auth/login', method: 'POST', data: { email: 'test@example.com', password: 'testpass' } },
      { path: '/api/v1/auth/register', method: 'POST', data: { email: 'newuser@example.com', password: 'newpass', name: 'Test User' } },
      { path: '/api/v1/partners-mobile/auth/login', method: 'POST', data: { email: 'partner@example.com', password: 'partnerpass' } },
      { path: '/api/v1/clutch-mobile/auth/login', method: 'POST', data: { email: 'user@example.com', password: 'userpass' } }
    ];

    for (const endpoint of endpoints) {
      const result = await this.makeRequest(endpoint.path, endpoint.method, endpoint.data);
      this.results.push({
        category: 'Authentication',
        endpoint: endpoint.path,
        method: endpoint.method,
        ...result
      });
      
      console.log(`  ${result.success ? '✅' : '❌'} ${endpoint.method} ${endpoint.path}: ${result.status} (${result.responseTime}ms)`);
      
      // Respect rate limits
      await this.delay(this.delayBetweenRequests);
    }
  }

  async testCoreAPIEndpoints() {
    console.log('\n🏗️ Testing Core API Endpoints...');
    
    const endpoints = [
      '/api/v1/dashboard/overview',
      '/api/v1/hr/employees',
      '/api/v1/crm/deals',
      '/api/v1/finance/invoices',
      '/api/v1/ai/recommendations'
    ];

    for (const endpoint of endpoints) {
      const result = await this.makeRequest(endpoint);
      this.results.push({
        category: 'Core APIs',
        endpoint,
        ...result
      });
      
      console.log(`  ${result.success ? '✅' : '❌'} ${endpoint}: ${result.status} (${result.responseTime}ms)`);
      
      // Respect rate limits
      await this.delay(this.delayBetweenRequests);
    }
  }

  async testB2BEndpoints() {
    console.log('\n🏢 Testing B2B Service Endpoints...');
    
    const endpoints = [
      '/api/v1/b2b/white-label/configurations',
      '/api/v1/b2b/api-keys',
      '/api/v1/b2b/white-label/configurations',
      '/api/v1/b2b/analytics'
    ];

    for (const endpoint of endpoints) {
      const result = await this.makeRequest(endpoint);
      this.results.push({
        category: 'B2B Services',
        endpoint,
        ...result
      });
      
      console.log(`  ${result.success ? '✅' : '❌'} ${endpoint}: ${result.status} (${result.responseTime}ms)`);
      
      // Respect rate limits
      await this.delay(this.delayBetweenRequests);
    }
  }

  async testMobileAppEndpoints() {
    console.log('\n📱 Testing Mobile App Endpoints...');
    
    const endpoints = [
      '/api/v1/partners-mobile/orders',
      '/api/v1/partners-mobile/inventory',
      '/api/v1/clutch-mobile/vehicles',
      '/api/v1/clutch-mobile/bookings',
      '/api/v1/mobile/notifications'
    ];

    for (const endpoint of endpoints) {
      const result = await this.makeRequest(endpoint);
      this.results.push({
        category: 'Mobile Apps',
        endpoint,
        ...result
      });
      
      console.log(`  ${result.success ? '✅' : '❌'} ${endpoint}: ${result.status} (${result.responseTime}ms)`);
      
      // Respect rate limits
      await this.delay(this.delayBetweenRequests);
    }
  }

  async testOBDAndCarHealthEndpoints() {
    console.log('\n🔌 Testing OBD & Car Health Endpoints...');
    
    const endpoints = [
      '/api/v1/obd/status',
      '/api/v1/obd/diagnostics',
      '/api/v1/car-health/overview',
      '/api/v1/car-health/parts',
      '/api/v1/car-health/maintenance'
    ];

    for (const endpoint of endpoints) {
      const result = await this.makeRequest(endpoint);
      this.results.push({
        category: 'OBD & Car Health',
        endpoint,
        ...result
      });
      
      console.log(`  ${result.success ? '✅' : '❌'} ${endpoint}: ${result.status} (${result.responseTime}ms)`);
      
      // Respect rate limits
      await this.delay(this.delayBetweenRequests);
    }
  }

  async generateReport() {
    const endTime = performance.now();
    const totalTime = ((endTime - this.startTime) / 1000).toFixed(2);
    
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const successRate = ((passed / this.results.length) * 100).toFixed(1);
    
    const report = {
      summary: {
        totalTests: this.results.length,
        passed,
        failed,
        successRate: `${successRate}%`,
        totalTime: `${totalTime}s`,
        requestCount: this.requestCount,
        rateLimitHits: this.rateLimitHits
      },
      results: this.results,
      timestamp: new Date().toISOString()
    };

    // Save report
    const reportDir = path.join(__dirname, 'test-results');
    await fs.mkdir(reportDir, { recursive: true });
    
    const reportPath = path.join(reportDir, `rate-limit-friendly-test-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 GENERATING COMPREHENSIVE TEST REPORT...');
    console.log('=' .repeat(50));
    console.log(`🎯 TEST RESULTS SUMMARY`);
    console.log(`========================`);
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${report.summary.successRate} 🎉`);
    console.log(`Total Time: ${report.summary.totalTime}`);
    console.log(`Requests Made: ${report.summary.requestCount}`);
    console.log(`Rate Limit Hits: ${report.summary.rateLimitHits}`);
    console.log(`\n📁 Detailed report saved to: ${reportPath}`);
    
    return report;
  }

  async runAllTests() {
    console.log('🚀 Starting Rate-Limit-Friendly Testing Suite...');
    console.log(`📍 Testing against: ${this.baseUrl}`);
    console.log(`⏱️  Delay between requests: ${this.delayBetweenRequests}ms`);
    console.log(`🔄 Max requests per minute: ${this.maxRequestsPerMinute}`);
    
    try {
      await this.testHealthEndpoints();
      await this.testAuthenticationEndpoints();
      await this.testCoreAPIEndpoints();
      await this.testB2BEndpoints();
      await this.testMobileAppEndpoints();
      await this.testOBDAndCarHealthEndpoints();
      
      const report = await this.generateReport();
      return report;
    } catch (error) {
      console.error('❌ Testing suite failed:', error.message);
      throw error;
    }
  }
}

// Run the testing suite
if (require.main === module) {
  const testingSuite = new RateLimitFriendlyTestingSuite();
  
  testingSuite.runAllTests()
    .then(() => {
      console.log('\n✅ Rate-limit-friendly testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Testing failed:', error.message);
      process.exit(1);
    });
}

module.exports = RateLimitFriendlyTestingSuite;
