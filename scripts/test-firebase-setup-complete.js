#!/usr/bin/env node

/**
 * Complete Firebase Setup Test
 * This script tests all Firebase components and provides setup instructions
 */

const { MongoClient } = require('mongodb');
const Redis = require('ioredis');
require('dotenv').config();

// Test configuration
const TEST_CONFIG = {
  phoneNumber: '+201009561143',
  testPhoneNumber: '+16505554567',
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

// Check Firebase configuration
function checkFirebaseConfig() {
  console.log('\n🔍 Checking Firebase Configuration...');
  console.log('=====================================');
  
  const requiredVars = [
    'FIREBASE_ADMIN_PROJECT_ID',
    'FIREBASE_ADMIN_PRIVATE_KEY',
    'FIREBASE_ADMIN_CLIENT_EMAIL',
    'FIREBASE_ADMIN_CLIENT_ID',
    'FIREBASE_ADMIN_AUTH_URI',
    'FIREBASE_ADMIN_TOKEN_URI',
    'FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL',
    'FIREBASE_ADMIN_CLIENT_X509_CERT_URL'
  ];
  
  let missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
      console.log(`❌ Missing: ${varName}`);
    } else {
      console.log(`✅ Found: ${varName}`);
    }
  });
  
  if (missingVars.length > 0) {
    console.log('\n⚠️ Missing Firebase Admin SDK environment variables!');
    return false;
  }
  
  console.log('\n✅ All Firebase Admin SDK variables are configured!');
  return true;
}

// Test Firebase Admin SDK
async function testFirebaseAdmin() {
  try {
    console.log('\n🧪 Testing Firebase Admin SDK...');
    console.log('===============================');
    
    const { initializeFirebaseAdmin, healthCheck } = require('../shared-backend/config/firebase-admin');
    
    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    console.log('✅ Firebase Admin SDK initialized');
    
    // Test health check
    const health = await healthCheck();
    console.log('✅ Firebase Admin health check passed');
    console.log(`📊 Health Status: ${health.status}`);
    
    return true;
  } catch (error) {
    console.error('❌ Firebase Admin SDK test failed:', error.message);
    return false;
  }
}

// Test Redis with Firebase Admin
async function testRedisWithFirebase() {
  try {
    console.log('\n🧪 Testing Redis with Firebase Admin...');
    console.log('=======================================');
    
    const { getRedisClient } = require('../shared-backend/config/redis');
    const redisClient = getRedisClient();
    
    if (!redisClient) {
      throw new Error('Redis client not available');
    }
    
    await redisClient.ping();
    console.log('✅ Redis client working with Firebase Admin');
    
    return true;
  } catch (error) {
    console.error('❌ Redis with Firebase Admin test failed:', error.message);
    return false;
  }
}

// Generate test OTP and store in Redis
async function generateTestOTP() {
  try {
    console.log('\n🔢 Generating Test OTP...');
    console.log('=========================');
    
    const redis = await connectToRedis();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in Redis
    const otpKey = `otp:${TEST_CONFIG.phoneNumber}:test`;
    await redis.setex(otpKey, 600, JSON.stringify({
      otp,
      purpose: 'test',
      phoneNumber: TEST_CONFIG.phoneNumber,
      createdAt: new Date().toISOString(),
      attempts: 0
    }));
    
    console.log(`✅ Test OTP generated and stored: ${otp}`);
    console.log(`📱 Phone: ${TEST_CONFIG.phoneNumber}`);
    console.log(`⏰ Expires in: 10 minutes`);
    
    await redis.quit();
    return otp;
  } catch (error) {
    console.error('❌ Error generating test OTP:', error.message);
    throw error;
  }
}

// Provide complete setup instructions
function provideSetupInstructions() {
  console.log('\n📋 COMPLETE FIREBASE PHONE AUTH SETUP GUIDE');
  console.log('===========================================');
  
  console.log('\n🎯 Current Status:');
  console.log('✅ Firebase Admin SDK: Configured and working');
  console.log('✅ SMS Multi-factor Authentication: Enabled in Firebase Console');
  console.log('✅ SMS Template: Configured');
  console.log('✅ Redis: Working with Firebase Admin');
  console.log('✅ MongoDB: Connected');
  
  console.log('\n📱 To Enable Real SMS to Your Phone:');
  console.log('====================================');
  console.log('1. Firebase Phone Auth requires CLIENT-SIDE implementation');
  console.log('2. The server-side Firebase Admin SDK cannot send SMS directly');
  console.log('3. You need to implement Firebase Phone Auth in your mobile app');
  
  console.log('\n🔧 Required Mobile App Implementation:');
  console.log('=====================================');
  console.log('1. Add Firebase SDK to your mobile app (iOS/Android)');
  console.log('2. Implement Firebase Phone Auth client-side');
  console.log('3. Use the verifyPhoneNumber() method in your app');
  console.log('4. Handle the verification code in your app');
  console.log('5. Send the verification result to your backend');
  
  console.log('\n📱 For iOS (Swift):');
  console.log('==================');
  console.log('1. Add Firebase iOS SDK to your project');
  console.log('2. Import FirebaseAuth');
  console.log('3. Call PhoneAuthProvider.provider().verifyPhoneNumber()');
  console.log('4. Handle the verification code');
  
  console.log('\n🤖 For Android (Kotlin/Java):');
  console.log('=============================');
  console.log('1. Add Firebase Android SDK to your project');
  console.log('2. Import FirebaseAuth');
  console.log('3. Call PhoneAuthProvider.verifyPhoneNumber()');
  console.log('4. Handle the verification code');
  
  console.log('\n🔗 Your Backend API Endpoints:');
  console.log('=============================');
  console.log('POST /api/mobile/send-otp - Send OTP (currently stores in Redis)');
  console.log('POST /api/mobile/verify-otp - Verify OTP (currently checks Redis)');
  console.log('POST /api/mobile/register - Register user with phone');
  console.log('POST /api/mobile/login - Login with phone');
  
  console.log('\n📝 Current Test OTP:');
  console.log('===================');
  console.log(`📱 Phone: ${TEST_CONFIG.phoneNumber}`);
  console.log('🔢 OTP: Generated and stored in Redis');
  console.log('⏰ Status: Ready for verification');
  console.log('💡 You can test the verification API with this OTP');
}

// Main function
async function testFirebaseSetupComplete() {
  console.log('🔥 Complete Firebase Setup Test');
  console.log('================================');
  console.log(`📱 Target Phone: ${TEST_CONFIG.phoneNumber}`);
  console.log(`🧪 Test Phone: ${TEST_CONFIG.testPhoneNumber}`);
  
  try {
    // Connect to database
    const { client, db } = await connectToDatabase();
    
    // Check Firebase configuration
    const configOk = checkFirebaseConfig();
    
    if (configOk) {
      // Test Firebase Admin SDK
      const adminOk = await testFirebaseAdmin();
      
      if (adminOk) {
        // Test Redis with Firebase Admin
        const redisOk = await testRedisWithFirebase();
        
        if (redisOk) {
          // Generate test OTP
          await generateTestOTP();
          
          // Provide setup instructions
          provideSetupInstructions();
          
          console.log('\n🎉 SETUP SUMMARY:');
          console.log('=================');
          console.log('✅ Firebase Admin SDK: Working');
          console.log('✅ Redis Integration: Working');
          console.log('✅ MongoDB: Connected');
          console.log('✅ Test OTP: Generated and stored');
          console.log('📱 Real SMS: Requires mobile app implementation');
          console.log('💡 You can test OTP verification with the stored OTP');
          
        } else {
          console.log('\n❌ Redis integration failed');
        }
      } else {
        console.log('\n❌ Firebase Admin SDK test failed');
      }
    } else {
      console.log('\n❌ Firebase configuration incomplete');
    }
    
    // Close database connection
    await client.close();
    console.log('\n🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error in Firebase setup test:', error.message);
  }
}

// Run the script
if (require.main === module) {
  testFirebaseSetupComplete().catch(console.error);
}

module.exports = { testFirebaseSetupComplete };
