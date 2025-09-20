const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const { ObjectId } = require('mongodb');

// Helper to generate mock fleet locations (for development/testing)
const generateMockFleetLocations = (count = 15) => {
  const locations = [];
  const types = ['vehicle', 'driver', 'depot'];
  const statuses = ['active', 'idle', 'maintenance', 'offline'];

  for (let i = 0; i < count; i++) {
    locations.push({
      _id: new ObjectId(),
      id: `fleet-${i + 1}`,
      name: `Vehicle ${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      lat: 40.7128 + (Math.random() - 0.5) * 0.1, // NYC area
      lng: -74.0060 + (Math.random() - 0.5) * 0.1,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      speed: Math.floor(Math.random() * 80),
      fuel: Math.floor(Math.random() * 100),
      lastUpdate: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
      revenue: Math.floor(Math.random() * 500) + 100,
      passengers: Math.floor(Math.random() * 8)
    });
  }
  return locations;
};

// Helper to generate mock revenue hotspots (for development/testing)
const generateMockRevenueHotspots = (count = 10) => {
  const hotspots = [];
  const categories = ['commercial', 'residential', 'airport', 'station'];
  const trends = ['up', 'down', 'stable'];

  for (let i = 0; i < count; i++) {
    hotspots.push({
      _id: new ObjectId(),
      id: `hotspot-${i + 1}`,
      name: `Location ${i + 1}`,
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.0060 + (Math.random() - 0.5) * 0.1,
      revenue: Math.floor(Math.random() * 10000) + 1000,
      trend: trends[Math.floor(Math.random() * trends.length)],
      transactions: Math.floor(Math.random() * 100) + 10,
      avgTicket: Math.floor(Math.random() * 50) + 10,
      category: categories[Math.floor(Math.random() * categories.length)]
    });
  }
  return hotspots;
};

// Helper to generate mock user activities (for development/testing)
const generateMockUserActivities = (count = 20) => {
  const activities = [];
  const statuses = ['online', 'offline', 'busy'];
  const roles = ['driver', 'manager', 'admin', 'operator'];
  const tasks = ['driving', 'monitoring', 'maintenance', 'dispatch', 'reporting'];

  for (let i = 0; i < count; i++) {
    activities.push({
      _id: new ObjectId(),
      id: `user-${i + 1}`,
      name: `User ${i + 1}`,
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.0060 + (Math.random() - 0.5) * 0.1,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lastSeen: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
      role: roles[Math.floor(Math.random() * roles.length)],
      currentTask: Math.random() > 0.3 ? tasks[Math.floor(Math.random() * tasks.length)] : null
    });
  }
  return activities;
};

// GET fleet locations
router.get('/fleet-locations', authenticateToken, checkRole(['head_administrator', 'fleet_manager', 'operations_manager']), async (req, res) => {
  try {
    const locationsCollection = await getCollection('fleet_locations');
    if (!locationsCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const locations = await locationsCollection.find({}).toArray();

    if (locations.length === 0) {
      // Seed with mock data if collection is empty
      const mockLocations = generateMockFleetLocations();
      await locationsCollection.insertMany(mockLocations);
      return res.json({ success: true, data: mockLocations, message: 'Mock Fleet Locations retrieved successfully' });
    }

    res.json({ success: true, data: locations, message: 'Fleet Locations retrieved successfully' });
  } catch (error) {
    console.error('Get fleet locations error:', error);
    res.status(500).json({ success: false, error: 'GET_LOCATIONS_FAILED', message: 'Failed to get fleet locations' });
  }
});

// GET revenue hotspots
router.get('/revenue-hotspots', authenticateToken, checkRole(['head_administrator', 'finance_manager', 'operations_manager']), async (req, res) => {
  try {
    const hotspotsCollection = await getCollection('revenue_hotspots');
    if (!hotspotsCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const hotspots = await hotspotsCollection.find({}).toArray();

    if (hotspots.length === 0) {
      // Seed with mock data if collection is empty
      const mockHotspots = generateMockRevenueHotspots();
      await hotspotsCollection.insertMany(mockHotspots);
      return res.json({ success: true, data: mockHotspots, message: 'Mock Revenue Hotspots retrieved successfully' });
    }

    res.json({ success: true, data: hotspots, message: 'Revenue Hotspots retrieved successfully' });
  } catch (error) {
    console.error('Get revenue hotspots error:', error);
    res.status(500).json({ success: false, error: 'GET_HOTSPOTS_FAILED', message: 'Failed to get revenue hotspots' });
  }
});

// GET live user activities
router.get('/user-activities', authenticateToken, checkRole(['head_administrator', 'hr_manager', 'operations_manager']), async (req, res) => {
  try {
    const activitiesCollection = await getCollection('user_activities');
    if (!activitiesCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const activities = await activitiesCollection.find({}).toArray();

    if (activities.length === 0) {
      // Seed with mock data if collection is empty
      const mockActivities = generateMockUserActivities();
      await activitiesCollection.insertMany(mockActivities);
      return res.json({ success: true, data: mockActivities, message: 'Mock User Activities retrieved successfully' });
    }

    res.json({ success: true, data: activities, message: 'User Activities retrieved successfully' });
  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({ success: false, error: 'GET_ACTIVITIES_FAILED', message: 'Failed to get user activities' });
  }
});

module.exports = router;
