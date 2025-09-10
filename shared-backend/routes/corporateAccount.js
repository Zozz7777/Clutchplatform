const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const CorporateAccount = require('../models/corporateAccount');

// Get all corporate accounts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const accounts = await CorporateAccount.find({ organization: req.user.organization })
      .populate('users')
      .populate('fleets');
    
    res.json({
      success: true,
      data: accounts,
      count: accounts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching corporate accounts',
      error: error.message
    });
  }
});

// Get single corporate account
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const account = await CorporateAccount.findById(req.params.id)
      .populate('users')
      .populate('fleets')
      .populate('subscriptions');
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Corporate account not found'
      });
    }
    
    res.json({
      success: true,
      data: account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching corporate account',
      error: error.message
    });
  }
});

// Create new corporate account
router.post('/', authenticateToken, async (req, res) => {
  try {
    const accountData = {
      ...req.body,
      organization: req.user.organization,
      createdBy: req.user.id
    };
    
    const account = new CorporateAccount(accountData);
    await account.save();
    
    res.status(201).json({
      success: true,
      data: account,
      message: 'Corporate account created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating corporate account',
      error: error.message
    });
  }
});

// Update corporate account
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const account = await CorporateAccount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Corporate account not found'
      });
    }
    
    res.json({
      success: true,
      data: account,
      message: 'Corporate account updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating corporate account',
      error: error.message
    });
  }
});

// Delete corporate account
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const account = await CorporateAccount.findByIdAndDelete(req.params.id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Corporate account not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Corporate account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting corporate account',
      error: error.message
    });
  }
});

// Get corporate account analytics
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const account = await CorporateAccount.findById(req.params.id)
      .populate('users')
      .populate('fleets');
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Corporate account not found'
      });
    }
    
    const analytics = {
      totalUsers: account.users.length,
      activeUsers: account.users.filter(u => u.status === 'active').length,
      totalFleets: account.fleets.length,
      activeFleets: account.fleets.filter(f => f.status === 'active').length,
      totalRevenue: account.subscriptions.reduce((sum, s) => sum + s.amount, 0),
      monthlyRevenue: account.subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.amount, 0)
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching corporate account analytics',
      error: error.message
    });
  }
});

// Add user to corporate account
router.post('/:id/users', authenticateToken, async (req, res) => {
  try {
    const account = await CorporateAccount.findById(req.params.id);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Corporate account not found'
      });
    }
    
    // Add user logic here
    account.users.push(req.body.userId);
    await account.save();
    
    res.status(201).json({
      success: true,
      message: 'User added to corporate account successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding user to corporate account',
      error: error.message
    });
  }
});

// Remove user from corporate account
router.delete('/:id/users/:userId', authenticateToken, async (req, res) => {
  try {
    const account = await CorporateAccount.findById(req.params.id);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Corporate account not found'
      });
    }
    
    account.users = account.users.filter(u => u.toString() !== req.params.userId);
    await account.save();
    
    res.json({
      success: true,
      message: 'User removed from corporate account successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing user from corporate account',
      error: error.message
    });
  }
});

module.exports = router;
