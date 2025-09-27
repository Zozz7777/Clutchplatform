const mongoose = require('mongoose');

const carBrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  logo: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient search
carBrandSchema.index({ name: 1, isActive: 1 });

module.exports = mongoose.model('CarBrand', carBrandSchema);