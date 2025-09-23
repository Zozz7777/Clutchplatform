const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const JobApproval = require('../models/JobApproval');
const EmailTemplate = require('../models/EmailTemplate');
const Employee = require('../models/Employee');
const { sendEmail } = require('../services/emailService');
const { generateSlug } = require('../utils/helpers');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/careers');
    await fs.ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// ==================== PUBLIC ROUTES (No Authentication Required) ====================

// Get all published jobs with search and filters
router.get('/jobs', [
  query('search').optional().isString().trim(),
  query('department').optional().isString(),
  query('location').optional().isString(),
  query('employmentType').optional().isString(),
  query('experienceLevel').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const {
      search,
      department,
      location,
      employmentType,
      experienceLevel,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = {
      status: 'published',
      $or: [
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: { $gt: new Date() } }
      ],
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gt: new Date() } }
      ]
    };

    // Add search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Add other filters
    if (department) filter.department = department;
    if (employmentType) filter.employmentType = employmentType;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (location) filter['locations.city'] = location;

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('hiringManager', 'basicInfo.firstName basicInfo.lastName')
        .sort({ publishedDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Job.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

// Get featured jobs
router.get('/jobs/featured', async (req, res) => {
  try {
    const featuredJobs = await Job.findFeaturedJobs()
      .populate('hiringManager', 'basicInfo.firstName basicInfo.lastName')
      .limit(5);

    res.json({
      success: true,
      data: { jobs: featuredJobs }
    });
  } catch (error) {
    console.error('Error fetching featured jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured jobs',
      error: error.message
    });
  }
});

// Get single job by slug
router.get('/jobs/:slug', async (req, res) => {
  try {
    const job = await Job.findOne({ slug: req.params.slug, status: 'published' })
      .populate('hiringManager', 'basicInfo.firstName basicInfo.lastName')
      .populate('recruiters', 'basicInfo.firstName basicInfo.lastName');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    await job.incrementViews();

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message
    });
  }
});

// Submit job application
router.post('/jobs/:jobId/apply', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'coverLetter', maxCount: 1 },
  { name: 'portfolio', maxCount: 1 }
]), [
  body('candidate.firstName').notEmpty().trim(),
  body('candidate.lastName').notEmpty().trim(),
  body('candidate.email').isEmail().normalizeEmail(),
  body('candidate.phone').optional().isString().trim(),
  body('consent.dataProcessing').isBoolean().custom(value => value === true),
  body('consent.communication').isBoolean().custom(value => value === true)
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

    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);

    if (!job || job.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not available for applications'
      });
    }

    // Check if job is still accepting applications
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check for duplicate applications
    const existingApplication = await JobApplication.findOne({
      job: jobId,
      'candidate.email': req.body.candidate.email
    });

    if (existingApplication && !job.applicationSettings.allowMultipleApplications) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this position'
      });
    }

    // Prepare application data
    const applicationData = {
      job: jobId,
      candidate: req.body.candidate,
      customAnswers: req.body.customAnswers || [],
      consent: {
        ...req.body.consent,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      source: {
        type: 'careers_page',
        utm_source: req.query.utm_source,
        utm_medium: req.query.utm_medium,
        utm_campaign: req.query.utm_campaign
      }
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.resume) {
        applicationData.resume = {
          filename: req.files.resume[0].filename,
          originalName: req.files.resume[0].originalname,
          url: `/uploads/careers/${req.files.resume[0].filename}`,
          size: req.files.resume[0].size
        };
      }
      if (req.files.coverLetter) {
        applicationData.coverLetter = {
          filename: req.files.coverLetter[0].filename,
          originalName: req.files.coverLetter[0].originalname,
          url: `/uploads/careers/${req.files.coverLetter[0].filename}`,
          size: req.files.coverLetter[0].size
        };
      }
      if (req.files.portfolio) {
        applicationData.portfolio = {
          filename: req.files.portfolio[0].filename,
          originalName: req.files.portfolio[0].originalname,
          url: `/uploads/careers/${req.files.portfolio[0].filename}`,
          size: req.files.portfolio[0].size
        };
      }
    }

    // Create application
    const application = new JobApplication(applicationData);
    await application.save();

    // Increment job application count
    await job.incrementApplications();

    // Send confirmation email to candidate
    try {
      const template = await EmailTemplate.findDefaultTemplate('application_received');
      if (template) {
        const rendered = template.renderTemplate({
          candidateName: `${req.body.candidate.firstName} ${req.body.candidate.lastName}`,
          jobTitle: job.title,
          companyName: 'Clutch',
          applicationId: application.applicationId
        });

        await sendEmail({
          to: req.body.candidate.email,
          subject: rendered.subject,
          html: rendered.htmlContent,
          text: rendered.textContent
        });

        await application.addEmailRecord({
          type: 'application_received',
          subject: rendered.subject,
          content: rendered.htmlContent,
          template: template.name
        });
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    // Notify HR team
    try {
      const hrTeam = await Employee.find({
        $or: [
          { role: 'hr_manager' },
          { role: 'hr' },
          { 'roles': { $in: await Employee.distinct('_id', { role: 'hr_manager' }) } }
        ],
        isActive: true
      });

      for (const hrMember of hrTeam) {
        await sendEmail({
          to: hrMember.basicInfo.email,
          subject: `New Job Application: ${job.title}`,
          html: `
            <h2>New Job Application Received</h2>
            <p><strong>Job:</strong> ${job.title}</p>
            <p><strong>Candidate:</strong> ${req.body.candidate.firstName} ${req.body.candidate.lastName}</p>
            <p><strong>Email:</strong> ${req.body.candidate.email}</p>
            <p><strong>Application ID:</strong> ${application.applicationId}</p>
            <p><a href="${process.env.ADMIN_URL}/hr?tab=recruitment&application=${application._id}">View Application</a></p>
          `
        });
      }
    } catch (notificationError) {
      console.error('Error notifying HR team:', notificationError);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application.applicationId,
        application: application
      }
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
});

// ==================== ADMIN ROUTES (Authentication Required) ====================

// Get all jobs for admin (with all statuses)
router.get('/admin/jobs', auth, checkPermission('hr'), [
  query('status').optional().isString(),
  query('department').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const { status, department, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (department) filter.department = department;

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('hiringManager', 'basicInfo.firstName basicInfo.lastName')
        .populate('metadata.createdBy', 'basicInfo.firstName basicInfo.lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Job.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

// Create new job
router.post('/admin/jobs', auth, checkPermission('hr'), [
  body('title').notEmpty().trim(),
  body('department').notEmpty().isString(),
  body('description').notEmpty().trim(),
  body('employmentType').isIn(['full-time', 'part-time', 'contract', 'internship', 'temporary']),
  body('experienceLevel').isIn(['entry', 'junior', 'mid-level', 'senior', 'lead', 'executive']),
  body('salary.min').isNumeric(),
  body('salary.max').isNumeric(),
  body('hiringManager').isMongoId()
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

    const jobData = {
      ...req.body,
      metadata: {
        createdBy: req.user.id
      }
    };

    const job = new Job(jobData);
    await job.save();

    // Create approval workflow if job is not draft
    if (req.body.status && req.body.status !== 'draft') {
      const approval = new JobApproval({
        job: job._id,
        workflow: 'draft_to_manager',
        currentApprover: req.body.hiringManager,
        metadata: {
          createdBy: req.user.id
        }
      });
      await approval.save();
    }

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: error.message
    });
  }
});

// Update job
router.put('/admin/jobs/:id', auth, checkPermission('hr'), [
  body('title').optional().notEmpty().trim(),
  body('department').optional().notEmpty().isString(),
  body('description').optional().notEmpty().trim()
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

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check permissions
    const canEdit = req.user.role === 'hr_manager' || 
                   req.user.role === 'admin' || 
                   job.metadata.createdBy.toString() === req.user.id;

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this job'
      });
    }

    const updateData = {
      ...req.body,
      'metadata.updatedBy': req.user.id,
      'metadata.lastUpdated': new Date()
    };

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: error.message
    });
  }
});

// Delete job
router.delete('/admin/jobs/:id', auth, checkPermission('hr'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check permissions
    const canDelete = req.user.role === 'hr_manager' || 
                     req.user.role === 'admin' || 
                     job.metadata.createdBy.toString() === req.user.id;

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message
    });
  }
});

// Get job applications
router.get('/admin/applications', auth, checkPermission('hr'), [
  query('jobId').optional().isMongoId(),
  query('status').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const { jobId, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (jobId) filter.job = jobId;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      JobApplication.find(filter)
        .populate('job', 'title department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      JobApplication.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Get single application
router.get('/admin/applications/:id', auth, checkPermission('hr'), async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id)
      .populate('job', 'title department description requirements')
      .populate('interviews.interviewer', 'basicInfo.firstName basicInfo.lastName')
      .populate('notes.createdBy', 'basicInfo.firstName basicInfo.lastName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: { application }
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message
    });
  }
});

// Update application status
router.put('/admin/applications/:id/status', auth, checkPermission('hr'), [
  body('status').isIn(['applied', 'screened', 'interview_scheduled', 'interview_completed', 'offer_made', 'hired', 'rejected', 'withdrawn']),
  body('notes').optional().isString()
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

    const application = await JobApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const { status, notes } = req.body;

    // Update status
    application.status = status;

    // Add note if provided
    if (notes) {
      await application.addNote(notes, 'general', req.user.id, false);
    }

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
});

// Get approval workflows
router.get('/admin/approvals', auth, checkPermission('hr'), async (req, res) => {
  try {
    const approvals = await JobApproval.find({ status: 'pending' })
      .populate('job', 'title department')
      .populate('currentApprover', 'basicInfo.firstName basicInfo.lastName')
      .populate('metadata.createdBy', 'basicInfo.firstName basicInfo.lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { approvals }
    });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approvals',
      error: error.message
    });
  }
});

// Approve job
router.post('/admin/approvals/:id/approve', auth, checkPermission('hr'), [
  body('comments').optional().isString()
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

    const approval = await JobApproval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({
        success: false,
        message: 'Approval not found'
      });
    }

    // Check if user is the current approver
    if (approval.currentApprover.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to approve this job'
      });
    }

    await approval.approve(req.user.id, req.body.comments);

    // If fully approved, update job status
    if (approval.status === 'approved') {
      const job = await Job.findById(approval.job);
      if (job) {
        await job.approveByHRAdmin(req.user.id);
      }
    }

    res.json({
      success: true,
      message: 'Job approved successfully',
      data: { approval }
    });
  } catch (error) {
    console.error('Error approving job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve job',
      error: error.message
    });
  }
});

// Reject job
router.post('/admin/approvals/:id/reject', auth, checkPermission('hr'), [
  body('comments').notEmpty().isString()
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

    const approval = await JobApproval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({
        success: false,
        message: 'Approval not found'
      });
    }

    // Check if user is the current approver
    if (approval.currentApprover.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this job'
      });
    }

    await approval.reject(req.user.id, req.body.comments);

    // Update job status
    const job = await Job.findById(approval.job);
    if (job) {
      await job.rejectJob(req.user.id, req.body.comments);
    }

    res.json({
      success: true,
      message: 'Job rejected successfully',
      data: { approval }
    });
  } catch (error) {
    console.error('Error rejecting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject job',
      error: error.message
    });
  }
});

// Get careers analytics
router.get('/admin/analytics', auth, checkPermission('hr'), async (req, res) => {
  try {
    const [
      totalJobs,
      publishedJobs,
      totalApplications,
      pendingApplications,
      jobStats,
      applicationStats
    ] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: 'published' }),
      JobApplication.countDocuments(),
      JobApplication.countDocuments({ status: 'applied' }),
      Job.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      JobApplication.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalJobs,
        publishedJobs,
        totalApplications,
        pendingApplications,
        jobStats,
        applicationStats
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

module.exports = router;
