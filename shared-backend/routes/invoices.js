const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all invoices
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, customerId, startDate, endDate } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (status) filters.status = status;
        if (customerId) filters.customerId = new ObjectId(customerId);
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('invoices');
        const invoices = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: invoices,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_INVOICES_FAILED',
            message: 'Failed to retrieve invoices'
        });
    }
});

// Get invoice by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('invoices');
        const invoice = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!invoice) {
            return res.status(404).json({
                success: false,
                error: 'INVOICE_NOT_FOUND',
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error('Get invoice error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_INVOICE_FAILED',
            message: 'Failed to retrieve invoice'
        });
    }
});

// Create invoice
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            customerId, 
            items, 
            subtotal,
            taxAmount,
            discountAmount,
            totalAmount,
            dueDate,
            notes,
            paymentTerms 
        } = req.body;
        
        if (!customerId || !items || !totalAmount) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Customer ID, items, and total amount are required'
            });
        }

        // Generate invoice number
        const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const invoiceData = {
            invoiceNumber,
            customerId: new ObjectId(customerId),
            items: items || [],
            subtotal: subtotal || 0,
            taxAmount: taxAmount || 0,
            discountAmount: discountAmount || 0,
            totalAmount: parseFloat(totalAmount),
            dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            notes: notes || '',
            paymentTerms: paymentTerms || 'Net 30',
            status: 'pending',
            createdBy: req.user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('invoices');
        const result = await collection.insertOne(invoiceData);
        
        invoiceData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            data: invoiceData
        });
    } catch (error) {
        console.error('Create invoice error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_INVOICE_FAILED',
            message: 'Failed to create invoice'
        });
    }
});

// Update invoice
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('invoices');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'INVOICE_NOT_FOUND',
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: 'Invoice updated successfully'
        });
    } catch (error) {
        console.error('Update invoice error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_INVOICE_FAILED',
            message: 'Failed to update invoice'
        });
    }
});

// Update invoice status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        
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

        if (status === 'paid') {
            updateData.paidAt = new Date();
        } else if (status === 'overdue') {
            updateData.overdueAt = new Date();
        }

        if (notes) {
            updateData.notes = notes;
        }

        const collection = await getCollection('invoices');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'INVOICE_NOT_FOUND',
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: `Invoice status updated to ${status}`
        });
    } catch (error) {
        console.error('Update invoice status error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_INVOICE_STATUS_FAILED',
            message: 'Failed to update invoice status'
        });
    }
});

// Get customer invoices
router.get('/customer/:customerId', authenticateToken, async (req, res) => {
    try {
        const { customerId } = req.params;
        const { status, startDate, endDate } = req.query;
        
        const filters = { customerId: new ObjectId(customerId) };
        if (status) filters.status = status;
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('invoices');
        const invoices = await collection.find(filters)
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            data: invoices
        });
    } catch (error) {
        console.error('Get customer invoices error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CUSTOMER_INVOICES_FAILED',
            message: 'Failed to retrieve customer invoices'
        });
    }
});

// Get overdue invoices
router.get('/overdue/list', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const collection = await getCollection('invoices');
        const overdueInvoices = await collection.find({ 
            status: 'pending',
            dueDate: { $lt: new Date() }
        })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ dueDate: 1 })
        .toArray();
        
        const total = await collection.countDocuments({ 
            status: 'pending',
            dueDate: { $lt: new Date() }
        });

        res.json({
            success: true,
            data: overdueInvoices,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get overdue invoices error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_OVERDUE_INVOICES_FAILED',
            message: 'Failed to retrieve overdue invoices'
        });
    }
});

// Send invoice reminder
router.post('/:id/reminder', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { reminderType, message } = req.body;
        
        const collection = await getCollection('invoices');
        const invoice = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!invoice) {
            return res.status(404).json({
                success: false,
                error: 'INVOICE_NOT_FOUND',
                message: 'Invoice not found'
            });
        }

        // Add reminder to invoice
        await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $push: { 
                    reminders: {
                        type: reminderType || 'payment_reminder',
                        message: message || 'Payment reminder',
                        sentAt: new Date(),
                        sentBy: req.user.userId
                    }
                },
                $set: { updatedAt: new Date() }
            }
        );

        res.json({
            success: true,
            message: 'Invoice reminder sent successfully'
        });
    } catch (error) {
        console.error('Send invoice reminder error:', error);
        res.status(500).json({
            success: false,
            error: 'SEND_INVOICE_REMINDER_FAILED',
            message: 'Failed to send invoice reminder'
        });
    }
});

// Get invoice statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const collection = await getCollection('invoices');
        
        // Get total invoices
        const totalInvoices = await collection.countDocuments(filters);
        
        // Get invoices by status
        const invoicesByStatus = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        // Get total amount by status
        const totalAmountByStatus = await collection.aggregate([
            { $match: filters },
            { $group: { _id: '$status', total: { $sum: '$totalAmount' } } }
        ]).toArray();
        
        // Get overdue invoices
        const overdueInvoices = await collection.countDocuments({ 
            ...filters,
            status: 'pending',
            dueDate: { $lt: new Date() }
        });
        
        // Get overdue amount
        const overdueAmount = await collection.aggregate([
            { 
                $match: { 
                    ...filters,
                    status: 'pending',
                    dueDate: { $lt: new Date() }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                totalInvoices,
                invoicesByStatus,
                totalAmountByStatus,
                overdueInvoices,
                overdueAmount: overdueAmount[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Get invoice stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_INVOICE_STATS_FAILED',
            message: 'Failed to retrieve invoice statistics'
        });
    }
});

// Export invoices
router.get('/export/:format', authenticateToken, async (req, res) => {
    try {
        const { format } = req.params;
        const { startDate, endDate, status } = req.query;
        
        const filters = {};
        if (startDate || endDate) {
            filters.createdAt = {};
            if (startDate) filters.createdAt.$gte = new Date(startDate);
            if (endDate) filters.createdAt.$lte = new Date(endDate);
        }
        if (status) filters.status = status;

        const collection = await getCollection('invoices');
        const invoices = await collection.find(filters)
            .sort({ createdAt: -1 })
            .toArray();

        // TODO: Implement actual export logic based on format (CSV, PDF, etc.)
        const exportData = invoices.map(invoice => ({
            invoiceNumber: invoice.invoiceNumber,
            customerId: invoice.customerId,
            totalAmount: invoice.totalAmount,
            status: invoice.status,
            dueDate: invoice.dueDate,
            createdAt: invoice.createdAt
        }));

        res.json({
            success: true,
            data: exportData,
            format,
            count: exportData.length
        });
    } catch (error) {
        console.error('Export invoices error:', error);
        res.status(500).json({
            success: false,
            error: 'EXPORT_INVOICES_FAILED',
            message: 'Failed to export invoices'
        });
    }
});

module.exports = router;
