#!/usr/bin/env node

const ComprehensiveBackendTestSuite = require('./comprehensive-backend-test-suite');
const DeploymentReadinessChecklist = require('./deployment-readiness-checklist');
const fs = require('fs');
const path = require('path');

class ComprehensiveTestRunner {
  constructor() {
    this.results = {
      testSuite: null,
      checklist: null,
      overall: {
        ready: false,
        score: 0,
        recommendations: []
      }
    };
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Backend Testing & Deployment Readiness Check...\n');
    console.log('=' * 80);
    console.log('This will run:');
    console.log('1. Comprehensive Backend Test Suite (All 1186 endpoints)');
    console.log('2. Deployment Readiness Checklist (Infrastructure, Security, etc.)');
    console.log('3. Generate final deployment readiness report');
    console.log('=' * 80 + '\n');

    try {
      // Step 1: Run comprehensive backend test suite
      console.log('📋 STEP 1: Running Comprehensive Backend Test Suite...\n');
      const testSuite = new ComprehensiveBackendTestSuite();
      this.results.testSuite = await testSuite.runComprehensiveTest();

      console.log('\n' + '=' * 80);
      console.log('📋 STEP 2: Running Deployment Readiness Checklist...\n');
      
      // Step 2: Run deployment readiness checklist
      const checklist = new DeploymentReadinessChecklist();
      this.results.checklist = await checklist.runChecklist();

      // Step 3: Generate overall assessment
      console.log('\n' + '=' * 80);
      console.log('📋 STEP 3: Generating Overall Deployment Assessment...\n');
      
      this.generateOverallAssessment();

      // Step 4: Generate final report
      this.generateFinalReport();

      return this.results;

    } catch (error) {
      console.error('❌ Comprehensive testing failed:', error);
      throw error;
    }
  }

  generateOverallAssessment() {
    const testSuiteScore = this.calculateTestSuiteScore();
    const checklistScore = this.calculateChecklistScore();
    
    // Weighted scoring: 60% test suite, 40% checklist
    this.results.overall.score = (testSuiteScore * 0.6) + (checklistScore * 0.4);
    this.results.overall.ready = this.results.overall.score >= 80 && 
                                this.results.testSuite.summary.failed === 0 && 
                                this.results.checklist.summary.failed === 0;

    // Generate recommendations
    this.results.overall.recommendations = this.generateOverallRecommendations();
  }

  calculateTestSuiteScore() {
    if (!this.results.testSuite) return 0;
    
    const successRate = parseFloat(this.results.testSuite.summary.successRate);
    const avgResponseTime = parseFloat(this.results.testSuite.performance.avgResponseTime);
    
    let score = successRate;
    
    // Penalize for slow response times
    if (avgResponseTime > 2000) {
      score -= 10;
    } else if (avgResponseTime > 1000) {
      score -= 5;
    }
    
    // Penalize for high error count
    if (this.results.testSuite.summary.failed > 50) {
      score -= 15;
    } else if (this.results.testSuite.summary.failed > 20) {
      score -= 10;
    } else if (this.results.testSuite.summary.failed > 0) {
      score -= 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  calculateChecklistScore() {
    if (!this.results.checklist) return 0;
    
    const successRate = parseFloat(this.results.checklist.summary.successRate);
    let score = successRate;
    
    // Penalize for critical failures
    if (this.results.checklist.summary.failed > 0) {
      score -= 20;
    }
    
    // Penalize for too many warnings
    if (this.results.checklist.summary.warnings > 10) {
      score -= 10;
    } else if (this.results.checklist.summary.warnings > 5) {
      score -= 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  generateOverallRecommendations() {
    const recommendations = [];
    
    // Test suite recommendations
    if (this.results.testSuite) {
      if (this.results.testSuite.summary.failed > 0) {
        recommendations.push(`Fix ${this.results.testSuite.summary.failed} failing endpoint tests`);
      }
      
      const avgResponseTime = parseFloat(this.results.testSuite.performance.avgResponseTime);
      if (avgResponseTime > 1000) {
        recommendations.push(`Optimize response times (current average: ${avgResponseTime}ms)`);
      }
      
      if (this.results.testSuite.errors.length > 20) {
        recommendations.push('Review and fix error handling across endpoints');
      }
    }
    
    // Checklist recommendations
    if (this.results.checklist) {
      if (this.results.checklist.summary.failed > 0) {
        recommendations.push('Address all critical deployment readiness issues');
      }
      
      if (this.results.checklist.summary.warnings > 5) {
        recommendations.push('Consider addressing deployment readiness warnings');
      }
    }
    
    // Overall recommendations
    if (this.results.overall.score < 80) {
      recommendations.push('Overall readiness score is below 80% - comprehensive review needed');
    }
    
    if (!this.results.overall.ready) {
      recommendations.push('System is not ready for deployment - address all critical issues');
    } else {
      recommendations.push('System appears ready for deployment - proceed with caution');
    }
    
    return recommendations;
  }

  generateFinalReport() {
    const endTime = Date.now();
    const totalTime = endTime - this.startTime;

    const finalReport = {
      metadata: {
        timestamp: new Date().toISOString(),
        totalExecutionTime: totalTime + 'ms',
        version: '1.0.0',
        environment: 'development'
      },
      summary: {
        deploymentReady: this.results.overall.ready,
        overallScore: this.results.overall.score.toFixed(2) + '%',
        testSuiteResults: this.results.testSuite ? {
          totalTests: this.results.testSuite.summary.totalTests,
          passed: this.results.testSuite.summary.passed,
          failed: this.results.testSuite.summary.failed,
          successRate: this.results.testSuite.summary.successRate,
          avgResponseTime: this.results.testSuite.performance.avgResponseTime
        } : null,
        checklistResults: this.results.checklist ? {
          totalChecks: this.results.checklist.summary.total,
          passed: this.results.checklist.summary.passed,
          failed: this.results.checklist.summary.failed,
          warnings: this.results.checklist.summary.warnings,
          successRate: this.results.checklist.summary.successRate
        } : null
      },
      detailedResults: this.results,
      recommendations: this.results.overall.recommendations,
      nextSteps: this.generateNextSteps()
    };

    // Save final report
    const reportPath = `final-deployment-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));

    // Display final results
    console.log('🎯 FINAL DEPLOYMENT READINESS ASSESSMENT');
    console.log('=' * 80);
    console.log(`Overall Score: ${finalReport.summary.overallScore}`);
    console.log(`Deployment Ready: ${finalReport.summary.deploymentReady ? '✅ YES' : '❌ NO'}`);
    console.log(`Total Execution Time: ${finalReport.metadata.totalExecutionTime}`);
    
    if (finalReport.summary.testSuiteResults) {
      console.log(`\n📊 Test Suite Results:`);
      console.log(`  - Total Tests: ${finalReport.summary.testSuiteResults.totalTests}`);
      console.log(`  - Passed: ${finalReport.summary.testSuiteResults.passed}`);
      console.log(`  - Failed: ${finalReport.summary.testSuiteResults.failed}`);
      console.log(`  - Success Rate: ${finalReport.summary.testSuiteResults.successRate}`);
      console.log(`  - Avg Response Time: ${finalReport.summary.testSuiteResults.avgResponseTime}`);
    }
    
    if (finalReport.summary.checklistResults) {
      console.log(`\n📋 Checklist Results:`);
      console.log(`  - Total Checks: ${finalReport.summary.checklistResults.totalChecks}`);
      console.log(`  - Passed: ${finalReport.summary.checklistResults.passed}`);
      console.log(`  - Failed: ${finalReport.summary.checklistResults.failed}`);
      console.log(`  - Warnings: ${finalReport.summary.checklistResults.warnings}`);
      console.log(`  - Success Rate: ${finalReport.summary.checklistResults.successRate}`);
    }

    if (finalReport.recommendations.length > 0) {
      console.log(`\n📋 RECOMMENDATIONS:`);
      finalReport.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }

    if (finalReport.nextSteps.length > 0) {
      console.log(`\n🚀 NEXT STEPS:`);
      finalReport.nextSteps.forEach((step, i) => {
        console.log(`  ${i + 1}. ${step}`);
      });
    }

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    console.log('=' * 80);

    return finalReport;
  }

  generateNextSteps() {
    const nextSteps = [];
    
    if (!this.results.overall.ready) {
      nextSteps.push('Address all critical issues identified in the reports');
      nextSteps.push('Re-run the comprehensive test suite after fixes');
      nextSteps.push('Review and update deployment documentation');
    } else {
      nextSteps.push('Proceed with deployment to staging environment');
      nextSteps.push('Run smoke tests in staging environment');
      nextSteps.push('Monitor system performance after deployment');
      nextSteps.push('Prepare rollback plan in case of issues');
    }
    
    nextSteps.push('Schedule regular health checks and monitoring');
    nextSteps.push('Update team on deployment status and any issues');
    
    return nextSteps;
  }
}

// ==================== EXECUTION ====================

async function main() {
  const runner = new ComprehensiveTestRunner();
  
  try {
    const results = await runner.runAllTests();
    
    // Exit with appropriate code
    process.exit(results.overall.ready ? 0 : 1);
  } catch (error) {
    console.error('❌ Comprehensive testing failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ComprehensiveTestRunner;
