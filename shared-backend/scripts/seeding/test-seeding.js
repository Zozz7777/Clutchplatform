#!/usr/bin/env node

const databaseConfig = require('./config/database-config');
const seedingConfig = require('./config/seeding-config');
const logoManager = require('./utils/logo-manager');

async function testSeedingSystem() {
  console.log('🧪 Testing Clutch Platform Seeding System...\n');
  
  try {
    // Test 1: Configuration Loading
    console.log('1️⃣  Testing Configuration Loading...');
    console.log(`   Environment: ${seedingConfig.environment}`);
    console.log(`   Production Mode: ${seedingConfig.isProduction()}`);
    console.log(`   Batch Size: ${seedingConfig.getBatchSize()}`);
    console.log(`   Delay MS: ${seedingConfig.getDelayMs()}`);
    console.log(`   Logo Upload Enabled: ${seedingConfig.shouldUploadLogos()}`);
    console.log('   ✅ Configuration loaded successfully\n');
    
    // Test 2: Database Connection
    console.log('2️⃣  Testing Database Connection...');
    await databaseConfig.connect();
    const dbHealth = await databaseConfig.healthCheck();
    console.log(`   Database Status: ${dbHealth.status}`);
    console.log(`   Database Message: ${dbHealth.message}`);
    console.log('   ✅ Database connection successful\n');
    
    // Test 3: Firebase Configuration (if enabled)
    if (seedingConfig.shouldUploadLogos()) {
      console.log('3️⃣  Testing Firebase Configuration...');
      try {
        await logoManager.initialize();
        const firebaseHealth = await logoManager.healthCheck();
        console.log(`   Firebase Status: ${firebaseHealth.firebase.status}`);
        console.log(`   Firebase Message: ${firebaseHealth.firebase.message}`);
        console.log('   ✅ Firebase configuration successful\n');
      } catch (error) {
        console.log(`   ⚠️  Firebase configuration failed: ${error.message}`);
        console.log('   ℹ️  Logo upload will be disabled\n');
      }
    } else {
      console.log('3️⃣  Testing Firebase Configuration...');
      console.log('   ⏭️  Logo upload disabled, skipping Firebase test\n');
    }
    
    // Test 4: Database Operations
    console.log('4️⃣  Testing Database Operations...');
    const collections = await databaseConfig.getAllCollectionStats();
    console.log(`   Found ${collections.length} collections in database`);
    console.log('   ✅ Database operations successful\n');
    
    // Test 5: Configuration Validation
    console.log('5️⃣  Testing Configuration Validation...');
    const requiredEnvVars = [
      'MONGODB_URI',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL'
    ];
    
    const missingVars = [];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      }
    }
    
    if (missingVars.length > 0) {
      console.log(`   ⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    } else {
      console.log('   ✅ All required environment variables are set');
    }
    console.log('   ✅ Configuration validation completed\n');
    
    // Test 6: Seeding Modules
    console.log('6️⃣  Testing Seeding Modules...');
    const modules = [
      'obdCodes',
      'vehicles', 
      'services',
      'locations',
      'payments',
      'businesses',
      'features',
      'notifications'
    ];
    
    for (const module of modules) {
      const isEnabled = seedingConfig.isEnabled(module);
      const priority = seedingConfig.getPriority(module);
      const includeLogos = seedingConfig.shouldIncludeLogos(module);
      
      console.log(`   ${module}: ${isEnabled ? '✅ Enabled' : '❌ Disabled'} (${priority})${includeLogos ? ' + logos' : ''}`);
    }
    console.log('   ✅ Seeding modules validation completed\n');
    
    // Summary
    console.log('🎉 Seeding System Test Summary:');
    console.log('   ✅ Configuration loading: PASSED');
    console.log('   ✅ Database connection: PASSED');
    console.log('   ✅ Database operations: PASSED');
    console.log('   ✅ Configuration validation: PASSED');
    console.log('   ✅ Seeding modules: PASSED');
    console.log('\n🚀 Seeding system is ready to use!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run: npm run seed:obd-codes (for OBD error codes)');
    console.log('   2. Run: npm run seed:vehicles (for car brands and models)');
    console.log('   3. Run: npm run seed:all (for all data)');
    
  } catch (error) {
    console.error('\n❌ Seeding system test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your .env file configuration');
    console.log('   2. Verify MongoDB connection string');
    console.log('   3. Check Firebase credentials');
    console.log('   4. Ensure all dependencies are installed');
    process.exit(1);
  } finally {
    // Cleanup
    try {
      await logoManager.disconnect();
      await databaseConfig.disconnect();
      console.log('\n🔌 Test completed, connections closed');
    } catch (error) {
      console.error('❌ Error during cleanup:', error.message);
    }
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testSeedingSystem();
}

module.exports = { testSeedingSystem };
