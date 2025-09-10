#!/usr/bin/env node

/**
 * Test Real SMS with Firebase Phone Auth
 * This script tests sending real SMS to the user's phone number
 */

const { MongoClient } = require('mongodb');
const Redis = require('ioredis');
require('dotenv').config();

// Test configuration
const TEST_CONFIG = {
  phoneNumber: '+201009561143',
  purpose: 'verification'
};

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = process.env.MONGODB_DB || 'clutch';

// Redis connection
const REDIS_URL = process.env.REDIS_URL || 'redis://redis-18769.c280.us-central1-2.gce.redns.redis-cloud.com:18769';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '1f1KghLl0pOXlh4JwNRwoGjaZbV6fHi6';

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

async function connectToRedis() {
  try {
    const redis = new Redis(REDIS_URL, {
      password: REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    await redis.ping();
    console.log('✅ Connected to Redis');
    return redis;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
}

// Format phone number
function formatPhoneNumber(phoneNumber) {
  let cleaned = phoneNumber.replace(/\D/g, '');
  if (!cleaned.startsWith('20')) {
    cleaned = '20' + cleaned;
  }
  return '+' + cleaned;
}

// Generate OTP
function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Test real SMS with Firebase Phone Auth
async function testRealSMSWithFirebase() {
  try {
    console.log('📱 Testing Real SMS with Firebase Phone Auth');
    console.log('============================================');
    console.log(`📱 Phone Number: ${TEST_CONFIG.phoneNumber}`);
    console.log(`🎯 Purpose: ${TEST_CONFIG.purpose}`);
    
    const formattedPhone = formatPhoneNumber(TEST_CONFIG.phoneNumber);
    const otp = generateOTP(6);
    
    console.log(`📱 Formatted Phone: ${formattedPhone}`);
    console.log(`🔢 Generated OTP: ${otp}`);
    
    // Connect to Redis
    const redis = await connectToRedis();
    
    // Store OTP in Redis
    const otpKey = `otp:${formattedPhone}:${TEST_CONFIG.purpose}`;
    const otpData = {
      otp,
      purpose: TEST_CONFIG.purpose,
      phoneNumber: formattedPhone,
      createdAt: new Date().toISOString(),
      attempts: 0
    };
    
    await redis.setex(otpKey, 600, JSON.stringify(otpData));
    console.log('✅ OTP stored in Redis');
    
    // Initialize Firebase Admin SDK
    const { initializeFirebaseAdmin, sendSMSOTP } = require('../shared-backend/config/firebase-admin');
    
    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    console.log('✅ Firebase Admin SDK initialized');
    
    // Send SMS via Firebase Phone Auth
    console.log('\n📤 Attempting to send real SMS...');
    const smsResult = await sendSMSOTP(formattedPhone, otp, TEST_CONFIG.purpose);
    
    if (smsResult.success) {
      console.log('\n🎉 SUCCESS! Real SMS sent via Firebase Phone Auth!');
      console.log('==================================================');
      console.log(`📱 Phone: ${smsResult.phoneNumber}`);
      console.log(`🔢 OTP: ${otp}`);
      console.log(`🔧 Provider: ${smsResult.provider}`);
      console.log(`⏰ Expires in: ${smsResult.expiresIn} seconds`);
      console.log(`💬 Message: ${smsResult.message}`);
      console.log(`📊 Status: ${smsResult.status}`);
      
      if (smsResult.sid) {
        console.log(`🆔 SMS SID: ${smsResult.sid}`);
      }
      
      console.log('\n📝 Next Steps:');
      console.log('1. Check your phone for the SMS message');
      console.log('2. The SMS should contain the OTP code');
      console.log('3. Use this OTP to verify in your app');
      console.log('4. The OTP is also stored in Redis for verification');
      
    } else {
      console.log('\n⚠️ Firebase SMS failed, but OTP is stored in Redis');
      console.log('==================================================');
      console.log(`📱 Phone: ${formattedPhone}`);
      console.log(`🔢 OTP: ${otp}`);
      console.log(`❌ Error: ${smsResult.error}`);
      console.log(`📊 Status: ${smsResult.status}`);
      
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check if Phone Authentication is enabled in Firebase Console');
      console.log('2. Verify SMS templates are configured');
      console.log('3. Check if the phone number is in the allowed list');
      console.log('4. Ensure Firebase project has SMS quota available');
      
      console.log('\n📝 For now:');
      console.log('1. The OTP is stored in Redis and ready for verification');
      console.log('2. You can use this OTP to test your verification system');
      console.log('3. Complete the Firebase Phone Auth setup to enable real SMS');
    }
    
    // Close Redis connection
    await redis.quit();
    
    return smsResult;
    
  } catch (error) {
    console.error('❌ Error testing real SMS with Firebase:', error.message);
    console.log('\n🔧 Error Details:');
    console.log('1. Check Firebase Admin SDK configuration');
    console.log('2. Verify all environment variables are set');
    console.log('3. Ensure Firebase project is properly configured');
    throw error;
  }
}

// Main function
async function testRealSMS() {
  try {
    // Connect to database
    const { client, db } = await connectToDatabase();
    
    // Test real SMS
    const result = await testRealSMSWithFirebase();
    
    // Close database connection
    await client.close();
    console.log('\n🔌 Database connection closed');
    
    return result;
    
  } catch (error) {
    console.error('❌ Error in real SMS test:', error.message);
  }
}

// Run the script
if (require.main === module) {
  testRealSMS().catch(console.error);
}

module.exports = { testRealSMS };
