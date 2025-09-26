const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../config/logger');
const ExcelJS = require('exceljs');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Export Types
const EXPORT_TYPES = {
  ORDERS: 'orders',
  INVOICES: 'invoices',
  PAYMENTS: 'payments',
  INVENTORY: 'inventory',
  CUSTOMERS: 'customers',
  STAFF_ACTIONS: 'staff_actions',
  WARRANTY_CLAIMS: 'warranty_claims',
  DISPUTES: 'disputes',
  SUPPORT_TICKETS: 'support_tickets',
  KYC_DOCUMENTS: 'kyc_documents'
};

// Export Formats
const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf'
};

// Date Range Types
const DATE_RANGE_TYPES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_QUARTER: 'this_quarter',
  LAST_QUARTER: 'last_quarter',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom'
};

// Export data
router.post('/export/:dataset', [
  auth,
  body('format').isIn(Object.values(EXPORT_FORMATS)).withMessage('Invalid export format'),
  body('dateRange').optional().isIn(Object.values(DATE_RANGE_TYPES)).withMessage('Invalid date range'),
  body('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  body('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  body('filters').optional().isObject().withMessage('Filters must be an object'),
  body('columns').optional().isArray().withMessage('Columns must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { dataset } = req.params;
    const { format, dateRange, startDate, endDate, filters, columns } = req.body;
    const userId = req.user._id;

    // Validate dataset
    if (!Object.values(EXPORT_TYPES).includes(dataset)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dataset type'
      });
    }

    // Check user permissions for export
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has export permissions
    const userRole = user.role || 'staff';
    const hasExportPermission = ['owner', 'manager', 'accountant'].includes(userRole);
    
    if (!hasExportPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to export data'
      });
    }

    // Calculate date range
    const dateRangeData = calculateDateRange(dateRange, startDate, endDate);

    // Generate export data based on dataset type
    let exportData;
    let filename;

    switch (dataset) {
      case EXPORT_TYPES.ORDERS:
        exportData = await generateOrdersExport(userId, dateRangeData, filters);
        filename = `orders_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case EXPORT_TYPES.INVOICES:
        exportData = await generateInvoicesExport(userId, dateRangeData, filters);
        filename = `invoices_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case EXPORT_TYPES.PAYMENTS:
        exportData = await generatePaymentsExport(userId, dateRangeData, filters);
        filename = `payments_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case EXPORT_TYPES.INVENTORY:
        exportData = await generateInventoryExport(userId, filters);
        filename = `inventory_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case EXPORT_TYPES.CUSTOMERS:
        exportData = await generateCustomersExport(userId, filters);
        filename = `customers_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case EXPORT_TYPES.STAFF_ACTIONS:
        exportData = await generateStaffActionsExport(userId, dateRangeData, filters);
        filename = `staff_actions_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case EXPORT_TYPES.WARRANTY_CLAIMS:
        exportData = await generateWarrantyClaimsExport(userId, dateRangeData, filters);
        filename = `warranty_claims_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case EXPORT_TYPES.DISPUTES:
        exportData = await generateDisputesExport(userId, dateRangeData, filters);
        filename = `disputes_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case EXPORT_TYPES.SUPPORT_TICKETS:
        exportData = await generateSupportTicketsExport(userId, dateRangeData, filters);
        filename = `support_tickets_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case EXPORT_TYPES.KYC_DOCUMENTS:
        exportData = await generateKycDocumentsExport(userId, filters);
        filename = `kyc_documents_export_${new Date().toISOString().split('T')[0]}`;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported dataset type'
        });
    }

    // Generate file based on format
    let filePath;
    let mimeType;

    if (format === EXPORT_FORMATS.EXCEL) {
      filePath = await generateExcelFile(exportData, filename);
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (format === EXPORT_FORMATS.CSV) {
      filePath = await generateCSVFile(exportData, filename);
      mimeType = 'text/csv';
    } else if (format === EXPORT_FORMATS.PDF) {
      filePath = await generatePDFFile(exportData, filename);
      mimeType = 'application/pdf';
    }

    // Log export action
    logger.info(`Data export generated: ${dataset}`, {
      userId: userId,
      format: format,
      dateRange: dateRange,
      recordCount: exportData.data.length,
      filename: filename
    });

    // Return file download
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.${format === EXPORT_FORMATS.EXCEL ? 'xlsx' : format}"`);
    
    const fileStream = require('fs').createReadStream(filePath);
    fileStream.pipe(res);

    // Clean up file after sending
    fileStream.on('end', () => {
      fs.unlink(filePath).catch(err => logger.error('Failed to delete export file:', err));
    });

  } catch (error) {
    logger.error('Data export failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data'
    });
  }
});

// Get available export options
router.get('/export-options', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await PartnerUser.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || 'staff';
    const hasExportPermission = ['owner', 'manager', 'accountant'].includes(userRole);

    if (!hasExportPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    res.json({
      success: true,
      data: {
        exportTypes: Object.values(EXPORT_TYPES),
        exportFormats: Object.values(EXPORT_FORMATS),
        dateRangeTypes: Object.values(DATE_RANGE_TYPES),
        permissions: {
          canExportOrders: true,
          canExportInvoices: true,
          canExportPayments: ['owner', 'manager', 'accountant'].includes(userRole),
          canExportInventory: true,
          canExportCustomers: true,
          canExportStaffActions: ['owner', 'manager'].includes(userRole),
          canExportWarrantyClaims: true,
          canExportDisputes: true,
          canExportSupportTickets: true,
          canExportKycDocuments: ['owner', 'admin'].includes(userRole)
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get export options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get export options'
    });
  }
});

// Schedule export
router.post('/export/schedule', [
  auth,
  body('dataset').isIn(Object.values(EXPORT_TYPES)).withMessage('Invalid dataset'),
  body('format').isIn(Object.values(EXPORT_FORMATS)).withMessage('Invalid format'),
  body('schedule').isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid schedule'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('filters').optional().isObject().withMessage('Filters must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { dataset, format, schedule, email, filters } = req.body;
    const userId = req.user._id;

    // Check user permissions
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || 'staff';
    if (!['owner', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to schedule exports'
      });
    }

    // Create scheduled export
    const scheduledExport = {
      id: `sched_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      userId: userId,
      dataset: dataset,
      format: format,
      schedule: schedule,
      email: email || user.email,
      filters: filters || {},
      isActive: true,
      createdAt: new Date(),
      lastRun: null,
      nextRun: calculateNextRun(schedule)
    };

    // Save scheduled export (in real implementation, this would be in a separate collection)
    if (!user.scheduledExports) {
      user.scheduledExports = [];
    }
    user.scheduledExports.push(scheduledExport);
    await user.save();

    logger.info(`Scheduled export created: ${scheduledExport.id}`, {
      userId: userId,
      dataset: dataset,
      format: format,
      schedule: schedule
    });

    res.json({
      success: true,
      message: 'Export scheduled successfully',
      data: {
        scheduledExportId: scheduledExport.id,
        nextRun: scheduledExport.nextRun,
        schedule: schedule
      }
    });

  } catch (error) {
    logger.error('Failed to schedule export:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule export'
    });
  }
});

// Helper functions
function calculateDateRange(dateRange, startDate, endDate) {
  const now = new Date();
  let start, end;

  switch (dateRange) {
    case DATE_RANGE_TYPES.TODAY:
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case DATE_RANGE_TYPES.YESTERDAY:
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
      break;
    case DATE_RANGE_TYPES.THIS_WEEK:
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      start = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
      end = new Date(now);
      break;
    case DATE_RANGE_TYPES.LAST_WEEK:
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
      const lastWeekEnd = new Date(now);
      lastWeekEnd.setDate(now.getDate() - now.getDay() - 1);
      start = new Date(lastWeekStart.getFullYear(), lastWeekStart.getMonth(), lastWeekStart.getDate());
      end = new Date(lastWeekEnd.getFullYear(), lastWeekEnd.getMonth(), lastWeekEnd.getDate(), 23, 59, 59);
      break;
    case DATE_RANGE_TYPES.THIS_MONTH:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now);
      break;
    case DATE_RANGE_TYPES.LAST_MONTH:
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      break;
    case DATE_RANGE_TYPES.CUSTOM:
      start = new Date(startDate);
      end = new Date(endDate);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now);
  }

  return { start, end };
}

function calculateNextRun(schedule) {
  const now = new Date();
  
  switch (schedule) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

// Mock data generation functions
async function generateOrdersExport(userId, dateRange, filters) {
  // Mock implementation - in real app, this would query the orders collection
  return {
    headers: ['Order ID', 'Customer Name', 'Service', 'Status', 'Amount', 'Date', 'Payment Method'],
    data: [
      ['ORD001', 'Ahmed Ali', 'Oil Change', 'Completed', '150 EGP', '2024-01-15', 'Cash'],
      ['ORD002', 'Sara Mohamed', 'Brake Repair', 'In Progress', '450 EGP', '2024-01-14', 'Card']
    ]
  };
}

async function generateInvoicesExport(userId, dateRange, filters) {
  return {
    headers: ['Invoice ID', 'Order ID', 'Amount', 'Status', 'Due Date', 'Paid Date'],
    data: [
      ['INV001', 'ORD001', '150 EGP', 'Paid', '2024-01-15', '2024-01-15'],
      ['INV002', 'ORD002', '450 EGP', 'Pending', '2024-01-20', null]
    ]
  };
}

async function generatePaymentsExport(userId, dateRange, filters) {
  return {
    headers: ['Payment ID', 'Order ID', 'Amount', 'Method', 'Status', 'Date'],
    data: [
      ['PAY001', 'ORD001', '150 EGP', 'Cash', 'Completed', '2024-01-15'],
      ['PAY002', 'ORD002', '450 EGP', 'Card', 'Completed', '2024-01-14']
    ]
  };
}

async function generateInventoryExport(userId, filters) {
  return {
    headers: ['SKU', 'Product Name', 'Category', 'Quantity', 'Price', 'Status'],
    data: [
      ['SKU001', 'Engine Oil', 'Lubricants', '50', '25 EGP', 'In Stock'],
      ['SKU002', 'Brake Pads', 'Brakes', '20', '120 EGP', 'Low Stock']
    ]
  };
}

async function generateCustomersExport(userId, filters) {
  return {
    headers: ['Customer ID', 'Name', 'Phone', 'Email', 'Total Orders', 'Last Order'],
    data: [
      ['CUST001', 'Ahmed Ali', '+20123456789', 'ahmed@email.com', '5', '2024-01-15'],
      ['CUST002', 'Sara Mohamed', '+20123456790', 'sara@email.com', '3', '2024-01-14']
    ]
  };
}

async function generateStaffActionsExport(userId, dateRange, filters) {
  return {
    headers: ['Action ID', 'User', 'Action', 'Target', 'Date', 'IP Address'],
    data: [
      ['ACT001', 'Manager', 'Updated Order Status', 'ORD001', '2024-01-15', '192.168.1.1'],
      ['ACT002', 'Staff', 'Created Order', 'ORD002', '2024-01-14', '192.168.1.2']
    ]
  };
}

async function generateWarrantyClaimsExport(userId, dateRange, filters) {
  return {
    headers: ['Claim ID', 'Order ID', 'Type', 'Status', 'Submitted Date', 'Resolution'],
    data: [
      ['WAR001', 'ORD001', 'Product Defect', 'Approved', '2024-01-15', 'Replacement'],
      ['WAR002', 'ORD002', 'Quality Issue', 'Under Review', '2024-01-14', null]
    ]
  };
}

async function generateDisputesExport(userId, dateRange, filters) {
  return {
    headers: ['Dispute ID', 'Type', 'Status', 'Submitted Date', 'Resolution', 'Resolved Date'],
    data: [
      ['DIS001', 'Invoice Dispute', 'Resolved', '2024-01-15', 'Accepted', '2024-01-16'],
      ['DIS002', 'Payment Dispute', 'Open', '2024-01-14', null, null]
    ]
  };
}

async function generateSupportTicketsExport(userId, dateRange, filters) {
  return {
    headers: ['Ticket ID', 'Subject', 'Type', 'Status', 'Created Date', 'Resolved Date'],
    data: [
      ['TKT001', 'Login Issue', 'Technical', 'Resolved', '2024-01-15', '2024-01-16'],
      ['TKT002', 'Payment Question', 'Billing', 'Open', '2024-01-14', null]
    ]
  };
}

async function generateKycDocumentsExport(userId, filters) {
  return {
    headers: ['Document ID', 'Type', 'Status', 'Uploaded Date', 'Reviewed Date', 'Reviewer'],
    data: [
      ['DOC001', 'VAT Certificate', 'Approved', '2024-01-15', '2024-01-16', 'Admin'],
      ['DOC002', 'Trade License', 'Under Review', '2024-01-14', null, null]
    ]
  };
}

async function generateExcelFile(exportData, filename) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Export Data');

  // Add headers
  worksheet.addRow(exportData.headers);

  // Add data
  exportData.data.forEach(row => {
    worksheet.addRow(row);
  });

  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 15;
  });

  const filePath = path.join(__dirname, '../temp', `${filename}.xlsx`);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await workbook.xlsx.writeFile(filePath);

  return filePath;
}

async function generateCSVFile(exportData, filename) {
  const csvContent = [
    exportData.headers.join(','),
    ...exportData.data.map(row => row.join(','))
  ].join('\n');

  const filePath = path.join(__dirname, '../temp', `${filename}.csv`);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, csvContent, 'utf8');

  return filePath;
}

async function generatePDFFile(exportData, filename) {
  // Mock implementation - in real app, this would use a PDF library like PDFKit
  const filePath = path.join(__dirname, '../temp', `${filename}.pdf`);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, 'PDF content would be generated here', 'utf8');

  return filePath;
}

module.exports = router;
