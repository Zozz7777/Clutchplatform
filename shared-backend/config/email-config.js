const nodemailer = require('nodemailer');
const { logger } = require('./logger');

// Email Service Configuration
const EMAIL_CONFIG = {
  // SMTP Configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  
  // Default sender information
  sender: {
    name: 'Clutch Automotive',
    email: process.env.SENDER_EMAIL || 'YourClutchauto@gmail.com'
  },
  
  // Email templates and branding
  branding: {
    name: 'Clutch',
    logo: 'https://drive.google.com/uc?export=view&id=1UyOznOrD4lNpeS93t3TBWBhfNMdbykVQ',
    primaryColor: '#ED1B24',
    secondaryColor: '#191919',
    accentColor: '#227AFF',
    textColor: '#333333',
    lightGray: '#F1F1F1',
    white: '#FFFFFF'
  },
  
  // Campaign settings
  campaign: {
    maxEmailsPerHour: 100,
    maxEmailsPerDay: 1000,
    retryAttempts: 3,
    retryDelay: 5000, // 5 seconds
    bounceThreshold: 5, // percentage
    spamThreshold: 2, // percentage
  },
  
  // Automation settings
  automation: {
    maxWorkflows: 50,
    maxTriggersPerWorkflow: 10,
    executionDelay: 1000, // 1 second between executions
    maxConcurrentExecutions: 5
  },
  
  // Customer engagement settings
  engagement: {
    scoringEnabled: true,
    maxScore: 100,
    decayRate: 0.1, // 10% decay per month
    segmentUpdateInterval: 3600000, // 1 hour
  },
  
  // Email templates
  templates: {
    welcome: {
      subject: 'Welcome to Clutch - Your Automotive Service Companion',
      category: 'onboarding'
    },
    passwordReset: {
      subject: 'Password Reset Request - Clutch',
      category: 'security'
    },
    passwordChanged: {
      subject: 'Password Changed Successfully - Clutch',
      category: 'security'
    },
    accountCreated: {
      subject: 'Account Created Successfully - Clutch',
      category: 'onboarding'
    },
    emailVerification: {
      subject: 'Verify Your Email - Clutch',
      category: 'onboarding'
    },
    trialEnded: {
      subject: 'Your Free Trial Has Ended - Clutch',
      category: 'billing'
    },
    userInvitation: {
      subject: 'You\'ve Been Invited to Join Clutch',
      category: 'referral'
    },
    orderConfirmation: {
      subject: 'Order Confirmation - Clutch',
      category: 'ecommerce'
    },
    maintenanceReminder: {
      subject: 'Vehicle Maintenance Reminder - Clutch',
      category: 'service'
    },
    serviceCompleted: {
      subject: 'Service Completed - Clutch',
      category: 'service'
    },
    paymentReceived: {
      subject: 'Payment Received - Clutch',
      category: 'billing'
    },
    appointmentReminder: {
      subject: 'Appointment Reminder - Clutch',
      category: 'service'
    },
    newsletter: {
      subject: 'Clutch Newsletter - Latest Updates',
      category: 'marketing'
    },
    promotional: {
      subject: 'Special Offer - Clutch',
      category: 'marketing'
    },
    abandonedCart: {
      subject: 'Complete Your Purchase - Clutch',
      category: 'ecommerce'
    },
    reEngagement: {
      subject: 'We Miss You - Clutch',
      category: 'marketing'
    },
    birthday: {
      subject: 'Happy Birthday from Clutch!',
      category: 'marketing'
    },
    anniversary: {
      subject: 'Happy Anniversary with Clutch!',
      category: 'marketing'
    },
    seasonal: {
      subject: 'Seasonal Service Reminder - Clutch',
      category: 'service'
    }
  }
};

// Initialize email transporter
let transporter = null;

const initializeTransporter = async () => {
  try {
    transporter = nodemailer.createTransport(EMAIL_CONFIG.smtp);
    
    // Verify connection
    await transporter.verify();
    logger.info('✅ Email transporter initialized successfully');
    
    return transporter;
  } catch (error) {
    logger.error('❌ Failed to initialize email transporter:', error);
    throw error;
  }
};

// Get transporter instance
const getTransporter = () => {
  if (!transporter) {
    throw new Error('Email transporter not initialized. Call initializeTransporter() first.');
  }
  return transporter;
};

// Send test email
const sendTestEmail = async (to) => {
  try {
    const testTransporter = getTransporter();
    
    const mailOptions = {
      from: `"${EMAIL_CONFIG.sender.name}" <${EMAIL_CONFIG.sender.email}>`,
      to: to,
      subject: 'Clutch Email Service Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${EMAIL_CONFIG.branding.primaryColor};">Email Service Test</h2>
          <p>This is a test email from your Clutch email marketing service.</p>
          <p>If you received this email, your email service is working correctly!</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `
    };
    
    const result = await testTransporter.sendMail(mailOptions);
    logger.info('✅ Test email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    logger.error('❌ Failed to send test email:', error);
    throw error;
  }
};

module.exports = {
  EMAIL_CONFIG,
  initializeTransporter,
  getTransporter,
  sendTestEmail
};
