import React from 'react'
import { useAuth, Permission } from '@/hooks/useAuth'
import { AlertTriangle, Lock } from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'

interface PermissionGuardProps {
  children: React.ReactNode
  permissions?: Permission[]
  roles?: string[]
  fallback?: React.ReactNode
  showAccessDenied?: boolean
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions = [],
  roles = [],
  fallback,
  showAccessDenied = true
}) => {
  const { hasPermission, hasAnyPermission, hasRole, hasAnyRole, user } = useAuth()

  // Check if user has required permissions
  const hasRequiredPermissions = permissions.length === 0 || hasAnyPermission(permissions)

  // Check if user has required roles
  const hasRequiredRoles = roles.length === 0 || hasAnyRole(roles as any)

  // If user has both required permissions and roles, render children
  if (hasRequiredPermissions && hasRequiredRoles) {
    return <>{children}</>
  }

  // If custom fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>
  }

  // If showAccessDenied is false, render nothing
  if (!showAccessDenied) {
    return null
  }

  // Default access denied UI
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <SnowCard className="w-full max-w-md">
        <SnowCardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <SnowCardTitle className="text-xl">Access Denied</SnowCardTitle>
          <SnowCardDescription>
            You don't have permission to access this resource.
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent className="text-center space-y-4">
          {user && (
            <div className="text-sm text-muted-foreground">
              <p>Current role: <span className="font-medium">{user.role}</span></p>
              {permissions.length > 0 && (
                <p>Required permissions: {permissions.map(p => `${p.resource}:${p.action}`).join(', ')}</p>
              )}
              {roles.length > 0 && (
                <p>Required roles: {roles.join(', ')}</p>
              )}
            </div>
          )}
          <SnowButton variant="outline" onClick={() => window.history.back()}>
            Go Back
          </SnowButton>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

// Higher-order component for permission-based rendering
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  permissions?: Permission[],
  roles?: string[]
) => {
  return (props: P) => (
    <PermissionGuard permissions={permissions} roles={roles}>
      <Component {...props} />
    </PermissionGuard>
  )
}

// Hook for conditional rendering based on permissions
export const usePermissionGuard = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } = useAuth()

  return {
    can: (permission: Permission) => hasPermission(permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(permissions),
    hasRole: (role: string) => hasRole(role as any),
    hasAnyRole: (roles: string[]) => hasAnyRole(roles as any),
  }
}

// Component for showing different content based on permissions
interface ConditionalRenderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  permissions?: Permission[]
  roles?: string[]
  condition?: boolean
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  children,
  fallback,
  permissions = [],
  roles = [],
  condition
}) => {
  const { hasAnyPermission, hasAnyRole } = useAuth()

  const hasRequiredPermissions = permissions.length === 0 || hasAnyPermission(permissions)
  const hasRequiredRoles = roles.length === 0 || hasAnyRole(roles as any)
  const meetsCondition = condition === undefined || condition

  if (hasRequiredPermissions && hasRequiredRoles && meetsCondition) {
    return <>{children}</>
  }

  return fallback ? <>{fallback}</> : null
}

// Component for showing warning when user lacks certain permissions
interface PermissionWarningProps {
  permissions?: Permission[]
  roles?: string[]
  message?: string
  showIcon?: boolean
}

export const PermissionWarning: React.FC<PermissionWarningProps> = ({
  permissions = [],
  roles = [],
  message = "You may not have full access to all features on this page.",
  showIcon = true
}) => {
  const { hasAnyPermission, hasAnyRole } = useAuth()

  const hasRequiredPermissions = permissions.length === 0 || hasAnyPermission(permissions)
  const hasRequiredRoles = roles.length === 0 || hasAnyRole(roles as any)

  if (hasRequiredPermissions && hasRequiredRoles) {
    return null
  }

  return (
    <div className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      {showIcon && (
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          {message}
        </p>
        <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
          {permissions.length > 0 && (
            <p>Required permissions: {permissions.map(p => `${p.resource}:${p.action}`).join(', ')}</p>
          )}
          {roles.length > 0 && (
            <p>Required roles: {roles.join(', ')}</p>
          )}
        </div>
      </div>
    </div>
  )
}



