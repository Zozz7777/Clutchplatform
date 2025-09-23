/**
 * Business Intelligence Routes
 * Handles advanced analytics and business intelligence endpoints
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// GET /api/v1/analytics/compliance-status - Get compliance status
router.get('/compliance-status', authenticateToken, async (req, res) => {
  try {
    const complianceCollection = await getCollection('compliance');
    const auditCollection = await getCollection('audit_trail');
    
    const [complianceData, recentAudits] = await Promise.all([
      complianceCollection.findOne({ type: 'current_status' }),
      auditCollection.find({ type: 'compliance_check' })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray()
    ]);
    
    const pendingApprovals = await complianceCollection.countDocuments({ status: 'pending' });
    const violations = await complianceCollection.countDocuments({ status: 'violation' });
    const securityIncidents = await auditCollection.countDocuments({ 
      type: 'security_incident',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    const overallStatus = violations > 0 ? 'red' : securityIncidents > 2 ? 'amber' : 'green';
    
    res.json({
      success: true,
      data: {
        pendingApprovals,
        violations,
        securityIncidents,
        overallStatus,
        lastAudit: recentAudits[0]?.createdAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextAudit: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching compliance status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch compliance status' });
  }
});

// GET /api/v1/analytics/engagement-heatmap - Get engagement heatmap data
router.get('/engagement-heatmap', authenticateToken, async (req, res) => {
  try {
    const usersCollection = await getCollection('users');
    const activityCollection = await getCollection('user_activity');
    
    // Get user segments
    const segments = ['Enterprise', 'SMB', 'Service Providers'];
    const features = ['Dashboard', 'Fleet Management', 'Analytics', 'Reports', 'Settings'];
    
    const heatmapData = await Promise.all(segments.map(async (segment) => {
      const segmentUsers = await usersCollection.find({ segment }).toArray();
      const userIds = segmentUsers.map(user => user._id);
      
      const featureUsage = {};
      for (const feature of features) {
        const usage = await activityCollection.countDocuments({
          userId: { $in: userIds },
          feature,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
        featureUsage[feature] = Math.min(100, (usage / Math.max(segmentUsers.length, 1)) * 100);
      }
      
      return {
        segment,
        features: featureUsage
      };
    }));
    
    res.json({
      success: true,
      data: {
        segments: heatmapData
      }
    });
  } catch (error) {
    console.error('Error fetching engagement heatmap:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch engagement heatmap' });
  }
});

// GET /api/v1/fleet/maintenance-forecast - Get maintenance forecast
router.get('/maintenance-forecast', authenticateToken, async (req, res) => {
  try {
    const vehiclesCollection = await getCollection('vehicles');
    const maintenanceCollection = await getCollection('maintenance_records');
    
    const vehicles = await vehiclesCollection.find({ status: 'active' }).toArray();
    const forecasts = [];
    
    for (const vehicle of vehicles) {
      const lastMaintenance = await maintenanceCollection
        .findOne({ vehicleId: vehicle._id }, { sort: { createdAt: -1 } });
      
      if (lastMaintenance) {
        const daysSinceMaintenance = Math.floor((Date.now() - lastMaintenance.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const predictedDays = Math.max(30, 90 - daysSinceMaintenance);
        const confidence = Math.max(70, 100 - (daysSinceMaintenance / 2));
        
        forecasts.push({
          vehicleId: vehicle._id.toString(),
          vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
          predictedDate: new Date(Date.now() + predictedDays * 24 * 60 * 60 * 1000).toISOString(),
          confidence: Math.min(95, confidence),
          reason: daysSinceMaintenance > 60 ? 'Overdue for maintenance' : 'Scheduled maintenance based on usage patterns'
        });
      }
    }
    
    res.json({
      success: true,
      data: forecasts.sort((a, b) => new Date(a.predictedDate) - new Date(b.predictedDate))
    });
  } catch (error) {
    console.error('Error fetching maintenance forecast:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch maintenance forecast' });
  }
});

// GET /api/v1/analytics/recommendation-uplift - Get recommendation uplift data
router.get('/recommendation-uplift', authenticateToken, async (req, res) => {
  try {
    const recommendationsCollection = await getCollection('recommendations');
    const paymentsCollection = await getCollection('payments');
    
    const recommendations = await recommendationsCollection.find({}).toArray();
    const recommendationsSent = recommendations.length;
    const accepted = recommendations.filter(r => r.status === 'accepted').length;
    
    const acceptedRecommendations = recommendations.filter(r => r.status === 'accepted');
    const revenueImpact = acceptedRecommendations.reduce((sum, r) => sum + (r.revenueImpact || 0), 0);
    
    const engagementImprovement = accepted > 0 ? (accepted / recommendationsSent) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        recommendationsSent,
        accepted,
        revenueImpact,
        engagementImprovement,
        topPerformingTypes: ['Route Optimization', 'Maintenance Scheduling', 'Fuel Efficiency']
      }
    });
  } catch (error) {
    console.error('Error fetching recommendation uplift:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recommendation uplift' });
  }
});

// GET /api/v1/business-intelligence/operational-pulse - Get operational pulse data
router.get('/operational-pulse', authenticateToken, async (req, res) => {
  try {
    const usersCollection = await getCollection('users');
    const vehiclesCollection = await getCollection('vehicles');
    const sessionsCollection = await getCollection('user_sessions');
    const paymentsCollection = await getCollection('payments');
    
    const [users, vehicles, activeSessions, revenueData] = await Promise.all([
      usersCollection.find({}).toArray(),
      vehiclesCollection.find({}).toArray(),
      sessionsCollection.countDocuments({
        lastActivity: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
        status: 'active'
      }),
      paymentsCollection.aggregate([
        { 
          $match: { 
            createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray()
    ]);

    const activeUsers = users.filter(u => u.isActive).length;
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const totalVehicles = vehicles.length;
    const monthlyRevenue = revenueData[0]?.total || 0;
    
    // Calculate new users in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = users.filter(u => new Date(u.createdAt) > thirtyDaysAgo).length;
    
    // Calculate conversion rate (simplified)
    const conversionRate = users.length > 0 ? (activeUsers / users.length) * 100 : 0;
    
    // Calculate efficiency (simplified)
    const efficiency = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        newUsers,
        activeSessions,
        activeVehicles,
        revenueImpact: monthlyRevenue,
        conversionRate,
        efficiency,
        userGrowth: 0, // TODO: Calculate from historical data
        revenueGrowth: 0 // TODO: Calculate from historical data
      }
    });
  } catch (error) {
    console.error('Error fetching operational pulse:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch operational pulse' });
  }
});

// GET /api/v1/business-intelligence/churn-risk - Get churn risk data
router.get('/churn-risk', authenticateToken, async (req, res) => {
  try {
    const usersCollection = await getCollection('users');
    const activityCollection = await getCollection('user_activity');
    
    const users = await usersCollection.find({}).toArray();
    const churnRisks = [];
    
    for (const user of users) {
      // Get user activity in last 30 days
      const recentActivity = await activityCollection.countDocuments({
        userId: user._id,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });
      
      // Simple churn risk calculation
      const daysSinceLastActivity = user.lastLogin ? 
        Math.floor((Date.now() - new Date(user.lastLogin).getTime()) / (1000 * 60 * 60 * 24)) : 30;
      
      let riskScore = 0;
      let factors = [];
      
      if (daysSinceLastActivity > 14) {
        riskScore += 30;
        factors.push('Inactive for 2+ weeks');
      }
      if (recentActivity < 5) {
        riskScore += 25;
        factors.push('Low recent activity');
      }
      if (!user.isActive) {
        riskScore += 40;
        factors.push('Account inactive');
      }
      
      if (riskScore > 50) {
        churnRisks.push({
          userId: user._id.toString(),
          userName: user.name || user.email,
          riskScore: Math.min(100, riskScore),
          confidence: Math.max(70, 100 - riskScore),
          factors,
          lastActivity: user.lastLogin || user.createdAt,
          predictedChurnDate: new Date(Date.now() + (30 - riskScore) * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }
    
    res.json({
      success: true,
      data: churnRisks.sort((a, b) => b.riskScore - a.riskScore)
    });
  } catch (error) {
    console.error('Error fetching churn risk:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch churn risk' });
  }
});

// GET /api/v1/business-intelligence/revenue-cost-margin - Get revenue vs cost margin
router.get('/revenue-cost-margin', authenticateToken, async (req, res) => {
  try {
    const paymentsCollection = await getCollection('payments');
    const vehiclesCollection = await getCollection('vehicles');
    const maintenanceCollection = await getCollection('maintenance_records');
    
    const currentMonth = new Date();
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    
    const [monthlyRevenue, lastMonthRevenue, vehicles, maintenanceCosts] = await Promise.all([
      paymentsCollection.aggregate([
        { $match: { createdAt: { $gte: currentMonthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      paymentsCollection.aggregate([
        { $match: { createdAt: { $gte: lastMonth, $lt: currentMonthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      vehiclesCollection.find({}).toArray(),
      maintenanceCollection.aggregate([
        { $match: { createdAt: { $gte: currentMonthStart } } },
        { $group: { _id: null, total: { $sum: '$cost' } } }
      ]).toArray()
    ]);
    
    const revenue = monthlyRevenue[0]?.total || 0;
    const lastMonthTotal = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthTotal > 0 ? ((revenue - lastMonthTotal) / lastMonthTotal) * 100 : 0;
    
    // Calculate costs
    const fleetCosts = vehicles.length * 1000; // Simplified fleet operational costs
    const maintenance = maintenanceCosts[0]?.total || 0;
    const infrastructure = 5000; // Simplified infrastructure costs
    const other = 2000; // Simplified other costs
    
    const totalCosts = fleetCosts + maintenance + infrastructure + other;
    const margin = revenue > 0 ? ((revenue - totalCosts) / revenue) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        revenue,
        costs: totalCosts,
        margin,
        breakdown: {
          fleet: fleetCosts,
          infrastructure,
          maintenance,
          other
        },
        revenueGrowth,
        costGrowth: 0 // TODO: Calculate from historical data
      }
    });
  } catch (error) {
    console.error('Error fetching revenue cost margin:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch revenue cost margin' });
  }
});

// GET /api/v1/business-intelligence/revenue-forecast - Get AI revenue forecast
router.get('/revenue-forecast', authenticateToken, async (req, res) => {
  try {
    const paymentsCollection = await getCollection('payments');
    
    const currentMonth = new Date();
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const monthlyRevenue = await paymentsCollection.aggregate([
      { $match: { createdAt: { $gte: currentMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    const baseRevenue = monthlyRevenue[0]?.total || 45000;
    
    const forecast = [
      {
        period: '7d',
        base: baseRevenue * 0.33,
        optimistic: baseRevenue * 0.4,
        pessimistic: baseRevenue * 0.27,
        confidence: 85,
        factors: ['seasonal trends', 'user growth']
      },
      {
        period: '30d',
        base: baseRevenue,
        optimistic: baseRevenue * 1.2,
        pessimistic: baseRevenue * 0.8,
        confidence: 80,
        factors: ['market conditions', 'competition']
      },
      {
        period: '90d',
        base: baseRevenue * 2.9,
        optimistic: baseRevenue * 3.5,
        pessimistic: baseRevenue * 2.3,
        confidence: 75,
        factors: ['economic outlook', 'product updates']
      }
    ];
    
    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    console.error('Error fetching revenue forecast:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch revenue forecast' });
  }
});

// GET /api/v1/business-intelligence/top-enterprise-clients - Get top enterprise clients
router.get('/top-enterprise-clients', authenticateToken, async (req, res) => {
  try {
    const usersCollection = await getCollection('users');
    const paymentsCollection = await getCollection('payments');
    
    const enterpriseUsers = await usersCollection.find({ 
      userType: 'enterprise',
      isActive: true 
    }).toArray();
    
    const clients = [];
    
    for (const user of enterpriseUsers) {
      const userPayments = await paymentsCollection.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray();
      
      const revenue = userPayments[0]?.total || 0;
      const activity = Math.random() * 100; // Simplified activity calculation
      const growth = (Math.random() - 0.5) * 20; // Simplified growth calculation
      
      clients.push({
        id: user._id.toString(),
        name: user.name || user.email,
        revenue,
        activity,
        growth
      });
    }
    
    // Sort by revenue and return top 5
    const topClients = clients
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    res.json({
      success: true,
      data: topClients
    });
  } catch (error) {
    console.error('Error fetching top enterprise clients:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top enterprise clients' });
  }
});

// GET /api/v1/analytics/active-sessions - Get active sessions count
router.get('/active-sessions', authenticateToken, async (req, res) => {
  try {
    const sessionsCollection = await getCollection('user_sessions');
    
    const activeSessions = await sessionsCollection.countDocuments({
      lastActivity: { $gte: new Date(Date.now() - 30 * 60 * 1000) }, // Last 30 minutes
      status: 'active'
    });
    
    res.json({
      success: true,
      data: {
        count: activeSessions
      }
    });
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch active sessions' });
  }
});

// GET /api/v1/business-intelligence/user-growth-cohort - Get user growth cohort data
router.get('/user-growth-cohort', authenticateToken, async (req, res) => {
  try {
    const usersCollection = await getCollection('users');
    
    const currentDate = new Date();
    const cohorts = [];
    
    // Generate cohorts for last 12 months
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      
      const newUsers = await usersCollection.countDocuments({
        createdAt: {
          $gte: monthStart,
          $lte: monthEnd
        }
      });
      
      cohorts.push({
        month: monthStart.toISOString().substring(0, 7), // YYYY-MM format
        newUsers,
        retention: Math.max(0, 100 - (i * 8)) // Simplified retention calculation
      });
    }
    
    res.json({
      success: true,
      data: {
        cohorts,
        totalUsers: await usersCollection.countDocuments(),
        averageRetention: cohorts.reduce((sum, c) => sum + c.retention, 0) / cohorts.length
      }
    });
  } catch (error) {
    console.error('Error fetching user growth cohort:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user growth cohort' });
  }
});

// GET /api/v1/business-intelligence/onboarding-completion - Get onboarding completion data
router.get('/onboarding-completion', authenticateToken, async (req, res) => {
  try {
    const usersCollection = await getCollection('users');
    const onboardingCollection = await getCollection('user_onboarding');
    
    const totalUsers = await usersCollection.countDocuments();
    const completedOnboarding = await onboardingCollection.countDocuments({ 
      status: 'completed' 
    });
    
    const completionRate = totalUsers > 0 ? (completedOnboarding / totalUsers) * 100 : 0;
    
    // Get onboarding steps completion
    const onboardingSteps = await onboardingCollection.aggregate([
      {
        $group: {
          _id: '$step',
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]).toArray();
    
    res.json({
      success: true,
      data: {
        total: totalUsers,
        completed: completedOnboarding,
        completionRate: Math.round(completionRate * 10) / 10,
        steps: onboardingSteps.map(step => ({
          step: step._id,
          completed: step.completed,
          total: step.total,
          completionRate: step.total > 0 ? (step.completed / step.total) * 100 : 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching onboarding completion:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch onboarding completion' });
  }
});

// GET /api/v1/business-intelligence/role-distribution - Get role distribution data
router.get('/role-distribution', authenticateToken, async (req, res) => {
  try {
    const usersCollection = await getCollection('users');
    
    const roleDistribution = await usersCollection.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    const totalUsers = await usersCollection.countDocuments();
    
    res.json({
      success: true,
      data: {
        roles: roleDistribution.map(role => ({
          role: role._id || 'Unknown',
          count: role.count,
          active: role.active,
          percentage: totalUsers > 0 ? (role.count / totalUsers) * 100 : 0
        })),
        totalUsers,
        totalActive: roleDistribution.reduce((sum, role) => sum + role.active, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching role distribution:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch role distribution' });
  }
});

// GET /api/v1/analytics/revenue-metrics - Get revenue metrics
router.get('/revenue-metrics', authenticateToken, async (req, res) => {
  try {
    const paymentsCollection = await getCollection('payments');
    
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const [monthlyRevenue, totalRevenue, lastMonthRevenue] = await Promise.all([
      paymentsCollection.aggregate([
        { 
          $match: { 
            createdAt: { $gte: currentMonthStart } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      paymentsCollection.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      paymentsCollection.aggregate([
        { 
          $match: { 
            createdAt: { 
              $gte: lastMonth,
              $lt: currentMonthStart
            } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray()
    ]);
    
    const monthly = monthlyRevenue[0]?.total || 0;
    const total = totalRevenue[0]?.total || 0;
    const lastMonthTotal = lastMonthRevenue[0]?.total || 0;
    const growth = lastMonthTotal > 0 ? ((monthly - lastMonthTotal) / lastMonthTotal) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        monthly,
        total,
        growth: Math.round(growth * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error fetching revenue metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch revenue metrics' });
  }
});

module.exports = router;
