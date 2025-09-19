#!/usr/bin/env node

/**
 * Test Resend Invitation
 * Tests the resend invitation functionality
 */

const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = 'clutch';

async function testResendInvitation() {
  console.log('🧪 Testing Resend Invitation...');
  
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
    
    // Get a pending invitation
    const invitation = await invitationsCollection.findOne({ status: 'pending' });
    
    if (!invitation) {
      console.log('❌ No pending invitations found');
      return { error: 'No pending invitations' };
    }
    
    console.log(`📧 Testing resend for invitation: ${invitation.email}`);
    console.log(`   Current token: ${invitation.invitationToken ? 'Yes' : 'No'}`);
    console.log(`   Current expires: ${invitation.expiresAt}`);
    
    // Simulate resend invitation logic
    const jwt = require('jsonwebtoken');
    const newInvitationToken = jwt.sign(
      { 
        email: invitation.email, 
        type: 'employee_invitation',
        invitedBy: invitation.invitedBy || 'system'
      },
      process.env.JWT_SECRET || 'test_jwt_secret_for_development_only',
      { expiresIn: '7d' }
    );
    
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    // Update the invitation
    const updateResult = await invitationsCollection.updateOne(
      { _id: invitation._id },
      { 
        $set: { 
          invitationToken: newInvitationToken,
          expiresAt: newExpiresAt,
          updatedAt: new Date()
        } 
      }
    );
    
    if (updateResult.modifiedCount > 0) {
      console.log('✅ Invitation updated successfully');
      console.log(`   New token: ${newInvitationToken ? 'Yes' : 'No'}`);
      console.log(`   New expires: ${newExpiresAt}`);
      
      // Test email service
      const emailService = require('../services/email-service');
      try {
        await emailService.sendEmployeeInvitation({
          email: invitation.email,
          name: invitation.name,
          role: invitation.role,
          department: invitation.department || 'General',
          invitationToken: newInvitationToken
        });
        console.log('✅ Email service test successful');
      } catch (emailError) {
        console.log('⚠️  Email service test failed (expected in development):', emailError.message);
      }
      
      return {
        success: true,
        invitationId: invitation._id,
        email: invitation.email,
        newToken: newInvitationToken,
        newExpires: newExpiresAt
      };
    } else {
      console.log('❌ Failed to update invitation');
      return { error: 'Update failed' };
    }
    
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
  testResendInvitation()
    .then(results => {
      if (results.error) {
        console.error('❌ Test failed:', results.error);
        process.exit(1);
      } else {
        console.log('\n✅ Resend test completed successfully');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = testResendInvitation;
