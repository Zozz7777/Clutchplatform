// Role-Based Access Control (RBAC) System

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
}

export interface UserRole {
  userId: number;
  roleId: string;
  assignedAt: string;
  assignedBy: number;
}

// Define system roles and permissions
export const SYSTEM_ROLES: Record<string, Role> = {
  owner: {
    id: 'owner',
    name: 'مالك',
    description: 'صلاحيات كاملة على النظام',
    isSystemRole: true,
    permissions: [
      // Dashboard permissions
      { resource: 'dashboard', action: 'view' },
      { resource: 'dashboard', action: 'manage' },
      
      // Orders permissions
      { resource: 'orders', action: 'view' },
      { resource: 'orders', action: 'create' },
      { resource: 'orders', action: 'update' },
      { resource: 'orders', action: 'delete' },
      { resource: 'orders', action: 'manage' },
      
      // POS permissions
      { resource: 'pos', action: 'view' },
      { resource: 'pos', action: 'use' },
      { resource: 'pos', action: 'manage' },
      
      // Inventory permissions
      { resource: 'inventory', action: 'view' },
      { resource: 'inventory', action: 'create' },
      { resource: 'inventory', action: 'update' },
      { resource: 'inventory', action: 'delete' },
      { resource: 'inventory', action: 'manage' },
      { resource: 'inventory', action: 'import' },
      { resource: 'inventory', action: 'export' },
      
      // Reports permissions
      { resource: 'reports', action: 'view' },
      { resource: 'reports', action: 'generate' },
      { resource: 'reports', action: 'export' },
      { resource: 'reports', action: 'manage' },
      
      // Users permissions
      { resource: 'users', action: 'view' },
      { resource: 'users', action: 'create' },
      { resource: 'users', action: 'update' },
      { resource: 'users', action: 'delete' },
      { resource: 'users', action: 'manage' },
      
      // Settings permissions
      { resource: 'settings', action: 'view' },
      { resource: 'settings', action: 'update' },
      { resource: 'settings', action: 'manage' },
      
      // Sync permissions
      { resource: 'sync', action: 'view' },
      { resource: 'sync', action: 'manage' },
      
      // Audit permissions
      { resource: 'audit', action: 'view' },
      { resource: 'audit', action: 'export' },
    ]
  },
  
  manager: {
    id: 'manager',
    name: 'مدير',
    description: 'إدارة العمليات اليومية',
    isSystemRole: true,
    permissions: [
      // Dashboard permissions
      { resource: 'dashboard', action: 'view' },
      
      // Orders permissions
      { resource: 'orders', action: 'view' },
      { resource: 'orders', action: 'create' },
      { resource: 'orders', action: 'update' },
      { resource: 'orders', action: 'manage' },
      
      // POS permissions
      { resource: 'pos', action: 'view' },
      { resource: 'pos', action: 'use' },
      
      // Inventory permissions
      { resource: 'inventory', action: 'view' },
      { resource: 'inventory', action: 'create' },
      { resource: 'inventory', action: 'update' },
      { resource: 'inventory', action: 'manage' },
      { resource: 'inventory', action: 'import' },
      { resource: 'inventory', action: 'export' },
      
      // Reports permissions
      { resource: 'reports', action: 'view' },
      { resource: 'reports', action: 'generate' },
      { resource: 'reports', action: 'export' },
      
      // Users permissions (limited)
      { resource: 'users', action: 'view' },
      { resource: 'users', action: 'create' },
      { resource: 'users', action: 'update' },
      
      // Settings permissions (limited)
      { resource: 'settings', action: 'view' },
      { resource: 'settings', action: 'update' },
      
      // Sync permissions
      { resource: 'sync', action: 'view' },
    ]
  },
  
  cashier: {
    id: 'cashier',
    name: 'كاشير',
    description: 'مبيعات ودفع',
    isSystemRole: true,
    permissions: [
      // Dashboard permissions
      { resource: 'dashboard', action: 'view' },
      
      // Orders permissions
      { resource: 'orders', action: 'view' },
      { resource: 'orders', action: 'create' },
      { resource: 'orders', action: 'update' },
      
      // POS permissions
      { resource: 'pos', action: 'view' },
      { resource: 'pos', action: 'use' },
      
      // Inventory permissions (view only)
      { resource: 'inventory', action: 'view' },
      
      // Reports permissions (limited)
      { resource: 'reports', action: 'view' },
    ]
  },
  
  inventory_clerk: {
    id: 'inventory_clerk',
    name: 'موظف مخزن',
    description: 'إدارة المخزون',
    isSystemRole: true,
    permissions: [
      // Dashboard permissions
      { resource: 'dashboard', action: 'view' },
      
      // Orders permissions (view only)
      { resource: 'orders', action: 'view' },
      
      // Inventory permissions
      { resource: 'inventory', action: 'view' },
      { resource: 'inventory', action: 'create' },
      { resource: 'inventory', action: 'update' },
      { resource: 'inventory', action: 'import' },
      { resource: 'inventory', action: 'export' },
      
      // Reports permissions (inventory only)
      { resource: 'reports', action: 'view' },
      { resource: 'reports', action: 'generate' },
    ]
  },
  
  accountant: {
    id: 'accountant',
    name: 'محاسب',
    description: 'تقارير مالية ومحاسبية',
    isSystemRole: true,
    permissions: [
      // Dashboard permissions
      { resource: 'dashboard', action: 'view' },
      
      // Orders permissions (view only)
      { resource: 'orders', action: 'view' },
      
      // Reports permissions
      { resource: 'reports', action: 'view' },
      { resource: 'reports', action: 'generate' },
      { resource: 'reports', action: 'export' },
      
      // Audit permissions
      { resource: 'audit', action: 'view' },
      { resource: 'audit', action: 'export' },
    ]
  },
  
  support: {
    id: 'support',
    name: 'دعم فني',
    description: 'دعم فني محدود',
    isSystemRole: true,
    permissions: [
      // Dashboard permissions
      { resource: 'dashboard', action: 'view' },
      
      // Orders permissions (view only)
      { resource: 'orders', action: 'view' },
      
      // Sync permissions
      { resource: 'sync', action: 'view' },
    ]
  }
};

// RBAC Service Class
export class RBACService {
  private userRoles: Map<number, string[]> = new Map();
  private roles: Map<string, Role> = new Map();

  constructor() {
    // Initialize system roles
    Object.values(SYSTEM_ROLES).forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  // Load user roles from database
  async loadUserRoles(userId: number): Promise<void> {
    try {
      const result = await window.electronAPI.dbQuery(
        'SELECT role FROM users WHERE id = ?',
        [userId]
      );
      
      if (result && result.length > 0) {
        const userRole = result[0].role;
        this.userRoles.set(userId, [userRole]);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to load user roles:', error); }
    }
  }

  // Check if user has permission
  hasPermission(userId: number, resource: string, action: string, conditions?: Record<string, any>): boolean {
    const userRoleIds = this.userRoles.get(userId);
    if (!userRoleIds) return false;

    for (const roleId of userRoleIds) {
      const role = this.roles.get(roleId);
      if (!role) continue;

      const hasPermission = role.permissions.some(permission => {
        if (permission.resource !== resource || permission.action !== action) {
          return false;
        }

        // Check conditions if provided
        if (permission.conditions && conditions) {
          return Object.entries(permission.conditions).every(([key, value]) => {
            return conditions[key] === value;
          });
        }

        return true;
      });

      if (hasPermission) return true;
    }

    return false;
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(userId: number, permissions: Array<{resource: string, action: string}>): boolean {
    return permissions.some(permission => 
      this.hasPermission(userId, permission.resource, permission.action)
    );
  }

  // Check if user has all of the specified permissions
  hasAllPermissions(userId: number, permissions: Array<{resource: string, action: string}>): boolean {
    return permissions.every(permission => 
      this.hasPermission(userId, permission.resource, permission.action)
    );
  }

  // Get user's effective permissions
  getUserPermissions(userId: number): Permission[] {
    const userRoleIds = this.userRoles.get(userId);
    if (!userRoleIds) return [];

    const permissions: Permission[] = [];
    const permissionSet = new Set<string>();

    for (const roleId of userRoleIds) {
      const role = this.roles.get(roleId);
      if (!role) continue;

      role.permissions.forEach(permission => {
        const key = `${permission.resource}:${permission.action}`;
        if (!permissionSet.has(key)) {
          permissionSet.add(key);
          permissions.push(permission);
        }
      });
    }

    return permissions;
  }

  // Get user's roles
  getUserRoles(userId: number): Role[] {
    const userRoleIds = this.userRoles.get(userId);
    if (!userRoleIds) return [];

    return userRoleIds
      .map(roleId => this.roles.get(roleId))
      .filter((role): role is Role => role !== undefined);
  }

  // Assign role to user
  async assignRole(userId: number, roleId: string, assignedBy: number): Promise<boolean> {
    try {
      // Check if role exists
      if (!this.roles.has(roleId)) {
        throw new Error('Role not found');
      }

      // Update user role in database
      await window.electronAPI.dbExec(
        'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [roleId, userId]
      );

      // Update in-memory cache
      this.userRoles.set(userId, [roleId]);

      // Log audit event
      await window.electronAPI.dbExec(
        `INSERT INTO audit_log (user_id, action, entity_type, entity_id, new_data, created_at) 
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          assignedBy,
          'assign_role',
          'user',
          userId.toString(),
          JSON.stringify({ roleId, assignedBy })
        ]
      );

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to assign role:', error); }
      return false;
    }
  }

  // Create custom role
  async createCustomRole(role: Omit<Role, 'isSystemRole'>): Promise<boolean> {
    try {
      const customRole: Role = {
        ...role,
        isSystemRole: false
      };

      // Store in database (you might want to create a roles table)
      await window.electronAPI.dbExec(
        `INSERT INTO custom_roles (id, name, description, permissions, created_at) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          customRole.id,
          customRole.name,
          customRole.description,
          JSON.stringify(customRole.permissions)
        ]
      );

      // Add to in-memory cache
      this.roles.set(customRole.id, customRole);

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to create custom role:', error); }
      return false;
    }
  }

  // Get all available roles
  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  // Get system roles only
  getSystemRoles(): Role[] {
    return Array.from(this.roles.values()).filter(role => role.isSystemRole);
  }

  // Get custom roles only
  getCustomRoles(): Role[] {
    return Array.from(this.roles.values()).filter(role => !role.isSystemRole);
  }

  // Clear user roles cache
  clearUserRoles(userId: number): void {
    this.userRoles.delete(userId);
  }

  // Clear all cache
  clearCache(): void {
    this.userRoles.clear();
  }
}

// Create singleton instance
export const rbacService = new RBACService();

// Permission constants for easy reference
export const PERMISSIONS = {
  DASHBOARD: {
    VIEW: { resource: 'dashboard', action: 'view' },
    MANAGE: { resource: 'dashboard', action: 'manage' }
  },
  ORDERS: {
    VIEW: { resource: 'orders', action: 'view' },
    CREATE: { resource: 'orders', action: 'create' },
    UPDATE: { resource: 'orders', action: 'update' },
    DELETE: { resource: 'orders', action: 'delete' },
    MANAGE: { resource: 'orders', action: 'manage' }
  },
  POS: {
    VIEW: { resource: 'pos', action: 'view' },
    USE: { resource: 'pos', action: 'use' },
    MANAGE: { resource: 'pos', action: 'manage' }
  },
  INVENTORY: {
    VIEW: { resource: 'inventory', action: 'view' },
    CREATE: { resource: 'inventory', action: 'create' },
    UPDATE: { resource: 'inventory', action: 'update' },
    DELETE: { resource: 'inventory', action: 'delete' },
    MANAGE: { resource: 'inventory', action: 'manage' },
    IMPORT: { resource: 'inventory', action: 'import' },
    EXPORT: { resource: 'inventory', action: 'export' }
  },
  REPORTS: {
    VIEW: { resource: 'reports', action: 'view' },
    GENERATE: { resource: 'reports', action: 'generate' },
    EXPORT: { resource: 'reports', action: 'export' },
    MANAGE: { resource: 'reports', action: 'manage' }
  },
  USERS: {
    VIEW: { resource: 'users', action: 'view' },
    CREATE: { resource: 'users', action: 'create' },
    UPDATE: { resource: 'users', action: 'update' },
    DELETE: { resource: 'users', action: 'delete' },
    MANAGE: { resource: 'users', action: 'manage' }
  },
  SETTINGS: {
    VIEW: { resource: 'settings', action: 'view' },
    UPDATE: { resource: 'settings', action: 'update' },
    MANAGE: { resource: 'settings', action: 'manage' }
  },
  SYNC: {
    VIEW: { resource: 'sync', action: 'view' },
    MANAGE: { resource: 'sync', action: 'manage' }
  },
  AUDIT: {
    VIEW: { resource: 'audit', action: 'view' },
    EXPORT: { resource: 'audit', action: 'export' }
  }
} as const;
