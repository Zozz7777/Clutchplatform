const axios = require('axios');
const { logger } = require('../config/logger');
const Fleet = require('../models/Fleet');
const FleetVehicle = require('../models/FleetVehicle');
const Driver = require('../models/driver');
const TelematicsData = require('../models/telematicsData');
const GPSDevice = require('../models/gpsDevice');
const OBD2Device = require('../models/obd2Device');

class FleetService {
  constructor() {
    this.gpsProviders = {
      garmin: { apiKey: process.env.GARMIN_API_KEY },
      tomtom: { apiKey: process.env.TOMTOM_API_KEY },
      here: { apiKey: process.env.HERE_API_KEY }
    };
    
    this.obd2Providers = {
      automatic: { apiKey: process.env.AUTOMATIC_API_KEY },
      obdlink: { apiKey: process.env.OBDLINK_API_KEY },
      bluedriver: { apiKey: process.env.BLUEDRIVER_API_KEY }
    };
    
    this.geofenceCache = new Map();
    this.telematicsCache = new Map();
  }

  // Initialize fleet service
  async initialize() {
    try {
      await this.loadGeofences();
      await this.initializeTelematics();
      logger.info('✅ Fleet service initialized');
    } catch (error) {
      logger.error('❌ Fleet service initialization failed:', error);
    }
  }

  // Create fleet
  async createFleet(fleetData) {
    try {
      const fleet = new Fleet({
        ...fleetData,
        status: 'active',
        createdAt: new Date()
      });

      await fleet.save();

      logger.info(`✅ Fleet created: ${fleet.fleetId}`);
      return fleet;
    } catch (error) {
      logger.error('❌ Error creating fleet:', error);
      throw new Error('Failed to create fleet');
    }
  }

  // Add vehicle to fleet
  async addVehicleToFleet(fleetId, vehicleData) {
    try {
      const fleet = await Fleet.findOne({ fleetId });
      if (!fleet) {
        throw new Error('Fleet not found');
      }

      const vehicle = new FleetVehicle({
        fleetId: fleet._id,
        ...vehicleData,
        status: 'active',
        addedAt: new Date()
      });

      await vehicle.save();

      // Update fleet vehicle count
      fleet.vehicleCount = (fleet.vehicleCount || 0) + 1;
      await fleet.save();

      logger.info(`✅ Vehicle added to fleet: ${vehicle.vehicleId}`);
      return vehicle;
    } catch (error) {
      logger.error('❌ Error adding vehicle to fleet:', error);
      throw new Error('Failed to add vehicle to fleet');
    }
  }

  // Get fleet vehicles
  async getFleetVehicles(fleetId, filters = {}) {
    try {
      const fleet = await Fleet.findOne({ fleetId });
      if (!fleet) {
        throw new Error('Fleet not found');
      }

      let query = FleetVehicle.find({ fleetId: fleet._id });
      
      if (filters.status) {
        query = query.where('status', filters.status);
      }
      
      if (filters.vehicleType) {
        query = query.where('vehicleType', filters.vehicleType);
      }

      const vehicles = await query.populate('driverId').exec();
      return vehicles;
    } catch (error) {
      logger.error('❌ Error fetching fleet vehicles:', error);
      throw new Error('Failed to fetch fleet vehicles');
    }
  }

  // GPS Integration
  async integrateGPSDevice(vehicleId, deviceData) {
    try {
      const vehicle = await FleetVehicle.findOne({ vehicleId });
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      const gpsDevice = new GPSDevice({
        vehicleId: vehicle._id,
        deviceType: 'gps_tracker',
        provider: deviceData.provider,
        deviceId: deviceData.deviceId,
        apiKey: deviceData.apiKey,
        status: 'active',
        lastSeen: new Date(),
        capabilities: {
          realTimeTracking: true,
          geofencing: true,
          routeHistory: true,
          speedMonitoring: true,
          fuelMonitoring: deviceData.fuelMonitoring || false
        },
        configuration: {
          updateInterval: deviceData.updateInterval || 30,
          geofenceRadius: deviceData.geofenceRadius || 100,
          alertThresholds: {
            speedLimit: deviceData.speedLimit || 120,
            idleTime: deviceData.idleTime || 300
          }
        }
      });

      await gpsDevice.save();

      // Start real-time tracking
      await this.startRealTimeTracking(gpsDevice);

      logger.info(`✅ GPS device integrated: ${gpsDevice.deviceId}`);
      return gpsDevice;
    } catch (error) {
      logger.error('❌ Error integrating GPS device:', error);
      throw new Error('Failed to integrate GPS device');
    }
  }

  // OBD2 Integration
  async integrateOBD2Device(vehicleId, deviceData) {
    try {
      const vehicle = await FleetVehicle.findOne({ vehicleId });
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      const obd2Device = new OBD2Device({
        vehicleId: vehicle._id,
        deviceType: 'obd2_reader',
        connectionType: deviceData.connectionType,
        deviceId: deviceData.deviceId,
        manufacturer: deviceData.manufacturer,
        model: deviceData.model,
        status: 'active',
        lastSeen: new Date(),
        capabilities: {
          engineData: true,
          fuelEfficiency: true,
          diagnosticCodes: true,
          realTimeMonitoring: true,
          tripData: true
        },
        configuration: {
          updateInterval: deviceData.updateInterval || 60,
          dataPoints: deviceData.dataPoints || ['speed', 'rpm', 'fuel_level', 'engine_temp'],
          alertThresholds: {
            engineTemp: deviceData.engineTempThreshold || 100,
            fuelLevel: deviceData.fuelLevelThreshold || 20,
            speedLimit: deviceData.speedLimit || 120
          }
        }
      });

      await obd2Device.save();

      // Start OBD2 monitoring
      await this.startOBD2Monitoring(obd2Device);

      logger.info(`✅ OBD2 device integrated: ${obd2Device.deviceId}`);
      return obd2Device;
    } catch (error) {
      logger.error('❌ Error integrating OBD2 device:', error);
      throw new Error('Failed to integrate OBD2 device');
    }
  }

  // Real-time tracking
  async startRealTimeTracking(gpsDevice) {
    try {
      const provider = this.gpsProviders[gpsDevice.provider];
      if (!provider) {
        throw new Error('Unsupported GPS provider');
      }

      // Start tracking based on provider
      switch (gpsDevice.provider) {
        case 'garmin':
          await this.startGarminTracking(gpsDevice, provider.apiKey);
          break;
        case 'tomtom':
          await this.startTomTomTracking(gpsDevice, provider.apiKey);
          break;
        case 'here':
          await this.startHereTracking(gpsDevice, provider.apiKey);
          break;
        default:
          throw new Error('Unsupported GPS provider');
      }

      logger.info(`✅ Real-time tracking started for device: ${gpsDevice.deviceId}`);
    } catch (error) {
      logger.error('❌ Error starting real-time tracking:', error);
      throw new Error('Failed to start real-time tracking');
    }
  }

  // OBD2 monitoring
  async startOBD2Monitoring(obd2Device) {
    try {
      const provider = this.obd2Providers[obd2Device.manufacturer];
      if (!provider) {
        throw new Error('Unsupported OBD2 provider');
      }

      // Start monitoring based on provider
      switch (obd2Device.manufacturer) {
        case 'automatic':
          await this.startAutomaticMonitoring(obd2Device, provider.apiKey);
          break;
        case 'obdlink':
          await this.startOBDLinkMonitoring(obd2Device, provider.apiKey);
          break;
        case 'bluedriver':
          await this.startBlueDriverMonitoring(obd2Device, provider.apiKey);
          break;
        default:
          throw new Error('Unsupported OBD2 provider');
      }

      logger.info(`✅ OBD2 monitoring started for device: ${obd2Device.deviceId}`);
    } catch (error) {
      logger.error('❌ Error starting OBD2 monitoring:', error);
      throw new Error('Failed to start OBD2 monitoring');
    }
  }

  // Telematics data processing
  async processTelematicsData(deviceId, data) {
    try {
      const telematicsData = new TelematicsData({
        deviceId: deviceId,
        timestamp: new Date(),
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy
        },
        speed: data.speed,
        heading: data.heading,
        altitude: data.altitude,
        engineData: data.engineData || {},
        fuelData: data.fuelData || {},
        diagnosticData: data.diagnosticData || {},
        metadata: data.metadata || {}
      });

      await telematicsData.save();

      // Process real-time alerts
      await this.processRealTimeAlerts(telematicsData);

      // Update vehicle status
      await this.updateVehicleStatus(deviceId, telematicsData);

      logger.debug(`✅ Telematics data processed: ${telematicsData._id}`);
      return telematicsData;
    } catch (error) {
      logger.error('❌ Error processing telematics data:', error);
      throw new Error('Failed to process telematics data');
    }
  }

  // Driver behavior analysis
  async analyzeDriverBehavior(driverId, timeRange = {}) {
    try {
      const startDate = timeRange.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = timeRange.endDate || new Date();

      const telematicsData = await TelematicsData.find({
        driverId: driverId,
        timestamp: { $gte: startDate, $lte: endDate }
      }).sort({ timestamp: 1 });

      const behaviorMetrics = {
        safetyScore: this.calculateSafetyScore(telematicsData),
        efficiencyScore: this.calculateEfficiencyScore(telematicsData),
        riskFactors: this.identifyRiskFactors(telematicsData),
        drivingPatterns: this.analyzeDrivingPatterns(telematicsData),
        recommendations: this.generateDriverRecommendations(telematicsData)
      };

      // Update driver profile
      await Driver.findByIdAndUpdate(driverId, {
        lastBehaviorAnalysis: new Date(),
        behaviorMetrics: behaviorMetrics
      });

      logger.info(`✅ Driver behavior analysis completed: ${driverId}`);
      return behaviorMetrics;
    } catch (error) {
      logger.error('❌ Error analyzing driver behavior:', error);
      throw new Error('Failed to analyze driver behavior');
    }
  }

  // Geofencing
  async createGeofence(fleetId, geofenceData) {
    try {
      const fleet = await Fleet.findOne({ fleetId });
      if (!fleet) {
        throw new Error('Fleet not found');
      }

      const geofence = {
        id: `geofence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fleetId: fleet._id,
        name: geofenceData.name,
        type: geofenceData.type, // 'circle', 'polygon'
        coordinates: geofenceData.coordinates,
        radius: geofenceData.radius, // for circle type
        triggers: geofenceData.triggers || ['entry', 'exit', 'dwell'],
        actions: geofenceData.actions || ['notification'],
        isActive: true,
        createdAt: new Date()
      };

      // Store in cache and database
      this.geofenceCache.set(geofence.id, geofence);
      
      // Update fleet geofences
      fleet.geofences = fleet.geofences || [];
      fleet.geofences.push(geofence);
      await fleet.save();

      logger.info(`✅ Geofence created: ${geofence.id}`);
      return geofence;
    } catch (error) {
      logger.error('❌ Error creating geofence:', error);
      throw new Error('Failed to create geofence');
    }
  }

  // Route optimization
  async optimizeRoute(waypoints, constraints = {}) {
    try {
      const {
        fleetId,
        vehicleType,
        fuelEfficiency,
        timeWindows,
        trafficConditions
      } = constraints;

      // This would integrate with routing APIs like Google Maps, Mapbox, etc.
      const optimizedRoute = {
        waypoints: waypoints,
        optimizedWaypoints: this.optimizeWaypointOrder(waypoints),
        totalDistance: this.calculateTotalDistance(waypoints),
        totalTime: this.calculateTotalTime(waypoints),
        fuelEfficiency: this.calculateFuelEfficiency(waypoints, fuelEfficiency),
        optimizationScore: 0.85,
        alternatives: this.generateAlternativeRoutes(waypoints)
      };

      logger.info(`✅ Route optimized: ${optimizedRoute.totalDistance}km`);
      return optimizedRoute;
    } catch (error) {
      logger.error('❌ Error optimizing route:', error);
      throw new Error('Failed to optimize route');
    }
  }

  // Fleet analytics
  async getFleetAnalytics(fleetId, period = 'month') {
    try {
      const fleet = await Fleet.findOne({ fleetId });
      if (!fleet) {
        throw new Error('Fleet not found');
      }

      const startDate = this.getPeriodStartDate(period);
      
      const vehicles = await FleetVehicle.find({ fleetId: fleet._id });
      const vehicleIds = vehicles.map(v => v._id);

      const telematicsData = await TelematicsData.find({
        vehicleId: { $in: vehicleIds },
        timestamp: { $gte: startDate }
      });

      const analytics = {
        fleetOverview: this.calculateFleetOverview(vehicles, telematicsData),
        performanceMetrics: this.calculatePerformanceMetrics(telematicsData),
        costAnalysis: await this.calculateCostAnalysis(fleetId, period),
        driverMetrics: await this.calculateDriverMetrics(fleetId, period),
        maintenanceInsights: this.calculateMaintenanceInsights(telematicsData),
        fuelEfficiency: this.calculateFuelEfficiency(telematicsData),
        safetyMetrics: this.calculateSafetyMetrics(telematicsData)
      };

      logger.info(`✅ Fleet analytics generated: ${fleetId}`);
      return analytics;
    } catch (error) {
      logger.error('❌ Error generating fleet analytics:', error);
      throw new Error('Failed to generate fleet analytics');
    }
  }

  // Helper methods
  calculateSafetyScore(telematicsData) {
    let score = 100;
    
    telematicsData.forEach(data => {
      if (data.speed > 120) score -= 5; // Speed violations
      if (data.engineData?.rpm > 4000) score -= 3; // High RPM
      if (data.location?.accuracy > 50) score -= 2; // Poor GPS accuracy
    });
    
    return Math.max(0, score);
  }

  calculateEfficiencyScore(telematicsData) {
    let totalFuel = 0;
    let totalDistance = 0;
    
    telematicsData.forEach(data => {
      if (data.fuelData?.consumption) totalFuel += data.fuelData.consumption;
      if (data.speed) totalDistance += data.speed * (data.timestamp - data.timestamp) / 3600;
    });
    
    return totalDistance > 0 ? totalDistance / totalFuel : 0;
  }

  identifyRiskFactors(telematicsData) {
    const riskFactors = [];
    
    telematicsData.forEach(data => {
      if (data.speed > 120) riskFactors.push('speeding');
      if (data.engineData?.rpm > 4000) riskFactors.push('high_rpm');
      if (data.fuelData?.level < 20) riskFactors.push('low_fuel');
    });
    
    return [...new Set(riskFactors)];
  }

  analyzeDrivingPatterns(telematicsData) {
    return {
      averageSpeed: telematicsData.reduce((sum, d) => sum + (d.speed || 0), 0) / telematicsData.length,
      maxSpeed: Math.max(...telematicsData.map(d => d.speed || 0)),
      idleTime: telematicsData.filter(d => d.speed === 0).length,
      totalDistance: telematicsData.reduce((sum, d) => sum + (d.speed || 0), 0)
    };
  }

  generateDriverRecommendations(telematicsData) {
    const recommendations = [];
    
    const avgSpeed = telematicsData.reduce((sum, d) => sum + (d.speed || 0), 0) / telematicsData.length;
    if (avgSpeed > 100) recommendations.push('reduce_average_speed');
    
    const highRPMCount = telematicsData.filter(d => d.engineData?.rpm > 4000).length;
    if (highRPMCount > telematicsData.length * 0.1) recommendations.push('avoid_high_rpm');
    
    return recommendations;
  }

  optimizeWaypointOrder(waypoints) {
    // Simple nearest neighbor algorithm
    const optimized = [waypoints[0]];
    const remaining = waypoints.slice(1);
    
    while (remaining.length > 0) {
      const current = optimized[optimized.length - 1];
      let nearest = remaining[0];
      let minDistance = this.calculateDistance(current, nearest);
      
      for (let i = 1; i < remaining.length; i++) {
        const distance = this.calculateDistance(current, remaining[i]);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = remaining[i];
        }
      }
      
      optimized.push(nearest);
      remaining.splice(remaining.indexOf(nearest), 1);
    }
    
    return optimized;
  }

  calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  calculateTotalDistance(waypoints) {
    let total = 0;
    for (let i = 1; i < waypoints.length; i++) {
      total += this.calculateDistance(waypoints[i-1], waypoints[i]);
    }
    return total;
  }

  calculateTotalTime(waypoints) {
    return this.calculateTotalDistance(waypoints) * 2; // Assume 30 km/h average
  }

  calculateFuelEfficiency(waypoints, baseEfficiency = 10) {
    const distance = this.calculateTotalDistance(waypoints);
    return distance / baseEfficiency;
  }

  generateAlternativeRoutes(waypoints) {
    // Generate alternative routes (simplified)
    return [
      { name: 'Fastest', waypoints: waypoints, time: this.calculateTotalTime(waypoints) * 0.8 },
      { name: 'Most Efficient', waypoints: waypoints, fuel: this.calculateFuelEfficiency(waypoints) * 0.9 }
    ];
  }

  getPeriodStartDate(period) {
    const now = new Date();
    switch (period) {
      case 'week': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month': return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter': return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      case 'year': return new Date(now.getFullYear(), 0, 1);
      default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  calculateFleetOverview(vehicles, telematicsData) {
    return {
      totalVehicles: vehicles.length,
      activeVehicles: vehicles.filter(v => v.status === 'active').length,
      totalDistance: telematicsData.reduce((sum, d) => sum + (d.speed || 0), 0),
      averageUtilization: vehicles.length > 0 ? telematicsData.length / vehicles.length : 0
    };
  }

  calculatePerformanceMetrics(telematicsData) {
    return {
      averageSpeed: telematicsData.reduce((sum, d) => sum + (d.speed || 0), 0) / telematicsData.length,
      maxSpeed: Math.max(...telematicsData.map(d => d.speed || 0)),
      totalIdleTime: telematicsData.filter(d => d.speed === 0).length,
      fuelEfficiency: this.calculateFuelEfficiency(telematicsData)
    };
  }

  async calculateCostAnalysis(fleetId, period) {
    // This would integrate with financial data
    return {
      fuelCost: 0,
      maintenanceCost: 0,
      insuranceCost: 0,
      totalCost: 0
    };
  }

  async calculateDriverMetrics(fleetId, period) {
    // This would analyze driver performance
    return {
      averageSafetyScore: 85,
      topDrivers: [],
      improvementAreas: []
    };
  }

  calculateMaintenanceInsights(telematicsData) {
    return {
      maintenanceAlerts: [],
      predictedIssues: [],
      recommendedServices: []
    };
  }

  calculateSafetyMetrics(telematicsData) {
    return {
      safetyScore: this.calculateSafetyScore(telematicsData),
      riskFactors: this.identifyRiskFactors(telematicsData),
      incidentCount: 0
    };
  }

  // Provider-specific methods (placeholders)
  async startGarminTracking(device, apiKey) {
    // Garmin API integration
    logger.info(`Starting Garmin tracking for device: ${device.deviceId}`);
  }

  async startTomTomTracking(device, apiKey) {
    // TomTom API integration
    logger.info(`Starting TomTom tracking for device: ${device.deviceId}`);
  }

  async startHereTracking(device, apiKey) {
    // HERE API integration
    logger.info(`Starting HERE tracking for device: ${device.deviceId}`);
  }

  async startAutomaticMonitoring(device, apiKey) {
    // Automatic API integration
    logger.info(`Starting Automatic monitoring for device: ${device.deviceId}`);
  }

  async startOBDLinkMonitoring(device, apiKey) {
    // OBDLink API integration
    logger.info(`Starting OBDLink monitoring for device: ${device.deviceId}`);
  }

  async startBlueDriverMonitoring(device, apiKey) {
    // BlueDriver API integration
    logger.info(`Starting BlueDriver monitoring for device: ${device.deviceId}`);
  }

  async loadGeofences() {
    // Load geofences from database to cache
    logger.info('Loading geofences to cache');
  }

  async initializeTelematics() {
    // Initialize telematics processing
    logger.info('Initializing telematics processing');
  }

  async processRealTimeAlerts(telematicsData) {
    // Process real-time alerts based on telematics data
    logger.debug('Processing real-time alerts');
  }

  async updateVehicleStatus(deviceId, telematicsData) {
    // Update vehicle status based on telematics data
    logger.debug('Updating vehicle status');
  }
}

module.exports = new FleetService();
