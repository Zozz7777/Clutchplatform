#!/usr/bin/env node

/**
 * Direct OTP Sending Script
 * This script sends an OTP directly to Redis for testing purposes
 */

const { MongoClient } = require('mongodb');
const Redis = require('ioredis');
require('dotenv').config();

// Test phone number
const TEST_PHONE = '+201009561143';

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
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add country code if not present (Egypt: +20)
  if (!cleaned.startsWith('20')) {
    cleaned = '20' + cleaned;
  }
  
  // Add + prefix
  return '+' + cleaned;
}

// Generate OTP
function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP directly to Redis
async function sendOTPDirect(phoneNumber, purpose = 'verification') {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const otp = generateOTP(6);
    
    // Connect to Redis
    const redis = await connectToRedis();
    
    // Store OTP in Redis
    const otpKey = `otp:${formattedPhone}:${purpose}`;
    const otpData = {
      otp,
      purpose,
      phoneNumber: formattedPhone,
      createdAt: new Date().toISOString(),
      attempts: 0
    };
    
    await redis.setex(otpKey, 600, JSON.stringify(otpData));
    
    console.log(`✅ OTP stored in Redis for ${formattedPhone}`);
    console.log(`🔢 OTP Code: ${otp}`);
    
    // Close Redis connection
    await redis.quit();
    
    return {
      success: true,
      provider: 'redis',
      phoneNumber: formattedPhone,
      otp: otp, // For testing purposes only
      expiresIn: 600,
      message: 'OTP stored in Redis for verification'
    };
    
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    throw error;
  }
}

// Verify OTP
async function verifyOTPDirect(phoneNumber, otp, purpose = 'verification') {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Connect to Redis
    const redis = await connectToRedis();
    
    // Get OTP from Redis
    const otpKey = `otp:${formattedPhone}:${purpose}`;
    const storedOTPData = await redis.get(otpKey);
    
    if (!storedOTPData) {
      throw new Error('OTP expired or not found');
    }
    
    const storedOTP = JSON.parse(storedOTPData);
    
    if (storedOTP.attempts >= 3) {
      await redis.del(otpKey);
      throw new Error('Too many verification attempts');
    }
    
    // Increment attempts
    storedOTP.attempts++;
    await redis.setex(otpKey, 600, JSON.stringify(storedOTP));
    
    if (storedOTP.otp === otp) {
      // OTP verified successfully, remove from Redis
      await redis.del(otpKey);
      console.log(`✅ OTP verified successfully for ${formattedPhone}`);
      
      // Close Redis connection
      await redis.quit();
      
      return { success: true, verified: true };
    } else {
      throw new Error('Invalid OTP');
    }
    
  } catch (error) {
    console.error('❌ OTP verification failed:', error);
    throw error;
  }
}

// Main function
async function sendTestOTP() {
  console.log('📱 Sending Direct Test OTP');
  console.log('==========================');
  console.log(`📞 Phone Number: ${TEST_PHONE}`);
  
  try {
    // Connect to database
    const { client, db } = await connectToDatabase();
    
    // Send OTP
    console.log('\n📤 Sending OTP...');
    const result = await sendOTPDirect(TEST_PHONE, 'verification');
    
    if (result.success) {
      console.log('\n✅ OTP sent successfully!');
      console.log(`📱 Phone: ${result.phoneNumber}`);
      console.log(`🔢 OTP Code: ${result.otp}`);
      console.log(`⏰ Expires in: ${result.expiresIn} seconds`);
      console.log(`🔧 Provider: ${result.provider}`);
      console.log(`💬 Message: ${result.message}`);
      
      console.log('\n📝 Next Steps:');
      console.log('1. Use the OTP code above for testing');
      console.log('2. The OTP will expire in 10 minutes');
      console.log('3. You can verify the OTP using the verification script');
      
      // Test verification
      console.log('\n🔍 Testing OTP verification...');
      try {
        const verifyResult = await verifyOTPDirect(TEST_PHONE, result.otp, 'verification');
        if (verifyResult.success && verifyResult.verified) {
          console.log('✅ OTP verification test passed!');
        }
      } catch (verifyError) {
        console.log('⚠️ OTP verification test failed:', verifyError.message);
      }
      
    } else {
      console.log('❌ Failed to send OTP:', result.error);
    }
    
    // Close database connection
    await client.close();
    console.log('\n🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error in main function:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check MongoDB connection');
    console.log('2. Check Redis connection');
    console.log('3. Ensure all environment variables are set');
  }
}

// Run the script
if (require.main === module) {
  sendTestOTP().catch(console.error);
}

module.exports = { sendOTPDirect, verifyOTPDirect, sendTestOTP };
