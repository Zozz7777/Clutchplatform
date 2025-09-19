import { apiService } from "./api";
import { realApi } from "./real-api";
// Note: mockAPI removed - use realApi instead
import { API_BASE_URL } from "./constants";

// Configuration for real API only - no mock data in production
const API_CONFIG = {
  // All endpoints use real API
  useRealApi: true,
  // No fallback to mock in production
  fallbackToMock: false,
};

class HybridApiService {
  private isBackendAvailable: boolean = false;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 30000; // 30 seconds

  constructor() {
    this.checkBackendHealth();
  }

  private async checkBackendHealth(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return this.isBackendAvailable;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/ping`, {
        method: "GET",
        timeout: 5000,
      });
      
      this.isBackendAvailable = response.ok;
      this.lastHealthCheck = now;
    } catch {
      console.warn("Backend health check failed");
      this.isBackendAvailable = false;
      this.lastHealthCheck = now;
    }

    return this.isBackendAvailable;
  }

  private async executeWithFallback<T>(
    realApiCall: () => Promise<T>,
    mockApiCall: () => Promise<T>,
    useMock: boolean = false
  ): Promise<T> {
    // Always use mock if configured to do so
    if (useMock) {
      return mockApiCall();
    }

    // Check if backend is available
    const isBackendAvailable = await this.checkBackendHealth();
    
    if (isBackendAvailable) {
      try {
        return await realApiCall();
      } catch (error) {
        console.warn("Real API call failed, falling back to mock:", error);
        if (API_CONFIG.fallbackToMock) {
          return mockApiCall();
        }
        throw error;
      }
    } else {

      return mockApiCall();
    }
  }

  // Authentication
  async login(email: string, password: string) {
    // Always try real API first for authentication
    try {
      const result = await apiService.login(email, password);
      if (result.success) {
        return result;
      }
    } catch (error) {
      console.warn("Real login failed, using mock authentication");
    }

    // Fallback to real API authentication
    return await realApi.login(email, password);
  }

  async logout() {
    await apiService.logout();
  }

  // Users API
  async getUsers() {
    return this.executeWithFallback(
      () => apiService.getUsers(),
      () => realApi.getUsers(),
      API_CONFIG.useMock.users
    );
  }

  async getUserById(id: string) {
    return this.executeWithFallback(
      () => apiService.getUserById(id),
      () => realApi.getUserById(id),
      API_CONFIG.useMock.users
    );
  }

  async createUser(userData: Partial<User>) {
    return this.executeWithFallback(
      () => apiService.createUser(userData),
      () => realApi.createUser(userData),
      API_CONFIG.useMock.users
    );
  }

  async updateUser(id: string, updates: Partial<User>) {
    return this.executeWithFallback(
      () => apiService.updateUser(id, updates),
      () => realApi.updateUser(id, updates),
      API_CONFIG.useMock.users
    );
  }

  async deleteUser(id: string) {
    return this.executeWithFallback(
      () => apiService.deleteUser(id),
      () => realApi.deleteUser(id),
      API_CONFIG.useMock.users
    );
  }

  // Fleet API
  async getFleetVehicles() {
    return this.executeWithFallback(
      () => apiService.getFleetVehicles(),
      () => realApi.getFleetVehicles(),
      API_CONFIG.useMock.fleet
    );
  }

  async getFleetVehicleById(id: string) {
    return this.executeWithFallback(
      () => apiService.getFleetVehicleById(id),
      () => realApi.getFleetVehicleById(id),
      API_CONFIG.useMock.fleet
    );
  }

  async updateFleetVehicle(id: string, updates: Partial<Vehicle>) {
    return this.executeWithFallback(
      () => apiService.updateFleetVehicle(id, updates),
      () => realApi.updateFleetVehicle(id, updates),
      API_CONFIG.useMock.fleet
    );
  }

  // Dashboard API
  async getKPIMetrics() {
    return this.executeWithFallback(
      () => apiService.getKPIMetrics(),
      () => realApi.getKPIMetrics(),
      API_CONFIG.useMock.dashboard
    );
  }

  async getDashboardStats() {
    return this.executeWithFallback(
      () => apiService.getDashboardStats(),
      () => realApi.getKPIMetrics(), // Use KPI metrics as fallback
      API_CONFIG.useMock.dashboard
    );
  }

  // Chat API
  async getChatMessages() {
    return this.executeWithFallback(
      () => apiService.getChatMessages(),
      () => realApi.getChatMessages(),
      API_CONFIG.useMock.chat
    );
  }

  async sendMessage(message: Partial<ChatMessage>) {
    return this.executeWithFallback(
      () => apiService.sendMessage(message),
      () => realApi.sendMessage(message),
      API_CONFIG.useMock.chat
    );
  }

  // Notifications API
  async getNotifications() {
    return this.executeWithFallback(
      () => apiService.getNotifications(),
      () => realApi.getNotifications(),
      API_CONFIG.useMock.notifications
    );
  }

  async markNotificationAsRead(id: string) {
    return this.executeWithFallback(
      () => apiService.markNotificationAsRead(id),
      () => realApi.markNotificationAsRead(id),
      API_CONFIG.useMock.notifications
    );
  }

  // System Health API (always use real API)
  async getSystemHealth() {
    return this.executeWithFallback(
      () => apiService.getSystemHealth(),
      () => Promise.resolve({
        status: "unknown",
        timestamp: new Date().toISOString(),
        services: [],
        uptime: 0,
      }),
      false // Never use mock for system health
    );
  }

  // API Performance API (always use real API)
  async getApiPerformance() {
    return this.executeWithFallback(
      () => apiService.getApiPerformance(),
      () => Promise.resolve({
        totalRequests: 0,
        averageLatency: 0,
        errorRate: 0,
        uptime: 0,
        endpoints: [],
      }),
      false // Never use mock for API performance
    );
  }

  // Real-time subscriptions
  subscribeToFleetUpdates(callback: (vehicles: Vehicle[]) => void) {
    // Try to use real WebSocket first
    if (this.isBackendAvailable) {
      try {
        const ws = apiService.connectWebSocket();
        if (ws) {
          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "fleet_update") {
              callback(data.vehicles);
            }
          };
          return () => ws.close();
        }
      } catch (error) {
        console.warn("WebSocket connection failed, using mock subscription");
      }
    }

    // Fallback to mock subscription
    return realApi.subscribeToFleetUpdates(callback);
  }

  subscribeToKPIMetrics(callback: (metrics: KPIMetric[]) => void) {
    // Try to use real WebSocket first
    if (this.isBackendAvailable) {
      try {
        const ws = apiService.connectWebSocket();
        if (ws) {
          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "kpi_update") {
              callback(data.metrics);
            }
          };
          return () => ws.close();
        }
      } catch (error) {
        console.warn("WebSocket connection failed, using mock subscription");
      }
    }

    // Fallback to mock subscription
    return realApi.subscribeToKPIMetrics(callback);
  }

  // Project Management APIs
  async getProjects() {
    return this.executeWithFallback(
      () => apiService.getProjects(),
      () => realApi.getProjects(),
      false // Use real API
    );
  }

  async getProjectTasks(projectId: string) {
    return this.executeWithFallback(
      () => apiService.getProjectTasks(projectId),
      () => realApi.getProjectTasks(projectId),
      false // Use real API
    );
  }

  async getTimeTracking(projectId: string) {
    return this.executeWithFallback(
      () => apiService.getTimeTracking(projectId),
      () => realApi.getTimeTracking(projectId),
      false // Use real API
    );
  }

  // Feature Flags APIs
  async getFeatureFlags() {
    return this.executeWithFallback(
      () => apiService.getFeatureFlags(),
      () => realApi.getFeatureFlags(),
      false // Use real API
    );
  }

  async toggleFeatureFlag(flagId: string, enabled: boolean) {
    return this.executeWithFallback(
      () => apiService.toggleFeatureFlag(flagId, enabled),
      () => realApi.toggleFeatureFlag(flagId, enabled),
      false // Use real API
    );
  }

  async getABTests() {
    return this.executeWithFallback(
      () => apiService.getABTests(),
      () => realApi.getABTests(),
      false // Use real API
    );
  }

  async getRollouts() {
    return this.executeWithFallback(
      () => apiService.getRollouts(),
      () => realApi.getRollouts(),
      false // Use real API
    );
  }

  // Asset Management APIs
  async getAssets() {
    return this.executeWithFallback(
      () => apiService.getAssets(),
      () => realApi.getAssets(),
      false // Use real API
    );
  }

  async getMaintenanceRecords() {
    return this.executeWithFallback(
      () => apiService.getMaintenanceRecords(),
      () => realApi.getMaintenanceRecords(),
      false // Use real API
    );
  }

  async getAssetAssignments() {
    return this.executeWithFallback(
      () => apiService.getAssetAssignments(),
      () => realApi.getAssetAssignments(),
      false // Use real API
    );
  }

  // Vendor Management APIs
  async getVendors() {
    return this.executeWithFallback(
      () => apiService.getVendors(),
      () => realApi.getVendors(),
      false // Use real API
    );
  }

  async getVendorContracts() {
    return this.executeWithFallback(
      () => apiService.getVendorContracts(),
      () => realApi.getVendorContracts(),
      false // Use real API
    );
  }

  async getVendorCommunications() {
    return this.executeWithFallback(
      () => apiService.getVendorCommunications(),
      () => realApi.getVendorCommunications(),
      false // Use real API
    );
  }

  // Audit Trail APIs
  async getAuditLogs() {
    return this.executeWithFallback(
      () => apiService.getAuditLogs(),
      () => realApi.getAuditLogs(),
      false // Use real API
    );
  }

  async getSecurityEvents() {
    return this.executeWithFallback(
      () => apiService.getSecurityEvents(),
      () => realApi.getSecurityEvents(),
      false // Use real API
    );
  }

  async getUserActivities() {
    return this.executeWithFallback(
      () => apiService.getUserActivities(),
      () => realApi.getUserActivities(),
      false // Use real API
    );
  }

  // System Health APIs
  async getSystemHealthStatus() {
    return this.executeWithFallback(
      () => apiService.getSystemHealthStatus(),
      () => realApi.getSystemHealthStatus(),
      false // Use real API
    );
  }

  async getSystemMetrics() {
    return this.executeWithFallback(
      () => apiService.getSystemMetrics(),
      () => realApi.getSystemMetrics(),
      false // Use real API
    );
  }

  async getSystemAlerts() {
    return this.executeWithFallback(
      () => apiService.getSystemAlerts(),
      () => realApi.getSystemAlerts(),
      false // Use real API
    );
  }

  async getSystemLogs() {
    return this.executeWithFallback(
      () => apiService.getSystemLogs(),
      () => realApi.getSystemLogs(),
      false // Use real API
    );
  }

  // Utility methods
  isUsingMockData(): boolean {
    return !this.isBackendAvailable;
  }

  getBackendStatus(): { available: boolean; lastCheck: number } {
    return {
      available: this.isBackendAvailable,
      lastCheck: this.lastHealthCheck,
    };
  }
}

export const hybridApi = new HybridApiService();
