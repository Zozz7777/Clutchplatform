const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { validateInput } = require('../middleware/validation');
const { cacheMiddleware } = require('../middleware/cache');
const { performanceMonitor } = require('../middleware/performanceMonitor');
const logger = require('../utils/logger');

// Import models
const FleetVehicle = require('../models/FleetVehicle');
const MaintenanceRecord = require('../models/Maintenance');
const Payment = require('../models/Payment');
const User = require('../models/User');

/**
 * @route GET /api/v1/fleet/vehicles
 * @desc Get all fleet vehicles with filtering and pagination
 * @access Private (requires view_fleet permission)
 */
router.get('/vehicles',
  authenticateToken,
  requirePermission('view_fleet'),
  cacheMiddleware(300), // Cache for 5 minutes
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();
      const {
        page = 1,
        limit = 20,
        status,
        type,
        location,
        search
      } = req.query;

      // Build filter object
      const filter = {};
      if (status) filter.status = status;
      if (type) filter.type = type;
      if (location) filter.location = { $regex: location, $options: 'i' };
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { licensePlate: { $regex: search, $options: 'i' } },
          { vin: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get vehicles with pagination
      const [vehicles, totalCount] = await Promise.all([
        FleetVehicle.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .select('name type status location licensePlate vin mileage lastMaintenance createdAt'),
        FleetVehicle.countDocuments(filter)
      ]);

      // Get additional metrics
      const [statusCounts, totalMileage] = await Promise.all([
        FleetVehicle.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        FleetVehicle.aggregate([
          { $group: { _id: null, total: { $sum: '$mileage' } } }
        ])
      ]);

      const vehiclesData = {
        vehicles: vehicles.map(vehicle => ({
          id: vehicle._id,
          name: vehicle.name,
          type: vehicle.type,
          status: vehicle.status,
          location: vehicle.location,
          licensePlate: vehicle.licensePlate,
          vin: vehicle.vin,
          mileage: vehicle.mileage,
          lastMaintenance: vehicle.lastMaintenance,
          createdAt: vehicle.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        },
        summary: {
          total: totalCount,
          statusCounts: statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          totalMileage: totalMileage[0]?.total || 0
        },
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('Fleet vehicles retrieved successfully', {
        userId: req.user?.id,
        page,
        limit,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: vehiclesData,
        message: 'Fleet vehicles retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching fleet vehicles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch fleet vehicles',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/fleet/vehicles/:id
 * @desc Get specific vehicle details
 * @access Private (requires view_fleet permission)
 */
router.get('/vehicles/:id',
  authenticateToken,
  requirePermission('view_fleet'),
  cacheMiddleware(300),
  performanceMonitor,
  async (req, res) => {
    try {
      const { id } = req.params;
      const startTime = Date.now();

      const vehicle = await FleetVehicle.findById(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        });
      }

      // Get related data
      const [maintenanceRecords, recentPayments] = await Promise.all([
        MaintenanceRecord.find({ vehicleId: id })
          .sort({ date: -1 })
          .limit(10)
          .select('type description cost date mileage'),
        Payment.find({ vehicleId: id })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('amount currency status createdAt')
      ]);

      const vehicleData = {
        id: vehicle._id,
        name: vehicle.name,
        type: vehicle.type,
        status: vehicle.status,
        location: vehicle.location,
        licensePlate: vehicle.licensePlate,
        vin: vehicle.vin,
        mileage: vehicle.mileage,
        lastMaintenance: vehicle.lastMaintenance,
        specifications: vehicle.specifications || {},
        maintenance: {
          records: maintenanceRecords,
          totalCost: maintenanceRecords.reduce((sum, record) => sum + (record.cost || 0), 0),
          lastService: maintenanceRecords[0]?.date
        },
        financial: {
          recentPayments: recentPayments,
          totalSpent: recentPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
        },
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt
      };

      logger.info('Vehicle details retrieved successfully', {
        userId: req.user?.id,
        vehicleId: id,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: vehicleData,
        message: 'Vehicle details retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching vehicle details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicle details',
        message: error.message
      });
    }
  }
);

/**
 * @route PUT /api/v1/fleet/vehicles/:id
 * @desc Update vehicle information
 * @access Private (requires manage_fleet permission)
 */
router.put('/vehicles/:id',
  authenticateToken,
  requirePermission('manage_fleet'),
  validateInput,
  performanceMonitor,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const startTime = Date.now();

      const vehicle = await FleetVehicle.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        });
      }

      logger.info('Vehicle updated successfully', {
        userId: req.user?.id,
        vehicleId: id,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: vehicle,
        message: 'Vehicle updated successfully'
      });

    } catch (error) {
      logger.error('Error updating vehicle:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update vehicle',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/fleet/maintenance/forecast
 * @desc Get maintenance forecast for fleet vehicles
 * @access Private (requires view_fleet permission)
 */
router.get('/maintenance/forecast',
  authenticateToken,
  requirePermission('view_fleet'),
  cacheMiddleware(600), // Cache for 10 minutes
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();
      const { days = 30 } = req.query;

      // Get vehicles and their maintenance records
      const vehicles = await FleetVehicle.find({ status: 'active' });
      const vehicleIds = vehicles.map(v => v._id);

      const maintenanceRecords = await MaintenanceRecord.find({
        vehicleId: { $in: vehicleIds }
      }).sort({ date: -1 });

      // Calculate maintenance forecast
      const forecast = vehicles.map(vehicle => {
        const vehicleMaintenance = maintenanceRecords.filter(
          record => record.vehicleId.toString() === vehicle._id.toString()
        );

        const lastMaintenance = vehicleMaintenance[0];
        const daysSinceMaintenance = lastMaintenance 
          ? Math.floor((new Date() - lastMaintenance.date) / (1000 * 60 * 60 * 24))
          : 0;

        // Simple forecast logic (in production, use more sophisticated algorithms)
        const maintenanceInterval = 90; // days
        const daysUntilMaintenance = maintenanceInterval - daysSinceMaintenance;
        const priority = daysUntilMaintenance <= 7 ? 'high' : 
                        daysUntilMaintenance <= 14 ? 'medium' : 'low';

        return {
          vehicleId: vehicle._id,
          vehicleName: vehicle.name,
          type: vehicle.type,
          mileage: vehicle.mileage,
          lastMaintenance: lastMaintenance?.date,
          daysSinceMaintenance,
          daysUntilMaintenance,
          priority,
          estimatedCost: Math.random() * 500 + 100, // Mock cost
          recommendedService: daysUntilMaintenance <= 7 ? [
            'Oil change',
            'Brake inspection',
            'Tire rotation',
            'Engine check'
          ] : [
            'Routine inspection',
            'Fluid check'
          ]
        };
      });

      // Sort by priority and days until maintenance
      forecast.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return a.daysUntilMaintenance - b.daysUntilMaintenance;
      });

      const forecastData = {
        forecast: forecast.filter(f => f.daysUntilMaintenance <= parseInt(days)),
        summary: {
          totalVehicles: vehicles.length,
          dueSoon: forecast.filter(f => f.priority === 'high').length,
          dueThisMonth: forecast.filter(f => f.daysUntilMaintenance <= 30).length,
          totalEstimatedCost: forecast.reduce((sum, f) => sum + f.estimatedCost, 0)
        },
        priority: {
          high: forecast.filter(f => f.priority === 'high'),
          medium: forecast.filter(f => f.priority === 'medium'),
          low: forecast.filter(f => f.priority === 'low')
        },
        recommendations: [
          'Schedule maintenance for high priority vehicles',
          'Order parts in advance for upcoming services',
          'Consider bulk maintenance discounts',
          'Update maintenance schedules based on usage patterns'
        ],
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('Maintenance forecast retrieved successfully', {
        userId: req.user?.id,
        days,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: forecastData,
        message: 'Maintenance forecast retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching maintenance forecast:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch maintenance forecast',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/fleet-operational-costs
 * @desc Get fleet operational costs analysis
 * @access Private (requires view_fleet permission)
 */
router.get('/operational-costs',
  authenticateToken,
  requirePermission('view_fleet'),
  cacheMiddleware(600),
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();
      const { period = '30d' } = req.query;

      // Calculate date range
      let days = 30;
      switch (period) {
        case '7d': days = 7; break;
        case '30d': days = 30; break;
        case '90d': days = 90; break;
        case '1y': days = 365; break;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get operational cost data
      const [
        maintenanceCosts,
        fuelCosts,
        insuranceCosts,
        totalVehicles
      ] = await Promise.all([
        // Maintenance costs
        MaintenanceRecord.aggregate([
          {
            $match: {
              date: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$cost' },
              count: { $sum: 1 },
              average: { $avg: '$cost' }
            }
          }
        ]),

        // Fuel costs (mock data for now)
        Promise.resolve({
          total: Math.random() * 10000 + 5000,
          average: Math.random() * 50 + 25,
          efficiency: Math.random() * 10 + 20
        }),

        // Insurance costs (mock data)
        Promise.resolve({
          total: Math.random() * 5000 + 2000,
          perVehicle: Math.random() * 200 + 100
        }),

        // Total vehicles
        FleetVehicle.countDocuments()
      ]);

      const maintenanceData = maintenanceCosts[0] || { total: 0, count: 0, average: 0 };

      const costsData = {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days
        },
        breakdown: {
          maintenance: {
            total: maintenanceData.total,
            count: maintenanceData.count,
            average: Math.round(maintenanceData.average * 100) / 100,
            perVehicle: totalVehicles > 0 ? Math.round((maintenanceData.total / totalVehicles) * 100) / 100 : 0
          },
          fuel: {
            total: fuelCosts.total,
            average: fuelCosts.average,
            efficiency: fuelCosts.efficiency
          },
          insurance: {
            total: insuranceCosts.total,
            perVehicle: insuranceCosts.perVehicle
          }
        },
        summary: {
          totalCost: maintenanceData.total + fuelCosts.total + insuranceCosts.total,
          costPerVehicle: totalVehicles > 0 ? 
            Math.round(((maintenanceData.total + fuelCosts.total + insuranceCosts.total) / totalVehicles) * 100) / 100 : 0,
          totalVehicles
        },
        trends: {
          maintenance: {
            trend: 'stable',
            change: '+2%'
          },
          fuel: {
            trend: 'up',
            change: '+5%'
          },
          insurance: {
            trend: 'down',
            change: '-1%'
          }
        },
        recommendations: [
          'Optimize maintenance schedules to reduce costs',
          'Implement fuel efficiency monitoring',
          'Negotiate better insurance rates',
          'Consider preventive maintenance programs'
        ],
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('Fleet operational costs retrieved successfully', {
        userId: req.user?.id,
        period,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: costsData,
        message: 'Fleet operational costs retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching fleet operational costs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch fleet operational costs',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/fuel-cost-metrics
 * @desc Get fuel cost metrics and analysis
 * @access Private (requires view_fleet permission)
 */
router.get('/fuel-cost-metrics',
  authenticateToken,
  requirePermission('view_fleet'),
  cacheMiddleware(600),
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();
      const { period = '30d' } = req.query;

      // Calculate date range
      let days = 30;
      switch (period) {
        case '7d': days = 7; break;
        case '30d': days = 30; break;
        case '90d': days = 90; break;
        case '1y': days = 365; break;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Mock fuel cost data (in production, integrate with fuel tracking system)
      const fuelData = {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days
        },
        metrics: {
          totalCost: Math.random() * 15000 + 8000,
          totalGallons: Math.random() * 2000 + 1000,
          averagePricePerGallon: Math.random() * 1 + 3.5,
          totalMiles: Math.random() * 10000 + 5000,
          averageMPG: Math.random() * 5 + 20
        },
        breakdown: {
          byVehicle: [
            { vehicleId: '1', name: 'Vehicle A', cost: 1200, gallons: 300, mpg: 22 },
            { vehicleId: '2', name: 'Vehicle B', cost: 1500, gallons: 400, mpg: 18 },
            { vehicleId: '3', name: 'Vehicle C', cost: 900, gallons: 250, mpg: 25 }
          ],
          byLocation: [
            { location: 'City A', cost: 2000, percentage: 40 },
            { location: 'City B', cost: 1500, percentage: 30 },
            { location: 'City C', cost: 1500, percentage: 30 }
          ]
        },
        efficiency: {
          bestPerforming: 'Vehicle C',
          worstPerforming: 'Vehicle B',
          averageEfficiency: 21.5,
          targetEfficiency: 25,
          efficiencyGap: 3.5
        },
        trends: {
          cost: {
            trend: 'up',
            change: '+8%',
            forecast: 'Increasing due to fuel price rise'
          },
          efficiency: {
            trend: 'stable',
            change: '+1%',
            forecast: 'Slight improvement expected'
          }
        },
        recommendations: [
          'Implement fuel efficiency training for drivers',
          'Consider hybrid or electric vehicles for high-mileage routes',
          'Optimize routes to reduce fuel consumption',
          'Monitor fuel prices and bulk purchase when possible'
        ],
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('Fuel cost metrics retrieved successfully', {
        userId: req.user?.id,
        period,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: fuelData,
        message: 'Fuel cost metrics retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching fuel cost metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch fuel cost metrics',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/downtime-metrics
 * @desc Get vehicle downtime metrics and analysis
 * @access Private (requires view_fleet permission)
 */
router.get('/downtime-metrics',
  authenticateToken,
  requirePermission('view_fleet'),
  cacheMiddleware(600),
  performanceMonitor,
  async (req, res) => {
    try {
      const startTime = Date.now();
      const { period = '30d' } = req.query;

      // Calculate date range
      let days = 30;
      switch (period) {
        case '7d': days = 7; break;
        case '30d': days = 30; break;
        case '90d': days = 90; break;
        case '1y': days = 365; break;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get downtime data (mock for now, in production integrate with maintenance system)
      const downtimeData = {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days
        },
        summary: {
          totalDowntimeHours: Math.random() * 200 + 100,
          averageDowntimePerVehicle: Math.random() * 10 + 5,
          totalVehicles: 25,
          vehiclesWithDowntime: Math.floor(Math.random() * 10 + 5)
        },
        breakdown: {
          byReason: [
            { reason: 'Maintenance', hours: 80, percentage: 40 },
            { reason: 'Repairs', hours: 60, percentage: 30 },
            { reason: 'Accidents', hours: 30, percentage: 15 },
            { reason: 'Other', hours: 30, percentage: 15 }
          ],
          byVehicle: [
            { vehicleId: '1', name: 'Vehicle A', downtime: 15, reason: 'Maintenance' },
            { vehicleId: '2', name: 'Vehicle B', downtime: 25, reason: 'Repairs' },
            { vehicleId: '3', name: 'Vehicle C', downtime: 8, reason: 'Maintenance' }
          ]
        },
        impact: {
          lostRevenue: Math.random() * 5000 + 2000,
          customerDelays: Math.floor(Math.random() * 20 + 10),
          efficiencyLoss: Math.random() * 15 + 5
        },
        trends: {
          downtime: {
            trend: 'down',
            change: '-12%',
            forecast: 'Improving due to preventive maintenance'
          },
          maintenance: {
            trend: 'up',
            change: '+8%',
            forecast: 'Increased preventive maintenance reducing downtime'
          }
        },
        recommendations: [
          'Implement predictive maintenance to reduce unexpected downtime',
          'Increase preventive maintenance frequency',
          'Improve driver training to reduce accident-related downtime',
          'Consider backup vehicles for critical routes'
        ],
        performance: {
          responseTime: Date.now() - startTime
        }
      };

      logger.info('Downtime metrics retrieved successfully', {
        userId: req.user?.id,
        period,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: downtimeData,
        message: 'Downtime metrics retrieved successfully'
      });

    } catch (error) {
      logger.error('Error fetching downtime metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch downtime metrics',
        message: error.message
      });
    }
  }
);

module.exports = router;
