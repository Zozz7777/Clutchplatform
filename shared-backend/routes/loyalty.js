const express = require('express');
const router = express.Router();
const Loyalty = require('../models/Loyalty');
const User = require('../models/User');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');

// Rate limiting
const redeemLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 redemptions per 5 minutes
  message: { error: 'Too many redemption attempts, please try again later.' }
});

// Validation schemas
const redeemPointsSchema = Joi.object({
  points: Joi.number().integer().min(1).required(),
  description: Joi.string().max(200).required(),
  referenceType: Joi.string().valid('order', 'review', 'tip', 'referral', 'bonus', 'admin').optional()
});

const updatePreferencesSchema = Joi.object({
  notifications: Joi.object({
    pointsEarned: Joi.boolean(),
    badgeUnlocked: Joi.boolean(),
    tierUpgrade: Joi.boolean(),
    pointsExpiring: Joi.boolean()
  }),
  autoRedeem: Joi.object({
    enabled: Joi.boolean(),
    threshold: Joi.number().min(100).max(10000),
    rewardType: Joi.string().valid('discount', 'cashback', 'gift')
  })
});

// GET /api/v1/loyalty/points - Get user's loyalty points and history
router.get('/points', authenticateToken, async (req, res) => {
  try {
    let loyalty = await Loyalty.findOne({ userId: req.user.id });
    
    if (!loyalty) {
      // Create new loyalty account
      loyalty = new Loyalty({
        userId: req.user.id,
        language: req.user.language || 'en'
      });
      await loyalty.save();
    }

    // Get recent history (last 20 entries)
    const recentHistory = loyalty.history
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 20);

    // Get expiring points
    const expiringPoints = loyalty.getExpiringPoints(30);

    res.json({
      success: true,
      data: {
        pointsBalance: loyalty.pointsBalance,
        totalEarned: loyalty.totalEarned,
        totalRedeemed: loyalty.totalRedeemed,
        tier: loyalty.tier,
        tierProgress: loyalty.tierProgress,
        nextTier: loyalty.nextTier,
        badges: loyalty.badges,
        recentHistory,
        expiringPoints,
        stats: loyalty.stats,
        preferences: loyalty.preferences
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty points',
      error: error.message
    });
  }
});

// POST /api/v1/loyalty/earn - Add points to user account (admin/system only)
router.post('/earn',
  authenticateToken,
  authorizeRoles(['admin', 'system']),
  async (req, res) => {
    try {
      const { userId, points, description, referenceId, referenceType, expiresAt } = req.body;

      let loyalty = await Loyalty.findOne({ userId });
      if (!loyalty) {
        loyalty = new Loyalty({ userId });
        await loyalty.save();
      }

      await loyalty.addPoints(points, description, referenceId, referenceType, expiresAt);
      
      // Check for badge awards
      const newBadges = await loyalty.checkAndAwardBadges();

      res.json({
        success: true,
        data: {
          pointsBalance: loyalty.pointsBalance,
          newBadges
        },
        message: 'Points added successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add points',
        error: error.message
      });
    }
  }
);

// POST /api/v1/loyalty/redeem - Redeem points
router.post('/redeem',
  authenticateToken,
  redeemLimit,
  validateRequest(redeemPointsSchema),
  async (req, res) => {
    try {
      const loyalty = await Loyalty.findOne({ userId: req.user.id });
      if (!loyalty) {
        return res.status(404).json({
          success: false,
          message: 'Loyalty account not found'
        });
      }

      await loyalty.redeemPoints(
        req.body.points,
        req.body.description,
        req.body.referenceId,
        req.body.referenceType
      );

      res.json({
        success: true,
        data: {
          pointsBalance: loyalty.pointsBalance,
          redeemedPoints: req.body.points
        },
        message: 'Points redeemed successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to redeem points',
        error: error.message
      });
    }
  }
);

// GET /api/v1/loyalty/badges - Get user's badges
router.get('/badges', authenticateToken, async (req, res) => {
  try {
    const loyalty = await Loyalty.findOne({ userId: req.user.id });
    if (!loyalty) {
      return res.json({
        success: true,
        data: {
          badges: [],
          totalBadges: 0
        }
      });
    }

    // Group badges by category
    const badgesByCategory = loyalty.badges.reduce((acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      acc[badge.category].push(badge);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        badges: loyalty.badges,
        badgesByCategory,
        totalBadges: loyalty.badges.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch badges',
      error: error.message
    });
  }
});

// GET /api/v1/loyalty/leaderboard - Get loyalty leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'all', limit = 50, tier } = req.query;
    
    let dateFilter = {};
    if (period !== 'all') {
      const days = parseInt(period);
      if (!isNaN(days)) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        dateFilter = { 'history.date': { $gte: startDate } };
      }
    }

    const query = { ...dateFilter };
    if (tier) query.tier = tier;

    const leaderboard = await Loyalty.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: 1,
          pointsBalance: 1,
          totalEarned: 1,
          tier: 1,
          badges: 1,
          'user.name': 1,
          'user.profilePicture': 1,
          'stats.totalOrders': 1,
          'stats.totalReviews': 1,
          'stats.totalTips': 1
        }
      },
      { $sort: { pointsBalance: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Get tier distribution
    const tierDistribution = await Loyalty.aggregate([
      { $group: { _id: '$tier', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        leaderboard,
        tierDistribution,
        period
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
});

// PUT /api/v1/loyalty/preferences - Update user preferences
router.put('/preferences',
  authenticateToken,
  validateRequest(updatePreferencesSchema),
  async (req, res) => {
    try {
      const loyalty = await Loyalty.findOne({ userId: req.user.id });
      if (!loyalty) {
        return res.status(404).json({
          success: false,
          message: 'Loyalty account not found'
        });
      }

      if (req.body.notifications) {
        loyalty.preferences.notifications = {
          ...loyalty.preferences.notifications,
          ...req.body.notifications
        };
      }

      if (req.body.autoRedeem) {
        loyalty.preferences.autoRedeem = {
          ...loyalty.preferences.autoRedeem,
          ...req.body.autoRedeem
        };
      }

      await loyalty.save();

      res.json({
        success: true,
        data: loyalty.preferences,
        message: 'Preferences updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update preferences',
        error: error.message
    });
  }
});

// GET /api/v1/loyalty/rewards - Get available rewards catalog
router.get('/rewards', async (req, res) => {
  try {
    const { tier, category } = req.query;
    
    // This would typically come from a rewards catalog database
    // For now, we'll return a static catalog
    const rewards = [
      {
        id: 'discount_5',
        name: '5% Discount',
        description: 'Get 5% off your next order',
        pointsRequired: 100,
        category: 'discount',
        tier: 'bronze',
        type: 'discount',
        value: 5,
        maxUses: 1,
        expiresIn: 30 // days
      },
      {
        id: 'discount_10',
        name: '10% Discount',
        description: 'Get 10% off your next order',
        pointsRequired: 250,
        category: 'discount',
        tier: 'silver',
        type: 'discount',
        value: 10,
        maxUses: 1,
        expiresIn: 30
      },
      {
        id: 'free_shipping',
        name: 'Free Shipping',
        description: 'Free shipping on your next order',
        pointsRequired: 150,
        category: 'shipping',
        tier: 'bronze',
        type: 'shipping',
        value: 0,
        maxUses: 1,
        expiresIn: 30
      },
      {
        id: 'cashback_50',
        name: '$50 Cashback',
        description: 'Get $50 cashback to your account',
        pointsRequired: 1000,
        category: 'cashback',
        tier: 'gold',
        type: 'cashback',
        value: 50,
        maxUses: 1,
        expiresIn: 90
      },
      {
        id: 'premium_support',
        name: 'Premium Support',
        description: 'Priority customer support for 30 days',
        pointsRequired: 500,
        category: 'service',
        tier: 'silver',
        type: 'service',
        value: 30,
        maxUses: 1,
        expiresIn: 30
      }
    ];

    let filteredRewards = rewards;
    
    if (tier) {
      const tierHierarchy = { bronze: 0, silver: 1, gold: 2, platinum: 3 };
      const userTierLevel = tierHierarchy[tier] || 0;
      filteredRewards = rewards.filter(reward => 
        tierHierarchy[reward.tier] <= userTierLevel
      );
    }
    
    if (category) {
      filteredRewards = filteredRewards.filter(reward => 
        reward.category === category
      );
    }

    res.json({
      success: true,
      data: {
        rewards: filteredRewards,
        categories: ['discount', 'shipping', 'cashback', 'service'],
        totalRewards: filteredRewards.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rewards',
      error: error.message
    });
  }
});

// POST /api/v1/loyalty/rewards/:rewardId/redeem - Redeem a specific reward
router.post('/rewards/:rewardId/redeem',
  authenticateToken,
  redeemLimit,
  async (req, res) => {
    try {
      const { rewardId } = req.params;
      
      // Get reward details (in real implementation, this would come from database)
      const rewards = [
        {
          id: 'discount_5',
          name: '5% Discount',
          pointsRequired: 100,
          type: 'discount',
          value: 5
        },
        {
          id: 'discount_10',
          name: '10% Discount',
          pointsRequired: 250,
          type: 'discount',
          value: 10
        },
        {
          id: 'free_shipping',
          name: 'Free Shipping',
          pointsRequired: 150,
          type: 'shipping',
          value: 0
        },
        {
          id: 'cashback_50',
          name: '$50 Cashback',
          pointsRequired: 1000,
          type: 'cashback',
          value: 50
        },
        {
          id: 'premium_support',
          name: 'Premium Support',
          pointsRequired: 500,
          type: 'service',
          value: 30
        }
      ];

      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) {
        return res.status(404).json({
          success: false,
          message: 'Reward not found'
        });
      }

      const loyalty = await Loyalty.findOne({ userId: req.user.id });
      if (!loyalty) {
        return res.status(404).json({
          success: false,
          message: 'Loyalty account not found'
        });
      }

      if (loyalty.pointsBalance < reward.pointsRequired) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient points for this reward'
        });
      }

      // Redeem the reward
      await loyalty.redeemPoints(
        reward.pointsRequired,
        `Redeemed: ${reward.name}`,
        rewardId,
        'admin'
      );

      res.json({
        success: true,
        data: {
          reward,
          pointsBalance: loyalty.pointsBalance,
          redeemedPoints: reward.pointsRequired
        },
        message: 'Reward redeemed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to redeem reward',
        error: error.message
      });
    }
  }
);

// GET /api/v1/loyalty/analytics - Get loyalty analytics (admin only)
router.get('/analytics',
  authenticateToken,
  authorizeRoles(['admin']),
  async (req, res) => {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Total users with loyalty accounts
      const totalUsers = await Loyalty.countDocuments();

      // Points distribution
      const pointsDistribution = await Loyalty.aggregate([
        {
          $bucket: {
            groupBy: '$pointsBalance',
            boundaries: [0, 100, 500, 1000, 5000, 10000, Infinity],
            default: '10000+',
            output: {
              count: { $sum: 1 },
              avgPoints: { $avg: '$pointsBalance' }
            }
          }
        }
      ]);

      // Tier distribution
      const tierDistribution = await Loyalty.aggregate([
        { $group: { _id: '$tier', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Recent activity
      const recentActivity = await Loyalty.aggregate([
        { $unwind: '$history' },
        { $match: { 'history.date': { $gte: startDate } } },
        {
          $group: {
            _id: '$history.actionType',
            count: { $sum: 1 },
            totalPoints: { $sum: '$history.points' }
          }
        }
      ]);

      // Top earners
      const topEarners = await Loyalty.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: 1,
            pointsBalance: 1,
            totalEarned: 1,
            tier: 1,
            'user.name': 1
          }
        },
        { $sort: { totalEarned: -1 } },
        { $limit: 10 }
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          pointsDistribution,
          tierDistribution,
          recentActivity,
          topEarners,
          period
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch loyalty analytics',
        error: error.message
      });
    }
  }
);

module.exports = router;
