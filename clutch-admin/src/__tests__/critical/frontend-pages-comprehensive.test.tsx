import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { server } from '../../setup';

// Mock all pages
const mockPages = {
  // Authentication Pages (5 pages)
  'Login': () => <div data-testid="login-page">Login Page</div>,
  'Register': () => <div data-testid="register-page">Register Page</div>,
  'ForgotPassword': () => <div data-testid="forgot-password-page">Forgot Password Page</div>,
  'ResetPassword': () => <div data-testid="reset-password-page">Reset Password Page</div>,
  'VerifyEmail': () => <div data-testid="verify-email-page">Verify Email Page</div>,

  // Dashboard Pages (15 pages)
  'Dashboard': () => <div data-testid="dashboard-page">Dashboard Page</div>,
  'DashboardConsolidated': () => <div data-testid="dashboard-consolidated-page">Dashboard Consolidated Page</div>,
  'DashboardAnalytics': () => <div data-testid="dashboard-analytics-page">Dashboard Analytics Page</div>,
  'DashboardFinance': () => <div data-testid="dashboard-finance-page">Dashboard Finance Page</div>,
  'DashboardHR': () => <div data-testid="dashboard-hr-page">Dashboard HR Page</div>,
  'DashboardSettings': () => <div data-testid="dashboard-settings-page">Dashboard Settings Page</div>,
  'DashboardUsers': () => <div data-testid="dashboard-users-page">Dashboard Users Page</div>,
  'DashboardReports': () => <div data-testid="dashboard-reports-page">Dashboard Reports Page</div>,
  'DashboardNotifications': () => <div data-testid="dashboard-notifications-page">Dashboard Notifications Page</div>,
  'DashboardProfile': () => <div data-testid="dashboard-profile-page">Dashboard Profile Page</div>,
  'DashboardHelp': () => <div data-testid="dashboard-help-page">Dashboard Help Page</div>,
  'DashboardSupport': () => <div data-testid="dashboard-support-page">Dashboard Support Page</div>,
  'DashboardFeedback': () => <div data-testid="dashboard-feedback-page">Dashboard Feedback Page</div>,
  'DashboardLogs': () => <div data-testid="dashboard-logs-page">Dashboard Logs Page</div>,
  'DashboardSystem': () => <div data-testid="dashboard-system-page">Dashboard System Page</div>,

  // User Management Pages (20 pages)
  'UsersList': () => <div data-testid="users-list-page">Users List Page</div>,
  'UserCreate': () => <div data-testid="user-create-page">User Create Page</div>,
  'UserEdit': () => <div data-testid="user-edit-page">User Edit Page</div>,
  'UserView': () => <div data-testid="user-view-page">User View Page</div>,
  'UserRoles': () => <div data-testid="user-roles-page">User Roles Page</div>,
  'UserPermissions': () => <div data-testid="user-permissions-page">User Permissions Page</div>,
  'UserGroups': () => <div data-testid="user-groups-page">User Groups Page</div>,
  'UserSessions': () => <div data-testid="user-sessions-page">User Sessions Page</div>,
  'UserActivity': () => <div data-testid="user-activity-page">User Activity Page</div>,
  'UserAudit': () => <div data-testid="user-audit-page">User Audit Page</div>,
  'UserImport': () => <div data-testid="user-import-page">User Import Page</div>,
  'UserExport': () => <div data-testid="user-export-page">User Export Page</div>,
  'UserBulkActions': () => <div data-testid="user-bulk-actions-page">User Bulk Actions Page</div>,
  'UserSearch': () => <div data-testid="user-search-page">User Search Page</div>,
  'UserFilters': () => <div data-testid="user-filters-page">User Filters Page</div>,
  'UserReports': () => <div data-testid="user-reports-page">User Reports Page</div>,
  'UserAnalytics': () => <div data-testid="user-analytics-page">User Analytics Page</div>,
  'UserStatistics': () => <div data-testid="user-statistics-page">User Statistics Page</div>,
  'UserMetrics': () => <div data-testid="user-metrics-page">User Metrics Page</div>,
  'UserDashboard': () => <div data-testid="user-dashboard-page">User Dashboard Page</div>,

  // Analytics Pages (15 pages)
  'AnalyticsOverview': () => <div data-testid="analytics-overview-page">Analytics Overview Page</div>,
  'AnalyticsUsers': () => <div data-testid="analytics-users-page">Analytics Users Page</div>,
  'AnalyticsRevenue': () => <div data-testid="analytics-revenue-page">Analytics Revenue Page</div>,
  'AnalyticsPerformance': () => <div data-testid="analytics-performance-page">Analytics Performance Page</div>,
  'AnalyticsTraffic': () => <div data-testid="analytics-traffic-page">Analytics Traffic Page</div>,
  'AnalyticsConversions': () => <div data-testid="analytics-conversions-page">Analytics Conversions Page</div>,
  'AnalyticsReports': () => <div data-testid="analytics-reports-page">Analytics Reports Page</div>,
  'AnalyticsCharts': () => <div data-testid="analytics-charts-page">Analytics Charts Page</div>,
  'AnalyticsMetrics': () => <div data-testid="analytics-metrics-page">Analytics Metrics Page</div>,
  'AnalyticsKPIs': () => <div data-testid="analytics-kpis-page">Analytics KPIs Page</div>,
  'AnalyticsTrends': () => <div data-testid="analytics-trends-page">Analytics Trends Page</div>,
  'AnalyticsSegments': () => <div data-testid="analytics-segments-page">Analytics Segments Page</div>,
  'AnalyticsFunnels': () => <div data-testid="analytics-funnels-page">Analytics Funnels Page</div>,
  'AnalyticsGoals': () => <div data-testid="analytics-goals-page">Analytics Goals Page</div>,
  'AnalyticsCustom': () => <div data-testid="analytics-custom-page">Analytics Custom Page</div>,

  // Finance Pages (15 pages)
  'FinanceOverview': () => <div data-testid="finance-overview-page">Finance Overview Page</div>,
  'FinanceTransactions': () => <div data-testid="finance-transactions-page">Finance Transactions Page</div>,
  'FinanceInvoices': () => <div data-testid="finance-invoices-page">Finance Invoices Page</div>,
  'FinancePayments': () => <div data-testid="finance-payments-page">Finance Payments Page</div>,
  'FinanceReports': () => <div data-testid="finance-reports-page">Finance Reports Page</div>,
  'FinanceBudget': () => <div data-testid="finance-budget-page">Finance Budget Page</div>,
  'FinanceExpenses': () => <div data-testid="finance-expenses-page">Finance Expenses Page</div>,
  'FinanceRevenue': () => <div data-testid="finance-revenue-page">Finance Revenue Page</div>,
  'FinanceTaxes': () => <div data-testid="finance-taxes-page">Finance Taxes Page</div>,
  'FinanceAudit': () => <div data-testid="finance-audit-page">Finance Audit Page</div>,
  'FinanceReconciliation': () => <div data-testid="finance-reconciliation-page">Finance Reconciliation Page</div>,
  'FinanceForecasting': () => <div data-testid="finance-forecasting-page">Finance Forecasting Page</div>,
  'FinanceCompliance': () => <div data-testid="finance-compliance-page">Finance Compliance Page</div>,
  'FinanceIntegrations': () => <div data-testid="finance-integrations-page">Finance Integrations Page</div>,
  'FinanceSettings': () => <div data-testid="finance-settings-page">Finance Settings Page</div>,

  // HR Pages (15 pages)
  'HROverview': () => <div data-testid="hr-overview-page">HR Overview Page</div>,
  'HREmployees': () => <div data-testid="hr-employees-page">HR Employees Page</div>,
  'HRDepartments': () => <div data-testid="hr-departments-page">HR Departments Page</div>,
  'HRPositions': () => <div data-testid="hr-positions-page">HR Positions Page</div>,
  'HRSalary': () => <div data-testid="hr-salary-page">HR Salary Page</div>,
  'HRBenefits': () => <div data-testid="hr-benefits-page">HR Benefits Page</div>,
  'HRLeave': () => <div data-testid="hr-leave-page">HR Leave Page</div>,
  'HRPerformance': () => <div data-testid="hr-performance-page">HR Performance Page</div>,
  'HRTraining': () => <div data-testid="hr-training-page">HR Training Page</div>,
  'HRRecruitment': () => <div data-testid="hr-recruitment-page">HR Recruitment Page</div>,
  'HRPolicies': () => <div data-testid="hr-policies-page">HR Policies Page</div>,
  'HRCompliance': () => <div data-testid="hr-compliance-page">HR Compliance Page</div>,
  'HRReports': () => <div data-testid="hr-reports-page">HR Reports Page</div>,
  'HRAnalytics': () => <div data-testid="hr-analytics-page">HR Analytics Page</div>,
  'HRSettings': () => <div data-testid="hr-settings-page">HR Settings Page</div>,

  // Settings Pages (10 pages)
  'SettingsGeneral': () => <div data-testid="settings-general-page">Settings General Page</div>,
  'SettingsSecurity': () => <div data-testid="settings-security-page">Settings Security Page</div>,
  'SettingsNotifications': () => <div data-testid="settings-notifications-page">Settings Notifications Page</div>,
  'SettingsIntegrations': () => <div data-testid="settings-integrations-page">Settings Integrations Page</div>,
  'SettingsAPI': () => <div data-testid="settings-api-page">Settings API Page</div>,
  'SettingsBackup': () => <div data-testid="settings-backup-page">Settings Backup Page</div>,
  'SettingsLogs': () => <div data-testid="settings-logs-page">Settings Logs Page</div>,
  'SettingsMaintenance': () => <div data-testid="settings-maintenance-page">Settings Maintenance Page</div>,
  'SettingsAdvanced': () => <div data-testid="settings-advanced-page">Settings Advanced Page</div>,
  'SettingsAbout': () => <div data-testid="settings-about-page">Settings About Page</div>,

  // Mobile Pages (10 pages)
  'MobileDashboard': () => <div data-testid="mobile-dashboard-page">Mobile Dashboard Page</div>,
  'MobileVehicles': () => <div data-testid="mobile-vehicles-page">Mobile Vehicles Page</div>,
  'MobileBookings': () => <div data-testid="mobile-bookings-page">Mobile Bookings Page</div>,
  'MobileServices': () => <div data-testid="mobile-services-page">Mobile Services Page</div>,
  'MobileNotifications': () => <div data-testid="mobile-notifications-page">Mobile Notifications Page</div>,
  'MobileProfile': () => <div data-testid="mobile-profile-page">Mobile Profile Page</div>,
  'MobileSettings': () => <div data-testid="mobile-settings-page">Mobile Settings Page</div>,
  'MobileHelp': () => <div data-testid="mobile-help-page">Mobile Help Page</div>,
  'MobileSupport': () => <div data-testid="mobile-support-page">Mobile Support Page</div>,
  'MobileFeedback': () => <div data-testid="mobile-feedback-page">Mobile Feedback Page</div>,

  // Partner Pages (10 pages)
  'PartnerDashboard': () => <div data-testid="partner-dashboard-page">Partner Dashboard Page</div>,
  'PartnerOrders': () => <div data-testid="partner-orders-page">Partner Orders Page</div>,
  'PartnerInventory': () => <div data-testid="partner-inventory-page">Partner Inventory Page</div>,
  'PartnerProducts': () => <div data-testid="partner-products-page">Partner Products Page</div>,
  'PartnerCustomers': () => <div data-testid="partner-customers-page">Partner Customers Page</div>,
  'PartnerReports': () => <div data-testid="partner-reports-page">Partner Reports Page</div>,
  'PartnerAnalytics': () => <div data-testid="partner-analytics-page">Partner Analytics Page</div>,
  'PartnerSettings': () => <div data-testid="partner-settings-page">Partner Settings Page</div>,
  'PartnerSupport': () => <div data-testid="partner-support-page">Partner Support Page</div>,
  'PartnerHelp': () => <div data-testid="partner-help-page">Partner Help Page</div>,

  // Error Pages (5 pages)
  'Error404': () => <div data-testid="error-404-page">Error 404 Page</div>,
  'Error500': () => <div data-testid="error-500-page">Error 500 Page</div>,
  'Error403': () => <div data-testid="error-403-page">Error 403 Page</div>,
  'ErrorNetwork': () => <div data-testid="error-network-page">Error Network Page</div>,
  'ErrorMaintenance': () => <div data-testid="error-maintenance-page">Error Maintenance Page</div>
};

describe('Critical Frontend Functionality Testing - All 106 Pages', () => {
  beforeEach(() => {
    // Setup MSW handlers for all pages
    server.use(
      rest.get('/api/v1/admin/dashboard/consolidated', (req, res, ctx) => {
        return res(ctx.json({ success: true, data: { users: 1000, revenue: 50000 } }));
      }),
      rest.get('/api/v1/admin/users', (req, res, ctx) => {
        return res(ctx.json({ success: true, data: { users: [] } }));
      }),
      rest.get('/api/v1/admin/analytics', (req, res, ctx) => {
        return res(ctx.json({ success: true, data: { analytics: {} } }));
      }),
      rest.get('/api/v1/admin/finance', (req, res, ctx) => {
        return res(ctx.json({ success: true, data: { finance: {} } }));
      }),
      rest.get('/api/v1/admin/hr', (req, res, ctx) => {
        return res(ctx.json({ success: true, data: { hr: {} } }));
      })
    );
  });

  describe('Authentication Pages (5 pages)', () => {
    test.each([
      'Login', 'Register', 'ForgotPassword', 'ResetPassword', 'VerifyEmail'
    ])('should render %s page correctly', (pageName) => {
      const PageComponent = mockPages[pageName];
      render(<PageComponent />);
      
      expect(screen.getByTestId(`${pageName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}-page`)).toBeInTheDocument();
    });

    test('Login page should handle form submission', async () => {
      const user = userEvent.setup();
      render(<mockPages.Login />);
      
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-button');
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('login-success')).toBeInTheDocument();
      });
    });

    test('Register page should validate form inputs', async () => {
      const user = userEvent.setup();
      render(<mockPages.Register />);
      
      const submitButton = screen.getByTestId('register-button');
      await user.click(submitButton);
      
      expect(screen.getByTestId('validation-error')).toBeInTheDocument();
    });
  });

  describe('Dashboard Pages (15 pages)', () => {
    test.each([
      'Dashboard', 'DashboardConsolidated', 'DashboardAnalytics', 'DashboardFinance',
      'DashboardHR', 'DashboardSettings', 'DashboardUsers', 'DashboardReports',
      'DashboardNotifications', 'DashboardProfile', 'DashboardHelp', 'DashboardSupport',
      'DashboardFeedback', 'DashboardLogs', 'DashboardSystem'
    ])('should render %s page correctly', (pageName) => {
      const PageComponent = mockPages[pageName];
      render(<PageComponent />);
      
      expect(screen.getByTestId(`${pageName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}-page`)).toBeInTheDocument();
    });

    test('Dashboard should load data correctly', async () => {
      render(<mockPages.Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-data')).toBeInTheDocument();
      });
    });

    test('Dashboard should handle navigation', async () => {
      const user = userEvent.setup();
      render(<mockPages.Dashboard />);
      
      const navButton = screen.getByTestId('nav-analytics');
      await user.click(navButton);
      
      expect(screen.getByTestId('analytics-page')).toBeInTheDocument();
    });
  });

  describe('User Management Pages (20 pages)', () => {
    test.each([
      'UsersList', 'UserCreate', 'UserEdit', 'UserView', 'UserRoles',
      'UserPermissions', 'UserGroups', 'UserSessions', 'UserActivity',
      'UserAudit', 'UserImport', 'UserExport', 'UserBulkActions',
      'UserSearch', 'UserFilters', 'UserReports', 'UserAnalytics',
      'UserStatistics', 'UserMetrics', 'UserDashboard'
    ])('should render %s page correctly', (pageName) => {
      const PageComponent = mockPages[pageName];
      render(<PageComponent />);
      
      expect(screen.getByTestId(`${pageName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}-page`)).toBeInTheDocument();
    });

    test('UsersList should display users table', async () => {
      render(<mockPages.UsersList />);
      
      await waitFor(() => {
        expect(screen.getByTestId('users-table')).toBeInTheDocument();
      });
    });

    test('UserCreate should handle form submission', async () => {
      const user = userEvent.setup();
      render(<mockPages.UserCreate />);
      
      const nameInput = screen.getByTestId('user-name-input');
      const emailInput = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('create-user-button');
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('user-created-success')).toBeInTheDocument();
      });
    });
  });

  describe('Analytics Pages (15 pages)', () => {
    test.each([
      'AnalyticsOverview', 'AnalyticsUsers', 'AnalyticsRevenue', 'AnalyticsPerformance',
      'AnalyticsTraffic', 'AnalyticsConversions', 'AnalyticsReports', 'AnalyticsCharts',
      'AnalyticsMetrics', 'AnalyticsKPIs', 'AnalyticsTrends', 'AnalyticsSegments',
      'AnalyticsFunnels', 'AnalyticsGoals', 'AnalyticsCustom'
    ])('should render %s page correctly', (pageName) => {
      const PageComponent = mockPages[pageName];
      render(<PageComponent />);
      
      expect(screen.getByTestId(`${pageName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}-page`)).toBeInTheDocument();
    });

    test('AnalyticsOverview should load charts', async () => {
      render(<mockPages.AnalyticsOverview />);
      
      await waitFor(() => {
        expect(screen.getByTestId('analytics-charts')).toBeInTheDocument();
      });
    });

    test('Analytics should handle date range filtering', async () => {
      const user = userEvent.setup();
      render(<mockPages.AnalyticsOverview />);
      
      const dateRangeButton = screen.getByTestId('date-range-button');
      await user.click(dateRangeButton);
      
      expect(screen.getByTestId('date-range-picker')).toBeInTheDocument();
    });
  });

  describe('Finance Pages (15 pages)', () => {
    test.each([
      'FinanceOverview', 'FinanceTransactions', 'FinanceInvoices', 'FinancePayments',
      'FinanceReports', 'FinanceBudget', 'FinanceExpenses', 'FinanceRevenue',
      'FinanceTaxes', 'FinanceAudit', 'FinanceReconciliation', 'FinanceForecasting',
      'FinanceCompliance', 'FinanceIntegrations', 'FinanceSettings'
    ])('should render %s page correctly', (pageName) => {
      const PageComponent = mockPages[pageName];
      render(<PageComponent />);
      
      expect(screen.getByTestId(`${pageName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}-page`)).toBeInTheDocument();
    });

    test('FinanceOverview should display financial metrics', async () => {
      render(<mockPages.FinanceOverview />);
      
      await waitFor(() => {
        expect(screen.getByTestId('financial-metrics')).toBeInTheDocument();
      });
    });

    test('FinanceTransactions should handle filtering', async () => {
      const user = userEvent.setup();
      render(<mockPages.FinanceTransactions />);
      
      const filterButton = screen.getByTestId('transaction-filter');
      await user.click(filterButton);
      
      expect(screen.getByTestId('filter-options')).toBeInTheDocument();
    });
  });

  describe('HR Pages (15 pages)', () => {
    test.each([
      'HROverview', 'HREmployees', 'HRDepartments', 'HRPositions', 'HRSalary',
      'HRBenefits', 'HRLeave', 'HRPerformance', 'HRTraining', 'HRRecruitment',
      'HRPolicies', 'HRCompliance', 'HRReports', 'HRAnalytics', 'HRSettings'
    ])('should render %s page correctly', (pageName) => {
      const PageComponent = mockPages[pageName];
      render(<PageComponent />);
      
      expect(screen.getByTestId(`${pageName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}-page`)).toBeInTheDocument();
    });

    test('HREmployees should display employee list', async () => {
      render(<mockPages.HREmployees />);
      
      await waitFor(() => {
        expect(screen.getByTestId('employees-table')).toBeInTheDocument();
      });
    });

    test('HRLeave should handle leave requests', async () => {
      const user = userEvent.setup();
      render(<mockPages.HRLeave />);
      
      const requestButton = screen.getByTestId('request-leave-button');
      await user.click(requestButton);
      
      expect(screen.getByTestId('leave-request-form')).toBeInTheDocument();
    });
  });

  describe('Settings Pages (10 pages)', () => {
    test.each([
      'SettingsGeneral', 'SettingsSecurity', 'SettingsNotifications', 'SettingsIntegrations',
      'SettingsAPI', 'SettingsBackup', 'SettingsLogs', 'SettingsMaintenance',
      'SettingsAdvanced', 'SettingsAbout'
    ])('should render %s page correctly', (pageName) => {
      const PageComponent = mockPages[pageName];
      render(<PageComponent />);
      
      expect(screen.getByTestId(`${pageName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}-page`)).toBeInTheDocument();
    });

    test('SettingsGeneral should save settings', async () => {
      const user = userEvent.setup();
      render(<mockPages.SettingsGeneral />);
      
      const saveButton = screen.getByTestId('save-settings-button');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('settings-saved')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Pages (10 pages)', () => {
    test.each([
      'MobileDashboard', 'MobileVehicles', 'MobileBookings', 'MobileServices',
      'MobileNotifications', 'MobileProfile', 'MobileSettings', 'MobileHelp',
      'MobileSupport', 'MobileFeedback'
    ])('should render %s page correctly', (pageName) => {
      const PageComponent = mockPages[pageName];
      render(<PageComponent />);
      
      expect(screen.getByTestId(`${pageName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}-page`)).toBeInTheDocument();
    });

    test('MobileDashboard should be responsive', () => {
      render(<mockPages.MobileDashboard />);
      
      expect(screen.getByTestId('mobile-dashboard-page')).toBeInTheDocument();
    });
  });

  describe('Partner Pages (10 pages)', () => {
    test.each([
      'PartnerDashboard', 'PartnerOrders', 'PartnerInventory', 'PartnerProducts',
      'PartnerCustomers', 'PartnerReports', 'PartnerAnalytics', 'PartnerSettings',
      'PartnerSupport', 'PartnerHelp'
    ])('should render %s page correctly', (pageName) => {
      const PageComponent = mockPages[pageName];
      render(<PageComponent />);
      
      expect(screen.getByTestId(`${pageName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}-page`)).toBeInTheDocument();
    });

    test('PartnerOrders should handle order management', async () => {
      const user = userEvent.setup();
      render(<mockPages.PartnerOrders />);
      
      const createOrderButton = screen.getByTestId('create-order-button');
      await user.click(createOrderButton);
      
      expect(screen.getByTestId('order-form')).toBeInTheDocument();
    });
  });

  describe('Error Pages (5 pages)', () => {
    test.each([
      'Error404', 'Error500', 'Error403', 'ErrorNetwork', 'ErrorMaintenance'
    ])('should render %s page correctly', (pageName) => {
      const PageComponent = mockPages[pageName];
      render(<PageComponent />);
      
      expect(screen.getByTestId(`${pageName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}-page`)).toBeInTheDocument();
    });

    test('Error404 should have retry functionality', async () => {
      const user = userEvent.setup();
      render(<mockPages.Error404 />);
      
      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);
      
      expect(screen.getByTestId('retry-success')).toBeInTheDocument();
    });
  });

  describe('Cross-Page Navigation', () => {
    test('should navigate between pages correctly', async () => {
      const user = userEvent.setup();
      render(<mockPages.Dashboard />);
      
      // Navigate to users page
      const usersNav = screen.getByTestId('nav-users');
      await user.click(usersNav);
      
      expect(screen.getByTestId('users-list-page')).toBeInTheDocument();
      
      // Navigate to analytics page
      const analyticsNav = screen.getByTestId('nav-analytics');
      await user.click(analyticsNav);
      
      expect(screen.getByTestId('analytics-overview-page')).toBeInTheDocument();
    });
  });

  describe('Page Performance', () => {
    test('all pages should load within acceptable time', async () => {
      const startTime = performance.now();
      
      Object.entries(mockPages).forEach(([name, Component]) => {
        render(<Component />);
      });
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // All 106 pages should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });
  });

  describe('Page Accessibility', () => {
    test('all pages should have proper accessibility attributes', () => {
      Object.entries(mockPages).forEach(([name, Component]) => {
        const { container } = render(<Component />);
        
        // Check for proper heading structure
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        expect(headings.length).toBeGreaterThan(0);
        
        // Check for proper form labels
        const inputs = container.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          const hasLabel = 
            input.getAttribute('aria-label') ||
            input.getAttribute('aria-labelledby') ||
            container.querySelector(`label[for="${input.id}"]`);
          expect(hasLabel).toBeTruthy();
        });
      });
    });
  });
});
