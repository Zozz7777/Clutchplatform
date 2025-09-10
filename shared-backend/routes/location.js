const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all locations
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, type, city, country, isActive } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (type) filters.type = type;
        if (city) filters.city = { $regex: city, $options: 'i' };
        if (country) filters.country = { $regex: country, $options: 'i' };
        if (isActive !== undefined) filters.isActive = isActive === 'true';

        const collection = await getCollection('locations');
        const locations = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ city: 1, country: 1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: locations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get locations error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_LOCATIONS_FAILED',
            message: 'Failed to retrieve locations'
        });
    }
});

// Get location by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('locations');
        const location = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!location) {
            return res.status(404).json({
                success: false,
                error: 'LOCATION_NOT_FOUND',
                message: 'Location not found'
            });
        }

        res.json({
            success: true,
            data: location
        });
    } catch (error) {
        console.error('Get location error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_LOCATION_FAILED',
            message: 'Failed to retrieve location'
        });
    }
});

// Create location
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            name,
            type,
            address,
            city,
            state,
            country,
            postalCode,
            coordinates,
            phone,
            email,
            website,
            description,
            isActive
        } = req.body;
        
        if (!name || !type || !city || !country) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Name, type, city, and country are required'
            });
        }

        const locationData = {
            name,
            type: type || 'service_center',
            address: address || '',
            city,
            state: state || '',
            country,
            postalCode: postalCode || '',
            coordinates: coordinates || {},
            phone: phone || '',
            email: email || '',
            website: website || '',
            description: description || '',
            isActive: isActive !== undefined ? isActive : true,
            createdBy: req.user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('locations');
        const result = await collection.insertOne(locationData);
        
        locationData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Location created successfully',
            data: locationData
        });
    } catch (error) {
        console.error('Create location error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_LOCATION_FAILED',
            message: 'Failed to create location'
        });
    }
});

// Update location
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('locations');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'LOCATION_NOT_FOUND',
                message: 'Location not found'
            });
        }

        res.json({
            success: true,
            message: 'Location updated successfully'
        });
    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_LOCATION_FAILED',
            message: 'Failed to update location'
        });
    }
});

// Delete location
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('locations');
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'LOCATION_NOT_FOUND',
                message: 'Location not found'
            });
        }

        res.json({
            success: true,
            message: 'Location deleted successfully'
        });
    } catch (error) {
        console.error('Delete location error:', error);
        res.status(500).json({
            success: false,
            error: 'DELETE_LOCATION_FAILED',
            message: 'Failed to delete location'
        });
    }
});

// Get locations by type
router.get('/type/:type', authenticateToken, async (req, res) => {
    try {
        const { type } = req.params;
        const { page = 1, limit = 10, city, country } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { type };
        if (city) filters.city = { $regex: city, $options: 'i' };
        if (country) filters.country = { $regex: country, $options: 'i' };

        const collection = await getCollection('locations');
        const locations = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ city: 1, country: 1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: locations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get locations by type error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_LOCATIONS_BY_TYPE_FAILED',
            message: 'Failed to retrieve locations by type'
        });
    }
});

// Get locations by city
router.get('/city/:city', authenticateToken, async (req, res) => {
    try {
        const { city } = req.params;
        const { page = 1, limit = 10, type } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { city: { $regex: city, $options: 'i' } };
        if (type) filters.type = type;

        const collection = await getCollection('locations');
        const locations = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ name: 1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: locations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get locations by city error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_LOCATIONS_BY_CITY_FAILED',
            message: 'Failed to retrieve locations by city'
        });
    }
});

// Get locations by country
router.get('/country/:country', authenticateToken, async (req, res) => {
    try {
        const { country } = req.params;
        const { page = 1, limit = 10, type } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { country: { $regex: country, $options: 'i' } };
        if (type) filters.type = type;

        const collection = await getCollection('locations');
        const locations = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ city: 1, name: 1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: locations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get locations by country error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_LOCATIONS_BY_COUNTRY_FAILED',
            message: 'Failed to retrieve locations by country'
        });
    }
});

// Search locations
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

        const collection = await getCollection('locations');
        const locations = await collection.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { city: { $regex: q, $options: 'i' } },
                { country: { $regex: q, $options: 'i' } },
                { address: { $regex: q, $options: 'i' } }
            ]
        })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ city: 1, name: 1 })
        .toArray();
        
        const total = await collection.countDocuments({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { city: { $regex: q, $options: 'i' } },
                { country: { $regex: q, $options: 'i' } },
                { address: { $regex: q, $options: 'i' } }
            ]
        });

        res.json({
            success: true,
            data: locations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Search locations error:', error);
        res.status(500).json({
            success: false,
            error: 'SEARCH_LOCATIONS_FAILED',
            message: 'Failed to search locations'
        });
    }
});

// Get nearby locations
router.get('/nearby', authenticateToken, async (req, res) => {
    try {
        const { latitude, longitude, radius = 10, type } = req.query;
        
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_COORDINATES',
                message: 'Latitude and longitude are required'
            });
        }

        const filters = {
            coordinates: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
                }
            }
        };

        if (type) filters.type = type;

        const collection = await getCollection('locations');
        const nearbyLocations = await collection.find(filters)
            .limit(20)
            .toArray();

        res.json({
            success: true,
            data: nearbyLocations
        });
    } catch (error) {
        console.error('Get nearby locations error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_NEARBY_LOCATIONS_FAILED',
            message: 'Failed to retrieve nearby locations'
        });
    }
});

// Get location statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('locations');
        
        // Get total locations
        const totalLocations = await collection.countDocuments(filters);
        
        // Get locations by type
        const locationsByType = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get locations by country
        const locationsByCountry = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]).toArray();
        
        // Get active locations
        const activeLocations = await collection.countDocuments({ 
            ...filters,
            isActive: true
        });

        res.json({
            success: true,
            data: {
                totalLocations,
                activeLocations,
                locationsByType,
                locationsByCountry
            }
        });
    } catch (error) {
        console.error('Get location stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_LOCATION_STATS_FAILED',
            message: 'Failed to retrieve location statistics'
        });
    }
});

// Get cities list
router.get('/cities/list', authenticateToken, async (req, res) => {
    try {
        const { country, type } = req.query;
        
        const filters = {};
        if (country) filters.country = country;
        if (type) filters.type = type;

        const collection = await getCollection('locations');
        const cities = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$city', country: { $first: '$country' } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        res.json({
            success: true,
            data: cities.map(city => ({
                city: city._id,
                country: city.country
            }))
        });
    } catch (error) {
        console.error('Get cities list error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CITIES_LIST_FAILED',
            message: 'Failed to retrieve cities list'
        });
    }
});

// Get countries list
router.get('/countries/list', authenticateToken, async (req, res) => {
    try {
        const { type } = req.query;
        
        const filters = {};
        if (type) filters.type = type;

        const collection = await getCollection('locations');
        const countries = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$country' } },
            { $sort: { _id: 1 } }
        ]).toArray();

        res.json({
            success: true,
            data: countries.map(country => country._id)
        });
    } catch (error) {
        console.error('Get countries list error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_COUNTRIES_LIST_FAILED',
            message: 'Failed to retrieve countries list'
        });
    }
});

module.exports = router;
