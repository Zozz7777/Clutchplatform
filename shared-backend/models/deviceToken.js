const mongoose = require('../shims/mongoose');

const deviceTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    deviceInfo: {
        platform: {
            type: String,
            enum: ['ios', 'android', 'web', 'desktop'],
            required: true
        },
        deviceModel: String,
        osVersion: String,
        appVersion: String,
        deviceId: String,
        userAgent: String,
        language: {
            type: String,
            default: 'en'
        },
        timezone: {
            type: String,
            default: 'UTC'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUsed: {
        type: Date,
        default: Date.now
    },
    deactivatedAt: Date,
    deactivationReason: {
        type: String,
        enum: ['user_logout', 'app_uninstall', 'token_invalid', 'device_changed', 'manual'],
        default: 'manual'
    },
    pushSettings: {
        bookingUpdates: {
            type: Boolean,
            default: true
        },
        paymentNotifications: {
            type: Boolean,
            default: true
        },
        serviceUpdates: {
            type: Boolean,
            default: true
        },
        chatMessages: {
            type: Boolean,
            default: true
        },
        promotionalMessages: {
            type: Boolean,
            default: false
        },
        systemMessages: {
            type: Boolean,
            default: true
        }
    },
    metadata: {
        installationId: String,
        sessionId: String,
        additionalData: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
deviceTokenSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Indexes for efficient querying
deviceTokenSchema.index({ userId: 1 });
deviceTokenSchema.index({ token: 1 }, { unique: true });
deviceTokenSchema.index({ isActive: 1 });
deviceTokenSchema.index({ 'deviceInfo.platform': 1 });
deviceTokenSchema.index({ lastUsed: -1 });

// Compound indexes for common query patterns
deviceTokenSchema.index({ userId: 1, isActive: 1 });
deviceTokenSchema.index({ userId: 1, 'deviceInfo.platform': 1 });

// TTL index to automatically delete inactive tokens after 6 months
deviceTokenSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 6 * 30 * 24 * 60 * 60 });

// Virtual for checking if token is valid
deviceTokenSchema.virtual('isValid').get(function() {
    return this.isActive && !this.deactivatedAt;
});

// Virtual for checking if token is recently used
deviceTokenSchema.virtual('isRecentlyUsed').get(function() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.lastUsed > thirtyDaysAgo;
});

// Method to update last used timestamp
deviceTokenSchema.methods.updateLastUsed = function() {
    this.lastUsed = new Date();
    return this;
};

// Method to deactivate token
deviceTokenSchema.methods.deactivate = function(reason = 'manual') {
    this.isActive = false;
    this.deactivatedAt = new Date();
    this.deactivationReason = reason;
    return this;
};

// Method to reactivate token
deviceTokenSchema.methods.reactivate = function() {
    this.isActive = true;
    this.deactivatedAt = null;
    this.deactivationReason = null;
    this.lastUsed = new Date();
    return this;
};

// Method to update push settings
deviceTokenSchema.methods.updatePushSettings = function(settings) {
    this.pushSettings = { ...this.pushSettings, ...settings };
    return this;
};

// Method to check if notification type is enabled
deviceTokenSchema.methods.isNotificationEnabled = function(notificationType) {
    return this.pushSettings[notificationType] !== false;
};

// Static method to find active tokens for user
deviceTokenSchema.statics.findActiveTokens = function(userId) {
    return this.find({
        userId,
        isActive: true
    }).sort({ lastUsed: -1 });
};

// Static method to find tokens by platform
deviceTokenSchema.statics.findByPlatform = function(userId, platform) {
    return this.find({
        userId,
        'deviceInfo.platform': platform,
        isActive: true
    });
};

// Static method to find recently used tokens
deviceTokenSchema.statics.findRecentlyUsed = function(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.find({
        lastUsed: { $gte: cutoffDate },
        isActive: true
    });
};

// Static method to deactivate old tokens
deviceTokenSchema.statics.deactivateOldTokens = function(days = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.updateMany(
        {
            lastUsed: { $lt: cutoffDate },
            isActive: true
        },
        {
            isActive: false,
            deactivatedAt: new Date(),
            deactivationReason: 'device_changed'
        }
    );
};

// Static method to find tokens for notification type
deviceTokenSchema.statics.findTokensForNotification = function(userIds, notificationType) {
    return this.find({
        userId: { $in: userIds },
        isActive: true,
        [`pushSettings.${notificationType}`]: { $ne: false }
    });
};

// Static method to get device statistics
deviceTokenSchema.statics.getDeviceStats = function(userId) {
    return this.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$deviceInfo.platform',
                count: { $sum: 1 },
                activeCount: {
                    $sum: { $cond: ['$isActive', 1, 0] }
                },
                lastUsed: { $max: '$lastUsed' }
            }
        },
        {
            $project: {
                platform: '$_id',
                totalDevices: '$count',
                activeDevices: '$activeCount',
                lastUsed: 1
            }
        }
    ]);
};

// Static method to clean up duplicate tokens
deviceTokenSchema.statics.cleanupDuplicates = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$token',
                docs: { $push: '$$ROOT' },
                count: { $sum: 1 }
            }
        },
        {
            $match: {
                count: { $gt: 1 }
            }
        },
        {
            $project: {
                token: '$_id',
                docs: '$docs',
                count: '$count'
            }
        }
    ]);
};

// Static method to find inactive tokens
deviceTokenSchema.statics.findInactiveTokens = function(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.find({
        lastUsed: { $lt: cutoffDate },
        isActive: true
    });
};

// Static method to bulk update last used
deviceTokenSchema.statics.bulkUpdateLastUsed = function(tokenIds) {
    return this.updateMany(
        { _id: { $in: tokenIds } },
        { lastUsed: new Date() }
    );
};

// Static method to get token usage statistics
deviceTokenSchema.statics.getTokenUsageStats = function(timeRange = {}) {
    const query = {};
    
    if (timeRange.start) {
        query.lastUsed = { $gte: new Date(timeRange.start) };
    }
    
    if (timeRange.end) {
        query.lastUsed = { ...query.lastUsed, $lte: new Date(timeRange.end) };
    }

    return this.aggregate([
        { $match: query },
        {
            $group: {
                _id: null,
                totalTokens: { $sum: 1 },
                activeTokens: { $sum: { $cond: ['$isActive', 1, 0] } },
                platforms: { $addToSet: '$deviceInfo.platform' },
                uniqueUsers: { $addToSet: '$userId' }
            }
        },
        {
            $project: {
                totalTokens: 1,
                activeTokens: 1,
                inactiveTokens: { $subtract: ['$totalTokens', '$activeTokens'] },
                platforms: 1,
                uniqueUsers: { $size: '$uniqueUsers' }
            }
        }
    ]);
};

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);
