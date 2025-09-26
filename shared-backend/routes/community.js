const express = require('express');
const router = express.Router();
const CommunityTip = require('../models/CommunityTip');
const Loyalty = require('../models/Loyalty');
const User = require('../models/User');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');

// Rate limiting
const createTipLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tips per 15 minutes
  message: { error: 'Too many tips created, please try again later.' }
});

const voteLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 votes per minute
  message: { error: 'Too many votes, please try again later.' }
});

// Validation schemas
const createTipSchema = Joi.object({
  type: Joi.string().valid('tip', 'review').required(),
  title: Joi.string().max(200).required(),
  content: Joi.string().max(2000).required(),
  category: Joi.string().valid('maintenance', 'parts', 'driving', 'safety', 'fuel', 'general').required(),
  images: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      alt: Joi.string().max(100).default('')
    })
  ).max(5).default([]),
  rating: Joi.number().min(1).max(5).when('type', {
    is: 'review',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  partnerId: Joi.string().when('type', {
    is: 'review',
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),
  serviceId: Joi.string().when('type', {
    is: 'review',
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),
  tags: Joi.array().items(Joi.string().max(20)).max(10).default([]),
  language: Joi.string().valid('en', 'ar').default('en')
});

const voteSchema = Joi.object({
  voteType: Joi.string().valid('up', 'down').required()
});

const commentSchema = Joi.object({
  content: Joi.string().max(500).required()
});

// POST /api/v1/community/tips - Create a tip or review
router.post('/tips', 
  authenticateToken, 
  createTipLimit,
  validateRequest(createTipSchema),
  async (req, res) => {
    try {
      const tipData = {
        ...req.body,
        userId: req.user.id
      };

      const tip = new CommunityTip(tipData);
      await tip.save();

      // Award points for creating content
      const loyalty = await Loyalty.findOne({ userId: req.user.id });
      if (loyalty) {
        const points = tipData.type === 'tip' ? 10 : 15; // More points for reviews
        await loyalty.addPoints(
          points,
          `Created a ${tipData.type}`,
          tip._id,
          tipData.type
        );
        
        // Check for badge awards
        await loyalty.checkAndAwardBadges();
        await loyalty.updateStats(`total${tipData.type === 'tip' ? 'Tips' : 'Reviews'}`);
      }

      // Populate user data for response
      await tip.populate('userId', 'name email profilePicture');

      res.status(201).json({
        success: true,
        data: tip,
        message: `${tipData.type === 'tip' ? 'Tip' : 'Review'} created successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create tip/review',
        error: error.message
      });
    }
  }
);

// GET /api/v1/community/tips - List all tips and reviews
router.get('/tips', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      language = 'en',
      search
    } = req.query;

    const query = { isApproved: true, language };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = {};
    if (sortBy === 'votes') {
      sortOptions['votes.up'] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const tips = await CommunityTip.find(query)
      .populate('userId', 'name profilePicture')
      .populate('partnerId', 'name logo')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CommunityTip.countDocuments(query);

    res.json({
      success: true,
      data: {
        tips,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tips',
      error: error.message
    });
  }
});

// GET /api/v1/community/tips/:id - Get specific tip/review
router.get('/tips/:id', async (req, res) => {
  try {
    const tip = await CommunityTip.findById(req.params.id)
      .populate('userId', 'name profilePicture')
      .populate('partnerId', 'name logo')
      .populate('comments.userId', 'name profilePicture');

    if (!tip) {
      return res.status(404).json({
        success: false,
        message: 'Tip/review not found'
      });
    }

    // Increment view count
    await tip.incrementViewCount();

    res.json({
      success: true,
      data: tip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tip',
      error: error.message
    });
  }
});

// POST /api/v1/community/tips/:id/vote - Vote on tip/review
router.post('/tips/:id/vote',
  authenticateToken,
  voteLimit,
  validateRequest(voteSchema),
  async (req, res) => {
    try {
      const tip = await CommunityTip.findById(req.params.id);
      if (!tip) {
        return res.status(404).json({
          success: false,
          message: 'Tip/review not found'
        });
      }

      await tip.addVote(req.user.id, req.body.voteType);

      // Award points for voting
      const loyalty = await Loyalty.findOne({ userId: req.user.id });
      if (loyalty) {
        await loyalty.addPoints(1, 'Voted on community content', tip._id, 'tip');
      }

      res.json({
        success: true,
        data: {
          votes: tip.votes,
          totalVotes: tip.totalVotes
        },
        message: 'Vote recorded successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to record vote',
        error: error.message
      });
    }
  }
);

// DELETE /api/v1/community/tips/:id/vote - Remove vote
router.delete('/tips/:id/vote',
  authenticateToken,
  async (req, res) => {
    try {
      const tip = await CommunityTip.findById(req.params.id);
      if (!tip) {
        return res.status(404).json({
          success: false,
          message: 'Tip/review not found'
        });
      }

      await tip.removeVote(req.user.id);

      res.json({
        success: true,
        data: {
          votes: tip.votes,
          totalVotes: tip.totalVotes
        },
        message: 'Vote removed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to remove vote',
        error: error.message
      });
    }
  }
);

// POST /api/v1/community/tips/:id/comments - Add comment
router.post('/tips/:id/comments',
  authenticateToken,
  validateRequest(commentSchema),
  async (req, res) => {
    try {
      const tip = await CommunityTip.findById(req.params.id);
      if (!tip) {
        return res.status(404).json({
          success: false,
          message: 'Tip/review not found'
        });
      }

      await tip.addComment(req.user.id, req.body.content);

      // Award points for commenting
      const loyalty = await Loyalty.findOne({ userId: req.user.id });
      if (loyalty) {
        await loyalty.addPoints(2, 'Commented on community content', tip._id, 'tip');
      }

      // Populate the new comment
      await tip.populate('comments.userId', 'name profilePicture');

      res.json({
        success: true,
        data: tip.comments[tip.comments.length - 1],
        message: 'Comment added successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add comment',
        error: error.message
      });
    }
  }
);

// GET /api/v1/community/leaderboard - Get community leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'all', limit = 50 } = req.query;
    
    let dateFilter = {};
    if (period !== 'all') {
      const days = parseInt(period);
      if (!isNaN(days)) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        dateFilter = { createdAt: { $gte: startDate } };
      }
    }

    // Get top contributors by points
    const topContributors = await Loyalty.aggregate([
      { $match: dateFilter },
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
          'user.profilePicture': 1
        }
      },
      { $sort: { pointsBalance: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Get top tip creators
    const topTipCreators = await CommunityTip.aggregate([
      { $match: { ...dateFilter, type: 'tip' } },
      {
        $group: {
          _id: '$userId',
          tipCount: { $sum: 1 },
          totalVotes: { $sum: '$votes.up' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          tipCount: 1,
          totalVotes: 1,
          'user.name': 1,
          'user.profilePicture': 1
        }
      },
      { $sort: { tipCount: -1, totalVotes: -1 } },
      { $limit: 10 }
    ]);

    // Get top reviewers
    const topReviewers = await CommunityTip.aggregate([
      { $match: { ...dateFilter, type: 'review' } },
      {
        $group: {
          _id: '$userId',
          reviewCount: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          reviewCount: 1,
          avgRating: { $round: ['$avgRating', 1] },
          'user.name': 1,
          'user.profilePicture': 1
        }
      },
      { $sort: { reviewCount: -1, avgRating: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        topContributors,
        topTipCreators,
        topReviewers,
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
);

// GET /api/v1/community/stats - Get community statistics
router.get('/stats', async (req, res) => {
  try {
    const totalTips = await CommunityTip.countDocuments({ type: 'tip', isApproved: true });
    const totalReviews = await CommunityTip.countDocuments({ type: 'review', isApproved: true });
    const totalVotes = await CommunityTip.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, total: { $sum: '$votes.up' } } }
    ]);

    const categoryStats = await CommunityTip.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentActivity = await CommunityTip.find({ isApproved: true })
      .populate('userId', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalTips,
        totalReviews,
        totalVotes: totalVotes[0]?.total || 0,
        categoryStats,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community stats',
      error: error.message
    });
  }
});

// PUT /api/v1/community/tips/:id - Update tip/review (owner only)
router.put('/tips/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const tip = await CommunityTip.findById(req.params.id);
      if (!tip) {
        return res.status(404).json({
          success: false,
          message: 'Tip/review not found'
        });
      }

      // Check ownership
      if (!tip.userId.equals(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this tip/review'
        });
      }

      const allowedUpdates = ['title', 'content', 'category', 'images', 'tags'];
      const updates = {};
      
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      Object.assign(tip, updates);
      await tip.save();

      res.json({
        success: true,
        data: tip,
        message: 'Tip/review updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update tip/review',
        error: error.message
      });
    }
  }
);

// DELETE /api/v1/community/tips/:id - Delete tip/review (owner only)
router.delete('/tips/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const tip = await CommunityTip.findById(req.params.id);
      if (!tip) {
        return res.status(404).json({
          success: false,
          message: 'Tip/review not found'
        });
      }

      // Check ownership
      if (!tip.userId.equals(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this tip/review'
        });
      }

      await CommunityTip.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Tip/review deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete tip/review',
        error: error.message
      });
    }
  }
);

module.exports = router;
