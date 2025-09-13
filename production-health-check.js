/**
 * Production Health Check with Authentication
 * Comprehensive monitoring with proper auth headers
 */

const https = require('https');

class ProductionHealthCheck {
  constructor() {
    this.baseUrl = 'clutch-main-nk7x.onrender.com';
    this.authToken = 'Bearer test-token'; // Simple auth for testing
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
      memoryAlerts: [],
      performanceMetrics: []
    };
  }

  async testEndpoint(path, method = 'GET', expectedStatus = 200, requireAuth = false) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Production-Health-Check/1.0'
      };
      
      if (requireAuth) {
        headers['Authorization'] = this.authToken;
      }
      
      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: path,
        method: method,
        headers: headers
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const duration = Date.now() - startTime;
          const success = res.statusCode === expectedStatus;
          
          this.results.total++;
          if (success) {
            this.results.passed++;
            console.log(`✅ ${method} ${path} - ${res.statusCode} (${duration}ms)`);
            
            // Check for memory usage in response
            try {
              const responseData = JSON.parse(data);
              if (responseData.memoryUsage) {
                this.results.performanceMetrics.push({
                  endpoint: path,
                  memoryUsage: responseData.memoryUsage,
                  timestamp: new Date().toISOString()
                });
                
                if (responseData.memoryUsage > 90) {
                  this.results.memoryAlerts.push({
                    endpoint: path,
                    memoryUsage: responseData.memoryUsage,
                    severity: 'critical',
                    timestamp: new Date().toISOString()
                  });
                  console.log(`🚨 CRITICAL: Memory usage ${responseData.memoryUsage}% at ${path}`);
                }
              }
            } catch (e) {
              // Not JSON response, ignore
            }
          } else {
            this.results.failed++;
            console.log(`❌ ${method} ${path} - ${res.statusCode} (expected ${expectedStatus}) (${duration}ms)`);
            this.results.errors.push({
              path,
              method,
              expected: expectedStatus,
              actual: res.statusCode,
              duration,
              response: data.substring(0, 200) // First 200 chars of response
            });
          }
          
          resolve({ success, status: res.statusCode, duration, data });
        });
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

      req.setTimeout(15000, () => {
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

  async runHealthCheck() {
    console.log('🏥 Starting Production Health Check...\n');
    
    // Test public endpoints first
    const publicEndpoints = [
      { path: '/health', method: 'GET', expected: 200, auth: false },
      { path: '/health/ping', method: 'GET', expected: 200, auth: false }
    ];
    
    console.log('📡 Testing Public Endpoints...');
    for (const endpoint of publicEndpoints) {
      await this.testEndpoint(endpoint.path, endpoint.method, endpoint.expected, endpoint.auth);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Test API endpoints
    const apiEndpoints = [
      { path: '/api/v1/carParts/', method: 'GET', expected: 200, auth: false },
      { path: '/api/v1/customers/', method: 'GET', expected: 200, auth: false },
      { path: '/api/v1/featureFlags/', method: 'GET', expected: 200, auth: false },
      { path: '/api/v1/fleet/', method: 'GET', expected: 200, auth: false },
      { path: '/api/v1/performance/monitor', method: 'GET', expected: 200, auth: true }
    ];
    
    console.log('\n🔌 Testing API Endpoints...');
    for (const endpoint of apiEndpoints) {
      await this.testEndpoint(endpoint.path, endpoint.method, endpoint.expected, endpoint.auth);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Generate comprehensive report
    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 PRODUCTION HEALTH REPORT');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`);
    
    if (this.results.memoryAlerts.length > 0) {
      console.log('\n🚨 MEMORY ALERTS:');
      this.results.memoryAlerts.forEach(alert => {
        console.log(`  ${alert.endpoint}: ${alert.memoryUsage}% (${alert.severity})`);
      });
    }
    
    if (this.results.performanceMetrics.length > 0) {
      console.log('\n📈 PERFORMANCE METRICS:');
      this.results.performanceMetrics.forEach(metric => {
        console.log(`  ${metric.endpoint}: ${metric.memoryUsage}% memory`);
      });
    }
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.results.errors.forEach(error => {
        console.log(`  ${error.method} ${error.path}: ${error.actual}`);
        if (error.response) {
          console.log(`    Response: ${error.response}...`);
        }
      });
    }
    
    // Overall health assessment
    const healthScore = (this.results.passed / this.results.total) * 100;
    if (healthScore >= 90) {
      console.log('\n🎯 HEALTH STATUS: EXCELLENT ✅');
    } else if (healthScore >= 70) {
      console.log('\n⚠️ HEALTH STATUS: GOOD ⚠️');
    } else if (healthScore >= 50) {
      console.log('\n🔶 HEALTH STATUS: DEGRADED 🔶');
    } else {
      console.log('\n🚨 HEALTH STATUS: CRITICAL 🚨');
    }
    
    console.log('\n🎯 Production Health Check Complete!');
  }
}

// Run the health check
const healthCheck = new ProductionHealthCheck();
healthCheck.runHealthCheck().catch(console.error);
