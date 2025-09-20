#!/usr/bin/env node

/**
 * Mailchimp Setup Script
 * Helps configure Mailchimp for employee invitation emails
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

async function setupMailchimp() {
  console.log('📧 Mailchimp Setup for Employee Invitations');
  console.log('==========================================\n');

  console.log('This script will help you configure Mailchimp for sending employee invitations.');
  console.log('Mailchimp is more reliable than SMTP and provides better deliverability.\n');

  console.log('📋 Prerequisites:');
  console.log('1. Mailchimp account (free tier available)');
  console.log('2. API key from Mailchimp');
  console.log('3. Server prefix (e.g., us1, us2, etc.)\n');

  const apiKey = await question('Enter your Mailchimp API key: ');
  const serverPrefix = await question('Enter your Mailchimp server prefix (e.g., us1): ');
  const fromEmail = await question('Enter your from email address (e.g., YourClutchauto@gmail.com): ');
  const fromName = await question('Enter your from name (e.g., Clutch Platform): ');
  const listId = await question('Enter your Mailchimp list ID (optional, press Enter to skip): ');

  // Update .env file
  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update Mailchimp configuration
    const updates = {
      'MAILCHIMP_API_KEY': apiKey,
      'MAILCHIMP_SERVER_PREFIX': serverPrefix,
      'MAILCHIMP_FROM_EMAIL': fromEmail,
      'MAILCHIMP_FROM_NAME': fromName,
      'MAILCHIMP_LIST_ID': listId || 'default'
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
    console.log('\n✅ Mailchimp configuration updated in .env file');
    
  } catch (error) {
    console.error('❌ Failed to update .env file:', error.message);
    console.log('\n📝 Please manually add these to your .env file:');
    Object.entries(updates).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });
  }

  console.log('\n🚀 Next Steps:');
  console.log('1. Restart your backend server');
  console.log('2. Test Mailchimp connection with: node scripts/test-mailchimp.js');
  console.log('3. Try sending an employee invitation');
  
  console.log('\n📚 How to get Mailchimp credentials:');
  console.log('1. Go to: https://mailchimp.com/');
  console.log('2. Sign up for a free account');
  console.log('3. Go to Account > Extras > API keys');
  console.log('4. Create a new API key');
  console.log('5. The server prefix is in the API key (e.g., us1, us2)');
  
  rl.close();
}

// Run the setup
if (require.main === module) {
  setupMailchimp()
    .then(() => {
      console.log('\n✨ Mailchimp setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Mailchimp setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupMailchimp };
