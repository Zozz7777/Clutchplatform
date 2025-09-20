/**
 * Notifications Routes
 * Handles manual notifications when email service is not available
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// GET /api/v1/notifications - Get all notifications for dashboard
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notificationsCollection = await getCollection('notifications');
    const { page = 1, limit = 20, type, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    // Get notifications for the current user
    filter.userId = req.user.userId;
    
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

// POST /api/v1/notifications - Create a new notification
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, message, type = 'info', priority = 'normal', userId, data } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Title and message are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const notificationsCollection = await getCollection('notifications');
    const notification = {
      title,
      message,
      type,
      priority,
      userId: userId || req.user.userId,
      status: 'unread',
      data: data || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await notificationsCollection.insertOne(notification);
    
    res.status(201).json({
      success: true,
      data: { 
        notification: { ...notification, _id: result.insertedId }
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
    const { ObjectId } = require('mongodb');
    
    const notificationsCollection = await getCollection('notifications');
    const result = await notificationsCollection.updateOne(
      { _id: new ObjectId(id), userId: req.user.userId },
      { 
        $set: { 
          status: 'read',
          readAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'NOTIFICATION_NOT_FOUND',
        message: 'Notification not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { updated: result.modifiedCount > 0 },
      message: 'Notification marked as read',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: 'MARK_NOTIFICATION_READ_FAILED',
      message: 'Failed to mark notification as read',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/notifications/pending-invitations - Get pending invitations that need manual notification
router.get('/pending-invitations', authenticateToken, checkRole(['head_administrator', 'hr_manager']), async (req, res) => {
  try {
    const invitationsCollection = await getCollection('employee_invitations');
    const pendingEmailsCollection = await getCollection('pending_emails');
    
    // Get pending invitations
    const pendingInvitations = await invitationsCollection
      .find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Get pending emails
    const pendingEmails = await pendingEmailsCollection
      .find({ type: 'employee_invitation', status: 'pending' })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Combine and format data
    const notifications = pendingInvitations.map(invitation => {
      const relatedEmail = pendingEmails.find(email => email.to === invitation.email);
      
      return {
        invitationId: invitation._id,
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        department: invitation.department,
        invitationToken: invitation.invitationToken,
        invitationLink: `${process.env.FRONTEND_URL || 'https://admin.yourclutch.com'}/setup-password?token=${invitation.invitationToken}`,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
        hasPendingEmail: !!relatedEmail,
        emailId: relatedEmail?._id
      };
    });
    
    res.json({
      success: true,
      data: { notifications },
      message: 'Pending invitations retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get pending invitations error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PENDING_INVITATIONS_FAILED',
      message: 'Failed to retrieve pending invitations',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/notifications/send-manual - Send manual notification
router.post('/send-manual', authenticateToken, checkRole(['head_administrator', 'hr_manager']), async (req, res) => {
  try {
    const { invitationId, method, contactInfo } = req.body;
    
    if (!invitationId || !method) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Invitation ID and method are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const invitationsCollection = await getCollection('employee_invitations');
    const invitation = await invitationsCollection.findOne({ _id: invitationId });
    
    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'INVITATION_NOT_FOUND',
        message: 'Invitation not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Create notification record
    const notificationsCollection = await getCollection('manual_notifications');
    const notification = {
      invitationId,
      method, // 'email', 'sms', 'phone', 'whatsapp', etc.
      contactInfo,
      status: 'sent',
      sentBy: req.user.userId,
      sentAt: new Date(),
      invitationLink: `${process.env.FRONTEND_URL || 'https://admin.yourclutch.com'}/setup-password?token=${invitation.invitationToken}`
    };
    
    await notificationsCollection.insertOne(notification);
    
    res.json({
      success: true,
      data: { notification },
      message: 'Manual notification sent successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Send manual notification error:', error);
    res.status(500).json({
      success: false,
      error: 'SEND_MANUAL_NOTIFICATION_FAILED',
      message: 'Failed to send manual notification',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/notifications/manual-history - Get manual notification history
router.get('/manual-history', authenticateToken, checkRole(['head_administrator', 'hr_manager']), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notificationsCollection = await getCollection('manual_notifications');
    
    const [notifications, total] = await Promise.all([
      notificationsCollection
        .find({})
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      notificationsCollection.countDocuments({})
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
      message: 'Manual notification history retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get manual notification history error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MANUAL_NOTIFICATION_HISTORY_FAILED',
      message: 'Failed to retrieve manual notification history',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;