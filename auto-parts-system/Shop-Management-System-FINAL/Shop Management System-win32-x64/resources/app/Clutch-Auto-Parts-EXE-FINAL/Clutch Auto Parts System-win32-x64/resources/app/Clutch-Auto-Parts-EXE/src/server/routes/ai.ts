import express from 'express';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { AIManager } from '../../lib/ai-manager';
import { logger } from '../../lib/logger';
import { User } from '../../types';

const router = express.Router();
const databaseManager = new DatabaseManager();
const authManager = new AuthManager();
const aiManager = new AIManager();

// Middleware to check authentication
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const currentUser = await authManager.getCurrentUser();
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'NOT_AUTHENTICATED',
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }
    req.user = currentUser as User;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_FAILED',
      message: 'Authentication failed',
      timestamp: new Date().toISOString()
    });
  }
};

// GET /api/ai/demand-forecast - Get demand forecast
router.get('/demand-forecast', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'ai.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to view AI insights',
        timestamp: new Date().toISOString()
      });
    }

    const { period = '30d' } = req.query;
    const forecasts = await aiManager.generateDemandForecast(period as '7d' | '30d' | '90d');

    res.json({
      success: true,
      data: forecasts,
      message: 'Demand forecast generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Generate demand forecast error:', error);
    res.status(500).json({
      success: false,
      error: 'DEMAND_FORECAST_FAILED',
      message: 'Failed to generate demand forecast',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/ai/price-optimization - Get price optimization suggestions
router.get('/price-optimization', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'ai.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to view AI insights',
        timestamp: new Date().toISOString()
      });
    }

    const optimizations = await aiManager.generatePricingOptimization();

    res.json({
      success: true,
      data: optimizations,
      message: 'Price optimization suggestions generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Generate price optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'PRICE_OPTIMIZATION_FAILED',
      message: 'Failed to generate price optimization suggestions',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/ai/inventory-optimization - Get inventory optimization suggestions
router.get('/inventory-optimization', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'ai.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to view AI insights',
        timestamp: new Date().toISOString()
      });
    }

    const optimizations = await aiManager.generateInventoryOptimization();

    res.json({
      success: true,
      data: optimizations,
      message: 'Inventory optimization suggestions generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Generate inventory optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'INVENTORY_OPTIMIZATION_FAILED',
      message: 'Failed to generate inventory optimization suggestions',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/ai/customer-insights - Get customer insights
router.get('/customer-insights', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'ai.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to view AI insights',
        timestamp: new Date().toISOString()
      });
    }

    const insights = await aiManager.generateCustomerInsights();

    res.json({
      success: true,
      data: insights,
      message: 'Customer insights generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Generate customer insights error:', error);
    res.status(500).json({
      success: false,
      error: 'CUSTOMER_INSIGHTS_FAILED',
      message: 'Failed to generate customer insights',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
