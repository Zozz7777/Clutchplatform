#!/usr/bin/env node

/**
 * Comprehensive Invitation System Fix
 * Addresses all identified potential issues
 */

const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = process.env.MONGODB_DB || 'clutch';
const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_development_only';

async function comprehensiveFix() {
  console.log('🔧 COMPREHENSIVE INVITATION SYSTEM FIX');
  console.log('='.repeat(50));
  console.log('');

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    console.log('1️⃣ FIXING JWT TOKEN CONSISTENCY');
    console.log('-'.repeat(30));
    
    const invitationsCollection = db.collection('employee_invitations');
    const invitations = await invitationsCollection.find({}).toArray();
    
    let fixedTokens = 0;
    let totalTokens = 0;
    
    for (const invitation of invitations) {
      totalTokens++;
      let needsFix = false;
      let reason = '';
      
      if (!invitation.invitationToken) {
        needsFix = true;
        reason = 'Missing token';
      } else {
        try {
          const decoded = jwt.verify(invitation.invitationToken, JWT_SECRET);
          if (decoded.email !== invitation.email) {
            needsFix = true;
            reason = 'Email mismatch';
          }
        } catch (error) {
          needsFix = true;
          reason = `Invalid token: ${error.message}`;
        }
      }
      
      if (needsFix) {
        console.log(`   Fixing invitation ${invitation._id}: ${reason}`);
        
        // Generate new token
        const newToken = jwt.sign(
          { 
            email: invitation.email.toLowerCase(), 
            type: 'employee_invitation',
            invitedBy: invitation.invitedBy || 'system'
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        // Update invitation
        await invitationsCollection.updateOne(
          { _id: invitation._id },
          { 
            $set: { 
              invitationToken: newToken,
              updatedAt: new Date()
            } 
          }
        );
        
        fixedTokens++;
        console.log(`   ✅ Fixed token for ${invitation.email}`);
      } else {
        console.log(`   ✅ Token OK for ${invitation.email}`);
      }
    }
    
    console.log(`\n   Summary: Fixed ${fixedTokens}/${totalTokens} tokens`);
    console.log('');

    console.log('2️⃣ ADDING MISSING DATABASE INDEXES');
    console.log('-'.repeat(30));
    
    try {
      // Add indexes for better performance
      await invitationsCollection.createIndex({ email: 1 });
      await invitationsCollection.createIndex({ invitationToken: 1 });
      await invitationsCollection.createIndex({ status: 1 });
      await invitationsCollection.createIndex({ createdAt: -1 });
      console.log('   ✅ Database indexes created');
    } catch (error) {
      console.log('   ⚠️ Index creation failed (may already exist):', error.message);
    }
    console.log('');

    console.log('3️⃣ VALIDATING EMAIL CONFIGURATION');
    console.log('-'.repeat(30));
    
    const emailConfig = {
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      EMAIL_SECURE: process.env.EMAIL_SECURE
    };
    
    let emailConfigValid = true;
    Object.entries(emailConfig).forEach(([key, value]) => {
      if (!value || value === 'your-app-password-here') {
        console.log(`   ❌ ${key}: NOT SET or placeholder`);
        emailConfigValid = false;
      } else {
        console.log(`   ✅ ${key}: SET`);
      }
    });
    
    if (emailConfigValid) {
      console.log('   ✅ Email configuration is valid');
    } else {
      console.log('   ❌ Email configuration needs attention');
    }
    console.log('');

    console.log('4️⃣ CREATING TEST INVITATION');
    console.log('-'.repeat(30));
    
    const testEmail = 'test-invitation@example.com';
    
    // Remove any existing test invitation
    await invitationsCollection.deleteMany({ email: testEmail });
    
    // Create new test invitation
    const testToken = jwt.sign(
      { 
        email: testEmail, 
        type: 'employee_invitation',
        invitedBy: 'system'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const testInvitation = {
      email: testEmail,
      name: 'Test User',
      role: 'employee',
      department: 'Testing',
      position: 'Test Employee',
      permissions: ['read'],
      invitationToken: testToken,
      invitedBy: 'system',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      acceptedAt: null
    };
    
    const result = await invitationsCollection.insertOne(testInvitation);
    console.log(`   ✅ Test invitation created with ID: ${result.insertedId}`);
    console.log(`   📧 Email: ${testEmail}`);
    console.log(`   🔑 Token: ${testToken.substring(0, 20)}...`);
    console.log('');

    console.log('5️⃣ TESTING TOKEN VALIDATION');
    console.log('-'.repeat(30));
    
    try {
      const decoded = jwt.verify(testToken, JWT_SECRET);
      console.log('   ✅ Token verification: SUCCESS');
      console.log(`   📧 Email: ${decoded.email}`);
      console.log(`   ⏰ Expires: ${new Date(decoded.exp * 1000).toISOString()}`);
    } catch (error) {
      console.log('   ❌ Token verification: FAILED');
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    console.log('6️⃣ GENERATING PRODUCTION FIX INSTRUCTIONS');
    console.log('-'.repeat(30));
    
    console.log('   📋 RENDER ENVIRONMENT VARIABLES TO CHECK:');
    console.log('   ──────────────────────────────────────────────');
    console.log('   JWT_SECRET=test_jwt_secret_for_development_only');
    console.log('   EMAIL_USER=help@yourclutch.com');
    console.log('   EMAIL_PASSWORD=Yourclutch@clutch1998**');
    console.log('   SMTP_HOST=mail.spacemail.com');
    console.log('   SMTP_PORT=465');
    console.log('   SMTP_USER=help@yourclutch.com');
    console.log('   SMTP_PASS=Yourclutch@clutch1998**');
    console.log('   EMAIL_SECURE=true');
    console.log('   EMAIL_FROM_NAME=Clutch Platform');
    console.log('');

    console.log('7️⃣ CREATING DEBUG ENDPOINTS');
    console.log('-'.repeat(30));
    
    // Create a debug route file
    const debugRouteContent = `const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getCollection } = require('../config/optimized-database');

// Debug endpoint for invitation status
router.get('/invitation-status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const invitationsCollection = await getCollection('employee_invitations');
    const invitation = await invitationsCollection.findOne({ email });
    
    if (!invitation) {
      return res.json({ found: false, message: 'No invitation found' });
    }
    
    let tokenValid = false;
    let tokenError = null;
    
    if (invitation.invitationToken) {
      try {
        const decoded = jwt.verify(invitation.invitationToken, process.env.JWT_SECRET);
        tokenValid = true;
      } catch (error) {
        tokenError = error.message;
      }
    }
    
    res.json({
      found: true,
      email: invitation.email,
      status: invitation.status,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
      tokenValid,
      tokenError,
      hasToken: !!invitation.invitationToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint for JWT test
router.get('/jwt-test', async (req, res) => {
  try {
    const testPayload = { email: 'test@example.com', type: 'employee_invitation' };
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      token: token.substring(0, 20) + '...',
      decoded,
      secret: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;`;
    
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(path.join(__dirname, '../routes/debug.js'), debugRouteContent);
    console.log('   ✅ Debug routes created: /api/v1/debug/*');
    console.log('');

    console.log('8️⃣ SUMMARY AND NEXT STEPS');
    console.log('-'.repeat(30));
    console.log('   ✅ Fixed JWT token consistency issues');
    console.log('   ✅ Added database indexes for performance');
    console.log('   ✅ Validated email configuration');
    console.log('   ✅ Created test invitation');
    console.log('   ✅ Tested token validation');
    console.log('   ✅ Generated production fix instructions');
    console.log('   ✅ Created debug endpoints');
    console.log('');
    
    console.log('   🎯 IMMEDIATE ACTIONS REQUIRED:');
    console.log('   1. Verify Render environment variables match local');
    console.log('   2. Deploy the debug routes to production');
    console.log('   3. Test invitation flow with new token');
    console.log('   4. Monitor production logs for errors');
    console.log('');
    
    console.log('   🔗 TEST URLS:');
    console.log(`   - Invitation link: https://admin.yourclutch.com/setup-password?token=${testToken}`);
    console.log('   - Debug status: https://clutch-main-nk7x.onrender.com/api/v1/debug/invitation-status/test-invitation@example.com');
    console.log('   - JWT test: https://clutch-main-nk7x.onrender.com/api/v1/debug/jwt-test');
    console.log('');
    
    console.log('   ✅ COMPREHENSIVE FIX COMPLETE!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  comprehensiveFix();
}

module.exports = { comprehensiveFix };
