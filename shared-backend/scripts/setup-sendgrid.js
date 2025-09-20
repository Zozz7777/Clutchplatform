#!/usr/bin/env node

/**
 * SendGrid Setup Script
 * Helps configure SendGrid for employee invitation emails
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

async function setupSendGrid() {
  console.log('📧 SendGrid Setup for Employee Invitations');
  console.log('==========================================\n');

  console.log('This script will help you configure SendGrid for sending employee invitations.');
  console.log('SendGrid is the most reliable service for transactional emails.\n');

  console.log('📋 Prerequisites:');
  console.log('1. SendGrid account (free tier: 100 emails/day)');
  console.log('2. API key from SendGrid');
  console.log('3. Verified sender email address\n');

  const apiKey = await question('Enter your SendGrid API key: ');
  const fromEmail = await question('Enter your from email address (e.g., YourClutchauto@gmail.com): ');
  const fromName = await question('Enter your from name (e.g., Clutch Platform): ');

  // Update .env file
  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update SendGrid configuration
    const updates = {
      'SENDGRID_API_KEY': apiKey,
      'SENDGRID_FROM_EMAIL': fromEmail,
      'SENDGRID_FROM_NAME': fromName
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
    console.log('\n✅ SendGrid configuration updated in .env file');
    
  } catch (error) {
    console.error('❌ Failed to update .env file:', error.message);
    console.log('\n📝 Please manually add these to your .env file:');
    Object.entries(updates).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });
  }

  console.log('\n🚀 Next Steps:');
  console.log('1. Restart your backend server');
  console.log('2. Test SendGrid connection with: node scripts/test-sendgrid.js');
  console.log('3. Try sending an employee invitation');
  
  console.log('\n📚 How to get SendGrid credentials:');
  console.log('1. Go to: https://sendgrid.com/');
  console.log('2. Sign up for a free account');
  console.log('3. Go to Settings > API Keys');
  console.log('4. Create a new API key with "Full Access"');
  console.log('5. Verify your sender email address in Settings > Sender Authentication');
  
  rl.close();
}

// Run the setup
if (require.main === module) {
  setupSendGrid()
    .then(() => {
      console.log('\n✨ SendGrid setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 SendGrid setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupSendGrid };
