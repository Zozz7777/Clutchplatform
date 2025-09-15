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

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken(): void {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("clutch-admin-token");
    }
  }

  private getToken(): string | null {
    this.loadToken(); // Always get fresh token
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const token = this.getToken();
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        success: true,
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.request<{ token: string; user: any }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem("clutch-admin-token", response.data.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem("clutch-admin-token");
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
