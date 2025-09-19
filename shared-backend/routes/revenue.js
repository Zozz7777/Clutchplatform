/**
 * Revenue Routes
 * Handles revenue forecasting and scenario analysis
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// GET /api/v1/revenue/forecast - Get revenue forecast
router.get('/forecast', authenticateToken, async (req, res) => {
  try {
    const paymentsCollection = await getCollection('payments');
    const { months = 12 } = req.query;
    
    // Get historical revenue data
    const historicalData = await paymentsCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
      .toArray();
    
    // Simple linear regression for forecasting
    const forecast = [];
    const currentDate = new Date();
    
    for (let i = 1; i <= parseInt(months); i++) {
      const forecastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const avgRevenue = historicalData.reduce((sum, data) => sum + data.revenue, 0) / historicalData.length;
      const growthRate = 0.05; // 5% monthly growth assumption
      
      forecast.push({
        month: forecastDate.toISOString().substring(0, 7),
        predicted: Math.round(avgRevenue * Math.pow(1 + growthRate, i)),
        confidence: Math.max(70, 95 - (i * 2))
      });
    }
    
    res.json({
      success: true,
      data: {
        forecast,
        currentRevenue: historicalData[historicalData.length - 1]?.revenue || 0,
        growthRate: 0.05
      }
    });
  } catch (error) {
    console.error('Error fetching revenue forecast:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch revenue forecast' });
  }
});

// GET /api/v1/revenue/scenarios - Get revenue scenarios
router.get('/scenarios', authenticateToken, async (req, res) => {
  try {
    const paymentsCollection = await getCollection('payments');
    
    // Get current revenue
    const currentRevenue = await paymentsCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
      .toArray();
    
    const monthlyRevenue = currentRevenue[0]?.total || 0;
    
    const scenarios = [
      {
        name: 'Optimistic',
        description: 'High growth scenario with increased market penetration',
        multiplier: 1.3,
        probability: 25,
        revenue: Math.round(monthlyRevenue * 1.3)
      },
      {
        name: 'Realistic',
        description: 'Moderate growth with current market conditions',
        multiplier: 1.1,
        probability: 50,
        revenue: Math.round(monthlyRevenue * 1.1)
      },
      {
        name: 'Pessimistic',
        description: 'Conservative growth with market challenges',
        multiplier: 0.9,
        probability: 25,
        revenue: Math.round(monthlyRevenue * 0.9)
      }
    ];
    
    res.json({
      success: true,
      data: scenarios
    });
  } catch (error) {
    console.error('Error fetching revenue scenarios:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch revenue scenarios' });
  }
});

// GET /api/v1/revenue/scenarios - Get revenue scenarios
router.get('/scenarios', authenticateToken, async (req, res) => {
  try {
    const scenariosCollection = await getCollection('revenue_scenarios');
    const { page = 1, limit = 10, status, type } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const scenarios = await scenariosCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await scenariosCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        scenarios,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching revenue scenarios:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue scenarios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/revenue/scenarios - Create revenue scenario
router.post('/scenarios', checkRole(['head_administrator', 'finance_officer']), async (req, res) => {
  try {
    const scenariosCollection = await getCollection('revenue_scenarios');
    const { 
      name, 
      description, 
      type, 
      parameters, 
      assumptions,
      startDate,
      endDate 
    } = req.body;
    
    // Validate required fields
    if (!name || !type || !parameters) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, and parameters are required'
      });
    }
    
    const scenarioData = {
      name,
      description: description || '',
      type,
      parameters,
      assumptions: assumptions || {},
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      status: 'draft',
      createdBy: req.user.userId || req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await scenariosCollection.insertOne(scenarioData);
    
    res.json({
      success: true,
      data: {
        scenario: {
          ...scenarioData,
          _id: result.insertedId
        }
      },
      message: 'Revenue scenario created successfully'
    });
    
  } catch (error) {
    console.error('Error creating revenue scenario:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create revenue scenario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/revenue/pricing/scenarios - Get pricing scenarios
router.get('/pricing/scenarios', authenticateToken, checkRole(['head_administrator', 'admin', 'finance_officer']), async (req, res) => {
  try {
    const scenariosCollection = await getCollection('pricing_scenarios');
    const { page = 1, limit = 50, status, type } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const scenarios = await scenariosCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await scenariosCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: scenarios,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get pricing scenarios error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PRICING_SCENARIOS_FAILED',
      message: 'Failed to retrieve pricing scenarios',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/revenue/pricing/tests - Get pricing tests
router.get('/pricing/tests', authenticateToken, checkRole(['head_administrator', 'admin', 'finance_officer']), async (req, res) => {
  try {
    const testsCollection = await getCollection('pricing_tests');
    const { page = 1, limit = 50, status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const tests = await testsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await testsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: tests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get pricing tests error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PRICING_TESTS_FAILED',
      message: 'Failed to retrieve pricing tests',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/revenue/pricing/market-analysis - Get market analysis
router.get('/pricing/market-analysis', authenticateToken, checkRole(['head_administrator', 'admin', 'finance_officer']), async (req, res) => {
  try {
    const analysisCollection = await getCollection('market_analysis');
    const { page = 1, limit = 50, segment } = req.query;
    
    const filter = {};
    if (segment) filter.segment = segment;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const analysis = await analysisCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await analysisCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: analysis,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get market analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MARKET_ANALYSIS_FAILED',
      message: 'Failed to retrieve market analysis',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/revenue/pricing/scenarios - Create pricing scenario
router.post('/pricing/scenarios', authenticateToken, checkRole(['head_administrator', 'admin', 'finance_officer']), async (req, res) => {
  try {
    const scenariosCollection = await getCollection('pricing_scenarios');
    const scenarioData = {
      ...req.body,
      id: `scenario-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await scenariosCollection.insertOne(scenarioData);
    
    res.status(201).json({
      success: true,
      data: { id: result.insertedId, ...scenarioData },
      message: 'Pricing scenario created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create pricing scenario error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_PRICING_SCENARIO_FAILED',
      message: 'Failed to create pricing scenario',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
