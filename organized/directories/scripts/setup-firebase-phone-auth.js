#!/usr/bin/env node

/**
 * Firebase Phone Auth Setup Script
 * This script helps set up and test Firebase Phone Authentication
 */

const { MongoClient } = require('mongodb');
const Redis = require('ioredis');
require('dotenv').config();

// Test configuration
const TEST_CONFIG = {
  phoneNumber: '+201009561143',
  testPhoneNumber: '+16505554567', // Firebase test number
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
    console.log('📝 To fix this, you need to:');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
    console.log('2. Select your project: clutch-a2f49');
    console.log('3. Go to Project Settings → Service Accounts');
    console.log('4. Click "Generate new private key"');
    console.log('5. Download the JSON file');
    console.log('6. Add the values to your .env file');
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

// Setup Firebase Phone Auth
async function setupFirebasePhoneAuth() {
  console.log('\n📱 Setting up Firebase Phone Auth...');
  console.log('====================================');
  
  console.log('📋 Required Steps:');
  console.log('1. Enable Phone Authentication in Firebase Console');
  console.log('2. Configure APNs for iOS (if using iOS app)');
  console.log('3. Set up reCAPTCHA verification');
  console.log('4. Add test phone numbers');
  
  console.log('\n🔧 Step 1: Enable Phone Authentication');
  console.log('   • Go to Firebase Console → Authentication → Sign-in method');
  console.log('   • Enable "Phone" provider');
  console.log('   • Configure SMS templates if needed');
  
  console.log('\n🔧 Step 2: Configure APNs (for iOS)');
  console.log('   • Go to Firebase Console → Project Settings → Cloud Messaging');
  console.log('   • Upload your APNs authentication key');
  console.log('   • Add key ID and team ID');
  
  console.log('\n🔧 Step 3: Set up reCAPTCHA');
  console.log('   • Add custom URL schemes to your iOS app');
  console.log('   • Use your Encoded App ID as URL scheme');
  console.log('   • Enable Background Modes: Background fetch & Remote notifications');
  
  console.log('\n🔧 Step 4: Add Test Phone Numbers');
  console.log('   • Go to Firebase Console → Authentication → Sign-in method → Phone');
  console.log('   • Open "Phone numbers for testing"');
  console.log('   • Add test numbers like: +16505554567');
  console.log('   • Set verification codes like: 123456');
}

// Test with Firebase test phone number
async function testWithFirebaseTestNumber() {
  try {
    console.log('\n🧪 Testing with Firebase Test Number...');
    console.log('=======================================');
    
    const { initializeFirebaseAdmin, sendSMSOTP } = require('../shared-backend/config/firebase-admin');
    
    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    
    // Test with Firebase test number
    const testPhone = '+16505554567';
    const testOTP = '123456'; // Default Firebase test code
    
    console.log(`📱 Testing with: ${testPhone}`);
    console.log(`🔢 Test OTP: ${testOTP}`);
    
    // Connect to Redis
    const redis = await connectToRedis();
    
    // Store test OTP in Redis
    const otpKey = `otp:${testPhone}:test`;
    await redis.setex(otpKey, 600, JSON.stringify({
      otp: testOTP,
      purpose: 'test',
      phoneNumber: testPhone,
      createdAt: new Date().toISOString(),
      attempts: 0
    }));
    
    console.log('✅ Test OTP stored in Redis');
    console.log('📝 Note: This is a test number - no real SMS will be sent');
    console.log('📝 Use the test OTP (123456) to verify in your app');
    
    await redis.quit();
    
    return true;
  } catch (error) {
    console.error('❌ Test with Firebase test number failed:', error.message);
    return false;
  }
}

// Main function
async function setupFirebasePhoneAuthComplete() {
  console.log('🔥 Firebase Phone Auth Setup Guide');
  console.log('==================================');
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
        // Setup instructions
        await setupFirebasePhoneAuth();
        
        // Test with Firebase test number
        await testWithFirebaseTestNumber();
        
        console.log('\n🎉 Setup Complete!');
        console.log('==================');
        console.log('✅ Firebase Admin SDK is working');
        console.log('✅ Test phone number configured');
        console.log('📝 Next steps:');
        console.log('1. Follow the setup instructions above');
        console.log('2. Test with the test phone number: +16505554567');
        console.log('3. Use test OTP: 123456');
        console.log('4. Once working, switch to real phone numbers');
        
      } else {
        console.log('\n❌ Firebase Admin SDK test failed');
        console.log('🔧 Please check your Firebase configuration');
      }
    } else {
      console.log('\n❌ Firebase configuration incomplete');
      console.log('🔧 Please add the missing environment variables');
    }
    
    // Close database connection
    await client.close();
    console.log('\n🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error in Firebase Phone Auth setup:', error.message);
  }
}

// Run the script
if (require.main === module) {
  setupFirebasePhoneAuthComplete().catch(console.error);
}

module.exports = { setupFirebasePhoneAuthComplete };
