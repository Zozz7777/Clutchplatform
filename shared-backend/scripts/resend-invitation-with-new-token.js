#!/usr/bin/env node

/**
 * Resend Invitation with New Token Script
 * Sends a new invitation email with the corrected token
 */

const { MongoClient } = require('mongodb');
const emailService = require('../services/email-service');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = process.env.MONGODB_DB || 'clutch';

async function resendInvitationWithNewToken() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    const email = 'fusionegy@gmail.com';
    
    // Find the invitation with the new token
    const invitation = await db.collection('employee_invitations').findOne({ email });
    
    if (!invitation) {
      console.log('❌ No invitation found for:', email);
      return;
    }
    
    console.log('✅ Found invitation for:', email);
    console.log('✅ Invitation token:', invitation.invitationToken);
    
    // Send invitation email with the new token
    try {
      await emailService.sendEmployeeInvitation({
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        department: invitation.department || 'General',
        invitationToken: invitation.invitationToken
      });
      
      console.log('✅ Invitation email sent successfully to:', email);
      console.log('✅ New invitation URL:');
      console.log(`   https://admin.yourclutch.com/setup-password?token=${invitation.invitationToken}`);
      
    } catch (emailError) {
      console.error('❌ Failed to send invitation email:', emailError);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  resendInvitationWithNewToken();
}

module.exports = { resendInvitationWithNewToken };
