const mongoose = require('../shims/mongoose');

const partnerInventorySchema = new mongoose.Schema({
  // Product Information
  sku: {
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
  
  // Product Details
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  
  // Pricing Information
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  salePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'EGP',
    required: true
  },
  
  // Inventory Information
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minQuantity: {
    type: Number,
    default: 5,
    min: 0
  },
  maxQuantity: {
    type: Number,
    default: 1000,
    min: 0
  },
  reorderPoint: {
    type: Number,
    default: 10,
    min: 0
  },
  
  // Barcode Information
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  barcodeType: {
    type: String,
    enum: ['EAN13', 'UPC', 'CODE128', 'QR'],
    default: 'EAN13'
  },
  
  // Product Images
  images: [{
    url: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Product Specifications
  specifications: {
    weight: { type: Number },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number }
    },
    color: { type: String },
    material: { type: String },
    warranty: { type: String },
    origin: { type: String }
  },
  
  // Vehicle Compatibility (for auto parts)
  vehicleCompatibility: [{
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: String, required: true },
    engine: { type: String },
    transmission: { type: String }
  }],
  
  // Status and Visibility
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued', 'out_of_stock'],
    default: 'active'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Supplier Information
  supplier: {
    name: { type: String, trim: true },
    contact: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true }
  },
  
  // Tax Information
  tax: {
    rate: { type: Number, default: 0, min: 0, max: 100 },
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    exempt: { type: Boolean, default: false }
  },
  
  // SEO and Marketing
  seo: {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    keywords: [{ type: String, trim: true }]
  },
  
  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    sales: { type: Number, default: 0 },
    lastSold: { type: Date },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  
  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PartnerUser'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PartnerUser'
  },
  
  // Metadata
  metadata: {
    source: { type: String, default: 'manual' },
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
partnerInventorySchema.index({ sku: 1 });
partnerInventorySchema.index({ partnerId: 1 });
partnerInventorySchema.index({ barcode: 1 });
partnerInventorySchema.index({ category: 1 });
partnerInventorySchema.index({ status: 1 });
partnerInventorySchema.index({ isPublished: 1 });
partnerInventorySchema.index({ name: 'text', description: 'text' });
partnerInventorySchema.index({ createdAt: -1 });
partnerInventorySchema.index({ updatedAt: -1 });

// Compound indexes
partnerInventorySchema.index({ partnerId: 1, status: 1 });
partnerInventorySchema.index({ partnerId: 1, category: 1 });
partnerInventorySchema.index({ partnerId: 1, isPublished: 1 });

// Virtuals
partnerInventorySchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minQuantity;
});

partnerInventorySchema.virtual('isOutOfStock').get(function() {
  return this.quantity === 0;
});

partnerInventorySchema.virtual('needsReorder').get(function() {
  return this.quantity <= this.reorderPoint;
});

partnerInventorySchema.virtual('profitMargin').get(function() {
  if (this.costPrice === 0) return 0;
  return ((this.salePrice - this.costPrice) / this.costPrice) * 100;
});

partnerInventorySchema.virtual('totalValue').get(function() {
  return this.quantity * this.costPrice;
});

partnerInventorySchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Pre-save middleware
partnerInventorySchema.pre('save', function(next) {
  // Generate SKU if not provided
  if (!this.sku) {
    this.sku = `SKU_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  
  // Generate barcode if not provided
  if (!this.barcode) {
    this.barcode = this.generateBarcode();
  }
  
  // Update status based on quantity
  if (this.quantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.status === 'out_of_stock' && this.quantity > 0) {
    this.status = 'active';
  }
  
  next();
});

// Instance methods
partnerInventorySchema.methods.generateBarcode = function() {
  // Generate a simple barcode (in production, use proper barcode generation)
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 6);
  return `${timestamp}${random}`.substr(0, 13);
};

partnerInventorySchema.methods.updateQuantity = function(newQuantity, reason = '') {
  const oldQuantity = this.quantity;
  this.quantity = Math.max(0, newQuantity);
  
  // Log the change
  this.quantityHistory = this.quantityHistory || [];
  this.quantityHistory.push({
    oldQuantity,
    newQuantity: this.quantity,
    change: this.quantity - oldQuantity,
    reason,
    timestamp: new Date(),
    updatedBy: this.updatedBy
  });
  
  return this.save();
};

partnerInventorySchema.methods.addQuantity = function(amount, reason = '') {
  return this.updateQuantity(this.quantity + amount, reason);
};

partnerInventorySchema.methods.removeQuantity = function(amount, reason = '') {
  return this.updateQuantity(this.quantity - amount, reason);
};

partnerInventorySchema.methods.publish = function() {
  this.isPublished = true;
  this.status = this.quantity > 0 ? 'active' : 'out_of_stock';
  return this.save();
};

partnerInventorySchema.methods.unpublish = function() {
  this.isPublished = false;
  return this.save();
};

// Static methods
partnerInventorySchema.statics.findByPartner = function(partnerId, filters = {}) {
  const query = { partnerId, ...filters };
  return this.find(query).sort({ createdAt: -1 });
};

partnerInventorySchema.statics.findLowStock = function(partnerId) {
  return this.find({
    partnerId,
    quantity: { $lte: '$minQuantity' },
    status: 'active'
  });
};

partnerInventorySchema.statics.findOutOfStock = function(partnerId) {
  return this.find({
    partnerId,
    quantity: 0,
    status: 'active'
  });
};

partnerInventorySchema.statics.findPublished = function(partnerId) {
  return this.find({
    partnerId,
    isPublished: true,
    status: 'active'
  });
};

partnerInventorySchema.statics.findByCategory = function(partnerId, category) {
  return this.find({
    partnerId,
    category,
    status: 'active'
  });
};

partnerInventorySchema.statics.findByBarcode = function(barcode) {
  return this.findOne({ barcode });
};

partnerInventorySchema.statics.findBySku = function(sku) {
  return this.findOne({ sku });
};

partnerInventorySchema.statics.searchProducts = function(partnerId, searchTerm) {
  return this.find({
    partnerId,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { sku: { $regex: searchTerm, $options: 'i' } },
      { barcode: { $regex: searchTerm, $options: 'i' } },
      { brand: { $regex: searchTerm, $options: 'i' } },
      { model: { $regex: searchTerm, $options: 'i' } }
    ],
    status: 'active'
  });
};

partnerInventorySchema.statics.getInventoryStats = function(partnerId) {
  return this.aggregate([
    { $match: { partnerId } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
        lowStockCount: {
          $sum: { $cond: [{ $lte: ['$quantity', '$minQuantity'] }, 1, 0] }
        },
        outOfStockCount: {
          $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] }
        },
        publishedCount: {
          $sum: { $cond: ['$isPublished', 1, 0] }
        },
        averagePrice: { $avg: '$salePrice' },
        totalQuantity: { $sum: '$quantity' }
      }
    }
  ]);
};

module.exports = mongoose.model('PartnerInventory', partnerInventorySchema);
