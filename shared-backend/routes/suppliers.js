const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Get suppliers list
 *     tags: [Suppliers]
 *     parameters:
 *       - in: query
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop ID
 *     responses:
 *       200:
 *         description: Suppliers retrieved successfully
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

    // Mock suppliers data
    const suppliers = [
        {
            id: '1',
            name: 'AutoParts Inc',
            contact_person: 'John Smith',
            email: 'john@autoparts.com',
            phone: '+1-555-0123',
            address: '123 Auto Parts St, Detroit, MI',
            rating: 4.8,
            delivery_time: '2-3 days',
            payment_terms: 'Net 30',
            status: 'active',
            categories: ['Engine Parts', 'Brake Systems']
        },
        {
            id: '2',
            name: 'EngineParts Ltd',
            contact_person: 'Sarah Johnson',
            email: 'sarah@engineparts.com',
            phone: '+1-555-0456',
            address: '456 Engine Ave, Chicago, IL',
            rating: 4.6,
            delivery_time: '1-2 days',
            payment_terms: 'Net 15',
            status: 'active',
            categories: ['Engine Parts', 'Filters']
        },
        {
            id: '3',
            name: 'BrakeMaster Corp',
            contact_person: 'Mike Wilson',
            email: 'mike@brakemaster.com',
            phone: '+1-555-0789',
            address: '789 Brake Blvd, Los Angeles, CA',
            rating: 4.9,
            delivery_time: '3-5 days',
            payment_terms: 'Net 45',
            status: 'active',
            categories: ['Brake Systems', 'Suspension']
        }
    ];

    res.json({
        success: true,
        data: suppliers,
        total: suppliers.length
    });
}));

/**
 * @swagger
 * /api/suppliers/{id}:
 *   get:
 *     summary: Get supplier by ID
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier retrieved successfully
 *       404:
 *         description: Supplier not found
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Mock supplier data
    const supplier = {
        id: id,
        name: 'AutoParts Inc',
        contact_person: 'John Smith',
        email: 'john@autoparts.com',
        phone: '+1-555-0123',
        address: '123 Auto Parts St, Detroit, MI',
        rating: 4.8,
        delivery_time: '2-3 days',
        payment_terms: 'Net 30',
        status: 'active',
        categories: ['Engine Parts', 'Brake Systems'],
        products: [
            { name: 'Brake Pads', price: 25.99, stock: 500 },
            { name: 'Oil Filter', price: 8.99, stock: 1000 },
            { name: 'Air Filter', price: 12.99, stock: 750 }
        ]
    };

    res.json({
        success: true,
        data: supplier
    });
}));

/**
 * @swagger
 * /api/suppliers:
 *   post:
 *     summary: Create new supplier
 *     tags: [Suppliers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - contact_person
 *               - email
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               contact_person:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Supplier created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', asyncHandler(async (req, res) => {
    const { name, contact_person, email, phone, address, categories } = req.body;
    
    if (!name || !contact_person || !email || !phone) {
        return res.status(400).json({
            success: false,
            error: 'MISSING_REQUIRED_FIELDS',
            message: 'Name, contact person, email, and phone are required'
        });
    }

    // Mock creation response
    const newSupplier = {
        id: Date.now().toString(),
        name,
        contact_person,
        email,
        phone,
        address: address || '',
        rating: 0,
        delivery_time: 'TBD',
        payment_terms: 'Net 30',
        status: 'active',
        categories: categories || []
    };

    res.status(201).json({
        success: true,
        data: newSupplier,
        message: 'Supplier created successfully'
    });
}));

module.exports = router;
