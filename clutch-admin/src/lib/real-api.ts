import { apiService } from "./api";
import { errorHandler, withErrorHandling, handleApiResponse } from "./error-handler";

// Real API service that replaces mock data
export class RealApiService {
  
  // Dashboard APIs
  async getKPIMetrics(): Promise<any[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<any[]>("/api/v1/dashboard/kpis");
        return handleApiResponse(response, 'getKPIMetrics', []);
      },
      'getKPIMetrics',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getFleetVehicles(): Promise<any[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<any[]>("/api/v1/fleet/vehicles");
        return handleApiResponse(response, 'getFleetVehicles', []);
      },
      'getFleetVehicles',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getNotifications(): Promise<any[]> {
    // TODO: Implement notifications endpoint in backend
    console.warn("Notifications endpoint not implemented in backend yet");
    return [];
  }

  // User Management APIs
  async getUsers(): Promise<any[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<any[]>("/api/v1/users");
        return handleApiResponse(response, 'getUsers', []);
      },
      'getUsers',
      { fallbackValue: [], showToast: true }
    )();
  }

  async createUser(userData: any): Promise<any> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<any>("/api/v1/users", {
          method: "POST",
          body: JSON.stringify(userData),
        });
        return handleApiResponse(response, 'createUser', null);
      },
      'createUser',
      { fallbackValue: null, showToast: true }
    )();
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    const response = await apiService.request<any>(`/api/v1/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
    return response.success ? response.data : null;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const response = await apiService.request<any>(`/api/v1/users/${userId}`, {
      method: "DELETE",
    });
    return response.success;
  }

  // Fleet Management APIs - getFleetVehicles already defined above

  async createFleetVehicle(vehicleData: any): Promise<any> {
    const response = await apiService.request<any>("/api/v1/fleet/vehicles", {
      method: "POST",
      body: JSON.stringify(vehicleData),
    });
    return response.success ? response.data : null;
  }

  async updateFleetVehicle(vehicleId: string, vehicleData: any): Promise<any> {
    const response = await apiService.request<any>(`/api/v1/fleet/vehicles/${vehicleId}`, {
      method: "PUT",
      body: JSON.stringify(vehicleData),
    });
    return response.success ? response.data : null;
  }

  async deleteFleetVehicle(vehicleId: string): Promise<boolean> {
    const response = await apiService.request<any>(`/api/v1/fleet/vehicles/${vehicleId}`, {
      method: "DELETE",
    });
    return response.success;
  }

  async optimizeRoutes(): Promise<any> {
    const response = await apiService.request<any>("/api/v1/fleet/optimize-routes", {
      method: "POST",
    });
    return response.success ? response.data : null;
  }

  // Analytics APIs
  async getAnalyticsMetrics(): Promise<any> {
    const response = await apiService.request<any>("/api/v1/analytics/metrics");
    return response.success ? response.data : null;
  }

  async getAnalyticsData(type: string, dateRange?: any): Promise<any> {
    const response = await apiService.request<any>(`/api/v1/analytics/${type}`, {
      method: "POST",
      body: JSON.stringify({ dateRange }),
    });
    return response.success ? response.data : null;
  }

  async generateReport(reportData: any): Promise<any> {
    const response = await apiService.request<any>("/api/v1/reports/generate", {
      method: "POST",
      body: JSON.stringify(reportData),
    });
    return response.success ? response.data : null;
  }

  async exportData(type: string, format: string = 'csv'): Promise<any> {
    const response = await apiService.request<any>(`/api/v1/export/${type}`, {
      method: "POST",
      body: JSON.stringify({ format }),
    });
    return response.success ? response.data : null;
  }

  // CRM APIs
  async getCustomers(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/crm/customers");
    return response.success ? response.data : [];
  }

  async getTickets(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/crm/tickets");
    return response.success ? response.data : [];
  }

  async createTicket(ticketData: any): Promise<any> {
    const response = await apiService.request<any>("/api/crm/tickets", {
      method: "POST",
      body: JSON.stringify(ticketData),
    });
    return response.success ? response.data : null;
  }

  async updateTicket(ticketId: string, ticketData: any): Promise<any> {
    const response = await apiService.request<any>(`/api/crm/tickets/${ticketId}`, {
      method: "PUT",
      body: JSON.stringify(ticketData),
    });
    return response.success ? response.data : null;
  }

  // Finance APIs
  async getPayments(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/finance/payments");
    return response.success ? response.data : [];
  }

  async getSubscriptions(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/finance/subscriptions");
    return response.success ? response.data : [];
  }

  async getFinancialMetrics(): Promise<any> {
    const response = await apiService.request<any>("/api/v1/finance/metrics");
    return response.success ? response.data : null;
  }

  // Settings APIs
  async getSystemSettings(): Promise<any> {
    const response = await apiService.request<any>("/api/v1/settings/system");
    return response.success ? response.data : null;
  }

  async updateSystemSettings(settings: any): Promise<boolean> {
    const response = await apiService.request<any>("/api/v1/settings/system", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
    return response.success;
  }

  async getIntegrations(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/settings/integrations");
    return response.success ? response.data : [];
  }

  async updateIntegration(integrationId: string, config: any): Promise<boolean> {
    const response = await apiService.request<any>(`/api/v1/settings/integrations/${integrationId}`, {
      method: "PUT",
      body: JSON.stringify(config),
    });
    return response.success;
  }

  // System Health APIs
  async getSystemHealth(): Promise<any> {
    const response = await apiService.request<any>("/api/v1/system/health");
    return response.success ? response.data : null;
  }

  async getApiPerformance(): Promise<any> {
    const response = await apiService.request<any>("/api/v1/system/api-performance");
    return response.success ? response.data : null;
  }

  // Feature Flags APIs
  async getFeatureFlags(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/feature-flags");
    return response.success ? response.data : [];
  }

  async updateFeatureFlag(flagId: string, enabled: boolean): Promise<boolean> {
    const response = await apiService.request<any>(`/api/v1/feature-flags/${flagId}`, {
      method: "PUT",
      body: JSON.stringify({ enabled }),
    });
    return response.success;
  }

  // Audit Trail APIs
  async getAuditLogs(filters?: any): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/audit/logs", {
      method: "POST",
      body: JSON.stringify({ filters }),
    });
    return response.success ? response.data : [];
  }

  // Chat/Messaging APIs
  async getChatMessages(conversationId?: string): Promise<any[]> {
    const response = await apiService.request<any[]>(`/api/v1/chat/messages${conversationId ? `?conversationId=${conversationId}` : ''}`);
    return response.success ? response.data : [];
  }

  async sendMessage(messageData: any): Promise<any> {
    const response = await apiService.request<any>("/api/v1/chat/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    });
    return response.success ? response.data : null;
  }

  // Reports APIs
  async getReports(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/reports");
    return response.success ? response.data : [];
  }

  async getReport(reportId: string): Promise<any> {
    const response = await apiService.request<any>(`/api/v1/reports/${reportId}`);
    return response.success ? response.data : null;
  }

  async deleteReport(reportId: string): Promise<boolean> {
    const response = await apiService.request<any>(`/api/v1/reports/${reportId}`, {
      method: "DELETE",
    });
    return response.success;
  }

  // Asset Management APIs
  async getAssets(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/assets");
    return response.success ? response.data : [];
  }

  async getMaintenanceRecords(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/assets/maintenance");
    return response.success ? response.data : [];
  }

  async getAssetAssignments(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/assets/assignments");
    return response.success ? response.data : [];
  }

  // Project Management APIs
  async getProjects(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/projects");
    return response.success ? response.data : [];
  }

  async getProjectTasks(projectId: string): Promise<any[]> {
    const response = await apiService.request<any[]>(`/api/v1/projects/${projectId}/tasks`);
    return response.success ? response.data : [];
  }

  async getTimeTracking(projectId: string): Promise<any[]> {
    const response = await apiService.request<any[]>(`/api/v1/projects/${projectId}/time-tracking`);
    return response.success ? response.data : [];
  }

  // Feature Flags APIs - Additional methods
  async getABTests(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/feature-flags/ab-tests");
    return response.success ? response.data : [];
  }

  async getRollouts(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/feature-flags/rollouts");
    return response.success ? response.data : [];
  }

  // Analytics APIs - Additional methods (getAnalyticsMetrics already defined above)

  // Finance APIs (getPayments already defined above)

  async getExpenses(): Promise<any[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<any[]>("/api/v1/finance/expenses");
        return handleApiResponse(response, 'getExpenses', []);
      },
      'getExpenses',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getSubscriptions(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/finance/subscriptions");
    return response.success ? response.data : [];
  }

  async getPayouts(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/finance/payouts");
    return response.success ? response.data : [];
  }

  async createPayment(paymentData: any): Promise<any> {
    const response = await apiService.request<any>("/api/finance/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
    return response.success ? response.data : null;
  }

  async updatePayment(paymentId: string, paymentData: any): Promise<any> {
    const response = await apiService.request<any>(`/api/finance/payments/${paymentId}`, {
      method: "PUT",
      body: JSON.stringify(paymentData),
    });
    return response.success ? response.data : null;
  }

  async deletePayment(paymentId: string): Promise<boolean> {
    const response = await apiService.request<any>(`/api/finance/payments/${paymentId}`, {
      method: "DELETE",
    });
    return response.success;
  }

  // CRM APIs (getCustomers already defined above)

  async getTickets(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/crm/tickets");
    return response.success ? response.data : [];
  }

  async createCustomer(customerData: any): Promise<any> {
    const response = await apiService.request<any>("/api/crm/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    });
    return response.success ? response.data : null;
  }

  async updateCustomer(customerId: string, customerData: any): Promise<any> {
    const response = await apiService.request<any>(`/api/crm/customers/${customerId}`, {
      method: "PUT",
      body: JSON.stringify(customerData),
    });
    return response.success ? response.data : null;
  }

  async deleteCustomer(customerId: string): Promise<boolean> {
    const response = await apiService.request<any>(`/api/crm/customers/${customerId}`, {
      method: "DELETE",
    });
    return response.success;
  }

  // AI/ML APIs
  async getAIModels(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/ai-ml/models");
    return response.success ? response.data : [];
  }

  async getFraudCases(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/ai-ml/fraud-cases");
    return response.success ? response.data : [];
  }

  async getRecommendations(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/ai-ml/recommendations");
    return response.success ? response.data : [];
  }

  async trainModel(modelId: string): Promise<any> {
    const response = await apiService.request<any>(`/api/v1/ai-ml/models/${modelId}/train`, {
      method: "POST",
    });
    return response.success ? response.data : null;
  }

  async updateModel(modelId: string, modelData: any): Promise<any> {
    const response = await apiService.request<any>(`/api/v1/ai-ml/models/${modelId}`, {
      method: "PUT",
      body: JSON.stringify(modelData),
    });
    return response.success ? response.data : null;
  }

  // Vendor Management APIs
  async getVendors(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/vendors");
    return response.success ? response.data : [];
  }

  async createVendor(vendorData: any): Promise<any> {
    const response = await apiService.request<any>("/api/v1/vendors", {
      method: "POST",
      body: JSON.stringify(vendorData),
    });
    return response.success ? response.data : null;
  }

  async updateVendor(vendorId: string, vendorData: any): Promise<any> {
    const response = await apiService.request<any>(`/api/v1/vendors/${vendorId}`, {
      method: "PUT",
      body: JSON.stringify(vendorData),
    });
    return response.success ? response.data : null;
  }

  async deleteVendor(vendorId: string): Promise<boolean> {
    const response = await apiService.request<any>(`/api/v1/vendors/${vendorId}`, {
      method: "DELETE",
    });
    return response.success;
  }

  // Integration Management APIs
  async getIntegrations(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/integrations");
    return response.success ? response.data : [];
  }

  async createIntegration(integrationData: any): Promise<any> {
    const response = await apiService.request<any>("/api/v1/integrations", {
      method: "POST",
      body: JSON.stringify(integrationData),
    });
    return response.success ? response.data : null;
  }

  async updateIntegration(integrationId: string, integrationData: any): Promise<any> {
    const response = await apiService.request<any>(`/api/v1/integrations/${integrationId}`, {
      method: "PUT",
      body: JSON.stringify(integrationData),
    });
    return response.success ? response.data : null;
  }

  async deleteIntegration(integrationId: string): Promise<boolean> {
    const response = await apiService.request<any>(`/api/v1/integrations/${integrationId}`, {
      method: "DELETE",
    });
    return response.success;
  }

  // Feature Flags APIs
  async getFeatureFlags(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/feature-flags");
    return response.success ? response.data : [];
  }

  async createFeatureFlag(flagData: any): Promise<any> {
    const response = await apiService.request<any>("/api/v1/feature-flags", {
      method: "POST",
      body: JSON.stringify(flagData),
    });
    return response.success ? response.data : null;
  }

  async updateFeatureFlag(flagId: string, flagData: any): Promise<any> {
    const response = await apiService.request<any>(`/api/v1/feature-flags/${flagId}`, {
      method: "PUT",
      body: JSON.stringify(flagData),
    });
    return response.success ? response.data : null;
  }

  async deleteFeatureFlag(flagId: string): Promise<boolean> {
    const response = await apiService.request<any>(`/api/v1/feature-flags/${flagId}`, {
      method: "DELETE",
    });
    return response.success;
  }

  // System Monitoring APIs
  async getSystemHealth(): Promise<any> {
    const response = await apiService.request<any>("/api/v1/monitoring/health");
    return response.success ? response.data : null;
  }

  async getPerformanceMetrics(): Promise<any> {
    const response = await apiService.request<any>("/api/v1/monitoring/performance");
    return response.success ? response.data : null;
  }

  async getSystemAlerts(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/monitoring/alerts");
    return response.success ? response.data : [];
  }

  // Revenue Forecasting APIs
  async getRevenueForecast(): Promise<any> {
    const response = await apiService.request<any>("/api/v1/revenue/forecast");
    return response.success ? response.data : null;
  }

  async getRevenueScenarios(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/revenue/scenarios");
    return response.success ? response.data : [];
  }

  // CMS APIs
  async getCMSContent(): Promise<any> {
    const response = await apiService.request<any>("/api/v1/cms/content");
    return response.success ? response.data : null;
  }

  async updateCMSContent(contentData: any): Promise<any> {
    const response = await apiService.request<any>("/api/v1/cms/content", {
      method: "PUT",
      body: JSON.stringify(contentData),
    });
    return response.success ? response.data : null;
  }

  // Knowledge Base APIs
  async getKnowledgeArticles(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/knowledge/articles");
    return response.success ? response.data : [];
  }

  async createKnowledgeArticle(articleData: any): Promise<any> {
    const response = await apiService.request<any>("/api/v1/knowledge/articles", {
      method: "POST",
      body: JSON.stringify(articleData),
    });
    return response.success ? response.data : null;
  }

  async updateKnowledgeArticle(articleId: string, articleData: any): Promise<any> {
    const response = await apiService.request<any>(`/api/v1/knowledge/articles/${articleId}`, {
      method: "PUT",
      body: JSON.stringify(articleData),
    });
    return response.success ? response.data : null;
  }

  async deleteKnowledgeArticle(articleId: string): Promise<boolean> {
    const response = await apiService.request<any>(`/api/v1/knowledge/articles/${articleId}`, {
      method: "DELETE",
    });
    return response.success;
  }

  // User Segments APIs
  async getUserSegments(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/users/segments");
    return response.success ? response.data : [];
  }

  async createUserSegment(segmentData: any): Promise<any> {
    const response = await apiService.request<any>("/api/v1/users/segments", {
      method: "POST",
      body: JSON.stringify(segmentData),
    });
    return response.success ? response.data : null;
  }

  async updateUserSegment(segmentId: string, segmentData: any): Promise<any> {
    const response = await apiService.request<any>(`/api/v1/users/segments/${segmentId}`, {
      method: "PUT",
      body: JSON.stringify(segmentData),
    });
    return response.success ? response.data : null;
  }

  async deleteUserSegment(segmentId: string): Promise<boolean> {
    const response = await apiService.request<any>(`/api/v1/users/segments/${segmentId}`, {
      method: "DELETE",
    });
    return response.success;
  }

  // File Upload/Download APIs
  async uploadFile(file: File, type: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await apiService.request<any>("/api/v1/files/upload", {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary
      },
    });
    return response.success ? response.data : null;
  }

  async downloadFile(fileId: string): Promise<Blob> {
    const response = await fetch(`${apiService.baseURL}/api/v1/files/${fileId}/download`, {
      headers: {
        'Authorization': `Bearer ${apiService.getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    
    return response.blob();
  }

  // Real-time Communication APIs
  async sendMessage(messageData: any): Promise<any> {
    const response = await apiService.request<any>("/api/v1/chat/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    });
    return response.success ? response.data : null;
  }

  async getChatSessions(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/chat/sessions");
    return response.success ? response.data : [];
  }

  async createChatSession(sessionData: any): Promise<any> {
    const response = await apiService.request<any>("/api/v1/chat/sessions", {
      method: "POST",
      body: JSON.stringify(sessionData),
    });
    return response.success ? response.data : null;
  }

  // Payment Processing APIs
  async processPayment(paymentData: any): Promise<any> {
    const response = await apiService.request<any>("/api/v1/payments/process", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
    return response.success ? response.data : null;
  }

  async refundPayment(paymentId: string, refundData: any): Promise<any> {
    const response = await apiService.request<any>(`/api/v1/payments/${paymentId}/refund`, {
      method: "POST",
      body: JSON.stringify(refundData),
    });
    return response.success ? response.data : null;
  }

  async getPaymentMethods(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/payments/methods");
    return response.success ? response.data : [];
  }
}

export const realApi = new RealApiService();
