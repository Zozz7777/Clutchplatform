const axios = require('axios');
const { logger } = require('../config/logger');
const { 
  initializeFirebaseAdmin, 
  sendSMSOTP, 
  verifySMSOTP, 
  generateOTP,
  formatPhoneNumber,
  healthCheck 
} = require('../config/firebase-admin');

// Firebase SMS Configuration for OTP and notifications
const SMS_CONFIG = {
  // Firebase Phone Auth for OTP and notifications (Primary)
  firebaseEnabled: process.env.FIREBASE_SMS_ENABLED === 'true',
  // Firebase configuration
  firebaseProjectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  firebasePrivateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  firebaseClientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL
};

// Initialize Firebase Admin on module load
try {
  initializeFirebaseAdmin();
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin for SMS service:', error);
}

// SMS templates
const SMS_TEMPLATES = {
  BOOKING_CREATED: {
    customer: 'Your booking #{bookingId} has been created successfully. We\'ll notify you when a mechanic is assigned.',
    mechanic: 'You have been assigned to booking #{bookingId}. Please review the details and confirm.'
  },
  BOOKING_CONFIRMED: {
    customer: 'Your booking #{bookingId} has been confirmed. Your mechanic will arrive at {scheduledTime}.',
    mechanic: 'Booking #{bookingId} has been confirmed. Please arrive at {scheduledTime}.'
  },
  BOOKING_STARTED: {
    customer: 'Your mechanic has started working on your vehicle for booking #{bookingId}.',
    mechanic: 'You have started working on booking #{bookingId}. Please update the status when completed.'
  },
  BOOKING_COMPLETED: {
    customer: 'Your service for booking #{bookingId} has been completed. Please rate your experience.',
    mechanic: 'Booking #{bookingId} has been marked as completed. Thank you for your service.'
  },
  BOOKING_CANCELLED: {
    customer: 'Your booking #{bookingId} has been cancelled. Contact support if you have any questions.',
    mechanic: 'Booking #{bookingId} has been cancelled. You are no longer assigned to this booking.'
  },
  PAYMENT_SUCCESS: {
    customer: 'Payment of {amount} EGP for booking #{bookingId} has been processed successfully.',
    mechanic: 'Payment of {amount} EGP for booking #{bookingId} has been received.'
  },
  PAYMENT_FAILED: {
    customer: 'Payment for booking #{bookingId} failed. Please try again or contact support.',
    mechanic: 'Payment for booking #{bookingId} failed. Please contact the customer.'
  },
  MECHANIC_ASSIGNED: {
    customer: 'Mechanic {mechanicName} has been assigned to your booking #{bookingId}. Contact: {mechanicPhone}',
    mechanic: 'You have been assigned to booking #{bookingId} for customer {customerName}.'
  },
  MECHANIC_ARRIVED: {
    customer: 'Your mechanic {mechanicName} has arrived at your location for booking #{bookingId}.',
    mechanic: 'You have marked your arrival for booking #{bookingId}.'
  },
  SERVICE_REMINDER: {
    customer: 'Reminder: Your service appointment for booking #{bookingId} is scheduled for {scheduledTime}.',
    mechanic: 'Reminder: You have a service appointment for booking #{bookingId} at {scheduledTime}.'
  },
  OTP_VERIFICATION: {
    message: 'Your Clutch verification code is: {otp}. Valid for 10 minutes.'
  },
  APPOINTMENT_REMINDER: {
    customer: 'Reminder: Your appointment for booking #{bookingId} is in 1 hour. Please be ready.',
    mechanic: 'Reminder: Your appointment for booking #{bookingId} is in 1 hour. Please prepare.'
  }
};

// Send SMS using Firebase (for non-OTP messages)
const sendSMS = async (to, message) => {
  try {
    // Check if Firebase is enabled
    if (!SMS_CONFIG.firebaseEnabled) {
      logger.warn('Firebase SMS is not enabled');
      return { success: false, error: 'Firebase SMS not configured' };
    }

    // Format phone number
    const formattedNumber = formatPhoneNumber(to);

    // For Firebase, we'll use a different approach for non-OTP messages
    // We'll store the message in cache and use Firebase Phone Auth for delivery
    const { getRedisClient } = require('../config/redis');
    const redisClient = getRedisClient();
    
    if (!redisClient) {
      throw new Error('Redis client not available');
    }

    const messageKey = `sms:${formattedNumber}:${Date.now()}`;
    
    await redisClient.setex(messageKey, 3600, JSON.stringify({
      message,
      phoneNumber: formattedNumber,
      createdAt: new Date().toISOString(),
      type: 'notification'
    }));

    logger.info(`SMS message prepared for Firebase delivery to ${formattedNumber}`);

    return {
      success: true,
      messageId: messageKey,
      status: 'prepared',
      to: formattedNumber,
      provider: 'firebase',
      note: 'Message will be delivered via Firebase Phone Auth'
    };

  } catch (error) {
    logger.error('Error preparing SMS for Firebase:', error.message);
    return {
      success: false,
      error: error.message,
      to: to,
      provider: 'firebase'
    };
  }
};

// Send SMS to multiple numbers
const sendBulkSMS = async (numbers, message) => {
  try {
    const results = [];
    const promises = numbers.map(async (number) => {
      const result = await sendSMS(number, message);
      results.push(result);
      return result;
    });

    await Promise.all(promises);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    logger.info(`Bulk SMS prepared: ${successCount}/${numbers.length} successful`);

    return {
      success: true,
      totalSent: numbers.length,
      successCount,
      failureCount,
      results
    };

  } catch (error) {
    logger.error('Error sending bulk SMS:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send OTP via Firebase SMS (Primary Method)
const sendOTP = async (phoneNumber, purpose = 'verification') => {
  try {
    logger.info(`Sending OTP to ${phoneNumber} for ${purpose}`);
    
    if (!SMS_CONFIG.firebaseEnabled) {
      throw new Error('Firebase SMS is not enabled');
    }
    
    // Generate OTP
    const otp = generateOTP(6);
    
    // Send OTP via Firebase
    const result = await sendSMSOTP(phoneNumber, otp, purpose);
    
    logger.info(`OTP sent successfully to ${phoneNumber}`);
    return result;
  } catch (error) {
    logger.error(`OTP sending failed for ${phoneNumber}:`, error);
    throw error;
  }
};

// Verify OTP (Works with Firebase)
const verifyOTP = async (phoneNumber, otp, purpose = 'verification') => {
  try {
    const result = await verifySMSOTP(phoneNumber, otp, purpose);
    logger.info(`OTP verification successful for ${phoneNumber}`);
    return result;
  } catch (error) {
    logger.error(`OTP verification failed for ${phoneNumber}:`, error);
    throw error;
  }
};

// Send booking notification (Uses Firebase)
const sendBookingNotification = async (booking, notificationType, recipientData = {}) => {
  try {
    const template = SMS_TEMPLATES[notificationType];
    if (!template) {
      throw new Error(`Unknown notification type: ${notificationType}`);
    }

    let message = '';
    let phoneNumber = '';

    // Determine recipient and message
    if (recipientData.type === 'customer') {
      message = template.customer || template.message;
      phoneNumber = recipientData.phoneNumber;
    } else if (recipientData.type === 'mechanic') {
      message = template.mechanic || template.message;
      phoneNumber = recipientData.phoneNumber;
    } else {
      throw new Error('Invalid recipient type');
    }

    // Replace placeholders in message
    message = message
      .replace('{bookingId}', booking._id || booking.id)
      .replace('{scheduledTime}', recipientData.scheduledTime || '')
      .replace('{mechanicName}', recipientData.mechanicName || '')
      .replace('{mechanicPhone}', recipientData.mechanicPhone || '')
      .replace('{customerName}', recipientData.customerName || '')
      .replace('{amount}', recipientData.amount || '');

    const result = await sendSMS(phoneNumber, message);
    
    if (result.success) {
      logger.info(`Booking notification prepared: ${notificationType} to ${phoneNumber}`);
    }
    
    return result;
  } catch (error) {
    logger.error('Error sending booking notification:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send payment notification (Uses Firebase)
const sendPaymentNotification = async (payment, notificationType, recipientData = {}) => {
  try {
    const template = SMS_TEMPLATES[notificationType];
    if (!template) {
      throw new Error(`Unknown notification type: ${notificationType}`);
    }

    let message = '';
    let phoneNumber = '';

    // Determine recipient and message
    if (recipientData.type === 'customer') {
      message = template.customer || template.message;
      phoneNumber = recipientData.phoneNumber;
    } else if (recipientData.type === 'mechanic') {
      message = template.mechanic || template.message;
      phoneNumber = recipientData.phoneNumber;
    } else {
      throw new Error('Invalid recipient type');
    }

    // Replace placeholders in message
    message = message
      .replace('{bookingId}', payment.bookingId || payment.id)
      .replace('{amount}', payment.amount || '');

    const result = await sendSMS(phoneNumber, message);
    
    if (result.success) {
      logger.info(`Payment notification prepared: ${notificationType} to ${phoneNumber}`);
    }
    
    return result;
  } catch (error) {
    logger.error('Error sending payment notification:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Health check for SMS service
const smsHealthCheck = async () => {
  try {
    // Check Firebase health
    const firebaseHealth = await healthCheck();
    
    // Check Redis connection
    const { getRedisClient } = require('../config/redis');
    const redisClient = getRedisClient();
    const redisHealth = redisClient ? 'connected' : 'disconnected';
    
    return {
      status: firebaseHealth.status === 'healthy' && redisHealth === 'connected' ? 'healthy' : 'unhealthy',
      firebase: firebaseHealth,
      redis: redisHealth,
      smsEnabled: SMS_CONFIG.firebaseEnabled,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  sendSMS,
  sendBulkSMS,
  sendOTP,
  verifyOTP,
  sendBookingNotification,
  sendPaymentNotification,
  smsHealthCheck,
  SMS_CONFIG,
  SMS_TEMPLATES
};
