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

  async cleanupTestUsers(): Promise<{ deletedCount: number }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<{ deletedCount: number }>("/api/v1/users/cleanup/test", {
          method: "DELETE",
        });
        return handleApiResponse(response, 'cleanupTestUsers', { deletedCount: 0 });
      },
      'cleanupTestUsers',
      { fallbackValue: { deletedCount: 0 }, showToast: true }
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

  async getDowntimeMetrics(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/fleet/downtime-metrics");
        return handleApiResponse(response, 'getDowntimeMetrics', []);
      },
      'getDowntimeMetrics',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getCustomerHealthScores(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/crm/customer-health-scores");
        return handleApiResponse(response, 'getCustomerHealthScores', []);
      },
      'getCustomerHealthScores',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getFuelCostMetrics(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/fleet/fuel-cost-metrics");
        return handleApiResponse(response, 'getFuelCostMetrics', []);
      },
      'getFuelCostMetrics',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getProjects(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/projects");
        return handleApiResponse(response, 'getProjects', []);
      },
      'getProjects',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getBudgets(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/finance/budgets");
        return handleApiResponse(response, 'getBudgets', []);
      },
      'getBudgets',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getExpenses(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/finance/expenses");
        return handleApiResponse(response, 'getExpenses', []);
      },
      'getExpenses',
      { fallbackValue: [], showToast: false }
    )();
  }

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

  async getHealthChecks(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/health-checks");
        return handleApiResponse(response, 'getHealthChecks', []);
      },
      'getHealthChecks',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getIntegrationMetrics(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/integrations/metrics");
        return handleApiResponse(response, 'getIntegrationMetrics', []);
      },
      'getIntegrationMetrics',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getIncidents(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/incidents");
        return handleApiResponse(response, 'getIncidents', []);
      },
      'getIncidents',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getAlerts(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/alerts");
        return handleApiResponse(response, 'getAlerts', []);
      },
      'getAlerts',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getLogs(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/logs");
        return handleApiResponse(response, 'getLogs', []);
      },
      'getLogs',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getUserSegments(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/users/segments");
        return handleApiResponse(response, 'getUserSegments', []);
      },
      'getUserSegments',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getUserSegmentAnalytics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/users/segments/analytics");
        return handleApiResponse(response, 'getUserSegmentAnalytics', {});
      },
      'getUserSegmentAnalytics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getPricingPlans(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/revenue/pricing-plans");
        return handleApiResponse(response, 'getPricingPlans', []);
      },
      'getPricingPlans',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getPricingAnalytics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/revenue/pricing-analytics");
        return handleApiResponse(response, 'getPricingAnalytics', {});
      },
      'getPricingAnalytics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getBudgetBreaches(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/finance/budget-breaches");
        return handleApiResponse(response, 'getBudgetBreaches', []);
      },
      'getBudgetBreaches',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getAnomalyDetections(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/ai/anomaly-detections");
        return handleApiResponse(response, 'getAnomalyDetections', []);
      },
      'getAnomalyDetections',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getZeroTrustPolicies(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/security/zero-trust-policies");
        return handleApiResponse(response, 'getZeroTrustPolicies', []);
      },
      'getZeroTrustPolicies',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getZeroTrustMetrics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/security/zero-trust-metrics");
        return handleApiResponse(response, 'getZeroTrustMetrics', {});
      },
      'getZeroTrustMetrics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Communication API methods
  async getChatChannels(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/chat/channels");
        return handleApiResponse(response, 'getChatChannels', []);
      },
      'getChatChannels',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getTickets(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/crm/tickets");
        return handleApiResponse(response, 'getTickets', []);
      },
      'getTickets',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Mobile CMS API methods
  async getMobileAppSettings(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/mobile-cms/settings");
        return handleApiResponse(response, 'getMobileAppSettings', {});
      },
      'getMobileAppSettings',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async saveMobileAppSettings(settings: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/mobile-cms/settings", {
          method: 'POST',
          body: JSON.stringify(settings)
        });
        return handleApiResponse(response, 'saveMobileAppSettings', {});
      },
      'saveMobileAppSettings',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async previewMobileApp(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/mobile-cms/preview");
        return handleApiResponse(response, 'previewMobileApp', {});
      },
      'previewMobileApp',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Live Ops Map API methods
  async getFleetLocations(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/ops/fleet-locations");
        return handleApiResponse(response, 'getFleetLocations', []);
      },
      'getFleetLocations',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getRevenueHotspots(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/ops/revenue-hotspots");
        return handleApiResponse(response, 'getRevenueHotspots', []);
      },
      'getRevenueHotspots',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getLiveUserActivities(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/ops/user-activities");
        return handleApiResponse(response, 'getLiveUserActivities', []);
      },
      'getLiveUserActivities',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Chat API methods
  async getChatMessages(channelId: string): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>(`/api/v1/chat/messages/${channelId}`);
        return handleApiResponse(response, 'getChatMessages', []);
      },
      'getChatMessages',
      { fallbackValue: [], showToast: false }
    )();
  }

  async sendChatMessage(messageData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/chat/send", {
          method: 'POST',
          body: JSON.stringify(messageData)
        });
        return handleApiResponse(response, 'sendChatMessage', {});
      },
      'sendChatMessage',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // CRM API methods
  async getCustomers(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/crm/customers");
        return handleApiResponse(response, 'getCustomers', []);
      },
      'getCustomers',
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

  async getMaintenanceForecast(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/fleet/maintenance/forecast");
        return handleApiResponse(response, 'getMaintenanceForecast', []);
      },
      'getMaintenanceForecast',
      { fallbackValue: [], showToast: false }
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

  // Enterprise APIs
  async getEnterpriseClients(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/enterprise/clients");
        return handleApiResponse(response, 'getEnterpriseClients', []);
      },
      'getEnterpriseClients',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getEnterpriseStats(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/enterprise/stats");
        return handleApiResponse(response, 'getEnterpriseStats', {});
      },
      'getEnterpriseStats',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Asset Management APIs
  async getAssets(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/assets");
        return handleApiResponse(response, 'getAssets', []);
      },
      'getAssets',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getMaintenanceRecords(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/assets/asset-maintenance");
        return handleApiResponse(response, 'getMaintenanceRecords', []);
      },
      'getMaintenanceRecords',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getAssetAssignments(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/assets/asset-assignments");
        return handleApiResponse(response, 'getAssetAssignments', []);
      },
      'getAssetAssignments',
      { fallbackValue: [], showToast: false }
    )();
  }

  async createAsset(assetData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/assets", {
          method: "POST",
          body: JSON.stringify(assetData),
        });
        return handleApiResponse(response, 'createAsset', null);
      },
      'createAsset',
      { fallbackValue: null, showToast: true }
    )();
  }

  async createMaintenanceRecord(maintenanceData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/assets/maintenance", {
          method: "POST",
          body: JSON.stringify(maintenanceData),
        });
        return handleApiResponse(response, 'createMaintenanceRecord', null);
      },
      'createMaintenanceRecord',
      { fallbackValue: null, showToast: true }
    )();
  }

  async createAssetAssignment(assignmentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/assets/assignments", {
          method: "POST",
          body: JSON.stringify(assignmentData),
        });
        return handleApiResponse(response, 'createAssetAssignment', null);
      },
      'createAssetAssignment',
      { fallbackValue: null, showToast: true }
    )();
  }

  // Finance APIs
  async getSubscriptions(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/finance/subscriptions");
        return handleApiResponse(response, 'getSubscriptions', []);
      },
      'getSubscriptions',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getPayouts(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/finance/payouts");
        return handleApiResponse(response, 'getPayouts', []);
      },
      'getPayouts',
      { fallbackValue: [], showToast: false }
    )();
  }

  // SEO APIs
  async getSEOData(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/cms/seo");
        return handleApiResponse(response, 'getSEOData', []);
      },
      'getSEOData',
      { fallbackValue: [], showToast: false }
    )();
  }

  async refreshSEOAnalysis(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/cms/seo/refresh", {
          method: "POST",
        });
        return handleApiResponse(response, 'refreshSEOAnalysis', null);
      },
      'refreshSEOAnalysis',
      { fallbackValue: null, showToast: true }
    )();
  }

  async optimizeSEO(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/cms/seo/optimize", {
          method: "POST",
        });
        return handleApiResponse(response, 'optimizeSEO', null);
      },
      'optimizeSEO',
      { fallbackValue: null, showToast: true }
    )();
  }

  // Audit Trail APIs
  async getAuditLogs(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/audit/logs");
        return handleApiResponse(response, 'getAuditLogs', []);
      },
      'getAuditLogs',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getSecurityEvents(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/audit/security-events");
        return handleApiResponse(response, 'getSecurityEvents', []);
      },
      'getSecurityEvents',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getUserActivities(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/audit/user-activities");
        return handleApiResponse(response, 'getUserActivities', []);
      },
      'getUserActivities',
      { fallbackValue: [], showToast: false }
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
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/chat/channels");
        return handleApiResponse(response, 'getChatChannels', []);
      },
      'getChatChannels',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getChatMessages(channelId?: string): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const endpoint = channelId ? `/api/v1/chat/messages/${channelId}` : "/api/v1/chat/messages";
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
        const response = await apiService.request<Record<string, unknown>>("/api/v1/chat/send", {
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

  // AI/ML APIs
  async getAIModels(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/ai/models");
        return handleApiResponse(response, 'getAIModels', []);
      },
      'getAIModels',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getFraudCases(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/ai/fraud-cases");
        return handleApiResponse(response, 'getFraudCases', []);
      },
      'getFraudCases',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getRecommendations(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/ai/recommendations");
        return handleApiResponse(response, 'getRecommendations', []);
      },
      'getRecommendations',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getTrainingROI(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/ai/training-roi");
        return handleApiResponse(response, 'getTrainingROI', {});
      },
      'getTrainingROI',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getRecommendationUplift(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/ai/recommendation-uplift");
        return handleApiResponse(response, 'getRecommendationUplift', {});
      },
      'getRecommendationUplift',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Enterprise APIs
  async getEnterpriseClients(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/enterprise/clients");
        return handleApiResponse(response, 'getEnterpriseClients', []);
      },
      'getEnterpriseClients',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getEnterpriseStats(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/enterprise/stats");
        return handleApiResponse(response, 'getEnterpriseStats', {});
      },
      'getEnterpriseStats',
      { fallbackValue: {}, showToast: false }
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

  // Mobile App CMS APIs
  async getMobileAppSettings(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/mobile-apps/settings");
        return handleApiResponse(response, 'getMobileAppSettings', {
          appSettings: {
            appName: 'Clutch',
            version: '1.2.0',
            primaryColor: '#3B82F6',
            secondaryColor: '#10B981',
            logo: '',
            splashScreen: '',
            welcomeMessage: 'Welcome to Clutch - Your Fleet Management Solution'
          },
          content: {
            homeScreen: {
              title: 'Dashboard',
              subtitle: 'Manage your fleet efficiently',
              features: ['Real-time tracking', 'Maintenance alerts', 'Fuel monitoring']
            },
            aboutScreen: {
              title: 'About Clutch',
              description: 'Clutch is a comprehensive fleet management solution designed to help businesses optimize their vehicle operations.'
            }
          }
        });
      },
      'getMobileAppSettings',
      { 
        fallbackValue: {
          appSettings: {
            appName: 'Clutch',
            version: '1.2.0',
            primaryColor: '#3B82F6',
            secondaryColor: '#10B981',
            logo: '',
            splashScreen: '',
            welcomeMessage: 'Welcome to Clutch - Your Fleet Management Solution'
          },
          content: {
            homeScreen: {
              title: 'Dashboard',
              subtitle: 'Manage your fleet efficiently',
              features: ['Real-time tracking', 'Maintenance alerts', 'Fuel monitoring']
            },
            aboutScreen: {
              title: 'About Clutch',
              description: 'Clutch is a comprehensive fleet management solution designed to help businesses optimize their vehicle operations.'
            }
          }
        }, 
        showToast: false 
      }
    )();
  }

  async saveMobileAppSettings(settings: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/mobile-apps/settings", {
          method: 'POST',
          body: JSON.stringify(settings)
        });
        return handleApiResponse(response, 'saveMobileAppSettings', { success: true });
      },
      'saveMobileAppSettings',
      { fallbackValue: { success: false }, showToast: true }
    )();
  }

  async previewMobileApp(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>>("/api/v1/mobile-apps/preview");
        return handleApiResponse(response, 'previewMobileApp', { 
          previewUrl: 'https://preview.clutch.com/mobile-app',
          status: 'ready'
        });
      },
      'previewMobileApp',
      { 
        fallbackValue: { 
          previewUrl: 'https://preview.clutch.com/mobile-app',
          status: 'ready'
        }, 
        showToast: false 
      }
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

  // Security APIs
  async getSecurityAlerts(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.request<Record<string, unknown>[]>("/api/v1/security/alerts");
        return handleApiResponse(response, 'getSecurityAlerts', []);
      },
      'getSecurityAlerts',
      { fallbackValue: [], showToast: false }
    )();
  }
}

// Export singleton instance
export const realApiService = new RealApiService();
export const realApi = realApiService;