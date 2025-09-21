/**
 * Employee Management Routes
 * Handles employee registration, management, and admin access
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { getCollection } = require('../config/optimized-database');
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');

// Apply rate limiting
const employeeRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 20 }); // 20 attempts per 15 minutes

// ==================== EMPLOYEE INVITATIONS ====================

// NOTE: Employee invitation endpoint moved to employee-invitations.js
// This ensures proper email sending and invitation management

// GET /api/v1/employees/invitations - Get all employee invitations
router.get('/invitations', authenticateToken, checkRole(['head_administrator', 'hr']), async (req, res) => {
  try {
    const invitationsCollection = await getCollection('employee_invitations');
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (status) filter.status = status;
    
    const invitations = await invitationsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await invitationsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: invitations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get employee invitations error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_EMPLOYEE_INVITATIONS_FAILED',
      message: 'Failed to retrieve employee invitations',
      timestamp: new Date().toISOString()
    });
  }
});

// NOTE: accept-invitation endpoint moved to employee-invitations.js
// This endpoint is handled by the comprehensive implementation in employee-invitations.js

// ==================== EMPLOYEE REGISTRATION ====================

// POST /api/v1/employees/register - Register new employee (admin only)
router.post('/register', authenticateToken, checkRole(['head_administrator', 'hr']), employeeRateLimit, async (req, res) => {
  try {
    const { 
      email, 
      password, 
      name, 
      phoneNumber, 
      role = 'employee',
      department,
      position,
      permissions = ['read']
    } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Email, password, and name are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_EMAIL',
        message: 'Please provide a valid email address',
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'WEAK_PASSWORD',
        message: 'Password must be at least 8 characters long',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if employee already exists
    const usersCollection = await getCollection('users');
    const existingEmployee = await usersCollection.findOne({ email: email.toLowerCase() });
    
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        error: 'EMPLOYEE_EXISTS',
        message: 'Employee with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create employee
    const newEmployee = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      phoneNumber: phoneNumber || null,
      role,
      department: department || null,
      position: position || null,
      permissions,
      isActive: true,
      isEmployee: true,
      createdAt: new Date(),
      createdBy: req.user.userId,
      lastLogin: null,
      profile: {
        avatar: null,
        bio: null,
        skills: [],
        emergencyContact: null
      }
    };
    
    const result = await usersCollection.insertOne(newEmployee);
    
    // Remove password from response
    delete newEmployee.password;
    
    res.status(201).json({
      success: true,
      data: {
        employee: {
          ...newEmployee,
          _id: result.insertedId
        }
      },
      message: 'Employee registered successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Employee registration error:', error);
    res.status(500).json({
      success: false,
      error: 'REGISTRATION_FAILED',
      message: 'Failed to register employee. Please try again.',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== EMPLOYEE MANAGEMENT ====================

// GET /api/v1/employees - Get all employees (admin/hr only)
router.get('/', authenticateToken, checkRole(['head_administrator', 'hr']), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, department, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const usersCollection = await getCollection('users');
    
    // Build filter
    const filter = { isEmployee: true };
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Get employees with pagination
    const [employees, total] = await Promise.all([
      usersCollection
        .find(filter, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      usersCollection.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        employees,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Employees retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_EMPLOYEES_FAILED',
      message: 'Failed to retrieve employees',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/employees/:id - Get employee by ID
router.get('/:id', authenticateToken, checkRole(['head_administrator', 'hr']), async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = await getCollection('users');
    
    // Handle both string and ObjectId formats
    let query = { isEmployee: true };
    try {
      // Try ObjectId first (for MongoDB ObjectIds)
      query._id = new ObjectId(id);
    } catch (error) {
      // Fallback to string comparison (for legacy IDs)
      query._id = id;
    }
    
    const employee = await usersCollection.findOne(
      query,
      { projection: { password: 0 } }
    );
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { employee },
      message: 'Employee retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_EMPLOYEE_FAILED',
      message: 'Failed to retrieve employee',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/employees/:id - Update employee
router.put('/:id', authenticateToken, checkRole(['head_administrator', 'hr', 'hr_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, role, department, position, permissions, isActive } = req.body;
    
    const usersCollection = await getCollection('users');
    
    // Check if employee exists - Handle both string and ObjectId formats
    let query = { isEmployee: true };
    try {
      // Try ObjectId first (for MongoDB ObjectIds)
      query._id = new ObjectId(id);
    } catch (error) {
      // Fallback to string comparison (for legacy IDs)
      query._id = id;
    }
    
    const existingEmployee = await usersCollection.findOne(query);
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        error: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if HR user is trying to edit executive/board level employee
    if ((req.user.role === 'hr' || req.user.role === 'hr_manager') && 
        ['executive', 'head_administrator', 'platform_admin', 'admin'].includes(existingEmployee.role)) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'HR users cannot edit executive or board level employees',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if HR user is trying to assign executive/board level role
    if ((req.user.role === 'hr' || req.user.role === 'hr_manager') && 
        role && ['executive', 'head_administrator', 'platform_admin', 'admin'].includes(role)) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'HR users cannot assign executive or board level roles',
        timestamp: new Date().toISOString()
      });
    }
    
    // Build update object
    const updateData = {
      updatedAt: new Date(),
      updatedBy: req.user.userId
    };
    
    if (name) updateData.name = name;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (role) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (position !== undefined) updateData.position = position;
    if (permissions) updateData.permissions = permissions;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const result = await usersCollection.updateOne(
      query,
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'No changes made to employee',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get updated employee
    const updatedEmployee = await usersCollection.findOne(
      { _id: id, isEmployee: true },
      { projection: { password: 0 } }
    );
    
    res.json({
      success: true,
      data: { employee: updatedEmployee },
      message: 'Employee updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_EMPLOYEE_FAILED',
      message: 'Failed to update employee',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/employees/:id - Deactivate employee (soft delete)
router.delete('/:id', authenticateToken, checkRole(['head_administrator']), async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = await getCollection('users');
    
    // Check if employee exists
    const existingEmployee = await usersCollection.findOne({ _id: id, isEmployee: true });
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        error: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Soft delete - deactivate employee
    const result = await usersCollection.updateOne(
      { _id: id, isEmployee: true },
      { 
        $set: { 
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: req.user.userId
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'DEACTIVATION_FAILED',
        message: 'Failed to deactivate employee',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Employee deactivated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Deactivate employee error:', error);
    res.status(500).json({
      success: false,
      error: 'DEACTIVATE_EMPLOYEE_FAILED',
      message: 'Failed to deactivate employee',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== EMPLOYEE SELF-MANAGEMENT ====================

// GET /api/v1/employees/profile/me - Get current employee profile
router.get('/profile/me', authenticateToken, async (req, res) => {
  try {
    const usersCollection = await getCollection('users');
    
    const employee = await usersCollection.findOne(
      { _id: req.user.userId, isEmployee: true },
      { projection: { password: 0 } }
    );
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee profile not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { employee },
      message: 'Employee profile retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get employee profile error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PROFILE_FAILED',
      message: 'Failed to retrieve employee profile',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/employees/profile/me - Update current employee profile
router.put('/profile/me', authenticateToken, async (req, res) => {
  try {
    const { name, phoneNumber, profile } = req.body;
    const usersCollection = await getCollection('users');
    
    // Check if employee exists
    const existingEmployee = await usersCollection.findOne({ _id: req.user.userId, isEmployee: true });
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        error: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee profile not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Build update object
    const updateData = {
      updatedAt: new Date()
    };
    
    if (name) updateData.name = name;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (profile) updateData.profile = { ...existingEmployee.profile, ...profile };
    
    const result = await usersCollection.updateOne(
      { _id: req.user.userId, isEmployee: true },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'No changes made to profile',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get updated employee
    const updatedEmployee = await usersCollection.findOne(
      { _id: req.user.userId, isEmployee: true },
      { projection: { password: 0 } }
    );
    
    res.json({
      success: true,
      data: { employee: updatedEmployee },
      message: 'Employee profile updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Update employee profile error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_PROFILE_FAILED',
      message: 'Failed to update employee profile',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/employees/change-password - Change employee password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const usersCollection = await getCollection('users');
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PASSWORDS',
        message: 'Current password and new password are required',
        timestamp: new Date().toISOString()
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'WEAK_PASSWORD',
        message: 'New password must be at least 8 characters long',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get current employee
    const employee = await usersCollection.findOne({ 
      _id: req.user.userId, 
      isEmployee: true 
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, employee.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CURRENT_PASSWORD',
        message: 'Current password is incorrect',
        timestamp: new Date().toISOString()
      });
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    const result = await usersCollection.updateOne(
      { _id: req.user.userId, isEmployee: true },
      { 
        $set: { 
          password: hashedNewPassword,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'PASSWORD_UPDATE_FAILED',
        message: 'Failed to update password',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Password changed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'CHANGE_PASSWORD_FAILED',
      message: 'Failed to change password',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
