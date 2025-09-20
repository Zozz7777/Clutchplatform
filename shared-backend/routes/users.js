const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const logger = require('../utils/logger');
const { getCollection } = require('../config/optimized-database');

// GET /segments - Get user segments
router.get('/segments', authenticateToken, checkRole(['head_administrator', 'analytics_manager']), async (req, res) => {
  try {
    const segmentsCollection = await getCollection('user_segments');
    
    if (!segmentsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const segments = await segmentsCollection
      .find({})
      .sort({ lastUpdated: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: segments,
      message: 'User segments retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get user segments error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_USER_SEGMENTS_FAILED',
      message: 'Failed to get user segments',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /segments/analytics - Get user segment analytics
router.get('/segments/analytics', authenticateToken, checkRole(['head_administrator', 'analytics_manager']), async (req, res) => {
  try {
    const segmentsCollection = await getCollection('user_segments');
    const usersCollection = await getCollection('users');
    
    if (!segmentsCollection || !usersCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const [segments, totalUsers] = await Promise.all([
      segmentsCollection.find({}).toArray(),
      usersCollection.countDocuments({})
    ]);
    
    const totalSegments = segments.length;
    const activeSegments = segments.filter(s => s.status === 'active').length;
    const averageSegmentSize = totalSegments > 0 
      ? segments.reduce((sum, s) => sum + (s.userCount || 0), 0) / totalSegments 
      : 0;
    
    const analytics = {
      totalSegments,
      activeSegments,
      totalUsers,
      averageSegmentSize: Math.round(averageSegmentSize)
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'User segment analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get user segment analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_USER_SEGMENT_ANALYTICS_FAILED',
      message: 'Failed to get user segment analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /users - Get all users
router.get('/', authenticateToken, checkRole(['head_administrator']), async (req, res) => {
  try {
    const usersCollection = await getCollection('users');
    
    if (!usersCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const { page = 1, limit = 20, status, role } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    
    const users = await usersCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await usersCollection.countDocuments(filter);
    
    res.paginated(users || [], page, limit, total, 'Users retrieved successfully');
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /users/:id - Get user by ID
router.get('/:id', authenticateToken, checkRole(['head_administrator']), async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = await getCollection('users');
    
    const user = await usersCollection.findOne({ _id: id });
    
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
      return res.validationError([
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Email is required' },
        { field: 'role', message: 'Role is required' }
      ]);
    }
    
    const usersCollection = await getCollection('users');
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.conflict('User with this email already exists');
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
    
    const result = await usersCollection.insertOne(newUser);
    newUser._id = result.insertedId;
    
    res.status(201).success(newUser, 'User created successfully');
  } catch (error) {
    logger.error('Create user error:', error);
    res.serverError('Failed to create user', error.message);
  }
});

// PUT /users/:id - Update user
router.put('/:id', authenticateToken, checkRole(['head_administrator']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;
    
    const usersCollection = await getCollection('users');
    
    // Check if user exists
    const existingUser = await usersCollection.findOne({ _id: id });
    if (!existingUser) {
      return res.notFound('User', id);
    }
    
    // Check if email is being changed and if it already exists
    if (email && email !== existingUser.email) {
      const emailExists = await usersCollection.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return res.conflict('Email already exists for another user');
      }
    }
    
    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      ...(status && { status }),
      updatedAt: new Date().toISOString()
    };
    
    const result = await usersCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.notFound('User', id);
    }
    
    const updatedUser = await usersCollection.findOne({ _id: id });
    
    res.success(updatedUser, 'User updated successfully');
  } catch (error) {
    logger.error('Update user error:', error);
    res.serverError('Failed to update user', error.message);
  }
});

// DELETE /users/:id - Delete user
router.delete('/:id', authenticateToken, checkRole(['head_administrator']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const usersCollection = await getCollection('users');
    
    // Check if user exists
    const existingUser = await usersCollection.findOne({ _id: id });
    if (!existingUser) {
      return res.notFound('User', id);
    }
    
    // Prevent deletion of the current user
    if (id === (req.user.userId || req.user.id)) {
      return res.error('CANNOT_DELETE_SELF', 'Cannot delete your own account', 400);
    }
    
    const result = await usersCollection.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return res.notFound('User', id);
    }
    
    res.success({ id }, 'User deleted successfully');
  } catch (error) {
    logger.error('Delete user error:', error);
    res.serverError('Failed to delete user', error.message);
  }
});

// DELETE /users/cleanup/test - Delete all test users
router.delete('/cleanup/test', authenticateToken, checkRole(['head_administrator']), async (req, res) => {
  try {
    const usersCollection = await getCollection('users');
    
    // Delete users with test patterns
    const testPatterns = [
      { name: /^Test User/i },
      { email: /testuser/i },
      { email: /@example\.com$/ },
      { name: /^test/i }
    ];
    
    let totalDeleted = 0;
    
    for (const pattern of testPatterns) {
      const result = await usersCollection.deleteMany(pattern);
      totalDeleted += result.deletedCount;
    }
    
    res.success({ deletedCount: totalDeleted }, `Deleted ${totalDeleted} test users successfully`);
  } catch (error) {
    logger.error('Delete test users error:', error);
    res.serverError('Failed to delete test users', error.message);
  }
});

module.exports = router;
