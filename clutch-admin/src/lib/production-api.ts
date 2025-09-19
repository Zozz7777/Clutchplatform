import { realApi } from "./real-api";
import { apiService } from "./api";
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
      return data || [];
    } catch (error) {
      console.error("Failed to fetch KPI metrics:", error);
      throw new Error("Failed to load dashboard metrics");
    }
  }

  async getFleetVehicles(): Promise<FleetVehicle[]> {
    try {
      const data = await realApi.getFleetVehicles();
      return data || [];
    } catch (error) {
      console.error("Failed to fetch fleet vehicles:", error);
      throw new Error("Failed to load fleet vehicles");
    }
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      const data = await realApi.getNotifications();
      return data || [];
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      throw new Error("Failed to load notifications");
    }
  }

  // User Management APIs
  async getUsers(): Promise<User[]> {
    try {
      const data = await realApi.getUsers();
      return data || [];
    } catch (error) {
      console.error("Failed to fetch users:", error);
      throw new Error("Failed to load users");
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const users = await this.getUsers();
      return users.find(user => user.id === id) || null;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      throw new Error("Failed to load user");
    }
  }

  async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      const data = await realApi.createUser(userData);
      return data;
    } catch (error) {
      console.error("Failed to create user:", error);
      throw new Error("Failed to create user");
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    try {
      const data = await realApi.updateUser(id, userData);
      return data;
    } catch (error) {
      console.error("Failed to update user:", error);
      throw new Error("Failed to update user");
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      return await realApi.deleteUser(id);
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw new Error("Failed to delete user");
    }
  }

  // Fleet Management APIs
  async getFleetVehicles(): Promise<FleetVehicle[]> {
    try {
      const data = await realApi.getFleetVehicles();
      return data || [];
    } catch (error) {
      console.error("Failed to fetch fleet vehicles:", error);
      throw new Error("Failed to load fleet vehicles");
    }
  }

  async getFleetVehicleById(id: string): Promise<FleetVehicle | null> {
    try {
      const vehicles = await this.getFleetVehicles();
      return vehicles.find(vehicle => vehicle.id === id) || null;
    } catch (error) {
      console.error("Failed to fetch fleet vehicle:", error);
      throw new Error("Failed to load fleet vehicle");
    }
  }

  async createFleetVehicle(vehicleData: Partial<FleetVehicle>): Promise<FleetVehicle | null> {
    try {
      const data = await realApi.createFleetVehicle(vehicleData);
      return data;
    } catch (error) {
      console.error("Failed to create fleet vehicle:", error);
      throw new Error("Failed to create fleet vehicle");
    }
  }

  async updateFleetVehicle(id: string, vehicleData: Partial<FleetVehicle>): Promise<FleetVehicle | null> {
    try {
      const data = await realApi.updateFleetVehicle(id, vehicleData);
      return data;
    } catch (error) {
      console.error("Failed to update fleet vehicle:", error);
      throw new Error("Failed to update fleet vehicle");
    }
  }

  async deleteFleetVehicle(id: string): Promise<boolean> {
    try {
      return await realApi.deleteFleetVehicle(id);
    } catch (error) {
      console.error("Failed to delete fleet vehicle:", error);
      throw new Error("Failed to delete fleet vehicle");
    }
  }

  async optimizeRoutes(): Promise<Record<string, unknown>> {
    try {
      return await realApi.optimizeRoutes();
    } catch (error) {
      console.error("Failed to optimize routes:", error);
      throw new Error("Failed to optimize routes");
    }
  }

  // Analytics APIs
  async getAnalyticsMetrics(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getAnalyticsMetrics();
    } catch (error) {
      console.error("Failed to fetch analytics metrics:", error);
      throw new Error("Failed to load analytics metrics");
    }
  }

  async getAnalyticsData(type: string, dateRange?: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.getAnalyticsData(type, dateRange);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
      throw new Error("Failed to load analytics data");
    }
  }

  async generateReport(reportData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.generateReport(reportData);
    } catch (error) {
      console.error("Failed to generate report:", error);
      throw new Error("Failed to generate report");
    }
  }

  async exportData(type: string, format: string = 'csv'): Promise<Record<string, unknown>> {
    try {
      return await realApi.exportData(type, format);
    } catch (error) {
      console.error("Failed to export data:", error);
      throw new Error("Failed to export data");
    }
  }

  // CRM APIs
  async getCustomers(): Promise<any[]> {
    try {
      return await realApi.getCustomers();
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      throw new Error("Failed to load customers");
    }
  }

  async getTickets(): Promise<any[]> {
    try {
      return await realApi.getTickets();
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      throw new Error("Failed to load tickets");
    }
  }

  async createTicket(ticketData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createTicket(ticketData);
    } catch (error) {
      console.error("Failed to create ticket:", error);
      throw new Error("Failed to create ticket");
    }
  }

  async updateTicket(ticketId: string, ticketData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.updateTicket(ticketId, ticketData);
    } catch (error) {
      console.error("Failed to update ticket:", error);
      throw new Error("Failed to update ticket");
    }
  }

  // Finance APIs
  async getPayments(): Promise<any[]> {
    try {
      return await realApi.getPayments();
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      throw new Error("Failed to load payments");
    }
  }

  async getSubscriptions(): Promise<any[]> {
    try {
      return await realApi.getSubscriptions();
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      throw new Error("Failed to load subscriptions");
    }
  }

  async getFinancialMetrics(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getFinancialMetrics();
    } catch (error) {
      console.error("Failed to fetch financial metrics:", error);
      throw new Error("Failed to load financial metrics");
    }
  }

  // Settings APIs
  async getSystemSettings(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getSystemSettings();
    } catch (error) {
      console.error("Failed to fetch system settings:", error);
      throw new Error("Failed to load system settings");
    }
  }

  async updateSystemSettings(settings: Record<string, unknown>): Promise<boolean> {
    try {
      return await realApi.updateSystemSettings(settings);
    } catch (error) {
      console.error("Failed to update system settings:", error);
      throw new Error("Failed to update system settings");
    }
  }

  async getIntegrations(): Promise<any[]> {
    try {
      return await realApi.getIntegrations();
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
      throw new Error("Failed to load integrations");
    }
  }

  async updateIntegration(integrationId: string, config: Record<string, unknown>): Promise<boolean> {
    try {
      return await realApi.updateIntegration(integrationId, config);
    } catch (error) {
      console.error("Failed to update integration:", error);
      throw new Error("Failed to update integration");
    }
  }

  // System Health APIs
  async getSystemHealth(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getSystemHealth();
    } catch (error) {
      console.error("Failed to fetch system health:", error);
      throw new Error("Failed to load system health");
    }
  }

  async acknowledgeAlert(alertId: string): Promise<Record<string, unknown>> {
    try {
      return await realApi.acknowledgeAlert(alertId);
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
      throw new Error("Failed to acknowledge alert");
    }
  }

  async getApiPerformance(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getApiPerformance();
    } catch (error) {
      console.error("Failed to fetch API performance:", error);
      throw new Error("Failed to load API performance");
    }
  }

  // Feature Flags APIs
  async getFeatureFlags(): Promise<any[]> {
    try {
      return await realApi.getFeatureFlags();
    } catch (error) {
      console.error("Failed to fetch feature flags:", error);
      throw new Error("Failed to load feature flags");
    }
  }

  async updateFeatureFlag(flagId: string, enabled: boolean): Promise<boolean> {
    try {
      return await realApi.updateFeatureFlag(flagId, enabled);
    } catch (error) {
      console.error("Failed to update feature flag:", error);
      throw new Error("Failed to update feature flag");
    }
  }

  // Audit Trail APIs
  async getAuditLogs(filters?: Record<string, unknown>): Promise<Record<string, unknown>[]> {
    try {
      return await realApi.getAuditLogs(filters);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      throw new Error("Failed to load audit logs");
    }
  }

  // Chat/Messaging APIs
  async getChatMessages(conversationId?: string): Promise<any[]> {
    try {
      return await realApi.getChatMessages(conversationId);
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
      throw new Error("Failed to load chat messages");
    }
  }

  async sendMessage(messageData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.sendMessage(messageData);
    } catch (error) {
      console.error("Failed to send message:", error);
      throw new Error("Failed to send message");
    }
  }

  // Reports APIs
  async getReports(): Promise<any[]> {
    try {
      return await realApi.getReports();
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      throw new Error("Failed to load reports");
    }
  }

  async createReport(reportData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createReport(reportData);
    } catch (error) {
      console.error("Failed to create report:", error);
      throw new Error("Failed to create report");
    }
  }

  async getReport(reportId: string): Promise<Record<string, unknown>> {
    try {
      return await realApi.getReport(reportId);
    } catch (error) {
      console.error("Failed to fetch report:", error);
      throw new Error("Failed to load report");
    }
  }

  async deleteReport(reportId: string): Promise<boolean> {
    try {
      return await realApi.deleteReport(reportId);
    } catch (error) {
      console.error("Failed to delete report:", error);
      throw new Error("Failed to delete report");
    }
  }

  // Asset Management APIs
  async getAssets(): Promise<any[]> {
    try {
      return await realApi.getAssets();
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      throw new Error("Failed to load assets");
    }
  }

  async getMaintenanceRecords(): Promise<any[]> {
    try {
      return await realApi.getMaintenanceRecords();
    } catch (error) {
      console.error("Failed to fetch maintenance records:", error);
      throw new Error("Failed to load maintenance records");
    }
  }

  async getAssetAssignments(): Promise<any[]> {
    try {
      return await realApi.getAssetAssignments();
    } catch (error) {
      console.error("Failed to fetch asset assignments:", error);
      throw new Error("Failed to load asset assignments");
    }
  }

  async createAsset(assetData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createAsset(assetData);
    } catch (error) {
      console.error("Failed to create asset:", error);
      throw new Error("Failed to create asset");
    }
  }

  async createMaintenanceRecord(maintenanceData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createMaintenanceRecord(maintenanceData);
    } catch (error) {
      console.error("Failed to create maintenance record:", error);
      throw new Error("Failed to create maintenance record");
    }
  }

  async createAssetAssignment(assignmentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createAssetAssignment(assignmentData);
    } catch (error) {
      console.error("Failed to create asset assignment:", error);
      throw new Error("Failed to create asset assignment");
    }
  }

  // Project Management APIs
  async getProjects(): Promise<any[]> {
    try {
      return await realApi.getProjects();
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      throw new Error("Failed to load projects");
    }
  }

  async createProject(projectData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createProject(projectData);
    } catch (error) {
      console.error("Failed to create project:", error);
      throw new Error("Failed to create project");
    }
  }

  async getProjectTasks(projectId: string): Promise<any[]> {
    try {
      return await realApi.getProjectTasks(projectId);
    } catch (error) {
      console.error("Failed to fetch project tasks:", error);
      throw new Error("Failed to load project tasks");
    }
  }

  async getTimeTracking(projectId: string): Promise<any[]> {
    try {
      return await realApi.getTimeTracking(projectId);
    } catch (error) {
      console.error("Failed to fetch time tracking:", error);
      throw new Error("Failed to load time tracking");
    }
  }

  // Feature Flags APIs - Additional methods
  async getABTests(): Promise<any[]> {
    try {
      return await realApi.getABTests();
    } catch (error) {
      console.error("Failed to fetch A/B tests:", error);
      throw new Error("Failed to load A/B tests");
    }
  }

  async getRollouts(): Promise<any[]> {
    try {
      return await realApi.getRollouts();
    } catch (error) {
      console.error("Failed to fetch rollouts:", error);
      throw new Error("Failed to load rollouts");
    }
  }

  async createABTest(abTestData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createABTest(abTestData);
    } catch (error) {
      console.error("Failed to create A/B test:", error);
      throw new Error("Failed to create A/B test");
    }
  }

  async createRollout(rolloutData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createRollout(rolloutData);
    } catch (error) {
      console.error("Failed to create rollout:", error);
      throw new Error("Failed to create rollout");
    }
  }

  // Finance APIs
  async getPayments(): Promise<any[]> {
    try {
      return await realApi.getPayments();
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      throw new Error("Failed to load payments");
    }
  }

  async getSubscriptions(): Promise<any[]> {
    try {
      return await realApi.getSubscriptions();
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      throw new Error("Failed to load subscriptions");
    }
  }

  async getPayouts(): Promise<any[]> {
    try {
      return await realApi.getPayouts();
    } catch (error) {
      console.error("Failed to fetch payouts:", error);
      throw new Error("Failed to load payouts");
    }
  }

  async createPayment(paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createPayment(paymentData);
    } catch (error) {
      console.error("Failed to create payment:", error);
      throw new Error("Failed to create payment");
    }
  }

  async updatePayment(paymentId: string, paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.updatePayment(paymentId, paymentData);
    } catch (error) {
      console.error("Failed to update payment:", error);
      throw new Error("Failed to update payment");
    }
  }

  async deletePayment(paymentId: string): Promise<boolean> {
    try {
      return await realApi.deletePayment(paymentId);
    } catch (error) {
      console.error("Failed to delete payment:", error);
      throw new Error("Failed to delete payment");
    }
  }

  // CRM APIs
  async getCustomers(): Promise<any[]> {
    try {
      return await realApi.getCustomers();
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      throw new Error("Failed to load customers");
    }
  }

  async createCustomer(customerData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createCustomer(customerData);
    } catch (error) {
      console.error("Failed to create customer:", error);
      throw new Error("Failed to create customer");
    }
  }

  async updateCustomer(customerId: string, customerData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.updateCustomer(customerId, customerData);
    } catch (error) {
      console.error("Failed to update customer:", error);
      throw new Error("Failed to update customer");
    }
  }

  async deleteCustomer(customerId: string): Promise<boolean> {
    try {
      return await realApi.deleteCustomer(customerId);
    } catch (error) {
      console.error("Failed to delete customer:", error);
      throw new Error("Failed to delete customer");
    }
  }

  // AI/ML APIs
  async getAIModels(): Promise<any[]> {
    try {
      return await realApi.getAIModels();
    } catch (error) {
      console.error("Failed to fetch AI models:", error);
      throw new Error("Failed to load AI models");
    }
  }

  async getFraudCases(): Promise<any[]> {
    try {
      return await realApi.getFraudCases();
    } catch (error) {
      console.error("Failed to fetch fraud cases:", error);
      throw new Error("Failed to load fraud cases");
    }
  }

  async getRecommendations(): Promise<any[]> {
    try {
      return await realApi.getRecommendations();
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      throw new Error("Failed to load recommendations");
    }
  }

  async trainModel(modelId: string): Promise<Record<string, unknown>> {
    try {
      return await realApi.trainModel(modelId);
    } catch (error) {
      console.error("Failed to train model:", error);
      throw new Error("Failed to train model");
    }
  }

  async updateModel(modelId: string, modelData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.updateModel(modelId, modelData);
    } catch (error) {
      console.error("Failed to update model:", error);
      throw new Error("Failed to update model");
    }
  }

  // Vendor Management APIs
  async getVendors(): Promise<any[]> {
    try {
      return await realApi.getVendors();
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
      throw new Error("Failed to load vendors");
    }
  }

  async createVendor(vendorData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createVendor(vendorData);
    } catch (error) {
      console.error("Failed to create vendor:", error);
      throw new Error("Failed to create vendor");
    }
  }

  async getVendorContracts(): Promise<any[]> {
    try {
      return await realApi.getVendorContracts();
    } catch (error) {
      console.error("Failed to fetch vendor contracts:", error);
      throw new Error("Failed to load vendor contracts");
    }
  }

  async createVendorContract(contractData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createVendorContract(contractData);
    } catch (error) {
      console.error("Failed to create vendor contract:", error);
      throw new Error("Failed to create vendor contract");
    }
  }

  async getVendorCommunications(): Promise<any[]> {
    try {
      return await realApi.getVendorCommunications();
    } catch (error) {
      console.error("Failed to fetch vendor communications:", error);
      throw new Error("Failed to load vendor communications");
    }
  }

  async createVendorCommunication(communicationData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createVendorCommunication(communicationData);
    } catch (error) {
      console.error("Failed to create vendor communication:", error);
      throw new Error("Failed to create vendor communication");
    }
  }

  async updateVendor(vendorId: string, vendorData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.updateVendor(vendorId, vendorData);
    } catch (error) {
      console.error("Failed to update vendor:", error);
      throw new Error("Failed to update vendor");
    }
  }

  async deleteVendor(vendorId: string): Promise<boolean> {
    try {
      return await realApi.deleteVendor(vendorId);
    } catch (error) {
      console.error("Failed to delete vendor:", error);
      throw new Error("Failed to delete vendor");
    }
  }

  // Integration Management APIs
  async getIntegrations(): Promise<any[]> {
    try {
      return await realApi.getIntegrations();
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
      throw new Error("Failed to load integrations");
    }
  }

  async createIntegration(integrationData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createIntegration(integrationData);
    } catch (error) {
      console.error("Failed to create integration:", error);
      throw new Error("Failed to create integration");
    }
  }

  async updateIntegration(integrationId: string, integrationData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.updateIntegration(integrationId, integrationData);
    } catch (error) {
      console.error("Failed to update integration:", error);
      throw new Error("Failed to update integration");
    }
  }

  async deleteIntegration(integrationId: string): Promise<boolean> {
    try {
      return await realApi.deleteIntegration(integrationId);
    } catch (error) {
      console.error("Failed to delete integration:", error);
      throw new Error("Failed to delete integration");
    }
  }

  // Feature Flags APIs
  async createFeatureFlag(flagData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createFeatureFlag(flagData);
    } catch (error) {
      console.error("Failed to create feature flag:", error);
      throw new Error("Failed to create feature flag");
    }
  }

  async updateFeatureFlag(flagId: string, flagData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.updateFeatureFlag(flagId, flagData);
    } catch (error) {
      console.error("Failed to update feature flag:", error);
      throw new Error("Failed to update feature flag");
    }
  }

  async deleteFeatureFlag(flagId: string): Promise<boolean> {
    try {
      return await realApi.deleteFeatureFlag(flagId);
    } catch (error) {
      console.error("Failed to delete feature flag:", error);
      throw new Error("Failed to delete feature flag");
    }
  }

  // System Monitoring APIs
  async getSystemHealth(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getSystemHealth();
    } catch (error) {
      console.error("Failed to fetch system health:", error);
      throw new Error("Failed to load system health");
    }
  }

  async getPerformanceMetrics(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getPerformanceMetrics();
    } catch (error) {
      console.error("Failed to fetch performance metrics:", error);
      throw new Error("Failed to load performance metrics");
    }
  }

  async getSystemPerformanceMetrics(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getSystemPerformanceMetrics();
    } catch (error) {
      console.error("Failed to fetch system performance metrics:", error);
      throw new Error("Failed to load system performance metrics");
    }
  }

  async getSystemAlerts(): Promise<any[]> {
    try {
      return await realApi.getSystemAlerts();
    } catch (error) {
      console.error("Failed to fetch system alerts:", error);
      throw new Error("Failed to load system alerts");
    }
  }

  // Business Intelligence APIs
  async getComplianceStatus(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getComplianceStatus();
    } catch (error) {
      console.error("Failed to fetch compliance status:", error);
      throw new Error("Failed to load compliance status");
    }
  }

  async getEngagementHeatmap(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getEngagementHeatmap();
    } catch (error) {
      console.error("Failed to fetch engagement heatmap:", error);
      throw new Error("Failed to load engagement heatmap");
    }
  }

  async getMaintenanceForecast(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getMaintenanceForecast();
    } catch (error) {
      console.error("Failed to fetch maintenance forecast:", error);
      throw new Error("Failed to load maintenance forecast");
    }
  }

  async getRecommendationUplift(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getRecommendationUplift();
    } catch (error) {
      console.error("Failed to fetch recommendation uplift:", error);
      throw new Error("Failed to load recommendation uplift");
    }
  }

  async getActiveSessions(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getActiveSessions();
    } catch (error) {
      console.error("Failed to fetch active sessions:", error);
      throw new Error("Failed to load active sessions");
    }
  }

  async getRevenueMetrics(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getRevenueMetrics();
    } catch (error) {
      console.error("Failed to fetch revenue metrics:", error);
      throw new Error("Failed to load revenue metrics");
    }
  }

  async getSystemLogs(): Promise<any[]> {
    try {
      return await realApi.getSystemLogs();
    } catch (error) {
      console.error("Failed to fetch system logs:", error);
      throw new Error("Failed to load system logs");
    }
  }

  // Revenue Forecasting APIs
  async getRevenueForecast(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getRevenueForecast();
    } catch (error) {
      console.error("Failed to fetch revenue forecast:", error);
      throw new Error("Failed to load revenue forecast");
    }
  }

  async refreshRevenueData(): Promise<Record<string, unknown>> {
    try {
      return await realApi.refreshRevenueData();
    } catch (error) {
      console.error("Failed to refresh revenue data:", error);
      throw new Error("Failed to refresh revenue data");
    }
  }

  async generateRevenueReport(): Promise<Record<string, unknown>> {
    try {
      return await realApi.generateRevenueReport();
    } catch (error) {
      console.error("Failed to generate revenue report:", error);
      throw new Error("Failed to generate revenue report");
    }
  }

  // SEO CMS APIs
  async getSEOData(): Promise<any[]> {
    try {
      return await realApi.getSEOData();
    } catch (error) {
      console.error("Failed to fetch SEO data:", error);
      throw new Error("Failed to load SEO data");
    }
  }

  async refreshSEOAnalysis(): Promise<Record<string, unknown>> {
    try {
      return await realApi.refreshSEOAnalysis();
    } catch (error) {
      console.error("Failed to refresh SEO analysis:", error);
      throw new Error("Failed to refresh SEO analysis");
    }
  }

  async optimizeSEO(): Promise<Record<string, unknown>> {
    try {
      return await realApi.optimizeSEO();
    } catch (error) {
      console.error("Failed to optimize SEO:", error);
      throw new Error("Failed to optimize SEO");
    }
  }

  // Mobile CMS APIs
  async getMobileAppSettings(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getMobileAppSettings();
    } catch (error) {
      console.error("Failed to fetch mobile app settings:", error);
      throw new Error("Failed to load mobile app settings");
    }
  }

  async saveMobileAppSettings(settings: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.saveMobileAppSettings(settings);
    } catch (error) {
      console.error("Failed to save mobile app settings:", error);
      throw new Error("Failed to save mobile app settings");
    }
  }

  async previewMobileApp(): Promise<Record<string, unknown>> {
    try {
      return await realApi.previewMobileApp();
    } catch (error) {
      console.error("Failed to preview mobile app:", error);
      throw new Error("Failed to preview mobile app");
    }
  }

  // Support Feedback APIs
  async getFeedback(): Promise<any[]> {
    try {
      return await realApi.getFeedback();
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
      throw new Error("Failed to load feedback");
    }
  }

  async replyToFeedback(feedbackId: string, replyData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.replyToFeedback(feedbackId, replyData);
    } catch (error) {
      console.error("Failed to reply to feedback:", error);
      throw new Error("Failed to reply to feedback");
    }
  }

  async archiveFeedback(feedbackId: string): Promise<Record<string, unknown>> {
    try {
      return await realApi.archiveFeedback(feedbackId);
    } catch (error) {
      console.error("Failed to archive feedback:", error);
      throw new Error("Failed to archive feedback");
    }
  }

  async deleteFeedback(feedbackId: string): Promise<Record<string, unknown>> {
    try {
      return await realApi.deleteFeedback(feedbackId);
    } catch (error) {
      console.error("Failed to delete feedback:", error);
      throw new Error("Failed to delete feedback");
    }
  }

  // API Analytics APIs
  async getAPIAnalytics(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getAPIAnalytics();
    } catch (error) {
      console.error("Failed to fetch API analytics:", error);
      throw new Error("Failed to load API analytics");
    }
  }

  async exportAPIAnalytics(): Promise<Record<string, unknown>> {
    try {
      return await realApi.exportAPIAnalytics();
    } catch (error) {
      console.error("Failed to export API analytics:", error);
      throw new Error("Failed to export API analytics");
    }
  }

  async configureAPIMonitoring(config: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.configureAPIMonitoring(config);
    } catch (error) {
      console.error("Failed to configure API monitoring:", error);
      throw new Error("Failed to configure API monitoring");
    }
  }

  async getRevenueScenarios(): Promise<any[]> {
    try {
      return await realApi.getRevenueScenarios();
    } catch (error) {
      console.error("Failed to fetch revenue scenarios:", error);
      throw new Error("Failed to load revenue scenarios");
    }
  }

  // CMS APIs
  async getCMSContent(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getCMSContent();
    } catch (error) {
      console.error("Failed to fetch CMS content:", error);
      throw new Error("Failed to load CMS content");
    }
  }

  async updateCMSContent(contentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.updateCMSContent(contentData);
    } catch (error) {
      console.error("Failed to update CMS content:", error);
      throw new Error("Failed to update CMS content");
    }
  }

  // Knowledge Base APIs
  async getKnowledgeArticles(): Promise<any[]> {
    try {
      return await realApi.getKnowledgeArticles();
    } catch (error) {
      console.error("Failed to fetch knowledge articles:", error);
      throw new Error("Failed to load knowledge articles");
    }
  }

  async createKnowledgeArticle(articleData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createKnowledgeArticle(articleData);
    } catch (error) {
      console.error("Failed to create knowledge article:", error);
      throw new Error("Failed to create knowledge article");
    }
  }

  async updateKnowledgeArticle(articleId: string, articleData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.updateKnowledgeArticle(articleId, articleData);
    } catch (error) {
      console.error("Failed to update knowledge article:", error);
      throw new Error("Failed to update knowledge article");
    }
  }

  async deleteKnowledgeArticle(articleId: string): Promise<boolean> {
    try {
      return await realApi.deleteKnowledgeArticle(articleId);
    } catch (error) {
      console.error("Failed to delete knowledge article:", error);
      throw new Error("Failed to delete knowledge article");
    }
  }

  // User Segments APIs
  async getUserSegments(): Promise<any[]> {
    try {
      return await realApi.getUserSegments();
    } catch (error) {
      console.error("Failed to fetch user segments:", error);
      throw new Error("Failed to load user segments");
    }
  }

  async createUserSegment(segmentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createUserSegment(segmentData);
    } catch (error) {
      console.error("Failed to create user segment:", error);
      throw new Error("Failed to create user segment");
    }
  }

  async updateUserSegment(segmentId: string, segmentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.updateUserSegment(segmentId, segmentData);
    } catch (error) {
      console.error("Failed to update user segment:", error);
      throw new Error("Failed to update user segment");
    }
  }

  async deleteUserSegment(segmentId: string): Promise<boolean> {
    try {
      return await realApi.deleteUserSegment(segmentId);
    } catch (error) {
      console.error("Failed to delete user segment:", error);
      throw new Error("Failed to delete user segment");
    }
  }

  // File Upload/Download APIs
  async uploadFile(file: File, type: string): Promise<Record<string, unknown>> {
    try {
      return await realApi.uploadFile(file, type);
    } catch (error) {
      console.error("Failed to upload file:", error);
      throw new Error("Failed to upload file");
    }
  }

  async downloadFile(fileId: string): Promise<Blob> {
    try {
      return await realApi.downloadFile(fileId);
    } catch (error) {
      console.error("Failed to download file:", error);
      throw new Error("Failed to download file");
    }
  }

  // Real-time Communication APIs
  async sendMessage(messageData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.sendMessage(messageData);
    } catch (error) {
      console.error("Failed to send message:", error);
      throw new Error("Failed to send message");
    }
  }

  async getChatSessions(): Promise<any[]> {
    try {
      return await realApi.getChatSessions();
    } catch (error) {
      console.error("Failed to fetch chat sessions:", error);
      throw new Error("Failed to load chat sessions");
    }
  }

  async createChatSession(sessionData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.createChatSession(sessionData);
    } catch (error) {
      console.error("Failed to create chat session:", error);
      throw new Error("Failed to create chat session");
    }
  }

  // Payment Processing APIs
  async processPayment(paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.processPayment(paymentData);
    } catch (error) {
      console.error("Failed to process payment:", error);
      throw new Error("Failed to process payment");
    }
  }

  async refundPayment(paymentId: string, refundData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await realApi.refundPayment(paymentId, refundData);
    } catch (error) {
      console.error("Failed to refund payment:", error);
      throw new Error("Failed to refund payment");
    }
  }

  async getPaymentMethods(): Promise<any[]> {
    try {
      return await realApi.getPaymentMethods();
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      throw new Error("Failed to load payment methods");
    }
  }

  // Analytics APIs - New endpoints for advanced analytics
  async getConfidenceIntervals(): Promise<any[]> {
    try {
      return await realApi.getConfidenceIntervals();
    } catch (error) {
      console.error("Failed to fetch confidence intervals:", error);
      throw new Error("Failed to load confidence intervals");
    }
  }

  async getDependencyForecasts(): Promise<any[]> {
    try {
      return await realApi.getDependencyForecasts();
    } catch (error) {
      console.error("Failed to fetch dependency forecasts:", error);
      throw new Error("Failed to load dependency forecasts");
    }
  }

  // AI/ML APIs - New endpoints for AI components
  async getAnomalyDetections(): Promise<any[]> {
    try {
      return await realApi.getAnomalyDetections();
    } catch (error) {
      console.error("Failed to fetch anomaly detections:", error);
      throw new Error("Failed to load anomaly detections");
    }
  }

  // Testing APIs - New endpoints for testing components
  async getChaosExperiments(): Promise<any[]> {
    try {
      return await realApi.getChaosExperiments();
    } catch (error) {
      console.error("Failed to fetch chaos experiments:", error);
      throw new Error("Failed to load chaos experiments");
    }
  }

  async getBlackSwanEvents(): Promise<any[]> {
    try {
      return await realApi.getBlackSwanEvents();
    } catch (error) {
      console.error("Failed to fetch black swan events:", error);
      throw new Error("Failed to load black swan events");
    }
  }

  // Widget APIs - New endpoints for widget components
  async getUpsellOpportunities(): Promise<any[]> {
    try {
      return await realApi.getUpsellOpportunities();
    } catch (error) {
      console.error("Failed to fetch upsell opportunities:", error);
      throw new Error("Failed to load upsell opportunities");
    }
  }

  async getSLACompliance(): Promise<any[]> {
    try {
      return await realApi.getSLACompliance();
    } catch (error) {
      console.error("Failed to fetch SLA compliance:", error);
      throw new Error("Failed to load SLA compliance");
    }
  }

  async getTrainingROI(): Promise<Record<string, unknown>> {
    try {
      return await realApi.getTrainingROI();
    } catch (error) {
      console.error("Failed to fetch training ROI:", error);
      throw new Error("Failed to load training ROI");
    }
  }

  async getSecurityAlerts(): Promise<any[]> {
    try {
      return await realApi.getSecurityAlerts();
    } catch (error) {
      console.error("Failed to fetch security alerts:", error);
      throw new Error("Failed to load security alerts");
    }
  }

  async getRootCauseAnalysis(): Promise<any[]> {
    try {
      return await realApi.getRootCauseAnalysis();
    } catch (error) {
      console.error("Failed to fetch root cause analysis:", error);
      throw new Error("Failed to load root cause analysis");
    }
  }

  // Operations APIs - New endpoints for operations components
  async getMissionCriticalTasks(): Promise<any[]> {
    try {
      return await realApi.getMissionCriticalTasks();
    } catch (error) {
      console.error("Failed to fetch mission critical tasks:", error);
      throw new Error("Failed to load mission critical tasks");
    }
  }

  async getPortfolioRisks(): Promise<any[]> {
    try {
      return await realApi.getPortfolioRisks();
    } catch (error) {
      console.error("Failed to fetch portfolio risks:", error);
      throw new Error("Failed to load portfolio risks");
    }
  }

  async getSLAMetrics(): Promise<any[]> {
    try {
      return await realApi.getSLAMetrics();
    } catch (error) {
      console.error("Failed to fetch SLA metrics:", error);
      throw new Error("Failed to load SLA metrics");
    }
  }

  async getServiceHealth(): Promise<any[]> {
    try {
      return await realApi.getServiceHealth();
    } catch (error) {
      console.error("Failed to fetch service health:", error);
      throw new Error("Failed to load service health");
    }
  }

  async getComplianceData(): Promise<any[]> {
    try {
      return await realApi.getComplianceData();
    } catch (error) {
      console.error("Failed to fetch compliance data:", error);
      throw new Error("Failed to load compliance data");
    }
  }

  async getChatSessions(): Promise<any[]> {
    try {
      return await realApi.getChatSessions();
    } catch (error) {
      console.error("Failed to fetch chat sessions:", error);
      throw new Error("Failed to load chat sessions");
    }
  }
}

export const productionApi = new ProductionApiService();
