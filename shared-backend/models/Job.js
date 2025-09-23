const mongoose = require('../shims/mongoose');

const jobSchema = new mongoose.Schema({
  // Basic Information
  title: { 
    type: String, 
    required: true, 
    trim: true,
    index: true
  },
  slug: { 
    type: String, 
    unique: true, 
    lowercase: true,
    index: true
  },
  department: { 
    type: String, 
    required: true,
    enum: ['Executive', 'Human Resources', 'Finance', 'Operations', 'Marketing', 'Technology', 'Sales', 'Customer Service', 'Legal', 'Compliance', 'General'],
    index: true
  },
  
  // Location Information
  locations: [{
    type: { 
      type: String, 
      enum: ['remote', 'onsite', 'hybrid'], 
      default: 'onsite' 
    },
    address: String,
    city: { type: String, required: true },
    state: String,
    country: { type: String, default: 'Egypt' },
    postalCode: String
  }],
  
  // Job Details
  description: { 
    type: String, 
    required: true 
  },
  requirements: [{
    type: { 
      type: String, 
      enum: ['required', 'preferred'], 
      default: 'required' 
    },
    text: { type: String, required: true }
  }],
  responsibilities: [String],
  benefits: [String],
  skills: [String],
  
  // Employment Details
  employmentType: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
    required: true,
    index: true
  },
  experienceLevel: { 
    type: String, 
    enum: ['entry', 'junior', 'mid-level', 'senior', 'lead', 'executive'],
    required: true,
    index: true
  },
  
  // Compensation
  salary: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'EGP' },
    isNegotiable: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: true }
  },
  
  // Application Process
  applicationDeadline: { type: Date },
  startDate: { type: Date },
  positions: { type: Number, default: 1 },
  applicationsReceived: { type: Number, default: 0 },
  
  // Custom Application Questions
  customQuestions: [{
    question: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['text', 'textarea', 'select', 'checkbox', 'radio', 'file'],
      default: 'text'
    },
    options: [String], // For select, checkbox, radio
    required: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],
  
  // Status & Workflow
  status: { 
    type: String, 
    enum: ['draft', 'pending_manager_approval', 'pending_hr_admin_approval', 'published', 'closed', 'filled', 'cancelled'],
    default: 'draft',
    index: true
  },
  visibility: {
    type: String,
    enum: ['public', 'internal'],
    default: 'public'
  },
  publishedDate: { type: Date },
  closedDate: { type: Date },
  expiryDate: { type: Date },
  
  // Hiring Team
  hiringManager: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  recruiters: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee' 
  }],
  interviewers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee' 
  }],
  
  // Application Settings
  applicationSettings: {
    requireCoverLetter: { type: Boolean, default: false },
    requirePortfolio: { type: Boolean, default: false },
    requireReferences: { type: Boolean, default: false },
    maxApplications: { type: Number },
    autoRejectKeywords: [String],
    requiredSkills: [String],
    preferredSkills: [String],
    allowMultipleApplications: { type: Boolean, default: false }
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
  
  // SEO and Marketing
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  
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
jobSchema.virtual('applicationRate').get(function() {
  if (this.analytics.views === 0) return 0;
  return (this.analytics.applications / this.analytics.views * 100).toFixed(2);
});

// Virtual for time to fill
jobSchema.virtual('isOpen').get(function() {
  return this.status === 'published' && 
         (!this.applicationDeadline || new Date() < this.applicationDeadline) &&
         (!this.expiryDate || new Date() < this.expiryDate);
});

// Virtual for featured jobs
jobSchema.virtual('isFeatured').get(function() {
  return this.analytics.views > 100 || this.analytics.applications > 10;
});

// Indexes
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ department: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ 'locations.city': 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ publishedDate: -1 });
jobSchema.index({ applicationDeadline: 1 });
jobSchema.index({ expiryDate: 1 });
jobSchema.index({ hiringManager: 1 });

// Pre-save middleware
jobSchema.pre('save', function(next) {
  // Generate slug from title
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  if (this.isModified('metadata.lastUpdated')) {
    this.metadata.lastUpdated = new Date();
  }
  
  // Auto-set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedDate) {
    this.publishedDate = new Date();
  }
  
  // Auto-set closed date when status changes to closed
  if (this.isModified('status') && this.status === 'closed' && !this.closedDate) {
    this.closedDate = new Date();
  }
  
  next();
});

// Static methods
jobSchema.statics.findActiveJobs = function() {
  return this.find({ 
    status: 'published',
    $or: [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: { $gt: new Date() } }
    ],
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  });
};

jobSchema.statics.findByDepartment = function(department) {
  return this.find({ department: department });
};

jobSchema.statics.findByLocation = function(location) {
  return this.find({ 'locations.city': location });
};

jobSchema.statics.findFeaturedJobs = function() {
  return this.find({ 
    status: 'published',
    $or: [
      { 'analytics.views': { $gt: 100 } },
      { 'analytics.applications': { $gt: 10 } }
    ]
  }).sort({ 'analytics.views': -1 }).limit(5);
};

// Instance methods
jobSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

jobSchema.methods.incrementApplications = function() {
  this.analytics.applications += 1;
  this.applicationsReceived += 1;
  return this.save();
};

jobSchema.methods.closeJob = function() {
  this.status = 'closed';
  this.closedDate = new Date();
  return this.save();
};

jobSchema.methods.addInternalNote = function(note, createdBy, isPrivate = false) {
  this.internalNotes.push({
    note,
    createdBy,
    isPrivate
  });
  return this.save();
};

jobSchema.methods.updateAnalytics = function(updates) {
  this.analytics = { ...this.analytics, ...updates };
  return this.save();
};

jobSchema.methods.approveByManager = function(managerId) {
  if (this.status === 'draft') {
    this.status = 'pending_hr_admin_approval';
    this.metadata.updatedBy = managerId;
    this.metadata.lastUpdated = new Date();
  }
  return this.save();
};

jobSchema.methods.approveByHRAdmin = function(hrAdminId) {
  if (this.status === 'pending_hr_admin_approval') {
    this.status = 'published';
    this.publishedDate = new Date();
    this.metadata.updatedBy = hrAdminId;
    this.metadata.lastUpdated = new Date();
  }
  return this.save();
};

jobSchema.methods.rejectJob = function(rejectedBy, reason) {
  this.status = 'draft';
  this.addInternalNote(`Job rejected by ${rejectedBy}: ${reason}`, rejectedBy, false);
  this.metadata.updatedBy = rejectedBy;
  this.metadata.lastUpdated = new Date();
  return this.save();
};

module.exports = mongoose.model('Job', jobSchema);
