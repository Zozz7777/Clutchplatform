const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const MFASetup = require('../models/mfaSetup');

// Enable 2FA for user
router.post('/enable', authenticateToken, async (req, res) => {
  try {
    const { method, phone, email } = req.body;
    
    if (!method) {
      return res.status(400).json({
        success: false,
        message: '2FA method is required'
      });
    }
    
    const mfaData = {
      userId: req.user.userId,
      method,
      phone: method === 'sms' ? phone : undefined,
      email: method === 'email' ? email : undefined,
      enabled: true,
      createdAt: new Date()
    };
    
    // Check if 2FA already exists
    let mfaSetup = await MFASetup.findOne({ userId: req.user.userId });
    
    if (mfaSetup) {
      mfaSetup = await MFASetup.findByIdAndUpdate(
        mfaSetup._id,
        mfaData,
        { new: true }
      );
    } else {
      mfaSetup = new MFASetup(mfaData);
      await mfaSetup.save();
    }
    
    // Update user
    await User.findByIdAndUpdate(req.user.userId, {
      twoFactorEnabled: true,
      twoFactorMethod: method
    });
    
    res.json({
      success: true,
      data: mfaSetup,
      message: '2FA enabled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error enabling 2FA',
      error: error.message
    });
  }
});

// Disable 2FA for user
router.post('/disable', authenticateToken, async (req, res) => {
  try {
    await MFASetup.findOneAndUpdate(
      { userId: req.user.userId },
      { enabled: false }
    );
    
    await User.findByIdAndUpdate(req.user.userId, {
      twoFactorEnabled: false,
      twoFactorMethod: null
    });
    
    res.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error disabling 2FA',
      error: error.message
    });
  }
});

// Verify 2FA code
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required'
      });
    }
    
    const mfaSetup = await MFASetup.findOne({ userId: req.user.userId });
    
    if (!mfaSetup || !mfaSetup.enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled for this user'
      });
    }
    
    // TODO: Implement actual code verification logic
    // For now, accept any 6-digit code
    const isValid = /^\d{6}$/.test(code);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }
    
    res.json({
      success: true,
      message: '2FA verification successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying 2FA',
      error: error.message
    });
  }
});

// Get 2FA status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const mfaSetup = await MFASetup.findOne({ userId: req.user.userId });
    const user = await User.findById(req.user.userId);
    
    res.json({
      success: true,
      data: {
        enabled: user.twoFactorEnabled || false,
        method: user.twoFactorMethod,
        setup: mfaSetup
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching 2FA status',
      error: error.message
    });
  }
});

// Generate backup codes
router.post('/backup-codes', authenticateToken, async (req, res) => {
  try {
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substr(2, 8).toUpperCase()
    );
    
    await MFASetup.findOneAndUpdate(
      { userId: req.user.userId },
      { 
        backupCodes,
        backupCodesGenerated: new Date()
      }
    );
    
    res.json({
      success: true,
      data: { backupCodes },
      message: 'Backup codes generated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating backup codes',
      error: error.message
    });
  }
});

// Verify backup code
router.post('/backup-codes/verify', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Backup code is required'
      });
    }
    
    const mfaSetup = await MFASetup.findOne({ userId: req.user.userId });
    
    if (!mfaSetup || !mfaSetup.backupCodes) {
      return res.status(400).json({
        success: false,
        message: 'No backup codes found'
      });
    }
    
    const isValid = mfaSetup.backupCodes.includes(code);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid backup code'
      });
    }
    
    // Remove used backup code
    mfaSetup.backupCodes = mfaSetup.backupCodes.filter(c => c !== code);
    await mfaSetup.save();
    
    res.json({
      success: true,
      message: 'Backup code verification successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying backup code',
      error: error.message
    });
  }
});

// Get 2FA statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ organization: req.user.organization });
    const usersWith2FA = await User.countDocuments({ 
      organization: req.user.organization,
      twoFactorEnabled: true 
    });
    
    const mfaMethods = await MFASetup.aggregate([
      { $match: { enabled: true } },
      { $group: { _id: '$method', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalUsers,
        usersWith2FA,
        adoptionRate: (usersWith2FA / totalUsers) * 100,
        methods: mfaMethods
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching 2FA statistics',
      error: error.message
    });
  }
});

module.exports = router;
