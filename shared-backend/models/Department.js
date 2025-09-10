const mongoose = require('../shims/mongoose');

const departmentSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, trim: true },
  
  // Organizational Structure
  parentDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  childDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  level: { type: Number, default: 1 },
  hierarchy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  
  // Management
  departmentHead: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  deputyHead: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  
  // Budget & Resources
  budget: {
    annual: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    fiscalYear: { type: String },
    allocated: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 }
  },
  
  // Personnel
  employeeCount: { type: Number, default: 0 },
  maxEmployees: { type: Number },
  positions: [{
    title: String,
    count: Number,
    filled: Number,
    salaryRange: {
      min: Number,
      max: Number
    }
  }],
  
  // Location & Contact
  location: {
    office: String,
    floor: String,
    building: String,
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  
  contact: {
    phone: String,
    email: String,
    extension: String
  },
  
  // Settings & Policies
  settings: {
    workSchedule: {
      startTime: String,
      endTime: String,
      timezone: String,
      workDays: [String]
    },
    leavePolicy: {
      vacationDays: { type: Number, default: 20 },
      sickDays: { type: Number, default: 10 },
      personalDays: { type: Number, default: 5 }
    },
    approvalWorkflow: {
      leaveApproval: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
      expenseApproval: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
      purchaseApproval: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }]
    }
  },
  
  // Performance Metrics
  metrics: {
    employeeSatisfaction: { type: Number, min: 0, max: 100 },
    productivity: { type: Number, min: 0, max: 100 },
    turnoverRate: { type: Number, min: 0, max: 100 },
    budgetUtilization: { type: Number, min: 0, max: 100 },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'merged', 'dissolved'],
    default: 'active'
  },
  
  // History
  history: [{
    action: { type: String, enum: ['created', 'updated', 'merged', 'dissolved'] },
    date: { type: Date, default: Date.now },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    details: String,
    previousValues: mongoose.Schema.Types.Mixed
  }],
  
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

// Virtual for department hierarchy
departmentSchema.virtual('fullHierarchy').get(function() {
  return this.hierarchy.map(dept => dept.name).join(' > ');
});

// Indexes
// Note: name and code already have unique: true which creates indexes automatically
departmentSchema.index({ parentDepartment: 1 });
departmentSchema.index({ departmentHead: 1 });
departmentSchema.index({ status: 1 });
departmentSchema.index({ level: 1 });

// Pre-save middleware
departmentSchema.pre('save', function(next) {
  if (this.isModified('metadata.lastUpdated')) {
    this.metadata.lastUpdated = new Date();
  }
  next();
});

// Static methods
departmentSchema.statics.findActiveDepartments = function() {
  return this.find({ status: 'active' });
};

departmentSchema.statics.findByLevel = function(level) {
  return this.find({ level: level });
};

departmentSchema.statics.findRootDepartments = function() {
  return this.find({ parentDepartment: null });
};

// Instance methods
departmentSchema.methods.getEmployees = function() {
  return this.model('Employee').find({ 'employment.department': this._id });
};

departmentSchema.methods.getChildDepartments = function() {
  return this.model('Department').find({ parentDepartment: this._id });
};

departmentSchema.methods.updateEmployeeCount = function() {
  return this.model('Employee').countDocuments({ 'employment.department': this._id })
    .then(count => {
      this.employeeCount = count;
      return this.save();
    });
};

departmentSchema.methods.addHistory = function(action, performedBy, details, previousValues) {
  this.history.push({
    action,
    performedBy,
    details,
    previousValues
  });
  return this.save();
};

module.exports = mongoose.model('Department', departmentSchema);
