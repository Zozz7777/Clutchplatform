#!/usr/bin/env node

/**
 * Test Employee Invitations
 * Debug script to test invitation functionality
 */

const { connectToDatabase } = require('../config/database-unified');

async function testInvitations() {
  console.log('🧪 Testing Employee Invitations...');
  
  let db = null;
  
  try {
    // Connect to database
    db = await connectToDatabase();
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
    
    return {
      total: invitations.length,
      pending: pendingInvitations.length,
      expired: expiredInvitations.length,
      invitations: invitations
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { error: error.message };
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
