const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// Get anomaly detections
router.get('/anomaly-detections', authenticateToken, checkRole(['head_administrator', 'security_manager', 'developer']), async (req, res) => {
  try {
    const anomaliesCollection = await getCollection('anomaly_detections');
    if (!anomaliesCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const { page = 1, limit = 10, severity, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (type) filter.type = type;

    const anomalies = await anomaliesCollection.find(filter).sort({ detectedAt: -1 }).skip(skip).limit(parseInt(limit)).toArray();
    const total = await anomaliesCollection.countDocuments(filter);

    res.json({
      success: true,
      data: anomalies,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      message: 'Anomaly detections retrieved successfully'
    });
  } catch (error) {
    console.error('Get anomaly detections error:', error);
    res.status(500).json({ success: false, error: 'GET_ANOMALY_DETECTIONS_FAILED', message: 'Failed to get anomaly detections' });
  }
});

module.exports = router;