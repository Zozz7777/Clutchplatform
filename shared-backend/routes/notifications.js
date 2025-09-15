/**
 * Notifications Routes
 * Handles user notifications and alerts
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/database-unified');

// GET /api/v1/notifications - Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Mock notifications data
    const notifications = [
      {
        id: 'notif-001',
        userId: req.user.userId,
        title: 'Service Reminder',
        message: 'Your vehicle service is due in 7 days.',
        type: 'reminder',
        status: 'unread',
        priority: 'medium',
        createdAt: '2024-01-15T09:00:00Z',
        readAt: null
      },
      {
        id: 'notif-002',
        userId: req.user.userId,
        title: 'Payment Confirmed',
        message: 'Your payment of AED 150.00 has been confirmed.',
        type: 'payment',
        status: 'read',
        priority: 'low',
        createdAt: '2024-01-14T15:30:00Z',
        readAt: '2024-01-14T15:35:00Z'
      },
      {
        id: 'notif-003',
        userId: req.user.userId,
        title: 'Booking Updated',
        message: 'Your service booking has been rescheduled to tomorrow.',
        type: 'booking',
        status: 'unread',
        priority: 'high',
        createdAt: '2024-01-13T11:20:00Z',
        readAt: null
      },
      {
        id: 'notif-004',
        userId: req.user.userId,
        title: 'Welcome to Clutch',
        message: 'Thank you for joining Clutch! Get started with your first service booking.',
        type: 'welcome',
        status: 'read',
        priority: 'low',
        createdAt: '2024-01-10T08:00:00Z',
        readAt: '2024-01-10T08:05:00Z'
      }
    ];

    res.json({
      success: true,
      data: notifications,
      message: 'Notifications retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'NOTIFICATIONS_ERROR',
      message: 'Failed to retrieve notifications',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/notifications/unread - Get unread notifications
router.get('/unread', authenticateToken, async (req, res) => {
  try {
    const unreadNotifications = [
      {
        id: 'notif-001',
        userId: req.user.userId,
        title: 'Service Reminder',
        message: 'Your vehicle service is due in 7 days.',
        type: 'reminder',
        status: 'unread',
        priority: 'medium',
        createdAt: '2024-01-15T09:00:00Z'
      },
      {
        id: 'notif-003',
        userId: req.user.userId,
        title: 'Booking Updated',
        message: 'Your service booking has been rescheduled to tomorrow.',
        type: 'booking',
        status: 'unread',
        priority: 'high',
        createdAt: '2024-01-13T11:20:00Z'
      }
    ];

    res.json({
      success: true,
      data: unreadNotifications,
      count: unreadNotifications.length,
      message: 'Unread notifications retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Unread notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'UNREAD_NOTIFICATIONS_ERROR',
      message: 'Failed to retrieve unread notifications',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Mock marking notification as read
    const updatedNotification = {
      id: id,
      userId: req.user.userId,
      status: 'read',
      readAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: updatedNotification,
      message: 'Notification marked as read',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: 'MARK_NOTIFICATION_READ_ERROR',
      message: 'Failed to mark notification as read',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/notifications/read-all - Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: { userId: req.user.userId },
      message: 'All notifications marked as read',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: 'MARK_ALL_NOTIFICATIONS_READ_ERROR',
      message: 'Failed to mark all notifications as read',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/notifications - Create a new notification
router.post('/', authenticateToken, requireRole(['admin', 'support']), async (req, res) => {
  try {
    const { title, message, type, priority = 'medium', userId } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_NOTIFICATION_DATA',
        message: 'Title, message, and type are required',
        timestamp: new Date().toISOString()
      });
    }

    const newNotification = {
      id: `notif-${Date.now()}`,
      userId: userId || req.user.userId,
      title: title,
      message: message,
      type: type,
      status: 'unread',
      priority: priority,
      createdAt: new Date().toISOString(),
      readAt: null
    };

    res.json({
      success: true,
      data: newNotification,
      message: 'Notification created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_NOTIFICATION_ERROR',
      message: 'Failed to create notification',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
