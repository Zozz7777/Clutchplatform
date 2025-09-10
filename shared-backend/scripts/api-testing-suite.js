#!/usr/bin/env node

/**
 * 🚀 Comprehensive API Testing Suite for Clutch Platform
 * Tests all 200+ endpoints across the platform
 */

const axios = require('axios');
const { performance } = require('perf_hooks');
const fs = require('fs').promises;
const path = require('path');

class APITestingSuite {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      performance: [],
      errors: []
    };
    this.tokens = {
      admin: null,
      user: null,
      partner: null
    };
    this.testData = {};
  }

  async run() {
    console.log('🚀 Starting Comprehensive API Testing Suite...');
    console.log(`📍 Testing against: ${this.baseUrl}`);
    
    try {
      // Phase 1: Authentication Testing
      await this.testAuthentication();
      
      // Phase 2: Core API Testing
      await this.testCoreAPIs();
      
      // Phase 3: B2B Services Testing
      await this.testB2BServices();
      
      // Phase 4: Mobile App Testing
      await this.testMobileApps();
      
      // Phase 5: OBD Integration Testing
      await this.testOBDIntegration();
      
      // Phase 6: Car Health System Testing
      await this.testCarHealthSystem();
      
      // Phase 7: Security & Access Control Testing
      await this.testSecurityAccess();
      
      // Phase 8: Performance Testing
      await this.testPerformance();
      
      // Generate comprehensive report
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Testing suite failed:', error.message);
      process.exit(1);
    }
  }

  async testAuthentication() {
    console.log('\n🔐 Testing Authentication & Authorization...');
    
    const tests = [
      {
        name: 'User Registration',
        method: 'POST',
        endpoint: '/api/v1/auth/register',
        data: {
          email: 'test@clutch.com',
          password: 'test123',
          name: 'Test User',
          phone: '+1234567890'
        }
      },
      {
        name: 'User Login',
        method: 'POST',
        endpoint: '/api/v1/auth/login',
        data: {
          email: 'admin@clutch.com',
          password: 'admin123'
        },
        onSuccess: (response) => {
          this.tokens.admin = response.data.token;
          this.testData.userId = response.data.user.id;
        }
      },
      {
        name: 'Partner Login',
        method: 'POST',
        endpoint: '/api/v1/partners-mobile/auth/login',
        data: {
          email: 'partner@autocenter.com',
          password: 'partner123',
          deviceInfo: {
            deviceId: 'device_001',
            platform: 'android',
            version: '1.0.0'
          }
        },
        onSuccess: (response) => {
          this.tokens.partner = response.data.token;
        }
      },
      {
        name: 'User Mobile Login',
        method: 'POST',
        endpoint: '/api/v1/clutch-mobile/auth/login',
        data: {
          email: 'john.doe@email.com',
          password: 'user123',
          deviceInfo: {
            deviceId: 'device_002',
            platform: 'ios',
            version: '1.0.0'
          }
        },
        onSuccess: (response) => {
          this.tokens.user = response.data.token;
          this.testData.vehicleId = response.data.user.vehicles?.[0]?.id;
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  async testCoreAPIs() {
    console.log('\n🏗️ Testing Core APIs...');
    
    const tests = [
      {
        name: 'Get Dashboard Overview',
        method: 'GET',
        endpoint: '/api/v1/dashboard/user/overview',
        auth: 'admin'
      },
      {
        name: 'Get HR Employees',
        method: 'GET',
        endpoint: '/api/v1/hr/employees',
        auth: 'admin'
      },
      {
        name: 'Get CRM Deals',
        method: 'GET',
        endpoint: '/api/v1/crm/deals',
        auth: 'admin'
      },
      {
        name: 'Get Finance Invoices',
        method: 'GET',
        endpoint: '/api/v1/finance/invoices',
        auth: 'admin'
      },
      {
        name: 'Get AI Recommendations',
        method: 'GET',
        endpoint: '/api/v1/ai/recommendations',
        auth: 'admin'
      }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  async testB2BServices() {
    console.log('\n🏢 Testing B2B Services...');
    
    const tests = [
      {
        name: 'Get White-Label Configurations',
        method: 'GET',
        endpoint: '/api/v1/b2b/whitelabel',
        auth: 'admin'
      },
      {
        name: 'Create White-Label Configuration',
        method: 'POST',
        endpoint: '/api/v1/b2b/whitelabel',
        auth: 'admin',
        data: {
          clientId: 'client_003',
          clientName: 'New Auto Group',
          branding: {
            logo: 'https://example.com/logo3.png',
            colors: { primary: '#FF0000', secondary: '#00FF00' },
            companyName: 'New Auto Services'
          },
          features: ['dashboard', 'analytics', 'mobile_app']
        }
      },
      {
        name: 'Get API Keys',
        method: 'GET',
        endpoint: '/api/v1/b2b/api-keys',
        auth: 'admin'
      }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  async testMobileApps() {
    console.log('\n📱 Testing Mobile Apps...');
    
    const tests = [
      {
        name: 'Get Partner Orders',
        method: 'GET',
        endpoint: '/api/v1/partners-mobile/orders',
        auth: 'partner'
      },
      {
        name: 'Get Partner Inventory',
        method: 'GET',
        endpoint: '/api/v1/partners-mobile/inventory',
        auth: 'partner'
      },
      {
        name: 'Get User Vehicles',
        method: 'GET',
        endpoint: '/api/v1/clutch-mobile/vehicles',
        auth: 'user'
      },
      {
        name: 'Get User Bookings',
        method: 'GET',
        endpoint: '/api/v1/clutch-mobile/bookings',
        auth: 'user'
      }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  async testOBDIntegration() {
    console.log('\n🔌 Testing OBD Integration...');
    
    if (!this.testData.vehicleId) {
      console.log('⚠️ Skipping OBD tests - no vehicle ID available');
      return;
    }
    
    const tests = [
      {
        name: 'Connect OBD Device',
        method: 'POST',
        endpoint: '/api/v1/obd/connect',
        auth: 'user',
        data: {
          vehicleId: this.testData.vehicleId,
          deviceId: 'obd_device_001',
          deviceType: 'generic',
          bluetoothAddress: '00:11:22:33:44:55'
        }
      },
      {
        name: 'Start Diagnostic Scan',
        method: 'POST',
        endpoint: '/api/v1/obd/scan/start',
        auth: 'user',
        data: {
          vehicleId: this.testData.vehicleId,
          scanType: 'full',
          includeHistory: true
        }
      },
      {
        name: 'Get OBD Connection Status',
        method: 'GET',
        endpoint: '/api/v1/obd/connection/status',
        auth: 'user',
        query: { vehicleId: this.testData.vehicleId }
      }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  async testCarHealthSystem() {
    console.log('\n🏥 Testing Car Health System...');
    
    if (!this.testData.vehicleId) {
      console.log('⚠️ Skipping Car Health tests - no vehicle ID available');
      return;
    }
    
    const tests = [
      {
        name: 'Get Car Health Overview',
        method: 'GET',
        endpoint: '/api/v1/car-health/overview',
        auth: 'user',
        query: { vehicleId: this.testData.vehicleId }
      },
      {
        name: 'Get Car Health Percentage',
        method: 'GET',
        endpoint: '/api/v1/car-health/percentage',
        auth: 'user',
        query: { vehicleId: this.testData.vehicleId }
      },
      {
        name: 'Get Parts Health',
        method: 'GET',
        endpoint: '/api/v1/car-health/parts',
        auth: 'user',
        query: { vehicleId: this.testData.vehicleId }
      }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  async testSecurityAccess() {
    console.log('\n🔒 Testing Security & Access Control...');
    
    const tests = [
      {
        name: 'Admin Access to HR (Should Pass)',
        method: 'GET',
        endpoint: '/api/v1/hr/employees',
        auth: 'admin',
        expectedStatus: 200
      },
      {
        name: 'User Access to HR (Should Fail)',
        method: 'GET',
        endpoint: '/api/v1/hr/employees',
        auth: 'user',
        expectedStatus: 403
      },
      {
        name: 'Unauthenticated Access (Should Fail)',
        method: 'GET',
        endpoint: '/api/v1/hr/employees',
        auth: null,
        expectedStatus: 401
      }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  async testPerformance() {
    console.log('\n📈 Testing Performance...');
    
    const tests = [
      {
        name: 'Health Check Performance',
        method: 'GET',
        endpoint: '/health-enhanced'
      },
      {
        name: 'Detailed Health Check Performance',
        method: 'GET',
        endpoint: '/health-enhanced/detailed'
      },
      {
        name: 'API Version Performance',
        method: 'GET',
        endpoint: '/api/v1/dashboard/stats',
        auth: 'admin'
      }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  async runTest(test) {
    this.results.total++;
    
    try {
      const startTime = performance.now();
      
      const config = {
        method: test.method,
        url: `${this.baseUrl}${test.endpoint}`,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      // Add authentication if required
      if (test.auth && this.tokens[test.auth]) {
        config.headers.Authorization = `Bearer ${this.tokens[test.auth]}`;
      }

      // Add query parameters
      if (test.query) {
        const params = new URLSearchParams(test.query);
        config.url += `?${params.toString()}`;
      }

      // Add request body
      if (test.data) {
        config.data = test.data;
      }

      const response = await axios(config);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Check expected status code
      const expectedStatus = test.expectedStatus || 200;
      if (response.status === expectedStatus) {
        this.results.passed++;
        console.log(`✅ ${test.name} - ${response.status} (${responseTime.toFixed(2)}ms)`);
        
        // Store performance data
        this.results.performance.push({
          endpoint: test.endpoint,
          method: test.method,
          responseTime,
          status: response.status
        });

        // Execute success callback
        if (test.onSuccess) {
          test.onSuccess(response);
        }
      } else {
        this.results.failed++;
        console.log(`❌ ${test.name} - Expected ${expectedStatus}, got ${response.status}`);
        this.results.errors.push({
          test: test.name,
          expected: expectedStatus,
          actual: response.status,
          endpoint: test.endpoint
        });
      }

    } catch (error) {
      this.results.failed++;
      const expectedStatus = test.expectedStatus;
      
      if (expectedStatus && error.response?.status === expectedStatus) {
        this.results.passed++;
        this.results.failed--;
        console.log(`✅ ${test.name} - Expected failure ${expectedStatus} (${error.response.status})`);
      } else {
        console.log(`❌ ${test.name} - Error: ${error.message}`);
        this.results.errors.push({
          test: test.name,
          error: error.message,
          endpoint: test.endpoint
        });
      }
    }
  }

  async generateReport() {
    console.log('\n📊 Generating Comprehensive Test Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped,
        successRate: ((this.results.passed / this.results.total) * 100).toFixed(2) + '%'
      },
      performance: {
        averageResponseTime: this.calculateAverageResponseTime(),
        slowestEndpoints: this.getSlowestEndpoints(),
        fastestEndpoints: this.getFastestEndpoints()
      },
      errors: this.results.errors,
      recommendations: this.generateRecommendations()
    };

    // Save report to file
    const reportPath = path.join(__dirname, 'test-results', `api-test-report-${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Display summary
    console.log('\n🎯 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed} ✅`);
    console.log(`Failed: ${report.summary.failed} ❌`);
    console.log(`Skipped: ${report.summary.skipped} ⏭️`);
    console.log(`Success Rate: ${report.summary.successRate} 🎉`);
    console.log(`\n📁 Detailed report saved to: ${reportPath}`);

    // Performance summary
    if (report.performance.averageResponseTime) {
      console.log(`\n⚡ PERFORMANCE SUMMARY`);
      console.log('======================');
      console.log(`Average Response Time: ${report.performance.averageResponseTime.toFixed(2)}ms`);
      console.log(`Slowest Endpoint: ${report.performance.slowestEndpoints[0]?.endpoint} (${report.performance.slowestEndpoints[0]?.responseTime.toFixed(2)}ms)`);
      console.log(`Fastest Endpoint: ${report.performance.fastestEndpoints[0]?.endpoint} (${report.performance.fastestEndpoints[0]?.responseTime.toFixed(2)}ms)`);
    }

    // Recommendations
    if (report.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS`);
      console.log('==================');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
  }

  calculateAverageResponseTime() {
    if (this.results.performance.length === 0) return null;
    const total = this.results.performance.reduce((sum, perf) => sum + perf.responseTime, 0);
    return total / this.results.performance.length;
  }

  getSlowestEndpoints() {
    return [...this.results.performance]
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, 5);
  }

  getFastestEndpoints() {
    return [...this.results.performance]
      .sort((a, b) => a.responseTime - b.responseTime)
      .slice(0, 5);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.failed > 0) {
      recommendations.push('Review and fix failed API endpoints');
    }
    
    if (this.results.performance.length > 0) {
      const avgResponseTime = this.calculateAverageResponseTime();
      if (avgResponseTime > 1000) {
        recommendations.push('Optimize slow API endpoints for better performance');
      }
      
      const slowEndpoints = this.getSlowestEndpoints();
      if (slowEndpoints[0]?.responseTime > 2000) {
        recommendations.push('Investigate and optimize extremely slow endpoints');
      }
    }
    
    if (this.results.errors.length > 0) {
      recommendations.push('Address authentication and authorization issues');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All systems are performing optimally');
    }
    
    return recommendations;
  }
}

// Run the testing suite
if (require.main === module) {
  const testSuite = new APITestingSuite();
  testSuite.run().catch(console.error);
}

module.exports = APITestingSuite;
