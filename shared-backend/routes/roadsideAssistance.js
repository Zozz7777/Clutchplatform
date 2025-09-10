const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all roadside assistance requests
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type, userId, startDate, endDate } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (status) filters.status = status;
        if (type) filters.type = type;
        if (userId) filters.userId = new ObjectId(userId);
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('roadside_assistance');
        const requests = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: requests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get roadside assistance error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ROADSIDE_ASSISTANCE_FAILED',
            message: 'Failed to retrieve roadside assistance requests'
        });
    }
});

// Get roadside assistance by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('roadside_assistance');
        const request = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'ROADSIDE_ASSISTANCE_NOT_FOUND',
                message: 'Roadside assistance request not found'
            });
        }

        res.json({
            success: true,
            data: request
        });
    } catch (error) {
        console.error('Get roadside assistance by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ROADSIDE_ASSISTANCE_BY_ID_FAILED',
            message: 'Failed to retrieve roadside assistance request'
        });
    }
});

// Create roadside assistance request
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            type,
            description,
            location,
            vehicleId,
            emergencyContact,
            estimatedArrival,
            notes
        } = req.body;
        
        if (!type || !location) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Type and location are required'
            });
        }

        // Verify vehicle exists if provided
        if (vehicleId) {
            const vehicleCollection = await getCollection('vehicles');
            const vehicle = await vehicleCollection.findOne({ _id: new ObjectId(vehicleId) });
            if (!vehicle) {
                return res.status(404).json({
                    success: false,
                    error: 'VEHICLE_NOT_FOUND',
                    message: 'Vehicle not found'
                });
            }
        }

        const requestData = {
            userId: new ObjectId(req.user.userId),
            type,
            description: description || '',
            location,
            vehicleId: vehicleId ? new ObjectId(vehicleId) : null,
            emergencyContact: emergencyContact || {},
            estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null,
            notes: notes || '',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('roadside_assistance');
        const result = await collection.insertOne(requestData);
        
        requestData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Roadside assistance request created successfully',
            data: requestData
        });
    } catch (error) {
        console.error('Create roadside assistance error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_ROADSIDE_ASSISTANCE_FAILED',
            message: 'Failed to create roadside assistance request'
        });
    }
});

// Update roadside assistance request
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        // Convert vehicleId to ObjectId if provided
        if (updateData.vehicleId) {
            updateData.vehicleId = new ObjectId(updateData.vehicleId);
        }

        // Convert estimatedArrival to Date if provided
        if (updateData.estimatedArrival) {
            updateData.estimatedArrival = new Date(updateData.estimatedArrival);
        }

        const collection = await getCollection('roadside_assistance');
        const request = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'ROADSIDE_ASSISTANCE_NOT_FOUND',
                message: 'Roadside assistance request not found'
            });
        }

        // Check if user owns this request or is admin
        if (request.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only update your own roadside assistance requests'
            });
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'ROADSIDE_ASSISTANCE_NOT_FOUND',
                message: 'Roadside assistance request not found'
            });
        }

        res.json({
            success: true,
            message: 'Roadside assistance request updated successfully'
        });
    } catch (error) {
        console.error('Update roadside assistance error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_ROADSIDE_ASSISTANCE_FAILED',
            message: 'Failed to update roadside assistance request'
        });
    }
});

// Update roadside assistance status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assignedMechanicId, estimatedArrival, actualArrival, completionNotes } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_STATUS',
                message: 'Status is required'
            });
        }

        const collection = await getCollection('roadside_assistance');
        const request = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'ROADSIDE_ASSISTANCE_NOT_FOUND',
                message: 'Roadside assistance request not found'
            });
        }

        const updateData = {
            status,
            updatedAt: new Date()
        };

        if (assignedMechanicId) {
            updateData.assignedMechanicId = new ObjectId(assignedMechanicId);
        }

        if (estimatedArrival) {
            updateData.estimatedArrival = new Date(estimatedArrival);
        }

        if (actualArrival) {
            updateData.actualArrival = new Date(actualArrival);
        }

        if (completionNotes) {
            updateData.completionNotes = completionNotes;
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        res.json({
            success: true,
            message: `Roadside assistance status updated to ${status}`
        });
    } catch (error) {
        console.error('Update roadside assistance status error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_ROADSIDE_ASSISTANCE_STATUS_FAILED',
            message: 'Failed to update roadside assistance status'
        });
    }
});

// Delete roadside assistance request
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('roadside_assistance');
        
        const request = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'ROADSIDE_ASSISTANCE_NOT_FOUND',
                message: 'Roadside assistance request not found'
            });
        }

        // Check if user owns this request or is admin
        if (request.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only delete your own roadside assistance requests'
            });
        }

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'ROADSIDE_ASSISTANCE_NOT_FOUND',
                message: 'Roadside assistance request not found'
            });
        }

        res.json({
            success: true,
            message: 'Roadside assistance request deleted successfully'
        });
    } catch (error) {
        console.error('Delete roadside assistance error:', error);
        res.status(500).json({
            success: false,
            error: 'DELETE_ROADSIDE_ASSISTANCE_FAILED',
            message: 'Failed to delete roadside assistance request'
        });
    }
});

// Get roadside assistance by user
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { userId: new ObjectId(userId) };
        if (status) filters.status = status;

        const collection = await getCollection('roadside_assistance');
        const requests = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: requests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get roadside assistance by user error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ROADSIDE_ASSISTANCE_BY_USER_FAILED',
            message: 'Failed to retrieve roadside assistance requests for user'
        });
    }
});

// Get roadside assistance by status
router.get('/status/:status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const collection = await getCollection('roadside_assistance');
        const requests = await collection.find({ status })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments({ status });

        res.json({
            success: true,
            data: requests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get roadside assistance by status error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ROADSIDE_ASSISTANCE_BY_STATUS_FAILED',
            message: 'Failed to retrieve roadside assistance requests by status'
        });
    }
});

// Get roadside assistance by type
router.get('/type/:type', authenticateToken, async (req, res) => {
    try {
        const { type } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { type };
        if (status) filters.status = status;

        const collection = await getCollection('roadside_assistance');
        const requests = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: requests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get roadside assistance by type error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ROADSIDE_ASSISTANCE_BY_TYPE_FAILED',
            message: 'Failed to retrieve roadside assistance requests by type'
        });
    }
});

// Get active roadside assistance requests
router.get('/active/list', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('roadside_assistance');
        const requests = await collection.find({
            status: { $in: ['pending', 'assigned', 'in_progress'] }
        })
        .sort({ createdAt: -1 })
        .toArray();

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Get active roadside assistance error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ACTIVE_ROADSIDE_ASSISTANCE_FAILED',
            message: 'Failed to retrieve active roadside assistance requests'
        });
    }
});

// Get roadside assistance statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('roadside_assistance');
        
        // Get total requests
        const totalRequests = await collection.countDocuments(filters);
        
        // Get requests by status
        const requestsByStatus = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get requests by type
        const requestsByType = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get completed requests
        const completedRequests = await collection.countDocuments({ 
            ...filters,
            status: 'completed'
        });

        // Get average response time
        const avgResponseTime = await collection.aggregate([
            { $match: { ...filters, actualArrival: { $exists: true } } },
            { 
                $group: { 
                    _id: null, 
                    avgTime: { 
                        $avg: { 
                            $subtract: ['$actualArrival', '$createdAt'] 
                        } 
                    } 
                } 
            }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalRequests,
                completedRequests,
                requestsByStatus,
                requestsByType,
                averageResponseTime: avgResponseTime[0]?.avgTime || 0
            }
        });
    } catch (error) {
        console.error('Get roadside assistance stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ROADSIDE_ASSISTANCE_STATS_FAILED',
            message: 'Failed to retrieve roadside assistance statistics'
        });
    }
});

module.exports = router;
