/**
 * Authentication utility functions
 * Provides helper functions for checking authentication status and permissions
 */

export interface AuthStatus {
  isAuthenticated: boolean;
  hasValidToken: boolean;
  tokenExpired: boolean;
  needsRefresh: boolean;
  permissions: string[];
}

/**
 * Check if user is properly authenticated
 */
export function checkAuthStatus(): AuthStatus {
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      hasValidToken: false,
      tokenExpired: true,
      needsRefresh: false,
      permissions: []
    };
  }

  const token = localStorage.getItem('clutch-admin-token');
  const refreshToken = localStorage.getItem('clutch-admin-refresh-token');
  const user = localStorage.getItem('clutch-admin-user');

  if (!token || !user) {
    return {
      isAuthenticated: false,
      hasValidToken: false,
      tokenExpired: true,
      needsRefresh: false,
      permissions: []
    };
  }

  try {
    const parsedUser = JSON.parse(user);
    const permissions = parsedUser.permissions || [];
    
    // Check if token is expired (basic check)
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        const now = Math.floor(Date.now() / 1000);
        const tokenExpired = payload.exp && payload.exp < now;
        
        return {
          isAuthenticated: true,
          hasValidToken: !tokenExpired,
          tokenExpired: !!tokenExpired,
          needsRefresh: !!tokenExpired && !!refreshToken,
          permissions
        };
      } catch {
        // Token format is invalid
        return {
          isAuthenticated: false,
          hasValidToken: false,
          tokenExpired: true,
          needsRefresh: false,
          permissions: []
        };
      }
    }
    
    return {
      isAuthenticated: true,
      hasValidToken: true,
      tokenExpired: false,
      needsRefresh: false,
      permissions
    };
  } catch {
    return {
      isAuthenticated: false,
      hasValidToken: false,
      tokenExpired: true,
      needsRefresh: false,
      permissions: []
    };
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(permission: string): boolean {
  const authStatus = checkAuthStatus();
  return authStatus.permissions.includes(permission) || authStatus.permissions.includes('admin');
}

/**
 * Check if user can access assets data
 */
export function canAccessAssets(): boolean {
  return hasPermission('assets:read') || hasPermission('admin');
}

/**
 * Check if user can access financial data
 */
export function canAccessFinancial(): boolean {
  return hasPermission('finance:read') || hasPermission('admin');
}

/**
 * Get user role from stored user data
 */
export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const user = localStorage.getItem('clutch-admin-user');
    if (!user) return null;
    
    const parsedUser = JSON.parse(user);
    return parsedUser.role || null;
  } catch {
    return null;
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  const role = getUserRole();
  return role === 'admin' || role === 'super_admin';
}

/**
 * Log authentication issues for debugging
 */
export function logAuthIssue(issue: string, context?: string): void {
  const authStatus = checkAuthStatus();
  console.warn(`Authentication Issue: ${issue}`, {
    context,
    authStatus,
    timestamp: new Date().toISOString()
  });
}
