#!/usr/bin/env node

/**
 * Grant CEO Access Script
 * Calls the admin-ceo endpoint to grant CEO permissions to ziad@yourclutch.com
 */

const axios = require('axios');

const BACKEND_URL = 'https://clutch-main-nk7x.onrender.com';
const CEO_EMAIL = 'ziad@yourclutch.com';
const SECRET_KEY = 'CLUTCH_CEO_SETUP_2024';

async function grantCEOPermissions() {
  try {
    console.log('🚀 Starting CEO permissions grant...');
    console.log(`📧 Target email: ${CEO_EMAIL}`);
    console.log(`🔗 Backend URL: ${BACKEND_URL}`);
    
    // First, get CEO permissions info
    console.log('\n📋 Getting CEO permissions info...');
    try {
      const infoResponse = await axios.get(`${BACKEND_URL}/api/v1/admin-ceo/ceo-permissions-info`);
      console.log('✅ CEO permissions info retrieved:');
      console.log(`   • Total permissions: ${infoResponse.data.data.totalPermissions}`);
      console.log(`   • Modules: ${infoResponse.data.data.modules.join(', ')}`);
    } catch (error) {
      console.log('⚠️  Could not get permissions info:', error.response?.data || error.message);
    }
    
    // Grant CEO permissions
    console.log('\n🔑 Granting CEO permissions...');
    const grantResponse = await axios.post(`${BACKEND_URL}/api/v1/admin-ceo/grant-ceo-permissions`, {
      email: CEO_EMAIL,
      secretKey: SECRET_KEY
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ CEO permissions granted successfully!');
    console.log('📋 Response:', JSON.stringify(grantResponse.data, null, 2));
    
    console.log('\n🎉 CEO access setup completed!');
    console.log('\n📋 Summary:');
    console.log(`   • Email: ${CEO_EMAIL}`);
    console.log(`   • Role: CEO`);
    console.log(`   • Permissions: ${grantResponse.data.data.permissions} total`);
    console.log(`   • User updated: ${grantResponse.data.data.userUpdated ? 'Yes' : 'No'}`);
    console.log(`   • Employee updated: ${grantResponse.data.data.employeeUpdated ? 'Yes' : 'No'}`);
    console.log(`   • Access level: Super Admin`);
    console.log(`   • All modules: Full access`);
    
    console.log('\n🔐 Login Instructions:');
    console.log(`   1. Use email: ${CEO_EMAIL}`);
    console.log('   2. Use any password (CEO has full access)');
    console.log('   3. Access all admin modules with full permissions');
    
  } catch (error) {
    console.error('❌ Error granting CEO permissions:', error.message);
    if (error.response) {
      console.error('📋 Response data:', error.response.data);
      console.error('📋 Status:', error.response.status);
    }
  }
}

// Run the script
if (require.main === module) {
  grantCEOPermissions();
}

module.exports = { grantCEOPermissions };
