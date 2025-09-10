const mongoose = require('../shims/mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    default: () => `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  mechanicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mechanic'
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
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer', 'cash', 'check']
  },
  paymentDetails: {
    transactionId: String,
    paymentIntentId: String,
    chargeId: String,
    receiptUrl: String,
    failureCode: String,
    failureMessage: String
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
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    processedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
  completedAt: Date,
  failedAt: Date
}, { timestamps: true, collection: 'payments' });

// Indexes
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ mechanicId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });
paymentSchema.index({ createdAt: -1 });

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
paymentSchema.statics.findByUser = function(userId, options = {}) {
  const match = { userId };
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
    { $lookup: { from: 'bookings', localField: 'bookingId', foreignField: '_id', as: 'bookingId' } },
    { $unwind: { path: '$bookingId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'mechanics', localField: 'mechanicId', foreignField: '_id', as: 'mechanicId' } },
    { $unwind: { path: '$mechanicId', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } }
  ]);
};

paymentSchema.statics.findByMechanic = function(mechanicId, options = {}) {
  const match = { mechanicId };
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
    { $lookup: { from: 'bookings', localField: 'bookingId', foreignField: '_id', as: 'bookingId' } },
    { $unwind: { path: '$bookingId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'mechanics', localField: 'mechanicId', foreignField: '_id', as: 'mechanicId' } },
    { $unwind: { path: '$mechanicId', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } }
  ]);
};

paymentSchema.statics.findPendingPayments = function() {
  return this.aggregate([
    { $match: { status: 'pending' } },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userId' } },
    { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'bookings', localField: 'bookingId', foreignField: '_id', as: 'bookingId' } },
    { $unwind: { path: '$bookingId', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: 1 } }
  ]);
};

paymentSchema.statics.calculateUserTotals = function(userId, period) {
  const query = { userId: mongoose.Types.ObjectId(userId) };
  if (period) {
    query.createdAt = { $gte: new Date(period.startDate), $lte: new Date(period.endDate) };
  }

  return this.aggregate([
    { $match: query },
    { $group: {
      _id: null,
      totalAmount: { $sum: '$amount' },
      totalCompleted: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
      totalPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
      totalFailed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, '$amount', 0] } },
      count: { $sum: 1 }
    }}
  ]);
};

// Instance methods
paymentSchema.methods.processPayment = function() {
  this.status = 'processing';
  return this.save();
};

paymentSchema.methods.completePayment = function(paymentDetails) {
  this.status = 'completed';
  this.paymentDetails = { ...this.paymentDetails, ...paymentDetails };
  this.completedAt = new Date();
  return this.save();
};

paymentSchema.methods.failPayment = function(failureDetails) {
  this.status = 'failed';
  this.paymentDetails = { ...this.paymentDetails, ...failureDetails };
  this.failedAt = new Date();
  return this.save();
};

paymentSchema.methods.cancelPayment = function() {
  this.status = 'cancelled';
  return this.save();
};

paymentSchema.methods.refundPayment = function(refundData) {
  this.refunds.push({
    refundId: `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: refundData.amount,
    reason: refundData.reason,
    processedAt: new Date()
  });
  
  if (refundData.amount >= this.amount) {
    this.status = 'refunded';
  }
  
  return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema);
