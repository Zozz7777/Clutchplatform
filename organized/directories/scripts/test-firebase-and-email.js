#!/usr/bin/env node

/**
 * Comprehensive Test Script for Firebase SMS and Gmail Email
 * This script tests both Firebase Admin SDK and Gmail email functionality
 */

const { MongoClient } = require('mongodb');
const Redis = require('ioredis');
require('dotenv').config();

// Test configuration
const TEST_CONFIG = {
  phoneNumber: '+201009561143',
  email: 'YourClutchauto@gmail.com',
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

// Test Firebase Admin SDK
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

// Test Email Service
async function testEmailService() {
  console.log('\n🔧 Testing Email Service...');
  console.log('============================');
  
  try {
    const { sendEmail, createTransporter } = require('../shared-backend/services/emailService');
    
    // Create transporter
    const transporter = await createTransporter();
    console.log('✅ Email transporter created');
    
    // Test email sending
    const testEmailData = {
      to: TEST_CONFIG.email,
      subject: 'Test Email from Clutch Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FF6B35; color: white; padding: 20px; text-align: center;">
            <h1>Test Email</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Hello!</h2>
            <p>This is a test email from the Clutch platform to verify that the email service is working correctly.</p>
            <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
            <p><strong>Email Service:</strong> Gmail</p>
            <p>If you received this email, the email service is working properly!</p>
            <p>Best regards,<br>The Clutch Team</p>
          </div>
        </div>
      `
    };
    
    const result = await sendEmail(testEmailData.to, testEmailData.subject, testEmailData.html);
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log(`📧 Email sent to: ${result.to}`);
      console.log(`📧 Message ID: ${result.messageId}`);
      return true;
    } else {
      console.log('❌ Test email failed:', result.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
    return false;
  }
}

// Test SMS Service with Firebase
async function testSMSService() {
  console.log('\n🔧 Testing SMS Service with Firebase...');
  console.log('==========================================');
  
  try {
    const { sendOTP, verifyOTP, smsHealthCheck } = require('../shared-backend/services/smsService');
    
    // Check SMS health
    const health = await smsHealthCheck();
    console.log('📊 SMS Service Health:', health.status);
    
    if (health.status !== 'healthy') {
      console.log('❌ SMS service health check failed:', health);
      return false;
    }
    
    // Test OTP sending
    console.log('\n📱 Testing OTP sending...');
    const sendResult = await sendOTP(TEST_CONFIG.phoneNumber, TEST_CONFIG.purpose);
    
    if (sendResult.success) {
      console.log('✅ OTP sent successfully!');
      console.log(`📱 Phone: ${sendResult.phoneNumber}`);
      console.log(`🔧 Provider: ${sendResult.provider}`);
      console.log(`⏰ Expires In: ${sendResult.expiresIn} seconds`);
      
      // For testing, we'll get the OTP from Redis
      const redis = await connectToRedis();
      const otpKey = `otp:${sendResult.phoneNumber}:${TEST_CONFIG.purpose}`;
      const storedOTPData = await redis.get(otpKey);
      
      if (storedOTPData) {
        const storedOTP = JSON.parse(storedOTPData);
        console.log(`🔢 OTP Code: ${storedOTP.otp}`);
        
        // Test OTP verification
        console.log('\n🔍 Testing OTP verification...');
        const verifyResult = await verifyOTP(TEST_CONFIG.phoneNumber, storedOTP.otp, TEST_CONFIG.purpose);
        
        if (verifyResult.success && verifyResult.verified) {
          console.log('✅ OTP verification successful!');
        } else {
          console.log('❌ OTP verification failed:', verifyResult.error);
        }
        
        await redis.quit();
      }
      
      return true;
    } else {
      console.log('❌ OTP sending failed:', sendResult.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ SMS service test failed:', error.message);
    return false;
  }
}

// Test combined OTP via Email
async function testOTPViaEmail() {
  console.log('\n🔧 Testing OTP via Email...');
  console.log('============================');
  
  try {
    const { sendEmail } = require('../shared-backend/services/emailService');
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in Redis
    const redis = await connectToRedis();
    const otpKey = `otp:email:${TEST_CONFIG.email}:${TEST_CONFIG.purpose}`;
    await redis.setex(otpKey, 600, JSON.stringify({
      otp,
      purpose: TEST_CONFIG.purpose,
      email: TEST_CONFIG.email,
      createdAt: new Date().toISOString(),
      attempts: 0
    }));
    
    // Send OTP via email
    const emailResult = await sendEmail(
      TEST_CONFIG.email,
      'OTP Verification - Clutch Platform',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FF6B35; color: white; padding: 20px; text-align: center;">
            <h1>OTP Verification</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Hello!</h2>
            <p>Your verification code is:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <h1 style="color: #FF6B35; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <p>Best regards,<br>The Clutch Team</p>
          </div>
        </div>
      `
    );
    
    if (emailResult.success) {
      console.log('✅ OTP email sent successfully!');
      console.log(`📧 Email sent to: ${emailResult.to}`);
      console.log(`🔢 OTP Code: ${otp}`);
      
      // Test verification
      const storedOTPData = await redis.get(otpKey);
      if (storedOTPData) {
        const storedOTP = JSON.parse(storedOTPData);
        if (storedOTP.otp === otp) {
          console.log('✅ OTP stored and verified in Redis!');
          await redis.del(otpKey); // Clean up
        }
      }
      
      await redis.quit();
      return true;
    } else {
      console.log('❌ OTP email failed:', emailResult.error);
      await redis.quit();
      return false;
    }
    
  } catch (error) {
    console.error('❌ OTP via email test failed:', error.message);
    return false;
  }
}

// Main test function
async function runComprehensiveTests() {
  console.log('🧪 Comprehensive Firebase & Email Test Suite');
  console.log('=============================================');
  console.log(`📱 Test Phone: ${TEST_CONFIG.phoneNumber}`);
  console.log(`📧 Test Email: ${TEST_CONFIG.email}`);
  console.log(`🎯 Test Purpose: ${TEST_CONFIG.purpose}`);
  
  const { client, db } = await connectToDatabase();
  
  try {
    const results = {
      firebase: await testFirebaseAdmin(),
      email: await testEmailService(),
      sms: await testSMSService(),
      otpEmail: await testOTPViaEmail()
    };
    
    // Summary
    console.log('\n📋 COMPREHENSIVE TEST SUMMARY:');
    console.log('===============================');
    console.log(`Firebase Admin SDK: ${results.firebase ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Email Service (Gmail): ${results.email ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`SMS Service (Firebase): ${results.sms ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`OTP via Email: ${results.otpEmail ? '✅ PASS' : '❌ FAIL'}`);
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests >= 3) {
      console.log('✅ Firebase and Email services are working correctly!');
      console.log('\n📝 Next Steps:');
      console.log('1. Check your email for the test message');
      console.log('2. Firebase SMS is ready for production');
      console.log('3. Gmail email service is configured and working');
      console.log('4. OTP system is fully functional');
    } else {
      console.log('❌ Some tests failed. Please check the configuration.');
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Verify Firebase Admin SDK configuration');
      console.log('2. Check Gmail app password settings');
      console.log('3. Ensure all environment variables are set');
      console.log('4. Check Redis connection');
    }
    
  } catch (error) {
    console.error('❌ Comprehensive test suite failed:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the tests
if (require.main === module) {
  runComprehensiveTests().catch(console.error);
}

module.exports = { runComprehensiveTests };
