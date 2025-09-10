const mongoose = require('../shims/mongoose');

const disputeSchema = new mongoose.Schema({
  disputeId: {
    type: String,
    required: true,
    default: () => `disp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  type: {
    type: String,
    required: true,
    enum: ['service_quality', 'billing', 'cancellation', 'refund', 'safety', 'other']
  },
  status: {
    type: String,
    required: true,
    enum: ['open', 'under_review', 'resolved', 'closed', 'escalated'],
    default: 'open'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mechanicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mechanic'
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  supportTicketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportTicket'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  evidence: [{
    type: {
      type: String,
      enum: ['image', 'document', 'video', 'audio']
    },
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolution: {
    action: {
      type: String,
      enum: ['refund', 'partial_refund', 'reschedule', 'replacement', 'compensation', 'apology', 'other']
    },
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    description: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    attachments: [{
      type: String,
      url: String,
      filename: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  metadata: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: Date
}, { timestamps: true, collection: 'disputes' });

// Indexes
disputeSchema.index({ disputeId: 1 });
disputeSchema.index({ userId: 1 });
disputeSchema.index({ mechanicId: 1 });
disputeSchema.index({ bookingId: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ priority: 1 });
disputeSchema.index({ type: 1 });
disputeSchema.index({ assignedTo: 1 });
disputeSchema.index({ createdAt: -1 });

// Pre-save middleware
disputeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
disputeSchema.statics.findByUser = function(userId, options = {}) {
  const match = { userId };
  if (options.status) match.status = options.status;
  if (options.type) match.type = options.type;
  if (options.priority) match.priority = options.priority;
  return this.aggregate([
    { $match: match },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userId' } },
    { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'mechanics', localField: 'mechanicId', foreignField: '_id', as: 'mechanicId' } },
    { $unwind: { path: '$mechanicId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'bookings', localField: 'bookingId', foreignField: '_id', as: 'bookingId' } },
    { $unwind: { path: '$bookingId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'mechanics', localField: 'assignedTo', foreignField: '_id', as: 'assignedTo' } },
    { $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } }
  ]);
};

disputeSchema.statics.findByMechanic = function(mechanicId, options = {}) {
  const match = { mechanicId };
  if (options.status) match.status = options.status;
  if (options.type) match.type = options.type;
  if (options.priority) match.priority = options.priority;
  return this.aggregate([
    { $match: match },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userId' } },
    { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'mechanics', localField: 'mechanicId', foreignField: '_id', as: 'mechanicId' } },
    { $unwind: { path: '$mechanicId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'bookings', localField: 'bookingId', foreignField: '_id', as: 'bookingId' } },
    { $unwind: { path: '$bookingId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'mechanics', localField: 'assignedTo', foreignField: '_id', as: 'assignedTo' } },
    { $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } }
  ]);
};

disputeSchema.statics.findOpenDisputes = function() {
  return this.aggregate([
    { $match: { status: { $in: ['open', 'under_review'] } } },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userId' } },
    { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'mechanics', localField: 'mechanicId', foreignField: '_id', as: 'mechanicId' } },
    { $unwind: { path: '$mechanicId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'bookings', localField: 'bookingId', foreignField: '_id', as: 'bookingId' } },
    { $unwind: { path: '$bookingId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'mechanics', localField: 'assignedTo', foreignField: '_id', as: 'assignedTo' } },
    { $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: true } },
    { $sort: { priority: -1, createdAt: 1 } }
  ]);
};

disputeSchema.statics.findByAssignee = function(assigneeId, options = {}) {
  const match = { assignedTo: assigneeId };
  if (options.status) match.status = options.status;
  if (options.priority) match.priority = options.priority;
  return this.aggregate([
    { $match: match },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userId' } },
    { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'mechanics', localField: 'mechanicId', foreignField: '_id', as: 'mechanicId' } },
    { $unwind: { path: '$mechanicId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'bookings', localField: 'bookingId', foreignField: '_id', as: 'bookingId' } },
    { $unwind: { path: '$bookingId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'mechanics', localField: 'assignedTo', foreignField: '_id', as: 'assignedTo' } },
    { $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: true } },
    { $sort: { priority: -1, createdAt: 1 } }
  ]);
};

disputeSchema.statics.getDisputeStats = function() {
  return this.aggregate([
    { $group: {
      _id: '$status',
      count: { $sum: 1 },
      avgResolutionTime: { $avg: { $subtract: ['$closedAt', '$createdAt'] } }
    }},
    { $sort: { count: -1 } }
  ]);
};

// Instance methods
disputeSchema.methods.addMessage = function(senderId, message, isInternal = false, attachments = []) {
  this.messages.push({
    sender: senderId,
    message,
    isInternal,
    attachments,
    createdAt: new Date()
  });
  return this.save();
};

disputeSchema.methods.assignTo = function(assigneeId) {
  this.assignedTo = assigneeId;
  return this.save();
};

disputeSchema.methods.updateStatus = function(status) {
  this.status = status;
  if (status === 'closed') {
    this.closedAt = new Date();
  }
  return this.save();
};

disputeSchema.methods.updatePriority = function(priority) {
  this.priority = priority;
  return this.save();
};

disputeSchema.methods.resolve = function(resolution) {
  this.status = 'resolved';
  this.resolution = {
    ...resolution,
    resolvedAt: new Date()
  };
  this.closedAt = new Date();
  return this.save();
};

disputeSchema.methods.addEvidence = function(evidence) {
  this.evidence.push({
    ...evidence,
    uploadedAt: new Date()
  });
  return this.save();
};

module.exports = mongoose.model('Dispute', disputeSchema);
