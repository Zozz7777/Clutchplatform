const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all advanced features
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (category) filters.category = category;
        if (status) filters.status = status;

        const collection = await getCollection('advanced_features');
        const features = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: features,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get advanced features error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ADVANCED_FEATURES_FAILED',
            message: 'Failed to retrieve advanced features'
        });
    }
});

// Get advanced feature by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('advanced_features');
        const feature = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!feature) {
            return res.status(404).json({
                success: false,
                error: 'ADVANCED_FEATURE_NOT_FOUND',
                message: 'Advanced feature not found'
            });
        }

        res.json({
            success: true,
            data: feature
        });
    } catch (error) {
        console.error('Get advanced feature error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ADVANCED_FEATURE_FAILED',
            message: 'Failed to retrieve advanced feature'
        });
    }
});

// Create advanced feature
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            name, 
            description, 
            category, 
            configuration,
            isEnabled,
            priority 
        } = req.body;
        
        if (!name || !description || !category) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Name, description, and category are required'
            });
        }

        const featureData = {
            name,
            description,
            category,
            configuration: configuration || {},
            isEnabled: isEnabled || false,
            priority: priority || 0,
            createdBy: req.user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('advanced_features');
        const result = await collection.insertOne(featureData);
        
        featureData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Advanced feature created successfully',
            data: featureData
        });
    } catch (error) {
        console.error('Create advanced feature error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_ADVANCED_FEATURE_FAILED',
            message: 'Failed to create advanced feature'
        });
    }
});

// Update advanced feature
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('advanced_features');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'ADVANCED_FEATURE_NOT_FOUND',
                message: 'Advanced feature not found'
            });
        }

        res.json({
            success: true,
            message: 'Advanced feature updated successfully'
        });
    } catch (error) {
        console.error('Update advanced feature error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_ADVANCED_FEATURE_FAILED',
            message: 'Failed to update advanced feature'
        });
    }
});

// Toggle advanced feature
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { isEnabled } = req.body;
        
        if (typeof isEnabled !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'INVALID_ENABLED_STATUS',
                message: 'isEnabled must be a boolean value'
            });
        }

        const collection = await getCollection('advanced_features');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    isEnabled,
                    updatedAt: new Date()
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'ADVANCED_FEATURE_NOT_FOUND',
                message: 'Advanced feature not found'
            });
        }

        res.json({
            success: true,
            message: `Advanced feature ${isEnabled ? 'enabled' : 'disabled'} successfully`
        });
    } catch (error) {
        console.error('Toggle advanced feature error:', error);
        res.status(500).json({
            success: false,
            error: 'TOGGLE_ADVANCED_FEATURE_FAILED',
            message: 'Failed to toggle advanced feature'
        });
    }
});

// Get advanced features by category
router.get('/category/:category', authenticateToken, async (req, res) => {
    try {
        const { category } = req.params;
        const { status } = req.query;
        
        const filters = { category };
        if (status) filters.status = status;

        const collection = await getCollection('advanced_features');
        const features = await collection.find(filters)
            .sort({ priority: -1, createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            data: features
        });
    } catch (error) {
        console.error('Get advanced features by category error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ADVANCED_FEATURES_BY_CATEGORY_FAILED',
            message: 'Failed to retrieve advanced features by category'
        });
    }
});

// Get enabled advanced features
router.get('/enabled/list', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('advanced_features');
        const features = await collection.find({ isEnabled: true })
            .sort({ priority: -1, createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            data: features
        });
    } catch (error) {
        console.error('Get enabled advanced features error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ENABLED_ADVANCED_FEATURES_FAILED',
            message: 'Failed to retrieve enabled advanced features'
        });
    }
});

// Get advanced features statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('advanced_features');
        
        // Get total features
        const totalFeatures = await collection.countDocuments({});
        
        // Get enabled features
        const enabledFeatures = await collection.countDocuments({ isEnabled: true });
        
        // Get features by category
        const featuresByCategory = await collection.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get features by priority
        const featuresByPriority = await collection.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalFeatures,
                enabledFeatures,
                disabledFeatures: totalFeatures - enabledFeatures,
                featuresByCategory,
                featuresByPriority
            }
        });
    } catch (error) {
        console.error('Get advanced features stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ADVANCED_FEATURES_STATS_FAILED',
            message: 'Failed to retrieve advanced features statistics'
        });
    }
});

// Bulk update advanced features
router.patch('/bulk-update', authenticateToken, async (req, res) => {
    try {
        const { features } = req.body;
        
        if (!Array.isArray(features) || features.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_FEATURES_ARRAY',
                message: 'Features array is required and must not be empty'
            });
        }

        const collection = await getCollection('advanced_features');
        const bulkOps = features.map(feature => ({
            updateOne: {
                filter: { _id: new ObjectId(feature.id) },
                update: {
                    $set: {
                        ...feature.updates,
                        updatedAt: new Date()
                    }
                }
            }
        }));

        const result = await collection.bulkWrite(bulkOps);

        res.json({
            success: true,
            message: 'Advanced features updated successfully',
            data: {
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('Bulk update advanced features error:', error);
        res.status(500).json({
            success: false,
            error: 'BULK_UPDATE_ADVANCED_FEATURES_FAILED',
            message: 'Failed to bulk update advanced features'
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
