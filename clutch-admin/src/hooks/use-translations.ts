'use client';

// Simple, bulletproof translation system with zero dependencies
type TranslationKey = string;

// Simple translation function that always works
function simpleTranslate(key: string): string {
  // Always return a string, never undefined
  if (!key || typeof key !== 'string') {
    return 'Invalid key';
  }
  
  // Simple key mapping - no complex nested lookups
  const translations: Record<string, string> = {
    // Common keys
    'common.loading': 'Loading...',
    'common.filter': 'Filter',
    'common.search': 'Search...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
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
    
    // Dashboard keys
    'dashboard.userAnalytics': 'User Analytics',
    'dashboard.revenueAnalytics': 'Revenue Analytics',
    'dashboard.fleetAnalytics': 'Fleet Analytics',
    'dashboard.totalUsers': 'Total Users',
    'dashboard.newUsers': 'New Users',
    'dashboard.retentionRate': 'Retention Rate',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.avgOrderValue': 'Average Order Value',
    'dashboard.totalVehicles': 'Total Vehicles',
    'dashboard.avgMileage': 'Average Mileage',
    'dashboard.utilizationRate': 'utilization rate',
    'dashboard.pageViews': 'page views',
    'dashboard.topLocations': 'Top Locations',
    'dashboard.deviceBreakdown': 'Device Breakdown',
    'dashboard.revenueBySource': 'Revenue by Source',
    'dashboard.revenueByRegion': 'Revenue by Region',
    'dashboard.roleDistribution': 'Role Distribution',
    'dashboard.roles': 'Roles',
    'dashboard.largestRole': 'Largest Role',
    'dashboard.smallestRole': 'Smallest Role',
    'dashboard.roleBreakdown': 'Role Breakdown',
    'dashboard.distribution': 'Distribution',
    'dashboard.userGrowthCohort': 'User Growth Cohort',
    'dashboard.monthlyCohorts': 'Monthly Cohorts',
    'dashboard.cohort': 'Cohort',
    'dashboard.retained': 'Retained',
    'dashboard.retentionTrend': 'Retention Trend',
    'dashboard.highRetention': 'High Retention',
    'dashboard.lowRetention': 'Low Retention',
    'dashboard.avgRetention': 'Average Retention',
    
    // Analytics keys
    'analytics.fromLastMonth': 'from last month',
    'analytics.activeVehicles': 'Active Vehicles',
    
    // Users keys
    'users.title': 'User Management',
    'users.description': 'Manage users, roles, and permissions',
    'users.addUser': 'Add User',
    'users.totalUsers': 'Total Users',
    'users.activeUsers': 'Active Users',
    'users.enterpriseClients': 'Enterprise Clients',
    'users.serviceProviders': 'Service Providers',
    'users.fromLastMonth': 'from last month',
    'users.loadingUsers': 'Loading users...',
    'users.allUsers': 'All Users',
    'users.b2cCustomers': 'B2C Customers',
    'users.role': 'Role',
    'users.status': 'Status',
    'users.lastLogin': 'Last Login',
    'users.created': 'Created',
    'users.viewProfile': 'View Profile',
    'users.manageRoles': 'Manage Roles',
    'users.suspendUser': 'Suspend User',
    
    // Fleet keys
    'fleet.title': 'Fleet Management',
    'fleet.description': 'Manage your vehicle fleet',
    'fleet.totalVehicles': 'Total Vehicles',
    'fleet.activeVehicles': 'Active Vehicles',
    'fleet.utilizationRate': 'Utilization Rate',
    'fleet.maintenanceDue': 'Maintenance Due',
    'fleet.fuelEfficiency': 'Fuel Efficiency',
    
    // Finance keys
    'finance.title': 'Finance',
    'finance.description': 'Financial management and reporting',
    'finance.totalRevenue': 'Total Revenue',
    'finance.monthlyRevenue': 'Monthly Revenue',
    'finance.expenses': 'Expenses',
    'finance.profit': 'Profit',
    'finance.margin': 'Margin',
    
    // Communication keys
    'communication.title': 'Communication',
    'communication.description': 'Communicate with your team and customers',
    'communication.messages': 'Messages',
    'communication.notifications': 'Notifications',
    'communication.email': 'Email',
    'communication.sms': 'SMS',
    'communication.push': 'Push',
    
    // Settings keys
    'settings.title': 'Settings',
    'settings.description': 'Configure your application settings',
    'settings.profile': 'Profile',
    'settings.account': 'Account',
    'settings.preferences': 'Preferences',
    'settings.security': 'Security',
    'settings.notifications': 'Notifications',
    
    // Navigation keys
    'navigation.dashboard': 'Dashboard',
    'navigation.users': 'User Management',
    'navigation.fleet': 'Fleet Management',
    'navigation.finance': 'Finance',
    'navigation.communication': 'Communication',
    'navigation.settings': 'Settings',
    'navigation.analytics': 'Analytics',
    'navigation.reports': 'Reports',
    'navigation.auditTrail': 'Audit Trail',
    'navigation.systemHealth': 'System Health',
    
    // Error keys
    'error.generic': 'An error occurred',
    'error.network': 'Network error',
    'error.unauthorized': 'Unauthorized access',
    'error.forbidden': 'Access forbidden',
    'error.notFound': 'Not found',
    'error.serverError': 'Server error',
    'error.timeout': 'Request timeout',
    
    // Success keys
    'success.saved': 'Saved successfully',
    'success.updated': 'Updated successfully',
    'success.deleted': 'Deleted successfully',
    'success.created': 'Created successfully',
    'success.sent': 'Sent successfully',
    'success.uploaded': 'Uploaded successfully',
  };
  
  // Return translation or fallback to key
  return translations[key] || key;
}

// Bulletproof hook that never fails
export function useTranslations() {
  return {
    t: simpleTranslate,
    language: 'en'
  };
}
