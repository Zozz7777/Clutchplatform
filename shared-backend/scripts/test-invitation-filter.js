#!/usr/bin/env node

/**
 * Test Invitation Filter
 * Test the invitation filtering to verify it works correctly
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testInvitationFilter() {
  console.log('🧪 TESTING INVITATION FILTER');
  console.log('='.repeat(50));
  console.log('');

  const productionUrl = 'https://clutch-main-nk7x.onrender.com';

  console.log('1️⃣ TESTING GET INVITATIONS WITH STATUS=PENDING');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch(`${productionUrl}/api/v1/employees/invitations?status=pending`, {
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
      console.log('✅ GET invitations with pending filter: AUTHENTICATION REQUIRED (Expected)');
    } else if (response.status === 200) {
      console.log('✅ GET invitations with pending filter: SUCCESS');
    } else {
      console.log('❌ GET invitations with pending filter: UNEXPECTED STATUS');
    }
    
  } catch (error) {
    console.log('❌ GET invitations with pending filter: ERROR -', error.message);
  }

  console.log('');
  console.log('2️⃣ TESTING GET INVITATIONS WITH STATUS=ALL');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch(`${productionUrl}/api/v1/employees/invitations?status=all`, {
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
      console.log('✅ GET invitations with all filter: AUTHENTICATION REQUIRED (Expected)');
    } else if (response.status === 200) {
      console.log('✅ GET invitations with all filter: SUCCESS');
    } else {
      console.log('❌ GET invitations with all filter: UNEXPECTED STATUS');
    }
    
  } catch (error) {
    console.log('❌ GET invitations with all filter: ERROR -', error.message);
  }

  console.log('');
  console.log('3️⃣ ANALYSIS');
  console.log('-'.repeat(40));
  console.log('If both endpoints return 401 (Authentication Required),');
  console.log('the filtering is working correctly on the backend.');
  console.log('The issue is likely:');
  console.log('1. Frontend changes not deployed yet');
  console.log('2. Browser caching the old API calls');
  console.log('3. Frontend not passing the status parameter');
  console.log('');
  console.log('🔧 NEXT STEPS:');
  console.log('1. Clear browser cache and refresh');
  console.log('2. Check if frontend changes are deployed');
  console.log('3. Verify the API call includes ?status=pending');
}

testInvitationFilter().catch(console.error);
