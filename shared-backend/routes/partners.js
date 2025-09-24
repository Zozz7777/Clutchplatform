const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const PartnerOrder = require('../models/PartnerOrder');
const PartnerPayment = require('../models/PartnerPayment');
const auth = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Validation middleware
const validatePartnerSignup = [
  body('partnerId').notEmpty().withMessage('Partner ID is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('ownerName').notEmpty().withMessage('Owner name is required'),
  body('partnerType').isIn(['repair_center', 'auto_parts_shop', 'accessories_shop', 'importer_manufacturer', 'service_center']).withMessage('Valid partner type is required'),
  body('businessAddress.street').notEmpty().withMessage('Street address is required'),
  body('businessAddress.city').notEmpty().withMessage('City is required'),
  body('businessAddress.state').notEmpty().withMessage('State is required'),
  body('businessAddress.zipCode').notEmpty().withMessage('Zip code is required')
];

const validatePartnerSignin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const validateRequestToJoin = [
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('ownerName').notEmpty().withMessage('Owner name is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('partnerType').isIn(['repair_center', 'auto_parts_shop', 'accessories_shop', 'importer_manufacturer', 'service_center']).withMessage('Valid partner type is required')
];

// Helper function to generate JWT token
const generateToken = (partnerId) => {
  return jwt.sign(
    { partnerId, type: 'partner' },
    process.env.JWT_SECRET || 'clutch_secret_key',
    { expiresIn: '7d' }
  );
};

// Helper function to send notifications
const sendNotification = async (partner, type, data) => {
  try {
    // This would integrate with your notification service
    logger.info(`Sending ${type} notification to partner ${partner.partnerId}`, data);
    
    // For now, just log the notification
    // In production, you would send actual push/email/SMS notifications
    return true;
  } catch (error) {
    logger.error('Error sending notification:', error);
    return false;
  }
};

// @route   POST /partners/auth/signin
// @desc    Partner sign in
// @access  Public
router.post('/auth/signin', validatePartnerSignin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find partner by email
    const partner = await PartnerUser.findByEmail(email);
    if (!partner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (partner.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      await partner.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if partner is active
    if (partner.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active. Please contact support.'
      });
    }

    // Reset login attempts and update last login
    await partner.resetLoginAttempts();
    partner.lastLogin = new Date();
    await partner.save();

    // Generate token
    const token = generateToken(partner.partnerId);

    // Remove password from response
    const partnerData = partner.toObject();
    delete partnerData.password;

    res.json({
      success: true,
      message: 'Sign in successful',
      data: {
        partner: partnerData,
        token
      }
    });

  } catch (error) {
    logger.error('Partner signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/auth/signup
// @desc    Partner sign up
// @access  Public
router.post('/auth/signup', validatePartnerSignup, async (req, res) => {
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
      partnerId,
      email,
      phone,
      password,
      businessName,
      ownerName,
      partnerType,
      businessAddress,
      workingHours,
      businessSettings
    } = req.body;

    // Check if partner already exists
    const existingPartner = await PartnerUser.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone },
        { partnerId }
      ]
    });

    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: 'Partner already exists with this email, phone, or partner ID'
      });
    }

    // Create new partner
    const partnerData = {
      partnerId,
      email: email.toLowerCase(),
      phone,
      password,
      businessName,
      ownerName,
      partnerType,
      businessAddress,
      workingHours: workingHours || {},
      businessSettings: businessSettings || {},
      status: 'pending',
      isVerified: false
    };

    const partner = new PartnerUser(partnerData);
    await partner.save();

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    partner.verificationCode = verificationCode;
    partner.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await partner.save();

    // Send verification email/SMS
    await sendNotification(partner, 'verification', {
      code: verificationCode,
      type: 'email'
    });

    // Remove password from response
    const partnerResponse = partner.toObject();
    delete partnerResponse.password;
    delete partnerResponse.verificationCode;

    res.status(201).json({
      success: true,
      message: 'Partner registered successfully. Please verify your account.',
      data: {
        partner: partnerResponse
      }
    });

  } catch (error) {
    logger.error('Partner signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/auth/request-to-join
// @desc    Request to join as partner
// @access  Public
router.post('/auth/request-to-join', validateRequestToJoin, async (req, res) => {
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
      partnerType
    } = req.body;

    // Check if request already exists
    const existingRequest = await PartnerUser.findOne({
      'joinRequest.email': email.toLowerCase(),
      'joinRequest.status': 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A request with this email is already pending'
      });
    }

    // Create join request
    const joinRequest = {
      businessName,
      ownerName,
      phone,
      email: email.toLowerCase(),
      address,
      partnerType,
      status: 'pending',
      submittedAt: new Date()
    };

    // Create a temporary partner record for the request
    const partner = new PartnerUser({
      email: email.toLowerCase(),
      phone,
      businessName,
      ownerName,
      partnerType,
      status: 'pending',
      joinRequest
    });

    await partner.save();

    // Notify admin team
    await sendNotification(null, 'new_partner_request', {
      partnerId: partner._id,
      businessName,
      ownerName,
      email,
      phone,
      partnerType
    });

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully. Our team will review and contact you soon.',
      data: {
        requestId: partner._id
      }
    });

  } catch (error) {
    logger.error('Partner join request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/orders
// @desc    Get partner orders
// @access  Private
router.get('/orders', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { status, type, page = 1, limit = 20 } = req.query;
    const filters = { partnerId: partner.partnerId };
    
    if (status) filters.status = status;
    if (type) filters.orderType = type;

    const orders = await PartnerOrder.findByPartner(partner.partnerId, filters)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await PartnerOrder.countDocuments(filters);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
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
router.patch('/orders/:id/status', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { status, notes } = req.body;
    const order = await PartnerOrder.findOne({
      _id: req.params.id,
      partnerId: partner.partnerId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check permissions
    if (!partner.hasPermission('manage_orders')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    await order.updateStatus(status, notes);

    // Send notification to customer if status changed
    if (status !== order.status) {
      await sendNotification(partner, 'order_status_update', {
        orderId: order.orderId,
        status,
        customerId: order.customer.id
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
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
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const filters = { partnerId: partner.partnerId };
    
    if (status) filters['invoice.status'] = status;

    const orders = await PartnerOrder.find(filters)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await PartnerOrder.countDocuments(filters);

    res.json({
      success: true,
      data: {
        invoices: orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
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
router.patch('/invoices/:id/status', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { status, reason } = req.body;
    const order = await PartnerOrder.findOne({
      _id: req.params.id,
      partnerId: partner.partnerId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check permissions
    if (!partner.hasPermission('manage_invoices')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    await order.updateInvoiceStatus(status, reason);

    // Send notification if invoice is rejected
    if (status === 'rejected') {
      await sendNotification(partner, 'invoice_rejected', {
        orderId: order.orderId,
        reason,
        customerId: order.customer.id
      });
    }

    res.json({
      success: true,
      message: 'Invoice status updated successfully',
      data: { order }
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
// @desc    Get weekly payment information
// @access  Private
router.get('/payments/weekly', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Check permissions
    if (!partner.hasPermission('view_payments')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));

    // Get weekly orders
    const weeklyOrders = await PartnerOrder.findByDateRange(
      partner.partnerId,
      startOfWeek,
      endOfWeek
    );

    const weeklyIncome = weeklyOrders
      .filter(order => order.invoice.status === 'paid')
      .reduce((sum, order) => sum + order.financial.partnerEarnings, 0);

    // Get next payout date (assuming weekly payouts on Fridays)
    const nextPayoutDate = new Date();
    nextPayoutDate.setDate(nextPayoutDate.getDate() + (5 - nextPayoutDate.getDay()));

    res.json({
      success: true,
      data: {
        weeklyIncome,
        orderCount: weeklyOrders.length,
        nextPayoutDate,
        currency: partner.financial.currency
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
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Check permissions
    if (!partner.hasPermission('view_payments')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const payments = await PartnerPayment.findByPartner(partner.partnerId)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await PartnerPayment.countDocuments({ partnerId: partner.partnerId });

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
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
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Remove sensitive information
    const partnerData = partner.toObject();
    delete partnerData.password;
    delete partnerData.verificationCode;

    res.json({
      success: true,
      data: { partner: partnerData }
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
router.patch('/settings', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Check permissions
    if (!partner.hasPermission('manage_settings')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const allowedUpdates = [
      'businessName',
      'businessAddress',
      'workingHours',
      'businessSettings',
      'notificationPreferences',
      'appPreferences'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    Object.assign(partner, updates);
    await partner.save();

    // Remove sensitive information
    const partnerData = partner.toObject();
    delete partnerData.password;
    delete partnerData.verificationCode;

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { partner: partnerData }
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
// @desc    Get revenue analytics
// @access  Private
router.get('/dashboard/revenue', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Check permissions
    if (!partner.hasPermission('view_analytics')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const { period = '30d' } = req.query;
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

    const orders = await PartnerOrder.findByDateRange(
      partner.partnerId,
      startDate,
      endDate
    );

    const revenue = orders
      .filter(order => order.invoice.status === 'paid')
      .reduce((sum, order) => sum + order.financial.partnerEarnings, 0);

    const orderCount = orders.length;
    const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;

    res.json({
      success: true,
      data: {
        revenue,
        orderCount,
        averageOrderValue,
        period,
        currency: partner.financial.currency
      }
    });

  } catch (error) {
    logger.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/dashboard/inventory
// @desc    Get inventory analytics (for parts shops)
// @access  Private
router.get('/dashboard/inventory', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Check if partner is connected to parts system
    if (!partner.businessSettings.isConnectedToPartsSystem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory tracking not available. Please connect to parts system.'
      });
    }

    // Check permissions
    if (!partner.hasPermission('view_analytics')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // This would integrate with the parts system API
    // For now, return mock data
    res.json({
      success: true,
      data: {
        totalItems: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        totalValue: 0,
        message: 'Inventory tracking will be available after connecting to parts system'
      }
    });

  } catch (error) {
    logger.error('Get inventory analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/dashboard/orders
// @desc    Get order analytics
// @access  Private
router.get('/dashboard/orders', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Check permissions
    if (!partner.hasPermission('view_analytics')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const stats = await PartnerOrder.getOrderStats(partner.partnerId);
    const orderStats = stats[0] || {
      totalOrders: 0,
      pendingOrders: 0,
      paidOrders: 0,
      rejectedOrders: 0,
      totalRevenue: 0,
      totalEarnings: 0
    };

    res.json({
      success: true,
      data: orderStats
    });

  } catch (error) {
    logger.error('Get order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
