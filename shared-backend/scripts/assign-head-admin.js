const mongoose = require('mongoose');
require('dotenv').config();

async function assignHeadAdmin() {
  try {
    console.log('🚀 Assigning head administrator role to ziad@yourclutch.com...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch');
    console.log('✅ Connected to database');

    const db = mongoose.connection.db;

    // Step 1: Create permissions if they don't exist
    console.log('📋 Ensuring permissions exist...');
    const permissionsCollection = db.collection('permissions');
    
    // Check if permissions exist
    const existingPermissions = await permissionsCollection.countDocuments();
    console.log(`Found ${existingPermissions} existing permissions`);
    
    if (existingPermissions === 0) {
      console.log('Creating permissions...');
      const permissions = [
        { name: 'view_dashboard', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'View dashboard and overview', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: 'view_analytics', groupName: 'CORE_SYSTEM_DASHBOARD', description: 'View analytics and reports', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: 'view_users', groupName: 'USER_ORGANIZATION', description: 'View user information', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: 'create_users', groupName: 'USER_ORGANIZATION', description: 'Create new users', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: 'edit_users', groupName: 'USER_ORGANIZATION', description: 'Edit user information', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: 'view_settings', groupName: 'ADMINISTRATION_CONFIG', description: 'View system settings', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: 'manage_settings', groupName: 'ADMINISTRATION_CONFIG', description: 'Manage system settings', isSystem: true, isActive: true, createdAt: new Date(), updatedAt: new Date() }
      ];
      
      await permissionsCollection.insertMany(permissions);
      console.log(`✅ Created ${permissions.length} permissions`);
    }

    // Step 2: Create head administrator role
    console.log('👥 Creating head administrator role...');
    const rolesCollection = db.collection('roles');
    
    const existingRole = await rolesCollection.findOne({ name: 'head_administrator' });
    if (!existingRole) {
      // Get all permissions
      const allPermissions = await permissionsCollection.find({ isActive: true }).toArray();
      const allPermissionIds = allPermissions.map(p => p._id);
      
      const headAdminRole = {
        name: 'head_administrator',
        displayName: 'Head Administrator',
        description: 'Highest level of access, can manage everything',
        permissions: allPermissionIds,
        priority: 1,
        isSystem: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await rolesCollection.insertOne(headAdminRole);
      console.log('✅ Created head administrator role');
    } else {
      console.log('✅ Head administrator role already exists');
    }

    // Step 3: Find or create ziad@yourclutch.com employee
    console.log('👤 Setting up ziad@yourclutch.com employee...');
    const employeesCollection = db.collection('employees');
    
    let employee = await employeesCollection.findOne({ 'basicInfo.email': 'ziad@yourclutch.com' });
    
    if (!employee) {
      console.log('  📝 Creating employee record for ziad@yourclutch.com...');
      
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

    // Step 4: Assign head administrator role
    console.log('👑 Assigning head administrator role...');
    const headAdminRole = await rolesCollection.findOne({ name: 'head_administrator' });
    
    if (headAdminRole) {
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
      console.log('  🔐 Password: Use the existing password or reset it');
    } else {
      console.log('  ❌ Head administrator role not found');
    }

    console.log('🎉 Head administrator assignment completed successfully!');
    
  } catch (error) {
    console.error('❌ Head administrator assignment failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the assignment if this script is executed directly
if (require.main === module) {
  assignHeadAdmin()
    .then(() => {
      console.log('🎉 Head administrator assignment completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Head administrator assignment failed:', error);
      process.exit(1);
    });
}

module.exports = { assignHeadAdmin };
