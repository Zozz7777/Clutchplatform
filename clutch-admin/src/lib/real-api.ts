import { apiService } from "./api";
import { errorHandler, withErrorHandling, handleApiResponse } from "./error-handler";

// Real API service that replaces mock data
export class RealApiService {
  
  // Dashboard APIs
  async getKPIMetrics(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/dashboard/kpis");
        return handleApiResponse(response, 'getKPIMetrics', []);
      },
      'getKPIMetrics',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getFleetVehicles(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/fleet/vehicles");
        return handleApiResponse(response, 'getFleetVehicles', []);
      },
      'getFleetVehicles',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getNotifications(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/notifications");
        return handleApiResponse(response, 'getNotifications', []);
      },
      'getNotifications',
      { fallbackValue: [], showToast: false }
    )();
  }

  // User Management APIs
  async getUsers(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/users");
        return handleApiResponse(response, 'getUsers', []);
      },
      'getUsers',
      { fallbackValue: [], showToast: true }
    )();
  }

  async createUser(userData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/users", {
          method: "POST",
          body: JSON.stringify(userData),
        });
        return handleApiResponse(response, 'createUser', null);
      },
      'createUser',
      { fallbackValue: null, showToast: true }
    )();
  }

  async updateUser(userId: string, userData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>(`/api/v1/users/${userId}`, {
          method: "PUT",
          body: JSON.stringify(userData),
        });
        return handleApiResponse(response, 'updateUser', null);
      },
      'updateUser',
      { fallbackValue: null, showToast: true }
    )();
  }

  async deleteUser(userId: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<boolean>(`/api/v1/users/${userId}`, {
          method: "DELETE",
        });
        return handleApiResponse(response, 'deleteUser', false);
      },
      'deleteUser',
      { fallbackValue: false, showToast: true }
    )();
  }

  // Fleet Management APIs
  async getFleetData(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/fleet");
        return handleApiResponse(response, 'getFleetData', []);
      },
      'getFleetData',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getVehicleDetails(vehicleId: string): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>(`/api/v1/fleet/vehicles/${vehicleId}`);
        return handleApiResponse(response, 'getVehicleDetails', null);
      },
      'getVehicleDetails',
      { fallbackValue: null, showToast: true }
    )();
  }

  async updateVehicle(vehicleId: string, vehicleData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>(`/api/v1/fleet/vehicles/${vehicleId}`, {
          method: "PUT",
          body: JSON.stringify(vehicleData),
        });
        return handleApiResponse(response, 'updateVehicle', null);
      },
      'updateVehicle',
      { fallbackValue: null, showToast: true }
    )();
  }

  // Finance APIs
  async getFinancialData(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/finance");
        return handleApiResponse(response, 'getFinancialData', []);
      },
      'getFinancialData',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getPayments(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/finance/payments");
        return handleApiResponse(response, 'getPayments', []);
      },
      'getPayments',
      { fallbackValue: [], showToast: false }
    )();
  }

  async processPayment(paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/finance/payments", {
          method: "POST",
          body: JSON.stringify(paymentData),
        });
        return handleApiResponse(response, 'processPayment', null);
      },
      'processPayment',
      { fallbackValue: null, showToast: true }
    )();
  }

  // Analytics APIs
  async getAnalyticsData(timeRange: string = "30d"): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>(`/api/v1/analytics?range=${timeRange}`);
        return handleApiResponse(response, 'getAnalyticsData', {});
      },
      'getAnalyticsData',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getDashboardMetrics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/dashboard/metrics");
        return handleApiResponse(response, 'getDashboardMetrics', {});
      },
      'getDashboardMetrics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // System Health APIs
  async getSystemHealth(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/system/health");
        return handleApiResponse(response, 'getSystemHealth', {});
      },
      'getSystemHealth',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getApiPerformance(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/system/api-performance");
        return handleApiResponse(response, 'getApiPerformance', {});
      },
      'getApiPerformance',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Settings APIs
  async getSettings(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/settings");
        return handleApiResponse(response, 'getSettings', {});
      },
      'getSettings',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async updateSettings(settings: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/settings", {
          method: "PUT",
          body: JSON.stringify(settings),
        });
        return handleApiResponse(response, 'updateSettings', null);
      },
      'updateSettings',
      { fallbackValue: null, showToast: true }
    )();
  }

  // Reports APIs
  async generateReport(reportType: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>(`/api/v1/reports/${reportType}`, {
          method: "POST",
          body: JSON.stringify(params),
        });
        return handleApiResponse(response, 'generateReport', null);
      },
      'generateReport',
      { fallbackValue: null, showToast: true }
    )();
  }

  async getReports(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/reports");
        return handleApiResponse(response, 'getReports', []);
      },
      'getReports',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Audit Trail APIs
  async getAuditTrail(filters: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await apiService.request<Record<string, unknown>[]>(`/api/v1/audit-trail?${queryParams}`);
        return handleApiResponse(response, 'getAuditTrail', []);
      },
      'getAuditTrail',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Integrations APIs
  async getIntegrations(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/integrations");
        return handleApiResponse(response, 'getIntegrations', []);
      },
      'getIntegrations',
      { fallbackValue: [], showToast: false }
    )();
  }

  async testIntegration(integrationId: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<boolean>(`/api/v1/integrations/${integrationId}/test`, {
          method: "POST",
        });
        return handleApiResponse(response, 'testIntegration', false);
      },
      'testIntegration',
      { fallbackValue: false, showToast: true }
    )();
  }

  // Feature Flags APIs
  async getFeatureFlags(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/feature-flags");
        return handleApiResponse(response, 'getFeatureFlags', []);
      },
      'getFeatureFlags',
      { fallbackValue: [], showToast: false }
    )();
  }

  async updateFeatureFlag(flagId: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>(`/api/v1/feature-flags/${flagId}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        });
        return handleApiResponse(response, 'updateFeatureFlag', null);
      },
      'updateFeatureFlag',
      { fallbackValue: null, showToast: true }
    )();
  }

  // Chat APIs
  async getChatMessages(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/chat/messages");
        return handleApiResponse(response, 'getChatMessages', []);
      },
      'getChatMessages',
      { fallbackValue: [], showToast: false }
    )();
  }

  async sendMessage(message: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/chat/messages", {
          method: "POST",
          body: JSON.stringify(message),
        });
        return handleApiResponse(response, 'sendMessage', null);
      },
      'sendMessage',
      { fallbackValue: null, showToast: true }
    )();
  }

  // Notifications APIs
  async getNotificationList(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/notifications");
        return handleApiResponse(response, 'getNotificationList', []);
      },
      'getNotificationList',
      { fallbackValue: [], showToast: false }
    )();
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<boolean>(`/api/v1/notifications/${notificationId}/read`, {
          method: "PUT",
        });
        return handleApiResponse(response, 'markNotificationAsRead', false);
      },
      'markNotificationAsRead',
      { fallbackValue: false, showToast: true }
    )();
  }

  // Integrations APIs
  async getIntegrations(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/integrations");
        return handleApiResponse(response, 'getIntegrations', []);
      },
      'getIntegrations',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getIntegrationTemplates(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/integrations/templates");
        return handleApiResponse(response, 'getIntegrationTemplates', []);
      },
      'getIntegrationTemplates',
      { fallbackValue: [], showToast: false }
    )();
  }

  async createIntegration(integrationData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/integrations", {
          method: "POST",
          body: JSON.stringify(integrationData),
        });
        return handleApiResponse(response, 'createIntegration', null);
      },
      'createIntegration',
      { fallbackValue: null, showToast: true }
    )();
  }

  async testIntegration(integrationId: string): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>(`/api/v1/integrations/${integrationId}/test`, {
          method: "POST",
        });
        return handleApiResponse(response, 'testIntegration', null);
      },
      'testIntegration',
      { fallbackValue: null, showToast: true }
    )();
  }

  // Communication APIs
  async getChatChannels(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/communication/chat/conversations");
        return handleApiResponse(response, 'getChatChannels', []);
      },
      'getChatChannels',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getChatMessages(channelId?: string): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const endpoint = channelId ? `/api/v1/communication/chat?chatId=${channelId}` : "/api/v1/communication/chat";
        const response = await apiService.request<Record<string, unknown>[]>(endpoint);
        return handleApiResponse(response, 'getChatMessages', []);
      },
      'getChatMessages',
      { fallbackValue: [], showToast: false }
    )();
  }

  async sendChatMessage(messageData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/communication/chat", {
          method: "POST",
          body: JSON.stringify(messageData),
        });
        return handleApiResponse(response, 'sendChatMessage', null);
      },
      'sendChatMessage',
      { fallbackValue: null, showToast: true }
    )();
  }

  async getEmailHistory(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/communication/email");
        return handleApiResponse(response, 'getEmailHistory', []);
      },
      'getEmailHistory',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Audit Trail APIs
  async getAuditLogs(filters?: Record<string, unknown>): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const queryParams = filters ? `?${new URLSearchParams(Object.entries(filters).map(([key, value]) => [key, String(value)])).toString()}` : '';
        const response = await apiService.request<Record<string, unknown>[]>(`/api/v1/audit-trail${queryParams}`);
        return handleApiResponse(response, 'getAuditLogs', []);
      },
      'getAuditLogs',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getSecurityEvents(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/audit-trail/security");
        return handleApiResponse(response, 'getSecurityEvents', []);
      },
      'getSecurityEvents',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getUserActivities(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/audit-trail/user-activity");
        return handleApiResponse(response, 'getUserActivities', []);
      },
      'getUserActivities',
      { fallbackValue: [], showToast: false }
    )();
  }

  // AI APIs
  async getAIRecommendations(filters?: Record<string, unknown>): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
        const response = await apiService.request<Record<string, unknown>[]>(`/api/v1/ai/recommendations${queryParams}`);
        return handleApiResponse(response, 'getAIRecommendations', []);
      },
      'getAIRecommendations',
      { fallbackValue: [], showToast: false }
    )();
  }

  // API Documentation APIs
  async getAPIEndpoints(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/docs/endpoints");
        return handleApiResponse(response, 'getAPIEndpoints', []);
      },
      'getAPIEndpoints',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getAPICategories(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/docs/categories");
        return handleApiResponse(response, 'getAPICategories', []);
      },
      'getAPICategories',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Mobile Apps APIs
  async getMobileAppVersions(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/mobile-apps/versions");
        return handleApiResponse(response, 'getMobileAppVersions', []);
      },
      'getMobileAppVersions',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getMobileAppCrashes(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/mobile-apps/crashes");
        return handleApiResponse(response, 'getMobileAppCrashes', []);
      },
      'getMobileAppCrashes',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getMobileAppAnalytics(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/mobile-apps/analytics");
        return handleApiResponse(response, 'getMobileAppAnalytics', []);
      },
      'getMobileAppAnalytics',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getMobileAppStores(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/mobile-apps/stores");
        return handleApiResponse(response, 'getMobileAppStores', []);
      },
      'getMobileAppStores',
      { fallbackValue: [], showToast: false }
    )();
  }

  // System Performance APIs
  async getSystemPerformanceMetrics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/system/performance");
        return handleApiResponse(response, 'getSystemPerformanceMetrics', {});
      },
      'getSystemPerformanceMetrics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getActiveSessions(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/sessions/active");
        return handleApiResponse(response, 'getActiveSessions', {});
      },
      'getActiveSessions',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Revenue APIs
  async getRevenueMetrics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/revenue/metrics");
        return handleApiResponse(response, 'getRevenueMetrics', {});
      },
      'getRevenueMetrics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getRevenueForecast(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/revenue/forecast");
        return handleApiResponse(response, 'getRevenueForecast', {});
      },
      'getRevenueForecast',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getEngagementHeatmap(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/analytics/engagement-heatmap");
        return handleApiResponse(response, 'getEngagementHeatmap', {});
      },
      'getEngagementHeatmap',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getTickets(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/support/tickets");
        return handleApiResponse(response, 'getTickets', []);
      },
      'getTickets',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getUpsellOpportunities(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/analytics/upsell-opportunities");
        return handleApiResponse(response, 'getUpsellOpportunities', []);
      },
      'getUpsellOpportunities',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Compliance APIs
  async getComplianceStatus(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/compliance/status");
        return handleApiResponse(response, 'getComplianceStatus', {});
      },
      'getComplianceStatus',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Customer APIs
  async getCustomers(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/customers");
        return handleApiResponse(response, 'getCustomers', []);
      },
      'getCustomers',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Live Operations APIs
  async getFleetLocations(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/operations/fleet-locations");
        return handleApiResponse(response, 'getFleetLocations', []);
      },
      'getFleetLocations',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getRevenueHotspots(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/operations/revenue-hotspots");
        return handleApiResponse(response, 'getRevenueHotspots', []);
      },
      'getRevenueHotspots',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getLiveUserActivities(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/operations/user-activities");
        return handleApiResponse(response, 'getLiveUserActivities', []);
      },
      'getLiveUserActivities',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Feature Usage APIs
  async getFeatureUsage(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/analytics/feature-usage");
        return handleApiResponse(response, 'getFeatureUsage', []);
      },
      'getFeatureUsage',
      { fallbackValue: [], showToast: false }
    )();
  }

  // CMS APIs
  async getCMSContent(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/cms/content");
        return handleApiResponse(response, 'getCMSContent', []);
      },
      'getCMSContent',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getCMSMedia(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/cms/media");
        return handleApiResponse(response, 'getCMSMedia', []);
      },
      'getCMSMedia',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getCMSCategories(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/cms/categories");
        return handleApiResponse(response, 'getCMSCategories', []);
      },
      'getCMSCategories',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Maintenance APIs
  async getMaintenanceTasks(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/fleet/maintenance/tasks");
        return handleApiResponse(response, 'getMaintenanceTasks', []);
      },
      'getMaintenanceTasks',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getMaintenanceSchedules(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/fleet/maintenance/schedules");
        return handleApiResponse(response, 'getMaintenanceSchedules', []);
      },
      'getMaintenanceSchedules',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getTechnicians(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/fleet/technicians");
        return handleApiResponse(response, 'getTechnicians', []);
      },
      'getTechnicians',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Churn Attribution APIs
  async getChurnAttribution(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/analytics/churn-attribution");
        return handleApiResponse(response, 'getChurnAttribution', []);
      },
      'getChurnAttribution',
      { fallbackValue: [], showToast: false }
    )();
  }
}

// Export singleton instance
export const realApiService = new RealApiService();
export const realApi = realApiService;