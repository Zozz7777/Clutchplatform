const { logger } = require('../config/logger');
const corporateAccount = require('../models/corporateAccount');
const Fleet = require('../models/Fleet');
const userService = require('./userService');
const databaseUtils = require('../utils/databaseUtils');
const Subscription = require('../models/subscription');
const PaymentPlan = require('../models/paymentPlan');

class B2BService {
  constructor() {
    this.tenantCache = new Map();
    this.enterpriseFeatures = new Map();
    this.integrationProviders = new Map();
  }

  // Initialize B2B service
  async initialize() {
    try {
      await this.loadTenants();
      await this.initializeEnterpriseFeatures();
      await this.initializeIntegrations();
      logger.info('✅ B2B service initialized');
    } catch (error) {
      logger.error('❌ B2B service initialization failed:', error);
    }
  }

  // Create corporate account
  async createCorporateAccount(accountData) {
    try {
      const account = new corporateAccount({
        ...accountData,
        status: 'pending_approval',
        createdAt: new Date(),
        settings: {
          maxUsers: accountData.maxUsers || 10,
          maxVehicles: accountData.maxVehicles || 50,
          features: accountData.features || ['fleet_management', 'analytics'],
          customBranding: accountData.customBranding || false,
          apiAccess: accountData.apiAccess || false
        }
      });

      await account.save();

      // Create default admin user
      await this.createCorporateAdmin(account._id, accountData.adminUser);

      logger.info(`✅ Corporate account created: ${account.accountId}`);
      return account;
    } catch (error) {
      logger.error('❌ Error creating corporate account:', error);
      throw new Error('Failed to create corporate account');
    }
  }

  // Create corporate admin user
  async createCorporateAdmin(accountId, adminData) {
    try {
      const admin = new User({
        ...adminData,
        role: 'corporate_admin',
        corporateAccountId: accountId,
        isActive: true,
        isVerified: true,
        createdAt: new Date()
      });

      await admin.save();

      logger.info(`✅ Corporate admin created: ${admin._id}`);
      return admin;
    } catch (error) {
      logger.error('❌ Error creating corporate admin:', error);
      throw new Error('Failed to create corporate admin');
    }
  }

  // Get corporate account
  async getCorporateAccount(accountId) {
    try {
      const account = await corporateAccount.findOne({ accountId })
        .populate('adminUsers')
        .populate('fleets')
        .populate('subscriptions');

      if (!account) {
        throw new Error('Corporate account not found');
      }

      return account;
    } catch (error) {
      logger.error('❌ Error fetching corporate account:', error);
      throw new Error('Failed to fetch corporate account');
    }
  }

  // Update corporate account
  async updateCorporateAccount(accountId, updateData) {
    try {
      const account = await corporateAccount.findOneAndUpdate(
        { accountId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );

      if (!account) {
        throw new Error('Corporate account not found');
      }

      logger.info(`✅ Corporate account updated: ${accountId}`);
      return account;
    } catch (error) {
      logger.error('❌ Error updating corporate account:', error);
      throw new Error('Failed to update corporate account');
    }
  }

  // Approve corporate account
  async approveCorporateAccount(accountId) {
    try {
      const account = await corporateAccount.findOne({ accountId });
      if (!account) {
        throw new Error('Corporate account not found');
      }

      account.status = 'active';
      account.approvedAt = new Date();
      account.approvedBy = 'system'; // This would be the admin who approved
      await account.save();

      // Send approval notification
      await this.sendApprovalNotification(account);

      logger.info(`✅ Corporate account approved: ${accountId}`);
      return account;
    } catch (error) {
      logger.error('❌ Error approving corporate account:', error);
      throw new Error('Failed to approve corporate account');
    }
  }

  // Add user to corporate account
  async addUserToCorporateAccount(accountId, userData) {
    try {
      const account = await corporateAccount.findOne({ accountId });
      if (!account) {
        throw new Error('Corporate account not found');
      }

      // Check user limit
      const currentUserCount = await User.countDocuments({ corporateAccountId: account._id });
      if (currentUserCount >= account.settings.maxUsers) {
        throw new Error('User limit reached for this corporate account');
      }

      const user = new User({
        ...userData,
        corporateAccountId: account._id,
        role: userData.role || 'employee',
        isActive: true,
        createdAt: new Date()
      });

      await user.save();

      // Add to account's user list
      account.users.push(user._id);
      await account.save();

      logger.info(`✅ User added to corporate account: ${user._id}`);
      return user;
    } catch (error) {
      logger.error('❌ Error adding user to corporate account:', error);
      throw new Error('Failed to add user to corporate account');
    }
  }

  // Remove user from corporate account
  async removeUserFromCorporateAccount(accountId, userId) {
    try {
      const account = await corporateAccount.findOne({ accountId });
      if (!account) {
        throw new Error('Corporate account not found');
      }

      const user = await User.findById(userId);
      if (!user || user.corporateAccountId.toString() !== account._id.toString()) {
        throw new Error('User not found in corporate account');
      }

      // Remove user from account
      account.users = account.users.filter(id => id.toString() !== userId);
      await account.save();

      // Update user
      user.corporateAccountId = null;
      user.role = 'user';
      await user.save();

      logger.info(`✅ User removed from corporate account: ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error('❌ Error removing user from corporate account:', error);
      throw new Error('Failed to remove user from corporate account');
    }
  }

  // Create fleet for corporate account
  async createCorporateFleet(accountId, fleetData) {
    try {
      const account = await corporateAccount.findOne({ accountId });
      if (!account) {
        throw new Error('Corporate account not found');
      }

      // Check fleet limit
      const currentFleetCount = await Fleet.countDocuments({ corporateAccountId: account._id });
      if (currentFleetCount >= account.settings.maxVehicles) {
        throw new Error('Fleet limit reached for this corporate account');
      }

      const fleet = new Fleet({
        ...fleetData,
        corporateAccountId: account._id,
        status: 'active',
        createdAt: new Date()
      });

      await fleet.save();

      // Add to account's fleet list
      account.fleets.push(fleet._id);
      await account.save();

      logger.info(`✅ Corporate fleet created: ${fleet.fleetId}`);
      return fleet;
    } catch (error) {
      logger.error('❌ Error creating corporate fleet:', error);
      throw new Error('Failed to create corporate fleet');
    }
  }

  // Get corporate account analytics
  async getCorporateAnalytics(accountId, period = 'month') {
    try {
      const account = await corporateAccount.findOne({ accountId });
      if (!account) {
        throw new Error('Corporate account not found');
      }

      const startDate = this.getPeriodStartDate(period);

      const analytics = {
        accountOverview: await this.getAccountOverview(account, startDate),
        userMetrics: await this.getUserMetrics(account._id, startDate),
        fleetMetrics: await this.getFleetMetrics(account._id, startDate),
        financialMetrics: await this.getFinancialMetrics(account._id, startDate),
        usageMetrics: await this.getUsageMetrics(account._id, startDate)
      };

      logger.info(`✅ Corporate analytics generated: ${accountId}`);
      return analytics;
    } catch (error) {
      logger.error('❌ Error generating corporate analytics:', error);
      throw new Error('Failed to generate corporate analytics');
    }
  }

  // White-label branding
  async updateWhiteLabelBranding(accountId, brandingData) {
    try {
      const account = await corporateAccount.findOne({ accountId });
      if (!account) {
        throw new Error('Corporate account not found');
      }

      if (!account.settings.customBranding) {
        throw new Error('Custom branding not enabled for this account');
      }

      const branding = {
        logo: brandingData.logo,
        primaryColor: brandingData.primaryColor || '#DC2626',
        secondaryColor: brandingData.secondaryColor || '#3B82F6',
        companyName: brandingData.companyName,
        domain: brandingData.domain,
        customCSS: brandingData.customCSS,
        updatedAt: new Date()
      };

      account.branding = branding;
      await account.save();

      // Update cache
      this.tenantCache.set(accountId, account);

      logger.info(`✅ White-label branding updated: ${accountId}`);
      return branding;
    } catch (error) {
      logger.error('❌ Error updating white-label branding:', error);
      throw new Error('Failed to update white-label branding');
    }
  }

  // Enterprise API integration
  async createAPIKey(accountId, keyData) {
    try {
      const account = await corporateAccount.findOne({ accountId });
      if (!account) {
        throw new Error('Corporate account not found');
      }

      if (!account.settings.apiAccess) {
        throw new Error('API access not enabled for this account');
      }

      const apiKey = {
        keyId: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: keyData.name,
        permissions: keyData.permissions || ['read'],
        expiresAt: keyData.expiresAt,
        createdAt: new Date(),
        lastUsed: null
      };

      account.apiKeys = account.apiKeys || [];
      account.apiKeys.push(apiKey);
      await account.save();

      logger.info(`✅ API key created: ${apiKey.keyId}`);
      return apiKey;
    } catch (error) {
      logger.error('❌ Error creating API key:', error);
      throw new Error('Failed to create API key');
    }
  }

  // Webhook management
  async createWebhook(accountId, webhookData) {
    try {
      const account = await corporateAccount.findOne({ accountId });
      if (!account) {
        throw new Error('Corporate account not found');
      }

      const webhook = {
        webhookId: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: webhookData.url,
        events: webhookData.events || ['booking.created', 'payment.completed'],
        secret: this.generateWebhookSecret(),
        isActive: true,
        createdAt: new Date(),
        lastTriggered: null
      };

      account.webhooks = account.webhooks || [];
      account.webhooks.push(webhook);
      await account.save();

      logger.info(`✅ Webhook created: ${webhook.webhookId}`);
      return webhook;
    } catch (error) {
      logger.error('❌ Error creating webhook:', error);
      throw new Error('Failed to create webhook');
    }
  }

  // Multi-tenant data isolation
  async getTenantData(accountId, dataType, filters = {}) {
    try {
      const account = await corporateAccount.findOne({ accountId });
      if (!account) {
        throw new Error('Corporate account not found');
      }

      let query = { corporateAccountId: account._id };

      switch (dataType) {
        case 'users':
          return await User.find({ ...query, ...filters });
        case 'fleets':
          return await Fleet.find({ ...query, ...filters });
        case 'bookings':
          return await require('../models/Booking').find({ ...query, ...filters });
        case 'payments':
          return await Payment.find({ ...query, ...filters });
        default:
          throw new Error('Unsupported data type');
      }
    } catch (error) {
      logger.error('❌ Error fetching tenant data:', error);
      throw new Error('Failed to fetch tenant data');
    }
  }

  // Enterprise subscription management
  async createEnterpriseSubscription(accountId, subscriptionData) {
    try {
      const account = await corporateAccount.findOne({ accountId });
      if (!account) {
        throw new Error('Corporate account not found');
      }

      const plan = await PaymentPlan.findById(subscriptionData.planId);
      if (!plan) {
        throw new Error('Payment plan not found');
      }

      const subscription = new Subscription({
        corporateAccountId: account._id,
        planId: subscriptionData.planId,
        amount: plan.amount * (subscriptionData.userCount || 1),
        currency: plan.currency,
        paymentMethod: subscriptionData.paymentMethod,
        paymentMethodId: subscriptionData.paymentMethodId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: plan.getNextBillingDate(),
        nextBillingDate: plan.getNextBillingDate(),
        metadata: {
          userCount: subscriptionData.userCount,
          enterpriseFeatures: subscriptionData.features
        }
      });

      await subscription.save();

      // Add to account's subscriptions
      account.subscriptions.push(subscription._id);
      await account.save();

      logger.info(`✅ Enterprise subscription created: ${subscription.subscriptionId}`);
      return subscription;
    } catch (error) {
      logger.error('❌ Error creating enterprise subscription:', error);
      throw new Error('Failed to create enterprise subscription');
    }
  }

  // Helper methods
  async loadTenants() {
    try {
      const accounts = await corporateAccount.find({ status: 'active' });
      accounts.forEach(account => {
        this.tenantCache.set(account.accountId, account);
      });
      logger.info(`✅ Loaded ${accounts.length} tenants to cache`);
    } catch (error) {
      logger.error('❌ Error loading tenants:', error);
    }
  }

  async initializeEnterpriseFeatures() {
    this.enterpriseFeatures.set('fleet_management', {
      name: 'Fleet Management',
      description: 'Advanced fleet tracking and management',
      enabled: true
    });
    this.enterpriseFeatures.set('analytics', {
      name: 'Advanced Analytics',
      description: 'Comprehensive business intelligence',
      enabled: true
    });
    this.enterpriseFeatures.set('white_label', {
      name: 'White Label',
      description: 'Custom branding and domain',
      enabled: true
    });
    this.enterpriseFeatures.set('api_access', {
      name: 'API Access',
      description: 'REST API and webhook integration',
      enabled: true
    });
    this.enterpriseFeatures.set('multi_tenant', {
      name: 'Multi-Tenant',
      description: 'Isolated data and user management',
      enabled: true
    });
  }

  async initializeIntegrations() {
    this.integrationProviders.set('erp', {
      name: 'ERP Integration',
      providers: ['sap', 'oracle', 'netsuite'],
      enabled: true
    });
    this.integrationProviders.set('crm', {
      name: 'CRM Integration',
      providers: ['salesforce', 'hubspot', 'zoho'],
      enabled: true
    });
    this.integrationProviders.set('accounting', {
      name: 'Accounting Integration',
      providers: ['quickbooks', 'xero', 'sage'],
      enabled: true
    });
  }

  async sendApprovalNotification(account) {
    // Send approval notification to admin
    logger.info(`📧 Approval notification sent for account: ${account.accountId}`);
  }

  generateWebhookSecret() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  getPeriodStartDate(period) {
    const now = new Date();
    switch (period) {
      case 'week': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month': return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter': return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      case 'year': return new Date(now.getFullYear(), 0, 1);
      default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  async getAccountOverview(account, startDate) {
    return {
      totalUsers: await User.countDocuments({ corporateAccountId: account._id }),
      totalFleets: await Fleet.countDocuments({ corporateAccountId: account._id }),
      activeSubscriptions: account.subscriptions.length,
      accountAge: Math.floor((new Date() - account.createdAt) / (1000 * 60 * 60 * 24))
    };
  }

  async getUserMetrics(accountId, startDate) {
    const users = await User.find({ 
      corporateAccountId: accountId,
      createdAt: { $gte: startDate }
    });

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      newUsers: users.filter(u => u.createdAt >= startDate).length,
      userRoles: this.groupByRole(users)
    };
  }

  async getFleetMetrics(accountId, startDate) {
    const fleets = await Fleet.find({ 
      corporateAccountId: accountId,
      createdAt: { $gte: startDate }
    });

    return {
      totalFleets: fleets.length,
      activeFleets: fleets.filter(f => f.status === 'active').length,
      totalVehicles: fleets.reduce((sum, f) => sum + (f.vehicleCount || 0), 0)
    };
  }

  async getFinancialMetrics(accountId, startDate) {
    const subscriptions = await Subscription.find({
      corporateAccountId: accountId,
      createdAt: { $gte: startDate }
    });

    return {
      totalRevenue: subscriptions.reduce((sum, s) => sum + s.amount, 0),
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      averageSubscriptionValue: subscriptions.length > 0 ? 
        subscriptions.reduce((sum, s) => sum + s.amount, 0) / subscriptions.length : 0
    };
  }

  async getUsageMetrics(accountId, startDate) {
    // This would integrate with actual usage tracking
    return {
      apiCalls: 0,
      dataTransfer: 0,
      storageUsed: 0
    };
  }

  groupByRole(users) {
    const roles = {};
    users.forEach(user => {
      roles[user.role] = (roles[user.role] || 0) + 1;
    });
    return roles;
  }
}

module.exports = new B2BService();
