const axios = require('axios');
const WebSocket = require('ws');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

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

// Test Edge Computing Features
const testEdgeComputing = async () => {
  await runTest('Edge Computing - Get Optimal Node', async () => {
    const response = await axios.get(`${API_BASE}/next-level/edge/optimal-node?latitude=40.7128&longitude=-74.0060`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.name) {
      throw new Error('Failed to get optimal edge node');
    }
  });

  await runTest('Edge Computing - Cache Data', async () => {
    const testData = { test: 'data', timestamp: Date.now() };
    
    const response = await axios.post(`${API_BASE}/next-level/edge/cache`, {
      key: 'test-edge-cache',
      data: testData,
      ttl: 3600
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Failed to cache data at edge');
    }
  });

  await runTest('Edge Computing - Get Cached Data', async () => {
    const response = await axios.get(`${API_BASE}/next-level/edge/cache/test-edge-cache?latitude=40.7128&longitude=-74.0060`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Failed to get cached data from edge');
    }
  });

  await runTest('Edge Computing - Register Function', async () => {
    const functionCode = `
      function processData(data) {
        return {
          processed: true,
          timestamp: new Date().toISOString(),
          originalData: data
        };
      }
      return processData(data);
    `;
    
    const response = await axios.post(`${API_BASE}/next-level/edge/functions`, {
      name: 'test-function',
      code: functionCode,
      timeout: 5000,
      memory: 128
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Failed to register edge function');
    }
  });

  await runTest('Edge Computing - Execute Function', async () => {
    const response = await axios.post(`${API_BASE}/next-level/edge/functions/test-function/execute`, {
      data: { test: 'execution' },
      latitude: 40.7128,
      longitude: -74.0060
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.result) {
      throw new Error('Failed to execute edge function');
    }
  });

  await runTest('Edge Computing - Get Statistics', async () => {
    const response = await axios.get(`${API_BASE}/next-level/edge/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.totalNodes) {
      throw new Error('Failed to get edge computing statistics');
    }
  });

  await runTest('Edge Computing - Health Check', async () => {
    const response = await axios.get(`${API_BASE}/next-level/edge/health`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.status) {
      throw new Error('Failed to get edge computing health status');
    }
  });
};

// Test GraphQL Features
const testGraphQL = async () => {
  await runTest('GraphQL - Execute Query', async () => {
    const query = `
      query {
        user(id: "test-user") {
          id
          email
          firstName
          lastName
        }
      }
    `;
    
    const response = await axios.post(`${API_BASE}/next-level/graphql/query`, {
      query,
      variables: {}
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Failed to execute GraphQL query');
    }
  });

  await runTest('GraphQL - Execute Mutation', async () => {
    const mutation = `
      mutation CreateUser($input: UserInput!) {
        createUser(input: $input) {
          id
          email
          firstName
          lastName
        }
      }
    `;
    
    const response = await axios.post(`${API_BASE}/next-level/graphql/mutation`, {
      mutation,
      variables: {
        input: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'password123',
          userType: 'CUSTOMER'
        }
      }
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Failed to execute GraphQL mutation');
    }
  });

  await runTest('GraphQL - Get Introspection', async () => {
    const response = await axios.get(`${API_BASE}/next-level/graphql/introspection`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.__schema) {
      throw new Error('Failed to get GraphQL introspection');
    }
  });

  await runTest('GraphQL - Publish Event', async () => {
    const response = await axios.post(`${API_BASE}/next-level/graphql/events`, {
      eventName: 'test-event',
      data: { message: 'Test event data' }
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Failed to publish GraphQL event');
    }
  });
};

// Test IoT Features
const testIoT = async () => {
  await runTest('IoT - Connect Vehicle', async () => {
    const response = await axios.post(`${API_BASE}/next-level/iot/vehicles/connect`, {
      vehicleId: 'test-vehicle-123',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      vin: '1HGBH41JXMN109186',
      deviceId: 'device-123',
      connectionType: 'obd_ii'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.connectionId) {
      throw new Error('Failed to connect vehicle to IoT network');
    }
  });

  await runTest('IoT - Update Telemetry', async () => {
    const telemetryData = {
      engine: {
        temperature: 190,
        rpm: 2500,
        oilPressure: 45,
        fuelLevel: 75
      },
      battery: {
        voltage: 12.6,
        temperature: 85,
        age: 2
      },
      tires: {
        frontLeft: { pressure: 32, temperature: 95, wear: 20 },
        frontRight: { pressure: 31, temperature: 94, wear: 22 },
        rearLeft: { pressure: 33, temperature: 96, wear: 18 },
        rearRight: { pressure: 32, temperature: 95, wear: 19 }
      },
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        speed: 35
      }
    };
    
    const response = await axios.post(`${API_BASE}/next-level/iot/vehicles/test-connection/telemetry`, telemetryData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Failed to update vehicle telemetry');
    }
  });

  await runTest('IoT - Get Vehicle Telemetry', async () => {
    const response = await axios.get(`${API_BASE}/next-level/iot/vehicles/test-vehicle-123/telemetry?timeframe=24h&includeHistory=true`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Failed to get vehicle telemetry');
    }
  });

  await runTest('IoT - Get Connected Vehicles', async () => {
    const response = await axios.get(`${API_BASE}/next-level/iot/vehicles`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Failed to get connected vehicles');
    }
  });

  await runTest('IoT - Get Statistics', async () => {
    const response = await axios.get(`${API_BASE}/next-level/iot/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.totalConnectedVehicles) {
      throw new Error('Failed to get IoT statistics');
    }
  });

  await runTest('IoT - Health Check', async () => {
    const response = await axios.get(`${API_BASE}/next-level/iot/health`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.status) {
      throw new Error('Failed to get IoT health status');
    }
  });
};

// Test Blockchain Features
const testBlockchain = async () => {
  await runTest('Blockchain - Get Status', async () => {
    const response = await axios.get(`${API_BASE}/next-level/blockchain/status`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.totalBlocks) {
      throw new Error('Failed to get blockchain status');
    }
  });

  await runTest('Blockchain - Add Transaction', async () => {
    const transaction = {
      from: 'user-123',
      to: 'contract-456',
      data: {
        action: 'test',
        message: 'Test transaction'
      },
      amount: 0
    };
    
    const response = await axios.post(`${API_BASE}/next-level/blockchain/transactions`, transaction, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.id) {
      throw new Error('Failed to add transaction to blockchain');
    }
  });

  await runTest('Blockchain - Execute Smart Contract', async () => {
    const response = await axios.post(`${API_BASE}/next-level/blockchain/contracts/serviceHistory/addServiceRecord`, {
      vehicleId: 'test-vehicle-123',
      serviceType: 'oil_change',
      description: 'Regular oil change',
      cost: 45.00,
      date: new Date().toISOString(),
      mechanicId: 'mechanic-123',
      mileage: 50000
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.id) {
      throw new Error('Failed to execute smart contract');
    }
  });

  await runTest('Blockchain - Get Vehicle Transactions', async () => {
    const response = await axios.get(`${API_BASE}/next-level/blockchain/vehicles/test-vehicle-123/transactions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Failed to get vehicle transactions');
    }
  });

  await runTest('Blockchain - Get Statistics', async () => {
    const response = await axios.get(`${API_BASE}/next-level/blockchain/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.totalBlocks) {
      throw new Error('Failed to get blockchain statistics');
    }
  });

  await runTest('Blockchain - Add Node', async () => {
    const response = await axios.post(`${API_BASE}/next-level/blockchain/nodes`, {
      nodeAddress: 'http://node.example.com:3000'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Failed to add node to network');
    }
  });

  await runTest('Blockchain - Get Network Nodes', async () => {
    const response = await axios.get(`${API_BASE}/next-level/blockchain/nodes`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Failed to get network nodes');
    }
  });

  await runTest('Blockchain - Sync Blockchain', async () => {
    const response = await axios.post(`${API_BASE}/next-level/blockchain/sync`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success) {
      throw new Error('Failed to sync blockchain');
    }
  });

  await runTest('Blockchain - Health Check', async () => {
    const response = await axios.get(`${API_BASE}/next-level/blockchain/health`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.status) {
      throw new Error('Failed to get blockchain health status');
    }
  });
};

// Test Combined Features
const testCombinedFeatures = async () => {
  await runTest('Next-Level Features - Get Status', async () => {
    const response = await axios.get(`${API_BASE}/next-level/status`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.edgeComputing) {
      throw new Error('Failed to get next-level features status');
    }
  });

  await runTest('Next-Level Features - Get Statistics', async () => {
    const response = await axios.get(`${API_BASE}/next-level/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.success || !response.data.data.edgeComputing) {
      throw new Error('Failed to get next-level features statistics');
    }
  });
};

// Main test execution
const runAllTests = async () => {
  log('🚀 Starting Next-Level Features Test Suite...', 'info');
  const startTime = Date.now();
  
  try {
    // Authenticate first
    await authenticate();
    
    // Run all test categories
    await testEdgeComputing();
    await testGraphQL();
    await testIoT();
    await testBlockchain();
    await testCombinedFeatures();
    
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
    log('- Verify all next-level services are running and accessible', 'warning');
    log('- Ensure proper environment variables are set', 'warning');
    log('- Check database connectivity and permissions', 'warning');
    log('- Verify API versioning and feature flags are configured', 'warning');
  } else {
    log('\n🎉 All next-level features tests passed! System is ready for production.', 'success');
  }
  
  process.exit(testResults.failed > 0 ? 1 : 0);
};

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  log('Usage: node test-next-level-features.js [options]', 'info');
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
