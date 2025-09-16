#!/usr/bin/env node

/**
 * Enhanced Features Test Script
 * 
 * This script tests all the enhanced features including:
 * - Real-time communication
 * - Advanced payment processing
 * - AI recommendations
 * - Advanced analytics
 * 
 * Usage: node scripts/test-enhanced-features.js
 */

const axios = require('axios');
const WebSocket = require('ws');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'testpassword123';

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'     // Reset
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
};

const addTestResult = (testName, success, details = null) => {
  testResults.total++;
  if (success) {
    testResults.passed++;
    log(`✅ ${testName} - PASSED`, 'success');
  } else {
    testResults.failed++;
    log(`❌ ${testName} - FAILED`, 'error');
    if (details) {
      log(`   Details: ${details}`, 'error');
    }
  }
  
  testResults.details.push({
    name: testName,
    success,
    details,
    timestamp: new Date().toISOString()
  });
};

// Authentication helper
let authToken = null;

const authenticate = async () => {
  try {
    log('🔐 Authenticating test user...', 'info');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      log('✅ Authentication successful', 'success');
      return true;
    } else {
      log('❌ Authentication failed - no token received', 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Authentication failed: ${error.message}`, 'error');
    return false;
  }
};

// Test functions
const testRealTimeCommunication = async () => {
  log('🔄 Testing Real-Time Communication Features...', 'info');
  
  try {
    // Test booking update
    const bookingUpdateResponse = await axios.post(
      `${BASE_URL}/api/enhanced/real-time/booking-update`,
      {
        bookingId: 'test-booking-123',
        status: 'in_progress',
        mechanicName: 'Test Mechanic',
        estimatedTime: '2:30'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Real-time Booking Update',
      bookingUpdateResponse.data.success,
      bookingUpdateResponse.data.message
    );
    
    // Test notification
    const notificationResponse = await axios.post(
      `${BASE_URL}/api/enhanced/real-time/notification`,
      {
        userId: 'test-user-123',
        message: 'Test notification message',
        type: 'info'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Real-time Notification',
      notificationResponse.data.success,
      notificationResponse.data.message
    );
    
    // Test statistics
    const statisticsResponse = await axios.get(
      `${BASE_URL}/api/enhanced/real-time/statistics`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Real-time Statistics',
      statisticsResponse.data.success,
      'Statistics retrieved successfully'
    );
    
  } catch (error) {
    addTestResult(
      'Real-time Communication',
      false,
      error.response?.data?.message || error.message
    );
  }
};

const testAdvancedPayments = async () => {
  log('💳 Testing Advanced Payment Features...', 'info');
  
  try {
    // Test payment processing
    const paymentResponse = await axios.post(
      `${BASE_URL}/api/enhanced/payments/process`,
      {
        amount: 150.00,
        currency: 'USD',
        paymentMethod: 'stripe',
        customerId: 'test-customer-123',
        bookingId: 'test-booking-123',
        description: 'Test payment for oil change'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Payment Processing',
      paymentResponse.data.success,
      paymentResponse.data.message
    );
    
    // Test subscription creation
    const subscriptionResponse = await axios.post(
      `${BASE_URL}/api/enhanced/payments/subscription`,
      {
        customerId: 'test-customer-123',
        planId: 'test-plan-123',
        paymentMethod: 'stripe'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Subscription Creation',
      subscriptionResponse.data.success,
      subscriptionResponse.data.message
    );
    
    // Test payment plan
    const paymentPlanResponse = await axios.post(
      `${BASE_URL}/api/enhanced/payments/plan`,
      {
        bookingId: 'test-booking-123',
        totalAmount: 500.00,
        installments: 3,
        customerId: 'test-customer-123',
        paymentMethod: 'stripe',
        interval: 'monthly'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Payment Plan Creation',
      paymentPlanResponse.data.success,
      paymentPlanResponse.data.message
    );
    
    // Test split payment
    const splitPaymentResponse = await axios.post(
      `${BASE_URL}/api/enhanced/payments/split`,
      {
        totalAmount: 300.00,
        splits: [
          {
            userId: 'user1',
            amount: 150.00,
            paymentMethod: 'stripe'
          },
          {
            userId: 'user2',
            amount: 150.00,
            paymentMethod: 'paypal'
          }
        ],
        customerId: 'test-customer-123',
        bookingId: 'test-booking-123'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Split Payment Processing',
      splitPaymentResponse.data.success,
      splitPaymentResponse.data.message
    );
    
    // Test invoice generation
    const invoiceResponse = await axios.post(
      `${BASE_URL}/api/enhanced/payments/invoice`,
      {
        customerId: 'test-customer-123',
        bookingId: 'test-booking-123',
        items: [
          {
            name: 'Oil Change',
            quantity: 1,
            unitPrice: 50.00,
            description: 'Full synthetic oil change'
          },
          {
            name: 'Filter Replacement',
            quantity: 1,
            unitPrice: 25.00,
            description: 'Oil filter replacement'
          }
        ],
        dueDate: '2024-01-15',
        notes: 'Test invoice'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Invoice Generation',
      invoiceResponse.data.success,
      invoiceResponse.data.message
    );
    
    // Test payment statistics
    const paymentStatsResponse = await axios.get(
      `${BASE_URL}/api/enhanced/payments/statistics`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Payment Statistics',
      paymentStatsResponse.data.success,
      'Payment statistics retrieved successfully'
    );
    
  } catch (error) {
    addTestResult(
      'Advanced Payments',
      false,
      error.response?.data?.message || error.message
    );
  }
};

const testAIRecommendations = async () => {
  log('🤖 Testing AI Recommendation Features...', 'info');
  
  try {
    // Test service recommendations
    const recommendationsResponse = await axios.get(
      `${BASE_URL}/api/enhanced/recommendations/services?vehicleType=sedan&budget=500&urgency=medium`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Service Recommendations',
      recommendationsResponse.data.success,
      'Service recommendations retrieved successfully'
    );
    
    // Test maintenance scheduling
    const maintenanceResponse = await axios.post(
      `${BASE_URL}/api/enhanced/recommendations/maintenance`,
      {
        vehicleId: 'test-vehicle-123',
        vehicleData: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          mileage: 50000,
          lastServiceDate: '2023-01-15'
        }
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Maintenance Scheduling',
      maintenanceResponse.data.success,
      maintenanceResponse.data.message
    );
    
    // Test dynamic pricing
    const pricingResponse = await axios.post(
      `${BASE_URL}/api/enhanced/recommendations/pricing`,
      {
        serviceId: 'test-service-123',
        basePrice: 100.00,
        demandLevel: 'high',
        timeOfDay: 'afternoon',
        dayOfWeek: 'friday'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Dynamic Pricing',
      pricingResponse.data.success,
      pricingResponse.data.message
    );
    
  } catch (error) {
    addTestResult(
      'AI Recommendations',
      false,
      error.response?.data?.message || error.message
    );
  }
};

const testAdvancedAnalytics = async () => {
  log('📊 Testing Advanced Analytics Features...', 'info');
  
  try {
    // Test real-time metrics
    const realtimeResponse = await axios.get(
      `${BASE_URL}/api/enhanced/analytics/realtime`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Real-time Analytics',
      realtimeResponse.data.success,
      'Real-time metrics retrieved successfully'
    );
    
    // Test predictive analytics
    const predictiveResponse = await axios.get(
      `${BASE_URL}/api/enhanced/analytics/predictive`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Predictive Analytics',
      predictiveResponse.data.success,
      'Predictive analytics generated successfully'
    );
    
    // Test business intelligence
    const biResponse = await axios.get(
      `${BASE_URL}/api/enhanced/analytics/business-intelligence`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Business Intelligence',
      biResponse.data.success,
      'Business intelligence report generated successfully'
    );
    
    // Test KPI report
    const kpiResponse = await axios.get(
      `${BASE_URL}/api/enhanced/analytics/kpi`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'KPI Report',
      kpiResponse.data.success,
      'KPI report generated successfully'
    );
    
    // Test insights
    const insightsResponse = await axios.get(
      `${BASE_URL}/api/enhanced/analytics/insights`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Business Insights',
      insightsResponse.data.success,
      'Business insights generated successfully'
    );
    
  } catch (error) {
    addTestResult(
      'Advanced Analytics',
      false,
      error.response?.data?.message || error.message
    );
  }
};

const testWebSocketConnection = async () => {
  log('🔌 Testing WebSocket Connection...', 'info');
  
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(`ws://localhost:8080`);
      
      ws.on('open', () => {
        log('✅ WebSocket connection established', 'success');
        addTestResult('WebSocket Connection', true, 'Connection established successfully');
        ws.close();
        resolve();
      });
      
      ws.on('error', (error) => {
        log(`❌ WebSocket connection failed: ${error.message}`, 'error');
        addTestResult('WebSocket Connection', false, error.message);
        resolve();
      });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          addTestResult('WebSocket Connection', false, 'Connection timeout');
          resolve();
        }
      }, 5000);
      
    } catch (error) {
      addTestResult('WebSocket Connection', false, error.message);
      resolve();
    }
  });
};

const testValidationSchemas = async () => {
  log('✅ Testing Input Validation Schemas...', 'info');
  
  try {
    // Test invalid booking update (missing required fields)
    const invalidBookingResponse = await axios.post(
      `${BASE_URL}/api/enhanced/real-time/booking-update`,
      {
        // Missing required bookingId and status
        mechanicName: 'Test Mechanic'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Input Validation - Invalid Booking Update',
      !invalidBookingResponse.data.success,
      'Validation correctly rejected invalid data'
    );
    
    // Test invalid payment (negative amount)
    const invalidPaymentResponse = await axios.post(
      `${BASE_URL}/api/enhanced/payments/process`,
      {
        amount: -50.00, // Invalid negative amount
        currency: 'USD',
        paymentMethod: 'stripe',
        customerId: 'test-customer-123',
        bookingId: 'test-booking-123'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    addTestResult(
      'Input Validation - Invalid Payment',
      !invalidPaymentResponse.data.success,
      'Validation correctly rejected invalid payment data'
    );
    
  } catch (error) {
    // Expected error for validation failures
    if (error.response?.status === 400) {
      addTestResult(
        'Input Validation',
        true,
        'Validation correctly caught invalid input'
      );
    } else {
      addTestResult(
        'Input Validation',
        false,
        error.response?.data?.message || error.message
      );
    }
  }
};

// Main test execution
const runAllTests = async () => {
  log('🚀 Starting Enhanced Features Test Suite...', 'info');
  log(`📍 Testing against: ${BASE_URL}`, 'info');
  
  // Authenticate first
  const authSuccess = await authenticate();
  if (!authSuccess) {
    log('❌ Authentication failed. Cannot proceed with tests.', 'error');
    process.exit(1);
  }
  
  // Run all test suites
  await testRealTimeCommunication();
  await testAdvancedPayments();
  await testAIRecommendations();
  await testAdvancedAnalytics();
  await testWebSocketConnection();
  await testValidationSchemas();
  
  // Print summary
  log('\n📋 Test Summary:', 'info');
  log(`Total Tests: ${testResults.total}`, 'info');
  log(`Passed: ${testResults.passed}`, 'success');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 'info');
  
  // Print detailed results
  if (testResults.failed > 0) {
    log('\n❌ Failed Tests:', 'error');
    testResults.details
      .filter(test => !test.success)
      .forEach(test => {
        log(`   - ${test.name}: ${test.details}`, 'error');
      });
  }
  
  // Exit with appropriate code
  if (testResults.failed > 0) {
    log('\n❌ Some tests failed. Please check the implementation.', 'error');
    process.exit(1);
  } else {
    log('\n✅ All tests passed! Enhanced features are working correctly.', 'success');
    process.exit(0);
  }
};

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Enhanced Features Test Script

Usage: node scripts/test-enhanced-features.js [options]

Options:
  --help, -h     Show this help message
  --url <url>    Set the API base URL (default: http://localhost:5000)
  --user <email> Set test user email (default: test@example.com)
  --pass <pass>  Set test user password (default: testpassword123)

Environment Variables:
  API_BASE_URL   API base URL
  TEST_USER_EMAIL Test user email
  TEST_USER_PASSWORD Test user password

Examples:
  node scripts/test-enhanced-features.js
  node scripts/test-enhanced-features.js --url https://api.example.com
  API_BASE_URL=https://api.example.com node scripts/test-enhanced-features.js
  `);
  process.exit(0);
}

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) {
    process.env.API_BASE_URL = args[i + 1];
    i++;
  } else if (args[i] === '--user' && args[i + 1]) {
    process.env.TEST_USER_EMAIL = args[i + 1];
    i++;
  } else if (args[i] === '--pass' && args[i + 1]) {
    process.env.TEST_USER_PASSWORD = args[i + 1];
    i++;
  }
}

// Run tests
runAllTests().catch(error => {
  log(`❌ Test execution failed: ${error.message}`, 'error');
  process.exit(1);
});
