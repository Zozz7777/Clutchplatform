require('dotenv').config();
const { connectDB } = require('../config/database');
const costOptimizationService = require('../services/costOptimizationService');

async function testCostOptimizationService() {
    // Connect to database first
    await connectDB();
    console.log('💰 Testing Cost Optimization Service...\n');

    try {
        // Test 1: Get optimization status
        console.log('1. Testing optimization status...');
        const status = await costOptimizationService.getOptimizationStatus();
        console.log('✅ Optimization status:', status);

        // Test 2: Monitor system resources
        console.log('\n2. Testing system resource monitoring...');
        await costOptimizationService.monitorSystemResources();
        console.log('✅ System resources monitored');

        // Test 3: Monitor database performance
        console.log('\n3. Testing database performance monitoring...');
        await costOptimizationService.monitorDatabasePerformance();
        console.log('✅ Database performance monitored');

        // Test 4: Monitor Redis performance
        console.log('\n4. Testing Redis performance monitoring...');
        await costOptimizationService.monitorRedisPerformance();
        console.log('✅ Redis performance monitored');

        // Test 5: Generate cost report
        console.log('\n5. Testing cost report generation...');
        const costReport = await costOptimizationService.generateCostReport();
        console.log('✅ Cost report generated');
        if (costReport) {
            console.log('System costs:', costReport.system.estimatedCost);
            console.log('Database costs:', costReport.database.estimatedCost);
            console.log('Redis costs:', costReport.redis.estimatedCost);
            console.log('Recommendations:', costReport.recommendations.length);
        }

        // Test 6: Test database optimizations
        console.log('\n6. Testing database optimizations...');
        await costOptimizationService.optimizeDatabaseQueries();
        console.log('✅ Database optimizations applied');

        // Test 7: Test Redis optimizations
        console.log('\n7. Testing Redis optimizations...');
        await costOptimizationService.optimizeRedisCaching();
        console.log('✅ Redis optimizations applied');

        console.log('\n🎉 All Cost Optimization Service tests passed!');
        return true;
    } catch (error) {
        console.error('❌ Cost Optimization Service test failed:', error.message);
        return false;
    }
}

// Run tests if called directly
if (require.main === module) {
    testCostOptimizationService().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { testCostOptimizationService };
