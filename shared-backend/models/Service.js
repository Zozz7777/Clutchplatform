const mongoose = require('../shims/mongoose');

const serviceSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    required: true,
    unique: true,
    default: () => `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  type: {
    type: String,
    required: true,
    enum: ['maintenance', 'repair', 'inspection', 'diagnostic', 'emergency', 'other'],
    default: 'maintenance'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  serviceItems: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    laborHours: {
      type: Number,
      min: 0,
      default: 0
    },
    laborRate: {
      type: Number,
      min: 0,
      default: 0
    }
  }],
  laborCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  partsCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  discountAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD']
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  serviceCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCenter'
  },
  scheduledDate: Date,
  startDate: Date,
  completedDate: Date,
  estimatedDuration: {
    type: Number, // in hours
    min: 0
  },
  actualDuration: {
    type: Number, // in hours
    min: 0
  },
  warranty: {
    type: String,
    enum: ['none', '30_days', '90_days', '6_months', '1_year', '2_years'],
    default: 'none'
  },
  warrantyExpiry: Date,
  notes: String,
  customerNotes: String,
  technicianNotes: String,
  beforePhotos: [String], // URLs to photos
  afterPhotos: [String], // URLs to photos
  documents: [String], // URLs to documents
  metadata: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes
serviceSchema.index({ serviceId: 1 });
serviceSchema.index({ customer: 1 });
serviceSchema.index({ vehicle: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ type: 1 });
serviceSchema.index({ priority: 1 });
serviceSchema.index({ assignedTechnician: 1 });
serviceSchema.index({ serviceCenter: 1 });
serviceSchema.index({ scheduledDate: 1 });
serviceSchema.index({ createdAt: -1 });

// Pre-save middleware
serviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate totals
  this.calculateTotals();
  
  next();
});

// Static methods
serviceSchema.statics.findByCustomer = function(customerId, options = {}) {
  const query = { customer: customerId };
  if (options.status) query.status = options.status;
  if (options.type) query.type = options.type;
  if (options.startDate) query.createdAt = { $gte: new Date(options.startDate) };
  if (options.endDate) query.createdAt = { ...query.createdAt, $lte: new Date(options.endDate) };
  
  return this.find(query)
    .populate('customer', 'firstName lastName email phone')
    .populate('vehicle', 'make model year licensePlate')
    .populate('assignedTechnician', 'firstName lastName email')
    .populate('serviceCenter', 'name address')
    .sort({ createdAt: -1 });
};

serviceSchema.statics.findByStatus = function(status, options = {}) {
  const query = { status };
  if (options.type) query.type = options.type;
  if (options.assignedTechnician) query.assignedTechnician = options.assignedTechnician;
  if (options.serviceCenter) query.serviceCenter = options.serviceCenter;
  if (options.startDate) query.createdAt = { $gte: new Date(options.startDate) };
  if (options.endDate) query.createdAt = { ...query.createdAt, $lte: new Date(options.endDate) };
  
  return this.find(query)
    .populate('customer', 'firstName lastName email phone')
    .populate('vehicle', 'make model year licensePlate')
    .populate('assignedTechnician', 'firstName lastName email')
    .populate('serviceCenter', 'name address')
    .sort({ createdAt: -1 });
};

serviceSchema.statics.findByTechnician = function(technicianId, options = {}) {
  const query = { assignedTechnician: technicianId };
  if (options.status) query.status = options.status;
  if (options.type) query.type = options.type;
  if (options.startDate) query.createdAt = { $gte: new Date(options.startDate) };
  if (options.endDate) query.createdAt = { ...query.createdAt, $lte: new Date(options.endDate) };
  
  return this.find(query)
    .populate('customer', 'firstName lastName email phone')
    .populate('vehicle', 'make model year licensePlate')
    .populate('assignedTechnician', 'firstName lastName email')
    .populate('serviceCenter', 'name address')
    .sort({ createdAt: -1 });
};

serviceSchema.statics.getServiceStats = function(period) {
  const query = {};
  if (period) {
    query.createdAt = { $gte: new Date(period.startDate), $lte: new Date(period.endDate) };
  }
  
  return this.aggregate([
    { $match: query },
    { $group: {
      _id: null,
      totalServices: { $sum: 1 },
      totalRevenue: { $sum: '$totalAmount' },
      avgServiceValue: { $avg: '$totalAmount' },
      pendingServices: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
      completedServices: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      cancelledServices: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
    }}
  ]);
};

serviceSchema.statics.getServicesByStatus = function() {
  return this.aggregate([
    { $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalValue: { $sum: '$totalAmount' }
    }},
    { $sort: { count: -1 } }
  ]);
};

// Instance methods
serviceSchema.methods.calculateTotals = function() {
  let partsCost = 0;
  let laborCost = 0;
  
  this.serviceItems.forEach(item => {
    item.totalPrice = item.quantity * item.unitPrice;
    partsCost += item.totalPrice;
    laborCost += (item.laborHours || 0) * (item.laborRate || 0);
  });
  
  this.partsCost = partsCost;
  this.laborCost = laborCost;
  this.subtotal = partsCost + laborCost;
  this.totalAmount = this.subtotal + this.taxAmount - this.discountAmount;
  
  return this.totalAmount;
};

serviceSchema.methods.scheduleService = function(scheduledDate) {
  this.status = 'scheduled';
  this.scheduledDate = scheduledDate;
  return this.save();
};

serviceSchema.methods.startService = function() {
  this.status = 'in_progress';
  this.startDate = new Date();
  return this.save();
};

serviceSchema.methods.completeService = function() {
  this.status = 'completed';
  this.completedDate = new Date();
  if (this.startDate) {
    this.actualDuration = (this.completedDate - this.startDate) / (1000 * 60 * 60); // hours
  }
  return this.save();
};

serviceSchema.methods.cancelService = function() {
  this.status = 'cancelled';
  return this.save();
};

serviceSchema.methods.putOnHold = function() {
  this.status = 'on_hold';
  return this.save();
};

serviceSchema.methods.assignTechnician = function(technicianId) {
  this.assignedTechnician = technicianId;
  return this.save();
};

module.exports = mongoose.model('Service', serviceSchema);
