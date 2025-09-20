#!/usr/bin/env node

/**
 * Test Production Deployment
 * Check if production has the latest code changes
 */

async function testProductionDeployment() {
  console.log('🧪 TESTING PRODUCTION DEPLOYMENT');
  console.log('='.repeat(40));
  console.log('');

  try {
    // Test 1: Check if debug endpoints exist (recently added)
    console.log('1️⃣ DEBUG ENDPOINTS TEST');
    console.log('-'.repeat(30));
    
    const jwtTestResponse = await fetch('https://clutch-main-nk7x.onrender.com/api/v1/debug/jwt-test');
    const jwtTestData = await jwtTestResponse.json();
    
    console.log('📊 JWT Test Endpoint:');
    console.log('   Status:', jwtTestResponse.status);
    console.log('   Success:', jwtTestData.success);
    console.log('   Secret:', jwtTestData.secret);
    console.log('');

    // Test 2: Check invitation status endpoint
    console.log('2️⃣ INVITATION STATUS ENDPOINT');
    console.log('-'.repeat(30));
    
    const statusResponse = await fetch('https://clutch-main-nk7x.onrender.com/api/v1/debug/invitation-status/test-invitation@example.com');
    const statusData = await statusResponse.json();
    
    console.log('📊 Invitation Status Endpoint:');
    console.log('   Status:', statusResponse.status);
    console.log('   Found:', statusData.found);
    console.log('   Token Valid:', statusData.tokenValid);
    console.log('');

    // Test 3: Check if the accept-invitation endpoint has the latest logic
    console.log('3️⃣ ACCEPT INVITATION ENDPOINT TEST');
    console.log('-'.repeat(30));
    
    // Use the token that we know exists in the database
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QtaW52aXRhdGlvbkBleGFtcGxlLmNvbSIsInR5cGUiOiJlbXBsb3llZV9pbnZpdGF0aW9uIiwiaW52aXRlZEJ5Ijoic3lzdGVtIiwiaWF0IjoxNzU4Mzg5MTQ3LCJleHAiOjE3NTg5OTM5NDd9.ysiKJoVwnGxRLdog51crk4O0oW0BC4AzqHt557dHqGs';
    
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

    // Test 4: Check server response headers for deployment info
    console.log('4️⃣ SERVER RESPONSE HEADERS');
    console.log('-'.repeat(30));
    
    const headers = Object.fromEntries(acceptResponse.headers.entries());
    console.log('📊 Important Headers:');
    console.log('   Server:', headers.server);
    console.log('   X-Powered-By:', headers['x-powered-by']);
    console.log('   X-Render-Origin-Server:', headers['x-render-origin-server']);
    console.log('   Date:', headers.date);
    console.log('');

    // Analysis
    console.log('5️⃣ DEPLOYMENT ANALYSIS');
    console.log('-'.repeat(30));
    
    if (jwtTestResponse.status === 200 && statusResponse.status === 200) {
      console.log('✅ Debug endpoints are working');
      console.log('✅ Production has the latest code changes');
      console.log('✅ Database connection is working');
    } else {
      console.log('❌ Debug endpoints not working');
      console.log('❌ Production may not have latest code');
    }

    if (acceptResponse.status === 400 && acceptData.includes('INVALID_OR_EXPIRED_TOKEN')) {
      console.log('❌ Accept invitation still failing');
      console.log('❌ Issue is in the accept-invitation logic');
      console.log('');
      console.log('🎯 POSSIBLE ISSUES:');
      console.log('   1. The accept-invitation endpoint logic has a bug');
      console.log('   2. The token lookup logic is not working correctly');
      console.log('   3. There might be a race condition or timing issue');
      console.log('   4. The database query in accept-invitation might be different');
    }

    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('   1. Check the accept-invitation endpoint code');
    console.log('   2. Add more detailed logging to the endpoint');
    console.log('   3. Test with a fresh invitation created in production');
    console.log('   4. Check production logs for specific errors');
    console.log('');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

if (require.main === module) {
  testProductionDeployment();
}

module.exports = { testProductionDeployment };
