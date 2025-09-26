const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const PartnerOrder = require('../models/PartnerOrder');
const PartnerPayment = require('../models/PartnerPayment');
const PartnerRequest = require('../models/PartnerRequest');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// ============================================================================
// MOBILE PARTNERS APP ENDPOINTS
// ============================================================================

// @route   POST /partners/auth/request-to-join
// @desc    Request to join as partner
// @access  Public
router.post('/auth/request-to-join', [
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('ownerName').notEmpty().withMessage('Owner name is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('partnerType').isIn(['repair_center', 'auto_parts_shop', 'accessories_shop', 'importer_manufacturer', 'service_center']).withMessage('Valid partner type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      businessName,
      ownerName,
      phone,
      email,
      address,
      partnerType,
      businessDescription,
      yearsInBusiness,
      website,
      socialMedia
    } = req.body;

    // Check if request already exists
    const existingRequest = await PartnerRequest.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Request already exists with this email or phone'
      });
    }

    // Create partner request
    const requestData = {
      businessName,
      ownerName,
      phone,
      email: email.toLowerCase(),
      address,
      partnerType,
      businessDescription,
      yearsInBusiness,
      website,
      socialMedia,
      status: 'pending',
      submittedAt: new Date()
    };

    const partnerRequest = new PartnerRequest(requestData);
    await partnerRequest.save();

    // Notify admin team
    await sendAdminNotification('new_partner_request', {
      requestId: partnerRequest._id,
      businessName,
      ownerName,
      partnerType,
      email,
      phone
    });

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully. Our team will review and contact you soon.',
      data: {
        requestId: partnerRequest._id,
        status: partnerRequest.status
      }
    });

  } catch (error) {
    logger.error('Request to join error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/orders
// @desc    Get partner orders for mobile app
// @access  Private
router.get('/orders', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { status, page = 1, limit = 20, date } = req.query;

    // Build query
    const query = { partnerId };
    if (status) {
      query.status = status;
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // Get orders with pagination
    const orders = await PartnerOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('customerId', 'name phone email')
      .lean();

    const total = await PartnerOrder.countDocuments(query);

    // Format orders for mobile display
    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderId: order.orderId,
      customer: {
        name: order.customerName || order.customerId?.name,
        phone: order.customerPhone || order.customerId?.phone,
        email: order.customerEmail || order.customerId?.email
      },
      service: order.serviceName,
      description: order.description,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      scheduledDate: order.scheduledDate,
      estimatedTime: order.estimatedTime,
      createdAt: order.createdAt,
      isUrgent: order.priority === 'high'
    }));

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get partner orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /partners/orders/:id/status
// @desc    Update order status
// @access  Private
router.patch('/orders/:id/status', auth, [
  body('status').isIn(['acknowledged', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id: orderId } = req.params;
    const { status, notes, estimatedTime } = req.body;
    const partnerId = req.user.partnerId;

    const order = await PartnerOrder.findOne({ _id: orderId, partnerId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.status = status;
    if (notes) order.notes = notes;
    if (estimatedTime) order.estimatedTime = estimatedTime;
    
    // Set timestamps based on status
    switch (status) {
      case 'acknowledged':
        order.acknowledgedAt = new Date();
        break;
      case 'preparing':
        order.preparingAt = new Date();
        break;
      case 'ready':
        order.readyAt = new Date();
        break;
      case 'picked_up':
        order.pickedUpAt = new Date();
        break;
      case 'delivered':
        order.deliveredAt = new Date();
        break;
    }

    await order.save();

    // Send notification to customer
    await sendCustomerNotification(order, 'order_status_update', {
      orderId: order.orderId,
      status,
      partnerName: order.partnerName,
      estimatedTime
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        id: order._id,
        orderId: order.orderId,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });

  } catch (error) {
    logger.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/invoices
// @desc    Get partner invoices
// @access  Private
router.get('/invoices', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { status, page = 1, limit = 20, date } = req.query;

    // Build query
    const query = { partnerId };
    if (status) {
      query.paymentStatus = status;
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // Get invoices (orders with payment info)
    const invoices = await PartnerOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('customerId', 'name phone email')
      .lean();

    const total = await PartnerOrder.countDocuments(query);

    // Format invoices for mobile display
    const formattedInvoices = invoices.map(invoice => ({
      id: invoice._id,
      invoiceId: invoice.orderId,
      customer: {
        name: invoice.customerName || invoice.customerId?.name,
        phone: invoice.customerPhone || invoice.customerId?.phone
      },
      service: invoice.serviceName,
      total: invoice.total,
      paymentStatus: invoice.paymentStatus,
      paymentMethod: invoice.paymentMethod,
      createdAt: invoice.createdAt,
      paidAt: invoice.paidAt,
      isPaid: invoice.paymentStatus === 'paid',
      isPending: invoice.paymentStatus === 'pending',
      isRejected: invoice.paymentStatus === 'rejected'
    }));

    res.json({
      success: true,
      data: {
        invoices: formattedInvoices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get partner invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /partners/invoices/:id/status
// @desc    Update invoice status
// @access  Private
router.patch('/invoices/:id/status', auth, [
  body('paymentStatus').isIn(['pending', 'paid', 'rejected', 'refunded']).withMessage('Valid payment status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id: invoiceId } = req.params;
    const { paymentStatus, notes } = req.body;
    const partnerId = req.user.partnerId;

    const invoice = await PartnerOrder.findOne({ _id: invoiceId, partnerId });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Update payment status
    invoice.paymentStatus = paymentStatus;
    if (notes) invoice.notes = notes;
    
    if (paymentStatus === 'paid') {
      invoice.paidAt = new Date();
      invoice.status = 'paid';
    } else if (paymentStatus === 'rejected') {
      invoice.rejectedAt = new Date();
      invoice.status = 'payment_rejected';
    }

    await invoice.save();

    // Send notification to customer
    await sendCustomerNotification(invoice, 'payment_status_update', {
      invoiceId: invoice.orderId,
      paymentStatus,
      total: invoice.total
    });

    res.json({
      success: true,
      message: 'Invoice status updated successfully',
      data: {
        id: invoice._id,
        invoiceId: invoice.orderId,
        paymentStatus: invoice.paymentStatus,
        updatedAt: invoice.updatedAt
      }
    });

  } catch (error) {
    logger.error('Update invoice status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/payments/weekly
// @desc    Get weekly payment summary
// @access  Private
router.get('/payments/weekly', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { week } = req.query;

    // Calculate week date range
    let weekStart, weekEnd;
    if (week) {
      weekStart = new Date(week);
      weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
    } else {
      // Current week
      const now = new Date();
      weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
    }

    weekStart.setHours(0, 0, 0, 0);
    weekEnd.setHours(23, 59, 59, 999);

    // Get weekly payments
    const payments = await PartnerPayment.find({
      partnerId,
      paymentStatus: 'paid',
      processedAt: { $gte: weekStart, $lte: weekEnd }
    }).lean();

    // Calculate totals
    const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOrders = payments.length;
    
    const dailyBreakdown = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyBreakdown[dateStr] = {
        date: dateStr,
        earnings: 0,
        orders: 0
      };
    }

    payments.forEach(payment => {
      const dateStr = payment.processedAt.toISOString().split('T')[0];
      if (dailyBreakdown[dateStr]) {
        dailyBreakdown[dateStr].earnings += payment.amount;
        dailyBreakdown[dateStr].orders += 1;
      }
    });

    // Calculate next payout
    const nextPayoutDate = new Date(weekEnd);
    nextPayoutDate.setDate(nextPayoutDate.getDate() + 1);
    const daysUntilPayout = Math.ceil((nextPayoutDate - new Date()) / (1000 * 60 * 60 * 24));

    res.json({
      success: true,
      data: {
        week: {
          start: weekStart.toISOString().split('T')[0],
          end: weekEnd.toISOString().split('T')[0]
        },
        summary: {
          totalEarnings,
          totalOrders,
          averageOrderValue: totalOrders > 0 ? (totalEarnings / totalOrders).toFixed(2) : 0
        },
        dailyBreakdown: Object.values(dailyBreakdown),
        nextPayout: {
          date: nextPayoutDate.toISOString().split('T')[0],
          daysUntil: Math.max(0, daysUntilPayout),
          amount: totalEarnings
        }
      }
    });

  } catch (error) {
    logger.error('Get weekly payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/payments/history
// @desc    Get payment history
// @access  Private
router.get('/payments/history', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { page = 1, limit = 20, status } = req.query;

    // Build query
    const query = { partnerId };
    if (status) {
      query.paymentStatus = status;
    }

    // Get payment history
    const payments = await PartnerPayment.find(query)
      .sort({ processedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('orderId', 'orderId serviceName customerName')
      .lean();

    const total = await PartnerPayment.countDocuments(query);

    // Format payments for mobile display
    const formattedPayments = payments.map(payment => ({
      id: payment._id,
      paymentId: payment.paymentId,
      orderId: payment.orderId?.orderId,
      service: payment.orderId?.serviceName,
      customer: payment.orderId?.customerName,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      processedAt: payment.processedAt,
      isPaid: payment.paymentStatus === 'paid',
      isPending: payment.paymentStatus === 'pending',
      isRejected: payment.paymentStatus === 'rejected'
    }));

    res.json({
      success: true,
      data: {
        payments: formattedPayments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/settings
// @desc    Get partner settings
// @access  Private
router.get('/settings', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;

    const partner = await PartnerUser.findOne({ partnerId });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.json({
      success: true,
      data: {
        businessName: partner.businessName,
        ownerName: partner.ownerName,
        email: partner.email,
        phone: partner.phone,
        partnerType: partner.partnerType,
        businessAddress: partner.businessAddress,
        workingHours: partner.workingHours,
        businessSettings: partner.businessSettings,
        notificationPreferences: partner.notificationPreferences,
        isVerified: partner.isVerified,
        status: partner.status
      }
    });

  } catch (error) {
    logger.error('Get partner settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /partners/settings
// @desc    Update partner settings
// @access  Private
router.patch('/settings', auth, [
  body('businessName').optional().notEmpty().withMessage('Business name cannot be empty'),
  body('ownerName').optional().notEmpty().withMessage('Owner name cannot be empty'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('email').optional().isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const partnerId = req.user.partnerId;
    const updateData = req.body;

    const partner = await PartnerUser.findOne({ partnerId });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'businessName', 'ownerName', 'phone', 'email',
      'businessAddress', 'workingHours', 'businessSettings',
      'notificationPreferences'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        partner[field] = updateData[field];
      }
    });

    await partner.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        businessName: partner.businessName,
        ownerName: partner.ownerName,
        email: partner.email,
        phone: partner.phone,
        businessAddress: partner.businessAddress,
        workingHours: partner.workingHours,
        businessSettings: partner.businessSettings,
        notificationPreferences: partner.notificationPreferences
      }
    });

  } catch (error) {
    logger.error('Update partner settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/dashboard/revenue
// @desc    Get revenue dashboard data
// @access  Private
router.get('/dashboard/revenue', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { period = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get revenue data
    const payments = await PartnerPayment.find({
      partnerId,
      paymentStatus: 'paid',
      processedAt: { $gte: startDate, $lte: endDate }
    }).lean();

    // Calculate metrics
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOrders = payments.length;
    const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    // Daily breakdown
    const dailyRevenue = {};
    payments.forEach(payment => {
      const date = payment.processedAt.toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + payment.amount;
    });

    // Payment method breakdown
    const paymentMethodBreakdown = {};
    payments.forEach(payment => {
      paymentMethodBreakdown[payment.paymentMethod] = 
        (paymentMethodBreakdown[payment.paymentMethod] || 0) + payment.amount;
    });

    res.json({
      success: true,
      data: {
        period: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue: parseFloat(averageOrderValue.toFixed(2))
        },
        dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({
          date,
          revenue
        })),
        paymentMethodBreakdown
      }
    });

  } catch (error) {
    logger.error('Get revenue dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper functions
const sendAdminNotification = async (type, data) => {
  try {
    logger.info(`Sending admin notification: ${type}`, data);
    // In production, this would send actual notifications to admin team
    return true;
  } catch (error) {
    logger.error('Error sending admin notification:', error);
    return false;
  }
};

const sendCustomerNotification = async (order, type, data) => {
  try {
    logger.info(`Sending customer notification: ${type}`, data);
    // In production, this would send actual notifications to customer
    return true;
  } catch (error) {
    logger.error('Error sending customer notification:', error);
    return false;
  }
};

module.exports = router;
