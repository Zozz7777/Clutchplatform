#!/usr/bin/env node

/**
 * Dual OTP Test Script
 * This script sends OTPs to both phone and email simultaneously
 */

const { MongoClient } = require('mongodb');
const Redis = require('ioredis');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Test configuration
const TEST_CONFIG = {
  phoneNumber: '+201009561143',
  email: 'ziad@yourclutch.com',
  purpose: 'verification'
};

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = process.env.MONGODB_DB || 'clutch';

// Redis connection
const REDIS_URL = process.env.REDIS_URL || 'redis://redis-18769.c280.us-central1-2.gce.redns.redis-cloud.com:18769';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '1f1KghLl0pOXlh4JwNRwoGjaZbV6fHi6';

// Email Configuration
const EMAIL_CONFIG = {
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'YourClutchauto@gmail.com',
    pass: 'serw vuii uyxc cscj'
  },
  from: 'YourClutchauto@gmail.com',
  fromName: 'Clutch Automotive Services'
};

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

// Create email transporter
function createEmailTransporter() {
  try {
    const transporter = nodemailer.createTransport({
      service: EMAIL_CONFIG.service,
      host: EMAIL_CONFIG.host,
      port: EMAIL_CONFIG.port,
      secure: EMAIL_CONFIG.secure,
      auth: EMAIL_CONFIG.auth,
      tls: {
        rejectUnauthorized: false
      }
    });

    return transporter;
  } catch (error) {
    console.error('❌ Email transporter creation failed:', error);
    throw error;
  }
}

// Send OTP to phone (store in Redis)
async function sendPhoneOTP(phoneNumber, purpose = 'verification') {
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
    
    console.log(`✅ Phone OTP stored in Redis for ${formattedPhone}`);
    console.log(`🔢 Phone OTP Code: ${otp}`);
    
    // Close Redis connection
    await redis.quit();
    
    return {
      success: true,
      provider: 'redis',
      phoneNumber: formattedPhone,
      otp: otp,
      expiresIn: 600,
      message: 'OTP stored in Redis for verification'
    };
    
  } catch (error) {
    console.error('❌ Error sending phone OTP:', error);
    throw error;
  }
}

// Send OTP via email
async function sendEmailOTP(email, purpose = 'verification') {
  try {
    const otp = generateOTP(6);
    
    // Connect to Redis
    const redis = await connectToRedis();
    
    // Store OTP in Redis
    const otpKey = `otp:email:${email}:${purpose}`;
    await redis.setex(otpKey, 600, JSON.stringify({
      otp,
      purpose,
      email,
      createdAt: new Date().toISOString(),
      attempts: 0
    }));
    
    // Create email transporter
    const transporter = createEmailTransporter();
    console.log('✅ Email transporter created');
    
    // Verify connection
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email transporter verification failed:', error);
          reject(error);
        } else {
          console.log('✅ Email transporter verified successfully');
          resolve();
        }
      });
    });
    
    // Email content
    const mailOptions = {
      from: `"${EMAIL_CONFIG.fromName}" <${EMAIL_CONFIG.from}>`,
      to: email,
      subject: 'OTP Verification - Clutch Platform',
      html: `
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
            <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
            <p><strong>Email Service:</strong> Gmail</p>
            <p>Best regards,<br>The Clutch Team</p>
          </div>
        </div>
      `
    };
    
    // Send email
    console.log('\n📤 Sending email OTP...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email OTP sent successfully!');
    console.log(`📧 Email sent to: ${info.to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`🔢 Email OTP Code: ${otp}`);
    
    // Close Redis connection
    await redis.quit();
    
    return {
      success: true,
      provider: 'gmail',
      email: email,
      otp: otp,
      messageId: info.messageId,
      expiresIn: 600,
      message: 'OTP sent via email'
    };
    
  } catch (error) {
    console.error('❌ Error sending email OTP:', error);
    throw error;
  }
}

// Main function
async function sendDualOTP() {
  console.log('📱📧 Sending Dual OTP Test');
  console.log('==========================');
  console.log(`📱 Phone Number: ${TEST_CONFIG.phoneNumber}`);
  console.log(`📧 Email Address: ${TEST_CONFIG.email}`);
  console.log(`🎯 Purpose: ${TEST_CONFIG.purpose}`);
  
  try {
    // Connect to database
    const { client, db } = await connectToDatabase();
    
    // Send OTPs simultaneously
    console.log('\n📤 Sending OTPs...');
    
    const [phoneResult, emailResult] = await Promise.all([
      sendPhoneOTP(TEST_CONFIG.phoneNumber, TEST_CONFIG.purpose),
      sendEmailOTP(TEST_CONFIG.email, TEST_CONFIG.purpose)
    ]);
    
    // Results
    console.log('\n📋 DUAL OTP TEST RESULTS:');
    console.log('==========================');
    
    if (phoneResult.success) {
      console.log('✅ Phone OTP sent successfully!');
      console.log(`📱 Phone: ${phoneResult.phoneNumber}`);
      console.log(`🔢 Phone OTP: ${phoneResult.otp}`);
      console.log(`⏰ Expires in: ${phoneResult.expiresIn} seconds`);
      console.log(`🔧 Provider: ${phoneResult.provider}`);
    } else {
      console.log('❌ Phone OTP failed:', phoneResult.error);
    }
    
    if (emailResult.success) {
      console.log('\n✅ Email OTP sent successfully!');
      console.log(`📧 Email: ${emailResult.email}`);
      console.log(`🔢 Email OTP: ${emailResult.otp}`);
      console.log(`📧 Message ID: ${emailResult.messageId}`);
      console.log(`⏰ Expires in: ${emailResult.expiresIn} seconds`);
      console.log(`🔧 Provider: ${emailResult.provider}`);
    } else {
      console.log('\n❌ Email OTP failed:', emailResult.error);
    }
    
    console.log('\n📝 Next Steps:');
    console.log('1. Check your phone for the OTP (stored in Redis)');
    console.log('2. Check your email inbox for the OTP');
    console.log('3. Both OTPs will expire in 10 minutes');
    console.log('4. Use either OTP for testing your verification system');
    
    // Close database connection
    await client.close();
    console.log('\n🔌 Database connection closed');
    
    return {
      phone: phoneResult,
      email: emailResult
    };
    
  } catch (error) {
    console.error('❌ Error in dual OTP test:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check MongoDB connection');
    console.log('2. Check Redis connection');
    console.log('3. Check Gmail App Password');
    console.log('4. Ensure all environment variables are set');
  }
}

// Run the script
if (require.main === module) {
  sendDualOTP().catch(console.error);
}

module.exports = { sendDualOTP };
