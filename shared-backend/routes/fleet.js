const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Fleet = require('../models/Fleet');
const FleetVehicle = require('../models/FleetVehicle');
const Driver = require('../models/driver');
const TelematicsData = require('../models/telematicsData');
const { getCollection } = require('../config/database');
const { requireRole } = require('../middleware/auth');
const { ObjectId } = require('mongodb');
const { logger } = require('../config/logger');

// ==================== TEST ENDPOINTS (MUST BE FIRST) ====================

// Simple test endpoint without authentication - MUST BE FIRST
router.get('/health-check', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Fleet health check endpoint working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Fleet health check error:', error);
    res.status(500).json({
      success: false,
      error: 'HEALTH_CHECK_ERROR',
      message: error.message
    });
  }
});

// Test endpoint for debugging - MUST BE SECOND
router.get('/test', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Fleet test endpoint working',
      user: {
        id: req.user.id,
        tenantId: req.user.tenantId,
        organization: req.user.organization
      }
    });
  } catch (error) {
    console.error('Fleet test error:', error);
    res.status(500).json({
      success: false,
      error: 'TEST_ERROR',
      message: error.message
    });
  }
});

// ==================== MAIN FLEET ROUTES ====================

// Get all fleets
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Use tenantId instead of organization to match the Fleet model
    const fleets = await Fleet.find({ tenantId: req.user.tenantId || req.user.organization })
      .populate('vehicles.vehicleId')
      .populate('vehicles.assignedDriver')
      .populate('manager');
    
    res.json({
      success: true,
      data: fleets,
      count: fleets.length
    });
  } catch (error) {
    logger.error('Error fetching fleets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fleets',
      error: error.message
    });
  }
});

// Get single fleet
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const fleet = await Fleet.findById(req.params.id)
      .populate('vehicles.vehicleId')
      .populate('vehicles.assignedDriver')
      .populate('manager');
    
    if (!fleet) {
      return res.status(404).json({
        success: false,
        message: 'Fleet not found'
      });
    }
    
    res.json({
      success: true,
      data: fleet
    });
  } catch (error) {
    logger.error('Error fetching fleet:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fleet',
      error: error.message
    });
  }
});

// Create new fleet
router.post('/', authenticateToken, async (req, res) => {
  try {
    const fleetData = {
      ...req.body,
      tenantId: req.user.tenantId || req.user.organization,
      manager: req.user.id
    };
    
    const fleet = new Fleet(fleetData);
    await fleet.save();
    
    res.status(201).json({
      success: true,
      data: fleet,
      message: 'Fleet created successfully'
    });
  } catch (error) {
    logger.error('Error creating fleet:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating fleet',
      error: error.message
    });
  }
});

// Update fleet
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const fleet = await Fleet.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!fleet) {
      return res.status(404).json({
        success: false,
        message: 'Fleet not found'
      });
    }
    
    res.json({
      success: true,
      data: fleet,
      message: 'Fleet updated successfully'
    });
  } catch (error) {
    logger.error('Error updating fleet:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating fleet',
      error: error.message
    });
  }
});

// Delete fleet
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const fleet = await Fleet.findByIdAndDelete(req.params.id);
    
    if (!fleet) {
      return res.status(404).json({
        success: false,
        message: 'Fleet not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Fleet deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting fleet',
      error: error.message
    });
  }
});

// Get fleet analytics
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const fleet = await Fleet.findById(req.params.id);
    if (!fleet) {
      return res.status(404).json({
        success: false,
        message: 'Fleet not found'
      });
    }
    
    // Get telematics data for the fleet
    const telematicsData = await TelematicsData.find({
      vehicle: { $in: fleet.vehicles }
    }).sort({ timestamp: -1 }).limit(1000);
    
    // Calculate analytics
    const analytics = {
      totalVehicles: fleet.vehicles.length,
      activeVehicles: telematicsData.filter(t => t.status === 'active').length,
      totalDistance: telematicsData.reduce((sum, t) => sum + (t.distance || 0), 0),
      averageSpeed: telematicsData.reduce((sum, t) => sum + (t.speed || 0), 0) / telematicsData.length,
      fuelEfficiency: telematicsData.reduce((sum, t) => sum + (t.fuelEfficiency || 0), 0) / telematicsData.length,
      maintenanceAlerts: telematicsData.filter(t => t.maintenanceRequired).length
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fleet analytics',
      error: error.message
    });
  }
});

// Get fleet vehicles
router.get('/:id/vehicles', authenticateToken, async (req, res) => {
  try {
    const fleet = await Fleet.findById(req.params.id).populate('vehicles');
    if (!fleet) {
      return res.status(404).json({
        success: false,
        message: 'Fleet not found'
      });
    }
    
    res.json({
      success: true,
      data: fleet.vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fleet vehicles',
      error: error.message
    });
  }
});

// Add vehicle to fleet
router.post('/:id/vehicles', authenticateToken, async (req, res) => {
  try {
    const fleet = await Fleet.findById(req.params.id);
    if (!fleet) {
      return res.status(404).json({
        success: false,
        message: 'Fleet not found'
      });
    }
    
    const vehicle = new FleetVehicle({
      ...req.body,
      fleet: fleet._id,
      organization: req.user.organization
    });
    
    await vehicle.save();
    
    fleet.vehicles.push(vehicle._id);
    await fleet.save();
    
    res.status(201).json({
      success: true,
      data: vehicle,
      message: 'Vehicle added to fleet successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding vehicle to fleet',
      error: error.message
    });
  }
});

// Get fleet drivers
router.get('/:id/drivers', authenticateToken, async (req, res) => {
  try {
    const fleet = await Fleet.findById(req.params.id).populate('drivers');
    if (!fleet) {
      return res.status(404).json({
        success: false,
        message: 'Fleet not found'
      });
    }
    
    res.json({
      success: true,
      data: fleet.drivers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fleet drivers',
      error: error.message
    });
  }
});

// Add driver to fleet
router.post('/:id/drivers', authenticateToken, async (req, res) => {
  try {
    const fleet = await Fleet.findById(req.params.id);
    if (!fleet) {
      return res.status(404).json({
        success: false,
        message: 'Fleet not found'
      });
    }
    
    const driver = new Driver({
      ...req.body,
      fleet: fleet._id,
      organization: req.user.organization
    });
    
    await driver.save();
    
    fleet.drivers.push(driver._id);
    await fleet.save();
    
    res.status(201).json({
      success: true,
      data: driver,
      message: 'Driver added to fleet successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding driver to fleet',
      error: error.message
    });
  }
});

// ==================== FLEET ROUTES MANAGEMENT ====================

// Get fleet routes
router.get('/routes', authenticateToken, requireRole(['admin', 'fleet_manager']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, vehicleId, driverId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filters = {};
    if (status) filters.status = status;
    if (vehicleId) filters.assignedVehicle = vehicleId;
    if (driverId) filters.assignedDriver = driverId;

    const routesCollection = await getCollection('fleet_routes');
    const routes = await routesCollection.find(filters)
      .sort({ lastUsed: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await routesCollection.countDocuments(filters);

    res.json({
      success: true,
      data: routes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting fleet routes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get fleet routes',
      message: error.message 
    });
  }
});

// Create fleet route
router.post('/routes', authenticateToken, requireRole(['admin', 'fleet_manager']), async (req, res) => {
  try {
    const {
      name,
      startLocation,
      endLocation,
      distance,
      estimatedTime,
      assignedVehicle,
      assignedDriver,
      stops,
      fuelCost
    } = req.body;

    const route = {
      name,
      startLocation,
      endLocation,
      distance: parseFloat(distance),
      estimatedTime: parseInt(estimatedTime),
      status: 'active',
      assignedVehicle,
      assignedDriver,
      stops: parseInt(stops || 0),
      fuelCost: parseFloat(fuelCost || 0),
      lastUsed: new Date(),
      createdAt: new Date(),
      createdBy: req.user.id
    };

    const routesCollection = await getCollection('fleet_routes');
    const result = await routesCollection.insertOne(route);

    res.status(201).json({
      success: true,
      data: { ...route, _id: result.insertedId }
    });
  } catch (error) {
    logger.error('Error creating fleet route:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create fleet route',
      message: error.message 
    });
  }
});

// Update fleet route
router.put('/routes/:id', authenticateToken, requireRole(['admin', 'fleet_manager']), async (req, res) => {
  try {
    const routesCollection = await getCollection('fleet_routes');
    const result = await routesCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date(), updatedBy: req.user.id } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Fleet route not found'
      });
    }

    res.json({
      success: true,
      message: 'Fleet route updated successfully'
    });
  } catch (error) {
    logger.error('Error updating fleet route:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update fleet route',
      message: error.message 
    });
  }
});

// Delete fleet route
router.delete('/routes/:id', authenticateToken, requireRole(['admin', 'fleet_manager']), async (req, res) => {
  try {
    const routesCollection = await getCollection('fleet_routes');
    const result = await routesCollection.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Fleet route not found'
      });
    }

    res.json({
      success: true,
      message: 'Fleet route deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting fleet route:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete fleet route',
      message: error.message 
    });
  }
});

// ==================== FLEET MAINTENANCE ====================

// Get maintenance records
router.get('/maintenance', authenticateToken, requireRole(['admin', 'fleet_manager']), async (req, res) => {
  try {
    const { page = 1, limit = 10, vehicleId, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filters = {};
    if (vehicleId) filters.vehicleId = vehicleId;
    if (status) filters.status = status;
    if (type) filters.type = type;

    const maintenanceCollection = await getCollection('fleet_maintenance');
    const records = await maintenanceCollection.find(filters)
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await maintenanceCollection.countDocuments(filters);

    res.json({
      success: true,
      data: records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting maintenance records:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get maintenance records',
      message: error.message 
    });
  }
});

// Create maintenance record
router.post('/maintenance', authenticateToken, requireRole(['admin', 'fleet_manager']), async (req, res) => {
  try {
    const {
      vehicleId,
      vehicleName,
      type,
      description,
      scheduledDate,
      estimatedCost,
      assignedMechanic,
      priority
    } = req.body;

    const record = {
      vehicleId,
      vehicleName,
      type,
      description,
      scheduledDate: new Date(scheduledDate),
      estimatedCost: parseFloat(estimatedCost || 0),
      assignedMechanic,
      priority: priority || 'medium',
      status: 'scheduled',
      createdAt: new Date(),
      createdBy: req.user.id
    };

    const maintenanceCollection = await getCollection('fleet_maintenance');
    const result = await maintenanceCollection.insertOne(record);

    res.status(201).json({
      success: true,
      data: { ...record, _id: result.insertedId }
    });
  } catch (error) {
    logger.error('Error creating maintenance record:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create maintenance record',
      message: error.message 
    });
  }
});

// Update maintenance record
router.put('/maintenance/:id', authenticateToken, requireRole(['admin', 'fleet_manager']), async (req, res) => {
  try {
    const maintenanceCollection = await getCollection('fleet_maintenance');
    const result = await maintenanceCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date(), updatedBy: req.user.id } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Maintenance record updated successfully'
    });
  } catch (error) {
    logger.error('Error updating maintenance record:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update maintenance record',
      message: error.message 
    });
  }
});

// ==================== FLEET DRIVERS ====================

// Get fleet drivers
router.get('/drivers', authenticateToken, requireRole(['admin', 'fleet_manager']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, licenseType } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filters = {};
    if (status) filters.status = status;
    if (licenseType) filters.licenseType = licenseType;

    const driversCollection = await getCollection('fleet_drivers');
    const drivers = await driversCollection.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await driversCollection.countDocuments(filters);

    res.json({
      success: true,
      data: drivers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting fleet drivers:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get fleet drivers',
      message: error.message 
    });
  }
});

// Create fleet driver
router.post('/drivers', authenticateToken, requireRole(['admin', 'fleet_manager']), async (req, res) => {
  try {
    const {
      name,
      licenseNumber,
      licenseType,
      licenseExpiry,
      phone,
      email,
      address,
      emergencyContact
    } = req.body;

    const driver = {
      name,
      licenseNumber,
      licenseType,
      licenseExpiry: new Date(licenseExpiry),
      phone,
      email,
      address,
      emergencyContact,
      status: 'active',
      createdAt: new Date(),
      createdBy: req.user.id
    };

    const driversCollection = await getCollection('fleet_drivers');
    const result = await driversCollection.insertOne(driver);

    res.status(201).json({
      success: true,
      data: { ...driver, _id: result.insertedId }
    });
  } catch (error) {
    logger.error('Error creating fleet driver:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create fleet driver',
      message: error.message 
    });
  }
});

// Update fleet driver
router.put('/drivers/:id', authenticateToken, requireRole(['admin', 'fleet_manager']), async (req, res) => {
  try {
    const driversCollection = await getCollection('fleet_drivers');
    const result = await driversCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date(), updatedBy: req.user.id } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Fleet driver not found'
      });
    }

    res.json({
      success: true,
      message: 'Fleet driver updated successfully'
    });
  } catch (error) {
    logger.error('Error updating fleet driver:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update fleet driver',
      message: error.message 
    });
  }
});

module.exports = router;
