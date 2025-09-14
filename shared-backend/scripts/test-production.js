#!/usr/bin/env node

/**
 * Production Testing Script
 * Tests the live Clutch platform at https://clutch-main-nk7x.onrender.com
 */

const https = require('https');
const http = require('http');

// Production server configuration
const PRODUCTION_URL = 'https://clutch-main-nk7x.onrender.com';
const PRODUCTION_HOST = 'clutch-main-nk7x.onrender.com';
const PRODUCTION_PORT = 443;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  startTime: Date.now(),
  tests: []
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`🚀 ${message}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

// Make HTTP request to production server
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: PRODUCTION_HOST,
      port: PRODUCTION_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Clutch-Production-Test/1.0.0'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Run a single test
async function runTest(testName, testFunction) {
  const startTime = Date.now();
  
  try {
    logInfo(`Running: ${testName}`);
    await testFunction();
    const duration = Date.now() - startTime;
    logSuccess(`${testName} - ${duration}ms`);
    testResults.passed++;
    testResults.tests.push({
      name: testName,
      success: true,
      duration,
      error: null
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(`${testName} - ${duration}ms - ${error.message}`);
    testResults.failed++;
    testResults.tests.push({
      name: testName,
      success: false,
      duration,
      error: error.message
    });
  }
  
  testResults.total++;
}

// Test functions
async function testHealthEndpoint() {
  const response = await makeRequest('/health');
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (!response.data.success) {
    throw new Error('Health endpoint should return success: true');
  }
  
  if (!response.data.data) {
    throw new Error('Health endpoint should return data object');
  }
  
  if (response.data.data.environment !== 'production') {
    throw new Error('Environment should be production');
  }
  
  if (response.data.data.status !== 'healthy') {
    throw new Error('Status should be healthy');
  }
}

async function testPingEndpoint() {
  const response = await makeRequest('/ping');
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (!response.data.success) {
    throw new Error('Ping endpoint should return success: true');
  }
}

async function testSystemVersion() {
  const response = await makeRequest('/api/v1/system/version');
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (!response.data.success) {
    throw new Error('System version endpoint should return success: true');
  }
}

async function test404Handling() {
  const response = await makeRequest('/api/v1/non-existent-endpoint');
  
  if (response.statusCode !== 404) {
    throw new Error(`Expected status 404, got ${response.statusCode}`);
  }
  
  if (response.data.success !== false) {
    throw new Error('404 endpoint should return success: false');
  }
}

async function testResponseTime() {
  const start = Date.now();
  await makeRequest('/health');
  const duration = Date.now() - start;
  
  if (duration > 5000) {
    throw new Error(`Response time too slow: ${duration}ms`);
  }
}

async function testConcurrentRequests() {
  const promises = Array(5).fill().map(() => makeRequest('/health'));
  const responses = await Promise.all(promises);
  
  for (const response of responses) {
    if (response.statusCode !== 200) {
      throw new Error(`Concurrent request failed with status ${response.statusCode}`);
    }
  }
}

async function testEndpointAvailability() {
  const response = await makeRequest('/health');
  
  if (!response.data.endpoints) {
    throw new Error('Health endpoint should return endpoints information');
  }
  
  const requiredEndpoints = ['health', 'ping', 'auth', 'admin', 'performance'];
  for (const endpoint of requiredEndpoints) {
    if (!response.data.endpoints[endpoint]) {
      throw new Error(`Missing required endpoint: ${endpoint}`);
    }
  }
}

// Generate test report
function generateReport() {
  const totalDuration = Date.now() - testResults.startTime;
  const successRate = testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(1) : 0;

  logHeader('Production Test Results Summary');
  
  log(`Production Server: ${PRODUCTION_URL}`, 'bright');
  log(`Total Tests: ${testResults.total}`, 'bright');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, 'red');
  log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
  log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`, 'blue');

  log('\n📊 Detailed Results:', 'cyan');
  testResults.tests.forEach(test => {
    const status = test.success ? '✅' : '❌';
    const duration = `${(test.duration / 1000).toFixed(2)}s`;
    log(`${status} ${test.name} - ${duration}`, test.success ? 'green' : 'red');
    
    if (!test.success && test.error) {
      log(`   Error: ${test.error}`, 'red');
    }
  });

  // Save detailed report
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, '..', 'production-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    server: PRODUCTION_URL,
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: parseFloat(successRate),
      duration: totalDuration
    },
    tests: testResults.tests,
    timestamp: new Date().toISOString()
  }, null, 2));

  log(`\n📄 Detailed report saved to: ${reportPath}`, 'blue');

  return testResults.failed === 0;
}

// Main execution
async function main() {
  logHeader('Production Testing Pipeline');
  logInfo(`Testing production server: ${PRODUCTION_URL}`);
  
  // Run all tests
  await runTest('Health Endpoint', testHealthEndpoint);
  await runTest('Ping Endpoint', testPingEndpoint);
  await runTest('System Version', testSystemVersion);
  await runTest('404 Handling', test404Handling);
  await runTest('Response Time', testResponseTime);
  await runTest('Concurrent Requests', testConcurrentRequests);
  await runTest('Endpoint Availability', testEndpointAvailability);

  // Generate and display report
  const allPassed = generateReport();

  // Exit with appropriate code
  if (allPassed) {
    logSuccess('All production tests passed! 🎉');
    process.exit(0);
  } else {
    logError('Some production tests failed. Please check the results above.');
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  logWarning('Test execution interrupted by user');
  generateReport();
  process.exit(1);
});

process.on('SIGTERM', () => {
  logWarning('Test execution terminated');
  generateReport();
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main().catch((error) => {
    logError(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { makeRequest, runTest, generateReport };
