const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const { authenticateToken } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// Get all car brands
router.get('/brands', async (req, res) => {
  try {
    const { search } = req.query;
    let query = { isActive: true };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const brandsCollection = await getCollection('car_brands');
    const brands = await brandsCollection.find(query).sort({ name: 1 }).toArray();
    
    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    console.error('Error fetching car brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car brands'
    });
  }
});

// Get models by brand
router.get('/models/:brandName', async (req, res) => {
  try {
    const { brandName } = req.params;
    const { search } = req.query;
    
    let query = { 
      brandName: new RegExp(brandName, 'i'),
      isActive: true 
    };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const modelsCollection = await getCollection('car_models');
    const models = await modelsCollection.find(query).sort({ name: 1 }).toArray();
    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    console.error('Error fetching car models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car models'
    });
  }
});

// Get trims by model
router.get('/trims/:brandName/:modelName', async (req, res) => {
  try {
    const { brandName, modelName } = req.params;
    const { search } = req.query;
    
    let query = { 
      brandName: new RegExp(brandName, 'i'),
      modelName: new RegExp(modelName, 'i'),
      isActive: true 
    };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const trimsCollection = await getCollection('car_trims');
    const trims = await trimsCollection.find(query).sort({ name: 1 }).toArray();
    res.json({
      success: true,
      data: trims
    });
  } catch (error) {
    console.error('Error fetching car trims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car trims'
    });
  }
});

// Get user's cars
router.get('/user-cars', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not found in request',
        error: 'INVALID_USER'
      });
    }

    // Use native MongoDB client
    const carsCollection = await getCollection('cars');
    
    // Query with native MongoDB
    const cars = await carsCollection.find({ 
      userId: userId, 
      isActive: true 
    })
    .sort({ createdAt: -1 })
    .maxTimeMS(5000) // 5 second timeout
    .toArray();
    
    res.json({
      success: true,
      data: cars,
      count: cars.length
    });
  } catch (error) {
    console.error('Error fetching user cars:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoServerError' && error.message.includes('timeout')) {
      return res.status(503).json({
        success: false,
        message: 'Database operation timed out. Please try again.',
        error: 'DATABASE_TIMEOUT'
      });
    }
    
    if (error.name === 'MongoError' && error.message.includes('connection')) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not available',
        error: 'SERVICE_UNAVAILABLE'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user cars',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Register a new car
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const {
      year,
      brand,
      model,
      trim,
      kilometers,
      color,
      licensePlate
    } = req.body;

    // Validate required fields
    if (!year || !brand || !model || !trim || !kilometers || !color || !licensePlate) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Use native MongoDB client
    const carsCollection = await getCollection('cars');
    
    // Check if license plate already exists
    const existingCar = await carsCollection.findOne({ 
      licensePlate: licensePlate.toUpperCase(),
      isActive: true 
    });
    
    if (existingCar) {
      return res.status(400).json({
        success: false,
        message: 'License plate already registered'
      });
    }

    // Create new car document
    const car = {
      userId: req.user.userId || req.user.id,
      year: parseInt(year),
      brand: brand.trim(),
      model: model.trim(),
      trim: trim.trim(),
      kilometers: parseInt(kilometers),
      color: color.trim(),
      licensePlate: licensePlate.toUpperCase().trim(),
      currentMileage: parseInt(kilometers),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await carsCollection.insertOne(car);
    car._id = result.insertedId;

    res.status(201).json({
      success: true,
      message: 'Car registered successfully',
      data: car
    });
  } catch (error) {
    console.error('Error registering car:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register car'
    });
  }
});

// Update car maintenance
router.put('/:carId/maintenance', authenticateToken, async (req, res) => {
  try {
    const { carId } = req.params;
    const {
      maintenanceDate,
      services,
      kilometers
    } = req.body;

    // Validate required fields
    if (!maintenanceDate || !services || !kilometers) {
      return res.status(400).json({
        success: false,
        message: 'Maintenance date, services, and kilometers are required'
      });
    }

    // Find the car using native MongoDB
    const carsCollection = await getCollection('cars');
    const car = await carsCollection.findOne({ 
      _id: new ObjectId(carId), 
      userId: req.user.userId || req.user.id, 
      isActive: true 
    });

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Update car maintenance info
    car.lastMaintenanceDate = new Date(maintenanceDate);
    car.lastMaintenanceKilometers = parseInt(kilometers);
    car.currentMileage = parseInt(kilometers);
    car.lastMaintenanceServices = services.map(service => ({
      serviceGroup: service.serviceGroup,
      serviceName: service.serviceName,
      date: new Date(maintenanceDate)
    }));

    await car.save();

    res.json({
      success: true,
      message: 'Maintenance updated successfully',
      data: car
    });
  } catch (error) {
    console.error('Error updating car maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update car maintenance'
    });
  }
});

// Get maintenance services
router.get('/maintenance-services', async (req, res) => {
  try {
    const { search } = req.query;
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { serviceGroup: { $regex: search, $options: 'i' } },
        { serviceName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const servicesCollection = await getCollection('maintenance_services');
    const services = await servicesCollection.find(query).sort({ 
      serviceGroup: 1, 
      serviceName: 1 
    }).toArray();
    
    // Group services by service group
    const groupedServices = services.reduce((acc, service) => {
      if (!acc[service.serviceGroup]) {
        acc[service.serviceGroup] = [];
      }
      acc[service.serviceGroup].push(service);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: groupedServices
    });
  } catch (error) {
    console.error('Error fetching maintenance services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance services'
    });
  }
});

module.exports = router;