const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/rbac');
const logger = require('../utils/logger');
const { getCollection } = require('../config/optimized-database');

// GET /users - Get all users
router.get('/', authenticateToken, checkRole(['head_administrator']), async (req, res) => {
  try {
    const { db } = await getCollection('users');
    const { page = 1, limit = 20, status, role } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    
    const users = await db
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await db.countDocuments(filter);
    
    res.paginated(users, page, limit, total, 'Users retrieved successfully');
  } catch (error) {
    logger.error('Get users error:', error);
    res.serverError('Failed to get users', error.message);
  }
});

// GET /users/:id - Get user by ID
router.get('/:id', authenticateToken, checkRole(['head_administrator']), async (req, res) => {
  try {
    const { id } = req.params;
    const { db } = await getCollection('users');
    
    const user = await db.findOne({ _id: id });
    
    if (!user) {
      return res.notFound('User', id);
    }
    
    res.success(user, 'User retrieved successfully');
  } catch (error) {
    logger.error('Get user error:', error);
    res.serverError('Failed to get user', error.message);
  }
});

// POST /users - Create new user
router.post('/', authenticateToken, checkRole(['head_administrator']), async (req, res) => {
  try {
    const { name, email, role, status = 'active' } = req.body;
    
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, email, and role are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const { db } = await getCollection('users');
    
    // Check if user already exists
    const existingUser = await db.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'USER_ALREADY_EXISTS',
        message: 'User with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    const newUser = {
      name,
      email,
      role,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };
    
    const result = await db.insertOne(newUser);
    newUser._id = result.insertedId;
    
    res.status(201).json({ 
      success: true, 
      data: newUser, 
      message: 'User created successfully', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({ success: false, error: 'CREATE_USER_FAILED', message: 'Failed to create user', timestamp: new Date().toISOString() });
  }
});

// PUT /users/:id - Update user
router.put('/:id', authenticateToken, checkRole(['head_administrator']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;
    
    const { db } = await getCollection('users');
    
    // Check if user exists
    const existingUser = await db.findOne({ _id: id });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if email is being changed and if it already exists
    if (email && email !== existingUser.email) {
      const emailExists = await db.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: 'EMAIL_ALREADY_EXISTS',
          message: 'Email already exists for another user',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      ...(status && { status }),
      updatedAt: new Date().toISOString()
    };
    
    const result = await db.updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const updatedUser = await db.findOne({ _id: id });
    
    res.json({ 
      success: true, 
      data: updatedUser, 
      message: 'User updated successfully', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({ success: false, error: 'UPDATE_USER_FAILED', message: 'Failed to update user', timestamp: new Date().toISOString() });
  }
});

// DELETE /users/:id - Delete user
router.delete('/:id', authenticateToken, checkRole(['head_administrator']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const { db } = await getCollection('users');
    
    // Check if user exists
    const existingUser = await db.findOne({ _id: id });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Prevent deletion of the current user
    if (id === (req.user.userId || req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'CANNOT_DELETE_SELF',
        message: 'Cannot delete your own account',
        timestamp: new Date().toISOString()
      });
    }
    
    const result = await db.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({ 
      success: true, 
      data: { id }, 
      message: 'User deleted successfully', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'DELETE_USER_FAILED', message: 'Failed to delete user', timestamp: new Date().toISOString() });
  }
});

module.exports = router;
