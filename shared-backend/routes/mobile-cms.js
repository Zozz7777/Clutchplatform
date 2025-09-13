const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== MOBILE CMS ROUTES ====================

// GET /api/v1/mobile-cms/content - Get all content with filtering
router.get('/content', async (req, res) => {
  try {
    console.log('📱 Fetching mobile CMS content:', req.query);
    
    const { 
      page = 1, 
      limit = 20, 
      type, 
      status = 'published', 
      category,
      platform,
      version
    } = req.query;
    
    const skip = (page - 1) * limit;
    const collection = await getCollection('mobile_content');
    
    // Build query
    const query = { status };
    if (type) query.type = type;
    if (category) query.category = category;
    if (platform) query.platform = platform;
    if (version) query.version = version;
    
    // Get content with pagination
    const content = await collection
      .find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    // Get total count
    const total = await collection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        content,
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
    console.error('❌ Error fetching mobile content:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_CONTENT_FAILED',
      message: 'Failed to fetch mobile content'
    });
  }
});

// POST /api/v1/mobile-cms/content - Create new content
router.post('/content', authenticateToken, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    console.log('📝 Creating new mobile content:', req.body);
    
    const { 
      title, 
      content, 
      type, 
      category, 
      platform = 'all',
      priority = 1,
      status = 'draft',
      metadata = {},
      tags = []
    } = req.body;
    
    // Validation
    if (!title || !content || !type || !category) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Title, content, type, and category are required'
      });
    }
    
    const collection = await getCollection('mobile_content');
    
    const mobileContent = {
      title,
      content,
      type,
      category,
      platform,
      priority: parseInt(priority),
      status,
      metadata,
      tags: Array.isArray(tags) ? tags : [],
      author: req.user.id,
      authorName: req.user.name || req.user.email,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null,
      views: 0,
      downloads: 0,
      ratings: [],
      comments: []
    };
    
    const result = await collection.insertOne(mobileContent);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...mobileContent
      },
      message: 'Mobile content created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating mobile content:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_CONTENT_FAILED',
      message: 'Failed to create mobile content'
    });
  }
});

// GET /api/v1/mobile-cms/content/:id - Get specific content
router.get('/content/:id', async (req, res) => {
  try {
    console.log('📖 Fetching mobile content:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const collection = await getCollection('mobile_content');
    
    const content = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'CONTENT_NOT_FOUND',
        message: 'Mobile content not found'
      });
    }
    
    // Increment view count
    await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { views: 1 } }
    );
    
    res.json({
      success: true,
      data: content,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching mobile content:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_CONTENT_FAILED',
      message: 'Failed to fetch mobile content'
    });
  }
});

// PUT /api/v1/mobile-cms/content/:id - Update content
router.put('/content/:id', authenticateToken, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    console.log('✏️ Updating mobile content:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { 
      title, 
      content, 
      type, 
      category, 
      platform,
      priority,
      status,
      metadata,
      tags
    } = req.body;
    
    const collection = await getCollection('mobile_content');
    
    // Check if content exists
    const existingContent = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!existingContent) {
      return res.status(404).json({
        success: false,
        error: 'CONTENT_NOT_FOUND',
        message: 'Mobile content not found'
      });
    }
    
    // Build update object
    const updateData = { updatedAt: new Date() };
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (type) updateData.type = type;
    if (category) updateData.category = category;
    if (platform) updateData.platform = platform;
    if (priority) updateData.priority = parseInt(priority);
    if (status) updateData.status = status;
    if (metadata) updateData.metadata = metadata;
    if (tags) updateData.tags = Array.isArray(tags) ? tags : [];
    
    // Increment version if content changed
    if (content && content !== existingContent.content) {
      updateData.version = existingContent.version + 1;
    }
    
    // Set publishedAt if status changed to published
    if (status === 'published' && existingContent.status !== 'published') {
      updateData.publishedAt = new Date();
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'No changes made to content'
      });
    }
    
    // Get updated content
    const updatedContent = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    res.json({
      success: true,
      data: updatedContent,
      message: 'Mobile content updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating mobile content:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_CONTENT_FAILED',
      message: 'Failed to update mobile content'
    });
  }
});

// DELETE /api/v1/mobile-cms/content/:id - Delete content
router.delete('/content/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    console.log('🗑️ Deleting mobile content:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const collection = await getCollection('mobile_content');
    
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'CONTENT_NOT_FOUND',
        message: 'Mobile content not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Mobile content deleted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error deleting mobile content:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_CONTENT_FAILED',
      message: 'Failed to delete mobile content'
    });
  }
});

// GET /api/v1/mobile-cms/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    console.log('📂 Fetching mobile CMS categories');
    
    const collection = await getCollection('mobile_content');
    
    // Get unique categories with content counts
    const categories = await collection.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    const formattedCategories = categories.map(cat => ({
      name: cat._id,
      count: cat.count
    }));
    
    res.json({
      success: true,
      data: formattedCategories,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_CATEGORIES_FAILED',
      message: 'Failed to fetch categories'
    });
  }
});

// GET /api/v1/mobile-cms/platforms - Get all platforms
router.get('/platforms', async (req, res) => {
  try {
    console.log('📱 Fetching mobile platforms');
    
    const collection = await getCollection('mobile_content');
    
    // Get unique platforms with content counts
    const platforms = await collection.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    const formattedPlatforms = platforms.map(platform => ({
      name: platform._id,
      count: platform.count
    }));
    
    res.json({
      success: true,
      data: formattedPlatforms,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching platforms:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_PLATFORMS_FAILED',
      message: 'Failed to fetch platforms'
    });
  }
});

// GET /api/v1/mobile-cms/search - Search content
router.get('/search', async (req, res) => {
  try {
    console.log('🔍 Searching mobile content:', req.query);
    
    const { q: query, type, category, platform, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Search query is required'
      });
    }
    
    const collection = await getCollection('mobile_content');
    
    // Build search query
    const searchQuery = {
      status: 'published',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };
    
    if (type) searchQuery.type = type;
    if (category) searchQuery.category = category;
    if (platform) searchQuery.platform = platform;
    
    const content = await collection
      .find(searchQuery)
      .sort({ priority: -1, views: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({
      success: true,
      data: {
        query,
        results: content,
        count: content.length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error searching content:', error);
    res.status(500).json({
      success: false,
      error: 'SEARCH_FAILED',
      message: 'Failed to search content'
    });
  }
});

// POST /api/v1/mobile-cms/content/:id/rate - Rate content
router.post('/content/:id/rate', authenticateToken, async (req, res) => {
  try {
    console.log('⭐ Rating mobile content:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const collection = await getCollection('mobile_content');
    
    // Check if content exists
    const existingContent = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!existingContent) {
      return res.status(404).json({
        success: false,
        error: 'CONTENT_NOT_FOUND',
        message: 'Mobile content not found'
      });
    }
    
    // Check if user already rated
    const existingRating = existingContent.ratings.find(r => r.user === req.user.id);
    if (existingRating) {
      return res.status(409).json({
        success: false,
        error: 'ALREADY_RATED',
        message: 'You have already rated this content'
      });
    }
    
    const ratingData = {
      user: req.user.id,
      userName: req.user.name || req.user.email,
      rating: parseInt(rating),
      comment: comment || '',
      createdAt: new Date()
    };
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $push: { ratings: ratingData } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'RATING_FAILED',
        message: 'Failed to add rating'
      });
    }
    
    res.json({
      success: true,
      data: ratingData,
      message: 'Content rated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error rating content:', error);
    res.status(500).json({
      success: false,
      error: 'RATE_CONTENT_FAILED',
      message: 'Failed to rate content'
    });
  }
});

// POST /api/v1/mobile-cms/content/:id/comment - Add comment to content
router.post('/content/:id/comment', authenticateToken, async (req, res) => {
  try {
    console.log('💬 Adding comment to mobile content:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Comment content is required'
      });
    }
    
    const collection = await getCollection('mobile_content');
    
    const comment = {
      id: new ObjectId(),
      content,
      author: req.user.id,
      authorName: req.user.name || req.user.email,
      createdAt: new Date()
    };
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $push: { comments: comment } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'CONTENT_NOT_FOUND',
        message: 'Mobile content not found'
      });
    }
    
    res.json({
      success: true,
      data: comment,
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

// GET /api/v1/mobile-cms/analytics - Get content analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    console.log('📊 Fetching mobile CMS analytics');
    
    const { startDate, endDate } = req.query;
    const collection = await getCollection('mobile_content');
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Get analytics
    const [
      totalContent,
      publishedContent,
      draftContent,
      contentByType,
      contentByCategory,
      contentByPlatform,
      topRatedContent,
      mostViewedContent
    ] = await Promise.all([
      // Total content
      collection.countDocuments(dateFilter),
      
      // Published content
      collection.countDocuments({ ...dateFilter, status: 'published' }),
      
      // Draft content
      collection.countDocuments({ ...dateFilter, status: 'draft' }),
      
      // Content by type
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Content by category
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Content by platform
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$platform', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Top rated content
      collection.aggregate([
        { $match: { ...dateFilter, status: 'published' } },
        { $addFields: { avgRating: { $avg: '$ratings.rating' } } },
        { $sort: { avgRating: -1 } },
        { $limit: 10 }
      ]).toArray(),
      
      // Most viewed content
      collection.aggregate([
        { $match: { ...dateFilter, status: 'published' } },
        { $sort: { views: -1 } },
        { $limit: 10 }
      ]).toArray()
    ]);
    
    const analytics = {
      total: totalContent,
      published: publishedContent,
      draft: draftContent,
      byType: contentByType,
      byCategory: contentByCategory,
      byPlatform: contentByPlatform,
      topRated: topRatedContent,
      mostViewed: mostViewedContent
    };
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ANALYTICS_FAILED',
      message: 'Failed to fetch analytics'
    });
  }
});


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