import * as React from 'react';

// User and Authentication Types
export interface User {
  id: number;
  partner_id: string;
  username: string;
  email: string;
  role: 'owner' | 'manager' | 'cashier' | 'inventory_clerk' | 'accountant' | 'support';
  permissions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  partnerId: string | null;
  deviceId: string | null;
}

// Product and Inventory Types
export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  model?: string;
  cost_price: number;
  sale_price: number;
  quantity: number;
  min_quantity: number;
  barcode?: string;
  images: string[];
  specifications: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
  discount?: number;
}

// Database Order representation (items as JSON string)
export interface DatabaseOrder {
  id: number;
  order_id: string;
  customer_id?: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  items: string; // JSON string in database
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'rejected' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

// Order and Payment Types
export interface Order {
  id: number;
  order_id: string;
  customer_id?: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'rejected' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  payment_id: string;
  order_id: string;
  amount: number;
  method: 'cash' | 'card' | 'visa' | 'instapay' | 'wallet';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  reference?: string;
  processed_at?: string;
  created_at: string;
}

// Sync and Operations Types
export interface SyncOperation {
  id: number;
  operation_id: string;
  entity_type: 'order' | 'inventory' | 'payment' | 'customer' | 'product' | 'settings';
  entity_id: string;
  operation_type: 'create' | 'update' | 'delete' | 'sync';
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'conflict';
  error_message?: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface SyncStatus {
  isOnline: boolean;
  pendingOperations: number;
  failedOperations: number;
  lastSync?: string;
  partnerId: string;
  deviceId: string;
}

// Settings Types
export interface AppSettings {
  partner_id: string;
  business_name: string;
  currency: string;
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'auto';
  sync_interval: string;
  auto_sync: string;
  offline_mode: string;
  device_id?: string;
  auth_token?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Notification Types
export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  sound?: boolean;
  urgency?: 'low' | 'normal' | 'critical';
  actions?: Array<{
    type: 'button';
    text: string;
  }>;
}

// Form Types
export interface LoginForm {
  emailOrPhone: string;
  password: string;
  deviceId?: string;
}

export interface PartnerIdForm {
  partnerId: string;
}

export interface DeviceRegistrationForm {
  deviceId: string;
  deviceName: string;
  deviceType: 'windows_desktop' | 'android_tablet' | 'ios_tablet' | 'pos_terminal' | 'kiosk';
  platform: 'windows' | 'android' | 'ios' | 'linux';
  version: string;
  partnerId: string;
  hardware?: any;
  software?: any;
  network?: any;
  location?: any;
  configuration?: any;
  capabilities?: any;
  settings?: any;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'date';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  ref?: React.RefObject<HTMLInputElement>;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Theme Types
export interface Theme {
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    card: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}
