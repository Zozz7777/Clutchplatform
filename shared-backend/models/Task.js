const mongoose = require('../shims/mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  milestone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'review', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  startDate: {
    type: Date
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
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
  }],
  comments: [{
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
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  timeEntries: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number, // in minutes
      min: 0
    },
    description: {
      type: String,
      trim: true
    },
    billable: {
      type: Boolean,
      default: true
    }
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  checklist: [{
    item: {
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
    timeSpent: {
      type: Number,
      default: 0
    },
    revisions: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    attachmentsCount: {
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
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1, dueDate: 1 });
taskSchema.index({ milestone: 1 });
taskSchema.index({ tags: 1 });

// Virtuals
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.status !== 'completed' && new Date() > this.dueDate;
});

taskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

taskSchema.virtual('totalTimeSpent').get(function() {
  return this.timeEntries.reduce((total, entry) => {
    return total + (entry.duration || 0);
  }, 0);
});

taskSchema.virtual('completionRate').get(function() {
  if (this.checklist.length === 0) return this.progress;
  const completedItems = this.checklist.filter(item => item.completed).length;
  return (completedItems / this.checklist.length) * 100;
});

// Pre-save middleware
taskSchema.pre('save', function(next) {
  // Update analytics
  this.analytics.commentsCount = this.comments.length;
  this.analytics.attachmentsCount = this.attachments.length;
  this.analytics.timeSpent = this.totalTimeSpent;
  
  // Update progress based on checklist if available
  if (this.checklist.length > 0) {
    this.progress = this.completionRate;
  }
  
  // Set completed date when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
  
  next();
});

// Static methods
taskSchema.statics.findOverdueTasks = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $ne: 'completed' }
  }).populate('project assignedTo');
};

taskSchema.statics.findTasksByUser = function(userId, filters = {}) {
  const query = { assignedTo: userId, ...filters };
  return this.find(query)
    .populate('project', 'name code')
    .populate('milestone', 'title')
    .sort({ priority: -1, dueDate: 1 });
};

taskSchema.statics.findTasksByProject = function(projectId, filters = {}) {
  const query = { project: projectId, ...filters };
  return this.find(query)
    .populate('assignedTo', 'name email')
    .populate('milestone', 'title')
    .sort({ priority: -1, dueDate: 1 });
};

taskSchema.statics.getTaskStatistics = async function(projectId = null) {
  const matchStage = projectId ? { project: mongoose.Types.ObjectId(projectId) } : {};
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalEstimatedHours: { $sum: '$estimatedHours' },
        totalActualHours: { $sum: '$actualHours' }
      }
    }
  ]);
};

// Instance methods
taskSchema.methods.addTimeEntry = function(timeEntry) {
  this.timeEntries.push(timeEntry);
  this.actualHours = this.timeEntries.reduce((total, entry) => {
    return total + (entry.duration || 0) / 60; // Convert minutes to hours
  }, 0);
  return this.save();
};

taskSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  return this.save();
};

taskSchema.methods.updateProgress = function(progress) {
  this.progress = Math.max(0, Math.min(100, progress));
  if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedDate = new Date();
  }
  return this.save();
};

taskSchema.methods.addChecklistItem = function(item) {
  this.checklist.push({
    item: item
  });
  return this.save();
};

taskSchema.methods.completeChecklistItem = function(itemIndex, userId) {
  if (itemIndex >= 0 && itemIndex < this.checklist.length) {
    this.checklist[itemIndex].completed = true;
    this.checklist[itemIndex].completedBy = userId;
    this.checklist[itemIndex].completedAt = new Date();
  }
  return this.save();
};

taskSchema.methods.addAttachment = function(attachment) {
  this.attachments.push(attachment);
  return this.save();
};

taskSchema.methods.removeAttachment = function(attachmentId) {
  this.attachments = this.attachments.filter(att => att._id.toString() !== attachmentId);
  return this.save();
};

module.exports = mongoose.model('Task', taskSchema);
