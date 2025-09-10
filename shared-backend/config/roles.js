// Role-Based Access Control Configuration
// This file defines all roles and their permissions for the Clutch Admin system

const ROLES = {
  // Super Admin - Full system access
  SUPER_ADMIN: {
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Full system access and control',
    permissions: ['*'], // All permissions
    department: 'IT/Management',
    level: 10
  },

  // Executive Management
  CEO: {
    name: 'ceo',
    displayName: 'Chief Executive Officer',
    description: 'Executive oversight and strategic decisions',
    permissions: [
      'dashboard:read',
      'analytics:read',
      'business_intelligence:read',
      'reports:read',
      'users:read',
      'employees:read',
      'finance:read',
      'operations:read',
      'marketing:read',
      'hr:read',
      'system:read'
    ],
    department: 'Executive',
    level: 9
  },

  CTO: {
    name: 'cto',
    displayName: 'Chief Technology Officer',
    description: 'Technical oversight and system administration',
    permissions: [
      'dashboard:read',
      'analytics:read',
      'ai:read',
      'ai:write',
      'mobile:read',
      'mobile:write',
      'system:read',
      'system:write',
      'users:read',
      'employees:read',
      'support:read',
      'support:write'
    ],
    department: 'Technology',
    level: 9
  },

  CFO: {
    name: 'cfo',
    displayName: 'Chief Financial Officer',
    description: 'Financial oversight and reporting',
    permissions: [
      'dashboard:read',
      'analytics:read',
      'business_intelligence:read',
      'finance:read',
      'finance:write',
      'reports:read',
      'kpi:read',
      'kpi:write',
      'users:read',
      'employees:read'
    ],
    department: 'Finance',
    level: 9
  },

  // Department Heads
  HR_MANAGER: {
    name: 'hr_manager',
    displayName: 'HR Manager',
    description: 'Human resources management and oversight',
    permissions: [
      'dashboard:read',
      'hr:read',
      'hr:write',
      'employees:read',
      'employees:write',
      'analytics:read',
      'reports:read',
      'users:read',
      'chat:read',
      'chat:write',
      'communication:read',
      'communication:write'
    ],
    department: 'Human Resources',
    level: 8
  },

  FINANCE_MANAGER: {
    name: 'finance_manager',
    displayName: 'Finance Manager',
    description: 'Financial management and reporting',
    permissions: [
      'dashboard:read',
      'finance:read',
      'finance:write',
      'analytics:read',
      'business_intelligence:read',
      'kpi:read',
      'kpi:write',
      'reports:read',
      'reports:write',
      'users:read',
      'employees:read'
    ],
    department: 'Finance',
    level: 8
  },

  OPERATIONS_MANAGER: {
    name: 'operations_manager',
    displayName: 'Operations Manager',
    description: 'Operational oversight and efficiency',
    permissions: [
      'dashboard:read',
      'operations:read',
      'operations:write',
      'analytics:read',
      'reports:read',
      'kpi:read',
      'users:read',
      'employees:read',
      'fleet:read',
      'fleet:write'
    ],
    department: 'Operations',
    level: 8
  },

  MARKETING_MANAGER: {
    name: 'marketing_manager',
    displayName: 'Marketing Manager',
    description: 'Marketing strategy and analytics',
    permissions: [
      'dashboard:read',
      'marketing:read',
      'marketing:write',
      'analytics:read',
      'reports:read',
      'users:read',
      'employees:read',
      'business_intelligence:read'
    ],
    department: 'Marketing',
    level: 8
  },

  // Specialized Roles
  ANALYST: {
    name: 'analyst',
    displayName: 'Business Analyst',
    description: 'Data analysis and insights',
    permissions: [
      'dashboard:read',
      'analytics:read',
      'analytics:write',
      'reports:read',
      'reports:write',
      'business_intelligence:read',
      'users:read',
      'employees:read'
    ],
    department: 'Analytics',
    level: 7
  },

  IT_SUPPORT: {
    name: 'it_support',
    displayName: 'IT Support',
    description: 'Technical support and system maintenance',
    permissions: [
      'dashboard:read',
      'support:read',
      'support:write',
      'system:read',
      'users:read',
      'employees:read',
      'chat:read',
      'chat:write'
    ],
    department: 'IT',
    level: 6
  },

  // Standard Employee Roles
  EMPLOYEE: {
    name: 'employee',
    displayName: 'Employee',
    description: 'Standard employee access',
    permissions: [
      'dashboard:read',
      'profile:read',
      'profile:write',
      'chat:read',
      'chat:write',
      'communication:read',
      'support:read',
      'support:write'
    ],
    department: 'General',
    level: 5
  },

  HR_EMPLOYEE: {
    name: 'hr',
    displayName: 'HR Employee',
    description: 'Human resources operations',
    permissions: [
      'dashboard:read',
      'hr:read',
      'employees:read',
      'profile:read',
      'profile:write',
      'chat:read',
      'chat:write',
      'communication:read',
      'support:read',
      'support:write'
    ],
    department: 'Human Resources',
    level: 6
  },

  FINANCE_EMPLOYEE: {
    name: 'finance',
    displayName: 'Finance Employee',
    description: 'Financial operations and reporting',
    permissions: [
      'dashboard:read',
      'finance:read',
      'profile:read',
      'profile:write',
      'chat:read',
      'chat:write',
      'communication:read',
      'support:read',
      'support:write'
    ],
    department: 'Finance',
    level: 6
  },

  MARKETING_EMPLOYEE: {
    name: 'marketing',
    displayName: 'Marketing Employee',
    description: 'Marketing operations and analytics',
    permissions: [
      'dashboard:read',
      'marketing:read',
      'profile:read',
      'profile:write',
      'chat:read',
      'chat:write',
      'communication:read',
      'support:read',
      'support:write'
    ],
    department: 'Marketing',
    level: 6
  },

  // Specialized Technical Roles
  DEVELOPER: {
    name: 'developer',
    displayName: 'Developer',
    description: 'Software development and technical operations',
    permissions: [
      'dashboard:read',
      'ai:read',
      'mobile:read',
      'system:read',
      'profile:read',
      'profile:write',
      'chat:read',
      'chat:write',
      'support:read',
      'support:write'
    ],
    department: 'Technology',
    level: 7
  },

  DATA_SCIENTIST: {
    name: 'data_scientist',
    displayName: 'Data Scientist',
    description: 'AI and machine learning operations',
    permissions: [
      'dashboard:read',
      'ai:read',
      'ai:write',
      'analytics:read',
      'analytics:write',
      'business_intelligence:read',
      'profile:read',
      'profile:write',
      'chat:read',
      'chat:write'
    ],
    department: 'Technology',
    level: 7
  },

  // Partner Management
  PARTNER_MANAGER: {
    name: 'partner_manager',
    displayName: 'Partner Manager',
    description: 'Partner relationship management and oversight',
    permissions: [
      'dashboard:read',
      'partners:read',
      'partners:write',
      'analytics:read',
      'reports:read',
      'users:read',
      'employees:read',
      'chat:read',
      'chat:write',
      'communication:read',
      'communication:write'
    ],
    department: 'Partnerships',
    level: 7
  },

  // Fleet Management
  FLEET_ADMIN: {
    name: 'fleet_admin',
    displayName: 'Fleet Administrator',
    description: 'Fleet operations and vehicle management',
    permissions: [
      'dashboard:read',
      'fleet:read',
      'fleet:write',
      'analytics:read',
      'reports:read',
      'users:read',
      'employees:read',
      'chat:read',
      'chat:write',
      'communication:read',
      'communication:write'
    ],
    department: 'Operations',
    level: 6
  },

  // Driver Role
  DRIVER: {
    name: 'driver',
    displayName: 'Driver',
    description: 'Vehicle operation and delivery',
    permissions: [
      'dashboard:read',
      'fleet:read',
      'profile:read',
      'profile:write',
      'chat:read',
      'chat:write',
      'communication:read',
      'support:read',
      'support:write'
    ],
    department: 'Operations',
    level: 4
  },

  // Accounting Role
  ACCOUNTANT: {
    name: 'accountant',
    displayName: 'Accountant',
    description: 'Financial accounting and bookkeeping',
    permissions: [
      'dashboard:read',
      'finance:read',
      'finance:write',
      'analytics:read',
      'reports:read',
      'profile:read',
      'profile:write',
      'chat:read',
      'chat:write',
      'communication:read',
      'support:read',
      'support:write'
    ],
    department: 'Finance',
    level: 6
  }
};

// Permission definitions
const PERMISSIONS = {
  // Dashboard permissions
  'dashboard:read': 'View dashboard and overview',
  'dashboard:write': 'Modify dashboard configurations',

  // Analytics permissions
  'analytics:read': 'View analytics and reports',
  'analytics:write': 'Create and modify analytics',

  // Business Intelligence permissions
  'business_intelligence:read': 'View BI dashboards and metrics',
  'business_intelligence:write': 'Modify BI configurations',

  // User management permissions
  'users:read': 'View user information',
  'users:write': 'Modify user information',
  'users:delete': 'Delete users',

  // Employee management permissions
  'employees:read': 'View employee information',
  'employees:write': 'Modify employee information',
  'employees:delete': 'Delete employees',

  // Department-specific permissions
  'hr:read': 'View HR information',
  'hr:write': 'Modify HR information',
  'finance:read': 'View financial information',
  'finance:write': 'Modify financial information',
  'marketing:read': 'View marketing information',
  'marketing:write': 'Modify marketing information',
  'operations:read': 'View operations information',
  'operations:write': 'Modify operations information',

  // System permissions
  'system:read': 'View system information',
  'system:write': 'Modify system configurations',

  // AI permissions
  'ai:read': 'View AI models and predictions',
  'ai:write': 'Modify AI configurations',

  // Mobile permissions
  'mobile:read': 'View mobile app information',
  'mobile:write': 'Modify mobile app configurations',

  // Support permissions
  'support:read': 'View support tickets',
  'support:write': 'Create and modify support tickets',

  // Communication permissions
  'communication:read': 'View communication tools',
  'communication:write': 'Use communication tools',

  // Chat permissions
  'chat:read': 'View chat messages',
  'chat:write': 'Send chat messages',

  // Profile permissions
  'profile:read': 'View own profile',
  'profile:write': 'Modify own profile',

  // KPI permissions
  'kpi:read': 'View KPI targets and metrics',
  'kpi:write': 'Modify KPI targets and metrics',

  // Reports permissions
  'reports:read': 'View reports',
  'reports:write': 'Create and modify reports',

  // Partner permissions
  'partners:read': 'View partner information',
  'partners:write': 'Modify partner information',

  // Fleet permissions
  'fleet:read': 'View fleet information',
  'fleet:write': 'Modify fleet information'
};

// Helper functions
const getRoleByName = (roleName) => {
  return Object.values(ROLES).find(role => role.name === roleName);
};

const getRoleByLevel = (level) => {
  return Object.values(ROLES).filter(role => role.level >= level);
};

const hasPermission = (userRole, permission) => {
  const role = getRoleByName(userRole);
  if (!role) return false;
  
  // Super admin has all permissions
  if (role.permissions.includes('*')) return true;
  
  return role.permissions.includes(permission);
};

const getDepartmentRoles = (department) => {
  return Object.values(ROLES).filter(role => role.department === department);
};

module.exports = {
  ROLES,
  PERMISSIONS,
  getRoleByName,
  getRoleByLevel,
  hasPermission,
  getDepartmentRoles
};
