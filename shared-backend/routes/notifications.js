const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all notifications
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, userId, read, type } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (userId) filters.userId = new ObjectId(userId);
        if (read !== undefined) filters.read = read === 'true';
        if (type) filters.type = type;

        const collection = await getCollection('notifications');
        const notifications = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_NOTIFICATIONS_FAILED',
            message: 'Failed to retrieve notifications'
        });
    }
});

// Get notification by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('notifications');
        const notification = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'NOTIFICATION_NOT_FOUND',
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Get notification error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_NOTIFICATION_FAILED',
            message: 'Failed to retrieve notification'
        });
    }
});

// Create notification
router.post('/', authenticateToken, async (req, res) => {
    try {
        const notificationData = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('notifications');
        const result = await collection.insertOne(notificationData);
        
        notificationData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: notificationData
        });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_NOTIFICATION_FAILED',
            message: 'Failed to create notification'
        });
    }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('notifications');
        
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    read: true,
                    readAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'NOTIFICATION_NOT_FOUND',
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({
            success: false,
            error: 'MARK_READ_FAILED',
            message: 'Failed to mark notification as read'
        });
    }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.body;
        const collection = await getCollection('notifications');
        
        const result = await collection.updateMany(
            { userId: new ObjectId(userId), read: false },
            { 
                $set: { 
                    read: true,
                    readAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read',
            data: { modifiedCount: result.modifiedCount }
        });
    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        res.status(500).json({
            success: false,
            error: 'MARK_ALL_READ_FAILED',
            message: 'Failed to mark all notifications as read'
        });
    }
});

module.exports = router;
