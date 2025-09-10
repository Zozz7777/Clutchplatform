/**
 * Autonomous Dashboard API Routes
 * Provides real-time dashboard data and controls for the Clutch admin
 */

const express = require('express');
const router = express.Router();
const AutonomousDashboardOrchestrator = require('../services/autonomousDashboardOrchestrator');

// Initialize dashboard orchestrator
let dashboardOrchestrator;

// Initialize orchestrator if not already done
const initializeOrchestrator = () => {
  if (!dashboardOrchestrator) {
    dashboardOrchestrator = new AutonomousDashboardOrchestrator();
  }
  return dashboardOrchestrator;
};

/**
 * @route GET /api/v1/autonomous-dashboard/status
 * @desc Get comprehensive dashboard status
 * @access Public
 */
router.get('/status', async (req, res) => {
  try {
    const orchestrator = initializeOrchestrator();
    const status = orchestrator.getDashboardStatus();
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route GET /api/v1/autonomous-dashboard/data
 * @desc Get real-time dashboard data
 * @access Public
 */
router.get('/data', async (req, res) => {
  try {
    const orchestrator = initializeOrchestrator();
    const data = orchestrator.getDashboardData();
    
    res.json({
      success: true,
      data: data,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route GET /api/v1/autonomous-dashboard/health
 * @desc Get dashboard health status
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    const orchestrator = initializeOrchestrator();
    const status = orchestrator.getDashboardStatus();
    
    res.json({
      success: true,
      health: {
        status: status.orchestrator.status,
        active: status.orchestrator.active,
        lastUpdate: status.orchestrator.lastUpdate,
        errorCount: status.orchestrator.errorCount,
        performance: status.performance
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route GET /api/v1/autonomous-dashboard/insights
 * @desc Get AI-generated insights
 * @access Public
 */
router.get('/insights', async (req, res) => {
  try {
    const orchestrator = initializeOrchestrator();
    const status = orchestrator.getDashboardStatus();
    
    res.json({
      success: true,
      insights: {
        count: status.analytics.insightsCount,
        lastInsight: status.analytics.lastInsight,
        recent: orchestrator.analyticsEngine.insights.slice(-5)
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route GET /api/v1/autonomous-dashboard/analytics
 * @desc Get analytics data
 * @access Public
 */
router.get('/analytics', async (req, res) => {
  try {
    const orchestrator = initializeOrchestrator();
    const data = orchestrator.getDashboardData();
    
    res.json({
      success: true,
      analytics: data.analytics,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route GET /api/v1/autonomous-dashboard/users
 * @desc Get user data
 * @access Public
 */
router.get('/users', async (req, res) => {
  try {
    const orchestrator = initializeOrchestrator();
    const data = orchestrator.getDashboardData();
    
    res.json({
      success: true,
      users: data.users,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route GET /api/v1/autonomous-dashboard/financial
 * @desc Get financial data
 * @access Public
 */
router.get('/financial', async (req, res) => {
  try {
    const orchestrator = initializeOrchestrator();
    const data = orchestrator.getDashboardData();
    
    res.json({
      success: true,
      financial: data.financial,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route GET /api/v1/autonomous-dashboard/performance
 * @desc Get performance metrics
 * @access Public
 */
router.get('/performance', async (req, res) => {
  try {
    const orchestrator = initializeOrchestrator();
    const data = orchestrator.getDashboardData();
    
    res.json({
      success: true,
      performance: {
        system: data.system,
        health: data.health,
        metrics: orchestrator.dashboardHealth.performance
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route POST /api/v1/autonomous-dashboard/refresh
 * @desc Manually refresh dashboard data
 * @access Public
 */
router.post('/refresh', async (req, res) => {
  try {
    const orchestrator = initializeOrchestrator();
    const { dataType } = req.body;
    
    if (dataType) {
      // Refresh specific data type
      await orchestrator.refreshDataCache(dataType);
      res.json({
        success: true,
        message: `Refreshed ${dataType} data`,
        timestamp: new Date()
      });
    } else {
      // Refresh all data
      await Promise.all([
        orchestrator.fetchSystemData(),
        orchestrator.fetchAnalyticsData(),
        orchestrator.fetchUserData(),
        orchestrator.fetchFinancialData()
      ]);
      
      res.json({
        success: true,
        message: 'Refreshed all dashboard data',
        timestamp: new Date()
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route POST /api/v1/autonomous-dashboard/heal
 * @desc Trigger manual healing
 * @access Public
 */
router.post('/heal', async (req, res) => {
  try {
    const orchestrator = initializeOrchestrator();
    await orchestrator.performAutoHealing();
    
    res.json({
      success: true,
      message: 'Auto-healing completed',
      healingHistory: orchestrator.selfHealing.healingHistory.slice(-5),
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route GET /api/v1/autonomous-dashboard/self-healing
 * @desc Get self-healing status and history
 * @access Public
 */
router.get('/self-healing', async (req, res) => {
  try {
    const orchestrator = initializeOrchestrator();
    
    res.json({
      success: true,
      selfHealing: {
        autoFixAttempts: orchestrator.selfHealing.autoFixAttempts,
        lastHealingAction: orchestrator.selfHealing.lastHealingAction,
        healingHistory: orchestrator.selfHealing.healingHistory.slice(-10),
        errorPatterns: Array.from(orchestrator.selfHealing.errorPatterns.entries())
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route GET /api/v1/autonomous-dashboard/data-sources
 * @desc Get data sources status
 * @access Public
 */
router.get('/data-sources', async (req, res) => {
  try {
    const orchestrator = initializeOrchestrator();
    
    res.json({
      success: true,
      dataSources: orchestrator.dataSources,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route GET /api/v1/autonomous-dashboard/cache
 * @desc Get cache status
 * @access Public
 */
router.get('/cache', async (req, res) => {
  try {
    const orchestrator = initializeOrchestrator();
    const status = orchestrator.getDashboardStatus();
    
    res.json({
      success: true,
      cache: status.dataCache,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route POST /api/v1/autonomous-dashboard/start
 * @desc Start autonomous dashboard operations
 * @access Public
 */
router.post('/start', async (req, res) => {
  try {
    const orchestrator = initializeOrchestrator();
    
    if (!orchestrator.isActive) {
      await orchestrator.initializeDashboard();
    }
    
    res.json({
      success: true,
      message: 'Autonomous dashboard started',
      status: orchestrator.getDashboardStatus(),
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route POST /api/v1/autonomous-dashboard/stop
 * @desc Stop autonomous dashboard operations
 * @access Public
 */
router.post('/stop', async (req, res) => {
  try {
    const orchestrator = initializeOrchestrator();
    await orchestrator.stop();
    
    res.json({
      success: true,
      message: 'Autonomous dashboard stopped',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * @route GET /api/v1/autonomous-dashboard/metrics
 * @desc Get comprehensive metrics
 * @access Public
 */
router.get('/metrics', async (req, res) => {
  try {
    const orchestrator = initializeOrchestrator();
    const data = orchestrator.getDashboardData();
    const status = orchestrator.getDashboardStatus();
    
    res.json({
      success: true,
      metrics: {
        system: data.system,
        analytics: data.analytics,
        users: data.users,
        financial: data.financial,
        performance: status.performance,
        health: status.orchestrator,
        insights: {
          count: status.analytics.insightsCount,
          recent: orchestrator.analyticsEngine.insights.slice(-3)
        }
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

module.exports = router;
