const mongoose = require('../shims/mongoose');

const partnerDeviceSchema = new mongoose.Schema({
  // Device Information
  deviceId: {
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
  
  // Device Details
  deviceName: {
    type: String,
    required: true,
    trim: true
  },
  deviceType: {
    type: String,
    enum: ['windows_desktop', 'android_tablet', 'ios_tablet', 'pos_terminal', 'kiosk'],
    required: true
  },
  platform: {
    type: String,
    enum: ['windows', 'android', 'ios', 'linux'],
    required: true
  },
  version: {
    type: String,
    required: true
  },
  
  // Hardware Information
  hardware: {
    cpu: { type: String },
    memory: { type: String },
    storage: { type: String },
    screen: { type: String },
    network: { type: String }
  },
  
  // Software Information
  software: {
    os: { type: String, required: true },
    osVersion: { type: String, required: true },
    appVersion: { type: String, required: true },
    lastUpdate: { type: Date }
  },
  
  // Network Information
  network: {
    ipAddress: { type: String },
    macAddress: { type: String },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date },
    connectionType: { type: String, enum: ['wifi', 'ethernet', 'mobile', 'unknown'] }
  },
  
  // Device Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'maintenance'],
    default: 'active'
  },
  isRegistered: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Device Token for Push Notifications
  deviceToken: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Location Information
  location: {
    name: { type: String, trim: true },
    address: { type: String, trim: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  
  // Device Configuration
  configuration: {
    language: { type: String, default: 'ar' },
    timezone: { type: String, default: 'Africa/Cairo' },
    currency: { type: String, default: 'EGP' },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    autoSync: { type: Boolean, default: true },
    syncInterval: { type: Number, default: 30 }, // minutes
    offlineMode: { type: Boolean, default: true }
  },
  
  // Device Capabilities
  capabilities: {
    barcodeScanner: { type: Boolean, default: false },
    receiptPrinter: { type: Boolean, default: false },
    cashDrawer: { type: Boolean, default: false },
    cardReader: { type: Boolean, default: false },
    camera: { type: Boolean, default: false },
    gps: { type: Boolean, default: false }
  },
  
  // Device Settings
  settings: {
    printerSettings: {
      defaultPrinter: { type: String },
      paperSize: { type: String, default: '80mm' },
      printQuality: { type: String, default: 'normal' }
    },
    scannerSettings: {
      autoScan: { type: Boolean, default: true },
      beepSound: { type: Boolean, default: true },
      scanTimeout: { type: Number, default: 5 } // seconds
    },
    displaySettings: {
      brightness: { type: Number, default: 80, min: 0, max: 100 },
      fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
      orientation: { type: String, enum: ['portrait', 'landscape'], default: 'portrait' }
    }
  },
  
  // Sync Information
  sync: {
    lastSync: { type: Date },
    syncStatus: {
      type: String,
      enum: ['synced', 'pending', 'failed', 'in_progress'],
      default: 'pending'
    },
    pendingOperations: { type: Number, default: 0 },
    failedOperations: { type: Number, default: 0 },
    totalOperations: { type: Number, default: 0 }
  },
  
  // Security Information
  security: {
    encryptionKey: { type: String },
    lastSecurityUpdate: { type: Date },
    securityLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    biometricAuth: { type: Boolean, default: false },
    pinProtection: { type: Boolean, default: false }
  },
  
  // Audit Trail
  registeredAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PartnerUser'
  },
  
  // Metadata
  metadata: {
    source: { type: String, default: 'device_registration' },
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
partnerDeviceSchema.index({ deviceId: 1 });
partnerDeviceSchema.index({ partnerId: 1 });
partnerDeviceSchema.index({ deviceToken: 1 });
partnerDeviceSchema.index({ status: 1 });
partnerDeviceSchema.index({ isRegistered: 1 });
partnerDeviceSchema.index({ 'network.isOnline': 1 });
partnerDeviceSchema.index({ lastActivity: -1 });
partnerDeviceSchema.index({ createdAt: -1 });

// Compound indexes
partnerDeviceSchema.index({ partnerId: 1, status: 1 });
partnerDeviceSchema.index({ partnerId: 1, deviceType: 1 });
partnerDeviceSchema.index({ partnerId: 1, isRegistered: 1 });

// Virtuals
partnerDeviceSchema.virtual('isOnline').get(function() {
  return this.network.isOnline && this.status === 'active';
});

partnerDeviceSchema.virtual('needsUpdate').get(function() {
  if (!this.software.lastUpdate) return true;
  const daysSinceUpdate = (Date.now() - this.software.lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate > 7; // Update if more than 7 days old
});

partnerDeviceSchema.virtual('hasPendingSync').get(function() {
  return this.sync.pendingOperations > 0;
});

partnerDeviceSchema.virtual('deviceInfo').get(function() {
  return `${this.deviceName} (${this.platform} ${this.software.osVersion})`;
});

// Pre-save middleware
partnerDeviceSchema.pre('save', function(next) {
  // Generate device ID if not provided
  if (!this.deviceId) {
    this.deviceId = `DEV_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }
  
  // Update last activity
  this.lastActivity = new Date();
  
  // Update network status
  if (this.network.lastSeen) {
    const timeSinceLastSeen = Date.now() - this.network.lastSeen.getTime();
    this.network.isOnline = timeSinceLastSeen < 5 * 60 * 1000; // 5 minutes
  }
  
  next();
});

// Instance methods
partnerDeviceSchema.methods.register = function(registeredBy) {
  this.isRegistered = true;
  this.registeredBy = registeredBy;
  this.registeredAt = new Date();
  this.status = 'active';
  return this.save();
};

partnerDeviceSchema.methods.verify = function() {
  this.isVerified = true;
  return this.save();
};

partnerDeviceSchema.methods.updateOnlineStatus = function(isOnline) {
  this.network.isOnline = isOnline;
  this.network.lastSeen = new Date();
  this.lastActivity = new Date();
  return this.save();
};

partnerDeviceSchema.methods.updateSyncStatus = function(status, pendingOps = 0, failedOps = 0) {
  this.sync.syncStatus = status;
  this.sync.pendingOperations = pendingOps;
  this.sync.failedOperations = failedOps;
  this.sync.lastSync = new Date();
  return this.save();
};

partnerDeviceSchema.methods.updateSoftware = function(appVersion, osVersion) {
  this.software.appVersion = appVersion;
  this.software.osVersion = osVersion;
  this.software.lastUpdate = new Date();
  return this.save();
};

partnerDeviceSchema.methods.suspend = function(reason = '') {
  this.status = 'suspended';
  this.network.isOnline = false;
  return this.save();
};

partnerDeviceSchema.methods.activate = function() {
  this.status = 'active';
  this.network.isOnline = true;
  this.network.lastSeen = new Date();
  return this.save();
};

// Static methods
partnerDeviceSchema.statics.findByPartner = function(partnerId, filters = {}) {
  const query = { partnerId, ...filters };
  return this.find(query).sort({ lastActivity: -1 });
};

partnerDeviceSchema.statics.findActive = function(partnerId) {
  return this.find({
    partnerId,
    status: 'active',
    isRegistered: true
  });
};

partnerDeviceSchema.statics.findOnline = function(partnerId) {
  return this.find({
    partnerId,
    'network.isOnline': true,
    status: 'active'
  });
};

partnerDeviceSchema.statics.findByType = function(partnerId, deviceType) {
  return this.find({
    partnerId,
    deviceType,
    status: 'active'
  });
};

partnerDeviceSchema.statics.findByDeviceId = function(deviceId) {
  return this.findOne({ deviceId });
};

partnerDeviceSchema.statics.findByDeviceToken = function(deviceToken) {
  return this.findOne({ deviceToken });
};

partnerDeviceSchema.statics.getDeviceStats = function(partnerId) {
  return this.aggregate([
    { $match: { partnerId } },
    {
      $group: {
        _id: null,
        totalDevices: { $sum: 1 },
        activeDevices: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        onlineDevices: {
          $sum: { $cond: ['$network.isOnline', 1, 0] }
        },
        registeredDevices: {
          $sum: { $cond: ['$isRegistered', 1, 0] }
        },
        verifiedDevices: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        },
        pendingSyncDevices: {
          $sum: { $cond: [{ $gt: ['$sync.pendingOperations', 0] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('PartnerDevice', partnerDeviceSchema);
