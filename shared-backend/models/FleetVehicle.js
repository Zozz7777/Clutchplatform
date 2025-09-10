const mongoose = require('../shims/mongoose');

const fleetVehicleSchema = new mongoose.Schema({
    vehicleId: {
        type: String,
        required: true,
        unique: true
    },
    fleetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fleet',
        required: true
    },
    tenantId: {
        type: String,
        required: true
    },
    make: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    licensePlate: {
        type: String,
        required: true,
        unique: true
    },
    vin: {
        type: String,
        unique: true,
        sparse: true
    },
    assignedDriver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    gpsDevice: {
        deviceId: String,
        deviceType: {
            type: String,
            enum: ['GPS', 'OBD2', 'Hybrid'],
            default: 'GPS'
        },
        lastSeen: Date,
        isActive: {
            type: Boolean,
            default: false
        }
    },
    status: {
        type: String,
        enum: ['active', 'maintenance', 'out_of_service', 'retired'],
        default: 'active'
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        },
        accuracy: Number,
        speed: Number,
        heading: Number
    },
    fuel: {
        currentLevel: {
            type: Number,
            min: 0,
            max: 100
        },
        capacity: Number,
        efficiency: Number, // km/L or mpg
        lastRefuel: {
            date: Date,
            amount: Number,
            cost: Number
        }
    },
    maintenance: {
        lastService: {
            date: Date,
            type: String,
            mileage: Number,
            cost: Number
        },
        nextService: {
            date: Date,
            type: String,
            mileage: Number
        },
        serviceHistory: [{
            date: Date,
            type: String,
            description: String,
            mileage: Number,
            cost: Number,
            mechanic: String
        }]
    },
    mileage: {
        current: {
            type: Number,
            default: 0
        },
        lastReset: {
            type: Date,
            default: Date.now
        }
    },
    specifications: {
        engineSize: String,
        fuelType: {
            type: String,
            enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'lpg', 'cng'],
            default: 'gasoline'
        },
        transmission: String,
        color: String,
        seatingCapacity: Number,
        cargoCapacity: Number
    },
    insurance: {
        policyNumber: String,
        provider: String,
        expiryDate: Date,
        coverage: String
    },
    registration: {
        expiryDate: Date,
        renewalDate: Date,
        documents: [{
            type: String,
            url: String,
            expiryDate: Date
        }]
    },
    geofences: [{
        geofenceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Geofence'
        },
        name: String,
        type: {
            type: String,
            enum: ['circle', 'polygon'],
            default: 'circle'
        },
        coordinates: {
            type: [Number],
            required: true
        },
        radius: Number, // for circle type
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    alerts: {
        fuelLow: {
            type: Boolean,
            default: false
        },
        maintenanceDue: {
            type: Boolean,
            default: false
        },
        geofenceViolation: {
            type: Boolean,
            default: false
        },
        speedViolation: {
            type: Boolean,
            default: false
        }
    },
    settings: {
        fuelAlertThreshold: {
            type: Number,
            default: 20
        },
        speedLimit: {
            type: Number,
            default: 120
        },
        maintenanceReminderDays: {
            type: Number,
            default: 7
        }
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

// Indexes
fleetVehicleSchema.index({ fleetId: 1, status: 1 });
fleetVehicleSchema.index({ tenantId: 1, status: 1 });
fleetVehicleSchema.index({ assignedDriver: 1 });
// Note: licensePlate and vin indexes are automatically created by unique: true in schema
fleetVehicleSchema.index({ 'location.coordinates': '2dsphere' });
fleetVehicleSchema.index({ 'gpsDevice.deviceId': 1 });
fleetVehicleSchema.index({ 'maintenance.nextService.date': 1 });
fleetVehicleSchema.index({ 'registration.expiryDate': 1 });
fleetVehicleSchema.index({ createdAt: -1 });

// Pre-save middleware
fleetVehicleSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Virtuals
fleetVehicleSchema.virtual('isInService').get(function() {
    return this.status === 'active';
});

fleetVehicleSchema.virtual('needsMaintenance').get(function() {
    if (!this.maintenance.nextService) return false;
    return new Date() >= this.maintenance.nextService.date;
});

fleetVehicleSchema.virtual('fuelPercentage').get(function() {
    if (!this.fuel.currentLevel) return 0;
    return this.fuel.currentLevel;
});

fleetVehicleSchema.virtual('isLowFuel').get(function() {
    return this.fuelPercentage <= this.settings.fuelAlertThreshold;
});

fleetVehicleSchema.virtual('registrationExpired').get(function() {
    if (!this.registration.expiryDate) return false;
    return new Date() > this.registration.expiryDate;
});

// Instance methods
fleetVehicleSchema.methods.updateLocation = function(locationData) {
    this.location = {
        type: 'Point',
        coordinates: [locationData.longitude, locationData.latitude],
        lastUpdated: new Date(),
        accuracy: locationData.accuracy,
        speed: locationData.speed,
        heading: locationData.heading
    };
    return this.save();
};

fleetVehicleSchema.methods.updateFuelLevel = function(level) {
    this.fuel.currentLevel = level;
    if (this.isLowFuel) {
        this.alerts.fuelLow = true;
    }
    return this.save();
};

fleetVehicleSchema.methods.addMaintenanceRecord = function(record) {
    this.maintenance.serviceHistory.push(record);
    this.maintenance.lastService = record;
    this.status = 'active';
    this.alerts.maintenanceDue = false;
    return this.save();
};

fleetVehicleSchema.methods.assignDriver = function(driverId) {
    this.assignedDriver = driverId;
    return this.save();
};

fleetVehicleSchema.methods.addGeofence = function(geofenceData) {
    this.geofences.push(geofenceData);
    return this.save();
};

fleetVehicleSchema.methods.removeGeofence = function(geofenceId) {
    this.geofences = this.geofences.filter(g => g.geofenceId.toString() !== geofenceId.toString());
    return this.save();
};

fleetVehicleSchema.methods.checkGeofenceViolation = function(currentLocation) {
    const violations = [];
    this.geofences.forEach(geofence => {
        if (!geofence.isActive) return;
        
        const distance = this.calculateDistance(
            currentLocation,
            geofence.coordinates
        );
        
        if (geofence.type === 'circle' && distance > geofence.radius) {
            violations.push({
                geofenceId: geofence.geofenceId,
                name: geofence.name,
                distance: distance,
                radius: geofence.radius
            });
        }
    });
    
    if (violations.length > 0) {
        this.alerts.geofenceViolation = true;
    }
    
    return violations;
};

fleetVehicleSchema.methods.calculateDistance = function(point1, point2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2[1] - point1[1]) * Math.PI / 180;
    const dLon = (point2[0] - point1[0]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(point1[1] * Math.PI / 180) * Math.cos(point2[1] * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

// Static methods
fleetVehicleSchema.statics.findByFleet = function(fleetId) {
    return this.find({ fleetId }).populate('assignedDriver');
};

fleetVehicleSchema.statics.findByTenant = function(tenantId) {
    return this.find({ tenantId }).populate('assignedDriver');
};

fleetVehicleSchema.statics.findByDriver = function(driverId) {
    return this.find({ assignedDriver: driverId });
};

fleetVehicleSchema.statics.findByStatus = function(status) {
    return this.find({ status });
};

fleetVehicleSchema.statics.findNeedingMaintenance = function() {
    return this.find({
        'maintenance.nextService.date': { $lte: new Date() }
    });
};

fleetVehicleSchema.statics.findLowFuel = function() {
    return this.find({
        $expr: {
            $lte: ['$fuel.currentLevel', '$settings.fuelAlertThreshold']
        }
    });
};

fleetVehicleSchema.statics.findNearLocation = function(coordinates, maxDistance = 10) {
    return this.find({
        'location.coordinates': {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: coordinates
                },
                $maxDistance: maxDistance * 1000 // Convert to meters
            }
        }
    });
};

fleetVehicleSchema.statics.getFleetStats = function(fleetId) {
    return this.aggregate([
        { $match: { fleetId: mongoose.Types.ObjectId(fleetId) } },
        {
            $group: {
                _id: null,
                totalVehicles: { $sum: 1 },
                activeVehicles: {
                    $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                },
                maintenanceVehicles: {
                    $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] }
                },
                totalMileage: { $sum: '$mileage.current' },
                avgFuelLevel: { $avg: '$fuel.currentLevel' }
            }
        }
    ]);
};

module.exports = mongoose.model('FleetVehicle', fleetVehicleSchema);
