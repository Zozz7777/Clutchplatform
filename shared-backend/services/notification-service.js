const firebase = require('firebase-admin');
const { getDb } = require('../config/database');
const logger = require('../utils/logger');

class NotificationService {
    constructor() {
        this.db = null;
        this.initializeDatabase();
    }

    async initializeDatabase() {
        try {
            this.db = await getDb();
        } catch (error) {
            logger.error('Failed to initialize notification service database:', error);
        }
    }

    // Community Notifications
    async notifyNewTip(tipId, userId, tipTitle) {
        try {
            const notification = {
                userId: userId,
                type: 'community_tip_created',
                title: 'Tip Created Successfully',
                body: `Your tip "${tipTitle}" has been published and is now visible to the community.`,
                data: {
                    tipId: tipId,
                    action: 'view_tip'
                },
                createdAt: new Date(),
                isRead: false
            };

            await this.saveNotification(notification);
            await this.sendPushNotification(userId, notification);
            
            logger.info(`New tip notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Error sending new tip notification:', error);
        }
    }

    async notifyTipVoted(tipId, tipAuthorId, voterName, voteType) {
        try {
            const notification = {
                userId: tipAuthorId,
                type: 'tip_voted',
                title: 'Your Tip Received a Vote',
                body: `${voterName} ${voteType === 'up' ? 'liked' : 'disliked'} your tip.`,
                data: {
                    tipId: tipId,
                    action: 'view_tip'
                },
                createdAt: new Date(),
                isRead: false
            };

            await this.saveNotification(notification);
            await this.sendPushNotification(tipAuthorId, notification);
            
            logger.info(`Tip vote notification sent to user ${tipAuthorId}`);
        } catch (error) {
            logger.error('Error sending tip vote notification:', error);
        }
    }

    async notifyNewComment(tipId, tipAuthorId, commenterName, commentPreview) {
        try {
            const notification = {
                userId: tipAuthorId,
                type: 'tip_commented',
                title: 'New Comment on Your Tip',
                body: `${commenterName} commented: "${commentPreview}"`,
                data: {
                    tipId: tipId,
                    action: 'view_tip'
                },
                createdAt: new Date(),
                isRead: false
            };

            await this.saveNotification(notification);
            await this.sendPushNotification(tipAuthorId, notification);
            
            logger.info(`New comment notification sent to user ${tipAuthorId}`);
        } catch (error) {
            logger.error('Error sending new comment notification:', error);
        }
    }

    async notifyNewReview(partnerId, reviewTitle, rating) {
        try {
            // Get partner users to notify
            const partnerUsers = await this.getPartnerUsers(partnerId);
            
            for (const partnerUser of partnerUsers) {
                const notification = {
                    userId: partnerUser.userId,
                    type: 'new_review',
                    title: 'New Review Received',
                    body: `You received a ${rating}-star review: "${reviewTitle}"`,
                    data: {
                        partnerId: partnerId,
                        action: 'view_review'
                    },
                    createdAt: new Date(),
                    isRead: false
                };

                await this.saveNotification(notification);
                await this.sendPushNotification(partnerUser.userId, notification);
            }
            
            logger.info(`New review notifications sent to partner ${partnerId} users`);
        } catch (error) {
            logger.error('Error sending new review notification:', error);
        }
    }

    // Loyalty Notifications
    async notifyPointsEarned(userId, points, description, newBalance) {
        try {
            const notification = {
                userId: userId,
                type: 'points_earned',
                title: 'Points Earned!',
                body: `You earned ${points} points for ${description}. Total: ${newBalance} points.`,
                data: {
                    points: points,
                    newBalance: newBalance,
                    action: 'view_loyalty'
                },
                createdAt: new Date(),
                isRead: false
            };

            await this.saveNotification(notification);
            await this.sendPushNotification(userId, notification);
            
            logger.info(`Points earned notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Error sending points earned notification:', error);
        }
    }

    async notifyBadgeUnlocked(userId, badgeName, badgeDescription) {
        try {
            const notification = {
                userId: userId,
                type: 'badge_unlocked',
                title: 'New Badge Unlocked!',
                body: `Congratulations! You unlocked the "${badgeName}" badge: ${badgeDescription}`,
                data: {
                    badgeName: badgeName,
                    action: 'view_badges'
                },
                createdAt: new Date(),
                isRead: false
            };

            await this.saveNotification(notification);
            await this.sendPushNotification(userId, notification);
            
            logger.info(`Badge unlocked notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Error sending badge unlocked notification:', error);
        }
    }

    async notifyTierUpgrade(userId, newTier, pointsRequired) {
        try {
            const notification = {
                userId: userId,
                type: 'tier_upgrade',
                title: 'Tier Upgraded!',
                body: `Congratulations! You've been upgraded to ${newTier} tier. You now have access to exclusive rewards.`,
                data: {
                    newTier: newTier,
                    action: 'view_loyalty'
                },
                createdAt: new Date(),
                isRead: false
            };

            await this.saveNotification(notification);
            await this.sendPushNotification(userId, notification);
            
            logger.info(`Tier upgrade notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Error sending tier upgrade notification:', error);
        }
    }

    async notifyPointsExpiring(userId, expiringPoints, expiryDate) {
        try {
            const notification = {
                userId: userId,
                type: 'points_expiring',
                title: 'Points Expiring Soon',
                body: `You have ${expiringPoints} points expiring on ${expiryDate}. Redeem them now!`,
                data: {
                    expiringPoints: expiringPoints,
                    expiryDate: expiryDate,
                    action: 'view_loyalty'
                },
                createdAt: new Date(),
                isRead: false
            };

            await this.saveNotification(notification);
            await this.sendPushNotification(userId, notification);
            
            logger.info(`Points expiring notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Error sending points expiring notification:', error);
        }
    }

    async notifyRewardRedeemed(userId, rewardName, pointsUsed) {
        try {
            const notification = {
                userId: userId,
                type: 'reward_redeemed',
                title: 'Reward Redeemed',
                body: `You successfully redeemed "${rewardName}" for ${pointsUsed} points.`,
                data: {
                    rewardName: rewardName,
                    pointsUsed: pointsUsed,
                    action: 'view_rewards'
                },
                createdAt: new Date(),
                isRead: false
            };

            await this.saveNotification(notification);
            await this.sendPushNotification(userId, notification);
            
            logger.info(`Reward redeemed notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Error sending reward redeemed notification:', error);
        }
    }

    // General Notifications
    async notifyMaintenanceReminder(userId, carName, serviceType, dueDate) {
        try {
            const notification = {
                userId: userId,
                type: 'maintenance_reminder',
                title: 'Maintenance Reminder',
                body: `Your ${carName} needs ${serviceType}. Due: ${dueDate}`,
                data: {
                    carName: carName,
                    serviceType: serviceType,
                    dueDate: dueDate,
                    action: 'book_service'
                },
                createdAt: new Date(),
                isRead: false
            };

            await this.saveNotification(notification);
            await this.sendPushNotification(userId, notification);
            
            logger.info(`Maintenance reminder sent to user ${userId}`);
        } catch (error) {
            logger.error('Error sending maintenance reminder:', error);
        }
    }

    async notifyOrderUpdate(userId, orderId, status, message) {
        try {
            const notification = {
                userId: userId,
                type: 'order_update',
                title: 'Order Update',
                body: message,
                data: {
                    orderId: orderId,
                    status: status,
                    action: 'view_order'
                },
                createdAt: new Date(),
                isRead: false
            };

            await this.saveNotification(notification);
            await this.sendPushNotification(userId, notification);
            
            logger.info(`Order update notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Error sending order update notification:', error);
        }
    }

    // Helper Methods
    async saveNotification(notification) {
        try {
            if (!this.db) {
                await this.initializeDatabase();
            }
            
            const collection = this.db.collection('notifications');
            await collection.insertOne(notification);
        } catch (error) {
            logger.error('Error saving notification:', error);
        }
    }

    async sendPushNotification(userId, notification) {
        try {
            // Get user's device tokens
            const deviceTokens = await this.getUserDeviceTokens(userId);
            
            if (deviceTokens.length === 0) {
                logger.info(`No device tokens found for user ${userId}`);
                return;
            }

            // Check user's notification preferences
            const userPreferences = await this.getUserNotificationPreferences(userId);
            if (!this.shouldSendNotification(notification.type, userPreferences)) {
                logger.info(`Notification ${notification.type} disabled for user ${userId}`);
                return;
            }

            const message = {
                notification: {
                    title: notification.title,
                    body: notification.body
                },
                data: notification.data,
                tokens: deviceTokens
            };

            const response = await firebase.messaging().sendMulticast(message);
            logger.info(`Push notification sent to ${response.successCount} devices for user ${userId}`);
            
            // Handle failed tokens
            if (response.failureCount > 0) {
                await this.handleFailedTokens(userId, response.responses, deviceTokens);
            }
        } catch (error) {
            logger.error('Error sending push notification:', error);
        }
    }

    async getUserDeviceTokens(userId) {
        try {
            if (!this.db) {
                await this.initializeDatabase();
            }
            
            const collection = this.db.collection('device_tokens');
            const tokens = await collection.find({ userId: userId, isActive: true }).toArray();
            return tokens.map(token => token.token);
        } catch (error) {
            logger.error('Error getting user device tokens:', error);
            return [];
        }
    }

    async getUserNotificationPreferences(userId) {
        try {
            if (!this.db) {
                await this.initializeDatabase();
            }
            
            const collection = this.db.collection('users');
            const user = await collection.findOne({ _id: userId });
            return user?.preferences?.notifications || {};
        } catch (error) {
            logger.error('Error getting user notification preferences:', error);
            return {};
        }
    }

    shouldSendNotification(notificationType, preferences) {
        const typeMapping = {
            'community_tip_created': 'communityUpdates',
            'tip_voted': 'communityUpdates',
            'tip_commented': 'communityUpdates',
            'new_review': 'communityUpdates',
            'points_earned': 'loyaltyUpdates',
            'badge_unlocked': 'loyaltyUpdates',
            'tier_upgrade': 'loyaltyUpdates',
            'points_expiring': 'loyaltyUpdates',
            'reward_redeemed': 'loyaltyUpdates',
            'maintenance_reminder': 'maintenanceReminders',
            'order_update': 'orderUpdates'
        };

        const preferenceKey = typeMapping[notificationType];
        return preferences[preferenceKey] !== false;
    }

    async getPartnerUsers(partnerId) {
        try {
            if (!this.db) {
                await this.initializeDatabase();
            }
            
            const collection = this.db.collection('partner_users');
            return await collection.find({ partnerId: partnerId, isActive: true }).toArray();
        } catch (error) {
            logger.error('Error getting partner users:', error);
            return [];
        }
    }

    async handleFailedTokens(userId, responses, tokens) {
        try {
            if (!this.db) {
                await this.initializeDatabase();
            }
            
            const collection = this.db.collection('device_tokens');
            const tokensToRemove = [];

            responses.forEach((response, index) => {
                if (!response.success) {
                    const error = response.error;
                    if (error.code === 'messaging/invalid-registration-token' ||
                        error.code === 'messaging/registration-token-not-registered') {
                        tokensToRemove.push(tokens[index]);
                    }
                }
            });

            if (tokensToRemove.length > 0) {
                await collection.updateMany(
                    { userId: userId, token: { $in: tokensToRemove } },
                    { $set: { isActive: false, updatedAt: new Date() } }
                );
                logger.info(`Deactivated ${tokensToRemove.length} invalid tokens for user ${userId}`);
            }
        } catch (error) {
            logger.error('Error handling failed tokens:', error);
        }
    }

    // Bulk notification methods
    async sendBulkNotifications(userIds, notification) {
        try {
            const promises = userIds.map(userId => 
                this.sendPushNotification(userId, { ...notification, userId })
            );
            await Promise.all(promises);
            logger.info(`Bulk notifications sent to ${userIds.length} users`);
        } catch (error) {
            logger.error('Error sending bulk notifications:', error);
        }
    }

    // Scheduled notifications
    async scheduleMaintenanceReminders() {
        try {
            if (!this.db) {
                await this.initializeDatabase();
            }
            
            const collection = this.db.collection('cars');
            const cars = await collection.find({
                'maintenanceHistory.nextServiceDate': {
                    $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
                }
            }).toArray();

            for (const car of cars) {
                const nextService = car.maintenanceHistory.find(service => 
                    new Date(service.nextServiceDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                );
                
                if (nextService) {
                    await this.notifyMaintenanceReminder(
                        car.userId,
                        `${car.make} ${car.model}`,
                        nextService.serviceType,
                        nextService.nextServiceDate
                    );
                }
            }
        } catch (error) {
            logger.error('Error scheduling maintenance reminders:', error);
        }
    }

    async schedulePointsExpiryNotifications() {
        try {
            if (!this.db) {
                await this.initializeDatabase();
            }
            
            const collection = this.db.collection('loyalty');
            const loyaltyAccounts = await collection.find({}).toArray();

            for (const account of loyaltyAccounts) {
                const expiringPoints = account.history.filter(entry => 
                    entry.expiresAt && 
                    new Date(entry.expiresAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
                    entry.actionType === 'earn'
                );

                if (expiringPoints.length > 0) {
                    const totalExpiring = expiringPoints.reduce((sum, entry) => sum + entry.points, 0);
                    const earliestExpiry = expiringPoints.reduce((earliest, entry) => 
                        new Date(entry.expiresAt) < new Date(earliest) ? entry.expiresAt : earliest
                    );

                    await this.notifyPointsExpiring(
                        account.userId,
                        totalExpiring,
                        earliestExpiry
                    );
                }
            }
        } catch (error) {
            logger.error('Error scheduling points expiry notifications:', error);
        }
    }
}

module.exports = new NotificationService();
