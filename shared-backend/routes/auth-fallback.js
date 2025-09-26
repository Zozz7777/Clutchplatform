/**
 * Fallback Authentication Routes
 * Simple authentication that works without database dependencies
 * Used when main auth system has issues
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Simple in-memory user store for fallback
const fallbackUsers = [
  {
    id: 'user-001',
    email: 'user@yourclutch.com',
    password: 'user123',
    name: 'Test User',
    role: 'user',
    permissions: ['read', 'write'],
    isActive: true
  }
];

// POST /api/v1/auth-fallback/login - Fallback login
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    const email = emailOrPhone; // Use emailOrPhone as the email field
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'Email/phone and password are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Find user in fallback store
    const user = fallbackUsers.find(u => u.email === email.toLowerCase());
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }
    
    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
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
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        type: 'refresh'
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        user: {
          _id: user.id,
          email: user.email,
          phone: null,
          firstName: user.name.split(' ')[0] || 'User',
          lastName: user.name.split(' ').slice(1).join(' ') || '',
          dateOfBirth: null,
          gender: null,
          profileImage: null,
          isEmailVerified: true,
          isPhoneVerified: false,
          preferences: {
            language: 'en',
            theme: 'light',
            notifications: { push: true, email: true, sms: false },
            receiveOffers: true,
            subscribeNewsletter: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        token: token,
        refreshToken: refreshToken,
        expiresIn: '24h'
      },
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Fallback login error:', error);
    res.status(500).json({
      success: false,
      error: 'LOGIN_FAILED',
      message: 'Login failed. Please try again.',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/auth-fallback/status - Check fallback auth status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Fallback authentication is active',
    users: fallbackUsers.length,
    timestamp: new Date().toISOString()
  });
});

// GET /api/v1/auth-fallback/users - List fallback users (for testing)
router.get('/users', (req, res) => {
  const safeUsers = fallbackUsers.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive
  }));
  
  res.json({
    success: true,
    data: safeUsers,
    message: 'Fallback users retrieved',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
