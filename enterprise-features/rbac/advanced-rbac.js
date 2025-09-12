/**
 * Advanced Role-Based Access Control (RBAC)
 * Granular permissions and dynamic roles
 */

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class AdvancedRBAC {
  constructor() {
    this.roles = new Map();
    this.permissions = new Map();
    this.policies = new Map();
    this.userRoles = new Map();
    this.roleHierarchy = new Map();
    this.permissionCache = new Map();
  }

  /**
   * Initialize default permissions
   */
  async initializeDefaultPermissions() {
    const defaultPermissions = [
      // User Management
      { id: 'user.create', name: 'Create User', resource: 'user', action: 'create' },
      { id: 'user.read', name: 'Read User', resource: 'user', action: 'read' },
      { id: 'user.update', name: 'Update User', resource: 'user', action: 'update' },
      { id: 'user.delete', name: 'Delete User', resource: 'user', action: 'delete' },
      { id: 'user.list', name: 'List Users', resource: 'user', action: 'list' },

      // Inventory Management
      { id: 'inventory.create', name: 'Create Inventory', resource: 'inventory', action: 'create' },
      { id: 'inventory.read', name: 'Read Inventory', resource: 'inventory', action: 'read' },
      { id: 'inventory.update', name: 'Update Inventory', resource: 'inventory', action: 'update' },
      { id: 'inventory.delete', name: 'Delete Inventory', resource: 'inventory', action: 'delete' },
      { id: 'inventory.list', name: 'List Inventory', resource: 'inventory', action: 'list' },

      // Order Management
      { id: 'order.create', name: 'Create Order', resource: 'order', action: 'create' },
      { id: 'order.read', name: 'Read Order', resource: 'order', action: 'read' },
      { id: 'order.update', name: 'Update Order', resource: 'order', action: 'update' },
      { id: 'order.delete', name: 'Delete Order', resource: 'order', action: 'delete' },
      { id: 'order.list', name: 'List Orders', resource: 'order', action: 'list' },
      { id: 'order.process', name: 'Process Order', resource: 'order', action: 'process' },

      // Analytics
      { id: 'analytics.read', name: 'Read Analytics', resource: 'analytics', action: 'read' },
      { id: 'analytics.export', name: 'Export Analytics', resource: 'analytics', action: 'export' },

      // System Administration
      { id: 'system.admin', name: 'System Administration', resource: 'system', action: 'admin' },
      { id: 'system.config', name: 'System Configuration', resource: 'system', action: 'config' },
      { id: 'system.audit', name: 'System Audit', resource: 'system', action: 'audit' },

      // Tenant Management
      { id: 'tenant.create', name: 'Create Tenant', resource: 'tenant', action: 'create' },
      { id: 'tenant.read', name: 'Read Tenant', resource: 'tenant', action: 'read' },
      { id: 'tenant.update', name: 'Update Tenant', resource: 'tenant', action: 'update' },
      { id: 'tenant.delete', name: 'Delete Tenant', resource: 'tenant', action: 'delete' },
      { id: 'tenant.list', name: 'List Tenants', resource: 'tenant', action: 'list' }
    ];

    for (const permission of defaultPermissions) {
      this.permissions.set(permission.id, {
        ...permission,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return defaultPermissions;
  }

  /**
   * Create a new role
   */
  async createRole(roleData) {
    const roleId = uuidv4();
    const role = {
      id: roleId,
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions || [],
      conditions: roleData.conditions || [],
      isSystem: roleData.isSystem || false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: roleData.metadata || {}
    };

    this.roles.set(roleId, role);
    return role;
  }

  /**
   * Create a new permission
   */
  async createPermission(permissionData) {
    const permissionId = uuidv4();
    const permission = {
      id: permissionId,
      name: permissionData.name,
      resource: permissionData.resource,
      action: permissionData.action,
      conditions: permissionData.conditions || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: permissionData.metadata || {}
    };

    this.permissions.set(permissionId, permission);
    return permission;
  }

  /**
   * Create a new policy
   */
  async createPolicy(policyData) {
    const policyId = uuidv4();
    const policy = {
      id: policyId,
      name: policyData.name,
      description: policyData.description,
      rules: policyData.rules || [],
      conditions: policyData.conditions || [],
      effect: policyData.effect || 'allow',
      priority: policyData.priority || 100,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: policyData.metadata || {}
    };

    this.policies.set(policyId, policy);
    return policy;
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId, roleId, context = {}) {
    const userRole = {
      id: uuidv4(),
      userId,
      roleId,
      context,
      assignedAt: new Date(),
      assignedBy: context.assignedBy,
      expiresAt: context.expiresAt,
      isActive: true
    };

    if (!this.userRoles.has(userId)) {
      this.userRoles.set(userId, []);
    }

    this.userRoles.get(userId).push(userRole);
    return userRole;
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId, roleId) {
    const userRoles = this.userRoles.get(userId);
    if (!userRoles) {
      return false;
    }

    const index = userRoles.findIndex(ur => ur.roleId === roleId);
    if (index === -1) {
      return false;
    }

    userRoles.splice(index, 1);
    this.userRoles.set(userId, userRoles);
    return true;
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId, permission, context = {}) {
    // Check cache first
    const cacheKey = `${userId}:${permission}:${JSON.stringify(context)}`;
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey);
    }

    const userRoles = this.userRoles.get(userId) || [];
    let hasPermission = false;

    for (const userRole of userRoles) {
      if (!userRole.isActive) continue;

      // Check if role is expired
      if (userRole.expiresAt && userRole.expiresAt < new Date()) {
        continue;
      }

      const role = this.roles.get(userRole.roleId);
      if (!role || !role.isActive) continue;

      // Check if role has the permission
      if (role.permissions.includes(permission)) {
        // Check conditions
        if (await this.evaluateConditions(role.conditions, context)) {
          hasPermission = true;
          break;
        }
      }

      // Check inherited permissions from role hierarchy
      const inheritedPermissions = await this.getInheritedPermissions(role.id);
      if (inheritedPermissions.includes(permission)) {
        if (await this.evaluateConditions(role.conditions, context)) {
          hasPermission = true;
          break;
        }
      }
    }

    // Check policies
    if (!hasPermission) {
      hasPermission = await this.evaluatePolicies(userId, permission, context);
    }

    // Cache the result
    this.permissionCache.set(cacheKey, hasPermission);
    return hasPermission;
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId, context = {}) {
    const userRoles = this.userRoles.get(userId) || [];
    const permissions = new Set();

    for (const userRole of userRoles) {
      if (!userRole.isActive) continue;

      // Check if role is expired
      if (userRole.expiresAt && userRole.expiresAt < new Date()) {
        continue;
      }

      const role = this.roles.get(userRole.roleId);
      if (!role || !role.isActive) continue;

      // Add role permissions
      for (const permission of role.permissions) {
        if (await this.evaluateConditions(role.conditions, context)) {
          permissions.add(permission);
        }
      }

      // Add inherited permissions
      const inheritedPermissions = await this.getInheritedPermissions(role.id);
      for (const permission of inheritedPermissions) {
        if (await this.evaluateConditions(role.conditions, context)) {
          permissions.add(permission);
        }
      }
    }

    return Array.from(permissions);
  }

  /**
   * Get inherited permissions from role hierarchy
   */
  async getInheritedPermissions(roleId) {
    const inheritedPermissions = new Set();
    const visited = new Set();

    const traverse = async (currentRoleId) => {
      if (visited.has(currentRoleId)) return;
      visited.add(currentRoleId);

      const role = this.roles.get(currentRoleId);
      if (!role) return;

      // Add permissions from parent roles
      const parentRoles = this.roleHierarchy.get(currentRoleId) || [];
      for (const parentRoleId of parentRoles) {
        const parentRole = this.roles.get(parentRoleId);
        if (parentRole) {
          for (const permission of parentRole.permissions) {
            inheritedPermissions.add(permission);
          }
          await traverse(parentRoleId);
        }
      }
    };

    await traverse(roleId);
    return Array.from(inheritedPermissions);
  }

  /**
   * Evaluate conditions
   */
  async evaluateConditions(conditions, context) {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, context);
      if (!result) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate a single condition
   */
  async evaluateCondition(condition, context) {
    switch (condition.type) {
      case 'time':
        return this.evaluateTimeCondition(condition, context);
      case 'location':
        return this.evaluateLocationCondition(condition, context);
      case 'device':
        return this.evaluateDeviceCondition(condition, context);
      case 'ip':
        return this.evaluateIPCondition(condition, context);
      case 'custom':
        return this.evaluateCustomCondition(condition, context);
      default:
        return true;
    }
  }

  /**
   * Evaluate time condition
   */
  evaluateTimeCondition(condition, context) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    if (condition.allowedHours && !condition.allowedHours.includes(currentHour)) {
      return false;
    }

    if (condition.allowedDays && !condition.allowedDays.includes(currentDay)) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate location condition
   */
  evaluateLocationCondition(condition, context) {
    if (!context.location) return true;

    if (condition.allowedCountries && !condition.allowedCountries.includes(context.location.country)) {
      return false;
    }

    if (condition.allowedRegions && !condition.allowedRegions.includes(context.location.region)) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate device condition
   */
  evaluateDeviceCondition(condition, context) {
    if (!context.device) return true;

    if (condition.allowedDevices && !condition.allowedDevices.includes(context.device.type)) {
      return false;
    }

    if (condition.requireMFA && !context.device.trusted) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate IP condition
   */
  evaluateIPCondition(condition, context) {
    if (!context.ip) return true;

    if (condition.allowedIPs && !condition.allowedIPs.includes(context.ip)) {
      return false;
    }

    if (condition.blockedIPs && condition.blockedIPs.includes(context.ip)) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate custom condition
   */
  evaluateCustomCondition(condition, context) {
    // Implement custom condition evaluation
    // This would typically involve calling external services or custom logic
    return true;
  }

  /**
   * Evaluate policies
   */
  async evaluatePolicies(userId, permission, context) {
    const policies = Array.from(this.policies.values())
      .filter(policy => policy.isActive)
      .sort((a, b) => b.priority - a.priority);

    for (const policy of policies) {
      const matches = await this.evaluatePolicyRules(policy, userId, permission, context);
      if (matches) {
        return policy.effect === 'allow';
      }
    }

    return false;
  }

  /**
   * Evaluate policy rules
   */
  async evaluatePolicyRules(policy, userId, permission, context) {
    for (const rule of policy.rules) {
      const matches = await this.evaluateRule(rule, userId, permission, context);
      if (!matches) {
        return false;
      }
    }

    return await this.evaluateConditions(policy.conditions, context);
  }

  /**
   * Evaluate a single rule
   */
  async evaluateRule(rule, userId, permission, context) {
    switch (rule.type) {
      case 'user':
        return this.evaluateUserRule(rule, userId, context);
      case 'permission':
        return this.evaluatePermissionRule(rule, permission, context);
      case 'resource':
        return this.evaluateResourceRule(rule, context);
      case 'context':
        return this.evaluateContextRule(rule, context);
      default:
        return true;
    }
  }

  /**
   * Evaluate user rule
   */
  evaluateUserRule(rule, userId, context) {
    if (rule.userIds && !rule.userIds.includes(userId)) {
      return false;
    }

    if (rule.userGroups && !rule.userGroups.some(group => context.userGroups?.includes(group))) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate permission rule
   */
  evaluatePermissionRule(rule, permission, context) {
    if (rule.permissions && !rule.permissions.includes(permission)) {
      return false;
    }

    if (rule.resources && !rule.resources.some(resource => permission.startsWith(resource))) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate resource rule
   */
  evaluateResourceRule(rule, context) {
    if (rule.resources && !rule.resources.includes(context.resource)) {
      return false;
    }

    if (rule.tenants && !rule.tenants.includes(context.tenantId)) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate context rule
   */
  evaluateContextRule(rule, context) {
    for (const [key, value] of Object.entries(rule.context)) {
      if (context[key] !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Set up role hierarchy
   */
  async setupRoleHierarchy(parentRoleId, childRoleId) {
    if (!this.roleHierarchy.has(childRoleId)) {
      this.roleHierarchy.set(childRoleId, []);
    }

    this.roleHierarchy.get(childRoleId).push(parentRoleId);
  }

  /**
   * Get role hierarchy
   */
  async getRoleHierarchy(roleId) {
    return this.roleHierarchy.get(roleId) || [];
  }

  /**
   * Clear permission cache
   */
  clearPermissionCache() {
    this.permissionCache.clear();
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId) {
    return this.userRoles.get(userId) || [];
  }

  /**
   * Get role by ID
   */
  async getRole(roleId) {
    return this.roles.get(roleId);
  }

  /**
   * Get permission by ID
   */
  async getPermission(permissionId) {
    return this.permissions.get(permissionId);
  }

  /**
   * Get policy by ID
   */
  async getPolicy(policyId) {
    return this.policies.get(policyId);
  }

  /**
   * List all roles
   */
  async listRoles(filters = {}) {
    let roles = Array.from(this.roles.values());

    if (filters.isActive !== undefined) {
      roles = roles.filter(role => role.isActive === filters.isActive);
    }

    if (filters.isSystem !== undefined) {
      roles = roles.filter(role => role.isSystem === filters.isSystem);
    }

    return roles;
  }

  /**
   * List all permissions
   */
  async listPermissions(filters = {}) {
    let permissions = Array.from(this.permissions.values());

    if (filters.resource) {
      permissions = permissions.filter(permission => permission.resource === filters.resource);
    }

    if (filters.action) {
      permissions = permissions.filter(permission => permission.action === filters.action);
    }

    return permissions;
  }

  /**
   * List all policies
   */
  async listPolicies(filters = {}) {
    let policies = Array.from(this.policies.values());

    if (filters.effect) {
      policies = policies.filter(policy => policy.effect === filters.effect);
    }

    if (filters.isActive !== undefined) {
      policies = policies.filter(policy => policy.isActive === filters.isActive);
    }

    return policies;
  }
}

module.exports = AdvancedRBAC;
