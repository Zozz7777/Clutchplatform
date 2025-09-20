#!/usr/bin/env node

/**
 * Update CEO Permissions Script
 * Grants full RBAC access to ziad@yourclutch.com as CEO
 */

const axios = require('axios');

const BACKEND_URL = 'https://clutch-main-nk7x.onrender.com';
const CEO_EMAIL = 'ziad@yourclutch.com';

// Full CEO permissions - all possible permissions in the system
const CEO_PERMISSIONS = [
  // Dashboard permissions
  'dashboard:read',
  'dashboard:write',
  'dashboard:admin',
  
  // User management
  'users:read',
  'users:write',
  'users:delete',
  'users:admin',
  'create_users',
  'manage_users',
  'delete_users',
  
  // Fleet management
  'fleet:read',
  'fleet:write',
  'fleet:delete',
  'fleet:admin',
  'manage_fleet',
  'view_fleet',
  'edit_fleet',
  'delete_fleet',
  
  // HR Management
  'hr:read',
  'hr:write',
  'hr:delete',
  'hr:admin',
  'manage_hr',
  'view_hr',
  'edit_hr',
  'delete_hr',
  
  // Legal Management
  'legal:read',
  'legal:write',
  'legal:delete',
  'legal:admin',
  'manage_legal',
  'view_legal',
  'edit_legal',
  'delete_legal',
  
  // Project Management
  'projects:read',
  'projects:write',
  'projects:delete',
  'projects:admin',
  'manage_projects',
  'view_projects',
  'edit_projects',
  'delete_projects',
  
  // Feature Flags
  'feature_flags:read',
  'feature_flags:write',
  'feature_flags:delete',
  'feature_flags:admin',
  'manage_feature_flags',
  'view_feature_flags',
  'edit_feature_flags',
  'delete_feature_flags',
  
  // CMS
  'cms:read',
  'cms:write',
  'cms:delete',
  'cms:admin',
  'manage_content',
  'view_content',
  'edit_content',
  'delete_content',
  
  // Marketing
  'marketing:read',
  'marketing:write',
  'marketing:delete',
  'marketing:admin',
  'manage_marketing',
  'view_marketing',
  'edit_marketing',
  'delete_marketing',
  
  // Asset Management
  'assets:read',
  'assets:write',
  'assets:delete',
  'assets:admin',
  'manage_assets',
  'view_assets',
  'edit_assets',
  'delete_assets',
  
  // Vendor Management
  'vendors:read',
  'vendors:write',
  'vendors:delete',
  'vendors:admin',
  'manage_vendors',
  'view_vendors',
  'edit_vendors',
  'delete_vendors',
  
  // Audit Trail
  'audit:read',
  'audit:write',
  'audit:delete',
  'audit:admin',
  'manage_audit',
  'view_audit',
  'edit_audit',
  'delete_audit',
  
  // System Health
  'system_health:read',
  'system_health:write',
  'system_health:delete',
  'system_health:admin',
  'manage_system_health',
  'view_system_health',
  'edit_system_health',
  'delete_system_health',
  
  // Analytics
  'analytics:read',
  'analytics:write',
  'analytics:admin',
  'view_analytics',
  'edit_analytics',
  
  // AI/ML
  'ai:read',
  'ai:write',
  'ai:admin',
  'manage_ai',
  'view_ai',
  'edit_ai',
  
  // Enterprise
  'enterprise:read',
  'enterprise:write',
  'enterprise:admin',
  'manage_enterprise',
  'view_enterprise',
  'edit_enterprise',
  
  // Real-time
  'realtime:read',
  'realtime:write',
  'realtime:admin',
  'manage_realtime',
  'view_realtime',
  'edit_realtime',
  
  // Finance & Billing
  'finance:read',
  'finance:write',
  'finance:admin',
  'manage_finance',
  'view_finance',
  'edit_finance',
  
  // System Administration
  'system:read',
  'system:write',
  'system:admin',
  'manage_system',
  'view_system',
  'edit_system',
  'admin_access',
  'super_admin',
  'ceo_access'
];

async function updateCEOPermissions() {
  try {
    console.log('🚀 Starting CEO permissions update...');
    console.log(`📧 Target email: ${CEO_EMAIL}`);
    console.log(`🔗 Backend URL: ${BACKEND_URL}`);
    
    // First, let's check if the user exists
    console.log('\n🔍 Checking if user exists...');
    
    try {
      const checkResponse = await axios.get(`${BACKEND_URL}/api/v1/users`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Users endpoint accessible');
      console.log('📊 Current users:', checkResponse.data);
      
    } catch (error) {
      console.log('⚠️  Users endpoint not accessible (expected - requires auth)');
    }
    
    // Try to update user via the users endpoint
    console.log('\n🔄 Attempting to update user permissions...');
    
    try {
      const updateData = {
        email: CEO_EMAIL,
        role: 'ceo',
        websitePermissions: CEO_PERMISSIONS,
        roles: ['ceo', 'admin', 'super_admin'],
        status: 'active',
        isActive: true,
        isVerified: true,
        permissions: CEO_PERMISSIONS
      };
      
      const updateResponse = await axios.put(`${BACKEND_URL}/api/v1/users/update-permissions`, updateData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ User permissions updated successfully!');
      console.log('📋 Response:', updateResponse.data);
      
    } catch (error) {
      console.log('⚠️  Direct update failed, trying alternative approach...');
      console.log('Error:', error.response?.data || error.message);
      
      // Try creating the user if they don't exist
      try {
        const createData = {
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
        
        const createResponse = await axios.post(`${BACKEND_URL}/api/v1/users`, createData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ User created with CEO permissions!');
        console.log('📋 Response:', createResponse.data);
        
      } catch (createError) {
        console.log('❌ Failed to create user:', createError.response?.data || createError.message);
      }
    }
    
    // Also try HR endpoint for employee records
    console.log('\n🔄 Attempting to update employee record...');
    
    try {
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
      
      const employeeResponse = await axios.put(`${BACKEND_URL}/api/v1/hr/employees/update-permissions`, employeeData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Employee record updated successfully!');
      console.log('📋 Response:', employeeResponse.data);
      
    } catch (error) {
      console.log('⚠️  Employee update failed:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 CEO permissions update process completed!');
    console.log('\n📋 Summary of CEO Permissions:');
    console.log(`   • Total permissions: ${CEO_PERMISSIONS.length}`);
    console.log('   • Role: CEO');
    console.log('   • Access level: Super Admin');
    console.log('   • All modules: Full access');
    
  } catch (error) {
    console.error('❌ Error updating CEO permissions:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the script
if (require.main === module) {
  updateCEOPermissions();
}

module.exports = { updateCEOPermissions, CEO_PERMISSIONS };
