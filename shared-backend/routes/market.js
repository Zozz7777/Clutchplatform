const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/market/insights:
 *   get:
 *     summary: Get market insights
 *     tags: [Market]
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Market insights retrieved successfully
 *       400:
 *         description: Bad request
 */
router.get('/insights', asyncHandler(async (req, res) => {
    const { shop_id } = req.query;
    
    if (!shop_id) {
        return res.status(400).json({
            success: false,
            error: 'MISSING_SHOP_ID',
            message: 'Shop ID is required'
        });
    }

    // Mock market insights data
    const insights = {
        total_market_value: 1250000,
        growth_rate: 12.5,
        top_categories: [
            { name: 'Engine Parts', value: 450000, growth: 15.2 },
            { name: 'Brake Systems', value: 320000, growth: 8.7 },
            { name: 'Suspension', value: 280000, growth: 18.3 },
            { name: 'Electrical', value: 200000, growth: 22.1 }
        ],
        seasonal_trends: {
            spring: { demand: 'high', items: ['Air Filters', 'Brake Pads'] },
            summer: { demand: 'medium', items: ['Oil Filters', 'Coolant'] },
            fall: { demand: 'high', items: ['Batteries', 'Tires'] },
            winter: { demand: 'low', items: ['Heater Parts', 'Defrosters'] }
        }
    };

    res.json({
        success: true,
        data: insights
    });
}));

/**
 * @swagger
 * /api/market/trends:
 *   get:
 *     summary: Get market trends
 *     tags: [Market]
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Market trends retrieved successfully
 *       400:
 *         description: Bad request
 */
router.get('/trends', asyncHandler(async (req, res) => {
    const { shop_id } = req.query;
    
    if (!shop_id) {
        return res.status(400).json({
            success: false,
            error: 'MISSING_SHOP_ID',
            message: 'Shop ID is required'
        });
    }

    // Mock trends data
    const trends = [
        {
            category: 'Electric Vehicle Parts',
            trend: 'rising',
            growth_rate: 45.2,
            forecast: 'High demand expected'
        },
        {
            category: 'Hybrid Components',
            trend: 'rising',
            growth_rate: 28.7,
            forecast: 'Steady growth'
        },
        {
            category: 'Traditional Engine Parts',
            trend: 'stable',
            growth_rate: 2.1,
            forecast: 'Maintaining current levels'
        }
    ];

    res.json({
        success: true,
        data: trends
    });
}));

/**
 * @swagger
 * /api/market/top-selling:
 *   get:
 *     summary: Get top selling parts
 *     tags: [Market]
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Top selling parts retrieved successfully
 *       400:
 *         description: Bad request
 */
router.get('/top-selling', asyncHandler(async (req, res) => {
    const { shop_id } = req.query;
    
    if (!shop_id) {
        return res.status(400).json({
            success: false,
            error: 'MISSING_SHOP_ID',
            message: 'Shop ID is required'
        });
    }

    // Mock top selling data
    const topSelling = [
        {
            id: '1',
            name: 'Brake Pads',
            category: 'Brakes',
            sales_count: 1250,
            revenue: 32475.00,
            rank: 1
        },
        {
            id: '2',
            name: 'Oil Filter',
            category: 'Engine',
            sales_count: 980,
            revenue: 8810.20,
            rank: 2
        },
        {
            id: '3',
            name: 'Air Filter',
            category: 'Engine',
            sales_count: 750,
            revenue: 9742.50,
            rank: 3
        }
    ];

    res.json({
        success: true,
        data: topSelling
    });
}));

/**
 * @swagger
 * /api/market/popular-cars:
 *   get:
 *     summary: Get popular car models
 *     tags: [Market]
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Popular car models retrieved successfully
 *       400:
 *         description: Bad request
 */
router.get('/popular-cars', asyncHandler(async (req, res) => {
    const { shop_id } = req.query;
    
    if (!shop_id) {
        return res.status(400).json({
            success: false,
            error: 'MISSING_SHOP_ID',
            message: 'Shop ID is required'
        });
    }

    // Mock popular cars data
    const popularCars = [
        {
            make: 'Toyota',
            model: 'Camry',
            year_range: '2015-2023',
            parts_demand: 'high',
            common_parts: ['Brake Pads', 'Oil Filter', 'Air Filter']
        },
        {
            make: 'Honda',
            model: 'Civic',
            year_range: '2016-2023',
            parts_demand: 'high',
            common_parts: ['Spark Plugs', 'Timing Belt', 'Water Pump']
        },
        {
            make: 'Ford',
            model: 'F-150',
            year_range: '2015-2023',
            parts_demand: 'medium',
            common_parts: ['Transmission Filter', 'Fuel Filter', 'Battery']
        }
    ];

    res.json({
        success: true,
        data: popularCars
    });
}));

module.exports = router;
