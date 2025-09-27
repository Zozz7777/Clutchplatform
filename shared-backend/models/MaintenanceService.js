const mongoose = require('mongoose');

const maintenanceServiceSchema = new mongoose.Schema({
  serviceGroup: {
    type: String,
    required: true,
    trim: true
  },
  serviceName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: null
  },
  icon: {
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

// Index for efficient queries
maintenanceServiceSchema.index({ serviceGroup: 1, isActive: 1 });

module.exports = mongoose.model('MaintenanceService', maintenanceServiceSchema);
