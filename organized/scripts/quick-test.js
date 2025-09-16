const http = require('http');

const testEndpoints = [
  { method: 'GET', path: '/health', expectedStatus: 200 },
  { method: 'GET', path: '/api/v1/knowledge-base/articles', expectedStatus: 200 },
  { method: 'GET', path: '/api/v1/incidents/', expectedStatus: 200 },
  { method: 'GET', path: '/api/v1/errors/logs', expectedStatus: 200 },
  { method: 'POST', path: '/api/v1/auth/login', expectedStatus: [400, 401, 200], body: {} },
  { method: 'GET', path: '/api/v1/carParts/', expectedStatus: 200 },
  { method: 'GET', path: '/api/v1/enhancedFeatures/', expectedStatus: 200 }
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
      'Content-Type': 'application/json'
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
      responseTime: responseTime
    };
  } catch (error) {
    return {
      endpoint: endpoint.path,
      method: endpoint.method,
      statusCode: null,
      expectedStatus: endpoint.expectedStatus,
      success: false,
      responseTime: null,
      error: error.message
    };
  }
}

async function runQuickTests() {
  console.log('🧪 Running quick endpoint tests...\n');
  
  const results = [];
  let successCount = 0;

  for (let i = 0; i < testEndpoints.length; i++) {
    const endpoint = testEndpoints[i];
    console.log(`Testing ${i + 1}/${testEndpoints.length}: ${endpoint.method} ${endpoint.path}...`);
    
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${endpoint.method} ${endpoint.path} - ${result.statusCode} (${result.responseTime}ms)`);
      successCount++;
    } else {
      console.log(`❌ ${endpoint.method} ${endpoint.path} - ${result.statusCode || 'ERROR'} (${result.error || 'Unexpected status'})`);
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 Quick Test Results: ${successCount}/${testEndpoints.length} (${((successCount/testEndpoints.length)*100).toFixed(1)}%)`);
  
  if (successCount === testEndpoints.length) {
    console.log('🎉 All key endpoints are working!');
  } else if (successCount > testEndpoints.length / 2) {
    console.log('👍 Most endpoints are working!');
  } else {
    console.log('⚠️ Some endpoints need attention.');
  }
}

runQuickTests().catch(console.error);
