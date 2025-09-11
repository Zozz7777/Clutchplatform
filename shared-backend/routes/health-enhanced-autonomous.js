/**
 * Enhanced Autonomous Health Routes
 * Comprehensive health monitoring with autonomous system integration
 */

const express = require('express');
const router = express.Router();
const winston = require('winston');

// Import enhanced autonomous systems
let EnhancedAutonomousSystemOrchestrator, AutonomousBackendHealthMonitor;
try {
  EnhancedAutonomousSystemOrchestrator = require('../services/enhancedAutonomousSystemOrchestrator');
  AutonomousBackendHealthMonitor = require('../services/autonomousBackendHealthMonitor');
} catch (error) {
  console.warn('⚠️ Enhanced autonomous systems not available:', error.message);
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/health-enhanced.log' }),
    new winston.transports.Console()
  ]
});

// Initialize autonomous systems
let autonomousOrchestrator = null;
let healthMonitor = null;

// Initialize autonomous systems if available
if (EnhancedAutonomousSystemOrchestrator && AutonomousBackendHealthMonitor) {
  try {
    autonomousOrchestrator = new EnhancedAutonomousSystemOrchestrator();
    healthMonitor = new AutonomousBackendHealthMonitor();
    logger.info('✅ Enhanced autonomous systems initialized');
  } catch (error) {
    logger.error('❌ Failed to initialize autonomous systems:', error);
  }
}

/**
 * Enhanced health check endpoint
 */
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Basic system health
    const basicHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.API_VERSION || 'v1',
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };

    // Enhanced health with autonomous systems
    let enhancedHealth = null;
    if (autonomousOrchestrator && healthMonitor) {
      try {
        const systemStatus = autonomousOrchestrator.getSystemStatus();
        const healthStatus = healthMonitor.getHealthStatus();
        
        enhancedHealth = {
          autonomous: {
            systemRunning: systemStatus.systemState.isRunning,
            totalOperations: systemStatus.systemState.totalOperations,
            successfulOperations: systemStatus.systemState.successfulOperations,
            failedOperations: systemStatus.systemState.failedOperations,
            researchSuccesses: systemStatus.systemState.researchSuccesses,
            aiProviderUsage: systemStatus.systemState.aiProviderUsage,
            uptime: systemStatus.systemState.uptime
          },
          performance: {
            successRate: systemStatus.performanceMetrics.successRate,
            researchSuccessRate: systemStatus.performanceMetrics.researchSuccessRate,
            aiProviderUsageRate: systemStatus.performanceMetrics.aiProviderUsageRate,
            systemUptime: systemStatus.performanceMetrics.systemUptime
          },
          health: {
            overall: healthStatus.overall,
            checks: healthStatus.checks,
            autoHealingEnabled: healthStatus.autoHealingEnabled
          },
          learning: {
            totalProblems: systemStatus.learningStatistics.totalProblems,
            solvedProblems: systemStatus.learningStatistics.solvedProblems,
            knowledgeBaseSize: systemStatus.learningStatistics.knowledgeBaseSize,
            learningHistorySize: systemStatus.learningStatistics.learningHistorySize
          },
          configuration: {
            researchFirstMode: systemStatus.configuration.researchFirstMode,
            maxAIProviderUsage: systemStatus.configuration.maxAIProviderUsage,
            gracefulDegradation: systemStatus.configuration.gracefulDegradation
          }
        };
      } catch (error) {
        logger.error('❌ Failed to get enhanced health status:', error);
        enhancedHealth = {
          error: 'Failed to get enhanced health status',
          message: error.message
        };
      }
    }

    const responseTime = Date.now() - startTime;
    
    const healthResponse = {
      success: true,
      data: {
        ...basicHealth,
        enhanced: enhancedHealth,
        responseTime: responseTime,
        status: enhancedHealth && enhancedHealth.health ? enhancedHealth.health.overall.status : 'healthy'
      }
    };

    // Set appropriate status code based on health
    const statusCode = enhancedHealth && enhancedHealth.health && enhancedHealth.health.overall.status === 'unhealthy' ? 503 : 200;
    
    res.status(statusCode).json(healthResponse);
    
  } catch (error) {
    logger.error('❌ Health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Simple ping endpoint
 */
router.get('/ping', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        status: 'pong',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    logger.error('❌ Ping failed:', error);
    res.status(200).json({
      success: true,
      data: {
        status: 'pong',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }
    });
  }
});

/**
 * Detailed system status endpoint
 */
router.get('/status', async (req, res) => {
  try {
    if (!autonomousOrchestrator) {
      return res.status(503).json({
        success: false,
        error: 'Autonomous system not available',
        message: 'Enhanced autonomous system is not initialized'
      });
    }

    const systemStatus = autonomousOrchestrator.getSystemStatus();
    
    res.status(200).json({
      success: true,
      data: systemStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ System status check failed:', error);
    res.status(500).json({
      success: false,
      error: 'System status check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Health monitoring endpoint
 */
router.get('/monitor', async (req, res) => {
  try {
    if (!healthMonitor) {
      return res.status(503).json({
        success: false,
        error: 'Health monitor not available',
        message: 'Health monitoring system is not initialized'
      });
    }

    const healthStatus = healthMonitor.getHealthStatus();
    
    res.status(200).json({
      success: true,
      data: healthStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Health monitoring check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Health monitoring check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Learning statistics endpoint
 */
router.get('/learning', async (req, res) => {
  try {
    if (!autonomousOrchestrator) {
      return res.status(503).json({
        success: false,
        error: 'Autonomous system not available',
        message: 'Enhanced autonomous system is not initialized'
      });
    }

    const systemStatus = autonomousOrchestrator.getSystemStatus();
    const learningStats = systemStatus.learningStatistics;
    
    res.status(200).json({
      success: true,
      data: {
        learning: learningStats,
        patternMatching: systemStatus.patternStatistics,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('❌ Learning statistics check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Learning statistics check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Performance metrics endpoint
 */
router.get('/performance', async (req, res) => {
  try {
    if (!autonomousOrchestrator) {
      return res.status(503).json({
        success: false,
        error: 'Autonomous system not available',
        message: 'Enhanced autonomous system is not initialized'
      });
    }

    const systemStatus = autonomousOrchestrator.getSystemStatus();
    const performanceMetrics = systemStatus.performanceMetrics;
    
    res.status(200).json({
      success: true,
      data: {
        performance: performanceMetrics,
        systemState: systemStatus.systemState,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('❌ Performance metrics check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Performance metrics check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * System recovery endpoint
 */
router.post('/recover', async (req, res) => {
  try {
    if (!autonomousOrchestrator) {
      return res.status(503).json({
        success: false,
        error: 'Autonomous system not available',
        message: 'Enhanced autonomous system is not initialized'
      });
    }

    logger.info('🔧 Manual system recovery initiated');
    
    // Trigger system recovery
    await autonomousOrchestrator.initiateSystemRecovery();
    
    res.status(200).json({
      success: true,
      message: 'System recovery initiated',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ System recovery failed:', error);
    res.status(500).json({
      success: false,
      error: 'System recovery failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Problem solving endpoint
 */
router.post('/solve', async (req, res) => {
  try {
    if (!autonomousOrchestrator) {
      return res.status(503).json({
        success: false,
        error: 'Autonomous system not available',
        message: 'Enhanced autonomous system is not initialized'
      });
    }

    const { problem, context = {} } = req.body;
    
    if (!problem) {
      return res.status(400).json({
        success: false,
        error: 'Problem description required',
        message: 'Please provide a problem description in the request body'
      });
    }

    logger.info(`🔍 Solving problem: ${problem.substring(0, 100)}...`);
    
    const solution = await autonomousOrchestrator.solveProblem(problem, context);
    
    res.status(200).json({
      success: true,
      data: solution,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Problem solving failed:', error);
    res.status(500).json({
      success: false,
      error: 'Problem solving failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * System configuration endpoint
 */
router.get('/config', (req, res) => {
  try {
    const config = {
      researchFirstMode: process.env.AI_RESEARCH_FIRST_MODE === 'true' || true,
      maxAIProviderUsage: parseFloat(process.env.AI_MAX_API_USAGE) || 0.05,
      gracefulDegradation: process.env.AI_GRACEFUL_DEGRADATION === 'true' || true,
      webSearchEnabled: process.env.AI_WEB_SEARCH_ENABLED === 'true' || true,
      knowledgeBaseFirst: process.env.AI_KNOWLEDGE_BASE_FIRST === 'true' || true,
      fallbackMode: process.env.AI_FALLBACK_MODE === 'true' || true,
      environment: process.env.NODE_ENV || 'development',
      apiVersion: process.env.API_VERSION || 'v1'
    };
    
    res.status(200).json({
      success: true,
      data: config,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Configuration check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Configuration check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
