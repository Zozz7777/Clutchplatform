const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const CarBrand = require('../models/CarBrand');
const CarModel = require('../models/CarModel');
const CarTrim = require('../models/CarTrim');
const MaintenanceService = require('../models/MaintenanceService');
const auth = require('../middleware/auth');

// Get all car brands
router.get('/brands', async (req, res) => {
  try {
    const { search } = req.query;
    let query = { isActive: true };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const brands = await CarBrand.find(query).sort({ name: 1 });
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
    
    const models = await CarModel.find(query).sort({ name: 1 });
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
    
    const trims = await CarTrim.find(query).sort({ name: 1 });
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
router.get('/user-cars', auth, async (req, res) => {
  try {
    const cars = await Car.find({ 
      userId: req.user.id, 
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: cars
    });
  } catch (error) {
    console.error('Error fetching user cars:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user cars'
    });
  }
});

// Register a new car
router.post('/register', auth, async (req, res) => {
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

    // Check if license plate already exists
    const existingCar = await Car.findOne({ 
      licensePlate: licensePlate.toUpperCase(),
      isActive: true 
    });
    
    if (existingCar) {
      return res.status(400).json({
        success: false,
        message: 'License plate already registered'
      });
    }

    // Create new car
    const car = new Car({
      userId: req.user.id,
      year: parseInt(year),
      brand: brand.trim(),
      model: model.trim(),
      trim: trim.trim(),
      kilometers: parseInt(kilometers),
      color: color.trim(),
      licensePlate: licensePlate.toUpperCase().trim(),
      currentMileage: parseInt(kilometers)
    });

    await car.save();

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
router.put('/:carId/maintenance', auth, async (req, res) => {
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

    // Find the car
    const car = await Car.findOne({ 
      _id: carId, 
      userId: req.user.id, 
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
    
    const services = await MaintenanceService.find(query).sort({ 
      serviceGroup: 1, 
      serviceName: 1 
    });
    
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