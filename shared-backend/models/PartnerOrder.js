const mongoose = require('../shims/mongoose');

const partnerOrderSchema = new mongoose.Schema({
  // Order Information
  orderId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  partnerId: {
    type: String,
    required: true,
    ref: 'PartnerUser'
  },
  
  // Customer Information
  customer: {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      zipCode: { type: String, required: true, trim: true },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
      }
    }
  },
  
  // Service/Product Information
  service: {
    type: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 1, min: 1 }
  },
  
  // Order Details
  orderType: {
    type: String,
    enum: ['service', 'product', 'appointment'],
    required: true
  },
  scheduledDate: {
    type: Date,
    required: function() {
      return this.orderType === 'appointment';
    }
  },
  scheduledTime: {
    type: String,
    required: function() {
      return this.orderType === 'appointment';
    }
  },
  
  // Status Information
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  
  // Invoice Information
  invoice: {
    id: { type: String, unique: true, sparse: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'rejected', 'refunded'],
      default: 'pending'
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'EGP' },
    dueDate: { type: Date },
    paidDate: { type: Date },
    paymentMethod: { type: String },
    paymentReference: { type: String },
    rejectionReason: { type: String, trim: true }
  },
  
  // Delivery Information
  delivery: {
    type: {
      type: String,
      enum: ['pickup', 'delivery', 'onsite'],
      default: 'pickup'
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
      }
    },
    scheduledDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    deliveryNotes: { type: String, trim: true }
  },
  
  // Additional Information
  notes: {
    customer: { type: String, trim: true },
    partner: { type: String, trim: true },
    internal: { type: String, trim: true }
  },
  
  // Priority and Urgency
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  
  // Tracking Information
  tracking: {
    estimatedCompletion: { type: Date },
    actualCompletion: { type: Date },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    milestones: [{
      name: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      completed: { type: Boolean, default: false },
      completedAt: { type: Date }
    }]
  },
  
  // Communication
  communication: {
    lastContact: { type: Date },
    contactMethod: { type: String, enum: ['phone', 'email', 'sms', 'app'] },
    messages: [{
      type: { type: String, enum: ['customer', 'partner', 'system'] },
      message: { type: String, required: true, trim: true },
      timestamp: { type: Date, default: Date.now },
      read: { type: Boolean, default: false }
    }]
  },
  
  // Rating and Feedback
  rating: {
    customerRating: { type: Number, min: 1, max: 5 },
    customerReview: { type: String, trim: true },
    partnerRating: { type: Number, min: 1, max: 5 },
    partnerReview: { type: String, trim: true },
    ratedAt: { type: Date }
  },
  
  // Financial Information
  financial: {
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    commission: { type: Number, default: 0, min: 0 },
    partnerEarnings: { type: Number, default: 0, min: 0 }
  },
  
  // Metadata
  metadata: {
    source: { type: String, default: 'clutch_app' },
    version: { type: String, default: '1.0' },
    tags: [{ type: String, trim: true }],
    customFields: { type: mongoose.Schema.Types.Mixed }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
partnerOrderSchema.index({ orderId: 1 });
partnerOrderSchema.index({ partnerId: 1 });
partnerOrderSchema.index({ 'customer.id': 1 });
partnerOrderSchema.index({ status: 1 });
partnerOrderSchema.index({ 'invoice.status': 1 });
partnerOrderSchema.index({ orderType: 1 });
partnerOrderSchema.index({ scheduledDate: 1 });
partnerOrderSchema.index({ priority: 1 });
partnerOrderSchema.index({ createdAt: -1 });
partnerOrderSchema.index({ updatedAt: -1 });

// Compound indexes
partnerOrderSchema.index({ partnerId: 1, status: 1 });
partnerOrderSchema.index({ partnerId: 1, 'invoice.status': 1 });
partnerOrderSchema.index({ status: 1, scheduledDate: 1 });

// Virtuals
partnerOrderSchema.virtual('isPaid').get(function() {
  return this.invoice.status === 'paid';
});

partnerOrderSchema.virtual('isPending').get(function() {
  return this.invoice.status === 'pending';
});

partnerOrderSchema.virtual('isRejected').get(function() {
  return this.invoice.status === 'rejected';
});

partnerOrderSchema.virtual('canDeliver').get(function() {
  return this.invoice.status === 'paid' && this.status !== 'completed';
});

partnerOrderSchema.virtual('isOverdue').get(function() {
  return this.invoice.dueDate && this.invoice.dueDate < new Date() && this.invoice.status === 'pending';
});

partnerOrderSchema.virtual('customerFullAddress').get(function() {
  const addr = this.customer.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
});

// Pre-save middleware
partnerOrderSchema.pre('save', function(next) {
  // Generate order ID if not provided
  if (!this.orderId) {
    this.orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Generate invoice ID if not provided
  if (!this.invoice.id && this.invoice.status) {
    this.invoice.id = `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Calculate totals
  this.financial.subtotal = this.service.price * this.service.quantity;
  this.financial.total = this.financial.subtotal + this.financial.tax - this.financial.discount;
  this.financial.partnerEarnings = this.financial.total - this.financial.commission;
  
  // Set invoice amount
  this.invoice.amount = this.financial.total;
  
  // Set due date if not provided
  if (!this.invoice.dueDate) {
    this.invoice.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  }
  
  next();
});

// Instance methods
partnerOrderSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  if (notes) {
    this.notes.partner = notes;
  }
  this.tracking.progress = this.getProgressForStatus(newStatus);
  return this.save();
};

partnerOrderSchema.methods.updateInvoiceStatus = function(newStatus, reason = '') {
  this.invoice.status = newStatus;
  if (newStatus === 'paid') {
    this.invoice.paidDate = new Date();
  } else if (newStatus === 'rejected') {
    this.invoice.rejectionReason = reason;
  }
  return this.save();
};

partnerOrderSchema.methods.addMilestone = function(name, description = '') {
  this.tracking.milestones.push({
    name,
    description,
    completed: false
  });
  return this.save();
};

partnerOrderSchema.methods.completeMilestone = function(milestoneName) {
  const milestone = this.tracking.milestones.find(m => m.name === milestoneName);
  if (milestone) {
    milestone.completed = true;
    milestone.completedAt = new Date();
  }
  return this.save();
};

partnerOrderSchema.methods.addMessage = function(type, message) {
  this.communication.messages.push({
    type,
    message,
    timestamp: new Date()
  });
  this.communication.lastContact = new Date();
  return this.save();
};

partnerOrderSchema.methods.getProgressForStatus = function(status) {
  const progressMap = {
    'pending': 0,
    'confirmed': 20,
    'in_progress': 50,
    'completed': 100,
    'cancelled': 0,
    'rejected': 0
  };
  return progressMap[status] || 0;
};

// Static methods
partnerOrderSchema.statics.findByPartner = function(partnerId, filters = {}) {
  const query = { partnerId, ...filters };
  return this.find(query).sort({ createdAt: -1 });
};

partnerOrderSchema.statics.findPendingOrders = function(partnerId) {
  return this.find({ 
    partnerId, 
    'invoice.status': 'pending' 
  }).sort({ createdAt: -1 });
};

partnerOrderSchema.statics.findPaidOrders = function(partnerId) {
  return this.find({ 
    partnerId, 
    'invoice.status': 'paid' 
  }).sort({ createdAt: -1 });
};

partnerOrderSchema.statics.findRejectedOrders = function(partnerId) {
  return this.find({ 
    partnerId, 
    'invoice.status': 'rejected' 
  }).sort({ createdAt: -1 });
};

partnerOrderSchema.statics.findByStatus = function(partnerId, status) {
  return this.find({ partnerId, status }).sort({ createdAt: -1 });
};

partnerOrderSchema.statics.findByDateRange = function(partnerId, startDate, endDate) {
  return this.find({
    partnerId,
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: -1 });
};

partnerOrderSchema.statics.getOrderStats = function(partnerId) {
  return this.aggregate([
    { $match: { partnerId } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$invoice.status', 'pending'] }, 1, 0] }
        },
        paidOrders: {
          $sum: { $cond: [{ $eq: ['$invoice.status', 'paid'] }, 1, 0] }
        },
        rejectedOrders: {
          $sum: { $cond: [{ $eq: ['$invoice.status', 'rejected'] }, 1, 0] }
        },
        totalRevenue: { $sum: '$financial.total' },
        totalEarnings: { $sum: '$financial.partnerEarnings' }
      }
    }
  ]);
};

module.exports = mongoose.model('PartnerOrder', partnerOrderSchema);
