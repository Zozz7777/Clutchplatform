const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/sales/transactions:
 *   get:
 *     summary: Get sales transactions
 *     tags: [Sales]
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Sales transactions retrieved successfully
 *       400:
 *         description: Bad request
 */
router.get('/transactions', asyncHandler(async (req, res) => {
    const { shop_id } = req.query;
    
    if (!shop_id) {
        return res.status(400).json({
            success: false,
            error: 'MISSING_SHOP_ID',
            message: 'Shop ID is required'
        });
    }

    // Mock sales transactions data
    const transactions = [
        {
            id: '1',
            customer_name: 'John Doe',
            items: [
                { name: 'Brake Pads', quantity: 2, price: 25.99, total: 51.98 },
                { name: 'Oil Filter', quantity: 1, price: 8.99, total: 8.99 }
            ],
            total_amount: 60.97,
            payment_method: 'Credit Card',
            date: '2024-01-15T10:30:00Z',
            status: 'completed'
        },
        {
            id: '2',
            customer_name: 'Jane Smith',
            items: [
                { name: 'Air Filter', quantity: 1, price: 12.99, total: 12.99 }
            ],
            total_amount: 12.99,
            payment_method: 'Cash',
            date: '2024-01-15T14:20:00Z',
            status: 'completed'
        },
        {
            id: '3',
            customer_name: 'Bob Johnson',
            items: [
                { name: 'Spark Plugs', quantity: 4, price: 15.99, total: 63.96 }
            ],
            total_amount: 63.96,
            payment_method: 'Debit Card',
            date: '2024-01-15T16:45:00Z',
            status: 'completed'
        }
    ];

    res.json({
        success: true,
        data: transactions,
        total: transactions.length
    });
}));

/**
 * @swagger
 * /api/sales/analytics:
 *   get:
 *     summary: Get sales analytics
 *     tags: [Sales]
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Sales analytics retrieved successfully
 *       400:
 *         description: Bad request
 */
router.get('/analytics', asyncHandler(async (req, res) => {
    const { shop_id } = req.query;
    
    if (!shop_id) {
        return res.status(400).json({
            success: false,
            error: 'MISSING_SHOP_ID',
            message: 'Shop ID is required'
        });
    }

    // Mock sales analytics data
    const analytics = {
        total_revenue: 15750.50,
        total_transactions: 125,
        average_transaction_value: 126.00,
        daily_sales: [
            { date: '2024-01-15', revenue: 1250.75, transactions: 12 },
            { date: '2024-01-14', revenue: 980.25, transactions: 8 },
            { date: '2024-01-13', revenue: 1450.00, transactions: 15 },
            { date: '2024-01-12', revenue: 1100.50, transactions: 10 },
            { date: '2024-01-11', revenue: 1350.25, transactions: 14 }
        ],
        top_selling_categories: [
            { category: 'Engine Parts', revenue: 6500.25, percentage: 41.3 },
            { category: 'Brake Systems', revenue: 4200.75, percentage: 26.7 },
            { category: 'Filters', revenue: 2800.50, percentage: 17.8 },
            { category: 'Electrical', revenue: 2249.00, percentage: 14.2 }
        ],
        payment_methods: [
            { method: 'Credit Card', count: 65, percentage: 52.0 },
            { method: 'Cash', count: 35, percentage: 28.0 },
            { method: 'Debit Card', count: 25, percentage: 20.0 }
        ]
    };

    res.json({
        success: true,
        data: analytics
    });
}));

/**
 * @swagger
 * /api/sales/transactions:
 *   post:
 *     summary: Create new sales transaction
 *     tags: [Sales]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_name
 *               - items
 *               - payment_method
 *             properties:
 *               customer_name:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *               payment_method:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Bad request
 */
router.post('/transactions', asyncHandler(async (req, res) => {
    const { customer_name, items, payment_method } = req.body;
    
    if (!customer_name || !items || !payment_method) {
        return res.status(400).json({
            success: false,
            error: 'MISSING_REQUIRED_FIELDS',
            message: 'Customer name, items, and payment method are required'
        });
    }

    // Calculate total amount
    const total_amount = items.reduce((sum, item) => {
        return sum + (item.quantity * item.price);
    }, 0);

    // Mock creation response
    const newTransaction = {
        id: Date.now().toString(),
        customer_name,
        items: items.map(item => ({
            ...item,
            total: item.quantity * item.price
        })),
        total_amount,
        payment_method,
        date: new Date().toISOString(),
        status: 'completed'
    };

    res.status(201).json({
        success: true,
        data: newTransaction,
        message: 'Transaction created successfully'
    });
}));

module.exports = router;
