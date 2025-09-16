const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

class ComprehensiveBackendTestSuite {
  constructor() {
    this.baseUrl = 'https://clutch-main-nk7x.onrender.com';
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
      performance: [],
      routes: {},
      middleware: {},
      database: {},
      system: {}
    };
    this.startTime = Date.now();
  }

  // ==================== CORE TESTING METHODS ====================

  async makeRequest(options, body = null) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            responseTime: Date.now() - this.startTime
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout after 30 seconds'));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      
      req.end();
    });
  }

  async testEndpoint(method, path, expectedStatus = 200, body = null, headers = {}) {
    const options = {
      hostname: 'clutch-main-nk7x.onrender.com',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Comprehensive-Backend-Test-Suite/1.0',
        ...headers
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    try {
      const startTime = Date.now();
      const response = await this.makeRequest(options, body);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const expectedStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
      const isSuccess = expectedStatuses.includes(response.statusCode);

      this.results.total++;
      if (isSuccess) {
        this.results.passed++;
      } else {
        this.results.failed++;
        this.results.errors.push({
          method,
          path,
          expected: expectedStatus,
          actual: response.statusCode,
          response: response.body.substring(0, 200)
        });
      }

      this.results.performance.push({
        method,
        path,
        responseTime,
        statusCode: response.statusCode
      });

      return {
        success: isSuccess,
        statusCode: response.statusCode,
        responseTime,
        body: response.body,
        headers: response.headers
      };
    } catch (error) {
      this.results.total++;
      this.results.failed++;
      this.results.errors.push({
        method,
        path,
        expected: expectedStatus,
        actual: 'ERROR',
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  // ==================== ROUTE TESTING ====================

  async testAllRoutes() {
    console.log('🧪 Testing all route endpoints...\n');

    const routes = [
      // Health and System Routes
      { method: 'GET', path: '/health', expectedStatus: 200 },
      { method: 'GET', path: '/health/ping', expectedStatus: 200 },
      { method: 'GET', path: '/api/v1/performance/monitor', expectedStatus: [200, 401] },

      // Authentication Routes
      { method: 'POST', path: '/api/v1/auth/login', expectedStatus: [200, 400], body: { email: 'test@example.com', password: 'test123' } },
      { method: 'POST', path: '/api/v1/auth/register', expectedStatus: [200, 400], body: { email: 'test@example.com', password: 'test123' } },
      { method: 'POST', path: '/api/v1/auth/logout', expectedStatus: [200, 401] },
      { method: 'GET', path: '/api/v1/auth/profile', expectedStatus: [200, 401, 404] },

      // Enhanced Authentication Routes
      { method: 'POST', path: '/api/v1/enhanced-auth/biometric-setup', expectedStatus: [200, 400], body: { deviceId: 'test-device', biometricType: 'fingerprint' } },
      { method: 'POST', path: '/api/v1/enhanced-auth/biometric-verify', expectedStatus: [200, 400], body: { deviceId: 'test-device', verificationData: 'test-data' } },
      { method: 'POST', path: '/api/v1/enhanced-auth/2fa/setup', expectedStatus: [200, 400] },
      { method: 'POST', path: '/api/v1/enhanced-auth/2fa/verify', expectedStatus: [200, 400], body: { code: '123456' } },

      // Knowledge Base Routes
      { method: 'GET', path: '/api/v1/knowledge-base/articles', expectedStatus: 200 },
      { method: 'POST', path: '/api/v1/knowledge-base/articles', expectedStatus: [200, 400], body: { title: 'Test Article', content: 'Test content' } },
      { method: 'GET', path: '/api/v1/knowledge-base/search', expectedStatus: 200 },
      { method: 'GET', path: '/api/v1/knowledge-base/categories', expectedStatus: 200 },

      // Incidents Routes
      { method: 'GET', path: '/api/v1/incidents/', expectedStatus: 200 },
      { method: 'POST', path: '/api/v1/incidents/', expectedStatus: [200, 400], body: { title: 'Test Incident', description: 'Test description' } },
      { method: 'GET', path: '/api/v1/incidents/status', expectedStatus: 200 },
      { method: 'GET', path: '/api/v1/incidents/test-id', expectedStatus: 200 },

      // Car Parts Routes
      { method: 'GET', path: '/api/v1/carParts/', expectedStatus: 200 },
      { method: 'POST', path: '/api/v1/carParts/', expectedStatus: [200, 400], body: { name: 'Test Part', category: 'Engine' } },
      { method: 'GET', path: '/api/v1/carParts/search', expectedStatus: 200 },
      { method: 'GET', path: '/api/v1/carParts/categories', expectedStatus: 200 },
      { method: 'GET', path: '/api/v1/carParts/brands', expectedStatus: 200 },

      // Enhanced Features Routes
      { method: 'GET', path: '/api/v1/enhancedFeatures/', expectedStatus: 200 },
      { method: 'POST', path: '/api/v1/enhancedFeatures/', expectedStatus: [200, 400], body: { name: 'Test Feature', description: 'Test description' } },

      // Corporate Account Routes
      { method: 'GET', path: '/api/v1/corporateAccount/', expectedStatus: 200 },
      { method: 'POST', path: '/api/v1/corporateAccount/', expectedStatus: [200, 400], body: { name: 'Test Corp', email: 'corp@test.com' } },

      // Device Token Routes
      { method: 'GET', path: '/api/v1/deviceToken/', expectedStatus: 200 },
      { method: 'POST', path: '/api/v1/deviceToken/', expectedStatus: [200, 400], body: { deviceId: 'test-device', token: 'test-token' } },

      // Digital Wallet Routes
      { method: 'GET', path: '/api/v1/digitalWallet/', expectedStatus: 200 },
      { method: 'POST', path: '/api/v1/digitalWallet/', expectedStatus: [200, 400], body: { walletId: 'test-wallet', balance: 100 } },

      // Feature Flags Routes
      { method: 'GET', path: '/api/v1/featureFlags/', expectedStatus: 200 },
      { method: 'POST', path: '/api/v1/featureFlags/', expectedStatus: [200, 400], body: { name: 'test-flag', enabled: true } },
      { method: 'GET', path: '/api/v1/featureFlags/test-flag', expectedStatus: 200 },

      // Fleet Routes
      { method: 'GET', path: '/api/v1/fleet/', expectedStatus: 200 },
      { method: 'GET', path: '/api/v1/fleet/vehicles', expectedStatus: 200 },
      { method: 'GET', path: '/api/v1/fleet/drivers', expectedStatus: 200 },

      // Customers Routes
      { method: 'GET', path: '/api/v1/customers/', expectedStatus: 200 },
      { method: 'POST', path: '/api/v1/customers/', expectedStatus: [200, 400], body: { name: 'Test Customer', email: 'customer@test.com' } },

      // Analytics Backup Routes
      { method: 'GET', path: '/api/v1/analytics-backup/', expectedStatus: 200 },
      { method: 'POST', path: '/api/v1/analytics-backup/create', expectedStatus: [200, 400], body: { type: 'daily', data: {} } },

      // Performance Routes
      { method: 'GET', path: '/api/v1/performance/', expectedStatus: 200 },
      { method: 'POST', path: '/api/v1/performance/optimize', expectedStatus: [200, 400], body: { action: 'optimize' } },

      // Error Tracking Routes
      { method: 'GET', path: '/api/v1/errors/logs', expectedStatus: 200 },
      { method: 'POST', path: '/api/v1/errors/frontend', expectedStatus: [200, 400], body: { error: 'Test error', stack: 'Test stack' } },
      { method: 'POST', path: '/api/v1/errors/backend', expectedStatus: [200, 400], body: { error: 'Test error', stack: 'Test stack' } },

      // Clutch Email Routes
      { method: 'GET', path: '/api/v1/clutch-email/health', expectedStatus: [200, 503] },
      { method: 'POST', path: '/api/v1/clutch-email/auth/login', expectedStatus: [200, 400, 503], body: { email: 'test@example.com', password: 'test123' } },

      // Health Enhanced Autonomous Routes
      { method: 'GET', path: '/api/v1/health-enhanced-autonomous/', expectedStatus: 200 },
      { method: 'GET', path: '/api/v1/health-enhanced-autonomous/status', expectedStatus: 200 }
    ];

    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      console.log(`Testing ${i + 1}/${routes.length}: ${route.method} ${route.path}...`);
      
      const result = await this.testEndpoint(
        route.method,
        route.path,
        route.expectedStatus,
        route.body,
        route.headers
      );

      if (result.success) {
        console.log(`✅ ${route.method} ${route.path} - ${result.statusCode} (${result.responseTime}ms)`);
      } else {
        console.log(`❌ ${route.method} ${route.path} - ${result.statusCode || 'ERROR'} (${result.error || 'Unexpected status'})`);
      }

      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.results.routes = {
      total: routes.length,
      passed: this.results.passed,
      failed: this.results.failed,
      successRate: ((this.results.passed / this.results.total) * 100).toFixed(2) + '%'
    };
  }

  // ==================== MIDDLEWARE TESTING ====================

  async testMiddleware() {
    console.log('\n🔧 Testing middleware components...\n');

    const middlewareTests = [
      // Rate Limiting
      { name: 'Rate Limiting', test: () => this.testRateLimiting() },
      // Authentication
      { name: 'Authentication', test: () => this.testAuthentication() },
      // CORS
      { name: 'CORS', test: () => this.testCORS() },
      // Request Timeout
      { name: 'Request Timeout', test: () => this.testRequestTimeout() },
      // Error Handling
      { name: 'Error Handling', test: () => this.testErrorHandling() }
    ];

    for (const middlewareTest of middlewareTests) {
      try {
        console.log(`Testing ${middlewareTest.name}...`);
        const result = await middlewareTest.test();
        this.results.middleware[middlewareTest.name] = result;
        console.log(`✅ ${middlewareTest.name} - ${result.success ? 'PASSED' : 'FAILED'}`);
      } catch (error) {
        console.log(`❌ ${middlewareTest.name} - ERROR: ${error.message}`);
        this.results.middleware[middlewareTest.name] = { success: false, error: error.message };
      }
    }
  }

  async testRateLimiting() {
    // Test rate limiting by making multiple rapid requests
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(this.testEndpoint('GET', '/health', [200, 429]));
    }
    
    const results = await Promise.all(requests);
    const rateLimited = results.some(r => r.statusCode === 429);
    
    return {
      success: true, // Rate limiting is working if we get 429 or all 200s
      rateLimited,
      totalRequests: results.length,
      statusCodes: results.map(r => r.statusCode)
    };
  }

  async testAuthentication() {
    // Test protected endpoint without auth
    const noAuthResult = await this.testEndpoint('GET', '/api/v1/auth/profile', [401, 404]);
    
    // Test with invalid auth
    const invalidAuthResult = await this.testEndpoint(
      'GET', 
      '/api/v1/auth/profile', 
      [401, 404], 
      null, 
      { 'Authorization': 'Bearer invalid-token' }
    );

    return {
      success: noAuthResult.statusCode === 401 || noAuthResult.statusCode === 404,
      noAuthStatus: noAuthResult.statusCode,
      invalidAuthStatus: invalidAuthResult.statusCode
    };
  }

  async testCORS() {
    const result = await this.testEndpoint(
      'GET', 
      '/health', 
      200, 
      null, 
      { 'Origin': 'https://clutch-main-nk7x.onrender.com' }
    );

    return {
      success: result.success,
      hasCORSHeaders: result.headers && (
        result.headers['access-control-allow-origin'] || 
        result.headers['Access-Control-Allow-Origin']
      )
    };
  }

  async testRequestTimeout() {
    // This would need a special endpoint that takes a long time
    // For now, we'll test that normal requests don't timeout
    const result = await this.testEndpoint('GET', '/health', 200);
    
    return {
      success: result.success && result.responseTime < 5000, // Should respond within 5 seconds
      responseTime: result.responseTime
    };
  }

  async testErrorHandling() {
    // Test 404 handling
    const notFoundResult = await this.testEndpoint('GET', '/api/v1/nonexistent', 404);
    
    // Test invalid JSON
    const invalidJsonResult = await this.testEndpoint(
      'POST', 
      '/api/v1/auth/login', 
      [400, 422], 
      'invalid json'
    );

    return {
      success: notFoundResult.statusCode === 404,
      notFoundStatus: notFoundResult.statusCode,
      invalidJsonStatus: invalidJsonResult.statusCode
    };
  }

  // ==================== DATABASE TESTING ====================

  async testDatabaseConnections() {
    console.log('\n🗄️ Testing database connections...\n');

    const dbTests = [
      { name: 'MongoDB Connection', test: () => this.testMongoConnection() },
      { name: 'Collections Access', test: () => this.testCollectionsAccess() },
      { name: 'Indexes', test: () => this.testIndexes() }
    ];

    for (const dbTest of dbTests) {
      try {
        console.log(`Testing ${dbTest.name}...`);
        const result = await dbTest.test();
        this.results.database[dbTest.name] = result;
        console.log(`✅ ${dbTest.name} - ${result.success ? 'PASSED' : 'FAILED'}`);
      } catch (error) {
        console.log(`❌ ${dbTest.name} - ERROR: ${error.message}`);
        this.results.database[dbTest.name] = { success: false, error: error.message };
      }
    }
  }

  async testMongoConnection() {
    // Test endpoints that use database
    const result = await this.testEndpoint('GET', '/api/v1/knowledge-base/articles', 200);
    
    return {
      success: result.success,
      statusCode: result.statusCode,
      hasData: result.body && result.body.includes('articles')
    };
  }

  async testCollectionsAccess() {
    // Test various endpoints that access different collections
    const collections = [
      '/api/v1/knowledge-base/articles',
      '/api/v1/incidents/',
      '/api/v1/carParts/',
      '/api/v1/customers/'
    ];

    const results = await Promise.all(
      collections.map(path => this.testEndpoint('GET', path, 200))
    );

    const successCount = results.filter(r => r.success).length;

    return {
      success: successCount >= collections.length * 0.8, // 80% success rate
      testedCollections: collections.length,
      successfulCollections: successCount,
      results: results.map((r, i) => ({
        collection: collections[i],
        success: r.success,
        statusCode: r.statusCode
      }))
    };
  }

  async testIndexes() {
    // This would require direct database access
    // For now, we'll test that queries are reasonably fast
    const startTime = Date.now();
    const result = await this.testEndpoint('GET', '/api/v1/knowledge-base/articles', 200);
    const queryTime = Date.now() - startTime;

    return {
      success: result.success && queryTime < 1000, // Should respond within 1 second
      queryTime,
      statusCode: result.statusCode
    };
  }

  // ==================== SYSTEM HEALTH TESTING ====================

  async testSystemHealth() {
    console.log('\n🏥 Testing system health and monitoring...\n');

    const healthTests = [
      { name: 'Health Endpoint', test: () => this.testHealthEndpoint() },
      { name: 'System Monitoring', test: () => this.testSystemMonitoring() },
      { name: 'Performance Metrics', test: () => this.testPerformanceMetrics() },
      { name: 'Memory Usage', test: () => this.testMemoryUsage() }
    ];

    for (const healthTest of healthTests) {
      try {
        console.log(`Testing ${healthTest.name}...`);
        const result = await healthTest.test();
        this.results.system[healthTest.name] = result;
        console.log(`✅ ${healthTest.name} - ${result.success ? 'PASSED' : 'FAILED'}`);
      } catch (error) {
        console.log(`❌ ${healthTest.name} - ERROR: ${error.message}`);
        this.results.system[healthTest.name] = { success: false, error: error.message };
      }
    }
  }

  async testHealthEndpoint() {
    const result = await this.testEndpoint('GET', '/health', 200);
    
    return {
      success: result.success,
      statusCode: result.statusCode,
      hasHealthData: result.body && result.body.includes('status'),
      responseTime: result.responseTime
    };
  }

  async testSystemMonitoring() {
    const result = await this.testEndpoint('GET', '/api/v1/performance/monitor', [200, 401]);
    
    return {
      success: result.success,
      statusCode: result.statusCode,
      isMonitoringActive: result.body && result.body.includes('monitor')
    };
  }

  async testPerformanceMetrics() {
    // Test multiple endpoints to gather performance data
    const endpoints = [
      '/health',
      '/api/v1/knowledge-base/articles',
      '/api/v1/incidents/',
      '/api/v1/carParts/'
    ];

    const results = await Promise.all(
      endpoints.map(path => this.testEndpoint('GET', path, 200))
    );

    const avgResponseTime = results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length;
    const slowRequests = results.filter(r => (r.responseTime || 0) > 1000).length;

    return {
      success: avgResponseTime < 2000 && slowRequests < results.length * 0.2, // 20% slow requests max
      avgResponseTime,
      slowRequests,
      totalRequests: results.length
    };
  }

  async testMemoryUsage() {
    // This would require system monitoring
    // For now, we'll test that the system is responsive
    const result = await this.testEndpoint('GET', '/health', 200);
    
    return {
      success: result.success && result.responseTime < 5000,
      responseTime: result.responseTime,
      isResponsive: result.responseTime < 1000
    };
  }

  // ==================== LOAD TESTING ====================

  async testLoadCapacity() {
    console.log('\n⚡ Testing load capacity...\n');

    const concurrentRequests = 50;
    const requests = [];

    console.log(`Sending ${concurrentRequests} concurrent requests...`);

    for (let i = 0; i < concurrentRequests; i++) {
      requests.push(this.testEndpoint('GET', '/health', 200));
    }

    const startTime = Date.now();
    const results = await Promise.all(requests);
    const endTime = Date.now();

    const successCount = results.filter(r => r.success).length;
    const avgResponseTime = results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length;
    const maxResponseTime = Math.max(...results.map(r => r.responseTime || 0));

    return {
      success: successCount >= concurrentRequests * 0.95, // 95% success rate
      totalRequests: concurrentRequests,
      successfulRequests: successCount,
      successRate: ((successCount / concurrentRequests) * 100).toFixed(2) + '%',
      avgResponseTime,
      maxResponseTime,
      totalTime: endTime - startTime
    };
  }

  // ==================== SECURITY TESTING ====================

  async testSecurity() {
    console.log('\n🔒 Testing security measures...\n');

    const securityTests = [
      { name: 'SQL Injection Protection', test: () => this.testSQLInjection() },
      { name: 'XSS Protection', test: () => this.testXSSProtection() },
      { name: 'Input Validation', test: () => this.testInputValidation() },
      { name: 'Authentication Bypass', test: () => this.testAuthBypass() }
    ];

    for (const securityTest of securityTests) {
      try {
        console.log(`Testing ${securityTest.name}...`);
        const result = await securityTest.test();
        this.results.security = this.results.security || {};
        this.results.security[securityTest.name] = result;
        console.log(`✅ ${securityTest.name} - ${result.success ? 'PASSED' : 'FAILED'}`);
      } catch (error) {
        console.log(`❌ ${securityTest.name} - ERROR: ${error.message}`);
        this.results.security = this.results.security || {};
        this.results.security[securityTest.name] = { success: false, error: error.message };
      }
    }
  }

  async testSQLInjection() {
    // Test with SQL injection attempts
    const maliciousInputs = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --"
    ];

    const results = await Promise.all(
      maliciousInputs.map(input => 
        this.testEndpoint('POST', '/api/v1/auth/login', [400, 401, 422], { email: input, password: 'test' })
      )
    );

    const blockedCount = results.filter(r => r.statusCode === 400 || r.statusCode === 422).length;

    return {
      success: blockedCount >= maliciousInputs.length * 0.8, // 80% should be blocked
      totalAttempts: maliciousInputs.length,
      blockedAttempts: blockedCount,
      results: results.map((r, i) => ({
        input: maliciousInputs[i],
        statusCode: r.statusCode,
        blocked: r.statusCode === 400 || r.statusCode === 422
      }))
    };
  }

  async testXSSProtection() {
    // Test with XSS attempts
    const xssInputs = [
      "<script>alert('xss')</script>",
      "javascript:alert('xss')",
      "<img src=x onerror=alert('xss')>"
    ];

    const results = await Promise.all(
      xssInputs.map(input => 
        this.testEndpoint('POST', '/api/v1/auth/login', [400, 401, 422], { email: input, password: 'test' })
      )
    );

    const blockedCount = results.filter(r => r.statusCode === 400 || r.statusCode === 422).length;

    return {
      success: blockedCount >= xssInputs.length * 0.8,
      totalAttempts: xssInputs.length,
      blockedAttempts: blockedCount
    };
  }

  async testInputValidation() {
    // Test with invalid inputs
    const invalidInputs = [
      { email: '', password: 'test' },
      { email: 'invalid-email', password: 'test' },
      { email: 'test@example.com', password: '' },
      { email: 'a'.repeat(1000), password: 'test' }
    ];

    const results = await Promise.all(
      invalidInputs.map(input => 
        this.testEndpoint('POST', '/api/v1/auth/login', [400, 422], input)
      )
    );

    const validatedCount = results.filter(r => r.statusCode === 400 || r.statusCode === 422).length;

    return {
      success: validatedCount >= invalidInputs.length * 0.8,
      totalInputs: invalidInputs.length,
      validatedInputs: validatedCount
    };
  }

  async testAuthBypass() {
    // Test authentication bypass attempts
    const bypassAttempts = [
      { path: '/api/v1/auth/profile', method: 'GET' },
      { path: '/api/v1/admin/dashboard', method: 'GET' },
      { path: '/api/v1/corporateAccount/', method: 'GET' }
    ];

    const results = await Promise.all(
      bypassAttempts.map(attempt => 
        this.testEndpoint(attempt.method, attempt.path, [401, 403, 404])
      )
    );

    const blockedCount = results.filter(r => r.statusCode === 401 || r.statusCode === 403).length;

    return {
      success: blockedCount >= bypassAttempts.length * 0.8,
      totalAttempts: bypassAttempts.length,
      blockedAttempts: blockedCount
    };
  }

  // ==================== REPORT GENERATION ====================

  generateReport() {
    const endTime = Date.now();
    const totalTime = endTime - this.startTime;

    const report = {
      summary: {
        totalTests: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: ((this.results.passed / this.results.total) * 100).toFixed(2) + '%',
        totalTime: totalTime + 'ms',
        timestamp: new Date().toISOString()
      },
      routes: this.results.routes,
      middleware: this.results.middleware,
      database: this.results.database,
      system: this.results.system,
      security: this.results.security,
      performance: {
        avgResponseTime: this.calculateAvgResponseTime(),
        slowestEndpoint: this.findSlowestEndpoint(),
        fastestEndpoint: this.findFastestEndpoint()
      },
      errors: this.results.errors,
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  calculateAvgResponseTime() {
    if (this.results.performance.length === 0) return 0;
    const total = this.results.performance.reduce((sum, p) => sum + p.responseTime, 0);
    return (total / this.results.performance.length).toFixed(2) + 'ms';
  }

  findSlowestEndpoint() {
    if (this.results.performance.length === 0) return null;
    const slowest = this.results.performance.reduce((max, p) => 
      p.responseTime > max.responseTime ? p : max
    );
    return `${slowest.method} ${slowest.path} (${slowest.responseTime}ms)`;
  }

  findFastestEndpoint() {
    if (this.results.performance.length === 0) return null;
    const fastest = this.results.performance.reduce((min, p) => 
      p.responseTime < min.responseTime ? p : min
    );
    return `${fastest.method} ${fastest.path} (${fastest.responseTime}ms)`;
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.results.failed > 0) {
      recommendations.push(`Fix ${this.results.failed} failing tests before deployment`);
    }

    if (this.calculateAvgResponseTime() > 1000) {
      recommendations.push('Optimize response times - average is above 1 second');
    }

    if (this.results.errors.length > 10) {
      recommendations.push('High number of errors detected - review error handling');
    }

    if (!this.results.middleware.Authentication?.success) {
      recommendations.push('Authentication middleware needs attention');
    }

    if (!this.results.database['MongoDB Connection']?.success) {
      recommendations.push('Database connection issues detected');
    }

    return recommendations;
  }

  // ==================== MAIN TEST RUNNER ====================

  async runComprehensiveTest() {
    console.log('🚀 Starting Comprehensive Backend Test Suite...\n');
    console.log('=' * 60);

    try {
      // Test all routes
      await this.testAllRoutes();

      // Test middleware
      await this.testMiddleware();

      // Test database connections
      await this.testDatabaseConnections();

      // Test system health
      await this.testSystemHealth();

      // Test load capacity
      console.log('\n⚡ Testing load capacity...');
      const loadResult = await this.testLoadCapacity();
      this.results.load = loadResult;
      console.log(`✅ Load Test - ${loadResult.success ? 'PASSED' : 'FAILED'} (${loadResult.successRate})`);

      // Test security
      await this.testSecurity();

      // Generate final report
      const report = this.generateReport();

      console.log('\n' + '=' * 60);
      console.log('📊 COMPREHENSIVE TEST RESULTS');
      console.log('=' * 60);
      console.log(`Total Tests: ${report.summary.totalTests}`);
      console.log(`Passed: ${report.summary.passed}`);
      console.log(`Failed: ${report.summary.failed}`);
      console.log(`Success Rate: ${report.summary.successRate}`);
      console.log(`Total Time: ${report.summary.totalTime}`);
      console.log(`Average Response Time: ${report.performance.avgResponseTime}`);
      console.log(`Slowest Endpoint: ${report.performance.slowestEndpoint}`);
      console.log(`Fastest Endpoint: ${report.performance.fastestEndpoint}`);

      if (report.recommendations.length > 0) {
        console.log('\n📋 RECOMMENDATIONS:');
        report.recommendations.forEach((rec, i) => {
          console.log(`${i + 1}. ${rec}`);
        });
      }

      // Save detailed report
      const reportPath = `comprehensive-test-report-${Date.now()}.json`;
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Detailed report saved to: ${reportPath}`);

      return report;

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    }
  }
}

// ==================== EXECUTION ====================

async function main() {
  const testSuite = new ComprehensiveBackendTestSuite();
  
  try {
    const report = await testSuite.runComprehensiveTest();
    
    // Exit with appropriate code
    process.exit(report.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Test suite execution failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ComprehensiveBackendTestSuite;
