const mongoose = require('../shims/mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    metadata: {
        ipAddress: String,
        userAgent: String,
        resourceId: String,
        resourceType: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        additionalData: mongoose.Schema.Types.Mixed
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    category: {
        type: String,
        enum: [
            'authentication',
            'authorization',
            'data_access',
            'data_modification',
            'system_configuration',
            'security_event',
            'user_management',
            'payment_processing',
            'booking_management',
            'fleet_management',
            'ai_operations',
            'api_access'
        ],
        default: 'data_access'
    },
    outcome: {
        type: String,
        enum: ['success', 'failure', 'partial'],
        default: 'success'
    },
    errorCode: String,
    errorMessage: String,
    timestamp: {
        type: Date,
        default: Date.now
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    },
    requestId: String,
    duration: Number, // Request duration in milliseconds
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ category: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ outcome: 1, timestamp: -1 });
auditLogSchema.index({ 'metadata.resourceId': 1, 'metadata.resourceType': 1 });

// TTL index to automatically delete audit logs after 2 years
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 });

// Compound indexes for common query patterns
auditLogSchema.index({ userId: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ category: 1, severity: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
