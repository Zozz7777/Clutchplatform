const axios = require('axios');

const BACKEND_URL = 'https://clutch-main-nk7x.onrender.com';

// Test different user roles and see what navigation items they would have access to
const testRoles = [
  'admin',
  'hr_manager',
  'fleet_manager',
  'enterprise_manager',
  'sales_manager',
  'analytics',
  'management',
  'cto',
  'operations',
  'sales_rep',
  'manager',
  'analyst',
  'super_admin',
  'finance_manager',
  'marketing_manager',
  'legal_manager',
  'partner_manager',
  'hr',
  'fleet_admin',
  'driver',
  'accountant'
];

// Navigation configuration from the frontend
const navigation = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    roles: ['admin', 'manager', 'employee', 'viewer'],
  },
  {
    title: 'B2B Fleet Management',
    href: '/fleet',
    roles: ['admin', 'fleet_manager', 'fleet_admin'],
    children: [
      { title: 'Fleet Overview', href: '/fleet/overview', roles: ['admin', 'fleet_manager', 'fleet_admin'] },
      { title: 'Drivers', href: '/fleet/drivers', roles: ['admin', 'fleet_manager', 'fleet_admin'] },
      { title: 'Maintenance', href: '/fleet/maintenance', roles: ['admin', 'fleet_manager', 'fleet_admin'] },
      { title: 'Routes', href: '/fleet/routes', roles: ['admin', 'fleet_manager', 'fleet_admin'] },
      { title: 'Tracking', href: '/fleet/tracking', roles: ['admin', 'fleet_manager', 'fleet_admin'] },
      { title: 'Analytics', href: '/fleet/analytics', roles: ['admin', 'fleet_manager', 'fleet_admin'] },
    ],
  },
  {
    title: 'AI & Machine Learning',
    href: '/ai',
    roles: ['admin', 'analytics', 'cto', 'management'],
    children: [
      { title: 'AI Dashboard', href: '/ai/dashboard', roles: ['admin', 'analytics', 'cto', 'management'] },
      { title: 'Predictive Analytics', href: '/ai/predictive', roles: ['admin', 'analytics', 'cto', 'management'] },
      { title: 'Fraud Detection', href: '/ai/fraud', roles: ['admin', 'analytics', 'cto', 'management'] },
      { title: 'Recommendations', href: '/ai/recommendations', roles: ['admin', 'analytics', 'cto', 'management'] },
      { title: 'Models', href: '/ai/models', roles: ['admin', 'analytics', 'cto', 'management'] },
    ],
  },
  {
    title: 'HR Management',
    href: '/hr',
    roles: ['admin', 'hr_manager', 'hr'],
    children: [
      { title: 'Employees', href: '/hr/employees', roles: ['admin', 'hr_manager', 'hr'] },
      { title: 'Recruitment', href: '/hr/recruitment', roles: ['admin', 'hr_manager', 'hr'] },
      { title: 'Performance', href: '/hr/performance', roles: ['admin', 'hr_manager', 'hr'] },
      { title: 'Payroll', href: '/hr/payroll', roles: ['admin', 'hr_manager', 'hr'] },
    ],
  },
  {
    title: 'Finance',
    href: '/finance',
    roles: ['admin', 'finance_manager', 'accountant'],
    children: [
      { title: 'Invoices', href: '/finance/invoices', roles: ['admin', 'finance_manager', 'accountant'] },
      { title: 'Expenses', href: '/finance/expenses', roles: ['admin', 'finance_manager', 'accountant'] },
      { title: 'Payments', href: '/finance/payments', roles: ['admin', 'finance_manager', 'accountant'] },
      { title: 'Reports', href: '/finance/reports', roles: ['admin', 'finance_manager', 'accountant'] },
      { title: 'Subscriptions', href: '/finance/subscriptions', roles: ['admin', 'finance_manager', 'accountant'] },
    ],
  },
  {
    title: 'CRM & Sales',
    href: '/crm',
    roles: ['admin', 'sales_manager', 'sales_rep'],
    children: [
      { title: 'Customers', href: '/crm/customers', roles: ['admin', 'sales_manager', 'sales_rep'] },
      { title: 'Deals', href: '/crm/deals', roles: ['admin', 'sales_manager', 'sales_rep'] },
      { title: 'Leads', href: '/crm/leads', roles: ['admin', 'sales_manager', 'sales_rep'] },
      { title: 'Pipeline', href: '/crm/pipeline', roles: ['admin', 'sales_manager', 'sales_rep'] },
    ],
  },
  {
    title: 'Partners',
    href: '/partners',
    roles: ['admin', 'partner_manager'],
    children: [
      { title: 'Directory', href: '/partners/directory', roles: ['admin', 'partner_manager'] },
      { title: 'Commissions', href: '/partners/commission', roles: ['admin', 'partner_manager'] },
      { title: 'Performance', href: '/partners/performance', roles: ['admin', 'partner_manager'] },
    ],
  },
  {
    title: 'Marketing',
    href: '/marketing',
    roles: ['admin', 'marketing_manager'],
    children: [
      { title: 'Campaigns', href: '/marketing/campaigns', roles: ['admin', 'marketing_manager'] },
      { title: 'Analytics', href: '/marketing/analytics', roles: ['admin', 'marketing_manager'] },
      { title: 'Automation', href: '/marketing/automation', roles: ['admin', 'marketing_manager'] },
    ],
  },
  {
    title: 'Projects',
    href: '/projects',
    roles: ['admin', 'manager', 'operations'],
    children: [
      { title: 'List', href: '/projects/list', roles: ['admin', 'manager', 'operations'] },
      { title: 'Tasks', href: '/projects/tasks', roles: ['admin', 'manager', 'operations'] },
      { title: 'Time Tracking', href: '/projects/time', roles: ['admin', 'manager', 'operations'] },
    ],
  },
  {
    title: 'Analytics',
    href: '/analytics',
    roles: ['admin', 'analytics', 'analyst', 'management'],
    children: [
      { title: 'Overview', href: '/analytics/overview', roles: ['admin', 'analytics', 'analyst', 'management'] },
      { title: 'Executive Dashboard', href: '/analytics/executive-dashboard', roles: ['admin', 'analytics', 'analyst', 'management'] },
      { title: 'Reports', href: '/analytics/reports', roles: ['admin', 'analytics', 'analyst', 'management'] },
    ],
  },
  {
    title: 'Enterprise',
    href: '/enterprise',
    roles: ['admin', 'enterprise_manager'],
    children: [
      { title: 'Multi-Tenant', href: '/enterprise/multi-tenant', roles: ['admin', 'enterprise_manager'] },
      { title: 'White-Label', href: '/enterprise/white-label', roles: ['admin', 'enterprise_manager'] },
      { title: 'API Management', href: '/enterprise/api', roles: ['admin', 'enterprise_manager'] },
    ],
  },
  {
    title: 'Legal',
    href: '/legal',
    roles: ['admin', 'legal_manager'],
    children: [
      { title: 'Contracts', href: '/legal/contracts', roles: ['admin', 'legal_manager'] },
      { title: 'Compliance', href: '/legal/compliance', roles: ['admin', 'legal_manager'] },
      { title: 'Documents', href: '/legal/documents', roles: ['admin', 'legal_manager'] },
    ],
  },
  {
    title: 'Settings',
    href: '/settings',
    roles: ['admin', 'manager'],
    children: [
      { title: 'Profile', href: '/settings/profile', roles: ['admin', 'manager', 'employee'] },
      { title: 'System', href: '/settings/system', roles: ['admin'] },
      { title: 'Feature Flags', href: '/settings/feature-flags', roles: ['admin'] },
    ],
  },
];

// Helper function to check if user has access to a navigation item
const hasNavAccess = (item, userRoles) => {
  if (!item.roles || item.roles.length === 0) {
    return true;
  }
  
  return userRoles.some(role => item.roles.includes(role));
};

// Helper function to filter navigation based on user roles
const filterNavigationByRoles = (navItems, userRoles) => {
  return navItems
    .filter(item => hasNavAccess(item, userRoles))
    .map(item => ({
      ...item,
      children: item.children 
        ? filterNavigationByRoles(item.children, userRoles)
        : undefined
    }))
    .filter(item => {
      if (item.children && item.children.length === 0) {
        return false;
      }
      return true;
    });
};

async function testRoleNavigation() {
  console.log('🧪 Testing Role-Based Navigation System\n');
  
  // Test individual roles
  console.log('📋 Testing Individual Roles:');
  console.log('=====================================');
  
  testRoles.forEach(role => {
    const filteredNav = filterNavigationByRoles(navigation, [role]);
    const accessibleItems = filteredNav.map(item => item.title);
    
    console.log(`\n👤 Role: ${role}`);
    console.log(`📱 Accessible sections: ${accessibleItems.length}`);
    console.log(`🔗 Sections: ${accessibleItems.join(', ')}`);
  });
  
  // Test admin role (should have access to everything)
  console.log('\n\n👑 Testing Admin Role (Full Access):');
  console.log('=====================================');
  const adminNav = filterNavigationByRoles(navigation, ['admin']);
  console.log(`📱 Total accessible sections: ${adminNav.length}`);
  adminNav.forEach(item => {
    console.log(`  • ${item.title}`);
    if (item.children) {
      item.children.forEach(child => {
        console.log(`    - ${child.title}`);
      });
    }
  });
  
  // Test a user with multiple roles
  console.log('\n\n🎭 Testing User with Multiple Roles:');
  console.log('=====================================');
  const multiRoleUser = ['hr_manager', 'fleet_manager', 'analytics'];
  const multiRoleNav = filterNavigationByRoles(navigation, multiRoleUser);
  console.log(`👤 Roles: ${multiRoleUser.join(', ')}`);
  console.log(`📱 Total accessible sections: ${multiRoleNav.length}`);
  multiRoleNav.forEach(item => {
    console.log(`  • ${item.title}`);
    if (item.children) {
      item.children.forEach(child => {
        console.log(`    - ${child.title}`);
      });
    }
  });
  
  console.log('\n✅ Role-based navigation test completed!');
  console.log('\n💡 This shows how the navigation will be filtered based on user roles.');
  console.log('🔒 Users will only see sections they have access to, preventing 403 errors.');
}

// Run the test
testRoleNavigation();
