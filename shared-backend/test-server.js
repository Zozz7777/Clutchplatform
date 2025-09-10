#!/usr/bin/env node

/**
 * Simple server test to verify basic functionality
 */

require('dotenv').config();

console.log('🧪 Testing server startup...');

// Test environment variables
console.log('📋 Environment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');

// Test database connection
async function testDatabase() {
  try {
    console.log('\n🔌 Testing database connection...');
    const { connectToDatabase } = require('./config/database');
    await connectToDatabase();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Test server startup
async function testServer() {
  try {
    console.log('\n🚀 Testing server startup...');
    const app = require('./server');
    console.log('✅ Server startup successful');
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await testDatabase();
  await testServer();
  console.log('\n🎉 Tests completed');
  process.exit(0);
}

runTests().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
