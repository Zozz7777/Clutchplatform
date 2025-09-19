import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { DatabaseManager } from './database';
import { logger } from './logger';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export class AuthManager {
  private db: DatabaseManager;
  private currentUser: User | null = null;
  private jwtSecret: string;

  constructor() {
    this.db = new DatabaseManager();
    this.jwtSecret = process.env.JWT_SECRET || 'clutch-auto-parts-secret-key';
  }

  async initialize(): Promise<void> {
    // Auth manager is initialized when database is ready
    logger.info('Auth manager initialized');
  }

  async login(username: string, password: string): Promise<AuthResult> {
    try {
      // Find user by username or email
      const user = await this.db.get(
        'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1',
        [username, username]
      );

      if (!user) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        },
        this.jwtSecret,
        { expiresIn: '24h' }
      );

      // Remove password hash from user object
      const { password_hash, ...userWithoutPassword } = user;

      this.currentUser = userWithoutPassword as User;

      logger.info(`User ${username} logged in successfully`);

      return {
        success: true,
        user: userWithoutPassword as User,
        token
      };

    } catch (error) {
      logger.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed due to system error'
      };
    }
  }

  async logout(): Promise<AuthResult> {
    try {
      this.currentUser = null;
      logger.info('User logged out successfully');
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      logger.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed'
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async verifyToken(token: string): Promise<AuthResult> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      const user = await this.db.get(
        'SELECT * FROM users WHERE id = ? AND is_active = 1',
        [decoded.userId]
      );

      if (!user) {
        return {
          success: false,
          message: 'Invalid token'
        };
      }

      const { password_hash, ...userWithoutPassword } = user;
      this.currentUser = userWithoutPassword as User;

      return {
        success: true,
        user: userWithoutPassword as User
      };

    } catch (error) {
      logger.error('Token verification error:', error);
      return {
        success: false,
        message: 'Invalid token'
      };
    }
  }

  async createUser(userData: Partial<User> & { password: string }): Promise<AuthResult> {
    try {
      // Check if username or email already exists
      const existingUser = await this.db.get(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [userData.username, userData.email]
      );

      if (existingUser) {
        return {
          success: false,
          message: 'Username or email already exists'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Insert user
      const result = await this.db.exec(
        `INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.username,
          userData.email,
          hashedPassword,
          userData.role || 'cashier',
          userData.first_name,
          userData.last_name,
          userData.phone || null
        ]
      );

      // Get the created user
      const newUser = await this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [result.lastID]
      );

      const { password_hash, ...userWithoutPassword } = newUser;

      logger.info(`User ${userData.username} created successfully`);

      return {
        success: true,
        user: userWithoutPassword as User
      };

    } catch (error) {
      logger.error('Create user error:', error);
      return {
        success: false,
        message: 'Failed to create user'
      };
    }
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<AuthResult> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (userData.first_name) {
        updateFields.push('first_name = ?');
        updateValues.push(userData.first_name);
      }
      if (userData.last_name) {
        updateFields.push('last_name = ?');
        updateValues.push(userData.last_name);
      }
      if (userData.email) {
        updateFields.push('email = ?');
        updateValues.push(userData.email);
      }
      if (userData.phone) {
        updateFields.push('phone = ?');
        updateValues.push(userData.phone);
      }
      if (userData.role) {
        updateFields.push('role = ?');
        updateValues.push(userData.role);
      }
      if (userData.is_active !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(userData.is_active ? 1 : 0);
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(userId);

      await this.db.exec(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      // Get updated user
      const updatedUser = await this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      const { password_hash, ...userWithoutPassword } = updatedUser;

      logger.info(`User ${userId} updated successfully`);

      return {
        success: true,
        user: userWithoutPassword as User
      };

    } catch (error) {
      logger.error('Update user error:', error);
      return {
        success: false,
        message: 'Failed to update user'
      };
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      // Get current user
      const user = await this.db.get(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.db.exec(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedNewPassword, userId]
      );

      logger.info(`Password changed for user ${userId}`);

      return {
        success: true,
        message: 'Password changed successfully'
      };

    } catch (error) {
      logger.error('Change password error:', error);
      return {
        success: false,
        message: 'Failed to change password'
      };
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const users = await this.db.query(
        'SELECT id, username, email, role, first_name, last_name, phone, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
      );

      return users as User[];
    } catch (error) {
      logger.error('Get all users error:', error);
      return [];
    }
  }

  async deleteUser(userId: number): Promise<AuthResult> {
    try {
      // Check if user exists
      const user = await this.db.get(
        'SELECT id FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Soft delete (set is_active to false)
      await this.db.exec(
        'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
      );

      logger.info(`User ${userId} deleted successfully`);

      return {
        success: true,
        message: 'User deleted successfully'
      };

    } catch (error) {
      logger.error('Delete user error:', error);
      return {
        success: false,
        message: 'Failed to delete user'
      };
    }
  }

  hasPermission(user: User, permission: string): boolean {
    const rolePermissions: Record<string, string[]> = {
      owner: ['*'], // All permissions
      manager: [
        'inventory.view', 'inventory.edit', 'inventory.delete',
        'sales.view', 'sales.create', 'sales.edit',
        'customers.view', 'customers.edit',
        'suppliers.view', 'suppliers.edit',
        'reports.view', 'reports.create'
      ],
      accountant: [
        'inventory.view',
        'sales.view',
        'customers.view',
        'suppliers.view',
        'reports.view', 'reports.create',
        'finance.view', 'finance.edit'
      ],
      cashier: [
        'sales.view', 'sales.create',
        'customers.view',
        'inventory.view'
      ],
      auditor: [
        'inventory.view',
        'sales.view',
        'customers.view',
        'suppliers.view',
        'reports.view'
      ],
      sysadmin: [
        'system.view', 'system.edit',
        'users.view', 'users.edit',
        'settings.view', 'settings.edit'
      ]
    };

    const permissions = rolePermissions[user.role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  }
}
