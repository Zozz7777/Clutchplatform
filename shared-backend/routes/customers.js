const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const rateLimit = require('express-rate-limit');

// Rate limiting
const customerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: 'Too many customer requests, please try again later.'
});

// GET /api/v1/customers - Get all customers
router.get('/', customerLimiter, authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const customersCollection = await getCollection('customers');
    
    // Get customers with pagination
    const customers = await customersCollection.find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray();
    
    // Get total count
    const totalCount = await customersCollection.countDocuments();
    
    // Get customer statistics
    const stats = await getCustomerStatistics(customersCollection);
    
    res.json({
      success: true,
      data: {
        customers: customers,
        pagination: {
          page: page,
          limit: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        },
        statistics: stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get customers',
      message: error.message
    });
  }
});

// GET /api/v1/customers/:id - Get customer by ID
router.get('/:id', customerLimiter, authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const customersCollection = await getCollection('customers');
    const customer = await customersCollection.findOne({ _id: id });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    // Get customer's booking history
    const bookingsCollection = await getCollection('bookings');
    const bookings = await bookingsCollection.find({ customerId: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    res.json({
      success: true,
      data: {
        customer: customer,
        recentBookings: bookings,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get customer',
      message: error.message
    });
  }
});

// GET /api/v1/customers/enterprise/top - Get top enterprise customers
router.get('/enterprise/top', customerLimiter, authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const customersCollection = await getCollection('customers');
    const bookingsCollection = await getCollection('bookings');
    
    // Get enterprise customers
    const enterpriseCustomers = await customersCollection.find({
      type: 'enterprise'
    }).toArray();
    
    // Calculate revenue for each customer
    const customersWithRevenue = await Promise.all(
      enterpriseCustomers.map(async (customer) => {
        const revenueResult = await bookingsCollection.aggregate([
          { $match: { customerId: customer._id, status: 'completed' } },
          { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
        ]).toArray();
        
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
        
        return {
          ...customer,
          totalRevenue: totalRevenue
        };
      })
    );
    
    // Sort by revenue and get top customers
    const topCustomers = customersWithRevenue
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
    
    res.json({
      success: true,
      data: {
        topCustomers: topCustomers,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting top enterprise customers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get top enterprise customers',
      message: error.message
    });
  }
});

// GET /api/v1/customers/analytics/health - Get customer health analytics
router.get('/analytics/health', customerLimiter, authenticateToken, async (req, res) => {
  try {
    const customersCollection = await getCollection('customers');
    const bookingsCollection = await getCollection('bookings');
    
    // Get customer health metrics
    const healthMetrics = await calculateCustomerHealthMetrics(customersCollection, bookingsCollection);
    
    res.json({
      success: true,
      data: {
        healthMetrics: healthMetrics,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting customer health analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get customer health analytics',
      message: error.message
    });
  }
});

// POST /api/v1/customers - Create new customer
router.post('/', customerLimiter, authenticateToken, checkRole(['admin', 'sales']), async (req, res) => {
  try {
    const customerData = req.body;
    
    // Validate required fields
    if (!customerData.name || !customerData.email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }
    
    const customersCollection = await getCollection('customers');
    
    // Check if customer already exists
    const existingCustomer = await customersCollection.findOne({
      email: customerData.email
    });
    
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        error: 'Customer with this email already exists'
      });
    }
    
    // Create new customer
    const newCustomer = {
      ...customerData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };
    
    const result = await customersCollection.insertOne(newCustomer);
    
    res.status(201).json({
      success: true,
      data: {
        customer: { ...newCustomer, _id: result.insertedId },
        message: 'Customer created successfully'
      }
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create customer',
      message: error.message
    });
  }
});

// Helper function to get customer statistics
async function getCustomerStatistics(customersCollection) {
  try {
    const [
      totalCustomers,
      activeCustomers,
      enterpriseCustomers,
      individualCustomers,
      newCustomersThisMonth
    ] = await Promise.all([
      customersCollection.countDocuments(),
      customersCollection.countDocuments({ status: 'active' }),
      customersCollection.countDocuments({ type: 'enterprise' }),
      customersCollection.countDocuments({ type: 'individual' }),
      customersCollection.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      })
    ]);
    
    return {
      total: totalCustomers,
      active: activeCustomers,
      enterprise: enterpriseCustomers,
      individual: individualCustomers,
      newThisMonth: newCustomersThisMonth
    };
  } catch (error) {
    console.error('Error calculating customer statistics:', error);
    return {
      total: 0,
      active: 0,
      enterprise: 0,
      individual: 0,
      newThisMonth: 0
    };
  }
}

// Helper function to calculate customer health metrics
async function calculateCustomerHealthMetrics(customersCollection, bookingsCollection) {
  try {
    const customers = await customersCollection.find({}).toArray();
    
    let healthyCustomers = 0;
    let atRiskCustomers = 0;
    let churnedCustomers = 0;
    
    for (const customer of customers) {
      // Get customer's recent booking activity
      const recentBookings = await bookingsCollection.find({
        customerId: customer._id,
        createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
      }).toArray();
      
      if (recentBookings.length === 0) {
        churnedCustomers++;
      } else if (recentBookings.length < 2) {
        atRiskCustomers++;
      } else {
        healthyCustomers++;
      }
    }
    
    return {
      healthy: healthyCustomers,
      atRisk: atRiskCustomers,
      churned: churnedCustomers,
      total: customers.length
    };
  } catch (error) {
    console.error('Error calculating customer health metrics:', error);
    return {
      healthy: 0,
      atRisk: 0,
      churned: 0,
      total: 0
    };
  }
}

module.exports = router;
