const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all reviews
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, rating, serviceType, userId, mechanicId, bookingId } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (rating) filters.rating = parseInt(rating);
        if (serviceType) filters.serviceType = serviceType;
        if (userId) filters.userId = new ObjectId(userId);
        if (mechanicId) filters.mechanicId = new ObjectId(mechanicId);
        if (bookingId) filters.bookingId = new ObjectId(bookingId);

        const collection = await getCollection('reviews');
        const reviews = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_REVIEWS_FAILED',
            message: 'Failed to retrieve reviews'
        });
    }
});

// Get review by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('reviews');
        const review = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!review) {
            return res.status(404).json({
                success: false,
                error: 'REVIEW_NOT_FOUND',
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Get review error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_REVIEW_FAILED',
            message: 'Failed to retrieve review'
        });
    }
});

// Create review
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            bookingId,
            mechanicId,
            serviceType,
            rating,
            comment,
            aspects
        } = req.body;
        
        if (!bookingId || !mechanicId || !rating) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Booking ID, mechanic ID, and rating are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_RATING',
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if review already exists for this booking
        const collection = await getCollection('reviews');
        const existingReview = await collection.findOne({ 
            bookingId: new ObjectId(bookingId),
            userId: req.user.userId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                error: 'REVIEW_ALREADY_EXISTS',
                message: 'Review already exists for this booking'
            });
        }

        const reviewData = {
            bookingId: new ObjectId(bookingId),
            mechanicId: new ObjectId(mechanicId),
            userId: req.user.userId,
            serviceType: serviceType || 'general',
            rating: parseInt(rating),
            comment: comment || '',
            aspects: aspects || {},
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await collection.insertOne(reviewData);
        reviewData._id = result.insertedId;

        // Update mechanic's average rating
        await updateMechanicRating(mechanicId);

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: reviewData
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_REVIEW_FAILED',
            message: 'Failed to create review'
        });
    }
});

// Update review
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, aspects } = req.body;
        
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_RATING',
                message: 'Rating must be between 1 and 5'
            });
        }

        const collection = await getCollection('reviews');
        const review = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!review) {
            return res.status(404).json({
                success: false,
                error: 'REVIEW_NOT_FOUND',
                message: 'Review not found'
            });
        }

        // Check if user owns this review
        if (review.userId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only update your own reviews'
            });
        }

        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'REVIEW_NOT_FOUND',
                message: 'Review not found'
            });
        }

        // Update mechanic's average rating if rating changed
        if (rating && rating !== review.rating) {
            await updateMechanicRating(review.mechanicId);
        }

        res.json({
            success: true,
            message: 'Review updated successfully'
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_REVIEW_FAILED',
            message: 'Failed to update review'
        });
    }
});

// Delete review
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('reviews');
        
        const review = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!review) {
            return res.status(404).json({
                success: false,
                error: 'REVIEW_NOT_FOUND',
                message: 'Review not found'
            });
        }

        // Check if user owns this review or is admin
        if (review.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only delete your own reviews'
            });
        }

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'REVIEW_NOT_FOUND',
                message: 'Review not found'
            });
        }

        // Update mechanic's average rating
        await updateMechanicRating(review.mechanicId);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            error: 'DELETE_REVIEW_FAILED',
            message: 'Failed to delete review'
        });
    }
});

// Get user reviews
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, rating } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { userId: new ObjectId(userId) };
        if (rating) filters.rating = parseInt(rating);

        const collection = await getCollection('reviews');
        const reviews = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_USER_REVIEWS_FAILED',
            message: 'Failed to retrieve user reviews'
        });
    }
});

// Get mechanic reviews
router.get('/mechanic/:mechanicId', authenticateToken, async (req, res) => {
    try {
        const { mechanicId } = req.params;
        const { page = 1, limit = 10, rating, serviceType } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { mechanicId: new ObjectId(mechanicId) };
        if (rating) filters.rating = parseInt(rating);
        if (serviceType) filters.serviceType = serviceType;

        const collection = await getCollection('reviews');
        const reviews = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get mechanic reviews error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_MECHANIC_REVIEWS_FAILED',
            message: 'Failed to retrieve mechanic reviews'
        });
    }
});

// Get booking review
router.get('/booking/:bookingId', authenticateToken, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const collection = await getCollection('reviews');
        const review = await collection.findOne({ 
            bookingId: new ObjectId(bookingId),
            userId: req.user.userId
        });

        res.json({
            success: true,
            data: review || null
        });
    } catch (error) {
        console.error('Get booking review error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_BOOKING_REVIEW_FAILED',
            message: 'Failed to retrieve booking review'
        });
    }
});

// Get reviews by rating
router.get('/rating/:rating', authenticateToken, async (req, res) => {
    try {
        const { rating } = req.params;
        const { page = 1, limit = 10, serviceType } = req.query;
        const skip = (page - 1) * limit;
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_RATING',
                message: 'Rating must be between 1 and 5'
            });
        }

        const filters = { rating: parseInt(rating) };
        if (serviceType) filters.serviceType = serviceType;

        const collection = await getCollection('reviews');
        const reviews = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get reviews by rating error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_REVIEWS_BY_RATING_FAILED',
            message: 'Failed to retrieve reviews by rating'
        });
    }
});

// Get review statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, mechanicId } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }
        if (mechanicId) filters.mechanicId = new ObjectId(mechanicId);

        const collection = await getCollection('reviews');
        
        // Get total reviews
        const totalReviews = await collection.countDocuments(filters);
        
        // Get average rating
        const avgRating = await collection.aggregate([
            { $match: filters },
            { $group: { _id: null, average: { $avg: '$rating' } } }
        ]).toArray();
        
        // Get reviews by rating
        const reviewsByRating = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]).toArray();
        
        // Get reviews by service type
        const reviewsByServiceType = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$serviceType', count: { $sum: 1 } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalReviews,
                averageRating: avgRating[0]?.average || 0,
                reviewsByRating,
                reviewsByServiceType
            }
        });
    } catch (error) {
        console.error('Get review stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_REVIEW_STATS_FAILED',
            message: 'Failed to retrieve review statistics'
        });
    }
});

// Helper function to update mechanic's average rating
async function updateMechanicRating(mechanicId) {
    try {
        const reviewsCollection = await getCollection('reviews');
        const mechanicsCollection = await getCollection('mechanics');
        
        const reviews = await reviewsCollection.find({ 
            mechanicId: new ObjectId(mechanicId),
            status: 'active'
        }).toArray();
        
        if (reviews.length === 0) {
            await mechanicsCollection.updateOne(
                { _id: new ObjectId(mechanicId) },
                { $set: { averageRating: 0, totalReviews: 0 } }
            );
            return;
        }
        
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        await mechanicsCollection.updateOne(
            { _id: new ObjectId(mechanicId) },
            { 
                $set: { 
                    averageRating: Math.round(averageRating * 10) / 10,
                    totalReviews: reviews.length
                }
            }
        );
    } catch (error) {
        console.error('Update mechanic rating error:', error);
    }
}

module.exports = router;
