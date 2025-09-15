#!/usr/bin/env node

/**
 * Complete Authentication Flow Test
 * Tests the entire data flow from backend to frontend
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
            error: response.error,
            timestamp: response.timestamp,
            rawResponse: response
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

async function testCompleteAuthFlow() {
  console.log('🧪 Testing Complete Authentication Flow');
  console.log('=====================================');
  console.log(`🌐 Testing against: ${API_BASE}`);
  console.log(`👤 CEO Credentials: ${CEO_EMAIL}`);
  console.log('');

  try {
    // Test 1: Health Check
    console.log('1. 🏥 Health Check...');
    const healthResult = await makeRequest('/health/ping');
    console.log(`   Status: ${healthResult.status}`);
    console.log(`   Success: ${healthResult.success}`);
    console.log('');

    // Test 2: Login Request
    console.log('2. 🔐 Testing Login Request...');
    const loginResult = await makeRequest('/api/v1/auth/login', 'POST', {
      email: CEO_EMAIL,
      password: CEO_PASSWORD
    });

    console.log(`   Status: ${loginResult.status}`);
    console.log(`   Success: ${loginResult.success}`);
    console.log(`   Message: ${loginResult.message || loginResult.error}`);
    console.log('');

    if (loginResult.success && loginResult.data) {
      console.log('3. 📊 Analyzing Response Data Structure...');
      
      const { data } = loginResult;
      console.log(`   ✅ Has 'data' property: ${!!data}`);
      console.log(`   ✅ Has 'token': ${!!data.token}`);
      console.log(`   ✅ Has 'sessionToken': ${!!data.sessionToken}`);
      console.log(`   ✅ Has 'user': ${!!data.user}`);
      
      if (data.user) {
        console.log('   📋 User Object Analysis:');
        console.log(`      - ID: ${data.user.id || 'MISSING'}`);
        console.log(`      - Email: ${data.user.email || 'MISSING'}`);
        console.log(`      - Name: ${data.user.name || 'MISSING'}`);
        console.log(`      - Role: ${data.user.role || 'MISSING'}`);
        console.log(`      - Permissions: ${data.user.permissions ? JSON.stringify(data.user.permissions) : 'MISSING'}`);
        console.log(`      - Is Employee: ${data.user.isEmployee !== undefined ? data.user.isEmployee : 'NOT SPECIFIED'}`);
        console.log(`      - Is Active: ${data.user.isActive !== undefined ? data.user.isActive : 'NOT SPECIFIED'}`);
      } else {
        console.log('   ❌ User object is missing from response!');
      }

      console.log('');
      console.log('4. 🔍 Complete Response Structure:');
      console.log(JSON.stringify(loginResult.rawResponse, null, 2));
      console.log('');

      // Test 3: Verify Token Format
      console.log('5. 🎫 Token Analysis...');
      if (data.token) {
        console.log(`   ✅ Token exists: ${data.token.substring(0, 20)}...`);
        console.log(`   📏 Token length: ${data.token.length} characters`);
        
        // Basic JWT structure check
        const tokenParts = data.token.split('.');
        console.log(`   🔧 JWT parts: ${tokenParts.length} (should be 3)`);
        
        if (tokenParts.length === 3) {
          console.log('   ✅ Token appears to be valid JWT format');
        } else {
          console.log('   ⚠️ Token may not be valid JWT format');
        }
      } else {
        console.log('   ❌ Token is missing!');
      }

      console.log('');
      console.log('6. 🎯 Frontend Compatibility Check...');
      
      // Simulate what the frontend expects
      const frontendExpectedStructure = {
        success: loginResult.success,
        data: {
          token: data.token,
          user: data.user
        },
        message: loginResult.message
      };

      console.log('   📋 Frontend Expected Structure:');
      console.log(`      - response.success: ${frontendExpectedStructure.success}`);
      console.log(`      - response.data.token: ${!!frontendExpectedStructure.data.token}`);
      console.log(`      - response.data.user: ${!!frontendExpectedStructure.data.user}`);
      
      if (frontendExpectedStructure.data.user) {
        console.log(`      - user.id: ${frontendExpectedStructure.data.user.id || 'MISSING'}`);
        console.log(`      - user.email: ${frontendExpectedStructure.data.user.email || 'MISSING'}`);
        console.log(`      - user.name: ${frontendExpectedStructure.data.user.name || 'MISSING'}`);
        console.log(`      - user.role: ${frontendExpectedStructure.data.user.role || 'MISSING'}`);
        console.log(`      - user.permissions: ${frontendExpectedStructure.data.user.permissions ? 'PRESENT' : 'MISSING'}`);
      }

      console.log('');
      console.log('7. ✅ COMPATIBILITY ASSESSMENT:');
      
      const hasRequiredFields = !!(
        frontendExpectedStructure.success &&
        frontendExpectedStructure.data.token &&
        frontendExpectedStructure.data.user &&
        frontendExpectedStructure.data.user.id &&
        frontendExpectedStructure.data.user.email &&
        frontendExpectedStructure.data.user.name &&
        frontendExpectedStructure.data.user.role
      );

      if (hasRequiredFields) {
        console.log('   🎉 ALL REQUIRED FIELDS ARE PRESENT!');
        console.log('   ✅ Frontend should be able to process this response successfully');
        console.log('   ✅ Authentication flow is complete and functional');
      } else {
        console.log('   ❌ SOME REQUIRED FIELDS ARE MISSING!');
        console.log('   🔧 Frontend may encounter issues processing this response');
        
        // Identify missing fields
        const missing = [];
        if (!frontendExpectedStructure.success) missing.push('success');
        if (!frontendExpectedStructure.data.token) missing.push('token');
        if (!frontendExpectedStructure.data.user) missing.push('user');
        if (frontendExpectedStructure.data.user) {
          if (!frontendExpectedStructure.data.user.id) missing.push('user.id');
          if (!frontendExpectedStructure.data.user.email) missing.push('user.email');
          if (!frontendExpectedStructure.data.user.name) missing.push('user.name');
          if (!frontendExpectedStructure.data.user.role) missing.push('user.role');
        }
        
        console.log(`   📝 Missing fields: ${missing.join(', ')}`);
      }

    } else {
      console.log('3. ❌ Login failed - cannot analyze response structure');
      console.log(`   Error: ${loginResult.error || 'Unknown error'}`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('');
  console.log('🏁 Complete authentication flow test finished!');
}

// Run the test
testCompleteAuthFlow().catch(console.error);
