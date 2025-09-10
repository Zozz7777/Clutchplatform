const mongoose = require('../shims/mongoose');

const payoutSchema = new mongoose.Schema({
  payoutId: {
    type: String,
    required: true,
    default: () => `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  mechanicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mechanic',
    required: true
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
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['bank_transfer', 'paypal', 'stripe', 'cash', 'check']
  },
  paymentDetails: {
    accountNumber: String,
    routingNumber: String,
    paypalEmail: String,
    stripeAccountId: String,
    checkNumber: String
  },
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  jobsIncluded: [{
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    amount: Number,
    commission: Number
  }],
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
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  failureReason: String,
  notes: String,
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
  }
}, { timestamps: true });

// Indexes
payoutSchema.index({ payoutId: 1 });
payoutSchema.index({ mechanicId: 1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ createdAt: -1 });
payoutSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });

// Pre-save middleware
payoutSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
payoutSchema.statics.findByMechanic = function(mechanicId, options = {}) {
  const query = { mechanicId };
  if (options.status) query.status = options.status;
  if (options.startDate) query['period.startDate'] = { $gte: new Date(options.startDate) };
  if (options.endDate) query['period.endDate'] = { $lte: new Date(options.endDate) };
  
  return this.find(query)
    .populate('mechanicId', 'firstName lastName email phoneNumber')
    .populate('jobsIncluded.bookingId', 'bookingId serviceName amount')
    .sort({ createdAt: -1 });
};

payoutSchema.statics.findPendingPayouts = function() {
  return this.find({ status: 'pending' })
    .populate('mechanicId', 'firstName lastName email phoneNumber')
    .sort({ createdAt: 1 });
};

payoutSchema.statics.calculateTotalPayouts = function(mechanicId, period) {
  const query = { mechanicId };
  if (period) {
    query['period.startDate'] = { $gte: new Date(period.startDate) };
    query['period.endDate'] = { $lte: new Date(period.endDate) };
  }
  
  return this.aggregate([
    { $match: query },
    { $group: {
      _id: null,
      totalAmount: { $sum: '$amount' },
      totalNetAmount: { $sum: '$netAmount' },
      totalFees: { $sum: { $add: ['$fees.platformFee', '$fees.processingFee', '$fees.taxAmount'] } },
      count: { $sum: 1 }
    }}
  ]);
};

// Instance methods
payoutSchema.methods.processPayout = function() {
  this.status = 'processing';
  this.processedAt = new Date();
  return this.save();
};

payoutSchema.methods.completePayout = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

payoutSchema.methods.failPayout = function(reason) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failureReason = reason;
  return this.save();
};

payoutSchema.methods.cancelPayout = function() {
  this.status = 'cancelled';
  this.updatedAt = new Date();
  return this.save();
};

payoutSchema.methods.calculateNetAmount = function() {
  const totalFees = this.fees.platformFee + this.fees.processingFee + this.fees.taxAmount;
  this.netAmount = this.amount - totalFees;
  return this.netAmount;
};

module.exports = mongoose.model('Payout', payoutSchema);
