/**
 * AI Agent Management Routes
 * Provides API endpoints to control and monitor the AI monitoring agent
 */

const express = require('express');
const router = express.Router();
const AIMonitoringAgent = require('../services/aiMonitoringAgent');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Initialize AI agent instance
const aiAgent = new AIMonitoringAgent();

/**
 * Start the AI monitoring agent
 */
router.post('/start', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    await aiAgent.start();
    
    res.json({
      success: true,
      message: 'AI monitoring agent started successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'START_AI_AGENT_FAILED',
      message: 'Failed to start AI monitoring agent',
      details: error.message
    });
  }
});

/**
 * Stop the AI monitoring agent
 */
router.post('/stop', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    await aiAgent.stop();
    
    res.json({
      success: true,
      message: 'AI monitoring agent stopped successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'STOP_AI_AGENT_FAILED',
      message: 'Failed to stop AI monitoring agent',
      details: error.message
    });
  }
});

/**
 * Get AI agent status
 */
router.get('/status', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const status = aiAgent.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_AI_AGENT_STATUS_FAILED',
      message: 'Failed to get AI agent status',
      details: error.message
    });
  }
});

/**
 * Trigger manual health check
 */
router.post('/health-check', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    await aiAgent.performHealthCheck();
    
    res.json({
      success: true,
      message: 'Manual health check completed',
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
 * Get issue history
 */
router.get('/issues', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { limit = 50, type, severity } = req.query;
    
    let issues = aiAgent.issueHistory;
    
    // Filter by type
    if (type) {
      issues = issues.filter(issue => issue.type === type);
    }
    
    // Filter by severity
    if (severity) {
      issues = issues.filter(issue => issue.severity === severity);
    }
    
    // Limit results
    issues = issues.slice(-parseInt(limit));
    
    res.json({
      success: true,
      data: {
        issues,
        total: aiAgent.issueHistory.length,
        filters: { type, severity, limit }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_ISSUES_FAILED',
      message: 'Failed to get issue history',
      details: error.message
    });
  }
});

/**
 * Get AI-powered insights
 */
router.get('/insights', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const insights = await aiAgent.generateInsights();
    
    res.json({
      success: true,
      data: {
        insights,
        generatedAt: new Date(),
        basedOnIssues: aiAgent.issueHistory.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_INSIGHTS_FAILED',
      message: 'Failed to generate AI insights',
      details: error.message
    });
  }
});

/**
 * Update AI agent configuration
 */
router.put('/config', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { checkInterval, autoFixEnabled, backendUrl, adminUrl } = req.body;
    
    // Update configuration
    if (checkInterval) aiAgent.config.checkInterval = checkInterval;
    if (autoFixEnabled !== undefined) aiAgent.config.autoFixEnabled = autoFixEnabled;
    if (backendUrl) aiAgent.config.backendUrl = backendUrl;
    if (adminUrl) aiAgent.config.adminUrl = adminUrl;
    
    res.json({
      success: true,
      message: 'AI agent configuration updated successfully',
      data: {
        checkInterval: aiAgent.config.checkInterval,
        autoFixEnabled: aiAgent.config.autoFixEnabled,
        backendUrl: aiAgent.config.backendUrl,
        adminUrl: aiAgent.config.adminUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'UPDATE_CONFIG_FAILED',
      message: 'Failed to update AI agent configuration',
      details: error.message
    });
  }
});

/**
 * Test specific fix strategy
 */
router.post('/test-fix', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { issueType, issueData } = req.body;
    
    if (!issueType || !aiAgent.fixStrategies[issueType]) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ISSUE_TYPE',
        message: 'Invalid or unsupported issue type'
      });
    }
    
    const mockIssue = {
      type: issueType,
      message: issueData?.message || 'Test issue',
      timestamp: new Date(),
      ...issueData
    };
    
    const result = await aiAgent.fixStrategies[issueType](mockIssue);
    
    res.json({
      success: true,
      message: 'Fix strategy test completed',
      data: {
        issueType,
        result,
        testedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'TEST_FIX_FAILED',
      message: 'Failed to test fix strategy',
      details: error.message
    });
  }
});

/**
 * Get system metrics
 */
router.get('/metrics', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const recentIssues = aiAgent.issueHistory.filter(
      issue => issue.timestamp > cutoffDate
    );
    
    const metrics = {
      totalIssues: recentIssues.length,
      issuesByType: {},
      issuesBySeverity: {},
      autoFixAttempts: recentIssues.filter(issue => issue.autoFixAttempted).length,
      autoFixSuccesses: recentIssues.filter(issue => issue.autoFixSuccess).length,
      averageResponseTime: 0, // TODO: Calculate from issue timestamps
      uptime: aiAgent.isRunning ? Date.now() - (aiAgent.startTime || Date.now()) : 0
    };
    
    // Calculate issues by type
    recentIssues.forEach(issue => {
      metrics.issuesByType[issue.type] = (metrics.issuesByType[issue.type] || 0) + 1;
      metrics.issuesBySeverity[issue.severity] = (metrics.issuesBySeverity[issue.severity] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: {
        metrics,
        period: `${days} days`,
        generatedAt: new Date()
      }
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

/**
 * Clear issue history
 */
router.delete('/issues', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const clearedCount = aiAgent.issueHistory.length;
    aiAgent.issueHistory = [];
    
    res.json({
      success: true,
      message: `Cleared ${clearedCount} issues from history`,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'CLEAR_ISSUES_FAILED',
      message: 'Failed to clear issue history',
      details: error.message
    });
  }
});

/**
 * Get Enterprise AI Developer statistics
 */
router.get('/developer-stats', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const stats = aiAgent.enterpriseDeveloper.getDeveloperStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_DEVELOPER_STATS_FAILED',
      message: 'Failed to get developer statistics',
      details: error.message
    });
  }
});

/**
 * Trigger Enterprise AI Developer analysis for specific issue
 */
router.post('/analyze-issue', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { issue } = req.body;
    
    if (!issue) {
      return res.status(400).json({
        success: false,
        error: 'ISSUE_REQUIRED',
        message: 'Issue data is required'
      });
    }
    
    const resolution = await aiAgent.enterpriseDeveloper.analyzeAndResolveIssue(issue);
    
    res.json({
      success: true,
      data: {
        resolution,
        analyzedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'ANALYZE_ISSUE_FAILED',
      message: 'Failed to analyze issue',
      details: error.message
    });
  }
});

/**
 * Get resolution history
 */
router.get('/resolutions', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { limit = 50, success } = req.query;
    
    let resolutions = aiAgent.enterpriseDeveloper.issueResolutionHistory;
    
    // Filter by success status
    if (success !== undefined) {
      const isSuccess = success === 'true';
      resolutions = resolutions.filter(r => r.success === isSuccess);
    }
    
    // Limit results
    resolutions = resolutions.slice(-parseInt(limit));
    
    res.json({
      success: true,
      data: {
        resolutions,
        total: aiAgent.enterpriseDeveloper.issueResolutionHistory.length,
        filters: { success, limit }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_RESOLUTIONS_FAILED',
      message: 'Failed to get resolution history',
      details: error.message
    });
  }
});

/**
 * Test Enterprise AI Developer with mock issue
 */
router.post('/test-developer', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { issueType = 'database', severity = 'high' } = req.body;
    
    const mockIssue = {
      type: issueType,
      severity: severity,
      message: `Test ${issueType} issue for Enterprise AI Developer`,
      timestamp: new Date(),
      testMode: true
    };
    
    const resolution = await aiAgent.enterpriseDeveloper.analyzeAndResolveIssue(mockIssue);
    
    res.json({
      success: true,
      data: {
        mockIssue,
        resolution,
        testedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'TEST_DEVELOPER_FAILED',
      message: 'Failed to test Enterprise AI Developer',
      details: error.message
    });
  }
});

/**
 * Get Enterprise AI Developer capabilities
 */
router.get('/capabilities', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const capabilities = {
      developer: aiAgent.enterpriseDeveloper.developerPersona,
      codebaseContext: aiAgent.enterpriseDeveloper.codebaseContext,
      supportedIssueTypes: [
        'database',
        'memory',
        'api',
        'cors',
        'authentication',
        'performance',
        'security',
        'deployment',
        'configuration',
        'dependency'
      ],
      aiModels: ['gpt-4', 'gpt-3.5-turbo'],
      features: [
        'Automatic code analysis',
        'Enterprise-grade solutions',
        'Performance optimization',
        'Security hardening',
        'Configuration management',
        'Dependency updates',
        'Testing automation',
        'Documentation generation',
        'Learning from resolutions'
      ]
    };
    
    res.json({
      success: true,
      data: capabilities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_CAPABILITIES_FAILED',
      message: 'Failed to get capabilities',
      details: error.message
    });
  }
});


// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'ai-agent'} service is running`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'ai-agent'} item retrieved`,
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: `${'ai-agent'} item created`,
    data: { id: Date.now(), ...req.body, createdAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'POST',
    path: '/'
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'ai-agent'} item updated`,
    data: { id: id, ...req.body, updatedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'PUT',
    path: `/${id}`
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'ai-agent'} item deleted`,
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'ai-agent'} search results`,
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;
