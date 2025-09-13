/**
 * Endpoint Analyzer
 * Analyzes endpoint issues and provides detailed error breakdown
 */

const https = require('https');

console.log('🔍 Starting Endpoint Analysis');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('='.repeat(60));

// Test endpoints with different error types
const testEndpoints = [
  // Validation errors (400) - need proper request bodies
  { path: '/api/v1/auth/login', method: 'POST', name: 'Auth Login', expectedError: 400 },
  { path: '/api/v1/auth/register', method: 'POST', name: 'Auth Register', expectedError: 400 },
  { path: '/api/v1/bookings', method: 'POST', name: 'Create Booking', expectedError: 400 },
  { path: '/api/v1/payments', method: 'POST', name: 'Create Payment', expectedError: 400 },
  { path: '/api/v1/communication/chat', method: 'POST', name: 'Send Message', expectedError: 400 },
  
  // Not found errors (404) - endpoints that don't exist
  { path: '/api/v1/nonexistent', method: 'GET', name: 'Non-existent Endpoint', expectedError: 404 },
  { path: '/api/v1/fleet/vehicles/999999', method: 'GET', name: 'Non-existent Vehicle', expectedError: 404 },
  { path: '/api/v1/bookings/999999', method: 'GET', name: 'Non-existent Booking', expectedError: 404 },
  { path: '/api/v1/admin/users/999999', method: 'GET', name: 'Non-existent User', expectedError: 404 },
  
  // Server errors (500) - internal server issues
  { path: '/api/v1/performance/monitor', method: 'GET', name: 'Performance Monitor', expectedError: 500 },
  { path: '/api/v1/admin/system-health', method: 'GET', name: 'System Health', expectedError: 500 },
  { path: '/api/v1/analytics', method: 'GET', name: 'Analytics', expectedError: 500 }
];

let analysisResults = {
  validationErrors: [],
  notFoundErrors: [],
  serverErrors: [],
  workingEndpoints: [],
  total: 0
};

function analyzeEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'clutch-main-nk7x.onrender.com',
      port: 443,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Endpoint-Analyzer/1.0'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        analysisResults.total++;
        
        const result = {
          name: endpoint.name,
          path: endpoint.path,
          method: endpoint.method,
          status: res.statusCode,
          expectedError: endpoint.expectedError,
          actualError: res.statusCode
        };
        
        if (res.statusCode === 400) {
          analysisResults.validationErrors.push(result);
          console.log(`🔴 Validation Error: ${endpoint.name} - ${res.statusCode}`);
        } else if (res.statusCode === 404) {
          analysisResults.notFoundErrors.push(result);
          console.log(`🟡 Not Found: ${endpoint.name} - ${res.statusCode}`);
        } else if (res.statusCode >= 500) {
          analysisResults.serverErrors.push(result);
          console.log(`🔴 Server Error: ${endpoint.name} - ${res.statusCode}`);
        } else if (res.statusCode >= 200 && res.statusCode < 400) {
          analysisResults.workingEndpoints.push(result);
          console.log(`✅ Working: ${endpoint.name} - ${res.statusCode}`);
        } else {
          console.log(`⚪ Other: ${endpoint.name} - ${res.statusCode}`);
        }
        
        resolve();
      });
    });

    req.on('error', (error) => {
      analysisResults.total++;
      console.log(`💥 Error: ${endpoint.name} - ${error.message}`);
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      analysisResults.total++;
      console.log(`⏰ Timeout: ${endpoint.name}`);
      resolve();
    });

    // Send appropriate request body
    if (endpoint.method === 'POST') {
      if (endpoint.path.includes('auth/login')) {
        req.write(JSON.stringify({ email: 'test@example.com', password: 'testpassword' }));
      } else if (endpoint.path.includes('auth/register')) {
        req.write(JSON.stringify({ 
          email: 'test@example.com', 
          password: 'testpassword', 
          firstName: 'Test', 
          lastName: 'User' 
        }));
      } else {
        req.write(JSON.stringify({ test: true }));
      }
    }
    
    req.end();
  });
}

async function runAnalysis() {
  console.log(`\n🔄 Analyzing ${testEndpoints.length} endpoints...\n`);
  
  for (const endpoint of testEndpoints) {
    await analyzeEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Generate analysis report
  console.log('\n' + '='.repeat(60));
  console.log('📊 ENDPOINT ANALYSIS REPORT');
  console.log('='.repeat(60));
  
  console.log(`\n🔴 VALIDATION ERRORS (400): ${analysisResults.validationErrors.length}`);
  analysisResults.validationErrors.forEach((error, index) => {
    console.log(`${index + 1}. ${error.name} (${error.method} ${error.path})`);
  });
  
  console.log(`\n🟡 NOT FOUND ERRORS (404): ${analysisResults.notFoundErrors.length}`);
  analysisResults.notFoundErrors.forEach((error, index) => {
    console.log(`${index + 1}. ${error.name} (${error.method} ${error.path})`);
  });
  
  console.log(`\n🔴 SERVER ERRORS (500+): ${analysisResults.serverErrors.length}`);
  analysisResults.serverErrors.forEach((error, index) => {
    console.log(`${index + 1}. ${error.name} (${error.method} ${error.path})`);
  });
  
  console.log(`\n✅ WORKING ENDPOINTS: ${analysisResults.workingEndpoints.length}`);
  analysisResults.workingEndpoints.forEach((endpoint, index) => {
    console.log(`${index + 1}. ${endpoint.name} (${endpoint.method} ${endpoint.path}) - ${endpoint.status}`);
  });
  
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('1. Fix validation errors by adding proper request validation');
  console.log('2. Add missing route handlers for 404 errors');
  console.log('3. Fix server errors by improving error handling');
  console.log('4. Add proper authentication middleware');
  
  console.log('\n🏁 Analysis complete!');
}

runAnalysis().catch(console.error);
