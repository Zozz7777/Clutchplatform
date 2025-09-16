/**
 * Simple Endpoint Tester for Render
 * This script tests key endpoints and logs results to Render logs
 */

const https = require('https');

console.log('🚀 Starting Render Endpoint Testing');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('🌐 Testing against: https://clutch-main-nk7x.onrender.com');
console.log('='.repeat(60));

// Key endpoints to test with proper configurations
const keyEndpoints = [
  { path: '/', method: 'GET', name: 'Root Endpoint', requiresAuth: false, body: null },
  { path: '/health', method: 'GET', name: 'Health Check', requiresAuth: false, body: null },
  { path: '/health/ping', method: 'GET', name: 'Health Ping', requiresAuth: false, body: null },
  { path: '/ping', method: 'GET', name: 'Ping', requiresAuth: false, body: null },
  { 
    path: '/api/v1/auth/login', 
    method: 'POST', 
    name: 'Auth Login', 
    requiresAuth: false, 
    body: JSON.stringify({ email: 'ziad@yourclutch.com', password: '4955698*Z*z' })
  },
  { 
    path: '/api/v1/auth/register', 
    method: 'POST', 
    name: 'Auth Register', 
    requiresAuth: false, 
    body: JSON.stringify({ 
      email: 'testuser@example.com', 
      password: 'TestPassword123!', 
      firstName: 'Test', 
      lastName: 'User' 
    })
  },
  { path: '/api/v1/fleet/vehicles', method: 'GET', name: 'Fleet Vehicles', requiresAuth: true, body: null },
  { path: '/api/v1/fleet/drivers', method: 'GET', name: 'Fleet Drivers', requiresAuth: true, body: null },
  { path: '/api/v1/bookings', method: 'GET', name: 'Bookings', requiresAuth: true, body: null },
  { path: '/api/v1/payments', method: 'GET', name: 'Payments', requiresAuth: true, body: null },
  { path: '/api/v1/communication/chat', method: 'GET', name: 'Communication Chat', requiresAuth: true, body: null },
  { path: '/api/v1/admin/users', method: 'GET', name: 'Admin Users', requiresAuth: true, body: null },
  { path: '/api/v1/performance/monitor', method: 'GET', name: 'Performance Monitor', requiresAuth: true, body: null }
];

let testResults = {
  total: 0,
  successful: 0,
  failed: 0,
  errors: []
};

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'clutch-main-nk7x.onrender.com',
      port: 443,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Render-Endpoint-Tester/1.0'
      },
      timeout: 10000
    };

    // Add auth header if required
    if (endpoint.requiresAuth) {
      options.headers['Authorization'] = 'Bearer test-token';
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        testResults.total++;
        
        // Consider 401 as expected for auth-required endpoints
        const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
        const isExpectedAuthError = endpoint.requiresAuth && res.statusCode === 401;
        const isLoginSuccess = endpoint.path.includes('/login') && res.statusCode === 200;
        const isRegisterSuccess = endpoint.path.includes('/register') && (res.statusCode === 200 || res.statusCode === 201);
        
        if (isSuccess || isExpectedAuthError || isLoginSuccess || isRegisterSuccess) {
          testResults.successful++;
          let status = res.statusCode;
          if (isExpectedAuthError) status = '401 (Expected - Auth Required)';
          if (isLoginSuccess) status = '200 (Login Success)';
          if (isRegisterSuccess) status = `${res.statusCode} (Register Success)`;
          console.log(`✅ ${endpoint.name} (${endpoint.method} ${endpoint.path}) - Status: ${status}`);
        } else {
          testResults.failed++;
          testResults.errors.push({
            name: endpoint.name,
            path: endpoint.path,
            status: res.statusCode
          });
          console.log(`❌ ${endpoint.name} (${endpoint.method} ${endpoint.path}) - Status: ${res.statusCode}`);
        }
        
        resolve();
      });
    });

    req.on('error', (error) => {
      testResults.total++;
      testResults.failed++;
      testResults.errors.push({
        name: endpoint.name,
        path: endpoint.path,
        error: error.message
      });
      console.log(`💥 ${endpoint.name} (${endpoint.method} ${endpoint.path}) - ERROR: ${error.message}`);
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      testResults.total++;
      testResults.failed++;
      testResults.errors.push({
        name: endpoint.name,
        path: endpoint.path,
        error: 'Timeout'
      });
      console.log(`⏰ ${endpoint.name} (${endpoint.method} ${endpoint.path}) - TIMEOUT`);
      resolve();
    });

    // Send proper request body
    if (endpoint.body) {
      req.write(endpoint.body);
    } else if (endpoint.method === 'POST' && !endpoint.body) {
      req.write(JSON.stringify({ test: true }));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log(`\n🔄 Testing ${keyEndpoints.length} key endpoints...\n`);
  
  for (const endpoint of keyEndpoints) {
    await testEndpoint(endpoint);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Final results
  const successRate = ((testResults.successful / testResults.total) * 100).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`📊 Total Endpoints: ${testResults.total}`);
  console.log(`✅ Successful: ${testResults.successful}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ FAILED ENDPOINTS:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.name} - ${error.error || `Status: ${error.status}`}`);
    });
  }
  
  console.log('\n🏁 Endpoint testing complete!');
  console.log('📝 These results are now visible in Render logs');
}

// Run the tests
runTests().catch(console.error);
