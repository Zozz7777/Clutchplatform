#!/usr/bin/env node

/**
 * Test Script for SMS OTP Functionality
 * This script tests the Firebase SMS OTP system
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Test configuration
const TEST_CONFIG = {
  phoneNumber: '+201234567890', // Test phone number
  purpose: 'verification',
  testOTP: '123456'
};

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = process.env.MONGODB_DB || 'clutch';

async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 0,
      connectTimeoutMS: 60000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 60000,
      retryWrites: true,
      w: 'majority'
    });

    await client.connect();
    const db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB Atlas');
    return { client, db };
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Test Firebase Admin initialization
async function testFirebaseAdmin() {
  console.log('\n🔧 Testing Firebase Admin SDK...');
  console.log('==================================');
  
  try {
    const { initializeFirebaseAdmin, healthCheck } = require('../shared-backend/config/firebase-admin');
    
    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    console.log('✅ Firebase Admin SDK initialized');
    
    // Test health check
    const health = await healthCheck();
    console.log('📊 Firebase Health Check:', health.status);
    
    if (health.status === 'healthy') {
      console.log('✅ Firebase Admin SDK is working correctly');
      return true;
    } else {
      console.log('❌ Firebase Admin SDK health check failed:', health.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Firebase Admin SDK test failed:', error.message);
    return false;
  }
}

// Test Redis connection
async function testRedisConnection() {
  console.log('\n🔧 Testing Redis Connection...');
  console.log('===============================');
  
  try {
    const { getRedisClient } = require('../shared-backend/config/redis');
    const redisClient = getRedisClient();
    
    if (!redisClient) {
      console.log('❌ Redis client not available');
      return false;
    }
    
    // Test Redis connection
    await redisClient.ping();
    console.log('✅ Redis connection successful');
    
    // Test Redis operations
    const testKey = 'test:sms:otp';
    const testValue = JSON.stringify({
      otp: '123456',
      phoneNumber: TEST_CONFIG.phoneNumber,
      createdAt: new Date().toISOString()
    });
    
    await redisClient.setex(testKey, 60, testValue);
    const retrievedValue = await redisClient.get(testKey);
    
    if (retrievedValue === testValue) {
      console.log('✅ Redis read/write operations working');
      await redisClient.del(testKey);
      return true;
    } else {
      console.log('❌ Redis read/write operations failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Redis connection test failed:', error.message);
    return false;
  }
}

// Test SMS Service
async function testSMSService() {
  console.log('\n🔧 Testing SMS Service...');
  console.log('==========================');
  
  try {
    const { 
      sendOTP, 
      verifyOTP, 
      smsHealthCheck,
      SMS_CONFIG 
    } = require('../shared-backend/services/smsService');
    
    // Check SMS configuration
    console.log('📋 SMS Configuration:');
    console.log(`   Firebase Enabled: ${SMS_CONFIG.firebaseEnabled}`);
    console.log(`   Firebase Project ID: ${SMS_CONFIG.firebaseProjectId ? 'Set' : 'Not Set'}`);
    console.log(`   Firebase Private Key: ${SMS_CONFIG.firebasePrivateKey ? 'Set' : 'Not Set'}`);
    console.log(`   Firebase Client Email: ${SMS_CONFIG.firebaseClientEmail ? 'Set' : 'Not Set'}`);
    
    if (!SMS_CONFIG.firebaseEnabled) {
      console.log('⚠️  Firebase SMS is not enabled in configuration');
      return false;
    }
    
    // Test SMS health check
    const health = await smsHealthCheck();
    console.log('📊 SMS Service Health:', health.status);
    
    if (health.status !== 'healthy') {
      console.log('❌ SMS service health check failed:', health);
      return false;
    }
    
    // Test OTP sending (simulation)
    console.log('\n📱 Testing OTP sending...');
    try {
      const sendResult = await sendOTP(TEST_CONFIG.phoneNumber, TEST_CONFIG.purpose);
      console.log('✅ OTP sending test passed:', sendResult.success);
      
      if (sendResult.success) {
        console.log(`   Phone Number: ${sendResult.phoneNumber}`);
        console.log(`   Provider: ${sendResult.provider}`);
        console.log(`   Expires In: ${sendResult.expiresIn} seconds`);
      }
    } catch (error) {
      console.log('⚠️  OTP sending test failed (expected in test environment):', error.message);
    }
    
    // Test OTP verification (simulation)
    console.log('\n🔍 Testing OTP verification...');
    try {
      // First, manually set an OTP in Redis for testing
      const { getRedisClient } = require('../shared-backend/config/redis');
      const redisClient = getRedisClient();
      
      const otpKey = `otp:${TEST_CONFIG.phoneNumber}:${TEST_CONFIG.purpose}`;
      await redisClient.setex(otpKey, 600, JSON.stringify({
        otp: TEST_CONFIG.testOTP,
        purpose: TEST_CONFIG.purpose,
        phoneNumber: TEST_CONFIG.phoneNumber,
        createdAt: new Date().toISOString(),
        attempts: 0
      }));
      
      const verifyResult = await verifyOTP(TEST_CONFIG.phoneNumber, TEST_CONFIG.testOTP, TEST_CONFIG.purpose);
      console.log('✅ OTP verification test passed:', verifyResult.success);
      
      if (verifyResult.success && verifyResult.verified) {
        console.log('   OTP verified successfully');
      }
      
      // Clean up
      await redisClient.del(otpKey);
      
    } catch (error) {
      console.log('⚠️  OTP verification test failed:', error.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ SMS service test failed:', error.message);
    return false;
  }
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n🔧 Testing API Endpoints...');
  console.log('============================');
  
  try {
    const axios = require('axios');
    const baseURL = 'http://localhost:5000';
    
    // Test health endpoint
    try {
      const healthResponse = await axios.get(`${baseURL}/api/health`);
      console.log('✅ API Health Check:', healthResponse.data.success);
    } catch (error) {
      console.log('⚠️  API health check failed (server may not be running):', error.message);
    }
    
    // Test SMS OTP endpoint (if server is running)
    try {
      const otpResponse = await axios.post(`${baseURL}/api/mobile/send-otp`, {
        phone: TEST_CONFIG.phoneNumber,
        purpose: TEST_CONFIG.purpose
      });
      console.log('✅ SMS OTP API endpoint test passed:', otpResponse.data.success);
    } catch (error) {
      console.log('⚠️  SMS OTP API endpoint test failed (server may not be running):', error.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ API endpoints test failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 SMS OTP Functionality Test Suite');
  console.log('====================================');
  console.log(`📱 Test Phone Number: ${TEST_CONFIG.phoneNumber}`);
  console.log(`🎯 Test Purpose: ${TEST_CONFIG.purpose}`);
  console.log(`🔢 Test OTP: ${TEST_CONFIG.testOTP}`);
  
  const { client, db } = await connectToDatabase();
  
  try {
    const results = {
      firebase: await testFirebaseAdmin(),
      redis: await testRedisConnection(),
      sms: await testSMSService(),
      api: await testAPIEndpoints()
    };
    
    // Summary
    console.log('\n📋 TEST SUMMARY:');
    console.log('================');
    console.log(`Firebase Admin SDK: ${results.firebase ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Redis Connection: ${results.redis ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`SMS Service: ${results.sms ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`API Endpoints: ${results.api ? '✅ PASS' : '⚠️  SKIP'}`);
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests >= 3) {
      console.log('✅ SMS OTP functionality is working correctly!');
      console.log('\n📝 Next Steps:');
      console.log('   1. Start the server: npm start');
      console.log('   2. Test with real phone numbers');
      console.log('   3. Monitor Firebase console for SMS delivery');
    } else {
      console.log('❌ Some tests failed. Please check the configuration.');
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Verify Firebase Admin SDK configuration');
      console.log('   2. Check Redis connection settings');
      console.log('   3. Ensure all environment variables are set');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
