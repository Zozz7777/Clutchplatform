const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all reports
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, type, status, userId, startDate, endDate } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (type) filters.type = type;
        if (status) filters.status = status;
        if (userId) filters.userId = new ObjectId(userId);
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('reports');
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
        console.error('Get reports error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_REPORTS_FAILED',
            message: 'Failed to retrieve reports'
        });
    }
});

// Get report by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('reports');
        const report = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'REPORT_NOT_FOUND',
                message: 'Report not found'
            });
        }

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_REPORT_FAILED',
            message: 'Failed to retrieve report'
        });
    }
});

// Create report
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            type,
            title,
            description,
            data,
            format,
            filters,
            schedule
        } = req.body;
        
        if (!type || !title) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Type and title are required'
            });
        }

        // Generate report reference
        const reportReference = `RPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const reportData = {
            reportReference,
            userId: req.user.userId,
            type,
            title,
            description: description || '',
            data: data || {},
            format: format || 'json',
            filters: filters || {},
            schedule: schedule || null,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('reports');
        const result = await collection.insertOne(reportData);
        
        reportData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Report created successfully',
            data: reportData
        });
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_REPORT_FAILED',
            message: 'Failed to create report'
        });
    }
});

// Update report
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('reports');
        const report = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'REPORT_NOT_FOUND',
                message: 'Report not found'
            });
        }

        // Check if user owns this report or is admin
        if (report.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'You can only update your own reports'
            });
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'REPORT_NOT_FOUND',
                message: 'Report not found'
            });
        }

        res.json({
            success: true,
            message: 'Report updated successfully'
        });
    } catch (error) {
        console.error('Update report error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_REPORT_FAILED',
            message: 'Failed to update report'
        });
    }
});

// Generate report
router.post('/:id/generate', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { format = 'json' } = req.body;
        
        const collection = await getCollection('reports');
        const report = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'REPORT_NOT_FOUND',
                message: 'Report not found'
            });
        }

        // TODO: Implement actual report generation logic
        // For now, simulate report generation
        const reportData = await generateReportData(report.type, report.filters);
        
        const updateData = {
            status: 'completed',
            data: reportData,
            format,
            generatedAt: new Date(),
            updatedAt: new Date()
        };

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        res.json({
            success: true,
            message: 'Report generated successfully',
            data: reportData
        });
    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({
            success: false,
            error: 'GENERATE_REPORT_FAILED',
            message: 'Failed to generate report'
        });
    }
});

// Get user reports
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, type, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { userId: new ObjectId(userId) };
        if (type) filters.type = type;
        if (status) filters.status = status;

        const collection = await getCollection('reports');
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
        console.error('Get user reports error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_USER_REPORTS_FAILED',
            message: 'Failed to retrieve user reports'
        });
    }
});

// Get reports by type
router.get('/type/:type', authenticateToken, async (req, res) => {
    try {
        const { type } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { type };
        if (status) filters.status = status;

        const collection = await getCollection('reports');
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
        console.error('Get reports by type error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_REPORTS_BY_TYPE_FAILED',
            message: 'Failed to retrieve reports by type'
        });
    }
});

// Get completed reports
router.get('/completed/list', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, type } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { status: 'completed' };
        if (type) filters.type = type;

        const collection = await getCollection('reports');
        const completedReports = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ generatedAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: completedReports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get completed reports error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_COMPLETED_REPORTS_FAILED',
            message: 'Failed to retrieve completed reports'
        });
    }
});

// Export report
router.get('/:id/export', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { format = 'json' } = req.query;
        
        const collection = await getCollection('reports');
        const report = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'REPORT_NOT_FOUND',
                message: 'Report not found'
            });
        }

        if (report.status !== 'completed') {
            return res.status(400).json({
                success: false,
                error: 'REPORT_NOT_READY',
                message: 'Report is not ready for export'
            });
        }

        // TODO: Implement actual export logic
        const exportData = {
            reportReference: report.reportReference,
            title: report.title,
            type: report.type,
            data: report.data,
            generatedAt: report.generatedAt,
            format
        };

        res.json({
            success: true,
            message: 'Report exported successfully',
            data: exportData
        });
    } catch (error) {
        console.error('Export report error:', error);
        res.status(500).json({
            success: false,
            error: 'EXPORT_REPORT_FAILED',
            message: 'Failed to export report'
        });
    }
});

// Get report statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }
        if (type) filters.type = type;

        const collection = await getCollection('reports');
        
        // Get total reports
        const totalReports = await collection.countDocuments(filters);
        
        // Get reports by status
        const reportsByStatus = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get reports by type
        const reportsByType = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get reports by format
        const reportsByFormat = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$format', count: { $sum: 1 } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalReports,
                reportsByStatus,
                reportsByType,
                reportsByFormat
            }
        });
    } catch (error) {
        console.error('Get report stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_REPORT_STATS_FAILED',
            message: 'Failed to retrieve report statistics'
        });
    }
});

// Helper function to generate report data
async function generateReportData(type, filters) {
    try {
        switch (type) {
            case 'bookings':
                return await generateBookingsReport(filters);
            case 'payments':
                return await generatePaymentsReport(filters);
            case 'users':
                return await generateUsersReport(filters);
            case 'mechanics':
                return await generateMechanicsReport(filters);
            case 'revenue':
                return await generateRevenueReport(filters);
            default:
                return { message: 'Report type not implemented' };
        }
    } catch (error) {
        console.error('Generate report data error:', error);
        return { error: 'Failed to generate report data' };
    }
}

// Helper functions for specific report types
async function generateBookingsReport(filters) {
    const collection = await getCollection('bookings');
    const matchStage = {};
    
    if (filters.startDate || filters.endDate) {
        matchStage.createdAt = {};
        if (filters.startDate) matchStage.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) matchStage.createdAt.$lte = new Date(filters.endDate);
    }
    if (filters.status) matchStage.status = filters.status;

    const pipeline = [
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
                avgBookingValue: { $avg: '$totalAmount' }
            }
        }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    return result[0] || { totalBookings: 0, totalRevenue: 0, avgBookingValue: 0 };
}

async function generatePaymentsReport(filters) {
    const collection = await getCollection('payments');
    const matchStage = {};
    
    if (filters.startDate || filters.endDate) {
        matchStage.createdAt = {};
        if (filters.startDate) matchStage.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) matchStage.createdAt.$lte = new Date(filters.endDate);
    }
    if (filters.status) matchStage.status = filters.status;

    const pipeline = [
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalPayments: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                avgPaymentValue: { $avg: '$amount' }
            }
        }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    return result[0] || { totalPayments: 0, totalAmount: 0, avgPaymentValue: 0 };
}

async function generateUsersReport(filters) {
    const collection = await getCollection('users');
    const matchStage = {};
    
    if (filters.startDate || filters.endDate) {
        matchStage.createdAt = {};
        if (filters.startDate) matchStage.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) matchStage.createdAt.$lte = new Date(filters.endDate);
    }
    if (filters.role) matchStage.role = filters.role;

    const pipeline = [
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
            }
        }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    return result[0] || { totalUsers: 0, activeUsers: 0 };
}

async function generateMechanicsReport(filters) {
    const collection = await getCollection('mechanics');
    const matchStage = {};
    
    if (filters.startDate || filters.endDate) {
        matchStage.createdAt = {};
        if (filters.startDate) matchStage.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) matchStage.createdAt.$lte = new Date(filters.endDate);
    }
    if (filters.status) matchStage.status = filters.status;

    const pipeline = [
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalMechanics: { $sum: 1 },
                activeMechanics: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                avgRating: { $avg: '$averageRating' }
            }
        }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    return result[0] || { totalMechanics: 0, activeMechanics: 0, avgRating: 0 };
}

async function generateRevenueReport(filters) {
    const collection = await getCollection('payments');
    const matchStage = { status: 'completed' };
    
    if (filters.startDate || filters.endDate) {
        matchStage.createdAt = {};
        if (filters.startDate) matchStage.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) matchStage.createdAt.$lte = new Date(filters.endDate);
    }

    const pipeline = [
        { $match: matchStage },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                revenue: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    return { monthlyRevenue: result };
}

module.exports = router;
