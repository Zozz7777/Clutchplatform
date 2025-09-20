#!/usr/bin/env node

/**
 * Test Production Email Configuration
 * Verifies that email service is properly configured in production
 */

const https = require('https');

console.log('🧪 TESTING PRODUCTION EMAIL CONFIGURATION');
console.log('='.repeat(50));
console.log('');

// Test the email service endpoint
const testEmailService = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'clutch-main-nk7x.onrender.com',
      port: 443,
      path: '/api/v1/employees/invitations/test-email',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Email-Test-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
};

// Run the test
testEmailService()
  .then((result) => {
    console.log('📊 TEST RESULTS:');
    console.log(`Status Code: ${result.status}`);
    console.log(`Response: ${JSON.stringify(result.data, null, 2)}`);
    console.log('');
    
    if (result.status === 200) {
      console.log('✅ Email service is responding');
    } else if (result.status === 401) {
      console.log('🔐 Authentication required (expected)');
    } else {
      console.log('❌ Unexpected response');
    }
  })
  .catch((error) => {
    console.log('❌ TEST FAILED:');
    console.log(`Error: ${error.message}`);
    console.log('');
    console.log('💡 TROUBLESHOOTING:');
    console.log('1. Check if Render deployment is complete');
    console.log('2. Verify environment variables are updated');
    console.log('3. Check Render logs for email service initialization');
  });

console.log('🔍 CHECKING PRODUCTION LOGS FOR EMAIL SERVICE STATUS...');
console.log('');
console.log('Look for these log messages in Render dashboard:');
console.log('✅ "Email service initialized with real SMTP" - SUCCESS');
console.log('⚠️  "Email credentials not configured, using mock email service" - NEEDS UPDATE');
console.log('❌ "Failed to initialize email service" - CONFIGURATION ERROR');
console.log('');
console.log('📋 NEXT STEPS:');
console.log('1. Update Render environment variables as shown in previous script');
console.log('2. Wait for redeployment (2-3 minutes)');
console.log('3. Test employee invitation to verify real email delivery');
console.log('4. Check logs for successful email service initialization');
