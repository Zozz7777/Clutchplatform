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
