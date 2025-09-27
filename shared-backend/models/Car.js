const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  trim: {
    type: String,
    required: true,
    trim: true
  },
  kilometers: {
    type: Number,
    required: true,
    min: 0
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  licensePlate: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  currentMileage: {
    type: Number,
    default: 0
  },
  lastMaintenanceDate: {
    type: Date,
    default: null
  },
  lastMaintenanceKilometers: {
    type: Number,
    default: 0
  },
  lastMaintenanceServices: [{
    serviceGroup: String,
    serviceName: String,
    date: Date
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
carSchema.index({ userId: 1, isActive: 1 });
// Note: licensePlate index is automatically created by unique: true in schema

module.exports = mongoose.model('Car', carSchema);