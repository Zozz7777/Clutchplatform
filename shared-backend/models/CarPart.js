const mongoose = require('../shims/mongoose');

const carPartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['engine', 'transmission', 'brakes', 'suspension', 'electrical', 'exhaust', 'cooling', 'fuel', 'tires', 'battery', 'filters', 'fluids', 'lighting', 'interior', 'exterior', 'other']
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  partNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  vehicleCompatibility: {
    makes: [{
      type: String,
      trim: true
    }],
    models: [{
      type: String,
      trim: true
    }],
    years: {
      start: {
        type: Number,
        required: true
      },
      end: {
        type: Number,
        required: true
      }
    }
  },
  specifications: {
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['mm', 'cm', 'inch'],
        default: 'mm'
      }
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['g', 'kg', 'lb'],
        default: 'kg'
      }
    },
    material: String,
    color: String
  },
  installationInfo: {
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'professional'],
      default: 'medium'
    },
    estimatedTime: {
      value: Number,
      unit: {
        type: String,
        enum: ['minutes', 'hours'],
        default: 'hours'
      }
    },
    toolsRequired: [String],
    instructions: String
  },
  pricing: {
    cost: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    supplier: {
      name: String,
      contact: String,
      website: String
    }
  },
  expiryTracking: {
    hasExpiry: {
      type: Boolean,
      default: false
    },
    expiryDate: {
      type: Date
    },
    shelfLife: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'months', 'years'],
        default: 'months'
      }
    },
    storageConditions: String
  },
  installationTracking: {
    isInstalled: {
      type: Boolean,
      default: false
    },
    installationDate: Date,
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    mechanicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    installationNotes: String,
    warrantyExpiry: Date
  },
  status: {
    type: String,
    enum: ['available', 'installed', 'expired', 'discontinued', 'out_of_stock'],
    default: 'available'
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['manual', 'warranty', 'certificate', 'other']
    }
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true,
  collection: 'car_parts'
});

// Indexes for better query performance
carPartSchema.index({ name: 'text', description: 'text', brand: 'text' });
carPartSchema.index({ category: 1 });
carPartSchema.index({ 'vehicleCompatibility.makes': 1 });
carPartSchema.index({ 'vehicleCompatibility.models': 1 });
carPartSchema.index({ 'vehicleCompatibility.years.start': 1, 'vehicleCompatibility.years.end': 1 });
carPartSchema.index({ status: 1 });
carPartSchema.index({ 'expiryTracking.expiryDate': 1 });
carPartSchema.index({ 'installationTracking.vehicleId': 1 });

// Pre-save middleware to update metadata
carPartSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  next();
});

// Static methods
carPartSchema.statics.create = async function(carPartData) {
  try {
    const carPart = new this(carPartData);
    await carPart.save();
    return carPart;
  } catch (error) {
    throw new Error(`Failed to create car part: ${error.message}`);
  }
};

carPartSchema.statics.findById = async function(id) {
  try {
    const objectId = require('../utils/databaseUtils').toObjectId(id);
    const results = await this.aggregate([
      { $match: { _id: objectId } },
      { $lookup: { from: 'vehicles', localField: 'installationTracking.vehicleId', foreignField: '_id', as: 'installationVehicle' } },
      { $unwind: { path: '$installationVehicle', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'users', localField: 'installationTracking.mechanicId', foreignField: '_id', as: 'installationMechanic' } },
      { $unwind: { path: '$installationMechanic', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$reviews', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'users', localField: 'reviews.userId', foreignField: '_id', as: 'reviews.user' } },
      { $unwind: { path: '$reviews.user', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$_id', doc: { $first: '$$ROOT' }, reviews: { $push: '$reviews' } } },
      { $addFields: { 'doc.reviews': '$reviews' } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $lookup: { from: 'users', localField: 'metadata.createdBy', foreignField: '_id', as: 'metadataCreatedBy' } },
      { $unwind: { path: '$metadataCreatedBy', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'users', localField: 'metadata.lastModifiedBy', foreignField: '_id', as: 'metadataLastModifiedBy' } },
      { $unwind: { path: '$metadataLastModifiedBy', preserveNullAndEmptyArrays: true } }
    ]);
    return results[0] || null;
  } catch (error) {
    throw new Error(`Failed to find car part: ${error.message}`);
  }
};

carPartSchema.statics.update = async function(id, updateData) {
  try {
    const carPart = await this.findByIdAndUpdate(
      id,
      { ...updateData, 'metadata.updatedAt': new Date() },
      { new: true, runValidators: true }
    );
    return carPart;
  } catch (error) {
    throw new Error(`Failed to update car part: ${error.message}`);
  }
};

carPartSchema.statics.delete = async function(id) {
  try {
    const carPart = await this.findByIdAndUpdate(
      id,
      { 
        status: 'discontinued',
        'metadata.updatedAt': new Date()
      },
      { new: true }
    );
    return carPart;
  } catch (error) {
    throw new Error(`Failed to delete car part: ${error.message}`);
  }
};

carPartSchema.statics.findByCategory = async function(category) {
  try {
    return await this.aggregate([
      { $match: { category, status: { $ne: 'discontinued' } } },
      { $lookup: { from: 'vehicles', localField: 'installationTracking.vehicleId', foreignField: '_id', as: 'installationVehicle' } },
      { $unwind: { path: '$installationVehicle', preserveNullAndEmptyArrays: true } },
      { $sort: { 'metadata.createdAt': -1 } }
    ]);
  } catch (error) {
    throw new Error(`Failed to find car parts by category: ${error.message}`);
  }
};

carPartSchema.statics.findByVehicleCompatibility = async function(vehicleMake, vehicleModel, vehicleYear) {
  try {
    return await this.find({
      'vehicleCompatibility.makes': { $in: [vehicleMake] },
      'vehicleCompatibility.models': { $in: [vehicleModel] },
      'vehicleCompatibility.years.start': { $lte: vehicleYear },
      'vehicleCompatibility.years.end': { $gte: vehicleYear },
      status: { $ne: 'discontinued' }
    }).sort({ 'ratings.average': -1 });
  } catch (error) {
    throw new Error(`Failed to find compatible car parts: ${error.message}`);
  }
};

carPartSchema.statics.searchParts = async function(searchTerm, filters = {}) {
  try {
    const query = {
      $and: [
        {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { brand: { $regex: searchTerm, $options: 'i' } },
            { partNumber: { $regex: searchTerm, $options: 'i' } }
          ]
        },
        { status: { $ne: 'discontinued' } }
      ]
    };

    // Apply additional filters
    if (filters.category) {
      query.$and.push({ category: filters.category });
    }
    if (filters.brand) {
      query.$and.push({ brand: filters.brand });
    }
    if (filters.minPrice !== undefined) {
      query.$and.push({ 'pricing.cost': { $gte: filters.minPrice } });
    }
    if (filters.maxPrice !== undefined) {
      query.$and.push({ 'pricing.cost': { $lte: filters.maxPrice } });
    }
    if (filters.rating) {
      query.$and.push({ 'ratings.average': { $gte: filters.rating } });
    }

    return await this.find(query)
      .sort({ 'ratings.average': -1, 'metadata.createdAt': -1 })
      .limit(filters.limit || 50);
  } catch (error) {
    throw new Error(`Failed to search car parts: ${error.message}`);
  }
};

carPartSchema.statics.findExpiringParts = async function(userId, daysThreshold = 30) {
  try {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const vehicleIds = await mongoose.model('Vehicle').distinct('_id', { userId });
    return await this.aggregate([
      { $match: { 'installationTracking.vehicleId': { $in: vehicleIds }, 'expiryTracking.hasExpiry': true, 'expiryTracking.expiryDate': { $lte: thresholdDate }, status: { $in: ['available', 'installed'] } } },
      { $lookup: { from: 'vehicles', localField: 'installationTracking.vehicleId', foreignField: '_id', as: 'installationVehicle' } },
      { $unwind: { path: '$installationVehicle', preserveNullAndEmptyArrays: true } }
    ]);
  } catch (error) {
    throw new Error(`Failed to find expiring parts: ${error.message}`);
  }
};

carPartSchema.statics.updateExpiryDate = async function(partId, newExpiryDate) {
  try {
    const carPart = await this.findByIdAndUpdate(
      partId,
      { 
        'expiryTracking.expiryDate': newExpiryDate,
        'metadata.updatedAt': new Date()
      },
      { new: true }
    );
    return carPart;
  } catch (error) {
    throw new Error(`Failed to update expiry date: ${error.message}`);
  }
};

carPartSchema.statics.getPartRecommendations = async function(vehicleData, userHistory = []) {
  try {
    // Get compatible parts
    const compatibleParts = await this.findByVehicleCompatibility(
      vehicleData.make,
      vehicleData.model,
      vehicleData.year
    );

    // Filter based on user history and vehicle age
    const recommendations = compatibleParts.filter(part => {
      // Check if user already has this part installed
      const alreadyInstalled = userHistory.some(history => 
        history.partId.toString() === part._id.toString()
      );

      // Check if part is suitable for vehicle age
      const vehicleAge = new Date().getFullYear() - vehicleData.year;
      const isSuitableForAge = part.installationInfo.difficulty !== 'professional' || vehicleAge > 5;

      return !alreadyInstalled && isSuitableForAge;
    });

    return recommendations.slice(0, 10); // Return top 10 recommendations
  } catch (error) {
    throw new Error(`Failed to get part recommendations: ${error.message}`);
  }
};

carPartSchema.statics.trackInstallation = async function(partId, vehicleId, installationDate, mechanicId, notes = '') {
  try {
    const carPart = await this.findByIdAndUpdate(
      partId,
      {
        'installationTracking.isInstalled': true,
        'installationTracking.installationDate': installationDate,
        'installationTracking.vehicleId': vehicleId,
        'installationTracking.mechanicId': mechanicId,
        'installationTracking.installationNotes': notes,
        status: 'installed',
        'metadata.updatedAt': new Date()
      },
      { new: true }
    );
    return carPart;
  } catch (error) {
    throw new Error(`Failed to track installation: ${error.message}`);
  }
};

// Instance methods
carPartSchema.methods.addReview = async function(userId, rating, comment = '') {
  try {
    this.reviews.push({ userId, rating, comment });
    
    // Update average rating
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings.average = totalRating / this.reviews.length;
    this.ratings.count = this.reviews.length;
    
    await this.save();
    return this;
  } catch (error) {
    throw new Error(`Failed to add review: ${error.message}`);
  }
};

carPartSchema.methods.checkExpiryStatus = function() {
  if (!this.expiryTracking.hasExpiry || !this.expiryTracking.expiryDate) {
    return { isExpired: false, daysUntilExpiry: null };
  }

  const now = new Date();
  const expiryDate = new Date(this.expiryTracking.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

  return {
    isExpired: daysUntilExpiry < 0,
    daysUntilExpiry: daysUntilExpiry
  };
};

carPartSchema.methods.getInstallationStatus = function() {
  if (!this.installationTracking.isInstalled) {
    return { isInstalled: false, installationInfo: null };
  }

  return {
    isInstalled: true,
    installationInfo: {
      date: this.installationTracking.installationDate,
      vehicleId: this.installationTracking.vehicleId,
      mechanicId: this.installationTracking.mechanicId,
      notes: this.installationTracking.installationNotes,
      warrantyExpiry: this.installationTracking.warrantyExpiry
    }
  };
};

module.exports = mongoose.model('CarPart', carPartSchema);
