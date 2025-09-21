import { apiService } from "./api";
import { errorHandler, withErrorHandling, handleApiResponse } from "./error-handler";

// Real API service that replaces mock data
export class RealApiService {
  
  // Dashboard APIs
  async getKPIMetrics(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/dashboard/kpis");
        return handleApiResponse(response, 'getKPIMetrics', []);
      },
      'getKPIMetrics',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getFleetVehicles(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/fleet/vehicles");
        return handleApiResponse(response, 'getFleetVehicles', []);
      },
      'getFleetVehicles',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getNotifications(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/notifications");
        return handleApiResponse(response, 'getNotifications', []);
      },
      'getNotifications',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getTickets(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/communication/tickets");
        return handleApiResponse(response, 'getTickets', []);
      },
      'getTickets',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getChatChannels(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/communication/chat-channels");
        return handleApiResponse(response, 'getChatChannels', []);
      },
      'getChatChannels',
      { fallbackValue: [], showToast: false }
    )();
  }

  async createChatChannel(channelData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/chat/channels", {
          method: 'POST',
          body: JSON.stringify(channelData)
        });
        return handleApiResponse(response, 'createChatChannel', {});
      },
      'createChatChannel',
      { fallbackValue: {}, showToast: true }
    )();
  }


  // Fleet APIs
  async getFleetVehicleById(vehicleId: string): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/fleet/vehicles/${vehicleId}`);
        return handleApiResponse(response, 'getFleetVehicleById', {});
      },
      'getFleetVehicleById',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async updateFleetVehicle(vehicleId: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/fleet/vehicles/${vehicleId}`, {
          method: 'PUT',
          body: JSON.stringify(updates)
        });
        return handleApiResponse(response, 'updateFleetVehicle', {});
      },
      'updateFleetVehicle',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getMaintenanceForecast(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/fleet/maintenance/forecast");
        return handleApiResponse(response, 'getMaintenanceForecast', []);
      },
      'getMaintenanceForecast',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Finance APIs
  async getFinanceData(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/finance");
        return handleApiResponse(response, 'getFinanceData', []);
      },
      'getFinanceData',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getPayments(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/finance/payments");
        return handleApiResponse(response, 'getPayments', []);
      },
      'getPayments',
      { fallbackValue: [], showToast: false }
    )();
  }

  async createPayment(paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/finance/payments", {
          method: 'POST',
          body: JSON.stringify(paymentData)
        });
        return handleApiResponse(response, 'createPayment', {});
      },
      'createPayment',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Analytics APIs
  async getAnalytics(timeRange: string = '7d'): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/analytics?range=${timeRange}`);
        return handleApiResponse(response, 'getAnalytics', {});
      },
      'getAnalytics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getDashboardMetrics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/dashboard/metrics");
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
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/enterprise/clients");
        return handleApiResponse(response, 'getEnterpriseClients', []);
      },
      'getEnterpriseClients',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getEnterpriseStats(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/enterprise/stats");
        return handleApiResponse(response, 'getEnterpriseStats', {});
      },
      'getEnterpriseStats',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Assets APIs
  async getAssets(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/assets");
        return handleApiResponse(response, 'getAssets', []);
      },
      'getAssets',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getMaintenanceRecords(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/assets/asset-maintenance");
        return handleApiResponse(response, 'getMaintenanceRecords', []);
      },
      'getMaintenanceRecords',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getAssetAssignments(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/assets/asset-assignments");
        return handleApiResponse(response, 'getAssetAssignments', []);
      },
      'getAssetAssignments',
      { fallbackValue: [], showToast: false }
    )();
  }

  async createAsset(assetData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/assets", {
          method: 'POST',
          body: JSON.stringify(assetData)
        });
        return handleApiResponse(response, 'createAsset', {});
      },
      'createAsset',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async updateMaintenanceRecord(recordId: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/assets/maintenance", {
          method: 'PUT',
          body: JSON.stringify({ id: recordId, ...updates })
        });
        return handleApiResponse(response, 'updateMaintenanceRecord', {});
      },
      'updateMaintenanceRecord',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async updateAssetAssignment(assignmentId: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/assets/assignments", {
          method: 'PUT',
          body: JSON.stringify({ id: assignmentId, ...updates })
        });
        return handleApiResponse(response, 'updateAssetAssignment', {});
      },
      'updateAssetAssignment',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Subscription APIs
  async getSubscriptions(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/finance/subscriptions");
        return handleApiResponse(response, 'getSubscriptions', []);
      },
      'getSubscriptions',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getPayouts(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/finance/payouts");
        return handleApiResponse(response, 'getPayouts', []);
      },
      'getPayouts',
      { fallbackValue: [], showToast: false }
    )();
  }

  // CMS APIs
  async getSEOData(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/cms/seo");
        return handleApiResponse(response, 'getSEOData', []);
      },
      'getSEOData',
      { fallbackValue: [], showToast: false }
    )();
  }

  async refreshSEO(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/cms/seo/refresh", {
          method: 'POST'
        });
        return handleApiResponse(response, 'refreshSEO', {});
      },
      'refreshSEO',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async optimizeSEO(optimizationData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/cms/seo/optimize", {
          method: 'POST',
          body: JSON.stringify(optimizationData)
        });
        return handleApiResponse(response, 'optimizeSEO', {});
      },
      'optimizeSEO',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Audit Trail APIs
  async getAuditLogs(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/audit/logs");
        return handleApiResponse(response, 'getAuditLogs', []);
      },
      'getAuditLogs',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getSecurityEvents(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/audit/security-events");
        return handleApiResponse(response, 'getSecurityEvents', []);
      },
      'getSecurityEvents',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getUserActivities(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/audit/user-activities");
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
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/system/health");
        return handleApiResponse(response, 'getSystemHealth', {});
      },
      'getSystemHealth',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getAPIPerformance(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/system/api-performance");
        return handleApiResponse(response, 'getAPIPerformance', {});
      },
      'getAPIPerformance',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Settings APIs
  async getSettings(category: string): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>(`/api/v1/settings/${category}`);
        return handleApiResponse(response, 'getSettings', []);
      },
      'getSettings',
      { fallbackValue: [], showToast: false }
    )();
  }

  async updateSettings(settingsData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/settings", {
          method: 'PUT',
          body: JSON.stringify(settingsData)
        });
        return handleApiResponse(response, 'updateSettings', {});
      },
      'updateSettings',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Reports APIs
  async generateReport(reportType: string, options: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/reports/${reportType}`, {
          method: 'POST',
          body: JSON.stringify(options)
        });
        return handleApiResponse(response, 'generateReport', {});
      },
      'generateReport',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getReports(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/reports");
        return handleApiResponse(response, 'getReports', []);
      },
      'getReports',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Audit Trail APIs
  async getAuditTrail(filters: Record<string, unknown>): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
        const response = await apiService.makeRequest<Record<string, unknown>[]>(`/api/v1/audit-trail?${queryParams}`);
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
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/integrations");
        return handleApiResponse(response, 'getIntegrations', []);
      },
      'getIntegrations',
      { fallbackValue: [], showToast: false }
    )();
  }

  async testIntegration(integrationId: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>(`/api/v1/integrations/${integrationId}/test`, {
          method: 'POST'
        });
        return handleApiResponse(response, 'testIntegration', false);
      },
      'testIntegration',
      { fallbackValue: false, showToast: false }
    )();
  }

  // Feature Flags APIs
  async getFeatureFlags(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/feature-flags");
        return handleApiResponse(response, 'getFeatureFlags', []);
      },
      'getFeatureFlags',
      { fallbackValue: [], showToast: false }
    )();
  }

  async updateFeatureFlag(flagId: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/feature-flags/${flagId}`, {
          method: 'PUT',
          body: JSON.stringify(updates)
        });
        return handleApiResponse(response, 'updateFeatureFlag', {});
      },
      'updateFeatureFlag',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Chat APIs
  async getChatMessages(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/communication/chat");
        return handleApiResponse(response, 'getChatMessages', []);
      },
      'getChatMessages',
      { fallbackValue: [], showToast: false }
    )();
  }

  async sendChatMessage(messageData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/communication/chat", {
          method: 'POST',
          body: JSON.stringify(messageData)
        });
        return handleApiResponse(response, 'sendChatMessage', {});
      },
      'sendChatMessage',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Communication APIs
  async getEmailNotifications(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/communication/email");
        return handleApiResponse(response, 'getEmailNotifications', []);
      },
      'getEmailNotifications',
      { fallbackValue: [], showToast: false }
    )();
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>(`/api/v1/notifications/${notificationId}/read`, {
          method: 'PUT'
        });
        return handleApiResponse(response, 'markNotificationAsRead', false);
      },
      'markNotificationAsRead',
      { fallbackValue: false, showToast: false }
    )();
  }

  // AI/ML APIs
  async getAIModels(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/ai/models");
        return handleApiResponse(response, 'getAIModels', []);
      },
      'getAIModels',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getFraudCases(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/ai/fraud-cases");
        return handleApiResponse(response, 'getFraudCases', []);
      },
      'getFraudCases',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getRecommendations(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/ai/recommendations");
        return handleApiResponse(response, 'getRecommendations', []);
      },
      'getRecommendations',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getTrainingROI(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/ai/training-roi");
        return handleApiResponse(response, 'getTrainingROI', {});
      },
      'getTrainingROI',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getRecommendationUplift(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/ai/recommendation-uplift");
        return handleApiResponse(response, 'getRecommendationUplift', {});
      },
      'getRecommendationUplift',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Maintenance and operational costs APIs
  async getMaintenanceCosts(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/maintenance-costs");
        return handleApiResponse(response, 'getMaintenanceCosts', {});
      },
      'getMaintenanceCosts',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getOtherOperationalCosts(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/operational-costs");
        return handleApiResponse(response, 'getOtherOperationalCosts', {});
      },
      'getOtherOperationalCosts',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Mobile app APIs
  async getMobileAppVersions(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/mobile-app/versions");
        return handleApiResponse(response, 'getMobileAppVersions', []);
      },
      'getMobileAppVersions',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getMobileAppCrashes(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/mobile-app/crashes");
        return handleApiResponse(response, 'getMobileAppCrashes', []);
      },
      'getMobileAppCrashes',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getMobileAppAnalytics(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/mobile-app/analytics");
        return handleApiResponse(response, 'getMobileAppAnalytics', []);
      },
      'getMobileAppAnalytics',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getMobileAppStores(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/mobile-app/stores");
        return handleApiResponse(response, 'getMobileAppStores', []);
      },
      'getMobileAppStores',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Additional missing API methods
  async getSystemPerformanceMetrics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/system-performance");
        return handleApiResponse(response, 'getSystemPerformanceMetrics', {});
      },
      'getSystemPerformanceMetrics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getFuelCostMetrics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/fuel-cost-metrics");
        return handleApiResponse(response, 'getFuelCostMetrics', {});
      },
      'getFuelCostMetrics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getDowntimeMetrics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/downtime-metrics");
        return handleApiResponse(response, 'getDowntimeMetrics', {});
      },
      'getDowntimeMetrics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getUpsellOpportunities(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/upsell-opportunities");
        return handleApiResponse(response, 'getUpsellOpportunities', []);
      },
      'getUpsellOpportunities',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getSLACompliance(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/sla-compliance");
        return handleApiResponse(response, 'getSLACompliance', {});
      },
      'getSLACompliance',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getRootCauseAnalysis(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/root-cause-analysis");
        return handleApiResponse(response, 'getRootCauseAnalysis', []);
      },
      'getRootCauseAnalysis',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getExpenses(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/expenses");
        return handleApiResponse(response, 'getExpenses', []);
      },
      'getExpenses',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getProjects(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/projects");
        return handleApiResponse(response, 'getProjects', []);
      },
      'getProjects',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getBudgets(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/budgets");
        return handleApiResponse(response, 'getBudgets', []);
      },
      'getBudgets',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getHealthChecks(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/health-checks");
        return handleApiResponse(response, 'getHealthChecks', []);
      },
      'getHealthChecks',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getIntegrationMetrics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/integration-metrics");
        return handleApiResponse(response, 'getIntegrationMetrics', {});
      },
      'getIntegrationMetrics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getIncidents(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/incidents");
        return handleApiResponse(response, 'getIncidents', []);
      },
      'getIncidents',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getAlerts(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/alerts");
        return handleApiResponse(response, 'getAlerts', []);
      },
      'getAlerts',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getLogs(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/logs");
        return handleApiResponse(response, 'getLogs', []);
      },
      'getLogs',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getErrors(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/errors");
        return handleApiResponse(response, 'getErrors', []);
      },
      'getErrors',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getCustomerHealthScores(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/customer-health-scores");
        return handleApiResponse(response, 'getCustomerHealthScores', []);
      },
      'getCustomerHealthScores',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getChatSessions(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/chat-sessions");
        return handleApiResponse(response, 'getChatSessions', []);
      },
      'getChatSessions',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getSystemAlerts(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/system-alerts");
        return handleApiResponse(response, 'getSystemAlerts', []);
      },
      'getSystemAlerts',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getSystemLogs(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/system-logs");
        return handleApiResponse(response, 'getSystemLogs', []);
      },
      'getSystemLogs',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getPerformanceMetrics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/performance-metrics");
        return handleApiResponse(response, 'getPerformanceMetrics', {});
      },
      'getPerformanceMetrics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Additional missing GET methods
  async getABTests(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/ab-tests");
        return handleApiResponse(response, 'getABTests', []);
      },
      'getABTests',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getAnalyticsData(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/analytics-data");
        return handleApiResponse(response, 'getAnalyticsData', []);
      },
      'getAnalyticsData',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getAnalyticsMetrics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/analytics-metrics");
        return handleApiResponse(response, 'getAnalyticsMetrics', {});
      },
      'getAnalyticsMetrics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getAPICategories(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/api-categories");
        return handleApiResponse(response, 'getAPICategories', []);
      },
      'getAPICategories',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getAPIEndpoints(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/api-endpoints");
        return handleApiResponse(response, 'getAPIEndpoints', []);
      },
      'getAPIEndpoints',
      { fallbackValue: [], showToast: false }
    )();
  }


  async getBlackSwanEvents(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/black-swan-events");
        return handleApiResponse(response, 'getBlackSwanEvents', []);
      },
      'getBlackSwanEvents',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getBudgetBreaches(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/budget-breaches");
        return handleApiResponse(response, 'getBudgetBreaches', []);
      },
      'getBudgetBreaches',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getChaosExperiments(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/chaos-experiments");
        return handleApiResponse(response, 'getChaosExperiments', []);
      },
      'getChaosExperiments',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getComplianceFlags(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/compliance-flags");
        return handleApiResponse(response, 'getComplianceFlags', []);
      },
      'getComplianceFlags',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getComplianceFrameworks(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/compliance-frameworks");
        return handleApiResponse(response, 'getComplianceFrameworks', []);
      },
      'getComplianceFrameworks',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getComplianceData(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/compliance-data");
        return handleApiResponse(response, 'getComplianceData', {});
      },
      'getComplianceData',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getConfidenceIntervals(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/confidence-intervals");
        return handleApiResponse(response, 'getConfidenceIntervals', []);
      },
      'getConfidenceIntervals',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getCustomers(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/customers");
        return handleApiResponse(response, 'getCustomers', []);
      },
      'getCustomers',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getDependencyForecasts(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/dependency-forecasts");
        return handleApiResponse(response, 'getDependencyForecasts', []);
      },
      'getDependencyForecasts',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getFeedback(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/feedback");
        return handleApiResponse(response, 'getFeedback', []);
      },
      'getFeedback',
      { fallbackValue: [], showToast: false }
    )();
  }
}

// Export singleton instance
export const realApiService = new RealApiService();
export const realApi = realApiService;
