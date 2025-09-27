const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// GET /api/v1/admin/roles - Get all roles
router.get('/', authenticateToken, requirePermission('view_users'), async (req, res) => {
  try {
    const db = require('../config/database');
    const rolesCollection = db.collection('roles');
    const usersCollection = db.collection('users');

    // Get all roles
    const roles = await rolesCollection.find({}).toArray();

    // Get user count for each role
    const rolesWithUserCount = await Promise.all(
      roles.map(async (role) => {
        const userCount = await usersCollection.countDocuments({ role: role.name });
        return {
          ...role,
          userCount
        };
      })
    );

    logger.info(`✅ Retrieved ${rolesWithUserCount.length} roles`);

    res.json({
      success: true,
      data: rolesWithUserCount,
      message: 'Roles retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get roles error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_ROLES_FAILED',
      message: 'Failed to retrieve roles',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/admin/roles/:id - Get role by ID
router.get('/:id', authenticateToken, requirePermission('view_users'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const db = require('../config/database');
    const rolesCollection = db.collection('roles');
    const usersCollection = db.collection('users');

    const role = await rolesCollection.findOne({ _id: id });
    
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'ROLE_NOT_FOUND',
        message: 'Role not found',
        timestamp: new Date().toISOString()
      });
    }

    // Get users with this role
    const users = await usersCollection.find({ role: role.name }).toArray();

    res.json({
      success: true,
      data: {
        ...role,
        users: users.map(user => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          status: user.status || 'active',
          lastLogin: user.lastLogin || null
        }))
      },
      message: 'Role retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get role error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_ROLE_FAILED',
      message: 'Failed to retrieve role',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/admin/roles - Create new role
router.post('/', authenticateToken, requirePermission('manage_users'), async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Validate required fields
    if (!name || !description || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, description, and permissions are required',
        timestamp: new Date().toISOString()
      });
    }

    // Check if role already exists
    const db = require('../config/database');
    const rolesCollection = db.collection('roles');
    
    const existingRole = await rolesCollection.findOne({ name });
    if (existingRole) {
      return res.status(409).json({
        success: false,
        error: 'ROLE_ALREADY_EXISTS',
        message: 'Role with this name already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Create new role
    const newRole = {
      name,
      description,
      permissions,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.userId
    };

    const result = await rolesCollection.insertOne(newRole);

    logger.info(`✅ Created new role: ${name}`);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...newRole
      },
      message: 'Role created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Create role error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_ROLE_FAILED',
      message: 'Failed to create role',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/admin/roles/:id - Update role
router.put('/:id', authenticateToken, requirePermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    // Validate required fields
    if (!name || !description || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, description, and permissions are required',
        timestamp: new Date().toISOString()
      });
    }

    const db = require('../config/database');
    const rolesCollection = db.collection('roles');

    // Check if role exists
    const existingRole = await rolesCollection.findOne({ _id: id });
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        error: 'ROLE_NOT_FOUND',
        message: 'Role not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if it's a system role
    if (existingRole.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'SYSTEM_ROLE_PROTECTED',
        message: 'Cannot modify system roles',
        timestamp: new Date().toISOString()
      });
    }

    // Check if name is being changed and if new name already exists
    if (name !== existingRole.name) {
      const nameExists = await rolesCollection.findOne({ name, _id: { $ne: id } });
      if (nameExists) {
        return res.status(409).json({
          success: false,
          error: 'ROLE_NAME_EXISTS',
          message: 'Role with this name already exists',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Update role
    const updateData = {
      name,
      description,
      permissions,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.userId
    };

    await rolesCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );

    logger.info(`✅ Updated role: ${name}`);

    res.json({
      success: true,
      data: {
        id,
        ...updateData
      },
      message: 'Role updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Update role error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_ROLE_FAILED',
      message: 'Failed to update role',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/admin/roles/:id - Delete role
router.delete('/:id', authenticateToken, requirePermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params;

    const db = require('../config/database');
    const rolesCollection = db.collection('roles');
    const usersCollection = db.collection('users');

    // Check if role exists
    const role = await rolesCollection.findOne({ _id: id });
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'ROLE_NOT_FOUND',
        message: 'Role not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if it's a system role
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'SYSTEM_ROLE_PROTECTED',
        message: 'Cannot delete system roles',
        timestamp: new Date().toISOString()
      });
    }

    // Check if any users are assigned to this role
    const userCount = await usersCollection.countDocuments({ role: role.name });
    if (userCount > 0) {
      return res.status(409).json({
        success: false,
        error: 'ROLE_IN_USE',
        message: `Cannot delete role. ${userCount} users are assigned to this role.`,
        timestamp: new Date().toISOString()
      });
    }

    // Delete role
    await rolesCollection.deleteOne({ _id: id });

    logger.info(`✅ Deleted role: ${role.name}`);

    res.json({
      success: true,
      data: {
        id,
        name: role.name
      },
      message: 'Role deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Delete role error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_ROLE_FAILED',
      message: 'Failed to delete role',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/admin/roles/:id/assign - Assign role to user
router.post('/:id/assign', authenticateToken, requirePermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_USER_ID',
        message: 'User ID is required',
        timestamp: new Date().toISOString()
      });
    }

    const db = require('../config/database');
    const rolesCollection = db.collection('roles');
    const usersCollection = db.collection('users');

    // Check if role exists
    const role = await rolesCollection.findOne({ _id: id });
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'ROLE_NOT_FOUND',
        message: 'Role not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user exists
    const user = await usersCollection.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Update user role
    await usersCollection.updateOne(
      { _id: userId },
      { 
        $set: { 
          role: role.name,
          updatedAt: new Date().toISOString(),
          updatedBy: req.user.userId
        } 
      }
    );

    logger.info(`✅ Assigned role ${role.name} to user ${userId}`);

    res.json({
      success: true,
      data: {
        userId,
        roleId: id,
        roleName: role.name
      },
      message: 'Role assigned successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Assign role error:', error);
    res.status(500).json({
      success: false,
      error: 'ASSIGN_ROLE_FAILED',
      message: 'Failed to assign role',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/admin/roles/permissions - Get all available permissions
router.get('/permissions', authenticateToken, requirePermission('view_users'), async (req, res) => {
  try {
    const permissions = {
      'Core System': [
        'view_dashboard',
        'view_analytics',
        'export_analytics',
        'view_system_health',
        'view_kpi_metrics',
        'manage_kpi_metrics'
      ],
      'User Management': [
        'view_users',
        'create_users',
        'edit_users',
        'delete_users',
        'view_employees',
        'manage_employees'
      ],
      'Fleet Operations': [
        'view_fleet',
        'manage_fleet',
        'view_gps_tracking',
        'view_assets',
        'manage_assets'
      ],
      'Business & Customer': [
        'view_crm',
        'manage_crm',
        'view_enterprise',
        'manage_enterprise',
        'view_finance',
        'manage_finance'
      ],
      'Technology': [
        'view_ai_dashboard',
        'manage_ai_models',
        'view_mobile_apps',
        'manage_mobile_apps',
        'view_cms',
        'manage_cms'
      ],
      'Communication': [
        'view_chat',
        'send_messages',
        'view_communication',
        'manage_communication',
        'view_support',
        'manage_support'
      ],
      'Administration': [
        'view_settings',
        'manage_settings',
        'view_reports',
        'generate_reports',
        'view_audit_trail',
        'view_marketing'
      ]
    };

    res.json({
      success: true,
      data: { permissions },
      message: 'Permissions retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PERMISSIONS_FAILED',
      message: 'Failed to retrieve permissions',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
