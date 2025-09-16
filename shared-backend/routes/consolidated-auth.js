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

// Apply rate limiting
const authRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 50 }); // 50 attempts per 15 minutes
const loginRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 10 }); // 10 login attempts per 15 minutes

// ==================== BASIC AUTHENTICATION ====================

// POST /api/v1/auth/create-ceo - Create CEO employee (one-time setup)
router.post('/create-ceo', async (req, res) => {
  try {
    const CEO_EMAIL = 'ziad@yourclutch.com';
    const CEO_PASSWORD = '4955698*Z*z';
    
    console.log('👤 Creating/updating CEO employee...');
    
    const usersCollection = await getCollection('users');
    
    // Check if CEO already exists
    const existingCEO = await usersCollection.findOne({ 
      email: CEO_EMAIL.toLowerCase() 
    });
    
    if (existingCEO) {
      console.log('✅ CEO employee already exists, updating...');
      
      // Update password
      const hashedPassword = await hashPassword(CEO_PASSWORD);
      
      await usersCollection.updateOne(
        { _id: existingCEO._id },
        { 
          $set: { 
            password: hashedPassword,
            role: 'admin',
            isEmployee: true,
            permissions: ['all'],
            name: 'Ziad - CEO',
            department: 'Executive',
            position: 'Chief Executive Officer',
            isActive: true,
            updatedAt: new Date()
          }
        }
      );
      
      console.log('✅ CEO employee updated successfully');
      
    } else {
      console.log('👤 Creating new CEO employee...');
      
      // Hash password
      const hashedPassword = await hashPassword(CEO_PASSWORD);
      
      // Create CEO employee
      const ceoEmployee = {
        email: CEO_EMAIL.toLowerCase(),
        password: hashedPassword,
        name: 'Ziad - CEO',
        role: 'admin',
        department: 'Executive',
        position: 'Chief Executive Officer',
        permissions: ['all'],
        isActive: true,
        isEmployee: true,
        createdAt: new Date(),
        lastLogin: null,
        profile: {
          avatar: null,
          bio: 'Chief Executive Officer of Clutch Platform',
          skills: ['Leadership', 'Strategy', 'Management'],
          emergencyContact: null
        }
      };
      
      await usersCollection.insertOne(ceoEmployee);
      console.log('✅ CEO employee created successfully');
    }
    
    res.json({
      success: true,
      message: 'CEO employee created/updated successfully',
      data: {
        email: CEO_EMAIL,
        name: 'Ziad - CEO',
        role: 'admin',
        isEmployee: true
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating CEO employee:', error);
    res.status(500).json({
      success: false,
      error: 'CEO_CREATION_FAILED',
      message: 'Failed to create CEO employee',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/login - User login with fallback authentication
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
    
    console.log('🔐 Login attempt for:', email);
    
           // Fallback authentication for CEO/admin
           const fallbackUsers = [
             {
               _id: 'fallback_ziad_ceo',
               email: 'ziad@yourclutch.com',
               password: '4955698*Z*z',
               name: 'Ziad - CEO',
               role: 'head_administrator',
               permissions: [
                 'all',
                 'head_administrator',
                 'platform_admin',
                 'ceo',
                 // Frontend view permissions
                 'view_dashboard',
                 'view_users',
                 'view_fleet',
                 'view_crm',
                 'view_chat',
                 'view_ai_dashboard',
                 'view_enterprise',
                 'view_finance',
                 'view_legal',
                 'view_hr',
                 'view_feature_flags',
                 'view_communication',
                 'view_analytics',
                 'view_mobile_apps',
                 'view_cms',
                 'view_marketing',
                 'view_projects',
                 'view_settings',
                 'view_reports',
                 'view_integrations',
                 'view_audit_trail',
                 'view_api_docs',
                 'view_assets',
                 'view_vendors',
                 'view_system_health',
                 // Management permissions
                 'user_management',
                 'system_management',
                 'database_management',
                 'api_management',
                 'security_management',
                 'analytics_management',
                 'fleet_management',
                 'hr_management',
                 'finance_management',
                 'customer_management',
                 'booking_management',
                 'payment_management',
                 'notification_management',
                 'audit_management',
                 'feature_flag_management',
                 'ai_management',
                 'websocket_management',
                 'email_management',
                 'file_management',
                 'report_management',
                 'dashboard_management',
                 'settings_management',
                 'backup_management',
                 'monitoring_management',
                 'performance_management',
                 'log_management',
                 'error_management',
                 'health_management',
                 'deployment_management',
                 'configuration_management',
                 'integration_management',
                 'automation_management',
                 'compliance_management',
                 'risk_management',
                 'vendor_management',
                 'asset_management',
                 'project_management',
                 'communication_management',
                 'document_management',
                 'workflow_management',
                 'approval_management',
                 'escalation_management',
                 'incident_management',
                 'maintenance_management',
                 'upgrade_management',
                 'migration_management',
                 'testing_management',
                 'quality_management',
                 'training_management',
                 'support_management',
                 'sales_management',
                 'marketing_management',
                 'content_management',
                 'media_management',
                 'social_management',
                 'mobile_management',
                 'web_management',
                 // Tool permissions
                 'api_documentation',
                 'developer_tools',
                 'debugging_tools',
                 'profiling_tools',
                 'monitoring_tools',
                 'alerting_tools',
                 'reporting_tools',
                 'analytics_tools',
                 'data_tools',
                 'export_tools',
                 'import_tools',
                 'sync_tools',
                 'backup_tools',
                 'restore_tools',
                 'cleanup_tools',
                 'optimization_tools',
                 'security_tools',
                 'compliance_tools',
                 'audit_tools',
                 'testing_tools',
                 'deployment_tools',
                 'configuration_tools',
                 'integration_tools',
                 'automation_tools',
                 'workflow_tools',
                 'approval_tools',
                 'escalation_tools',
                 'incident_tools',
                 'maintenance_tools',
                 'upgrade_tools',
                 'migration_tools',
                 'quality_tools',
                 'training_tools',
                 'support_tools',
                 'sales_tools',
                 'marketing_tools',
                 'content_tools',
                 'media_tools',
                 'social_tools',
                 'mobile_tools',
                 'web_tools',
                 // Action permissions
                 'read',
                 'write',
                 'create',
                 'update',
                 'delete',
                 'view',
                 'edit',
                 'manage',
                 'configure',
                 'execute',
                 'approve',
                 'reject',
                 'publish',
                 'unpublish',
                 'archive',
                 'restore',
                 'export',
                 'import',
                 'sync',
                 'backup',
                 'restore',
                 'cleanup',
                 'optimize',
                 'secure',
                 'comply',
                 'audit',
                 'test',
                 'deploy',
                 'configure',
                 'integrate',
                 'automate',
                 'workflow',
                 'escalate',
                 'incident',
                 'maintain',
                 'upgrade',
                 'migrate',
                 'quality',
                 'train',
                 'support',
                 'sell',
                 'market',
                 'content',
                 'media',
                 'social',
                 'mobile',
                 'web'
               ],
               _id: 'admin-001'
             },
             {
               email: 'admin@yourclutch.com',
               password: 'admin123',
               name: 'Admin User',
               role: 'admin',
               permissions: ['all'],
               _id: 'admin-002'
             }
           ];
    
    // Check fallback users first
    const fallbackUser = fallbackUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (fallbackUser && fallbackUser.password === password) {
      console.log('✅ Fallback authentication successful for:', email);
      
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: fallbackUser._id,
          email: fallbackUser.email,
          role: fallbackUser.role,
          permissions: fallbackUser.permissions
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Create session token
      const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create refresh token (longer expiration)
      const refreshToken = jwt.sign(
        {
          userId: fallbackUser._id,
          email: fallbackUser.email,
          type: 'refresh'
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.json({
        success: true,
        data: {
          token,
          refreshToken,
          sessionToken,
          user: {
            id: fallbackUser._id,
            _id: fallbackUser._id,
            email: fallbackUser.email,
            name: fallbackUser.name,
            role: fallbackUser.role,
            permissions: fallbackUser.permissions,
            isActive: true,
            isEmployee: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          }
        },
        message: 'Login successful (fallback)',
        timestamp: new Date().toISOString()
      });
    }
    
    // Try database authentication - check employees first, then regular users
    let user = null;
    try {
      const usersCollection = await getCollection('users');
      
      // Optimized: Single query with $or to find user (employee or regular)
      user = await usersCollection.findOne({ 
        email: email.toLowerCase()
      });
      
      console.log('🔍 Database lookup result:', {
        found: !!user,
        isEmployee: user?.isEmployee,
        role: user?.role,
        email: user?.email
      });
      
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
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
    let isValidPassword = false;
    try {
      isValidPassword = await comparePassword(password, user.password);
    } catch (passwordError) {
      console.error('Password comparison error:', passwordError);
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if user is active (skip for fallback users)
    if (!user.isActive && !fallbackUsers.find(fu => fu.email === email)) {
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
    
    console.log('✅ Database authentication successful for:', email);
    
    // Create refresh token (longer expiration)
    const refreshToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        type: 'refresh'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        sessionToken,
        user: {
          id: user._id,
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions || [],
          isActive: user.isActive,
          isEmployee: user.isEmployee,
          createdAt: user.createdAt,
          lastLogin: new Date().toISOString()
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

// GET /api/v1/auth/employee-me - Get current employee
router.get('/employee-me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Mock employee data
    const employee = {
      id: userId,
      email: req.user.email,
      name: 'Current Employee',
      role: req.user.role,
      department: 'IT',
      isActive: true,
      lastLogin: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: { employee },
      message: 'Employee data retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Get employee error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_EMPLOYEE_FAILED',
      message: 'Failed to get employee data',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/register - User registration
router.post('/register', authRateLimit, async (req, res) => {
  try {
    console.log('🔐 Registration attempt:', { email: req.body.email, hasName: !!req.body.name, hasFirstName: !!req.body.firstName });
    
    const { email, password, name, firstName, lastName, phoneNumber } = req.body;
    
    // Handle both name formats (name or firstName/lastName)
    const fullName = name || (firstName && lastName ? `${firstName} ${lastName}` : null);
    
    console.log('📝 Registration data processed:', { email, hasPassword: !!password, fullName });
    
    if (!email || !password || !fullName) {
      console.log('❌ Missing required fields:', { email: !!email, password: !!password, fullName: !!fullName });
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Email, password, and name (or firstName/lastName) are required',
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
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'WEAK_PASSWORD',
        message: 'Password must be at least 6 characters long',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    const usersCollection = await getCollection('users');
    console.log('✅ Database collection accessed');
    
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    console.log('🔍 User lookup result:', { found: !!existingUser });
    
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(409).json({
        success: false,
        error: 'USER_EXISTS',
        message: 'User with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('✅ Password hashed successfully');
    
    // Create user
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: fullName,
      phoneNumber: phoneNumber || null,
      role: 'user',
      permissions: ['read', 'write'],
      isActive: true,
      firebaseId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique firebaseId
      createdAt: new Date(),
      lastLogin: null
    };
    
    console.log('💾 Creating user in database...');
    const result = await usersCollection.insertOne(newUser);
    console.log('✅ User created successfully:', { userId: result.insertedId });
    
    // Generate JWT token
    console.log('🔑 Generating JWT token...');
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
    console.log('✅ JWT token generated');
    
    console.log('✅ Registration completed successfully');
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
    console.error('❌ Registration error:', error);
    console.error('❌ Registration error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      error: 'REGISTRATION_FAILED',
      message: 'Registration failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== ENHANCED AUTHENTICATION ====================

// POST /api/v1/auth/refresh - Refresh token (no auth required since token is expired)
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
    
    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        type: 'refresh'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
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
