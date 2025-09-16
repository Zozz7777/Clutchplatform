# RBAC Implementation Guide for Backend Team

## Overview
The frontend has been reorganized with a new RBAC (Role-Based Access Control) structure. The backend needs to implement the same permission system to ensure consistency across the platform.

## New RBAC Structure

### 1. Permission Groups (7 Logical Groups)

#### Core System & Dashboard (12 permissions)
```javascript
const CORE_SYSTEM_DASHBOARD = [
  "view_dashboard",
  "view_analytics", 
  "export_analytics",
  "view_system_health",
  "view_kpi_metrics",
  "manage_kpi_metrics",
  "view_business_intelligence",
  "manage_business_intelligence",
  "view_dashboard_config",
  "manage_dashboard_config",
  "view_system_monitoring",
  "manage_system_monitoring"
];
```

#### User & Organization (12 permissions)
```javascript
const USER_ORGANIZATION = [
  "view_users",
  "create_users", 
  "edit_users",
  "delete_users",
  "view_employees",
  "manage_employees",
  "view_hr",
  "manage_hr",
  "view_onboarding",
  "manage_onboarding",
  "view_profiles",
  "manage_profiles"
];
```

#### Fleet & Operations (8 permissions)
```javascript
const FLEET_OPERATIONS = [
  "view_fleet",
  "manage_fleet",
  "view_gps_tracking",
  "view_assets",
  "manage_assets", 
  "view_vendors",
  "manage_vendors",
  "view_operations"
];
```

#### Business & Customer (16 permissions)
```javascript
const BUSINESS_CUSTOMER = [
  "view_crm",
  "manage_crm",
  "view_enterprise",
  "manage_enterprise",
  "view_finance",
  "manage_finance",
  "process_payments",
  "view_billing",
  "manage_billing",
  "view_legal",
  "manage_legal",
  "view_contracts",
  "manage_contracts",
  "view_partners",
  "manage_partners",
  "view_customer_data"
];
```

#### Technology & Development (16 permissions)
```javascript
const TECHNOLOGY_DEVELOPMENT = [
  "view_ai_dashboard",
  "manage_ai_models",
  "view_mobile_apps",
  "manage_mobile_apps",
  "view_cms",
  "manage_cms",
  "view_integrations",
  "manage_integrations",
  "view_api_docs",
  "view_feature_flags",
  "manage_feature_flags",
  "view_scheduled_jobs",
  "manage_scheduled_jobs",
  "view_development_tools",
  "manage_development_tools",
  "view_technical_documentation"
];
```

#### Communication & Support (10 permissions)
```javascript
const COMMUNICATION_SUPPORT = [
  "view_chat",
  "send_messages",
  "view_communication",
  "manage_communication",
  "view_support",
  "manage_support",
  "view_feedback",
  "manage_feedback",
  "view_announcements",
  "manage_announcements"
];
```

#### Administration & Config (16 permissions)
```javascript
const ADMINISTRATION_CONFIG = [
  "view_settings",
  "manage_settings",
  "view_reports",
  "generate_reports",
  "view_audit_trail",
  "view_marketing",
  "manage_marketing",
  "view_projects",
  "manage_projects",
  "view_localization",
  "manage_localization",
  "view_accessibility",
  "manage_accessibility",
  "view_system_config",
  "manage_system_config",
  "view_security_settings"
];
```

### 2. New User Roles

#### Head Administrator (NEW)
- **Role**: `head_administrator`
- **Permissions**: ALL permissions from all 7 groups (90 total)
- **Description**: Highest level of access, can manage everything

#### Existing Roles (Updated)
- `platform_admin`: Full access (legacy compatibility)
- `enterprise_client`: Fleet, CRM, Analytics, Reports
- `service_provider`: Chat, CRM, Communication
- `business_analyst`: Analytics, Reports, Business Intelligence
- `customer_support`: CRM, Chat, Communication, Support
- `hr_manager`: HR, Users, Employee Management
- `finance_officer`: Finance, Billing, Payments
- `legal_team`: Legal, Contracts
- `project_manager`: Projects, Users, Analytics
- `asset_manager`: Assets, Fleet, Operations
- `vendor_manager`: Vendors, Assets, Operations

### 3. Role Templates (Pre-configured Combinations)

```javascript
const ROLE_TEMPLATES = {
  CORE_SYSTEM_ADMIN: [...CORE_SYSTEM_DASHBOARD, ...ADMINISTRATION_CONFIG],
  USER_ADMIN: [...USER_ORGANIZATION, ...COMMUNICATION_SUPPORT],
  FLEET_ADMIN: [...FLEET_OPERATIONS, ...BUSINESS_CUSTOMER],
  BUSINESS_ADMIN: [...BUSINESS_CUSTOMER, ...ADMINISTRATION_CONFIG],
  TECHNOLOGY_ADMIN: [...TECHNOLOGY_DEVELOPMENT, ...ADMINISTRATION_CONFIG],
  SUPPORT_ADMIN: [...COMMUNICATION_SUPPORT, ...USER_ORGANIZATION],
  CONFIG_ADMIN: [...ADMINISTRATION_CONFIG, ...CORE_SYSTEM_DASHBOARD]
};
```

## Implementation Requirements

### 1. Database Schema Updates

#### Permissions Table
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  group_name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert all 90 permissions with their group assignments
```

#### Roles Table
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert all roles including new HEAD_ADMINISTRATOR
```

#### Role Permissions Table
```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);
```

### 2. API Endpoints Required

#### Permission Management
```
GET    /api/v1/permissions                    # List all permissions
GET    /api/v1/permissions/groups             # List permission groups
GET    /api/v1/permissions/group/:groupName   # Get permissions by group
POST   /api/v1/permissions                    # Create new permission
PUT    /api/v1/permissions/:id                # Update permission
DELETE /api/v1/permissions/:id                # Delete permission
```

#### Role Management
```
GET    /api/v1/roles                          # List all roles
GET    /api/v1/roles/:id                      # Get role details
POST   /api/v1/roles                          # Create new role
PUT    /api/v1/roles/:id                      # Update role
DELETE /api/v1/roles/:id                      # Delete role
GET    /api/v1/roles/templates                # Get role templates
POST   /api/v1/roles/:id/permissions          # Assign permissions to role
DELETE /api/v1/roles/:id/permissions/:permId  # Remove permission from role
```

#### User Role Management
```
GET    /api/v1/users/:id/roles                # Get user roles
POST   /api/v1/users/:id/roles                # Assign role to user
DELETE /api/v1/users/:id/roles/:roleId        # Remove role from user
GET    /api/v1/users/:id/permissions          # Get user permissions (flattened)
```

### 3. Middleware Implementation

#### Permission Check Middleware
```javascript
const checkPermission = (permission) => {
  return async (req, res, next) => {
    const user = req.user;
    const userPermissions = await getUserPermissions(user.id);
    
    if (userPermissions.includes(permission) || userPermissions.includes('*')) {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
};

// Usage in routes
app.get('/api/v1/dashboard', checkPermission('view_dashboard'), getDashboard);
app.post('/api/v1/users', checkPermission('create_users'), createUser);
```

#### Role Check Middleware
```javascript
const checkRole = (roles) => {
  return async (req, res, next) => {
    const user = req.user;
    const userRoles = await getUserRoles(user.id);
    
    const hasRole = roles.some(role => userRoles.includes(role));
    if (hasRole) {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient role privileges' });
    }
  };
};

// Usage in routes
app.get('/api/v1/admin', checkRole(['head_administrator', 'platform_admin']), getAdminPanel);
```

### 4. Helper Functions

```javascript
// Get all permissions for a user (flattened from roles)
const getUserPermissions = async (userId) => {
  const userRoles = await getUserRoles(userId);
  const permissions = await getRolePermissions(userRoles);
  return [...new Set(permissions)]; // Remove duplicates
};

// Get permissions by group
const getPermissionsByGroup = async (groupName) => {
  return await db.query(
    'SELECT * FROM permissions WHERE group_name = $1',
    [groupName]
  );
};

// Check if user has specific permission
const hasPermission = async (userId, permission) => {
  const userPermissions = await getUserPermissions(userId);
  return userPermissions.includes(permission) || userPermissions.includes('*');
};

// Check if user has any permission from a group
const hasGroupPermission = async (userId, groupName) => {
  const userPermissions = await getUserPermissions(userId);
  const groupPermissions = await getPermissionsByGroup(groupName);
  const groupPermissionNames = groupPermissions.map(p => p.name);
  
  return groupPermissionNames.some(permission => userPermissions.includes(permission));
};
```

### 5. Migration Script

```javascript
// Migration script to populate permissions and roles
const migrateRBAC = async () => {
  // 1. Insert all 90 permissions with group assignments
  const permissions = [
    // Core System & Dashboard
    { name: 'view_dashboard', group_name: 'CORE_SYSTEM_DASHBOARD', description: 'View dashboard and overview' },
    { name: 'view_analytics', group_name: 'CORE_SYSTEM_DASHBOARD', description: 'View analytics and reports' },
    // ... continue for all 90 permissions
  ];
  
  // 2. Insert all roles
  const roles = [
    { name: 'head_administrator', display_name: 'Head Administrator', description: 'Full system access' },
    { name: 'platform_admin', display_name: 'Platform Administrator', description: 'Platform administration' },
    // ... continue for all roles
  ];
  
  // 3. Assign permissions to roles
  const rolePermissions = [
    // Head Administrator gets all permissions
    { role_name: 'head_administrator', permissions: 'ALL' },
    // Other roles get specific permissions
    { role_name: 'enterprise_client', permissions: ['view_dashboard', 'view_fleet', 'manage_fleet', ...] },
    // ... continue for all roles
  ];
  
  await executeMigration(permissions, roles, rolePermissions);
};
```

### 6. Testing Requirements

#### Unit Tests
- Permission checking functions
- Role assignment functions
- Middleware functionality
- Helper functions

#### Integration Tests
- API endpoints for permission management
- API endpoints for role management
- User permission retrieval
- Role-based access control

#### Security Tests
- Unauthorized access attempts
- Permission escalation attempts
- Role manipulation attempts

### 7. Documentation Updates

#### API Documentation
- Update all endpoint documentation with permission requirements
- Document new permission system
- Provide examples of permission checking

#### Developer Documentation
- RBAC implementation guide
- Permission group explanations
- Role creation guidelines
- Security best practices

## Priority Implementation Order

1. **High Priority**: Database schema updates and migration
2. **High Priority**: Core permission checking middleware
3. **Medium Priority**: Role management APIs
4. **Medium Priority**: User role assignment APIs
5. **Low Priority**: Advanced features (role templates, bulk operations)

## Questions for Backend Team

1. What database system are you using? (PostgreSQL, MySQL, MongoDB, etc.)
2. What authentication system is currently in place?
3. Are there existing permission/role tables that need migration?
4. What's the preferred approach for permission caching?
5. Do you need real-time permission updates or is eventual consistency acceptable?

## Contact Information

For questions or clarifications about this RBAC implementation, please contact the frontend team or refer to the frontend implementation in `clutch-admin/src/lib/constants.ts`.

---

**Total Permissions**: 90 unique permissions across 7 functional groups
**New Role**: Head Administrator with full access
**Backward Compatibility**: Maintained for existing roles
