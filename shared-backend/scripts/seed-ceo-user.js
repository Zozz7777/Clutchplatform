#!/usr/bin/env node

/**
 * Seed CEO User Script
 * Creates CEO user directly in the database
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Use environment variable for MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

const CEO_EMAIL = 'ziad@yourclutch.com';

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

async function seedCEOUser() {
  let client;
  
  try {
    console.log('🚀 Seeding CEO employee...');
    console.log(`📧 Email: ${CEO_EMAIL}`);
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Create CEO employee record (this is what the admin system uses)
    const employeeData = {
      email: CEO_EMAIL,
      firstName: 'Ziad',
      lastName: 'A.Shaaban',
      name: 'Ziad A.Shaaban',
      password: '4955698*Z*z', // CEO's password
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
      employeeId: `CEO-${Date.now()}`,
      nationalId: `CEO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique national ID
      startDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      // Additional CEO-specific fields
      manager: 'Board of Directors',
      address: {
        street: 'Executive Office',
        city: 'Cairo',
        state: 'Cairo',
        zipCode: '00000',
        country: 'Egypt'
      },
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Spouse',
        phone: '+201234567890'
      },
      skills: ['Leadership', 'Strategic Planning', 'Business Development', 'Team Management'],
      certifications: ['MBA', 'CEO Certification'],
      performanceRating: 5.0,
      lastReviewDate: new Date(),
      nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    };
    
    const employeesCollection = db.collection('employees');
    const empResult = await employeesCollection.replaceOne(
      { email: CEO_EMAIL },
      employeeData,
      { upsert: true }
    );
    
    console.log(`✅ CEO employee seeded: ${empResult.modifiedCount} modified, ${empResult.upsertedCount} inserted`);
    
    // Also create in users collection for compatibility
    const userData = {
      email: CEO_EMAIL,
      name: 'Ziad A.Shaaban',
      password: '4955698*Z*z', // CEO's password
      role: 'ceo',
      roles: ['ceo', 'admin', 'super_admin'],
      websitePermissions: CEO_PERMISSIONS,
      permissions: CEO_PERMISSIONS,
      status: 'active',
      isActive: true,
      isVerified: true,
      userId: `ceo-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique user ID
      firebaseId: `ceo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique Firebase ID
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const usersCollection = db.collection('users');
    const userResult = await usersCollection.replaceOne(
      { email: CEO_EMAIL },
      userData,
      { upsert: true }
    );
    
    console.log(`✅ CEO user seeded: ${userResult.modifiedCount} modified, ${userResult.upsertedCount} inserted`);
    
    // Verify the employee was created correctly
    const createdEmployee = await employeesCollection.findOne({ email: CEO_EMAIL });
    if (createdEmployee) {
      console.log('\n🔍 Verification - CEO Employee Record:');
      console.log(`   • Name: ${createdEmployee.name || createdEmployee.firstName + ' ' + createdEmployee.lastName}`);
      console.log(`   • Email: ${createdEmployee.email}`);
      console.log(`   • Password: ${createdEmployee.password ? 'Set' : 'Not set'}`);
      console.log(`   • Role: ${createdEmployee.role}`);
      console.log(`   • Position: ${createdEmployee.position}`);
      console.log(`   • Permissions: ${createdEmployee.websitePermissions?.length || 0} permissions`);
      console.log(`   • Status: ${createdEmployee.status}`);
      console.log(`   • Employee ID: ${createdEmployee.employeeId}`);
    }
    
    console.log('\n🎉 CEO employee seeding completed!');
    console.log(`📋 Total permissions: ${CEO_PERMISSIONS.length}`);
    console.log('🔐 CEO now has full RBAC access to all admin modules');
    
  } catch (error) {
    console.error('❌ Error seeding CEO employee:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed');
    }
  }
}

if (require.main === module) {
  seedCEOUser();
}

module.exports = { seedCEOUser };
