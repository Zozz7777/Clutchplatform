#!/usr/bin/env node

/**
 * Check Production JWT Secret
 * Verifies if production server is using the correct JWT_SECRET
 */

const jwt = require('jsonwebtoken');

async function checkProductionJWT() {
  console.log('🔍 CHECKING PRODUCTION JWT SECRET');
  console.log('='.repeat(40));
  console.log('');

  // Test with local JWT_SECRET
  const localJWTSecret = 'test_jwt_secret_for_development_only';
  const productionJWTSecret = 'clutch_platform_jwt_secret_2024_super_secure_key_for_production_use_only';

  // Create test token with local secret
  const testToken = jwt.sign(
    { email: 'test@example.com', type: 'employee_invitation' },
    localJWTSecret,
    { expiresIn: '7d' }
  );

  console.log('🧪 TESTING JWT ENDPOINTS');
  console.log('-'.repeat(30));
  console.log('');

  try {
    // Test production JWT endpoint
    const response = await fetch('https://clutch-main-nk7x.onrender.com/api/v1/debug/jwt-test');
    const data = await response.json();

    console.log('📊 Production JWT Test Response:');
    console.log('   Status:', response.status);
    console.log('   Success:', data.success);
    console.log('   Secret Status:', data.secret);
    
    if (data.decoded) {
      console.log('   Decoded Email:', data.decoded.email);
      console.log('   Decoded Type:', data.decoded.type);
    }
    console.log('');

    // Test if our local token works with production
    console.log('🔍 TESTING LOCAL TOKEN WITH PRODUCTION');
    console.log('-'.repeat(30));
    
    const acceptResponse = await fetch('https://clutch-main-nk7x.onrender.com/api/v1/employees/accept-invitation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: testToken,
        password: 'TestPassword123'
      })
    });

    const acceptData = await acceptResponse.text();
    console.log('📊 Accept Invitation Response:');
    console.log('   Status:', acceptResponse.status);
    console.log('   Response:', acceptData);
    console.log('');

    // Analyze the results
    console.log('🎯 ANALYSIS');
    console.log('-'.repeat(30));
    
    if (data.success && data.secret === 'SET') {
      console.log('✅ Production JWT endpoint is working');
      console.log('✅ JWT_SECRET is properly configured');
    } else {
      console.log('❌ Production JWT endpoint has issues');
      console.log('❌ JWT_SECRET may not be properly configured');
    }

    if (acceptResponse.status === 401 && acceptData.includes('INVALID_OR_EXPIRED_TOKEN')) {
      console.log('❌ Local token rejected by production');
      console.log('❌ Production is using different JWT_SECRET');
      console.log('');
      console.log('🔧 SOLUTION:');
      console.log('   The production server needs to be updated with the correct JWT_SECRET');
      console.log('   Current production secret: clutch_platform_jwt_secret_2024_super_secure_key_for_production_use_only');
      console.log('   Required secret: test_jwt_secret_for_development_only');
    } else if (acceptResponse.status === 200) {
      console.log('✅ Local token accepted by production');
      console.log('✅ JWT_SECRET is synchronized');
    } else {
      console.log('⚠️  Unexpected response from production');
      console.log('   Status:', acceptResponse.status);
      console.log('   Response:', acceptData);
    }

  } catch (error) {
    console.log('❌ Error testing production:', error.message);
  }

  console.log('');
  console.log('📋 NEXT STEPS:');
  console.log('1. Verify Render dashboard shows updated JWT_SECRET');
  console.log('2. Check if service has been redeployed');
  console.log('3. Wait for deployment to complete (2-3 minutes)');
  console.log('4. Test again with updated JWT_SECRET');
  console.log('');
  console.log('🔗 RENDER DASHBOARD:');
  console.log('   https://dashboard.render.com');
  console.log('   Service: clutch-main');
  console.log('   Environment tab → JWT_SECRET');
  console.log('');
}

if (require.main === module) {
  checkProductionJWT();
}

module.exports = { checkProductionJWT };
