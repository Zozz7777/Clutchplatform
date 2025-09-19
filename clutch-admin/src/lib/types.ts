// Core data types for the Clutch platform
// These replace the types previously defined in mock-api.ts

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  lastLogin: string;
  avatar?: string;
  permissions: string[];
}

export interface FleetVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  status: "active" | "maintenance" | "inactive";
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  driver?: {
    id: string;
    name: string;
  };
  lastMaintenance: string;
  nextMaintenance: string;
  mileage: number;
  fuelLevel: number;
  assignedRoute?: {
    id: string;
    name: string;
  };
}

export interface KPIMetric {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: "increase" | "decrease";
  format: "number" | "currency" | "percentage";
  icon: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: "text" | "image" | "file";
  isRead: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  priority: "low" | "medium" | "high" | "critical";
}

// Additional types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  error?: string;
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  token: string;
  refreshToken?: string;
}

// Dashboard types
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalVehicles: number;
  activeVehicles: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  pendingOrders: number;
}

// Analytics types
export interface AnalyticsData {
  period: string;
  metrics: {
    [key: string]: number;
  };
  trends: {
    [key: string]: {
      value: number;
      change: number;
      changeType: "increase" | "decrease";
    };
  };
}

// Fleet management types
export interface Route {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  estimatedTime: number;
  assignedVehicles: string[];
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: "routine" | "repair" | "inspection";
  description: string;
  cost: number;
  performedBy: string;
  performedAt: string;
  nextDue?: string;
  status: "completed" | "scheduled" | "overdue";
}

// User management types
export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  description: string;
  isSystem: boolean;
}

export interface UserPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

// System types
export interface SystemHealth {
  status: "healthy" | "degraded" | "unhealthy";
  services: {
    [serviceName: string]: {
      status: "up" | "down" | "degraded";
      responseTime?: number;
      lastCheck: string;
    };
  };
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    load: number[];
  };
}

// Feature flag types
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetUsers?: string[];
  targetRoles?: string[];
  createdAt: string;
  updatedAt: string;
}

// Audit trail types
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

// File upload types
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  metadata?: Record<string, unknown>;
}

// Integration types
export interface Integration {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "error";
  configuration: Record<string, unknown>;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

// Report types
export interface Report {
  id: string;
  name: string;
  type: string;
  description: string;
  parameters: Record<string, unknown>;
  generatedBy: string;
  generatedAt: string;
  status: "generating" | "completed" | "failed";
  downloadUrl?: string;
  expiresAt?: string;
}
