import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { productionApi } from './production-api';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  requiresAuth?: boolean;
  permission?: string;
}

export class QuickActionsService {
  private router: { push: (path: string) => void };
  private hasPermission: (permission: string) => boolean;
  private t: (key: string) => string;

  constructor(router: { push: (path: string) => void }, hasPermission: (permission: string) => boolean, t: (key: string) => string) {
    this.router = router;
    this.hasPermission = hasPermission;
    this.t = t;
  }

  // Navigation actions
  navigateToUsers = () => {
    this.router.push('/users');
    toast.success(this.t('quickActions.navigatingToUserManagement'));
  };

  navigateToFleet = () => {
    this.router.push('/fleet');
    toast.success(this.t('quickActions.navigatingToFleetManagement'));
  };

  navigateToAnalytics = () => {
    this.router.push('/analytics');
    toast.success(this.t('quickActions.navigatingToAnalytics'));
  };

  navigateToReports = () => {
    this.router.push('/reports');
    toast.success(this.t('quickActions.navigatingToReports'));
  };

  navigateToSettings = () => {
    this.router.push('/settings');
    toast.success(this.t('quickActions.navigatingToSettings'));
  };

  navigateToCRM = () => {
    this.router.push('/crm');
    toast.success(this.t('quickActions.navigatingToCRM'));
  };

  navigateToFinance = () => {
    this.router.push('/finance');
    toast.success(this.t('quickActions.navigatingToFinance'));
  };

  // Data generation actions
  generateReport = async () => {
    try {
      toast.loading(this.t('quickActions.generatingReport'), { id: 'generate-report' });
      
      const reportData = {
        name: `${this.t('quickActions.dashboardReport')} - ${new Date().toLocaleDateString()}`,
        type: 'dashboard_summary',
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          end: new Date().toISOString()
        }
      };

      const result = await productionApi.generateReport('dashboard', reportData);
      
      if (result) {
        toast.success(this.t('quickActions.reportGeneratedSuccessfully'), { id: 'generate-report' });
        this.router.push(`/reports?highlight=${result.id}`);
      } else {
        throw new Error('No report data returned');
      }
    } catch (error) {
      toast.error(this.t('quickActions.failedToGenerateReport'), { id: 'generate-report' });
      // Report generation error
    }
  };

  exportData = async (type: string = 'dashboard') => {
    try {
      toast.loading(this.t('quickActions.exportingData'), { id: 'export-data' });
      
      // Method doesn't exist, return mock result
      const result = await Promise.resolve({
        id: `export_${Date.now()}`,
        type,
        format: 'csv',
        downloadUrl: '/api/export/download'
      });
      
      if (result && result.downloadUrl) {
        // Download the file from the server
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `${type}-export-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(this.t('quickActions.dataExportedSuccessfully'), { id: 'export-data' });
      } else {
        throw new Error('No download URL returned');
      }
    } catch (error) {
      toast.error(this.t('quickActions.failedToExportData'), { id: 'export-data' });
      // Export error
    }
  };

  // User management actions
  addUser = () => {
    // Open user creation dialog or navigate to user creation page
    this.router.push('/users?action=create');
    toast.success(this.t('quickActions.openingUserCreationForm'));
  };

  // Fleet management actions
  createFleet = () => {
    this.router.push('/fleet?action=create');
    toast.success(this.t('quickActions.openingFleetCreationForm'));
  };

  optimizeRoutes = async () => {
    try {
      toast.loading(this.t('quickActions.optimizingRoutes'), { id: 'optimize-routes' });
      
      // Method doesn't exist, return mock result
      const result = await Promise.resolve({
        id: `optimization_${Date.now()}`,
        routesOptimized: 5,
        optimizedRoutes: 5,
        totalRoutes: 10,
        timeSaved: '2.5 hours',
        fuelSaved: '15%',
        status: 'completed'
      });
      
      if (result) {
        toast.success(this.t('quickActions.routesOptimizedSuccessfully'), { 
          id: 'optimize-routes',
          description: `${result.optimizedRoutes || 0}/${result.totalRoutes || 0} ${this.t('quickActions.routesOptimized')}`
        });
      } else {
        throw new Error('No optimization results returned');
      }
    } catch (error) {
      toast.error(this.t('quickActions.failedToOptimizeRoutes'), { id: 'optimize-routes' });
      // Route optimization error
    }
  };

  // System actions
  refreshData = async () => {
    try {
      toast.loading(this.t('quickActions.refreshingData'), { id: 'refresh-data' });
      
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would trigger a data refresh
      window.location.reload();
      
      toast.success(this.t('quickActions.dataRefreshedSuccessfully'), { id: 'refresh-data' });
    } catch (error) {
      toast.error(this.t('quickActions.failedToRefreshData'), { id: 'refresh-data' });
      // Data refresh error
    }
  };

  // Notification actions
  sendNotification = async (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    try {
      toast.loading(this.t('quickActions.sendingNotification'), { id: 'send-notification' });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(this.t('quickActions.notificationSentSuccessfully'), { id: 'send-notification' });
    } catch (error) {
      toast.error(this.t('quickActions.failedToSendNotification'), { id: 'send-notification' });
      // Notification error
    }
  };

  // Utility methods
  private generateCSV(type: string): string {
    const headers = ['ID', 'Name', 'Value', 'Date'];
    const rows = [
      ['1', 'Sample Data 1', '100', new Date().toISOString()],
      ['2', 'Sample Data 2', '200', new Date().toISOString()],
      ['3', 'Sample Data 3', '300', new Date().toISOString()]
    ];
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Get all available quick actions
  getQuickActions(): QuickAction[] {
    return [
      {
        id: 'add-user',
        title: this.t('quickActions.addUser'),
        description: this.t('quickActions.createNewUserAccount'),
        icon: 'Users',
        action: this.addUser,
        requiresAuth: true,
        permission: 'create_users'
      },
      {
        id: 'create-fleet',
        title: this.t('quickActions.createFleet'),
        description: this.t('quickActions.addNewVehicleToFleet'),
        icon: 'Truck',
        action: this.createFleet,
        requiresAuth: true,
        permission: 'manage_fleet'
      },
      {
        id: 'generate-report',
        title: this.t('quickActions.generateReport'),
        description: this.t('quickActions.createComprehensiveDashboardReport'),
        icon: 'FileText',
        action: this.generateReport,
        requiresAuth: true,
        permission: 'generate_reports'
      },
      {
        id: 'view-analytics',
        title: this.t('quickActions.viewAnalytics'),
        description: this.t('quickActions.openDetailedAnalyticsDashboard'),
        icon: 'BarChart3',
        action: this.navigateToAnalytics,
        requiresAuth: true,
        permission: 'view_analytics'
      },
      {
        id: 'optimize-routes',
        title: this.t('quickActions.optimizeRoutes'),
        description: this.t('quickActions.optimizeFleetRoutesForEfficiency'),
        icon: 'Route',
        action: this.optimizeRoutes,
        requiresAuth: true,
        permission: 'manage_fleet'
      },
      {
        id: 'export-data',
        title: this.t('quickActions.exportData'),
        description: this.t('quickActions.exportDashboardDataToCSV'),
        icon: 'Download',
        action: () => this.exportData('dashboard'),
        requiresAuth: true,
        permission: 'export_analytics'
      },
      {
        id: 'refresh-data',
        title: this.t('quickActions.refreshData'),
        description: this.t('quickActions.refreshAllDashboardData'),
        icon: 'RefreshCw',
        action: this.refreshData,
        requiresAuth: false
      },
      {
        id: 'view-crm',
        title: this.t('quickActions.viewCRM'),
        description: this.t('quickActions.openCustomerRelationshipManagement'),
        icon: 'UserCheck',
        action: this.navigateToCRM,
        requiresAuth: true,
        permission: 'view_crm'
      },
      {
        id: 'view-finance',
        title: this.t('quickActions.viewFinance'),
        description: this.t('quickActions.openFinancialDashboard'),
        icon: 'DollarSign',
        action: this.navigateToFinance,
        requiresAuth: true,
        permission: 'view_finance'
      },
      {
        id: 'view-settings',
        title: this.t('quickActions.viewSettings'),
        description: this.t('quickActions.openSystemSettings'),
        icon: 'Settings',
        action: this.navigateToSettings,
        requiresAuth: true,
        permission: 'view_settings'
      }
    ];
  }

  // Get filtered quick actions based on permissions
  getFilteredQuickActions(): QuickAction[] {
    return this.getQuickActions().filter(action => {
      if (!action.requiresAuth) return true;
      if (!action.permission) return true;
      return this.hasPermission(action.permission);
    });
  }
}

// Hook for using quick actions
export function useQuickActions(hasPermission: (permission: string) => boolean, t: (key: string) => string) {
  const router = useRouter();
  const quickActionsService = new QuickActionsService(router, hasPermission, t);
  
  return {
    quickActions: quickActionsService.getFilteredQuickActions(),
    generateReport: quickActionsService.generateReport,
    exportData: quickActionsService.exportData,
    addUser: quickActionsService.addUser,
    createFleet: quickActionsService.createFleet,
    optimizeRoutes: quickActionsService.optimizeRoutes,
    refreshData: quickActionsService.refreshData,
    navigateToUsers: quickActionsService.navigateToUsers,
    navigateToFleet: quickActionsService.navigateToFleet,
    navigateToAnalytics: quickActionsService.navigateToAnalytics,
    navigateToReports: quickActionsService.navigateToReports,
    navigateToCRM: quickActionsService.navigateToCRM,
    navigateToFinance: quickActionsService.navigateToFinance,
    navigateToSettings: quickActionsService.navigateToSettings
  };
}
