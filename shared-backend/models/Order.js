const mongoose = require('../shims/mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    default: () => `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['service', 'parts', 'maintenance', 'repair', 'inspection', 'other'],
    default: 'service'
  },
  description: {
    type: String,
    required: true
  },
  items: [{
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
    }
  }],
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
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer', 'cash', 'credit_card']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    transactionId: String,
    paymentIntentId: String,
    paidAt: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  scheduledDate: Date,
  completedDate: Date,
  notes: String,
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
orderSchema.index({ orderId: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ vehicle: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ type: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ assignedTo: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ scheduledDate: 1 });

// Pre-save middleware
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate totals
  this.calculateTotals();
  
  next();
});

// Static methods
orderSchema.statics.findByCustomer = function(customerId, options = {}) {
  const query = { customer: customerId };
  if (options.status) query.status = options.status;
  if (options.type) query.type = options.type;
  if (options.paymentStatus) query.paymentStatus = options.paymentStatus;
  if (options.startDate) query.createdAt = { $gte: new Date(options.startDate) };
  if (options.endDate) query.createdAt = { ...query.createdAt, $lte: new Date(options.endDate) };
  
  return this.find(query)
    .populate('customer', 'firstName lastName email phone')
    .populate('vehicle', 'make model year licensePlate')
    .populate('assignedTo', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

orderSchema.statics.findByStatus = function(status, options = {}) {
  const query = { status };
  if (options.type) query.type = options.type;
  if (options.assignedTo) query.assignedTo = options.assignedTo;
  if (options.startDate) query.createdAt = { $gte: new Date(options.startDate) };
  if (options.endDate) query.createdAt = { ...query.createdAt, $lte: new Date(options.endDate) };
  
  return this.find(query)
    .populate('customer', 'firstName lastName email phone')
    .populate('vehicle', 'make model year licensePlate')
    .populate('assignedTo', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

orderSchema.statics.findByEmployee = function(employeeId, options = {}) {
  const query = { assignedTo: employeeId };
  if (options.status) query.status = options.status;
  if (options.type) query.type = options.type;
  if (options.startDate) query.createdAt = { $gte: new Date(options.startDate) };
  if (options.endDate) query.createdAt = { ...query.createdAt, $lte: new Date(options.endDate) };
  
  return this.find(query)
    .populate('customer', 'firstName lastName email phone')
    .populate('vehicle', 'make model year licensePlate')
    .populate('assignedTo', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

orderSchema.statics.getOrderStats = function(period) {
  const query = {};
  if (period) {
    query.createdAt = { $gte: new Date(period.startDate), $lte: new Date(period.endDate) };
  }
  
  return this.aggregate([
    { $match: query },
    { $group: {
      _id: null,
      totalOrders: { $sum: 1 },
      totalRevenue: { $sum: '$totalAmount' },
      avgOrderValue: { $avg: '$totalAmount' },
      pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
      completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
    }}
  ]);
};

orderSchema.statics.getOrdersByStatus = function() {
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
orderSchema.methods.calculateTotals = function() {
  let subtotal = 0;
  
  this.items.forEach(item => {
    item.totalPrice = item.quantity * item.unitPrice;
    subtotal += item.totalPrice;
  });
  
  this.subtotal = subtotal;
  this.totalAmount = subtotal + this.taxAmount - this.discountAmount;
  
  return this.totalAmount;
};

orderSchema.methods.confirmOrder = function() {
  this.status = 'confirmed';
  return this.save();
};

orderSchema.methods.startProcessing = function() {
  this.status = 'processing';
  return this.save();
};

orderSchema.methods.completeOrder = function() {
  this.status = 'completed';
  this.completedDate = new Date();
  return this.save();
};

orderSchema.methods.cancelOrder = function() {
  this.status = 'cancelled';
  return this.save();
};

orderSchema.methods.assignToEmployee = function(employeeId) {
  this.assignedTo = employeeId;
  return this.save();
};

orderSchema.methods.markAsPaid = function(paymentDetails) {
  this.paymentStatus = 'paid';
  this.paymentDetails = {
    ...this.paymentDetails,
    ...paymentDetails,
    paidAt: new Date()
  };
  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);
