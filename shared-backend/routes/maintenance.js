const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all maintenance records
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type, vehicleId, userId, startDate, endDate } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (status) filters.status = status;
        if (type) filters.type = type;
        if (vehicleId) filters.vehicleId = new ObjectId(vehicleId);
        if (userId) filters.userId = new ObjectId(userId);
        if (startDate || endDate) {
            filters.scheduledDate = {};
            if (startDate) filters.scheduledDate.$gte = new Date(startDate);
            if (endDate) filters.scheduledDate.$lte = new Date(endDate);
        }

        const collection = await getCollection('maintenance');
        const maintenance = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ scheduledDate: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: maintenance,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get maintenance error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_MAINTENANCE_FAILED',
            message: 'Failed to retrieve maintenance records'
        });
    }
});

// Get maintenance by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('maintenance');
        const maintenance = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!maintenance) {
            return res.status(404).json({
                success: false,
                error: 'MAINTENANCE_NOT_FOUND',
                message: 'Maintenance record not found'
            });
        }

        res.json({
            success: true,
            data: maintenance
        });
    } catch (error) {
        console.error('Get maintenance by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_MAINTENANCE_BY_ID_FAILED',
            message: 'Failed to retrieve maintenance record'
        });
    }
});

// Create maintenance record
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            vehicleId,
            type,
            description,
            scheduledDate,
            estimatedCost,
            priority,
            notes,
            attachments
        } = req.body;
        
        if (!vehicleId || !type || !scheduledDate) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Vehicle ID, type, and scheduled date are required'
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

        const maintenanceData = {
            vehicleId: new ObjectId(vehicleId),
            userId: new ObjectId(req.user.userId),
            type,
            description: description || '',
            scheduledDate: new Date(scheduledDate),
            estimatedCost: estimatedCost || 0,
            priority: priority || 'medium',
            notes: notes || '',
            attachments: attachments || [],
            status: 'scheduled',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('maintenance');
        const result = await collection.insertOne(maintenanceData);
        
        maintenanceData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Maintenance record created successfully',
            data: maintenanceData
        });
    } catch (error) {
        console.error('Create maintenance error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_MAINTENANCE_FAILED',
            message: 'Failed to create maintenance record'
        });
    }
});

// Update maintenance record
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

        // Convert scheduledDate to Date if provided
        if (updateData.scheduledDate) {
            updateData.scheduledDate = new Date(updateData.scheduledDate);
        }

        const collection = await getCollection('maintenance');
        const maintenance = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!maintenance) {
            return res.status(404).json({
                success: false,
                error: 'MAINTENANCE_NOT_FOUND',
                message: 'Maintenance record not found'
            });
        }

        // Check if user owns this maintenance record or is admin
        if (maintenance.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only update your own maintenance records'
            });
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'MAINTENANCE_NOT_FOUND',
                message: 'Maintenance record not found'
            });
        }

        res.json({
            success: true,
            message: 'Maintenance record updated successfully'
        });
    } catch (error) {
        console.error('Update maintenance error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_MAINTENANCE_FAILED',
            message: 'Failed to update maintenance record'
        });
    }
});

// Update maintenance status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, completedDate, actualCost, notes } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_STATUS',
                message: 'Status is required'
            });
        }

        const collection = await getCollection('maintenance');
        const maintenance = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!maintenance) {
            return res.status(404).json({
                success: false,
                error: 'MAINTENANCE_NOT_FOUND',
                message: 'Maintenance record not found'
            });
        }

        const updateData = {
            status,
            updatedAt: new Date()
        };

        if (status === 'completed' && completedDate) {
            updateData.completedDate = new Date(completedDate);
        }

        if (actualCost !== undefined) {
            updateData.actualCost = actualCost;
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
            message: `Maintenance status updated to ${status}`
        });
    } catch (error) {
        console.error('Update maintenance status error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_MAINTENANCE_STATUS_FAILED',
            message: 'Failed to update maintenance status'
        });
    }
});

// Delete maintenance record
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('maintenance');
        
        const maintenance = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!maintenance) {
            return res.status(404).json({
                success: false,
                error: 'MAINTENANCE_NOT_FOUND',
                message: 'Maintenance record not found'
            });
        }

        // Check if user owns this maintenance record or is admin
        if (maintenance.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only delete your own maintenance records'
            });
        }

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'MAINTENANCE_NOT_FOUND',
                message: 'Maintenance record not found'
            });
        }

        res.json({
            success: true,
            message: 'Maintenance record deleted successfully'
        });
    } catch (error) {
        console.error('Delete maintenance error:', error);
        res.status(500).json({
            success: false,
            error: 'DELETE_MAINTENANCE_FAILED',
            message: 'Failed to delete maintenance record'
        });
    }
});

// Get maintenance by vehicle
router.get('/vehicle/:vehicleId', authenticateToken, async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { vehicleId: new ObjectId(vehicleId) };
        if (status) filters.status = status;

        const collection = await getCollection('maintenance');
        const maintenance = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ scheduledDate: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: maintenance,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get maintenance by vehicle error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_MAINTENANCE_BY_VEHICLE_FAILED',
            message: 'Failed to retrieve maintenance records for vehicle'
        });
    }
});

// Get maintenance by user
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { userId: new ObjectId(userId) };
        if (status) filters.status = status;

        const collection = await getCollection('maintenance');
        const maintenance = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ scheduledDate: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: maintenance,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get maintenance by user error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_MAINTENANCE_BY_USER_FAILED',
            message: 'Failed to retrieve maintenance records for user'
        });
    }
});

// Get maintenance by status
router.get('/status/:status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const collection = await getCollection('maintenance');
        const maintenance = await collection.find({ status })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ scheduledDate: -1 })
            .toArray();
        
        const total = await collection.countDocuments({ status });

        res.json({
            success: true,
            data: maintenance,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get maintenance by status error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_MAINTENANCE_BY_STATUS_FAILED',
            message: 'Failed to retrieve maintenance records by status'
        });
    }
});

// Get upcoming maintenance
router.get('/upcoming/list', authenticateToken, async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + parseInt(days));

        const collection = await getCollection('maintenance');
        const maintenance = await collection.find({
            status: 'scheduled',
            scheduledDate: { $lte: futureDate }
        })
        .sort({ scheduledDate: 1 })
        .toArray();

        res.json({
            success: true,
            data: maintenance
        });
    } catch (error) {
        console.error('Get upcoming maintenance error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_UPCOMING_MAINTENANCE_FAILED',
            message: 'Failed to retrieve upcoming maintenance'
        });
    }
});

// Get maintenance statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.scheduledDate = {};
            if (startDate) filters.scheduledDate.$gte = new Date(startDate);
            if (endDate) filters.scheduledDate.$lte = new Date(endDate);
        }

        const collection = await getCollection('maintenance');
        
        // Get total maintenance records
        const totalMaintenance = await collection.countDocuments(filters);
        
        // Get maintenance by status
        const maintenanceByStatus = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get maintenance by type
        const maintenanceByType = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get completed maintenance
        const completedMaintenance = await collection.countDocuments({ 
            ...filters,
            status: 'completed'
        });

        // Get total estimated cost
        const totalEstimatedCost = await collection.aggregate([
            { $match: filters },
            { $group: { _id: null, total: { $sum: '$estimatedCost' } } }
        ]).toArray();

        // Get total actual cost
        const totalActualCost = await collection.aggregate([
            { $match: { ...filters, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$actualCost' } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalMaintenance,
                completedMaintenance,
                maintenanceByStatus,
                maintenanceByType,
                totalEstimatedCost: totalEstimatedCost[0]?.total || 0,
                totalActualCost: totalActualCost[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Get maintenance stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_MAINTENANCE_STATS_FAILED',
            message: 'Failed to retrieve maintenance statistics'
        });
    }
});

module.exports = router;
