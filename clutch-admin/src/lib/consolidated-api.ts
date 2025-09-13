'use client'

/**
 * Consolidated API Service for Clutch Admin
 * Combines the best features from api.ts and api-service.ts
 * Provides comprehensive backend connectivity for all admin operations
 */

import { rateLimiters } from '@/utils/rate-limiter'
import { performanceMonitor } from '@/utils/performanceMonitor'
import { authManager } from './auth-manager'

// Unified API Response Interface
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: any[]
  timestamp?: number
  redirectTo?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

// Data Models
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
  status?: 'success' | 'warning' | 'error' | 'info'
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'pending'
  lastLogin?: string
  createdAt: string
  avatar?: string
}

export interface Driver {
  id: string
  name: string
  email: string
  phone: string
  status: 'available' | 'busy' | 'offline'
  rating: number
  totalDeliveries: number
  currentLocation?: {
    lat: number
    lng: number
  }
  vehicle?: {
    type: string
    plate: string
  }
}

export interface Partner {
  id: string
  name: string
  type: string
  status: 'active' | 'inactive' | 'pending'
  commission: number
  totalOrders: number
  rating: number
  contact: {
    email: string
    phone: string
  }
  address?: string
}

export interface Order {
  id: string
  customer: {
    name: string
    email: string
    phone: string
  }
  driver?: {
    name: string
    id: string
  }
  partner?: {
    name: string
    id: string
  }
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  createdAt: string
  updatedAt: string
  deliveryAddress: string
  estimatedDelivery?: string
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

class ConsolidatedApiService {
  private baseUrl: string
  private token: string | null = null
  private refreshToken: string | null = null
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []
  private lastRequestTime = 0
  private requestDelay = 100
  private useMockAuth = false
  private consecutiveErrors = 0
  private maxConsecutiveErrors = 5
  private circuitBreakerTimeout = 30000
  private circuitBreakerOpen = false
  private circuitBreakerOpenTime = 0

  constructor() {
    // Fix API endpoint configuration - ensure proper /api/v1 prefix
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://clutch-main-nk7x.onrender.com'
    this.baseUrl = baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`
    this.loadTokens()
  }

  private loadTokens() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth-token')
      this.refreshToken = localStorage.getItem('refresh-token')
    }
  }

  public setTokens(token: string, refreshToken: string) {
    this.token = token
    this.refreshToken = refreshToken
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token)
      localStorage.setItem('refresh-token', refreshToken)
    }
  }

  public clearTokens() {
    this.token = null
    this.refreshToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('refresh-token')
    }
  }

  private ensureToken(): boolean {
    if (!this.token) {
      console.warn('🚨 NO_AUTH_TOKEN: Authentication required')
      return false
    }
    return true
  }

  private async handleTokenRefresh<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      // Use the new auth manager for token refresh
      const newToken = await authManager.queueTokenRefresh()
      
      // Update headers with new token
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      }
      
      // Retry the original request
      return this.request<T>(endpoint, options)
    } catch (error) {
      console.error('Token refresh failed:', error)
      authManager.handleAuthError(error)
      
      return {
        success: false,
        message: 'Authentication failed - redirecting to login',
        redirectTo: '/login',
        timestamp: Date.now(),
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    addApiVersion = true
  ): Promise<ApiResponse<T>> {
    // Circuit breaker pattern
    if (this.circuitBreakerOpen) {
      const timeSinceOpen = Date.now() - this.circuitBreakerOpenTime
      if (timeSinceOpen < this.circuitBreakerTimeout) {
        return {
          success: false,
          message: 'Service temporarily unavailable',
          timestamp: Date.now()
        }
      } else {
        this.circuitBreakerOpen = false
        // Circuit breaker reset - attempting requests again
      }
    }

    // Rate limiting
    const rateLimiter = endpoint.includes('/auth/') ? rateLimiters.auth : 
                       endpoint.includes('/dashboard') ? rateLimiters.dashboard :
                       rateLimiters.general
    
    await rateLimiter.waitForSlot()
    rateLimiter.recordRequest()

    // Check authentication
    const requiresAuth = !endpoint.includes('/auth/') && !endpoint.includes('/health')
    
    if (requiresAuth && !this.ensureToken()) {
      return {
        success: false,
        message: 'Authentication required - redirecting to login',
        redirectTo: '/login',
        timestamp: Date.now()
      }
    }

    const baseUrl = addApiVersion ? this.baseUrl : this.baseUrl.replace('/api/v1', '')
    const url = `${baseUrl}${endpoint}`

    // Request delay to avoid overwhelming the server
    const timeSinceLastRequest = Date.now() - this.lastRequestTime
    if (timeSinceLastRequest < this.requestDelay) {
      await new Promise(resolve => setTimeout(resolve, this.requestDelay - timeSinceLastRequest))
    }
    this.lastRequestTime = Date.now()

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      }

      if (this.token && requiresAuth) {
        headers['Authorization'] = `Bearer ${this.token}`
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Handle authentication errors
      if (response.status === 401 && this.refreshToken && requiresAuth) {
        return this.handleTokenRefresh<T>(endpoint, options)
      }

      // Handle other HTTP errors
      if (!response.ok) {
        this.consecutiveErrors++
        if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
          this.circuitBreakerOpen = true
          this.circuitBreakerOpenTime = Date.now()
        }

        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          message: errorData.message || `HTTP error! status: ${response.status}`,
          timestamp: Date.now()
        }
      }

      // Reset error counter on successful request
      this.consecutiveErrors = 0

      const data = await response.json()
      return data
    } catch (error) {
      this.consecutiveErrors++
      if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
        this.circuitBreakerOpen = true
        this.circuitBreakerOpenTime = Date.now()
      }

      console.error(`API request failed for ${endpoint}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        timestamp: Date.now()
      }
    }
  }

  // Authentication APIs
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; refreshToken: string; user: User }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async logout(): Promise<ApiResponse> {
    const result = await this.request('/auth/logout', { method: 'POST' })
    this.clearTokens()
    return result
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/auth/me')
  }

  async refreshAuthToken(): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    if (!this.refreshToken) {
      return {
        success: false,
        message: 'No refresh token available',
        timestamp: Date.now()
      }
    }
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken })
    })
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  // Dashboard APIs
  async getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    return this.request('/admin/dashboard/metrics')
  }

  async getPlatformServices(): Promise<ApiResponse<PlatformService[]>> {
    return this.request('/admin/dashboard/services')
  }

  async getActivityLogs(): Promise<ApiResponse<ActivityLog[]>> {
    return this.request('/admin/dashboard/activity')
  }

  async getRealtimeMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    return this.request('/admin/dashboard/realtime')
  }

  // User Management APIs
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request('/admin/users')
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.request(`/admin/users/${id}`)
  }

  async createUser(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE'
    })
  }

  // Driver Management APIs
  async getDrivers(): Promise<ApiResponse<Driver[]>> {
    return this.request('/admin/drivers')
  }

  async getDriver(id: string): Promise<ApiResponse<Driver>> {
    return this.request(`/admin/drivers/${id}`)
  }

  async updateDriverStatus(id: string, status: Driver['status']): Promise<ApiResponse<Driver>> {
    return this.request(`/admin/drivers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }

  // Partner Management APIs
  async getPartners(): Promise<ApiResponse<Partner[]>> {
    return this.request('/admin/partners')
  }

  async getPartner(id: string): Promise<ApiResponse<Partner>> {
    return this.request(`/admin/partners/${id}`)
  }

  async createPartner(data: Partial<Partner>): Promise<ApiResponse<Partner>> {
    return this.request('/admin/partners', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePartner(id: string, data: Partial<Partner>): Promise<ApiResponse<Partner>> {
    return this.request(`/admin/partners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Order Management APIs
  async getOrders(): Promise<ApiResponse<Order[]>> {
    return this.request('/admin/orders')
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request(`/admin/orders/${id}`)
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<ApiResponse<Order>> {
    return this.request(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }

  // Analytics APIs
  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/admin/analytics')
  }

  async getRevenueData(): Promise<ApiResponse<TimeSeriesData[]>> {
    return this.request('/admin/analytics/revenue')
  }

  // System Health APIs (removed duplicate - see line 825 for the main implementation)

  async getSystemLogs(): Promise<ApiResponse<any[]>> {
    return this.request('/admin/system/logs')
  }

  async triggerSystemMaintenance(): Promise<ApiResponse> {
    return this.request('/admin/system/maintenance', {
      method: 'POST'
    })
  }

  // Business Intelligence APIs
  async getBusinessMetrics(): Promise<ApiResponse<any>> {
    return this.request('/admin/business/metrics')
  }

  async getCustomerInsights(): Promise<ApiResponse<any>> {
    return this.request('/admin/business/customers')
  }

  async getMarketAnalysis(): Promise<ApiResponse<any>> {
    return this.request('/admin/business/market')
  }

  // Notification APIs
  async getNotifications(): Promise<ApiResponse<any[]>> {
    return this.request('/admin/notifications')
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse> {
    return this.request(`/admin/notifications/${id}/read`, {
      method: 'PUT'
    })
  }

  // Chat APIs
  async getChatChannels(): Promise<ApiResponse<any[]>> {
    return this.request('/admin/chat/channels')
  }

  async getChatMessages(channelId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/admin/chat/channels/${channelId}/messages`)
  }

  async sendChatMessage(channelId: string, message: string): Promise<ApiResponse> {
    return this.request(`/admin/chat/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    })
  }

  // Knowledge Base APIs
  async getKnowledgeBase(): Promise<ApiResponse<any>> {
    return this.request('/admin/knowledge-base')
  }

  async createKnowledgeBaseArticle(data: any): Promise<ApiResponse<any>> {
    return this.request('/admin/knowledge-base', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateKnowledgeBaseArticle(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/admin/knowledge-base/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteKnowledgeBaseArticle(id: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/knowledge-base/${id}`, {
      method: 'DELETE'
    })
  }

  // Incident Management APIs
  async getIncidents(): Promise<ApiResponse<any>> {
    return this.request('/admin/incidents')
  }

  async createIncident(data: any): Promise<ApiResponse<any>> {
    return this.request('/admin/incidents', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateIncident(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/admin/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async resolveIncident(id: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/incidents/${id}/resolve`, {
      method: 'POST'
    })
  }

  // Mobile Crashes APIs
  async getMobileCrashes(): Promise<ApiResponse<any>> {
    return this.request('/admin/mobile/crashes')
  }

  async getMobileCrashDetails(id: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/mobile/crashes/${id}`)
  }

  async resolveMobileCrash(id: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/mobile/crashes/${id}/resolve`, {
      method: 'POST'
    })
  }

  // Mobile Content Management APIs
  async getMobileContent(): Promise<ApiResponse<any>> {
    return this.request('/admin/cms/mobile')
  }

  async createMobileContent(data: any): Promise<ApiResponse<any>> {
    return this.request('/admin/cms/mobile', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateMobileContent(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/admin/cms/mobile/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteMobileContent(id: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/cms/mobile/${id}`, {
      method: 'DELETE'
    })
  }

  // Feature Flags APIs
  async getFeatureFlags(): Promise<ApiResponse<any>> {
    return this.request('/admin/feature-flags')
  }

  async createFeatureFlag(data: any): Promise<ApiResponse<any>> {
    return this.request('/admin/feature-flags', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateFeatureFlag(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/admin/feature-flags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async toggleFeatureFlag(id: string, enabled: boolean): Promise<ApiResponse<any>> {
    return this.request(`/admin/feature-flags/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ enabled })
    })
  }

  // Media Library APIs
  async getMediaLibrary(): Promise<ApiResponse<any>> {
    return this.request('/admin/cms/media')
  }

  async uploadMedia(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData()
    formData.append('file', file)
    return this.request('/admin/cms/media/upload', {
      method: 'POST',
      body: formData
    })
  }

  async deleteMedia(id: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/cms/media/${id}`, {
      method: 'DELETE'
    })
  }

  // User Segments APIs
  async getUserSegments(): Promise<ApiResponse<any>> {
    return this.request('/admin/users/segments')
  }

  async createUserSegment(data: any): Promise<ApiResponse<any>> {
    return this.request('/admin/users/segments', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateUserSegment(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/admin/users/segments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteUserSegment(id: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/users/segments/${id}`, {
      method: 'DELETE'
    })
  }

  // User Cohorts APIs (removed duplicate - see line 966 for the main implementation)

  async createUserCohort(data: any): Promise<ApiResponse<any>> {
    return this.request('/admin/users/cohorts', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateUserCohort(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/admin/users/cohorts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteUserCohort(id: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/users/cohorts/${id}`, {
      method: 'DELETE'
    })
  }

  // Feedback APIs
  async getFeedback(): Promise<ApiResponse<any>> {
    return this.request('/admin/support/feedback')
  }

  async updateFeedbackStatus(id: string, status: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/support/feedback/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }

  async replyToFeedback(id: string, reply: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/support/feedback/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply })
    })
  }

  // Pricing Analytics APIs (removed duplicate - see line 925 for the main implementation)

  async updatePricingPlan(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/admin/revenue/pricing/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Revenue Forecasting APIs (removed duplicate - see line 912 for the main implementation)

  async updateRevenueForecast(data: any): Promise<ApiResponse<any>> {
    return this.request('/admin/revenue/forecasting', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // SEO Management APIs
  async getSEOManagement(): Promise<ApiResponse<any>> {
    return this.request('/admin/cms/seo')
  }

  async updateSEOSettings(data: any): Promise<ApiResponse<any>> {
    return this.request('/admin/cms/seo', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Check authentication status
  checkAuthStatus(): boolean | ApiResponse {
    this.loadTokens()
    
    if (!this.token) {
      console.warn('🚨 NO_AUTH_TOKEN: Redirecting to login')
      if (typeof window !== 'undefined') {
        this.clearTokens()
        return {
          success: true,
          message: 'Logged out successfully',
          redirectTo: '/login'
        }
      }
      return false
    }
    
    return true
  }

  getToken(): string | null {
    return this.token
  }
  // System Health & Operations
  async getSystemHealth(): Promise<ApiResponse<{
    metrics: Array<{
      name: string
      value: string
      status: 'healthy' | 'warning' | 'error'
      icon?: string
      trend: string
    }>
    services: Array<{
      name: string
      status: 'healthy' | 'warning' | 'error'
      uptime: string
      responseTime: string
    }>
    alerts: Array<{
      id: number
      type: 'info' | 'warning' | 'error'
      message: string
      timestamp: string
      severity: 'low' | 'medium' | 'high'
    }>
  }>> {
    return this.request('/operations/system-health')
  }

  async getPerformanceMetrics(): Promise<ApiResponse<{
    cpu: number
    memory: number
    disk: number
    network: number
    responseTime: number
    throughput: number
    errorRate: number
  }>> {
    return this.request('/operations/performance')
  }

  async getAPIAnalytics(): Promise<ApiResponse<{
    totalRequests: number
    successRate: number
    averageResponseTime: number
    errorRate: number
    topEndpoints: Array<{
      endpoint: string
      requests: number
      avgResponseTime: number
    }>
  }>> {
    return this.request('/operations/api-analytics')
  }

  async exportSystemHealthReport(): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request('/operations/export-health-report', {
      method: 'POST'
    })
  }

  // Support System
  async getSupportTickets(): Promise<ApiResponse<Array<{
    id: string
    title: string
    status: 'open' | 'in-progress' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    assignee?: string
    createdAt: string
    updatedAt: string
  }>>> {
    return this.request('/support/tickets')
  }

  async getLiveChatSessions(): Promise<ApiResponse<Array<{
    id: string
    customerName: string
    status: 'active' | 'waiting' | 'ended'
    startTime: string
    duration: number
    agent?: string
  }>>> {
    return this.request('/support/live-chat')
  }

  async getCustomerFeedback(): Promise<ApiResponse<Array<{
    id: string
    rating: number
    comment: string
    category: string
    createdAt: string
    resolved: boolean
  }>>> {
    return this.request('/support/feedback')
  }

  // Revenue Analytics
  async getRevenueForecasting(): Promise<ApiResponse<{
    currentMonth: number
    projectedMonth: number
    growthRate: number
    forecast: Array<{
      month: string
      projected: number
      actual?: number
    }>
  }>> {
    return this.request('/revenue/forecasting')
  }

  async getPricingAnalytics(): Promise<ApiResponse<{
    totalRevenue: number
    averageOrderValue: number
    pricingTiers: Array<{
      tier: string
      revenue: number
      customers: number
    }>
  }>> {
    return this.request('/revenue/pricing')
  }

  async getSubscriptionMetrics(): Promise<ApiResponse<{
    totalSubscriptions: number
    activeSubscriptions: number
    churnRate: number
    mrr: number
    arr: number
  }>> {
    return this.request('/revenue/subscriptions')
  }


  async getUserJourney(): Promise<ApiResponse<{
    stages: Array<{
      stage: string
      users: number
      conversionRate: number
    }>
    funnel: Array<{
      step: string
      users: number
      dropoff: number
    }>
  }>> {
    return this.request('/users/journey')
  }

  async getUserCohorts(): Promise<ApiResponse<Array<{
    cohort: string
    size: number
    retention: Array<{
      period: number
      rate: number
    }>
  }>>> {
    return this.request('/users/cohorts')
  }

  // Monitoring
  async getSystemAlerts(): Promise<ApiResponse<Array<{
    id: string
    type: 'system' | 'performance' | 'security'
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    timestamp: string
    resolved: boolean
  }>>> {
    return this.request('/monitoring/alerts')
  }

  async getIncidentManagement(): Promise<ApiResponse<Array<{
    id: string
    title: string
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
    severity: 'low' | 'medium' | 'high' | 'critical'
    startTime: string
    endTime?: string
    description: string
  }>>> {
    return this.request('/monitoring/incidents')
  }

  async getHealthDashboard(): Promise<ApiResponse<{
    overallHealth: 'healthy' | 'warning' | 'critical'
    services: Array<{
      name: string
      status: 'up' | 'down' | 'degraded'
      uptime: number
      responseTime: number
    }>
    metrics: {
      availability: number
      performance: number
      reliability: number
    }
  }>> {
    return this.request('/monitoring/health')
  }
}

export const apiClient = new ConsolidatedApiService()

// Export individual API functions for convenience
export const {
  login,
  logout,
  getCurrentUser,
  refreshAuthToken,
  isAuthenticated,
  getDashboardMetrics,
  getPlatformServices,
  getActivityLogs,
  getRealtimeMetrics,
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
  getSystemHealth,
  getSystemLogs,
  triggerSystemMaintenance,
  getBusinessMetrics,
  getCustomerInsights,
  getMarketAnalysis,
  getNotifications,
  markNotificationAsRead,
  getChatChannels,
  getChatMessages,
  sendChatMessage,
  getKnowledgeBase,
  createKnowledgeBaseArticle,
  updateKnowledgeBaseArticle,
  deleteKnowledgeBaseArticle,
  getIncidents,
  createIncident,
  updateIncident,
  resolveIncident,
  getMobileCrashes,
  getMobileCrashDetails,
  resolveMobileCrash,
  getMobileContent,
  createMobileContent,
  updateMobileContent,
  deleteMobileContent,
  getFeatureFlags,
  createFeatureFlag,
  updateFeatureFlag,
  toggleFeatureFlag,
  getMediaLibrary,
  uploadMedia,
  deleteMedia,
  getUserSegments,
  createUserSegment,
  updateUserSegment,
  deleteUserSegment,
  getUserCohorts,
  createUserCohort,
  updateUserCohort,
  deleteUserCohort,
  getFeedback,
  updateFeedbackStatus,
  replyToFeedback,
  getPricingAnalytics,
  updatePricingPlan,
  getRevenueForecasting,
  updateRevenueForecast,
  getSEOManagement,
  updateSEOSettings,
  checkAuthStatus,
  getToken
} = apiClient
