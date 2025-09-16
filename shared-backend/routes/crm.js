/**
 * CRM Management Routes
 * Complete CRM system with customer management, leads, and sales tracking
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/optimized-database');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');

// Apply rate limiting
const crmRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 100 });

// ==================== CUSTOMER MANAGEMENT ====================

// GET /api/crm/customers - Get all customers
router.get('/customers', authenticateToken, requireRole(['admin', 'crm_manager', 'sales_manager', 'super_admin']), crmRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, source, search } = req.query;
    const skip = (page - 1) * limit;
    
    const customersCollection = await getCollection('customers');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (source) query.source = source;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    
    const customers = await customersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await customersCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Customers retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CUSTOMERS_FAILED',
      message: 'Failed to retrieve customers',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/crm/customers/:id - Get customer by ID
router.get('/customers/:id', authenticateToken, requireRole(['admin', 'crm_manager', 'sales_manager', 'super_admin']), crmRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const customersCollection = await getCollection('customers');
    
    const customer = await customersCollection.findOne({ _id: new ObjectId(id) });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'CUSTOMER_NOT_FOUND',
        message: 'Customer not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { customer },
      message: 'Customer retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CUSTOMER_FAILED',
      message: 'Failed to retrieve customer',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/crm/customers - Create new customer
router.post('/customers', authenticateToken, requireRole(['admin', 'crm_manager', 'sales_manager', 'super_admin']), crmRateLimit, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      source,
      status = 'lead',
      notes,
      address
    } = req.body;
    
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'First name, last name, and email are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const customersCollection = await getCollection('customers');
    
    // Check if customer already exists
    const existingCustomer = await customersCollection.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        error: 'CUSTOMER_EXISTS',
        message: 'Customer with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    const newCustomer = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || null,
      company: company || null,
      position: position || null,
      source: source || 'website',
      status,
      notes: notes || null,
      address: address || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await customersCollection.insertOne(newCustomer);
    
    res.status(201).json({
      success: true,
      data: { customer: { ...newCustomer, _id: result.insertedId } },
      message: 'Customer created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_CUSTOMER_FAILED',
      message: 'Failed to create customer',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== LEADS MANAGEMENT ====================

// GET /api/crm/leads - Get all leads
router.get('/leads', authenticateToken, requireRole(['admin', 'crm_manager', 'sales_manager', 'super_admin']), crmRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, source, assignedTo } = req.query;
    const skip = (page - 1) * limit;
    
    const leadsCollection = await getCollection('leads');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (source) query.source = source;
    if (assignedTo) query.assignedTo = assignedTo;
    
    const leads = await leadsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await leadsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        leads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Leads retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_LEADS_FAILED',
      message: 'Failed to retrieve leads',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== SALES TRACKING ====================

// GET /api/crm/sales - Get sales data
router.get('/sales', authenticateToken, requireRole(['admin', 'crm_manager', 'sales_manager', 'super_admin']), crmRateLimit, async (req, res) => {
  try {
    const { period = '30d', status } = req.query;
    
    const salesCollection = await getCollection('sales');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));
    
    // Build query
    const query = {
      createdAt: { $gte: startDate, $lte: endDate }
    };
    if (status) query.status = status;
    
    const sales = await salesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    // Calculate totals
    const totals = sales.reduce((acc, sale) => {
      acc.totalRevenue += sale.amount || 0;
      acc.totalDeals += 1;
      if (sale.status === 'closed') {
        acc.closedDeals += 1;
        acc.closedRevenue += sale.amount || 0;
      }
      return acc;
    }, { totalRevenue: 0, totalDeals: 0, closedDeals: 0, closedRevenue: 0 });
    
    res.json({
      success: true,
      data: {
        sales,
        totals,
        period,
        summary: {
          totalRecords: sales.length,
          conversionRate: sales.length > 0 ? (totals.closedDeals / sales.length * 100).toFixed(2) : 0
        }
      },
      message: 'Sales data retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SALES_FAILED',
      message: 'Failed to retrieve sales data',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== CRM ANALYTICS ====================

// GET /api/crm/analytics - Get CRM analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'crm_manager', 'sales_manager', 'super_admin']), crmRateLimit, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const customersCollection = await getCollection('customers');
    const leadsCollection = await getCollection('leads');
    const salesCollection = await getCollection('sales');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));
    
    // Customer statistics
    const totalCustomers = await customersCollection.countDocuments();
    const newCustomers = await customersCollection.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Lead statistics
    const totalLeads = await leadsCollection.countDocuments();
    const newLeads = await leadsCollection.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Sales statistics
    const totalSales = await salesCollection.countDocuments();
    const periodSales = await salesCollection.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const analytics = {
      customers: {
        total: totalCustomers,
        new: newCustomers
      },
      leads: {
        total: totalLeads,
        new: newLeads
      },
      sales: {
        total: totalSales,
        period: periodSales
      },
      period,
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'CRM analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get CRM analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CRM_ANALYTICS_FAILED',
      message: 'Failed to retrieve CRM analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== GENERIC HANDLERS ====================

// GET /api/crm - Get CRM overview
router.get('/', authenticateToken, requireRole(['admin', 'crm_manager', 'sales_manager', 'super_admin']), crmRateLimit, async (req, res) => {
  res.json({
    success: true,
    message: 'CRM Management API is running',
    endpoints: {
      customers: '/api/crm/customers',
      leads: '/api/crm/leads',
      sales: '/api/crm/sales',
      analytics: '/api/crm/analytics'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
