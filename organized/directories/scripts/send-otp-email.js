#!/usr/bin/env node

/**
 * Send OTP via Email Script
 * This script sends an OTP via email to test Gmail configuration
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Test configuration
const TEST_EMAIL = 'YourClutchauto@gmail.com';

// Email Configuration
const EMAIL_CONFIG = {
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'YourClutchauto@gmail.com',
    pass: 'oQg5Aj"+78L"'
  },
  from: 'YourClutchauto@gmail.com',
  fromName: 'Clutch Automotive Services'
};

// Generate OTP
function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create email transporter
function createTransporter() {
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

// Send OTP email
async function sendOTPEmail() {
  console.log('📧 Sending OTP via Email');
  console.log('========================');
  console.log(`📧 Email: ${TEST_EMAIL}`);
  
  try {
    // Generate OTP
    const otp = generateOTP(6);
    console.log(`🔢 Generated OTP: ${otp}`);
    
    // Create transporter
    const transporter = createTransporter();
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
      to: TEST_EMAIL,
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
    console.log('\n📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('\n✅ OTP email sent successfully!');
    console.log(`📧 Email sent to: ${info.to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`🔢 OTP Code: ${otp}`);
    console.log(`⏰ Sent at: ${new Date().toISOString()}`);
    
    console.log('\n📝 Next Steps:');
    console.log('1. Check your Gmail inbox');
    console.log('2. Look for the email with subject "OTP Verification - Clutch Platform"');
    console.log('3. Use the OTP code for testing');
    
    return {
      success: true,
      messageId: info.messageId,
      otp: otp,
      to: info.to
    };
    
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Gmail Authentication Issue:');
      console.log('1. Make sure 2-factor authentication is enabled on your Gmail account');
      console.log('2. Generate an App Password for this application');
      console.log('3. Use the App Password instead of your regular password');
      console.log('4. Go to: https://myaccount.google.com/apppasswords');
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the script
if (require.main === module) {
  sendOTPEmail().catch(console.error);
}

module.exports = { sendOTPEmail };
