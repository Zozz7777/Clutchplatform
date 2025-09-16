/**
 * CMS (Content Management System) Routes
 * Complete CMS with content management, media handling, and help articles
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/rbac');
const { getCollection } = require('../config/optimized-database');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');

// Apply rate limiting
const cmsRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 100 });

// ==================== CONTENT MANAGEMENT ====================

// GET /api/v1/cms/content - Get all content
router.get('/content', authenticateToken, checkRole(['head_administrator', 'content_manager']), cmsRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, status, category, search } = req.query;
    const skip = (page - 1) * limit;
    
    const contentCollection = await getCollection('emails');
    
    // Build query
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const content = await contentCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await contentCollection.countDocuments(query);
    
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
      message: 'Content retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CONTENT_FAILED',
      message: 'Failed to retrieve content',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/cms/content/:id - Get content by ID
router.get('/content/:id', authenticateToken, checkRole(['head_administrator', 'content_manager']), cmsRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const contentCollection = await getCollection('emails');
    
    const content = await contentCollection.findOne({ _id: new ObjectId(id) });
    
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'CONTENT_NOT_FOUND',
        message: 'Content not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { content },
      message: 'Content retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CONTENT_FAILED',
      message: 'Failed to retrieve content',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/cms/content/slug/:slug - Get content by slug (public)
router.get('/content/slug/:slug', cmsRateLimit, async (req, res) => {
  try {
    const { slug } = req.params;
    const contentCollection = await getCollection('emails');
    
    const content = await contentCollection.findOne({ 
      slug: slug,
      status: 'published'
    });
    
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'CONTENT_NOT_FOUND',
        message: 'Content not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { content },
      message: 'Content retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get content by slug error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CONTENT_BY_SLUG_FAILED',
      message: 'Failed to retrieve content',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/cms/content - Create new content
router.post('/content', authenticateToken, checkRole(['head_administrator', 'content_manager']), cmsRateLimit, async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      type,
      category,
      tags,
      metaTitle,
      metaDescription,
      featuredImage,
      status,
      publishedAt,
      authorId
    } = req.body;
    
    if (!title || !slug || !content || !type) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Title, slug, content, and type are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const contentCollection = await getCollection('emails');
    
    // Check if slug already exists
    const existingContent = await contentCollection.findOne({ slug: slug });
    if (existingContent) {
      return res.status(409).json({
        success: false,
        error: 'SLUG_EXISTS',
        message: 'Content with this slug already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    const newContent = {
      title,
      slug,
      content,
      type,
      category: category || null,
      tags: tags || [],
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || null,
      featuredImage: featuredImage || null,
      status: status || 'draft',
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      authorId: authorId || req.user.userId,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await contentCollection.insertOne(newContent);
    
    res.status(201).json({
      success: true,
      data: { content: { ...newContent, _id: result.insertedId } },
      message: 'Content created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_CONTENT_FAILED',
      message: 'Failed to create content',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/cms/content/:id - Update content
router.put('/content/:id', authenticateToken, checkRole(['head_administrator', 'content_manager']), cmsRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const contentCollection = await getCollection('emails');
    
    const result = await contentCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'CONTENT_NOT_FOUND',
        message: 'Content not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const updatedContent = await contentCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { content: updatedContent },
      message: 'Content updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_CONTENT_FAILED',
      message: 'Failed to update content',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/cms/content/:id - Delete content
router.delete('/content/:id', authenticateToken, checkRole(['head_administrator']), cmsRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const contentCollection = await getCollection('emails');
    
    const result = await contentCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'CONTENT_NOT_FOUND',
        message: 'Content not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { id },
      message: 'Content deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_CONTENT_FAILED',
      message: 'Failed to delete content',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== MEDIA MANAGEMENT ====================

// GET /api/v1/cms/media - Get all media
router.get('/media', authenticateToken, checkRole(['head_administrator', 'content_manager']), cmsRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, category, search } = req.query;
    const skip = (page - 1) * limit;
    
    const mediaCollection = await getCollection('cms_media');
    
    // Build query
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { filename: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } },
        { alt: { $regex: search, $options: 'i' } }
      ];
    }
    
    const media = await mediaCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await mediaCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        media,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Media retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MEDIA_FAILED',
      message: 'Failed to retrieve media',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/cms/media - Upload media
router.post('/media', authenticateToken, checkRole(['head_administrator', 'content_manager']), cmsRateLimit, async (req, res) => {
  try {
    const {
      filename,
      originalName,
      type,
      size,
      url,
      alt,
      category,
      tags
    } = req.body;
    
    if (!filename || !originalName || !type || !url) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Filename, original name, type, and URL are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const mediaCollection = await getCollection('cms_media');
    
    const newMedia = {
      filename,
      originalName,
      type,
      size: size || null,
      url,
      alt: alt || null,
      category: category || null,
      tags: tags || [],
      uploadedBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await mediaCollection.insertOne(newMedia);
    
    res.status(201).json({
      success: true,
      data: { media: { ...newMedia, _id: result.insertedId } },
      message: 'Media uploaded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      error: 'UPLOAD_MEDIA_FAILED',
      message: 'Failed to upload media',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/cms/media/:id - Delete media
router.delete('/media/:id', authenticateToken, checkRole(['head_administrator', 'content_manager']), cmsRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const mediaCollection = await getCollection('cms_media');
    
    const result = await mediaCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'MEDIA_NOT_FOUND',
        message: 'Media not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { id },
      message: 'Media deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_MEDIA_FAILED',
      message: 'Failed to delete media',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== HELP ARTICLES ====================

// GET /api/v1/cms/help-articles - Get help articles
router.get('/help-articles', cmsRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, category, search } = req.query;
    const skip = (page - 1) * limit;
    
    const helpArticlesCollection = await getCollection('help_articles');
    
    // Build query
    const query = { status: 'published' };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const articles = await helpArticlesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await helpArticlesCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Help articles retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get help articles error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_HELP_ARTICLES_FAILED',
      message: 'Failed to retrieve help articles',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/cms/help-articles/:id - Get help article by ID
router.get('/help-articles/:id', cmsRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const helpArticlesCollection = await getCollection('help_articles');
    
    const article = await helpArticlesCollection.findOne({ 
      _id: new ObjectId(id),
      status: 'published'
    });
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'ARTICLE_NOT_FOUND',
        message: 'Help article not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Increment view count
    await helpArticlesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } }
    );
    
    res.json({
      success: true,
      data: { article },
      message: 'Help article retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get help article error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_HELP_ARTICLE_FAILED',
      message: 'Failed to retrieve help article',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/cms/help-articles - Create help article
router.post('/help-articles', authenticateToken, checkRole(['head_administrator', 'content_manager']), cmsRateLimit, async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      category,
      tags,
      status,
      featured,
      order
    } = req.body;
    
    if (!title || !slug || !content) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Title, slug, and content are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const helpArticlesCollection = await getCollection('help_articles');
    
    // Check if slug already exists
    const existingArticle = await helpArticlesCollection.findOne({ slug: slug });
    if (existingArticle) {
      return res.status(409).json({
        success: false,
        error: 'SLUG_EXISTS',
        message: 'Help article with this slug already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    const newArticle = {
      title,
      slug,
      content,
      category: category || null,
      tags: tags || [],
      status: status || 'draft',
      featured: featured || false,
      order: order || 0,
      views: 0,
      authorId: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await helpArticlesCollection.insertOne(newArticle);
    
    res.status(201).json({
      success: true,
      data: { article: { ...newArticle, _id: result.insertedId } },
      message: 'Help article created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create help article error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_HELP_ARTICLE_FAILED',
      message: 'Failed to create help article',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== CMS ANALYTICS ====================

// GET /api/v1/cms/analytics - Get CMS analytics
router.get('/analytics', authenticateToken, checkRole(['head_administrator', 'content_manager']), cmsRateLimit, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const contentCollection = await getCollection('emails');
    const mediaCollection = await getCollection('cms_media');
    const helpArticlesCollection = await getCollection('help_articles');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));
    
    // Content statistics
    const totalContent = await contentCollection.countDocuments();
    const publishedContent = await contentCollection.countDocuments({ status: 'published' });
    const draftContent = await contentCollection.countDocuments({ status: 'draft' });
    const recentContent = await contentCollection.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Media statistics
    const totalMedia = await mediaCollection.countDocuments();
    const recentMedia = await mediaCollection.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Help articles statistics
    const totalArticles = await helpArticlesCollection.countDocuments();
    const publishedArticles = await helpArticlesCollection.countDocuments({ status: 'published' });
    const featuredArticles = await helpArticlesCollection.countDocuments({ featured: true });
    
    // Content types distribution
    const contentTypes = await contentCollection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Media types distribution
    const mediaTypes = await mediaCollection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Most viewed content
    const mostViewedContent = await contentCollection
      .find({ status: 'published' })
      .sort({ views: -1 })
      .limit(10)
      .toArray();
    
    // Most viewed help articles
    const mostViewedArticles = await helpArticlesCollection
      .find({ status: 'published' })
      .sort({ views: -1 })
      .limit(10)
      .toArray();
    
    const analytics = {
      content: {
        total: totalContent,
        published: publishedContent,
        draft: draftContent,
        recent: recentContent,
        types: contentTypes
      },
      media: {
        total: totalMedia,
        recent: recentMedia,
        types: mediaTypes
      },
      helpArticles: {
        total: totalArticles,
        published: publishedArticles,
        featured: featuredArticles
      },
      popular: {
        content: mostViewedContent,
        articles: mostViewedArticles
      },
      period,
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'CMS analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get CMS analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CMS_ANALYTICS_FAILED',
      message: 'Failed to retrieve CMS analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== GENERIC HANDLERS ====================

// GET /api/v1/cms - Get CMS overview
router.get('/', authenticateToken, checkRole(['head_administrator', 'content_manager']), cmsRateLimit, async (req, res) => {
  res.json({
    success: true,
    message: 'CMS API is running',
    endpoints: {
      content: '/api/v1/cms/content',
      media: '/api/v1/cms/media',
      helpArticles: '/api/v1/cms/help-articles',
      analytics: '/api/v1/cms/analytics'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
