const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  pointsBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  totalRedeemed: {
    type: Number,
    default: 0
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze',
    index: true
  },
  badges: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['achievement', 'milestone', 'special', 'seasonal'],
      default: 'achievement'
    }
  }],
  history: [{
    actionType: {
      type: String,
      enum: ['earn', 'redeem', 'bonus', 'penalty', 'expire'],
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    referenceType: {
      type: String,
      enum: ['order', 'review', 'tip', 'referral', 'bonus', 'admin'],
      default: null
    },
    date: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: null
    }
  }],
  preferences: {
    notifications: {
      pointsEarned: {
        type: Boolean,
        default: true
      },
      badgeUnlocked: {
        type: Boolean,
        default: true
      },
      tierUpgrade: {
        type: Boolean,
        default: true
      },
      pointsExpiring: {
        type: Boolean,
        default: true
      }
    },
    autoRedeem: {
      enabled: {
        type: Boolean,
        default: false
      },
      threshold: {
        type: Number,
        default: 1000
      },
      rewardType: {
        type: String,
        enum: ['discount', 'cashback', 'gift'],
        default: 'discount'
      }
    }
  },
  stats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    totalTips: {
      type: Number,
      default: 0
    },
    totalReferrals: {
      type: Number,
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    },
    lastActivityDate: {
      type: Date,
      default: Date.now
    }
  },
  language: {
    type: String,
    enum: ['en', 'ar'],
    default: 'en'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
loyaltySchema.index({ pointsBalance: -1 });
loyaltySchema.index({ tier: 1, pointsBalance: -1 });
loyaltySchema.index({ 'history.date': -1 });
loyaltySchema.index({ 'stats.lastActivityDate': -1 });

// Virtual for next tier requirements
loyaltySchema.virtual('nextTier').get(function() {
  const tierRequirements = {
    bronze: { next: 'silver', required: 1000 },
    silver: { next: 'gold', required: 5000 },
    gold: { next: 'platinum', required: 15000 },
    platinum: { next: null, required: null }
  };
  
  return tierRequirements[this.tier];
});

// Virtual for tier progress percentage
loyaltySchema.virtual('tierProgress').get(function() {
  const tierRequirements = {
    bronze: { min: 0, max: 1000 },
    silver: { min: 1000, max: 5000 },
    gold: { min: 5000, max: 15000 },
    platinum: { min: 15000, max: Infinity }
  };
  
  const current = tierRequirements[this.tier];
  if (!current || current.max === Infinity) return 100;
  
  const progress = ((this.pointsBalance - current.min) / (current.max - current.min)) * 100;
  return Math.min(Math.max(progress, 0), 100);
});

// Pre-save middleware
loyaltySchema.pre('save', function(next) {
  // Update tier based on points
  if (this.pointsBalance >= 15000) {
    this.tier = 'platinum';
  } else if (this.pointsBalance >= 5000) {
    this.tier = 'gold';
  } else if (this.pointsBalance >= 1000) {
    this.tier = 'silver';
  } else {
    this.tier = 'bronze';
  }
  
  next();
});

// Methods
loyaltySchema.methods.addPoints = function(points, description, referenceId = null, referenceType = null, expiresAt = null) {
  this.pointsBalance += points;
  this.totalEarned += points;
  
  this.history.push({
    actionType: 'earn',
    points,
    description,
    referenceId,
    referenceType,
    date: new Date(),
    expiresAt
  });
  
  return this.save();
};

loyaltySchema.methods.redeemPoints = function(points, description, referenceId = null, referenceType = null) {
  if (this.pointsBalance < points) {
    throw new Error('Insufficient points balance');
  }
  
  this.pointsBalance -= points;
  this.totalRedeemed += points;
  
  this.history.push({
    actionType: 'redeem',
    points: -points,
    description,
    referenceId,
    referenceType,
    date: new Date()
  });
  
  return this.save();
};

loyaltySchema.methods.addBadge = function(name, description, icon, category = 'achievement') {
  // Check if badge already exists
  const existingBadge = this.badges.find(badge => badge.name === name);
  if (existingBadge) {
    return this;
  }
  
  this.badges.push({
    name,
    description,
    icon,
    category,
    unlockedAt: new Date()
  });
  
  return this.save();
};

loyaltySchema.methods.updateStats = function(statType, increment = 1) {
  if (this.stats[statType] !== undefined) {
    this.stats[statType] += increment;
  }
  this.stats.lastActivityDate = new Date();
  return this.save();
};

loyaltySchema.methods.checkAndAwardBadges = async function() {
  const badges = [];
  
  // First Order Badge
  if (this.stats.totalOrders === 1 && !this.badges.find(b => b.name === 'First Order')) {
    badges.push({
      name: 'First Order',
      description: 'Completed your first order',
      icon: '🎉',
      category: 'milestone'
    });
  }
  
  // Loyal Owner Badge
  if (this.stats.totalOrders >= 10 && !this.badges.find(b => b.name === 'Loyal Owner')) {
    badges.push({
      name: 'Loyal Owner',
      description: 'Completed 10+ orders',
      icon: '🏆',
      category: 'milestone'
    });
  }
  
  // Power User Badge
  if (this.pointsBalance >= 1000 && !this.badges.find(b => b.name === 'Power User')) {
    badges.push({
      name: 'Power User',
      description: 'Earned 1000+ points',
      icon: '⚡',
      category: 'achievement'
    });
  }
  
  // Community Starter Badge
  if (this.stats.totalTips >= 1 && !this.badges.find(b => b.name === 'Community Starter')) {
    badges.push({
      name: 'Community Starter',
      description: 'Shared your first tip',
      icon: '💡',
      category: 'achievement'
    });
  }
  
  // Review Master Badge
  if (this.stats.totalReviews >= 5 && !this.badges.find(b => b.name === 'Review Master')) {
    badges.push({
      name: 'Review Master',
      description: 'Left 5+ helpful reviews',
      icon: '⭐',
      category: 'achievement'
    });
  }
  
  // Add all new badges
  for (const badge of badges) {
    await this.addBadge(badge.name, badge.description, badge.icon, badge.category);
  }
  
  return badges;
};

loyaltySchema.methods.getExpiringPoints = function(days = 30) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  return this.history.filter(entry => 
    entry.expiresAt && 
    entry.expiresAt <= expiryDate && 
    entry.actionType === 'earn'
  );
};

module.exports = mongoose.model('Loyalty', loyaltySchema);
