#!/usr/bin/env node

/**
 * Script to test fixes for similar issues to 0% success rate
 */

const path = require('path');

// Add the services directory to the require path
const servicesPath = path.join(__dirname, '../services');
require('module').globalPaths.push(servicesPath);

const ComprehensiveResearchSystem = require('../services/comprehensiveResearchSystem');
const EnhancedAutonomousSystemOrchestrator = require('../services/enhancedAutonomousSystemOrchestrator');
const FixedHealthMonitor = require('../services/fixedHealthMonitor');

class SimilarIssuesTester {
  constructor() {
    this.logger = console;
    this.testResults = [];
  }

  async testAllSimilarIssues() {
    try {
      this.logger.log('🔍 Testing Similar Issues Fixes...\n');
      
      // Test 1: Health Monitor Status
      await this.testHealthMonitorStatus();
      
      // Test 2: AI Provider Usage Tracking
      await this.testAIProviderUsageTracking();
      
      // Test 3: Learning System Metrics
      await this.testLearningSystemMetrics();
      
      // Test 4: Success Rate Tracking
      await this.testSuccessRateTracking();
      
      // Test 5: Research System Integration
      await this.testResearchSystemIntegration();
      
      // Display results
      this.displayResults();
      
    } catch (error) {
      this.logger.error('❌ Testing failed:', error);
    }
  }

  async testHealthMonitorStatus() {
    try {
      this.logger.log('🏥 Testing Health Monitor Status...');
      
      const healthMonitor = new FixedHealthMonitor();
      const status = healthMonitor.getHealthStatus();
      
      const testResult = {
        test: 'Health Monitor Status',
        success: status.overall !== 'unknown' && status.percentage > 0,
        details: `Status: ${status.overall}, Percentage: ${status.percentage}%`,
        expected: 'Status should not be "unknown" and percentage > 0'
      };
      
      this.testResults.push(testResult);
      this.logger.log(`✅ ${testResult.success ? 'PASS' : 'FAIL'}: ${testResult.details}`);
      
    } catch (error) {
      this.testResults.push({
        test: 'Health Monitor Status',
        success: false,
        details: `Error: ${error.message}`,
        expected: 'Should initialize with healthy status'
      });
    }
  }

  async testAIProviderUsageTracking() {
    try {
      this.logger.log('🤖 Testing AI Provider Usage Tracking...');
      
      const orchestrator = new EnhancedAutonomousSystemOrchestrator();
      const systemState = orchestrator.systemState;
      
      const testResult = {
        test: 'AI Provider Usage Tracking',
        success: systemState.aiProviderUsage > 0 && systemState.totalOperations > 0,
        details: `AI Usage: ${(systemState.aiProviderUsage * 100).toFixed(1)}%, Operations: ${systemState.totalOperations}`,
        expected: 'AI provider usage should be > 0 and operations should be tracked'
      };
      
      this.testResults.push(testResult);
      this.logger.log(`✅ ${testResult.success ? 'PASS' : 'FAIL'}: ${testResult.details}`);
      
    } catch (error) {
      this.testResults.push({
        test: 'AI Provider Usage Tracking',
        success: false,
        details: `Error: ${error.message}`,
        expected: 'Should track AI provider usage'
      });
    }
  }

  async testLearningSystemMetrics() {
    try {
      this.logger.log('🧠 Testing Learning System Metrics...');
      
      const orchestrator = new EnhancedAutonomousSystemOrchestrator();
      const learningStats = orchestrator.enhancedLearningSystem.getLearningStatistics();
      
      const testResult = {
        test: 'Learning System Metrics',
        success: learningStats.totalProblems > 0 && learningStats.successRate > 0,
        details: `Problems: ${learningStats.totalProblems}, Success Rate: ${(learningStats.successRate * 100).toFixed(1)}%`,
        expected: 'Should have baseline problems and success rate > 0'
      };
      
      this.testResults.push(testResult);
      this.logger.log(`✅ ${testResult.success ? 'PASS' : 'FAIL'}: ${testResult.details}`);
      
    } catch (error) {
      this.testResults.push({
        test: 'Learning System Metrics',
        success: false,
        details: `Error: ${error.message}`,
        expected: 'Should initialize with baseline metrics'
      });
    }
  }

  async testSuccessRateTracking() {
    try {
      this.logger.log('📊 Testing Success Rate Tracking...');
      
      const researchSystem = new ComprehensiveResearchSystem();
      await researchSystem.initializeSystem();
      
      const status = researchSystem.getSystemStatus();
      
      const testResult = {
        test: 'Success Rate Tracking',
        success: status.metrics.successRate > 0 && status.metrics.totalProblemsSolved >= 0,
        details: `Success Rate: ${(status.metrics.successRate * 100).toFixed(1)}%, Problems: ${status.metrics.totalProblemsSolved}`,
        expected: 'Should have realistic success rate and track problems'
      };
      
      this.testResults.push(testResult);
      this.logger.log(`✅ ${testResult.success ? 'PASS' : 'FAIL'}: ${testResult.details}`);
      
    } catch (error) {
      this.testResults.push({
        test: 'Success Rate Tracking',
        success: false,
        details: `Error: ${error.message}`,
        expected: 'Should track success rate properly'
      });
    }
  }

  async testResearchSystemIntegration() {
    try {
      this.logger.log('🔬 Testing Research System Integration...');
      
      const researchSystem = new ComprehensiveResearchSystem();
      await researchSystem.initializeSystem();
      
      // Test solving a simple problem
      const result = await researchSystem.solveProblem("Test database connection issue");
      
      const testResult = {
        test: 'Research System Integration',
        success: result !== null && typeof result === 'object',
        details: `Result: ${result.success ? 'Success' : 'Failed'}, Source: ${result.source || 'unknown'}`,
        expected: 'Should return a valid result object'
      };
      
      this.testResults.push(testResult);
      this.logger.log(`✅ ${testResult.success ? 'PASS' : 'FAIL'}: ${testResult.details}`);
      
    } catch (error) {
      this.testResults.push({
        test: 'Research System Integration',
        success: false,
        details: `Error: ${error.message}`,
        expected: 'Should integrate properly with research system'
      });
    }
  }

  displayResults() {
    this.logger.log('\n📊 Test Results Summary:');
    this.logger.log('='.repeat(50));
    
    let passed = 0;
    let failed = 0;
    
    this.testResults.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      this.logger.log(`${icon} ${result.test}: ${result.details}`);
      this.logger.log(`   Expected: ${result.expected}`);
      
      if (result.success) {
        passed++;
      } else {
        failed++;
      }
    });
    
    const successRate = (passed / this.testResults.length) * 100;
    this.logger.log(`\n🎯 Overall Success Rate: ${successRate.toFixed(1)}%`);
    this.logger.log(`✅ Passed: ${passed}`);
    this.logger.log(`❌ Failed: ${failed}`);
    
    if (successRate >= 80) {
      this.logger.log('\n🎉 Similar Issues Fixes are working excellently!');
    } else if (successRate >= 60) {
      this.logger.log('\n⚠️ Similar Issues Fixes are working but need improvement');
    } else {
      this.logger.log('\n❌ Similar Issues Fixes need significant work');
    }
  }
}

// Run if this script is executed directly
if (require.main === module) {
  const tester = new SimilarIssuesTester();
  tester.testAllSimilarIssues().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = SimilarIssuesTester;
