const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
require('dotenv').config();

async function testRBAC() {
  try {
    console.log('🧪 Starting RBAC test...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to database');

    // Test 1: Check if permissions were created
    console.log('\n📋 Test 1: Checking permissions...');
    const permissionCount = await Permission.countDocuments({ isActive: true });
    console.log(`  Total permissions: ${permissionCount}`);
    
    const permissionsByGroup = await Permission.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$groupName', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('  Permissions by group:');
    permissionsByGroup.forEach(group => {
      console.log(`    ${group._id}: ${group.count} permissions`);
    });

    // Test 2: Check if roles were created
    console.log('\n👥 Test 2: Checking roles...');
    const roleCount = await Role.countDocuments({ isActive: true });
    console.log(`  Total roles: ${roleCount}`);
    
    const roles = await Role.find({ isActive: true })
      .populate('permissions', 'name groupName')
      .sort({ priority: 1 });
    
    console.log('  Roles with permission counts:');
    roles.forEach(role => {
      console.log(`    ${role.name} (${role.displayName}): ${role.permissions.length} permissions`);
    });

    // Test 3: Check ziad@yourclutch.com employee
    console.log('\n👤 Test 3: Checking ziad@yourclutch.com employee...');
    const ziadEmployee = await Employee.findOne({ 'basicInfo.email': 'ziad@yourclutch.com' })
      .populate('roles', 'name displayName permissions');
    
    if (ziadEmployee) {
      console.log(`  ✅ Found employee: ${ziadEmployee.basicInfo.firstName} ${ziadEmployee.basicInfo.lastName}`);
      console.log(`  📧 Email: ${ziadEmployee.basicInfo.email}`);
      console.log(`  👑 Primary role: ${ziadEmployee.role}`);
      console.log(`  🔑 Assigned roles: ${ziadEmployee.roles.length}`);
      
      // Test permissions
      const hasViewDashboard = await ziadEmployee.hasPermission('view_dashboard');
      const hasManageUsers = await ziadEmployee.hasPermission('create_users');
      const hasViewSettings = await ziadEmployee.hasPermission('view_settings');
      
      console.log(`  🔍 Permission tests:`);
      console.log(`    view_dashboard: ${hasViewDashboard ? '✅' : '❌'}`);
      console.log(`    create_users: ${hasManageUsers ? '✅' : '❌'}`);
      console.log(`    view_settings: ${hasViewSettings ? '✅' : '❌'}`);
      
      // Get all permissions
      const allPermissions = await ziadEmployee.getAllPermissions();
      console.log(`  📊 Total permissions: ${allPermissions.length}`);
      
      // Group permissions
      const groupedPermissions = allPermissions.reduce((groups, permission) => {
        if (!groups[permission.groupName]) {
          groups[permission.groupName] = 0;
        }
        groups[permission.groupName]++;
        return groups;
      }, {});
      
      console.log('  📋 Permissions by group:');
      Object.entries(groupedPermissions).forEach(([group, count]) => {
        console.log(`    ${group}: ${count} permissions`);
      });
      
    } else {
      console.log('  ❌ ziad@yourclutch.com employee not found');
    }

    // Test 4: Test role permission assignments
    console.log('\n🔗 Test 4: Testing role permission assignments...');
    const testRoles = ['enterprise_client', 'hr_manager', 'finance_officer'];
    
    for (const roleName of testRoles) {
      const role = await Role.findOne({ name: roleName }).populate('permissions', 'name groupName');
      if (role) {
        console.log(`  ${role.displayName}: ${role.permissions.length} permissions`);
        
        // Show first few permissions
        const samplePermissions = role.permissions.slice(0, 3).map(p => p.name);
        console.log(`    Sample permissions: ${samplePermissions.join(', ')}${role.permissions.length > 3 ? '...' : ''}`);
      } else {
        console.log(`  ❌ Role ${roleName} not found`);
      }
    }

    // Test 5: Test permission checking
    console.log('\n🔍 Test 5: Testing permission checking...');
    if (ziadEmployee) {
      const testPermissions = [
        'view_dashboard',
        'create_users',
        'manage_fleet',
        'view_ai_dashboard',
        'manage_settings',
        'nonexistent_permission'
      ];
      
      for (const permission of testPermissions) {
        const hasPermission = await ziadEmployee.hasPermission(permission);
        console.log(`    ${permission}: ${hasPermission ? '✅' : '❌'}`);
      }
    }

    console.log('\n🎉 RBAC test completed successfully!');
    
  } catch (error) {
    console.error('❌ RBAC test failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testRBAC()
    .then(() => {
      console.log('🎉 RBAC test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ RBAC test failed:', error);
      process.exit(1);
    });
}

module.exports = { testRBAC };
