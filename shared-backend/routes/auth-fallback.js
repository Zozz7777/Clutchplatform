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
    id: 'admin-001',
    email: 'admin@yourclutch.com',
    password: 'admin123', // In production, this should be hashed
    name: 'Admin User',
    role: 'admin',
    permissions: ['all'],
    isActive: true
  },
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
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'Email and password are required',
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
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions
        }
      },
      message: 'Login successful (fallback mode)',
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
