const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all next level features
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, type, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (type) filters.type = type;
        if (status) filters.status = status;

        const collection = await getCollection('next_level_features');
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
        console.error('Get next level features error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_NEXT_LEVEL_FEATURES_FAILED',
            message: 'Failed to retrieve next level features'
        });
    }
});

// Get next level feature by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('next_level_features');
        const feature = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!feature) {
            return res.status(404).json({
                success: false,
                error: 'NEXT_LEVEL_FEATURE_NOT_FOUND',
                message: 'Next level feature not found'
            });
        }

        res.json({
            success: true,
            data: feature
        });
    } catch (error) {
        console.error('Get next level feature error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_NEXT_LEVEL_FEATURE_FAILED',
            message: 'Failed to retrieve next level feature'
        });
    }
});

// Create next level feature
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            name, 
            description, 
            type, 
            configuration,
            isActive,
            requirements,
            dependencies 
        } = req.body;
        
        if (!name || !description || !type) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Name, description, and type are required'
            });
        }

        const featureData = {
            name,
            description,
            type,
            configuration: configuration || {},
            isActive: isActive || false,
            requirements: requirements || [],
            dependencies: dependencies || [],
            createdBy: req.user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('next_level_features');
        const result = await collection.insertOne(featureData);
        
        featureData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Next level feature created successfully',
            data: featureData
        });
    } catch (error) {
        console.error('Create next level feature error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_NEXT_LEVEL_FEATURE_FAILED',
            message: 'Failed to create next level feature'
        });
    }
});

// Update next level feature
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('next_level_features');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'NEXT_LEVEL_FEATURE_NOT_FOUND',
                message: 'Next level feature not found'
            });
        }

        res.json({
            success: true,
            message: 'Next level feature updated successfully'
        });
    } catch (error) {
        console.error('Update next level feature error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_NEXT_LEVEL_FEATURE_FAILED',
            message: 'Failed to update next level feature'
        });
    }
});

// Activate next level feature
router.patch('/:id/activate', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const collection = await getCollection('next_level_features');
        const feature = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!feature) {
            return res.status(404).json({
                success: false,
                error: 'NEXT_LEVEL_FEATURE_NOT_FOUND',
                message: 'Next level feature not found'
            });
        }

        // Check dependencies
        if (feature.dependencies && feature.dependencies.length > 0) {
            const dependencyCheck = await collection.find({
                _id: { $in: feature.dependencies.map(d => new ObjectId(d)) },
                isActive: true
            }).toArray();
            
            if (dependencyCheck.length !== feature.dependencies.length) {
                return res.status(400).json({
                    success: false,
                    error: 'DEPENDENCIES_NOT_MET',
                    message: 'All dependencies must be active before activating this feature'
                });
            }
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    isActive: true,
                    activatedAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: 'Next level feature activated successfully'
        });
    } catch (error) {
        console.error('Activate next level feature error:', error);
        res.status(500).json({
            success: false,
            error: 'ACTIVATE_NEXT_LEVEL_FEATURE_FAILED',
            message: 'Failed to activate next level feature'
        });
    }
});

// Deactivate next level feature
router.patch('/:id/deactivate', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const collection = await getCollection('next_level_features');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    isActive: false,
                    deactivatedAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'NEXT_LEVEL_FEATURE_NOT_FOUND',
                message: 'Next level feature not found'
            });
        }

        res.json({
            success: true,
            message: 'Next level feature deactivated successfully'
        });
    } catch (error) {
        console.error('Deactivate next level feature error:', error);
        res.status(500).json({
            success: false,
            error: 'DEACTIVATE_NEXT_LEVEL_FEATURE_FAILED',
            message: 'Failed to deactivate next level feature'
        });
    }
});

// Get next level features by type
router.get('/type/:type', authenticateToken, async (req, res) => {
    try {
        const { type } = req.params;
        const { status } = req.query;
        
        const filters = { type };
        if (status) filters.status = status;

        const collection = await getCollection('next_level_features');
        const features = await collection.find(filters)
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            data: features
        });
    } catch (error) {
        console.error('Get next level features by type error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_NEXT_LEVEL_FEATURES_BY_TYPE_FAILED',
            message: 'Failed to retrieve next level features by type'
        });
    }
});

// Get active next level features
router.get('/active/list', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('next_level_features');
        const features = await collection.find({ isActive: true })
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            data: features
        });
    } catch (error) {
        console.error('Get active next level features error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ACTIVE_NEXT_LEVEL_FEATURES_FAILED',
            message: 'Failed to retrieve active next level features'
        });
    }
});

// Get next level feature dependencies
router.get('/:id/dependencies', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const collection = await getCollection('next_level_features');
        const feature = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!feature) {
            return res.status(404).json({
                success: false,
                error: 'NEXT_LEVEL_FEATURE_NOT_FOUND',
                message: 'Next level feature not found'
            });
        }

        if (!feature.dependencies || feature.dependencies.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }

        const dependencies = await collection.find({
            _id: { $in: feature.dependencies.map(d => new ObjectId(d)) }
        }).toArray();

        res.json({
            success: true,
            data: dependencies
        });
    } catch (error) {
        console.error('Get next level feature dependencies error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_NEXT_LEVEL_FEATURE_DEPENDENCIES_FAILED',
            message: 'Failed to retrieve next level feature dependencies'
        });
    }
});

// Get next level features statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('next_level_features');
        
        // Get total features
        const totalFeatures = await collection.countDocuments({});
        
        // Get active features
        const activeFeatures = await collection.countDocuments({ isActive: true });
        
        // Get features by type
        const featuresByType = await collection.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get features by status
        const featuresByStatus = await collection.aggregate([
            { $group: { _id: '$isActive', count: { $sum: 1 } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalFeatures,
                activeFeatures,
                inactiveFeatures: totalFeatures - activeFeatures,
                featuresByType,
                featuresByStatus
            }
        });
    } catch (error) {
        console.error('Get next level features stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_NEXT_LEVEL_FEATURES_STATS_FAILED',
            message: 'Failed to retrieve next level features statistics'
        });
    }
});

module.exports = router;
