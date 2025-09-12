const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { validate } = require('../middleware/inputValidation');
const { logger } = require('../config/logger');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Rate limiting
const communicationRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many communication requests from this IP, please try again later.'
});

// Apply rate limiting to all communication routes
router.use(communicationRateLimit);

// ==================== COMMUNICATION SYSTEM ====================

// Get all communications
router.get('/', authenticateToken, requireRole(['admin', 'hr', 'operations']), async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, search } = req.query;
    const skip = (page - 1) * limit;
    
    const collection = await getCollection('communications');
    
    // Build query
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { recipientEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    const [communications, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      collection.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        communications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting communications:', error);
    res.status(500).json({ 
      success: false,
      error: 'FETCH_COMMUNICATIONS_FAILED',
      message: 'Failed to get communications' 
    });
  }
});

// Get communication by ID
router.get('/:id', authenticateToken, requireRole(['admin', 'hr', 'operations']), async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await getCollection('communications');
    
    const communication = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!communication) {
      return res.status(404).json({
        success: false,
        error: 'COMMUNICATION_NOT_FOUND',
        message: 'Communication not found'
      });
    }
    
    res.json({
      success: true,
      data: communication,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting communication:', error);
    res.status(500).json({ 
      success: false,
      error: 'FETCH_COMMUNICATION_FAILED',
      message: 'Failed to get communication' 
    });
  }
});

// Create new communication
router.post('/', authenticateToken, requireRole(['admin', 'hr', 'operations']), validate('communication'), async (req, res) => {
  try {
    const { 
      type, 
      subject, 
      content, 
      recipientEmail, 
      recipientName, 
      priority = 'normal',
      scheduledAt,
      status = 'draft'
    } = req.body;
    
    if (!type || !subject || !content || !recipientEmail) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Type, subject, content, and recipient email are required'
      });
    }
    
    const collection = await getCollection('communications');
    
    const communication = {
      type,
      subject,
      content,
      recipientEmail,
      recipientName: recipientName || '',
      priority,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status,
      sentBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(communication);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...communication
      },
      message: 'Communication created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating communication:', error);
    res.status(500).json({ 
      success: false,
      error: 'CREATE_COMMUNICATION_FAILED',
      message: 'Failed to create communication' 
    });
  }
});

// Update communication
router.put('/:id', authenticateToken, requireRole(['admin', 'hr', 'operations']), validate('communicationUpdate'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.user.id
    };
    
    const collection = await getCollection('communications');
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'COMMUNICATION_NOT_FOUND',
        message: 'Communication not found'
      });
    }
    
    const updatedCommunication = await collection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: updatedCommunication,
      message: 'Communication updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating communication:', error);
    res.status(500).json({ 
      success: false,
      error: 'UPDATE_COMMUNICATION_FAILED',
      message: 'Failed to update communication' 
    });
  }
});

// Delete communication
router.delete('/:id', authenticateToken, requireRole(['admin', 'hr', 'operations']), async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await getCollection('communications');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'COMMUNICATION_NOT_FOUND',
        message: 'Communication not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Communication deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting communication:', error);
    res.status(500).json({ 
      success: false,
      error: 'DELETE_COMMUNICATION_FAILED',
      message: 'Failed to delete communication' 
    });
  }
});

// Send communication
router.post('/:id/send', authenticateToken, requireRole(['admin', 'hr', 'operations']), async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await getCollection('communications');
    
    const communication = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!communication) {
      return res.status(404).json({
        success: false,
        error: 'COMMUNICATION_NOT_FOUND',
        message: 'Communication not found'
      });
    }
    
    if (communication.status === 'sent') {
      return res.status(400).json({
        success: false,
        error: 'ALREADY_SENT',
        message: 'Communication has already been sent'
      });
    }
    
    // Update status to sent
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: 'sent',
          sentAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Communication sent successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error sending communication:', error);
    res.status(500).json({ 
      success: false,
      error: 'SEND_COMMUNICATION_FAILED',
      message: 'Failed to send communication' 
    });
  }
});

// Get communication templates
router.get('/templates', authenticateToken, requireRole(['admin', 'hr', 'operations']), async (req, res) => {
  try {
    const { type, category } = req.query;
    const collection = await getCollection('communication_templates');
    
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    
    const templates = await collection
      .find(query)
      .sort({ name: 1 })
      .toArray();
    
    res.json({
      success: true,
      data: templates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting communication templates:', error);
    res.status(500).json({ 
      success: false,
      error: 'FETCH_TEMPLATES_FAILED',
      message: 'Failed to get communication templates' 
    });
  }
});

// Create communication template
router.post('/templates', authenticateToken, requireRole(['admin', 'hr']), validate('template'), async (req, res) => {
  try {
    const { name, type, category, subject, content, variables = [] } = req.body;
    
    if (!name || !type || !subject || !content) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Name, type, subject, and content are required'
      });
    }
    
    const collection = await getCollection('communication_templates');
    
    const template = {
      name,
      type,
      category: category || 'general',
      subject,
      content,
      variables,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(template);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...template
      },
      message: 'Communication template created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating communication template:', error);
    res.status(500).json({ 
      success: false,
      error: 'CREATE_TEMPLATE_FAILED',
      message: 'Failed to create communication template' 
    });
  }
});

// Get communication analytics
router.get('/analytics/overview', authenticateToken, requireRole(['admin', 'hr', 'analytics']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const collection = await getCollection('communications');
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    const [
      totalCommunications,
      communicationsByType,
      communicationsByStatus,
      communicationsByPriority,
      sentCommunications
    ] = await Promise.all([
      collection.countDocuments(dateFilter),
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]).toArray(),
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]).toArray(),
      collection.countDocuments({ ...dateFilter, status: 'sent' })
    ]);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalCommunications,
          sentCommunications,
          pendingCommunications: totalCommunications - sentCommunications
        },
        breakdown: {
          byType: communicationsByType,
          byStatus: communicationsByStatus,
          byPriority: communicationsByPriority
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting communication analytics:', error);
    res.status(500).json({ 
      success: false,
      error: 'FETCH_COMMUNICATION_ANALYTICS_FAILED',
      message: 'Failed to get communication analytics' 
    });
  }
});

module.exports = router;
