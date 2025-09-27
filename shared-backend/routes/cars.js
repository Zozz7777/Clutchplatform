const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');

// GET /api/v1/cars - Get user's cars
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const db = require('../config/database');
    const carsCollection = db.collection('cars');

    const cars = await carsCollection.find({ userId }).toArray();

    logger.info(`✅ Retrieved ${cars.length} cars for user: ${userId}`);

    res.json({
      success: true,
      data: cars,
      message: 'Cars retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get cars error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CARS_FAILED',
      message: 'Failed to retrieve cars',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/cars - Add new car
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      make,
      model,
      year,
      licensePlate,
      vin,
      color,
      mileage,
      fuelType,
      transmission,
      engineSize,
      insuranceCompany,
      policyNumber,
      insuranceExpiry
    } = req.body;

    // Validate required fields
    if (!make || !model || !year || !licensePlate) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Make, model, year, and license plate are required',
        timestamp: new Date().toISOString()
      });
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 1) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_YEAR',
        message: 'Please enter a valid year',
        timestamp: new Date().toISOString()
      });
    }

    // Validate VIN if provided
    if (vin && vin.length !== 17) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_VIN',
        message: 'VIN must be 17 characters long',
        timestamp: new Date().toISOString()
      });
    }

    // Check if license plate already exists for this user
    const db = require('../config/database');
    const carsCollection = db.collection('cars');
    
    const existingCar = await carsCollection.findOne({ 
      userId, 
      licensePlate: licensePlate.toUpperCase() 
    });
    
    if (existingCar) {
      return res.status(409).json({
        success: false,
        error: 'LICENSE_PLATE_EXISTS',
        message: 'A car with this license plate is already registered',
        timestamp: new Date().toISOString()
      });
    }

    // Create new car
    const newCar = {
      userId,
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year),
      licensePlate: licensePlate.toUpperCase().trim(),
      vin: vin ? vin.toUpperCase().trim() : null,
      color: color ? color.trim() : null,
      mileage: mileage ? parseInt(mileage) : 0,
      fuelType: fuelType || 'Gasoline',
      transmission: transmission || 'Automatic',
      engineSize: engineSize ? engineSize.trim() : null,
      insurance: {
        company: insuranceCompany ? insuranceCompany.trim() : null,
        policyNumber: policyNumber ? policyNumber.trim() : null,
        expiry: insuranceExpiry || null
      },
      lastServiceDate: null,
      nextServiceDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await carsCollection.insertOne(newCar);

    logger.info(`✅ Added new car for user ${userId}: ${make} ${model} ${year}`);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...newCar
      },
      message: 'Car registered successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Add car error:', error);
    res.status(500).json({
      success: false,
      error: 'ADD_CAR_FAILED',
      message: 'Failed to register car',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/cars/:id - Get car by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const db = require('../config/database');
    const carsCollection = db.collection('cars');

    const car = await carsCollection.findOne({ _id: id, userId });
    
    if (!car) {
      return res.status(404).json({
        success: false,
        error: 'CAR_NOT_FOUND',
        message: 'Car not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: car,
      message: 'Car retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get car error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CAR_FAILED',
      message: 'Failed to retrieve car',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/cars/:id - Update car
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    const db = require('../config/database');
    const carsCollection = db.collection('cars');

    // Check if car exists and belongs to user
    const existingCar = await carsCollection.findOne({ _id: id, userId });
    if (!existingCar) {
      return res.status(404).json({
        success: false,
        error: 'CAR_NOT_FOUND',
        message: 'Car not found',
        timestamp: new Date().toISOString()
      });
    }

    // Validate year if provided
    if (updateData.year) {
      const currentYear = new Date().getFullYear();
      if (updateData.year < 1900 || updateData.year > currentYear + 1) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_YEAR',
          message: 'Please enter a valid year',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Validate VIN if provided
    if (updateData.vin && updateData.vin.length !== 17) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_VIN',
        message: 'VIN must be 17 characters long',
        timestamp: new Date().toISOString()
      });
    }

    // Check license plate uniqueness if being updated
    if (updateData.licensePlate && updateData.licensePlate !== existingCar.licensePlate) {
      const duplicateCar = await carsCollection.findOne({ 
        userId, 
        licensePlate: updateData.licensePlate.toUpperCase(),
        _id: { $ne: id }
      });
      
      if (duplicateCar) {
        return res.status(409).json({
          success: false,
          error: 'LICENSE_PLATE_EXISTS',
          message: 'A car with this license plate is already registered',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Prepare update data
    const sanitizedUpdateData = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Sanitize string fields
    if (sanitizedUpdateData.make) sanitizedUpdateData.make = sanitizedUpdateData.make.trim();
    if (sanitizedUpdateData.model) sanitizedUpdateData.model = sanitizedUpdateData.model.trim();
    if (sanitizedUpdateData.licensePlate) sanitizedUpdateData.licensePlate = sanitizedUpdateData.licensePlate.toUpperCase().trim();
    if (sanitizedUpdateData.vin) sanitizedUpdateData.vin = sanitizedUpdateData.vin.toUpperCase().trim();
    if (sanitizedUpdateData.color) sanitizedUpdateData.color = sanitizedUpdateData.color.trim();
    if (sanitizedUpdateData.engineSize) sanitizedUpdateData.engineSize = sanitizedUpdateData.engineSize.trim();

    // Update car
    await carsCollection.updateOne(
      { _id: id, userId },
      { $set: sanitizedUpdateData }
    );

    // Get updated car
    const updatedCar = await carsCollection.findOne({ _id: id, userId });

    logger.info(`✅ Updated car ${id} for user ${userId}`);

    res.json({
      success: true,
      data: updatedCar,
      message: 'Car updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Update car error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_CAR_FAILED',
      message: 'Failed to update car',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/cars/:id - Delete car
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const db = require('../config/database');
    const carsCollection = db.collection('cars');
    const maintenanceCollection = db.collection('maintenance');

    // Check if car exists and belongs to user
    const car = await carsCollection.findOne({ _id: id, userId });
    if (!car) {
      return res.status(404).json({
        success: false,
        error: 'CAR_NOT_FOUND',
        message: 'Car not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if car has maintenance records
    const maintenanceCount = await maintenanceCollection.countDocuments({ carId: id });
    if (maintenanceCount > 0) {
      return res.status(409).json({
        success: false,
        error: 'CAR_HAS_MAINTENANCE_RECORDS',
        message: 'Cannot delete car with existing maintenance records',
        timestamp: new Date().toISOString()
      });
    }

    // Delete car
    await carsCollection.deleteOne({ _id: id, userId });

    logger.info(`✅ Deleted car ${id} for user ${userId}`);

    res.json({
      success: true,
      data: {
        id,
        make: car.make,
        model: car.model,
        year: car.year
      },
      message: 'Car deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Delete car error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_CAR_FAILED',
      message: 'Failed to delete car',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/cars/:id/health - Get car health status
router.get('/:id/health', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const db = require('../config/database');
    const carsCollection = db.collection('cars');
    const maintenanceCollection = db.collection('maintenance');

    // Check if car exists and belongs to user
    const car = await carsCollection.findOne({ _id: id, userId });
    if (!car) {
      return res.status(404).json({
        success: false,
        error: 'CAR_NOT_FOUND',
        message: 'Car not found',
        timestamp: new Date().toISOString()
      });
    }

    // Get recent maintenance records
    const recentMaintenance = await maintenanceCollection
      .find({ carId: id })
      .sort({ date: -1 })
      .limit(5)
      .toArray();

    // Calculate health score based on various factors
    let overallHealth = 100;
    const healthFactors = {
      engine: { status: 'good', score: 85 },
      brakes: { status: 'good', score: 90 },
      tires: { status: 'warning', score: 70 },
      battery: { status: 'excellent', score: 95 }
    };

    // Adjust health based on mileage and age
    const carAge = new Date().getFullYear() - car.year;
    const mileageFactor = Math.min(car.mileage / 100000, 1); // Normalize to 0-1
    const ageFactor = Math.min(carAge / 10, 1); // Normalize to 0-1

    overallHealth = Math.max(50, overallHealth - (mileageFactor * 20) - (ageFactor * 15));

    // Adjust based on recent maintenance
    if (recentMaintenance.length > 0) {
      const lastMaintenance = recentMaintenance[0];
      const daysSinceMaintenance = Math.floor(
        (new Date().getTime() - new Date(lastMaintenance.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceMaintenance > 365) {
        overallHealth -= 20;
      } else if (daysSinceMaintenance > 180) {
        overallHealth -= 10;
      }
    }

    const carHealth = {
      carId: id,
      overallHealth: Math.round(overallHealth),
      engine: healthFactors.engine,
      brakes: healthFactors.brakes,
      tires: healthFactors.tires,
      battery: healthFactors.battery,
      lastCheck: new Date().toISOString(),
      recommendations: generateHealthRecommendations(overallHealth, car, recentMaintenance)
    };

    res.json({
      success: true,
      data: carHealth,
      message: 'Car health retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get car health error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_CAR_HEALTH_FAILED',
      message: 'Failed to retrieve car health',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to generate health recommendations
function generateHealthRecommendations(healthScore, car, maintenanceRecords) {
  const recommendations = [];

  if (healthScore < 70) {
    recommendations.push({
      priority: 'high',
      category: 'general',
      message: 'Schedule a comprehensive inspection',
      action: 'book_service'
    });
  }

  if (car.mileage > 50000 && !maintenanceRecords.some(m => m.type === 'major_service')) {
    recommendations.push({
      priority: 'medium',
      category: 'maintenance',
      message: 'Consider major service due to mileage',
      action: 'schedule_maintenance'
    });
  }

  const carAge = new Date().getFullYear() - car.year;
  if (carAge > 5) {
    recommendations.push({
      priority: 'low',
      category: 'preventive',
      message: 'Consider preventive maintenance for older vehicle',
      action: 'preventive_maintenance'
    });
  }

  return recommendations;
}

module.exports = router;
