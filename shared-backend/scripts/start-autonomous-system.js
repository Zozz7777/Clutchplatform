#!/usr/bin/env node

/**
 * Start Autonomous System Script
 * Launches the world-class autonomous backend team
 */

const { connectToDatabase } = require('../config/database');
const { logger } = require('../config/logger');
const AutonomousSystemOrchestrator = require('../services/autonomousSystemOrchestrator');

async function startAutonomousSystem() {
  try {
    logger.info('🚀 Starting Clutch Autonomous Backend System...');
    logger.info('🎯 Initializing world-class backend team for 24/7 operation...');
    
    // Connect to database
    logger.info('📊 Connecting to database...');
    await connectToDatabase();
    logger.info('✅ Database connected successfully');
    
    // Initialize Autonomous System Orchestrator
    logger.info('🎭 Initializing Autonomous System Orchestrator...');
    const autonomousSystem = new AutonomousSystemOrchestrator();
    
    // Start the autonomous system
    logger.info('🤖 Starting autonomous backend team...');
    const result = await autonomousSystem.start();
    
    if (result.success) {
      logger.info('🎉 SUCCESS! Autonomous Backend System is now running!');
      logger.info('👥 World-class backend team is fully operational');
      logger.info('🔄 24/7 autonomous operation enabled');
      logger.info('⚡ All trigger systems activated');
      logger.info('🏗️ Backend management system ready');
      logger.info('🛡️ Production-safe AI operations enabled');
      logger.info('');
      logger.info('🎯 SYSTEM CAPABILITIES:');
      logger.info('✅ Automatic issue detection and resolution');
      logger.info('✅ Performance monitoring and optimization');
      logger.info('✅ Security scanning and threat response');
      logger.info('✅ Automatic code generation and modification');
      logger.info('✅ Database optimization and management');
      logger.info('✅ Infrastructure scaling and management');
      logger.info('✅ Continuous improvement and learning');
      logger.info('✅ 24/7 monitoring and maintenance');
      logger.info('');
      logger.info('🚀 THE CLUTCH BACKEND IS NOW FULLY AUTONOMOUS!');
      logger.info('🤖 No human intervention required - system handles everything!');
      
      // Keep the process running
      process.on('SIGINT', async () => {
        logger.info('🛑 Shutting down autonomous system...');
        await autonomousSystem.stop();
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        logger.info('🛑 Shutting down autonomous system...');
        await autonomousSystem.stop();
        process.exit(0);
      });
      
      // Log system status every hour
      setInterval(() => {
        const status = autonomousSystem.getSystemStatus();
        logger.info('📊 System Status:', {
          uptime: status.orchestrator.uptime,
          operations: status.orchestrator.totalOperations,
          successRate: status.orchestrator.successRate,
          systemLoad: status.systemState.systemLoad,
          memoryUsage: status.systemState.memoryUsage,
          cpuUsage: status.systemState.cpuUsage
        });
      }, 3600000); // Every hour
      
    } else {
      logger.error('❌ Failed to start autonomous system:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    logger.error('❌ Failed to initialize autonomous system:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the autonomous system
startAutonomousSystem();
