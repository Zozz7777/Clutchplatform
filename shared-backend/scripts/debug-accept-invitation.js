#!/usr/bin/env node

/**
 * Debug Accept Invitation
 * Detailed debugging of the accept-invitation endpoint
 */

const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = process.env.MONGODB_DB || 'clutch';
const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_development_only';

async function debugAcceptInvitation() {
  console.log('🔍 DEBUGGING ACCEPT INVITATION');
  console.log('='.repeat(40));
  console.log('');

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const invitationsCollection = db.collection('employee_invitations');
    
    // Test token - using the actual token from the URL
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZ1c2lvbmVneUBnbWFpbC5jb20iLCJ0eXBlIjoiZW1wbG95ZWVfaW52aXRhdGlvbiIsImludml0ZWRCeSI6InN5c3RlbSIsImlhdCI6MTc1ODQxMDU3MSwiZXhwIjoxNzU5MDE1MzcxfQ.afj2wuIjRgQWA-BZItWGlheoL1lyR1C5rXuchwHCzW4';
    
    console.log('1️⃣ TOKEN VERIFICATION');
    console.log('-'.repeat(30));
    
    let decoded;
    try {
      decoded = jwt.verify(testToken, JWT_SECRET);
      console.log('✅ Token verification: SUCCESS');
      console.log('📧 Email:', decoded.email);
      console.log('📊 Type:', decoded.type);
      console.log('⏰ Expires:', new Date(decoded.exp * 1000).toISOString());
    } catch (error) {
      console.log('❌ Token verification: FAILED');
      console.log('Error:', error.message);
      return;
    }
    console.log('');

    console.log('2️⃣ DATABASE LOOKUP');
    console.log('-'.repeat(30));
    
    // Method 1: Find by token
    console.log('🔍 Method 1: Find by invitationToken');
    const invitationByToken = await invitationsCollection.findOne({
      invitationToken: testToken,
      status: 'pending'
    });
    
    if (invitationByToken) {
      console.log('✅ Found invitation by token');
      console.log('📧 Email:', invitationByToken.email);
      console.log('📊 Status:', invitationByToken.status);
      console.log('⏰ Created:', invitationByToken.createdAt);
    } else {
      console.log('❌ No invitation found by token');
    }
    console.log('');

    // Method 2: Find by email
    console.log('🔍 Method 2: Find by email');
    const invitationsByEmail = await invitationsCollection.find({
      email: decoded.email.toLowerCase(),
      status: 'pending'
    }).toArray();
    
    console.log(`📊 Found ${invitationsByEmail.length} invitations for email: ${decoded.email}`);
    
    invitationsByEmail.forEach((inv, index) => {
      console.log(`   ${index + 1}. ID: ${inv._id}`);
      console.log(`      Status: ${inv.status}`);
      console.log(`      Token: ${inv.invitationToken ? inv.invitationToken.substring(0, 30) + '...' : 'MISSING'}`);
      console.log(`      Token Match: ${inv.invitationToken === testToken ? 'YES' : 'NO'}`);
      console.log(`      Created: ${inv.createdAt}`);
    });
    console.log('');

    // Method 3: Check all invitations
    console.log('🔍 Method 3: All invitations in database');
    const allInvitations = await invitationsCollection.find({}).toArray();
    console.log(`📊 Total invitations in database: ${allInvitations.length}`);
    
    allInvitations.forEach((inv, index) => {
      console.log(`   ${index + 1}. Email: ${inv.email}`);
      console.log(`      Status: ${inv.status}`);
      console.log(`      Has Token: ${inv.invitationToken ? 'YES' : 'NO'}`);
      console.log(`      Token Match: ${inv.invitationToken === testToken ? 'YES' : 'NO'}`);
    });
    console.log('');

    console.log('3️⃣ TOKEN COMPARISON');
    console.log('-'.repeat(30));
    
    if (invitationsByEmail.length > 0) {
      const dbToken = invitationsByEmail[0].invitationToken;
      console.log('🔍 Comparing tokens:');
      console.log('   Test Token:', testToken.substring(0, 50) + '...');
      console.log('   DB Token:  ', dbToken ? dbToken.substring(0, 50) + '...' : 'MISSING');
      console.log('   Match:     ', testToken === dbToken ? 'YES' : 'NO');
      
      if (testToken !== dbToken) {
        console.log('');
        console.log('❌ TOKEN MISMATCH DETECTED!');
        console.log('   The token in the database is different from the test token');
        console.log('   This explains why the invitation lookup fails');
        console.log('');
        console.log('🔧 SOLUTION:');
        console.log('   Update the database token to match the test token');
      }
    }
    console.log('');

    console.log('4️⃣ RECOMMENDATIONS');
    console.log('-'.repeat(30));
    
    if (!invitationByToken && invitationsByEmail.length > 0) {
      console.log('🎯 ISSUE IDENTIFIED:');
      console.log('   Invitation exists in database but with different token');
      console.log('   The accept-invitation endpoint looks for exact token match');
      console.log('');
      console.log('🔧 FIX:');
      console.log('   Update the database invitation with the correct token');
    } else if (!invitationByToken && invitationsByEmail.length === 0) {
      console.log('🎯 ISSUE IDENTIFIED:');
      console.log('   No invitation found for the email in the database');
      console.log('   The invitation may have been deleted or never created');
      console.log('');
      console.log('🔧 FIX:');
      console.log('   Create a new invitation for the test email');
    } else {
      console.log('✅ No issues found with database lookup');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  debugAcceptInvitation();
}

module.exports = { debugAcceptInvitation };
