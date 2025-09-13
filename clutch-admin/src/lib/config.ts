/**
 * Configuration utility for Clutch Admin
 * Centralizes environment variable management
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://clutch-main-nk7x.onrender.com/api',
    baseUrlWithoutApi: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://clutch-main-nk7x.onrender.com',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'wss://clutch-main-nk7x.onrender.com',
    timeout: 30000, // 30 seconds
  },

  // Authentication Configuration
  auth: {
    loginEndpoint: process.env.NEXT_PUBLIC_AUTH_ENDPOINT || '/auth',
    refreshEndpoint: process.env.NEXT_PUBLIC_REFRESH_ENDPOINT || '/auth/refresh',
    logoutEndpoint: process.env.NEXT_PUBLIC_LOGOUT_ENDPOINT || '/auth/logout',
    sessionTimeout: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '3600'),
    refreshThreshold: parseInt(process.env.NEXT_PUBLIC_REFRESH_THRESHOLD || '300'),
  },

  // Application Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Clutch Admin',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NEXT_PUBLIC_APP_ENVIRONMENT || 'development',
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
  },

  // Feature Flags
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    realTime: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME === 'true',
    export: process.env.NEXT_PUBLIC_ENABLE_EXPORT === 'true',
    notifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  },

  // UI Configuration
  ui: {
    theme: {
      primaryColor: '#ED1B24', // Clutch Red
      secondaryColor: '#3B82F6', // Clutch Blue
      successColor: '#059669',
      warningColor: '#D97706',
      errorColor: '#DC2626',
      infoColor: '#0284C7',
    },
    layout: {
      sidebarWidth: 256,
      headerHeight: 64,
      footerHeight: 48,
    },
    animations: {
      duration: 300,
      easing: 'ease-in-out',
    },
  },

  // Development Configuration
  dev: {
    mockData: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
    apiLogging: process.env.NODE_ENV === 'development',
    performanceMonitoring: process.env.NODE_ENV === 'development',
  },
} as const

// Type definitions for better TypeScript support
export type Config = typeof config
export type ApiConfig = typeof config.api
export type AuthConfig = typeof config.auth
export type AppConfig = typeof config.app
export type FeatureConfig = typeof config.features
export type UIConfig = typeof config.ui

// Validation function to check if all required config is present
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required API configuration
  if (!config.api.baseUrl) {
    errors.push('API base URL is required')
  }

  // Check required auth configuration
  if (!config.auth.loginEndpoint) {
    errors.push('Auth login endpoint is required')
  }

  // Check required app configuration
  if (!config.app.name) {
    errors.push('App name is required')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  const baseUrl = config.api.baseUrl.endsWith('/') 
    ? config.api.baseUrl.slice(0, -1) 
    : config.api.baseUrl
  
  const cleanEndpoint = endpoint.startsWith('/') 
    ? endpoint 
    : `/${endpoint}`
  
  return `${baseUrl}${cleanEndpoint}`
}

// Helper function to get WebSocket URL
export function getWebSocketUrl(endpoint: string): string {
  const baseUrl = config.api.wsUrl.endsWith('/') 
    ? config.api.wsUrl.slice(0, -1) 
    : config.api.wsUrl
  
  const cleanEndpoint = endpoint.startsWith('/') 
    ? endpoint 
    : `/${endpoint}`
  
  return `${baseUrl}${cleanEndpoint}`
}

// Helper function to check if feature is enabled
export function isFeatureEnabled(feature: keyof typeof config.features): boolean {
  return config.features[feature]
}

// Helper function to get environment info
export function getEnvironmentInfo() {
  return {
    environment: config.app.environment,
    version: config.app.version,
    debugMode: config.app.debugMode,
    apiUrl: config.api.baseUrl,
    features: config.features,
  }
}

export default config
