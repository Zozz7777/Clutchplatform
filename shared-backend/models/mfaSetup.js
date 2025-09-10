const mongoose = require('../shims/mongoose');

const backupCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    },
    usedAt: {
        type: Date
    }
});

const mfaSetupSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    method: {
        type: String,
        enum: ['totp', 'sms', 'email'],
        default: 'totp'
    },
    secret: {
        type: String,
        required: true
    },
    backupCodes: [backupCodeSchema],
    enabled: {
        type: Boolean,
        default: false
    },
    setupComplete: {
        type: Boolean,
        default: false
    },
    lastUsed: {
        type: Date
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
mfaSetupSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('MFASetup', mfaSetupSchema);
