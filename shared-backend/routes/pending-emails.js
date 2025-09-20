/**
 * Pending Emails Routes
 * Handles viewing and managing pending emails when email service is in mock mode
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// GET /api/v1/pending-emails - Get all pending emails
router.get('/', authenticateToken, checkRole(['head_administrator', 'hr_manager']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const pendingEmailsCollection = await getCollection('pending_emails');
    
    if (!pendingEmailsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    // Build filter
    const filter = {};
    if (status !== 'all') {
      filter.status = status;
    }
    
    // Get pending emails with pagination
    const [pendingEmails, total] = await Promise.all([
      pendingEmailsCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      pendingEmailsCollection.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        pendingEmails,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Pending emails retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get pending emails error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PENDING_EMAILS_FAILED',
      message: 'Failed to retrieve pending emails',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/pending-emails/:id - Get specific pending email
router.get('/:id', authenticateToken, checkRole(['head_administrator', 'hr_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const pendingEmailsCollection = await getCollection('pending_emails');
    
    const pendingEmail = await pendingEmailsCollection.findOne({ _id: id });
    
    if (!pendingEmail) {
      return res.status(404).json({
        success: false,
        error: 'PENDING_EMAIL_NOT_FOUND',
        message: 'Pending email not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { pendingEmail },
      message: 'Pending email retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get pending email error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PENDING_EMAIL_FAILED',
      message: 'Failed to retrieve pending email',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/pending-emails/:id/mark-sent - Mark email as sent
router.post('/:id/mark-sent', authenticateToken, checkRole(['head_administrator', 'hr_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const pendingEmailsCollection = await getCollection('pending_emails');
    
    const result = await pendingEmailsCollection.updateOne(
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
        error: 'PENDING_EMAIL_NOT_FOUND',
        message: 'Pending email not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Email marked as sent successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Mark email as sent error:', error);
    res.status(500).json({
      success: false,
      error: 'MARK_EMAIL_SENT_FAILED',
      message: 'Failed to mark email as sent',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/pending-emails/:id - Delete pending email
router.delete('/:id', authenticateToken, checkRole(['head_administrator', 'hr_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const pendingEmailsCollection = await getCollection('pending_emails');
    
    const result = await pendingEmailsCollection.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'PENDING_EMAIL_NOT_FOUND',
        message: 'Pending email not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Pending email deleted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Delete pending email error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_PENDING_EMAIL_FAILED',
      message: 'Failed to delete pending email',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
