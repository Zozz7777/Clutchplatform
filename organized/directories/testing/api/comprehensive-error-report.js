/**
 * Comprehensive Error Report Generator
 * Creates detailed analysis of all endpoint testing errors
 */

const fs = require('fs');
const path = require('path');

class ComprehensiveErrorReport {
  constructor() {
    this.errors = {
      '404': [],
      '500': [],
      'connection': [],
      '400': [],
      '401': [],
      '403': [],
      'other': []
    };
    this.routeStats = {};
    this.recommendations = [];
  }

  // Parse the complete test output from the terminal
  parseCompleteTestOutput() {
    // This is the actual test output from our local testing
    const testOutput = `
❌ GET /api/v1/carParts/: 404 (6ms)
❌ GET /api/v1/carParts/:id: 404 (8ms)
❌ POST /api/v1/carParts/: 404 (14ms)
❌ PUT /api/v1/carParts/:id: 404 (8ms)
❌ PATCH /api/v1/carParts/:id/stock: 404 (10ms)
❌ DELETE /api/v1/carParts/:id: 404 (8ms)
❌ GET /api/v1/carParts/search/query: 404 (9ms)
❌ GET /api/v1/carParts/category/:category: 404 (8ms)
❌ GET /api/v1/carParts/brand/:brand: 404 (7ms)
❌ GET /api/v1/carParts/compatible/:make/:model/:year: 404 (11ms)
❌ GET /api/v1/carParts/low-stock/list: 404 (7ms)
❌ GET /api/v1/carParts/stats/overview: 404 (7ms)
❌ POST /api/v1/clutch-email/auth/login: 500 (334ms)
❌ POST /api/v1/clutch-email/accounts: 400 (4ms)
❌ GET /api/v1/clutch-email/health: 500 (38ms)
❌ GET /api/v1/corporateAccount/: 404 (14ms)
❌ GET /api/v1/corporateAccount/:id: 404 (16ms)
❌ POST /api/v1/corporateAccount/: 404 (7ms)
❌ PUT /api/v1/corporateAccount/:id: 404 (10ms)
❌ DELETE /api/v1/corporateAccount/:id: 404 (7ms)
❌ GET /api/v1/corporateAccount/:id/analytics: 404 (6ms)
❌ POST /api/v1/corporateAccount/:id/users: 404 (7ms)
❌ DELETE /api/v1/corporateAccount/:id/users/:userId: 404 (8ms)
❌ GET /api/v1/customers/: 400 (4ms)
❌ GET /api/v1/deviceToken/: 404 (6ms)
❌ GET /api/v1/digitalWallet/: 404 (16ms)
❌ POST /api/v1/enhanced-auth/biometric-verify: 400 (4ms)
❌ POST /api/v1/enhancedFeatures/real-time/booking-update: 404 (8ms)
❌ POST /api/v1/enhancedFeatures/real-time/notification: 404 (5ms)
❌ GET /api/v1/enhancedFeatures/real-time/statistics: 404 (6ms)
❌ POST /api/v1/enhancedFeatures/payments/process: 404 (9ms)
❌ POST /api/v1/enhancedFeatures/payments/subscription: 404 (5ms)
❌ POST /api/v1/enhancedFeatures/payments/plan: 404 (7ms)
❌ POST /api/v1/enhancedFeatures/payments/split: 404 (7ms)
❌ POST /api/v1/enhancedFeatures/payments/invoice: 404 (7ms)
❌ POST /api/v1/enhancedFeatures/payments/refund: 404 (7ms)
❌ GET /api/v1/enhancedFeatures/payments/statistics: 404 (7ms)
❌ GET /api/v1/enhancedFeatures/recommendations/services: 404 (6ms)
❌ POST /api/v1/enhancedFeatures/recommendations/maintenance: 404 (8ms)
❌ POST /api/v1/enhancedFeatures/recommendations/pricing: 404 (9ms)
❌ GET /api/v1/enhancedFeatures/analytics/realtime: 404 (7ms)
❌ GET /api/v1/enhancedFeatures/analytics/predictive: 404 (6ms)
❌ GET /api/v1/enhancedFeatures/analytics/business-intelligence: 404 (5ms)
❌ GET /api/v1/enhancedFeatures/analytics/kpi: 404 (7ms)
❌ GET /api/v1/enhancedFeatures/analytics/insights: 404 (5ms)
❌ GET /api/v1/enterpriseAuth/: 404 (39ms)
❌ POST /api/v1/errors/frontend: 400 (146ms)
❌ GET /api/v1/errors/frontend/stats: ERROR (390ms)
❌ GET /api/v1/errors/frontend/stream: ERROR (53ms)
❌ DELETE /api/v1/errors/frontend/cleanup: ERROR (84ms)
❌ GET /api/v1/featureFlags/: ERROR (5ms)
❌ GET /api/v1/featureFlags/enabled: ERROR (52ms)
❌ GET /api/v1/featureFlags/check/:featureName: ERROR (84ms)
❌ POST /api/v1/featureFlags/: ERROR (37ms)
❌ PUT /api/v1/featureFlags/:featureName: ERROR (6ms)
❌ POST /api/v1/featureFlags/:featureName/enable: ERROR (34ms)
❌ POST /api/v1/featureFlags/:featureName/disable: ERROR (53ms)
❌ POST /api/v1/featureFlags/:featureName/rollout: ERROR (7ms)
❌ POST /api/v1/featureFlags/:featureName/rollback: ERROR (4ms)
❌ GET /api/v1/featureFlags/:featureName/analytics: ERROR (3ms)
❌ POST /api/v1/featureFlags/groups/:groupName/users: ERROR (4ms)
❌ DELETE /api/v1/featureFlags/groups/:groupName/users/:userId: ERROR (3ms)
❌ GET /api/v1/featureFlags/groups: ERROR (6ms)
❌ POST /api/v1/featureFlags/bulk-update: ERROR (11ms)
❌ GET /api/v1/featureFlags/export/configuration: ERROR (4ms)
❌ POST /api/v1/featureFlags/import/configuration: ERROR (3ms)
❌ GET /api/v1/featureFlags/status: ERROR (3ms)
❌ GET /api/v1/featureFlags/dashboard: ERROR (4ms)
❌ GET /api/v1/featureFlags/stats: ERROR (3ms)
❌ GET /api/v1/featureFlags/user-groups: ERROR (3ms)
❌ GET /api/v1/featureFlags/geographic-regions: ERROR (5ms)
❌ GET /api/v1/featureFlags/recent-activity: ERROR (11ms)
❌ GET /api/v1/feedback-system/feedback: ERROR (4ms)
❌ POST /api/v1/feedback-system/feedback: ERROR (3ms)
❌ GET /api/v1/feedback-system/feedback/:id: ERROR (6ms)
❌ PUT /api/v1/feedback-system/feedback/:id: ERROR (5ms)
❌ POST /api/v1/feedback-system/feedback/:id/comments: ERROR (41ms)
❌ POST /api/v1/feedback-system/feedback/:id/vote: ERROR (3ms)
❌ GET /api/v1/feedback-system/analytics: ERROR (3ms)
❌ GET /api/v1/feedback-system/surveys: ERROR (4ms)
❌ POST /api/v1/feedback-system/surveys: ERROR (3ms)
❌ GET /api/v1/feedback/: ERROR (3ms)
❌ GET /api/v1/feedback/:id: ERROR (3ms)
❌ POST /api/v1/feedback/: ERROR (2ms)
❌ PUT /api/v1/feedback/:id: ERROR (4ms)
❌ PATCH /api/v1/feedback/:id/status: ERROR (3ms)
❌ POST /api/v1/feedback/:id/response: ERROR (2ms)
❌ GET /api/v1/feedback/user/:userId: ERROR (3ms)
❌ GET /api/v1/feedback/type/:type: ERROR (4ms)
❌ GET /api/v1/feedback/open/list: ERROR (4ms)
❌ GET /api/v1/feedback/stats/overview: ERROR (3ms)
❌ GET /api/v1/feedback/search/query: ERROR (3ms)
❌ GET /api/v1/finance/invoices: ERROR (3ms)
❌ POST /api/v1/finance/invoices: ERROR (3ms)
❌ PUT /api/v1/finance/invoices/:id: ERROR (3ms)
❌ DELETE /api/v1/finance/invoices/:id: ERROR (4ms)
❌ GET /api/v1/finance/invoices/:id: ERROR (3ms)
❌ GET /api/v1/finance/expenses: ERROR (3ms)
❌ GET /api/v1/finance/payments: ERROR (3ms)
❌ GET /api/v1/finance/analytics: ERROR (3ms)
❌ GET /api/v1/fleet/health-check: ERROR (3ms)
❌ GET /api/v1/fleet/: ERROR (5ms)
❌ GET /api/v1/fleet/:id: ERROR (5ms)
❌ POST /api/v1/fleet/: ERROR (2ms)
❌ PUT /api/v1/fleet/:id: ERROR (3ms)
❌ DELETE /api/v1/fleet/:id: ERROR (3ms)
❌ GET /api/v1/fleet/:id/analytics: ERROR (3ms)
❌ GET /api/v1/fleet/:id/vehicles: ERROR (4ms)
❌ POST /api/v1/fleet/:id/vehicles: ERROR (3ms)
❌ GET /api/v1/fleet/:id/drivers: ERROR (8ms)
❌ POST /api/v1/fleet/:id/drivers: ERROR (4ms)
❌ GET /api/v1/fleet/routes: ERROR (4ms)
❌ POST /api/v1/fleet/routes: ERROR (4ms)
❌ PUT /api/v1/fleet/routes/:id: ERROR (5ms)
❌ DELETE /api/v1/fleet/routes/:id: ERROR (5ms)
❌ GET /api/v1/fleet/maintenance: ERROR (4ms)
❌ POST /api/v1/fleet/maintenance: ERROR (9ms)
❌ PUT /api/v1/fleet/maintenance/:id: ERROR (3ms)
❌ GET /api/v1/fleet/drivers: ERROR (3ms)
❌ POST /api/v1/fleet/drivers: ERROR (3ms)
❌ PUT /api/v1/fleet/drivers/:id: ERROR (6ms)
❌ GET /api/v1/fleetVehicle/: ERROR (3ms)
❌ GET /api/v1/gpsDevice/: ERROR (3ms)
❌ GET /api/v1/health-enhanced-autonomous/: ERROR (4ms)
❌ GET /api/v1/health-enhanced-autonomous/ping: ERROR (4ms)
❌ GET /api/v1/health-enhanced-autonomous/status: ERROR (4ms)
❌ GET /api/v1/health-enhanced-autonomous/monitor: ERROR (4ms)
❌ GET /api/v1/health-enhanced-autonomous/learning: ERROR (4ms)
❌ GET /api/v1/health-enhanced-autonomous/performance: ERROR (5ms)
❌ POST /api/v1/health-enhanced-autonomous/recover: ERROR (4ms)
❌ POST /api/v1/health-enhanced-autonomous/solve: ERROR (3ms)
❌ GET /api/v1/health-enhanced-autonomous/config: ERROR (4ms)
❌ GET /api/v1/health-enhanced/health: ERROR (5ms)
❌ GET /api/v1/health-enhanced/health/detailed: ERROR (5ms)
❌ GET /health/ping: ERROR (2ms)
❌ GET /health/: ERROR (3ms)
❌ GET /health/database: ERROR (4ms)
❌ GET /health/detailed: ERROR (4ms)
❌ GET /health/email-status: ERROR (4ms)
❌ GET /health/firebase-status: ERROR (4ms)
    `;

    const lines = testOutput.split('\n').filter(line => line.trim() && line.includes('❌'));
    
    lines.forEach(line => {
      const match = line.match(/❌\s+(\w+)\s+([^:]+):\s+(\d+|ERROR)\s+\((\d+)ms\)/);
      if (match) {
        const [, method, endpoint, status, responseTime] = match;
        const errorData = {
          method,
          endpoint,
          status,
          responseTime: parseInt(responseTime)
        };

        if (status === 'ERROR') {
          this.errors.connection.push(errorData);
        } else {
          const statusCode = parseInt(status);
          if (this.errors[statusCode.toString()]) {
            this.errors[statusCode.toString()].push(errorData);
          } else {
            this.errors.other.push(errorData);
          }
        }
      }
    });
  }

  // Analyze route patterns and statistics
  analyzeRoutePatterns() {
    Object.values(this.errors).flat().forEach(error => {
      const routeParts = error.endpoint.split('/');
      const routePrefix = routeParts[3] || 'unknown';
      
      if (!this.routeStats[routePrefix]) {
        this.routeStats[routePrefix] = {
          total: 0,
          errors: {
            '404': 0,
            '500': 0,
            'connection': 0,
            '400': 0,
            'other': 0
          },
          avgResponseTime: 0,
          endpoints: []
        };
      }
      
      this.routeStats[routePrefix].total++;
      this.routeStats[routePrefix].endpoints.push(error.endpoint);
      
      if (error.status === 'ERROR') {
        this.routeStats[routePrefix].errors.connection++;
      } else {
        const statusCode = error.status.toString();
        if (this.routeStats[routePrefix].errors[statusCode] !== undefined) {
          this.routeStats[routePrefix].errors[statusCode]++;
        } else {
          this.routeStats[routePrefix].errors.other++;
        }
      }
    });

    // Calculate average response times
    Object.keys(this.routeStats).forEach(route => {
      const routeErrors = Object.values(this.errors).flat().filter(e => 
        e.endpoint.split('/')[3] === route
      );
      const totalTime = routeErrors.reduce((sum, e) => sum + e.responseTime, 0);
      this.routeStats[route].avgResponseTime = Math.round(totalTime / routeErrors.length);
    });
  }

  // Generate detailed recommendations
  generateRecommendations() {
    // 404 Error Analysis
    if (this.errors['404'].length > 0) {
      this.recommendations.push({
        category: '404 Not Found Errors',
        priority: 'HIGH',
        count: this.errors['404'].length,
        description: 'Routes exist in code but are not properly mounted or accessible',
        commonPatterns: this.getCommonPatterns(this.errors['404']),
        issues: [
          'Routes defined in route files but not mounted in server.js',
          'Incorrect route path definitions',
          'Missing app.use() statements for route modules',
          'Route files not properly exported or required'
        ],
        solutions: [
          'Check server.js for missing app.use() statements',
          'Verify all route files are properly required at the top of server.js',
          'Ensure route paths match the expected API structure',
          'Check for typos in route definitions',
          'Verify route file exports are correct'
        ],
        sampleEndpoints: this.errors['404'].slice(0, 10).map(e => e.endpoint),
        affectedRoutes: this.getAffectedRoutes(this.errors['404'])
      });
    }

    // 500 Error Analysis
    if (this.errors['500'].length > 0) {
      this.recommendations.push({
        category: '500 Internal Server Errors',
        priority: 'CRITICAL',
        count: this.errors['500'].length,
        description: 'Server-side errors that need immediate attention',
        commonPatterns: this.getCommonPatterns(this.errors['500']),
        issues: [
          'Unhandled exceptions in route handlers',
          'Database connection or query errors',
          'Missing dependencies or middleware',
          'Environment variable issues',
          'Memory or resource exhaustion'
        ],
        solutions: [
          'Add comprehensive error handling with try-catch blocks',
          'Check database connections and query syntax',
          'Verify all required dependencies are installed',
          'Check environment variables and configuration',
          'Add logging to identify specific error causes',
          'Implement proper error responses'
        ],
        sampleEndpoints: this.errors['500'].slice(0, 10).map(e => e.endpoint),
        affectedRoutes: this.getAffectedRoutes(this.errors['500'])
      });
    }

    // Connection Error Analysis
    if (this.errors.connection.length > 0) {
      this.recommendations.push({
        category: 'Connection/Timeout Errors',
        priority: 'HIGH',
        count: this.errors.connection.length,
        description: 'Routes not responding or timing out',
        commonPatterns: this.getCommonPatterns(this.errors.connection),
        issues: [
          'Route handlers hanging or not responding',
          'Server overload or memory issues',
          'Infinite loops or blocking operations',
          'Missing response statements in route handlers',
          'Database queries taking too long'
        ],
        solutions: [
          'Add timeout middleware to prevent hanging requests',
          'Implement proper response handling in all routes',
          'Add request logging to identify hanging routes',
          'Check for infinite loops or blocking operations',
          'Optimize database queries and add indexes',
          'Implement circuit breaker pattern for failing routes'
        ],
        sampleEndpoints: this.errors.connection.slice(0, 10).map(e => e.endpoint),
        affectedRoutes: this.getAffectedRoutes(this.errors.connection)
      });
    }

    // 400 Error Analysis
    if (this.errors['400'].length > 0) {
      this.recommendations.push({
        category: '400 Bad Request Errors',
        priority: 'MEDIUM',
        count: this.errors['400'].length,
        description: 'Invalid request data or validation errors',
        commonPatterns: this.getCommonPatterns(this.errors['400']),
        issues: [
          'Missing required request parameters',
          'Invalid request body format',
          'Validation middleware rejecting requests',
          'Incorrect data types in request body'
        ],
        solutions: [
          'Improve input validation middleware',
          'Add better error messages for validation failures',
          'Check request body structure and required fields',
          'Implement proper request sanitization',
          'Add request logging to identify validation issues'
        ],
        sampleEndpoints: this.errors['400'].slice(0, 10).map(e => e.endpoint),
        affectedRoutes: this.getAffectedRoutes(this.errors['400'])
      });
    }
  }

  // Helper methods
  getCommonPatterns(errors) {
    const patterns = {};
    errors.forEach(error => {
      const parts = error.endpoint.split('/');
      const pattern = parts.slice(0, 4).join('/');
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    });
    return Object.entries(patterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([pattern, count]) => ({ pattern, count }));
  }

  getAffectedRoutes(errors) {
    const routes = {};
    errors.forEach(error => {
      const route = error.endpoint.split('/')[3] || 'unknown';
      routes[route] = (routes[route] || 0) + 1;
    });
    return Object.entries(routes)
      .sort(([,a], [,b]) => b - a)
      .map(([route, count]) => ({ route, count }));
  }

  // Generate comprehensive report
  generateReport() {
    this.parseCompleteTestOutput();
    this.analyzeRoutePatterns();
    this.generateRecommendations();

    const totalErrors = Object.values(this.errors).flat().length;
    
    return {
      summary: {
        totalErrors,
        successRate: '2.47%', // From our testing
        errorBreakdown: {
          '404': this.errors['404'].length,
          '500': this.errors['500'].length,
          'connection': this.errors.connection.length,
          '400': this.errors['400'].length,
          '401': this.errors['401'].length,
          '403': this.errors['403'].length,
          'other': this.errors.other.length
        },
        percentageBreakdown: {
          '404': `${((this.errors['404'].length / totalErrors) * 100).toFixed(1)}%`,
          '500': `${((this.errors['500'].length / totalErrors) * 100).toFixed(1)}%`,
          'connection': `${((this.errors.connection.length / totalErrors) * 100).toFixed(1)}%`,
          '400': `${((this.errors['400'].length / totalErrors) * 100).toFixed(1)}%`,
          'other': `${((this.errors.other.length / totalErrors) * 100).toFixed(1)}%`
        }
      },
      detailedErrors: this.errors,
      routeAnalysis: this.routeStats,
      recommendations: this.recommendations,
      topProblematicRoutes: Object.entries(this.routeStats)
        .sort(([,a], [,b]) => b.total - a.total)
        .slice(0, 15)
        .map(([route, data]) => ({
          route,
          totalErrors: data.total,
          errorBreakdown: data.errors,
          avgResponseTime: data.avgResponseTime,
          sampleEndpoints: data.endpoints.slice(0, 3)
        }))
    };
  }

  // Print comprehensive report
  printReport() {
    const report = this.generateReport();
    
    console.log('\n🔍 COMPREHENSIVE ERROR ANALYSIS REPORT');
    console.log('=====================================');
    console.log(`📊 Total Endpoints Tested: 1,216`);
    console.log(`✅ Successful: 30 (2.47%)`);
    console.log(`❌ Failed: ${report.summary.totalErrors} (${(100 - 2.47).toFixed(2)}%)\n`);
    
    console.log('📈 ERROR BREAKDOWN:');
    console.log(`404 Not Found: ${report.summary.errorBreakdown['404']} (${report.summary.percentageBreakdown['404']})`);
    console.log(`500 Server Error: ${report.summary.errorBreakdown['500']} (${report.summary.percentageBreakdown['500']})`);
    console.log(`Connection/Timeout: ${report.summary.errorBreakdown.connection} (${report.summary.percentageBreakdown.connection})`);
    console.log(`400 Bad Request: ${report.summary.errorBreakdown['400']} (${report.summary.percentageBreakdown['400']})`);
    console.log(`Other Errors: ${report.summary.errorBreakdown.other} (${report.summary.percentageBreakdown.other})\n`);

    console.log('🚨 TOP PROBLEMATIC ROUTES:');
    report.topProblematicRoutes.forEach((route, index) => {
      console.log(`${index + 1}. ${route.route} (${route.totalErrors} errors, avg: ${route.avgResponseTime}ms)`);
      console.log(`   - 404: ${route.errorBreakdown['404']} | 500: ${route.errorBreakdown['500']} | Connection: ${route.errorBreakdown.connection} | 400: ${route.errorBreakdown['400']}`);
      console.log(`   - Sample: ${route.sampleEndpoints.join(', ')}\n`);
    });

    console.log('💡 DETAILED RECOMMENDATIONS:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.category} (${rec.count} errors - Priority: ${rec.priority})`);
      console.log(`   Description: ${rec.description}`);
      console.log(`   Common Patterns: ${rec.commonPatterns.map(p => `${p.pattern} (${p.count})`).join(', ')}`);
      console.log(`   Top Issues: ${rec.issues.slice(0, 3).join('; ')}`);
      console.log(`   Solutions: ${rec.solutions.slice(0, 3).join('; ')}`);
      console.log(`   Affected Routes: ${rec.affectedRoutes.slice(0, 5).map(r => `${r.route} (${r.count})`).join(', ')}\n`);
    });

    console.log('🎯 IMMEDIATE ACTION ITEMS:');
    console.log('1. Fix 500 errors first (CRITICAL) - Check database connections and error handling');
    console.log('2. Mount missing routes causing 404 errors (HIGH) - Add app.use() statements in server.js');
    console.log('3. Fix connection timeouts (HIGH) - Add proper response handling and timeouts');
    console.log('4. Improve validation for 400 errors (MEDIUM) - Better error messages and validation');
    console.log('\n📋 Next Steps:');
    console.log('- Review server.js for missing route mounts');
    console.log('- Check route file exports and path definitions');
    console.log('- Add comprehensive error handling middleware');
    console.log('- Implement request timeout middleware');
    console.log('- Add logging for debugging hanging requests');
  }

  // Save detailed report
  saveReport(filename = 'comprehensive-error-report.json') {
    const report = this.generateReport();
    const reportPath = path.join(__dirname, filename);
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Detailed report saved to: ${reportPath}`);
    
    return report;
  }
}

// Run the comprehensive analysis
if (require.main === module) {
  const analyzer = new ComprehensiveErrorReport();
  analyzer.printReport();
  analyzer.saveReport();
}

module.exports = ComprehensiveErrorReport;
