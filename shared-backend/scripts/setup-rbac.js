const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
require('dotenv').config();

async function setupRBAC() {
  try {
    console.log('🚀 Starting RBAC setup...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to database');

    // Step 1: Create all permissions
    console.log('📋 Creating permissions...');
    await Permission.createDefaultPermissions();
    const permissionCount = await Permission.countDocuments({ isActive: true });
    console.log(`✅ Created ${permissionCount} permissions`);

    // Step 2: Create all roles
    console.log('👥 Creating roles...');
    await Role.createDefaultRoles();
    const roleCount = await Role.countDocuments({ isActive: true });
    console.log(`✅ Created ${roleCount} roles`);

    // Step 3: Assign specific permissions to roles (except head_administrator and platform_admin)
    console.log('🔗 Assigning permissions to roles...');
    await assignRolePermissions();

    // Step 4: Assign head administrator role to ziad@yourclutch.com
    console.log('👑 Assigning head administrator role to ziad@yourclutch.com...');
    await assignHeadAdministratorRole();

    console.log('🎉 RBAC setup completed successfully!');
    
  } catch (error) {
    console.error('❌ RBAC setup failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

async function assignRolePermissions() {
  const Permission = mongoose.model('Permission');
  const Role = mongoose.model('Role');

  // Get all permissions grouped by group
  const permissions = await Permission.find({ isActive: true });
  const permissionsByGroup = permissions.reduce((groups, permission) => {
    if (!groups[permission.groupName]) {
      groups[permission.groupName] = [];
    }
    groups[permission.groupName].push(permission._id);
    return groups;
  }, {});

  // Define role permission mappings
  const rolePermissionMappings = {
    enterprise_client: [
      'FLEET_OPERATIONS',
      'BUSINESS_CUSTOMER',
      'CORE_SYSTEM_DASHBOARD'
    ],
    service_provider: [
      'COMMUNICATION_SUPPORT',
      'BUSINESS_CUSTOMER'
    ],
    business_analyst: [
      'CORE_SYSTEM_DASHBOARD',
      'ADMINISTRATION_CONFIG'
    ],
    customer_support: [
      'COMMUNICATION_SUPPORT',
      'BUSINESS_CUSTOMER'
    ],
    hr_manager: [
      'USER_ORGANIZATION',
      'COMMUNICATION_SUPPORT'
    ],
    finance_officer: [
      'BUSINESS_CUSTOMER'
    ],
    legal_team: [
      'BUSINESS_CUSTOMER'
    ],
    project_manager: [
      'ADMINISTRATION_CONFIG',
      'USER_ORGANIZATION',
      'CORE_SYSTEM_DASHBOARD'
    ],
    asset_manager: [
      'FLEET_OPERATIONS',
      'BUSINESS_CUSTOMER'
    ],
    vendor_manager: [
      'FLEET_OPERATIONS',
      'BUSINESS_CUSTOMER'
    ]
  };

  // Assign permissions to each role
  for (const [roleName, groupNames] of Object.entries(rolePermissionMappings)) {
    const role = await Role.findOne({ name: roleName });
    if (role) {
      const permissionIds = [];
      for (const groupName of groupNames) {
        if (permissionsByGroup[groupName]) {
          permissionIds.push(...permissionsByGroup[groupName]);
        }
      }
      
      role.permissions = permissionIds;
      await role.save();
      console.log(`  ✅ Assigned ${permissionIds.length} permissions to ${roleName}`);
    }
  }
}

async function assignHeadAdministratorRole() {
  const Employee = mongoose.model('Employee');
  const Role = mongoose.model('Role');

  // Find or create ziad@yourclutch.com employee
  let employee = await Employee.findOne({ 'basicInfo.email': 'ziad@yourclutch.com' });
  
  if (!employee) {
    console.log('  📝 Creating employee record for ziad@yourclutch.com...');
    
    // Create employee with basic info
    employee = new Employee({
      basicInfo: {
        firstName: 'Ziad',
        lastName: 'CEO',
        email: 'ziad@yourclutch.com'
      },
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', // hashed version of a default password
      role: 'head_administrator',
      isActive: true
    });
    
    await employee.save();
    console.log('  ✅ Created employee record for ziad@yourclutch.com');
  } else {
    console.log('  👤 Found existing employee record for ziad@yourclutch.com');
  }

  // Get head administrator role
  const headAdminRole = await Role.findOne({ name: 'head_administrator' });
  if (!headAdminRole) {
    throw new Error('Head administrator role not found');
  }

  // Assign head administrator role
  employee.role = 'head_administrator';
  employee.roles = [headAdminRole._id];
  await employee.save();

  console.log('  ✅ Assigned head administrator role to ziad@yourclutch.com');
  console.log('  🔑 Employee ID:', employee._id);
  console.log('  📧 Email:', employee.basicInfo.email);
  console.log('  👑 Role:', employee.role);
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
