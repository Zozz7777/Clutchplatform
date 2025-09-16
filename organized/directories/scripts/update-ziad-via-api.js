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

async function updateZiadViaAPI() {
  try {
    console.log('🔧 Updating user roles for ziad@yourclutch.com via API...');
    
    const response = await axios.put(`${BACKEND_URL}/api/v1/auth/update-user-roles`, {
      email: 'ziad@yourclutch.com',
      roles: ALL_ROLES
    });

    if (response.data.success) {
      console.log('✅ User roles updated successfully!');
      console.log('📧 Email:', response.data.data.email);
      console.log('👑 Roles assigned:', response.data.data.roles);
      console.log('🔓 Permissions:', response.data.data.permissions);
      console.log('\n🎉 User now has access to all features!');
      console.log('\n📧 Email: ziad@yourclutch.com');
      console.log('🔑 Password: 4955698*Z*z');
    } else {
      console.log('❌ Failed to update user roles:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error updating user roles:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 User not found. Trying alternative email...');
      try {
        const altResponse = await axios.put(`${BACKEND_URL}/api/v1/auth/update-user-roles`, {
          email: 'ziad@clutchapp.one',
          roles: ALL_ROLES
        });

        if (altResponse.data.success) {
          console.log('✅ User roles updated successfully!');
          console.log('📧 Email:', altResponse.data.data.email);
          console.log('👑 Roles assigned:', altResponse.data.data.roles);
          console.log('🔓 Permissions:', altResponse.data.data.permissions);
          console.log('\n🎉 User now has access to all features!');
        } else {
          console.log('❌ Failed to update user roles:', altResponse.data.message);
        }
      } catch (altError) {
        console.error('❌ Error updating user roles with alternative email:', altError.response?.data || altError.message);
      }
    }
  }
}

// Run the script
console.log('🚀 Starting user role update for ziad@yourclutch.com...');
updateZiadViaAPI();
