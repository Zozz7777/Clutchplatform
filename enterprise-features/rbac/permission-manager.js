/**
 * Enterprise Role-Based Access Control (RBAC) Manager
 * Provides granular permissions and role management for the Clutch Platform
 */

const crypto = require('crypto');

class PermissionManager {
  constructor() {
    this.roles = new Map();
    this.permissions = new Map();
    this.roleHierarchies = new Map();
    this.userRoles = new Map();
    this.permissionCache = new Map();
    this.auditLog = [];
  }

  /**
   * Initialize RBAC system
   */
  async initialize() {
    console.log('🔐 Initializing Enterprise RBAC System...');
    
    try {
      // Load default permissions
      await this.loadDefaultPermissions();
      
      // Load default roles
      await this.loadDefaultRoles();
      
      // Setup role hierarchies
      await this.setupRoleHierarchies();
      
      // Initialize permission cache
      await this.initializePermissionCache();
      
      console.log('✅ RBAC system initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize RBAC system:', error);
      throw error;
    }
  }

  /**
   * Create a new permission
   */
  async createPermission(permissionData) {
    const {
      name,
      resource,
      action,
      conditions = [],
      description = '',
      category = 'general'
    } = permissionData;

    try {
      const permissionId = this.generatePermissionId(name);
      
      const permission = {
        id: permissionId,
        name,
        resource,
        action,
        conditions,
        description,
        category,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store permission
      this.permissions.set(permissionId, permission);
      this.permissions.set(name, permission);
      
      // Clear permission cache
      this.clearPermissionCache();
      
      // Log permission creation
      await this.logPermissionChange('create', permission);
      
      console.log(`✅ Permission '${name}' created successfully`);
      return permission;
      
    } catch (error) {
      console.error(`❌ Failed to create permission '${name}':`, error);
      throw error;
    }
  }

  /**
   * Create a new role
   */
  async createRole(roleData) {
    const {
      name,
      description = '',
      permissions = [],
      inheritsFrom = [],
      isSystemRole = false,
      metadata = {}
    } = roleData;

    try {
      const roleId = this.generateRoleId(name);
      
      const role = {
        id: roleId,
        name,
        description,
        permissions: [...permissions],
        inheritsFrom: [...inheritsFrom],
        isSystemRole,
        metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validate role
      await this.validateRole(role);
      
      // Store role
      this.roles.set(roleId, role);
      this.roles.set(name, role);
      
      // Clear permission cache
      this.clearPermissionCache();
      
      // Log role creation
      await this.logRoleChange('create', role);
      
      console.log(`✅ Role '${name}' created successfully`);
      return role;
      
    } catch (error) {
      console.error(`❌ Failed to create role '${name}':`, error);
      throw error;
    }
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId, roleId, context = {}) {
    try {
      const role = await this.getRole(roleId);
      if (!role) {
        throw new Error(`Role '${roleId}' not found`);
      }

      // Check if user already has this role
      const userRoles = this.getUserRoles(userId);
      if (userRoles.some(ur => ur.roleId === roleId)) {
        throw new Error(`User already has role '${roleId}'`);
      }

      // Create user role assignment
      const userRole = {
        userId,
        roleId,
        assignedAt: new Date(),
        assignedBy: context.assignedBy || 'system',
        context: {
          tenantId: context.tenantId,
          department: context.department,
          location: context.location,
          ...context
        }
      };

      // Store user role
      if (!this.userRoles.has(userId)) {
        this.userRoles.set(userId, []);
      }
      this.userRoles.get(userId).push(userRole);
      
      // Clear user permission cache
      this.clearUserPermissionCache(userId);
      
      // Log role assignment
      await this.logRoleAssignment('assign', userRole);
      
      console.log(`✅ Role '${roleId}' assigned to user '${userId}'`);
      return userRole;
      
    } catch (error) {
      console.error(`❌ Failed to assign role to user:`, error);
      throw error;
    }
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId, roleId, context = {}) {
    try {
      const userRoles = this.getUserRoles(userId);
      const userRoleIndex = userRoles.findIndex(ur => ur.roleId === roleId);
      
      if (userRoleIndex === -1) {
        throw new Error(`User does not have role '${roleId}'`);
      }

      const userRole = userRoles[userRoleIndex];
      
      // Remove user role
      userRoles.splice(userRoleIndex, 1);
      
      // Clear user permission cache
      this.clearUserPermissionCache(userId);
      
      // Log role removal
      await this.logRoleAssignment('remove', { ...userRole, removedBy: context.removedBy });
      
      console.log(`✅ Role '${roleId}' removed from user '${userId}'`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to remove role from user:`, error);
      throw error;
    }
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId, permissionName, context = {}) {
    try {
      // Check cache first
      const cacheKey = this.getPermissionCacheKey(userId, permissionName, context);
      if (this.permissionCache.has(cacheKey)) {
        return this.permissionCache.get(cacheKey);
      }

      // Get user roles
      const userRoles = this.getUserRoles(userId);
      
      // Check each role for permission
      for (const userRole of userRoles) {
        const role = await this.getRole(userRole.roleId);
        if (!role) continue;

        // Get effective permissions for role
        const effectivePermissions = await this.getEffectivePermissions(role);
        
        // Check if role has permission
        for (const permission of effectivePermissions) {
          if (permission.name === permissionName) {
            // Check conditions
            const hasPermission = await this.evaluatePermissionConditions(permission, context);
            
            // Cache result
            this.permissionCache.set(cacheKey, hasPermission);
            
            return hasPermission;
          }
        }
      }

      // Cache negative result
      this.permissionCache.set(cacheKey, false);
      return false;
      
    } catch (error) {
      console.error(`❌ Failed to check permission for user '${userId}':`, error);
      return false;
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId, context = {}) {
    try {
      const userRoles = this.getUserRoles(userId);
      const permissions = new Set();

      for (const userRole of userRoles) {
        const role = await this.getRole(userRole.roleId);
        if (!role) continue;

        const effectivePermissions = await this.getEffectivePermissions(role);
        
        for (const permission of effectivePermissions) {
          const hasPermission = await this.evaluatePermissionConditions(permission, context);
          if (hasPermission) {
            permissions.add(permission);
          }
        }
      }

      return Array.from(permissions);
    } catch (error) {
      console.error(`❌ Failed to get user permissions for '${userId}':`, error);
      return [];
    }
  }

  /**
   * Get effective permissions for a role (including inherited permissions)
   */
  async getEffectivePermissions(role) {
    const permissions = new Set();
    
    // Add direct permissions
    for (const permissionId of role.permissions) {
      const permission = await this.getPermission(permissionId);
      if (permission) {
        permissions.add(permission);
      }
    }
    
    // Add inherited permissions
    for (const parentRoleId of role.inheritsFrom) {
      const parentRole = await this.getRole(parentRoleId);
      if (parentRole) {
        const parentPermissions = await this.getEffectivePermissions(parentRole);
        parentPermissions.forEach(permission => permissions.add(permission));
      }
    }
    
    return Array.from(permissions);
  }

  /**
   * Evaluate permission conditions
   */
  async evaluatePermissionConditions(permission, context) {
    if (!permission.conditions || permission.conditions.length === 0) {
      return true;
    }

    for (const condition of permission.conditions) {
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
    const { type, field, operator, value } = condition;

    switch (type) {
      case 'context':
        return this.evaluateContextCondition(field, operator, value, context);
      case 'time':
        return this.evaluateTimeCondition(condition, context);
      case 'location':
        return this.evaluateLocationCondition(condition, context);
      case 'custom':
        return await this.evaluateCustomCondition(condition, context);
      default:
        return true;
    }
  }

  /**
   * Evaluate context-based condition
   */
  evaluateContextCondition(field, operator, value, context) {
    const contextValue = this.getNestedValue(context, field);
    
    switch (operator) {
      case 'equals':
        return contextValue === value;
      case 'not_equals':
        return contextValue !== value;
      case 'in':
        return Array.isArray(value) && value.includes(contextValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(contextValue);
      case 'contains':
        return String(contextValue).includes(String(value));
      case 'starts_with':
        return String(contextValue).startsWith(String(value));
      case 'ends_with':
        return String(contextValue).endsWith(String(value));
      default:
        return true;
    }
  }

  /**
   * Evaluate time-based condition
   */
  evaluateTimeCondition(condition, context) {
    const now = new Date();
    const { startTime, endTime, days, hours } = condition;

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      return now >= start && now <= end;
    }

    if (days && days.length > 0) {
      const dayOfWeek = now.getDay();
      return days.includes(dayOfWeek);
    }

    if (hours && hours.length > 0) {
      const hour = now.getHours();
      return hours.includes(hour);
    }

    return true;
  }

  /**
   * Evaluate location-based condition
   */
  evaluateLocationCondition(condition, context) {
    const { allowedLocations, userLocation } = condition;
    const contextLocation = context.location || userLocation;

    if (!contextLocation || !allowedLocations) {
      return true;
    }

    return allowedLocations.includes(contextLocation);
  }

  /**
   * Evaluate custom condition
   */
  async evaluateCustomCondition(condition, context) {
    // Implementation for custom condition evaluation
    // This could call external services or custom logic
    return true;
  }

  /**
   * Load default permissions
   */
  async loadDefaultPermissions() {
    const defaultPermissions = [
      // User Management
      { name: 'user.create', resource: 'user', action: 'create', category: 'user_management' },
      { name: 'user.read', resource: 'user', action: 'read', category: 'user_management' },
      { name: 'user.update', resource: 'user', action: 'update', category: 'user_management' },
      { name: 'user.delete', resource: 'user', action: 'delete', category: 'user_management' },
      
      // Shop Management
      { name: 'shop.create', resource: 'shop', action: 'create', category: 'shop_management' },
      { name: 'shop.read', resource: 'shop', action: 'read', category: 'shop_management' },
      { name: 'shop.update', resource: 'shop', action: 'update', category: 'shop_management' },
      { name: 'shop.delete', resource: 'shop', action: 'delete', category: 'shop_management' },
      
      // Parts Management
      { name: 'parts.create', resource: 'parts', action: 'create', category: 'parts_management' },
      { name: 'parts.read', resource: 'parts', action: 'read', category: 'parts_management' },
      { name: 'parts.update', resource: 'parts', action: 'update', category: 'parts_management' },
      { name: 'parts.delete', resource: 'parts', action: 'delete', category: 'parts_management' },
      
      // Order Management
      { name: 'order.create', resource: 'order', action: 'create', category: 'order_management' },
      { name: 'order.read', resource: 'order', action: 'read', category: 'order_management' },
      { name: 'order.update', resource: 'order', action: 'update', category: 'order_management' },
      { name: 'order.delete', resource: 'order', action: 'delete', category: 'order_management' },
      
      // Reports
      { name: 'reports.read', resource: 'reports', action: 'read', category: 'reporting' },
      { name: 'reports.export', resource: 'reports', action: 'export', category: 'reporting' },
      
      // System Administration
      { name: 'system.admin', resource: 'system', action: 'admin', category: 'system_admin' },
      { name: 'system.config', resource: 'system', action: 'config', category: 'system_admin' },
      { name: 'system.audit', resource: 'system', action: 'audit', category: 'system_admin' }
    ];

    for (const permissionData of defaultPermissions) {
      await this.createPermission(permissionData);
    }
  }

  /**
   * Load default roles
   */
  async loadDefaultRoles() {
    const defaultRoles = [
      {
        name: 'super_admin',
        description: 'Super Administrator with full system access',
        permissions: ['system.admin', 'system.config', 'system.audit'],
        isSystemRole: true
      },
      {
        name: 'admin',
        description: 'Administrator with management access',
        permissions: ['user.create', 'user.read', 'user.update', 'user.delete', 'shop.create', 'shop.read', 'shop.update', 'shop.delete'],
        isSystemRole: true
      },
      {
        name: 'shop_owner',
        description: 'Shop Owner with shop management access',
        permissions: ['shop.read', 'shop.update', 'parts.create', 'parts.read', 'parts.update', 'parts.delete', 'order.create', 'order.read', 'order.update', 'reports.read'],
        isSystemRole: true
      },
      {
        name: 'shop_manager',
        description: 'Shop Manager with limited management access',
        permissions: ['parts.read', 'parts.update', 'order.create', 'order.read', 'order.update', 'reports.read'],
        isSystemRole: true
      },
      {
        name: 'employee',
        description: 'Shop Employee with basic access',
        permissions: ['parts.read', 'order.create', 'order.read'],
        isSystemRole: true
      },
      {
        name: 'customer',
        description: 'Customer with read-only access',
        permissions: ['parts.read', 'order.read'],
        isSystemRole: true
      }
    ];

    for (const roleData of defaultRoles) {
      await this.createRole(roleData);
    }
  }

  /**
   * Setup role hierarchies
   */
  async setupRoleHierarchies() {
    // Define role inheritance relationships
    const hierarchies = [
      { role: 'shop_manager', inheritsFrom: ['employee'] },
      { role: 'shop_owner', inheritsFrom: ['shop_manager'] },
      { role: 'admin', inheritsFrom: ['shop_owner'] },
      { role: 'super_admin', inheritsFrom: ['admin'] }
    ];

    for (const hierarchy of hierarchies) {
      const role = await this.getRole(hierarchy.role);
      if (role) {
        role.inheritsFrom = hierarchy.inheritsFrom;
        this.roles.set(role.id, role);
        this.roles.set(role.name, role);
      }
    }
  }

  /**
   * Utility methods
   */
  generatePermissionId(name) {
    return crypto.createHash('md5').update(name).digest('hex');
  }

  generateRoleId(name) {
    return crypto.createHash('md5').update(name).digest('hex');
  }

  getPermissionCacheKey(userId, permissionName, context) {
    const contextStr = JSON.stringify(context);
    return `${userId}:${permissionName}:${crypto.createHash('md5').update(contextStr).digest('hex')}`;
  }

  clearPermissionCache() {
    this.permissionCache.clear();
  }

  clearUserPermissionCache(userId) {
    for (const key of this.permissionCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        this.permissionCache.delete(key);
      }
    }
  }

  getUserRoles(userId) {
    return this.userRoles.get(userId) || [];
  }

  async getRole(roleId) {
    return this.roles.get(roleId) || this.roles.get(roleId);
  }

  async getPermission(permissionId) {
    return this.permissions.get(permissionId) || this.permissions.get(permissionId);
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  async validateRole(role) {
    // Validate role permissions exist
    for (const permissionId of role.permissions) {
      const permission = await this.getPermission(permissionId);
      if (!permission) {
        throw new Error(`Permission '${permissionId}' not found`);
      }
    }

    // Validate inherited roles exist
    for (const parentRoleId of role.inheritsFrom) {
      const parentRole = await this.getRole(parentRoleId);
      if (!parentRole) {
        throw new Error(`Parent role '${parentRoleId}' not found`);
      }
    }
  }

  async initializePermissionCache() {
    // Initialize permission cache with default settings
    console.log('Initializing permission cache...');
  }

  async logPermissionChange(action, permission) {
    this.auditLog.push({
      type: 'permission_change',
      action,
      permission: permission.name,
      timestamp: new Date()
    });
  }

  async logRoleChange(action, role) {
    this.auditLog.push({
      type: 'role_change',
      action,
      role: role.name,
      timestamp: new Date()
    });
  }

  async logRoleAssignment(action, userRole) {
    this.auditLog.push({
      type: 'role_assignment',
      action,
      userId: userRole.userId,
      roleId: userRole.roleId,
      timestamp: new Date()
    });
  }
}

module.exports = PermissionManager;
