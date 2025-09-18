/**
 * Test script for local server endpoints
 * Run this after starting the local server with: npm start
 */

const API_BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'ziad@yourclutch.com';
const TEST_PASSWORD = '4955698*Z*z';

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Make request to local server
 */
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Clutch-Local-Tester/1.0'
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
 * Test local server connectivity
 */
async function testLocalServer() {
  console.log('🏠 Testing local server connectivity...');
  
  const response = await makeRequest('/health');
  
  if (response.success) {
    console.log('✅ Local server is running and accessible');
    return true;
  } else {
    console.log('❌ Local server is not accessible:', response.error);
    console.log('💡 Make sure to run: npm start in the shared-backend directory');
    return false;
  }
}

/**
 * Login to local server
 */
async function login() {
  console.log('🔐 Logging in to local server...');
  
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
async function testAuthenticatedEndpoint(name, endpoint, method = 'GET', body = null, token) {
  console.log(`\n🔒 Testing ${name} (${method} ${endpoint})`);
  
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
        error: response.data
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
 * Main test function
 */
async function runLocalTests() {
  console.log('🚀 Starting local server endpoint testing...');
  console.log(`📍 Testing against: ${API_BASE_URL}`);
  console.log('=' * 60);

  try {
    // Step 1: Test server connectivity
    const serverRunning = await testLocalServer();
    if (!serverRunning) {
      process.exit(1);
    }

    // Step 2: Login to get token
    const { token } = await login();
    
    if (!token) {
      throw new Error('No token received from login');
    }

    console.log(`🔑 Token received: ${token.substring(0, 20)}...`);

    // Step 3: Test critical endpoints
    console.log('\n🔒 Testing Critical Endpoints...');
    
    // Test the endpoints that were causing 403 errors
    await testAuthenticatedEndpoint('Get Users', '/api/v1/users', 'GET', null, token);
    await testAuthenticatedEndpoint('Get Fleet Vehicles', '/api/v1/fleet/vehicles', 'GET', null, token);
    await testAuthenticatedEndpoint('Get Customers', '/api/v1/crm/customers', 'GET', null, token);
    await testAuthenticatedEndpoint('Get Payments', '/api/v1/finance/payments', 'GET', null, token);
    await testAuthenticatedEndpoint('Get Notifications', '/api/v1/notifications', 'GET', null, token);

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    testResults.failed++;
    testResults.errors.push({
      error: error.message,
      type: 'execution_error'
    });
  }

  // Step 4: Print results
  console.log('\n' + '=' * 60);
  console.log('📊 LOCAL TEST RESULTS');
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

  // Step 5: Check for 403 errors specifically
  const forbiddenErrors = testResults.errors.filter(error => error.status === 403);
  if (forbiddenErrors.length > 0) {
    console.log('\n🚨 403 FORBIDDEN ERRORS FOUND:');
    forbiddenErrors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.endpoint} (${error.method})`);
      console.log(`   Error: ${JSON.stringify(error.error, null, 2)}`);
    });
    console.log('\n❌ LOCAL AUDIT FAILED: 403 errors still exist!');
    process.exit(1);
  } else {
    console.log('\n✅ LOCAL AUDIT PASSED: No 403 errors found!');
    process.exit(0);
  }
}

// Run the tests
runLocalTests().catch(error => {
  console.error('💥 Local test execution crashed:', error);
  process.exit(1);
});
