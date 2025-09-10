// Mock authentication system for development when backend rate limiting is too aggressive
export interface MockUser {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
}

export interface MockAuthResponse {
  success: boolean
  data?: {
    user: MockUser
    token: string
    refreshToken: string
  }
  message?: string
}

// Mock user data
const mockUser: MockUser = {
  id: 'mock-admin-001',
  email: 'admin@clutch.com',
  name: 'Admin User',
  role: 'admin',
  permissions: [
    'dashboard:read',
    'dashboard:write',
    'users:read',
    'users:write',
    'users:delete',
    'analytics:read',
    'analytics:write',
    'system:read',
    'system:write'
  ]
}

// Mock token (not a real JWT, just for development)
const mockToken = 'mock-jwt-token-' + Date.now()
const mockRefreshToken = 'mock-refresh-token-' + Date.now()

// Mock API responses
export const mockAuth = {
  login: async (credentials: { email: string; password: string }): Promise<MockAuthResponse> => {
    console.log('🔧 MOCK_AUTH: Login attempt', credentials.email)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simple validation
    if (credentials.email === 'admin@clutch.com' && credentials.password === 'admin123') {
      return {
        success: true,
        data: {
          user: mockUser,
          token: mockToken,
          refreshToken: mockRefreshToken
        }
      }
    } else {
      return {
        success: false,
        message: 'Invalid credentials'
      }
    }
  },

  getCurrentUser: async (): Promise<MockAuthResponse> => {
    console.log('🔧 MOCK_AUTH: Getting current user')
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      success: true,
      data: {
        user: mockUser,
        token: mockToken,
        refreshToken: mockRefreshToken
      }
    }
  },

  refreshToken: async (refreshToken: string): Promise<MockAuthResponse> => {
    console.log('🔧 MOCK_AUTH: Refreshing token')
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      success: true,
      data: {
        user: mockUser,
        token: 'new-mock-token-' + Date.now(),
        refreshToken: 'new-mock-refresh-token-' + Date.now()
      }
    }
  }
}

// Mock API data for dashboard
export const mockApiData = {
  dashboardMetrics: {
    success: true,
    data: {
      period: '30d',
      totalUsers: 1250,
      activeDrivers: 89,
      totalBookings: 2847,
      monthlyRevenue: 125000,
      totalRevenue: 125000,
      totalOrders: 2847,
      activeUsers: 89,
      conversionRate: 0.15,
      averageOrderValue: 85
    }
  },

  platformServices: {
    success: true,
    data: [
      {
        id: 'service-1',
        name: 'API Gateway',
        status: 'operational',
        uptime: '99.9%',
        responseTime: '45ms'
      },
      {
        id: 'service-2',
        name: 'Database',
        status: 'operational',
        uptime: '99.8%',
        responseTime: '12ms'
      },
      {
        id: 'service-3',
        name: 'Authentication',
        status: 'operational',
        uptime: '99.9%',
        responseTime: '23ms'
      }
    ]
  },

  activityLogs: {
    success: true,
    data: {
      logs: [
        {
          id: 'log-1',
          type: 'user_login',
          message: 'Admin user logged in',
          timestamp: new Date().toISOString(),
          userId: 'admin-001'
        },
        {
          id: 'log-2',
          type: 'system_update',
          message: 'System configuration updated',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          userId: 'admin-001'
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        pages: 1
      }
    }
  }
}

// Mock API client methods
export const mockApiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    console.log('🔧 MOCK_API: GET', endpoint)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    if (endpoint.includes('/admin/dashboard/metrics')) {
      return mockApiData.dashboardMetrics as T
    } else if (endpoint.includes('/admin/platform/services')) {
      return mockApiData.platformServices as T
    } else if (endpoint.includes('/admin/activity-logs')) {
      return mockApiData.activityLogs as T
    } else {
      return {
        success: true,
        data: {},
        message: 'Mock response'
      } as T
    }
  },

  post: async <T>(endpoint: string, data: any): Promise<T> => {
    console.log('🔧 MOCK_API: POST', endpoint, data)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      success: true,
      data: {},
      message: 'Mock response'
    } as T
  },

  put: async <T>(endpoint: string, data: any): Promise<T> => {
    console.log('🔧 MOCK_API: PUT', endpoint, data)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      success: true,
      data: {},
      message: 'Mock response'
    } as T
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    console.log('🔧 MOCK_API: DELETE', endpoint)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      success: true,
      data: {},
      message: 'Mock response'
    } as T
  }
}
