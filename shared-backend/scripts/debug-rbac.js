const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
require('dotenv').config();

async function debugRBAC() {
  try {
    console.log('🔍 Starting RBAC debug...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch');
    console.log('✅ Connected to database');

    // Check if Permission model is working
    console.log('\n📋 Testing Permission model...');
    try {
      const testPermission = new Permission({
        name: 'test_permission',
        groupName: 'CORE_SYSTEM_DASHBOARD',
        description: 'Test permission',
        isSystem: true
      });
      
      await testPermission.save();
      console.log('✅ Permission model is working');
      
      // Clean up test permission
      await Permission.deleteOne({ name: 'test_permission' });
      console.log('✅ Test permission cleaned up');
      
    } catch (error) {
      console.error('❌ Permission model error:', error.message);
    }

    // Check existing permissions
    console.log('\n📊 Checking existing permissions...');
    const existingPermissions = await Permission.find({});
    console.log(`Found ${existingPermissions.length} existing permissions`);
    
    if (existingPermissions.length > 0) {
      console.log('Sample permissions:');
      existingPermissions.slice(0, 5).forEach(p => {
        console.log(`  - ${p.name} (${p.groupName})`);
      });
    }

    // Check existing roles
    console.log('\n👥 Checking existing roles...');
    const existingRoles = await Role.find({});
    console.log(`Found ${existingRoles.length} existing roles`);
    
    if (existingRoles.length > 0) {
      console.log('Sample roles:');
      existingRoles.slice(0, 5).forEach(r => {
        console.log(`  - ${r.name} (${r.displayName})`);
      });
    }

    // Check existing employees
    console.log('\n👤 Checking existing employees...');
    const existingEmployees = await Employee.find({});
    console.log(`Found ${existingEmployees.length} existing employees`);
    
    if (existingEmployees.length > 0) {
      console.log('Sample employees:');
      existingEmployees.slice(0, 5).forEach(e => {
        console.log(`  - ${e.basicInfo?.firstName} ${e.basicInfo?.lastName} (${e.basicInfo?.email}) - Role: ${e.role}`);
      });
    }

    // Try to create a simple permission
    console.log('\n🧪 Creating a simple permission...');
    try {
      const simplePermission = await Permission.create({
        name: 'simple_test',
        groupName: 'CORE_SYSTEM_DASHBOARD',
        description: 'Simple test permission',
        isSystem: true
      });
      console.log('✅ Simple permission created:', simplePermission.name);
      
      // Clean up
      await Permission.deleteOne({ _id: simplePermission._id });
      console.log('✅ Simple permission cleaned up');
      
    } catch (error) {
      console.error('❌ Simple permission creation failed:', error.message);
    }

    console.log('\n🎉 RBAC debug completed!');
    
  } catch (error) {
    console.error('❌ RBAC debug failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the debug if this script is executed directly
if (require.main === module) {
  debugRBAC()
    .then(() => {
      console.log('🎉 RBAC debug completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ RBAC debug failed:', error);
      process.exit(1);
    });
}

module.exports = { debugRBAC };
