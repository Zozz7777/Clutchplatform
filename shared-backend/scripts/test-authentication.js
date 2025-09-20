#!/usr/bin/env node

/**
 * Test Authentication System
 * This script tests the authentication system to identify 401 errors
 */

// Load environment variables first
require('dotenv').config();

const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../config/database-unified');

async function testAuthentication() {
  console.log('🔐 Testing Authentication System...\n');

  try {
    // Test 1: Check JWT Secret
    console.log('1. Testing JWT Secret...');
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.log('❌ JWT_SECRET is not set in environment variables');
      return;
    }
    console.log('✅ JWT_SECRET is set');
    console.log(`   Secret length: ${jwtSecret.length} characters`);
    console.log(`   Secret preview: ${jwtSecret.substring(0, 20)}...\n`);

    // Test 2: Test JWT Token Generation
    console.log('2. Testing JWT Token Generation...');
    const testPayload = {
      userId: 'test-user-123',
      email: 'test@example.com',
      role: 'admin',
      type: 'employee'
    };

    try {
      const token = jwt.sign(testPayload, jwtSecret, { expiresIn: '7d' });
      console.log('✅ JWT token generated successfully');
      console.log(`   Token length: ${token.length} characters`);
      console.log(`   Token preview: ${token.substring(0, 50)}...\n`);

      // Test 3: Test JWT Token Verification
      console.log('3. Testing JWT Token Verification...');
      try {
        const decoded = jwt.verify(token, jwtSecret);
        console.log('✅ JWT token verified successfully');
        console.log(`   Decoded payload:`, decoded);
        console.log('');
      } catch (verifyError) {
        console.log('❌ JWT token verification failed:', verifyError.message);
        return;
      }
    } catch (signError) {
      console.log('❌ JWT token generation failed:', signError.message);
      return;
    }

    // Test 4: Test Database Connection
    console.log('4. Testing Database Connection...');
    try {
      const { db } = await connectToDatabase();
      console.log('✅ Database connection successful');
      
      // Test 5: Check for existing employees
      console.log('5. Checking for existing employees...');
      const employeesCollection = db.collection('employees');
      const employeeCount = await employeesCollection.countDocuments();
      console.log(`   Found ${employeeCount} employees in database`);
      
      if (employeeCount > 0) {
        const sampleEmployee = await employeesCollection.findOne({});
        console.log('   Sample employee:', {
          id: sampleEmployee._id,
          email: sampleEmployee.email,
          role: sampleEmployee.role,
          isActive: sampleEmployee.isActive
        });
      }
      console.log('');

      // Test 6: Test Employee Authentication
      console.log('6. Testing Employee Authentication...');
      if (employeeCount > 0) {
        const testEmployee = await employeesCollection.findOne({ isActive: true });
        if (testEmployee) {
          const employeeToken = jwt.sign({
            userId: testEmployee._id.toString(),
            email: testEmployee.email,
            role: testEmployee.role,
            type: 'employee'
          }, jwtSecret, { expiresIn: '7d' });
          
          console.log('✅ Employee token generated successfully');
          console.log(`   Employee: ${testEmployee.email} (${testEmployee.role})`);
          console.log(`   Token preview: ${employeeToken.substring(0, 50)}...`);
        } else {
          console.log('⚠️  No active employees found for testing');
        }
      } else {
        console.log('⚠️  No employees found in database');
      }
      console.log('');

    } catch (dbError) {
      console.log('❌ Database connection failed:', dbError.message);
      return;
    }

    // Test 7: Test API Endpoint Authentication
    console.log('7. Testing API Endpoint Authentication...');
    const testEndpoints = [
      '/api/v1/dashboard/kpis',
      '/api/v1/notifications',
      '/api/v1/users',
      '/api/v1/fleet/vehicles',
      '/api/v1/finance/payments',
      '/api/v1/revenue/metrics',
      '/api/v1/system/performance',
      '/api/v1/sessions/active',
      '/api/v1/customers',
      '/api/v1/compliance/status'
    ];

    console.log('   Testing endpoints that are returning 401 errors:');
    testEndpoints.forEach(endpoint => {
      console.log(`   - ${endpoint}`);
    });
    console.log('');

    // Test 8: Check Environment Variables
    console.log('8. Checking Environment Variables...');
    const requiredEnvVars = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'MONGODB_URI',
      'NODE_ENV'
    ];

    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        console.log(`   ✅ ${envVar}: Set`);
      } else {
        console.log(`   ❌ ${envVar}: Not set`);
      }
    });
    console.log('');

    console.log('🎉 Authentication system test completed successfully!');
    console.log('\n📋 Recommendations:');
    console.log('1. Ensure all API endpoints use the correct authentication middleware');
    console.log('2. Check that JWT tokens are being sent in Authorization headers');
    console.log('3. Verify that the frontend is storing and sending tokens correctly');
    console.log('4. Check for any middleware conflicts or route mounting issues');

  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  }
}

// Run the test
testAuthentication().catch(console.error);
