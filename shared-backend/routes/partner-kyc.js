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
    const uploadDir = path.join(__dirname, '../uploads/kyc');
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
    cb(null, `kyc-${req.user._id}-${uniqueSuffix}${ext}`);
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

// KYC Document Types
const DOCUMENT_TYPES = {
  VAT_CERTIFICATE: 'vat_certificate',
  TRADE_LICENSE: 'trade_license',
  OWNER_ID: 'owner_id',
  BUSINESS_REGISTRATION: 'business_registration',
  BANK_STATEMENT: 'bank_statement',
  UTILITY_BILL: 'utility_bill'
};

// KYC Status
const KYC_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

// Upload KYC documents
router.post('/upload', [
  auth,
  upload.fields([
    { name: 'vatCertificate', maxCount: 1 },
    { name: 'tradeLicense', maxCount: 1 },
    { name: 'ownerId', maxCount: 1 },
    { name: 'businessRegistration', maxCount: 1 },
    { name: 'bankStatement', maxCount: 1 },
    { name: 'utilityBill', maxCount: 1 }
  ]),
  body('documentType').isIn(Object.values(DOCUMENT_TYPES)).withMessage('Invalid document type'),
  body('description').optional().isString().withMessage('Description must be a string')
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

    const { documentType, description } = req.body;
    const userId = req.user._id;
    const files = req.files;

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Process uploaded files
    const uploadedDocuments = [];
    
    for (const [fieldName, fileArray] of Object.entries(files)) {
      for (const file of fileArray) {
        const documentData = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          type: documentType,
          fieldName: fieldName,
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          uploadedAt: new Date(),
          status: KYC_STATUS.PENDING,
          description: description || null
        };

        uploadedDocuments.push(documentData);
      }
    }

    // Update user's KYC documents
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize KYC data if not exists
    if (!user.kycData) {
      user.kycData = {
        status: KYC_STATUS.PENDING,
        documents: [],
        submittedAt: null,
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null
      };
    }

    // Add new documents
    user.kycData.documents.push(...uploadedDocuments);
    user.kycData.submittedAt = new Date();
    user.kycData.status = KYC_STATUS.PENDING;

    await user.save();

    logger.info(`KYC documents uploaded for user ${userId}`, {
      documentCount: uploadedDocuments.length,
      documentTypes: uploadedDocuments.map(doc => doc.type)
    });

    res.json({
      success: true,
      message: 'KYC documents uploaded successfully',
      data: {
        documents: uploadedDocuments.map(doc => ({
          id: doc.id,
          type: doc.type,
          originalName: doc.originalName,
          size: doc.size,
          uploadedAt: doc.uploadedAt,
          status: doc.status
        })),
        kycStatus: user.kycData.status
      }
    });

  } catch (error) {
    logger.error('KYC upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload KYC documents'
    });
  }
});

// Get KYC status
router.get('/status', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await PartnerUser.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const kycData = user.kycData || {
      status: KYC_STATUS.PENDING,
      documents: [],
      submittedAt: null,
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null
    };

    res.json({
      success: true,
      data: {
        status: kycData.status,
        submittedAt: kycData.submittedAt,
        reviewedAt: kycData.reviewedAt,
        reviewedBy: kycData.reviewedBy,
        rejectionReason: kycData.rejectionReason,
        documentCount: kycData.documents.length,
        documents: kycData.documents.map(doc => ({
          id: doc.id,
          type: doc.type,
          originalName: doc.originalName,
          size: doc.size,
          uploadedAt: doc.uploadedAt,
          status: doc.status,
          description: doc.description
        }))
      }
    });

  } catch (error) {
    logger.error('Failed to get KYC status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get KYC status'
    });
  }
});

// Admin: Review KYC documents
router.post('/review/:userId', [
  auth,
  body('status').isIn(Object.values(KYC_STATUS)).withMessage('Invalid status'),
  body('reviewerNotes').optional().isString().withMessage('Reviewer notes must be a string'),
  body('rejectionReason').optional().isString().withMessage('Rejection reason must be a string')
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

    const { userId } = req.params;
    const { status, reviewerNotes, rejectionReason } = req.body;
    const reviewerId = req.user._id;

    // Check if current user is admin
    const reviewer = await PartnerUser.findById(reviewerId);
    if (!reviewer || reviewer.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.kycData) {
      return res.status(400).json({
        success: false,
        message: 'No KYC data found for this user'
      });
    }

    // Update KYC status
    user.kycData.status = status;
    user.kycData.reviewedAt = new Date();
    user.kycData.reviewedBy = reviewerId;
    user.kycData.reviewerNotes = reviewerNotes;
    
    if (status === KYC_STATUS.REJECTED) {
      user.kycData.rejectionReason = rejectionReason;
    } else {
      user.kycData.rejectionReason = null;
    }

    // Update user verification status
    if (status === KYC_STATUS.APPROVED) {
      user.isVerified = true;
      user.verificationDate = new Date();
    } else if (status === KYC_STATUS.REJECTED) {
      user.isVerified = false;
    }

    await user.save();

    logger.info(`KYC review completed for user ${userId}`, {
      status: status,
      reviewerId: reviewerId,
      reviewerNotes: reviewerNotes
    });

    res.json({
      success: true,
      message: 'KYC review completed successfully',
      data: {
        userId: userId,
        status: status,
        reviewedAt: user.kycData.reviewedAt,
        reviewedBy: reviewerId,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    logger.error('KYC review failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review KYC documents'
    });
  }
});

// Get KYC document file
router.get('/document/:documentId', auth, async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user._id;

    const user = await PartnerUser.findById(userId);
    if (!user || !user.kycData) {
      return res.status(404).json({
        success: false,
        message: 'KYC data not found'
      });
    }

    const document = user.kycData.documents.find(doc => doc.id === documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if file exists
    try {
      await fs.access(document.path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', document.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);

    // Send file
    const fileStream = require('fs').createReadStream(document.path);
    fileStream.pipe(res);

  } catch (error) {
    logger.error('Failed to get KYC document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get KYC document'
    });
  }
});

// Delete KYC document
router.delete('/document/:documentId', auth, async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user._id;

    const user = await PartnerUser.findById(userId);
    if (!user || !user.kycData) {
      return res.status(404).json({
        success: false,
        message: 'KYC data not found'
      });
    }

    const documentIndex = user.kycData.documents.findIndex(doc => doc.id === documentId);
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = user.kycData.documents[documentIndex];

    // Delete file from filesystem
    try {
      await fs.unlink(document.path);
    } catch (error) {
      logger.warn(`Failed to delete file ${document.path}:`, error);
    }

    // Remove document from user's KYC data
    user.kycData.documents.splice(documentIndex, 1);

    // Reset KYC status if no documents remain
    if (user.kycData.documents.length === 0) {
      user.kycData.status = KYC_STATUS.PENDING;
      user.kycData.submittedAt = null;
    }

    await user.save();

    logger.info(`KYC document deleted for user ${userId}`, {
      documentId: documentId,
      documentType: document.type
    });

    res.json({
      success: true,
      message: 'KYC document deleted successfully'
    });

  } catch (error) {
    logger.error('Failed to delete KYC document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete KYC document'
    });
  }
});

// Get all pending KYC submissions (Admin only)
router.get('/pending', auth, async (req, res) => {
  try {
    const currentUser = req.user;
    
    // Check if current user is admin
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { page = 1, limit = 20, status } = req.query;
    const query = { 'kycData.status': status || KYC_STATUS.PENDING };

    const users = await PartnerUser.find(query)
      .select('_id email businessName ownerName kycData')
      .sort({ 'kycData.submittedAt': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PartnerUser.countDocuments(query);

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user._id,
          email: user.email,
          businessName: user.businessName,
          ownerName: user.ownerName,
          kycStatus: user.kycData?.status || KYC_STATUS.PENDING,
          submittedAt: user.kycData?.submittedAt,
          documentCount: user.kycData?.documents?.length || 0
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get pending KYC submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending KYC submissions'
    });
  }
});

module.exports = router;
