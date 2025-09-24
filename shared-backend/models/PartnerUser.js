const mongoose = require('../shims/mongoose');

const partnerUserSchema = new mongoose.Schema({
  // Basic Information
  partnerId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Partner Information
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  partnerType: {
    type: String,
    enum: ['repair_center', 'auto_parts_shop', 'accessories_shop', 'importer_manufacturer', 'service_center'],
    required: true
  },
  
  // Business Details
  businessAddress: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'Egypt' },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  
  // Working Hours
  workingHours: {
    monday: { open: String, close: String, available: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, available: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, available: { type: Boolean, default: true } },
    thursday: { open: String, close: String, available: { type: Boolean, default: true } },
    friday: { open: String, close: String, available: { type: Boolean, default: true } },
    saturday: { open: String, close: String, available: { type: Boolean, default: true } },
    sunday: { open: String, close: String, available: { type: Boolean, default: true } }
  },
  
  // Business Settings
  businessSettings: {
    logo: { type: String },
    description: { type: String, trim: true },
    services: [{ type: String, trim: true }],
    isConnectedToPartsSystem: { type: Boolean, default: false },
    partsSystemCredentials: {
      apiKey: { type: String },
      endpoint: { type: String }
    }
  },
  
  // Status and Verification
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'terminated'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String
  },
  verificationExpires: {
    type: Date
  },
  
  // Role-Based Access Control
  role: {
    type: String,
    enum: ['owner', 'manager', 'staff', 'accountant'],
    default: 'owner'
  },
  permissions: [{
    type: String,
    enum: [
      'view_orders', 'manage_orders', 'view_payments', 'manage_payments',
      'view_settings', 'manage_settings', 'view_dashboard', 'manage_dashboard',
      'view_invoices', 'manage_invoices', 'view_analytics', 'manage_analytics'
    ]
  }],
  
  // Financial Information
  financial: {
    currency: { type: String, default: 'EGP' },
    weeklyIncome: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    pendingPayout: { type: Number, default: 0 },
    lastPayoutDate: { type: Date },
    nextPayoutDate: { type: Date },
    payoutMethod: {
      type: { type: String, enum: ['bank_transfer', 'digital_wallet'], default: 'bank_transfer' },
      details: { type: mongoose.Schema.Types.Mixed }
    }
  },
  
  // Device and Session Management
  deviceTokens: [{
    token: { type: String, required: true },
    platform: { type: String, enum: ['android', 'ios'], required: true },
    lastUsed: { type: Date, default: Date.now }
  }],
  
  // Notification Preferences
  notificationPreferences: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    newOrder: { type: Boolean, default: true },
    paymentUpdate: { type: Boolean, default: true },
    payoutNotification: { type: Boolean, default: true }
  },
  
  // App Preferences
  appPreferences: {
    language: { type: String, enum: ['ar', 'en'], default: 'ar' },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    currency: { type: String, default: 'EGP' }
  },
  
  // Audit Trail
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  
  // Request to Join (for new partners)
  joinRequest: {
    businessName: { type: String, trim: true },
    ownerName: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    address: { type: String, trim: true },
    partnerType: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    notes: { type: String, trim: true }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
partnerUserSchema.index({ email: 1 });
partnerUserSchema.index({ phone: 1 });
partnerUserSchema.index({ partnerId: 1 });
partnerUserSchema.index({ status: 1 });
partnerUserSchema.index({ partnerType: 1 });
partnerUserSchema.index({ 'businessAddress.city': 1 });
partnerUserSchema.index({ 'joinRequest.status': 1 });

// Virtuals
partnerUserSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

partnerUserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

partnerUserSchema.virtual('fullBusinessAddress').get(function() {
  const addr = this.businessAddress;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Pre-save middleware
partnerUserSchema.pre('save', function(next) {
  // Set default permissions based on role
  if (this.isNew) {
    this.setDefaultPermissions();
  }
  next();
});

// Instance methods
partnerUserSchema.methods.setDefaultPermissions = function() {
  const rolePermissions = {
    owner: [
      'view_orders', 'manage_orders', 'view_payments', 'manage_payments',
      'view_settings', 'manage_settings', 'view_dashboard', 'manage_dashboard',
      'view_invoices', 'manage_invoices', 'view_analytics', 'manage_analytics'
    ],
    manager: [
      'view_orders', 'manage_orders', 'view_payments', 'view_settings', 'manage_settings',
      'view_dashboard', 'view_invoices', 'manage_invoices', 'view_analytics'
    ],
    staff: [
      'view_orders', 'manage_orders', 'view_invoices', 'manage_invoices'
    ],
    accountant: [
      'view_orders', 'view_payments', 'view_invoices', 'view_analytics'
    ]
  };
  
  this.permissions = rolePermissions[this.role] || rolePermissions.staff;
};

partnerUserSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

partnerUserSchema.methods.canAccess = function(feature) {
  const featurePermissions = {
    orders: ['view_orders'],
    payments: ['view_payments'],
    settings: ['view_settings'],
    dashboard: ['view_dashboard'],
    invoices: ['view_invoices'],
    analytics: ['view_analytics']
  };
  
  const requiredPermissions = featurePermissions[feature] || [];
  return requiredPermissions.some(permission => this.hasPermission(permission));
};

partnerUserSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) }; // 2 hours
  }
  
  return this.updateOne(updates);
};

partnerUserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static methods
partnerUserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

partnerUserSchema.statics.findByPhone = function(phone) {
  return this.findOne({ phone });
};

partnerUserSchema.statics.findByPartnerId = function(partnerId) {
  return this.findOne({ partnerId });
};

partnerUserSchema.statics.findActivePartners = function() {
  return this.find({ status: 'active' });
};

partnerUserSchema.statics.findByType = function(partnerType) {
  return this.find({ partnerType, status: 'active' });
};

partnerUserSchema.statics.findByLocation = function(latitude, longitude, radius = 50) {
  return this.find({
    'businessAddress.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radius * 1000 // Convert km to meters
      }
    },
    status: 'active'
  });
};

module.exports = mongoose.model('PartnerUser', partnerUserSchema);
