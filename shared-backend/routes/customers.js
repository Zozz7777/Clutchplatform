const express = require('express');
const databaseUtils = require('../utils/databaseUtils');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../config/logger');

// Create new customer
router.post('/', asyncHandler(async (req, res) => {
    try {
        const { name, email, phone, address, shopId, customerType, notes } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Name and email are required',
                timestamp: new Date().toISOString()
            });
        }
        
        const newCustomer = {
            id: `customer-${Date.now()}`,
            name,
            email,
            phone: phone || '',
            address: address || '',
            shopId: shopId || 'default-shop',
            customerType: customerType || 'individual',
            notes: notes || '',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        res.status(201).json({
            success: true,
            data: newCustomer,
            message: 'Customer created successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error creating customer:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_CUSTOMER_FAILED',
            message: 'Failed to create customer',
            timestamp: new Date().toISOString()
        });
    }
}));

// Simple GET endpoint for customers list (for connection testing)
router.get('/', asyncHandler(async (req, res) => {
    const { shop_id } = req.query;
    
    // Use default shop_id if not provided
    const defaultShopId = shop_id || 'default-shop';

    // Mock customers data
    const customers = [
        {
            id: '1',
            name: 'أحمد محمد',
            name_en: 'Ahmed Mohamed',
            phone: '+966501234567',
            email: 'ahmed@example.com',
            total_orders: 15,
            last_visit: new Date().toISOString(),
            status: 'active'
        },
        {
            id: '2',
            name: 'فاطمة علي',
            name_en: 'Fatima Ali',
            phone: '+966507654321',
            email: 'fatima@example.com',
            total_orders: 8,
            last_visit: new Date().toISOString(),
            status: 'active'
        }
    ];

    res.json({
        success: true,
        data: customers,
        total: customers.length,
        shop_id: defaultShopId,
        timestamp: new Date().toISOString()
    });
}));

// Import models
const Client = require('../models/Client');
const Vehicle = require('../models/Vehicle');
const bookingService = require('../services/bookingService');

/**
 * @swagger
 * /api/customers/onboarding:
 *   post:
 *     summary: Complete customer onboarding process
 *     tags: [Customer Workflow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *               - address
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: object
 *               preferences:
 *                 type: object
 *     responses:
 *       201:
 *         description: Customer onboarding completed successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/onboarding', authenticateToken, [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('address').isObject().withMessage('Address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    // Check if customer profile already exists
    let customer = await databaseUtils.findOne('clients', { userId: req.user._id });
    
    if (customer) {
      // Update existing profile
      customer = await Client.findOneAndUpdate(
        { userId: req.user._id },
        { 
          ...req.body,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date()
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new customer profile
      customer = await databaseUtils.create('clients', {
        ...req.body,
        userId: req.user._id,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date()
      });
    }
    
    logger.info(`Customer onboarding completed: ${customer._id}`);
    
    // Emit WebSocket event for real-time updates
    if (global.io) {
      global.io.emit('customer:onboarding:completed', {
        customer: customer,
        message: 'Customer onboarding completed'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Customer onboarding completed successfully',
      data: { customer }
    });
  } catch (error) {
    logger.error('Error completing customer onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/customers/profile:
 *   get:
 *     summary: Get customer profile
 *     tags: [Customer Workflow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile retrieved successfully
 *       404:
 *         description: Customer profile not found
 *       500:
 *         description: Server error
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const customer = await databaseUtils.findOne('clients', { userId: req.user._id })
      .populate('vehicles')
      .populate('preferredMechanics', 'firstName lastName rating');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }
    
    res.json({
      success: true,
      data: { customer }
    });
  } catch (error) {
    logger.error('Error fetching customer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer profile',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/customers/profile:
 *   put:
 *     summary: Update customer profile
 *     tags: [Customer Workflow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: object
 *     responses:
 *       200:
 *         description: Customer profile updated successfully
 *       404:
 *         description: Customer profile not found
 *       500:
 *         description: Server error
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const customer = await Client.findOneAndUpdate(
      { userId: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }
    
    logger.info(`Customer profile updated: ${customer._id}`);
    
    // Emit WebSocket event for real-time updates
    if (global.io) {
      global.io.emit('customer:profile:updated', {
        customer: customer,
        message: 'Customer profile updated'
      });
    }
    
    res.json({
      success: true,
      message: 'Customer profile updated successfully',
      data: { customer }
    });
  } catch (error) {
    logger.error('Error updating customer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer profile',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/customers/vehicles:
 *   post:
 *     summary: Add vehicle to customer profile
 *     tags: [Customer Workflow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - make
 *               - model
 *               - year
 *             properties:
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: number
 *               vin:
 *                 type: string
 *               licensePlate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vehicle added successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/vehicles', authenticateToken, [
  body('make').notEmpty().withMessage('Vehicle make is required'),
  body('model').notEmpty().withMessage('Vehicle model is required'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    // Create vehicle
    const vehicle = await databaseUtils.create('vehicles', {
      ...req.body,
      ownerId: req.user._id
    });
    
    // Add vehicle to customer profile
    await Client.findOneAndUpdate(
      { userId: req.user._id },
      { $push: { vehicles: vehicle._id } }
    );
    
    logger.info(`Vehicle added to customer profile: ${vehicle._id}`);
    
    // Emit WebSocket event for real-time updates
    if (global.io) {
      global.io.emit('customer:vehicle:added', {
        vehicle: vehicle,
        message: 'Vehicle added to profile'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      data: { vehicle }
    });
  } catch (error) {
    logger.error('Error adding vehicle to customer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add vehicle',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/customers/preferences:
 *   get:
 *     summary: Get customer preferences
 *     tags: [Customer Workflow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer preferences retrieved successfully
 *       404:
 *         description: Customer profile not found
 *       500:
 *         description: Server error
 */
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const customer = await databaseUtils.findOne('clients', { userId: req.user._id })
      .select('preferences notificationSettings');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        preferences: customer.preferences,
        notificationSettings: customer.notificationSettings
      }
    });
  } catch (error) {
    logger.error('Error fetching customer preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer preferences',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/customers/preferences:
 *   put:
 *     summary: Update customer preferences
 *     tags: [Customer Workflow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferences:
 *                 type: object
 *               notificationSettings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Customer preferences updated successfully
 *       404:
 *         description: Customer profile not found
 *       500:
 *         description: Server error
 */
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { preferences, notificationSettings } = req.body;
    
    const customer = await Client.findOneAndUpdate(
      { userId: req.user._id },
      { 
        preferences: preferences || {},
        notificationSettings: notificationSettings || {},
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }
    
    logger.info(`Customer preferences updated: ${customer._id}`);
    
    // Emit WebSocket event for real-time updates
    if (global.io) {
      global.io.emit('customer:preferences:updated', {
        customer: customer,
        message: 'Customer preferences updated'
      });
    }
    
    res.json({
      success: true,
      message: 'Customer preferences updated successfully',
      data: { customer }
    });
  } catch (error) {
    logger.error('Error updating customer preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer preferences',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/customers/dashboard:
 *   get:
 *     summary: Get customer dashboard data
 *     tags: [Customer Workflow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer dashboard data retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get customer profile
    const customer = await databaseUtils.findOne('clients', { userId: req.user._id });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }
    
    // Get active bookings
    const activeBookings = await bookingService.findBookings({
      customerId: customer._id,
      status: { $in: ['pending', 'assigned', 'in_progress'] }
    }).populate('mechanicId', 'firstName lastName rating');
    
    // Get vehicles
    const vehicles = await databaseUtils.find('vehicles', { ownerId: req.user._id });
    
    // Get recent activity
    const recentBookings = await bookingService.findBookings({
      customerId: customer._id
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('mechanicId', 'firstName lastName');
    
    // Get upcoming maintenance reminders
    const maintenanceDue = vehicles.filter(vehicle => vehicle.isDueForMaintenance);
    
    const dashboardData = {
      customer,
      activeBookings: activeBookings.length,
      totalVehicles: vehicles.length,
      maintenanceDue: maintenanceDue.length,
      recentBookings,
      vehicles: vehicles.slice(0, 3) // Show only first 3 vehicles
    };
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    logger.error('Error fetching customer dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer dashboard',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/customers/bookings:
 *   get:
 *     summary: Get customer booking history
 *     tags: [Customer Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of bookings per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by booking status
 *     responses:
 *       200:
 *         description: Customer bookings retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/bookings', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const customer = await databaseUtils.findOne('clients', { userId: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }
    
    // Build filter
    const filter = { customerId: customer._id };
    if (status) filter.status = status;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    const bookings = await bookingService.findBookings(filter)
      .populate('mechanicId', 'firstName lastName rating')
      .populate('vehicleId', 'make model year')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await bookingService.countBookings(filter);
    
    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching customer bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer bookings',
      error: error.message
    });
  }
});

module.exports = router;
