const mongoose = require('../shims/mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: true,
    unique: true,
    default: () => `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  vin: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  licensePlate: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  mileage: {
    type: Number,
    default: 0,
    min: 0
  },
  fuelType: {
    type: String,
    enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'lpg', 'cng'],
    default: 'gasoline'
  },
  transmission: {
    type: String,
    enum: ['automatic', 'manual', 'cvt', 'semi-automatic'],
    default: 'automatic'
  },
  engineSize: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  documents: [{
    type: { type: String, enum: ['registration', 'insurance', 'inspection', 'other'] },
    name: String,
    url: String,
    expiryDate: Date,
    uploadDate: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'retired'],
    default: 'active'
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
vehicleSchema.index({ vehicleId: 1 });
vehicleSchema.index({ userId: 1 });
vehicleSchema.index({ make: 1, model: 1 });
vehicleSchema.index({ year: 1 });
vehicleSchema.index({ vin: 1 });
vehicleSchema.index({ licensePlate: 1 });
vehicleSchema.index({ status: 1 });

// Virtuals
vehicleSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

vehicleSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Pre-save middleware
vehicleSchema.pre('save', function(next) {
  // Ensure only one primary vehicle per user
  if (this.isPrimary && this.isModified('isPrimary')) {
    this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isPrimary: false } }
    ).exec();
  }
  next();
});

// Static methods
vehicleSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ isPrimary: -1, createdAt: -1 });
};

vehicleSchema.statics.findByMake = function(make) {
  return this.find({ make: new RegExp(make, 'i') });
};

vehicleSchema.statics.findByYearRange = function(startYear, endYear) {
  return this.find({ year: { $gte: startYear, $lte: endYear } });
};

vehicleSchema.statics.getVehicleStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalVehicles: { $sum: 1 },
        activeVehicles: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        averageAge: { $avg: { $subtract: [new Date().getFullYear(), '$year'] } },
        makes: { $addToSet: '$make' }
      }
    }
  ]);
};

vehicleSchema.statics.getVehiclesByMake = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$make',
        count: { $sum: 1 },
        models: { $addToSet: '$model' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Instance methods
vehicleSchema.methods.updateMileage = function(newMileage) {
  if (newMileage >= this.mileage) {
    this.mileage = newMileage;
    return this.save();
  }
  throw new Error('New mileage cannot be less than current mileage');
};

vehicleSchema.methods.addImage = function(imageData) {
  this.images.push(imageData);
  return this.save();
};

vehicleSchema.methods.removeImage = function(imageId) {
  this.images = this.images.filter(img => img._id.toString() !== imageId);
  return this.save();
};

vehicleSchema.methods.addDocument = function(documentData) {
  this.documents.push(documentData);
  return this.save();
};

vehicleSchema.methods.removeDocument = function(documentId) {
  this.documents = this.documents.filter(doc => doc._id.toString() !== documentId);
  return this.save();
};

module.exports = mongoose.model('Vehicle', vehicleSchema);
