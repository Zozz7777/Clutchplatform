'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  t: (key: string, params?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<'en' | 'ar'>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('clutch-language') as 'en' | 'ar';
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (lang: 'en' | 'ar') => {
    setLanguageState(lang);
    localStorage.setItem('clutch-language', lang);
    
    // Update document direction for RTL support
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  };

  // Translation function with fallback
  const t = (key: string, params?: any) => {
    // Try to load translations from JSON files
    let translations: Record<string, string> = {};
    
    try {
      if (language === 'ar') {
        // Load Arabic translations
        const arTranslations = require('@/messages/ar.json');
        translations = arTranslations;
      } else {
        // Load English translations
        const enTranslations = require('@/messages/en.json');
        translations = enTranslations;
      }
    } catch (error) {
      console.warn('Failed to load translation files, using fallback:', error);
    }

    // Fallback translations if loading fails
    const fallbackTranslations: Record<string, string> = {
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.search': 'Search...',
      'common.filter': 'Filter',
      'common.export': 'Export',
      'common.import': 'Import',
      'common.refresh': 'Refresh',
      'common.close': 'Close',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.previous': 'Previous',
      'common.submit': 'Submit',
      'common.reset': 'Reset',
      'common.confirm': 'Confirm',
      'common.yes': 'Yes',
      'common.no': 'No',
      'navigation.dashboard': 'Dashboard',
      'navigation.userManagement': 'User Management',
      'navigation.fleetManagement': 'Fleet Management',
      'navigation.crm': 'CRM',
      'navigation.chat': 'Chat',
      'navigation.aiDashboard': 'AI Dashboard',
      'navigation.enterprise': 'Enterprise',
      'navigation.finance': 'Finance',
      'navigation.legal': 'Legal',
      'navigation.hr': 'HR',
      'navigation.featureFlags': 'Feature Flags',
      'navigation.communication': 'Communication',
      'navigation.analytics': 'Analytics',
      'navigation.mobileApps': 'Mobile Apps',
      'navigation.cms': 'CMS',
      'navigation.marketing': 'Marketing',
      'navigation.projects': 'Projects',
      'navigation.settings': 'Settings',
      'navigation.reports': 'Reports',
      'navigation.integrations': 'Integrations',
      'navigation.auditTrail': 'Audit Trail',
      'navigation.apiDocs': 'API Docs',
      'navigation.assets': 'Assets',
      'navigation.vendors': 'Vendors',
      'navigation.systemHealth': 'System Health',
      'auth.login': 'Login',
      'auth.logout': 'Logout',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.rememberMe': 'Remember Me',
      'auth.signIn': 'Sign In',
      'auth.signUp': 'Sign Up',
      'auth.welcome': 'Welcome',
      'auth.welcomeBack': 'Welcome Back',
      'auth.invalidCredentials': 'Invalid email or password',
      'auth.loginSuccess': 'Login successful',
      'auth.logoutSuccess': 'Logout successful',
      'auth.signingIn': 'Signing in...',
      'auth.errorOccurred': 'An error occurred. Please try again.',
      'language.english': 'English',
      'language.arabic': 'Arabic',
      'header.language': 'Language',
      'header.search': 'Search',
      'header.notifications': 'Notifications',
      'header.myAccount': 'My Account',
      'header.profile': 'Profile',
      'header.settings': 'Settings',
      'sidebar.clutchAdmin': 'Clutch Admin',
      'sidebar.collapse': 'Collapse',
      'sidebar.expand': 'Expand',
      'notifications.noNotifications': 'No notifications',
      'dashboard.title': 'Dashboard',
      'dashboard.overview': 'Overview',
      'dashboard.analytics': 'Analytics',
      'dashboard.metrics': 'Metrics',
      'dashboard.performance': 'Performance',
      'dashboard.revenue': 'Revenue',
      'dashboard.users': 'Users',
      'dashboard.orders': 'Orders',
      'dashboard.products': 'Products',
      'dashboard.totalRevenue': 'Total Revenue',
      'dashboard.totalUsers': 'Total Users',
      'dashboard.totalOrders': 'Total Orders',
      'dashboard.totalProducts': 'Total Products',
      'dashboard.loadingDashboard': 'Loading Dashboard...',
      'dashboard.welcomeMessage': 'Welcome to Clutch Admin',
      'dashboard.generateReport': 'Generate Report',
      'dashboard.exportData': 'Export Data',
      'dashboard.refresh': 'Refresh',
      'dashboard.realtimeActivityFeed': 'Real-time Activity Feed',
      'dashboard.latestActionsAndEvents': 'Latest Actions and Events',
      'dashboard.quickActions': 'Quick Actions',
      'dashboard.commonAdministrativeTasks': 'Common Administrative Tasks',
      'dashboard.fleetStatus': 'Fleet Status',
      'dashboard.realtimeFleetMonitoring': 'Real-time Fleet Monitoring',
      'dashboard.performanceMetrics': 'Performance Metrics',
      'dashboard.apiUptimeRequestsErrorsSessions': 'API Uptime, Requests, Errors, Sessions',
      'dashboard.apiUptime': 'API Uptime',
      'dashboard.requestRate': 'Request Rate',
      'dashboard.errorRate': 'Error Rate',
      'dashboard.activeSessions': 'Active Sessions',
      'dashboard.systemAlerts': 'System Alerts',
      'dashboard.criticalNotificationsRequiringAttention': 'Critical Notifications Requiring Attention',
      'dashboard.highErrorRate': 'High Error Rate',
      'dashboard.apiErrorsIncreased': 'API Errors Increased',
      'dashboard.maintenanceWindow': 'Maintenance Window',
      'dashboard.scheduledForTonight': 'Scheduled for Tonight',
      'dashboard.systemHealthy': 'System Healthy',
      'dashboard.allServicesOperational': 'All Services Operational',
      'dashboard.businessIntelligence': 'Business Intelligence',
      'dashboard.advancedAnalyticsAndPredictiveInsights': 'Advanced Analytics and Predictive Insights',
      'dashboard.noLocation': 'No location data',
      'dashboard.noAlerts': 'No alerts at this time',
      'dashboard.loadingDashboard': 'Loading dashboard...',
      'dashboard.welcomeToClutch': 'Welcome to your Clutch Admin dashboard',
      'analytics.title': 'Analytics',
      'analytics.overview': 'Analytics Overview',
      'analytics.description': 'Comprehensive analytics and insights for your platform',
      'analytics.loadingAnalytics': 'Loading analytics...',
      'analytics.failedToLoadAnalytics': 'Failed to load analytics data',
      'analytics.generateReport': 'Generate Report',
      'analytics.exportData': 'Export Data',
      'analytics.refresh': 'Refresh',
      'analytics.searchAnalytics': 'Search analytics...',
      'analytics.filterByTimeRange': 'Filter by time range',
      'analytics.timeRange': 'Time Range',
      'analytics.last7Days': 'Last 7 days',
      'analytics.last30Days': 'Last 30 days',
      'analytics.last90Days': 'Last 90 days',
      'analytics.lastYear': 'Last year',
      'analytics.customRange': 'Custom range',
      'analytics.userAnalytics': 'User Analytics',
      'analytics.revenueAnalytics': 'Revenue Analytics',
      'analytics.fleetAnalytics': 'Fleet Analytics',
      'analytics.engagementAnalytics': 'Engagement Analytics',
      'analytics.reports': 'Reports',
      'analytics.totalUsers': 'Total Users',
      'analytics.activeUsers': 'Active Users',
      'analytics.newUsers': 'New Users',
      'analytics.userGrowth': 'User Growth',
      'analytics.totalRevenue': 'Total Revenue',
      'analytics.monthlyRecurringRevenue': 'Monthly Recurring Revenue',
      'analytics.averageRevenuePerUser': 'Average Revenue Per User',
      'analytics.revenueGrowth': 'Revenue Growth',
      'analytics.totalFleet': 'Total Fleet',
      'analytics.activeFleet': 'Active Fleet',
      'analytics.fleetUtilization': 'Fleet Utilization',
      'analytics.fleetGrowth': 'Fleet Growth',
      'analytics.totalSessions': 'Total Sessions',
      'analytics.averageSessionDuration': 'Average Session Duration',
      'analytics.bounceRate': 'Bounce Rate',
      'analytics.engagementRate': 'Engagement Rate',
      'users.title': 'User Management',
      'users.overview': 'User Overview',
      'users.description': 'Manage users, roles, and permissions',
      'users.loadingUsers': 'Loading users...',
      'users.failedToLoadUsers': 'Failed to load users',
      'users.addUser': 'Add User',
      'users.totalUsers': 'Total Users',
      'users.activeUsers': 'Active Users',
      'users.suspendedUsers': 'Suspended Users',
      'users.searchUsers': 'Search users...',
      'users.filterByStatus': 'Filter by status',
      'users.filterByRole': 'Filter by role',
      'users.allStatuses': 'All Statuses',
      'users.allRoles': 'All Roles',
      'users.active': 'Active',
      'users.suspended': 'Suspended',
      'users.pending': 'Pending',
      'users.platformAdmin': 'Platform Admin',
      'users.enterpriseClient': 'Enterprise Client',
      'users.serviceProvider': 'Service Provider',
      'users.b2cCustomer': 'B2C Customer',
      'users.b2c': 'B2C',
      'users.b2b': 'B2B',
      'users.providers': 'Providers',
      'users.name': 'Name',
      'users.email': 'Email',
      'users.role': 'Role',
      'users.status': 'Status',
      'users.lastLogin': 'Last Login',
      'users.createdAt': 'Created At',
      'users.actions': 'Actions',
      'users.editUser': 'Edit User',
      'users.deleteUser': 'Delete User',
      'users.suspendUser': 'Suspend User',
      'users.activateUser': 'Activate User',
      'users.viewProfile': 'View Profile',
      'users.sendEmail': 'Send Email',
      'users.noUsersFound': 'No users found',
      'users.userGrowth': 'User Growth',
      'users.engagement': 'Engagement',
      'users.onboarding': 'Onboarding',
      'users.roleDistribution': 'Role Distribution',
      'users.churnRisk': 'Churn Risk'
    };

    // Helper function to get nested value from object
    const getNestedValue = (obj: any, path: string) => {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    // Try to get translation from loaded translations first, then fallback
    let translation = getNestedValue(translations, key) || fallbackTranslations[key] || key;
    
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{${paramKey}}`, params[paramKey]);
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
