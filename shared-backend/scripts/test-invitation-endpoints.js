#!/usr/bin/env node

/**
 * Test Invitation Endpoints
 * Test the invitation management endpoints to verify they work correctly
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testInvitationEndpoints() {
  console.log('🧪 TESTING INVITATION ENDPOINTS');
  console.log('='.repeat(50));
  console.log('');

  const productionUrl = 'https://clutch-main-nk7x.onrender.com';

  console.log('1️⃣ TESTING GET INVITATIONS ENDPOINT');
  console.log('-'.repeat(40));
  
  try {
    // Test without authentication first
    const response = await fetch(`${productionUrl}/api/v1/employees/invitations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    const responseData = await response.text();
    console.log('📊 Response:', responseData);
    
    if (response.status === 401) {
      console.log('✅ GET invitations: AUTHENTICATION REQUIRED (Expected)');
    } else if (response.status === 200) {
      console.log('✅ GET invitations: SUCCESS');
    } else {
      console.log('❌ GET invitations: UNEXPECTED STATUS');
    }
    
  } catch (error) {
    console.log('❌ GET invitations: ERROR -', error.message);
  }

  console.log('');
  console.log('2️⃣ TESTING RESEND INVITATION ENDPOINT');
  console.log('-'.repeat(40));
  
  try {
    // Test without authentication first
    const response = await fetch(`${productionUrl}/api/v1/employees/invitations/test-id/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    const responseData = await response.text();
    console.log('📊 Response:', responseData);
    
    if (response.status === 401) {
      console.log('✅ RESEND invitation: AUTHENTICATION REQUIRED (Expected)');
    } else if (response.status === 404) {
      console.log('✅ RESEND invitation: NOT FOUND (Expected for test-id)');
    } else {
      console.log('❌ RESEND invitation: UNEXPECTED STATUS');
    }
    
  } catch (error) {
    console.log('❌ RESEND invitation: ERROR -', error.message);
  }

  console.log('');
  console.log('3️⃣ TESTING DELETE INVITATION ENDPOINT');
  console.log('-'.repeat(40));
  
  try {
    // Test without authentication first
    const response = await fetch(`${productionUrl}/api/v1/employees/invitations/test-id`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    const responseData = await response.text();
    console.log('📊 Response:', responseData);
    
    if (response.status === 401) {
      console.log('✅ DELETE invitation: AUTHENTICATION REQUIRED (Expected)');
    } else if (response.status === 404) {
      console.log('✅ DELETE invitation: NOT FOUND (Expected for test-id)');
    } else {
      console.log('❌ DELETE invitation: UNEXPECTED STATUS');
    }
    
  } catch (error) {
    console.log('❌ DELETE invitation: ERROR -', error.message);
  }

  console.log('');
  console.log('4️⃣ ANALYSIS');
  console.log('-'.repeat(40));
  console.log('If all endpoints return 401 (Authentication Required),');
  console.log('the endpoints are working correctly and the issue is likely:');
  console.log('1. User authentication/authorization');
  console.log('2. Role permissions (hr_manager vs hr)');
  console.log('3. Frontend API calls not including proper headers');
  console.log('');
  console.log('🔧 NEXT STEPS:');
  console.log('1. Check user role in frontend');
  console.log('2. Verify API calls include Authorization header');
  console.log('3. Check if user has hr_manager role');
}

testInvitationEndpoints().catch(console.error);
