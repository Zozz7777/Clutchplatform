#!/usr/bin/env node

/**
 * Quick SendGrid Setup Script
 * Provides immediate SendGrid configuration for employee invitations
 */

const fs = require('fs');
const path = require('path');

function updateSendGridConfig(apiKey, fromEmail, fromName) {
  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update SendGrid configuration
    const updates = {
      'SENDGRID_API_KEY': apiKey,
      'SENDGRID_FROM_EMAIL': fromEmail,
      'SENDGRID_FROM_NAME': fromName || 'Clutch Platform'
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
    console.log('✅ SendGrid configuration updated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to update .env file:', error.message);
    return false;
  }
}

// Get SendGrid credentials from command line arguments
const apiKey = process.argv[2];
const fromEmail = process.argv[3];
const fromName = process.argv[4] || 'Clutch Platform';

if (!apiKey || !fromEmail) {
  console.log('🚨 URGENT: Employee invitation emails need SendGrid setup!');
  console.log('');
  console.log('📧 To fix this immediately, run:');
  console.log('   node scripts/quick-sendgrid-setup.js YOUR_API_KEY YourClutchauto@gmail.com "Clutch Platform"');
  console.log('');
  console.log('📋 How to get SendGrid credentials:');
  console.log('   1. Go to: https://sendgrid.com/');
  console.log('   2. Sign up for a free account (100 emails/day free)');
  console.log('   3. Go to Settings > API Keys');
  console.log('   4. Create a new API key with "Full Access"');
  console.log('   5. Verify your sender email in Settings > Sender Authentication');
  console.log('');
  console.log('📋 Example:');
  console.log('   node scripts/quick-sendgrid-setup.js SG.abc123def456 YourClutchauto@gmail.com "Clutch Platform"');
  console.log('');
  console.log('🔄 After setting up, restart your backend server');
  process.exit(1);
}

console.log('🔧 Setting up SendGrid credentials...');
console.log(`📧 API Key: ${apiKey.substring(0, 10)}...`);
console.log(`📧 From Email: ${fromEmail}`);
console.log(`📧 From Name: ${fromName}`);

if (updateSendGridConfig(apiKey, fromEmail, fromName)) {
  console.log('');
  console.log('✅ SendGrid setup completed!');
  console.log('🔄 Please restart your backend server now');
  console.log('🧪 Test with: node scripts/test-sendgrid.js');
} else {
  console.log('❌ SendGrid setup failed');
  process.exit(1);
}
