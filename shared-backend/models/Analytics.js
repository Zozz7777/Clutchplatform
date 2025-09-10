const mongoose = require('../shims/mongoose');

const analyticsSchema = new mongoose.Schema({
  // Basic Information
  type: {
    type: String,
    enum: ['executive_dashboard', 'department_analytics', 'predictive_analytics', 'custom_report', 'kpi_tracking', 'business_intelligence'],
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
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'role_based', 'department_based'],
    default: 'private'
  },

  // Executive Dashboard
  executiveDashboard: {
    overview: {
      totalRevenue: { type: Number, default: 0 },
      totalExpenses: { type: Number, default: 0 },
      netProfit: { type: Number, default: 0 },
      profitMargin: { type: Number, min: 0, max: 100, default: 0 },
      totalEmployees: { type: Number, default: 0 },
      activeProjects: { type: Number, default: 0 },
      customerSatisfaction: { type: Number, min: 0, max: 100, default: 0 },
      marketShare: { type: Number, min: 0, max: 100, default: 0 }
    },
    kpis: [{
      name: { type: String, required: true, trim: true },
      value: { type: Number, required: true },
      target: { type: Number },
      unit: { type: String, trim: true },
      trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
      change: { type: Number, default: 0 }, // percentage change
      status: { type: String, enum: ['on_track', 'at_risk', 'off_track'], default: 'on_track' },
      lastUpdated: { type: Date, default: Date.now }
    }],
    trends: [{
      metric: { type: String, required: true, trim: true },
      period: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], default: 'monthly' },
      data: [{
        date: { type: Date, required: true },
        value: { type: Number, required: true },
        target: { type: Number }
      }],
      forecast: [{
        date: { type: Date, required: true },
        value: { type: Number, required: true },
        confidence: { type: Number, min: 0, max: 100 }
      }]
    }],
    alerts: [{
      type: { type: String, enum: ['threshold', 'trend', 'anomaly', 'milestone'], required: true },
      title: { type: String, required: true, trim: true },
      message: { type: String, required: true, trim: true },
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
      triggeredAt: { type: Date, default: Date.now },
      acknowledged: { type: Boolean, default: false },
      acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      acknowledgedAt: { type: Date },
      resolved: { type: Boolean, default: false },
      resolvedAt: { type: Date }
    }]
  },

  // Department Analytics
  departmentAnalytics: {
    department: {
      type: String,
      enum: ['hr', 'finance', 'sales', 'marketing', 'operations', 'support', 'admin', 'all'],
      required: true
    },
    metrics: {
      productivity: { type: Number, min: 0, max: 100, default: 0 },
      efficiency: { type: Number, min: 0, max: 100, default: 0 },
      quality: { type: Number, min: 0, max: 100, default: 0 },
      satisfaction: { type: Number, min: 0, max: 100, default: 0 },
      turnover: { type: Number, min: 0, max: 100, default: 0 },
      costPerOutput: { type: Number, min: 0, default: 0 }
    },
    performance: [{
      employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      metric: { type: String, required: true, trim: true },
      value: { type: Number, required: true },
      target: { type: Number },
      period: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'monthly' },
      date: { type: Date, default: Date.now }
    }],
    comparisons: [{
      metric: { type: String, required: true, trim: true },
      currentPeriod: { type: Number, required: true },
      previousPeriod: { type: Number, required: true },
      change: { type: Number, default: 0 }, // percentage
      trend: { type: String, enum: ['improving', 'declining', 'stable'], default: 'stable' }
    }],
    insights: [{
      insight: { type: String, required: true, trim: true },
      category: { type: String, enum: ['performance', 'trend', 'anomaly', 'opportunity', 'risk'], required: true },
      impact: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' },
      confidence: { type: Number, min: 0, max: 100, default: 0 },
      generatedAt: { type: Date, default: Date.now },
      actionable: { type: Boolean, default: false },
      recommendations: [{ type: String, trim: true }]
    }]
  },

  // Predictive Analytics
  predictiveAnalytics: {
    model: {
      name: { type: String, required: true, trim: true },
      type: { type: String, enum: ['regression', 'classification', 'clustering', 'time_series', 'neural_network'], required: true },
      version: { type: String, default: '1.0' },
      accuracy: { type: Number, min: 0, max: 100, default: 0 },
      lastTrained: { type: Date },
      nextTraining: { type: Date }
    },
    forecasting: {
      metric: { type: String, required: true, trim: true },
      horizon: { type: Number, required: true }, // days, weeks, months
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly'], default: 'monthly' },
      predictions: [{
        date: { type: Date, required: true },
        predictedValue: { type: Number, required: true },
        confidenceInterval: {
          lower: { type: Number, required: true },
          upper: { type: Number, required: true }
        },
        actualValue: { type: Number },
        accuracy: { type: Number, min: 0, max: 100 }
      }],
      accuracyMetrics: {
        mae: { type: Number, default: 0 }, // Mean Absolute Error
        mape: { type: Number, default: 0 }, // Mean Absolute Percentage Error
        rmse: { type: Number, default: 0 } // Root Mean Square Error
      }
    },
    insights: [{
      insight: { type: String, required: true, trim: true },
      type: { type: String, enum: ['trend', 'pattern', 'anomaly', 'correlation', 'causation'], required: true },
      confidence: { type: Number, min: 0, max: 100, required: true },
      impact: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
      timeframe: { type: String, enum: ['immediate', 'short_term', 'long_term'], default: 'short_term' },
      generatedAt: { type: Date, default: Date.now },
      actionable: { type: Boolean, default: false },
      recommendations: [{ type: String, trim: true }]
    }],
    recommendations: [{
      category: { type: String, enum: ['optimization', 'risk_mitigation', 'opportunity', 'efficiency'], required: true },
      title: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true },
      expectedImpact: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
      implementationEffort: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
      priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
      estimatedROI: { type: Number, min: 0, default: 0 },
      generatedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'approved', 'implemented', 'rejected'], default: 'pending' }
    }],
    riskAssessment: {
      overallRisk: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
      riskScore: { type: Number, min: 0, max: 100, default: 0 },
      factors: [{
        factor: { type: String, required: true, trim: true },
        riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
        probability: { type: Number, min: 0, max: 100, required: true },
        impact: { type: Number, min: 0, max: 100, required: true },
        mitigation: { type: String, trim: true }
      }],
      lastUpdated: { type: Date, default: Date.now }
    }
  },

  // Custom Reporting
  customReport: {
    reportType: {
      type: String,
      enum: ['table', 'chart', 'dashboard', 'export', 'scheduled'],
      default: 'table'
    },
    dataSource: {
      type: { type: String, enum: ['database', 'api', 'file', 'manual'], required: true },
      connection: { type: String, trim: true },
      query: { type: String, trim: true },
      parameters: { type: mongoose.Schema.Types.Mixed }
    },
    filters: [{
      field: { type: String, required: true, trim: true },
      operator: { type: String, enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'between', 'in', 'not_in'], required: true },
      value: { type: mongoose.Schema.Types.Mixed, required: true },
      required: { type: Boolean, default: false }
    }],
    columns: [{
      field: { type: String, required: true, trim: true },
      displayName: { type: String, required: true, trim: true },
      type: { type: String, enum: ['string', 'number', 'date', 'boolean', 'currency', 'percentage'], required: true },
      format: { type: String, trim: true },
      sortable: { type: Boolean, default: true },
      filterable: { type: Boolean, default: true },
      visible: { type: Boolean, default: true }
    }],
    aggregations: [{
      field: { type: String, required: true, trim: true },
      function: { type: String, enum: ['sum', 'average', 'count', 'min', 'max', 'median'], required: true },
      displayName: { type: String, required: true, trim: true }
    }],
    charts: [{
      type: { type: String, enum: ['line', 'bar', 'pie', 'scatter', 'area', 'heatmap'], required: true },
      title: { type: String, required: true, trim: true },
      xAxis: { type: String, required: true, trim: true },
      yAxis: { type: String, required: true, trim: true },
      series: [{ type: String, trim: true }],
      options: { type: mongoose.Schema.Types.Mixed }
    }],
    scheduling: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly'], default: 'weekly' },
      dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = Sunday
      dayOfMonth: { type: Number, min: 1, max: 31 },
      time: { type: String, trim: true }, // HH:MM format
      timezone: { type: String, default: 'UTC' },
      recipients: [{ type: String, trim: true }],
      format: { type: String, enum: ['pdf', 'excel', 'csv', 'html'], default: 'pdf' }
    }
  },

  // KPI Tracking
  kpiTracking: {
    category: {
      type: String,
      enum: ['financial', 'operational', 'customer', 'employee', 'quality', 'safety', 'compliance'],
      required: true
    },
    kpis: [{
      name: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      formula: { type: String, trim: true },
      target: { type: Number },
      current: { type: Number, default: 0 },
      previous: { type: Number, default: 0 },
      change: { type: Number, default: 0 }, // percentage
      trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
      status: { type: String, enum: ['on_track', 'at_risk', 'off_track'], default: 'on_track' },
      unit: { type: String, trim: true },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], default: 'monthly' },
      lastUpdated: { type: Date, default: Date.now },
      history: [{
        date: { type: Date, required: true },
        value: { type: Number, required: true },
        target: { type: Number }
      }]
    }],
    alerts: [{
      kpi: { type: String, required: true, trim: true },
      condition: { type: String, enum: ['above_target', 'below_target', 'threshold_breach'], required: true },
      threshold: { type: Number, required: true },
      triggeredAt: { type: Date, default: Date.now },
      resolved: { type: Boolean, default: false },
      resolvedAt: { type: Date }
    }]
  },

  // Business Intelligence
  businessIntelligence: {
    dataWarehouse: {
      lastSync: { type: Date },
      tables: [{
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        rowCount: { type: Number, default: 0 },
        lastUpdated: { type: Date }
      }],
      connections: [{
        name: { type: String, required: true, trim: true },
        type: { type: String, enum: ['mysql', 'postgresql', 'mongodb', 'snowflake', 'bigquery'], required: true },
        status: { type: String, enum: ['active', 'inactive', 'error'], default: 'active' },
        lastTested: { type: Date }
      }]
    },
    dataQuality: {
      overallScore: { type: Number, min: 0, max: 100, default: 0 },
      metrics: [{
        metric: { type: String, required: true, trim: true },
        score: { type: Number, min: 0, max: 100, required: true },
        issues: { type: Number, default: 0 },
        lastChecked: { type: Date, default: Date.now }
      }],
      issues: [{
        type: { type: String, enum: ['missing_data', 'duplicate_data', 'invalid_format', 'outdated_data'], required: true },
        severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
        description: { type: String, required: true, trim: true },
        affectedRecords: { type: Number, default: 0 },
        detectedAt: { type: Date, default: Date.now },
        resolved: { type: Boolean, default: false },
        resolvedAt: { type: Date }
      }]
    },
    dataGovernance: {
      policies: [{
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
        lastReviewed: { type: Date },
        nextReview: { type: Date }
      }],
      accessControl: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, required: true, trim: true },
        permissions: [{ type: String, trim: true }],
        grantedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date }
      }]
    }
  },

  // Settings & Configuration
  settings: {
    refreshInterval: { type: Number, default: 300 }, // seconds
    dataRetention: { type: Number, default: 365 }, // days
    exportFormats: [{ type: String, enum: ['pdf', 'excel', 'csv', 'json'], default: 'pdf' }],
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    accessControl: {
      public: { type: Boolean, default: false },
      authorizedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      authorizedRoles: [{ type: String, trim: true }],
      authorizedDepartments: [{ type: String, trim: true }]
    }
  },

  // Analytics & Performance
  analytics: {
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    exports: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    averageLoadTime: { type: Number, min: 0 }, // milliseconds
    lastAccessed: { type: Date },
    popularSections: [{
      section: { type: String, required: true, trim: true },
      views: { type: Number, default: 0 },
      timeSpent: { type: Number, default: 0 } // seconds
    }]
  },

  // Audit & History
  audit: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    publishedAt: { type: Date },
    archivedAt: { type: Date },
    version: { type: String, default: '1.0' },
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
analyticsSchema.index({ type: 1, status: 1 });
analyticsSchema.index({ 'departmentAnalytics.department': 1 });
analyticsSchema.index({ 'executiveDashboard.kpis.name': 1 });
analyticsSchema.index({ 'predictiveAnalytics.forecasting.metric': 1 });
analyticsSchema.index({ 'customReport.scheduling.enabled': 1 });
analyticsSchema.index({ 'kpiTracking.category': 1 });
analyticsSchema.index({ visibility: 1, createdAt: -1 });

// Virtuals
analyticsSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

analyticsSchema.virtual('isPublic').get(function() {
  return this.visibility === 'public';
});

analyticsSchema.virtual('totalKPIs').get(function() {
  if (this.type === 'executive_dashboard') {
    return this.executiveDashboard.kpis.length;
  } else if (this.type === 'kpi_tracking') {
    return this.kpiTracking.kpis.length;
  }
  return 0;
});

analyticsSchema.virtual('activeAlerts').get(function() {
  if (this.type === 'executive_dashboard') {
    return this.executiveDashboard.alerts.filter(alert => !alert.resolved).length;
  } else if (this.type === 'kpi_tracking') {
    return this.kpiTracking.alerts.filter(alert => !alert.resolved).length;
  }
  return 0;
});

// Pre-save middleware
analyticsSchema.pre('save', function(next) {
  // Update analytics
  this.analytics.lastAccessed = new Date();
  
  // Calculate net profit for executive dashboard
  if (this.type === 'executive_dashboard') {
    this.executiveDashboard.overview.netProfit = 
      this.executiveDashboard.overview.totalRevenue - this.executiveDashboard.overview.totalExpenses;
    
    if (this.executiveDashboard.overview.totalRevenue > 0) {
      this.executiveDashboard.overview.profitMargin = 
        (this.executiveDashboard.overview.netProfit / this.executiveDashboard.overview.totalRevenue) * 100;
    }
  }
  
  next();
});

// Static methods
analyticsSchema.statics.findByDepartment = function(department) {
  return this.find({
    type: 'department_analytics',
    'departmentAnalytics.department': department,
    status: 'active'
  }).populate('audit.createdBy', 'name email');
};

analyticsSchema.statics.findExpiringKPIs = function(days = 7) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  return this.find({
    type: 'kpi_tracking',
    'kpiTracking.kpis.lastUpdated': { $lte: expiryDate }
  }).populate('audit.createdBy', 'name email');
};

analyticsSchema.statics.findHighRiskPredictions = function() {
  return this.find({
    type: 'predictive_analytics',
    'predictiveAnalytics.riskAssessment.overallRisk': { $in: ['high', 'critical'] }
  }).populate('audit.createdBy', 'name email');
};

// Instance methods
analyticsSchema.methods.updateKPI = function(kpiName, value, target = null) {
  if (this.type === 'executive_dashboard') {
    const kpi = this.executiveDashboard.kpis.find(k => k.name === kpiName);
    if (kpi) {
      const previousValue = kpi.value;
      kpi.value = value;
      kpi.target = target;
      kpi.lastUpdated = new Date();
      
      if (previousValue !== 0) {
        kpi.change = ((value - previousValue) / previousValue) * 100;
        kpi.trend = kpi.change > 0 ? 'up' : kpi.change < 0 ? 'down' : 'stable';
      }
      
      if (target && value >= target) {
        kpi.status = 'on_track';
      } else if (target && value < target * 0.8) {
        kpi.status = 'off_track';
      } else {
        kpi.status = 'at_risk';
      }
    }
  }
  
  return this.save();
};

analyticsSchema.methods.addAlert = function(alertData) {
  if (this.type === 'executive_dashboard') {
    this.executiveDashboard.alerts.push({
      ...alertData,
      triggeredAt: new Date()
    });
  }
  
  return this.save();
};

module.exports = mongoose.model('Analytics', analyticsSchema);
