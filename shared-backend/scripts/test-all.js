require('dotenv').config();
const { testAIService } = require('./test-ai');
const { testBackupService } = require('./test-backup');
const { testAnalyticsService } = require('./test-analytics');
const { testCostOptimizationService } = require('./test-cost-optimization');
const { testSecurityMiddleware } = require('./test-security');

async function runAllTests() {
    console.log('🚀 Starting Comprehensive Backend Test Suite...\n');
    console.log('==================================================\n');

    const results = {
        ai: false,
        backup: false,
        analytics: false,
        cost: false,
        security: false
    };

    try {
        // Test AI Service
        console.log('🧠 Testing AI Service...');
        results.ai = await testAIService();
        console.log('');

        // Test Backup Service
        console.log('💾 Testing Backup Service...');
        results.backup = await testBackupService();
        console.log('');

        // Test Analytics Service
        console.log('📊 Testing Analytics Service...');
        results.analytics = await testAnalyticsService();
        console.log('');

        // Test Cost Optimization Service
        console.log('💰 Testing Cost Optimization Service...');
        results.cost = await testCostOptimizationService();
        console.log('');

        // Test Security Middleware
        console.log('🔒 Testing Security Middleware...');
        results.security = await testSecurityMiddleware();
        console.log('');

    } catch (error) {
        console.error('❌ Test suite error:', error.message);
    }

    // Print summary
    console.log('==================================================');
    console.log('📊 COMPREHENSIVE TEST SUMMARY');
    console.log('==================================================');
    console.log(`🧠 AI Service: ${results.ai ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`💾 Backup Service: ${results.backup ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`📊 Analytics Service: ${results.analytics ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`💰 Cost Optimization: ${results.cost ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`🔒 Security Middleware: ${results.security ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('==================================================');

    const allPassed = Object.values(results).every(result => result);
    console.log(`🎉 OVERALL RESULT: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    console.log('==================================================\n');

    return allPassed;
}

// Run tests if called directly
if (require.main === module) {
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { runAllTests };
