const mongoose = require('../shims/mongoose');

const timeBasedAccessSchema = new mongoose.Schema({
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    daysOfWeek: {
        type: [String],
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    timeZone: {
        type: String,
        default: 'UTC'
    }
});

const conditionalPermissionSchema = new mongoose.Schema({
    condition: {
        type: String,
        enum: ['time_based', 'location_based', 'device_based', 'ip_based', 'custom'],
        required: true
    },
    parameters: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    permissions: {
        type: [String],
        required: true
    }
});

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    permissions: {
        type: [String],
        default: []
    },
    priority: {
        type: Number,
        default: 100,
        min: 1,
        max: 1000
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isSystem: {
        type: Boolean,
        default: false
    },
    timeBasedAccess: timeBasedAccessSchema,
    conditionalPermissions: [conditionalPermissionSchema],
    inheritsFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
roleSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Indexes for efficient querying
// roleSchema.index({ name: 1 }); // Removed - unique: true already creates index
roleSchema.index({ isActive: 1 });
roleSchema.index({ priority: 1 });
roleSchema.index({ isSystem: 1 });

// Virtual for checking if role has time-based access
roleSchema.virtual('hasTimeBasedAccess').get(function() {
    return !!this.timeBasedAccess;
});

// Virtual for checking if role is currently active based on time
roleSchema.virtual('isCurrentlyActive').get(function() {
    if (!this.timeBasedAccess) return this.isActive;
    
    const now = new Date();
    const startTime = new Date(this.timeBasedAccess.startTime);
    const endTime = new Date(this.timeBasedAccess.endTime);
    
    return this.isActive && now >= startTime && now <= endTime;
});

// Method to check if role has a specific permission
roleSchema.methods.hasPermission = function(permission) {
    return this.permissions.includes(permission);
};

// Method to add permission to role
roleSchema.methods.addPermission = function(permission) {
    if (!this.permissions.includes(permission)) {
        this.permissions.push(permission);
    }
    return this;
};

// Method to remove permission from role
roleSchema.methods.removePermission = function(permission) {
    this.permissions = this.permissions.filter(p => p !== permission);
    return this;
};

// Method to get all effective permissions (including inherited)
roleSchema.methods.getEffectivePermissions = async function() {
    const permissions = new Set(this.permissions);
    
    if (this.inheritsFrom) {
        const parentRole = await mongoose.model('Role').findById(this.inheritsFrom);
        if (parentRole) {
            const parentPermissions = await parentRole.getEffectivePermissions();
            parentPermissions.forEach(permission => permissions.add(permission));
        }
    }
    
    return Array.from(permissions);
};

// Static method to create default roles
roleSchema.statics.createDefaultRoles = async function() {
    const defaultRoles = [
        {
            name: 'super_admin',
            description: 'Super Administrator with full system access',
            permissions: [
                '*:*:*' // Wildcard permission for everything
            ],
            priority: 1,
            isSystem: true,
            isActive: true
        },
        {
            name: 'admin',
            description: 'Administrator with administrative access',
            permissions: [
                'users:*:*',
                'roles:*:*',
                'audit:*:*',
                'system:*:*',
                'bookings:*:*',
                'payments:*:*',
                'fleet:*:*',
                'ai:*:*',
                'analytics:*:*',
                'reports:*:*'
            ],
            priority: 10,
            isSystem: true,
            isActive: true
        },
        {
            name: 'manager',
            description: 'Manager with operational access',
            permissions: [
                'users:read:*',
                'users:write:limited',
                'bookings:*:*',
                'payments:read:*',
                'payments:write:limited',
                'fleet:read:*',
                'fleet:write:limited',
                'analytics:read:*',
                'reports:read:*'
            ],
            priority: 50,
            isSystem: true,
            isActive: true
        },
        {
            name: 'operator',
            description: 'Operator with basic operational access',
            permissions: [
                'bookings:read:*',
                'bookings:write:own',
                'payments:read:own',
                'fleet:read:own',
                'analytics:read:own'
            ],
            priority: 100,
            isSystem: true,
            isActive: true
        },
        {
            name: 'customer',
            description: 'Customer with limited access',
            permissions: [
                'profile:read:own',
                'profile:write:own',
                'bookings:read:own',
                'bookings:write:own',
                'payments:read:own',
                'payments:write:own',
                'vehicles:read:own',
                'vehicles:write:own'
            ],
            priority: 200,
            isSystem: true,
            isActive: true
        },
        {
            name: 'partner',
            description: 'Business partner with partner access',
            permissions: [
                'profile:read:own',
                'profile:write:own',
                'bookings:read:assigned',
                'bookings:write:assigned',
                'payments:read:own',
                'payments:write:own',
                'fleet:read:own',
                'fleet:write:own',
                'analytics:read:own'
            ],
            priority: 150,
            isSystem: true,
            isActive: true
        }
    ];

    for (const roleData of defaultRoles) {
        const existingRole = await this.findOne({ name: roleData.name });
        if (!existingRole) {
            await this.create(roleData);
        }
    }
};

// Static method to get role by name
roleSchema.statics.findByName = function(name) {
    return this.findOne({ name, isActive: true });
};

// Static method to get all active roles
roleSchema.statics.getActiveRoles = function() {
    return this.find({ isActive: true }).sort({ priority: 1 });
};

// Static method to get system roles
roleSchema.statics.getSystemRoles = function() {
    return this.find({ isSystem: true, isActive: true }).sort({ priority: 1 });
};

module.exports = mongoose.model('Role', roleSchema);
