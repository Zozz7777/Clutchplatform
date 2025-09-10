const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all clients
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (status) filters.status = status;
        if (search) {
            filters.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const collection = await getCollection('clients');
        const clients = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: clients,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CLIENTS_FAILED',
            message: 'Failed to retrieve clients'
        });
    }
});

// Get client by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('clients');
        const client = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'CLIENT_NOT_FOUND',
                message: 'Client not found'
            });
        }

        res.json({
            success: true,
            data: client
        });
    } catch (error) {
        console.error('Get client error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CLIENT_FAILED',
            message: 'Failed to retrieve client'
        });
    }
});

// Create client
router.post('/', authenticateToken, async (req, res) => {
    try {
        const clientData = {
            ...req.body,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('clients');
        const result = await collection.insertOne(clientData);
        
        clientData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Client created successfully',
            data: clientData
        });
    } catch (error) {
        console.error('Create client error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_CLIENT_FAILED',
            message: 'Failed to create client'
        });
    }
});

// Update client
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('clients');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'CLIENT_NOT_FOUND',
                message: 'Client not found'
            });
        }

        res.json({
            success: true,
            message: 'Client updated successfully'
        });
    } catch (error) {
        console.error('Update client error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_CLIENT_FAILED',
            message: 'Failed to update client'
        });
    }
});

// Get client history
router.get('/:id/history', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const bookingsCollection = await getCollection('bookings');
        const paymentsCollection = await getCollection('payments');
        
        const [bookings, payments] = await Promise.all([
            bookingsCollection.find({ userId: new ObjectId(id) })
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 })
                .toArray(),
            paymentsCollection.find({ userId: new ObjectId(id) })
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 })
                .toArray()
        ]);

        const totalBookings = await bookingsCollection.countDocuments({ userId: new ObjectId(id) });
        const totalPayments = await paymentsCollection.countDocuments({ userId: new ObjectId(id) });

        res.json({
            success: true,
            data: {
                bookings,
                payments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalBookings,
                    totalPayments
                }
            }
        });
    } catch (error) {
        console.error('Get client history error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CLIENT_HISTORY_FAILED',
            message: 'Failed to retrieve client history'
        });
    }
});

module.exports = router;
