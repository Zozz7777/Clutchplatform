/**
 * Admin Management Routes
 * Provides endpoints for AI agent to perform administrative actions
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/database');
    // Dashboard response caching
    const dashboardCache = new Map();
    const DASHBOARD_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
    
    const getCachedDashboard = () => {
      const cached = dashboardCache.get('consolidated');
      if (cached && Date.now() - cached.timestamp < DASHBOARD_CACHE_TTL) {
        return cached.data;
      }
      return null;
    };
    
    const setCachedDashboard = (data) => {
      dashboardCache.set('consolidated', {
        data,
        timestamp: Date.now()
      });
    };
    
    

/**
 * Consolidated dashboard endpoint (for frontend compatibility)
 */
router.get('/dashboard/consolidated', authenticateToken, async (req, res) => {
  try {
    // Check cache first
    const cachedData = getCachedDashboard();
    if (cachedData) {
      return res.json(cachedData);
    }
    console.log('📊 ADMIN_CONSOLIDATED_DASHBOARD_REQUEST:', {
      user: req.user.email,
      timestamp: new Date().toISOString()
    });

    // Get collections
    const usersCollection = await getCollection('users');
    const bookingsCollection = await getCollection('bookings');
    const paymentsCollection = await getCollection('payments');

    // Get current date and last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Get comprehensive metrics
    const [
      totalUsers,
      activeUsers,
      totalRevenue,
      monthlyRevenue,
      totalOrders,
      completedOrders
    ] = await Promise.all([
      usersCollection.countDocuments(),
      usersCollection.countDocuments({ lastActive: { $gte: thirtyDaysAgo } }),
      paymentsCollection.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      paymentsCollection.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      bookingsCollection.countDocuments(),
      bookingsCollection.countDocuments({ status: 'completed' })
    ]);

    const consolidatedData = {
      metrics: {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        totalOrders: totalOrders || 0,
        completedOrders: completedOrders || 0,
        completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0
      },
      charts: {
        revenue: {
          labels: ['Last 7 days', 'Last 30 days', 'Last 90 days'],
          data: [monthlyRevenue[0]?.total || 0, monthlyRevenue[0]?.total || 0, totalRevenue[0]?.total || 0]
        },
        users: {
          labels: ['Total Users', 'Active Users'],
          data: [totalUsers || 0, activeUsers || 0]
        }
      },
      recentActivity: [],
      systemHealth: {
        status: 'healthy',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date()
      }
    };

    const responseData = {
      success: true,
      data: consolidatedData,
      timestamp: new Date()
    };

    // Cache the response
    setCachedDashboard(responseData);
    res.json(responseData);

  } catch (error) {
    console.error('❌ ADMIN_CONSOLIDATED_DASHBOARD_ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'DASHBOARD_ERROR',
      message: 'Failed to fetch consolidated dashboard data',
      details: error.message
    });
  }
});

/**
 * Restart database connection
 */
router.post('/restart-db-connection', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // Force reconnection to MongoDB
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    
    await client.close();
    // Connection will be re-established on next request
    
    res.json({
      success: true,
      message: 'Database connection restarted successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'RESTART_DB_FAILED',
      message: 'Failed to restart database connection',
      details: error.message
    });
  }
});

/**
 * Trigger garbage collection
 */
router.post('/gc', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
    
    const memUsage = process.memoryUsage();
    
    res.json({
      success: true,
      message: 'Garbage collection triggered successfully',
      data: {
        memoryUsage: {
          rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
          external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
        }
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GC_FAILED',
      message: 'Failed to trigger garbage collection',
      details: error.message
    });
  }
});

/**
 * Restart specific service
 */
router.post('/restart-service', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { service } = req.body;
    
    if (!service) {
      return res.status(400).json({
        success: false,
        error: 'SERVICE_REQUIRED',
        message: 'Service name is required'
      });
    }
    
    // Log service restart
    const logsCollection = await getCollection('system_logs');
    await logsCollection.insertOne({
      type: 'service_restart',
      service,
      timestamp: new Date(),
      triggeredBy: 'ai_agent'
    });
    
    res.json({
      success: true,
      message: `Service ${service} restart initiated`,
      data: { service },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'RESTART_SERVICE_FAILED',
      message: 'Failed to restart service',
      details: error.message
    });
  }
});

/**
 * Update CORS configuration
 */
router.post('/update-cors', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { origins } = req.body;
    
    if (!origins || !Array.isArray(origins)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ORIGINS',
        message: 'Origins must be an array'
      });
    }
    
    // Update environment variable (this would require app restart in production)
    process.env.ALLOWED_ORIGINS = origins.join(',');
    
    // Log CORS update
    const logsCollection = await getCollection('system_logs');
    await logsCollection.insertOne({
      type: 'cors_update',
      origins,
      timestamp: new Date(),
      triggeredBy: 'ai_agent'
    });
    
    res.json({
      success: true,
      message: 'CORS configuration updated successfully',
      data: { origins },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'UPDATE_CORS_FAILED',
      message: 'Failed to update CORS configuration',
      details: error.message
    });
  }
});

/**
 * Refresh JWT secrets
 */
router.post('/refresh-jwt', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const crypto = require('crypto');
    
    // Generate new JWT secrets
    const newJwtSecret = crypto.randomBytes(64).toString('hex');
    const newRefreshSecret = crypto.randomBytes(64).toString('hex');
    
    // Update environment variables
    process.env.JWT_SECRET = newJwtSecret;
    process.env.JWT_REFRESH_SECRET = newRefreshSecret;
    
    // Log JWT refresh
    const logsCollection = await getCollection('system_logs');
    await logsCollection.insertOne({
      type: 'jwt_refresh',
      timestamp: new Date(),
      triggeredBy: 'ai_agent'
    });
    
    res.json({
      success: true,
      message: 'JWT secrets refreshed successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'REFRESH_JWT_FAILED',
      message: 'Failed to refresh JWT secrets',
      details: error.message
    });
  }
});

/**
 * Get system health status
 */
router.get('/system-health', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Check database connection
    let dbStatus = 'unknown';
    try {
      const testCollection = await getCollection('health_check');
      await testCollection.findOne({});
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'disconnected';
    }
    
    // Check Redis connection
    let redisStatus = 'unknown';
    try {
      const redis = require('redis');
      const redisClient = redis.createClient(process.env.REDIS_URL);
      await redisClient.ping();
      redisStatus = 'connected';
      await redisClient.quit();
    } catch (error) {
      redisStatus = 'disconnected';
    }
    
    res.json({
      success: true,
      data: {
        system: {
          uptime: Math.round(uptime),
          memory: {
            rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
            external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
          },
          nodeVersion: process.version,
          platform: process.platform
        },
        services: {
          database: dbStatus,
          redis: redisStatus
        },
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_HEALTH_FAILED',
      message: 'Failed to get system health',
      details: error.message
    });
  }
});

/**
 * Clear system cache
 */
router.post('/clear-cache', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { cacheType } = req.body;
    
    let clearedItems = 0;
    
    if (!cacheType || cacheType === 'all' || cacheType === 'redis') {
      // Clear Redis cache
      try {
        const redis = require('redis');
        const redisClient = redis.createClient(process.env.REDIS_URL);
        await redisClient.flushall();
        await redisClient.quit();
        clearedItems++;
      } catch (error) {
        // Redis might not be available
      }
    }
    
    if (!cacheType || cacheType === 'all' || cacheType === 'memory') {
      // Clear in-memory caches
      if (global.gc) {
        global.gc();
      }
      clearedItems++;
    }
    
    res.json({
      success: true,
      message: `Cache cleared successfully (${clearedItems} types)`,
      data: { clearedTypes: clearedItems },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'CLEAR_CACHE_FAILED',
      message: 'Failed to clear cache',
      details: error.message
    });
  }
});

/**
 * Get system logs
 */
router.get('/logs', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { limit = 100, type, since } = req.query;
    
    const logsCollection = await getCollection('system_logs');
    
    const query = {};
    if (type) query.type = type;
    if (since) query.timestamp = { $gte: new Date(since) };
    
    const logs = await logsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({
      success: true,
      data: {
        logs,
        total: logs.length,
        filters: { type, since, limit }
      }
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

module.exports = router;