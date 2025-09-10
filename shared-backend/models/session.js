const mongoose = require('../shims/mongoose');

const deviceInfoSchema = new mongoose.Schema({
    userAgent: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    deviceType: {
        type: String,
        enum: ['mobile', 'tablet', 'desktop', 'unknown'],
        default: 'unknown'
    },
    fingerprint: {
        type: String
    },
    location: {
        country: String,
        city: String,
        latitude: Number,
        longitude: Number
    }
});

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionToken: {
        type: String,
        required: true,
        unique: true
    },
    deviceInfo: deviceInfoSchema,
    status: {
        type: String,
        enum: ['active', 'expired', 'logged_out', 'suspended'],
        default: 'active'
    },
    expiresAt: {
        type: Date,
        required: true
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    loggedOutAt: {
        type: Date
    },
    logoutReason: {
        type: String,
        enum: ['user_logout', 'session_expired', 'security_concern', 'admin_logout']
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
sessionSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Index for efficient queries
sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ expiresAt: 1 });
sessionSchema.index({ lastActivity: 1 });

// TTL index to automatically delete expired sessions after 30 days
sessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Session', sessionSchema);
