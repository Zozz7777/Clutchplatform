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
    email: "Email",
    enterPassword: "Enter your password",
    signingIn: "Signing in...",
    clutchAdmin: "Clutch Admin",
    forgotPassword: "Forgot Password?",
    rememberMe: "Remember Me",
    signInToDrive: "Sign in to drive the automotive revolution",
    invalidCredentials: "Invalid email or password",
    errorOccurred: "An error occurred",
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
    advancedAnalyticsAndPredictiveInsights: "Advanced Analytics and Predictive Insights",
    // Extended dashboard keys
    newChat: "New Chat",
    conversations: "Conversations",
    typeAMessage: "Type a message...",
    loadingCmsData: "Loading CMS data...",
    contentManagementSystem: "Content Management System",
    manageWebsiteContent: "Manage website content, pages, and media",
    newContent: "New Content",
    uploadMedia: "Upload Media",
    totalContent: "Total Content",
    published: "Published",
    mediaFiles: "Media Files",
    images: "Images",
    categories: "Categories",
    contentCategories: "Content Categories",
    totalViews: "Total Views",
    allTimeViews: "All Time Views",
    content: "Content",
    media: "Media",
    contentManagement: "Content Management",
    managePagesPosts: "Manage pages, posts, and articles",
    searchContent: "Search content...",
    allStatus: "All Status",
    draft: "Draft",
    scheduled: "Scheduled",
    archived: "Archived",
    allTypes: "All Types",
    pages: "Pages",
    posts: "Posts",
    articles: "Articles",
    helpDocs: "Help Docs",
    by: "by",
    views: "views",
    created: "Created",
    updated: "Updated",
    actions: "Actions",
    viewContent: "View Content",
    editContent: "Edit Content",
    duplicate: "Duplicate",
    publish: "Publish",
    unpublish: "Unpublish",
    archive: "Archive",
    noContentFound: "No content found",
    mediaLibrary: "Media Library",
    manageImagesVideos: "Manage images, videos, and other media files",
    uploaded: "Uploaded",
    uses: "uses",
    view: "View",
    download: "Download",
    editDetails: "Edit Details",
    copyUrl: "Copy URL",
    delete: "Delete",
    noMediaFilesFound: "No media files found",
    organizeContentWithCategories: "Organize content with categories and tags",
    items: "items",
    subcategories: "subcategories",
    slug: "Slug",
    editCategory: "Edit Category",
    addSubcategory: "Add Subcategory",
    deleteCategory: "Delete Category",
    noCategoriesFound: "No categories found",
    purchaseDate: "Purchase Date",
    currentValueEgp: "Current Value (EGP)",
    all: "All",
    active: "Active",
    inactive: "Inactive",
    maintenance: "Maintenance",
    retired: "Retired",
    currentValue: "Current Value",
    location: "Location",
    fromLastMonth: "from last month",
    noLocation: "No location data",
    noAlerts: "No alerts at this time",
    communication: "Communication",
    communicationDescription: "Manage notifications, chat channels, and support tickets",
    settings: "Settings",
    newNotification: "New Notification",
    totalNotifications: "Total Notifications",
    activeChannels: "Active Channels",
    unreadMessages: "unread messages",
    openTickets: "Open Tickets",
    avgResponseTime: "Avg Response Time",
    excellent: "Excellent",
    good: "Good",
    needsWork: "Needs Work",
    seoCms: "SEO & CMS",
    manageSeoOptimization: "Manage SEO optimization and content",
    refreshing: "Refreshing..."
  },
  chat: {
    failedToLoadChatData: "Failed to load chat data",
    failedToSendMessage: "Failed to send message",
    title: "Chat & Messaging",
    description: "Communicate with your team and customers",
    online: "Online",
    offline: "Offline",
    you: "You"
  },
  assets: {
    currentUser: "Current User",
    selectedEmployee: "Selected Employee",
    totalAssets: "Total Assets",
    active: "Active",
    inactive: "Inactive",
    maintenanceDue: "Maintenance Due",
    next30Days: "Next 30 Days",
    assignedAssets: "Assigned Assets",
    title: "Asset Management",
    description: "Track and manage company assets",
    unassigned: "Unassigned",
    searchAssets: "Search assets...",
    filterByType: "Filter by type..."
  },
  downtime: {
    other: "Other",
    downtimeImpact: "Downtime Impact",
    lostRevenueHoursDescription: "Revenue lost due to vehicle downtime",
    lostRevenueHours: "Lost Revenue Hours",
    topAffectedVehicles: "Top Affected Vehicles",
    exportReport: "Export Report",
    downtimeInsights: "Downtime Insights",
    totalDowntimeHours: "Total Downtime Hours",
    hours: "hours",
    revenueImpactingDowntime: "Revenue Impacting Downtime",
    totalRevenueImpact: "Total Revenue Impact",
    averageDowntimePerVehicle: "Average Downtime Per Vehicle",
    topDowntimeReason: "Top Downtime Reason",
    revenueImpactAboveTarget: "Revenue impact above target threshold"
  },
  collaboration: {
    title: "Real-time Collaboration",
    description: "Collaborate with your team in real-time",
    activeNow: "Active Now",
    recentActivity: "Recent Activity",
    quickComment: "Quick Comment",
    addComment: "Add a comment..."
  },
  chat: {
    title: "Chat",
    connected: "Connected",
    disconnected: "Disconnected",
    participants: "participants",
    voiceCall: "Voice call started with",
    videoCall: "Video call started with",
    muted: "Muted",
    unmuted: "Unmuted",
    recordingStarted: "Recording started",
    recordingStopped: "Recording stopped",
    typeMessage: "Type a message...",
    noChatSelected: "No chat selected",
    selectChatToStart: "Select a chat to start messaging"
  },
  notifications: {
    noNotifications: "No notifications"
  },
  communication: {
    failedToLoadCommunicationData: "Failed to load communication data",
    notifications: "Notifications",
    chatChannels: "Chat Channels",
    supportTickets: "Support Tickets",
    deliveryRate: "Delivery Rate",
    delivery: "Delivery",
    openRate: "Open Rate",
    clickRate: "Click Rate",
    responseTime: "Response Time"
  },
  sla: {
    compliance: "SLA Compliance",
    loadingData: "Loading SLA compliance data",
    unableToLoad: "Unable to load SLA compliance data",
    overallCompliance: "Overall Compliance",
    totalIncidents: "Total Incidents",
    overallSlaCompliance: "Overall SLA Compliance",
    statusDistribution: "Status Distribution",
    compliant: "Compliant",
    warning: "Warning",
    breach: "Breach",
    serviceMetrics: "Service Metrics",
    meanTimeToRecovery: "Mean Time To Recovery"
  },
  seo: {
    overview: "Overview",
    pages: "Pages",
    keywords: "Keywords",
    analytics: "Analytics",
    overallScore: "Overall Score",
    pagesAnalyzed: "Pages Analyzed",
    issuesFound: "Issues Found",
    suggestions: "Suggestions",
    seoScoreDistribution: "SEO Score Distribution",
    quickActions: "Quick Actions",
    pageTitle: "Page Title",
    metaDescription: "Meta Description",
    keywords: "Keywords",
    addKeyword: "Add Keyword",
    issues: "Issues",
    suggestions: "Suggestions",
    keywordResearch: "Keyword Research",
    research: "Research",
    organicTraffic: "Organic Traffic",
    averagePosition: "Average Position"
  }
};

export function useTranslations() {
  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [useTranslations] Hook called from:', new Error().stack?.split('\n')[2]?.trim());
  }
  
  const { language } = useLanguage();
  
  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('🌐 [useTranslations] Current language:', language);
  }

  // Use fallback translations for now
  const translations = fallbackTranslations;
  
  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('📚 [useTranslations] Using fallback translations:', !!translations);
  }

  const t = (key: TranslationKey): string => {
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('🔑 [useTranslations] Translation key requested:', key);
    }
    
    // Check if translations are available
    if (!translations) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [useTranslations] No translations available for key:', key);
      }
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
        value = value[k] as Record<string, unknown>;
        if (key === 'common.loading') {
          // Found key
        }
      } else {
        // Translation key not found
        if (process.env.NODE_ENV === 'development') {
          console.warn('❌ [useTranslations] Translation key not found:', key, 'at segment:', k);
        }
        
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
    
    return result;
  };

  return { t, language };
}
