const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');

// ==================== OBD DEVICE STATUS ====================

// Get OBD device status
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { vehicleId } = req.query;

        if (!vehicleId) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_VEHICLE_ID',
                message: 'Vehicle ID is required'
            });
        }

        const obdDevicesCollection = await getCollection('obd2_devices');
        const device = await obdDevicesCollection.findOne({ 
            vehicleId, 
            userId,
            status: 'active'
        });

        if (!device) {
            return res.status(404).json({
                success: false,
                error: 'DEVICE_NOT_FOUND',
                message: 'OBD device not found for this vehicle'
            });
        }

        // Get real-time status
        const status = {
            deviceId: device._id,
            vehicleId: device.vehicleId,
            isConnected: device.isConnected || false,
            lastSeen: device.lastSeen,
            batteryLevel: device.batteryLevel || 0,
            signalStrength: device.signalStrength || 0,
            firmwareVersion: device.firmwareVersion,
            diagnosticTroubleCodes: device.diagnosticTroubleCodes || [],
            engineStatus: device.engineStatus || 'unknown',
            vehicleSpeed: device.vehicleSpeed || 0,
            engineRPM: device.engineRPM || 0,
            fuelLevel: device.fuelLevel || 0,
            temperature: device.temperature || 0
        };

        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        logger.error('Get OBD status error:', error);
        res.status(500).json({
            success: false,
            error: 'OBD_STATUS_ERROR',
            message: 'Failed to retrieve OBD device status'
        });
    }
});

// ==================== OBD DIAGNOSTICS ====================

// Get vehicle diagnostics
router.get('/diagnostics', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { vehicleId, startDate, endDate, limit = 100 } = req.query;

        if (!vehicleId) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_VEHICLE_ID',
                message: 'Vehicle ID is required'
            });
        }

        const filters = { vehicleId, userId };
        if (startDate || endDate) {
            filters.timestamp = {};
            if (startDate) filters.timestamp.$gte = new Date(startDate);
            if (endDate) filters.timestamp.$lte = new Date(endDate);
        }

        const diagnosticsCollection = await getCollection('vehicle_diagnostics');
        const diagnostics = await diagnosticsCollection.find(filters)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .toArray();

        // Get diagnostic trouble codes
        const dtcCollection = await getCollection('obd_error_codes');
        const troubleCodes = await dtcCollection.find({
            vehicleId,
            userId,
            isActive: true
        }).toArray();

        // Get performance metrics
        const performanceMetrics = await getPerformanceMetrics(diagnosticsCollection, vehicleId, userId);

        const diagnosticData = {
            diagnostics,
            troubleCodes,
            performanceMetrics,
            summary: {
                totalRecords: diagnostics.length,
                troubleCodesCount: troubleCodes.length,
                lastUpdate: diagnostics[0]?.timestamp || null
            }
        };

        res.json({
            success: true,
            data: diagnosticData
        });
    } catch (error) {
        logger.error('Get OBD diagnostics error:', error);
        res.status(500).json({
            success: false,
            error: 'OBD_DIAGNOSTICS_ERROR',
            message: 'Failed to retrieve vehicle diagnostics'
        });
    }
});

// Get real-time diagnostic data
router.get('/diagnostics/realtime', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { vehicleId } = req.query;

        if (!vehicleId) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_VEHICLE_ID',
                message: 'Vehicle ID is required'
            });
        }

        const diagnosticsCollection = await getCollection('vehicle_diagnostics');
        const realtimeData = await diagnosticsCollection.findOne(
            { vehicleId, userId },
            { sort: { timestamp: -1 } }
        );

        if (!realtimeData) {
            return res.status(404).json({
                success: false,
                error: 'NO_DATA_AVAILABLE',
                message: 'No real-time diagnostic data available'
            });
        }

        // Extract key real-time metrics
        const realtimeMetrics = {
            timestamp: realtimeData.timestamp,
            vehicleSpeed: realtimeData.vehicleSpeed || 0,
            engineRPM: realtimeData.engineRPM || 0,
            engineLoad: realtimeData.engineLoad || 0,
            coolantTemperature: realtimeData.coolantTemperature || 0,
            intakeAirTemperature: realtimeData.intakeAirTemperature || 0,
            throttlePosition: realtimeData.throttlePosition || 0,
            fuelLevel: realtimeData.fuelLevel || 0,
            batteryVoltage: realtimeData.batteryVoltage || 0,
            oilPressure: realtimeData.oilPressure || 0,
            transmissionTemperature: realtimeData.transmissionTemperature || 0
        };

        res.json({
            success: true,
            data: realtimeMetrics
        });
    } catch (error) {
        logger.error('Get real-time diagnostics error:', error);
        res.status(500).json({
            success: false,
            error: 'REALTIME_DIAGNOSTICS_ERROR',
            message: 'Failed to retrieve real-time diagnostic data'
        });
    }
});

// ==================== OBD DEVICE MANAGEMENT ====================

// Register new OBD device
router.post('/devices', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            vehicleId,
            deviceSerial,
            deviceModel,
            firmwareVersion,
            deviceName
        } = req.body;

        if (!vehicleId || !deviceSerial) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Vehicle ID and device serial are required'
            });
        }

        const obdDevicesCollection = await getCollection('obd2_devices');
        
        // Check if device already exists
        const existingDevice = await obdDevicesCollection.findOne({ 
            deviceSerial,
            userId 
        });

        if (existingDevice) {
            return res.status(409).json({
                success: false,
                error: 'DEVICE_EXISTS',
                message: 'OBD device already registered'
            });
        }

        // Create new device
        const device = {
            userId,
            vehicleId,
            deviceSerial,
            deviceModel: deviceModel || 'Generic OBD-II',
            firmwareVersion: firmwareVersion || '1.0.0',
            deviceName: deviceName || `OBD Device ${deviceSerial}`,
            status: 'active',
            isConnected: false,
            lastSeen: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            settings: {
                dataCollectionInterval: 1000, // 1 second
                enableRealTimeMonitoring: true,
                enableAlerts: true,
                alertThresholds: {
                    engineTemperature: 100,
                    oilPressure: 20,
                    batteryVoltage: 11.5
                }
            }
        };

        const result = await obdDevicesCollection.insertOne(device);
        device._id = result.insertedId;

        res.status(201).json({
            success: true,
            data: device,
            message: 'OBD device registered successfully'
        });
    } catch (error) {
        logger.error('Register OBD device error:', error);
        res.status(500).json({
            success: false,
            error: 'OBD_DEVICE_REGISTRATION_ERROR',
            message: 'Failed to register OBD device'
        });
    }
});

// Update OBD device settings
router.put('/devices/:deviceId', authenticateToken, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const userId = req.user.id;
        const updates = req.body;
        updates.updatedAt = new Date();

        const obdDevicesCollection = await getCollection('obd2_devices');
        const result = await obdDevicesCollection.updateOne(
            { _id: deviceId, userId },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'DEVICE_NOT_FOUND',
                message: 'OBD device not found'
            });
        }

        res.json({
            success: true,
            message: 'OBD device updated successfully'
        });
    } catch (error) {
        logger.error('Update OBD device error:', error);
        res.status(500).json({
            success: false,
            error: 'OBD_DEVICE_UPDATE_ERROR',
            message: 'Failed to update OBD device'
        });
    }
});

// ==================== OBD DATA COLLECTION ====================

// Store diagnostic data
router.post('/data', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            vehicleId,
            deviceId,
            diagnosticData,
            timestamp
        } = req.body;

        if (!vehicleId || !deviceId || !diagnosticData) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Vehicle ID, device ID, and diagnostic data are required'
            });
        }

        const diagnosticsCollection = await getCollection('vehicle_diagnostics');
        
        // Create diagnostic record
        const diagnosticRecord = {
            userId,
            vehicleId,
            deviceId,
            timestamp: timestamp || new Date(),
            ...diagnosticData,
            createdAt: new Date()
        };

        const result = await diagnosticsCollection.insertOne(diagnosticRecord);

        // Update device last seen
        const obdDevicesCollection = await getCollection('obd2_devices');
        await obdDevicesCollection.updateOne(
            { _id: deviceId },
            { 
                $set: { 
                    lastSeen: new Date(),
                    isConnected: true
                }
            }
        );

        res.status(201).json({
            success: true,
            data: { id: result.insertedId },
            message: 'Diagnostic data stored successfully'
        });
    } catch (error) {
        logger.error('Store diagnostic data error:', error);
        res.status(500).json({
            success: false,
            error: 'DIAGNOSTIC_DATA_STORE_ERROR',
            message: 'Failed to store diagnostic data'
        });
    }
});

// ==================== OBD ALERTS & NOTIFICATIONS ====================

// Get OBD alerts
router.get('/alerts', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { vehicleId, status, limit = 50 } = req.query;

        const filters = { userId };
        if (vehicleId) filters.vehicleId = vehicleId;
        if (status) filters.status = status;

        const alertsCollection = await getCollection('obd_alerts');
        const alerts = await alertsCollection.find(filters)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .toArray();

        res.json({
            success: true,
            data: alerts,
            count: alerts.length
        });
    } catch (error) {
        logger.error('Get OBD alerts error:', error);
        res.status(500).json({
            success: false,
            error: 'OBD_ALERTS_ERROR',
            message: 'Failed to retrieve OBD alerts'
        });
    }
});

// ==================== OBD REPORTS & ANALYTICS ====================

// Get OBD performance report
router.get('/reports/performance', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { vehicleId, startDate, endDate } = req.query;

        if (!vehicleId) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_VEHICLE_ID',
                message: 'Vehicle ID is required'
            });
        }

        const filters = { vehicleId, userId };
        if (startDate || endDate) {
            filters.timestamp = {};
            if (startDate) filters.timestamp.$gte = new Date(startDate);
            if (endDate) filters.timestamp.$lte = new Date(endDate);
        }

        const diagnosticsCollection = await getCollection('vehicle_diagnostics');
        const performanceData = await diagnosticsCollection.find(filters)
            .sort({ timestamp: 1 })
            .toArray();

        // Calculate performance metrics
        const performanceReport = calculatePerformanceMetrics(performanceData);

        res.json({
            success: true,
            data: performanceReport
        });
    } catch (error) {
        logger.error('Get performance report error:', error);
        res.status(500).json({
            success: false,
            error: 'PERFORMANCE_REPORT_ERROR',
            message: 'Failed to retrieve performance report'
        });
    }
});

// ==================== HELPER FUNCTIONS ====================

// Get performance metrics
async function getPerformanceMetrics(diagnosticsCollection, vehicleId, userId) {
    try {
        const metrics = await diagnosticsCollection.aggregate([
            { $match: { vehicleId, userId } },
            {
                $group: {
                    _id: null,
                    avgSpeed: { $avg: '$vehicleSpeed' },
                    maxSpeed: { $max: '$vehicleSpeed' },
                    avgRPM: { $avg: '$engineRPM' },
                    maxRPM: { $max: '$engineRPM' },
                    avgTemperature: { $avg: '$coolantTemperature' },
                    maxTemperature: { $max: '$coolantTemperature' },
                    totalDistance: { $sum: '$distanceTraveled' || 0 }
                }
            }
        ]).toArray();

        return metrics[0] || {
            avgSpeed: 0,
            maxSpeed: 0,
            avgRPM: 0,
            maxRPM: 0,
            avgTemperature: 0,
            maxTemperature: 0,
            totalDistance: 0
        };
    } catch (error) {
        return {
            avgSpeed: 0,
            maxSpeed: 0,
            avgRPM: 0,
            maxRPM: 0,
            avgTemperature: 0,
            maxTemperature: 0,
            totalDistance: 0
        };
    }
}

// Calculate performance metrics
function calculatePerformanceMetrics(data) {
    if (!data || data.length === 0) {
        return {
            summary: {},
            trends: [],
            recommendations: []
        };
    }

    const speeds = data.map(d => d.vehicleSpeed || 0).filter(s => s > 0);
    const rpms = data.map(d => d.engineRPM || 0).filter(r => r > 0);
    const temperatures = data.map(d => d.coolantTemperature || 0).filter(t => t > 0);

    const summary = {
        totalRecords: data.length,
        averageSpeed: speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0,
        maxSpeed: Math.max(...speeds, 0),
        averageRPM: rpms.length > 0 ? rpms.reduce((a, b) => a + b, 0) / rpms.length : 0,
        maxRPM: Math.max(...rpms, 0),
        averageTemperature: temperatures.length > 0 ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 0,
        maxTemperature: Math.max(...temperatures, 0)
    };

    // Generate trends (simplified)
    const trends = data.slice(-10).map(d => ({
        timestamp: d.timestamp,
        speed: d.vehicleSpeed || 0,
        rpm: d.engineRPM || 0,
        temperature: d.coolantTemperature || 0
    }));

    // Generate recommendations
    const recommendations = [];
    if (summary.averageSpeed > 80) {
        recommendations.push('Consider reducing average speed for better fuel efficiency');
    }
    if (summary.averageRPM > 3000) {
        recommendations.push('Engine RPM is high - consider shifting to higher gear');
    }
    if (summary.averageTemperature > 90) {
        recommendations.push('Engine temperature is elevated - check cooling system');
    }

    return {
        summary,
        trends,
        recommendations
    };
}

module.exports = router;
