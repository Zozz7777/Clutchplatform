import { realApi } from "./real-api";
import { apiService } from "./api";
import { type KPIMetric, type FleetVehicle, type Notification, type User } from "./mock-api";

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

  async optimizeRoutes(): Promise<any> {
    try {
      return await realApi.optimizeRoutes();
    } catch (error) {
      console.error("Failed to optimize routes:", error);
      throw new Error("Failed to optimize routes");
    }
  }

  // Analytics APIs
  async getAnalyticsMetrics(): Promise<any> {
    try {
      return await realApi.getAnalyticsMetrics();
    } catch (error) {
      console.error("Failed to fetch analytics metrics:", error);
      throw new Error("Failed to load analytics metrics");
    }
  }

  async getAnalyticsData(type: string, dateRange?: any): Promise<any> {
    try {
      return await realApi.getAnalyticsData(type, dateRange);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
      throw new Error("Failed to load analytics data");
    }
  }

  async generateReport(reportData: any): Promise<any> {
    try {
      return await realApi.generateReport(reportData);
    } catch (error) {
      console.error("Failed to generate report:", error);
      throw new Error("Failed to generate report");
    }
  }

  async exportData(type: string, format: string = 'csv'): Promise<any> {
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

  async createTicket(ticketData: any): Promise<any> {
    try {
      return await realApi.createTicket(ticketData);
    } catch (error) {
      console.error("Failed to create ticket:", error);
      throw new Error("Failed to create ticket");
    }
  }

  async updateTicket(ticketId: string, ticketData: any): Promise<any> {
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

  async getFinancialMetrics(): Promise<any> {
    try {
      return await realApi.getFinancialMetrics();
    } catch (error) {
      console.error("Failed to fetch financial metrics:", error);
      throw new Error("Failed to load financial metrics");
    }
  }

  // Settings APIs
  async getSystemSettings(): Promise<any> {
    try {
      return await realApi.getSystemSettings();
    } catch (error) {
      console.error("Failed to fetch system settings:", error);
      throw new Error("Failed to load system settings");
    }
  }

  async updateSystemSettings(settings: any): Promise<boolean> {
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

  async updateIntegration(integrationId: string, config: any): Promise<boolean> {
    try {
      return await realApi.updateIntegration(integrationId, config);
    } catch (error) {
      console.error("Failed to update integration:", error);
      throw new Error("Failed to update integration");
    }
  }

  // System Health APIs
  async getSystemHealth(): Promise<any> {
    try {
      return await realApi.getSystemHealth();
    } catch (error) {
      console.error("Failed to fetch system health:", error);
      throw new Error("Failed to load system health");
    }
  }

  async getApiPerformance(): Promise<any> {
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
  async getAuditLogs(filters?: any): Promise<any[]> {
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

  async sendMessage(messageData: any): Promise<any> {
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

  async getReport(reportId: string): Promise<any> {
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
}

export const productionApi = new ProductionApiService();
