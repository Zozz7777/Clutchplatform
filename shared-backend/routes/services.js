const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all services
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, status, minPrice, maxPrice } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (category) filters.category = category;
        if (status) filters.status = status;
        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.$gte = parseFloat(minPrice);
            if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
        }

        const collection = await getCollection('services');
        const services = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: services,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SERVICES_FAILED',
            message: 'Failed to retrieve services'
        });
    }
});

// Get service by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('services');
        const service = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'SERVICE_NOT_FOUND',
                message: 'Service not found'
            });
        }

        res.json({
            success: true,
            data: service
        });
    } catch (error) {
        console.error('Get service error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SERVICE_FAILED',
            message: 'Failed to retrieve service'
        });
    }
});

// Create service
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            name, 
            description, 
            category, 
            price,
            duration,
            requirements,
            includedItems,
            excludedItems,
            terms 
        } = req.body;
        
        if (!name || !description || !category || !price) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Name, description, category, and price are required'
            });
        }

        const serviceData = {
            name,
            description,
            category,
            price: parseFloat(price),
            duration: duration || 0,
            requirements: requirements || [],
            includedItems: includedItems || [],
            excludedItems: excludedItems || [],
            terms: terms || {},
            status: 'active',
            createdBy: req.user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('services');
        const result = await collection.insertOne(serviceData);
        
        serviceData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: serviceData
        });
    } catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_SERVICE_FAILED',
            message: 'Failed to create service'
        });
    }
});

// Update service
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('services');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'SERVICE_NOT_FOUND',
                message: 'Service not found'
            });
        }

        res.json({
            success: true,
            message: 'Service updated successfully'
        });
    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_SERVICE_FAILED',
            message: 'Failed to update service'
        });
    }
});

// Toggle service status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_STATUS',
                message: 'Status must be "active" or "inactive"'
            });
        }

        const collection = await getCollection('services');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    status,
                    updatedAt: new Date()
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'SERVICE_NOT_FOUND',
                message: 'Service not found'
            });
        }

        res.json({
            success: true,
            message: `Service status updated to ${status}`
        });
    } catch (error) {
        console.error('Toggle service status error:', error);
        res.status(500).json({
            success: false,
            error: 'TOGGLE_SERVICE_STATUS_FAILED',
            message: 'Failed to toggle service status'
        });
    }
});

// Get services by category
router.get('/category/:category', authenticateToken, async (req, res) => {
    try {
        const { category } = req.params;
        const { status, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        const filters = { category };
        if (status) filters.status = status;
        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.$gte = parseFloat(minPrice);
            if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const collection = await getCollection('services');
        const services = await collection.find(filters)
            .sort(sortOptions)
            .toArray();

        res.json({
            success: true,
            data: services
        });
    } catch (error) {
        console.error('Get services by category error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SERVICES_BY_CATEGORY_FAILED',
            message: 'Failed to retrieve services by category'
        });
    }
});

// Search services
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

        const collection = await getCollection('services');
        const services = await collection.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
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
                { category: { $regex: q, $options: 'i' } }
            ]
        });

        res.json({
            success: true,
            data: services,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Search services error:', error);
        res.status(500).json({
            success: false,
            error: 'SEARCH_SERVICES_FAILED',
            message: 'Failed to search services'
        });
    }
});

// Get service categories
router.get('/categories/list', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('services');
        const categories = await collection.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get service categories error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SERVICE_CATEGORIES_FAILED',
            message: 'Failed to retrieve service categories'
        });
    }
});

// Get popular services
router.get('/popular/list', authenticateToken, async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const collection = await getCollection('services');
        const popularServices = await collection.find({ 
            status: 'active'
        })
        .sort({ popularity: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .toArray();

        res.json({
            success: true,
            data: popularServices
        });
    } catch (error) {
        console.error('Get popular services error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_POPULAR_SERVICES_FAILED',
            message: 'Failed to retrieve popular services'
        });
    }
});

// Update service popularity
router.patch('/:id/popularity', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { increment = 1 } = req.body;
        
        const collection = await getCollection('services');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $inc: { popularity: parseInt(increment) },
                $set: { updatedAt: new Date() }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'SERVICE_NOT_FOUND',
                message: 'Service not found'
            });
        }

        res.json({
            success: true,
            message: 'Service popularity updated successfully'
        });
    } catch (error) {
        console.error('Update service popularity error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_SERVICE_POPULARITY_FAILED',
            message: 'Failed to update service popularity'
        });
    }
});

// Get service statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('services');
        
        // Get total services
        const totalServices = await collection.countDocuments({});
        
        // Get active services
        const activeServices = await collection.countDocuments({ status: 'active' });
        
        // Get services by category
        const servicesByCategory = await collection.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get average price
        const averagePrice = await collection.aggregate([
            { $group: { _id: null, avgPrice: { $avg: '$price' } } }
        ]).toArray();
        
        // Get price range
        const priceRange = await collection.aggregate([
            { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalServices,
                activeServices,
                inactiveServices: totalServices - activeServices,
                servicesByCategory,
                averagePrice: averagePrice[0]?.avgPrice || 0,
                priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
            }
        });
    } catch (error) {
        console.error('Get service stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SERVICE_STATS_FAILED',
            message: 'Failed to retrieve service statistics'
        });
    }
});

module.exports = router;
