/**
 * Enhanced Autonomous System Startup Script
 * Initializes the complete autonomous backend system with research-first approach
 */

const winston = require('winston');
const fs = require('fs').promises;
const path = require('path');

// Import enhanced autonomous systems
const EnhancedAutonomousSystemOrchestrator = require('../services/enhancedAutonomousSystemOrchestrator');
const AutonomousBackendHealthMonitor = require('../services/autonomousBackendHealthMonitor');
const EnhancedAutonomousLearningSystem = require('../services/enhancedAutonomousLearningSystem');
const LocalPatternMatchingEngine = require('../services/localPatternMatchingEngine');
const AIProviderManager = require('../services/aiProviderManager');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/startup-enhanced-autonomous.log' }),
    new winston.transports.Console()
  ]
});

class EnhancedAutonomousSystemStartup {
  constructor() {
    this.autonomousOrchestrator = null;
    this.healthMonitor = null;
    this.learningSystem = null;
    this.patternEngine = null;
    this.aiProviderManager = null;
    
    this.startupResults = {
      success: false,
      components: {},
      errors: [],
      warnings: [],
      timestamp: new Date()
    };
  }

  /**
   * Initialize the enhanced autonomous system
   */
  async initialize() {
    try {
      logger.info('🚀 Starting Enhanced Autonomous System initialization...');
      
      // Step 1: Validate environment
      await this.validateEnvironment();
      
      // Step 2: Setup directories
      await this.setupDirectories();
      
      // Step 3: Initialize AI Provider Manager
      await this.initializeAIProviderManager();
      
      // Step 4: Initialize Pattern Matching Engine
      await this.initializePatternMatchingEngine();
      
      // Step 5: Initialize Enhanced Learning System
      await this.initializeEnhancedLearningSystem();
      
      // Step 6: Initialize Health Monitor
      await this.initializeHealthMonitor();
      
      // Step 7: Initialize Enhanced Autonomous Orchestrator
      await this.initializeEnhancedOrchestrator();
      
      // Step 8: Start all systems
      await this.startAllSystems();
      
      // Step 9: Verify system health
      await this.verifySystemHealth();
      
      this.startupResults.success = true;
      logger.info('✅ Enhanced Autonomous System initialization completed successfully');
      
      return this.startupResults;
      
    } catch (error) {
      logger.error('❌ Enhanced Autonomous System initialization failed:', error);
      this.startupResults.errors.push({
        component: 'startup',
        error: error.message,
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Validate environment variables
   */
  async validateEnvironment() {
    logger.info('🔍 Validating environment configuration...');
    
    const requiredEnvVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'NODE_ENV'
    ];
    
    const optionalEnvVars = [
      'OPENAI_API_KEY',
      'GEMINI_API_KEY',
      'DEEPSEEK_API_KEY',
      'ANTHROPIC_API_KEY',
      'GROK_API_KEY',
      'GOOGLE_SEARCH_API_KEY'
    ];
    
    const missingRequired = [];
    const missingOptional = [];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missingRequired.push(envVar);
      }
    }
    
    for (const envVar of optionalEnvVars) {
      if (!process.env[envVar]) {
        missingOptional.push(envVar);
      }
    }
    
    if (missingRequired.length > 0) {
      const error = `Missing required environment variables: ${missingRequired.join(', ')}`;
      logger.error('❌ Environment validation failed:', error);
      throw new Error(error);
    }
    
    if (missingOptional.length > 0) {
      const warning = `Missing optional environment variables: ${missingOptional.join(', ')}`;
      logger.warn('⚠️ Environment validation warning:', warning);
      this.startupResults.warnings.push({
        type: 'missing_optional_env',
        message: warning,
        timestamp: new Date()
      });
    }
    
    // Set research-first environment variables
    process.env.AI_RESEARCH_FIRST_MODE = 'true';
    process.env.AI_KNOWLEDGE_BASE_FIRST = 'true';
    process.env.AI_WEB_SEARCH_ENABLED = 'true';
    process.env.AI_MAX_API_USAGE = '0.05';
    process.env.AI_FALLBACK_MODE = 'true';
    process.env.AI_GRACEFUL_DEGRADATION = 'true';
    process.env.AI_WEB_SEARCH_FALLBACK = 'true';
    
    this.startupResults.components.environment = {
      success: true,
      required: requiredEnvVars.length - missingRequired.length,
      optional: optionalEnvVars.length - missingOptional.length,
      researchFirstMode: true
    };
    
    logger.info('✅ Environment validation completed');
  }

  /**
   * Setup required directories
   */
  async setupDirectories() {
    logger.info('📁 Setting up required directories...');
    
    const directories = [
      'logs',
      'data',
      'temp',
      'cache'
    ];
    
    for (const dir of directories) {
      try {
        const dirPath = path.join(__dirname, '..', dir);
        await fs.mkdir(dirPath, { recursive: true });
        logger.info(`✅ Directory created: ${dir}`);
      } catch (error) {
        logger.warn(`⚠️ Failed to create directory ${dir}:`, error.message);
      }
    }
    
    this.startupResults.components.directories = {
      success: true,
      directories: directories
    };
    
    logger.info('✅ Directory setup completed');
  }

  /**
   * Initialize AI Provider Manager
   */
  async initializeAIProviderManager() {
    try {
      logger.info('🤖 Initializing AI Provider Manager...');
      
      this.aiProviderManager = new AIProviderManager();
      
      this.startupResults.components.aiProviderManager = {
        success: true,
        researchFirstMode: true,
        maxUsage: 0.05,
        providers: Object.keys(this.aiProviderManager.providers || {})
      };
      
      logger.info('✅ AI Provider Manager initialized');
    } catch (error) {
      logger.error('❌ AI Provider Manager initialization failed:', error);
      this.startupResults.components.aiProviderManager = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  /**
   * Initialize Pattern Matching Engine
   */
  async initializePatternMatchingEngine() {
    try {
      logger.info('🎯 Initializing Pattern Matching Engine...');
      
      this.patternEngine = new LocalPatternMatchingEngine();
      await this.patternEngine.initializePatterns();
      
      const stats = this.patternEngine.getStatistics();
      
      this.startupResults.components.patternMatchingEngine = {
        success: true,
        totalPatterns: stats.totalPatterns,
        totalSolutions: stats.totalSolutions,
        averageConfidence: stats.averageConfidence
      };
      
      logger.info('✅ Pattern Matching Engine initialized');
    } catch (error) {
      logger.error('❌ Pattern Matching Engine initialization failed:', error);
      this.startupResults.components.patternMatchingEngine = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  /**
   * Initialize Enhanced Learning System
   */
  async initializeEnhancedLearningSystem() {
    try {
      logger.info('📚 Initializing Enhanced Learning System...');
      
      this.learningSystem = new EnhancedAutonomousLearningSystem();
      await this.learningSystem.initializeSystem();
      
      const stats = this.learningSystem.getLearningStatistics();
      
      this.startupResults.components.enhancedLearningSystem = {
        success: true,
        knowledgeBaseSize: stats.knowledgeBaseSize,
        learningHistorySize: stats.learningHistorySize,
        researchEngines: this.learningSystem.researchEngines
      };
      
      logger.info('✅ Enhanced Learning System initialized');
    } catch (error) {
      logger.error('❌ Enhanced Learning System initialization failed:', error);
      this.startupResults.components.enhancedLearningSystem = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  /**
   * Initialize Health Monitor
   */
  async initializeHealthMonitor() {
    try {
      logger.info('🏥 Initializing Health Monitor...');
      
      this.healthMonitor = new AutonomousBackendHealthMonitor();
      
      this.startupResults.components.healthMonitor = {
        success: true,
        autoHealingEnabled: this.healthMonitor.autoHealingEnabled,
        healthChecks: Object.keys(this.healthMonitor.healthChecks || {})
      };
      
      logger.info('✅ Health Monitor initialized');
    } catch (error) {
      logger.error('❌ Health Monitor initialization failed:', error);
      this.startupResults.components.healthMonitor = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  /**
   * Initialize Enhanced Orchestrator
   */
  async initializeEnhancedOrchestrator() {
    try {
      logger.info('🎼 Initializing Enhanced Autonomous Orchestrator...');
      
      this.autonomousOrchestrator = new EnhancedAutonomousSystemOrchestrator();
      await this.autonomousOrchestrator.initializeSystem();
      
      this.startupResults.components.enhancedOrchestrator = {
        success: true,
        researchFirstMode: this.autonomousOrchestrator.researchFirstMode,
        maxAIProviderUsage: this.autonomousOrchestrator.maxAIProviderUsage,
        gracefulDegradation: this.autonomousOrchestrator.gracefulDegradation
      };
      
      logger.info('✅ Enhanced Autonomous Orchestrator initialized');
    } catch (error) {
      logger.error('❌ Enhanced Autonomous Orchestrator initialization failed:', error);
      this.startupResults.components.enhancedOrchestrator = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  /**
   * Start all systems
   */
  async startAllSystems() {
    try {
      logger.info('🚀 Starting all autonomous systems...');
      
      // Start health monitoring
      await this.healthMonitor.startMonitoring();
      logger.info('✅ Health monitoring started');
      
      // All systems are already started by the orchestrator
      logger.info('✅ All autonomous systems started');
      
      this.startupResults.components.systemStartup = {
        success: true,
        systemsStarted: ['health_monitoring', 'learning_system', 'pattern_matching', 'orchestrator']
      };
      
    } catch (error) {
      logger.error('❌ System startup failed:', error);
      this.startupResults.components.systemStartup = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  /**
   * Verify system health
   */
  async verifySystemHealth() {
    try {
      logger.info('🔍 Verifying system health...');
      
      // Get system status
      const systemStatus = this.autonomousOrchestrator.getSystemStatus();
      const healthStatus = this.healthMonitor.getHealthStatus();
      
      // Verify all components are running
      const allComponentsRunning = systemStatus.systemState.isRunning;
      const healthCheckPassed = healthStatus.overall.status === 'healthy' || healthStatus.overall.status === 'degraded';
      
      if (!allComponentsRunning) {
        throw new Error('Not all autonomous system components are running');
      }
      
      if (!healthCheckPassed) {
        this.startupResults.warnings.push({
          type: 'health_check_warning',
          message: `Health check status: ${healthStatus.overall.status}`,
          timestamp: new Date()
        });
      }
      
      this.startupResults.components.healthVerification = {
        success: true,
        systemRunning: allComponentsRunning,
        healthStatus: healthStatus.overall.status,
        healthPercentage: healthStatus.overall.healthPercentage
      };
      
      logger.info('✅ System health verification completed');
      
    } catch (error) {
      logger.error('❌ System health verification failed:', error);
      this.startupResults.components.healthVerification = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  /**
   * Get startup results
   */
  getStartupResults() {
    return this.startupResults;
  }

  /**
   * Get system instances
   */
  getSystemInstances() {
    return {
      autonomousOrchestrator: this.autonomousOrchestrator,
      healthMonitor: this.healthMonitor,
      learningSystem: this.learningSystem,
      patternEngine: this.patternEngine,
      aiProviderManager: this.aiProviderManager
    };
  }
}

module.exports = EnhancedAutonomousSystemStartup;
