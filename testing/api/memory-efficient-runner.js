/**
 * Memory-Efficient Test Runner
 * Coordinates phased testing of 1,247+ endpoints across 100+ route files
 * Prevents server memory threshold triggers
 */

const PhasedEndpointTester = require('./phased-endpoint-testing');
const RouteFileGenerator = require('./route-file-generator');
const fs = require('fs').promises;
const path = require('path');

class MemoryEfficientRunner {
  constructor() {
    this.baseUrl = 'https://clutch-main-nk7x.onrender.com';
    this.results = {
      totalEndpoints: 0,
      totalRouteFiles: 0,
      phases: [],
      memoryUsage: [],
      startTime: null,
      endTime: null
    };
    this.memoryThreshold = 80; // 80% memory threshold
    this.gcInterval = 30000; // 30 seconds
    this.gcTimer = null;
  }

  /**
   * Run complete memory-efficient testing
   */
  async runCompleteTesting() {
    console.log('🚀 Starting Memory-Efficient Endpoint Testing');
    console.log('📊 Target: 1,247+ endpoints across 100+ route files');
    console.log('🧠 Memory management: Active garbage collection');
    console.log('⏱️ Phased execution: Prevents server overload');
    console.log('=' * 80);

    this.results.startTime = new Date();

    try {
      // Step 1: Generate route files
      console.log('\n📁 STEP 1: Generating Route Files...');
      const routeFiles = await this.generateRouteFiles();
      this.results.totalRouteFiles = routeFiles.length;

      // Step 2: Start memory monitoring
      console.log('\n🧠 STEP 2: Starting Memory Monitoring...');
      this.startMemoryMonitoring();

      // Step 3: Run phased endpoint testing
      console.log('\n🔄 STEP 3: Running Phased Endpoint Testing...');
      const endpointResults = await this.runPhasedTesting();

      // Step 4: Stop memory monitoring
      console.log('\n⏹️ STEP 4: Stopping Memory Monitoring...');
      this.stopMemoryMonitoring();

      // Step 5: Generate comprehensive report
      console.log('\n📊 STEP 5: Generating Comprehensive Report...');
      await this.generateComprehensiveReport(endpointResults);

      this.results.endTime = new Date();
      console.log('\n✅ Memory-Efficient Testing Complete!');

    } catch (error) {
      console.error('❌ Memory-efficient testing failed:', error);
      this.stopMemoryMonitoring();
      throw error;
    }
  }

  /**
   * Generate route files
   */
  async generateRouteFiles() {
    const generator = new RouteFileGenerator();
    const routeFiles = await generator.generateAllRouteFiles();
    
    console.log(`✅ Generated ${routeFiles.length} route files`);
    console.log(`📊 Total endpoints across all files: ${this.calculateTotalEndpoints(routeFiles)}`);
    
    return routeFiles;
  }

  /**
   * Calculate total endpoints across all route files
   */
  calculateTotalEndpoints(routeFiles) {
    return routeFiles.reduce((total, file) => total + file.endpoints.length, 0);
  }

  /**
   * Run phased endpoint testing
   */
  async runPhasedTesting() {
    const tester = new PhasedEndpointTester();
    
    // Configure memory-efficient settings
    tester.maxConcurrentRequests = 3; // Reduced concurrency
    tester.requestDelay = 200; // Increased delay
    tester.phaseDelay = 3000; // Increased phase delay
    tester.memoryThreshold = this.memoryThreshold;

    // Run all phases
    await tester.runAllPhases();
    
    this.results.totalEndpoints = tester.results.total;
    this.results.phases = tester.results.phases;
    
    return tester.results;
  }

  /**
   * Start memory monitoring
   */
  startMemoryMonitoring() {
    console.log('🧠 Memory monitoring started');
    
    // Monitor memory every 10 seconds
    this.memoryTimer = setInterval(() => {
      this.recordMemoryUsage();
    }, 10000);

    // Force garbage collection every 30 seconds
    this.gcTimer = setInterval(() => {
      this.forceGarbageCollection();
    }, this.gcInterval);
  }

  /**
   * Stop memory monitoring
   */
  stopMemoryMonitoring() {
    if (this.memoryTimer) {
      clearInterval(this.memoryTimer);
      this.memoryTimer = null;
    }
    
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
      this.gcTimer = null;
    }
    
    console.log('⏹️ Memory monitoring stopped');
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage() {
    const memUsage = process.memoryUsage();
    const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    const memoryRecord = {
      timestamp: new Date(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      percentage: memPercent
    };
    
    this.results.memoryUsage.push(memoryRecord);
    
    if (memPercent > this.memoryThreshold) {
      console.log(`⚠️ High memory usage: ${memPercent.toFixed(2)}%`);
      this.forceGarbageCollection();
    }
  }

  /**
   * Force garbage collection
   */
  forceGarbageCollection() {
    if (global.gc) {
      const beforeGC = process.memoryUsage();
      global.gc();
      const afterGC = process.memoryUsage();
      
      const freed = beforeGC.heapUsed - afterGC.heapUsed;
      console.log(`🗑️ Garbage collection: Freed ${(freed / 1024 / 1024).toFixed(2)} MB`);
    } else {
      console.log('⚠️ Garbage collection not available (run with --expose-gc)');
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateComprehensiveReport(endpointResults) {
    const report = {
      summary: {
        totalEndpoints: this.results.totalEndpoints,
        totalRouteFiles: this.results.totalRouteFiles,
        totalPassed: endpointResults.passed,
        totalFailed: endpointResults.failed,
        totalSkipped: endpointResults.skipped,
        successRate: ((endpointResults.passed / endpointResults.total) * 100).toFixed(2),
        duration: this.results.endTime - this.results.startTime,
        startTime: this.results.startTime,
        endTime: this.results.endTime
      },
      phases: this.results.phases,
      memoryUsage: this.results.memoryUsage,
      recommendations: this.generateRecommendations(endpointResults)
    };

    // Save detailed report
    const reportPath = path.join(__dirname, 'memory-efficient-test-results.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Detailed report saved to: ${reportPath}`);
    
    // Display summary
    this.displaySummary(report);
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(endpointResults) {
    const recommendations = [];
    
    if (endpointResults.failed > endpointResults.passed) {
      recommendations.push('High failure rate detected - investigate server issues');
    }
    
    const avgMemory = this.results.memoryUsage.reduce((sum, mem) => sum + mem.percentage, 0) / this.results.memoryUsage.length;
    if (avgMemory > 70) {
      recommendations.push('High memory usage detected - consider optimizing memory management');
    }
    
    const duration = this.results.endTime - this.results.startTime;
    if (duration > 300000) { // 5 minutes
      recommendations.push('Long test duration - consider reducing test scope or improving performance');
    }
    
    if (endpointResults.skipped > 0) {
      recommendations.push('Some tests were skipped - review skipped test categories');
    }
    
    return recommendations;
  }

  /**
   * Display summary
   */
  displaySummary(report) {
    console.log('\n' + '=' * 80);
    console.log('📊 MEMORY-EFFICIENT TESTING SUMMARY');
    console.log('=' * 80);
    console.log(`🎯 Target: ${this.baseUrl}`);
    console.log(`📅 Test Date: ${report.summary.startTime.toISOString()}`);
    console.log(`⏱️ Duration: ${(report.summary.duration / 1000).toFixed(2)} seconds`);
    console.log(`📁 Route Files: ${report.summary.totalRouteFiles}`);
    console.log(`🔗 Total Endpoints: ${report.summary.totalEndpoints}`);
    console.log(`✅ Passed: ${report.summary.totalPassed}`);
    console.log(`❌ Failed: ${report.summary.totalFailed}`);
    console.log(`⏭️ Skipped: ${report.summary.totalSkipped}`);
    console.log(`📈 Success Rate: ${report.summary.successRate}%`);
    
    // Memory usage summary
    if (report.memoryUsage.length > 0) {
      const avgMemory = report.memoryUsage.reduce((sum, mem) => sum + mem.percentage, 0) / report.memoryUsage.length;
      const maxMemory = Math.max(...report.memoryUsage.map(mem => mem.percentage));
      const minMemory = Math.min(...report.memoryUsage.map(mem => mem.percentage));
      
      console.log(`\n🧠 MEMORY USAGE:`);
      console.log(`   • Average: ${avgMemory.toFixed(2)}%`);
      console.log(`   • Maximum: ${maxMemory.toFixed(2)}%`);
      console.log(`   • Minimum: ${minMemory.toFixed(2)}%`);
      console.log(`   • Samples: ${report.memoryUsage.length}`);
    }
    
    // Phase breakdown
    console.log(`\n📋 PHASE BREAKDOWN:`);
    report.phases.forEach((phase, index) => {
      const successRate = ((phase.passed / phase.total) * 100).toFixed(2);
      console.log(`   Phase ${index + 1}: ${phase.name} - ${phase.passed}/${phase.total} (${successRate}%)`);
    });
    
    // Recommendations
    if (report.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS:`);
      report.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }
    
    console.log('\n' + '=' * 80);
    console.log('🏁 MEMORY-EFFICIENT TESTING COMPLETE');
    console.log('=' * 80);
  }
}

// Export for use
module.exports = MemoryEfficientRunner;

// Run if executed directly
if (require.main === module) {
  const runner = new MemoryEfficientRunner();
  runner.runCompleteTesting().catch(console.error);
}
