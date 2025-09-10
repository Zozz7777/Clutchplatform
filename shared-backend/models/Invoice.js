const mongoose = require('../shims/mongoose');

const invoiceSchema = new mongoose.Schema({
  // Basic Information
  invoiceNumber: { type: String, required: true, unique: true },
  invoiceType: { 
    type: String, 
    enum: ['service', 'product', 'subscription', 'recurring', 'credit-note', 'debit-note'],
    required: true
  },
  
  // Parties
  client: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    taxId: String,
    phone: String
  },
  
  company: {
    name: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    taxId: String,
    phone: String,
    email: String,
    website: String,
    logo: String
  },

  // Dates
  issueDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date, required: true },
  paymentDate: { type: Date },
  lastReminderDate: { type: Date },
  
  // Financial Information
  currency: { type: String, default: 'USD', required: true },
  exchangeRate: { type: Number, default: 1 },
  
  // Line Items
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'unit' },
    taxRate: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    total: { type: Number, required: true, min: 0 },
    category: String,
    sku: String,
    notes: String
  }],

  // Totals
  subtotal: { type: Number, required: true, min: 0 },
  taxAmount: { type: Number, default: 0, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  shippingAmount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  balanceAmount: { type: Number, default: 0 },

  // Payment Information
  paymentStatus: { 
    type: String, 
    enum: ['draft', 'sent', 'viewed', 'paid', 'partially-paid', 'overdue', 'cancelled', 'refunded'],
    default: 'draft'
  },
  
  paymentMethod: {
    type: { type: String, enum: ['bank-transfer', 'credit-card', 'paypal', 'stripe', 'cash', 'check', 'other'] },
    reference: String,
    transactionId: String,
    gateway: String,
    fees: Number
  },

  // Tax Information
  tax: {
    totalTax: { type: Number, default: 0 },
    taxBreakdown: [{
      name: String,
      rate: Number,
      amount: Number
    }],
    taxExempt: { type: Boolean, default: false },
    taxExemptionReason: String
  },

  // Terms & Conditions
  terms: {
    paymentTerms: { type: String, default: 'Net 30' },
    lateFeeRate: { type: Number, default: 0 },
    gracePeriod: { type: Number, default: 0 }, // in days
    notes: String,
    termsAndConditions: String
  },

  // Related Documents
  relatedDocuments: [{
    type: { type: String, enum: ['contract', 'purchase-order', 'delivery-note', 'credit-note', 'other'] },
    documentNumber: String,
    documentUrl: String,
    date: Date
  }],

  // Recurring Invoice Settings
  recurring: {
    isRecurring: { type: Boolean, default: false },
    frequency: { type: String, enum: ['weekly', 'monthly', 'quarterly', 'yearly'] },
    interval: { type: Number, default: 1 },
    startDate: Date,
    endDate: Date,
    nextInvoiceDate: Date,
    totalOccurrences: Number,
    currentOccurrence: { type: Number, default: 0 }
  },

  // Workflow & Approvals
  workflow: {
    status: { type: String, enum: ['draft', 'pending-approval', 'approved', 'sent', 'paid', 'archived'] },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    approvedDate: Date,
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    sentDate: Date
  },

  // Communication History
  communications: [{
    type: { type: String, enum: ['email', 'sms', 'letter', 'call'] },
    direction: { type: String, enum: ['sent', 'received'] },
    subject: String,
    content: String,
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent', 'delivered', 'read', 'failed'] }
  }],

  // Reminders & Follow-ups
  reminders: [{
    type: { type: String, enum: ['payment-due', 'payment-overdue', 'thank-you'] },
    scheduledDate: Date,
    sentDate: Date,
    status: { type: String, enum: ['scheduled', 'sent', 'cancelled'] },
    template: String,
    content: String
  }],

  // Analytics & Tracking
  analytics: {
    views: { type: Number, default: 0 },
    firstViewed: Date,
    lastViewed: Date,
    timeToPayment: Number, // in days
    reminderCount: { type: Number, default: 0 },
    daysOverdue: { type: Number, default: 0 }
  },

  // Notes & Comments
  notes: [{
    note: String,
    category: { type: String, enum: ['general', 'payment', 'dispute', 'internal'] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    createdAt: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: false }
  }],

  // Metadata
  metadata: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    lastUpdated: { type: Date, default: Date.now },
    version: { type: Number, default: 1 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for overdue status
invoiceSchema.virtual('isOverdue').get(function() {
  if (this.paymentStatus === 'paid' || this.paymentStatus === 'cancelled') return false;
  return new Date() > this.dueDate;
});

// Virtual for days overdue
invoiceSchema.virtual('daysOverdue').get(function() {
  if (this.paymentStatus === 'paid' || this.paymentStatus === 'cancelled') return 0;
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = today - dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for payment percentage
invoiceSchema.virtual('paymentPercentage').get(function() {
  if (this.totalAmount === 0) return 0;
  return ((this.paidAmount / this.totalAmount) * 100).toFixed(2);
});

// Indexes
// Note: invoiceNumber already has unique: true which creates an index automatically
invoiceSchema.index({ clientId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ issueDate: -1 });
invoiceSchema.index({ paymentDate: -1 });
invoiceSchema.index({ 'workflow.status': 1 });
invoiceSchema.index({ 'recurring.isRecurring': 1 });
invoiceSchema.index({ 'recurring.nextInvoiceDate': 1 });

// Pre-save middleware
invoiceSchema.pre('save', function(next) {
  if (this.isModified('metadata.lastUpdated')) {
    this.metadata.lastUpdated = new Date();
  }
  
  // Calculate totals
  this.calculateTotals();
  
  // Update balance
  this.balanceAmount = this.totalAmount - this.paidAmount;
  
  // Update payment status
  this.updatePaymentStatus();
  
  next();
});

// Instance methods
invoiceSchema.methods.calculateTotals = function() {
  let subtotal = 0;
  let totalTax = 0;
  let totalDiscount = 0;

  this.items.forEach(item => {
    const lineTotal = item.quantity * item.unitPrice;
    const lineDiscount = item.discountType === 'percentage' 
      ? (lineTotal * item.discount / 100) 
      : item.discount;
    const lineTax = (lineTotal - lineDiscount) * (item.taxRate / 100);
    
    item.total = lineTotal - lineDiscount + lineTax;
    subtotal += lineTotal;
    totalTax += lineTax;
    totalDiscount += lineDiscount;
  });

  this.subtotal = subtotal;
  this.taxAmount = totalTax;
  this.discountAmount = totalDiscount;
  this.totalAmount = subtotal + this.taxAmount - this.discountAmount + this.shippingAmount;
};

invoiceSchema.methods.updatePaymentStatus = function() {
  if (this.paymentStatus === 'cancelled') return;
  
  if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'paid';
    this.paymentDate = this.paymentDate || new Date();
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'partially-paid';
  } else if (this.isOverdue) {
    this.paymentStatus = 'overdue';
  } else if (this.paymentStatus === 'draft') {
    // Keep as draft
  } else {
    this.paymentStatus = 'sent';
  }
};

invoiceSchema.methods.addPayment = function(amount, method, reference) {
  this.paidAmount += amount;
  this.paymentMethod = {
    type: method,
    reference: reference,
    date: new Date()
  };
  this.updatePaymentStatus();
  return this.save();
};

invoiceSchema.methods.sendReminder = function() {
  this.reminders.push({
    type: this.isOverdue ? 'payment-overdue' : 'payment-due',
    scheduledDate: new Date(),
    sentDate: new Date(),
    status: 'sent'
  });
  this.lastReminderDate = new Date();
  return this.save();
};

invoiceSchema.methods.addNote = function(note, createdBy, category = 'general', isPrivate = false) {
  this.notes.push({
    note,
    category,
    createdBy,
    isPrivate
  });
  return this.save();
};

// Static methods
invoiceSchema.statics.findOverdueInvoices = function() {
  return this.find({
    paymentStatus: { $in: ['sent', 'partially-paid'] },
    dueDate: { $lt: new Date() }
  });
};

invoiceSchema.statics.findRecurringInvoices = function() {
  return this.find({
    'recurring.isRecurring': true,
    'recurring.nextInvoiceDate': { $lte: new Date() }
  });
};

module.exports = mongoose.model('Invoice', invoiceSchema);
