const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../config/logger');
const { getDb } = require('../config/database');

// @route   GET /api/dashboard/stats
// @desc    Get comprehensive dashboard statistics from real database
// @access  Private
router.get('/stats', 
  authenticateToken,
  requirePermission('read_dashboard'),
  asyncHandler(async (req, res) => {
  // Debug: Check if authentication worked
  console.log('🔍 [dashboard/stats] Route handler called');
  console.log('🔍 [dashboard/stats] req.user:', req.user);
  console.log('🔍 [dashboard/stats] req.headers.authorization:', req.headers.authorization);
  
  logger.info('📊 Fetching comprehensive dashboard stats from database');
  
  try {
    const db = await getDb();
    
    // Get basic statistics
    const totalUsers = await db.collection('users').countDocuments();
    const totalBookings = await db.collection('bookings').countDocuments();
    const totalRevenue = await db.collection('bookings').aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]).toArray();
    
    // Get recent activity
    const recentBookings = await db.collection('bookings')
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    const recentUsers = await db.collection('users')
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .project({ firstName: 1, lastName: 1, email: 1, createdAt: 1 })
      .toArray();
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalBookings,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentActivity: {
          bookings: recentBookings,
          users: recentUsers
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
}));

// POST alternative for getting dashboard statistics
router.post('/stats', 
  authenticateToken,
  requirePermission('read_dashboard'),
  asyncHandler(async (req, res) => {
  // Debug: Check if authentication worked
  console.log('🔍 [dashboard/stats] POST Route handler called');
  console.log('🔍 [dashboard/stats] POST req.user:', req.user);
  console.log('🔍 [dashboard/stats] POST req.headers.authorization:', req.headers.authorization);
  
  logger.info('📊 Fetching comprehensive dashboard stats from database');
  
  try {
    const db = await getDb();
    
    // Get basic statistics
    const totalUsers = await db.collection('users').countDocuments();
    const totalBookings = await db.collection('bookings').countDocuments();
    const totalRevenue = await db.collection('bookings').aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]).toArray();
    
    // Get recent activity
    const recentBookings = await db.collection('bookings')
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    const recentUsers = await db.collection('users')
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .project({ firstName: 1, lastName: 1, email: 1, createdAt: 1 })
      .toArray();
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalBookings,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentActivity: {
          bookings: recentBookings,
          users: recentUsers
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
}));

module.exports = router;
