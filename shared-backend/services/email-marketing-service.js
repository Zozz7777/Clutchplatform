const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');
const { EMAIL_CONFIG, getTransporter, sendTestEmail } = require('../config/email-config');
const { EmailTemplateGenerator } = require('./email-template-generator');

class EmailMarketingService {
  constructor() {
    this.templateGenerator = new EmailTemplateGenerator(EMAIL_CONFIG);
    this.isInitialized = false;
  }

  // Initialize the service
  async initialize() {
    try {
      await this.createDatabaseIndexes();
      this.isInitialized = true;
      logger.info('✅ Email Marketing Service initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Email Marketing Service:', error);
      throw error;
    }
  }

  // Create database indexes for performance
  async createDatabaseIndexes() {
    const collections = [
      'email_campaigns',
      'email_subscribers',
      'email_automations',
      'email_engagement',
      'email_segments',
      'email_analytics'
    ];

    for (const collectionName of collections) {
      const collection = await getCollection(collectionName);
      
      // Create indexes based on collection type
      switch (collectionName) {
        case 'email_campaigns':
          await collection.createIndex({ status: 1, scheduledAt: 1 });
          await collection.createIndex({ createdAt: -1 });
          break;
        case 'email_subscribers':
          await collection.createIndex({ email: 1 }, { unique: true });
          await collection.createIndex({ status: 1, segments: 1 });
          await collection.createIndex({ lastEngagement: -1 });
          break;
        case 'email_automations':
          await collection.createIndex({ status: 1, triggerType: 1 });
          await collection.createIndex({ nextExecution: 1 });
          break;
        case 'email_engagement':
          await collection.createIndex({ subscriberId: 1, campaignId: 1 });
          await collection.createIndex({ eventType: 1, timestamp: -1 });
          break;
        case 'email_segments':
          await collection.createIndex({ name: 1 });
          await collection.createIndex({ criteria: 1 });
          break;
        case 'email_analytics':
          await collection.createIndex({ campaignId: 1, date: -1 });
          await collection.createIndex({ eventType: 1, date: -1 });
          break;
      }
    }
  }

  // ==================== CAMPAIGN MANAGEMENT ====================

  // Create a new email campaign
  async createCampaign(campaignData) {
    try {
      const {
        name,
        subject,
        templateType,
        content,
        targetSegments,
        scheduledAt,
        senderName,
        senderEmail,
        tags = []
      } = campaignData;

      const campaign = {
        name,
        subject,
        templateType,
        content,
        targetSegments: targetSegments || [],
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        senderName: senderName || EMAIL_CONFIG.sender.name,
        senderEmail: senderEmail || EMAIL_CONFIG.sender.email,
        tags,
        status: 'draft',
        stats: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          unsubscribed: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const campaignsCollection = await getCollection('email_campaigns');
      const result = await campaignsCollection.insertOne(campaign);

      logger.info(`✅ Campaign created: ${result.insertedId}`);
      return {
        success: true,
        data: { campaignId: result.insertedId, ...campaign }
      };
    } catch (error) {
      logger.error('❌ Error creating campaign:', error);
      return { success: false, error: error.message };
    }
  }

  // Send a campaign
  async sendCampaign(campaignId, options = {}) {
    try {
      const campaignsCollection = await getCollection('email_campaigns');
      const campaign = await campaignsCollection.findOne({ _id: campaignId });

      if (!campaign) {
        return { success: false, error: 'Campaign not found' };
      }

      if (campaign.status === 'sent') {
        return { success: false, error: 'Campaign already sent' };
      }

      // Get subscribers based on target segments
      const subscribers = await this.getSubscribersBySegments(campaign.targetSegments);
      
      if (subscribers.length === 0) {
        return { success: false, error: 'No subscribers found for target segments' };
      }

      // Update campaign status
      await campaignsCollection.updateOne(
        { _id: campaignId },
        { 
          $set: { 
            status: 'sending',
            sentAt: new Date(),
            updatedAt: new Date()
          }
        }
      );

      // Send emails in batches
      const batchSize = 50;
      const batches = this.chunkArray(subscribers, batchSize);
      let totalSent = 0;

      for (const batch of batches) {
        const promises = batch.map(subscriber => 
          this.sendEmailToSubscriber(campaign, subscriber, campaignId)
        );
        
        const results = await Promise.allSettled(promises);
        totalSent += results.filter(r => r.status === 'fulfilled').length;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Update campaign with final stats
      await campaignsCollection.updateOne(
        { _id: campaignId },
        { 
          $set: { 
            status: 'sent',
            'stats.sent': totalSent,
            updatedAt: new Date()
          }
        }
      );

      logger.info(`✅ Campaign sent: ${campaignId}, ${totalSent} emails sent`);
      return {
        success: true,
        data: { campaignId, totalSent, totalSubscribers: subscribers.length }
      };
    } catch (error) {
      logger.error('❌ Error sending campaign:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== SUBSCRIBER MANAGEMENT ====================

  // Add a new subscriber
  async addSubscriber(subscriberData) {
    try {
      const {
        email,
        firstName,
        lastName,
        phone,
        segments = [],
        tags = [],
        metadata = {},
        source = 'manual'
      } = subscriberData;

      const subscriber = {
        email: email.toLowerCase(),
        firstName,
        lastName,
        phone,
        segments,
        tags,
        metadata,
        source,
        status: 'active',
        engagementScore: 0,
        lastEngagement: null,
        subscribedAt: new Date(),
        updatedAt: new Date()
      };

      const subscribersCollection = await getCollection('email_subscribers');
      
      // Check if subscriber already exists
      const existing = await subscribersCollection.findOne({ email: subscriber.email });
      if (existing) {
        return { success: false, error: 'Subscriber already exists' };
      }

      const result = await subscribersCollection.insertOne(subscriber);
      
      logger.info(`✅ Subscriber added: ${subscriber.email}`);
      return {
        success: true,
        data: { subscriberId: result.insertedId, ...subscriber }
      };
    } catch (error) {
      logger.error('❌ Error adding subscriber:', error);
      return { success: false, error: error.message };
    }
  }

  // Update subscriber
  async updateSubscriber(subscriberId, updateData) {
    try {
      const subscribersCollection = await getCollection('email_subscribers');
      
      const result = await subscribersCollection.updateOne(
        { _id: subscriberId },
        { 
          $set: { 
            ...updateData,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return { success: false, error: 'Subscriber not found' };
      }

      logger.info(`✅ Subscriber updated: ${subscriberId}`);
      return { success: true, data: { subscriberId } };
    } catch (error) {
      logger.error('❌ Error updating subscriber:', error);
      return { success: false, error: error.message };
    }
  }

  // Unsubscribe subscriber
  async unsubscribeSubscriber(email, reason = 'manual') {
    try {
      const subscribersCollection = await getCollection('email_subscribers');
      
      const result = await subscribersCollection.updateOne(
        { email: email.toLowerCase() },
        { 
          $set: { 
            status: 'unsubscribed',
            unsubscribedAt: new Date(),
            unsubscribeReason: reason,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return { success: false, error: 'Subscriber not found' };
      }

      logger.info(`✅ Subscriber unsubscribed: ${email}`);
      return { success: true, data: { email } };
    } catch (error) {
      logger.error('❌ Error unsubscribing subscriber:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== AUTOMATION WORKFLOWS ====================

  // Create automation workflow
  async createAutomation(automationData) {
    try {
      const {
        name,
        description,
        triggerType,
        triggerConditions,
        steps,
        targetSegments,
        status = 'active'
      } = automationData;

      const automation = {
        name,
        description,
        triggerType, // 'event', 'time', 'segment'
        triggerConditions,
        steps, // Array of automation steps
        targetSegments,
        status,
        stats: {
          triggered: 0,
          completed: 0,
          failed: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const automationsCollection = await getCollection('email_automations');
      const result = await automationsCollection.insertOne(automation);

      logger.info(`✅ Automation created: ${result.insertedId}`);
      return {
        success: true,
        data: { automationId: result.insertedId, ...automation }
      };
    } catch (error) {
      logger.error('❌ Error creating automation:', error);
      return { success: false, error: error.message };
    }
  }

  // Trigger automation
  async triggerAutomation(automationId, triggerData) {
    try {
      const automationsCollection = await getCollection('email_automations');
      const automation = await automationsCollection.findOne({ _id: automationId });

      if (!automation || automation.status !== 'active') {
        return { success: false, error: 'Automation not found or inactive' };
      }

      // Get subscribers for this automation
      const subscribers = await this.getSubscribersBySegments(automation.targetSegments);
      
      // Execute automation steps
      for (const step of automation.steps) {
        await this.executeAutomationStep(step, subscribers, triggerData);
      }

      // Update automation stats
      await automationsCollection.updateOne(
        { _id: automationId },
        { 
          $inc: { 'stats.triggered': 1 },
          $set: { updatedAt: new Date() }
        }
      );

      logger.info(`✅ Automation triggered: ${automationId}`);
      return {
        success: true,
        data: { automationId, subscribersCount: subscribers.length }
      };
    } catch (error) {
      logger.error('❌ Error triggering automation:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== CUSTOMER SEGMENTATION ====================

  // Create customer segment
  async createSegment(segmentData) {
    try {
      const {
        name,
        description,
        criteria,
        tags = []
      } = segmentData;

      const segment = {
        name,
        description,
        criteria, // Array of filter criteria
        tags,
        subscriberCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const segmentsCollection = await getCollection('email_segments');
      const result = await segmentsCollection.insertOne(segment);

      // Update subscriber count
      await this.updateSegmentSubscriberCount(result.insertedId);

      logger.info(`✅ Segment created: ${result.insertedId}`);
      return {
        success: true,
        data: { segmentId: result.insertedId, ...segment }
      };
    } catch (error) {
      logger.error('❌ Error creating segment:', error);
      return { success: false, error: error.message };
    }
  }

  // Get subscribers by segments
  async getSubscribersBySegments(segmentIds) {
    try {
      const segmentsCollection = await getCollection('email_segments');
      const subscribersCollection = await getCollection('email_subscribers');

      const segments = await segmentsCollection.find({ _id: { $in: segmentIds } }).toArray();
      
      let query = { status: 'active' };
      
      if (segments.length > 0) {
        const segmentCriteria = segments.map(segment => segment.criteria).flat();
        query = this.buildSegmentQuery(segmentCriteria);
      }

      const subscribers = await subscribersCollection.find(query).toArray();
      return subscribers;
    } catch (error) {
      logger.error('❌ Error getting subscribers by segments:', error);
      return [];
    }
  }

  // ==================== ENGAGEMENT TRACKING ====================

  // Track email engagement
  async trackEngagement(eventData) {
    try {
      const {
        subscriberId,
        campaignId,
        eventType, // 'open', 'click', 'bounce', 'unsubscribe'
        eventData: additionalData = {},
        timestamp = new Date()
      } = eventData;

      const engagement = {
        subscriberId,
        campaignId,
        eventType,
        eventData: additionalData,
        timestamp,
        createdAt: new Date()
      };

      const engagementCollection = await getCollection('email_engagement');
      await engagementCollection.insertOne(engagement);

      // Update subscriber engagement score
      await this.updateSubscriberEngagementScore(subscriberId, eventType);

      // Update campaign stats
      if (campaignId) {
        await this.updateCampaignStats(campaignId, eventType);
      }

      logger.info(`✅ Engagement tracked: ${eventType} for subscriber ${subscriberId}`);
      return { success: true };
    } catch (error) {
      logger.error('❌ Error tracking engagement:', error);
      return { success: false, error: error.message };
    }
  }

  // Update subscriber engagement score
  async updateSubscriberEngagementScore(subscriberId, eventType) {
    try {
      const subscribersCollection = await getCollection('email_subscribers');
      
      const scoreIncrement = this.getEngagementScore(eventType);
      
      await subscribersCollection.updateOne(
        { _id: subscriberId },
        { 
          $inc: { engagementScore: scoreIncrement },
          $set: { 
            lastEngagement: new Date(),
            updatedAt: new Date()
          }
        }
      );
    } catch (error) {
      logger.error('❌ Error updating engagement score:', error);
    }
  }

  // ==================== ANALYTICS & REPORTING ====================

  // Get campaign analytics
  async getCampaignAnalytics(campaignId, dateRange = {}) {
    try {
      const analyticsCollection = await getCollection('email_analytics');
      
      const query = { campaignId };
      if (dateRange.start) query.date = { $gte: new Date(dateRange.start) };
      if (dateRange.end) query.date = { ...query.date, $lte: new Date(dateRange.end) };

      const analytics = await analyticsCollection.find(query).toArray();
      
      return {
        success: true,
        data: this.calculateAnalytics(analytics)
      };
    } catch (error) {
      logger.error('❌ Error getting campaign analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // Get subscriber analytics
  async getSubscriberAnalytics(subscriberId) {
    try {
      const engagementCollection = await getCollection('email_engagement');
      const subscribersCollection = await getCollection('email_subscribers');

      const subscriber = await subscribersCollection.findOne({ _id: subscriberId });
      const engagement = await engagementCollection.find({ subscriberId }).toArray();

      return {
        success: true,
        data: {
          subscriber,
          engagement: this.aggregateEngagement(engagement)
        }
      };
    } catch (error) {
      logger.error('❌ Error getting subscriber analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== HELPER METHODS ====================

  // Update segment subscriber count
  async updateSegmentSubscriberCount(segmentId) {
    try {
      const segmentsCollection = await getCollection('email_segments');
      const subscribersCollection = await getCollection('email_subscribers');
      
      const segment = await segmentsCollection.findOne({ _id: segmentId });
      if (!segment) return;
      
      const query = this.buildSegmentQuery(segment.criteria);
      const count = await subscribersCollection.countDocuments(query);
      
      await segmentsCollection.updateOne(
        { _id: segmentId },
        { 
          $set: { 
            subscriberCount: count,
            lastUpdated: new Date()
          }
        }
      );
    } catch (error) {
      logger.error('❌ Error updating segment subscriber count:', error);
    }
  }

  // Update campaign stats
  async updateCampaignStats(campaignId, eventType) {
    try {
      const campaignsCollection = await getCollection('email_campaigns');
      
      const updateField = `stats.${eventType}`;
      await campaignsCollection.updateOne(
        { _id: campaignId },
        { $inc: { [updateField]: 1 } }
      );
    } catch (error) {
      logger.error('❌ Error updating campaign stats:', error);
    }
  }

  // Send automation email
  async sendAutomationEmail(step, subscribers, triggerData) {
    try {
      const transporter = getTransporter();
      
      for (const subscriber of subscribers) {
        const htmlContent = this.templateGenerator.generateTemplate(
          step.templateType,
          { ...step.content, ...subscriber, ...triggerData }
        );

        const mailOptions = {
          from: `"${EMAIL_CONFIG.sender.name}" <${EMAIL_CONFIG.sender.email}>`,
          to: subscriber.email,
          subject: step.subject || EMAIL_CONFIG.templates[step.templateType]?.subject,
          html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        
        // Track delivery
        await this.trackEngagement({
          subscriberId: subscriber._id,
          eventType: 'delivered',
          eventData: { automation: true }
        });
      }
    } catch (error) {
      logger.error('❌ Error sending automation email:', error);
    }
  }

  // Update subscribers in batch
  async updateSubscribersInBatch(subscribers, updates) {
    try {
      const subscribersCollection = await getCollection('email_subscribers');
      
      const subscriberIds = subscribers.map(s => s._id);
      await subscribersCollection.updateMany(
        { _id: { $in: subscriberIds } },
        { 
          $set: { 
            ...updates,
            updatedAt: new Date()
          }
        }
      );
    } catch (error) {
      logger.error('❌ Error updating subscribers in batch:', error);
    }
  }

  // Add subscribers to segment
  async addSubscribersToSegment(subscribers, segmentId) {
    try {
      const subscribersCollection = await getCollection('email_subscribers');
      
      const subscriberIds = subscribers.map(s => s._id);
      await subscribersCollection.updateMany(
        { _id: { $in: subscriberIds } },
        { 
          $addToSet: { segments: segmentId },
          $set: { updatedAt: new Date() }
        }
      );
    } catch (error) {
      logger.error('❌ Error adding subscribers to segment:', error);
    }
  }

  // Send email to individual subscriber
  async sendEmailToSubscriber(campaign, subscriber, campaignId) {
    try {
      const transporter = getTransporter();
      
      // Generate email content
      const htmlContent = this.templateGenerator.generateTemplate(
        campaign.templateType,
        { ...campaign.content, ...subscriber }
      );

      const mailOptions = {
        from: `"${campaign.senderName}" <${campaign.senderEmail}>`,
        to: subscriber.email,
        subject: campaign.subject,
        html: htmlContent,
        headers: {
          'X-Campaign-ID': campaignId,
          'X-Subscriber-ID': subscriber._id.toString(),
          'List-Unsubscribe': `<mailto:${EMAIL_CONFIG.sender.email}?subject=unsubscribe>`
        }
      };

      const result = await transporter.sendMail(mailOptions);
      
      // Track delivery
      await this.trackEngagement({
        subscriberId: subscriber._id,
        campaignId,
        eventType: 'delivered',
        eventData: { messageId: result.messageId }
      });

      return result;
    } catch (error) {
      logger.error(`❌ Error sending email to ${subscriber.email}:`, error);
      
      // Track bounce
      await this.trackEngagement({
        subscriberId: subscriber._id,
        campaignId,
        eventType: 'bounce',
        eventData: { error: error.message }
      });
      
      throw error;
    }
  }

  // Execute automation step
  async executeAutomationStep(step, subscribers, triggerData) {
    try {
      switch (step.type) {
        case 'send_email':
          await this.sendAutomationEmail(step, subscribers, triggerData);
          break;
        case 'wait':
          await this.wait(step.duration);
          break;
        case 'update_subscriber':
          await this.updateSubscribersInBatch(subscribers, step.updates);
          break;
        case 'add_to_segment':
          await this.addSubscribersToSegment(subscribers, step.segmentId);
          break;
        default:
          logger.warn(`Unknown automation step type: ${step.type}`);
      }
    } catch (error) {
      logger.error('❌ Error executing automation step:', error);
    }
  }

  // Build segment query from criteria
  buildSegmentQuery(criteria) {
    const query = { status: 'active' };
    
    criteria.forEach(criterion => {
      switch (criterion.field) {
        case 'segments':
          query.segments = { $in: criterion.value };
          break;
        case 'tags':
          query.tags = { $in: criterion.value };
          break;
        case 'engagementScore':
          query.engagementScore = { [criterion.operator]: criterion.value };
          break;
        case 'lastEngagement':
          query.lastEngagement = { [criterion.operator]: new Date(criterion.value) };
          break;
        case 'subscribedAt':
          query.subscribedAt = { [criterion.operator]: new Date(criterion.value) };
          break;
      }
    });
    
    return query;
  }

  // Get engagement score for event type
  getEngagementScore(eventType) {
    const scores = {
      'open': 5,
      'click': 10,
      'delivered': 1,
      'bounce': -5,
      'unsubscribe': -20,
      'spam': -10
    };
    return scores[eventType] || 0;
  }

  // Utility methods
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  calculateAnalytics(analytics) {
    // Implementation for calculating analytics from raw data
    return {
      total: analytics.length,
      byEventType: analytics.reduce((acc, item) => {
        acc[item.eventType] = (acc[item.eventType] || 0) + 1;
        return acc;
      }, {})
    };
  }

  aggregateEngagement(engagement) {
    return engagement.reduce((acc, item) => {
      acc[item.eventType] = (acc[item.eventType] || 0) + 1;
      return acc;
    }, {});
  }
}

module.exports = EmailMarketingService;
