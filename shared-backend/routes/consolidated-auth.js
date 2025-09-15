/**
 * Consolidated Authentication Routes
 * Merged: auth.js + auth-advanced.js + enhanced-auth.js + enterprise-auth.js
 * Reduced from 4 files to 1 for better maintainability
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { getCollection } = require('../config/optimized-database');
const { authenticateToken, requireRole, hashPassword, comparePassword } = require('../middleware/auth');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { getEnvironmentConfig } = require('../config/environment');

// Apply rate limiting
const authRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 50 }); // 50 attempts per 15 minutes
const loginRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 10 }); // 10 login attempts per 15 minutes

// ==================== BASIC AUTHENTICATION ====================

// POST /api/v1/auth/login - User login
router.post('/login', loginRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'Email and password are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get user from database with fallback
    let user = null;
    try {
      const usersCollection = await getCollection('users');
      user = await usersCollection.findOne({ email: email.toLowerCase() });
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Fallback to environment-configured admin user
      try {
        const envConfig = getEnvironmentConfig();
        if (email === envConfig.auth.adminEmail || email === 'ziad@yourclutch.com') {
          user = {
            _id: 'admin-001',
            email: email,
            password: envConfig.auth.adminPasswordHash,
            name: 'Admin User',
            role: 'admin',
            permissions: ['all'],
            isActive: true
          };
        }
      } catch (envError) {
        console.error('Environment configuration error:', envError);
        // Last resort fallback - should not be used in production
        if (email === 'ziad@yourclutch.com') {
          console.warn('⚠️ Using emergency fallback credentials - configure environment variables!');
          user = {
            _id: 'admin-001',
            email: email,
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K.8.8.', // Emergency fallback
            name: 'Emergency Admin',
            role: 'admin',
            permissions: ['all'],
            isActive: true
          };
        }
      }
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }
    
    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'ACCOUNT_DISABLED',
        message: 'Account is disabled. Please contact support.',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Update last login (with fallback)
    try {
      const usersCollection = await getCollection('users');
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date() } }
      );
    } catch (dbError) {
      console.log('Could not update last login (database unavailable)');
    }
    
    // Create session (with fallback)
    let sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      const sessionsCollection = await getCollection('sessions');
      await sessionsCollection.insertOne({
        userId: user._id,
        sessionToken,
        isActive: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
    } catch (dbError) {
      console.log('Could not create session (database unavailable)');
      // Use a simple session token
      sessionToken = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    res.json({
      success: true,
      data: {
        token,
        sessionToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions || []
        }
      },
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'LOGIN_FAILED',
      message: 'Login failed. Please try again.',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/register - User registration
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { email, password, name, phoneNumber } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Email, password, and name are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if user already exists
    const usersCollection = await getCollection('users');
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'USER_EXISTS',
        message: 'User with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      phoneNumber: phoneNumber || null,
      role: 'user',
      permissions: ['read', 'write'],
      isActive: true,
      createdAt: new Date(),
      lastLogin: null
    };
    
    const result = await usersCollection.insertOne(newUser);
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.insertedId,
        email: newUser.email,
        role: newUser.role,
        permissions: newUser.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: result.insertedId,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          permissions: newUser.permissions
        }
      },
      message: 'User registered successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'REGISTRATION_FAILED',
      message: 'Registration failed. Please try again.',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== ENHANCED AUTHENTICATION ====================

// POST /api/v1/auth/refresh - Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REFRESH_TOKEN',
        message: 'Refresh token is required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Get user from database
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ _id: decoded.userId });
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate new access token
    const newToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions || []
        }
      },
      message: 'Token refreshed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'TOKEN_REFRESH_FAILED',
      message: 'Token refresh failed',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/logout - User logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { sessionToken } = req.body;
    
    if (sessionToken) {
      // Deactivate session
      const sessionsCollection = await getCollection('sessions');
      await sessionsCollection.updateOne(
        { sessionToken },
        { $set: { isActive: false, loggedOutAt: new Date() } }
      );
    }
    
    res.json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'LOGOUT_FAILED',
      message: 'Logout failed',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== ENTERPRISE AUTHENTICATION ====================

// POST /api/v1/auth/enterprise-login - Enterprise user login
router.post('/enterprise-login', loginRateLimit, async (req, res) => {
  try {
    const { email, password, organizationId } = req.body;
    
    if (!email || !password || !organizationId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_ENTERPRISE_CREDENTIALS',
        message: 'Email, password, and organization ID are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get enterprise user from database
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ 
      email: email.toLowerCase(),
      organizationId,
      role: { $in: ['admin', 'enterprise_user', 'manager'] }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_ENTERPRISE_CREDENTIALS',
        message: 'Invalid enterprise credentials',
        timestamp: new Date().toISOString()
      });
    }
    
    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_ENTERPRISE_CREDENTIALS',
        message: 'Invalid enterprise credentials',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate enterprise JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        permissions: user.permissions || []
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' } // Shorter expiry for enterprise
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          permissions: user.permissions || []
        }
      },
      message: 'Enterprise login successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Enterprise login error:', error);
    res.status(500).json({
      success: false,
      error: 'ENTERPRISE_LOGIN_FAILED',
      message: 'Enterprise login failed',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== PASSWORD MANAGEMENT ====================

// POST /api/v1/auth/forgot-password - Forgot password
router.post('/forgot-password', authRateLimit, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'EMAIL_REQUIRED',
        message: 'Email is required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if user exists
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Store reset token (in real implementation, send email)
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'FORGOT_PASSWORD_FAILED',
      message: 'Password reset request failed',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/reset-password - Reset password
router.post('/reset-password', authRateLimit, async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'TOKEN_AND_PASSWORD_REQUIRED',
        message: 'Reset token and new password are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_RESET_TOKEN',
        message: 'Invalid reset token',
        timestamp: new Date().toISOString()
      });
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update user password
    const usersCollection = await getCollection('users');
    await usersCollection.updateOne(
      { _id: decoded.userId },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );
    
    res.json({
      success: true,
      message: 'Password reset successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'RESET_PASSWORD_FAILED',
      message: 'Password reset failed',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== USER PROFILE ====================

// GET /api/v1/auth/profile - Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne(
      { _id: req.user.userId },
      { projection: { password: 0 } } // Exclude password
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PROFILE_FAILED',
      message: 'Failed to retrieve profile',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    updateData.updatedAt = new Date();
    
    const usersCollection = await getCollection('users');
    const result = await usersCollection.updateOne(
      { _id: req.user.userId },
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
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_PROFILE_FAILED',
      message: 'Failed to update profile',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== GENERIC HANDLERS ====================

// GET /api/v1/auth - Get auth overview
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Consolidated Authentication API is running',
    endpoints: {
      login: '/api/v1/auth/login',
      register: '/api/v1/auth/register',
      refresh: '/api/v1/auth/refresh',
      logout: '/api/v1/auth/logout',
      enterpriseLogin: '/api/v1/auth/enterprise-login',
      forgotPassword: '/api/v1/auth/forgot-password',
      resetPassword: '/api/v1/auth/reset-password',
      profile: '/api/v1/auth/profile'
    },
    timestamp: new Date().toISOString()
  });
});

// Handle OPTIONS requests for CORS preflight
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.status(200).end();
});

module.exports = router;
