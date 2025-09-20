/**
 * Notification Service Routes
 * Alternative notification methods when email is not working
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// POST /api/v1/notifications/send-invitation - Send invitation via alternative methods
router.post('/send-invitation', authenticateToken, checkRole(['head_administrator', 'hr_manager']), async (req, res) => {
  try {
    const { email, name, role, department, invitationToken } = req.body;
    
    if (!email || !name || !invitationToken) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Email, name, and invitation token are required',
        timestamp: new Date().toISOString()
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://admin.yourclutch.com';
    const invitationLink = `${frontendUrl}/setup-password?token=${invitationToken}`;
    
    // Store notification in database
    const notificationsCollection = await getCollection('notifications');
    const notification = {
      type: 'employee_invitation',
      recipient: email,
      recipientName: name,
      title: 'Welcome to Clutch - Set up your account',
      message: `Hello ${name},\n\nYou have been invited to join Clutch as a ${role} in the ${department} department.\n\nPlease click the link below to set up your account:\n${invitationLink}\n\nThis invitation will expire in 7 days.\n\nBest regards,\nClutch Team`,
      invitationLink,
      employeeData: {
        name,
        role,
        department
      },
      status: 'pending',
      priority: 'high',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      sentVia: 'manual_notification'
    };

    await notificationsCollection.insertOne(notification);
    
    // Also store in pending emails for email retry
    const pendingEmailsCollection = await getCollection('pending_emails');
    const pendingEmail = {
      type: 'employee_invitation',
      to: email,
      subject: 'Welcome to Clutch - Set up your account',
      html: `
        <h2>Welcome to Clutch!</h2>
        <p>Hello ${name},</p>
        <p>You have been invited to join Clutch as a <strong>${role}</strong> in the <strong>${department}</strong> department.</p>
        <p>Please click the button below to set up your account:</p>
        <a href="${invitationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Set Up Account</a>
        <p>Or copy and paste this link: ${invitationLink}</p>
        <p>This invitation will expire in 7 days.</p>
        <p>Best regards,<br>Clutch Team</p>
      `,
      text: `Welcome to Clutch!\n\nHello ${name},\n\nYou have been invited to join Clutch as a ${role} in the ${department} department.\n\nPlease click the link below to set up your account:\n${invitationLink}\n\nThis invitation will expire in 7 days.\n\nBest regards,\nClutch Team`,
      invitationLink,
      employeeData: { name, role, department },
      status: 'pending',
      createdAt: new Date(),
      attempts: 0,
      lastAttempt: null
    };

    await pendingEmailsCollection.insertOne(pendingEmail);

    res.json({
      success: true,
      data: {
        notification: {
          id: notification._id,
          recipient: email,
          invitationLink,
          status: 'created'
        }
      },
      message: 'Invitation notification created successfully. You can now manually send the invitation link to the employee.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Send invitation notification error:', error);
    res.status(500).json({
      success: false,
      error: 'NOTIFICATION_FAILED',
      message: 'Failed to create invitation notification',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/notifications/pending - Get pending notifications
router.get('/pending', authenticateToken, checkRole(['head_administrator', 'hr_manager']), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notificationsCollection = await getCollection('notifications');
    
    const [notifications, total] = await Promise.all([
      notificationsCollection
        .find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      notificationsCollection.countDocuments({ status: 'pending' })
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
      message: 'Pending notifications retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get pending notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_NOTIFICATIONS_FAILED',
      message: 'Failed to retrieve pending notifications',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/notifications/:id/mark-sent - Mark notification as sent
router.post('/:id/mark-sent', authenticateToken, checkRole(['head_administrator', 'hr_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const notificationsCollection = await getCollection('notifications');
    
    const result = await notificationsCollection.updateOne(
      { _id: id },
      { 
        $set: { 
          status: 'sent',
          sentAt: new Date(),
          sentBy: req.user.userId
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
      message: 'Notification marked as sent successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Mark notification as sent error:', error);
    res.status(500).json({
      success: false,
      error: 'MARK_NOTIFICATION_SENT_FAILED',
      message: 'Failed to mark notification as sent',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
