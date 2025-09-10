const mongoose = require('../shims/mongoose');

const telematicsDataSchema = new mongoose.Schema({
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    deviceType: {
        type: String,
        enum: ['gps', 'obd2'],
        required: true
    },
    data: {
        // GPS Data
        latitude: Number,
        longitude: Number,
        speed: Number,
        heading: Number,
        altitude: Number,
        accuracy: Number,
        
        // OBD2 Data
        engineRPM: Number,
        fuelLevel: Number,
        engineTemp: Number,
        batteryVoltage: Number,
        throttlePosition: Number,
        intakeAirTemp: Number,
        coolantTemp: Number,
        oilPressure: Number,
        transmissionTemp: Number,
        fuelPressure: Number,
        intakeManifoldPressure: Number,
        timingAdvance: Number,
        fuelTrim: Number,
        oxygenSensor: Number,
        catalyticConverterTemp: Number,
        evapSystemPressure: Number,
        absStatus: Number,
        tractionControlStatus: Number,
        stabilityControlStatus: Number,
        tirePressure: [Number],
        
        // Calculated Values
        fuelEfficiency: Number,
        averageSpeed: Number,
        maxSpeed: Number,
        idleTime: Number,
        drivingTime: Number,
        distance: Number,
        fuelConsumption: Number,
        
        // Environmental Data
        ambientTemp: Number,
        humidity: Number,
        barometricPressure: Number,
        
        // Vehicle Status
        checkEngineLight: Boolean,
        maintenanceRequired: Boolean,
        lowFuel: Boolean,
        lowBattery: Boolean,
        lowTirePressure: Boolean,
        
        // Driver Behavior
        harshAcceleration: Boolean,
        harshBraking: Boolean,
        harshCornering: Boolean,
        speeding: Boolean,
        idling: Boolean,
        
        // Location Context
        location: {
            address: String,
            city: String,
            state: String,
            country: String,
            zipCode: String,
            placeType: String
        },
        
        // Trip Information
        tripId: String,
        tripStartTime: Date,
        tripEndTime: Date,
        tripDistance: Number,
        tripDuration: Number,
        tripFuelConsumption: Number,
        
        // Weather Data
        weather: {
            condition: String,
            temperature: Number,
            humidity: Number,
            windSpeed: Number,
            windDirection: Number,
            precipitation: Number,
            visibility: Number
        },
        
        // Traffic Data
        traffic: {
            congestionLevel: String,
            averageSpeed: Number,
            travelTime: Number,
            delay: Number
        },
        
        // Road Data
        road: {
            type: String,
            speedLimit: Number,
            surface: String,
            condition: String,
            grade: Number,
            curvature: Number
        }
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    processed: {
        type: Boolean,
        default: false
    },
    processedAt: Date,
    quality: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor'],
        default: 'good'
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.9
    },
    metadata: {
        deviceModel: String,
        firmwareVersion: String,
        signalStrength: Number,
        batteryLevel: Number,
        connectionType: String,
        dataSource: String,
        rawData: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Indexes for better query performance
telematicsDataSchema.index({ deviceId: 1, timestamp: -1 });
telematicsDataSchema.index({ deviceType: 1, timestamp: -1 });
telematicsDataSchema.index({ 'data.latitude': 1, 'data.longitude': 1 });
telematicsDataSchema.index({ timestamp: -1 });
telematicsDataSchema.index({ processed: 1 });

// Pre-save middleware to validate data quality
telematicsDataSchema.pre('save', function(next) {
    // Validate GPS data
    if (this.deviceType === 'gps') {
        if (this.data.latitude && (this.data.latitude < -90 || this.data.latitude > 90)) {
            this.quality = 'poor';
            this.confidence = 0.1;
        }
        if (this.data.longitude && (this.data.longitude < -180 || this.data.longitude > 180)) {
            this.quality = 'poor';
            this.confidence = 0.1;
        }
    }
    
    // Validate OBD2 data
    if (this.deviceType === 'obd2') {
        if (this.data.engineRPM && (this.data.engineRPM < 0 || this.data.engineRPM > 10000)) {
            this.quality = 'poor';
            this.confidence = 0.1;
        }
        if (this.data.fuelLevel && (this.data.fuelLevel < 0 || this.data.fuelLevel > 100)) {
            this.quality = 'poor';
            this.confidence = 0.1;
        }
    }
    
    next();
});

// Static methods
telematicsDataSchema.statics.findByDevice = async function(deviceId, options = {}) {
    const { startDate, endDate, limit = 100, sort = -1 } = options;
    
    const query = { deviceId };
    if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    return await this.find(query)
        .sort({ timestamp: sort })
        .limit(limit);
};

telematicsDataSchema.statics.findByLocation = async function(latitude, longitude, radius = 1, options = {}) {
    const { startDate, endDate, deviceType } = options;
    
    const query = {
        'data.latitude': { $gte: latitude - radius, $lte: latitude + radius },
        'data.longitude': { $gte: longitude - radius, $lte: longitude + radius }
    };
    
    if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    if (deviceType) query.deviceType = deviceType;
    
    return await this.find(query).sort({ timestamp: -1 });
};

telematicsDataSchema.statics.getLatestByDevice = async function(deviceId) {
    return await this.findOne({ deviceId }).sort({ timestamp: -1 });
};

telematicsDataSchema.statics.getAggregatedData = async function(deviceId, startDate, endDate, aggregation = 'hourly') {
    const matchStage = {
        deviceId: deviceId,
        timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };
    
    let groupStage = {};
    
    switch (aggregation) {
        case 'hourly':
            groupStage = {
                _id: {
                    year: { $year: '$timestamp' },
                    month: { $month: '$timestamp' },
                    day: { $dayOfMonth: '$timestamp' },
                    hour: { $hour: '$timestamp' }
                }
            };
            break;
        case 'daily':
            groupStage = {
                _id: {
                    year: { $year: '$timestamp' },
                    month: { $month: '$timestamp' },
                    day: { $dayOfMonth: '$timestamp' }
                }
            };
            break;
        case 'weekly':
            groupStage = {
                _id: {
                    year: { $year: '$timestamp' },
                    week: { $week: '$timestamp' }
                }
            };
            break;
        case 'monthly':
            groupStage = {
                _id: {
                    year: { $year: '$timestamp' },
                    month: { $month: '$timestamp' }
                }
            };
            break;
    }
    
    groupStage.avgSpeed = { $avg: '$data.speed' };
    groupStage.maxSpeed = { $max: '$data.speed' };
    groupStage.avgFuelEfficiency = { $avg: '$data.fuelEfficiency' };
    groupStage.totalDistance = { $sum: '$data.distance' };
    groupStage.totalFuelConsumption = { $sum: '$data.fuelConsumption' };
    groupStage.avgEngineRPM = { $avg: '$data.engineRPM' };
    groupStage.avgEngineTemp = { $avg: '$data.engineTemp' };
    groupStage.count = { $sum: 1 };
    
    return await this.aggregate([
        { $match: matchStage },
        { $group: groupStage },
        { $sort: { '_id': 1 } }
    ]);
};

// Instance methods
telematicsDataSchema.methods.calculateDistance = function(previousData) {
    if (!previousData || !this.data.latitude || !this.data.longitude) {
        return 0;
    }
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(this.data.latitude - previousData.data.latitude);
    const dLon = this.deg2rad(this.data.longitude - previousData.data.longitude);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.deg2rad(previousData.data.latitude)) * Math.cos(this.deg2rad(this.data.latitude)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
};

telematicsDataSchema.methods.deg2rad = function(deg) {
    return deg * (Math.PI/180);
};

telematicsDataSchema.methods.isAnomalous = function() {
    const anomalies = [];
    
    // Speed anomalies
    if (this.data.speed && this.data.speed > 200) { // 200 km/h
        anomalies.push('excessive_speed');
    }
    
    // Engine RPM anomalies
    if (this.data.engineRPM && this.data.engineRPM > 8000) {
        anomalies.push('high_rpm');
    }
    
    // Temperature anomalies
    if (this.data.engineTemp && this.data.engineTemp > 120) { // 120°C
        anomalies.push('high_engine_temp');
    }
    
    // Fuel level anomalies
    if (this.data.fuelLevel && this.data.fuelLevel < 5) {
        anomalies.push('low_fuel');
    }
    
    // Battery voltage anomalies
    if (this.data.batteryVoltage && this.data.batteryVoltage < 10) {
        anomalies.push('low_battery');
    }
    
    return anomalies;
};

telematicsDataSchema.methods.getLocationContext = function() {
    if (!this.data.latitude || !this.data.longitude) {
        return null;
    }
    
    // This would typically call a geocoding service
    // For now, return a mock location context
    return {
        address: 'Mock Address',
        city: 'Mock City',
        state: 'Mock State',
        country: 'Mock Country',
        zipCode: '12345',
        placeType: 'road'
    };
};

module.exports = mongoose.model('TelematicsData', telematicsDataSchema);
