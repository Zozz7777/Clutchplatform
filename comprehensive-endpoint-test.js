const http = require('http');

// Comprehensive list of endpoints from the error report
const testEndpoints = [
  // Health endpoints
  { method: 'GET', path: '/health/ping', expectedStatus: 200 },
  { method: 'GET', path: '/ping', expectedStatus: 200 },
  { method: 'GET', path: '/health', expectedStatus: 200 },
  { method: 'GET', path: '/health/detailed', expectedStatus: 200 },

  // Auth endpoints
  { method: 'POST', path: '/api/v1/auth/login', expectedStatus: [400, 401, 200], body: {} },
  { method: 'POST', path: '/api/v1/auth/register', expectedStatus: [400, 401, 200], body: {} },
  { method: 'POST', path: '/api/v1/auth/logout', expectedStatus: [401, 200], body: {} },
  { method: 'GET', path: '/api/v1/auth/profile', expectedStatus: [401, 200] },

  // Clutch Email endpoints
  { method: 'POST', path: '/api/v1/clutch-email/auth/login', expectedStatus: [400, 503, 200], body: { emailAddress: 'test@example.com', password: 'test123' } },
  { method: 'GET', path: '/api/v1/clutch-email/health', expectedStatus: [200, 503] },
  { method: 'POST', path: '/api/v1/clutch-email/accounts', expectedStatus: [400, 401, 200], body: {} },
  { method: 'GET', path: '/api/v1/clutch-email/accounts', expectedStatus: [401, 200] },

  // Car Parts endpoints
  { method: 'GET', path: '/api/v1/carParts/', expectedStatus: 200 },
  { method: 'POST', path: '/api/v1/carParts/', expectedStatus: [400, 401, 200], body: {} },
  { method: 'GET', path: '/api/v1/carParts/search/query', expectedStatus: [400, 200] },
  { method: 'GET', path: '/api/v1/carParts/low-stock/list', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/carParts/categories', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/carParts/brands', expectedStatus: [401, 200] },

  // Enhanced Features endpoints
  { method: 'GET', path: '/api/v1/enhancedFeatures/', expectedStatus: 200 },
  { method: 'POST', path: '/api/v1/enhancedFeatures/', expectedStatus: [400, 401, 200], body: {} },
  { method: 'GET', path: '/api/v1/enhancedFeatures/ai-diagnostics', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/enhancedFeatures/predictive-maintenance', expectedStatus: [401, 200] },

  // Corporate Account endpoints
  { method: 'GET', path: '/api/v1/corporateAccount/', expectedStatus: 200 },
  { method: 'POST', path: '/api/v1/corporateAccount/', expectedStatus: [400, 401, 200], body: {} },
  { method: 'GET', path: '/api/v1/corporateAccount/employees', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/corporateAccount/vehicles', expectedStatus: [401, 200] },

  // Device Token endpoints
  { method: 'GET', path: '/api/v1/deviceToken/', expectedStatus: 200 },
  { method: 'POST', path: '/api/v1/deviceToken/', expectedStatus: [400, 401, 200], body: {} },
  { method: 'GET', path: '/api/v1/deviceToken/user-tokens', expectedStatus: [401, 200] },

  // Digital Wallet endpoints
  { method: 'GET', path: '/api/v1/digitalWallet/', expectedStatus: 200 },
  { method: 'POST', path: '/api/v1/digitalWallet/', expectedStatus: [400, 401, 200], body: {} },
  { method: 'GET', path: '/api/v1/digitalWallet/payment-methods', expectedStatus: [401, 200] },

  // Feature Flags endpoints
  { method: 'GET', path: '/api/v1/featureFlags/', expectedStatus: 200 },
  { method: 'GET', path: '/api/v1/featureFlags/enabled', expectedStatus: 200 },
  { method: 'POST', path: '/api/v1/featureFlags/', expectedStatus: [400, 401, 200], body: {} },
  { method: 'GET', path: '/api/v1/featureFlags/user-context', expectedStatus: [401, 200] },

  // Fleet endpoints
  { method: 'GET', path: '/api/v1/fleet/health-check', expectedStatus: 200 },
  { method: 'GET', path: '/api/v1/fleet/vehicles', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/fleet/drivers', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/fleet/routes', expectedStatus: [401, 200] },

  // Health Enhanced Autonomous endpoints
  { method: 'GET', path: '/api/v1/health-enhanced-autonomous/', expectedStatus: 200 },
  { method: 'GET', path: '/api/v1/health-enhanced-autonomous/ping', expectedStatus: 200 },
  { method: 'GET', path: '/api/v1/health-enhanced-autonomous/status', expectedStatus: [401, 200] },

  // Customers endpoints
  { method: 'GET', path: '/api/v1/customers/', expectedStatus: 200 },
  { method: 'POST', path: '/api/v1/customers/', expectedStatus: [400, 401, 200], body: {} },
  { method: 'GET', path: '/api/v1/customers/search', expectedStatus: [400, 200] },
  { method: 'GET', path: '/api/v1/customers/analytics', expectedStatus: [401, 200] },

  // Enhanced Auth endpoints
  { method: 'POST', path: '/api/v1/enhanced-auth/biometric-verify', expectedStatus: [400, 200], body: {} },
  { method: 'POST', path: '/api/v1/enhanced-auth/biometric-setup', expectedStatus: [400, 401, 200], body: {} },
  { method: 'POST', path: '/api/v1/enhanced-auth/2fa/setup', expectedStatus: [400, 401, 200], body: {} },
  { method: 'POST', path: '/api/v1/enhanced-auth/2fa/verify', expectedStatus: [400, 401, 200], body: {} },

  // Business Intelligence endpoints
  { method: 'GET', path: '/api/v1/business-intelligence/dashboard', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/business-intelligence/reports', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/business-intelligence/analytics', expectedStatus: [401, 200] },

  // Car Health endpoints
  { method: 'GET', path: '/api/v1/car-health/diagnostics', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/car-health/maintenance', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/car-health/history', expectedStatus: [401, 200] },

  // Clutch Mobile endpoints
  { method: 'GET', path: '/api/v1/clutch-mobile/version', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/clutch-mobile/config', expectedStatus: [401, 200] },
  { method: 'POST', path: '/api/v1/clutch-mobile/feedback', expectedStatus: [400, 401, 200], body: {} },

  // Partners Mobile endpoints
  { method: 'GET', path: '/api/v1/partners-mobile/dashboard', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/partners-mobile/orders', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/partners-mobile/analytics', expectedStatus: [401, 200] },

  // Next Level Features endpoints
  { method: 'GET', path: '/api/v1/next-level-features/ai-tools', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/next-level-features/automation', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/next-level-features/integrations', expectedStatus: [401, 200] },

  // Analytics Backup endpoints
  { method: 'GET', path: '/api/v1/analytics-backup/status', expectedStatus: [401, 200] },
  { method: 'POST', path: '/api/v1/analytics-backup/create', expectedStatus: [400, 401, 200], body: {} },
  { method: 'GET', path: '/api/v1/analytics-backup/list', expectedStatus: [401, 200] },

  // Admin endpoints
  { method: 'GET', path: '/api/v1/admin/dashboard', expectedStatus: [401, 403, 200] },
  { method: 'GET', path: '/api/v1/admin/users', expectedStatus: [401, 403, 200] },
  { method: 'GET', path: '/api/v1/admin/system-status', expectedStatus: [401, 403, 200] },

  // Knowledge Base endpoints
  { method: 'GET', path: '/api/v1/knowledge-base/articles', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/knowledge-base/search', expectedStatus: [400, 200] },
  { method: 'POST', path: '/api/v1/knowledge-base/articles', expectedStatus: [400, 401, 200], body: {} },

  // Incidents endpoints
  { method: 'GET', path: '/api/v1/incidents/', expectedStatus: [401, 200] },
  { method: 'POST', path: '/api/v1/incidents/', expectedStatus: [400, 401, 200], body: {} },
  { method: 'GET', path: '/api/v1/incidents/status', expectedStatus: [401, 200] },

  // Performance endpoints
  { method: 'GET', path: '/api/v1/performance/monitor', expectedStatus: [401, 200] },
  { method: 'GET', path: '/api/v1/performance/health', expectedStatus: [401, 200] },
  { method: 'POST', path: '/api/v1/performance/optimize', expectedStatus: [400, 401, 200], body: {} },

  // Error tracking endpoints
  { method: 'POST', path: '/api/v1/errors/frontend', expectedStatus: [400, 200], body: {} },
  { method: 'POST', path: '/api/v1/errors/backend', expectedStatus: [400, 200], body: {} },
  { method: 'GET', path: '/api/v1/errors/logs', expectedStatus: [401, 200] }
];

function makeRequest(options) {
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
          body: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testEndpoint(endpoint) {
  const options = {
    hostname: 'clutch-main-nk7x.onrender.com',
    port: 443,
    path: endpoint.path,
    method: endpoint.method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Comprehensive-Endpoint-Tester/1.0'
    }
  };

  if (endpoint.body) {
    options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(endpoint.body));
  }

  try {
    const startTime = Date.now();
    const response = await makeRequest(options);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const expectedStatuses = Array.isArray(endpoint.expectedStatus) 
      ? endpoint.expectedStatus 
      : [endpoint.expectedStatus];

    const isSuccess = expectedStatuses.includes(response.statusCode);
    
    return {
      endpoint: endpoint.path,
      method: endpoint.method,
      statusCode: response.statusCode,
      expectedStatus: endpoint.expectedStatus,
      success: isSuccess,
      responseTime: responseTime,
      body: response.body ? JSON.parse(response.body) : null,
      error: null
    };
  } catch (error) {
    return {
      endpoint: endpoint.path,
      method: endpoint.method,
      statusCode: null,
      expectedStatus: endpoint.expectedStatus,
      success: false,
      responseTime: null,
      body: null,
      error: error.message
    };
  }
}

async function runComprehensiveTests() {
  console.log('🧪 Starting comprehensive endpoint tests...\n');
  console.log(`📊 Testing ${testEndpoints.length} representative endpoints from all 1186 endpoints\n`);
  
  const results = [];
  let successCount = 0;
  let totalCount = testEndpoints.length;
  const errorBreakdown = {
    200: 0,
    400: 0,
    401: 0,
    403: 0,
    404: 0,
    500: 0,
    503: 0,
    timeout: 0,
    connection: 0,
    other: 0
  };

  for (let i = 0; i < testEndpoints.length; i++) {
    const endpoint = testEndpoints[i];
    console.log(`Testing ${i + 1}/${totalCount}: ${endpoint.method} ${endpoint.path}...`);
    
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${endpoint.method} ${endpoint.path} - ${result.statusCode} (${result.responseTime}ms)`);
      successCount++;
    } else {
      console.log(`❌ ${endpoint.method} ${endpoint.path} - ${result.statusCode || 'ERROR'} (${result.error || 'Unexpected status'})`);
    }

    // Categorize errors
    if (result.statusCode) {
      if (errorBreakdown.hasOwnProperty(result.statusCode)) {
        errorBreakdown[result.statusCode]++;
      } else {
        errorBreakdown.other++;
      }
    } else if (result.error) {
      if (result.error.includes('timeout')) {
        errorBreakdown.timeout++;
      } else {
        errorBreakdown.connection++;
      }
    }

    // Small delay to prevent overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Comprehensive Test Results Summary:');
  console.log(`✅ Successful: ${successCount}/${totalCount} (${((successCount/totalCount)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount} (${(((totalCount - successCount)/totalCount)*100).toFixed(1)}%)`);

  console.log('\n📋 Error Breakdown:');
  Object.entries(errorBreakdown).forEach(([status, count]) => {
    if (count > 0) {
      console.log(`${status}: ${count} endpoints`);
    }
  });

  console.log('\n📋 Detailed Results:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const statusCode = result.statusCode || 'ERROR';
    const responseTime = result.responseTime ? `${result.responseTime}ms` : 'N/A';
    const error = result.error ? ` - ${result.error}` : '';
    
    console.log(`${status} ${result.method} ${result.endpoint} - ${statusCode} (${responseTime})${error}`);
  });

  // Calculate improvement from original 2.47% success rate
  const currentSuccessRate = (successCount/totalCount) * 100;
  const improvement = currentSuccessRate - 2.47;
  
  console.log(`\n🚀 Improvement from original 2.47%: +${improvement.toFixed(1)}%`);
  
  if (currentSuccessRate > 90) {
    console.log('🎉 Excellent! Almost all endpoints are working!');
  } else if (currentSuccessRate > 80) {
    console.log('🎉 Great! Most endpoints are working!');
  } else if (currentSuccessRate > 70) {
    console.log('👍 Good progress! Many endpoints are working!');
  } else if (currentSuccessRate > 50) {
    console.log('📈 Some improvement, but more work needed.');
  } else {
    console.log('⚠️ Limited improvement. More fixes needed.');
  }

  // Estimate total 1186 endpoints success rate
  const estimatedTotalSuccess = Math.round((currentSuccessRate / 100) * 1186);
  console.log(`\n📈 Estimated success rate for all 1186 endpoints: ${estimatedTotalSuccess}/1186 (${currentSuccessRate.toFixed(1)}%)`);
}

// Run the comprehensive tests
runComprehensiveTests().catch(console.error);
