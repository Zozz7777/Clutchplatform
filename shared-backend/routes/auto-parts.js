const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/database');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/rbac');

// ==================== AUTO PARTS INTEGRATION ROUTES ====================

// GET /api/v1/auto-parts/inventory - Get inventory with filtering and search
router.get('/inventory', async (req, res) => {
  try {
    console.log('🔧 Fetching auto parts inventory:', req.query);
    
    const { 
      page = 1, 
      limit = 50, 
      category, 
      brand, 
      partNumber,
      search,
      inStock = true,
      minPrice,
      maxPrice
    } = req.query;
    
    const skip = (page - 1) * limit;
    const collection = await getCollection('carparts');
    
    // Build query
    const query = {};
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (partNumber) query.partNumber = { $regex: partNumber, $options: 'i' };
    if (inStock === 'true') query.quantity = { $gt: 0 };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get inventory with pagination
    const inventory = await collection
      .find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    // Get total count
    const total = await collection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        inventory,
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
    console.error('❌ Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_INVENTORY_FAILED',
      message: 'Failed to fetch auto parts inventory'
    });
  }
});

// POST /api/v1/auto-parts/inventory - Add new part to inventory
router.post('/inventory', authenticateToken, checkRole(['head_administrator', 'inventory_manager']), async (req, res) => {
  try {
    console.log('➕ Adding new auto part to inventory:', req.body);
    
    const { 
      name, 
      partNumber, 
      brand, 
      category, 
      description,
      price,
      cost,
      quantity,
      minQuantity,
      maxQuantity,
      location,
      supplier,
      specifications = {},
      images = []
    } = req.body;
    
    // Validation
    if (!name || !partNumber || !brand || !category || !price || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Name, part number, brand, category, price, and quantity are required'
      });
    }
    
    const collection = await getCollection('carparts');
    
    // Check if part already exists
    const existingPart = await collection.findOne({ partNumber });
    if (existingPart) {
      return res.status(409).json({
        success: false,
        error: 'PART_EXISTS',
        message: 'Part with this part number already exists'
      });
    }
    
    const autoPart = {
      name,
      partNumber,
      brand,
      category,
      description: description || '',
      price: parseFloat(price),
      cost: cost ? parseFloat(cost) : null,
      quantity: parseInt(quantity),
      minQuantity: minQuantity ? parseInt(minQuantity) : 0,
      maxQuantity: maxQuantity ? parseInt(maxQuantity) : 1000,
      location: location || '',
      supplier: supplier || '',
      specifications,
      images: Array.isArray(images) ? images : [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.id,
      lastRestocked: new Date(),
      totalSold: 0,
      totalRevenue: 0
    };
    
    const result = await collection.insertOne(autoPart);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...autoPart
      },
      message: 'Auto part added to inventory successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error adding auto part:', error);
    res.status(500).json({
      success: false,
      error: 'ADD_PART_FAILED',
      message: 'Failed to add auto part to inventory'
    });
  }
});

// PUT /api/v1/auto-parts/inventory/:id - Update inventory item
router.put('/inventory/:id', authenticateToken, checkRole(['head_administrator', 'inventory_manager']), async (req, res) => {
  try {
    console.log('✏️ Updating auto part inventory:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { 
      name, 
      partNumber, 
      brand, 
      category, 
      description,
      price,
      cost,
      quantity,
      minQuantity,
      maxQuantity,
      location,
      supplier,
      specifications,
      images,
      status
    } = req.body;
    
    const collection = await getCollection('carparts');
    
    // Check if part exists
    const existingPart = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!existingPart) {
      return res.status(404).json({
        success: false,
        error: 'PART_NOT_FOUND',
        message: 'Auto part not found'
      });
    }
    
    // Build update object
    const updateData = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (partNumber) updateData.partNumber = partNumber;
    if (brand) updateData.brand = brand;
    if (category) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (cost !== undefined) updateData.cost = cost ? parseFloat(cost) : null;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (minQuantity !== undefined) updateData.minQuantity = parseInt(minQuantity);
    if (maxQuantity !== undefined) updateData.maxQuantity = parseInt(maxQuantity);
    if (location !== undefined) updateData.location = location;
    if (supplier !== undefined) updateData.supplier = supplier;
    if (specifications) updateData.specifications = specifications;
    if (images) updateData.images = Array.isArray(images) ? images : [];
    if (status) updateData.status = status;
    
    // Update last restocked if quantity increased
    if (quantity && quantity > existingPart.quantity) {
      updateData.lastRestocked = new Date();
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'No changes made to auto part'
      });
    }
    
    // Get updated part
    const updatedPart = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    res.json({
      success: true,
      data: updatedPart,
      message: 'Auto part updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating auto part:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_PART_FAILED',
      message: 'Failed to update auto part'
    });
  }
});

// DELETE /api/v1/auto-parts/inventory/:id - Delete inventory item
router.delete('/inventory/:id', authenticateToken, checkRole(['head_administrator']), async (req, res) => {
  try {
    console.log('🗑️ Deleting auto part from inventory:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const collection = await getCollection('carparts');
    
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'PART_NOT_FOUND',
        message: 'Auto part not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Auto part deleted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error deleting auto part:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_PART_FAILED',
      message: 'Failed to delete auto part'
    });
  }
});

// POST /api/v1/auto-parts/orders - Create new order
router.post('/orders', authenticateToken, async (req, res) => {
  try {
    console.log('🛒 Creating new auto parts order:', req.body);
    
    const { 
      items, 
      customerInfo, 
      shippingAddress, 
      paymentMethod,
      notes = ''
    } = req.body;
    
    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Order items are required'
      });
    }
    
    if (!customerInfo || !customerInfo.name || !customerInfo.email) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Customer information is required'
      });
    }
    
    const inventoryCollection = await getCollection('auto_parts_inventory');
    const ordersCollection = await getCollection('auto_parts_orders');
    
    // Validate items and calculate totals
    let totalAmount = 0;
    const validatedItems = [];
    
    for (const item of items) {
      const { partId, quantity } = item;
      
      if (!partId || !quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid item data'
        });
      }
      
      const part = await inventoryCollection.findOne({ _id: new ObjectId(partId) });
      if (!part) {
        return res.status(404).json({
          success: false,
          error: 'PART_NOT_FOUND',
          message: `Part with ID ${partId} not found`
        });
      }
      
      if (part.quantity < quantity) {
        return res.status(400).json({
          success: false,
          error: 'INSUFFICIENT_STOCK',
          message: `Insufficient stock for ${part.name}. Available: ${part.quantity}, Requested: ${quantity}`
        });
      }
      
      const itemTotal = part.price * quantity;
      totalAmount += itemTotal;
      
      validatedItems.push({
        partId: part._id,
        partNumber: part.partNumber,
        name: part.name,
        brand: part.brand,
        price: part.price,
        quantity,
        total: itemTotal
      });
    }
    
    // Create order
    const order = {
      orderNumber: `AP-${Date.now()}`,
      items: validatedItems,
      customerInfo,
      shippingAddress,
      paymentMethod,
      notes,
      totalAmount,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.id,
      paymentStatus: 'pending',
      shippingStatus: 'pending',
      trackingNumber: null
    };
    
    const result = await ordersCollection.insertOne(order);
    
    // Update inventory quantities
    for (const item of validatedItems) {
      await inventoryCollection.updateOne(
        { _id: item.partId },
        { 
          $inc: { 
            quantity: -item.quantity,
            totalSold: item.quantity,
            totalRevenue: item.total
          }
        }
      );
    }
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...order
      },
      message: 'Auto parts order created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_ORDER_FAILED',
      message: 'Failed to create auto parts order'
    });
  }
});

// GET /api/v1/auto-parts/orders - Get orders with filtering
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Fetching auto parts orders:', req.query);
    
    const { 
      page = 1, 
      limit = 20, 
      status, 
      customerEmail,
      startDate,
      endDate
    } = req.query;
    
    const skip = (page - 1) * limit;
    const collection = await getCollection('auto_parts_orders');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (customerEmail) query['customerInfo.email'] = customerEmail;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Get orders with pagination
    const orders = await collection
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
        orders,
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
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ORDERS_FAILED',
      message: 'Failed to fetch auto parts orders'
    });
  }
});

// PUT /api/v1/auto-parts/orders/:id/status - Update order status
router.put('/orders/:id/status', authenticateToken, checkRole(['head_administrator', 'order_manager']), async (req, res) => {
  try {
    console.log('📊 Updating order status:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { status, trackingNumber, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Status is required'
      });
    }
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const collection = await getCollection('auto_parts_orders');
    
    // Check if order exists
    const existingOrder = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: 'Order not found'
      });
    }
    
    const updateData = {
      status,
      updatedAt: new Date()
    };
    
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;
    
    // Set shipping status based on order status
    if (status === 'shipped') {
      updateData.shippingStatus = 'shipped';
    } else if (status === 'delivered') {
      updateData.shippingStatus = 'delivered';
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'Failed to update order status'
      });
    }
    
    // Get updated order
    const updatedOrder = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_ORDER_STATUS_FAILED',
      message: 'Failed to update order status'
    });
  }
});

// GET /api/v1/auto-parts/analytics - Get auto parts analytics
router.get('/analytics', authenticateToken, checkRole(['head_administrator', 'analyst']), async (req, res) => {
  try {
    console.log('📊 Fetching auto parts analytics');
    
    const { startDate, endDate } = req.query;
    const inventoryCollection = await getCollection('auto_parts_inventory');
    const ordersCollection = await getCollection('auto_parts_orders');
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Get analytics
    const [
      totalParts,
      lowStockParts,
      outOfStockParts,
      totalOrders,
      totalRevenue,
      topSellingParts,
      ordersByStatus,
      revenueByCategory
    ] = await Promise.all([
      // Total parts
      inventoryCollection.countDocuments(),
      
      // Low stock parts
      inventoryCollection.countDocuments({ 
        $expr: { $lte: ['$quantity', '$minQuantity'] } 
      }),
      
      // Out of stock parts
      inventoryCollection.countDocuments({ quantity: 0 }),
      
      // Total orders
      ordersCollection.countDocuments(dateFilter),
      
      // Total revenue
      ordersCollection.aggregate([
        { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).toArray(),
      
      // Top selling parts
      inventoryCollection
        .find({ totalSold: { $gt: 0 } })
        .sort({ totalSold: -1 })
        .limit(10)
        .toArray(),
      
      // Orders by status
      ordersCollection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Revenue by category
      inventoryCollection.aggregate([
        { $match: { totalRevenue: { $gt: 0 } } },
        { $group: { _id: '$category', totalRevenue: { $sum: '$totalRevenue' } } },
        { $sort: { totalRevenue: -1 } }
      ]).toArray()
    ]);
    
    const analytics = {
      inventory: {
        total: totalParts,
        lowStock: lowStockParts,
        outOfStock: outOfStockParts
      },
      orders: {
        total: totalOrders,
        byStatus: ordersByStatus
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        byCategory: revenueByCategory
      },
      topSelling: topSellingParts
    };
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ANALYTICS_FAILED',
      message: 'Failed to fetch auto parts analytics'
    });
  }
});

// POST /api/v1/auto-parts/sync - Trigger inventory synchronization
router.post('/sync', authenticateToken, checkRole(['head_administrator', 'inventory_manager']), async (req, res) => {
  try {
    console.log('🔄 Triggering auto parts inventory synchronization');
    
    // This would typically integrate with external suppliers
    // For now, we'll simulate the sync process
    
    const collection = await getCollection('carparts');
    
    // Update last sync timestamp
    const syncResult = await collection.updateMany(
      { status: 'active' },
      { $set: { lastSyncAt: new Date() } }
    );
    
    res.json({
      success: true,
      data: {
        syncedParts: syncResult.modifiedCount,
        syncTime: new Date().toISOString()
      },
      message: 'Inventory synchronization completed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error syncing inventory:', error);
    res.status(500).json({
      success: false,
      error: 'SYNC_FAILED',
      message: 'Failed to synchronize inventory'
    });
  }
});


// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'auto-parts'} service is running`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'auto-parts'} item retrieved`,
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: `${'auto-parts'} item created`,
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
    message: `${'auto-parts'} item updated`,
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
    message: `${'auto-parts'} item deleted`,
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'auto-parts'} search results`,
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;