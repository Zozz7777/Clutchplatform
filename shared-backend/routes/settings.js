const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs');
const fileService = require('../services/fileService');
const { Buffer } = require('buffer');

// Get all settings
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, type } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (category) filters.category = category;
        if (type) filters.type = type;

        const collection = await getCollection('settings');
        const settings = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ category: 1, name: 1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: settings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SETTINGS_FAILED',
            message: 'Failed to retrieve settings'
        });
    }
});

// Get setting by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('settings');
        const setting = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!setting) {
            return res.status(404).json({
                success: false,
                error: 'SETTING_NOT_FOUND',
                message: 'Setting not found'
            });
        }

        res.json({
            success: true,
            data: setting
        });
    } catch (error) {
        console.error('Get setting error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SETTING_FAILED',
            message: 'Failed to retrieve setting'
        });
    }
});

// Get setting by key
router.get('/key/:key', authenticateToken, async (req, res) => {
    try {
        const { key } = req.params;
        const collection = await getCollection('settings');
        const setting = await collection.findOne({ key });
        
        if (!setting) {
            return res.status(404).json({
                success: false,
                error: 'SETTING_NOT_FOUND',
                message: 'Setting not found'
            });
        }

        res.json({
            success: true,
            data: setting
        });
    } catch (error) {
        console.error('Get setting by key error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SETTING_BY_KEY_FAILED',
            message: 'Failed to retrieve setting'
        });
    }
});

// Create setting
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            key, 
            value, 
            name, 
            description,
            category,
            type,
            isEditable,
            isRequired 
        } = req.body;
        
        if (!key || !value || !name) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Key, value, and name are required'
            });
        }

        const settingData = {
            key,
            value,
            name,
            description: description || '',
            category: category || 'general',
            type: type || 'string',
            isEditable: isEditable !== false,
            isRequired: isRequired || false,
            createdBy: req.user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('settings');
        
        // Check if setting with same key already exists
        const existingSetting = await collection.findOne({ key });
        if (existingSetting) {
            return res.status(400).json({
                success: false,
                error: 'SETTING_KEY_EXISTS',
                message: 'Setting with this key already exists'
            });
        }

        const result = await collection.insertOne(settingData);
        
        settingData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Setting created successfully',
            data: settingData
        });
    } catch (error) {
        console.error('Create setting error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_SETTING_FAILED',
            message: 'Failed to create setting'
        });
    }
});

// Update setting
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('settings');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'SETTING_NOT_FOUND',
                message: 'Setting not found'
            });
        }

        res.json({
            success: true,
            message: 'Setting updated successfully'
        });
    } catch (error) {
        console.error('Update setting error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_SETTING_FAILED',
            message: 'Failed to update setting'
        });
    }
});

// Update setting by key
router.put('/key/:key', authenticateToken, async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        
        if (value === undefined) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_VALUE',
                message: 'Value is required'
            });
        }

        const collection = await getCollection('settings');
        const result = await collection.updateOne(
            { key },
            { 
                $set: { 
                    value,
                    updatedAt: new Date()
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'SETTING_NOT_FOUND',
                message: 'Setting not found'
            });
        }

        res.json({
            success: true,
            message: 'Setting updated successfully'
        });
    } catch (error) {
        console.error('Update setting by key error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_SETTING_BY_KEY_FAILED',
            message: 'Failed to update setting'
        });
    }
});

// Get settings by category
router.get('/category/:category', authenticateToken, async (req, res) => {
    try {
        const { category } = req.params;
        
        const collection = await getCollection('settings');
        const settings = await collection.find({ category })
            .sort({ name: 1 })
            .toArray();

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Get settings by category error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SETTINGS_BY_CATEGORY_FAILED',
            message: 'Failed to retrieve settings by category'
        });
    }
});

// Bulk update settings
router.patch('/bulk-update', authenticateToken, async (req, res) => {
    try {
        const { settings } = req.body;
        
        if (!Array.isArray(settings) || settings.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_SETTINGS_ARRAY',
                message: 'Settings array is required and must not be empty'
            });
        }

        const collection = await getCollection('settings');
        const bulkOps = settings.map(setting => ({
            updateOne: {
                filter: { key: setting.key },
                update: {
                    $set: {
                        value: setting.value,
                        updatedAt: new Date()
                    }
                }
            }
        }));

        const result = await collection.bulkWrite(bulkOps);

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: {
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('Bulk update settings error:', error);
        res.status(500).json({
            success: false,
            error: 'BULK_UPDATE_SETTINGS_FAILED',
            message: 'Failed to bulk update settings'
        });
    }
});

// Reset setting to default
router.patch('/:id/reset', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const collection = await getCollection('settings');
        const setting = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!setting) {
            return res.status(404).json({
                success: false,
                error: 'SETTING_NOT_FOUND',
                message: 'Setting not found'
            });
        }

        if (!setting.defaultValue) {
            return res.status(400).json({
                success: false,
                error: 'NO_DEFAULT_VALUE',
                message: 'This setting has no default value'
            });
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    value: setting.defaultValue,
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: 'Setting reset to default value successfully'
        });
    } catch (error) {
        console.error('Reset setting error:', error);
        res.status(500).json({
            success: false,
            error: 'RESET_SETTING_FAILED',
            message: 'Failed to reset setting'
        });
    }
});

// Get settings categories
router.get('/categories/list', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('settings');
        const categories = await collection.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get settings categories error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SETTINGS_CATEGORIES_FAILED',
            message: 'Failed to retrieve settings categories'
        });
    }
});

// ==================== SYSTEM SETTINGS ENDPOINTS ====================

// Get system features
router.get('/system/features', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('settings');
        const features = await collection.find({ category: 'features' })
            .sort({ name: 1 })
            .toArray();

        res.json({
            success: true,
            data: features
        });
    } catch (error) {
        console.error('Get system features error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SYSTEM_FEATURES_FAILED',
            message: 'Failed to retrieve system features'
        });
    }
});

// Get company settings
router.get('/system/company', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('settings');
        const companySettings = await collection.find({ category: 'company' })
            .sort({ name: 1 })
            .toArray();

        res.json({
            success: true,
            data: companySettings
        });
    } catch (error) {
        console.error('Get company settings error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_COMPANY_SETTINGS_FAILED',
            message: 'Failed to retrieve company settings'
        });
    }
});

// Get system health settings
router.get('/system/health', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('settings');
        const healthSettings = await collection.find({ category: 'health' })
            .sort({ name: 1 })
            .toArray();

        res.json({
            success: true,
            data: healthSettings
        });
    } catch (error) {
        console.error('Get system health settings error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SYSTEM_HEALTH_SETTINGS_FAILED',
            message: 'Failed to retrieve system health settings'
        });
    }
});

// Get security settings
router.get('/system/security', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('settings');
        const securitySettings = await collection.find({ category: 'security' })
            .sort({ name: 1 })
            .toArray();

        res.json({
            success: true,
            data: securitySettings
        });
    } catch (error) {
        console.error('Get security settings error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SECURITY_SETTINGS_FAILED',
            message: 'Failed to retrieve security settings'
        });
    }
});

// ==================== FILE UPLOAD ENDPOINT ====================

// File upload endpoint
router.post('/upload', authenticateToken, async (req, res) => {
    try {
        // Check if file data is present
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'NO_FILE_UPLOADED',
                message: 'No file was uploaded'
            });
        }

        const uploadedFile = req.files.file;
        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (uploadedFile.size > maxSize) {
            return res.status(400).json({
                success: false,
                error: 'FILE_TOO_LARGE',
                message: 'File size exceeds 10MB limit'
            });
        }
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
        if (!allowedTypes.includes(uploadedFile.mimetype)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_FILE_TYPE',
                message: 'File type not allowed'
            });
        }
        // Upload to Firebase Storage
        const folderPath = 'uploads';
        const metadata = {
            contentType: uploadedFile.mimetype,
            uploadedBy: req.user.userId
        };
        const buffer = Buffer.isBuffer(uploadedFile.data) ? uploadedFile.data : Buffer.from(uploadedFile.data);
        const uploadResult = await fileService.uploadFile(buffer, uploadedFile.name, folderPath, metadata);
        if (!uploadResult.success) {
            return res.status(500).json({
                success: false,
                error: 'FILE_UPLOAD_FAILED',
                message: 'Failed to upload file to Firebase Storage.'
            });
        }
        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: uploadResult
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({
            success: false,
            error: 'FILE_UPLOAD_FAILED',
            message: 'An unexpected error occurred during file upload. Please try again later.'
        });
    }
});

// Export settings
router.get('/export/:category', authenticateToken, async (req, res) => {
    try {
        const { category } = req.params;
        
        const filters = {};
        if (category !== 'all') {
            filters.category = category;
        }

        const collection = await getCollection('settings');
        const settings = await collection.find(filters)
            .sort({ category: 1, name: 1 })
            .toArray();

        const exportData = settings.map(setting => ({
            key: setting.key,
            value: setting.value,
            name: setting.name,
            description: setting.description,
            category: setting.category,
            type: setting.type
        }));

        res.json({
            success: true,
            data: exportData
        });
    } catch (error) {
        console.error('Export settings error:', error);
        res.status(500).json({
            success: false,
            error: 'EXPORT_SETTINGS_FAILED',
            message: 'Failed to export settings'
        });
    }
});

module.exports = router;
