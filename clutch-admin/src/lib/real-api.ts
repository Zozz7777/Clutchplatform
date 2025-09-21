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
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/tickets");
        return handleApiResponse(response, 'getTickets', []);
      },
      'getTickets',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getChatChannels(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/chat-channels");
        return handleApiResponse(response, 'getChatChannels', []);
      },
      'getChatChannels',
      { fallbackValue: [], showToast: false }
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
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/chat/messages");
        return handleApiResponse(response, 'getChatMessages', []);
      },
      'getChatMessages',
      { fallbackValue: [], showToast: false }
    )();
  }

  async sendChatMessage(messageData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/chat/messages", {
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

  async getFleetVehicleById(id: string): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/fleet-vehicles/${id}`);
        return handleApiResponse(response, 'getFleetVehicleById', {});
      },
      'getFleetVehicleById',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getIntegrationTemplates(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/integration-templates");
        return handleApiResponse(response, 'getIntegrationTemplates', []);
      },
      'getIntegrationTemplates',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getKnowledgeArticles(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/knowledge-articles");
        return handleApiResponse(response, 'getKnowledgeArticles', []);
      },
      'getKnowledgeArticles',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getLiveUserActivities(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/live-user-activities");
        return handleApiResponse(response, 'getLiveUserActivities', []);
      },
      'getLiveUserActivities',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getOBD2Data(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/obd2-data");
        return handleApiResponse(response, 'getOBD2Data', []);
      },
      'getOBD2Data',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getPaymentMethods(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/payment-methods");
        return handleApiResponse(response, 'getPaymentMethods', []);
      },
      'getPaymentMethods',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getPricingAnalytics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/pricing-analytics");
        return handleApiResponse(response, 'getPricingAnalytics', {});
      },
      'getPricingAnalytics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getPricingPlans(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/pricing-plans");
        return handleApiResponse(response, 'getPricingPlans', []);
      },
      'getPricingPlans',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getProjectTasks(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/project-tasks");
        return handleApiResponse(response, 'getProjectTasks', []);
      },
      'getProjectTasks',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getRollouts(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/rollouts");
        return handleApiResponse(response, 'getRollouts', []);
      },
      'getRollouts',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getSecurityAlerts(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/security-alerts");
        return handleApiResponse(response, 'getSecurityAlerts', []);
      },
      'getSecurityAlerts',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getServiceHealth(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/service-health");
        return handleApiResponse(response, 'getServiceHealth', {});
      },
      'getServiceHealth',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getSettings(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/settings");
        return handleApiResponse(response, 'getSettings', {});
      },
      'getSettings',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getSLAMetrics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/sla-metrics");
        return handleApiResponse(response, 'getSLAMetrics', {});
      },
      'getSLAMetrics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getTimeTracking(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/time-tracking");
        return handleApiResponse(response, 'getTimeTracking', []);
      },
      'getTimeTracking',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getUserById(id: string): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/users/${id}`);
        return handleApiResponse(response, 'getUserById', {});
      },
      'getUserById',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getUserSegmentAnalytics(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/user-segment-analytics");
        return handleApiResponse(response, 'getUserSegmentAnalytics', []);
      },
      'getUserSegmentAnalytics',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getUserSegments(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/user-segments");
        return handleApiResponse(response, 'getUserSegments', []);
      },
      'getUserSegments',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getUsers(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/users");
        return handleApiResponse(response, 'getUsers', []);
      },
      'getUsers',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getVendorCommunications(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/vendor-communications");
        return handleApiResponse(response, 'getVendorCommunications', []);
      },
      'getVendorCommunications',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getVendorContracts(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/vendor-contracts");
        return handleApiResponse(response, 'getVendorContracts', []);
      },
      'getVendorContracts',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getVendors(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/vendors");
        return handleApiResponse(response, 'getVendors', []);
      },
      'getVendors',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getZeroTrustMetrics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/zero-trust-metrics");
        return handleApiResponse(response, 'getZeroTrustMetrics', {});
      },
      'getZeroTrustMetrics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getZeroTrustPolicies(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/zero-trust-policies");
        return handleApiResponse(response, 'getZeroTrustPolicies', []);
      },
      'getZeroTrustPolicies',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getAnomalyDetections(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/anomaly-detections");
        return handleApiResponse(response, 'getAnomalyDetections', []);
      },
      'getAnomalyDetections',
      { fallbackValue: [], showToast: false }
    )();
  }

  // CREATE methods
  async createABTest(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/ab-tests", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createABTest', {});
      },
      'createABTest',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createAsset(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/assets", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createAsset', {});
      },
      'createAsset',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createAssetAssignment(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/asset-assignments", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createAssetAssignment', {});
      },
      'createAssetAssignment',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createCustomer(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/customers", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createCustomer', {});
      },
      'createCustomer',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createFeatureFlag(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/feature-flags", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createFeatureFlag', {});
      },
      'createFeatureFlag',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createFleetVehicle(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/fleet-vehicles", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createFleetVehicle', {});
      },
      'createFleetVehicle',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createIntegration(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/integrations", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createIntegration', {});
      },
      'createIntegration',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createKnowledgeArticle(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/knowledge-articles", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createKnowledgeArticle', {});
      },
      'createKnowledgeArticle',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createMaintenanceRecord(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/maintenance-records", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createMaintenanceRecord', {});
      },
      'createMaintenanceRecord',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createPayment(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/payments", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createPayment', {});
      },
      'createPayment',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createProject(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/projects", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createProject', {});
      },
      'createProject',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createReport(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/reports", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createReport', {});
      },
      'createReport',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createRollout(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/rollouts", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createRollout', {});
      },
      'createRollout',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createUser(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/users", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createUser', {});
      },
      'createUser',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createUserSegment(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/user-segments", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createUserSegment', {});
      },
      'createUserSegment',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createVendor(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/vendors", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createVendor', {});
      },
      'createVendor',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createVendorCommunication(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/vendor-communications", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createVendorCommunication', {});
      },
      'createVendorCommunication',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async createVendorContract(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/vendor-contracts", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'createVendorContract', {});
      },
      'createVendorContract',
      { fallbackValue: {}, showToast: true }
    )();
  }

  // UPDATE methods
  async updateCustomer(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/customers/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'updateCustomer', {});
      },
      'updateCustomer',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async updateFeatureFlag(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/feature-flags/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'updateFeatureFlag', {});
      },
      'updateFeatureFlag',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async updateFleetVehicle(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/fleet-vehicles/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'updateFleetVehicle', {});
      },
      'updateFleetVehicle',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async updateIntegration(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/integrations/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'updateIntegration', {});
      },
      'updateIntegration',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async updateKnowledgeArticle(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/knowledge-articles/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'updateKnowledgeArticle', {});
      },
      'updateKnowledgeArticle',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async updatePayment(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/payments/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'updatePayment', {});
      },
      'updatePayment',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async updateUser(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'updateUser', {});
      },
      'updateUser',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async updateUserSegment(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/user-segments/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'updateUserSegment', {});
      },
      'updateUserSegment',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async updateVendor(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/vendors/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'updateVendor', {});
      },
      'updateVendor',
      { fallbackValue: {}, showToast: true }
    )();
  }

  // DELETE methods
  async deleteCustomer(id: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>(`/api/v1/customers/${id}`, {
          method: 'DELETE'
        });
        return handleApiResponse(response, 'deleteCustomer', false);
      },
      'deleteCustomer',
      { fallbackValue: false, showToast: true }
    )();
  }

  async deleteFeatureFlag(id: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>(`/api/v1/feature-flags/${id}`, {
          method: 'DELETE'
        });
        return handleApiResponse(response, 'deleteFeatureFlag', false);
      },
      'deleteFeatureFlag',
      { fallbackValue: false, showToast: true }
    )();
  }

  async deleteFeedback(id: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>(`/api/v1/feedback/${id}`, {
          method: 'DELETE'
        });
        return handleApiResponse(response, 'deleteFeedback', false);
      },
      'deleteFeedback',
      { fallbackValue: false, showToast: true }
    )();
  }

  async deleteFleetVehicle(id: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>(`/api/v1/fleet-vehicles/${id}`, {
          method: 'DELETE'
        });
        return handleApiResponse(response, 'deleteFleetVehicle', false);
      },
      'deleteFleetVehicle',
      { fallbackValue: false, showToast: true }
    )();
  }

  async deleteIntegration(id: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>(`/api/v1/integrations/${id}`, {
          method: 'DELETE'
        });
        return handleApiResponse(response, 'deleteIntegration', false);
      },
      'deleteIntegration',
      { fallbackValue: false, showToast: true }
    )();
  }

  async deleteKnowledgeArticle(id: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>(`/api/v1/knowledge-articles/${id}`, {
          method: 'DELETE'
        });
        return handleApiResponse(response, 'deleteKnowledgeArticle', false);
      },
      'deleteKnowledgeArticle',
      { fallbackValue: false, showToast: true }
    )();
  }

  async deletePayment(id: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>(`/api/v1/payments/${id}`, {
          method: 'DELETE'
        });
        return handleApiResponse(response, 'deletePayment', false);
      },
      'deletePayment',
      { fallbackValue: false, showToast: true }
    )();
  }

  async deleteUser(id: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>(`/api/v1/users/${id}`, {
          method: 'DELETE'
        });
        return handleApiResponse(response, 'deleteUser', false);
      },
      'deleteUser',
      { fallbackValue: false, showToast: true }
    )();
  }

  async deleteUserSegment(id: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>(`/api/v1/user-segments/${id}`, {
          method: 'DELETE'
        });
        return handleApiResponse(response, 'deleteUserSegment', false);
      },
      'deleteUserSegment',
      { fallbackValue: false, showToast: true }
    )();
  }

  async deleteVendor(id: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>(`/api/v1/vendors/${id}`, {
          method: 'DELETE'
        });
        return handleApiResponse(response, 'deleteVendor', false);
      },
      'deleteVendor',
      { fallbackValue: false, showToast: true }
    )();
  }

  // Action methods
  async acknowledgeAlert(id: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>(`/api/v1/alerts/${id}/acknowledge`, {
          method: 'POST'
        });
        return handleApiResponse(response, 'acknowledgeAlert', false);
      },
      'acknowledgeAlert',
      { fallbackValue: false, showToast: true }
    )();
  }

  async archiveFeedback(id: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>(`/api/v1/feedback/${id}/archive`, {
          method: 'POST'
        });
        return handleApiResponse(response, 'archiveFeedback', false);
      },
      'archiveFeedback',
      { fallbackValue: false, showToast: true }
    )();
  }

  async downloadFile(fileId: string): Promise<Blob> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Blob>(`/api/v1/files/${fileId}/download`, {
          method: 'GET'
        });
        return handleApiResponse(response, 'downloadFile', new Blob());
      },
      'downloadFile',
      { fallbackValue: new Blob(), showToast: true }
    )();
  }

  async exportAPIAnalytics(): Promise<Blob> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Blob>("/api/v1/api-analytics/export", {
          method: 'GET'
        });
        return handleApiResponse(response, 'exportAPIAnalytics', new Blob());
      },
      'exportAPIAnalytics',
      { fallbackValue: new Blob(), showToast: true }
    )();
  }

  async exportData(dataType: string, format: string): Promise<Blob> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Blob>(`/api/v1/export/${dataType}?format=${format}`, {
          method: 'GET'
        });
        return handleApiResponse(response, 'exportData', new Blob());
      },
      'exportData',
      { fallbackValue: new Blob(), showToast: true }
    )();
  }

  async generateReport(data: Record<string, unknown>): Promise<Blob> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Blob>("/api/v1/reports/generate", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'generateReport', new Blob());
      },
      'generateReport',
      { fallbackValue: new Blob(), showToast: true }
    )();
  }

  async generateRevenueReport(): Promise<Blob> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Blob>("/api/v1/revenue/report", {
          method: 'GET'
        });
        return handleApiResponse(response, 'generateRevenueReport', new Blob());
      },
      'generateRevenueReport',
      { fallbackValue: new Blob(), showToast: true }
    )();
  }

  async optimizeRoutes(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/routes/optimize", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'optimizeRoutes', {});
      },
      'optimizeRoutes',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async optimizeSEO(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/seo/optimize", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'optimizeSEO', {});
      },
      'optimizeSEO',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async processPayment(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/payments/process", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'processPayment', {});
      },
      'processPayment',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async refreshRevenueData(): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>("/api/v1/revenue/refresh", {
          method: 'POST'
        });
        return handleApiResponse(response, 'refreshRevenueData', false);
      },
      'refreshRevenueData',
      { fallbackValue: false, showToast: true }
    )();
  }

  async refreshSEOAnalysis(): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>("/api/v1/seo/refresh", {
          method: 'POST'
        });
        return handleApiResponse(response, 'refreshSEOAnalysis', false);
      },
      'refreshSEOAnalysis',
      { fallbackValue: false, showToast: true }
    )();
  }

  async refundPayment(paymentId: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/payments/${paymentId}/refund`, {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'refundPayment', {});
      },
      'refundPayment',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async replyToFeedback(feedbackId: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/feedback/${feedbackId}/reply`, {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'replyToFeedback', {});
      },
      'replyToFeedback',
      { fallbackValue: {}, showToast: true }
    )();
  }

  async sendChatMessage(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/chat/messages", {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return handleApiResponse(response, 'sendChatMessage', {});
      },
      'sendChatMessage',
      { fallbackValue: {}, showToast: true }
    )();
  }
}

// Export singleton instance
export const realApiService = new RealApiService();
export const realApi = realApiService;