const mongoose = require('../shims/mongoose');

const subscriptionSchema = new mongoose.Schema({
  subscriptionId: {
    type: String,
    required: true,
    default: () => `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentPlan',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing', 'paused'],
    default: 'active'
  },
  currentPeriodStart: {
    type: Date,
    required: true,
    default: Date.now
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  trialStart: {
    type: Date
  },
  trialEnd: {
    type: Date
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  canceledAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer']
  },
  paymentMethodId: {
    type: String,
    required: true
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  lastPaymentDate: {
    type: Date
  },
  lastPaymentAmount: {
    type: Number
  },
  failedPaymentAttempts: {
    type: Number,
    default: 0
  },
  maxFailedAttempts: {
    type: Number,
    default: 3
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
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
}, {
  timestamps: true
});

// Indexes for performance
// subscriptionSchema.index({ subscriptionId: 1 }); // Temporarily disabled to resolve duplicate index warning
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });
subscriptionSchema.index({ userId: 1, status: 1 });

// Pre-save middleware
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
subscriptionSchema.statics.findActiveSubscriptions = function() {
  return this.find({ status: 'active' }).populate('userId planId');
};

subscriptionSchema.statics.findExpiringSubscriptions = function(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return this.find({
    currentPeriodEnd: { $lte: date },
    status: 'active'
  }).populate('userId planId');
};

subscriptionSchema.statics.findFailedPayments = function() {
  return this.find({
    failedPaymentAttempts: { $gte: 1 },
    status: { $in: ['past_due', 'unpaid'] }
  }).populate('userId planId');
};

// Instance methods
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' || this.status === 'trialing';
};

subscriptionSchema.methods.isExpired = function() {
  return new Date() > this.currentPeriodEnd;
};

subscriptionSchema.methods.isTrialActive = function() {
  if (!this.trialStart || !this.trialEnd) return false;
  const now = new Date();
  return now >= this.trialStart && now <= this.trialEnd;
};

subscriptionSchema.methods.getDaysUntilExpiry = function() {
  const now = new Date();
  const diffTime = this.currentPeriodEnd - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

subscriptionSchema.methods.cancel = function(cancelAtPeriodEnd = true) {
  this.cancelAtPeriodEnd = cancelAtPeriodEnd;
  this.canceledAt = new Date();
  
  if (!cancelAtPeriodEnd) {
    this.status = 'canceled';
    this.endedAt = new Date();
  }
  
  return this.save();
};

subscriptionSchema.methods.renew = function() {
  this.cancelAtPeriodEnd = false;
  this.canceledAt = null;
  this.status = 'active';
  return this.save();
};

subscriptionSchema.methods.recordPayment = function(amount, paymentDate = new Date()) {
  this.lastPaymentDate = paymentDate;
  this.lastPaymentAmount = amount;
  this.failedPaymentAttempts = 0;
  this.status = 'active';
  return this.save();
};

subscriptionSchema.methods.recordFailedPayment = function() {
  this.failedPaymentAttempts += 1;
  
  if (this.failedPaymentAttempts >= this.maxFailedAttempts) {
    this.status = 'unpaid';
  } else {
    this.status = 'past_due';
  }
  
  return this.save();
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
