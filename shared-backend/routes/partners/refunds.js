const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../../middleware/unified-auth');
const logger = require('../../utils/logger');

// Database connection for real data
const { connectToDatabase } = require('../../config/database-unified');

// Helper function to get refund requests from database
async function getRefundRequests() {
  try {
    const db = await connectToDatabase();
    const refundsCollection = db.collection('refund_requests');
    
    // Get refunds from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const refunds = await refundsCollection.find({
      requestedAt: { $gte: thirtyDaysAgo }
    }).sort({ requestedAt: -1 }).limit(100).toArray();
    
    return refunds.map(refund => ({
      id: refund._id.toString(),
      orderId: refund.orderId || 'unknown',
      customerId: refund.customerId || 'unknown',
      customerName: refund.customerName || 'Unknown Customer',
      customerEmail: refund.customerEmail || 'unknown@example.com',
      amount: refund.amount || 0,
      currency: refund.currency || 'USD',
      reason: refund.reason || 'Not specified',
      status: refund.status || 'pending',
      requestedAt: refund.requestedAt,
      processedAt: refund.processedAt || null,
      processedBy: refund.processedBy || null,
      notes: refund.notes || '',
      items: refund.items || []
    }));
  } catch (error) {
    logger.error('Error fetching refund requests:', error);
    return [];
  }
}

// Helper function to get return requests from database
async function getReturnRequests() {
  try {
    const db = await connectToDatabase();
    const returnsCollection = db.collection('return_requests');
    
    // Get returns from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const returns = await returnsCollection.find({
      requestedAt: { $gte: thirtyDaysAgo }
    }).sort({ requestedAt: -1 }).limit(100).toArray();
    
    return returns.map(returnReq => ({
      id: returnReq._id.toString(),
      orderId: returnReq.orderId || 'unknown',
      customerId: returnReq.customerId || 'unknown',
      customerName: returnReq.customerName || 'Unknown Customer',
      customerEmail: returnReq.customerEmail || 'unknown@example.com',
      amount: returnReq.amount || 0,
      currency: returnReq.currency || 'USD',
      reason: returnReq.reason || 'Not specified',
      status: returnReq.status || 'pending',
      requestedAt: returnReq.requestedAt,
      processedAt: returnReq.processedAt || null,
      processedBy: returnReq.processedBy || null,
      notes: returnReq.notes || '',
      items: returnReq.items || []
    }));
  } catch (error) {
    logger.error('Error fetching return requests:', error);
    return [];
  }
}

/**
 * @route GET /api/v1/partners/refunds
 * @desc Get refund requests
 * @access Private (Partners only)
 */
router.get('/', authenticateToken, checkRole(['partner', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { status, timeRange } = req.query;
    
    // Get real refund requests from database
    let refunds = await getRefundRequests();
    
    // Filter by status if provided
    if (status && status !== 'all') {
      refunds = refunds.filter(refund => refund.status === status);
    }
    
    // Filter by time range if provided
    if (timeRange) {
      const timeRangeMs = timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 : 
                         timeRange === '30d' ? 30 * 24 * 60 * 60 * 1000 : 
                         timeRange === '90d' ? 90 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
      const cutoffTime = new Date(Date.now() - timeRangeMs);
      refunds = refunds.filter(refund => new Date(refund.requestedAt) >= cutoffTime);
    }
    
    res.json({
      success: true,
      data: refunds,
      message: 'Refund requests retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching refund requests:', error);
    res.status(500).json({
      success: false,
      error: 'REFUND_REQUESTS_FETCH_FAILED',
      message: 'Failed to fetch refund requests',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/partners/refunds/returns
 * @desc Get return requests
 * @access Private (Partners only)
 */
router.get('/returns', authenticateToken, checkRole(['partner', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { status, timeRange } = req.query;
    
    // Get real return requests from database
    let returns = await getReturnRequests();
    
    // Filter by status if provided
    if (status && status !== 'all') {
      returns = returns.filter(returnReq => returnReq.status === status);
    }
    
    // Filter by time range if provided
    if (timeRange) {
      const timeRangeMs = timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 : 
                         timeRange === '30d' ? 30 * 24 * 60 * 60 * 1000 : 
                         timeRange === '90d' ? 90 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
      const cutoffTime = new Date(Date.now() - timeRangeMs);
      returns = returns.filter(returnReq => new Date(returnReq.requestedAt) >= cutoffTime);
    }
    
    res.json({
      success: true,
      data: returns,
      message: 'Return requests retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching return requests:', error);
    res.status(500).json({
      success: false,
      error: 'RETURN_REQUESTS_FETCH_FAILED',
      message: 'Failed to fetch return requests',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/v1/partners/refunds/:id/process
 * @desc Process a refund request
 * @access Private (Partners only)
 */
router.post('/:id/process', authenticateToken, checkRole(['partner', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'approve' or 'reject'
    
    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ACTION',
        message: 'Action must be either "approve" or "reject"',
        timestamp: new Date().toISOString()
      });
    }
    
    const db = await connectToDatabase();
    const refundsCollection = db.collection('refund_requests');
    
    // Update refund request
    const result = await refundsCollection.updateOne(
      { _id: id },
      {
        $set: {
          status: action === 'approve' ? 'approved' : 'rejected',
          processedAt: new Date().toISOString(),
          processedBy: req.user.userId || req.user.id,
          notes: notes || ''
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'REFUND_NOT_FOUND',
        message: 'Refund request not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: `Refund request ${action}d successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error processing refund request:', error);
    res.status(500).json({
      success: false,
      error: 'REFUND_PROCESSING_FAILED',
      message: 'Failed to process refund request',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/v1/partners/refunds/stats
 * @desc Get refund and return statistics
 * @access Private (Partners only)
 */
router.get('/stats', authenticateToken, checkRole(['partner', 'admin', 'super_admin']), async (req, res) => {
  try {
    const db = await connectToDatabase();
    const refundsCollection = db.collection('refund_requests');
    const returnsCollection = db.collection('return_requests');
    
    // Get statistics for last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const refundStats = await refundsCollection.aggregate([
      { $match: { requestedAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]).toArray();
    
    const returnStats = await returnsCollection.aggregate([
      { $match: { requestedAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]).toArray();
    
    const stats = {
      refunds: {
        total: refundStats.reduce((sum, stat) => sum + stat.count, 0),
        totalAmount: refundStats.reduce((sum, stat) => sum + stat.totalAmount, 0),
        byStatus: refundStats.reduce((acc, stat) => {
          acc[stat._id] = { count: stat.count, amount: stat.totalAmount };
          return acc;
        }, {})
      },
      returns: {
        total: returnStats.reduce((sum, stat) => sum + stat.count, 0),
        totalAmount: returnStats.reduce((sum, stat) => sum + stat.totalAmount, 0),
        byStatus: returnStats.reduce((acc, stat) => {
          acc[stat._id] = { count: stat.count, amount: stat.totalAmount };
          return acc;
        }, {})
      }
    };
    
    res.json({
      success: true,
      data: stats,
      message: 'Refund and return statistics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching refund statistics:', error);
    res.status(500).json({
      success: false,
      error: 'REFUND_STATS_FETCH_FAILED',
      message: 'Failed to fetch refund statistics',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;