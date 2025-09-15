/**
 * Test Authentication Endpoint
 * Tests the authentication system with proper credentials
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'https://clutch-main-nk7x.onrender.com/api/v1';

async function testAuthentication() {
  console.log('🧪 Testing Authentication Endpoint...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthRes = await fetch('https://clutch-main-nk7x.onrender.com/health');
    const healthData = await healthRes.json();
    console.log(`   Status: ${healthRes.status}`);
    console.log(`   Response: ${JSON.stringify(healthData, null, 2)}\n`);

    // Test 2: Login with CEO credentials
    console.log('2️⃣ Testing login with CEO credentials...');
    const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ziad@yourclutch.com',
        password: '4955698*Z*z',
      }),
    });

    const loginData = await loginRes.json();
    console.log(`   Status: ${loginRes.status}`);
    console.log(`   Response: ${JSON.stringify(loginData, null, 2)}\n`);

    // Test 3: Login with admin credentials
    console.log('3️⃣ Testing login with admin credentials...');
    const adminLoginRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@yourclutch.com',
        password: 'password',
      }),
    });

    const adminLoginData = await adminLoginRes.json();
    console.log(`   Status: ${adminLoginRes.status}`);
    console.log(`   Response: ${JSON.stringify(adminLoginData, null, 2)}\n`);

    // Test 4: Test fallback auth endpoint
    console.log('4️⃣ Testing fallback auth endpoint...');
    const fallbackRes = await fetch(`${API_BASE_URL}/auth-fallback/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ziad@yourclutch.com',
        password: '4955698*Z*z',
      }),
    });

    const fallbackData = await fallbackRes.json();
    console.log(`   Status: ${fallbackRes.status}`);
    console.log(`   Response: ${JSON.stringify(fallbackData, null, 2)}\n`);

    // Test 5: Test fallback status
    console.log('5️⃣ Testing fallback status...');
    const statusRes = await fetch(`${API_BASE_URL}/auth-fallback/status`);
    const statusData = await statusRes.json();
    console.log(`   Status: ${statusRes.status}`);
    console.log(`   Response: ${JSON.stringify(statusData, null, 2)}\n`);

    // Summary
    console.log('📊 Test Summary:');
    console.log(`   Health: ${healthRes.status === 200 ? '✅' : '❌'}`);
    console.log(`   CEO Login: ${loginRes.status === 200 ? '✅' : '❌'}`);
    console.log(`   Admin Login: ${adminLoginRes.status === 200 ? '✅' : '❌'}`);
    console.log(`   Fallback Login: ${fallbackRes.status === 200 ? '✅' : '❌'}`);
    console.log(`   Fallback Status: ${statusRes.status === 200 ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAuthentication();
