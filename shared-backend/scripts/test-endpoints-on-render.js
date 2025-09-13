/**
 * Simple Endpoint Tester for Render
 * This script tests key endpoints and logs results to Render logs
 */

const https = require('https');

console.log('🚀 Starting Render Endpoint Testing');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('🌐 Testing against: https://clutch-main-nk7x.onrender.com');
console.log('='.repeat(60));

// Key endpoints to test
const keyEndpoints = [
  { path: '/', method: 'GET', name: 'Root Endpoint' },
  { path: '/health', method: 'GET', name: 'Health Check' },
  { path: '/health/ping', method: 'GET', name: 'Health Ping' },
  { path: '/ping', method: 'GET', name: 'Ping' },
  { path: '/api/v1/auth/login', method: 'POST', name: 'Auth Login' },
  { path: '/api/v1/auth/register', method: 'POST', name: 'Auth Register' },
  { path: '/api/v1/fleet/vehicles', method: 'GET', name: 'Fleet Vehicles' },
  { path: '/api/v1/fleet/drivers', method: 'GET', name: 'Fleet Drivers' },
  { path: '/api/v1/bookings', method: 'GET', name: 'Bookings' },
  { path: '/api/v1/payments', method: 'GET', name: 'Payments' },
  { path: '/api/v1/communication/chat', method: 'GET', name: 'Communication Chat' },
  { path: '/api/v1/admin/users', method: 'GET', name: 'Admin Users' },
  { path: '/api/v1/performance/monitor', method: 'GET', name: 'Performance Monitor' }
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

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        testResults.total++;
        
        if (res.statusCode >= 200 && res.statusCode < 400) {
          testResults.successful++;
          console.log(`✅ ${endpoint.name} (${endpoint.method} ${endpoint.path}) - Status: ${res.statusCode}`);
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

    if (endpoint.method === 'POST') {
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
