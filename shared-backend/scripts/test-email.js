#!/usr/bin/env node

/**
 * Test Email Script
 * Tests email configuration for employee invitations
 */

const emailService = require('../services/email-service');

async function testEmailService() {
  console.log('🧪 Testing Email Service');
  console.log('========================\n');

  try {
    // Test connection
    console.log('1. Testing email service connection...');
    const connectionTest = await emailService.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ Email service connection successful');
    } else {
      console.log('❌ Email service connection failed:', connectionTest.error);
      console.log('📧 Email service is running in mock mode');
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

    const result = await emailService.sendEmployeeInvitation(testInvitation);
    
    if (result.messageId) {
      console.log('✅ Test invitation sent successfully');
      console.log('📧 Message ID:', result.messageId);
      console.log('📧 Recipients:', result.accepted);
    } else {
      console.log('❌ Failed to send test invitation');
    }

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }

  console.log('\n📋 Email Service Status:');
  console.log('- If you see "MOCK EMAIL" messages, email credentials need to be configured');
  console.log('- If you see "Email service connection successful", real emails will be sent');
  console.log('- Check the pending_emails collection in MongoDB for stored invitations');
}

// Run the test
if (require.main === module) {
  testEmailService()
    .then(() => {
      console.log('\n✨ Email test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Email test failed:', error);
      process.exit(1);
    });
}

module.exports = { testEmailService };
