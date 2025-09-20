#!/usr/bin/env node

/**
 * Test Mailchimp Script
 * Tests Mailchimp configuration for employee invitations
 */

const mailchimpService = require('../services/mailchimp-service');

async function testMailchimpService() {
  console.log('🧪 Testing Mailchimp Service');
  console.log('============================\n');

  try {
    // Test connection
    console.log('1. Testing Mailchimp connection...');
    const connectionTest = await mailchimpService.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ Mailchimp connection successful');
      console.log('📊 Response:', connectionTest.data);
    } else {
      console.log('❌ Mailchimp connection failed:', connectionTest.error);
      console.log('📧 Make sure your API key and server prefix are correct');
      return;
    }

    // Test sending a sample invitation
    console.log('\n2. Testing employee invitation email...');
    
    const testInvitation = {
      email: 'test@example.com',
      name: 'Test Employee',
      role: 'developer',
      department: 'Engineering',
      invitationToken: 'test-token-123'
    };

    const result = await mailchimpService.sendEmployeeInvitation(testInvitation);
    
    if (result.success) {
      console.log('✅ Test invitation sent successfully via Mailchimp');
      console.log('📧 Message ID:', result.messageId);
      console.log('📧 Recipients:', result.accepted);
      console.log('📧 Provider:', result.provider);
    } else {
      console.log('❌ Failed to send test invitation');
    }

  } catch (error) {
    console.error('❌ Mailchimp test failed:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Solution: Check your MAILCHIMP_API_KEY in .env file');
    } else if (error.message.includes('server')) {
      console.log('\n💡 Solution: Check your MAILCHIMP_SERVER_PREFIX in .env file');
    } else if (error.message.includes('from_email')) {
      console.log('\n💡 Solution: Check your MAILCHIMP_FROM_EMAIL in .env file');
    }
  }

  console.log('\n📋 Mailchimp Service Status:');
  console.log('- If you see "Mailchimp connection successful", emails will be sent via Mailchimp');
  console.log('- If you see connection errors, check your API key and server prefix');
  console.log('- Mailchimp provides better deliverability than SMTP');
}

// Run the test
if (require.main === module) {
  testMailchimpService()
    .then(() => {
      console.log('\n✨ Mailchimp test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Mailchimp test failed:', error);
      process.exit(1);
    });
}

module.exports = { testMailchimpService };
