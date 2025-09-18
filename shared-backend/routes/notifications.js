const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// GET /api/v1/notifications - Get all notifications for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notificationsCollection = await getCollection('notifications');
    
    if (!notificationsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get notifications for the current user
    const notifications = await notificationsCollection
      .find({ 
        userId: req.user.userId || req.user.id,
        isRead: false 
      })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    res.json({
      success: true,
      data: notifications || [],
      message: 'Notifications retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/notifications/all - Get all notifications (including read ones)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const notificationsCollection = await getCollection('notifications');
    
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const notifications = await notificationsCollection
      .find({ userId: req.user.userId || req.user.id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await notificationsCollection.countDocuments({ 
      userId: req.user.userId || req.user.id 
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'All notifications retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch all notifications',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/notifications - Create a new notification
router.post('/', authenticateToken, checkRole(['head_administrator', 'admin']), async (req, res) => {
  try {
    const { title, message, type = 'info', priority = 'medium', targetUsers = [] } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Title and message are required',
        timestamp: new Date().toISOString()
      });
    }

    const notificationsCollection = await getCollection('notifications');
    
    const notification = {
      title,
      message,
      type,
      priority,
      targetUsers: targetUsers.length > 0 ? targetUsers : ['all'],
      createdBy: req.user.userId || req.user.id,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    const result = await notificationsCollection.insertOne(notification);

    res.status(201).json({
      success: true,
      data: { id: result.insertedId, ...notification },
      message: 'Notification created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const notificationsCollection = await getCollection('notifications');
    
    const result = await notificationsCollection.updateOne(
      { 
        _id: new require('mongodb').ObjectId(id),
        userId: req.user.userId || req.user.id 
      },
      { 
        $set: { 
          isRead: true,
          readAt: new Date().toISOString()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
      message: error.message,
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
        userId: req.user.userId || req.user.id,
        isRead: false 
      },
      { 
        $set: { 
          isRead: true,
          readAt: new Date().toISOString()
        } 
      }
    );

    res.json({
      success: true,
      data: { updatedCount: result.modifiedCount },
      message: `${result.modifiedCount} notifications marked as read`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/notifications/:id - Delete a notification
router.delete('/:id', authenticateToken, checkRole(['head_administrator', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const notificationsCollection = await getCollection('notifications');
    
    const result = await notificationsCollection.deleteOne({
      _id: new require('mongodb').ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/notifications/stats - Get notification statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const notificationsCollection = await getCollection('notifications');
    
    const userId = req.user.userId || req.user.id;
    
    const [total, unread, byType] = await Promise.all([
      notificationsCollection.countDocuments({ userId }),
      notificationsCollection.countDocuments({ userId, isRead: false }),
      notificationsCollection.aggregate([
        { $match: { userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]).toArray()
    ]);

    res.json({
      success: true,
      data: {
        total,
        unread,
        read: total - unread,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      message: 'Notification statistics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification statistics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;