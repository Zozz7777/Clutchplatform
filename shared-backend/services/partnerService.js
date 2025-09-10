const Partner = require('../models/Partner');
const { logger } = require('../config/logger');

class PartnerService {
  // Partner Management
  async createPartner(partnerData) {
    try {
      const partner = new Partner(partnerData);
      await partner.save();
      logger.info(`Partner created: ${partner.partnerId}`);
      return partner;
    } catch (error) {
      logger.error('Error creating partner:', error);
      throw error;
    }
  }

  async getPartnerById(partnerId) {
    try {
      const partner = await Partner.findById(partnerId)
        .populate('audit.createdBy', 'name email')
        .populate('support.assignedManager', 'name email');
      return partner;
    } catch (error) {
      logger.error('Error getting partner by ID:', error);
      throw error;
    }
  }

  async getPartnerByPartnerId(partnerId) {
    try {
      const partner = await Partner.findOne({ partnerId })
        .populate('audit.createdBy', 'name email')
        .populate('support.assignedManager', 'name email');
      return partner;
    } catch (error) {
      logger.error('Error getting partner by partner ID:', error);
      throw error;
    }
  }

  async updatePartner(partnerId, updateData) {
    try {
      const partner = await Partner.findByIdAndUpdate(
        partnerId,
        { ...updateData, 'audit.updatedBy': updateData.updatedBy },
        { new: true, runValidators: true }
      );
      logger.info(`Partner updated: ${partner.partnerId}`);
      return partner;
    } catch (error) {
      logger.error('Error updating partner:', error);
      throw error;
    }
  }

  async deletePartner(partnerId) {
    try {
      const partner = await Partner.findByIdAndDelete(partnerId);
      logger.info(`Partner deleted: ${partner.partnerId}`);
      return partner;
    } catch (error) {
      logger.error('Error deleting partner:', error);
      throw error;
    }
  }

  async getAllPartners(filters = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const partners = await Partner.find(filters)
        .populate('audit.createdBy', 'name email')
        .populate('support.assignedManager', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Partner.countDocuments(filters);
      
      return {
        partners,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting all partners:', error);
      throw error;
    }
  }

  // Partner Onboarding
  async updateOnboardingStep(partnerId, stepName, status, notes = '') {
    try {
      const partner = await Partner.findById(partnerId);
      if (!partner) throw new Error('Partner not found');

      const step = partner.onboarding.steps.find(s => s.step === stepName);
      if (step) {
        step.status = status;
        step.notes = notes;
        if (status === 'completed') {
          step.completedAt = new Date();
        }
      }

      // Update overall onboarding status
      const completedSteps = partner.onboarding.steps.filter(s => s.status === 'completed').length;
      const totalSteps = partner.onboarding.steps.length;
      
      if (completedSteps === totalSteps) {
        partner.onboarding.status = 'completed';
      } else if (completedSteps > 0) {
        partner.onboarding.status = 'in_progress';
      }

      await partner.save();
      logger.info(`Onboarding step updated for partner ${partner.partnerId}: ${stepName}`);
      return partner;
    } catch (error) {
      logger.error('Error updating onboarding step:', error);
      throw error;
    }
  }

  async uploadDocument(partnerId, documentData) {
    try {
      const partner = await Partner.findById(partnerId);
      if (!partner) throw new Error('Partner not found');

      partner.onboarding.documents.push(documentData);
      await partner.save();
      
      logger.info(`Document uploaded for partner ${partner.partnerId}: ${documentData.name}`);
      return partner;
    } catch (error) {
      logger.error('Error uploading document:', error);
      throw error;
    }
  }

  async updateTrainingModule(partnerId, moduleName, status, score = null) {
    try {
      const partner = await Partner.findById(partnerId);
      if (!partner) throw new Error('Partner not found');

      const module = partner.onboarding.training.modules.find(m => m.name === moduleName);
      if (module) {
        module.status = status;
        if (score !== null) module.score = score;
        if (status === 'completed') {
          module.completedAt = new Date();
        }
      }

      // Check if all modules are completed
      const allCompleted = partner.onboarding.training.modules.every(m => m.status === 'completed');
      if (allCompleted) {
        partner.onboarding.training.completed = true;
      }

      await partner.save();
      logger.info(`Training module updated for partner ${partner.partnerId}: ${moduleName}`);
      return partner;
    } catch (error) {
      logger.error('Error updating training module:', error);
      throw error;
    }
  }

  // Performance Management
  async updatePerformance(partnerId, performanceData) {
    try {
      const partner = await Partner.findById(partnerId);
      if (!partner) throw new Error('Partner not found');

      Object.assign(partner.performance, performanceData);
      await partner.save();
      
      logger.info(`Performance updated for partner ${partner.partnerId}`);
      return partner;
    } catch (error) {
      logger.error('Error updating performance:', error);
      throw error;
    }
  }

  async addPerformanceReview(partnerId, reviewData) {
    try {
      const partner = await Partner.findById(partnerId);
      if (!partner) throw new Error('Partner not found');

      // Update overall rating
      const currentTotal = partner.performance.rating.average * partner.performance.rating.totalReviews;
      const newTotal = currentTotal + reviewData.rating;
      const newCount = partner.performance.rating.totalReviews + 1;
      
      partner.performance.rating.average = newTotal / newCount;
      partner.performance.rating.totalReviews = newCount;
      partner.performance.rating.lastUpdated = new Date();

      await partner.save();
      logger.info(`Performance review added for partner ${partner.partnerId}`);
      return partner;
    } catch (error) {
      logger.error('Error adding performance review:', error);
      throw error;
    }
  }

  // Commission Management
  async updateCommissionStructure(partnerId, commissionData) {
    try {
      const partner = await Partner.findById(partnerId);
      if (!partner) throw new Error('Partner not found');

      Object.assign(partner.commission.structure, commissionData);
      await partner.save();
      
      logger.info(`Commission structure updated for partner ${partner.partnerId}`);
      return partner;
    } catch (error) {
      logger.error('Error updating commission structure:', error);
      throw error;
    }
  }

  async addCommissionEarning(partnerId, amount, period = 'thisMonth') {
    try {
      const partner = await Partner.findById(partnerId);
      if (!partner) throw new Error('Partner not found');

      partner.commission.earnings.totalEarned += amount;
      partner.commission.earnings[period] += amount;
      partner.commission.earnings.pending += amount;

      await partner.save();
      logger.info(`Commission earning added for partner ${partner.partnerId}: ${amount}`);
      return partner;
    } catch (error) {
      logger.error('Error adding commission earning:', error);
      throw error;
    }
  }

  async processPayout(partnerId, payoutData) {
    try {
      const partner = await Partner.findById(partnerId);
      if (!partner) throw new Error('Partner not found');

      partner.commission.payouts.push(payoutData);
      partner.commission.earnings.pending -= payoutData.amount;
      partner.commission.earnings.paid += payoutData.amount;

      await partner.save();
      logger.info(`Payout processed for partner ${partner.partnerId}: ${payoutData.amount}`);
      return partner;
    } catch (error) {
      logger.error('Error processing payout:', error);
      throw error;
    }
  }

  // Support Management
  async createSupportTicket(partnerId, ticketData) {
    try {
      const partner = await Partner.findById(partnerId);
      if (!partner) throw new Error('Partner not found');

      partner.support.tickets.push(ticketData);
      await partner.save();
      
      logger.info(`Support ticket created for partner ${partner.partnerId}: ${ticketData.ticketId}`);
      return partner;
    } catch (error) {
      logger.error('Error creating support ticket:', error);
      throw error;
    }
  }

  async updateSupportTicket(partnerId, ticketId, updateData) {
    try {
      const partner = await Partner.findById(partnerId);
      if (!partner) throw new Error('Partner not found');

      const ticket = partner.support.tickets.find(t => t.ticketId === ticketId);
      if (ticket) {
        Object.assign(ticket, updateData);
        ticket.updatedAt = new Date();
      }

      await partner.save();
      logger.info(`Support ticket updated for partner ${partner.partnerId}: ${ticketId}`);
      return partner;
    } catch (error) {
      logger.error('Error updating support ticket:', error);
      throw error;
    }
  }

  // Analytics & Reporting
  async getPartnerAnalytics(partnerId, period = 'monthly') {
    try {
      const partner = await Partner.findById(partnerId);
      if (!partner) throw new Error('Partner not found');

      const analytics = {
        performance: {
          rating: partner.performance.rating,
          metrics: partner.performance.metrics,
          qualityScore: partner.performance.qualityScore
        },
        commission: {
          earnings: partner.commission.earnings,
          totalPayouts: partner.commission.payouts.reduce((sum, p) => sum + p.amount, 0)
        },
        analytics: partner.analytics,
        onboarding: {
          status: partner.onboarding.status,
          completedSteps: partner.onboarding.steps.filter(s => s.status === 'completed').length,
          totalSteps: partner.onboarding.steps.length
        }
      };

      return analytics;
    } catch (error) {
      logger.error('Error getting partner analytics:', error);
      throw error;
    }
  }

  async getPartnersByLocation(latitude, longitude, radius = 50) {
    try {
      const partners = await Partner.findByLocation(latitude, longitude, radius);
      return partners;
    } catch (error) {
      logger.error('Error getting partners by location:', error);
      throw error;
    }
  }

  async getPartnersByService(serviceType) {
    try {
      const partners = await Partner.findByService(serviceType);
      return partners;
    } catch (error) {
      logger.error('Error getting partners by service:', error);
      throw error;
    }
  }

  async getTopPerformers(limit = 10) {
    try {
      const partners = await Partner.findTopPerformers(limit);
      return partners;
    } catch (error) {
      logger.error('Error getting top performers:', error);
      throw error;
    }
  }

  // Bulk Operations
  async bulkUpdateStatus(partnerIds, status, reason = '') {
    try {
      const partners = await Partner.find({ _id: { $in: partnerIds } });
      
      for (const partner of partners) {
        partner.status = status;
        partner.audit.statusHistory.push({
          status,
          changedBy: partner.audit.updatedBy,
          reason
        });
        await partner.save();
      }

      logger.info(`Bulk status update completed for ${partners.length} partners`);
      return partners;
    } catch (error) {
      logger.error('Error in bulk status update:', error);
      throw error;
    }
  }

  async bulkAssignManager(partnerIds, managerId) {
    try {
      const result = await Partner.updateMany(
        { _id: { $in: partnerIds } },
        { 'support.assignedManager': managerId }
      );

      logger.info(`Bulk manager assignment completed for ${result.modifiedCount} partners`);
      return result;
    } catch (error) {
      logger.error('Error in bulk manager assignment:', error);
      throw error;
    }
  }

  // Search & Filter
  async searchPartners(query, filters = {}) {
    try {
      const searchQuery = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { 'contact.primaryContact.name': { $regex: query, $options: 'i' } },
          { 'contact.primaryContact.email': { $regex: query, $options: 'i' } },
          { 'business.legalName': { $regex: query, $options: 'i' } },
          { partnerId: { $regex: query, $options: 'i' } }
        ],
        ...filters
      };

      const partners = await Partner.find(searchQuery)
        .populate('audit.createdBy', 'name email')
        .populate('support.assignedManager', 'name email')
        .sort({ createdAt: -1 });

      return partners;
    } catch (error) {
      logger.error('Error searching partners:', error);
      throw error;
    }
  }

  // Dashboard Analytics
  async getDashboardStats() {
    try {
      const stats = await Partner.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$analytics.totalRevenue' },
            totalJobs: { $sum: '$analytics.totalJobs' }
          }
        }
      ]);

      const totalPartners = await Partner.countDocuments();
      const activePartners = await Partner.countDocuments({ status: 'active' });
      const pendingPartners = await Partner.countDocuments({ status: 'pending' });

      return {
        totalPartners,
        activePartners,
        pendingPartners,
        statusBreakdown: stats,
        averageRating: await this.getAverageRating(),
        totalCommissionPaid: await this.getTotalCommissionPaid()
      };
    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  async getAverageRating() {
    try {
      const result = await Partner.aggregate([
        { $match: { 'performance.rating.totalReviews': { $gt: 0 } } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$performance.rating.average' },
            totalReviews: { $sum: '$performance.rating.totalReviews' }
          }
        }
      ]);

      return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
    } catch (error) {
      logger.error('Error getting average rating:', error);
      throw error;
    }
  }

  async getTotalCommissionPaid() {
    try {
      const result = await Partner.aggregate([
        {
          $group: {
            _id: null,
            totalPaid: { $sum: '$commission.earnings.paid' },
            totalPending: { $sum: '$commission.earnings.pending' }
          }
        }
      ]);

      return result.length > 0 ? result[0] : { totalPaid: 0, totalPending: 0 };
    } catch (error) {
      logger.error('Error getting total commission paid:', error);
      throw error;
    }
  }
}

module.exports = new PartnerService();
