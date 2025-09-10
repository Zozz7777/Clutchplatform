#!/usr/bin/env node

/**
 * Startup with Auto-Setup Script
 * Enhanced startup script that includes automatic setup for Render deployment
 * Ensures the autonomous system is fully operational on every startup
 */

const { connectToDatabase } = require('../config/database');
const { logger } = require('../config/logger');
const AutonomousSystemOrchestrator = require('../services/autonomousSystemOrchestrator');

class StartupWithAutoSetup {
  constructor() {
    this.logger = logger;
    this.isRenderDeployment = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';
    this.autoSetupEnabled = process.env.AUTO_SETUP_ENABLED !== 'false';
  }

  /**
   * Start the system with auto-setup
   */
  async start() {
    try {
      this.logger.info('🚀 Starting Clutch Backend with Auto-Setup...');
      
      if (this.isRenderDeployment) {
        this.logger.info('🌐 Render deployment detected - enabling auto-setup');
      }
      
      // Step 1: Connect to database
      await this.connectToDatabase();
      
      // Step 2: Run auto-setup if enabled
      if (this.autoSetupEnabled) {
        await this.runAutoSetup();
      } else {
        this.logger.info('ℹ️ Auto-setup disabled - skipping setup phase');
      }
      
      // Step 3: Start autonomous system
      await this.startAutonomousSystem();
      
      // Step 4: Start the main server
      await this.startMainServer();
      
      this.logger.info('🎉 Clutch Backend with Auto-Setup started successfully!');
      
    } catch (error) {
      this.logger.error('❌ Failed to start with auto-setup:', error);
      process.exit(1);
    }
  }

  /**
   * Connect to database
   */
  async connectToDatabase() {
    try {
      this.logger.info('📊 Connecting to database...');
      await connectToDatabase();
      this.logger.info('✅ Database connected successfully');
    } catch (error) {
      this.logger.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Run auto-setup
   */
  async runAutoSetup() {
    try {
      this.logger.info('🔧 Running auto-setup...');
      
      // Import and run auto-setup
      const AutoSetupOnDeployment = require('./auto-setup-on-deployment');
      const autoSetup = new AutoSetupOnDeployment();
      
      const result = await autoSetup.runAutoSetup();
      
      if (result.success) {
        this.logger.info('✅ Auto-setup completed successfully');
      } else {
        this.logger.warn('⚠️ Auto-setup completed with warnings:', result.error);
      }
      
    } catch (error) {
      this.logger.error('❌ Auto-setup failed:', error);
      // Don't throw error - continue with startup even if auto-setup fails
    }
  }

  /**
   * Start autonomous system
   */
  async startAutonomousSystem() {
    try {
      this.logger.info('🤖 Starting autonomous system...');
      
      const autonomousSystem = new AutonomousSystemOrchestrator();
      const result = await autonomousSystem.start();
      
      if (result.success) {
        this.logger.info('✅ Autonomous system started successfully');
      } else {
        this.logger.warn('⚠️ Autonomous system startup failed:', result.error);
        // Don't throw error - continue with startup even if autonomous system fails
      }
      
    } catch (error) {
      this.logger.error('❌ Autonomous system startup failed:', error);
      // Don't throw error - continue with startup even if autonomous system fails
    }
  }

  /**
   * Start the main server
   */
  async startMainServer() {
    try {
      this.logger.info('🌐 Starting main HTTP server...');
      
      // Import and start the main server
      require('../server.js');
      
      this.logger.info('✅ Main HTTP server started successfully');
      
    } catch (error) {
      this.logger.error('❌ Main server startup failed:', error);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const startup = new StartupWithAutoSetup();
  await startup.start();
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run startup
main();
