// User and Authentication Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: UserRole
  department: Department
  permissions: Permission[]
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'employee'
  | 'hr_manager'
  | 'finance_manager'
  | 'sales_manager'
  | 'marketing_manager'
  | 'legal_manager'
  | 'partner_manager'

export type Department = 
  | 'executive'
  | 'hr'
  | 'finance'
  | 'sales'
  | 'marketing'
  | 'customer_service'
  | 'legal'
  | 'technology'
  | 'operations'
  | 'partners'

export type Permission = 
  | 'read'
  | 'write'
  | 'delete'
  | 'admin'
  | 'hr_manage'
  | 'finance_manage'
  | 'sales_manage'
  | 'marketing_manage'
  | 'legal_manage'
  | 'partner_manage'

// HR Types
export interface Employee extends User {
  employeeId: string
  position: string
  manager?: string
  hireDate: Date
  salary: number
  benefits: Benefit[]
  performance: PerformanceReview[]
  attendance: AttendanceRecord[]
  documents: Document[]
}

export interface Benefit {
  id: string
  type: 'health' | 'dental' | 'vision' | 'retirement' | 'other'
  name: string
  description: string
  cost: number
  isActive: boolean
}

export interface PerformanceReview {
  id: string
  employeeId: string
  reviewerId: string
  period: string
  rating: number
  comments: string
  goals: string[]
  createdAt: Date
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: Date
  checkIn: Date
  checkOut?: Date
  totalHours?: number
  status: 'present' | 'absent' | 'late' | 'half-day'
}

export interface JobPosting {
  id: string
  title: string
  department: Department
  description: string
  requirements: string[]
  salary: {
    min: number
    max: number
  }
  location: string
  type: 'full-time' | 'part-time' | 'contract'
  status: 'open' | 'closed' | 'draft'
  applications: JobApplication[]
  createdAt: Date
  updatedAt: Date
}

export interface JobApplication {
  id: string
  jobId: string
  candidate: {
    name: string
    email: string
    phone: string
    resume: string
  }
  status: 'applied' | 'reviewing' | 'interviewing' | 'offered' | 'hired' | 'rejected'
  score?: number
  notes: string[]
  createdAt: Date
}

// Finance Types
export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  dueDate: Date
  paidDate?: Date
  createdAt: Date
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
  category: string
  description: string
  amount: number
  receipt?: string
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  approvedBy?: string
  approvedAt?: Date
  createdAt: Date
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: 'credit_card' | 'bank_transfer' | 'check' | 'cash'
  status: 'pending' | 'completed' | 'failed'
  transactionId?: string
  createdAt: Date
}

// CRM Types
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  status: 'lead' | 'prospect' | 'customer' | 'inactive'
  source: string
  assignedTo: string
  interactions: Interaction[]
  deals: Deal[]
  createdAt: Date
  updatedAt: Date
}

export interface Interaction {
  id: string
  customerId: string
  type: 'call' | 'email' | 'meeting' | 'note'
  subject: string
  content: string
  createdBy: string
  createdAt: Date
}

export interface Deal {
  id: string
  customerId: string
  title: string
  value: number
  stage: 'lead' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  expectedCloseDate: Date
  assignedTo: string
  activities: DealActivity[]
  createdAt: Date
  updatedAt: Date
}

export interface DealActivity {
  id: string
  dealId: string
  type: 'call' | 'email' | 'meeting' | 'proposal'
  description: string
  createdBy: string
  createdAt: Date
}

// Partner Types
export interface Partner {
  id: string
  name: string
  type: 'repair_center' | 'parts_shop' | 'dealer'
  contact: {
    name: string
    email: string
    phone: string
  }
  address: Address
  services: string[]
  rating: number
  status: 'active' | 'inactive' | 'pending'
  commission: number
  performance: PartnerPerformance
  createdAt: Date
  updatedAt: Date
}

export interface PartnerPerformance {
  totalOrders: number
  totalRevenue: number
  averageRating: number
  responseTime: number
  completionRate: number
}

export interface PartnerOrder {
  id: string
  partnerId: string
  customerId: string
  service: string
  amount: number
  commission: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: Date
  completedAt?: Date
}

// Marketing Types
export interface Campaign {
  id: string
  name: string
  type: 'email' | 'social' | 'ads' | 'content'
  status: 'draft' | 'active' | 'paused' | 'completed'
  budget: number
  spent: number
  targetAudience: string[]
  metrics: CampaignMetrics
  startDate: Date
  endDate?: Date
  createdAt: Date
}

export interface CampaignMetrics {
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  roas: number
}

// Project Types
export interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: string[]
  tasks: Task[]
  budget: number
  startDate: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignedTo: string[]
  dueDate?: Date
  timeEstimate: number
  timeSpent: number
  dependencies: string[]
  createdAt: Date
  updatedAt: Date
}

// Analytics Types
export interface DashboardMetrics {
  totalRevenue: number
  totalCustomers: number
  totalOrders: number
  averageOrderValue: number
  customerSatisfaction: number
  employeeProductivity: number
  partnerPerformance: number
  marketingROI: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }[]
}

// Common Types
export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Document {
  id: string
  name: string
  type: string
  url: string
  size: number
  uploadedBy: string
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: Date
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  createdAt: Date
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
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
  department: Department
  role: UserRole
}

// Filter and Search Types
export interface FilterOptions {
  search?: string
  status?: string
  department?: Department
  dateRange?: {
    start: Date
    end: Date
  }
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Theme Types
export interface Theme {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  borderRadius: number
  fontSize: 'small' | 'medium' | 'large'
}

// Communication Types
export interface Message {
  id: string
  subject: string
  content: string
  senderId: string
  senderEmail: string
  recipientId: string
  recipientEmail: string
  type: 'internal' | 'external' | 'notification' | 'alert'
  status: 'unread' | 'read' | 'sent' | 'draft' | 'archived'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  attachments: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface MessageFormData {
  subject: string
  content: string
  recipientId: string
  recipientEmail: string
  type: 'internal' | 'external' | 'notification' | 'alert'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  attachments: string[]
  notes?: string
}

// Analytics & Business Intelligence Types
export interface ExecutiveDashboard {
  overview: ExecutiveOverview
  kpis: KeyPerformanceIndicators
  trends: BusinessTrends
  alerts: BusinessAlert[]
}

export interface ExecutiveOverview {
  totalRevenue: number
  totalCustomers: number
  totalEmployees: number
  totalProjects: number
  revenueGrowth: number
  customerGrowth: number
  employeeGrowth: number
  projectSuccessRate: number
}

export interface KeyPerformanceIndicators {
  financial: FinancialKPIs
  operational: OperationalKPIs
  customer: CustomerKPIs
  employee: EmployeeKPIs
}

export interface FinancialKPIs {
  monthlyRevenue: number
  monthlyExpenses: number
  profitMargin: number
  cashFlow: number
  outstandingInvoices: number
  averagePaymentTime: number
}

export interface OperationalKPIs {
  projectCompletionRate: number
  averageProjectDuration: number
  resourceUtilization: number
  taskCompletionRate: number
  customerSatisfaction: number
  employeeProductivity: number
}

export interface CustomerKPIs {
  customerAcquisitionCost: number
  customerLifetimeValue: number
  customerRetentionRate: number
  averageOrderValue: number
  customerSatisfactionScore: number
  netPromoterScore: number
}

export interface EmployeeKPIs {
  employeeTurnoverRate: number
  averageTimeToHire: number
  employeeSatisfaction: number
  trainingCompletionRate: number
  performanceRating: number
  absenteeismRate: number
}

export interface BusinessTrends {
  revenue: TrendData[]
  customers: TrendData[]
  projects: TrendData[]
  employees: TrendData[]
  expenses: TrendData[]
  productivity: TrendData[]
}

export interface TrendData {
  date: string
  value: number
  change: number
  changePercent: number
}

export interface BusinessAlert {
  id: string
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'financial' | 'operational' | 'customer' | 'employee' | 'security'
  timestamp: Date
  isRead: boolean
  actionRequired: boolean
}

// Department Analytics Types
export interface DepartmentAnalytics {
  hr: HRAnalytics
  finance: FinanceAnalytics
  sales: SalesAnalytics
  marketing: MarketingAnalytics
  operations: OperationsAnalytics
}

export interface HRAnalytics {
  employeeMetrics: EmployeeMetrics
  recruitmentMetrics: RecruitmentMetrics
  performanceMetrics: PerformanceMetrics
  hrReports: HRReport[]
}

export interface EmployeeMetrics {
  totalEmployees: number
  activeEmployees: number
  newHires: number
  terminations: number
  turnoverRate: number
  averageTenure: number
  departmentDistribution: DepartmentDistribution[]
  salaryDistribution: SalaryDistribution[]
}

export interface DepartmentDistribution {
  department: Department
  count: number
  percentage: number
}

export interface SalaryDistribution {
  range: string
  count: number
  percentage: number
}

export interface RecruitmentMetrics {
  openPositions: number
  applicationsReceived: number
  interviewsScheduled: number
  offersMade: number
  timeToHire: number
  costPerHire: number
  sourceEffectiveness: SourceEffectiveness[]
}

export interface SourceEffectiveness {
  source: string
  applications: number
  hires: number
  conversionRate: number
  costPerHire: number
}

export interface PerformanceMetrics {
  averageRating: number
  performanceDistribution: PerformanceDistribution[]
  topPerformers: TopPerformer[]
  improvementAreas: ImprovementArea[]
}

export interface PerformanceDistribution {
  rating: number
  count: number
  percentage: number
}

export interface TopPerformer {
  employeeId: string
  name: string
  department: Department
  rating: number
  achievements: string[]
}

export interface ImprovementArea {
  category: string
  averageScore: number
  targetScore: number
  gap: number
  recommendations: string[]
}

export interface FinanceAnalytics {
  revenueMetrics: RevenueMetrics
  expenseMetrics: ExpenseMetrics
  profitabilityMetrics: ProfitabilityMetrics
  cashFlowMetrics: CashFlowMetrics
  financeReports: FinanceReport[]
}

export interface RevenueMetrics {
  totalRevenue: number
  monthlyRevenue: number
  revenueGrowth: number
  revenueBySource: RevenueSource[]
  revenueByCustomer: RevenueCustomer[]
  revenueForecast: RevenueForecast[]
}

export interface RevenueSource {
  source: string
  amount: number
  percentage: number
  growth: number
}

export interface RevenueCustomer {
  customerId: string
  customerName: string
  amount: number
  percentage: number
}

export interface RevenueForecast {
  month: string
  projected: number
  actual?: number
  variance?: number
}

export interface ExpenseMetrics {
  totalExpenses: number
  monthlyExpenses: number
  expenseGrowth: number
  expenseByCategory: ExpenseCategory[]
  expenseByDepartment: ExpenseDepartment[]
  expenseTrends: ExpenseTrend[]
}

export interface ExpenseCategory {
  category: string
  amount: number
  percentage: number
  growth: number
}

export interface ExpenseDepartment {
  department: Department
  amount: number
  percentage: number
  budget: number
  variance: number
}

export interface ExpenseTrend {
  month: string
  amount: number
  budget: number
  variance: number
}

export interface ProfitabilityMetrics {
  grossProfit: number
  netProfit: number
  profitMargin: number
  ebitda: number
  roi: number
  profitabilityTrends: ProfitabilityTrend[]
}

export interface ProfitabilityTrend {
  month: string
  revenue: number
  expenses: number
  profit: number
  margin: number
}

export interface CashFlowMetrics {
  operatingCashFlow: number
  investingCashFlow: number
  financingCashFlow: number
  netCashFlow: number
  cashPosition: number
  cashFlowForecast: CashFlowForecast[]
}

export interface CashFlowForecast {
  month: string
  projected: number
  actual?: number
  variance?: number
}

export interface SalesAnalytics {
  salesMetrics: SalesMetrics
  pipelineMetrics: PipelineMetrics
  customerMetrics: CustomerMetrics
  salesReports: SalesReport[]
}

export interface SalesMetrics {
  totalSales: number
  monthlySales: number
  salesGrowth: number
  averageDealSize: number
  salesByRep: SalesRep[]
  salesByProduct: SalesProduct[]
}

export interface SalesRep {
  repId: string
  repName: string
  sales: number
  deals: number
  quota: number
  attainment: number
}

export interface SalesProduct {
  productId: string
  productName: string
  sales: number
  units: number
  margin: number
}

export interface PipelineMetrics {
  totalOpportunities: number
  pipelineValue: number
  conversionRate: number
  averageCycleTime: number
  stageDistribution: StageDistribution[]
  winRate: number
}

export interface StageDistribution {
  stage: string
  count: number
  value: number
  percentage: number
}

export interface CustomerMetrics {
  totalCustomers: number
  newCustomers: number
  churnRate: number
  customerLifetimeValue: number
  customerSatisfaction: number
  customerSegments: CustomerSegment[]
}

export interface CustomerSegment {
  segment: string
  count: number
  revenue: number
  averageValue: number
}

export interface MarketingAnalytics {
  campaignMetrics: CampaignMetrics
  leadMetrics: LeadMetrics
  channelMetrics: ChannelMetrics
  marketingReports: MarketingReport[]
}

export interface CampaignMetrics {
  totalCampaigns: number
  activeCampaigns: number
  totalSpend: number
  totalRevenue: number
  roi: number
  campaignPerformance: CampaignPerformance[]
}

export interface CampaignPerformance {
  campaignId: string
  campaignName: string
  spend: number
  revenue: number
  roi: number
  leads: number
  conversions: number
}

export interface LeadMetrics {
  totalLeads: number
  qualifiedLeads: number
  conversionRate: number
  leadSources: LeadSource[]
  leadQuality: LeadQuality[]
}

export interface LeadSource {
  source: string
  leads: number
  qualified: number
  conversionRate: number
  cost: number
}

export interface LeadQuality {
  score: string
  count: number
  conversionRate: number
  averageValue: number
}

export interface ChannelMetrics {
  channelPerformance: ChannelPerformance[]
  channelROI: ChannelROI[]
  channelTrends: ChannelTrend[]
}

export interface ChannelPerformance {
  channel: string
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
}

export interface ChannelROI {
  channel: string
  spend: number
  revenue: number
  roi: number
}

export interface ChannelTrend {
  channel: string
  month: string
  performance: number
  trend: 'up' | 'down' | 'stable'
}

export interface OperationsAnalytics {
  projectMetrics: ProjectMetrics
  resourceMetrics: ResourceMetrics
  efficiencyMetrics: EfficiencyMetrics
  operationsReports: OperationsReport[]
}

export interface ProjectMetrics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  successRate: number
  averageDuration: number
  projectPerformance: ProjectPerformance[]
}

export interface ProjectPerformance {
  projectId: string
  projectName: string
  status: string
  progress: number
  budget: number
  actual: number
  variance: number
}

export interface ResourceMetrics {
  totalResources: number
  allocatedResources: number
  utilizationRate: number
  resourceByDepartment: ResourceDepartment[]
  resourceBySkill: ResourceSkill[]
}

export interface ResourceDepartment {
  department: Department
  allocated: number
  available: number
  utilization: number
}

export interface ResourceSkill {
  skill: string
  count: number
  demand: number
  gap: number
}

export interface EfficiencyMetrics {
  productivityScore: number
  qualityScore: number
  deliveryScore: number
  efficiencyTrends: EfficiencyTrend[]
}

export interface EfficiencyTrend {
  month: string
  productivity: number
  quality: number
  delivery: number
}

// Predictive Analytics Types
export interface PredictiveAnalytics {
  forecasting: BusinessForecasting
  insights: PredictiveInsight[]
  recommendations: AIRecommendation[]
  riskAssessment: RiskAssessment
}

export interface BusinessForecasting {
  revenueForecast: ForecastData[]
  customerForecast: ForecastData[]
  projectForecast: ForecastData[]
  resourceForecast: ForecastData[]
}

export interface ForecastData {
  period: string
  actual?: number
  forecast: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
}

export interface PredictiveInsight {
  id: string
  type: 'trend' | 'anomaly' | 'pattern' | 'correlation'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  category: string
  timestamp: Date
  recommendations: string[]
}

export interface AIRecommendation {
  id: string
  type: 'optimization' | 'opportunity' | 'risk' | 'improvement'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: string
  expectedImpact: number
  implementationEffort: 'low' | 'medium' | 'high'
  timestamp: Date
  status: 'pending' | 'implemented' | 'rejected'
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high'
  riskFactors: RiskFactor[]
  riskTrends: RiskTrend[]
  mitigationStrategies: MitigationStrategy[]
}

export interface RiskFactor {
  id: string
  name: string
  probability: number
  impact: number
  riskScore: number
  category: string
  description: string
}

export interface RiskTrend {
  month: string
  riskScore: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

export interface MitigationStrategy {
  riskId: string
  strategy: string
  effectiveness: number
  cost: number
  timeline: string
}

// Custom Reporting Types
export interface CustomReporting {
  reportBuilder: ReportBuilder
  dashboards: CustomDashboard[]
  scheduling: ReportSchedule[]
  distribution: ReportDistribution[]
}

export interface ReportBuilder {
  templates: ReportTemplate[]
  dataSources: DataSource[]
  visualizations: VisualizationType[]
  filters: FilterOption[]
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  dataSources: string[]
  visualizations: VisualizationConfig[]
  filters: FilterConfig[]
  isPublic: boolean
  createdBy: string
  createdAt: Date
}

export interface DataSource {
  id: string
  name: string
  type: 'database' | 'api' | 'file' | 'external'
  connection: string
  tables: string[]
  fields: DataField[]
}

export interface DataField {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean'
  description: string
  isRequired: boolean
}

export type VisualizationType = 
  | 'line-chart'
  | 'bar-chart'
  | 'pie-chart'
  | 'table'
  | 'gauge'
  | 'heatmap'
  | 'scatter-plot'
  | 'funnel'

export interface VisualizationConfig {
  type: VisualizationType
  title: string
  dataSource: string
  xAxis?: string
  yAxis?: string
  colorBy?: string
  sizeBy?: string
  filters?: FilterConfig[]
}

export interface FilterOption {
  id: string
  name: string
  type: 'date' | 'text' | 'number' | 'select' | 'multi-select'
  dataSource: string
  field: string
  options?: string[]
}

export interface FilterConfig {
  filterId: string
  value: any
  operator: 'equals' | 'contains' | 'greater-than' | 'less-than' | 'between'
}

export interface CustomDashboard {
  id: string
  name: string
  description: string
  layout: DashboardLayout
  widgets: DashboardWidget[]
  filters: FilterConfig[]
  isPublic: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface DashboardLayout {
  columns: number
  rows: number
  grid: GridItem[]
}

export interface GridItem {
  id: string
  x: number
  y: number
  width: number
  height: number
  widgetId: string
}

export interface DashboardWidget {
  id: string
  type: VisualizationType
  title: string
  config: VisualizationConfig
  refreshInterval?: number
  lastUpdated: Date
}

export interface ReportSchedule {
  id: string
  reportId: string
  name: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  time: string
  dayOfWeek?: number
  dayOfMonth?: number
  recipients: string[]
  format: 'pdf' | 'excel' | 'csv'
  isActive: boolean
  lastRun?: Date
  nextRun: Date
}

export interface ReportDistribution {
  id: string
  reportId: string
  recipients: ReportRecipient[]
  deliveryMethod: 'email' | 'slack' | 'webhook'
  format: 'pdf' | 'excel' | 'csv'
  isActive: boolean
  lastSent?: Date
}

export interface ReportRecipient {
  id: string
  name: string
  email: string
  role: string
  department: Department
}

// Report Types
export interface HRReport {
  id: string
  name: string
  type: 'employee' | 'recruitment' | 'performance' | 'turnover'
  data: any
  generatedAt: Date
  period: string
}

export interface FinanceReport {
  id: string
  name: string
  type: 'revenue' | 'expense' | 'profitability' | 'cash-flow'
  data: any
  generatedAt: Date
  period: string
}

export interface SalesReport {
  id: string
  name: string
  type: 'sales' | 'pipeline' | 'customer' | 'forecast'
  data: any
  generatedAt: Date
  period: string
}

export interface MarketingReport {
  id: string
  name: string
  type: 'campaign' | 'lead' | 'channel' | 'roi'
  data: any
  generatedAt: Date
  period: string
}

export interface OperationsReport {
  id: string
  name: string
  type: 'project' | 'resource' | 'efficiency' | 'quality'
  data: any
  generatedAt: Date
  period: string
}
