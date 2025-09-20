const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const rateLimit = require('express-rate-limit');

// Rate limiting
const logsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many log requests from this IP, please try again later.'
});

// Apply rate limiting and authentication to all routes
router.use(logsLimiter);
router.use(authenticateToken);

// ===== LOGS MANAGEMENT =====

// GET /api/v1/logs - Get all logs
router.get('/', checkRole(['head_administrator', 'auditor']), async (req, res) => {
  try {
    const logsCollection = await getCollection('logs');
    
    if (!logsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const { startDate, endDate, level, service } = req.query;
    const filter = {};
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    if (level) filter.level = level;
    if (service) filter.service = service;
    
    const logs = await logsCollection
      .find(filter)
      .sort({ timestamp: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: logs,
      message: 'Logs retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_LOGS_FAILED',
      message: 'Failed to get logs',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
