import express from 'express';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { logger } from '../../lib/logger';
import { User } from '../../types';

const router = express.Router();
const databaseManager = new DatabaseManager();
const authManager = new AuthManager();

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

    // Get products with sales data for forecasting
    const forecastData = await databaseManager.query(`
      SELECT 
        p.id, p.name, p.name_ar, p.sku, p.current_stock,
        AVG(si.quantity) as avg_daily_sales,
        COUNT(si.id) as total_sales_count,
        MAX(s.created_at) as last_sale_date
      FROM products p
      LEFT JOIN sale_items si ON p.id = si.product_id
      LEFT JOIN sales s ON si.sale_id = s.id AND s.payment_status = 'completed'
      WHERE p.is_active = 1
      GROUP BY p.id, p.name, p.name_ar, p.sku, p.current_stock
      HAVING total_sales_count > 0
      ORDER BY avg_daily_sales DESC
      LIMIT 20
    `);

    // Simple demand forecasting algorithm
    const forecasts = forecastData.map(product => {
      const avgDailySales = product.avg_daily_sales || 0;
      const daysSinceLastSale = product.last_sale_date ? 
        Math.floor((Date.now() - new Date(product.last_sale_date).getTime()) / (1000 * 60 * 60 * 24)) : 30;
      
      // Predict demand for next 30 days
      const predictedDemand = Math.max(0, avgDailySales * 30);
      const confidence = Math.min(95, Math.max(10, 100 - daysSinceLastSale));
      
      return {
        product_id: product.id,
        product_name: product.name,
        current_demand: avgDailySales,
        predicted_demand: Math.round(predictedDemand),
        confidence: Math.round(confidence),
        trend: avgDailySales > 0 ? 'stable' : 'declining',
        seasonal_factor: 1.0
      };
    });

    res.json({
      success: true,
      data: { forecasts },
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

    // Get products with pricing and sales data
    const priceData = await databaseManager.query(`
      SELECT 
        p.id, p.name, p.name_ar, p.cost_price, p.selling_price,
        AVG(si.unit_price) as avg_selling_price,
        SUM(si.quantity) as total_sold,
        COUNT(si.id) as sales_count
      FROM products p
      LEFT JOIN sale_items si ON p.id = si.product_id
      LEFT JOIN sales s ON si.sale_id = s.id AND s.payment_status = 'completed'
      WHERE p.is_active = 1
      GROUP BY p.id, p.name, p.name_ar, p.cost_price, p.selling_price
      HAVING sales_count > 5
      ORDER BY total_sold DESC
      LIMIT 20
    `);

    // Simple price optimization algorithm
    const optimizations = priceData.map(product => {
      const currentPrice = product.selling_price;
      const costPrice = product.cost_price;
      const avgSellingPrice = product.avg_selling_price || currentPrice;
      const totalSold = product.total_sold || 0;
      
      // Calculate margin
      const currentMargin = ((currentPrice - costPrice) / currentPrice) * 100;
      
      // Simple optimization: if margin is low and sales are good, suggest price increase
      let optimizedPrice = currentPrice;
      let recommendation = 'maintain';
      
      if (currentMargin < 20 && totalSold > 10) {
        optimizedPrice = Math.min(currentPrice * 1.1, avgSellingPrice * 1.05);
        recommendation = 'increase';
      } else if (currentMargin > 50 && totalSold < 5) {
        optimizedPrice = Math.max(currentPrice * 0.9, costPrice * 1.2);
        recommendation = 'decrease';
      }
      
      const expectedSalesIncrease = recommendation === 'increase' ? -5 : recommendation === 'decrease' ? 15 : 0;
      const expectedRevenueIncrease = ((optimizedPrice - currentPrice) / currentPrice) * 100;
      
      return {
        product_id: product.id,
        product_name: product.name,
        current_price: currentPrice,
        optimized_price: Math.round(optimizedPrice * 100) / 100,
        expected_sales_increase: expectedSalesIncrease,
        expected_revenue_increase: Math.round(expectedRevenueIncrease),
        confidence: 75,
        recommendation
      };
    });

    res.json({
      success: true,
      data: { optimizations },
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

    // Get products with inventory and sales data
    const inventoryData = await databaseManager.query(`
      SELECT 
        p.id, p.name, p.name_ar, p.current_stock, p.min_stock, p.max_stock,
        AVG(si.quantity) as avg_sale_quantity,
        COUNT(si.id) as sales_count,
        SUM(si.quantity) as total_sold
      FROM products p
      LEFT JOIN sale_items si ON p.id = si.product_id
      LEFT JOIN sales s ON si.sale_id = s.id AND s.payment_status = 'completed'
      WHERE p.is_active = 1
      GROUP BY p.id, p.name, p.name_ar, p.current_stock, p.min_stock, p.max_stock
      ORDER BY total_sold DESC
      LIMIT 30
    `);

    // Simple inventory optimization algorithm
    const optimizations = inventoryData.map(product => {
      const currentStock = product.current_stock || 0;
      const minStock = product.min_stock || 0;
      const avgSaleQuantity = product.avg_sale_quantity || 1;
      const salesCount = product.sales_count || 0;
      
      // Calculate recommended stock levels
      const recommendedStock = Math.max(minStock, Math.ceil(avgSaleQuantity * 30)); // 30 days supply
      const reorderPoint = Math.max(minStock, Math.ceil(avgSaleQuantity * 7)); // 7 days supply
      const reorderQuantity = Math.max(10, Math.ceil(avgSaleQuantity * 30)); // 30 days supply
      
      // Calculate probabilities
      const stockoutProbability = currentStock <= reorderPoint ? 80 : currentStock <= recommendedStock ? 30 : 5;
      const overstockProbability = currentStock > (recommendedStock * 2) ? 70 : currentStock > recommendedStock ? 20 : 5;
      
      return {
        product_id: product.id,
        product_name: product.name,
        current_stock: currentStock,
        recommended_stock: recommendedStock,
        reorder_point: reorderPoint,
        reorder_quantity: reorderQuantity,
        stockout_probability: stockoutProbability,
        overstock_probability: overstockProbability
      };
    });

    res.json({
      success: true,
      data: { optimizations },
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

export default router;
