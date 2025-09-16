/**
 * Payments Management Routes
 * Handles payment processing and transaction management
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/rbac');
const { getCollection } = require('../config/optimized-database');

// GET /api/v1/payments - Get all payments
router.get('/', authenticateToken, checkRole(['head_administrator', 'finance_officer']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, method, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactionsCollection = await getCollection('transactions');
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // Get payments with pagination
    const [payments, total] = await Promise.all([
      transactionsCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      transactionsCollection.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
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

// GET /api/v1/payments/:id - Get payment details
router.get('/:id', authenticateToken, checkRole(['head_administrator', 'finance_officer']), async (req, res) => {
  try {
    const { id } = req.params;
    const transactionsCollection = await getCollection('transactions');
    
    const payment = await transactionsCollection.findOne({ _id: id });
    
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
      message: 'Payment details retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PAYMENT_DETAILS_FAILED',
      message: 'Failed to retrieve payment details',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/payments - Create new payment
router.post('/', authenticateToken, checkRole(['head_administrator', 'finance_officer']), async (req, res) => {
  try {
    const { 
      userId, 
      amount, 
      currency = 'AED', 
      method, 
      description,
      bookingId,
      serviceId
    } = req.body;
    
    if (!userId || !amount || !method) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'userId, amount, and method are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const transactionsCollection = await getCollection('transactions');
    
    const newPayment = {
      userId,
      amount: parseFloat(amount),
      currency,
      method,
      status: 'pending',
      description: description || 'Payment transaction',
      bookingId: bookingId || null,
      serviceId: serviceId || null,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        createdBy: req.user.userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await transactionsCollection.insertOne(newPayment);
    
    res.status(201).json({
      success: true,
      data: {
        payment: {
          ...newPayment,
          _id: result.insertedId
        }
      },
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

// PUT /api/v1/payments/:id/status - Update payment status
router.put('/:id/status', authenticateToken, checkRole(['head_administrator', 'finance_officer']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId, failureReason } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_STATUS',
        message: 'Status is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    const transactionsCollection = await getCollection('transactions');
    
    // Check if payment exists
    const existingPayment = await transactionsCollection.findOne({ _id: id });
    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        error: 'PAYMENT_NOT_FOUND',
        message: 'Payment not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Build update data
    const updateData = {
      status,
      updatedAt: new Date(),
      updatedBy: req.user.userId
    };
    
    if (transactionId) updateData.transactionId = transactionId;
    if (failureReason) updateData.failureReason = failureReason;
    
    const result = await transactionsCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'Failed to update payment status',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get updated payment
    const updatedPayment = await transactionsCollection.findOne({ _id: id });
    
    res.json({
      success: true,
      data: { payment: updatedPayment },
      message: 'Payment status updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_PAYMENT_STATUS_FAILED',
      message: 'Failed to update payment status',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/payments/stats - Get payment statistics
router.get('/stats', authenticateToken, checkRole(['head_administrator', 'finance_officer']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const transactionsCollection = await getCollection('transactions');
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    const [totalStats, statusStats, methodStats, dailyStats] = await Promise.all([
      // Total amount and count
      transactionsCollection.aggregate([
        { $match: dateFilter },
        { 
          $group: { 
            _id: null, 
            totalAmount: { $sum: '$amount' },
            totalCount: { $sum: 1 },
            averageAmount: { $avg: '$amount' }
          } 
        }
      ]).toArray(),
      
      // Stats by status
      transactionsCollection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
      ]).toArray(),
      
      // Stats by payment method
      transactionsCollection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$method', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
      ]).toArray(),
      
      // Daily stats for the last 30 days
      transactionsCollection.aggregate([
        { 
          $match: { 
            ...dateFilter,
            createdAt: { 
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
            } 
          } 
        },
        { 
          $group: { 
            _id: { 
              $dateToString: { 
                format: '%Y-%m-%d', 
                date: '$createdAt' 
              } 
            }, 
            count: { $sum: 1 }, 
            amount: { $sum: '$amount' } 
          } 
        },
        { $sort: { _id: 1 } }
      ]).toArray()
    ]);
    
    const stats = {
      total: totalStats[0] || { totalAmount: 0, totalCount: 0, averageAmount: 0 },
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat._id] = { count: stat.count, amount: stat.amount };
        return acc;
      }, {}),
      byMethod: methodStats.reduce((acc, stat) => {
        acc[stat._id] = { count: stat.count, amount: stat.amount };
        return acc;
      }, {}),
      daily: dailyStats
    };
    
    res.json({
      success: true,
      data: { stats },
      message: 'Payment statistics retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PAYMENT_STATS_FAILED',
      message: 'Failed to retrieve payment statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/payments/user/:userId - Get user payments
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Check if user can access this data
    if (req.user.userId !== userId && !req.user.permissions.includes('head_administrator')) {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'You can only view your own payments',
        timestamp: new Date().toISOString()
      });
    }
    
    const transactionsCollection = await getCollection('transactions');
    
    const [payments, total] = await Promise.all([
      transactionsCollection
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      transactionsCollection.countDocuments({ userId })
    ]);
    
    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'User payments retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_USER_PAYMENTS_FAILED',
      message: 'Failed to retrieve user payments',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;