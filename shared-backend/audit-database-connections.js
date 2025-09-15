/**
 * Database Connection Audit Script
 * Audits all database connections and identifies mock data usage
 */

const { connectToDatabase, getDatabaseHealth } = require('./config/database-unified');

async function auditDatabaseConnections() {
  console.log('🔍 AUDITING DATABASE CONNECTIONS...\n');

  try {
    // Test database connection
    console.log('1️⃣ Testing database connection...');
    const db = await connectToDatabase();
    console.log('✅ Database connected successfully');

    // Get database health
    console.log('\n2️⃣ Checking database health...');
    const health = await getDatabaseHealth();
    console.log('📊 Database Health:', health);

    // List all collections
    console.log('\n3️⃣ Listing all collections...');
    const collections = await db.listCollections().toArray();
    console.log(`📦 Found ${collections.length} collections:`);
    
    for (const collection of collections) {
      console.log(`   - ${collection.name}`);
      
      // Get collection stats
      try {
        const stats = await db.collection(collection.name).stats();
        console.log(`     Documents: ${stats.count}, Size: ${(stats.size / 1024).toFixed(2)} KB`);
      } catch (error) {
        console.log(`     Error getting stats: ${error.message}`);
      }
    }

    // Check for data in key collections
    console.log('\n4️⃣ Checking key collections for data...');
    const keyCollections = ['users', 'vehicles', 'bookings', 'notifications', 'analytics'];
    
    for (const collectionName of keyCollections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`   ${collectionName}: ${count} documents`);
        
        if (count > 0) {
          // Get a sample document
          const sample = await collection.findOne();
          console.log(`     Sample: ${JSON.stringify(sample, null, 2).substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`   ${collectionName}: Error - ${error.message}`);
      }
    }

    console.log('\n✅ Database audit completed');

  } catch (error) {
    console.error('❌ Database audit failed:', error);
  }
}

// Run the audit
auditDatabaseConnections();
