const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const rateLimit = require('express-rate-limit');

// Rate limiting
const complianceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // limit each IP to 15 requests per windowMs
  message: 'Too many compliance requests, please try again later.'
});

// GET /api/v1/compliance/status - Get compliance status
router.get('/status', complianceLimiter, authenticateToken, async (req, res) => {
  try {
    // Get compliance data from database
    const complianceCollection = await getCollection('compliance');
    const complianceItems = await complianceCollection.find({}).toArray();
    
    // Calculate overall compliance score
    const totalItems = complianceItems.length;
    const compliantItems = complianceItems.filter(item => item.status === 'compliant').length;
    const nonCompliantItems = complianceItems.filter(item => item.status === 'non_compliant').length;
    const pendingItems = complianceItems.filter(item => item.status === 'pending').length;
    
    const complianceScore = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;
    
    // Get compliance by category
    const categories = {};
    complianceItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = {
          total: 0,
          compliant: 0,
          nonCompliant: 0,
          pending: 0
        };
      }
      categories[item.category].total++;
      categories[item.category][item.status === 'compliant' ? 'compliant' : 
        item.status === 'non_compliant' ? 'nonCompliant' : 'pending']++;
    });
    
    // Calculate category scores
    Object.keys(categories).forEach(category => {
      const cat = categories[category];
      cat.score = cat.total > 0 ? Math.round((cat.compliant / cat.total) * 100) : 0;
    });
    
    res.json({
      success: true,
      data: {
        overall: {
          score: complianceScore,
          total: totalItems,
          compliant: compliantItems,
          nonCompliant: nonCompliantItems,
          pending: pendingItems
        },
        categories: categories,
        items: complianceItems,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting compliance status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get compliance status',
      message: error.message
    });
  }
});

// GET /api/v1/compliance/audit - Get compliance audit trail
router.get('/audit', complianceLimiter, authenticateToken, async (req, res) => {
  try {
    const auditCollection = await getCollection('compliance_audit');
    const auditLogs = await auditCollection.find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    
    res.json({
      success: true,
      data: {
        auditLogs: auditLogs,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting compliance audit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get compliance audit',
      message: error.message
    });
  }
});

// GET /api/v1/compliance/requirements - Get compliance requirements
router.get('/requirements', complianceLimiter, authenticateToken, async (req, res) => {
  try {
    const requirementsCollection = await getCollection('compliance_requirements');
    const requirements = await requirementsCollection.find({}).toArray();
    
    res.json({
      success: true,
      data: {
        requirements: requirements,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting compliance requirements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get compliance requirements',
      message: error.message
    });
  }
});

// POST /api/v1/compliance/update - Update compliance status
router.post('/update', complianceLimiter, authenticateToken, checkRole(['admin', 'compliance_officer']), async (req, res) => {
  try {
    const { itemId, status, notes, updatedBy } = req.body;
    
    if (!itemId || !status) {
      return res.status(400).json({
        success: false,
        error: 'Item ID and status are required'
      });
    }
    
    const complianceCollection = await getCollection('compliance');
    const auditCollection = await getCollection('compliance_audit');
    
    // Update compliance item
    const result = await complianceCollection.updateOne(
      { _id: itemId },
      { 
        $set: { 
          status: status,
          updatedAt: new Date(),
          updatedBy: updatedBy || req.user.id,
          notes: notes
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Compliance item not found'
      });
    }
    
    // Log audit trail
    await auditCollection.insertOne({
      itemId: itemId,
      action: 'status_update',
      oldStatus: req.body.oldStatus,
      newStatus: status,
      notes: notes,
      updatedBy: updatedBy || req.user.id,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      message: 'Compliance status updated successfully'
    });
  } catch (error) {
    console.error('Error updating compliance status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update compliance status',
      message: error.message
    });
  }
});

// GET /api/v1/compliance/reports - Get compliance reports
router.get('/reports', complianceLimiter, authenticateToken, async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '30d';
    const reportType = req.query.type || 'summary';
    
    // TODO: Implement compliance reporting
    // This would generate detailed compliance reports based on the time range and type
    
    res.json({
      success: true,
      data: {
        reportType: reportType,
        timeRange: timeRange,
        note: 'Compliance reporting not yet implemented - requires additional database queries and report generation',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting compliance reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get compliance reports',
      message: error.message
    });
  }
});

module.exports = router;