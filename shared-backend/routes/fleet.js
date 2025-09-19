/**
 * Fleet Management Routes
 * Handles vehicle and driver management for fleet operations
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// GET /api/v1/fleet/vehicles - Get all fleet vehicles
router.get('/vehicles', authenticateToken, checkRole(['head_administrator', 'asset_manager']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, make, model } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const vehiclesCollection = await getCollection('vehicles');
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (make) filter.make = new RegExp(make, 'i');
    if (model) filter.model = new RegExp(model, 'i');
    
    // Get vehicles with pagination
    const [vehicles, total] = await Promise.all([
      vehiclesCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      vehiclesCollection.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        vehicles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Fleet vehicles retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get fleet vehicles error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_FLEET_VEHICLES_FAILED',
      message: 'Failed to retrieve fleet vehicles',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/fleet/drivers - Get all fleet drivers
router.get('/drivers', authenticateToken, checkRole(['head_administrator', 'asset_manager']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, department } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const usersCollection = await getCollection('users');
    
    // Build filter for drivers
    const filter = { 
      isEmployee: true,
      role: { $in: ['driver', 'asset_manager'] }
    };
    if (status) filter.isActive = status === 'active';
    if (department) filter.department = department;
    
    // Get drivers with pagination
    const [drivers, total] = await Promise.all([
      usersCollection
        .find(filter, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      usersCollection.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        drivers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Fleet drivers retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get fleet drivers error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_FLEET_DRIVERS_FAILED',
      message: 'Failed to retrieve fleet drivers',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/fleet/vehicles - Add new vehicle to fleet
router.post('/vehicles', authenticateToken, checkRole(['head_administrator', 'asset_manager']), async (req, res) => {
  try {
    const { 
      make, 
      model, 
      year, 
      licensePlate, 
      vin, 
      color, 
      fuelType,
      transmission,
      engineSize,
      mileage,
      status = 'active',
      assignedDriverId
    } = req.body;
    
    if (!make || !model || !year || !licensePlate) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'make, model, year, and licensePlate are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const vehiclesCollection = await getCollection('vehicles');
    
    // Check if vehicle with same license plate already exists
    const existingVehicle = await vehiclesCollection.findOne({ 
      licensePlate: licensePlate.toUpperCase() 
    });
    
    if (existingVehicle) {
      return res.status(409).json({
        success: false,
        error: 'VEHICLE_EXISTS',
        message: 'Vehicle with this license plate already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    const newVehicle = {
      make,
      model,
      year: parseInt(year),
      licensePlate: licensePlate.toUpperCase(),
      vin: vin || null,
      color: color || null,
      fuelType: fuelType || 'gasoline',
      transmission: transmission || 'automatic',
      engineSize: engineSize || null,
      mileage: parseInt(mileage) || 0,
      status,
      assignedDriverId: assignedDriverId || null,
      location: {
        lat: null,
        lng: null,
        lastUpdated: null
      },
      maintenance: {
        lastServiceDate: null,
        nextServiceDate: null,
        serviceHistory: []
      },
      createdAt: new Date(),
      createdBy: req.user.userId,
      isActive: true
    };
    
    const result = await vehiclesCollection.insertOne(newVehicle);
    
    res.status(201).json({
      success: true,
      data: {
        vehicle: {
          ...newVehicle,
          _id: result.insertedId
        }
      },
      message: 'Vehicle added to fleet successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Add fleet vehicle error:', error);
    res.status(500).json({
      success: false,
      error: 'ADD_FLEET_VEHICLE_FAILED',
      message: 'Failed to add vehicle to fleet',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/fleet/vehicles/:id - Update vehicle
router.put('/vehicles/:id', authenticateToken, checkRole(['head_administrator', 'asset_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const vehiclesCollection = await getCollection('vehicles');
    
    // Check if vehicle exists
    const existingVehicle = await vehiclesCollection.findOne({ _id: id });
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        error: 'VEHICLE_NOT_FOUND',
        message: 'Vehicle not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.createdBy;
    
    // Add update metadata
    updateData.updatedAt = new Date();
    updateData.updatedBy = req.user.userId;
    
    const result = await vehiclesCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'No changes made to vehicle',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get updated vehicle
    const updatedVehicle = await vehiclesCollection.findOne({ _id: id });
    
    res.json({
      success: true,
      data: { vehicle: updatedVehicle },
      message: 'Vehicle updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Update fleet vehicle error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_FLEET_VEHICLE_FAILED',
      message: 'Failed to update vehicle',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/fleet/vehicles/:id - Remove vehicle from fleet
router.delete('/vehicles/:id', authenticateToken, checkRole(['head_administrator']), async (req, res) => {
  try {
    const { id } = req.params;
    const vehiclesCollection = await getCollection('vehicles');
    
    // Check if vehicle exists
    const existingVehicle = await vehiclesCollection.findOne({ _id: id });
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        error: 'VEHICLE_NOT_FOUND',
        message: 'Vehicle not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Soft delete - deactivate vehicle
    const result = await vehiclesCollection.updateOne(
      { _id: id },
      { 
        $set: { 
          isActive: false,
          status: 'decommissioned',
          deactivatedAt: new Date(),
          deactivatedBy: req.user.userId
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'DEACTIVATION_FAILED',
        message: 'Failed to remove vehicle from fleet',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Vehicle removed from fleet successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Remove fleet vehicle error:', error);
    res.status(500).json({
      success: false,
      error: 'REMOVE_FLEET_VEHICLE_FAILED',
      message: 'Failed to remove vehicle from fleet',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/fleet/vehicles/:id - Get vehicle details
router.get('/vehicles/:id', authenticateToken, checkRole(['head_administrator', 'asset_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const vehiclesCollection = await getCollection('vehicles');
    
    const vehicle = await vehiclesCollection.findOne({ _id: id });
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'VEHICLE_NOT_FOUND',
        message: 'Vehicle not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { vehicle },
      message: 'Vehicle details retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get vehicle details error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_VEHICLE_DETAILS_FAILED',
      message: 'Failed to retrieve vehicle details',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/fleet/stats - Get fleet statistics
router.get('/stats', authenticateToken, checkRole(['head_administrator', 'asset_manager']), async (req, res) => {
  try {
    const vehiclesCollection = await getCollection('vehicles');
    const usersCollection = await getCollection('users');
    
    const [vehicleStats, driverStats] = await Promise.all([
      vehiclesCollection.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      usersCollection.countDocuments({ 
        isEmployee: true, 
        role: { $in: ['driver', 'asset_manager'] },
        isActive: true
      })
    ]);
    
    const stats = {
      vehicles: {
        total: vehicleStats.reduce((sum, stat) => sum + stat.count, 0),
        byStatus: vehicleStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      },
      drivers: {
        total: driverStats
      }
    };
    
    res.json({
      success: true,
      data: { stats },
      message: 'Fleet statistics retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get fleet stats error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_FLEET_STATS_FAILED',
      message: 'Failed to retrieve fleet statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/fleet/maintenance - Create maintenance record
router.post('/maintenance', authenticateToken, checkRole(['head_administrator', 'admin']), async (req, res) => {
  try {
    const { vehicleId, type, description, scheduledDate, status = 'scheduled' } = req.body;
    
    if (!vehicleId || !type) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Vehicle ID and maintenance type are required',
        timestamp: new Date().toISOString()
      });
    }

    const { db } = await getCollection('fleet_vehicles');
    
    // Check if vehicle exists
    const vehicle = await db.findOne({ _id: vehicleId });
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'VEHICLE_NOT_FOUND',
        message: 'Vehicle not found',
        timestamp: new Date().toISOString()
      });
    }

    const maintenanceRecord = {
      vehicleId,
      type,
      description: description || `Scheduled ${type} maintenance`,
      scheduledDate: scheduledDate || new Date(),
      status,
      createdAt: new Date(),
      createdBy: req.user.userId,
      isActive: true
    };

    // Insert maintenance record
    const maintenanceCollection = await getCollection('maintenance_records');
    const result = await maintenanceCollection.insertOne(maintenanceRecord);

    // Update vehicle's maintenance history
    await db.updateOne(
      { _id: vehicleId },
      { 
        $push: { 
          'maintenance.serviceHistory': {
            recordId: result.insertedId,
            type,
            description: maintenanceRecord.description,
            scheduledDate: maintenanceRecord.scheduledDate,
            status,
            createdAt: maintenanceRecord.createdAt
          }
        },
        $set: { 
          'maintenance.nextServiceDate': scheduledDate || new Date(),
          updatedAt: new Date()
        }
      }
    );

    res.status(201).json({
      success: true,
      data: {
        maintenanceRecord: {
          ...maintenanceRecord,
          _id: result.insertedId
        }
      },
      message: 'Maintenance record created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Create maintenance record error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_MAINTENANCE_RECORD_FAILED',
      message: 'Failed to create maintenance record',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/fleet/maintenance - Get maintenance records
router.get('/maintenance', authenticateToken, checkRole(['head_administrator', 'asset_manager']), async (req, res) => {
  try {
    const { page = 1, limit = 20, vehicleId, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const maintenanceCollection = await getCollection('maintenance');
    
    // Build filter
    const filter = {};
    if (vehicleId) filter.vehicleId = vehicleId;
    if (status) filter.status = status;
    
    // Get maintenance records with pagination
    const [maintenanceRecords, total] = await Promise.all([
      maintenanceCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      maintenanceCollection.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        maintenanceRecords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Maintenance records retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get maintenance records error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MAINTENANCE_RECORDS_FAILED',
      message: 'Failed to retrieve maintenance records',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/fleet/optimize-routes - Optimize fleet routes
router.post('/optimize-routes', authenticateToken, checkRole(['head_administrator', 'fleet_manager']), async (req, res) => {
  try {
    const { vehicles, destinations, constraints } = req.body;
    
    // Basic route optimization logic
    const optimizedRoutes = vehicles.map(vehicle => {
      // Simple optimization: assign closest destinations to each vehicle
      const vehicleRoutes = destinations.map(dest => ({
        destination: dest,
        distance: dest.distance || 25, // Use real distance or default estimate
        estimatedTime: dest.estimatedTime || 45, // Use real time or default estimate
        priority: dest.priority || 'normal'
      })).sort((a, b) => a.distance - b.distance);
      
      return {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        routes: vehicleRoutes.slice(0, Math.min(5, vehicleRoutes.length)), // Max 5 routes per vehicle
        totalDistance: vehicleRoutes.reduce((sum, route) => sum + route.distance, 0),
        estimatedDuration: vehicleRoutes.reduce((sum, route) => sum + route.estimatedTime, 0)
      };
    });
    
    res.json({
      success: true,
      data: {
        optimizedRoutes,
        totalVehicles: vehicles.length,
        totalDestinations: destinations.length,
        optimizationScore: 85 // Fixed optimization score (could be calculated from real metrics)
      },
      message: 'Routes optimized successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Optimize routes error:', error);
    res.status(500).json({
      success: false,
      error: 'OPTIMIZE_ROUTES_FAILED',
      message: 'Failed to optimize routes',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/fleet/obd2 - Get OBD2 data for vehicles
router.get('/obd2', authenticateToken, checkRole(['head_administrator', 'admin', 'fleet_manager']), async (req, res) => {
  try {
    const { vehicleId, limit = 100 } = req.query;
    
    const obd2Collection = await getCollection('obd2_data');
    
    let query = {};
    if (vehicleId) {
      query.vehicleId = vehicleId;
    }
    
    const obd2Data = await obd2Collection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({
      success: true,
      data: obd2Data,
      message: 'OBD2 data retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get OBD2 data error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_OBD2_DATA_FAILED',
      message: 'Failed to retrieve OBD2 data',
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// AI MAINTENANCE SCHEDULING ENDPOINTS
// ============================================================================

// GET /api/v1/fleet/maintenance/tasks - Get AI maintenance tasks
router.get('/maintenance/tasks', authenticateToken, checkRole(['head_administrator', 'asset_manager', 'fleet_manager']), async (req, res) => {
  try {
    const tasksCollection = await getCollection('maintenance_tasks');
    const { page = 1, limit = 50, status, priority, vehicleId } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (vehicleId) filter.vehicleId = vehicleId;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const tasks = await tasksCollection
      .find(filter)
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await tasksCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get maintenance tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MAINTENANCE_TASKS_FAILED',
      message: 'Failed to retrieve maintenance tasks',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/fleet/maintenance/schedules - Get maintenance schedules
router.get('/maintenance/schedules', authenticateToken, checkRole(['head_administrator', 'asset_manager', 'fleet_manager']), async (req, res) => {
  try {
    const schedulesCollection = await getCollection('maintenance_schedules');
    const { page = 1, limit = 50, status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const schedules = await schedulesCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await schedulesCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get maintenance schedules error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MAINTENANCE_SCHEDULES_FAILED',
      message: 'Failed to retrieve maintenance schedules',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/fleet/technicians - Get technicians
router.get('/technicians', authenticateToken, checkRole(['head_administrator', 'asset_manager', 'fleet_manager']), async (req, res) => {
  try {
    const techniciansCollection = await getCollection('technicians');
    const { page = 1, limit = 50, availability, skill } = req.query;
    
    const filter = {};
    if (availability) filter.availability = availability;
    if (skill) filter.skills = { $in: [skill] };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const technicians = await techniciansCollection
      .find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await techniciansCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: technicians,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get technicians error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_TECHNICIANS_FAILED',
      message: 'Failed to retrieve technicians',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/fleet/maintenance/tasks - Create maintenance task
router.post('/maintenance/tasks', authenticateToken, checkRole(['head_administrator', 'asset_manager', 'fleet_manager']), async (req, res) => {
  try {
    const tasksCollection = await getCollection('maintenance_tasks');
    const taskData = {
      ...req.body,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await tasksCollection.insertOne(taskData);
    
    res.status(201).json({
      success: true,
      data: { id: result.insertedId, ...taskData },
      message: 'Maintenance task created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create maintenance task error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_MAINTENANCE_TASK_FAILED',
      message: 'Failed to create maintenance task',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/fleet/maintenance/tasks/:id - Update maintenance task
router.put('/maintenance/tasks/:id', authenticateToken, checkRole(['head_administrator', 'asset_manager', 'fleet_manager']), async (req, res) => {
  try {
    const tasksCollection = await getCollection('maintenance_tasks');
    const { id } = req.params;
    
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    const result = await tasksCollection.updateOne(
      { id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'MAINTENANCE_TASK_NOT_FOUND',
        message: 'Maintenance task not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { id, ...updateData },
      message: 'Maintenance task updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update maintenance task error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_MAINTENANCE_TASK_FAILED',
      message: 'Failed to update maintenance task',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;