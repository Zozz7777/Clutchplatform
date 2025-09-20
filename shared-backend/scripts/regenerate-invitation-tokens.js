#!/usr/bin/env node

/**
 * Regenerate Invitation Tokens
 * Regenerates all existing invitation tokens with the correct JWT secret
 * Run this AFTER updating the production JWT_SECRET
 */

const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = process.env.MONGODB_DB || 'clutch';
const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_development_only';

async function regenerateInvitationTokens() {
  console.log('🔄 REGENERATING INVITATION TOKENS');
  console.log('='.repeat(40));
  console.log('');

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const invitationsCollection = db.collection('employee_invitations');
    
    console.log('📊 Current JWT_SECRET:', JWT_SECRET.substring(0, 20) + '...');
    console.log('');
    
    // Get all pending invitations
    const invitations = await invitationsCollection.find({ 
      status: { $in: ['pending', 'cancelled'] } 
    }).toArray();
    
    console.log(`Found ${invitations.length} invitations to regenerate`);
    console.log('');
    
    if (invitations.length === 0) {
      console.log('✅ No invitations need regeneration');
      return;
    }
    
    let regenerated = 0;
    let errors = 0;
    
    for (const invitation of invitations) {
      try {
        console.log(`Processing invitation for: ${invitation.email}`);
        
        // Generate new token with current JWT_SECRET
        const newToken = jwt.sign(
          { 
            email: invitation.email.toLowerCase(), 
            type: 'employee_invitation',
            invitedBy: invitation.invitedBy || 'system'
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        // Update invitation with new token
        await invitationsCollection.updateOne(
          { _id: invitation._id },
          { 
            $set: { 
              invitationToken: newToken,
              updatedAt: new Date(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            } 
          }
        );
        
        // Verify the new token works
        const decoded = jwt.verify(newToken, JWT_SECRET);
        console.log(`   ✅ Regenerated token for ${invitation.email}`);
        console.log(`   📧 Email: ${decoded.email}`);
        console.log(`   ⏰ Expires: ${new Date(decoded.exp * 1000).toISOString()}`);
        console.log(`   🔑 Token: ${newToken.substring(0, 30)}...`);
        console.log('');
        
        regenerated++;
        
      } catch (error) {
        console.log(`   ❌ Failed to regenerate token for ${invitation.email}: ${error.message}`);
        errors++;
      }
    }
    
    console.log('📊 REGENERATION SUMMARY:');
    console.log(`   ✅ Successfully regenerated: ${regenerated}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📧 Total processed: ${invitations.length}`);
    console.log('');
    
    if (regenerated > 0) {
      console.log('🎯 NEXT STEPS:');
      console.log('1. Test invitation acceptance with regenerated tokens');
      console.log('2. Send new invitation emails if needed');
      console.log('3. Verify all invitation links work properly');
      console.log('');
      
      console.log('🧪 TESTING:');
      console.log('Test the debug endpoints to verify tokens work:');
      console.log('https://clutch-main-nk7x.onrender.com/api/v1/debug/jwt-test');
      console.log('');
    }
    
    console.log('✅ TOKEN REGENERATION COMPLETE!');
    
  } catch (error) {
    console.error('❌ Regeneration failed:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  regenerateInvitationTokens();
}

module.exports = { regenerateInvitationTokens };
