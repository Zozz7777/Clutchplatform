/**
 * Finance Management Routes
 * Complete finance system with payments, invoices, and financial tracking
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/optimized-database');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');

// Apply rate limiting
const financeRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 100 });

// ==================== PAYMENT MANAGEMENT ====================

// GET /api/finance/payments - Get all payments
router.get('/payments', authenticateToken, requireRole(['admin', 'finance_manager', 'accountant', 'super_admin']), financeRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, method, dateFrom, dateTo } = req.query;
    const skip = (page - 1) * limit;
    
    const paymentsCollection = await getCollection('payments');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (method) query.method = method;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    const payments = await paymentsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await paymentsCollection.countDocuments(query);
    
    // Calculate totals
    const totals = payments.reduce((acc, payment) => {
      acc.totalAmount += payment.amount || 0;
      if (payment.status === 'completed') {
        acc.completedAmount += payment.amount || 0;
        acc.completedCount += 1;
      }
      return acc;
    }, { totalAmount: 0, completedAmount: 0, completedCount: 0 });
    
    res.json({
      success: true,
      data: {
        payments,
        totals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Payments retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PAYMENTS_FAILED',
      message: 'Failed to retrieve payments',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/finance/payments/:id - Get payment by ID
router.get('/payments/:id', authenticateToken, requireRole(['admin', 'finance_manager', 'accountant', 'super_admin']), financeRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const paymentsCollection = await getCollection('payments');
    
    const payment = await paymentsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'PAYMENT_NOT_FOUND',
        message: 'Payment not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { payment },
      message: 'Payment retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PAYMENT_FAILED',
      message: 'Failed to retrieve payment',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/finance/payments - Create new payment
router.post('/payments', authenticateToken, requireRole(['admin', 'finance_manager', 'accountant', 'super_admin']), financeRateLimit, async (req, res) => {
  try {
    const {
      amount,
      currency = 'USD',
      method,
      status = 'pending',
      description,
      customerId,
      invoiceId,
      metadata
    } = req.body;
    
    if (!amount || !method) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Amount and payment method are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const paymentsCollection = await getCollection('payments');
    
    const newPayment = {
      amount: parseFloat(amount),
      currency,
      method,
      status,
      description: description || null,
      customerId: customerId || null,
      invoiceId: invoiceId || null,
      metadata: metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await paymentsCollection.insertOne(newPayment);
    
    res.status(201).json({
      success: true,
      data: { payment: { ...newPayment, _id: result.insertedId } },
      message: 'Payment created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_PAYMENT_FAILED',
      message: 'Failed to create payment',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== INVOICE MANAGEMENT ====================

// GET /api/finance/invoices - Get all invoices
router.get('/invoices', authenticateToken, requireRole(['admin', 'finance_manager', 'accountant', 'super_admin']), financeRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, customerId, dateFrom, dateTo } = req.query;
    const skip = (page - 1) * limit;
    
    const invoicesCollection = await getCollection('invoices');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (customerId) query.customerId = customerId;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    const invoices = await invoicesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await invoicesCollection.countDocuments(query);
    
    // Calculate totals
    const totals = invoices.reduce((acc, invoice) => {
      acc.totalAmount += invoice.totalAmount || 0;
      if (invoice.status === 'paid') {
        acc.paidAmount += invoice.totalAmount || 0;
        acc.paidCount += 1;
      } else if (invoice.status === 'overdue') {
        acc.overdueAmount += invoice.totalAmount || 0;
        acc.overdueCount += 1;
      }
      return acc;
    }, { totalAmount: 0, paidAmount: 0, paidCount: 0, overdueAmount: 0, overdueCount: 0 });
    
    res.json({
      success: true,
      data: {
        invoices,
        totals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Invoices retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_INVOICES_FAILED',
      message: 'Failed to retrieve invoices',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/finance/invoices - Create new invoice
router.post('/invoices', authenticateToken, requireRole(['admin', 'finance_manager', 'accountant', 'super_admin']), financeRateLimit, async (req, res) => {
  try {
    const {
      customerId,
      items,
      subtotal,
      taxRate = 0,
      taxAmount = 0,
      totalAmount,
      dueDate,
      description,
      notes
    } = req.body;
    
    if (!customerId || !items || !totalAmount) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Customer ID, items, and total amount are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const invoicesCollection = await getCollection('invoices');
    
    // Generate invoice number
    const invoiceCount = await invoicesCollection.countDocuments();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;
    
    const newInvoice = {
      invoiceNumber,
      customerId,
      items,
      subtotal: parseFloat(subtotal),
      taxRate: parseFloat(taxRate),
      taxAmount: parseFloat(taxAmount),
      totalAmount: parseFloat(totalAmount),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      description: description || null,
      notes: notes || null,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await invoicesCollection.insertOne(newInvoice);
    
    res.status(201).json({
      success: true,
      data: { invoice: { ...newInvoice, _id: result.insertedId } },
      message: 'Invoice created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_INVOICE_FAILED',
      message: 'Failed to create invoice',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== FINANCIAL ANALYTICS ====================

// GET /api/finance/analytics - Get financial analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'finance_manager', 'accountant', 'super_admin']), financeRateLimit, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const paymentsCollection = await getCollection('payments');
    const invoicesCollection = await getCollection('invoices');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));
    
    // Payment statistics
    const totalPayments = await paymentsCollection.countDocuments();
    const periodPayments = await paymentsCollection.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).toArray();
    
    const paymentTotals = periodPayments.reduce((acc, payment) => {
      acc.totalRevenue += payment.amount || 0;
      if (payment.status === 'completed') {
        acc.completedRevenue += payment.amount || 0;
        acc.completedCount += 1;
      }
      return acc;
    }, { totalRevenue: 0, completedRevenue: 0, completedCount: 0 });
    
    // Invoice statistics
    const totalInvoices = await invoicesCollection.countDocuments();
    const periodInvoices = await invoicesCollection.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).toArray();
    
    const invoiceTotals = periodInvoices.reduce((acc, invoice) => {
      acc.totalAmount += invoice.totalAmount || 0;
      if (invoice.status === 'paid') {
        acc.paidAmount += invoice.totalAmount || 0;
        acc.paidCount += 1;
      } else if (invoice.status === 'overdue') {
        acc.overdueAmount += invoice.totalAmount || 0;
        acc.overdueCount += 1;
      }
      return acc;
    }, { totalAmount: 0, paidAmount: 0, paidCount: 0, overdueAmount: 0, overdueCount: 0 });
    
    const analytics = {
      payments: {
        total: totalPayments,
        period: periodPayments.length,
        revenue: paymentTotals.completedRevenue,
        completionRate: periodPayments.length > 0 ? (paymentTotals.completedCount / periodPayments.length * 100).toFixed(2) : 0
      },
      invoices: {
        total: totalInvoices,
        period: periodInvoices.length,
        totalAmount: invoiceTotals.totalAmount,
        paidAmount: invoiceTotals.paidAmount,
        overdueAmount: invoiceTotals.overdueAmount,
        collectionRate: invoiceTotals.totalAmount > 0 ? (invoiceTotals.paidAmount / invoiceTotals.totalAmount * 100).toFixed(2) : 0
      },
      period,
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'Financial analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get financial analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_FINANCIAL_ANALYTICS_FAILED',
      message: 'Failed to retrieve financial analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== GENERIC HANDLERS ====================

// GET /api/finance - Get finance overview
router.get('/', authenticateToken, requireRole(['admin', 'finance_manager', 'accountant', 'super_admin']), financeRateLimit, async (req, res) => {
  res.json({
    success: true,
    message: 'Finance Management API is running',
    endpoints: {
      payments: '/api/finance/payments',
      invoices: '/api/finance/invoices',
      analytics: '/api/finance/analytics'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
