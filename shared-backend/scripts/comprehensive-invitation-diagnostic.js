#!/usr/bin/env node

/**
 * Comprehensive Invitation System Diagnostic
 * Deep dive analysis of all potential failure points
 */

const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = process.env.MONGODB_DB || 'clutch';
const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_development_only';

async function comprehensiveDiagnostic() {
  console.log('🔍 COMPREHENSIVE INVITATION SYSTEM DIAGNOSTIC');
  console.log('='.repeat(60));
  console.log('');

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    // 1. DATABASE CONNECTION TEST
    console.log('1️⃣ DATABASE CONNECTION TEST');
    console.log('-'.repeat(30));
    try {
      await db.admin().ping();
      console.log('✅ Database connection: SUCCESS');
    } catch (error) {
      console.log('❌ Database connection: FAILED');
      console.log('   Error:', error.message);
      return;
    }
    console.log('');

    // 2. COLLECTION ACCESS TEST
    console.log('2️⃣ COLLECTION ACCESS TEST');
    console.log('-'.repeat(30));
    const collections = ['employee_invitations', 'users', 'sessions'];
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`✅ Collection '${collectionName}': ACCESSIBLE (${count} documents)`);
      } catch (error) {
        console.log(`❌ Collection '${collectionName}': FAILED`);
        console.log(`   Error: ${error.message}`);
      }
    }
    console.log('');

    // 3. JWT SECRET CONSISTENCY TEST
    console.log('3️⃣ JWT SECRET CONSISTENCY TEST');
    console.log('-'.repeat(30));
    console.log(`Local JWT_SECRET: ${JWT_SECRET.substring(0, 20)}...`);
    
    // Test token generation and verification
    const testPayload = { email: 'test@example.com', type: 'employee_invitation' };
    try {
      const testToken = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '7d' });
      const decoded = jwt.verify(testToken, JWT_SECRET);
      console.log('✅ JWT token generation/verification: SUCCESS');
      console.log(`   Token expires: ${new Date(decoded.exp * 1000).toISOString()}`);
    } catch (error) {
      console.log('❌ JWT token generation/verification: FAILED');
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // 4. EXISTING INVITATIONS ANALYSIS
    console.log('4️⃣ EXISTING INVITATIONS ANALYSIS');
    console.log('-'.repeat(30));
    const invitationsCollection = db.collection('employee_invitations');
    const invitations = await invitationsCollection.find({}).toArray();
    
    console.log(`Total invitations found: ${invitations.length}`);
    
    if (invitations.length > 0) {
      const statusCounts = {};
      const tokenIssues = [];
      
      for (const invitation of invitations) {
        // Count by status
        statusCounts[invitation.status] = (statusCounts[invitation.status] || 0) + 1;
        
        // Check token validity
        if (invitation.invitationToken) {
          try {
            const decoded = jwt.verify(invitation.invitationToken, JWT_SECRET);
            if (decoded.email !== invitation.email) {
              tokenIssues.push({
                id: invitation._id,
                issue: 'Email mismatch',
                tokenEmail: decoded.email,
                dbEmail: invitation.email
              });
            }
          } catch (error) {
            tokenIssues.push({
              id: invitation._id,
              issue: 'Invalid token',
              error: error.message
            });
          }
        } else {
          tokenIssues.push({
            id: invitation._id,
            issue: 'Missing token'
          });
        }
      }
      
      console.log('Status breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
      
      if (tokenIssues.length > 0) {
        console.log(`\n❌ Token issues found: ${tokenIssues.length}`);
        tokenIssues.forEach(issue => {
          console.log(`   - ${issue.id}: ${issue.issue}`);
        });
      } else {
        console.log('✅ All invitation tokens are valid');
      }
    }
    console.log('');

    // 5. EMAIL CONFIGURATION TEST
    console.log('5️⃣ EMAIL CONFIGURATION TEST');
    console.log('-'.repeat(30));
    const emailConfig = {
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '***SET***' : 'NOT SET',
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS ? '***SET***' : 'NOT SET',
      EMAIL_SECURE: process.env.EMAIL_SECURE,
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? '***SET***' : 'NOT SET'
    };
    
    Object.entries(emailConfig).forEach(([key, value]) => {
      const status = value === 'NOT SET' ? '❌' : '✅';
      console.log(`${status} ${key}: ${value}`);
    });
    console.log('');

    // 6. ENVIRONMENT VARIABLES TEST
    console.log('6️⃣ ENVIRONMENT VARIABLES TEST');
    console.log('-'.repeat(30));
    const requiredVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'EMAIL_USER',
      'EMAIL_PASSWORD',
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USER',
      'SMTP_PASS'
    ];
    
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      const status = value ? '✅' : '❌';
      const displayValue = value ? (varName.includes('PASSWORD') || varName.includes('SECRET') ? '***SET***' : value) : 'NOT SET';
      console.log(`${status} ${varName}: ${displayValue}`);
    });
    console.log('');

    // 7. RECENT INVITATION TEST
    console.log('7️⃣ RECENT INVITATION TEST');
    console.log('-'.repeat(30));
    const recentInvitations = await invitationsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();
    
    if (recentInvitations.length > 0) {
      console.log('Recent invitations:');
      recentInvitations.forEach((inv, index) => {
        console.log(`   ${index + 1}. ${inv.email} (${inv.status}) - ${inv.createdAt}`);
        if (inv.invitationToken) {
          try {
            const decoded = jwt.verify(inv.invitationToken, JWT_SECRET);
            const expiresAt = new Date(decoded.exp * 1000);
            const isExpired = expiresAt < new Date();
            console.log(`      Token expires: ${expiresAt.toISOString()} ${isExpired ? '(EXPIRED)' : '(VALID)'}`);
          } catch (error) {
            console.log(`      Token: INVALID (${error.message})`);
          }
        }
      });
    } else {
      console.log('No invitations found in database');
    }
    console.log('');

    // 8. RECOMMENDATIONS
    console.log('8️⃣ RECOMMENDATIONS');
    console.log('-'.repeat(30));
    
    const issues = [];
    
    // Check for common issues
    if (typeof tokenIssues !== 'undefined' && tokenIssues.length > 0) {
      issues.push('Fix invalid invitation tokens');
    }
    
    if (!process.env.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD === 'your-app-password-here') {
      issues.push('Configure email password');
    }
    
    if (!process.env.SMTP_PASS || process.env.SMTP_PASS === 'your-app-password-here') {
      issues.push('Configure SMTP password');
    }
    
    if (invitations.length === 0) {
      issues.push('Create test invitation');
    }
    
    if (issues.length === 0) {
      console.log('✅ No critical issues found');
      console.log('✅ System appears to be properly configured');
    } else {
      console.log('❌ Issues found:');
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('1. Fix any issues identified above');
    console.log('2. Test invitation creation');
    console.log('3. Test invitation acceptance');
    console.log('4. Monitor email delivery');
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  comprehensiveDiagnostic();
}

module.exports = { comprehensiveDiagnostic };
