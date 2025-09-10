#!/usr/bin/env node

/**
 * Deployment Setup Script
 * Automatically sets up AI agent during Render deployment
 */

const fs = require('fs').promises;
const path = require('path');
const PlatformDocumentationLoader = require('./load-platform-docs');
const PlatformKnowledgeBase = require('../services/platformKnowledgeBase');

class DeploySetup {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.isRender = process.env.RENDER === 'true';
  }

  /**
   * Run deployment setup
   */
  async runSetup() {
    console.log('🚀 Starting deployment setup...');
    
    if (this.isProduction && this.isRender) {
      console.log('📦 Detected Render production deployment');
      await this.setupForRender();
    } else {
      console.log('🔧 Local development environment detected');
      await this.setupForDevelopment();
    }
    
    console.log('✅ Deployment setup completed');
  }

  /**
   * Setup for Render production deployment
   */
  async setupForRender() {
    try {
      console.log('🤖 Setting up Enterprise AI Developer for production...');
      
      // 1. Load platform documentation
      console.log('📚 Loading platform documentation...');
      const docLoader = new PlatformDocumentationLoader();
      const docResult = await docLoader.loadAllDocumentation();
      
      if (docResult.success) {
        console.log(`✅ Loaded ${docResult.filesLoaded} documentation files`);
      } else {
        console.log('⚠️ Documentation loading failed, continuing...');
      }
      
      // 2. Initialize knowledge base
      console.log('🧠 Initializing knowledge base...');
      const knowledgeBase = new PlatformKnowledgeBase();
      const kbResult = await knowledgeBase.initialize();
      
      if (kbResult) {
        console.log('✅ Knowledge base initialized');
      } else {
        console.log('⚠️ Knowledge base initialization failed, continuing...');
      }
      
      // 3. Create deployment info file
      await this.createDeploymentInfo();
      
      // 4. Setup logging
      await this.setupLogging();
      
      console.log('🎉 Render deployment setup completed successfully');
      
    } catch (error) {
      console.error('❌ Render setup failed:', error);
      // Don't fail deployment, just log the error
    }
  }

  /**
   * Setup for development environment
   */
  async setupForDevelopment() {
    console.log('🔧 Development environment setup...');
    
    // Create logs directory if it doesn't exist
    try {
      await fs.mkdir('logs', { recursive: true });
      console.log('📁 Logs directory created');
    } catch (error) {
      // Directory might already exist
    }
    
    console.log('✅ Development setup completed');
  }

  /**
   * Create deployment information file
   */
  async createDeploymentInfo() {
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      platform: 'render',
      aiAgentEnabled: process.env.AI_MONITORING_ENABLED === 'true',
      autoFixEnabled: process.env.AI_AUTO_FIX_ENABLED === 'true',
      backendUrl: process.env.BACKEND_URL,
      adminUrl: process.env.ADMIN_URL,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      version: process.env.npm_package_version || '1.0.0'
    };

    try {
      await fs.writeFile(
        'logs/deployment-info.json',
        JSON.stringify(deploymentInfo, null, 2)
      );
      console.log('📄 Deployment info created');
    } catch (error) {
      console.warn('⚠️ Could not create deployment info:', error.message);
    }
  }

  /**
   * Setup logging for production
   */
  async setupLogging() {
    try {
      // Ensure logs directory exists
      await fs.mkdir('logs', { recursive: true });
      
      // Create initial log entry
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Enterprise AI Developer deployment setup completed',
        environment: process.env.NODE_ENV,
        platform: 'render'
      };

      await fs.appendFile(
        'logs/ai-agent.log',
        JSON.stringify(logEntry) + '\n'
      );
      
      console.log('📝 Logging setup completed');
    } catch (error) {
      console.warn('⚠️ Logging setup failed:', error.message);
    }
  }

  /**
   * Verify AI agent configuration
   */
  async verifyConfiguration() {
    const config = {
      aiMonitoringEnabled: process.env.AI_MONITORING_ENABLED === 'true',
      autoFixEnabled: process.env.AI_AUTO_FIX_ENABLED === 'true',
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      backendUrl: process.env.BACKEND_URL,
      adminUrl: process.env.ADMIN_URL,
      checkInterval: process.env.AI_CHECK_INTERVAL
    };

    console.log('🔍 AI Agent Configuration:');
    console.log(`  Monitoring Enabled: ${config.aiMonitoringEnabled}`);
    console.log(`  Auto-Fix Enabled: ${config.autoFixEnabled}`);
    console.log(`  OpenAI Key: ${config.hasOpenAIKey ? '✅ Set' : '❌ Missing'}`);
    console.log(`  Backend URL: ${config.backendUrl || '❌ Not set'}`);
    console.log(`  Admin URL: ${config.adminUrl || '❌ Not set'}`);
    console.log(`  Check Interval: ${config.checkInterval || 'Default'}`);

    return config;
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new DeploySetup();
  
  setup.runSetup()
    .then(async () => {
      await setup.verifyConfiguration();
      console.log('\n🎉 Deployment setup completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Deployment setup failed:', error);
      process.exit(1);
    });
}

module.exports = DeploySetup;
