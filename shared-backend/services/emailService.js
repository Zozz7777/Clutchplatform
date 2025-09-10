const nodemailer = require('nodemailer');
const { logger } = require('../config/logger');
const { firestore } = require('../config/firebase-admin');
const { v4: uuidv4 } = require('uuid');

// Email Configuration
const EMAIL_CONFIG = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  from: process.env.EMAIL_FROM,
  fromName: process.env.EMAIL_FROM_NAME || 'Clutch Automotive Services'
};

// Create transporter
let transporter = null;

const createTransporter = () => {
  try {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        service: EMAIL_CONFIG.service,
        host: EMAIL_CONFIG.host,
        port: EMAIL_CONFIG.port,
        secure: EMAIL_CONFIG.secure,
        auth: EMAIL_CONFIG.auth
      });

      // Verify connection
      transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email transporter verification failed:', error);
        } else {
          console.log('✅ Email transporter created and verified successfully');
        }
      });
    }
    return transporter;
  } catch (error) {
    console.error('❌ Email transporter creation failed:', error);
    throw error;
  }
};

// Email templates
const EMAIL_TEMPLATES = {
  WELCOME: {
    subject: 'Welcome to Clutch - Your Automotive Service Partner',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FF6B35; color: white; padding: 20px; text-align: center;">
          <h1>Welcome to Clutch!</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello {firstName},</h2>
          <p>Welcome to Clutch - your trusted automotive service partner in Egypt!</p>
          <p>We're excited to have you on board. With Clutch, you can:</p>
          <ul>
            <li>Book roadside assistance 24/7</li>
            <li>Schedule maintenance services</li>
            <li>Track your service requests in real-time</li>
            <li>Get professional mechanics at your location</li>
          </ul>
          <p>Your account has been successfully created. You can now start booking services through our mobile app or website.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{appDownloadLink}" style="background-color: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Download Our App</a>
          </div>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The Clutch Team</p>
        </div>
      </div>
    `
  },
  BOOKING_CONFIRMED: {
    subject: 'Booking Confirmed - Clutch Service',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4ECDC4; color: white; padding: 20px; text-align: center;">
          <h1>Booking Confirmed!</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello {firstName},</h2>
          <p>Your service booking has been confirmed!</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Booking Details:</h3>
            <p><strong>Booking ID:</strong> {bookingId}</p>
            <p><strong>Service Type:</strong> {serviceType}</p>
            <p><strong>Scheduled Date:</strong> {scheduledDate}</p>
            <p><strong>Estimated Cost:</strong> {estimatedCost} EGP</p>
            <p><strong>Location:</strong> {location}</p>
          </div>
          <p>Your mechanic will arrive at the scheduled time. You can track the status of your booking through our mobile app.</p>
          <p>If you need to make any changes, please contact us at least 2 hours before the scheduled time.</p>
          <p>Thank you for choosing Clutch!</p>
        </div>
      </div>
    `
  },
  BOOKING_STARTED: {
    subject: 'Service Started - Clutch',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FF6B35; color: white; padding: 20px; text-align: center;">
          <h1>Service Started</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello {firstName},</h2>
          <p>Your mechanic has started working on your vehicle!</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Service Details:</h3>
            <p><strong>Booking ID:</strong> {bookingId}</p>
            <p><strong>Mechanic:</strong> {mechanicName}</p>
            <p><strong>Started At:</strong> {startedAt}</p>
            <p><strong>Estimated Duration:</strong> {estimatedDuration}</p>
          </div>
          <p>You'll receive another notification when the service is completed.</p>
        </div>
      </div>
    `
  },
  BOOKING_COMPLETED: {
    subject: 'Service Completed - Clutch',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4ECDC4; color: white; padding: 20px; text-align: center;">
          <h1>Service Completed!</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello {firstName},</h2>
          <p>Your service has been completed successfully!</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Service Summary:</h3>
            <p><strong>Booking ID:</strong> {bookingId}</p>
            <p><strong>Service Type:</strong> {serviceType}</p>
            <p><strong>Completed At:</strong> {completedAt}</p>
            <p><strong>Total Cost:</strong> {totalCost} EGP</p>
            <p><strong>Mechanic:</strong> {mechanicName}</p>
          </div>
          <p>Please rate your experience and provide feedback through our mobile app.</p>
          <p>Thank you for choosing Clutch!</p>
        </div>
      </div>
    `
  },
  OTP_VERIFICATION: {
    subject: 'OTP Verification - Clutch',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FF6B35; color: white; padding: 20px; text-align: center;">
          <h1>OTP Verification</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello {firstName},</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h1 style="color: #FF6B35; font-size: 32px; margin: 0;">{otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>The Clutch Team</p>
        </div>
      </div>
    `
  },
  PASSWORD_RESET: {
    subject: 'Password Reset - Clutch',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FF6B35; color: white; padding: 20px; text-align: center;">
          <h1>Password Reset</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello {firstName},</h2>
          <p>You requested a password reset for your Clutch account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{resetLink}" style="background-color: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <p>Best regards,<br>The Clutch Team</p>
        </div>
      </div>
    `
  }
};

/**
 * Enhanced Email Service with Firebase Integration
 */
class EnhancedEmailService {
  constructor() {
    // Re-enable Firebase integration
    this.db = firestore;
    this.collections = {
      emails: 'email_logs',
      templates: 'email_templates',
      campaigns: 'email_campaigns',
      analytics: 'email_analytics'
    };
  }

  /**
   * Send email with Firebase tracking
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} html - Email HTML content
   * @param {Object} options - Additional options
   * @returns {Object} Send result
   */
  async sendEmail(to, subject, html, options = {}) {
    const emailId = uuidv4();
    const timestamp = new Date();

    try {
      if (!transporter) {
        transporter = createTransporter();
        if (!transporter) {
          return { success: false, error: 'Email service not configured' };
        }
      }

      const mailOptions = {
        from: `"${EMAIL_CONFIG.fromName}" <${EMAIL_CONFIG.from}>`,
        to: to,
        subject: subject,
        html: html,
        text: options.text || html.replace(/<[^>]*>/g, ''),
        attachments: options.attachments || [],
        headers: {
          'X-Email-ID': emailId,
          'X-Campaign-ID': options.campaignId || '',
          'X-Template-ID': options.templateId || ''
        }
      };

      // Log email attempt to Firebase
      if (this.db) {
        try {
          await this.logEmailAttempt({
            emailId,
            to,
            subject,
            templateId: options.templateId,
            campaignId: options.campaignId,
            userId: options.userId,
            status: 'sending',
            timestamp
          });
        } catch (firebaseError) {
          console.warn('⚠️ Firebase logging failed, continuing with email:', firebaseError.message);
        }
      }

      const info = await transporter.sendMail(mailOptions);
      
      // Log successful email to Firebase
      if (this.db) {
        try {
          await this.logEmailSuccess({
            emailId,
            messageId: info.messageId,
            to,
            subject,
            templateId: options.templateId,
            campaignId: options.campaignId,
            userId: options.userId,
            timestamp
          });
        } catch (firebaseError) {
          console.warn('⚠️ Firebase success logging failed:', firebaseError.message);
        }
      }

      console.log(`✅ Email sent successfully: ${info.messageId} to ${to}`);
      
      return {
        success: true,
        emailId,
        messageId: info.messageId,
        to: to
      };
    } catch (error) {
      // Log failed email to Firebase
      if (this.db) {
        try {
          await this.logEmailFailure({
            emailId,
            to,
            subject,
            templateId: options.templateId,
            campaignId: options.campaignId,
            userId: options.userId,
            error: error.message,
            timestamp
          });
        } catch (firebaseError) {
          console.warn('⚠️ Firebase failure logging failed:', firebaseError.message);
        }
      }

      console.error('❌ Error sending email:', error.message);
      return {
        success: false,
        emailId,
        error: error.message,
        to: to
      };
    }
  }

  /**
   * Send template email with Firebase tracking
   * @param {string} to - Recipient email
   * @param {string} templateName - Template name
   * @param {Object} data - Template data
   * @param {Object} options - Additional options
   * @returns {Object} Send result
   */
  async sendTemplateEmail(to, templateName, data, options = {}) {
    try {
      const template = EMAIL_TEMPLATES[templateName];
      if (!template) {
        throw new Error(`Email template '${templateName}' not found`);
      }

      // Replace placeholders in template
      let html = template.template;
      let subject = template.subject;

      Object.keys(data).forEach(key => {
        const placeholder = `{${key}}`;
        html = html.replace(new RegExp(placeholder, 'g'), data[key]);
        subject = subject.replace(new RegExp(placeholder, 'g'), data[key]);
      });

      return await this.sendEmail(to, subject, html, {
        ...options,
        templateId: templateName
      });
    } catch (error) {
      logger.error('Error sending template email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Log email attempt to Firebase
   * @param {Object} emailData - Email data
   */
  async logEmailAttempt(emailData) {
    try {
      await this.db.collection(this.collections.emails).add({
        ...emailData,
        type: 'attempt'
      });
    } catch (error) {
      logger.error('Error logging email attempt:', error);
    }
  }

  /**
   * Log successful email to Firebase
   * @param {Object} emailData - Email data
   */
  async logEmailSuccess(emailData) {
    try {
      await this.db.collection(this.collections.emails).add({
        ...emailData,
        type: 'success'
      });
    } catch (error) {
      logger.error('Error logging email success:', error);
    }
  }

  /**
   * Log failed email to Firebase
   * @param {Object} emailData - Email data
   */
  async logEmailFailure(emailData) {
    try {
      await this.db.collection(this.collections.emails).add({
        ...emailData,
        type: 'failure'
      });
    } catch (error) {
      logger.error('Error logging email failure:', error);
    }
  }

  /**
   * Get email analytics
   * @param {Object} filters - Date range and other filters
   * @returns {Object} Email analytics
   */
  async getEmailAnalytics(filters = {}) {
    try {
      const { startDate, endDate, templateId, campaignId } = filters;
      
      let query = this.db.collection(this.collections.emails);
      
      if (startDate && endDate) {
        query = query.where('timestamp', '>=', new Date(startDate))
                    .where('timestamp', '<=', new Date(endDate));
      }
      
      if (templateId) {
        query = query.where('templateId', '==', templateId);
      }
      
      if (campaignId) {
        query = query.where('campaignId', '==', campaignId);
      }

      const snapshot = await query.get();
      const emails = [];
      
      snapshot.forEach(doc => {
        emails.push({ id: doc.id, ...doc.data() });
      });

      // Calculate metrics
      const totalEmails = emails.length;
      const successfulEmails = emails.filter(e => e.type === 'success').length;
      const failedEmails = emails.filter(e => e.type === 'failure').length;
      const successRate = totalEmails > 0 ? (successfulEmails / totalEmails) * 100 : 0;

      return {
        success: true,
        data: {
          totalEmails,
          successfulEmails,
          failedEmails,
          successRate,
          timeRange: { startDate, endDate }
        }
      };
    } catch (error) {
      logger.error('Error getting email analytics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create email campaign
   * @param {Object} campaignData - Campaign data
   * @returns {Object} Campaign creation result
   */
  async createCampaign(campaignData) {
    try {
      const campaignId = uuidv4();
      const timestamp = new Date();

      const campaign = {
        campaignId,
        name: campaignData.name,
        subject: campaignData.subject,
        templateId: campaignData.templateId,
        recipients: campaignData.recipients || [],
        status: 'draft',
        createdAt: timestamp,
        createdBy: campaignData.createdBy,
        scheduledAt: campaignData.scheduledAt,
        metadata: campaignData.metadata || {}
      };

      await this.db.collection(this.collections.campaigns).add(campaign);

      return {
        success: true,
        campaignId,
        message: 'Campaign created successfully'
      };
    } catch (error) {
      logger.error('Error creating campaign:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send campaign emails
   * @param {string} campaignId - Campaign ID
   * @returns {Object} Campaign send result
   */
  async sendCampaign(campaignId) {
    try {
      const campaignSnapshot = await this.db.collection(this.collections.campaigns)
        .where('campaignId', '==', campaignId)
        .get();

      if (campaignSnapshot.empty) {
        throw new Error('Campaign not found');
      }

      const campaign = campaignSnapshot.docs[0].data();
      const results = [];

      for (const recipient of campaign.recipients) {
        const result = await this.sendTemplateEmail(
          recipient.email,
          campaign.templateId,
          recipient.data || {},
          {
            campaignId,
            userId: recipient.userId
          }
        );
        results.push(result);
      }

      // Update campaign status
      await this.db.collection(this.collections.campaigns)
        .doc(campaignSnapshot.docs[0].id)
        .update({
          status: 'sent',
          sentAt: new Date(),
          results: results
        });

      return {
        success: true,
        campaignId,
        totalSent: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      };
    } catch (error) {
      logger.error('Error sending campaign:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create enhanced email service instance
const enhancedEmailService = new EnhancedEmailService();

// Legacy functions for backward compatibility
const sendEmail = async (to, subject, html, text = null) => {
  return await enhancedEmailService.sendEmail(to, subject, html, { text: text || null });
};

const sendTemplateEmail = async (to, templateName, data) => {
  return await enhancedEmailService.sendTemplateEmail(to, templateName, data);
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const data = {
    firstName: user.firstName,
    appDownloadLink: process.env.APP_DOWNLOAD_LINK || 'https://clutch.com/app'
  };

  return await enhancedEmailService.sendTemplateEmail(user.email, 'WELCOME', data, {
    userId: user._id || user.id
  });
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (booking, user) => {
  const data = {
    firstName: user.firstName,
    bookingId: booking._id || booking.id,
    serviceType: booking.serviceType,
    scheduledDate: new Date(booking.scheduledDate).toLocaleString('en-EG'),
    estimatedCost: booking.estimatedCost || 'TBD',
    location: booking.location || booking.address
  };

  return await enhancedEmailService.sendTemplateEmail(user.email, 'BOOKING_CONFIRMED', data, {
    userId: user._id || user.id
  });
};

// Send booking started email
const sendBookingStartedEmail = async (booking, user, mechanic) => {
  const data = {
    firstName: user.firstName,
    bookingId: booking._id || booking.id,
    mechanicName: `${mechanic.firstName} ${mechanic.lastName}`,
    startedAt: new Date().toLocaleString('en-EG'),
    estimatedDuration: booking.estimatedDuration || '1-2 hours'
  };

  return await enhancedEmailService.sendTemplateEmail(user.email, 'BOOKING_STARTED', data, {
    userId: user._id || user.id
  });
};

// Send booking completed email
const sendBookingCompletedEmail = async (booking, user) => {
  const data = {
    firstName: user.firstName,
    bookingId: booking._id || booking.id,
    serviceType: booking.serviceType,
    completedAt: new Date().toLocaleString('en-EG'),
    totalCost: booking.actualCost || booking.estimatedCost,
    workDone: booking.workDone || 'Service completed as requested',
    ratingLink: `${process.env.FRONTEND_URL}/rating/${booking._id}`
  };

  return await enhancedEmailService.sendTemplateEmail(user.email, 'BOOKING_COMPLETED', data, {
    userId: user._id || user.id
  });
};

// Send payment success email
const sendPaymentSuccessEmail = async (payment, user) => {
  const data = {
    firstName: user.firstName,
    transactionId: payment.transactionId || payment.id,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod || 'Card',
    paymentDate: new Date().toLocaleString('en-EG'),
    bookingId: payment.bookingId
  };

  return await enhancedEmailService.sendTemplateEmail(user.email, 'PAYMENT_SUCCESS', data, {
    userId: user._id || user.id
  });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const data = {
    firstName: user.firstName,
    resetLink: resetLink
  };

  return await enhancedEmailService.sendTemplateEmail(user.email, 'PASSWORD_RESET', data, {
    userId: user._id || user.id
  });
};

// Send OTP verification email
const sendOTPEmail = async (user, otp) => {
  const data = {
    firstName: user.firstName,
    otp: otp
  };

  return await enhancedEmailService.sendTemplateEmail(user.email, 'OTP_VERIFICATION', data, {
    userId: user._id || user.id
  });
};

// Send bulk email
const sendBulkEmail = async (recipients, subject, html, text = null) => {
  try {
    const results = [];
    const promises = recipients.map(async (recipient) => {
      const result = await enhancedEmailService.sendEmail(recipient, subject, html, { text });
      results.push(result);
      return result;
    });

    await Promise.all(promises);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    logger.info(`Bulk email sent: ${successCount}/${recipients.length} successful`);

    return {
      success: true,
      totalSent: recipients.length,
      successCount,
      failureCount,
      results
    };
  } catch (error) {
    logger.error('Error sending bulk email:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  try {
    if (!transporter) {
      transporter = createTransporter();
      if (!transporter) {
        return { success: false, error: 'Email service not configured' };
      }
    }

    const testResult = await transporter.verify();
    return {
      success: true,
      message: 'Email configuration is working correctly'
    };
  } catch (error) {
    logger.error('Email configuration test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  EMAIL_TEMPLATES,
  enhancedEmailService,
  sendEmail,
  sendTemplateEmail,
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendBookingStartedEmail,
  sendBookingCompletedEmail,
  sendPaymentSuccessEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
  sendBulkEmail,
  testEmailConfiguration
};
