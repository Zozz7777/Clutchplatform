const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');

// POST /api/v1/admin/onboarding/complete - Complete user onboarding
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      department,
      companyName,
      companySize,
      industry,
      address,
      website,
      timezone,
      password,
      confirmPassword,
      twoFactor,
      sessionTimeout,
      ipRestriction,
      backupFrequency,
      language,
      theme,
      notifications,
      emailUpdates,
      dashboardLayout,
      defaultView
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !jobTitle || !department) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Missing required personal information fields',
        timestamp: new Date().toISOString()
      });
    }

    if (!companyName || !companySize || !industry || !address || !timezone) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_ORGANIZATION_FIELDS',
        message: 'Missing required organization information fields',
        timestamp: new Date().toISOString()
      });
    }

    if (!password || !confirmPassword || password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PASSWORD',
        message: 'Password and confirmation do not match',
        timestamp: new Date().toISOString()
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user profile
    const db = require('../config/database');
    const usersCollection = db.collection('users');
    
    const updateData = {
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      department,
      companyName,
      companySize,
      industry,
      address,
      website,
      timezone,
      password: hashedPassword,
      preferences: {
        language: language || 'en',
        theme: theme || 'light',
        notifications: notifications || 'all',
        emailUpdates: emailUpdates || 'weekly',
        dashboardLayout: dashboardLayout || 'standard',
        defaultView: defaultView || 'dashboard'
      },
      security: {
        twoFactorEnabled: twoFactor === 'Enabled',
        sessionTimeout: sessionTimeout || '1 hour',
        ipRestriction: ipRestriction || 'None',
        backupFrequency: backupFrequency || 'Daily'
      },
      onboardingCompleted: true,
      onboardingCompletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await usersCollection.updateOne(
      { _id: userId },
      { $set: updateData }
    );

    logger.info(`✅ User onboarding completed for user: ${userId}`);

    res.json({
      success: true,
      data: {
        message: 'Onboarding completed successfully',
        user: {
          id: userId,
          firstName,
          lastName,
          email,
          onboardingCompleted: true
        }
      },
      message: 'Welcome to Clutch Admin!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Onboarding completion error:', error);
    res.status(500).json({
      success: false,
      error: 'ONBOARDING_COMPLETION_FAILED',
      message: 'Failed to complete onboarding',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/admin/onboarding/status - Get onboarding status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const db = require('../config/database');
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: userId });

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
      data: {
        onboardingCompleted: user.onboardingCompleted || false,
        onboardingCompletedAt: user.onboardingCompletedAt || null,
        requiredFields: {
          personal: !!(user.firstName && user.lastName && user.email && user.phone && user.jobTitle && user.department),
          organization: !!(user.companyName && user.companySize && user.industry && user.address && user.timezone),
          security: !!(user.password && user.security?.twoFactorEnabled !== undefined),
          preferences: !!(user.preferences?.language && user.preferences?.theme)
        }
      },
      message: 'Onboarding status retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Onboarding status error:', error);
    res.status(500).json({
      success: false,
      error: 'ONBOARDING_STATUS_FAILED',
      message: 'Failed to get onboarding status',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/admin/onboarding/checklist - Get onboarding checklist
router.get('/checklist', authenticateToken, async (req, res) => {
  try {
    const checklist = [
      {
        id: 'personal',
        title: 'Personal Information',
        description: 'Complete your personal details',
        required: true,
        fields: [
          { name: 'firstName', label: 'First Name', required: true },
          { name: 'lastName', label: 'Last Name', required: true },
          { name: 'email', label: 'Email Address', required: true },
          { name: 'phone', label: 'Phone Number', required: true },
          { name: 'jobTitle', label: 'Job Title', required: true },
          { name: 'department', label: 'Department', required: true }
        ]
      },
      {
        id: 'organization',
        title: 'Organization Setup',
        description: 'Configure your organization details',
        required: true,
        fields: [
          { name: 'companyName', label: 'Company Name', required: true },
          { name: 'companySize', label: 'Company Size', required: true },
          { name: 'industry', label: 'Industry', required: true },
          { name: 'address', label: 'Company Address', required: true },
          { name: 'website', label: 'Website', required: false },
          { name: 'timezone', label: 'Timezone', required: true }
        ]
      },
      {
        id: 'security',
        title: 'Security & Access',
        description: 'Set up security preferences',
        required: true,
        fields: [
          { name: 'password', label: 'Password', required: true },
          { name: 'confirmPassword', label: 'Confirm Password', required: true },
          { name: 'twoFactor', label: 'Two-Factor Authentication', required: true },
          { name: 'sessionTimeout', label: 'Session Timeout', required: true },
          { name: 'ipRestriction', label: 'IP Restrictions', required: false },
          { name: 'backupFrequency', label: 'Backup Frequency', required: true }
        ]
      },
      {
        id: 'preferences',
        title: 'Preferences & Settings',
        description: 'Customize your experience',
        required: true,
        fields: [
          { name: 'language', label: 'Language', required: true },
          { name: 'theme', label: 'Theme', required: true },
          { name: 'notifications', label: 'Notifications', required: true },
          { name: 'emailUpdates', label: 'Email Updates', required: true },
          { name: 'dashboardLayout', label: 'Dashboard Layout', required: true },
          { name: 'defaultView', label: 'Default View', required: true }
        ]
      }
    ];

    res.json({
      success: true,
      data: { checklist },
      message: 'Onboarding checklist retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Onboarding checklist error:', error);
    res.status(500).json({
      success: false,
      error: 'ONBOARDING_CHECKLIST_FAILED',
      message: 'Failed to get onboarding checklist',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
