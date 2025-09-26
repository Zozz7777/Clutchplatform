const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Purchase Order Status
const PO_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  ORDERED: 'ordered',
  PARTIALLY_RECEIVED: 'partially_received',
  RECEIVED: 'received',
  CANCELLED: 'cancelled'
};

// Supplier Status
const SUPPLIER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING_APPROVAL: 'pending_approval'
};

// Payment Terms
const PAYMENT_TERMS = {
  NET_15: 'net_15',
  NET_30: 'net_30',
  NET_45: 'net_45',
  NET_60: 'net_60',
  CASH_ON_DELIVERY: 'cash_on_delivery',
  PREPAID: 'prepaid'
};

// Create supplier
router.post('/suppliers', [
  auth,
  body('name').notEmpty().withMessage('Supplier name is required'),
  body('contactPerson').notEmpty().withMessage('Contact person is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('address').isObject().withMessage('Address is required'),
  body('paymentTerms').optional().isIn(Object.values(PAYMENT_TERMS)).withMessage('Invalid payment terms'),
  body('creditLimit').optional().isNumeric().withMessage('Credit limit must be numeric'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, contactPerson, email, phone, address, paymentTerms, creditLimit, notes } = req.body;
    const userId = req.user._id;

    // Check user permissions
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || 'staff';
    if (!['owner', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to create suppliers'
      });
    }

    // Generate supplier ID
    const supplierId = `SUP_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    // Create supplier data
    const supplierData = {
      id: supplierId,
      name: name,
      contactPerson: contactPerson,
      email: email,
      phone: phone,
      address: address,
      paymentTerms: paymentTerms || PAYMENT_TERMS.NET_30,
      creditLimit: creditLimit || 0,
      notes: notes || null,
      status: SUPPLIER_STATUS.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId
    };

    // Save supplier to user's suppliers
    if (!user.suppliers) {
      user.suppliers = [];
    }

    user.suppliers.push(supplierData);
    await user.save();

    logger.info(`Supplier created: ${supplierId}`, {
      userId: userId,
      supplierName: name,
      contactPerson: contactPerson
    });

    res.json({
      success: true,
      message: 'Supplier created successfully',
      data: {
        supplierId: supplierId,
        name: name,
        status: SUPPLIER_STATUS.ACTIVE,
        createdAt: supplierData.createdAt
      }
    });

  } catch (error) {
    logger.error('Failed to create supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create supplier'
    });
  }
});

// Get suppliers
router.get('/suppliers', [
  auth,
  body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  body('status').optional().isIn(Object.values(SUPPLIER_STATUS)).withMessage('Invalid status'),
  body('search').optional().isString().withMessage('Search must be a string')
], async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const userId = req.user._id;

    const user = await PartnerUser.findById(userId);
    if (!user || !user.suppliers) {
      return res.json({
        success: true,
        data: {
          suppliers: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0
          }
        }
      });
    }

    // Filter suppliers
    let filteredSuppliers = user.suppliers;
    
    if (status) {
      filteredSuppliers = filteredSuppliers.filter(supplier => supplier.status === status);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSuppliers = filteredSuppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.contactPerson.toLowerCase().includes(searchLower) ||
        supplier.email.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date (newest first)
    filteredSuppliers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);

    // Format suppliers for response
    const formattedSuppliers = paginatedSuppliers.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      paymentTerms: supplier.paymentTerms,
      creditLimit: supplier.creditLimit,
      status: supplier.status,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt
    }));

    res.json({
      success: true,
      data: {
        suppliers: formattedSuppliers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredSuppliers.length,
          pages: Math.ceil(filteredSuppliers.length / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get suppliers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suppliers'
    });
  }
});

// Create purchase order
router.post('/purchase-orders', [
  auth,
  body('supplierId').notEmpty().withMessage('Supplier ID is required'),
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.productSku').notEmpty().withMessage('Product SKU is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('items.*.unitPrice').isNumeric().withMessage('Unit price must be numeric'),
  body('expectedDeliveryDate').optional().isISO8601().withMessage('Expected delivery date must be valid ISO date'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { supplierId, items, expectedDeliveryDate, notes, priority } = req.body;
    const userId = req.user._id;

    // Check user permissions
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || 'staff';
    if (!['owner', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to create purchase orders'
      });
    }

    // Verify supplier exists
    const supplier = user.suppliers?.find(s => s.id === supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Generate purchase order ID
    const poId = `PO_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.14; // 14% VAT
    const total = subtotal + tax;

    // Create purchase order data
    const poData = {
      id: poId,
      supplierId: supplierId,
      supplierName: supplier.name,
      items: items,
      subtotal: subtotal,
      tax: tax,
      total: total,
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
      notes: notes || null,
      priority: priority || 'normal',
      status: PO_STATUS.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      approvedAt: null,
      approvedBy: null,
      orderedAt: null,
      receivedAt: null,
      receivedBy: null
    };

    // Save purchase order to user's purchase orders
    if (!user.purchaseOrders) {
      user.purchaseOrders = [];
    }

    user.purchaseOrders.push(poData);
    await user.save();

    logger.info(`Purchase order created: ${poId}`, {
      userId: userId,
      supplierId: supplierId,
      itemCount: items.length,
      total: total
    });

    res.json({
      success: true,
      message: 'Purchase order created successfully',
      data: {
        poId: poId,
        supplierName: supplier.name,
        itemCount: items.length,
        total: total,
        status: PO_STATUS.DRAFT,
        createdAt: poData.createdAt
      }
    });

  } catch (error) {
    logger.error('Failed to create purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create purchase order'
    });
  }
});

// Get purchase orders
router.get('/purchase-orders', [
  auth,
  body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  body('status').optional().isIn(Object.values(PO_STATUS)).withMessage('Invalid status'),
  body('supplierId').optional().isString().withMessage('Supplier ID must be a string')
], async (req, res) => {
  try {
    const { page = 1, limit = 20, status, supplierId } = req.query;
    const userId = req.user._id;

    const user = await PartnerUser.findById(userId);
    if (!user || !user.purchaseOrders) {
      return res.json({
        success: true,
        data: {
          purchaseOrders: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0
          }
        }
      });
    }

    // Filter purchase orders
    let filteredPOs = user.purchaseOrders;
    
    if (status) {
      filteredPOs = filteredPOs.filter(po => po.status === status);
    }
    
    if (supplierId) {
      filteredPOs = filteredPOs.filter(po => po.supplierId === supplierId);
    }

    // Sort by creation date (newest first)
    filteredPOs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedPOs = filteredPOs.slice(startIndex, endIndex);

    // Format purchase orders for response
    const formattedPOs = paginatedPOs.map(po => ({
      id: po.id,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      itemCount: po.items.length,
      subtotal: po.subtotal,
      tax: po.tax,
      total: po.total,
      expectedDeliveryDate: po.expectedDeliveryDate,
      priority: po.priority,
      status: po.status,
      createdAt: po.createdAt,
      updatedAt: po.updatedAt,
      approvedAt: po.approvedAt,
      orderedAt: po.orderedAt,
      receivedAt: po.receivedAt
    }));

    res.json({
      success: true,
      data: {
        purchaseOrders: formattedPOs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredPOs.length,
          pages: Math.ceil(filteredPOs.length / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get purchase orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get purchase orders'
    });
  }
});

// Approve purchase order
router.patch('/purchase-orders/:poId/approve', [
  auth,
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
  try {
    const { poId } = req.params;
    const { notes } = req.body;
    const userId = req.user._id;

    // Check user permissions
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || 'staff';
    if (!['owner', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to approve purchase orders'
      });
    }

    // Find purchase order
    const po = user.purchaseOrders?.find(p => p.id === poId);
    if (!po) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    // Check if PO can be approved
    if (po.status !== PO_STATUS.DRAFT && po.status !== PO_STATUS.PENDING_APPROVAL) {
      return res.status(400).json({
        success: false,
        message: 'Purchase order cannot be approved in current status'
      });
    }

    // Update purchase order
    po.status = PO_STATUS.APPROVED;
    po.approvedAt = new Date();
    po.approvedBy = userId;
    po.approvalNotes = notes || null;
    po.updatedAt = new Date();

    await user.save();

    logger.info(`Purchase order approved: ${poId}`, {
      userId: userId,
      supplierId: po.supplierId,
      total: po.total
    });

    res.json({
      success: true,
      message: 'Purchase order approved successfully',
      data: {
        poId: poId,
        status: PO_STATUS.APPROVED,
        approvedAt: po.approvedAt,
        approvedBy: userId
      }
    });

  } catch (error) {
    logger.error('Failed to approve purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve purchase order'
    });
  }
});

// Receive purchase order
router.patch('/purchase-orders/:poId/receive', [
  auth,
  body('receivedItems').isArray().withMessage('Received items must be an array'),
  body('receivedItems.*.productSku').notEmpty().withMessage('Product SKU is required'),
  body('receivedItems.*.receivedQuantity').isInt({ min: 0 }).withMessage('Received quantity must be non-negative integer'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { poId } = req.params;
    const { receivedItems, notes } = req.body;
    const userId = req.user._id;

    // Check user permissions
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || 'staff';
    if (!['owner', 'manager', 'staff'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to receive purchase orders'
      });
    }

    // Find purchase order
    const po = user.purchaseOrders?.find(p => p.id === poId);
    if (!po) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    // Check if PO can be received
    if (po.status !== PO_STATUS.APPROVED && po.status !== PO_STATUS.ORDERED && po.status !== PO_STATUS.PARTIALLY_RECEIVED) {
      return res.status(400).json({
        success: false,
        message: 'Purchase order cannot be received in current status'
      });
    }

    // Process received items
    let allItemsReceived = true;
    const updatedItems = po.items.map(item => {
      const receivedItem = receivedItems.find(ri => ri.productSku === item.productSku);
      if (receivedItem) {
        const newReceivedQuantity = (item.receivedQuantity || 0) + receivedItem.receivedQuantity;
        if (newReceivedQuantity < item.quantity) {
          allItemsReceived = false;
        }
        return {
          ...item,
          receivedQuantity: newReceivedQuantity
        };
      }
      return item;
    });

    // Update purchase order
    po.items = updatedItems;
    po.receivedAt = new Date();
    po.receivedBy = userId;
    po.receiptNotes = notes || null;
    po.updatedAt = new Date();

    // Update status based on received quantities
    if (allItemsReceived) {
      po.status = PO_STATUS.RECEIVED;
    } else {
      po.status = PO_STATUS.PARTIALLY_RECEIVED;
    }

    await user.save();

    // Update inventory (mock implementation)
    await updateInventoryFromPO(po, receivedItems);

    logger.info(`Purchase order received: ${poId}`, {
      userId: userId,
      supplierId: po.supplierId,
      receivedItems: receivedItems.length,
      status: po.status
    });

    res.json({
      success: true,
      message: 'Purchase order received successfully',
      data: {
        poId: poId,
        status: po.status,
        receivedAt: po.receivedAt,
        receivedBy: userId,
        allItemsReceived: allItemsReceived
      }
    });

  } catch (error) {
    logger.error('Failed to receive purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to receive purchase order'
    });
  }
});

// Get purchase order details
router.get('/purchase-orders/:poId', auth, async (req, res) => {
  try {
    const { poId } = req.params;
    const userId = req.user._id;

    const user = await PartnerUser.findById(userId);
    if (!user || !user.purchaseOrders) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    const po = user.purchaseOrders.find(p => p.id === poId);
    if (!po) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    // Get supplier details
    const supplier = user.suppliers?.find(s => s.id === po.supplierId);

    res.json({
      success: true,
      data: {
        purchaseOrder: {
          id: po.id,
          supplierId: po.supplierId,
          supplier: supplier ? {
            name: supplier.name,
            contactPerson: supplier.contactPerson,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address
          } : null,
          items: po.items,
          subtotal: po.subtotal,
          tax: po.tax,
          total: po.total,
          expectedDeliveryDate: po.expectedDeliveryDate,
          notes: po.notes,
          priority: po.priority,
          status: po.status,
          createdAt: po.createdAt,
          updatedAt: po.updatedAt,
          createdBy: po.createdBy,
          approvedAt: po.approvedAt,
          approvedBy: po.approvedBy,
          approvalNotes: po.approvalNotes,
          orderedAt: po.orderedAt,
          receivedAt: po.receivedAt,
          receivedBy: po.receivedBy,
          receiptNotes: po.receiptNotes
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get purchase order details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get purchase order details'
    });
  }
});

// Helper function to update inventory
async function updateInventoryFromPO(po, receivedItems) {
  // Mock implementation - in real app, this would update the inventory collection
  logger.info('Updating inventory from purchase order', {
    poId: po.id,
    receivedItems: receivedItems.length
  });
}

module.exports = router;
