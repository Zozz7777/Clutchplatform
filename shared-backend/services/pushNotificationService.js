const { messaging } = require('../config/firebase-admin');
const { logger } = require('../config/logger');
const { firestore } = require('../config/firebase-admin');
const { v4: uuidv4 } = require('uuid');

/**
 * Enhanced Push Notification Service with Firebase Integration
 * Provides comprehensive notification management with analytics and tracking
 */
class EnhancedPushNotificationService {
  constructor() {
    this.db = firestore;
    this.collections = {
      notifications: 'push_notifications',
      campaigns: 'notification_campaigns',
      analytics: 'notification_analytics',
      devices: 'device_tokens',
      topics: 'notification_topics'
    };
  }

  /**
   * Send notification to a single device with enhanced tracking
   * @param {string} fcmToken - FCM device token
   * @param {string} notificationType - Type of notification
   * @param {Object} customData - Custom notification data
   * @returns {Object} Send result
   */
  async sendToDevice(fcmToken, notificationType, customData = {}) {
    const notificationId = uuidv4();
    const timestamp = new Date();

    try {
      if (!fcmToken) {
        logger.warn('No FCM token provided for notification');
        return { success: false, error: 'No FCM token provided' };
      }

      const template = this.getNotificationTemplate(notificationType);
      if (!template) {
        logger.error(`Unknown notification type: ${notificationType}`);
        return { success: false, error: 'Unknown notification type' };
      }

      // Log notification attempt
      await this.logNotificationAttempt({
        notificationId,
        type: 'device',
        target: fcmToken,
        notificationType,
        customData,
        timestamp
      });

      const message = {
        token: fcmToken,
        notification: {
          title: customData.title || template.title,
          body: customData.body || template.body,
          icon: template.icon || process.env.FCM_DEFAULT_ICON,
          color: template.color || process.env.FCM_DEFAULT_COLOR,
          imageUrl: customData.imageUrl || template.imageUrl
        },
        data: {
          type: notificationType,
          notificationId,
          timestamp: timestamp.toISOString(),
          ...customData.data
        },
        android: {
          notification: {
            sound: template.sound || 'default',
            priority: 'high',
            channelId: 'clutch_notifications',
            clickAction: customData.clickAction || 'FLUTTER_NOTIFICATION_CLICK',
            color: template.color || process.env.FCM_DEFAULT_COLOR,
            icon: template.icon || process.env.FCM_DEFAULT_ICON,
            tag: notificationType
          }
        },
        apns: {
          payload: {
            aps: {
              sound: template.sound || 'default',
              badge: 1,
              category: notificationType,
              'mutable-content': 1
            }
          },
          headers: {
            'apns-priority': '10'
          }
        }
      };

      const response = await messaging.send(message);
      
      // Log successful notification
      await this.logNotificationSuccess({
        notificationId,
        messageId: response,
        type: 'device',
        target: fcmToken,
        notificationType,
        customData,
        timestamp
      });

      logger.info(`Notification sent successfully: ${response} to token: ${fcmToken}`);
      
      return {
        success: true,
        notificationId,
        messageId: response,
        fcmToken: fcmToken
      };
    } catch (error) {
      // Log failed notification
      await this.logNotificationFailure({
        notificationId,
        type: 'device',
        target: fcmToken,
        notificationType,
        customData,
        error: error.message,
        timestamp
      });

      logger.error('Error sending notification to device:', error);
      return {
        success: false,
        error: error.message,
        fcmToken: fcmToken
      };
    }
  }

  /**
   * Send notification to multiple devices
   * @param {Array} fcmTokens - Array of FCM device tokens
   * @param {string} notificationType - Type of notification
   * @param {Object} customData - Custom notification data
   * @returns {Object} Send result
   */
  async sendToMultipleDevices(fcmTokens, notificationType, customData = {}) {
    const campaignId = uuidv4();
    const timestamp = new Date();

    try {
      if (!fcmTokens || fcmTokens.length === 0) {
        logger.warn('No FCM tokens provided for bulk notification');
        return { success: false, error: 'No FCM tokens provided' };
      }

      // Log campaign attempt
      await this.logCampaignAttempt({
        campaignId,
        type: 'multiple_devices',
        targets: fcmTokens,
        notificationType,
        customData,
        timestamp
      });

      const template = this.getNotificationTemplate(notificationType);
      if (!template) {
        throw new Error(`Unknown notification type: ${notificationType}`);
      }

      const message = {
        notification: {
          title: customData.title || template.title,
          body: customData.body || template.body,
          icon: template.icon || process.env.FCM_DEFAULT_ICON,
          color: template.color || process.env.FCM_DEFAULT_COLOR,
          imageUrl: customData.imageUrl || template.imageUrl
        },
        data: {
          type: notificationType,
          campaignId,
          timestamp: timestamp.toISOString(),
          ...customData.data
        },
        android: {
          notification: {
            sound: template.sound || 'default',
            priority: 'high',
            channelId: 'clutch_notifications',
            clickAction: customData.clickAction || 'FLUTTER_NOTIFICATION_CLICK',
            color: template.color || process.env.FCM_DEFAULT_COLOR,
            icon: template.icon || process.env.FCM_DEFAULT_ICON,
            tag: notificationType
          }
        },
        apns: {
          payload: {
            aps: {
              sound: template.sound || 'default',
              badge: 1,
              category: notificationType,
              'mutable-content': 1
            }
          },
          headers: {
            'apns-priority': '10'
          }
        }
      };

      const response = await messaging.sendMulticast({
        tokens: fcmTokens,
        ...message
      });

      // Log campaign results
      await this.logCampaignResults({
        campaignId,
        response,
        type: 'multiple_devices',
        targets: fcmTokens,
        notificationType,
        customData,
        timestamp
      });

      const successCount = response.successCount;
      const failureCount = response.failureCount;

      logger.info(`Bulk notification sent: ${successCount}/${fcmTokens.length} successful`);

      return {
        success: true,
        campaignId,
        totalSent: fcmTokens.length,
        successCount,
        failureCount,
        responses: response.responses
      };
    } catch (error) {
      // Log campaign failure
      await this.logCampaignFailure({
        campaignId,
        type: 'multiple_devices',
        targets: fcmTokens,
        notificationType,
        customData,
        error: error.message,
        timestamp
      });

      logger.error('Error sending bulk notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send notification to a topic
   * @param {string} topic - Topic name
   * @param {string} notificationType - Type of notification
   * @param {Object} customData - Custom notification data
   * @returns {Object} Send result
   */
  async sendToTopic(topic, notificationType, customData = {}) {
    const notificationId = uuidv4();
    const timestamp = new Date();

    try {
      const template = this.getNotificationTemplate(notificationType);
      if (!template) {
        throw new Error(`Unknown notification type: ${notificationType}`);
      }

      // Log topic notification attempt
      await this.logNotificationAttempt({
        notificationId,
        type: 'topic',
        target: topic,
        notificationType,
        customData,
        timestamp
      });

      const message = {
        topic: topic,
        notification: {
          title: customData.title || template.title,
          body: customData.body || template.body,
          icon: template.icon || process.env.FCM_DEFAULT_ICON,
          color: template.color || process.env.FCM_DEFAULT_COLOR,
          imageUrl: customData.imageUrl || template.imageUrl
        },
        data: {
          type: notificationType,
          notificationId,
          topic: topic,
          timestamp: timestamp.toISOString(),
          ...customData.data
        },
        android: {
          notification: {
            sound: template.sound || 'default',
            priority: 'high',
            channelId: 'clutch_notifications',
            clickAction: customData.clickAction || 'FLUTTER_NOTIFICATION_CLICK',
            color: template.color || process.env.FCM_DEFAULT_COLOR,
            icon: template.icon || process.env.FCM_DEFAULT_ICON,
            tag: notificationType
          }
        },
        apns: {
          payload: {
            aps: {
              sound: template.sound || 'default',
              badge: 1,
              category: notificationType,
              'mutable-content': 1
            }
          },
          headers: {
            'apns-priority': '10'
          }
        }
      };

      const response = await messaging.send(message);

      // Log successful topic notification
      await this.logNotificationSuccess({
        notificationId,
        messageId: response,
        type: 'topic',
        target: topic,
        notificationType,
        customData,
        timestamp
      });

      logger.info(`Topic notification sent successfully: ${response} to topic: ${topic}`);
      
      return {
        success: true,
        notificationId,
        messageId: response,
        topic: topic
      };
    } catch (error) {
      // Log failed topic notification
      await this.logNotificationFailure({
        notificationId,
        type: 'topic',
        target: topic,
        notificationType,
        customData,
        error: error.message,
        timestamp
      });

      logger.error('Error sending topic notification:', error);
      return {
        success: false,
        error: error.message,
        topic: topic
      };
    }
  }

  /**
   * Subscribe devices to a topic
   * @param {Array} fcmTokens - Array of FCM device tokens
   * @param {string} topic - Topic name
   * @returns {Object} Subscription result
   */
  async subscribeToTopic(fcmTokens, topic) {
    const subscriptionId = uuidv4();
    const timestamp = new Date();

    try {
      if (!fcmTokens || fcmTokens.length === 0) {
        return { success: false, error: 'No FCM tokens provided' };
      }

      // Log subscription attempt
      await this.logSubscriptionAttempt({
        subscriptionId,
        fcmTokens,
        topic,
        timestamp
      });

      const response = await messaging.subscribeToTopic(fcmTokens, topic);

      // Log subscription results
      await this.logSubscriptionResults({
        subscriptionId,
        response,
        fcmTokens,
        topic,
        timestamp
      });

      // Update topic record
      await this.updateTopicSubscribers(topic, fcmTokens, 'add');

      logger.info(`Topic subscription: ${response.successCount}/${fcmTokens.length} successful for topic: ${topic}`);

      return {
        success: true,
        subscriptionId,
        successCount: response.successCount,
        failureCount: response.failureCount,
        topic: topic
      };
    } catch (error) {
      // Log subscription failure
      await this.logSubscriptionFailure({
        subscriptionId,
        fcmTokens,
        topic,
        error: error.message,
        timestamp
      });

      logger.error('Error subscribing to topic:', error);
      return {
        success: false,
        error: error.message,
        topic: topic
      };
    }
  }

  /**
   * Unsubscribe devices from a topic
   * @param {Array} fcmTokens - Array of FCM device tokens
   * @param {string} topic - Topic name
   * @returns {Object} Unsubscription result
   */
  async unsubscribeFromTopic(fcmTokens, topic) {
    const unsubscriptionId = uuidv4();
    const timestamp = new Date();

    try {
      if (!fcmTokens || fcmTokens.length === 0) {
        return { success: false, error: 'No FCM tokens provided' };
      }

      const response = await messaging.unsubscribeFromTopic(fcmTokens, topic);

      // Update topic record
      await this.updateTopicSubscribers(topic, fcmTokens, 'remove');

      logger.info(`Topic unsubscription: ${response.successCount}/${fcmTokens.length} successful for topic: ${topic}`);

      return {
        success: true,
        unsubscriptionId,
        successCount: response.successCount,
        failureCount: response.failureCount,
        topic: topic
      };
    } catch (error) {
      logger.error('Error unsubscribing from topic:', error);
      return {
        success: false,
        error: error.message,
        topic: topic
      };
    }
  }

  /**
   * Get notification analytics
   * @param {Object} filters - Date range and other filters
   * @returns {Object} Notification analytics
   */
  async getNotificationAnalytics(filters = {}) {
    try {
      const { startDate, endDate, notificationType, targetType } = filters;
      
      let query = this.db.collection(this.collections.analytics);
      
      if (startDate && endDate) {
        query = query.where('timestamp', '>=', new Date(startDate))
                    .where('timestamp', '<=', new Date(endDate));
      }
      
      if (notificationType) {
        query = query.where('notificationType', '==', notificationType);
      }
      
      if (targetType) {
        query = query.where('type', '==', targetType);
      }

      const snapshot = await query.get();
      const notifications = [];
      
      snapshot.forEach(doc => {
        notifications.push({ id: doc.id, ...doc.data() });
      });

      // Calculate metrics
      const totalNotifications = notifications.length;
      const successfulNotifications = notifications.filter(n => n.status === 'success').length;
      const failedNotifications = notifications.filter(n => n.status === 'failed').length;
      const successRate = totalNotifications > 0 ? (successfulNotifications / totalNotifications) * 100 : 0;

      const notificationTypes = {};
      notifications.forEach(notification => {
        const type = notification.notificationType;
        notificationTypes[type] = (notificationTypes[type] || 0) + 1;
      });

      return {
        success: true,
        data: {
          totalNotifications,
          successfulNotifications,
          failedNotifications,
          successRate,
          notificationTypes,
          timeRange: { startDate, endDate }
        }
      };
    } catch (error) {
      logger.error('Error getting notification analytics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create notification campaign
   * @param {Object} campaignData - Campaign data
   * @returns {Object} Campaign creation result
   */
  async createNotificationCampaign(campaignData) {
    try {
      const campaignId = uuidv4();
      const timestamp = new Date();

      const campaign = {
        campaignId,
        name: campaignData.name,
        notificationType: campaignData.notificationType,
        title: campaignData.title,
        body: campaignData.body,
        targets: campaignData.targets || [], // fcmTokens or topics
        targetType: campaignData.targetType || 'devices', // devices, topics, or all
        scheduledAt: campaignData.scheduledAt,
        status: 'draft',
        createdAt: timestamp,
        createdBy: campaignData.createdBy,
        metadata: campaignData.metadata || {}
      };

      await this.db.collection(this.collections.campaigns).add(campaign);

      return {
        success: true,
        campaignId,
        message: 'Notification campaign created successfully'
      };
    } catch (error) {
      logger.error('Error creating notification campaign:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send notification campaign
   * @param {string} campaignId - Campaign ID
   * @returns {Object} Campaign send result
   */
  async sendNotificationCampaign(campaignId) {
    try {
      const campaignSnapshot = await this.db.collection(this.collections.campaigns)
        .where('campaignId', '==', campaignId)
        .get();

      if (campaignSnapshot.empty) {
        throw new Error('Campaign not found');
      }

      const campaign = campaignSnapshot.docs[0].data();
      let results = [];

      if (campaign.targetType === 'devices' || campaign.targetType === 'all') {
        const deviceResult = await this.sendToMultipleDevices(
          campaign.targets,
          campaign.notificationType,
          {
            title: campaign.title,
            body: campaign.body,
            data: campaign.metadata
          }
        );
        results.push(deviceResult);
      }

      if (campaign.targetType === 'topics' || campaign.targetType === 'all') {
        for (const topic of campaign.targets) {
          const topicResult = await this.sendToTopic(
            topic,
            campaign.notificationType,
            {
              title: campaign.title,
              body: campaign.body,
              data: campaign.metadata
            }
          );
          results.push(topicResult);
        }
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
        results: results
      };
    } catch (error) {
      logger.error('Error sending notification campaign:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper methods
  getNotificationTemplate(notificationType) {
    const templates = {
      booking_created: {
        title: 'New Booking Created',
        body: 'Your service booking has been created successfully!',
        sound: 'default',
        icon: 'notification_icon',
        color: '#4ECDC4'
      },
      booking_confirmed: {
        title: 'Booking Confirmed',
        body: 'Your service booking has been confirmed!',
        sound: 'default',
        icon: 'notification_icon',
        color: '#4ECDC4'
      },
      booking_started: {
        title: 'Service Started',
        body: 'Your mechanic has started working on your vehicle!',
        sound: 'default',
        icon: 'notification_icon',
        color: '#FF6B35'
      },
      booking_completed: {
        title: 'Service Completed',
        body: 'Your service has been completed successfully!',
        sound: 'default',
        icon: 'notification_icon',
        color: '#4ECDC4'
      },
      booking_cancelled: {
        title: 'Booking Cancelled',
        body: 'Your service booking has been cancelled.',
        sound: 'default',
        icon: 'notification_icon',
        color: '#FF6B35'
      },
      mechanic_assigned: {
        title: 'Mechanic Assigned',
        body: 'A mechanic has been assigned to your booking!',
        sound: 'default',
        icon: 'notification_icon',
        color: '#4ECDC4'
      },
      payment_success: {
        title: 'Payment Successful',
        body: 'Your payment has been processed successfully!',
        sound: 'default',
        icon: 'notification_icon',
        color: '#4ECDC4'
      },
      payment_failed: {
        title: 'Payment Failed',
        body: 'Your payment could not be processed. Please try again.',
        sound: 'default',
        icon: 'notification_icon',
        color: '#FF6B35'
      },
      payment_pending: {
        title: 'Payment Pending',
        body: 'Your payment is being processed. Please wait.',
        sound: 'default',
        icon: 'notification_icon',
        color: '#FFA500'
      },
      service_reminder: {
        title: 'Service Reminder',
        body: 'Don\'t forget your upcoming service appointment!',
        sound: 'default',
        icon: 'notification_icon',
        color: '#FFA500'
      },
      promotional: {
        title: 'Special Offer',
        body: 'You have a new promotional offer!',
        sound: 'default',
        icon: 'notification_icon',
        color: '#9C27B0'
      },
      system_alert: {
        title: 'System Alert',
        body: 'You have a new system notification!',
        sound: 'default',
        icon: 'notification_icon',
        color: '#FF6B35'
      }
    };

    return templates[notificationType] || templates.system_alert;
  }

  // Logging methods
  async logNotificationAttempt(data) {
    try {
      await this.db.collection(this.collections.analytics).add({
        ...data,
        status: 'attempt'
      });
    } catch (error) {
      logger.error('Error logging notification attempt:', error);
    }
  }

  async logNotificationSuccess(data) {
    try {
      await this.db.collection(this.collections.analytics).add({
        ...data,
        status: 'success'
      });
    } catch (error) {
      logger.error('Error logging notification success:', error);
    }
  }

  async logNotificationFailure(data) {
    try {
      await this.db.collection(this.collections.analytics).add({
        ...data,
        status: 'failed'
      });
    } catch (error) {
      logger.error('Error logging notification failure:', error);
    }
  }

  async logCampaignAttempt(data) {
    try {
      await this.db.collection(this.collections.campaigns).add({
        ...data,
        status: 'attempt'
      });
    } catch (error) {
      logger.error('Error logging campaign attempt:', error);
    }
  }

  async logCampaignResults(data) {
    try {
      await this.db.collection(this.collections.campaigns).add({
        ...data,
        status: 'completed'
      });
    } catch (error) {
      logger.error('Error logging campaign results:', error);
    }
  }

  async logCampaignFailure(data) {
    try {
      await this.db.collection(this.collections.campaigns).add({
        ...data,
        status: 'failed'
      });
    } catch (error) {
      logger.error('Error logging campaign failure:', error);
    }
  }

  async logSubscriptionAttempt(data) {
    try {
      await this.db.collection(this.collections.topics).add({
        ...data,
        action: 'subscribe_attempt'
      });
    } catch (error) {
      logger.error('Error logging subscription attempt:', error);
    }
  }

  async logSubscriptionResults(data) {
    try {
      await this.db.collection(this.collections.topics).add({
        ...data,
        action: 'subscribe_success'
      });
    } catch (error) {
      logger.error('Error logging subscription results:', error);
    }
  }

  async logSubscriptionFailure(data) {
    try {
      await this.db.collection(this.collections.topics).add({
        ...data,
        action: 'subscribe_failure'
      });
    } catch (error) {
      logger.error('Error logging subscription failure:', error);
    }
  }

  async updateTopicSubscribers(topic, fcmTokens, action) {
    try {
      const topicSnapshot = await this.db.collection(this.collections.topics)
        .where('topic', '==', topic)
        .get();

      if (topicSnapshot.empty) {
        // Create new topic record
        await this.db.collection(this.collections.topics).add({
          topic,
          subscribers: action === 'add' ? fcmTokens : [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Update existing topic record
        const doc = topicSnapshot.docs[0];
        const currentSubscribers = doc.data().subscribers || [];
        
        let newSubscribers;
        if (action === 'add') {
          newSubscribers = [...new Set([...currentSubscribers, ...fcmTokens])];
        } else {
          newSubscribers = currentSubscribers.filter(token => !fcmTokens.includes(token));
        }

        await doc.ref.update({
          subscribers: newSubscribers,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      logger.error('Error updating topic subscribers:', error);
    }
  }

  /**
   * Send booking notification
   * @param {Object} booking - Booking object
   * @param {string} notificationType - Type of notification
   * @param {Object} recipient - Recipient object (optional)
   * @returns {Object} Send result
   */
  async sendBookingNotification(booking, notificationType, recipient = null) {
    try {
      if (!booking) {
        logger.warn('No booking provided for notification');
        return { success: false, error: 'No booking provided' };
      }

      const template = this.getNotificationTemplate(notificationType);
      if (!template) {
        logger.error(`Unknown notification type: ${notificationType}`);
        return { success: false, error: 'Unknown notification type' };
      }

      // Determine recipient and their FCM token
      let fcmToken = null;
      let recipientName = 'User';

      if (recipient && recipient.fcmToken) {
        fcmToken = recipient.fcmToken;
        recipientName = `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || 'User';
      } else if (booking.client && booking.client.fcmToken) {
        fcmToken = booking.client.fcmToken;
        recipientName = `${booking.client.firstName || ''} ${booking.client.lastName || ''}`.trim() || 'Customer';
      } else if (booking.mechanic && booking.mechanic.fcmToken) {
        fcmToken = booking.mechanic.fcmToken;
        recipientName = `${booking.mechanic.firstName || ''} ${booking.mechanic.lastName || ''}`.trim() || 'Mechanic';
      }

      if (!fcmToken) {
        logger.warn(`No FCM token found for booking notification: ${booking._id}`);
        return { success: false, error: 'No FCM token available' };
      }

      // Customize notification based on booking data
      const customData = {
        title: template.title,
        body: template.body.replace('{bookingId}', booking._id.toString().slice(-6)),
        data: {
          bookingId: booking._id.toString(),
          notificationType,
          recipientName,
          serviceType: booking.serviceType,
          scheduledDate: booking.scheduledDate
        }
      };

      return await this.sendToDevice(fcmToken, notificationType, customData);
    } catch (error) {
      logger.error('Error sending booking notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send payment notification
   * @param {Object} payment - Payment object
   * @param {string} notificationType - Type of notification
   * @returns {Object} Send result
   */
  async sendPaymentNotification(payment, notificationType) {
    try {
      if (!payment) {
        logger.warn('No payment provided for notification');
        return { success: false, error: 'No payment provided' };
      }

      const template = this.getNotificationTemplate(notificationType);
      if (!template) {
        logger.error(`Unknown notification type: ${notificationType}`);
        return { success: false, error: 'Unknown notification type' };
      }

      // Get user FCM token from payment data
      let fcmToken = null;
      let recipientName = 'User';

      if (payment.user && payment.user.fcmToken) {
        fcmToken = payment.user.fcmToken;
        recipientName = `${payment.user.firstName || ''} ${payment.user.lastName || ''}`.trim() || 'User';
      } else if (payment.client && payment.client.fcmToken) {
        fcmToken = payment.client.fcmToken;
        recipientName = `${payment.client.firstName || ''} ${payment.client.lastName || ''}`.trim() || 'Customer';
      }

      if (!fcmToken) {
        logger.warn(`No FCM token found for payment notification: ${payment._id}`);
        return { success: false, error: 'No FCM token available' };
      }

      // Customize notification based on payment data
      const customData = {
        title: template.title,
        body: template.body,
        data: {
          paymentId: payment._id.toString(),
          notificationType,
          recipientName,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status
        }
      };

      return await this.sendToDevice(fcmToken, notificationType, customData);
    } catch (error) {
      logger.error('Error sending payment notification:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create enhanced notification service instance
const enhancedNotificationService = new EnhancedPushNotificationService();

// Notification types constants
const NOTIFICATION_TYPES = {
  BOOKING_CREATED: 'booking_created',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_STARTED: 'booking_started',
  BOOKING_COMPLETED: 'booking_completed',
  BOOKING_CANCELLED: 'booking_cancelled',
  MECHANIC_ASSIGNED: 'mechanic_assigned',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_PENDING: 'payment_pending',
  SERVICE_REMINDER: 'service_reminder',
  PROMOTIONAL: 'promotional',
  SYSTEM_ALERT: 'system_alert'
};

// Legacy functions for backward compatibility
const sendToDevice = async (fcmToken, notificationType, customData = {}) => {
  return await enhancedNotificationService.sendToDevice(fcmToken, notificationType, customData);
};

const sendToMultipleDevices = async (fcmTokens, notificationType, customData = {}) => {
  return await enhancedNotificationService.sendToMultipleDevices(fcmTokens, notificationType, customData);
};

const sendToTopic = async (topic, notificationType, customData = {}) => {
  return await enhancedNotificationService.sendToTopic(topic, notificationType, customData);
};

const subscribeToTopic = async (fcmTokens, topic) => {
  return await enhancedNotificationService.subscribeToTopic(fcmTokens, topic);
};

const unsubscribeFromTopic = async (fcmTokens, topic) => {
  return await enhancedNotificationService.unsubscribeFromTopic(fcmTokens, topic);
};

// Booking and payment notification functions
const sendBookingNotification = async (booking, notificationType, recipient = null) => {
  return await enhancedNotificationService.sendBookingNotification(booking, notificationType, recipient);
};

const sendPaymentNotification = async (payment, notificationType) => {
  return await enhancedNotificationService.sendPaymentNotification(payment, notificationType);
};

module.exports = {
  enhancedNotificationService,
  NOTIFICATION_TYPES,
  sendToDevice,
  sendToMultipleDevices,
  sendToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
  sendBookingNotification,
  sendPaymentNotification
};
