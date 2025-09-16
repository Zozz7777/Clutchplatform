const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const { 
  checkPermission, 
  checkRole, 
  checkAnyPermission,
  getUserPermissions 
} = require('../middleware/rbac');

// ==================== PERMISSION MANAGEMENT ====================

// GET /api/v1/rbac/permissions - List all permissions
router.get('/permissions', checkPermission('view_settings'), async (req, res) => {
  try {
    const permissions = await Permission.find({ isActive: true })
      .sort({ groupName: 1, name: 1 })
      .select('name groupName description isSystem createdAt');

    // Group permissions by group
    const groupedPermissions = permissions.reduce((groups, permission) => {
      if (!groups[permission.groupName]) {
        groups[permission.groupName] = [];
      }
      groups[permission.groupName].push(permission);
      return groups;
    }, {});

    res.json({
      success: true,
      permissions: groupedPermissions,
      totalPermissions: permissions.length
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get permissions' 
    });
  }
});

// GET /api/v1/rbac/permissions/groups - List permission groups
router.get('/permissions/groups', checkPermission('view_settings'), async (req, res) => {
  try {
    const groups = await Permission.distinct('groupName', { isActive: true });
    
    const groupInfo = {
      'CORE_SYSTEM_DASHBOARD': 'Core System & Dashboard',
      'USER_ORGANIZATION': 'User & Organization',
      'FLEET_OPERATIONS': 'Fleet & Operations',
      'BUSINESS_CUSTOMER': 'Business & Customer',
      'TECHNOLOGY_DEVELOPMENT': 'Technology & Development',
      'COMMUNICATION_SUPPORT': 'Communication & Support',
      'ADMINISTRATION_CONFIG': 'Administration & Config'
    };

    const groupDetails = groups.map(group => ({
      name: group,
      displayName: groupInfo[group] || group,
      count: 0 // Will be populated by frontend
    }));

    res.json({
      success: true,
      groups: groupDetails
    });
  } catch (error) {
    console.error('Get permission groups error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get permission groups' 
    });
  }
});

// GET /api/v1/rbac/permissions/group/:groupName - Get permissions by group
router.get('/permissions/group/:groupName', checkPermission('view_settings'), async (req, res) => {
  try {
    const { groupName } = req.params;
    const permissions = await Permission.find({ 
      groupName, 
      isActive: true 
    }).sort({ name: 1 });

    res.json({
      success: true,
      groupName,
      permissions
    });
  } catch (error) {
    console.error('Get permissions by group error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get permissions by group' 
    });
  }
});

// POST /api/v1/rbac/permissions - Create new permission
router.post('/permissions', checkPermission('manage_settings'), async (req, res) => {
  try {
    const { name, groupName, description } = req.body;

    if (!name || !groupName) {
      return res.status(400).json({
        success: false,
        error: 'Name and groupName are required'
      });
    }

    const existingPermission = await Permission.findOne({ name });
    if (existingPermission) {
      return res.status(400).json({
        success: false,
        error: 'Permission with this name already exists'
      });
    }

    const permission = new Permission({
      name,
      groupName,
      description,
      createdBy: req.user.id
    });

    await permission.save();

    res.status(201).json({
      success: true,
      permission
    });
  } catch (error) {
    console.error('Create permission error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create permission' 
    });
  }
});

// ==================== ROLE MANAGEMENT ====================

// GET /api/v1/rbac/roles - List all roles
router.get('/roles', checkPermission('view_settings'), async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true })
      .populate('permissions', 'name groupName description')
      .sort({ priority: 1, name: 1 })
      .select('name displayName description permissions isSystem priority createdAt');

    res.json({
      success: true,
      roles
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get roles' 
    });
  }
});

// GET /api/v1/rbac/roles/:id - Get role details
router.get('/roles/:id', checkPermission('view_settings'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate('permissions', 'name groupName description')
      .populate('createdBy', 'basicInfo.firstName basicInfo.lastName')
      .populate('updatedBy', 'basicInfo.firstName basicInfo.lastName');

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    res.json({
      success: true,
      role
    });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get role' 
    });
  }
});

// POST /api/v1/rbac/roles - Create new role
router.post('/roles', checkPermission('manage_settings'), async (req, res) => {
  try {
    const { name, displayName, description, permissions, priority } = req.body;

    if (!name || !displayName) {
      return res.status(400).json({
        success: false,
        error: 'Name and displayName are required'
      });
    }

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        error: 'Role with this name already exists'
      });
    }

    const role = new Role({
      name,
      displayName,
      description,
      permissions: permissions || [],
      priority: priority || 100,
      createdBy: req.user.id
    });

    await role.save();
    await role.populate('permissions', 'name groupName description');

    res.status(201).json({
      success: true,
      role
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create role' 
    });
  }
});

// PUT /api/v1/rbac/roles/:id - Update role
router.put('/roles/:id', checkPermission('manage_settings'), async (req, res) => {
  try {
    const { displayName, description, permissions, priority, isActive } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Prevent modification of system roles
    if (role.isSystem && (permissions !== undefined || priority !== undefined)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify permissions or priority of system roles'
      });
    }

    if (displayName !== undefined) role.displayName = displayName;
    if (description !== undefined) role.description = description;
    if (permissions !== undefined) role.permissions = permissions;
    if (priority !== undefined) role.priority = priority;
    if (isActive !== undefined) role.isActive = isActive;
    
    role.updatedBy = req.user.id;

    await role.save();
    await role.populate('permissions', 'name groupName description');

    res.json({
      success: true,
      role
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update role' 
    });
  }
});

// DELETE /api/v1/rbac/roles/:id - Delete role
router.delete('/roles/:id', checkPermission('manage_settings'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Prevent deletion of system roles
    if (role.isSystem) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete system roles'
      });
    }

    // Check if role is assigned to any employees
    const employeesWithRole = await Employee.find({ 
      $or: [
        { role: role.name },
        { roles: role._id }
      ]
    });

    if (employeesWithRole.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete role that is assigned to employees',
        assignedEmployees: employeesWithRole.length
      });
    }

    await Role.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete role' 
    });
  }
});

// GET /api/v1/rbac/roles/templates - Get role templates
router.get('/roles/templates', checkPermission('view_settings'), async (req, res) => {
  try {
    const templates = {
      CORE_SYSTEM_ADMIN: {
        name: 'Core System Admin',
        description: 'Core system and dashboard administration',
        permissions: ['CORE_SYSTEM_DASHBOARD', 'ADMINISTRATION_CONFIG']
      },
      USER_ADMIN: {
        name: 'User Admin',
        description: 'User and organization management',
        permissions: ['USER_ORGANIZATION', 'COMMUNICATION_SUPPORT']
      },
      FLEET_ADMIN: {
        name: 'Fleet Admin',
        description: 'Fleet operations and business management',
        permissions: ['FLEET_OPERATIONS', 'BUSINESS_CUSTOMER']
      },
      BUSINESS_ADMIN: {
        name: 'Business Admin',
        description: 'Business and customer management',
        permissions: ['BUSINESS_CUSTOMER', 'ADMINISTRATION_CONFIG']
      },
      TECHNOLOGY_ADMIN: {
        name: 'Technology Admin',
        description: 'Technology and development management',
        permissions: ['TECHNOLOGY_DEVELOPMENT', 'ADMINISTRATION_CONFIG']
      },
      SUPPORT_ADMIN: {
        name: 'Support Admin',
        description: 'Communication and support management',
        permissions: ['COMMUNICATION_SUPPORT', 'USER_ORGANIZATION']
      },
      CONFIG_ADMIN: {
        name: 'Config Admin',
        description: 'System configuration and administration',
        permissions: ['ADMINISTRATION_CONFIG', 'CORE_SYSTEM_DASHBOARD']
      }
    };

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Get role templates error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get role templates' 
    });
  }
});

// POST /api/v1/rbac/roles/:id/permissions - Assign permissions to role
router.post('/roles/:id/permissions', checkPermission('manage_settings'), async (req, res) => {
  try {
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds)) {
      return res.status(400).json({
        success: false,
        error: 'permissionIds must be an array'
      });
    }

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Prevent modification of system roles
    if (role.isSystem) {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify permissions of system roles'
      });
    }

    // Validate permission IDs
    const validPermissions = await Permission.find({ 
      _id: { $in: permissionIds }, 
      isActive: true 
    });

    if (validPermissions.length !== permissionIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Some permission IDs are invalid'
      });
    }

    role.permissions = permissionIds;
    role.updatedBy = req.user.id;
    await role.save();

    await role.populate('permissions', 'name groupName description');

    res.json({
      success: true,
      role
    });
  } catch (error) {
    console.error('Assign permissions to role error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to assign permissions to role' 
    });
  }
});

// DELETE /api/v1/rbac/roles/:id/permissions/:permissionId - Remove permission from role
router.delete('/roles/:id/permissions/:permissionId', checkPermission('manage_settings'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Prevent modification of system roles
    if (role.isSystem) {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify permissions of system roles'
      });
    }

    role.permissions = role.permissions.filter(
      p => p.toString() !== req.params.permissionId
    );
    role.updatedBy = req.user.id;
    await role.save();

    await role.populate('permissions', 'name groupName description');

    res.json({
      success: true,
      role
    });
  } catch (error) {
    console.error('Remove permission from role error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to remove permission from role' 
    });
  }
});

// ==================== USER ROLE MANAGEMENT ====================

// GET /api/v1/rbac/users/:id/roles - Get user roles
router.get('/users/:id/roles', checkPermission('view_users'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('roles', 'name displayName description permissions')
      .select('role roles');

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    res.json({
      success: true,
      primaryRole: employee.role,
      roles: employee.roles
    });
  } catch (error) {
    console.error('Get user roles error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get user roles' 
    });
  }
});

// POST /api/v1/rbac/users/:id/roles - Assign role to user
router.post('/users/:id/roles', checkPermission('edit_users'), async (req, res) => {
  try {
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        error: 'roleId is required'
      });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const role = await Role.findById(roleId);
    if (!role || !role.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Role not found or inactive'
      });
    }

    // Check if user already has this role
    if (employee.roles.includes(roleId)) {
      return res.status(400).json({
        success: false,
        error: 'Employee already has this role'
      });
    }

    employee.roles.push(roleId);
    await employee.save();

    await employee.populate('roles', 'name displayName description');

    res.json({
      success: true,
      employee: {
        id: employee._id,
        roles: employee.roles
      }
    });
  } catch (error) {
    console.error('Assign role to user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to assign role to user' 
    });
  }
});

// DELETE /api/v1/rbac/users/:id/roles/:roleId - Remove role from user
router.delete('/users/:id/roles/:roleId', checkPermission('edit_users'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    employee.roles = employee.roles.filter(
      role => role.toString() !== req.params.roleId
    );
    await employee.save();

    await employee.populate('roles', 'name displayName description');

    res.json({
      success: true,
      employee: {
        id: employee._id,
        roles: employee.roles
      }
    });
  } catch (error) {
    console.error('Remove role from user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to remove role from user' 
    });
  }
});

// GET /api/v1/rbac/users/:id/permissions - Get user permissions (flattened)
router.get('/users/:id/permissions', checkPermission('view_users'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const permissions = await employee.getAllPermissions();
    
    // Group permissions by group name
    const groupedPermissions = permissions.reduce((groups, permission) => {
      if (!groups[permission.groupName]) {
        groups[permission.groupName] = [];
      }
      groups[permission.groupName].push({
        name: permission.name,
        description: permission.description
      });
      return groups;
    }, {});

    res.json({
      success: true,
      permissions: groupedPermissions,
      totalPermissions: permissions.length
    });
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get user permissions' 
    });
  }
});

// GET /api/v1/rbac/my-permissions - Get current user's permissions
router.get('/my-permissions', getUserPermissions);

module.exports = router;
