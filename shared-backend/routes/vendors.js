/**
 * Vendor & Supplier Management Routes
 * Complete vendor management system with contracts and communication
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/optimized-database');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');

// Apply rate limiting
const vendorRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 100 });

// ==================== VENDOR MANAGEMENT ====================

// GET /api/v1/vendors - Get all vendors
router.get('/', authenticateToken, requireRole(['admin', 'vendor_manager']), vendorRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, category, search } = req.query;
    const skip = (page - 1) * limit;
    
    const vendorsCollection = await getCollection('vendors');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } }
      ];
    }
    
    const vendors = await vendorsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await vendorsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        vendors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Vendors retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_VENDORS_FAILED',
      message: 'Failed to retrieve vendors',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/vendors/:id - Get vendor by ID
router.get('/:id', authenticateToken, requireRole(['admin', 'vendor_manager']), vendorRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const vendorsCollection = await getCollection('vendors');
    
    const vendor = await vendorsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'VENDOR_NOT_FOUND',
        message: 'Vendor not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { vendor },
      message: 'Vendor retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_VENDOR_FAILED',
      message: 'Failed to retrieve vendor',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/vendors - Create new vendor
router.post('/', authenticateToken, requireRole(['admin', 'vendor_manager']), vendorRateLimit, async (req, res) => {
  try {
    const {
      name,
      companyName,
      email,
      phone,
      address,
      contactPerson,
      category,
      taxId,
      website,
      description,
      paymentTerms,
      creditLimit,
      status
    } = req.body;
    
    if (!name || !companyName || !email) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, company name, and email are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const vendorsCollection = await getCollection('vendors');
    
    // Check if vendor already exists
    const existingVendor = await vendorsCollection.findOne({ email: email.toLowerCase() });
    if (existingVendor) {
      return res.status(409).json({
        success: false,
        error: 'VENDOR_EXISTS',
        message: 'Vendor with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate vendor code
    const vendorCount = await vendorsCollection.countDocuments();
    const vendorCode = `VND${String(vendorCount + 1).padStart(4, '0')}`;
    
    const newVendor = {
      vendorCode,
      name,
      companyName,
      email: email.toLowerCase(),
      phone: phone || null,
      address: address || null,
      contactPerson: contactPerson || null,
      category: category || null,
      taxId: taxId || null,
      website: website || null,
      description: description || null,
      paymentTerms: paymentTerms || null,
      creditLimit: creditLimit || null,
      status: status || 'active',
      rating: 0,
      totalOrders: 0,
      totalValue: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await vendorsCollection.insertOne(newVendor);
    
    res.status(201).json({
      success: true,
      data: { vendor: { ...newVendor, _id: result.insertedId } },
      message: 'Vendor created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_VENDOR_FAILED',
      message: 'Failed to create vendor',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/vendors/:id - Update vendor
router.put('/:id', authenticateToken, requireRole(['admin', 'vendor_manager']), vendorRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const vendorsCollection = await getCollection('vendors');
    
    const result = await vendorsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'VENDOR_NOT_FOUND',
        message: 'Vendor not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const updatedVendor = await vendorsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { vendor: updatedVendor },
      message: 'Vendor updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_VENDOR_FAILED',
      message: 'Failed to update vendor',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/vendors/:id - Delete vendor
router.delete('/:id', authenticateToken, requireRole(['admin']), vendorRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const vendorsCollection = await getCollection('vendors');
    
    const result = await vendorsCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'VENDOR_NOT_FOUND',
        message: 'Vendor not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { id },
      message: 'Vendor deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_VENDOR_FAILED',
      message: 'Failed to delete vendor',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== VENDOR CONTRACTS ====================

// GET /api/v1/vendors/:id/contracts - Get vendor contracts
router.get('/:id/contracts', authenticateToken, requireRole(['admin', 'vendor_manager']), vendorRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const contractsCollection = await getCollection('vendor_contracts');
    
    const contracts = await contractsCollection
      .find({ vendorId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: { contracts },
      message: 'Vendor contracts retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get vendor contracts error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_VENDOR_CONTRACTS_FAILED',
      message: 'Failed to retrieve vendor contracts',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/vendors/:id/contracts - Create vendor contract
router.post('/:id/contracts', authenticateToken, requireRole(['admin', 'vendor_manager']), vendorRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      type,
      startDate,
      endDate,
      value,
      terms,
      renewalDate,
      autoRenewal,
      status
    } = req.body;
    
    if (!title || !type || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Title, type, start date, and end date are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const contractsCollection = await getCollection('vendor_contracts');
    
    // Generate contract number
    const contractCount = await contractsCollection.countDocuments();
    const contractNumber = `VCT${String(contractCount + 1).padStart(6, '0')}`;
    
    const newContract = {
      contractNumber,
      vendorId: new ObjectId(id),
      title,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      value: value || null,
      terms: terms || null,
      renewalDate: renewalDate ? new Date(renewalDate) : null,
      autoRenewal: autoRenewal || false,
      status: status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await contractsCollection.insertOne(newContract);
    
    res.status(201).json({
      success: true,
      data: { contract: { ...newContract, _id: result.insertedId } },
      message: 'Vendor contract created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create vendor contract error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_VENDOR_CONTRACT_FAILED',
      message: 'Failed to create vendor contract',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== VENDOR COMMUNICATION ====================

// GET /api/v1/vendors/:id/communications - Get vendor communications
router.get('/:id/communications', authenticateToken, requireRole(['admin', 'vendor_manager']), vendorRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, type } = req.query;
    const skip = (page - 1) * limit;
    
    const communicationsCollection = await getCollection('vendor_communications');
    
    // Build query
    const query = { vendorId: new ObjectId(id) };
    if (type) query.type = type;
    
    const communications = await communicationsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await communicationsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        communications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Vendor communications retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get vendor communications error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_VENDOR_COMMUNICATIONS_FAILED',
      message: 'Failed to retrieve vendor communications',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/vendors/:id/communications - Create vendor communication
router.post('/:id/communications', authenticateToken, requireRole(['admin', 'vendor_manager']), vendorRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      subject,
      message,
      priority,
      attachments
    } = req.body;
    
    if (!type || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Type, subject, and message are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const communicationsCollection = await getCollection('vendor_communications');
    
    const newCommunication = {
      vendorId: new ObjectId(id),
      type,
      subject,
      message,
      priority: priority || 'medium',
      attachments: attachments || [],
      status: 'sent',
      createdAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await communicationsCollection.insertOne(newCommunication);
    
    res.status(201).json({
      success: true,
      data: { communication: { ...newCommunication, _id: result.insertedId } },
      message: 'Vendor communication created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create vendor communication error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_VENDOR_COMMUNICATION_FAILED',
      message: 'Failed to create vendor communication',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== VENDOR PERFORMANCE ====================

// GET /api/v1/vendors/:id/performance - Get vendor performance
router.get('/:id/performance', authenticateToken, requireRole(['admin', 'vendor_manager']), vendorRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query;
    
    const vendorsCollection = await getCollection('vendors');
    const ordersCollection = await getCollection('vendor_orders');
    const contractsCollection = await getCollection('vendor_contracts');
    
    // Get vendor
    const vendor = await vendorsCollection.findOne({ _id: new ObjectId(id) });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'VENDOR_NOT_FOUND',
        message: 'Vendor not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));
    
    // Order statistics
    const totalOrders = await ordersCollection.countDocuments({ vendorId: new ObjectId(id) });
    const recentOrders = await ordersCollection.countDocuments({
      vendorId: new ObjectId(id),
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Order value statistics
    const orderValueStats = await ordersCollection.aggregate([
      { $match: { vendorId: new ObjectId(id) } },
      { $group: { 
        _id: null, 
        totalValue: { $sum: '$totalAmount' },
        averageValue: { $avg: '$totalAmount' }
      }}
    ]).toArray();
    
    // Contract statistics
    const totalContracts = await contractsCollection.countDocuments({ vendorId: new ObjectId(id) });
    const activeContracts = await contractsCollection.countDocuments({ 
      vendorId: new ObjectId(id),
      status: 'active'
    });
    
    // Performance metrics
    const performance = {
      vendor: {
        id: vendor._id,
        name: vendor.name,
        companyName: vendor.companyName,
        rating: vendor.rating
      },
      orders: {
        total: totalOrders,
        recent: recentOrders,
        totalValue: orderValueStats[0]?.totalValue || 0,
        averageValue: orderValueStats[0]?.averageValue || 0
      },
      contracts: {
        total: totalContracts,
        active: activeContracts
      },
      period,
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: performance,
      message: 'Vendor performance retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get vendor performance error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_VENDOR_PERFORMANCE_FAILED',
      message: 'Failed to retrieve vendor performance',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/vendors/:id/rating - Rate vendor
router.post('/:id/rating', authenticateToken, requireRole(['admin', 'vendor_manager']), vendorRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review, criteria } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_RATING',
        message: 'Rating must be between 1 and 5',
        timestamp: new Date().toISOString()
      });
    }
    
    const vendorsCollection = await getCollection('vendors');
    const ratingsCollection = await getCollection('vendor_ratings');
    
    // Create rating record
    const newRating = {
      vendorId: new ObjectId(id),
      rating: parseInt(rating),
      review: review || null,
      criteria: criteria || {},
      ratedBy: req.user.userId,
      createdAt: new Date()
    };
    
    await ratingsCollection.insertOne(newRating);
    
    // Update vendor average rating
    const ratings = await ratingsCollection.find({ vendorId: new ObjectId(id) }).toArray();
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    await vendorsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { rating: Math.round(averageRating * 100) / 100, updatedAt: new Date() } }
    );
    
    res.json({
      success: true,
      data: { 
        rating: newRating,
        averageRating: Math.round(averageRating * 100) / 100
      },
      message: 'Vendor rated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Rate vendor error:', error);
    res.status(500).json({
      success: false,
      error: 'RATE_VENDOR_FAILED',
      message: 'Failed to rate vendor',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== VENDOR ANALYTICS ====================

// GET /api/v1/vendors/analytics - Get vendor analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'vendor_manager']), vendorRateLimit, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const vendorsCollection = await getCollection('vendors');
    const ordersCollection = await getCollection('vendor_orders');
    const contractsCollection = await getCollection('vendor_contracts');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));
    
    // Vendor statistics
    const totalVendors = await vendorsCollection.countDocuments();
    const activeVendors = await vendorsCollection.countDocuments({ status: 'active' });
    const recentVendors = await vendorsCollection.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Category distribution
    const categoryStats = await vendorsCollection.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Top vendors by value
    const topVendors = await ordersCollection.aggregate([
      { $group: { _id: '$vendorId', totalValue: { $sum: '$totalAmount' } } },
      { $sort: { totalValue: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    // Contract statistics
    const totalContracts = await contractsCollection.countDocuments();
    const activeContracts = await contractsCollection.countDocuments({ status: 'active' });
    const expiringContracts = await contractsCollection.countDocuments({
      endDate: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    });
    
    const analytics = {
      vendors: {
        total: totalVendors,
        active: activeVendors,
        recent: recentVendors,
        categories: categoryStats
      },
      contracts: {
        total: totalContracts,
        active: activeContracts,
        expiring: expiringContracts
      },
      topVendors,
      period,
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'Vendor analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get vendor analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_VENDOR_ANALYTICS_FAILED',
      message: 'Failed to retrieve vendor analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== GENERIC HANDLERS ====================

// GET /api/v1/vendors/overview - Get vendors overview
router.get('/overview', authenticateToken, requireRole(['admin', 'vendor_manager']), vendorRateLimit, async (req, res) => {
  res.json({
    success: true,
    message: 'Vendor Management API is running',
    endpoints: {
      vendors: '/api/v1/vendors',
      contracts: '/api/v1/vendors/:id/contracts',
      communications: '/api/v1/vendors/:id/communications',
      performance: '/api/v1/vendors/:id/performance',
      analytics: '/api/v1/vendors/analytics'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
