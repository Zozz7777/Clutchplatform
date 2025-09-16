#!/usr/bin/env node

/**
 * Test Authentication Fix
 * Tests the fixed authentication system with fallback credentials
 */

const https = require('https');

const API_BASE = 'https://clutch-main-nk7x.onrender.com';

// Test credentials
const testCredentials = [
  {
    email: 'ziad@yourclutch.com',
    password: '4955698*Z*z',
    name: 'CEO Test'
  },
  {
    email: 'admin@yourclutch.com', 
    password: 'admin123',
    name: 'Admin Test'
  }
];

async function testLogin(credentials) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: credentials.email,
      password: credentials.password
    });

    const options = {
      hostname: 'clutch-main-nk7x.onrender.com',
      port: 443,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            status: res.statusCode,
            success: response.success,
            message: response.message,
            hasToken: !!response.data?.token,
            user: response.data?.user
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            success: false,
            error: 'Failed to parse response',
            rawData: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testHealthCheck() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'clutch-main-nk7x.onrender.com',
      port: 443,
      path: '/health/ping',
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            status: res.statusCode,
            success: response.success,
            message: response.data?.status
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            success: false,
            error: 'Failed to parse response',
            rawData: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Authentication Fix');
  console.log('================================');
  console.log(`🌐 Testing against: ${API_BASE}`);
  console.log('');

  // Test health check first
  console.log('1. Testing Health Check...');
  try {
    const healthResult = await testHealthCheck();
    console.log(`   Status: ${healthResult.status}`);
    console.log(`   Success: ${healthResult.success}`);
    console.log(`   Message: ${healthResult.message || healthResult.error}`);
    console.log('');
  } catch (error) {
    console.log(`   ❌ Health check failed: ${error.message}`);
    console.log('');
  }

  // Test login for each credential set
  for (let i = 0; i < testCredentials.length; i++) {
    const credentials = testCredentials[i];
    console.log(`${i + 2}. Testing Login: ${credentials.name}`);
    console.log(`   Email: ${credentials.email}`);
    
    try {
      const loginResult = await testLogin(credentials);
      console.log(`   Status: ${loginResult.status}`);
      console.log(`   Success: ${loginResult.success}`);
      console.log(`   Message: ${loginResult.message || loginResult.error}`);
      console.log(`   Has Token: ${loginResult.hasToken}`);
      
      if (loginResult.user) {
        console.log(`   User: ${loginResult.user.name} (${loginResult.user.role})`);
      }
      
      if (loginResult.success) {
        console.log('   ✅ Login successful!');
      } else {
        console.log('   ❌ Login failed!');
      }
    } catch (error) {
      console.log(`   ❌ Login test failed: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🏁 Authentication tests complete!');
}

// Run the tests
runTests().catch(console.error);
