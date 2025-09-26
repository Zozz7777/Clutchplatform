const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/support');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `support-${req.user._id}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and TXT files are allowed.'));
    }
  }
});

// Support Ticket Types
const TICKET_TYPES = {
  TECHNICAL_ISSUE: 'technical_issue',
  BILLING_QUESTION: 'billing_question',
  FEATURE_REQUEST: 'feature_request',
  BUG_REPORT: 'bug_report',
  ACCOUNT_ISSUE: 'account_issue',
  GENERAL_INQUIRY: 'general_inquiry'
};

// Support Ticket Status
const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  WAITING_FOR_CUSTOMER: 'waiting_for_customer',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

// Support Ticket Priority
const TICKET_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Create support ticket
router.post('/ticket', [
  auth,
  upload.array('attachments', 5), // Allow up to 5 attachments
  body('type').isIn(Object.values(TICKET_TYPES)).withMessage('Invalid ticket type'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('priority').optional().isIn(Object.values(TICKET_PRIORITY)).withMessage('Invalid priority'),
  body('category').optional().isString().withMessage('Category must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, subject, description, priority, category } = req.body;
    const userId = req.user._id;
    const files = req.files || [];

    // Generate ticket ID
    const ticketId = `TKT_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    // Process attachments
    const attachments = files.map(file => ({
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    }));

    // Create ticket data
    const ticketData = {
      id: ticketId,
      userId: userId,
      type: type,
      subject: subject,
      description: description,
      priority: priority || TICKET_PRIORITY.NORMAL,
      category: category || 'general',
      status: TICKET_STATUS.OPEN,
      attachments: attachments,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedTo: null,
      resolvedAt: null,
      closedAt: null,
      messages: [{
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        userId: userId,
        message: description,
        type: 'initial',
        attachments: attachments,
        createdAt: new Date()
      }]
    };

    // Save ticket to user's support tickets
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.supportTickets) {
      user.supportTickets = [];
    }

    user.supportTickets.push(ticketData);
    await user.save();

    // Send notification to support team
    await sendSupportNotification({
      type: 'new_ticket',
      ticketId: ticketId,
      userId: userId,
      subject: subject,
      priority: priority || TICKET_PRIORITY.NORMAL
    });

    logger.info(`Support ticket created: ${ticketId}`, {
      userId: userId,
      type: type,
      priority: priority || TICKET_PRIORITY.NORMAL,
      attachmentCount: attachments.length
    });

    res.json({
      success: true,
      message: 'Support ticket created successfully',
      data: {
        ticketId: ticketId,
        status: TICKET_STATUS.OPEN,
        priority: priority || TICKET_PRIORITY.NORMAL,
        createdAt: ticketData.createdAt,
        attachmentCount: attachments.length
      }
    });

  } catch (error) {
    logger.error('Failed to create support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket'
    });
  }
});

// Get user's support tickets
router.get('/tickets', [
  auth,
  body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  body('status').optional().isIn(Object.values(TICKET_STATUS)).withMessage('Invalid status'),
  body('type').optional().isIn(Object.values(TICKET_TYPES)).withMessage('Invalid type'),
  body('priority').optional().isIn(Object.values(TICKET_PRIORITY)).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, priority } = req.query;
    const userId = req.user._id;

    const user = await PartnerUser.findById(userId);
    if (!user || !user.supportTickets) {
      return res.json({
        success: true,
        data: {
          tickets: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0
          }
        }
      });
    }

    // Filter tickets
    let filteredTickets = user.supportTickets;
    
    if (status) {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
    }
    if (type) {
      filteredTickets = filteredTickets.filter(ticket => ticket.type === type);
    }
    if (priority) {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority);
    }

    // Sort by creation date (newest first)
    filteredTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

    // Format tickets for response
    const formattedTickets = paginatedTickets.map(ticket => ({
      id: ticket.id,
      type: ticket.type,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      assignedTo: ticket.assignedTo,
      resolvedAt: ticket.resolvedAt,
      closedAt: ticket.closedAt,
      messageCount: ticket.messages.length,
      attachmentCount: ticket.attachments.length
    }));

    res.json({
      success: true,
      data: {
        tickets: formattedTickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredTickets.length,
          pages: Math.ceil(filteredTickets.length / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get support tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get support tickets'
    });
  }
});

// Get specific support ticket
router.get('/ticket/:ticketId', auth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user._id;

    const user = await PartnerUser.findById(userId);
    if (!user || !user.supportTickets) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    const ticket = user.supportTickets.find(t => t.id === ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    // Format ticket for response
    const formattedTicket = {
      id: ticket.id,
      type: ticket.type,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      assignedTo: ticket.assignedTo,
      resolvedAt: ticket.resolvedAt,
      closedAt: ticket.closedAt,
      attachments: ticket.attachments.map(att => ({
        id: att.id,
        originalName: att.originalName,
        size: att.size,
        mimetype: att.mimetype,
        uploadedAt: att.uploadedAt
      })),
      messages: ticket.messages.map(msg => ({
        id: msg.id,
        userId: msg.userId,
        message: msg.message,
        type: msg.type,
        attachments: msg.attachments?.map(att => ({
          id: att.id,
          originalName: att.originalName,
          size: att.size,
          mimetype: att.mimetype
        })) || [],
        createdAt: msg.createdAt
      }))
    };

    res.json({
      success: true,
      data: {
        ticket: formattedTicket
      }
    });

  } catch (error) {
    logger.error('Failed to get support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get support ticket'
    });
  }
});

// Add message to support ticket
router.post('/ticket/:ticketId/message', [
  auth,
  upload.array('attachments', 5),
  body('message').notEmpty().withMessage('Message is required'),
  body('type').optional().isIn(['customer', 'support', 'internal']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { ticketId } = req.params;
    const { message, type } = req.body;
    const userId = req.user._id;
    const files = req.files || [];

    const user = await PartnerUser.findById(userId);
    if (!user || !user.supportTickets) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    const ticket = user.supportTickets.find(t => t.id === ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    // Check if ticket is closed
    if (ticket.status === TICKET_STATUS.CLOSED) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add message to closed ticket'
      });
    }

    // Process attachments
    const attachments = files.map(file => ({
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    }));

    // Add message to ticket
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      userId: userId,
      message: message,
      type: type || 'customer',
      attachments: attachments,
      createdAt: new Date()
    };

    ticket.messages.push(newMessage);
    ticket.updatedAt = new Date();

    // Update ticket status if customer is responding
    if (type === 'customer' && ticket.status === TICKET_STATUS.WAITING_FOR_CUSTOMER) {
      ticket.status = TICKET_STATUS.IN_PROGRESS;
    }

    await user.save();

    // Send notification to support team
    await sendSupportNotification({
      type: 'new_message',
      ticketId: ticketId,
      userId: userId,
      message: message,
      messageType: type || 'customer'
    });

    logger.info(`Message added to support ticket: ${ticketId}`, {
      userId: userId,
      messageType: type || 'customer',
      attachmentCount: attachments.length
    });

    res.json({
      success: true,
      message: 'Message added successfully',
      data: {
        messageId: newMessage.id,
        ticketId: ticketId,
        status: ticket.status,
        updatedAt: ticket.updatedAt
      }
    });

  } catch (error) {
    logger.error('Failed to add message to support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add message to support ticket'
    });
  }
});

// Close support ticket
router.patch('/ticket/:ticketId/close', [
  auth,
  body('reason').optional().isString().withMessage('Reason must be a string')
], async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const user = await PartnerUser.findById(userId);
    if (!user || !user.supportTickets) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    const ticket = user.supportTickets.find(t => t.id === ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    // Update ticket status
    ticket.status = TICKET_STATUS.CLOSED;
    ticket.closedAt = new Date();
    ticket.updatedAt = new Date();
    ticket.closeReason = reason;

    await user.save();

    logger.info(`Support ticket closed: ${ticketId}`, {
      userId: userId,
      reason: reason
    });

    res.json({
      success: true,
      message: 'Support ticket closed successfully',
      data: {
        ticketId: ticketId,
        status: TICKET_STATUS.CLOSED,
        closedAt: ticket.closedAt
      }
    });

  } catch (error) {
    logger.error('Failed to close support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close support ticket'
    });
  }
});

// Get support ticket attachment
router.get('/ticket/:ticketId/attachment/:attachmentId', auth, async (req, res) => {
  try {
    const { ticketId, attachmentId } = req.params;
    const userId = req.user._id;

    const user = await PartnerUser.findById(userId);
    if (!user || !user.supportTickets) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    const ticket = user.supportTickets.find(t => t.id === ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    const attachment = ticket.attachments.find(att => att.id === attachmentId);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Check if file exists
    try {
      await fs.access(attachment.path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Attachment file not found'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', attachment.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${attachment.originalName}"`);

    // Send file
    const fileStream = require('fs').createReadStream(attachment.path);
    fileStream.pipe(res);

  } catch (error) {
    logger.error('Failed to get support ticket attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get support ticket attachment'
    });
  }
});

// Helper function to send support notifications
async function sendSupportNotification({ type, ticketId, userId, subject, priority, message, messageType }) {
  // Mock implementation - in real app, this would send notifications to support team
  logger.info('Sending support notification', {
    type: type,
    ticketId: ticketId,
    userId: userId,
    subject: subject,
    priority: priority,
    message: message,
    messageType: messageType
  });
  
  // Simulate notification sending
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return { success: true };
}

module.exports = router;
