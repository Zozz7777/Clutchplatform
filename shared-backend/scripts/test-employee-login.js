#!/usr/bin/env node

/**
 * Test Employee Login
 * This script tests login with the provided employee credentials
 */

// Load environment variables first
require('dotenv').config();

async function testEmployeeLogin() {
  console.log('🔐 Testing Employee Login...\n');

  const productionURL = 'https://clutch-main-nk7x.onrender.com';
  const email = 'ziad@yourclutch.com';
  const password = '4955698*Z*z';
  
  try {
    // Test 1: Try main auth login
    console.log('1. Testing main auth login...');
    
    try {
      const response = await fetch(`${productionURL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      
      console.log(`   Response status: ${response.status}`);
      
      if (response.status === 200) {
        const loginData = await response.json();
        console.log('   ✅ Main auth login successful!');
        console.log(`   User: ${loginData.data?.user?.email || 'Unknown'}`);
        console.log(`   Role: ${loginData.data?.user?.role || 'Unknown'}`);
        console.log(`   Token received: ${loginData.data?.token ? 'Yes' : 'No'}`);
        if (loginData.data?.token) {
          console.log(`   Token preview: ${loginData.data.token.substring(0, 50)}...`);
          
          // Test the token with a protected endpoint
          console.log('\n   Testing token with protected endpoint...');
          const testResponse = await fetch(`${productionURL}/api/v1/dashboard/kpis`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${loginData.data.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`   Protected endpoint status: ${testResponse.status}`);
          if (testResponse.status === 200) {
            console.log('   ✅ Token works with protected endpoints!');
          } else {
            console.log('   ❌ Token failed with protected endpoints');
            const errorData = await testResponse.json();
            console.log(`   Error: ${errorData.error || errorData.message}`);
          }
        }
      } else {
        console.log('   ❌ Main auth login failed');
        const errorData = await response.json();
        console.log(`   Error: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Main auth login error: ${error.message}`);
    }

    // Test 2: Try emergency auth login
    console.log('\n2. Testing emergency auth login...');
    
    try {
      const response = await fetch(`${productionURL}/api/v1/emergency-auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      
      console.log(`   Response status: ${response.status}`);
      
      if (response.status === 200) {
        const authData = await response.json();
        console.log('   ✅ Emergency auth login successful!');
        console.log(`   User: ${authData.data?.user?.email || 'Unknown'}`);
        console.log(`   Role: ${authData.data?.user?.role || 'Unknown'}`);
        console.log(`   Token received: ${authData.data?.token ? 'Yes' : 'No'}`);
        if (authData.data?.token) {
          console.log(`   Token preview: ${authData.data.token.substring(0, 50)}...`);
          
          // Test the token with a protected endpoint
          console.log('\n   Testing token with protected endpoint...');
          const testResponse = await fetch(`${productionURL}/api/v1/dashboard/kpis`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authData.data.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`   Protected endpoint status: ${testResponse.status}`);
          if (testResponse.status === 200) {
            console.log('   ✅ Emergency auth token works with protected endpoints!');
          } else {
            console.log('   ❌ Emergency auth token failed with protected endpoints');
            const errorData = await testResponse.json();
            console.log(`   Error: ${errorData.error || errorData.message}`);
          }
        }
      } else {
        console.log('   ❌ Emergency auth login failed');
        const errorData = await response.json();
        console.log(`   Error: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Emergency auth login error: ${error.message}`);
    }

    // Test 3: Try auth-fallback login
    console.log('\n3. Testing auth-fallback login...');
    
    try {
      const response = await fetch(`${productionURL}/api/v1/auth-fallback/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      
      console.log(`   Response status: ${response.status}`);
      
      if (response.status === 200) {
        const authData = await response.json();
        console.log('   ✅ Auth-fallback login successful!');
        console.log(`   User: ${authData.data?.user?.email || 'Unknown'}`);
        console.log(`   Role: ${authData.data?.user?.role || 'Unknown'}`);
        console.log(`   Token received: ${authData.data?.token ? 'Yes' : 'No'}`);
        if (authData.data?.token) {
          console.log(`   Token preview: ${authData.data.token.substring(0, 50)}...`);
        }
      } else {
        console.log('   ❌ Auth-fallback login failed');
        const errorData = await response.json();
        console.log(`   Error: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Auth-fallback login error: ${error.message}`);
    }

    console.log('\n📊 Summary:');
    console.log('   If any login method worked, you can use that token in the frontend.');
    console.log('   The frontend should store this token in localStorage and send it with API requests.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testEmployeeLogin();
