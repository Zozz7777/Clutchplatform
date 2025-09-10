const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Subscription = require('../models/subscription');

// Get all subscriptions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ organization: req.user.organization })
      .populate('customer')
      .populate('plan');
    
    res.json({
      success: true,
      data: subscriptions,
      count: subscriptions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions',
      error: error.message
    });
  }
});

// Get single subscription
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('customer')
      .populate('plan')
      .populate('transactions');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription',
      error: error.message
    });
  }
});

// Create new subscription
router.post('/', authenticateToken, async (req, res) => {
  try {
    const subscriptionData = {
      ...req.body,
      organization: req.user.organization,
      createdBy: req.user.id
    };
    
    const subscription = new Subscription(subscriptionData);
    await subscription.save();
    
    res.status(201).json({
      success: true,
      data: subscription,
      message: 'Subscription created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating subscription',
      error: error.message
    });
  }
});

// Update subscription
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    res.json({
      success: true,
      data: subscription,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating subscription',
      error: error.message
    });
  }
});

// Cancel subscription
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.cancelledBy = req.user.id;
    await subscription.save();
    
    res.json({
      success: true,
      data: subscription,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
      error: error.message
    });
  }
});

// Renew subscription
router.post('/:id/renew', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    subscription.status = 'active';
    subscription.renewedAt = new Date();
    subscription.renewedBy = req.user.id;
    subscription.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await subscription.save();
    
    res.json({
      success: true,
      data: subscription,
      message: 'Subscription renewed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error renewing subscription',
      error: error.message
    });
  }
});

// Get subscription analytics
router.get('/analytics/overview', authenticateToken, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ organization: req.user.organization });
    
    const analytics = {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      cancelledSubscriptions: subscriptions.filter(s => s.status === 'cancelled').length,
      pendingSubscriptions: subscriptions.filter(s => s.status === 'pending').length,
      totalRevenue: subscriptions.reduce((sum, s) => sum + s.amount, 0),
      monthlyRevenue: subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.amount, 0),
      averageSubscriptionValue: subscriptions.length > 0 ? 
        subscriptions.reduce((sum, s) => sum + s.amount, 0) / subscriptions.length : 0,
      churnRate: subscriptions.length > 0 ? 
        (subscriptions.filter(s => s.status === 'cancelled').length / subscriptions.length) * 100 : 0
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription analytics',
      error: error.message
    });
  }
});

// Get subscription plans
router.get('/plans', authenticateToken, async (req, res) => {
  try {
    const plans = [
      {
        name: 'Standard',
        price: 999,
        billingCycle: 'monthly',
        features: ['Fleet Management', 'Basic Analytics', 'Email Support'],
        subscribers: 450,
        revenue: 449550
      },
      {
        name: 'Premium',
        price: 2499,
        billingCycle: 'monthly',
        features: ['Fleet Management', 'Advanced Analytics', 'AI Features', 'Priority Support'],
        subscribers: 680,
        revenue: 1699320
      },
      {
        name: 'Enterprise',
        price: 4999,
        billingCycle: 'monthly',
        features: ['Fleet Management', 'AI Analytics', 'White Label', 'Custom API', 'Dedicated Support'],
        subscribers: 50,
        revenue: 249950
      }
    ];
    
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription plans',
      error: error.message
    });
  }
});

module.exports = router;
