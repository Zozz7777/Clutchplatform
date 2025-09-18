/**
 * Marketing Routes
 * Complete marketing system with campaigns, lead tracking, and promotions
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');

// Apply rate limiting
const marketingRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 100 });

// ==================== CAMPAIGN MANAGEMENT ====================

// GET /api/v1/marketing/campaigns - Get all campaigns
router.get('/campaigns', authenticateToken, checkRole(['head_administrator', 'marketing_manager']), marketingRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, type, search } = req.query;
    const skip = (page - 1) * limit;
    
    const campaignsCollection = await getCollection('campaigns');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const campaigns = await campaignsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await campaignsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Campaigns retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CAMPAIGNS_FAILED',
      message: 'Failed to retrieve campaigns',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/marketing/campaigns/:id - Get campaign by ID
router.get('/campaigns/:id', authenticateToken, checkRole(['head_administrator', 'marketing_manager']), marketingRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const campaignsCollection = await getCollection('campaigns');
    
    const campaign = await campaignsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'CAMPAIGN_NOT_FOUND',
        message: 'Campaign not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { campaign },
      message: 'Campaign retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CAMPAIGN_FAILED',
      message: 'Failed to retrieve campaign',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/marketing/campaigns - Create new campaign
router.post('/campaigns', authenticateToken, checkRole(['head_administrator', 'marketing_manager']), marketingRateLimit, async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      startDate,
      endDate,
      budget,
      targetAudience,
      channels,
      goals,
      status
    } = req.body;
    
    if (!name || !type || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, type, start date, and end date are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const campaignsCollection = await getCollection('campaigns');
    
    const newCampaign = {
      name,
      description: description || null,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget: budget || null,
      targetAudience: targetAudience || null,
      channels: channels || [],
      goals: goals || [],
      status: status || 'draft',
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost: 0,
        revenue: 0
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await campaignsCollection.insertOne(newCampaign);
    
    res.status(201).json({
      success: true,
      data: { campaign: { ...newCampaign, _id: result.insertedId } },
      message: 'Campaign created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_CAMPAIGN_FAILED',
      message: 'Failed to create campaign',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/marketing/campaigns/:id - Update campaign
router.put('/campaigns/:id', authenticateToken, checkRole(['head_administrator', 'marketing_manager']), marketingRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const campaignsCollection = await getCollection('campaigns');
    
    const result = await campaignsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'CAMPAIGN_NOT_FOUND',
        message: 'Campaign not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const updatedCampaign = await campaignsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { campaign: updatedCampaign },
      message: 'Campaign updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_CAMPAIGN_FAILED',
      message: 'Failed to update campaign',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== LEAD TRACKING ====================

// GET /api/v1/marketing/leads - Get all leads
router.get('/leads', authenticateToken, checkRole(['head_administrator', 'marketing_manager', 'sales']), marketingRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, source, search } = req.query;
    const skip = (page - 1) * limit;
    
    const leadsCollection = await getCollection('marketing_leads');
    
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

// POST /api/v1/marketing/leads - Create new lead
router.post('/leads', marketingRateLimit, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      source,
      campaignId,
      notes,
      customFields
    } = req.body;
    
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'First name, last name, and email are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const leadsCollection = await getCollection('marketing_leads');
    
    // Check if lead already exists
    const existingLead = await leadsCollection.findOne({ email: email.toLowerCase() });
    if (existingLead) {
      return res.status(409).json({
        success: false,
        error: 'LEAD_EXISTS',
        message: 'Lead with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    const newLead = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || null,
      company: company || null,
      jobTitle: jobTitle || null,
      source: source || 'website',
      campaignId: campaignId || null,
      notes: notes || null,
      customFields: customFields || {},
      status: 'new',
      score: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await leadsCollection.insertOne(newLead);
    
    res.status(201).json({
      success: true,
      data: { lead: { ...newLead, _id: result.insertedId } },
      message: 'Lead created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_LEAD_FAILED',
      message: 'Failed to create lead',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/marketing/leads/:id - Update lead
router.put('/leads/:id', authenticateToken, checkRole(['head_administrator', 'marketing_manager', 'sales']), marketingRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const leadsCollection = await getCollection('marketing_leads');
    
    const result = await leadsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'LEAD_NOT_FOUND',
        message: 'Lead not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const updatedLead = await leadsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { lead: updatedLead },
      message: 'Lead updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_LEAD_FAILED',
      message: 'Failed to update lead',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== PROMOTIONS ====================

// GET /api/v1/marketing/promotions - Get all promotions
router.get('/promotions', authenticateToken, checkRole(['head_administrator', 'marketing_manager']), marketingRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, type, search } = req.query;
    const skip = (page - 1) * limit;
    
    const promotionsCollection = await getCollection('marketing_promotions');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const promotions = await promotionsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await promotionsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        promotions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Promotions retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PROMOTIONS_FAILED',
      message: 'Failed to retrieve promotions',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/marketing/promotions - Create new promotion
router.post('/promotions', authenticateToken, checkRole(['head_administrator', 'marketing_manager']), marketingRateLimit, async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      type,
      value,
      startDate,
      endDate,
      usageLimit,
      minOrderValue,
      applicableProducts,
      applicableCategories
    } = req.body;
    
    if (!name || !code || !type || !value || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, code, type, value, start date, and end date are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const promotionsCollection = await getCollection('marketing_promotions');
    
    // Check if promotion code already exists
    const existingPromotion = await promotionsCollection.findOne({ code: code.toUpperCase() });
    if (existingPromotion) {
      return res.status(409).json({
        success: false,
        error: 'PROMOTION_CODE_EXISTS',
        message: 'Promotion with this code already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    const newPromotion = {
      name,
      code: code.toUpperCase(),
      description: description || null,
      type, // percentage, fixed_amount, free_shipping, etc.
      value: parseFloat(value),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      usageLimit: usageLimit || null,
      minOrderValue: minOrderValue || null,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      status: 'active',
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await promotionsCollection.insertOne(newPromotion);
    
    res.status(201).json({
      success: true,
      data: { promotion: { ...newPromotion, _id: result.insertedId } },
      message: 'Promotion created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_PROMOTION_FAILED',
      message: 'Failed to create promotion',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/marketing/promotions/validate - Validate promotion code
router.post('/promotions/validate', marketingRateLimit, async (req, res) => {
  try {
    const { code, orderValue, products } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PROMOTION_CODE',
        message: 'Promotion code is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const promotionsCollection = await getCollection('marketing_promotions');
    
    const promotion = await promotionsCollection.findOne({ 
      code: code.toUpperCase(),
      status: 'active'
    });
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'PROMOTION_NOT_FOUND',
        message: 'Invalid promotion code',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if promotion is active
    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      return res.status(400).json({
        success: false,
        error: 'PROMOTION_EXPIRED',
        message: 'Promotion is not currently active',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check usage limit
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return res.status(400).json({
        success: false,
        error: 'PROMOTION_LIMIT_REACHED',
        message: 'Promotion usage limit reached',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check minimum order value
    if (promotion.minOrderValue && orderValue < promotion.minOrderValue) {
      return res.status(400).json({
        success: false,
        error: 'MINIMUM_ORDER_VALUE_NOT_MET',
        message: `Minimum order value of ${promotion.minOrderValue} required`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Calculate discount
    let discount = 0;
    if (promotion.type === 'percentage') {
      discount = (orderValue * promotion.value) / 100;
    } else if (promotion.type === 'fixed_amount') {
      discount = Math.min(promotion.value, orderValue);
    } else if (promotion.type === 'free_shipping') {
      discount = 0; // Free shipping logic would be handled elsewhere
    }
    
    res.json({
      success: true,
      data: {
        promotion: {
          id: promotion._id,
          name: promotion.name,
          code: promotion.code,
          type: promotion.type,
          value: promotion.value,
          discount: discount,
          description: promotion.description
        }
      },
      message: 'Promotion code is valid',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Validate promotion error:', error);
    res.status(500).json({
      success: false,
      error: 'VALIDATE_PROMOTION_FAILED',
      message: 'Failed to validate promotion code',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== MARKETING ANALYTICS ====================

// GET /api/v1/marketing/analytics - Get marketing analytics
router.get('/analytics', authenticateToken, checkRole(['head_administrator', 'marketing_manager']), marketingRateLimit, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const campaignsCollection = await getCollection('campaigns');
    const leadsCollection = await getCollection('marketing_leads');
    const promotionsCollection = await getCollection('marketing_promotions');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));
    
    // Campaign statistics
    const totalCampaigns = await campaignsCollection.countDocuments();
    const activeCampaigns = await campaignsCollection.countDocuments({ status: 'active' });
    const recentCampaigns = await campaignsCollection.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Lead statistics
    const totalLeads = await leadsCollection.countDocuments();
    const newLeads = await leadsCollection.countDocuments({ status: 'new' });
    const qualifiedLeads = await leadsCollection.countDocuments({ status: 'qualified' });
    const recentLeads = await leadsCollection.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Promotion statistics
    const totalPromotions = await promotionsCollection.countDocuments();
    const activePromotions = await promotionsCollection.countDocuments({ status: 'active' });
    
    // Campaign performance
    const campaignPerformance = await campaignsCollection.aggregate([
      { $group: { 
        _id: null, 
        totalImpressions: { $sum: '$metrics.impressions' },
        totalClicks: { $sum: '$metrics.clicks' },
        totalConversions: { $sum: '$metrics.conversions' },
        totalCost: { $sum: '$metrics.cost' },
        totalRevenue: { $sum: '$metrics.revenue' }
      }}
    ]).toArray();
    
    // Lead sources
    const leadSources = await leadsCollection.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Campaign types
    const campaignTypes = await campaignsCollection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    const analytics = {
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
        recent: recentCampaigns,
        performance: campaignPerformance[0] || {
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          totalCost: 0,
          totalRevenue: 0
        },
        types: campaignTypes
      },
      leads: {
        total: totalLeads,
        new: newLeads,
        qualified: qualifiedLeads,
        recent: recentLeads,
        sources: leadSources
      },
      promotions: {
        total: totalPromotions,
        active: activePromotions
      },
      period,
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'Marketing analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get marketing analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MARKETING_ANALYTICS_FAILED',
      message: 'Failed to retrieve marketing analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== GENERIC HANDLERS ====================

// GET /api/v1/marketing - Get marketing overview
router.get('/', authenticateToken, checkRole(['head_administrator', 'marketing_manager']), marketingRateLimit, async (req, res) => {
  res.json({
    success: true,
    message: 'Marketing API is running',
    endpoints: {
      campaigns: '/api/v1/marketing/campaigns',
      leads: '/api/v1/marketing/leads',
      promotions: '/api/v1/marketing/promotions',
      analytics: '/api/v1/marketing/analytics'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
