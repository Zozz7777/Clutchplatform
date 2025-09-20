import { logger } from './logger';
import { DatabaseManager } from './database';

export type UserRole = 'owner' | 'manager' | 'accountant' | 'cashier' | 'auditor' | 'sysadmin';

export interface Permission {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  resource: string;
  action: string;
  conditions?: string[];
}

export interface Role {
  id: UserRole;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  permissions: string[];
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoleAssignment {
  user_id: number;
  role_id: UserRole;
  assigned_by: number;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface RBACConfig {
  roles: Role[];
  permissions: Permission[];
  role_permissions: { [roleId: string]: string[] };
}

export class RBACManager {
  private db: DatabaseManager;
  private config: RBACConfig;

  constructor() {
    this.db = new DatabaseManager();
    this.config = this.getDefaultRBACConfig();
  }

  async initialize(): Promise<void> {
    logger.info('RBAC Manager initialized');
    await this.createRBACTables();
    await this.initializeDefaultRoles();
  }

  /**
   * Create RBAC tables
   */
  private async createRBACTables(): Promise<void> {
    const tables = [
      // Permissions table
      `CREATE TABLE IF NOT EXISTS permissions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        description TEXT NOT NULL,
        description_ar TEXT NOT NULL,
        resource TEXT NOT NULL,
        action TEXT NOT NULL,
        conditions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Roles table
      `CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        description TEXT NOT NULL,
        description_ar TEXT NOT NULL,
        permissions TEXT NOT NULL,
        is_system_role BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // User role assignments
      `CREATE TABLE IF NOT EXISTS user_role_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role_id TEXT NOT NULL,
        assigned_by INTEGER NOT NULL,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (role_id) REFERENCES roles (id),
        FOREIGN KEY (assigned_by) REFERENCES users (id),
        UNIQUE(user_id, role_id)
      )`,

      // Permission overrides (for specific users)
      `CREATE TABLE IF NOT EXISTS user_permission_overrides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        permission_id TEXT NOT NULL,
        granted BOOLEAN NOT NULL,
        reason TEXT,
        granted_by INTEGER NOT NULL,
        granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (permission_id) REFERENCES permissions (id),
        FOREIGN KEY (granted_by) REFERENCES users (id),
        UNIQUE(user_id, permission_id)
      )`,

      // Audit log for RBAC changes
      `CREATE TABLE IF NOT EXISTS rbac_audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT,
        old_values TEXT,
        new_values TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`
    ];

    for (const table of tables) {
      try {
        await this.db.exec(table);
      } catch (error) {
        logger.error('Error creating RBAC table:', error);
        throw error;
      }
    }

    logger.info('RBAC tables created successfully');
  }

  /**
   * Initialize default roles and permissions
   */
  private async initializeDefaultRoles(): Promise<void> {
    try {
      // Check if roles already exist
      const existingRoles = await this.db.query('SELECT COUNT(*) as count FROM roles');
      if (existingRoles[0]?.count > 0) {
        return; // Roles already initialized
      }

      // Insert permissions
      for (const permission of this.config.permissions) {
        await this.db.exec(
          `INSERT INTO permissions (id, name, name_ar, description, description_ar, resource, action, conditions)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            permission.id, permission.name, permission.name_ar, permission.description, permission.description_ar,
            permission.resource, permission.action, permission.conditions ? JSON.stringify(permission.conditions) : null
          ]
        );
      }

      // Insert roles
      for (const role of this.config.roles) {
        await this.db.exec(
          `INSERT INTO roles (id, name, name_ar, description, description_ar, permissions, is_system_role)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            role.id, role.name, role.name_ar, role.description, role.description_ar,
            JSON.stringify(role.permissions), role.is_system_role
          ]
        );
      }

      logger.info('Default RBAC roles and permissions initialized');

    } catch (error) {
      logger.error('Failed to initialize default RBAC roles:', error);
      throw error;
    }
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: number, permissionId: string, context?: any): Promise<boolean> {
    try {
      // Get user's roles
      const userRoles = await this.getUserRoles(userId);
      if (userRoles.length === 0) {
        return false;
      }

      // Check if any role has the permission
      for (const role of userRoles) {
        if (role.permissions.includes(permissionId)) {
          // Check for permission overrides
          const override = await this.getUserPermissionOverride(userId, permissionId);
          if (override) {
            return override.granted;
          }
          return true;
        }
      }

      // Check for direct permission override
      const override = await this.getUserPermissionOverride(userId, permissionId);
      if (override) {
        return override.granted;
      }

      return false;

    } catch (error) {
      logger.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Get user's roles
   */
  async getUserRoles(userId: number): Promise<Role[]> {
    try {
      const assignments = await this.db.query(`
        SELECT r.* FROM roles r
        JOIN user_role_assignments ura ON r.id = ura.role_id
        WHERE ura.user_id = ? AND ura.is_active = 1
        AND (ura.expires_at IS NULL OR ura.expires_at > datetime('now'))
      `, [userId]);

      return assignments.map((assignment: any) => ({
        id: assignment.id,
        name: assignment.name,
        name_ar: assignment.name_ar,
        description: assignment.description,
        description_ar: assignment.description_ar,
        permissions: JSON.parse(assignment.permissions),
        is_system_role: assignment.is_system_role,
        created_at: assignment.created_at,
        updated_at: assignment.updated_at
      }));

    } catch (error) {
      logger.error('Error getting user roles:', error);
      return [];
    }
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(
    userId: number, 
    roleId: UserRole, 
    assignedBy: number,
    expiresAt?: string
  ): Promise<void> {
    try {
      await this.db.exec(
        `INSERT OR REPLACE INTO user_role_assignments (user_id, role_id, assigned_by, expires_at, is_active)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, roleId, assignedBy, expiresAt, true]
      );

      // Log the assignment
      await this.logRBACAction(assignedBy, 'assign_role', 'user_role_assignment', `${userId}-${roleId}`, null, { role_id: roleId, user_id: userId });

      logger.info(`Role ${roleId} assigned to user ${userId} by user ${assignedBy}`);

    } catch (error) {
      logger.error('Error assigning role to user:', error);
      throw error;
    }
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId: number, roleId: UserRole, removedBy: number): Promise<void> {
    try {
      await this.db.exec(
        'UPDATE user_role_assignments SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND role_id = ?',
        [userId, roleId]
      );

      // Log the removal
      await this.logRBACAction(removedBy, 'remove_role', 'user_role_assignment', `${userId}-${roleId}`, { role_id: roleId, user_id: userId }, null);

      logger.info(`Role ${roleId} removed from user ${userId} by user ${removedBy}`);

    } catch (error) {
      logger.error('Error removing role from user:', error);
      throw error;
    }
  }

  /**
   * Grant permission override to user
   */
  async grantPermissionOverride(
    userId: number,
    permissionId: string,
    grantedBy: number,
    reason?: string,
    expiresAt?: string
  ): Promise<void> {
    try {
      await this.db.exec(
        `INSERT OR REPLACE INTO user_permission_overrides (user_id, permission_id, granted, reason, granted_by, expires_at, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, permissionId, true, reason, grantedBy, expiresAt, true]
      );

      // Log the override
      await this.logRBACAction(grantedBy, 'grant_permission_override', 'user_permission_override', `${userId}-${permissionId}`, null, { permission_id: permissionId, user_id: userId, granted: true });

      logger.info(`Permission override granted: ${permissionId} to user ${userId} by user ${grantedBy}`);

    } catch (error) {
      logger.error('Error granting permission override:', error);
      throw error;
    }
  }

  /**
   * Revoke permission override from user
   */
  async revokePermissionOverride(
    userId: number,
    permissionId: string,
    revokedBy: number,
    reason?: string
  ): Promise<void> {
    try {
      await this.db.exec(
        'UPDATE user_permission_overrides SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND permission_id = ?',
        [userId, permissionId]
      );

      // Log the revocation
      await this.logRBACAction(revokedBy, 'revoke_permission_override', 'user_permission_override', `${userId}-${permissionId}`, { permission_id: permissionId, user_id: userId, granted: true }, null);

      logger.info(`Permission override revoked: ${permissionId} from user ${userId} by user ${revokedBy}`);

    } catch (error) {
      logger.error('Error revoking permission override:', error);
      throw error;
    }
  }

  /**
   * Get user permission override
   */
  private async getUserPermissionOverride(userId: number, permissionId: string): Promise<any> {
    try {
      const override = await this.db.get(`
        SELECT * FROM user_permission_overrides 
        WHERE user_id = ? AND permission_id = ? AND is_active = 1
        AND (expires_at IS NULL OR expires_at > datetime('now'))
      `, [userId, permissionId]);

      return override;

    } catch (error) {
      logger.error('Error getting user permission override:', error);
      return null;
    }
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    try {
      const permissions = await this.db.query('SELECT * FROM permissions ORDER BY resource, action');
      return permissions.map((p: any) => ({
        id: p.id,
        name: p.name,
        name_ar: p.name_ar,
        description: p.description,
        description_ar: p.description_ar,
        resource: p.resource,
        action: p.action,
        conditions: p.conditions ? JSON.parse(p.conditions) : undefined
      }));

    } catch (error) {
      logger.error('Error getting all permissions:', error);
      return [];
    }
  }

  /**
   * Get all roles
   */
  async getAllRoles(): Promise<Role[]> {
    try {
      const roles = await this.db.query('SELECT * FROM roles ORDER BY id');
      return roles.map((r: any) => ({
        id: r.id,
        name: r.name,
        name_ar: r.name_ar,
        description: r.description,
        description_ar: r.description_ar,
        permissions: JSON.parse(r.permissions),
        is_system_role: r.is_system_role,
        created_at: r.created_at,
        updated_at: r.updated_at
      }));

    } catch (error) {
      logger.error('Error getting all roles:', error);
      return [];
    }
  }

  /**
   * Get RBAC audit log
   */
  async getRBACAuditLog(limit: number = 100, offset: number = 0): Promise<any[]> {
    try {
      const logs = await this.db.query(`
        SELECT ral.*, u.username, u.first_name, u.last_name
        FROM rbac_audit_log ral
        LEFT JOIN users u ON ral.user_id = u.id
        ORDER BY ral.created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      return logs;

    } catch (error) {
      logger.error('Error getting RBAC audit log:', error);
      return [];
    }
  }

  /**
   * Log RBAC action
   */
  private async logRBACAction(
    userId: number,
    action: string,
    resourceType: string,
    resourceId: string,
    oldValues: any,
    newValues: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await this.db.exec(
        `INSERT INTO rbac_audit_log (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, action, resourceType, resourceId,
          oldValues ? JSON.stringify(oldValues) : null,
          newValues ? JSON.stringify(newValues) : null,
          ipAddress, userAgent
        ]
      );

    } catch (error) {
      logger.error('Error logging RBAC action:', error);
    }
  }

  /**
   * Get default RBAC configuration
   */
  private getDefaultRBACConfig(): RBACConfig {
    const permissions: Permission[] = [
      // Inventory permissions
      { id: 'inventory.view', name: 'View Inventory', name_ar: 'عرض المخزون', description: 'View inventory items and stock levels', description_ar: 'عرض عناصر المخزون ومستويات المخزون', resource: 'inventory', action: 'view' },
      { id: 'inventory.create', name: 'Create Inventory Items', name_ar: 'إنشاء عناصر المخزون', description: 'Add new inventory items', description_ar: 'إضافة عناصر مخزون جديدة', resource: 'inventory', action: 'create' },
      { id: 'inventory.update', name: 'Update Inventory Items', name_ar: 'تحديث عناصر المخزون', description: 'Modify existing inventory items', description_ar: 'تعديل عناصر المخزون الموجودة', resource: 'inventory', action: 'update' },
      { id: 'inventory.delete', name: 'Delete Inventory Items', name_ar: 'حذف عناصر المخزون', description: 'Remove inventory items', description_ar: 'إزالة عناصر المخزون', resource: 'inventory', action: 'delete' },
      { id: 'inventory.import', name: 'Import Inventory', name_ar: 'استيراد المخزون', description: 'Import inventory from external sources', description_ar: 'استيراد المخزون من مصادر خارجية', resource: 'inventory', action: 'import' },
      { id: 'inventory.export', name: 'Export Inventory', name_ar: 'تصدير المخزون', description: 'Export inventory data', description_ar: 'تصدير بيانات المخزون', resource: 'inventory', action: 'export' },

      // Sales permissions
      { id: 'sales.view', name: 'View Sales', name_ar: 'عرض المبيعات', description: 'View sales transactions', description_ar: 'عرض معاملات المبيعات', resource: 'sales', action: 'view' },
      { id: 'sales.create', name: 'Process Sales', name_ar: 'معالجة المبيعات', description: 'Process new sales transactions', description_ar: 'معالجة معاملات المبيعات الجديدة', resource: 'sales', action: 'create' },
      { id: 'sales.update', name: 'Update Sales', name_ar: 'تحديث المبيعات', description: 'Modify sales transactions', description_ar: 'تعديل معاملات المبيعات', resource: 'sales', action: 'update' },
      { id: 'sales.delete', name: 'Delete Sales', name_ar: 'حذف المبيعات', description: 'Delete sales transactions', description_ar: 'حذف معاملات المبيعات', resource: 'sales', action: 'delete' },
      { id: 'sales.refund', name: 'Process Refunds', name_ar: 'معالجة المبالغ المستردة', description: 'Process refunds and returns', description_ar: 'معالجة المبالغ المستردة والإرجاع', resource: 'sales', action: 'refund' },

      // Customer permissions
      { id: 'customers.view', name: 'View Customers', name_ar: 'عرض العملاء', description: 'View customer information', description_ar: 'عرض معلومات العملاء', resource: 'customers', action: 'view' },
      { id: 'customers.create', name: 'Create Customers', name_ar: 'إنشاء العملاء', description: 'Add new customers', description_ar: 'إضافة عملاء جدد', resource: 'customers', action: 'create' },
      { id: 'customers.update', name: 'Update Customers', name_ar: 'تحديث العملاء', description: 'Modify customer information', description_ar: 'تعديل معلومات العملاء', resource: 'customers', action: 'update' },
      { id: 'customers.delete', name: 'Delete Customers', name_ar: 'حذف العملاء', description: 'Remove customers', description_ar: 'إزالة العملاء', resource: 'customers', action: 'delete' },

      // Supplier permissions
      { id: 'suppliers.view', name: 'View Suppliers', name_ar: 'عرض الموردين', description: 'View supplier information', description_ar: 'عرض معلومات الموردين', resource: 'suppliers', action: 'view' },
      { id: 'suppliers.create', name: 'Create Suppliers', name_ar: 'إنشاء الموردين', description: 'Add new suppliers', description_ar: 'إضافة موردين جدد', resource: 'suppliers', action: 'create' },
      { id: 'suppliers.update', name: 'Update Suppliers', name_ar: 'تحديث الموردين', description: 'Modify supplier information', description_ar: 'تعديل معلومات الموردين', resource: 'suppliers', action: 'update' },
      { id: 'suppliers.delete', name: 'Delete Suppliers', name_ar: 'حذف الموردين', description: 'Remove suppliers', description_ar: 'إزالة الموردين', resource: 'suppliers', action: 'delete' },

      // Reports permissions
      { id: 'reports.view', name: 'View Reports', name_ar: 'عرض التقارير', description: 'View business reports', description_ar: 'عرض تقارير الأعمال', resource: 'reports', action: 'view' },
      { id: 'reports.create', name: 'Create Reports', name_ar: 'إنشاء التقارير', description: 'Generate new reports', description_ar: 'إنشاء تقارير جديدة', resource: 'reports', action: 'create' },
      { id: 'reports.export', name: 'Export Reports', name_ar: 'تصدير التقارير', description: 'Export reports to external formats', description_ar: 'تصدير التقارير إلى تنسيقات خارجية', resource: 'reports', action: 'export' },

      // Settings permissions
      { id: 'settings.view', name: 'View Settings', name_ar: 'عرض الإعدادات', description: 'View system settings', description_ar: 'عرض إعدادات النظام', resource: 'settings', action: 'view' },
      { id: 'settings.update', name: 'Update Settings', name_ar: 'تحديث الإعدادات', description: 'Modify system settings', description_ar: 'تعديل إعدادات النظام', resource: 'settings', action: 'update' },

      // User management permissions
      { id: 'users.view', name: 'View Users', name_ar: 'عرض المستخدمين', description: 'View user accounts', description_ar: 'عرض حسابات المستخدمين', resource: 'users', action: 'view' },
      { id: 'users.create', name: 'Create Users', name_ar: 'إنشاء المستخدمين', description: 'Create new user accounts', description_ar: 'إنشاء حسابات مستخدمين جديدة', resource: 'users', action: 'create' },
      { id: 'users.update', name: 'Update Users', name_ar: 'تحديث المستخدمين', description: 'Modify user accounts', description_ar: 'تعديل حسابات المستخدمين', resource: 'users', action: 'update' },
      { id: 'users.delete', name: 'Delete Users', name_ar: 'حذف المستخدمين', description: 'Remove user accounts', description_ar: 'إزالة حسابات المستخدمين', resource: 'users', action: 'delete' },

      // AI permissions
      { id: 'ai.view', name: 'View AI Insights', name_ar: 'عرض رؤى الذكاء الاصطناعي', description: 'View AI-powered business insights', description_ar: 'عرض رؤى الأعمال بالذكاء الاصطناعي', resource: 'ai', action: 'view' },
      { id: 'ai.generate', name: 'Generate AI Insights', name_ar: 'إنشاء رؤى الذكاء الاصطناعي', description: 'Generate AI-powered insights', description_ar: 'إنشاء رؤى بالذكاء الاصطناعي', resource: 'ai', action: 'generate' },

      // Marketplace permissions
      { id: 'marketplace.view', name: 'View Marketplace', name_ar: 'عرض السوق', description: 'View marketplace integration', description_ar: 'عرض تكامل السوق', resource: 'marketplace', action: 'view' },
      { id: 'marketplace.sync', name: 'Sync Marketplace', name_ar: 'مزامنة السوق', description: 'Sync with marketplace', description_ar: 'المزامنة مع السوق', resource: 'marketplace', action: 'sync' },
      { id: 'marketplace.update', name: 'Update Marketplace', name_ar: 'تحديث السوق', description: 'Update marketplace data', description_ar: 'تحديث بيانات السوق', resource: 'marketplace', action: 'update' },
      { id: 'marketplace.settings', name: 'Marketplace Settings', name_ar: 'إعدادات السوق', description: 'Configure marketplace settings', description_ar: 'تكوين إعدادات السوق', resource: 'marketplace', action: 'settings' },

      // Branch permissions
      { id: 'branches.view', name: 'View Branches', name_ar: 'عرض الفروع', description: 'View branch information', description_ar: 'عرض معلومات الفروع', resource: 'branches', action: 'view' },
      { id: 'branches.create', name: 'Create Branches', name_ar: 'إنشاء الفروع', description: 'Create new branches', description_ar: 'إنشاء فروع جديدة', resource: 'branches', action: 'create' },
      { id: 'branches.update', name: 'Update Branches', name_ar: 'تحديث الفروع', description: 'Modify branch information', description_ar: 'تعديل معلومات الفروع', resource: 'branches', action: 'update' },
      { id: 'branches.transfer', name: 'Transfer Stock', name_ar: 'تحويل المخزون', description: 'Transfer stock between branches', description_ar: 'تحويل المخزون بين الفروع', resource: 'branches', action: 'transfer' },
      { id: 'branches.approve', name: 'Approve Transfers', name_ar: 'الموافقة على التحويلات', description: 'Approve branch transfers', description_ar: 'الموافقة على تحويلات الفروع', resource: 'branches', action: 'approve' },

      // Backup permissions
      { id: 'backup.view', name: 'View Backups', name_ar: 'عرض النسخ الاحتياطية', description: 'View backup information', description_ar: 'عرض معلومات النسخ الاحتياطية', resource: 'backup', action: 'view' },
      { id: 'backup.create', name: 'Create Backups', name_ar: 'إنشاء النسخ الاحتياطية', description: 'Create system backups', description_ar: 'إنشاء نسخ احتياطية للنظام', resource: 'backup', action: 'create' },
      { id: 'backup.restore', name: 'Restore Backups', name_ar: 'استعادة النسخ الاحتياطية', description: 'Restore from backups', description_ar: 'الاستعادة من النسخ الاحتياطية', resource: 'backup', action: 'restore' },
      { id: 'backup.delete', name: 'Delete Backups', name_ar: 'حذف النسخ الاحتياطية', description: 'Delete backup files', description_ar: 'حذف ملفات النسخ الاحتياطية', resource: 'backup', action: 'delete' },
      { id: 'backup.export', name: 'Export Data', name_ar: 'تصدير البيانات', description: 'Export system data', description_ar: 'تصدير بيانات النظام', resource: 'backup', action: 'export' },
      { id: 'backup.import', name: 'Import Data', name_ar: 'استيراد البيانات', description: 'Import system data', description_ar: 'استيراد بيانات النظام', resource: 'backup', action: 'import' },
      { id: 'backup.download', name: 'Download Backups', name_ar: 'تحميل النسخ الاحتياطية', description: 'Download backup files', description_ar: 'تحميل ملفات النسخ الاحتياطية', resource: 'backup', action: 'download' },

      // Companion app permissions
      { id: 'companion.view', name: 'View Companion App', name_ar: 'عرض التطبيق المصاحب', description: 'View companion app data', description_ar: 'عرض بيانات التطبيق المصاحب', resource: 'companion', action: 'view' },
      { id: 'companion.settings', name: 'Companion Settings', name_ar: 'إعدادات التطبيق المصاحب', description: 'Configure companion app settings', description_ar: 'تكوين إعدادات التطبيق المصاحب', resource: 'companion', action: 'settings' },
      { id: 'companion.reports', name: 'Companion Reports', name_ar: 'تقارير التطبيق المصاحب', description: 'Generate companion app reports', description_ar: 'إنشاء تقارير التطبيق المصاحب', resource: 'companion', action: 'reports' },
      { id: 'companion.create', name: 'Create Companion Data', name_ar: 'إنشاء بيانات التطبيق المصاحب', description: 'Create companion app data', description_ar: 'إنشاء بيانات التطبيق المصاحب', resource: 'companion', action: 'create' },

      // Training permissions
      { id: 'training.view', name: 'View Training', name_ar: 'عرض التدريب', description: 'View training modules and progress', description_ar: 'عرض وحدات التدريب والتقدم', resource: 'training', action: 'view' },
      { id: 'training.start', name: 'Start Training', name_ar: 'بدء التدريب', description: 'Start training sessions', description_ar: 'بدء جلسات التدريب', resource: 'training', action: 'start' },
      { id: 'training.update', name: 'Update Training', name_ar: 'تحديث التدريب', description: 'Update training progress', description_ar: 'تحديث تقدم التدريب', resource: 'training', action: 'update' },
      { id: 'training.award', name: 'Award Achievements', name_ar: 'منح الإنجازات', description: 'Award training achievements', description_ar: 'منح إنجازات التدريب', resource: 'training', action: 'award' }
    ];

    const roles: Role[] = [
      {
        id: 'owner',
        name: 'Owner',
        name_ar: 'المالك',
        description: 'Full system access with all permissions',
        description_ar: 'وصول كامل للنظام مع جميع الأذونات',
        permissions: permissions.map(p => p.id),
        is_system_role: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'manager',
        name: 'Manager',
        name_ar: 'المدير',
        description: 'Management level access with most permissions',
        description_ar: 'وصول على مستوى الإدارة مع معظم الأذونات',
        permissions: permissions.filter(p => 
          !p.id.includes('users.delete') && 
          !p.id.includes('backup.delete') &&
          !p.id.includes('training.award')
        ).map(p => p.id),
        is_system_role: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'accountant',
        name: 'Accountant',
        name_ar: 'المحاسب',
        description: 'Financial and reporting access',
        description_ar: 'وصول مالي وتقارير',
        permissions: [
          'inventory.view', 'sales.view', 'customers.view', 'suppliers.view',
          'reports.view', 'reports.create', 'reports.export',
          'settings.view', 'backup.view', 'backup.export'
        ],
        is_system_role: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'cashier',
        name: 'Cashier',
        name_ar: 'أمين الصندوق',
        description: 'Point of sale and basic inventory access',
        description_ar: 'وصول نقاط البيع والمخزون الأساسي',
        permissions: [
          'inventory.view', 'sales.view', 'sales.create', 'sales.update',
          'customers.view', 'customers.create', 'customers.update',
          'reports.view', 'training.view', 'training.start', 'training.update'
        ],
        is_system_role: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'auditor',
        name: 'Auditor',
        name_ar: 'المدقق',
        description: 'Read-only access for auditing purposes',
        description_ar: 'وصول للقراءة فقط لأغراض التدقيق',
        permissions: [
          'inventory.view', 'sales.view', 'customers.view', 'suppliers.view',
          'reports.view', 'reports.export', 'users.view', 'backup.view'
        ],
        is_system_role: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'sysadmin',
        name: 'System Administrator',
        name_ar: 'مدير النظام',
        description: 'Technical system administration access',
        description_ar: 'وصول إدارة النظام التقني',
        permissions: [
          'settings.view', 'settings.update', 'users.view', 'users.create', 'users.update',
          'backup.view', 'backup.create', 'backup.restore', 'backup.delete', 'backup.export', 'backup.import', 'backup.download',
          'training.view', 'training.start', 'training.update', 'training.award'
        ],
        is_system_role: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return {
      roles,
      permissions,
      role_permissions: roles.reduce((acc, role) => {
        acc[role.id] = role.permissions;
        return acc;
      }, {} as { [roleId: string]: string[] })
    };
  }
}
