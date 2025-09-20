#!/usr/bin/env node

/**
 * Diagnose JWT Issue Script
 * Helps identify JWT secret mismatch between local and production
 */

const jwt = require('jsonwebtoken');

console.log('🔍 JWT TOKEN DIAGNOSIS');
console.log('='.repeat(50));
console.log('');

// Original token from the URL
const originalToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZ1c2lvbmVneUBnbWFpbC5jb20iLCJ0eXBlIjoiZW1wbG95ZWVfaW52aXRhdGlvbiIsImludml0ZWRCeSI6InN5c3RlbSIsImlhdCI6MTc1ODM3MDMwNywiZXhwIjoxNzU4OTc1MTA3fQ.zhgVaylCP_4v1hd0-nNtow7fJ0vCPq-RXiCnGZ_IFGI';

// New token we just created
const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZ1c2lvbmVneUBnbWFpbC5jb20iLCJ0eXBlIjoiZW1wbG95ZWVfaW52aXRhdGlvbiIsImludml0ZWRCeSI6InN5c3RlbSIsImlhdCI6MTc1ODM3NTU4MywiZXhwIjoxNzU4OTgwMzgzfQ.8QgcqVEGHefL3Fy8QerShIWsZsONEuJ3uHJhJO6hLRc';

// Local JWT secret
const localJWTSecret = 'test_jwt_secret_for_development_only';

console.log('📋 TOKEN ANALYSIS:');
console.log('');

// Decode both tokens (without verification)
const originalPayload = JSON.parse(Buffer.from(originalToken.split('.')[1], 'base64').toString());
const newPayload = JSON.parse(Buffer.from(newToken.split('.')[1], 'base64').toString());

console.log('Original Token Payload:');
console.log(JSON.stringify(originalPayload, null, 2));
console.log('');

console.log('New Token Payload:');
console.log(JSON.stringify(newPayload, null, 2));
console.log('');

// Test verification with local secret
console.log('🔐 VERIFICATION TESTS:');
console.log('');

try {
  const decodedOriginal = jwt.verify(originalToken, localJWTSecret);
  console.log('✅ Original token verifies with LOCAL secret');
} catch (error) {
  console.log('❌ Original token FAILS with LOCAL secret:', error.message);
}

try {
  const decodedNew = jwt.verify(newToken, localJWTSecret);
  console.log('✅ New token verifies with LOCAL secret');
} catch (error) {
  console.log('❌ New token FAILS with LOCAL secret:', error.message);
}

console.log('');
console.log('🎯 ROOT CAUSE ANALYSIS:');
console.log('');

if (originalPayload.iat !== newPayload.iat) {
  console.log('• The original token was created at a different time');
  console.log('• This suggests it was created with a different JWT secret');
  console.log('• The production server likely has a different JWT_SECRET');
}

console.log('');
console.log('💡 SOLUTIONS:');
console.log('');

console.log('1. UPDATE PRODUCTION JWT_SECRET:');
console.log('   - Go to Render Dashboard → Environment Variables');
console.log('   - Set JWT_SECRET to: test_jwt_secret_for_development_only');
console.log('   - This will make production use the same secret as local');
console.log('');

console.log('2. CREATE NEW INVITATION WITH PRODUCTION SECRET:');
console.log('   - If you know the production JWT_SECRET, use it to create a new token');
console.log('   - Or update the production secret to match local');
console.log('');

console.log('3. USE THE NEW TOKEN:');
console.log('   - The new token we created should work once JWT secrets match');
console.log('   - New invitation URL:');
console.log(`     https://admin.yourclutch.com/setup-password?token=${newToken}`);
console.log('');

console.log('⚠️  IMPORTANT:');
console.log('• JWT secrets must match between local and production');
console.log('• Changing JWT_SECRET will invalidate all existing tokens');
console.log('• Make sure to coordinate this change with your team');
console.log('');

console.log('🚀 RECOMMENDED ACTION:');
console.log('Update the production JWT_SECRET to match the local environment');
console.log('This will resolve the token validation issue immediately');
