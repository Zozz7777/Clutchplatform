/**
 * Authentication Fix Test Script
 * Tests both main auth and fallback auth endpoints
 */

const https = require('https');
const http = require('http');

const API_BASE = 'https://clutch-main-nk7x.onrender.com';
const API_PREFIX = '/api/v1';

// Test credentials
const testCredentials = {
  email: 'admin@yourclutch.com',
  password: 'admin123'
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 10000
    };
    
    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test main authentication endpoint
async function testMainAuth() {
  console.log('🔐 Testing main authentication endpoint...');
  
  try {
    const response = await makeRequest(`${API_BASE}${API_PREFIX}/auth/login`, {
      method: 'POST',
      body: testCredentials
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Main authentication is working!');
      return response.data.data.token;
    } else {
      console.log('❌ Main authentication failed');
      return null;
    }
  } catch (error) {
    console.log('❌ Main authentication error:', error.message);
    return null;
  }
}

// Test fallback authentication endpoint
async function testFallbackAuth() {
  console.log('\n🔄 Testing fallback authentication endpoint...');
  
  try {
    const response = await makeRequest(`${API_BASE}${API_PREFIX}/auth-fallback/login`, {
      method: 'POST',
      body: testCredentials
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Fallback authentication is working!');
      return response.data.data.token;
    } else {
      console.log('❌ Fallback authentication failed');
      return null;
    }
  } catch (error) {
    console.log('❌ Fallback authentication error:', error.message);
    return null;
  }
}

// Test fallback auth status
async function testFallbackStatus() {
  console.log('\n📊 Testing fallback auth status...');
  
  try {
    const response = await makeRequest(`${API_BASE}${API_PREFIX}/auth-fallback/status`);
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Fallback auth status is working!');
      return true;
    } else {
      console.log('❌ Fallback auth status failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Fallback auth status error:', error.message);
    return false;
  }
}

// Test health endpoint
async function testHealthEndpoint() {
  console.log('\n🏥 Testing health endpoint...');
  
  try {
    const response = await makeRequest(`${API_BASE}/health/ping`);
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log('✅ Health endpoint is working!');
      return true;
    } else {
      console.log('❌ Health endpoint failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Health endpoint error:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Authentication Fix Tests...\n');
  
  // Test health first
  const healthOk = await testHealthEndpoint();
  
  // Test main auth
  const mainToken = await testMainAuth();
  
  // Test fallback auth
  const fallbackToken = await testFallbackAuth();
  
  // Test fallback status
  const fallbackStatusOk = await testFallbackStatus();
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log(`Health Endpoint: ${healthOk ? '✅' : '❌'}`);
  console.log(`Main Auth: ${mainToken ? '✅' : '❌'}`);
  console.log(`Fallback Auth: ${fallbackToken ? '✅' : '❌'}`);
  console.log(`Fallback Status: ${fallbackStatusOk ? '✅' : '❌'}`);
  
  if (fallbackToken) {
    console.log('\n🎉 Authentication fix successful! Fallback auth is working.');
    console.log('Frontend can use fallback auth endpoint for now.');
  } else if (mainToken) {
    console.log('\n🎉 Main authentication is working!');
  } else {
    console.log('\n❌ Both authentication endpoints failed. Need further investigation.');
  }
}

// Run the tests
runTests().catch(console.error);
