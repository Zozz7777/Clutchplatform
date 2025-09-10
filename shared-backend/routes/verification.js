const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all verifications
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, type, status, userId } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (type) filters.type = type;
        if (status) filters.status = status;
        if (userId) filters.userId = new ObjectId(userId);

        const collection = await getCollection('verifications');
        const verifications = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: verifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get verifications error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_VERIFICATIONS_FAILED',
            message: 'Failed to retrieve verifications'
        });
    }
});

// Get verification by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('verifications');
        const verification = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!verification) {
            return res.status(404).json({
                success: false,
                error: 'VERIFICATION_NOT_FOUND',
                message: 'Verification not found'
            });
        }

        res.json({
            success: true,
            data: verification
        });
    } catch (error) {
        console.error('Get verification error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_VERIFICATION_FAILED',
            message: 'Failed to retrieve verification'
        });
    }
});

// Create verification request
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            type, 
            userId, 
            documentType,
            documentData,
            additionalInfo 
        } = req.body;
        
        if (!type || !userId) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Type and user ID are required'
            });
        }

        const verificationData = {
            type,
            userId: new ObjectId(userId),
            documentType: documentType || '',
            documentData: documentData || {},
            additionalInfo: additionalInfo || {},
            status: 'pending',
            submittedAt: new Date(),
            createdBy: req.user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('verifications');
        const result = await collection.insertOne(verificationData);
        
        verificationData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Verification request created successfully',
            data: verificationData
        });
    } catch (error) {
        console.error('Create verification error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_VERIFICATION_FAILED',
            message: 'Failed to create verification request'
        });
    }
});

// Update verification status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, reviewerId } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_STATUS',
                message: 'Status is required'
            });
        }

        const updateData = {
            status,
            updatedAt: new Date()
        };

        if (status === 'approved') {
            updateData.approvedAt = new Date();
            updateData.reviewerId = reviewerId || req.user.userId;
        } else if (status === 'rejected') {
            updateData.rejectedAt = new Date();
            updateData.reviewerId = reviewerId || req.user.userId;
        }

        if (notes) {
            updateData.notes = notes;
        }

        const collection = await getCollection('verifications');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'VERIFICATION_NOT_FOUND',
                message: 'Verification not found'
            });
        }

        res.json({
            success: true,
            message: `Verification status updated to ${status}`
        });
    } catch (error) {
        console.error('Update verification status error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_VERIFICATION_STATUS_FAILED',
            message: 'Failed to update verification status'
        });
    }
});

// Get user verifications
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, type } = req.query;
        
        const filters = { userId: new ObjectId(userId) };
        if (status) filters.status = status;
        if (type) filters.type = type;

        const collection = await getCollection('verifications');
        const verifications = await collection.find(filters)
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            data: verifications
        });
    } catch (error) {
        console.error('Get user verifications error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_USER_VERIFICATIONS_FAILED',
            message: 'Failed to retrieve user verifications'
        });
    }
});

// Submit document for verification
router.post('/document', authenticateToken, async (req, res) => {
    try {
        const { 
            userId, 
            documentType, 
            documentUrl,
            documentNumber,
            expiryDate,
            additionalData 
        } = req.body;
        
        if (!userId || !documentType || !documentUrl) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'User ID, document type, and document URL are required'
            });
        }

        const documentData = {
            userId: new ObjectId(userId),
            documentType,
            documentUrl,
            documentNumber: documentNumber || '',
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            additionalData: additionalData || {},
            status: 'pending',
            submittedAt: new Date(),
            createdBy: req.user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('verification_documents');
        const result = await collection.insertOne(documentData);
        
        documentData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Document submitted for verification successfully',
            data: documentData
        });
    } catch (error) {
        console.error('Submit document error:', error);
        res.status(500).json({
            success: false,
            error: 'SUBMIT_DOCUMENT_FAILED',
            message: 'Failed to submit document for verification'
        });
    }
});

// Get verification documents
router.get('/documents/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, documentType } = req.query;
        
        const filters = { userId: new ObjectId(userId) };
        if (status) filters.status = status;
        if (documentType) filters.documentType = documentType;

        const collection = await getCollection('verification_documents');
        const documents = await collection.find(filters)
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        console.error('Get verification documents error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_VERIFICATION_DOCUMENTS_FAILED',
            message: 'Failed to retrieve verification documents'
        });
    }
});

// Update document verification status
router.patch('/documents/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, reviewerId } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_STATUS',
                message: 'Status is required'
            });
        }

        const updateData = {
            status,
            updatedAt: new Date()
        };

        if (status === 'approved') {
            updateData.approvedAt = new Date();
            updateData.reviewerId = reviewerId || req.user.userId;
        } else if (status === 'rejected') {
            updateData.rejectedAt = new Date();
            updateData.reviewerId = reviewerId || req.user.userId;
        }

        if (notes) {
            updateData.notes = notes;
        }

        const collection = await getCollection('verification_documents');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'DOCUMENT_NOT_FOUND',
                message: 'Document not found'
            });
        }

        res.json({
            success: true,
            message: `Document verification status updated to ${status}`
        });
    } catch (error) {
        console.error('Update document status error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_DOCUMENT_STATUS_FAILED',
            message: 'Failed to update document verification status'
        });
    }
});

// Get verification statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('verifications');
        
        // Get total verifications
        const totalVerifications = await collection.countDocuments(filters);
        
        // Get verifications by status
        const verificationsByStatus = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get verifications by type
        const verificationsByType = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalVerifications,
                verificationsByStatus,
                verificationsByType
            }
        });
    } catch (error) {
        console.error('Get verification stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_VERIFICATION_STATS_FAILED',
            message: 'Failed to retrieve verification statistics'
        });
    }
});

// Get pending verifications
router.get('/pending/list', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const collection = await getCollection('verifications');
        const pendingVerifications = await collection.find({ status: 'pending' })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: 1 })
            .toArray();
        
        const total = await collection.countDocuments({ status: 'pending' });

        res.json({
            success: true,
            data: pendingVerifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get pending verifications error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PENDING_VERIFICATIONS_FAILED',
            message: 'Failed to retrieve pending verifications'
        });
    }
});

module.exports = router;
