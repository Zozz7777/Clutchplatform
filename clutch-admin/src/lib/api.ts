import { API_BASE_URL } from "./constants";

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string | null> | null = null;
  private lastRefreshTime: number = 0;
  private refreshCooldown: number = 5000; // 5 seconds cooldown between refresh attempts

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokens();
  }

  private loadTokens(): void {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("clutch-admin-token");
      this.refreshToken = localStorage.getItem("clutch-admin-refresh-token");
    }
  }

  private getToken(): string | null {
    // Always get fresh token from localStorage or sessionStorage
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("clutch-admin-token") || sessionStorage.getItem("clutch-admin-token");
      this.refreshToken = localStorage.getItem("clutch-admin-refresh-token");
    }
    return this.token;
  }

  private async refreshAuthToken(): Promise<string | null> {
    // Check cooldown period to prevent rapid refresh attempts
    const now = Date.now();
    if (now - this.lastRefreshTime < this.refreshCooldown) {
      // Refresh cooldown active
      return null;
    }

    if (this.isRefreshing && this.refreshPromise) {
      // Refresh already in progress
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.lastRefreshTime = now;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    if (!this.refreshToken) {
      console.error("No refresh token available");
      this.logout();
      return null;
    }

    try {
      // Attempting token refresh
      const response = await fetch(`${this.baseURL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      // Refresh response received
      
      if (response.ok) {
        const data = await response.json();
        // Refresh successful
        
        // Handle both response formats: { success: true, token: ... } and { success: true, data: { token: ... } }
        const token = data.token || data.data?.token;
        const refreshToken = data.refreshToken || data.data?.refreshToken;
        
        if (data.success && token) {
          this.setTokens(token, refreshToken);
          return token;
        } else {
          console.error("🔄 Refresh response missing token:", data);
        }
      } else {
        const errorData = await response.json();
        console.error("🔄 Refresh failed:", errorData);
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }

    this.logout();
    return null;
  }

  private setTokens(token: string, refreshToken?: string): void {
    this.token = token;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    
    if (typeof window !== "undefined") {
      localStorage.setItem("clutch-admin-token", token);
      sessionStorage.setItem("clutch-admin-token", token);
      if (refreshToken) {
        localStorage.setItem("clutch-admin-refresh-token", refreshToken);
      }
      
      // Debug logging for token storage
      // Tokens stored successfully
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const maxRetries = 3;
    
    const token = this.getToken();
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    // Debug logging for auth headers
    if (process.env.NODE_ENV === 'development') {
      // API request initiated
    }

    try {
      const response = await fetch(url, config);
      
      // Debug logging for response
      if (process.env.NODE_ENV === 'development') {
        // API response received
      }
      
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && retryCount < maxRetries) {
        // Token expired, attempting refresh
        const newToken = await this.refreshAuthToken();
        
        if (newToken) {
          // Token refreshed successfully
          // Force reload tokens from storage to ensure we have the latest
          this.loadTokens();
          // Retry the request with new token
          return this.request<T>(endpoint, options, retryCount + 1);
        } else {
          // Token refresh failed
          // If refresh failed due to cooldown or other reasons, try to use existing token
          if (retryCount === 0) {
            // First retry - try with current token from storage
            this.loadTokens();
            const currentToken = this.getToken();
            if (currentToken && currentToken !== token) {
              // Using different token from storage
              return this.request<T>(endpoint, options, retryCount + 1);
            }
          }
          
          // If we've exhausted retries or no valid token, redirect to login
          if (retryCount >= maxRetries - 1) {
            // Max retries reached
            this.logout();
            window.location.href = '/login';
            return {
              data: null as T,
              success: false,
              error: "Authentication failed. Please login again.",
            };
          }
          
          // Continue with current request and let it fail naturally
          // Continuing with failed request
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        console.error(`❌ API request failed for ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage
        });
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      
      // Handle the response structure properly
      if (responseData.success && responseData.data) {
        return {
          data: responseData.data,
          success: true,
          message: responseData.message
        };
      } else {
        return {
          data: responseData,
          success: true,
        };
      }
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error);
      
      // Retry on network errors
      if (retryCount < maxRetries && error instanceof TypeError) {
        // Network error, retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.request<T>(endpoint, options, retryCount + 1);
      }
      
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Authentication with fallback to emergency auth
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: Record<string, unknown>; refreshToken?: string }>> {
    try {
      // Try main authentication first
      const response = await this.request<{ token: string; user: Record<string, unknown>; refreshToken?: string }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data) {
        // Main auth successful
        this.setTokens(response.data.token, response.data.refreshToken);
        return response;
      }

      // If main auth fails, try emergency authentication
      // Main auth failed, trying emergency auth
      const emergencyResponse = await this.request<{ token: string; user: Record<string, unknown>; refreshToken?: string }>("/api/v1/emergency-auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (emergencyResponse.success && emergencyResponse.data) {
        // Emergency auth successful
        this.setTokens(emergencyResponse.data.token, emergencyResponse.data.refreshToken);
        return emergencyResponse;
      }

      // Both failed, return the main auth error
      return response;
    } catch (error) {
      console.error("Login API call failed:", error);
      
      // Try emergency auth as fallback
      try {
        // Trying emergency auth as fallback
        const emergencyResponse = await this.request<{ token: string; user: Record<string, unknown>; refreshToken?: string }>("/api/v1/emergency-auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        if (emergencyResponse.success && emergencyResponse.data) {
          this.setTokens(emergencyResponse.data.token, emergencyResponse.data.refreshToken);
          return emergencyResponse;
        }
      } catch (emergencyError) {
        console.error("Emergency auth also failed:", emergencyError);
      }
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('502') || error.message.includes('Bad Gateway')) {
          return {
            data: null,
            success: false,
            error: "Server temporarily unavailable. Please try again in a few moments.",
          };
        } else if (error.message.includes('404')) {
          return {
            data: null,
            success: false,
            error: "Authentication service not found. Please contact support.",
          };
        } else if (error.message.includes('500')) {
          return {
            data: null,
            success: false,
            error: "Server error occurred. Please try again later.",
          };
        }
      }
      
      return {
        data: null,
        success: false,
        error: "Network error. Please check your connection and try again.",
      };
    }
  }

  async logout(): Promise<void> {
    this.token = null;
    this.refreshToken = null;
    this.isRefreshing = false;
    this.refreshPromise = null;
    
    if (typeof window !== "undefined") {
      localStorage.removeItem("clutch-admin-token");
      localStorage.removeItem("clutch-admin-refresh-token");
      sessionStorage.removeItem("clutch-admin-token");
    }
  }

  // Verify current token
  async verifyToken(): Promise<ApiResponse<{ valid: boolean; user?: Record<string, unknown> }>> {
    return this.request<{ valid: boolean; user?: Record<string, unknown> }>("/api/v1/auth/verify");
  }

  // Get current token status
  getTokenStatus(): { hasToken: boolean; tokenPreview: string } {
    const token = this.getToken();
    return {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    };
  }

  // Public method to get token for debugging
  getTokenForDebugging(): string | null {
    return this.getToken();
  }

  // Users API
  async getUsers(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/users");
  }

  async getUserById(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/users/${id}`);
  }

  async createUser(userData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, updates: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/users/${id}`, {
      method: "DELETE",
    });
  }

  // Employee Management API
  async getEmployees(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/v1/employees");
  }

  async createEmployee(employeeData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/employees/register", {
      method: "POST",
      body: JSON.stringify(employeeData),
    });
  }

  async updateEmployee(id: string, updates: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteEmployee(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/employees/${id}`, {
      method: "DELETE",
    });
  }

  // Employee Invitation API
  async inviteEmployee(invitationData: {
    email: string;
    name: string;
    role?: string;
    department?: string;
    position?: string;
    permissions?: string[];
  }): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/employees/invite", {
      method: "POST",
      body: JSON.stringify(invitationData),
    });
  }

  async getEmployeeInvitations(status?: string): Promise<ApiResponse<Record<string, unknown>>> {
    const url = status ? `/api/v1/employees/invitations?status=${status}` : "/api/v1/employees/invitations";
    return this.request<Record<string, unknown>>(url);
  }

  async validateInvitationToken(token: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/employees/validate-invitation/${token}`);
  }

  async acceptInvitation(token: string, password: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/employees/accept-invitation", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  }

  async cancelInvitation(invitationId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/employees/invitations/${invitationId}`, {
      method: "DELETE",
    });
  }

  async resendInvitation(invitationId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/employees/invitations/${invitationId}/resend`, {
      method: "POST",
    });
  }

  // Fleet API
  async getFleetVehicles(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/fleet/vehicles");
  }

  async getFleetVehicleById(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/fleet/vehicles/${id}`);
  }

  async updateFleetVehicle(id: string, updates: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/fleet/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Dashboard API
  async getKPIMetrics(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/dashboard/kpis");
  }

  async getDashboardStats(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/dashboard/stats");
  }

  // Chat API
  async getChatMessages(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/chat/messages");
  }

  async sendMessage(message: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/chat/messages", {
      method: "POST",
      body: JSON.stringify(message),
    });
  }

  // Notifications API
  async getNotifications(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/notifications");
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/notifications/${id}/read`, {
      method: "PUT",
    });
  }

  // CRM API
  async getCustomers(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/crm/customers");
  }

  async getCustomerById(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/crm/customers/${id}`);
  }

  // Finance API
  async getPayments(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/finance/payments");
  }

  async processPayment(paymentData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/finance/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  // Analytics API
  async getAnalytics(timeRange: string = "30d"): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/analytics?range=${timeRange}`);
  }

  // System Health API
  async getSystemHealth(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/system/health");
  }

  // API Performance API
  async getApiPerformance(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/system/api-performance");
  }

  // Feature Flags API
  async getFeatureFlags(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/feature-flags");
  }

  async updateFeatureFlag(id: string, updates: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/feature-flags/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Settings API
  async getSettings(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/settings");
  }

  async updateSettings(settings: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  // Reports API
  async generateReport(reportType: string, params: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/reports/${reportType}`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // Audit Trail API
  async getAuditTrail(filters: Record<string, unknown> = {}): Promise<ApiResponse<Record<string, unknown>[]>> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    return this.request<Record<string, unknown>[]>(`/api/audit-trail?${queryParams.toString()}`);
  }

  // Integrations API
  async getIntegrations(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/integrations");
  }

  async testIntegration(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/integrations/${id}/test`, {
      method: "POST",
    });
  }

  // A/B Testing API
  async getABTests(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/v1/ab-tests");
  }

  async createABTest(testData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/ab-tests", {
      method: "POST",
      body: JSON.stringify(testData),
    });
  }

  async updateABTest(id: string, testData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/ab-tests/${id}`, {
      method: "PUT",
      body: JSON.stringify(testData),
    });
  }

  async deleteABTest(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/ab-tests/${id}`, {
      method: "DELETE",
    });
  }

  // Rollouts API
  async getRollouts(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/v1/rollouts");
  }

  async createRollout(rolloutData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/rollouts", {
      method: "POST",
      body: JSON.stringify(rolloutData),
    });
  }

  async updateRollout(id: string, rolloutData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/rollouts/${id}`, {
      method: "PUT",
      body: JSON.stringify(rolloutData),
    });
  }

  async deleteRollout(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/rollouts/${id}`, {
      method: "DELETE",
    });
  }

  // Assets API
  async getAssets(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/v1/assets");
  }

  async getAssetById(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/assets/${id}`);
  }

  async createAsset(assetData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/assets", {
      method: "POST",
      body: JSON.stringify(assetData),
    });
  }

  async updateAsset(id: string, assetData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/assets/${id}`, {
      method: "PUT",
      body: JSON.stringify(assetData),
    });
  }

  async deleteAsset(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/assets/${id}`, {
      method: "DELETE",
    });
  }

  // Maintenance Records API
  async getMaintenanceRecords(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/v1/maintenance-records");
  }

  async getMaintenanceRecordById(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/maintenance-records/${id}`);
  }

  async createMaintenanceRecord(recordData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/maintenance-records", {
      method: "POST",
      body: JSON.stringify(recordData),
    });
  }

  async updateMaintenanceRecord(id: string, recordData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/maintenance-records/${id}`, {
      method: "PUT",
      body: JSON.stringify(recordData),
    });
  }

  async deleteMaintenanceRecord(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/maintenance-records/${id}`, {
      method: "DELETE",
    });
  }

  // Asset Assignments API
  async getAssetAssignments(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/v1/asset-assignments");
  }

  async getAssetAssignmentById(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/asset-assignments/${id}`);
  }

  async createAssetAssignment(assignmentData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/asset-assignments", {
      method: "POST",
      body: JSON.stringify(assignmentData),
    });
  }

  async updateAssetAssignment(id: string, assignmentData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/asset-assignments/${id}`, {
      method: "PUT",
      body: JSON.stringify(assignmentData),
    });
  }

  async deleteAssetAssignment(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/asset-assignments/${id}`, {
      method: "DELETE",
    });
  }

  // Vendors API
  async getVendors(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/v1/vendors");
  }

  async getVendorById(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/vendors/${id}`);
  }

  async createVendor(vendorData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/vendors", {
      method: "POST",
      body: JSON.stringify(vendorData),
    });
  }

  async updateVendor(id: string, vendorData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/vendors/${id}`, {
      method: "PUT",
      body: JSON.stringify(vendorData),
    });
  }

  async deleteVendor(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/vendors/${id}`, {
      method: "DELETE",
    });
  }

  // Vendor Contracts API
  async getVendorContracts(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/v1/vendor-contracts");
  }

  async getVendorContractById(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/vendor-contracts/${id}`);
  }

  async createVendorContract(contractData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/vendor-contracts", {
      method: "POST",
      body: JSON.stringify(contractData),
    });
  }

  async updateVendorContract(id: string, contractData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/vendor-contracts/${id}`, {
      method: "PUT",
      body: JSON.stringify(contractData),
    });
  }

  async deleteVendorContract(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/vendor-contracts/${id}`, {
      method: "DELETE",
    });
  }

  // Vendor Communications API
  async getVendorCommunications(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/v1/vendor-communications");
  }

  async getVendorCommunicationById(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/vendor-communications/${id}`);
  }

  async createVendorCommunication(communicationData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/vendor-communications", {
      method: "POST",
      body: JSON.stringify(communicationData),
    });
  }

  async updateVendorCommunication(id: string, communicationData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/vendor-communications/${id}`, {
      method: "PUT",
      body: JSON.stringify(communicationData),
    });
  }

  async deleteVendorCommunication(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/vendor-communications/${id}`, {
      method: "DELETE",
    });
  }

  // Projects API
  async getProjects(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/v1/projects");
  }

  async getProjectById(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/projects/${id}`);
  }

  async createProject(projectData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, projectData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/projects/${id}`, {
      method: "DELETE",
    });
  }

  async getProjectTasks(projectId: string): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>(`/api/v1/projects/${projectId}/tasks`);
  }

  async addProjectTask(projectId: string, taskData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  }

  async updateProjectTask(projectId: string, taskId: string, taskData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/projects/${projectId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  }

  async deleteProjectTask(projectId: string, taskId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/projects/${projectId}/tasks/${taskId}`, {
      method: "DELETE",
    });
  }

  async getProjectTimeTracking(projectId: string): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>(`/api/v1/projects/${projectId}/time-tracking`);
  }

  async addTimeEntry(projectId: string, timeData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/projects/${projectId}/time-tracking`, {
      method: "POST",
      body: JSON.stringify(timeData),
    });
  }

  // Reports API
  async getReports(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/v1/reports");
  }

  async getReportById(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/reports/${id}`);
  }

  async createReport(reportData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/reports", {
      method: "POST",
      body: JSON.stringify(reportData),
    });
  }

  async updateReport(id: string, reportData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/v1/reports/${id}`, {
      method: "PUT",
      body: JSON.stringify(reportData),
    });
  }

  async deleteReport(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/reports/${id}`, {
      method: "DELETE",
    });
  }

  async generateCustomReport(reportData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/reports/generate", {
      method: "POST",
      body: JSON.stringify(reportData),
    });
  }

  async getReportTemplates(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/v1/reports/templates");
  }

  async createReportTemplate(templateData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/reports/templates", {
      method: "POST",
      body: JSON.stringify(templateData),
    });
  }

  // CRM API
  async createCustomer(customerData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/crm/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    });
  }

  async getLeads(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/crm/leads");
  }

  async getSales(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/crm/sales");
  }

  async getTickets(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/crm/tickets");
  }

  async createTicket(ticketData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/crm/tickets", {
      method: "POST",
      body: JSON.stringify(ticketData),
    });
  }

  async getCRMAnalytics(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/crm/analytics");
  }

  // Finance API
  async getPaymentById(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/finance/payments/${id}`);
  }

  async createPayment(paymentData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/finance/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  async getInvoices(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/finance/invoices");
  }

  async createInvoice(invoiceData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/finance/invoices", {
      method: "POST",
      body: JSON.stringify(invoiceData),
    });
  }

  async getSubscriptions(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/finance/subscriptions");
  }

  async getFinanceMetrics(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/finance/metrics");
  }

  async getFinanceAnalytics(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/finance/analytics");
  }

  // Chat API
  async getMessages(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/chat/messages");
  }

  async getMessageById(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/chat/messages/${id}`);
  }


  async updateMessage(id: string, messageData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/chat/messages/${id}`, {
      method: "PUT",
      body: JSON.stringify(messageData),
    });
  }

  async deleteMessage(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/chat/messages/${id}`, {
      method: "DELETE",
    });
  }

  async getChannels(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/chat/channels");
  }

  async createChannel(channelData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/chat/channels", {
      method: "POST",
      body: JSON.stringify(channelData),
    });
  }

  async getChatAnalytics(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/chat/analytics");
  }

  // Settings API
  async getAllSettings(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/settings");
  }

  async updateAllSettings(settings: Record<string, unknown>[]): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/settings", {
      method: "PUT",
      body: JSON.stringify({ settings }),
    });
  }

  async getSettingsByCategory(category: string): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>(`/api/settings/${category}`);
  }

  async updateSetting(category: string, key: string, value: unknown): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/settings/${category}/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    });
  }

  async getUserPreferences(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/settings/user/preferences");
  }

  async updateUserPreferences(preferences: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/settings/user/preferences", {
      method: "PUT",
      body: JSON.stringify({ preferences }),
    });
  }

  async getSystemConfig(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/settings/system/config");
  }

  async updateSystemConfig(config: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/settings/system/config", {
      method: "PUT",
      body: JSON.stringify({ config }),
    });
  }

  async getSettingsAnalytics(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/settings/analytics");
  }

  // Integrations API
  async getIntegrationById(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/integrations/${id}`);
  }

  async createIntegration(integrationData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/integrations", {
      method: "POST",
      body: JSON.stringify(integrationData),
    });
  }

  async updateIntegration(id: string, integrationData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/integrations/${id}`, {
      method: "PUT",
      body: JSON.stringify(integrationData),
    });
  }

  async deleteIntegration(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/integrations/${id}`, {
      method: "DELETE",
    });
  }

  async getIntegrationTemplates(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/integrations/templates");
  }

  async getIntegrationAnalytics(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/integrations/analytics");
  }

  // Audit Trail API
  async getAuditLogs(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/audit-trail");
  }

  async getAuditLogById(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/audit-trail/${id}`);
  }

  async createAuditLog(auditData: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/audit-trail", {
      method: "POST",
      body: JSON.stringify(auditData),
    });
  }

  async getSecurityAuditLogs(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/audit-trail/security");
  }

  async getUserActivityLogs(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/audit-trail/user-activity");
  }

  async getAuditAnalytics(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/audit-trail/analytics");
  }

  async getComplianceLogs(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.request<Record<string, unknown>[]>("/api/audit-trail/compliance");
  }

  async exportAuditLogs(format: string = 'json'): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(`/api/audit-trail/export?format=${format}`);
  }

  // System Health API
  async getDetailedSystemHealth(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/system-health/detailed");
  }

  async getAPIPerformance(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/system-health/api-performance");
  }

  async getDatabaseHealth(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/system-health/database");
  }

  async getServicesHealth(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/system-health/services");
  }

  async getSystemLogs(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/system-health/logs");
  }

  async testServiceConnection(service: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>("/api/v1/system-health/test-connection", {
      method: "POST",
      body: JSON.stringify({ service }),
    });
  }

  // WebSocket connection for real-time updates
  connectWebSocket(): WebSocket | null {
    if (typeof window === "undefined") return null;
    
    const wsUrl = this.baseURL.replace("http", "ws") + "/ws";
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      // WebSocket connected
      if (this.token) {
        ws.send(JSON.stringify({ type: "auth", token: this.token }));
      }
    };
    
    ws.onclose = () => {
      // WebSocket disconnected
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    return ws;
  }
}

export const apiService = new ApiService(API_BASE_URL);
