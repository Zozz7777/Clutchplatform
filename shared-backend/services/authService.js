const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userService = require('../services/userService');
const Role = require('../models/Role');
const Session = require('../models/session');
const MFASetup = require('../models/mfaSetup');
const AuditLog = require('../models/auditLog');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const databaseUtils = require('../utils/databaseUtils');

class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET;
        this.jwtExpiry = process.env.JWT_EXPIRY || '24h';
        this.mfaSecret = process.env.MFA_SECRET;
        this.maxSessions = 5; // Maximum concurrent sessions per user
    }

    // ==================== MULTI-FACTOR AUTHENTICATION ====================
    
    async setupMFA(userId, method = 'totp') {
        try {
            const userResult = await userService.findUserById(userId);
            if (!userResult.success || !userResult.data) throw new Error('User not found');
            const user = userResult.data;

            // Generate TOTP secret
            const secret = speakeasy.generateSecret({
                name: `Clutch (${user.email})`,
                issuer: 'Clutch App'
            });

            // Generate backup codes
            const backupCodes = this.generateBackupCodes();

            // Create MFA setup
            const hashedBackupCodes = await Promise.all(backupCodes.map(async code => ({
                code: await bcrypt.hash(code, 10),
                used: false
            })));
            
            const mfaSetup = new MFASetup({
                userId,
                method,
                secret: secret.base32,
                backupCodes: hashedBackupCodes,
                enabled: false,
                createdAt: new Date()
            });

            await mfaSetup.save();

            // Generate QR code for TOTP
            const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

            return {
                secret: secret.base32,
                qrCodeUrl,
                backupCodes,
                setupComplete: false
            };
        } catch (error) {
            console.error('MFA setup error:', error);
            throw error;
        }
    }

    async verifyMFA(userId, code, method = 'totp') {
        try {
            const mfaSetup = await MFASetup.findOne({ userId, enabled: true });
            if (!mfaSetup) throw new Error('MFA not enabled');

            if (method === 'totp') {
                return speakeasy.totp.verify({
                    secret: mfaSetup.secret,
                    encoding: 'base32',
                    token: code,
                    window: 2 // Allow 2 time steps tolerance
                });
            } else if (method === 'backup') {
                // Verify backup code
                const hashedCode = await bcrypt.hash(code, 10);
                const backupCode = mfaSetup.backupCodes.find(bc => 
                    !bc.used && bc.code === hashedCode
                );
                
                if (backupCode) {
                    backupCode.used = true;
                    await mfaSetup.save();
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('MFA verification error:', error);
            throw error;
        }
    }

    async enableMFA(userId, verificationCode) {
        try {
            const isValid = await this.verifyMFA(userId, verificationCode);
            if (!isValid) throw new Error('Invalid verification code');

            const mfaSetup = await MFASetup.findOne({ userId });
            mfaSetup.enabled = true;
            mfaSetup.setupComplete = true;
            await mfaSetup.save();

            // Log audit event
            await this.logAuditEvent(userId, 'mfa_enabled', 'MFA enabled successfully');

            return { success: true, message: 'MFA enabled successfully' };
        } catch (error) {
            console.error('Enable MFA error:', error);
            throw error;
        }
    }

    async disableMFA(userId, verificationCode) {
        try {
            const isValid = await this.verifyMFA(userId, verificationCode);
            if (!isValid) throw new Error('Invalid verification code');

            const mfaSetup = await MFASetup.findOne({ userId });
            mfaSetup.enabled = false;
            await mfaSetup.save();

            // Log audit event
            await this.logAuditEvent(userId, 'mfa_disabled', 'MFA disabled successfully');

            return { success: true, message: 'MFA disabled successfully' };
        } catch (error) {
            console.error('Disable MFA error:', error);
            throw error;
        }
    }

    generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
        }
        return codes;
    }

    // ==================== ENHANCED ROLE-BASED ACCESS CONTROL ====================
    
    async createRole(roleData) {
        try {
            const {
                name,
                description,
                permissions,
                priority = 100,
                isActive = true,
                timeBasedAccess = null,
                conditionalPermissions = []
            } = roleData;

            // Check for duplicate role name
            const existingRole = await databaseUtils.findOne('roles', { name });
            if (existingRole) throw new Error('Role name already exists');

            const role = new Role({
                name,
                description,
                permissions,
                priority,
                isActive,
                timeBasedAccess,
                conditionalPermissions,
                createdAt: new Date()
            });

            await role.save();

            // Log audit event
            await this.logAuditEvent('system', 'role_created', `Role "${name}" created`);

            return role;
        } catch (error) {
            console.error('Create role error:', error);
            throw error;
        }
    }

    async assignRoleToUser(userId, roleId, assignedBy = 'system') {
        try {
            const userResult = await userService.findUserById(userId);
            if (!userResult.success || !userResult.data) throw new Error('User not found');
            const user = userResult.data;
            const role = await databaseUtils.findById('roles', roleId);

            if (!user || !role) throw new Error('User or role not found');

            // Check if user already has this role
            if (user.roles.includes(roleId)) {
                throw new Error('User already has this role');
            }

            user.roles.push(roleId);
            await user.save();

            // Log audit event
            await this.logAuditEvent(assignedBy, 'role_assigned', 
                `Role "${role.name}" assigned to user ${user.email}`);

            return { success: true, message: 'Role assigned successfully' };
        } catch (error) {
            console.error('Assign role error:', error);
            throw error;
        }
    }

    async removeRoleFromUser(userId, roleId, removedBy = 'system') {
        try {
            const userResult = await userService.findUserById(userId);
            if (!userResult.success || !userResult.data) throw new Error('User not found');
            const user = userResult.data;
            const role = await databaseUtils.findById('roles', roleId);

            if (!user || !role) throw new Error('User or role not found');

            user.roles = user.roles.filter(r => r.toString() !== roleId);
            await user.save();

            // Log audit event
            await this.logAuditEvent(removedBy, 'role_removed', 
                `Role "${role.name}" removed from user ${user.email}`);

            return { success: true, message: 'Role removed successfully' };
        } catch (error) {
            console.error('Remove role error:', error);
            throw error;
        }
    }

    async getUserPermissions(userId) {
        try {
            // First try to find the user in the users collection
            let userResult = await userService.findUserById(userId);
            
            if (!userResult.success || !userResult.data) {
                // If not found in users, try employees collection
                const { getCollection } = require('../config/database');
                const employeesCollection = await getCollection('employees');
                const employee = await employeesCollection.findOne({ _id: userId });
                
                if (!employee) {
                    throw new Error('User not found');
                }
                
                // Return employee permissions
                return employee.websitePermissions || employee.permissions || [];
            }
            
            const user = userResult.data;

            const permissions = new Set();

            for (const role of user.roles) {
                if (role.isActive) {
                    // Check time-based access
                    if (role.timeBasedAccess) {
                        const now = new Date();
                        const startTime = new Date(role.timeBasedAccess.startTime);
                        const endTime = new Date(role.timeBasedAccess.endTime);
                        
                        if (now >= startTime && now <= endTime) {
                            role.permissions.forEach(permission => permissions.add(permission));
                        }
                    } else {
                        role.permissions.forEach(permission => permissions.add(permission));
                    }
                }
            }

            return Array.from(permissions);
        } catch (error) {
            console.error('Get user permissions error:', error);
            throw error;
        }
    }

    async checkPermission(userId, requiredPermission) {
        try {
            const userPermissions = await this.getUserPermissions(userId);
            return userPermissions.includes(requiredPermission);
        } catch (error) {
            console.error('Check permission error:', error);
            return false;
        }
    }

    // ==================== SESSION MANAGEMENT ====================
    
    async createSession(userId, deviceInfo) {
        try {
            // Check concurrent session limit
            const activeSessions = await databaseUtils.countDocuments('sessions', { 
                userId, 
                status: 'active',
                expiresAt: { $gt: new Date() }
            });

            if (activeSessions >= this.maxSessions) {
                // Remove oldest session
                const oldestSession = await databaseUtils.findOne('sessions', { 
                    userId, 
                    status: 'active' 
                }).sort({ createdAt: 1 });
                
                if (oldestSession) {
                    oldestSession.status = 'expired';
                    await oldestSession.save();
                }
            }

            // Generate session token
            const sessionToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            const session = new Session({
                userId,
                sessionToken,
                deviceInfo: {
                    userAgent: deviceInfo.userAgent,
                    ipAddress: deviceInfo.ipAddress,
                    deviceType: deviceInfo.deviceType,
                    fingerprint: deviceInfo.fingerprint
                },
                status: 'active',
                expiresAt,
                lastActivity: new Date(),
                createdAt: new Date()
            });

            await session.save();

            return {
                sessionToken,
                expiresAt,
                sessionId: session._id
            };
        } catch (error) {
            console.error('Create session error:', error);
            throw error;
        }
    }

    async validateSession(sessionToken) {
        try {
            const session = await databaseUtils.findOne('sessions', { 
                sessionToken, 
                status: 'active',
                expiresAt: { $gt: new Date() }
            });

            if (!session) return null;

            // Update last activity
            session.lastActivity = new Date();
            await session.save();

            return session;
        } catch (error) {
            console.error('Validate session error:', error);
            return null;
        }
    }

    async refreshSession(sessionToken) {
        try {
            const session = await this.validateSession(sessionToken);
            if (!session) throw new Error('Invalid session');

            // Extend session expiry
            session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await session.save();

            return {
                sessionToken: session.sessionToken,
                expiresAt: session.expiresAt
            };
        } catch (error) {
            console.error('Refresh session error:', error);
            throw error;
        }
    }

    async logoutSession(sessionToken) {
        try {
            const session = await databaseUtils.findOne('sessions', { sessionToken });
            if (session) {
                session.status = 'logged_out';
                session.loggedOutAt = new Date();
                await session.save();
            }

            return { success: true, message: 'Logged out successfully' };
        } catch (error) {
            console.error('Logout session error:', error);
            throw error;
        }
    }

    async logoutAllSessions(userId) {
        try {
            await Session.updateMany(
                { userId, status: 'active' },
                { 
                    status: 'logged_out', 
                    loggedOutAt: new Date() 
                }
            );

            // Log audit event
            await this.logAuditEvent(userId, 'logout_all_sessions', 'All sessions logged out');

            return { success: true, message: 'All sessions logged out successfully' };
        } catch (error) {
            console.error('Logout all sessions error:', error);
            throw error;
        }
    }

    async getActiveSessions(userId) {
        try {
            const { getCollection } = require('../config/database');
            const sessionsCollection = await getCollection('sessions');
            
            const sessions = await sessionsCollection.find({
                userId,
                status: 'active',
                expiresAt: { $gt: new Date() }
            }).sort({ lastActivity: -1 }).toArray();

            return sessions.map(session => ({
                sessionId: session._id,
                deviceInfo: session.deviceInfo,
                lastActivity: session.lastActivity,
                expiresAt: session.expiresAt
            }));
        } catch (error) {
            console.error('Get active sessions error:', error);
            throw error;
        }
    }

    // ==================== JWT TOKEN MANAGEMENT ====================
    
    generateJWTToken(userId, permissions = []) {
        try {
            const payload = {
                userId,
                permissions,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
            };

            return jwt.sign(payload, this.jwtSecret);
        } catch (error) {
            console.error('Generate JWT error:', error);
            throw error;
        }
    }

    verifyJWTToken(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            console.error('Verify JWT error:', error);
            return null;
        }
    }

    // ==================== AUDIT LOGGING ====================
    
    async logAuditEvent(userId, action, details, metadata = {}) {
        try {
            const auditLog = new AuditLog({
                userId,
                action,
                details,
                metadata,
                timestamp: new Date(),
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent
            });

            await auditLog.save();
        } catch (error) {
            console.error('Log audit event error:', error);
            // Don't throw error for audit logging failures
        }
    }

    async getAuditLogs(filters = {}) {
        try {
            const query = {};
            
            if (filters.userId) query.userId = filters.userId;
            if (filters.action) query.action = filters.action;
            if (filters.startDate) query.timestamp = { $gte: new Date(filters.startDate) };
            if (filters.endDate) query.timestamp = { ...query.timestamp, $lte: new Date(filters.endDate) };

            const logs = await databaseUtils.find('auditlogs', query)
                .sort({ timestamp: -1 })
                .limit(filters.limit || 100);

            return logs;
        } catch (error) {
            console.error('Get audit logs error:', error);
            throw error;
        }
    }

    // ==================== SECURITY FEATURES ====================
    
    async detectSuspiciousActivity(userId, action, metadata) {
        try {
            // Check for multiple failed login attempts
            if (action === 'login_failed') {
                const recentFailures = await databaseUtils.countDocuments('auditlogs', {
                    userId,
                    action: 'login_failed',
                    timestamp: { $gte: new Date(Date.now() - 15 * 60 * 1000) } // Last 15 minutes
                });

                if (recentFailures >= 5) {
                    // Lock account temporarily
                    await this.lockAccount(userId, 'multiple_failed_logins');
                    return { suspicious: true, action: 'account_locked' };
                }
            }

            // Check for unusual login locations
            if (action === 'login_success' && metadata.ipAddress) {
                const recentLogins = await databaseUtils.find('auditlogs', {
                    userId,
                    action: 'login_success',
                    timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
                });

                const uniqueIPs = new Set(recentLogins.map(log => log.metadata.ipAddress));
                if (uniqueIPs.size > 3) {
                    return { suspicious: true, action: 'multiple_locations' };
                }
            }

            return { suspicious: false };
        } catch (error) {
            console.error('Detect suspicious activity error:', error);
            return { suspicious: false };
        }
    }

    async lockAccount(userId, reason) {
        try {
            const userResult = await userService.findUserById(userId);
            if (userResult.success && userResult.data) {
                const user = userResult.data;
                user.accountLocked = true;
                user.lockReason = reason;
                user.lockedAt = new Date();
                await userService.updateUserById(userId, user);

                // Log audit event
                await this.logAuditEvent(userId, 'account_locked', `Account locked: ${reason}`);
            }
        } catch (error) {
            console.error('Lock account error:', error);
            throw error;
        }
    }

    async unlockAccount(userId, unlockedBy) {
        try {
            const userResult = await userService.findUserById(userId);
            if (userResult.success && userResult.data) {
                const user = userResult.data;
                user.accountLocked = false;
                user.lockReason = null;
                user.lockedAt = null;
                await userService.updateUserById(userId, user);

                // Log audit event
                await this.logAuditEvent(unlockedBy, 'account_unlocked', `Account unlocked by ${unlockedBy}`);
            }
        } catch (error) {
            console.error('Unlock account error:', error);
            throw error;
        }
    }
}

module.exports = new AuthService();
