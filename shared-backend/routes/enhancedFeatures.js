const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');
const { validate, sanitizeInput } = require('../middleware/inputValidation');
const { logger } = require('../config/logger');

// Import enhancement services
const realTimeCommunicationService = require('../services/realTimeCommunicationService');
const advancedPaymentService = require('../services/advancedPaymentService');
const aiRecommendationService = require('../services/aiRecommendationService');
const advancedAnalyticsService = require('../services/advancedAnalyticsService');

// ============================================================================
// REAL-TIME COMMUNICATION ROUTES
// ============================================================================

/**
 * @swagger
 * /api/enhanced/real-time/booking-update:
 *   post:
 *     summary: Send real-time booking update
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - status
 *             properties:
 *               bookingId:
 *                 type: string
 *               status:
 *                 type: string
 *               mechanicName:
 *                 type: string
 *               estimatedTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking update sent successfully
 */
router.post('/real-time/booking-update',
  authenticateToken,
  sanitizeInput,
  validate('bookingUpdate'),
  asyncHandler(async (req, res) => {
    const { bookingId, status, mechanicName, estimatedTime } = req.body;

    const result = await realTimeCommunicationService.sendBookingUpdate(bookingId, {
      status,
      mechanicName,
      estimatedTime
    });

    if (result) {
      res.json({
        success: true,
        message: 'Booking update sent successfully',
        bookingId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send booking update'
      });
    }
  })
);

/**
 * @swagger
 * /api/enhanced/real-time/notification:
 *   post:
 *     summary: Send real-time notification
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 default: info
 *     responses:
 *       200:
 *         description: Notification sent successfully
 */
router.post('/real-time/notification',
  authenticateToken,
  sanitizeInput,
  validate('notification'),
  asyncHandler(async (req, res) => {
    const { userId, message, type = 'info' } = req.body;

    const result = await realTimeCommunicationService.sendNotification(userId, {
      message,
      type
    });

    if (result) {
      res.json({
        success: true,
        message: 'Notification sent successfully',
        userId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send notification'
      });
    }
  })
);

/**
 * @swagger
 * /api/enhanced/real-time/statistics:
 *   get:
 *     summary: Get real-time communication statistics
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/real-time/statistics',
  authenticateToken,
  requireRole(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    const statistics = realTimeCommunicationService.getStatistics();

    res.json({
      success: true,
      data: statistics
    });
  })
);

// ============================================================================
// ADVANCED PAYMENT ROUTES
// ============================================================================

/**
 * @swagger
 * /api/enhanced/payments/process:
 *   post:
 *     summary: Process payment with multiple gateways
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentMethod
 *               - customerId
 *               - bookingId
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: USD
 *               paymentMethod:
 *                 type: string
 *                 enum: [stripe, paypal, applePay, googlePay]
 *               customerId:
 *                 type: string
 *               bookingId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment processed successfully
 */
router.post('/payments/process',
  authenticateToken,
  sanitizeInput,
  validate('payment'),
  asyncHandler(async (req, res) => {
    const paymentData = req.body;

    const result = await advancedPaymentService.processPayment(paymentData);

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: result
    });
  })
);

/**
 * @swagger
 * /api/enhanced/payments/subscription:
 *   post:
 *     summary: Create subscription
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - planId
 *               - paymentMethod
 *     responses:
 *       200:
 *         description: Subscription created successfully
 */
router.post('/payments/subscription',
  authenticateToken,
  sanitizeInput,
  validate('subscription'),
  asyncHandler(async (req, res) => {
    const subscriptionData = req.body;

    const result = await advancedPaymentService.createSubscription(subscriptionData);

    res.json({
      success: true,
      message: 'Subscription created successfully',
      data: result
    });
  })
);

/**
 * @swagger
 * /api/enhanced/payments/plan:
 *   post:
 *     summary: Create payment plan (installments)
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - totalAmount
 *               - installments
 *               - customerId
 *               - paymentMethod
 *     responses:
 *       200:
 *         description: Payment plan created successfully
 */
router.post('/payments/plan',
  authenticateToken,
  sanitizeInput,
  validate('paymentPlan'),
  asyncHandler(async (req, res) => {
    const planData = req.body;

    const result = await advancedPaymentService.createPaymentPlan(planData);

    res.json({
      success: true,
      message: 'Payment plan created successfully',
      data: result
    });
  })
);

/**
 * @swagger
 * /api/enhanced/payments/split:
 *   post:
 *     summary: Process split payment
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - totalAmount
 *               - splits
 *               - customerId
 *               - bookingId
 *     responses:
 *       200:
 *         description: Split payment processed successfully
 */
router.post('/payments/split',
  authenticateToken,
  sanitizeInput,
  validate('splitPayment'),
  asyncHandler(async (req, res) => {
    const splitData = req.body;

    const result = await advancedPaymentService.processSplitPayment(splitData);

    res.json({
      success: true,
      message: 'Split payment processed successfully',
      data: result
    });
  })
);

/**
 * @swagger
 * /api/enhanced/payments/invoice:
 *   post:
 *     summary: Generate invoice
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - bookingId
 *               - items
 *     responses:
 *       200:
 *         description: Invoice generated successfully
 */
router.post('/payments/invoice',
  authenticateToken,
  sanitizeInput,
  validate('invoice'),
  asyncHandler(async (req, res) => {
    const invoiceData = req.body;

    const result = await advancedPaymentService.generateInvoice(invoiceData);

    res.json({
      success: true,
      message: 'Invoice generated successfully',
      data: result
    });
  })
);

/**
 * @swagger
 * /api/enhanced/payments/refund:
 *   post:
 *     summary: Process refund
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionId
 *               - amount
 *     responses:
 *       200:
 *         description: Refund processed successfully
 */
router.post('/payments/refund',
  authenticateToken,
  sanitizeInput,
  validate('refund'),
  asyncHandler(async (req, res) => {
    const refundData = req.body;

    const result = await advancedPaymentService.processRefund(refundData);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: result
    });
  })
);

/**
 * @swagger
 * /api/enhanced/payments/statistics:
 *   get:
 *     summary: Get payment statistics
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Payment statistics retrieved successfully
 */
router.get('/payments/statistics',
  authenticateToken,
  requireRole(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    const statistics = await advancedPaymentService.getPaymentStatistics();

    res.json({
      success: true,
      data: statistics
    });
  })
);

// ============================================================================
// AI RECOMMENDATION ROUTES
// ============================================================================

/**
 * @swagger
 * /api/enhanced/recommendations/services:
 *   get:
 *     summary: Get personalized service recommendations
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vehicleType
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: object
 *       - in: query
 *         name: budget
 *         schema:
 *           type: number
 *       - in: query
 *         name: urgency
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully
 */
router.get('/recommendations/services',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const context = {
      vehicleType: req.query.vehicleType,
      location: req.query.location ? JSON.parse(req.query.location) : null,
      budget: req.query.budget ? parseFloat(req.query.budget) : null,
      urgency: req.query.urgency
    };

    const recommendations = await aiRecommendationService.getServiceRecommendations(userId, context);

    res.json({
      success: true,
      data: recommendations
    });
  })
);

/**
 * @swagger
 * /api/enhanced/recommendations/maintenance:
 *   post:
 *     summary: Generate predictive maintenance schedule
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleId
 *               - vehicleData
 *     responses:
 *       200:
 *         description: Maintenance schedule generated successfully
 */
router.post('/recommendations/maintenance',
  authenticateToken,
  sanitizeInput,
  validate('maintenanceSchedule'),
  asyncHandler(async (req, res) => {
    const { vehicleId, vehicleData } = req.body;

    const schedule = await aiRecommendationService.generateMaintenanceSchedule(vehicleId, vehicleData);

    res.json({
      success: true,
      data: schedule
    });
  })
);

/**
 * @swagger
 * /api/enhanced/recommendations/pricing:
 *   post:
 *     summary: Calculate dynamic pricing
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - basePrice
 *     responses:
 *       200:
 *         description: Dynamic pricing calculated successfully
 */
router.post('/recommendations/pricing',
  authenticateToken,
  sanitizeInput,
  validate('dynamicPricing'),
  asyncHandler(async (req, res) => {
    const { serviceId, basePrice } = req.body;

    const pricing = await aiRecommendationService.calculateDynamicPricing(serviceId, null, null, basePrice);

    res.json({
      success: true,
      data: pricing
    });
  })
);

// ============================================================================
// ADVANCED ANALYTICS ROUTES
// ============================================================================

/**
 * @swagger
 * /api/enhanced/analytics/realtime:
 *   get:
 *     summary: Get real-time business metrics
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Real-time metrics retrieved successfully
 */
router.get('/analytics/realtime',
  authenticateToken,
  requireRole(['admin', 'manager', 'analyst']),
  asyncHandler(async (req, res) => {
    const metrics = await advancedAnalyticsService.getRealTimeMetrics();

    res.json({
      success: true,
      data: metrics
    });
  })
);

/**
 * @swagger
 * /api/enhanced/analytics/predictive:
 *   get:
 *     summary: Generate predictive analytics
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Predictive analytics generated successfully
 */
router.get('/analytics/predictive',
  authenticateToken,
  requireRole(['admin', 'manager', 'analyst']),
  asyncHandler(async (req, res) => {
    const predictions = await advancedAnalyticsService.generatePredictiveAnalytics();

    res.json({
      success: true,
      data: predictions
    });
  })
);

/**
 * @swagger
 * /api/enhanced/analytics/business-intelligence:
 *   get:
 *     summary: Generate business intelligence report
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Business intelligence report generated successfully
 */
router.get('/analytics/business-intelligence',
  authenticateToken,
  requireRole(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    const report = await advancedAnalyticsService.generateBusinessIntelligenceReport();

    res.json({
      success: true,
      data: report
    });
  })
);

/**
 * @swagger
 * /api/enhanced/analytics/kpi:
 *   get:
 *     summary: Generate KPI report
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: KPI report generated successfully
 */
router.get('/analytics/kpi',
  authenticateToken,
  requireRole(['admin', 'manager', 'analyst']),
  asyncHandler(async (req, res) => {
    const kpiReport = await advancedAnalyticsService.generateKPIReport();

    res.json({
      success: true,
      data: kpiReport
    });
  })
);

/**
 * @swagger
 * /api/enhanced/analytics/insights:
 *   get:
 *     summary: Generate business insights
 *     tags: [Enhanced Features]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Business insights generated successfully
 */
router.get('/analytics/insights',
  authenticateToken,
  requireRole(['admin', 'manager', 'analyst']),
  asyncHandler(async (req, res) => {
    const insights = await advancedAnalyticsService.generateInsights();

    res.json({
      success: true,
      data: insights
    });
  })
);

module.exports = router;
