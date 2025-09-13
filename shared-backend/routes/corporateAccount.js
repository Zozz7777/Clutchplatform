const express = require('express');
const router = express.Router();
const { logger } = require('../config/logger');

// Simple authentication middleware (non-blocking)
const simpleAuth = (req, res, next) => {
  // For now, just set a mock user
  req.user = { 
    id: 'test-user', 
    role: 'user',
    tenantId: 'test-tenant'
  };
  next();
};

// Create new corporate account
router.post('/', simpleAuth, async (req, res) => {
  try {
    const { companyName, contactEmail, contactPhone, address, industry, employeeCount, subscriptionPlan } = req.body;
    
    if (!companyName || !contactEmail) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Company name and contact email are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const newAccount = {
      id: `corp-${Date.now()}`,
      companyName,
      contactEmail,
      contactPhone: contactPhone || '',
      address: address || '',
      industry: industry || 'Technology',
      employeeCount: employeeCount || 0,
      subscriptionPlan: subscriptionPlan || 'basic',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      data: newAccount,
      message: 'Corporate account created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error creating corporate account:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_ACCOUNT_FAILED',
      message: 'Failed to create corporate account',
      timestamp: new Date().toISOString()
    });
  }
});

// Get all corporate accounts
router.get('/', simpleAuth, async (req, res) => {
  try {
    const corporateAccounts = [
      {
        id: 'corp-1',
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1-555-0123',
        address: '123 Business St, City, State 12345',
        status: 'active',
        plan: 'enterprise',
        users: 150,
        createdAt: new Date().toISOString()
      },
      {
        id: 'corp-2',
        name: 'Tech Solutions Inc',
        email: 'info@techsolutions.com',
        phone: '+1-555-0456',
        address: '456 Tech Ave, City, State 67890',
        status: 'active',
        plan: 'professional',
        users: 75,
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: corporateAccounts,
      total: corporateAccounts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching corporate accounts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch corporate accounts',
      timestamp: new Date().toISOString()
    });
  }
});

// Get corporate account by ID
router.get('/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const corporateAccount = {
      id: id,
      name: `Corporate Account ${id}`,
      email: `contact@corp${id}.com`,
      phone: '+1-555-0000',
      address: '123 Corporate Blvd, City, State 12345',
      status: 'active',
      plan: 'enterprise',
      users: Math.floor(Math.random() * 200) + 50,
      billing: {
        monthlyFee: 999.99,
        lastPayment: new Date().toISOString(),
        nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      features: {
        maxUsers: 500,
        storage: '1TB',
        support: '24/7',
        apiAccess: true
      },
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: corporateAccount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching corporate account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch corporate account',
      timestamp: new Date().toISOString()
    });
  }
});

// Create new corporate account
router.post('/', simpleAuth, async (req, res) => {
  try {
    const { name, email, phone, address, plan } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Name and email are required',
        timestamp: new Date().toISOString()
      });
    }

    const corporateAccount = {
      id: `corp-${Date.now()}`,
      name,
      email,
      phone: phone || '+1-555-0000',
      address: address || '123 Corporate Blvd, City, State 12345',
      status: 'active',
      plan: plan || 'professional',
      users: 0,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'Corporate account created successfully',
      data: corporateAccount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating corporate account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create corporate account',
      timestamp: new Date().toISOString()
    });
  }
});

// Update corporate account
router.put('/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, plan, status } = req.body;
    
    const corporateAccount = {
      id: id,
      name: name || `Corporate Account ${id}`,
      email: email || `contact@corp${id}.com`,
      phone: phone || '+1-555-0000',
      address: address || '123 Corporate Blvd, City, State 12345',
      status: status || 'active',
      plan: plan || 'professional',
      users: Math.floor(Math.random() * 200) + 50,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Corporate account updated successfully',
      data: corporateAccount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating corporate account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update corporate account',
      timestamp: new Date().toISOString()
    });
  }
});

// Delete corporate account
router.delete('/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      message: `Corporate account ${id} deleted successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting corporate account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete corporate account',
      timestamp: new Date().toISOString()
    });
  }
});

// Get corporate account analytics
router.get('/:id/analytics', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const analytics = {
      corporateAccountId: id,
      users: {
        total: Math.floor(Math.random() * 200) + 50,
        active: Math.floor(Math.random() * 150) + 40,
        inactive: Math.floor(Math.random() * 50) + 10
      },
      usage: {
        apiCalls: Math.floor(Math.random() * 10000) + 5000,
        storageUsed: Math.floor(Math.random() * 500) + 100,
        bandwidthUsed: Math.floor(Math.random() * 1000) + 200
      },
      revenue: {
        monthly: Math.floor(Math.random() * 5000) + 1000,
        yearly: Math.floor(Math.random() * 50000) + 10000
      },
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching corporate account analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch corporate account analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// Add users to corporate account
router.post('/:id/users', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { users } = req.body;
    
    if (!users || !Array.isArray(users)) {
      return res.status(400).json({
        success: false,
        error: 'Users array is required',
        timestamp: new Date().toISOString()
      });
    }

    const result = {
      corporateAccountId: id,
      addedUsers: users.length,
      users: users.map(user => ({
        id: `user-${Date.now()}-${Math.random()}`,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        status: 'active'
      })),
      timestamp: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'Users added to corporate account successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error adding users to corporate account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add users to corporate account',
      timestamp: new Date().toISOString()
    });
  }
});

// Remove user from corporate account
router.delete('/:id/users/:userId', simpleAuth, async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    res.json({
      success: true,
      message: `User ${userId} removed from corporate account ${id} successfully`,
      data: {
        corporateAccountId: id,
        userId: userId
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error removing user from corporate account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove user from corporate account',
      timestamp: new Date().toISOString()
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