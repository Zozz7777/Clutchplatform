const mongoose = require('../shims/mongoose');

const partnerSyncOperationSchema = new mongoose.Schema({
  // Operation Information
  operationId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  partnerId: {
    type: String,
    required: true,
    ref: 'PartnerUser'
  },
  deviceId: {
    type: String,
    required: true,
    ref: 'PartnerDevice'
  },
  
  // Operation Details
  operationType: {
    type: String,
    enum: ['create', 'update', 'delete', 'sync'],
    required: true
  },
  entityType: {
    type: String,
    enum: ['order', 'inventory', 'payment', 'customer', 'product', 'settings'],
    required: true
  },
  entityId: {
    type: String,
    required: true
  },
  
  // Data Information
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  originalData: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Status Information
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'conflict', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  },
  
  // Timestamp Information
  createdAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  
  // Conflict Resolution
  conflict: {
    hasConflict: { type: Boolean, default: false },
    conflictType: { type: String },
    serverData: { type: mongoose.Schema.Types.Mixed },
    localData: { type: mongoose.Schema.Types.Mixed },
    resolution: { type: String, enum: ['local_wins', 'server_wins', 'merge', 'manual'] },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'PartnerUser' },
    resolvedAt: { type: Date }
  },
  
  // Error Information
  error: {
    code: { type: String },
    message: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    lastRetryAt: { type: Date }
  },
  
  // Sync Information
  sync: {
    batchId: { type: String },
    sequenceNumber: { type: Number },
    isBatchOperation: { type: Boolean, default: false },
    batchSize: { type: Number, default: 1 }
  },
  
  // Metadata
  metadata: {
    source: { type: String, default: 'local_device' },
    version: { type: String, default: '1.0' },
    tags: [{ type: String, trim: true }],
    customFields: { type: mongoose.Schema.Types.Mixed }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
partnerSyncOperationSchema.index({ operationId: 1 });
partnerSyncOperationSchema.index({ partnerId: 1 });
partnerSyncOperationSchema.index({ deviceId: 1 });
partnerSyncOperationSchema.index({ status: 1 });
partnerSyncOperationSchema.index({ operationType: 1 });
partnerSyncOperationSchema.index({ entityType: 1 });
partnerSyncOperationSchema.index({ entityId: 1 });
partnerSyncOperationSchema.index({ priority: 1 });
partnerSyncOperationSchema.index({ createdAt: -1 });
partnerSyncOperationSchema.index({ 'sync.batchId': 1 });

// Compound indexes
partnerSyncOperationSchema.index({ partnerId: 1, status: 1 });
partnerSyncOperationSchema.index({ partnerId: 1, entityType: 1 });
partnerSyncOperationSchema.index({ deviceId: 1, status: 1 });
partnerSyncOperationSchema.index({ status: 1, priority: 1 });

// Virtuals
partnerSyncOperationSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

partnerSyncOperationSchema.virtual('isProcessing').get(function() {
  return this.status === 'processing';
});

partnerSyncOperationSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

partnerSyncOperationSchema.virtual('isFailed').get(function() {
  return this.status === 'failed';
});

partnerSyncOperationSchema.virtual('hasConflict').get(function() {
  return this.conflict.hasConflict;
});

partnerSyncOperationSchema.virtual('canRetry').get(function() {
  return this.status === 'failed' && this.error.retryCount < this.error.maxRetries;
});

partnerSyncOperationSchema.virtual('isOverdue').get(function() {
  const now = new Date();
  const timeSinceCreated = now - this.createdAt;
  const maxWaitTime = this.priority === 'critical' ? 5 * 60 * 1000 : // 5 minutes
                     this.priority === 'high' ? 15 * 60 * 1000 : // 15 minutes
                     30 * 60 * 1000; // 30 minutes
  return timeSinceCreated > maxWaitTime && this.status === 'pending';
});

// Pre-save middleware
partnerSyncOperationSchema.pre('save', function(next) {
  // Generate operation ID if not provided
  if (!this.operationId) {
    this.operationId = `SYNC_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }
  
  // Update timestamps based on status
  if (this.status === 'processing' && !this.processedAt) {
    this.processedAt = new Date();
  }
  
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

// Instance methods
partnerSyncOperationSchema.methods.markProcessing = function() {
  this.status = 'processing';
  this.processedAt = new Date();
  return this.save();
};

partnerSyncOperationSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

partnerSyncOperationSchema.methods.markFailed = function(errorCode, errorMessage, errorDetails = {}) {
  this.status = 'failed';
  this.error.code = errorCode;
  this.error.message = errorMessage;
  this.error.details = errorDetails;
  this.error.retryCount += 1;
  this.error.lastRetryAt = new Date();
  return this.save();
};

partnerSyncOperationSchema.methods.markConflict = function(serverData, conflictType = 'data_mismatch') {
  this.status = 'conflict';
  this.conflict.hasConflict = true;
  this.conflict.conflictType = conflictType;
  this.conflict.serverData = serverData;
  this.conflict.localData = this.data;
  return this.save();
};

partnerSyncOperationSchema.methods.resolveConflict = function(resolution, resolvedBy) {
  this.conflict.resolution = resolution;
  this.conflict.resolvedBy = resolvedBy;
  this.conflict.resolvedAt = new Date();
  
  // Update data based on resolution
  if (resolution === 'server_wins') {
    this.data = this.conflict.serverData;
  } else if (resolution === 'merge') {
    // Merge logic would be implemented based on entity type
    this.data = { ...this.conflict.localData, ...this.conflict.serverData };
  }
  
  this.status = 'pending';
  return this.save();
};

partnerSyncOperationSchema.methods.retry = function() {
  if (this.canRetry) {
    this.status = 'pending';
    this.error.retryCount += 1;
    this.error.lastRetryAt = new Date();
    return this.save();
  }
  throw new Error('Operation cannot be retried');
};

partnerSyncOperationSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Static methods
partnerSyncOperationSchema.statics.findByPartner = function(partnerId, filters = {}) {
  const query = { partnerId, ...filters };
  return this.find(query).sort({ createdAt: -1 });
};

partnerSyncOperationSchema.statics.findPending = function(partnerId) {
  return this.find({
    partnerId,
    status: 'pending'
  }).sort({ priority: -1, createdAt: 1 });
};

partnerSyncOperationSchema.statics.findFailed = function(partnerId) {
  return this.find({
    partnerId,
    status: 'failed'
  }).sort({ createdAt: -1 });
};

partnerSyncOperationSchema.statics.findConflicts = function(partnerId) {
  return this.find({
    partnerId,
    status: 'conflict'
  }).sort({ createdAt: -1 });
};

partnerSyncOperationSchema.statics.findByEntity = function(partnerId, entityType, entityId) {
  return this.find({
    partnerId,
    entityType,
    entityId
  }).sort({ createdAt: -1 });
};

partnerSyncOperationSchema.statics.findByBatch = function(batchId) {
  return this.find({
    'sync.batchId': batchId
  }).sort({ 'sync.sequenceNumber': 1 });
};

partnerSyncOperationSchema.statics.getSyncStats = function(partnerId) {
  return this.aggregate([
    { $match: { partnerId } },
    {
      $group: {
        _id: null,
        totalOperations: { $sum: 1 },
        pendingOperations: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        processingOperations: {
          $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
        },
        completedOperations: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failedOperations: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        conflictOperations: {
          $sum: { $cond: [{ $eq: ['$status', 'conflict'] }, 1, 0] }
        },
        overdueOperations: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'pending'] },
                  {
                    $lt: [
                      '$createdAt',
                      {
                        $subtract: [
                          '$$NOW',
                          {
                            $cond: [
                              { $eq: ['$priority', 'critical'] },
                              5 * 60 * 1000, // 5 minutes
                              {
                                $cond: [
                                  { $eq: ['$priority', 'high'] },
                                  15 * 60 * 1000, // 15 minutes
                                  30 * 60 * 1000 // 30 minutes
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

partnerSyncOperationSchema.statics.createBatch = function(operations) {
  const batchId = `BATCH_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  
  operations.forEach((operation, index) => {
    operation.sync.batchId = batchId;
    operation.sync.sequenceNumber = index + 1;
    operation.sync.isBatchOperation = true;
    operation.sync.batchSize = operations.length;
  });
  
  return this.insertMany(operations);
};

module.exports = mongoose.model('PartnerSyncOperation', partnerSyncOperationSchema);
