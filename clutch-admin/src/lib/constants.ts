export const API_BASE_URL = "https://clutch-main-nk7x.onrender.com";
export const DOMAIN = "yourclutch.com";
export const ADMIN_DOMAIN = "admin.yourclutch.com";

export const USER_ROLES = {
  PLATFORM_ADMIN: "platform_admin",
  ENTERPRISE_CLIENT: "enterprise_client",
  SERVICE_PROVIDER: "service_provider",
  BUSINESS_ANALYST: "business_analyst",
  CUSTOMER_SUPPORT: "customer_support",
  HR_MANAGER: "hr_manager",
  FINANCE_OFFICER: "finance_officer",
  LEGAL_TEAM: "legal_team",
  PROJECT_MANAGER: "project_manager",
  ASSET_MANAGER: "asset_manager",
  VENDOR_MANAGER: "vendor_manager",
} as const;

export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: "view_dashboard",
  
  // User Management
  VIEW_USERS: "view_users",
  CREATE_USERS: "create_users",
  EDIT_USERS: "edit_users",
  DELETE_USERS: "delete_users",
  
  // Fleet Management
  VIEW_FLEET: "view_fleet",
  MANAGE_FLEET: "manage_fleet",
  VIEW_GPS_TRACKING: "view_gps_tracking",
  
  // CRM
  VIEW_CRM: "view_crm",
  MANAGE_CRM: "manage_crm",
  
  // Chat/Messaging
  VIEW_CHAT: "view_chat",
  SEND_MESSAGES: "send_messages",
  
  // AI & ML
  VIEW_AI_DASHBOARD: "view_ai_dashboard",
  MANAGE_AI_MODELS: "manage_ai_models",
  
  // Enterprise B2B
  VIEW_ENTERPRISE: "view_enterprise",
  MANAGE_ENTERPRISE: "manage_enterprise",
  
  // Finance
  VIEW_FINANCE: "view_finance",
  MANAGE_FINANCE: "manage_finance",
  PROCESS_PAYMENTS: "process_payments",
  
  // Legal
  VIEW_LEGAL: "view_legal",
  MANAGE_LEGAL: "manage_legal",
  
  // HR
  VIEW_HR: "view_hr",
  MANAGE_HR: "manage_hr",
  
  // Feature Flags
  VIEW_FEATURE_FLAGS: "view_feature_flags",
  MANAGE_FEATURE_FLAGS: "manage_feature_flags",
  
  // Communication
  VIEW_COMMUNICATION: "view_communication",
  MANAGE_COMMUNICATION: "manage_communication",
  
  // Analytics
  VIEW_ANALYTICS: "view_analytics",
  EXPORT_ANALYTICS: "export_analytics",
  
  // Mobile App Management
  VIEW_MOBILE_APPS: "view_mobile_apps",
  MANAGE_MOBILE_APPS: "manage_mobile_apps",
  
  // CMS
  VIEW_CMS: "view_cms",
  MANAGE_CMS: "manage_cms",
  
  // Marketing
  VIEW_MARKETING: "view_marketing",
  MANAGE_MARKETING: "manage_marketing",
  
  // Project Management
  VIEW_PROJECTS: "view_projects",
  MANAGE_PROJECTS: "manage_projects",
  
  // Settings
  VIEW_SETTINGS: "view_settings",
  MANAGE_SETTINGS: "manage_settings",
  
  // Reporting
  VIEW_REPORTS: "view_reports",
  GENERATE_REPORTS: "generate_reports",
  
  // Integrations
  VIEW_INTEGRATIONS: "view_integrations",
  MANAGE_INTEGRATIONS: "manage_integrations",
  
  // Audit Trail
  VIEW_AUDIT_TRAIL: "view_audit_trail",
  
  // API Documentation
  VIEW_API_DOCS: "view_api_docs",
  
  // System Health
  VIEW_SYSTEM_HEALTH: "view_system_health",
  
  // Scheduled Jobs
  VIEW_SCHEDULED_JOBS: "view_scheduled_jobs",
  MANAGE_SCHEDULED_JOBS: "manage_scheduled_jobs",
  
  // Billing & Invoicing
  VIEW_BILLING: "view_billing",
  MANAGE_BILLING: "manage_billing",
  
  // Contract Management
  VIEW_CONTRACTS: "view_contracts",
  MANAGE_CONTRACTS: "manage_contracts",
  
  // Asset Management
  VIEW_ASSETS: "view_assets",
  MANAGE_ASSETS: "manage_assets",
  
  // Vendor Management
  VIEW_VENDORS: "view_vendors",
  MANAGE_VENDORS: "manage_vendors",
  
  // User Onboarding
  VIEW_ONBOARDING: "view_onboarding",
  MANAGE_ONBOARDING: "manage_onboarding",
  
  // User Feedback
  VIEW_FEEDBACK: "view_feedback",
  MANAGE_FEEDBACK: "manage_feedback",
  
  // Announcements
  VIEW_ANNOUNCEMENTS: "view_announcements",
  MANAGE_ANNOUNCEMENTS: "manage_announcements",
  
  // Localization
  VIEW_LOCALIZATION: "view_localization",
  MANAGE_LOCALIZATION: "manage_localization",
  
  // Accessibility
  VIEW_ACCESSIBILITY: "view_accessibility",
  MANAGE_ACCESSIBILITY: "manage_accessibility",
} as const;

export const ROLE_PERMISSIONS = {
  [USER_ROLES.PLATFORM_ADMIN]: Object.values(PERMISSIONS),
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
  [USER_ROLES.BUSINESS_ANALYST]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.GENERATE_REPORTS,
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
  [USER_ROLES.HR_MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_HR,
    PERMISSIONS.MANAGE_HR,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
  ],
  [USER_ROLES.FINANCE_OFFICER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_FINANCE,
    PERMISSIONS.MANAGE_FINANCE,
    PERMISSIONS.PROCESS_PAYMENTS,
    PERMISSIONS.VIEW_BILLING,
    PERMISSIONS.MANAGE_BILLING,
  ],
  [USER_ROLES.LEGAL_TEAM]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_LEGAL,
    PERMISSIONS.MANAGE_LEGAL,
    PERMISSIONS.VIEW_CONTRACTS,
    PERMISSIONS.MANAGE_CONTRACTS,
  ],
  [USER_ROLES.PROJECT_MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.MANAGE_PROJECTS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  [USER_ROLES.ASSET_MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ASSETS,
    PERMISSIONS.MANAGE_ASSETS,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [USER_ROLES.VENDOR_MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_VENDORS,
    PERMISSIONS.MANAGE_VENDORS,
    PERMISSIONS.VIEW_CONTRACTS,
    PERMISSIONS.MANAGE_CONTRACTS,
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
    children: [
      { title: "B2C Customers", href: "/users/b2c", permissions: [PERMISSIONS.VIEW_USERS] },
      { title: "B2B Enterprise", href: "/users/b2b", permissions: [PERMISSIONS.VIEW_USERS] },
      { title: "Service Providers", href: "/users/providers", permissions: [PERMISSIONS.VIEW_USERS] },
    ],
  },
  {
    title: "Fleet Management",
    href: "/fleet",
    icon: "Truck",
    permissions: [PERMISSIONS.VIEW_FLEET],
    children: [
      { title: "Fleet Overview", href: "/fleet/overview", permissions: [PERMISSIONS.VIEW_FLEET] },
      { title: "GPS Tracking", href: "/fleet/tracking", permissions: [PERMISSIONS.VIEW_GPS_TRACKING] },
      { title: "OBD2 Devices", href: "/fleet/obd2", permissions: [PERMISSIONS.VIEW_FLEET] },
    ],
  },
  {
    title: "CRM",
    href: "/crm",
    icon: "UserCheck",
    permissions: [PERMISSIONS.VIEW_CRM],
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
