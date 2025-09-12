const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== INCIDENT MANAGEMENT ROUTES ====================

// GET /api/v1/incidents - Get all incidents with filtering and pagination
router.get('/', async (req, res) => {
  try {
    console.log('🚨 Fetching incidents:', req.query);
    
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      severity, 
      assignedTo,
      createdBy,
      startDate,
      endDate
    } = req.query;
    
    const skip = (page - 1) * limit;
    const collection = await getCollection('incidents');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (severity) query.severity = severity;
    if (assignedTo) query.assignedTo = assignedTo;
    if (createdBy) query.createdBy = createdBy;
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Get incidents with pagination
    const incidents = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    // Get total count
    const total = await collection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        incidents,
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
    console.error('❌ Error fetching incidents:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_INCIDENTS_FAILED',
      message: 'Failed to fetch incidents'
    });
  }
});

// POST /api/v1/incidents - Create new incident
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('🚨 Creating new incident:', req.body);
    
    const { 
      title, 
      description, 
      priority = 'medium', 
      severity = 'medium',
      category,
      tags = []
    } = req.body;
    
    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Title and description are required'
      });
    }
    
    const collection = await getCollection('incidents');
    
    const incident = {
      title,
      description,
      priority,
      severity,
      category: category || 'general',
      tags: Array.isArray(tags) ? tags : [],
      status: 'open',
      createdBy: req.user.id,
      createdByName: req.user.name || req.user.email,
      assignedTo: null,
      assignedToName: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null,
      comments: [],
      attachments: [],
      history: [{
        action: 'created',
        user: req.user.id,
        userName: req.user.name || req.user.email,
        timestamp: new Date(),
        details: 'Incident created'
      }]
    };
    
    const result = await collection.insertOne(incident);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...incident
      },
      message: 'Incident created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating incident:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_INCIDENT_FAILED',
      message: 'Failed to create incident'
    });
  }
});

// GET /api/v1/incidents/:id - Get specific incident
router.get('/:id', async (req, res) => {
  try {
    console.log('🔍 Fetching incident:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const collection = await getCollection('incidents');
    
    const incident = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!incident) {
      return res.status(404).json({
        success: false,
        error: 'INCIDENT_NOT_FOUND',
        message: 'Incident not found'
      });
    }
    
    res.json({
      success: true,
      data: incident,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching incident:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_INCIDENT_FAILED',
      message: 'Failed to fetch incident'
    });
  }
});

// PUT /api/v1/incidents/:id - Update incident
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('✏️ Updating incident:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { 
      title, 
      description, 
      priority, 
      severity, 
      status,
      category,
      tags
    } = req.body;
    
    const collection = await getCollection('incidents');
    
    // Check if incident exists
    const existingIncident = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!existingIncident) {
      return res.status(404).json({
        success: false,
        error: 'INCIDENT_NOT_FOUND',
        message: 'Incident not found'
      });
    }
    
    // Build update object
    const updateData = { updatedAt: new Date() };
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (severity) updateData.severity = severity;
    if (status) updateData.status = status;
    if (category) updateData.category = category;
    if (tags) updateData.tags = Array.isArray(tags) ? tags : [];
    
    // Add to history
    const historyEntry = {
      action: 'updated',
      user: req.user.id,
      userName: req.user.name || req.user.email,
      timestamp: new Date(),
      details: 'Incident updated',
      changes: Object.keys(updateData).filter(key => key !== 'updatedAt')
    };
    
    updateData.$push = { history: historyEntry };
    
    // Set resolvedAt if status is resolved
    if (status === 'resolved' && existingIncident.status !== 'resolved') {
      updateData.resolvedAt = new Date();
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'No changes made to incident'
      });
    }
    
    // Get updated incident
    const updatedIncident = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    res.json({
      success: true,
      data: updatedIncident,
      message: 'Incident updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating incident:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_INCIDENT_FAILED',
      message: 'Failed to update incident'
    });
  }
});

// DELETE /api/v1/incidents/:id - Delete incident
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    console.log('🗑️ Deleting incident:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const collection = await getCollection('incidents');
    
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'INCIDENT_NOT_FOUND',
        message: 'Incident not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Incident deleted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error deleting incident:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_INCIDENT_FAILED',
      message: 'Failed to delete incident'
    });
  }
});

// PUT /api/v1/incidents/:id/assign - Assign incident to user
router.put('/:id/assign', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('👤 Assigning incident:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { assignedTo, assignedToName } = req.body;
    
    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'assignedTo is required'
      });
    }
    
    const collection = await getCollection('incidents');
    
    // Check if incident exists
    const existingIncident = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!existingIncident) {
      return res.status(404).json({
        success: false,
        error: 'INCIDENT_NOT_FOUND',
        message: 'Incident not found'
      });
    }
    
    const updateData = {
      assignedTo,
      assignedToName: assignedToName || assignedTo,
      updatedAt: new Date()
    };
    
    // Add to history
    const historyEntry = {
      action: 'assigned',
      user: req.user.id,
      userName: req.user.name || req.user.email,
      timestamp: new Date(),
      details: `Incident assigned to ${assignedToName || assignedTo}`,
      assignedTo,
      assignedToName: assignedToName || assignedTo
    };
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: updateData,
        $push: { history: historyEntry }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'ASSIGNMENT_FAILED',
        message: 'Failed to assign incident'
      });
    }
    
    // Get updated incident
    const updatedIncident = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    res.json({
      success: true,
      data: updatedIncident,
      message: 'Incident assigned successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error assigning incident:', error);
    res.status(500).json({
      success: false,
      error: 'ASSIGN_INCIDENT_FAILED',
      message: 'Failed to assign incident'
    });
  }
});

// PUT /api/v1/incidents/:id/status - Update incident status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Updating incident status:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { status, comment } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Status is required'
      });
    }
    
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const collection = await getCollection('incidents');
    
    // Check if incident exists
    const existingIncident = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!existingIncident) {
      return res.status(404).json({
        success: false,
        error: 'INCIDENT_NOT_FOUND',
        message: 'Incident not found'
      });
    }
    
    const updateData = {
      status,
      updatedAt: new Date()
    };
    
    // Set resolvedAt if status is resolved
    if (status === 'resolved' && existingIncident.status !== 'resolved') {
      updateData.resolvedAt = new Date();
    }
    
    // Add to history
    const historyEntry = {
      action: 'status_changed',
      user: req.user.id,
      userName: req.user.name || req.user.email,
      timestamp: new Date(),
      details: `Status changed from ${existingIncident.status} to ${status}`,
      oldStatus: existingIncident.status,
      newStatus: status,
      comment: comment || ''
    };
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: updateData,
        $push: { history: historyEntry }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'STATUS_UPDATE_FAILED',
        message: 'Failed to update incident status'
      });
    }
    
    // Get updated incident
    const updatedIncident = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    res.json({
      success: true,
      data: updatedIncident,
      message: 'Incident status updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating incident status:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_STATUS_FAILED',
      message: 'Failed to update incident status'
    });
  }
});

// GET /api/v1/incidents/metrics - Get incident metrics
router.get('/metrics', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('📊 Fetching incident metrics');
    
    const { startDate, endDate } = req.query;
    const collection = await getCollection('incidents');
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Get metrics
    const [
      totalIncidents,
      openIncidents,
      resolvedIncidents,
      incidentsByPriority,
      incidentsBySeverity,
      incidentsByStatus,
      avgResolutionTime
    ] = await Promise.all([
      // Total incidents
      collection.countDocuments(dateFilter),
      
      // Open incidents
      collection.countDocuments({ ...dateFilter, status: 'open' }),
      
      // Resolved incidents
      collection.countDocuments({ ...dateFilter, status: 'resolved' }),
      
      // Incidents by priority
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Incidents by severity
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Incidents by status
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Average resolution time
      collection.aggregate([
        { $match: { ...dateFilter, resolvedAt: { $exists: true } } },
        {
          $project: {
            resolutionTime: {
              $subtract: ['$resolvedAt', '$createdAt']
            }
          }
        },
        {
          $group: {
            _id: null,
            avgResolutionTime: { $avg: '$resolutionTime' }
          }
        }
      ]).toArray()
    ]);
    
    const metrics = {
      total: totalIncidents,
      open: openIncidents,
      resolved: resolvedIncidents,
      byPriority: incidentsByPriority,
      bySeverity: incidentsBySeverity,
      byStatus: incidentsByStatus,
      avgResolutionTimeMs: avgResolutionTime[0]?.avgResolutionTime || 0,
      avgResolutionTimeHours: avgResolutionTime[0]?.avgResolutionTime ? 
        Math.round(avgResolutionTime[0].avgResolutionTime / (1000 * 60 * 60) * 100) / 100 : 0
    };
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching incident metrics:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_METRICS_FAILED',
      message: 'Failed to fetch incident metrics'
    });
  }
});

// POST /api/v1/incidents/:id/comment - Add comment to incident
router.post('/:id/comment', authenticateToken, async (req, res) => {
  try {
    console.log('💬 Adding comment to incident:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Comment content is required'
      });
    }
    
    const collection = await getCollection('incidents');
    
    const comment = {
      id: new ObjectId(),
      content,
      author: req.user.id,
      authorName: req.user.name || req.user.email,
      createdAt: new Date()
    };
    
    // Add to history
    const historyEntry = {
      action: 'commented',
      user: req.user.id,
      userName: req.user.name || req.user.email,
      timestamp: new Date(),
      details: 'Comment added',
      comment: content
    };
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $push: { 
          comments: comment,
          history: historyEntry
        },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'INCIDENT_NOT_FOUND',
        message: 'Incident not found'
      });
    }
    
    res.json({
      success: true,
      data: comment,
      message: 'Comment added successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    res.status(500).json({
      success: false,
      error: 'ADD_COMMENT_FAILED',
      message: 'Failed to add comment'
    });
  }
});

module.exports = router;
