#!/usr/bin/env node

/**
 * Debug Frontend Authentication
 * This script helps debug what tokens the frontend is sending
 */

// Load environment variables first
require('dotenv').config();

const jwt = require('jsonwebtoken');

async function debugFrontendAuth() {
  console.log('🔍 Debugging Frontend Authentication...\n');

  const productionURL = 'https://clutch-main-nk7x.onrender.com';
  
  try {
    // Test 1: Check what happens when we send a proper JWT token
    console.log('1. Testing with a proper JWT token...');
    
    const testPayload = {
      userId: 'test-user-123',
      email: 'test@example.com',
      role: 'admin',
      type: 'employee'
    };
    
    const jwtSecret = process.env.JWT_SECRET || 'clutch_platform_jwt_secret_2024_super_secure_key_for_production_use_only';
    const properToken = jwt.sign(testPayload, jwtSecret, { expiresIn: '1h' });
    
    console.log(`   Generated proper token: ${properToken.substring(0, 50)}...`);
    
    try {
      const response = await fetch(`${productionURL}/api/v1/dashboard/kpis`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${properToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   Response status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('   ✅ Proper JWT token works!');
      } else {
        console.log('   ❌ Proper JWT token failed');
        const errorData = await response.json();
        console.log(`   Error: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 2: Check what happens with the malformed token from logs
    console.log('\n2. Testing with malformed token (from logs)...');
    
    const malformedToken = 'test-token';
    
    try {
      const response = await fetch(`${productionURL}/api/v1/dashboard/kpis`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${malformedToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   Response status: ${response.status}`);
      
      if (response.status === 401) {
        console.log('   ✅ Malformed token correctly rejected (as expected)');
        const errorData = await response.json();
        console.log(`   Error: ${errorData.error || errorData.message}`);
      } else {
        console.log('   ❌ Malformed token should have been rejected');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 3: Check what happens without any token
    console.log('\n3. Testing without any token...');
    
    try {
      const response = await fetch(`${productionURL}/api/v1/dashboard/kpis`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   Response status: ${response.status}`);
      
      if (response.status === 401) {
        console.log('   ✅ No token correctly rejected (as expected)');
        const errorData = await response.json();
        console.log(`   Error: ${errorData.error || errorData.message}`);
      } else {
        console.log('   ❌ No token should have been rejected');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 4: Test login endpoint
    console.log('\n4. Testing login endpoint...');
    
    try {
      const response = await fetch(`${productionURL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@yourclutch.com',
          password: 'admin123'
        })
      });
      
      console.log(`   Login response status: ${response.status}`);
      
      if (response.status === 200) {
        const loginData = await response.json();
        console.log('   ✅ Login successful!');
        console.log(`   Token received: ${loginData.data?.token ? 'Yes' : 'No'}`);
        if (loginData.data?.token) {
          console.log(`   Token preview: ${loginData.data.token.substring(0, 50)}...`);
        }
      } else {
        console.log('   ❌ Login failed');
        const errorData = await response.json();
        console.log(`   Error: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Login error: ${error.message}`);
    }

    // Test 5: Test emergency auth
    console.log('\n5. Testing emergency auth endpoint...');
    
    try {
      const response = await fetch(`${productionURL}/api/v1/emergency-auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@yourclutch.com',
          password: 'admin123'
        })
      });
      
      console.log(`   Emergency auth response status: ${response.status}`);
      
      if (response.status === 200) {
        const authData = await response.json();
        console.log('   ✅ Emergency auth successful!');
        console.log(`   Token received: ${authData.data?.token ? 'Yes' : 'No'}`);
        if (authData.data?.token) {
          console.log(`   Token preview: ${authData.data.token.substring(0, 50)}...`);
        }
      } else {
        console.log('   ❌ Emergency auth failed');
        const errorData = await response.json();
        console.log(`   Error: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Emergency auth error: ${error.message}`);
    }

    console.log('\n📊 Summary:');
    console.log('   The issue is that the frontend is sending malformed tokens.');
    console.log('   This suggests:');
    console.log('   1. User is not logged in (no valid token in localStorage)');
    console.log('   2. Frontend is sending test/placeholder tokens');
    console.log('   3. Token storage/retrieval is broken in the frontend');
    console.log('\n🔧 Solution:');
    console.log('   The user needs to log in properly to get a valid JWT token.');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugFrontendAuth();
