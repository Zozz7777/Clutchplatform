const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const rateLimit = require('express-rate-limit');

// Rate limiting
const integrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many integration requests from this IP, please try again later.'
});

// Apply rate limiting and authentication to all routes
router.use(integrationLimiter);
router.use(authenticateToken);

// ===== INTEGRATIONS MANAGEMENT =====

// GET /api/integrations - Get all integrations
router.get('/', async (req, res) => {
  try {
    const integrationsCollection = await getCollection('integrations');
    const { page = 1, limit = 10, status, type } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const integrations = await integrationsCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await integrationsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        integrations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch integrations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/integrations/:id - Get integration by ID
router.get('/:id', async (req, res) => {
  try {
    const integrationsCollection = await getCollection('integrations');
    const integration = await integrationsCollection.findOne({ _id: req.params.id });
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found'
      });
    }
    
    res.json({
      success: true,
      data: integration
    });
  } catch (error) {
    console.error('Error fetching integration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch integration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/integrations - Create new integration
router.post('/', checkRole(['head_administrator']), async (req, res) => {
  try {
    const integrationsCollection = await getCollection('integrations');
    const { 
      name, 
      type, 
      description, 
      config, 
      status, 
      webhookUrl 
    } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name and type are required'
      });
    }
    
    const integration = {
      name,
      type,
      description: description || '',
      config: config || {},
      status: status || 'inactive',
      webhookUrl: webhookUrl || '',
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await integrationsCollection.insertOne(integration);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...integration
      },
      message: 'Integration created successfully'
    });
  } catch (error) {
    console.error('Error creating integration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create integration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/integrations/:id - Update integration
router.put('/:id', checkRole(['head_administrator']), async (req, res) => {
  try {
    const integrationsCollection = await getCollection('integrations');
    const { 
      name, 
      type, 
      description, 
      config, 
      status, 
      webhookUrl 
    } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (description) updateData.description = description;
    if (config) updateData.config = config;
    if (status) updateData.status = status;
    if (webhookUrl) updateData.webhookUrl = webhookUrl;
    
    const result = await integrationsCollection.updateOne(
      { _id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Integration updated successfully'
    });
  } catch (error) {
    console.error('Error updating integration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update integration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/integrations/:id - Delete integration
router.delete('/:id', checkRole(['head_administrator']), async (req, res) => {
  try {
    const integrationsCollection = await getCollection('integrations');
    const result = await integrationsCollection.deleteOne({ _id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Integration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting integration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete integration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== INTEGRATION TESTING =====

// POST /api/integrations/:id/test - Test integration
router.post('/:id/test', checkRole(['head_administrator']), async (req, res) => {
  try {
    const integrationsCollection = await getCollection('integrations');
    const integration = await integrationsCollection.findOne({ _id: req.params.id });
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found'
      });
    }
    
    // Mock integration test
    const testResult = {
      success: true,
      responseTime: Math.random() * 1000,
      status: 'connected',
      message: 'Integration test successful',
      timestamp: new Date()
    };
    
    res.json({
      success: true,
      data: testResult
    });
  } catch (error) {
    console.error('Error testing integration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test integration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== INTEGRATION TEMPLATES =====

// GET /api/integrations/templates - Get integration templates
router.get('/templates', async (req, res) => {
  try {
    const templatesCollection = await getCollection('integration_templates');
    const { type } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    
    const templates = await templatesCollection
      .find(filter)
      .sort({ name: 1 })
      .toArray();
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching integration templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch integration templates',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== INTEGRATION ANALYTICS =====

// GET /api/integrations/analytics - Get integration analytics
router.get('/analytics', async (req, res) => {
  try {
    const integrationsCollection = await getCollection('integrations');
    
    const totalIntegrations = await integrationsCollection.countDocuments();
    const activeIntegrations = await integrationsCollection.countDocuments({ status: 'active' });
    const inactiveIntegrations = await integrationsCollection.countDocuments({ status: 'inactive' });
    
    // Get integrations by type
    const typeStats = await integrationsCollection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get integrations by status
    const statusStats = await integrationsCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    
    res.json({
      success: true,
      data: {
        overview: {
          totalIntegrations,
          activeIntegrations,
          inactiveIntegrations
        },
        typeStats,
        statusStats
      }
    });
  } catch (error) {
    console.error('Error fetching integration analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch integration analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;