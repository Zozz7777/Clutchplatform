const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const { logger } = require('../config/logger');
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
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }
    
    // Get collections
    const complianceFlagsCollection = await getCollection('compliance_flags');
    const auditLogsCollection = await getCollection('audit_logs');
    const usersCollection = await getCollection('users');
    
    // Generate compliance report based on type
    let reportData = {};
    
    switch (reportType) {
      case 'summary':
        // Summary report with key metrics
        const [totalFlags, resolvedFlags, auditEvents, userCompliance] = await Promise.all([
          complianceFlagsCollection.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
          }),
          complianceFlagsCollection.countDocuments({
            status: 'resolved',
            updatedAt: { $gte: startDate, $lte: endDate }
          }),
          auditLogsCollection.countDocuments({
            type: 'compliance',
            timestamp: { $gte: startDate, $lte: endDate }
          }),
          usersCollection.countDocuments({
            complianceStatus: 'compliant',
            lastComplianceCheck: { $gte: startDate, $lte: endDate }
          })
        ]);
        
        reportData = {
          summary: {
            totalFlags,
            resolvedFlags,
            pendingFlags: totalFlags - resolvedFlags,
            auditEvents,
            compliantUsers: userCompliance,
            resolutionRate: totalFlags > 0 ? ((resolvedFlags / totalFlags) * 100).toFixed(2) : 0
          }
        };
        break;
        
      case 'detailed':
        // Detailed report with flag breakdown
        const flagBreakdown = await complianceFlagsCollection.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: '$severity',
              count: { $sum: 1 },
              resolved: {
                $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
              }
            }
          }
        ]).toArray();
        
        const categoryBreakdown = await complianceFlagsCollection.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              resolved: {
                $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
              }
            }
          }
        ]).toArray();
        
        reportData = {
          flagBreakdown,
          categoryBreakdown,
          timeRange,
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        };
        break;
        
      case 'trends':
        // Trend analysis over time
        const dailyTrends = await complianceFlagsCollection.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
              },
              flagsCreated: { $sum: 1 },
              flagsResolved: {
                $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
              }
            }
          },
          {
            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
          }
        ]).toArray();
        
        reportData = {
          dailyTrends,
          timeRange,
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        };
        break;
        
      default:
        reportData = {
          error: 'Invalid report type. Supported types: summary, detailed, trends'
        };
    }
    
    res.json({
      success: true,
      data: {
        reportType,
        timeRange,
        generatedAt: new Date().toISOString(),
        ...reportData
      }
    });
  } catch (error) {
    logger.error('Error getting compliance reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get compliance reports',
      message: error.message
    });
  }
});

// ==================== COMPLIANCE FLAGS ENDPOINTS ====================

// GET /api/v1/compliance/flags - Get compliance flags
router.get('/flags', complianceLimiter, authenticateToken, async (req, res) => {
  try {
    const flagsCollection = await getCollection('compliance_flags');
    
    // Get all compliance flags
    const flags = await flagsCollection.find({}).toArray();
    
    // If no data exists, return empty array (no mock data)
    res.json({
      success: true,
      data: flags,
      message: 'Compliance flags retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Get compliance flags error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_COMPLIANCE_FLAGS_FAILED',
      message: 'Failed to get compliance flags',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/compliance/frameworks - Get compliance frameworks
router.get('/frameworks', complianceLimiter, authenticateToken, async (req, res) => {
  try {
    const frameworksCollection = await getCollection('compliance_frameworks');
    
    // Get all compliance frameworks
    const frameworks = await frameworksCollection.find({}).toArray();
    
    // If no data exists, return empty array (no mock data)
    res.json({
      success: true,
      data: frameworks,
      message: 'Compliance frameworks retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Get compliance frameworks error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_COMPLIANCE_FRAMEWORKS_FAILED',
      message: 'Failed to get compliance frameworks',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;