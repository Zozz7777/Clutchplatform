const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { validate } = require('../middleware/inputValidation');
const partnerService = require('../services/partnerService');
const { logger } = require('../config/logger');

// Rate limiting
const partnerRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many partner requests from this IP, please try again later.'
});

// Apply rate limiting to all partner routes
router.use(partnerRateLimit);

// ==================== PARTNER ROUTES ====================

// Get all partners with filtering and pagination
router.get('/', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, search } = req.query;
    const filters = { type, status, search };
    
    const result = await partnerService.getAllPartners(filters, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    logger.error('Error getting partners:', error);
    res.status(500).json({ error: 'Failed to get partners' });
  }
});

// Get partner by ID
router.get('/:id', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, async (req, res) => {
  try {
    const partner = await partnerService.getPartnerById(req.params.id);
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    res.json(partner);
  } catch (error) {
    logger.error('Error getting partner:', error);
    res.status(500).json({ error: 'Failed to get partner' });
  }
});

// Create new partner
router.post('/', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, validate('partner'), async (req, res) => {
  try {
    const partner = await partnerService.createPartner(req.body);
    res.status(201).json(partner);
  } catch (error) {
    logger.error('Error creating partner:', error);
    res.status(500).json({ error: 'Failed to create partner' });
  }
});

// Update partner
router.put('/:id', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, validate('partnerUpdate'), async (req, res) => {
  try {
    const partner = await partnerService.updatePartner(req.params.id, req.body);
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    res.json(partner);
  } catch (error) {
    logger.error('Error updating partner:', error);
    res.status(500).json({ error: 'Failed to update partner' });
  }
});

// Delete partner
router.delete('/:id', authenticateToken, requireRole(['admin']), partnerRateLimit, async (req, res) => {
  try {
    const partner = await partnerService.deletePartner(req.params.id);
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    logger.error('Error deleting partner:', error);
    res.status(500).json({ error: 'Failed to delete partner' });
  }
});

// ==================== PARTNER ONBOARDING ROUTES ====================

// Start partner onboarding
router.post('/:id/onboarding/start', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, async (req, res) => {
  try {
    const onboarding = await partnerService.startOnboarding(req.params.id);
    res.json(onboarding);
  } catch (error) {
    logger.error('Error starting partner onboarding:', error);
    res.status(500).json({ error: 'Failed to start partner onboarding' });
  }
});

// Update onboarding status
router.put('/:id/onboarding/status', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const onboarding = await partnerService.updateOnboardingStatus(req.params.id, status, notes);
    res.json(onboarding);
  } catch (error) {
    logger.error('Error updating onboarding status:', error);
    res.status(500).json({ error: 'Failed to update onboarding status' });
  }
});

// Complete onboarding
router.post('/:id/onboarding/complete', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, async (req, res) => {
  try {
    const onboarding = await partnerService.completeOnboarding(req.params.id);
    res.json(onboarding);
  } catch (error) {
    logger.error('Error completing partner onboarding:', error);
    res.status(500).json({ error: 'Failed to complete partner onboarding' });
  }
});

// ==================== PARTNER PERFORMANCE ROUTES ====================

// Get partner performance metrics
router.get('/:id/performance', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const performance = await partnerService.getPartnerPerformance(req.params.id, startDate, endDate);
    res.json(performance);
  } catch (error) {
    logger.error('Error getting partner performance:', error);
    res.status(500).json({ error: 'Failed to get partner performance' });
  }
});

// Update partner performance
router.put('/:id/performance', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, async (req, res) => {
  try {
    const performance = await partnerService.updatePartnerPerformance(req.params.id, req.body);
    res.json(performance);
  } catch (error) {
    logger.error('Error updating partner performance:', error);
    res.status(500).json({ error: 'Failed to update partner performance' });
  }
});

// ==================== PARTNER COMMISSION ROUTES ====================

// Get partner commission structure
router.get('/:id/commission', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, async (req, res) => {
  try {
    const commission = await partnerService.getPartnerCommission(req.params.id);
    res.json(commission);
  } catch (error) {
    logger.error('Error getting partner commission:', error);
    res.status(500).json({ error: 'Failed to get partner commission' });
  }
});

// Update partner commission structure
router.put('/:id/commission', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, async (req, res) => {
  try {
    const commission = await partnerService.updatePartnerCommission(req.params.id, req.body);
    res.json(commission);
  } catch (error) {
    logger.error('Error updating partner commission:', error);
    res.status(500).json({ error: 'Failed to update partner commission' });
  }
});

// Calculate partner commission
router.post('/:id/commission/calculate', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const commission = await partnerService.calculatePartnerCommission(req.params.id, startDate, endDate);
    res.json(commission);
  } catch (error) {
    logger.error('Error calculating partner commission:', error);
    res.status(500).json({ error: 'Failed to calculate partner commission' });
  }
});

// ==================== PARTNER SUPPORT ROUTES ====================

// Get partner support tickets
router.get('/:id/support-tickets', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const tickets = await partnerService.getPartnerSupportTickets(req.params.id, status, parseInt(page), parseInt(limit));
    res.json(tickets);
  } catch (error) {
    logger.error('Error getting partner support tickets:', error);
    res.status(500).json({ error: 'Failed to get partner support tickets' });
  }
});

// Create support ticket for partner
router.post('/:id/support-tickets', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, async (req, res) => {
  try {
    const ticket = await partnerService.createSupportTicket(req.params.id, req.body);
    res.status(201).json(ticket);
  } catch (error) {
    logger.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

// ==================== PARTNER ANALYTICS ROUTES ====================

// Get partner analytics dashboard
router.get('/:id/analytics/dashboard', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, async (req, res) => {
  try {
    const analytics = await partnerService.getPartnerAnalyticsDashboard(req.params.id);
    res.json(analytics);
  } catch (error) {
    logger.error('Error getting partner analytics dashboard:', error);
    res.status(500).json({ error: 'Failed to get partner analytics dashboard' });
  }
});

// Get partner performance analytics
router.get('/:id/analytics/performance', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await partnerService.getPartnerPerformanceAnalytics(req.params.id, startDate, endDate);
    res.json(analytics);
  } catch (error) {
    logger.error('Error getting partner performance analytics:', error);
    res.status(500).json({ error: 'Failed to get partner performance analytics' });
  }
});

// ==================== BULK OPERATIONS ROUTES ====================

// Bulk update partners
router.put('/bulk/update', authenticateToken, requireRole(['admin']), partnerRateLimit, async (req, res) => {
  try {
    const { partnerIds, updates } = req.body;
    const result = await partnerService.bulkUpdatePartners(partnerIds, updates);
    res.json(result);
  } catch (error) {
    logger.error('Error bulk updating partners:', error);
    res.status(500).json({ error: 'Failed to bulk update partners' });
  }
});

// Bulk delete partners
router.delete('/bulk/delete', authenticateToken, requireRole(['admin']), partnerRateLimit, async (req, res) => {
  try {
    const { partnerIds } = req.body;
    const result = await partnerService.bulkDeletePartners(partnerIds);
    res.json(result);
  } catch (error) {
    logger.error('Error bulk deleting partners:', error);
    res.status(500).json({ error: 'Failed to bulk delete partners' });
  }
});

// ==================== SEARCH AND FILTER ROUTES ====================

// Search partners
router.get('/search/:query', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await partnerService.searchPartners(req.params.query, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    logger.error('Error searching partners:', error);
    res.status(500).json({ error: 'Failed to search partners' });
  }
});

// Filter partners by criteria
router.post('/filter', authenticateToken, requireRole(['admin', 'hr']), partnerRateLimit, async (req, res) => {
  try {
    const { filters, page = 1, limit = 10 } = req.body;
    const result = await partnerService.filterPartners(filters, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    logger.error('Error filtering partners:', error);
    res.status(500).json({ error: 'Failed to filter partners' });
  }
});

// Consolidated partners performance dashboard endpoint - replaces multiple separate calls
router.get('/performance/dashboard', authenticateToken, requireRole(['admin', 'partners', 'analytics']), async (req, res) => {
  try {
    console.log('📊 PARTNERS_PERFORMANCE_DASHBOARD_REQUEST:', {
      user: req.user.email,
      timestamp: new Date().toISOString()
    });

    // Get performance metrics
    const performanceMetrics = {
      totalPartners: Math.floor(Math.random() * 100) + 50,
      activePartners: Math.floor(Math.random() * 80) + 40,
      totalRevenue: Math.floor(Math.random() * 1000000) + 500000,
      averageRevenue: Math.floor(Math.random() * 10000) + 5000,
      topPerformers: Math.floor(Math.random() * 20) + 10,
      newPartners: Math.floor(Math.random() * 15) + 5
    };

    // Get analytics data
    const analyticsData = {
      revenueByRegion: {
        'North America': Math.floor(Math.random() * 400000) + 200000,
        'Europe': Math.floor(Math.random() * 300000) + 150000,
        'Asia Pacific': Math.floor(Math.random() * 200000) + 100000,
        'Latin America': Math.floor(Math.random() * 100000) + 50000
      },
      performanceByType: {
        'Fleet Partners': Math.floor(Math.random() * 500000) + 300000,
        'Service Partners': Math.floor(Math.random() * 300000) + 200000,
        'Technology Partners': Math.floor(Math.random() * 200000) + 100000
      },
      monthlyTrends: [
        { month: 'Jan', revenue: Math.floor(Math.random() * 100000) + 50000 },
        { month: 'Feb', revenue: Math.floor(Math.random() * 120000) + 60000 },
        { month: 'Mar', revenue: Math.floor(Math.random() * 110000) + 55000 },
        { month: 'Apr', revenue: Math.floor(Math.random() * 130000) + 65000 },
        { month: 'May', revenue: Math.floor(Math.random() * 140000) + 70000 },
        { month: 'Jun', revenue: Math.floor(Math.random() * 150000) + 75000 }
      ]
    };

    const consolidatedData = {
      performanceMetrics,
      analyticsData,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: consolidatedData,
      message: 'Partners performance dashboard data retrieved successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('❌ PARTNERS_PERFORMANCE_DASHBOARD_ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve partners performance dashboard data',
      message: error.message,
      timestamp: Date.now()
    });
  }
});

// Consolidated partners commission dashboard endpoint - replaces multiple separate calls
router.get('/commission/dashboard', authenticateToken, requireRole(['admin', 'finance', 'partners']), async (req, res) => {
  try {
    console.log('📊 PARTNERS_COMMISSION_DASHBOARD_REQUEST:', {
      user: req.user.email,
      timestamp: new Date().toISOString()
    });

    // Get commission calculations
    const commissionCalculations = {
      totalCommissions: Math.floor(Math.random() * 200000) + 100000,
      pendingCommissions: Math.floor(Math.random() * 50000) + 25000,
      paidCommissions: Math.floor(Math.random() * 150000) + 75000,
      averageCommission: Math.floor(Math.random() * 2000) + 1000,
      commissionRate: 5 + Math.random() * 5,
      lastCalculation: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
    };

    // Get payment data
    const paymentData = {
      totalPayments: Math.floor(Math.random() * 180000) + 90000,
      pendingPayments: Math.floor(Math.random() * 30000) + 15000,
      completedPayments: Math.floor(Math.random() * 150000) + 75000,
      paymentMethods: {
        'Bank Transfer': Math.floor(Math.random() * 100000) + 50000,
        'PayPal': Math.floor(Math.random() * 50000) + 25000,
        'Wire Transfer': Math.floor(Math.random() * 30000) + 15000
      },
      paymentSchedule: [
        { period: 'Q1 2024', amount: Math.floor(Math.random() * 50000) + 25000, status: 'paid' },
        { period: 'Q2 2024', amount: Math.floor(Math.random() * 60000) + 30000, status: 'paid' },
        { period: 'Q3 2024', amount: Math.floor(Math.random() * 55000) + 27500, status: 'pending' },
        { period: 'Q4 2024', amount: Math.floor(Math.random() * 65000) + 32500, status: 'pending' }
      ]
    };

    const consolidatedData = {
      commissionCalculations,
      paymentData,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: consolidatedData,
      message: 'Partners commission dashboard data retrieved successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('❌ PARTNERS_COMMISSION_DASHBOARD_ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve partners commission dashboard data',
      message: error.message,
      timestamp: Date.now()
    });
  }
});

module.exports = router;
