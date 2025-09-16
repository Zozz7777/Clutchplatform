/**
 * Legal Management Routes
 * Complete legal system with contract management, dispute handling, and legal documents
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/rbac');
const { getCollection } = require('../config/optimized-database');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');

// Apply rate limiting
const legalRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 100 });

// ==================== CONTRACT MANAGEMENT ====================

// GET /api/v1/legal/contracts - Get all contracts
router.get('/contracts', authenticateToken, checkRole(['head_administrator', 'legal_team']), legalRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, type, party, search } = req.query;
    const skip = (page - 1) * limit;
    
    const contractsCollection = await getCollection('contracts');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (party) query.party = party;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { contractNumber: { $regex: search, $options: 'i' } },
        { party: { $regex: search, $options: 'i' } }
      ];
    }
    
    const contracts = await contractsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await contractsCollection.countDocuments(query);
    
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
      message: 'Contracts retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CONTRACTS_FAILED',
      message: 'Failed to retrieve contracts',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/legal/contracts/:id - Get contract by ID
router.get('/contracts/:id', authenticateToken, checkRole(['head_administrator', 'legal_team']), legalRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const contractsCollection = await getCollection('contracts');
    
    const contract = await contractsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'CONTRACT_NOT_FOUND',
        message: 'Contract not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { contract },
      message: 'Contract retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CONTRACT_FAILED',
      message: 'Failed to retrieve contract',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/legal/contracts - Create new contract
router.post('/contracts', authenticateToken, checkRole(['head_administrator', 'legal_team']), legalRateLimit, async (req, res) => {
  try {
    const {
      title,
      type,
      party,
      startDate,
      endDate,
      value,
      terms,
      clauses,
      attachments,
      renewalDate,
      autoRenewal
    } = req.body;
    
    if (!title || !type || !party || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Title, type, party, start date, and end date are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const contractsCollection = await getCollection('contracts');
    
    // Generate contract number
    const contractCount = await contractsCollection.countDocuments();
    const contractNumber = `CNT${String(contractCount + 1).padStart(6, '0')}`;
    
    const newContract = {
      contractNumber,
      title,
      type,
      party,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      value: value || null,
      terms: terms || null,
      clauses: clauses || [],
      attachments: attachments || [],
      renewalDate: renewalDate ? new Date(renewalDate) : null,
      autoRenewal: autoRenewal || false,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await contractsCollection.insertOne(newContract);
    
    res.status(201).json({
      success: true,
      data: { contract: { ...newContract, _id: result.insertedId } },
      message: 'Contract created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_CONTRACT_FAILED',
      message: 'Failed to create contract',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/legal/contracts/:id - Update contract
router.put('/contracts/:id', authenticateToken, checkRole(['head_administrator', 'legal_team']), legalRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const contractsCollection = await getCollection('contracts');
    
    const result = await contractsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'CONTRACT_NOT_FOUND',
        message: 'Contract not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const updatedContract = await contractsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { contract: updatedContract },
      message: 'Contract updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update contract error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_CONTRACT_FAILED',
      message: 'Failed to update contract',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/legal/contracts/:id/sign - Sign contract
router.post('/contracts/:id/sign', authenticateToken, checkRole(['head_administrator', 'legal_team']), legalRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { signature, signedBy } = req.body;
    
    if (!signature || !signedBy) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_SIGNATURE_DATA',
        message: 'Signature and signed by information are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const contractsCollection = await getCollection('contracts');
    
    const updateData = {
      status: 'signed',
      signature: {
        data: signature,
        signedBy,
        signedAt: new Date()
      },
      updatedAt: new Date()
    };
    
    const result = await contractsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'CONTRACT_NOT_FOUND',
        message: 'Contract not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const updatedContract = await contractsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { contract: updatedContract },
      message: 'Contract signed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sign contract error:', error);
    res.status(500).json({
      success: false,
      error: 'SIGN_CONTRACT_FAILED',
      message: 'Failed to sign contract',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== DISPUTE MANAGEMENT ====================

// GET /api/v1/legal/disputes - Get all disputes
router.get('/disputes', authenticateToken, checkRole(['head_administrator', 'legal_team']), legalRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, type, priority, search } = req.query;
    const skip = (page - 1) * limit;
    
    const disputesCollection = await getCollection('disputes');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { caseNumber: { $regex: search, $options: 'i' } },
        { party: { $regex: search, $options: 'i' } }
      ];
    }
    
    const disputes = await disputesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await disputesCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        disputes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Disputes retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get disputes error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_DISPUTES_FAILED',
      message: 'Failed to retrieve disputes',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/legal/disputes - Create new dispute
router.post('/disputes', authenticateToken, checkRole(['head_administrator', 'legal_team']), legalRateLimit, async (req, res) => {
  try {
    const {
      title,
      type,
      party,
      description,
      priority,
      estimatedValue,
      documents,
      assignedLawyer,
      dueDate
    } = req.body;
    
    if (!title || !type || !party || !description) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Title, type, party, and description are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const disputesCollection = await getCollection('disputes');
    
    // Generate case number
    const disputeCount = await disputesCollection.countDocuments();
    const caseNumber = `CASE${String(disputeCount + 1).padStart(6, '0')}`;
    
    const newDispute = {
      caseNumber,
      title,
      type,
      party,
      description,
      priority: priority || 'medium',
      estimatedValue: estimatedValue || null,
      documents: documents || [],
      assignedLawyer: assignedLawyer || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await disputesCollection.insertOne(newDispute);
    
    res.status(201).json({
      success: true,
      data: { dispute: { ...newDispute, _id: result.insertedId } },
      message: 'Dispute created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_DISPUTE_FAILED',
      message: 'Failed to create dispute',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/legal/disputes/:id - Update dispute
router.put('/disputes/:id', authenticateToken, checkRole(['head_administrator', 'legal_team']), legalRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const disputesCollection = await getCollection('disputes');
    
    const result = await disputesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'DISPUTE_NOT_FOUND',
        message: 'Dispute not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const updatedDispute = await disputesCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { dispute: updatedDispute },
      message: 'Dispute updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update dispute error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_DISPUTE_FAILED',
      message: 'Failed to update dispute',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== LEGAL DOCUMENTS ====================

// GET /api/v1/legal/documents - Get legal documents
router.get('/documents', authenticateToken, checkRole(['head_administrator', 'legal_team']), legalRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, category, search } = req.query;
    const skip = (page - 1) * limit;
    
    const documentsCollection = await getCollection('legal_documents');
    
    // Build query
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const documents = await documentsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await documentsCollection.countDocuments(query);
    
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
      message: 'Legal documents retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get legal documents error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_LEGAL_DOCUMENTS_FAILED',
      message: 'Failed to retrieve legal documents',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/legal/documents - Upload legal document
router.post('/documents', authenticateToken, checkRole(['head_administrator', 'legal_team']), legalRateLimit, async (req, res) => {
  try {
    const {
      title,
      type,
      category,
      description,
      fileUrl,
      tags,
      confidentiality
    } = req.body;
    
    if (!title || !type || !category) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Title, type, and category are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const documentsCollection = await getCollection('legal_documents');
    
    const newDocument = {
      title,
      type,
      category,
      description: description || null,
      fileUrl: fileUrl || null,
      tags: tags || [],
      confidentiality: confidentiality || 'internal',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      uploadedBy: req.user.userId
    };
    
    const result = await documentsCollection.insertOne(newDocument);
    
    res.status(201).json({
      success: true,
      data: { document: { ...newDocument, _id: result.insertedId } },
      message: 'Legal document uploaded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload legal document error:', error);
    res.status(500).json({
      success: false,
      error: 'UPLOAD_LEGAL_DOCUMENT_FAILED',
      message: 'Failed to upload legal document',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== LEGAL ANALYTICS ====================

// GET /api/v1/legal/analytics - Get legal analytics
router.get('/analytics', authenticateToken, checkRole(['head_administrator', 'legal_team']), legalRateLimit, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const contractsCollection = await getCollection('contracts');
    const disputesCollection = await getCollection('disputes');
    const documentsCollection = await getCollection('legal_documents');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));
    
    // Contract statistics
    const totalContracts = await contractsCollection.countDocuments();
    const activeContracts = await contractsCollection.countDocuments({ status: 'active' });
    const expiringContracts = await contractsCollection.countDocuments({
      endDate: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    });
    
    // Dispute statistics
    const totalDisputes = await disputesCollection.countDocuments();
    const openDisputes = await disputesCollection.countDocuments({ status: 'open' });
    const resolvedDisputes = await disputesCollection.countDocuments({ status: 'resolved' });
    
    // Document statistics
    const totalDocuments = await documentsCollection.countDocuments();
    
    // Contract types distribution
    const contractTypes = await contractsCollection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Dispute types distribution
    const disputeTypes = await disputesCollection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    const analytics = {
      contracts: {
        total: totalContracts,
        active: activeContracts,
        expiring: expiringContracts,
        types: contractTypes
      },
      disputes: {
        total: totalDisputes,
        open: openDisputes,
        resolved: resolvedDisputes,
        types: disputeTypes
      },
      documents: {
        total: totalDocuments
      },
      period,
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'Legal analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get legal analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_LEGAL_ANALYTICS_FAILED',
      message: 'Failed to retrieve legal analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== GENERIC HANDLERS ====================

// GET /api/v1/legal - Get legal overview
router.get('/', authenticateToken, checkRole(['head_administrator', 'legal_team']), legalRateLimit, async (req, res) => {
  res.json({
    success: true,
    message: 'Legal Management API is running',
    endpoints: {
      contracts: '/api/v1/legal/contracts',
      disputes: '/api/v1/legal/disputes',
      documents: '/api/v1/legal/documents',
      analytics: '/api/v1/legal/analytics'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
