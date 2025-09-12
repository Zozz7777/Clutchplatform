const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { validate } = require('../middleware/inputValidation');
const { logger } = require('../config/logger');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Rate limiting
const legalRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many legal requests from this IP, please try again later.'
});

// Apply rate limiting to all legal routes
router.use(legalRateLimit);

// ==================== LEGAL ROUTES ====================

// Get all legal documents
router.get('/', authenticateToken, requireRole(['admin', 'legal', 'compliance']), legalRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, search } = req.query;
    const skip = (page - 1) * limit;
    
    const collection = await getCollection('legal_documents');
    
    // Build query
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const [documents, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      collection.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting legal documents:', error);
    res.status(500).json({ 
      success: false,
      error: 'FETCH_LEGAL_DOCUMENTS_FAILED',
      message: 'Failed to get legal documents' 
    });
  }
});

// Get legal document by ID
router.get('/:id', authenticateToken, requireRole(['admin', 'legal', 'compliance']), legalRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await getCollection('legal_documents');
    
    const document = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'DOCUMENT_NOT_FOUND',
        message: 'Legal document not found'
      });
    }
    
    res.json({
      success: true,
      data: document,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting legal document:', error);
    res.status(500).json({ 
      success: false,
      error: 'FETCH_LEGAL_DOCUMENT_FAILED',
      message: 'Failed to get legal document' 
    });
  }
});

// Create new legal document
router.post('/', authenticateToken, requireRole(['admin', 'legal']), legalRateLimit, validate('legal'), async (req, res) => {
  try {
    const { title, description, content, type, category, tags, status = 'draft' } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Title and content are required'
      });
    }
    
    const collection = await getCollection('legal_documents');
    
    const document = {
      title,
      description: description || '',
      content,
      type: type || 'general',
      category: category || 'uncategorized',
      tags: tags || [],
      status,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };
    
    const result = await collection.insertOne(document);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...document
      },
      message: 'Legal document created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating legal document:', error);
    res.status(500).json({ 
      success: false,
      error: 'CREATE_LEGAL_DOCUMENT_FAILED',
      message: 'Failed to create legal document' 
    });
  }
});

// Update legal document
router.put('/:id', authenticateToken, requireRole(['admin', 'legal']), legalRateLimit, validate('legalUpdate'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Update legal document - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error updating legal document:', error);
    res.status(500).json({ error: 'Failed to update legal document' });
  }
});

// Delete legal document
router.delete('/:id', authenticateToken, requireRole(['admin', 'legal']), legalRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Delete legal document - Implementation pending' });
  } catch (error) {
    logger.error('Error deleting legal document:', error);
    res.status(500).json({ error: 'Failed to delete legal document' });
  }
});

// ==================== CONTRACT ROUTES ====================

// Get all contracts
router.get('/contracts', authenticateToken, requireRole(['admin', 'legal', 'compliance']), legalRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Get contracts - Implementation pending', data: [] });
  } catch (error) {
    logger.error('Error getting contracts:', error);
    res.status(500).json({ error: 'Failed to get contracts' });
  }
});

// Create contract
router.post('/contracts', authenticateToken, requireRole(['admin', 'legal']), legalRateLimit, validate('contract'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Create contract - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error creating contract:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

// Sign contract
router.post('/contracts/:id/sign', authenticateToken, requireRole(['admin', 'legal']), legalRateLimit, validate('contractSignature'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Sign contract - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error signing contract:', error);
    res.status(500).json({ error: 'Failed to sign contract' });
  }
});

// ==================== POLICY ROUTES ====================

// Get all policies
router.get('/policies', authenticateToken, requireRole(['admin', 'legal', 'compliance']), legalRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Get policies - Implementation pending', data: [] });
  } catch (error) {
    logger.error('Error getting policies:', error);
    res.status(500).json({ error: 'Failed to get policies' });
  }
});

// Create policy
router.post('/policies', authenticateToken, requireRole(['admin', 'legal']), legalRateLimit, validate('policy'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Create policy - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error creating policy:', error);
    res.status(500).json({ error: 'Failed to create policy' });
  }
});

// Publish policy
router.post('/policies/:id/publish', authenticateToken, requireRole(['admin', 'legal']), legalRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Publish policy - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error publishing policy:', error);
    res.status(500).json({ error: 'Failed to publish policy' });
  }
});

// ==================== COMPLIANCE ROUTES ====================

// Get all compliance regulations
router.get('/compliance', authenticateToken, requireRole(['admin', 'legal', 'compliance']), legalRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Get compliance regulations - Implementation pending', data: [] });
  } catch (error) {
    logger.error('Error getting compliance regulations:', error);
    res.status(500).json({ error: 'Failed to get compliance regulations' });
  }
});

// Create compliance regulation
router.post('/compliance', authenticateToken, requireRole(['admin', 'legal']), legalRateLimit, validate('compliance'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Create compliance regulation - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error creating compliance regulation:', error);
    res.status(500).json({ error: 'Failed to create compliance regulation' });
  }
});

// Conduct compliance audit
router.post('/compliance/:id/audit', authenticateToken, requireRole(['admin', 'legal', 'compliance']), legalRateLimit, validate('audit'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Conduct compliance audit - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error conducting compliance audit:', error);
    res.status(500).json({ error: 'Failed to conduct compliance audit' });
  }
});

// ==================== LEGAL CASE ROUTES ====================

// Get all legal cases
router.get('/cases', authenticateToken, requireRole(['admin', 'legal']), legalRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Get legal cases - Implementation pending', data: [] });
  } catch (error) {
    logger.error('Error getting legal cases:', error);
    res.status(500).json({ error: 'Failed to get legal cases' });
  }
});

// Create legal case
router.post('/cases', authenticateToken, requireRole(['admin', 'legal']), legalRateLimit, validate('case'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Create legal case - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error creating legal case:', error);
    res.status(500).json({ error: 'Failed to create legal case' });
  }
});

// Update case status
router.put('/cases/:id/status', authenticateToken, requireRole(['admin', 'legal']), legalRateLimit, validate('caseStatus'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Update case status - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error updating case status:', error);
    res.status(500).json({ error: 'Failed to update case status' });
  }
});

// ==================== RISK ASSESSMENT ROUTES ====================

// Get all risk assessments
router.get('/risk-assessments', authenticateToken, requireRole(['admin', 'legal', 'compliance']), legalRateLimit, async (req, res) => {
  try {
    res.json({ success: true, message: 'Get risk assessments - Implementation pending', data: [] });
  } catch (error) {
    logger.error('Error getting risk assessments:', error);
    res.status(500).json({ error: 'Failed to get risk assessments' });
  }
});

// Create risk assessment
router.post('/risk-assessments', authenticateToken, requireRole(['admin', 'legal', 'compliance']), legalRateLimit, validate('riskAssessment'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Create risk assessment - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error creating risk assessment:', error);
    res.status(500).json({ error: 'Failed to create risk assessment' });
  }
});

// Update risk level
router.put('/risk-assessments/:id/risk-level', authenticateToken, requireRole(['admin', 'legal', 'compliance']), legalRateLimit, validate('riskLevel'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Update risk level - Implementation pending', data: {} });
  } catch (error) {
    logger.error('Error updating risk level:', error);
    res.status(500).json({ error: 'Failed to update risk level' });
  }
});

module.exports = router;
