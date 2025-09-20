#!/usr/bin/env node

/**
 * Seed Audit Trail Script
 * Adds sample audit trail data to the database
 */

const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = 'clutch';

const sampleAuditLogs = [
  {
    _id: 'audit-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    userRole: 'admin',
    action: 'login',
    resource: 'authentication',
    resourceId: 'auth-1',
    resourceName: 'User Login',
    details: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'session-1'
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'session-1',
    severity: 'low',
    category: 'authentication',
    status: 'success',
    location: {
      country: 'United States',
      city: 'New York'
    },
    tags: ['login', 'authentication'],
    createdAt: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    _id: 'audit-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    userRole: 'hr_manager',
    action: 'create_user',
    resource: 'user_management',
    resourceId: 'user-3',
    resourceName: 'New Employee',
    details: {
      newUserEmail: 'new.employee@example.com',
      department: 'Engineering',
      role: 'developer'
    },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    sessionId: 'session-2',
    severity: 'medium',
    category: 'user_management',
    status: 'success',
    location: {
      country: 'United States',
      city: 'San Francisco'
    },
    tags: ['user_creation', 'hr'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60)
  },
  {
    _id: 'audit-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    userRole: 'admin',
    action: 'failed_login',
    resource: 'authentication',
    resourceId: 'auth-2',
    resourceName: 'Failed Login Attempt',
    details: {
      reason: 'Invalid password',
      attempts: 3
    },
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'session-3',
    severity: 'high',
    category: 'security',
    status: 'failure',
    location: {
      country: 'United States',
      city: 'New York'
    },
    tags: ['security', 'failed_login'],
    createdAt: new Date(Date.now() - 1000 * 60 * 90)
  },
  {
    _id: 'audit-4',
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    userId: 'user-3',
    userName: 'Mike Johnson',
    userEmail: 'mike.johnson@example.com',
    userRole: 'developer',
    action: 'update_profile',
    resource: 'user_profile',
    resourceId: 'profile-3',
    resourceName: 'User Profile Update',
    details: {
      fieldsChanged: ['phone', 'department'],
      oldValues: {
        phone: '+1234567890',
        department: 'Engineering'
      },
      newValues: {
        phone: '+1987654321',
        department: 'Product'
      }
    },
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36',
    sessionId: 'session-4',
    severity: 'low',
    category: 'profile_management',
    status: 'success',
    location: {
      country: 'United States',
      city: 'Seattle'
    },
    tags: ['profile_update', 'user_data'],
    createdAt: new Date(Date.now() - 1000 * 60 * 120)
  },
  {
    _id: 'audit-5',
    timestamp: new Date(Date.now() - 1000 * 60 * 150), // 2.5 hours ago
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    userRole: 'hr_manager',
    action: 'password_change',
    resource: 'authentication',
    resourceId: 'auth-3',
    resourceName: 'Password Change',
    details: {
      passwordStrength: 'strong',
      twoFactorEnabled: true
    },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    sessionId: 'session-2',
    severity: 'medium',
    category: 'security',
    status: 'success',
    location: {
      country: 'United States',
      city: 'San Francisco'
    },
    tags: ['password_change', 'security'],
    createdAt: new Date(Date.now() - 1000 * 60 * 150)
  },
  {
    _id: 'audit-6',
    timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    userRole: 'admin',
    action: 'permission_change',
    resource: 'user_permissions',
    resourceId: 'perm-1',
    resourceName: 'User Permission Update',
    details: {
      targetUser: 'user-3',
      permissionsAdded: ['read_reports', 'export_data'],
      permissionsRemoved: ['delete_users']
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'session-1',
    severity: 'high',
    category: 'permission_management',
    status: 'success',
    location: {
      country: 'United States',
      city: 'New York'
    },
    tags: ['permissions', 'admin_action'],
    createdAt: new Date(Date.now() - 1000 * 60 * 180)
  }
];

async function seedAuditTrail() {
  let client;
  try {
    console.log('🌱 Starting audit trail seeding...');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const auditCollection = db.collection('audit_logs');
    
    // Clear existing audit logs
    await auditCollection.deleteMany({});
    console.log('🗑️  Cleared existing audit logs');
    
    // Insert sample audit logs
    const result = await auditCollection.insertMany(sampleAuditLogs);
    console.log(`✅ Successfully inserted ${result.insertedCount} audit logs`);
    
    // Verify insertion
    const count = await auditCollection.countDocuments();
    console.log(`📊 Total audit logs in database: ${count}`);
    
    console.log('🎉 Audit trail seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding audit trail:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the seeding function
if (require.main === module) {
  seedAuditTrail()
    .then(() => {
      console.log('✨ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAuditTrail, sampleAuditLogs };
