const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== KNOWLEDGE BASE ROUTES ====================

// GET /api/v1/knowledge-base/articles - Get all articles with pagination and filtering
router.get('/articles', async (req, res) => {
  try {
    console.log('📚 Fetching knowledge base articles:', req.query);
    
    const { page = 1, limit = 10, category, search, status = 'published' } = req.query;
    const skip = (page - 1) * limit;
    
    const collection = await getCollection('knowledge_articles');
    
    // Build query
    const query = { status };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Get articles with pagination
    const articles = await collection
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
        articles,
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
    console.error('❌ Error fetching articles:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ARTICLES_FAILED',
      message: 'Failed to fetch articles'
    });
  }
});

// POST /api/v1/knowledge-base/articles - Create new article
router.post('/articles', authenticateToken, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    console.log('📝 Creating new knowledge base article:', req.body);
    
    const { title, content, category, tags = [], status = 'draft' } = req.body;
    
    // Validation
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Title, content, and category are required'
      });
    }
    
    const collection = await getCollection('knowledge_articles');
    
    const article = {
      title,
      content,
      category,
      tags: Array.isArray(tags) ? tags : [],
      status,
      author: req.user.id,
      authorName: req.user.name || req.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      likes: 0,
      comments: []
    };
    
    const result = await collection.insertOne(article);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...article
      },
      message: 'Article created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating article:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_ARTICLE_FAILED',
      message: 'Failed to create article'
    });
  }
});

// GET /api/v1/knowledge-base/articles/:id - Get specific article
router.get('/articles/:id', async (req, res) => {
  try {
    console.log('📖 Fetching article:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const collection = await getCollection('knowledge_articles');
    
    const article = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'ARTICLE_NOT_FOUND',
        message: 'Article not found'
      });
    }
    
    // Increment view count
    await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { views: 1 } }
    );
    
    res.json({
      success: true,
      data: article,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching article:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ARTICLE_FAILED',
      message: 'Failed to fetch article'
    });
  }
});

// PUT /api/v1/knowledge-base/articles/:id - Update article
router.put('/articles/:id', authenticateToken, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    console.log('✏️ Updating article:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { title, content, category, tags, status } = req.body;
    
    const collection = await getCollection('knowledge_articles');
    
    // Check if article exists
    const existingArticle = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        error: 'ARTICLE_NOT_FOUND',
        message: 'Article not found'
      });
    }
    
    // Build update object
    const updateData = { updatedAt: new Date() };
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (tags) updateData.tags = Array.isArray(tags) ? tags : [];
    if (status) updateData.status = status;
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'No changes made to article'
      });
    }
    
    // Get updated article
    const updatedArticle = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    res.json({
      success: true,
      data: updatedArticle,
      message: 'Article updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating article:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_ARTICLE_FAILED',
      message: 'Failed to update article'
    });
  }
});

// DELETE /api/v1/knowledge-base/articles/:id - Delete article
router.delete('/articles/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    console.log('🗑️ Deleting article:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const collection = await getCollection('knowledge_articles');
    
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'ARTICLE_NOT_FOUND',
        message: 'Article not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Article deleted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error deleting article:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_ARTICLE_FAILED',
      message: 'Failed to delete article'
    });
  }
});

// GET /api/v1/knowledge-base/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    console.log('📂 Fetching knowledge base categories');
    
    const collection = await getCollection('knowledge_articles');
    
    // Get unique categories with article counts
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

// POST /api/v1/knowledge-base/categories - Create new category
router.post('/categories', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    console.log('📂 Creating new category:', req.body);
    
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Category name is required'
      });
    }
    
    const collection = await getCollection('knowledge_categories');
    
    // Check if category already exists
    const existingCategory = await collection.findOne({ name: name.toLowerCase() });
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        error: 'CATEGORY_EXISTS',
        message: 'Category already exists'
      });
    }
    
    const category = {
      name: name.toLowerCase(),
      displayName: name,
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.id
    };
    
    const result = await collection.insertOne(category);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...category
      },
      message: 'Category created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating category:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_CATEGORY_FAILED',
      message: 'Failed to create category'
    });
  }
});

// GET /api/v1/knowledge-base/search - Search articles
router.get('/search', async (req, res) => {
  try {
    console.log('🔍 Searching knowledge base:', req.query);
    
    const { q: query, category, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Search query is required'
      });
    }
    
    const collection = await getCollection('knowledge_articles');
    
    // Build search query
    const searchQuery = {
      status: 'published',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };
    
    if (category) {
      searchQuery.category = category;
    }
    
    const articles = await collection
      .find(searchQuery)
      .sort({ views: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({
      success: true,
      data: {
        query,
        results: articles,
        count: articles.length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error searching articles:', error);
    res.status(500).json({
      success: false,
      error: 'SEARCH_FAILED',
      message: 'Failed to search articles'
    });
  }
});

// POST /api/v1/knowledge-base/articles/:id/like - Like an article
router.post('/articles/:id/like', authenticateToken, async (req, res) => {
  try {
    console.log('👍 Liking article:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const collection = await getCollection('knowledge_articles');
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { likes: 1 } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'ARTICLE_NOT_FOUND',
        message: 'Article not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Article liked successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error liking article:', error);
    res.status(500).json({
      success: false,
      error: 'LIKE_ARTICLE_FAILED',
      message: 'Failed to like article'
    });
  }
});

// POST /api/v1/knowledge-base/articles/:id/comment - Add comment to article
router.post('/articles/:id/comment', authenticateToken, async (req, res) => {
  try {
    console.log('💬 Adding comment to article:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Comment content is required'
      });
    }
    
    const collection = await getCollection('knowledge_articles');
    
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
        error: 'ARTICLE_NOT_FOUND',
        message: 'Article not found'
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

module.exports = router;
