#!/usr/bin/env node

/**
 * Endpoint Testing Runner
 * Runs comprehensive endpoint tests against the Clutch API Server
 */

const ComprehensiveEndpointTester = require('./comprehensive-endpoint-testing');
const fs = require('fs').promises;
const path = require('path');

async function runEndpointTests() {
  console.log('🚀 Starting Comprehensive Endpoint Testing for Clutch API Server');
  console.log('🎯 Target: https://clutch-main-nk7x.onrender.com');
  console.log('=' * 80);

  const tester = new ComprehensiveEndpointTester();
  
  try {
    // Run all tests
    await tester.runComprehensiveTests();
    
    // Save detailed results to file
    const reportPath = path.join(__dirname, 'endpoint-test-results.json');
    await fs.writeFile(reportPath, JSON.stringify(tester.results, null, 2));
    
    console.log(`\n📄 Detailed results saved to: ${reportPath}`);
    
    // Generate summary
    generateSummary(tester.results);
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  }
}

function generateSummary(results) {
  const total = results.total;
  const passed = results.passed;
  const failed = results.failed;
  const skipped = results.skipped;
  const successRate = ((passed / total) * 100).toFixed(2);
  
  console.log('\n' + '=' * 80);
  console.log('📊 ENDPOINT TESTING SUMMARY');
  console.log('=' * 80);
  console.log(`🎯 Target: https://clutch-main-nk7x.onrender.com`);
  console.log(`📅 Test Date: ${new Date().toISOString()}`);
  console.log(`⏱️ Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed} (${successRate}%)`);
  console.log(`❌ Failed: ${failed} (${((failed / total) * 100).toFixed(2)}%)`);
  console.log(`⏭️ Skipped: ${skipped || 0} (${(((skipped || 0) / total) * 100).toFixed(2)}%)`);
  
  // Expected failure analysis
  const expectedFailures = analyzeExpectedFailures(results);
  console.log(`\n🔍 EXPECTED FAILURE ANALYSIS:`);
  console.log(`   • Authentication endpoints: ${expectedFailures.auth} failures (expected - no valid credentials)`);
  console.log(`   • Admin endpoints: ${expectedFailures.admin} failures (expected - requires admin access)`);
  console.log(`   • Protected endpoints: ${expectedFailures.protected} failures (expected - requires authentication)`);
  console.log(`   • Non-existent endpoints: ${expectedFailures.notFound} failures (expected - 404 responses)`);
  console.log(`   • Other failures: ${expectedFailures.other} failures (may indicate real issues)`);
  
  // Performance analysis
  const performanceAnalysis = analyzePerformance(results);
  console.log(`\n⚡ PERFORMANCE ANALYSIS:`);
  console.log(`   • Average response time: ${performanceAnalysis.avgResponseTime}ms`);
  console.log(`   • Fastest response: ${performanceAnalysis.fastest}ms`);
  console.log(`   • Slowest response: ${performanceAnalysis.slowest}ms`);
  console.log(`   • Responses under 100ms: ${performanceAnalysis.fastResponses} (${performanceAnalysis.fastResponseRate}%)`);
  
  // Endpoint coverage
  const coverage = analyzeCoverage(results);
  console.log(`\n📋 ENDPOINT COVERAGE:`);
  console.log(`   • Unique endpoints tested: ${coverage.uniqueEndpoints}`);
  console.log(`   • HTTP methods covered: ${coverage.methods.join(', ')}`);
  console.log(`   • API versions tested: ${coverage.versions.join(', ')}`);
  
  // Recommendations
  console.log(`\n💡 RECOMMENDATIONS:`);
  if (expectedFailures.other > 0) {
    console.log(`   • Investigate ${expectedFailures.other} unexpected failures`);
  }
  if (performanceAnalysis.avgResponseTime > 1000) {
    console.log(`   • Consider optimizing slow endpoints (avg ${performanceAnalysis.avgResponseTime}ms)`);
  }
  if (coverage.uniqueEndpoints < 50) {
    console.log(`   • Consider testing more endpoints for better coverage`);
  }
  
  console.log('\n' + '=' * 80);
  console.log('🏁 ENDPOINT TESTING COMPLETE');
  console.log('=' * 80);
}

function analyzeExpectedFailures(results) {
  const failures = results.details.filter(test => test.status === 'FAILED');
  
  return {
    auth: failures.filter(test => 
      test.path.includes('/auth/') && 
      (test.statusCode === 401 || test.statusCode === 403)
    ).length,
    admin: failures.filter(test => 
      test.path.includes('/admin/') && 
      (test.statusCode === 401 || test.statusCode === 403)
    ).length,
    protected: failures.filter(test => 
      test.requiresAuth && 
      (test.statusCode === 401 || test.statusCode === 403)
    ).length,
    notFound: failures.filter(test => 
      test.statusCode === 404
    ).length,
    other: failures.filter(test => 
      !test.path.includes('/auth/') && 
      !test.path.includes('/admin/') && 
      !test.requiresAuth && 
      test.statusCode !== 404
    ).length
  };
}

function analyzePerformance(results) {
  const testsWithDuration = results.details.filter(test => test.duration);
  const durations = testsWithDuration.map(test => test.duration);
  
  const avgResponseTime = Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length);
  const fastest = Math.min(...durations);
  const slowest = Math.max(...durations);
  const fastResponses = durations.filter(d => d < 100).length;
  const fastResponseRate = ((fastResponses / durations.length) * 100).toFixed(1);
  
  return {
    avgResponseTime,
    fastest,
    slowest,
    fastResponses,
    fastResponseRate
  };
}

function analyzeCoverage(results) {
  const uniqueEndpoints = new Set(results.details.map(test => `${test.method} ${test.path}`));
  const methods = [...new Set(results.details.map(test => test.method))];
  const versions = [...new Set(results.details
    .map(test => test.path.match(/\/api\/v(\d+)/))
    .filter(match => match)
    .map(match => `v${match[1]}`)
  )];
  
  return {
    uniqueEndpoints: uniqueEndpoints.size,
    methods: methods.sort(),
    versions: versions.sort()
  };
}

// Run the tests
if (require.main === module) {
  runEndpointTests().catch(console.error);
}

module.exports = { runEndpointTests, generateSummary };
