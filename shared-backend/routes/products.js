const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all products
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, brand, status, minPrice, maxPrice } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (category) filters.category = category;
        if (brand) filters.brand = brand;
        if (status) filters.status = status;
        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.$gte = parseFloat(minPrice);
            if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
        }

        const collection = await getCollection('products');
        const products = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PRODUCTS_FAILED',
            message: 'Failed to retrieve products'
        });
    }
});

// Get product by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('products');
        const product = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'PRODUCT_NOT_FOUND',
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PRODUCT_FAILED',
            message: 'Failed to retrieve product'
        });
    }
});

// Create product
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            name, 
            description, 
            category, 
            brand,
            price,
            stockQuantity,
            images,
            specifications,
            tags 
        } = req.body;
        
        if (!name || !description || !category || !price) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Name, description, category, and price are required'
            });
        }

        const productData = {
            name,
            description,
            category,
            brand: brand || '',
            price: parseFloat(price),
            stockQuantity: stockQuantity || 0,
            images: images || [],
            specifications: specifications || {},
            tags: tags || [],
            status: 'active',
            createdBy: req.user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('products');
        const result = await collection.insertOne(productData);
        
        productData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: productData
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_PRODUCT_FAILED',
            message: 'Failed to create product'
        });
    }
});

// Update product
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('products');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'PRODUCT_NOT_FOUND',
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_PRODUCT_FAILED',
            message: 'Failed to update product'
        });
    }
});

// Update product stock
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

        const collection = await getCollection('products');
        const product = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'PRODUCT_NOT_FOUND',
                message: 'Product not found'
            });
        }

        let newQuantity;
        if (operation === 'add') {
            newQuantity = product.stockQuantity + parseInt(quantity);
        } else if (operation === 'subtract') {
            newQuantity = product.stockQuantity - parseInt(quantity);
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
        console.error('Update product stock error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_PRODUCT_STOCK_FAILED',
            message: 'Failed to update product stock'
        });
    }
});

// Get products by category
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

        const collection = await getCollection('products');
        const products = await collection.find(filters)
            .sort(sortOptions)
            .toArray();

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PRODUCTS_BY_CATEGORY_FAILED',
            message: 'Failed to retrieve products by category'
        });
    }
});

// Search products
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

        const collection = await getCollection('products');
        const products = await collection.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { brand: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } }
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
                { brand: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ]
        });

        res.json({
            success: true,
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({
            success: false,
            error: 'SEARCH_PRODUCTS_FAILED',
            message: 'Failed to search products'
        });
    }
});

// Get product categories
router.get('/categories/list', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('products');
        const categories = await collection.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get product categories error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PRODUCT_CATEGORIES_FAILED',
            message: 'Failed to retrieve product categories'
        });
    }
});

// Get product brands
router.get('/brands/list', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('products');
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
        console.error('Get product brands error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PRODUCT_BRANDS_FAILED',
            message: 'Failed to retrieve product brands'
        });
    }
});

// Get low stock products
router.get('/low-stock/list', authenticateToken, async (req, res) => {
    try {
        const { threshold = 10, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const collection = await getCollection('products');
        const lowStockProducts = await collection.find({ 
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
            data: lowStockProducts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get low stock products error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_LOW_STOCK_PRODUCTS_FAILED',
            message: 'Failed to retrieve low stock products'
        });
    }
});

// Get product statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('products');
        
        // Get total products
        const totalProducts = await collection.countDocuments({});
        
        // Get active products
        const activeProducts = await collection.countDocuments({ status: 'active' });
        
        // Get products by category
        const productsByCategory = await collection.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get products by brand
        const productsByBrand = await collection.aggregate([
            { $match: { brand: { $ne: '' } } },
            { $group: { _id: '$brand', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get low stock products
        const lowStockProducts = await collection.countDocuments({ 
            stockQuantity: { $lte: 10 },
            status: 'active'
        });

        res.json({
            success: true,
            data: {
                totalProducts,
                activeProducts,
                inactiveProducts: totalProducts - activeProducts,
                productsByCategory,
                productsByBrand,
                lowStockProducts
            }
        });
    } catch (error) {
        console.error('Get product stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PRODUCT_STATS_FAILED',
            message: 'Failed to retrieve product statistics'
        });
    }
});

module.exports = router;
