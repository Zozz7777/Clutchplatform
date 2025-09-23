export const API_BASE_URL = "https://clutch-main-nk7x.onrender.com";
export const DOMAIN = "yourclutch.com";
export const ADMIN_DOMAIN = "admin.yourclutch.com";

export const USER_ROLES = {
  // Level 1: Executive Leadership (Level 10-9)
  SUPER_ADMIN: "super_admin",
  HEAD_ADMINISTRATOR: "head_administrator",
  EXECUTIVE: "executive",
  PLATFORM_ADMIN: "platform_admin",
  ADMIN: "admin",
  
  // Level 2: Department Heads (Level 8)
  HR_MANAGER: "hr_manager",
  FINANCE_OFFICER: "finance_officer",
  OPERATIONS_MANAGER: "operations_manager",
  MARKETING_MANAGER: "marketing_manager",
  LEGAL_TEAM: "legal_team",
  SECURITY_MANAGER: "security_manager",
  
  // Level 3: Specialized Managers (Level 7)
  BUSINESS_ANALYST: "business_analyst",
  PROJECT_MANAGER: "project_manager",
  ASSET_MANAGER: "asset_manager",
  CRM_MANAGER: "crm_manager",
  SYSTEM_ADMIN: "system_admin",
  
  // Level 4: Functional Specialists (Level 6)
  HR: "hr",
  FINANCE: "finance",
  CUSTOMER_SUPPORT: "customer_support",
  DEVELOPER: "developer",
  
  // Level 5: Operational Staff (Level 5)
  EMPLOYEE: "employee",
  SUPPORT_AGENT: "support_agent",
  
  // Level 6: External Users (Level 4)
  ENTERPRISE_CLIENT: "enterprise_client",
  SERVICE_PROVIDER: "service_provider",
} as const;

// Permission Groups - Organized by functional areas
export const PERMISSION_GROUPS = {
  // 1. Core System & Dashboard (12 permissions)
  CORE_SYSTEM_DASHBOARD: [
    "view_dashboard",
    "view_analytics", 
    "export_analytics",
    "view_system_health",
    "view_kpi_metrics",
    "manage_kpi_metrics",
    "view_business_intelligence",
    "manage_business_intelligence",
    "view_dashboard_config",
    "manage_dashboard_config",
    "view_system_monitoring",
    "manage_system_monitoring"
  ],

  // 2. User & Organization (12 permissions)
  USER_ORGANIZATION: [
    "view_users",
    "create_users", 
    "edit_users",
    "delete_users",
    "view_employees",
    "manage_employees",
    "view_hr",
    "manage_hr",
    "view_onboarding",
    "manage_onboarding",
    "view_profiles",
    "manage_profiles"
  ],

  // 3. Fleet & Operations (8 permissions)
  FLEET_OPERATIONS: [
    "view_fleet",
    "manage_fleet",
    "view_gps_tracking",
    "view_assets",
    "manage_assets", 
    "view_vendors",
    "manage_vendors",
    "view_operations"
  ],

  // 4. Business & Customer (16 permissions)
  BUSINESS_CUSTOMER: [
    "view_crm",
    "manage_crm",
    "view_enterprise",
    "manage_enterprise",
    "view_finance",
    "manage_finance",
    "process_payments",
    "view_billing",
    "manage_billing",
    "view_legal",
    "manage_legal",
    "view_contracts",
    "manage_contracts",
    "view_partners",
    "manage_partners",
    "view_customer_data"
  ],

  // 5. Technology & Development (16 permissions)
  TECHNOLOGY_DEVELOPMENT: [
    "view_ai_dashboard",
    "manage_ai_models",
    "view_mobile_apps",
    "manage_mobile_apps",
    "view_cms",
    "manage_cms",
    "view_integrations",
    "manage_integrations",
    "view_api_docs",
    "view_feature_flags",
    "manage_feature_flags",
    "view_scheduled_jobs",
    "manage_scheduled_jobs",
    "view_development_tools",
    "manage_development_tools",
    "view_technical_documentation"
  ],

  // 6. Communication & Support (10 permissions)
  COMMUNICATION_SUPPORT: [
    "view_chat",
    "send_messages",
    "view_communication",
    "manage_communication",
    "view_support",
    "manage_support",
    "view_feedback",
    "manage_feedback",
    "view_announcements",
    "manage_announcements"
  ],

  // 7. Administration & Config (16 permissions)
  ADMINISTRATION_CONFIG: [
    "view_settings",
    "manage_settings",
    "view_reports",
    "generate_reports",
    "view_audit_trail",
    "view_marketing",
    "manage_marketing",
    "view_projects",
    "manage_projects",
    "view_localization",
    "manage_localization",
    "view_accessibility",
    "manage_accessibility",
    "view_system_config",
    "manage_system_config",
    "view_security_settings"
  ]
} as const;

// Flattened permissions object for backward compatibility
export const PERMISSIONS = {
  // Core System & Dashboard
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_ANALYTICS: "view_analytics",
  EXPORT_ANALYTICS: "export_analytics",
  VIEW_SYSTEM_HEALTH: "view_system_health",
  VIEW_KPI_METRICS: "view_kpi_metrics",
  MANAGE_KPI_METRICS: "manage_kpi_metrics",
  VIEW_BUSINESS_INTELLIGENCE: "view_business_intelligence",
  MANAGE_BUSINESS_INTELLIGENCE: "manage_business_intelligence",
  VIEW_DASHBOARD_CONFIG: "view_dashboard_config",
  MANAGE_DASHBOARD_CONFIG: "manage_dashboard_config",
  VIEW_SYSTEM_MONITORING: "view_system_monitoring",
  MANAGE_SYSTEM_MONITORING: "manage_system_monitoring",

  // User & Organization
  VIEW_USERS: "view_users",
  CREATE_USERS: "create_users",
  EDIT_USERS: "edit_users",
  DELETE_USERS: "delete_users",
  VIEW_EMPLOYEES: "view_employees",
  MANAGE_EMPLOYEES: "manage_employees",
  VIEW_HR: "view_hr",
  MANAGE_HR: "manage_hr",
  VIEW_ONBOARDING: "view_onboarding",
  MANAGE_ONBOARDING: "manage_onboarding",
  VIEW_PROFILES: "view_profiles",
  MANAGE_PROFILES: "manage_profiles",

  // Fleet & Operations
  VIEW_FLEET: "view_fleet",
  MANAGE_FLEET: "manage_fleet",
  VIEW_GPS_TRACKING: "view_gps_tracking",
  VIEW_ASSETS: "view_assets",
  MANAGE_ASSETS: "manage_assets",
  VIEW_VENDORS: "view_vendors",
  MANAGE_VENDORS: "manage_vendors",
  VIEW_OPERATIONS: "view_operations",

  // Business & Customer
  VIEW_CRM: "view_crm",
  MANAGE_CRM: "manage_crm",
  VIEW_ENTERPRISE: "view_enterprise",
  MANAGE_ENTERPRISE: "manage_enterprise",
  VIEW_FINANCE: "view_finance",
  MANAGE_FINANCE: "manage_finance",
  PROCESS_PAYMENTS: "process_payments",
  VIEW_BILLING: "view_billing",
  MANAGE_BILLING: "manage_billing",
  VIEW_LEGAL: "view_legal",
  MANAGE_LEGAL: "manage_legal",
  VIEW_CONTRACTS: "view_contracts",
  MANAGE_CONTRACTS: "manage_contracts",
  VIEW_PARTNERS: "view_partners",
  MANAGE_PARTNERS: "manage_partners",
  VIEW_CUSTOMER_DATA: "view_customer_data",

  // Technology & Development
  VIEW_AI_DASHBOARD: "view_ai_dashboard",
  MANAGE_AI_MODELS: "manage_ai_models",
  VIEW_MOBILE_APPS: "view_mobile_apps",
  MANAGE_MOBILE_APPS: "manage_mobile_apps",
  VIEW_CMS: "view_cms",
  MANAGE_CMS: "manage_cms",
  VIEW_INTEGRATIONS: "view_integrations",
  MANAGE_INTEGRATIONS: "manage_integrations",
  VIEW_API_DOCS: "view_api_docs",
  VIEW_FEATURE_FLAGS: "view_feature_flags",
  MANAGE_FEATURE_FLAGS: "manage_feature_flags",
  VIEW_SCHEDULED_JOBS: "view_scheduled_jobs",
  MANAGE_SCHEDULED_JOBS: "manage_scheduled_jobs",
  VIEW_DEVELOPMENT_TOOLS: "view_development_tools",
  MANAGE_DEVELOPMENT_TOOLS: "manage_development_tools",
  VIEW_TECHNICAL_DOCUMENTATION: "view_technical_documentation",

  // Communication & Support
  VIEW_CHAT: "view_chat",
  SEND_MESSAGES: "send_messages",
  VIEW_COMMUNICATION: "view_communication",
  MANAGE_COMMUNICATION: "manage_communication",
  VIEW_SUPPORT: "view_support",
  MANAGE_SUPPORT: "manage_support",
  VIEW_FEEDBACK: "view_feedback",
  MANAGE_FEEDBACK: "manage_feedback",
  VIEW_ANNOUNCEMENTS: "view_announcements",
  MANAGE_ANNOUNCEMENTS: "manage_announcements",

  // Administration & Config
  VIEW_SETTINGS: "view_settings",
  MANAGE_SETTINGS: "manage_settings",
  VIEW_REPORTS: "view_reports",
  GENERATE_REPORTS: "generate_reports",
  VIEW_AUDIT_TRAIL: "view_audit_trail",
  VIEW_MARKETING: "view_marketing",
  MANAGE_MARKETING: "manage_marketing",
  VIEW_PROJECTS: "view_projects",
  MANAGE_PROJECTS: "manage_projects",
  VIEW_LOCALIZATION: "view_localization",
  MANAGE_LOCALIZATION: "manage_localization",
  VIEW_ACCESSIBILITY: "view_accessibility",
  MANAGE_ACCESSIBILITY: "manage_accessibility",
  VIEW_SYSTEM_CONFIG: "view_system_config",
  MANAGE_SYSTEM_CONFIG: "manage_system_config",
  VIEW_SECURITY_SETTINGS: "view_security_settings",
} as const;

// Helper functions for permission management
export const getPermissionsByGroup = (groupName: keyof typeof PERMISSION_GROUPS): string[] => {
  return [...PERMISSION_GROUPS[groupName]];
};

export const getAllPermissions = (): string[] => {
  return Object.values(PERMISSION_GROUPS).flat();
};

export const getPermissionGroups = (): string[] => {
  return Object.keys(PERMISSION_GROUPS);
};

// Role templates by permission groups - for easy role creation
export const ROLE_TEMPLATES = {
  // Core System Administrator - Dashboard and system monitoring
  CORE_SYSTEM_ADMIN: [
    ...PERMISSION_GROUPS.CORE_SYSTEM_DASHBOARD,
    ...PERMISSION_GROUPS.ADMINISTRATION_CONFIG
  ],
  
  // User Administrator - User and organization management
  USER_ADMIN: [
    ...PERMISSION_GROUPS.USER_ORGANIZATION,
    ...PERMISSION_GROUPS.COMMUNICATION_SUPPORT
  ],
  
  // Fleet Administrator - Fleet and operations management
  FLEET_ADMIN: [
    ...PERMISSION_GROUPS.FLEET_OPERATIONS,
    ...PERMISSION_GROUPS.BUSINESS_CUSTOMER
  ],
  
  // Business Administrator - Business and customer management
  BUSINESS_ADMIN: [
    ...PERMISSION_GROUPS.BUSINESS_CUSTOMER,
    ...PERMISSION_GROUPS.ADMINISTRATION_CONFIG
  ],
  
  // Technology Administrator - Technology and development
  TECHNOLOGY_ADMIN: [
    ...PERMISSION_GROUPS.TECHNOLOGY_DEVELOPMENT,
    ...PERMISSION_GROUPS.ADMINISTRATION_CONFIG
  ],
  
  // Support Administrator - Communication and support
  SUPPORT_ADMIN: [
    ...PERMISSION_GROUPS.COMMUNICATION_SUPPORT,
    ...PERMISSION_GROUPS.USER_ORGANIZATION
  ],
  
  // Configuration Administrator - System configuration and settings
  CONFIG_ADMIN: [
    ...PERMISSION_GROUPS.ADMINISTRATION_CONFIG,
    ...PERMISSION_GROUPS.CORE_SYSTEM_DASHBOARD
  ]
} as const;

export const ROLE_PERMISSIONS = {
  // Level 1: Executive Leadership - Full access to all permission groups
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.HEAD_ADMINISTRATOR]: Object.values(PERMISSIONS),
  [USER_ROLES.EXECUTIVE]: Object.values(PERMISSIONS),
  [USER_ROLES.PLATFORM_ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
  // Level 2: Department Heads (Level 8)
  [USER_ROLES.HR_MANAGER]: [
    ...PERMISSION_GROUPS.CORE_SYSTEM_DASHBOARD,
    ...PERMISSION_GROUPS.USER_ORGANIZATION,
    ...PERMISSION_GROUPS.COMMUNICATION_SUPPORT,
    ...PERMISSION_GROUPS.ADMINISTRATION_CONFIG.filter(p => p.includes('reports')),
  ],
  [USER_ROLES.FINANCE_OFFICER]: [
    ...PERMISSION_GROUPS.CORE_SYSTEM_DASHBOARD,
    ...PERMISSION_GROUPS.BUSINESS_CUSTOMER.filter(p => p.includes('finance') || p.includes('billing') || p.includes('payments')),
    ...PERMISSION_GROUPS.ADMINISTRATION_CONFIG.filter(p => p.includes('reports')),
  ],
  [USER_ROLES.OPERATIONS_MANAGER]: [
    ...PERMISSION_GROUPS.CORE_SYSTEM_DASHBOARD,
    ...PERMISSION_GROUPS.FLEET_OPERATIONS,
    ...PERMISSION_GROUPS.USER_ORGANIZATION.filter(p => p.includes('employees')),
    ...PERMISSION_GROUPS.ADMINISTRATION_CONFIG.filter(p => p.includes('reports')),
  ],
  [USER_ROLES.MARKETING_MANAGER]: [
    ...PERMISSION_GROUPS.CORE_SYSTEM_DASHBOARD,
    ...PERMISSION_GROUPS.ADMINISTRATION_CONFIG.filter(p => p.includes('marketing')),
    ...PERMISSION_GROUPS.BUSINESS_CUSTOMER.filter(p => p.includes('crm')),
  ],
  [USER_ROLES.LEGAL_TEAM]: [
    ...PERMISSION_GROUPS.CORE_SYSTEM_DASHBOARD,
    ...PERMISSION_GROUPS.BUSINESS_CUSTOMER.filter(p => p.includes('legal') || p.includes('contracts')),
    ...PERMISSION_GROUPS.ADMINISTRATION_CONFIG.filter(p => p.includes('reports')),
  ],
  [USER_ROLES.SECURITY_MANAGER]: [
    ...PERMISSION_GROUPS.CORE_SYSTEM_DASHBOARD,
    ...PERMISSION_GROUPS.ADMINISTRATION_CONFIG.filter(p => p.includes('audit') || p.includes('security')),
    ...PERMISSION_GROUPS.USER_ORGANIZATION.filter(p => p.includes('users')),
  ],

  // Level 3: Specialized Managers (Level 7)
  [USER_ROLES.BUSINESS_ANALYST]: [
    ...PERMISSION_GROUPS.CORE_SYSTEM_DASHBOARD,
    ...PERMISSION_GROUPS.ADMINISTRATION_CONFIG.filter(p => p.includes('reports') || p.includes('analytics')),
  ],
  [USER_ROLES.PROJECT_MANAGER]: [
    ...PERMISSION_GROUPS.CORE_SYSTEM_DASHBOARD,
    ...PERMISSION_GROUPS.ADMINISTRATION_CONFIG.filter(p => p.includes('projects')),
    ...PERMISSION_GROUPS.USER_ORGANIZATION.filter(p => p.includes('users')),
  ],
  [USER_ROLES.ASSET_MANAGER]: [
    ...PERMISSION_GROUPS.CORE_SYSTEM_DASHBOARD,
    ...PERMISSION_GROUPS.FLEET_OPERATIONS,
    ...PERMISSION_GROUPS.ADMINISTRATION_CONFIG.filter(p => p.includes('reports')),
  ],
  [USER_ROLES.CRM_MANAGER]: [
    ...PERMISSION_GROUPS.CORE_SYSTEM_DASHBOARD,
    ...PERMISSION_GROUPS.BUSINESS_CUSTOMER.filter(p => p.includes('crm')),
    ...PERMISSION_GROUPS.COMMUNICATION_SUPPORT,
  ],
  [USER_ROLES.SYSTEM_ADMIN]: [
    ...PERMISSION_GROUPS.CORE_SYSTEM_DASHBOARD,
    ...PERMISSION_GROUPS.TECHNOLOGY_DEVELOPMENT,
    ...PERMISSION_GROUPS.ADMINISTRATION_CONFIG.filter(p => p.includes('system') || p.includes('settings')),
  ],

  // Level 4: Functional Specialists (Level 6)
  [USER_ROLES.HR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_HR,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_CHAT,
    PERMISSIONS.VIEW_COMMUNICATION,
  ],
  [USER_ROLES.FINANCE]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_FINANCE,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [USER_ROLES.CUSTOMER_SUPPORT]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CRM,
    PERMISSIONS.MANAGE_CRM,
    PERMISSIONS.VIEW_CHAT,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.VIEW_COMMUNICATION,
    PERMISSIONS.MANAGE_COMMUNICATION,
  ],
  [USER_ROLES.DEVELOPER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_AI_DASHBOARD,
    PERMISSIONS.VIEW_MOBILE_APPS,
    PERMISSIONS.VIEW_SYSTEM_HEALTH,
    PERMISSIONS.VIEW_CHAT,
    PERMISSIONS.VIEW_SUPPORT,
  ],

  // Level 5: Operational Staff (Level 5)
  [USER_ROLES.EMPLOYEE]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROFILES,
    PERMISSIONS.MANAGE_PROFILES,
    PERMISSIONS.VIEW_CHAT,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.VIEW_COMMUNICATION,
    PERMISSIONS.VIEW_SUPPORT,
  ],
  [USER_ROLES.SUPPORT_AGENT]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_SUPPORT,
    PERMISSIONS.MANAGE_SUPPORT,
    PERMISSIONS.VIEW_CHAT,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.VIEW_COMMUNICATION,
  ],

  // Level 6: External Users (Level 4)
  [USER_ROLES.ENTERPRISE_CLIENT]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_FLEET,
    PERMISSIONS.MANAGE_FLEET,
    PERMISSIONS.VIEW_GPS_TRACKING,
    PERMISSIONS.VIEW_CRM,
    PERMISSIONS.VIEW_CHAT,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [USER_ROLES.SERVICE_PROVIDER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CHAT,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.VIEW_CRM,
  ],
} as const;

export const NAVIGATION_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    permissions: [PERMISSIONS.VIEW_DASHBOARD],
  },
  {
    title: "User Management",
    href: "/users",
    icon: "Users",
    permissions: [PERMISSIONS.VIEW_USERS],
  },
  {
    title: "Fleet Management",
    href: "/fleet",
    icon: "Truck",
    permissions: [PERMISSIONS.VIEW_FLEET],
  },
  {
    title: "Sales",
    href: "/sales",
    icon: "TrendingUp",
    permissions: [PERMISSIONS.VIEW_CRM],
  },
  {
    title: "Sales Rep Dashboard",
    href: "/sales/rep",
    icon: "User",
    permissions: [PERMISSIONS.VIEW_CRM, "sales_rep"],
    parent: "Sales",
  },
  {
    title: "Executive Dashboard",
    href: "/sales/executive",
    icon: "BarChart3",
    permissions: [PERMISSIONS.VIEW_CRM, "sales_director", "ceo", "admin"],
    parent: "Sales",
  },
  {
    title: "HR Performance",
    href: "/sales/hr",
    icon: "Users",
    permissions: [PERMISSIONS.VIEW_CRM, "hr", "admin"],
    parent: "Sales",
  },
  {
    title: "Legal Contracts",
    href: "/sales/legal",
    icon: "FileText",
    permissions: [PERMISSIONS.VIEW_CRM, "legal", "admin"],
    parent: "Sales",
  },
  {
    title: "Chat & Messaging",
    href: "/chat",
    icon: "MessageSquare",
    permissions: [PERMISSIONS.VIEW_CHAT],
  },
  {
    title: "AI & ML Dashboard",
    href: "/ai-ml",
    icon: "Brain",
    permissions: [PERMISSIONS.VIEW_AI_DASHBOARD],
  },
  {
    title: "Enterprise B2B",
    href: "/enterprise",
    icon: "Building2",
    permissions: [PERMISSIONS.VIEW_ENTERPRISE],
  },
  {
    title: "Finance",
    href: "/finance",
    icon: "DollarSign",
    permissions: [PERMISSIONS.VIEW_FINANCE],
  },
  {
    title: "Legal",
    href: "/legal",
    icon: "Scale",
    permissions: [PERMISSIONS.VIEW_LEGAL],
  },
  {
    title: "HR",
    href: "/hr",
    icon: "UserCog",
    permissions: [PERMISSIONS.VIEW_HR],
  },
  {
    title: "Feature Flags",
    href: "/feature-flags",
    icon: "Flag",
    permissions: [PERMISSIONS.VIEW_FEATURE_FLAGS],
  },
  {
    title: "Communication",
    href: "/communication",
    icon: "Megaphone",
    permissions: [PERMISSIONS.VIEW_COMMUNICATION],
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: "BarChart3",
    permissions: [PERMISSIONS.VIEW_ANALYTICS],
  },
  {
    title: "Mobile Apps",
    href: "/mobile-apps",
    icon: "Smartphone",
    permissions: [PERMISSIONS.VIEW_MOBILE_APPS],
  },
  {
    title: "CMS",
    href: "/cms",
    icon: "FileText",
    permissions: [PERMISSIONS.VIEW_CMS],
  },
  {
    title: "Marketing",
    href: "/marketing",
    icon: "Target",
    permissions: [PERMISSIONS.VIEW_MARKETING],
  },
  {
    title: "Project Management",
    href: "/projects",
    icon: "FolderKanban",
    permissions: [PERMISSIONS.VIEW_PROJECTS],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "Settings",
    permissions: [PERMISSIONS.VIEW_SETTINGS],
  },
  {
    title: "Reporting",
    href: "/reports",
    icon: "FileBarChart",
    permissions: [PERMISSIONS.VIEW_REPORTS],
  },
  {
    title: "Integrations",
    href: "/integrations",
    icon: "Plug",
    permissions: [PERMISSIONS.VIEW_INTEGRATIONS],
  },
  {
    title: "Audit Trail",
    href: "/audit-trail",
    icon: "History",
    permissions: [PERMISSIONS.VIEW_AUDIT_TRAIL],
  },
  {
    title: "API Documentation",
    href: "/api-docs",
    icon: "Code",
    permissions: [PERMISSIONS.VIEW_API_DOCS],
  },
  {
    title: "Asset Management",
    href: "/assets",
    icon: "Package",
    permissions: [PERMISSIONS.VIEW_ASSETS],
  },
  {
    title: "Vendor Management",
    href: "/vendors",
    icon: "Building2",
    permissions: [PERMISSIONS.VIEW_VENDORS],
  },
  {
    title: "System Health",
    href: "/system-health",
    icon: "Activity",
    permissions: [PERMISSIONS.VIEW_SYSTEM_HEALTH],
  },
] as const;
