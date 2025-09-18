const https = require('https');

const API_BASE_URL = 'https://clutch-platform-backend.onrender.com';

async function testHealth() {
  console.log('🏥 Testing health endpoint...');
  
  try {
    const response = await makeRequest('/health');
    console.log('Health response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
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
        'User-Agent': 'Health-Test/1.0',
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

testHealth();
