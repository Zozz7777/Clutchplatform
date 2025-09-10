import {
  LayoutDashboard,
  Users,
  DollarSign,
  Building2,
  Target,
  FileText,
  Settings,
  BarChart3,
  Calendar,
  MessageSquare,
  Home,
  Briefcase,
  UserCheck,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  Shield,
  HelpCircle,
} from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: string
  children?: NavItem[]
  roles?: string[] // Required roles to access this item
  permissions?: string[] // Required permissions to access this item
}

export const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-3 w-3" />,
    roles: ['admin', 'manager', 'employee', 'viewer'], // Everyone can access dashboard
  },
  {
    title: 'B2B Fleet Management',
    href: '/fleet',
    icon: <Home className="h-3 w-3" />,
    roles: ['admin', 'fleet_manager', 'fleet_admin'],
    children: [
      { 
        title: 'Fleet Overview', 
        href: '/fleet/overview', 
        icon: <BarChart3 className="h-2.5 w-2.5" />,
        roles: ['admin', 'fleet_manager', 'fleet_admin']
      },
      { 
        title: 'Drivers', 
        href: '/fleet/drivers', 
        icon: <Users className="h-2.5 w-2.5" />,
        roles: ['admin', 'fleet_manager', 'fleet_admin']
      },
      { 
        title: 'Maintenance', 
        href: '/fleet/maintenance', 
        icon: <Settings className="h-2.5 w-2.5" />,
        roles: ['admin', 'fleet_manager', 'fleet_admin']
      },
      { 
        title: 'Routes', 
        href: '/fleet/routes', 
        icon: <Target className="h-2.5 w-2.5" />,
        roles: ['admin', 'fleet_manager', 'fleet_admin']
      },
      { 
        title: 'Tracking', 
        href: '/fleet/tracking', 
        icon: <BarChart3 className="h-2.5 w-2.5" />,
        roles: ['admin', 'fleet_manager', 'fleet_admin']
      },
      { 
        title: 'Analytics', 
        href: '/fleet/analytics', 
        icon: <TrendingUp className="h-2.5 w-2.5" />,
        roles: ['admin', 'fleet_manager', 'fleet_admin']
      },
    ],
  },
  {
    title: 'AI & Machine Learning',
    href: '/ai',
    icon: <TrendingUp className="h-3 w-3" />,
    roles: ['admin', 'analytics', 'cto', 'management'],
    children: [
      { 
        title: 'AI Dashboard', 
        href: '/ai/dashboard', 
        icon: <BarChart3 className="h-2.5 w-2.5" />,
        roles: ['admin', 'analytics', 'cto', 'management']
      },
      { 
        title: 'Predictive Analytics', 
        href: '/ai/predictive', 
        icon: <TrendingUp className="h-2.5 w-2.5" />,
        roles: ['admin', 'analytics', 'cto', 'management']
      },
      { 
        title: 'Fraud Detection', 
        href: '/ai/fraud', 
        icon: <Shield className="h-2.5 w-2.5" />,
        roles: ['admin', 'analytics', 'cto', 'management']
      },
      { 
        title: 'Recommendations', 
        href: '/ai/recommendations', 
        icon: <Target className="h-2.5 w-2.5" />,
        roles: ['admin', 'analytics', 'cto', 'management']
      },
      { 
        title: 'Models', 
        href: '/ai/models', 
        icon: <Settings className="h-2.5 w-2.5" />,
        roles: ['admin', 'analytics', 'cto', 'management']
      },
    ],
  },
  {
    title: 'HR Management',
    href: '/hr',
    icon: <Users className="h-3 w-3" />,
    roles: ['admin', 'hr_manager', 'hr'],
    children: [
      { 
        title: 'Employees', 
        href: '/hr/employees', 
        icon: <UserCheck className="h-2.5 w-2.5" />,
        roles: ['admin', 'hr_manager', 'hr']
      },
      { 
        title: 'Recruitment', 
        href: '/hr/recruitment', 
        icon: <Briefcase className="h-2.5 w-2.5" />,
        roles: ['admin', 'hr_manager', 'hr']
      },
      { 
        title: 'Performance', 
        href: '/hr/performance', 
        icon: <TrendingUp className="h-2.5 w-2.5" />,
        roles: ['admin', 'hr_manager', 'hr']
      },
      { 
        title: 'Payroll', 
        href: '/hr/payroll', 
        icon: <CreditCard className="h-2.5 w-2.5" />,
        roles: ['admin', 'hr_manager', 'hr']
      },
    ],
  },
  {
    title: 'Finance',
    href: '/finance',
    icon: <DollarSign className="h-3 w-3" />,
    roles: ['admin', 'finance_manager', 'accountant'],
    children: [
      { 
        title: 'Invoices', 
        href: '/finance/invoices', 
        icon: <FileText className="h-2.5 w-2.5" />,
        roles: ['admin', 'finance_manager', 'accountant']
      },
      { 
        title: 'Expenses', 
        href: '/finance/expenses', 
        icon: <CreditCard className="h-2.5 w-2.5" />,
        roles: ['admin', 'finance_manager', 'accountant']
      },
      { 
        title: 'Payments', 
        href: '/finance/payments', 
        icon: <DollarSign className="h-2.5 w-2.5" />,
        roles: ['admin', 'finance_manager', 'accountant']
      },
      { 
        title: 'Reports', 
        href: '/finance/reports', 
        icon: <BarChart3 className="h-2.5 w-2.5" />,
        roles: ['admin', 'finance_manager', 'accountant']
      },
      { 
        title: 'Subscriptions', 
        href: '/finance/subscriptions', 
        icon: <Calendar className="h-2.5 w-2.5" />,
        roles: ['admin', 'finance_manager', 'accountant']
      },
    ],
  },
  {
    title: 'CRM & Sales',
    href: '/crm',
    icon: <Target className="h-3 w-3" />,
    roles: ['admin', 'sales_manager', 'sales_rep'],
    children: [
      { 
        title: 'Customers', 
        href: '/crm/customers', 
        icon: <Users className="h-2.5 w-2.5" />,
        roles: ['admin', 'sales_manager', 'sales_rep']
      },
      { 
        title: 'Deals', 
        href: '/crm/deals', 
        icon: <Target className="h-2.5 w-2.5" />,
        roles: ['admin', 'sales_manager', 'sales_rep']
      },
      { 
        title: 'Leads', 
        href: '/crm/leads', 
        icon: <TrendingUp className="h-2.5 w-2.5" />,
        roles: ['admin', 'sales_manager', 'sales_rep']
      },
      { 
        title: 'Pipeline', 
        href: '/crm/pipeline', 
        icon: <BarChart3 className="h-2.5 w-2.5" />,
        roles: ['admin', 'sales_manager', 'sales_rep']
      },
    ],
  },
  {
    title: 'Partners',
    href: '/partners',
    icon: <Building2 className="h-3 w-3" />,
    roles: ['admin', 'partner_manager'],
    children: [
      { 
        title: 'Directory', 
        href: '/partners/directory', 
        icon: <Users className="h-2.5 w-2.5" />,
        roles: ['admin', 'partner_manager']
      },
      { 
        title: 'Commissions', 
        href: '/partners/commission', 
        icon: <DollarSign className="h-2.5 w-2.5" />,
        roles: ['admin', 'partner_manager']
      },
      { 
        title: 'Performance', 
        href: '/partners/performance', 
        icon: <BarChart3 className="h-2.5 w-2.5" />,
        roles: ['admin', 'partner_manager']
      },
    ],
  },
  {
    title: 'Marketing',
    href: '/marketing',
    icon: <Target className="h-3 w-3" />,
    roles: ['admin', 'marketing_manager'],
    children: [
      { 
        title: 'Campaigns', 
        href: '/marketing/campaigns', 
        icon: <Target className="h-2.5 w-2.5" />,
        roles: ['admin', 'marketing_manager']
      },
      { 
        title: 'Analytics', 
        href: '/marketing/analytics', 
        icon: <BarChart3 className="h-2.5 w-2.5" />,
        roles: ['admin', 'marketing_manager']
      },
      { 
        title: 'Automation', 
        href: '/marketing/automation', 
        icon: <TrendingUp className="h-2.5 w-2.5" />,
        roles: ['admin', 'marketing_manager']
      },
    ],
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: <Briefcase className="h-3 w-3" />,
    roles: ['admin', 'manager', 'operations'],
    children: [
      { 
        title: 'List', 
        href: '/projects/list', 
        icon: <FileText className="h-2.5 w-2.5" />,
        roles: ['admin', 'manager', 'operations']
      },
      { 
        title: 'Tasks', 
        href: '/projects/tasks', 
        icon: <Target className="h-2.5 w-2.5" />,
        roles: ['admin', 'manager', 'operations']
      },
      { 
        title: 'Time Tracking', 
        href: '/projects/time', 
        icon: <Calendar className="h-2.5 w-2.5" />,
        roles: ['admin', 'manager', 'operations']
      },
    ],
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: <BarChart3 className="h-3 w-3" />,
    roles: ['admin', 'analytics', 'analyst', 'management'],
    children: [
      { 
        title: 'Overview', 
        href: '/analytics/overview', 
        icon: <BarChart3 className="h-2.5 w-2.5" />,
        roles: ['admin', 'analytics', 'analyst', 'management']
      },
      { 
        title: 'Executive Dashboard', 
        href: '/analytics/executive-dashboard', 
        icon: <TrendingUp className="h-2.5 w-2.5" />,
        roles: ['admin', 'analytics', 'analyst', 'management']
      },
      { 
        title: 'Reports', 
        href: '/analytics/reports', 
        icon: <FileText className="h-2.5 w-2.5" />,
        roles: ['admin', 'analytics', 'analyst', 'management']
      },
    ],
  },
  {
    title: 'Enterprise',
    href: '/enterprise',
    icon: <Building2 className="h-3 w-3" />,
    roles: ['admin', 'enterprise_manager'],
    children: [
      { 
        title: 'Multi-Tenant', 
        href: '/enterprise/multi-tenant', 
        icon: <Building2 className="h-2.5 w-2.5" />,
        roles: ['admin', 'enterprise_manager']
      },
      { 
        title: 'White-Label', 
        href: '/enterprise/white-label', 
        icon: <Settings className="h-2.5 w-2.5" />,
        roles: ['admin', 'enterprise_manager']
      },
      { 
        title: 'API Management', 
        href: '/enterprise/api', 
        icon: <Target className="h-2.5 w-2.5" />,
        roles: ['admin', 'enterprise_manager']
      },
    ],
  },
  {
    title: 'Legal',
    href: '/legal',
    icon: <Shield className="h-3 w-3" />,
    roles: ['admin', 'legal_manager'],
    children: [
      { 
        title: 'Contracts', 
        href: '/legal/contracts', 
        icon: <FileText className="h-2.5 w-2.5" />,
        roles: ['admin', 'legal_manager']
      },
      { 
        title: 'Compliance', 
        href: '/legal/compliance', 
        icon: <Shield className="h-2.5 w-2.5" />,
        roles: ['admin', 'legal_manager']
      },
      { 
        title: 'Documents', 
        href: '/legal/documents', 
        icon: <FileText className="h-2.5 w-2.5" />,
        roles: ['admin', 'legal_manager']
      },
    ],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <Settings className="h-3 w-3" />,
    roles: ['admin', 'manager'], // Only admins and managers can access settings
    children: [
      { 
        title: 'Profile', 
        href: '/settings/profile', 
        icon: <UserCheck className="h-2.5 w-2.5" />,
        roles: ['admin', 'manager', 'employee'] // Everyone can edit their profile
      },
      { 
        title: 'System', 
        href: '/settings/system', 
        icon: <Settings className="h-2.5 w-2.5" />,
        roles: ['admin'] // Only admins can access system settings
      },
      { 
        title: 'Feature Flags', 
        href: '/settings/feature-flags', 
        icon: <Target className="h-2.5 w-2.5" />,
        roles: ['admin'] // Only admins can manage feature flags
      },
    ],
  },
]

// Helper function to check if user has access to a navigation item
export const hasNavAccess = (item: NavItem, userRoles: string[]): boolean => {
  // If no roles specified, allow access
  if (!item.roles || item.roles.length === 0) {
    return true
  }
  
  // Check if user has any of the required roles
  return userRoles.some(role => item.roles!.includes(role))
}

// Helper function to filter navigation based on user roles
export const filterNavigationByRoles = (navItems: NavItem[], userRoles: string[]): NavItem[] => {
  return navItems
    .filter(item => hasNavAccess(item, userRoles))
    .map(item => ({
      ...item,
      children: item.children 
        ? filterNavigationByRoles(item.children, userRoles)
        : undefined
    }))
    .filter(item => {
      // Remove parent items that have no accessible children
      if (item.children && item.children.length === 0) {
        return false
      }
      return true
    })
}
