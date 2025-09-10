const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all bookings
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, userId, mechanicId, status, serviceType, startDate, endDate } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (userId) filters.userId = new ObjectId(userId);
        if (mechanicId) filters.mechanicId = new ObjectId(mechanicId);
        if (status) filters.status = status;
        if (serviceType) filters.serviceType = serviceType;
        if (startDate || endDate) {
            filters.bookingDate = {};
            if (startDate) filters.bookingDate.$gte = new Date(startDate);
            if (endDate) filters.bookingDate.$lte = new Date(endDate);
        }

        const collection = await getCollection('bookings');
        const bookings = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_BOOKINGS_FAILED',
            message: 'Failed to retrieve bookings'
        });
    }
});

// Get booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('bookings');
        const booking = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'BOOKING_NOT_FOUND',
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_BOOKING_FAILED',
            message: 'Failed to retrieve booking'
        });
    }
});

// Create booking
router.post('/', authenticateToken, validateBooking, async (req, res) => {
    try {
        const { 
            mechanicId,
            vehicleId,
            serviceType,
            bookingDate,
            preferredTime,
            description,
            location,
            estimatedCost,
            priority
        } = req.body;
        
        if (!mechanicId || !vehicleId || !serviceType || !bookingDate) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Mechanic ID, vehicle ID, service type, and booking date are required'
            });
        }

        // Check if mechanic is available
        const mechanicsCollection = await getCollection('mechanics');
        const mechanic = await mechanicsCollection.findOne({ 
            _id: new ObjectId(mechanicId),
            status: 'active'
        });

        if (!mechanic) {
            return res.status(400).json({
                success: false,
                error: 'MECHANIC_NOT_AVAILABLE',
                message: 'Selected mechanic is not available'
            });
        }

        // Check if vehicle exists and belongs to user
        const vehiclesCollection = await getCollection('vehicles');
        const vehicle = await vehiclesCollection.findOne({ 
            _id: new ObjectId(vehicleId),
            userId: req.user.userId
        });

        if (!vehicle) {
            return res.status(400).json({
                success: false,
                error: 'VEHICLE_NOT_FOUND',
                message: 'Vehicle not found or does not belong to you'
            });
        }

        // Generate booking reference
        const bookingReference = `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const bookingData = {
            bookingReference,
            userId: req.user.userId,
            mechanicId: new ObjectId(mechanicId),
            vehicleId: new ObjectId(vehicleId),
            serviceType,
            bookingDate: new Date(bookingDate),
            preferredTime: preferredTime || 'anytime',
            description: description || '',
            location: location || {},
            estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
            priority: priority || 'normal',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('bookings');
        const result = await collection.insertOne(bookingData);
        
        bookingData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: bookingData
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_BOOKING_FAILED',
            message: 'Failed to create booking'
        });
    }
});

// Update booking
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('bookings');
        const booking = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'BOOKING_NOT_FOUND',
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking or is admin
        if (booking.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only update your own bookings'
            });
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'BOOKING_NOT_FOUND',
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: 'Booking updated successfully'
        });
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_BOOKING_FAILED',
            message: 'Failed to update booking'
        });
    }
});

// Update booking status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, actualCost, completionTime } = req.body;
        
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

        if (status === 'confirmed') {
            updateData.confirmedAt = new Date();
        } else if (status === 'in_progress') {
            updateData.startedAt = new Date();
        } else if (status === 'completed') {
            updateData.completedAt = new Date();
            updateData.actualCost = actualCost ? parseFloat(actualCost) : 0;
            updateData.completionTime = completionTime;
        } else if (status === 'cancelled') {
            updateData.cancelledAt = new Date();
        }

        if (notes) {
            updateData.notes = notes;
        }

        const collection = await getCollection('bookings');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'BOOKING_NOT_FOUND',
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: `Booking status updated to ${status}`
        });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_BOOKING_STATUS_FAILED',
            message: 'Failed to update booking status'
        });
    }
});

// Cancel booking
router.post('/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const collection = await getCollection('bookings');
        const booking = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'BOOKING_NOT_FOUND',
                message: 'Booking not found'
            });
        }

        if (booking.status !== 'pending' && booking.status !== 'confirmed') {
            return res.status(400).json({
                success: false,
                error: 'INVALID_BOOKING_STATUS',
                message: 'Only pending or confirmed bookings can be cancelled'
            });
        }

        // Check if user owns this booking or is admin
        if (booking.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only cancel your own bookings'
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
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            error: 'CANCEL_BOOKING_FAILED',
            message: 'Failed to cancel booking'
        });
    }
});

// Get user bookings
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status, serviceType } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { userId: new ObjectId(userId) };
        if (status) filters.status = status;
        if (serviceType) filters.serviceType = serviceType;

        const collection = await getCollection('bookings');
        const bookings = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_USER_BOOKINGS_FAILED',
            message: 'Failed to retrieve user bookings'
        });
    }
});

// Get mechanic bookings
router.get('/mechanic/:mechanicId', authenticateToken, async (req, res) => {
    try {
        const { mechanicId } = req.params;
        const { page = 1, limit = 10, status, serviceType } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { mechanicId: new ObjectId(mechanicId) };
        if (status) filters.status = status;
        if (serviceType) filters.serviceType = serviceType;

        const collection = await getCollection('bookings');
        const bookings = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get mechanic bookings error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_MECHANIC_BOOKINGS_FAILED',
            message: 'Failed to retrieve mechanic bookings'
        });
    }
});

// Get bookings by status
router.get('/status/:status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.params;
        const { page = 1, limit = 10, userId, mechanicId } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { status };
        if (userId) filters.userId = new ObjectId(userId);
        if (mechanicId) filters.mechanicId = new ObjectId(mechanicId);

        const collection = await getCollection('bookings');
        const bookings = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get bookings by status error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_BOOKINGS_BY_STATUS_FAILED',
            message: 'Failed to retrieve bookings by status'
        });
    }
});

// Get pending bookings
router.get('/pending/list', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, mechanicId } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { status: 'pending' };
        if (mechanicId) filters.mechanicId = new ObjectId(mechanicId);

        const collection = await getCollection('bookings');
        const pendingBookings = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ bookingDate: 1, createdAt: 1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: pendingBookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get pending bookings error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PENDING_BOOKINGS_FAILED',
            message: 'Failed to retrieve pending bookings'
        });
    }
});

// Get booking statistics
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

        const collection = await getCollection('bookings');
        
        // Get total bookings
        const totalBookings = await collection.countDocuments(filters);
        
        // Get bookings by status
        const bookingsByStatus = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get bookings by service type
        const bookingsByServiceType = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$serviceType', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get total revenue
        const totalRevenue = await collection.aggregate([
            { $match: { ...filters, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$actualCost' } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalBookings,
                totalRevenue: totalRevenue[0]?.total || 0,
                bookingsByStatus,
                bookingsByServiceType
            }
        });
    } catch (error) {
        console.error('Get booking stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_BOOKING_STATS_FAILED',
            message: 'Failed to retrieve booking statistics'
        });
    }
});

module.exports = router;
