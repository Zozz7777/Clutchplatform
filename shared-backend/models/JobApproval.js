const mongoose = require('../shims/mongoose');

const jobApprovalSchema = new mongoose.Schema({
  // Approval Information
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  
  // Approval Workflow
  workflow: {
    type: String,
    enum: ['draft_to_manager', 'manager_to_hr_admin', 'hr_admin_to_published'],
    required: true
  },
  
  // Current Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Approval Levels
  approvals: [{
    level: {
      type: String,
      enum: ['manager', 'hr_admin'],
      required: true
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    action: {
      type: String,
      enum: ['approve', 'reject', 'request_changes'],
      required: true
    },
    comments: String,
    approvedAt: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Current Approver
  currentApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  
  // Approval History
  history: [{
    action: {
      type: String,
      enum: ['submitted', 'approved', 'rejected', 'requested_changes', 'cancelled'],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    comments: String,
    performedAt: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['approval_request', 'approval_approved', 'approval_rejected', 'approval_reminder'],
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    sentAt: { type: Date, default: Date.now },
    emailSent: { type: Boolean, default: false },
    readAt: Date
  }],
  
  // Timeline
  timeline: [{
    action: String,
    description: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    performedAt: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // SLA Tracking
  sla: {
    submittedAt: { type: Date, default: Date.now },
    dueDate: Date,
    responseTime: Number, // in hours
    isOverdue: { type: Boolean, default: false }
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

// Virtual for approval progress
jobApprovalSchema.virtual('progress').get(function() {
  const totalSteps = this.workflow === 'draft_to_manager' ? 2 : 3;
  const completedSteps = this.approvals.filter(approval => approval.action === 'approve').length;
  return Math.round((completedSteps / totalSteps) * 100);
});

// Virtual for time since submission
jobApprovalSchema.virtual('timeSinceSubmission').get(function() {
  const now = new Date();
  const submitted = new Date(this.sla.submittedAt);
  return Math.floor((now - submitted) / (1000 * 60 * 60)); // in hours
});

// Indexes
jobApprovalSchema.index({ job: 1 });
jobApprovalSchema.index({ status: 1 });
jobApprovalSchema.index({ currentApprover: 1 });
jobApprovalSchema.index({ 'sla.dueDate': 1 });
jobApprovalSchema.index({ createdAt: -1 });

// Pre-save middleware
jobApprovalSchema.pre('save', function(next) {
  // Set due date based on SLA (e.g., 48 hours for manager approval, 24 hours for HR admin)
  if (this.isNew) {
    const slaHours = this.workflow === 'draft_to_manager' ? 48 : 24;
    this.sla.dueDate = new Date(Date.now() + slaHours * 60 * 60 * 1000);
  }
  
  // Check if overdue
  if (this.sla.dueDate && new Date() > this.sla.dueDate && this.status === 'pending') {
    this.sla.isOverdue = true;
  }
  
  // Calculate response time
  if (this.status !== 'pending' && this.sla.submittedAt) {
    const responseTime = (new Date() - new Date(this.sla.submittedAt)) / (1000 * 60 * 60);
    this.sla.responseTime = Math.round(responseTime);
  }
  
  if (this.isModified('metadata.lastUpdated')) {
    this.metadata.lastUpdated = new Date();
  }
  
  next();
});

// Static methods
jobApprovalSchema.statics.findPendingApprovals = function(approverId) {
  return this.find({ 
    currentApprover: approverId, 
    status: 'pending' 
  }).populate('job', 'title department hiringManager');
};

jobApprovalSchema.statics.findOverdueApprovals = function() {
  return this.find({ 
    status: 'pending',
    'sla.isOverdue': true 
  }).populate('job', 'title department').populate('currentApprover', 'basicInfo.firstName basicInfo.lastName');
};

jobApprovalSchema.statics.getApprovalStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$sla.responseTime' }
      }
    }
  ]);
};

// Instance methods
jobApprovalSchema.methods.approve = function(approverId, comments = '') {
  const approval = {
    level: this.workflow === 'draft_to_manager' ? 'manager' : 'hr_admin',
    approver: approverId,
    action: 'approve',
    comments,
    approvedAt: new Date()
  };
  
  this.approvals.push(approval);
  this.history.push({
    action: 'approved',
    performedBy: approverId,
    comments,
    performedAt: new Date()
  });
  
  // Move to next approval level or complete
  if (this.workflow === 'draft_to_manager') {
    this.workflow = 'manager_to_hr_admin';
    // Set new current approver (HR Admin)
    // This would need to be set based on your HR Admin logic
  } else if (this.workflow === 'manager_to_hr_admin') {
    this.workflow = 'hr_admin_to_published';
    this.status = 'approved';
  }
  
  this.metadata.updatedBy = approverId;
  this.metadata.lastUpdated = new Date();
  
  return this.save();
};

jobApprovalSchema.methods.reject = function(approverId, comments = '') {
  const approval = {
    level: this.workflow === 'draft_to_manager' ? 'manager' : 'hr_admin',
    approver: approverId,
    action: 'reject',
    comments,
    approvedAt: new Date()
  };
  
  this.approvals.push(approval);
  this.history.push({
    action: 'rejected',
    performedBy: approverId,
    comments,
    performedAt: new Date()
  });
  
  this.status = 'rejected';
  this.metadata.updatedBy = approverId;
  this.metadata.lastUpdated = new Date();
  
  return this.save();
};

jobApprovalSchema.methods.requestChanges = function(approverId, comments = '') {
  const approval = {
    level: this.workflow === 'draft_to_manager' ? 'manager' : 'hr_admin',
    approver: approverId,
    action: 'request_changes',
    comments,
    approvedAt: new Date()
  };
  
  this.approvals.push(approval);
  this.history.push({
    action: 'requested_changes',
    performedBy: approverId,
    comments,
    performedAt: new Date()
  });
  
  // Reset to draft for changes
  this.workflow = 'draft_to_manager';
  this.status = 'pending';
  this.metadata.updatedBy = approverId;
  this.metadata.lastUpdated = new Date();
  
  return this.save();
};

jobApprovalSchema.methods.addNotification = function(type, recipientId) {
  this.notifications.push({
    type,
    recipient: recipientId,
    sentAt: new Date()
  });
  return this.save();
};

jobApprovalSchema.methods.markNotificationRead = function(notificationId, recipientId) {
  const notification = this.notifications.id(notificationId);
  if (notification && notification.recipient.toString() === recipientId.toString()) {
    notification.readAt = new Date();
  }
  return this.save();
};

jobApprovalSchema.methods.addTimelineEntry = function(action, description, performedBy, metadata = {}) {
  this.timeline.push({
    action,
    description,
    performedBy,
    performedAt: new Date(),
    metadata
  });
  return this.save();
};

module.exports = mongoose.model('JobApproval', jobApprovalSchema);
