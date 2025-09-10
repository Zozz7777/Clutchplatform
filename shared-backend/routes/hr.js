const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { validate } = require('../middleware/inputValidation');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');

// Rate limiting for HR endpoints
const hrRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many HR requests from this IP, please try again later.'
});

// Apply rate limiting to all HR routes
router.use(hrRateLimit);

// ==================== EMPLOYEE MANAGEMENT ====================

// Get all employees
router.get('/employees', authenticateToken, requireRole(['admin', 'hr_manager', 'hr']), async (req, res) => {
  try {
    const { page = 1, limit = 20, department, role, status, search } = req.query;
    
    // Build filters
    const filters = {};
    if (department) filters['employment.department'] = department;
    if (role) filters.role = role;
    if (status) filters.status = status;
    if (search) {
      filters.$or = [
        { 'basicInfo.firstName': { $regex: search, $options: 'i' } },
        { 'basicInfo.lastName': { $regex: search, $options: 'i' } },
        { 'basicInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    const collection = await getCollection('employees');
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const employees = await collection.find(filters, {
      projection: {
        password: 0,
        sessionToken: 0,
        sessionExpiry: 0
      }
    })
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ 'basicInfo.firstName': 1 })
    .toArray();

    const total = await collection.countDocuments(filters);

    res.json({
      success: true,
      data: employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting employees:', error);
    res.status(500).json({
      success: false,
      error: 'GET_EMPLOYEES_FAILED',
      message: 'Failed to retrieve employees'
    });
  }
});

// Create new employee
router.post('/employees', authenticateToken, requireRole(['admin', 'hr_manager']), async (req, res) => {
  try {
    const { basicInfo, employment, role, permissions } = req.body;
    
    if (!basicInfo?.email || !basicInfo?.firstName || !basicInfo?.lastName) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Email, firstName, and lastName are required'
      });
    }

    const collection = await getCollection('employees');
    
    // Check if email already exists
    const existingEmployee = await collection.findOne({ 'basicInfo.email': basicInfo.email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        error: 'EMAIL_ALREADY_EXISTS',
        message: 'Employee with this email already exists'
      });
    }

    // Generate employee ID
    const employeeCount = await collection.countDocuments();
    const employeeId = `EMP${String(employeeCount + 1).padStart(4, '0')}`;

    const newEmployee = {
      employeeId,
      basicInfo: {
        firstName: basicInfo.firstName,
        lastName: basicInfo.lastName,
        email: basicInfo.email,
        phone: basicInfo.phone || '',
        dateOfBirth: basicInfo.dateOfBirth || null,
        gender: basicInfo.gender || 'prefer_not_to_say',
        profilePicture: basicInfo.profilePicture || null
      },
      employment: {
        department: employment?.department || 'General',
        position: employment?.position || '',
        jobTitle: employment?.jobTitle || '',
        employmentType: employment?.employmentType || 'full_time',
        startDate: employment?.startDate || new Date(),
        salary: employment?.salary || 0,
        currency: employment?.currency || 'USD',
        benefits: employment?.benefits || []
      },
      role: role || 'employee',
      permissions: permissions || [],
      isActive: true,
      createdAt: new Date(),
      createdBy: req.user.userId
    };

    const result = await collection.insertOne(newEmployee);
    newEmployee._id = result.insertedId;

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: newEmployee
    });
  } catch (error) {
    logger.error('Error creating employee:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_EMPLOYEE_FAILED',
      message: 'Failed to create employee'
    });
  }
});

// Update employee
router.put('/employees/:id', authenticateToken, requireRole(['admin', 'hr_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_UPDATE_FIELDS',
        message: 'At least one field to update is required'
      });
    }

    const collection = await getCollection('employees');
    
    // Check if employee exists
    const existingEmployee = await collection.findOne({ _id: id });
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        error: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee not found'
      });
    }

    // Prepare update data
    const updateFields = {};
    if (updateData.basicInfo) updateFields.basicInfo = updateData.basicInfo;
    if (updateData.employment) updateFields.employment = updateData.employment;
    if (updateData.role) updateFields.role = updateData.role;
    if (updateData.permissions) updateFields.permissions = updateData.permissions;
    if (updateData.isActive !== undefined) updateFields.isActive = updateData.isActive;
    
    updateFields.updatedAt = new Date();
    updateFields.updatedBy = req.user.userId;

    const result = await collection.updateOne(
      { _id: id },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: { id, ...updateFields }
    });
  } catch (error) {
    logger.error('Error updating employee:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_EMPLOYEE_FAILED',
      message: 'Failed to update employee'
    });
  }
});

// Delete employee
router.delete('/employees/:id', authenticateToken, requireRole(['admin', 'hr_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const collection = await getCollection('employees');
    
    // Check if employee exists
    const existingEmployee = await collection.findOne({ _id: id });
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        error: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee not found'
      });
    }

    // Soft delete - mark as inactive instead of hard delete
    const result = await collection.updateOne(
      { _id: id },
      { 
        $set: { 
          isActive: false, 
          deletedAt: new Date(),
          deletedBy: req.user.userId
        }
      }
    );

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_EMPLOYEE_FAILED',
      message: 'Failed to delete employee'
    });
  }
});

// Get employee by ID
router.get('/employees/:id', authenticateToken, requireRole(['admin', 'hr_manager', 'hr']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const collection = await getCollection('employees');
    const employee = await collection.findOne(
      { _id: id },
      { projection: { password: 0, sessionToken: 0, sessionExpiry: 0 } }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    logger.error('Error getting employee:', error);
    res.status(500).json({
      success: false,
      error: 'GET_EMPLOYEE_FAILED',
      message: 'Failed to retrieve employee'
    });
  }
});

// ==================== DEPARTMENT MANAGEMENT ====================

// Get all departments
router.get('/departments', authenticateToken, async (req, res) => {
  try {
    const departments = [
      { id: 'executive', name: 'Executive', description: 'Executive management team' },
      { id: 'hr', name: 'Human Resources', description: 'HR and people management' },
      { id: 'finance', name: 'Finance', description: 'Financial operations and accounting' },
      { id: 'operations', name: 'Operations', description: 'Business operations and processes' },
      { id: 'marketing', name: 'Marketing', description: 'Marketing and communications' },
      { id: 'technology', name: 'Technology', description: 'IT and technical operations' },
      { id: 'sales', name: 'Sales', description: 'Sales and business development' },
      { id: 'customer_service', name: 'Customer Service', description: 'Customer support and service' },
      { id: 'legal', name: 'Legal', description: 'Legal and compliance' },
      { id: 'compliance', name: 'Compliance', description: 'Regulatory compliance' },
      { id: 'general', name: 'General', description: 'General administration' }
    ];

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    logger.error('Error getting departments:', error);
    res.status(500).json({
      success: false,
      error: 'GET_DEPARTMENTS_FAILED',
      message: 'Failed to retrieve departments'
    });
  }
});

// ==================== HR ANALYTICS ====================

// Get HR analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'hr_manager']), async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const collection = await getCollection('employees');
    
    // Get employee count by department
    const departmentStats = await collection.aggregate([
      { $group: { _id: '$employment.department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    // Get employee count by role
    const roleStats = await collection.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    // Get employment type distribution
    const employmentTypeStats = await collection.aggregate([
      { $group: { _id: '$employment.employmentType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    // Get recent hires
    const recentHires = await collection.find(
      { 'employment.startDate': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      { projection: { 'basicInfo.firstName': 1, 'basicInfo.lastName': 1, 'employment.startDate': 1, 'employment.department': 1 } }
    )
    .sort({ 'employment.startDate': -1 })
    .limit(10)
    .toArray();

    const analytics = {
      totalEmployees: await collection.countDocuments({ isActive: true }),
      departmentDistribution: departmentStats,
      roleDistribution: roleStats,
      employmentTypeDistribution: employmentTypeStats,
      recentHires,
      period
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error getting HR analytics:', error);
    res.status(500).json({
      success: false,
      error: 'GET_HR_ANALYTICS_FAILED',
      message: 'Failed to retrieve HR analytics'
    });
  }
});

module.exports = router;
