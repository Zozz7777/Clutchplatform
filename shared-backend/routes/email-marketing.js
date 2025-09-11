const express = require('express');
const router = express.Router();
const { logger } = require('../config/logger');
const { initializeTransporter, sendTestEmail } = require('../config/email-config');
const EmailMarketingService = require('../services/email-marketing-service');

// Initialize email marketing service
const emailMarketingService = new EmailMarketingService();

// Initialize service on startup
(async () => {
  try {
    // Check if email credentials are properly configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || 
        process.env.SMTP_USER === 'test@clutch.com' || 
        process.env.SMTP_PASS === 'your-app-password-here') {
      logger.warn('⚠️ Email Marketing Service disabled - SMTP credentials not configured');
      return;
    }
    
    await emailMarketingService.initialize();
    await initializeTransporter();
    logger.info('✅ Email Marketing Service routes initialized');
  } catch (error) {
    logger.warn('⚠️ Email Marketing Service disabled - initialization failed:', error.message);
  }
})();

// ==================== CAMPAIGN MANAGEMENT ROUTES ====================

// Create a new campaign
router.post('/campaigns', async (req, res) => {
  try {
    const result = await emailMarketingService.createCampaign(req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const { getCollection } = require('../config/database');
    const campaignsCollection = await getCollection('email_campaigns');
    
    const campaigns = await campaignsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.status(200).json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    logger.error('Error getting campaigns:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get campaign by ID
router.get('/campaigns/:campaignId', async (req, res) => {
  try {
    const { getCollection } = require('../config/database');
    const campaignsCollection = await getCollection('email_campaigns');
    
    const campaign = await campaignsCollection.findOne({ _id: req.params.campaignId });
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    logger.error('Error getting campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Send campaign
router.post('/campaigns/:campaignId/send', async (req, res) => {
  try {
    const result = await emailMarketingService.sendCampaign(req.params.campaignId, req.body);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error sending campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update campaign
router.put('/campaigns/:campaignId', async (req, res) => {
  try {
    const { getCollection } = require('../config/database');
    const campaignsCollection = await getCollection('email_campaigns');
    
    const result = await campaignsCollection.updateOne(
      { _id: req.params.campaignId },
      { 
        $set: { 
          ...req.body,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { campaignId: req.params.campaignId }
    });
  } catch (error) {
    logger.error('Error updating campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete campaign
router.delete('/campaigns/:campaignId', async (req, res) => {
  try {
    const { getCollection } = require('../config/database');
    const campaignsCollection = await getCollection('email_campaigns');
    
    const result = await campaignsCollection.deleteOne({ _id: req.params.campaignId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { campaignId: req.params.campaignId }
    });
  } catch (error) {
    logger.error('Error deleting campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ==================== SUBSCRIBER MANAGEMENT ROUTES ====================

// Add subscriber
router.post('/subscribers', async (req, res) => {
  try {
    const result = await emailMarketingService.addSubscriber(req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error adding subscriber:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all subscribers
router.get('/subscribers', async (req, res) => {
  try {
    const { getCollection } = require('../config/database');
    const subscribersCollection = await getCollection('email_subscribers');
    
    const { page = 1, limit = 50, status, segment } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status) query.status = status;
    if (segment) query.segments = segment;
    
    const subscribers = await subscribersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await subscribersCollection.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        subscribers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting subscribers:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get subscriber by ID
router.get('/subscribers/:subscriberId', async (req, res) => {
  try {
    const { getCollection } = require('../config/database');
    const subscribersCollection = await getCollection('email_subscribers');
    
    const subscriber = await subscribersCollection.findOne({ _id: req.params.subscriberId });
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        error: 'Subscriber not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: subscriber
    });
  } catch (error) {
    logger.error('Error getting subscriber:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update subscriber
router.put('/subscribers/:subscriberId', async (req, res) => {
  try {
    const result = await emailMarketingService.updateSubscriber(req.params.subscriberId, req.body);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error updating subscriber:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Unsubscribe subscriber
router.post('/subscribers/unsubscribe', async (req, res) => {
  try {
    const { email, reason } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    const result = await emailMarketingService.unsubscribeSubscriber(email, reason);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error unsubscribing subscriber:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Bulk import subscribers
router.post('/subscribers/bulk-import', async (req, res) => {
  try {
    const { subscribers, segments = [] } = req.body;
    
    if (!subscribers || !Array.isArray(subscribers)) {
      return res.status(400).json({
        success: false,
        error: 'Subscribers array is required'
      });
    }
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const subscriberData of subscribers) {
      const result = await emailMarketingService.addSubscriber({
        ...subscriberData,
        segments: [...(subscriberData.segments || []), ...segments]
      });
      
      results.push(result);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        total: subscribers.length,
        successful: successCount,
        failed: errorCount,
        results
      }
    });
  } catch (error) {
    logger.error('Error bulk importing subscribers:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ==================== AUTOMATION ROUTES ====================

// Create automation
router.post('/automations', async (req, res) => {
  try {
    const result = await emailMarketingService.createAutomation(req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error creating automation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all automations
router.get('/automations', async (req, res) => {
  try {
    const { getCollection } = require('../config/database');
    const automationsCollection = await getCollection('email_automations');
    
    const automations = await automationsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.status(200).json({
      success: true,
      data: automations
    });
  } catch (error) {
    logger.error('Error getting automations:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Trigger automation
router.post('/automations/:automationId/trigger', async (req, res) => {
  try {
    const result = await emailMarketingService.triggerAutomation(req.params.automationId, req.body);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error triggering automation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ==================== SEGMENT ROUTES ====================

// Create segment
router.post('/segments', async (req, res) => {
  try {
    const result = await emailMarketingService.createSegment(req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error creating segment:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all segments
router.get('/segments', async (req, res) => {
  try {
    const { getCollection } = require('../config/database');
    const segmentsCollection = await getCollection('email_segments');
    
    const segments = await segmentsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.status(200).json({
      success: true,
      data: segments
    });
  } catch (error) {
    logger.error('Error getting segments:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get segment subscribers
router.get('/segments/:segmentId/subscribers', async (req, res) => {
  try {
    const subscribers = await emailMarketingService.getSubscribersBySegments([req.params.segmentId]);
    
    res.status(200).json({
      success: true,
      data: {
        segmentId: req.params.segmentId,
        subscribers,
        count: subscribers.length
      }
    });
  } catch (error) {
    logger.error('Error getting segment subscribers:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ==================== ANALYTICS ROUTES ====================

// Get campaign analytics
router.get('/analytics/campaigns/:campaignId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateRange = {};
    
    if (startDate) dateRange.start = startDate;
    if (endDate) dateRange.end = endDate;
    
    const result = await emailMarketingService.getCampaignAnalytics(req.params.campaignId, dateRange);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error getting campaign analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get subscriber analytics
router.get('/analytics/subscribers/:subscriberId', async (req, res) => {
  try {
    const result = await emailMarketingService.getSubscriberAnalytics(req.params.subscriberId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error getting subscriber analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Track engagement
router.post('/track', async (req, res) => {
  try {
    const result = await emailMarketingService.trackEngagement(req.body);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error tracking engagement:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ==================== UTILITY ROUTES ====================

// Send test email
router.post('/test', async (req, res) => {
  try {
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Recipient email is required'
      });
    }
    
    const result = await sendTestEmail(to);
    
    res.status(200).json({
      success: true,
      data: {
        messageId: result.messageId,
        message: 'Test email sent successfully'
      }
    });
  } catch (error) {
    logger.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test email: ' + error.message
    });
  }
});

// Preview email template
router.post('/preview', async (req, res) => {
  try {
    const { templateType, data } = req.body;
    
    if (!templateType) {
      return res.status(400).json({
        success: false,
        error: 'Template type is required'
      });
    }
    
    const htmlContent = emailMarketingService.templateGenerator.generateTemplate(templateType, data || {});
    
    res.status(200).json({
      success: true,
      data: {
        html: htmlContent,
        templateType,
        data
      }
    });
  } catch (error) {
    logger.error('Error previewing email template:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get available templates
router.get('/templates', (req, res) => {
  try {
    const templates = emailMarketingService.templateGenerator.config.templates;
    
    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    logger.error('Error getting templates:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get service status
router.get('/status', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        service: 'Email Marketing Service',
        status: 'operational',
        initialized: emailMarketingService.isInitialized,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting service status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
