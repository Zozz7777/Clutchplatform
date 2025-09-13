const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
// const { validatePayment } = require('../middleware/validation'); // Not implemented yet
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all payments
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, userId, mechanicId, status, paymentMethod, startDate, endDate } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (userId) filters.userId = new ObjectId(userId);
        if (mechanicId) filters.mechanicId = new ObjectId(mechanicId);
        if (status) filters.status = status;
        if (paymentMethod) filters.paymentMethod = paymentMethod;
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('payments');
        const payments = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PAYMENTS_FAILED',
            message: 'Failed to retrieve payments'
        });
    }
});

// Get payment by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('payments');
        const payment = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'PAYMENT_NOT_FOUND',
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('Get payment error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PAYMENT_FAILED',
            message: 'Failed to retrieve payment'
        });
    }
});

// Create payment
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            bookingId,
            mechanicId,
            amount,
            paymentMethod,
            currency,
            description,
            metadata
        } = req.body;
        
        if (!bookingId || !amount || !paymentMethod) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Booking ID, amount, and payment method are required'
            });
        }

        // Check if booking exists
        const bookingsCollection = await getCollection('bookings');
        const booking = await bookingsCollection.findOne({ 
            _id: new ObjectId(bookingId),
            userId: req.user.userId
        });

        if (!booking) {
            return res.status(400).json({
                success: false,
                error: 'BOOKING_NOT_FOUND',
                message: 'Booking not found or does not belong to you'
            });
        }

        // Check if payment already exists for this booking
        const collection = await getCollection('payments');
        const existingPayment = await collection.findOne({ bookingId: new ObjectId(bookingId) });
        if (existingPayment) {
            return res.status(400).json({
                success: false,
                error: 'PAYMENT_ALREADY_EXISTS',
                message: 'Payment already exists for this booking'
            });
        }

        // Generate payment reference
        const paymentReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const paymentData = {
            paymentReference,
            userId: req.user.userId,
            bookingId: new ObjectId(bookingId),
            mechanicId: mechanicId ? new ObjectId(mechanicId) : booking.mechanicId,
            amount: parseFloat(amount),
            currency: currency || 'USD',
            paymentMethod,
            description: description || '',
            metadata: metadata || {},
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await collection.insertOne(paymentData);
        
        paymentData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            data: paymentData
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_PAYMENT_FAILED',
            message: 'Failed to create payment'
        });
    }
});

// Update payment
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('payments');
        const payment = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'PAYMENT_NOT_FOUND',
                message: 'Payment not found'
            });
        }

        // Check if user owns this payment or is admin
        if (payment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only update your own payments'
            });
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'PAYMENT_NOT_FOUND',
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            message: 'Payment updated successfully'
        });
    } catch (error) {
        console.error('Update payment error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_PAYMENT_FAILED',
            message: 'Failed to update payment'
        });
    }
});

// Update payment status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, transactionId, failureReason } = req.body;
        
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
            updateData.failureReason = failureReason;
        } else if (status === 'processing') {
            updateData.processingAt = new Date();
        }

        const collection = await getCollection('payments');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'PAYMENT_NOT_FOUND',
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            message: `Payment status updated to ${status}`
        });
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_PAYMENT_STATUS_FAILED',
            message: 'Failed to update payment status'
        });
    }
});

// Process payment
router.post('/:id/process', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { transactionId } = req.body;
        
        const collection = await getCollection('payments');
        const payment = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'PAYMENT_NOT_FOUND',
                message: 'Payment not found'
            });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'INVALID_PAYMENT_STATUS',
                message: 'Payment is not in pending status'
            });
        }

        // TODO: Integrate with actual payment processor
        // For now, simulate payment processing
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
            message: 'Payment processing started'
        });
    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({
            success: false,
            error: 'PROCESS_PAYMENT_FAILED',
            message: 'Failed to process payment'
        });
    }
});

// Get user payments
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status, paymentMethod } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { userId: new ObjectId(userId) };
        if (status) filters.status = status;
        if (paymentMethod) filters.paymentMethod = paymentMethod;

        const collection = await getCollection('payments');
        const payments = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get user payments error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_USER_PAYMENTS_FAILED',
            message: 'Failed to retrieve user payments'
        });
    }
});

// Get mechanic payments
router.get('/mechanic/:mechanicId', authenticateToken, async (req, res) => {
    try {
        const { mechanicId } = req.params;
        const { page = 1, limit = 10, status, paymentMethod } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { mechanicId: new ObjectId(mechanicId) };
        if (status) filters.status = status;
        if (paymentMethod) filters.paymentMethod = paymentMethod;

        const collection = await getCollection('payments');
        const payments = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get mechanic payments error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_MECHANIC_PAYMENTS_FAILED',
            message: 'Failed to retrieve mechanic payments'
        });
    }
});

// Get payments by status
router.get('/status/:status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.params;
        const { page = 1, limit = 10, userId, mechanicId } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { status };
        if (userId) filters.userId = new ObjectId(userId);
        if (mechanicId) filters.mechanicId = new ObjectId(mechanicId);

        const collection = await getCollection('payments');
        const payments = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get payments by status error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PAYMENTS_BY_STATUS_FAILED',
            message: 'Failed to retrieve payments by status'
        });
    }
});

// Get pending payments
router.get('/pending/list', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, userId, mechanicId } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { status: 'pending' };
        if (userId) filters.userId = new ObjectId(userId);
        if (mechanicId) filters.mechanicId = new ObjectId(mechanicId);

        const collection = await getCollection('payments');
        const pendingPayments = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: 1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: pendingPayments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get pending payments error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PENDING_PAYMENTS_FAILED',
            message: 'Failed to retrieve pending payments'
        });
    }
});

// Get payment statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, userId, mechanicId } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }
        if (userId) filters.userId = new ObjectId(userId);
        if (mechanicId) filters.mechanicId = new ObjectId(mechanicId);

        const collection = await getCollection('payments');
        
        // Get total payments
        const totalPayments = await collection.countDocuments(filters);
        
        // Get payments by status
        const paymentsByStatus = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get payments by method
        const paymentsByMethod = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get total amount
        const totalAmount = await collection.aggregate([
            { $match: { ...filters, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalPayments,
                totalAmount: totalAmount[0]?.total || 0,
                paymentsByStatus,
                paymentsByMethod
            }
        });
    } catch (error) {
        console.error('Get payment stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PAYMENT_STATS_FAILED',
            message: 'Failed to retrieve payment statistics'
        });
    }
});

module.exports = router;
