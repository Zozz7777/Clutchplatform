#!/usr/bin/env node

/**
 * Direct Test Employee Invitations
 * Bypasses environment configuration for direct database access
 */

const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = 'clutch';

async function testInvitations() {
  console.log('🧪 Testing Employee Invitations...');
  
  let client = null;
  let db = null;
  
  try {
    // Connect directly to MongoDB
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to database');
    
    // Check employee_invitations collection
    const invitationsCollection = db.collection('employee_invitations');
    
    // Get all invitations
    const invitations = await invitationsCollection.find({}).toArray();
    console.log(`📋 Found ${invitations.length} invitations:`);
    
    invitations.forEach((invitation, index) => {
      console.log(`\n${index + 1}. Invitation:`);
      console.log(`   ID: ${invitation._id}`);
      console.log(`   Email: ${invitation.email}`);
      console.log(`   Name: ${invitation.name}`);
      console.log(`   Status: ${invitation.status}`);
      console.log(`   Role: ${invitation.role}`);
      console.log(`   Department: ${invitation.department}`);
      console.log(`   Created: ${invitation.createdAt}`);
      console.log(`   Expires: ${invitation.expiresAt}`);
      console.log(`   Has Token: ${invitation.invitationToken ? 'Yes' : 'No'}`);
    });
    
    // Check if there are any pending invitations
    const pendingInvitations = await invitationsCollection.find({ status: 'pending' }).toArray();
    console.log(`\n⏳ Pending invitations: ${pendingInvitations.length}`);
    
    // Check if there are any expired invitations
    const now = new Date();
    const expiredInvitations = await invitationsCollection.find({ 
      status: 'pending',
      expiresAt: { $lt: now }
    }).toArray();
    console.log(`⏰ Expired invitations: ${expiredInvitations.length}`);
    
    // Test creating a sample invitation
    console.log('\n🧪 Testing invitation creation...');
    const testInvitation = {
      email: 'test@example.com',
      name: 'Test Employee',
      role: 'employee',
      department: 'Testing',
      position: 'Test Position',
      permissions: ['read'],
      invitationToken: 'test-token-123',
      invitedBy: 'test-user-id',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      acceptedAt: null
    };
    
    // Check if test invitation already exists
    const existingTest = await invitationsCollection.findOne({ email: 'test@example.com' });
    if (existingTest) {
      console.log('⚠️  Test invitation already exists, skipping creation');
    } else {
      const result = await invitationsCollection.insertOne(testInvitation);
      console.log(`✅ Test invitation created with ID: ${result.insertedId}`);
    }
    
    return {
      total: invitations.length,
      pending: pendingInvitations.length,
      expired: expiredInvitations.length,
      invitations: invitations
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { error: error.message };
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testInvitations()
    .then(results => {
      if (results.error) {
        console.error('❌ Test failed:', results.error);
        process.exit(1);
      } else {
        console.log('\n✅ Test completed successfully');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = testInvitations;
