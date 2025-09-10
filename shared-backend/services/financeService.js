const Invoice = require('../models/Invoice');
const { logger } = require('../config/logger');

class FinanceService {
  // Invoice Management
  async createInvoice(invoiceData) {
    try {
      const invoice = new Invoice(invoiceData);
      await invoice.save();
      
      logger.info(`Invoice created: ${invoice.invoiceNumber}`);
      return invoice;
    } catch (error) {
      logger.error('Error creating invoice:', error);
      throw error;
    }
  }

  async getInvoiceById(invoiceId) {
    try {
      const invoice = await Invoice.findById(invoiceId)
        .populate('client.id')
        .populate('metadata.createdBy')
        .populate('metadata.updatedBy');
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      return invoice;
    } catch (error) {
      logger.error('Error getting invoice:', error);
      throw error;
    }
  }

  async updateInvoice(invoiceId, updateData) {
    try {
      const invoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        { ...updateData, 'metadata.updatedBy': updateData.updatedBy },
        { new: true, runValidators: true }
      );
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      logger.info(`Invoice updated: ${invoice.invoiceNumber}`);
      return invoice;
    } catch (error) {
      logger.error('Error updating invoice:', error);
      throw error;
    }
  }

  async deleteInvoice(invoiceId) {
    try {
      const invoice = await Invoice.findByIdAndDelete(invoiceId);
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      logger.info(`Invoice deleted: ${invoice.invoiceNumber}`);
      return { message: 'Invoice deleted successfully' };
    } catch (error) {
      logger.error('Error deleting invoice:', error);
      throw error;
    }
  }

  async getInvoices(filters = {}, options = {}) {
    try {
      const query = {};
      
      if (filters.clientId) {
        query['client.id'] = filters.clientId;
      }
      
      if (filters.paymentStatus) {
        query.paymentStatus = filters.paymentStatus;
      }
      
      if (filters.invoiceType) {
        query.invoiceType = filters.invoiceType;
      }
      
      if (filters.startDate) {
        query.issueDate = { $gte: new Date(filters.startDate) };
      }
      
      if (filters.endDate) {
        query.issueDate = { ...query.issueDate, $lte: new Date(filters.endDate) };
      }
      
      if (filters.search) {
        query.$or = [
          { invoiceNumber: { $regex: filters.search, $options: 'i' } },
          { 'client.name': { $regex: filters.search, $options: 'i' } },
          { 'client.email': { $regex: filters.search, $options: 'i' } }
        ];
      }
      
      const invoices = await Invoice.find(query)
        .populate('client.id')
        .populate('metadata.createdBy')
        .sort(options.sort || { issueDate: -1 })
        .limit(options.limit || 50)
        .skip(options.skip || 0);
      
      return invoices;
    } catch (error) {
      logger.error('Error getting invoices:', error);
      throw error;
    }
  }

  async getOverdueInvoices() {
    try {
      const overdueInvoices = await Invoice.findOverdueInvoices()
        .populate('client.id')
        .populate('metadata.createdBy');
      
      return overdueInvoices;
    } catch (error) {
      logger.error('Error getting overdue invoices:', error);
      throw error;
    }
  }

  async getRecurringInvoices() {
    try {
      const recurringInvoices = await Invoice.findRecurringInvoices()
        .populate('client.id');
      
      return recurringInvoices;
    } catch (error) {
      logger.error('Error getting recurring invoices:', error);
      throw error;
    }
  }

  // Payment Processing
  async processPayment(invoiceId, paymentData) {
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      await invoice.addPayment(
        paymentData.amount,
        paymentData.method,
        paymentData.reference
      );
      
      logger.info(`Payment processed for invoice: ${invoice.invoiceNumber}`);
      return invoice;
    } catch (error) {
      logger.error('Error processing payment:', error);
      throw error;
    }
  }

  async sendPaymentReminder(invoiceId) {
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      await invoice.sendReminder();
      
      logger.info(`Payment reminder sent for invoice: ${invoice.invoiceNumber}`);
      return invoice;
    } catch (error) {
      logger.error('Error sending payment reminder:', error);
      throw error;
    }
  }

  // Invoice Workflow
  async approveInvoice(invoiceId, approvedBy) {
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      invoice.workflow.status = 'approved';
      invoice.workflow.approvedBy = approvedBy;
      invoice.workflow.approvedDate = new Date();
      
      await invoice.save();
      
      logger.info(`Invoice approved: ${invoice.invoiceNumber}`);
      return invoice;
    } catch (error) {
      logger.error('Error approving invoice:', error);
      throw error;
    }
  }

  async sendInvoice(invoiceId, sentBy) {
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      invoice.workflow.status = 'sent';
      invoice.workflow.sentBy = sentBy;
      invoice.workflow.sentDate = new Date();
      invoice.paymentStatus = 'sent';
      
      await invoice.save();
      
      logger.info(`Invoice sent: ${invoice.invoiceNumber}`);
      return invoice;
    } catch (error) {
      logger.error('Error sending invoice:', error);
      throw error;
    }
  }

  // Financial Reporting
  async getFinancialDashboardData(filters = {}) {
    try {
      const [
        invoiceStats,
        paymentStats,
        clientStats,
        revenueStats
      ] = await Promise.all([
        this.getInvoiceStatistics(filters),
        this.getPaymentStatistics(filters),
        this.getClientStatistics(filters),
        this.getRevenueStatistics(filters)
      ]);
      
      return {
        invoiceStats,
        paymentStats,
        clientStats,
        revenueStats
      };
    } catch (error) {
      logger.error('Error getting financial dashboard data:', error);
      throw error;
    }
  }

  async getInvoiceStatistics(filters = {}) {
    try {
      const matchStage = {};
      
      if (filters.startDate) {
        matchStage.issueDate = { $gte: new Date(filters.startDate) };
      }
      
      if (filters.endDate) {
        matchStage.issueDate = { ...matchStage.issueDate, $lte: new Date(filters.endDate) };
      }
      
      const stats = await Invoice.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            totalPaid: { $sum: '$paidAmount' },
            totalOutstanding: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } },
            averageInvoiceValue: { $avg: '$totalAmount' },
            overdueAmount: {
              $sum: {
                $cond: [
                  { $and: [
                    { $in: ['$paymentStatus', ['sent', 'partially-paid']] },
                    { $lt: ['$dueDate', new Date()] }
                  ]},
                  { $subtract: ['$totalAmount', '$paidAmount'] },
                  0
                ]
              }
            }
          }
        }
      ]);
      
      const statusBreakdown = await Invoice.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 },
            amount: { $sum: '$totalAmount' }
          }
        }
      ]);
      
      return {
        overview: stats[0] || {},
        statusBreakdown
      };
    } catch (error) {
      logger.error('Error getting invoice statistics:', error);
      throw error;
    }
  }

  async getPaymentStatistics(filters = {}) {
    try {
      const matchStage = {};
      
      if (filters.startDate) {
        matchStage.paymentDate = { $gte: new Date(filters.startDate) };
      }
      
      if (filters.endDate) {
        matchStage.paymentDate = { ...matchStage.paymentDate, $lte: new Date(filters.endDate) };
      }
      
      const stats = await Invoice.aggregate([
        { $match: { ...matchStage, paymentDate: { $exists: true } } },
        {
          $group: {
            _id: null,
            totalPayments: { $sum: 1 },
            totalAmount: { $sum: '$paidAmount' },
            averagePayment: { $avg: '$paidAmount' },
            averageTimeToPayment: { $avg: '$analytics.timeToPayment' }
          }
        }
      ]);
      
      const paymentMethodBreakdown = await Invoice.aggregate([
        { $match: { ...matchStage, paymentDate: { $exists: true } } },
        {
          $group: {
            _id: '$paymentMethod.type',
            count: { $sum: 1 },
            amount: { $sum: '$paidAmount' }
          }
        }
      ]);
      
      return {
        overview: stats[0] || {},
        paymentMethodBreakdown
      };
    } catch (error) {
      logger.error('Error getting payment statistics:', error);
      throw error;
    }
  }

  async getClientStatistics(filters = {}) {
    try {
      const matchStage = {};
      
      if (filters.startDate) {
        matchStage.issueDate = { $gte: new Date(filters.startDate) };
      }
      
      if (filters.endDate) {
        matchStage.issueDate = { ...matchStage.issueDate, $lte: new Date(filters.endDate) };
      }
      
      const topClients = await Invoice.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$client.id',
            clientName: { $first: '$client.name' },
            totalInvoices: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            totalPaid: { $sum: '$paidAmount' },
            outstandingAmount: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } }
          }
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 10 }
      ]);
      
      const clientPaymentBehavior = await Invoice.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$client.id',
            clientName: { $first: '$client.name' },
            averageTimeToPayment: { $avg: '$analytics.timeToPayment' },
            paymentRate: {
              $avg: {
                $cond: [
                  { $eq: ['$paymentStatus', 'paid'] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);
      
      return {
        topClients,
        clientPaymentBehavior
      };
    } catch (error) {
      logger.error('Error getting client statistics:', error);
      throw error;
    }
  }

  async getRevenueStatistics(filters = {}) {
    try {
      const matchStage = {};
      
      if (filters.startDate) {
        matchStage.issueDate = { $gte: new Date(filters.startDate) };
      }
      
      if (filters.endDate) {
        matchStage.issueDate = { ...matchStage.issueDate, $lte: new Date(filters.endDate) };
      }
      
      // Monthly revenue
      const monthlyRevenue = await Invoice.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              year: { $year: '$issueDate' },
              month: { $month: '$issueDate' }
            },
            revenue: { $sum: '$totalAmount' },
            paidRevenue: { $sum: '$paidAmount' },
            invoiceCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);
      
      // Revenue by invoice type
      const revenueByType = await Invoice.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$invoiceType',
            revenue: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Revenue growth
      const currentPeriod = await Invoice.aggregate([
        { $match: { ...matchStage, issueDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$totalAmount' }
          }
        }
      ]);
      
      const previousPeriod = await Invoice.aggregate([
        { $match: { 
          ...matchStage, 
          issueDate: { 
            $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }},
        {
          $group: {
            _id: null,
            revenue: { $sum: '$totalAmount' }
          }
        }
      ]);
      
      const growthRate = previousPeriod[0]?.revenue > 0 
        ? ((currentPeriod[0]?.revenue - previousPeriod[0].revenue) / previousPeriod[0].revenue) * 100
        : 0;
      
      return {
        monthlyRevenue,
        revenueByType,
        currentPeriodRevenue: currentPeriod[0]?.revenue || 0,
        previousPeriodRevenue: previousPeriod[0]?.revenue || 0,
        growthRate
      };
    } catch (error) {
      logger.error('Error getting revenue statistics:', error);
      throw error;
    }
  }

  // Export and Reporting
  async generateInvoiceReport(filters = {}, format = 'json') {
    try {
      const invoices = await this.getInvoices(filters, { limit: 1000 });
      
      if (format === 'csv') {
        return this.convertToCSV(invoices);
      }
      
      return invoices;
    } catch (error) {
      logger.error('Error generating invoice report:', error);
      throw error;
    }
  }

  async generateFinancialReport(filters = {}) {
    try {
      const [
        invoiceStats,
        paymentStats,
        clientStats,
        revenueStats
      ] = await Promise.all([
        this.getInvoiceStatistics(filters),
        this.getPaymentStatistics(filters),
        this.getClientStatistics(filters),
        this.getRevenueStatistics(filters)
      ]);
      
      return {
        reportDate: new Date(),
        filters,
        invoiceStats,
        paymentStats,
        clientStats,
        revenueStats
      };
    } catch (error) {
      logger.error('Error generating financial report:', error);
      throw error;
    }
  }

  // Utility Methods
  convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0].toObject ? data[0].toObject() : data[0]);
    const csvRows = [headers.join(',')];
    
    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }

  // Recurring Invoice Management
  async processRecurringInvoices() {
    try {
      const recurringInvoices = await this.getRecurringInvoices();
      const processed = [];
      
      for (const invoice of recurringInvoices) {
        try {
          // Create new invoice based on recurring settings
          const newInvoice = new Invoice({
            ...invoice.toObject(),
            _id: undefined,
            invoiceNumber: this.generateInvoiceNumber(),
            issueDate: new Date(),
            dueDate: this.calculateDueDate(invoice.terms.paymentTerms),
            paymentStatus: 'draft',
            workflow: {
              status: 'draft',
              approvedBy: null,
              approvedDate: null,
              sentBy: null,
              sentDate: null
            },
            analytics: {
              views: 0,
              firstViewed: null,
              lastViewed: null,
              timeToPayment: null,
              reminderCount: 0,
              daysOverdue: 0
            },
            metadata: {
              createdBy: invoice.metadata.createdBy,
              updatedBy: invoice.metadata.createdBy,
              lastUpdated: new Date(),
              version: 1
            }
          });
          
          await newInvoice.save();
          
          // Update recurring invoice
          invoice.recurring.currentOccurrence += 1;
          invoice.recurring.nextInvoiceDate = this.calculateNextInvoiceDate(invoice);
          
          if (invoice.recurring.totalOccurrences && 
              invoice.recurring.currentOccurrence >= invoice.recurring.totalOccurrences) {
            invoice.recurring.isRecurring = false;
          }
          
          await invoice.save();
          processed.push(newInvoice);
          
          logger.info(`Recurring invoice processed: ${newInvoice.invoiceNumber}`);
        } catch (error) {
          logger.error(`Error processing recurring invoice ${invoice.invoiceNumber}:`, error);
        }
      }
      
      return processed;
    } catch (error) {
      logger.error('Error processing recurring invoices:', error);
      throw error;
    }
  }

  generateInvoiceNumber() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `INV-${timestamp}-${random}`;
  }

  calculateDueDate(paymentTerms) {
    const dueDate = new Date();
    
    if (paymentTerms.includes('Net 7')) {
      dueDate.setDate(dueDate.getDate() + 7);
    } else if (paymentTerms.includes('Net 15')) {
      dueDate.setDate(dueDate.getDate() + 15);
    } else if (paymentTerms.includes('Net 30')) {
      dueDate.setDate(dueDate.getDate() + 30);
    } else if (paymentTerms.includes('Net 60')) {
      dueDate.setDate(dueDate.getDate() + 60);
    } else {
      dueDate.setDate(dueDate.getDate() + 30); // Default to Net 30
    }
    
    return dueDate;
  }

  calculateNextInvoiceDate(invoice) {
    const nextDate = new Date();
    
    switch (invoice.recurring.frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (7 * invoice.recurring.interval));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + invoice.recurring.interval);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + (3 * invoice.recurring.interval));
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + invoice.recurring.interval);
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    return nextDate;
  }
}

module.exports = new FinanceService();
