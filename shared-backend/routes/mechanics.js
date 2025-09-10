const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all mechanics
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, specialization, status, location } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (specialization) filters.specialization = specialization;
        if (status) filters.status = status;
        if (location) filters.location = location;

        const collection = await getCollection('mechanics');
        const mechanics = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: mechanics,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get mechanics error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_MECHANICS_FAILED',
            message: 'Failed to retrieve mechanics'
        });
    }
});

// Get mechanic by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('mechanics');
        const mechanic = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!mechanic) {
            return res.status(404).json({
                success: false,
                error: 'MECHANIC_NOT_FOUND',
                message: 'Mechanic not found'
            });
        }

        res.json({
            success: true,
            data: mechanic
        });
    } catch (error) {
        console.error('Get mechanic error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_MECHANIC_FAILED',
            message: 'Failed to retrieve mechanic'
        });
    }
});

// Create mechanic
router.post('/', authenticateToken, async (req, res) => {
    try {
        const mechanicData = {
            ...req.body,
            status: 'active',
            rating: 0,
            totalJobs: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('mechanics');
        const result = await collection.insertOne(mechanicData);
        
        mechanicData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Mechanic created successfully',
            data: mechanicData
        });
    } catch (error) {
        console.error('Create mechanic error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_MECHANIC_FAILED',
            message: 'Failed to create mechanic'
        });
    }
});

// Update mechanic
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('mechanics');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'MECHANIC_NOT_FOUND',
                message: 'Mechanic not found'
            });
        }

        res.json({
            success: true,
            message: 'Mechanic updated successfully'
        });
    } catch (error) {
        console.error('Update mechanic error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_MECHANIC_FAILED',
            message: 'Failed to update mechanic'
        });
    }
});

// Update mechanic rating
router.post('/:id/rate', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, review } = req.body;
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_RATING',
                message: 'Rating must be between 1 and 5'
            });
        }

        const collection = await getCollection('mechanics');
        
        // Get current mechanic data
        const mechanic = await collection.findOne({ _id: new ObjectId(id) });
        if (!mechanic) {
            return res.status(404).json({
                success: false,
                error: 'MECHANIC_NOT_FOUND',
                message: 'Mechanic not found'
            });
        }

        // Calculate new average rating
        const newTotalJobs = mechanic.totalJobs + 1;
        const newRating = ((mechanic.rating * mechanic.totalJobs) + rating) / newTotalJobs;

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    rating: newRating,
                    totalJobs: newTotalJobs,
                    updatedAt: new Date()
                },
                $push: { 
                    reviews: {
                        rating,
                        review,
                        userId: req.user.userId,
                        createdAt: new Date()
                    }
                }
            }
        );

        res.json({
            success: true,
            message: 'Rating updated successfully',
            data: { newRating, totalJobs: newTotalJobs }
        });
    } catch (error) {
        console.error('Update mechanic rating error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_MECHANIC_RATING_FAILED',
            message: 'Failed to update mechanic rating'
        });
    }
});

// Get mechanics by specialization
router.get('/specialization/:specialization', authenticateToken, async (req, res) => {
    try {
        const { specialization } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const collection = await getCollection('mechanics');
        const mechanics = await collection.find({ specialization, status: 'active' })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ rating: -1, totalJobs: -1 })
            .toArray();
        
        const total = await collection.countDocuments({ specialization, status: 'active' });

        res.json({
            success: true,
            data: mechanics,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get mechanics by specialization error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_MECHANICS_BY_SPECIALIZATION_FAILED',
            message: 'Failed to retrieve mechanics by specialization'
        });
    }
});

module.exports = router;
