const https = require('https');
const WebSocket = require('ws');

const baseUrl = 'clutch-main-nk7x.onrender.com';

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: baseUrl,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WebSocket-Test/1.0',
        ...headers
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

async function testWebSocketAndRegistration() {
  console.log('🧪 Testing WebSocket and Registration...\n');

  // Test 1: Get authentication token
  console.log('1️⃣ Getting authentication token...');
  try {
    const loginResponse = await makeRequest('/api/v1/auth/login', 'POST', {
      email: 'ziad@yourclutch.com',
      password: '4955698*Z*z'
    });

    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login failed, cannot test WebSocket');
      return;
    }

    const loginData = JSON.parse(loginResponse.body);
    const token = loginData.data?.token;
    
    if (!token) {
      console.log('❌ No token received from login');
      return;
    }

    console.log('✅ Login successful, token received');

    // Test 2: Test WebSocket connection
    console.log('\n2️⃣ Testing WebSocket connection...');
    const wsUrl = `wss://${baseUrl}/ws?token=${token}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        ws.on('open', () => {
          clearTimeout(timeout);
          console.log('✅ WebSocket connected successfully!');
          
          // Send a test message
          ws.send(JSON.stringify({
            type: 'ping',
            timestamp: new Date().toISOString()
          }));
          
          resolve();
        });

        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data);
            console.log('📨 WebSocket message received:', message.type);
            if (message.type === 'connection') {
              console.log('✅ WebSocket connection confirmed');
            }
          } catch (error) {
            console.log('📨 WebSocket raw message:', data.toString());
          }
        });

        ws.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });

        ws.on('close', (code, reason) => {
          console.log(`🔌 WebSocket closed: ${code} - ${reason}`);
        });
      });

      // Close WebSocket after test
      ws.close();
      console.log('✅ WebSocket test completed');

    } catch (error) {
      console.log('❌ WebSocket connection failed:', error.message);
    }

    // Test 3: Test registration with improved error handling
    console.log('\n3️⃣ Testing registration with improved error handling...');
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const registrationData = {
      email: uniqueEmail,
      password: 'testpassword123',
      name: 'Test User'
    };

    try {
      const registerResponse = await makeRequest('/api/v1/auth/register', 'POST', registrationData);
      console.log(`   Status: ${registerResponse.statusCode}`);
      
      if (registerResponse.statusCode === 201) {
        console.log('   ✅ Registration successful!');
        const responseData = JSON.parse(registerResponse.body);
        console.log(`   User ID: ${responseData.data?.user?.id || 'N/A'}`);
      } else if (registerResponse.statusCode === 500) {
        console.log('   ❌ Registration failed with 500 error');
        const responseData = JSON.parse(registerResponse.body);
        console.log(`   Error: ${responseData.error}`);
        console.log(`   Message: ${responseData.message}`);
        if (responseData.details) {
          console.log(`   Details: ${responseData.details}`);
        }
      } else {
        console.log('   ❌ Registration failed');
        console.log(`   Response: ${registerResponse.body.substring(0, 300)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Registration request error: ${error.message}`);
    }

  } catch (error) {
    console.log(`❌ Test error: ${error.message}`);
  }

  console.log('\n🏁 WebSocket and Registration testing complete!');
}

// Run the tests
testWebSocketAndRegistration();
