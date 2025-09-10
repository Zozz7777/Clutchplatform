const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all trade-in requests
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, vehicleId, userId, startDate, endDate } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (status) filters.status = status;
        if (vehicleId) filters.vehicleId = new ObjectId(vehicleId);
        if (userId) filters.userId = new ObjectId(userId);
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('trade_ins');
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
        console.error('Get trade-in requests error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_TRADE_IN_REQUESTS_FAILED',
            message: 'Failed to retrieve trade-in requests'
        });
    }
});

// Get trade-in request by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('trade_ins');
        const request = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'TRADE_IN_REQUEST_NOT_FOUND',
                message: 'Trade-in request not found'
            });
        }

        res.json({
            success: true,
            data: request
        });
    } catch (error) {
        console.error('Get trade-in request by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_TRADE_IN_REQUEST_BY_ID_FAILED',
            message: 'Failed to retrieve trade-in request'
        });
    }
});

// Create trade-in request
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            vehicleId,
            currentVehicleInfo,
            desiredVehicleInfo,
            estimatedValue,
            additionalServices,
            notes,
            attachments
        } = req.body;
        
        if (!vehicleId || !currentVehicleInfo || !desiredVehicleInfo) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Vehicle ID, current vehicle info, and desired vehicle info are required'
            });
        }

        // Verify vehicle exists
        const vehicleCollection = await getCollection('vehicles');
        const vehicle = await vehicleCollection.findOne({ _id: new ObjectId(vehicleId) });
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'VEHICLE_NOT_FOUND',
                message: 'Vehicle not found'
            });
        }

        const requestData = {
            vehicleId: new ObjectId(vehicleId),
            userId: new ObjectId(req.user.userId),
            currentVehicleInfo,
            desiredVehicleInfo,
            estimatedValue: estimatedValue ? parseFloat(estimatedValue) : 0,
            additionalServices: additionalServices || [],
            notes: notes || '',
            attachments: attachments || [],
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('trade_ins');
        const result = await collection.insertOne(requestData);
        
        requestData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Trade-in request created successfully',
            data: requestData
        });
    } catch (error) {
        console.error('Create trade-in request error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_TRADE_IN_REQUEST_FAILED',
            message: 'Failed to create trade-in request'
        });
    }
});

// Update trade-in request
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

        // Convert estimatedValue to float if provided
        if (updateData.estimatedValue) {
            updateData.estimatedValue = parseFloat(updateData.estimatedValue);
        }

        const collection = await getCollection('trade_ins');
        const request = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'TRADE_IN_REQUEST_NOT_FOUND',
                message: 'Trade-in request not found'
            });
        }

        // Check if user owns this request or is admin
        if (request.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only update your own trade-in requests'
            });
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'TRADE_IN_REQUEST_NOT_FOUND',
                message: 'Trade-in request not found'
            });
        }

        res.json({
            success: true,
            message: 'Trade-in request updated successfully'
        });
    } catch (error) {
        console.error('Update trade-in request error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_TRADE_IN_REQUEST_FAILED',
            message: 'Failed to update trade-in request'
        });
    }
});

// Update trade-in request status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, finalValue, completionDate, notes } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_STATUS',
                message: 'Status is required'
            });
        }

        const collection = await getCollection('trade_ins');
        const request = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'TRADE_IN_REQUEST_NOT_FOUND',
                message: 'Trade-in request not found'
            });
        }

        const updateData = {
            status,
            updatedAt: new Date()
        };

        if (finalValue !== undefined) {
            updateData.finalValue = parseFloat(finalValue);
        }

        if (status === 'completed' && completionDate) {
            updateData.completionDate = new Date(completionDate);
        }

        if (notes) {
            updateData.notes = notes;
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        res.json({
            success: true,
            message: `Trade-in request status updated to ${status}`
        });
    } catch (error) {
        console.error('Update trade-in request status error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_TRADE_IN_REQUEST_STATUS_FAILED',
            message: 'Failed to update trade-in request status'
        });
    }
});

// Delete trade-in request
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('trade_ins');
        
        const request = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'TRADE_IN_REQUEST_NOT_FOUND',
                message: 'Trade-in request not found'
            });
        }

        // Check if user owns this request or is admin
        if (request.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only delete your own trade-in requests'
            });
        }

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'TRADE_IN_REQUEST_NOT_FOUND',
                message: 'Trade-in request not found'
            });
        }

        res.json({
            success: true,
            message: 'Trade-in request deleted successfully'
        });
    } catch (error) {
        console.error('Delete trade-in request error:', error);
        res.status(500).json({
            success: false,
            error: 'DELETE_TRADE_IN_REQUEST_FAILED',
            message: 'Failed to delete trade-in request'
        });
    }
});

// Get trade-in requests by user
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { userId: new ObjectId(userId) };
        if (status) filters.status = status;

        const collection = await getCollection('trade_ins');
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
        console.error('Get trade-in requests by user error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_TRADE_IN_REQUESTS_BY_USER_FAILED',
            message: 'Failed to retrieve trade-in requests for user'
        });
    }
});

// Get trade-in requests by vehicle
router.get('/vehicle/:vehicleId', authenticateToken, async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { vehicleId: new ObjectId(vehicleId) };
        if (status) filters.status = status;

        const collection = await getCollection('trade_ins');
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
        console.error('Get trade-in requests by vehicle error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_TRADE_IN_REQUESTS_BY_VEHICLE_FAILED',
            message: 'Failed to retrieve trade-in requests for vehicle'
        });
    }
});

// Get trade-in requests by status
router.get('/status/:status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const collection = await getCollection('trade_ins');
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
        console.error('Get trade-in requests by status error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_TRADE_IN_REQUESTS_BY_STATUS_FAILED',
            message: 'Failed to retrieve trade-in requests by status'
        });
    }
});

// Get pending trade-in requests
router.get('/pending/list', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('trade_ins');
        const requests = await collection.find({
            status: { $in: ['pending', 'under_review'] }
        })
        .sort({ createdAt: 1 })
        .toArray();

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Get pending trade-in requests error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PENDING_TRADE_IN_REQUESTS_FAILED',
            message: 'Failed to retrieve pending trade-in requests'
        });
    }
});

// Get trade-in requests statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('trade_ins');
        
        // Get total requests
        const totalRequests = await collection.countDocuments(filters);
        
        // Get requests by status
        const requestsByStatus = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get completed requests
        const completedRequests = await collection.countDocuments({ 
            ...filters,
            status: 'completed'
        });

        // Get total estimated value
        const totalEstimatedValue = await collection.aggregate([
            { $match: filters },
            { $group: { _id: null, total: { $sum: '$estimatedValue' } } }
        ]).toArray();

        // Get total final value
        const totalFinalValue = await collection.aggregate([
            { $match: { ...filters, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$finalValue' } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalRequests,
                completedRequests,
                requestsByStatus,
                totalEstimatedValue: totalEstimatedValue[0]?.total || 0,
                totalFinalValue: totalFinalValue[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Get trade-in requests stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_TRADE_IN_REQUESTS_STATS_FAILED',
            message: 'Failed to retrieve trade-in requests statistics'
        });
    }
});

module.exports = router;
