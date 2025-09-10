const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders list
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       400:
 *         description: Bad request
 */
router.get('/', asyncHandler(async (req, res) => {
    const { shop_id } = req.query;
    
    if (!shop_id) {
        return res.status(400).json({
            success: false,
            error: 'MISSING_SHOP_ID',
            message: 'Shop ID is required'
        });
    }

    // Mock orders data
    const orders = [
        {
            id: '1',
            order_number: 'ORD-001',
            customer_name: 'John Doe',
            customer_phone: '+1-555-0123',
            items: [
                { name: 'Brake Pads', quantity: 2, price: 25.99, total: 51.98 },
                { name: 'Oil Filter', quantity: 1, price: 8.99, total: 8.99 }
            ],
            total_amount: 60.97,
            status: 'pending',
            order_date: '2024-01-15T10:30:00Z',
            estimated_delivery: '2024-01-17T10:30:00Z',
            notes: 'Customer prefers morning delivery'
        },
        {
            id: '2',
            order_number: 'ORD-002',
            customer_name: 'Jane Smith',
            customer_phone: '+1-555-0456',
            items: [
                { name: 'Air Filter', quantity: 1, price: 12.99, total: 12.99 }
            ],
            total_amount: 12.99,
            status: 'processing',
            order_date: '2024-01-15T14:20:00Z',
            estimated_delivery: '2024-01-16T14:20:00Z',
            notes: 'Rush order'
        },
        {
            id: '3',
            order_number: 'ORD-003',
            customer_name: 'Bob Johnson',
            customer_phone: '+1-555-0789',
            items: [
                { name: 'Spark Plugs', quantity: 4, price: 15.99, total: 63.96 }
            ],
            total_amount: 63.96,
            status: 'shipped',
            order_date: '2024-01-15T16:45:00Z',
            estimated_delivery: '2024-01-18T16:45:00Z',
            tracking_number: 'TRK123456789',
            notes: 'Delivered to customer'
        }
    ];

    res.json({
        success: true,
        data: orders,
        total: orders.length
    });
}));

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Mock order data
    const order = {
        id: id,
        order_number: 'ORD-001',
        customer_name: 'John Doe',
        customer_phone: '+1-555-0123',
        customer_email: 'john.doe@email.com',
        items: [
            { name: 'Brake Pads', quantity: 2, price: 25.99, total: 51.98 },
            { name: 'Oil Filter', quantity: 1, price: 8.99, total: 8.99 }
        ],
        total_amount: 60.97,
        status: 'pending',
        order_date: '2024-01-15T10:30:00Z',
        estimated_delivery: '2024-01-17T10:30:00Z',
        notes: 'Customer prefers morning delivery',
        shipping_address: {
            street: '123 Main St',
            city: 'Detroit',
            state: 'MI',
            zip: '48201',
            country: 'USA'
        },
        payment_status: 'paid',
        payment_method: 'Credit Card'
    };

    res.json({
        success: true,
        data: order
    });
}));

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_name
 *               - items
 *             properties:
 *               customer_name:
 *                 type: string
 *               customer_phone:
 *                 type: string
 *               customer_email:
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
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', asyncHandler(async (req, res) => {
    const { customer_name, customer_phone, customer_email, items, notes } = req.body;
    
    if (!customer_name || !items) {
        return res.status(400).json({
            success: false,
            error: 'MISSING_REQUIRED_FIELDS',
            message: 'Customer name and items are required'
        });
    }

    // Calculate total amount
    const total_amount = items.reduce((sum, item) => {
        return sum + (item.quantity * item.price);
    }, 0);

    // Generate order number
    const order_number = `ORD-${Date.now().toString().slice(-6)}`;

    // Mock creation response
    const newOrder = {
        id: Date.now().toString(),
        order_number,
        customer_name,
        customer_phone: customer_phone || '',
        customer_email: customer_email || '',
        items: items.map(item => ({
            ...item,
            total: item.quantity * item.price
        })),
        total_amount,
        status: 'pending',
        order_date: new Date().toISOString(),
        estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        notes: notes || '',
        payment_status: 'pending',
        payment_method: 'TBD'
    };

    res.status(201).json({
        success: true,
        data: newOrder,
        message: 'Order created successfully'
    });
}));

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *               tracking_number:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Order not found
 */
router.put('/:id/status', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, tracking_number, notes } = req.body;
    
    if (!status) {
        return res.status(400).json({
            success: false,
            error: 'MISSING_STATUS',
            message: 'Status is required'
        });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            error: 'INVALID_STATUS',
            message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
    }

    // Mock update response
    const updatedOrder = {
        id: id,
        status: status,
        tracking_number: tracking_number || null,
        notes: notes || '',
        updated_at: new Date().toISOString()
    };

    res.json({
        success: true,
        data: updatedOrder,
        message: 'Order status updated successfully'
    });
}));

module.exports = router;
