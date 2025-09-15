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
    }
    return this.token;
  }

  private async refreshAuthToken(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
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
      const response = await fetch(`${this.baseURL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          this.setTokens(data.token, data.refreshToken);
          return data.token;
        }
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
      console.log(`🔐 API Request to ${endpoint}:`, {
        url,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
        retryCount,
        headers: config.headers
      });
    }

    try {
      const response = await fetch(url, config);
      
      // Debug logging for response
      if (process.env.NODE_ENV === 'development') {
        console.log(`📡 API Response from ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
      }
      
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && retryCount < maxRetries) {
        console.log(`🔄 Token expired, attempting refresh for ${endpoint}`);
        const newToken = await this.refreshAuthToken();
        
        if (newToken) {
          // Retry the request with new token
          return this.request<T>(endpoint, options, retryCount + 1);
        } else {
          // Refresh failed, redirect to login
          this.logout();
          window.location.href = '/login';
          return {
            data: null as T,
            success: false,
            error: "Authentication failed. Please login again.",
          };
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
        console.log(`🔄 Network error, retrying ${endpoint} (${retryCount + 1}/${maxRetries})`);
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
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    try {
      // Try main authentication first
      const response = await this.request<{ token: string; user: any }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data) {
        console.log('🔐 Main auth successful:', {
          hasToken: !!response.data.token,
          hasUser: !!response.data.user,
          userRole: response.data.user?.role
        });
        this.setTokens(response.data.token, response.data.refreshToken);
        return response;
      }

      // If main auth fails, try emergency authentication
      console.log("Main auth failed, trying emergency auth...");
      const emergencyResponse = await this.request<{ token: string; user: any }>("/api/v1/emergency-auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (emergencyResponse.success && emergencyResponse.data) {
        console.log('🚨 Emergency auth successful:', {
          hasToken: !!emergencyResponse.data.token,
          hasUser: !!emergencyResponse.data.user,
          userRole: emergencyResponse.data.user?.role
        });
        this.setTokens(emergencyResponse.data.token, emergencyResponse.data.refreshToken);
        return emergencyResponse;
      }

      // Both failed, return the main auth error
      return response;
    } catch (error) {
      console.error("Login API call failed:", error);
      
      // Try emergency auth as fallback
      try {
        console.log("Trying emergency auth as fallback...");
        const emergencyResponse = await this.request<{ token: string; user: any }>("/api/v1/emergency-auth/login", {
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
            data: null as any,
            success: false,
            error: "Server temporarily unavailable. Please try again in a few moments.",
          };
        } else if (error.message.includes('404')) {
          return {
            data: null as any,
            success: false,
            error: "Authentication service not found. Please contact support.",
          };
        } else if (error.message.includes('500')) {
          return {
            data: null as any,
            success: false,
            error: "Server error occurred. Please try again later.",
          };
        }
      }
      
      return {
        data: null as any,
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
  async verifyToken(): Promise<ApiResponse<{ valid: boolean; user?: any }>> {
    return this.request<{ valid: boolean; user?: any }>("/api/v1/auth/verify");
  }

  // Get current token status
  getTokenStatus(): { hasToken: boolean; tokenPreview: string } {
    const token = this.getToken();
    return {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    };
  }

  // Users API
  async getUsers(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/api/users");
  }

  async getUserById(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/users/${id}`);
  }

  async createUser(userData: any): Promise<ApiResponse<any>> {
    return this.request<any>("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/users/${id}`, {
      method: "DELETE",
    });
  }

  // Fleet API
  async getFleetVehicles(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/api/fleet/vehicles");
  }

  async getFleetVehicleById(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/fleet/vehicles/${id}`);
  }

  async updateFleetVehicle(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/fleet/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Dashboard API
  async getKPIMetrics(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/api/dashboard/kpis");
  }

  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request<any>("/api/dashboard/stats");
  }

  // Chat API
  async getChatMessages(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/api/chat/messages");
  }

  async sendMessage(message: any): Promise<ApiResponse<any>> {
    return this.request<any>("/api/chat/messages", {
      method: "POST",
      body: JSON.stringify(message),
    });
  }

  // Notifications API
  async getNotifications(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/api/notifications");
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/notifications/${id}/read`, {
      method: "PUT",
    });
  }

  // CRM API
  async getCustomers(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/api/crm/customers");
  }

  async getCustomerById(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/crm/customers/${id}`);
  }

  // Finance API
  async getPayments(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/api/finance/payments");
  }

  async processPayment(paymentData: any): Promise<ApiResponse<any>> {
    return this.request<any>("/api/finance/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  // Analytics API
  async getAnalytics(timeRange: string = "30d"): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/analytics?range=${timeRange}`);
  }

  // System Health API
  async getSystemHealth(): Promise<ApiResponse<any>> {
    return this.request<any>("/api/system/health");
  }

  // API Performance API
  async getApiPerformance(): Promise<ApiResponse<any>> {
    return this.request<any>("/api/system/api-performance");
  }

  // Feature Flags API
  async getFeatureFlags(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/api/feature-flags");
  }

  async updateFeatureFlag(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/feature-flags/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Settings API
  async getSettings(): Promise<ApiResponse<any>> {
    return this.request<any>("/api/settings");
  }

  async updateSettings(settings: any): Promise<ApiResponse<any>> {
    return this.request<any>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  // Reports API
  async generateReport(reportType: string, params: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/reports/${reportType}`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // Audit Trail API
  async getAuditTrail(filters: any = {}): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request<any[]>(`/api/audit-trail?${queryParams}`);
  }

  // Integrations API
  async getIntegrations(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/api/integrations");
  }

  async testIntegration(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/integrations/${id}/test`, {
      method: "POST",
    });
  }

  // WebSocket connection for real-time updates
  connectWebSocket(): WebSocket | null {
    if (typeof window === "undefined") return null;
    
    const wsUrl = this.baseURL.replace("http", "ws") + "/ws";
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("WebSocket connected");
      if (this.token) {
        ws.send(JSON.stringify({ type: "auth", token: this.token }));
      }
    };
    
    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    return ws;
  }
}

export const apiService = new ApiService(API_BASE_URL);
