import { realApi } from "./real-api";
import { apiService } from "./api";
import { logger } from "./logger";
import { type KPIMetric, type FleetVehicle, type Notification, type User } from "./types";

// Export types for use in other components
export type { KPIMetric, FleetVehicle, Notification, User };

// Production API service that only uses real APIs
export class ProductionApiService {
  
  // Authentication
  async login(email: string, password: string) {
    return await apiService.login(email, password);
  }

  async logout() {
    return await apiService.logout();
  }

  async verifyToken() {
    return await apiService.verifyToken();
  }

  // Dashboard APIs
  async getKPIMetrics(): Promise<KPIMetric[]> {
    try {
      const data = await realApi.getKPIMetrics();
      return (data || []) as unknown as KPIMetric[];
    } catch (error) {
      logger.error("Failed to fetch KPI metrics:", error);
      throw new Error("Failed to load dashboard metrics");
    }
  }

  async getFleetVehicles(): Promise<FleetVehicle[]> {
    try {
      const data = await realApi.getFleetVehicles();
      return (data || []) as unknown as FleetVehicle[];
    } catch (error) {
      logger.error("Failed to fetch fleet vehicles:", error);
      throw new Error("Failed to load fleet vehicles");
    }
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      const data = await realApi.getNotifications();
      return (data || []) as unknown as Notification[];
    } catch (error) {
      logger.error("Failed to fetch notifications:", error);
      throw new Error("Failed to load notifications");
    }
  }

  // User Management
  async getUsers(): Promise<User[]> {
    try {
      const data = await realApi.getUsers();
      return (data || []) as unknown as User[];
    } catch (error) {
      logger.error("Failed to fetch users:", error);
      throw new Error("Failed to load users");
    }
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const data = await realApi.getUserById(userId);
      return data as unknown as User;
    } catch (error) {
      logger.error("Failed to fetch user:", error);
      throw new Error("Failed to load user");
    }
  }

  // Enterprise Management
  async getEnterpriseClients(): Promise<Record<string, unknown>[]> {
    try {
      const data = await realApi.getEnterpriseClients();
      return (data || []) as unknown as Record<string, unknown>[];
    } catch (error) {
      logger.error("Failed to fetch enterprise clients:", error);
      throw new Error("Failed to load enterprise clients");
    }
  }

  async getEnterpriseStats(): Promise<Record<string, unknown>> {
    try {
      const data = await realApi.getEnterpriseStats();
      return (data || {}) as unknown as Record<string, unknown>;
    } catch (error) {
      logger.error("Failed to fetch enterprise stats:", error);
      throw new Error("Failed to load enterprise stats");
    }
  }

  // Fleet Management
  async getFleetVehicleById(vehicleId: string): Promise<FleetVehicle> {
    try {
      const data = await realApi.getFleetVehicleById(vehicleId);
      return data as unknown as FleetVehicle;
    } catch (error) {
      logger.error("Failed to fetch fleet vehicle:", error);
      throw new Error("Failed to load fleet vehicle");
    }
  }

  async updateFleetVehicle(vehicleId: string, updates: Record<string, unknown>): Promise<FleetVehicle> {
    try {
      const data = await realApi.updateFleetVehicle(vehicleId, updates);
      return data as unknown as FleetVehicle;
    } catch (error) {
      logger.error("Failed to update fleet vehicle:", error);
      throw new Error("Failed to update fleet vehicle");
    }
  }

  // Analytics
  async getAnalytics(timeRange: string = '7d'): Promise<Record<string, unknown>> {
    try {
      return await realApi.getAnalytics(timeRange);
    } catch (error) {
      logger.error("Failed to fetch analytics:", error);
      throw new Error("Failed to load analytics");
    }
  }

  async getDashboardMetrics(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getDashboardMetrics();
    } catch (error) {
      logger.error("Failed to fetch dashboard metrics:", error);
      throw new Error("Failed to load dashboard metrics");
    }
  }

  // Finance
  async getFinanceData(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getFinanceData();
    } catch (error) {
      logger.error("Failed to fetch finance data:", error);
      throw new Error("Failed to load finance data");
    }
  }

  async getPayments(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getPayments();
    } catch (error) {
      logger.error("Failed to fetch payments:", error);
      throw new Error("Failed to load payments");
    }
  }

  async createPayment(paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createPayment(paymentData);
    } catch (error) {
      logger.error("Failed to create payment:", error);
      throw new Error("Failed to create payment");
    }
  }

  // Assets
  async getAssets(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getAssets();
    } catch (error) {
      logger.error("Failed to fetch assets:", error);
      throw new Error("Failed to load assets");
    }
  }

  async createAsset(assetData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createAsset(assetData);
    } catch (error) {
      logger.error("Failed to create asset:", error);
      throw new Error("Failed to create asset");
    }
  }

  // Maintenance
  async getMaintenanceRecords(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getMaintenanceRecords();
    } catch (error) {
      logger.error("Failed to fetch maintenance records:", error);
      throw new Error("Failed to load maintenance records");
    }
  }

  async getMaintenanceForecast(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getMaintenanceForecast();
    } catch (error) {
      logger.error("Failed to fetch maintenance forecast:", error);
      throw new Error("Failed to load maintenance forecast");
    }
  }

  async updateMaintenanceRecord(recordId: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.updateMaintenanceRecord(recordId, updates);
    } catch (error) {
      logger.error("Failed to update maintenance record:", error);
      throw new Error("Failed to update maintenance record");
    }
  }

  // System Health
  async getSystemHealth(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getSystemHealth();
    } catch (error) {
      logger.error("Failed to fetch system health:", error);
      throw new Error("Failed to load system health");
    }
  }

  async getSystemAlerts(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getSystemAlerts();
    } catch (error) {
      logger.error("Failed to fetch system alerts:", error);
      throw new Error("Failed to load system alerts");
    }
  }

  async getSystemLogs(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getSystemLogs();
    } catch (error) {
      logger.error("Failed to fetch system logs:", error);
      throw new Error("Failed to load system logs");
    }
  }

  async getAPIPerformance(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getAPIPerformance();
    } catch (error) {
      logger.error("Failed to fetch API performance:", error);
      throw new Error("Failed to load API performance");
    }
  }

  // Settings
  async getSettings(category: string): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getSettings(category);
    } catch (error) {
      logger.error("Failed to fetch settings:", error);
      throw new Error("Failed to load settings");
    }
  }

  async updateSettings(settingsData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.updateSettings(settingsData);
    } catch (error) {
      logger.error("Failed to update settings:", error);
      throw new Error("Failed to update settings");
    }
  }

  // Reports
  async getReports(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getReports();
    } catch (error) {
      logger.error("Failed to fetch reports:", error);
      throw new Error("Failed to load reports");
    }
  }

  async generateReport(reportType: string, options: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.generateReport(reportType, options);
    } catch (error) {
      logger.error("Failed to generate report:", error);
      throw new Error("Failed to generate report");
    }
  }

  // Integrations
  async getIntegrations(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getIntegrations();
    } catch (error) {
      logger.error("Failed to fetch integrations:", error);
      throw new Error("Failed to load integrations");
    }
  }

  async getIntegrationTemplates(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getIntegrationTemplates();
    } catch (error) {
      logger.error("Failed to fetch integration templates:", error);
      throw new Error("Failed to load integration templates");
    }
  }

  async testIntegration(integrationId: string): Promise<boolean> {
    try {
      return await realApi.testIntegration(integrationId);
    } catch (error) {
      logger.error("Failed to test integration:", error);
      throw new Error("Failed to test integration");
    }
  }

  // Feature Flags
  async getFeatureFlags(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getFeatureFlags();
    } catch (error) {
      logger.error("Failed to fetch feature flags:", error);
      throw new Error("Failed to load feature flags");
    }
  }

  async updateFeatureFlag(flagId: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.updateFeatureFlag(flagId, updates);
    } catch (error) {
      logger.error("Failed to update feature flag:", error);
      throw new Error("Failed to update feature flag");
    }
  }

  // Chat
  async getChatMessages(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getChatMessages();
    } catch (error) {
      logger.error("Failed to fetch chat messages:", error);
      throw new Error("Failed to load chat messages");
    }
  }

  async sendChatMessage(messageData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.sendChatMessage(messageData);
    } catch (error) {
      logger.error("Failed to send chat message:", error);
      throw new Error("Failed to send chat message");
    }
  }

  // AI/ML
  async getAIModels(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getAIModels();
    } catch (error) {
      logger.error("Failed to fetch AI models:", error);
      throw new Error("Failed to load AI models");
    }
  }

  async getFraudCases(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getFraudCases();
    } catch (error) {
      logger.error("Failed to fetch fraud cases:", error);
      throw new Error("Failed to load fraud cases");
    }
  }

  async getRecommendations(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getRecommendations();
    } catch (error) {
      logger.error("Failed to fetch recommendations:", error);
      throw new Error("Failed to load recommendations");
    }
  }

  async getTrainingROI(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getTrainingROI();
    } catch (error) {
      logger.error("Failed to fetch training ROI:", error);
      throw new Error("Failed to load training ROI");
    }
  }

  async getRecommendationUplift(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getRecommendationUplift();
    } catch (error) {
      logger.error("Failed to fetch recommendation uplift:", error);
      throw new Error("Failed to load recommendation uplift");
    }
  }

  // SEO
  async getSEOData(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getSEOData();
    } catch (error) {
      logger.error("Failed to fetch SEO data:", error);
      throw new Error("Failed to load SEO data");
    }
  }

  async optimizeSEO(optimizationData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.optimizeSEO(optimizationData);
    } catch (error) {
      logger.error("Failed to optimize SEO:", error);
      throw new Error("Failed to optimize SEO");
    }
  }

  // Audit & Security
  async getAuditLogs(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getAuditLogs();
    } catch (error) {
      logger.error("Failed to fetch audit logs:", error);
      throw new Error("Failed to load audit logs");
    }
  }

  async getSecurityEvents(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getSecurityEvents();
    } catch (error) {
      logger.error("Failed to fetch security events:", error);
      throw new Error("Failed to load security events");
    }
  }

  async getUserActivities(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getUserActivities();
    } catch (error) {
      logger.error("Failed to fetch user activities:", error);
      throw new Error("Failed to load user activities");
    }
  }

  // Notifications
  async getEmailNotifications(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getEmailNotifications();
    } catch (error) {
      logger.error("Failed to fetch email notifications:", error);
      throw new Error("Failed to load email notifications");
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      return await realApi.markNotificationAsRead(notificationId);
    } catch (error) {
      logger.error("Failed to mark notification as read:", error);
      throw new Error("Failed to mark notification as read");
    }
  }

  // Tickets
  async getTickets(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getTickets();
    } catch (error) {
      logger.error("Failed to fetch tickets:", error);
      throw new Error("Failed to load tickets");
    }
  }

  // Chat Channels
  async getChatChannels(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getChatChannels();
    } catch (error) {
      logger.error("Failed to fetch chat channels:", error);
      throw new Error("Failed to load chat channels");
    }
  }

  async createChatChannel(channelData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createChatChannel(channelData);
    } catch (error) {
      logger.error("Failed to create chat channel:", error);
      throw new Error("Failed to create chat channel");
    }
  }

  // Asset Assignments
  async getAssetAssignments(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getAssetAssignments();
    } catch (error) {
      logger.error("Failed to fetch asset assignments:", error);
      throw new Error("Failed to load asset assignments");
    }
  }

  async updateAssetAssignment(assignmentId: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.updateAssetAssignment(assignmentId, updates);
    } catch (error) {
      logger.error("Failed to update asset assignment:", error);
      throw new Error("Failed to update asset assignment");
    }
  }

  // Subscriptions & Payouts
  async getSubscriptions(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getSubscriptions();
    } catch (error) {
      logger.error("Failed to fetch subscriptions:", error);
      throw new Error("Failed to load subscriptions");
    }
  }

  async getPayouts(): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getPayouts();
    } catch (error) {
      logger.error("Failed to fetch payouts:", error);
      throw new Error("Failed to load payouts");
    }
  }

  // SEO Refresh
  async refreshSEO(): Promise<Record<string, unknown>> {
    try {
      return await realApi.refreshSEO();
    } catch (error) {
      logger.error("Failed to refresh SEO:", error);
      throw new Error("Failed to refresh SEO");
    }
  }

  // Audit Trail
  async getAuditTrail(filters: Record<string, unknown>): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getAuditTrail(filters);
    } catch (error) {
      logger.error("Failed to fetch audit trail:", error);
      throw new Error("Failed to load audit trail");
    }
  }
}

// Create and export a singleton instance
export const productionApi = new ProductionApiService();
