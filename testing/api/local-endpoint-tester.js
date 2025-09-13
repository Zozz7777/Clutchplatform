/**
 * Local Endpoint Tester
 * Tests endpoints locally first, then online in batches of 100
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class LocalEndpointTester {
  constructor() {
    this.localUrl = 'http://localhost:5000';
    this.onlineUrl = 'https://clutch-main-nk7x.onrender.com';
    this.routesPath = path.join(__dirname, '../../shared-backend/routes');
    this.discoveredEndpoints = [];
    this.batchSize = 100;
    this.results = {
      local: { total: 0, passed: 0, failed: 0, skipped: 0 },
      online: { total: 0, passed: 0, failed: 0, skipped: 0 },
      categories: {}
    };
  }

  /**
   * Main testing flow
   */
  async runCompleteTesting() {
    console.log('🚀 Starting Local → Online Endpoint Testing');
    console.log('📊 Strategy: Test locally first, then online in batches of 100');
    console.log('=' * 80);

    try {
      // Step 1: Discover real endpoints
      console.log('\n🔍 STEP 1: Discovering Real Endpoints...');
      await this.discoverRealEndpoints();

      // Step 2: Test locally first
      console.log('\n🏠 STEP 2: Testing Locally...');
      const localSuccess = await this.testLocally();

      if (localSuccess) {
        console.log('\n✅ Local testing successful! Proceeding to online testing...');
        
        // Step 3: Test online in batches
        console.log('\n🌐 STEP 3: Testing Online in Batches of 100...');
        await this.testOnlineInBatches();
      } else {
        console.log('\n❌ Local testing failed. Fix local issues before testing online.');
        return;
      }

      // Step 4: Generate final report
      console.log('\n📊 STEP 4: Generating Final Report...');
      this.generateFinalReport();

    } catch (error) {
      console.error('❌ Testing failed:', error);
      throw error;
    }
  }

  /**
   * Discover real endpoints from shared backend
   */
  async discoverRealEndpoints() {
    console.log(`📁 Reading routes from: ${this.routesPath}`);
    
    try {
      const routeFiles = await this.getRouteFiles();
      console.log(`📄 Found ${routeFiles.length} route files`);
      
      for (const file of routeFiles) {
        await this.parseRouteFile(file);
      }
      
      console.log(`✅ Discovered ${this.discoveredEndpoints.length} real endpoints`);
      
      // Show endpoint summary
      this.showEndpointSummary();
      
    } catch (error) {
      console.error('❌ Error discovering endpoints:', error);
      throw error;
    }
  }

  /**
   * Get all route files
   */
  async getRouteFiles() {
    const files = await fs.readdir(this.routesPath);
    return files
      .filter(file => file.endsWith('.js'))
      .map(file => path.join(this.routesPath, file));
  }

  /**
   * Parse route file to extract endpoints
   */
  async parseRouteFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const fileName = path.basename(filePath, '.js');
      
      const routes = this.extractRoutesFromContent(content, fileName);
      this.discoveredEndpoints.push(...routes);
      
    } catch (error) {
      console.error(`❌ Error parsing ${filePath}:`, error.message);
    }
  }

  /**
   * Extract routes from file content
   */
  extractRoutesFromContent(content, fileName) {
    const routes = [];
    const lines = content.split('\n');
    
    // Route patterns
    const patterns = [
      /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g
    ];
    
    lines.forEach((line, lineNumber) => {
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const method = match[1].toUpperCase();
          const path = match[2];
          
          if (this.shouldSkipRoute(path)) return;
          
          routes.push({
            file: fileName,
            method: method,
            path: path,
            fullPath: this.buildFullPath(fileName, path),
            category: this.categorizeRoute(fileName, path)
          });
        }
      });
    });
    
    return routes;
  }

  /**
   * Build full API path
   */
  buildFullPath(fileName, routePath) {
    const apiPrefixes = {
      'auth': '/api/v1/auth',
      'health': '/health',
      'admin': '/api/v1/admin',
      'performance': '/api/v1/performance',
      'auto-parts': '/api/v1/auto-parts',
      'users': '/api/v1/users',
      'shops': '/api/v1/shops',
      'orders': '/api/v1/orders',
      'customers': '/api/v1/customers',
      'inventory': '/api/v1/inventory',
      'reports': '/api/v1/reports',
      'analytics': '/api/v1/analytics',
      'notifications': '/api/v1/notifications',
      'payments': '/api/v1/payments',
      'vehicles': '/api/v1/vehicles',
      'parts': '/api/v1/parts',
      'services': '/api/v1/services',
      'bookings': '/api/v1/bookings',
      'feedback': '/api/v1/feedback',
      'support': '/api/v1/support',
      'ai-ml': '/api/v1/ai-ml',
      'realtime': '/api/v1/realtime',
      'media-management': '/api/v1/media-management',
      'feedback-system': '/api/v1/feedback-system',
      'revenue-analytics': '/api/v1/revenue-analytics',
      'legal': '/api/v1/legal'
    };
    
    const prefix = apiPrefixes[fileName] || `/api/v1/${fileName}`;
    return `${prefix}${routePath}`;
  }

  /**
   * Categorize route
   */
  categorizeRoute(fileName, path) {
    const categories = {
      'auth': 'Authentication',
      'health': 'Health & Status',
      'admin': 'Administration',
      'performance': 'Performance',
      'auto-parts': 'Auto Parts',
      'users': 'User Management',
      'shops': 'Shop Management',
      'orders': 'Order Management',
      'customers': 'Customer Management',
      'inventory': 'Inventory Management',
      'reports': 'Reporting',
      'analytics': 'Analytics',
      'notifications': 'Notifications',
      'payments': 'Payments',
      'vehicles': 'Vehicle Management',
      'parts': 'Parts Management',
      'services': 'Services',
      'bookings': 'Bookings',
      'feedback': 'Feedback',
      'support': 'Support',
      'ai-ml': 'AI/ML',
      'realtime': 'Real-time',
      'media-management': 'Media Management',
      'feedback-system': 'Feedback System',
      'revenue-analytics': 'Revenue Analytics',
      'legal': 'Legal'
    };
    
    return categories[fileName] || 'Other';
  }

  /**
   * Skip certain routes
   */
  shouldSkipRoute(path) {
    const skipPatterns = ['/test', '/debug', '/internal', '/private'];
    return skipPatterns.some(pattern => path.includes(pattern));
  }

  /**
   * Show endpoint summary
   */
  showEndpointSummary() {
    const categories = {};
    this.discoveredEndpoints.forEach(endpoint => {
      const category = endpoint.category;
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category]++;
    });

    console.log('\n📋 Endpoint Summary:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} endpoints`);
    });
    console.log(`  Total: ${this.discoveredEndpoints.length} endpoints`);
  }

  /**
   * Test locally first
   */
  async testLocally() {
    console.log(`🏠 Testing ${this.discoveredEndpoints.length} endpoints locally...`);
    console.log(`🎯 Local URL: ${this.localUrl}`);
    
    const localResults = await this.testEndpoints(this.localUrl, 'LOCAL');
    this.results.local = localResults;
    
    const successRate = (localResults.passed / localResults.total) * 100;
    console.log(`\n📊 Local Testing Results: ${localResults.passed}/${localResults.total} (${successRate.toFixed(2)}%)`);
    
    return successRate >= 100; // 100% success rate required
  }

  /**
   * Test online in batches of 100
   */
  async testOnlineInBatches() {
    console.log(`🌐 Testing ${this.discoveredEndpoints.length} endpoints online in batches of ${this.batchSize}...`);
    console.log(`🎯 Online URL: ${this.onlineUrl}`);
    
    const batches = this.createBatches(this.discoveredEndpoints, this.batchSize);
    console.log(`📦 Created ${batches.length} batches`);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\n🔄 Batch ${i + 1}/${batches.length} (${batch.length} endpoints)`);
      console.log('-' * 60);
      
      const batchResults = await this.testEndpoints(this.onlineUrl, 'ONLINE', batch);
      
      // Update totals
      this.results.online.total += batchResults.total;
      this.results.online.passed += batchResults.passed;
      this.results.online.failed += batchResults.failed;
      this.results.online.skipped += batchResults.skipped;
      
      // Show batch results
      const batchSuccessRate = (batchResults.passed / batchResults.total) * 100;
      console.log(`📊 Batch ${i + 1} Results: ${batchResults.passed}/${batchResults.total} (${batchSuccessRate.toFixed(2)}%)`);
      
      // Delay between batches
      if (i < batches.length - 1) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await this.delay(2000);
      }
    }
  }

  /**
   * Create batches of endpoints
   */
  createBatches(endpoints, batchSize) {
    const batches = [];
    for (let i = 0; i < endpoints.length; i += batchSize) {
      batches.push(endpoints.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Test endpoints against a URL
   */
  async testEndpoints(baseUrl, type, endpoints = null) {
    const testEndpoints = endpoints || this.discoveredEndpoints;
    const results = { total: 0, passed: 0, failed: 0, skipped: 0 };
    
    for (const endpoint of testEndpoints) {
      const result = await this.testEndpoint(baseUrl, endpoint);
      
      results.total++;
      if (result.status === 'PASSED') {
        results.passed++;
        console.log(`  ✅ ${endpoint.method} ${endpoint.fullPath}: ${result.statusCode} (${result.duration}ms)`);
      } else if (result.status === 'FAILED') {
        results.failed++;
        console.log(`  ❌ ${endpoint.method} ${endpoint.fullPath}: ${result.statusCode} (${result.duration}ms)`);
      } else {
        results.skipped++;
        console.log(`  ⏭️ ${endpoint.method} ${endpoint.fullPath}: ${result.status}`);
      }
      
      // Small delay between requests
      await this.delay(50);
    }
    
    return results;
  }

  /**
   * Test a single endpoint
   */
  async testEndpoint(baseUrl, endpoint) {
    const startTime = Date.now();
    
    try {
      const config = {
        method: endpoint.method.toLowerCase(),
        url: `${baseUrl}${endpoint.fullPath}`,
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Clutch-Local-Tester/1.0'
        }
      };

      // Add authentication for protected endpoints
      if (this.isProtectedEndpoint(endpoint)) {
        config.headers['Authorization'] = 'Bearer test-token';
      }

      const response = await axios(config);
      const duration = Date.now() - startTime;

      return {
        status: 'PASSED',
        statusCode: response.status,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const statusCode = error.response?.status;
      
      // Determine if this is an expected failure
      if (statusCode === 401 || statusCode === 403) {
        return {
          status: 'SKIPPED',
          statusCode: statusCode,
          duration,
          reason: 'Authentication required'
        };
      }
      
      return {
        status: 'FAILED',
        statusCode: statusCode || 'ERROR',
        duration,
        error: error.message
      };
    }
  }

  /**
   * Check if endpoint requires authentication
   */
  isProtectedEndpoint(endpoint) {
    const protectedPatterns = [
      '/admin', '/users', '/orders', '/customers', '/inventory',
      '/reports', '/analytics', '/payments', '/bookings', '/feedback'
    ];
    
    return protectedPatterns.some(pattern => endpoint.fullPath.includes(pattern));
  }

  /**
   * Generate final report
   */
  generateFinalReport() {
    console.log('\n' + '=' * 80);
    console.log('📊 LOCAL → ONLINE ENDPOINT TESTING REPORT');
    console.log('=' * 80);
    console.log(`📅 Test Date: ${new Date().toISOString()}`);
    console.log(`📊 Total Endpoints: ${this.discoveredEndpoints.length}`);
    
    // Local results
    const localSuccessRate = (this.results.local.passed / this.results.local.total) * 100;
    console.log(`\n🏠 LOCAL TESTING:`);
    console.log(`  ✅ Passed: ${this.results.local.passed}`);
    console.log(`  ❌ Failed: ${this.results.local.failed}`);
    console.log(`  ⏭️ Skipped: ${this.results.local.skipped}`);
    console.log(`  📈 Success Rate: ${localSuccessRate.toFixed(2)}%`);
    
    // Online results
    if (this.results.online.total > 0) {
      const onlineSuccessRate = (this.results.online.passed / this.results.online.total) * 100;
      console.log(`\n🌐 ONLINE TESTING:`);
      console.log(`  ✅ Passed: ${this.results.online.passed}`);
      console.log(`  ❌ Failed: ${this.results.online.failed}`);
      console.log(`  ⏭️ Skipped: ${this.results.online.skipped}`);
      console.log(`  📈 Success Rate: ${onlineSuccessRate.toFixed(2)}%`);
    }
    
    console.log('\n🏁 TESTING COMPLETE');
    console.log('=' * 80);
  }

  /**
   * Utility method for delays
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use
module.exports = LocalEndpointTester;

// Run if executed directly
if (require.main === module) {
  const tester = new LocalEndpointTester();
  tester.runCompleteTesting().catch(console.error);
}
