const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

/**
 * Enhanced Data Migration Script
 */

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch-db';
const MIGRATION_LOG_FILE = path.join(__dirname, '..', 'logs', 'migration.log');

// Ensure logs directory exists
const logsDir = path.dirname(MIGRATION_LOG_FILE);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logMigration = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(MIGRATION_LOG_FILE, logMessage);
};

async function migrateData() {
  const client = new MongoClient(DB_URI);
  
  try {
    await client.connect();
    logMigration('✅ Connected to database for migration');
    
    const db = client.db();
    
    // Migration 1: Create comprehensive indexes
    const collections = [
      'users', 'vehicles', 'bookings', 'payments', 'transactions',
      'notifications', 'audit_logs', 'sessions', 'device_tokens',
      'car_parts', 'service_centers', 'mechanics', 'employees'
    ];
    
    for (const collectionName of collections) {
      try {
        // Create standard indexes
        await db.collection(collectionName).createIndex({ createdAt: 1 });
        await db.collection(collectionName).createIndex({ updatedAt: 1 });
        
        // Create collection-specific indexes
        if (collectionName === 'users') {
          await db.collection(collectionName).createIndex({ email: 1 }, { unique: true });
          await db.collection(collectionName).createIndex({ phone: 1 });
          await db.collection(collectionName).createIndex({ role: 1 });
        } else if (collectionName === 'vehicles') {
          await db.collection(collectionName).createIndex({ userId: 1 });
          await db.collection(collectionName).createIndex({ licensePlate: 1 });
          await db.collection(collectionName).createIndex({ make: 1, model: 1 });
        } else if (collectionName === 'bookings') {
          await db.collection(collectionName).createIndex({ userId: 1 });
          await db.collection(collectionName).createIndex({ serviceCenterId: 1 });
          await db.collection(collectionName).createIndex({ status: 1 });
          await db.collection(collectionName).createIndex({ bookingDate: 1 });
        } else if (collectionName === 'payments') {
          await db.collection(collectionName).createIndex({ userId: 1 });
          await db.collection(collectionName).createIndex({ transactionId: 1 });
          await db.collection(collectionName).createIndex({ status: 1 });
          await db.collection(collectionName).createIndex({ paymentDate: 1 });
        }
        
        logMigration(`✅ Created indexes for ${collectionName}`);
      } catch (error) {
        logMigration(`⚠️ Index creation for ${collectionName}: ${error.message}`);
      }
    }
    
    // Migration 2: Update user documents with default values
    const usersCollection = db.collection('users');
    const userResult = await usersCollection.updateMany(
      { emailVerified: { $exists: false } },
      { 
        $set: { 
          emailVerified: false, 
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          lastLogin: null
        } 
      }
    );
    logMigration(`✅ Updated ${userResult.modifiedCount} user documents`);
    
    // Migration 3: Update vehicle documents
    const vehiclesCollection = db.collection('vehicles');
    const vehicleResult = await vehiclesCollection.updateMany(
      { createdAt: { $exists: false } },
      { 
        $set: { 
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        } 
      }
    );
    logMigration(`✅ Updated ${vehicleResult.modifiedCount} vehicle documents`);
    
    // Migration 4: Update booking documents
    const bookingsCollection = db.collection('bookings');
    const bookingResult = await bookingsCollection.updateMany(
      { createdAt: { $exists: false } },
      { 
        $set: { 
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'pending'
        } 
      }
    );
    logMigration(`✅ Updated ${bookingResult.modifiedCount} booking documents`);
    
    // Migration 5: Create audit log entries for migration
    const auditLogsCollection = db.collection('audit_logs');
    await auditLogsCollection.insertOne({
      action: 'data_migration',
      description: 'Comprehensive data migration completed',
      timestamp: new Date(),
      metadata: {
        usersUpdated: userResult.modifiedCount,
        vehiclesUpdated: vehicleResult.modifiedCount,
        bookingsUpdated: bookingResult.modifiedCount,
        collectionsIndexed: collections.length
      }
    });
    
    logMigration('🎉 Migration completed successfully');
    
  } catch (error) {
    logMigration(`❌ Migration failed: ${error.message}`);
    throw error;
  } finally {
    await client.close();
  }
}

// Rollback function
async function rollbackMigration() {
  const client = new MongoClient(DB_URI);
  
  try {
    await client.connect();
    logMigration('🔄 Starting migration rollback');
    
    const db = client.db();
    
    // Remove indexes (this is a simplified rollback)
    const collections = ['users', 'vehicles', 'bookings', 'payments'];
    
    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).dropIndex({ createdAt: 1 });
        await db.collection(collectionName).dropIndex({ updatedAt: 1 });
        logMigration(`✅ Rolled back indexes for ${collectionName}`);
      } catch (error) {
        logMigration(`⚠️ Rollback for ${collectionName}: ${error.message}`);
      }
    }
    
    logMigration('✅ Rollback completed');
    
  } catch (error) {
    logMigration(`❌ Rollback failed: ${error.message}`);
    throw error;
  } finally {
    await client.close();
  }
}

// Run migration
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'rollback') {
    rollbackMigration();
  } else {
    migrateData();
  }
}

module.exports = { migrateData, rollbackMigration };
