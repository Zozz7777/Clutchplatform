const mongoose = require('../shims/mongoose');

const driverSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fleetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fleet'
    },
    assignedVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    licenseType: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'E', 'F'],
        required: true
    },
    licenseExpiry: {
        type: Date,
        required: true
    },
    certifications: [{
        name: String,
        issuedDate: Date,
        expiryDate: Date,
        issuingAuthority: String
    }],
    experience: {
        yearsDriving: {
            type: Number,
            default: 0
        },
        yearsCommercial: {
            type: Number,
            default: 0
        },
        totalMiles: {
            type: Number,
            default: 0
        }
    },
    performanceMetrics: {
        safetyScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        efficiencyScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        fuelEfficiency: {
            type: Number,
            default: 0
        },
        drivingHours: {
            type: Number,
            default: 0
        },
        violations: [{
            type: String,
            date: Date,
            description: String,
            points: Number
        }]
    },
    behaviorScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    efficiencyScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    lastAnalysis: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'training'],
        default: 'active'
    },
    assignmentDate: {
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

driverSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Driver', driverSchema);
