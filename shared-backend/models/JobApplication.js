const mongoose = require('../shims/mongoose');

const jobApplicationSchema = new mongoose.Schema({
  // Application Information
  applicationId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  
  // Candidate Information
  candidate: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      trim: true, 
      lowercase: true,
      index: true
    },
    phone: { type: String, trim: true },
    location: {
      city: String,
      state: String,
      country: { type: String, default: 'Egypt' },
      postalCode: String
    },
    website: String,
    linkedin: String,
    github: String,
    portfolio: String
  },
  
  // Application Documents
  resume: {
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  },
  coverLetter: {
    text: String,
    filename: String,
    url: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  },
  portfolio: {
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  },
  otherDocuments: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now },
    type: { type: String, enum: ['certificate', 'reference', 'other'] }
  }],
  
  // Application Answers
  customAnswers: [{
    question: { type: String, required: true },
    answer: { type: String, required: true },
    questionType: { 
      type: String, 
      enum: ['text', 'textarea', 'select', 'checkbox', 'radio', 'file'],
      default: 'text'
    }
  }],
  
  // Application Status & Workflow
  status: {
    type: String,
    enum: ['applied', 'screened', 'interview_scheduled', 'interview_completed', 'offer_made', 'hired', 'rejected', 'withdrawn'],
    default: 'applied',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Interview Information
  interviews: [{
    type: { 
      type: String, 
      enum: ['phone', 'video', 'in-person', 'technical', 'panel'],
      required: true
    },
    scheduledDate: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // in minutes
    location: String,
    meetingLink: String,
    interviewer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Employee' 
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comments: String,
      strengths: [String],
      weaknesses: [String],
      recommendation: {
        type: String,
        enum: ['strong_hire', 'hire', 'no_hire', 'strong_no_hire']
      }
    },
    notes: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Offer Information
  offer: {
    salary: {
      amount: Number,
      currency: { type: String, default: 'EGP' },
      frequency: { type: String, enum: ['monthly', 'annually'], default: 'monthly' }
    },
    benefits: [String],
    startDate: Date,
    offerDate: Date,
    expiryDate: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired'],
      default: 'pending'
    },
    notes: String
  },
  
  // Scoring & Evaluation
  scoring: {
    overall: { type: Number, min: 1, max: 5, default: 0 },
    technical: { type: Number, min: 1, max: 5, default: 0 },
    cultural: { type: Number, min: 1, max: 5, default: 0 },
    communication: { type: Number, min: 1, max: 5, default: 0 },
    experience: { type: Number, min: 1, max: 5, default: 0 },
    education: { type: Number, min: 1, max: 5, default: 0 },
    notes: String,
    scoredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    scoredAt: Date
  },
  
  // Source Tracking
  source: {
    type: { 
      type: String, 
      enum: ['careers_page', 'linkedin', 'indeed', 'referral', 'recruiter', 'other'],
      default: 'careers_page'
    },
    referrer: String,
    campaign: String,
    utm_source: String,
    utm_medium: String,
    utm_campaign: String
  },
  
  // HR Notes & Comments
  notes: [{
    note: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['general', 'interview', 'reference', 'background_check', 'other'],
      default: 'general'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    createdAt: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: false }
  }],
  
  // Tags for organization
  tags: [String],
  
  // Compliance & Consent
  consent: {
    dataProcessing: { type: Boolean, required: true },
    communication: { type: Boolean, required: true },
    backgroundCheck: { type: Boolean, default: false },
    consentDate: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String
  },
  
  // Timeline
  timeline: [{
    action: { type: String, required: true },
    description: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    performedAt: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Email Communication
  emailHistory: [{
    type: { 
      type: String, 
      enum: ['application_received', 'interview_invite', 'interview_reminder', 'offer', 'rejection', 'other'],
      required: true
    },
    subject: String,
    content: String,
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    sentAt: { type: Date, default: Date.now },
    template: String
  }],
  
  // Analytics
  analytics: {
    timeToFirstResponse: Number, // in hours
    timeToInterview: Number, // in days
    timeToOffer: Number, // in days
    timeToHire: Number, // in days
    interviewCount: { type: Number, default: 0 },
    emailCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for candidate full name
jobApplicationSchema.virtual('candidateFullName').get(function() {
  return `${this.candidate.firstName} ${this.candidate.lastName}`;
});

// Virtual for application age
jobApplicationSchema.virtual('applicationAge').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
});

// Indexes
jobApplicationSchema.index({ 'candidate.email': 1, job: 1 }, { unique: true });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ priority: 1 });
jobApplicationSchema.index({ createdAt: -1 });
jobApplicationSchema.index({ 'source.type': 1 });
jobApplicationSchema.index({ 'scoring.overall': -1 });

// Pre-save middleware
jobApplicationSchema.pre('save', function(next) {
  // Generate application ID
  if (this.isNew && !this.applicationId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.applicationId = `APP-${timestamp}-${random}`.toUpperCase();
  }
  
  // Add timeline entry for status changes
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      action: 'status_changed',
      description: `Status changed to ${this.status}`,
      performedAt: new Date()
    });
  }
  
  next();
});

// Static methods
jobApplicationSchema.statics.findByJob = function(jobId) {
  return this.find({ job: jobId }).populate('job', 'title department');
};

jobApplicationSchema.statics.findByStatus = function(status) {
  return this.find({ status: status }).populate('job', 'title department');
};

jobApplicationSchema.statics.findByCandidate = function(email) {
  return this.find({ 'candidate.email': email }).populate('job', 'title department');
};

jobApplicationSchema.statics.getApplicationStats = function(jobId) {
  return this.aggregate([
    { $match: { job: mongoose.Types.ObjectId(jobId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgScore: { $avg: '$scoring.overall' }
      }
    }
  ]);
};

// Instance methods
jobApplicationSchema.methods.addNote = function(note, type, createdBy, isPrivate = false) {
  this.notes.push({
    note,
    type,
    createdBy,
    isPrivate
  });
  return this.save();
};

jobApplicationSchema.methods.scheduleInterview = function(interviewData) {
  this.interviews.push(interviewData);
  this.status = 'interview_scheduled';
  this.timeline.push({
    action: 'interview_scheduled',
    description: `Interview scheduled for ${interviewData.scheduledDate}`,
    performedBy: interviewData.interviewer,
    metadata: interviewData
  });
  return this.save();
};

jobApplicationSchema.methods.completeInterview = function(interviewId, feedback) {
  const interview = this.interviews.id(interviewId);
  if (interview) {
    interview.status = 'completed';
    interview.feedback = feedback;
    this.analytics.interviewCount += 1;
    this.timeline.push({
      action: 'interview_completed',
      description: 'Interview completed',
      metadata: { interviewId, feedback }
    });
  }
  return this.save();
};

jobApplicationSchema.methods.makeOffer = function(offerData) {
  this.offer = offerData;
  this.status = 'offer_made';
  this.timeline.push({
    action: 'offer_made',
    description: `Offer made with salary ${offerData.salary.amount} ${offerData.salary.currency}`,
    metadata: offerData
  });
  return this.save();
};

jobApplicationSchema.methods.hire = function() {
  this.status = 'hired';
  this.timeline.push({
    action: 'hired',
    description: 'Candidate hired',
    performedAt: new Date()
  });
  return this.save();
};

jobApplicationSchema.methods.reject = function(reason, rejectedBy) {
  this.status = 'rejected';
  this.addNote(`Application rejected: ${reason}`, 'general', rejectedBy, false);
  this.timeline.push({
    action: 'rejected',
    description: `Application rejected: ${reason}`,
    performedBy: rejectedBy,
    performedAt: new Date()
  });
  return this.save();
};

jobApplicationSchema.methods.updateScoring = function(scoringData, scoredBy) {
  this.scoring = { ...this.scoring, ...scoringData };
  this.scoring.scoredBy = scoredBy;
  this.scoring.scoredAt = new Date();
  this.timeline.push({
    action: 'scored',
    description: `Application scored: ${scoringData.overall}/5`,
    performedBy: scoredBy,
    performedAt: new Date()
  });
  return this.save();
};

jobApplicationSchema.methods.addEmailRecord = function(emailData) {
  this.emailHistory.push(emailData);
  this.analytics.emailCount += 1;
  return this.save();
};

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
