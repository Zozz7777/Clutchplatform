const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all payouts
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, recipientId, startDate, endDate } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (status) filters.status = status;
        if (recipientId) filters.recipientId = new ObjectId(recipientId);
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('payouts');
        const payouts = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: payouts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get payouts error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PAYOUTS_FAILED',
            message: 'Failed to retrieve payouts'
        });
    }
});

// Get payout by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('payouts');
        const payout = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!payout) {
            return res.status(404).json({
                success: false,
                error: 'PAYOUT_NOT_FOUND',
                message: 'Payout not found'
            });
        }

        res.json({
            success: true,
            data: payout
        });
    } catch (error) {
        console.error('Get payout error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PAYOUT_FAILED',
            message: 'Failed to retrieve payout'
        });
    }
});

// Create payout
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            recipientId, 
            amount, 
            currency,
            paymentMethod,
            bankDetails,
            description,
            scheduledDate 
        } = req.body;
        
        if (!recipientId || !amount || !paymentMethod) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Recipient ID, amount, and payment method are required'
            });
        }

        // Generate payout reference
        const payoutReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const payoutData = {
            payoutReference,
            recipientId: new ObjectId(recipientId),
            amount: parseFloat(amount),
            currency: currency || 'USD',
            paymentMethod,
            bankDetails: bankDetails || {},
            description: description || '',
            scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
            status: 'pending',
            createdBy: req.user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('payouts');
        const result = await collection.insertOne(payoutData);
        
        payoutData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Payout created successfully',
            data: payoutData
        });
    } catch (error) {
        console.error('Create payout error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_PAYOUT_FAILED',
            message: 'Failed to create payout'
        });
    }
});

// Update payout
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('payouts');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'PAYOUT_NOT_FOUND',
                message: 'Payout not found'
            });
        }

        res.json({
            success: true,
            message: 'Payout updated successfully'
        });
    } catch (error) {
        console.error('Update payout error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_PAYOUT_FAILED',
            message: 'Failed to update payout'
        });
    }
});

// Update payout status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, transactionId } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_STATUS',
                message: 'Status is required'
            });
        }

        const updateData = {
            status,
            updatedAt: new Date()
        };

        if (status === 'completed') {
            updateData.completedAt = new Date();
            updateData.transactionId = transactionId;
        } else if (status === 'failed') {
            updateData.failedAt = new Date();
            updateData.failureReason = notes;
        } else if (status === 'processing') {
            updateData.processingAt = new Date();
        }

        if (notes) {
            updateData.notes = notes;
        }

        const collection = await getCollection('payouts');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'PAYOUT_NOT_FOUND',
                message: 'Payout not found'
            });
        }

        res.json({
            success: true,
            message: `Payout status updated to ${status}`
        });
    } catch (error) {
        console.error('Update payout status error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_PAYOUT_STATUS_FAILED',
            message: 'Failed to update payout status'
        });
    }
});

// Get recipient payouts
router.get('/recipient/:recipientId', authenticateToken, async (req, res) => {
    try {
        const { recipientId } = req.params;
        const { status, startDate, endDate } = req.query;
        
        const filters = { recipientId: new ObjectId(recipientId) };
        if (status) filters.status = status;
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('payouts');
        const payouts = await collection.find(filters)
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            data: payouts
        });
    } catch (error) {
        console.error('Get recipient payouts error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_RECIPIENT_PAYOUTS_FAILED',
            message: 'Failed to retrieve recipient payouts'
        });
    }
});

// Get pending payouts
router.get('/pending/list', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const collection = await getCollection('payouts');
        const pendingPayouts = await collection.find({ 
            status: 'pending',
            scheduledDate: { $lte: new Date() }
        })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ scheduledDate: 1 })
        .toArray();
        
        const total = await collection.countDocuments({ 
            status: 'pending',
            scheduledDate: { $lte: new Date() }
        });

        res.json({
            success: true,
            data: pendingPayouts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get pending payouts error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PENDING_PAYOUTS_FAILED',
            message: 'Failed to retrieve pending payouts'
        });
    }
});

// Process payout
router.post('/:id/process', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { transactionId } = req.body;
        
        const collection = await getCollection('payouts');
        const payout = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!payout) {
            return res.status(404).json({
                success: false,
                error: 'PAYOUT_NOT_FOUND',
                message: 'Payout not found'
            });
        }

        if (payout.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'INVALID_PAYOUT_STATUS',
                message: 'Payout is not in pending status'
            });
        }

        // TODO: Integrate with actual payment processor
        // For now, simulate processing
        await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    status: 'processing',
                    processingAt: new Date(),
                    transactionId: transactionId || `TXN-${Date.now()}`,
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: 'Payout processing started'
        });
    } catch (error) {
        console.error('Process payout error:', error);
        res.status(500).json({
            success: false,
            error: 'PROCESS_PAYOUT_FAILED',
            message: 'Failed to process payout'
        });
    }
});

// Cancel payout
router.post('/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const collection = await getCollection('payouts');
        const payout = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!payout) {
            return res.status(404).json({
                success: false,
                error: 'PAYOUT_NOT_FOUND',
                message: 'Payout not found'
            });
        }

        if (payout.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'INVALID_PAYOUT_STATUS',
                message: 'Only pending payouts can be cancelled'
            });
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    status: 'cancelled',
                    cancelledAt: new Date(),
                    cancellationReason: reason || 'Cancelled by user',
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: 'Payout cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel payout error:', error);
        res.status(500).json({
            success: false,
            error: 'CANCEL_PAYOUT_FAILED',
            message: 'Failed to cancel payout'
        });
    }
});

// Get payout statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('payouts');
        
        // Get total payouts
        const totalPayouts = await collection.countDocuments(filters);
        
        // Get payouts by status
        const payoutsByStatus = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get total amount by status
        const totalAmountByStatus = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$status', total: { $sum: '$amount' } } }
        ]).toArray();
        
        // Get payouts by payment method
        const payoutsByMethod = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalPayouts,
                payoutsByStatus,
                totalAmountByStatus,
                payoutsByMethod
            }
        });
    } catch (error) {
        console.error('Get payout stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PAYOUT_STATS_FAILED',
            message: 'Failed to retrieve payout statistics'
        });
    }
});

// Get payout summary
router.get('/summary/:recipientId', authenticateToken, async (req, res) => {
    try {
        const { recipientId } = req.params;
        const { startDate, endDate } = req.query;
        
        const filters = { recipientId: new ObjectId(recipientId) };
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('payouts');
        
        // Get total payouts
        const totalPayouts = await collection.countDocuments(filters);
        
        // Get total amount
        const totalAmount = await collection.aggregate([
            { $match: filters },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).toArray();
        
        // Get completed payouts
        const completedPayouts = await collection.countDocuments({ 
            ...filters,
            status: 'completed'
        });
        
        // Get completed amount
        const completedAmount = await collection.aggregate([
            { 
                $match: { 
                    ...filters,
                    status: 'completed'
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalPayouts,
                totalAmount: totalAmount[0]?.total || 0,
                completedPayouts,
                completedAmount: completedAmount[0]?.total || 0,
                pendingPayouts: totalPayouts - completedPayouts
            }
        });
    } catch (error) {
        console.error('Get payout summary error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PAYOUT_SUMMARY_FAILED',
            message: 'Failed to retrieve payout summary'
        });
    }
});

module.exports = router;
