const mongoose = require('../shims/mongoose');

const partnerPaymentSchema = new mongoose.Schema({
  // Payment Information
  paymentId: {
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
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'EGP',
    required: true
  },
  
  // Payment Type
  paymentType: {
    type: String,
    enum: ['weekly_payout', 'bonus', 'commission', 'refund', 'adjustment'],
    required: true
  },
  
  // Status Information
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Payment Method
  paymentMethod: {
    type: {
      type: String,
      enum: ['bank_transfer', 'digital_wallet', 'check', 'cash'],
      required: true
    },
    details: {
      bankName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      accountHolderName: { type: String, trim: true },
      routingNumber: { type: String, trim: true },
      walletProvider: { type: String, trim: true },
      walletAddress: { type: String, trim: true }
    }
  },
  
  // Date Information
  scheduledDate: {
    type: Date,
    required: true
  },
  processedDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  
  // Period Information (for weekly payouts)
  period: {
    startDate: { type: Date },
    endDate: { type: Date },
    weekNumber: { type: Number },
    year: { type: Number }
  },
  
  // Related Orders
  relatedOrders: [{
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    commission: { type: Number, default: 0 }
  }],
  
  // Financial Breakdown
  breakdown: {
    totalEarnings: { type: Number, required: true, min: 0 },
    commission: { type: Number, default: 0, min: 0 },
    fees: { type: Number, default: 0, min: 0 },
    taxes: { type: Number, default: 0, min: 0 },
    netAmount: { type: Number, required: true, min: 0 }
  },
  
  // Transaction Information
  transaction: {
    reference: { type: String, trim: true },
    externalId: { type: String, trim: true },
    gateway: { type: String, trim: true },
    fees: { type: Number, default: 0 },
    exchangeRate: { type: Number, default: 1 }
  },
  
  // Notes and Comments
  notes: {
    internal: { type: String, trim: true },
    partner: { type: String, trim: true },
    admin: { type: String, trim: true }
  },
  
  // Failure Information
  failure: {
    reason: { type: String, trim: true },
    code: { type: String, trim: true },
    retryCount: { type: Number, default: 0 },
    lastRetryDate: { type: Date },
    maxRetries: { type: Number, default: 3 }
  },
  
  // Approval Information
  approval: {
    required: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    approvalNotes: { type: String, trim: true }
  },
  
  // Notification Information
  notifications: {
    sentToPartner: { type: Boolean, default: false },
    sentAt: { type: Date },
    notificationMethod: { type: String, enum: ['email', 'sms', 'push', 'in_app'] }
  },
  
  // Metadata
  metadata: {
    source: { type: String, default: 'clutch_system' },
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
partnerPaymentSchema.index({ paymentId: 1 });
partnerPaymentSchema.index({ partnerId: 1 });
partnerPaymentSchema.index({ status: 1 });
partnerPaymentSchema.index({ paymentType: 1 });
partnerPaymentSchema.index({ scheduledDate: 1 });
partnerPaymentSchema.index({ processedDate: 1 });
partnerPaymentSchema.index({ completedDate: 1 });
partnerPaymentSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });
partnerPaymentSchema.index({ createdAt: -1 });
partnerPaymentSchema.index({ updatedAt: -1 });

// Compound indexes
partnerPaymentSchema.index({ partnerId: 1, status: 1 });
partnerPaymentSchema.index({ partnerId: 1, paymentType: 1 });
partnerPaymentSchema.index({ partnerId: 1, scheduledDate: 1 });
partnerPaymentSchema.index({ status: 1, scheduledDate: 1 });

// Virtuals
partnerPaymentSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

partnerPaymentSchema.virtual('isProcessing').get(function() {
  return this.status === 'processing';
});

partnerPaymentSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

partnerPaymentSchema.virtual('isFailed').get(function() {
  return this.status === 'failed';
});

partnerPaymentSchema.virtual('canRetry').get(function() {
  return this.status === 'failed' && this.failure.retryCount < this.failure.maxRetries;
});

partnerPaymentSchema.virtual('isOverdue').get(function() {
  return this.scheduledDate < new Date() && this.status === 'pending';
});

partnerPaymentSchema.virtual('formattedAmount').get(function() {
  return `${this.amount.toFixed(2)} ${this.currency}`;
});

// Pre-save middleware
partnerPaymentSchema.pre('save', function(next) {
  // Generate payment ID if not provided
  if (!this.paymentId) {
    this.paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Calculate net amount
  this.breakdown.netAmount = this.breakdown.totalEarnings - this.breakdown.commission - this.breakdown.fees - this.breakdown.taxes;
  
  // Set amount to net amount
  this.amount = this.breakdown.netAmount;
  
  // Set period information for weekly payouts
  if (this.paymentType === 'weekly_payout' && this.period.startDate && this.period.endDate) {
    const startDate = new Date(this.period.startDate);
    this.period.weekNumber = this.getWeekNumber(startDate);
    this.period.year = startDate.getFullYear();
  }
  
  next();
});

// Instance methods
partnerPaymentSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  
  if (newStatus === 'processing') {
    this.processedDate = new Date();
  } else if (newStatus === 'completed') {
    this.completedDate = new Date();
    this.processedDate = this.processedDate || new Date();
  } else if (newStatus === 'failed') {
    this.failure.retryCount += 1;
    this.failure.lastRetryDate = new Date();
  }
  
  if (notes) {
    this.notes.admin = notes;
  }
  
  return this.save();
};

partnerPaymentSchema.methods.retry = function() {
  if (this.canRetry) {
    this.status = 'pending';
    this.failure.retryCount += 1;
    this.failure.lastRetryDate = new Date();
    return this.save();
  }
  throw new Error('Payment cannot be retried');
};

partnerPaymentSchema.methods.approve = function(approvedBy, notes = '') {
  this.approval.approvedBy = approvedBy;
  this.approval.approvedAt = new Date();
  this.approval.approvalNotes = notes;
  return this.save();
};

partnerPaymentSchema.methods.addRelatedOrder = function(orderId, amount, commission = 0) {
  this.relatedOrders.push({
    orderId,
    amount,
    commission
  });
  
  // Update breakdown
  this.breakdown.totalEarnings += amount;
  this.breakdown.commission += commission;
  this.breakdown.netAmount = this.breakdown.totalEarnings - this.breakdown.commission - this.breakdown.fees - this.breakdown.taxes;
  this.amount = this.breakdown.netAmount;
  
  return this.save();
};

partnerPaymentSchema.methods.getWeekNumber = function(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
};

// Static methods
partnerPaymentSchema.statics.findByPartner = function(partnerId, filters = {}) {
  const query = { partnerId, ...filters };
  return this.find(query).sort({ createdAt: -1 });
};

partnerPaymentSchema.statics.findWeeklyPayouts = function(partnerId) {
  return this.find({ 
    partnerId, 
    paymentType: 'weekly_payout' 
  }).sort({ scheduledDate: -1 });
};

partnerPaymentSchema.statics.findPendingPayments = function(partnerId) {
  return this.find({ 
    partnerId, 
    status: 'pending' 
  }).sort({ scheduledDate: 1 });
};

partnerPaymentSchema.statics.findCompletedPayments = function(partnerId) {
  return this.find({ 
    partnerId, 
    status: 'completed' 
  }).sort({ completedDate: -1 });
};

partnerPaymentSchema.statics.findFailedPayments = function(partnerId) {
  return this.find({ 
    partnerId, 
    status: 'failed' 
  }).sort({ createdAt: -1 });
};

partnerPaymentSchema.statics.findByDateRange = function(partnerId, startDate, endDate) {
  return this.find({
    partnerId,
    scheduledDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ scheduledDate: -1 });
};

partnerPaymentSchema.statics.getPaymentStats = function(partnerId) {
  return this.aggregate([
    { $match: { partnerId } },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        pendingAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
        },
        completedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        },
        failedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, '$amount', 0] }
        },
        averagePayment: { $avg: '$amount' },
        lastPaymentDate: { $max: '$completedDate' }
      }
    }
  ]);
};

partnerPaymentSchema.statics.getWeeklyPayoutStats = function(partnerId) {
  return this.aggregate([
    { 
      $match: { 
        partnerId, 
        paymentType: 'weekly_payout',
        status: 'completed'
      } 
    },
    {
      $group: {
        _id: {
          year: '$period.year',
          week: '$period.weekNumber'
        },
        amount: { $sum: '$amount' },
        count: { $sum: 1 },
        date: { $max: '$completedDate' }
      }
    },
    { $sort: { '_id.year': -1, '_id.week': -1 } }
  ]);
};

partnerPaymentSchema.statics.createWeeklyPayout = function(partnerId, startDate, endDate, orders, paymentMethod) {
  const totalEarnings = orders.reduce((sum, order) => sum + order.partnerEarnings, 0);
  const totalCommission = orders.reduce((sum, order) => sum + order.commission, 0);
  
  const payment = new this({
    partnerId,
    paymentType: 'weekly_payout',
    amount: totalEarnings - totalCommission,
    currency: 'EGP',
    paymentMethod,
    scheduledDate: endDate,
    period: {
      startDate,
      endDate
    },
    relatedOrders: orders.map(order => ({
      orderId: order.orderId,
      amount: order.partnerEarnings,
      commission: order.commission
    })),
    breakdown: {
      totalEarnings,
      commission: totalCommission,
      fees: 0,
      taxes: 0,
      netAmount: totalEarnings - totalCommission
    }
  });
  
  return payment.save();
};

module.exports = mongoose.model('PartnerPayment', partnerPaymentSchema);
