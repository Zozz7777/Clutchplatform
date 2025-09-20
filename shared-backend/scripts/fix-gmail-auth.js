#!/usr/bin/env node

/**
 * Gmail Authentication Fix Script
 * Helps resolve Gmail authentication issues for email sending
 */

console.log('🔧 Gmail Authentication Fix');
console.log('==========================\n');

console.log('❌ Current Issue: Gmail is requiring web browser login');
console.log('📧 This means the App Password is not working correctly\n');

console.log('🔧 SOLUTIONS TO TRY:\n');

console.log('1. 🔑 REGENERATE APP PASSWORD:');
console.log('   - Go to: https://myaccount.google.com/security');
console.log('   - Click "2-Step Verification"');
console.log('   - Scroll down to "App passwords"');
console.log('   - Delete the existing "Clutch" app password');
console.log('   - Create a new one and copy the 16-character code');
console.log('   - Update your .env file with the new password\n');

console.log('2. 🔐 ENABLE LESS SECURE APPS (Alternative):');
console.log('   - Go to: https://myaccount.google.com/security');
console.log('   - Turn OFF 2-Step Verification temporarily');
console.log('   - Go to: https://myaccount.google.com/lesssecureapps');
console.log('   - Turn ON "Allow less secure apps"');
console.log('   - Use your regular Gmail password (not App Password)');
console.log('   - ⚠️  WARNING: This is less secure!\n');

console.log('3. 📱 USE GMAIL API (Recommended for Production):');
console.log('   - Go to: https://console.developers.google.com/');
console.log('   - Create a new project or select existing');
console.log('   - Enable Gmail API');
console.log('   - Create credentials (OAuth 2.0)');
console.log('   - This is more secure but requires more setup\n');

console.log('4. 🚀 QUICK FIX - Use Different Email Provider:');
console.log('   - Try Outlook/Hotmail: smtp.live.com:587');
console.log('   - Try Yahoo: smtp.mail.yahoo.com:587');
console.log('   - Try SendGrid, Mailgun, or other email services\n');

console.log('🔄 After fixing, test with: node scripts/test-email.js');
console.log('📧 Current credentials in .env:');
console.log('   EMAIL_USER=YourClutchauto@gmail.com');
console.log('   EMAIL_PASSWORD=xoon gnlw qwpj cruo');

// Check if we can read the current .env
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  console.log('\n📋 Current .env email configuration:');
  const emailLines = envContent.split('\n').filter(line => 
    line.includes('EMAIL_') || line.includes('SMTP_')
  );
  emailLines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      console.log(`   ${line}`);
    }
  });
} catch (error) {
  console.log('\n❌ Could not read .env file');
}

console.log('\n💡 RECOMMENDATION:');
console.log('   Try regenerating the App Password first (Solution #1)');
console.log('   If that doesn\'t work, consider using a different email provider');
