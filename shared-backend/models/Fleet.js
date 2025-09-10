const mongoose = require('../shims/mongoose');

const fleetSchema = new mongoose.Schema({
    tenantId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicles: [{
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle'
        },
        assignedDriver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        gpsDevice: {
            type: String
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'maintenance', 'out_of_service'],
            default: 'active'
        },
        assignedAt: {
            type: Date,
            default: Date.now
        }
    }],
    settings: {
        geofences: [{
            name: {
                type: String,
                required: true
            },
            center: {
                latitude: {
                    type: Number,
                    required: true
                },
                longitude: {
                    type: Number,
                    required: true
                }
            },
            radius: {
                type: Number,
                required: true,
                min: 0
            },
            triggers: [{
                type: String,
                enum: ['entry', 'exit', 'dwell']
            }],
            actions: [{
                type: String,
                enum: ['notification', 'alert', 'report']
            }],
            lastTriggered: {
                type: Date
            }
        }],
        maintenanceSchedule: [{
            vehicleId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Vehicle'
            },
            maintenanceType: {
                type: String,
                enum: ['scheduled', 'emergency', 'inspection', 'repair']
            },
            scheduledDate: {
                type: Date,
                required: true
            },
            estimatedCost: {
                type: Number,
                min: 0
            },
            description: {
                type: String
            },
            priority: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical'],
                default: 'medium'
            },
            status: {
                type: String,
                enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
                default: 'scheduled'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        fuelMonitoring: {
            enabled: {
                type: Boolean,
                default: true
            },
            alertThreshold: {
                type: Number,
                default: 20 // percentage
            }
        },
        driverManagement: {
            enabled: {
                type: Boolean,
                default: true
            },
            maxDrivers: {
                type: Number,
                default: 10
            }
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    vehicleCount: {
        type: Number,
        default: 0,
        min: 0
    },
    driverCount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalMileage: {
        type: Number,
        default: 0,
        min: 0
    },
    fuelConsumption: {
        type: Number,
        default: 0,
        min: 0
    },
    maintenanceCosts: {
        type: Number,
        default: 0,
        min: 0
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
fleetSchema.index({ tenantId: 1, status: 1 });
fleetSchema.index({ manager: 1 });
fleetSchema.index({ 'vehicles.vehicleId': 1 });
fleetSchema.index({ 'vehicles.assignedDriver': 1 });
fleetSchema.index({ createdAt: -1 });

// Pre-save middleware
fleetSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    
    // Update vehicle count
    this.vehicleCount = this.vehicles.length;
    
    // Update driver count
    const uniqueDrivers = new Set();
    this.vehicles.forEach(vehicle => {
        if (vehicle.assignedDriver) {
            uniqueDrivers.add(vehicle.assignedDriver.toString());
        }
    });
    this.driverCount = uniqueDrivers.size;
    
    next();
});

// Virtual for active vehicles
fleetSchema.virtual('activeVehicles').get(function() {
    return this.vehicles.filter(vehicle => vehicle.status === 'active').length;
});

// Virtual for vehicles in maintenance
fleetSchema.virtual('maintenanceVehicles').get(function() {
    return this.vehicles.filter(vehicle => vehicle.status === 'maintenance').length;
});

// Instance methods
fleetSchema.methods.addVehicle = function(vehicleData) {
    const vehicle = {
        vehicleId: vehicleData.vehicleId,
        assignedDriver: vehicleData.assignedDriver,
        gpsDevice: vehicleData.gpsDevice,
        status: vehicleData.status || 'active',
        assignedAt: new Date()
    };
    
    this.vehicles.push(vehicle);
    return vehicle;
};

fleetSchema.methods.removeVehicle = function(vehicleId) {
    const index = this.vehicles.findIndex(v => v.vehicleId.toString() === vehicleId.toString());
    if (index > -1) {
        this.vehicles.splice(index, 1);
        return true;
    }
    return false;
};

fleetSchema.methods.assignDriver = function(vehicleId, driverId) {
    const vehicle = this.vehicles.find(v => v.vehicleId.toString() === vehicleId.toString());
    if (vehicle) {
        vehicle.assignedDriver = driverId;
        vehicle.assignedAt = new Date();
        return true;
    }
    return false;
};

fleetSchema.methods.addGeofence = function(geofenceData) {
    const geofence = {
        name: geofenceData.name,
        center: geofenceData.center,
        radius: geofenceData.radius,
        triggers: geofenceData.triggers || ['entry', 'exit'],
        actions: geofenceData.actions || ['notification']
    };
    
    this.settings.geofences.push(geofence);
    return geofence;
};

fleetSchema.methods.scheduleMaintenance = function(maintenanceData) {
    const maintenance = {
        vehicleId: maintenanceData.vehicleId,
        maintenanceType: maintenanceData.maintenanceType,
        scheduledDate: maintenanceData.scheduledDate,
        estimatedCost: maintenanceData.estimatedCost,
        description: maintenanceData.description,
        priority: maintenanceData.priority || 'medium',
        status: 'scheduled',
        createdAt: new Date()
    };
    
    this.settings.maintenanceSchedule.push(maintenance);
    return maintenance;
};

// Static methods
fleetSchema.statics.findByTenant = function(tenantId) {
    return this.find({ tenantId, status: 'active' });
};

fleetSchema.statics.findByManager = function(managerId) {
    return this.find({ manager: managerId });
};

fleetSchema.statics.findByVehicle = function(vehicleId) {
    return this.find({ 'vehicles.vehicleId': vehicleId });
};

fleetSchema.statics.findByDriver = function(driverId) {
    return this.find({ 'vehicles.assignedDriver': driverId });
};

fleetSchema.statics.getFleetStats = function(tenantId) {
    return this.aggregate([
        {
            $match: { tenantId, status: 'active' }
        },
        {
            $group: {
                _id: null,
                totalFleets: { $sum: 1 },
                totalVehicles: { $sum: '$vehicleCount' },
                totalDrivers: { $sum: '$driverCount' },
                totalMileage: { $sum: '$totalMileage' },
                totalFuelConsumption: { $sum: '$fuelConsumption' },
                totalMaintenanceCosts: { $sum: '$maintenanceCosts' }
            }
        }
    ]);
};

module.exports = mongoose.model('Fleet', fleetSchema);
