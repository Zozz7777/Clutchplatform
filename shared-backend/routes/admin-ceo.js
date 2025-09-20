const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/optimized-database');

// CEO permissions - all possible permissions in the system
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

// Special endpoint to grant CEO permissions (no auth required for setup)
router.post('/grant-ceo-permissions', async (req, res) => {
  try {
    const { email, secretKey } = req.body;
    
    // Simple security check - only allow if secret key is provided
    if (secretKey !== 'CLUTCH_CEO_SETUP_2024') {
      return res.status(403).json({
        success: false,
        error: 'Invalid secret key for CEO setup'
      });
    }
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    console.log(`🚀 Granting CEO permissions to: ${email}`);
    
    // Update users collection
    const usersCollection = await getCollection('users');
    const userUpdateResult = await usersCollection.updateOne(
      { email: email },
      {
        $set: {
          email: email,
          name: 'Ziad CEO',
          role: 'ceo',
          roles: ['ceo', 'admin', 'super_admin'],
          websitePermissions: CEO_PERMISSIONS,
          permissions: CEO_PERMISSIONS,
          status: 'active',
          isActive: true,
          isVerified: true,
          updatedAt: new Date(),
          lastLogin: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    // Update employees collection
    const employeesCollection = await getCollection('employees');
    const employeeUpdateResult = await employeesCollection.updateOne(
      { email: email },
      {
        $set: {
          email: email,
          firstName: 'Ziad',
          lastName: 'CEO',
          role: 'ceo',
          roles: ['ceo', 'admin', 'super_admin'],
          position: 'Chief Executive Officer',
          department: 'Executive',
          websitePermissions: CEO_PERMISSIONS,
          permissions: CEO_PERMISSIONS,
          status: 'active',
          employmentType: 'full_time',
          salary: 500000,
          currency: 'EGP',
          isActive: true,
          isVerified: true,
          updatedAt: new Date()
        },
        $setOnInsert: {
          employeeId: `CEO-${Date.now()}`,
          startDate: new Date(),
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log(`✅ CEO permissions granted to ${email}`);
    console.log(`   • Users updated: ${userUpdateResult.modifiedCount} modified, ${userUpdateResult.upsertedCount} inserted`);
    console.log(`   • Employees updated: ${employeeUpdateResult.modifiedCount} modified, ${employeeUpdateResult.upsertedCount} inserted`);
    
    res.json({
      success: true,
      message: 'CEO permissions granted successfully',
      data: {
        email: email,
        role: 'ceo',
        permissions: CEO_PERMISSIONS.length,
        userUpdated: userUpdateResult.modifiedCount > 0 || userUpdateResult.upsertedCount > 0,
        employeeUpdated: employeeUpdateResult.modifiedCount > 0 || employeeUpdateResult.upsertedCount > 0
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error granting CEO permissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to grant CEO permissions',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get CEO permissions info
router.get('/ceo-permissions-info', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        totalPermissions: CEO_PERMISSIONS.length,
        permissions: CEO_PERMISSIONS,
        modules: [
          'Dashboard', 'Users', 'Fleet', 'HR', 'Legal', 'Projects',
          'Feature Flags', 'CMS', 'Marketing', 'Assets', 'Vendors',
          'Audit', 'System Health', 'Analytics', 'AI/ML', 'Enterprise',
          'Real-time', 'Finance', 'System Administration'
        ]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting CEO permissions info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get CEO permissions info',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
