const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Staff Roles
const STAFF_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  STAFF: 'staff',
  ACCOUNTANT: 'accountant',
  HR: 'hr'
};

// Staff Status
const STAFF_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  TERMINATED: 'terminated',
  ON_LEAVE: 'on_leave'
};

// Employment Types
const EMPLOYMENT_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  INTERN: 'intern'
};

// Add staff member
router.post('/staff', [
  auth,
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('role').isIn(Object.values(STAFF_ROLES)).withMessage('Invalid role'),
  body('employmentType').optional().isIn(Object.values(EMPLOYMENT_TYPES)).withMessage('Invalid employment type'),
  body('department').optional().isString().withMessage('Department must be a string'),
  body('position').optional().isString().withMessage('Position must be a string'),
  body('salary').optional().isNumeric().withMessage('Salary must be numeric'),
  body('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  body('address').optional().isObject().withMessage('Address must be an object'),
  body('emergencyContact').optional().isObject().withMessage('Emergency contact must be an object')
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

    const { 
      email, password, firstName, lastName, phone, role, employmentType, 
      department, position, salary, startDate, address, emergencyContact 
    } = req.body;
    const createdBy = req.user._id;

    // Check user permissions
    const creator = await PartnerUser.findById(createdBy);
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const creatorRole = creator.role || 'staff';
    if (!['owner', 'manager', 'hr'].includes(creatorRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to add staff members'
      });
    }

    // Check if email already exists
    const existingUser = await PartnerUser.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate staff ID
    const staffId = `STAFF_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    // Create staff member data
    const staffData = {
      id: staffId,
      email: email,
      password: password, // In real app, this should be hashed
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      role: role,
      employmentType: employmentType || EMPLOYMENT_TYPES.FULL_TIME,
      department: department || null,
      position: position || null,
      salary: salary || null,
      startDate: startDate ? new Date(startDate) : new Date(),
      address: address || null,
      emergencyContact: emergencyContact || null,
      status: STAFF_STATUS.ACTIVE,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: createdBy,
      lastLogin: null,
      profilePicture: null,
      documents: [],
      performance: {
        rating: null,
        lastReview: null,
        nextReview: null
      }
    };

    // Create new user
    const newStaff = new PartnerUser(staffData);
    await newStaff.save();

    // Add to creator's staff list
    if (!creator.staffMembers) {
      creator.staffMembers = [];
    }
    creator.staffMembers.push({
      staffId: staffId,
      email: email,
      name: `${firstName} ${lastName}`,
      role: role,
      status: STAFF_STATUS.ACTIVE,
      addedAt: new Date()
    });
    await creator.save();

    logger.info(`Staff member added: ${staffId}`, {
      createdBy: createdBy,
      staffEmail: email,
      role: role,
      employmentType: employmentType
    });

    res.json({
      success: true,
      message: 'Staff member added successfully',
      data: {
        staffId: staffId,
        email: email,
        name: `${firstName} ${lastName}`,
        role: role,
        status: STAFF_STATUS.ACTIVE,
        createdAt: staffData.createdAt
      }
    });

  } catch (error) {
    logger.error('Failed to add staff member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add staff member'
    });
  }
});

// Get staff members
router.get('/staff', [
  auth,
  body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  body('status').optional().isIn(Object.values(STAFF_STATUS)).withMessage('Invalid status'),
  body('role').optional().isIn(Object.values(STAFF_ROLES)).withMessage('Invalid role'),
  body('department').optional().isString().withMessage('Department must be a string'),
  body('search').optional().isString().withMessage('Search must be a string')
], async (req, res) => {
  try {
    const { page = 1, limit = 20, status, role, department, search } = req.query;
    const userId = req.user._id;

    // Check user permissions
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || 'staff';
    if (!['owner', 'manager', 'hr'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view staff members'
      });
    }

    // Build query
    const query = {};
    if (status) query.status = status;
    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get staff members
    const staffMembers = await PartnerUser.find(query)
      .select('_id email firstName lastName phone role employmentType department position salary startDate status createdAt lastLogin')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PartnerUser.countDocuments(query);

    // Format staff members for response
    const formattedStaff = staffMembers.map(staff => ({
      id: staff._id,
      email: staff.email,
      firstName: staff.firstName,
      lastName: staff.lastName,
      fullName: `${staff.firstName} ${staff.lastName}`,
      phone: staff.phone,
      role: staff.role,
      employmentType: staff.employmentType,
      department: staff.department,
      position: staff.position,
      salary: staff.salary,
      startDate: staff.startDate,
      status: staff.status,
      createdAt: staff.createdAt,
      lastLogin: staff.lastLogin
    }));

    res.json({
      success: true,
      data: {
        staffMembers: formattedStaff,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get staff members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get staff members'
    });
  }
});

// Update staff member
router.patch('/staff/:staffId', [
  auth,
  body('firstName').optional().isString().withMessage('First name must be a string'),
  body('lastName').optional().isString().withMessage('Last name must be a string'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('role').optional().isIn(Object.values(STAFF_ROLES)).withMessage('Invalid role'),
  body('employmentType').optional().isIn(Object.values(EMPLOYMENT_TYPES)).withMessage('Invalid employment type'),
  body('department').optional().isString().withMessage('Department must be a string'),
  body('position').optional().isString().withMessage('Position must be a string'),
  body('salary').optional().isNumeric().withMessage('Salary must be numeric'),
  body('status').optional().isIn(Object.values(STAFF_STATUS)).withMessage('Invalid status'),
  body('address').optional().isObject().withMessage('Address must be an object'),
  body('emergencyContact').optional().isObject().withMessage('Emergency contact must be an object')
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

    const { staffId } = req.params;
    const updateData = req.body;
    const updatedBy = req.user._id;

    // Check user permissions
    const updater = await PartnerUser.findById(updatedBy);
    if (!updater) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updaterRole = updater.role || 'staff';
    if (!['owner', 'manager', 'hr'].includes(updaterRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update staff members'
      });
    }

    // Find staff member
    const staff = await PartnerUser.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Update staff member
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'role', 'employmentType', 
      'department', 'position', 'salary', 'status', 'address', 'emergencyContact'
    ];

    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        staff[field] = updateData[field];
      }
    });

    staff.updatedAt = new Date();
    await staff.save();

    logger.info(`Staff member updated: ${staffId}`, {
      updatedBy: updatedBy,
      updates: Object.keys(updateData)
    });

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: {
        staffId: staffId,
        name: `${staff.firstName} ${staff.lastName}`,
        role: staff.role,
        status: staff.status,
        updatedAt: staff.updatedAt
      }
    });

  } catch (error) {
    logger.error('Failed to update staff member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update staff member'
    });
  }
});

// Delete staff member
router.delete('/staff/:staffId', [
  auth,
  body('reason').optional().isString().withMessage('Reason must be a string')
], async (req, res) => {
  try {
    const { staffId } = req.params;
    const { reason } = req.body;
    const deletedBy = req.user._id;

    // Check user permissions
    const deleter = await PartnerUser.findById(deletedBy);
    if (!deleter) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const deleterRole = deleter.role || 'staff';
    if (!['owner', 'manager'].includes(deleterRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to delete staff members'
      });
    }

    // Find staff member
    const staff = await PartnerUser.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check if trying to delete self
    if (staffId === deletedBy) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Soft delete - update status to terminated
    staff.status = STAFF_STATUS.TERMINATED;
    staff.terminatedAt = new Date();
    staff.terminatedBy = deletedBy;
    staff.terminationReason = reason || null;
    staff.updatedAt = new Date();
    await staff.save();

    logger.info(`Staff member terminated: ${staffId}`, {
      deletedBy: deletedBy,
      reason: reason,
      staffEmail: staff.email
    });

    res.json({
      success: true,
      message: 'Staff member terminated successfully',
      data: {
        staffId: staffId,
        status: STAFF_STATUS.TERMINATED,
        terminatedAt: staff.terminatedAt
      }
    });

  } catch (error) {
    logger.error('Failed to delete staff member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete staff member'
    });
  }
});

// Get staff member details
router.get('/staff/:staffId', auth, async (req, res) => {
  try {
    const { staffId } = req.params;
    const userId = req.user._id;

    // Check user permissions
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || 'staff';
    if (!['owner', 'manager', 'hr'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view staff details'
      });
    }

    // Find staff member
    const staff = await PartnerUser.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      data: {
        staff: {
          id: staff._id,
          email: staff.email,
          firstName: staff.firstName,
          lastName: staff.lastName,
          phone: staff.phone,
          role: staff.role,
          employmentType: staff.employmentType,
          department: staff.department,
          position: staff.position,
          salary: staff.salary,
          startDate: staff.startDate,
          address: staff.address,
          emergencyContact: staff.emergencyContact,
          status: staff.status,
          isVerified: staff.isVerified,
          createdAt: staff.createdAt,
          updatedAt: staff.updatedAt,
          lastLogin: staff.lastLogin,
          profilePicture: staff.profilePicture,
          documents: staff.documents || [],
          performance: staff.performance || {},
          terminatedAt: staff.terminatedAt,
          terminatedBy: staff.terminatedBy,
          terminationReason: staff.terminationReason
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get staff member details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get staff member details'
    });
  }
});

// Update staff performance
router.patch('/staff/:staffId/performance', [
  auth,
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').notEmpty().withMessage('Review is required'),
  body('goals').optional().isArray().withMessage('Goals must be an array'),
  body('nextReviewDate').optional().isISO8601().withMessage('Next review date must be valid ISO date')
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

    const { staffId } = req.params;
    const { rating, review, goals, nextReviewDate } = req.body;
    const reviewedBy = req.user._id;

    // Check user permissions
    const reviewer = await PartnerUser.findById(reviewedBy);
    if (!reviewer) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const reviewerRole = reviewer.role || 'staff';
    if (!['owner', 'manager', 'hr'].includes(reviewerRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update performance'
      });
    }

    // Find staff member
    const staff = await PartnerUser.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Update performance
    if (!staff.performance) {
      staff.performance = {};
    }

    staff.performance.rating = rating;
    staff.performance.review = review;
    staff.performance.goals = goals || [];
    staff.performance.lastReview = new Date();
    staff.performance.nextReview = nextReviewDate ? new Date(nextReviewDate) : null;
    staff.performance.reviewedBy = reviewedBy;
    staff.updatedAt = new Date();

    await staff.save();

    logger.info(`Staff performance updated: ${staffId}`, {
      reviewedBy: reviewedBy,
      rating: rating,
      nextReviewDate: nextReviewDate
    });

    res.json({
      success: true,
      message: 'Performance updated successfully',
      data: {
        staffId: staffId,
        rating: rating,
        lastReview: staff.performance.lastReview,
        nextReview: staff.performance.nextReview
      }
    });

  } catch (error) {
    logger.error('Failed to update staff performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update staff performance'
    });
  }
});

// Get staff statistics
router.get('/staff/statistics', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Check user permissions
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || 'staff';
    if (!['owner', 'manager', 'hr'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view staff statistics'
      });
    }

    // Get staff statistics
    const totalStaff = await PartnerUser.countDocuments({});
    const activeStaff = await PartnerUser.countDocuments({ status: STAFF_STATUS.ACTIVE });
    const inactiveStaff = await PartnerUser.countDocuments({ status: STAFF_STATUS.INACTIVE });
    const onLeaveStaff = await PartnerUser.countDocuments({ status: STAFF_STATUS.ON_LEAVE });

    // Get role distribution
    const roleDistribution = await PartnerUser.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get department distribution
    const departmentDistribution = await PartnerUser.aggregate([
      { $match: { department: { $exists: true, $ne: null } } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalStaff: totalStaff,
          activeStaff: activeStaff,
          inactiveStaff: inactiveStaff,
          onLeaveStaff: onLeaveStaff
        },
        roleDistribution: roleDistribution,
        departmentDistribution: departmentDistribution
      }
    });

  } catch (error) {
    logger.error('Failed to get staff statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get staff statistics'
    });
  }
});

module.exports = router;
