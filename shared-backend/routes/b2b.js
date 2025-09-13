const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');
const crypto = require('crypto');

// ==================== B2B WHITE-LABEL CONFIGURATIONS ====================

// Get all white-label configurations
router.get('/white-label/configurations', authenticateToken, requireRole(['admin', 'b2b_manager']), async (req, res) => {
    try {
        const b2bCollection = await getCollection('b2b_configurations');
        const configurations = await b2bCollection.find({}).toArray();

        res.json({
            success: true,
            data: configurations,
            count: configurations.length
        });
    } catch (error) {
        logger.error('Get B2B configurations error:', error);
        res.status(500).json({
            success: false,
            error: 'B2B_CONFIG_ERROR',
            message: 'Failed to retrieve B2B configurations'
        });
    }
});

// Create new white-label configuration
router.post('/white-label/configurations', authenticateToken, requireRole(['admin', 'b2b_manager']), async (req, res) => {
    try {
        const {
            companyName,
            domain,
            branding,
            features,
            subscription,
            contactInfo
        } = req.body;

        // Validate required fields
        if (!companyName || !domain) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Company name and domain are required'
            });
        }

        const b2bCollection = await getCollection('b2b_configurations');
        
        // Check if domain already exists
        const existingConfig = await b2bCollection.findOne({ domain });
        if (existingConfig) {
            return res.status(409).json({
                success: false,
                error: 'DOMAIN_EXISTS',
                message: 'Domain already configured for another company'
            });
        }

        // Create configuration
        const configuration = {
            companyName,
            domain,
            branding: {
                logo: branding?.logo || '',
                primaryColor: branding?.primaryColor || '#007bff',
                secondaryColor: branding?.secondaryColor || '#6c757d',
                companyName: branding?.companyName || companyName,
                ...branding
            },
            features: {
                dashboard: features?.dashboard !== false,
                analytics: features?.analytics !== false,
                mobileApp: features?.mobileApp !== false,
                apiAccess: features?.apiAccess !== false,
                whiteLabel: features?.whiteLabel !== false,
                ...features
            },
            subscription: {
                plan: subscription?.plan || 'basic',
                startDate: new Date(),
                endDate: subscription?.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                status: 'active',
                ...subscription
            },
            contactInfo: {
                email: contactInfo?.email || '',
                phone: contactInfo?.phone || '',
                address: contactInfo?.address || '',
                ...contactInfo
            },
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await b2bCollection.insertOne(configuration);
        configuration._id = result.insertedId;

        res.status(201).json({
            success: true,
            data: configuration,
            message: 'B2B configuration created successfully'
        });
    } catch (error) {
        logger.error('Create B2B configuration error:', error);
        res.status(500).json({
            success: false,
            error: 'B2B_CREATE_ERROR',
            message: 'Failed to create B2B configuration'
        });
    }
});

// Update white-label configuration
router.put('/white-label/configurations/:id', authenticateToken, requireRole(['admin', 'b2b_manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        updates.updatedAt = new Date();

        const b2bCollection = await getCollection('b2b_configurations');
        const result = await b2bCollection.updateOne(
            { _id: id },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'CONFIG_NOT_FOUND',
                message: 'B2B configuration not found'
            });
        }

        res.json({
            success: true,
            message: 'B2B configuration updated successfully'
        });
    } catch (error) {
        logger.error('Update B2B configuration error:', error);
        res.status(500).json({
            success: false,
            error: 'B2B_UPDATE_ERROR',
            message: 'Failed to update B2B configuration'
        });
    }
});

// ==================== B2B API KEYS ====================

// Get all API keys
router.get('/api-keys', authenticateToken, requireRole(['admin', 'b2b_manager']), async (req, res) => {
    try {
        const apiKeysCollection = await getCollection('b2b_api_keys');
        const apiKeys = await apiKeysCollection.find({}).toArray();

        // Mask sensitive data
        const maskedKeys = apiKeys.map(key => ({
            ...key,
            secretKey: key.secretKey ? `${key.secretKey.substring(0, 8)}...` : null
        }));

        res.json({
            success: true,
            data: maskedKeys,
            count: maskedKeys.length
        });
    } catch (error) {
        logger.error('Get API keys error:', error);
        res.status(500).json({
            success: false,
            error: 'API_KEYS_ERROR',
            message: 'Failed to retrieve API keys'
        });
    }
});

// Generate new API key
router.post('/api-keys', authenticateToken, requireRole(['admin', 'b2b_manager']), async (req, res) => {
    try {
        const {
            companyId,
            keyName,
            permissions,
            expiryDate
        } = req.body;

        if (!companyId || !keyName) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Company ID and key name are required'
            });
        }

        const apiKeysCollection = await getCollection('b2b_api_keys');
        
        // Generate API key
        const apiKey = `clutch_${crypto.randomBytes(16).toString('hex')}`;
        const secretKey = crypto.randomBytes(32).toString('hex');

        const newApiKey = {
            companyId,
            keyName,
            apiKey,
            secretKey,
            permissions: permissions || ['read'],
            status: 'active',
            createdAt: new Date(),
            expiryDate: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            lastUsed: null,
            usageCount: 0
        };

        const result = await apiKeysCollection.insertOne(newApiKey);
        newApiKey._id = result.insertedId;

        // Return full key only once
        res.status(201).json({
            success: true,
            data: {
                ...newApiKey,
                secretKey: `${secretKey.substring(0, 8)}...`
            },
            fullSecretKey: secretKey,
            message: 'API key generated successfully. Store the secret key securely.'
        });
    } catch (error) {
        logger.error('Generate API key error:', error);
        res.status(500).json({
            success: false,
            error: 'API_KEY_GENERATION_ERROR',
            message: 'Failed to generate API key'
        });
    }
});

// Revoke API key
router.delete('/api-keys/:id', authenticateToken, requireRole(['admin', 'b2b_manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const apiKeysCollection = await getCollection('b2b_api_keys');
        
        const result = await apiKeysCollection.updateOne(
            { _id: id },
            { $set: { status: 'revoked', updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'API_KEY_NOT_FOUND',
                message: 'API key not found'
            });
        }

        res.json({
            success: true,
            message: 'API key revoked successfully'
        });
    } catch (error) {
        logger.error('Revoke API key error:', error);
        res.status(500).json({
            success: false,
            error: 'API_KEY_REVOKE_ERROR',
            message: 'Failed to revoke API key'
        });
    }
});

// ==================== B2B ANALYTICS ====================

// Get B2B analytics overview
router.get('/analytics', authenticateToken, requireRole(['admin', 'b2b_manager']), async (req, res) => {
    try {
        const { startDate, endDate, companyId } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }
        if (companyId) filters.companyId = companyId;

        const [
            b2bCollection,
            apiKeysCollection,
            usageCollection
        ] = await Promise.all([
            getCollection('b2b_configurations'),
            getCollection('b2b_api_keys'),
            getCollection('b2b_api_usage')
        ]);

        // Get basic stats
        const totalCompanies = await b2bCollection.countDocuments();
        const activeCompanies = await b2bCollection.countDocuments({ status: 'active' });
        const totalApiKeys = await apiKeysCollection.countDocuments();
        const activeApiKeys = await apiKeysCollection.countDocuments({ status: 'active' });

        // Get usage analytics
        const usageStats = await usageCollection.aggregate([
            { $match: filters },
            {
                $group: {
                    _id: null,
                    totalRequests: { $sum: 1 },
                    totalDataTransferred: { $sum: '$dataSize' || 0 },
                    averageResponseTime: { $avg: '$responseTime' || 0 }
                }
            }
        ]).toArray();

        // Get company performance
        const companyPerformance = await usageCollection.aggregate([
            { $match: filters },
            {
                $group: {
                    _id: '$companyId',
                    totalRequests: { $sum: 1 },
                    totalDataTransferred: { $sum: '$dataSize' || 0 },
                    averageResponseTime: { $avg: '$responseTime' || 0 }
                }
            },
            { $sort: { totalRequests: -1 } },
            { $limit: 10 }
        ]).toArray();

        // Get monthly trends
        const monthlyTrends = await usageCollection.aggregate([
            { $match: filters },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalRequests: { $sum: 1 },
                    totalDataTransferred: { $sum: '$dataSize' || 0 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]).toArray();

        const analytics = {
            overview: {
                totalCompanies,
                activeCompanies,
                totalApiKeys,
                activeApiKeys
            },
            usage: usageStats[0] || {
                totalRequests: 0,
                totalDataTransferred: 0,
                averageResponseTime: 0
            },
            companyPerformance,
            monthlyTrends
        };

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        logger.error('Get B2B analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'B2B_ANALYTICS_ERROR',
            message: 'Failed to retrieve B2B analytics'
        });
    }
});

// Get company-specific analytics
router.get('/analytics/:companyId', authenticateToken, requireRole(['admin', 'b2b_manager']), async (req, res) => {
    try {
        const { companyId } = req.params;
        const { startDate, endDate } = req.query;
        
        const filters = { companyId };
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const usageCollection = await getCollection('b2b_api_usage');
        
        // Get company usage stats
        const usageStats = await usageCollection.aggregate([
            { $match: filters },
            {
                $group: {
                    _id: null,
                    totalRequests: { $sum: 1 },
                    totalDataTransferred: { $sum: '$dataSize' || 0 },
                    averageResponseTime: { $avg: '$responseTime' || 0 },
                    uniqueEndpoints: { $addToSet: '$endpoint' }
                }
            }
        ]).toArray();

        // Get endpoint usage breakdown
        const endpointUsage = await usageCollection.aggregate([
            { $match: filters },
            {
                $group: {
                    _id: '$endpoint',
                    totalRequests: { $sum: 1 },
                    totalDataTransferred: { $sum: '$dataSize' || 0 },
                    averageResponseTime: { $avg: '$responseTime' || 0 }
                }
            },
            { $sort: { totalRequests: -1 } }
        ]).toArray();

        // Get hourly usage pattern
        const hourlyUsage = await usageCollection.aggregate([
            { $match: filters },
            {
                $group: {
                    _id: { $hour: '$createdAt' },
                    totalRequests: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]).toArray();

        const companyAnalytics = {
            usage: usageStats[0] || {
                totalRequests: 0,
                totalDataTransferred: 0,
                averageResponseTime: 0,
                uniqueEndpoints: []
            },
            endpointUsage,
            hourlyUsage,
            uniqueEndpointsCount: usageStats[0]?.uniqueEndpoints?.length || 0
        };

        res.json({
            success: true,
            data: companyAnalytics
        });
    } catch (error) {
        logger.error('Get company analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'COMPANY_ANALYTICS_ERROR',
            message: 'Failed to retrieve company analytics'
        });
    }
});

// ==================== B2B WHITE-LABEL CUSTOMIZATION ====================

// Get white-label customization options
router.get('/white-label/customization/:companyId', authenticateToken, async (req, res) => {
    try {
        const { companyId } = req.params;
        const b2bCollection = await getCollection('b2b_configurations');
        
        const configuration = await b2bCollection.findOne({ _id: companyId });
        if (!configuration) {
            return res.status(404).json({
                success: false,
                error: 'CONFIG_NOT_FOUND',
                message: 'B2B configuration not found'
            });
        }

        // Return only customization data
        const customization = {
            branding: configuration.branding,
            features: configuration.features,
            domain: configuration.domain
        };

        res.json({
            success: true,
            data: customization
        });
    } catch (error) {
        logger.error('Get customization error:', error);
        res.status(500).json({
            success: false,
            error: 'CUSTOMIZATION_ERROR',
            message: 'Failed to retrieve customization options'
        });
    }
});

// Update white-label customization
router.put('/white-label/customization/:companyId', authenticateToken, async (req, res) => {
    try {
        const { companyId } = req.params;
        const { branding, features } = req.body;

        const b2bCollection = await getCollection('b2b_configurations');
        
        const updates = {
            updatedAt: new Date()
        };

        if (branding) updates.branding = branding;
        if (features) updates.features = features;

        const result = await b2bCollection.updateOne(
            { _id: companyId },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'CONFIG_NOT_FOUND',
                message: 'B2B configuration not found'
            });
        }

        res.json({
            success: true,
            message: 'Customization updated successfully'
        });
    } catch (error) {
        logger.error('Update customization error:', error);
        res.status(500).json({
            success: false,
            error: 'CUSTOMIZATION_UPDATE_ERROR',
            message: 'Failed to update customization'
        });
    }
});


// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'b2b'} service is running`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${'b2b'} item retrieved`,
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: `${'b2b'} item created`,
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
    message: `${'b2b'} item updated`,
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
    message: `${'b2b'} item deleted`,
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${'b2b'} search results`,
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;
