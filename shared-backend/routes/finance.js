const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const rateLimit = require('express-rate-limit');

// Rate limiting
const financeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many finance requests from this IP, please try again later.'
});

// Apply rate limiting and authentication to all routes
router.use(financeLimiter);
router.use(authenticateToken);

// ===== FINANCE PAYMENTS =====

// GET /api/v1/finance/budgets - Get all budgets
router.get('/budgets', checkRole(['head_administrator', 'finance_manager']), async (req, res) => {
  try {
    const budgetsCollection = await getCollection('budgets');
    
    if (!budgetsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const { startDate, endDate, category, status } = req.query;
    const filter = {};
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    const budgets = await budgetsCollection
      .find(filter)
      .sort({ date: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: budgets,
      message: 'Budgets retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_BUDGETS_FAILED',
      message: 'Failed to get budgets',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/finance/expenses - Get all expenses
router.get('/expenses', checkRole(['head_administrator', 'finance_manager']), async (req, res) => {
  try {
    const expensesCollection = await getCollection('expenses');
    
    if (!expensesCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const { startDate, endDate, category, projectId } = req.query;
    const filter = {};
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    if (category) filter.category = category;
    if (projectId) filter.projectId = projectId;
    
    const expenses = await expensesCollection
      .find(filter)
      .sort({ date: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: expenses,
      message: 'Expenses retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_EXPENSES_FAILED',
      message: 'Failed to get expenses',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/finance/payments - Get all payments
router.get('/payments', async (req, res) => {
  try {
    const paymentsCollection = await getCollection('payments');
    const { page = 1, limit = 10, status, method, dateFrom, dateTo } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const payments = await paymentsCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await paymentsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/finance/payments/:id - Get payment by ID
router.get('/payments/:id', async (req, res) => {
  try {
    const paymentsCollection = await getCollection('payments');
    const payment = await paymentsCollection.findOne({ _id: req.params.id });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/finance/payments - Create new payment
router.post('/payments', checkRole(['head_administrator', 'finance_officer']), async (req, res) => {
  try {
    const paymentsCollection = await getCollection('payments');
    const { 
      amount, 
      currency, 
      method, 
      description, 
      customerId, 
      status 
    } = req.body;
    
    if (!amount || !currency || !method) {
      return res.status(400).json({
        success: false,
        message: 'Amount, currency, and method are required'
      });
    }
    
    const payment = {
      amount: parseFloat(amount),
      currency,
      method,
      description: description || '',
      customerId: customerId || null,
      status: status || 'pending',
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await paymentsCollection.insertOne(payment);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...payment
      },
      message: 'Payment created successfully'
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== FINANCE INVOICES =====

// GET /api/finance/invoices - Get all invoices
router.get('/invoices', async (req, res) => {
  try {
    const invoicesCollection = await getCollection('invoices');
    const { page = 1, limit = 10, status, dateFrom, dateTo } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const invoices = await invoicesCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await invoicesCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/finance/invoices - Create new invoice
router.post('/invoices', checkRole(['head_administrator', 'finance_officer']), async (req, res) => {
  try {
    const invoicesCollection = await getCollection('invoices');
    const { 
      invoiceNumber, 
      customerId, 
      amount, 
      currency, 
      dueDate, 
      items, 
      status 
    } = req.body;
    
    if (!invoiceNumber || !customerId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Invoice number, customer ID, and amount are required'
      });
    }
    
    const invoice = {
      invoiceNumber,
      customerId,
      amount: parseFloat(amount),
      currency: currency || 'EGP',
      dueDate: dueDate ? new Date(dueDate) : null,
      items: items || [],
      status: status || 'draft',
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await invoicesCollection.insertOne(invoice);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...invoice
      },
      message: 'Invoice created successfully'
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== FINANCE SUBSCRIPTIONS =====

// GET /api/finance/subscriptions - Get all subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const subscriptionsCollection = await getCollection('subscriptions');
    const { page = 1, limit = 10, status, plan } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (plan) filter.plan = plan;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const subscriptions = await subscriptionsCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await subscriptionsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== FINANCE SUBSCRIPTIONS =====

// GET /api/v1/finance/subscriptions - Get all subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const subscriptionsCollection = await getCollection('subscriptions');
    const { page = 1, limit = 10, status, plan } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (plan) filter.plan = plan;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const subscriptions = await subscriptionsCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await subscriptionsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/finance/subscriptions - Create new subscription
router.post('/subscriptions', checkRole(['head_administrator', 'finance_officer']), async (req, res) => {
  try {
    const subscriptionsCollection = await getCollection('subscriptions');
    const { 
      customerId, 
      plan, 
      amount, 
      billingCycle = 'monthly',
      startDate,
      endDate 
    } = req.body;
    
    // Validate required fields
    if (!customerId || !plan || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID, plan, and amount are required'
      });
    }
    
    const subscriptionData = {
      customerId,
      plan,
      amount: parseFloat(amount),
      billingCycle,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'active',
      createdBy: req.user.userId || req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await subscriptionsCollection.insertOne(subscriptionData);
    
    res.json({
      success: true,
      data: {
        subscription: {
          ...subscriptionData,
          _id: result.insertedId
        }
      },
      message: 'Subscription created successfully'
    });
    
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== FINANCE METRICS =====

// GET /api/v1/finance/metrics - Get finance metrics
// GET /api/v1/finance/payouts - Get payouts data
router.get('/payouts', authenticateToken, async (req, res) => {
  try {
    const payoutsCollection = await getCollection('payouts');
    
    const payouts = await payoutsCollection.find({}).toArray();
    
    res.json({
      success: true,
      data: payouts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting payouts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payouts',
      message: error.message
    });
  }
});

router.get('/metrics', async (req, res) => {
  try {
    const paymentsCollection = await getCollection('payments');
    const invoicesCollection = await getCollection('invoices');
    const subscriptionsCollection = await getCollection('subscriptions');
    
    // Get total revenue
    const totalRevenue = await paymentsCollection.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    // Get monthly revenue
    const monthlyRevenue = await paymentsCollection.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    // Get payment methods stats
    const paymentMethodsStats = await paymentsCollection.aggregate([
      { $group: { _id: '$method', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]).toArray();
    
    // Get invoice status stats
    const invoiceStatusStats = await invoicesCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get subscription stats
    const subscriptionStats = await subscriptionsCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    
    res.json({
      success: true,
      data: {
        revenue: {
          total: totalRevenue[0]?.total || 0,
          monthly: monthlyRevenue[0]?.total || 0
        },
        paymentMethodsStats,
        invoiceStatusStats,
        subscriptionStats
      }
    });
  } catch (error) {
    console.error('Error fetching finance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch finance metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== FINANCE EXPENSES =====

// GET /api/finance/expenses - Get all expenses
router.get('/expenses', async (req, res) => {
  try {
    const expensesCollection = await getCollection('expenses');
    const { page = 1, limit = 10, category, status, dateFrom, dateTo } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const expenses = await expensesCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await expensesCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      message: 'Expenses retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/finance/expenses - Create new expense
router.post('/expenses', checkRole(['head_administrator', 'admin']), async (req, res) => {
  try {
    const { amount, category, description, vendor, status = 'pending' } = req.body;
    
    if (!amount || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Amount, category, and description are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const expensesCollection = await getCollection('expenses');
    
    const newExpense = {
      amount: parseFloat(amount),
      category,
      description,
      vendor: vendor || null,
      status,
      createdBy: req.user.userId || req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await expensesCollection.insertOne(newExpense);
    newExpense._id = result.insertedId;
    
    res.status(201).json({
      success: true,
      data: newExpense,
      message: 'Expense created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create expense',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// ===== FINANCE ANALYTICS =====

// GET /api/finance/analytics - Get finance analytics
router.get('/analytics', async (req, res) => {
  try {
    const paymentsCollection = await getCollection('payments');
    const invoicesCollection = await getCollection('invoices');
    
    const totalPayments = await paymentsCollection.countDocuments();
    const totalInvoices = await invoicesCollection.countDocuments();
    
    // Get payments by status
    const paymentStatusStats = await paymentsCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get invoices by status
    const invoiceStatusStats = await invoicesCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    
    res.json({
      success: true,
      data: {
        overview: {
          totalPayments,
          totalInvoices
        },
        paymentStatusStats,
        invoiceStatusStats
      }
    });
  } catch (error) {
    console.error('Error fetching finance analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch finance analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /pricing-plans - Get pricing plans
router.get('/pricing-plans', authenticateToken, checkRole(['head_administrator', 'finance_manager']), async (req, res) => {
  try {
    const pricingPlansCollection = await getCollection('pricing_plans');
    
    if (!pricingPlansCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const plans = await pricingPlansCollection
      .find({})
      .sort({ price: 1 })
      .toArray();
    
    res.json({
      success: true,
      data: plans,
      message: 'Pricing plans retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get pricing plans error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PRICING_PLANS_FAILED',
      message: 'Failed to get pricing plans',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /pricing-analytics - Get pricing analytics
router.get('/pricing-analytics', authenticateToken, checkRole(['head_administrator', 'finance_manager']), async (req, res) => {
  try {
    const pricingPlansCollection = await getCollection('pricing_plans');
    const subscriptionsCollection = await getCollection('subscriptions');
    
    if (!pricingPlansCollection || !subscriptionsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const [plans, subscriptions] = await Promise.all([
      pricingPlansCollection.find({}).toArray(),
      subscriptionsCollection.find({}).toArray()
    ]);
    
    const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);
    const averagePrice = plans.length > 0 
      ? plans.reduce((sum, plan) => sum + (plan.price || 0), 0) / plans.length 
      : 0;
    
    // Calculate conversion rate (simplified)
    const conversionRate = subscriptions.length > 0 ? 12.5 : 0; // This would be calculated from actual conversion data
    
    // Calculate churn rate (simplified)
    const churnRate = subscriptions.length > 0 ? 3.2 : 0; // This would be calculated from actual churn data
    
    const analytics = {
      totalRevenue,
      averagePrice: Math.round(averagePrice * 100) / 100,
      conversionRate,
      churnRate
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'Pricing analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get pricing analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PRICING_ANALYTICS_FAILED',
      message: 'Failed to get pricing analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /budget-breaches - Get budget breaches
router.get('/budget-breaches', authenticateToken, checkRole(['head_administrator', 'finance_manager']), async (req, res) => {
  try {
    const budgetBreachesCollection = await getCollection('budget_breaches');
    
    if (!budgetBreachesCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    const breaches = await budgetBreachesCollection
      .find({})
      .sort({ severity: -1, lastUpdated: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: breaches,
      message: 'Budget breaches retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get budget breaches error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_BUDGET_BREACHES_FAILED',
      message: 'Failed to get budget breaches',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;