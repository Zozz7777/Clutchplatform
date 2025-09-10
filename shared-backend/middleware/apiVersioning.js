const { logger } = require('../config/logger');

/**
 * API Versioning Middleware
 * Implements semantic versioning for API endpoints
 */
class APIVersioningMiddleware {
  constructor() {
    this.supportedVersions = ['v1', 'v2', 'v3'];
    this.defaultVersion = 'v1';
    this.versionRoutes = new Map();
    this.deprecatedVersions = new Set();
    this.versionFeatures = new Map();
  }

  /**
   * Create version-specific middleware
   */
  createVersionMiddleware(version) {
    return (req, res, next) => {
      // Only apply versioning to API routes
      if (!req.path.startsWith('/api/')) {
        return next();
      }
      
      // Extract version from URL path
      const pathVersion = req.path.split('/')[2]; // /api/v1/...
      
      // Extract version from headers
      const headerVersion = req.headers['api-version'] || req.headers['x-api-version'];
      
      // Extract version from query parameter
      const queryVersion = req.query.version;
      
      // Determine the API version to use
      let apiVersion = pathVersion || headerVersion || queryVersion || this.defaultVersion;
      
      // Debug logging
      console.log('🔍 API Versioning Debug:', {
        path: req.path,
        pathVersion,
        headerVersion,
        queryVersion,
        apiVersion,
        supportedVersions: this.supportedVersions,
        isSupported: this.supportedVersions.includes(apiVersion)
      });
      
      // Validate version
      if (!this.supportedVersions.includes(apiVersion)) {
        console.log('❌ Unsupported API version:', {
          requestedVersion: apiVersion,
          supportedVersions: this.supportedVersions,
          path: req.path
        });
        return res.status(400).json({
          success: false,
          error: 'Unsupported API version',
          message: `Supported versions: ${this.supportedVersions.join(', ')}`,
          requestedVersion: apiVersion,
          defaultVersion: this.defaultVersion
        });
      }

      // Check if version is deprecated
      if (this.deprecatedVersions.has(apiVersion)) {
        res.set('X-API-Deprecated', 'true');
        res.set('X-API-Deprecation-Date', '2024-12-31');
        res.set('X-API-Sunset-Date', '2025-06-30');
        
        logger.warn(`Deprecated API version used: ${apiVersion}`, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path
        });
      }

      // Set version context
      req.apiVersion = apiVersion;
      req.versionFeatures = this.versionFeatures.get(apiVersion) || {};
      
      // Add version info to response headers
      res.set('X-API-Version', apiVersion);
      res.set('X-API-Latest-Version', this.supportedVersions[this.supportedVersions.length - 1]);
      
      next();
    };
  }

  /**
   * Register version-specific routes
   */
  registerVersionRoutes(version, routes) {
    this.versionRoutes.set(version, routes);
    logger.info(`Registered API routes for version: ${version}`);
  }

  /**
   * Mark version as deprecated
   */
  deprecateVersion(version, deprecationDate, sunsetDate) {
    this.deprecatedVersions.add(version);
    logger.warn(`API version ${version} marked as deprecated. Sunset date: ${sunsetDate}`);
  }

  /**
   * Add features to specific version
   */
  addVersionFeatures(version, features) {
    this.versionFeatures.set(version, features);
  }

  /**
   * Get version information
   */
  getVersionInfo() {
    return {
      supportedVersions: this.supportedVersions,
      defaultVersion: this.defaultVersion,
      deprecatedVersions: Array.from(this.deprecatedVersions),
      versionFeatures: Object.fromEntries(this.versionFeatures)
    };
  }

  /**
   * Version-specific feature check middleware
   */
  requireFeature(featureName) {
    return (req, res, next) => {
      const version = req.apiVersion;
      const features = this.versionFeatures.get(version) || {};
      
      if (!features[featureName]) {
        return res.status(400).json({
          success: false,
          error: 'Feature not available',
          message: `Feature '${featureName}' is not available in API version ${version}`,
          availableFeatures: Object.keys(features)
        });
      }
      
      next();
    };
  }
}

// Create singleton instance
const apiVersioning = new APIVersioningMiddleware();

// Configure version features
apiVersioning.addVersionFeatures('v1', {
  basicAuth: true,
  basicBooking: true,
  basicPayment: true,
  basicNotifications: true
});

apiVersioning.addVersionFeatures('v2', {
  basicAuth: true,
  basicBooking: true,
  basicPayment: true,
  basicNotifications: true,
  advancedAnalytics: true,
  realTimeChat: true,
  mobileOptimization: true,
  aiRecommendations: true
});

apiVersioning.addVersionFeatures('v3', {
  basicAuth: true,
  basicBooking: true,
  basicPayment: true,
  basicNotifications: true,
  advancedAnalytics: true,
  realTimeChat: true,
  mobileOptimization: true,
  aiRecommendations: true,
  biometricAuth: true,
  voiceCommands: true,
  arIntegration: true,
  predictiveMaintenance: true,
  dynamicPricing: true,
  subscriptionServices: true,
  edgeComputing: true,
  graphQL: true,
  iot: true,
  blockchain: true
});

// Mark v1 as deprecated (example)
// apiVersioning.deprecateVersion('v1', '2024-01-01', '2024-12-31');

module.exports = {
  apiVersioning,
  createVersionMiddleware: (version) => apiVersioning.createVersionMiddleware(version),
  requireFeature: (feature) => apiVersioning.requireFeature(feature),
  getVersionInfo: () => apiVersioning.getVersionInfo()
};
