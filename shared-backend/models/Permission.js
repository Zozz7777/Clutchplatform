const mongoose = require('../shims/mongoose');

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 100
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    groupName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isSystem: {
        type: Boolean,
        default: false
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
permissionSchema.index({ name: 1 });
permissionSchema.index({ groupName: 1 });
permissionSchema.index({ isActive: 1 });
permissionSchema.index({ isSystem: 1 });

// Virtual for display name (fallback to name if displayName not set)
permissionSchema.virtual('displayNameFormatted').get(function() {
    return this.displayName || this.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
});

// Static method to create default permissions
permissionSchema.statics.createDefaultPermissions = async function() {
    const permissions = [
        // Core System & Dashboard (12 permissions)
        { name: 'view_dashboard', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'View dashboard and overview', isSystem: true },
        { name: 'view_analytics', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'View analytics and reports', isSystem: true },
        { name: 'export_analytics', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'Export analytics data', isSystem: true },
        { name: 'view_system_health', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'View system health metrics', isSystem: true },
        { name: 'view_kpi_metrics', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'View KPI metrics', isSystem: true },
        { name: 'manage_kpi_metrics', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'Manage KPI metrics', isSystem: true },
        { name: 'view_business_intelligence', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'View business intelligence', isSystem: true },
        { name: 'manage_business_intelligence', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'Manage business intelligence', isSystem: true },
        { name: 'view_dashboard_config', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'View dashboard configuration', isSystem: true },
        { name: 'manage_dashboard_config', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'Manage dashboard configuration', isSystem: true },
        { name: 'view_system_monitoring', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'View system monitoring', isSystem: true },
        { name: 'manage_system_monitoring', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'Manage system monitoring', isSystem: true },

        // User & Organization (12 permissions)
        { name: 'view_users', groupName: 'USER_ORGANIZATION', description: 'View user information', isSystem: true },
        { name: 'create_users', groupName: 'USER_ORGANIZATION', description: 'Create new users', isSystem: true },
        { name: 'edit_users', groupName: 'USER_ORGANIZATION', description: 'Edit user information', isSystem: true },
        { name: 'delete_users', groupName: 'USER_ORGANIZATION', description: 'Delete users', isSystem: true },
        { name: 'view_employees', groupName: 'USER_ORGANIZATION', description: 'View employee information', isSystem: true },
        { name: 'manage_employees', groupName: 'USER_ORGANIZATION', description: 'Manage employee information', isSystem: true },
        { name: 'view_hr', groupName: 'USER_ORGANIZATION', description: 'View HR information', isSystem: true },
        { name: 'manage_hr', groupName: 'USER_ORGANIZATION', description: 'Manage HR information', isSystem: true },
        { name: 'view_onboarding', groupName: 'USER_ORGANIZATION', description: 'View onboarding process', isSystem: true },
        { name: 'manage_onboarding', groupName: 'USER_ORGANIZATION', description: 'Manage onboarding process', isSystem: true },
        { name: 'view_profiles', groupName: 'USER_ORGANIZATION', description: 'View user profiles', isSystem: true },
        { name: 'manage_profiles', groupName: 'USER_ORGANIZATION', description: 'Manage user profiles', isSystem: true },

        // Fleet & Operations (8 permissions)
        { name: 'view_fleet', groupName: 'FLEET_OPERATIONS', description: 'View fleet information', isSystem: true },
        { name: 'manage_fleet', groupName: 'FLEET_OPERATIONS', description: 'Manage fleet operations', isSystem: true },
        { name: 'view_gps_tracking', groupName: 'FLEET_OPERATIONS', description: 'View GPS tracking data', isSystem: true },
        { name: 'view_assets', groupName: 'FLEET_OPERATIONS', description: 'View asset information', isSystem: true },
        { name: 'manage_assets', groupName: 'FLEET_OPERATIONS', description: 'Manage assets', isSystem: true },
        { name: 'view_vendors', groupName: 'FLEET_OPERATIONS', description: 'View vendor information', isSystem: true },
        { name: 'manage_vendors', groupName: 'FLEET_OPERATIONS', description: 'Manage vendors', isSystem: true },
        { name: 'view_operations', groupName: 'FLEET_OPERATIONS', description: 'View operations data', isSystem: true },

        // Business & Customer (16 permissions)
        { name: 'view_crm', groupName: 'BUSINESS_CUSTOMER', description: 'View CRM data', isSystem: true },
        { name: 'manage_crm', groupName: 'BUSINESS_CUSTOMER', description: 'Manage CRM data', isSystem: true },
        { name: 'view_enterprise', groupName: 'BUSINESS_CUSTOMER', description: 'View enterprise data', isSystem: true },
        { name: 'manage_enterprise', groupName: 'BUSINESS_CUSTOMER', description: 'Manage enterprise data', isSystem: true },
        { name: 'view_finance', groupName: 'BUSINESS_CUSTOMER', description: 'View financial data', isSystem: true },
        { name: 'manage_finance', groupName: 'BUSINESS_CUSTOMER', description: 'Manage financial data', isSystem: true },
        { name: 'process_payments', groupName: 'BUSINESS_CUSTOMER', description: 'Process payments', isSystem: true },
        { name: 'view_billing', groupName: 'BUSINESS_CUSTOMER', description: 'View billing information', isSystem: true },
        { name: 'manage_billing', groupName: 'BUSINESS_CUSTOMER', description: 'Manage billing', isSystem: true },
        { name: 'view_legal', groupName: 'BUSINESS_CUSTOMER', description: 'View legal information', isSystem: true },
        { name: 'manage_legal', groupName: 'BUSINESS_CUSTOMER', description: 'Manage legal information', isSystem: true },
        { name: 'view_contracts', groupName: 'BUSINESS_CUSTOMER', description: 'View contracts', isSystem: true },
        { name: 'manage_contracts', groupName: 'BUSINESS_CUSTOMER', description: 'Manage contracts', isSystem: true },
        { name: 'view_partners', groupName: 'BUSINESS_CUSTOMER', description: 'View partner information', isSystem: true },
        { name: 'manage_partners', groupName: 'BUSINESS_CUSTOMER', description: 'Manage partners', isSystem: true },
        { name: 'view_customer_data', groupName: 'BUSINESS_CUSTOMER', description: 'View customer data', isSystem: true },

        // Technology & Development (16 permissions)
        { name: 'view_ai_dashboard', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View AI dashboard', isSystem: true },
        { name: 'manage_ai_models', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'Manage AI models', isSystem: true },
        { name: 'view_mobile_apps', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View mobile applications', isSystem: true },
        { name: 'manage_mobile_apps', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'Manage mobile applications', isSystem: true },
        { name: 'view_cms', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View CMS', isSystem: true },
        { name: 'manage_cms', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'Manage CMS', isSystem: true },
        { name: 'view_integrations', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View integrations', isSystem: true },
        { name: 'manage_integrations', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'Manage integrations', isSystem: true },
        { name: 'view_api_docs', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View API documentation', isSystem: true },
        { name: 'view_feature_flags', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View feature flags', isSystem: true },
        { name: 'manage_feature_flags', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'Manage feature flags', isSystem: true },
        { name: 'view_scheduled_jobs', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View scheduled jobs', isSystem: true },
        { name: 'manage_scheduled_jobs', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'Manage scheduled jobs', isSystem: true },
        { name: 'view_development_tools', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View development tools', isSystem: true },
        { name: 'manage_development_tools', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'Manage development tools', isSystem: true },
        { name: 'view_technical_documentation', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View technical documentation', isSystem: true },

        // Communication & Support (10 permissions)
        { name: 'view_chat', groupName: 'COMMUNICATION_SUPPORT', description: 'View chat messages', isSystem: true },
        { name: 'send_messages', groupName: 'COMMUNICATION_SUPPORT', description: 'Send messages', isSystem: true },
        { name: 'view_communication', groupName: 'COMMUNICATION_SUPPORT', description: 'View communication tools', isSystem: true },
        { name: 'manage_communication', groupName: 'COMMUNICATION_SUPPORT', description: 'Manage communication', isSystem: true },
        { name: 'view_support', groupName: 'COMMUNICATION_SUPPORT', description: 'View support tickets', isSystem: true },
        { name: 'manage_support', groupName: 'COMMUNICATION_SUPPORT', description: 'Manage support tickets', isSystem: true },
        { name: 'view_feedback', groupName: 'COMMUNICATION_SUPPORT', description: 'View feedback', isSystem: true },
        { name: 'manage_feedback', groupName: 'COMMUNICATION_SUPPORT', description: 'Manage feedback', isSystem: true },
        { name: 'view_announcements', groupName: 'COMMUNICATION_SUPPORT', description: 'View announcements', isSystem: true },
        { name: 'manage_announcements', groupName: 'COMMUNICATION_SUPPORT', description: 'Manage announcements', isSystem: true },

        // Administration & Config (16 permissions)
        { name: 'view_settings', groupName: 'ADMINISTRATION_CONFIG', description: 'View system settings', isSystem: true },
        { name: 'manage_settings', groupName: 'ADMINISTRATION_CONFIG', description: 'Manage system settings', isSystem: true },
        { name: 'view_reports', groupName: 'ADMINISTRATION_CONFIG', description: 'View reports', isSystem: true },
        { name: 'generate_reports', groupName: 'ADMINISTRATION_CONFIG', description: 'Generate reports', isSystem: true },
        { name: 'view_audit_trail', groupName: 'ADMINISTRATION_CONFIG', description: 'View audit trail', isSystem: true },
        { name: 'view_marketing', groupName: 'ADMINISTRATION_CONFIG', description: 'View marketing tools', isSystem: true },
        { name: 'manage_marketing', groupName: 'ADMINISTRATION_CONFIG', description: 'Manage marketing', isSystem: true },
        { name: 'view_projects', groupName: 'ADMINISTRATION_CONFIG', description: 'View projects', isSystem: true },
        { name: 'manage_projects', groupName: 'ADMINISTRATION_CONFIG', description: 'Manage projects', isSystem: true },
        { name: 'view_localization', groupName: 'ADMINISTRATION_CONFIG', description: 'View localization settings', isSystem: true },
        { name: 'manage_localization', groupName: 'ADMINISTRATION_CONFIG', description: 'Manage localization', isSystem: true },
        { name: 'view_accessibility', groupName: 'ADMINISTRATION_CONFIG', description: 'View accessibility settings', isSystem: true },
        { name: 'manage_accessibility', groupName: 'ADMINISTRATION_CONFIG', description: 'Manage accessibility', isSystem: true },
        { name: 'view_system_config', groupName: 'ADMINISTRATION_CONFIG', description: 'View system configuration', isSystem: true },
        { name: 'manage_system_config', groupName: 'ADMINISTRATION_CONFIG', description: 'Manage system configuration', isSystem: true },
        { name: 'view_security_settings', groupName: 'ADMINISTRATION_CONFIG', description: 'View security settings', isSystem: true }
    ];

    for (const permissionData of permissions) {
        const existingPermission = await this.findOne({ name: permissionData.name });
        if (!existingPermission) {
            await this.create(permissionData);
        }
    }
};

module.exports = mongoose.model('Permission', permissionSchema);