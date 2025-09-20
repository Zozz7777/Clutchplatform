#!/usr/bin/env node

/**
 * Test Production Authentication
 * This script tests the production environment authentication directly
 */

// Load environment variables first
require('dotenv').config();

const jwt = require('jsonwebtoken');

async function testProductionAuth() {
  console.log('🔐 Testing Production Authentication...\n');

  const productionURL = 'https://clutch-main-nk7x.onrender.com';
  
  try {
    // Test 1: Check if production server is responding
    console.log('1. Testing production server connectivity...');
    
    try {
      const healthResponse = await fetch(`${productionURL}/ping`);
      const healthStatus = healthResponse.status;
      
      if (healthStatus === 200) {
        console.log('✅ Production server is responding');
        const healthData = await healthResponse.json();
        console.log(`   Server status: ${healthData.data?.status || 'unknown'}`);
      } else {
        console.log(`❌ Production server health check failed: ${healthStatus}`);
      }
    } catch (error) {
      console.log(`❌ Production server connectivity failed: ${error.message}`);
      return;
    }

    // Test 2: Generate test token with production JWT secret
    console.log('\n2. Testing JWT token generation...');
    
    const testPayload = {
      userId: 'test-user-123',
      email: 'test@example.com',
      role: 'admin',
      type: 'employee'
    };
    
    // Use the same JWT secret that should be in production
    const jwtSecret = process.env.JWT_SECRET || 'clutch_platform_jwt_secret_2024_super_secure_key_for_production_use_only';
    const token = jwt.sign(testPayload, jwtSecret, { expiresIn: '1h' });
    
    console.log('✅ Test token generated');
    console.log(`   JWT Secret length: ${jwtSecret.length}`);
    console.log(`   Token preview: ${token.substring(0, 50)}...`);

    // Test 3: Test protected endpoints with token
    console.log('\n3. Testing protected endpoints with authentication...');
    
    const endpoints = [
      '/api/v1/dashboard/kpis',
      '/api/v1/fleet/vehicles',
      '/api/v1/system/performance',
      '/api/v1/notifications',
      '/api/v1/users',
      '/api/v1/finance/payments',
      '/api/v1/revenue/metrics',
      '/api/v1/customers',
      '/api/v1/sessions/active',
      '/api/v1/compliance/status'
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${productionURL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        const status = response.status;
        const isSuccess = status === 200 || status === 201;
        
        results.push({
          endpoint,
          status,
          success: isSuccess,
          message: isSuccess ? '✅ Working' : `❌ Failed (${status})`
        });
        
        console.log(`   ${endpoint}: ${isSuccess ? '✅' : '❌'} (${status})`);
        
        // If it's a 401, try to get more details
        if (status === 401) {
          try {
            const errorData = await response.json();
            console.log(`     Error details: ${errorData.error || errorData.message || 'No details'}`);
          } catch (e) {
            console.log(`     Error details: Could not parse error response`);
          }
        }
        
      } catch (error) {
        results.push({
          endpoint,
          status: 'ERROR',
          success: false,
          message: `❌ Error: ${error.message}`
        });
        console.log(`   ${endpoint}: ❌ Error: ${error.message}`);
      }
    }

    // Test 4: Test without token (should fail)
    console.log('\n4. Testing endpoints without token (should fail)...');
    
    try {
      const response = await fetch(`${productionURL}/api/v1/dashboard/kpis`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const status = response.status;
      const isUnauthorized = status === 401;
      
      console.log(`   /api/v1/dashboard/kpis (no token): ${isUnauthorized ? '✅' : '❌'} (${status})`);
      
      if (!isUnauthorized) {
        console.log('   ⚠️  WARNING: Endpoint should require authentication!');
      }
      
    } catch (error) {
      console.log(`   /api/v1/dashboard/kpis (no token): ❌ Error: ${error.message}`);
    }

    // Test 5: Test login endpoint
    console.log('\n5. Testing login endpoint...');
    
    try {
      const loginResponse = await fetch(`${productionURL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword'
        })
      });
      
      const loginStatus = loginResponse.status;
      console.log(`   /api/v1/auth/login: Status ${loginStatus}`);
      
      if (loginStatus === 200) {
        console.log('   ✅ Login endpoint is working');
      } else if (loginStatus === 401) {
        console.log('   ✅ Login endpoint correctly rejects invalid credentials');
      } else {
        console.log(`   ⚠️  Login endpoint returned unexpected status: ${loginStatus}`);
      }
      
    } catch (error) {
      console.log(`   /api/v1/auth/login: ❌ Error: ${error.message}`);
    }

    // Summary
    console.log('\n📊 Production Test Summary:');
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`   Total endpoints tested: ${totalCount}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Failed: ${totalCount - successCount}`);
    console.log(`   Success rate: ${Math.round((successCount / totalCount) * 100)}%`);
    
    if (successCount === totalCount) {
      console.log('\n🎉 All production endpoints are working correctly!');
    } else {
      console.log('\n⚠️  Some production endpoints need attention.');
      console.log('\n🔍 Possible issues:');
      console.log('   1. Deployment may not have completed yet');
      console.log('   2. JWT secrets may not match between local and production');
      console.log('   3. Environment variables may not be set correctly in production');
      console.log('   4. Frontend may not be sending tokens correctly');
    }

  } catch (error) {
    console.error('❌ Production test failed:', error.message);
  }
}

// Run the test
testProductionAuth();
