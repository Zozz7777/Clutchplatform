#!/usr/bin/env node

/**
 * Simple MongoDB Database Audit Script
 * Uses existing database configuration from the Clutch backend
 */

const { connectToDatabase } = require('../config/database-unified');

// Required collections based on backend analysis
const REQUIRED_COLLECTIONS = [
  // Core User Management
  'users', 'user_sessions', 'user_vehicles',
  
  // Vehicle & Parts Management
  'vehicles', 'products', 'vehicle_diagnostics',
  
  // Service & Booking Management
  'bookings', 'service_centers', 'service_categories',
  
  // Business & Partner Management
  'partners', 'customers',
  
  // Financial Management
  'transactions', 'payment_methods', 'invoices', 'payments',
  
  // Communication & Notifications
  'notifications', 'chat_messages', 'emails',
  
  // Analytics & Reporting
  'analytics', 'reports', 'audit_logs',
  
  // System & Configuration
  'feature_flags', 'cities', 'areas',
  
  // OBD & Diagnostic Data
  'obd_error_codes', 'obd_categories', 'obd2_data',
  
  // Device & Token Management
  'device_tokens', 'sessions',
  
  // Employee Management
  'employees', 'employee_invitations', 'job_applications', 'recruitment',
  
  // User Activity & Support
  'user_activity', 'support_tickets',
  
  // Compliance & Legal
  'compliance', 'compliance_flags', 'compliance_frameworks',
  
  // AI/ML Collections
  'ai_models', 'ai_predictions', 'ai_training_jobs', 'ai_recommendations',
  'ai_feedback', 'ai_model_performance', 'ai_training', 'anomalies', 'fraud_cases',
  
  // Legal Collections
  'contracts', 'disputes', 'legal_documents',
  
  // CMS Collections
  'cms_categories', 'cms_media', 'help_articles', 'seo_data',
  
  // Security Collections
  'security_alerts', 'security_logs', 'threat_intelligence', 'security_incidents',
  
  // Asset Management Collections
  'assets', 'asset_maintenance', 'asset_assignments', 'maintenance_records',
  'maintenance_tasks', 'maintenance_schedules', 'technicians',
  
  // Mobile Apps Collections
  'mobile_app_versions', 'mobile_app_crashes', 'mobile_app_analytics',
  'mobile_app_stores', 'mobile_app_settings',
  
  // Marketing Collections
  'campaigns', 'marketing_leads', 'marketing_promotions', 'leads', 'promotions',
  
  // System Performance Collections
  'api_performance', 'system_alerts',
  
  // Fleet Management Collections
  'fleet_vehicles', 'maintenance'
];

async function auditDatabase() {
  console.log('🚀 Starting Clutch Database Audit');
  console.log('='.repeat(50));
  
  let db = null;
  
  try {
    // Connect using existing configuration
    console.log('🔌 Connecting to database...');
    db = await connectToDatabase();
    console.log('✅ Connected to database successfully');
    
    // Get existing collections
    console.log('\n📊 Auditing existing collections...');
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(col => col.name);
    
    console.log(`📋 Found ${existingNames.length} existing collections:`);
    existingNames.forEach(name => {
      console.log(`  ✅ ${name}`);
    });
    
    // Check for missing collections
    const missingCollections = REQUIRED_COLLECTIONS.filter(
      name => !existingNames.includes(name)
    );
    
    console.log(`\n⚠️  Missing ${missingCollections.length} required collections:`);
    missingCollections.forEach(name => {
      console.log(`  ❌ ${name}`);
    });
    
    // Create missing collections
    if (missingCollections.length > 0) {
      console.log('\n🔨 Creating missing collections...');
      
      for (const collectionName of missingCollections) {
        try {
          console.log(`📝 Creating collection: ${collectionName}`);
          await db.createCollection(collectionName);
          
          // Create basic indexes
          const collection = db.collection(collectionName);
          
          // Common indexes for all collections
          await collection.createIndex({ createdAt: 1 });
          await collection.createIndex({ updatedAt: 1 });
          
          // Specific indexes based on collection type
          if (collectionName.includes('user') || collectionName === 'employees') {
            await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
          }
          
          if (collectionName.includes('vehicle') || collectionName === 'vehicles') {
            await collection.createIndex({ licensePlate: 1 }, { unique: true, sparse: true });
          }
          
          if (collectionName.includes('product') || collectionName === 'products') {
            await collection.createIndex({ sku: 1 }, { unique: true, sparse: true });
          }
          
          if (collectionName.includes('transaction') || collectionName === 'payments') {
            await collection.createIndex({ userId: 1 });
            await collection.createIndex({ status: 1 });
          }
          
          if (collectionName.includes('audit') || collectionName === 'audit_logs') {
            await collection.createIndex({ userId: 1 });
            await collection.createIndex({ action: 1 });
            await collection.createIndex({ timestamp: 1 });
          }
          
          console.log(`  ✅ Created collection: ${collectionName}`);
          
        } catch (error) {
          console.error(`  ❌ Failed to create ${collectionName}: ${error.message}`);
        }
      }
    }
    
    // Final verification
    console.log('\n🔍 Final verification...');
    const finalCollections = await db.listCollections().toArray();
    const finalNames = finalCollections.map(col => col.name);
    const stillMissing = REQUIRED_COLLECTIONS.filter(
      name => !finalNames.includes(name)
    );
    
    // Generate report
    console.log('\n📊 DATABASE AUDIT REPORT');
    console.log('='.repeat(50));
    console.log(`Total Required Collections: ${REQUIRED_COLLECTIONS.length}`);
    console.log(`Existing Collections: ${existingNames.length}`);
    console.log(`Created Collections: ${missingCollections.length - stillMissing.length}`);
    console.log(`Still Missing: ${stillMissing.length}`);
    
    if (stillMissing.length > 0) {
      console.log('\n⚠️  Still missing collections:');
      stillMissing.forEach(name => {
        console.log(`  ❌ ${name}`);
      });
    }
    
    const success = stillMissing.length === 0;
    console.log(`\n${success ? '✅ AUDIT COMPLETE - ALL COLLECTIONS READY' : '⚠️  AUDIT INCOMPLETE - ISSUES REMAIN'}`);
    
    return {
      success,
      totalRequired: REQUIRED_COLLECTIONS.length,
      existing: existingNames.length,
      created: missingCollections.length - stillMissing.length,
      missing: stillMissing.length,
      missingCollections: stillMissing
    };
    
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the audit if this script is executed directly
if (require.main === module) {
  auditDatabase()
    .then(results => {
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = auditDatabase;
