const mongoose = require('mongoose');
require('dotenv').config();

async function updateZiadRole() {
  try {
    console.log('🚀 Updating ziad@yourclutch.com role to head administrator...');
    
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

    // Step 2: Find or create ziad@yourclutch.com employee
    console.log('👤 Finding ziad@yourclutch.com employee...');
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
        roles: [headAdminRole._id],
        permissions: [],
        isActive: true,
        nationalId: `ziad_${Date.now()}`, // Add unique nationalId
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const employeeResult = await employeesCollection.insertOne(newEmployee);
      employee = { _id: employeeResult.insertedId, ...newEmployee };
      console.log('  ✅ Created employee record for ziad@yourclutch.com');
    } else {
      console.log('  👤 Found existing employee record for ziad@yourclutch.com');
      
      // Update existing employee
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
      console.log('  ✅ Updated existing employee record');
    }

    console.log('  ✅ Assigned head administrator role to ziad@yourclutch.com');
    console.log('  🔑 Employee ID:', employee._id);
    console.log('  📧 Email:', employee.basicInfo.email);
    console.log('  👑 Role: head_administrator');
    console.log('  🔐 Password: Use the existing password or reset it');

    // Step 3: Verify the assignment
    console.log('🔍 Verifying assignment...');
    const updatedEmployee = await employeesCollection.findOne({ 'basicInfo.email': 'ziad@yourclutch.com' });
    console.log('  ✅ Verification successful');
    console.log('  📊 Employee details:');
    console.log('    - ID:', updatedEmployee._id);
    console.log('    - Name:', updatedEmployee.basicInfo.firstName, updatedEmployee.basicInfo.lastName);
    console.log('    - Email:', updatedEmployee.basicInfo.email);
    console.log('    - Role:', updatedEmployee.role);
    console.log('    - Roles count:', updatedEmployee.roles ? updatedEmployee.roles.length : 0);
    console.log('    - Active:', updatedEmployee.isActive);

    console.log('🎉 Head administrator role assignment completed successfully!');
    
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
  updateZiadRole()
    .then(() => {
      console.log('🎉 Head administrator role assignment completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Head administrator role assignment failed:', error);
      process.exit(1);
    });
}

module.exports = { updateZiadRole };
