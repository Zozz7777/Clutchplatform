const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../../middleware/unified-auth');
const logger = require('../../utils/logger');

// Mock data for demonstration
const refundRequests = [
  {
    id: 'refund_1',
    orderId: 'order_123',
    customerId: 'customer_456',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    amount: 150.00,
    currency: 'USD',
    reason: 'Product defect',
    status: 'pending',
    requestedAt: new Date().toISOString(),
    processedAt: null,
    processedBy: null,
    notes: 'Customer reported product arrived damaged',
    items: [
      {
        id: 'item_1',
        name: 'Brake Pads Set',
        quantity: 1,
        price: 150.00
      }
    ]
  },
  {
    id: 'refund_2',
    orderId: 'order_124',
    customerId: 'customer_789',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    amount: 75.50,
    currency: 'USD',
    reason: 'Wrong item shipped',
    status: 'approved',
    requestedAt: new Date(Date.now() - 86400000).toISOString(),
    processedAt: new Date(Date.now() - 43200000).toISOString(),
    processedBy: 'admin_001',
    notes: 'Customer received wrong part number',
    items: [
      {
        id: 'item_2',
        name: 'Oil Filter',
        quantity: 2,
        price: 37.75
      }
    ]
  },
  {
    id: 'refund_3',
    orderId: 'order_125',
    customerId: 'customer_321',
    customerName: 'Bob Johnson',
    customerEmail: 'bob.johnson@example.com',
    amount: 200.00,
    currency: 'USD',
    reason: 'Customer changed mind',
    status: 'rejected',
    requestedAt: new Date(Date.now() - 172800000).toISOString(),
    processedAt: new Date(Date.now() - 129600000).toISOString(),
    processedBy: 'admin_002',
    notes: 'Item was used and cannot be returned',
    items: [
      {
        id: 'item_3',
        name: 'Air Filter',
        quantity: 1,
        price: 200.00
      }
    ]
  }
];

const returnRequests = [
  {
    id: 'return_1',
    orderId: 'order_126',
    customerId: 'customer_654',
    customerName: 'Alice Brown',
    customerEmail: 'alice.brown@example.com',
    amount: 89.99,
    currency: 'USD',
    reason: 'Size not suitable',
    status: 'pending',
    requestedAt: new Date().toISOString(),
    processedAt: null,
    processedBy: null,
    notes: 'Customer needs different size',
    items: [
      {
        id: 'item_4',
        name: 'Tire Set',
        quantity: 4,
        price: 22.50
      }
    ],
    returnMethod: 'pickup',
    trackingNumber: null
  }
];

/**
 * @route GET /api/v1/partners/refunds
 * @desc Get refund requests for partners
 * @access Private (Partners only)
 */
router.get('/', authenticateToken, authorizeRoles(['partner', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { status, customerId, orderId, timeRange } = req.query;
    
    let filteredRefunds = refundRequests;
    
    if (status && status !== 'all') {
      filteredRefunds = filteredRefunds.filter(refund => refund.status === status);
    }
    
    if (customerId) {
      filteredRefunds = filteredRefunds.filter(refund => refund.customerId === customerId);
    }
    
    if (orderId) {
      filteredRefunds = filteredRefunds.filter(refund => refund.orderId === orderId);
    }
    
    // Filter by time range (mock implementation)
    if (timeRange) {
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      filteredRefunds = filteredRefunds.filter(refund => 
        new Date(refund.requestedAt) >= startDate
      );
    }
    
    res.json({
      success: true,
      data: filteredRefunds,
      message: 'Refund requests retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching refund requests:', error);
    res.status(500).json({
      success: false,
      error: 'REFUNDS_FETCH_FAILED',
      message: 'Failed to fetch refund requests',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/partners/refunds/:id
 * @desc Get specific refund request
 * @access Private (Partners only)
 */
router.get('/:id', authenticateToken, authorizeRoles(['partner', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const refund = refundRequests.find(r => r.id === id);
    if (!refund) {
      return res.status(404).json({
        success: false,
        error: 'REFUND_NOT_FOUND',
        message: 'Refund request not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: refund,
      message: 'Refund request retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching refund request:', error);
    res.status(500).json({
      success: false,
      error: 'REFUND_FETCH_FAILED',
      message: 'Failed to fetch refund request',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route PUT /api/v1/partners/refunds/:id/status
 * @desc Update refund request status
 * @access Private (Partners only)
 */
router.put('/:id/status', authenticateToken, authorizeRoles(['partner', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status || !['pending', 'approved', 'rejected', 'processing', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Valid status is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const refundIndex = refundRequests.findIndex(r => r.id === id);
    if (refundIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'REFUND_NOT_FOUND',
        message: 'Refund request not found',
        timestamp: new Date().toISOString()
      });
    }
    
    refundRequests[refundIndex].status = status;
    refundRequests[refundIndex].processedAt = new Date().toISOString();
    refundRequests[refundIndex].processedBy = req.user.userId;
    
    if (notes) {
      refundRequests[refundIndex].notes = notes;
    }
    
    logger.info(`Refund request ${id} status updated to ${status} by user ${req.user.userId}`);
    
    res.json({
      success: true,
      data: refundRequests[refundIndex],
      message: 'Refund request status updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating refund status:', error);
    res.status(500).json({
      success: false,
      error: 'REFUND_STATUS_UPDATE_FAILED',
      message: 'Failed to update refund request status',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/partners/refunds/returns
 * @desc Get return requests for partners
 * @access Private (Partners only)
 */
router.get('/returns', authenticateToken, authorizeRoles(['partner', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { status, customerId, orderId } = req.query;
    
    let filteredReturns = returnRequests;
    
    if (status && status !== 'all') {
      filteredReturns = filteredReturns.filter(returnReq => returnReq.status === status);
    }
    
    if (customerId) {
      filteredReturns = filteredReturns.filter(returnReq => returnReq.customerId === customerId);
    }
    
    if (orderId) {
      filteredReturns = filteredReturns.filter(returnReq => returnReq.orderId === orderId);
    }
    
    res.json({
      success: true,
      data: filteredReturns,
      message: 'Return requests retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching return requests:', error);
    res.status(500).json({
      success: false,
      error: 'RETURNS_FETCH_FAILED',
      message: 'Failed to fetch return requests',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route PUT /api/v1/partners/refunds/returns/:id/status
 * @desc Update return request status
 * @access Private (Partners only)
 */
router.put('/returns/:id/status', authenticateToken, authorizeRoles(['partner', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, notes } = req.body;
    
    if (!status || !['pending', 'approved', 'rejected', 'processing', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Valid status is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const returnIndex = returnRequests.findIndex(r => r.id === id);
    if (returnIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'RETURN_NOT_FOUND',
        message: 'Return request not found',
        timestamp: new Date().toISOString()
      });
    }
    
    returnRequests[returnIndex].status = status;
    returnRequests[returnIndex].processedAt = new Date().toISOString();
    returnRequests[returnIndex].processedBy = req.user.userId;
    
    if (trackingNumber) {
      returnRequests[returnIndex].trackingNumber = trackingNumber;
    }
    
    if (notes) {
      returnRequests[returnIndex].notes = notes;
    }
    
    logger.info(`Return request ${id} status updated to ${status} by user ${req.user.userId}`);
    
    res.json({
      success: true,
      data: returnRequests[returnIndex],
      message: 'Return request status updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating return status:', error);
    res.status(500).json({
      success: false,
      error: 'RETURN_STATUS_UPDATE_FAILED',
      message: 'Failed to update return request status',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/partners/refunds/analytics
 * @desc Get refund analytics for partners
 * @access Private (Partners only)
 */
router.get('/analytics', authenticateToken, authorizeRoles(['partner', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { timeRange } = req.query;
    
    // Calculate analytics based on refund data
    const totalRefunds = refundRequests.length;
    const pendingRefunds = refundRequests.filter(r => r.status === 'pending').length;
    const approvedRefunds = refundRequests.filter(r => r.status === 'approved').length;
    const rejectedRefunds = refundRequests.filter(r => r.status === 'rejected').length;
    
    const totalRefundAmount = refundRequests
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const averageRefundAmount = approvedRefunds > 0 ? totalRefundAmount / approvedRefunds : 0;
    
    const refundReasons = refundRequests.reduce((acc, refund) => {
      acc[refund.reason] = (acc[refund.reason] || 0) + 1;
      return acc;
    }, {});
    
    const analytics = {
      summary: {
        totalRefunds,
        pendingRefunds,
        approvedRefunds,
        rejectedRefunds,
        totalRefundAmount,
        averageRefundAmount
      },
      refundReasons,
      timeRange: timeRange || 'all'
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'Refund analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching refund analytics:', error);
    res.status(500).json({
      success: false,
      error: 'REFUND_ANALYTICS_FETCH_FAILED',
      message: 'Failed to fetch refund analytics',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
