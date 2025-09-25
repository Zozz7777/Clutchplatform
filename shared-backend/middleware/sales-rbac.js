const { SalesEmployee } = require('../models/SalesEmployee');

/**
 * Sales RBAC Middleware
 * Enforces role-based access control for sales endpoints
 */

function authorize(requiredRoles) {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required'
        });
      }

      // Get user role from JWT token
      const userRole = req.user.role;
      
      // Convert single role to array for consistent handling
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      
      // Map frontend roles to backend roles
      const roleMapping = {
        'sales_representative': 'sales_rep',
        'sales_manager': 'sales_manager',
        'admin': 'admin',
        'super_admin': 'admin',
        'head_administrator': 'admin',
        'executive': 'admin',
        'platform_admin': 'admin',
        'legal_team': 'legal',
        'hr_manager': 'hr',
        'hr': 'hr'
      };
      
      const mappedRole = roleMapping[userRole] || userRole;
      
      // Check if user role is in required roles
      if (!roles.includes(mappedRole)) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${userRole} (mapped to: ${mappedRole})`
        });
      }

      // Additional permission checks for specific actions
      if (req.route && req.route.path) {
        const path = req.route.path;
        const method = req.method;
        
        // Contract approval requires legal role
        if (path.includes('/contracts/:id/status') && method === 'PATCH') {
          const legalRoles = ['legal', 'admin', 'sysadmin'];
          if (!legalRoles.includes(mappedRole)) {
            return res.status(403).json({
              success: false,
              error: 'FORBIDDEN',
              message: 'Only legal team members can approve/reject contracts'
            });
          }
        }
        
        // Manager approval step
        if (path.includes('/approvals') && method === 'PATCH') {
          const managerRoles = ['sales_manager', 'b2b_director', 'admin', 'sysadmin'];
          if (!managerRoles.includes(mappedRole)) {
            return res.status(403).json({
              success: false,
              error: 'FORBIDDEN',
              message: 'Only managers can approve/reject requests'
            });
          }
        }
        
        // HR reports access
        if (path.includes('/performance/hr')) {
          const hrRoles = ['hr', 'admin', 'sysadmin'];
          if (!hrRoles.includes(mappedRole)) {
            return res.status(403).json({
              success: false,
              error: 'FORBIDDEN',
              message: 'Only HR team can access HR performance reports'
            });
          }
        }
      }

      // Add user info to request for use in route handlers
      req.salesUser = {
        id: req.user.id,
        role: mappedRole,
        email: req.user.email,
        name: req.user.name
      };

      next();
    } catch (error) {
      console.error('Sales RBAC middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Authorization check failed'
      });
    }
  };
}

/**
 * Check if user can perform specific sales action
 */
function canPerformAction(userRole, action) {
  // Map frontend roles to backend roles
  const roleMapping = {
    'sales_representative': 'sales_rep',
    'sales_manager': 'sales_manager',
    'admin': 'admin',
    'super_admin': 'admin',
    'head_administrator': 'admin',
    'executive': 'admin',
    'platform_admin': 'admin',
    'legal_team': 'legal',
    'hr_manager': 'hr',
    'hr': 'hr'
  };
  
  const mappedRole = roleMapping[userRole] || userRole;
  
  const permissions = {
    'sysadmin': ['*'], // All permissions
    'admin': ['*'], // All permissions
    'sales_rep': [
      'create_lead', 'update_lead', 'view_lead', 'delete_lead',
      'create_deal', 'update_deal', 'view_deal',
      'create_contract_draft', 'upload_contract',
      'create_communication', 'view_communication',
      'create_activity', 'view_activity',
      'view_personal_performance'
    ],
    'sales_manager': [
      'create_lead', 'update_lead', 'view_lead', 'delete_lead',
      'create_deal', 'update_deal', 'view_deal', 'delete_deal',
      'create_contract_draft', 'upload_contract',
      'create_communication', 'view_communication',
      'create_activity', 'view_activity',
      'view_team_performance', 'view_team_reports',
      'approve_manager_requests', 'assign_leads'
    ],
    'b2b_director': [
      'create_lead', 'update_lead', 'view_lead', 'delete_lead',
      'create_deal', 'update_deal', 'view_deal', 'delete_deal',
      'create_contract_draft', 'upload_contract',
      'create_communication', 'view_communication',
      'create_activity', 'view_activity',
      'view_team_performance', 'view_team_reports',
      'approve_manager_requests', 'assign_leads',
      'view_b2b_reports', 'approve_b2b_deals'
    ],
    'legal': [
      'view_contracts', 'approve_contracts', 'reject_contracts',
      'view_legal_queue', 'view_contract_history'
    ],
    'hr': [
      'view_hr_reports', 'view_team_workload', 'view_quota_achievement'
    ],
    'auditor': [
      'view_sales_data', 'view_contracts', 'view_approvals',
      'view_performance_data'
    ]
  };

  const userPermissions = permissions[mappedRole] || [];
  return userPermissions.includes('*') || userPermissions.includes(action);
}

/**
 * Middleware to check specific action permissions
 */
function requirePermission(action) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    if (!canPerformAction(userRole, action)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `Permission denied for action: ${action}`
      });
    }

    next();
  };
}

/**
 * Get user's accessible data based on role
 */
function getDataAccessFilter(userRole, userId) {
  // Map frontend roles to backend roles
  const roleMapping = {
    'sales_representative': 'sales_rep',
    'sales_manager': 'sales_manager',
    'admin': 'admin',
    'super_admin': 'admin',
    'head_administrator': 'admin',
    'executive': 'admin',
    'platform_admin': 'admin',
    'legal_team': 'legal',
    'hr_manager': 'hr',
    'hr': 'hr'
  };
  
  const mappedRole = roleMapping[userRole] || userRole;
  
  switch (mappedRole) {
    case 'sysadmin':
    case 'admin':
      return {}; // Access to all data
    
    case 'sales_manager':
    case 'b2b_director':
      return {
        $or: [
          { assignedTo: userId },
          { createdBy: userId }
        ]
      };
    
    case 'sales_rep':
      return {
        $or: [
          { assignedTo: userId },
          { createdBy: userId }
        ]
      };
    
    case 'legal':
      return { status: { $in: ['signed_uploaded', 'pending_legal'] } };
    
    case 'hr':
      return {}; // HR can view all performance data
    
    case 'auditor':
      return {}; // Read-only access to all data
    
    default:
      return { createdBy: userId }; // Only own data
  }
}

module.exports = {
  authorize,
  canPerformAction,
  requirePermission,
  getDataAccessFilter
};
