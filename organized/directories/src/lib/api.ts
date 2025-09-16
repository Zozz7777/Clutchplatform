import { ApiResponse, PaginatedResponse } from '@/types'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const API_TIMEOUT = 10000

// API Client Class
class ApiClient {
  private baseURL: string
  private timeout: number

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL
    this.timeout = timeout
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    // Get auth token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: any): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request('/auth/logout', {
      method: 'POST',
    })
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.request('/auth/refresh', {
      method: 'POST',
    })
  }

  // User endpoints
  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request('/users/me')
  }

  async updateProfile(userData: any): Promise<ApiResponse<any>> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  // Dashboard endpoints
  async getDashboardMetrics(): Promise<ApiResponse<any>> {
    return this.request('/dashboard/metrics')
  }

  async getDashboardCharts(): Promise<ApiResponse<any>> {
    return this.request('/dashboard/charts')
  }

  // HR endpoints
  async getEmployees(params?: any): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/hr/employees${queryString}`)
  }

  async getEmployee(id: string): Promise<ApiResponse<any>> {
    return this.request(`/hr/employees/${id}`)
  }

  async createEmployee(employeeData: any): Promise<ApiResponse<any>> {
    return this.request('/hr/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    })
  }

  async updateEmployee(id: string, employeeData: any): Promise<ApiResponse<any>> {
    return this.request(`/hr/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    })
  }

  async deleteEmployee(id: string): Promise<ApiResponse<void>> {
    return this.request(`/hr/employees/${id}`, {
      method: 'DELETE',
    })
  }

  async getJobPostings(params?: any): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/hr/jobs${queryString}`)
  }

  async createJobPosting(jobData: any): Promise<ApiResponse<any>> {
    return this.request('/hr/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    })
  }

  // Finance endpoints
  async getInvoices(params?: any): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/finance/invoices${queryString}`)
  }

  async getInvoice(id: string): Promise<ApiResponse<any>> {
    return this.request(`/finance/invoices/${id}`)
  }

  async createInvoice(invoiceData: any): Promise<ApiResponse<any>> {
    return this.request('/finance/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    })
  }

  async updateInvoice(id: string, invoiceData: any): Promise<ApiResponse<any>> {
    return this.request(`/finance/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData),
    })
  }

  async getExpenses(params?: any): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/finance/expenses${queryString}`)
  }

  async createExpense(expenseData: any): Promise<ApiResponse<any>> {
    return this.request('/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    })
  }

  async approveExpense(id: string): Promise<ApiResponse<any>> {
    return this.request(`/finance/expenses/${id}/approve`, {
      method: 'PUT',
    })
  }

  // CRM endpoints
  async getCustomers(params?: any): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/crm/customers${queryString}`)
  }

  async getCustomer(id: string): Promise<ApiResponse<any>> {
    return this.request(`/crm/customers/${id}`)
  }

  async createCustomer(customerData: any): Promise<ApiResponse<any>> {
    return this.request('/crm/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    })
  }

  async updateCustomer(id: string, customerData: any): Promise<ApiResponse<any>> {
    return this.request(`/crm/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    })
  }

  async getDeals(params?: any): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/crm/deals${queryString}`)
  }

  async createDeal(dealData: any): Promise<ApiResponse<any>> {
    return this.request('/crm/deals', {
      method: 'POST',
      body: JSON.stringify(dealData),
    })
  }

  async updateDeal(id: string, dealData: any): Promise<ApiResponse<any>> {
    return this.request(`/crm/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dealData),
    })
  }

  // Partners endpoints
  async getPartners(params?: any): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/partners${queryString}`)
  }

  async getPartner(id: string): Promise<ApiResponse<any>> {
    return this.request(`/partners/${id}`)
  }

  async createPartner(partnerData: any): Promise<ApiResponse<any>> {
    return this.request('/partners', {
      method: 'POST',
      body: JSON.stringify(partnerData),
    })
  }

  async updatePartner(id: string, partnerData: any): Promise<ApiResponse<any>> {
    return this.request(`/partners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(partnerData),
    })
  }

  async getPartnerOrders(params?: any): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/partners/orders${queryString}`)
  }

  // Marketing endpoints
  async getCampaigns(params?: any): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/marketing/campaigns${queryString}`)
  }

  async createCampaign(campaignData: any): Promise<ApiResponse<any>> {
    return this.request('/marketing/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    })
  }

  async updateCampaign(id: string, campaignData: any): Promise<ApiResponse<any>> {
    return this.request(`/marketing/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    })
  }

  // Projects endpoints
  async getProjects(params?: any): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/projects${queryString}`)
  }

  async getProject(id: string): Promise<ApiResponse<any>> {
    return this.request(`/projects/${id}`)
  }

  async createProject(projectData: any): Promise<ApiResponse<any>> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    })
  }

  async updateProject(id: string, projectData: any): Promise<ApiResponse<any>> {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    })
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    })
  }

  async getTasks(params?: any): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/projects/tasks${queryString}`)
  }

  async createTask(taskData: any): Promise<ApiResponse<any>> {
    return this.request('/projects/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    })
  }

  async updateTask(id: string, taskData: any): Promise<ApiResponse<any>> {
    return this.request(`/projects/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    })
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.request(`/projects/tasks/${id}`, {
      method: 'DELETE',
    })
  }

  // Communication endpoints
  async getMessages(params?: any): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/communication/messages${queryString}`)
  }

  async getMessage(id: string): Promise<ApiResponse<any>> {
    return this.request(`/communication/messages/${id}`)
  }

  async createMessage(messageData: any): Promise<ApiResponse<any>> {
    return this.request('/communication/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    })
  }

  async updateMessage(id: string, messageData: any): Promise<ApiResponse<any>> {
    return this.request(`/communication/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(messageData),
    })
  }

  async deleteMessage(id: string): Promise<ApiResponse<void>> {
    return this.request(`/communication/messages/${id}`, {
      method: 'DELETE',
    })
  }

  async sendMessage(id: string): Promise<ApiResponse<void>> {
    return this.request(`/communication/messages/${id}/send`, {
      method: 'POST',
    })
  }

  async markMessageAsRead(id: string): Promise<ApiResponse<void>> {
    return this.request(`/communication/messages/${id}/read`, {
      method: 'PUT',
    })
  }

  // Analytics endpoints
  async getAnalytics(module: string, params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/analytics/${module}${queryString}`)
  }

  // Executive Dashboard endpoints
  async getExecutiveDashboard(): Promise<ApiResponse<any>> {
    return this.request('/analytics/executive-dashboard')
  }

  async getKeyPerformanceIndicators(): Promise<ApiResponse<any>> {
    return this.request('/analytics/kpis')
  }

  async getBusinessTrends(period: string = '12months'): Promise<ApiResponse<any>> {
    return this.request(`/analytics/trends?period=${period}`)
  }

  async getBusinessAlerts(): Promise<ApiResponse<any>> {
    return this.request('/analytics/alerts')
  }

  async markAlertAsRead(id: string): Promise<ApiResponse<void>> {
    return this.request(`/analytics/alerts/${id}/read`, {
      method: 'PUT',
    })
  }

  // Department Analytics endpoints
  async getHRAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/analytics/hr')
  }

  async getFinanceAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/analytics/finance')
  }

  async getSalesAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/analytics/sales')
  }

  async getMarketingAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/analytics/marketing')
  }

  async getOperationsAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/analytics/operations')
  }

  // Predictive Analytics endpoints
  async getPredictiveAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/analytics/predictive')
  }

  async getBusinessForecasting(): Promise<ApiResponse<any>> {
    return this.request('/analytics/forecasting')
  }

  async getPredictiveInsights(): Promise<ApiResponse<any>> {
    return this.request('/analytics/insights')
  }

  async getAIRecommendations(): Promise<ApiResponse<any>> {
    return this.request('/analytics/recommendations')
  }

  async getRiskAssessment(): Promise<ApiResponse<any>> {
    return this.request('/analytics/risk-assessment')
  }

  async updateRecommendationStatus(id: string, status: 'implemented' | 'rejected'): Promise<ApiResponse<void>> {
    return this.request(`/analytics/recommendations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // Custom Reporting endpoints
  async getCustomReports(): Promise<ApiResponse<any>> {
    return this.request('/analytics/reports')
  }

  async getReportTemplates(): Promise<ApiResponse<any>> {
    return this.request('/analytics/reports/templates')
  }

  async createCustomReport(reportData: any): Promise<ApiResponse<any>> {
    return this.request('/analytics/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    })
  }

  async updateCustomReport(id: string, reportData: any): Promise<ApiResponse<any>> {
    return this.request(`/analytics/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    })
  }

  async deleteCustomReport(id: string): Promise<ApiResponse<void>> {
    return this.request(`/analytics/reports/${id}`, {
      method: 'DELETE',
    })
  }

  async getCustomDashboards(): Promise<ApiResponse<any>> {
    return this.request('/analytics/dashboards')
  }

  async createCustomDashboard(dashboardData: any): Promise<ApiResponse<any>> {
    return this.request('/analytics/dashboards', {
      method: 'POST',
      body: JSON.stringify(dashboardData),
    })
  }

  async updateCustomDashboard(id: string, dashboardData: any): Promise<ApiResponse<any>> {
    return this.request(`/analytics/dashboards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dashboardData),
    })
  }

  async deleteCustomDashboard(id: string): Promise<ApiResponse<void>> {
    return this.request(`/analytics/dashboards/${id}`, {
      method: 'DELETE',
    })
  }

  async getReportSchedules(): Promise<ApiResponse<any>> {
    return this.request('/analytics/reports/schedules')
  }

  async createReportSchedule(scheduleData: any): Promise<ApiResponse<any>> {
    return this.request('/analytics/reports/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    })
  }

  async updateReportSchedule(id: string, scheduleData: any): Promise<ApiResponse<any>> {
    return this.request(`/analytics/reports/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    })
  }

  async deleteReportSchedule(id: string): Promise<ApiResponse<void>> {
    return this.request(`/analytics/reports/schedules/${id}`, {
      method: 'DELETE',
    })
  }

  async getDataSources(): Promise<ApiResponse<any>> {
    return this.request('/analytics/data-sources')
  }

  async getVisualizationTypes(): Promise<ApiResponse<any>> {
    return this.request('/analytics/visualization-types')
  }

  async exportReport(id: string, format: 'pdf' | 'excel' | 'csv'): Promise<ApiResponse<any>> {
    return this.request(`/analytics/reports/${id}/export?format=${format}`)
  }

  async generateReport(reportData: any): Promise<ApiResponse<any>> {
    return this.request('/analytics/reports/generate', {
      method: 'POST',
      body: JSON.stringify(reportData),
    })
  }

  // File upload
  async uploadFile(file: File, type: string): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    return this.request('/upload', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData
      },
      body: formData,
    })
  }

  // Notifications
  async getNotifications(): Promise<ApiResponse<any[]>> {
    return this.request('/notifications')
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    })
  }

  // Settings
  async getSettings(): Promise<ApiResponse<any>> {
    return this.request('/settings')
  }

  async updateSettings(settings: any): Promise<ApiResponse<any>> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL, API_TIMEOUT)

// Export individual methods for convenience
export const {
  login,
  register,
  logout,
  getCurrentUser,
  getDashboardMetrics,
  getEmployees,
  getInvoices,
  getCustomers,
  getPartners,
  getCampaigns,
  getProjects,
  uploadFile,
} = apiClient
