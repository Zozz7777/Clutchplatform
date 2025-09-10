const Customer = require('../models/Customer');
const { logger } = require('../config/logger');

class CRMService {
  // Customer Management
  async createCustomer(customerData) {
    try {
      const customer = new Customer(customerData);
      await customer.save();
      
      logger.info(`Customer created: ${customer.basicInfo.email}`);
      return customer;
    } catch (error) {
      logger.error('Error creating customer:', error);
      throw error;
    }
  }

  async getCustomerById(customerId) {
    try {
      const customer = await Customer.findById(customerId)
        .populate('relationships.assignedTo')
        .populate('relationships.accountManager')
        .populate('relationships.salesRep')
        .populate('relationships.supportRep');
      
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      return customer;
    } catch (error) {
      logger.error('Error getting customer:', error);
      throw error;
    }
  }

  async updateCustomer(customerId, updateData) {
    try {
      const customer = await Customer.findByIdAndUpdate(
        customerId,
        { ...updateData, 'metadata.updatedBy': updateData.updatedBy },
        { new: true, runValidators: true }
      );
      
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      logger.info(`Customer updated: ${customer.basicInfo.email}`);
      return customer;
    } catch (error) {
      logger.error('Error updating customer:', error);
      throw error;
    }
  }

  async deleteCustomer(customerId) {
    try {
      const customer = await Customer.findByIdAndDelete(customerId);
      
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      logger.info(`Customer deleted: ${customer.basicInfo.email}`);
      return { message: 'Customer deleted successfully' };
    } catch (error) {
      logger.error('Error deleting customer:', error);
      throw error;
    }
  }

  async getCustomers(filters = {}, options = {}) {
    try {
      const query = {};
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.tier) {
        query['classification.tier'] = filters.tier;
      }
      
      if (filters.segment) {
        query['classification.segment'] = filters.segment;
      }
      
      if (filters.type) {
        query['classification.type'] = filters.type;
      }
      
      if (filters.source) {
        query['classification.source'] = filters.source;
      }
      
      if (filters.assignedTo) {
        query['relationships.assignedTo'] = filters.assignedTo;
      }
      
      if (filters.search) {
        query.$or = [
          { 'basicInfo.firstName': { $regex: filters.search, $options: 'i' } },
          { 'basicInfo.lastName': { $regex: filters.search, $options: 'i' } },
          { 'basicInfo.email': { $regex: filters.search, $options: 'i' } },
          { 'company.name': { $regex: filters.search, $options: 'i' } }
        ];
      }
      
      const customers = await Customer.find(query)
        .populate('relationships.assignedTo')
        .populate('relationships.accountManager')
        .populate('relationships.salesRep')
        .sort(options.sort || { 'analytics.lastActivity': -1 })
        .limit(options.limit || 50)
        .skip(options.skip || 0);
      
      return customers;
    } catch (error) {
      logger.error('Error getting customers:', error);
      throw error;
    }
  }

  // Customer Interactions
  async addInteraction(customerId, interactionData) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      await customer.addInteraction(interactionData);
      
      logger.info(`Interaction added for customer: ${customer.basicInfo.email}`);
      return customer;
    } catch (error) {
      logger.error('Error adding interaction:', error);
      throw error;
    }
  }

  async getInteractions(customerId, filters = {}) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      let interactions = customer.interactions;
      
      if (filters.type) {
        interactions = interactions.filter(interaction => interaction.type === filters.type);
      }
      
      if (filters.startDate) {
        interactions = interactions.filter(interaction => interaction.date >= new Date(filters.startDate));
      }
      
      if (filters.endDate) {
        interactions = interactions.filter(interaction => interaction.date <= new Date(filters.endDate));
      }
      
      return interactions.sort((a, b) => b.date - a.date);
    } catch (error) {
      logger.error('Error getting interactions:', error);
      throw error;
    }
  }

  // Sales Pipeline Management
  async updateCustomerStage(customerId, newStage, reason) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      await customer.updateStage(newStage, reason);
      
      logger.info(`Customer stage updated: ${customer.basicInfo.email} - ${newStage}`);
      return customer;
    } catch (error) {
      logger.error('Error updating customer stage:', error);
      throw error;
    }
  }

  async assignCustomer(customerId, assignedTo, role = 'assignedTo') {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      customer.relationships[role] = assignedTo;
      await customer.save();
      
      logger.info(`Customer assigned: ${customer.basicInfo.email} to ${role}`);
      return customer;
    } catch (error) {
      logger.error('Error assigning customer:', error);
      throw error;
    }
  }

  // Purchase History
  async addPurchase(customerId, purchaseData) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      await customer.addPurchase(purchaseData);
      
      logger.info(`Purchase added for customer: ${customer.basicInfo.email}`);
      return customer;
    } catch (error) {
      logger.error('Error adding purchase:', error);
      throw error;
    }
  }

  async getPurchaseHistory(customerId, filters = {}) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      let purchases = customer.purchases;
      
      if (filters.startDate) {
        purchases = purchases.filter(purchase => purchase.date >= new Date(filters.startDate));
      }
      
      if (filters.endDate) {
        purchases = purchases.filter(purchase => purchase.date <= new Date(filters.endDate));
      }
      
      if (filters.status) {
        purchases = purchases.filter(purchase => purchase.status === filters.status);
      }
      
      return purchases.sort((a, b) => b.date - a.date);
    } catch (error) {
      logger.error('Error getting purchase history:', error);
      throw error;
    }
  }

  // Customer Notes
  async addNote(customerId, noteData) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      await customer.addNote(
        noteData.note,
        noteData.createdBy,
        noteData.category || 'general',
        noteData.isPrivate || false
      );
      
      logger.info(`Note added for customer: ${customer.basicInfo.email}`);
      return customer;
    } catch (error) {
      logger.error('Error adding note:', error);
      throw error;
    }
  }

  async getNotes(customerId, filters = {}) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      let notes = customer.notes;
      
      if (filters.category) {
        notes = notes.filter(note => note.category === filters.category);
      }
      
      if (filters.isPrivate !== undefined) {
        notes = notes.filter(note => note.isPrivate === filters.isPrivate);
      }
      
      return notes.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      logger.error('Error getting notes:', error);
      throw error;
    }
  }

  // Customer Analytics
  async getCRMDashboardData(filters = {}) {
    try {
      const [
        customerStats,
        salesStats,
        interactionStats,
        segmentStats
      ] = await Promise.all([
        this.getCustomerStatistics(filters),
        this.getSalesStatistics(filters),
        this.getInteractionStatistics(filters),
        this.getSegmentStatistics(filters)
      ]);
      
      return {
        customerStats,
        salesStats,
        interactionStats,
        segmentStats
      };
    } catch (error) {
      logger.error('Error getting CRM dashboard data:', error);
      throw error;
    }
  }

  async getCustomerStatistics(filters = {}) {
    try {
      const matchStage = {};
      
      if (filters.startDate) {
        matchStage['analytics.lastActivity'] = { $gte: new Date(filters.startDate) };
      }
      
      if (filters.endDate) {
        matchStage['analytics.lastActivity'] = { ...matchStage['analytics.lastActivity'], $lte: new Date(filters.endDate) };
      }
      
      const stats = await Customer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            activeCustomers: {
              $sum: { $cond: [{ $eq: ['$status', 'customer'] }, 1, 0] }
            },
            prospects: {
              $sum: { $cond: [{ $eq: ['$status', 'prospect'] }, 1, 0] }
            },
            leads: {
              $sum: { $cond: [{ $eq: ['$status', 'lead'] }, 1, 0] }
            },
            totalRevenue: { $sum: '$analytics.lifetimeValue' },
            averageLTV: { $avg: '$analytics.lifetimeValue' },
            averageEngagement: { $avg: '$analytics.engagementScore' }
          }
        }
      ]);
      
      const statusBreakdown = await Customer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$analytics.lifetimeValue' }
          }
        }
      ]);
      
      return {
        overview: stats[0] || {},
        statusBreakdown
      };
    } catch (error) {
      logger.error('Error getting customer statistics:', error);
      throw error;
    }
  }

  async getSalesStatistics(filters = {}) {
    try {
      const matchStage = {};
      
      if (filters.startDate) {
        matchStage['analytics.lastActivity'] = { $gte: new Date(filters.startDate) };
      }
      
      if (filters.endDate) {
        matchStage['analytics.lastActivity'] = { ...matchStage['analytics.lastActivity'], $lte: new Date(filters.endDate) };
      }
      
      const salesStats = await Customer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$analytics.orderCount' },
            totalRevenue: { $sum: '$analytics.totalSpent' },
            averageOrderValue: { $avg: '$analytics.averageOrderValue' },
            conversionRate: {
              $avg: {
                $cond: [
                  { $gt: ['$analytics.orderCount', 0] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);
      
      const topCustomers = await Customer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$_id',
            customerName: { $first: '$basicInfo.firstName' },
            customerEmail: { $first: '$basicInfo.email' },
            totalSpent: { $sum: '$analytics.totalSpent' },
            orderCount: { $sum: '$analytics.orderCount' },
            lastPurchase: { $max: '$analytics.lastPurchaseDate' }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 }
      ]);
      
      return {
        overview: salesStats[0] || {},
        topCustomers
      };
    } catch (error) {
      logger.error('Error getting sales statistics:', error);
      throw error;
    }
  }

  async getInteractionStatistics(filters = {}) {
    try {
      const matchStage = {};
      
      if (filters.startDate) {
        matchStage['interactions.date'] = { $gte: new Date(filters.startDate) };
      }
      
      if (filters.endDate) {
        matchStage['interactions.date'] = { ...matchStage['interactions.date'], $lte: new Date(filters.endDate) };
      }
      
      const interactionStats = await Customer.aggregate([
        { $unwind: '$interactions' },
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalInteractions: { $sum: 1 },
            averageResponseTime: { $avg: '$analytics.responseTime' },
            averageSatisfaction: { $avg: '$analytics.satisfactionScore' }
          }
        }
      ]);
      
      const interactionByType = await Customer.aggregate([
        { $unwind: '$interactions' },
        { $match: matchStage },
        {
          $group: {
            _id: '$interactions.type',
            count: { $sum: 1 },
            averageDuration: { $avg: '$interactions.duration' }
          }
        }
      ]);
      
      const sentimentAnalysis = await Customer.aggregate([
        { $unwind: '$interactions' },
        { $match: matchStage },
        {
          $group: {
            _id: '$interactions.sentiment',
            count: { $sum: 1 }
          }
        }
      ]);
      
      return {
        overview: interactionStats[0] || {},
        interactionByType,
        sentimentAnalysis
      };
    } catch (error) {
      logger.error('Error getting interaction statistics:', error);
      throw error;
    }
  }

  async getSegmentStatistics(filters = {}) {
    try {
      const matchStage = {};
      
      if (filters.startDate) {
        matchStage['analytics.lastActivity'] = { $gte: new Date(filters.startDate) };
      }
      
      if (filters.endDate) {
        matchStage['analytics.lastActivity'] = { ...matchStage['analytics.lastActivity'], $lte: new Date(filters.endDate) };
      }
      
      const segmentStats = await Customer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$classification.segment',
            count: { $sum: 1 },
            totalValue: { $sum: '$analytics.lifetimeValue' },
            averageLTV: { $avg: '$analytics.lifetimeValue' },
            averageEngagement: { $avg: '$analytics.engagementScore' }
          }
        }
      ]);
      
      const tierStats = await Customer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$classification.tier',
            count: { $sum: 1 },
            totalValue: { $sum: '$analytics.lifetimeValue' },
            averageLTV: { $avg: '$analytics.lifetimeValue' }
          }
        }
      ]);
      
      const sourceStats = await Customer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$classification.source',
            count: { $sum: 1 },
            conversionRate: {
              $avg: {
                $cond: [
                  { $eq: ['$status', 'customer'] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);
      
      return {
        segmentStats,
        tierStats,
        sourceStats
      };
    } catch (error) {
      logger.error('Error getting segment statistics:', error);
      throw error;
    }
  }

  // Customer Segmentation
  async segmentCustomers(criteria = {}) {
    try {
      const segments = {
        vip: [],
        atRisk: [],
        new: [],
        active: [],
        inactive: []
      };
      
      const customers = await Customer.find({});
      
      customers.forEach(customer => {
        // VIP Customers (high LTV, high engagement)
        if (customer.analytics.lifetimeValue > 10000 && customer.analytics.engagementScore > 80) {
          segments.vip.push(customer._id);
        }
        // At Risk (low engagement, declining activity)
        else if (customer.analytics.engagementScore < 30 || customer.daysSinceLastActivity > 90) {
          segments.atRisk.push(customer._id);
        }
        // New Customers (recent activity, low order count)
        else if (customer.analytics.orderCount <= 1 && customer.daysSinceLastActivity < 30) {
          segments.new.push(customer._id);
        }
        // Active Customers (regular activity, good engagement)
        else if (customer.analytics.engagementScore > 50 && customer.daysSinceLastActivity < 60) {
          segments.active.push(customer._id);
        }
        // Inactive Customers
        else {
          segments.inactive.push(customer._id);
        }
      });
      
      // Update customer segments
      for (const [segment, customerIds] of Object.entries(segments)) {
        await Customer.updateMany(
          { _id: { $in: customerIds } },
          { 'classification.segment': segment }
        );
      }
      
      logger.info('Customer segmentation completed');
      return segments;
    } catch (error) {
      logger.error('Error segmenting customers:', error);
      throw error;
    }
  }

  // Customer Lifecycle Management
  async updateCustomerLifecycle() {
    try {
      const customers = await Customer.find({});
      let updated = 0;
      
      for (const customer of customers) {
        let newStage = customer.lifecycle.stage;
        
        // Determine stage based on customer behavior
        if (customer.status === 'prospect' && customer.analytics.orderCount > 0) {
          newStage = 'decision';
        } else if (customer.status === 'customer' && customer.analytics.engagementScore > 70) {
          newStage = 'retention';
        } else if (customer.analytics.lifetimeValue > 5000 && customer.analytics.engagementScore > 80) {
          newStage = 'advocacy';
        }
        
        if (newStage !== customer.lifecycle.stage) {
          customer.lifecycle.stage = newStage;
          customer.lifecycle.stageHistory.push({
            stage: newStage,
            reason: 'Automated lifecycle update'
          });
          await customer.save();
          updated++;
        }
      }
      
      logger.info(`Customer lifecycle updated for ${updated} customers`);
      return { updated };
    } catch (error) {
      logger.error('Error updating customer lifecycle:', error);
      throw error;
    }
  }

  // Export and Reporting
  async generateCustomerReport(filters = {}, format = 'json') {
    try {
      const customers = await this.getCustomers(filters, { limit: 1000 });
      
      if (format === 'csv') {
        return this.convertToCSV(customers);
      }
      
      return customers;
    } catch (error) {
      logger.error('Error generating customer report:', error);
      throw error;
    }
  }

  async generateSalesReport(filters = {}) {
    try {
      const [
        customerStats,
        salesStats,
        segmentStats
      ] = await Promise.all([
        this.getCustomerStatistics(filters),
        this.getSalesStatistics(filters),
        this.getSegmentStatistics(filters)
      ]);
      
      return {
        reportDate: new Date(),
        filters,
        customerStats,
        salesStats,
        segmentStats
      };
    } catch (error) {
      logger.error('Error generating sales report:', error);
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
}

module.exports = new CRMService();
