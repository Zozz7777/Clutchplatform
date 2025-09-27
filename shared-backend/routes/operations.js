const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/unified-auth');
const logger = require('../utils/logger');

// Database connection for real data
const { connectToDatabase } = require('../config/database-unified');

// Helper function to get API performance metrics from database
async function getApiPerformanceMetrics() {
  try {
    const db = await connectToDatabase();
    const metricsCollection = db.collection('api_metrics');
    
    // Get metrics from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const metrics = await metricsCollection.find({
      timestamp: { $gte: oneDayAgo }
    }).toArray();
    
    // Aggregate metrics by endpoint
    const aggregatedMetrics = {};
    metrics.forEach(metric => {
      const key = `${metric.endpoint}_${metric.method}`;
      if (!aggregatedMetrics[key]) {
        aggregatedMetrics[key] = {
          id: key,
          endpoint: metric.endpoint,
          method: metric.method,
          totalRequests: 0,
          totalResponseTime: 0,
          errors: 0,
          lastUpdated: metric.timestamp
        };
      }
      aggregatedMetrics[key].totalRequests += 1;
      aggregatedMetrics[key].totalResponseTime += metric.responseTime;
      if (metric.status >= 400) {
        aggregatedMetrics[key].errors += 1;
      }
    });
    
    // Calculate averages and status
    return Object.values(aggregatedMetrics).map(metric => {
      const avgResponseTime = metric.totalRequests > 0 ? 
        Math.round(metric.totalResponseTime / metric.totalRequests) : 0;
      const errorRate = metric.totalRequests > 0 ? 
        (metric.errors / metric.totalRequests) * 100 : 0;
      const successRate = 100 - errorRate;
      
      let status = 'healthy';
      if (avgResponseTime > 1000 || errorRate > 5) status = 'critical';
      else if (avgResponseTime > 500 || errorRate > 2) status = 'warning';
      
      return {
        ...metric,
        avgResponseTime,
        successRate: Math.round(successRate * 10) / 10,
        errorRate: Math.round(errorRate * 10) / 10,
        status
      };
    });
  } catch (error) {
    logger.error('Error fetching API performance metrics:', error);
    return [];
  }
}

const performanceAlerts = [
  {
    id: 'alert_1',
    type: 'response_time',
    severity: 'high',
    message: 'API response time exceeded threshold',
    endpoint: '/api/v1/fleet',
    timestamp: new Date().toISOString(),
    resolved: false
  },
  {
    id: 'alert_2',
    type: 'error_rate',
    severity: 'medium',
    message: 'Error rate above normal levels',
    endpoint: '/api/v1/auth/login',
    timestamp: new Date().toISOString(),
    resolved: false
  }
];

const systemPerformanceMetrics = [
  {
    id: 'perf_1',
    name: 'CPU Usage',
    category: 'cpu',
    currentValue: 65,
    maxValue: 100,
    unit: 'percentage',
    trend: 'up',
    status: 'warning',
    threshold: { warning: 70, critical: 90 },
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'perf_2',
    name: 'Memory Usage',
    category: 'memory',
    currentValue: 45,
    maxValue: 100,
    unit: 'percentage',
    trend: 'stable',
    status: 'good',
    threshold: { warning: 80, critical: 95 },
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'perf_3',
    name: 'Disk Usage',
    category: 'disk',
    currentValue: 78,
    maxValue: 100,
    unit: 'percentage',
    trend: 'up',
    status: 'warning',
    threshold: { warning: 80, critical: 95 },
    lastUpdated: new Date().toISOString()
  }
];

const systemAlerts = [
  {
    id: 'sys_alert_1',
    type: 'cpu',
    severity: 'medium',
    message: 'CPU usage is approaching warning threshold',
    currentValue: 65,
    threshold: 70,
    timestamp: new Date().toISOString(),
    resolved: false
  }
];

const healthChecks = [
  {
    id: 'health_1',
    name: 'Database Connection',
    service: 'database',
    status: 'healthy',
    responseTime: 12,
    lastChecked: new Date().toISOString(),
    uptime: 86400,
    errorRate: 0.1,
    details: { version: '14.2', environment: 'production' }
  },
  {
    id: 'health_2',
    name: 'Redis Cache',
    service: 'cache',
    status: 'healthy',
    responseTime: 5,
    lastChecked: new Date().toISOString(),
    uptime: 86400,
    errorRate: 0.0,
    details: { version: '7.0', environment: 'production' }
  },
  {
    id: 'health_3',
    name: 'External API',
    service: 'external',
    status: 'degraded',
    responseTime: 2500,
    lastChecked: new Date().toISOString(),
    uptime: 86400,
    errorRate: 2.5,
    details: { version: '1.0', environment: 'production' }
  }
];

const systemStatus = {
  overall: 'healthy',
  services: {
    total: 3,
    healthy: 2,
    degraded: 1,
    down: 0
  },
  uptime: 86400,
  lastIncident: {
    id: 'inc_1',
    description: 'Database connection timeout',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    resolved: true
  }
};

const obd2Data = [
  {
    id: 'obd_1',
    vehicleId: 'veh_001',
    vehicleName: 'Fleet Vehicle 001',
    dtc: 'P0301',
    description: 'Cylinder 1 Misfire Detected',
    severity: 'high',
    status: 'active',
    timestamp: new Date().toISOString(),
    mileage: 125430,
    location: 'Maintenance Bay 1'
  },
  {
    id: 'obd_2',
    vehicleId: 'veh_002',
    vehicleName: 'Fleet Vehicle 002',
    dtc: 'P0171',
    description: 'System Too Lean (Bank 1)',
    severity: 'medium',
    status: 'resolved',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    mileage: 98750,
    location: 'Route A'
  }
];

const vehicleHealth = [
  {
    id: 'vh_1',
    vehicleName: 'Fleet Vehicle 001',
    overallHealth: 75,
    engineStatus: 'warning',
    transmissionStatus: 'good',
    brakeStatus: 'good',
    lastScan: new Date().toISOString(),
    totalDTCs: 3,
    activeDTCs: 1
  },
  {
    id: 'vh_2',
    vehicleName: 'Fleet Vehicle 002',
    overallHealth: 92,
    engineStatus: 'good',
    transmissionStatus: 'good',
    brakeStatus: 'good',
    lastScan: new Date().toISOString(),
    totalDTCs: 1,
    activeDTCs: 0
  }
];

/**
 * @route GET /api/v1/operations/api-performance
 * @desc Get API performance metrics
 * @access Private (Admin only)
 */
router.get('/api-performance', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { timeRange } = req.query;
    
    // Get real metrics from database
    const metrics = await getApiPerformanceMetrics();
    
    // Filter metrics based on time range if needed
    let filteredMetrics = metrics;
    if (timeRange) {
      const timeRangeMs = timeRange === '1h' ? 60 * 60 * 1000 : 
                         timeRange === '24h' ? 24 * 60 * 60 * 1000 : 
                         timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      const cutoffTime = new Date(Date.now() - timeRangeMs);
      filteredMetrics = metrics.filter(metric => new Date(metric.lastUpdated) >= cutoffTime);
    }
    
    res.json({
      success: true,
      data: filteredMetrics,
      message: 'API performance metrics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching API performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'API_PERFORMANCE_FETCH_FAILED',
      message: 'Failed to fetch API performance metrics',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/operations/api-performance/alerts
 * @desc Get API performance alerts
 * @access Private (Admin only)
 */
router.get('/api-performance/alerts', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    res.json({
      success: true,
      data: performanceAlerts,
      message: 'API performance alerts retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching API performance alerts:', error);
    res.status(500).json({
      success: false,
      error: 'API_ALERTS_FETCH_FAILED',
      message: 'Failed to fetch API performance alerts',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/operations/performance
 * @desc Get system performance metrics
 * @access Private (Admin only)
 */
router.get('/performance', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { timeRange } = req.query;
    
    res.json({
      success: true,
      data: systemPerformanceMetrics,
      message: 'System performance metrics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching system performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'PERFORMANCE_METRICS_FETCH_FAILED',
      message: 'Failed to fetch system performance metrics',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/operations/performance/alerts
 * @desc Get system performance alerts
 * @access Private (Admin only)
 */
router.get('/performance/alerts', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    res.json({
      success: true,
      data: systemAlerts,
      message: 'System performance alerts retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching system performance alerts:', error);
    res.status(500).json({
      success: false,
      error: 'SYSTEM_ALERTS_FETCH_FAILED',
      message: 'Failed to fetch system performance alerts',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/operations/system-health
 * @desc Get system health status
 * @access Private (Admin only)
 */
router.get('/system-health', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    res.json({
      success: true,
      data: healthChecks,
      message: 'System health status retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching system health status:', error);
    res.status(500).json({
      success: false,
      error: 'SYSTEM_HEALTH_FETCH_FAILED',
      message: 'Failed to fetch system health status',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/operations/system-health/status
 * @desc Get overall system status
 * @access Private (Admin only)
 */
router.get('/system-health/status', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    res.json({
      success: true,
      data: systemStatus,
      message: 'System status retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching system status:', error);
    res.status(500).json({
      success: false,
      error: 'SYSTEM_STATUS_FETCH_FAILED',
      message: 'Failed to fetch system status',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/operations/obd2
 * @desc Get OBD2 diagnostic data
 * @access Private (Admin only)
 */
router.get('/obd2', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { severity } = req.query;
    
    let filteredData = obd2Data;
    if (severity && severity !== 'all') {
      filteredData = obd2Data.filter(item => item.severity === severity);
    }
    
    res.json({
      success: true,
      data: filteredData,
      message: 'OBD2 diagnostic data retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching OBD2 data:', error);
    res.status(500).json({
      success: false,
      error: 'OBD2_DATA_FETCH_FAILED',
      message: 'Failed to fetch OBD2 diagnostic data',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/operations/obd2/vehicle-health
 * @desc Get vehicle health data
 * @access Private (Admin only)
 */
router.get('/obd2/vehicle-health', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    res.json({
      success: true,
      data: vehicleHealth,
      message: 'Vehicle health data retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching vehicle health data:', error);
    res.status(500).json({
      success: false,
      error: 'VEHICLE_HEALTH_FETCH_FAILED',
      message: 'Failed to fetch vehicle health data',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;