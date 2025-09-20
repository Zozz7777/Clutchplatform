#!/usr/bin/env node

/**
 * Test API Endpoints Authentication
 * This script tests the API endpoints to ensure authentication is working
 */

// Load environment variables first
require('dotenv').config();

const jwt = require('jsonwebtoken');

async function testAPIEndpoints() {
  console.log('🔐 Testing API Endpoints Authentication...\n');

  try {
    // Test 1: Generate a test token
    console.log('1. Generating test JWT token...');
    const testPayload = {
      userId: 'test-user-123',
      email: 'test@example.com',
      role: 'admin',
      type: 'employee'
    };
    
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ Test token generated');
    console.log(`   Token preview: ${token.substring(0, 50)}...\n`);

    // Test 2: Test protected endpoints
    console.log('2. Testing protected endpoints...');
    
    const baseURL = process.env.PLATFORM_API_URL || 'http://localhost:5000';
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
      '/api/v1/compliance/status',
      '/api/v1/hr/employees',
      '/api/v1/hr/applications',
      '/api/v1/employees/invitations',
      '/api/v1/hr/stats'
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
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

    // Test 3: Test without token (should fail)
    console.log('\n3. Testing endpoints without token (should fail)...');
    
    try {
      const response = await fetch(`${baseURL}/api/v1/dashboard/kpis`, {
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

    // Summary
    console.log('\n📊 Test Summary:');
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`   Total endpoints tested: ${totalCount}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Failed: ${totalCount - successCount}`);
    console.log(`   Success rate: ${Math.round((successCount / totalCount) * 100)}%`);
    
    if (successCount === totalCount) {
      console.log('\n🎉 All endpoints are working correctly!');
    } else {
      console.log('\n⚠️  Some endpoints need attention.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAPIEndpoints();
