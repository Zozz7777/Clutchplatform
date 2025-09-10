const mongoose = require('../shims/mongoose');

const locationTrackingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    accuracy: { type: Number, min: 0 },
    altitude: { type: Number },
    speed: { type: Number, min: 0 },
    heading: { type: Number, min: 0, max: 360 },
    timestamp: { type: Date, default: Date.now, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    deviceInfo: {
        deviceId: String,
        platform: String,
        version: String
    },
    createdAt: { type: Date, default: Date.now }
});

const geofenceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['circle', 'polygon'], required: true },
    coordinates: [{ 
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    }],
    center: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    radius: { type: Number, min: 0 }, // in meters, for circle type
    triggers: [{
        action: { type: String, enum: ['enter', 'exit', 'dwell'], required: true },
        type: { type: String, enum: ['notification', 'booking_reminder', 'service_alert', 'custom_action'], required: true },
        message: String,
        name: String,
        config: { type: mongoose.Schema.Types.Mixed }
    }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const geofenceEventSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    geofenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Geofence', required: true },
    eventType: { type: String, enum: ['enter', 'exit', 'dwell'], required: true },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        accuracy: { type: Number },
        timestamp: { type: Date, default: Date.now }
    },
    dwellTime: { type: Number }, // in seconds, for dwell events
    triggeredActions: [{
        type: { type: String, required: true },
        status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
        message: String,
        timestamp: { type: Date, default: Date.now }
    }],
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now }
});

const routeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, trim: true },
    waypoints: [{
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        name: String,
        order: { type: Number, required: true }
    }],
    optimizedRoute: {
        totalDistance: { type: Number }, // in kilometers
        totalDuration: { type: Number }, // in minutes
        totalCost: { type: Number }, // in currency
        segments: [{
            from: {
                latitude: { type: Number, required: true },
                longitude: { type: Number, required: true }
            },
            to: {
                latitude: { type: Number, required: true },
                longitude: { type: Number, required: true }
            },
            distance: { type: Number },
            duration: { type: Number },
            instructions: [String]
        }],
        trafficInfo: {
            currentTraffic: { type: String, enum: ['low', 'moderate', 'high', 'severe'] },
            delay: { type: Number }, // in minutes
            congestionLevel: { type: Number, min: 0, max: 1 }
        },
        alternatives: [{
            name: String,
            distance: { type: Number },
            duration: { type: Number },
            cost: { type: Number }
        }]
    },
    options: {
        optimizeFor: { type: String, enum: ['time', 'distance', 'cost'], default: 'time' },
        avoidTolls: { type: Boolean, default: false },
        avoidHighways: { type: Boolean, default: false },
        trafficAware: { type: Boolean, default: true }
    },
    isFavorite: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0 },
    lastUsed: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
locationTrackingSchema.index({ userId: 1, timestamp: -1 });
locationTrackingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 }); // TTL: 1 year

geofenceSchema.index({ userId: 1, isActive: 1 });
geofenceSchema.index({ center: '2dsphere' }); // Geospatial index

geofenceEventSchema.index({ userId: 1, geofenceId: 1, timestamp: -1 });
geofenceEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 }); // TTL: 2 years

routeSchema.index({ userId: 1, isFavorite: 1 });
routeSchema.index({ userId: 1, lastUsed: -1 });

// Create models
const LocationTracking = mongoose.model('LocationTracking', locationTrackingSchema);
const Geofence = mongoose.model('Geofence', geofenceSchema);
const GeofenceEvent = mongoose.model('GeofenceEvent', geofenceEventSchema);
const Route = mongoose.model('Route', routeSchema);

module.exports = {
    LocationTracking,
    Geofence,
    GeofenceEvent,
    Route
};
