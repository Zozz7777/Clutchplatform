const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// GET /api/v1/enterprise/clients
router.get('/clients', authenticateToken, async (req, res) => {
  try {
    const clientsCollection = await getCollection('enterprise_clients');
    if (!clientsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    const clients = await clientsCollection.find({}).toArray();
    res.json({
      success: true,
      data: clients || [],
      message: 'Enterprise clients retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching enterprise clients:', error);
    res.status(500).json({
      success: false,
      error: 'FAILED_TO_FETCH_ENTERPRISE_CLIENTS',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/enterprise/stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const clientsCollection = await getCollection('enterprise_clients');
    if (!clientsCollection) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_CONNECTION_FAILED',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    const clients = await clientsCollection.find({}).toArray();
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'active').length;
    const totalRevenue = clients.reduce((sum, c) => sum + (c.subscription?.monthlyFee || 0), 0);
    const totalVehicles = clients.reduce((sum, c) => sum + (c.fleet?.totalVehicles || 0), 0);
    const averageFleetSize = totalClients > 0 ? totalVehicles / totalClients : 0;
    const whiteLabelClients = clients.filter(c => c.whiteLabel?.enabled).length;
    const apiUsage = clients.reduce((sum, c) => sum + (c.api?.usage || 0), 0);
    const stats = {
      totalClients,
      activeClients,
      totalRevenue,
      monthlyRecurringRevenue: totalRevenue,
      averageFleetSize,
      totalVehicles,
      apiUsage,
      whiteLabelClients
    };
    res.json({
      success: true,
      data: stats,
      message: 'Enterprise statistics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching enterprise stats:', error);
    res.status(500).json({
      success: false,
      error: 'FAILED_TO_FETCH_ENTERPRISE_STATS',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
