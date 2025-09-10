const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all earnings records
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, userId, type, status, startDate, endDate } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (userId) filters.userId = new ObjectId(userId);
        if (type) filters.type = type;
        if (status) filters.status = status;
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('earnings');
        const earnings = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: earnings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get earnings error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_EARNINGS_FAILED',
            message: 'Failed to retrieve earnings records'
        });
    }
});

// Get earnings record by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('earnings');
        const earning = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!earning) {
            return res.status(404).json({
                success: false,
                error: 'EARNINGS_RECORD_NOT_FOUND',
                message: 'Earnings record not found'
            });
        }

        res.json({
            success: true,
            data: earning
        });
    } catch (error) {
        console.error('Get earnings record by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_EARNINGS_RECORD_BY_ID_FAILED',
            message: 'Failed to retrieve earnings record'
        });
    }
});

// Create earnings record
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            userId,
            type,
            amount,
            bookingId,
            paymentId,
            description,
            notes,
            attachments
        } = req.body;
        
        if (!userId || !type || !amount) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'User ID, type, and amount are required'
            });
        }

        // Verify user exists
        const userCollection = await getCollection('users');
        const user = await userCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'USER_NOT_FOUND',
                message: 'User not found'
            });
        }

        // Verify booking exists if provided
        if (bookingId) {
            const bookingCollection = await getCollection('bookings');
            const booking = await bookingCollection.findOne({ _id: new ObjectId(bookingId) });
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    error: 'BOOKING_NOT_FOUND',
                    message: 'Related booking not found'
                });
            }
        }

        // Verify payment exists if provided
        if (paymentId) {
            const paymentCollection = await getCollection('payments');
            const payment = await paymentCollection.findOne({ _id: new ObjectId(paymentId) });
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    error: 'PAYMENT_NOT_FOUND',
                    message: 'Related payment not found'
                });
            }
        }

        const earningData = {
            userId: new ObjectId(userId),
            type,
            amount: parseFloat(amount),
            bookingId: bookingId ? new ObjectId(bookingId) : null,
            paymentId: paymentId ? new ObjectId(paymentId) : null,
            description: description || '',
            notes: notes || '',
            attachments: attachments || [],
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('earnings');
        const result = await collection.insertOne(earningData);
        
        earningData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Earnings record created successfully',
            data: earningData
        });
    } catch (error) {
        console.error('Create earnings record error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_EARNINGS_RECORD_FAILED',
            message: 'Failed to create earnings record'
        });
    }
});

// Update earnings record
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        // Convert IDs to ObjectId if provided
        if (updateData.userId) {
            updateData.userId = new ObjectId(updateData.userId);
        }
        if (updateData.bookingId) {
            updateData.bookingId = new ObjectId(updateData.bookingId);
        }
        if (updateData.paymentId) {
            updateData.paymentId = new ObjectId(updateData.paymentId);
        }

        // Convert amount to float if provided
        if (updateData.amount) {
            updateData.amount = parseFloat(updateData.amount);
        }

        const collection = await getCollection('earnings');
        const earning = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!earning) {
            return res.status(404).json({
                success: false,
                error: 'EARNINGS_RECORD_NOT_FOUND',
                message: 'Earnings record not found'
            });
        }

        // Check if user owns this record or is admin
        if (earning.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only update your own earnings records'
            });
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'EARNINGS_RECORD_NOT_FOUND',
                message: 'Earnings record not found'
            });
        }

        res.json({
            success: true,
            message: 'Earnings record updated successfully'
        });
    } catch (error) {
        console.error('Update earnings record error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_EARNINGS_RECORD_FAILED',
            message: 'Failed to update earnings record'
        });
    }
});

// Update earnings record status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, processedDate, notes } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_STATUS',
                message: 'Status is required'
            });
        }

        const collection = await getCollection('earnings');
        const earning = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!earning) {
            return res.status(404).json({
                success: false,
                error: 'EARNINGS_RECORD_NOT_FOUND',
                message: 'Earnings record not found'
            });
        }

        const updateData = {
            status,
            updatedAt: new Date()
        };

        if (status === 'processed' && processedDate) {
            updateData.processedDate = new Date(processedDate);
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
            message: `Earnings record status updated to ${status}`
        });
    } catch (error) {
        console.error('Update earnings record status error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_EARNINGS_RECORD_STATUS_FAILED',
            message: 'Failed to update earnings record status'
        });
    }
});

// Delete earnings record
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('earnings');
        
        const earning = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!earning) {
            return res.status(404).json({
                success: false,
                error: 'EARNINGS_RECORD_NOT_FOUND',
                message: 'Earnings record not found'
            });
        }

        // Check if user owns this record or is admin
        if (earning.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only delete your own earnings records'
            });
        }

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'EARNINGS_RECORD_NOT_FOUND',
                message: 'Earnings record not found'
            });
        }

        res.json({
            success: true,
            message: 'Earnings record deleted successfully'
        });
    } catch (error) {
        console.error('Delete earnings record error:', error);
        res.status(500).json({
            success: false,
            error: 'DELETE_EARNINGS_RECORD_FAILED',
            message: 'Failed to delete earnings record'
        });
    }
});

// Get earnings by user
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, type, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { userId: new ObjectId(userId) };
        if (type) filters.type = type;
        if (status) filters.status = status;

        const collection = await getCollection('earnings');
        const earnings = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: earnings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get earnings by user error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_EARNINGS_BY_USER_FAILED',
            message: 'Failed to retrieve earnings for user'
        });
    }
});

// Get earnings by type
router.get('/type/:type', authenticateToken, async (req, res) => {
    try {
        const { type } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { type };
        if (status) filters.status = status;

        const collection = await getCollection('earnings');
        const earnings = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: earnings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get earnings by type error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_EARNINGS_BY_TYPE_FAILED',
            message: 'Failed to retrieve earnings by type'
        });
    }
});

// Get earnings by status
router.get('/status/:status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.params;
        const { page = 1, limit = 10, type } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { status };
        if (type) filters.type = type;

        const collection = await getCollection('earnings');
        const earnings = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: earnings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get earnings by status error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_EARNINGS_BY_STATUS_FAILED',
            message: 'Failed to retrieve earnings by status'
        });
    }
});

// Get pending earnings
router.get('/pending/list', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('earnings');
        const earnings = await collection.find({
            status: { $in: ['pending', 'processing'] }
        })
        .sort({ createdAt: 1 })
        .toArray();

        res.json({
            success: true,
            data: earnings
        });
    } catch (error) {
        console.error('Get pending earnings error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PENDING_EARNINGS_FAILED',
            message: 'Failed to retrieve pending earnings'
        });
    }
});

// Get earnings statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;
        
        const filters = {};
        if (userId) filters.userId = new ObjectId(userId);
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('earnings');
        
        // Get total earnings
        const totalEarnings = await collection.countDocuments(filters);
        
        // Get earnings by status
        const earningsByStatus = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get earnings by type
        const earningsByType = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get processed earnings
        const processedEarnings = await collection.countDocuments({ 
            ...filters,
            status: 'processed'
        });

        // Get total amount
        const totalAmount = await collection.aggregate([
            { $match: filters },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).toArray();

        // Get processed amount
        const processedAmount = await collection.aggregate([
            { $match: { ...filters, status: 'processed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalEarnings,
                processedEarnings,
                earningsByStatus,
                earningsByType,
                totalAmount: totalAmount[0]?.total || 0,
                processedAmount: processedAmount[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Get earnings stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_EARNINGS_STATS_FAILED',
            message: 'Failed to retrieve earnings statistics'
        });
    }
});

module.exports = router;
