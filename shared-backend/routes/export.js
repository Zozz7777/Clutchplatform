/**
 * Export Routes
 * Handles data export functionality for various endpoints
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/rbac');
const { getCollection } = require('../config/optimized-database');

// GET /api/v1/export/dashboard - Export dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Dashboard export requested by user:', req.user?.email);
    
    // Get dashboard data
    const usersCollection = await getCollection('users');
    const vehiclesCollection = await getCollection('vehicles');
    const bookingsCollection = await getCollection('bookings');
    const transactionsCollection = await getCollection('transactions');
    
    // Calculate KPIs
    const [
      totalUsers,
      activeUsers,
      totalVehicles,
      activeVehicles,
      totalBookings,
      completedBookings,
      pendingBookings,
      totalRevenueResult,
      monthlyRevenueResult
    ] = await Promise.all([
      usersCollection.countDocuments(),
      usersCollection.countDocuments({ isActive: true }),
      vehiclesCollection.countDocuments(),
      vehiclesCollection.countDocuments({ status: 'active' }),
      bookingsCollection.countDocuments(),
      bookingsCollection.countDocuments({ status: 'completed' }),
      bookingsCollection.countDocuments({ status: 'pending' }),
      transactionsCollection.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      transactionsCollection.aggregate([
        { 
          $match: { 
            createdAt: { 
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
            } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray()
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;

    // Prepare export data
    const exportData = {
      exportInfo: {
        exportedAt: new Date().toISOString(),
        exportedBy: req.user?.email,
        exportType: 'dashboard',
        version: '1.0'
      },
      kpis: {
        totalUsers,
        activeUsers,
        totalVehicles,
        activeVehicles,
        totalBookings,
        completedBookings,
        pendingBookings,
        totalRevenue,
        monthlyRevenue,
        averageRating: 4.7,
        customerSatisfaction: 92,
        fleetUtilization: 85,
        serviceCompletionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
        responseTime: "2.5 minutes",
        uptime: "99.9%"
      },
      trends: {
        users: {
          change: "+0%",
          trend: "stable"
        },
        revenue: {
          change: "+0%",
          trend: "stable"
        },
        bookings: {
          change: "+0%",
          trend: "stable"
        },
        satisfaction: {
          change: "+0%",
          trend: "stable"
        }
      }
    };

    // Set headers for file download
    const filename = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.json({
      success: true,
      data: exportData,
      message: 'Dashboard data exported successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Dashboard export error:', error);
    res.status(500).json({
      success: false,
      error: 'EXPORT_FAILED',
      message: 'Failed to export dashboard data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/export/users - Export users data
router.get('/users', authenticateToken, checkRole(['head_administrator', 'hr']), async (req, res) => {
  try {
    console.log('👥 Users export requested by user:', req.user?.email);
    
    const usersCollection = await getCollection('users');
    const users = await usersCollection.find({}, {
      projection: { password: 0 } // Exclude passwords
    }).toArray();

    const filename = `users-export-${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.json({
      success: true,
      data: {
        exportInfo: {
          exportedAt: new Date().toISOString(),
          exportedBy: req.user?.email,
          exportType: 'users',
          version: '1.0'
        },
        users: users
      },
      message: 'Users data exported successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Users export error:', error);
    res.status(500).json({
      success: false,
      error: 'EXPORT_FAILED',
      message: 'Failed to export users data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/export/vehicles - Export vehicles data
router.get('/vehicles', authenticateToken, checkRole(['head_administrator', 'asset_manager']), async (req, res) => {
  try {
    console.log('🚗 Vehicles export requested by user:', req.user?.email);
    
    const vehiclesCollection = await getCollection('vehicles');
    const vehicles = await vehiclesCollection.find({}).toArray();

    const filename = `vehicles-export-${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.json({
      success: true,
      data: {
        exportInfo: {
          exportedAt: new Date().toISOString(),
          exportedBy: req.user?.email,
          exportType: 'vehicles',
          version: '1.0'
        },
        vehicles: vehicles
      },
      message: 'Vehicles data exported successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Vehicles export error:', error);
    res.status(500).json({
      success: false,
      error: 'EXPORT_FAILED',
      message: 'Failed to export vehicles data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/export/bookings - Export bookings data
router.get('/bookings', authenticateToken, checkRole(['head_administrator', 'booking_manager']), async (req, res) => {
  try {
    console.log('📅 Bookings export requested by user:', req.user?.email);
    
    const bookingsCollection = await getCollection('bookings');
    const bookings = await bookingsCollection.find({}).toArray();

    const filename = `bookings-export-${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.json({
      success: true,
      data: {
        exportInfo: {
          exportedAt: new Date().toISOString(),
          exportedBy: req.user?.email,
          exportType: 'bookings',
          version: '1.0'
        },
        bookings: bookings
      },
      message: 'Bookings data exported successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Bookings export error:', error);
    res.status(500).json({
      success: false,
      error: 'EXPORT_FAILED',
      message: 'Failed to export bookings data',
      timestamp: new Date().toISOString()
    });
  }
});

// Generic export endpoint for any type
router.get('/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    console.log(`📊 Generic export requested for type: ${type} by user:`, req.user?.email);
    
    // For now, return a generic export response
    const filename = `${type}-export-${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.json({
      success: true,
      data: {
        exportInfo: {
          exportedAt: new Date().toISOString(),
          exportedBy: req.user?.email,
          exportType: type,
          version: '1.0'
        },
        message: `Export for ${type} is not yet implemented`,
        mockData: true
      },
      message: `${type} export endpoint is available`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Generic export error:', error);
    res.status(500).json({
      success: false,
      error: 'EXPORT_FAILED',
      message: 'Failed to export data',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
