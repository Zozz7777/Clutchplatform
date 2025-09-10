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
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjcxIiBoZWlnaHQ9IjI3MSIgdmlld0JveD0iMCAwIDI3MSAyNzEiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMjcuMzc4IDI3MC42ODFDMTIzLjQ4MSAyNzAuNDU1IDExNy40OTQgMjY5LjgzNSAxMTMuOTkzIDI2OS4yN0wxMDcuNjY3IDI2OC4zMTFMMTIzLjI1NSA0NDkuOTU4TDEzOC44NDQgMjIxLjY2TDE0Mi4wMDcgMjIxLjMyMkMxNTEuNDM5IDIyMC4zNjMgMTYxLjk0NCAyMTcuNzY4IDE2OS4zNDMgMjE0LjYwOUwxNzEuNDg5IDIxMy42NUwxNzEuMjA3IDIxNS41MTJDMzE3MS4wMzcgMjE2LjUyNyAxNzAuMjQ3IDIyOC40ODYgMTY5LjM5OSAyNDIuMDgxTDE2Ny44MTggMjY2LjczMkwxNjUuNTU5IDI2Ny4zNTJDMTYxLjA0IDI2OC41OTMgMTUxLjA0MyAyNzAuMTE3IDE0NS41NjUgMjcwLjM5OUMxNDIuNTcxIDI3MC41NjggMTM4Ljg0NCAyNzAuNzkzIDEzNy4yNjIgMjcwLjkwNkMxMzUuNzM3IDI3MC45NjMgMTMxLjI3NSAyNzAuOTA2IDEyNy4zNzggMjcwLjY4MVoiIGZpbGw9IiNFRDFCMjQiLz4KPHBhdGggZD0iTTkwLjE1ODMgMjYzLjA2NUM3Ni42NTk2IDI1OC4zMjcgNjIuMjU3MiAyNTAuMjYgNTAuNjc4OCAyNDAuOTUzTDQ1LjM2OTYgMjM2LjcyMkw3MC4zMzM4IDIyNC4zNjhDODQuMTE1IDIxNy41OTkgOTUuNTgwNCAyMTIuMDE0IDk1Ljg2MjggMjEyLjAxNEM5Ni4xNDUyIDIxMi4wMTQgOTcuNzgzMiAyMTIuNzQ4IDk5LjU5MDUgMjEzLjY1QzEwNC4yNzggMjE2LjAxOSAxMTQuNjcxIDIxOS4xNzggMTIxLjQ0OCAyMjAuMjVMMTI3LjM3OSAyMjEuMjA5TDEyNi40MTkgMjIyLjY3NkMxMTguOTYzIDIzNC4xODMgOTcuNzI2NyAyNjUuNjA0IDk3LjUwMDggMjY1LjU0N0M5Ny4zMzEzIDI2NS41NDcgOTMuOTk5IDI2NC40MTkgOTAuMTU4MyAyNjMuMDY1WiIgZmlsbD0iI0VEMUIyNCIvPgo8cGF0aCBkPSJNMTc3LjgxNSAyNjEuNTk5QzE3Ny45ODUgMjYwLjI0NSAxNzguODMyIDI0Ny43MjIgMTc5LjczNiAyMzMuNzg4TDE4MS4zMTcgMjA4LjQwNEwxODMuODAyIDIwNi43MTJDMjE5MC45NzUgMjAxLjc0OCAxOTguODgyIDE5NC4yNDUgMjAzLjg1MyAxODcuNjQ1TDIwNS4zNzggMTg1LjU1OEwyMTcuMjk1IDIwOS4zNjNMMjI5LjE1NiAyMzMuMTY4TDIyNi4xMDYgMjM1Ljg3NkMyMTQuNDcxIDI0Ni4zMTEgMTk5LjMzNCAyNTUuNzMyIDE4NS4yNzEgMjYxLjI2QzE3Ny4wMjUgMjY0LjQ3NSAxNzcuNDIgMjY0LjQ3NSAxNzcuODE1IDI2MS41OTlaIiBmaWxsPSIjRUQxQjI0Ii8+CjxwYXRoIGQ9Ik0zNC41MjU1IDIyNS44MzVDMjUuODg0MSAyMTYuMDc2IDE4LjgyNCAyMDUuMzU4IDEzLjI4OSAxOTMuNzk0QzEwLjIzOTEgMTg3LjQxOSA2Ljg1MDI3IDE3OC43ODkgNy4xODkxNSAxNzguMzk0QzcuMzAyMTEgMTc4LjMzNyAxOS43ODQyIDE3OS4wNzEgMzQuOTc3MyAxODAuMDNMNjIuNTk2MSAxODEuODM1TDY2LjU0OTcgMTg3LjE5NEM3MC44OTg3IDE5My4wMDQgNzcuNTA2OCAxOTkuODMgODIuNDIwNiAyMDMuNTUzTDg1LjUyNyAyMDUuODY1TDYxLjgwNTQgMjE3LjcxMkM0OC43NTg1IDIyNC4xOTkgMzguMDI3MyAyMjkuNTAxIDM3LjkxNDMgMjI5LjUwMUMzNy44NTc4IDIyOS41MDEgMzYuMzMyOSAyMjcuODY1IDM0LjUyNTUgMjI1LjgzNVoiIGZpbGw9IiNFRDFCMjQiLz4KPHBhdGggZD0iTTUwLjI4MzIgMTcxLjM5OUM0Ny4xNzY4IDE3MS4xMTcgMzUuNTQxOSAxNzAuMzg0IDI0LjQxNTMgMTY5LjY1TDQuMjUxOTIgMTY4LjM1M0wzLjY4NzEyIDE2Ni4zNzlDMC4wNzIzOTI0IDE1My41MTcgLTAuODMxMjg5IDEzMC44NCAxLjcxMDMxIDExNC41OTRMMi42NzA0OCAxMDguMjc2TDI1Ljk5NjcgMTIzLjg0NUw0OS4zNzk1IDEzOS4zNThMNDkuNzE4NCAxNDMuMTM4QzUwLjYyMjEgMTUyLjA1IDUzLjIyMDEgMTYyLjQzIDU2LjQzOTUgMTY5Ljg3NkM1Ny4xMTczIDE3MS40NTUgNTcuMTczOCAxNzEuOTYzIDU2LjY2NTQgMTcxLjkwN0M1Ni4yNzAxIDE3MS44NSA1My4zODk2IDE3MS42MjUgNTAuMjgzMiAxNzEuMzk5WiIgZmlsbD0iI0VEMUIyNCIvPgo8cGF0aCBkPSJNMjcuOTczNiAxMTMuNTIyQzE1Ljk5OTggMTA1LjU2OCA2LjA1OTM0IDk4Ljg1NTcgNS43NzY5NCA5OC42ODY1QzQuOTg2MjIgOTcuOTUzMSA5Ljg0MzUxIDg1LjAzNTIgMTQuMTM2IDc2LjM0ODFMMTguNzY3NCA2Ny4wNDA0IDIzLjYyNDYgNTkuMzY4NyAzMC4wNjM0IDUxLjMwMkwzNC4yOTk0IDQ2LjA1NTlMNDYuNjY4NSA3MC45ODkxQzUzLjUwMjYgODQuNzUzMiA1OS4wMzc3IDk2LjIwNDQgNTkuMDM3NyA5Ni40ODY1QzU5LjAzNzcgOTYuNzY4NSA1OC4zMDM0IDk4LjQwNDQgNTcuMzk5NyAxMDAuMjFDMzU2LjQ5NjEgMTAxLjk1OCA1NS4wMjc2IDEwNS43OTQgNTQuMDY3NCAxMDguNjcxQzUyLjQ4NiAxMTMuMjk3IDUxLjc1MTcgMTE2LjUxMiA1MC4xNzAzIDEyNS41OTRMNDkuNzE4NCAxMjcuOTYzTDI3Ljk3MzYgMTEzLjUyMloiIGZpbGw9IiNFRDFCMjQiLz4KPHBhdGggZD0iTTUzLjE2MzcgNjIuMTMyOEw0MS40MTU5IDM4LjYwOThMNDQuNDA5MyAzNS45MDIyQzU0LjAxMSAyNy4zMjc4IDY1LjUzMjkgMTkuNjU2MSA3Ni44Mjg5IDE0LjI0MDdDODMuNTUgMTEuMDI1MyA5Mi4zMDQ1IDcuNTI3OTIgOTIuNjQzMyA3LjkyMjc5QzkyLjc1NjMgOC4wMzU2MSA5Mi4wMjIgMjAuNTAyMiA5MS4wNjE5IDM1LjczMjlMODkuMjU0NSA2My4zMTc0TDg2LjIwNDYgNjUuNDYxQzc4Ljk3NTIgNzAuNDgxNSA3MS4zNTAzIDc3Ljc1ODQgNjYuOTQ0OSA4My44NTA3QzY2LjIxMDYgODQuODA5NiA2NS40NzY0IDg1LjY1NTggNjUuMzA3IDg1LjY1NThDNjUuMDgxMSA4NS42NTU4IDU5LjY1OSA3NS4wNTA3IDUzLjE2MzcgNjIuMTMyOFoiIGZpbGw9IiNFRDFCMjQiLz4KPHBhdGggZD0iTTE3MS4xNTEgNTguMTg0MkMxNjkuNjI2IDU3LjM5NDQgMTY1Ljg0MiA1NS44NzE0IDE2Mi44NDggNTQuODU2QzE1Ny45OTEgNTMuMjIwMSAxNTQuNzcxIDUyLjQ4NjggMTQ1LjU2NSA1MC44NTA5TDE0My4xOTMgNTAuMzk5NkwxNTcuNjUyIDI4LjY4MTdDMTY1LjYxNiAxNi43MjI4IDE3Mi4zMzcgNi43OTQ2NCAxNzIuNTA2IDYuNTEyNTlDMTczLjI0IDUuNzIyODUgMTg2LjE3NCAxMC41NzQxIDE5NC44NzIgMTQuODYxM0MyMDQuMjQ4IDE5LjQ4NjkgMjExLjg3MyAyNC4zMzgyIDIxOS45NDkgMzAuNzY4OUwyMjUuMjAyIDM1LjA1NjFMMjAwLjIzOCA0Ny4zNTM0QzE4Ni40NTcgNTQuMTc5MSAxNzQuOTM1IDU5LjcwNzIgMTc0LjU5NiA1OS43MDcyQzE3NC4yNTcgNTkuNjUwOCAxNzIuNzMyIDU4Ljk3MzkgMTcxLjE1MSA1OC4xODQyWiIgZmlsbD0iI0VEMUIyNCIvPgo8cGF0aCBkPSJNOTkuMzY0NCA1Ni4yMDk3Qzk5LjUzMzkgNTUuMTk0NCAxMDAuMzI1IDQzLjIzNTQgMTAxLjE3MiAyOS42NDA2TDEwMi43NTMgNC45ODk0NUwxMDQuNzMgNC40MjUzNUMxMDkuMjQ4IDMuMTI3OTIgMTIwLjIwNiAxLjU0ODQ0IDEyNy40MzUgMS4xNTM1N0MxMzYuNjk4IDAuNTg5NDY5IDE0Ny45MzcgMS4wOTcxNiAxNTYuNTc5IDIuNDUxTDE2Mi45MDUgMy40MDk5N0wxNDcuMzE2IDI2LjcwNzNMMTMxLjc4NCA1MC4wNjFMMTI4IDUwLjM5OTVDMTE5LjQ3MSA1MS4zMDIxIDEwOC4xNzUgNTQuMTIyNiAxMDEuMjI4IDU3LjExMjNMODkuMDgyIDU4LjA3MTNMODkuMzY0NCA1Ni4yMDk3WiIgZmlsbD0iI0VEMUIyNCIvPgo8cGF0aCBkPSJNMTE2Ljk4NCAxNDguMzIyQzExNC45NjEgMTQ4LjMyMiAxMTMuMDc5IDE0OC4wMzQgMTExLjMzOSAxNDcuNDU5QzEwOS41OTggMTQ2Ljg4MyAxMDguMDgxIDE0Ni4wODQgMTA2Ljc4NyAxNDUuMDYxQzEwNS40OTMgMTQ0LjAzOCAxMDQuNDk0IDE0Mi44MjMgMTAzLjc4OCAxNDEuNDE2QzEwMy4wODIgMTM5Ljk4OCAxMDIuNzMgMTM4LjQxIDEwMi43MyAxMzYuNjg0QzEwMi43MyAxMzQuOTc5IDEwMy4wOTQgMTMzLjQyMyAxMDMuODIzIDEzMi4wMTZDMTA0LjU1MyAxMzAuNTg4IDEwNS41NTIgMTI5LjM2MiAxMDYuODIyIDEyOC4zMzlDMTA4LjExNiAxMjcuMjk0IDEwOS42MzMgMTI2LjQ4NCAxMTEuMzc0IDEyNS45MDlDMTEzLjEzOCAxMjUuMzMzIDExNS4wMzIgMTI1LjA0NiAxMTcuMDU0IDEyNS4wNDZDMTA4LjM5NSAxMjUuMDQ2IDExOS42ODkgMTI1LjE5NSAxMjAuOTM1IDEyNS40OTNDMTIyLjE4MiAxMjUuNzcgMTIzLjM0NiAxMjYuMTY1IDEyNC40MjggMTI2LjY3NkMxMjUuNTM0IDEyNy4xNjcgMTI2LjQ5OCAxMjcuNzYzIDEyNy4zMjIgMTI4LjQ2N0wxMjMuMjI5IDEzMy4xMDNDMTIyLjc1OCAxMzIuNjc3IDEyMi4yMTcgMTMyLjI5MyAxMjEuNjA2IDEzMS45NTJDMTIxLjAxOCAxMzEuNjExIDEyMC4zMjQgMTMxLjMzNCAxMTkuNTI0IDEzMS4xMjFDMTE4Ljc0OCAxMzAuOTA3IDExNy44NjYgMTMwLjgwMSAxMTYuODc4IDEzMC44MDFDMTE1Ljk4NCAxMzAuODAxIDExNS4xMTQgMTMwLjkyOSAxMTQuMjY3IDEzMS4xODRDMTEzLjQyIDEzMS40NCAxMTIuNjY4IDEzMS44MjQgMTEyLjAwOSAxMzIuMzM1QzExMS4zNzQgMTMyLjg0NyAxMTAuODY4IDEzMy40NzYgMTEwLjQ5MiAxMzQuMjIyQzExMC4xMTUgMTM0Ljk0NyAxMDkuOTI3IDEzNS43ODkgMTA5LjkyNyAxMzYuNzQ4QzEwOS45MjcgMTM3LjY4NiAxMTAuMTE1IDEzOC41MTcgMTEwLjQ5MiAxMzkuMjQyQzExMC44OTIgMTM5Ljk2NiAxMTEuNDQ0IDE0MC41NzQgMTEyLjE1IDE0MS4wNjRDMTEyLjg1NiAxNDEuNTU0IDExMy42NjcgMTQxLjkzOCAxMTQuNTg1IDE0Mi4yMTVDMTE1LjUwMiAxNDIuNDkyIDExNi41MDIgMTQyLjYzMSAxMTcuNTg0IDE0Mi42MzFDMTE4LjU3MiAxNDIuNjMxIDExOS40NTQgMTQyLjUwMyAxMjAuMjMgMTQyLjI0N0MxMjEuMDMgMTQxLjk5MSAxMjEuNzM1IDE0MS42ODIgMTIyLjM0NyAxNDEuMzJDMjIyLjk4MiAxNDAuOTU4IDEyMy41NDYgMTQwLjU4NSAyMjQuMDQgMTQwLjIwMUwyNDAuMzcxIDE0NC45OTdDMjM5LjczNiAxNDUuNTUxIDIzOC44NzcgMTQ2LjA4NCAyMzcuNzk1IDE0Ni41OTVDMjM2LjcxMyAxNDcuMTA3IDIzNS41MDIgMTQ3LjUyMyAyMzQuMTYxIDE0Ny44NDJDMzMyLjgyMSAxNDguMTYyIDIzMS40NDUgMTQ4LjMyMiAyMzAuMDMzIDE0OC4zMjJaIiBmaWxsPSIjRUQxQjI0Ii8+CjxwYXRoIGQ9Ik0yNjMuMjc5IDE0OC4wMDJWMjE1LjYyMUgyNzAuMjY1VjE0OC4wMDJIMjYzLjI3OVpNMjQ2LjM0MyAxNDguMDAyVjEyNS42MjFIMjUzLjMyOVYxNDguMDAySDI0Ni4zNDNaTTI0OC45ODkgMTM5LjY4OUwyNDkuMDI1IDEzNC4xMjZIMjY3LjEyNVYxMzkuNjg5SDI0OC45ODlaIiBmaWxsPSIjRUQxQjI0Ii8+Cjwvc3ZnPgo=',
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
