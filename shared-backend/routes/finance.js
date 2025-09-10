const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { validate } = require('../middleware/inputValidation');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');

// Rate limiting for Finance endpoints
const financeRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many Finance requests from this IP, please try again later.'
});

// Apply rate limiting to all Finance routes
router.use(financeRateLimit);

// ==================== INVOICE MANAGEMENT ====================

// Get all invoices
router.get('/invoices', authenticateToken, requireRole(['admin', 'finance_manager', 'finance']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, customer, startDate, endDate, search } = req.query;
    
    // Build filters
    const filters = {};
    if (status) filters.status = status;
    if (customer) filters.customerId = customer;
    if (startDate || endDate) {
      filters.invoiceDate = {};
      if (startDate) filters.invoiceDate.$gte = new Date(startDate);
      if (endDate) filters.invoiceDate.$lte = new Date(endDate);
    }
    if (search) {
      filters.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }

    const collection = await getCollection('invoices');
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const invoices = await collection.find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ invoiceDate: -1 })
      .toArray();

    const total = await collection.countDocuments(filters);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting invoices:', error);
    res.status(500).json({
      success: false,
      error: 'GET_INVOICES_FAILED',
      message: 'Failed to retrieve invoices'
    });
  }
});

// Create new invoice
router.post('/invoices', authenticateToken, requireRole(['admin', 'finance_manager']), async (req, res) => {
  try {
    const { customerId, customerName, items, dueDate, notes } = req.body;
    
    if (!customerId || !customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Customer ID, customer name, and items are required'
      });
    }

    const collection = await getCollection('invoices');
    
    // Generate invoice number
    const invoiceCount = await collection.countDocuments();
    const invoiceNumber = `INV${String(invoiceCount + 1).padStart(6, '0')}`;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    const newInvoice = {
      invoiceNumber,
      customerId,
      customerName,
      items,
      subtotal,
      tax,
      total,
      status: 'draft',
      invoiceDate: new Date(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      notes: notes || '',
      createdAt: new Date(),
      createdBy: req.user.userId
    };

    const result = await collection.insertOne(newInvoice);
    newInvoice._id = result.insertedId;

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: newInvoice
    });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_INVOICE_FAILED',
      message: 'Failed to create invoice'
    });
  }
});

// Update invoice
router.put('/invoices/:id', authenticateToken, requireRole(['admin', 'finance_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_UPDATE_FIELDS',
        message: 'At least one field to update is required'
      });
    }

    const collection = await getCollection('invoices');
    
    // Check if invoice exists
    const existingInvoice = await collection.findOne({ _id: id });
    if (!existingInvoice) {
      return res.status(404).json({
        success: false,
        error: 'INVOICE_NOT_FOUND',
        message: 'Invoice not found'
      });
    }

    // Recalculate totals if items changed
    if (updateData.items && Array.isArray(updateData.items)) {
      const subtotal = updateData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const tax = subtotal * 0.1;
      updateData.subtotal = subtotal;
      updateData.tax = tax;
      updateData.total = subtotal + tax;
    }

    updateData.updatedAt = new Date();
    updateData.updatedBy = req.user.userId;

    const result = await collection.updateOne(
      { _id: id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'INVOICE_NOT_FOUND',
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: { id, ...updateData }
    });
  } catch (error) {
    logger.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_INVOICE_FAILED',
      message: 'Failed to update invoice'
    });
  }
});

// Delete invoice
router.delete('/invoices/:id', authenticateToken, requireRole(['admin', 'finance_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const collection = await getCollection('invoices');
    
    // Check if invoice exists
    const existingInvoice = await collection.findOne({ _id: id });
    if (!existingInvoice) {
      return res.status(404).json({
        success: false,
        error: 'INVOICE_NOT_FOUND',
        message: 'Invoice not found'
      });
    }

    // Only allow deletion of draft invoices
    if (existingInvoice.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'INVOICE_CANNOT_BE_DELETED',
        message: 'Only draft invoices can be deleted'
      });
    }

    const result = await collection.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_INVOICE_FAILED',
      message: 'Failed to delete invoice'
    });
  }
});

// Get invoice by ID
router.get('/invoices/:id', authenticateToken, requireRole(['admin', 'finance_manager', 'finance']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const collection = await getCollection('invoices');
    const invoice = await collection.findOne({ _id: id });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'INVOICE_NOT_FOUND',
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    logger.error('Error getting invoice:', error);
    res.status(500).json({
      success: false,
      error: 'GET_INVOICE_FAILED',
      message: 'Failed to retrieve invoice'
    });
  }
});

// ==================== EXPENSE MANAGEMENT ====================

// Get all expenses
router.get('/expenses', authenticateToken, requireRole(['admin', 'finance_manager', 'finance']), async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, startDate, endDate, search } = req.query;
    
    // Build filters
    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (startDate || endDate) {
      filters.expenseDate = {};
      if (startDate) filters.expenseDate.$gte = new Date(startDate);
      if (endDate) filters.expenseDate.$lte = new Date(endDate);
    }
    if (search) {
      filters.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const collection = await getCollection('expenses');
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const expenses = await collection.find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ expenseDate: -1 })
      .toArray();

    const total = await collection.countDocuments(filters);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting expenses:', error);
    res.status(500).json({
      success: false,
      error: 'GET_EXPENSES_FAILED',
      message: 'Failed to retrieve expenses'
    });
  }
});

// ==================== PAYMENT MANAGEMENT ====================

// Get all payments
router.get('/payments', authenticateToken, requireRole(['admin', 'finance_manager', 'finance']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, method, startDate, endDate, search } = req.query;
    
    // Build filters
    const filters = {};
    if (status) filters.status = status;
    if (method) filters.paymentMethod = method;
    if (startDate || endDate) {
      filters.paymentDate = {};
      if (startDate) filters.paymentDate.$gte = new Date(startDate);
      if (endDate) filters.paymentDate.$lte = new Date(endDate);
    }
    if (search) {
      filters.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }

    const collection = await getCollection('payments');
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const payments = await collection.find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ paymentDate: -1 })
      .toArray();

    const total = await collection.countDocuments(filters);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting payments:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PAYMENTS_FAILED',
      message: 'Failed to retrieve payments'
    });
  }
});

// ==================== FINANCIAL ANALYTICS ====================

// Get financial analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'finance_manager']), async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const invoicesCollection = await getCollection('invoices');
    const expensesCollection = await getCollection('expenses');
    const paymentsCollection = await getCollection('payments');
    
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

    // Get invoice analytics
    const invoiceStats = await invoicesCollection.aggregate([
      { $match: { invoiceDate: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$total' },
          averageAmount: { $avg: '$total' },
          paidInvoices: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
          pendingInvoices: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          overdueInvoices: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } }
        }
      }
    ]).toArray();

    // Get expense analytics
    const expenseStats = await expensesCollection.aggregate([
      { $match: { expenseDate: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]).toArray();

    // Get payment analytics
    const paymentStats = await paymentsCollection.aggregate([
      { $match: { paymentDate: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]).toArray();

    const analytics = {
      period,
      startDate,
      endDate: now,
      invoices: invoiceStats[0] || {
        totalInvoices: 0,
        totalAmount: 0,
        averageAmount: 0,
        paidInvoices: 0,
        pendingInvoices: 0,
        overdueInvoices: 0
      },
      expenses: expenseStats[0] || {
        totalExpenses: 0,
        totalAmount: 0,
        averageAmount: 0
      },
      payments: paymentStats[0] || {
        totalPayments: 0,
        totalAmount: 0,
        averageAmount: 0
      },
      netIncome: (invoiceStats[0]?.totalAmount || 0) - (expenseStats[0]?.totalAmount || 0)
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error getting financial analytics:', error);
    res.status(500).json({
      success: false,
      error: 'GET_FINANCIAL_ANALYTICS_FAILED',
      message: 'Failed to retrieve financial analytics'
    });
  }
});

module.exports = router;
