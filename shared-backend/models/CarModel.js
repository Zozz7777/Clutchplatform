const mongoose = require('mongoose');

const carModelSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarBrand',
    required: true
  },
  brandName: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  yearStart: {
    type: Number,
    default: null
  },
  yearEnd: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
carModelSchema.index({ brandId: 1, isActive: 1 });
carModelSchema.index({ brandName: 1, name: 1 });

module.exports = mongoose.model('CarModel', carModelSchema);