const mongoose = require('../shims/mongoose');
const bcrypt = require('bcryptjs');

const serviceCenterSchema = new mongoose.Schema({
  serviceCenterId: {
    type: String,
    required: true,
    unique: true,
    default: () => `sc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    website: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  services: [{
    serviceId: String,
    name: String,
    description: String,
    price: Number,
    duration: Number, // in minutes
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  operatingHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: true } }
  },
  capacity: {
    maxConcurrentBookings: {
      type: Number,
      default: 10
    },
    maxDailyBookings: {
      type: Number,
      default: 50
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String,
    url: String,
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  specializations: [{
    type: String,
    enum: ['engine', 'transmission', 'brakes', 'electrical', 'body', 'interior', 'diagnostics', 'maintenance']
  }],
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    certificateUrl: String
  }],
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    coverageAmount: Number
  },
  paymentMethods: [{
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet']
  }],
  isActive: {
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
}, { timestamps: true });

// Indexes
serviceCenterSchema.index({ serviceCenterId: 1 });
serviceCenterSchema.index({ ownerId: 1 });
serviceCenterSchema.index({ 'address.coordinates': '2dsphere' });
serviceCenterSchema.index({ status: 1 });
serviceCenterSchema.index({ isActive: 1 });
serviceCenterSchema.index({ createdAt: -1 });

// Pre-save middleware
serviceCenterSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
serviceCenterSchema.statics.findByOwner = function(ownerId) {
  return this.find({ ownerId, isActive: true });
};

serviceCenterSchema.statics.findActive = function() {
  return this.find({ isActive: true, status: 'active' });
};

serviceCenterSchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
  return this.find({
    'address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true,
    status: 'active'
  });
};

// Instance methods
serviceCenterSchema.methods.getFullAddress = function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
};

serviceCenterSchema.methods.isOpen = function() {
  const now = new Date();
  const dayOfWeek = now.toLocaleLowerCase().slice(0, 3);
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todayHours = this.operatingHours[dayOfWeek];
  if (!todayHours || !todayHours.isOpen) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

serviceCenterSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating.average * this.rating.totalReviews + newRating;
  this.rating.totalReviews += 1;
  this.rating.average = totalRating / this.rating.totalReviews;
  return this.save();
};

module.exports = mongoose.model('ServiceCenter', serviceCenterSchema);
