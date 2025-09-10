const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all tracking events
router.get('/events', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, type, userId, startDate, endDate } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (type) filters.type = type;
        if (userId) filters.userId = new ObjectId(userId);
        if (startDate || endDate) {
            filters.timestamp = {};
            if (startDate) filters.timestamp.$gte = new Date(startDate);
            if (endDate) filters.timestamp.$lte = new Date(endDate);
        }

        const collection = await getCollection('tracking_events');
        const events = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ timestamp: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: events,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get tracking events error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_TRACKING_EVENTS_FAILED',
            message: 'Failed to retrieve tracking events'
        });
    }
});

// Create tracking event
router.post('/events', async (req, res) => {
    try {
        const { 
            type, 
            userId, 
            sessionId, 
            data,
            metadata,
            ipAddress,
            userAgent 
        } = req.body;
        
        if (!type) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_EVENT_TYPE',
                message: 'Event type is required'
            });
        }

        const eventData = {
            type,
            userId: userId ? new ObjectId(userId) : null,
            sessionId: sessionId || null,
            data: data || {},
            metadata: metadata || {},
            ipAddress: ipAddress || req.ip,
            userAgent: userAgent || req.get('User-Agent'),
            timestamp: new Date(),
            createdAt: new Date()
        };

        const collection = await getCollection('tracking_events');
        const result = await collection.insertOne(eventData);
        
        eventData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Tracking event created successfully',
            data: eventData
        });
    } catch (error) {
        console.error('Create tracking event error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_TRACKING_EVENT_FAILED',
            message: 'Failed to create tracking event'
        });
    }
});

// Get user activity timeline
router.get('/user/:userId/timeline', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate, type } = req.query;
        
        const filters = { userId: new ObjectId(userId) };
        if (type) filters.type = type;
        if (startDate || endDate) {
            filters.timestamp = {};
            if (startDate) filters.timestamp.$gte = new Date(startDate);
            if (endDate) filters.timestamp.$lte = new Date(endDate);
        }

        const collection = await getCollection('tracking_events');
        const events = await collection.find(filters)
            .sort({ timestamp: -1 })
            .toArray();

        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Get user timeline error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_USER_TIMELINE_FAILED',
            message: 'Failed to retrieve user timeline'
        });
    }
});

// Get session tracking
router.get('/sessions/:sessionId', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const collection = await getCollection('tracking_events');
        const events = await collection.find({ sessionId })
            .sort({ timestamp: 1 })
            .toArray();

        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Get session tracking error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SESSION_TRACKING_FAILED',
            message: 'Failed to retrieve session tracking'
        });
    }
});

// Get tracking analytics
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        
        const filters = {};
        if (type) filters.type = type;
        if (startDate || endDate) {
            filters.timestamp = {};
            if (startDate) filters.timestamp.$gte = new Date(startDate);
            if (endDate) filters.timestamp.$lte = new Date(endDate);
        }

        const collection = await getCollection('tracking_events');
        
        // Get total events
        const totalEvents = await collection.countDocuments(filters);
        
        // Get events by type
        const eventsByType = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get events by user
        const eventsByUser = await collection.aggregate([
            { $match: { ...filters, userId: { $ne: null } } },
            { $group: { _id: '$userId', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get events by hour
        const eventsByHour = await collection.aggregate([
            { $match: filters },
            { 
                $group: { 
                    _id: { $hour: '$timestamp' }, 
                    count: { $sum: 1 } 
                } 
            },
            { $sort: { _id: 1 } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalEvents,
                eventsByType,
                eventsByUser,
                eventsByHour
            }
        });
    } catch (error) {
        console.error('Get tracking analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_TRACKING_ANALYTICS_FAILED',
            message: 'Failed to retrieve tracking analytics'
        });
    }
});

// Get user behavior analysis
router.get('/behavior/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;
        
        const filters = { userId: new ObjectId(userId) };
        if (startDate || endDate) {
            filters.timestamp = {};
            if (startDate) filters.timestamp.$gte = new Date(startDate);
            if (endDate) filters.timestamp.$lte = new Date(endDate);
        }

        const collection = await getCollection('tracking_events');
        
        // Get user's most common actions
        const commonActions = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]).toArray();
        
        // Get user's activity patterns
        const activityPatterns = await collection.aggregate([
            { $match: filters },
            { 
                $group: { 
                    _id: { 
                        hour: { $hour: '$timestamp' },
                        dayOfWeek: { $dayOfWeek: '$timestamp' }
                    }, 
                    count: { $sum: 1 } 
                } 
            }
        ]).toArray();
        
        // Get user's session data
        const sessionData = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$sessionId', duration: { $sum: 1 } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                commonActions,
                activityPatterns,
                sessionData
            }
        });
    } catch (error) {
        console.error('Get user behavior analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_USER_BEHAVIOR_ANALYSIS_FAILED',
            message: 'Failed to retrieve user behavior analysis'
        });
    }
});

// Track page view
router.post('/pageview', async (req, res) => {
    try {
        const { 
            userId, 
            sessionId, 
            page, 
            referrer,
            duration 
        } = req.body;
        
        if (!page) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_PAGE',
                message: 'Page is required'
            });
        }

        const eventData = {
            type: 'pageview',
            userId: userId ? new ObjectId(userId) : null,
            sessionId: sessionId || null,
            data: {
                page,
                referrer: referrer || '',
                duration: duration || 0
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date(),
            createdAt: new Date()
        };

        const collection = await getCollection('tracking_events');
        const result = await collection.insertOne(eventData);
        
        eventData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Page view tracked successfully',
            data: eventData
        });
    } catch (error) {
        console.error('Track page view error:', error);
        res.status(500).json({
            success: false,
            error: 'TRACK_PAGE_VIEW_FAILED',
            message: 'Failed to track page view'
        });
    }
});

// Track user action
router.post('/action', async (req, res) => {
    try {
        const { 
            userId, 
            sessionId, 
            action, 
            target,
            value 
        } = req.body;
        
        if (!action) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_ACTION',
                message: 'Action is required'
            });
        }

        const eventData = {
            type: 'action',
            userId: userId ? new ObjectId(userId) : null,
            sessionId: sessionId || null,
            data: {
                action,
                target: target || '',
                value: value || null
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date(),
            createdAt: new Date()
        };

        const collection = await getCollection('tracking_events');
        const result = await collection.insertOne(eventData);
        
        eventData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'User action tracked successfully',
            data: eventData
        });
    } catch (error) {
        console.error('Track user action error:', error);
        res.status(500).json({
            success: false,
            error: 'TRACK_USER_ACTION_FAILED',
            message: 'Failed to track user action'
        });
    }
});

// Get tracking configuration
router.get('/config', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('tracking_config');
        const config = await collection.findOne({ isActive: true });
        
        if (!config) {
            return res.status(404).json({
                success: false,
                error: 'TRACKING_CONFIG_NOT_FOUND',
                message: 'Tracking configuration not found'
            });
        }

        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        console.error('Get tracking config error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_TRACKING_CONFIG_FAILED',
            message: 'Failed to retrieve tracking configuration'
        });
    }
});

module.exports = router;
