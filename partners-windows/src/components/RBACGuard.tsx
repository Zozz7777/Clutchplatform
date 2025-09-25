import React from 'react';
import { useRBAC } from '../hooks/useRBAC';

interface RBACGuardProps {
  children: React.ReactNode;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
  fallback?: React.ReactNode;
  requireAll?: boolean;
  permissions?: Array<{resource: string, action: string}>;
}

export const RBACGuard: React.FC<RBACGuardProps> = ({
  children,
  resource,
  action,
  conditions,
  fallback = null,
  requireAll = false,
  permissions
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useRBAC();

  let hasAccess = false;

  if (permissions) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  } else {
    hasAccess = hasPermission(resource, action, conditions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Higher-order component for RBAC protection
export function withRBAC<P extends object>(
  Component: React.ComponentType<P>,
  resource: string,
  action: string,
  conditions?: Record<string, any>
) {
  return function RBACProtectedComponent(props: P) {
    return (
      <RBACGuard resource={resource} action={action} conditions={conditions}>
        <Component {...props} />
      </RBACGuard>
    );
  };
}

// Specific RBAC guards for common use cases
export const DashboardGuard: React.FC<{children: React.ReactNode; fallback?: React.ReactNode}> = ({ children, fallback }) => (
  <RBACGuard resource="dashboard" action="view" fallback={fallback}>
    {children}
  </RBACGuard>
);

export const OrdersGuard: React.FC<{children: React.ReactNode; action?: 'view' | 'create' | 'update' | 'delete' | 'manage'; fallback?: React.ReactNode}> = ({ 
  children, 
  action = 'view', 
  fallback 
}) => (
  <RBACGuard resource="orders" action={action} fallback={fallback}>
    {children}
  </RBACGuard>
);

export const POSGuard: React.FC<{children: React.ReactNode; action?: 'view' | 'use' | 'manage'; fallback?: React.ReactNode}> = ({ 
  children, 
  action = 'view', 
  fallback 
}) => (
  <RBACGuard resource="pos" action={action} fallback={fallback}>
    {children}
  </RBACGuard>
);

export const InventoryGuard: React.FC<{children: React.ReactNode; action?: 'view' | 'create' | 'update' | 'delete' | 'manage' | 'import' | 'export'; fallback?: React.ReactNode}> = ({ 
  children, 
  action = 'view', 
  fallback 
}) => (
  <RBACGuard resource="inventory" action={action} fallback={fallback}>
    {children}
  </RBACGuard>
);

export const ReportsGuard: React.FC<{children: React.ReactNode; action?: 'view' | 'generate' | 'export' | 'manage'; fallback?: React.ReactNode}> = ({ 
  children, 
  action = 'view', 
  fallback 
}) => (
  <RBACGuard resource="reports" action={action} fallback={fallback}>
    {children}
  </RBACGuard>
);

export const UsersGuard: React.FC<{children: React.ReactNode; action?: 'view' | 'create' | 'update' | 'delete' | 'manage'; fallback?: React.ReactNode}> = ({ 
  children, 
  action = 'view', 
  fallback 
}) => (
  <RBACGuard resource="users" action={action} fallback={fallback}>
    {children}
  </RBACGuard>
);

export const SettingsGuard: React.FC<{children: React.ReactNode; action?: 'view' | 'update' | 'manage'; fallback?: React.ReactNode}> = ({ 
  children, 
  action = 'view', 
  fallback 
}) => (
  <RBACGuard resource="settings" action={action} fallback={fallback}>
    {children}
  </RBACGuard>
);

export const SyncGuard: React.FC<{children: React.ReactNode; action?: 'view' | 'manage'; fallback?: React.ReactNode}> = ({ 
  children, 
  action = 'view', 
  fallback 
}) => (
  <RBACGuard resource="sync" action={action} fallback={fallback}>
    {children}
  </RBACGuard>
);

export const AuditGuard: React.FC<{children: React.ReactNode; action?: 'view' | 'export'; fallback?: React.ReactNode}> = ({ 
  children, 
  action = 'view', 
  fallback 
}) => (
  <RBACGuard resource="audit" action={action} fallback={fallback}>
    {children}
  </RBACGuard>
);
