import express from 'express';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { logger } from '../../lib/logger';

const router = express.Router();
const databaseManager = new DatabaseManager();
const authManager = new AuthManager();

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'Username and password are required',
        timestamp: new Date().toISOString()
      });
    }

    const result = await authManager.login(username, password);

    if (result.success) {
      res.json({
        success: true,
        data: {
          user: result.user,
          token: result.token
        },
        message: 'Login successful',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: result.message || 'Invalid username or password',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'LOGIN_FAILED',
      message: 'Login failed due to system error',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', async (req, res) => {
  try {
    const result = await authManager.logout();

    res.json({
      success: true,
      message: result.message || 'Logout successful',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'LOGOUT_FAILED',
      message: 'Logout failed',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', async (req, res) => {
  try {
    const user = await authManager.getCurrentUser();

    if (user) {
      res.json({
        success: true,
        data: { user },
        message: 'User retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'NOT_AUTHENTICATED',
        message: 'User not authenticated',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_USER_FAILED',
      message: 'Failed to get current user',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/verify - Verify token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_TOKEN',
        message: 'Token is required',
        timestamp: new Date().toISOString()
      });
    }

    const result = await authManager.verifyToken(token);

    if (result.success) {
      res.json({
        success: true,
        data: { user: result.user },
        message: 'Token verified successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: result.message || 'Invalid token',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'TOKEN_VERIFICATION_FAILED',
      message: 'Token verification failed',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/change-password - Change password
router.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_DATA',
        message: 'User ID, current password, and new password are required',
        timestamp: new Date().toISOString()
      });
    }

    const result = await authManager.changePassword(userId, currentPassword, newPassword);

    if (result.success) {
      res.json({
        success: true,
        message: result.message || 'Password changed successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'PASSWORD_CHANGE_FAILED',
        message: result.message || 'Failed to change password',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'PASSWORD_CHANGE_ERROR',
      message: 'Password change failed due to system error',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/auth/users - Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const currentUser = await authManager.getCurrentUser();

    if (!currentUser || !authManager.hasPermission(currentUser, 'users.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to view users',
        timestamp: new Date().toISOString()
      });
    }

    const users = await authManager.getAllUsers();

    res.json({
      success: true,
      data: { users },
      message: 'Users retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_USERS_FAILED',
      message: 'Failed to retrieve users',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/users - Create new user (admin only)
router.post('/users', async (req, res) => {
  try {
    const currentUser = await authManager.getCurrentUser();

    if (!currentUser || !authManager.hasPermission(currentUser, 'users.create')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to create users',
        timestamp: new Date().toISOString()
      });
    }

    const userData = req.body;
    const result = await authManager.createUser(userData);

    if (result.success) {
      res.status(201).json({
        success: true,
        data: { user: result.user },
        message: 'User created successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'USER_CREATION_FAILED',
        message: result.message || 'Failed to create user',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: 'USER_CREATION_ERROR',
      message: 'User creation failed due to system error',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/auth/users/:id - Update user (admin only)
router.put('/users/:id', async (req, res) => {
  try {
    const currentUser = await authManager.getCurrentUser();

    if (!currentUser || !authManager.hasPermission(currentUser, 'users.edit')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to edit users',
        timestamp: new Date().toISOString()
      });
    }

    const userId = parseInt(req.params.id);
    const userData = req.body;
    const result = await authManager.updateUser(userId, userData);

    if (result.success) {
      res.json({
        success: true,
        data: { user: result.user },
        message: 'User updated successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'USER_UPDATE_FAILED',
        message: result.message || 'Failed to update user',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'USER_UPDATE_ERROR',
      message: 'User update failed due to system error',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/auth/users/:id - Delete user (admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const currentUser = await authManager.getCurrentUser();

    if (!currentUser || !authManager.hasPermission(currentUser, 'users.delete')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to delete users',
        timestamp: new Date().toISOString()
      });
    }

    const userId = parseInt(req.params.id);
    const result = await authManager.deleteUser(userId);

    if (result.success) {
      res.json({
        success: true,
        message: result.message || 'User deleted successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'USER_DELETION_FAILED',
        message: result.message || 'Failed to delete user',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'USER_DELETION_ERROR',
      message: 'User deletion failed due to system error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
