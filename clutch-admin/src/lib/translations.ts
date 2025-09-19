// Translation loader with fallback mechanism
// This file ensures translations are always available even if build optimization fails

export const getTranslations = () => {
  let enTranslations: any = null;
  let arTranslations: any = null;

  // Try to load translations from JSON files
  try {
    enTranslations = require('@/messages/en.json');
    arTranslations = require('@/messages/ar.json');
  } catch (error) {
    // Failed to load translation files, using fallback
  }

  // Fallback translations if loading fails
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
      // Missing navigation keys
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
      vendorManagement: "Vendor Management",
      systemHealth: "System Health"
    },
    sidebar: {
      clutchAdmin: "Clutch Admin",
      collapse: "Collapse"
    },
    language: {
      english: "English",
      arabic: "Arabic"
    },
    header: {
      language: "Language",
      search: "Search",
      notifications: "Notifications",
      myAccount: "My Account",
      profile: "Profile",
      settings: "Settings"
    },
    notifications: {
      noNotifications: "No notifications"
    },
    auth: {
      login: "Login",
      logout: "Logout",
      email: "Email",
      password: "Password",
      forgotPassword: "Forgot Password?",
      rememberMe: "Remember Me",
      signIn: "Sign In",
      signUp: "Sign Up",
      welcome: "Welcome",
      welcomeBack: "Welcome Back"
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
      // Missing dashboard keys
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

  // Merge fallback translations with loaded translations
  const mergeTranslations = (loaded: any, fallback: any) => {
    if (!loaded) {
      // Using fallback translations
      return fallback;
    }

    // Deep merge fallback into loaded translations
    const merged = { ...loaded };
    
    const deepMerge = (target: any, source: any) => {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) {
            target[key] = {};
          }
          deepMerge(target[key], source[key]);
        } else if (!target[key]) {
          target[key] = source[key];
        }
      }
    };

    deepMerge(merged, fallback);
    return merged;
  };

  enTranslations = mergeTranslations(enTranslations, fallbackTranslations);
  arTranslations = mergeTranslations(arTranslations, fallbackTranslations);

  return { enTranslations, arTranslations };
};
