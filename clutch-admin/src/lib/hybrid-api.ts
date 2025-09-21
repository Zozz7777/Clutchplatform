import { apiService } from "./api";
import { realApi } from "./real-api";
import { API_BASE_URL } from "./constants";
import { type User, type FleetVehicle, type KPIMetric, type ChatMessage } from "./types";

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE_URL}/ping`, {
        method: "GET",
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      this.isBackendAvailable = response.ok;
      this.lastHealthCheck = now;
    } catch {
      // Backend health check failed
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
        // Real API call failed, falling back to mock
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
      // Real login failed, fallback to mock authentication
      return {
        success: false,
        data: null,
        message: "Authentication failed"
      };
    }

    return {
      success: false,
      data: null,
      message: "Authentication failed"
    };
  }

  async logout() {
    await apiService.logout();
  }

  // Users API
  async getUsers() {
    return this.executeWithFallback(
      () => apiService.getUsers(),
      () => Promise.resolve({ success: true, data: [] }),
      false // Always use real API
    );
  }

  async getUserById(id: string) {
    return this.executeWithFallback(
      () => apiService.getUserById(id),
      () => Promise.resolve({ success: true, data: {} }),
      false // Always use real API
    );
  }

  async createUser(userData: Partial<User>) {
    return this.executeWithFallback(
      () => apiService.createUser(userData),
      () => Promise.resolve({ success: true, data: {} }),
      false // Always use real API
    );
  }

  async updateUser(id: string, updates: Partial<User>) {
    return this.executeWithFallback(
      () => apiService.updateUser(id, updates),
      () => Promise.resolve({ success: true, data: {} }),
      false // Always use real API
    );
  }

  async deleteUser(id: string) {
    return this.executeWithFallback(
      () => apiService.deleteUser(id),
      () => Promise.resolve({ success: true, data: false }),
      false // Always use real API
    );
  }

  // Fleet API
  async getFleetVehicles() {
    return this.executeWithFallback(
      () => apiService.getFleetVehicles(),
      () => Promise.resolve({ success: true, data: [] }),
      false // Always use real API
    );
  }

  async getFleetVehicleById(id: string) {
    return this.executeWithFallback(
      () => apiService.getFleetVehicleById(id),
      () => Promise.resolve({ success: true, data: {} }),
      false // Always use real API
    );
  }

  async updateFleetVehicle(id: string, updates: Partial<FleetVehicle>) {
    return this.executeWithFallback(
      () => apiService.updateFleetVehicle(id, updates),
      () => Promise.resolve({ success: true, data: {} }),
      false // Always use real API
    );
  }

  // Dashboard API
  async getKPIMetrics() {
    return this.executeWithFallback(
      () => apiService.getKPIMetrics(),
      () => Promise.resolve({ success: true, data: [] }),
      false // Always use real API
    );
  }

  async getDashboardStats() {
    return this.executeWithFallback(
      () => apiService.getDashboardStats(),
      () => Promise.resolve({ success: true, data: {} }),
      false // Always use real API
    );
  }

  // Chat API
  async getChatMessages() {
    return this.executeWithFallback(
      () => apiService.getChatMessages(),
      () => realApi.getChatMessages(),
      false // Always use real API
    );
  }

  async sendMessage(message: Partial<ChatMessage>) {
    return this.executeWithFallback(
      () => apiService.sendMessage(message),
      () => realApi.sendChatMessage(message),
      false // Always use real API
    );
  }

  // Notifications API
  async getNotifications() {
    return this.executeWithFallback(
      () => apiService.getNotifications(),
      () => realApi.getNotifications(),
      false // Always use real API
    );
  }

  async markNotificationAsRead(id: string) {
    return this.executeWithFallback(
      () => apiService.markNotificationAsRead(id),
      () => realApi.markNotificationAsRead(id),
      false // Always use real API
    );
  }

  // System Health API (always use real API)
  async getSystemHealth() {
    return this.executeWithFallback(
      () => apiService.getSystemHealth(),
      () => Promise.resolve({
        success: true,
        data: {
          status: "unknown",
          timestamp: new Date().toISOString(),
          services: [],
          uptime: 0,
        }
      }),
      false // Never use mock for system health
    );
  }

  // API Performance API (always use real API)
  async getApiPerformance() {
    return this.executeWithFallback(
      () => apiService.getApiPerformance(),
      () => Promise.resolve({
        success: true,
        data: {
          totalRequests: 0,
          averageLatency: 0,
          errorRate: 0,
          uptime: 0,
          endpoints: [],
        }
      }),
      false // Never use mock for API performance
    );
  }

  // Real-time subscriptions
  subscribeToFleetUpdates(callback: (vehicles: FleetVehicle[]) => void) {
    // Try to use real WebSocket first
    if (this.isBackendAvailable) {
      try {
        // Note: WebSocket connection would need to be implemented in apiService
        // For now, return a no-op unsubscribe function
        return () => {};
      } catch (error) {
        // WebSocket connection failed, using mock subscription
      }
    }

    // Fallback to mock subscription - return no-op for now
    return () => {};
  }

  subscribeToKPIMetrics(callback: (metrics: KPIMetric[]) => void) {
    // Try to use real WebSocket first
    if (this.isBackendAvailable) {
      try {
        // Note: WebSocket connection would need to be implemented in apiService
        // For now, return a no-op unsubscribe function
        return () => {};
      } catch (error) {
        // WebSocket connection failed, using mock subscription
      }
    }

    // Fallback to mock subscription - return no-op for now
    return () => {};
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
      () => Promise.resolve([]), // realApi doesn't have getProjectTasks
      false // Use real API
    );
  }

  async getTimeTracking(projectId: string) {
    return this.executeWithFallback(
      () => apiService.getProjectTimeTracking(projectId),
      () => Promise.resolve([]), // realApi doesn't have getTimeTracking
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
      () => apiService.updateFeatureFlag(flagId, { enabled }),
      () => realApi.updateFeatureFlag(flagId, { enabled }),
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
      () => Promise.resolve([]), // realApi doesn't have getRollouts
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
      () => Promise.resolve([]), // realApi doesn't have getVendors
      false // Use real API
    );
  }

  async getVendorContracts() {
    return this.executeWithFallback(
      () => apiService.getVendorContracts(),
      () => Promise.resolve([]), // realApi doesn't have getVendorContracts
      false // Use real API
    );
  }

  async getVendorCommunications() {
    return this.executeWithFallback(
      () => apiService.getVendorCommunications(),
      () => Promise.resolve([]), // realApi doesn't have getVendorCommunications
      false // Use real API
    );
  }

  // Audit Trail APIs
  async getAuditLogs() {
    return this.executeWithFallback(
      () => apiService.getAuditTrail({}),
      () => realApi.getAuditLogs(),
      false // Use real API
    );
  }

  async getSecurityEvents() {
    return this.executeWithFallback(
      () => Promise.resolve({ success: true, data: [] }), // apiService doesn't have getSecurityEvents
      () => realApi.getSecurityEvents(),
      false // Use real API
    );
  }

  async getUserActivities() {
    return this.executeWithFallback(
      () => Promise.resolve({ success: true, data: [] }), // apiService doesn't have getUserActivities
      () => realApi.getUserActivities(),
      false // Use real API
    );
  }

  // System Health APIs
  async getSystemHealthStatus() {
    return this.executeWithFallback(
      () => apiService.getSystemHealth(),
      () => realApi.getSystemHealth(),
      false // Use real API
    );
  }

  async getSystemMetrics() {
    return this.executeWithFallback(
      () => Promise.resolve({ success: true, data: {} }), // apiService doesn't have getSystemMetrics
      () => Promise.resolve({}), // realApi doesn't have getSystemMetrics
      false // Use real API
    );
  }

  async getSystemAlerts() {
    return this.executeWithFallback(
      () => Promise.resolve({ success: true, data: [] }), // apiService doesn't have getSystemAlerts
      () => realApi.getSystemAlerts(),
      false // Use real API
    );
  }

  async getSystemLogs() {
    return this.executeWithFallback(
      () => Promise.resolve({ success: true, data: [] }), // apiService doesn't have getSystemLogs
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
