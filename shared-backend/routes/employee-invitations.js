/**
 * Employee Invitation Routes
 * Handles employee invitation system with email notifications
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { getCollection } = require('../config/optimized-database');
const { authenticateToken, requireRole, hashPassword } = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/unified-auth');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const emailService = require('../services/email-service');

// Apply rate limiting
const invitationRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 10 }); // 10 invitations per 15 minutes

// ==================== EMPLOYEE INVITATIONS ====================

// POST /api/v1/employees/invite - Send employee invitation
router.post('/invite', authenticateToken, checkRole(['head_administrator', 'hr_manager']), invitationRateLimit, async (req, res) => {
  try {
    const { 
      email, 
      name, 
      role = 'employee',
      department,
      position,
      permissions = ['read']
    } = req.body;
    
    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Email and name are required',
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
    
    const usersCollection = await getCollection('users');
    const invitationsCollection = await getCollection('employee_invitations');
    
    // Check if employee already exists
    const existingEmployee = await usersCollection.findOne({ 
      email: email.toLowerCase(),
      isEmployee: true 
    });
    
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        error: 'EMPLOYEE_EXISTS',
        message: 'Employee with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if there's already a pending invitation
    const existingInvitation = await invitationsCollection.findOne({ 
      email: email.toLowerCase(),
      status: 'pending'
    });
    
    if (existingInvitation) {
      return res.status(409).json({
        success: false,
        error: 'INVITATION_EXISTS',
        message: 'A pending invitation already exists for this email',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate invitation token
    const invitationToken = jwt.sign(
      { 
        email: email.toLowerCase(), 
        type: 'employee_invitation',
        invitedBy: req.user.userId
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Create invitation record
    const invitation = {
      email: email.toLowerCase(),
      name,
      role,
      department: department || null,
      position: position || null,
      permissions,
      invitationToken,
      invitedBy: req.user.userId,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
      acceptedAt: null
    };
    
    const result = await invitationsCollection.insertOne(invitation);
    invitation._id = result.insertedId;
    
    // Send invitation email
    try {
      await emailService.sendEmployeeInvitation({
        email: email.toLowerCase(),
        name,
        role,
        department: department || 'General',
        invitationToken
      });
      
      console.log('✅ Employee invitation sent to:', email);
    } catch (emailError) {
      console.error('❌ Failed to send invitation email:', emailError);
      
      // Don't fail the request if email fails, but log it
      // In production, you might want to queue the email for retry
    }
    
    res.status(201).json({
      success: true,
      data: {
        invitation: {
          _id: invitation._id,
          email: invitation.email,
          name: invitation.name,
          role: invitation.role,
          department: invitation.department,
          position: invitation.position,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
          createdAt: invitation.createdAt
        }
      },
      message: 'Employee invitation sent successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Employee invitation error:', error);
    res.status(500).json({
      success: false,
      error: 'INVITATION_FAILED',
      message: 'Failed to send employee invitation',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/employees/invitations - List pending invitations
router.get('/invitations', authenticateToken, checkRole(['head_administrator', 'hr_manager']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const invitationsCollection = await getCollection('employee_invitations');
    
    if (!invitationsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    // Build filter
    const filter = {};
    if (status !== 'all') {
      filter.status = status;
    }
    
    // Get invitations with pagination
    const [invitations, total] = await Promise.all([
      invitationsCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      invitationsCollection.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        invitations: invitations || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total || 0,
          pages: Math.ceil((total || 0) / parseInt(limit))
        }
      },
      message: 'Invitations retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_INVITATIONS_FAILED',
      message: 'Failed to retrieve invitations',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/employees/accept-invitation - Accept invitation and set password
router.post('/accept-invitation', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Token and password are required',
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
    
    // Verify invitation token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired invitation token',
        timestamp: new Date().toISOString()
      });
    }
    
    if (decoded.type !== 'employee_invitation') {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN_TYPE',
        message: 'Invalid token type',
        timestamp: new Date().toISOString()
      });
    }
    
    const invitationsCollection = await getCollection('employee_invitations');
    const usersCollection = await getCollection('users');
    
    // Find the invitation
    const invitation = await invitationsCollection.findOne({
      invitationToken: token,
      status: 'pending'
    });
    
    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'INVITATION_NOT_FOUND',
        message: 'Invitation not found or already processed',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if invitation has expired
    if (new Date() > invitation.expiresAt) {
      // Mark invitation as expired
      await invitationsCollection.updateOne(
        { _id: invitation._id },
        { $set: { status: 'expired' } }
      );
      
      return res.status(401).json({
        success: false,
        error: 'INVITATION_EXPIRED',
        message: 'Invitation has expired',
        timestamp: new Date().toISOString()
      });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create employee record
    const newEmployee = {
      email: invitation.email,
      password: hashedPassword,
      name: invitation.name,
      role: invitation.role,
      department: invitation.department,
      position: invitation.position,
      permissions: invitation.permissions,
      isActive: true,
      isEmployee: true,
      createdAt: new Date(),
      createdBy: invitation.invitedBy,
      lastLogin: null,
      profile: {
        avatar: null,
        bio: null,
        skills: [],
        emergencyContact: null
      }
    };
    
    const result = await usersCollection.insertOne(newEmployee);
    
    // Mark invitation as accepted
    await invitationsCollection.updateOne(
      { _id: invitation._id },
      { 
        $set: { 
          status: 'accepted',
          acceptedAt: new Date()
        }
      }
    );
    
    // Generate JWT token for immediate login
    const loginToken = jwt.sign(
      {
        userId: result.insertedId,
        email: invitation.email,
        role: invitation.role,
        permissions: invitation.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Create session token
    let sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      const sessionsCollection = await getCollection('sessions');
      await sessionsCollection.insertOne({
        userId: result.insertedId,
        sessionToken,
        isActive: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
    } catch (dbError) {
      console.log('Could not create session (database unavailable)');
      sessionToken = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    console.log('✅ Employee invitation accepted and account created for:', invitation.email);
    
    res.json({
      success: true,
      data: {
        token: loginToken,
        sessionToken,
        user: {
          id: result.insertedId,
          _id: result.insertedId,
          email: invitation.email,
          name: invitation.name,
          role: invitation.role,
          permissions: invitation.permissions,
          isActive: true,
          isEmployee: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
      },
      message: 'Account created successfully. You are now logged in.',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({
      success: false,
      error: 'ACCEPT_INVITATION_FAILED',
      message: 'Failed to accept invitation',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/employees/validate-invitation/:token - Validate invitation token
router.get('/validate-invitation/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Verify invitation token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired invitation token',
        timestamp: new Date().toISOString()
      });
    }
    
    if (decoded.type !== 'employee_invitation') {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN_TYPE',
        message: 'Invalid token type',
        timestamp: new Date().toISOString()
      });
    }
    
    const invitationsCollection = await getCollection('employee_invitations');
    
    // Find the invitation
    const invitation = await invitationsCollection.findOne({
      invitationToken: token,
      status: 'pending'
    });
    
    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'INVITATION_NOT_FOUND',
        message: 'Invitation not found or already processed',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if invitation has expired
    if (new Date() > invitation.expiresAt) {
      // Mark invitation as expired
      await invitationsCollection.updateOne(
        { _id: invitation._id },
        { $set: { status: 'expired' } }
      );
      
      return res.status(401).json({
        success: false,
        error: 'INVITATION_EXPIRED',
        message: 'Invitation has expired',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: {
        invitation: {
          email: invitation.email,
          name: invitation.name,
          role: invitation.role,
          department: invitation.department,
          position: invitation.position,
          expiresAt: invitation.expiresAt
        }
      },
      message: 'Invitation is valid',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Validate invitation error:', error);
    res.status(500).json({
      success: false,
      error: 'VALIDATE_INVITATION_FAILED',
      message: 'Failed to validate invitation',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/employees/invitations/:id - Cancel invitation
router.delete('/invitations/:id', authenticateToken, checkRole(['head_administrator', 'hr', 'hr_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const invitationsCollection = await getCollection('employee_invitations');
    
    // Check if invitation exists
    const invitation = await invitationsCollection.findOne({ _id: new ObjectId(id) });
    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'INVITATION_NOT_FOUND',
        message: 'Invitation not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Only allow cancellation of pending invitations
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'INVITATION_NOT_PENDING',
        message: 'Only pending invitations can be cancelled',
        timestamp: new Date().toISOString()
      });
    }
    
    // Mark invitation as cancelled
    const result = await invitationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy: req.user.userId
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'CANCELLATION_FAILED',
        message: 'Failed to cancel invitation',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Invitation cancelled successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Cancel invitation error:', error);
    res.status(500).json({
      success: false,
      error: 'CANCEL_INVITATION_FAILED',
      message: 'Failed to cancel invitation',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/employees/invitations/:id/resend - Resend invitation
router.post('/invitations/:id/resend', authenticateToken, checkRole(['head_administrator', 'hr', 'hr_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const invitationsCollection = await getCollection('employee_invitations');
    
    // Find the invitation
    const invitation = await invitationsCollection.findOne({ _id: new ObjectId(id) });
    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'INVITATION_NOT_FOUND',
        message: 'Invitation not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Only allow resending of pending invitations
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'INVITATION_NOT_PENDING',
        message: 'Only pending invitations can be resent',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate new invitation token
    const newInvitationToken = jwt.sign(
      { 
        email: invitation.email, 
        type: 'employee_invitation',
        invitedBy: invitation.invitedBy
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Update invitation with new token and extended expiry
    await invitationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          invitationToken: newInvitationToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          resentAt: new Date(),
          resentBy: req.user.userId
        }
      }
    );
    
    // Send invitation email
    try {
      await emailService.sendEmployeeInvitation({
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        department: invitation.department || 'General',
        invitationToken: newInvitationToken
      });
      
      console.log('✅ Employee invitation resent to:', invitation.email);
    } catch (emailError) {
      console.error('❌ Failed to resend invitation email:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Invitation resent successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({
      success: false,
      error: 'RESEND_INVITATION_FAILED',
      message: 'Failed to resend invitation',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
