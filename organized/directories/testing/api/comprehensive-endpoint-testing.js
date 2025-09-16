/**
 * Comprehensive Endpoint Testing Suite
 * Tests all endpoints and routes for the Clutch API Server
 * Target: https://clutch-main-nk7x.onrender.com
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

class ComprehensiveEndpointTester {
  constructor() {
    this.baseUrl = 'https://clutch-main-nk7x.onrender.com';
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
    this.authToken = null;
    this.testData = {
      user: {
        email: 'test@clutch.com',
        password: 'TestPassword123!',
        name: 'Test User',
        role: 'admin'
      },
      shop: {
        name: 'Test Auto Shop',
        address: '123 Test Street',
        phone: '+1234567890',
        email: 'shop@test.com'
      },
      part: {
        name: 'Test Brake Pad',
        partNumber: 'TEST-BP-001',
        category: 'brakes',
        price: 99.99,
        stock: 50
      },
      order: {
        customerName: 'Test Customer',
        items: [
          {
            partId: 'test-part-id',
            quantity: 2,
            price: 99.99
          }
        ],
        total: 199.98
      }
    };
  }

  /**
   * Run comprehensive endpoint testing
   */
  async runComprehensiveTests() {
    console.log('🧪 Starting Comprehensive Endpoint Testing...');
    console.log(`🎯 Target: ${this.baseUrl}`);
    console.log('=' * 60);

    try {
      // Test basic connectivity
      await this.testBasicConnectivity();

      // Test health endpoints
      await this.testHealthEndpoints();

      // Test authentication endpoints
      await this.testAuthenticationEndpoints();

      // Test admin endpoints
      await this.testAdminEndpoints();

      // Test performance endpoints
      await this.testPerformanceEndpoints();

      // Test CRUD operations for all resources
      await this.testCRUDOperations();

      // Test error handling
      await this.testErrorHandling();

      // Test rate limiting
      await this.testRateLimiting();

      // Test security headers
      await this.testSecurityHeaders();

      // Test API versioning
      await this.testAPIVersioning();

      // Test pagination
      await this.testPagination();

      // Test filtering and sorting
      await this.testFilteringAndSorting();

      // Test file uploads
      await this.testFileUploads();

      // Test WebSocket connections
      await this.testWebSocketConnections();

      // Test batch operations
      await this.testBatchOperations();

      // Test search functionality
      await this.testSearchFunctionality();

      // Test reporting endpoints
      await this.testReportingEndpoints();

      // Test integration endpoints
      await this.testIntegrationEndpoints();

      // Generate comprehensive report
      this.generateTestReport();

    } catch (error) {
      console.error('❌ Comprehensive testing failed:', error);
    }
  }

  /**
   * Test basic connectivity
   */
  async testBasicConnectivity() {
    console.log('\n📡 Testing Basic Connectivity...');
    
    const tests = [
      { name: 'Root endpoint', method: 'GET', path: '/' },
      { name: 'Health check', method: 'GET', path: '/health' },
      { name: 'Ping endpoint', method: 'GET', path: '/ping' },
      { name: 'API info', method: 'GET', path: '/api' },
      { name: 'API version', method: 'GET', path: '/api/v1' }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  /**
   * Test health endpoints
   */
  async testHealthEndpoints() {
    console.log('\n🏥 Testing Health Endpoints...');
    
    const tests = [
      { name: 'Health check', method: 'GET', path: '/health' },
      { name: 'Health detailed', method: 'GET', path: '/health/detailed' },
      { name: 'Health database', method: 'GET', path: '/health/database' },
      { name: 'Health redis', method: 'GET', path: '/health/redis' },
      { name: 'Health services', method: 'GET', path: '/health/services' },
      { name: 'Health metrics', method: 'GET', path: '/health/metrics' }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  /**
   * Test authentication endpoints
   */
  async testAuthenticationEndpoints() {
    console.log('\n🔐 Testing Authentication Endpoints...');
    
    const tests = [
      // Registration
      { name: 'User registration', method: 'POST', path: '/api/v1/auth/register', data: this.testData.user },
      { name: 'User registration validation', method: 'POST', path: '/api/v1/auth/register', data: {} },
      
      // Login
      { name: 'User login', method: 'POST', path: '/api/v1/auth/login', data: { email: this.testData.user.email, password: this.testData.user.password } },
      { name: 'User login invalid', method: 'POST', path: '/api/v1/auth/login', data: { email: 'invalid@test.com', password: 'wrong' } },
      
      // Password operations
      { name: 'Forgot password', method: 'POST', path: '/api/v1/auth/forgot-password', data: { email: this.testData.user.email } },
      { name: 'Reset password', method: 'POST', path: '/api/v1/auth/reset-password', data: { token: 'test-token', password: 'NewPassword123!' } },
      { name: 'Change password', method: 'POST', path: '/api/v1/auth/change-password', data: { currentPassword: 'old', newPassword: 'new' }, requiresAuth: true },
      
      // Token operations
      { name: 'Refresh token', method: 'POST', path: '/api/v1/auth/refresh', data: { refreshToken: 'test-refresh-token' } },
      { name: 'Verify token', method: 'POST', path: '/api/v1/auth/verify', data: { token: 'test-token' } },
      { name: 'Logout', method: 'POST', path: '/api/v1/auth/logout', requiresAuth: true },
      
      // Profile operations
      { name: 'Get profile', method: 'GET', path: '/api/v1/auth/profile', requiresAuth: true },
      { name: 'Update profile', method: 'PUT', path: '/api/v1/auth/profile', data: { name: 'Updated Name' }, requiresAuth: true },
      { name: 'Delete profile', method: 'DELETE', path: '/api/v1/auth/profile', requiresAuth: true }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  /**
   * Test admin endpoints
   */
  async testAdminEndpoints() {
    console.log('\n👑 Testing Admin Endpoints...');
    
    const tests = [
      // User management
      { name: 'Get all users', method: 'GET', path: '/api/v1/admin/users', requiresAuth: true, requiresAdmin: true },
      { name: 'Get user by ID', method: 'GET', path: '/api/v1/admin/users/test-user-id', requiresAuth: true, requiresAdmin: true },
      { name: 'Create user', method: 'POST', path: '/api/v1/admin/users', data: this.testData.user, requiresAuth: true, requiresAdmin: true },
      { name: 'Update user', method: 'PUT', path: '/api/v1/admin/users/test-user-id', data: { name: 'Updated User' }, requiresAuth: true, requiresAdmin: true },
      { name: 'Delete user', method: 'DELETE', path: '/api/v1/admin/users/test-user-id', requiresAuth: true, requiresAdmin: true },
      
      // Shop management
      { name: 'Get all shops', method: 'GET', path: '/api/v1/admin/shops', requiresAuth: true, requiresAdmin: true },
      { name: 'Get shop by ID', method: 'GET', path: '/api/v1/admin/shops/test-shop-id', requiresAuth: true, requiresAdmin: true },
      { name: 'Create shop', method: 'POST', path: '/api/v1/admin/shops', data: this.testData.shop, requiresAuth: true, requiresAdmin: true },
      { name: 'Update shop', method: 'PUT', path: '/api/v1/admin/shops/test-shop-id', data: { name: 'Updated Shop' }, requiresAuth: true, requiresAdmin: true },
      { name: 'Delete shop', method: 'DELETE', path: '/api/v1/admin/shops/test-shop-id', requiresAuth: true, requiresAdmin: true },
      
      // Parts management
      { name: 'Get all parts', method: 'GET', path: '/api/v1/admin/parts', requiresAuth: true, requiresAdmin: true },
      { name: 'Get part by ID', method: 'GET', path: '/api/v1/admin/parts/test-part-id', requiresAuth: true, requiresAdmin: true },
      { name: 'Create part', method: 'POST', path: '/api/v1/admin/parts', data: this.testData.part, requiresAuth: true, requiresAdmin: true },
      { name: 'Update part', method: 'PUT', path: '/api/v1/admin/parts/test-part-id', data: { price: 149.99 }, requiresAuth: true, requiresAdmin: true },
      { name: 'Delete part', method: 'DELETE', path: '/api/v1/admin/parts/test-part-id', requiresAuth: true, requiresAdmin: true },
      
      // Orders management
      { name: 'Get all orders', method: 'GET', path: '/api/v1/admin/orders', requiresAuth: true, requiresAdmin: true },
      { name: 'Get order by ID', method: 'GET', path: '/api/v1/admin/orders/test-order-id', requiresAuth: true, requiresAdmin: true },
      { name: 'Create order', method: 'POST', path: '/api/v1/admin/orders', data: this.testData.order, requiresAuth: true, requiresAdmin: true },
      { name: 'Update order', method: 'PUT', path: '/api/v1/admin/orders/test-order-id', data: { status: 'completed' }, requiresAuth: true, requiresAdmin: true },
      { name: 'Delete order', method: 'DELETE', path: '/api/v1/admin/orders/test-order-id', requiresAuth: true, requiresAdmin: true },
      
      // System management
      { name: 'Get system stats', method: 'GET', path: '/api/v1/admin/stats', requiresAuth: true, requiresAdmin: true },
      { name: 'Get system logs', method: 'GET', path: '/api/v1/admin/logs', requiresAuth: true, requiresAdmin: true },
      { name: 'Get system health', method: 'GET', path: '/api/v1/admin/health', requiresAuth: true, requiresAdmin: true },
      { name: 'Get system config', method: 'GET', path: '/api/v1/admin/config', requiresAuth: true, requiresAdmin: true },
      { name: 'Update system config', method: 'PUT', path: '/api/v1/admin/config', data: { setting: 'value' }, requiresAuth: true, requiresAdmin: true }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  /**
   * Test performance endpoints
   */
  async testPerformanceEndpoints() {
    console.log('\n⚡ Testing Performance Endpoints...');
    
    const tests = [
      { name: 'Get performance metrics', method: 'GET', path: '/api/v1/performance/metrics' },
      { name: 'Get response times', method: 'GET', path: '/api/v1/performance/response-times' },
      { name: 'Get throughput', method: 'GET', path: '/api/v1/performance/throughput' },
      { name: 'Get error rates', method: 'GET', path: '/api/v1/performance/error-rates' },
      { name: 'Get resource usage', method: 'GET', path: '/api/v1/performance/resources' },
      { name: 'Get database performance', method: 'GET', path: '/api/v1/performance/database' },
      { name: 'Get cache performance', method: 'GET', path: '/api/v1/performance/cache' },
      { name: 'Get API performance', method: 'GET', path: '/api/v1/performance/api' }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  /**
   * Test CRUD operations
   */
  async testCRUDOperations() {
    console.log('\n📝 Testing CRUD Operations...');
    
    const resources = ['users', 'shops', 'parts', 'orders', 'customers', 'inventory', 'reports'];
    
    for (const resource of resources) {
      console.log(`\n  Testing ${resource} CRUD operations...`);
      
      const tests = [
        { name: `Get all ${resource}`, method: 'GET', path: `/api/v1/${resource}` },
        { name: `Get ${resource} by ID`, method: 'GET', path: `/api/v1/${resource}/test-id` },
        { name: `Create ${resource}`, method: 'POST', path: `/api/v1/${resource}`, data: this.getTestDataForResource(resource) },
        { name: `Update ${resource}`, method: 'PUT', path: `/api/v1/${resource}/test-id`, data: { updated: true } },
        { name: `Delete ${resource}`, method: 'DELETE', path: `/api/v1/${resource}/test-id` },
        { name: `Bulk create ${resource}`, method: 'POST', path: `/api/v1/${resource}/bulk`, data: [this.getTestDataForResource(resource)] },
        { name: `Bulk update ${resource}`, method: 'PUT', path: `/api/v1/${resource}/bulk`, data: [{ id: 'test-id', updated: true }] },
        { name: `Bulk delete ${resource}`, method: 'DELETE', path: `/api/v1/${resource}/bulk`, data: ['test-id'] }
      ];

      for (const test of tests) {
        await this.runTest(test);
      }
    }
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    console.log('\n❌ Testing Error Handling...');
    
    const tests = [
      { name: '404 Not Found', method: 'GET', path: '/api/v1/nonexistent' },
      { name: '405 Method Not Allowed', method: 'PATCH', path: '/health' },
      { name: '400 Bad Request', method: 'POST', path: '/api/v1/auth/login', data: { invalid: 'data' } },
      { name: '401 Unauthorized', method: 'GET', path: '/api/v1/admin/users' },
      { name: '403 Forbidden', method: 'GET', path: '/api/v1/admin/users', headers: { Authorization: 'Bearer invalid-token' } },
      { name: '422 Unprocessable Entity', method: 'POST', path: '/api/v1/users', data: { email: 'invalid-email' } },
      { name: '429 Too Many Requests', method: 'GET', path: '/health' }, // Will be tested with rapid requests
      { name: '500 Internal Server Error', method: 'GET', path: '/api/v1/error' }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  /**
   * Test rate limiting
   */
  async testRateLimiting() {
    console.log('\n🚦 Testing Rate Limiting...');
    
    const tests = [
      { name: 'Rate limit test (10 requests)', method: 'GET', path: '/health', iterations: 10 },
      { name: 'Rate limit test (50 requests)', method: 'GET', path: '/ping', iterations: 50 },
      { name: 'Rate limit test (100 requests)', method: 'GET', path: '/api/v1/performance/metrics', iterations: 100 }
    ];

    for (const test of tests) {
      await this.runRateLimitTest(test);
    }
  }

  /**
   * Test security headers
   */
  async testSecurityHeaders() {
    console.log('\n🔒 Testing Security Headers...');
    
    const tests = [
      { name: 'Security headers check', method: 'GET', path: '/health' }
    ];

    for (const test of tests) {
      await this.runSecurityTest(test);
    }
  }

  /**
   * Test API versioning
   */
  async testAPIVersioning() {
    console.log('\n📋 Testing API Versioning...');
    
    const tests = [
      { name: 'API v1', method: 'GET', path: '/api/v1' },
      { name: 'API v2', method: 'GET', path: '/api/v2' },
      { name: 'API latest', method: 'GET', path: '/api/latest' },
      { name: 'API without version', method: 'GET', path: '/api' }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  /**
   * Test pagination
   */
  async testPagination() {
    console.log('\n📄 Testing Pagination...');
    
    const resources = ['users', 'shops', 'parts', 'orders'];
    
    for (const resource of resources) {
      const tests = [
        { name: `${resource} pagination - page 1`, method: 'GET', path: `/api/v1/${resource}?page=1&limit=10` },
        { name: `${resource} pagination - page 2`, method: 'GET', path: `/api/v1/${resource}?page=2&limit=10` },
        { name: `${resource} pagination - large limit`, method: 'GET', path: `/api/v1/${resource}?page=1&limit=1000` },
        { name: `${resource} pagination - invalid page`, method: 'GET', path: `/api/v1/${resource}?page=0&limit=10` },
        { name: `${resource} pagination - invalid limit`, method: 'GET', path: `/api/v1/${resource}?page=1&limit=0` }
      ];

      for (const test of tests) {
        await this.runTest(test);
      }
    }
  }

  /**
   * Test filtering and sorting
   */
  async testFilteringAndSorting() {
    console.log('\n🔍 Testing Filtering and Sorting...');
    
    const resources = ['users', 'shops', 'parts', 'orders'];
    
    for (const resource of resources) {
      const tests = [
        { name: `${resource} filter by name`, method: 'GET', path: `/api/v1/${resource}?filter=name:test` },
        { name: `${resource} sort by name`, method: 'GET', path: `/api/v1/${resource}?sort=name:asc` },
        { name: `${resource} sort by date`, method: 'GET', path: `/api/v1/${resource}?sort=createdAt:desc` },
        { name: `${resource} multiple filters`, method: 'GET', path: `/api/v1/${resource}?filter=status:active&filter=type:premium` },
        { name: `${resource} complex query`, method: 'GET', path: `/api/v1/${resource}?filter=name:test&sort=createdAt:desc&page=1&limit=20` }
      ];

      for (const test of tests) {
        await this.runTest(test);
      }
    }
  }

  /**
   * Test file uploads
   */
  async testFileUploads() {
    console.log('\n📁 Testing File Uploads...');
    
    const tests = [
      { name: 'Upload image', method: 'POST', path: '/api/v1/upload/image', isFileUpload: true },
      { name: 'Upload document', method: 'POST', path: '/api/v1/upload/document', isFileUpload: true },
      { name: 'Upload CSV', method: 'POST', path: '/api/v1/upload/csv', isFileUpload: true },
      { name: 'Upload large file', method: 'POST', path: '/api/v1/upload/large', isFileUpload: true },
      { name: 'Upload invalid file type', method: 'POST', path: '/api/v1/upload/image', data: { invalid: 'data' } }
    ];

    for (const test of tests) {
      await this.runFileUploadTest(test);
    }
  }

  /**
   * Test WebSocket connections
   */
  async testWebSocketConnections() {
    console.log('\n🔌 Testing WebSocket Connections...');
    
    const tests = [
      { name: 'WebSocket connection', path: '/ws' },
      { name: 'WebSocket with auth', path: '/ws/auth' },
      { name: 'WebSocket notifications', path: '/ws/notifications' },
      { name: 'WebSocket real-time data', path: '/ws/realtime' }
    ];

    for (const test of tests) {
      await this.runWebSocketTest(test);
    }
  }

  /**
   * Test batch operations
   */
  async testBatchOperations() {
    console.log('\n📦 Testing Batch Operations...');
    
    const tests = [
      { name: 'Batch create users', method: 'POST', path: '/api/v1/batch/users', data: { action: 'create', items: [this.testData.user] } },
      { name: 'Batch update parts', method: 'POST', path: '/api/v1/batch/parts', data: { action: 'update', items: [{ id: 'test-id', price: 199.99 }] } },
      { name: 'Batch delete orders', method: 'POST', path: '/api/v1/batch/orders', data: { action: 'delete', items: ['test-id-1', 'test-id-2'] } },
      { name: 'Batch mixed operations', method: 'POST', path: '/api/v1/batch/mixed', data: { operations: [{ action: 'create', data: this.testData.user }] } }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  /**
   * Test search functionality
   */
  async testSearchFunctionality() {
    console.log('\n🔎 Testing Search Functionality...');
    
    const tests = [
      { name: 'Global search', method: 'GET', path: '/api/v1/search?q=test' },
      { name: 'Search users', method: 'GET', path: '/api/v1/search/users?q=john' },
      { name: 'Search parts', method: 'GET', path: '/api/v1/search/parts?q=brake' },
      { name: 'Search orders', method: 'GET', path: '/api/v1/search/orders?q=order123' },
      { name: 'Advanced search', method: 'GET', path: '/api/v1/search/advanced?q=test&type=user&category=premium' },
      { name: 'Search suggestions', method: 'GET', path: '/api/v1/search/suggestions?q=bra' }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  /**
   * Test reporting endpoints
   */
  async testReportingEndpoints() {
    console.log('\n📊 Testing Reporting Endpoints...');
    
    const tests = [
      { name: 'Sales report', method: 'GET', path: '/api/v1/reports/sales' },
      { name: 'Inventory report', method: 'GET', path: '/api/v1/reports/inventory' },
      { name: 'User activity report', method: 'GET', path: '/api/v1/reports/user-activity' },
      { name: 'Performance report', method: 'GET', path: '/api/v1/reports/performance' },
      { name: 'Custom report', method: 'POST', path: '/api/v1/reports/custom', data: { type: 'sales', period: 'monthly' } },
      { name: 'Export report', method: 'GET', path: '/api/v1/reports/export?type=sales&format=csv' }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  /**
   * Test integration endpoints
   */
  async testIntegrationEndpoints() {
    console.log('\n🔗 Testing Integration Endpoints...');
    
    const tests = [
      { name: 'OBD integration', method: 'GET', path: '/api/v1/integration/obd' },
      { name: 'Car health check', method: 'POST', path: '/api/v1/integration/car-health', data: { vin: 'TEST123456789' } },
      { name: 'External API sync', method: 'POST', path: '/api/v1/integration/sync', data: { source: 'external' } },
      { name: 'Webhook endpoint', method: 'POST', path: '/api/v1/integration/webhook', data: { event: 'test' } },
      { name: 'Third-party auth', method: 'POST', path: '/api/v1/integration/auth', data: { provider: 'google' } }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  /**
   * Run individual test
   */
  async runTest(test) {
    const startTime = performance.now();
    this.results.total++;

    try {
      const config = {
        method: test.method.toLowerCase(),
        url: `${this.baseUrl}${test.path}`,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Clutch-API-Tester/1.0',
          ...test.headers
        }
      };

      // Add authentication if required
      if (test.requiresAuth && this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }

      // Add data if provided
      if (test.data) {
        config.data = test.data;
      }

      const response = await axios(config);
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.results.passed++;
      this.results.details.push({
        name: test.name,
        method: test.method,
        path: test.path,
        status: 'PASSED',
        statusCode: response.status,
        duration: Math.round(duration),
        responseSize: JSON.stringify(response.data).length,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ ${test.name}: ${response.status} (${Math.round(duration)}ms)`);

    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.results.failed++;
      this.results.details.push({
        name: test.name,
        method: test.method,
        path: test.path,
        status: 'FAILED',
        statusCode: error.response?.status || 'ERROR',
        duration: Math.round(duration),
        error: error.message,
        timestamp: new Date().toISOString()
      });

      console.log(`❌ ${test.name}: ${error.response?.status || 'ERROR'} (${Math.round(duration)}ms) - ${error.message}`);
    }
  }

  /**
   * Run rate limit test
   */
  async runRateLimitTest(test) {
    console.log(`\n  Testing rate limit: ${test.name}`);
    const startTime = performance.now();
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < test.iterations; i++) {
      try {
        const response = await axios.get(`${this.baseUrl}${test.path}`, { timeout: 5000 });
        if (response.status === 200) {
          successCount++;
        }
      } catch (error) {
        errorCount++;
        if (error.response?.status === 429) {
          console.log(`    Rate limited at request ${i + 1}`);
          break;
        }
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.results.details.push({
      name: test.name,
      method: test.method,
      path: test.path,
      status: errorCount > 0 ? 'PASSED' : 'FAILED',
      statusCode: 'RATE_LIMIT_TEST',
      duration: Math.round(duration),
      successCount,
      errorCount,
      timestamp: new Date().toISOString()
    });

    console.log(`    Results: ${successCount} successful, ${errorCount} errors (${Math.round(duration)}ms)`);
  }

  /**
   * Run security test
   */
  async runSecurityTest(test) {
    try {
      const response = await axios.get(`${this.baseUrl}${test.path}`, { timeout: 5000 });
      
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'strict-transport-security',
        'content-security-policy'
      ];

      const foundHeaders = securityHeaders.filter(header => 
        response.headers[header] || response.headers[header.toLowerCase()]
      );

      this.results.details.push({
        name: test.name,
        method: test.method,
        path: test.path,
        status: foundHeaders.length >= 3 ? 'PASSED' : 'FAILED',
        statusCode: response.status,
        securityHeaders: foundHeaders,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ ${test.name}: ${foundHeaders.length}/5 security headers found`);

    } catch (error) {
      this.results.details.push({
        name: test.name,
        method: test.method,
        path: test.path,
        status: 'FAILED',
        statusCode: error.response?.status || 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });

      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }

  /**
   * Run file upload test
   */
  async runFileUploadTest(test) {
    try {
      // Create a test file buffer
      const testFile = Buffer.from('test file content');
      
      const formData = new FormData();
      formData.append('file', testFile, 'test.txt');

      const response = await axios.post(`${this.baseUrl}${test.path}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 10000
      });

      this.results.details.push({
        name: test.name,
        method: test.method,
        path: test.path,
        status: 'PASSED',
        statusCode: response.status,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ ${test.name}: ${response.status}`);

    } catch (error) {
      this.results.details.push({
        name: test.name,
        method: test.method,
        path: test.path,
        status: 'FAILED',
        statusCode: error.response?.status || 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });

      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }

  /**
   * Run WebSocket test
   */
  async runWebSocketTest(test) {
    try {
      // Note: This is a simplified WebSocket test
      // In a real implementation, you would use a WebSocket library
      const wsUrl = `${this.baseUrl.replace('http', 'ws')}${test.path}`;
      
      this.results.details.push({
        name: test.name,
        method: 'WS',
        path: test.path,
        status: 'SKIPPED',
        statusCode: 'WS_NOT_IMPLEMENTED',
        wsUrl,
        timestamp: new Date().toISOString()
      });

      console.log(`⏭️ ${test.name}: WebSocket test skipped (not implemented)`);

    } catch (error) {
      this.results.details.push({
        name: test.name,
        method: 'WS',
        path: test.path,
        status: 'FAILED',
        statusCode: 'WS_ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });

      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }

  /**
   * Get test data for resource
   */
  getTestDataForResource(resource) {
    const testDataMap = {
      users: this.testData.user,
      shops: this.testData.shop,
      parts: this.testData.part,
      orders: this.testData.order,
      customers: { name: 'Test Customer', email: 'customer@test.com' },
      inventory: { partId: 'test-part', quantity: 100, location: 'warehouse' },
      reports: { type: 'sales', period: 'monthly', format: 'json' }
    };

    return testDataMap[resource] || { test: true };
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    console.log('\n' + '=' * 60);
    console.log('📊 COMPREHENSIVE ENDPOINT TESTING REPORT');
    console.log('=' * 60);
    console.log(`🎯 Target: ${this.baseUrl}`);
    console.log(`📅 Test Date: ${new Date().toISOString()}`);
    console.log(`⏱️ Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⏭️ Skipped: ${this.results.skipped}`);
    console.log(`📈 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`);

    // Group results by status
    const statusGroups = this.results.details.reduce((groups, test) => {
      const status = test.status;
      if (!groups[status]) groups[status] = [];
      groups[status].push(test);
      return groups;
    }, {});

    // Show failed tests
    if (statusGroups.FAILED && statusGroups.FAILED.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      statusGroups.FAILED.forEach(test => {
        console.log(`  • ${test.name} (${test.method} ${test.path}) - ${test.statusCode}: ${test.error || 'Unknown error'}`);
      });
    }

    // Show passed tests summary
    if (statusGroups.PASSED && statusGroups.PASSED.length > 0) {
      console.log(`\n✅ PASSED TESTS: ${statusGroups.PASSED.length}`);
    }

    // Show skipped tests
    if (statusGroups.SKIPPED && statusGroups.SKIPPED.length > 0) {
      console.log(`\n⏭️ SKIPPED TESTS: ${statusGroups.SKIPPED.length}`);
    }

    // Performance summary
    const avgDuration = this.results.details
      .filter(test => test.duration)
      .reduce((sum, test) => sum + test.duration, 0) / this.results.details.filter(test => test.duration).length;

    console.log(`\n⚡ Average Response Time: ${Math.round(avgDuration)}ms`);

    // Endpoint coverage
    const uniqueEndpoints = new Set(this.results.details.map(test => `${test.method} ${test.path}`));
    console.log(`\n📋 Unique Endpoints Tested: ${uniqueEndpoints.size}`);

    console.log('\n' + '=' * 60);
    console.log('🏁 TESTING COMPLETE');
    console.log('=' * 60);
  }
}

// Export for use in other files
module.exports = ComprehensiveEndpointTester;

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new ComprehensiveEndpointTester();
  tester.runComprehensiveTests().catch(console.error);
}
