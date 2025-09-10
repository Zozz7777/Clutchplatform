const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all disputes
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

        const collection = await getCollection('disputes');
        const disputes = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: disputes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get disputes error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DISPUTES_FAILED',
            message: 'Failed to retrieve disputes'
        });
    }
});

// Get dispute by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('disputes');
        const dispute = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!dispute) {
            return res.status(404).json({
                success: false,
                error: 'DISPUTE_NOT_FOUND',
                message: 'Dispute not found'
            });
        }

        res.json({
            success: true,
            data: dispute
        });
    } catch (error) {
        console.error('Get dispute by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DISPUTE_BY_ID_FAILED',
            message: 'Failed to retrieve dispute'
        });
    }
});

// Create dispute
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            type,
            title,
            description,
            relatedBookingId,
            relatedPaymentId,
            amount,
            evidence,
            attachments
        } = req.body;
        
        if (!type || !title || !description) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Type, title, and description are required'
            });
        }

        // Verify related booking exists if provided
        if (relatedBookingId) {
            const bookingCollection = await getCollection('bookings');
            const booking = await bookingCollection.findOne({ _id: new ObjectId(relatedBookingId) });
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    error: 'BOOKING_NOT_FOUND',
                    message: 'Related booking not found'
                });
            }
        }

        // Verify related payment exists if provided
        if (relatedPaymentId) {
            const paymentCollection = await getCollection('payments');
            const payment = await paymentCollection.findOne({ _id: new ObjectId(relatedPaymentId) });
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    error: 'PAYMENT_NOT_FOUND',
                    message: 'Related payment not found'
                });
            }
        }

        const disputeData = {
            type,
            title,
            description,
            relatedBookingId: relatedBookingId ? new ObjectId(relatedBookingId) : null,
            relatedPaymentId: relatedPaymentId ? new ObjectId(relatedPaymentId) : null,
            amount: amount ? parseFloat(amount) : 0,
            evidence: evidence || '',
            attachments: attachments || [],
            userId: new ObjectId(req.user.userId),
            status: 'open',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('disputes');
        const result = await collection.insertOne(disputeData);
        
        disputeData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Dispute created successfully',
            data: disputeData
        });
    } catch (error) {
        console.error('Create dispute error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_DISPUTE_FAILED',
            message: 'Failed to create dispute'
        });
    }
});

// Update dispute
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        // Convert related IDs to ObjectId if provided
        if (updateData.relatedBookingId) {
            updateData.relatedBookingId = new ObjectId(updateData.relatedBookingId);
        }
        if (updateData.relatedPaymentId) {
            updateData.relatedPaymentId = new ObjectId(updateData.relatedPaymentId);
        }

        // Convert amount to float if provided
        if (updateData.amount) {
            updateData.amount = parseFloat(updateData.amount);
        }

        const collection = await getCollection('disputes');
        const dispute = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!dispute) {
            return res.status(404).json({
                success: false,
                error: 'DISPUTE_NOT_FOUND',
                message: 'Dispute not found'
            });
        }

        // Check if user owns this dispute or is admin
        if (dispute.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only update your own disputes'
            });
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'DISPUTE_NOT_FOUND',
                message: 'Dispute not found'
            });
        }

        res.json({
            success: true,
            message: 'Dispute updated successfully'
        });
    } catch (error) {
        console.error('Update dispute error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_DISPUTE_FAILED',
            message: 'Failed to update dispute'
        });
    }
});

// Update dispute status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolution, resolutionDate, notes } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_STATUS',
                message: 'Status is required'
            });
        }

        const collection = await getCollection('disputes');
        const dispute = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!dispute) {
            return res.status(404).json({
                success: false,
                error: 'DISPUTE_NOT_FOUND',
                message: 'Dispute not found'
            });
        }

        const updateData = {
            status,
            updatedAt: new Date()
        };

        if (resolution) {
            updateData.resolution = resolution;
        }

        if (status === 'resolved' && resolutionDate) {
            updateData.resolutionDate = new Date(resolutionDate);
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
            message: `Dispute status updated to ${status}`
        });
    } catch (error) {
        console.error('Update dispute status error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_DISPUTE_STATUS_FAILED',
            message: 'Failed to update dispute status'
        });
    }
});

// Add response to dispute
router.post('/:id/responses', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { message, attachments } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_MESSAGE',
                message: 'Message is required'
            });
        }

        const collection = await getCollection('disputes');
        const dispute = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!dispute) {
            return res.status(404).json({
                success: false,
                error: 'DISPUTE_NOT_FOUND',
                message: 'Dispute not found'
            });
        }

        const response = {
            id: new ObjectId(),
            userId: new ObjectId(req.user.userId),
            message,
            attachments: attachments || [],
            createdAt: new Date()
        };

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $push: { responses: response },
                $set: { updatedAt: new Date() }
            }
        );

        res.json({
            success: true,
            message: 'Response added successfully',
            data: response
        });
    } catch (error) {
        console.error('Add dispute response error:', error);
        res.status(500).json({
            success: false,
            error: 'ADD_DISPUTE_RESPONSE_FAILED',
            message: 'Failed to add dispute response'
        });
    }
});

// Delete dispute
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('disputes');
        
        const dispute = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!dispute) {
            return res.status(404).json({
                success: false,
                error: 'DISPUTE_NOT_FOUND',
                message: 'Dispute not found'
            });
        }

        // Check if user owns this dispute or is admin
        if (dispute.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only delete your own disputes'
            });
        }

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'DISPUTE_NOT_FOUND',
                message: 'Dispute not found'
            });
        }

        res.json({
            success: true,
            message: 'Dispute deleted successfully'
        });
    } catch (error) {
        console.error('Delete dispute error:', error);
        res.status(500).json({
            success: false,
            error: 'DELETE_DISPUTE_FAILED',
            message: 'Failed to delete dispute'
        });
    }
});

// Get disputes by user
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status, type } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { userId: new ObjectId(userId) };
        if (status) filters.status = status;
        if (type) filters.type = type;

        const collection = await getCollection('disputes');
        const disputes = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: disputes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get disputes by user error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DISPUTES_BY_USER_FAILED',
            message: 'Failed to retrieve disputes for user'
        });
    }
});

// Get disputes by status
router.get('/status/:status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.params;
        const { page = 1, limit = 10, type } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { status };
        if (type) filters.type = type;

        const collection = await getCollection('disputes');
        const disputes = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: disputes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get disputes by status error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DISPUTES_BY_STATUS_FAILED',
            message: 'Failed to retrieve disputes by status'
        });
    }
});

// Get disputes by type
router.get('/type/:type', authenticateToken, async (req, res) => {
    try {
        const { type } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { type };
        if (status) filters.status = status;

        const collection = await getCollection('disputes');
        const disputes = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: disputes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get disputes by type error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DISPUTES_BY_TYPE_FAILED',
            message: 'Failed to retrieve disputes by type'
        });
    }
});

// Get open disputes
router.get('/open/list', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('disputes');
        const disputes = await collection.find({
            status: { $in: ['open', 'under_review'] }
        })
        .sort({ createdAt: 1 })
        .toArray();

        res.json({
            success: true,
            data: disputes
        });
    } catch (error) {
        console.error('Get open disputes error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_OPEN_DISPUTES_FAILED',
            message: 'Failed to retrieve open disputes'
        });
    }
});

// Get disputes statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('disputes');
        
        // Get total disputes
        const totalDisputes = await collection.countDocuments(filters);
        
        // Get disputes by status
        const disputesByStatus = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get disputes by type
        const disputesByType = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get resolved disputes
        const resolvedDisputes = await collection.countDocuments({ 
            ...filters,
            status: 'resolved'
        });

        // Get total amount in disputes
        const totalAmount = await collection.aggregate([
            { $match: filters },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalDisputes,
                resolvedDisputes,
                disputesByStatus,
                disputesByType,
                totalAmount: totalAmount[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Get disputes stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DISPUTES_STATS_FAILED',
            message: 'Failed to retrieve disputes statistics'
        });
    }
});

module.exports = router;
