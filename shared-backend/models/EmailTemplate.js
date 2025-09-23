const mongoose = require('../shims/mongoose');

const emailTemplateSchema = new mongoose.Schema({
  // Template Information
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'application_received',
      'interview_invite',
      'interview_reminder',
      'interview_followup',
      'offer_letter',
      'rejection',
      'welcome_new_employee',
      'approval_request',
      'approval_approved',
      'approval_rejected',
      'job_published',
      'job_closed',
      'custom'
    ],
    required: true,
    index: true
  },
  
  // Template Content
  subject: {
    type: String,
    required: true,
    trim: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  textContent: {
    type: String,
    required: true
  },
  
  // Template Variables
  variables: [{
    name: { type: String, required: true },
    description: String,
    defaultValue: String,
    isRequired: { type: Boolean, default: false }
  }],
  
  // Template Settings
  settings: {
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    category: { 
      type: String, 
      enum: ['recruitment', 'hr', 'approval', 'notification', 'marketing'],
      default: 'recruitment'
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    }
  },
  
  // Usage Analytics
  analytics: {
    usageCount: { type: Number, default: 0 },
    lastUsed: Date,
    successRate: { type: Number, default: 0 }, // email delivery success rate
    openRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 }
  },
  
  // Template Versioning
  version: {
    current: { type: Number, default: 1 },
    history: [{
      version: Number,
      subject: String,
      htmlContent: String,
      textContent: String,
      variables: [mongoose.Schema.Types.Mixed],
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      createdAt: { type: Date, default: Date.now },
      changeNotes: String
    }]
  },
  
  // Metadata
  metadata: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    lastUpdated: { type: Date, default: Date.now },
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for template preview
emailTemplateSchema.virtual('preview').get(function() {
  return {
    subject: this.subject,
    content: this.htmlContent.substring(0, 200) + '...',
    variables: this.variables.length
  };
});

// Indexes
emailTemplateSchema.index({ name: 1 });
emailTemplateSchema.index({ type: 1 });
emailTemplateSchema.index({ 'settings.isActive': 1 });
emailTemplateSchema.index({ 'settings.category': 1 });
emailTemplateSchema.index({ 'settings.language': 1 });

// Pre-save middleware
emailTemplateSchema.pre('save', function(next) {
  // Create version history entry if content changed
  if (this.isModified('subject') || this.isModified('htmlContent') || this.isModified('textContent')) {
    this.version.history.push({
      version: this.version.current,
      subject: this.subject,
      htmlContent: this.htmlContent,
      textContent: this.textContent,
      variables: this.variables,
      createdBy: this.metadata.updatedBy || this.metadata.createdBy,
      changeNotes: 'Auto-saved version'
    });
    
    this.version.current += 1;
  }
  
  if (this.isModified('metadata.lastUpdated')) {
    this.metadata.lastUpdated = new Date();
  }
  
  next();
});

// Static methods
emailTemplateSchema.statics.findByType = function(type) {
  return this.find({ 
    type: type, 
    'settings.isActive': true 
  }).sort({ 'settings.priority': 1, createdAt: -1 });
};

emailTemplateSchema.statics.findDefaultTemplate = function(type) {
  return this.findOne({ 
    type: type, 
    'settings.isDefault': true,
    'settings.isActive': true 
  });
};

emailTemplateSchema.statics.findByCategory = function(category) {
  return this.find({ 
    'settings.category': category, 
    'settings.isActive': true 
  }).sort({ name: 1 });
};

emailTemplateSchema.statics.getTemplateStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalUsage: { $sum: '$analytics.usageCount' },
        avgSuccessRate: { $avg: '$analytics.successRate' }
      }
    }
  ]);
};

// Instance methods
emailTemplateSchema.methods.incrementUsage = function() {
  this.analytics.usageCount += 1;
  this.analytics.lastUsed = new Date();
  return this.save();
};

emailTemplateSchema.methods.updateAnalytics = function(analyticsData) {
  this.analytics = { ...this.analytics, ...analyticsData };
  return this.save();
};

emailTemplateSchema.methods.createVersion = function(changeNotes, createdBy) {
  this.version.history.push({
    version: this.version.current,
    subject: this.subject,
    htmlContent: this.htmlContent,
    textContent: this.textContent,
    variables: this.variables,
    createdBy: createdBy,
    changeNotes: changeNotes
  });
  
  this.version.current += 1;
  this.metadata.updatedBy = createdBy;
  this.metadata.lastUpdated = new Date();
  
  return this.save();
};

emailTemplateSchema.methods.renderTemplate = function(variables = {}) {
  let renderedSubject = this.subject;
  let renderedHtml = this.htmlContent;
  let renderedText = this.textContent;
  
  // Replace variables in content
  Object.keys(variables).forEach(key => {
    const placeholder = `{{${key}}}`;
    const value = variables[key] || '';
    
    renderedSubject = renderedSubject.replace(new RegExp(placeholder, 'g'), value);
    renderedHtml = renderedHtml.replace(new RegExp(placeholder, 'g'), value);
    renderedText = renderedText.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return {
    subject: renderedSubject,
    htmlContent: renderedHtml,
    textContent: renderedText
  };
};

emailTemplateSchema.methods.validateVariables = function(variables) {
  const errors = [];
  
  this.variables.forEach(variable => {
    if (variable.isRequired && (!variables[variable.name] || variables[variable.name].trim() === '')) {
      errors.push(`Required variable '${variable.name}' is missing or empty`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

emailTemplateSchema.methods.setAsDefault = function() {
  // Remove default flag from other templates of the same type
  return this.constructor.updateMany(
    { type: this.type, _id: { $ne: this._id } },
    { $set: { 'settings.isDefault': false } }
  ).then(() => {
    this.settings.isDefault = true;
    return this.save();
  });
};

emailTemplateSchema.methods.duplicate = function(newName, createdBy) {
  const duplicate = new this.constructor({
    name: newName,
    type: this.type,
    subject: this.subject,
    htmlContent: this.htmlContent,
    textContent: this.textContent,
    variables: this.variables,
    settings: {
      ...this.settings,
      isDefault: false
    },
    metadata: {
      createdBy: createdBy,
      tags: this.metadata.tags
    }
  });
  
  return duplicate.save();
};

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
