#!/usr/bin/env node

/**
 * Startup Script for Research-Based AI System
 * Completely removes external AI dependencies and uses research-based solutions
 */

const path = require('path');
const fs = require('fs').promises;

// Add the services directory to the require path
const servicesPath = path.join(__dirname, '../services');
require('module').globalPaths.push(servicesPath);

const ComprehensiveResearchSystem = require('../services/comprehensiveResearchSystem');
const ResearchBasedAI = require('../services/researchBasedAI');
const GoogleResearchEngine = require('../services/googleResearchEngine');
const AutoFixingSystem = require('../services/autoFixingSystem');
const FixedHealthMonitor = require('../services/fixedHealthMonitor');

class ResearchSystemStartup {
  constructor() {
    this.logger = console;
    this.researchSystem = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      this.logger.log('🚀 Starting Research-Based AI System...');
      
      // Step 1: Initialize comprehensive research system
      this.researchSystem = new ComprehensiveResearchSystem();
      await this.researchSystem.initializeSystem();
      
      // Step 2: Test all components
      await this.testComponents();
      
      // Step 3: Set up global instance
      global.researchSystem = this.researchSystem;
      
      this.isInitialized = true;
      this.logger.log('✅ Research-Based AI System initialized successfully');
      
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to initialize Research-Based AI System:', error);
      return false;
    }
  }

  async testComponents() {
    try {
      this.logger.log('🧪 Testing system components...');
      
      // Test research-based AI
      const testProblem = "Database connection failed";
      const aiResult = await this.researchSystem.researchAI.generateResponse(testProblem);
      this.logger.log(`✅ Research AI: ${aiResult.success ? 'Working' : 'Failed'}`);
      
      // Test Google research
      const researchResult = await this.researchSystem.googleResearch.searchGoogle("Node.js database connection");
      this.logger.log(`✅ Google Research: ${researchResult.results ? 'Working' : 'Failed'}`);
      
      // Test auto-fixing
      const fixResult = await this.researchSystem.autoFixing.autoFix(testProblem);
      this.logger.log(`✅ Auto-Fixing: ${fixResult.success ? 'Working' : 'Failed'}`);
      
      // Test health monitoring
      const healthStatus = this.researchSystem.healthMonitor.getHealthStatus();
      this.logger.log(`✅ Health Monitor: ${healthStatus.overall}`);
      
      this.logger.log('🎉 All components tested successfully');
    } catch (error) {
      this.logger.error('❌ Component testing failed:', error);
      throw error;
    }
  }

  async runDiagnostics() {
    try {
      this.logger.log('🔍 Running system diagnostics...');
      
      const status = this.researchSystem.getSystemStatus();
      
      this.logger.log('\n📊 System Status:');
      this.logger.log(`- Initialized: ${status.initialized}`);
      this.logger.log(`- Total Problems Solved: ${status.metrics.totalProblemsSolved}`);
      this.logger.log(`- Successful Fixes: ${status.metrics.successfulFixes}`);
      this.logger.log(`- Research Queries: ${status.metrics.researchQueries}`);
      this.logger.log(`- Health Checks: ${status.metrics.healthChecks}`);
      
      this.logger.log('\n🏥 Health Status:');
      this.logger.log(`- Overall: ${status.health.overall}`);
      this.logger.log(`- Percentage: ${status.health.percentage}%`);
      this.logger.log(`- Healthy Checks: ${status.health.healthyChecks}/${status.health.totalChecks}`);
      
      this.logger.log('\n🧠 Research AI Metrics:');
      this.logger.log(`- Total Requests: ${status.researchAI.totalRequests}`);
      this.logger.log(`- Successful Requests: ${status.researchAI.successfulRequests}`);
      this.logger.log(`- Success Rate: ${(status.researchAI.successRate * 100).toFixed(1)}%`);
      this.logger.log(`- Knowledge Base Size: ${status.researchAI.knowledgeBaseSize}`);
      
      this.logger.log('\n🔧 Auto-Fixing Stats:');
      this.logger.log(`- Total Fix Attempts: ${status.autoFixing.totalFixAttempts}`);
      this.logger.log(`- Success Rate: ${(status.autoFixing.successRate * 100).toFixed(1)}%`);
      this.logger.log(`- Available Strategies: ${status.autoFixing.availableStrategies}`);
      
      this.logger.log('\n🔍 Google Research Stats:');
      this.logger.log(`- Cache Size: ${status.googleResearch.cacheSize}`);
      this.logger.log(`- Max Results: ${status.googleResearch.maxResults}`);
      this.logger.log(`- Total Queries: ${status.googleResearch.totalQueries}`);
      
      return status;
    } catch (error) {
      this.logger.error('❌ Diagnostics failed:', error);
      return null;
    }
  }

  async solveTestProblem() {
    try {
      this.logger.log('\n🧪 Testing problem-solving capabilities...');
      
      const testProblems = [
        "Database connection failed with MongoDB",
        "API endpoint returning 404 error",
        "High memory usage detected",
        "Authentication token expired",
        "Rate limit exceeded for API calls"
      ];
      
      for (const problem of testProblems) {
        this.logger.log(`\n🔍 Testing: ${problem}`);
        const solution = await this.researchSystem.solveProblem(problem);
        
        this.logger.log(`✅ Solution: ${solution.success ? 'Found' : 'Not Found'}`);
        this.logger.log(`📊 Confidence: ${(solution.confidence * 100).toFixed(1)}%`);
        this.logger.log(`🔧 Source: ${solution.source}`);
        this.logger.log(`💡 Response: ${solution.solution.substring(0, 100)}...`);
      }
      
      this.logger.log('\n🎉 Problem-solving test completed');
    } catch (error) {
      this.logger.error('❌ Problem-solving test failed:', error);
    }
  }

  async startMonitoring() {
    try {
      this.logger.log('📊 Starting system monitoring...');
      
      // Set up periodic diagnostics
      setInterval(async () => {
        const status = this.researchSystem.getSystemStatus();
        this.logger.log(`📈 System Status: ${status.health.overall} (${status.health.percentage}%) - Problems Solved: ${status.metrics.totalProblemsSolved}`);
      }, 60000); // Every minute
      
      // Set up periodic maintenance
      setInterval(async () => {
        await this.researchSystem.performMaintenance();
      }, 300000); // Every 5 minutes
      
      this.logger.log('✅ System monitoring started');
    } catch (error) {
      this.logger.error('❌ Failed to start monitoring:', error);
    }
  }

  async shutdown() {
    try {
      this.logger.log('🛑 Shutting down Research-Based AI System...');
      
      if (this.researchSystem) {
        await this.researchSystem.stop();
      }
      
      this.logger.log('✅ System shutdown completed');
    } catch (error) {
      this.logger.error('❌ Shutdown failed:', error);
    }
  }
}

// Main execution
async function main() {
  const startup = new ResearchSystemStartup();
  
  try {
    // Initialize the system
    const initialized = await startup.initialize();
    if (!initialized) {
      process.exit(1);
    }
    
    // Run diagnostics
    await startup.runDiagnostics();
    
    // Test problem-solving
    await startup.solveTestProblem();
    
    // Start monitoring
    await startup.startMonitoring();
    
    // Keep the process running
    this.logger.log('\n🚀 Research-Based AI System is running...');
    this.logger.log('Press Ctrl+C to stop');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await startup.shutdown();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      await startup.shutdown();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = ResearchSystemStartup;
