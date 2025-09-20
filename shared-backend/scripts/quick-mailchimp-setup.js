#!/usr/bin/env node

/**
 * Quick Mailchimp Setup Script
 * Provides immediate Mailchimp configuration for employee invitations
 */

const fs = require('fs');
const path = require('path');

function updateMailchimpConfig(apiKey, serverPrefix, fromEmail, fromName) {
  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update Mailchimp configuration
    const updates = {
      'MAILCHIMP_API_KEY': apiKey,
      'MAILCHIMP_SERVER_PREFIX': serverPrefix,
      'MAILCHIMP_FROM_EMAIL': fromEmail,
      'MAILCHIMP_FROM_NAME': fromName || 'Clutch Platform',
      'MAILCHIMP_LIST_ID': 'default'
    };
    
    Object.entries(updates).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    });
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Mailchimp configuration updated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to update .env file:', error.message);
    return false;
  }
}

// Get Mailchimp credentials from command line arguments
const apiKey = process.argv[2];
const serverPrefix = process.argv[3];
const fromEmail = process.argv[4];
const fromName = process.argv[5] || 'Clutch Platform';

if (!apiKey || !serverPrefix || !fromEmail) {
  console.log('🚨 URGENT: Employee invitation emails need Mailchimp setup!');
  console.log('');
  console.log('📧 To fix this immediately, run:');
  console.log('   node scripts/quick-mailchimp-setup.js YOUR_API_KEY us1 YourClutchauto@gmail.com "Clutch Platform"');
  console.log('');
  console.log('📋 How to get Mailchimp credentials:');
  console.log('   1. Go to: https://mailchimp.com/');
  console.log('   2. Sign up for a free account');
  console.log('   3. Go to Account > Extras > API keys');
  console.log('   4. Create a new API key');
  console.log('   5. The server prefix is in the API key (e.g., us1, us2)');
  console.log('');
  console.log('📋 Example:');
  console.log('   node scripts/quick-mailchimp-setup.js abc123def456-us1 us1 YourClutchauto@gmail.com "Clutch Platform"');
  console.log('');
  console.log('🔄 After setting up, restart your backend server');
  process.exit(1);
}

console.log('🔧 Setting up Mailchimp credentials...');
console.log(`📧 API Key: ${apiKey.substring(0, 10)}...`);
console.log(`🌍 Server Prefix: ${serverPrefix}`);
console.log(`📧 From Email: ${fromEmail}`);
console.log(`📧 From Name: ${fromName}`);

if (updateMailchimpConfig(apiKey, serverPrefix, fromEmail, fromName)) {
  console.log('');
  console.log('✅ Mailchimp setup completed!');
  console.log('🔄 Please restart your backend server now');
  console.log('🧪 Test with: node scripts/test-mailchimp.js');
} else {
  console.log('❌ Mailchimp setup failed');
  process.exit(1);
}
