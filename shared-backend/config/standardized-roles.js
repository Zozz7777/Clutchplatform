// Standardized RBAC Role Configuration for Clutch Platform
// This file defines the unified role system used across frontend and backend

const STANDARDIZED_ROLES = {
  // Level 1: Executive Leadership (Level 10-9)
  SUPER_ADMIN: {
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Full system access and control',
    level: 10,
    department: 'Executive',
    permissions: ['*'], // All permissions
    frontendRole: 'super_admin',
    backendRoles: ['super_admin', 'head_administrator', 'platform_admin', 'executive', 'admin']
  },

  HEAD_ADMINISTRATOR: {
    name: 'head_administrator',
    displayName: 'Head Administrator',
    description: 'System administrator with full access',
    level: 9,
    department: 'IT/Management',
    permissions: ['*'], // All permissions
    frontendRole: 'head_administrator',
    backendRoles: ['head_administrator']
  },

  EXECUTIVE: {
    name: 'executive',
    displayName: 'Executive',
    description: 'Executive oversight and strategic decisions',
    level: 9,
    department: 'Executive',
    permissions: ['*'], // All permissions
    frontendRole: 'executive',
    backendRoles: ['executive', 'head_administrator'] // Maps to head_administrator for backend
  },

  PLATFORM_ADMIN: {
    name: 'platform_admin',
    displayName: 'Platform Administrator',
    description: 'Platform administration and management',
    level: 9,
    department: 'IT/Management',
    permissions: ['*'], // All permissions
    frontendRole: 'platform_admin',
    backendRoles: ['platform_admin', 'head_administrator'] // Maps to head_administrator for backend
  },

  ADMIN: {
    name: 'admin',
    displayName: 'Administrator',
    description: 'General system administration',
    level: 9,
    department: 'IT/Management',
    permissions: ['*'], // All permissions
    frontendRole: 'admin',
    backendRoles: ['admin', 'head_administrator'] // Maps to head_administrator for backend
  },

  // Level 2: Department Heads (Level 8)
  HR_MANAGER: {
    name: 'hr_manager',
    displayName: 'HR Manager',
    description: 'Human resources management and oversight',
    level: 8,
    department: 'Human Resources',
    permissions: [
      'view_dashboard', 'view_hr', 'manage_hr', 'view_users', 'create_users', 'edit_users',
      'view_employees', 'manage_employees', 'view_analytics', 'view_reports', 'view_chat'
    ],
    frontendRole: 'hr_manager',
    backendRoles: ['hr_manager', 'hr']
  },

  FINANCE_OFFICER: {
    name: 'finance_officer',
    displayName: 'Finance Officer',
    description: 'Financial management and reporting',
    level: 8,
    department: 'Finance',
    permissions: [
      'view_dashboard', 'view_finance', 'manage_finance', 'process_payments',
      'view_billing', 'manage_billing', 'view_analytics', 'view_reports'
    ],
    frontendRole: 'finance_officer',
    backendRoles: ['finance_officer', 'finance_manager', 'finance']
  },

  OPERATIONS_MANAGER: {
    name: 'operations_manager',
    displayName: 'Operations Manager',
    description: 'Operational oversight and efficiency',
    level: 8,
    department: 'Operations',
    permissions: [
      'view_dashboard', 'view_operations', 'manage_operations', 'view_fleet',
      'manage_fleet', 'view_analytics', 'view_reports', 'view_users'
    ],
    frontendRole: 'operations_manager',
    backendRoles: ['operations_manager', 'fleet_manager']
  },

  MARKETING_MANAGER: {
    name: 'marketing_manager',
    displayName: 'Marketing Manager',
    description: 'Marketing strategy and analytics',
    level: 8,
    department: 'Marketing',
    permissions: [
      'view_dashboard', 'view_marketing', 'manage_marketing', 'view_analytics',
      'view_reports', 'view_users', 'view_business_intelligence'
    ],
    frontendRole: 'marketing_manager',
    backendRoles: ['marketing_manager']
  },

  LEGAL_TEAM: {
    name: 'legal_team',
    displayName: 'Legal Team',
    description: 'Legal oversight and compliance',
    level: 8,
    department: 'Legal',
    permissions: [
      'view_dashboard', 'view_legal', 'manage_legal', 'view_contracts',
      'manage_contracts', 'view_reports'
    ],
    frontendRole: 'legal_team',
    backendRoles: ['legal_team', 'compliance_officer', 'compliance']
  },

  SECURITY_MANAGER: {
    name: 'security_manager',
    displayName: 'Security Manager',
    description: 'Security oversight and management',
    level: 8,
    department: 'Security',
    permissions: [
      'view_dashboard', 'view_security', 'manage_security', 'view_system_health',
      'view_audit_trail', 'view_reports', 'view_users'
    ],
    frontendRole: 'security_manager',
    backendRoles: ['security_manager', 'security']
  },

  // Level 3: Specialized Managers (Level 7)
  BUSINESS_ANALYST: {
    name: 'business_analyst',
    displayName: 'Business Analyst',
    description: 'Business analysis and insights',
    level: 7,
    department: 'Analytics',
    permissions: [
      'view_dashboard', 'view_analytics', 'export_analytics', 'view_reports',
      'generate_reports', 'view_business_intelligence'
    ],
    frontendRole: 'business_analyst',
    backendRoles: ['business_analyst', 'analyst', 'analytics_manager']
  },

  PROJECT_MANAGER: {
    name: 'project_manager',
    displayName: 'Project Manager',
    description: 'Project management and coordination',
    level: 7,
    department: 'Project Management',
    permissions: [
      'view_dashboard', 'view_projects', 'manage_projects', 'view_users',
      'view_analytics', 'view_reports'
    ],
    frontendRole: 'project_manager',
    backendRoles: ['project_manager']
  },

  ASSET_MANAGER: {
    name: 'asset_manager',
    displayName: 'Asset Manager',
    description: 'Asset management and tracking',
    level: 7,
    department: 'Operations',
    permissions: [
      'view_dashboard', 'view_assets', 'manage_assets', 'view_fleet',
      'manage_fleet', 'view_analytics', 'view_reports'
    ],
    frontendRole: 'asset_manager',
    backendRoles: ['asset_manager', 'fleet_manager']
  },

  CRM_MANAGER: {
    name: 'crm_manager',
    displayName: 'CRM Manager',
    description: 'Customer relationship management',
    level: 7,
    department: 'Customer Relations',
    permissions: [
      'view_dashboard', 'view_crm', 'manage_crm', 'view_users',
      'view_analytics', 'view_reports'
    ],
    frontendRole: 'crm_manager',
    backendRoles: ['crm_manager']
  },

  SYSTEM_ADMIN: {
    name: 'system_admin',
    displayName: 'System Administrator',
    description: 'System administration and maintenance',
    level: 7,
    department: 'IT',
    permissions: [
      'view_dashboard', 'view_system_health', 'manage_system_monitoring',
      'view_analytics', 'view_reports', 'view_users'
    ],
    frontendRole: 'system_admin',
    backendRoles: ['system_admin', 'technology_admin']
  },

  // Level 4: Functional Specialists (Level 6)
  HR: {
    name: 'hr',
    displayName: 'HR Employee',
    description: 'Human resources operations',
    level: 6,
    department: 'Human Resources',
    permissions: [
      'view_dashboard', 'view_hr', 'view_employees', 'view_users',
      'view_chat', 'view_communication'
    ],
    frontendRole: 'hr',
    backendRoles: ['hr']
  },

  FINANCE: {
    name: 'finance',
    displayName: 'Finance Employee',
    description: 'Financial operations and reporting',
    level: 6,
    department: 'Finance',
    permissions: [
      'view_dashboard', 'view_finance', 'view_analytics', 'view_reports'
    ],
    frontendRole: 'finance',
    backendRoles: ['finance']
  },

  CUSTOMER_SUPPORT: {
    name: 'customer_support',
    displayName: 'Customer Support',
    description: 'Customer support and service',
    level: 6,
    department: 'Customer Service',
    permissions: [
      'view_dashboard', 'view_crm', 'manage_crm', 'view_chat',
      'send_messages', 'view_communication', 'manage_communication'
    ],
    frontendRole: 'customer_support',
    backendRoles: ['customer_support', 'support', 'support_agent', 'customer_service']
  },

  DEVELOPER: {
    name: 'developer',
    displayName: 'Developer',
    description: 'Software development and technical operations',
    level: 6,
    department: 'Technology',
    permissions: [
      'view_dashboard', 'view_ai_dashboard', 'view_mobile_apps', 'view_system_health',
      'view_chat', 'view_support'
    ],
    frontendRole: 'developer',
    backendRoles: ['developer', 'ai_engineer', 'data_scientist', 'devops']
  },

  // Level 5: Operational Staff (Level 5)
  EMPLOYEE: {
    name: 'employee',
    displayName: 'Employee',
    description: 'Standard employee access',
    level: 5,
    department: 'General',
    permissions: [
      'view_dashboard', 'view_profile', 'manage_profile', 'view_chat',
      'send_messages', 'view_communication', 'view_support'
    ],
    frontendRole: 'employee',
    backendRoles: ['employee', 'manager', 'user']
  },

  SUPPORT_AGENT: {
    name: 'support_agent',
    displayName: 'Support Agent',
    description: 'Customer support operations',
    level: 5,
    department: 'Customer Service',
    permissions: [
      'view_dashboard', 'view_support', 'manage_support', 'view_chat',
      'send_messages', 'view_communication'
    ],
    frontendRole: 'support_agent',
    backendRoles: ['support_agent', 'support']
  },

  // Level 6: External Users (Level 4)
  ENTERPRISE_CLIENT: {
    name: 'enterprise_client',
    displayName: 'Enterprise Client',
    description: 'Enterprise client access',
    level: 4,
    department: 'External',
    permissions: [
      'view_dashboard', 'view_fleet', 'manage_fleet', 'view_gps_tracking',
      'view_crm', 'view_chat', 'view_analytics', 'view_reports'
    ],
    frontendRole: 'enterprise_client',
    backendRoles: ['enterprise_client']
  },

  SERVICE_PROVIDER: {
    name: 'service_provider',
    displayName: 'Service Provider',
    description: 'Service provider access',
    level: 4,
    department: 'External',
    permissions: [
      'view_dashboard', 'view_chat', 'send_messages', 'view_crm'
    ],
    frontendRole: 'service_provider',
    backendRoles: ['service_provider']
  }
};

// Role hierarchy mapping for backend compatibility
const ROLE_HIERARCHY = {
  // Executive level roles can access all lower level permissions
  'super_admin': ['*'],
  'head_administrator': ['*'],
  'executive': ['head_administrator', 'platform_admin', 'admin'],
  'platform_admin': ['head_administrator', 'admin'],
  'admin': ['head_administrator'],
  
  // Department heads can access their department's permissions
  'hr_manager': ['hr'],
  'finance_officer': ['finance_manager', 'finance'],
  'operations_manager': ['fleet_manager', 'asset_manager'],
  'marketing_manager': ['marketing'],
  'legal_team': ['compliance_officer', 'compliance'],
  'security_manager': ['security'],
  
  // Specialized managers can access their area's permissions
  'business_analyst': ['analyst', 'analytics_manager'],
  'project_manager': ['manager'],
  'asset_manager': ['fleet_manager'],
  'crm_manager': ['customer_support', 'support'],
  'system_admin': ['technology_admin', 'developer'],
  
  // Functional specialists can access their function's permissions
  'hr': ['employee'],
  'finance': ['employee'],
  'customer_support': ['support_agent', 'support'],
  'developer': ['employee'],
  
  // Operational staff
  'employee': ['user'],
  'support_agent': ['user'],
  
  // External users
  'enterprise_client': [],
  'service_provider': []
};

// Helper functions
const getRoleByName = (roleName) => {
  return Object.values(STANDARDIZED_ROLES).find(role => role.name === roleName);
};

const getBackendRoles = (frontendRole) => {
  const role = getRoleByName(frontendRole);
  return role ? role.backendRoles : [frontendRole];
};

const canAccessRole = (userRole, targetRole) => {
  const hierarchy = ROLE_HIERARCHY[userRole];
  if (!hierarchy) return false;
  
  if (hierarchy.includes('*')) return true;
  if (hierarchy.includes(targetRole)) return true;
  
  return false;
};

const getAllowedRoles = (userRole) => {
  const hierarchy = ROLE_HIERARCHY[userRole];
  if (!hierarchy) return [userRole];
  
  if (hierarchy.includes('*')) {
    return Object.keys(STANDARDIZED_ROLES);
  }
  
  return [userRole, ...hierarchy];
};

module.exports = {
  STANDARDIZED_ROLES,
  ROLE_HIERARCHY,
  getRoleByName,
  getBackendRoles,
  canAccessRole,
  getAllowedRoles
};
