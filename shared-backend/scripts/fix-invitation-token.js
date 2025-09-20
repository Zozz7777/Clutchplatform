#!/usr/bin/env node

/**
 * Fix Invitation Token Script
 * Creates a new invitation with a properly signed JWT token
 */

const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = process.env.MONGODB_DB || 'clutch';
const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_development_only';

async function fixInvitationToken() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    const email = 'fusionegy@gmail.com';
    
    // Remove existing invitation
    await db.collection('employee_invitations').deleteMany({ email });
    console.log('✅ Removed existing invitation for:', email);
    
    // Generate new invitation token
    const invitationToken = jwt.sign(
      { 
        email: email.toLowerCase(), 
        type: 'employee_invitation',
        invitedBy: 'system'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Generated new invitation token');
    console.log('Token:', invitationToken);
    
    // Create new invitation
    const invitation = {
      email: email.toLowerCase(),
      name: 'Fusion Egypt',
      role: 'employee',
      department: 'General',
      position: 'Employee',
      permissions: ['read'],
      invitationToken,
      invitedBy: 'system',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
      acceptedAt: null
    };
    
    const result = await db.collection('employee_invitations').insertOne(invitation);
    console.log('✅ Created new invitation with ID:', result.insertedId);
    
    // Verify the invitation
    const createdInvitation = await db.collection('employee_invitations').findOne({ email });
    console.log('✅ Verification - Invitation created:', !!createdInvitation);
    
    // Test token verification
    try {
      const decoded = jwt.verify(invitationToken, JWT_SECRET);
      console.log('✅ Token verification successful:', decoded);
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Update the invitation link in the email to use the new token');
    console.log('2. The new invitation URL should be:');
    console.log(`   https://admin.yourclutch.com/setup-password?token=${invitationToken}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  fixInvitationToken();
}

module.exports = { fixInvitationToken };
