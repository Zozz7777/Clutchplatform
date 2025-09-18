const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// Apply authentication to all routes
router.use(authenticateToken);

// ===== COMPLIANCE DATA =====

// GET /api/v1/compliance - Get all compliance data
router.get('/', checkRole(['head_administrator', 'admin', 'compliance_officer']), async (req, res) => {
  try {
    const complianceCollection = await getCollection('compliance');
    const { page = 1, limit = 50, standard, status, category } = req.query;
    
    const filter = {};
    if (standard) filter.standard = standard;
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const complianceData = await complianceCollection
      .find(filter)
      .sort({ lastAudit: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await complianceCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: complianceData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get compliance data error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_COMPLIANCE_DATA_FAILED',
      message: 'Failed to retrieve compliance data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/compliance/:id - Get specific compliance item
router.get('/:id', checkRole(['head_administrator', 'admin', 'compliance_officer']), async (req, res) => {
  try {
    const complianceCollection = await getCollection('compliance');
    const { id } = req.params;
    
    const complianceItem = await complianceCollection.findOne({ _id: id });
    
    if (!complianceItem) {
      return res.status(404).json({
        success: false,
        error: 'COMPLIANCE_ITEM_NOT_FOUND',
        message: 'Compliance item not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: complianceItem,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get compliance item error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_COMPLIANCE_ITEM_FAILED',
      message: 'Failed to retrieve compliance item',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/compliance - Create new compliance item
router.post('/', checkRole(['head_administrator', 'admin', 'compliance_officer']), async (req, res) => {
  try {
    const complianceCollection = await getCollection('compliance');
    const complianceData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await complianceCollection.insertOne(complianceData);
    
    res.status(201).json({
      success: true,
      data: { _id: result.insertedId, ...complianceData },
      message: 'Compliance item created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create compliance item error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_COMPLIANCE_ITEM_FAILED',
      message: 'Failed to create compliance item',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/compliance/:id - Update compliance item
router.put('/:id', checkRole(['head_administrator', 'admin', 'compliance_officer']), async (req, res) => {
  try {
    const complianceCollection = await getCollection('compliance');
    const { id } = req.params;
    
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const result = await complianceCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'COMPLIANCE_ITEM_NOT_FOUND',
        message: 'Compliance item not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { _id: id, ...updateData },
      message: 'Compliance item updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update compliance item error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_COMPLIANCE_ITEM_FAILED',
      message: 'Failed to update compliance item',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/compliance/:id - Delete compliance item
router.delete('/:id', checkRole(['head_administrator', 'admin']), async (req, res) => {
  try {
    const complianceCollection = await getCollection('compliance');
    const { id } = req.params;
    
    const result = await complianceCollection.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'COMPLIANCE_ITEM_NOT_FOUND',
        message: 'Compliance item not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Compliance item deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete compliance item error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_COMPLIANCE_ITEM_FAILED',
      message: 'Failed to delete compliance item',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/compliance/status - Get compliance status summary
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const complianceCollection = await getCollection('compliance');
    
    // Get compliance data from database
    const complianceData = await complianceCollection.find({}).toArray();
    
    if (complianceData.length > 0) {
      // Calculate real compliance metrics
      const totalItems = complianceData.length;
      const pendingApprovals = complianceData.filter(item => item.status === 'pending').length;
      const violations = complianceData.filter(item => item.status === 'violation').length;
      const securityIncidents = complianceData.filter(item => item.category === 'security' && item.status === 'violation').length;
      
      // Determine overall status
      let overallStatus = 'green';
      if (violations > 5 || securityIncidents > 0) {
        overallStatus = 'red';
      } else if (violations > 2 || pendingApprovals > 10) {
        overallStatus = 'amber';
      }
      
      // Get last and next audit dates
      const auditDates = complianceData
        .filter(item => item.lastAudit || item.nextAudit)
        .map(item => ({ lastAudit: item.lastAudit, nextAudit: item.nextAudit }))
        .filter(dates => dates.lastAudit || dates.nextAudit);
      
      const lastAudit = auditDates.length > 0 ? 
        auditDates.sort((a, b) => new Date(b.lastAudit) - new Date(a.lastAudit))[0].lastAudit :
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const nextAudit = auditDates.length > 0 ? 
        auditDates.sort((a, b) => new Date(a.nextAudit) - new Date(b.nextAudit))[0].nextAudit :
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      res.json({
        success: true,
        data: {
          pendingApprovals,
          violations,
          securityIncidents,
          overallStatus,
          lastAudit,
          nextAudit
        },
        message: 'Compliance status retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      // No compliance data, return default status
      res.json({
        success: true,
        data: {
          pendingApprovals: 0,
          violations: 0,
          securityIncidents: 0,
          overallStatus: 'green',
          lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          nextAudit: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        message: 'Compliance status retrieved successfully',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error fetching compliance status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch compliance status',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
