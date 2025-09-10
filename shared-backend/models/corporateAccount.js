const mongoose = require('../shims/mongoose');

const corporateAccountSchema = new mongoose.Schema({
    tenantId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    adminUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    billingInfo: {
        companyName: {
            type: String,
            required: true
        },
        taxId: {
            type: String
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        },
        contactPerson: {
            name: String,
            email: String,
            phone: String
        },
        paymentMethod: {
            type: String,
            enum: ['credit_card', 'bank_transfer', 'invoice', 'ach']
        },
        billingCycle: {
            type: String,
            enum: ['monthly', 'quarterly', 'annually'],
            default: 'monthly'
        }
    },
    settings: {
        maxUsers: {
            type: Number,
            default: 100,
            min: 1
        },
        maxVehicles: {
            type: Number,
            default: 1000,
            min: 1
        },
        maxFleets: {
            type: Number,
            default: 10,
            min: 1
        },
        features: {
            gpsTracking: {
                type: Boolean,
                default: true
            },
            maintenanceScheduling: {
                type: Boolean,
                default: true
            },
            driverManagement: {
                type: Boolean,
                default: true
            },
            reporting: {
                type: Boolean,
                default: true
            },
            apiAccess: {
                type: Boolean,
                default: false
            },
            whiteLabel: {
                type: Boolean,
                default: false
            }
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: false
            },
            push: {
                type: Boolean,
                default: true
            }
        },
        security: {
            mfaRequired: {
                type: Boolean,
                default: true
            },
            sessionTimeout: {
                type: Number,
                default: 24 * 60 * 60 * 1000 // 24 hours
            },
            ipWhitelist: [{
                type: String
            }]
        }
    },
    subscription: {
        plan: {
            type: String,
            enum: ['basic', 'professional', 'enterprise'],
            default: 'basic'
        },
        status: {
            type: String,
            enum: ['active', 'suspended', 'cancelled'],
            default: 'active'
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        endDate: {
            type: Date
        },
        billingAmount: {
            type: Number,
            min: 0
        },
        billingCurrency: {
            type: String,
            default: 'USD'
        },
        autoRenew: {
            type: Boolean,
            default: true
        }
    },
    usage: {
        userCount: {
            type: Number,
            default: 1,
            min: 0
        },
        fleetCount: {
            type: Number,
            default: 0,
            min: 0
        },
        vehicleCount: {
            type: Number,
            default: 0,
            min: 0
        },
        apiCalls: {
            type: Number,
            default: 0,
            min: 0
        },
        storageUsed: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'pending', 'cancelled'],
        default: 'active'
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
corporateAccountSchema.index({ tenantId: 1 }, { unique: true });
corporateAccountSchema.index({ adminUser: 1 });
corporateAccountSchema.index({ 'subscription.status': 1 });
corporateAccountSchema.index({ status: 1 });
corporateAccountSchema.index({ createdAt: -1 });

// Pre-save middleware
corporateAccountSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Virtual for subscription status
corporateAccountSchema.virtual('isSubscriptionActive').get(function() {
    if (this.subscription.status !== 'active') return false;
    if (this.subscription.endDate && this.subscription.endDate < new Date()) return false;
    return true;
});

// Virtual for usage limits
corporateAccountSchema.virtual('usageLimits').get(function() {
    const limits = {
        users: this.settings.maxUsers,
        vehicles: this.settings.maxVehicles,
        fleets: this.settings.maxFleets
    };
    
    // Adjust limits based on subscription plan
    switch (this.subscription.plan) {
        case 'enterprise':
            limits.users = -1; // Unlimited
            limits.vehicles = -1; // Unlimited
            limits.fleets = -1; // Unlimited
            break;
        case 'professional':
            limits.users *= 5;
            limits.vehicles *= 5;
            limits.fleets *= 2;
            break;
    }
    
    return limits;
});

// Virtual for usage status
corporateAccountSchema.virtual('usageStatus').get(function() {
    const limits = this.usageLimits;
    const usage = this.usage;
    
    return {
        users: {
            used: usage.userCount,
            limit: limits.users,
            percentage: limits.users > 0 ? (usage.userCount / limits.users) * 100 : 0
        },
        vehicles: {
            used: usage.vehicleCount,
            limit: limits.vehicles,
            percentage: limits.vehicles > 0 ? (usage.vehicleCount / limits.vehicles) * 100 : 0
        },
        fleets: {
            used: usage.fleetCount,
            limit: limits.fleets,
            percentage: limits.fleets > 0 ? (usage.fleetCount / limits.fleets) * 100 : 0
        }
    };
});

// Instance methods
corporateAccountSchema.methods.canAddUser = function() {
    const limits = this.usageLimits;
    return limits.users === -1 || this.usage.userCount < limits.users;
};

corporateAccountSchema.methods.canAddVehicle = function() {
    const limits = this.usageLimits;
    return limits.vehicles === -1 || this.usage.vehicleCount < limits.vehicles;
};

corporateAccountSchema.methods.canAddFleet = function() {
    const limits = this.usageLimits;
    return limits.fleets === -1 || this.usage.fleetCount < limits.fleets;
};

corporateAccountSchema.methods.addUser = function() {
    if (this.canAddUser()) {
        this.usage.userCount++;
        return this.save();
    }
    throw new Error('User limit exceeded');
};

corporateAccountSchema.methods.removeUser = function() {
    if (this.usage.userCount > 0) {
        this.usage.userCount--;
        return this.save();
    }
    return false;
};

corporateAccountSchema.methods.addVehicle = function() {
    if (this.canAddVehicle()) {
        this.usage.vehicleCount++;
        return this.save();
    }
    throw new Error('Vehicle limit exceeded');
};

corporateAccountSchema.methods.removeVehicle = function() {
    if (this.usage.vehicleCount > 0) {
        this.usage.vehicleCount--;
        return this.save();
    }
    return false;
};

corporateAccountSchema.methods.addFleet = function() {
    if (this.canAddFleet()) {
        this.usage.fleetCount++;
        return this.save();
    }
    throw new Error('Fleet limit exceeded');
};

corporateAccountSchema.methods.removeFleet = function() {
    if (this.usage.fleetCount > 0) {
        this.usage.fleetCount--;
        return this.save();
    }
    return false;
};

corporateAccountSchema.methods.updateSubscription = function(subscriptionData) {
    this.subscription = {
        ...this.subscription,
        ...subscriptionData,
        updatedAt: new Date()
    };
    
    // Update settings based on new plan
    this.updateSettingsForPlan(subscriptionData.plan);
    
    return this.save();
};

corporateAccountSchema.methods.updateSettingsForPlan = function(plan) {
    switch (plan) {
        case 'enterprise':
            this.settings.maxUsers = -1; // Unlimited
            this.settings.maxVehicles = -1; // Unlimited
            this.settings.maxFleets = -1; // Unlimited
            this.settings.features.apiAccess = true;
            this.settings.features.whiteLabel = true;
            break;
        case 'professional':
            this.settings.maxUsers = 500;
            this.settings.maxVehicles = 5000;
            this.settings.maxFleets = 50;
            this.settings.features.apiAccess = true;
            this.settings.features.whiteLabel = false;
            break;
        case 'basic':
            this.settings.maxUsers = 100;
            this.settings.maxVehicles = 1000;
            this.settings.maxFleets = 10;
            this.settings.features.apiAccess = false;
            this.settings.features.whiteLabel = false;
            break;
    }
};

corporateAccountSchema.methods.suspendAccount = function(reason = '') {
    this.status = 'suspended';
    this.subscription.status = 'suspended';
    return this.save();
};

corporateAccountSchema.methods.activateAccount = function() {
    this.status = 'active';
    this.subscription.status = 'active';
    return this.save();
};

corporateAccountSchema.methods.cancelAccount = function(reason = '') {
    this.status = 'cancelled';
    this.subscription.status = 'cancelled';
    this.subscription.autoRenew = false;
    return this.save();
};

// Static methods
corporateAccountSchema.statics.findByTenant = function(tenantId) {
    return this.findOne({ tenantId });
};

corporateAccountSchema.statics.findByAdmin = function(adminUserId) {
    return this.findOne({ adminUser: adminUserId });
};

corporateAccountSchema.statics.findActiveAccounts = function() {
    return this.find({ 
        status: 'active',
        'subscription.status': 'active'
    });
};

corporateAccountSchema.statics.findExpiredSubscriptions = function() {
    return this.find({
        'subscription.endDate': { $lt: new Date() },
        'subscription.status': 'active'
    });
};

corporateAccountSchema.statics.getAccountStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: null,
                totalAccounts: { $sum: 1 },
                activeAccounts: {
                    $sum: {
                        $cond: [
                            { $eq: ['$status', 'active'] },
                            1,
                            0
                        ]
                    }
                },
                totalUsers: { $sum: '$usage.userCount' },
                totalVehicles: { $sum: '$usage.vehicleCount' },
                totalFleets: { $sum: '$usage.fleetCount' }
            }
        }
    ]);
};

module.exports = mongoose.model('CorporateAccount', corporateAccountSchema);
