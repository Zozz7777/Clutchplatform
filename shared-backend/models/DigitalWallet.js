const mongoose = require('../shims/mongoose');

const digitalWalletSchema = new mongoose.Schema({
  walletId: {
    type: String,
    required: true,
    default: () => `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
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
    enum: ['active', 'suspended', 'closed', 'pending_verification'],
    default: 'pending_verification'
  },
  walletType: {
    type: String,
    required: true,
    enum: ['personal', 'business', 'fleet'],
    default: 'personal'
  },
  verificationStatus: {
    type: String,
    required: true,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified'
  },
  dailyLimit: {
    type: Number,
    default: 1000,
    min: 0
  },
  monthlyLimit: {
    type: Number,
    default: 10000,
    min: 0
  },
  dailySpent: {
    type: Number,
    default: 0,
    min: 0
  },
  monthlySpent: {
    type: Number,
    default: 0,
    min: 0
  },
  lastTransactionDate: {
    type: Date
  },
  linkedPaymentMethods: [{
    paymentMethodId: String,
    paymentMethodType: {
      type: String,
      enum: ['stripe', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer']
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  securitySettings: {
    requirePin: {
      type: Boolean,
      default: true
    },
    requireBiometric: {
      type: Boolean,
      default: false
    },
    maxTransactionAmount: {
      type: Number,
      default: 500
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    }
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
digitalWalletSchema.index({ walletId: 1 });
digitalWalletSchema.index({ userId: 1 });
digitalWalletSchema.index({ status: 1 });
digitalWalletSchema.index({ verificationStatus: 1 });
digitalWalletSchema.index({ userId: 1, status: 1 });

// Pre-save middleware
digitalWalletSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
digitalWalletSchema.statics.findActiveWallets = function() {
  return this.find({ status: 'active' }).populate('userId');
};

digitalWalletSchema.statics.findByUserId = function(userId) {
  return this.find({ userId, status: { $ne: 'closed' } }).populate('userId');
};

digitalWalletSchema.statics.findPendingVerification = function() {
  return this.find({ verificationStatus: 'pending' }).populate('userId');
};

// Instance methods
digitalWalletSchema.methods.isActive = function() {
  return this.status === 'active';
};

digitalWalletSchema.methods.isVerified = function() {
  return this.verificationStatus === 'verified';
};

digitalWalletSchema.methods.canMakeTransaction = function(amount) {
  if (!this.isActive() || !this.isVerified()) {
    return false;
  }
  
  if (amount > this.balance) {
    return false;
  }
  
  if (amount > this.dailyLimit - this.dailySpent) {
    return false;
  }
  
  if (amount > this.monthlyLimit - this.monthlySpent) {
    return false;
  }
  
  if (amount > this.securitySettings.maxTransactionAmount) {
    return false;
  }
  
  return true;
};

digitalWalletSchema.methods.addFunds = function(amount, source = 'external') {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  this.balance += amount;
  this.lastTransactionDate = new Date();
  
  // Reset daily spent if it's a new day
  const today = new Date().toDateString();
  const lastTransactionDay = this.lastTransactionDate ? 
    new Date(this.lastTransactionDate).toDateString() : null;
  
  if (lastTransactionDay !== today) {
    this.dailySpent = 0;
  }
  
  return this.save();
};

digitalWalletSchema.methods.deductFunds = function(amount, description = '') {
  if (!this.canMakeTransaction(amount)) {
    throw new Error('Insufficient funds or transaction not allowed');
  }
  
  this.balance -= amount;
  this.dailySpent += amount;
  this.monthlySpent += amount;
  this.lastTransactionDate = new Date();
  
  return this.save();
};

digitalWalletSchema.methods.addPaymentMethod = function(paymentMethodId, paymentMethodType, isDefault = false) {
  if (isDefault) {
    // Remove default from other payment methods
    this.linkedPaymentMethods.forEach(method => {
      method.isDefault = false;
    });
  }
  
  this.linkedPaymentMethods.push({
    paymentMethodId,
    paymentMethodType,
    isDefault,
    addedAt: new Date()
  });
  
  return this.save();
};

digitalWalletSchema.methods.removePaymentMethod = function(paymentMethodId) {
  this.linkedPaymentMethods = this.linkedPaymentMethods.filter(
    method => method.paymentMethodId !== paymentMethodId
  );
  
  return this.save();
};

digitalWalletSchema.methods.setDefaultPaymentMethod = function(paymentMethodId) {
  this.linkedPaymentMethods.forEach(method => {
    method.isDefault = method.paymentMethodId === paymentMethodId;
  });
  
  return this.save();
};

digitalWalletSchema.methods.verify = function() {
  this.verificationStatus = 'verified';
  this.status = 'active';
  return this.save();
};

digitalWalletSchema.methods.suspend = function() {
  this.status = 'suspended';
  return this.save();
};

digitalWalletSchema.methods.activate = function() {
  if (this.verificationStatus === 'verified') {
    this.status = 'active';
    return this.save();
  }
  throw new Error('Wallet must be verified before activation');
};

digitalWalletSchema.methods.close = function() {
  if (this.balance > 0) {
    throw new Error('Cannot close wallet with remaining balance');
  }
  
  this.status = 'closed';
  return this.save();
};

digitalWalletSchema.methods.getAvailableBalance = function() {
  return this.balance;
};

digitalWalletSchema.methods.getDailyRemaining = function() {
  return this.dailyLimit - this.dailySpent;
};

digitalWalletSchema.methods.getMonthlyRemaining = function() {
  return this.monthlyLimit - this.monthlySpent;
};

module.exports = mongoose.model('DigitalWallet', digitalWalletSchema);
