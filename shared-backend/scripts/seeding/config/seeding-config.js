require('dotenv').config();

const seedingConfig = {
  // Environment settings
  environment: process.env.SEEDING_ENVIRONMENT || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Database settings
  database: {
    batchSize: parseInt(process.env.SEEDING_BATCH_SIZE) || 100,
    delayMs: parseInt(process.env.SEEDING_DELAY_MS) || 100,
    maxRetries: parseInt(process.env.SEEDING_MAX_RETRIES) || 3,
    retryDelayMs: parseInt(process.env.SEEDING_RETRY_DELAY_MS) || 1000,
    transactionTimeout: parseInt(process.env.SEEDING_TRANSACTION_TIMEOUT) || 30000
  },

  // Firebase settings
  firebase: {
    enableLogoUpload: process.env.ENABLE_LOGO_UPLOAD !== 'false',
    logoQuality: process.env.LOGO_QUALITY || 'high',
    logoFormats: ['png', 'svg'],
    logoSizes: [32, 64, 128, 256, 512],
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    maxLogoSize: parseInt(process.env.MAX_LOGO_SIZE) || 5 * 1024 * 1024 // 5MB
  },

  // Data sources
  dataSources: {
    obdCodes: {
      enabled: true,
      priority: 'critical',
      sources: [
        'SAE J1979 OBD-II standard',
        'Manufacturer service manuals',
        'Professional diagnostic databases',
        'Automotive repair databases'
      ]
    },
    carBrands: {
      enabled: true,
      priority: 'high',
      includeLogos: true,
      regions: ['european', 'asian', 'american', 'luxury', 'egyptian']
    },
    carModels: {
      enabled: true,
      priority: 'high',
      focusRegions: ['egypt', 'middle_east'],
      popularModels: true
    },
    carParts: {
      enabled: true,
      priority: 'medium',
      categories: [
        'engine', 'transmission', 'brakes', 'suspension', 
        'electrical', 'exhaust', 'cooling', 'fuel', 
        'tires', 'battery', 'filters', 'fluids'
      ]
    },
    services: {
      enabled: true,
      priority: 'medium',
      includePricing: true,
      egyptianMarket: true
    },
    locations: {
      enabled: true,
      priority: 'high',
      focusCountry: 'egypt',
      includeCoordinates: true,
      includePostalCodes: true
    },
    payments: {
      enabled: true,
      priority: 'high',
      includeLogos: true,
      egyptianMethods: true,
      digitalWallets: true
    },
    businesses: {
      enabled: true,
      priority: 'medium',
      categories: [
        'repair_centers', 'parts_shops', 'body_shops', 
        'tire_centers', 'electrical_specialists', 'ac_specialists'
      ]
    },
    features: {
      enabled: true,
      priority: 'low',
      includeBeta: false,
      includeExperimental: false
    },
    notifications: {
      enabled: true,
      priority: 'low',
      languages: ['en', 'ar'],
      templates: ['email', 'sms', 'push', 'in_app']
    }
  },

  // Validation settings
  validation: {
    strictMode: process.env.VALIDATION_STRICT_MODE === 'true',
    checkDuplicates: true,
    validateRelationships: true,
    validateUrls: true,
    maxErrors: parseInt(process.env.MAX_VALIDATION_ERRORS) || 100
  },

  // Performance settings
  performance: {
    enableProgressTracking: true,
    enableMetrics: true,
    logLevel: process.env.SEEDING_LOG_LEVEL || 'info',
    memoryLimit: parseInt(process.env.SEEDING_MEMORY_LIMIT) || 1024 * 1024 * 1024, // 1GB
    cpuLimit: parseInt(process.env.SEEDING_CPU_LIMIT) || 80 // 80%
  },

  // Error handling
  errorHandling: {
    continueOnError: process.env.CONTINUE_ON_ERROR !== 'false',
    maxErrors: parseInt(process.env.MAX_ERRORS) || 50,
    errorLogFile: process.env.ERROR_LOG_FILE || 'logs/seeding-logs/errors.log',
    backupOnError: process.env.BACKUP_ON_ERROR === 'true'
  },

  // Backup settings
  backup: {
    enabled: process.env.ENABLE_BACKUP !== 'false',
    backupBeforeSeeding: true,
    backupAfterSeeding: true,
    keepBackups: parseInt(process.env.KEEP_BACKUPS) || 5,
    backupLocation: process.env.BACKUP_LOCATION || 'backups/seeding'
  },

  // Logging settings
  logging: {
    enabled: true,
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/seeding-logs/seeding.log',
    console: true,
    maxFileSize: parseInt(process.env.MAX_LOG_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    maxFiles: parseInt(process.env.MAX_LOG_FILES) || 5
  },

  // Egyptian market specific settings
  egyptianMarket: {
    currency: 'EGP',
    language: 'ar',
    timezone: 'Africa/Cairo',
    popularBrands: [
      'Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 
      'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen'
    ],
    popularModels: [
      'Toyota Corolla', 'Honda Civic', 'Nissan Sunny', 
      'Hyundai Accent', 'Kia Rio', 'BMW 3 Series'
    ],
    majorCities: [
      'Cairo', 'Alexandria', 'Giza', 'Sharm El Sheikh', 
      'Hurghada', 'Luxor', 'Aswan'
    ],
    paymentMethods: [
      'Visa', 'MasterCard', 'Vodafone Cash', 'Orange Money', 
      'Etisalat Wallet', 'Fawry', 'Aman'
    ]
  },

  // OBD Code specific settings
  obdCodes: {
    includeGeneric: true,
    includeManufacturer: true,
    includeModern: true,
    includeLegacy: false,
    severityLevels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    urgencyLevels: ['IMMEDIATE', 'SOON', 'SCHEDULED', 'MONITOR'],
    categories: ['Engine', 'Transmission', 'Body', 'Chassis', 'Network'],
    costRange: {
      min: 50, // EGP
      max: 5000 // EGP
    }
  },

  // Logo management settings
  logoManagement: {
    downloadFromWeb: process.env.DOWNLOAD_LOGOS_FROM_WEB === 'true',
    processImages: true,
    optimizeForWeb: true,
    createFallbacks: true,
    backupOriginals: true,
    maxConcurrentUploads: parseInt(process.env.MAX_CONCURRENT_UPLOADS) || 5
  },

  // Data quality settings
  dataQuality: {
    checkAccuracy: true,
    validatePricing: true,
    checkCompleteness: true,
    verifyRelationships: true,
    qualityThreshold: parseFloat(process.env.QUALITY_THRESHOLD) || 0.95
  },

  // Security settings
  security: {
    validateUrls: true,
    checkFileTypes: true,
    sanitizeInputs: true,
    encryptSensitiveData: process.env.ENCRYPT_SENSITIVE_DATA === 'true',
    auditLogging: process.env.AUDIT_LOGGING === 'true'
  },

  // Monitoring settings
  monitoring: {
    enableHealthChecks: true,
    checkInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 seconds
    alertOnFailure: process.env.ALERT_ON_FAILURE === 'true',
    metricsCollection: process.env.COLLECT_METRICS === 'true'
  },

  // Cleanup settings
  cleanup: {
    removeOrphanedData: process.env.REMOVE_ORPHANED_DATA === 'true',
    cleanupLogs: process.env.CLEANUP_LOGS === 'true',
    cleanupBackups: process.env.CLEANUP_BACKUPS === 'true',
    cleanupTempFiles: true
  },

  // Testing settings
  testing: {
    enableDryRun: process.env.ENABLE_DRY_RUN === 'true',
    validateOnly: process.env.VALIDATE_ONLY === 'true',
    testMode: process.env.TEST_MODE === 'true',
    sampleDataOnly: process.env.SAMPLE_DATA_ONLY === 'true'
  },

  // Export settings
  export: {
    enableExport: process.env.ENABLE_EXPORT === 'true',
    exportFormat: process.env.EXPORT_FORMAT || 'json',
    exportLocation: process.env.EXPORT_LOCATION || 'exports',
    includeMetadata: true
  }
};

// Helper functions
seedingConfig.isEnabled = (feature) => {
  return seedingConfig.dataSources[feature]?.enabled !== false;
};

seedingConfig.getPriority = (feature) => {
  return seedingConfig.dataSources[feature]?.priority || 'low';
};

seedingConfig.shouldIncludeLogos = (feature) => {
  return seedingConfig.dataSources[feature]?.includeLogos === true;
};

seedingConfig.getBatchSize = () => {
  return seedingConfig.database.batchSize;
};

seedingConfig.getDelayMs = () => {
  return seedingConfig.database.delayMs;
};

seedingConfig.isStrictMode = () => {
  return seedingConfig.validation.strictMode;
};

seedingConfig.shouldContinueOnError = () => {
  return seedingConfig.errorHandling.continueOnError;
};

seedingConfig.getMaxErrors = () => {
  return seedingConfig.errorHandling.maxErrors;
};

seedingConfig.isProduction = () => {
  return seedingConfig.isProduction;
};

seedingConfig.getLogLevel = () => {
  return seedingConfig.logging.level;
};

seedingConfig.shouldBackup = () => {
  return seedingConfig.backup.enabled;
};

seedingConfig.getEgyptianCurrency = () => {
  return seedingConfig.egyptianMarket.currency;
};

seedingConfig.getEgyptianLanguage = () => {
  return seedingConfig.egyptianMarket.language;
};

seedingConfig.getPopularBrands = () => {
  return seedingConfig.egyptianMarket.popularBrands;
};

seedingConfig.getPopularModels = () => {
  return seedingConfig.egyptianMarket.popularModels;
};

seedingConfig.getMajorCities = () => {
  return seedingConfig.egyptianMarket.majorCities;
};

seedingConfig.getPaymentMethods = () => {
  return seedingConfig.egyptianMarket.paymentMethods;
};

seedingConfig.getOBDSeverityLevels = () => {
  return seedingConfig.obdCodes.severityLevels;
};

seedingConfig.getOBDUrgencyLevels = () => {
  return seedingConfig.obdCodes.urgencyLevels;
};

seedingConfig.getOBDCategories = () => {
  return seedingConfig.obdCodes.categories;
};

seedingConfig.getOBDCostRange = () => {
  return seedingConfig.obdCodes.costRange;
};

seedingConfig.getLogoSizes = () => {
  return seedingConfig.firebase.logoSizes;
};

seedingConfig.shouldUploadLogos = () => {
  return seedingConfig.firebase.enableLogoUpload;
};

seedingConfig.getCarPartCategories = () => {
  return seedingConfig.dataSources.carParts.categories;
};

seedingConfig.getBusinessCategories = () => {
  return seedingConfig.dataSources.businesses.categories;
};

seedingConfig.getNotificationLanguages = () => {
  return seedingConfig.dataSources.notifications.languages;
};

seedingConfig.getNotificationTemplates = () => {
  return seedingConfig.dataSources.notifications.templates;
};

module.exports = seedingConfig;
