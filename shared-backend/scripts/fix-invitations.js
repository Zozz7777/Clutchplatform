#!/usr/bin/env node

/**
 * Fix Employee Invitations
 * Updates existing invitations to have correct status and structure
 */

const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = 'clutch';

async function fixInvitations() {
  console.log('🔧 Fixing Employee Invitations...');
  
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
    
    const invitationsCollection = db.collection('employee_invitations');
    
    // Get all invitations
    const invitations = await invitationsCollection.find({}).toArray();
    console.log(`📋 Found ${invitations.length} invitations to fix`);
    
    for (const invitation of invitations) {
      console.log(`\n🔧 Fixing invitation: ${invitation.email}`);
      
      const updates = {};
      
      // Fix status if it's 'sent' instead of 'pending'
      if (invitation.status === 'sent') {
        updates.status = 'pending';
        console.log(`  ✅ Updated status: sent → pending`);
      }
      
      // Add missing invitationToken if not present
      if (!invitation.invitationToken) {
        const jwt = require('jsonwebtoken');
        const invitationToken = jwt.sign(
          { 
            email: invitation.email, 
            type: 'employee_invitation',
            invitedBy: invitation.invitedBy || 'system'
          },
          process.env.JWT_SECRET || 'test_jwt_secret_for_development_only',
          { expiresIn: '7d' }
        );
        updates.invitationToken = invitationToken;
        console.log(`  ✅ Added missing invitation token`);
      }
      
      // Ensure expiresAt is set correctly
      if (!invitation.expiresAt || invitation.expiresAt < new Date()) {
        updates.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        console.log(`  ✅ Updated expiration date`);
      }
      
      // Add missing fields
      if (!invitation.permissions) {
        updates.permissions = ['read'];
        console.log(`  ✅ Added default permissions`);
      }
      
      if (!invitation.invitedBy) {
        updates.invitedBy = 'system';
        console.log(`  ✅ Added invitedBy field`);
      }
      
      // Update the invitation if there are changes
      if (Object.keys(updates).length > 0) {
        await invitationsCollection.updateOne(
          { _id: invitation._id },
          { $set: updates }
        );
        console.log(`  ✅ Updated invitation with ${Object.keys(updates).length} fields`);
      } else {
        console.log(`  ℹ️  No updates needed`);
      }
    }
    
    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const updatedInvitations = await invitationsCollection.find({}).toArray();
    
    updatedInvitations.forEach((invitation, index) => {
      console.log(`\n${index + 1}. Updated Invitation:`);
      console.log(`   Email: ${invitation.email}`);
      console.log(`   Status: ${invitation.status}`);
      console.log(`   Has Token: ${invitation.invitationToken ? 'Yes' : 'No'}`);
      console.log(`   Expires: ${invitation.expiresAt}`);
      console.log(`   Permissions: ${JSON.stringify(invitation.permissions)}`);
    });
    
    const pendingCount = await invitationsCollection.countDocuments({ status: 'pending' });
    console.log(`\n✅ Fixed ${invitations.length} invitations`);
    console.log(`📊 Pending invitations: ${pendingCount}`);
    
    return {
      fixed: invitations.length,
      pending: pendingCount
    };
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    return { error: error.message };
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the fix if this script is executed directly
if (require.main === module) {
  fixInvitations()
    .then(results => {
      if (results.error) {
        console.error('❌ Fix failed:', results.error);
        process.exit(1);
      } else {
        console.log('\n✅ Fix completed successfully');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = fixInvitations;
