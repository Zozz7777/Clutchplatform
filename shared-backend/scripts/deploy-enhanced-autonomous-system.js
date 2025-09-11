/**
 * Enhanced Autonomous System Deployment Script
 * Comprehensive deployment and verification of the enhanced autonomous system
 */

const winston = require('winston');
const fs = require('fs').promises;
const path = require('path');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/deploy-enhanced-autonomous.log' }),
    new winston.transports.Console()
  ]
});

class EnhancedAutonomousSystemDeployment {
  constructor() {
    this.deploymentResults = {
      success: false,
      components: {},
      tests: {},
      timestamp: new Date()
    };
  }

  /**
   * Deploy the enhanced autonomous system
   */
  async deploy() {
    try {
      logger.info('🚀 Starting Enhanced Autonomous System deployment...');
      
      // Step 1: Verify all components
      await this.verifyComponents();
      
      // Step 2: Test system integration
      await this.testSystemIntegration();
      
      // Step 3: Verify health endpoints
      await this.verifyHealthEndpoints();
      
      // Step 4: Test autonomous capabilities
      await this.testAutonomousCapabilities();
      
      // Step 5: Performance verification
      await this.verifyPerformance();
      
      this.deploymentResults.success = true;
      logger.info('✅ Enhanced Autonomous System deployment completed successfully');
      
      return this.deploymentResults;
      
    } catch (error) {
      logger.error('❌ Enhanced Autonomous System deployment failed:', error);
      this.deploymentResults.error = error.message;
      throw error;
    }
  }

  /**
   * Verify all system components
   */
  async verifyComponents() {
    logger.info('🔍 Verifying system components...');
    
    const components = [
      'aiProviderManager',
      'enhancedAutonomousLearningSystem',
      'localPatternMatchingEngine',
      'autonomousBackendHealthMonitor',
      'enhancedAutonomousSystemOrchestrator',
      'localAIModels'
    ];
    
    for (const component of components) {
      try {
        const componentPath = path.join(__dirname, '..', 'services', `${component}.js`);
        await fs.access(componentPath);
        
        this.deploymentResults.components[component] = {
          exists: true,
          path: componentPath
        };
        
        logger.info(`✅ Component verified: ${component}`);
      } catch (error) {
        this.deploymentResults.components[component] = {
          exists: false,
          error: error.message
        };
        
        logger.error(`❌ Component missing: ${component}`, error);
      }
    }
  }

  /**
   * Test system integration
   */
  async testSystemIntegration() {
    logger.info('🔗 Testing system integration...');
    
    try {
      // Test AI Provider Manager
      const AIProviderManager = require('../services/aiProviderManager');
      const aiProviderManager = new AIProviderManager();
      
      this.deploymentResults.tests.aiProviderManager = {
        success: true,
        researchFirstMode: aiProviderManager.researchFirstMode,
        maxUsage: aiProviderManager.maxAIApiUsage
      };
      
      // Test Enhanced Learning System
      const EnhancedAutonomousLearningSystem = require('../services/enhancedAutonomousLearningSystem');
      const learningSystem = new EnhancedAutonomousLearningSystem();
      
      this.deploymentResults.tests.enhancedLearningSystem = {
        success: true,
        knowledgeBaseSize: learningSystem.knowledgeBase.size
      };
      
      // Test Pattern Matching Engine
      const LocalPatternMatchingEngine = require('../services/localPatternMatchingEngine');
      const patternEngine = new LocalPatternMatchingEngine();
      
      this.deploymentResults.tests.patternMatchingEngine = {
        success: true,
        totalPatterns: patternEngine.patterns.size
      };
      
      // Test Health Monitor
      const AutonomousBackendHealthMonitor = require('../services/autonomousBackendHealthMonitor');
      const healthMonitor = new AutonomousBackendHealthMonitor();
      
      this.deploymentResults.tests.healthMonitor = {
        success: true,
        autoHealingEnabled: healthMonitor.autoHealingEnabled
      };
      
      // Test Local AI Models
      const LocalAIModels = require('../services/localAIModels');
      const localAIModels = new LocalAIModels();
      
      this.deploymentResults.tests.localAIModels = {
        success: true,
        availableModels: localAIModels.getAvailableModels().length
      };
      
      logger.info('✅ System integration tests passed');
      
    } catch (error) {
      logger.error('❌ System integration tests failed:', error);
      this.deploymentResults.tests.integration = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  /**
   * Verify health endpoints
   */
  async verifyHealthEndpoints() {
    logger.info('🏥 Verifying health endpoints...');
    
    try {
      const healthRoutePath = path.join(__dirname, '..', 'routes', 'health-enhanced-autonomous.js');
      await fs.access(healthRoutePath);
      
      this.deploymentResults.tests.healthEndpoints = {
        success: true,
        routeFile: healthRoutePath
      };
      
      logger.info('✅ Health endpoints verified');
      
    } catch (error) {
      logger.error('❌ Health endpoints verification failed:', error);
      this.deploymentResults.tests.healthEndpoints = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  /**
   * Test autonomous capabilities
   */
  async testAutonomousCapabilities() {
    logger.info('🤖 Testing autonomous capabilities...');
    
    try {
      // Test text classification
      const LocalAIModels = require('../services/localAIModels');
      const localAIModels = new LocalAIModels();
      
      const classificationResult = await localAIModels.classifyText('Database connection error');
      
      this.deploymentResults.tests.textClassification = {
        success: true,
        result: classificationResult
      };
      
      // Test error analysis
      const errorAnalysisResult = await localAIModels.analyzeError('EADDRINUSE: address already in use');
      
      this.deploymentResults.tests.errorAnalysis = {
        success: true,
        result: errorAnalysisResult
      };
      
      // Test pattern matching
      const LocalPatternMatchingEngine = require('../services/localPatternMatchingEngine');
      const patternEngine = new LocalPatternMatchingEngine();
      
      const patternResult = await patternEngine.analyzeProblem('Database connection failed');
      
      this.deploymentResults.tests.patternMatching = {
        success: true,
        result: patternResult
      };
      
      logger.info('✅ Autonomous capabilities tests passed');
      
    } catch (error) {
      logger.error('❌ Autonomous capabilities tests failed:', error);
      this.deploymentResults.tests.autonomousCapabilities = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  /**
   * Verify performance
   */
  async verifyPerformance() {
    logger.info('⚡ Verifying system performance...');
    
    try {
      const startTime = Date.now();
      
      // Test multiple operations
      const LocalAIModels = require('../services/localAIModels');
      const localAIModels = new LocalAIModels();
      
      const operations = [
        () => localAIModels.classifyText('Performance issue'),
        () => localAIModels.analyzeError('Timeout error'),
        () => localAIModels.getPerformanceOptimizations({ memoryUsage: 85, cpuUsage: 80 })
      ];
      
      for (const operation of operations) {
        await operation();
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      this.deploymentResults.tests.performance = {
        success: true,
        totalTime: totalTime,
        averageTime: totalTime / operations.length
      };
      
      logger.info(`✅ Performance verification completed in ${totalTime}ms`);
      
    } catch (error) {
      logger.error('❌ Performance verification failed:', error);
      this.deploymentResults.tests.performance = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  /**
   * Generate deployment report
   */
  generateReport() {
    const report = {
      deployment: this.deploymentResults,
      summary: {
        totalComponents: Object.keys(this.deploymentResults.components).length,
        successfulComponents: Object.values(this.deploymentResults.components).filter(c => c.exists).length,
        totalTests: Object.keys(this.deploymentResults.tests).length,
        successfulTests: Object.values(this.deploymentResults.tests).filter(t => t.success).length,
        deploymentSuccess: this.deploymentResults.success
      },
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Check component status
    const failedComponents = Object.entries(this.deploymentResults.components)
      .filter(([name, status]) => !status.exists)
      .map(([name]) => name);
    
    if (failedComponents.length > 0) {
      recommendations.push({
        type: 'error',
        message: `Missing components: ${failedComponents.join(', ')}`,
        action: 'Install missing components before deployment'
      });
    }
    
    // Check test results
    const failedTests = Object.entries(this.deploymentResults.tests)
      .filter(([name, result]) => !result.success)
      .map(([name]) => name);
    
    if (failedTests.length > 0) {
      recommendations.push({
        type: 'warning',
        message: `Failed tests: ${failedTests.join(', ')}`,
        action: 'Review and fix failed tests'
      });
    }
    
    // Performance recommendations
    if (this.deploymentResults.tests.performance && this.deploymentResults.tests.performance.success) {
      const avgTime = this.deploymentResults.tests.performance.averageTime;
      if (avgTime > 1000) {
        recommendations.push({
          type: 'info',
          message: `Average operation time: ${avgTime}ms`,
          action: 'Consider performance optimization for better response times'
        });
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        message: 'All systems operational',
        action: 'System ready for production deployment'
      });
    }
    
    return recommendations;
  }
}

// Run deployment if called directly
if (require.main === module) {
  const deployment = new EnhancedAutonomousSystemDeployment();
  
  deployment.deploy()
    .then((results) => {
      const report = deployment.generateReport();
      
      console.log('\n🚀 Enhanced Autonomous System Deployment Report');
      console.log('================================================');
      console.log(`Status: ${report.deployment.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      console.log(`Components: ${report.summary.successfulComponents}/${report.summary.totalComponents}`);
      console.log(`Tests: ${report.summary.successfulTests}/${report.summary.totalTests}`);
      
      if (report.recommendations.length > 0) {
        console.log('\n📋 Recommendations:');
        report.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. [${rec.type.toUpperCase()}] ${rec.message}`);
          console.log(`   Action: ${rec.action}`);
        });
      }
      
      console.log('\n📊 Detailed Results:');
      console.log(JSON.stringify(report, null, 2));
      
      process.exit(report.deployment.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Deployment failed:', error);
      process.exit(1);
    });
}

module.exports = EnhancedAutonomousSystemDeployment;
