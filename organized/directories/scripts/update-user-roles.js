const axios = require('axios');

const BACKEND_URL = 'https://clutch-main-nk7x.onrender.com';

// All the roles needed based on the requireRole checks in the codebase
const ALL_ROLES = [
  'admin',
  'hr_manager',
  'fleet_manager', 
  'enterprise_manager',
  'sales_manager',
  'analytics',
  'management',
  'cto',
  'operations',
  'sales_rep',
  'manager',
  'analyst',
  'super_admin',
  'finance_manager',
  'marketing_manager',
  'legal_manager',
  'partner_manager',
  'hr',
  'fleet_admin',
  'driver',
  'accountant'
];

async function updateUserRoles() {
  try {
    console.log('🔧 Updating user roles for ziad@yourclutch.com...');
    
    // First, let's try to find the user with the exact email
    const findResponse = await axios.get(`${BACKEND_URL}/api/v1/auth/find-user`, {
      params: { email: 'ziad@yourclutch.com' }
    });

    if (!findResponse.data.success) {
      console.log('❌ User not found with ziad@yourclutch.com, trying alternative...');
      
      // Try alternative email
      const altResponse = await axios.get(`${BACKEND_URL}/api/v1/auth/find-user`, {
        params: { email: 'ziad@clutchapp.one' }
      });

      if (!altResponse.data.success) {
        console.log('❌ User not found with either email address');
        return;
      }
    }

    // Update the user with all roles
    const updateResponse = await axios.put(`${BACKEND_URL}/api/v1/auth/update-user-roles`, {
      email: 'ziad@yourclutch.com',
      roles: ALL_ROLES
    });

    if (updateResponse.data.success) {
      console.log('✅ User roles updated successfully!');
      console.log('📧 Email: ziad@yourclutch.com');
      console.log('👑 Roles assigned:', ALL_ROLES);
      console.log('\n🎉 User now has access to all features!');
    } else {
      console.log('❌ Failed to update user roles:', updateResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error updating user roles:', error.response?.data || error.message);
    
    // If the API endpoint doesn't exist, let's create a direct database update script
    console.log('\n🔄 Creating direct database update script...');
    await createDirectUpdateScript();
  }
}

async function createDirectUpdateScript() {
  const script = `
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch';

async function updateUserRolesDirectly() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    const employeesCollection = db.collection('employees');
    const usersCollection = db.collection('users');
    
    // Try to find user in employees collection
    let user = await employeesCollection.findOne({ 
      'basicInfo.email': { $regex: /ziad@yourclutch\\.com/i } 
    });
    
    if (!user) {
      // Try alternative email
      user = await employeesCollection.findOne({ 
        'basicInfo.email': { $regex: /ziad@clutchapp\\.one/i } 
      });
    }
    
    if (!user) {
      // Try users collection
      user = await usersCollection.findOne({ 
        email: { $regex: /ziad@yourclutch\\.com/i } 
      });
      
      if (!user) {
        user = await usersCollection.findOne({ 
          email: { $regex: /ziad@clutchapp\\.one/i } 
        });
      }
    }
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('✅ Found user:', user.basicInfo?.email || user.email);
    
    // Update with all roles
    const updateData = {
      role: 'admin',
      roles: ${JSON.stringify(ALL_ROLES)},
      permissions: ['*:*:*'], // Wildcard permission for everything
      updatedAt: new Date()
    };
    
    let result;
    if (user.basicInfo) {
      // Employee collection
      result = await employeesCollection.updateOne(
        { _id: user._id },
        { $set: updateData }
      );
    } else {
      // Users collection
      result = await usersCollection.updateOne(
        { _id: user._id },
        { $set: updateData }
      );
    }
    
    if (result.modifiedCount > 0) {
      console.log('✅ User roles updated successfully!');
      console.log('👑 Roles assigned:', ${JSON.stringify(ALL_ROLES)});
    } else {
      console.log('⚠️ No changes made to user');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

updateUserRolesDirectly();
`;

  console.log('📝 Direct update script created. Run this script to update user roles:');
  console.log(script);
}

// Run the script
updateUserRoles();
