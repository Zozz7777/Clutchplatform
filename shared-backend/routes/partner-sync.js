const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerSyncOperation = require('../models/PartnerSyncOperation');
const PartnerUser = require('../models/PartnerUser');
const PartnerDevice = require('../models/PartnerDevice');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Validation middleware
const validateSyncData = [
  body('operations').isArray({ min: 1 }).withMessage('Operations array is required'),
  body('operations.*.operationType').isIn(['create', 'update', 'delete', 'sync']).withMessage('Valid operation type is required'),
  body('operations.*.entityType').isIn(['order', 'inventory', 'payment', 'customer', 'product', 'settings']).withMessage('Valid entity type is required'),
  body('operations.*.entityId').notEmpty().withMessage('Entity ID is required'),
  body('operations.*.data').notEmpty().withMessage('Data is required')
];

// @route   GET /api/v1/partners/:id/sync
// @desc    Fetch server changes since timestamp
// @access  Private
router.get('/:id/sync', authenticateToken, async (req, res) => {
  try {
    const { id: partnerId } = req.params;
    const { since, limit = 100 } = req.query;

    // Verify partner access
    if (req.user.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const filters = { partnerId };
    if (since) {
      filters.updatedAt = { $gt: new Date(since) };
    }

    const operations = await PartnerSyncOperation.find(filters)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        operations,
        lastSync: new Date().toISOString(),
        count: operations.length
      }
    });

  } catch (error) {
    logger.error('Get sync data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/v1/partners/:id/sync
// @desc    Push local changes to server
// @access  Private
router.post('/:id/sync', authenticateToken, validateSyncData, async (req, res) => {
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
    const { operations, batchId } = req.body;

    // Verify partner access
    if (req.user.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const results = {
      processed: 0,
      conflicts: 0,
      errors: 0,
      operations: []
    };

    // Process each operation
    for (const operationData of operations) {
      try {
        // Check for conflicts
        const existingOperation = await PartnerSyncOperation.findOne({
          partnerId,
          entityType: operationData.entityType,
          entityId: operationData.entityId,
          status: { $in: ['completed', 'conflict'] }
        });

        if (existingOperation && existingOperation.data !== JSON.stringify(operationData.data)) {
          // Conflict detected
          const conflictOperation = new PartnerSyncOperation({
            ...operationData,
            partnerId,
            deviceId: req.user.deviceId,
            status: 'conflict',
            conflict: {
              hasConflict: true,
              conflictType: 'data_mismatch',
              serverData: existingOperation.data,
              localData: operationData.data
            }
          });
          
          await conflictOperation.save();
          results.conflicts++;
          results.operations.push({
            operationId: conflictOperation.operationId,
            status: 'conflict',
            conflict: true
          });
        } else {
          // No conflict, process operation
          const operation = new PartnerSyncOperation({
            ...operationData,
            partnerId,
            deviceId: req.user.deviceId,
            status: 'completed',
            sync: {
              batchId: batchId || `BATCH_${Date.now()}`,
              sequenceNumber: results.processed + 1,
              isBatchOperation: !!batchId
            }
          });
          
          await operation.save();
          results.processed++;
          results.operations.push({
            operationId: operation.operationId,
            status: 'completed'
          });
        }
      } catch (error) {
        results.errors++;
        results.operations.push({
          operationId: operationData.entityId,
          status: 'error',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Sync completed',
      data: results
    });

  } catch (error) {
    logger.error('Sync push error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/v1/partners/:id/sync/status
// @desc    Get sync status and statistics
// @access  Private
router.get('/:id/sync/status', authenticateToken, async (req, res) => {
  try {
    const { id: partnerId } = req.params;

    // Verify partner access
    if (req.user.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [syncStats, pendingOps, conflicts] = await Promise.all([
      PartnerSyncOperation.getSyncStats(partnerId),
      PartnerSyncOperation.findPending(partnerId),
      PartnerSyncOperation.findConflicts(partnerId)
    ]);

    res.json({
      success: true,
      data: {
        stats: syncStats[0] || {
          totalOperations: 0,
          pendingOperations: 0,
          processingOperations: 0,
          completedOperations: 0,
          failedOperations: 0,
          conflictOperations: 0,
          overdueOperations: 0
        },
        pendingOperations: pendingOps,
        conflicts: conflicts
      }
    });

  } catch (error) {
    logger.error('Get sync status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/v1/partners/:id/sync/resolve-conflict
// @desc    Resolve sync conflict
// @access  Private
router.post('/:id/sync/resolve-conflict', authenticateToken, async (req, res) => {
  try {
    const { id: partnerId } = req.params;
    const { operationId, resolution } = req.body;

    if (!operationId || !resolution) {
      return res.status(400).json({
        success: false,
        message: 'Operation ID and resolution are required'
      });
    }

    if (!['local_wins', 'server_wins', 'merge'].includes(resolution)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resolution type'
      });
    }

    // Verify partner access
    if (req.user.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const operation = await PartnerSyncOperation.findOne({
      operationId,
      partnerId,
      status: 'conflict'
    });

    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'Conflict operation not found'
      });
    }

    await operation.resolveConflict(resolution, req.user.id);

    res.json({
      success: true,
      message: 'Conflict resolved successfully',
      data: { operation }
    });

  } catch (error) {
    logger.error('Resolve conflict error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/v1/partners/:id/sync/retry
// @desc    Retry failed sync operation
// @access  Private
router.post('/:id/sync/retry', authenticateToken, async (req, res) => {
  try {
    const { id: partnerId } = req.params;
    const { operationId } = req.body;

    if (!operationId) {
      return res.status(400).json({
        success: false,
        message: 'Operation ID is required'
      });
    }

    // Verify partner access
    if (req.user.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const operation = await PartnerSyncOperation.findOne({
      operationId,
      partnerId,
      status: 'failed'
    });

    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'Failed operation not found'
      });
    }

    if (!operation.canRetry) {
      return res.status(400).json({
        success: false,
        message: 'Operation cannot be retried'
      });
    }

    await operation.retry();

    res.json({
      success: true,
      message: 'Operation retry initiated',
      data: { operation }
    });

  } catch (error) {
    logger.error('Retry operation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/v1/partners/:id/sync/conflicts
// @desc    Get all conflicts for partner
// @access  Private
router.get('/:id/sync/conflicts', authenticateToken, async (req, res) => {
  try {
    const { id: partnerId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify partner access
    if (req.user.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [conflicts, total] = await Promise.all([
      PartnerSyncOperation.findConflicts(partnerId)
        .skip(skip)
        .limit(parseInt(limit)),
      PartnerSyncOperation.countDocuments({
        partnerId,
        status: 'conflict'
      })
    ]);

    res.json({
      success: true,
      data: {
        conflicts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Get conflicts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
