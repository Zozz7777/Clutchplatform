import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { rbacService, PERMISSIONS, Permission } from '../utils/rbac';

export interface UseRBACReturn {
  hasPermission: (_resource: string, _action: string, _conditions?: Record<string, any>) => boolean;
  hasAnyPermission: (_permissions: Array<{resource: string, action: string}>) => boolean;
  hasAllPermissions: (_permissions: Array<{resource: string, action: string}>) => boolean;
  getUserPermissions: () => Permission[];
  getUserRoles: () => any[];
  isLoading: boolean;
  error: string | null;
}

export function useRBAC(): UseRBACReturn {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserRoles = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        await rbacService.loadUserRoles(user.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user roles');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRoles();
  }, [user?.id]);

  const hasPermission = useCallback((resource: string, action: string, conditions?: Record<string, any>) => {
    if (!user?.id) return false;
    return rbacService.hasPermission(user.id, resource, action, conditions);
  }, [user?.id]);

  const hasAnyPermission = useCallback((permissions: Array<{resource: string, action: string}>) => {
    if (!user?.id) return false;
    return rbacService.hasAnyPermission(user.id, permissions);
  }, [user?.id]);

  const hasAllPermissions = useCallback((permissions: Array<{resource: string, action: string}>) => {
    if (!user?.id) return false;
    return rbacService.hasAllPermissions(user.id, permissions);
  }, [user?.id]);

  const getUserPermissions = useCallback(() => {
    if (!user?.id) return [];
    return rbacService.getUserPermissions(user.id);
  }, [user?.id]);

  const getUserRoles = useCallback(() => {
    if (!user?.id) return [];
    return rbacService.getUserRoles(user.id);
  }, [user?.id]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    getUserRoles,
    isLoading,
    error
  };
}

// Specific permission hooks for common use cases
export function useDashboardPermissions() {
  const { hasPermission } = useRBAC();
  
  return {
    canView: hasPermission(PERMISSIONS.DASHBOARD.VIEW.resource, PERMISSIONS.DASHBOARD.VIEW.action),
    canManage: hasPermission(PERMISSIONS.DASHBOARD.MANAGE.resource, PERMISSIONS.DASHBOARD.MANAGE.action)
  };
}

export function useOrdersPermissions() {
  const { hasPermission } = useRBAC();
  
  return {
    canView: hasPermission(PERMISSIONS.ORDERS.VIEW.resource, PERMISSIONS.ORDERS.VIEW.action),
    canCreate: hasPermission(PERMISSIONS.ORDERS.CREATE.resource, PERMISSIONS.ORDERS.CREATE.action),
    canUpdate: hasPermission(PERMISSIONS.ORDERS.UPDATE.resource, PERMISSIONS.ORDERS.UPDATE.action),
    canDelete: hasPermission(PERMISSIONS.ORDERS.DELETE.resource, PERMISSIONS.ORDERS.DELETE.action),
    canManage: hasPermission(PERMISSIONS.ORDERS.MANAGE.resource, PERMISSIONS.ORDERS.MANAGE.action)
  };
}

export function usePOSPermissions() {
  const { hasPermission } = useRBAC();
  
  return {
    canView: hasPermission(PERMISSIONS.POS.VIEW.resource, PERMISSIONS.POS.VIEW.action),
    canUse: hasPermission(PERMISSIONS.POS.USE.resource, PERMISSIONS.POS.USE.action),
    canManage: hasPermission(PERMISSIONS.POS.MANAGE.resource, PERMISSIONS.POS.MANAGE.action)
  };
}

export function useInventoryPermissions() {
  const { hasPermission } = useRBAC();
  
  return {
    canView: hasPermission(PERMISSIONS.INVENTORY.VIEW.resource, PERMISSIONS.INVENTORY.VIEW.action),
    canCreate: hasPermission(PERMISSIONS.INVENTORY.CREATE.resource, PERMISSIONS.INVENTORY.CREATE.action),
    canUpdate: hasPermission(PERMISSIONS.INVENTORY.UPDATE.resource, PERMISSIONS.INVENTORY.UPDATE.action),
    canDelete: hasPermission(PERMISSIONS.INVENTORY.DELETE.resource, PERMISSIONS.INVENTORY.DELETE.action),
    canManage: hasPermission(PERMISSIONS.INVENTORY.MANAGE.resource, PERMISSIONS.INVENTORY.MANAGE.action),
    canImport: hasPermission(PERMISSIONS.INVENTORY.IMPORT.resource, PERMISSIONS.INVENTORY.IMPORT.action),
    canExport: hasPermission(PERMISSIONS.INVENTORY.EXPORT.resource, PERMISSIONS.INVENTORY.EXPORT.action)
  };
}

export function useReportsPermissions() {
  const { hasPermission } = useRBAC();
  
  return {
    canView: hasPermission(PERMISSIONS.REPORTS.VIEW.resource, PERMISSIONS.REPORTS.VIEW.action),
    canGenerate: hasPermission(PERMISSIONS.REPORTS.GENERATE.resource, PERMISSIONS.REPORTS.GENERATE.action),
    canExport: hasPermission(PERMISSIONS.REPORTS.EXPORT.resource, PERMISSIONS.REPORTS.EXPORT.action),
    canManage: hasPermission(PERMISSIONS.REPORTS.MANAGE.resource, PERMISSIONS.REPORTS.MANAGE.action)
  };
}

export function useUsersPermissions() {
  const { hasPermission } = useRBAC();
  
  return {
    canView: hasPermission(PERMISSIONS.USERS.VIEW.resource, PERMISSIONS.USERS.VIEW.action),
    canCreate: hasPermission(PERMISSIONS.USERS.CREATE.resource, PERMISSIONS.USERS.CREATE.action),
    canUpdate: hasPermission(PERMISSIONS.USERS.UPDATE.resource, PERMISSIONS.USERS.UPDATE.action),
    canDelete: hasPermission(PERMISSIONS.USERS.DELETE.resource, PERMISSIONS.USERS.DELETE.action),
    canManage: hasPermission(PERMISSIONS.USERS.MANAGE.resource, PERMISSIONS.USERS.MANAGE.action)
  };
}

export function useSettingsPermissions() {
  const { hasPermission } = useRBAC();
  
  return {
    canView: hasPermission(PERMISSIONS.SETTINGS.VIEW.resource, PERMISSIONS.SETTINGS.VIEW.action),
    canUpdate: hasPermission(PERMISSIONS.SETTINGS.UPDATE.resource, PERMISSIONS.SETTINGS.UPDATE.action),
    canManage: hasPermission(PERMISSIONS.SETTINGS.MANAGE.resource, PERMISSIONS.SETTINGS.MANAGE.action)
  };
}

export function useSyncPermissions() {
  const { hasPermission } = useRBAC();
  
  return {
    canView: hasPermission(PERMISSIONS.SYNC.VIEW.resource, PERMISSIONS.SYNC.VIEW.action),
    canManage: hasPermission(PERMISSIONS.SYNC.MANAGE.resource, PERMISSIONS.SYNC.MANAGE.action)
  };
}

export function useAuditPermissions() {
  const { hasPermission } = useRBAC();
  
  return {
    canView: hasPermission(PERMISSIONS.AUDIT.VIEW.resource, PERMISSIONS.AUDIT.VIEW.action),
    canExport: hasPermission(PERMISSIONS.AUDIT.EXPORT.resource, PERMISSIONS.AUDIT.EXPORT.action)
  };
}
