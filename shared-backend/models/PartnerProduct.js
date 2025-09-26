const mongoose = require('../shims/mongoose');

const partnerProductSchema = new mongoose.Schema({
  // Basic Information
  partnerId: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    trim: true
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
  category: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  
  // Pricing
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
  margin: {
    type: Number,
    default: 0
  },
  
  // Inventory
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  minStockLevel: {
    type: Number,
    default: 0,
    min: 0
  },
  maxStockLevel: {
    type: Number,
    default: 1000,
    min: 0
  },
  reorderPoint: {
    type: Number,
    default: 10,
    min: 0
  },
  
  // Product Details
  barcode: {
    type: String,
    trim: true
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  },
  color: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  
  // Media
  images: [{
    url: { type: String, required: true },
    alt: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Status & Settings
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  
  // SEO & Marketing
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  
  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
partnerProductSchema.index({ partnerId: 1, sku: 1 }, { unique: true });
partnerProductSchema.index({ partnerId: 1, category: 1 });
partnerProductSchema.index({ partnerId: 1, isActive: 1 });
partnerProductSchema.index({ partnerId: 1, isPublished: 1 });
partnerProductSchema.index({ barcode: 1 });
partnerProductSchema.index({ name: 'text', description: 'text' });

// Virtual for low stock alert
partnerProductSchema.virtual('isLowStock').get(function() {
  return this.stockQuantity <= this.reorderPoint;
});

// Virtual for profit margin calculation
partnerProductSchema.virtual('profitMargin').get(function() {
  if (this.salePrice > 0) {
    return ((this.salePrice - this.costPrice) / this.salePrice * 100).toFixed(2);
  }
  return 0;
});

// Pre-save middleware
partnerProductSchema.pre('save', function(next) {
  // Calculate margin
  if (this.salePrice && this.costPrice) {
    this.margin = this.salePrice - this.costPrice;
  }
  
  // Set published date if being published
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Static methods
partnerProductSchema.statics.findByPartnerId = function(partnerId, options = {}) {
  const query = { partnerId, ...options };
  return this.find(query).sort({ createdAt: -1 });
};

partnerProductSchema.statics.findLowStock = function(partnerId) {
  return this.find({
    partnerId,
    isActive: true,
    $expr: { $lte: ['$stockQuantity', '$reorderPoint'] }
  });
};

partnerProductSchema.statics.getCategoryStats = function(partnerId) {
  return this.aggregate([
    { $match: { partnerId, isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$stockQuantity', '$salePrice'] } },
        avgPrice: { $avg: '$salePrice' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Instance methods
partnerProductSchema.methods.updateStock = function(quantity, operation = 'set') {
  switch (operation) {
    case 'add':
      this.stockQuantity += quantity;
      break;
    case 'subtract':
      this.stockQuantity = Math.max(0, this.stockQuantity - quantity);
      break;
    case 'set':
    default:
      this.stockQuantity = Math.max(0, quantity);
      break;
  }
  return this.save();
};

partnerProductSchema.methods.recordSale = function(quantity, price) {
  this.sales += quantity;
  this.revenue += (quantity * price);
  this.stockQuantity = Math.max(0, this.stockQuantity - quantity);
  return this.save();
};

module.exports = mongoose.model('PartnerProduct', partnerProductSchema);
