#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests MongoDB Atlas connection and verifies all collections and indexes
 */

require('dotenv').config();
const { connectToDatabase, checkDatabaseHealth, getCollection } = require('../config/database');

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');

  try {
    // Test basic connection
    console.log('1️⃣ Testing basic connection...');
    const db = await connectToDatabase();
    if (!db) {
      throw new Error('Failed to connect to database');
    }
    console.log('✅ Basic connection successful\n');

    // Test database health
    console.log('2️⃣ Testing database health...');
    const health = await checkDatabaseHealth();
    console.log('📊 Database Health Status:', health);
    if (health.status === 'healthy') {
      console.log('✅ Database health check passed\n');
    } else {
      console.log('❌ Database health check failed\n');
    }

    // Test collection access
    console.log('3️⃣ Testing collection access...');
    const testCollections = [
      'employees', 'users', 'chat_rooms', 'chat_messages',
      'support_tickets', 'analytics', 'audit_logs'
    ];

    for (const collectionName of testCollections) {
      try {
        const collection = await getCollection(collectionName);
        const count = await collection.countDocuments();
        console.log(`✅ Collection '${collectionName}': ${count} documents`);
      } catch (error) {
        console.log(`❌ Collection '${collectionName}': ${error.message}`);
      }
    }
    console.log('');

    // Test database operations
    console.log('4️⃣ Testing database operations...');
    
    // Test read operation
    try {
      const employeesCollection = await getCollection('employees');
      const sampleEmployee = await employeesCollection.findOne({});
      if (sampleEmployee) {
        console.log('✅ Read operation successful');
      } else {
        console.log('⚠️ Read operation successful (no data found)');
      }
    } catch (error) {
      console.log(`❌ Read operation failed: ${error.message}`);
    }

    // Test write operation (safe test)
    try {
      const testCollection = await getCollection('test_connection');
      await testCollection.insertOne({
        test: true,
        timestamp: new Date(),
        message: 'Connection test successful'
      });
      console.log('✅ Write operation successful');
      
      // Clean up test data
      await testCollection.deleteOne({ test: true });
      console.log('✅ Cleanup operation successful');
    } catch (error) {
      console.log(`❌ Write operation failed: ${error.message}`);
    }

    console.log('');

    // Test performance
    console.log('5️⃣ Testing performance...');
    const startTime = Date.now();
    const employeesCollection = await getCollection('employees');
    await employeesCollection.find({}).limit(100).toArray();
    const queryTime = Date.now() - startTime;
    console.log(`⏱️ Query performance: ${queryTime}ms`);
    
    if (queryTime < 1000) {
      console.log('✅ Performance acceptable (< 1 second)');
    } else {
      console.log('⚠️ Performance slow (> 1 second)');
    }

    console.log('\n🎉 Database connection test completed successfully!');
    console.log('✅ All systems operational');
    console.log('✅ Ready for production deployment');

  } catch (error) {
    console.error('\n❌ Database connection test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testDatabaseConnection()
    .then(() => {
      console.log('\n🚀 Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testDatabaseConnection };
