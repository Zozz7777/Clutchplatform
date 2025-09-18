const https = require('https');

const API_BASE_URL = 'https://clutch-platform-backend.onrender.com';

// Test token refresh endpoint with debugging
async function testTokenRefresh() {
  console.log('🔄 Testing token refresh endpoint...');
  
  try {
    // First, let's login to get a token
    console.log('🔐 Logging in to get initial token...');
    const loginResponse = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'ziad@yourclutch.com',
        password: '4955698*Z*z'
      })
    });
    
    if (loginResponse.success && loginResponse.data.token) {
      console.log('✅ Login successful, got token');
      console.log('🔍 Token preview:', loginResponse.data.token.substring(0, 50) + '...');
      
      // Now test the refresh endpoint
      console.log('🔄 Testing token refresh...');
      const refreshResponse = await makeRequest('/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      
      console.log('🔄 Refresh response:', JSON.stringify(refreshResponse, null, 2));
      
      if (refreshResponse.success && refreshResponse.data.token) {
        console.log('✅ Token refresh successful');
        console.log('🔍 New token preview:', refreshResponse.data.token.substring(0, 50) + '...');
        
        // Decode the JWT to check the role
        try {
          const payload = JSON.parse(Buffer.from(refreshResponse.data.token.split('.')[1], 'base64').toString());
          console.log('🔍 JWT payload:', JSON.stringify(payload, null, 2));
        } catch (e) {
          console.log('❌ Could not decode JWT:', e.message);
        }
      } else {
        console.log('❌ Token refresh failed:', refreshResponse);
      }
    } else {
      console.log('❌ Login failed:', loginResponse);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + path);
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Token-Refresh-Test/1.0',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: response
          });
        } catch (e) {
          resolve({
            success: false,
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

testTokenRefresh();
