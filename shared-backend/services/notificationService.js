const { messaging, firestore } = require('../config/firebase-admin');
const { v4: uuidv4 } = require('uuid');

/**
 * Push Notification Service
 * Handles FCM messaging, topic subscriptions, and notification management
 */
class NotificationService {
  constructor() {
    this.db = firestore;
  }

  /**
   * Send push notification to a specific device
   * @param {string} token - FCM token
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   * @returns {Object} Send result
   */
  async sendToDevice(token, notification, data = {}) {
    try {
      const message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
          ...notification
        },
        data: {
          ...data,
          timestamp: Date.now().toString(),
          messageId: uuidv4()
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'clutch-notifications',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await messaging.send(message);
      
      console.log(`✅ Push notification sent to device: ${response}`);
      
      // Save notification record to Firestore
      await this.saveNotificationRecord({
        type: 'device',
        target: token,
        notification,
        data,
        messageId: response,
        status: 'sent',
        sentAt: new Date()
      });

      return {
        success: true,
        messageId: response,
        message: 'Notification sent successfully'
      };

    } catch (error) {
      console.error('❌ Push notification error:', error);
      
      // Save failed notification record
      await this.saveNotificationRecord({
        type: 'device',
        target: token,
        notification,
        data,
        status: 'failed',
        error: error.message,
        failedAt: new Date()
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send push notification to multiple devices
   * @param {Array} tokens - Array of FCM tokens
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   * @returns {Object} Send result
   */
  async sendToMultipleDevices(tokens, notification, data = {}) {
    try {
      if (!Array.isArray(tokens) || tokens.length === 0) {
        return {
          success: false,
          error: 'No valid tokens provided'
        };
      }

      // Split tokens into chunks of 500 (FCM limit)
      const tokenChunks = this.chunkArray(tokens, 500);
      const results = [];

      for (const chunk of tokenChunks) {
        const message = {
          tokens: chunk,
          notification: {
            title: notification.title,
            body: notification.body,
            imageUrl: notification.imageUrl,
            ...notification
          },
          data: {
            ...data,
            timestamp: Date.now().toString(),
            messageId: uuidv4()
          },
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'clutch-notifications',
              priority: 'high',
              defaultSound: true,
              defaultVibrateTimings: true
            }
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1
              }
            }
          }
        };

        const response = await messaging.sendMulticast(message);
        
        results.push({
          successCount: response.successCount,
          failureCount: response.failureCount,
          responses: response.responses
        });

        console.log(`✅ Multicast notification sent: ${response.successCount} success, ${response.failureCount} failed`);
      }

      // Save notification record
      await this.saveNotificationRecord({
        type: 'multicast',
        target: tokens,
        notification,
        data,
        results,
        status: 'sent',
        sentAt: new Date()
      });

      return {
        success: true,
        results,
        totalTokens: tokens.length,
        message: 'Multicast notification sent successfully'
      };

    } catch (error) {
      console.error('❌ Multicast notification error:', error);
      
      await this.saveNotificationRecord({
        type: 'multicast',
        target: tokens,
        notification,
        data,
        status: 'failed',
        error: error.message,
        failedAt: new Date()
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send push notification to a topic
   * @param {string} topic - Topic name
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   * @returns {Object} Send result
   */
  async sendToTopic(topic, notification, data = {}) {
    try {
      const message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
          ...notification
        },
        data: {
          ...data,
          timestamp: Date.now().toString(),
          messageId: uuidv4()
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'clutch-notifications',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await messaging.send(message);
      
      console.log(`✅ Topic notification sent: ${topic}`);
      
      // Save notification record
      await this.saveNotificationRecord({
        type: 'topic',
        target: topic,
        notification,
        data,
        messageId: response,
        status: 'sent',
        sentAt: new Date()
      });

      return {
        success: true,
        messageId: response,
        topic,
        message: 'Topic notification sent successfully'
      };

    } catch (error) {
      console.error('❌ Topic notification error:', error);
      
      await this.saveNotificationRecord({
        type: 'topic',
        target: topic,
        notification,
        data,
        status: 'failed',
        error: error.message,
        failedAt: new Date()
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Subscribe device to a topic
   * @param {string|Array} tokens - FCM token(s)
   * @param {string} topic - Topic name
   * @returns {Object} Subscription result
   */
  async subscribeToTopic(tokens, topic) {
    try {
      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      
      if (tokenArray.length === 0) {
        return {
          success: false,
          error: 'No valid tokens provided'
        };
      }

      // Split tokens into chunks of 1000 (FCM limit)
      const tokenChunks = this.chunkArray(tokenArray, 1000);
      const results = [];

      for (const chunk of tokenChunks) {
        const response = await messaging.subscribeToTopic(chunk, topic);
        results.push(response);
      }

      console.log(`✅ Subscribed ${tokenArray.length} devices to topic: ${topic}`);
      
      // Save subscription record
      await this.saveSubscriptionRecord({
        tokens: tokenArray,
        topic,
        action: 'subscribe',
        status: 'success',
        timestamp: new Date()
      });

      return {
        success: true,
        topic,
        subscribedTokens: tokenArray.length,
        results,
        message: 'Successfully subscribed to topic'
      };

    } catch (error) {
      console.error('❌ Topic subscription error:', error);
      
      await this.saveSubscriptionRecord({
        tokens: Array.isArray(tokens) ? tokens : [tokens],
        topic,
        action: 'subscribe',
        status: 'failed',
        error: error.message,
        timestamp: new Date()
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Unsubscribe device from a topic
   * @param {string|Array} tokens - FCM token(s)
   * @param {string} topic - Topic name
   * @returns {Object} Unsubscription result
   */
  async unsubscribeFromTopic(tokens, topic) {
    try {
      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      
      if (tokenArray.length === 0) {
        return {
          success: false,
          error: 'No valid tokens provided'
        };
      }

      // Split tokens into chunks of 1000 (FCM limit)
      const tokenChunks = this.chunkArray(tokenArray, 1000);
      const results = [];

      for (const chunk of tokenChunks) {
        const response = await messaging.unsubscribeFromTopic(chunk, topic);
        results.push(response);
      }

      console.log(`✅ Unsubscribed ${tokenArray.length} devices from topic: ${topic}`);
      
      // Save unsubscription record
      await this.saveSubscriptionRecord({
        tokens: tokenArray,
        topic,
        action: 'unsubscribe',
        status: 'success',
        timestamp: new Date()
      });

      return {
        success: true,
        topic,
        unsubscribedTokens: tokenArray.length,
        results,
        message: 'Successfully unsubscribed from topic'
      };

    } catch (error) {
      console.error('❌ Topic unsubscription error:', error);
      
      await this.saveSubscriptionRecord({
        tokens: Array.isArray(tokens) ? tokens : [tokens],
        topic,
        action: 'unsubscribe',
        status: 'failed',
        error: error.message,
        timestamp: new Date()
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send conditional notification
   * @param {Object} condition - FCM condition
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   * @returns {Object} Send result
   */
  async sendConditional(condition, notification, data = {}) {
    try {
      const message = {
        condition,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
          ...notification
        },
        data: {
          ...data,
          timestamp: Date.now().toString(),
          messageId: uuidv4()
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'clutch-notifications',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await messaging.send(message);
      
      console.log(`✅ Conditional notification sent: ${condition}`);
      
      // Save notification record
      await this.saveNotificationRecord({
        type: 'conditional',
        target: condition,
        notification,
        data,
        messageId: response,
        status: 'sent',
        sentAt: new Date()
      });

      return {
        success: true,
        messageId: response,
        condition,
        message: 'Conditional notification sent successfully'
      };

    } catch (error) {
      console.error('❌ Conditional notification error:', error);
      
      await this.saveNotificationRecord({
        type: 'conditional',
        target: condition,
        notification,
        data,
        status: 'failed',
        error: error.message,
        failedAt: new Date()
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Save notification record to Firestore
   * @param {Object} record - Notification record
   */
  async saveNotificationRecord(record) {
    try {
      await this.db.collection('notifications').add({
        ...record,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('❌ Error saving notification record:', error);
    }
  }

  /**
   * Save subscription record to Firestore
   * @param {Object} record - Subscription record
   */
  async saveSubscriptionRecord(record) {
    try {
      await this.db.collection('subscriptions').add({
        ...record,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('❌ Error saving subscription record:', error);
    }
  }

  /**
   * Get notification history for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of notifications to retrieve
   * @returns {Object} Notification history
   */
  async getNotificationHistory(userId, limit = 50) {
    try {
      const snapshot = await this.db
        .collection('notifications')
        .where('target', '==', userId)
        .orderBy('sentAt', 'desc')
        .limit(limit)
        .get();

      const notifications = [];
      snapshot.forEach(doc => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        notifications,
        count: notifications.length
      };

    } catch (error) {
      console.error('❌ Error getting notification history:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID
   * @returns {Object} Update result
   */
  async markNotificationAsRead(notificationId, userId) {
    try {
      await this.db
        .collection('notifications')
        .doc(notificationId)
        .update({
          readBy: firestore.FieldValue.arrayUnion(userId),
          readAt: firestore.FieldValue.arrayUnion(new Date())
        });

      return {
        success: true,
        message: 'Notification marked as read'
      };

    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Helper function to chunk array
   * @param {Array} array - Array to chunk
   * @param {number} size - Chunk size
   * @returns {Array} Chunked array
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get FCM token info
   * @param {string} token - FCM token
   * @returns {Object} Token info
   */
  async getTokenInfo(token) {
    try {
      const response = await messaging.getTokenInfo(token);
      return {
        success: true,
        tokenInfo: response
      };
    } catch (error) {
      console.error('❌ Error getting token info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate FCM token
   * @param {string} token - FCM token
   * @returns {Object} Validation result
   */
  async validateToken(token) {
    try {
      const tokenInfo = await messaging.getTokenInfo(token);
      return {
        success: true,
        valid: true,
        tokenInfo
      };
    } catch (error) {
      return {
        success: true,
        valid: false,
        error: error.message
      };
    }
  }
}

module.exports = new NotificationService();
