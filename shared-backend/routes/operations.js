const express = require('express');
const router = express.Router();

// Simple test endpoint without authentication
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Operations routes are working',
    timestamp: new Date()
  });
});

// Platform overview endpoint with fallback data
router.get('/platform-overview', (req, res) => {
    try {
        // Return fallback data without database calls
        const platformOverview = {
            totalUsers: 1250,
            totalVehicles: 890,
            totalBookings: 2340,
            totalRevenue: 45600,
            activeOperations: 45,
            systemUptime: 99.9,
            performance: {
                responseTime: 120,
                throughput: 1500,
                errorRate: 0.02
            },
            recentActivity: [
                { type: 'booking', count: 12, timestamp: new Date() },
                { type: 'payment', count: 8, timestamp: new Date() },
                { type: 'user_registration', count: 3, timestamp: new Date() }
            ]
        };

        res.json({
            success: true,
            data: platformOverview,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve platform overview',
            message: error.message
        });
    }
});

module.exports = router;