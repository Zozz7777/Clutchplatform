const mongoose = require('../shims/mongoose');

const jobPostingSchema = new mongoose.Schema({
  // Basic Information
  title: { type: String, required: true, trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  location: {
    type: { type: String, enum: ['remote', 'onsite', 'hybrid'], default: 'onsite' },
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  
  // Job Details
  description: { type: String, required: true },
  requirements: [String],
  responsibilities: [String],
  benefits: [String],
  
  // Employment Details
  employmentType: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
    required: true
  },
  experienceLevel: { 
    type: String, 
    enum: ['entry', 'junior', 'mid-level', 'senior', 'lead', 'executive'],
    required: true
  },
  
  // Compensation
  salary: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    isNegotiable: { type: Boolean, default: true },
    benefits: [String]
  },
  
  // Application Process
  applicationDeadline: { type: Date },
  startDate: { type: Date },
  positions: { type: Number, default: 1 },
  applicationsReceived: { type: Number, default: 0 },
  
  // Status & Workflow
  status: { 
    type: String, 
    enum: ['draft', 'published', 'closed', 'filled', 'cancelled'],
    default: 'draft'
  },
  publishedDate: { type: Date },
  closedDate: { type: Date },
  
  // Hiring Team
  hiringManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  recruiters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  interviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  
  // Application Settings
  applicationSettings: {
    requireCoverLetter: { type: Boolean, default: false },
    requirePortfolio: { type: Boolean, default: false },
    requireReferences: { type: Boolean, default: false },
    maxApplications: { type: Number },
    autoRejectKeywords: [String],
    requiredSkills: [String],
    preferredSkills: [String]
  },
  
  // Workflow Stages
  workflowStages: [{
    name: { type: String, required: true },
    order: { type: Number, required: true },
    description: String,
    estimatedDuration: Number, // in days
    isRequired: { type: Boolean, default: true },
    autoAdvance: { type: Boolean, default: false }
  }],
  
  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    interviews: { type: Number, default: 0 },
    offers: { type: Number, default: 0 },
    hires: { type: Number, default: 0 },
    timeToFill: Number, // in days
    costPerHire: Number,
    sourceEffectiveness: [{
      source: String,
      applications: Number,
      hires: Number,
      conversionRate: Number
    }]
  },
  
  // Internal Notes
  internalNotes: [{
    note: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    createdAt: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: false }
  }],
  
  // Metadata
  metadata: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    lastUpdated: { type: Date, default: Date.now },
    version: { type: Number, default: 1 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for application rate
jobPostingSchema.virtual('applicationRate').get(function() {
  if (this.analytics.views === 0) return 0;
  return (this.analytics.applications / this.analytics.views * 100).toFixed(2);
});

// Virtual for time to fill
jobPostingSchema.virtual('isOpen').get(function() {
  return this.status === 'published' && 
         (!this.applicationDeadline || new Date() < this.applicationDeadline);
});

// Indexes
jobPostingSchema.index({ title: 1 });
jobPostingSchema.index({ department: 1 });
jobPostingSchema.index({ status: 1 });
jobPostingSchema.index({ 'location.city': 1 });
jobPostingSchema.index({ employmentType: 1 });
jobPostingSchema.index({ experienceLevel: 1 });
jobPostingSchema.index({ publishedDate: -1 });
jobPostingSchema.index({ applicationDeadline: 1 });

// Pre-save middleware
jobPostingSchema.pre('save', function(next) {
  if (this.isModified('metadata.lastUpdated')) {
    this.metadata.lastUpdated = new Date();
  }
  
  // Auto-set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedDate) {
    this.publishedDate = new Date();
  }
  
  next();
});

// Static methods
jobPostingSchema.statics.findActivePostings = function() {
  return this.find({ 
    status: 'published',
    $or: [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: { $gt: new Date() } }
    ]
  });
};

jobPostingSchema.statics.findByDepartment = function(departmentId) {
  return this.find({ department: departmentId });
};

jobPostingSchema.statics.findByLocation = function(location) {
  return this.find({ 'location.city': location });
};

// Instance methods
jobPostingSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

jobPostingSchema.methods.incrementApplications = function() {
  this.analytics.applications += 1;
  this.applicationsReceived += 1;
  return this.save();
};

jobPostingSchema.methods.closePosting = function() {
  this.status = 'closed';
  this.closedDate = new Date();
  return this.save();
};

jobPostingSchema.methods.addInternalNote = function(note, createdBy, isPrivate = false) {
  this.internalNotes.push({
    note,
    createdBy,
    isPrivate
  });
  return this.save();
};

jobPostingSchema.methods.updateAnalytics = function(updates) {
  this.analytics = { ...this.analytics, ...updates };
  return this.save();
};

module.exports = mongoose.model('JobPosting', jobPostingSchema);
