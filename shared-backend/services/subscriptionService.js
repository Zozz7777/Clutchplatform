const { logger } = require('../config/logger');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Subscription Service
 * Manages subscription plans and recurring billing
 */
class SubscriptionService {
  constructor() {
    this.subscriptionPlans = new Map();
    this.initializeSubscriptionPlans();
  }

  /**
   * Initialize subscription plans
   */
  initializeSubscriptionPlans() {
    // Basic Plan
    this.subscriptionPlans.set('basic', {
      id: 'basic',
      name: 'Basic Maintenance',
      description: 'Essential maintenance services',
      price: 29.99,
      interval: 'monthly',
      features: [
        'Oil change reminders',
        'Basic maintenance scheduling',
        'Service history tracking',
        'Emergency roadside assistance'
      ],
      limits: {
        servicesPerMonth: 2,
        emergencyCalls: 1,
        prioritySupport: false
      }
    });

    // Premium Plan
    this.subscriptionPlans.set('premium', {
      id: 'premium',
      name: 'Premium Care',
      description: 'Comprehensive automotive care',
      price: 79.99,
      interval: 'monthly',
      features: [
        'All Basic features',
        'Priority booking',
        'Unlimited service scheduling',
        '24/7 roadside assistance',
        'Vehicle health monitoring',
        'Predictive maintenance alerts',
        'Priority customer support'
      ],
      limits: {
        servicesPerMonth: 5,
        emergencyCalls: 3,
        prioritySupport: true
      }
    });

    // Enterprise Plan
    this.subscriptionPlans.set('enterprise', {
      id: 'enterprise',
      name: 'Enterprise Fleet',
      description: 'Fleet management and maintenance',
      price: 199.99,
      interval: 'monthly',
      features: [
        'All Premium features',
        'Fleet management dashboard',
        'Bulk service scheduling',
        'Custom maintenance plans',
        'Advanced analytics',
        'Dedicated account manager',
        'API access'
      ],
      limits: {
        servicesPerMonth: 20,
        emergencyCalls: 10,
        prioritySupport: true,
        vehicles: 10
      }
    });
  }

  /**
   * Create a new subscription
   */
  async createSubscription(subscriptionData) {
    try {
      const {
        userId,
        planId,
        paymentMethodId,
        startDate,
        endDate,
        autoRenew = true
      } = subscriptionData;

      // Validate plan
      const plan = this.subscriptionPlans.get(planId);
      if (!plan) {
        throw new Error('Invalid subscription plan');
      }

      // Create Stripe subscription
      const stripeSubscription = await stripe.subscriptions.create({
        customer: await this.getOrCreateStripeCustomer(userId),
        items: [{ price: await this.getStripePriceId(planId) }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          planId,
          autoRenew: autoRenew.toString()
        }
      });

      // Create subscription in database
      const subscription = {
        id: stripeSubscription.id,
        userId,
        planId,
        planDetails: plan,
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        startDate: startDate || new Date(),
        endDate: endDate || null,
        autoRenew,
        paymentMethodId,
        stripeCustomerId: stripeSubscription.customer,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const dbService = require('./databaseService');
      await dbService.create('subscriptions', subscription);

      logger.info(`Subscription created for user ${userId}: ${planId}`);
      return subscription;
    } catch (error) {
      logger.error('Subscription creation error:', error);
      throw error;
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId) {
    try {
      const dbService = require('./databaseService');
      const subscription = await dbService.findOne('subscriptions', { id: subscriptionId });
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      return subscription;
    } catch (error) {
      logger.error('Get subscription error:', error);
      throw error;
    }
  }

  /**
   * Get user's active subscription
   */
  async getUserSubscription(userId) {
    try {
      const dbService = require('./databaseService');
      const subscription = await dbService.findOne('subscriptions', {
        userId,
        status: { $in: ['active', 'trialing'] }
      });

      return subscription;
    } catch (error) {
      logger.error('Get user subscription error:', error);
      throw error;
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId, updateData) {
    try {
      const { planId, autoRenew, endDate } = updateData;

      // Get current subscription
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Update in Stripe if plan is changing
      if (planId && planId !== subscription.planId) {
        const newPlan = this.subscriptionPlans.get(planId);
        if (!newPlan) {
          throw new Error('Invalid subscription plan');
        }

        await stripe.subscriptions.update(subscriptionId, {
          items: [{
            id: subscription.stripeSubscriptionId,
            price: await this.getStripePriceId(planId)
          }],
          metadata: {
            ...subscription.metadata,
            planId
          }
        });
      }

      // Update in database
      const updateFields = {
        updatedAt: new Date()
      };

      if (planId) {
        updateFields.planId = planId;
        updateFields.planDetails = this.subscriptionPlans.get(planId);
      }
      if (autoRenew !== undefined) updateFields.autoRenew = autoRenew;
      if (endDate) updateFields.endDate = endDate;

      const dbService = require('./databaseService');
      await dbService.updateOne('subscriptions', { id: subscriptionId }, updateFields);

      logger.info(`Subscription ${subscriptionId} updated`);
      return await this.getSubscription(subscriptionId);
    } catch (error) {
      logger.error('Update subscription error:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (cancelAtPeriodEnd) {
        // Cancel at period end
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });

        const dbService = require('./databaseService');
        await dbService.updateOne('subscriptions', { id: subscriptionId }, {
          status: 'canceled',
          canceledAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Cancel immediately
        await stripe.subscriptions.cancel(subscriptionId);

        const dbService = require('./databaseService');
        await dbService.updateOne('subscriptions', { id: subscriptionId }, {
          status: 'canceled',
          canceledAt: new Date(),
          updatedAt: new Date()
        });
      }

      logger.info(`Subscription ${subscriptionId} canceled`);
      return await this.getSubscription(subscriptionId);
    } catch (error) {
      logger.error('Cancel subscription error:', error);
      throw error;
    }
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(subscriptionId) {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (subscription.status !== 'canceled') {
        throw new Error('Subscription is not canceled');
      }

      // Reactivate in Stripe
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      });

      // Update in database
      const dbService = require('./databaseService');
      await dbService.updateOne('subscriptions', { id: subscriptionId }, {
        status: 'active',
        canceledAt: null,
        updatedAt: new Date()
      });

      logger.info(`Subscription ${subscriptionId} reactivated`);
      return await this.getSubscription(subscriptionId);
    } catch (error) {
      logger.error('Reactivate subscription error:', error);
      throw error;
    }
  }

  /**
   * Get subscription usage
   */
  async getSubscriptionUsage(subscriptionId) {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const plan = subscription.planDetails;
      const currentPeriodStart = subscription.currentPeriodStart;
      const currentPeriodEnd = subscription.currentPeriodEnd;

      // Get usage data from database
      const dbService = require('./databaseService');
      const servicesUsed = await dbService.count('bookings', {
        userId: subscription.userId,
        createdAt: {
          $gte: currentPeriodStart,
          $lte: currentPeriodEnd
        },
        status: { $in: ['completed', 'in_progress'] }
      });

      const emergencyCallsUsed = await dbService.count('emergency_calls', {
        userId: subscription.userId,
        createdAt: {
          $gte: currentPeriodStart,
          $lte: currentPeriodEnd
        }
      });

      return {
        subscriptionId,
        planId: subscription.planId,
        currentPeriod: {
          start: currentPeriodStart,
          end: currentPeriodEnd
        },
        usage: {
          servicesUsed,
          servicesLimit: plan.limits.servicesPerMonth,
          servicesRemaining: Math.max(0, plan.limits.servicesPerMonth - servicesUsed),
          emergencyCallsUsed,
          emergencyCallsLimit: plan.limits.emergencyCalls,
          emergencyCallsRemaining: Math.max(0, plan.limits.emergencyCalls - emergencyCallsUsed)
        },
        limits: plan.limits
      };
    } catch (error) {
      logger.error('Get subscription usage error:', error);
      throw error;
    }
  }

  /**
   * Check if user can use service
   */
  async canUseService(userId, serviceType) {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        return { canUse: false, reason: 'No active subscription' };
      }

      const usage = await this.getSubscriptionUsage(subscription.id);
      
      if (serviceType === 'emergency' && usage.usage.emergencyCallsRemaining <= 0) {
        return { canUse: false, reason: 'Emergency call limit reached' };
      }

      if (serviceType === 'regular' && usage.usage.servicesRemaining <= 0) {
        return { canUse: false, reason: 'Service limit reached' };
      }

      return { canUse: true, usage };
    } catch (error) {
      logger.error('Check service usage error:', error);
      return { canUse: false, reason: 'Error checking usage' };
    }
  }

  /**
   * Get available subscription plans
   */
  getAvailablePlans() {
    return Array.from(this.subscriptionPlans.values());
  }

  /**
   * Get plan by ID
   */
  getPlan(planId) {
    return this.subscriptionPlans.get(planId);
  }

  /**
   * Add custom plan
   */
  addCustomPlan(planData) {
    const { id, name, description, price, interval, features, limits } = planData;
    
    this.subscriptionPlans.set(id, {
      id,
      name,
      description,
      price,
      interval,
      features,
      limits
    });

    logger.info(`Custom plan added: ${id}`);
  }

  /**
   * Get or create Stripe customer
   */
  async getOrCreateStripeCustomer(userId) {
    try {
      const dbService = require('./databaseService');
      const user = await dbService.findOne('users', { _id: userId });
      
      if (!user) {
        throw new Error('User not found');
      }

      if (user.stripeCustomerId) {
        return user.stripeCustomerId;
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phoneNumber,
        metadata: {
          userId: userId.toString()
        }
      });

      // Update user with Stripe customer ID
      await dbService.updateOne('users', { _id: userId }, {
        stripeCustomerId: customer.id
      });

      return customer.id;
    } catch (error) {
      logger.error('Get or create Stripe customer error:', error);
      throw error;
    }
  }

  /**
   * Get Stripe price ID for plan
   */
  async getStripePriceId(planId) {
    // In production, you would store these price IDs in your database
    const priceIds = {
      'basic': process.env.STRIPE_BASIC_PRICE_ID,
      'premium': process.env.STRIPE_PREMIUM_PRICE_ID,
      'enterprise': process.env.STRIPE_ENTERPRISE_PRICE_ID
    };

    return priceIds[planId];
  }

  /**
   * Process webhook events
   */
  async processWebhookEvent(event) {
    try {
      const { type, data } = event;

      switch (type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(data.object);
          break;
        default:
          logger.info(`Unhandled webhook event: ${type}`);
      }
    } catch (error) {
      logger.error('Process webhook event error:', error);
      throw error;
    }
  }

  /**
   * Handle subscription created event
   */
  async handleSubscriptionCreated(subscription) {
    logger.info(`Subscription created: ${subscription.id}`);
    // Additional logic for subscription creation
  }

  /**
   * Handle subscription updated event
   */
  async handleSubscriptionUpdated(subscription) {
    logger.info(`Subscription updated: ${subscription.id}`);
    
    const dbService = require('./databaseService');
    await dbService.updateOne('subscriptions', { id: subscription.id }, {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date()
    });
  }

  /**
   * Handle subscription deleted event
   */
  async handleSubscriptionDeleted(subscription) {
    logger.info(`Subscription deleted: ${subscription.id}`);
    
    const dbService = require('./databaseService');
    await dbService.updateOne('subscriptions', { id: subscription.id }, {
      status: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date()
    });
  }

  /**
   * Handle payment succeeded event
   */
  async handlePaymentSucceeded(invoice) {
    logger.info(`Payment succeeded for invoice: ${invoice.id}`);
    // Additional logic for successful payment
  }

  /**
   * Handle payment failed event
   */
  async handlePaymentFailed(invoice) {
    logger.info(`Payment failed for invoice: ${invoice.id}`);
    // Additional logic for failed payment
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats() {
    try {
      const dbService = require('./databaseService');
      
      const totalSubscriptions = await dbService.count('subscriptions', {});
      const activeSubscriptions = await dbService.count('subscriptions', { status: 'active' });
      const canceledSubscriptions = await dbService.count('subscriptions', { status: 'canceled' });

      const planStats = await dbService.aggregate('subscriptions', [
        { $group: { _id: '$planId', count: { $sum: 1 } } }
      ]);

      return {
        total: totalSubscriptions,
        active: activeSubscriptions,
        canceled: canceledSubscriptions,
        planDistribution: planStats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Get subscription stats error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const subscriptionService = new SubscriptionService();

module.exports = subscriptionService;
