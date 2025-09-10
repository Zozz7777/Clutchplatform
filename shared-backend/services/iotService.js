const { logger } = require('../config/logger');
const crypto = require('crypto');

/**
 * IoT Service
 * Manages vehicle telemetry, OBD-II integration, and connected vehicle diagnostics
 */
class IoTService {
  constructor() {
    this.connectedVehicles = new Map();
    this.telemetryData = new Map();
    this.obdDevices = new Map();
    this.predictiveModels = new Map();
    this.initializeService();
  }

  /**
   * Initialize IoT service
   */
  initializeService() {
    // Initialize predictive models
    this.predictiveModels.set('engine_health', {
      algorithm: 'random_forest',
      accuracy: 0.92,
      lastUpdated: new Date(),
      features: ['rpm', 'temperature', 'oil_pressure', 'fuel_level', 'speed']
    });

    this.predictiveModels.set('battery_health', {
      algorithm: 'gradient_boosting',
      accuracy: 0.89,
      lastUpdated: new Date(),
      features: ['voltage', 'current', 'temperature', 'age', 'charge_cycles']
    });

    this.predictiveModels.set('tire_health', {
      algorithm: 'neural_network',
      accuracy: 0.87,
      lastUpdated: new Date(),
      features: ['pressure', 'temperature', 'wear', 'age', 'load']
    });

    logger.info('IoT Service initialized');
  }

  /**
   * Connect vehicle to IoT network
   */
  async connectVehicle(vehicleData) {
    try {
      const {
        vehicleId,
        userId,
        make,
        model,
        year,
        vin,
        deviceId,
        connectionType = 'obd_ii'
      } = vehicleData;

      const connectionId = crypto.randomUUID();
      
      const vehicleConnection = {
        connectionId,
        vehicleId,
        userId,
        deviceId,
        connectionType,
        status: 'connected',
        connectedAt: new Date(),
        lastHeartbeat: new Date(),
        telemetry: {
          engine: {},
          battery: {},
          tires: {},
          location: {},
          diagnostics: {}
        },
        alerts: [],
        settings: {
          dataCollectionInterval: 30, // seconds
          alertThresholds: {
            engineTemperature: 220, // Fahrenheit
            oilPressure: 10, // PSI
            batteryVoltage: 11.5, // Volts
            tirePressure: 25 // PSI
          }
        }
      };

      this.connectedVehicles.set(connectionId, vehicleConnection);
      
      // Initialize telemetry data storage
      this.telemetryData.set(vehicleId, {
        history: [],
        current: {},
        alerts: [],
        predictions: {}
      });

      logger.info(`Vehicle connected: ${vehicleId} (${make} ${model} ${year})`);
      return vehicleConnection;
    } catch (error) {
      logger.error('Error connecting vehicle:', error);
      throw error;
    }
  }

  /**
   * Disconnect vehicle from IoT network
   */
  async disconnectVehicle(connectionId) {
    try {
      const vehicle = this.connectedVehicles.get(connectionId);
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      vehicle.status = 'disconnected';
      vehicle.disconnectedAt = new Date();

      logger.info(`Vehicle disconnected: ${vehicle.vehicleId}`);
      return true;
    } catch (error) {
      logger.error('Error disconnecting vehicle:', error);
      throw error;
    }
  }

  /**
   * Update vehicle telemetry data
   */
  async updateTelemetry(connectionId, telemetryData) {
    try {
      const vehicle = this.connectedVehicles.get(connectionId);
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      const timestamp = new Date();
      
      // Update current telemetry
      vehicle.telemetry = {
        ...vehicle.telemetry,
        ...telemetryData,
        timestamp
      };

      vehicle.lastHeartbeat = timestamp;

      // Store in history
      const vehicleTelemetry = this.telemetryData.get(vehicle.vehicleId);
      if (vehicleTelemetry) {
        vehicleTelemetry.history.push({
          ...telemetryData,
          timestamp
        });

        // Keep only last 1000 records
        if (vehicleTelemetry.history.length > 1000) {
          vehicleTelemetry.history = vehicleTelemetry.history.slice(-1000);
        }

        vehicleTelemetry.current = telemetryData;
      }

      // Check for alerts
      await this.checkAlerts(vehicle, telemetryData);

      // Update predictive models
      await this.updatePredictions(vehicle.vehicleId, telemetryData);

      logger.debug(`Telemetry updated for vehicle: ${vehicle.vehicleId}`);
      return true;
    } catch (error) {
      logger.error('Error updating telemetry:', error);
      throw error;
    }
  }

  /**
   * Check for alerts based on telemetry data
   */
  async checkAlerts(vehicle, telemetryData) {
    try {
      const alerts = [];
      const settings = vehicle.settings.alertThresholds;

      // Engine temperature alert
      if (telemetryData.engine?.temperature > settings.engineTemperature) {
        alerts.push({
          type: 'engine_temperature_high',
          severity: 'warning',
          message: `Engine temperature is high: ${telemetryData.engine.temperature}°F`,
          timestamp: new Date(),
          data: telemetryData.engine
        });
      }

      // Oil pressure alert
      if (telemetryData.engine?.oilPressure < settings.oilPressure) {
        alerts.push({
          type: 'oil_pressure_low',
          severity: 'critical',
          message: `Oil pressure is low: ${telemetryData.engine.oilPressure} PSI`,
          timestamp: new Date(),
          data: telemetryData.engine
        });
      }

      // Battery voltage alert
      if (telemetryData.battery?.voltage < settings.batteryVoltage) {
        alerts.push({
          type: 'battery_voltage_low',
          severity: 'warning',
          message: `Battery voltage is low: ${telemetryData.battery.voltage}V`,
          timestamp: new Date(),
          data: telemetryData.battery
        });
      }

      // Tire pressure alert
      if (telemetryData.tires) {
        Object.entries(telemetryData.tires).forEach(([position, tire]) => {
          if (tire.pressure < settings.tirePressure) {
            alerts.push({
              type: 'tire_pressure_low',
              severity: 'warning',
              message: `${position} tire pressure is low: ${tire.pressure} PSI`,
              timestamp: new Date(),
              data: { position, tire }
            });
          }
        });
      }

      // Add alerts to vehicle
      vehicle.alerts.push(...alerts);

      // Store alerts in telemetry data
      const vehicleTelemetry = this.telemetryData.get(vehicle.vehicleId);
      if (vehicleTelemetry) {
        vehicleTelemetry.alerts.push(...alerts);
      }

      // Send notifications for critical alerts
      const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
      if (criticalAlerts.length > 0) {
        await this.sendCriticalAlert(vehicle, criticalAlerts);
      }

      return alerts;
    } catch (error) {
      logger.error('Error checking alerts:', error);
      return [];
    }
  }

  /**
   * Send critical alert notifications
   */
  async sendCriticalAlert(vehicle, alerts) {
    try {
      const notificationService = require('./notificationService');
      
      for (const alert of alerts) {
        await notificationService.sendNotification({
          userId: vehicle.userId,
          type: 'critical_alert',
          title: 'Vehicle Critical Alert',
          message: alert.message,
          data: {
            vehicleId: vehicle.vehicleId,
            alertType: alert.type,
            severity: alert.severity,
            telemetryData: alert.data
          },
          priority: 'high'
        });
      }

      logger.info(`Sent ${alerts.length} critical alerts for vehicle: ${vehicle.vehicleId}`);
    } catch (error) {
      logger.error('Error sending critical alert:', error);
    }
  }

  /**
   * Update predictive models with new data
   */
  async updatePredictions(vehicleId, telemetryData) {
    try {
      const vehicleTelemetry = this.telemetryData.get(vehicleId);
      if (!vehicleTelemetry) return;

      // Update engine health prediction
      if (telemetryData.engine) {
        const engineHealth = await this.predictEngineHealth(telemetryData.engine);
        vehicleTelemetry.predictions.engineHealth = engineHealth;
      }

      // Update battery health prediction
      if (telemetryData.battery) {
        const batteryHealth = await this.predictBatteryHealth(telemetryData.battery);
        vehicleTelemetry.predictions.batteryHealth = batteryHealth;
      }

      // Update tire health prediction
      if (telemetryData.tires) {
        const tireHealth = await this.predictTireHealth(telemetryData.tires);
        vehicleTelemetry.predictions.tireHealth = tireHealth;
      }

      logger.debug(`Updated predictions for vehicle: ${vehicleId}`);
    } catch (error) {
      logger.error('Error updating predictions:', error);
    }
  }

  /**
   * Predict engine health
   */
  async predictEngineHealth(engineData) {
    try {
      const model = this.predictiveModels.get('engine_health');
      
      // Simulate ML prediction
      const features = [
        engineData.rpm || 0,
        engineData.temperature || 0,
        engineData.oilPressure || 0,
        engineData.fuelLevel || 0,
        engineData.speed || 0
      ];

      // Simple health score calculation (in production, this would use actual ML model)
      let healthScore = 100;
      
      if (engineData.temperature > 200) healthScore -= 20;
      if (engineData.oilPressure < 15) healthScore -= 30;
      if (engineData.rpm > 6000) healthScore -= 10;
      if (engineData.fuelLevel < 10) healthScore -= 5;

      const prediction = {
        healthScore: Math.max(0, healthScore),
        confidence: model.accuracy,
        riskLevel: healthScore < 50 ? 'high' : healthScore < 75 ? 'medium' : 'low',
        recommendations: this.getEngineRecommendations(engineData),
        nextMaintenance: this.calculateNextMaintenance(engineData),
        timestamp: new Date()
      };

      return prediction;
    } catch (error) {
      logger.error('Error predicting engine health:', error);
      return null;
    }
  }

  /**
   * Predict battery health
   */
  async predictBatteryHealth(batteryData) {
    try {
      const model = this.predictiveModels.get('battery_health');
      
      // Simulate ML prediction
      let healthScore = 100;
      
      if (batteryData.voltage < 12) healthScore -= 30;
      if (batteryData.voltage < 11.5) healthScore -= 50;
      if (batteryData.temperature > 120) healthScore -= 20;
      if (batteryData.age > 5) healthScore -= 25;

      const prediction = {
        healthScore: Math.max(0, healthScore),
        confidence: model.accuracy,
        riskLevel: healthScore < 50 ? 'high' : healthScore < 75 ? 'medium' : 'low',
        recommendations: this.getBatteryRecommendations(batteryData),
        estimatedLifespan: this.calculateBatteryLifespan(batteryData),
        timestamp: new Date()
      };

      return prediction;
    } catch (error) {
      logger.error('Error predicting battery health:', error);
      return null;
    }
  }

  /**
   * Predict tire health
   */
  async predictTireHealth(tiresData) {
    try {
      const model = this.predictiveModels.get('tire_health');
      
      // Simulate ML prediction for each tire
      const tirePredictions = {};
      
      Object.entries(tiresData).forEach(([position, tire]) => {
        let healthScore = 100;
        
        if (tire.pressure < 25) healthScore -= 30;
        if (tire.wear > 80) healthScore -= 40;
        if (tire.temperature > 150) healthScore -= 20;
        if (tire.age > 6) healthScore -= 25;

        tirePredictions[position] = {
          healthScore: Math.max(0, healthScore),
          confidence: model.accuracy,
          riskLevel: healthScore < 50 ? 'high' : healthScore < 75 ? 'medium' : 'low',
          recommendations: this.getTireRecommendations(tire),
          estimatedReplacement: this.calculateTireReplacement(tire),
          timestamp: new Date()
        };
      });

      return tirePredictions;
    } catch (error) {
      logger.error('Error predicting tire health:', error);
      return null;
    }
  }

  /**
   * Get engine maintenance recommendations
   */
  getEngineRecommendations(engineData) {
    const recommendations = [];

    if (engineData.temperature > 200) {
      recommendations.push('Check cooling system and coolant levels');
    }
    if (engineData.oilPressure < 15) {
      recommendations.push('Check oil level and consider oil change');
    }
    if (engineData.rpm > 6000) {
      recommendations.push('Avoid high RPM driving to reduce engine stress');
    }
    if (engineData.fuelLevel < 10) {
      recommendations.push('Refuel soon to avoid fuel pump damage');
    }

    return recommendations;
  }

  /**
   * Get battery recommendations
   */
  getBatteryRecommendations(batteryData) {
    const recommendations = [];

    if (batteryData.voltage < 12) {
      recommendations.push('Check battery terminals and connections');
    }
    if (batteryData.voltage < 11.5) {
      recommendations.push('Consider battery replacement');
    }
    if (batteryData.temperature > 120) {
      recommendations.push('Check charging system');
    }
    if (batteryData.age > 5) {
      recommendations.push('Monitor battery performance closely');
    }

    return recommendations;
  }

  /**
   * Get tire recommendations
   */
  getTireRecommendations(tireData) {
    const recommendations = [];

    if (tireData.pressure < 25) {
      recommendations.push('Inflate tire to recommended pressure');
    }
    if (tireData.wear > 80) {
      recommendations.push('Consider tire replacement');
    }
    if (tireData.temperature > 150) {
      recommendations.push('Check for overloading or alignment issues');
    }
    if (tireData.age > 6) {
      recommendations.push('Monitor tire condition for dry rot');
    }

    return recommendations;
  }

  /**
   * Calculate next maintenance date
   */
  calculateNextMaintenance(engineData) {
    // Simple calculation based on current conditions
    const baseInterval = 5000; // miles
    let adjustedInterval = baseInterval;

    if (engineData.temperature > 200) adjustedInterval *= 0.8;
    if (engineData.oilPressure < 15) adjustedInterval *= 0.7;
    if (engineData.rpm > 6000) adjustedInterval *= 0.9;

    return {
      miles: Math.round(adjustedInterval),
      estimatedDate: new Date(Date.now() + (adjustedInterval * 24 * 60 * 60 * 1000))
    };
  }

  /**
   * Calculate battery lifespan
   */
  calculateBatteryLifespan(batteryData) {
    let baseLifespan = 5; // years
    let remainingLifespan = baseLifespan - (batteryData.age || 0);

    if (batteryData.voltage < 12) remainingLifespan *= 0.8;
    if (batteryData.temperature > 120) remainingLifespan *= 0.7;

    return Math.max(0, remainingLifespan);
  }

  /**
   * Calculate tire replacement date
   */
  calculateTireReplacement(tireData) {
    const baseLifespan = 6; // years
    let remainingLifespan = baseLifespan - (tireData.age || 0);

    if (tireData.wear > 80) remainingLifespan *= 0.3;
    if (tireData.pressure < 25) remainingLifespan *= 0.8;

    return Math.max(0, remainingLifespan);
  }

  /**
   * Get vehicle telemetry data
   */
  async getVehicleTelemetry(vehicleId, options = {}) {
    try {
      const { timeframe = '24h', includeHistory = true } = options;
      const vehicleTelemetry = this.telemetryData.get(vehicleId);
      
      if (!vehicleTelemetry) {
        return null;
      }

      const result = {
        current: vehicleTelemetry.current,
        predictions: vehicleTelemetry.predictions,
        alerts: vehicleTelemetry.alerts.filter(alert => {
          const alertTime = new Date(alert.timestamp);
          const cutoffTime = new Date(Date.now() - this.getTimeframeMs(timeframe));
          return alertTime > cutoffTime;
        })
      };

      if (includeHistory) {
        result.history = vehicleTelemetry.history.filter(record => {
          const recordTime = new Date(record.timestamp);
          const cutoffTime = new Date(Date.now() - this.getTimeframeMs(timeframe));
          return recordTime > cutoffTime;
        });
      }

      return result;
    } catch (error) {
      logger.error('Error getting vehicle telemetry:', error);
      throw error;
    }
  }

  /**
   * Get connected vehicles
   */
  async getConnectedVehicles(userId = null) {
    try {
      const vehicles = Array.from(this.connectedVehicles.values());
      
      if (userId) {
        return vehicles.filter(vehicle => vehicle.userId === userId);
      }
      
      return vehicles;
    } catch (error) {
      logger.error('Error getting connected vehicles:', error);
      throw error;
    }
  }

  /**
   * Get IoT service statistics
   */
  getIoTStats() {
    try {
      const stats = {
        totalConnectedVehicles: this.connectedVehicles.size,
        activeConnections: 0,
        totalAlerts: 0,
        averageHealthScore: 0,
        predictions: {
          engine: { total: 0, averageScore: 0 },
          battery: { total: 0, averageScore: 0 },
          tires: { total: 0, averageScore: 0 }
        },
        telemetryDataPoints: 0,
        timestamp: new Date().toISOString()
      };

      let totalHealthScore = 0;
      let healthScoreCount = 0;

      this.connectedVehicles.forEach(vehicle => {
        if (vehicle.status === 'connected') {
          stats.activeConnections++;
        }
        
        stats.totalAlerts += vehicle.alerts.length;
      });

      this.telemetryData.forEach(telemetry => {
        stats.telemetryDataPoints += telemetry.history.length;
        
        if (telemetry.predictions.engineHealth) {
          stats.predictions.engine.total++;
          stats.predictions.engine.averageScore += telemetry.predictions.engineHealth.healthScore;
          totalHealthScore += telemetry.predictions.engineHealth.healthScore;
          healthScoreCount++;
        }
        
        if (telemetry.predictions.batteryHealth) {
          stats.predictions.battery.total++;
          stats.predictions.battery.averageScore += telemetry.predictions.batteryHealth.healthScore;
          totalHealthScore += telemetry.predictions.batteryHealth.healthScore;
          healthScoreCount++;
        }
        
        if (telemetry.predictions.tireHealth) {
          Object.values(telemetry.predictions.tireHealth).forEach(tire => {
            stats.predictions.tires.total++;
            stats.predictions.tires.averageScore += tire.healthScore;
            totalHealthScore += tire.healthScore;
            healthScoreCount++;
          });
        }
      });

      if (healthScoreCount > 0) {
        stats.averageHealthScore = totalHealthScore / healthScoreCount;
        
        if (stats.predictions.engine.total > 0) {
          stats.predictions.engine.averageScore /= stats.predictions.engine.total;
        }
        if (stats.predictions.battery.total > 0) {
          stats.predictions.battery.averageScore /= stats.predictions.battery.total;
        }
        if (stats.predictions.tires.total > 0) {
          stats.predictions.tires.averageScore /= stats.predictions.tires.total;
        }
      }

      return stats;
    } catch (error) {
      logger.error('Error getting IoT stats:', error);
      throw error;
    }
  }

  /**
   * Convert timeframe string to milliseconds
   */
  getTimeframeMs(timeframe) {
    const timeframes = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    return timeframes[timeframe] || timeframes['24h'];
  }

  /**
   * Health check for IoT service
   */
  async healthCheck() {
    try {
      const stats = this.getIoTStats();
      const healthStatus = {
        status: 'healthy',
        connectedVehicles: stats.totalConnectedVehicles,
        activeConnections: stats.activeConnections,
        averageHealthScore: stats.averageHealthScore,
        timestamp: new Date().toISOString()
      };

      // Check for issues
      if (stats.activeConnections === 0 && stats.totalConnectedVehicles > 0) {
        healthStatus.status = 'warning';
        healthStatus.message = 'No active vehicle connections';
      }

      if (stats.averageHealthScore < 50) {
        healthStatus.status = 'warning';
        healthStatus.message = 'Low average vehicle health scores';
      }

      return healthStatus;
    } catch (error) {
      logger.error('Error in IoT health check:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const iotService = new IoTService();

module.exports = iotService;
