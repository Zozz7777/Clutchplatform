#!/usr/bin/env node

/**
 * Direct CEO Update Script
 * Directly updates the database to grant CEO permissions to ziad@yourclutch.com
 */

const { MongoClient } = require('mongodb');

// Use the production MongoDB URI from environment or fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://clutch:clutch123@cluster0.mongodb.net/clutch?retryWrites=true&w=majority';

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

async function updateCEODirectly() {
  let client;
  
  try {
    console.log('🚀 Starting direct CEO database update...');
    console.log(`📧 Target email: ${CEO_EMAIL}`);
    console.log(`🔗 MongoDB URI: ${MONGODB_URI.substring(0, 50)}...`);
    
    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!');
    
    const db = client.db();
    
    // Update users collection
    console.log('\n👥 Updating users collection...');
    const usersCollection = db.collection('users');
    
    const userUpdateResult = await usersCollection.updateOne(
      { email: CEO_EMAIL },
      {
        $set: {
          email: CEO_EMAIL,
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
    
    console.log(`✅ Users collection updated: ${userUpdateResult.modifiedCount} modified, ${userUpdateResult.upsertedCount} inserted`);
    
    // Update employees collection
    console.log('\n👔 Updating employees collection...');
    const employeesCollection = db.collection('employees');
    
    const employeeUpdateResult = await employeesCollection.updateOne(
      { email: CEO_EMAIL },
      {
        $set: {
          email: CEO_EMAIL,
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
          currency: 'USD',
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
    
    console.log(`✅ Employees collection updated: ${employeeUpdateResult.modifiedCount} modified, ${employeeUpdateResult.upsertedCount} inserted`);
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    
    const updatedUser = await usersCollection.findOne({ email: CEO_EMAIL });
    if (updatedUser) {
      console.log('✅ User record found:');
      console.log(`   • Name: ${updatedUser.name}`);
      console.log(`   • Role: ${updatedUser.role}`);
      console.log(`   • Permissions: ${updatedUser.websitePermissions?.length || 0} permissions`);
      console.log(`   • Status: ${updatedUser.status}`);
    }
    
    const updatedEmployee = await employeesCollection.findOne({ email: CEO_EMAIL });
    if (updatedEmployee) {
      console.log('✅ Employee record found:');
      console.log(`   • Name: ${updatedEmployee.firstName} ${updatedEmployee.lastName}`);
      console.log(`   • Position: ${updatedEmployee.position}`);
      console.log(`   • Role: ${updatedEmployee.role}`);
      console.log(`   • Permissions: ${updatedEmployee.websitePermissions?.length || 0} permissions`);
      console.log(`   • Status: ${updatedEmployee.status}`);
    }
    
    console.log('\n🎉 CEO permissions update completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • Email: ${CEO_EMAIL}`);
    console.log(`   • Role: CEO`);
    console.log(`   • Total permissions: ${CEO_PERMISSIONS.length}`);
    console.log(`   • Access level: Super Admin`);
    console.log(`   • All modules: Full access`);
    console.log(`   • Status: Active & Verified`);
    
  } catch (error) {
    console.error('❌ Error updating CEO permissions:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Tip: Make sure MongoDB is running and accessible');
    }
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
if (require.main === module) {
  updateCEODirectly();
}

module.exports = { updateCEODirectly, CEO_PERMISSIONS };
