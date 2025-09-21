'use client';

import { useLanguage } from '@/contexts/language-context';

type TranslationKey = string;

// Fallback translations
const fallbackTranslations = {
  common: {
    loading: "Loading...",
    filter: "Filter",
    search: "Search...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    export: "Export",
    import: "Import",
    refresh: "Refresh",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
    submit: "Submit",
    reset: "Reset",
    confirm: "Confirm",
    yes: "Yes",
    no: "No"
  },
  navigation: {
    dashboard: "Dashboard",
    userManagement: "User Management",
    fleetManagement: "Fleet Management",
    crm: "CRM",
    chat: "Chat",
    aiDashboard: "AI Dashboard",
    enterprise: "Enterprise",
    finance: "Finance",
    legal: "Legal",
    hr: "HR",
    featureFlags: "Feature Flags",
    communication: "Communication",
    analytics: "Analytics",
    mobileApps: "Mobile Apps",
    cms: "CMS",
    marketing: "Marketing",
    projects: "Projects",
    settings: "Settings",
    reports: "Reports",
    integrations: "Integrations",
    auditTrail: "Audit Trail",
    apiDocs: "API Docs",
    assets: "Assets",
    vendors: "Vendors",
    systemHealth: "System Health",
    b2cCustomers: "B2C Customers",
    b2bEnterprise: "B2B Enterprise",
    serviceProviders: "Service Providers",
    fleetOverview: "Fleet Overview",
    gpsTracking: "GPS Tracking",
    obd2Devices: "OBD2 Devices",
    chatMessaging: "Chat & Messaging",
    aiMlDashboard: "AI & ML Dashboard",
    enterpriseB2b: "Enterprise B2B",
    projectManagement: "Project Management",
    reporting: "Reporting",
    apiDocumentation: "API Documentation",
    assetManagement: "Asset Management",
    vendorManagement: "Vendor Management"
  },
  sidebar: {
    clutchAdmin: "Clutch Admin",
    collapse: "Collapse"
  },
  header: {
    search: "Search...",
    language: "Language",
    notifications: "Notifications",
    myAccount: "My Account",
    profile: "Profile",
    settings: "Settings"
  },
  language: {
    english: "English",
    arabic: "Arabic"
  },
  hr: {
    title: "Human Resources",
    description: "Manage employees, recruitment, and HR operations",
    totalEmployees: "Total Employees",
    active: "active",
    newHires: "New Hires",
    thisMonth: "this month",
    pendingApplications: "Pending Applications",
    openPositions: "open positions",
    avgSalary: "Average Salary",
    employeeManagement: "Employee Management",
    noPosition: "No Position",
    noDepartment: "No Department",
    salary: "Salary",
    department: "Department",
    deleteInvitation: "Delete Invitation",
    deleteInvitationConfirm: "Are you sure you want to delete this invitation?",
    invitationDeleted: "Invitation deleted successfully",
    loadingHrData: "Loading HR data..."
  },
  auth: {
    login: "Sign In",
    logout: "Sign Out",
    password: "Password",
    forgotPassword: "Forgot Password?",
    rememberMe: "Remember Me",
    signInToDrive: "Sign in to drive the automotive revolution",
    invalidCredentials: "Invalid email or password",
    loginSuccess: "Login successful",
    logoutSuccess: "Logout successful"
  },
  dashboard: {
    title: "Dashboard",
    overview: "Overview",
    analytics: "Analytics",
    metrics: "Metrics",
    performance: "Performance",
    revenue: "Revenue",
    users: "Users",
    orders: "Orders",
    products: "Products",
    totalRevenue: "Total Revenue",
    totalUsers: "Total Users",
    totalOrders: "Total Orders",
    totalProducts: "Total Products",
    loadingDashboard: "Loading Dashboard...",
    welcomeMessage: "Welcome to Clutch Admin",
    generateReport: "Generate Report",
    exportData: "Export Data",
    refresh: "Refresh",
    realtimeActivityFeed: "Real-time Activity Feed",
    latestActionsAndEvents: "Latest Actions and Events",
    quickActions: "Quick Actions",
    commonAdministrativeTasks: "Common Administrative Tasks",
    fleetStatus: "Fleet Status",
    realtimeFleetMonitoring: "Real-time Fleet Monitoring",
    performanceMetrics: "Performance Metrics",
    apiUptimeRequestsErrorsSessions: "API Uptime, Requests, Errors, Sessions",
    apiUptime: "API Uptime",
    requestRate: "Request Rate",
    errorRate: "Error Rate",
    activeSessions: "Active Sessions",
    systemAlerts: "System Alerts",
    criticalNotificationsRequiringAttention: "Critical Notifications Requiring Attention",
    highErrorRate: "High Error Rate",
    apiErrorsIncreased: "API Errors Increased",
    maintenanceWindow: "Maintenance Window",
    scheduledForTonight: "Scheduled for Tonight",
    systemHealthy: "System Healthy",
    allServicesOperational: "All Services Operational",
    businessIntelligence: "Business Intelligence",
    advancedAnalyticsAndPredictiveInsights: "Advanced Analytics and Predictive Insights"
  }
};

export function useTranslations() {
  const { language } = useLanguage();
  
  // Use fallback translations for now
  const translations = fallbackTranslations;

  const t = (key: TranslationKey): string => {
    // Check if translations are available
    if (!translations) {
      // Translations not available for language
      return key;
    }
    
    const keys = key.split('.');
    let value: Record<string, unknown> = translations;
    
    // Special debugging for common.loading
    if (key === 'common.loading') {
      // Looking for key in translations
    }
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
        if (key === 'common.loading') {
          // Found key
        }
      } else {
        // Translation key not found
        
        // Fallback for common keys
        if (key === 'common.loading') {
          return 'Loading...';
        }
        if (key === 'common.filter') {
          return 'Filter';
        }
        
        return key;
      }
    }
    
    const result = typeof value === 'string' ? value : key;
    if (key === 'common.loading') {
      // Final result
    }
    
    return result;
  };

  return { t, language };
}
