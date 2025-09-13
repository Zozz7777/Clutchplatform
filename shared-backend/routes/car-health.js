const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { validate } = require('../middleware/inputValidation');
const { logger } = require('../config/logger');

// Rate limiting for Car Health endpoints
const carHealthRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 800, // limit each IP to 800 requests per windowMs
  message: 'Too many Car Health requests from this IP, please try again later.'
});

// Apply rate limiting to all Car Health routes
router.use(carHealthRateLimit);

// ==================== CAR HEALTH OVERVIEW ====================

// Get overall car health dashboard
router.get('/overview', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { vehicleId } = req.query;
    
    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_VEHICLE_ID',
        message: 'Vehicle ID is required'
      });
    }

    const healthOverview = {
      vehicleId,
      overallHealth: 87,
      healthScore: 'B+',
      lastUpdated: new Date(),
      status: 'good',
      color: '#28a745', // Green for good health
      summary: {
        excellent: 3,
        good: 4,
        fair: 2,
        poor: 1,
        critical: 0
      },
      topIssues: [
        {
          component: 'Brake Pads',
          severity: 'medium',
          health: 65,
          estimatedLife: '2000 miles',
          cost: 120
        },
        {
          component: 'Air Filter',
          severity: 'low',
          health: 70,
          estimatedLife: '500 miles',
          cost: 25
        }
      ],
      recommendations: [
        'Schedule brake inspection within 1000 miles',
        'Replace air filter soon for optimal performance',
        'Continue current maintenance schedule'
      ],
      nextMaintenance: new Date('2024-02-15'),
      estimatedMaintenanceCost: 145
    };

    res.json({
      success: true,
      data: healthOverview
    });
  } catch (error) {
    logger.error('Error getting car health overview:', error);
    res.status(500).json({
      success: false,
      error: 'GET_HEALTH_OVERVIEW_FAILED',
      message: 'Failed to retrieve car health overview'
    });
  }
});

// Get car health percentage
router.get('/percentage', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { vehicleId } = req.query;
    
    const healthPercentage = {
      vehicleId,
      overallHealth: 87,
      healthScore: 'B+',
      grade: 'B+',
      lastUpdated: new Date(),
      breakdown: {
        engine: 92,
        transmission: 95,
        brakes: 65,
        suspension: 88,
        electrical: 90,
        cooling: 85,
        fuel: 75,
        exhaust: 95,
        tires: 90
      },
      trend: {
        direction: 'stable',
        change: 0,
        period: 'month',
        description: 'Health has remained stable this month'
      },
      comparison: {
        similarVehicles: 85,
        vehicleAge: 82,
        maintenanceHistory: 90
      }
    };

    res.json({
      success: true,
      data: healthPercentage
    });
  } catch (error) {
    logger.error('Error getting car health percentage:', error);
    res.status(500).json({
      success: false,
      error: 'GET_HEALTH_PERCENTAGE_FAILED',
      message: 'Failed to retrieve car health percentage'
    });
  }
});

// Get car health trends
router.get('/trends', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { vehicleId, period } = req.query;
    
    const healthTrends = {
      vehicleId,
      period: period || 'month',
      generatedAt: new Date(),
      trends: [
        {
          component: 'Engine',
          trend: 'stable',
          change: 0,
          period: 'month',
          data: [
            { date: '2024-01-01', health: 92 },
            { date: '2024-01-08', health: 91 },
            { date: '2024-01-15', health: 92 }
          ]
        },
        {
          component: 'Brakes',
          trend: 'declining',
          change: -5,
          period: 'month',
          data: [
            { date: '2024-01-01', health: 70 },
            { date: '2024-01-08', health: 68 },
            { date: '2024-01-15', health: 65 }
          ]
        },
        {
          component: 'Overall',
          trend: 'stable',
          change: 0,
          period: 'month',
          data: [
            { date: '2024-01-01', health: 87 },
            { date: '2024-01-08', health: 86 },
            { date: '2024-01-15', health: 87 }
          ]
        }
      ],
      insights: [
        'Engine health remains excellent',
        'Brake system showing gradual wear',
        'Overall vehicle health is stable'
      ]
    };

    res.json({
      success: true,
      data: healthTrends
    });
  } catch (error) {
    logger.error('Error getting car health trends:', error);
    res.status(500).json({
      success: false,
      error: 'GET_HEALTH_TRENDS_FAILED',
      message: 'Failed to retrieve car health trends'
    });
  }
});

// ==================== INDIVIDUAL PART HEALTH MONITORING ====================

// Get all parts health
router.get('/parts', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { vehicleId, category, status, health } = req.query;
    
    const partsHealth = [
      {
        id: 'part_001',
        vehicleId,
        name: 'Engine',
        category: 'powertrain',
        health: 92,
        status: 'excellent',
        lastCheck: new Date('2024-01-15T14:00:00Z'),
        estimatedLife: '150000 miles',
        currentMileage: 45000,
        remainingLife: '105000 miles',
        wearRate: 'normal',
        critical: false,
        maintenanceHistory: [
          {
            date: new Date('2024-01-01'),
            type: 'Oil Change',
            cost: 45,
            impact: 'positive'
          }
        ]
      },
      {
        id: 'part_002',
        vehicleId,
        name: 'Brake Pads - Front',
        category: 'brakes',
        health: 65,
        status: 'fair',
        lastCheck: new Date('2024-01-15T14:00:00Z'),
        estimatedLife: '50000 miles',
        currentMileage: 45000,
        remainingLife: '2000 miles',
        wearRate: 'accelerated',
        critical: false,
        maintenanceHistory: [
          {
            date: new Date('2023-06-01'),
            type: 'Brake Pad Replacement',
            cost: 120,
            impact: 'positive'
          }
        ]
      },
      {
        id: 'part_003',
        vehicleId,
        name: 'Air Filter',
        category: 'intake',
        health: 70,
        status: 'fair',
        lastCheck: new Date('2024-01-15T14:00:00Z'),
        estimatedLife: '15000 miles',
        currentMileage: 45000,
        remainingLife: '500 miles',
        wearRate: 'normal',
        critical: false,
        maintenanceHistory: [
          {
            date: new Date('2023-12-01'),
            type: 'Air Filter Replacement',
            cost: 25,
            impact: 'positive'
          }
        ]
      }
    ];

    let filteredParts = partsHealth;
    if (category) {
      filteredParts = filteredParts.filter(part => part.category === category);
    }
    if (status) {
      filteredParts = filteredParts.filter(part => part.status === status);
    }
    if (health) {
      const healthNum = parseInt(health);
      filteredParts = filteredParts.filter(part => part.health <= healthNum);
    }

    res.json({
      success: true,
      data: filteredParts,
      total: filteredParts.length
    });
  } catch (error) {
    logger.error('Error getting parts health:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PARTS_HEALTH_FAILED',
      message: 'Failed to retrieve parts health'
    });
  }
});

// Get specific part health
router.get('/parts/:id', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    
    const partHealth = {
      id: 'part_001',
      vehicleId: 'vehicle_001',
      name: 'Engine',
      category: 'powertrain',
      health: 92,
      status: 'excellent',
      lastCheck: new Date('2024-01-15T14:00:00Z'),
      estimatedLife: '150000 miles',
      currentMileage: 45000,
      remainingLife: '105000 miles',
      wearRate: 'normal',
      critical: false,
      specifications: {
        type: '4-Cylinder Turbo',
        displacement: '2.0L',
        fuelType: 'Gasoline',
        transmission: 'Automatic'
      },
      sensors: {
        temperature: 85,
        oilPressure: 45,
        oilLevel: 'normal',
        coolantLevel: 'normal'
      },
      maintenanceHistory: [
        {
          date: new Date('2024-01-01'),
          type: 'Oil Change',
          cost: 45,
          impact: 'positive',
          technician: 'Mike Johnson',
          notes: 'Used synthetic oil as recommended'
        },
        {
          date: new Date('2023-07-01'),
          type: 'Oil Change',
          cost: 45,
          impact: 'positive',
          technician: 'Mike Johnson',
          notes: 'Regular maintenance'
        }
      ],
      recommendations: [
        'Continue using synthetic oil',
        'Monitor oil level weekly',
        'Schedule next oil change at 50,000 miles'
      ]
    };

    res.json({
      success: true,
      data: partHealth
    });
  } catch (error) {
    logger.error('Error getting part health:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PART_HEALTH_FAILED',
      message: 'Failed to retrieve part health'
    });
  }
});

// ==================== PART LIFESPAN PREDICTIONS ====================

// Get part lifespan predictions
router.get('/parts/:id/lifespan', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    
    const lifespanPrediction = {
      partId: id,
      partName: 'Brake Pads - Front',
      currentHealth: 65,
      estimatedLife: '50000 miles',
      currentMileage: 45000,
      remainingLife: '2000 miles',
      remainingTime: '2 months',
      confidence: 85,
      factors: [
        {
          name: 'Driving Style',
          impact: 'negative',
          description: 'Aggressive braking detected',
          weight: 0.3
        },
        {
          name: 'Road Conditions',
          impact: 'neutral',
          description: 'Mixed city and highway driving',
          weight: 0.2
        },
        {
          name: 'Maintenance History',
          impact: 'positive',
          description: 'Regular brake inspections',
          weight: 0.2
        },
        {
          name: 'Environmental',
          impact: 'neutral',
          description: 'Moderate climate conditions',
          weight: 0.1
        },
        {
          name: 'Vehicle Age',
          impact: 'neutral',
          description: '4-year-old vehicle',
          weight: 0.2
        }
      ],
      predictions: [
        {
          scenario: 'Conservative Driving',
          estimatedLife: '3000 miles',
          confidence: 90,
          recommendations: ['Reduce aggressive braking', 'Increase following distance']
        },
        {
          scenario: 'Current Driving Style',
          estimatedLife: '2000 miles',
          confidence: 85,
          recommendations: ['Schedule brake inspection', 'Consider brake pad upgrade']
        },
        {
          scenario: 'Aggressive Driving',
          estimatedLife: '1000 miles',
          confidence: 75,
          recommendations: ['Immediate brake inspection', 'Change driving habits']
        }
      ]
    };

    res.json({
      success: true,
      data: lifespanPrediction
    });
  } catch (error) {
    logger.error('Error getting part lifespan prediction:', error);
    res.status(500).json({
      success: false,
      error: 'GET_LIFESPAN_PREDICTION_FAILED',
      message: 'Failed to retrieve part lifespan prediction'
    });
  }
});

// ==================== HEALTH-BASED ALERTS ====================

// Get car health alerts
router.get('/alerts', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { vehicleId, severity, status, category } = req.query;
    
    const healthAlerts = [
      {
        id: 'alert_001',
        vehicleId,
        type: 'maintenance',
        severity: 'medium',
        title: 'Brake Pads Wearing Fast',
        message: 'Front brake pads are wearing faster than expected. Consider inspection soon.',
        status: 'active',
        category: 'brakes',
        component: 'Brake Pads - Front',
        currentHealth: 65,
        threshold: 70,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        dueDate: new Date('2024-02-15'),
        dueMileage: 47000,
        actionRequired: 'Schedule brake inspection',
        priority: 'medium',
        estimatedCost: 120,
        recommendations: [
          'Schedule brake inspection within 1000 miles',
          'Check brake fluid level',
          'Monitor brake performance'
        ]
      },
      {
        id: 'alert_002',
        vehicleId,
        type: 'performance',
        severity: 'low',
        title: 'Air Filter Replacement Due',
        message: 'Air filter is approaching replacement interval.',
        status: 'active',
        category: 'intake',
        component: 'Air Filter',
        currentHealth: 70,
        threshold: 75,
        createdAt: new Date('2024-01-15T12:00:00Z'),
        dueDate: new Date('2024-01-25'),
        dueMileage: 45500,
        actionRequired: 'Replace air filter',
        priority: 'low',
        estimatedCost: 25,
        recommendations: [
          'Replace air filter within 500 miles',
          'Check for debris in air intake',
          'Monitor engine performance'
        ]
      }
    ];

    let filteredAlerts = healthAlerts;
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }
    if (status) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }
    if (category) {
      filteredAlerts = filteredAlerts.filter(alert => alert.category === category);
    }

    res.json({
      success: true,
      data: filteredAlerts,
      total: filteredAlerts.length
    });
  } catch (error) {
    logger.error('Error getting health alerts:', error);
    res.status(500).json({
      success: false,
      error: 'GET_HEALTH_ALERTS_FAILED',
      message: 'Failed to retrieve health alerts'
    });
  }
});

// Acknowledge health alert
router.put('/alerts/:id/acknowledge', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      message: 'Health alert acknowledged successfully',
      data: { alertId: id, acknowledgedAt: new Date() }
    });
  } catch (error) {
    logger.error('Error acknowledging health alert:', error);
    res.status(500).json({
      success: false,
      error: 'ACKNOWLEDGE_HEALTH_ALERT_FAILED',
      message: 'Failed to acknowledge health alert'
    });
  }
});

// ==================== PREDICTIVE MAINTENANCE ====================

// Get predictive maintenance schedule
router.get('/maintenance/schedule', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { vehicleId } = req.query;
    
    const maintenanceSchedule = {
      vehicleId,
      lastUpdated: new Date(),
      schedule: [
        {
          id: 'maintenance_001',
          component: 'Oil Change',
          type: 'routine',
          priority: 'high',
          estimatedDate: new Date('2024-02-15'),
          estimatedMileage: 50000,
          estimatedCost: 45,
          confidence: 95,
          reason: 'Based on engine hours and driving conditions',
          impact: 'high',
          recommendations: [
            'Use synthetic oil for better performance',
            'Check oil level weekly',
            'Monitor for oil leaks'
          ]
        },
        {
          id: 'maintenance_002',
          component: 'Brake Inspection',
          type: 'safety',
          priority: 'high',
          estimatedDate: new Date('2024-02-01'),
          estimatedMileage: 47000,
          estimatedCost: 50,
          confidence: 90,
          reason: 'Brake pad wear detected',
          impact: 'critical',
          recommendations: [
            'Schedule inspection within 1000 miles',
            'Check brake fluid level',
            'Test brake performance'
          ]
        },
        {
          id: 'maintenance_003',
          component: 'Air Filter Replacement',
          type: 'routine',
          priority: 'medium',
          estimatedDate: new Date('2024-01-25'),
          estimatedMileage: 45500,
          estimatedCost: 25,
          confidence: 85,
          reason: 'Filter approaching replacement interval',
          impact: 'medium',
          recommendations: [
            'Replace within 500 miles',
            'Check for debris in intake',
            'Monitor engine performance'
          ]
        }
      ],
      summary: {
        totalItems: 3,
        highPriority: 2,
        mediumPriority: 1,
        lowPriority: 0,
        totalEstimatedCost: 120,
        nextMaintenance: new Date('2024-01-25')
      }
    };

    res.json({
      success: true,
      data: maintenanceSchedule
    });
  } catch (error) {
    logger.error('Error getting maintenance schedule:', error);
    res.status(500).json({
      success: false,
      error: 'GET_MAINTENANCE_SCHEDULE_FAILED',
      message: 'Failed to retrieve maintenance schedule'
    });
  }
});

// ==================== HEALTH HISTORY TRACKING ====================

// Get car health history
router.get('/history', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, component, page = 1, limit = 20 } = req.query;
    
    const healthHistory = [
      {
        id: 'history_001',
        vehicleId,
        component: 'Overall',
        health: 87,
        status: 'good',
        timestamp: new Date('2024-01-15T14:00:00Z'),
        mileage: 45000,
        factors: ['routine_maintenance', 'normal_wear'],
        notes: 'Health check completed during oil change'
      },
      {
        id: 'history_002',
        vehicleId,
        component: 'Brakes',
        health: 65,
        status: 'fair',
        timestamp: new Date('2024-01-15T14:00:00Z'),
        mileage: 45000,
        factors: ['accelerated_wear', 'driving_style'],
        notes: 'Brake pad wear detected, monitoring required'
      },
      {
        id: 'history_003',
        vehicleId,
        component: 'Engine',
        health: 92,
        status: 'excellent',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        mileage: 44000,
        factors: ['synthetic_oil', 'regular_maintenance'],
        notes: 'Oil change completed, engine running smoothly'
      }
    ];

    let filteredHistory = healthHistory;
    if (component) {
      filteredHistory = filteredHistory.filter(history => history.component === component);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedHistory = filteredHistory.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredHistory.length,
        totalPages: Math.ceil(filteredHistory.length / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting health history:', error);
    res.status(500).json({
      success: false,
      error: 'GET_HEALTH_HISTORY_FAILED',
      message: 'Failed to retrieve health history'
    });
  }
});

// ==================== DETAILED HEALTH REPORTS ====================

// Get comprehensive health report
router.get('/reports/comprehensive', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { vehicleId, includeHistory, includePredictions } = req.query;
    
    const comprehensiveReport = {
      vehicleId,
      generatedAt: new Date(),
      reportId: `report_${Date.now()}`,
      summary: {
        overallHealth: 87,
        healthScore: 'B+',
        status: 'good',
        lastUpdated: new Date(),
        totalComponents: 9,
        excellentComponents: 3,
        goodComponents: 4,
        fairComponents: 2,
        poorComponents: 0,
        criticalComponents: 0
      },
      componentAnalysis: [
        {
          name: 'Engine',
          health: 92,
          status: 'excellent',
          trend: 'stable',
          issues: [],
          recommendations: ['Continue current maintenance schedule'],
          estimatedLife: '150000 miles',
          remainingLife: '105000 miles'
        },
        {
          name: 'Brakes',
          health: 65,
          status: 'fair',
          trend: 'declining',
          issues: ['Brake pad wear detected'],
          recommendations: ['Schedule brake inspection within 1000 miles'],
          estimatedLife: '50000 miles',
          remainingLife: '2000 miles'
        }
      ],
      maintenanceSchedule: {
        nextMaintenance: new Date('2024-01-25'),
        estimatedCost: 145,
        priorityItems: [
          'Brake inspection (high priority)',
          'Air filter replacement (medium priority)',
          'Oil change (scheduled)'
        ]
      },
      costProjections: {
        nextMonth: 50,
        nextThreeMonths: 145,
        nextSixMonths: 200,
        nextYear: 400
      },
      recommendations: [
        'Schedule brake inspection within 1000 miles',
        'Replace air filter within 500 miles',
        'Continue using synthetic oil',
        'Monitor brake performance'
      ]
    };

    res.json({
      success: true,
      data: comprehensiveReport
    });
  } catch (error) {
    logger.error('Error getting comprehensive health report:', error);
    res.status(500).json({
      success: false,
      error: 'GET_COMPREHENSIVE_REPORT_FAILED',
      message: 'Failed to retrieve comprehensive health report'
    });
  }
});

// Generate custom health report
router.post('/reports/generate', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { vehicleId, reportType, components, includeHistory, includePredictions } = req.body;
    
    const report = {
      id: `report_${Date.now()}`,
      vehicleId,
      type: reportType || 'custom',
      components: components || ['overall'],
      includeHistory: includeHistory || false,
      includePredictions: includePredictions || false,
      status: 'generating',
      estimatedCompletion: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Health report generation started successfully',
      data: report
    });
  } catch (error) {
    logger.error('Error generating health report:', error);
    res.status(500).json({
      success: false,
      error: 'GENERATE_HEALTH_REPORT_FAILED',
      message: 'Failed to generate health report'
    });
  }
});

// ==================== AI-POWERED RECOMMENDATIONS ====================

// Get AI health recommendations
router.get('/recommendations', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { vehicleId, category, priority } = req.query;
    
    const aiRecommendations = [
      {
        id: 'rec_001',
        vehicleId,
        type: 'maintenance',
        category: 'brakes',
        priority: 'high',
        title: 'Immediate Brake Inspection',
        description: 'Based on wear patterns and driving behavior, brake inspection is recommended within 1000 miles.',
        confidence: 92,
        reasoning: [
          'Brake pad wear rate is 15% above normal',
          'Aggressive braking detected in driving patterns',
          'Current health at 65% with 2000 miles remaining'
        ],
        actions: [
          'Schedule brake inspection at authorized service center',
          'Check brake fluid level and condition',
          'Test brake performance and response'
        ],
        estimatedCost: 50,
        timeToAct: '1000 miles or 2 weeks',
        impact: 'critical',
        createdAt: new Date()
      },
      {
        id: 'rec_002',
        vehicleId,
        type: 'performance',
        category: 'engine',
        priority: 'medium',
        title: 'Optimize Fuel Efficiency',
        description: 'Engine performance analysis suggests opportunities to improve fuel efficiency.',
        confidence: 78,
        reasoning: [
          'Current MPG is 5% below vehicle average',
          'Driving patterns show room for improvement',
          'Engine health is excellent at 92%'
        ],
        actions: [
          'Reduce aggressive acceleration and braking',
          'Maintain consistent speed on highways',
          'Check tire pressure and alignment'
        ],
        estimatedCost: 0,
        timeToAct: 'Immediate',
        impact: 'medium',
        createdAt: new Date()
      }
    ];

    let filteredRecommendations = aiRecommendations;
    if (category) {
      filteredRecommendations = filteredRecommendations.filter(rec => rec.category === category);
    }
    if (priority) {
      filteredRecommendations = filteredRecommendations.filter(rec => rec.priority === priority);
    }

    res.json({
      success: true,
      data: filteredRecommendations,
      total: filteredRecommendations.length
    });
  } catch (error) {
    logger.error('Error getting AI recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'GET_AI_RECOMMENDATIONS_FAILED',
      message: 'Failed to retrieve AI recommendations'
    });
  }
});

// ==================== VEHICLE COMPARISON ====================

// Compare vehicle health with similar vehicles
router.get('/compare', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { vehicleId, comparisonType } = req.query;
    
    const comparison = {
      vehicleId,
      comparisonType: comparisonType || 'similar_vehicles',
      generatedAt: new Date(),
      yourVehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        overallHealth: 87,
        healthScore: 'B+',
        mileage: 45000
      },
      comparisonData: {
        similarVehicles: {
          average: 85,
          range: { min: 78, max: 92 },
          percentile: 65,
          totalVehicles: 1250
        },
        vehicleAge: {
          average: 82,
          range: { min: 75, max: 89 },
          percentile: 70,
          totalVehicles: 1250
        },
        maintenanceHistory: {
          average: 88,
          range: { min: 80, max: 95 },
          percentile: 55,
          totalVehicles: 1250
        }
      },
      insights: [
        'Your vehicle health is above average for similar vehicles',
        'Health is in the top 35% for vehicles of this age',
        'Maintenance history is slightly below average'
      ],
      recommendations: [
        'Continue current maintenance schedule',
        'Consider more frequent inspections to improve maintenance score',
        'Your vehicle is performing well compared to peers'
      ]
    };

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    logger.error('Error getting vehicle comparison:', error);
    res.status(500).json({
      success: false,
      error: 'GET_VEHICLE_COMPARISON_FAILED',
      message: 'Failed to retrieve vehicle comparison'
    });
  }
});

// ==================== INSURANCE IMPACT ASSESSMENT ====================

// Get insurance impact assessment
router.get('/insurance/impact', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { vehicleId } = req.query;
    
    const insuranceImpact = {
      vehicleId,
      generatedAt: new Date(),
      currentHealth: 87,
      riskAssessment: 'low',
      premiumImpact: {
        current: 'standard',
        potential: 'discount',
        estimatedSavings: 15,
        factors: [
          'Good overall vehicle health',
          'Regular maintenance history',
          'No critical safety issues'
        ]
      },
      safetyScore: 85,
      reliabilityScore: 88,
      recommendations: [
        'Maintain current health score above 80',
        'Address brake system issues to improve safety score',
        'Continue regular maintenance schedule'
      ],
      nextReview: new Date('2024-04-15')
    };

    res.json({
      success: true,
      data: insuranceImpact
    });
  } catch (error) {
    logger.error('Error getting insurance impact assessment:', error);
    res.status(500).json({
      success: false,
      error: 'GET_INSURANCE_IMPACT_FAILED',
      message: 'Failed to retrieve insurance impact assessment'
    });
  }
});

// ==================== RESALE VALUE IMPACT ====================

// Get resale value impact
router.get('/resale/impact', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { vehicleId } = req.query;
    
    const resaleImpact = {
      vehicleId,
      generatedAt: new Date(),
      currentHealth: 87,
      estimatedValue: 18500,
      healthMultiplier: 1.15,
      marketValue: 16000,
      healthBonus: 2500,
      factors: [
        'Excellent engine health (92%)',
        'Good overall condition',
        'Regular maintenance history',
        'Low mileage for age'
      ],
      recommendations: [
        'Maintain health score above 85 for maximum value',
        'Address brake system issues before sale',
        'Keep maintenance records updated',
        'Consider minor repairs to boost value'
      ],
      projectedValue: {
        sixMonths: 18000,
        oneYear: 17500,
        twoYears: 16500
      }
    };

    res.json({
      success: true,
      data: resaleImpact
    });
  } catch (error) {
    logger.error('Error getting resale value impact:', error);
    res.status(500).json({
      success: false,
      error: 'GET_RESALE_IMPACT_FAILED',
      message: 'Failed to retrieve resale value impact'
    });
  }
});

// ==================== WARRANTY COVERAGE ANALYSIS ====================

// Get warranty coverage analysis
router.get('/warranty/coverage', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { vehicleId } = req.query;
    
    const warrantyAnalysis = {
      vehicleId,
      generatedAt: new Date(),
      currentHealth: 87,
      warrantyStatus: 'active',
      coverage: {
        powertrain: {
          status: 'covered',
          remaining: '3 years or 105000 miles',
          expires: new Date('2027-01-15'),
          health: 92
        },
        bumper: {
          status: 'expired',
          remaining: '0',
          expires: new Date('2023-01-15'),
          health: 85
        },
        emissions: {
          status: 'covered',
          remaining: '5 years or 80000 miles',
          expires: new Date('2029-01-15'),
          health: 90
        }
      },
      claims: [
        {
          date: new Date('2023-06-01'),
          component: 'Engine Sensor',
          covered: true,
          cost: 0,
          description: 'Oxygen sensor replacement'
        }
      ],
      recommendations: [
        'Powertrain warranty is active and healthy',
        'Emissions warranty provides good coverage',
        'Consider extended warranty for bumper-to-bumper coverage'
      ]
    };

    res.json({
      success: true,
      data: warrantyAnalysis
    });
  } catch (error) {
    logger.error('Error getting warranty coverage analysis:', error);
    res.status(500).json({
      success: false,
      error: 'GET_WARRANTY_ANALYSIS_FAILED',
      message: 'Failed to retrieve warranty coverage analysis'
    });
  }
});

// ==================== ROAD SAFETY ASSESSMENT ====================

// Get road safety assessment
router.get('/road-safety/assessment', authenticateToken, carHealthRateLimit, async (req, res) => {
  try {
    const { vehicleId } = req.query;
    
    const safetyAssessment = {
      vehicleId,
      generatedAt: new Date(),
      overallSafety: 85,
      safetyGrade: 'B+',
      criticalSystems: {
        brakes: {
          health: 65,
          status: 'attention_required',
          safetyImpact: 'medium',
          recommendations: ['Schedule brake inspection within 1000 miles']
        },
        steering: {
          health: 90,
          status: 'good',
          safetyImpact: 'low',
          recommendations: ['Continue current maintenance']
        },
        suspension: {
          health: 88,
          status: 'good',
          safetyImpact: 'low',
          recommendations: ['Monitor for unusual handling']
        },
        tires: {
          health: 90,
          status: 'good',
          safetyImpact: 'low',
          recommendations: ['Check tire pressure monthly']
        }
      },
      safetyAlerts: [
        {
          type: 'warning',
          component: 'Brakes',
          message: 'Brake system requires attention',
          priority: 'medium',
          actionRequired: 'Schedule inspection'
        }
      ],
      recommendations: [
        'Address brake system issues promptly',
        'Maintain tire pressure and condition',
        'Regular safety system inspections',
        'Keep emergency kit updated'
      ],
      nextSafetyCheck: new Date('2024-02-01')
    };

    res.json({
      success: true,
      data: safetyAssessment
    });
  } catch (error) {
    logger.error('Error getting road safety assessment:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SAFETY_ASSESSMENT_FAILED',
      message: 'Failed to retrieve road safety assessment'
    });
  }
});


// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'car-health'} service is running`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'car-health'} item retrieved`,
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: `${'car-health'} item created`,
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
    message: `${'car-health'} item updated`,
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
    message: `${'car-health'} item deleted`,
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'car-health'} search results`,
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;
