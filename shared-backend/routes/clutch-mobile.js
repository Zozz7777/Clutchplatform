const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');

// ==================== USER VEHICLES ====================

// Get user vehicles
router.get('/vehicles', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50, page = 1 } = req.query;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const vehiclesCollection = await getCollection('vehicles');
        const [vehicles, totalVehicles] = await Promise.all([
            vehiclesCollection.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .toArray(),
            vehiclesCollection.countDocuments({ userId })
        ]);

        // Get vehicle health and maintenance info
        const enrichedVehicles = await Promise.all(
            vehicles.map(async (vehicle) => {
                const [maintenanceCollection, diagnosticsCollection] = await Promise.all([
                    getCollection('maintenance'),
                    getCollection('vehicle_diagnostics')
                ]);

                const [lastMaintenance, lastDiagnostic] = await Promise.all([
                    maintenanceCollection.findOne(
                        { vehicleId: vehicle._id },
                        { sort: { date: -1 } }
                    ),
                    diagnosticsCollection.findOne(
                        { vehicleId: vehicle._id },
                        { sort: { timestamp: -1 } }
                    )
                ]);

                return {
                    ...vehicle,
                    lastMaintenance: lastMaintenance ? {
                        date: lastMaintenance.date,
                        type: lastMaintenance.type,
                        mileage: lastMaintenance.mileage
                    } : null,
                    lastDiagnostic: lastDiagnostic ? {
                        timestamp: lastDiagnostic.timestamp,
                        health: lastDiagnostic.health || 85,
                        troubleCodes: lastDiagnostic.diagnosticTroubleCodes || []
                    } : null,
                    nextService: vehicle.nextService || null,
                    estimatedHealth: vehicle.health || 85
                };
            })
        );

        res.json({
            success: true,
            data: enrichedVehicles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalVehicles,
                pages: Math.ceil(totalVehicles / parseInt(limit))
            }
        });
    } catch (error) {
        logger.error('Get user vehicles error:', error);
        res.status(500).json({
            success: false,
            error: 'VEHICLES_RETRIEVAL_ERROR',
            message: 'Failed to retrieve vehicles'
        });
    }
});

// Get vehicle details
router.get('/vehicles/:vehicleId', authenticateToken, async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const userId = req.user.id;

        const vehiclesCollection = await getCollection('vehicles');
        const vehicle = await vehiclesCollection.findOne({ 
            _id: vehicleId, 
            userId 
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'VEHICLE_NOT_FOUND',
                message: 'Vehicle not found'
            });
        }

        // Get comprehensive vehicle data
        const [maintenanceCollection, diagnosticsCollection, bookingsCollection] = await Promise.all([
            getCollection('maintenance'),
            getCollection('vehicle_diagnostics'),
            getCollection('bookings')
        ]);

        const [maintenanceHistory, diagnosticHistory, recentBookings] = await Promise.all([
            maintenanceCollection.find({ vehicleId })
                .sort({ date: -1 })
                .limit(10)
                .toArray(),
            diagnosticsCollection.find({ vehicleId })
                .sort({ timestamp: -1 })
                .limit(20)
                .toArray(),
            bookingsCollection.find({ vehicleId, userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .toArray()
        ]);

        const enrichedVehicle = {
            ...vehicle,
            maintenanceHistory,
            diagnosticHistory,
            recentBookings,
            healthMetrics: calculateVehicleHealth(diagnosticHistory)
        };

        res.json({
            success: true,
            data: enrichedVehicle
        });
    } catch (error) {
        logger.error('Get vehicle details error:', error);
        res.status(500).json({
            success: false,
            error: 'VEHICLE_DETAILS_ERROR',
            message: 'Failed to retrieve vehicle details'
        });
    }
});

// Add new vehicle
router.post('/vehicles', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            brand,
            model,
            year,
            licensePlate,
            vin,
            color,
            mileage,
            fuelType,
            transmission
        } = req.body;

        if (!brand || !model || !year) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Brand, model, and year are required'
            });
        }

        const vehiclesCollection = await getCollection('vehicles');
        
        const vehicle = {
            userId,
            brand,
            model,
            year: parseInt(year),
            licensePlate: licensePlate || '',
            vin: vin || '',
            color: color || '',
            mileage: parseInt(mileage) || 0,
            fuelType: fuelType || 'gasoline',
            transmission: transmission || 'automatic',
            health: 100,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await vehiclesCollection.insertOne(vehicle);
        vehicle._id = result.insertedId;

        res.status(201).json({
            success: true,
            data: vehicle,
            message: 'Vehicle added successfully'
        });
    } catch (error) {
        logger.error('Add vehicle error:', error);
        res.status(500).json({
            success: false,
            error: 'VEHICLE_ADD_ERROR',
            message: 'Failed to add vehicle'
        });
    }
});

// Update vehicle
router.put('/vehicles/:vehicleId', authenticateToken, async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const userId = req.user.id;
        const updates = req.body;
        updates.updatedAt = new Date();

        const vehiclesCollection = await getCollection('vehicles');
        const result = await vehiclesCollection.updateOne(
            { _id: vehicleId, userId },
            { $set: updates }
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
        logger.error('Update vehicle error:', error);
        res.status(500).json({
            success: false,
            error: 'VEHICLE_UPDATE_ERROR',
            message: 'Failed to update vehicle'
        });
    }
});

// ==================== USER BOOKINGS ====================

// Get user bookings
router.get('/bookings', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, startDate, endDate, limit = 50, page = 1 } = req.query;
        
        const filters = { userId };
        if (status) filters.status = status;
        if (startDate || endDate) {
            filters.scheduledDate = {};
            if (startDate) filters.scheduledDate.$gte = new Date(startDate);
            if (endDate) filters.scheduledDate.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const bookingsCollection = await getCollection('bookings');
        const [bookings, totalBookings] = await Promise.all([
            bookingsCollection.find(filters)
                .sort({ scheduledDate: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .toArray(),
            bookingsCollection.countDocuments(filters)
        ]);

        // Get booking details with service center and vehicle info
        const enrichedBookings = await Promise.all(
            bookings.map(async (booking) => {
                const [serviceCentersCollection, vehiclesCollection] = await Promise.all([
                    getCollection('service_centers'),
                    getCollection('vehicles')
                ]);
                
                const [serviceCenter, vehicle] = await Promise.all([
                    serviceCentersCollection.findOne({ _id: booking.serviceCenterId }),
                    vehiclesCollection.findOne({ _id: booking.vehicleId })
                ]);

                return {
                    ...booking,
                    serviceCenter: serviceCenter ? {
                        id: serviceCenter._id,
                        name: serviceCenter.name,
                        address: serviceCenter.address,
                        phone: serviceCenter.phone,
                        rating: serviceCenter.rating
                    } : null,
                    vehicle: vehicle ? {
                        id: vehicle._id,
                        brand: vehicle.brand,
                        model: vehicle.model,
                        year: vehicle.year,
                        licensePlate: vehicle.licensePlate
                    } : null
                };
            })
        );

        res.json({
            success: true,
            data: enrichedBookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalBookings,
                pages: Math.ceil(totalBookings / parseInt(limit))
            }
        });
    } catch (error) {
        logger.error('Get user bookings error:', error);
        res.status(500).json({
            success: false,
            error: 'BOOKINGS_RETRIEVAL_ERROR',
            message: 'Failed to retrieve bookings'
        });
    }
});

// Create new booking
router.post('/bookings', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            serviceCenterId,
            vehicleId,
            serviceType,
            description,
            scheduledDate,
            preferredTime,
            estimatedCost
        } = req.body;

        if (!serviceCenterId || !vehicleId || !serviceType || !scheduledDate) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Service center, vehicle, service type, and scheduled date are required'
            });
        }

        const bookingsCollection = await getCollection('bookings');
        
        const booking = {
            userId,
            serviceCenterId,
            vehicleId,
            serviceType,
            description: description || '',
            scheduledDate: new Date(scheduledDate),
            preferredTime: preferredTime || 'morning',
            estimatedCost: parseFloat(estimatedCost) || 0,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await bookingsCollection.insertOne(booking);
        booking._id = result.insertedId;

        res.status(201).json({
            success: true,
            data: booking,
            message: 'Booking created successfully'
        });
    } catch (error) {
        logger.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            error: 'BOOKING_CREATE_ERROR',
            message: 'Failed to create booking'
        });
    }
});

// Cancel booking
router.put('/bookings/:bookingId/cancel', authenticateToken, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;
        const { reason } = req.body;

        const bookingsCollection = await getCollection('bookings');
        const result = await bookingsCollection.updateOne(
            { _id: bookingId, userId },
            { 
                $set: { 
                    status: 'cancelled',
                    cancellationReason: reason || '',
                    cancelledAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'BOOKING_NOT_FOUND',
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        logger.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            error: 'BOOKING_CANCELLATION_ERROR',
            message: 'Failed to cancel booking'
        });
    }
});

// ==================== USER SERVICES & SUPPORT ====================

// Get service history
router.get('/service-history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { vehicleId, limit = 50, page = 1 } = req.query;
        
        const filters = { userId };
        if (vehicleId) filters.vehicleId = vehicleId;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const maintenanceCollection = await getCollection('maintenance');
        const [maintenance, totalRecords] = await Promise.all([
            maintenanceCollection.find(filters)
                .sort({ date: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .toArray(),
            maintenanceCollection.countDocuments(filters)
        ]);

        res.json({
            success: true,
            data: maintenance,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalRecords,
                pages: Math.ceil(totalRecords / parseInt(limit))
            }
        });
    } catch (error) {
        logger.error('Get service history error:', error);
        res.status(500).json({
            success: false,
            error: 'SERVICE_HISTORY_ERROR',
            message: 'Failed to retrieve service history'
        });
    }
});

// Get nearby service centers
router.get('/service-centers/nearby', authenticateToken, async (req, res) => {
    try {
        const { latitude, longitude, radius = 50, limit = 20 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_LOCATION',
                message: 'Latitude and longitude are required'
            });
        }

        const serviceCentersCollection = await getCollection('service_centers');
        
        // Find service centers within radius (simplified - in production use proper geospatial queries)
        const serviceCenters = await serviceCentersCollection.find({
            status: 'active',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(radius) * 1000 // Convert km to meters
                }
            }
        })
        .limit(parseInt(limit))
        .toArray();

        res.json({
            success: true,
            data: serviceCenters,
            count: serviceCenters.length
        });
    } catch (error) {
        logger.error('Get nearby service centers error:', error);
        res.status(500).json({
            success: false,
            error: 'SERVICE_CENTERS_ERROR',
            message: 'Failed to retrieve nearby service centers'
        });
    }
});

// ==================== HELPER FUNCTIONS ====================

// Calculate vehicle health
function calculateVehicleHealth(diagnosticHistory) {
    if (!diagnosticHistory || diagnosticHistory.length === 0) {
        return {
            overall: 85,
            engine: 85,
            transmission: 85,
            brakes: 85,
            tires: 85
        };
    }

    const latest = diagnosticHistory[0];
    const health = latest.health || 85;

    return {
        overall: health,
        engine: latest.engineHealth || health,
        transmission: latest.transmissionHealth || health,
        brakes: latest.brakesHealth || health,
        tires: latest.tiresHealth || health
    };
}


// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} service is running`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item retrieved`,
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item created`,
    data: { id: Date.now(), ...req.body, createdAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'POST',
    path: '/'
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item updated`,
    data: { id: id, ...req.body, updatedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'PUT',
    path: `/${id}`
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item deleted`,
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} search results`,
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;
