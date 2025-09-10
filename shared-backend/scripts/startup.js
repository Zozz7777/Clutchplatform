#!/usr/bin/env node

/**
 * Enhanced Startup Script for Clutch Backend
 * Includes AI Agent initialization
 */

const { connectToDatabase } = require('../config/database');
const { logger } = require('../config/logger');
const AIMonitoringAgent = require('../services/aiMonitoringAgent');

async function initializeServices() {
  try {
    logger.info('🚀 Starting Clutch Backend Services...');
    
    // Connect to database
    logger.info('📊 Connecting to database...');
    await connectToDatabase();
    logger.info('✅ Database connected successfully');
    
    // Initialize AI Monitoring Agent if enabled
    if (process.env.AI_MONITORING_ENABLED === 'true' || process.env.NODE_ENV === 'production') {
      logger.info('🤖 Initializing AI Monitoring Agent...');
      const aiAgent = new AIMonitoringAgent();
      
      // Start AI agent in background
      setImmediate(async () => {
        try {
          await aiAgent.start();
          logger.info('✅ AI Monitoring Agent started successfully');
          
          // Log AI agent status
          const status = aiAgent.getStatus();
          logger.info(`📊 AI Agent Status: Running=${status.isRunning}, Issues=${status.totalIssues}`);
          
          if (status.enterpriseDeveloper) {
            logger.info(`👨‍💻 Enterprise AI Developer: ${status.enterpriseDeveloper.persona.name} ready`);
          }
        } catch (error) {
          logger.error('❌ Failed to start AI Monitoring Agent:', error);
        }
      });
    } else {
      logger.info('ℹ️ AI Monitoring Agent disabled (set AI_MONITORING_ENABLED=true to enable)');
    }
    
    // Start the main server
    logger.info('🌐 Starting HTTP server...');
    require('../server.js');
    
  } catch (error) {
    logger.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start services
initializeServices();