const mongoose = require('../shims/mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true,
        trim: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    type: {
        type: String,
        enum: ['booking', 'payment', 'service', 'chat', 'system', 'promotional'],
        default: 'system'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'read', 'failed', 'cancelled'],
        default: 'pending'
    },
    channel: {
        type: String,
        enum: ['push', 'email', 'sms', 'in_app'],
        default: 'push'
    },
    scheduledFor: {
        type: Date
    },
    sentAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    readAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    },
    fcmResponse: {
        type: mongoose.Schema.Types.Mixed
    },
    retryCount: {
        type: Number,
        default: 0
    },
    maxRetries: {
        type: Number,
        default: 3
    },
    metadata: {
        campaignId: String,
        templateId: String,
        segmentId: String,
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
notificationSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Indexes for efficient querying
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ channel: 1 });

// Compound indexes for common query patterns
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ status: 1, scheduledFor: 1 });

// TTL index to automatically delete old notifications after 1 year
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

// Virtual for checking if notification is scheduled
notificationSchema.virtual('isScheduled').get(function() {
    return !!this.scheduledFor && this.scheduledFor > new Date();
});

// Virtual for checking if notification is overdue
notificationSchema.virtual('isOverdue').get(function() {
    return this.scheduledFor && this.scheduledFor < new Date() && this.status === 'pending';
});

// Virtual for checking if notification can be retried
notificationSchema.virtual('canRetry').get(function() {
    return this.status === 'failed' && this.retryCount < this.maxRetries;
});

// Method to mark notification as sent
notificationSchema.methods.markAsSent = function(fcmResponse = null) {
    this.status = 'sent';
    this.sentAt = new Date();
    if (fcmResponse) {
        this.fcmResponse = fcmResponse;
    }
    return this;
};

// Method to mark notification as delivered
notificationSchema.methods.markAsDelivered = function() {
    this.status = 'delivered';
    this.deliveredAt = new Date();
    return this;
};

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
    this.status = 'read';
    this.readAt = new Date();
    return this;
};

// Method to mark notification as failed
notificationSchema.methods.markAsFailed = function() {
    this.status = 'failed';
    this.retryCount += 1;
    return this;
};

// Method to cancel notification
notificationSchema.methods.cancel = function() {
    this.status = 'cancelled';
    this.cancelledAt = new Date();
    return this;
};

// Method to retry notification
notificationSchema.methods.retry = function() {
    if (this.canRetry) {
        this.status = 'pending';
        this.retryCount += 1;
    }
    return this;
};

// Static method to find user notifications
notificationSchema.statics.findUserNotifications = function(userId, options = {}) {
    const query = { userId };
    
    if (options.status) {
        query.status = options.status;
    }
    
    if (options.type) {
        query.type = options.type;
    }
    
    if (options.unreadOnly) {
        query.status = { $in: ['sent', 'delivered'] };
    }

    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50)
        .skip(options.offset || 0);
};

// Static method to find pending notifications
notificationSchema.statics.findPendingNotifications = function() {
    return this.find({
        status: 'pending',
        $or: [
            { scheduledFor: { $exists: false } },
            { scheduledFor: { $lte: new Date() } }
        ]
    }).sort({ priority: 1, createdAt: 1 });
};

// Static method to find overdue notifications
notificationSchema.statics.findOverdueNotifications = function() {
    return this.find({
        status: 'pending',
        scheduledFor: { $lt: new Date() }
    }).sort({ scheduledFor: 1 });
};

// Static method to find failed notifications for retry
notificationSchema.statics.findFailedForRetry = function() {
    return this.find({
        status: 'failed',
        retryCount: { $lt: '$maxRetries' }
    }).sort({ createdAt: 1 });
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = function(notificationIds, userId) {
    return this.updateMany(
        { _id: { $in: notificationIds }, userId },
        { 
            status: 'read',
            readAt: new Date()
        }
    );
};

// Static method to delete old notifications
notificationSchema.statics.deleteOldNotifications = function(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    return this.deleteMany({
        createdAt: { $lt: cutoffDate },
        status: { $in: ['read', 'cancelled'] }
    });
};

// Static method to get notification statistics
notificationSchema.statics.getNotificationStats = function(userId, timeRange = {}) {
    const query = { userId };
    
    if (timeRange.start) {
        query.createdAt = { $gte: new Date(timeRange.start) };
    }
    
    if (timeRange.end) {
        query.createdAt = { ...query.createdAt, $lte: new Date(timeRange.end) };
    }

    return this.aggregate([
        { $match: query },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
                delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
                read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
                failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
                byType: {
                    $push: {
                        type: '$type',
                        status: '$status'
                    }
                }
            }
        },
        {
            $project: {
                total: 1,
                sent: 1,
                delivered: 1,
                read: 1,
                failed: 1,
                deliveryRate: { $divide: ['$delivered', '$sent'] },
                readRate: { $divide: ['$read', '$delivered'] }
            }
        }
    ]);
};

// Static method to create bulk notifications
notificationSchema.statics.createBulkNotifications = function(notifications) {
    return this.insertMany(notifications);
};

// Static method to find notifications by campaign
notificationSchema.statics.findByCampaign = function(campaignId) {
    return this.find({ 'metadata.campaignId': campaignId }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Notification', notificationSchema);
