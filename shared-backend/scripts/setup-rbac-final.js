const mongoose = require('mongoose');
require('dotenv').config();

async function setupRBAC() {
  try {
    console.log('🚀 Starting RBAC setup...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch');
    console.log('✅ Connected to database');

    // Get database connection
    const db = mongoose.connection.db;

    // Step 1: Create permissions collection and insert permissions
    console.log('📋 Creating permissions...');
    const permissionsCollection = db.collection('permissions');
    
    const permissions = [
      // Core System & Dashboard (12 permissions)
      { name: 'view_dashboard', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'View dashboard and overview', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_analytics', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'View analytics and reports', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'export_analytics', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'Export analytics data', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_system_health', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'View system health metrics', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_kpi_metrics', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'View KPI metrics', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_kpi_metrics', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'Manage KPI metrics', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_business_intelligence', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'View business intelligence', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_business_intelligence', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'Manage business intelligence', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_dashboard_config', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'View dashboard configuration', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_dashboard_config', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'Manage dashboard configuration', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_system_monitoring', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'View system monitoring', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_system_monitoring', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'Manage system monitoring', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // User & Organization (12 permissions)
      { name: 'view_users', groupName: 'USER_ORGANIZATION', description: 'View user information', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'create_users', groupName: 'USER_ORGANIZATION', description: 'Create new users', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'edit_users', groupName: 'USER_ORGANIZATION', description: 'Edit user information', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'delete_users', groupName: 'USER_ORGANIZATION', description: 'Delete users', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_employees', groupName: 'USER_ORGANIZATION', description: 'View employee information', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_employees', groupName: 'USER_ORGANIZATION', description: 'Manage employee information', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_hr', groupName: 'USER_ORGANIZATION', description: 'View HR information', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_hr', groupName: 'USER_ORGANIZATION', description: 'Manage HR information', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_onboarding', groupName: 'USER_ORGANIZATION', description: 'View onboarding process', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_onboarding', groupName: 'USER_ORGANIZATION', description: 'Manage onboarding process', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_profiles', groupName: 'USER_ORGANIZATION', description: 'View user profiles', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_profiles', groupName: 'USER_ORGANIZATION', description: 'Manage user profiles', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Fleet & Operations (8 permissions)
      { name: 'view_fleet', groupName: 'FLEET_OPERATIONS', description: 'View fleet information', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_fleet', groupName: 'FLEET_OPERATIONS', description: 'Manage fleet operations', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_gps_tracking', groupName: 'FLEET_OPERATIONS', description: 'View GPS tracking data', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_assets', groupName: 'FLEET_OPERATIONS', description: 'View asset information', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_assets', groupName: 'FLEET_OPERATIONS', description: 'Manage assets', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_vendors', groupName: 'FLEET_OPERATIONS', description: 'View vendor information', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_vendors', groupName: 'FLEET_OPERATIONS', description: 'Manage vendors', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_operations', groupName: 'FLEET_OPERATIONS', description: 'View operations data', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Business & Customer (16 permissions)
      { name: 'view_crm', groupName: 'BUSINESS_CUSTOMER', description: 'View CRM data', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_crm', groupName: 'BUSINESS_CUSTOMER', description: 'Manage CRM data', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_enterprise', groupName: 'BUSINESS_CUSTOMER', description: 'View enterprise data', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_enterprise', groupName: 'BUSINESS_CUSTOMER', description: 'Manage enterprise data', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_finance', groupName: 'BUSINESS_CUSTOMER', description: 'View financial data', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_finance', groupName: 'BUSINESS_CUSTOMER', description: 'Manage financial data', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'process_payments', groupName: 'BUSINESS_CUSTOMER', description: 'Process payments', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_billing', groupName: 'BUSINESS_CUSTOMER', description: 'View billing information', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_billing', groupName: 'BUSINESS_CUSTOMER', description: 'Manage billing', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_legal', groupName: 'BUSINESS_CUSTOMER', description: 'View legal information', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_legal', groupName: 'BUSINESS_CUSTOMER', description: 'Manage legal information', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_contracts', groupName: 'BUSINESS_CUSTOMER', description: 'View contracts', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_contracts', groupName: 'BUSINESS_CUSTOMER', description: 'Manage contracts', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_partners', groupName: 'BUSINESS_CUSTOMER', description: 'View partner information', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_partners', groupName: 'BUSINESS_CUSTOMER', description: 'Manage partners', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_customer_data', groupName: 'BUSINESS_CUSTOMER', description: 'View customer data', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Technology & Development (16 permissions)
      { name: 'view_ai_dashboard', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View AI dashboard', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_ai_models', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'Manage AI models', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_mobile_apps', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View mobile applications', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_mobile_apps', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'Manage mobile applications', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_cms', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View CMS', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_cms', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'Manage CMS', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_integrations', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View integrations', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_integrations', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'Manage integrations', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_api_docs', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View API documentation', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_feature_flags', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View feature flags', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_feature_flags', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'Manage feature flags', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_scheduled_jobs', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View scheduled jobs', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_scheduled_jobs', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'Manage scheduled jobs', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_development_tools', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View development tools', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_development_tools', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'Manage development tools', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_technical_documentation', groupName: 'TECHNOLOGY_DEVELOPMENT', description: 'View technical documentation', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Communication & Support (10 permissions)
      { name: 'view_chat', groupName: 'COMMUNICATION_SUPPORT', description: 'View chat messages', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'send_messages', groupName: 'COMMUNICATION_SUPPORT', description: 'Send messages', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_communication', groupName: 'COMMUNICATION_SUPPORT', description: 'View communication tools', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_communication', groupName: 'COMMUNICATION_SUPPORT', description: 'Manage communication', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_support', groupName: 'COMMUNICATION_SUPPORT', description: 'View support tickets', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_support', groupName: 'COMMUNICATION_SUPPORT', description: 'Manage support tickets', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_feedback', groupName: 'COMMUNICATION_SUPPORT', description: 'View feedback', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_feedback', groupName: 'COMMUNICATION_SUPPORT', description: 'Manage feedback', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_announcements', groupName: 'COMMUNICATION_SUPPORT', description: 'View announcements', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_announcements', groupName: 'COMMUNICATION_SUPPORT', description: 'Manage announcements', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Administration & Config (16 permissions)
      { name: 'view_settings', groupName: 'ADMINISTRATION_CONFIG', description: 'View system settings', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_settings', groupName: 'ADMINISTRATION_CONFIG', description: 'Manage system settings', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_reports', groupName: 'ADMINISTRATION_CONFIG', description: 'View reports', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'generate_reports', groupName: 'ADMINISTRATION_CONFIG', description: 'Generate reports', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_audit_trail', groupName: 'ADMINISTRATION_CONFIG', description: 'View audit trail', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_marketing', groupName: 'ADMINISTRATION_CONFIG', description: 'View marketing tools', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_marketing', groupName: 'ADMINISTRATION_CONFIG', description: 'Manage marketing', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_projects', groupName: 'ADMINISTRATION_CONFIG', description: 'View projects', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_projects', groupName: 'ADMINISTRATION_CONFIG', description: 'Manage projects', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_localization', groupName: 'ADMINISTRATION_CONFIG', description: 'View localization settings', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_localization', groupName: 'ADMINISTRATION_CONFIG', description: 'Manage localization', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_accessibility', groupName: 'ADMINISTRATION_CONFIG', description: 'View accessibility settings', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_accessibility', groupName: 'ADMINISTRATION_CONFIG', description: 'Manage accessibility', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_system_config', groupName: 'ADMINISTRATION_CONFIG', description: 'View system configuration', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'manage_system_config', groupName: 'ADMINISTRATION_CONFIG', description: 'Manage system configuration', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'view_security_settings', groupName: 'ADMINISTRATION_CONFIG', description: 'View security settings', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ];

    // Insert permissions
    const result = await permissionsCollection.insertMany(permissions, { ordered: false });
    console.log(`✅ Created ${result.insertedCount} permissions`);

    // Step 2: Get all permissions and create roles
    console.log('👥 Creating roles...');
    const allPermissions = await permissionsCollection.find({ isActive: true }).toArray();
    console.log(`Found ${allPermissions.length} total permissions`);
    
    const allPermissionIds = allPermissions.map(p => p._id);

    const rolesCollection = db.collection('roles');
    const roles = [
      {
        name: 'head_administrator',
        displayName: 'Head Administrator',
        description: 'Highest level of access, can manage everything',
        permissions: allPermissionIds,
        priority: 1,
        isSystem: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'platform_admin',
        displayName: 'Platform Administrator',
        description: 'Platform administration with full access',
        permissions: allPermissionIds,
        priority: 10,
        isSystem: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const roleResult = await rolesCollection.insertMany(roles, { ordered: false });
    console.log(`✅ Created ${roleResult.insertedCount} roles`);

    // Step 3: Assign head administrator role to ziad@yourclutch.com
    console.log('👑 Assigning head administrator role to ziad@yourclutch.com...');
    await assignHeadAdministratorRole(db);

    console.log('🎉 RBAC setup completed successfully!');
    
  } catch (error) {
    console.error('❌ RBAC setup failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

async function assignHeadAdministratorRole(db) {
  const employeesCollection = db.collection('employees');
  const rolesCollection = db.collection('roles');

  // Find or create ziad@yourclutch.com employee
  let employee = await employeesCollection.findOne({ 'basicInfo.email': 'ziad@yourclutch.com' });
  
  if (!employee) {
    console.log('  📝 Creating employee record for ziad@yourclutch.com...');
    
    // Create employee with basic info
    const newEmployee = {
      basicInfo: {
        firstName: 'Ziad',
        lastName: 'CEO',
        email: 'ziad@yourclutch.com'
      },
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', // hashed version of a default password
      role: 'head_administrator',
      roles: [],
      permissions: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const employeeResult = await employeesCollection.insertOne(newEmployee);
    employee = { _id: employeeResult.insertedId, ...newEmployee };
    console.log('  ✅ Created employee record for ziad@yourclutch.com');
  } else {
    console.log('  👤 Found existing employee record for ziad@yourclutch.com');
  }

  // Get head administrator role
  const headAdminRole = await rolesCollection.findOne({ name: 'head_administrator' });
  if (!headAdminRole) {
    throw new Error('Head administrator role not found');
  }

  // Assign head administrator role
  await employeesCollection.updateOne(
    { _id: employee._id },
    { 
      $set: { 
        role: 'head_administrator',
        roles: [headAdminRole._id],
        updatedAt: new Date()
      }
    }
  );

  console.log('  ✅ Assigned head administrator role to ziad@yourclutch.com');
  console.log('  🔑 Employee ID:', employee._id);
  console.log('  📧 Email:', employee.basicInfo.email);
  console.log('  👑 Role: head_administrator');
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupRBAC()
    .then(() => {
      console.log('🎉 RBAC setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ RBAC setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupRBAC };
