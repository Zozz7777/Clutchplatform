#!/usr/bin/env node

/**
 * Test Create Invitation API
 * Test creating a new invitation and email sending
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCreateInvitation() {
  console.log('🧪 TESTING CREATE INVITATION API');
  console.log('='.repeat(50));
  console.log('');

  const productionUrl = 'https://clutch-main-nk7x.onrender.com';
  
  // You'll need to get a valid admin token for this test
  const adminToken = 'YOUR_ADMIN_TOKEN_HERE'; // Replace with actual admin token
  
  console.log('1️⃣ TESTING CREATE INVITATION ENDPOINT');
  console.log('-'.repeat(40));
  
  const invitationData = {
    email: 'test-invitation@example.com',
    name: 'Test Employee',
    role: 'employee',
    department: 'IT',
    position: 'Software Developer',
    permissions: ['read']
  };
  
  try {
    const response = await fetch(`${productionUrl}/api/v1/employees/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(invitationData)
    });
    
    const responseData = await response.json();
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    console.log('📊 Response:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('✅ Create invitation: SUCCESS');
      console.log('📧 Email should have been sent to:', invitationData.email);
      
      if (responseData.data?.invitation?.invitationToken) {
        console.log('🔑 Invitation token:', responseData.data.invitation.invitationToken);
        console.log('🔗 Setup URL:', `https://admin.yourclutch.com/setup-password?token=${responseData.data.invitation.invitationToken}`);
      }
    } else {
      console.log('❌ Create invitation: FAILED');
    }
    
  } catch (error) {
    console.log('❌ Create invitation: ERROR');
    console.log('Error:', error.message);
  }
  
  console.log('');
  console.log('2️⃣ ANALYSIS');
  console.log('-'.repeat(40));
  console.log('If the invitation is created successfully but no email is sent:');
  console.log('1. Check email service configuration');
  console.log('2. Verify SendGrid API key is set');
  console.log('3. Check SMTP configuration');
  console.log('4. Look at server logs for email errors');
}

// Run the test
testCreateInvitation().catch(console.error);
