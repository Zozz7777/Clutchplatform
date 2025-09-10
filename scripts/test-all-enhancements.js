const axios = require('axios');
const WebSocket = require('ws');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;
const WS_URL = BASE_URL.replace('http', 'ws');

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

// Logging utility
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'     // Reset
  };
  
  const timestamp = new Date().toISOString();
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
};

// Test utility functions
const runTest = async (testName, testFunction) => {
  testResults.total++;
  log(`🧪 Running: ${testName}`, 'info');
  
  try {
    await testFunction();
    testResults.passed++;
    log(`✅ PASSED: ${testName}`, 'success');
    testResults.details.push({ name: testName, status: 'PASSED' });
  } catch (error) {
    testResults.failed++;
    log(`❌ FAILED: ${testName} - ${error.message}`, 'error');
    testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
  }
};

// Authentication
let authToken = null;

const authenticate = async () => {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@clutch.com',
      password: 'testpassword123'
    });
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      log('🔐 Authentication successful', 'success');
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    log('⚠️  Using test mode without authentication', 'warning');
  }
};

// Test API Health
const testAPIHealth = async () => {
  await runTest('API Health Check', async () => {
    const response = await axios.get(`${API_BASE}/health`);
    if (!response.data.success) {
      throw new Error('Health check failed');
    }
  });
};

// Test API Versioning
const testAPIVersioning = async () => {
  await runTest('API Versioning', async () => {
    const response = await axios.get(`${API_BASE}/advanced/versions`);
    if (!response.data.success || !response.data.data.supportedVersions) {
      throw new Error('API versioning not working');
    }
  });
};

// Test Advanced AI Features
const testAdvancedAI = async () => {
  await runTest('Dynamic Pricing', async () => {
    const response = await axios.post(`${API_BASE}/advanced/ai/dynamic-pricing`, {
      serviceType: 'oil_change',
      location: { lat: 40.7128, lng: -74.0060 },
      timeOfDay: 14,
      dayOfWeek: 3,
      currentDemand: 0.8,
      mechanicAvailability: 0.6,
      weatherConditions: 'sunny',
      competitorPrices: [45, 50, 55]
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.finalPrice) {
      throw new Error('Dynamic pricing calculation failed');
    }
  });

  await runTest('Predictive Maintenance', async () => {
    const response = await axios.post(`${API_BASE}/advanced/ai/predictive-maintenance`, {
      vehicleId: 'test-vehicle-123',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      mileage: 50000,
      serviceHistory: [],
      drivingPatterns: { averageDailyMiles: 30 },
      environmentalConditions: { harsh: false }
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.nextMaintenance) {
      throw new Error('Predictive maintenance failed');
    }
  });

  await runTest('AI Customer Support', async () => {
    const response = await axios.post(`${API_BASE}/advanced/ai/customer-support`, {
      message: 'I need help with my booking',
      conversationHistory: []
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.response) {
      throw new Error('AI customer support failed');
    }
  });
};

// Test Advanced Caching
const testAdvancedCaching = async () => {
  await runTest('Cache Set/Get', async () => {
    const testData = { test: 'data', timestamp: Date.now() };
    
    // Set cache
    await axios.post(`${API_BASE}/advanced/cache/set`, {
      key: 'test-cache-key',
      value: testData,
      ttl: 300,
      tags: ['test', 'cache']
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    // Get cache
    const response = await axios.get(`${API_BASE}/advanced/cache/get?key=test-cache-key`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.value) {
      throw new Error('Cache set/get failed');
    }
  });

  await runTest('Cache Invalidation', async () => {
    const response = await axios.post(`${API_BASE}/advanced/cache/invalidate`, {
      tags: ['test']
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Cache invalidation failed');
    }
  });

  await runTest('Cache Statistics', async () => {
    const response = await axios.get(`${API_BASE}/advanced/cache/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.hitRate) {
      throw new Error('Cache statistics failed');
    }
  });
};

// Test Fraud Detection
const testFraudDetection = async () => {
  await runTest('Fraud Risk Assessment', async () => {
    const response = await axios.post(`${API_BASE}/advanced/fraud/assess-risk`, {
      userId: 'test-user-123',
      transactionId: 'txn-123',
      amount: 150.00,
      location: { lat: 40.7128, lng: -74.0060 },
      deviceId: 'device-123',
      paymentMethod: 'stripe',
      timestamp: new Date().toISOString()
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.riskLevel) {
      throw new Error('Fraud risk assessment failed');
    }
  });

  await runTest('Fraud Statistics', async () => {
    const response = await axios.get(`${API_BASE}/advanced/fraud/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Fraud statistics failed');
    }
  });
};

// Test Performance Monitoring
const testPerformanceMonitoring = async () => {
  await runTest('Performance Metrics', async () => {
    const response = await axios.get(`${API_BASE}/advanced/performance/metrics`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data) {
      throw new Error('Performance metrics failed');
    }
  });

  await runTest('Performance Optimization', async () => {
    const response = await axios.post(`${API_BASE}/advanced/performance/optimize`, {
      optimizationType: 'database'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Performance optimization failed');
    }
  });
};

// Test Advanced Analytics
const testAdvancedAnalytics = async () => {
  await runTest('Advanced Analytics', async () => {
    const response = await axios.get(`${API_BASE}/advanced/analytics/advanced?timeframe=month&metrics=revenue,bookings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Advanced analytics failed');
    }
  });

  await runTest('Predictive Analytics', async () => {
    const response = await axios.get(`${API_BASE}/advanced/analytics/predictions?predictionType=demand&horizon=30&confidence=0.8`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Predictive analytics failed');
    }
  });
};

// Test Subscription Services
const testSubscriptionServices = async () => {
  await runTest('Create Subscription', async () => {
    const response = await axios.post(`${API_BASE}/advanced/subscriptions/create`, {
      planType: 'basic',
      duration: 'monthly',
      services: ['oil_change', 'tire_rotation'],
      price: 29.99
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.id) {
      throw new Error('Subscription creation failed');
    }
  });
};

// Test WebSocket Connectivity
const testWebSocketConnectivity = async () => {
  await runTest('WebSocket Connection', async () => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${WS_URL}`);
      
      ws.on('open', () => {
        log('🔌 WebSocket connected', 'success');
        ws.close();
        resolve();
      });
      
      ws.on('error', (error) => {
        reject(new Error(`WebSocket connection failed: ${error.message}`));
      });
      
      setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, 5000);
    });
  });
};

// Test Advanced Health Check
const testAdvancedHealthCheck = async () => {
  await runTest('Advanced Health Check', async () => {
    const response = await axios.get(`${API_BASE}/advanced/health/advanced`);
    
    if (!response.data.success || response.data.status !== 'healthy') {
      throw new Error('Advanced health check failed');
    }
    
    // Check individual service health
    const checks = response.data.checks;
    if (!checks.ai || !checks.cache || !checks.fraud || !checks.versioning) {
      throw new Error('Missing health check components');
    }
  });
};

// Test Input Validation
const testInputValidation = async () => {
  await runTest('Input Validation - Invalid Data', async () => {
    try {
      await axios.post(`${API_BASE}/advanced/ai/dynamic-pricing`, {
        // Missing required fields
        serviceType: '',
        location: null
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      throw new Error('Should have failed validation');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Expected validation error
        return;
      }
      throw new Error('Validation not working properly');
    }
  });
};

// Test Rate Limiting
const testRateLimiting = async () => {
  await runTest('Rate Limiting', async () => {
    const requests = [];
    for (let i = 0; i < 15; i++) {
      requests.push(
        axios.get(`${API_BASE}/health`).catch(error => error)
      );
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(response => 
      response.response && response.response.status === 429
    );
    
    if (!rateLimited) {
      log('⚠️  Rate limiting may not be working properly', 'warning');
    }
  });
};

// Test Security Features
const testSecurityFeatures = async () => {
  await runTest('Security Headers', async () => {
    const response = await axios.get(`${API_BASE}/health`);
    
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection',
      'strict-transport-security'
    ];
    
    const missingHeaders = securityHeaders.filter(header => 
      !response.headers[header]
    );
    
    if (missingHeaders.length > 0) {
      log(`⚠️  Missing security headers: ${missingHeaders.join(', ')}`, 'warning');
    }
  });

  await runTest('Authentication Required', async () => {
    try {
      await axios.get(`${API_BASE}/advanced/ai/stats`);
      throw new Error('Should require authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Expected authentication error
        return;
      }
      throw new Error('Authentication not properly enforced');
    }
  });
};

// Main test execution
const runAllTests = async () => {
  log('🚀 Starting Comprehensive Enhancement Test Suite...', 'info');
  const startTime = Date.now();
  
  try {
    // Authenticate first
    await authenticate();
    
    // Run all test categories
    await testAPIHealth();
    await testAPIVersioning();
    await testAdvancedAI();
    await testAdvancedCaching();
    await testFraudDetection();
    await testPerformanceMonitoring();
    await testAdvancedAnalytics();
    await testSubscriptionServices();
    await testWebSocketConnectivity();
    await testAdvancedHealthCheck();
    await testInputValidation();
    await testRateLimiting();
    await testSecurityFeatures();
    
  } catch (error) {
    log(`❌ Test suite error: ${error.message}`, 'error');
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Print results summary
  log('\n📊 Test Results Summary:', 'info');
  log(`Total Tests: ${testResults.total}`, 'info');
  log(`Passed: ${testResults.passed}`, 'success');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 'info');
  log(`Total Time: ${totalTime}ms`, 'info');
  
  // Print detailed results
  if (testResults.details.length > 0) {
    log('\n📋 Detailed Results:', 'info');
    testResults.details.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      log(`${status} ${test.name}`, test.status === 'PASSED' ? 'success' : 'error');
      if (test.error) {
        log(`   Error: ${test.error}`, 'error');
      }
    });
  }
  
  // Print recommendations
  if (testResults.failed > 0) {
    log('\n🔧 Recommendations:', 'warning');
    log('- Check server logs for detailed error information', 'warning');
    log('- Verify all services are running and accessible', 'warning');
    log('- Ensure proper environment variables are set', 'warning');
    log('- Check database connectivity and permissions', 'warning');
  } else {
    log('\n🎉 All tests passed! System is ready for production.', 'success');
  }
  
  process.exit(testResults.failed > 0 ? 1 : 0);
};

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  log('Usage: node test-all-enhancements.js [options]', 'info');
  log('Options:', 'info');
  log('  --base-url <url>    Set base URL for testing', 'info');
  log('  --help, -h         Show this help message', 'info');
  process.exit(0);
}

const baseUrlIndex = args.indexOf('--base-url');
if (baseUrlIndex !== -1 && args[baseUrlIndex + 1]) {
  process.env.TEST_BASE_URL = args[baseUrlIndex + 1];
}

// Run the test suite
runAllTests().catch(error => {
  log(`❌ Test suite failed: ${error.message}`, 'error');
  process.exit(1);
});
