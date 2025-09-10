const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');

// Consolidated dashboard endpoint (for frontend compatibility)
router.get('/consolidated', authenticateToken, async (req, res) => {
    try {
        console.log('📊 CONSOLIDATED_DASHBOARD_REQUEST:', {
            user: req.user.email,
            timestamp: new Date().toISOString()
        });

        // Get collections
        const usersCollection = await getCollection('users');
        const bookingsCollection = await getCollection('bookings');
        const paymentsCollection = await getCollection('payments');

        // Get current date and last 30 days
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        // Get comprehensive metrics
        const [
            totalUsers,
            activeUsers,
            totalRevenue,
            monthlyRevenue,
            totalOrders,
            completedOrders
        ] = await Promise.all([
            usersCollection.countDocuments(),
            usersCollection.countDocuments({ lastActive: { $gte: thirtyDaysAgo } }),
            paymentsCollection.aggregate([
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]).toArray(),
            paymentsCollection.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]).toArray(),
            bookingsCollection.countDocuments(),
            bookingsCollection.countDocuments({ status: 'completed' })
        ]);

        const consolidatedData = {
            metrics: {
                totalUsers: totalUsers || 0,
                activeUsers: activeUsers || 0,
                totalRevenue: totalRevenue[0]?.total || 0,
                monthlyRevenue: monthlyRevenue[0]?.total || 0,
                totalOrders: totalOrders || 0,
                completedOrders: completedOrders || 0,
                completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0
            },
            charts: {
                revenue: {
                    labels: ['Last 7 days', 'Last 30 days', 'Last 90 days'],
                    data: [monthlyRevenue[0]?.total || 0, monthlyRevenue[0]?.total || 0, totalRevenue[0]?.total || 0]
                },
                users: {
                    labels: ['Total Users', 'Active Users'],
                    data: [totalUsers || 0, activeUsers || 0]
                }
            },
            recentActivity: [],
            systemHealth: {
                status: 'healthy',
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                timestamp: new Date()
            }
        };

        res.json({
            success: true,
            data: consolidatedData,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('❌ CONSOLIDATED_DASHBOARD_ERROR:', error);
        res.status(500).json({
            success: false,
            error: 'DASHBOARD_ERROR',
            message: 'Failed to fetch consolidated dashboard data',
            details: error.message
        });
    }
});

// Dashboard metrics endpoint
router.get('/metrics', authenticateToken, async (req, res) => {
    try {
        console.log('📊 DASHBOARD_METRICS_REQUEST:', {
            user: req.user.email,
            timestamp: new Date().toISOString()
        });

        // Get collections
        const usersCollection = await getCollection('users');
        const bookingsCollection = await getCollection('bookings');
        const paymentsCollection = await getCollection('payments');

        // Get current date and last 30 days
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        // Get metrics
        const [
            totalUsers,
            activeUsers,
            totalRevenue,
            monthlyRevenue,
            totalOrders,
            completedOrders
        ] = await Promise.all([
            usersCollection.countDocuments(),
            usersCollection.countDocuments({ lastActive: { $gte: thirtyDaysAgo } }),
            paymentsCollection.aggregate([
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]).toArray(),
            paymentsCollection.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]).toArray(),
            bookingsCollection.countDocuments(),
            bookingsCollection.countDocuments({ status: 'completed' })
        ]);

        const metrics = {
            totalUsers: totalUsers || 0,
            activeUsers: activeUsers || 0,
            totalRevenue: totalRevenue[0]?.total || 0,
            monthlyRevenue: monthlyRevenue[0]?.total || 0,
            totalOrders: totalOrders || 0,
            completedOrders: completedOrders || 0,
            systemHealth: 99.2,
            lastUpdated: new Date().toISOString()
        };

        res.json({
            success: true,
            data: metrics,
            message: 'Dashboard metrics retrieved successfully',
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Dashboard metrics error:', error);
        res.status(500).json({
            success: false,
            error: 'DASHBOARD_METRICS_FAILED',
            message: 'Failed to retrieve dashboard metrics'
        });
    }
});

// Recent activities endpoint
router.get('/recent-activities', authenticateToken, async (req, res) => {
    try {
        console.log('📊 RECENT_ACTIVITIES_REQUEST:', {
            user: req.user.email,
            timestamp: new Date().toISOString()
        });

        // Get collections
        const usersCollection = await getCollection('users');
        const bookingsCollection = await getCollection('bookings');
        const paymentsCollection = await getCollection('payments');

        // Get recent activities
        const recentActivities = await Promise.all([
            usersCollection.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .toArray(),
            bookingsCollection.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .toArray(),
            paymentsCollection.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .toArray()
        ]);

        const activities = [
            ...recentActivities[0].map(user => ({
                id: user._id.toString(),
                type: 'user_registration',
                description: 'New user registered',
                timestamp: user.createdAt,
                user: user.email,
                metadata: { source: 'web' }
            })),
            ...recentActivities[1].map(booking => ({
                id: booking._id.toString(),
                type: 'booking_created',
                description: 'New booking created',
                timestamp: booking.createdAt,
                user: booking.customerEmail,
                metadata: { bookingId: booking._id, amount: booking.totalAmount }
            })),
            ...recentActivities[2].map(payment => ({
                id: payment._id.toString(),
                type: 'payment_completed',
                description: 'Payment completed',
                timestamp: payment.createdAt,
                user: payment.customerEmail,
                metadata: { amount: payment.amount, method: payment.method }
            }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

        res.json({
            success: true,
            data: activities,
            message: 'Recent activities retrieved successfully',
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Recent activities error:', error);
        res.status(500).json({
            success: false,
            error: 'RECENT_ACTIVITIES_FAILED',
            message: 'Failed to retrieve recent activities'
        });
    }
});

// Dashboard Overview - Main dashboard data
router.get('/overview', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Get collections
        const usersCollection = await getCollection('users');
        const vehiclesCollection = await getCollection('vehicles');
        const bookingsCollection = await getCollection('bookings');
        const paymentsCollection = await getCollection('payments');
        const supportTicketsCollection = await getCollection('support_tickets');
        const analyticsCollection = await getCollection('user_analytics');

        // Get current date and last 30 days
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        // Aggregate data based on user role
        let dashboardData = {};

        if (userRole === 'admin' || userRole === 'manager') {
            // Admin/Manager Dashboard
            const [
                totalUsers,
                totalVehicles,
                totalBookings,
                totalRevenue,
                activeBookings,
                pendingTickets,
                monthlyGrowth
            ] = await Promise.all([
                usersCollection.countDocuments(),
                vehiclesCollection.countDocuments(),
                bookingsCollection.countDocuments(),
                paymentsCollection.aggregate([
                    { $match: { status: 'completed' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]).toArray(),
                bookingsCollection.countDocuments({ 
                    status: { $in: ['confirmed', 'in_progress'] },
                    createdAt: { $gte: thirtyDaysAgo }
                }),
                supportTicketsCollection.countDocuments({ status: 'open' }),
                analyticsCollection.aggregate([
                    { $match: { date: { $gte: thirtyDaysAgo } } },
                    { $group: { _id: null, total: { $sum: 1 } } }
                ]).toArray()
            ]);

            dashboardData = {
                summary: {
                    totalUsers,
                    totalVehicles,
                    totalBookings,
                    totalRevenue: totalRevenue[0]?.total || 0,
                    activeBookings,
                    pendingTickets
                },
                trends: {
                    monthlyGrowth: monthlyGrowth[0]?.total || 0,
                    userGrowth: await getGrowthRate(usersCollection, 'createdAt', thirtyDaysAgo),
                    revenueGrowth: await getGrowthRate(paymentsCollection, 'createdAt', thirtyDaysAgo)
                },
                recentActivity: await getRecentActivity(bookingsCollection, paymentsCollection, supportTicketsCollection),
                topMetrics: await getTopMetrics(bookingsCollection, paymentsCollection, vehiclesCollection)
            };
        } else {
            // Regular User Dashboard
            const [
                userVehicles,
                userBookings,
                userPayments,
                userTickets
            ] = await Promise.all([
                vehiclesCollection.countDocuments({ userId }),
                bookingsCollection.countDocuments({ userId }),
                paymentsCollection.aggregate([
                    { $match: { userId, status: 'completed' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]).toArray(),
                supportTicketsCollection.countDocuments({ userId, status: 'open' })
            ]);

            dashboardData = {
                summary: {
                    totalVehicles: userVehicles,
                    totalBookings: userBookings,
                    totalSpent: userPayments[0]?.total || 0,
                    openTickets: userTickets
                },
                recentBookings: await getRecentUserBookings(bookingsCollection, userId),
                vehicleHealth: await getVehicleHealth(vehiclesCollection, userId),
                upcomingServices: await getUpcomingServices(bookingsCollection, vehiclesCollection, userId)
            };
        }

        res.json({
            success: true,
            data: dashboardData,
            timestamp: now.toISOString()
        });

    } catch (error) {
        logger.error('Dashboard overview error:', error);
        res.status(500).json({
            success: false,
            error: 'DASHBOARD_ERROR',
            message: 'Failed to load dashboard data'
        });
    }
});

// Helper function to calculate growth rate
async function getGrowthRate(collection, dateField, startDate) {
    try {
        const currentPeriod = await collection.countDocuments({ [dateField]: { $gte: startDate } });
        const previousPeriod = await collection.countDocuments({ 
            [dateField]: { 
                $gte: new Date(startDate.getTime() - (30 * 24 * 60 * 60 * 1000)),
                $lt: startDate 
            } 
        });

        if (previousPeriod === 0) return currentPeriod > 0 ? 100 : 0;
        return ((currentPeriod - previousPeriod) / previousPeriod) * 100;
    } catch (error) {
        return 0;
    }
}

// Helper function to get recent activity
async function getRecentActivity(bookingsCollection, paymentsCollection, ticketsCollection) {
    try {
        const [recentBookings, recentPayments, recentTickets] = await Promise.all([
            bookingsCollection.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .toArray(),
            paymentsCollection.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .toArray(),
            ticketsCollection.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .toArray()
        ]);

        return {
            bookings: recentBookings,
            payments: recentPayments,
            tickets: recentTickets
        };
    } catch (error) {
        return { bookings: [], payments: [], tickets: [] };
    }
}

// Helper function to get top metrics
async function getTopMetrics(bookingsCollection, paymentsCollection, vehiclesCollection) {
    try {
        const [topServices, topRevenue, popularVehicles] = await Promise.all([
            bookingsCollection.aggregate([
                { $group: { _id: '$serviceType', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]).toArray(),
            paymentsCollection.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: '$serviceType', total: { $sum: '$amount' } } },
                { $sort: { total: -1 } },
                { $limit: 5 }
            ]).toArray(),
            vehiclesCollection.aggregate([
                { $group: { _id: '$brand', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]).toArray()
        ]);

        return {
            topServices,
            topRevenue,
            popularVehicles
        };
    } catch (error) {
        return { topServices: [], topRevenue: [], popularVehicles: [] };
    }
}

// Helper function to get recent user bookings
async function getRecentUserBookings(bookingsCollection, userId) {
    try {
        return await bookingsCollection.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();
    } catch (error) {
        return [];
    }
}

// Helper function to get vehicle health
async function getVehicleHealth(vehiclesCollection, userId) {
    try {
        const vehicles = await vehiclesCollection.find({ userId }).toArray();
        return vehicles.map(vehicle => ({
            id: vehicle._id,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            health: vehicle.health || 85,
            lastService: vehicle.lastService,
            nextService: vehicle.nextService
        }));
    } catch (error) {
        return [];
    }
}

// Helper function to get upcoming services
async function getUpcomingServices(bookingsCollection, vehiclesCollection, userId) {
    try {
        const upcoming = await bookingsCollection.find({
            userId,
            status: { $in: ['confirmed', 'scheduled'] },
            scheduledDate: { $gte: new Date() }
        }).sort({ scheduledDate: 1 }).limit(5).toArray();

        return upcoming;
    } catch (error) {
        return [];
    }
}

module.exports = router;
