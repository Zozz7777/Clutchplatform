const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const PartnerOrder = require('../models/PartnerOrder');
const PartnerPayment = require('../models/PartnerPayment');
const PartnerProduct = require('../models/PartnerProduct');
const PartnerDevice = require('../models/PartnerDevice');
const { authenticateToken: auth } = require('../middleware/auth');
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
  body('emailOrPhone').notEmpty().withMessage('Email or phone is required'),
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

// Helper function to generate partner ID
const generatePartnerId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `PART_${timestamp}_${random}`.toUpperCase();
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

    const { emailOrPhone, password } = req.body;

    // Find partner by email or phone
    let partner;
    if (emailOrPhone.includes('@')) {
      partner = await PartnerUser.findByEmail(emailOrPhone);
    } else {
      partner = await PartnerUser.findByPhone(emailOrPhone);
    }
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

// ============================================================================
// WINDOWS POS SYSTEM ENDPOINTS
// ============================================================================

// @route   POST /partners/validate-id
// @desc    Validate partner ID for Windows POS system
// @access  Public
router.post('/validate-id', [
  body('partnerId').notEmpty().withMessage('Partner ID is required')
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

    const { partnerId } = req.body;

    // Find partner by ID
    const partner = await PartnerUser.findOne({ partnerId });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner ID not found'
      });
    }

    // Check if partner is active
    if (partner.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Partner account is not active',
        status: partner.status
      });
    }

    res.json({
      success: true,
      data: {
        partnerId: partner.partnerId,
        businessName: partner.businessName,
        partnerType: partner.partnerType,
        status: partner.status,
        isVerified: partner.isVerified,
        businessAddress: partner.businessAddress,
        workingHours: partner.workingHours
      }
    });

  } catch (error) {
    logger.error('Validate partner ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/:partnerId/register-device
// @desc    Register device for partner sync
// @access  Private
router.post('/:partnerId/register-device', auth, [
  body('deviceId').notEmpty().withMessage('Device ID is required'),
  body('deviceName').notEmpty().withMessage('Device name is required'),
  body('deviceType').isIn(['windows_desktop', 'android_tablet', 'ios_tablet', 'pos_terminal', 'kiosk']).withMessage('Valid device type is required'),
  body('platform').isIn(['windows', 'android', 'ios', 'linux']).withMessage('Valid platform is required'),
  body('version').notEmpty().withMessage('Version is required')
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

    const { partnerId } = req.params;
    const { deviceId, deviceName, deviceType, platform, version } = req.body;

    // Verify partner exists and user has access
    const partner = await PartnerUser.findOne({ partnerId });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Check if device already registered
    const existingDevice = await PartnerDevice.findOne({ 
      partnerId, 
      deviceId 
    });

    if (existingDevice) {
      // Update existing device
      existingDevice.deviceName = deviceName;
      existingDevice.deviceType = deviceType;
      existingDevice.platform = platform;
      existingDevice.version = version;
      existingDevice.lastSeen = new Date();
      existingDevice.isActive = true;
      await existingDevice.save();

      res.json({
        success: true,
        message: 'Device updated successfully',
        data: {
          deviceToken: existingDevice.deviceToken,
          deviceId: existingDevice.deviceId
        }
      });
    } else {
      // Register new device
      const deviceToken = jwt.sign(
        { partnerId, deviceId, type: 'device' },
        process.env.JWT_SECRET || 'clutch_secret_key',
        { expiresIn: '365d' }
      );

      const device = new PartnerDevice({
        partnerId,
        deviceId,
        deviceName,
        deviceType,
        platform,
        version,
        deviceToken,
        isActive: true,
        registeredAt: new Date(),
        lastSeen: new Date()
      });

      await device.save();

      res.json({
        success: true,
        message: 'Device registered successfully',
        data: {
          deviceToken,
          deviceId: device.deviceId
        }
      });
    }

  } catch (error) {
    logger.error('Register device error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/:id/orders
// @desc    Get partner orders for Windows POS
// @access  Private
router.get('/:id/orders', auth, async (req, res) => {
  try {
    const { id: partnerId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { partnerId };
    if (status) {
      query.status = status;
    }

    // Get orders with pagination
    const orders = await PartnerOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('customerId', 'name phone email')
      .lean();

    const total = await PartnerOrder.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
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

// @route   POST /orders/:orderId/acknowledge
// @desc    Acknowledge/accept order
// @access  Private
router.post('/orders/:orderId/acknowledge', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { estimatedTime, notes } = req.body;

    const order = await PartnerOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be acknowledged in current status'
      });
    }

    // Update order status
    order.status = 'acknowledged';
    order.acknowledgedAt = new Date();
    order.estimatedTime = estimatedTime;
    order.notes = notes || order.notes;

    await order.save();

    // Send notification to customer
    await sendNotification(order, 'order_acknowledged', {
      orderId: order.orderId,
      estimatedTime,
      partnerName: order.partnerName
    });

    res.json({
      success: true,
      message: 'Order acknowledged successfully',
      data: order
    });

  } catch (error) {
    logger.error('Acknowledge order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /orders/:orderId/status
// @desc    Update order status
// @access  Private
router.post('/orders/:orderId/status', auth, [
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

    const { orderId } = req.params;
    const { status, notes } = req.body;

    const order = await PartnerOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.status = status;
    order.notes = notes || order.notes;
    
    // Set timestamps based on status
    switch (status) {
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
    await sendNotification(order, 'order_status_update', {
      orderId: order.orderId,
      status,
      partnerName: order.partnerName
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (error) {
    logger.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /payments
// @desc    Record payment for order
// @access  Private
router.post('/payments', auth, [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('amount').isNumeric().withMessage('Amount is required'),
  body('paymentMethod').isIn(['cash', 'card', 'bank_transfer', 'digital_wallet']).withMessage('Valid payment method is required'),
  body('paymentStatus').isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Valid payment status is required')
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

    const { orderId, amount, paymentMethod, paymentStatus, transactionId, notes } = req.body;

    // Find order
    const order = await PartnerOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create payment record
    const payment = new PartnerPayment({
      orderId: order._id,
      partnerId: order.partnerId,
      customerId: order.customerId,
      amount: parseFloat(amount),
      paymentMethod,
      paymentStatus,
      transactionId,
      notes,
      processedAt: new Date()
    });

    await payment.save();

    // Update order payment status
    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'paid') {
      order.status = 'paid';
      order.paidAt = new Date();
    } else if (paymentStatus === 'failed') {
      order.status = 'payment_failed';
    }

    await order.save();

    // Send notification
    await sendNotification(order, 'payment_update', {
      orderId: order.orderId,
      paymentStatus,
      amount,
      paymentMethod
    });

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment
    });

  } catch (error) {
    logger.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/:id/catalog
// @desc    Get partner catalog/products
// @access  Private
router.get('/:id/catalog', auth, async (req, res) => {
  try {
    const { id: partnerId } = req.params;
    const { category, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { partnerId, isActive: true };
    if (category) {
      query.category = category;
    }

    // Get products with pagination
    const products = await PartnerProduct.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await PartnerProduct.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get partner catalog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/:id/catalog
// @desc    Publish/update product in catalog
// @access  Private
router.post('/:id/catalog', auth, [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isNumeric().withMessage('Price is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('sku').notEmpty().withMessage('SKU is required')
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

    const { id: partnerId } = req.params;
    const productData = {
      ...req.body,
      partnerId,
      isActive: true,
      publishedAt: new Date()
    };

    // Check if product with SKU already exists
    const existingProduct = await PartnerProduct.findOne({ 
      partnerId, 
      sku: productData.sku 
    });

    if (existingProduct) {
      // Update existing product
      Object.assign(existingProduct, productData);
      await existingProduct.save();
      
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: existingProduct
      });
    } else {
      // Create new product
      const product = new PartnerProduct(productData);
      await product.save();
      
      res.json({
        success: true,
        message: 'Product published successfully',
        data: product
      });
    }

  } catch (error) {
    logger.error('Publish product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/:id/inventory/import
// @desc    Bulk import inventory
// @access  Private
router.post('/:id/inventory/import', auth, [
  body('products').isArray().withMessage('Products array is required')
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

    const { id: partnerId } = req.params;
    const { products } = req.body;

    const results = {
      imported: 0,
      updated: 0,
      errors: []
    };

    for (const productData of products) {
      try {
        const existingProduct = await PartnerProduct.findOne({ 
          partnerId, 
          sku: productData.sku 
        });

        if (existingProduct) {
          Object.assign(existingProduct, {
            ...productData,
            partnerId,
            updatedAt: new Date()
          });
          await existingProduct.save();
          results.updated++;
        } else {
          const product = new PartnerProduct({
            ...productData,
            partnerId,
            isActive: true,
            publishedAt: new Date()
          });
          await product.save();
          results.imported++;
        }
      } catch (error) {
        results.errors.push({
          sku: productData.sku,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Inventory import completed',
      data: results
    });

  } catch (error) {
    logger.error('Import inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/:id/sync
// @desc    Get sync data for partner
// @access  Private
router.get('/:id/sync', auth, async (req, res) => {
  try {
    const { id: partnerId } = req.params;
    const { lastSync } = req.query;

    const lastSyncDate = lastSync ? new Date(lastSync) : new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get updated data since last sync
    const orders = await PartnerOrder.find({
      partnerId,
      updatedAt: { $gte: lastSyncDate }
    }).lean();

    const products = await PartnerProduct.find({
      partnerId,
      updatedAt: { $gte: lastSyncDate }
    }).lean();

    const payments = await PartnerPayment.find({
      partnerId,
      updatedAt: { $gte: lastSyncDate }
    }).lean();

    res.json({
      success: true,
      data: {
        orders,
        products,
        payments,
        syncTimestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Get sync data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/:id/sync
// @desc    Push local changes to server
// @access  Private
router.post('/:id/sync', auth, [
  body('changes').isArray().withMessage('Changes array is required')
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

    const { id: partnerId } = req.params;
    const { changes } = req.body;

    const results = {
      processed: 0,
      conflicts: 0,
      errors: []
    };

    for (const change of changes) {
      try {
        const { type, data, localTimestamp } = change;

        switch (type) {
          case 'order_update':
            const order = await PartnerOrder.findById(data._id);
            if (order && new Date(order.updatedAt) > new Date(localTimestamp)) {
              results.conflicts++;
              results.errors.push({
                type: 'conflict',
                id: data._id,
                message: 'Server version is newer'
              });
            } else {
              await PartnerOrder.findByIdAndUpdate(data._id, data);
              results.processed++;
            }
            break;

          case 'product_update':
            const product = await PartnerProduct.findById(data._id);
            if (product && new Date(product.updatedAt) > new Date(localTimestamp)) {
              results.conflicts++;
              results.errors.push({
                type: 'conflict',
                id: data._id,
                message: 'Server version is newer'
              });
            } else {
              await PartnerProduct.findByIdAndUpdate(data._id, data);
              results.processed++;
            }
            break;

          default:
            results.errors.push({
              type: 'unknown',
              message: `Unknown change type: ${type}`
            });
        }
      } catch (error) {
        results.errors.push({
          type: 'error',
          message: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Sync completed',
      data: results
    });

  } catch (error) {
    logger.error('Sync changes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/:id/reports/daily
// @desc    Get daily Z-report
// @access  Private
router.get('/:id/reports/daily', auth, async (req, res) => {
  try {
    const { id: partnerId } = req.params;
    const { date } = req.query;

    const reportDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(reportDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reportDate.setHours(23, 59, 59, 999));

    // Get daily orders
    const orders = await PartnerOrder.find({
      partnerId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).lean();

    // Get daily payments
    const payments = await PartnerPayment.find({
      partnerId,
      processedAt: { $gte: startOfDay, $lte: endOfDay }
    }).lean();

    // Calculate totals
    const totalOrders = orders.length;
    const totalRevenue = payments
      .filter(p => p.paymentStatus === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const paymentMethods = payments.reduce((acc, payment) => {
      if (payment.paymentStatus === 'paid') {
        acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + payment.amount;
      }
      return acc;
    }, {});

    const zReport = {
      date: reportDate.toISOString().split('T')[0],
      totalOrders,
      totalRevenue,
      paymentMethods,
      orders: orders.map(order => ({
        orderId: order.orderId,
        customerName: order.customerName,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      })),
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: zReport
    });

  } catch (error) {
    logger.error('Get daily report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
