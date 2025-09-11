'use client'

/**
 * Enhanced API Service for Clutch Admin
 * Provides comprehensive backend connectivity for all admin operations
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: any[]
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

export interface DashboardMetrics {
  totalUsers: number
  activeDrivers: number
  totalPartners: number
  monthlyRevenue: number
  completedDeliveries: number
  pendingOrders: number
  systemHealth: number
  activeConnections: number
  apiResponseTime: number
  uptime: number
}

export interface PlatformService {
  id: string
  name: string
  status: 'online' | 'offline' | 'maintenance' | 'warning'
  performance: number
  uptime: number
  lastChecked: string
  icon: string
  description?: string
}

export interface ActivityLog {
  id: string
  timestamp: string
  user?: string
  action: string
  resource: string
  details?: any
  status: 'success' | 'warning' | 'error' | 'info'
  ipAddress?: string
}

export interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  role: 'admin' | 'manager' | 'employee' | 'driver' | 'partner'
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  lastLogin?: string
  profilePicture?: string
  department?: string
  permissions: string[]
}

export interface Driver {
  id: string
  userId: string
  licenseNumber: string
  vehicleId?: string
  status: 'active' | 'offline' | 'busy' | 'break'
  location?: {
    lat: number
    lng: number
    address: string
  }
  rating: number
  totalDeliveries: number
  earnings: number
  joinedAt: string
}

export interface Partner {
  id: string
  name: string
  type: 'restaurant' | 'store' | 'pharmacy' | 'other'
  email: string
  phone: string
  address: string
  status: 'active' | 'inactive' | 'pending'
  commission: number
  totalOrders: number
  revenue: number
  joinedAt: string
}

export interface Order {
  id: string
  customerId: string
  partnerId: string
  driverId?: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled'
  items: OrderItem[]
  total: number
  fees: {
    delivery: number
    service: number
    tax: number
  }
  addresses: {
    pickup: Address
    delivery: Address
  }
  createdAt: string
  estimatedDelivery?: string
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  options?: any[]
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface RevenueData {
  period: string
  total: number
  bySource: {
    orders: number
    subscriptions: number
    partnerships: number
    advertising: number
  }
  growth: number
  projections?: {
    nextMonth: number
    nextQuarter: number
  }
}

export interface AnalyticsData {
  userGrowth: TimeSeriesData[]
  orderVolume: TimeSeriesData[]
  revenue: TimeSeriesData[]
  partnerGrowth: TimeSeriesData[]
  driverActivity: TimeSeriesData[]
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

class ClutchApiService {
  private baseUrl: string
  private token: string | null = null
  private refreshToken: string | null = null

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://clutch-main-nk7x.onrender.com/api/v1'
    this.loadTokens()
  }

  private loadTokens() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
      this.refreshToken = localStorage.getItem('refresh_token')
    }
  }

  private saveTokens(token: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('refresh_token', refreshToken)
      this.token = token
      this.refreshToken = refreshToken
    }
  }

  private clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      this.token = null
      this.refreshToken = null
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      }

      // Add authentication token if available
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  // Dashboard APIs
  async getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    return this.request<DashboardMetrics>('/admin/dashboard/metrics')
  }

  async getPlatformServices(): Promise<ApiResponse<PlatformService[]>> {
    return this.request<PlatformService[]>('/admin/platform/services')
  }

  async getActivityLogs(limit = 20): Promise<ApiResponse<ActivityLog[]>> {
    return this.request<ActivityLog[]>(`/admin/activity-logs?limit=${limit}`)
  }

  // User Management APIs
  async getUsers(page = 1, limit = 20, filters?: any): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    })
    return this.request<User[]>(`/admin/users?${params}`)
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${id}`)
  }

  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/users/${id}`, {
      method: 'DELETE',
    })
  }

  // Driver Management APIs
  async getDrivers(page = 1, limit = 20, filters?: any): Promise<ApiResponse<Driver[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    })
    return this.request<Driver[]>(`/admin/drivers?${params}`)
  }

  async getDriver(id: string): Promise<ApiResponse<Driver>> {
    return this.request<Driver>(`/admin/drivers/${id}`)
  }

  async updateDriverStatus(id: string, status: Driver['status']): Promise<ApiResponse<Driver>> {
    return this.request<Driver>(`/admin/drivers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // Partner Management APIs
  async getPartners(page = 1, limit = 20, filters?: any): Promise<ApiResponse<Partner[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    })
    return this.request<Partner[]>(`/admin/partners?${params}`)
  }

  async getPartner(id: string): Promise<ApiResponse<Partner>> {
    return this.request<Partner>(`/admin/partners/${id}`)
  }

  async createPartner(partnerData: Partial<Partner>): Promise<ApiResponse<Partner>> {
    return this.request<Partner>('/admin/partners', {
      method: 'POST',
      body: JSON.stringify(partnerData),
    })
  }

  async updatePartner(id: string, partnerData: Partial<Partner>): Promise<ApiResponse<Partner>> {
    return this.request<Partner>(`/admin/partners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(partnerData),
    })
  }

  // Order Management APIs
  async getOrders(page = 1, limit = 20, filters?: any): Promise<ApiResponse<Order[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    })
    return this.request<Order[]>(`/admin/orders?${params}`)
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/admin/orders/${id}`)
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // Analytics APIs
  async getAnalytics(period = '30d'): Promise<ApiResponse<AnalyticsData>> {
    return this.request<AnalyticsData>(`/admin/analytics?period=${period}`)
  }

  async getRevenueData(period = '30d'): Promise<ApiResponse<RevenueData>> {
    return this.request<RevenueData>(`/admin/revenue?period=${period}`)
  }

  // Real-time APIs
  async getRealtimeMetrics(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/realtime/metrics')
  }

  // Notification APIs
  async getNotifications(page = 1, limit = 20): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/admin/notifications?page=${page}&limit=${limit}`)
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/notifications/${id}/read`, {
      method: 'PUT',
    })
  }

  // Chat APIs
  async getChatChannels(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/admin/chat/channels')
  }

  async getChatMessages(channelId: string, limit = 50): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/admin/chat/channels/${channelId}/messages?limit=${limit}`)
  }

  async sendChatMessage(channelId: string, message: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/chat/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  }

  // System Management APIs
  async getSystemHealth(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/system/health')
  }

  async getSystemLogs(level = 'info', limit = 100): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/admin/system/logs?level=${level}&limit=${limit}`)
  }

  async triggerSystemMaintenance(): Promise<ApiResponse<void>> {
    return this.request<void>('/admin/system/maintenance', {
      method: 'POST',
    })
  }

  // Business Intelligence APIs
  async getBusinessMetrics(period = '30d'): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/business/metrics?period=${period}`)
  }

  async getCustomerInsights(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/business/customer-insights')
  }

  async getMarketAnalysis(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/business/market-analysis')
  }

  // Authentication methods
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ user: any; token: string; refreshToken: string }>> {
    const response = await this.request<{ user: any; token: string; refreshToken: string }>('/auth/employee-login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.success && response.data) {
      this.saveTokens(response.data.token, response.data.refreshToken)
    }

    return response
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request<any>('/auth/employee-me')
  }

  async logout(): Promise<void> {
    this.clearTokens()
    // Optionally call logout endpoint
    try {
      await this.request('/auth/logout', { method: 'POST' })
    } catch (error) {
      console.warn('Logout endpoint failed:', error)
    }
  }

  async refreshAuthToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.refreshToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          this.saveTokens(data.data.token, data.data.refreshToken)
          return true
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }

    this.clearTokens()
    return false
  }

  isAuthenticated(): boolean {
    return !!this.token
  }
}

// Create singleton instance
export const clutchApi = new ClutchApiService()

// Export individual API functions for convenience
export const {
  getDashboardMetrics,
  getPlatformServices,
  getActivityLogs,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getDrivers,
  getDriver,
  updateDriverStatus,
  getPartners,
  getPartner,
  createPartner,
  updatePartner,
  getOrders,
  getOrder,
  updateOrderStatus,
  getAnalytics,
  getRevenueData,
  getRealtimeMetrics,
  getNotifications,
  markNotificationAsRead,
  getChatChannels,
  getChatMessages,
  sendChatMessage,
  getSystemHealth,
  getSystemLogs,
  triggerSystemMaintenance,
  getBusinessMetrics,
  getCustomerInsights,
  getMarketAnalysis,
  login,
  getCurrentUser,
  logout,
  refreshAuthToken,
  isAuthenticated,
} = clutchApi
