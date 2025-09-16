const https = require('https');

const baseUrl = 'clutch-main-nk7x.onrender.com';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: baseUrl,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Endpoint-Tester/1.0'
      }
    };

    const req = https.request(options, (res) => {
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

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testEndpoints() {
  console.log('🧪 Testing Fixed Endpoints...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await makeRequest('/health/ping');
    console.log(`   Status: ${healthResponse.statusCode} ${healthResponse.statusCode === 200 ? '✅' : '❌'}`);

    // Test 2: Registration with firstName/lastName
    console.log('\n2️⃣ Testing Registration (firstName/lastName format)...');
    const registerData = {
      email: 'test@example.com',
      password: 'testpassword',
      firstName: 'Test',
      lastName: 'User'
    };
    
    try {
      const registerResponse = await makeRequest('/api/v1/auth/register', 'POST', registerData);
      console.log(`   Status: ${registerResponse.statusCode}`);
      
      if (registerResponse.statusCode === 201) {
        console.log('   ✅ Registration successful!');
        const responseData = JSON.parse(registerResponse.body);
        console.log(`   User ID: ${responseData.data?.user?.id || 'N/A'}`);
      } else if (registerResponse.statusCode === 409) {
        console.log('   ⚠️  User already exists (expected for repeated tests)');
      } else {
        console.log('   ❌ Registration failed');
        console.log(`   Response: ${registerResponse.body.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Registration error: ${error.message}`);
    }

    // Test 3: Login with fallback credentials
    console.log('\n3️⃣ Testing Login (fallback credentials)...');
    const loginData = {
      email: 'ziad@yourclutch.com',
      password: '4955698*Z*z'
    };
    
    try {
      const loginResponse = await makeRequest('/api/v1/auth/login', 'POST', loginData);
      console.log(`   Status: ${loginResponse.statusCode}`);
      
      if (loginResponse.statusCode === 200) {
        console.log('   ✅ Login successful!');
        const responseData = JSON.parse(loginResponse.body);
        console.log(`   User: ${responseData.data?.user?.name || 'N/A'}`);
        console.log(`   Role: ${responseData.data?.user?.role || 'N/A'}`);
      } else {
        console.log('   ❌ Login failed');
        console.log(`   Response: ${loginResponse.body.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Login error: ${error.message}`);
    }

    console.log('\n🏁 Endpoint testing complete!');

  } catch (error) {
    console.error('❌ Test suite error:', error.message);
  }
}

// Run the tests
testEndpoints();
