const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all discounts
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, type, status, isActive } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (type) filters.type = type;
        if (status) filters.status = status;
        if (isActive !== undefined) filters.isActive = isActive === 'true';

        const collection = await getCollection('discounts');
        const discounts = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: discounts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get discounts error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DISCOUNTS_FAILED',
            message: 'Failed to retrieve discounts'
        });
    }
});

// Get discount by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('discounts');
        const discount = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!discount) {
            return res.status(404).json({
                success: false,
                error: 'DISCOUNT_NOT_FOUND',
                message: 'Discount not found'
            });
        }

        res.json({
            success: true,
            data: discount
        });
    } catch (error) {
        console.error('Get discount error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DISCOUNT_FAILED',
            message: 'Failed to retrieve discount'
        });
    }
});

// Create discount
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            code, 
            name, 
            description, 
            type,
            value,
            minAmount,
            maxDiscount,
            usageLimit,
            usageCount,
            validFrom,
            validUntil,
            applicableTo,
            conditions 
        } = req.body;
        
        if (!code || !name || !type || !value) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Code, name, type, and value are required'
            });
        }

        const discountData = {
            code: code.toUpperCase(),
            name,
            description: description || '',
            type,
            value: parseFloat(value),
            minAmount: minAmount || 0,
            maxDiscount: maxDiscount || 0,
            usageLimit: usageLimit || 0,
            usageCount: usageCount || 0,
            validFrom: validFrom ? new Date(validFrom) : new Date(),
            validUntil: validUntil ? new Date(validUntil) : null,
            applicableTo: applicableTo || [],
            conditions: conditions || {},
            isActive: true,
            createdBy: req.user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('discounts');
        
        // Check if discount code already exists
        const existingDiscount = await collection.findOne({ code: discountData.code });
        if (existingDiscount) {
            return res.status(400).json({
                success: false,
                error: 'DISCOUNT_CODE_EXISTS',
                message: 'Discount code already exists'
            });
        }

        const result = await collection.insertOne(discountData);
        
        discountData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Discount created successfully',
            data: discountData
        });
    } catch (error) {
        console.error('Create discount error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_DISCOUNT_FAILED',
            message: 'Failed to create discount'
        });
    }
});

// Update discount
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('discounts');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'DISCOUNT_NOT_FOUND',
                message: 'Discount not found'
            });
        }

        res.json({
            success: true,
            message: 'Discount updated successfully'
        });
    } catch (error) {
        console.error('Update discount error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_DISCOUNT_FAILED',
            message: 'Failed to update discount'
        });
    }
});

// Toggle discount status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'INVALID_STATUS',
                message: 'isActive must be a boolean value'
            });
        }

        const collection = await getCollection('discounts');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    isActive,
                    updatedAt: new Date()
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'DISCOUNT_NOT_FOUND',
                message: 'Discount not found'
            });
        }

        res.json({
            success: true,
            message: `Discount ${isActive ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        console.error('Toggle discount status error:', error);
        res.status(500).json({
            success: false,
            error: 'TOGGLE_DISCOUNT_STATUS_FAILED',
            message: 'Failed to toggle discount status'
        });
    }
});

// Validate discount code
router.post('/validate', authenticateToken, async (req, res) => {
    try {
        const { code, amount, userId } = req.body;
        
        if (!code || !amount) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Code and amount are required'
            });
        }

        const collection = await getCollection('discounts');
        const discount = await collection.findOne({ 
            code: code.toUpperCase(),
            isActive: true
        });
        
        if (!discount) {
            return res.status(404).json({
                success: false,
                error: 'DISCOUNT_NOT_FOUND',
                message: 'Invalid discount code'
            });
        }

        // Check if discount is still valid
        const now = new Date();
        if (discount.validFrom && now < discount.validFrom) {
            return res.status(400).json({
                success: false,
                error: 'DISCOUNT_NOT_YET_VALID',
                message: 'Discount is not yet valid'
            });
        }

        if (discount.validUntil && now > discount.validUntil) {
            return res.status(400).json({
                success: false,
                error: 'DISCOUNT_EXPIRED',
                message: 'Discount has expired'
            });
        }

        // Check usage limit
        if (discount.usageLimit > 0 && discount.usageCount >= discount.usageLimit) {
            return res.status(400).json({
                success: false,
                error: 'DISCOUNT_USAGE_LIMIT_EXCEEDED',
                message: 'Discount usage limit exceeded'
            });
        }

        // Check minimum amount
        if (discount.minAmount > 0 && amount < discount.minAmount) {
            return res.status(400).json({
                success: false,
                error: 'MINIMUM_AMOUNT_NOT_MET',
                message: `Minimum amount of ${discount.minAmount} required`
            });
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (discount.type === 'percentage') {
            discountAmount = (amount * discount.value) / 100;
            if (discount.maxDiscount > 0) {
                discountAmount = Math.min(discountAmount, discount.maxDiscount);
            }
        } else if (discount.type === 'fixed') {
            discountAmount = discount.value;
        }

        res.json({
            success: true,
            data: {
                discount,
                discountAmount,
                finalAmount: amount - discountAmount
            }
        });
    } catch (error) {
        console.error('Validate discount error:', error);
        res.status(500).json({
            success: false,
            error: 'VALIDATE_DISCOUNT_FAILED',
            message: 'Failed to validate discount'
        });
    }
});

// Apply discount
router.post('/apply', authenticateToken, async (req, res) => {
    try {
        const { code, amount, userId } = req.body;
        
        if (!code || !amount) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Code and amount are required'
            });
        }

        const collection = await getCollection('discounts');
        const discount = await collection.findOne({ 
            code: code.toUpperCase(),
            isActive: true
        });
        
        if (!discount) {
            return res.status(404).json({
                success: false,
                error: 'DISCOUNT_NOT_FOUND',
                message: 'Invalid discount code'
            });
        }

        // Validate discount (same logic as validate endpoint)
        const now = new Date();
        if (discount.validFrom && now < discount.validFrom) {
            return res.status(400).json({
                success: false,
                error: 'DISCOUNT_NOT_YET_VALID',
                message: 'Discount is not yet valid'
            });
        }

        if (discount.validUntil && now > discount.validUntil) {
            return res.status(400).json({
                success: false,
                error: 'DISCOUNT_EXPIRED',
                message: 'Discount has expired'
            });
        }

        if (discount.usageLimit > 0 && discount.usageCount >= discount.usageLimit) {
            return res.status(400).json({
                success: false,
                error: 'DISCOUNT_USAGE_LIMIT_EXCEEDED',
                message: 'Discount usage limit exceeded'
            });
        }

        if (discount.minAmount > 0 && amount < discount.minAmount) {
            return res.status(400).json({
                success: false,
                error: 'MINIMUM_AMOUNT_NOT_MET',
                message: `Minimum amount of ${discount.minAmount} required`
            });
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (discount.type === 'percentage') {
            discountAmount = (amount * discount.value) / 100;
            if (discount.maxDiscount > 0) {
                discountAmount = Math.min(discountAmount, discount.maxDiscount);
            }
        } else if (discount.type === 'fixed') {
            discountAmount = discount.value;
        }

        // Increment usage count
        await collection.updateOne(
            { _id: discount._id },
            { 
                $inc: { usageCount: 1 },
                $set: { updatedAt: new Date() }
            }
        );

        res.json({
            success: true,
            message: 'Discount applied successfully',
            data: {
                discount,
                discountAmount,
                finalAmount: amount - discountAmount
            }
        });
    } catch (error) {
        console.error('Apply discount error:', error);
        res.status(500).json({
            success: false,
            error: 'APPLY_DISCOUNT_FAILED',
            message: 'Failed to apply discount'
        });
    }
});

// Get active discounts
router.get('/active/list', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('discounts');
        const activeDiscounts = await collection.find({ 
            isActive: true,
            $or: [
                { validUntil: null },
                { validUntil: { $gt: new Date() } }
            ]
        })
        .sort({ createdAt: -1 })
        .toArray();

        res.json({
            success: true,
            data: activeDiscounts
        });
    } catch (error) {
        console.error('Get active discounts error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ACTIVE_DISCOUNTS_FAILED',
            message: 'Failed to retrieve active discounts'
        });
    }
});

// Get discounts by type
router.get('/type/:type', authenticateToken, async (req, res) => {
    try {
        const { type } = req.params;
        const { status } = req.query;
        
        const filters = { type };
        if (status) filters.status = status;

        const collection = await getCollection('discounts');
        const discounts = await collection.find(filters)
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            data: discounts
        });
    } catch (error) {
        console.error('Get discounts by type error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DISCOUNTS_BY_TYPE_FAILED',
            message: 'Failed to retrieve discounts by type'
        });
    }
});

// Get discount statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('discounts');
        
        // Get total discounts
        const totalDiscounts = await collection.countDocuments({});
        
        // Get active discounts
        const activeDiscounts = await collection.countDocuments({ isActive: true });
        
        // Get discounts by type
        const discountsByType = await collection.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get discounts by status
        const discountsByStatus = await collection.aggregate([
            { $group: { _id: '$isActive', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get expired discounts
        const expiredDiscounts = await collection.countDocuments({ 
            validUntil: { $lt: new Date() }
        });

        res.json({
            success: true,
            data: {
                totalDiscounts,
                activeDiscounts,
                inactiveDiscounts: totalDiscounts - activeDiscounts,
                discountsByType,
                discountsByStatus,
                expiredDiscounts
            }
        });
    } catch (error) {
        console.error('Get discount stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DISCOUNT_STATS_FAILED',
            message: 'Failed to retrieve discount statistics'
        });
    }
});

module.exports = router;
