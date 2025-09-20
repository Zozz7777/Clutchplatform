const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PaymentPlan = require('../models/PaymentPlan');
const Subscription = require('../models/subscription');
const DigitalWallet = require('../models/DigitalWallet');
const Payment = require('../models/Payment');
const { logger } = require('../config/logger');
const {
  createDocument,
  findDocument,
  findDocumentById,
  findDocuments,
  updateDocumentById,
  deleteDocumentById,
  countDocuments,
  aggregateDocuments,
  generateId,
  toObjectId,
  createDateRangeFilter
} = require('../utils/databaseUtils');

// ==================== PAYMENT SERVICE ====================

class PaymentService {
  constructor() {
    this.collectionName = 'payments';
  }

  /**
   * Create a new payment
   */
  async createPayment(paymentData) {
    try {
      // Generate payment ID
      paymentData.paymentId = paymentData.paymentId || generateId();

      // Set default values
      paymentData.status = paymentData.status || 'pending';
      paymentData.currency = paymentData.currency || 'EGP';
      paymentData.createdAt = new Date();
      paymentData.updatedAt = new Date();

      // Convert IDs to ObjectId
      if (paymentData.userId) {
        paymentData.userId = toObjectId(paymentData.userId);
      }
      if (paymentData.bookingId) {
        paymentData.bookingId = toObjectId(paymentData.bookingId);
      }
      if (paymentData.mechanicId) {
        paymentData.mechanicId = toObjectId(paymentData.mechanicId);
      }

      const result = await createDocument(this.collectionName, paymentData);
      return result;
    } catch (error) {
      console.error('Error creating payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find payment by ID
   */
  async findPaymentById(paymentId, projection = {}) {
    try {
      const result = await findDocumentById(this.collectionName, paymentId, projection);
      return result;
    } catch (error) {
      console.error('Error finding payment by ID:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find payment by payment ID
   */
  async findPaymentByPaymentId(paymentId, projection = {}) {
    try {
      const result = await findDocument(this.collectionName, { paymentId }, projection);
      return result;
    } catch (error) {
      console.error('Error finding payment by payment ID:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find payments by user
   */
  async findPaymentsByUser(userId, options = {}) {
    try {
      const filter = { userId: toObjectId(userId) };
      
      if (options.status) filter.status = options.status;
      if (options.startDate || options.endDate) {
        filter.createdAt = createDateRangeFilter(options.startDate, options.endDate).createdAt;
      }

      const result = await findDocuments(this.collectionName, filter, options);
      return result;
    } catch (error) {
      console.error('Error finding payments by user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find payments by mechanic
   */
  async findPaymentsByMechanic(mechanicId, options = {}) {
    try {
      const filter = { mechanicId: toObjectId(mechanicId) };
      
      if (options.status) filter.status = options.status;
      if (options.startDate || options.endDate) {
        filter.createdAt = createDateRangeFilter(options.startDate, options.endDate).createdAt;
      }

      const result = await findDocuments(this.collectionName, filter, options);
      return result;
    } catch (error) {
      console.error('Error finding payments by mechanic:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find payments by booking
   */
  async findPaymentsByBooking(bookingId, options = {}) {
    try {
      const filter = { bookingId: toObjectId(bookingId) };
      const result = await findDocuments(this.collectionName, filter, options);
      return result;
    } catch (error) {
      console.error('Error finding payments by booking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find pending payments
   */
  async findPendingPayments(options = {}) {
    try {
      const filter = { status: 'pending' };
      const result = await findDocuments(this.collectionName, filter, options);
      return result;
    } catch (error) {
      console.error('Error finding pending payments:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update payment by ID
   */
  async updatePaymentById(paymentId, updateData) {
    try {
      // Convert IDs to ObjectId if provided
      if (updateData.userId) {
        updateData.userId = toObjectId(updateData.userId);
      }
      if (updateData.bookingId) {
        updateData.bookingId = toObjectId(updateData.bookingId);
      }
      if (updateData.mechanicId) {
        updateData.mechanicId = toObjectId(updateData.mechanicId);
      }

      const result = await updateDocumentById(this.collectionName, paymentId, updateData);
      return result;
    } catch (error) {
      console.error('Error updating payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete payment by ID
   */
  async deletePaymentById(paymentId) {
    try {
      const result = await deleteDocumentById(this.collectionName, paymentId);
      return result;
    } catch (error) {
      console.error('Error deleting payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process payment
   */
  async processPayment(paymentId) {
    try {
      const updateData = {
        status: 'processing',
        updatedAt: new Date()
      };

      const result = await this.updatePaymentById(paymentId, updateData);
      return result;
    } catch (error) {
      console.error('Error processing payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Complete payment
   */
  async completePayment(paymentId, paymentDetails = {}) {
    try {
      const updateData = {
        status: 'completed',
        paymentDetails: { ...paymentDetails },
        completedAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.updatePaymentById(paymentId, updateData);
      return result;
    } catch (error) {
      console.error('Error completing payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fail payment
   */
  async failPayment(paymentId, failureDetails = {}) {
    try {
      const updateData = {
        status: 'failed',
        paymentDetails: { ...failureDetails },
        failedAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.updatePaymentById(paymentId, updateData);
      return result;
    } catch (error) {
      console.error('Error failing payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId) {
    try {
      const updateData = {
        status: 'cancelled',
        updatedAt: new Date()
      };

      const result = await this.updatePaymentById(paymentId, updateData);
      return result;
    } catch (error) {
      console.error('Error cancelling payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId, refundData) {
    try {
      const payment = await this.findPaymentById(paymentId);
      
      if (!payment.success || !payment.data) {
        return { success: false, error: 'Payment not found' };
      }

      const refund = {
        refundId: generateId(),
        amount: refundData.amount,
        reason: refundData.reason,
        processedAt: new Date()
      };

      const updateData = {
        refunds: [...(payment.data.refunds || []), refund],
        updatedAt: new Date()
      };

      // If refund amount is greater than or equal to payment amount, mark as refunded
      if (refundData.amount >= payment.data.amount) {
        updateData.status = 'refunded';
      }

      const result = await this.updatePaymentById(paymentId, updateData);
      return result;
    } catch (error) {
      console.error('Error refunding payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate user payment totals
   */
  async calculateUserPaymentTotals(userId, period) {
    try {
      const filter = { userId: toObjectId(userId) };
      
      if (period) {
        filter.createdAt = createDateRangeFilter(period.startDate, period.endDate).createdAt;
      }

      const pipeline = [
        { $match: filter },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalCompleted: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
            totalPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
            totalFailed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, '$amount', 0] } },
            count: { $sum: 1 }
          }
        }
      ];

      const result = await aggregateDocuments(this.collectionName, pipeline);
      return result;
    } catch (error) {
      console.error('Error calculating user payment totals:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate mechanic payment totals
   */
  async calculateMechanicPaymentTotals(mechanicId, period) {
    try {
      const filter = { mechanicId: toObjectId(mechanicId) };
      
      if (period) {
        filter.createdAt = createDateRangeFilter(period.startDate, period.endDate).createdAt;
      }

      const pipeline = [
        { $match: filter },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalCompleted: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
            totalPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
            totalFailed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, '$amount', 0] } },
            count: { $sum: 1 }
          }
        }
      ];

      const result = await aggregateDocuments(this.collectionName, pipeline);
      return result;
    } catch (error) {
      console.error('Error calculating mechanic payment totals:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats() {
    try {
      const totalPayments = await countDocuments(this.collectionName);
      const completedPayments = await countDocuments(this.collectionName, { status: 'completed' });
      const pendingPayments = await countDocuments(this.collectionName, { status: 'pending' });
      const failedPayments = await countDocuments(this.collectionName, { status: 'failed' });

      // Calculate total amounts
      const totalAmountPipeline = [
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
      ];
      const totalAmountResult = await aggregateDocuments(this.collectionName, totalAmountPipeline);

      const completedAmountPipeline = [
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
      ];
      const completedAmountResult = await aggregateDocuments(this.collectionName, completedAmountPipeline);

      return {
        success: true,
        data: {
          total: totalPayments.count || 0,
          completed: completedPayments.count || 0,
          pending: pendingPayments.count || 0,
          failed: failedPayments.count || 0,
          totalAmount: totalAmountResult.data?.[0]?.totalAmount || 0,
          completedAmount: completedAmountResult.data?.[0]?.totalAmount || 0
        }
      };
    } catch (error) {
      console.error('Error getting payment stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get payments by date range
   */
  async getPaymentsByDateRange(startDate, endDate, options = {}) {
    try {
      const dateFilter = createDateRangeFilter(startDate, endDate, 'createdAt');
      const result = await findDocuments(this.collectionName, dateFilter, options);
      return result;
    } catch (error) {
      console.error('Error getting payments by date range:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate payment data
   */
  validatePaymentData(paymentData) {
    const errors = [];

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Valid amount is required');
    }

    if (!paymentData.userId) {
      errors.push('User ID is required');
    }

    if (!paymentData.paymentMethod) {
      errors.push('Payment method is required');
    }

    if (!paymentData.currency) {
      errors.push('Currency is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new PaymentService();
