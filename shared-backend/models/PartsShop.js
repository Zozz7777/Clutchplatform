const mongoose = require('../shims/mongoose');

const partsShopSchema = new mongoose.Schema({
  shopId: {
    type: String,
    required: true,
    default: () => `shop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactInfo: {
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String
    }
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'USA'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  businessHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  services: [{
    name: String,
    description: String,
    price: Number,
    duration: Number // in minutes
  }],
  specializations: [{
    type: String,
    enum: ['engine_parts', 'brake_systems', 'suspension', 'electrical', 'transmission', 'body_parts', 'accessories', 'tires', 'oils_lubricants', 'tools_equipment']
  }],
  brands: [{
    name: String,
    logo: String,
    description: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    certificateNumber: String
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    distribution: {
      fiveStar: { type: Number, default: 0 },
      fourStar: { type: Number, default: 0 },
      threeStar: { type: Number, default: 0 },
      twoStar: { type: Number, default: 0 },
      oneStar: { type: Number, default: 0 }
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'pending_verification'
  },
  verificationStatus: {
    type: String,
    required: true,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified'
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['business_license', 'tax_certificate', 'insurance_certificate', 'id_document', 'other']
    },
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  paymentMethods: [{
    type: {
      type: String,
      enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'check']
    },
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  deliveryOptions: [{
    type: {
      type: String,
      enum: ['pickup', 'local_delivery', 'shipping', 'express_shipping']
    },
    enabled: {
      type: Boolean,
      default: true
    },
    cost: {
      type: Number,
      default: 0
    },
    estimatedTime: String
  }],
  inventory: {
    totalParts: {
      type: Number,
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    lowStockItems: [{
      partId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CarPart'
      },
      currentStock: Number,
      minStock: Number
    }]
  },
  logo: String,
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
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
}, { timestamps: true, collection: 'parts_shops' });

// Indexes
partsShopSchema.index({ shopId: 1 });
partsShopSchema.index({ ownerId: 1 });
partsShopSchema.index({ status: 1 });
partsShopSchema.index({ verificationStatus: 1 });
partsShopSchema.index({ 'address.city': 1, 'address.state': 1 });
partsShopSchema.index({ 'address.coordinates': '2dsphere' });
partsShopSchema.index({ specializations: 1 });
partsShopSchema.index({ 'ratings.average': -1 });
partsShopSchema.index({ createdAt: -1 });

// Pre-save middleware
partsShopSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
partsShopSchema.statics.findByOwner = function(ownerId, options = {}) {
  const match = { ownerId };
  if (options.status) match.status = options.status;
  if (options.verificationStatus) match.verificationStatus = options.verificationStatus;
  return this.aggregate([
    { $match: match },
    { $lookup: { from: 'users', localField: 'ownerId', foreignField: '_id', as: 'ownerId' } },
    { $unwind: { path: '$ownerId', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } }
  ]);
};

partsShopSchema.statics.findByLocation = function(location, radius = 50) {
  return this.aggregate([
    { $geoNear: {
        near: { type: 'Point', coordinates: [location.longitude, location.latitude] },
        distanceField: 'dist.calculated',
        query: { status: 'active', verificationStatus: 'verified' },
        spherical: true,
        maxDistance: radius * 1000
    } },
    { $lookup: { from: 'users', localField: 'ownerId', foreignField: '_id', as: 'ownerId' } },
    { $unwind: { path: '$ownerId', preserveNullAndEmptyArrays: true } },
    { $sort: { 'ratings.average': -1 } }
  ]);
};

partsShopSchema.statics.findBySpecialization = function(specialization, options = {}) {
  const query = { 
    specializations: specialization,
    status: 'active',
    verificationStatus: 'verified'
  };
  
  if (options.city) query['address.city'] = new RegExp(options.city, 'i');
  if (options.state) query['address.state'] = new RegExp(options.state, 'i');
  
  return this.aggregate([
    { $match: query },
    { $lookup: { from: 'users', localField: 'ownerId', foreignField: '_id', as: 'ownerId' } },
    { $unwind: { path: '$ownerId', preserveNullAndEmptyArrays: true } },
    { $sort: { 'ratings.average': -1 } }
  ]);
};

partsShopSchema.statics.findVerified = function() {
  return this.aggregate([
    { $match: { status: 'active', verificationStatus: 'verified' } },
    { $lookup: { from: 'users', localField: 'ownerId', foreignField: '_id', as: 'ownerId' } },
    { $unwind: { path: '$ownerId', preserveNullAndEmptyArrays: true } },
    { $sort: { 'ratings.average': -1 } }
  ]);
};

partsShopSchema.statics.findPendingVerification = function() {
  return this.aggregate([
    { $match: { verificationStatus: 'pending' } },
    { $lookup: { from: 'users', localField: 'ownerId', foreignField: '_id', as: 'ownerId' } },
    { $unwind: { path: '$ownerId', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: 1 } }
  ]);
};

// Instance methods
partsShopSchema.methods.updateRating = function(newRating) {
  const totalReviews = this.ratings.totalReviews + 1;
  const newAverage = ((this.ratings.average * this.ratings.totalReviews) + newRating) / totalReviews;
  
  this.ratings.average = Math.round(newAverage * 10) / 10; // Round to 1 decimal place
  this.ratings.totalReviews = totalReviews;
  
  // Update rating distribution
  if (newRating === 5) this.ratings.distribution.fiveStar++;
  else if (newRating === 4) this.ratings.distribution.fourStar++;
  else if (newRating === 3) this.ratings.distribution.threeStar++;
  else if (newRating === 2) this.ratings.distribution.twoStar++;
  else if (newRating === 1) this.ratings.distribution.oneStar++;
  
  return this.save();
};

partsShopSchema.methods.verify = function(verifiedBy) {
  this.verificationStatus = 'verified';
  this.status = 'active';
  this.verificationDocuments.forEach(doc => {
    if (!doc.verifiedAt) {
      doc.verifiedAt = new Date();
      doc.verifiedBy = verifiedBy;
    }
  });
  return this.save();
};

partsShopSchema.methods.reject = function(reason) {
  this.verificationStatus = 'rejected';
  this.status = 'suspended';
  this.metadata.set('rejectionReason', reason);
  return this.save();
};

partsShopSchema.methods.suspend = function(reason) {
  this.status = 'suspended';
  this.metadata.set('suspensionReason', reason);
  return this.save();
};

partsShopSchema.methods.activate = function() {
  this.status = 'active';
  return this.save();
};

partsShopSchema.methods.addSpecialization = function(specialization) {
  if (!this.specializations.includes(specialization)) {
    this.specializations.push(specialization);
  }
  return this.save();
};

partsShopSchema.methods.removeSpecialization = function(specialization) {
  this.specializations = this.specializations.filter(spec => spec !== specialization);
  return this.save();
};

module.exports = mongoose.model('PartsShop', partsShopSchema);
