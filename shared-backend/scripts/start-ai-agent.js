#!/usr/bin/env node

/**
 * AI Agent Startup Script
 * Starts the AI monitoring agent with proper configuration
 */

const AIMonitoringAgent = require('../services/aiMonitoringAgent');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/ai-agent-startup.log' })
  ]
});

async function startAIAgent() {
  try {
    logger.info('🤖 Starting AI Monitoring Agent...');
    
    // Check required environment variables
    const requiredEnvVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'BACKEND_URL',
      'ADMIN_URL'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      logger.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
      process.exit(1);
    }
    
    // Initialize and start AI agent
    const aiAgent = new AIMonitoringAgent();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('🛑 Received SIGINT, shutting down AI agent...');
      await aiAgent.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('🛑 Received SIGTERM, shutting down AI agent...');
      await aiAgent.stop();
      process.exit(0);
    });
    
    // Start the agent
    await aiAgent.start();
    
    logger.info('✅ AI Monitoring Agent started successfully');
    logger.info(`📊 Monitoring backend: ${process.env.BACKEND_URL}`);
    logger.info(`📊 Monitoring admin: ${process.env.ADMIN_URL}`);
    logger.info(`🔧 Auto-fix enabled: ${process.env.AI_AUTO_FIX_ENABLED === 'true'}`);
    
    // Keep the process running
    setInterval(() => {
      const status = aiAgent.getStatus();
      logger.info(`📈 Agent Status: Running=${status.isRunning}, Issues=${status.totalIssues}, Last Check=${status.lastCheck}`);
    }, 60000); // Log status every minute
    
  } catch (error) {
    logger.error('❌ Failed to start AI Monitoring Agent:', error);
    process.exit(1);
  }
}

// Start the AI agent
startAIAgent();
