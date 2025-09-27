const mongoose = require('mongoose');

const carTrimSchema = new mongoose.Schema({
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarModel',
    required: true
  },
  brandName: {
    type: String,
    required: true,
    trim: true
  },
  modelName: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
carTrimSchema.index({ modelId: 1, isActive: 1 });
carTrimSchema.index({ brandName: 1, modelName: 1 });

module.exports = mongoose.model('CarTrim', carTrimSchema);
