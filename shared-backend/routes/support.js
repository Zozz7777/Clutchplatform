const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticateToken, checkRole } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// Rate limiting for support endpoints
const supportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 200 : 50,
  message: { 
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many support requests, please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

// GET /api/v1/support/tickets - Get all support tickets
router.get('/tickets', supportLimiter, authenticateToken, async (req, res) => {
  try {
    const ticketsCollection = await getCollection('support_tickets');
    
    if (!ticketsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const { page = 1, limit = 20, status, priority, category } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    
    const tickets = await ticketsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await ticketsCollection.countDocuments(filter);

    res.json({
      success: true,
      data: tickets || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      message: 'Support tickets retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({
      success: false,
      error: 'FAILED_TO_FETCH_SUPPORT_TICKETS',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/support/tickets/:id - Get specific support ticket
router.get('/tickets/:id', supportLimiter, authenticateToken, async (req, res) => {
  try {
    const ticketsCollection = await getCollection('support_tickets');
    
    if (!ticketsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const { id } = req.params;
    const ticket = await ticketsCollection.findOne({ _id: id });
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'TICKET_NOT_FOUND',
        message: 'Support ticket not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: ticket,
      message: 'Support ticket retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    res.status(500).json({
      success: false,
      error: 'FAILED_TO_FETCH_SUPPORT_TICKET',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/support/tickets - Create new support ticket
router.post('/tickets', supportLimiter, authenticateToken, async (req, res) => {
  try {
    const ticketsCollection = await getCollection('support_tickets');
    
    if (!ticketsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const ticketData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'open',
      ticketNumber: `TKT-${Date.now()}`
    };
    
    const result = await ticketsCollection.insertOne(ticketData);
    
    res.status(201).json({
      success: true,
      data: { ticketId: result.insertedId, ...ticketData },
      message: 'Support ticket created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({
      success: false,
      error: 'FAILED_TO_CREATE_SUPPORT_TICKET',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/support/tickets/:id - Update support ticket
router.put('/tickets/:id', supportLimiter, authenticateToken, async (req, res) => {
  try {
    const ticketsCollection = await getCollection('support_tickets');
    
    if (!ticketsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const result = await ticketsCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'TICKET_NOT_FOUND',
        message: 'Support ticket not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: { ticketId: id, updated: true },
      message: 'Support ticket updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({
      success: false,
      error: 'FAILED_TO_UPDATE_SUPPORT_TICKET',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/support/stats - Get support statistics
router.get('/stats', supportLimiter, authenticateToken, checkRole(['admin', 'support_manager']), async (req, res) => {
  try {
    const ticketsCollection = await getCollection('support_tickets');
    
    if (!ticketsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const tickets = await ticketsCollection.find({}).toArray();
    
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const closedTickets = tickets.filter(t => t.status === 'closed').length;
    const highPriorityTickets = tickets.filter(t => t.priority === 'high').length;
    const avgResolutionTime = tickets.length > 0 
      ? tickets.reduce((sum, t) => sum + (t.resolutionTime || 0), 0) / tickets.length 
      : 0;

    const stats = {
      totalTickets,
      openTickets,
      closedTickets,
      highPriorityTickets,
      avgResolutionTime
    };

    res.json({
      success: true,
      data: stats,
      message: 'Support statistics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching support stats:', error);
    res.status(500).json({
      success: false,
      error: 'FAILED_TO_FETCH_SUPPORT_STATS',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
