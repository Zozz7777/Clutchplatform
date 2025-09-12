'use client'

import React from 'react'
import { useAuthStore } from '@/store'
import { rbacManager, Permission, Role } from '@/lib/rbac'
import { AlertTriangle, Lock } from 'lucide-react'

interface PermissionGuardProps {
  children: React.ReactNode
  permission?: Permission
  permissions?: Permission[]
  role?: Role
  roles?: Role[]
  requireAll?: boolean
  fallback?: React.ReactNode
  showError?: boolean
  errorMessage?: string
}

export function PermissionGuard({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  requireAll = false,
  fallback = null,
  showError = false,
  errorMessage = 'You do not have permission to access this content.'
}: PermissionGuardProps) {
  const { user } = useAuthStore()
  
  // Set current user in RBAC manager
  React.useEffect(() => {
    if (user) {
      rbacManager.setUser(user)
    }
  }, [user])

  // Check permissions
  const hasPermission = React.useMemo(() => {
    if (!user) return false

    // Check role-based access
    if (role && !rbacManager.hasRole(role)) return false
    if (roles.length > 0 && !rbacManager.hasAnyRole(roles)) return false

    // Check permission-based access
    if (permission && !rbacManager.hasPermission(permission)) return false
    if (permissions.length > 0) {
      if (requireAll) {
        return rbacManager.hasAllPermissions(permissions)
      } else {
        return rbacManager.hasAnyPermission(permissions)
      }
    }

    return true
  }, [user, permission, permissions, role, roles, requireAll])

  if (!hasPermission) {
    if (showError) {
      return (
        <div className="flex items-center justify-center p-8 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Lock className="h-12 w-12 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Access Denied
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      )
    }
    
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Higher-order component for permission-based rendering
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permissionConfig: Omit<PermissionGuardProps, 'children'>
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGuard {...permissionConfig}>
        <Component {...props} />
      </PermissionGuard>
    )
  }
}

// Hook for permission checking
export function usePermissions() {
  const { user } = useAuthStore()
  
  React.useEffect(() => {
    if (user) {
      rbacManager.setUser(user)
    }
  }, [user])

  return {
    hasPermission: (permission: Permission) => rbacManager.hasPermission(permission),
    hasAnyPermission: (permissions: Permission[]) => rbacManager.hasAnyPermission(permissions),
    hasAllPermissions: (permissions: Permission[]) => rbacManager.hasAllPermissions(permissions),
    hasRole: (role: Role) => rbacManager.hasRole(role),
    hasAnyRole: (roles: Role[]) => rbacManager.hasAnyRole(roles),
    canAccessRoute: (route: string) => rbacManager.canAccessRoute(route),
    getAccessibleRoutes: () => rbacManager.getAccessibleRoutes(),
    getEffectivePermissions: () => rbacManager.getEffectivePermissions(),
    user: user
  }
}

// Route-based permission guard
interface RouteGuardProps {
  children: React.ReactNode
  route: string
  fallback?: React.ReactNode
}

export function RouteGuard({ children, route, fallback = null }: RouteGuardProps) {
  const { canAccessRoute } = usePermissions()
  
  if (!canAccessRoute(route)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Conditional rendering component
interface ConditionalRenderProps {
  children: React.ReactNode
  permission?: Permission
  permissions?: Permission[]
  role?: Role
  roles?: Role[]
  requireAll?: boolean
  fallback?: React.ReactNode
}

export function ConditionalRender({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  requireAll = false,
  fallback = null
}: ConditionalRenderProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } = usePermissions()

  const shouldRender = React.useMemo(() => {
    // Check role-based access
    if (role && !hasRole(role)) return false
    if (roles.length > 0 && !hasAnyRole(roles)) return false

    // Check permission-based access
    if (permission && !hasPermission(permission)) return false
    if (permissions.length > 0) {
      if (requireAll) {
        return hasAllPermissions(permissions)
      } else {
        return hasAnyPermission(permissions)
      }
    }

    return true
  }, [permission, permissions, role, roles, requireAll, hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole])

  return shouldRender ? <>{children}</> : <>{fallback}</>
}