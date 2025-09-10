const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { validate } = require('../middleware/inputValidation');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');

// Rate limiting for CRM endpoints
const crmRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many CRM requests from this IP, please try again later.'
});

// Apply rate limiting to all CRM routes
router.use(crmRateLimit);

// ==================== DEAL MANAGEMENT ====================

// Get all deals
router.get('/deals', authenticateToken, requireRole(['admin', 'sales_manager', 'sales_rep']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, stage, owner, startDate, endDate, search } = req.query;
    
    // Build filters
    const filters = {};
    if (status) filters.status = status;
    if (stage) filters.stage = stage;
    if (owner) filters.ownerId = owner;
    if (startDate || endDate) {
      filters.createdDate = {};
      if (startDate) filters.createdDate.$gte = new Date(startDate);
      if (endDate) filters.createdDate.$lte = new Date(endDate);
    }
    if (search) {
      filters.$or = [
        { dealName: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }

    const collection = await getCollection('deals');
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const deals = await collection.find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdDate: -1 })
      .toArray();

    const total = await collection.countDocuments(filters);

    res.json({
      success: true,
      data: deals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting deals:', error);
    res.status(500).json({
      success: false,
      error: 'GET_DEALS_FAILED',
      message: 'Failed to retrieve deals'
    });
  }
});

// Delete deal
router.delete('/deals/:id', authenticateToken, requireRole(['admin', 'sales_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const collection = await getCollection('deals');
    
    // Check if deal exists
    const existingDeal = await collection.findOne({ _id: id });
    if (!existingDeal) {
      return res.status(404).json({
        success: false,
        error: 'DEAL_NOT_FOUND',
        message: 'Deal not found'
      });
    }

    // Only allow deletion of draft deals
    if (existingDeal.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'DEAL_CANNOT_BE_DELETED',
        message: 'Only draft deals can be deleted'
      });
    }

    const result = await collection.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Deal deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting deal:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_DEAL_FAILED',
      message: 'Failed to delete deal'
    });
  }
});

// ==================== LEAD MANAGEMENT ====================

// Get all leads
router.get('/leads', authenticateToken, requireRole(['admin', 'sales_manager', 'sales_rep']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, source, owner, startDate, endDate, search } = req.query;
    
    // Build filters
    const filters = {};
    if (status) filters.status = status;
    if (source) filters.source = source;
    if (owner) filters.ownerId = owner;
    if (startDate || endDate) {
      filters.createdDate = {};
      if (startDate) filters.createdDate.$gte = new Date(startDate);
      if (endDate) filters.createdDate.$lte = new Date(endDate);
    }
    if (search) {
      filters.$or = [
        { leadName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const collection = await getCollection('leads');
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const leads = await collection.find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdDate: -1 })
      .toArray();

    const total = await collection.countDocuments(filters);

    res.json({
      success: true,
      data: leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting leads:', error);
    res.status(500).json({
      success: false,
      error: 'GET_LEADS_FAILED',
      message: 'Failed to retrieve leads'
    });
  }
});

// ==================== PIPELINE MANAGEMENT ====================

// Get pipeline details
router.get('/pipeline/:id', authenticateToken, requireRole(['admin', 'sales_manager', 'sales_rep']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const collection = await getCollection('deals');
    const deal = await collection.findOne({ _id: id });

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'DEAL_NOT_FOUND',
        message: 'Deal not found'
      });
    }

    // Get pipeline stages
    const pipelineStages = [
      { stage: 'prospecting', deals: [], count: 0 },
      { stage: 'qualification', deals: [], count: 0 },
      { stage: 'proposal', deals: [], count: 0 },
      { stage: 'negotiation', deals: [], count: 0 },
      { stage: 'closed_won', deals: [], count: 0 },
      { stage: 'closed_lost', deals: [], count: 0 }
    ];

    // Get all deals for pipeline view
    const allDeals = await collection.find({}, { 
      projection: { 
        _id: 1, 
        dealName: 1, 
        customerName: 1, 
        amount: 1, 
        stage: 1, 
        ownerName: 1,
        expectedCloseDate: 1
      } 
    }).toArray();

    // Group deals by stage
    allDeals.forEach(deal => {
      const stage = pipelineStages.find(s => s.stage === deal.stage);
      if (stage) {
        stage.deals.push(deal);
        stage.count = stage.deals.length;
      }
    });

    const pipeline = {
      dealId: id,
      dealDetails: deal,
      stages: pipelineStages,
      totalDeals: allDeals.length,
      totalValue: allDeals.reduce((sum, d) => sum + (d.amount || 0), 0)
    };

    res.json({
      success: true,
      data: pipeline
    });
  } catch (error) {
    logger.error('Error getting pipeline:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PIPELINE_FAILED',
      message: 'Failed to retrieve pipeline'
    });
  }
});

// ==================== CUSTOMER MANAGEMENT ====================

// Get all customers
router.get('/customers', authenticateToken, requireRole(['admin', 'sales_manager', 'sales_rep']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, startDate, endDate, search } = req.query;
    
    // Build filters
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.customerType = type;
    if (startDate || endDate) {
      filters.createdDate = {};
      if (startDate) filters.createdDate.$gte = new Date(startDate);
      if (endDate) filters.createdDate.$lte = new Date(endDate);
    }
    if (search) {
      filters.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const collection = await getCollection('customers');
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const customers = await collection.find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdDate: -1 })
      .toArray();

    const total = await collection.countDocuments(filters);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting customers:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CUSTOMERS_FAILED',
      message: 'Failed to retrieve customers'
    });
  }
});

// ==================== CRM ANALYTICS ====================

// Get CRM analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'sales_manager']), async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const dealsCollection = await getCollection('deals');
    const leadsCollection = await getCollection('leads');
    const customersCollection = await getCollection('customers');
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get deal analytics
    const dealStats = await dealsCollection.aggregate([
      { $match: { createdDate: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalDeals: { $sum: 1 },
          totalValue: { $sum: '$amount' },
          averageValue: { $avg: '$amount' },
          wonDeals: { $sum: { $cond: [{ $eq: ['$status', 'closed_won'] }, 1, 0] } },
          lostDeals: { $sum: { $cond: [{ $eq: ['$status', 'closed_lost'] }, 1, 0] } },
          openDeals: { $sum: { $cond: [{ $in: ['$status', ['prospecting', 'qualification', 'proposal', 'negotiation']] }, 1, 0] } }
        }
      }
    ]).toArray();

    // Get lead analytics
    const leadStats = await leadsCollection.aggregate([
      { $match: { createdDate: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          qualifiedLeads: { $sum: { $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] } },
          convertedLeads: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } }
        }
      }
    ]).toArray();

    // Get customer analytics
    const customerStats = await customersCollection.aggregate([
      { $match: { createdDate: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          newCustomers: { $sum: { $cond: [{ $gte: ['$createdDate', startDate] }, 1, 0] } }
        }
      }
    ]).toArray();

    const analytics = {
      period,
      startDate,
      endDate: now,
      deals: dealStats[0] || {
        totalDeals: 0,
        totalValue: 0,
        averageValue: 0,
        wonDeals: 0,
        lostDeals: 0,
        openDeals: 0
      },
      leads: leadStats[0] || {
        totalLeads: 0,
        qualifiedLeads: 0,
        convertedLeads: 0
      },
      customers: customerStats[0] || {
        totalCustomers: 0,
        newCustomers: 0
      },
      conversionRate: leadStats[0]?.totalLeads > 0 ? 
        (leadStats[0].convertedLeads / leadStats[0].totalLeads * 100).toFixed(2) : 0,
      winRate: dealStats[0]?.totalDeals > 0 ? 
        (dealStats[0].wonDeals / dealStats[0].totalDeals * 100).toFixed(2) : 0
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error getting CRM analytics:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CRM_ANALYTICS_FAILED',
      message: 'Failed to retrieve CRM analytics'
    });
  }
});

module.exports = router;
