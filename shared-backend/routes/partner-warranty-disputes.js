const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/warranty');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `warranty-${req.user._id}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
    }
  }
});

// Warranty Claim Types
const WARRANTY_TYPES = {
  PRODUCT_DEFECT: 'product_defect',
  MANUFACTURING_ERROR: 'manufacturing_error',
  DAMAGE_IN_TRANSIT: 'damage_in_transit',
  WRONG_ITEM: 'wrong_item',
  MISSING_ITEM: 'missing_item',
  QUALITY_ISSUE: 'quality_issue'
};

// Warranty Status
const WARRANTY_STATUS = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated'
};

// Dispute Types
const DISPUTE_TYPES = {
  INVOICE_DISPUTE: 'invoice_dispute',
  PAYMENT_DISPUTE: 'payment_dispute',
  SERVICE_DISPUTE: 'service_dispute',
  DELIVERY_DISPUTE: 'delivery_dispute',
  QUALITY_DISPUTE: 'quality_dispute'
};

// Dispute Status
const DISPUTE_STATUS = {
  OPEN: 'open',
  UNDER_INVESTIGATION: 'under_investigation',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated',
  CLOSED: 'closed'
};

// Submit warranty claim
router.post('/warranty/claim', [
  auth,
  upload.array('evidence', 5),
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('type').isIn(Object.values(WARRANTY_TYPES)).withMessage('Invalid warranty type'),
  body('description').notEmpty().withMessage('Description is required'),
  body('productSku').optional().isString().withMessage('Product SKU must be a string'),
  body('customerInfo').isObject().withMessage('Customer info is required'),
  body('expectedResolution').optional().isString().withMessage('Expected resolution must be a string')
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

    const { orderId, type, description, productSku, customerInfo, expectedResolution } = req.body;
    const userId = req.user._id;
    const files = req.files || [];

    // Generate claim ID
    const claimId = `WAR_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    // Process evidence files
    const evidence = files.map(file => ({
      id: `evd_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    }));

    // Create warranty claim data
    const claimData = {
      id: claimId,
      userId: userId,
      orderId: orderId,
      type: type,
      description: description,
      productSku: productSku || null,
      customerInfo: customerInfo,
      expectedResolution: expectedResolution || null,
      status: WARRANTY_STATUS.SUBMITTED,
      evidence: evidence,
      submittedAt: new Date(),
      updatedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      resolution: null,
      resolvedAt: null,
      escalatedAt: null,
      escalatedTo: null,
      messages: [{
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        userId: userId,
        message: description,
        type: 'initial_claim',
        attachments: evidence,
        createdAt: new Date()
      }]
    };

    // Save claim to user's warranty claims
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.warrantyClaims) {
      user.warrantyClaims = [];
    }

    user.warrantyClaims.push(claimData);
    await user.save();

    // Send notification to admin team
    await sendWarrantyNotification({
      type: 'new_warranty_claim',
      claimId: claimId,
      userId: userId,
      orderId: orderId,
      warrantyType: type,
      priority: 'high'
    });

    logger.info(`Warranty claim submitted: ${claimId}`, {
      userId: userId,
      orderId: orderId,
      type: type,
      evidenceCount: evidence.length
    });

    res.json({
      success: true,
      message: 'Warranty claim submitted successfully',
      data: {
        claimId: claimId,
        status: WARRANTY_STATUS.SUBMITTED,
        submittedAt: claimData.submittedAt,
        evidenceCount: evidence.length
      }
    });

  } catch (error) {
    logger.error('Failed to submit warranty claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit warranty claim'
    });
  }
});

// Get warranty claim
router.get('/warranty/:claimId', auth, async (req, res) => {
  try {
    const { claimId } = req.params;
    const userId = req.user._id;

    const user = await PartnerUser.findById(userId);
    if (!user || !user.warrantyClaims) {
      return res.status(404).json({
        success: false,
        message: 'Warranty claim not found'
      });
    }

    const claim = user.warrantyClaims.find(c => c.id === claimId);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Warranty claim not found'
      });
    }

    // Format claim for response
    const formattedClaim = {
      id: claim.id,
      orderId: claim.orderId,
      type: claim.type,
      description: claim.description,
      productSku: claim.productSku,
      customerInfo: claim.customerInfo,
      expectedResolution: claim.expectedResolution,
      status: claim.status,
      submittedAt: claim.submittedAt,
      updatedAt: claim.updatedAt,
      reviewedAt: claim.reviewedAt,
      reviewedBy: claim.reviewedBy,
      resolution: claim.resolution,
      resolvedAt: claim.resolvedAt,
      escalatedAt: claim.escalatedAt,
      escalatedTo: claim.escalatedTo,
      evidence: claim.evidence.map(evd => ({
        id: evd.id,
        originalName: evd.originalName,
        size: evd.size,
        mimetype: evd.mimetype,
        uploadedAt: evd.uploadedAt
      })),
      messages: claim.messages.map(msg => ({
        id: msg.id,
        userId: msg.userId,
        message: msg.message,
        type: msg.type,
        attachments: msg.attachments?.map(att => ({
          id: att.id,
          originalName: att.originalName,
          size: att.size,
          mimetype: att.mimetype
        })) || [],
        createdAt: msg.createdAt
      }))
    };

    res.json({
      success: true,
      data: {
        claim: formattedClaim
      }
    });

  } catch (error) {
    logger.error('Failed to get warranty claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get warranty claim'
    });
  }
});

// Submit dispute
router.post('/disputes', [
  auth,
  upload.array('evidence', 5),
  body('type').isIn(Object.values(DISPUTE_TYPES)).withMessage('Invalid dispute type'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('relatedOrderId').optional().isString().withMessage('Related order ID must be a string'),
  body('relatedInvoiceId').optional().isString().withMessage('Related invoice ID must be a string'),
  body('requestedResolution').optional().isString().withMessage('Requested resolution must be a string')
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

    const { type, subject, description, relatedOrderId, relatedInvoiceId, requestedResolution } = req.body;
    const userId = req.user._id;
    const files = req.files || [];

    // Generate dispute ID
    const disputeId = `DIS_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    // Process evidence files
    const evidence = files.map(file => ({
      id: `evd_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    }));

    // Create dispute data
    const disputeData = {
      id: disputeId,
      userId: userId,
      type: type,
      subject: subject,
      description: description,
      relatedOrderId: relatedOrderId || null,
      relatedInvoiceId: relatedInvoiceId || null,
      requestedResolution: requestedResolution || null,
      status: DISPUTE_STATUS.OPEN,
      evidence: evidence,
      submittedAt: new Date(),
      updatedAt: new Date(),
      investigatedAt: null,
      investigatedBy: null,
      resolution: null,
      resolvedAt: null,
      escalatedAt: null,
      escalatedTo: null,
      closedAt: null,
      messages: [{
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        userId: userId,
        message: description,
        type: 'initial_dispute',
        attachments: evidence,
        createdAt: new Date()
      }]
    };

    // Save dispute to user's disputes
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.disputes) {
      user.disputes = [];
    }

    user.disputes.push(disputeData);
    await user.save();

    // Send notification to admin team
    await sendDisputeNotification({
      type: 'new_dispute',
      disputeId: disputeId,
      userId: userId,
      disputeType: type,
      priority: 'high'
    });

    logger.info(`Dispute submitted: ${disputeId}`, {
      userId: userId,
      type: type,
      relatedOrderId: relatedOrderId,
      evidenceCount: evidence.length
    });

    res.json({
      success: true,
      message: 'Dispute submitted successfully',
      data: {
        disputeId: disputeId,
        status: DISPUTE_STATUS.OPEN,
        submittedAt: disputeData.submittedAt,
        evidenceCount: evidence.length
      }
    });

  } catch (error) {
    logger.error('Failed to submit dispute:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit dispute'
    });
  }
});

// Resolve dispute
router.patch('/disputes/:disputeId/resolve', [
  auth,
  body('resolution').notEmpty().withMessage('Resolution is required'),
  body('resolutionType').isIn(['accepted', 'rejected', 'partial']).withMessage('Invalid resolution type'),
  body('adminNotes').optional().isString().withMessage('Admin notes must be a string')
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

    const { disputeId } = req.params;
    const { resolution, resolutionType, adminNotes } = req.body;
    const adminId = req.user._id;

    // Check if current user is admin
    const admin = await PartnerUser.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Find the dispute (this would be in a disputes collection in real implementation)
    // For now, we'll simulate finding it
    const dispute = {
      id: disputeId,
      userId: 'user123', // This would come from the actual dispute
      status: DISPUTE_STATUS.OPEN
    };

    // Update dispute status
    dispute.status = DISPUTE_STATUS.RESOLVED;
    dispute.resolution = resolution;
    dispute.resolutionType = resolutionType;
    dispute.adminNotes = adminNotes;
    dispute.resolvedAt = new Date();
    dispute.resolvedBy = adminId;
    dispute.updatedAt = new Date();

    // Send notification to user
    await sendDisputeNotification({
      type: 'dispute_resolved',
      disputeId: disputeId,
      userId: dispute.userId,
      resolution: resolution,
      resolutionType: resolutionType
    });

    logger.info(`Dispute resolved: ${disputeId}`, {
      adminId: adminId,
      resolutionType: resolutionType,
      resolution: resolution
    });

    res.json({
      success: true,
      message: 'Dispute resolved successfully',
      data: {
        disputeId: disputeId,
        status: DISPUTE_STATUS.RESOLVED,
        resolution: resolution,
        resolutionType: resolutionType,
        resolvedAt: dispute.resolvedAt
      }
    });

  } catch (error) {
    logger.error('Failed to resolve dispute:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve dispute'
    });
  }
});

// Get user's disputes
router.get('/disputes', [
  auth,
  body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  body('status').optional().isIn(Object.values(DISPUTE_STATUS)).withMessage('Invalid status'),
  body('type').optional().isIn(Object.values(DISPUTE_TYPES)).withMessage('Invalid type')
], async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const userId = req.user._id;

    const user = await PartnerUser.findById(userId);
    if (!user || !user.disputes) {
      return res.json({
        success: true,
        data: {
          disputes: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0
          }
        }
      });
    }

    // Filter disputes
    let filteredDisputes = user.disputes;
    
    if (status) {
      filteredDisputes = filteredDisputes.filter(dispute => dispute.status === status);
    }
    if (type) {
      filteredDisputes = filteredDisputes.filter(dispute => dispute.type === type);
    }

    // Sort by submission date (newest first)
    filteredDisputes.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedDisputes = filteredDisputes.slice(startIndex, endIndex);

    // Format disputes for response
    const formattedDisputes = paginatedDisputes.map(dispute => ({
      id: dispute.id,
      type: dispute.type,
      subject: dispute.subject,
      status: dispute.status,
      submittedAt: dispute.submittedAt,
      updatedAt: dispute.updatedAt,
      relatedOrderId: dispute.relatedOrderId,
      relatedInvoiceId: dispute.relatedInvoiceId,
      resolution: dispute.resolution,
      resolvedAt: dispute.resolvedAt,
      messageCount: dispute.messages.length,
      evidenceCount: dispute.evidence.length
    }));

    res.json({
      success: true,
      data: {
        disputes: formattedDisputes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredDisputes.length,
          pages: Math.ceil(filteredDisputes.length / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get disputes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get disputes'
    });
  }
});

// Get user's warranty claims
router.get('/warranty', [
  auth,
  body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  body('status').optional().isIn(Object.values(WARRANTY_STATUS)).withMessage('Invalid status'),
  body('type').optional().isIn(Object.values(WARRANTY_TYPES)).withMessage('Invalid type')
], async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const userId = req.user._id;

    const user = await PartnerUser.findById(userId);
    if (!user || !user.warrantyClaims) {
      return res.json({
        success: true,
        data: {
          claims: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0
          }
        }
      });
    }

    // Filter claims
    let filteredClaims = user.warrantyClaims;
    
    if (status) {
      filteredClaims = filteredClaims.filter(claim => claim.status === status);
    }
    if (type) {
      filteredClaims = filteredClaims.filter(claim => claim.type === type);
    }

    // Sort by submission date (newest first)
    filteredClaims.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedClaims = filteredClaims.slice(startIndex, endIndex);

    // Format claims for response
    const formattedClaims = paginatedClaims.map(claim => ({
      id: claim.id,
      orderId: claim.orderId,
      type: claim.type,
      status: claim.status,
      submittedAt: claim.submittedAt,
      updatedAt: claim.updatedAt,
      productSku: claim.productSku,
      resolution: claim.resolution,
      resolvedAt: claim.resolvedAt,
      messageCount: claim.messages.length,
      evidenceCount: claim.evidence.length
    }));

    res.json({
      success: true,
      data: {
        claims: formattedClaims,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredClaims.length,
          pages: Math.ceil(filteredClaims.length / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get warranty claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get warranty claims'
    });
  }
});

// Helper functions
async function sendWarrantyNotification({ type, claimId, userId, orderId, warrantyType, priority }) {
  logger.info('Sending warranty notification', {
    type: type,
    claimId: claimId,
    userId: userId,
    orderId: orderId,
    warrantyType: warrantyType,
    priority: priority
  });
  
  await new Promise(resolve => setTimeout(resolve, 100));
  return { success: true };
}

async function sendDisputeNotification({ type, disputeId, userId, disputeType, priority, resolution, resolutionType }) {
  logger.info('Sending dispute notification', {
    type: type,
    disputeId: disputeId,
    userId: userId,
    disputeType: disputeType,
    priority: priority,
    resolution: resolution,
    resolutionType: resolutionType
  });
  
  await new Promise(resolve => setTimeout(resolve, 100));
  return { success: true };
}

module.exports = router;
