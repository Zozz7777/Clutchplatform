import { apiService } from "./api";

// Real API service that replaces mock data
export class RealApiService {
  
  // Dashboard APIs
  async getKPIMetrics(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/dashboard/kpis");
    return response.success ? response.data : [];
  }

  async getFleetVehicles(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/fleet/vehicles");
    return response.success ? response.data : [];
  }

  async getNotifications(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/notifications");
    return response.success ? response.data : [];
  }

  // User Management APIs
  async getUsers(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/users");
    return response.success ? response.data : [];
  }

  async createUser(userData: any): Promise<any> {
    const response = await apiService.request<any>("/api/v1/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return response.success ? response.data : null;
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

  // Fleet Management APIs
  async getFleetVehicles(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/fleet/vehicles");
    return response.success ? response.data : [];
  }

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
    const response = await apiService.request<any[]>("/api/v1/crm/customers");
    return response.success ? response.data : [];
  }

  async getTickets(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/crm/tickets");
    return response.success ? response.data : [];
  }

  async createTicket(ticketData: any): Promise<any> {
    const response = await apiService.request<any>("/api/v1/crm/tickets", {
      method: "POST",
      body: JSON.stringify(ticketData),
    });
    return response.success ? response.data : null;
  }

  async updateTicket(ticketId: string, ticketData: any): Promise<any> {
    const response = await apiService.request<any>(`/api/v1/crm/tickets/${ticketId}`, {
      method: "PUT",
      body: JSON.stringify(ticketData),
    });
    return response.success ? response.data : null;
  }

  // Finance APIs
  async getPayments(): Promise<any[]> {
    const response = await apiService.request<any[]>("/api/v1/finance/payments");
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

  // Analytics APIs - Additional methods
  async getAnalyticsMetrics(): Promise<any> {
    const response = await apiService.request<any>("/api/v1/analytics/metrics");
    return response.success ? response.data : null;
  }
}

export const realApi = new RealApiService();
