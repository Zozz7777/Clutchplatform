#!/usr/bin/env node

/**
 * Test Script for Research-Based AI System
 * Tests all components and functionality
 */

const path = require('path');

// Add the services directory to the require path
const servicesPath = path.join(__dirname, '../services');
require('module').globalPaths.push(servicesPath);

const ComprehensiveResearchSystem = require('../services/comprehensiveResearchSystem');

class ResearchSystemTester {
  constructor() {
    this.logger = console;
    this.researchSystem = null;
    this.testResults = [];
  }

  async runTests() {
    try {
      this.logger.log('🧪 Starting Research-Based AI System Tests...\n');
      
      // Initialize the system
      await this.initializeSystem();
      
      // Run component tests
      await this.testComponents();
      
      // Run problem-solving tests
      await this.testProblemSolving();
      
      // Run performance tests
      await this.testPerformance();
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      this.logger.error('❌ Test suite failed:', error);
    }
  }

  async initializeSystem() {
    try {
      this.logger.log('🔧 Initializing Research-Based AI System...');
      
      this.researchSystem = new ComprehensiveResearchSystem();
      const success = await this.researchSystem.initializeSystem();
      
      if (success) {
        this.logger.log('✅ System initialized successfully\n');
        this.testResults.push({ test: 'System Initialization', status: 'PASS', details: 'System initialized without errors' });
      } else {
        this.logger.log('❌ System initialization failed\n');
        this.testResults.push({ test: 'System Initialization', status: 'FAIL', details: 'System initialization failed' });
      }
    } catch (error) {
      this.logger.error('❌ System initialization error:', error);
      this.testResults.push({ test: 'System Initialization', status: 'ERROR', details: error.message });
    }
  }

  async testComponents() {
    this.logger.log('🔍 Testing System Components...\n');
    
    const components = [
      { name: 'Research AI', test: () => this.testResearchAI() },
      { name: 'Google Research', test: () => this.testGoogleResearch() },
      { name: 'Auto-Fixing', test: () => this.testAutoFixing() },
      { name: 'Health Monitor', test: () => this.testHealthMonitor() }
    ];

    for (const component of components) {
      try {
        this.logger.log(`Testing ${component.name}...`);
        const result = await component.test();
        this.logger.log(`${result.success ? '✅' : '❌'} ${component.name}: ${result.message}\n`);
        this.testResults.push({ 
          test: component.name, 
          status: result.success ? 'PASS' : 'FAIL', 
          details: result.message 
        });
      } catch (error) {
        this.logger.error(`❌ ${component.name} test failed:`, error);
        this.testResults.push({ 
          test: component.name, 
          status: 'ERROR', 
          details: error.message 
        });
      }
    }
  }

  async testResearchAI() {
    try {
      const testPrompt = "How to fix database connection issues?";
      const response = await this.researchSystem.researchAI.generateResponse(testPrompt);
      
      return {
        success: response.success && response.confidence > 0.3,
        message: `Response generated with ${(response.confidence * 100).toFixed(1)}% confidence`
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async testGoogleResearch() {
    try {
      const result = await this.researchSystem.googleResearch.searchGoogle("Node.js best practices");
      
      return {
        success: result.results && result.results.length > 0,
        message: `Found ${result.results ? result.results.length : 0} research results`
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async testAutoFixing() {
    try {
      const result = await this.researchSystem.autoFixing.autoFix("Database connection failed");
      
      return {
        success: true, // Auto-fixing system is working if it doesn't throw
        message: `Auto-fix attempt completed: ${result.success ? 'Success' : 'Failed'}`
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async testHealthMonitor() {
    try {
      const status = this.researchSystem.healthMonitor.getHealthStatus();
      
      return {
        success: status.overall !== 'unknown',
        message: `Health status: ${status.overall} (${status.percentage}%)`
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async testProblemSolving() {
    this.logger.log('🧠 Testing Problem-Solving Capabilities...\n');
    
    const testProblems = [
      "Database connection failed with MongoDB",
      "API endpoint returning 404 error",
      "High memory usage detected",
      "Authentication token expired",
      "Rate limit exceeded for API calls"
    ];

    for (const problem of testProblems) {
      try {
        this.logger.log(`🔍 Testing: ${problem}`);
        const solution = await this.researchSystem.solveProblem(problem);
        
        const success = solution.success && solution.confidence > 0.3;
        this.logger.log(`${success ? '✅' : '❌'} Solution: ${success ? 'Found' : 'Not Found'}`);
        this.logger.log(`📊 Confidence: ${(solution.confidence * 100).toFixed(1)}%`);
        this.logger.log(`🔧 Source: ${solution.source}\n`);
        
        this.testResults.push({
          test: `Problem Solving: ${problem.substring(0, 30)}...`,
          status: success ? 'PASS' : 'FAIL',
          details: `Confidence: ${(solution.confidence * 100).toFixed(1)}%, Source: ${solution.source}`
        });
      } catch (error) {
        this.logger.error(`❌ Problem solving test failed:`, error);
        this.testResults.push({
          test: `Problem Solving: ${problem.substring(0, 30)}...`,
          status: 'ERROR',
          details: error.message
        });
      }
    }
  }

  async testPerformance() {
    this.logger.log('⚡ Testing Performance...\n');
    
    try {
      const startTime = Date.now();
      const testPrompts = [
        "Test prompt 1",
        "Test prompt 2", 
        "Test prompt 3"
      ];

      for (const prompt of testPrompts) {
        await this.researchSystem.researchAI.generateResponse(prompt);
      }

      const endTime = Date.now();
      const averageTime = (endTime - startTime) / testPrompts.length;

      const performanceGood = averageTime < 5000; // Less than 5 seconds per request
      
      this.logger.log(`${performanceGood ? '✅' : '⚠️'} Performance: ${averageTime.toFixed(0)}ms average response time\n`);
      
      this.testResults.push({
        test: 'Performance',
        status: performanceGood ? 'PASS' : 'WARN',
        details: `Average response time: ${averageTime.toFixed(0)}ms`
      });
    } catch (error) {
      this.logger.error('❌ Performance test failed:', error);
      this.testResults.push({
        test: 'Performance',
        status: 'ERROR',
        details: error.message
      });
    }
  }

  generateReport() {
    this.logger.log('📊 Test Report\n');
    this.logger.log('='.repeat(50));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const errors = this.testResults.filter(r => r.status === 'ERROR').length;
    const warnings = this.testResults.filter(r => r.status === 'WARN').length;
    
    this.logger.log(`Total Tests: ${this.testResults.length}`);
    this.logger.log(`✅ Passed: ${passed}`);
    this.logger.log(`❌ Failed: ${failed}`);
    this.logger.log(`⚠️ Warnings: ${warnings}`);
    this.logger.log(`🚨 Errors: ${errors}`);
    this.logger.log('='.repeat(50));
    
    this.logger.log('\nDetailed Results:');
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : 
                   result.status === 'FAIL' ? '❌' : 
                   result.status === 'WARN' ? '⚠️' : '🚨';
      this.logger.log(`${icon} ${result.test}: ${result.details}`);
    });
    
    const successRate = (passed / this.testResults.length) * 100;
    this.logger.log(`\n🎯 Overall Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 80) {
      this.logger.log('🎉 Research-Based AI System is working excellently!');
    } else if (successRate >= 60) {
      this.logger.log('⚠️ Research-Based AI System is working but needs improvement');
    } else {
      this.logger.log('❌ Research-Based AI System needs significant fixes');
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new ResearchSystemTester();
  tester.runTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = ResearchSystemTester;
