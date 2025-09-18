const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const rateLimit = require('express-rate-limit');

// Rate limiting
const vendorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many vendor requests from this IP, please try again later.'
});

// Apply rate limiting and authentication to all routes
router.use(vendorLimiter);
router.use(authenticateToken);

// ===== VENDORS MANAGEMENT =====

// GET /api/v1/vendors - Get all vendors
router.get('/', async (req, res) => {
  try {
    const vendorsCollection = await getCollection('vendors');
    const { page = 1, limit = 10, category, status, location } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (location) filter.location = location;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const vendors = await vendorsCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await vendorsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        vendors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/vendors/:id - Get vendor by ID
router.get('/:id', async (req, res) => {
  try {
    const vendorsCollection = await getCollection('vendors');
    const vendor = await vendorsCollection.findOne({ _id: req.params.id });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    res.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/vendors - Create new vendor
router.post('/', checkRole(['head_administrator', 'vendor_manager']), async (req, res) => {
  try {
    const vendorsCollection = await getCollection('vendors');
    const { 
      name, 
      category, 
      contactPerson, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      zipCode, 
      country, 
      website, 
      taxId, 
      status, 
      rating, 
      notes 
    } = req.body;
    
    if (!name || !category || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and email are required'
      });
    }
    
    const vendor = {
      name,
      category,
      contactPerson: contactPerson || '',
      email,
      phone: phone || '',
      address: address || '',
      city: city || '',
      state: state || '',
      zipCode: zipCode || '',
      country: country || '',
      website: website || '',
      taxId: taxId || '',
      status: status || 'active',
      rating: rating || 0,
      notes: notes || '',
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      contracts: [],
      communications: []
    };
    
    const result = await vendorsCollection.insertOne(vendor);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...vendor
      },
      message: 'Vendor created successfully'
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vendor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/v1/vendors/:id - Update vendor
router.put('/:id', checkRole(['head_administrator', 'vendor_manager']), async (req, res) => {
  try {
    const vendorsCollection = await getCollection('vendors');
    const { 
      name, 
      category, 
      contactPerson, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      zipCode, 
      country, 
      website, 
      taxId, 
      status, 
      rating, 
      notes 
    } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (contactPerson) updateData.contactPerson = contactPerson;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (zipCode) updateData.zipCode = zipCode;
    if (country) updateData.country = country;
    if (website) updateData.website = website;
    if (taxId) updateData.taxId = taxId;
    if (status) updateData.status = status;
    if (rating !== undefined) updateData.rating = rating;
    if (notes) updateData.notes = notes;
    
    const result = await vendorsCollection.updateOne(
      { _id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Vendor updated successfully'
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vendor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/v1/vendors/:id - Delete vendor
router.delete('/:id', checkRole(['head_administrator']), async (req, res) => {
  try {
    const vendorsCollection = await getCollection('vendors');
    const result = await vendorsCollection.deleteOne({ _id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vendor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== VENDOR CONTRACTS =====

// GET /api/v1/vendor-contracts - Get all vendor contracts
router.get('/contracts', async (req, res) => {
  try {
    const contractsCollection = await getCollection('vendor_contracts');
    const { page = 1, limit = 10, vendorId, status, type } = req.query;
    
    const filter = {};
    if (vendorId) filter.vendorId = vendorId;
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const contracts = await contractsCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await contractsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        contracts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vendor contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor contracts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/vendor-contracts - Create vendor contract
router.post('/contracts', checkRole(['head_administrator', 'vendor_manager']), async (req, res) => {
  try {
    const contractsCollection = await getCollection('vendor_contracts');
    const { 
      vendorId, 
      contractNumber, 
      type, 
      title, 
      description, 
      startDate, 
      endDate, 
      value, 
      currency, 
      terms, 
      status, 
      renewalDate, 
      notes 
    } = req.body;
    
    if (!vendorId || !contractNumber || !type || !title) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID, contract number, type, and title are required'
      });
    }
    
    const contract = {
      vendorId,
      contractNumber,
      type,
      title,
      description: description || '',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      value: value || 0,
      currency: currency || 'USD',
      terms: terms || '',
      status: status || 'active',
      renewalDate: renewalDate ? new Date(renewalDate) : null,
      notes: notes || '',
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await contractsCollection.insertOne(contract);
    
    // Update vendor with contract reference
    const vendorsCollection = await getCollection('vendors');
    await vendorsCollection.updateOne(
      { _id: vendorId },
      { 
        $push: { contracts: result.insertedId },
        $set: { updatedAt: new Date() }
      }
    );
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...contract
      },
      message: 'Vendor contract created successfully'
    });
  } catch (error) {
    console.error('Error creating vendor contract:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vendor contract',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/v1/vendor-contracts/:id - Update vendor contract
router.put('/contracts/:id', checkRole(['head_administrator', 'vendor_manager']), async (req, res) => {
  try {
    const contractsCollection = await getCollection('vendor_contracts');
    const { 
      type, 
      title, 
      description, 
      startDate, 
      endDate, 
      value, 
      currency, 
      terms, 
      status, 
      renewalDate, 
      notes 
    } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (type) updateData.type = type;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (value !== undefined) updateData.value = value;
    if (currency) updateData.currency = currency;
    if (terms) updateData.terms = terms;
    if (status) updateData.status = status;
    if (renewalDate) updateData.renewalDate = new Date(renewalDate);
    if (notes) updateData.notes = notes;
    
    const result = await contractsCollection.updateOne(
      { _id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor contract not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Vendor contract updated successfully'
    });
  } catch (error) {
    console.error('Error updating vendor contract:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vendor contract',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== VENDOR COMMUNICATIONS =====

// GET /api/v1/vendor-communications - Get all vendor communications
router.get('/communications', async (req, res) => {
  try {
    const communicationsCollection = await getCollection('vendor_communications');
    const { page = 1, limit = 10, vendorId, type, status } = req.query;
    
    const filter = {};
    if (vendorId) filter.vendorId = vendorId;
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const communications = await communicationsCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await communicationsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        communications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vendor communications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor communications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/vendor-communications - Create vendor communication
router.post('/communications', checkRole(['head_administrator', 'vendor_manager', 'employee']), async (req, res) => {
  try {
    const communicationsCollection = await getCollection('vendor_communications');
    const { 
      vendorId, 
      type, 
      subject, 
      message, 
      priority, 
      status, 
      followUpDate, 
      attachments 
    } = req.body;
    
    if (!vendorId || !type || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID, type, subject, and message are required'
      });
    }
    
    const communication = {
      vendorId,
      type,
      subject,
      message,
      priority: priority || 'medium',
      status: status || 'sent',
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      attachments: attachments || [],
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await communicationsCollection.insertOne(communication);
    
    // Update vendor with communication reference
    const vendorsCollection = await getCollection('vendors');
    await vendorsCollection.updateOne(
      { _id: vendorId },
      { 
        $push: { communications: result.insertedId },
        $set: { updatedAt: new Date() }
      }
    );
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...communication
      },
      message: 'Vendor communication created successfully'
    });
  } catch (error) {
    console.error('Error creating vendor communication:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vendor communication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/v1/vendor-communications/:id - Update vendor communication
router.put('/communications/:id', checkRole(['head_administrator', 'vendor_manager', 'employee']), async (req, res) => {
  try {
    const communicationsCollection = await getCollection('vendor_communications');
    const { 
      type, 
      subject, 
      message, 
      priority, 
      status, 
      followUpDate, 
      attachments 
    } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (type) updateData.type = type;
    if (subject) updateData.subject = subject;
    if (message) updateData.message = message;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;
    if (followUpDate) updateData.followUpDate = new Date(followUpDate);
    if (attachments) updateData.attachments = attachments;
    
    const result = await communicationsCollection.updateOne(
      { _id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor communication not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Vendor communication updated successfully'
    });
  } catch (error) {
    console.error('Error updating vendor communication:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vendor communication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/vendors/analytics - Get vendors analytics
router.get('/analytics/overview', async (req, res) => {
  try {
    const vendorsCollection = await getCollection('vendors');
    const contractsCollection = await getCollection('vendor_contracts');
    const communicationsCollection = await getCollection('vendor_communications');
    
    const totalVendors = await vendorsCollection.countDocuments();
    const activeVendors = await vendorsCollection.countDocuments({ status: 'active' });
    const inactiveVendors = await vendorsCollection.countDocuments({ status: 'inactive' });
    
    // Get vendors by category
    const categoryStats = await vendorsCollection.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get vendors by status
    const statusStats = await vendorsCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get contract stats
    const totalContracts = await contractsCollection.countDocuments();
    const activeContracts = await contractsCollection.countDocuments({ status: 'active' });
    const expiringContracts = await contractsCollection.countDocuments({
      endDate: { 
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    });
    
    // Get communication stats
    const totalCommunications = await communicationsCollection.countDocuments();
    const pendingFollowUps = await communicationsCollection.countDocuments({
      followUpDate: { $lte: new Date() },
      status: { $ne: 'completed' }
    });
    
    res.json({
      success: true,
      data: {
        overview: {
          totalVendors,
          activeVendors,
          inactiveVendors
        },
        categoryStats,
        statusStats,
        contracts: {
          totalContracts,
          activeContracts,
          expiringContracts
        },
        communications: {
          totalCommunications,
          pendingFollowUps
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vendors analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;