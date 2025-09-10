const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all car parts
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, brand, make, model, year, inStock, startDate, endDate } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (category) filters.category = category;
        if (brand) filters.brand = brand;
        if (make) filters.make = make;
        if (model) filters.model = model;
        if (year) filters.year = parseInt(year);
        if (inStock !== undefined) filters.inStock = inStock === 'true';
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('car_parts');
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
        console.error('Get car parts error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CAR_PARTS_FAILED',
            message: 'Failed to retrieve car parts'
        });
    }
});

// Get car part by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('car_parts');
        const part = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!part) {
            return res.status(404).json({
                success: false,
                error: 'CAR_PART_NOT_FOUND',
                message: 'Car part not found'
            });
        }

        res.json({
            success: true,
            data: part
        });
    } catch (error) {
        console.error('Get car part by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CAR_PART_BY_ID_FAILED',
            message: 'Failed to retrieve car part'
        });
    }
});

// Create car part
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            name,
            partNumber,
            category,
            brand,
            make,
            model,
            year,
            description,
            price,
            stockQuantity,
            minStockLevel,
            supplier,
            warranty,
            specifications,
            images
        } = req.body;
        
        if (!name || !partNumber || !category || !brand || !price) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Name, part number, category, brand, and price are required'
            });
        }

        // Check if part number already exists
        const collection = await getCollection('car_parts');
        const existingPart = await collection.findOne({ partNumber });
        if (existingPart) {
            return res.status(400).json({
                success: false,
                error: 'PART_NUMBER_EXISTS',
                message: 'Part number already exists'
            });
        }

        const partData = {
            name,
            partNumber,
            category,
            brand,
            make: make || '',
            model: model || '',
            year: year ? parseInt(year) : null,
            description: description || '',
            price: parseFloat(price),
            stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
            minStockLevel: minStockLevel ? parseInt(minStockLevel) : 5,
            supplier: supplier || '',
            warranty: warranty || '',
            specifications: specifications || {},
            images: images || [],
            inStock: (stockQuantity ? parseInt(stockQuantity) : 0) > 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await collection.insertOne(partData);
        
        partData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Car part created successfully',
            data: partData
        });
    } catch (error) {
        console.error('Create car part error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_CAR_PART_FAILED',
            message: 'Failed to create car part'
        });
    }
});

// Update car part
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        // Convert numeric fields
        if (updateData.price) updateData.price = parseFloat(updateData.price);
        if (updateData.stockQuantity) updateData.stockQuantity = parseInt(updateData.stockQuantity);
        if (updateData.minStockLevel) updateData.minStockLevel = parseInt(updateData.minStockLevel);
        if (updateData.year) updateData.year = parseInt(updateData.year);

        // Update inStock status based on stockQuantity
        if (updateData.stockQuantity !== undefined) {
            updateData.inStock = updateData.stockQuantity > 0;
        }

        const collection = await getCollection('car_parts');
        const part = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!part) {
            return res.status(404).json({
                success: false,
                error: 'CAR_PART_NOT_FOUND',
                message: 'Car part not found'
            });
        }

        // Check if part number is being changed and if it already exists
        if (updateData.partNumber && updateData.partNumber !== part.partNumber) {
            const existingPart = await collection.findOne({ 
                partNumber: updateData.partNumber,
                _id: { $ne: new ObjectId(id) }
            });
            if (existingPart) {
                return res.status(400).json({
                    success: false,
                    error: 'PART_NUMBER_EXISTS',
                    message: 'Part number already exists'
                });
            }
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'CAR_PART_NOT_FOUND',
                message: 'Car part not found'
            });
        }

        res.json({
            success: true,
            message: 'Car part updated successfully'
        });
    } catch (error) {
        console.error('Update car part error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_CAR_PART_FAILED',
            message: 'Failed to update car part'
        });
    }
});

// Update car part stock
router.patch('/:id/stock', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { stockQuantity, operation } = req.body;
        
        if (stockQuantity === undefined) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_STOCK_QUANTITY',
                message: 'Stock quantity is required'
            });
        }

        const collection = await getCollection('car_parts');
        const part = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!part) {
            return res.status(404).json({
                success: false,
                error: 'CAR_PART_NOT_FOUND',
                message: 'Car part not found'
            });
        }

        let newStockQuantity;
        if (operation === 'add') {
            newStockQuantity = part.stockQuantity + parseInt(stockQuantity);
        } else if (operation === 'subtract') {
            newStockQuantity = Math.max(0, part.stockQuantity - parseInt(stockQuantity));
        } else {
            newStockQuantity = parseInt(stockQuantity);
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    stockQuantity: newStockQuantity,
                    inStock: newStockQuantity > 0,
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: `Stock updated to ${newStockQuantity}`,
            data: { stockQuantity: newStockQuantity, inStock: newStockQuantity > 0 }
        });
    } catch (error) {
        console.error('Update car part stock error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_CAR_PART_STOCK_FAILED',
            message: 'Failed to update car part stock'
        });
    }
});

// Delete car part
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('car_parts');
        
        const part = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!part) {
            return res.status(404).json({
                success: false,
                error: 'CAR_PART_NOT_FOUND',
                message: 'Car part not found'
            });
        }

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'CAR_PART_NOT_FOUND',
                message: 'Car part not found'
            });
        }

        res.json({
            success: true,
            message: 'Car part deleted successfully'
        });
    } catch (error) {
        console.error('Delete car part error:', error);
        res.status(500).json({
            success: false,
            error: 'DELETE_CAR_PART_FAILED',
            message: 'Failed to delete car part'
        });
    }
});

// Search car parts
router.get('/search/query', authenticateToken, async (req, res) => {
    try {
        const { q, page = 1, limit = 10, category, brand, inStock } = req.query;
        const skip = (page - 1) * limit;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_QUERY',
                message: 'Search query is required'
            });
        }

        const filters = {
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { partNumber: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { brand: { $regex: q, $options: 'i' } },
                { make: { $regex: q, $options: 'i' } },
                { model: { $regex: q, $options: 'i' } }
            ]
        };

        if (category) filters.category = category;
        if (brand) filters.brand = brand;
        if (inStock !== undefined) filters.inStock = inStock === 'true';

        const collection = await getCollection('car_parts');
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
        console.error('Search car parts error:', error);
        res.status(500).json({
            success: false,
            error: 'SEARCH_CAR_PARTS_FAILED',
            message: 'Failed to search car parts'
        });
    }
});

// Get car parts by category
router.get('/category/:category', authenticateToken, async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10, brand, inStock } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { category };
        if (brand) filters.brand = brand;
        if (inStock !== undefined) filters.inStock = inStock === 'true';

        const collection = await getCollection('car_parts');
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
        console.error('Get car parts by category error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CAR_PARTS_BY_CATEGORY_FAILED',
            message: 'Failed to retrieve car parts by category'
        });
    }
});

// Get car parts by brand
router.get('/brand/:brand', authenticateToken, async (req, res) => {
    try {
        const { brand } = req.params;
        const { page = 1, limit = 10, category, inStock } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { brand };
        if (category) filters.category = category;
        if (inStock !== undefined) filters.inStock = inStock === 'true';

        const collection = await getCollection('car_parts');
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
        console.error('Get car parts by brand error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CAR_PARTS_BY_BRAND_FAILED',
            message: 'Failed to retrieve car parts by brand'
        });
    }
});

// Get car parts by vehicle compatibility
router.get('/compatible/:make/:model/:year', authenticateToken, async (req, res) => {
    try {
        const { make, model, year } = req.params;
        const { page = 1, limit = 10, category, brand } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {
            $or: [
                { make: make, model: model, year: parseInt(year) },
                { make: make, model: model, year: null },
                { make: make, model: '', year: parseInt(year) },
                { make: make, model: '', year: null }
            ]
        };

        if (category) filters.category = category;
        if (brand) filters.brand = brand;

        const collection = await getCollection('car_parts');
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
        console.error('Get compatible car parts error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_COMPATIBLE_CAR_PARTS_FAILED',
            message: 'Failed to retrieve compatible car parts'
        });
    }
});

// Get low stock car parts
router.get('/low-stock/list', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('car_parts');
        const parts = await collection.find({
            $expr: { $lte: ['$stockQuantity', '$minStockLevel'] }
        })
        .sort({ stockQuantity: 1 })
        .toArray();

        res.json({
            success: true,
            data: parts
        });
    } catch (error) {
        console.error('Get low stock car parts error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_LOW_STOCK_CAR_PARTS_FAILED',
            message: 'Failed to retrieve low stock car parts'
        });
    }
});

// Get car parts statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('car_parts');
        
        // Get total parts
        const totalParts = await collection.countDocuments(filters);
        
        // Get parts by category
        const partsByCategory = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get parts by brand
        const partsByBrand = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$brand', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get in-stock parts
        const inStockParts = await collection.countDocuments({ 
            ...filters,
            inStock: true
        });

        // Get out-of-stock parts
        const outOfStockParts = await collection.countDocuments({ 
            ...filters,
            inStock: false
        });

        // Get low stock parts
        const lowStockParts = await collection.countDocuments({
            ...filters,
            $expr: { $lte: ['$stockQuantity', '$minStockLevel'] }
        });

        // Get total inventory value
        const totalInventoryValue = await collection.aggregate([
            { $match: filters },
            { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stockQuantity'] } } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalParts,
                inStockParts,
                outOfStockParts,
                lowStockParts,
                partsByCategory,
                partsByBrand,
                totalInventoryValue: totalInventoryValue[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Get car parts stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CAR_PARTS_STATS_FAILED',
            message: 'Failed to retrieve car parts statistics'
        });
    }
});

module.exports = router;
