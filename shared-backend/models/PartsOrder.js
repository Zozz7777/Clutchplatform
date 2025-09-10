const mongoose = require('../shims/mongoose');

const partsOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    default: () => `parts_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mechanicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mechanic'
  },
  partsShopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PartsShop',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  items: [{
    partId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarPart',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    brand: String,
    partNumber: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
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
    warranty: {
      type: String,
      enum: ['none', '30_days', '90_days', '1_year', 'lifetime']
    },
    notes: String
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxAmount: {
    type: Number,
    required: true,
    default: 0
  },
  shippingAmount: {
    type: Number,
    required: true,
    default: 0
  },
  discountAmount: {
    type: Number,
    required: true,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD']
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer', 'cash_on_delivery']
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
  shippingDetails: {
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date
  },
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
}, { timestamps: true, collection: 'parts_orders' });

// Indexes
partsOrderSchema.index({ orderId: 1 });
partsOrderSchema.index({ userId: 1 });
partsOrderSchema.index({ mechanicId: 1 });
partsOrderSchema.index({ partsShopId: 1 });
partsOrderSchema.index({ status: 1 });
partsOrderSchema.index({ paymentStatus: 1 });
partsOrderSchema.index({ createdAt: -1 });

// Pre-save middleware
partsOrderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate totals
  this.calculateTotals();
  
  next();
});

// Static methods
partsOrderSchema.statics.findByUser = function(userId, options = {}) {
  const match = { userId };
  if (options.status) match.status = options.status;
  if (options.paymentStatus) match.paymentStatus = options.paymentStatus;
  if (options.startDate || options.endDate) {
    match.createdAt = {};
    if (options.startDate) match.createdAt.$gte = new Date(options.startDate);
    if (options.endDate) match.createdAt.$lte = new Date(options.endDate);
  }
  return this.aggregate([
    { $match: match },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userId' } },
    { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'mechanics', localField: 'mechanicId', foreignField: '_id', as: 'mechanicId' } },
    { $unwind: { path: '$mechanicId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'parts_shops', localField: 'partsShopId', foreignField: '_id', as: 'partsShopId' } },
    { $unwind: { path: '$partsShopId', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'car_parts', localField: 'items.partId', foreignField: '_id', as: 'items.part' } },
    { $unwind: { path: '$items.part', preserveNullAndEmptyArrays: true } },
    { $group: { _id: '$_id', doc: { $first: '$$ROOT' }, items: { $push: '$items' } } },
    { $addFields: { 'doc.items': '$items' } },
    { $replaceRoot: { newRoot: '$doc' } },
    { $sort: { createdAt: -1 } }
  ]);
};

partsOrderSchema.statics.findByMechanic = function(mechanicId, options = {}) {
  const match = { mechanicId };
  if (options.status) match.status = options.status;
  if (options.paymentStatus) match.paymentStatus = options.paymentStatus;
  if (options.startDate || options.endDate) {
    match.createdAt = {};
    if (options.startDate) match.createdAt.$gte = new Date(options.startDate);
    if (options.endDate) match.createdAt.$lte = new Date(options.endDate);
  }
  return this.aggregate([
    { $match: match },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userId' } },
    { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'mechanics', localField: 'mechanicId', foreignField: '_id', as: 'mechanicId' } },
    { $unwind: { path: '$mechanicId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'parts_shops', localField: 'partsShopId', foreignField: '_id', as: 'partsShopId' } },
    { $unwind: { path: '$partsShopId', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'car_parts', localField: 'items.partId', foreignField: '_id', as: 'items.part' } },
    { $unwind: { path: '$items.part', preserveNullAndEmptyArrays: true } },
    { $group: { _id: '$_id', doc: { $first: '$$ROOT' }, items: { $push: '$items' } } },
    { $addFields: { 'doc.items': '$items' } },
    { $replaceRoot: { newRoot: '$doc' } },
    { $sort: { createdAt: -1 } }
  ]);
};

partsOrderSchema.statics.findByPartsShop = function(partsShopId, options = {}) {
  const match = { partsShopId };
  if (options.status) match.status = options.status;
  if (options.paymentStatus) match.paymentStatus = options.paymentStatus;
  if (options.startDate || options.endDate) {
    match.createdAt = {};
    if (options.startDate) match.createdAt.$gte = new Date(options.startDate);
    if (options.endDate) match.createdAt.$lte = new Date(options.endDate);
  }
  return this.aggregate([
    { $match: match },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userId' } },
    { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'mechanics', localField: 'mechanicId', foreignField: '_id', as: 'mechanicId' } },
    { $unwind: { path: '$mechanicId', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'parts_shops', localField: 'partsShopId', foreignField: '_id', as: 'partsShopId' } },
    { $unwind: { path: '$partsShopId', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'car_parts', localField: 'items.partId', foreignField: '_id', as: 'items.part' } },
    { $unwind: { path: '$items.part', preserveNullAndEmptyArrays: true } },
    { $group: { _id: '$_id', doc: { $first: '$$ROOT' }, items: { $push: '$items' } } },
    { $addFields: { 'doc.items': '$items' } },
    { $replaceRoot: { newRoot: '$doc' } },
    { $sort: { createdAt: -1 } }
  ]);
};

partsOrderSchema.statics.calculateUserStats = function(userId, period) {
  const query = { userId: mongoose.Types.ObjectId(userId) };
  if (period) {
    query.createdAt = { $gte: new Date(period.startDate), $lte: new Date(period.endDate) };
  }
  
  return this.aggregate([
    { $match: query },
    { $group: {
      _id: null,
      totalOrders: { $sum: 1 },
      totalSpent: { $sum: '$totalAmount' },
      avgOrderValue: { $avg: '$totalAmount' },
      completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } }
    }}
  ]);
};

// Instance methods
partsOrderSchema.methods.calculateTotals = function() {
  let subtotal = 0;
  
  this.items.forEach(item => {
    item.totalPrice = item.quantity * item.unitPrice;
    subtotal += item.totalPrice;
  });
  
  this.subtotal = subtotal;
  this.totalAmount = subtotal + this.taxAmount + this.shippingAmount - this.discountAmount;
  
  return this.totalAmount;
};

partsOrderSchema.methods.confirmOrder = function() {
  this.status = 'confirmed';
  return this.save();
};

partsOrderSchema.methods.processOrder = function() {
  this.status = 'processing';
  return this.save();
};

partsOrderSchema.methods.shipOrder = function(shippingDetails) {
  this.status = 'shipped';
  this.shippingDetails = {
    ...this.shippingDetails,
    ...shippingDetails,
    shippedAt: new Date()
  };
  return this.save();
};

partsOrderSchema.methods.deliverOrder = function() {
  this.status = 'delivered';
  this.shippingDetails.deliveredAt = new Date();
  return this.save();
};

partsOrderSchema.methods.cancelOrder = function() {
  this.status = 'cancelled';
  return this.save();
};

partsOrderSchema.methods.returnOrder = function() {
  this.status = 'returned';
  return this.save();
};

partsOrderSchema.methods.markAsPaid = function(paymentDetails) {
  this.paymentStatus = 'paid';
  this.paymentDetails = {
    ...this.paymentDetails,
    ...paymentDetails,
    paidAt: new Date()
  };
  return this.save();
};

module.exports = mongoose.model('PartsOrder', partsOrderSchema);
