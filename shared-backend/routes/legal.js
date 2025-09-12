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

// ==================== LEGAL DOCUMENT MANAGEMENT ====================

// Get all legal documents
router.get('/', authenticateToken, requireRole(['admin', 'legal', 'compliance']), async (req, res) => {
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
router.get('/:id', authenticateToken, requireRole(['admin', 'legal', 'compliance']), async (req, res) => {
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
router.post('/', authenticateToken, requireRole(['admin', 'legal']), validate('legal'), async (req, res) => {
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
router.put('/:id', authenticateToken, requireRole(['admin', 'legal']), validate('legalUpdate'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content, type, category, tags, status } = req.body;
    
    const collection = await getCollection('legal_documents');
    
    const updateData = {
      updatedAt: new Date(),
      updatedBy: req.user.id
    };
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content) updateData.content = content;
    if (type) updateData.type = type;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    if (status) updateData.status = status;
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: updateData,
        $inc: { version: 1 }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'DOCUMENT_NOT_FOUND',
        message: 'Legal document not found'
      });
    }
    
    const updatedDocument = await collection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: updatedDocument,
      message: 'Legal document updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating legal document:', error);
    res.status(500).json({ 
      success: false,
      error: 'UPDATE_LEGAL_DOCUMENT_FAILED',
      message: 'Failed to update legal document' 
    });
  }
});

// Delete legal document
router.delete('/:id', authenticateToken, requireRole(['admin', 'legal']), async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await getCollection('legal_documents');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'DOCUMENT_NOT_FOUND',
        message: 'Legal document not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Legal document deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting legal document:', error);
    res.status(500).json({ 
      success: false,
      error: 'DELETE_LEGAL_DOCUMENT_FAILED',
      message: 'Failed to delete legal document' 
    });
  }
});

// ==================== CONTRACT MANAGEMENT ====================

// Get all contracts
router.get('/contracts', authenticateToken, requireRole(['admin', 'legal', 'contracts']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, search } = req.query;
    const skip = (page - 1) * limit;
    
    const collection = await getCollection('contracts');
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { partyName: { $regex: search, $options: 'i' } },
        { contractNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    const [contracts, total] = await Promise.all([
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
        contracts,
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
    logger.error('Error getting contracts:', error);
    res.status(500).json({ 
      success: false,
      error: 'FETCH_CONTRACTS_FAILED',
      message: 'Failed to get contracts' 
    });
  }
});

// Get contract by ID
router.get('/contracts/:id', authenticateToken, requireRole(['admin', 'legal', 'contracts']), async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await getCollection('contracts');
    
    const contract = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'CONTRACT_NOT_FOUND',
        message: 'Contract not found'
      });
    }
    
    res.json({
      success: true,
      data: contract,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting contract:', error);
    res.status(500).json({ 
      success: false,
      error: 'FETCH_CONTRACT_FAILED',
      message: 'Failed to get contract' 
    });
  }
});

// Create new contract
router.post('/contracts', authenticateToken, requireRole(['admin', 'legal']), validate('contract'), async (req, res) => {
  try {
    const { 
      title, 
      contractNumber, 
      partyName, 
      partyEmail, 
      type, 
      startDate, 
      endDate, 
      value, 
      currency, 
      terms, 
      status = 'draft' 
    } = req.body;
    
    if (!title || !contractNumber || !partyName) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Title, contract number, and party name are required'
      });
    }
    
    const collection = await getCollection('contracts');
    
    const contract = {
      title,
      contractNumber,
      partyName,
      partyEmail: partyEmail || '',
      type: type || 'service',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      value: value || 0,
      currency: currency || 'USD',
      terms: terms || '',
      status,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };
    
    const result = await collection.insertOne(contract);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...contract
      },
      message: 'Contract created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating contract:', error);
    res.status(500).json({ 
      success: false,
      error: 'CREATE_CONTRACT_FAILED',
      message: 'Failed to create contract' 
    });
  }
});

// Update contract
router.put('/contracts/:id', authenticateToken, requireRole(['admin', 'legal']), validate('contractUpdate'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.user.id
    };
    
    const collection = await getCollection('contracts');
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: updateData,
        $inc: { version: 1 }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'CONTRACT_NOT_FOUND',
        message: 'Contract not found'
      });
    }
    
    const updatedContract = await collection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: updatedContract,
      message: 'Contract updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating contract:', error);
    res.status(500).json({ 
      success: false,
      error: 'UPDATE_CONTRACT_FAILED',
      message: 'Failed to update contract' 
    });
  }
});

// Delete contract
router.delete('/contracts/:id', authenticateToken, requireRole(['admin', 'legal']), async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await getCollection('contracts');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'CONTRACT_NOT_FOUND',
        message: 'Contract not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Contract deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting contract:', error);
    res.status(500).json({ 
      success: false,
      error: 'DELETE_CONTRACT_FAILED',
      message: 'Failed to delete contract' 
    });
  }
});

// ==================== POLICY MANAGEMENT ====================

// Get all policies
router.get('/policies', authenticateToken, requireRole(['admin', 'legal', 'compliance']), async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, search } = req.query;
    const skip = (page - 1) * limit;
    
    const collection = await getCollection('policies');
    
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const [policies, total] = await Promise.all([
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
        policies,
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
    logger.error('Error getting policies:', error);
    res.status(500).json({ 
      success: false,
      error: 'FETCH_POLICIES_FAILED',
      message: 'Failed to get policies' 
    });
  }
});

// Get policy by ID
router.get('/policies/:id', authenticateToken, requireRole(['admin', 'legal', 'compliance']), async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await getCollection('policies');
    
    const policy = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'POLICY_NOT_FOUND',
        message: 'Policy not found'
      });
    }
    
    res.json({
      success: true,
      data: policy,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting policy:', error);
    res.status(500).json({ 
      success: false,
      error: 'FETCH_POLICY_FAILED',
      message: 'Failed to get policy' 
    });
  }
});

// Create new policy
router.post('/policies', authenticateToken, requireRole(['admin', 'legal']), validate('policy'), async (req, res) => {
  try {
    const { title, description, content, category, effectiveDate, status = 'draft' } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Title and content are required'
      });
    }
    
    const collection = await getCollection('policies');
    
    const policy = {
      title,
      description: description || '',
      content,
      category: category || 'general',
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      status,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };
    
    const result = await collection.insertOne(policy);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...policy
      },
      message: 'Policy created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating policy:', error);
    res.status(500).json({ 
      success: false,
      error: 'CREATE_POLICY_FAILED',
      message: 'Failed to create policy' 
    });
  }
});

// Update policy
router.put('/policies/:id', authenticateToken, requireRole(['admin', 'legal']), validate('policyUpdate'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.user.id
    };
    
    const collection = await getCollection('policies');
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: updateData,
        $inc: { version: 1 }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'POLICY_NOT_FOUND',
        message: 'Policy not found'
      });
    }
    
    const updatedPolicy = await collection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: updatedPolicy,
      message: 'Policy updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating policy:', error);
    res.status(500).json({ 
      success: false,
      error: 'UPDATE_POLICY_FAILED',
      message: 'Failed to update policy' 
    });
  }
});

// Delete policy
router.delete('/policies/:id', authenticateToken, requireRole(['admin', 'legal']), async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await getCollection('policies');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'POLICY_NOT_FOUND',
        message: 'Policy not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Policy deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting policy:', error);
    res.status(500).json({ 
      success: false,
      error: 'DELETE_POLICY_FAILED',
      message: 'Failed to delete policy' 
    });
  }
});

// ==================== LEGAL ANALYTICS ====================

// Get legal analytics overview
router.get('/analytics/overview', authenticateToken, requireRole(['admin', 'legal', 'analytics']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const documentsCollection = await getCollection('legal_documents');
    const contractsCollection = await getCollection('contracts');
    const policiesCollection = await getCollection('policies');
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    const [
      totalDocuments,
      totalContracts,
      totalPolicies,
      documentsByType,
      contractsByStatus,
      policiesByCategory
    ] = await Promise.all([
      documentsCollection.countDocuments(dateFilter),
      contractsCollection.countDocuments(dateFilter),
      policiesCollection.countDocuments(dateFilter),
      documentsCollection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]).toArray(),
      contractsCollection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      policiesCollection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]).toArray()
    ]);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalDocuments,
          totalContracts,
          totalPolicies,
          totalItems: totalDocuments + totalContracts + totalPolicies
        },
        breakdown: {
          documentsByType,
          contractsByStatus,
          policiesByCategory
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting legal analytics:', error);
    res.status(500).json({ 
      success: false,
      error: 'FETCH_LEGAL_ANALYTICS_FAILED',
      message: 'Failed to get legal analytics' 
    });
  }
});

// Get legal compliance status
router.get('/compliance/status', authenticateToken, requireRole(['admin', 'legal', 'compliance']), async (req, res) => {
  try {
    const documentsCollection = await getCollection('legal_documents');
    const contractsCollection = await getCollection('contracts');
    const policiesCollection = await getCollection('policies');
    
    const [
      activeDocuments,
      activeContracts,
      activePolicies,
      expiringContracts
    ] = await Promise.all([
      documentsCollection.countDocuments({ status: 'active' }),
      contractsCollection.countDocuments({ status: 'active' }),
      policiesCollection.countDocuments({ status: 'active' }),
      contractsCollection.countDocuments({
        status: 'active',
        endDate: { 
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      })
    ]);
    
    res.json({
      success: true,
      data: {
        compliance: {
          activeDocuments,
          activeContracts,
          activePolicies,
          expiringContracts,
          complianceScore: Math.round(((activeDocuments + activeContracts + activePolicies) / 3) * 100)
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting compliance status:', error);
    res.status(500).json({ 
      success: false,
      error: 'FETCH_COMPLIANCE_STATUS_FAILED',
      message: 'Failed to get compliance status' 
    });
  }
});

module.exports = router;
