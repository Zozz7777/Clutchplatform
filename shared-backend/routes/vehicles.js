const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all vehicles
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, userId, make, model, year, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (userId) filters.userId = new ObjectId(userId);
        if (make) filters.make = { $regex: make, $options: 'i' };
        if (model) filters.model = { $regex: model, $options: 'i' };
        if (year) filters.year = parseInt(year);
        if (status) filters.status = status;

        const collection = await getCollection('vehicles');
        const vehicles = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: vehicles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_VEHICLES_FAILED',
            message: 'Failed to retrieve vehicles'
        });
    }
});

// Get vehicle by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('vehicles');
        const vehicle = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'VEHICLE_NOT_FOUND',
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        console.error('Get vehicle error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_VEHICLE_FAILED',
            message: 'Failed to retrieve vehicle'
        });
    }
});

// Create vehicle
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            make,
            model,
            year,
            vin,
            licensePlate,
            color,
            mileage,
            fuelType,
            transmission,
            engineSize,
            description,
            images,
            documents
        } = req.body;
        
        if (!make || !model || !year) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Make, model, and year are required'
            });
        }

        // Check if VIN already exists
        if (vin) {
            const collection = await getCollection('vehicles');
            const existingVehicle = await collection.findOne({ vin });
            if (existingVehicle) {
                return res.status(400).json({
                    success: false,
                    error: 'VIN_ALREADY_EXISTS',
                    message: 'Vehicle with this VIN already exists'
                });
            }
        }

        const vehicleData = {
            userId: req.user.userId,
            make,
            model,
            year: parseInt(year),
            vin: vin || '',
            licensePlate: licensePlate || '',
            color: color || '',
            mileage: mileage ? parseInt(mileage) : 0,
            fuelType: fuelType || 'gasoline',
            transmission: transmission || 'automatic',
            engineSize: engineSize || '',
            description: description || '',
            images: images || [],
            documents: documents || [],
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('vehicles');
        const result = await collection.insertOne(vehicleData);
        
        vehicleData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Vehicle created successfully',
            data: vehicleData
        });
    } catch (error) {
        console.error('Create vehicle error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_VEHICLE_FAILED',
            message: 'Failed to create vehicle'
        });
    }
});

// Update vehicle
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('vehicles');
        const vehicle = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'VEHICLE_NOT_FOUND',
                message: 'Vehicle not found'
            });
        }

        // Check if user owns this vehicle
        if (vehicle.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only update your own vehicles'
            });
        }

        // Check if VIN already exists (if being updated)
        if (req.body.vin && req.body.vin !== vehicle.vin) {
            const existingVehicle = await collection.findOne({ 
                vin: req.body.vin,
                _id: { $ne: new ObjectId(id) }
            });
            if (existingVehicle) {
                return res.status(400).json({
                    success: false,
                    error: 'VIN_ALREADY_EXISTS',
                    message: 'Vehicle with this VIN already exists'
                });
            }
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'VEHICLE_NOT_FOUND',
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            message: 'Vehicle updated successfully'
        });
    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_VEHICLE_FAILED',
            message: 'Failed to update vehicle'
        });
    }
});

// Delete vehicle
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('vehicles');
        
        const vehicle = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'VEHICLE_NOT_FOUND',
                message: 'Vehicle not found'
            });
        }

        // Check if user owns this vehicle
        if (vehicle.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only delete your own vehicles'
            });
        }

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'VEHICLE_NOT_FOUND',
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({
            success: false,
            error: 'DELETE_VEHICLE_FAILED',
            message: 'Failed to delete vehicle'
        });
    }
});

// Get user vehicles
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { userId: new ObjectId(userId) };
        if (status) filters.status = status;

        const collection = await getCollection('vehicles');
        const vehicles = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: vehicles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get user vehicles error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_USER_VEHICLES_FAILED',
            message: 'Failed to retrieve user vehicles'
        });
    }
});

// Get vehicles by make
router.get('/make/:make', authenticateToken, async (req, res) => {
    try {
        const { make } = req.params;
        const { page = 1, limit = 10, model, year } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { make: { $regex: make, $options: 'i' } };
        if (model) filters.model = { $regex: model, $options: 'i' };
        if (year) filters.year = parseInt(year);

        const collection = await getCollection('vehicles');
        const vehicles = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ year: -1, model: 1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: vehicles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get vehicles by make error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_VEHICLES_BY_MAKE_FAILED',
            message: 'Failed to retrieve vehicles by make'
        });
    }
});

// Get vehicles by model
router.get('/model/:model', authenticateToken, async (req, res) => {
    try {
        const { model } = req.params;
        const { page = 1, limit = 10, make, year } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { model: { $regex: model, $options: 'i' } };
        if (make) filters.make = { $regex: make, $options: 'i' };
        if (year) filters.year = parseInt(year);

        const collection = await getCollection('vehicles');
        const vehicles = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ year: -1, make: 1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: vehicles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get vehicles by model error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_VEHICLES_BY_MODEL_FAILED',
            message: 'Failed to retrieve vehicles by model'
        });
    }
});

// Search vehicles
router.get('/search/query', authenticateToken, async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_QUERY',
                message: 'Search query is required'
            });
        }

        const collection = await getCollection('vehicles');
        const vehicles = await collection.find({
            $or: [
                { make: { $regex: q, $options: 'i' } },
                { model: { $regex: q, $options: 'i' } },
                { vin: { $regex: q, $options: 'i' } },
                { licensePlate: { $regex: q, $options: 'i' } }
            ]
        })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ year: -1, make: 1, model: 1 })
        .toArray();
        
        const total = await collection.countDocuments({
            $or: [
                { make: { $regex: q, $options: 'i' } },
                { model: { $regex: q, $options: 'i' } },
                { vin: { $regex: q, $options: 'i' } },
                { licensePlate: { $regex: q, $options: 'i' } }
            ]
        });

        res.json({
            success: true,
            data: vehicles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Search vehicles error:', error);
        res.status(500).json({
            success: false,
            error: 'SEARCH_VEHICLES_FAILED',
            message: 'Failed to search vehicles'
        });
    }
});

// Get vehicle makes
router.get('/makes/list', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('vehicles');
        const makes = await collection.aggregate([
            { $group: { _id: '$make' } },
            { $sort: { _id: 1 } }
        ]).toArray();

        res.json({
            success: true,
            data: makes.map(make => make._id)
        });
    } catch (error) {
        console.error('Get vehicle makes error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_VEHICLE_MAKES_FAILED',
            message: 'Failed to retrieve vehicle makes'
        });
    }
});

// Get vehicle models
router.get('/models/list', authenticateToken, async (req, res) => {
    try {
        const { make } = req.query;
        
        const filters = {};
        if (make) filters.make = { $regex: make, $options: 'i' };

        const collection = await getCollection('vehicles');
        const models = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$model', make: { $first: '$make' } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        res.json({
            success: true,
            data: models.map(model => ({
                model: model._id,
                make: model.make
            }))
        });
    } catch (error) {
        console.error('Get vehicle models error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_VEHICLE_MODELS_FAILED',
            message: 'Failed to retrieve vehicle models'
        });
    }
});

// Get vehicle statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }
        if (userId) filters.userId = new ObjectId(userId);

        const collection = await getCollection('vehicles');
        
        // Get total vehicles
        const totalVehicles = await collection.countDocuments(filters);
        
        // Get vehicles by make
        const vehiclesByMake = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$make', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]).toArray();
        
        // Get vehicles by fuel type
        const vehiclesByFuelType = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$fuelType', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get vehicles by transmission
        const vehiclesByTransmission = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$transmission', count: { $sum: 1 } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalVehicles,
                vehiclesByMake,
                vehiclesByFuelType,
                vehiclesByTransmission
            }
        });
    } catch (error) {
        console.error('Get vehicle stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_VEHICLE_STATS_FAILED',
            message: 'Failed to retrieve vehicle statistics'
        });
    }
});

module.exports = router;
