#!/usr/bin/env node

/**
 * Check MongoDB Collections Script
 * Lists all collections in the database to see what employee-related collections exist
 */

const { MongoClient } = require('mongodb');

// Use the correct production MongoDB URI
const MONGODB_URI = 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch';

async function checkCollections() {
  let client;
  
  try {
    console.log('🔍 Checking MongoDB collections...');
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Get all collection names
    const collections = await db.listCollections().toArray();
    
    console.log(`\n📋 Found ${collections.length} collections:`);
    
    // Group collections by type
    const employeeCollections = [];
    const userCollections = [];
    const otherCollections = [];
    
    collections.forEach(collection => {
      const name = collection.name.toLowerCase();
      if (name.includes('employee') || name.includes('staff') || name.includes('personnel')) {
        employeeCollections.push(collection.name);
      } else if (name.includes('user') || name.includes('account') || name.includes('profile')) {
        userCollections.push(collection.name);
      } else {
        otherCollections.push(collection.name);
      }
    });
    
    // Display employee-related collections
    if (employeeCollections.length > 0) {
      console.log('\n👔 Employee-related collections:');
      employeeCollections.forEach(name => {
        console.log(`   • ${name}`);
      });
    }
    
    // Display user-related collections
    if (userCollections.length > 0) {
      console.log('\n👤 User-related collections:');
      userCollections.forEach(name => {
        console.log(`   • ${name}`);
      });
    }
    
    // Display other collections
    if (otherCollections.length > 0) {
      console.log('\n📁 Other collections:');
      otherCollections.forEach(name => {
        console.log(`   • ${name}`);
      });
    }
    
    // Check specific collections for employee data
    console.log('\n🔍 Checking specific collections for employee data:');
    
    const collectionsToCheck = ['employees', 'employee', 'staff', 'personnel', 'users', 'user', 'accounts'];
    
    for (const collectionName of collectionsToCheck) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        if (count > 0) {
          console.log(`   • ${collectionName}: ${count} documents`);
          
          // Check if ziad@yourclutch.com exists in this collection
          const ziadExists = await collection.findOne({ email: 'ziad@yourclutch.com' });
          if (ziadExists) {
            console.log(`     ✅ ziad@yourclutch.com found in ${collectionName}`);
            console.log(`     📋 Role: ${ziadExists.role || 'Not set'}`);
            console.log(`     📋 Name: ${ziadExists.name || ziadExists.firstName + ' ' + ziadExists.lastName || 'Not set'}`);
            console.log(`     📋 Permissions: ${ziadExists.websitePermissions?.length || 0} permissions`);
          } else {
            console.log(`     ❌ ziad@yourclutch.com not found in ${collectionName}`);
          }
        }
      } catch (error) {
        // Collection doesn't exist, skip
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking collections:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

if (require.main === module) {
  checkCollections();
}

module.exports = { checkCollections };
