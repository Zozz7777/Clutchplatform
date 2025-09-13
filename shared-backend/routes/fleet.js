const express = require('express');
const router = express.Router();
const { logger } = require('../config/logger');

// Simple authentication middleware (non-blocking)
const simpleAuth = (req, res, next) => {
  // For now, just set a mock user
  req.user = { 
    id: 'test-user', 
    role: 'user',
    tenantId: 'test-tenant',
    organization: 'test-org'
  };
  next();
};

// Fleet health check endpoint
router.get('/health-check', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Fleet health check endpoint working',
      timestamp: new Date().toISOString(),
      service: 'fleet'
    });
  } catch (error) {
    logger.error('Fleet health check error:', error);
    res.status(500).json({
      success: false,
      error: 'HEALTH_CHECK_ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get all fleets
router.get('/', simpleAuth, async (req, res) => {
  try {
    const fleets = [
      {
        id: 'fleet-1',
        name: 'Main Fleet',
        description: 'Primary vehicle fleet',
        status: 'active',
        vehicleCount: 25,
        createdAt: new Date().toISOString()
      },
      {
        id: 'fleet-2',
        name: 'Delivery Fleet',
        description: 'Delivery vehicles',
        status: 'active',
        vehicleCount: 15,
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: fleets,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching fleets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fleets',
      timestamp: new Date().toISOString()
    });
  }
});

// Get fleet by ID
router.get('/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const fleet = {
      id: id,
      name: `Fleet ${id}`,
      description: 'Fleet description',
      status: 'active',
      vehicleCount: Math.floor(Math.random() * 50) + 10,
      createdAt: new Date().toISOString(),
      vehicles: [],
      drivers: []
    };
    
    res.json({
      success: true,
      data: fleet,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching fleet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fleet',
      timestamp: new Date().toISOString()
    });
  }
});

// Create new fleet
router.post('/', simpleAuth, async (req, res) => {
  try {
    const { name, description, status } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Fleet name is required',
        timestamp: new Date().toISOString()
      });
    }

    const fleet = {
      id: `fleet-${Date.now()}`,
      name,
      description: description || '',
      status: status || 'active',
      vehicleCount: 0,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'Fleet created successfully',
      data: fleet,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating fleet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create fleet',
      timestamp: new Date().toISOString()
    });
  }
});

// Update fleet
router.put('/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    
    const fleet = {
      id: id,
      name: name || `Fleet ${id}`,
      description: description || 'Updated fleet description',
      status: status || 'active',
      vehicleCount: Math.floor(Math.random() * 50) + 10,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Fleet updated successfully',
      data: fleet,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating fleet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update fleet',
      timestamp: new Date().toISOString()
    });
  }
});

// Delete fleet
router.delete('/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      message: `Fleet ${id} deleted successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting fleet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete fleet',
      timestamp: new Date().toISOString()
    });
  }
});

// Get fleet analytics
router.get('/:id/analytics', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const analytics = {
      fleetId: id,
      totalVehicles: Math.floor(Math.random() * 50) + 10,
      activeVehicles: Math.floor(Math.random() * 40) + 5,
      maintenanceDue: Math.floor(Math.random() * 10),
      fuelEfficiency: Math.floor(Math.random() * 20) + 15,
      totalMileage: Math.floor(Math.random() * 100000) + 50000,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching fleet analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fleet analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// Get fleet vehicles
router.get('/:id/vehicles', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const vehicles = [
      {
        id: 'vehicle-1',
        fleetId: id,
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        licensePlate: 'ABC-123',
        status: 'active',
        mileage: 25000
      },
      {
        id: 'vehicle-2',
        fleetId: id,
        make: 'Honda',
        model: 'Civic',
        year: 2021,
        licensePlate: 'XYZ-789',
        status: 'maintenance',
        mileage: 30000
      }
    ];
    
    res.json({
      success: true,
      data: vehicles,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching fleet vehicles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fleet vehicles',
      timestamp: new Date().toISOString()
    });
  }
});

// Add vehicle to fleet
router.post('/:id/vehicles', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { make, model, year, licensePlate } = req.body;
    
    if (!make || !model || !year || !licensePlate) {
      return res.status(400).json({
        success: false,
        error: 'All vehicle fields are required',
        timestamp: new Date().toISOString()
      });
    }

    const vehicle = {
      id: `vehicle-${Date.now()}`,
      fleetId: id,
      make,
      model,
      year,
      licensePlate,
      status: 'active',
      mileage: 0,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'Vehicle added to fleet successfully',
      data: vehicle,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error adding vehicle to fleet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add vehicle to fleet',
      timestamp: new Date().toISOString()
    });
  }
});

// Get fleet drivers
router.get('/:id/drivers', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const drivers = [
      {
        id: 'driver-1',
        fleetId: id,
        name: 'John Doe',
        licenseNumber: 'DL123456',
        status: 'active',
        experience: '5 years'
      },
      {
        id: 'driver-2',
        fleetId: id,
        name: 'Jane Smith',
        licenseNumber: 'DL789012',
        status: 'active',
        experience: '3 years'
      }
    ];
    
    res.json({
      success: true,
      data: drivers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching fleet drivers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fleet drivers',
      timestamp: new Date().toISOString()
    });
  }
});

// Add driver to fleet
router.post('/:id/drivers', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, licenseNumber, experience } = req.body;
    
    if (!name || !licenseNumber) {
      return res.status(400).json({
        success: false,
        error: 'Driver name and license number are required',
        timestamp: new Date().toISOString()
      });
    }

    const driver = {
      id: `driver-${Date.now()}`,
      fleetId: id,
      name,
      licenseNumber,
      experience: experience || '0 years',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'Driver added to fleet successfully',
      data: driver,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error adding driver to fleet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add driver to fleet',
      timestamp: new Date().toISOString()
    });
  }
});

// Get fleet routes
router.get('/routes', simpleAuth, async (req, res) => {
  try {
    const routes = [
      {
        id: 'route-1',
        name: 'Downtown Route',
        description: 'Main downtown delivery route',
        distance: 25.5,
        estimatedTime: 45,
        status: 'active'
      },
      {
        id: 'route-2',
        name: 'Suburban Route',
        description: 'Suburban delivery route',
        distance: 35.2,
        estimatedTime: 60,
        status: 'active'
      }
    ];
    
    res.json({
      success: true,
      data: routes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching fleet routes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fleet routes',
      timestamp: new Date().toISOString()
    });
  }
});

// Create fleet route
router.post('/routes', simpleAuth, async (req, res) => {
  try {
    const { name, description, distance, estimatedTime } = req.body;
    
    if (!name || !distance || !estimatedTime) {
      return res.status(400).json({
        success: false,
        error: 'Route name, distance, and estimated time are required',
        timestamp: new Date().toISOString()
      });
    }

    const route = {
      id: `route-${Date.now()}`,
      name,
      description: description || '',
      distance: parseFloat(distance),
      estimatedTime: parseInt(estimatedTime),
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'Fleet route created successfully',
      data: route,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating fleet route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create fleet route',
      timestamp: new Date().toISOString()
    });
  }
});

// Update fleet route
router.put('/routes/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, distance, estimatedTime, status } = req.body;
    
    const route = {
      id: id,
      name: name || `Route ${id}`,
      description: description || 'Updated route description',
      distance: distance || 25.0,
      estimatedTime: estimatedTime || 45,
      status: status || 'active',
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Fleet route updated successfully',
      data: route,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating fleet route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update fleet route',
      timestamp: new Date().toISOString()
    });
  }
});

// Delete fleet route
router.delete('/routes/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      message: `Fleet route ${id} deleted successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting fleet route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete fleet route',
      timestamp: new Date().toISOString()
    });
  }
});

// Get fleet maintenance
router.get('/maintenance', simpleAuth, async (req, res) => {
  try {
    const maintenance = [
      {
        id: 'maintenance-1',
        vehicleId: 'vehicle-1',
        type: 'Oil Change',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
        cost: 50.00
      },
      {
        id: 'maintenance-2',
        vehicleId: 'vehicle-2',
        type: 'Brake Inspection',
        scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
        cost: 150.00
      }
    ];
    
    res.json({
      success: true,
      data: maintenance,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching fleet maintenance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fleet maintenance',
      timestamp: new Date().toISOString()
    });
  }
});

// Create fleet maintenance
router.post('/maintenance', simpleAuth, async (req, res) => {
  try {
    const { vehicleId, type, scheduledDate, cost } = req.body;
    
    if (!vehicleId || !type || !scheduledDate) {
      return res.status(400).json({
        success: false,
        error: 'Vehicle ID, type, and scheduled date are required',
        timestamp: new Date().toISOString()
      });
    }

    const maintenance = {
      id: `maintenance-${Date.now()}`,
      vehicleId,
      type,
      scheduledDate: new Date(scheduledDate).toISOString(),
      cost: cost || 0,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'Fleet maintenance scheduled successfully',
      data: maintenance,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating fleet maintenance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create fleet maintenance',
      timestamp: new Date().toISOString()
    });
  }
});

// Update fleet maintenance
router.put('/maintenance/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, scheduledDate, cost, status } = req.body;
    
    const maintenance = {
      id: id,
      type: type || 'Maintenance',
      scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : new Date().toISOString(),
      cost: cost || 0,
      status: status || 'scheduled',
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Fleet maintenance updated successfully',
      data: maintenance,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating fleet maintenance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update fleet maintenance',
      timestamp: new Date().toISOString()
    });
  }
});

// Get all drivers
router.get('/drivers', simpleAuth, async (req, res) => {
  try {
    const drivers = [
      {
        id: 'driver-1',
        name: 'John Doe',
        licenseNumber: 'DL123456',
        status: 'active',
        experience: '5 years',
        fleetId: 'fleet-1'
      },
      {
        id: 'driver-2',
        name: 'Jane Smith',
        licenseNumber: 'DL789012',
        status: 'active',
        experience: '3 years',
        fleetId: 'fleet-2'
      }
    ];
    
    res.json({
      success: true,
      data: drivers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching drivers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drivers',
      timestamp: new Date().toISOString()
    });
  }
});

// Create driver
router.post('/drivers', simpleAuth, async (req, res) => {
  try {
    const { name, licenseNumber, experience, fleetId } = req.body;
    
    if (!name || !licenseNumber) {
      return res.status(400).json({
        success: false,
        error: 'Driver name and license number are required',
        timestamp: new Date().toISOString()
      });
    }

    const driver = {
      id: `driver-${Date.now()}`,
      name,
      licenseNumber,
      experience: experience || '0 years',
      status: 'active',
      fleetId: fleetId || null,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driver,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating driver:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create driver',
      timestamp: new Date().toISOString()
    });
  }
});

// Update driver
router.put('/drivers/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, licenseNumber, experience, status, fleetId } = req.body;
    
    const driver = {
      id: id,
      name: name || `Driver ${id}`,
      licenseNumber: licenseNumber || 'DL000000',
      experience: experience || '0 years',
      status: status || 'active',
      fleetId: fleetId || null,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Driver updated successfully',
      data: driver,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating driver:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update driver',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;