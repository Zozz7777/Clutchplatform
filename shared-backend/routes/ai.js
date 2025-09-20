const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// Get anomaly detections
router.get('/anomaly-detections', authenticateToken, checkRole(['head_administrator', 'security_manager', 'developer']), async (req, res) => {
  try {
    const anomaliesCollection = await getCollection('anomaly_detections');
    if (!anomaliesCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const { page = 1, limit = 10, severity, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (type) filter.type = type;

    const anomalies = await anomaliesCollection.find(filter).sort({ detectedAt: -1 }).skip(skip).limit(parseInt(limit)).toArray();
    const total = await anomaliesCollection.countDocuments(filter);

    res.json({
      success: true,
      data: anomalies,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      message: 'Anomaly detections retrieved successfully'
    });
  } catch (error) {
    console.error('Get anomaly detections error:', error);
    res.status(500).json({ success: false, error: 'GET_ANOMALY_DETECTIONS_FAILED', message: 'Failed to get anomaly detections' });
  }
});

// ===== FRAUD CASES =====

// GET /api/v1/ai/fraud-cases - Get fraud cases
router.get('/fraud-cases', authenticateToken, checkRole(['head_administrator', 'security_manager', 'fraud_analyst']), async (req, res) => {
  try {
    const fraudCasesCollection = await getCollection('fraud_cases');
    if (!fraudCasesCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const { page = 1, limit = 10, status, severity, type, dateFrom, dateTo } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (type) filter.type = type;
    if (dateFrom || dateTo) {
      filter.detectedAt = {};
      if (dateFrom) filter.detectedAt.$gte = new Date(dateFrom);
      if (dateTo) filter.detectedAt.$lte = new Date(dateTo);
    }

    const fraudCases = await fraudCasesCollection
      .find(filter)
      .sort({ detectedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await fraudCasesCollection.countDocuments(filter);

    res.json({
      success: true,
      data: fraudCases,
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total, 
        pages: Math.ceil(total / parseInt(limit)) 
      },
      message: 'Fraud cases retrieved successfully'
    });
  } catch (error) {
    console.error('Get fraud cases error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'GET_FRAUD_CASES_FAILED', 
      message: 'Failed to get fraud cases' 
    });
  }
});

// POST /api/v1/ai/fraud-cases - Create fraud case
router.post('/fraud-cases', authenticateToken, checkRole(['head_administrator', 'security_manager']), async (req, res) => {
  try {
    const fraudCasesCollection = await getCollection('fraud_cases');
    const { 
      transactionId, 
      userId, 
      amount, 
      type, 
      description, 
      severity, 
      evidence, 
      status = 'detected' 
    } = req.body;

    if (!transactionId || !userId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID, User ID, and type are required'
      });
    }

    const fraudCase = {
      transactionId,
      userId,
      amount: amount || 0,
      type,
      description: description || '',
      severity: severity || 'medium',
      evidence: evidence || [],
      status,
      detectedAt: new Date(),
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await fraudCasesCollection.insertOne(fraudCase);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...fraudCase
      },
      message: 'Fraud case created successfully'
    });
  } catch (error) {
    console.error('Create fraud case error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'CREATE_FRAUD_CASE_FAILED', 
      message: 'Failed to create fraud case' 
    });
  }
});

// ===== AI MODELS =====

// GET /api/v1/ai/models - Get AI models
router.get('/models', authenticateToken, checkRole(['head_administrator', 'ai_engineer', 'data_scientist']), async (req, res) => {
  try {
    const modelsCollection = await getCollection('ai_models');
    if (!modelsCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const { page = 1, limit = 10, status, type, version } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (version) filter.version = version;

    const models = await modelsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await modelsCollection.countDocuments(filter);

    res.json({
      success: true,
      data: models,
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total, 
        pages: Math.ceil(total / parseInt(limit)) 
      },
      message: 'AI models retrieved successfully'
    });
  } catch (error) {
    console.error('Get AI models error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'GET_AI_MODELS_FAILED', 
      message: 'Failed to get AI models' 
    });
  }
});

// POST /api/v1/ai/models - Create AI model
router.post('/models', authenticateToken, checkRole(['head_administrator', 'ai_engineer']), async (req, res) => {
  try {
    const modelsCollection = await getCollection('ai_models');
    const { 
      name, 
      type, 
      version, 
      description, 
      algorithm, 
      parameters, 
      trainingData, 
      performance 
    } = req.body;

    if (!name || !type || !version) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, and version are required'
      });
    }

    const model = {
      name,
      type,
      version,
      description: description || '',
      algorithm: algorithm || '',
      parameters: parameters || {},
      trainingData: trainingData || {},
      performance: performance || {},
      status: 'training',
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await modelsCollection.insertOne(model);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...model
      },
      message: 'AI model created successfully'
    });
  } catch (error) {
    console.error('Create AI model error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'CREATE_AI_MODEL_FAILED', 
      message: 'Failed to create AI model' 
    });
  }
});

// ===== RECOMMENDATIONS =====

// GET /api/v1/ai/recommendations - Get AI recommendations
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const recommendationsCollection = await getCollection('ai_recommendations');
    if (!recommendationsCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const { page = 1, limit = 10, userId, type, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    
    if (userId) filter.userId = userId;
    if (type) filter.type = type;
    if (status) filter.status = status;

    const recommendations = await recommendationsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await recommendationsCollection.countDocuments(filter);

    res.json({
      success: true,
      data: recommendations,
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total, 
        pages: Math.ceil(total / parseInt(limit)) 
      },
      message: 'AI recommendations retrieved successfully'
    });
  } catch (error) {
    console.error('Get AI recommendations error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'GET_AI_RECOMMENDATIONS_FAILED', 
      message: 'Failed to get AI recommendations' 
    });
  }
});

// POST /api/v1/ai/recommendations - Create AI recommendation
router.post('/recommendations', authenticateToken, checkRole(['head_administrator', 'ai_engineer']), async (req, res) => {
  try {
    const recommendationsCollection = await getCollection('ai_recommendations');
    const { 
      userId, 
      type, 
      title, 
      description, 
      confidence, 
      data, 
      priority = 'medium' 
    } = req.body;

    if (!userId || !type || !title) {
      return res.status(400).json({
        success: false,
        message: 'User ID, type, and title are required'
      });
    }

    const recommendation = {
      userId,
      type,
      title,
      description: description || '',
      confidence: confidence || 0.5,
      data: data || {},
      priority,
      status: 'active',
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await recommendationsCollection.insertOne(recommendation);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...recommendation
      },
      message: 'AI recommendation created successfully'
    });
  } catch (error) {
    console.error('Create AI recommendation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'CREATE_AI_RECOMMENDATION_FAILED', 
      message: 'Failed to create AI recommendation' 
    });
  }
});

// ===== RECOMMENDATION UPLIFT =====

// GET /api/v1/ai/recommendation-uplift - Get recommendation uplift metrics
router.get('/recommendation-uplift', authenticateToken, checkRole(['head_administrator', 'ai_engineer', 'data_scientist']), async (req, res) => {
  try {
    const upliftCollection = await getCollection('recommendation_uplift');
    if (!upliftCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const { page = 1, limit = 10, modelId, dateFrom, dateTo } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    
    if (modelId) filter.modelId = modelId;
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const upliftMetrics = await upliftCollection
      .find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await upliftCollection.countDocuments(filter);

    // Calculate summary metrics
    const summary = await upliftCollection.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          avgUplift: { $avg: '$upliftPercentage' },
          totalRecommendations: { $sum: '$recommendationCount' },
          totalConversions: { $sum: '$conversionCount' }
        }
      }
    ]).toArray();

    res.json({
      success: true,
      data: {
        metrics: upliftMetrics,
        summary: summary[0] || { avgUplift: 0, totalRecommendations: 0, totalConversions: 0 },
        pagination: { 
          page: parseInt(page), 
          limit: parseInt(limit), 
          total, 
          pages: Math.ceil(total / parseInt(limit)) 
        }
      },
      message: 'Recommendation uplift metrics retrieved successfully'
    });
  } catch (error) {
    console.error('Get recommendation uplift error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'GET_RECOMMENDATION_UPLIFT_FAILED', 
      message: 'Failed to get recommendation uplift metrics' 
    });
  }
});

// POST /api/v1/ai/recommendation-uplift - Create recommendation uplift record
router.post('/recommendation-uplift', authenticateToken, checkRole(['head_administrator', 'ai_engineer']), async (req, res) => {
  try {
    const upliftCollection = await getCollection('recommendation_uplift');
    const { 
      modelId, 
      date, 
      recommendationCount, 
      conversionCount, 
      upliftPercentage, 
      baselineConversion, 
      recommendedConversion 
    } = req.body;

    if (!modelId || !date || recommendationCount === undefined || conversionCount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Model ID, date, recommendation count, and conversion count are required'
      });
    }

    const upliftRecord = {
      modelId,
      date: new Date(date),
      recommendationCount: parseInt(recommendationCount),
      conversionCount: parseInt(conversionCount),
      upliftPercentage: upliftPercentage || 0,
      baselineConversion: baselineConversion || 0,
      recommendedConversion: recommendedConversion || 0,
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await upliftCollection.insertOne(upliftRecord);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...upliftRecord
      },
      message: 'Recommendation uplift record created successfully'
    });
  } catch (error) {
    console.error('Create recommendation uplift error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'CREATE_RECOMMENDATION_UPLIFT_FAILED', 
      message: 'Failed to create recommendation uplift record' 
    });
  }
});

// ===== TRAINING ROI =====

// GET /api/v1/ai/training-roi - Get training ROI metrics
router.get('/training-roi', authenticateToken, checkRole(['head_administrator', 'ai_engineer', 'data_scientist']), async (req, res) => {
  try {
    const roiCollection = await getCollection('training_roi');
    if (!roiCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const { page = 1, limit = 10, modelId, dateFrom, dateTo } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    
    if (modelId) filter.modelId = modelId;
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const roiMetrics = await roiCollection
      .find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await roiCollection.countDocuments(filter);

    // Calculate summary metrics
    const summary = await roiCollection.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalInvestment: { $sum: '$investment' },
          totalReturn: { $sum: '$return' },
          avgROI: { $avg: '$roiPercentage' },
          totalTrainingHours: { $sum: '$trainingHours' }
        }
      }
    ]).toArray();

    res.json({
      success: true,
      data: {
        metrics: roiMetrics,
        summary: summary[0] || { totalInvestment: 0, totalReturn: 0, avgROI: 0, totalTrainingHours: 0 },
        pagination: { 
          page: parseInt(page), 
          limit: parseInt(limit), 
          total, 
          pages: Math.ceil(total / parseInt(limit)) 
        }
      },
      message: 'Training ROI metrics retrieved successfully'
    });
  } catch (error) {
    console.error('Get training ROI error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'GET_TRAINING_ROI_FAILED', 
      message: 'Failed to get training ROI metrics' 
    });
  }
});

// POST /api/v1/ai/training-roi - Create training ROI record
router.post('/training-roi', authenticateToken, checkRole(['head_administrator', 'ai_engineer']), async (req, res) => {
  try {
    const roiCollection = await getCollection('training_roi');
    const { 
      modelId, 
      date, 
      investment, 
      return: returnValue, 
      trainingHours, 
      description 
    } = req.body;

    if (!modelId || !date || investment === undefined || returnValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Model ID, date, investment, and return are required'
      });
    }

    const roiPercentage = investment > 0 ? ((returnValue - investment) / investment) * 100 : 0;

    const roiRecord = {
      modelId,
      date: new Date(date),
      investment: parseFloat(investment),
      return: parseFloat(returnValue),
      roiPercentage: Math.round(roiPercentage * 100) / 100,
      trainingHours: trainingHours || 0,
      description: description || '',
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await roiCollection.insertOne(roiRecord);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...roiRecord
      },
      message: 'Training ROI record created successfully'
    });
  } catch (error) {
    console.error('Create training ROI error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'CREATE_TRAINING_ROI_FAILED', 
      message: 'Failed to create training ROI record' 
    });
  }
});

module.exports = router;