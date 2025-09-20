#!/usr/bin/env node

/**
 * Test SendGrid Script
 * Tests SendGrid configuration for employee invitations
 */

const sendGridService = require('../services/sendgrid-service');

async function testSendGridService() {
  console.log('🧪 Testing SendGrid Service');
  console.log('===========================\n');

  try {
    // Test connection
    console.log('1. Testing SendGrid connection...');
    const connectionTest = await sendGridService.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ SendGrid connection successful');
      console.log('📧 Test email sent to:', process.env.SENDGRID_FROM_EMAIL);
    } else {
      console.log('❌ SendGrid connection failed:', connectionTest.error);
      console.log('📧 Make sure your API key and from email are correct');
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

    const result = await sendGridService.sendEmployeeInvitation(testInvitation);
    
    if (result.success) {
      console.log('✅ Test invitation sent successfully via SendGrid');
      console.log('📧 Message ID:', result.messageId);
      console.log('📧 Recipients:', result.accepted);
      console.log('📧 Provider:', result.provider);
    } else {
      console.log('❌ Failed to send test invitation');
    }

  } catch (error) {
    console.error('❌ SendGrid test failed:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Solution: Check your SENDGRID_API_KEY in .env file');
    } else if (error.message.includes('from_email')) {
      console.log('\n💡 Solution: Check your SENDGRID_FROM_EMAIL in .env file');
    } else if (error.message.includes('verified')) {
      console.log('\n💡 Solution: Verify your sender email address in SendGrid dashboard');
    }
  }

  console.log('\n📋 SendGrid Service Status:');
  console.log('- If you see "SendGrid connection successful", emails will be sent via SendGrid');
  console.log('- If you see connection errors, check your API key and sender verification');
  console.log('- SendGrid provides excellent deliverability for transactional emails');
}

// Run the test
if (require.main === module) {
  testSendGridService()
    .then(() => {
      console.log('\n✨ SendGrid test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 SendGrid test failed:', error);
      process.exit(1);
    });
}

module.exports = { testSendGridService };
