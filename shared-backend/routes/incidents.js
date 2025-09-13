const express = require('express');
const router = express.Router();
const { logger } = require('../config/logger');

// Simple authentication middleware (non-blocking)
const simpleAuth = (req, res, next) => {
  req.user = { 
    id: 'test-user', 
    role: 'admin',
    tenantId: 'test-tenant'
  };
  next();
};

// ==================== INCIDENT MANAGEMENT ROUTES ====================

// GET /api/v1/incidents - Get all incidents
router.get('/', async (req, res) => {
  try {
    console.log('🚨 Fetching incidents:', req.query);
    
    const mockIncidents = [
      {
        id: 'incident-1',
        title: 'Service Outage',
        description: 'Temporary service interruption',
        status: 'resolved',
        priority: 'high',
        severity: 'medium',
        assignedTo: 'support-team',
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resolvedAt: new Date().toISOString()
      },
      {
        id: 'incident-2',
        title: 'Database Connection Issue',
        description: 'Intermittent database connectivity problems',
        status: 'investigating',
        priority: 'medium',
        severity: 'low',
        assignedTo: 'dev-team',
        createdBy: 'monitoring-system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: {
        incidents: mockIncidents,
        pagination: {
          page: 1,
          limit: 10,
          total: mockIncidents.length,
          pages: 1
        }
      },
      message: 'Incidents retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Error fetching incidents:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_INCIDENTS_FAILED',
      message: 'Failed to fetch incidents',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/incidents - Create new incident
router.post('/', simpleAuth, async (req, res) => {
  try {
    const { title, description, priority = 'medium', severity = 'low' } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Title and description are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const newIncident = {
      id: `incident-${Date.now()}`,
      title,
      description,
      status: 'open',
      priority,
      severity,
      assignedTo: null,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      data: newIncident,
      message: 'Incident created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Error creating incident:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_INCIDENT_FAILED',
      message: 'Failed to create incident',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/incidents/status - Get incident status
router.get('/status', async (req, res) => {
  try {
    const statusData = {
      total: 25,
      open: 5,
      investigating: 8,
      resolved: 10,
      closed: 2,
      critical: 1,
      high: 3,
      medium: 15,
      low: 6
    };
    
    res.json({
      success: true,
      data: statusData,
      message: 'Incident status retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Error fetching incident status:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_STATUS_FAILED',
      message: 'Failed to fetch incident status',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/incidents/:id - Get specific incident
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format to prevent BSON errors
    if (!id || id.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INCIDENT_ID',
        message: 'Invalid incident ID format',
        timestamp: new Date().toISOString()
      });
    }
    
    const mockIncident = {
      id: id,
      title: 'Service Outage',
      description: 'Temporary service interruption',
      status: 'resolved',
      priority: 'high',
      severity: 'medium',
      assignedTo: 'support-team',
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: new Date().toISOString(),
      comments: [
        {
          id: 'comment-1',
          text: 'Issue identified and being investigated',
          author: 'support-team',
          createdAt: new Date().toISOString()
        }
      ]
    };
    
    res.json({
      success: true,
      data: mockIncident,
      message: 'Incident retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Error fetching incident:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_INCIDENT_FAILED',
      message: 'Failed to fetch incident',
      timestamp: new Date().toISOString()
    });
  }
});


// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'incidents'} service is running`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'incidents'} item retrieved`,
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: `${'incidents'} item created`,
    data: { id: Date.now(), ...req.body, createdAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'POST',
    path: '/'
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'incidents'} item updated`,
    data: { id: id, ...req.body, updatedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'PUT',
    path: `/${id}`
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'incidents'} item deleted`,
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'incidents'} search results`,
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;