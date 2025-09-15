/**
 * Emergency Authentication Routes
 * Simple, reliable authentication that works even when database is down
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Emergency admin credentials
const EMERGENCY_USERS = [
  {
    id: 'emergency-admin-001',
    email: 'ziad@yourclutch.com',
    password: '4955698*Z*z',
    name: 'Ziad - CEO',
    role: 'admin',
    permissions: ['all']
  },
  {
    id: 'emergency-admin-002', 
    email: 'admin@yourclutch.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    permissions: ['all']
  },
  {
    id: 'emergency-employee-001',
    email: 'employee@yourclutch.com',
    password: 'employee123',
    name: 'Employee User',
    role: 'employee',
    permissions: ['read', 'write']
  }
];

// POST /api/v1/emergency-auth/login - Emergency login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🚨 Emergency login attempt for:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'Email and password are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Find user in emergency credentials
    const user = EMERGENCY_USERS.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );
    
    if (!user) {
      console.log('❌ Emergency login failed for:', email);
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('✅ Emergency login successful for:', email);
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      process.env.JWT_SECRET || 'emergency-secret-key',
      { expiresIn: '24h' }
    );
    
    // Create session token
    const sessionToken = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      success: true,
      data: {
        token,
        sessionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions
        }
      },
      message: 'Emergency login successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Emergency login error:', error);
    res.status(500).json({
      success: false,
      error: 'EMERGENCY_LOGIN_FAILED',
      message: 'Emergency login failed. Please contact support.',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/emergency-auth/status - Check emergency auth status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'operational',
      availableUsers: EMERGENCY_USERS.length,
      timestamp: new Date().toISOString()
    },
    message: 'Emergency authentication system is operational'
  });
});

// GET /api/v1/emergency-auth/users - List available emergency users (for testing)
router.get('/users', (req, res) => {
  const publicUsers = EMERGENCY_USERS.map(user => ({
    email: user.email,
    name: user.name,
    role: user.role
  }));
  
  res.json({
    success: true,
    data: {
      users: publicUsers,
      count: publicUsers.length
    },
    message: 'Emergency users available'
  });
});

module.exports = router;
