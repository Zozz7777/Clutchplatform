#!/usr/bin/env node

/**
 * Quick Email Setup Script
 * Provides immediate email configuration for employee invitations
 */

const fs = require('fs');
const path = require('path');

function updateEmailConfig(email, password) {
  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update email configuration
    const updates = {
      'EMAIL_USER': email,
      'EMAIL_PASSWORD': password,
      'EMAIL_FROM': email,
      'SMTP_USER': email,
      'SMTP_PASS': password
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
    console.log('✅ Email configuration updated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to update .env file:', error.message);
    return false;
  }
}

// Get email credentials from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('🚨 URGENT: Employee invitation emails are not being sent!');
  console.log('');
  console.log('📧 To fix this immediately, run:');
  console.log('   node scripts/quick-email-setup.js your-email@gmail.com your-app-password');
  console.log('');
  console.log('📋 For Gmail setup:');
  console.log('   1. Go to: https://myaccount.google.com/security');
  console.log('   2. Enable 2-Factor Authentication');
  console.log('   3. Generate App Password: https://support.google.com/accounts/answer/185833');
  console.log('   4. Use your Gmail address and the App Password (not your regular password)');
  console.log('');
  console.log('📋 For other email providers:');
  console.log('   - Use your email address and password');
  console.log('   - Make sure SMTP is enabled for your account');
  console.log('');
  console.log('🔄 After setting up, restart your backend server');
  process.exit(1);
}

console.log('🔧 Setting up email credentials...');
console.log(`📧 Email: ${email}`);
console.log('🔑 Password: [HIDDEN]');

if (updateEmailConfig(email, password)) {
  console.log('');
  console.log('✅ Email setup completed!');
  console.log('🔄 Please restart your backend server now');
  console.log('🧪 Test with: node scripts/test-email.js');
} else {
  console.log('❌ Email setup failed');
  process.exit(1);
}
