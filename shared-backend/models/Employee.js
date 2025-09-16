const mongoose = require('../shims/mongoose');
const { ROLES } = require('../config/roles');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: false,
    unique: true,
    trim: true
  },
  // Authentication fields
  password: {
    type: String,
    required: true
  },
  // Primary role (for backward compatibility)
  role: {
    type: String,
    enum: [
      'head_administrator', 'platform_admin', 'enterprise_client', 'service_provider',
      'business_analyst', 'customer_support', 'hr_manager', 'finance_officer',
      'legal_team', 'project_manager', 'asset_manager', 'vendor_manager',
      // Legacy role values for backward compatibility
      'admin', 'manager', 'viewer', 'fleet_manager', 'enterprise_manager', 
      'sales_manager', 'analytics', 'management', 'operations', 'sales_rep',
      'legal_manager', 'legal', 'compliance', 'employee'
    ],
    default: 'employee'
  },
  // Multiple roles support
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  // Direct permissions (for custom permissions)
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  loginAttempts: {
    type: Number,
    default: 0
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockUntil: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // End authentication fields
  basicInfo: {
    firstName: {
      type: String,
      required: false,
      trim: true
    },
    lastName: {
      type: String,
      required: false,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say'
    },
    profilePicture: {
      type: String
    }
  },
  employment: {
    department: {
      type: String,
      enum: ['Executive', 'Human Resources', 'Finance', 'Operations', 'Marketing', 'Technology', 'Sales', 'Customer Service', 'Legal', 'Compliance', 'General'],
      required: false
    },
    position: {
      type: String,
      required: false,
      trim: true
    },
    jobTitle: {
      type: String,
      required: false,
      trim: true
    },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'intern', 'freelance'],
      default: 'full_time'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    directReports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }],
    salary: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    benefits: [{
      type: String
    }]
  },
  compensation: {
    salary: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    payFrequency: {
      type: String,
      enum: ['weekly', 'bi_weekly', 'monthly', 'quarterly', 'annually'],
      default: 'monthly'
    },
    benefits: [{
      type: {
        type: String,
        enum: ['health_insurance', 'dental_insurance', 'vision_insurance', 'life_insurance', 'retirement', 'stock_options', 'other'],
        required: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      value: {
        type: Number,
        min: 0
      },
      startDate: {
        type: Date,
        default: Date.now
      },
      endDate: {
        type: Date
      }
    }],
    lastSalaryReview: {
      type: Date
    },
    nextSalaryReview: {
      type: Date
    }
  },
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['technical', 'soft_skills', 'languages', 'certifications', 'other'],
      default: 'technical'
    },
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    yearsOfExperience: {
      type: Number,
      min: 0
    },
    certified: {
      type: Boolean,
      default: false
    },
    certificationDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    }
  }],
  education: [{
    institution: {
      type: String,
      required: true,
      trim: true
    },
    degree: {
      type: String,
      required: true,
      trim: true
    },
    fieldOfStudy: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4
    },
    description: {
      type: String,
      trim: true
    }
  }],
  performance: {
    reviews: [{
      reviewDate: {
        type: Date,
        required: true
      },
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      comments: {
        type: String,
        trim: true
      },
      goals: [{
        goal: {
          type: String,
          required: true,
          trim: true
        },
        target: {
          type: String,
          trim: true
        },
        achieved: {
          type: Boolean,
          default: false
        }
      }],
      improvements: [{
        area: {
          type: String,
          required: true,
          trim: true
        },
        action: {
          type: String,
          required: true,
          trim: true
        },
        timeline: {
          type: String,
          trim: true
        }
      }]
    }],
    kpis: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      target: {
        type: Number,
        required: true
      },
      actual: {
        type: Number,
        default: 0
      },
      period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually'],
        default: 'monthly'
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    }]
  },
  leave: {
    balance: {
      annual: {
        type: Number,
        min: 0,
        default: 20
      },
      sick: {
        type: Number,
        min: 0,
        default: 10
      },
      personal: {
        type: Number,
        min: 0,
        default: 5
      },
      other: {
        type: Number,
        min: 0,
        default: 0
      }
    },
    requests: [{
      type: {
        type: String,
        enum: ['annual', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'other'],
        required: true
      },
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      },
      days: {
        type: Number,
        required: true,
        min: 0
      },
      reason: {
        type: String,
        trim: true
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
      },
      approvedAt: {
        type: Date
      },
      comments: {
        type: String,
        trim: true
      }
    }]
  },
  documents: [{
    type: {
      type: String,
      enum: ['contract', 'id_proof', 'resume', 'certificate', 'performance_review', 'other'],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      min: 0
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date
    }
  }],
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  analytics: {
    tenure: {
      type: Number,
      default: 0
    },
    performanceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    attendanceRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    projectCount: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    totalTasks: {
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
// Note: employeeId and basicInfo.email already have unique: true which creates indexes automatically
employeeSchema.index({ 'employment.department': 1 });
employeeSchema.index({ 'employment.status': 1 });
employeeSchema.index({ 'employment.manager': 1 });
employeeSchema.index({ 'employment.hireDate': 1 });

// Virtuals
employeeSchema.virtual('fullName').get(function() {
  return `${this.basicInfo.firstName} ${this.basicInfo.lastName}`;
});

// Note: isActive is already a real field in the schema, so no virtual needed

employeeSchema.virtual('tenureYears').get(function() {
  if (!this.employment.startDate) return 0;
  const now = new Date();
  const startDate = new Date(this.employment.startDate);
  const diffTime = now - startDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
});

employeeSchema.virtual('taskCompletionRate').get(function() {
  if (this.analytics.totalTasks === 0) return 0;
  return (this.analytics.completedTasks / this.analytics.totalTasks) * 100;
});

employeeSchema.virtual('leaveBalanceTotal').get(function() {
  return this.leave.balance.annual + this.leave.balance.sick + 
         this.leave.balance.personal + this.leave.balance.other;
});

// Pre-save middleware
employeeSchema.pre('save', function(next) {
  // Calculate tenure
  if (this.employment.startDate) {
    this.analytics.tenure = this.tenureYears;
  }
  
  // Calculate task completion rate
  this.analytics.performanceScore = this.taskCompletionRate;
  
  next();
});

// Static methods
employeeSchema.statics.findByDepartment = function(departmentId) {
  return this.find({ 'employment.department': departmentId })
    .populate('employment.manager', 'basicInfo.firstName basicInfo.lastName');
};

employeeSchema.statics.findActiveEmployees = function() {
  return this.find({ 'employment.status': 'active' })
    .populate('employment.manager', 'basicInfo.firstName basicInfo.lastName');
};

employeeSchema.statics.findByManager = function(managerId) {
  return this.find({ 'employment.manager': managerId });
};

employeeSchema.statics.getEmployeeStatistics = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$employment.status',
        count: { $sum: 1 },
        avgSalary: { $avg: '$compensation.salary' },
        avgTenure: { $avg: '$analytics.tenure' }
      }
    }
  ]);
};

// Instance methods
employeeSchema.methods.updatePerformanceScore = function() {
  // Calculate performance score based on reviews
  if (this.performance.reviews.length > 0) {
    const recentReviews = this.performance.reviews
      .filter(review => {
        const reviewDate = new Date(review.reviewDate);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return reviewDate >= oneYearAgo;
      });
    
    if (recentReviews.length > 0) {
      const avgRating = recentReviews.reduce((sum, review) => sum + review.rating, 0) / recentReviews.length;
      this.analytics.performanceScore = (avgRating / 5) * 100;
    }
  }
  
  return this.save();
};

employeeSchema.methods.addLeaveRequest = function(leaveRequest) {
  this.leave.requests.push(leaveRequest);
  return this.save();
};

employeeSchema.methods.approveLeaveRequest = function(requestId, approvedBy) {
  const request = this.leave.requests.id(requestId);
  if (request) {
    request.status = 'approved';
    request.approvedBy = approvedBy;
    request.approvedAt = new Date();
    
    // Update leave balance
    const leaveType = request.type;
    if (this.leave.balance[leaveType] >= request.days) {
      this.leave.balance[leaveType] -= request.days;
    }
  }
  return this.save();
};

employeeSchema.methods.addPerformanceReview = function(review) {
  this.performance.reviews.push(review);
  return this.save();
};

employeeSchema.methods.addSkill = function(skill) {
  this.skills.push(skill);
  return this.save();
};

employeeSchema.methods.updateSkill = function(skillId, updateData) {
  const skill = this.skills.id(skillId);
  if (skill) {
    Object.assign(skill, updateData);
  }
  return this.save();
};

employeeSchema.methods.removeSkill = function(skillId) {
  this.skills = this.skills.filter(skill => skill._id.toString() !== skillId);
  return this.save();
};

employeeSchema.methods.addDocument = function(document) {
  this.documents.push(document);
  return this.save();
};

employeeSchema.methods.removeDocument = function(documentId) {
  this.documents = this.documents.filter(doc => doc._id.toString() !== documentId);
  return this.save();
};

// Instance methods for RBAC
employeeSchema.methods.hasPermission = async function(permissionName) {
  const Permission = mongoose.model('Permission');
  const Role = mongoose.model('Role');
  
  // Check direct permissions first
  const directPermissions = await Permission.find({ 
    _id: { $in: this.permissions }, 
    name: permissionName,
    isActive: true 
  });
  
  if (directPermissions.length > 0) {
    return true;
  }
  
  // Check role-based permissions
  const userRoles = await Role.find({ 
    _id: { $in: this.roles }, 
    isActive: true 
  }).populate('permissions');
  
  for (const role of userRoles) {
    const rolePermissions = await Permission.find({ 
      _id: { $in: role.permissions }, 
      name: permissionName,
      isActive: true 
    });
    
    if (rolePermissions.length > 0) {
      return true;
    }
  }
  
  // Check primary role permissions (backward compatibility)
  if (this.role) {
    const primaryRole = await Role.findOne({ name: this.role, isActive: true });
    if (primaryRole) {
      const primaryRolePermissions = await Permission.find({ 
        _id: { $in: primaryRole.permissions }, 
        name: permissionName,
        isActive: true 
      });
      
      if (primaryRolePermissions.length > 0) {
        return true;
      }
    }
  }
  
  return false;
};

employeeSchema.methods.getAllPermissions = async function() {
  const Permission = mongoose.model('Permission');
  const Role = mongoose.model('Role');
  
  const allPermissionIds = new Set();
  
  // Add direct permissions
  this.permissions.forEach(permissionId => allPermissionIds.add(permissionId.toString()));
  
  // Add role-based permissions
  const userRoles = await Role.find({ 
    _id: { $in: this.roles }, 
    isActive: true 
  });
  
  for (const role of userRoles) {
    role.permissions.forEach(permissionId => allPermissionIds.add(permissionId.toString()));
  }
  
  // Add primary role permissions (backward compatibility)
  if (this.role) {
    const primaryRole = await Role.findOne({ name: this.role, isActive: true });
    if (primaryRole) {
      primaryRole.permissions.forEach(permissionId => allPermissionIds.add(permissionId.toString()));
    }
  }
  
  // Get permission details
  const permissionIds = Array.from(allPermissionIds);
  return await Permission.find({ 
    _id: { $in: permissionIds }, 
    isActive: true 
  });
};

employeeSchema.methods.addRole = function(roleId) {
  if (!this.roles.includes(roleId)) {
    this.roles.push(roleId);
  }
  return this;
};

employeeSchema.methods.removeRole = function(roleId) {
  this.roles = this.roles.filter(role => role.toString() !== roleId.toString());
  return this;
};

employeeSchema.methods.addPermission = function(permissionId) {
  if (!this.permissions.includes(permissionId)) {
    this.permissions.push(permissionId);
  }
  return this;
};

employeeSchema.methods.removePermission = function(permissionId) {
  this.permissions = this.permissions.filter(permission => permission.toString() !== permissionId.toString());
  return this;
};

module.exports = mongoose.model('Employee', employeeSchema);
