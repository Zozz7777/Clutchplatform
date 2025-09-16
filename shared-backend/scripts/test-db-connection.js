const mongoose = require('mongoose');
require('dotenv').config();

async function testDBConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch');
    console.log('✅ Connected to database');

    // Test basic database operations
    console.log('\n📊 Testing basic database operations...');
    
    // Test creating a simple document
    const testCollection = mongoose.connection.db.collection('test_rbac');
    await testCollection.insertOne({ test: 'data', timestamp: new Date() });
    console.log('✅ Insert test successful');
    
    // Test reading
    const result = await testCollection.findOne({ test: 'data' });
    console.log('✅ Read test successful:', result ? 'Found document' : 'No document found');
    
    // Test counting
    const count = await testCollection.countDocuments();
    console.log('✅ Count test successful:', count, 'documents');
    
    // Clean up
    await testCollection.deleteMany({ test: 'data' });
    console.log('✅ Cleanup successful');
    
    // Test Permission model specifically
    console.log('\n📋 Testing Permission model...');
    const Permission = require('../models/Permission');
    
    // Try to create a permission
    const testPermission = new Permission({
      name: 'test_permission_' + Date.now(),
      groupName: 'CORE_SYSTEM_DASHBOARD',
      description: 'Test permission',
      isSystem: true
    });
    
    await testPermission.save();
    console.log('✅ Permission creation successful');
    
    // Try to find permissions
    const permissions = await Permission.find({});
    console.log('✅ Permission query successful:', permissions.length, 'permissions found');
    
    // Clean up
    await Permission.deleteOne({ _id: testPermission._id });
    console.log('✅ Permission cleanup successful');
    
    console.log('\n🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testDBConnection()
    .then(() => {
      console.log('🎉 Database connection test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database connection test failed:', error);
      process.exit(1);
    });
}

module.exports = { testDBConnection };
