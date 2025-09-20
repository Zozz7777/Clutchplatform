#!/usr/bin/env node

/**
 * Compare Production Database
 * Check if production database has the same invitation data
 */

async function compareProductionDatabase() {
  console.log('🔍 COMPARING PRODUCTION DATABASE');
  console.log('='.repeat(40));
  console.log('');

  try {
    // Test production invitation status endpoint
    console.log('1️⃣ PRODUCTION INVITATION STATUS');
    console.log('-'.repeat(30));
    
    const statusResponse = await fetch('https://clutch-main-nk7x.onrender.com/api/v1/debug/invitation-status/test-invitation@example.com');
    const statusData = await statusResponse.json();
    
    console.log('📊 Production Status Response:');
    console.log('   Status:', statusResponse.status);
    console.log('   Found:', statusData.found);
    console.log('   Email:', statusData.email);
    console.log('   Status:', statusData.status);
    console.log('   Token Valid:', statusData.tokenValid);
    console.log('   Token Error:', statusData.tokenError);
    console.log('   Has Token:', statusData.hasToken);
    console.log('');

    // Test with a different approach - try to get the actual token from production
    console.log('2️⃣ PRODUCTION TOKEN ANALYSIS');
    console.log('-'.repeat(30));
    
    if (statusData.found && statusData.hasToken) {
      console.log('✅ Production has invitation with token');
      console.log('✅ Token is valid:', statusData.tokenValid);
      
      if (statusData.tokenError) {
        console.log('❌ Token error:', statusData.tokenError);
      }
    } else {
      console.log('❌ Production invitation not found or missing token');
    }
    console.log('');

    // Test the exact same token that works locally
    console.log('3️⃣ TESTING LOCAL TOKEN ON PRODUCTION');
    console.log('-'.repeat(30));
    
    const localToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QtaW52aXRhdGlvbkBleGFtcGxlLmNvbSIsInR5cGUiOiJlbXBsb3llZV9pbnZpdGF0aW9uIiwiaW52aXRlZEJ5Ijoic3lzdGVtIiwiaWF0IjoxNzU4Mzg5MTQ3LCJleHAiOjE3NTg5OTM5NDd9.ysiKJoVwnGxRLdog51crk4O0oW0BC4AzqHt557dHqGs';
    
    const acceptResponse = await fetch('https://clutch-main-nk7x.onrender.com/api/v1/employees/accept-invitation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: localToken,
        password: 'TestPassword123'
      })
    });

    const acceptData = await acceptResponse.text();
    console.log('📊 Accept Invitation Response:');
    console.log('   Status:', acceptResponse.status);
    console.log('   Response:', acceptData);
    console.log('');

    // Analyze the issue
    console.log('4️⃣ ISSUE ANALYSIS');
    console.log('-'.repeat(30));
    
    if (statusData.found && statusData.tokenValid) {
      console.log('✅ Production database has valid invitation');
      console.log('✅ Production token is valid');
      console.log('❌ But accept-invitation still fails');
      console.log('');
      console.log('🎯 POSSIBLE CAUSES:');
      console.log('   1. Production server not fully redeployed');
      console.log('   2. Caching issue in production');
      console.log('   3. Different database connection in production');
      console.log('   4. Code not updated in production');
    } else {
      console.log('❌ Production database issue detected');
      console.log('   The production database may not have the invitation');
      console.log('   or the token is invalid in production');
    }
    console.log('');

    console.log('5️⃣ RECOMMENDATIONS');
    console.log('-'.repeat(30));
    console.log('🔧 IMMEDIATE ACTIONS:');
    console.log('   1. Check Render deployment status');
    console.log('   2. Verify all code changes are deployed');
    console.log('   3. Check production logs for errors');
    console.log('   4. Try creating a new invitation in production');
    console.log('');
    console.log('🔗 RENDER DASHBOARD:');
    console.log('   https://dashboard.render.com');
    console.log('   Service: clutch-main');
    console.log('   Check deployment logs and status');
    console.log('');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

if (require.main === module) {
  compareProductionDatabase();
}

module.exports = { compareProductionDatabase };
