const { logger } = require('../config/logger');

class MobileNotificationService {
  constructor() {
    this.dbService = require('./databaseService');
  }

  /**
   * Register device token for push notifications
   */
  async registerDeviceToken(userId, deviceToken, platform) {
    try {
      if (!deviceToken || !platform) {
        throw new Error('Device token and platform are required');
      }

      if (!['ios', 'android'].includes(platform)) {
        throw new Error('Platform must be ios or android');
      }

      // Check if token already exists for this user
      const existingToken = await this.dbService.findOne('deviceTokens', {
        userId,
        deviceToken
      });

      if (existingToken) {
        // Update existing token
        await this.dbService.updateOne('deviceTokens',
          { _id: existingToken._id },
          {
            platform,
            isActive: true,
            lastUsed: new Date(),
            updatedAt: new Date()
          }
        );
      } else {
        // Create new token
        await this.dbService.create('deviceTokens', {
          userId,
          deviceToken,
          platform,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Also update user's device tokens array
      await this.dbService.updateOne('users',
        { _id: userId },
        {
          $addToSet: { deviceTokens: deviceToken },
          updatedAt: new Date()
        }
      );

      return {
        success: true,
        message: 'Device token registered successfully'
      };
    } catch (error) {
      logger.error('Register device token error:', error);
      throw error;
    }
  }

  /**
   * Unregister device token
   */
  async unregisterDeviceToken(userId, deviceToken) {
    try {
      // Remove from device tokens collection
      await this.dbService.updateOne('deviceTokens',
        { userId, deviceToken },
        {
          isActive: false,
          updatedAt: new Date()
        }
      );

      // Remove from user's device tokens array
      await this.dbService.updateOne('users',
        { _id: userId },
        {
          $pull: { deviceTokens: deviceToken },
          updatedAt: new Date()
        }
      );

      return {
        success: true,
        message: 'Device token unregistered successfully'
      };
    } catch (error) {
      logger.error('Unregister device token error:', error);
      throw error;
    }
  }

  /**
   * Get notification history for user
   */
  async getNotificationHistory(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const notifications = await this.dbService.find('notifications', {
        userId
      }, {
        sort: { createdAt: -1 },
        skip,
        limit
      });

      const total = await this.dbService.count('notifications', { userId });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get notification history error:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId, preferences) {
    try {
      const validPreferences = {
        bookingUpdates: preferences.bookingUpdates,
        promotions: preferences.promotions,
        reminders: preferences.reminders,
        chatMessages: preferences.chatMessages,
        systemNotifications: preferences.systemNotifications,
        emailNotifications: preferences.emailNotifications,
        smsNotifications: preferences.smsNotifications
      };

      // Remove undefined values
      Object.keys(validPreferences).forEach(key => {
        if (validPreferences[key] === undefined) {
          delete validPreferences[key];
        }
      });

      validPreferences.updatedAt = new Date();

      await this.dbService.updateOne('users',
        { _id: userId },
        { notificationPreferences: validPreferences }
      );

      return {
        success: true,
        message: 'Notification preferences updated successfully',
        preferences: validPreferences
      };
    } catch (error) {
      logger.error('Update notification preferences error:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(userId) {
    try {
      const user = await this.dbService.findOne('users', { _id: userId });
      
      return user.notificationPreferences || {
        bookingUpdates: true,
        promotions: true,
        reminders: true,
        chatMessages: true,
        systemNotifications: true,
        emailNotifications: true,
        smsNotifications: true
      };
    } catch (error) {
      logger.error('Get notification preferences error:', error);
      throw error;
    }
  }

  /**
   * Send push notification to user
   */
  async sendPushNotification(userId, notification) {
    try {
      const { title, body, data, image, sound, badge } = notification;

      if (!title || !body) {
        throw new Error('Title and body are required');
      }

      // Get user's device tokens
      const deviceTokens = await this.getUserDeviceTokens(userId);
      
      if (deviceTokens.length === 0) {
        logger.warn(`No device tokens found for user ${userId}`);
        return { success: false, message: 'No device tokens found' };
      }

      // Get user's notification preferences
      const preferences = await this.getPreferences(userId);

      // Check if user has disabled this type of notification
      if (data?.type && preferences[`${data.type}Notifications`] === false) {
        return { success: false, message: 'Notification type disabled by user' };
      }

      // Send to each platform
      const results = {
        ios: [],
        android: []
      };

      for (const token of deviceTokens) {
        try {
          const result = await this.sendToDevice(token, {
            title,
            body,
            data: data || {},
            image,
            sound: sound || 'default',
            badge: badge || 1
          });

          results[token.platform].push({
            token: token.deviceToken,
            success: result.success,
            message: result.message
          });
        } catch (error) {
          logger.error(`Failed to send notification to token ${token.deviceToken}:`, error);
          results[token.platform].push({
            token: token.deviceToken,
            success: false,
            message: error.message
          });
        }
      }

      // Store notification in database
      await this.storeNotification(userId, {
        title,
        body,
        data,
        type: data?.type || 'general',
        sentAt: new Date()
      });

      return {
        success: true,
        message: 'Push notifications sent',
        results
      };
    } catch (error) {
      logger.error('Send push notification error:', error);
      throw error;
    }
  }

  /**
   * Send notification to specific device
   */
  async sendToDevice(deviceToken, notification) {
    try {
      // This would integrate with Firebase Cloud Messaging
      // For now, simulate the API call
      
      const fcmPayload = {
        to: deviceToken.deviceToken,
        notification: {
          title: notification.title,
          body: notification.body,
          image: notification.image
        },
        data: notification.data,
        android: {
          notification: {
            sound: notification.sound,
            priority: 'high',
            channel_id: 'clutch_notifications'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: notification.sound,
              badge: notification.badge
            }
          }
        }
      };

      // Simulate FCM API call
      // const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(fcmPayload)
      // });

      // For now, return success
      return {
        success: true,
        message: 'Notification sent successfully'
      };
    } catch (error) {
      logger.error('Send to device error:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendBulkNotification(userIds, notification) {
    try {
      const results = [];

      for (const userId of userIds) {
        try {
          const result = await this.sendPushNotification(userId, notification);
          results.push({
            userId,
            success: result.success,
            message: result.message
          });
        } catch (error) {
          results.push({
            userId,
            success: false,
            message: error.message
          });
        }
      }

      return {
        success: true,
        message: 'Bulk notifications sent',
        results
      };
    } catch (error) {
      logger.error('Send bulk notification error:', error);
      throw error;
    }
  }

  /**
   * Send topic-based notification
   */
  async sendTopicNotification(topic, notification) {
    try {
      // This would integrate with Firebase Cloud Messaging topics
      // For now, simulate the API call
      
      const fcmPayload = {
        to: `/topics/${topic}`,
        notification: {
          title: notification.title,
          body: notification.body,
          image: notification.image
        },
        data: notification.data
      };

      // Simulate FCM API call
      // const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(fcmPayload)
      // });

      return {
        success: true,
        message: 'Topic notification sent successfully'
      };
    } catch (error) {
      logger.error('Send topic notification error:', error);
      throw error;
    }
  }

  /**
   * Subscribe user to topic
   */
  async subscribeToTopic(userId, topic) {
    try {
      const deviceTokens = await this.getUserDeviceTokens(userId);
      
      if (deviceTokens.length === 0) {
        throw new Error('No device tokens found for user');
      }

      const tokens = deviceTokens.map(token => token.deviceToken);

      // This would integrate with Firebase Cloud Messaging
      // For now, simulate the API call
      
      // const response = await fetch('https://iid.googleapis.com/iid/v1:batchAdd', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     to: `/topics/${topic}`,
      //     registration_tokens: tokens
      //   })
      // });

      // Store topic subscription
      await this.dbService.updateOne('users',
        { _id: userId },
        {
          $addToSet: { subscribedTopics: topic },
          updatedAt: new Date()
        }
      );

      return {
        success: true,
        message: `Subscribed to topic: ${topic}`
      };
    } catch (error) {
      logger.error('Subscribe to topic error:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe user from topic
   */
  async unsubscribeFromTopic(userId, topic) {
    try {
      const deviceTokens = await this.getUserDeviceTokens(userId);
      
      if (deviceTokens.length === 0) {
        throw new Error('No device tokens found for user');
      }

      const tokens = deviceTokens.map(token => token.deviceToken);

      // This would integrate with Firebase Cloud Messaging
      // For now, simulate the API call
      
      // const response = await fetch('https://iid.googleapis.com/iid/v1:batchRemove', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     to: `/topics/${topic}`,
      //     registration_tokens: tokens
      //   })
      // });

      // Remove topic subscription
      await this.dbService.updateOne('users',
        { _id: userId },
        {
          $pull: { subscribedTopics: topic },
          updatedAt: new Date()
        }
      );

      return {
        success: true,
        message: `Unsubscribed from topic: ${topic}`
      };
    } catch (error) {
      logger.error('Unsubscribe from topic error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      await this.dbService.updateOne('notifications',
        { _id: notificationId, userId },
        {
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date()
        }
      );

      return {
        success: true,
        message: 'Notification marked as read'
      };
    } catch (error) {
      logger.error('Mark notification as read error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    try {
      await this.dbService.updateMany('notifications',
        { userId, isRead: false },
        {
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date()
        }
      );

      return {
        success: true,
        message: 'All notifications marked as read'
      };
    } catch (error) {
      logger.error('Mark all notifications as read error:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    try {
      await this.dbService.deleteOne('notifications', {
        _id: notificationId,
        userId
      });

      return {
        success: true,
        message: 'Notification deleted'
      };
    } catch (error) {
      logger.error('Delete notification error:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    try {
      const count = await this.dbService.count('notifications', {
        userId,
        isRead: false
      });

      return count;
    } catch (error) {
      logger.error('Get unread count error:', error);
      throw error;
    }
  }

  // Helper methods

  /**
   * Get user's active device tokens
   */
  async getUserDeviceTokens(userId) {
    try {
      const tokens = await this.dbService.find('deviceTokens', {
        userId,
        isActive: true
      });

      return tokens;
    } catch (error) {
      logger.error('Get user device tokens error:', error);
      return [];
    }
  }

  /**
   * Store notification in database
   */
  async storeNotification(userId, notification) {
    try {
      await this.dbService.create('notifications', {
        userId,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        type: notification.type,
        isRead: false,
        sentAt: notification.sentAt,
        createdAt: new Date()
      });
    } catch (error) {
      logger.error('Store notification error:', error);
    }
  }

  /**
   * Clean up invalid device tokens
   */
  async cleanupInvalidTokens() {
    try {
      // This would check for invalid tokens and remove them
      // For now, just log the cleanup
      logger.info('Cleaning up invalid device tokens');
      
      // In production, you would:
      // 1. Get all device tokens
      // 2. Test them with FCM
      // 3. Remove invalid ones
      // 4. Update user records
    } catch (error) {
      logger.error('Cleanup invalid tokens error:', error);
    }
  }
}

module.exports = new MobileNotificationService();
