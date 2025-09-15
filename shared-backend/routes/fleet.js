/**
 * Fleet Management Routes
 * Handles vehicle and driver management for fleet operations
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/v1/fleet/vehicles - Get all fleet vehicles
router.get('/vehicles', authenticateToken, requireRole(['admin', 'fleet_manager']), async (req, res) => {
  try {
    // Mock fleet vehicles data
    const vehicles = [
      {
        id: 'vehicle-001',
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        licensePlate: 'ABC-123',
        status: 'active',
        driverId: 'driver-001',
        location: {
          lat: 25.2048,
          lng: 55.2708
        },
        lastServiceDate: '2024-01-15',
        nextServiceDate: '2024-04-15'
      },
      {
        id: 'vehicle-002',
        make: 'Honda',
        model: 'Civic',
        year: 2022,
        licensePlate: 'XYZ-789',
        status: 'maintenance',
        driverId: 'driver-002',
        location: {
          lat: 25.2048,
          lng: 55.2708
        },
        lastServiceDate: '2024-02-01',
        nextServiceDate: '2024-05-01'
      }
    ];

    res.json({
      success: true,
      data: vehicles,
      message: 'Fleet vehicles retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Fleet vehicles error:', error);
    res.status(500).json({
      success: false,
      error: 'FLEET_VEHICLES_ERROR',
      message: 'Failed to retrieve fleet vehicles',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/fleet/drivers - Get all fleet drivers
router.get('/drivers', authenticateToken, requireRole(['admin', 'fleet_manager']), async (req, res) => {
  try {
    // Mock fleet drivers data
    const drivers = [
      {
        id: 'driver-001',
        name: 'Ahmed Al-Rashid',
        email: 'ahmed@clutch.com',
        phone: '+971501234567',
        licenseNumber: 'DL-123456',
        status: 'active',
        vehicleId: 'vehicle-001',
        rating: 4.8,
        totalTrips: 150,
        joinDate: '2023-01-15'
      },
      {
        id: 'driver-002',
        name: 'Mohammed Hassan',
        email: 'mohammed@clutch.com',
        phone: '+971507654321',
        licenseNumber: 'DL-789012',
        status: 'on_break',
        vehicleId: 'vehicle-002',
        rating: 4.6,
        totalTrips: 120,
        joinDate: '2023-03-20'
      }
    ];

    res.json({
      success: true,
      data: drivers,
      message: 'Fleet drivers retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Fleet drivers error:', error);
    res.status(500).json({
      success: false,
      error: 'FLEET_DRIVERS_ERROR',
      message: 'Failed to retrieve fleet drivers',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/fleet/analytics - Get fleet analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'fleet_manager']), async (req, res) => {
  try {
    const analytics = {
      totalVehicles: 25,
      activeVehicles: 22,
      maintenanceVehicles: 3,
      totalDrivers: 30,
      activeDrivers: 28,
      onBreakDrivers: 2,
      totalTrips: 1250,
      completedTrips: 1200,
      cancelledTrips: 50,
      averageRating: 4.7,
      revenue: 125000,
      fuelCost: 15000,
      maintenanceCost: 8000
    };

    res.json({
      success: true,
      data: analytics,
      message: 'Fleet analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Fleet analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'FLEET_ANALYTICS_ERROR',
      message: 'Failed to retrieve fleet analytics',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
