#!/usr/bin/env node

/**
 * Comprehensive Testing Pipeline
 * Runs all tests with proper error handling and reporting
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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
  suites: []
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

// Run a single test suite
async function runTestSuite(suite) {
  return new Promise((resolve) => {
    logHeader(`Running ${suite.name}`);
    
    const startTime = Date.now();
    const child = spawn(suite.command, suite.args, {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd()
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      if (process.env.VERBOSE === 'true') {
        process.stdout.write(data);
      }
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
      if (process.env.VERBOSE === 'true') {
        process.stderr.write(data);
      }
    });

    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      logError(`${suite.name} timed out after ${suite.timeout}ms`);
      resolve({
        name: suite.name,
        success: false,
        error: 'Timeout',
        duration: suite.timeout,
        stdout,
        stderr
      });
    }, suite.timeout);

    child.on('close', (code) => {
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      const success = code === 0;

      if (success) {
        logSuccess(`${suite.name} completed successfully in ${duration}ms`);
        testResults.passed++;
      } else {
        logError(`${suite.name} failed with exit code ${code} in ${duration}ms`);
        testResults.failed++;
      }

      testResults.total++;
      testResults.suites.push({
        name: suite.name,
        success,
        exitCode: code,
        duration,
        stdout,
        stderr
      });

      resolve({
        name: suite.name,
        success,
        exitCode: code,
        duration,
        stdout,
        stderr
      });
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      logError(`${suite.name} failed to start: ${error.message}`);
      testResults.failed++;
      testResults.total++;
      testResults.suites.push({
        name: suite.name,
        success: false,
        error: error.message,
        duration: 0
      });
      resolve({
        name: suite.name,
        success: false,
        error: error.message,
        duration: 0
      });
    });
  });
}

// Generate test report
function generateReport() {
  const totalDuration = Date.now() - testResults.startTime;
  const successRate = testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(1) : 0;

  logHeader('Test Results Summary');
  
  log(`Total Suites: ${testResults.total}`, 'bright');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, 'red');
  log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
  log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`, 'blue');

  log('\n📊 Detailed Results:', 'cyan');
  testResults.suites.forEach(suite => {
    const status = suite.success ? '✅' : '❌';
    const duration = `${(suite.duration / 1000).toFixed(2)}s`;
    log(`${status} ${suite.name} - ${duration}`, suite.success ? 'green' : 'red');
    
    if (!suite.success && suite.error) {
      log(`   Error: ${suite.error}`, 'red');
    }
  });

  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: parseFloat(successRate),
      duration: totalDuration
    },
    suites: testResults.suites,
    timestamp: new Date().toISOString()
  }, null, 2));

  log(`\n📄 Detailed report saved to: ${reportPath}`, 'blue');

  return testResults.failed === 0;
}

// Main execution
async function main() {
  logHeader('Comprehensive Testing Pipeline');
  logInfo('Starting comprehensive backend testing...');
  
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    logError('package.json not found. Please run this script from the backend directory.');
    process.exit(1);
  }

  // Test suites to run
  const testSuites = [
    {
      name: 'Health Tests',
      command: 'npm',
      args: ['run', 'test:health'],
      timeout: 120000
    },
    {
      name: 'Unit Tests',
      command: 'npm',
      args: ['run', 'test:unit'],
      timeout: 60000
    },
    {
      name: 'Integration Tests',
      command: 'npm',
      args: ['run', 'test:integration'],
      timeout: 120000
    },
    {
      name: 'API Tests',
      command: 'npm',
      args: ['run', 'test:api'],
      timeout: 180000
    },
    {
      name: 'Security Tests',
      command: 'npm',
      args: ['run', 'test:security'],
      timeout: 90000
    }
  ];

  // Run test suites
  for (const suite of testSuites) {
    try {
      await runTestSuite(suite);
    } catch (error) {
      logError(`Failed to run ${suite.name}: ${error.message}`);
      testResults.failed++;
      testResults.total++;
    }
  }

  // Generate and display report
  const allPassed = generateReport();

  // Exit with appropriate code
  if (allPassed) {
    logSuccess('All tests passed! 🎉');
    process.exit(0);
  } else {
    logError('Some tests failed. Please check the results above.');
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

module.exports = { runTestSuite, generateReport };
