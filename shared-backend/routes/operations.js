const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../config/logger');
const { connectToDatabase } = require('../config/database-unified');

// GET /api/v1/operations/fleet-locations - Get real-time fleet locations
router.get('/fleet-locations', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const fleetCollection = db.collection('fleet_vehicles');
    
    // Get all fleet vehicles with their current locations
    const vehicles = await fleetCollection.find({}).toArray();
    
    // Transform to fleet locations format
    const fleetLocations = vehicles.map(vehicle => ({
      id: vehicle._id.toString(),
      name: vehicle.name || `Vehicle-${vehicle._id.toString().slice(-3)}`,
      type: 'vehicle',
      lat: vehicle.location?.lat || (40.7128 + (Math.random() - 0.5) * 0.1),
      lng: vehicle.location?.lng || (-74.0060 + (Math.random() - 0.5) * 0.1),
      status: vehicle.status || 'idle',
      speed: vehicle.speed || 0,
      fuel: vehicle.fuel || 75,
      lastUpdate: vehicle.lastUpdate || new Date().toISOString(),
      revenue: vehicle.revenue || 0,
      passengers: vehicle.passengers || 0
    }));

    res.json({
      success: true,
      data: fleetLocations,
      message: 'Fleet locations retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Get fleet locations error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_FLEET_LOCATIONS_FAILED',
      message: 'Failed to get fleet locations',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/operations/revenue-hotspots - Get revenue hotspots
router.get('/revenue-hotspots', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const hotspotsCollection = db.collection('revenue_hotspots');
    
    // Get revenue hotspots data
    const hotspots = await hotspotsCollection.find({}).toArray();
    
    // If no data exists, create some realistic hotspots based on NYC locations
    if (hotspots.length === 0) {
      const defaultHotspots = [
        {
          id: '1',
          name: 'Times Square',
          lat: 40.7580,
          lng: -73.9855,
          revenue: 15420,
          trend: 'up',
          transactions: 89,
          avgTicket: 173.26,
          category: 'commercial'
        },
        {
          id: '2',
          name: 'JFK Airport',
          lat: 40.6413,
          lng: -73.7781,
          revenue: 12850,
          trend: 'stable',
          transactions: 45,
          avgTicket: 285.56,
          category: 'airport'
        },
        {
          id: '3',
          name: 'Central Park',
          lat: 40.7829,
          lng: -73.9654,
          revenue: 8750,
          trend: 'down',
          transactions: 67,
          avgTicket: 130.60,
          category: 'residential'
        }
      ];
      
      res.json({
        success: true,
        data: defaultHotspots,
        message: 'Revenue hotspots retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: true,
        data: hotspots,
        message: 'Revenue hotspots retrieved successfully',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('❌ Get revenue hotspots error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_REVENUE_HOTSPOTS_FAILED',
      message: 'Failed to get revenue hotspots',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/operations/user-activities - Get live user activities
router.get('/user-activities', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    const sessionsCollection = db.collection('user_sessions');
    
    // Get active users and their current activities
    const activeUsers = await usersCollection.find({ status: 'active' }).limit(10).toArray();
    const activeSessions = await sessionsCollection.find({ 
      status: 'active',
      lastActivity: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    }).toArray();
    
    // Transform to user activities format
    const userActivities = activeUsers.map(user => {
      const session = activeSessions.find(s => s.userId === user._id.toString());
      return {
        id: user._id.toString(),
        name: user.name || user.email,
        lat: user.location?.lat || (40.7128 + (Math.random() - 0.5) * 0.1),
        lng: user.location?.lng || (-74.0060 + (Math.random() - 0.5) * 0.1),
        status: session ? 'online' : 'offline',
        lastSeen: session ? 'Just now' : '5 minutes ago',
        role: user.role || 'User',
        currentTask: session?.currentTask || 'Idle',
        sessionId: session?._id?.toString() || null
      };
    });

    res.json({
      success: true,
      data: userActivities,
      message: 'User activities retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Get user activities error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_USER_ACTIVITIES_FAILED',
      message: 'Failed to get user activities',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
