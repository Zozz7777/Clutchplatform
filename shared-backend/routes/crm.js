const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const rateLimit = require('express-rate-limit');

// Rate limiting
const crmLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many CRM requests from this IP, please try again later.'
});

// Apply rate limiting and authentication to all routes
router.use(crmLimiter);
router.use(authenticateToken);

// ===== CRM CUSTOMERS =====

// GET /api/v1/crm/customer-health-scores - Get customer health scores
router.get('/customer-health-scores', checkRole(['head_administrator', 'crm_manager']), async (req, res) => {
  try {
    const healthScoresCollection = await getCollection('customer_health_scores');
    
    if (!healthScoresCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const { startDate, endDate, customerId, riskLevel } = req.query;
    const filter = {};
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    if (customerId) filter.customerId = customerId;
    if (riskLevel) filter.riskLevel = riskLevel;
    
    const healthScores = await healthScoresCollection
      .find(filter)
      .sort({ date: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: healthScores,
      message: 'Customer health scores retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get customer health scores error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CUSTOMER_HEALTH_SCORES_FAILED',
      message: 'Failed to get customer health scores',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/crm/customers - Get all customers
router.get('/customers', async (req, res) => {
  try {
    const customersCollection = await getCollection('customers');
    const { page = 1, limit = 10, status, source } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const customers = await customersCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await customersCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/crm/customers/:id - Get customer by ID
router.get('/customers/:id', async (req, res) => {
  try {
    const customersCollection = await getCollection('customers');
    const customer = await customersCollection.findOne({ _id: req.params.id });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/crm/customers - Create new customer
router.post('/customers', checkRole(['head_administrator', 'customer_support']), async (req, res) => {
  try {
    const customersCollection = await getCollection('customers');
    const { 
      name, 
      email, 
      phone, 
      company, 
      status, 
      source, 
      notes 
    } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }
    
    const customer = {
      name,
      email,
      phone: phone || '',
      company: company || '',
      status: status || 'lead',
      source: source || 'website',
      notes: notes || '',
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await customersCollection.insertOne(customer);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...customer
      },
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== CRM LEADS =====

// GET /api/crm/leads - Get all leads
router.get('/leads', async (req, res) => {
  try {
    const leadsCollection = await getCollection('leads');
    const { page = 1, limit = 10, status, source } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const leads = await leadsCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await leadsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        leads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== CRM SALES =====

// GET /api/crm/sales - Get all sales
router.get('/sales', async (req, res) => {
  try {
    const salesCollection = await getCollection('sales');
    const { page = 1, limit = 10, status, dateFrom, dateTo } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const sales = await salesCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await salesCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== CRM TICKETS =====

// GET /api/crm/tickets - Get all tickets
router.get('/tickets', async (req, res) => {
  try {
    const ticketsCollection = await getCollection('tickets');
    const { page = 1, limit = 10, status, priority, assignedTo } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const tickets = await ticketsCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await ticketsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/crm/tickets - Create new ticket
router.post('/tickets', checkRole(['head_administrator', 'customer_support']), async (req, res) => {
  try {
    const ticketsCollection = await getCollection('tickets');
    const { 
      title, 
      description, 
      priority = 'medium', 
      category, 
      customerId,
      assignedTo 
    } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }
    
    const ticketData = {
      title,
      description,
      priority,
      category: category || 'general',
      customerId,
      assignedTo,
      status: 'open',
      createdBy: req.user.userId || req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await ticketsCollection.insertOne(ticketData);
    
    res.json({
      success: true,
      data: {
        ticket: {
          ...ticketData,
          _id: result.insertedId
        }
      },
      message: 'Ticket created successfully'
    });
    
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== CRM ANALYTICS =====

// GET /api/crm/analytics - Get CRM analytics
router.get('/analytics', async (req, res) => {
  try {
    const customersCollection = await getCollection('customers');
    const leadsCollection = await getCollection('leads');
    const salesCollection = await getCollection('sales');
    const ticketsCollection = await getCollection('tickets');
    
    const totalCustomers = await customersCollection.countDocuments();
    const totalLeads = await leadsCollection.countDocuments();
    const totalSales = await salesCollection.countDocuments();
    const totalTickets = await ticketsCollection.countDocuments();
    
    // Get customers by status
    const customerStatusStats = await customersCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get leads by source
    const leadSourceStats = await leadsCollection.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get tickets by priority
    const ticketPriorityStats = await ticketsCollection.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]).toArray();
    
    res.json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          totalLeads,
          totalSales,
          totalTickets
        },
        customerStatusStats,
        leadSourceStats,
        ticketPriorityStats
      }
    });
  } catch (error) {
    console.error('Error fetching CRM analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch CRM analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================================================
// CRITICAL ACCOUNTS ENDPOINTS
// ============================================================================

// GET /api/v1/crm/critical-accounts - Get critical accounts
router.get('/critical-accounts', checkRole(['head_administrator', 'admin', 'crm_manager', 'account_manager']), async (req, res) => {
  try {
    const accountsCollection = await getCollection('critical_accounts');
    const { page = 1, limit = 50, tier, status } = req.query;
    
    const filter = {};
    if (tier) filter.tier = tier;
    if (status) filter.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const accounts = await accountsCollection
      .find(filter)
      .sort({ healthScore: 1 }) // Sort by health score (lowest first - most critical)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await accountsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: accounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get critical accounts error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CRITICAL_ACCOUNTS_FAILED',
      message: 'Failed to retrieve critical accounts',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/crm/critical-accounts/:id - Get specific critical account
router.get('/critical-accounts/:id', checkRole(['head_administrator', 'admin', 'crm_manager', 'account_manager']), async (req, res) => {
  try {
    const accountsCollection = await getCollection('critical_accounts');
    const { id } = req.params;
    
    const account = await accountsCollection.findOne({ id });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'CRITICAL_ACCOUNT_NOT_FOUND',
        message: 'Critical account not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: account,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get critical account error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CRITICAL_ACCOUNT_FAILED',
      message: 'Failed to retrieve critical account',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/crm/critical-accounts/:id - Update critical account
router.put('/critical-accounts/:id', checkRole(['head_administrator', 'admin', 'crm_manager', 'account_manager']), async (req, res) => {
  try {
    const accountsCollection = await getCollection('critical_accounts');
    const { id } = req.params;
    
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    const result = await accountsCollection.updateOne(
      { id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'CRITICAL_ACCOUNT_NOT_FOUND',
        message: 'Critical account not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { id, ...updateData },
      message: 'Critical account updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update critical account error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_CRITICAL_ACCOUNT_FAILED',
      message: 'Failed to update critical account',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/crm/critical-accounts/:id/actions - Add action to critical account
router.post('/critical-accounts/:id/actions', checkRole(['head_administrator', 'admin', 'crm_manager', 'account_manager']), async (req, res) => {
  try {
    const accountsCollection = await getCollection('critical_accounts');
    const { id } = req.params;
    const { action, notes, priority = 'medium' } = req.body;
    
    const actionData = {
      id: `action-${Date.now()}`,
      action,
      notes,
      priority,
      status: 'pending',
      assignedTo: req.user.id,
      createdAt: new Date().toISOString()
    };
    
    const result = await accountsCollection.updateOne(
      { id },
      { 
        $push: { actions: actionData },
        $set: { updatedAt: new Date().toISOString() }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'CRITICAL_ACCOUNT_NOT_FOUND',
        message: 'Critical account not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: actionData,
      message: 'Action added to critical account successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Add action to critical account error:', error);
    res.status(500).json({
      success: false,
      error: 'ADD_ACTION_TO_CRITICAL_ACCOUNT_FAILED',
      message: 'Failed to add action to critical account',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;