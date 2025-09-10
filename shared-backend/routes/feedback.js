const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all feedback
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, type, status, userId, category } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (type) filters.type = type;
        if (status) filters.status = status;
        if (userId) filters.userId = new ObjectId(userId);
        if (category) filters.category = category;

        const collection = await getCollection('feedback');
        const feedback = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: feedback,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_FEEDBACK_FAILED',
            message: 'Failed to retrieve feedback'
        });
    }
});

// Get feedback by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('feedback');
        const feedback = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!feedback) {
            return res.status(404).json({
                success: false,
                error: 'FEEDBACK_NOT_FOUND',
                message: 'Feedback not found'
            });
        }

        res.json({
            success: true,
            data: feedback
        });
    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_FEEDBACK_FAILED',
            message: 'Failed to retrieve feedback'
        });
    }
});

// Create feedback
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            type,
            category,
            subject,
            message,
            priority,
            attachments,
            relatedBookingId,
            relatedServiceId
        } = req.body;
        
        if (!type || !subject || !message) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Type, subject, and message are required'
            });
        }

        // Generate feedback reference
        const feedbackReference = `FB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const feedbackData = {
            feedbackReference,
            userId: req.user.userId,
            type: type || 'general',
            category: category || 'general',
            subject,
            message,
            priority: priority || 'medium',
            attachments: attachments || [],
            relatedBookingId: relatedBookingId ? new ObjectId(relatedBookingId) : null,
            relatedServiceId: relatedServiceId ? new ObjectId(relatedServiceId) : null,
            status: 'open',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('feedback');
        const result = await collection.insertOne(feedbackData);
        
        feedbackData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: feedbackData
        });
    } catch (error) {
        console.error('Create feedback error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_FEEDBACK_FAILED',
            message: 'Failed to submit feedback'
        });
    }
});

// Update feedback
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('feedback');
        const feedback = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!feedback) {
            return res.status(404).json({
                success: false,
                error: 'FEEDBACK_NOT_FOUND',
                message: 'Feedback not found'
            });
        }

        // Check if user owns this feedback or is admin
        if (feedback.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only update your own feedback'
            });
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'FEEDBACK_NOT_FOUND',
                message: 'Feedback not found'
            });
        }

        res.json({
            success: true,
            message: 'Feedback updated successfully'
        });
    } catch (error) {
        console.error('Update feedback error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_FEEDBACK_FAILED',
            message: 'Failed to update feedback'
        });
    }
});

// Update feedback status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminResponse, assignedTo } = req.body;
        
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

        if (status === 'in_progress') {
            updateData.inProgressAt = new Date();
            updateData.assignedTo = assignedTo;
        } else if (status === 'resolved') {
            updateData.resolvedAt = new Date();
            updateData.adminResponse = adminResponse;
        } else if (status === 'closed') {
            updateData.closedAt = new Date();
        }

        if (adminResponse) {
            updateData.adminResponse = adminResponse;
        }

        const collection = await getCollection('feedback');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'FEEDBACK_NOT_FOUND',
                message: 'Feedback not found'
            });
        }

        res.json({
            success: true,
            message: `Feedback status updated to ${status}`
        });
    } catch (error) {
        console.error('Update feedback status error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_FEEDBACK_STATUS_FAILED',
            message: 'Failed to update feedback status'
        });
    }
});

// Add response to feedback
router.post('/:id/response', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { response, isAdminResponse = false } = req.body;
        
        if (!response) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_RESPONSE',
                message: 'Response is required'
            });
        }

        const responseData = {
            id: new ObjectId(),
            userId: req.user.userId,
            response,
            isAdminResponse,
            createdAt: new Date()
        };

        const collection = await getCollection('feedback');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $push: { responses: responseData },
                $set: { updatedAt: new Date() }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'FEEDBACK_NOT_FOUND',
                message: 'Feedback not found'
            });
        }

        res.json({
            success: true,
            message: 'Response added successfully',
            data: responseData
        });
    } catch (error) {
        console.error('Add feedback response error:', error);
        res.status(500).json({
            success: false,
            error: 'ADD_FEEDBACK_RESPONSE_FAILED',
            message: 'Failed to add response'
        });
    }
});

// Get user feedback
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status, type } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { userId: new ObjectId(userId) };
        if (status) filters.status = status;
        if (type) filters.type = type;

        const collection = await getCollection('feedback');
        const feedback = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: feedback,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get user feedback error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_USER_FEEDBACK_FAILED',
            message: 'Failed to retrieve user feedback'
        });
    }
});

// Get feedback by type
router.get('/type/:type', authenticateToken, async (req, res) => {
    try {
        const { type } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { type };
        if (status) filters.status = status;

        const collection = await getCollection('feedback');
        const feedback = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: feedback,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get feedback by type error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_FEEDBACK_BY_TYPE_FAILED',
            message: 'Failed to retrieve feedback by type'
        });
    }
});

// Get open feedback
router.get('/open/list', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, priority } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { status: 'open' };
        if (priority) filters.priority = priority;

        const collection = await getCollection('feedback');
        const openFeedback = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ priority: -1, createdAt: 1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: openFeedback,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get open feedback error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_OPEN_FEEDBACK_FAILED',
            message: 'Failed to retrieve open feedback'
        });
    }
});

// Get feedback statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }
        if (type) filters.type = type;

        const collection = await getCollection('feedback');
        
        // Get total feedback
        const totalFeedback = await collection.countDocuments(filters);
        
        // Get feedback by status
        const feedbackByStatus = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get feedback by type
        const feedbackByType = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get feedback by priority
        const feedbackByPriority = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalFeedback,
                feedbackByStatus,
                feedbackByType,
                feedbackByPriority
            }
        });
    } catch (error) {
        console.error('Get feedback stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_FEEDBACK_STATS_FAILED',
            message: 'Failed to retrieve feedback statistics'
        });
    }
});

// Search feedback
router.get('/search/query', authenticateToken, async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_QUERY',
                message: 'Search query is required'
            });
        }

        const collection = await getCollection('feedback');
        const feedback = await collection.find({
            $or: [
                { subject: { $regex: q, $options: 'i' } },
                { message: { $regex: q, $options: 'i' } },
                { feedbackReference: { $regex: q, $options: 'i' } }
            ]
        })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .toArray();
        
        const total = await collection.countDocuments({
            $or: [
                { subject: { $regex: q, $options: 'i' } },
                { message: { $regex: q, $options: 'i' } },
                { feedbackReference: { $regex: q, $options: 'i' } }
            ]
        });

        res.json({
            success: true,
            data: feedback,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Search feedback error:', error);
        res.status(500).json({
            success: false,
            error: 'SEARCH_FEEDBACK_FAILED',
            message: 'Failed to search feedback'
        });
    }
});

module.exports = router;
