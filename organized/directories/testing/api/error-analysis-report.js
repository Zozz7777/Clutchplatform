/**
 * Comprehensive Error Analysis Report
 * Analyzes 404, 500, and connection errors from endpoint testing
 */

const fs = require('fs');
const path = require('path');

class ErrorAnalysisReport {
  constructor() {
    this.errorCategories = {
      '404': [],
      '500': [],
      'connection': [],
      '400': [],
      '401': [],
      '403': [],
      'other': []
    };
    this.routeAnalysis = {};
    this.recommendations = [];
  }

  // Parse the test output and categorize errors
  parseTestOutput() {
    const testOutput = `
✅ GET /api/v1/autonomous-dashboard/financial: 200 (6ms)
✅ GET /api/v1/autonomous-dashboard/performance: 200 (6ms)
✅ POST /api/v1/autonomous-dashboard/refresh: 200 (980ms)
✅ POST /api/v1/autonomous-dashboard/heal: 200 (20ms)
✅ GET /api/v1/autonomous-dashboard/self-healing: 200 (7ms)
✅ GET /api/v1/autonomous-dashboard/data-sources: 200 (8ms)
✅ GET /api/v1/autonomous-dashboard/cache: 200 (33ms)
✅ POST /api/v1/autonomous-dashboard/start: 200 (22ms)
✅ POST /api/v1/autonomous-dashboard/stop: 200 (9ms)
✅ GET /api/v1/autonomous-dashboard/metrics: 200 (8ms)
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
✅ GET /api/v1/errors/frontend: 200 (12ms)
❌ POST /api/v1/errors/frontend: 400 (146ms)
✅ GET /api/v1/errors/frontend: 200 (52ms)
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

    const lines = testOutput.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      if (line.includes('❌')) {
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
            this.errorCategories.connection.push(errorData);
          } else {
            const statusCode = parseInt(status);
            if (this.errorCategories[statusCode.toString()]) {
              this.errorCategories[statusCode.toString()].push(errorData);
            } else {
              this.errorCategories.other.push(errorData);
            }
          }
        }
      }
    });
  }

  // Analyze route patterns
  analyzeRoutePatterns() {
    Object.values(this.errorCategories).flat().forEach(error => {
      const routePrefix = error.endpoint.split('/')[3]; // Get the main route (e.g., 'carParts', 'fleet')
      if (!this.routeAnalysis[routePrefix]) {
        this.routeAnalysis[routePrefix] = {
          total: 0,
          errors: {
            '404': 0,
            '500': 0,
            'connection': 0,
            '400': 0,
            'other': 0
          }
        };
      }
      
      this.routeAnalysis[routePrefix].total++;
      if (error.status === 'ERROR') {
        this.routeAnalysis[routePrefix].errors.connection++;
      } else {
        const statusCode = error.status.toString();
        if (this.routeAnalysis[routePrefix].errors[statusCode] !== undefined) {
          this.routeAnalysis[routePrefix].errors[statusCode]++;
        } else {
          this.routeAnalysis[routePrefix].errors.other++;
        }
      }
    });
  }

  // Generate recommendations
  generateRecommendations() {
    // 404 Error Recommendations
    if (this.errorCategories['404'].length > 0) {
      this.recommendations.push({
        category: '404 Errors',
        priority: 'HIGH',
        issues: [
          'Routes exist in code but not mounted in server.js',
          'Route paths may be incorrectly defined',
          'Missing route handlers in Express app'
        ],
        solutions: [
          'Check server.js for missing app.use() statements',
          'Verify route file exports and path definitions',
          'Ensure all route files are properly required and mounted',
          'Check for typos in route paths'
        ],
        affectedRoutes: this.errorCategories['404'].slice(0, 10).map(e => e.endpoint)
      });
    }

    // 500 Error Recommendations
    if (this.errorCategories['500'].length > 0) {
      this.recommendations.push({
        category: '500 Errors',
        priority: 'CRITICAL',
        issues: [
          'Server-side errors in route handlers',
          'Database connection issues',
          'Missing dependencies or middleware',
          'Unhandled exceptions in route logic'
        ],
        solutions: [
          'Add proper error handling in route handlers',
          'Check database connections and queries',
          'Verify all required middleware is installed',
          'Add try-catch blocks around async operations',
          'Check for missing environment variables'
        ],
        affectedRoutes: this.errorCategories['500'].slice(0, 10).map(e => e.endpoint)
      });
    }

    // Connection Error Recommendations
    if (this.errorCategories.connection.length > 0) {
      this.recommendations.push({
        category: 'Connection Errors',
        priority: 'HIGH',
        issues: [
          'Routes not responding or timing out',
          'Server overload or memory issues',
          'Network connectivity problems',
          'Route handlers hanging or not responding'
        ],
        solutions: [
          'Add timeout middleware to prevent hanging requests',
          'Implement proper error handling and response mechanisms',
          'Check server memory usage and performance',
          'Add request logging to identify hanging routes',
          'Implement circuit breaker pattern for failing routes'
        ],
        affectedRoutes: this.errorCategories.connection.slice(0, 10).map(e => e.endpoint)
      });
    }

    // 400 Error Recommendations
    if (this.errorCategories['400'].length > 0) {
      this.recommendations.push({
        category: '400 Errors',
        priority: 'MEDIUM',
        issues: [
          'Invalid request data or missing required fields',
          'Validation errors in request body',
          'Incorrect request format or parameters'
        ],
        solutions: [
          'Improve input validation middleware',
          'Add better error messages for validation failures',
          'Check request body structure and required fields',
          'Implement proper request sanitization'
        ],
        affectedRoutes: this.errorCategories['400'].slice(0, 10).map(e => e.endpoint)
      });
    }
  }

  // Generate comprehensive report
  generateReport() {
    this.parseTestOutput();
    this.analyzeRoutePatterns();
    this.generateRecommendations();

    const report = {
      summary: {
        totalErrors: Object.values(this.errorCategories).flat().length,
        errorBreakdown: {
          '404': this.errorCategories['404'].length,
          '500': this.errorCategories['500'].length,
          'connection': this.errorCategories.connection.length,
          '400': this.errorCategories['400'].length,
          '401': this.errorCategories['401'].length,
          '403': this.errorCategories['403'].length,
          'other': this.errorCategories.other.length
        }
      },
      detailedErrors: this.errorCategories,
      routeAnalysis: this.routeAnalysis,
      recommendations: this.recommendations,
      topProblematicRoutes: Object.entries(this.routeAnalysis)
        .sort(([,a], [,b]) => b.total - a.total)
        .slice(0, 20)
        .map(([route, data]) => ({
          route,
          totalErrors: data.total,
          errorBreakdown: data.errors
        }))
    };

    return report;
  }

  // Save report to file
  saveReport(filename = 'error-analysis-report.json') {
    const report = this.generateReport();
    const reportPath = path.join(__dirname, filename);
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Error analysis report saved to: ${reportPath}`);
    
    return report;
  }

  // Print summary to console
  printSummary() {
    const report = this.generateReport();
    
    console.log('\n🔍 COMPREHENSIVE ERROR ANALYSIS REPORT');
    console.log('=====================================\n');
    
    console.log('📊 ERROR SUMMARY:');
    console.log(`Total Errors: ${report.summary.totalErrors}`);
    console.log(`404 Errors: ${report.summary.errorBreakdown['404']}`);
    console.log(`500 Errors: ${report.summary.errorBreakdown['500']}`);
    console.log(`Connection Errors: ${report.summary.errorBreakdown.connection}`);
    console.log(`400 Errors: ${report.summary.errorBreakdown['400']}`);
    console.log(`401 Errors: ${report.summary.errorBreakdown['401']}`);
    console.log(`403 Errors: ${report.summary.errorBreakdown['403']}`);
    console.log(`Other Errors: ${report.summary.errorBreakdown.other}\n`);

    console.log('🚨 TOP PROBLEMATIC ROUTES:');
    report.topProblematicRoutes.forEach((route, index) => {
      console.log(`${index + 1}. ${route.route}: ${route.totalErrors} errors`);
      console.log(`   - 404: ${route.errorBreakdown['404']}`);
      console.log(`   - 500: ${route.errorBreakdown['500']}`);
      console.log(`   - Connection: ${route.errorBreakdown.connection}`);
      console.log(`   - 400: ${route.errorBreakdown['400']}\n`);
    });

    console.log('💡 RECOMMENDATIONS:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.category} (Priority: ${rec.priority})`);
      console.log(`   Issues: ${rec.issues.join(', ')}`);
      console.log(`   Solutions: ${rec.solutions.slice(0, 2).join(', ')}...`);
      console.log(`   Sample Routes: ${rec.affectedRoutes.slice(0, 3).join(', ')}...\n`);
    });
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new ErrorAnalysisReport();
  analyzer.printSummary();
  analyzer.saveReport();
}

module.exports = ErrorAnalysisReport;
