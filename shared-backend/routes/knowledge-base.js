const express = require('express');
const router = express.Router();
const { logger } = require('../config/logger');

// Simple authentication middleware (non-blocking)
const simpleAuth = (req, res, next) => {
  req.user = { 
    id: 'test-user', 
    role: 'admin',
    tenantId: 'test-tenant'
  };
  next();
};

// ==================== KNOWLEDGE BASE ROUTES ====================

// GET /api/v1/knowledge-base/articles - Get all articles
router.get('/articles', async (req, res) => {
  try {
    console.log('📚 Fetching knowledge base articles:', req.query);
    
    const mockArticles = [
      {
        id: 'article-1',
        title: 'Getting Started with Clutch',
        content: 'Learn how to use the Clutch platform effectively.',
        category: 'getting-started',
        status: 'published',
        tags: ['beginner', 'tutorial'],
        author: 'Clutch Team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'article-2',
        title: 'API Documentation',
        content: 'Complete guide to using the Clutch API.',
        category: 'api',
        status: 'published',
        tags: ['api', 'documentation'],
        author: 'Clutch Team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'article-3',
        title: 'Troubleshooting Guide',
        content: 'Common issues and their solutions.',
        category: 'support',
        status: 'published',
        tags: ['troubleshooting', 'help'],
        author: 'Clutch Team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: {
        articles: mockArticles,
        pagination: {
          page: 1,
          limit: 10,
          total: mockArticles.length,
          pages: 1
        }
      },
      message: 'Knowledge base articles retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Error fetching articles:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ARTICLES_FAILED',
      message: 'Failed to fetch knowledge base articles',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/knowledge-base/search - Search articles
router.get('/search', async (req, res) => {
  try {
    const { q, category, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_QUERY',
        message: 'Search query is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const mockResults = [
      {
        id: 'article-1',
        title: 'Getting Started with Clutch',
        content: 'Learn how to use the Clutch platform effectively.',
        category: 'getting-started',
        relevanceScore: 0.95
      }
    ];
    
    res.json({
      success: true,
      data: {
        results: mockResults,
        query: q,
        total: mockResults.length
      },
      message: 'Search completed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Error searching articles:', error);
    res.status(500).json({
      success: false,
      error: 'SEARCH_FAILED',
      message: 'Failed to search articles',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/knowledge-base/articles - Create new article
router.post('/articles', simpleAuth, async (req, res) => {
  try {
    const { title, content, category, tags, status = 'draft' } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Title and content are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const newArticle = {
      id: `article-${Date.now()}`,
      title,
      content,
      category: category || 'general',
      tags: tags || [],
      status,
      author: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      data: newArticle,
      message: 'Article created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Error creating article:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_ARTICLE_FAILED',
      message: 'Failed to create article',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/knowledge-base/articles/:id - Get specific article
router.get('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const mockArticle = {
      id: id,
      title: 'Getting Started with Clutch',
      content: 'Learn how to use the Clutch platform effectively.',
      category: 'getting-started',
      status: 'published',
      tags: ['beginner', 'tutorial'],
      author: 'Clutch Team',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 1250,
      likes: 45
    };
    
    res.json({
      success: true,
      data: mockArticle,
      message: 'Article retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Error fetching article:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ARTICLE_FAILED',
      message: 'Failed to fetch article',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/knowledge-base/articles/:id - Update article
router.put('/articles/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, status } = req.body;
    
    const updatedArticle = {
      id: id,
      title: title || 'Updated Article',
      content: content || 'Updated content',
      category: category || 'general',
      tags: tags || [],
      status: status || 'published',
      author: req.user.id,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedArticle,
      message: 'Article updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Error updating article:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_ARTICLE_FAILED',
      message: 'Failed to update article',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/knowledge-base/articles/:id - Delete article
router.delete('/articles/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      message: `Article ${id} deleted successfully`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Error deleting article:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_ARTICLE_FAILED',
      message: 'Failed to delete article',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/knowledge-base/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'getting-started', name: 'Getting Started', count: 5 },
      { id: 'api', name: 'API Documentation', count: 12 },
      { id: 'support', name: 'Support', count: 8 },
      { id: 'troubleshooting', name: 'Troubleshooting', count: 15 }
    ];
    
    res.json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('❌ Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_CATEGORIES_FAILED',
      message: 'Failed to fetch categories',
      timestamp: new Date().toISOString()
    });
  }
});


// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'knowledge-base'} service is running`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'knowledge-base'} item retrieved`,
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: `${'knowledge-base'} item created`,
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
    message: `${'knowledge-base'} item updated`,
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
    message: `${'knowledge-base'} item deleted`,
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'knowledge-base'} search results`,
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;