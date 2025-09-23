const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/unified-auth');
const { authorize, getDataAccessFilter } = require('../middleware/sales-rbac');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Import models
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Contract = require('../models/Contract');
const SalesPartner = require('../models/SalesPartner');
const Communication = require('../models/Communication');
const Approval = require('../models/Approval');
const SalesActivity = require('../models/SalesActivity');
const PerformanceMetric = require('../models/PerformanceMetric');

// Rate limiting
const salesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many sales requests from this IP, please try again later.'
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/contracts');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `contract-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Apply rate limiting and authentication to all routes
router.use(salesLimiter);
router.use(authenticateToken);

// ============================================================================
// LEADS & DEALS ROUTES
// ============================================================================

// POST /api/v1/sales/leads - Create a new lead
router.post('/leads', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      assignedTo: req.salesUser.id
    };
    
    const lead = await Lead.create(leadData);
    
    res.status(201).json({
      success: true,
      lead: lead
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_LEAD_FAILED',
      message: 'Failed to create lead'
    });
  }
});

// GET /api/v1/sales/leads - Get leads with filtering
router.get('/leads', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const { page = 1, limit = 50, status, type, assignedTo } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = getDataAccessFilter(req.salesUser.role, req.salesUser.id);
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    const leads = await Lead.find(filter, { skip: parseInt(skip), limit: parseInt(limit) });
    
    res.json({
      success: true,
      leads: leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: leads.length
      }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_LEADS_FAILED',
      message: 'Failed to fetch leads'
    });
  }
});

// GET /api/v1/sales/leads/:id - Get specific lead
router.get('/leads/:id', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'LEAD_NOT_FOUND',
        message: 'Lead not found'
      });
    }
    
    res.json({
      success: true,
      lead: lead
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_LEAD_FAILED',
      message: 'Failed to fetch lead'
    });
  }
});

// PATCH /api/v1/sales/leads/:id - Update lead
router.patch('/leads/:id', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'LEAD_NOT_FOUND',
        message: 'Lead not found'
      });
    }
    
    await lead.update(req.body);
    
    res.json({
      success: true,
      lead: lead
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_LEAD_FAILED',
      message: 'Failed to update lead'
    });
  }
});

// DELETE /api/v1/sales/leads/:id - Delete lead
router.delete('/leads/:id', authorize(['sales_manager', 'admin']), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'LEAD_NOT_FOUND',
        message: 'Lead not found'
      });
    }
    
    await lead.delete();
    
    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_LEAD_FAILED',
      message: 'Failed to delete lead'
    });
  }
});

// GET /api/v1/sales/pipeline - Get pipeline data
router.get('/pipeline', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const pipeline = await Deal.getPipeline();
    
    res.json({
      success: true,
      pipeline: pipeline
    });
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_PIPELINE_FAILED',
      message: 'Failed to fetch pipeline data'
    });
  }
});

// POST /api/v1/sales/deals - Create a new deal
router.post('/deals', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const dealData = {
      ...req.body,
      assignedTo: req.salesUser.id
    };
    
    const deal = await Deal.create(dealData);
    
    res.status(201).json({
      success: true,
      deal: deal
    });
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_DEAL_FAILED',
      message: 'Failed to create deal'
    });
  }
});

// GET /api/v1/sales/deals/:id - Get specific deal
router.get('/deals/:id', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'DEAL_NOT_FOUND',
        message: 'Deal not found'
      });
    }
    
    res.json({
      success: true,
      deal: deal
    });
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_DEAL_FAILED',
      message: 'Failed to fetch deal'
    });
  }
});

// PATCH /api/v1/sales/deals/:id - Update deal
router.patch('/deals/:id', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'DEAL_NOT_FOUND',
        message: 'Deal not found'
      });
    }
    
    await deal.update(req.body);
    
    res.json({
      success: true,
      deal: deal
    });
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_DEAL_FAILED',
      message: 'Failed to update deal'
    });
  }
});

// ============================================================================
// CONTRACTS ROUTES
// ============================================================================

// POST /api/v1/sales/contracts/draft - Generate contract draft
router.post('/contracts/draft', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const { leadId, templateId, fillFields } = req.body;
    
    // Generate draft PDF (simplified - in production, use proper PDF generation)
    const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const draftPdfUrl = `https://s3.example.com/contracts/drafts/${draftId}.pdf`;
    
    const contract = await Contract.create({
      leadId,
      templateId,
      draftPdfUrl,
      status: 'draft'
    });
    
    res.json({
      success: true,
      draftId: draftId,
      draftPdfUrl: draftPdfUrl,
      contract: contract
    });
  } catch (error) {
    console.error('Error generating contract draft:', error);
    res.status(500).json({
      success: false,
      error: 'GENERATE_DRAFT_FAILED',
      message: 'Failed to generate contract draft'
    });
  }
});

// POST /api/v1/sales/contracts/upload - Upload signed contract
router.post('/contracts/upload', authorize(['sales_rep', 'sales_manager', 'admin']), upload.single('signedPdf'), async (req, res) => {
  try {
    const { contractId, signedDate, repId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'NO_FILE_UPLOADED',
        message: 'No PDF file uploaded'
      });
    }
    
    const signedPdfUrl = `https://s3.example.com/contracts/signed/${req.file.filename}`;
    
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'CONTRACT_NOT_FOUND',
        message: 'Contract not found'
      });
    }
    
    contract.signedPdfUrl = signedPdfUrl;
    contract.status = 'signed_uploaded';
    contract.metadata = {
      ...contract.metadata,
      signedDate: new Date(signedDate),
      repId: repId
    };
    
    await contract.save();
    
    // Create approval record for legal review
    await Approval.create({
      resourceType: 'contract',
      resourceId: contractId,
      requesterId: repId,
      approverRole: 'legal',
      status: 'pending'
    });
    
    res.json({
      success: true,
      signedPdfUrl: signedPdfUrl,
      status: 'signed_uploaded'
    });
  } catch (error) {
    console.error('Error uploading signed contract:', error);
    res.status(500).json({
      success: false,
      error: 'UPLOAD_CONTRACT_FAILED',
      message: 'Failed to upload signed contract'
    });
  }
});

// GET /api/v1/sales/contracts - Get contracts
router.get('/contracts', authorize(['sales_rep', 'sales_manager', 'legal', 'admin']), async (req, res) => {
  try {
    const { status, leadId, partnerId } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (leadId) filter.leadId = leadId;
    if (partnerId) filter.partnerId = partnerId;
    
    const contracts = await Contract.find(filter);
    
    res.json({
      success: true,
      contracts: contracts
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_CONTRACTS_FAILED',
      message: 'Failed to fetch contracts'
    });
  }
});

// GET /api/v1/sales/contracts/:id - Get specific contract
router.get('/contracts/:id', authorize(['sales_rep', 'sales_manager', 'legal', 'admin']), async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'CONTRACT_NOT_FOUND',
        message: 'Contract not found'
      });
    }
    
    res.json({
      success: true,
      contract: contract
    });
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_CONTRACT_FAILED',
      message: 'Failed to fetch contract'
    });
  }
});

// PATCH /api/v1/sales/contracts/:id/status - Update contract status (legal approval)
router.patch('/contracts/:id/status', authorize(['legal', 'admin']), async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'CONTRACT_NOT_FOUND',
        message: 'Contract not found'
      });
    }
    
    await contract.updateStatus(status, req.salesUser.id, reason);
    
    // Update approval record
    const approval = await Approval.findOne({ resourceId: req.params.id, resourceType: 'contract' });
    if (approval) {
      await approval.updateStatus(status, req.salesUser.id, reason);
    }
    
    res.json({
      success: true,
      contract: contract
    });
  } catch (error) {
    console.error('Error updating contract status:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_CONTRACT_STATUS_FAILED',
      message: 'Failed to update contract status'
    });
  }
});

// ============================================================================
// PARTNERS ROUTES
// ============================================================================

// POST /api/v1/partners/create - Create new partner
router.post('/partners/create', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const partnerData = {
      ...req.body,
      createdBy: req.salesUser.id
    };
    
    const partner = await SalesPartner.create(partnerData);
    
    res.status(201).json({
      success: true,
      partner: partner
    });
  } catch (error) {
    console.error('Error creating partner:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_PARTNER_FAILED',
      message: 'Failed to create partner'
    });
  }
});

// POST /api/v1/partners/sync - Sync partner inventory
router.post('/partners/sync', authorize(['sales_manager', 'admin']), async (req, res) => {
  try {
    const { partnerId } = req.body;
    
    const partner = await SalesPartner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'PARTNER_NOT_FOUND',
        message: 'Partner not found'
      });
    }
    
    await partner.syncInventory();
    
    res.json({
      success: true,
      message: 'Partner inventory synced successfully'
    });
  } catch (error) {
    console.error('Error syncing partner:', error);
    res.status(500).json({
      success: false,
      error: 'SYNC_PARTNER_FAILED',
      message: 'Failed to sync partner'
    });
  }
});

// GET /api/v1/partners - Get partners
router.get('/partners', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const { status, type } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const partners = await SalesPartner.find(filter);
    
    res.json({
      success: true,
      partners: partners
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_PARTNERS_FAILED',
      message: 'Failed to fetch partners'
    });
  }
});

// GET /api/v1/partners/:id - Get specific partner
router.get('/partners/:id', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const partner = await SalesPartner.findById(req.params.id);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'PARTNER_NOT_FOUND',
        message: 'Partner not found'
      });
    }
    
    res.json({
      success: true,
      partner: partner
    });
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_PARTNER_FAILED',
      message: 'Failed to fetch partner'
    });
  }
});

// PATCH /api/v1/partners/:id - Update partner
router.patch('/partners/:id', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const partner = await SalesPartner.findById(req.params.id);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'PARTNER_NOT_FOUND',
        message: 'Partner not found'
      });
    }
    
    await partner.update(req.body);
    
    res.json({
      success: true,
      partner: partner
    });
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_PARTNER_FAILED',
      message: 'Failed to update partner'
    });
  }
});

// ============================================================================
// COMMUNICATION & ACTIVITIES ROUTES
// ============================================================================

// POST /api/v1/sales/communications - Create communication record
router.post('/communications', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const communicationData = {
      ...req.body,
      createdBy: req.salesUser.id
    };
    
    const communication = await Communication.create(communicationData);
    
    res.status(201).json({
      success: true,
      communication: communication
    });
  } catch (error) {
    console.error('Error creating communication:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_COMMUNICATION_FAILED',
      message: 'Failed to create communication record'
    });
  }
});

// GET /api/v1/sales/communications - Get communications
router.get('/communications', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const { targetId, type, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (targetId) filter.targetId = targetId;
    if (type) filter.type = type;
    
    const communications = await Communication.find(filter, { skip: parseInt(skip), limit: parseInt(limit) });
    
    res.json({
      success: true,
      communications: communications
    });
  } catch (error) {
    console.error('Error fetching communications:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_COMMUNICATIONS_FAILED',
      message: 'Failed to fetch communications'
    });
  }
});

// POST /api/v1/sales/activities - Create sales activity
router.post('/activities', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const activityData = {
      ...req.body,
      userId: req.salesUser.id
    };
    
    const activity = await SalesActivity.create(activityData);
    
    res.status(201).json({
      success: true,
      activity: activity
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_ACTIVITY_FAILED',
      message: 'Failed to create activity'
    });
  }
});

// GET /api/v1/sales/activities - Get sales activities
router.get('/activities', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const { userId, date, limit = 20 } = req.query;
    
    const filter = {};
    if (userId) filter.userId = userId;
    if (date) filter.date = new Date(date);
    
    const activities = await SalesActivity.find(filter, { limit: parseInt(limit) });
    
    res.json({
      success: true,
      activities: activities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ACTIVITIES_FAILED',
      message: 'Failed to fetch activities'
    });
  }
});

// ============================================================================
// APPROVALS & WORKFLOWS ROUTES
// ============================================================================

// POST /api/v1/sales/approvals - Create approval request
router.post('/approvals', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const approvalData = {
      ...req.body,
      requesterId: req.salesUser.id
    };
    
    const approval = await Approval.create(approvalData);
    
    res.status(201).json({
      success: true,
      approval: approval
    });
  } catch (error) {
    console.error('Error creating approval:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_APPROVAL_FAILED',
      message: 'Failed to create approval request'
    });
  }
});

// GET /api/v1/sales/approvals - Get approvals
router.get('/approvals', authorize(['sales_manager', 'legal', 'admin']), async (req, res) => {
  try {
    const { status, approverRole } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (approverRole) filter.approverRole = approverRole;
    
    const approvals = await Approval.find(filter);
    
    res.json({
      success: true,
      approvals: approvals
    });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_APPROVALS_FAILED',
      message: 'Failed to fetch approvals'
    });
  }
});

// PATCH /api/v1/sales/approvals/:id - Approve/reject approval
router.patch('/approvals/:id', authorize(['sales_manager', 'legal', 'admin']), async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    const approval = await Approval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({
        success: false,
        error: 'APPROVAL_NOT_FOUND',
        message: 'Approval not found'
      });
    }
    
    await approval.updateStatus(status, req.salesUser.id, reason);
    
    res.json({
      success: true,
      approval: approval
    });
  } catch (error) {
    console.error('Error updating approval:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_APPROVAL_FAILED',
      message: 'Failed to update approval'
    });
  }
});

// GET /api/v1/sales/approvals/:id/history - Get approval history
router.get('/approvals/:id/history', authorize(['sales_manager', 'legal', 'admin']), async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id);
    
    if (!approval) {
      return res.status(404).json({
        success: false,
        error: 'APPROVAL_NOT_FOUND',
        message: 'Approval not found'
      });
    }
    
    res.json({
      success: true,
      history: approval.history
    });
  } catch (error) {
    console.error('Error fetching approval history:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_APPROVAL_HISTORY_FAILED',
      message: 'Failed to fetch approval history'
    });
  }
});

// ============================================================================
// PERFORMANCE & REPORTS ROUTES
// ============================================================================

// GET /api/v1/sales/performance/team - Get team performance
router.get('/performance/team', authorize(['sales_manager', 'admin']), async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    const metrics = await PerformanceMetric.getTeamMetrics('sales', period);
    
    res.json({
      success: true,
      metrics: metrics
    });
  } catch (error) {
    console.error('Error fetching team performance:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_TEAM_PERFORMANCE_FAILED',
      message: 'Failed to fetch team performance'
    });
  }
});

// GET /api/v1/sales/performance/individual/:userId - Get individual performance
router.get('/performance/individual/:userId', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const { userId } = req.params;
    
    // Check if user can access this data
    if (req.salesUser.role === 'sales_rep' && req.salesUser.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'You can only view your own performance data'
      });
    }
    
    const metrics = await PerformanceMetric.find({ userId, period });
    
    res.json({
      success: true,
      metrics: metrics
    });
  } catch (error) {
    console.error('Error fetching individual performance:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_INDIVIDUAL_PERFORMANCE_FAILED',
      message: 'Failed to fetch individual performance'
    });
  }
});

// GET /api/v1/sales/performance/hr - Get HR performance data
router.get('/performance/hr', authorize(['hr', 'admin']), async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    const metrics = await PerformanceMetric.find({ period });
    
    res.json({
      success: true,
      metrics: metrics
    });
  } catch (error) {
    console.error('Error fetching HR performance:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_HR_PERFORMANCE_FAILED',
      message: 'Failed to fetch HR performance data'
    });
  }
});

// GET /api/v1/sales/reports - Get sales reports
router.get('/reports', authorize(['sales_manager', 'admin']), async (req, res) => {
  try {
    const { reportType } = req.query;
    
    let reportData = {};
    
    switch (reportType) {
      case 'conversion':
        const leadStats = await Lead.getStats();
        const dealStats = await Deal.getStats();
        reportData = { leadStats, dealStats };
        break;
      case 'revenue':
        const revenueStats = await Deal.getStats();
        reportData = { revenueStats };
        break;
      case 'partners':
        const partnerStats = await SalesPartner.getStats();
        reportData = { partnerStats };
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'INVALID_REPORT_TYPE',
          message: 'Invalid report type'
        });
    }
    
    res.json({
      success: true,
      reportType: reportType,
      data: reportData
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      error: 'GENERATE_REPORT_FAILED',
      message: 'Failed to generate report'
    });
  }
});

// ============================================================================
// UTILITY ROUTES
// ============================================================================

// GET /api/v1/sales/templates - Get contract templates
router.get('/templates', authorize(['sales_rep', 'sales_manager', 'admin']), async (req, res) => {
  try {
    // In production, this would fetch from a templates collection
    const templates = [
      {
        id: 'tpl_partner_standard',
        name: 'Standard Partner Agreement',
        description: 'Standard partnership agreement template'
      },
      {
        id: 'tpl_partner_premium',
        name: 'Premium Partner Agreement',
        description: 'Premium partnership agreement with additional terms'
      }
    ];
    
    res.json({
      success: true,
      templates: templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_TEMPLATES_FAILED',
      message: 'Failed to fetch templates'
    });
  }
});

// GET /api/v1/sales/currency - Get currency information
router.get('/currency', (req, res) => {
  res.json({
    success: true,
    currency: 'EGP',
    symbol: 'EGP'
  });
});

module.exports = router;
