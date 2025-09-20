"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthManager = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const database_1 = require("./database");
const logger_1 = require("./logger");
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.db = new database_1.DatabaseManager();
        this.jwtSecret = process.env.JWT_SECRET || 'clutch-auto-parts-secret-key';
    }
    async initialize() {
        // Auth manager is initialized when database is ready
        logger_1.logger.info('Auth manager initialized');
    }
    async login(username, password) {
        try {
            // Find user by username or email
            const user = await this.db.get('SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1', [username, username]);
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
            const token = jwt.sign({
                userId: user.id,
                username: user.username,
                role: user.role
            }, this.jwtSecret, { expiresIn: '24h' });
            // Remove password hash from user object
            const { password_hash, ...userWithoutPassword } = user;
            this.currentUser = userWithoutPassword;
            logger_1.logger.info(`User ${username} logged in successfully`);
            return {
                success: true,
                user: userWithoutPassword,
                token
            };
        }
        catch (error) {
            logger_1.logger.error('Login error:', error);
            return {
                success: false,
                message: 'Login failed due to system error'
            };
        }
    }
    async logout() {
        try {
            this.currentUser = null;
            logger_1.logger.info('User logged out successfully');
            return {
                success: true,
                message: 'Logged out successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Logout error:', error);
            return {
                success: false,
                message: 'Logout failed'
            };
        }
    }
    async getCurrentUser() {
        return this.currentUser;
    }
    async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            const user = await this.db.get('SELECT * FROM users WHERE id = ? AND is_active = 1', [decoded.userId]);
            if (!user) {
                return {
                    success: false,
                    message: 'Invalid token'
                };
            }
            const { password_hash, ...userWithoutPassword } = user;
            this.currentUser = userWithoutPassword;
            return {
                success: true,
                user: userWithoutPassword
            };
        }
        catch (error) {
            logger_1.logger.error('Token verification error:', error);
            return {
                success: false,
                message: 'Invalid token'
            };
        }
    }
    async createUser(userData) {
        try {
            // Check if username or email already exists
            const existingUser = await this.db.get('SELECT id FROM users WHERE username = ? OR email = ?', [userData.username, userData.email]);
            if (existingUser) {
                return {
                    success: false,
                    message: 'Username or email already exists'
                };
            }
            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            // Insert user
            const result = await this.db.exec(`INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                userData.username,
                userData.email,
                hashedPassword,
                userData.role || 'cashier',
                userData.first_name,
                userData.last_name,
                userData.phone || null
            ]);
            // Get the created user
            const newUser = await this.db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
            const { password_hash, ...userWithoutPassword } = newUser;
            logger_1.logger.info(`User ${userData.username} created successfully`);
            return {
                success: true,
                user: userWithoutPassword
            };
        }
        catch (error) {
            logger_1.logger.error('Create user error:', error);
            return {
                success: false,
                message: 'Failed to create user'
            };
        }
    }
    async updateUser(userId, userData) {
        try {
            const updateFields = [];
            const updateValues = [];
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
            await this.db.exec(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
            // Get updated user
            const updatedUser = await this.db.get('SELECT * FROM users WHERE id = ?', [userId]);
            const { password_hash, ...userWithoutPassword } = updatedUser;
            logger_1.logger.info(`User ${userId} updated successfully`);
            return {
                success: true,
                user: userWithoutPassword
            };
        }
        catch (error) {
            logger_1.logger.error('Update user error:', error);
            return {
                success: false,
                message: 'Failed to update user'
            };
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            // Get current user
            const user = await this.db.get('SELECT password_hash FROM users WHERE id = ?', [userId]);
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
            await this.db.exec('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedNewPassword, userId]);
            logger_1.logger.info(`Password changed for user ${userId}`);
            return {
                success: true,
                message: 'Password changed successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Change password error:', error);
            return {
                success: false,
                message: 'Failed to change password'
            };
        }
    }
    async getAllUsers() {
        try {
            const users = await this.db.query('SELECT id, username, email, role, first_name, last_name, phone, is_active, created_at, updated_at FROM users ORDER BY created_at DESC');
            return users;
        }
        catch (error) {
            logger_1.logger.error('Get all users error:', error);
            return [];
        }
    }
    async deleteUser(userId) {
        try {
            // Check if user exists
            const user = await this.db.get('SELECT id FROM users WHERE id = ?', [userId]);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            // Soft delete (set is_active to false)
            await this.db.exec('UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
            logger_1.logger.info(`User ${userId} deleted successfully`);
            return {
                success: true,
                message: 'User deleted successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Delete user error:', error);
            return {
                success: false,
                message: 'Failed to delete user'
            };
        }
    }
    hasPermission(user, permission) {
        const rolePermissions = {
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
exports.AuthManager = AuthManager;
//# sourceMappingURL=auth.js.map