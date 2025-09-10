const mongoose = require('../shims/mongoose');

const gpsDeviceSchema = new mongoose.Schema({
    fleetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fleet',
        required: true
    },
    provider: {
        type: String,
        enum: ['garmin', 'tomtom', 'here', 'custom'],
        required: true
    },
    deviceId: {
        type: String,
        required: true,
        unique: true
    },
    apiKey: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'error'],
        default: 'active'
    },
    lastSync: {
        type: Date,
        default: Date.now
    },
    settings: {
        updateInterval: {
            type: Number,
            default: 30 // seconds
        },
        accuracy: {
            type: Number,
            default: 10 // meters
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GPSDevice', gpsDeviceSchema);
