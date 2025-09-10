const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { logger } = require('../config/logger');
const { getRedisClient } = require('../config/redis');

class AdvancedPaymentService {
  constructor() {
    this.paymentGateways = {
      stripe: this.stripePayment.bind(this),
      paypal: this.paypalPayment.bind(this),
      applePay: this.applePayPayment.bind(this),
      googlePay: this.googlePayPayment.bind(this)
    };
    this.subscriptionPlans = new Map();
    this.paymentPlans = new Map();
  }

  /**
   * Process payment with multiple gateway support
   */
  async processPayment(paymentData) {
    try {
      const {
        amount,
        currency = 'USD',
        paymentMethod,
        customerId,
        bookingId,
        description,
        metadata = {}
      } = paymentData;

      // Validate payment data
      this.validatePaymentData(paymentData);

      // Select payment gateway
      const gateway = this.paymentGateways[paymentMethod];
      if (!gateway) {
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }

      // Process payment
      const result = await gateway(paymentData);

      // Store payment record
      await this.storePaymentRecord({
        ...paymentData,
        transactionId: result.transactionId,
        status: result.status,
        gateway: paymentMethod,
        processedAt: new Date()
      });

      // Send notification
      await this.sendPaymentNotification(customerId, result);

      logger.info(`Payment processed successfully: ${result.transactionId}`);
      return result;
    } catch (error) {
      logger.error('Payment processing error:', error);
      throw error;
    }
  }

  /**
   * Stripe payment processing
   */
  async stripePayment(paymentData) {
    try {
      const { amount, currency, customerId, description, metadata } = paymentData;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customerId,
        description,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        transactionId: paymentIntent.id,
        status: paymentIntent.status,
        amount: amount,
        currency: currency,
        gateway: 'stripe'
      };
    } catch (error) {
      logger.error('Stripe payment error:', error);
      throw new Error(`Stripe payment failed: ${error.message}`);
    }
  }

  /**
   * PayPal payment processing
   */
  async paypalPayment(paymentData) {
    try {
      // PayPal integration would go here
      // For now, return a mock response
      const transactionId = `paypal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        transactionId,
        status: 'completed',
        amount: paymentData.amount,
        currency: paymentData.currency,
        gateway: 'paypal'
      };
    } catch (error) {
      logger.error('PayPal payment error:', error);
      throw new Error(`PayPal payment failed: ${error.message}`);
    }
  }

  /**
   * Apple Pay payment processing
   */
  async applePayPayment(paymentData) {
    try {
      // Apple Pay integration would go here
      const transactionId = `applepay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        transactionId,
        status: 'completed',
        amount: paymentData.amount,
        currency: paymentData.currency,
        gateway: 'applepay'
      };
    } catch (error) {
      logger.error('Apple Pay payment error:', error);
      throw new Error(`Apple Pay payment failed: ${error.message}`);
    }
  }

  /**
   * Google Pay payment processing
   */
  async googlePayPayment(paymentData) {
    try {
      // Google Pay integration would go here
      const transactionId = `googlepay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        transactionId,
        status: 'completed',
        amount: paymentData.amount,
        currency: paymentData.currency,
        gateway: 'googlepay'
      };
    } catch (error) {
      logger.error('Google Pay payment error:', error);
      throw new Error(`Google Pay payment failed: ${error.message}`);
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(subscriptionData) {
    try {
      const {
        customerId,
        planId,
        paymentMethod,
        metadata = {}
      } = subscriptionData;

      // Create Stripe subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: planId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata
      });

      // Store subscription record
      await this.storeSubscriptionRecord({
        subscriptionId: subscription.id,
        customerId,
        planId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        createdAt: new Date()
      });

      logger.info(`Subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      logger.error('Subscription creation error:', error);
      throw error;
    }
  }

  /**
   * Create payment plan (installments)
   */
  async createPaymentPlan(planData) {
    try {
      const {
        bookingId,
        totalAmount,
        installments,
        customerId,
        paymentMethod,
        description
      } = planData;

      const installmentAmount = Math.round((totalAmount / installments) * 100) / 100;
      const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create payment plan
      const paymentPlan = {
        planId,
        bookingId,
        customerId,
        totalAmount,
        installments,
        installmentAmount,
        remainingInstallments: installments,
        status: 'active',
        createdAt: new Date(),
        payments: []
      };

      // Store payment plan
      this.paymentPlans.set(planId, paymentPlan);
      await this.storePaymentPlanRecord(paymentPlan);

      // Process first installment
      const firstPayment = await this.processPayment({
        amount: installmentAmount,
        currency: 'USD',
        paymentMethod,
        customerId,
        bookingId,
        description: `${description} - Installment 1 of ${installments}`,
        metadata: { planId, installment: 1 }
      });

      // Update payment plan
      paymentPlan.payments.push({
        installment: 1,
        amount: installmentAmount,
        transactionId: firstPayment.transactionId,
        status: firstPayment.status,
        paidAt: new Date()
      });

      paymentPlan.remainingInstallments = installments - 1;
      this.paymentPlans.set(planId, paymentPlan);

      logger.info(`Payment plan created: ${planId}`);
      return paymentPlan;
    } catch (error) {
      logger.error('Payment plan creation error:', error);
      throw error;
    }
  }

  /**
   * Process installment payment
   */
  async processInstallment(planId, installment) {
    try {
      const plan = this.paymentPlans.get(planId);
      if (!plan) {
        throw new Error('Payment plan not found');
      }

      if (plan.remainingInstallments <= 0) {
        throw new Error('All installments have been paid');
      }

      // Process payment for this installment
      const payment = await this.processPayment({
        amount: plan.installmentAmount,
        currency: 'USD',
        paymentMethod: 'stripe', // Default to Stripe for installments
        customerId: plan.customerId,
        bookingId: plan.bookingId,
        description: `Installment ${installment} of ${plan.installments}`,
        metadata: { planId, installment }
      });

      // Update payment plan
      plan.payments.push({
        installment,
        amount: plan.installmentAmount,
        transactionId: payment.transactionId,
        status: payment.status,
        paidAt: new Date()
      });

      plan.remainingInstallments--;
      if (plan.remainingInstallments === 0) {
        plan.status = 'completed';
      }

      this.paymentPlans.set(planId, plan);
      await this.updatePaymentPlanRecord(plan);

      logger.info(`Installment ${installment} processed for plan ${planId}`);
      return payment;
    } catch (error) {
      logger.error('Installment processing error:', error);
      throw error;
    }
  }

  /**
   * Split payment across multiple methods
   */
  async processSplitPayment(splitData) {
    try {
      const { totalAmount, splits, customerId, bookingId, description } = splitData;

      // Validate splits
      const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0);
      if (Math.abs(totalSplitAmount - totalAmount) > 0.01) {
        throw new Error('Split amounts must equal total amount');
      }

      const results = [];

      // Process each split
      for (const split of splits) {
        const result = await this.processPayment({
          amount: split.amount,
          currency: split.currency || 'USD',
          paymentMethod: split.paymentMethod,
          customerId,
          bookingId,
          description: `${description} - ${split.paymentMethod} payment`,
          metadata: { splitId: split.id, totalSplits: splits.length }
        });

        results.push({
          splitId: split.id,
          paymentMethod: split.paymentMethod,
          amount: split.amount,
          result
        });
      }

      logger.info(`Split payment processed: ${results.length} splits`);
      return results;
    } catch (error) {
      logger.error('Split payment error:', error);
      throw error;
    }
  }

  /**
   * Generate invoice
   */
  async generateInvoice(invoiceData) {
    try {
      const {
        customerId,
        bookingId,
        items,
        taxRate = 0,
        currency = 'USD'
      } = invoiceData;

      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      const invoice = {
        invoiceId: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customerId,
        bookingId,
        items,
        subtotal,
        taxRate,
        taxAmount,
        total,
        currency,
        status: 'pending',
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };

      // Store invoice
      await this.storeInvoiceRecord(invoice);

      logger.info(`Invoice generated: ${invoice.invoiceId}`);
      return invoice;
    } catch (error) {
      logger.error('Invoice generation error:', error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(refundData) {
    try {
      const { transactionId, amount, reason, metadata = {} } = refundData;

      // Process refund through Stripe
      const refund = await stripe.refunds.create({
        payment_intent: transactionId,
        amount: Math.round(amount * 100), // Convert to cents
        reason: reason || 'requested_by_customer',
        metadata
      });

      // Store refund record
      await this.storeRefundRecord({
        refundId: refund.id,
        transactionId,
        amount,
        reason,
        status: refund.status,
        createdAt: new Date()
      });

      logger.info(`Refund processed: ${refund.id}`);
      return refund;
    } catch (error) {
      logger.error('Refund processing error:', error);
      throw error;
    }
  }

  /**
   * Validate payment data
   */
  validatePaymentData(paymentData) {
    const { amount, currency, paymentMethod, customerId } = paymentData;

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!currency) {
      throw new Error('Currency is required');
    }

    if (!paymentMethod) {
      throw new Error('Payment method is required');
    }

    if (!customerId) {
      throw new Error('Customer ID is required');
    }
  }

  /**
   * Store payment record
   */
  async storePaymentRecord(paymentRecord) {
    try {
      const redisClient = getRedisClient();
      if (redisClient) {
        await redisClient.hset('payments', paymentRecord.transactionId, JSON.stringify(paymentRecord));
        await redisClient.expire('payments', 7 * 24 * 60 * 60); // 7 days
      }
    } catch (error) {
      logger.error('Error storing payment record:', error);
    }
  }

  /**
   * Store subscription record
   */
  async storeSubscriptionRecord(subscriptionRecord) {
    try {
      const redisClient = getRedisClient();
      if (redisClient) {
        await redisClient.hset('subscriptions', subscriptionRecord.subscriptionId, JSON.stringify(subscriptionRecord));
        await redisClient.expire('subscriptions', 30 * 24 * 60 * 60); // 30 days
      }
    } catch (error) {
      logger.error('Error storing subscription record:', error);
    }
  }

  /**
   * Store payment plan record
   */
  async storePaymentPlanRecord(paymentPlan) {
    try {
      const redisClient = getRedisClient();
      if (redisClient) {
        await redisClient.hset('payment_plans', paymentPlan.planId, JSON.stringify(paymentPlan));
        await redisClient.expire('payment_plans', 30 * 24 * 60 * 60); // 30 days
      }
    } catch (error) {
      logger.error('Error storing payment plan record:', error);
    }
  }

  /**
   * Update payment plan record
   */
  async updatePaymentPlanRecord(paymentPlan) {
    try {
      const redisClient = getRedisClient();
      if (redisClient) {
        await redisClient.hset('payment_plans', paymentPlan.planId, JSON.stringify(paymentPlan));
      }
    } catch (error) {
      logger.error('Error updating payment plan record:', error);
    }
  }

  /**
   * Store invoice record
   */
  async storeInvoiceRecord(invoice) {
    try {
      const redisClient = getRedisClient();
      if (redisClient) {
        await redisClient.hset('invoices', invoice.invoiceId, JSON.stringify(invoice));
        await redisClient.expire('invoices', 30 * 24 * 60 * 60); // 30 days
      }
    } catch (error) {
      logger.error('Error storing invoice record:', error);
    }
  }

  /**
   * Store refund record
   */
  async storeRefundRecord(refund) {
    try {
      const redisClient = getRedisClient();
      if (redisClient) {
        await redisClient.hset('refunds', refund.refundId, JSON.stringify(refund));
        await redisClient.expire('refunds', 7 * 24 * 60 * 60); // 7 days
      }
    } catch (error) {
      logger.error('Error storing refund record:', error);
    }
  }

  /**
   * Send payment notification
   */
  async sendPaymentNotification(customerId, paymentResult) {
    try {
      // This would integrate with the notification service
      logger.info(`Payment notification sent to customer ${customerId}`);
    } catch (error) {
      logger.error('Error sending payment notification:', error);
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics() {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) return {};

      const payments = await redisClient.hgetall('payments');
      const subscriptions = await redisClient.hgetall('subscriptions');
      const paymentPlans = await redisClient.hgetall('payment_plans');

      const totalPayments = Object.keys(payments).length;
      const totalSubscriptions = Object.keys(subscriptions).length;
      const totalPaymentPlans = Object.keys(paymentPlans).length;

      return {
        totalPayments,
        totalSubscriptions,
        totalPaymentPlans,
        activePaymentPlans: totalPaymentPlans
      };
    } catch (error) {
      logger.error('Error getting payment statistics:', error);
      return {};
    }
  }
}

module.exports = new AdvancedPaymentService();
