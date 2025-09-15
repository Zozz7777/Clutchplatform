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
  private router: any;
  private hasPermission: (permission: string) => boolean;

  constructor(router: any, hasPermission: (permission: string) => boolean) {
    this.router = router;
    this.hasPermission = hasPermission;
  }

  // Navigation actions
  navigateToUsers = () => {
    this.router.push('/users');
    toast.success('Navigating to User Management');
  };

  navigateToFleet = () => {
    this.router.push('/fleet');
    toast.success('Navigating to Fleet Management');
  };

  navigateToAnalytics = () => {
    this.router.push('/analytics');
    toast.success('Navigating to Analytics');
  };

  navigateToReports = () => {
    this.router.push('/reports');
    toast.success('Navigating to Reports');
  };

  navigateToSettings = () => {
    this.router.push('/settings');
    toast.success('Navigating to Settings');
  };

  navigateToCRM = () => {
    this.router.push('/crm');
    toast.success('Navigating to CRM');
  };

  navigateToFinance = () => {
    this.router.push('/finance');
    toast.success('Navigating to Finance');
  };

  // Data generation actions
  generateReport = async () => {
    try {
      toast.loading('Generating report...', { id: 'generate-report' });
      
      const reportData = {
        name: `Dashboard Report - ${new Date().toLocaleDateString()}`,
        type: 'dashboard_summary',
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          end: new Date().toISOString()
        }
      };

      const result = await productionApi.generateReport(reportData);
      
      if (result) {
        toast.success('Report generated successfully!', { id: 'generate-report' });
        this.router.push(`/reports?highlight=${result.id}`);
      } else {
        throw new Error('No report data returned');
      }
    } catch (error) {
      toast.error('Failed to generate report', { id: 'generate-report' });
      console.error('Report generation error:', error);
    }
  };

  exportData = async (type: string = 'dashboard') => {
    try {
      toast.loading('Exporting data...', { id: 'export-data' });
      
      const result = await productionApi.exportData(type, 'csv');
      
      if (result && result.downloadUrl) {
        // Download the file from the server
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `${type}-export-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Data exported successfully!', { id: 'export-data' });
      } else {
        throw new Error('No download URL returned');
      }
    } catch (error) {
      toast.error('Failed to export data', { id: 'export-data' });
      console.error('Export error:', error);
    }
  };

  // User management actions
  addUser = () => {
    // Open user creation dialog or navigate to user creation page
    this.router.push('/users?action=create');
    toast.success('Opening user creation form');
  };

  // Fleet management actions
  createFleet = () => {
    this.router.push('/fleet?action=create');
    toast.success('Opening fleet creation form');
  };

  optimizeRoutes = async () => {
    try {
      toast.loading('Optimizing routes...', { id: 'optimize-routes' });
      
      const result = await productionApi.optimizeRoutes();
      
      if (result) {
        toast.success(`Routes optimized! Saved ${result.timeSaved || 'time'} and ${result.fuelSaved || 'fuel'}`, { 
          id: 'optimize-routes',
          description: `${result.optimizedRoutes || 0}/${result.totalRoutes || 0} routes optimized`
        });
      } else {
        throw new Error('No optimization results returned');
      }
    } catch (error) {
      toast.error('Failed to optimize routes', { id: 'optimize-routes' });
      console.error('Route optimization error:', error);
    }
  };

  // System actions
  refreshData = async () => {
    try {
      toast.loading('Refreshing data...', { id: 'refresh-data' });
      
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would trigger a data refresh
      window.location.reload();
      
      toast.success('Data refreshed successfully!', { id: 'refresh-data' });
    } catch (error) {
      toast.error('Failed to refresh data', { id: 'refresh-data' });
      console.error('Data refresh error:', error);
    }
  };

  // Notification actions
  sendNotification = async (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    try {
      toast.loading('Sending notification...', { id: 'send-notification' });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Notification sent successfully!', { id: 'send-notification' });
    } catch (error) {
      toast.error('Failed to send notification', { id: 'send-notification' });
      console.error('Notification error:', error);
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
        title: 'Add User',
        description: 'Create a new user account',
        icon: 'Users',
        action: this.addUser,
        requiresAuth: true,
        permission: 'create_users'
      },
      {
        id: 'create-fleet',
        title: 'Create Fleet',
        description: 'Add a new vehicle to the fleet',
        icon: 'Truck',
        action: this.createFleet,
        requiresAuth: true,
        permission: 'manage_fleet'
      },
      {
        id: 'generate-report',
        title: 'Generate Report',
        description: 'Create a comprehensive dashboard report',
        icon: 'FileText',
        action: this.generateReport,
        requiresAuth: true,
        permission: 'generate_reports'
      },
      {
        id: 'view-analytics',
        title: 'View Analytics',
        description: 'Open detailed analytics dashboard',
        icon: 'BarChart3',
        action: this.navigateToAnalytics,
        requiresAuth: true,
        permission: 'view_analytics'
      },
      {
        id: 'optimize-routes',
        title: 'Optimize Routes',
        description: 'Optimize fleet routes for efficiency',
        icon: 'Route',
        action: this.optimizeRoutes,
        requiresAuth: true,
        permission: 'manage_fleet'
      },
      {
        id: 'export-data',
        title: 'Export Data',
        description: 'Export dashboard data to CSV',
        icon: 'Download',
        action: () => this.exportData('dashboard'),
        requiresAuth: true,
        permission: 'export_analytics'
      },
      {
        id: 'refresh-data',
        title: 'Refresh Data',
        description: 'Refresh all dashboard data',
        icon: 'RefreshCw',
        action: this.refreshData,
        requiresAuth: false
      },
      {
        id: 'view-crm',
        title: 'View CRM',
        description: 'Open customer relationship management',
        icon: 'UserCheck',
        action: this.navigateToCRM,
        requiresAuth: true,
        permission: 'view_crm'
      },
      {
        id: 'view-finance',
        title: 'View Finance',
        description: 'Open financial dashboard',
        icon: 'DollarSign',
        action: this.navigateToFinance,
        requiresAuth: true,
        permission: 'view_finance'
      },
      {
        id: 'view-settings',
        title: 'View Settings',
        description: 'Open system settings',
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
export function useQuickActions(hasPermission: (permission: string) => boolean) {
  const router = useRouter();
  const quickActionsService = new QuickActionsService(router, hasPermission);
  
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
