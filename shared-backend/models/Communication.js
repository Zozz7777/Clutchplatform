const mongoose = require('../shims/mongoose');

const communicationSchema = new mongoose.Schema({
  // Basic Information
  type: {
    type: String,
    enum: ['message', 'meeting', 'announcement', 'document', 'poll', 'event'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'delivered', 'read', 'archived', 'deleted'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },

  // Sender & Recipients
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'delivered', 'read', 'archived'], default: 'pending' },
    readAt: { type: Date },
    archivedAt: { type: Date }
  }],
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  departments: [{
    type: String,
    enum: ['all', 'hr', 'finance', 'sales', 'marketing', 'operations', 'support', 'admin']
  }],

  // Message Specific Fields
  message: {
    threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Communication' },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Communication' },
    isReply: { type: Boolean, default: false },
    attachments: [{
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now }
    }],
    mentions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      position: { type: Number } // Position in content where mentioned
    }],
    reactions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      emoji: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }]
  },

  // Meeting Specific Fields
  meeting: {
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    timezone: { type: String, default: 'UTC' },
    location: {
      type: { type: String, enum: ['physical', 'virtual', 'hybrid'], default: 'virtual' },
      address: { type: String, trim: true },
      room: { type: String, trim: true },
      virtualLink: { type: String, trim: true },
      virtualPlatform: { type: String, enum: ['zoom', 'teams', 'google_meet', 'webex', 'other'], default: 'zoom' }
    },
    agenda: [{ type: String, trim: true }],
    attendees: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['invited', 'accepted', 'declined', 'tentative'], default: 'invited' },
      responseAt: { type: Date },
      notes: { type: String, trim: true }
    }],
    recording: {
      enabled: { type: Boolean, default: false },
      url: { type: String, trim: true },
      password: { type: String, trim: true }
    },
    notes: [{
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: { type: String, required: true, trim: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }],
    followUp: {
      required: { type: Boolean, default: false },
      dueDate: { type: Date },
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      description: { type: String, trim: true }
    }
  },

  // Announcement Specific Fields
  announcement: {
    category: {
      type: String,
      enum: ['company', 'department', 'project', 'policy', 'event', 'reminder', 'achievement', 'other'],
      default: 'company'
    },
    targetAudience: {
      type: String,
      enum: ['all', 'employees', 'managers', 'departments', 'specific'],
      default: 'all'
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'confidential'],
      default: 'public'
    },
    scheduledFor: { type: Date },
    expiresAt: { type: Date },
    requiresAcknowledgment: { type: Boolean, default: false },
    acknowledgments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      acknowledgedAt: { type: Date, default: Date.now },
      ipAddress: { type: String, trim: true }
    }],
    tags: [{ type: String, trim: true }],
    featured: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false }
  },

  // Document Collaboration Fields
  document: {
    type: {
      type: String,
      enum: ['document', 'spreadsheet', 'presentation', 'form', 'whiteboard', 'other'],
      default: 'document'
    },
    url: { type: String, trim: true },
    version: { type: String, default: '1.0' },
    collaborators: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['viewer', 'commenter', 'editor', 'owner'], default: 'viewer' },
      addedAt: { type: Date, default: Date.now }
    }],
    comments: [{
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: { type: String, required: true, trim: true },
      position: { type: Number }, // Position in document
      createdAt: { type: Date, default: Date.now },
      replies: [{
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now }
      }]
    }],
    versionHistory: [{
      version: { type: String, required: true },
      url: { type: String, required: true },
      changes: { type: String, trim: true },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }]
  },

  // Poll Fields
  poll: {
    question: { type: String, required: true, trim: true },
    options: [{
      text: { type: String, required: true, trim: true },
      votes: { type: Number, default: 0 },
      voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    allowMultiple: { type: Boolean, default: false },
    anonymous: { type: Boolean, default: false },
    expiresAt: { type: Date },
    results: {
      totalVotes: { type: Number, default: 0 },
      participationRate: { type: Number, min: 0, max: 100, default: 0 },
      winningOption: { type: Number }, // Index of winning option
      closedAt: { type: Date }
    }
  },

  // Event Fields
  event: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    allDay: { type: Boolean, default: false },
    location: {
      type: { type: String, enum: ['physical', 'virtual', 'hybrid'], default: 'physical' },
      address: { type: String, trim: true },
      virtualLink: { type: String, trim: true }
    },
    category: {
      type: String,
      enum: ['team_building', 'training', 'celebration', 'meeting', 'conference', 'other'],
      default: 'team_building'
    },
    capacity: { type: Number, min: 0 },
    registered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    waitlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    description: { type: String, trim: true },
    agenda: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    budget: {
      amount: { type: Number, min: 0 },
      currency: { type: String, default: 'USD' },
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: { type: Date }
    }
  },

  // Settings & Preferences
  settings: {
    encrypted: { type: Boolean, default: false },
    allowReplies: { type: Boolean, default: true },
    allowForwarding: { type: Boolean, default: true },
    requireConfirmation: { type: Boolean, default: false },
    autoArchive: { type: Boolean, default: false },
    archiveAfter: { type: Number, default: 30 }, // days
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },

  // Analytics & Tracking
  analytics: {
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    engagement: { type: Number, min: 0, max: 100, default: 0 }, // percentage
    responseTime: { type: Number, min: 0 }, // average response time in minutes
    readTime: { type: Number, min: 0 } // average time spent reading in seconds
  },

  // Audit & History
  audit: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    archivedAt: { type: Date },
    deletedAt: { type: Date },
    history: [{
      action: { type: String, required: true, trim: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
      details: { type: String, trim: true }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
communicationSchema.index({ type: 1, status: 1 });
communicationSchema.index({ sender: 1, createdAt: -1 });
communicationSchema.index({ 'recipients.user': 1, status: 1 });
communicationSchema.index({ 'meeting.startTime': 1 });
communicationSchema.index({ 'announcement.scheduledFor': 1 });
communicationSchema.index({ 'announcement.expiresAt': 1 });
communicationSchema.index({ 'event.startDate': 1 });
communicationSchema.index({ 'message.threadId': 1 });
communicationSchema.index({ priority: 1, createdAt: -1 });

// Virtuals
communicationSchema.virtual('isRead').get(function() {
  return this.status === 'read';
});

communicationSchema.virtual('isUrgent').get(function() {
  return this.priority === 'urgent';
});

communicationSchema.virtual('isMeeting').get(function() {
  return this.type === 'meeting';
});

communicationSchema.virtual('isAnnouncement').get(function() {
  return this.type === 'announcement';
});

communicationSchema.virtual('readCount').get(function() {
  return this.recipients.filter(r => r.status === 'read').length;
});

communicationSchema.virtual('deliveryRate').get(function() {
  if (this.recipients.length === 0) return 0;
  return (this.recipients.filter(r => r.status === 'delivered').length / this.recipients.length) * 100;
});

// Pre-save middleware
communicationSchema.pre('save', function(next) {
  // Set sent timestamp when status changes to sent
  if (this.isModified('status') && this.status === 'sent' && !this.audit.sentAt) {
    this.audit.sentAt = new Date();
  }
  
  // Update analytics
  if (this.recipients.length > 0) {
    this.analytics.engagement = (this.readCount / this.recipients.length) * 100;
  }
  
  next();
});

// Static methods
communicationSchema.statics.findByUser = function(userId, filters = {}) {
  const query = {
    $or: [
      { sender: userId },
      { 'recipients.user': userId },
      { 'departments': 'all' }
    ],
    ...filters
  };
  
  return this.find(query)
    .populate('sender', 'name email avatar')
    .populate('recipients.user', 'name email avatar')
    .sort({ createdAt: -1 });
};

communicationSchema.statics.findUnreadByUser = function(userId) {
  return this.find({
    'recipients.user': userId,
    'recipients.status': { $in: ['pending', 'delivered'] }
  }).populate('sender', 'name email avatar');
};

communicationSchema.statics.findMeetingsByUser = function(userId, startDate, endDate) {
  return this.find({
    type: 'meeting',
    'meeting.attendees.user': userId,
    'meeting.startTime': { $gte: startDate, $lte: endDate }
  }).populate('sender', 'name email avatar');
};

// Instance methods
communicationSchema.methods.markAsRead = function(userId) {
  const recipient = this.recipients.find(r => r.user.toString() === userId.toString());
  if (recipient) {
    recipient.status = 'read';
    recipient.readAt = new Date();
  }
  
  if (this.audit.readAt === null) {
    this.audit.readAt = new Date();
  }
  
  return this.save();
};

communicationSchema.methods.addRecipient = function(userId) {
  const existingRecipient = this.recipients.find(r => r.user.toString() === userId.toString());
  if (!existingRecipient) {
    this.recipients.push({
      user: userId,
      status: 'pending'
    });
  }
  
  return this.save();
};

communicationSchema.methods.removeRecipient = function(userId) {
  this.recipients = this.recipients.filter(r => r.user.toString() !== userId.toString());
  return this.save();
};

module.exports = mongoose.model('Communication', communicationSchema);
