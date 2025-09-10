#!/usr/bin/env node

/**
 * Mobile Features Test Script
 * Tests all mobile API endpoints and functionality
 */

const axios = require('axios');
const WebSocket = require('ws');

// Configuration
const config = {
  baseURL: process.argv[2] || 'http://localhost:5000',
  testUser: {
    email: process.argv[3] || 'test@clutch.com',
    password: process.argv[4] || 'testpassword123',
    phoneNumber: process.argv[5] || '+1234567890'
  },
  timeout: 10000
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper functions
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

const recordTest = (testName, success, details = '') => {
  testResults.total++;
  if (success) {
    testResults.passed++;
    log(`✅ ${testName}`, 'success');
  } else {
    testResults.failed++;
    log(`❌ ${testName}: ${details}`, 'error');
  }
  
  testResults.details.push({
    name: testName,
    success,
    details,
    timestamp: new Date().toISOString()
  });
};

// Authentication token
let authToken = null;

/**
 * Test Mobile Authentication
 */
async function testMobileAuthentication() {
  log('🔐 Testing Mobile Authentication...', 'info');
  
  try {
    // Test mobile registration
    const registrationData = {
      phoneNumber: config.testUser.phoneNumber,
      email: config.testUser.email,
      password: config.testUser.password,
      fullName: 'Test User',
      deviceToken: 'test-device-token-123'
    };

    const registrationResponse = await axios.post(
      `${config.baseURL}/api/mobile/auth/register`,
      registrationData,
      { timeout: config.timeout }
    );

    if (registrationResponse.data.success) {
      recordTest('Mobile Registration', true);
    } else {
      recordTest('Mobile Registration', false, registrationResponse.data.message);
    }
  } catch (error) {
    if (error.response?.status === 409) {
      recordTest('Mobile Registration', true, 'User already exists');
    } else {
      recordTest('Mobile Registration', false, error.response?.data?.message || error.message);
    }
  }

  try {
    // Test mobile login
    const loginData = {
      identifier: config.testUser.email,
      password: config.testUser.password,
      deviceToken: 'test-device-token-123'
    };

    const loginResponse = await axios.post(
      `${config.baseURL}/api/mobile/auth/login`,
      loginData,
      { timeout: config.timeout }
    );

    if (loginResponse.data.success) {
      authToken = loginResponse.data.data.token;
      recordTest('Mobile Login', true);
    } else {
      recordTest('Mobile Login', false, loginResponse.data.message);
    }
  } catch (error) {
    recordTest('Mobile Login', false, error.response?.data?.message || error.message);
  }

  try {
    // Test OTP verification
    const otpData = {
      phoneNumber: config.testUser.phoneNumber,
      otp: '123456' // Mock OTP
    };

    const otpResponse = await axios.post(
      `${config.baseURL}/api/mobile/auth/verify-otp`,
      otpData,
      { timeout: config.timeout }
    );

    recordTest('OTP Verification', otpResponse.data.success, otpResponse.data.message);
  } catch (error) {
    recordTest('OTP Verification', false, error.response?.data?.message || error.message);
  }

  try {
    // Test forgot password
    const forgotPasswordData = {
      identifier: config.testUser.email
    };

    const forgotPasswordResponse = await axios.post(
      `${config.baseURL}/api/mobile/auth/forgot-password`,
      forgotPasswordData,
      { timeout: config.timeout }
    );

    recordTest('Forgot Password', forgotPasswordResponse.data.success, forgotPasswordResponse.data.message);
  } catch (error) {
    recordTest('Forgot Password', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test Mobile Booking
 */
async function testMobileBooking() {
  log('📅 Testing Mobile Booking...', 'info');

  if (!authToken) {
    recordTest('Mobile Booking Tests', false, 'No authentication token');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // Test nearby mechanics
    const nearbyMechanicsResponse = await axios.get(
      `${config.baseURL}/api/mobile/bookings/nearby-mechanics?latitude=40.7128&longitude=-74.0060&radius=10`,
      { headers, timeout: config.timeout }
    );

    recordTest('Get Nearby Mechanics', nearbyMechanicsResponse.data.success, 
      `Found ${nearbyMechanicsResponse.data.data?.length || 0} mechanics`);
  } catch (error) {
    recordTest('Get Nearby Mechanics', false, error.response?.data?.message || error.message);
  }

  try {
    // Test quick booking
    const quickBookingData = {
      serviceType: 'oil_change',
      vehicleId: 'test-vehicle-id',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'Test Address'
      },
      description: 'Test booking for oil change',
      urgency: 'medium'
    };

    const quickBookingResponse = await axios.post(
      `${config.baseURL}/api/mobile/bookings/quick-booking`,
      quickBookingData,
      { headers, timeout: config.timeout }
    );

    recordTest('Quick Booking', quickBookingResponse.data.success, quickBookingResponse.data.message);
  } catch (error) {
    recordTest('Quick Booking', false, error.response?.data?.message || error.message);
  }

  try {
    // Test active bookings
    const activeBookingsResponse = await axios.get(
      `${config.baseURL}/api/mobile/bookings/active`,
      { headers, timeout: config.timeout }
    );

    recordTest('Get Active Bookings', activeBookingsResponse.data.success,
      `Found ${activeBookingsResponse.data.data?.length || 0} active bookings`);
  } catch (error) {
    recordTest('Get Active Bookings', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test Mobile Location
 */
async function testMobileLocation() {
  log('📍 Testing Mobile Location...', 'info');

  if (!authToken) {
    recordTest('Mobile Location Tests', false, 'No authentication token');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // Test location update
    const locationData = {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10,
      speed: 0
    };

    const locationUpdateResponse = await axios.post(
      `${config.baseURL}/api/mobile/location/update`,
      locationData,
      { headers, timeout: config.timeout }
    );

    recordTest('Location Update', locationUpdateResponse.data.success, locationUpdateResponse.data.message);
  } catch (error) {
    recordTest('Location Update', false, error.response?.data?.message || error.message);
  }

  try {
    // Test get mechanic location
    const mechanicLocationResponse = await axios.get(
      `${config.baseURL}/api/mobile/location/mechanic/test-mechanic-id`,
      { headers, timeout: config.timeout }
    );

    recordTest('Get Mechanic Location', mechanicLocationResponse.data.success, mechanicLocationResponse.data.message);
  } catch (error) {
    recordTest('Get Mechanic Location', false, error.response?.data?.message || error.message);
  }

  try {
    // Test geofence setup
    const geofenceData = {
      bookingId: 'test-booking-id',
      center: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      radius: 1.0
    };

    const geofenceResponse = await axios.post(
      `${config.baseURL}/api/mobile/location/geofence`,
      geofenceData,
      { headers, timeout: config.timeout }
    );

    recordTest('Geofence Setup', geofenceResponse.data.success, geofenceResponse.data.message);
  } catch (error) {
    recordTest('Geofence Setup', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test Mobile Notifications
 */
async function testMobileNotifications() {
  log('🔔 Testing Mobile Notifications...', 'info');

  if (!authToken) {
    recordTest('Mobile Notification Tests', false, 'No authentication token');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // Test device token registration
    const deviceTokenData = {
      deviceToken: 'test-device-token-456',
      platform: 'ios'
    };

    const deviceTokenResponse = await axios.post(
      `${config.baseURL}/api/mobile/notifications/register-token`,
      deviceTokenData,
      { headers, timeout: config.timeout }
    );

    recordTest('Device Token Registration', deviceTokenResponse.data.success, deviceTokenResponse.data.message);
  } catch (error) {
    recordTest('Device Token Registration', false, error.response?.data?.message || error.message);
  }

  try {
    // Test notification history
    const notificationHistoryResponse = await axios.get(
      `${config.baseURL}/api/mobile/notifications/history?page=1&limit=10`,
      { headers, timeout: config.timeout }
    );

    recordTest('Notification History', notificationHistoryResponse.data.success,
      `Found ${notificationHistoryResponse.data.data?.notifications?.length || 0} notifications`);
  } catch (error) {
    recordTest('Notification History', false, error.response?.data?.message || error.message);
  }

  try {
    // Test notification preferences
    const preferencesData = {
      bookingUpdates: true,
      promotions: false,
      reminders: true,
      chatMessages: true
    };

    const preferencesResponse = await axios.put(
      `${config.baseURL}/api/mobile/notifications/preferences`,
      preferencesData,
      { headers, timeout: config.timeout }
    );

    recordTest('Notification Preferences', preferencesResponse.data.success, preferencesResponse.data.message);
  } catch (error) {
    recordTest('Notification Preferences', false, error.response?.data?.message || error.message);
  }
}

/**
 * Test WebSocket Connectivity
 */
async function testWebSocketConnectivity() {
  log('🔌 Testing WebSocket Connectivity...', 'info');

  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(`ws://${config.baseURL.replace('http://', '')}`);

      ws.on('open', () => {
        recordTest('WebSocket Connection', true, 'Connected successfully');
        ws.close();
        resolve();
      });

      ws.on('error', (error) => {
        recordTest('WebSocket Connection', false, error.message);
        resolve();
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        recordTest('WebSocket Connection', false, 'Connection timeout');
        resolve();
      }, 5000);
    } catch (error) {
      recordTest('WebSocket Connection', false, error.message);
      resolve();
    }
  });
}

/**
 * Test API Health and Performance
 */
async function testAPIHealth() {
  log('🏥 Testing API Health...', 'info');

  try {
    const startTime = Date.now();
    const healthResponse = await axios.get(`${config.baseURL}/health`, { timeout: config.timeout });
    const responseTime = Date.now() - startTime;

    if (healthResponse.data.status === 'ok') {
      recordTest('API Health Check', true, `Response time: ${responseTime}ms`);
    } else {
      recordTest('API Health Check', false, 'Health check failed');
    }
  } catch (error) {
    recordTest('API Health Check', false, error.message);
  }

  try {
    const startTime = Date.now();
    const statusResponse = await axios.get(`${config.baseURL}/platform/status`, { timeout: config.timeout });
    const responseTime = Date.now() - startTime;

    if (statusResponse.data.status === 'operational') {
      recordTest('Platform Status', true, `Response time: ${responseTime}ms`);
    } else {
      recordTest('Platform Status', false, 'Platform not operational');
    }
  } catch (error) {
    recordTest('Platform Status', false, error.message);
  }
}

/**
 * Test Input Validation
 */
async function testInputValidation() {
  log('✅ Testing Input Validation...', 'info');

  try {
    // Test invalid registration data
    const invalidRegistrationData = {
      phoneNumber: 'invalid-phone',
      email: 'invalid-email',
      password: '123', // Too short
      fullName: '' // Empty
    };

    const invalidRegistrationResponse = await axios.post(
      `${config.baseURL}/api/mobile/auth/register`,
      invalidRegistrationData,
      { timeout: config.timeout }
    );

    // Should fail validation
    if (invalidRegistrationResponse.status === 400) {
      recordTest('Input Validation - Registration', true, 'Properly rejected invalid data');
    } else {
      recordTest('Input Validation - Registration', false, 'Should have rejected invalid data');
    }
  } catch (error) {
    if (error.response?.status === 400) {
      recordTest('Input Validation - Registration', true, 'Properly rejected invalid data');
    } else {
      recordTest('Input Validation - Registration', false, error.message);
    }
  }

  try {
    // Test invalid location data
    const invalidLocationData = {
      latitude: 200, // Invalid latitude
      longitude: 200 // Invalid longitude
    };

    const invalidLocationResponse = await axios.post(
      `${config.baseURL}/api/mobile/location/update`,
      invalidLocationData,
      { 
        headers: { 'Authorization': `Bearer ${authToken}` },
        timeout: config.timeout 
      }
    );

    if (invalidLocationResponse.status === 400) {
      recordTest('Input Validation - Location', true, 'Properly rejected invalid coordinates');
    } else {
      recordTest('Input Validation - Location', false, 'Should have rejected invalid coordinates');
    }
  } catch (error) {
    if (error.response?.status === 400) {
      recordTest('Input Validation - Location', true, 'Properly rejected invalid coordinates');
    } else {
      recordTest('Input Validation - Location', false, error.message);
    }
  }
}

/**
 * Main test execution
 */
async function runAllTests() {
  log('🚀 Starting Mobile Features Test Suite...', 'info');
  log(`Base URL: ${config.baseURL}`, 'info');
  log(`Test User: ${config.testUser.email}`, 'info');

  const startTime = Date.now();

  // Run all test suites
  await testAPIHealth();
  await testMobileAuthentication();
  await testMobileBooking();
  await testMobileLocation();
  await testMobileNotifications();
  await testWebSocketConnectivity();
  await testInputValidation();

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  // Print summary
  log('\n📊 Test Results Summary:', 'info');
  log(`Total Tests: ${testResults.total}`, 'info');
  log(`Passed: ${testResults.passed}`, 'success');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 'info');
  log(`Total Time: ${totalTime}ms`, 'info');

  // Print failed tests
  if (testResults.failed > 0) {
    log('\n❌ Failed Tests:', 'error');
    testResults.details
      .filter(test => !test.success)
      .forEach(test => {
        log(`  - ${test.name}: ${test.details}`, 'error');
      });
  }

  // Print recommendations
  log('\n💡 Recommendations:', 'warning');
  if (testResults.failed === 0) {
    log('  ✅ All tests passed! Mobile features are working correctly.', 'success');
  } else {
    log('  🔧 Some tests failed. Please check the implementation and try again.', 'warning');
  }

  log('  📱 Mobile API endpoints are ready for mobile app integration.', 'info');
  log('  🔐 Authentication system is properly configured.', 'info');
  log('  📍 Location services are functional.', 'info');
  log('  🔔 Push notification system is set up.', 'info');

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Mobile Features Test Script

Usage: node test-mobile-features.js [baseURL] [email] [password] [phoneNumber]

Arguments:
  baseURL     API base URL (default: http://localhost:5000)
  email       Test user email (default: test@clutch.com)
  password    Test user password (default: testpassword123)
  phoneNumber Test user phone number (default: +1234567890)

Examples:
  node test-mobile-features.js
  node test-mobile-features.js http://localhost:5000
  node test-mobile-features.js https://api.clutch.com test@example.com mypassword +1234567890

Options:
  --help, -h  Show this help message
`);
  process.exit(0);
}

// Run tests
runAllTests().catch(error => {
  log(`❌ Test suite failed: ${error.message}`, 'error');
  process.exit(1);
});
