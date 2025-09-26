const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Notification Types
const NOTIFICATION_TYPES = {
  ORDER_RECEIVED: 'order_received',
  ORDER_STATUS_CHANGED: 'order_status_changed',
  INVOICE_PAID: 'invoice_paid',
  INVOICE_REJECTED: 'invoice_rejected',
  PAYOUT_ISSUED: 'payout_issued',
  PAYOUT_REQUESTED: 'payout_requested',
  KYC_APPROVED: 'kyc_approved',
  KYC_REJECTED: 'kyc_rejected',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SECURITY_ALERT: 'security_alert'
};

// Notification Channels
const NOTIFICATION_CHANNELS = {
  PUSH: 'push',
  EMAIL: 'email',
  SMS: 'sms',
  IN_APP: 'in_app'
};

// Notification Priority
const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Send Push Notification
router.post('/push', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('body').notEmpty().withMessage('Body is required'),
  body('userId').optional().isMongoId().withMessage('Invalid user ID'),
  body('type').optional().isIn(Object.values(NOTIFICATION_TYPES)).withMessage('Invalid notification type'),
  body('priority').optional().isIn(Object.values(NOTIFICATION_PRIORITY)).withMessage('Invalid priority'),
  body('data').optional().isObject().withMessage('Data must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, body, userId, type, priority, data } = req.body;
    const senderId = req.user._id;

    // If userId is provided, send to specific user
    if (userId) {
      const user = await PartnerUser.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user has push notifications enabled
      if (!user.notificationSettings?.push?.enabled) {
        return res.status(400).json({
          success: false,
          message: 'User has push notifications disabled'
        });
      }

      // Send push notification (mock implementation)
      const pushResult = await sendPushNotification({
        userId: userId,
        title: title,
        body: body,
        type: type || NOTIFICATION_TYPES.SYSTEM_MAINTENANCE,
        priority: priority || NOTIFICATION_PRIORITY.NORMAL,
        data: data || {}
      });

      // Save notification to database
      await saveNotification({
        userId: userId,
        title: title,
        body: body,
        type: type || NOTIFICATION_TYPES.SYSTEM_MAINTENANCE,
        priority: priority || NOTIFICATION_PRIORITY.NORMAL,
        channel: NOTIFICATION_CHANNELS.PUSH,
        data: data || {},
        sentAt: new Date(),
        status: pushResult.success ? 'sent' : 'failed'
      });

      logger.info(`Push notification sent to user ${userId}`, {
        title: title,
        type: type,
        priority: priority
      });

      res.json({
        success: true,
        message: 'Push notification sent successfully',
        data: {
          userId: userId,
          title: title,
          sentAt: new Date(),
          status: pushResult.success ? 'sent' : 'failed'
        }
      });

    } else {
      // Send to all users (broadcast)
      const users = await PartnerUser.find({
        'notificationSettings.push.enabled': true
      });

      const results = [];
      for (const user of users) {
        const pushResult = await sendPushNotification({
          userId: user._id,
          title: title,
          body: body,
          type: type || NOTIFICATION_TYPES.SYSTEM_MAINTENANCE,
          priority: priority || NOTIFICATION_PRIORITY.NORMAL,
          data: data || {}
        });

        await saveNotification({
          userId: user._id,
          title: title,
          body: body,
          type: type || NOTIFICATION_TYPES.SYSTEM_MAINTENANCE,
          priority: priority || NOTIFICATION_PRIORITY.NORMAL,
          channel: NOTIFICATION_CHANNELS.PUSH,
          data: data || {},
          sentAt: new Date(),
          status: pushResult.success ? 'sent' : 'failed'
        });

        results.push({
          userId: user._id,
          status: pushResult.success ? 'sent' : 'failed'
        });
      }

      logger.info(`Broadcast push notification sent to ${users.length} users`, {
        title: title,
        type: type,
        priority: priority
      });

      res.json({
        success: true,
        message: 'Broadcast push notification sent successfully',
        data: {
          totalUsers: users.length,
          results: results
        }
      });
    }

  } catch (error) {
    logger.error('Push notification failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send push notification'
    });
  }
});

// Send Email Notification
router.post('/email', [
  auth,
  body('to').isEmail().withMessage('Valid email is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('template').notEmpty().withMessage('Template is required'),
  body('data').optional().isObject().withMessage('Data must be an object'),
  body('priority').optional().isIn(Object.values(NOTIFICATION_PRIORITY)).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { to, subject, template, data, priority } = req.body;
    const senderId = req.user._id;

    // Send email notification (mock implementation)
    const emailResult = await sendEmailNotification({
      to: to,
      subject: subject,
      template: template,
      data: data || {},
      priority: priority || NOTIFICATION_PRIORITY.NORMAL
    });

    // Save notification to database
    await saveNotification({
      userId: null, // Email notifications might not be tied to a specific user
      title: subject,
      body: `Email sent to ${to}`,
      type: NOTIFICATION_TYPES.SYSTEM_MAINTENANCE,
      priority: priority || NOTIFICATION_PRIORITY.NORMAL,
      channel: NOTIFICATION_CHANNELS.EMAIL,
      data: { to: to, template: template, ...data },
      sentAt: new Date(),
      status: emailResult.success ? 'sent' : 'failed'
    });

    logger.info(`Email notification sent to ${to}`, {
      subject: subject,
      template: template,
      priority: priority
    });

    res.json({
      success: true,
      message: 'Email notification sent successfully',
      data: {
        to: to,
        subject: subject,
        sentAt: new Date(),
        status: emailResult.success ? 'sent' : 'failed'
      }
    });

  } catch (error) {
    logger.error('Email notification failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email notification'
    });
  }
});

// Send SMS Notification
router.post('/sms', [
  auth,
  body('to').isMobilePhone().withMessage('Valid phone number is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('priority').optional().isIn(Object.values(NOTIFICATION_PRIORITY)).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { to, message, priority } = req.body;
    const senderId = req.user._id;

    // Send SMS notification (mock implementation)
    const smsResult = await sendSMSNotification({
      to: to,
      message: message,
      priority: priority || NOTIFICATION_PRIORITY.NORMAL
    });

    // Save notification to database
    await saveNotification({
      userId: null, // SMS notifications might not be tied to a specific user
      title: 'SMS Notification',
      body: message,
      type: NOTIFICATION_TYPES.SYSTEM_MAINTENANCE,
      priority: priority || NOTIFICATION_PRIORITY.NORMAL,
      channel: NOTIFICATION_CHANNELS.SMS,
      data: { to: to },
      sentAt: new Date(),
      status: smsResult.success ? 'sent' : 'failed'
    });

    logger.info(`SMS notification sent to ${to}`, {
      message: message,
      priority: priority
    });

    res.json({
      success: true,
      message: 'SMS notification sent successfully',
      data: {
        to: to,
        message: message,
        sentAt: new Date(),
        status: smsResult.success ? 'sent' : 'failed'
      }
    });

  } catch (error) {
    logger.error('SMS notification failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send SMS notification'
    });
  }
});

// Get user notifications
router.get('/user/:userId', [
  auth,
  body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  body('type').optional().isIn(Object.values(NOTIFICATION_TYPES)).withMessage('Invalid notification type'),
  body('channel').optional().isIn(Object.values(NOTIFICATION_CHANNELS)).withMessage('Invalid channel'),
  body('status').optional().isIn(['sent', 'failed', 'pending']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type, channel, status } = req.query;
    const currentUser = req.user;

    // Users can only view their own notifications unless they have admin access
    if (currentUser._id.toString() !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // Build query
    const query = { userId: userId };
    if (type) query.type = type;
    if (channel) query.channel = channel;
    if (status) query.status = status;

    // Get notifications (mock implementation - would be from notifications collection)
    const notifications = [
      {
        id: '1',
        title: 'New Order Received',
        body: 'You have received a new order #ORD123',
        type: NOTIFICATION_TYPES.ORDER_RECEIVED,
        priority: NOTIFICATION_PRIORITY.HIGH,
        channel: NOTIFICATION_CHANNELS.PUSH,
        data: { orderId: 'ORD123' },
        sentAt: new Date().toISOString(),
        status: 'sent',
        readAt: null
      }
    ];

    res.json({
      success: true,
      data: {
        notifications: notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: notifications.length
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user notifications'
    });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    // Update notification status (mock implementation)
    // In real implementation, this would update the notification in the database

    logger.info(`Notification ${notificationId} marked as read by user ${userId}`);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    logger.error('Failed to mark notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Update notification settings
router.patch('/settings', [
  auth,
  body('push.enabled').optional().isBoolean().withMessage('Push enabled must be boolean'),
  body('email.enabled').optional().isBoolean().withMessage('Email enabled must be boolean'),
  body('sms.enabled').optional().isBoolean().withMessage('SMS enabled must be boolean'),
  body('inApp.enabled').optional().isBoolean().withMessage('In-app enabled must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const settings = req.body;

    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize notification settings if not exists
    if (!user.notificationSettings) {
      user.notificationSettings = {
        push: { enabled: true },
        email: { enabled: true },
        sms: { enabled: true },
        inApp: { enabled: true }
      };
    }

    // Update settings
    if (settings.push !== undefined) {
      user.notificationSettings.push = { ...user.notificationSettings.push, ...settings.push };
    }
    if (settings.email !== undefined) {
      user.notificationSettings.email = { ...user.notificationSettings.email, ...settings.email };
    }
    if (settings.sms !== undefined) {
      user.notificationSettings.sms = { ...user.notificationSettings.sms, ...settings.sms };
    }
    if (settings.inApp !== undefined) {
      user.notificationSettings.inApp = { ...user.notificationSettings.inApp, ...settings.inApp };
    }

    await user.save();

    logger.info(`Notification settings updated for user ${userId}`, settings);

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: {
        notificationSettings: user.notificationSettings
      }
    });

  } catch (error) {
    logger.error('Failed to update notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification settings'
    });
  }
});

// Helper functions (mock implementations)
async function sendPushNotification({ userId, title, body, type, priority, data }) {
  // Mock implementation - in real app, this would integrate with FCM/APNs
  logger.info('Sending push notification', { userId, title, body, type, priority });
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return { success: true, messageId: `push_${Date.now()}` };
}

async function sendEmailNotification({ to, subject, template, data, priority }) {
  // Mock implementation - in real app, this would integrate with SendGrid
  logger.info('Sending email notification', { to, subject, template, priority });
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return { success: true, messageId: `email_${Date.now()}` };
}

async function sendSMSNotification({ to, message, priority }) {
  // Mock implementation - in real app, this would integrate with Twilio
  logger.info('Sending SMS notification', { to, message, priority });
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 150));
  
  return { success: true, messageId: `sms_${Date.now()}` };
}

async function saveNotification(notificationData) {
  // Mock implementation - in real app, this would save to notifications collection
  logger.info('Saving notification', notificationData);
  
  // Simulate database save
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return { success: true, id: `notif_${Date.now()}` };
}

module.exports = router;
