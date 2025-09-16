const mongoose = require('mongoose');
require('dotenv').config();

async function assignRole() {
  try {
    console.log('🚀 Assigning head administrator role...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch');
    console.log('✅ Connected to database');

    const db = mongoose.connection.db;

    // Step 1: Find the head administrator role
    console.log('👥 Finding head administrator role...');
    const rolesCollection = db.collection('roles');
    const headAdminRole = await rolesCollection.findOne({ name: 'head_administrator' });
    
    if (!headAdminRole) {
      console.log('❌ Head administrator role not found');
      return;
    }
    
    console.log('✅ Found head administrator role:', headAdminRole._id);

    // Step 2: Find any existing employee and update them
    console.log('👤 Finding existing employee...');
    const employeesCollection = db.collection('employees');
    
    // Find any employee record
    const existingEmployee = await employeesCollection.findOne({});
    
    if (existingEmployee) {
      console.log('  👤 Found existing employee:', existingEmployee._id);
      
      // Update the employee to be ziad@yourclutch.com with head admin role
      await employeesCollection.updateOne(
        { _id: existingEmployee._id },
        { 
          $set: { 
            'basicInfo.firstName': 'Ziad',
            'basicInfo.lastName': 'CEO',
            'basicInfo.email': 'ziad@yourclutch.com',
            role: 'head_administrator',
            roles: [headAdminRole._id],
            isActive: true,
            updatedAt: new Date()
          }
        }
      );
      
      console.log('  ✅ Updated employee to ziad@yourclutch.com with head administrator role');
      console.log('  🔑 Employee ID:', existingEmployee._id);
      console.log('  📧 Email: ziad@yourclutch.com');
      console.log('  👑 Role: head_administrator');
    } else {
      console.log('  ❌ No existing employee found');
    }

    // Step 3: Verify the assignment
    console.log('🔍 Verifying assignment...');
    const updatedEmployee = await employeesCollection.findOne({ 'basicInfo.email': 'ziad@yourclutch.com' });
    
    if (updatedEmployee) {
      console.log('  ✅ Verification successful');
      console.log('  📊 Employee details:');
      console.log('    - ID:', updatedEmployee._id);
      console.log('    - Name:', updatedEmployee.basicInfo.firstName, updatedEmployee.basicInfo.lastName);
      console.log('    - Email:', updatedEmployee.basicInfo.email);
      console.log('    - Role:', updatedEmployee.role);
      console.log('    - Roles count:', updatedEmployee.roles ? updatedEmployee.roles.length : 0);
      console.log('    - Active:', updatedEmployee.isActive);
    } else {
      console.log('  ❌ Verification failed - employee not found');
    }

    console.log('🎉 Head administrator role assignment completed!');
    
  } catch (error) {
    console.error('❌ Head administrator role assignment failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the assignment if this script is executed directly
if (require.main === module) {
  assignRole()
    .then(() => {
      console.log('🎉 Head administrator role assignment completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Head administrator role assignment failed:', error);
      process.exit(1);
    });
}

module.exports = { assignRole };
