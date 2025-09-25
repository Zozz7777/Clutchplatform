const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Validation middleware
const validatePartnerLogin = [
  body('emailOrPhone').notEmpty().withMessage('Email or phone is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Helper function to generate JWT token
const generateToken = (partnerId, deviceId = null) => {
  return jwt.sign(
    { partnerId, deviceId, type: 'partner' },
    process.env.JWT_SECRET || 'clutch_secret_key',
    { expiresIn: '7d' }
  );
};

// @route   POST /api/v1/auth/partner-login
// @desc    Partner user login (returns JWT + refresh)
// @access  Public
router.post('/partner-login', validatePartnerLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { emailOrPhone, password, deviceId } = req.body;

    // Find partner by email or phone
    let partner;
    if (emailOrPhone.includes('@')) {
      partner = await PartnerUser.findByEmail(emailOrPhone);
    } else {
      partner = await PartnerUser.findByPhone(emailOrPhone);
    }

    if (!partner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (partner.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    // Check if account is active
    if (partner.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, partner.password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      await PartnerUser.incrementFailedAttempts(partner._id);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset failed login attempts on successful login
    await PartnerUser.resetFailedAttempts(partner._id);

    // Update last login
    await PartnerUser.updateLastLogin(partner._id);

    // Generate tokens
    const accessToken = generateToken(partner.partnerId, deviceId);
    const refreshToken = generateToken(partner.partnerId, deviceId);

    // Log successful login
    logger.info(`Partner login successful: ${partner.partnerId}`, {
      partnerId: partner.partnerId,
      email: partner.email,
      deviceId: deviceId || 'unknown'
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        partner: {
          partnerId: partner.partnerId,
          name: partner.name,
          email: partner.email,
          phone: partner.phone,
          businessName: partner.businessName,
          partnerType: partner.partnerType,
          status: partner.status,
          role: partner.role,
          permissions: partner.permissions
        }
      }
    });

  } catch (error) {
    logger.error('Partner login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/v1/auth/partner-otp
// @desc    Partner OTP flows (send/verify)
// @access  Public
router.post('/partner-otp', async (req, res) => {
  try {
    const { action, emailOrPhone, otp } = req.body;

    if (action === 'send') {
      // Generate and send OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in database with expiration
      await PartnerUser.storeOTP(emailOrPhone, otpCode);
      
      // Send OTP via SMS/Email (implement based on your notification service)
      logger.info(`OTP sent to ${emailOrPhone}: ${otpCode}`);
      
      res.json({
        success: true,
        message: 'OTP sent successfully'
      });
      
    } else if (action === 'verify') {
      // Verify OTP
      const isValid = await PartnerUser.verifyOTP(emailOrPhone, otp);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      // Find partner and generate token
      let partner;
      if (emailOrPhone.includes('@')) {
        partner = await PartnerUser.findByEmail(emailOrPhone);
      } else {
        partner = await PartnerUser.findByPhone(emailOrPhone);
      }

      if (!partner) {
        return res.status(404).json({
          success: false,
          message: 'Partner not found'
        });
      }

      const accessToken = generateToken(partner.partnerId);
      const refreshToken = generateToken(partner.partnerId);

      res.json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          accessToken,
          refreshToken,
          partner: {
            partnerId: partner.partnerId,
            name: partner.name,
            email: partner.email,
            phone: partner.phone,
            businessName: partner.businessName,
            partnerType: partner.partnerType,
            status: partner.status,
            role: partner.role,
            permissions: partner.permissions
          }
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid action. Use "send" or "verify"'
      });
    }

  } catch (error) {
    logger.error('Partner OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
