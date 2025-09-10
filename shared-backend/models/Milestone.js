const mongoose = require('../shims/mongoose');

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  startDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone'
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  budget: {
    estimated: {
      type: Number,
      min: 0
    },
    actual: {
      type: Number,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  deliverables: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['document', 'code', 'design', 'report', 'presentation', 'other'],
      default: 'other'
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'review'],
      default: 'pending'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: {
      type: Date
    },
    completedDate: {
      type: Date
    },
    attachments: [{
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  acceptanceCriteria: [{
    criterion: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date
    }
  }],
  risks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    probability: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    impact: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    mitigation: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['open', 'mitigated', 'closed'],
      default: 'open'
    }
  }],
  notes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  notifications: {
    dueDateReminder: {
      type: Boolean,
      default: true
    },
    overdueAlert: {
      type: Boolean,
      default: true
    },
    completionNotification: {
      type: Boolean,
      default: true
    }
  },
  analytics: {
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    totalDeliverables: {
      type: Number,
      default: 0
    },
    completedDeliverables: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    revisions: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
milestoneSchema.index({ project: 1, status: 1 });
milestoneSchema.index({ assignedTo: 1, status: 1 });
milestoneSchema.index({ dueDate: 1 });
milestoneSchema.index({ priority: 1, dueDate: 1 });
milestoneSchema.index({ tags: 1 });

// Virtuals
milestoneSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.status !== 'completed' && new Date() > this.dueDate;
});

milestoneSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

milestoneSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.dueDate) return null;
  const start = new Date(this.startDate);
  const end = new Date(this.dueDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
});

milestoneSchema.virtual('taskCompletionRate').get(function() {
  if (this.analytics.totalTasks === 0) return 0;
  return (this.analytics.completedTasks / this.analytics.totalTasks) * 100;
});

milestoneSchema.virtual('deliverableCompletionRate').get(function() {
  if (this.analytics.totalDeliverables === 0) return 0;
  return (this.analytics.completedDeliverables / this.analytics.totalDeliverables) * 100;
});

milestoneSchema.virtual('acceptanceCriteriaCompletionRate').get(function() {
  if (this.acceptanceCriteria.length === 0) return 0;
  const completed = this.acceptanceCriteria.filter(criteria => criteria.completed).length;
  return (completed / this.acceptanceCriteria.length) * 100;
});

// Pre-save middleware
milestoneSchema.pre('save', function(next) {
  // Update analytics
  this.analytics.totalTasks = this.tasks.length;
  this.analytics.totalDeliverables = this.deliverables.length;
  this.analytics.completedDeliverables = this.deliverables.filter(d => d.status === 'completed').length;
  
  // Set completed date when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
  
  next();
});

// Static methods
milestoneSchema.statics.findOverdueMilestones = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $ne: 'completed' }
  }).populate('project assignedTo');
};

milestoneSchema.statics.findMilestonesByProject = function(projectId, filters = {}) {
  const query = { project: projectId, ...filters };
  return this.find(query)
    .populate('assignedTo', 'name email')
    .populate('tasks', 'title status')
    .sort({ dueDate: 1 });
};

milestoneSchema.statics.findMilestonesByUser = function(userId, filters = {}) {
  const query = { assignedTo: userId, ...filters };
  return this.find(query)
    .populate('project', 'name code')
    .populate('tasks', 'title status')
    .sort({ dueDate: 1 });
};

milestoneSchema.statics.getMilestoneStatistics = async function(projectId = null) {
  const matchStage = projectId ? { project: mongoose.Types.ObjectId(projectId) } : {};
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalEstimatedHours: { $sum: '$estimatedHours' },
        totalActualHours: { $sum: '$actualHours' },
        avgProgress: { $avg: '$progress' }
      }
    }
  ]);
};

// Instance methods
milestoneSchema.methods.addTask = function(taskId) {
  if (!this.tasks.includes(taskId)) {
    this.tasks.push(taskId);
  }
  return this.save();
};

milestoneSchema.methods.removeTask = function(taskId) {
  this.tasks = this.tasks.filter(task => task.toString() !== taskId.toString());
  return this.save();
};

milestoneSchema.methods.addDeliverable = function(deliverable) {
  this.deliverables.push(deliverable);
  return this.save();
};

milestoneSchema.methods.updateDeliverable = function(deliverableId, updateData) {
  const deliverable = this.deliverables.id(deliverableId);
  if (deliverable) {
    Object.assign(deliverable, updateData);
  }
  return this.save();
};

milestoneSchema.methods.removeDeliverable = function(deliverableId) {
  this.deliverables = this.deliverables.filter(d => d._id.toString() !== deliverableId);
  return this.save();
};

milestoneSchema.methods.addAcceptanceCriteria = function(criterion) {
  this.acceptanceCriteria.push({
    criterion: criterion
  });
  return this.save();
};

milestoneSchema.methods.completeAcceptanceCriteria = function(criteriaIndex, userId) {
  if (criteriaIndex >= 0 && criteriaIndex < this.acceptanceCriteria.length) {
    this.acceptanceCriteria[criteriaIndex].completed = true;
    this.acceptanceCriteria[criteriaIndex].completedBy = userId;
    this.acceptanceCriteria[criteriaIndex].completedAt = new Date();
  }
  return this.save();
};

milestoneSchema.methods.addRisk = function(riskData) {
  this.risks.push(riskData);
  return this.save();
};

milestoneSchema.methods.updateRisk = function(riskId, updateData) {
  const risk = this.risks.id(riskId);
  if (risk) {
    Object.assign(risk, updateData);
  }
  return this.save();
};

milestoneSchema.methods.removeRisk = function(riskId) {
  this.risks = this.risks.filter(r => r._id.toString() !== riskId);
  return this.save();
};

milestoneSchema.methods.addNote = function(userId, content) {
  this.notes.push({
    user: userId,
    content: content
  });
  return this.save();
};

milestoneSchema.methods.updateProgress = function(progress) {
  this.progress = Math.max(0, Math.min(100, progress));
  if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedDate = new Date();
  }
  return this.save();
};

milestoneSchema.methods.calculateProgress = async function() {
  // Calculate progress based on tasks
  const Task = mongoose.model('Task');
  const tasks = await Task.find({ _id: { $in: this.tasks } });
  
  if (tasks.length === 0) {
    this.progress = 0;
  } else {
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    this.progress = (completedTasks / tasks.length) * 100;
  }
  
  return this.save();
};

module.exports = mongoose.model('Milestone', milestoneSchema);
