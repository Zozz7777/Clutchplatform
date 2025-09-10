#!/usr/bin/env node

/**
 * Send Test OTP Script
 * This script sends a test OTP to a specific phone number
 */

require('dotenv').config();

// Test phone number
const TEST_PHONE = '+201009561143';

async function sendTestOTP() {
  console.log('📱 Sending Test OTP');
  console.log('===================');
  console.log(`📞 Phone Number: ${TEST_PHONE}`);
  
  try {
    // Load environment variables
    process.env.FIREBASE_SMS_ENABLED = 'true';
    
    // Import SMS service
    const { sendOTP, verifyOTP, smsHealthCheck } = require('../shared-backend/services/smsService');
    
    console.log('\n🔧 Checking SMS Service Health...');
    const health = await smsHealthCheck();
    console.log('📊 SMS Health Status:', health.status);
    
    if (health.status !== 'healthy') {
      console.log('❌ SMS service is not healthy:', health);
      return;
    }
    
    console.log('\n📤 Sending OTP...');
    const result = await sendOTP(TEST_PHONE, 'verification');
    
    if (result.success) {
      console.log('✅ OTP sent successfully!');
      console.log(`📱 Phone: ${result.phoneNumber}`);
      console.log(`⏰ Expires in: ${result.expiresIn} seconds`);
      console.log(`🔧 Provider: ${result.provider}`);
      console.log(`💬 Message: ${result.message}`);
      
      console.log('\n📝 Next Steps:');
      console.log('1. Check your phone for the SMS');
      console.log('2. Use the OTP to verify your number');
      console.log('3. The OTP will expire in 10 minutes');
      
    } else {
      console.log('❌ Failed to send OTP:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error sending OTP:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check Firebase configuration');
    console.log('2. Verify Redis connection');
    console.log('3. Ensure all environment variables are set');
  }
}

// Run the script
if (require.main === module) {
  sendTestOTP().catch(console.error);
}

module.exports = { sendTestOTP };
