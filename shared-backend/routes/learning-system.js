/**
 * Learning System Management Routes
 * API endpoints to control and monitor the autonomous learning system
 */

const express = require('express');
const router = express.Router();
const AutonomousLearningSystem = require('../services/autonomousLearningSystem');
const GoalOrientedAI = require('../services/goalOrientedAI');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Initialize learning systems
const learningSystem = new AutonomousLearningSystem();
const goalOrientedAI = new GoalOrientedAI();

/**
 * Start the learning system
 */
router.post('/start', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await learningSystem.start();
    
    res.json({
      success: true,
      message: 'Learning system started successfully',
      result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'START_LEARNING_SYSTEM_FAILED',
      message: 'Failed to start learning system',
      details: error.message
    });
  }
});

/**
 * Get learning system status
 */
router.get('/status', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    const status = learningSystem.getLearningStatus();
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_LEARNING_STATUS_FAILED',
      message: 'Failed to get learning system status',
      details: error.message
    });
  }
});

/**
 * Update organization goals
 */
router.put('/goals', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { goals } = req.body;
    
    if (!goals) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_GOALS',
        message: 'Goals are required'
      });
    }
    
    const result = await learningSystem.updateOrganizationGoals(goals);
    
    res.json({
      success: true,
      message: 'Organization goals updated successfully',
      result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'UPDATE_GOALS_FAILED',
      message: 'Failed to update organization goals',
      details: error.message
    });
  }
});

/**
 * Get organization goals
 */
router.get('/goals', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    const goals = learningSystem.organizationGoals;
    
    res.json({
      success: true,
      data: goals,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_GOALS_FAILED',
      message: 'Failed to get organization goals',
      details: error.message
    });
  }
});

/**
 * Get goal achievement report
 */
router.get('/goals/report', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    const report = goalOrientedAI.getGoalAchievementReport();
    
    res.json({
      success: true,
      data: report,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_GOAL_REPORT_FAILED',
      message: 'Failed to get goal achievement report',
      details: error.message
    });
  }
});

/**
 * Update goal-oriented AI goals
 */
router.put('/goals/orientation', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { goals } = req.body;
    
    if (!goals) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_GOALS',
        message: 'Goals are required'
      });
    }
    
    const result = await goalOrientedAI.updateOrganizationGoals(goals);
    
    res.json({
      success: true,
      message: 'Goal-oriented AI goals updated successfully',
      result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'UPDATE_GOAL_ORIENTATION_FAILED',
      message: 'Failed to update goal-oriented AI goals',
      details: error.message
    });
  }
});

/**
 * Get goal-oriented AI status
 */
router.get('/goals/status', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    const status = goalOrientedAI.getSystemStatus();
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_GOAL_ORIENTATION_STATUS_FAILED',
      message: 'Failed to get goal-oriented AI status',
      details: error.message
    });
  }
});

/**
 * Make goal-oriented decision
 */
router.post('/decisions', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    const { context, options } = req.body;
    
    if (!context || !options) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_DECISION_DATA',
        message: 'Context and options are required'
      });
    }
    
    const decision = await goalOrientedAI.makeGoalOrientedDecision(context, options);
    
    res.json({
      success: true,
      message: 'Goal-oriented decision made successfully',
      data: decision,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'MAKE_DECISION_FAILED',
      message: 'Failed to make goal-oriented decision',
      details: error.message
    });
  }
});

/**
 * Get learning metrics
 */
router.get('/metrics', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    const metrics = {
      learningAccuracy: learningSystem.performanceMetrics.learningAccuracy,
      goalAlignmentScore: learningSystem.performanceMetrics.goalAlignmentScore,
      optimizationEffectiveness: learningSystem.performanceMetrics.optimizationEffectiveness,
      adaptationRate: learningSystem.performanceMetrics.adaptationRate,
      knowledgeGrowth: learningSystem.performanceMetrics.knowledgeGrowth,
      predictionAccuracy: learningSystem.performanceMetrics.predictionAccuracy,
      overallProgress: goalOrientedAI.calculateOverallProgress(),
      period
    };
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_LEARNING_METRICS_FAILED',
      message: 'Failed to get learning metrics',
      details: error.message
    });
  }
});

/**
 * Get learning insights
 */
router.get('/insights', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    
    const insights = {
      performanceInsights: learningSystem.learningData.performancePatterns,
      businessInsights: learningSystem.learningData.businessMetrics,
      optimizationInsights: learningSystem.learningData.optimizationOpportunities,
      knowledgeInsights: learningSystem.learningData.knowledgeBase,
      type
    };
    
    res.json({
      success: true,
      data: insights,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_LEARNING_INSIGHTS_FAILED',
      message: 'Failed to get learning insights',
      details: error.message
    });
  }
});

/**
 * Trigger learning cycle
 */
router.post('/learn', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { type = 'continuous' } = req.body;
    
    let result;
    switch (type) {
      case 'continuous':
        result = await learningSystem.performContinuousLearning();
        break;
      case 'goal-alignment':
        result = await learningSystem.monitorGoalAlignment();
        break;
      case 'performance-optimization':
        result = await learningSystem.optimizePerformance();
        break;
      case 'knowledge-enhancement':
        result = await learningSystem.enhanceKnowledge();
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'INVALID_LEARNING_TYPE',
          message: 'Invalid learning type'
        });
    }
    
    res.json({
      success: true,
      message: `${type} learning completed successfully`,
      result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'LEARNING_FAILED',
      message: 'Failed to perform learning',
      details: error.message
    });
  }
});

/**
 * Get training configuration
 */
router.get('/config', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const config = learningSystem.trainingConfig;
    
    res.json({
      success: true,
      data: config,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_LEARNING_CONFIG_FAILED',
      message: 'Failed to get learning configuration',
      details: error.message
    });
  }
});

/**
 * Update training configuration
 */
router.put('/config', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const updates = req.body;
    
    // Update configuration
    Object.assign(learningSystem.trainingConfig, updates);
    
    res.json({
      success: true,
      message: 'Learning configuration updated successfully',
      data: learningSystem.trainingConfig,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'UPDATE_LEARNING_CONFIG_FAILED',
      message: 'Failed to update learning configuration',
      details: error.message
    });
  }
});

/**
 * Get learning history
 */
router.get('/history', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const history = {
      successfulOperations: Array.from(learningSystem.learningData.successfulOperations.values()).slice(-limit),
      failedOperations: Array.from(learningSystem.learningData.failedOperations.values()).slice(-limit),
      improvementCycles: learningSystem.improvementCycles,
      adaptationHistory: goalOrientedAI.behaviorAdaptation.adaptationHistory.slice(-limit)
    };
    
    res.json({
      success: true,
      data: history,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_LEARNING_HISTORY_FAILED',
      message: 'Failed to get learning history',
      details: error.message
    });
  }
});

/**
 * Export learning data
 */
router.get('/export', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const exportData = {
      organizationGoals: learningSystem.organizationGoals,
      learningData: learningSystem.learningData,
      performanceMetrics: learningSystem.performanceMetrics,
      trainingConfig: learningSystem.trainingConfig,
      improvementCycles: learningSystem.improvementCycles,
      goalOrientedAI: goalOrientedAI.getSystemStatus(),
      timestamp: new Date()
    };
    
    if (format === 'csv') {
      // Convert to CSV format
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="learning-data.csv"');
      // CSV conversion logic would go here
      res.send('CSV export not implemented yet');
    } else {
      res.json({
        success: true,
        data: exportData,
        timestamp: new Date()
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'EXPORT_LEARNING_DATA_FAILED',
      message: 'Failed to export learning data',
      details: error.message
    });
  }
});

module.exports = router;
