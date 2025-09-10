const mongoose = require('../shims/mongoose');

const paymentPlanSchema = new mongoose.Schema({
  planId: {
    type: String,
    required: true,
    default: () => `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
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
  interval: {
    type: String,
    required: true,
    enum: ['one-time', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']
  },
  intervalCount: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  trialPeriodDays: {
    type: Number,
    default: 0,
    min: 0
  },
  maxInstallments: {
    type: Number,
    default: 1,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  features: [{
    name: String,
    description: String,
    included: {
      type: Boolean,
      default: true
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
  }
}, {
  timestamps: true
});

// Indexes for performance
paymentPlanSchema.index({ planId: 1 });
paymentPlanSchema.index({ isActive: 1 });
paymentPlanSchema.index({ currency: 1 });
paymentPlanSchema.index({ interval: 1 });

// Pre-save middleware
paymentPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
paymentPlanSchema.statics.findActivePlans = function() {
  return this.find({ isActive: true }).sort({ amount: 1 });
};

paymentPlanSchema.statics.findByCurrency = function(currency) {
  return this.find({ currency, isActive: true }).sort({ amount: 1 });
};

// Instance methods
paymentPlanSchema.methods.calculateTotalAmount = function(installments = 1) {
  if (this.interval === 'one-time') {
    return this.amount;
  }
  return this.amount * installments;
};

paymentPlanSchema.methods.getNextBillingDate = function(currentDate = new Date()) {
  if (this.interval === 'one-time') {
    return null;
  }
  
  const date = new Date(currentDate);
  switch (this.interval) {
    case 'daily':
      date.setDate(date.getDate() + this.intervalCount);
      break;
    case 'weekly':
      date.setDate(date.getDate() + (7 * this.intervalCount));
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + this.intervalCount);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + (3 * this.intervalCount));
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + this.intervalCount);
      break;
  }
  return date;
};

module.exports = mongoose.model('PaymentPlan', paymentPlanSchema);
