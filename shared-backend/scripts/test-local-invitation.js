#!/usr/bin/env node

/**
 * Test Local Invitation API
 * Test the local server to verify the fix works
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testLocalInvitation() {
  console.log('🧪 TESTING LOCAL INVITATION API');
  console.log('='.repeat(50));
  console.log('');

  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZ1c2lvbmVneUBnbWFpbC5jb20iLCJ0eXBlIjoiZW1wbG95ZWVfaW52aXRhdGlvbiIsImludml0ZWRCeSI6InN5c3RlbSIsImlhdCI6MTc1ODQxMDU3MSwiZXhwIjoxNzU5MDE1MzcxfQ.afj2wuIjRgQWA-BZItWGlheoL1lyR1C5rXuchwHCzW4';
  const localUrl = 'http://localhost:5001';

  console.log('1️⃣ TESTING VALIDATE INVITATION ENDPOINT');
  console.log('-'.repeat(40));
  
  try {
    const validateResponse = await fetch(`${localUrl}/api/v1/employees/validate-invitation/${testToken}`, {
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
    console.log('💡 Make sure the local server is running on port 5001');
  }
  console.log('');

  console.log('2️⃣ TESTING ACCEPT INVITATION ENDPOINT');
  console.log('-'.repeat(40));
  
  try {
    const acceptResponse = await fetch(`${localUrl}/api/v1/employees/accept-invitation`, {
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
      console.log('🎉 Employee account created successfully!');
    } else {
      console.log('❌ Accept invitation: FAILED');
      console.log('Error:', acceptData.error);
      console.log('Message:', acceptData.message);
    }
  } catch (error) {
    console.log('❌ Accept invitation: ERROR');
    console.log('Error:', error.message);
    console.log('💡 Make sure the local server is running on port 5001');
  }
  console.log('');

  console.log('3️⃣ SUMMARY');
  console.log('-'.repeat(40));
  console.log('If both endpoints work locally but fail in production,');
  console.log('the issue is that production needs to be updated with the fix.');
  console.log('');
  console.log('🔧 NEXT STEPS:');
  console.log('1. Deploy the updated code to production');
  console.log('2. Restart the production server');
  console.log('3. Test the production endpoints again');
}

if (require.main === module) {
  testLocalInvitation();
}

module.exports = { testLocalInvitation };
