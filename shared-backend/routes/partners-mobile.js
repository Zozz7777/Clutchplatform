const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');

// ==================== PARTNER ORDERS ====================

// Get partner orders
router.get('/orders', authenticateToken, requireRole(['partner', 'admin']), async (req, res) => {
    try {
        const partnerId = req.user.id;
        const { status, startDate, endDate, limit = 50, page = 1 } = req.query;
        
        const filters = { partnerId };
        if (status) filters.status = status;
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const ordersCollection = await getCollection('orders');
        const [orders, totalOrders] = await Promise.all([
            ordersCollection.find(filters)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .toArray(),
            ordersCollection.countDocuments(filters)
        ]);

        // Get order details with customer and vehicle info
        const enrichedOrders = await Promise.all(
            orders.map(async (order) => {
                const customersCollection = await getCollection('customers');
                const vehiclesCollection = await getCollection('vehicles');
                
                const [customer, vehicle] = await Promise.all([
                    customersCollection.findOne({ _id: order.customerId }),
                    vehiclesCollection.findOne({ _id: order.vehicleId })
                ]);

                return {
                    ...order,
                    customer: customer ? {
                        id: customer._id,
                        name: customer.name,
                        phone: customer.phone,
                        email: customer.email
                    } : null,
                    vehicle: vehicle ? {
                        id: vehicle._id,
                        brand: vehicle.brand,
                        model: vehicle.model,
                        year: vehicle.year,
                        licensePlate: vehicle.licensePlate
                    } : null
                };
            })
        );

        res.json({
            success: true,
            data: enrichedOrders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalOrders,
                pages: Math.ceil(totalOrders / parseInt(limit))
            }
        });
    } catch (error) {
        logger.error('Get partner orders error:', error);
        res.status(500).json({
            success: false,
            error: 'ORDERS_RETRIEVAL_ERROR',
            message: 'Failed to retrieve orders'
        });
    }
});

// Get order details
router.get('/orders/:orderId', authenticateToken, requireRole(['partner', 'admin']), async (req, res) => {
    try {
        const { orderId } = req.params;
        const partnerId = req.user.id;

        const ordersCollection = await getCollection('orders');
        const order = await ordersCollection.findOne({ 
            _id: orderId, 
            partnerId 
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'ORDER_NOT_FOUND',
                message: 'Order not found'
            });
        }

        // Get related data
        const [customersCollection, vehiclesCollection, paymentsCollection] = await Promise.all([
            getCollection('customers'),
            getCollection('vehicles'),
            getCollection('payments')
        ]);

        const [customer, vehicle, payment] = await Promise.all([
            customersCollection.findOne({ _id: order.customerId }),
            vehiclesCollection.findOne({ _id: order.vehicleId }),
            paymentsCollection.findOne({ orderId })
        ]);

        const enrichedOrder = {
            ...order,
            customer,
            vehicle,
            payment
        };

        res.json({
            success: true,
            data: enrichedOrder
        });
    } catch (error) {
        logger.error('Get order details error:', error);
        res.status(500).json({
            success: false,
            error: 'ORDER_DETAILS_ERROR',
            message: 'Failed to retrieve order details'
        });
    }
});

// Update order status
router.put('/orders/:orderId/status', authenticateToken, requireRole(['partner', 'admin']), async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, notes, estimatedCompletion } = req.body;
        const partnerId = req.user.id;

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_STATUS',
                message: 'Order status is required'
            });
        }

        const ordersCollection = await getCollection('orders');
        const result = await ordersCollection.updateOne(
            { _id: orderId, partnerId },
            { 
                $set: { 
                    status,
                    notes: notes || '',
                    estimatedCompletion: estimatedCompletion || null,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'ORDER_NOT_FOUND',
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        logger.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            error: 'ORDER_STATUS_UPDATE_ERROR',
            message: 'Failed to update order status'
        });
    }
});

// ==================== PARTNER INVENTORY ====================

// Get partner inventory
router.get('/inventory', authenticateToken, requireRole(['partner', 'admin']), async (req, res) => {
    try {
        const partnerId = req.user.id;
        const { category, inStock, limit = 100, page = 1 } = req.query;
        
        const filters = { partnerId };
        if (category) filters.category = category;
        if (inStock !== undefined) {
            filters.quantity = inStock === 'true' ? { $gt: 0 } : { $lte: 0 };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const inventoryCollection = await getCollection('inventory');
        const [inventory, totalItems] = await Promise.all([
            inventoryCollection.find(filters)
                .sort({ name: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .toArray(),
            inventoryCollection.countDocuments(filters)
        ]);

        res.json({
            success: true,
            data: inventory,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalItems,
                pages: Math.ceil(totalItems / parseInt(limit))
            }
        });
    } catch (error) {
        logger.error('Get partner inventory error:', error);
        res.status(500).json({
            success: false,
            error: 'INVENTORY_RETRIEVAL_ERROR',
            message: 'Failed to retrieve inventory'
        });
    }
});

// Update inventory item
router.put('/inventory/:itemId', authenticateToken, requireRole(['partner', 'admin']), async (req, res) => {
    try {
        const { itemId } = req.params;
        const partnerId = req.user.id;
        const updates = req.body;
        updates.updatedAt = new Date();

        const inventoryCollection = await getCollection('inventory');
        const result = await inventoryCollection.updateOne(
            { _id: itemId, partnerId },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'INVENTORY_ITEM_NOT_FOUND',
                message: 'Inventory item not found'
            });
        }

        res.json({
            success: true,
            message: 'Inventory item updated successfully'
        });
    } catch (error) {
        logger.error('Update inventory item error:', error);
        res.status(500).json({
            success: false,
            error: 'INVENTORY_UPDATE_ERROR',
            message: 'Failed to update inventory item'
        });
    }
});

// Add inventory item
router.post('/inventory', authenticateToken, requireRole(['partner', 'admin']), async (req, res) => {
    try {
        const partnerId = req.user.id;
        const {
            name,
            category,
            description,
            price,
            cost,
            quantity,
            minQuantity,
            supplier,
            partNumber
        } = req.body;

        if (!name || !category || !price || !quantity) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Name, category, price, and quantity are required'
            });
        }

        const inventoryCollection = await getCollection('inventory');
        
        const inventoryItem = {
            partnerId,
            name,
            category,
            description: description || '',
            price: parseFloat(price),
            cost: parseFloat(cost) || 0,
            quantity: parseInt(quantity),
            minQuantity: parseInt(minQuantity) || 0,
            supplier: supplier || '',
            partNumber: partNumber || '',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await inventoryCollection.insertOne(inventoryItem);
        inventoryItem._id = result.insertedId;

        res.status(201).json({
            success: true,
            data: inventoryItem,
            message: 'Inventory item added successfully'
        });
    } catch (error) {
        logger.error('Add inventory item error:', error);
        res.status(500).json({
            success: false,
            error: 'INVENTORY_ADD_ERROR',
            message: 'Failed to add inventory item'
        });
    }
});

// ==================== PARTNER BUSINESS OPERATIONS ====================

// Get partner dashboard
router.get('/dashboard', authenticateToken, requireRole(['partner', 'admin']), async (req, res) => {
    try {
        const partnerId = req.user.id;
        const { startDate, endDate } = req.query;
        
        const filters = { partnerId };
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const [ordersCollection, inventoryCollection, paymentsCollection] = await Promise.all([
            getCollection('orders'),
            getCollection('inventory'),
            getCollection('payments')
        ]);

        // Get business metrics
        const [totalOrders, completedOrders, pendingOrders, totalRevenue, lowStockItems] = await Promise.all([
            ordersCollection.countDocuments(filters),
            ordersCollection.countDocuments({ ...filters, status: 'completed' }),
            ordersCollection.countDocuments({ ...filters, status: 'pending' }),
            paymentsCollection.aggregate([
                { $match: { ...filters, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]).toArray(),
            inventoryCollection.countDocuments({ 
                partnerId, 
                quantity: { $lte: '$minQuantity' } 
            })
        ]);

        const dashboard = {
            orders: {
                total: totalOrders,
                completed: completedOrders,
                pending: pendingOrders
            },
            revenue: {
                total: totalRevenue[0]?.total || 0
            },
            inventory: {
                lowStock: lowStockItems
            },
            recentActivity: await getRecentActivity(ordersCollection, partnerId)
        };

        res.json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        logger.error('Get partner dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'DASHBOARD_ERROR',
            message: 'Failed to retrieve dashboard data'
        });
    }
});

// Get partner earnings
router.get('/earnings', authenticateToken, requireRole(['partner', 'admin']), async (req, res) => {
    try {
        const partnerId = req.user.id;
        const { startDate, endDate, groupBy = 'month' } = req.query;
        
        const filters = { partnerId, status: 'completed' };
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const paymentsCollection = await getCollection('payments');
        
        let groupStage;
        if (groupBy === 'day') {
            groupStage = {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                }
            };
        } else if (groupBy === 'week') {
            groupStage = {
                _id: {
                    year: { $year: '$createdAt' },
                    week: { $week: '$createdAt' }
                }
            };
        } else {
            groupStage = {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                }
            };
        }

        const earnings = await paymentsCollection.aggregate([
            { $match: filters },
            {
                $group: {
                    ...groupStage,
                    totalEarnings: { $sum: '$amount' },
                    totalOrders: { $sum: 1 },
                    averageOrderValue: { $avg: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
        ]).toArray();

        res.json({
            success: true,
            data: earnings
        });
    } catch (error) {
        logger.error('Get partner earnings error:', error);
        res.status(500).json({
            success: false,
            error: 'EARNINGS_ERROR',
            message: 'Failed to retrieve earnings data'
        });
    }
});

// ==================== HELPER FUNCTIONS ====================

// Get recent activity
async function getRecentActivity(ordersCollection, partnerId) {
    try {
        return await ordersCollection.find({ partnerId })
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();
    } catch (error) {
        return [];
    }
}

module.exports = router;
