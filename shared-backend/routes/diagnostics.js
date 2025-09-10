const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all diagnostic reports
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, severity, vehicleId, userId, startDate, endDate } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (status) filters.status = status;
        if (severity) filters.severity = severity;
        if (vehicleId) filters.vehicleId = new ObjectId(vehicleId);
        if (userId) filters.userId = new ObjectId(userId);
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('diagnostics');
        const reports = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: reports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get diagnostics error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DIAGNOSTICS_FAILED',
            message: 'Failed to retrieve diagnostic reports'
        });
    }
});

// Get diagnostic report by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('diagnostics');
        const report = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'DIAGNOSTIC_REPORT_NOT_FOUND',
                message: 'Diagnostic report not found'
            });
        }

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Get diagnostic report by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DIAGNOSTIC_REPORT_BY_ID_FAILED',
            message: 'Failed to retrieve diagnostic report'
        });
    }
});

// Create diagnostic report
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            vehicleId,
            diagnosticType,
            symptoms,
            errorCodes,
            severity,
            recommendations,
            estimatedCost,
            notes,
            attachments
        } = req.body;
        
        if (!vehicleId || !diagnosticType || !symptoms) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Vehicle ID, diagnostic type, and symptoms are required'
            });
        }

        // Verify vehicle exists
        const vehicleCollection = await getCollection('vehicles');
        const vehicle = await vehicleCollection.findOne({ _id: new ObjectId(vehicleId) });
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'VEHICLE_NOT_FOUND',
                message: 'Vehicle not found'
            });
        }

        const reportData = {
            vehicleId: new ObjectId(vehicleId),
            userId: new ObjectId(req.user.userId),
            diagnosticType,
            symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
            errorCodes: errorCodes || [],
            severity: severity || 'medium',
            recommendations: recommendations || [],
            estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
            notes: notes || '',
            attachments: attachments || [],
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('diagnostics');
        const result = await collection.insertOne(reportData);
        
        reportData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Diagnostic report created successfully',
            data: reportData
        });
    } catch (error) {
        console.error('Create diagnostic report error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_DIAGNOSTIC_REPORT_FAILED',
            message: 'Failed to create diagnostic report'
        });
    }
});

// Update diagnostic report
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        // Convert vehicleId to ObjectId if provided
        if (updateData.vehicleId) {
            updateData.vehicleId = new ObjectId(updateData.vehicleId);
        }

        // Convert estimatedCost to float if provided
        if (updateData.estimatedCost) {
            updateData.estimatedCost = parseFloat(updateData.estimatedCost);
        }

        const collection = await getCollection('diagnostics');
        const report = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'DIAGNOSTIC_REPORT_NOT_FOUND',
                message: 'Diagnostic report not found'
            });
        }

        // Check if user owns this report or is admin
        if (report.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only update your own diagnostic reports'
            });
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'DIAGNOSTIC_REPORT_NOT_FOUND',
                message: 'Diagnostic report not found'
            });
        }

        res.json({
            success: true,
            message: 'Diagnostic report updated successfully'
        });
    } catch (error) {
        console.error('Update diagnostic report error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_DIAGNOSTIC_REPORT_FAILED',
            message: 'Failed to update diagnostic report'
        });
    }
});

// Update diagnostic report status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolvedDate, actualCost, resolutionNotes } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_STATUS',
                message: 'Status is required'
            });
        }

        const collection = await getCollection('diagnostics');
        const report = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'DIAGNOSTIC_REPORT_NOT_FOUND',
                message: 'Diagnostic report not found'
            });
        }

        const updateData = {
            status,
            updatedAt: new Date()
        };

        if (status === 'resolved' && resolvedDate) {
            updateData.resolvedDate = new Date(resolvedDate);
        }

        if (actualCost !== undefined) {
            updateData.actualCost = parseFloat(actualCost);
        }

        if (resolutionNotes) {
            updateData.resolutionNotes = resolutionNotes;
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        res.json({
            success: true,
            message: `Diagnostic report status updated to ${status}`
        });
    } catch (error) {
        console.error('Update diagnostic report status error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_DIAGNOSTIC_REPORT_STATUS_FAILED',
            message: 'Failed to update diagnostic report status'
        });
    }
});

// Delete diagnostic report
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('diagnostics');
        
        const report = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'DIAGNOSTIC_REPORT_NOT_FOUND',
                message: 'Diagnostic report not found'
            });
        }

        // Check if user owns this report or is admin
        if (report.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only delete your own diagnostic reports'
            });
        }

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'DIAGNOSTIC_REPORT_NOT_FOUND',
                message: 'Diagnostic report not found'
            });
        }

        res.json({
            success: true,
            message: 'Diagnostic report deleted successfully'
        });
    } catch (error) {
        console.error('Delete diagnostic report error:', error);
        res.status(500).json({
            success: false,
            error: 'DELETE_DIAGNOSTIC_REPORT_FAILED',
            message: 'Failed to delete diagnostic report'
        });
    }
});

// Get diagnostic reports by vehicle
router.get('/vehicle/:vehicleId', authenticateToken, async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { page = 1, limit = 10, status, severity } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { vehicleId: new ObjectId(vehicleId) };
        if (status) filters.status = status;
        if (severity) filters.severity = severity;

        const collection = await getCollection('diagnostics');
        const reports = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: reports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get diagnostic reports by vehicle error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DIAGNOSTIC_REPORTS_BY_VEHICLE_FAILED',
            message: 'Failed to retrieve diagnostic reports for vehicle'
        });
    }
});

// Get diagnostic reports by user
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status, severity } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { userId: new ObjectId(userId) };
        if (status) filters.status = status;
        if (severity) filters.severity = severity;

        const collection = await getCollection('diagnostics');
        const reports = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: reports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get diagnostic reports by user error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DIAGNOSTIC_REPORTS_BY_USER_FAILED',
            message: 'Failed to retrieve diagnostic reports for user'
        });
    }
});

// Get diagnostic reports by status
router.get('/status/:status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.params;
        const { page = 1, limit = 10, severity } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { status };
        if (severity) filters.severity = severity;

        const collection = await getCollection('diagnostics');
        const reports = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: reports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get diagnostic reports by status error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DIAGNOSTIC_REPORTS_BY_STATUS_FAILED',
            message: 'Failed to retrieve diagnostic reports by status'
        });
    }
});

// Get diagnostic reports by severity
router.get('/severity/:severity', authenticateToken, async (req, res) => {
    try {
        const { severity } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { severity };
        if (status) filters.status = status;

        const collection = await getCollection('diagnostics');
        const reports = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: reports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get diagnostic reports by severity error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DIAGNOSTIC_REPORTS_BY_SEVERITY_FAILED',
            message: 'Failed to retrieve diagnostic reports by severity'
        });
    }
});

// Get pending diagnostic reports
router.get('/pending/list', authenticateToken, async (req, res) => {
    try {
        const collection = await getCollection('diagnostics');
        const reports = await collection.find({
            status: { $in: ['pending', 'in_progress'] }
        })
        .sort({ severity: -1, createdAt: 1 })
        .toArray();

        res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        console.error('Get pending diagnostic reports error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PENDING_DIAGNOSTIC_REPORTS_FAILED',
            message: 'Failed to retrieve pending diagnostic reports'
        });
    }
});

// Get diagnostic reports statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('diagnostics');
        
        // Get total reports
        const totalReports = await collection.countDocuments(filters);
        
        // Get reports by status
        const reportsByStatus = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get reports by severity
        const reportsBySeverity = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$severity', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get reports by diagnostic type
        const reportsByType = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$diagnosticType', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get resolved reports
        const resolvedReports = await collection.countDocuments({ 
            ...filters,
            status: 'resolved'
        });

        // Get total estimated cost
        const totalEstimatedCost = await collection.aggregate([
            { $match: filters },
            { $group: { _id: null, total: { $sum: '$estimatedCost' } } }
        ]).toArray();

        // Get total actual cost
        const totalActualCost = await collection.aggregate([
            { $match: { ...filters, status: 'resolved' } },
            { $group: { _id: null, total: { $sum: '$actualCost' } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalReports,
                resolvedReports,
                reportsByStatus,
                reportsBySeverity,
                reportsByType,
                totalEstimatedCost: totalEstimatedCost[0]?.total || 0,
                totalActualCost: totalActualCost[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Get diagnostic reports stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DIAGNOSTIC_REPORTS_STATS_FAILED',
            message: 'Failed to retrieve diagnostic reports statistics'
        });
    }
});

module.exports = router;
