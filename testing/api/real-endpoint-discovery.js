/**
 * Real Endpoint Discovery System
 * Discovers actual routes and endpoints from the shared backend
 * Tests real endpoints instead of generated ones
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class RealEndpointDiscovery {
  constructor() {
    this.baseUrl = 'https://clutch-main-nk7x.onrender.com';
    this.routesPath = path.join(__dirname, '../../shared-backend/routes');
    this.discoveredEndpoints = [];
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      categories: {}
    };
  }

  /**
   * Discover all real endpoints from the shared backend
   */
  async discoverRealEndpoints() {
    console.log('🔍 Discovering Real Endpoints from Shared Backend...');
    console.log(`📁 Routes Path: ${this.routesPath}`);
    
    try {
      // Read all route files
      const routeFiles = await this.getRouteFiles();
      console.log(`📄 Found ${routeFiles.length} route files`);
      
      // Parse each route file
      for (const file of routeFiles) {
        await this.parseRouteFile(file);
      }
      
      console.log(`✅ Discovered ${this.discoveredEndpoints.length} real endpoints`);
      return this.discoveredEndpoints;
      
    } catch (error) {
      console.error('❌ Error discovering endpoints:', error);
      throw error;
    }
  }

  /**
   * Get all route files from the shared backend
   */
  async getRouteFiles() {
    const files = await fs.readdir(this.routesPath);
    return files
      .filter(file => file.endsWith('.js'))
      .map(file => path.join(this.routesPath, file));
  }

  /**
   * Parse a route file to extract endpoints
   */
  async parseRouteFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const fileName = path.basename(filePath, '.js');
      
      console.log(`📄 Parsing: ${fileName}`);
      
      // Extract route definitions
      const routes = this.extractRoutesFromContent(content, fileName);
      
      // Add to discovered endpoints
      this.discoveredEndpoints.push(...routes);
      
      console.log(`  ✅ Found ${routes.length} endpoints in ${fileName}`);
      
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
    
    // Common route patterns
    const patterns = [
      // router.get('/path', ...)
      /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      // app.get('/path', ...)
      /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      // router.route('/path').get(...)
      /router\.route\s*\(\s*['"`]([^'"`]+)['"`]\)\.(get|post|put|delete|patch)/g
    ];
    
    lines.forEach((line, lineNumber) => {
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const method = match[1] ? match[1].toUpperCase() : 'GET';
          const path = match[2] || match[1];
          
          // Skip internal/utility routes
          if (this.shouldSkipRoute(path)) {
            return;
          }
          
          routes.push({
            file: fileName,
            method: method,
            path: path,
            line: lineNumber + 1,
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
    // Map route files to API prefixes
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
   * Categorize route for organization
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
   * Skip certain routes that shouldn't be tested
   */
  shouldSkipRoute(path) {
    const skipPatterns = [
      '/test',
      '/debug',
      '/internal',
      '/private',
      '/admin/debug',
      '/admin/test',
      '/health/debug',
      '/health/test'
    ];
    
    return skipPatterns.some(pattern => path.includes(pattern));
  }

  /**
   * Test all discovered endpoints
   */
  async testAllEndpoints() {
    console.log('\n🧪 Testing All Discovered Endpoints...');
    console.log(`🎯 Target: ${this.baseUrl}`);
    console.log(`📊 Total Endpoints: ${this.discoveredEndpoints.length}`);
    console.log('=' * 80);

    // Group endpoints by category
    const categorizedEndpoints = this.groupEndpointsByCategory();
    
    // Test each category
    for (const [category, endpoints] of Object.entries(categorizedEndpoints)) {
      console.log(`\n📂 Testing Category: ${category} (${endpoints.length} endpoints)`);
      console.log('-' * 60);
      
      await this.testCategory(category, endpoints);
      
      // Small delay between categories
      await this.delay(1000);
    }

    // Generate report
    this.generateReport();
  }

  /**
   * Group endpoints by category
   */
  groupEndpointsByCategory() {
    const grouped = {};
    
    this.discoveredEndpoints.forEach(endpoint => {
      const category = endpoint.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(endpoint);
    });
    
    return grouped;
  }

  /**
   * Test a category of endpoints
   */
  async testCategory(category, endpoints) {
    const categoryResults = {
      total: endpoints.length,
      passed: 0,
      failed: 0,
      skipped: 0
    };

    for (const endpoint of endpoints) {
      const result = await this.testEndpoint(endpoint);
      
      if (result.status === 'PASSED') {
        categoryResults.passed++;
        console.log(`  ✅ ${endpoint.method} ${endpoint.fullPath}: ${result.statusCode} (${result.duration}ms)`);
      } else if (result.status === 'FAILED') {
        categoryResults.failed++;
        console.log(`  ❌ ${endpoint.method} ${endpoint.fullPath}: ${result.statusCode} (${result.duration}ms)`);
      } else {
        categoryResults.skipped++;
        console.log(`  ⏭️ ${endpoint.method} ${endpoint.fullPath}: ${result.status}`);
      }
      
      // Small delay between requests
      await this.delay(100);
    }

    this.results.categories[category] = categoryResults;
    this.results.total += categoryResults.total;
    this.results.passed += categoryResults.passed;
    this.results.failed += categoryResults.failed;
    this.results.skipped += categoryResults.skipped;
  }

  /**
   * Test a single endpoint
   */
  async testEndpoint(endpoint) {
    const startTime = Date.now();
    
    try {
      const config = {
        method: endpoint.method.toLowerCase(),
        url: `${this.baseUrl}${endpoint.fullPath}`,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Clutch-Real-Endpoint-Tester/1.0'
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
        duration,
        responseSize: JSON.stringify(response.data).length
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Determine if this is an expected failure
      const statusCode = error.response?.status;
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
      '/admin',
      '/users',
      '/orders',
      '/customers',
      '/inventory',
      '/reports',
      '/analytics',
      '/payments',
      '/bookings',
      '/feedback',
      '/support'
    ];
    
    return protectedPatterns.some(pattern => endpoint.fullPath.includes(pattern));
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n' + '=' * 80);
    console.log('📊 REAL ENDPOINT TESTING REPORT');
    console.log('=' * 80);
    console.log(`🎯 Target: ${this.baseUrl}`);
    console.log(`📅 Test Date: ${new Date().toISOString()}`);
    console.log(`⏱️ Total Endpoints: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⏭️ Skipped: ${this.results.skipped}`);
    console.log(`📈 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`);
    
    console.log('\n📋 CATEGORY BREAKDOWN:');
    Object.entries(this.results.categories).forEach(([category, results]) => {
      const successRate = ((results.passed / results.total) * 100).toFixed(2);
      console.log(`  ${category}: ${results.passed}/${results.total} (${successRate}%)`);
    });
    
    console.log('\n🏁 REAL ENDPOINT TESTING COMPLETE');
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
module.exports = RealEndpointDiscovery;

// Run if executed directly
if (require.main === module) {
  const discovery = new RealEndpointDiscovery();
  
  discovery.discoverRealEndpoints()
    .then(() => discovery.testAllEndpoints())
    .catch(console.error);
}
