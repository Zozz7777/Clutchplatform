#!/usr/bin/env node

/**
 * Email Setup Script
 * Helps configure email credentials for employee invitations
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEmailCredentials() {
  console.log('🔧 Email Setup for Employee Invitations');
  console.log('=====================================\n');

  console.log('This script will help you configure email credentials for sending employee invitations.');
  console.log('You can use Gmail, Outlook, or any SMTP provider.\n');

  const emailProvider = await question('Choose email provider (gmail/outlook/custom): ');
  
  let emailConfig = {};

  if (emailProvider.toLowerCase() === 'gmail') {
    console.log('\n📧 Gmail Configuration:');
    console.log('1. Enable 2-factor authentication on your Gmail account');
    console.log('2. Generate an App Password: https://support.google.com/accounts/answer/185833');
    console.log('3. Use your Gmail address and the App Password below\n');
    
    emailConfig.EMAIL_USER = await question('Gmail address: ');
    emailConfig.EMAIL_PASSWORD = await question('Gmail App Password: ');
    emailConfig.EMAIL_SERVICE = 'gmail';
    emailConfig.EMAIL_FROM = emailConfig.EMAIL_USER;
    
  } else if (emailProvider.toLowerCase() === 'outlook') {
    console.log('\n📧 Outlook Configuration:');
    console.log('1. Use your Outlook/Hotmail email address');
    console.log('2. Use your regular password (or App Password if 2FA is enabled)\n');
    
    emailConfig.EMAIL_USER = await question('Outlook email address: ');
    emailConfig.EMAIL_PASSWORD = await question('Outlook password: ');
    emailConfig.EMAIL_SERVICE = 'hotmail';
    emailConfig.EMAIL_FROM = emailConfig.EMAIL_USER;
    
  } else {
    console.log('\n📧 Custom SMTP Configuration:');
    
    emailConfig.SMTP_HOST = await question('SMTP Host (e.g., smtp.yourdomain.com): ');
    emailConfig.SMTP_PORT = await question('SMTP Port (usually 587): ') || '587';
    emailConfig.SMTP_USER = await question('SMTP Username: ');
    emailConfig.SMTP_PASS = await question('SMTP Password: ');
    emailConfig.EMAIL_FROM = await question('From Email Address: ');
    emailConfig.EMAIL_SECURE = await question('Use SSL? (true/false): ') || 'false';
  }

  // Update .env file
  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or add email configuration
    Object.entries(emailConfig).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    });
    
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Email configuration updated in .env file');
    
  } catch (error) {
    console.error('❌ Failed to update .env file:', error.message);
    console.log('\n📝 Please manually add these to your .env file:');
    Object.entries(emailConfig).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });
  }

  console.log('\n🚀 Next Steps:');
  console.log('1. Restart your backend server');
  console.log('2. Test email sending with: node scripts/test-email.js');
  console.log('3. Try sending an employee invitation');
  
  rl.close();
}

// Run the setup
if (require.main === module) {
  setupEmailCredentials()
    .then(() => {
      console.log('\n✨ Email setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Email setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupEmailCredentials };
