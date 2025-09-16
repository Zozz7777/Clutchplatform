const mongoose = require('../shims/mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 50
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isSystem: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        default: 100,
        min: 1,
        max: 1000
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for efficient querying
roleSchema.index({ name: 1 });
roleSchema.index({ isActive: 1 });
roleSchema.index({ priority: 1 });
roleSchema.index({ isSystem: 1 });

// Method to check if role has a specific permission
roleSchema.methods.hasPermission = function(permissionId) {
    return this.permissions.some(p => p.toString() === permissionId.toString());
};

// Method to add permission to role
roleSchema.methods.addPermission = function(permissionId) {
    if (!this.hasPermission(permissionId)) {
        this.permissions.push(permissionId);
    }
    return this;
};

// Method to remove permission from role
roleSchema.methods.removePermission = function(permissionId) {
    this.permissions = this.permissions.filter(p => p.toString() !== permissionId.toString());
    return this;
};

// Method to get all permissions with details
roleSchema.methods.getPermissionsWithDetails = async function() {
    const Permission = mongoose.model('Permission');
    return await Permission.find({ _id: { $in: this.permissions }, isActive: true });
};

// Static method to create default roles
roleSchema.statics.createDefaultRoles = async function() {
    const Permission = mongoose.model('Permission');
    
    // Get all permissions for head administrator
    const allPermissions = await Permission.find({ isActive: true });
    const allPermissionIds = allPermissions.map(p => p._id);
    
    const defaultRoles = [
        {
            name: 'head_administrator',
            displayName: 'Head Administrator',
            description: 'Highest level of access, can manage everything',
            permissions: allPermissionIds, // All 90 permissions
            priority: 1,
            isSystem: true,
            isActive: true
        },
        {
            name: 'platform_admin',
            displayName: 'Platform Administrator',
            description: 'Platform administration with full access',
            permissions: allPermissionIds, // Full access for backward compatibility
            priority: 10,
            isSystem: true,
            isActive: true
        },
        {
            name: 'enterprise_client',
            displayName: 'Enterprise Client',
            description: 'Fleet, CRM, Analytics, Reports access',
            permissions: [], // Will be populated with specific permissions
            priority: 50,
            isSystem: true,
            isActive: true
        },
        {
            name: 'service_provider',
            displayName: 'Service Provider',
            description: 'Chat, CRM, Communication access',
            permissions: [], // Will be populated with specific permissions
            priority: 60,
            isSystem: true,
            isActive: true
        },
        {
            name: 'business_analyst',
            displayName: 'Business Analyst',
            description: 'Analytics, Reports, Business Intelligence access',
            permissions: [], // Will be populated with specific permissions
            priority: 70,
            isSystem: true,
            isActive: true
        },
        {
            name: 'customer_support',
            displayName: 'Customer Support',
            description: 'CRM, Chat, Communication, Support access',
            permissions: [], // Will be populated with specific permissions
            priority: 80,
            isSystem: true,
            isActive: true
        },
        {
            name: 'hr_manager',
            displayName: 'HR Manager',
            description: 'HR, Users, Employee Management access',
            permissions: [], // Will be populated with specific permissions
            priority: 90,
            isSystem: true,
            isActive: true
        },
        {
            name: 'finance_officer',
            displayName: 'Finance Officer',
            description: 'Finance, Billing, Payments access',
            permissions: [], // Will be populated with specific permissions
            priority: 100,
            isSystem: true,
            isActive: true
        },
        {
            name: 'legal_team',
            displayName: 'Legal Team',
            description: 'Legal, Contracts access',
            permissions: [], // Will be populated with specific permissions
            priority: 110,
            isSystem: true,
            isActive: true
        },
        {
            name: 'project_manager',
            displayName: 'Project Manager',
            description: 'Projects, Users, Analytics access',
            permissions: [], // Will be populated with specific permissions
            priority: 120,
            isSystem: true,
            isActive: true
        },
        {
            name: 'asset_manager',
            displayName: 'Asset Manager',
            description: 'Assets, Fleet, Operations access',
            permissions: [], // Will be populated with specific permissions
            priority: 130,
            isSystem: true,
            isActive: true
        },
        {
            name: 'vendor_manager',
            displayName: 'Vendor Manager',
            description: 'Vendors, Assets, Operations access',
            permissions: [], // Will be populated with specific permissions
            priority: 140,
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
