const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const auth = require('../middleware/auth');
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

    const successCount = Object.values(results).filter(r => r && r.success).length;
    const totalRequested = types.length;

    res.json({
      success: successCount > 0,
      message: `Sent ${successCount} out of ${totalRequested} notifications`,
      data: {
        results,
        successCount,
        totalRequested
      }
    });

  } catch (error) {
    logger.error('Send multi notification error:', error);
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
