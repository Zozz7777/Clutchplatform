const geolib = require('geolib');
const userService = require('./userService');
const databaseUtils = require('../utils/databaseUtils');
const Vehicle = require('../models/Vehicle');
const ServiceCenter = require('../models/ServiceCenter');
const bookingService = require('../services/bookingService');
const AuditLog = require('../models/auditLog');

class LocationService {
    constructor() {
        this.isInitialized = false;
        this.locationCache = new Map();
        this.geofenceCache = new Map();
        this.routeCache = new Map();
        this.cacheTTL = 15 * 60 * 1000; // 15 minutes
    }

    async initialize() {
        try {
            console.log('🗺️ Initializing Location Service...');
            
            // Initialize location tracking
            await this.initializeLocationTracking();
            
            // Initialize geofencing system
            await this.initializeGeofencing();
            
            // Initialize route optimization
            await this.initializeRouteOptimization();
            
            this.isInitialized = true;
            console.log('✅ Location Service initialized successfully');
        } catch (error) {
            console.error('❌ Location Service initialization failed:', error);
            throw error;
        }
    }

    async initializeLocationTracking() {
        // Initialize location tracking components
        console.log('📍 Location tracking initialized');
    }

    async initializeGeofencing() {
        // Initialize geofencing system
        console.log('🔲 Geofencing system initialized');
    }

    async initializeRouteOptimization() {
        // Initialize route optimization
        console.log('🛣️ Route optimization initialized');
    }

    // Location Tracking
    async trackLocation(userId, location) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const locationData = {
                userId: userId,
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy || 10,
                altitude: location.altitude,
                speed: location.speed,
                heading: location.heading,
                timestamp: new Date(),
                metadata: location.metadata || {}
            };

            // Validate location data
            this.validateLocationData(locationData);

            // Store location in cache
            this.locationCache.set(userId, {
                data: locationData,
                timestamp: Date.now()
            });

            // Check geofences
            const geofenceEvents = await this.checkGeofenceStatus(userId, locationData);

            // Log location tracking
            await this.logLocationTracking(userId, locationData, geofenceEvents);

            return {
                success: true,
                location: locationData,
                geofenceEvents: geofenceEvents,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('❌ Location tracking failed:', error);
            throw new Error('Location tracking failed');
        }
    }

    validateLocationData(locationData) {
        if (!locationData.latitude || !locationData.longitude) {
            throw new Error('Latitude and longitude are required');
        }

        if (locationData.latitude < -90 || locationData.latitude > 90) {
            throw new Error('Invalid latitude value');
        }

        if (locationData.longitude < -180 || locationData.longitude > 180) {
            throw new Error('Invalid longitude value');
        }

        if (locationData.accuracy && locationData.accuracy < 0) {
            throw new Error('Accuracy must be positive');
        }
    }

    async checkGeofenceStatus(userId, locationData) {
        const events = [];
        const userGeofences = await this.getUserGeofences(userId);

        for (const geofence of userGeofences) {
            const isInside = this.isPointInGeofence(locationData, geofence);
            const previousStatus = this.geofenceCache.get(`${userId}_${geofence.id}`);

            if (isInside && (!previousStatus || !previousStatus.isInside)) {
                // User entered geofence
                events.push({
                    type: 'geofence_enter',
                    geofenceId: geofence.id,
                    geofenceName: geofence.name,
                    location: locationData,
                    timestamp: new Date()
                });

                // Trigger geofence actions
                await this.triggerGeofenceActions(geofence, 'enter', userId, locationData);
            } else if (!isInside && previousStatus && previousStatus.isInside) {
                // User exited geofence
                events.push({
                    type: 'geofence_exit',
                    geofenceId: geofence.id,
                    geofenceName: geofence.name,
                    location: locationData,
                    timestamp: new Date()
                });

                // Trigger geofence actions
                await this.triggerGeofenceActions(geofence, 'exit', userId, locationData);
            }

            // Update cache
            this.geofenceCache.set(`${userId}_${geofence.id}`, {
                isInside: isInside,
                timestamp: Date.now()
            });
        }

        return events;
    }

    isPointInGeofence(point, geofence) {
        if (geofence.type === 'circle') {
            const distance = geolib.getDistance(
                { latitude: point.latitude, longitude: point.longitude },
                { latitude: geofence.center.latitude, longitude: geofence.center.longitude }
            );
            return distance <= geofence.radius;
        } else if (geofence.type === 'polygon') {
            return geolib.isPointInPolygon(
                { latitude: point.latitude, longitude: point.longitude },
                geofence.coordinates
            );
        }
        return false;
    }

    async triggerGeofenceActions(geofence, action, userId, locationData) {
        try {
            for (const trigger of geofence.triggers || []) {
                if (trigger.action === action) {
                    switch (trigger.type) {
                        case 'notification':
                            await this.sendGeofenceNotification(userId, geofence, action);
                            break;
                        case 'booking_reminder':
                            await this.sendBookingReminder(userId, geofence);
                            break;
                        case 'service_alert':
                            await this.sendServiceAlert(userId, geofence);
                            break;
                        case 'custom_action':
                            await this.executeCustomAction(trigger, userId, locationData);
                            break;
                    }
                }
            }
        } catch (error) {
            console.error('❌ Geofence action trigger failed:', error);
        }
    }

    async sendGeofenceNotification(userId, geofence, action) {
        // Placeholder for notification sending
        console.log(`📱 Sending ${action} notification for geofence: ${geofence.name}`);
    }

    async sendBookingReminder(userId, geofence) {
        // Placeholder for booking reminder
        console.log(`📅 Sending booking reminder for geofence: ${geofence.name}`);
    }

    async sendServiceAlert(userId, geofence) {
        // Placeholder for service alert
        console.log(`🔧 Sending service alert for geofence: ${geofence.name}`);
    }

    async executeCustomAction(trigger, userId, locationData) {
        // Placeholder for custom action execution
        console.log(`⚡ Executing custom action: ${trigger.name}`);
    }

    // Nearby Services Discovery
    async findNearbyServices(location, serviceType, options = {}) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const {
                radius = 50, // km
                limit = 20,
                includeAvailability = true,
                includeRatings = true,
                includePricing = false
            } = options;

            // Get all service centers
            const serviceCenters = await databaseUtils.find('servicecenters', {
                isActive: true,
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [location.longitude, location.latitude]
                        },
                        $maxDistance: radius * 1000 // Convert to meters
                    }
                }
            }).limit(limit);

            // Filter by service type if specified
            const filteredCenters = serviceType 
                ? serviceCenters.filter(center => 
                    center.services.some(service => service.type === serviceType)
                )
                : serviceCenters;

            // Enhance with additional data
            const enhancedCenters = await Promise.all(
                filteredCenters.map(async (center) => {
                    const enhanced = {
                        id: center._id,
                        name: center.name,
                        type: center.type,
                        location: center.location,
                        address: center.address,
                        phone: center.phone,
                        email: center.email,
                        distance: this.calculateDistance(location, center.location),
                        rating: center.rating,
                        reviewCount: center.reviewCount,
                        services: center.services,
                        operatingHours: center.operatingHours,
                        isOpen: this.isServiceCenterOpen(center.operatingHours)
                    };

                    if (includeAvailability) {
                        enhanced.availability = await this.getServiceCenterAvailability(center._id);
                    }

                    if (includePricing) {
                        enhanced.pricing = await this.getServiceCenterPricing(center._id, serviceType);
                    }

                    return enhanced;
                })
            );

            // Sort by distance and rating
            enhancedCenters.sort((a, b) => {
                if (a.distance !== b.distance) {
                    return a.distance - b.distance;
                }
                return b.rating - a.rating;
            });

            return {
                success: true,
                services: enhancedCenters,
                total: enhancedCenters.length,
                searchRadius: radius,
                location: location,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('❌ Nearby services search failed:', error);
            throw new Error('Nearby services search failed');
        }
    }

    calculateDistance(point1, point2) {
        return geolib.getDistance(
            { latitude: point1.latitude, longitude: point1.longitude },
            { latitude: point2.latitude, longitude: point2.longitude }
        ) / 1000; // Convert to kilometers
    }

    isServiceCenterOpen(operatingHours) {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const currentTime = now.getHours() * 100 + now.getMinutes();

        const todayHours = operatingHours[dayOfWeek];
        if (!todayHours || !todayHours.isOpen) {
            return false;
        }

        return currentTime >= todayHours.open && currentTime <= todayHours.close;
    }

    async getServiceCenterAvailability(centerId) {
        // Placeholder for availability calculation
        return {
            nextAvailableSlot: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
            estimatedWaitTime: 30, // minutes
            capacity: 0.7 // 70% capacity
        };
    }

    async getServiceCenterPricing(centerId, serviceType) {
        // Placeholder for pricing information
        return {
            basePrice: 150,
            currency: 'EGP',
            estimatedRange: {
                min: 120,
                max: 200
            }
        };
    }

    // Route Optimization
    async optimizeRoutes(waypoints, options = {}) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const {
                optimizeFor = 'time', // 'time', 'distance', 'cost'
                avoidTolls = false,
                avoidHighways = false,
                trafficAware = true,
                departureTime = new Date()
            } = options;

            if (waypoints.length < 2) {
                throw new Error('At least 2 waypoints are required');
            }

            // Calculate optimal route
            const optimizedRoute = await this.calculateOptimalRoute(waypoints, {
                optimizeFor,
                avoidTolls,
                avoidHighways,
                trafficAware,
                departureTime
            });

            // Cache the route
            const routeKey = this.generateRouteKey(waypoints, options);
            this.routeCache.set(routeKey, {
                route: optimizedRoute,
                timestamp: Date.now()
            });

            return {
                success: true,
                route: optimizedRoute,
                waypoints: waypoints,
                options: options,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('❌ Route optimization failed:', error);
            throw new Error('Route optimization failed');
        }
    }

    async calculateOptimalRoute(waypoints, options) {
        // Placeholder for route calculation algorithm
        const route = {
            waypoints: waypoints,
            totalDistance: this.calculateTotalDistance(waypoints),
            totalDuration: this.calculateTotalDuration(waypoints),
            totalCost: this.calculateTotalCost(waypoints),
            segments: this.generateRouteSegments(waypoints),
            trafficInfo: await this.getTrafficInfo(waypoints),
            alternatives: this.generateAlternativeRoutes(waypoints)
        };

        return route;
    }

    calculateTotalDistance(waypoints) {
        let totalDistance = 0;
        for (let i = 0; i < waypoints.length - 1; i++) {
            totalDistance += this.calculateDistance(waypoints[i], waypoints[i + 1]);
        }
        return totalDistance;
    }

    calculateTotalDuration(waypoints) {
        // Placeholder for duration calculation
        const baseDuration = this.calculateTotalDistance(waypoints) * 2; // 2 minutes per km
        return Math.round(baseDuration);
    }

    calculateTotalCost(waypoints) {
        // Placeholder for cost calculation
        const distance = this.calculateTotalDistance(waypoints);
        const fuelCost = distance * 0.15; // $0.15 per km
        const tollCost = 0; // Placeholder for toll calculation
        return fuelCost + tollCost;
    }

    generateRouteSegments(waypoints) {
        const segments = [];
        for (let i = 0; i < waypoints.length - 1; i++) {
            segments.push({
                from: waypoints[i],
                to: waypoints[i + 1],
                distance: this.calculateDistance(waypoints[i], waypoints[i + 1]),
                duration: this.calculateDistance(waypoints[i], waypoints[i + 1]) * 2,
                instructions: this.generateInstructions(waypoints[i], waypoints[i + 1])
            });
        }
        return segments;
    }

    generateInstructions(from, to) {
        // Placeholder for turn-by-turn instructions
        return [
            'Head north on Main St',
            'Turn right onto Oak Ave',
            'Continue for 2.5 km',
            'Arrive at destination'
        ];
    }

    async getTrafficInfo(waypoints) {
        // Placeholder for traffic information
        return {
            currentTraffic: 'moderate',
            delay: 5, // minutes
            congestionLevel: 0.3
        };
    }

    generateAlternativeRoutes(waypoints) {
        // Placeholder for alternative routes
        return [
            {
                name: 'Fastest Route',
                distance: this.calculateTotalDistance(waypoints),
                duration: this.calculateTotalDuration(waypoints),
                cost: this.calculateTotalCost(waypoints)
            },
            {
                name: 'Scenic Route',
                distance: this.calculateTotalDistance(waypoints) * 1.2,
                duration: this.calculateTotalDuration(waypoints) * 1.3,
                cost: this.calculateTotalCost(waypoints) * 1.1
            }
        ];
    }

    generateRouteKey(waypoints, options) {
        return JSON.stringify({ waypoints, options });
    }

    // Geofencing
    async createGeofence(geofenceData) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const geofence = {
                id: this.generateGeofenceId(),
                name: geofenceData.name,
                type: geofenceData.type, // 'circle' or 'polygon'
                coordinates: geofenceData.coordinates,
                center: geofenceData.center,
                radius: geofenceData.radius,
                triggers: geofenceData.triggers || [],
                isActive: true,
                createdBy: geofenceData.createdBy,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Validate geofence data
            this.validateGeofenceData(geofence);

            // Store geofence
            await this.storeGeofence(geofence);

            return {
                success: true,
                geofence: geofence,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('❌ Geofence creation failed:', error);
            throw new Error('Geofence creation failed');
        }
    }

    validateGeofenceData(geofence) {
        if (!geofence.name) {
            throw new Error('Geofence name is required');
        }

        if (geofence.type === 'circle') {
            if (!geofence.center || !geofence.radius) {
                throw new Error('Center and radius are required for circle geofences');
            }
        } else if (geofence.type === 'polygon') {
            if (!geofence.coordinates || geofence.coordinates.length < 3) {
                throw new Error('At least 3 coordinates are required for polygon geofences');
            }
        } else {
            throw new Error('Invalid geofence type');
        }
    }

    generateGeofenceId() {
        return `geofence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async storeGeofence(geofence) {
        // Placeholder for geofence storage
        console.log('💾 Storing geofence:', geofence.name);
    }

    async getUserGeofences(userId) {
        // Placeholder for user geofences retrieval
        return [
            {
                id: 'home_geofence',
                name: 'Home',
                type: 'circle',
                center: { latitude: 40.7128, longitude: -74.0060 },
                radius: 1000, // meters
                triggers: [
                    {
                        action: 'enter',
                        type: 'notification',
                        message: 'Welcome home!'
                    }
                ]
            },
            {
                id: 'work_geofence',
                name: 'Work',
                type: 'circle',
                center: { latitude: 40.7589, longitude: -73.9851 },
                radius: 500, // meters
                triggers: [
                    {
                        action: 'enter',
                        type: 'booking_reminder',
                        message: 'Don\'t forget your appointment!'
                    }
                ]
            }
        ];
    }

    // Location History
    async getLocationHistory(userId, options = {}) {
        try {
            const {
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                endDate = new Date(),
                limit = 100,
                includeMetadata = true
            } = options;

            // Placeholder for location history retrieval
            const history = [
                {
                    latitude: 40.7128,
                    longitude: -74.0060,
                    timestamp: new Date(Date.now() - 60 * 60 * 1000),
                    accuracy: 10,
                    speed: 0,
                    heading: 0
                },
                {
                    latitude: 40.7589,
                    longitude: -73.9851,
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    accuracy: 15,
                    speed: 25,
                    heading: 90
                }
            ];

            return {
                success: true,
                history: history,
                total: history.length,
                period: { startDate, endDate },
                timestamp: new Date()
            };
        } catch (error) {
            console.error('❌ Location history retrieval failed:', error);
            throw new Error('Location history retrieval failed');
        }
    }

    // Utility Methods
    async logLocationTracking(userId, locationData, geofenceEvents) {
        try {
            const auditLog = new AuditLog({
                userId: userId,
                action: 'location_tracking',
                details: 'Location tracked successfully',
                metadata: {
                    location: locationData,
                    geofenceEvents: geofenceEvents,
                    timestamp: new Date()
                },
                category: 'location',
                outcome: 'success'
            });
            
            await auditLog.save();
        } catch (error) {
            console.error('❌ Failed to log location tracking:', error);
        }
    }

    async clearCache() {
        this.locationCache.clear();
        this.geofenceCache.clear();
        this.routeCache.clear();
        console.log('✅ Location Service cache cleared');
    }

    async getServiceStatus() {
        return {
            isInitialized: this.isInitialized,
            cacheSize: {
                locations: this.locationCache.size,
                geofences: this.geofenceCache.size,
                routes: this.routeCache.size
            },
            lastActivity: new Date()
        };
    }
}

module.exports = new LocationService();
