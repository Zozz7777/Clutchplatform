// Core Types
export type Theme = 'light' | 'dark'
export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer'
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended'
export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// User Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  avatar?: string
  profilePicture?: string
  jobTitle?: string
  role: UserRole
  status: UserStatus
  department?: string
  position?: string
  phone?: string
  location?: string
  timezone?: string
  language?: string
  permissions: string[]
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

// Notification Types
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  timestamp?: string
  actionUrl?: string
  createdAt: Date
  expiresAt?: Date
}

// Dashboard Types
export interface DashboardMetrics {
  overview: {
    totalUsers: number
    totalRevenue: number
    totalOrders: number
    activeProjects: number
  }
  revenue: {
    current: number
    previous: number
    growth: number
    trend: 'up' | 'down' | 'stable'
  }
  users: {
    total: number
    active: number
    new: number
    growth: number
  }
  orders: {
    total: number
    pending: number
    completed: number
    cancelled: number
  }
  analytics?: {
    revenueChart: ChartData[]
    userChart: ChartData[]
    orderChart: ChartData[]
  }
}

export interface ChartData {
  date: string
  value: number
  label?: string
}

// HR Types
export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone?: string
  department: string
  position: string
  manager?: string
  hireDate: Date
  salary?: number
  status: 'active' | 'inactive' | 'terminated'
  avatar?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  skills: string[]
  performance?: {
    rating: number
    lastReview: Date
    nextReview: Date
  }
  createdAt: Date
  updatedAt: Date
}

// Finance Types
export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  amount: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  dueDate: Date
  issueDate: Date
  paidDate?: Date
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Expense {
  id: string
  employeeId: string
  employeeName: string
  category: string
  amount: number
  currency: string
  date: Date
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  receipt?: string
  approvedBy?: string
  approvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  invoiceId: string
  invoiceNumber: string
  customerId: string
  customerName: string
  amount: number
  currency: string
  method: 'credit_card' | 'bank_transfer' | 'cash' | 'check'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transactionId?: string
  date: Date
  createdAt: Date
  updatedAt: Date
}

// CRM Types
export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  status: 'active' | 'inactive' | 'prospect'
  source: string
  assignedTo?: string
  totalSpent?: number
  orderCount?: number
  lastOrder?: Date
  location?: string
  tags: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Deal {
  id: string
  title: string
  customerId: string
  customerName: string
  amount: number
  currency: string
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  expectedCloseDate: Date
  assignedTo?: string
  source: string
  description?: string
  activities: DealActivity[]
  createdAt: Date
  updatedAt: Date
}

export interface DealActivity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note'
  title: string
  description?: string
  date: Date
  assignedTo?: string
}

export interface Lead {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone?: string
  company?: string
  position?: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'unqualified'
  assignedTo?: string
  score: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Partners Types
export interface Partner {
  id: string
  name: string
  email: string
  phone?: string
  type: 'parts_shop' | 'repair_center' | 'distributor' | 'service_provider'
  status: 'active' | 'pending' | 'suspended' | 'inactive'
  location?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  contactPerson?: {
    name: string
    email: string
    phone: string
    position: string
  }
  rating?: number
  orderCount?: number
  totalRevenue?: number
  commissionRate?: number
  paymentInfo?: {
    bankName: string
    accountNumber: string
    routingNumber: string
  }
  documents: PartnerDocument[]
  createdAt: Date
  updatedAt: Date
}

export interface PartnerDocument {
  id: string
  name: string
  type: string
  url: string
  uploadedAt: Date
}

export interface PartnerOrder {
  id: string
  partnerId: string
  partnerName: string
  orderNumber: string
  customerId: string
  customerName: string
  amount: number
  commission: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  items: PartnerOrderItem[]
  orderDate: Date
  completedDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PartnerOrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

// Marketing Types
export interface Campaign {
  id: string
  name: string
  description?: string
  type: 'email' | 'social' | 'display' | 'search' | 'content'
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  startDate: Date
  endDate?: Date
  budget?: number
  spent?: number
  targetAudience?: string
  goals?: string[]
  metrics: CampaignMetrics
  createdAt: Date
  updatedAt: Date
}

export interface CampaignMetrics {
  impressions?: number
  clicks?: number
  conversions?: number
  ctr?: number
  cpc?: number
  cpm?: number
  roas?: number
}

// Projects Types
export interface Project {
  id: string
  name: string
  description?: string
  client: string
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
  priority: Priority
  startDate: Date
  endDate?: Date
  progress: number
  budget?: number
  spent?: number
  assignedTo: string[]
  teamSize?: number
  taskCount?: number
  completedTasks?: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  projectId: string
  projectName: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  priority: Priority
  assignedTo?: string
  dueDate?: Date
  completedDate?: Date
  estimatedHours?: number
  actualHours?: number
  dependencies?: string[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// Analytics Types
export interface AnalyticsData {
  period: string
  metrics: {
    revenue: number
    orders: number
    customers: number
    conversionRate: number
  }
  trends: {
    revenue: ChartData[]
    orders: ChartData[]
    customers: ChartData[]
  }
  topProducts: TopProduct[]
  topCustomers: TopCustomer[]
}

export interface TopProduct {
  id: string
  name: string
  sales: number
  revenue: number
  growth: number
}

export interface TopCustomer {
  id: string
  name: string
  orders: number
  revenue: number
  lastOrder: Date
}

// Settings Types
export interface UserSettings {
  theme: Theme
  language: string
  timezone: string
  dateFormat: string
  timeFormat: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'team'
    activityVisibility: 'public' | 'private' | 'team'
  }
}

export interface SystemSettings {
  company: {
    name: string
    logo: string
    address: string
    phone: string
    email: string
    website: string
  }
  features: {
    [key: string]: boolean
  }
  integrations: {
    [key: string]: {
      enabled: boolean
      config: any
    }
  }
  security: {
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSymbols: boolean
    }
    sessionTimeout: number
    mfaRequired: boolean
  }
}

// Form Types
export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
  company?: string
}

export interface EmployeeForm {
  firstName: string
  lastName: string
  email: string
  phone?: string
  department: string
  position: string
  manager?: string
  hireDate: Date
  salary?: number
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  skills: string[]
}

export interface InvoiceForm {
  customerId: string
  dueDate: Date
  items: InvoiceItemForm[]
  notes?: string
}

export interface InvoiceItemForm {
  description: string
  quantity: number
  unitPrice: number
}

export interface CustomerForm {
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  source: string
  assignedTo?: string
  location?: string
  tags: string[]
  notes?: string
}

export interface PartnerForm {
  name: string
  email: string
  phone?: string
  type: 'parts_shop' | 'repair_center' | 'distributor' | 'service_provider'
  location?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  contactPerson?: {
    name: string
    email: string
    phone: string
    position: string
  }
  commissionRate?: number
}

export interface CampaignForm {
  name: string
  description?: string
  type: 'email' | 'social' | 'display' | 'search' | 'content'
  startDate: Date
  endDate?: Date
  budget?: number
  targetAudience?: string
  goals?: string[]
}

export interface ProjectForm {
  name: string
  description?: string
  client: string
  priority: Priority
  startDate: Date
  endDate?: Date
  budget?: number
  assignedTo: string[]
  tags: string[]
}

// Filter Types
export interface FilterOptions {
  search?: string
  status?: string
  dateRange?: {
    start: Date
    end: Date
  }
  assignedTo?: string
  department?: string
  priority?: Priority
  tags?: string[]
}

// Table Types
export interface TableColumn<T = any> {
  key: keyof T
  title: string
  sortable?: boolean
  filterable?: boolean
  width?: string
  render?: (value: any, record: T) => React.ReactNode
}

export interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  sorting?: {
    key: keyof T
    order: 'asc' | 'desc'
    onChange: (key: keyof T, order: 'asc' | 'desc') => void
  }
  filters?: FilterOptions
  onFiltersChange?: (filters: FilterOptions) => void
  rowSelection?: {
    selectedRowKeys: string[]
    onChange: (selectedRowKeys: string[]) => void
  }
  onRowClick?: (record: T) => void
}

// Modal Types
export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  footer?: React.ReactNode
}

// Form Field Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox' | 'radio'
  required?: boolean
  placeholder?: string
  options?: { label: string; value: any }[]
  validation?: any
  disabled?: boolean
}

// Chart Types
export interface ChartProps {
  data: ChartData[]
  type: 'line' | 'bar' | 'pie' | 'area'
  title?: string
  height?: number
  color?: string
  showGrid?: boolean
  showLegend?: boolean
}

// Navigation Types
export interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: string
  children?: NavItem[]
  disabled?: boolean
}

// Breadcrumb Types
export interface BreadcrumbItem {
  title: string
  href?: string
  icon?: React.ReactNode
}

// File Upload Types
export interface FileUpload {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: Date
  uploadedBy: string
}

// Audit Log Types
export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  resourceId: string
  details?: any
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

// Loading States
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

// Pagination Types
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Search Types
export interface SearchResult<T = any> {
  data: T[]
  total: number
  query: string
  filters: FilterOptions
}

// Export Types
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  fields: string[]
  filters?: FilterOptions
  filename?: string
}

// Import Types
export interface ImportOptions {
  format: 'csv' | 'excel'
  fields: string[]
  validation?: any
  onProgress?: (progress: number) => void
}

// Webhook Types
export interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  secret?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// API Key Types
export interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  expiresAt?: Date
  lastUsed?: Date
  createdAt: Date
}

// Backup Types
export interface Backup {
  id: string
  name: string
  type: 'full' | 'incremental'
  size: number
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
  downloadUrl?: string
}

// System Health Types
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  cpu: {
    usage: number
    cores: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
  database: {
    status: 'connected' | 'disconnected' | 'error'
    responseTime: number
  }
  services: {
    [key: string]: {
      status: 'running' | 'stopped' | 'error'
      responseTime?: number
    }
  }
  lastChecked: Date
}

// Legal Types
export interface Contract {
  id: string
  title: string
  contractNumber: string
  type: 'service' | 'partnership' | 'employment' | 'nda' | 'lease' | 'purchase'
  status: 'draft' | 'review' | 'negotiation' | 'approved' | 'signed' | 'active' | 'expired' | 'terminated'
  clientId: string
  clientName: string
  clientEmail: string
  value: number
  startDate: Date
  endDate: Date
  description: string
  terms: string
  paymentTerms: string
  deliverables: string[]
  attachments: string[]
  notes: string
  assignedTo: string
  priority: Priority
  createdAt: Date
  updatedAt: Date
}

export interface ContractFormData {
  title: string
  contractNumber: string
  type: string
  status: string
  clientId: string
  clientName: string
  clientEmail: string
  value: number
  startDate: string
  endDate: string
  description: string
  terms: string
  paymentTerms: string
  deliverables: string[]
  attachments: string[]
  notes: string
  assignedTo: string
  priority: string
}

// Communication Types
export interface Message {
  id: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
  recipients: string[]
  subject: string
  content: string
  type: 'direct' | 'group' | 'announcement'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'sent' | 'delivered' | 'read' | 'failed'
  attachments: string[]
  createdAt: Date
  readAt?: Date
  isStarred: boolean
  isArchived: boolean
}

export interface MessageFormData {
  recipients: string[]
  subject: string
  content: string
  type: 'direct' | 'group' | 'announcement'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  attachments?: File[]
}

export interface Announcement {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  priority: 'low' | 'medium' | 'high' | 'urgent'
  targetAudience: string[]
  isPublished: boolean
  publishedAt?: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Meeting {
  id: string
  title: string
  description: string
  organizer: {
    id: string
    name: string
    avatar?: string
  }
  participants: string[]
  startTime: Date
  endTime: Date
  location: string
  meetingUrl?: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  agenda: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Enhanced Settings Types
export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  position: string
  department: string
  location: string
  timezone: string
  language: string
  bio?: string
  skills: string[]
  experience?: string
  education?: string
  joinedAt: Date
  lastActive: Date
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  dateFormat: string
  timeFormat: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    desktop: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'team'
    activityVisibility: 'public' | 'private' | 'team'
    showOnlineStatus: boolean
  }
  accessibility: {
    fontSize: 'small' | 'medium' | 'large'
    highContrast: boolean
    reduceMotion: boolean
  }
}

export interface CompanySettings {
  name: string
  logo?: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  contact: {
    phone: string
    email: string
    website?: string
  }
  industry: string
  size: string
  founded: number
  description?: string
  socialMedia?: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    maxAge: number
  }
  sessionTimeout: number
  mfaRequired: boolean
  mfaMethods: ('sms' | 'email' | 'authenticator')[]
  ipWhitelist: string[]
  failedLoginAttempts: number
  lockoutDuration: number
  auditLogging: boolean
}

export interface FeatureSettings {
  modules: {
    hr: boolean
    finance: boolean
    crm: boolean
    partners: boolean
    marketing: boolean
    projects: boolean
    analytics: boolean
    legal: boolean
    communication: boolean
  }
  features: {
    fileUpload: boolean
    realTimeNotifications: boolean
    advancedSearch: boolean
    dataExport: boolean
    apiAccess: boolean
    customFields: boolean
    workflowAutomation: boolean
  }
  limits: {
    maxFileSize: number
    maxUsers: number
    maxProjects: number
    storageLimit: number
  }
}

export interface SystemLog {
  id: string
  level: 'info' | 'warning' | 'error' | 'critical'
  message: string
  source: string
  userId?: string
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  metadata?: Record<string, any>
}

// White Label Types
export interface WhiteLabelConfig {
  companyName: string
  brandName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  logo: {
    light: string
    dark: string
    favicon: string
  }
  customDomain: string
  emailDomain: string
  contactInfo: {
    email: string
    phone: string
    address: string
  }
  features: {
    customBranding: boolean
    customDomain: boolean
    customEmail: boolean
    apiAccess: boolean
    prioritySupport: boolean
    advancedAnalytics: boolean
  }
  status: 'active' | 'inactive' | 'pending'
  lastUpdated: string
  subscription: {
    plan: string
    startDate: string
    endDate: string
    users: number
    vehicles: number
  }
}
