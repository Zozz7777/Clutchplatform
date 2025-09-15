import { apiService } from "./api";
import { mockAPI } from "./mock-api";
import { API_BASE_URL } from "./constants";

// Configuration for which APIs to use mock vs real
const API_CONFIG = {
  useMock: {
    // Use real API for these endpoints now that backend is available
    users: false, // Use real API for users
    fleet: false, // Use real API for fleet
    dashboard: false, // Use real API for dashboard
    chat: false, // Use real API for chat
    notifications: false, // Use real API for notifications
    crm: false, // Use real API for CRM
    finance: false, // Use real API for finance
    analytics: false, // Use real API for analytics
    systemHealth: false, // Use real API for system health
    apiPerformance: false, // Use real API for API performance
    featureFlags: false, // Use real API for feature flags
    settings: false, // Use real API for settings
    reports: false, // Use real API for reports
    auditTrail: false, // Use real API for audit trail
    integrations: false, // Use real API for integrations
  },
  // Fallback to mock if real API fails
  fallbackToMock: true,
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
      } as any);
      
      this.isBackendAvailable = response.ok;
      this.lastHealthCheck = now;
    } catch (error) {
      console.warn("Backend health check failed:", error);
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
      console.log("Backend unavailable, using mock data");
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

    // Fallback to mock authentication
    return await mockAPI.login(email, password);
  }

  async logout() {
    await apiService.logout();
  }

  // Users API
  async getUsers() {
    return this.executeWithFallback(
      () => apiService.getUsers(),
      () => mockAPI.getUsers(),
      API_CONFIG.useMock.users
    );
  }

  async getUserById(id: string) {
    return this.executeWithFallback(
      () => apiService.getUserById(id),
      () => mockAPI.getUserById(id),
      API_CONFIG.useMock.users
    );
  }

  async createUser(userData: any) {
    return this.executeWithFallback(
      () => apiService.createUser(userData),
      () => mockAPI.createUser(userData),
      API_CONFIG.useMock.users
    );
  }

  async updateUser(id: string, updates: any) {
    return this.executeWithFallback(
      () => apiService.updateUser(id, updates),
      () => mockAPI.updateUser(id, updates),
      API_CONFIG.useMock.users
    );
  }

  async deleteUser(id: string) {
    return this.executeWithFallback(
      () => apiService.deleteUser(id),
      () => mockAPI.deleteUser(id),
      API_CONFIG.useMock.users
    );
  }

  // Fleet API
  async getFleetVehicles() {
    return this.executeWithFallback(
      () => apiService.getFleetVehicles(),
      () => mockAPI.getFleetVehicles(),
      API_CONFIG.useMock.fleet
    );
  }

  async getFleetVehicleById(id: string) {
    return this.executeWithFallback(
      () => apiService.getFleetVehicleById(id),
      () => mockAPI.getFleetVehicleById(id),
      API_CONFIG.useMock.fleet
    );
  }

  async updateFleetVehicle(id: string, updates: any) {
    return this.executeWithFallback(
      () => apiService.updateFleetVehicle(id, updates),
      () => mockAPI.updateFleetVehicle(id, updates),
      API_CONFIG.useMock.fleet
    );
  }

  // Dashboard API
  async getKPIMetrics() {
    return this.executeWithFallback(
      () => apiService.getKPIMetrics(),
      () => mockAPI.getKPIMetrics(),
      API_CONFIG.useMock.dashboard
    );
  }

  async getDashboardStats() {
    return this.executeWithFallback(
      () => apiService.getDashboardStats(),
      () => mockAPI.getKPIMetrics(), // Use KPI metrics as fallback
      API_CONFIG.useMock.dashboard
    );
  }

  // Chat API
  async getChatMessages() {
    return this.executeWithFallback(
      () => apiService.getChatMessages(),
      () => mockAPI.getChatMessages(),
      API_CONFIG.useMock.chat
    );
  }

  async sendMessage(message: any) {
    return this.executeWithFallback(
      () => apiService.sendMessage(message),
      () => mockAPI.sendMessage(message),
      API_CONFIG.useMock.chat
    );
  }

  // Notifications API
  async getNotifications() {
    return this.executeWithFallback(
      () => apiService.getNotifications(),
      () => mockAPI.getNotifications(),
      API_CONFIG.useMock.notifications
    );
  }

  async markNotificationAsRead(id: string) {
    return this.executeWithFallback(
      () => apiService.markNotificationAsRead(id),
      () => mockAPI.markNotificationAsRead(id),
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
  subscribeToFleetUpdates(callback: (vehicles: any[]) => void) {
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
    return mockAPI.subscribeToFleetUpdates(callback);
  }

  subscribeToKPIMetrics(callback: (metrics: any[]) => void) {
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
    return mockAPI.subscribeToKPIMetrics(callback);
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
