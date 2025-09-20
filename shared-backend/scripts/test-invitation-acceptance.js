#!/usr/bin/env node

/**
 * Test Invitation Acceptance
 * Comprehensive test of the invitation acceptance flow
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_development_only';
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QtaW52aXRhdGlvbkBleGFtcGxlLmNvbSIsInR5cGUiOiJlbXBsb3llZV9pbnZpdGF0aW9uIiwiaW52aXRlZEJ5Ijoic3lzdGVtIiwiaWF0IjoxNzU4Mzg5MTQ3LCJleHAiOjE3NTg5OTM5NDd9.ysiKJoVwnGxRLdog51crk4O0oW0BC4AzqHt557dHqGs';

async function testInvitationAcceptance() {
  console.log('🧪 TESTING INVITATION ACCEPTANCE');
  console.log('='.repeat(40));
  console.log('');

  // Test 1: JWT Token Verification
  console.log('1️⃣ JWT TOKEN VERIFICATION');
  console.log('-'.repeat(30));
  try {
    const decoded = jwt.verify(testToken, JWT_SECRET);
    console.log('✅ Token verification: SUCCESS');
    console.log('📧 Email:', decoded.email);
    console.log('📊 Type:', decoded.type);
    console.log('⏰ Expires:', new Date(decoded.exp * 1000).toISOString());
    console.log('⏰ Current time:', new Date().toISOString());
    console.log('⏰ Is expired:', new Date() > new Date(decoded.exp * 1000));
  } catch (error) {
    console.log('❌ Token verification: FAILED');
    console.log('Error:', error.message);
    return;
  }
  console.log('');

  // Test 2: Password Validation
  console.log('2️⃣ PASSWORD VALIDATION');
  console.log('-'.repeat(30));
  const testPasswords = [
    'short',           // Too short
    '12345678',        // Valid length
    'TestPassword123', // Strong password
    ''                 // Empty
  ];

  testPasswords.forEach((password, index) => {
    const isValid = password.length >= 8;
    const status = isValid ? '✅' : '❌';
    console.log(`${status} Password ${index + 1}: "${password}" (${password.length} chars) - ${isValid ? 'VALID' : 'INVALID'}`);
  });
  console.log('');

  // Test 3: API Request Simulation
  console.log('3️⃣ API REQUEST SIMULATION');
  console.log('-'.repeat(30));
  
  const testData = {
    token: testToken,
    password: 'TestPassword123'
  };

  console.log('📤 Request data:');
  console.log('   Token:', testToken.substring(0, 50) + '...');
  console.log('   Password:', testData.password);
  console.log('');

  // Test 4: Production API Test
  console.log('4️⃣ PRODUCTION API TEST');
  console.log('-'.repeat(30));
  
  const productionUrl = 'https://clutch-main-nk7x.onrender.com/api/v1/employees/accept-invitation';
  
  console.log('🌐 Testing production endpoint:');
  console.log('   URL:', productionUrl);
  console.log('   Method: POST');
  console.log('   Content-Type: application/json');
  console.log('');

  try {
    const response = await fetch(productionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const responseText = await response.text();
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('📊 Response body:', responseText);

    if (response.ok) {
      console.log('✅ API request: SUCCESS');
    } else {
      console.log('❌ API request: FAILED');
      console.log('   Status:', response.status);
      console.log('   Error:', responseText);
    }

  } catch (error) {
    console.log('❌ API request: ERROR');
    console.log('   Error:', error.message);
  }
  console.log('');

  // Test 5: Debug Information
  console.log('5️⃣ DEBUG INFORMATION');
  console.log('-'.repeat(30));
  console.log('🔧 Environment:');
  console.log('   JWT_SECRET:', JWT_SECRET.substring(0, 20) + '...');
  console.log('   NODE_ENV:', process.env.NODE_ENV);
  console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
  console.log('');
  console.log('🔗 Test URLs:');
  console.log('   JWT Test:', 'https://clutch-main-nk7x.onrender.com/api/v1/debug/jwt-test');
  console.log('   Invitation Status:', 'https://clutch-main-nk7x.onrender.com/api/v1/debug/invitation-status/test-invitation@example.com');
  console.log('   Setup Password:', 'https://admin.yourclutch.com/setup-password?token=' + testToken);
  console.log('');

  console.log('✅ INVITATION ACCEPTANCE TEST COMPLETE!');
}

if (require.main === module) {
  testInvitationAcceptance();
}

module.exports = { testInvitationAcceptance };
