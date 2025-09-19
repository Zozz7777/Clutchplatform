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
    console.warn('Failed to load translation files, using fallback:', error);
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
      vendors: "Vendors"
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
      totalProducts: "Total Products"
    }
  };

  // Use fallback if translations failed to load or are incomplete
  if (!enTranslations || !enTranslations.common || !enTranslations.common.loading) {
    console.warn('Using fallback translations for English');
    enTranslations = fallbackTranslations;
  }

  if (!arTranslations || !arTranslations.common || !arTranslations.common.loading) {
    console.warn('Using fallback translations for Arabic');
    arTranslations = fallbackTranslations;
  }

  // Ensure common object has all required keys
  const ensureCommonKeys = (translations: any) => {
    if (!translations.common) {
      translations.common = {};
    }
    
    const requiredKeys = {
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
    };

    Object.keys(requiredKeys).forEach(key => {
      if (!translations.common[key]) {
        translations.common[key] = requiredKeys[key as keyof typeof requiredKeys];
      }
    });
  };

  ensureCommonKeys(enTranslations);
  ensureCommonKeys(arTranslations);

  return { enTranslations, arTranslations };
};
