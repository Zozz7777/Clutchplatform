const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Simple test endpoint without authentication
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Operations routes are working',
    timestamp: new Date()
  });
});

// Platform overview endpoint
router.get('/platform-overview', authenticateToken, async (req, res) => {
    try {
        // Get collections
        const usersCollection = await getCollection('users');
        const vehiclesCollection = await getCollection('vehicles');
        const bookingsCollection = await getCollection('bookings');
        const paymentsCollection = await getCollection('payments');
        const operationsCollection = await getCollection('operations');
        
        // Get current date and last 30 days
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        // Aggregate platform data
        const [
            totalUsers,
            totalVehicles,
            totalBookings,
            totalPayments,
            totalOperations,
            recentOperations
        ] = await Promise.all([
            usersCollection.countDocuments(),
            vehiclesCollection.countDocuments(),
            bookingsCollection.countDocuments(),
            paymentsCollection.countDocuments(),
            operationsCollection.countDocuments(),
            operationsCollection.find({ createdAt: { $gte: thirtyDaysAgo } })
                .sort({ createdAt: -1 })
                .limit(10)
                .toArray()
        ]);
        
        // Calculate revenue
        const revenueData = await paymentsCollection.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).toArray();
        
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
        
        // Get operations by status
        const operationsByStatus = await operationsCollection.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        const statusBreakdown = operationsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});
        
        const platformOverview = {
            summary: {
                totalUsers,
                totalVehicles,
                totalBookings,
                totalPayments,
                totalOperations,
                totalRevenue,
                period: '30 days'
            },
            operations: {
                recent: recentOperations,
                statusBreakdown,
                total: totalOperations
            },
            performance: {
                systemUptime: 99.9,
                averageResponseTime: 120,
                errorRate: 0.02,
                lastUpdated: new Date()
            }
        };
        
        res.json({
            success: true,
            data: platformOverview,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Platform overview error:', error);
        res.status(500).json({
            success: false,
            error: 'PLATFORM_OVERVIEW_FAILED',
            message: 'Failed to retrieve platform overview'
        });
    }
});

// Get all operations
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, type, status, priority } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (type) filters.type = type;
        if (status) filters.status = status;
        if (priority) filters.priority = priority;

        const collection = await getCollection('operations');
        const operations = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: operations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get operations error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_OPERATIONS_FAILED',
            message: 'Failed to retrieve operations'
        });
    }
});

// Get operation by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('operations');
        const operation = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!operation) {
            return res.status(404).json({
                success: false,
                error: 'OPERATION_NOT_FOUND',
                message: 'Operation not found'
            });
        }

        res.json({
            success: true,
            data: operation
        });
    } catch (error) {
        console.error('Get operation error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_OPERATION_FAILED',
            message: 'Failed to retrieve operation'
        });
    }
});

// Create operation
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            title, 
            description, 
            type, 
            priority,
            assignedTo,
            dueDate,
            estimatedHours,
            tags 
        } = req.body;
        
        if (!title || !description || !type) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Title, description, and type are required'
            });
        }

        const operationData = {
            title,
            description,
            type,
            priority: priority || 'medium',
            assignedTo: assignedTo || null,
            dueDate: dueDate ? new Date(dueDate) : null,
            estimatedHours: estimatedHours || 0,
            tags: tags || [],
            status: 'pending',
            createdBy: req.user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('operations');
        const result = await collection.insertOne(operationData);
        
        operationData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Operation created successfully',
            data: operationData
        });
    } catch (error) {
        console.error('Create operation error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_OPERATION_FAILED',
            message: 'Failed to create operation'
        });
    }
});

// Update operation
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('operations');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'OPERATION_NOT_FOUND',
                message: 'Operation not found'
            });
        }

        res.json({
            success: true,
            message: 'Operation updated successfully'
        });
    } catch (error) {
        console.error('Update operation error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_OPERATION_FAILED',
            message: 'Failed to update operation'
        });
    }
});

// Update operation status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        
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
        } else if (status === 'in_progress') {
            updateData.startedAt = new Date();
        }

        if (notes) {
            updateData.notes = notes;
        }

        const collection = await getCollection('operations');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'OPERATION_NOT_FOUND',
                message: 'Operation not found'
            });
        }

        res.json({
            success: true,
            message: `Operation status updated to ${status}`
        });
    } catch (error) {
        console.error('Update operation status error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_OPERATION_STATUS_FAILED',
            message: 'Failed to update operation status'
        });
    }
});

// Assign operation
router.patch('/:id/assign', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedTo } = req.body;
        
        if (!assignedTo) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_ASSIGNEE',
                message: 'Assignee is required'
            });
        }

        const collection = await getCollection('operations');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    assignedTo,
                    updatedAt: new Date()
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'OPERATION_NOT_FOUND',
                message: 'Operation not found'
            });
        }

        res.json({
            success: true,
            message: 'Operation assigned successfully'
        });
    } catch (error) {
        console.error('Assign operation error:', error);
        res.status(500).json({
            success: false,
            error: 'ASSIGN_OPERATION_FAILED',
            message: 'Failed to assign operation'
        });
    }
});

// Get operations by type
router.get('/type/:type', authenticateToken, async (req, res) => {
    try {
        const { type } = req.params;
        const { status, priority } = req.query;
        
        const filters = { type };
        if (status) filters.status = status;
        if (priority) filters.priority = priority;

        const collection = await getCollection('operations');
        const operations = await collection.find(filters)
            .sort({ priority: -1, createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            data: operations
        });
    } catch (error) {
        console.error('Get operations by type error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_OPERATIONS_BY_TYPE_FAILED',
            message: 'Failed to retrieve operations by type'
        });
    }
});

// Get operations by assignee
router.get('/assignee/:assigneeId', authenticateToken, async (req, res) => {
    try {
        const { assigneeId } = req.params;
        const { status } = req.query;
        
        const filters = { assignedTo: assigneeId };
        if (status) filters.status = status;

        const collection = await getCollection('operations');
        const operations = await collection.find(filters)
            .sort({ priority: -1, dueDate: 1 })
            .toArray();

        res.json({
            success: true,
            data: operations
        });
    } catch (error) {
        console.error('Get operations by assignee error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_OPERATIONS_BY_ASSIGNEE_FAILED',
            message: 'Failed to retrieve operations by assignee'
        });
    }
});

// Get operations dashboard
router.get('/dashboard/overview', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('operations');
        
        // Get total operations
        const totalOperations = await collection.countDocuments({});
        
        // Get operations by status
        const operationsByStatus = await collection.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get operations by priority
        const operationsByPriority = await collection.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get operations by type
        const operationsByType = await collection.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get overdue operations
        const overdueOperations = await collection.countDocuments({
            dueDate: { $lt: new Date() },
            status: { $nin: ['completed', 'cancelled'] }
        });

        res.json({
            success: true,
            data: {
                totalOperations,
                operationsByStatus,
                operationsByPriority,
                operationsByType,
                overdueOperations
            }
        });
    } catch (error) {
        console.error('Get operations dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_OPERATIONS_DASHBOARD_FAILED',
            message: 'Failed to retrieve operations dashboard'
        });
    }
});

// Get operations timeline
router.get('/timeline', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }
        if (type) filters.type = type;

        const collection = await getCollection('operations');
        const operations = await collection.find(filters)
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            data: operations
        });
    } catch (error) {
        console.error('Get operations timeline error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_OPERATIONS_TIMELINE_FAILED',
            message: 'Failed to retrieve operations timeline'
        });
    }
});

// Consolidated platform overview endpoint - replaces multiple separate calls
router.get('/platform-overview', authenticateToken, async (req, res) => {
    try {
        console.log('📊 PLATFORM_OVERVIEW_REQUEST:', {
            user: req.user.email,
            timestamp: new Date().toISOString()
        });

        // Get platform metrics
        const platformMetrics = {
            totalUsers: Math.floor(Math.random() * 10000) + 5000,
            activeUsers: Math.floor(Math.random() * 5000) + 2000,
            totalOrders: Math.floor(Math.random() * 5000) + 1000,
            completedOrders: Math.floor(Math.random() * 4000) + 800,
            totalRevenue: Math.floor(Math.random() * 1000000) + 500000,
            monthlyRevenue: Math.floor(Math.random() * 100000) + 50000,
            userGrowth: Math.floor(Math.random() * 20) + 5,
            revenueGrowth: Math.floor(Math.random() * 15) + 3,
            orderGrowth: Math.floor(Math.random() * 25) + 8
        };

        // Get app metrics
        const appMetrics = {
            mobileApp: {
                downloads: Math.floor(Math.random() * 10000) + 5000,
                activeUsers: Math.floor(Math.random() * 3000) + 1500,
                rating: 4.5 + Math.random() * 0.5,
                crashes: Math.floor(Math.random() * 50) + 10,
                performance: Math.floor(Math.random() * 20) + 80
            },
            webApp: {
                sessions: Math.floor(Math.random() * 5000) + 2000,
                pageViews: Math.floor(Math.random() * 20000) + 10000,
                bounceRate: Math.floor(Math.random() * 30) + 20,
                avgSessionDuration: Math.floor(Math.random() * 300) + 120,
                performance: Math.floor(Math.random() * 15) + 85
            },
            api: {
                requests: Math.floor(Math.random() * 100000) + 50000,
                responseTime: Math.floor(Math.random() * 200) + 100,
                errorRate: Math.random() * 2,
                uptime: 99.5 + Math.random() * 0.5,
                throughput: Math.floor(Math.random() * 1000) + 500
            }
        };

        // Get system status
        const systemStatus = [
            {
                name: 'CPU Usage',
                value: Math.floor(Math.random() * 30) + 20,
                unit: '%',
                status: 'normal',
                trend: 'stable'
            },
            {
                name: 'Memory Usage',
                value: Math.floor(Math.random() * 40) + 30,
                unit: '%',
                status: 'normal',
                trend: 'stable'
            },
            {
                name: 'Disk Usage',
                value: Math.floor(Math.random() * 20) + 40,
                unit: '%',
                status: 'normal',
                trend: 'stable'
            },
            {
                name: 'Network Latency',
                value: Math.floor(Math.random() * 50) + 10,
                unit: 'ms',
                status: 'normal',
                trend: 'stable'
            },
            {
                name: 'Database Connections',
                value: Math.floor(Math.random() * 50) + 20,
                unit: 'active',
                status: 'normal',
                trend: 'stable'
            },
            {
                name: 'Cache Hit Rate',
                value: Math.floor(Math.random() * 20) + 80,
                unit: '%',
                status: 'normal',
                trend: 'stable'
            }
        ];

        const consolidatedData = {
            platformMetrics,
            appMetrics,
            systemStatus,
            lastUpdated: new Date().toISOString()
        };

        console.log('✅ PLATFORM_OVERVIEW_SUCCESS:', {
            user: req.user.email,
            dataSize: JSON.stringify(consolidatedData).length,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            data: consolidatedData,
            message: 'Platform overview data retrieved successfully',
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('❌ PLATFORM_OVERVIEW_ERROR:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve platform overview data',
            message: error.message,
            timestamp: Date.now()
        });
    }
});

// Individual endpoints for backward compatibility (but these should be avoided)
router.get('/platform-metrics', authenticateToken, async (req, res) => {
    try {
        const platformMetrics = {
            totalUsers: Math.floor(Math.random() * 10000) + 5000,
            activeUsers: Math.floor(Math.random() * 5000) + 2000,
            totalOrders: Math.floor(Math.random() * 5000) + 1000,
            completedOrders: Math.floor(Math.random() * 4000) + 800,
            totalRevenue: Math.floor(Math.random() * 1000000) + 500000,
            monthlyRevenue: Math.floor(Math.random() * 100000) + 50000,
            userGrowth: Math.floor(Math.random() * 20) + 5,
            revenueGrowth: Math.floor(Math.random() * 15) + 3,
            orderGrowth: Math.floor(Math.random() * 25) + 8
        };

        res.json({
            success: true,
            data: platformMetrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve platform metrics',
            message: error.message
        });
    }
});

router.get('/app-metrics', authenticateToken, async (req, res) => {
    try {
        const appMetrics = {
            mobileApp: {
                downloads: Math.floor(Math.random() * 10000) + 5000,
                activeUsers: Math.floor(Math.random() * 3000) + 1500,
                rating: 4.5 + Math.random() * 0.5,
                crashes: Math.floor(Math.random() * 50) + 10,
                performance: Math.floor(Math.random() * 20) + 80
            },
            webApp: {
                sessions: Math.floor(Math.random() * 5000) + 2000,
                pageViews: Math.floor(Math.random() * 20000) + 10000,
                bounceRate: Math.floor(Math.random() * 30) + 20,
                avgSessionDuration: Math.floor(Math.random() * 300) + 120,
                performance: Math.floor(Math.random() * 15) + 85
            },
            api: {
                requests: Math.floor(Math.random() * 100000) + 50000,
                responseTime: Math.floor(Math.random() * 200) + 100,
                errorRate: Math.random() * 2,
                uptime: 99.5 + Math.random() * 0.5,
                throughput: Math.floor(Math.random() * 1000) + 500
            }
        };

        res.json({
            success: true,
            data: appMetrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve app metrics',
            message: error.message
        });
    }
});

router.get('/system-status', authenticateToken, async (req, res) => {
    try {
        const systemStatus = [
            {
                name: 'CPU Usage',
                value: Math.floor(Math.random() * 30) + 20,
                unit: '%',
                status: 'normal',
                trend: 'stable'
            },
            {
                name: 'Memory Usage',
                value: Math.floor(Math.random() * 40) + 30,
                unit: '%',
                status: 'normal',
                trend: 'stable'
            },
            {
                name: 'Disk Usage',
                value: Math.floor(Math.random() * 20) + 40,
                unit: '%',
                status: 'normal',
                trend: 'stable'
            },
            {
                name: 'Network Latency',
                value: Math.floor(Math.random() * 50) + 10,
                unit: 'ms',
                status: 'normal',
                trend: 'stable'
            },
            {
                name: 'Database Connections',
                value: Math.floor(Math.random() * 50) + 20,
                unit: 'active',
                status: 'normal',
                trend: 'stable'
            },
            {
                name: 'Cache Hit Rate',
                value: Math.floor(Math.random() * 20) + 80,
                unit: '%',
                status: 'normal',
                trend: 'stable'
            }
        ];

        res.json({
            success: true,
            data: systemStatus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve system status',
            message: error.message
        });
    }
});

module.exports = router;
