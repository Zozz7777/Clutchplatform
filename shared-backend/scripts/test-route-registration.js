/**
 * Test Route Registration
 * Check which routes are actually registered and working
 */

const https = require('https');

console.log('🔍 Testing Route Registration');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('='.repeat(60));

const baseUrl = 'clutch-main-nk7x.onrender.com';

// Test a few key endpoints to see which ones are actually working
const testEndpoints = [
  { path: '/', method: 'GET', name: 'Root' },
  { path: '/health', method: 'GET', name: 'Health' },
  { path: '/health/ping', method: 'GET', name: 'Health Ping' },
  { path: '/ping', method: 'GET', name: 'Ping' },
  { path: '/api/v1/auth/login', method: 'POST', name: 'Auth Login', body: JSON.stringify({ email: 'test@example.com', password: 'testpassword' }) },
  { path: '/api/v1/auth/register', method: 'POST', name: 'Auth Register', body: JSON.stringify({ email: 'test@example.com', password: 'testpassword', firstName: 'Test', lastName: 'User' }) },
  { path: '/api/v1/users', method: 'GET', name: 'Users' },
  { path: '/api/v1/fleet/vehicles', method: 'GET', name: 'Fleet Vehicles' },
  { path: '/api/v1/bookings', method: 'GET', name: 'Bookings' },
  { path: '/api/v1/payments', method: 'GET', name: 'Payments' },
  { path: '/api/v1/communication/chat', method: 'GET', name: 'Communication Chat' },
  { path: '/api/v1/admin/users', method: 'GET', name: 'Admin Users' },
  { path: '/api/v1/performance/monitor', method: 'GET', name: 'Performance Monitor' },
  { path: '/api/v1/services', method: 'GET', name: 'Services' },
  { path: '/api/v1/products', method: 'GET', name: 'Products' },
  { path: '/api/v1/orders', method: 'GET', name: 'Orders' },
  { path: '/api/v1/customers', method: 'GET', name: 'Customers' },
  { path: '/api/v1/inventory', method: 'GET', name: 'Inventory' },
  { path: '/api/v1/reports/sales', method: 'GET', name: 'Sales Report' },
  { path: '/api/v1/settings', method: 'GET', name: 'Settings' }
];

function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: baseUrl,
      port: 443,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Route-Test/1.0'
      },
      timeout: 10000
    };

    if (endpoint.body) {
      options.headers['Content-Length'] = Buffer.byteLength(endpoint.body);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
        const isExpectedAuthError = res.statusCode === 401;
        
        console.log(`${isSuccess ? '✅' : isExpectedAuthError ? '🔐' : '❌'} ${endpoint.name} (${endpoint.method} ${endpoint.path}) - Status: ${res.statusCode}`);
        
        if (!isSuccess && !isExpectedAuthError) {
          console.log(`   Response: ${data.substring(0, 200)}...`);
        }
        
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${endpoint.name} (${endpoint.method} ${endpoint.path}) - ERROR: ${error.message}`);
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`⏰ ${endpoint.name} (${endpoint.method} ${endpoint.path}) - TIMEOUT`);
      resolve();
    });

    if (endpoint.body) {
      req.write(endpoint.body);
    }
    
    req.end();
  });
}

async function testRoutes() {
  console.log(`\n🔄 Testing ${testEndpoints.length} key endpoints...\n`);
  
  for (const endpoint of testEndpoints) {
    await makeRequest(endpoint);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Route registration test complete!');
}

// Start testing
testRoutes().catch(console.error);
