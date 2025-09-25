const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerInventory = require('../models/PartnerInventory');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Validation middleware
const validateProduct = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('costPrice').isNumeric().withMessage('Cost price must be a number'),
  body('salePrice').isNumeric().withMessage('Sale price must be a number'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
];

const validateBulkImport = [
  body('products').isArray({ min: 1 }).withMessage('Products array is required'),
  body('products.*.name').notEmpty().withMessage('Product name is required'),
  body('products.*.category').notEmpty().withMessage('Category is required'),
  body('products.*.costPrice').isNumeric().withMessage('Cost price must be a number'),
  body('products.*.salePrice').isNumeric().withMessage('Sale price must be a number')
];

// @route   GET /api/v1/partners/:id/catalog
// @desc    Get partner's published catalog
// @access  Private
router.get('/:id/catalog', authenticateToken, async (req, res) => {
  try {
    const { id: partnerId } = req.params;
    const { page = 1, limit = 20, category, search, status = 'active' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify partner access
    if (req.user.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const filters = { partnerId, status };
    if (category) filters.category = category;
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    const [products, total] = await Promise.all([
      PartnerInventory.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PartnerInventory.countDocuments(filters)
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Get catalog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/v1/partners/:id/catalog
// @desc    Create/update product in catalog
// @access  Private
router.post('/:id/catalog', authenticateToken, validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id: partnerId } = req.params;
    const productData = req.body;

    // Verify partner access
    if (req.user.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if product with same SKU exists
    if (productData.sku) {
      const existingProduct = await PartnerInventory.findBySku(productData.sku);
      if (existingProduct && existingProduct.partnerId !== partnerId) {
        return res.status(409).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }

    const product = new PartnerInventory({
      ...productData,
      partnerId,
      createdBy: req.user.id
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });

  } catch (error) {
    logger.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/v1/partners/:id/catalog/:sku
// @desc    Update product by SKU
// @access  Private
router.put('/:id/catalog/:sku', authenticateToken, async (req, res) => {
  try {
    const { id: partnerId, sku } = req.params;
    const updateData = req.body;

    // Verify partner access
    if (req.user.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const product = await PartnerInventory.findOne({ sku, partnerId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product
    Object.assign(product, updateData);
    product.updatedBy = req.user.id;
    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });

  } catch (error) {
    logger.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/v1/partners/:id/catalog/:sku
// @desc    Delete product from catalog
// @access  Private
router.delete('/:id/catalog/:sku', authenticateToken, async (req, res) => {
  try {
    const { id: partnerId, sku } = req.params;

    // Verify partner access
    if (req.user.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const product = await PartnerInventory.findOne({ sku, partnerId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await PartnerInventory.deleteOne({ _id: product._id });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    logger.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/v1/partners/:id/inventory/import
// @desc    Bulk import products
// @access  Private
router.post('/:id/inventory/import', authenticateToken, validateBulkImport, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id: partnerId } = req.params;
    const { products, options = {} } = req.body;

    // Verify partner access
    if (req.user.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const results = {
      imported: 0,
      updated: 0,
      failed: 0,
      errors: []
    };

    for (const productData of products) {
      try {
        // Check if product exists
        const existingProduct = await PartnerInventory.findOne({
          sku: productData.sku,
          partnerId
        });

        if (existingProduct) {
          // Update existing product
          Object.assign(existingProduct, productData);
          existingProduct.updatedBy = req.user.id;
          await existingProduct.save();
          results.updated++;
        } else {
          // Create new product
          const product = new PartnerInventory({
            ...productData,
            partnerId,
            createdBy: req.user.id
          });
          await product.save();
          results.imported++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          product: productData.name || productData.sku,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Bulk import completed',
      data: results
    });

  } catch (error) {
    logger.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/v1/partners/:id/stock-adjust
// @desc    Adjust stock quantity with audit reason
// @access  Private
router.post('/:id/stock-adjust', authenticateToken, async (req, res) => {
  try {
    const { id: partnerId } = req.params;
    const { sku, quantity, reason, type = 'adjustment' } = req.body;

    if (!sku || quantity === undefined || !reason) {
      return res.status(400).json({
        success: false,
        message: 'SKU, quantity, and reason are required'
      });
    }

    // Verify partner access
    if (req.user.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const product = await PartnerInventory.findOne({ sku, partnerId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update quantity
    await product.updateQuantity(quantity, reason);

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: { product }
    });

  } catch (error) {
    logger.error('Stock adjustment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/v1/partners/:id/inventory/stats
// @desc    Get inventory statistics
// @access  Private
router.get('/:id/inventory/stats', authenticateToken, async (req, res) => {
  try {
    const { id: partnerId } = req.params;

    // Verify partner access
    if (req.user.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [stats, lowStock, outOfStock] = await Promise.all([
      PartnerInventory.getInventoryStats(partnerId),
      PartnerInventory.findLowStock(partnerId),
      PartnerInventory.findOutOfStock(partnerId)
    ]);

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalProducts: 0,
          totalValue: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          publishedCount: 0,
          averagePrice: 0,
          totalQuantity: 0
        },
        lowStock,
        outOfStock
      }
    });

  } catch (error) {
    logger.error('Get inventory stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/v1/partners/:id/inventory/search
// @desc    Search products
// @access  Private
router.get('/:id/inventory/search', authenticateToken, async (req, res) => {
  try {
    const { id: partnerId } = req.params;
    const { q: searchTerm, category, limit = 20 } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    // Verify partner access
    if (req.user.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const products = await PartnerInventory.searchProducts(partnerId, searchTerm)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { products }
    });

  } catch (error) {
    logger.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/v1/partners/:id/inventory/barcode/:barcode
// @desc    Get product by barcode
// @access  Private
router.get('/:id/inventory/barcode/:barcode', authenticateToken, async (req, res) => {
  try {
    const { id: partnerId, barcode } = req.params;

    // Verify partner access
    if (req.user.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const product = await PartnerInventory.findByBarcode(barcode);
    if (!product || product.partnerId !== partnerId) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    logger.error('Get product by barcode error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
