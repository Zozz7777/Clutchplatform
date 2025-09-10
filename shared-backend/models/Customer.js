const mongoose = require('../shims/mongoose');

const customerSchema = new mongoose.Schema({
  // Basic Information
  basicInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
    profilePicture: { type: String },
    website: { type: String },
    socialMedia: {
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String
    }
  },

  // Company Information (for B2B customers)
  company: {
    name: String,
    industry: String,
    size: { type: String, enum: ['startup', 'small', 'medium', 'large', 'enterprise'] },
    website: String,
    founded: Number,
    revenue: { type: String, enum: ['under-1m', '1m-10m', '10m-50m', '50m-100m', '100m+'] },
    employees: Number,
    taxId: String,
    registrationNumber: String
  },

  // Contact Information
  contact: {
    primaryAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      type: { type: String, enum: ['home', 'work', 'billing', 'shipping'] }
    },
    addresses: [{
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      type: { type: String, enum: ['home', 'work', 'billing', 'shipping'] },
      isDefault: { type: Boolean, default: false }
    }],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
  },

  // Customer Classification
  classification: {
    type: { type: String, enum: ['individual', 'business', 'enterprise'], default: 'individual' },
    tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], default: 'bronze' },
    segment: { type: String, enum: ['new', 'active', 'at-risk', 'churned', 'vip'] },
    source: { type: String, enum: ['website', 'referral', 'social-media', 'advertising', 'partnership', 'cold-outreach', 'other'] },
    tags: [String],
    notes: String
  },

  // Financial Information
  financial: {
    creditLimit: { type: Number, default: 0 },
    paymentTerms: { type: String, default: 'Net 30' },
    preferredPaymentMethod: { type: String, enum: ['credit-card', 'bank-transfer', 'paypal', 'cash', 'check'] },
    taxExempt: { type: Boolean, default: false },
    taxExemptionReason: String,
    currency: { type: String, default: 'USD' },
    billingCycle: { type: String, enum: ['monthly', 'quarterly', 'annually', 'on-demand'] }
  },

  // Preferences & Settings
  preferences: {
    communication: {
      preferredChannel: { type: String, enum: ['email', 'phone', 'sms', 'mail'], default: 'email' },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly'], default: 'monthly' },
      marketingEmails: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false }
    },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'USD' },
    notifications: {
      orderUpdates: { type: Boolean, default: true },
      paymentReminders: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      security: { type: Boolean, default: true }
    }
  },

  // Relationships
  relationships: {
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    accountManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    salesRep: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    supportRep: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }]
  },

  // Interaction History
  interactions: [{
    type: { type: String, enum: ['email', 'phone', 'meeting', 'chat', 'social-media', 'in-person'] },
    direction: { type: String, enum: ['inbound', 'outbound'] },
    subject: String,
    summary: String,
    outcome: String,
    nextAction: String,
    nextActionDate: Date,
    date: { type: Date, default: Date.now },
    duration: Number, // in minutes
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    tags: [String],
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'] }
  }],

  // Purchase History
  purchases: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'] },
    items: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      quantity: Number,
      unitPrice: Number,
      totalPrice: Number
    }],
    paymentMethod: String,
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    }
  }],

  // Service History
  services: [{
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['scheduled', 'in-progress', 'completed', 'cancelled'] },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
  }],

  // Support Tickets
  supportTickets: [{
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket' },
    subject: String,
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'] },
    status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'] },
    category: String,
    createdDate: { type: Date, default: Date.now },
    resolvedDate: Date,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
  }],

  // Documents & Files
  documents: [{
    type: { type: String, enum: ['contract', 'invoice', 'receipt', 'id', 'other'] },
    name: String,
    fileUrl: String,
    uploadDate: { type: Date, default: Date.now },
    expiryDate: Date,
    status: { type: String, enum: ['active', 'expired', 'pending'] }
  }],

  // Analytics & Metrics
  analytics: {
    totalSpent: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    lastPurchaseDate: Date,
    firstPurchaseDate: Date,
    lifetimeValue: { type: Number, default: 0 },
    churnRisk: { type: Number, min: 0, max: 100, default: 0 },
    engagementScore: { type: Number, min: 0, max: 100, default: 0 },
    satisfactionScore: { type: Number, min: 0, max: 100, default: 0 },
    responseTime: { type: Number, default: 0 }, // average response time in hours
    lastActivity: { type: Date, default: Date.now }
  },

  // Status & Lifecycle
  status: { 
    type: String, 
    enum: ['prospect', 'lead', 'customer', 'inactive', 'churned', 'blacklisted'],
    default: 'prospect'
  },
  
  lifecycle: {
    stage: { type: String, enum: ['awareness', 'consideration', 'decision', 'retention', 'advocacy'] },
    stageHistory: [{
      stage: String,
      date: { type: Date, default: Date.now },
      reason: String
    }],
    conversionDate: Date,
    churnDate: Date,
    reactivationDate: Date
  },

  // Notes & Comments
  notes: [{
    note: String,
    category: { type: String, enum: ['general', 'sales', 'support', 'billing', 'internal'] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    createdAt: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: false }
  }],

  // Metadata
  metadata: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    lastUpdated: { type: Date, default: Date.now },
    version: { type: Number, default: 1 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return `${this.basicInfo.firstName} ${this.basicInfo.lastName}`;
});

// Virtual for customer value
customerSchema.virtual('customerValue').get(function() {
  return this.analytics.lifetimeValue;
});

// Virtual for days since last activity
customerSchema.virtual('daysSinceLastActivity').get(function() {
  if (!this.analytics.lastActivity) return 0;
  const today = new Date();
  const lastActivity = new Date(this.analytics.lastActivity);
  const diffTime = today - lastActivity;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes
// Note: basicInfo.email already has unique: true which creates an index automatically
customerSchema.index({ 'basicInfo.firstName': 1, 'basicInfo.lastName': 1 });
customerSchema.index({ 'company.name': 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ 'classification.tier': 1 });
customerSchema.index({ 'classification.segment': 1 });
customerSchema.index({ 'relationships.assignedTo': 1 });
customerSchema.index({ 'analytics.lastActivity': -1 });
customerSchema.index({ 'lifecycle.stage': 1 });

// Pre-save middleware
customerSchema.pre('save', function(next) {
  if (this.isModified('metadata.lastUpdated')) {
    this.metadata.lastUpdated = new Date();
  }
  next();
});

// Static methods
customerSchema.statics.findActiveCustomers = function() {
  return this.find({ status: 'customer' });
};

customerSchema.statics.findByTier = function(tier) {
  return this.find({ 'classification.tier': tier });
};

customerSchema.statics.findBySegment = function(segment) {
  return this.find({ 'classification.segment': segment });
};

customerSchema.statics.findAtRiskCustomers = function() {
  return this.find({ 'classification.segment': 'at-risk' });
};

// Instance methods
customerSchema.methods.addInteraction = function(interaction) {
  this.interactions.push(interaction);
  this.analytics.lastActivity = new Date();
  return this.save();
};

customerSchema.methods.addPurchase = function(purchase) {
  this.purchases.push(purchase);
  this.analytics.totalSpent += purchase.amount;
  this.analytics.orderCount += 1;
  this.analytics.lastPurchaseDate = new Date();
  this.analytics.lifetimeValue = this.analytics.totalSpent;
  
  if (!this.analytics.firstPurchaseDate) {
    this.analytics.firstPurchaseDate = new Date();
  }
  
  this.analytics.averageOrderValue = this.analytics.totalSpent / this.analytics.orderCount;
  return this.save();
};

customerSchema.methods.updateStage = function(newStage, reason) {
  this.lifecycle.stage = newStage;
  this.lifecycle.stageHistory.push({
    stage: newStage,
    reason: reason
  });
  return this.save();
};

customerSchema.methods.addNote = function(note, createdBy, category = 'general', isPrivate = false) {
  this.notes.push({
    note,
    category,
    createdBy,
    isPrivate
  });
  return this.save();
};

customerSchema.methods.updateAnalytics = function(updates) {
  this.analytics = { ...this.analytics, ...updates };
  return this.save();
};

module.exports = mongoose.model('Customer', customerSchema);
