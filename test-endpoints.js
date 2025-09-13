const http = require('http');

// Test endpoints that were previously failing
const testEndpoints = [
  // Health endpoints
  { method: 'GET', path: '/health/ping', expectedStatus: 200 },
  { method: 'GET', path: '/ping', expectedStatus: 200 },
  
  // Previously failing 500 errors
  { method: 'POST', path: '/api/v1/clutch-email/auth/login', expectedStatus: [400, 503], body: {} },
  { method: 'GET', path: '/api/v1/clutch-email/health', expectedStatus: [200, 503] },
  
  // Previously failing 404 errors
  { method: 'GET', path: '/api/v1/carParts/', expectedStatus: 200 },
  { method: 'GET', path: '/api/v1/enhancedFeatures/', expectedStatus: 200 },
  { method: 'GET', path: '/api/v1/corporateAccount/', expectedStatus: 200 },
  { method: 'GET', path: '/api/v1/deviceToken/', expectedStatus: 200 },
  { method: 'GET', path: '/api/v1/digitalWallet/', expectedStatus: 200 },
  
  // Previously failing connection timeouts
  { method: 'GET', path: '/api/v1/featureFlags/', expectedStatus: 200 },
  { method: 'GET', path: '/api/v1/featureFlags/enabled', expectedStatus: 200 },
  { method: 'GET', path: '/api/v1/fleet/health-check', expectedStatus: 200 },
  { method: 'GET', path: '/api/v1/health-enhanced-autonomous/', expectedStatus: 200 },
  { method: 'GET', path: '/api/v1/health-enhanced-autonomous/ping', expectedStatus: 200 },
  
  // Previously failing 400 errors
  { method: 'GET', path: '/api/v1/customers/', expectedStatus: 200 },
  { method: 'POST', path: '/api/v1/enhanced-auth/biometric-verify', expectedStatus: [400, 200], body: {} },
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

    req.setTimeout(10000, () => {
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
      'User-Agent': 'Endpoint-Tester/1.0'
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

async function runTests() {
  console.log('🧪 Starting endpoint tests...\n');
  
  const results = [];
  let successCount = 0;
  let totalCount = testEndpoints.length;

  for (const endpoint of testEndpoints) {
    console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${endpoint.method} ${endpoint.path} - ${result.statusCode} (${result.responseTime}ms)`);
      successCount++;
    } else {
      console.log(`❌ ${endpoint.method} ${endpoint.path} - ${result.statusCode || 'ERROR'} (${result.error || 'Unexpected status'})`);
    }
  }

  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Successful: ${successCount}/${totalCount} (${((successCount/totalCount)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount} (${(((totalCount - successCount)/totalCount)*100).toFixed(1)}%)`);

  console.log('\n📋 Detailed Results:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const statusCode = result.statusCode || 'ERROR';
    const responseTime = result.responseTime ? `${result.responseTime}ms` : 'N/A';
    const error = result.error ? ` - ${result.error}` : '';
    
    console.log(`${status} ${result.method} ${result.endpoint} - ${statusCode} (${responseTime})${error}`);
  });

  // Check if we've improved from the original 2.47% success rate
  const improvement = ((successCount/totalCount) - 0.0247) * 100;
  console.log(`\n🚀 Improvement from original 2.47%: +${improvement.toFixed(1)}%`);
  
  if (successCount/totalCount > 0.8) {
    console.log('🎉 Excellent! Most endpoints are now working!');
  } else if (successCount/totalCount > 0.5) {
    console.log('👍 Good progress! Many endpoints are now working!');
  } else if (successCount/totalCount > 0.2) {
    console.log('📈 Some improvement, but more work needed.');
  } else {
    console.log('⚠️ Limited improvement. More fixes needed.');
  }
}

// Run the tests
runTests().catch(console.error);
