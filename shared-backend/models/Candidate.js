const mongoose = require('../shims/mongoose');

const candidateSchema = new mongoose.Schema({
  // Basic Information
  basicInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
    profilePicture: { type: String },
    linkedinUrl: { type: String },
    portfolioUrl: { type: String },
    website: { type: String }
  },

  // Contact Information
  contact: {
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
  },

  // Professional Information
  professional: {
    currentPosition: String,
    currentCompany: String,
    yearsOfExperience: Number,
    expectedSalary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' }
    },
    noticePeriod: Number, // in days
    availability: { type: String, enum: ['immediate', '2-weeks', '1-month', '3-months', 'negotiable'] },
    workAuthorization: { type: String, enum: ['citizen', 'permanent-resident', 'work-visa', 'student-visa', 'other'] },
    relocation: { type: Boolean, default: false },
    remoteWork: { type: Boolean, default: false }
  },

  // Skills & Experience
  skills: [{
    name: String,
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
    yearsOfExperience: Number,
    category: String
  }],

  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    isCurrent: { type: Boolean, default: false },
    description: String,
    achievements: [String],
    technologies: [String]
  }],

  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    gpa: Number,
    isCurrent: { type: Boolean, default: false },
    description: String
  }],

  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    status: { type: String, enum: ['active', 'expired', 'pending'] }
  }],

  // Application Information
  applications: [{
    jobPosting: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
    appliedDate: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'],
      default: 'applied'
    },
    currentStage: { type: String },
    stageHistory: [{
      stage: String,
      date: { type: Date, default: Date.now },
      notes: String,
      interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
    }],
    coverLetter: String,
    resume: String,
    portfolio: String,
    references: [{
      name: String,
      position: String,
      company: String,
      email: String,
      phone: String,
      relationship: String
    }],
    assessments: [{
      type: String,
      score: Number,
      maxScore: Number,
      completedDate: Date,
      results: String
    }],
    interviews: [{
      type: { type: String, enum: ['phone', 'video', 'onsite', 'technical', 'final'] },
      scheduledDate: Date,
      completedDate: Date,
      interviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
      notes: String,
      rating: { type: Number, min: 1, max: 5 },
      feedback: String,
      status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no-show'] }
    }],
    offers: [{
      position: String,
      salary: {
        base: Number,
        bonus: Number,
        benefits: [String]
      },
      startDate: Date,
      status: { type: String, enum: ['pending', 'accepted', 'rejected', 'expired'] },
      responseDate: Date,
      notes: String
    }]
  }],

  // Source & Tracking
  source: {
    primary: { type: String, enum: ['job-board', 'referral', 'recruiter', 'social-media', 'company-website', 'other'] },
    secondary: String,
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    campaign: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String
  },

  // Communication History
  communications: [{
    type: { type: String, enum: ['email', 'phone', 'sms', 'in-person', 'video'] },
    direction: { type: String, enum: ['inbound', 'outbound'] },
    subject: String,
    content: String,
    date: { type: Date, default: Date.now },
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: { type: String, enum: ['sent', 'delivered', 'read', 'failed'] }
  }],

  // Notes & Feedback
  notes: [{
    note: String,
    category: { type: String, enum: ['general', 'technical', 'cultural', 'reference', 'other'] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    createdAt: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: false }
  }],

  // Status & Pipeline
  status: { 
    type: String, 
    enum: ['active', 'passive', 'placed', 'archived', 'blacklisted'],
    default: 'active'
  },
  
  pipeline: {
    currentStage: String,
    stageHistory: [{
      stage: String,
      date: { type: Date, default: Date.now },
      reason: String
    }],
    nextAction: String,
    nextActionDate: Date,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
  },

  // Analytics
  analytics: {
    totalApplications: { type: Number, default: 0 },
    interviewsCompleted: { type: Number, default: 0 },
    offersReceived: { type: Number, default: 0 },
    timeInPipeline: Number, // in days
    engagementScore: { type: Number, min: 0, max: 100 },
    lastActivity: { type: Date, default: Date.now }
  },

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
candidateSchema.virtual('fullName').get(function() {
  return `${this.basicInfo.firstName} ${this.basicInfo.lastName}`;
});

// Virtual for current application
candidateSchema.virtual('currentApplication').get(function() {
  return this.applications.find(app => 
    ['applied', 'screening', 'interview', 'offer'].includes(app.status)
  );
});

// Indexes
// Note: basicInfo.email already has unique: true which creates an index automatically
candidateSchema.index({ 'basicInfo.firstName': 1, 'basicInfo.lastName': 1 });
candidateSchema.index({ status: 1 });
candidateSchema.index({ 'pipeline.currentStage': 1 });
candidateSchema.index({ 'pipeline.assignedTo': 1 });
candidateSchema.index({ 'source.primary': 1 });
candidateSchema.index({ 'professional.currentCompany': 1 });
candidateSchema.index({ 'analytics.lastActivity': -1 });

// Pre-save middleware
candidateSchema.pre('save', function(next) {
  if (this.isModified('metadata.lastUpdated')) {
    this.metadata.lastUpdated = new Date();
  }
  next();
});

// Static methods
candidateSchema.statics.findActiveCandidates = function() {
  return this.find({ status: 'active' });
};

candidateSchema.statics.findByStage = function(stage) {
  return this.find({ 'pipeline.currentStage': stage });
};

candidateSchema.statics.findBySource = function(source) {
  return this.find({ 'source.primary': source });
};

// Instance methods
candidateSchema.methods.addApplication = function(application) {
  this.applications.push(application);
  this.analytics.totalApplications += 1;
  return this.save();
};

candidateSchema.methods.updateStage = function(newStage, reason) {
  this.pipeline.currentStage = newStage;
  this.pipeline.stageHistory.push({
    stage: newStage,
    reason: reason
  });
  return this.save();
};

candidateSchema.methods.addNote = function(note, createdBy, category = 'general', isPrivate = false) {
  this.notes.push({
    note,
    category,
    createdBy,
    isPrivate
  });
  return this.save();
};

candidateSchema.methods.addCommunication = function(communication) {
  this.communications.push(communication);
  this.analytics.lastActivity = new Date();
  return this.save();
};

candidateSchema.methods.scheduleInterview = function(interview) {
  const application = this.applications.find(app => app.jobPosting.toString() === interview.jobPosting);
  if (application) {
    application.interviews.push(interview);
  }
  return this.save();
};

module.exports = mongoose.model('Candidate', candidateSchema);
