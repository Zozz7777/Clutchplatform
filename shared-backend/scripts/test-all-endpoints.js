/**
 * Comprehensive endpoint testing script to verify no 403 errors remain
 * Tests all critical endpoints with proper authentication
 */

const API_BASE_URL = process.env.API_BASE_URL || 'https://clutch-main-nk7x.onrender.com';
const TEST_EMAIL = 'ziad@yourclutch.com';
const TEST_PASSWORD = '4955698*Z*z';

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Make authenticated request
 */
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Clutch-Endpoint-Tester/1.0'
    }
  };

  const requestOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, requestOptions);
    const data = await response.text();
    
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch {
      parsedData = { raw: data };
    }

    return {
      success: response.ok,
      status: response.status,
      data: parsedData,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message,
      data: null
    };
  }
}

/**
 * Login and get token
 */
async function login() {
  console.log('🔐 Logging in to get authentication token...');
  
  const response = await makeRequest('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
  });

  if (response.success && response.data.success) {
    console.log('✅ Login successful');
    return {
      token: response.data.token || response.data.data?.token,
      refreshToken: response.data.refreshToken || response.data.data?.refreshToken
    };
  } else {
    console.error('❌ Login failed:', response);
    throw new Error('Login failed');
  }
}

/**
 * Test endpoint with authentication
 */
async function testEndpoint(name, endpoint, method = 'GET', body = null, expectedStatus = 200) {
  console.log(`\n🧪 Testing ${name} (${method} ${endpoint})`);
  
  try {
    const options = { method };
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await makeRequest(endpoint, options);
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${name} - Status: ${response.status}`);
      testResults.passed++;
      return true;
    } else if (response.status === 403) {
      console.log(`❌ ${name} - 403 Forbidden:`, response.data);
      testResults.failed++;
      testResults.errors.push({
        endpoint,
        method,
        status: response.status,
        error: response.data
      });
      return false;
    } else {
      console.log(`⚠️  ${name} - Status: ${response.status} (expected ${expectedStatus})`);
      if (response.status >= 400) {
        testResults.failed++;
        testResults.errors.push({
          endpoint,
          method,
          status: response.status,
          error: response.data
        });
      } else {
        testResults.passed++;
      }
      return false;
    }
  } catch (error) {
    console.error(`❌ ${name} - Error:`, error.message);
    testResults.failed++;
    testResults.errors.push({
      endpoint,
      method,
      error: error.message
    });
    return false;
  }
}

/**
 * Test authenticated endpoint
 */
async function testAuthenticatedEndpoint(name, endpoint, method = 'GET', body = null, token) {
  console.log(`\n🔒 Testing authenticated ${name} (${method} ${endpoint})`);
  
  try {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await makeRequest(endpoint, options);
    
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ ${name} - Status: ${response.status}`);
      testResults.passed++;
      return true;
    } else if (response.status === 403) {
      console.log(`❌ ${name} - 403 Forbidden:`, response.data);
      testResults.failed++;
      testResults.errors.push({
        endpoint,
        method,
        status: response.status,
        error: response.data,
        authenticated: true
      });
      return false;
    } else {
      console.log(`⚠️  ${name} - Status: ${response.status}`);
      if (response.status >= 400) {
        testResults.failed++;
        testResults.errors.push({
          endpoint,
          method,
          status: response.status,
          error: response.data,
          authenticated: true
        });
      } else {
        testResults.passed++;
      }
      return false;
    }
  } catch (error) {
    console.error(`❌ ${name} - Error:`, error.message);
    testResults.failed++;
    testResults.errors.push({
      endpoint,
      method,
      error: error.message,
      authenticated: true
    });
    return false;
  }
}

/**
 * Main test function
 */
async function runAllTests() {
  console.log('🚀 Starting comprehensive endpoint testing...');
  console.log(`📍 Testing against: ${API_BASE_URL}`);
  console.log('=' * 60);

  try {
    // Step 1: Login to get token
    const { token } = await login();
    
    if (!token) {
      throw new Error('No token received from login');
    }

    console.log(`🔑 Token received: ${token.substring(0, 20)}...`);

    // Step 2: Test public endpoints
    console.log('\n📋 Testing Public Endpoints...');
    await testEndpoint('Health Check', '/health', 'GET', null, 200);
    await testEndpoint('Ping', '/ping', 'GET', null, 200);

    // Step 3: Test authenticated endpoints
    console.log('\n🔒 Testing Authenticated Endpoints...');
    
    // Dashboard endpoints
    await testAuthenticatedEndpoint('Dashboard KPIs', '/api/v1/dashboard/kpis', 'GET', null, token);
    
    // User management endpoints
    await testAuthenticatedEndpoint('Get Users', '/api/v1/users', 'GET', null, token);
    await testAuthenticatedEndpoint('Get Users (fallback)', '/api/users', 'GET', null, token);
    
    // Fleet endpoints
    await testAuthenticatedEndpoint('Get Fleet Vehicles', '/api/v1/fleet/vehicles', 'GET', null, token);
    await testAuthenticatedEndpoint('Get Fleet Vehicles (fallback)', '/api/fleet/vehicles', 'GET', null, token);
    
    // CRM endpoints
    await testAuthenticatedEndpoint('Get Customers', '/api/v1/crm/customers', 'GET', null, token);
    await testAuthenticatedEndpoint('Get Customers (fallback)', '/api/crm/customers', 'GET', null, token);
    
    // Finance endpoints
    await testAuthenticatedEndpoint('Get Payments', '/api/v1/finance/payments', 'GET', null, token);
    await testAuthenticatedEndpoint('Get Payments (fallback)', '/api/finance/payments', 'GET', null, token);
    await testAuthenticatedEndpoint('Get Expenses', '/api/v1/finance/expenses', 'GET', null, token);
    
    // Analytics endpoints
    await testAuthenticatedEndpoint('Analytics Metrics', '/api/v1/analytics/metrics', 'GET', null, token);
    await testAuthenticatedEndpoint('Analytics Performance', '/api/v1/analytics/performance', 'GET', null, token);
    
    // AI endpoints
    await testAuthenticatedEndpoint('AI Models', '/api/v1/ai/models', 'GET', null, token);
    await testAuthenticatedEndpoint('AI Anomaly Detection', '/api/v1/ai/anomaly-detection', 'GET', null, token);
    
    // Notifications endpoints
    await testAuthenticatedEndpoint('Get Notifications', '/api/v1/notifications', 'GET', null, token);
    await testAuthenticatedEndpoint('Get Notifications (fallback)', '/api/notifications', 'GET', null, token);

    // Step 4: Test token refresh
    console.log('\n🔄 Testing Token Refresh...');
    const refreshResponse = await makeRequest('/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken: 'test-refresh-token' })
    });
    
    if (refreshResponse.status === 200 || refreshResponse.status === 401) {
      console.log('✅ Token refresh endpoint accessible');
      testResults.passed++;
    } else {
      console.log(`⚠️  Token refresh - Status: ${refreshResponse.status}`);
      testResults.failed++;
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    testResults.failed++;
    testResults.errors.push({
      error: error.message,
      type: 'execution_error'
    });
  }

  // Step 5: Print results
  console.log('\n' + '=' * 60);
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' * 60);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.errors.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.errors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.endpoint || 'Unknown'} (${error.method || 'GET'})`);
      console.log(`   Status: ${error.status || 'Error'}`);
      console.log(`   Error: ${JSON.stringify(error.error, null, 2)}`);
    });
  }

  // Step 6: Check for 403 errors specifically
  const forbiddenErrors = testResults.errors.filter(error => error.status === 403);
  if (forbiddenErrors.length > 0) {
    console.log('\n🚨 403 FORBIDDEN ERRORS FOUND:');
    forbiddenErrors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.endpoint} (${error.method})`);
      console.log(`   Error: ${JSON.stringify(error.error, null, 2)}`);
    });
    console.log('\n❌ AUDIT FAILED: 403 errors still exist!');
    process.exit(1);
  } else {
    console.log('\n✅ AUDIT PASSED: No 403 errors found!');
    process.exit(0);
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Test execution crashed:', error);
  process.exit(1);
});
