const axios = require('axios');

const BASE_URL = 'https://clutch-main-nk7x.onrender.com';

// Test endpoints that don't require authentication
const publicEndpoints = [
  '/health',
  '/api/health',
  '/api/health/mongodb',
  '/api/cache/health'
];

// Test endpoints that require authentication
const protectedEndpoints = [
  '/api/dashboard',
  '/api/users',
  '/api/mechanics',
  '/api/bookings',
  '/api/analytics',
  '/api/finance',
  '/api/marketing',
  '/api/support',
  '/api/sales',
  '/api/parts',
  '/api/payments',
  '/api/jobs',
  '/api/notifications',
  '/api/products',
  '/api/contracts',
  '/api/customers',
  '/api/system-metrics',
  '/api/audit-logs',
  '/api/data-privacy',
  '/api/reports',
  '/api/operations',
  '/api/superadmin',
  '/api/partners',
  '/api/clients',
  '/api/vehicles',
  '/api/services',
  '/api/settings',
  '/api/quotes'
];

async function testEndpoint(url, description) {
  try {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`📍 URL: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 5000,
      validateStatus: () => true // Accept all status codes
    });
    
    console.log(`✅ Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log(`✅ Success: ${response.data.message || 'Endpoint working'}`);
    } else if (response.status === 401) {
      console.log(`🔒 Authentication Required: ${response.data.message || 'Token needed'}`);
    } else if (response.status === 403) {
      console.log(`🚫 Forbidden: ${response.data.message || 'Access denied'}`);
    } else if (response.status === 404) {
      console.log(`❌ Not Found: ${response.data.message || 'Route not found'}`);
    } else {
      console.log(`⚠️  Other Status: ${response.status} - ${response.data.message || 'Unknown response'}`);
    }
    
    return { url, status: response.status, success: response.status < 400 };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { url, status: 'ERROR', success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting API Endpoint Tests...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  
  const results = {
    public: [],
    protected: [],
    summary: { total: 0, successful: 0, failed: 0 }
  };
  
  // Test public endpoints
  console.log('\n📋 Testing Public Endpoints...');
  for (const endpoint of publicEndpoints) {
    const result = await testEndpoint(`${BASE_URL}${endpoint}`, `Public: ${endpoint}`);
    results.public.push(result);
    results.summary.total++;
    if (result.success) results.summary.successful++;
    else results.summary.failed++;
  }
  
  // Test protected endpoints
  console.log('\n🔒 Testing Protected Endpoints...');
  for (const endpoint of protectedEndpoints) {
    const result = await testEndpoint(`${BASE_URL}${endpoint}`, `Protected: ${endpoint}`);
    results.protected.push(result);
    results.summary.total++;
    if (result.success) results.summary.successful++;
    else results.summary.failed++;
  }
  
  // Print summary
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`Total Endpoints Tested: ${results.summary.total}`);
  console.log(`✅ Successful: ${results.summary.successful}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`📈 Success Rate: ${((results.summary.successful / results.summary.total) * 100).toFixed(1)}%`);
  
  // Detailed results
  console.log('\n📋 Detailed Results');
  console.log('==================');
  
  console.log('\n🔓 Public Endpoints:');
  results.public.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.url} - ${result.status}`);
  });
  
  console.log('\n🔒 Protected Endpoints:');
  results.protected.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.url} - ${result.status}`);
  });
  
  return results;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testEndpoint };
