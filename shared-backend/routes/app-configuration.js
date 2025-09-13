const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');

// ==================== APP CONFIGURATION ====================

// Get app configuration
router.get('/configuration', async (req, res) => {
    try {
        const { platform, version, deviceId } = req.query;

        const configCollection = await getCollection('app_configuration');
        
        // Get base configuration
        const baseConfig = await configCollection.findOne({ 
            type: 'base',
            isActive: true 
        });

        // Get platform-specific configuration
        const platformConfig = await configCollection.findOne({
            type: 'platform',
            platform: platform || 'mobile',
            isActive: true
        });

        // Get feature flags
        const featureFlagsCollection = await getCollection('feature_flags');
        const featureFlags = await featureFlagsCollection.find({
            isActive: true,
            $or: [
                { platforms: { $in: [platform || 'mobile'] } },
                { platforms: { $in: ['all'] } }
            ]
        }).toArray();

        // Get app settings
        const settingsCollection = await getCollection('app_settings');
        const appSettings = await settingsCollection.findOne({ isActive: true });

        const configuration = {
            app: {
                name: 'Clutch',
                version: version || '1.0.0',
                build: process.env.APP_BUILD || '1',
                environment: process.env.NODE_ENV || 'development'
            },
            api: {
                baseUrl: process.env.API_BASE_URL || 'https://clutch-main-nk7x.onrender.com',
                version: process.env.API_VERSION || 'v1',
                timeout: 30000
            },
            features: featureFlags.reduce((acc, flag) => {
                acc[flag.key] = flag.isEnabled;
                return acc;
            }, {}),
            settings: appSettings || {},
            platform: platformConfig?.config || {},
            maintenance: {
                isMaintenanceMode: process.env.MAINTENANCE_MODE === 'true',
                maintenanceMessage: process.env.MAINTENANCE_MESSAGE || 'App is under maintenance'
            },
            analytics: {
                enabled: process.env.ANALYTICS_ENABLED === 'true',
                trackingId: process.env.ANALYTICS_TRACKING_ID
            },
            notifications: {
                pushEnabled: true,
                emailEnabled: true,
                smsEnabled: true
            },
            payments: {
                stripeEnabled: true,
                paypalEnabled: true,
                applePayEnabled: platform === 'ios',
                googlePayEnabled: platform === 'android'
            }
        };

        res.json({
            success: true,
            data: configuration
        });
    } catch (error) {
        logger.error('Get app configuration error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CONFIGURATION_ERROR',
            message: 'Failed to retrieve app configuration'
        });
    }
});

// Get feature flags
router.get('/feature-flags', async (req, res) => {
    try {
        const { platform, userId } = req.query;

        const featureFlagsCollection = await getCollection('feature_flags');
        
        let query = { isActive: true };
        
        if (platform) {
            query.$or = [
                { platforms: { $in: [platform] } },
                { platforms: { $in: ['all'] } }
            ];
        }

        const featureFlags = await featureFlagsCollection.find(query).toArray();

        // Check user-specific feature flags
        if (userId) {
            const userFeatureFlagsCollection = await getCollection('user_feature_flags');
            const userFlags = await userFeatureFlagsCollection.find({ userId }).toArray();
            
            // Override global flags with user-specific flags
            userFlags.forEach(userFlag => {
                const globalFlag = featureFlags.find(flag => flag.key === userFlag.featureKey);
                if (globalFlag) {
                    globalFlag.isEnabled = userFlag.isEnabled;
                }
            });
        }

        res.json({
            success: true,
            data: featureFlags
        });
    } catch (error) {
        logger.error('Get feature flags error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_FEATURE_FLAGS_ERROR',
            message: 'Failed to retrieve feature flags'
        });
    }
});

// Get version check
router.get('/version-check', async (req, res) => {
    try {
        const { platform, currentVersion, buildNumber } = req.query;

        if (!platform || !currentVersion) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Platform and current version are required'
            });
        }

        const versionsCollection = await getCollection('app_versions');
        const latestVersion = await versionsCollection.findOne({
            platform,
            isActive: true
        }, { sort: { version: -1 } });

        if (!latestVersion) {
            return res.status(404).json({
                success: false,
                error: 'VERSION_NOT_FOUND',
                message: 'No version information found for this platform'
            });
        }

        const versionComparison = compareVersions(currentVersion, latestVersion.version);
        
        const updateInfo = {
            currentVersion,
            latestVersion: latestVersion.version,
            buildNumber: latestVersion.buildNumber,
            isUpdateRequired: versionComparison < 0,
            isUpdateAvailable: versionComparison < 0,
            isForceUpdate: latestVersion.forceUpdate || false,
            updateMessage: latestVersion.updateMessage || 'A new version is available',
            downloadUrl: latestVersion.downloadUrl,
            changelog: latestVersion.changelog || [],
            releaseDate: latestVersion.releaseDate
        };

        res.json({
            success: true,
            data: updateInfo
        });
    } catch (error) {
        logger.error('Version check error:', error);
        res.status(500).json({
            success: false,
            error: 'VERSION_CHECK_ERROR',
            message: 'Failed to check version'
        });
    }
});

// Get splash screen data
router.get('/splash-screen-data', async (req, res) => {
    try {
        const { platform, language } = req.query;

        const splashCollection = await getCollection('splash_screen');
        const splashData = await splashCollection.findOne({
            platform: platform || 'mobile',
            language: language || 'en',
            isActive: true
        });

        if (!splashData) {
            // Return default splash data
            return res.json({
                success: true,
                data: {
                    title: 'Welcome to Clutch',
                    subtitle: 'Your automotive service companion',
                    backgroundImage: 'https://clutch.com/images/splash-bg.jpg',
                    logo: 'https://clutch.com/images/logo.png',
                    loadingText: 'Loading...',
                    showProgress: true
                }
            });
        }

        res.json({
            success: true,
            data: splashData
        });
    } catch (error) {
        logger.error('Get splash screen data error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SPLASH_DATA_ERROR',
            message: 'Failed to retrieve splash screen data'
        });
    }
});

// Get maintenance mode status
router.get('/maintenance-mode', async (req, res) => {
    try {
        const maintenanceCollection = await getCollection('maintenance_mode');
        const maintenance = await maintenanceCollection.findOne({ isActive: true });

        const maintenanceInfo = {
            isMaintenanceMode: maintenance?.isEnabled || false,
            message: maintenance?.message || 'App is under maintenance',
            estimatedDuration: maintenance?.estimatedDuration || null,
            startTime: maintenance?.startTime || null,
            endTime: maintenance?.endTime || null,
            affectedServices: maintenance?.affectedServices || [],
            allowReadOnly: maintenance?.allowReadOnly || false
        };

        res.json({
            success: true,
            data: maintenanceInfo
        });
    } catch (error) {
        logger.error('Get maintenance mode error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_MAINTENANCE_MODE_ERROR',
            message: 'Failed to retrieve maintenance mode status'
        });
    }
});

// Get announcements
router.get('/announcements', async (req, res) => {
    try {
        const { platform, language } = req.query;

        const announcementsCollection = await getCollection('announcements');
        const announcements = await announcementsCollection.find({
            platform: { $in: [platform || 'mobile', 'all'] },
            language: { $in: [language || 'en', 'all'] },
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        }).sort({ priority: -1, createdAt: -1 }).toArray();

        res.json({
            success: true,
            data: announcements
        });
    } catch (error) {
        logger.error('Get announcements error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ANNOUNCEMENTS_ERROR',
            message: 'Failed to retrieve announcements'
        });
    }
});

// ==================== APP ANALYTICS ====================

// Track app launch
router.post('/analytics/launch', async (req, res) => {
    try {
        const { 
            platform, 
            version, 
            deviceId, 
            deviceInfo, 
            userId,
            sessionId 
        } = req.body;

        const analyticsCollection = await getCollection('app_analytics');
        
        const launchData = {
            type: 'app_launch',
            platform,
            version,
            deviceId,
            deviceInfo: deviceInfo || {},
            userId: userId || null,
            sessionId: sessionId || null,
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };

        await analyticsCollection.insertOne(launchData);

        res.json({
            success: true,
            message: 'App launch tracked successfully'
        });
    } catch (error) {
        logger.error('Track app launch error:', error);
        res.status(500).json({
            success: false,
            error: 'TRACK_LAUNCH_ERROR',
            message: 'Failed to track app launch'
        });
    }
});

// Track crash report
router.post('/analytics/crash-report', async (req, res) => {
    try {
        const { 
            platform, 
            version, 
            deviceId, 
            crashData, 
            userId,
            sessionId 
        } = req.body;

        if (!crashData) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_CRASH_DATA',
                message: 'Crash data is required'
            });
        }

        const crashCollection = await getCollection('crash_reports');
        
        const crashReport = {
            platform,
            version,
            deviceId,
            crashData,
            userId: userId || null,
            sessionId: sessionId || null,
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            status: 'new'
        };

        await crashCollection.insertOne(crashReport);

        // Also log to analytics
        const analyticsCollection = await getCollection('app_analytics');
        await analyticsCollection.insertOne({
            type: 'crash_report',
            platform,
            version,
            deviceId,
            userId: userId || null,
            sessionId: sessionId || null,
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Crash report submitted successfully'
        });
    } catch (error) {
        logger.error('Submit crash report error:', error);
        res.status(500).json({
            success: false,
            error: 'SUBMIT_CRASH_REPORT_ERROR',
            message: 'Failed to submit crash report'
        });
    }
});

// Track user behavior
router.post('/analytics/user-behavior', async (req, res) => {
    try {
        const { 
            platform, 
            version, 
            deviceId, 
            eventType, 
            eventData, 
            userId,
            sessionId 
        } = req.body;

        if (!eventType) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_EVENT_TYPE',
                message: 'Event type is required'
            });
        }

        const analyticsCollection = await getCollection('app_analytics');
        
        const behaviorData = {
            type: 'user_behavior',
            eventType,
            eventData: eventData || {},
            platform,
            version,
            deviceId,
            userId: userId || null,
            sessionId: sessionId || null,
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };

        await analyticsCollection.insertOne(behaviorData);

        res.json({
            success: true,
            message: 'User behavior tracked successfully'
        });
    } catch (error) {
        logger.error('Track user behavior error:', error);
        res.status(500).json({
            success: false,
            error: 'TRACK_BEHAVIOR_ERROR',
            message: 'Failed to track user behavior'
        });
    }
});

// ==================== HELPER FUNCTIONS ====================

function compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const v1Part = v1Parts[i] || 0;
        const v2Part = v2Parts[i] || 0;
        
        if (v1Part > v2Part) return 1;
        if (v1Part < v2Part) return -1;
    }
    
    return 0;
}


// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'app-configuration'} service is running`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'app-configuration'} item retrieved`,
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: `${'app-configuration'} item created`,
    data: { id: Date.now(), ...req.body, createdAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'POST',
    path: '/'
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'app-configuration'} item updated`,
    data: { id: id, ...req.body, updatedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'PUT',
    path: `/${id}`
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'app-configuration'} item deleted`,
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'app-configuration'} search results`,
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;
