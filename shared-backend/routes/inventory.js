const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/inventory/items:
 *   get:
 *     summary: Get inventory items
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Inventory items retrieved successfully
 *       400:
 *         description: Bad request
 */
router.get('/items', asyncHandler(async (req, res) => {
    const { shop_id } = req.query;
    
    if (!shop_id) {
        return res.status(400).json({
            success: false,
            error: 'MISSING_SHOP_ID',
            message: 'Shop ID is required'
        });
    }

    // Mock inventory data
    const inventoryItems = [
        {
            id: '1',
            name: 'Brake Pads',
            category: 'Brakes',
            quantity: 50,
            price: 25.99,
            supplier: 'AutoParts Inc',
            sku: 'BP001',
            status: 'in_stock'
        },
        {
            id: '2',
            name: 'Oil Filter',
            category: 'Engine',
            quantity: 100,
            price: 8.99,
            supplier: 'EngineParts Ltd',
            sku: 'OF002',
            status: 'in_stock'
        },
        {
            id: '3',
            name: 'Air Filter',
            category: 'Engine',
            quantity: 25,
            price: 12.99,
            supplier: 'EngineParts Ltd',
            sku: 'AF003',
            status: 'low_stock'
        }
    ];

    res.json({
        success: true,
        data: inventoryItems,
        total: inventoryItems.length
    });
}));

/**
 * @swagger
 * /api/inventory/alerts:
 *   get:
 *     summary: Get inventory alerts
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Inventory alerts retrieved successfully
 *       400:
 *         description: Bad request
 */
router.get('/alerts', asyncHandler(async (req, res) => {
    const { shop_id } = req.query;
    
    if (!shop_id) {
        return res.status(400).json({
            success: false,
            error: 'MISSING_SHOP_ID',
            message: 'Shop ID is required'
        });
    }

    // Mock alerts data
    const alerts = [
        {
            id: '1',
            type: 'low_stock',
            item: 'Air Filter',
            current_quantity: 5,
            min_quantity: 10,
            priority: 'high',
            created_at: new Date().toISOString()
        },
        {
            id: '2',
            type: 'out_of_stock',
            item: 'Spark Plugs',
            current_quantity: 0,
            min_quantity: 20,
            priority: 'critical',
            created_at: new Date().toISOString()
        }
    ];

    res.json({
        success: true,
        data: alerts,
        total: alerts.length
    });
}));

/**
 * @swagger
 * /api/inventory/recommendations:
 *   get:
 *     summary: Get inventory recommendations
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Inventory recommendations retrieved successfully
 *       400:
 *         description: Bad request
 */
router.get('/recommendations', asyncHandler(async (req, res) => {
    const { shop_id } = req.query;
    
    if (!shop_id) {
        return res.status(400).json({
            success: false,
            error: 'MISSING_SHOP_ID',
            message: 'Shop ID is required'
        });
    }

    // Mock recommendations data
    const recommendations = [
        {
            id: '1',
            type: 'restock',
            item: 'Air Filter',
            current_quantity: 5,
            recommended_quantity: 50,
            reason: 'High demand item',
            priority: 'high'
        },
        {
            id: '2',
            type: 'new_item',
            item: 'Timing Belt',
            recommended_quantity: 20,
            reason: 'Popular in your area',
            priority: 'medium'
        }
    ];

    res.json({
        success: true,
        data: recommendations,
        total: recommendations.length
    });
}));

module.exports = router;
