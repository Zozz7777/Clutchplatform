const { MongoClient } = require('mongodb');

// All the roles needed based on the requireRole checks in the codebase
const ALL_ROLES = [
  'admin',
  'hr_manager',
  'fleet_manager', 
  'enterprise_manager',
  'sales_manager',
  'analytics',
  'management',
  'cto',
  'operations',
  'sales_rep',
  'manager',
  'analyst',
  'super_admin',
  'finance_manager',
  'marketing_manager',
  'legal_manager',
  'partner_manager',
  'hr',
  'fleet_admin',
  'driver',
  'accountant'
];

async function updateZiadRolesProduction() {
  // Use the production MongoDB URI - you'll need to replace this with the actual URI
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your_username:your_password@your_cluster.mongodb.net/?retryWrites=true&w=majority&appName=Clutch';
  
  if (MONGODB_URI === 'mongodb+srv://your_username:your_password@your_cluster.mongodb.net/?retryWrites=true&w=majority&appName=Clutch') {
    console.log('❌ Please set the MONGODB_URI environment variable with your actual MongoDB connection string');
    console.log('💡 You can get this from your Render dashboard or MongoDB Atlas');
    console.log('\n🔧 To run this script:');
    console.log('1. Get your MongoDB URI from your production environment');
    console.log('2. Set it as an environment variable:');
    console.log('   export MONGODB_URI="your_actual_mongodb_uri"');
    console.log('3. Run: node scripts/update-ziad-roles-production.js');
    return;
  }
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    const employeesCollection = db.collection('employees');
    const usersCollection = db.collection('users');
    
    console.log('🔍 Searching for user ziad@yourclutch.com...');
    
    // Try to find user in employees collection first
    let user = await employeesCollection.findOne({ 
      'basicInfo.email': { $regex: /ziad@yourclutch\.com/i } 
    });
    
    if (!user) {
      console.log('🔍 Trying alternative email ziad@clutchapp.one...');
      user = await employeesCollection.findOne({ 
        'basicInfo.email': { $regex: /ziad@clutchapp\.one/i } 
      });
    }
    
    if (!user) {
      console.log('🔍 Trying users collection...');
      user = await usersCollection.findOne({ 
        email: { $regex: /ziad@yourclutch\.com/i } 
      });
      
      if (!user) {
        user = await usersCollection.findOne({ 
          email: { $regex: /ziad@clutchapp\.one/i } 
        });
      }
    }
    
    if (!user) {
      console.log('❌ User not found in database');
      console.log('💡 Make sure the user exists and try again');
      return;
    }
    
    console.log('✅ Found user:', user.basicInfo?.email || user.email);
    console.log('👤 Current role:', user.role || 'No role assigned');
    
    // Update with all roles
    const updateData = {
      role: 'admin',
      roles: ALL_ROLES,
      permissions: ['*:*:*'], // Wildcard permission for everything
      updatedAt: new Date()
    };
    
    let result;
    if (user.basicInfo) {
      // Employee collection
      console.log('📝 Updating employee record...');
      result = await employeesCollection.updateOne(
        { _id: user._id },
        { $set: updateData }
      );
    } else {
      // Users collection
      console.log('📝 Updating user record...');
      result = await usersCollection.updateOne(
        { _id: user._id },
        { $set: updateData }
      );
    }
    
    if (result.modifiedCount > 0) {
      console.log('✅ User roles updated successfully!');
      console.log('👑 Primary role: admin');
      console.log('🎭 All roles assigned:', ALL_ROLES);
      console.log('🔓 Permissions: Full system access (*:*:*)');
      console.log('\n🎉 User now has access to all features!');
      console.log('\n📧 Email: ziad@yourclutch.com');
      console.log('🔑 Password: 4955698*Z*z');
    } else {
      console.log('⚠️ No changes made to user (roles may already be set)');
    }
    
  } catch (error) {
    console.error('❌ Error updating user roles:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
console.log('🚀 Starting user role update for ziad@yourclutch.com...');
updateZiadRolesProduction();
