const http = require('http');

const LOCAL_API_BASE_URL = 'http://localhost:5000';

async function testLocalServer() {
  console.log('🏠 Testing local server...');
  
  try {
    const response = await makeRequest('/health');
    console.log('Local server response:', JSON.stringify(response, null, 2));
    
    if (response.success) {
      console.log('✅ Local server is running');
      
      // Test auth endpoints
      console.log('🔐 Testing auth endpoints...');
      const loginResponse = await makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'ziad@yourclutch.com',
          password: '4955698*Z*z'
        })
      });
      
      console.log('Login response:', JSON.stringify(loginResponse, null, 2));
    } else {
      console.log('❌ Local server not responding properly');
    }
  } catch (error) {
    console.error('❌ Local server test failed:', error.message);
    console.log('💡 Make sure to run: npm start in the shared-backend directory');
  }
}

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(LOCAL_API_BASE_URL + path);
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Local-Server-Test/1.0',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
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

testLocalServer();
