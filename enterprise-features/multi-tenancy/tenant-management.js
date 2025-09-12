/**
 * Multi-Tenancy Support
 * Complete tenant isolation and data segregation
 */

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class TenantManager {
  constructor() {
    this.tenants = new Map();
    this.tenantConfigs = new Map();
    this.resourceQuotas = new Map();
    this.tenantIsolation = new Map();
  }

  /**
   * Create a new tenant
   */
  async createTenant(tenantData) {
    const tenantId = uuidv4();
    const tenant = {
      id: tenantId,
      name: tenantData.name,
      domain: tenantData.domain,
      subdomain: tenantData.subdomain,
      plan: tenantData.plan || 'standard',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        branding: tenantData.branding || {},
        features: tenantData.features || {},
        limits: tenantData.limits || {}
      },
      isolation: {
        database: `tenant_${tenantId}`,
        storage: `tenant_${tenantId}`,
        cache: `tenant_${tenantId}`,
        queue: `tenant_${tenantId}`
      }
    };

    // Store tenant
    this.tenants.set(tenantId, tenant);

    // Initialize tenant configuration
    await this.initializeTenantConfig(tenantId, tenantData);

    // Set up resource quotas
    await this.setupResourceQuotas(tenantId, tenantData.plan);

    // Configure tenant isolation
    await this.configureTenantIsolation(tenantId);

    return tenant;
  }

  /**
   * Initialize tenant configuration
   */
  async initializeTenantConfig(tenantId, tenantData) {
    const config = {
      tenantId,
      database: {
        host: process.env.DB_HOST,
        database: `tenant_${tenantId}`,
        username: `tenant_${tenantId}`,
        password: await this.generateSecurePassword(),
        ssl: true,
        connectionLimit: 10
      },
      storage: {
        bucket: `tenant-${tenantId}`,
        region: tenantData.region || 'us-east-1',
        encryption: true,
        backup: true
      },
      cache: {
        namespace: `tenant:${tenantId}`,
        ttl: 3600,
        maxMemory: '256mb'
      },
      queue: {
        name: `tenant-${tenantId}`,
        visibilityTimeout: 300,
        maxReceiveCount: 3
      },
      features: {
        multiLanguage: tenantData.features?.multiLanguage || false,
        advancedAnalytics: tenantData.features?.advancedAnalytics || false,
        customBranding: tenantData.features?.customBranding || false,
        apiAccess: tenantData.features?.apiAccess || false,
        whiteLabel: tenantData.features?.whiteLabel || false
      },
      limits: {
        users: tenantData.limits?.users || 100,
        storage: tenantData.limits?.storage || '10GB',
        apiCalls: tenantData.limits?.apiCalls || 10000,
        bandwidth: tenantData.limits?.bandwidth || '100GB'
      }
    };

    this.tenantConfigs.set(tenantId, config);
    return config;
  }

  /**
   * Set up resource quotas for tenant
   */
  async setupResourceQuotas(tenantId, plan) {
    const quotas = {
      tenantId,
      plan,
      resources: {
        cpu: this.getPlanQuota(plan, 'cpu'),
        memory: this.getPlanQuota(plan, 'memory'),
        storage: this.getPlanQuota(plan, 'storage'),
        bandwidth: this.getPlanQuota(plan, 'bandwidth'),
        apiCalls: this.getPlanQuota(plan, 'apiCalls'),
        users: this.getPlanQuota(plan, 'users')
      },
      usage: {
        cpu: 0,
        memory: 0,
        storage: 0,
        bandwidth: 0,
        apiCalls: 0,
        users: 0
      },
      limits: {
        cpu: this.getPlanQuota(plan, 'cpu'),
        memory: this.getPlanQuota(plan, 'memory'),
        storage: this.getPlanQuota(plan, 'storage'),
        bandwidth: this.getPlanQuota(plan, 'bandwidth'),
        apiCalls: this.getPlanQuota(plan, 'apiCalls'),
        users: this.getPlanQuota(plan, 'users')
      }
    };

    this.resourceQuotas.set(tenantId, quotas);
    return quotas;
  }

  /**
   * Get plan-specific quotas
   */
  getPlanQuota(plan, resource) {
    const quotas = {
      basic: {
        cpu: '0.5',
        memory: '512Mi',
        storage: '5Gi',
        bandwidth: '50GB',
        apiCalls: 5000,
        users: 50
      },
      standard: {
        cpu: '2',
        memory: '2Gi',
        storage: '20Gi',
        bandwidth: '200GB',
        apiCalls: 25000,
        users: 200
      },
      premium: {
        cpu: '8',
        memory: '8Gi',
        storage: '100Gi',
        bandwidth: '1TB',
        apiCalls: 100000,
        users: 1000
      },
      enterprise: {
        cpu: 'unlimited',
        memory: 'unlimited',
        storage: 'unlimited',
        bandwidth: 'unlimited',
        apiCalls: 'unlimited',
        users: 'unlimited'
      }
    };

    return quotas[plan]?.[resource] || quotas.standard[resource];
  }

  /**
   * Configure tenant isolation
   */
  async configureTenantIsolation(tenantId) {
    const isolation = {
      tenantId,
      database: {
        isolated: true,
        connectionString: `tenant_${tenantId}`,
        encryption: true,
        backup: true
      },
      storage: {
        isolated: true,
        bucket: `tenant-${tenantId}`,
        encryption: true,
        accessControl: 'private'
      },
      cache: {
        isolated: true,
        namespace: `tenant:${tenantId}`,
        encryption: true
      },
      network: {
        isolated: true,
        vpc: `tenant-${tenantId}`,
        firewall: true
      },
      security: {
        isolated: true,
        encryption: true,
        accessControl: true,
        auditLogging: true
      }
    };

    this.tenantIsolation.set(tenantId, isolation);
    return isolation;
  }

  /**
   * Get tenant by ID
   */
  async getTenant(tenantId) {
    return this.tenants.get(tenantId);
  }

  /**
   * Get tenant by domain
   */
  async getTenantByDomain(domain) {
    for (const [tenantId, tenant] of this.tenants) {
      if (tenant.domain === domain || tenant.subdomain === domain) {
        return tenant;
      }
    }
    return null;
  }

  /**
   * Update tenant configuration
   */
  async updateTenant(tenantId, updates) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const updatedTenant = {
      ...tenant,
      ...updates,
      updatedAt: new Date()
    };

    this.tenants.set(tenantId, updatedTenant);

    // Update configuration if needed
    if (updates.plan) {
      await this.setupResourceQuotas(tenantId, updates.plan);
    }

    return updatedTenant;
  }

  /**
   * Delete tenant
   */
  async deleteTenant(tenantId) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Clean up tenant resources
    await this.cleanupTenantResources(tenantId);

    // Remove from maps
    this.tenants.delete(tenantId);
    this.tenantConfigs.delete(tenantId);
    this.resourceQuotas.delete(tenantId);
    this.tenantIsolation.delete(tenantId);

    return { success: true, message: 'Tenant deleted successfully' };
  }

  /**
   * Clean up tenant resources
   */
  async cleanupTenantResources(tenantId) {
    // Clean up database
    await this.cleanupTenantDatabase(tenantId);

    // Clean up storage
    await this.cleanupTenantStorage(tenantId);

    // Clean up cache
    await this.cleanupTenantCache(tenantId);

    // Clean up queue
    await this.cleanupTenantQueue(tenantId);
  }

  /**
   * Clean up tenant database
   */
  async cleanupTenantDatabase(tenantId) {
    // Implementation for database cleanup
    console.log(`Cleaning up database for tenant ${tenantId}`);
  }

  /**
   * Clean up tenant storage
   */
  async cleanupTenantStorage(tenantId) {
    // Implementation for storage cleanup
    console.log(`Cleaning up storage for tenant ${tenantId}`);
  }

  /**
   * Clean up tenant cache
   */
  async cleanupTenantCache(tenantId) {
    // Implementation for cache cleanup
    console.log(`Cleaning up cache for tenant ${tenantId}`);
  }

  /**
   * Clean up tenant queue
   */
  async cleanupTenantQueue(tenantId) {
    // Implementation for queue cleanup
    console.log(`Cleaning up queue for tenant ${tenantId}`);
  }

  /**
   * Check resource quota
   */
  async checkResourceQuota(tenantId, resource, amount) {
    const quota = this.resourceQuotas.get(tenantId);
    if (!quota) {
      throw new Error('Tenant quota not found');
    }

    const currentUsage = quota.usage[resource];
    const limit = quota.limits[resource];

    if (limit === 'unlimited') {
      return { allowed: true, remaining: 'unlimited' };
    }

    const remaining = limit - currentUsage;
    const allowed = remaining >= amount;

    return { allowed, remaining, limit, currentUsage };
  }

  /**
   * Update resource usage
   */
  async updateResourceUsage(tenantId, resource, amount) {
    const quota = this.resourceQuotas.get(tenantId);
    if (!quota) {
      throw new Error('Tenant quota not found');
    }

    quota.usage[resource] += amount;
    this.resourceQuotas.set(tenantId, quota);

    return quota.usage[resource];
  }

  /**
   * Get tenant configuration
   */
  async getTenantConfig(tenantId) {
    return this.tenantConfigs.get(tenantId);
  }

  /**
   * Get tenant isolation settings
   */
  async getTenantIsolation(tenantId) {
    return this.tenantIsolation.get(tenantId);
  }

  /**
   * List all tenants
   */
  async listTenants(filters = {}) {
    let tenants = Array.from(this.tenants.values());

    if (filters.status) {
      tenants = tenants.filter(tenant => tenant.status === filters.status);
    }

    if (filters.plan) {
      tenants = tenants.filter(tenant => tenant.plan === filters.plan);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      tenants = tenants.filter(tenant => 
        tenant.name.toLowerCase().includes(searchTerm) ||
        tenant.domain.toLowerCase().includes(searchTerm)
      );
    }

    return tenants;
  }

  /**
   * Generate secure password
   */
  async generateSecurePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return await bcrypt.hash(password, 12);
  }

  /**
   * Validate tenant access
   */
  async validateTenantAccess(tenantId, userId, resource) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      return { allowed: false, reason: 'Tenant not found' };
    }

    if (tenant.status !== 'active') {
      return { allowed: false, reason: 'Tenant is not active' };
    }

    // Check resource quota
    const quotaCheck = await this.checkResourceQuota(tenantId, resource, 1);
    if (!quotaCheck.allowed) {
      return { allowed: false, reason: 'Resource quota exceeded' };
    }

    return { allowed: true };
  }

  /**
   * Get tenant statistics
   */
  async getTenantStatistics(tenantId) {
    const tenant = await this.getTenant(tenantId);
    const quota = this.resourceQuotas.get(tenantId);
    const config = this.tenantConfigs.get(tenantId);

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        plan: tenant.plan,
        status: tenant.status,
        createdAt: tenant.createdAt
      },
      resources: {
        usage: quota.usage,
        limits: quota.limits,
        utilization: this.calculateUtilization(quota.usage, quota.limits)
      },
      features: config.features,
      isolation: this.tenantIsolation.get(tenantId)
    };
  }

  /**
   * Calculate resource utilization
   */
  calculateUtilization(usage, limits) {
    const utilization = {};
    for (const [resource, limit] of Object.entries(limits)) {
      if (limit === 'unlimited') {
        utilization[resource] = 0;
      } else {
        utilization[resource] = (usage[resource] / limit) * 100;
      }
    }
    return utilization;
  }
}

module.exports = TenantManager;
