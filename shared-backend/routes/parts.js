const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all parts
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, brand, status, minPrice, maxPrice, compatibility } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (category) filters.category = category;
        if (brand) filters.brand = brand;
        if (status) filters.status = status;
        if (compatibility) filters.compatibility = { $in: [compatibility] };
        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.$gte = parseFloat(minPrice);
            if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
        }

        const collection = await getCollection('parts');
        const parts = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: parts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get parts error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PARTS_FAILED',
            message: 'Failed to retrieve parts'
        });
    }
});

// Get part by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('parts');
        const part = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!part) {
            return res.status(404).json({
                success: false,
                error: 'PART_NOT_FOUND',
                message: 'Part not found'
            });
        }

        res.json({
            success: true,
            data: part
        });
    } catch (error) {
        console.error('Get part error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PART_FAILED',
            message: 'Failed to retrieve part'
        });
    }
});

// Create part
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            name, 
            description, 
            category, 
            brand,
            partNumber,
            price,
            stockQuantity,
            compatibility,
            specifications,
            images,
            warranty 
        } = req.body;
        
        if (!name || !description || !category || !price) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Name, description, category, and price are required'
            });
        }

        const partData = {
            name,
            description,
            category,
            brand: brand || '',
            partNumber: partNumber || '',
            price: parseFloat(price),
            stockQuantity: stockQuantity || 0,
            compatibility: compatibility || [],
            specifications: specifications || {},
            images: images || [],
            warranty: warranty || '',
            status: 'active',
            createdBy: req.user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('parts');
        const result = await collection.insertOne(partData);
        
        partData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Part created successfully',
            data: partData
        });
    } catch (error) {
        console.error('Create part error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_PART_FAILED',
            message: 'Failed to create part'
        });
    }
});

// Update part
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('parts');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'PART_NOT_FOUND',
                message: 'Part not found'
            });
        }

        res.json({
            success: true,
            message: 'Part updated successfully'
        });
    } catch (error) {
        console.error('Update part error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_PART_FAILED',
            message: 'Failed to update part'
        });
    }
});

// Update part stock
router.patch('/:id/stock', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, operation } = req.body;
        
        if (!quantity || !operation) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Quantity and operation are required'
            });
        }

        const collection = await getCollection('parts');
        const part = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!part) {
            return res.status(404).json({
                success: false,
                error: 'PART_NOT_FOUND',
                message: 'Part not found'
            });
        }

        let newQuantity;
        if (operation === 'add') {
            newQuantity = part.stockQuantity + parseInt(quantity);
        } else if (operation === 'subtract') {
            newQuantity = part.stockQuantity - parseInt(quantity);
            if (newQuantity < 0) {
                return res.status(400).json({
                    success: false,
                    error: 'INSUFFICIENT_STOCK',
                    message: 'Insufficient stock available'
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                error: 'INVALID_OPERATION',
                message: 'Operation must be "add" or "subtract"'
            });
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    stockQuantity: newQuantity,
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: `Stock ${operation === 'add' ? 'added' : 'subtracted'} successfully`,
            data: { newQuantity }
        });
    } catch (error) {
        console.error('Update part stock error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_PART_STOCK_FAILED',
            message: 'Failed to update part stock'
        });
    }
});

// Get parts by category
router.get('/category/:category', authenticateToken, async (req, res) => {
    try {
        const { category } = req.params;
        const { brand, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        const filters = { category };
        if (brand) filters.brand = brand;
        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.$gte = parseFloat(minPrice);
            if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const collection = await getCollection('parts');
        const parts = await collection.find(filters)
            .sort(sortOptions)
            .toArray();

        res.json({
            success: true,
            data: parts
        });
    } catch (error) {
        console.error('Get parts by category error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PARTS_BY_CATEGORY_FAILED',
            message: 'Failed to retrieve parts by category'
        });
    }
});

// Get parts by compatibility
router.get('/compatibility/:vehicleModel', authenticateToken, async (req, res) => {
    try {
        const { vehicleModel } = req.params;
        const { category, brand } = req.query;
        
        const filters = { compatibility: { $in: [vehicleModel] } };
        if (category) filters.category = category;
        if (brand) filters.brand = brand;

        const collection = await getCollection('parts');
        const parts = await collection.find(filters)
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            data: parts
        });
    } catch (error) {
        console.error('Get parts by compatibility error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PARTS_BY_COMPATIBILITY_FAILED',
            message: 'Failed to retrieve parts by compatibility'
        });
    }
});

// Search parts
router.get('/search/query', authenticateToken, async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_QUERY',
                message: 'Search query is required'
            });
        }

        const collection = await getCollection('parts');
        const parts = await collection.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { partNumber: { $regex: q, $options: 'i' } },
                { brand: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } }
            ]
        })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .toArray();
        
        const total = await collection.countDocuments({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { partNumber: { $regex: q, $options: 'i' } },
                { brand: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } }
            ]
        });

        res.json({
            success: true,
            data: parts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Search parts error:', error);
        res.status(500).json({
            success: false,
            error: 'SEARCH_PARTS_FAILED',
            message: 'Failed to search parts'
        });
    }
});

// Get part categories
router.get('/categories/list', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('parts');
        const categories = await collection.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get part categories error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PART_CATEGORIES_FAILED',
            message: 'Failed to retrieve part categories'
        });
    }
});

// Get part brands
router.get('/brands/list', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('parts');
        const brands = await collection.aggregate([
            { $match: { brand: { $ne: '' } } },
            { $group: { _id: '$brand', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        res.json({
            success: true,
            data: brands
        });
    } catch (error) {
        console.error('Get part brands error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PART_BRANDS_FAILED',
            message: 'Failed to retrieve part brands'
        });
    }
});

// Get low stock parts
router.get('/low-stock/list', authenticateToken, async (req, res) => {
    try {
        const { threshold = 10, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const collection = await getCollection('parts');
        const lowStockParts = await collection.find({ 
            stockQuantity: { $lte: parseInt(threshold) },
            status: 'active'
        })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ stockQuantity: 1 })
        .toArray();
        
        const total = await collection.countDocuments({ 
            stockQuantity: { $lte: parseInt(threshold) },
            status: 'active'
        });

        res.json({
            success: true,
            data: lowStockParts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get low stock parts error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_LOW_STOCK_PARTS_FAILED',
            message: 'Failed to retrieve low stock parts'
        });
    }
});

// Get parts statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('parts');
        
        // Get total parts
        const totalParts = await collection.countDocuments({});
        
        // Get active parts
        const activeParts = await collection.countDocuments({ status: 'active' });
        
        // Get parts by category
        const partsByCategory = await collection.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get parts by brand
        const partsByBrand = await collection.aggregate([
            { $match: { brand: { $ne: '' } } },
            { $group: { _id: '$brand', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get low stock parts
        const lowStockParts = await collection.countDocuments({ 
            stockQuantity: { $lte: 10 },
            status: 'active'
        });

        res.json({
            success: true,
            data: {
                totalParts,
                activeParts,
                inactiveParts: totalParts - activeParts,
                partsByCategory,
                partsByBrand,
                lowStockParts
            }
        });
    } catch (error) {
        console.error('Get parts stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PARTS_STATS_FAILED',
            message: 'Failed to retrieve parts statistics'
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
