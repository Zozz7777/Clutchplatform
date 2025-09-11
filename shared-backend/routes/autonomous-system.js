/**
 * Autonomous System Management Routes
 * API endpoints to control and monitor the autonomous backend system
 */

const express = require('express');
const router = express.Router();
const EnhancedAutonomousSystemOrchestrator = require('../services/enhancedAutonomousSystemOrchestrator');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Initialize enhanced autonomous system orchestrator
const autonomousSystem = new EnhancedAutonomousSystemOrchestrator();

/**
 * Start the autonomous system
 */
router.post('/start', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await autonomousSystem.start();
    
    res.json({
      success: true,
      message: 'Autonomous system started successfully',
      result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'START_AUTONOMOUS_SYSTEM_FAILED',
      message: 'Failed to start autonomous system',
      details: error.message
    });
  }
});

/**
 * Stop the autonomous system
 */
router.post('/stop', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await autonomousSystem.stop();
    
    res.json({
      success: true,
      message: 'Autonomous system stopped successfully',
      result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'STOP_AUTONOMOUS_SYSTEM_FAILED',
      message: 'Failed to stop autonomous system',
      details: error.message
    });
  }
});

/**
 * Get system status
 */
router.get('/status', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    const status = autonomousSystem.getSystemStatus();
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_STATUS_FAILED',
      message: 'Failed to get system status',
      details: error.message
    });
  }
});

/**
 * Get AI Team Documentation
 */
router.get('/documentation', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    const documentation = autonomousSystem.getAITeamDocumentation();
    
    res.json({
      success: true,
      data: documentation,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_DOCUMENTATION_FAILED',
      message: 'Failed to get AI team documentation',
      details: error.message
    });
  }
});

/**
 * Get team status
 */
router.get('/team/status', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    const teamStatus = autonomousSystem.autonomousTeam.getTeamStatus();
    
    res.json({
      success: true,
      data: teamStatus,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_TEAM_STATUS_FAILED',
      message: 'Failed to get team status',
      details: error.message
    });
  }
});

/**
 * Get trigger system statistics
 */
router.get('/triggers/stats', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    const triggerStats = autonomousSystem.triggerSystem.getTriggerStats();
    
    res.json({
      success: true,
      data: triggerStats,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_TRIGGER_STATS_FAILED',
      message: 'Failed to get trigger statistics',
      details: error.message
    });
  }
});

/**
 * Get backend manager status
 */
router.get('/backend/status', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    const backendStatus = autonomousSystem.backendManager.getStatus();
    
    res.json({
      success: true,
      data: backendStatus,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_BACKEND_STATUS_FAILED',
      message: 'Failed to get backend manager status',
      details: error.message
    });
  }
});

/**
 * Deploy team member for specific task
 */
router.post('/team/deploy', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { role, task, context } = req.body;
    
    if (!role || !task) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Role and task are required'
      });
    }
    
    const result = await autonomousSystem.autonomousTeam.deployTeamMember(role, task, context || {});
    
    res.json({
      success: true,
      message: 'Team member deployed successfully',
      result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'DEPLOY_TEAM_MEMBER_FAILED',
      message: 'Failed to deploy team member',
      details: error.message
    });
  }
});

/**
 * Create backend item
 */
router.post('/backend/create', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { type, specifications } = req.body;
    
    if (!type || !specifications) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Type and specifications are required'
      });
    }
    
    const result = await autonomousSystem.backendManager.createBackendItem(type, specifications);
    
    res.json({
      success: true,
      message: 'Backend item created successfully',
      result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'CREATE_BACKEND_ITEM_FAILED',
      message: 'Failed to create backend item',
      details: error.message
    });
  }
});

/**
 * Modify backend item
 */
router.post('/backend/modify', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { filePath, modifications } = req.body;
    
    if (!filePath || !modifications) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'File path and modifications are required'
      });
    }
    
    const result = await autonomousSystem.backendManager.modifyBackendItem(filePath, modifications);
    
    res.json({
      success: true,
      message: 'Backend item modified successfully',
      result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'MODIFY_BACKEND_ITEM_FAILED',
      message: 'Failed to modify backend item',
      details: error.message
    });
  }
});

/**
 * Execute trigger manually
 */
router.post('/triggers/execute', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { category, triggerName, context } = req.body;
    
    if (!category || !triggerName) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Category and trigger name are required'
      });
    }
    
    const result = await autonomousSystem.triggerSystem.executeTrigger(category, triggerName, context || {});
    
    res.json({
      success: true,
      message: 'Trigger executed successfully',
      result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'EXECUTE_TRIGGER_FAILED',
      message: 'Failed to execute trigger',
      details: error.message
    });
  }
});

/**
 * Add operation to queue
 */
router.post('/operations/queue', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { type, ...operationData } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Operation type is required'
      });
    }
    
    autonomousSystem.addOperation({
      type,
      ...operationData
    });
    
    res.json({
      success: true,
      message: 'Operation added to queue successfully',
      queueLength: autonomousSystem.operationQueue.length,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'ADD_OPERATION_FAILED',
      message: 'Failed to add operation to queue',
      details: error.message
    });
  }
});

/**
 * Get operation queue status
 */
router.get('/operations/queue', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    const queueStatus = {
      pending: autonomousSystem.operationQueue.length,
      processing: autonomousSystem.processingQueue,
      operations: autonomousSystem.operationQueue.slice(0, 10) // Show first 10 operations
    };
    
    res.json({
      success: true,
      data: queueStatus,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_QUEUE_STATUS_FAILED',
      message: 'Failed to get operation queue status',
      details: error.message
    });
  }
});

/**
 * Perform manual health check
 */
router.post('/health/check', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const healthStatus = await autonomousSystem.performSystemHealthCheck();
    
    res.json({
      success: true,
      message: 'Health check completed',
      data: healthStatus,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'HEALTH_CHECK_FAILED',
      message: 'Failed to perform health check',
      details: error.message
    });
  }
});

/**
 * Perform manual system check
 */
router.post('/system/check', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const systemCheck = await autonomousSystem.performSystemCheck();
    
    res.json({
      success: true,
      message: 'System check completed',
      data: systemCheck,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SYSTEM_CHECK_FAILED',
      message: 'Failed to perform system check',
      details: error.message
    });
  }
});

/**
 * Perform manual performance check
 */
router.post('/performance/check', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const performanceCheck = await autonomousSystem.performPerformanceCheck();
    
    res.json({
      success: true,
      message: 'Performance check completed',
      data: performanceCheck,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'PERFORMANCE_CHECK_FAILED',
      message: 'Failed to perform performance check',
      details: error.message
    });
  }
});

/**
 * Get system configuration
 */
router.get('/config', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const config = autonomousSystem.config;
    
    res.json({
      success: true,
      data: config,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_CONFIG_FAILED',
      message: 'Failed to get system configuration',
      details: error.message
    });
  }
});

/**
 * Update system configuration
 */
router.put('/config', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const updates = req.body;
    
    // Update configuration
    Object.assign(autonomousSystem.config, updates);
    
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: autonomousSystem.config,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'UPDATE_CONFIG_FAILED',
      message: 'Failed to update system configuration',
      details: error.message
    });
  }
});

/**
 * Get system logs
 */
router.get('/logs', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    const { type = 'all', limit = 100 } = req.query;
    
    // This would integrate with your logging system
    const logs = {
      orchestrator: [],
      autonomousTeam: [],
      triggerSystem: [],
      backendManager: []
    };
    
    res.json({
      success: true,
      data: logs,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_LOGS_FAILED',
      message: 'Failed to get system logs',
      details: error.message
    });
  }
});

/**
 * Get system metrics
 */
router.get('/metrics', authenticateToken, requireRole(['admin', 'developer']), async (req, res) => {
  try {
    const { period = '1h' } = req.query;
    
    // This would integrate with your metrics system
    const metrics = {
      systemLoad: autonomousSystem.systemState.systemLoad,
      memoryUsage: autonomousSystem.systemState.memoryUsage,
      cpuUsage: autonomousSystem.systemState.cpuUsage,
      totalOperations: autonomousSystem.systemState.totalOperations,
      successfulOperations: autonomousSystem.systemState.successfulOperations,
      failedOperations: autonomousSystem.systemState.failedOperations,
      uptime: autonomousSystem.systemState.uptime
    };
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_METRICS_FAILED',
      message: 'Failed to get system metrics',
      details: error.message
    });
  }
});

module.exports = router;
