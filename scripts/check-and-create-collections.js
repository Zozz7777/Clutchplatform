#!/usr/bin/env node

/**
 * MongoDB Atlas Collections Check and Creation Script
 * This script ensures all required collections exist in the database
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = process.env.MONGODB_DB || 'clutch';

// Required collections for the Clutch platform
const REQUIRED_COLLECTIONS = [
  // Core User Management
  'users',
  'employees',
  'mechanics',
  'customers',
  'clients',
  
  // Vehicle Management
  'vehicles',
  'cars',
  'car_makes_models',
  'car_parts',
  
  // Booking and Services
  'bookings',
  'services',
  'maintenance',
  'orders',
  'parts_orders',
  'parts_shops',
  
  // Financial
  'transactions',
  'payments',
  'earnings',
  'finance',
  
  // Communication
  'notifications',
  'chat',
  'messages',
  'reviews',
  
  // Business Operations
  'analytics',
  'dashboard',
  'marketing',
  'campaigns',
  'leads',
  'sales',
  'support',
  'support_tickets',
  'support_categories',
  'support_priorities',
  'support_comments',
  
  // System and Security
  'audit_logs',
  'security_audit_logs',
  'api_keys',
  'system_metrics',
  'system_alerts',
  'admin_actions',
  'error_logs',
  
  // AI/ML Collections
  'ml_training_data',
  'ml_models',
  'ml_predictions',
  
  // UI/UX Collections
  'user_theme_preferences',
  'theme_templates',
  'theme_analytics',
  'theme_custom_colors',
  'public_custom_colors',
  'color_palettes',
  'theme_previews',
  'theme_assets',
  'theme_feedback',
  'ui_updates',
  'mobile_optimization',
  'design_system',
  'performance_metrics',
  
  // Search and Analytics
  'search_history',
  'search_analytics',
  'user_interactions',
  
  // Reports and Customization
  'custom_reports',
  'report_templates',
  
  // Business Intelligence
  'sales_pipeline',
  'sales_leads',
  'sales_deals',
  'contracts',
  'quotes',
  
  // Operations
  'operations',
  'jobs',
  'disputes',
  'verification',
  'tracking',
  'settings',
  'approvals',
  'roles',
  'activities',
  
  // Additional Collections
  'satisfaction_ratings',
  'analytics_events',
  'analytics_sessions',
  'files',
  'uploads',
  'permissions',
  'emails',
  'subscriptions',
  'topics'
];

// Collection indexes for performance optimization
const COLLECTION_INDEXES = {
  users: [
    { key: { email: 1 }, unique: true },
    { key: { phone: 1 } },
    { key: { status: 1 } },
    { key: { createdAt: 1 } }
  ],
  bookings: [
    { key: { bookingNumber: 1 }, unique: true },
    { key: { customerId: 1 } },
    { key: { mechanicId: 1 } },
    { key: { status: 1 } },
    { key: { createdAt: 1 } },
    { key: { scheduledDate: 1 } }
  ],
  vehicles: [
    { key: { userId: 1 } },
    { key: { licensePlate: 1 } },
    { key: { make: 1, model: 1 } },
    { key: { year: 1 } }
  ],
  transactions: [
    { key: { transactionId: 1 }, unique: true },
    { key: { userId: 1 } },
    { key: { bookingId: 1 } },
    { key: { status: 1 } },
    { key: { createdAt: 1 } }
  ],
  notifications: [
    { key: { userId: 1 } },
    { key: { type: 1 } },
    { key: { read: 1 } },
    { key: { createdAt: 1 } }
  ],
  analytics_events: [
    { key: { eventType: 1 } },
    { key: { userId: 1 } },
    { key: { timestamp: 1 } },
    { key: { sessionId: 1 } }
  ]
};

async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 0,
      connectTimeoutMS: 60000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 60000,
      retryWrites: true,
      w: 'majority'
    });

    await client.connect();
    const db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB Atlas');
    return { client, db };
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function checkCollections(db) {
  try {
    const collections = await db.listCollections().toArray();
    const existingCollections = collections.map(col => col.name);
    
    console.log('\n📊 Current Collections:');
    console.log('========================');
    existingCollections.forEach(col => {
      console.log(`✅ ${col}`);
    });
    
    return existingCollections;
  } catch (error) {
    console.error('❌ Error checking collections:', error);
    throw error;
  }
}

async function createMissingCollections(db, existingCollections) {
  const missingCollections = REQUIRED_COLLECTIONS.filter(
    col => !existingCollections.includes(col)
  );
  
  if (missingCollections.length === 0) {
    console.log('\n🎉 All required collections already exist!');
    return [];
  }
  
  console.log('\n🔧 Creating missing collections:');
  console.log('================================');
  
  const createdCollections = [];
  
  for (const collectionName of missingCollections) {
    try {
      await db.createCollection(collectionName);
      console.log(`✅ Created collection: ${collectionName}`);
      createdCollections.push(collectionName);
    } catch (error) {
      console.error(`❌ Failed to create collection ${collectionName}:`, error.message);
    }
  }
  
  return createdCollections;
}

async function createIndexes(db) {
  console.log('\n🔍 Creating indexes for performance:');
  console.log('====================================');
  
  for (const [collectionName, indexes] of Object.entries(COLLECTION_INDEXES)) {
    try {
      const collection = db.collection(collectionName);
      
      for (const index of indexes) {
        try {
          await collection.createIndex(index.key, {
            unique: index.unique || false,
            name: index.name || `${Object.keys(index.key).join('_')}_idx`
          });
          console.log(`✅ Created index for ${collectionName}: ${Object.keys(index.key).join(', ')}`);
        } catch (error) {
          if (error.code === 85) { // Index already exists
            console.log(`ℹ️  Index already exists for ${collectionName}: ${Object.keys(index.key).join(', ')}`);
          } else {
            console.error(`❌ Failed to create index for ${collectionName}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error creating indexes for ${collectionName}:`, error.message);
    }
  }
}

async function validateDatabase() {
  console.log('🔍 Validating database structure...');
  console.log('===================================');
  
  const { client, db } = await connectToDatabase();
  
  try {
    // Check existing collections
    const existingCollections = await checkCollections(db);
    
    // Create missing collections
    const createdCollections = await createMissingCollections(db, existingCollections);
    
    // Create indexes for performance
    await createIndexes(db);
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log('===========');
    console.log(`Total required collections: ${REQUIRED_COLLECTIONS.length}`);
    console.log(`Existing collections: ${existingCollections.length}`);
    console.log(`Created collections: ${createdCollections.length}`);
    console.log(`Missing collections: ${REQUIRED_COLLECTIONS.length - existingCollections.length - createdCollections.length}`);
    
    if (createdCollections.length > 0) {
      console.log('\n✅ Database setup completed successfully!');
    } else {
      console.log('\n✅ Database is already properly configured!');
    }
    
  } catch (error) {
    console.error('❌ Database validation failed:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  validateDatabase().catch(console.error);
}

module.exports = { validateDatabase, REQUIRED_COLLECTIONS };
