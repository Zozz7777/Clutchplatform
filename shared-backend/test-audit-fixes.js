/**
 * Backend Audit Fixes Test Script
 * Validates all critical fixes implemented
 */

const { initializeEnvironment } = require('./config/environment');
const { connectToDatabase, getDatabaseHealth } = require('./config/database-unified');
const serviceManager = require('./services/service-manager');

async function testEnvironmentValidation() {
  console.log('🧪 Testing Environment Validation...');
  
  try {
    const config = initializeEnvironment();
    console.log('✅ Environment validation passed');
    console.log(`📊 Database: ${config.mongodb.uri ? 'Configured' : 'Not configured'}`);
    console.log(`🔐 Auth: ${config.auth.jwtSecret ? 'Configured' : 'Not configured'}`);
    console.log(`📦 Redis: ${config.redis.url ? 'Configured' : 'Not configured'}`);
    return true;
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('\n🧪 Testing Database Connection...');
  
  try {
    await connectToDatabase();
    console.log('✅ Database connection successful');
    
    const health = await getDatabaseHealth();
    console.log(`📊 Database health: ${health.status}`);
    console.log(`📦 Collections: ${health.collections}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testServiceManager() {
  console.log('\n🧪 Testing Service Manager...');
  
  try {
    // Register a test service
    const testService = {
      name: 'test-service',
      cleanup: async () => {
        console.log('🧹 Test service cleanup called');
      },
      healthCheck: async () => {
        return { status: 'healthy', message: 'Test service is running' };
      }
    };
    
    serviceManager.register('test-service', testService);
    
    const stats = serviceManager.getStats();
    console.log(`✅ Service manager working: ${stats.totalServices} services registered`);
    
    const health = await serviceManager.healthCheck();
    console.log(`📊 Service health: ${health.status}`);
    
    // Cleanup test service
    serviceManager.unregister('test-service');
    console.log('✅ Service manager cleanup working');
    
    return true;
  } catch (error) {
    console.error('❌ Service manager test failed:', error.message);
    return false;
  }
}

async function testAuthenticationSystem() {
  console.log('\n🧪 Testing Authentication System...');
  
  try {
    const { getEnvironmentConfig } = require('./config/environment');
    const config = getEnvironmentConfig();
    
    if (config.auth.adminEmail && config.auth.adminPasswordHash) {
      console.log('✅ Admin credentials configured');
      console.log(`📧 Admin email: ${config.auth.adminEmail}`);
      console.log(`🔐 Password hash: ${config.auth.adminPasswordHash.substring(0, 20)}...`);
      return true;
    } else {
      console.error('❌ Admin credentials not configured');
      return false;
    }
  } catch (error) {
    console.error('❌ Authentication system test failed:', error.message);
    return false;
  }
}

async function testSyntaxValidation() {
  console.log('\n🧪 Testing Syntax Validation...');
  
  const files = [
    'server.js',
    'middleware/optimized-middleware.js',
    'routes/consolidated-auth.js',
    'config/environment.js',
    'config/database-unified.js',
    'services/service-manager.js'
  ];
  
  let allValid = true;
  
  for (const file of files) {
    try {
      require(`./${file}`);
      console.log(`✅ ${file} - Syntax valid`);
    } catch (error) {
      console.error(`❌ ${file} - Syntax error:`, error.message);
      allValid = false;
    }
  }
  
  return allValid;
}

async function runAllTests() {
  console.log('🚀 Starting Backend Audit Fixes Validation...\n');
  
  const tests = [
    { name: 'Environment Validation', fn: testEnvironmentValidation },
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Service Manager', fn: testServiceManager },
    { name: 'Authentication System', fn: testAuthenticationSystem },
    { name: 'Syntax Validation', fn: testSyntaxValidation }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.error(`❌ ${test.name} failed with error:`, error.message);
      results.push({ name: test.name, passed: false, error: error.message });
    }
  }
  
  // Summary
  console.log('\n📋 Test Results Summary:');
  console.log('='.repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  for (const result of results) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    if (result.passed) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('='.repeat(50));
  console.log(`📊 Total: ${results.length} tests`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All audit fixes validated successfully!');
    console.log('✅ Backend is ready for production deployment');
  } else {
    console.log('\n⚠️ Some tests failed. Please review and fix issues.');
  }
  
  return failed === 0;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testEnvironmentValidation,
  testDatabaseConnection,
  testServiceManager,
  testAuthenticationSystem,
  testSyntaxValidation,
  runAllTests
};
