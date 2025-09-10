const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all payments
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, userId, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (userId) filters.userId = new ObjectId(userId);
        if (status) filters.status = status;

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
        const paymentData = {
            ...req.body,
            userId: req.user.userId,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('payments');
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

module.exports = router;
