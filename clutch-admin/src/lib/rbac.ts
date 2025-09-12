'use client'

// Role definitions
export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  VIEWER = 'viewer'
}

// Permission definitions
export enum Permission {
  // User Management
  CREATE_USER = 'create_user',
  READ_USER = 'read_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  
  // Content Management
  CREATE_CONTENT = 'create_content',
  READ_CONTENT = 'read_content',
  UPDATE_CONTENT = 'update_content',
  DELETE_CONTENT = 'delete_content',
  
  // Analytics
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_ANALYTICS = 'export_analytics',
  
  // System Administration
  MANAGE_SYSTEM = 'manage_system',
  VIEW_LOGS = 'view_logs',
  MANAGE_ROLES = 'manage_roles',
  
  // Mobile App Management
  MANAGE_MOBILE_APPS = 'manage_mobile_apps',
  VIEW_MOBILE_CRASHES = 'view_mobile_crashes',
  
  // Revenue & Pricing
  VIEW_REVENUE = 'view_revenue',
  MANAGE_PRICING = 'manage_pricing',
  
  // SEO Management
  MANAGE_SEO = 'manage_seo',
  
  // Media Management
  MANAGE_MEDIA = 'manage_media',
  
  // Knowledge Base
  MANAGE_KNOWLEDGE_BASE = 'manage_knowledge_base',
  
  // Incident Management
  MANAGE_INCIDENTS = 'manage_incidents',
  
  // Feedback System
  MANAGE_FEEDBACK = 'manage_feedback',
  
  // User Segments & Cohorts
  MANAGE_USER_SEGMENTS = 'manage_user_segments',
  MANAGE_USER_COHORTS = 'manage_user_cohorts'
}

// Role-Permission mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission), // All permissions
  
  [Role.ADMIN]: [
    Permission.CREATE_USER,
    Permission.READ_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.CREATE_CONTENT,
    Permission.READ_CONTENT,
    Permission.UPDATE_CONTENT,
    Permission.DELETE_CONTENT,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.VIEW_LOGS,
    Permission.MANAGE_MOBILE_APPS,
    Permission.VIEW_MOBILE_CRASHES,
    Permission.VIEW_REVENUE,
    Permission.MANAGE_PRICING,
    Permission.MANAGE_SEO,
    Permission.MANAGE_MEDIA,
    Permission.MANAGE_KNOWLEDGE_BASE,
    Permission.MANAGE_INCIDENTS,
    Permission.MANAGE_FEEDBACK,
    Permission.MANAGE_USER_SEGMENTS,
    Permission.MANAGE_USER_COHORTS
  ],
  
  [Role.MANAGER]: [
    Permission.READ_USER,
    Permission.UPDATE_USER,
    Permission.CREATE_CONTENT,
    Permission.READ_CONTENT,
    Permission.UPDATE_CONTENT,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.VIEW_MOBILE_CRASHES,
    Permission.VIEW_REVENUE,
    Permission.MANAGE_MEDIA,
    Permission.MANAGE_KNOWLEDGE_BASE,
    Permission.MANAGE_INCIDENTS,
    Permission.MANAGE_FEEDBACK,
    Permission.MANAGE_USER_SEGMENTS,
    Permission.MANAGE_USER_COHORTS
  ],
  
  [Role.EMPLOYEE]: [
    Permission.READ_USER,
    Permission.READ_CONTENT,
    Permission.UPDATE_CONTENT,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_KNOWLEDGE_BASE,
    Permission.MANAGE_INCIDENTS,
    Permission.MANAGE_FEEDBACK
  ],
  
  [Role.VIEWER]: [
    Permission.READ_USER,
    Permission.READ_CONTENT,
    Permission.VIEW_ANALYTICS
  ]
}

// Route-Permission mapping
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/dashboard': [Permission.VIEW_ANALYTICS],
  '/users': [Permission.READ_USER],
  '/users/create': [Permission.CREATE_USER],
  '/users/edit': [Permission.UPDATE_USER],
  '/analytics': [Permission.VIEW_ANALYTICS],
  '/analytics/export': [Permission.EXPORT_ANALYTICS],
  '/content': [Permission.READ_CONTENT],
  '/content/create': [Permission.CREATE_CONTENT],
  '/content/edit': [Permission.UPDATE_CONTENT],
  '/system': [Permission.MANAGE_SYSTEM],
  '/system/logs': [Permission.VIEW_LOGS],
  '/system/roles': [Permission.MANAGE_ROLES],
  '/mobile': [Permission.MANAGE_MOBILE_APPS],
  '/mobile/crashes': [Permission.VIEW_MOBILE_CRASHES],
  '/revenue': [Permission.VIEW_REVENUE],
  '/pricing': [Permission.MANAGE_PRICING],
  '/seo': [Permission.MANAGE_SEO],
  '/media': [Permission.MANAGE_MEDIA],
  '/support/knowledge-base': [Permission.MANAGE_KNOWLEDGE_BASE],
  '/support/incidents': [Permission.MANAGE_INCIDENTS],
  '/feedback': [Permission.MANAGE_FEEDBACK],
  '/users/segments': [Permission.MANAGE_USER_SEGMENTS],
  '/users/cohorts': [Permission.MANAGE_USER_COHORTS]
}

// User interface
export interface User {
  id: string
  email: string
  role: Role
  permissions?: Permission[]
  websitePermissions?: string[]
}

// RBAC utility functions
export class RBACManager {
  private static instance: RBACManager
  private currentUser: User | null = null

  private constructor() {}

  static getInstance(): RBACManager {
    if (!RBACManager.instance) {
      RBACManager.instance = new RBACManager()
    }
    return RBACManager.instance
  }

  // Set current user
  setUser(user: User): void {
    this.currentUser = user
  }

  // Get current user
  getUser(): User | null {
    return this.currentUser
  }

  // Check if user has specific permission
  hasPermission(permission: Permission): boolean {
    if (!this.currentUser) return false
    
    // Super admin has all permissions
    if (this.currentUser.role === Role.SUPER_ADMIN) return true
    
    // Check custom permissions first
    if (this.currentUser.permissions?.includes(permission)) return true
    
    // Check role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[this.currentUser.role] || []
    return rolePermissions.includes(permission)
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission))
  }

  // Check if user has all of the specified permissions
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission))
  }

  // Check if user can access a specific route
  canAccessRoute(route: string): boolean {
    const requiredPermissions = ROUTE_PERMISSIONS[route]
    if (!requiredPermissions || requiredPermissions.length === 0) return true
    
    return this.hasAnyPermission(requiredPermissions)
  }

  // Get user's accessible routes
  getAccessibleRoutes(): string[] {
    if (!this.currentUser) return []
    
    return Object.keys(ROUTE_PERMISSIONS).filter(route => 
      this.canAccessRoute(route)
    )
  }

  // Check if user has specific role
  hasRole(role: Role): boolean {
    if (!this.currentUser) return false
    return this.currentUser.role === role
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: Role[]): boolean {
    if (!this.currentUser) return false
    return roles.includes(this.currentUser.role)
  }

  // Get user's effective permissions (role + custom)
  getEffectivePermissions(): Permission[] {
    if (!this.currentUser) return []
    
    const rolePermissions = ROLE_PERMISSIONS[this.currentUser.role] || []
    const customPermissions = this.currentUser.permissions || []
    
    return [...new Set([...rolePermissions, ...customPermissions])]
  }

  // Check if user can perform action on resource
  canPerformAction(action: string, resource: string): boolean {
    const permission = `${action}_${resource}` as Permission
    return this.hasPermission(permission)
  }

  // Get filtered navigation items based on permissions
  getFilteredNavigationItems(navigationItems: any[]): any[] {
    if (!this.currentUser) return []
    
    return navigationItems.filter(item => {
      // Check if item has permission requirements
      if (item.permissions) {
        return this.hasAnyPermission(item.permissions)
      }
      
      // Check if item has route permission
      if (item.href) {
        return this.canAccessRoute(item.href)
      }
      
      // Filter sub-items
      if (item.items) {
        item.items = this.getFilteredNavigationItems(item.items)
        return item.items.length > 0
      }
      
      return true
    })
  }
}

export const rbacManager = RBACManager.getInstance()
