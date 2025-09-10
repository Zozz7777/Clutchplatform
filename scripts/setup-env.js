#!/usr/bin/env node

/**
 * Environment Setup Script for Clutch Platform
 * This script helps users quickly configure their environment variables
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Clutch Platform - Environment Setup');
console.log('=====================================\n');

// Check if .env already exists
if (fs.existsSync('.env')) {
  console.log('⚠️  .env file already exists!');
  rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      setupEnvironment();
    } else {
      console.log('Setup cancelled. Your existing .env file remains unchanged.');
      rl.close();
    }
  });
} else {
  setupEnvironment();
}

function setupEnvironment() {
  console.log('\n📋 Setting up environment configuration...\n');
  
  // Check if .env.example exists
  if (!fs.existsSync('.env.example')) {
    console.log('❌ .env.example file not found!');
    console.log('Please ensure you have copied the repository correctly.');
    rl.close();
    return;
  }

  // Copy .env.example to .env
  try {
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ Created .env file from template');
    
    console.log('\n📝 Next Steps:');
    console.log('1. Edit the .env file with your actual values');
    console.log('2. See ENVIRONMENT_SETUP_GUIDE.md for detailed instructions');
    console.log('3. Required variables to configure:');
    console.log('   - Firebase configuration');
    console.log('   - MongoDB connection strings');
    console.log('   - JWT secrets');
    console.log('   - API keys for third-party services');
    
    console.log('\n🔧 Quick Configuration Commands:');
    console.log('   # Edit environment file');
    console.log('   nano .env  # Linux/Mac');
    console.log('   notepad .env  # Windows');
    console.log('   code .env  # VS Code');
    
    console.log('\n📚 For detailed help, see:');
    console.log('   - ENVIRONMENT_SETUP_GUIDE.md');
    console.log('   - README.md');
    
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }
  
  rl.close();
}
