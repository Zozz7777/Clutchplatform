const mongoose = require('../shims/mongoose');

const partnerRequestSchema = new mongoose.Schema({
  // Basic Information
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
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
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
  businessDescription: {
    type: String,
    trim: true
  },
  yearsInBusiness: {
    type: Number,
    min: 0
  },
  website: {
    type: String,
    trim: true
  },
  socialMedia: {
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    twitter: { type: String, trim: true },
    linkedin: { type: String, trim: true }
  },
  
  // Request Status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'on_hold'],
    default: 'pending'
  },
  
  // Review Information
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    trim: true
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  
  // Follow-up Information
  followUpDate: {
    type: Date
  },
  followUpNotes: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Contact History
  contactHistory: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['email', 'phone', 'meeting', 'other'] },
    notes: { type: String, trim: true },
    contactedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Documents
  documents: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['license', 'certificate', 'insurance', 'other'] },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Priority and Tags
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  },
  lastContactedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
partnerRequestSchema.index({ email: 1 });
partnerRequestSchema.index({ phone: 1 });
partnerRequestSchema.index({ status: 1 });
partnerRequestSchema.index({ partnerType: 1 });
partnerRequestSchema.index({ submittedAt: -1 });
partnerRequestSchema.index({ assignedTo: 1 });
partnerRequestSchema.index({ priority: 1 });

// Virtual for days since submission
partnerRequestSchema.virtual('daysSinceSubmission').get(function() {
  return Math.floor((new Date() - this.submittedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
partnerRequestSchema.virtual('isOverdue').get(function() {
  const daysSinceSubmission = this.daysSinceSubmission;
  const priorityDays = {
    urgent: 1,
    high: 3,
    medium: 7,
    low: 14
  };
  return daysSinceSubmission > (priorityDays[this.priority] || 7);
});

// Pre-save middleware
partnerRequestSchema.pre('save', function(next) {
  // Update last contacted date if contact history is modified
  if (this.isModified('contactHistory') && this.contactHistory.length > 0) {
    this.lastContactedAt = new Date();
  }
  
  next();
});

// Static methods
partnerRequestSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ submittedAt: -1 });
};

partnerRequestSchema.statics.findByPartnerType = function(partnerType) {
  return this.find({ partnerType }).sort({ submittedAt: -1 });
};

partnerRequestSchema.statics.findOverdue = function() {
  return this.find({
    status: { $in: ['pending', 'under_review'] },
    $expr: {
      $gt: [
        { $divide: [{ $subtract: [new Date(), '$submittedAt'] }, 1000 * 60 * 60 * 24] },
        {
          $switch: {
            branches: [
              { case: { $eq: ['$priority', 'urgent'] }, then: 1 },
              { case: { $eq: ['$priority', 'high'] }, then: 3 },
              { case: { $eq: ['$priority', 'medium'] }, then: 7 },
              { case: { $eq: ['$priority', 'low'] }, then: 14 }
            ],
            default: 7
          }
        }
      ]
    }
  });
};

partnerRequestSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

partnerRequestSchema.statics.getPartnerTypeStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$partnerType',
        count: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approved: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Instance methods
partnerRequestSchema.methods.addContact = function(type, notes, contactedBy) {
  this.contactHistory.push({
    type,
    notes,
    contactedBy,
    date: new Date()
  });
  this.lastContactedAt = new Date();
  return this.save();
};

partnerRequestSchema.methods.updateStatus = function(status, reviewedBy, notes) {
  this.status = status;
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  if (notes) {
    this.reviewNotes = notes;
  }
  return this.save();
};

partnerRequestSchema.methods.assignTo = function(userId) {
  this.assignedTo = userId;
  return this.save();
};

partnerRequestSchema.methods.addDocument = function(name, type, url) {
  this.documents.push({
    name,
    type,
    url,
    uploadedAt: new Date()
  });
  return this.save();
};

module.exports = mongoose.model('PartnerRequest', partnerRequestSchema);
