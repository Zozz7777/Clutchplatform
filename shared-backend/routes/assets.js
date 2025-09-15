/**
 * Asset Management Routes
 * Complete asset management system for tracking company assets and inventory
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/optimized-database');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');

// Apply rate limiting
const assetRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 100 });

// ==================== ASSET MANAGEMENT ====================

// GET /api/v1/assets - Get all assets
router.get('/', authenticateToken, requireRole(['admin', 'asset_manager']), assetRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, category, status, location, search } = req.query;
    const skip = (page - 1) * limit;
    
    const assetsCollection = await getCollection('theme_assets');
    
    // Build query
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (location) query.location = location;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetTag: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const assets = await assetsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await assetsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        assets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Assets retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_ASSETS_FAILED',
      message: 'Failed to retrieve assets',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/assets/:id - Get asset by ID
router.get('/:id', authenticateToken, requireRole(['admin', 'asset_manager']), assetRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const assetsCollection = await getCollection('theme_assets');
    
    const asset = await assetsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'ASSET_NOT_FOUND',
        message: 'Asset not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { asset },
      message: 'Asset retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_ASSET_FAILED',
      message: 'Failed to retrieve asset',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/assets - Create new asset
router.post('/', authenticateToken, requireRole(['admin', 'asset_manager']), assetRateLimit, async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      serialNumber,
      model,
      manufacturer,
      purchaseDate,
      purchasePrice,
      warrantyExpiry,
      location,
      assignedTo,
      status,
      condition,
      tags
    } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name and category are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const assetsCollection = await getCollection('theme_assets');
    
    // Generate asset tag
    const assetCount = await assetsCollection.countDocuments();
    const assetTag = `AST${String(assetCount + 1).padStart(6, '0')}`;
    
    const newAsset = {
      assetTag,
      name,
      category,
      description: description || null,
      serialNumber: serialNumber || null,
      model: model || null,
      manufacturer: manufacturer || null,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      purchasePrice: purchasePrice || null,
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
      location: location || null,
      assignedTo: assignedTo || null,
      status: status || 'available',
      condition: condition || 'good',
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await assetsCollection.insertOne(newAsset);
    
    res.status(201).json({
      success: true,
      data: { asset: { ...newAsset, _id: result.insertedId } },
      message: 'Asset created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_ASSET_FAILED',
      message: 'Failed to create asset',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/assets/:id - Update asset
router.put('/:id', authenticateToken, requireRole(['admin', 'asset_manager']), assetRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const assetsCollection = await getCollection('theme_assets');
    
    const result = await assetsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'ASSET_NOT_FOUND',
        message: 'Asset not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const updatedAsset = await assetsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { asset: updatedAsset },
      message: 'Asset updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_ASSET_FAILED',
      message: 'Failed to update asset',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/assets/:id - Delete asset
router.delete('/:id', authenticateToken, requireRole(['admin']), assetRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const assetsCollection = await getCollection('theme_assets');
    
    const result = await assetsCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'ASSET_NOT_FOUND',
        message: 'Asset not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { id },
      message: 'Asset deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_ASSET_FAILED',
      message: 'Failed to delete asset',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== ASSET ASSIGNMENT ====================

// POST /api/v1/assets/:id/assign - Assign asset to user
router.post('/:id/assign', authenticateToken, requireRole(['admin', 'asset_manager']), assetRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, assignedDate, notes } = req.body;
    
    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_ASSIGNEE',
        message: 'Assigned to user is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const assetsCollection = await getCollection('theme_assets');
    
    const updateData = {
      assignedTo,
      assignedDate: assignedDate ? new Date(assignedDate) : new Date(),
      status: 'assigned',
      updatedAt: new Date()
    };
    
    const result = await assetsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'ASSET_NOT_FOUND',
        message: 'Asset not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Log assignment
    const assetAssignmentsCollection = await getCollection('asset_assignments');
    await assetAssignmentsCollection.insertOne({
      assetId: new ObjectId(id),
      assignedTo,
      assignedDate: updateData.assignedDate,
      notes: notes || null,
      assignedBy: req.user.userId,
      createdAt: new Date()
    });
    
    const updatedAsset = await assetsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { asset: updatedAsset },
      message: 'Asset assigned successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Assign asset error:', error);
    res.status(500).json({
      success: false,
      error: 'ASSIGN_ASSET_FAILED',
      message: 'Failed to assign asset',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/assets/:id/unassign - Unassign asset
router.post('/:id/unassign', authenticateToken, requireRole(['admin', 'asset_manager']), assetRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const assetsCollection = await getCollection('theme_assets');
    
    const updateData = {
      assignedTo: null,
      assignedDate: null,
      status: 'available',
      updatedAt: new Date()
    };
    
    const result = await assetsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'ASSET_NOT_FOUND',
        message: 'Asset not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Log unassignment
    const assetAssignmentsCollection = await getCollection('asset_assignments');
    await assetAssignmentsCollection.insertOne({
      assetId: new ObjectId(id),
      assignedTo: null,
      unassignedDate: new Date(),
      notes: notes || null,
      unassignedBy: req.user.userId,
      createdAt: new Date()
    });
    
    const updatedAsset = await assetsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { asset: updatedAsset },
      message: 'Asset unassigned successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Unassign asset error:', error);
    res.status(500).json({
      success: false,
      error: 'UNASSIGN_ASSET_FAILED',
      message: 'Failed to unassign asset',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== INVENTORY MANAGEMENT ====================

// GET /api/v1/assets/inventory - Get inventory overview
router.get('/inventory', authenticateToken, requireRole(['admin', 'asset_manager']), assetRateLimit, async (req, res) => {
  try {
    const { category, location } = req.query;
    
    const assetsCollection = await getCollection('theme_assets');
    
    // Build query
    const query = {};
    if (category) query.category = category;
    if (location) query.location = location;
    
    const assets = await assetsCollection.find(query).toArray();
    
    // Calculate inventory statistics
    const totalAssets = assets.length;
    const availableAssets = assets.filter(a => a.status === 'available').length;
    const assignedAssets = assets.filter(a => a.status === 'assigned').length;
    const maintenanceAssets = assets.filter(a => a.status === 'maintenance').length;
    const retiredAssets = assets.filter(a => a.status === 'retired').length;
    
    // Category distribution
    const categoryStats = {};
    assets.forEach(asset => {
      if (!categoryStats[asset.category]) {
        categoryStats[asset.category] = { total: 0, available: 0, assigned: 0 };
      }
      categoryStats[asset.category].total++;
      if (asset.status === 'available') categoryStats[asset.category].available++;
      if (asset.status === 'assigned') categoryStats[asset.category].assigned++;
    });
    
    // Location distribution
    const locationStats = {};
    assets.forEach(asset => {
      const loc = asset.location || 'Unassigned';
      if (!locationStats[loc]) {
        locationStats[loc] = { total: 0, available: 0, assigned: 0 };
      }
      locationStats[loc].total++;
      if (asset.status === 'available') locationStats[loc].available++;
      if (asset.status === 'assigned') locationStats[loc].assigned++;
    });
    
    // Total value calculation
    const totalValue = assets.reduce((sum, asset) => sum + (asset.purchasePrice || 0), 0);
    
    const inventory = {
      overview: {
        totalAssets,
        availableAssets,
        assignedAssets,
        maintenanceAssets,
        retiredAssets,
        totalValue
      },
      categoryDistribution: categoryStats,
      locationDistribution: locationStats,
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: inventory,
      message: 'Inventory overview retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_INVENTORY_FAILED',
      message: 'Failed to retrieve inventory overview',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== MAINTENANCE TRACKING ====================

// GET /api/v1/assets/:id/maintenance - Get asset maintenance history
router.get('/:id/maintenance', authenticateToken, requireRole(['admin', 'asset_manager']), assetRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const maintenanceCollection = await getCollection('asset_maintenance');
    
    const maintenanceRecords = await maintenanceCollection
      .find({ assetId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: { maintenanceRecords },
      message: 'Maintenance history retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get maintenance history error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MAINTENANCE_HISTORY_FAILED',
      message: 'Failed to retrieve maintenance history',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/assets/:id/maintenance - Add maintenance record
router.post('/:id/maintenance', authenticateToken, requireRole(['admin', 'asset_manager']), assetRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      description,
      cost,
      performedBy,
      performedDate,
      nextMaintenanceDate,
      status
    } = req.body;
    
    if (!type || !description) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Type and description are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const maintenanceCollection = await getCollection('asset_maintenance');
    const assetsCollection = await getCollection('theme_assets');
    
    const newMaintenanceRecord = {
      assetId: new ObjectId(id),
      type,
      description,
      cost: cost || null,
      performedBy: performedBy || null,
      performedDate: performedDate ? new Date(performedDate) : new Date(),
      nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate) : null,
      status: status || 'completed',
      createdAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await maintenanceCollection.insertOne(newMaintenanceRecord);
    
    // Update asset status if needed
    if (status === 'in_progress') {
      await assetsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'maintenance', updatedAt: new Date() } }
      );
    } else if (status === 'completed') {
      await assetsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'available', updatedAt: new Date() } }
      );
    }
    
    res.status(201).json({
      success: true,
      data: { maintenanceRecord: { ...newMaintenanceRecord, _id: result.insertedId } },
      message: 'Maintenance record created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create maintenance record error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_MAINTENANCE_RECORD_FAILED',
      message: 'Failed to create maintenance record',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== ASSET ANALYTICS ====================

// GET /api/v1/assets/analytics - Get asset analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'asset_manager']), assetRateLimit, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const assetsCollection = await getCollection('theme_assets');
    const maintenanceCollection = await getCollection('asset_maintenance');
    const assignmentsCollection = await getCollection('asset_assignments');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));
    
    // Asset statistics
    const totalAssets = await assetsCollection.countDocuments();
    const availableAssets = await assetsCollection.countDocuments({ status: 'available' });
    const assignedAssets = await assetsCollection.countDocuments({ status: 'assigned' });
    const maintenanceAssets = await assetsCollection.countDocuments({ status: 'maintenance' });
    const retiredAssets = await assetsCollection.countDocuments({ status: 'retired' });
    
    // Recent additions
    const recentAssets = await assetsCollection.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Maintenance statistics
    const totalMaintenance = await maintenanceCollection.countDocuments();
    const recentMaintenance = await maintenanceCollection.countDocuments({
      performedDate: { $gte: startDate, $lte: endDate }
    });
    
    // Assignment statistics
    const totalAssignments = await assignmentsCollection.countDocuments();
    const recentAssignments = await assignmentsCollection.countDocuments({
      assignedDate: { $gte: startDate, $lte: endDate }
    });
    
    // Category distribution
    const categoryStats = await assetsCollection.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Status distribution
    const statusStats = await assetsCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Total value
    const valueStats = await assetsCollection.aggregate([
      { $group: { _id: null, totalValue: { $sum: '$purchasePrice' } } }
    ]).toArray();
    
    const analytics = {
      assets: {
        total: totalAssets,
        available: availableAssets,
        assigned: assignedAssets,
        maintenance: maintenanceAssets,
        retired: retiredAssets,
        recent: recentAssets,
        categories: categoryStats,
        status: statusStats,
        totalValue: valueStats[0]?.totalValue || 0
      },
      maintenance: {
        total: totalMaintenance,
        recent: recentMaintenance
      },
      assignments: {
        total: totalAssignments,
        recent: recentAssignments
      },
      period,
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'Asset analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get asset analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_ASSET_ANALYTICS_FAILED',
      message: 'Failed to retrieve asset analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== GENERIC HANDLERS ====================

// GET /api/v1/assets/overview - Get assets overview
router.get('/overview', authenticateToken, requireRole(['admin', 'asset_manager']), assetRateLimit, async (req, res) => {
  res.json({
    success: true,
    message: 'Asset Management API is running',
    endpoints: {
      assets: '/api/v1/assets',
      inventory: '/api/v1/assets/inventory',
      maintenance: '/api/v1/assets/:id/maintenance',
      analytics: '/api/v1/assets/analytics'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
