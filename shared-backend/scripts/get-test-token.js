#!/usr/bin/env node

/**
 * Get Test Invitation Token
 * Retrieves the current token for the test invitation
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = process.env.MONGODB_DB || 'clutch';

async function getTestToken() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const invitationsCollection = db.collection('employee_invitations');
    
    const testInvitation = await invitationsCollection.findOne({
      email: 'test-invitation@example.com'
    });
    
    if (testInvitation) {
      console.log('🔑 TEST INVITATION TOKEN:');
      console.log('='.repeat(40));
      console.log('');
      console.log('📧 Email:', testInvitation.email);
      console.log('📊 Status:', testInvitation.status);
      console.log('⏰ Expires:', testInvitation.expiresAt);
      console.log('');
      console.log('🔗 INVITATION LINK:');
      console.log(`https://admin.yourclutch.com/setup-password?token=${testInvitation.invitationToken}`);
      console.log('');
      console.log('🧪 TEST ENDPOINTS:');
      console.log(`https://clutch-main-nk7x.onrender.com/api/v1/debug/invitation-status/${testInvitation.email}`);
      console.log('https://clutch-main-nk7x.onrender.com/api/v1/debug/jwt-test');
      console.log('');
      console.log('📋 TOKEN (for manual testing):');
      console.log(testInvitation.invitationToken);
    } else {
      console.log('❌ Test invitation not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  getTestToken();
}

module.exports = { getTestToken };
