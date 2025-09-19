// Core entity types
export interface Product {
  id: number;
  sku: string;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  category_id: number;
  brand_id: number;
  barcode?: string;
  cost_price: number;
  selling_price: number;
  min_stock: number;
  current_stock: number;
  max_stock?: number;
  unit: string;
  weight?: number;
  dimensions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  brand?: Brand;
}

export interface Category {
  id: number;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  parent_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
  parent?: Category;
}

export interface Brand {
  id: number;
  name: string;
  name_ar: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  customer_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  loyalty_points: number;
  credit_limit: number;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  name_ar: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  payment_terms?: string;
  credit_limit: number;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'owner' | 'manager' | 'accountant' | 'cashier' | 'auditor' | 'sysadmin';

// Sales types
export interface Sale {
  id: number;
  sale_number: string;
  customer_id?: number;
  user_id: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  user?: User;
  items: SaleItem[];
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
  created_at: string;
  product?: Product;
}

export type PaymentMethod = 'cash' | 'visa' | 'instapay' | 'wallet' | 'credit';
export type PaymentStatus = 'completed' | 'pending' | 'refunded';

// Purchase Order types
export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  user_id: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: POStatus;
  order_date: string;
  expected_date?: string;
  received_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  user?: User;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: number;
  po_id: number;
  product_id: number;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  received_quantity: number;
  created_at: string;
  product?: Product;
}

export type POStatus = 'pending' | 'ordered' | 'received' | 'cancelled';

// Stock Movement types
export interface StockMovement {
  id: number;
  product_id: number;
  movement_type: MovementType;
  quantity: number;
  reference_type?: ReferenceType;
  reference_id?: number;
  notes?: string;
  user_id: number;
  created_at: string;
  product?: Product;
  user?: User;
}

export type MovementType = 'in' | 'out' | 'adjustment';
export type ReferenceType = 'sale' | 'purchase' | 'adjustment';

// Settings types
export interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  updated_at: string;
}

// Sync types
export interface SyncLog {
  id: number;
  table_name: string;
  record_id: number;
  operation: SyncOperation;
  status: SyncStatus;
  error_message?: string;
  created_at: string;
  synced_at?: string;
}

export type SyncOperation = 'create' | 'update' | 'delete';
export type SyncStatus = 'pending' | 'synced' | 'failed';

// Report types
export interface ReportConfig {
  id?: number;
  name: string;
  type: ReportType;
  template: string;
  parameters: Record<string, any>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ReportType = 'internal' | 'accountant' | 'tax' | 'external' | 'cashier' | 'custom';

// AI/ML types
export interface DemandForecast {
  product_id: number;
  product_name: string;
  current_demand: number;
  predicted_demand: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonal_factor: number;
  forecast_date: string;
}

export interface PriceOptimization {
  product_id: number;
  product_name: string;
  current_price: number;
  optimized_price: number;
  expected_sales_increase: number;
  expected_revenue_increase: number;
  confidence: number;
  recommendation: 'increase' | 'decrease' | 'maintain';
}

export interface InventoryOptimization {
  product_id: number;
  product_name: string;
  current_stock: number;
  recommended_stock: number;
  reorder_point: number;
  reorder_quantity: number;
  stockout_probability: number;
  overstock_probability: number;
}

export interface CustomerInsight {
  customer_id: number;
  customer_name: string;
  total_purchases: number;
  average_order_value: number;
  purchase_frequency: number;
  last_purchase_date: string;
  churn_risk: 'low' | 'medium' | 'high';
  lifetime_value: number;
  recommendations: string[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
  timestamp: string;
}

// Form types
export interface ProductForm {
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  category_id: number;
  brand_id: number;
  barcode?: string;
  cost_price: number;
  selling_price: number;
  min_stock: number;
  max_stock?: number;
  unit: string;
  weight?: number;
  dimensions?: string;
  is_active: boolean;
}

export interface CustomerForm {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  loyalty_points?: number;
  credit_limit?: number;
  is_active: boolean;
}

export interface SupplierForm {
  name: string;
  name_ar: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  payment_terms?: string;
  credit_limit?: number;
  is_active: boolean;
}

export interface SaleForm {
  customer_id?: number;
  items: SaleItemForm[];
  discount_amount?: number;
  discount_type?: 'percentage' | 'fixed';
  payment_method: PaymentMethod;
  notes?: string;
}

export interface SaleItemForm {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
}

// Filter types
export interface ProductFilter {
  search?: string;
  category_id?: number;
  brand_id?: number;
  min_price?: number;
  max_price?: number;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  is_active?: boolean;
}

export interface SaleFilter {
  search?: string;
  customer_id?: number;
  user_id?: number;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  date_from?: string;
  date_to?: string;
}

export interface CustomerFilter {
  search?: string;
  city?: string;
  is_active?: boolean;
  has_credit?: boolean;
}

export interface SupplierFilter {
  search?: string;
  city?: string;
  is_active?: boolean;
}

// Dashboard types
export interface DashboardStats {
  total_products: number;
  total_sales: number;
  total_customers: number;
  total_suppliers: number;
  low_stock_products: number;
  pending_orders: number;
  monthly_revenue: number;
  monthly_sales: number;
  top_products: Array<{
    product_id: number;
    product_name: string;
    total_sold: number;
    revenue: number;
  }>;
  recent_sales: Sale[];
  stock_alerts: Array<{
    product_id: number;
    product_name: string;
    current_stock: number;
    min_stock: number;
  }>;
}

// Notification types
export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

// Backup types
export interface BackupInfo {
  id: number;
  filename: string;
  size: number;
  created_at: string;
  type: 'manual' | 'automatic';
  status: 'completed' | 'failed' | 'in_progress';
}

// System types
export interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
  electron: string;
  node: string;
  uptime: number;
  memory_usage: number;
  disk_usage: number;
}

// Theme types
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  font_size: number;
}

// Export all types
// Additional type exports can be added here as needed
