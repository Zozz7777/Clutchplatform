const mongoose = require('../shims/mongoose');

const legalSchema = new mongoose.Schema({
  // Basic Information
  type: {
    type: String,
    enum: ['contract', 'policy', 'compliance', 'document', 'case', 'risk_assessment'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'active', 'expired', 'terminated', 'archived'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },

  // Contract Specific Fields
  contract: {
    contractNumber: { type: String, required: true, unique: true, trim: true },
    contractType: {
      type: String,
      enum: ['employment', 'vendor', 'client', 'partnership', 'nda', 'msa', 'sow', 'other'],
      required: true
    },
    parties: [{
      name: { type: String, required: true, trim: true },
      type: { type: String, enum: ['company', 'individual', 'partnership'], required: true },
      role: { type: String, enum: ['client', 'vendor', 'partner', 'employee'], required: true },
      contact: {
        name: { type: String, trim: true },
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
        address: { type: String, trim: true }
      },
      signature: {
        signed: { type: Boolean, default: false },
        signedAt: { type: Date },
        signatureMethod: { type: String, enum: ['digital', 'wet_signature', 'electronic'], default: 'digital' },
        ipAddress: { type: String, trim: true }
      }
    }],
    terms: {
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      duration: { type: Number }, // in months
      autoRenew: { type: Boolean, default: false },
      renewalTerm: { type: Number }, // in months
      terminationNotice: { type: Number }, // in days
      terminationClause: { type: String, trim: true }
    },
    financial: {
      totalValue: { type: Number, min: 0 },
      currency: { type: String, default: 'USD' },
      paymentTerms: { type: String, trim: true },
      billingSchedule: { type: String, enum: ['monthly', 'quarterly', 'annually', 'milestone', 'other'], default: 'monthly' },
      latePaymentPenalty: { type: Number, min: 0 }, // percentage
      earlyPaymentDiscount: { type: Number, min: 0 } // percentage
    },
    obligations: [{
      party: { type: String, required: true, trim: true },
      obligation: { type: String, required: true, trim: true },
      dueDate: { type: Date },
      status: { type: String, enum: ['pending', 'in_progress', 'completed', 'overdue'], default: 'pending' },
      completedAt: { type: Date },
      notes: { type: String, trim: true }
    }],
    amendments: [{
      amendmentNumber: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true },
      effectiveDate: { type: Date, required: true },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: { type: Date },
      documentUrl: { type: String, trim: true }
    }],
    compliance: {
      regulatoryRequirements: [{ type: String, trim: true }],
      certifications: [{ type: String, trim: true }],
      insuranceRequirements: [{ type: String, trim: true }],
      auditRequirements: { type: String, trim: true }
    }
  },

  // Policy Specific Fields
  policy: {
    policyNumber: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      enum: ['hr', 'finance', 'security', 'it', 'operations', 'compliance', 'safety', 'other'],
      required: true
    },
    scope: {
      type: String,
      enum: ['company_wide', 'department', 'role_based', 'location_based'],
      default: 'company_wide'
    },
    targetAudience: [{
      type: String,
      enum: ['all_employees', 'managers', 'hr_staff', 'finance_staff', 'it_staff', 'contractors', 'vendors']
    }],
    effectiveDate: { type: Date, required: true },
    reviewDate: { type: Date },
    approvalWorkflow: [{
      role: { type: String, required: true, trim: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      comments: { type: String, trim: true },
      approvedAt: { type: Date }
    }],
    training: {
      required: { type: Boolean, default: false },
      frequency: { type: String, enum: ['once', 'annually', 'quarterly', 'monthly'], default: 'once' },
      completionDeadline: { type: Date },
      trainingMaterials: [{ type: String, trim: true }]
    },
    acknowledgments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      acknowledgedAt: { type: Date, default: Date.now },
      ipAddress: { type: String, trim: true },
      version: { type: String, default: '1.0' }
    }]
  },

  // Compliance Specific Fields
  compliance: {
    regulation: { type: String, required: true, trim: true },
    jurisdiction: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['data_protection', 'financial', 'employment', 'environmental', 'health_safety', 'industry_specific', 'other'],
      required: true
    },
    requirements: [{
      requirement: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      deadline: { type: Date },
      status: { type: String, enum: ['pending', 'in_progress', 'compliant', 'non_compliant', 'exempt'], default: 'pending' },
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      completedAt: { type: Date },
      evidence: [{ type: String, trim: true }]
    }],
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    penalties: {
      description: { type: String, trim: true },
      amount: { type: Number, min: 0 },
      currency: { type: String, default: 'USD' }
    },
    audits: [{
      auditDate: { type: Date, required: true },
      auditor: { type: String, required: true, trim: true },
      findings: { type: String, trim: true },
      status: { type: String, enum: ['passed', 'failed', 'conditional'], default: 'passed' },
      recommendations: [{ type: String, trim: true }],
      followUpDate: { type: Date }
    }],
    reporting: {
      frequency: { type: String, enum: ['monthly', 'quarterly', 'annually', 'as_needed'], default: 'annually' },
      nextReportDate: { type: Date },
      lastReportDate: { type: Date },
      reportRecipients: [{ type: String, trim: true }]
    }
  },

  // Document Management
  document: {
    documentType: {
      type: String,
      enum: ['contract', 'policy', 'procedure', 'form', 'template', 'certificate', 'license', 'other'],
      required: true
    },
    version: { type: String, default: '1.0' },
    fileUrl: { type: String, required: true, trim: true },
    fileSize: { type: Number, min: 0 },
    mimeType: { type: String, trim: true },
    checksum: { type: String, trim: true },
    versionHistory: [{
      version: { type: String, required: true },
      fileUrl: { type: String, required: true },
      changes: { type: String, trim: true },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }],
    accessControl: {
      public: { type: Boolean, default: false },
      authorizedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      authorizedRoles: [{ type: String, trim: true }],
      authorizedDepartments: [{ type: String, trim: true }]
    },
    security: {
      encrypted: { type: Boolean, default: false },
      watermark: { type: Boolean, default: false },
      downloadTracking: { type: Boolean, default: true },
      accessLogging: { type: Boolean, default: true }
    },
    metadata: {
      tags: [{ type: String, trim: true }],
      keywords: [{ type: String, trim: true }],
      language: { type: String, default: 'en' },
      classification: { type: String, enum: ['public', 'internal', 'confidential', 'restricted'], default: 'internal' }
    }
  },

  // Legal Case Management
  case: {
    caseNumber: { type: String, required: true, unique: true, trim: true },
    caseType: {
      type: String,
      enum: ['litigation', 'arbitration', 'mediation', 'regulatory', 'internal', 'other'],
      required: true
    },
    jurisdiction: { type: String, required: true, trim: true },
    court: { type: String, trim: true },
    opposingParty: {
      name: { type: String, required: true, trim: true },
      type: { type: String, enum: ['individual', 'company', 'government'], required: true },
      contact: {
        name: { type: String, trim: true },
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
        address: { type: String, trim: true }
      }
    },
    legalTeam: [{
      role: { type: String, required: true, trim: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      externalCounsel: { type: String, trim: true },
      contact: {
        email: { type: String, trim: true },
        phone: { type: String, trim: true }
      }
    }],
    timeline: [{
      date: { type: Date, required: true },
      event: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      documents: [{ type: String, trim: true }],
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    financial: {
      estimatedCost: { type: Number, min: 0 },
      actualCost: { type: Number, min: 0 },
      budget: { type: Number, min: 0 },
      currency: { type: String, default: 'USD' },
      invoices: [{
        invoiceNumber: { type: String, trim: true },
        amount: { type: Number, required: true, min: 0 },
        date: { type: Date, required: true },
        status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' }
      }]
    },
    outcome: {
      status: { type: String, enum: ['pending', 'settled', 'won', 'lost', 'dismissed'], default: 'pending' },
      settlementAmount: { type: Number, min: 0 },
      judgmentAmount: { type: Number, min: 0 },
      resolutionDate: { type: Date },
      notes: { type: String, trim: true }
    }
  },

  // Risk Assessment
  riskAssessment: {
    riskType: {
      type: String,
      enum: ['legal', 'compliance', 'operational', 'financial', 'reputational', 'strategic'],
      required: true
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    probability: { type: Number, min: 1, max: 5 }, // 1-5 scale
    impact: { type: Number, min: 1, max: 5 }, // 1-5 scale
    riskScore: { type: Number, min: 1, max: 25 }, // probability * impact
    description: { type: String, required: true, trim: true },
    mitigation: [{
      strategy: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      deadline: { type: Date },
      status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
      completedAt: { type: Date }
    }],
    monitoring: {
      frequency: { type: String, enum: ['weekly', 'monthly', 'quarterly', 'annually'], default: 'monthly' },
      nextReview: { type: Date },
      lastReview: { type: Date },
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  },

  // Analytics & Reporting
  analytics: {
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    complianceRate: { type: Number, min: 0, max: 100, default: 0 }, // percentage
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
    costImpact: { type: Number, min: 0, default: 0 },
    timeToResolution: { type: Number, min: 0 }, // in days
    stakeholderSatisfaction: { type: Number, min: 0, max: 5, default: 0 }
  },

  // Audit & History
  audit: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    publishedAt: { type: Date },
    archivedAt: { type: Date },
    history: [{
      action: { type: String, required: true, trim: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
      details: { type: String, trim: true },
      changes: { type: mongoose.Schema.Types.Mixed }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
legalSchema.index({ type: 1, status: 1 });
legalSchema.index({ 'contract.contractNumber': 1 });
legalSchema.index({ 'policy.policyNumber': 1 });
legalSchema.index({ 'case.caseNumber': 1 });
legalSchema.index({ 'contract.terms.endDate': 1 });
legalSchema.index({ 'policy.effectiveDate': 1 });
legalSchema.index({ 'compliance.regulation': 1 });
legalSchema.index({ priority: 1, createdAt: -1 });

// Virtuals
legalSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

legalSchema.virtual('isExpired').get(function() {
  if (this.type === 'contract' && this.contract.terms.endDate) {
    return new Date() > this.contract.terms.endDate;
  }
  return false;
});

legalSchema.virtual('daysUntilExpiry').get(function() {
  if (this.type === 'contract' && this.contract.terms.endDate) {
    const now = new Date();
    const expiry = new Date(this.contract.terms.endDate);
    const diffTime = expiry - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

legalSchema.virtual('complianceStatus').get(function() {
  if (this.type === 'compliance') {
    const totalRequirements = this.compliance.requirements.length;
    const compliantRequirements = this.compliance.requirements.filter(r => r.status === 'compliant').length;
    return totalRequirements > 0 ? (compliantRequirements / totalRequirements) * 100 : 0;
  }
  return 0;
});

// Pre-save middleware
legalSchema.pre('save', function(next) {
  // Calculate risk score for risk assessments
  if (this.type === 'risk_assessment' && this.riskAssessment.probability && this.riskAssessment.impact) {
    this.riskAssessment.riskScore = this.riskAssessment.probability * this.riskAssessment.impact;
  }
  
  // Update analytics
  if (this.type === 'compliance') {
    this.analytics.complianceRate = this.complianceStatus;
  }
  
  next();
});

// Static methods
legalSchema.statics.findExpiringContracts = function(days = 30) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  return this.find({
    type: 'contract',
    status: 'active',
    'contract.terms.endDate': { $lte: expiryDate, $gte: new Date() }
  }).populate('audit.createdBy', 'name email');
};

legalSchema.statics.findNonCompliantItems = function() {
  return this.find({
    type: 'compliance',
    'compliance.requirements.status': 'non_compliant'
  }).populate('audit.createdBy', 'name email');
};

legalSchema.statics.findHighRiskItems = function() {
  return this.find({
    $or: [
      { 'riskAssessment.riskLevel': 'critical' },
      { 'riskAssessment.riskLevel': 'high' },
      { 'compliance.riskLevel': 'critical' },
      { 'compliance.riskLevel': 'high' }
    ]
  }).populate('audit.createdBy', 'name email');
};

// Instance methods
legalSchema.methods.updateComplianceStatus = function(requirementIndex, status, evidence = []) {
  if (this.type === 'compliance' && this.compliance.requirements[requirementIndex]) {
    this.compliance.requirements[requirementIndex].status = status;
    this.compliance.requirements[requirementIndex].completedAt = new Date();
    this.compliance.requirements[requirementIndex].evidence = evidence;
  }
  
  return this.save();
};

legalSchema.methods.addAmendment = function(amendmentData) {
  if (this.type === 'contract') {
    this.contract.amendments.push({
      ...amendmentData,
      amendmentNumber: `AM-${this.contract.amendments.length + 1}`
    });
  }
  
  return this.save();
};

module.exports = mongoose.model('Legal', legalSchema);
