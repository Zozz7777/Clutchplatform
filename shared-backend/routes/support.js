const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { validate } = require('../middleware/inputValidation');
const { logger } = require('../config/logger');

// Rate limiting for support endpoints
const supportRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many support requests from this IP, please try again later.'
});

// Apply rate limiting to all support routes
router.use(supportRateLimit);

// ==================== SUPPORT TICKETS ====================

// Get support tickets
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const { status, priority, category, assignedTo, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    // Mock support tickets (replace with actual support system)
    const tickets = [
      {
        id: '1',
        title: 'Login Issue - Cannot Access Dashboard',
        description: 'I am unable to log into the admin dashboard. Getting a 401 error.',
        status: 'open',
        priority: 'high',
        category: 'technical',
        assignedTo: 'support_team',
        createdBy: 'user_123',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T14:30:00Z'),
        lastActivity: new Date('2024-01-15T14:30:00Z'),
        tags: ['login', 'dashboard', 'authentication']
      },
      {
        id: '2',
        title: 'Feature Request - Dark Mode',
        description: 'Would like to request a dark mode theme for the admin panel.',
        status: 'pending',
        priority: 'medium',
        category: 'feature_request',
        assignedTo: 'product_team',
        createdBy: 'user_456',
        createdAt: new Date('2024-01-14T15:00:00Z'),
        updatedAt: new Date('2024-01-15T09:00:00Z'),
        lastActivity: new Date('2024-01-15T09:00:00Z'),
        tags: ['ui', 'theme', 'dark_mode']
      },
      {
        id: '3',
        title: 'Bug Report - Chart Not Loading',
        description: 'The analytics charts are not loading properly in Firefox browser.',
        status: 'in_progress',
        priority: 'medium',
        category: 'bug',
        assignedTo: 'dev_team',
        createdBy: 'user_789',
        createdAt: new Date('2024-01-13T11:00:00Z'),
        updatedAt: new Date('2024-01-15T16:00:00Z'),
        lastActivity: new Date('2024-01-15T16:00:00Z'),
        tags: ['analytics', 'charts', 'firefox', 'bug']
      },
      {
        id: '4',
        title: 'Account Access - Role Permissions',
        description: 'Need help understanding role-based permissions for different user types.',
        status: 'resolved',
        priority: 'low',
        category: 'account',
        assignedTo: 'admin_team',
        createdBy: 'user_101',
        createdAt: new Date('2024-01-10T09:00:00Z'),
        updatedAt: new Date('2024-01-12T17:00:00Z'),
        lastActivity: new Date('2024-01-12T17:00:00Z'),
        resolvedAt: new Date('2024-01-12T17:00:00Z'),
        tags: ['permissions', 'roles', 'access_control']
      }
    ];

    let filteredTickets = tickets;
    
    // Apply filters
    if (status) {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
    }
    if (priority) {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority);
    }
    if (category) {
      filteredTickets = filteredTickets.filter(ticket => ticket.category === category);
    }
    if (assignedTo) {
      filteredTickets = filteredTickets.filter(ticket => ticket.assignedTo === assignedTo);
    }

    // Apply pagination
    const total = filteredTickets.length;
    const paginatedTickets = filteredTickets.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedTickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      filters: { status, priority, category, assignedTo }
    });
  } catch (error) {
    logger.error('Error getting support tickets:', error);
    res.status(500).json({ error: 'Failed to get support tickets' });
  }
});

// Get support ticket by ID
router.get('/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock ticket details (replace with actual support system)
    const ticket = {
      id: '1',
      title: 'Login Issue - Cannot Access Dashboard',
      description: 'I am unable to log into the admin dashboard. Getting a 401 error.',
      status: 'open',
      priority: 'high',
      category: 'technical',
      assignedTo: 'support_team',
      createdBy: 'user_123',
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T14:30:00Z'),
      lastActivity: new Date('2024-01-15T14:30:00Z'),
      tags: ['login', 'dashboard', 'authentication'],
      comments: [
        {
          id: '1',
          author: 'support_team',
          content: 'Thank you for reporting this issue. We are investigating the login problem.',
          createdAt: new Date('2024-01-15T11:00:00Z'),
          isInternal: false
        },
        {
          id: '2',
          author: 'dev_team',
          content: 'Found the issue. It\'s related to token validation. Working on a fix.',
          createdAt: new Date('2024-01-15T14:30:00Z'),
          isInternal: true
        }
      ],
      attachments: [],
      history: [
        {
          action: 'created',
          timestamp: new Date('2024-01-15T10:00:00Z'),
          user: 'user_123'
        },
        {
          action: 'assigned',
          timestamp: new Date('2024-01-15T10:15:00Z'),
          user: 'admin',
          details: 'Assigned to support_team'
        }
      ]
    };

    if (id !== '1') {
      return res.status(404).json({
        success: false,
        error: 'TICKET_NOT_FOUND',
        message: 'Support ticket not found'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    logger.error('Error getting support ticket:', error);
    res.status(500).json({ error: 'Failed to get support ticket' });
  }
});

// Create support ticket
router.post('/tickets', authenticateToken, supportRateLimit, async (req, res) => {
  try {
    const { title, description, category, priority, tags } = req.body;
    
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Title, description, and category are required'
      });
    }

    // Mock ticket creation (replace with actual support system)
    const ticket = {
      id: Date.now().toString(),
      title,
      description,
      status: 'open',
      priority: priority || 'medium',
      category,
      assignedTo: null,
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
      tags: tags || [],
      comments: [],
      attachments: [],
      history: [
        {
          action: 'created',
          timestamp: new Date(),
          user: req.user.userId
        }
      ]
    };

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket
    });
  } catch (error) {
    logger.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

// Update support ticket
router.put('/tickets/:id', authenticateToken, supportRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, tags } = req.body;
    
    if (!status && !priority && !assignedTo && !tags) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_UPDATE_FIELDS',
        message: 'At least one field to update is required'
      });
    }

    // Mock ticket update (replace with actual support system)
    const updateData = {
      id,
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(assignedTo !== undefined && { assignedTo }),
      ...(tags !== undefined && { tags }),
      updatedAt: new Date(),
      lastActivity: new Date()
    };

    res.json({
      success: true,
      message: 'Support ticket updated successfully',
      data: updateData
    });
  } catch (error) {
    logger.error('Error updating support ticket:', error);
    res.status(500).json({ error: 'Failed to update support ticket' });
  }
});

// Add comment to ticket
router.post('/tickets/:id/comments', authenticateToken, supportRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isInternal = false } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CONTENT',
        message: 'Comment content is required'
      });
    }

    // Mock comment creation (replace with actual support system)
    const comment = {
      id: Date.now().toString(),
      author: req.user.userId,
      content,
      createdAt: new Date(),
      isInternal
    };

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });
  } catch (error) {
    logger.error('Error adding comment to ticket:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// ==================== SUPPORT METRICS ====================

// Get support metrics
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    // Mock support metrics (replace with actual support system)
    const metrics = {
      overview: {
        totalTickets: 156,
        openTickets: 23,
        resolvedTickets: 128,
        closedTickets: 5,
        averageResolutionTime: 2.5, // days
        customerSatisfaction: 4.6
      },
      byStatus: {
        open: 23,
        in_progress: 15,
        pending: 8,
        resolved: 128,
        closed: 5
      },
      byPriority: {
        low: 45,
        medium: 78,
        high: 28,
        critical: 5
      },
      byCategory: {
        technical: 67,
        account: 34,
        billing: 23,
        feature_request: 18,
        bug: 14
      },
      performance: {
        firstResponseTime: 4.2, // hours
        resolutionTime: 2.5, // days
        satisfactionScore: 4.6,
        responseRate: 0.98
      },
      trends: {
        daily: [12, 15, 8, 20, 18, 14, 16],
        weekly: [85, 92, 78, 95, 88, 91, 87],
        monthly: [320, 345, 298, 367, 334, 356, 342]
      }
    };

    res.json({
      success: true,
      data: metrics,
      filters: { startDate, endDate, department },
      lastUpdated: new Date()
    });
  } catch (error) {
    logger.error('Error getting support metrics:', error);
    res.status(500).json({ error: 'Failed to get support metrics' });
  }
});

// ==================== SUPPORT CATEGORIES ====================

// Get support categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    // Mock support categories (replace with actual support system)
    const categories = [
      {
        id: '1',
        name: 'Technical',
        description: 'Technical issues and problems',
        color: '#3B82F6',
        icon: '🔧',
        ticketCount: 67,
        isActive: true
      },
      {
        id: '2',
        name: 'Account',
        description: 'Account-related issues and questions',
        color: '#10B981',
        icon: '👤',
        ticketCount: 34,
        isActive: true
      },
      {
        id: '3',
        name: 'Billing',
        description: 'Billing and payment issues',
        color: '#F59E0B',
        icon: '💳',
        ticketCount: 23,
        isActive: true
      },
      {
        id: '4',
        name: 'Feature Request',
        description: 'Requests for new features',
        color: '#8B5CF6',
        icon: '💡',
        ticketCount: 18,
        isActive: true
      },
      {
        id: '5',
        name: 'Bug',
        description: 'Bug reports and issues',
        color: '#EF4444',
        icon: '🐛',
        ticketCount: 14,
        isActive: true
      }
    ];

    res.json({
      success: true,
      data: categories,
      total: categories.length
    });
  } catch (error) {
    logger.error('Error getting support categories:', error);
    res.status(500).json({ error: 'Failed to get support categories' });
  }
});

// ==================== SUPPORT KNOWLEDGE BASE ====================

// Get knowledge base articles
router.get('/knowledge-base', authenticateToken, async (req, res) => {
  try {
    const { category, search, limit = 20 } = req.query;
    
    // Mock knowledge base articles (replace with actual knowledge base)
    const articles = [
      {
        id: '1',
        title: 'How to Reset Your Password',
        content: 'Step-by-step guide to reset your admin password...',
        category: 'account',
        tags: ['password', 'reset', 'authentication'],
        author: 'support_team',
        createdAt: new Date('2024-01-10T09:00:00Z'),
        updatedAt: new Date('2024-01-15T11:00:00Z'),
        views: 156,
        helpful: 23,
        notHelpful: 2
      },
      {
        id: '2',
        title: 'Understanding Role Permissions',
        content: 'Complete guide to role-based access control...',
        category: 'account',
        tags: ['permissions', 'roles', 'access'],
        author: 'admin_team',
        createdAt: new Date('2024-01-08T14:00:00Z'),
        updatedAt: new Date('2024-01-12T16:00:00Z'),
        views: 89,
        helpful: 15,
        notHelpful: 1
      },
      {
        id: '3',
        title: 'Troubleshooting Dashboard Issues',
        content: 'Common dashboard problems and solutions...',
        category: 'technical',
        tags: ['dashboard', 'troubleshooting', 'errors'],
        author: 'dev_team',
        createdAt: new Date('2024-01-05T10:00:00Z'),
        updatedAt: new Date('2024-01-10T13:00:00Z'),
        views: 234,
        helpful: 45,
        notHelpful: 8
      }
    ];

    let filteredArticles = articles;
    
    if (category) {
      filteredArticles = articles.filter(article => article.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredArticles = articles.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    res.json({
      success: true,
      data: filteredArticles.slice(0, parseInt(limit)),
      total: filteredArticles.length,
      filters: { category, search, limit }
    });
  } catch (error) {
    logger.error('Error getting knowledge base articles:', error);
    res.status(500).json({ error: 'Failed to get knowledge base articles' });
  }
});

// Consolidated support dashboard endpoint - replaces multiple separate calls
router.get('/dashboard', authenticateToken, requireRole(['admin', 'support']), async (req, res) => {
  try {
    console.log('📊 SUPPORT_DASHBOARD_REQUEST:', {
      user: req.user.email,
      timestamp: new Date().toISOString()
    });

    // Get support tickets
    const tickets = [
      {
        id: '1',
        title: 'Login Issue - Cannot Access Dashboard',
        description: 'I am unable to log into the admin dashboard. Getting a 401 error.',
        status: 'open',
        priority: 'high',
        category: 'technical',
        assignedTo: 'support_team',
        createdBy: 'user_123',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T14:30:00Z'),
        lastActivity: new Date('2024-01-15T14:30:00Z'),
        tags: ['login', 'dashboard', 'authentication']
      },
      {
        id: '2',
        title: 'Feature Request - Dark Mode',
        description: 'Would like to request a dark mode theme for the admin panel.',
        status: 'pending',
        priority: 'medium',
        category: 'feature_request',
        assignedTo: 'product_team',
        createdBy: 'user_456',
        createdAt: new Date('2024-01-14T09:15:00Z'),
        updatedAt: new Date('2024-01-14T16:45:00Z'),
        lastActivity: new Date('2024-01-14T16:45:00Z'),
        tags: ['ui', 'theme', 'feature']
      },
      {
        id: '3',
        title: 'Bug Report - Mobile App Crashes',
        description: 'The mobile app crashes when trying to upload profile pictures.',
        status: 'in_progress',
        priority: 'urgent',
        category: 'bug',
        assignedTo: 'mobile_team',
        createdBy: 'user_789',
        createdAt: new Date('2024-01-13T15:20:00Z'),
        updatedAt: new Date('2024-01-15T11:10:00Z'),
        lastActivity: new Date('2024-01-15T11:10:00Z'),
        tags: ['mobile', 'crash', 'upload']
      }
    ];

    // Get support metrics
    const metrics = {
      overview: {
        totalTickets: Math.floor(Math.random() * 1000) + 500,
        openTickets: Math.floor(Math.random() * 200) + 100,
        resolvedTickets: Math.floor(Math.random() * 800) + 400,
        averageResolutionTime: Math.floor(Math.random() * 48) + 24 // hours
      },
      byStatus: {
        open: Math.floor(Math.random() * 100) + 50,
        inProgress: Math.floor(Math.random() * 80) + 40,
        pending: Math.floor(Math.random() * 60) + 30,
        resolved: Math.floor(Math.random() * 400) + 200,
        closed: Math.floor(Math.random() * 300) + 150
      },
      byPriority: {
        urgent: Math.floor(Math.random() * 20) + 10,
        high: Math.floor(Math.random() * 50) + 25,
        medium: Math.floor(Math.random() * 100) + 50,
        low: Math.floor(Math.random() * 200) + 100
      },
      byCategory: {
        technical: Math.floor(Math.random() * 200) + 100,
        billing: Math.floor(Math.random() * 100) + 50,
        feature_request: Math.floor(Math.random() * 150) + 75,
        bug: Math.floor(Math.random() * 120) + 60,
        general: Math.floor(Math.random() * 80) + 40
      },
      performance: {
        averageResponseTime: Math.floor(Math.random() * 4) + 2, // hours
        customerSatisfaction: 4.2 + Math.random() * 0.8,
        firstContactResolution: 0.75 + Math.random() * 0.2,
        escalationRate: 0.1 + Math.random() * 0.1
      }
    };

    const consolidatedData = {
      tickets,
      metrics,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ SUPPORT_DASHBOARD_SUCCESS:', {
      user: req.user.email,
      dataSize: JSON.stringify(consolidatedData).length,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: consolidatedData,
      message: 'Support dashboard data retrieved successfully',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ SUPPORT_DASHBOARD_ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve support dashboard data',
      message: error.message,
      timestamp: Date.now()
    });
  }
});

// Individual endpoints for backward compatibility (but these should be avoided)
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const { status, priority, category, assignedTo, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const tickets = [
      {
        id: '1',
        title: 'Login Issue - Cannot Access Dashboard',
        description: 'I am unable to log into the admin dashboard. Getting a 401 error.',
        status: 'open',
        priority: 'high',
        category: 'technical',
        assignedTo: 'support_team',
        createdBy: 'user_123',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T14:30:00Z'),
        lastActivity: new Date('2024-01-15T14:30:00Z'),
        tags: ['login', 'dashboard', 'authentication']
      },
      {
        id: '2',
        title: 'Feature Request - Dark Mode',
        description: 'Would like to request a dark mode theme for the admin panel.',
        status: 'pending',
        priority: 'medium',
        category: 'feature_request',
        assignedTo: 'product_team',
        createdBy: 'user_456',
        createdAt: new Date('2024-01-14T09:15:00Z'),
        updatedAt: new Date('2024-01-14T16:45:00Z'),
        lastActivity: new Date('2024-01-14T16:45:00Z'),
        tags: ['ui', 'theme', 'feature']
      },
      {
        id: '3',
        title: 'Bug Report - Mobile App Crashes',
        description: 'The mobile app crashes when trying to upload profile pictures.',
        status: 'in_progress',
        priority: 'urgent',
        category: 'bug',
        assignedTo: 'mobile_team',
        createdBy: 'user_789',
        createdAt: new Date('2024-01-13T15:20:00Z'),
        updatedAt: new Date('2024-01-15T11:10:00Z'),
        lastActivity: new Date('2024-01-15T11:10:00Z'),
        tags: ['mobile', 'crash', 'upload']
      }
    ];

    res.json({
      success: true,
      data: tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: tickets.length,
        pages: Math.ceil(tickets.length / limit)
      }
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SUPPORT_TICKETS_FAILED',
      message: 'Failed to retrieve support tickets'
    });
  }
});

router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const metrics = {
      overview: {
        totalTickets: Math.floor(Math.random() * 1000) + 500,
        openTickets: Math.floor(Math.random() * 200) + 100,
        resolvedTickets: Math.floor(Math.random() * 800) + 400,
        averageResolutionTime: Math.floor(Math.random() * 48) + 24 // hours
      },
      byStatus: {
        open: Math.floor(Math.random() * 100) + 50,
        inProgress: Math.floor(Math.random() * 80) + 40,
        pending: Math.floor(Math.random() * 60) + 30,
        resolved: Math.floor(Math.random() * 400) + 200,
        closed: Math.floor(Math.random() * 300) + 150
      },
      byPriority: {
        urgent: Math.floor(Math.random() * 20) + 10,
        high: Math.floor(Math.random() * 50) + 25,
        medium: Math.floor(Math.random() * 100) + 50,
        low: Math.floor(Math.random() * 200) + 100
      },
      byCategory: {
        technical: Math.floor(Math.random() * 200) + 100,
        billing: Math.floor(Math.random() * 100) + 50,
        feature_request: Math.floor(Math.random() * 150) + 75,
        bug: Math.floor(Math.random() * 120) + 60,
        general: Math.floor(Math.random() * 80) + 40
      },
      performance: {
        averageResponseTime: Math.floor(Math.random() * 4) + 2, // hours
        customerSatisfaction: 4.2 + Math.random() * 0.8,
        firstContactResolution: 0.75 + Math.random() * 0.2,
        escalationRate: 0.1 + Math.random() * 0.1
      }
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Get support metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SUPPORT_METRICS_FAILED',
      message: 'Failed to retrieve support metrics'
    });
  }
});

module.exports = router;
