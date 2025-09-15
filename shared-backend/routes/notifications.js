/**
 * Notifications Routes
 * Handles user notifications and alerts
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/optimized-database');

// GET /api/v1/notifications - Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notificationsCollection = await getCollection('notifications');
    
    // Build filter
    const filter = { userId: req.user.userId };
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    // Get notifications with pagination
    const [notifications, total] = await Promise.all([
      notificationsCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      notificationsCollection.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Notifications retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_NOTIFICATIONS_FAILED',
      message: 'Failed to retrieve notifications',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/notifications/unread - Get unread notifications
router.get('/unread', authenticateToken, async (req, res) => {
  try {
    const notificationsCollection = await getCollection('notifications');
    
    const unreadNotifications = await notificationsCollection
      .find({ 
        userId: req.user.userId, 
        status: 'unread' 
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: {
        notifications: unreadNotifications,
        count: unreadNotifications.length
      },
      message: 'Unread notifications retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get unread notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_UNREAD_NOTIFICATIONS_FAILED',
      message: 'Failed to retrieve unread notifications',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/notifications - Create notification (admin only)
router.post('/', authenticateToken, requireRole(['admin', 'hr']), async (req, res) => {
  try {
    const { userId, title, message, type = 'info', priority = 'medium' } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'userId, title, and message are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const notificationsCollection = await getCollection('notifications');
    
    const newNotification = {
      userId,
      title,
      message,
      type,
      priority,
      status: 'unread',
      createdAt: new Date(),
      readAt: null,
      createdBy: req.user.userId
    };
    
    const result = await notificationsCollection.insertOne(newNotification);
    
    res.status(201).json({
      success: true,
      data: {
        notification: {
          ...newNotification,
          _id: result.insertedId
        }
      },
      message: 'Notification created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_NOTIFICATION_FAILED',
      message: 'Failed to create notification',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const notificationsCollection = await getCollection('notifications');
    
    // Check if notification exists and belongs to user
    const notification = await notificationsCollection.findOne({
      _id: id,
      userId: req.user.userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'NOTIFICATION_NOT_FOUND',
        message: 'Notification not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Update notification status
    const result = await notificationsCollection.updateOne(
      { _id: id, userId: req.user.userId },
      { 
        $set: { 
          status: 'read',
          readAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'Failed to mark notification as read',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: 'MARK_READ_FAILED',
      message: 'Failed to mark notification as read',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/notifications/read-all - Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const notificationsCollection = await getCollection('notifications');
    
    const result = await notificationsCollection.updateMany(
      { 
        userId: req.user.userId,
        status: 'unread'
      },
      { 
        $set: { 
          status: 'read',
          readAt: new Date()
        }
      }
    );
    
    res.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} notifications marked as read`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: 'MARK_ALL_READ_FAILED',
      message: 'Failed to mark all notifications as read',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/notifications/:id - Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const notificationsCollection = await getCollection('notifications');
    
    // Check if notification exists and belongs to user
    const notification = await notificationsCollection.findOne({
      _id: id,
      userId: req.user.userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'NOTIFICATION_NOT_FOUND',
        message: 'Notification not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const result = await notificationsCollection.deleteOne({
      _id: id,
      userId: req.user.userId
    });
    
    if (result.deletedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'DELETE_FAILED',
        message: 'Failed to delete notification',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_NOTIFICATION_FAILED',
      message: 'Failed to delete notification',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/notifications/stats - Get notification statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const notificationsCollection = await getCollection('notifications');
    
    const [total, unread, byType] = await Promise.all([
      notificationsCollection.countDocuments({ userId: req.user.userId }),
      notificationsCollection.countDocuments({ userId: req.user.userId, status: 'unread' }),
      notificationsCollection.aggregate([
        { $match: { userId: req.user.userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]).toArray()
    ]);
    
    const stats = {
      total,
      unread,
      read: total - unread,
      byType: byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };
    
    res.json({
      success: true,
      data: { stats },
      message: 'Notification statistics retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_NOTIFICATION_STATS_FAILED',
      message: 'Failed to retrieve notification statistics',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;