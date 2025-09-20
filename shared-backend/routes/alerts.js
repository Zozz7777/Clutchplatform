const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const rateLimit = require('express-rate-limit');

// Rate limiting
const alertsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many alert requests from this IP, please try again later.'
});

// Apply rate limiting and authentication to all routes
router.use(alertsLimiter);
router.use(authenticateToken);

// ===== ALERTS MANAGEMENT =====

// GET /api/v1/alerts - Get all alerts
router.get('/', checkRole(['head_administrator', 'security_manager']), async (req, res) => {
  try {
    const alertsCollection = await getCollection('alerts');
    
    if (!alertsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const { startDate, endDate, severity, status } = req.query;
    const filter = {};
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    
    const alerts = await alertsCollection
      .find(filter)
      .sort({ timestamp: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: alerts,
      message: 'Alerts retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_ALERTS_FAILED',
      message: 'Failed to get alerts',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
