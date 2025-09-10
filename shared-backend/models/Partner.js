const mongoose = require('../shims/mongoose');

const partnerSchema = new mongoose.Schema({
  // Basic Information
  partnerId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['repair_center', 'parts_shop', 'towing_service', 'insurance_provider', 'fleet_operator', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'terminated', 'inactive'],
    default: 'pending'
  },

  // Contact Information
  contact: {
    primaryContact: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      role: { type: String, trim: true }
    },
    secondaryContact: {
      name: { type: String, trim: true },
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
      role: { type: String, trim: true }
    },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      zipCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
      }
    }
  },

  // Business Information
  business: {
    legalName: { type: String, required: true, trim: true },
    taxId: { type: String, trim: true },
    businessLicense: { type: String, trim: true },
    insuranceCertificate: { type: String, trim: true },
    yearsInBusiness: { type: Number, min: 0 },
    employeeCount: { type: Number, min: 0 },
    annualRevenue: { type: Number, min: 0 },
    specialties: [{ type: String, trim: true }],
    certifications: [{
      name: { type: String, required: true, trim: true },
      issuer: { type: String, required: true, trim: true },
      issueDate: { type: Date, required: true },
      expiryDate: { type: Date },
      certificateNumber: { type: String, trim: true },
      status: { type: String, enum: ['active', 'expired', 'pending'], default: 'active' }
    }]
  },

  // Services & Capabilities
  services: {
    offered: [{
      serviceType: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      pricing: {
        basePrice: { type: Number, min: 0 },
        hourlyRate: { type: Number, min: 0 },
        pricingModel: { type: String, enum: ['fixed', 'hourly', 'variable'], default: 'fixed' }
      },
      availability: {
        monday: { open: String, close: String, available: { type: Boolean, default: true } },
        tuesday: { open: String, close: String, available: { type: Boolean, default: true } },
        wednesday: { open: String, close: String, available: { type: Boolean, default: true } },
        thursday: { open: String, close: String, available: { type: Boolean, default: true } },
        friday: { open: String, close: String, available: { type: Boolean, default: true } },
        saturday: { open: String, close: String, available: { type: Boolean, default: true } },
        sunday: { open: String, close: String, available: { type: Boolean, default: true } }
      },
      emergencyService: { type: Boolean, default: false },
      mobileService: { type: Boolean, default: false }
    }],
    coverageArea: {
      radius: { type: Number, min: 0 }, // in kilometers
      cities: [{ type: String, trim: true }],
      zipCodes: [{ type: String, trim: true }]
    },
    vehicleTypes: [{
      type: { type: String, enum: ['sedan', 'suv', 'truck', 'motorcycle', 'commercial', 'luxury', 'electric', 'hybrid'], required: true },
      brands: [{ type: String, trim: true }],
      models: [{ type: String, trim: true }]
    }]
  },

  // Onboarding & Training
  onboarding: {
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'failed'],
      default: 'not_started'
    },
    steps: [{
      step: { type: String, required: true, trim: true },
      status: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed'], default: 'pending' },
      completedAt: { type: Date },
      notes: { type: String, trim: true },
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    documents: [{
      name: { type: String, required: true, trim: true },
      type: { type: String, enum: ['contract', 'license', 'insurance', 'certification', 'other'], required: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reviewedAt: { type: Date },
      notes: { type: String, trim: true }
    }],
    training: {
      completed: { type: Boolean, default: false },
      modules: [{
        name: { type: String, required: true, trim: true },
        status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
        completedAt: { type: Date },
        score: { type: Number, min: 0, max: 100 }
      }],
      certification: {
        issued: { type: Boolean, default: false },
        issuedAt: { type: Date },
        expiresAt: { type: Date },
        certificateNumber: { type: String, trim: true }
      }
    }
  },

  // Performance & Quality
  performance: {
    rating: {
      average: { type: Number, min: 0, max: 5, default: 0 },
      totalReviews: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now }
    },
    metrics: {
      responseTime: { type: Number, min: 0 }, // in minutes
      completionRate: { type: Number, min: 0, max: 100 }, // percentage
      customerSatisfaction: { type: Number, min: 0, max: 100 }, // percentage
      reworkRate: { type: Number, min: 0, max: 100 }, // percentage
      onTimeDelivery: { type: Number, min: 0, max: 100 } // percentage
    },
    qualityScore: {
      overall: { type: Number, min: 0, max: 100, default: 0 },
      workmanship: { type: Number, min: 0, max: 100, default: 0 },
      communication: { type: Number, min: 0, max: 100, default: 0 },
      timeliness: { type: Number, min: 0, max: 100, default: 0 },
      professionalism: { type: Number, min: 0, max: 100, default: 0 }
    }
  },

  // Commission & Financial
  commission: {
    structure: {
      type: { type: String, enum: ['percentage', 'fixed', 'tiered'], default: 'percentage' },
      rate: { type: Number, min: 0, max: 100, default: 10 }, // percentage
      tiers: [{
        minAmount: { type: Number, min: 0 },
        maxAmount: { type: Number, min: 0 },
        rate: { type: Number, min: 0, max: 100 }
      }],
      fixedAmount: { type: Number, min: 0 }
    },
    earnings: {
      totalEarned: { type: Number, min: 0, default: 0 },
      thisMonth: { type: Number, min: 0, default: 0 },
      lastMonth: { type: Number, min: 0, default: 0 },
      pending: { type: Number, min: 0, default: 0 },
      paid: { type: Number, min: 0, default: 0 }
    },
    payouts: [{
      amount: { type: Number, required: true, min: 0 },
      date: { type: Date, required: true },
      method: { type: String, enum: ['bank_transfer', 'check', 'digital_wallet'], required: true },
      status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
      reference: { type: String, trim: true },
      notes: { type: String, trim: true }
    }]
  },

  // Support & Communication
  support: {
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    tickets: [{
      ticketId: { type: String, required: true, trim: true },
      subject: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true },
      status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      resolution: { type: String, trim: true },
      resolvedAt: { type: Date }
    }],
    communication: {
      preferredMethod: { type: String, enum: ['email', 'phone', 'sms', 'in_app'], default: 'email' },
      responseTime: { type: Number, min: 0 }, // in hours
      availability: { type: String, trim: true }
    }
  },

  // Analytics & Reporting
  analytics: {
    totalJobs: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    cancelledJobs: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageJobValue: { type: Number, default: 0 },
    customerRetention: { type: Number, min: 0, max: 100, default: 0 },
    peakHours: [{
      day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
      hours: [{ type: Number, min: 0, max: 23 }]
    }],
    popularServices: [{
      service: { type: String, required: true, trim: true },
      count: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    }]
  },

  // Settings & Preferences
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    autoAccept: { type: Boolean, default: false },
    maxJobsPerDay: { type: Number, min: 1, default: 10 },
    emergencyContact: { type: Boolean, default: false },
    holidaySchedule: [{
      date: { type: Date, required: true },
      description: { type: String, trim: true },
      available: { type: Boolean, default: false }
    }]
  },

  // Audit & History
  audit: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    statusHistory: [{
      status: { type: String, required: true },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      changedAt: { type: Date, default: Date.now },
      reason: { type: String, trim: true }
    }],
    notes: [{
      content: { type: String, required: true, trim: true },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      createdAt: { type: Date, default: Date.now },
      type: { type: String, enum: ['general', 'performance', 'issue', 'improvement'], default: 'general' }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
// Note: partnerId already has unique: true which creates an index automatically
partnerSchema.index({ name: 1 });
partnerSchema.index({ type: 1 });
partnerSchema.index({ status: 1 });
partnerSchema.index({ 'contact.primaryContact.email': 1 });
partnerSchema.index({ 'business.legalName': 1 });
partnerSchema.index({ 'services.coverageArea.cities': 1 });
partnerSchema.index({ 'services.coverageArea.zipCodes': 1 });
partnerSchema.index({ 'performance.rating': 1 });
partnerSchema.index({ 'performance.responseTime': 1 });
partnerSchema.index({ 'performance.completionRate': 1 });
partnerSchema.index({ 'analytics.totalBookings': 1 });
partnerSchema.index({ 'analytics.totalRevenue': 1 });
partnerSchema.index({ 'analytics.customerSatisfaction': 1 });
partnerSchema.index({ 'analytics.lastActivity': -1 });
partnerSchema.index({ createdAt: -1 });
partnerSchema.index({ updatedAt: -1 });

// Virtuals
partnerSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

partnerSchema.virtual('isCertified').get(function() {
  return this.onboarding.training.certification.issued;
});

partnerSchema.virtual('averageResponseTime').get(function() {
  return this.performance.metrics.responseTime || 0;
});

partnerSchema.virtual('completionRate').get(function() {
  return this.performance.metrics.completionRate || 0;
});

partnerSchema.virtual('totalEarnings').get(function() {
  return this.commission.earnings.totalEarned || 0;
});

// Pre-save middleware
partnerSchema.pre('save', function(next) {
  // Update analytics
  if (this.analytics.totalJobs > 0) {
    this.analytics.averageJobValue = this.analytics.totalRevenue / this.analytics.totalJobs;
  }
  
  // Update performance metrics
  if (this.performance.rating.totalReviews > 0) {
    this.performance.rating.lastUpdated = new Date();
  }
  
  next();
});

// Static methods
partnerSchema.statics.findByLocation = function(latitude, longitude, radius = 50) {
  return this.find({
    'contact.address.coordinates': {
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

partnerSchema.statics.findByService = function(serviceType) {
  return this.find({
    'services.offered.serviceType': serviceType,
    status: 'active'
  });
};

partnerSchema.statics.findTopPerformers = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'performance.rating.average': -1, 'performance.metrics.completionRate': -1 })
    .limit(limit);
};

// Instance methods
partnerSchema.methods.updatePerformance = function(newRating, reviewCount = 1) {
  const currentTotal = this.performance.rating.average * this.performance.rating.totalReviews;
  const newTotal = currentTotal + newRating;
  const newCount = this.performance.rating.totalReviews + reviewCount;
  
  this.performance.rating.average = newTotal / newCount;
  this.performance.rating.totalReviews = newCount;
  this.performance.rating.lastUpdated = new Date();
  
  return this.save();
};

partnerSchema.methods.addJob = function(jobValue) {
  this.analytics.totalJobs += 1;
  this.analytics.totalRevenue += jobValue;
  this.analytics.averageJobValue = this.analytics.totalRevenue / this.analytics.totalJobs;
  
  return this.save();
};

partnerSchema.methods.completeJob = function() {
  this.analytics.completedJobs += 1;
  this.performance.metrics.completionRate = (this.analytics.completedJobs / this.analytics.totalJobs) * 100;
  
  return this.save();
};

module.exports = mongoose.model('Partner', partnerSchema);
