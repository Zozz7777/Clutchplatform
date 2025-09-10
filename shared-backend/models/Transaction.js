const mongoose = require('../shims/mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    default: () => `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  type: {
    type: String,
    required: true,
    enum: ['payment', 'payout', 'refund', 'fee', 'commission', 'bonus', 'penalty']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD']
  },
  description: {
    type: String,
    required: true
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
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer', 'cash', 'check']
  },
  paymentDetails: {
    paymentIntentId: String,
    chargeId: String,
    paypalTransactionId: String,
    bankReference: String,
    checkNumber: String
  },
  fees: {
    platformFee: {
      type: Number,
      default: 0
    },
    processingFee: {
      type: Number,
      default: 0
    },
    taxAmount: {
      type: Number,
      default: 0
    }
  },
  netAmount: {
    type: Number,
    required: true,
    min: 0
  },
  metadata: {
    type: Map,
    of: String
  },
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  failureReason: String,
  refundedAt: Date,
  refundReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true, collection: 'transactions' });

// Indexes
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ userId: 1 });
transactionSchema.index({ mechanicId: 1 });
transactionSchema.index({ bookingId: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
transactionSchema.statics.findByUser = function(userId, options = {}) {
  const match = { userId };
  if (options.type) match.type = options.type;
  if (options.status) match.status = options.status;
  if (options.startDate || options.endDate) {
    match.createdAt = {};
    if (options.startDate) match.createdAt.$gte = new Date(options.startDate);
    if (options.endDate) match.createdAt.$lte = new Date(options.endDate);
  }
  return this.aggregate([
    { $match: match },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userId' } },
    { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'mechanics', localField: 'mechanicId', foreignField: '_id', as: 'mechanicId' } },
    { $unwind: { path: '$mechanicId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'bookings', localField: 'bookingId', foreignField: '_id', as: 'bookingId' } },
    { $unwind: { path: '$bookingId', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } }
  ]);
};

transactionSchema.statics.findByMechanic = function(mechanicId, options = {}) {
  const match = { mechanicId };
  if (options.type) match.type = options.type;
  if (options.status) match.status = options.status;
  if (options.startDate || options.endDate) {
    match.createdAt = {};
    if (options.startDate) match.createdAt.$gte = new Date(options.startDate);
    if (options.endDate) match.createdAt.$lte = new Date(options.endDate);
  }
  return this.aggregate([
    { $match: match },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userId' } },
    { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'mechanics', localField: 'mechanicId', foreignField: '_id', as: 'mechanicId' } },
    { $unwind: { path: '$mechanicId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'bookings', localField: 'bookingId', foreignField: '_id', as: 'bookingId' } },
    { $unwind: { path: '$bookingId', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } }
  ]);
};

transactionSchema.statics.calculateUserBalance = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $group: {
      _id: null,
      totalPayments: { $sum: { $cond: [{ $eq: ['$type', 'payment'] }, '$amount', 0] } },
      totalPayouts: { $sum: { $cond: [{ $eq: ['$type', 'payout'] }, '$amount', 0] } },
      totalRefunds: { $sum: { $cond: [{ $eq: ['$type', 'refund'] }, '$amount', 0] } },
      totalFees: { $sum: { $cond: [{ $eq: ['$type', 'fee'] }, '$amount', 0] } },
      totalCommissions: { $sum: { $cond: [{ $eq: ['$type', 'commission'] }, '$amount', 0] } }
    }}
  ]);
};

transactionSchema.statics.calculateMechanicEarnings = function(mechanicId, period) {
  const query = { mechanicId: mongoose.Types.ObjectId(mechanicId) };
  if (period) {
    query.createdAt = { $gte: new Date(period.startDate), $lte: new Date(period.endDate) };
  }
  
  return this.aggregate([
    { $match: query },
    { $group: {
      _id: null,
      totalEarnings: { $sum: { $cond: [{ $eq: ['$type', 'commission'] }, '$amount', 0] } },
      totalPayouts: { $sum: { $cond: [{ $eq: ['$type', 'payout'] }, '$amount', 0] } },
      totalFees: { $sum: { $cond: [{ $eq: ['$type', 'fee'] }, '$amount', 0] } },
      pendingAmount: { $sum: { $cond: [{ $and: [{ $eq: ['$type', 'commission'] }, { $eq: ['$status', 'completed'] }] }, '$amount', 0] } }
    }}
  ]);
};

// Instance methods
transactionSchema.methods.processTransaction = function() {
  this.status = 'processing';
  this.processedAt = new Date();
  return this.save();
};

transactionSchema.methods.completeTransaction = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

transactionSchema.methods.failTransaction = function(reason) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failureReason = reason;
  return this.save();
};

transactionSchema.methods.refundTransaction = function(reason) {
  this.status = 'refunded';
  this.refundedAt = new Date();
  this.refundReason = reason;
  return this.save();
};

transactionSchema.methods.calculateNetAmount = function() {
  const totalFees = this.fees.platformFee + this.fees.processingFee + this.fees.taxAmount;
  this.netAmount = this.amount - totalFees;
  return this.netAmount;
};

module.exports = mongoose.model('Transaction', transactionSchema);
