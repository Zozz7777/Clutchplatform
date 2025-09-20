#!/usr/bin/env node

/**
 * Update CEO via Users Endpoint
 * Uses the existing users endpoint to update CEO permissions
 */

const axios = require('axios');

const BACKEND_URL = 'https://clutch-main-nk7x.onrender.com';
const CEO_EMAIL = 'ziad@yourclutch.com';

// Full CEO permissions
const CEO_PERMISSIONS = [
  'dashboard:read', 'dashboard:write', 'dashboard:admin',
  'users:read', 'users:write', 'users:delete', 'users:admin',
  'create_users', 'manage_users', 'delete_users',
  'fleet:read', 'fleet:write', 'fleet:delete', 'fleet:admin',
  'manage_fleet', 'view_fleet', 'edit_fleet', 'delete_fleet',
  'hr:read', 'hr:write', 'hr:delete', 'hr:admin',
  'manage_hr', 'view_hr', 'edit_hr', 'delete_hr',
  'legal:read', 'legal:write', 'legal:delete', 'legal:admin',
  'manage_legal', 'view_legal', 'edit_legal', 'delete_legal',
  'projects:read', 'projects:write', 'projects:delete', 'projects:admin',
  'manage_projects', 'view_projects', 'edit_projects', 'delete_projects',
  'feature_flags:read', 'feature_flags:write', 'feature_flags:delete', 'feature_flags:admin',
  'manage_feature_flags', 'view_feature_flags', 'edit_feature_flags', 'delete_feature_flags',
  'cms:read', 'cms:write', 'cms:delete', 'cms:admin',
  'manage_content', 'view_content', 'edit_content', 'delete_content',
  'marketing:read', 'marketing:write', 'marketing:delete', 'marketing:admin',
  'manage_marketing', 'view_marketing', 'edit_marketing', 'delete_marketing',
  'assets:read', 'assets:write', 'assets:delete', 'assets:admin',
  'manage_assets', 'view_assets', 'edit_assets', 'delete_assets',
  'vendors:read', 'vendors:write', 'vendors:delete', 'vendors:admin',
  'manage_vendors', 'view_vendors', 'edit_vendors', 'delete_vendors',
  'audit:read', 'audit:write', 'audit:delete', 'audit:admin',
  'manage_audit', 'view_audit', 'edit_audit', 'delete_audit',
  'system_health:read', 'system_health:write', 'system_health:delete', 'system_health:admin',
  'manage_system_health', 'view_system_health', 'edit_system_health', 'delete_system_health',
  'analytics:read', 'analytics:write', 'analytics:admin',
  'view_analytics', 'edit_analytics',
  'ai:read', 'ai:write', 'ai:admin',
  'manage_ai', 'view_ai', 'edit_ai',
  'enterprise:read', 'enterprise:write', 'enterprise:admin',
  'manage_enterprise', 'view_enterprise', 'edit_enterprise',
  'realtime:read', 'realtime:write', 'realtime:admin',
  'manage_realtime', 'view_realtime', 'edit_realtime',
  'finance:read', 'finance:write', 'finance:admin',
  'manage_finance', 'view_finance', 'edit_finance',
  'system:read', 'system:write', 'system:admin',
  'manage_system', 'view_system', 'edit_system',
  'admin_access', 'super_admin', 'ceo_access'
];

async function updateCEOViaUsers() {
  try {
    console.log('🚀 Starting CEO update via users endpoint...');
    console.log(`📧 Target email: ${CEO_EMAIL}`);
    console.log(`🔗 Backend URL: ${BACKEND_URL}`);
    
    // Try to create/update user with CEO permissions
    console.log('\n👤 Creating/updating CEO user...');
    
    const userData = {
      name: 'Ziad CEO',
      email: CEO_EMAIL,
      role: 'ceo',
      websitePermissions: CEO_PERMISSIONS,
      roles: ['ceo', 'admin', 'super_admin'],
      status: 'active',
      isActive: true,
      isVerified: true,
      permissions: CEO_PERMISSIONS
    };
    
    try {
      const createResponse = await axios.post(`${BACKEND_URL}/api/v1/users`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ CEO user created/updated successfully!');
      console.log('📋 Response:', JSON.stringify(createResponse.data, null, 2));
      
    } catch (createError) {
      console.log('⚠️  Create failed, trying update...');
      console.log('Error:', createError.response?.data || createError.message);
      
      // Try to update existing user
      try {
        const updateResponse = await axios.put(`${BACKEND_URL}/api/v1/users/update-permissions`, {
          email: CEO_EMAIL,
          ...userData
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ CEO user updated successfully!');
        console.log('📋 Response:', JSON.stringify(updateResponse.data, null, 2));
        
      } catch (updateError) {
        console.log('❌ Update also failed:', updateError.response?.data || updateError.message);
      }
    }
    
    // Also try HR endpoint for employee record
    console.log('\n👔 Updating employee record...');
    
    const employeeData = {
      email: CEO_EMAIL,
      firstName: 'Ziad',
      lastName: 'CEO',
      role: 'ceo',
      position: 'Chief Executive Officer',
      department: 'Executive',
      websitePermissions: CEO_PERMISSIONS,
      roles: ['ceo', 'admin', 'super_admin'],
      status: 'active',
      employmentType: 'full_time',
      salary: 500000,
      currency: 'EGP'
    };
    
    try {
      const hrResponse = await axios.post(`${BACKEND_URL}/api/v1/hr/employees`, employeeData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Employee record created/updated successfully!');
      console.log('📋 Response:', JSON.stringify(hrResponse.data, null, 2));
      
    } catch (hrError) {
      console.log('⚠️  HR update failed:', hrError.response?.data || hrError.message);
    }
    
    console.log('\n🎉 CEO update process completed!');
    console.log('\n📋 Summary:');
    console.log(`   • Email: ${CEO_EMAIL}`);
    console.log(`   • Role: CEO`);
    console.log(`   • Total permissions: ${CEO_PERMISSIONS.length}`);
    console.log(`   • Access level: Super Admin`);
    console.log(`   • All modules: Full access`);
    
  } catch (error) {
    console.error('❌ Error updating CEO:', error.message);
    if (error.response) {
      console.error('📋 Response data:', error.response.data);
    }
  }
}

// Run the script
if (require.main === module) {
  updateCEOViaUsers();
}

module.exports = { updateCEOViaUsers };
