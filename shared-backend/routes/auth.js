const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { logger } = require('../config/logger');

// Simple authentication middleware (non-blocking)
const simpleAuth = (req, res, next) => {
  req.user = { 
    id: 'test-user', 
    role: 'user',
    tenantId: 'test-tenant'
  };
  next();
};

// ==================== AUTHENTICATION ROUTES ====================

// Handle OPTIONS requests for CORS preflight
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.status(200).end();
});

// POST /api/v1/auth/login - User login
router.post('/login', async (req, res) => {
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
    
    // Simplified authentication for testing
    const mockUser = {
      id: 'user-123',
      email: email,
      name: 'Test User',
      role: 'user',
      isActive: true,
      lastLogin: new Date().toISOString()
    };
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: mockUser.id, 
        email: mockUser.email, 
        role: mockUser.role 
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      data: {
        user: mockUser,
        token: token,
        expiresIn: '24h'
      },
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'LOGIN_FAILED',
      message: 'Login failed',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/register - User registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, firstName, lastName, phone } = req.body;
    
    // Handle both name formats (name or firstName/lastName)
    const fullName = name || (firstName && lastName ? `${firstName} ${lastName}` : null);
    
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Email, password, and name (or firstName/lastName) are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Simplified registration for testing
    const newUser = {
      id: `user-${Date.now()}`,
      email: email,
      name: fullName,
      phone: phone || null,
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      data: {
        user: newUser,
        token: token,
        expiresIn: '24h'
      },
      message: 'Registration successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'REGISTRATION_FAILED',
      message: 'Registration failed',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/logout - User logout
router.post('/logout', simpleAuth, async (req, res) => {
  try {
    // Simplified logout for testing
    res.json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'LOGOUT_FAILED',
      message: 'Logout failed',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/auth/profile - Get user profile
router.get('/profile', simpleAuth, async (req, res) => {
  try {
    const mockProfile = {
      id: req.user.id,
      email: 'test@example.com',
      name: 'Test User',
      phone: '+1234567890',
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: mockProfile,
      message: 'Profile retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'PROFILE_FETCH_FAILED',
      message: 'Failed to fetch profile',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/auth/profile - Update user profile
router.put('/profile', simpleAuth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const updatedProfile = {
      id: req.user.id,
      email: 'test@example.com',
      name: name || 'Test User',
      phone: phone || '+1234567890',
      role: 'user',
      isActive: true,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'PROFILE_UPDATE_FAILED',
      message: 'Failed to update profile',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/refresh - Refresh token
router.post('/refresh', async (req, res) => {
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
    
    // Generate new JWT token
    const newToken = jwt.sign(
      { 
        userId: 'user-123', 
        email: 'test@example.com', 
        role: 'user' 
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      data: {
        token: newToken,
        expiresIn: '24h'
      },
      message: 'Token refreshed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'TOKEN_REFRESH_FAILED',
      message: 'Token refresh failed',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/forgot-password - Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_EMAIL',
        message: 'Email is required',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Password reset email sent successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'FORGOT_PASSWORD_FAILED',
      message: 'Failed to send password reset email',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/reset-password - Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Token and new password are required',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Password reset successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'RESET_PASSWORD_FAILED',
      message: 'Failed to reset password',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;