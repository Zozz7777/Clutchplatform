#!/usr/bin/env node

/**
 * Test Production Invitation API
 * Test the actual production API endpoint with the real token
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testProductionInvitation() {
  console.log('🧪 TESTING PRODUCTION INVITATION API');
  console.log('='.repeat(50));
  console.log('');

  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZ1c2lvbmVneUBnbWFpbC5jb20iLCJ0eXBlIjoiZW1wbG95ZWVfaW52aXRhdGlvbiIsImludml0ZWRCeSI6InN5c3RlbSIsImlhdCI6MTc1ODQxMDU3MSwiZXhwIjoxNzU5MDE1MzcxfQ.afj2wuIjRgQWA-BZItWGlheoL1lyR1C5rXuchwHCzW4';
  const productionUrl = 'https://clutch-main-nk7x.onrender.com';

  console.log('1️⃣ TESTING VALIDATE INVITATION ENDPOINT');
  console.log('-'.repeat(40));
  
  try {
    const validateResponse = await fetch(`${productionUrl}/api/v1/employees/validate-invitation/${testToken}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('📊 Status:', validateResponse.status);
    console.log('📊 Status Text:', validateResponse.statusText);
    
    const validateData = await validateResponse.json();
    console.log('📊 Response:', JSON.stringify(validateData, null, 2));
    
    if (validateResponse.ok) {
      console.log('✅ Validate invitation: SUCCESS');
    } else {
      console.log('❌ Validate invitation: FAILED');
    }
  } catch (error) {
    console.log('❌ Validate invitation: ERROR');
    console.log('Error:', error.message);
  }
  console.log('');

  console.log('2️⃣ TESTING ACCEPT INVITATION ENDPOINT');
  console.log('-'.repeat(40));
  
  try {
    const acceptResponse = await fetch(`${productionUrl}/api/v1/employees/accept-invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        token: testToken,
        password: 'TestPassword123!'
      })
    });

    console.log('📊 Status:', acceptResponse.status);
    console.log('📊 Status Text:', acceptResponse.statusText);
    
    const acceptData = await acceptResponse.json();
    console.log('📊 Response:', JSON.stringify(acceptData, null, 2));
    
    if (acceptResponse.ok) {
      console.log('✅ Accept invitation: SUCCESS');
    } else {
      console.log('❌ Accept invitation: FAILED');
    }
  } catch (error) {
    console.log('❌ Accept invitation: ERROR');
    console.log('Error:', error.message);
  }
  console.log('');

  console.log('3️⃣ ANALYSIS');
  console.log('-'.repeat(40));
  console.log('If both endpoints fail with "Invalid or expired invitation token",');
  console.log('the issue is likely a JWT_SECRET mismatch between:');
  console.log('- Local environment (where token was created)');
  console.log('- Production environment (where token is being verified)');
  console.log('');
  console.log('🔧 SOLUTION:');
  console.log('1. Check production environment variables');
  console.log('2. Ensure JWT_SECRET is the same in both environments');
  console.log('3. Regenerate invitation with production JWT_SECRET');
}

if (require.main === module) {
  testProductionInvitation();
}

module.exports = { testProductionInvitation };
