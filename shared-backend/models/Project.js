const mongoose = require('../shims/mongoose');

const projectSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  
  // Project Details
  type: { 
    type: String, 
    enum: ['development', 'design', 'marketing', 'research', 'consulting', 'maintenance', 'support', 'other'],
    required: true
  },
  
  category: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent', 'critical'],
    default: 'medium'
  },
  
  // Client & Stakeholders
  client: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    name: { type: String, required: true },
    contactPerson: String,
    email: String,
    phone: String
  },
  
  stakeholders: [{
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    name: String,
    role: String,
    email: String,
    phone: String,
    isPrimary: { type: Boolean, default: false }
  }],

  // Project Team
  team: {
    projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    leadDeveloper: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    leadDesigner: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    externalConsultants: [{
      name: String,
      role: String,
      company: String,
      email: String,
      hourlyRate: Number
    }]
  },

  // Timeline & Milestones
  timeline: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    actualStartDate: Date,
    actualEndDate: Date,
    estimatedDuration: Number, // in days
    actualDuration: Number, // in days
    phases: [{
      name: String,
      description: String,
      startDate: Date,
      endDate: Date,
      status: { type: String, enum: ['not-started', 'in-progress', 'completed', 'delayed'] },
      deliverables: [String]
    }]
  },

  milestones: [{
    name: { type: String, required: true },
    description: String,
    dueDate: { type: Date, required: true },
    completedDate: Date,
    status: { type: String, enum: ['pending', 'in-progress', 'completed', 'delayed', 'cancelled'] },
    deliverables: [{
      name: String,
      description: String,
      fileUrl: String,
      submittedDate: Date,
      approvedDate: Date,
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
    }],
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' }]
  }],

  // Budget & Financial
  budget: {
    estimated: { type: Number, required: true, min: 0 },
    actual: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD' },
    billingType: { type: String, enum: ['fixed', 'hourly', 'monthly', 'milestone'], default: 'fixed' },
    hourlyRate: Number,
    expenses: [{
      description: String,
      amount: Number,
      date: { type: Date, default: Date.now },
      category: String,
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      receipt: String
    }],
    invoices: [{
      invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
      amount: Number,
      date: Date,
      status: { type: String, enum: ['draft', 'sent', 'paid'] }
    }]
  },

  // Scope & Requirements
  scope: {
    objectives: [String],
    requirements: [{
      id: String,
      description: String,
      priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
      status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'] },
      category: String,
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
    }],
    deliverables: [{
      name: String,
      description: String,
      type: { type: String, enum: ['document', 'design', 'code', 'report', 'other'] },
      dueDate: Date,
      status: { type: String, enum: ['pending', 'in-progress', 'completed', 'reviewed'] },
      fileUrl: String,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      reviewDate: Date
    }],
    exclusions: [String],
    assumptions: [String],
    constraints: [String]
  },

  // Tasks & Work Items
  tasks: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['task', 'bug', 'feature', 'improvement', 'research'] },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'] },
    status: { type: String, enum: ['backlog', 'to-do', 'in-progress', 'review', 'testing', 'done', 'cancelled'] },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    estimatedHours: Number,
    actualHours: Number,
    startDate: Date,
    dueDate: Date,
    completedDate: Date,
    tags: [String],
    dependencies: [String], // task IDs
    subtasks: [{
      name: String,
      status: { type: String, enum: ['pending', 'completed'] },
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      completedDate: Date
    }],
    timeEntries: [{
      employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      date: { type: Date, default: Date.now },
      hours: Number,
      description: String,
      billable: { type: Boolean, default: true }
    }],
    comments: [{
      employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      comment: String,
      date: { type: Date, default: Date.now },
      isPrivate: { type: Boolean, default: false }
    }]
  }],

  // Risk Management
  risks: [{
    description: String,
    probability: { type: String, enum: ['low', 'medium', 'high'] },
    impact: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    status: { type: String, enum: ['identified', 'monitoring', 'mitigated', 'closed'] },
    mitigation: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    identifiedDate: { type: Date, default: Date.now },
    resolvedDate: Date
  }],

  // Quality Assurance
  quality: {
    standards: [String],
    reviews: [{
      type: { type: String, enum: ['code', 'design', 'documentation', 'testing'] },
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      date: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'in-progress', 'passed', 'failed'] },
      comments: String,
      score: { type: Number, min: 0, max: 100 }
    }],
    testing: {
      testPlan: String,
      testCases: [{
        name: String,
        description: String,
        expectedResult: String,
        actualResult: String,
        status: { type: String, enum: ['pending', 'passed', 'failed', 'blocked'] },
        tester: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        date: Date
      }],
      bugs: [{
        title: String,
        description: String,
        severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
        status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'] },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        reportedDate: { type: Date, default: Date.now },
        resolvedDate: Date
      }]
    }
  },

  // Communication & Collaboration
  communication: {
    meetings: [{
      title: String,
      type: { type: String, enum: ['kickoff', 'status', 'review', 'stakeholder', 'other'] },
      date: Date,
      duration: Number, // in minutes
      attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
      agenda: String,
      notes: String,
      actionItems: [{
        description: String,
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        dueDate: Date,
        status: { type: String, enum: ['pending', 'completed'] }
      }]
    }],
    documents: [{
      name: String,
      type: { type: String, enum: ['proposal', 'contract', 'specification', 'report', 'presentation', 'other'] },
      fileUrl: String,
      version: String,
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      uploadDate: { type: Date, default: Date.now },
      isPublic: { type: Boolean, default: false }
    }]
  },

  // Status & Progress
  status: { 
    type: String, 
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled', 'archived'],
    default: 'planning'
  },
  
  progress: {
    overall: { type: Number, min: 0, max: 100, default: 0 },
    phases: [{
      name: String,
      progress: { type: Number, min: 0, max: 100, default: 0 }
    }],
    lastUpdated: { type: Date, default: Date.now }
  },

  // Analytics & Metrics
  analytics: {
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    billableHours: { type: Number, default: 0 },
    efficiency: { type: Number, min: 0, max: 100, default: 0 },
    qualityScore: { type: Number, min: 0, max: 100, default: 0 },
    clientSatisfaction: { type: Number, min: 0, max: 100 },
    teamProductivity: { type: Number, min: 0, max: 100, default: 0 }
  },

  // Notes & Comments
  notes: [{
    note: String,
    category: { type: String, enum: ['general', 'technical', 'client', 'internal'] },
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

// Virtual for project duration
projectSchema.virtual('duration').get(function() {
  if (this.timeline.actualEndDate && this.timeline.actualStartDate) {
    return Math.ceil((this.timeline.actualEndDate - this.timeline.actualStartDate) / (1000 * 60 * 60 * 24));
  }
  return this.timeline.estimatedDuration;
});

// Virtual for budget variance
projectSchema.virtual('budgetVariance').get(function() {
  return this.budget.actual - this.budget.estimated;
});

// Virtual for completion percentage
projectSchema.virtual('completionPercentage').get(function() {
  return this.progress.overall;
});

// Indexes
// Note: code already has unique: true which creates an index automatically
projectSchema.index({ name: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ startDate: 1 });
projectSchema.index({ endDate: 1 });
projectSchema.index({ manager: 1 });
projectSchema.index({ team: 1 });
projectSchema.index({ client: 1 });
projectSchema.index({ budget: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ updatedAt: -1 });

// Pre-save middleware
projectSchema.pre('save', function(next) {
  if (this.isModified('metadata.lastUpdated')) {
    this.metadata.lastUpdated = new Date();
  }
  
  // Update progress
  this.updateProgress();
  
  next();
});

// Instance methods
projectSchema.methods.updateProgress = function() {
  if (this.tasks.length > 0) {
    const completedTasks = this.tasks.filter(task => task.status === 'done').length;
    this.progress.overall = Math.round((completedTasks / this.tasks.length) * 100);
    this.analytics.completedTasks = completedTasks;
    this.analytics.totalTasks = this.tasks.length;
  }
  
  this.progress.lastUpdated = new Date();
};

projectSchema.methods.addTask = function(task) {
  this.tasks.push(task);
  this.updateProgress();
  return this.save();
};

projectSchema.methods.addMilestone = function(milestone) {
  this.milestones.push(milestone);
  return this.save();
};

projectSchema.methods.addNote = function(note, createdBy, category = 'general', isPrivate = false) {
  this.notes.push({
    note,
    category,
    createdBy,
    isPrivate
  });
  return this.save();
};

projectSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'completed') {
    this.timeline.actualEndDate = new Date();
  }
  return this.save();
};

// Static methods
projectSchema.statics.findActiveProjects = function() {
  return this.find({ status: 'active' });
};

projectSchema.statics.findByClient = function(clientId) {
  return this.find({ 'client.id': clientId });
};

projectSchema.statics.findOverdueProjects = function() {
  return this.find({
    status: 'active',
    'timeline.endDate': { $lt: new Date() }
  });
};

module.exports = mongoose.model('Project', projectSchema);
