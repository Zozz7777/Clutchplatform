const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const Notification = require('../models/notification');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Helper function to send push notification
const sendPushNotification = async (deviceTokens, title, body, data = {}) => {
  try {
    // This would integrate with Firebase Cloud Messaging or similar service
    logger.info('Sending push notification:', {
      deviceTokens: deviceTokens.length,
      title,
      body,
      data
    });
    
    // Mock implementation - in production, you would use FCM or similar
    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    logger.error('Push notification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to send email notification
const sendEmailNotification = async (email, subject, template, data = {}) => {
  try {
    // This would integrate with your email service (SendGrid, AWS SES, etc.)
    logger.info('Sending email notification:', {
      email,
      subject,
      template,
      data
    });
    
    // Mock implementation - in production, you would use your email service
    return {
      success: true,
      messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    logger.error('Email notification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to send SMS notification
const sendSMSNotification = async (phone, message) => {
  try {
    // This would integrate with your SMS service (Twilio, AWS SNS, etc.)
    logger.info('Sending SMS notification:', {
      phone,
      message
    });
    
    // Mock implementation - in production, you would use your SMS service
    return {
      success: true,
      messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    logger.error('SMS notification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// @route   POST /notifications/push
// @desc    Send push notification to partner
// @access  Private
router.post('/push', [
  body('partnerId').notEmpty().withMessage('Partner ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('body').notEmpty().withMessage('Body is required'),
  body('data').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId, title, body, data = {} } = req.body;

    // Find partner
    const partner = await PartnerUser.findByPartnerId(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Check if partner has push notifications enabled
    if (!partner.notificationPreferences.push) {
      return res.status(400).json({
        success: false,
        message: 'Partner has push notifications disabled'
      });
    }

    // Get device tokens
    const deviceTokens = partner.deviceTokens.map(dt => dt.token);
    if (deviceTokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No device tokens found for partner'
      });
    }

    // Send push notification
    const result = await sendPushNotification(deviceTokens, title, body, data);

    if (result.success) {
      res.json({
        success: true,
        message: 'Push notification sent successfully',
        data: {
          messageId: result.messageId,
          deviceCount: deviceTokens.length
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send push notification',
        error: result.error
      });
    }

  } catch (error) {
    logger.error('Send push notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /notifications/email
// @desc    Send email notification to partner
// @access  Private
router.post('/email', [
  body('partnerId').notEmpty().withMessage('Partner ID is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('template').notEmpty().withMessage('Template is required'),
  body('data').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId, subject, template, data = {} } = req.body;

    // Find partner
    const partner = await PartnerUser.findByPartnerId(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Check if partner has email notifications enabled
    if (!partner.notificationPreferences.email) {
      return res.status(400).json({
        success: false,
        message: 'Partner has email notifications disabled'
      });
    }

    // Send email notification
    const result = await sendEmailNotification(partner.email, subject, template, data);

    if (result.success) {
      res.json({
        success: true,
        message: 'Email notification sent successfully',
        data: {
          messageId: result.messageId,
          email: partner.email
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email notification',
        error: result.error
      });
    }

  } catch (error) {
    logger.error('Send email notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /notifications/sms
// @desc    Send SMS notification to partner
// @access  Private
router.post('/sms', [
  body('partnerId').notEmpty().withMessage('Partner ID is required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId, message } = req.body;

    // Find partner
    const partner = await PartnerUser.findByPartnerId(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Check if partner has SMS notifications enabled
    if (!partner.notificationPreferences.sms) {
      return res.status(400).json({
        success: false,
        message: 'Partner has SMS notifications disabled'
      });
    }

    // Send SMS notification
    const result = await sendSMSNotification(partner.phone, message);

    if (result.success) {
      res.json({
        success: true,
        message: 'SMS notification sent successfully',
        data: {
          messageId: result.messageId,
          phone: partner.phone
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send SMS notification',
        error: result.error
      });
    }

  } catch (error) {
    logger.error('Send SMS notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /notifications/multi
// @desc    Send multiple types of notifications
// @access  Private
router.post('/multi', [
  body('partnerId').notEmpty().withMessage('Partner ID is required'),
  body('types').isArray().withMessage('Types must be an array'),
  body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId, types, content } = req.body;

    // Find partner
    const partner = await PartnerUser.findByPartnerId(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const results = {
      push: null,
      email: null,
      sms: null
    };

    // Send push notification
    if (types.includes('push') && partner.notificationPreferences.push) {
      const deviceTokens = partner.deviceTokens.map(dt => dt.token);
      if (deviceTokens.length > 0) {
        results.push = await sendPushNotification(
          deviceTokens,
          content.title || 'Clutch Notification',
          content.body || content.message,
          content.data
        );
      }
    }

    // Send email notification
    if (types.includes('email') && partner.notificationPreferences.email) {
      results.email = await sendEmailNotification(
        partner.email,
        content.subject || content.title || 'Clutch Notification',
        content.template || 'default',
        content.data
      );
    }

    // Send SMS notification
    if (types.includes('sms') && partner.notificationPreferences.sms) {
      results.sms = await sendSMSNotification(
        partner.phone,
        content.message || content.body || 'Clutch Notification'
      );
    }

    const successCount = Object.values(results).filter(result => result && result.success).length;

    res.json({
      success: successCount > 0,
      message: `Notifications sent via ${successCount} channel(s)`,
      data: results
    });

  } catch (error) {
    logger.error('Send multi notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /notifications/order-status
// @desc    Send order status notification
// @access  Private
router.post('/order-status', [
  body('partnerId').notEmpty().withMessage('Partner ID is required'),
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('status').notEmpty().withMessage('Status is required'),
  body('customerName').notEmpty().withMessage('Customer name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId, orderId, status, customerName, estimatedTime } = req.body;

    // Find partner
    const partner = await PartnerUser.findByPartnerId(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const statusMessages = {
      'acknowledged': `Order #${orderId} has been acknowledged by ${partner.businessName}`,
      'preparing': `Order #${orderId} is being prepared by ${partner.businessName}`,
      'ready': `Order #${orderId} is ready for pickup from ${partner.businessName}`,
      'picked_up': `Order #${orderId} has been picked up from ${partner.businessName}`,
      'delivered': `Order #${orderId} has been delivered by ${partner.businessName}`,
      'cancelled': `Order #${orderId} has been cancelled`
    };

    const title = 'Order Status Update';
    const body = statusMessages[status] || `Order #${orderId} status updated to ${status}`;
    
    if (estimatedTime && status === 'acknowledged') {
      body += `. Estimated completion time: ${estimatedTime}`;
    }

    const notificationData = {
      type: 'order_status_update',
      orderId,
      status,
      partnerId,
      customerName,
      estimatedTime
    };

    // Send notifications
    const results = {
      push: null,
      email: null,
      sms: null
    };

    // Send push notification
    if (partner.notificationPreferences.push) {
      const deviceTokens = partner.deviceTokens.map(dt => dt.token);
      if (deviceTokens.length > 0) {
        results.push = await sendPushNotification(deviceTokens, title, body, notificationData);
      }
    }

    // Send email notification
    if (partner.notificationPreferences.email) {
      results.email = await sendEmailNotification(
        partner.email,
        title,
        'order_status_update',
        notificationData
      );
    }

    // Send SMS notification for critical status updates
    if (partner.notificationPreferences.sms && ['ready', 'cancelled'].includes(status)) {
      results.sms = await sendSMSNotification(partner.phone, body);
    }

    res.json({
      success: true,
      message: 'Order status notification sent',
      data: results
    });

  } catch (error) {
    logger.error('Send order status notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /notifications/payment-status
// @desc    Send payment status notification
// @access  Private
router.post('/payment-status', [
  body('partnerId').notEmpty().withMessage('Partner ID is required'),
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('paymentStatus').notEmpty().withMessage('Payment status is required'),
  body('amount').isNumeric().withMessage('Amount is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId, orderId, paymentStatus, amount, paymentMethod } = req.body;

    // Find partner
    const partner = await PartnerUser.findByPartnerId(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const statusMessages = {
      'paid': `Payment of ${amount} EGP received for order #${orderId}`,
      'rejected': `Payment of ${amount} EGP was rejected for order #${orderId}`,
      'failed': `Payment of ${amount} EGP failed for order #${orderId}`,
      'refunded': `Payment of ${amount} EGP has been refunded for order #${orderId}`
    };

    const title = 'Payment Status Update';
    const body = statusMessages[paymentStatus] || `Payment status updated for order #${orderId}`;
    
    if (paymentMethod) {
      body += ` (${paymentMethod})`;
    }

    const notificationData = {
      type: 'payment_status_update',
      orderId,
      paymentStatus,
      amount,
      paymentMethod,
      partnerId
    };

    // Send notifications
    const results = {
      push: null,
      email: null,
      sms: null
    };

    // Send push notification
    if (partner.notificationPreferences.push) {
      const deviceTokens = partner.deviceTokens.map(dt => dt.token);
      if (deviceTokens.length > 0) {
        results.push = await sendPushNotification(deviceTokens, title, body, notificationData);
      }
    }

    // Send email notification
    if (partner.notificationPreferences.email) {
      results.email = await sendEmailNotification(
        partner.email,
        title,
        'payment_status_update',
        notificationData
      );
    }

    // Send SMS notification for payment rejections
    if (partner.notificationPreferences.sms && paymentStatus === 'rejected') {
      results.sms = await sendSMSNotification(partner.phone, body);
    }

    res.json({
      success: true,
      message: 'Payment status notification sent',
      data: results
    });

  } catch (error) {
    logger.error('Send payment status notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /notifications/new-order
// @desc    Send new order notification
// @access  Private
router.post('/new-order', [
  body('partnerId').notEmpty().withMessage('Partner ID is required'),
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('serviceName').notEmpty().withMessage('Service name is required'),
  body('total').isNumeric().withMessage('Total amount is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId, orderId, customerName, serviceName, total, priority } = req.body;

    // Find partner
    const partner = await PartnerUser.findByPartnerId(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const title = priority === 'high' ? '🚨 URGENT: New Order' : 'New Order Received';
    const body = `New order #${orderId} from ${customerName} for ${serviceName} - ${total} EGP`;

    const notificationData = {
      type: 'new_order',
      orderId,
      customerName,
      serviceName,
      total,
      priority,
      partnerId
    };

    // Send notifications
    const results = {
      push: null,
      email: null,
      sms: null
    };

    // Send push notification
    if (partner.notificationPreferences.push) {
      const deviceTokens = partner.deviceTokens.map(dt => dt.token);
      if (deviceTokens.length > 0) {
        results.push = await sendPushNotification(deviceTokens, title, body, notificationData);
      }
    }

    // Send email notification
    if (partner.notificationPreferences.email) {
      results.email = await sendEmailNotification(
        partner.email,
        title,
        'new_order',
        notificationData
      );
    }

    // Send SMS notification for urgent orders
    if (partner.notificationPreferences.sms && priority === 'high') {
      results.sms = await sendSMSNotification(partner.phone, body);
    }

    res.json({
      success: true,
      message: 'New order notification sent',
      data: results
    });

  } catch (error) {
    logger.error('Send new order notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /notifications/payout
// @desc    Send payout notification
// @access  Private
router.post('/payout', [
  body('partnerId').notEmpty().withMessage('Partner ID is required'),
  body('amount').isNumeric().withMessage('Amount is required'),
  body('period').notEmpty().withMessage('Period is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId, amount, period, transactionId } = req.body;

    // Find partner
    const partner = await PartnerUser.findByPartnerId(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const title = 'Payout Processed';
    const body = `Your weekly payout of ${amount} EGP for ${period} has been processed${transactionId ? ` (Transaction ID: ${transactionId})` : ''}`;

    const notificationData = {
      type: 'payout_processed',
      amount,
      period,
      transactionId,
      partnerId
    };

    // Send notifications
    const results = {
      push: null,
      email: null,
      sms: null
    };

    // Send push notification
    if (partner.notificationPreferences.push) {
      const deviceTokens = partner.deviceTokens.map(dt => dt.token);
      if (deviceTokens.length > 0) {
        results.push = await sendPushNotification(deviceTokens, title, body, notificationData);
      }
    }

    // Send email notification
    if (partner.notificationPreferences.email) {
      results.email = await sendEmailNotification(
        partner.email,
        title,
        'payout_processed',
        notificationData
      );
    }

    // Send SMS notification
    if (partner.notificationPreferences.sms) {
      results.sms = await sendSMSNotification(partner.phone, body);
    }

    res.json({
      success: true,
      message: 'Payout notification sent',
      data: results
    });

  } catch (error) {
    logger.error('Send payout notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /notifications/history/:partnerId
// @desc    Get notification history for partner
// @access  Private
router.get('/history/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    // Build query
    const query = { partnerId };
    if (type) {
      query.type = type;
    }

    // Get notification history
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get notification history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { 
        status: 'read',
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });

  } catch (error) {
    logger.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /notifications/device-token
// @desc    Register device token for push notifications
// @access  Private
router.post('/device-token', auth, [
  body('token').notEmpty().withMessage('Device token is required'),
  body('platform').isIn(['android', 'ios']).withMessage('Platform must be android or ios')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { token, platform } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Check if token already exists
    const existingToken = partner.deviceTokens.find(dt => dt.token === token);
    if (existingToken) {
      // Update last used
      existingToken.lastUsed = new Date();
    } else {
      // Add new token
      partner.deviceTokens.push({
        token,
        platform,
        lastUsed: new Date()
      });
    }

    await partner.save();

    res.json({
      success: true,
      message: 'Device token registered successfully',
      data: {
        tokenCount: partner.deviceTokens.length
      }
    });

  } catch (error) {
    logger.error('Register device token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /notifications/device-token
// @desc    Remove device token
// @access  Private
router.delete('/device-token', auth, [
  body('token').notEmpty().withMessage('Device token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { token } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Remove token
    partner.deviceTokens = partner.deviceTokens.filter(dt => dt.token !== token);
    await partner.save();

    res.json({
      success: true,
      message: 'Device token removed successfully',
      data: {
        tokenCount: partner.deviceTokens.length
      }
    });

  } catch (error) {
    logger.error('Remove device token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /notifications/preferences
// @desc    Get notification preferences
// @access  Private
router.get('/preferences', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.json({
      success: true,
      data: {
        preferences: partner.notificationPreferences
      }
    });

  } catch (error) {
    logger.error('Get notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /notifications/preferences
// @desc    Update notification preferences
// @access  Private
router.patch('/preferences', auth, [
  body('preferences').isObject().withMessage('Preferences must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { preferences } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Update preferences
    Object.assign(partner.notificationPreferences, preferences);
    await partner.save();

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: {
        preferences: partner.notificationPreferences
      }
    });

  } catch (error) {
    logger.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
