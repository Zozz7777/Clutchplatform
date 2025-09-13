const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== FEEDBACK SYSTEM ROUTES ====================

// GET /api/v1/feedback-system/feedback - Get all feedback with filtering
router.get('/feedback', authenticateToken, async (req, res) => {
  try {
    console.log('💬 Fetching feedback:', req.query);
    
    const { 
      page = 1, 
      limit = 20, 
      type, 
      status,
      priority,
      category,
      rating,
      startDate,
      endDate,
      assignedTo
    } = req.query;
    
    const skip = (page - 1) * limit;
    const collection = await getCollection('feedback');
    
    // Build query
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (rating) query.rating = parseInt(rating);
    if (assignedTo) query.assignedTo = assignedTo;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Get feedback with pagination
    const feedback = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    // Get total count
    const total = await collection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_FEEDBACK_FAILED',
      message: 'Failed to fetch feedback'
    });
  }
});

// POST /api/v1/feedback-system/feedback - Submit new feedback
router.post('/feedback', authenticateToken, async (req, res) => {
  try {
    console.log('💬 Submitting new feedback:', req.body);
    
    const { 
      type = 'general',
      category = 'other',
      title,
      description,
      rating,
      priority = 'medium',
      tags = [],
      metadata = {}
    } = req.body;
    
    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Title and description are required'
      });
    }
    
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const collection = await getCollection('feedback');
    
    const feedback = {
      type,
      category,
      title,
      description,
      rating: rating ? parseInt(rating) : null,
      priority,
      tags: Array.isArray(tags) ? tags : [],
      metadata,
      status: 'open',
      submittedBy: req.user.id,
      submittedByName: req.user.name || req.user.email,
      assignedTo: null,
      assignedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null,
      resolution: null,
      comments: [],
      attachments: [],
      votes: {
        helpful: 0,
        notHelpful: 0,
        voters: []
      },
      isPublic: false,
      isAnonymous: false
    };
    
    const result = await collection.insertOne(feedback);
    
    // Send notification to admins/managers
    await notifyFeedbackSubmission(feedback);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...feedback
      },
      message: 'Feedback submitted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'SUBMIT_FEEDBACK_FAILED',
      message: 'Failed to submit feedback'
    });
  }
});

// GET /api/v1/feedback-system/feedback/:id - Get specific feedback
router.get('/feedback/:id', authenticateToken, async (req, res) => {
  try {
    console.log('💬 Fetching feedback:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const collection = await getCollection('feedback');
    
    const feedback = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'FEEDBACK_NOT_FOUND',
        message: 'Feedback not found'
      });
    }
    
    // Check if user can view this feedback
    if (!canViewFeedback(feedback, req.user)) {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'You do not have permission to view this feedback'
      });
    }
    
    res.json({
      success: true,
      data: feedback,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_FEEDBACK_FAILED',
      message: 'Failed to fetch feedback'
    });
  }
});

// PUT /api/v1/feedback-system/feedback/:id - Update feedback
router.put('/feedback/:id', authenticateToken, async (req, res) => {
  try {
    console.log('✏️ Updating feedback:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { 
      status, 
      priority, 
      assignedTo, 
      resolution,
      tags,
      isPublic
    } = req.body;
    
    const collection = await getCollection('feedback');
    
    // Check if feedback exists
    const existingFeedback = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!existingFeedback) {
      return res.status(404).json({
        success: false,
        error: 'FEEDBACK_NOT_FOUND',
        message: 'Feedback not found'
      });
    }
    
    // Check permissions
    if (!canEditFeedback(existingFeedback, req.user)) {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'You do not have permission to edit this feedback'
      });
    }
    
    // Build update object
    const updateData = { updatedAt: new Date() };
    if (status) {
      updateData.status = status;
      if (status === 'resolved' && !existingFeedback.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
    }
    if (priority) updateData.priority = priority;
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo;
      updateData.assignedAt = assignedTo ? new Date() : null;
    }
    if (resolution !== undefined) updateData.resolution = resolution;
    if (tags) updateData.tags = Array.isArray(tags) ? tags : [];
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'No changes made to feedback'
      });
    }
    
    // Get updated feedback
    const updatedFeedback = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    // Send notifications for status changes
    if (status && status !== existingFeedback.status) {
      await notifyFeedbackStatusChange(updatedFeedback, existingFeedback.status);
    }
    
    res.json({
      success: true,
      data: updatedFeedback,
      message: 'Feedback updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating feedback:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_FEEDBACK_FAILED',
      message: 'Failed to update feedback'
    });
  }
});

// POST /api/v1/feedback-system/feedback/:id/comments - Add comment to feedback
router.post('/feedback/:id/comments', authenticateToken, async (req, res) => {
  try {
    console.log('💬 Adding comment to feedback:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { comment, isInternal = false } = req.body;
    
    if (!comment) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Comment is required'
      });
    }
    
    const collection = await getCollection('feedback');
    
    // Check if feedback exists
    const feedback = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'FEEDBACK_NOT_FOUND',
        message: 'Feedback not found'
      });
    }
    
    // Check permissions
    if (!canCommentOnFeedback(feedback, req.user, isInternal)) {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'You do not have permission to comment on this feedback'
      });
    }
    
    const newComment = {
      id: new ObjectId(),
      comment,
      isInternal,
      commentedBy: req.user.id,
      commentedByName: req.user.name || req.user.email,
      commentedAt: new Date()
    };
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $push: { comments: newComment },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'COMMENT_FAILED',
        message: 'Failed to add comment'
      });
    }
    
    // Send notification to feedback submitter and assigned person
    await notifyFeedbackComment(feedback, newComment);
    
    res.json({
      success: true,
      data: newComment,
      message: 'Comment added successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    res.status(500).json({
      success: false,
      error: 'ADD_COMMENT_FAILED',
      message: 'Failed to add comment'
    });
  }
});

// POST /api/v1/feedback-system/feedback/:id/vote - Vote on feedback
router.post('/feedback/:id/vote', authenticateToken, async (req, res) => {
  try {
    console.log('👍 Voting on feedback:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { vote } = req.body; // 'helpful' or 'not_helpful'
    
    if (!vote || !['helpful', 'not_helpful'].includes(vote)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Vote must be "helpful" or "not_helpful"'
      });
    }
    
    const collection = await getCollection('feedback');
    
    // Check if feedback exists
    const feedback = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'FEEDBACK_NOT_FOUND',
        message: 'Feedback not found'
      });
    }
    
    // Check if user already voted
    const existingVote = feedback.votes.voters.find(v => v.userId === req.user.id);
    if (existingVote) {
      return res.status(400).json({
        success: false,
        error: 'ALREADY_VOTED',
        message: 'You have already voted on this feedback'
      });
    }
    
    // Add vote
    const voteData = {
      userId: req.user.id,
      vote,
      votedAt: new Date()
    };
    
    const updateQuery = {
      $push: { 'votes.voters': voteData },
      $inc: { [`votes.${vote === 'helpful' ? 'helpful' : 'notHelpful'}`]: 1 }
    };
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      updateQuery
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'VOTE_FAILED',
        message: 'Failed to record vote'
      });
    }
    
    res.json({
      success: true,
      data: {
        vote,
        votedAt: voteData.votedAt
      },
      message: 'Vote recorded successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error voting on feedback:', error);
    res.status(500).json({
      success: false,
      error: 'VOTE_FAILED',
      message: 'Failed to record vote'
    });
  }
});

// GET /api/v1/feedback-system/analytics - Get feedback analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('📊 Fetching feedback analytics');
    
    const { startDate, endDate } = req.query;
    const collection = await getCollection('feedback');
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Get analytics
    const [
      totalFeedback,
      feedbackByStatus,
      feedbackByType,
      feedbackByCategory,
      feedbackByPriority,
      avgRating,
      responseTime,
      topCategories,
      topSubmitters
    ] = await Promise.all([
      // Total feedback
      collection.countDocuments(dateFilter),
      
      // Feedback by status
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Feedback by type
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Feedback by category
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Feedback by priority
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Average rating
      collection.aggregate([
        { $match: { ...dateFilter, rating: { $exists: true } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]).toArray(),
      
      // Average response time
      collection.aggregate([
        { $match: { ...dateFilter, resolvedAt: { $exists: true } } },
        {
          $project: {
            responseTime: {
              $divide: [
                { $subtract: ['$resolvedAt', '$createdAt'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        },
        { $group: { _id: null, avgResponseTime: { $avg: '$responseTime' } } }
      ]).toArray(),
      
      // Top categories
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray(),
      
      // Top submitters
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$submittedBy', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray()
    ]);
    
    const analytics = {
      overview: {
        totalFeedback,
        avgRating: Math.round((avgRating[0]?.avgRating || 0) * 100) / 100,
        avgResponseTime: Math.round((responseTime[0]?.avgResponseTime || 0) * 100) / 100
      },
      distribution: {
        byStatus: feedbackByStatus,
        byType: feedbackByType,
        byCategory: feedbackByCategory,
        byPriority: feedbackByPriority
      },
      topPerformers: {
        categories: topCategories,
        submitters: topSubmitters
      }
    };
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching feedback analytics:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ANALYTICS_FAILED',
      message: 'Failed to fetch feedback analytics'
    });
  }
});

// GET /api/v1/feedback-system/surveys - Get feedback surveys
router.get('/surveys', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Fetching feedback surveys');
    
    const { active = true } = req.query;
    const collection = await getCollection('feedback_surveys');
    
    const query = active ? { isActive: true } : {};
    
    const surveys = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: {
        surveys,
        totalSurveys: surveys.length
      },
      message: 'Feedback surveys retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching surveys:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_SURVEYS_FAILED',
      message: 'Failed to fetch feedback surveys'
    });
  }
});

// POST /api/v1/feedback-system/surveys - Create feedback survey
router.post('/surveys', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('📋 Creating feedback survey');
    
    const { 
      title, 
      description, 
      questions, 
      targetAudience = 'all',
      isActive = true,
      expiresAt
    } = req.body;
    
    if (!title || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Title and questions array are required'
      });
    }
    
    const collection = await getCollection('feedback_surveys');
    
    const survey = {
      title,
      description: description || '',
      questions,
      targetAudience,
      isActive,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: 0,
      isPublic: true
    };
    
    const result = await collection.insertOne(survey);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...survey
      },
      message: 'Feedback survey created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating survey:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_SURVEY_FAILED',
      message: 'Failed to create feedback survey'
    });
  }
});

// Helper functions
function canViewFeedback(feedback, user) {
  // Public feedback can be viewed by anyone
  if (feedback.isPublic) return true;
  
  // Submitter can view their own feedback
  if (feedback.submittedBy === user.id) return true;
  
  // Assigned person can view feedback assigned to them
  if (feedback.assignedTo === user.id) return true;
  
  // Admins and managers can view all feedback
  if (user.roles?.includes('admin') || user.roles?.includes('manager')) return true;
  
  return false;
}

function canEditFeedback(feedback, user) {
  // Admins and managers can edit any feedback
  if (user.roles?.includes('admin') || user.roles?.includes('manager')) return true;
  
  // Assigned person can edit feedback assigned to them
  if (feedback.assignedTo === user.id) return true;
  
  return false;
}

function canCommentOnFeedback(feedback, user, isInternal) {
  // Internal comments only for admins, managers, and assigned person
  if (isInternal) {
    return user.roles?.includes('admin') || 
           user.roles?.includes('manager') || 
           feedback.assignedTo === user.id;
  }
  
  // Public comments can be made by submitter, assigned person, admins, and managers
  return feedback.submittedBy === user.id || 
         feedback.assignedTo === user.id ||
         user.roles?.includes('admin') || 
         user.roles?.includes('manager');
}

async function notifyFeedbackSubmission(feedback) {
  // In production, this would send notifications to admins/managers
  console.log('📧 Notification: New feedback submitted:', feedback.title);
}

async function notifyFeedbackStatusChange(feedback, oldStatus) {
  // In production, this would send notifications to relevant parties
  console.log('📧 Notification: Feedback status changed from', oldStatus, 'to', feedback.status);
}

async function notifyFeedbackComment(feedback, comment) {
  // In production, this would send notifications to feedback submitter and assigned person
  console.log('📧 Notification: New comment added to feedback:', feedback.title);
}


// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} service is running`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item retrieved`,
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item created`,
    data: { id: Date.now(), ...req.body, createdAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'POST',
    path: '/'
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item updated`,
    data: { id: id, ...req.body, updatedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'PUT',
    path: `/${id}`
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item deleted`,
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} search results`,
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;
