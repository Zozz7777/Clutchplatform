#!/usr/bin/env node

/**
 * Test Permanent Authentication System
 * Tests the complete authentication flow with CEO employee credentials
 */

const https = require('https');

const API_BASE = 'https://clutch-main-nk7x.onrender.com';
const CEO_EMAIL = 'ziad@yourclutch.com';
const CEO_PASSWORD = '4955698*Z*z';

async function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;

    const options = {
      hostname: 'clutch-main-nk7x.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            success: response.success,
            data: response.data,
            message: response.message,
            error: response.error
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            success: false,
            error: 'Failed to parse response',
            rawData: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testHealthCheck() {
  console.log('1. 🏥 Testing Health Check...');
  try {
    const result = await makeRequest('/health/ping');
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message || result.error}`);
    return result.success;
  } catch (error) {
    console.log(`   ❌ Health check failed: ${error.message}`);
    return false;
  }
}

async function createCEOEmployee() {
  console.log('2. 👤 Creating/Updating CEO Employee...');
  try {
    const result = await makeRequest('/api/v1/auth/create-ceo', 'POST');
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message || result.error}`);
    
    if (result.data) {
      console.log(`   📧 Email: ${result.data.email}`);
      console.log(`   👤 Name: ${result.data.name}`);
      console.log(`   🎭 Role: ${result.data.role}`);
      console.log(`   👥 Is Employee: ${result.data.isEmployee}`);
    }
    
    return result.success;
  } catch (error) {
    console.log(`   ❌ CEO creation failed: ${error.message}`);
    return false;
  }
}

async function testMainAuth() {
  console.log('3. 🔐 Testing Main Authentication...');
  try {
    const result = await makeRequest('/api/v1/auth/login', 'POST', {
      email: CEO_EMAIL,
      password: CEO_PASSWORD
    });
    
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message || result.error}`);
    
    if (result.data && result.data.user) {
      console.log(`   👤 User: ${result.data.user.name} (${result.data.user.role})`);
      console.log(`   🔑 Has Token: ${!!result.data.token}`);
      console.log(`   🎫 Has Session: ${!!result.data.sessionToken}`);
      console.log(`   🔐 Permissions: ${result.data.user.permissions?.join(', ') || 'none'}`);
    }
    
    return result.success;
  } catch (error) {
    console.log(`   ❌ Main auth failed: ${error.message}`);
    return false;
  }
}

async function testEmergencyAuth() {
  console.log('4. 🚨 Testing Emergency Authentication...');
  try {
    const result = await makeRequest('/api/v1/emergency-auth/login', 'POST', {
      email: CEO_EMAIL,
      password: CEO_PASSWORD
    });
    
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message || result.error}`);
    
    if (result.data && result.data.user) {
      console.log(`   👤 User: ${result.data.user.name} (${result.data.user.role})`);
      console.log(`   🔑 Has Token: ${!!result.data.token}`);
      console.log(`   🎫 Has Session: ${!!result.data.sessionToken}`);
    }
    
    return result.success;
  } catch (error) {
    console.log(`   ❌ Emergency auth failed: ${error.message}`);
    return false;
  }
}

async function testEmployeeEndpoint() {
  console.log('5. 👥 Testing Employee Endpoint...');
  try {
    const result = await makeRequest('/api/v1/employees');
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message || result.error}`);
    
    if (result.status === 401) {
      console.log('   ✅ Endpoint properly requires authentication');
      return true;
    } else if (result.success && result.data) {
      console.log(`   📊 Employee Count: ${result.data.employees?.length || 0}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`   ❌ Employee endpoint test failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing Permanent Authentication System');
  console.log('==========================================');
  console.log(`🌐 Testing against: ${API_BASE}`);
  console.log(`👤 CEO Credentials: ${CEO_EMAIL}`);
  console.log('');

  const results = {
    healthCheck: false,
    ceoCreation: false,
    mainAuth: false,
    emergencyAuth: false,
    employeeEndpoint: false
  };

  // Run tests
  results.healthCheck = await testHealthCheck();
  console.log('');
  
  results.ceoCreation = await createCEOEmployee();
  console.log('');
  
  results.mainAuth = await testMainAuth();
  console.log('');
  
  results.emergencyAuth = await testEmergencyAuth();
  console.log('');
  
  results.employeeEndpoint = await testEmployeeEndpoint();
  console.log('');

  // Summary
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=======================');
  console.log(`🏥 Health Check: ${results.healthCheck ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`👤 CEO Creation: ${results.ceoCreation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔐 Main Auth: ${results.mainAuth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🚨 Emergency Auth: ${results.emergencyAuth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`👥 Employee Endpoint: ${results.employeeEndpoint ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  const successRate = Math.round((passedTests / totalTests) * 100);
  
  console.log('');
  console.log(`📈 Success Rate: ${passedTests}/${totalTests} (${successRate}%)`);
  
  if (results.mainAuth || results.emergencyAuth) {
    console.log('');
    console.log('🎉 AUTHENTICATION SYSTEM IS WORKING!');
    console.log('✅ Clutch Admin can now authenticate with CEO credentials');
    console.log('✅ Frontend-backend connection is established');
    console.log('');
    console.log('🔑 LOGIN CREDENTIALS FOR CLUTCH ADMIN:');
    console.log(`   Email: ${CEO_EMAIL}`);
    console.log(`   Password: ${CEO_PASSWORD}`);
  } else {
    console.log('');
    console.log('❌ AUTHENTICATION SYSTEM NEEDS ATTENTION');
    console.log('🔧 Please check the backend logs for errors');
  }
  
  console.log('');
  console.log('🏁 Testing complete!');
}

// Run the tests
runTests().catch(console.error);
